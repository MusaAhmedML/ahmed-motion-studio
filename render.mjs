// seek(t) renderer. Route A of the studio: one page paints any moment on demand,
// we walk time, pipe frames into ffmpeg. Nothing depends on a timer, so the render
// is identical every run and a change is a one-line edit plus a re-render.
//
//   node render.mjs --film 01-kinetic --fmt 9x16 --fps 60 --dur 38 --sub 1
//   node render.mjs --film 01-kinetic --stills 0,1.75,3.5,7.2   (critique loop, seconds)
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
// Resolve the browser at runtime so the same renderer runs on this machine, on
// Colab, and on the VAIO without a code change.
import { existsSync as _exists } from 'node:fs';
function chromePath() {
  const local = '/home/musaahmedml/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
  if (_exists(local)) return local;
  try { return chromium.executablePath(); } catch { return undefined; }
}
const CHROME = chromePath();

const arg = (k, d) => {
  const i = process.argv.indexOf('--' + k);
  if (i < 0) return d;
  const v = process.argv[i + 1];
  return v === undefined || v.startsWith('--') ? true : v;
};

const FILM = String(arg('film', '01-kinetic'));
const FMT = String(arg('fmt', '9x16'));
const FPS = Number(arg('fps', 60));
const DUR = Number(arg('dur', 38));
const SUB = Number(arg('sub', 1));
const OUT = String(arg('out', `out/${FILM}__${FMT}.mp4`));
const CRF = Number(arg('crf', 16));
const JQ = Number(arg('jq', 0.94));
const AUDIO = arg('audio', null);
const PORT = Number(arg('port', 8171));
const URL_ = String(arg('url', `http://127.0.0.1:${PORT}/index.html`));
const STILLS = arg('stills', null);

mkdirSync(resolve(ROOT, 'out'), { recursive: true });

const t0 = Date.now();
const browser = await chromium.launch({
  ...(CHROME ? { executablePath: CHROME } : {}),
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
    '--font-render-hinting=none', '--force-color-profile=srgb', '--hide-scrollbars',
    '--disable-extensions', '--disable-background-networking', '--disable-sync',
    '--disable-features=Translate,BackForwardCache,AcceptCHFrame',
    '--js-flags=--max-old-space-size=384', '--renderer-process-limit=1'],
});
const page = await browser.newPage({ viewport: { width: 400, height: 300 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('[pageerror]', e.message));
page.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) console.error('[console]', m.text()); });

await page.goto(URL_, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.__ready === true, { timeout: 30000 });
await page.evaluate(() => document.fonts.ready);
const info = await page.evaluate(([f, fmt, d]) => window.__init(f, fmt, d), [FILM, FMT, DUR]);

// Optional per-run content override (the daily reel uses this to swap its first
// two clips). Must land AFTER __init and BEFORE frame 0.
const DAILY = arg('daily', null);
if (DAILY && DAILY !== true) {
  const cfg = JSON.parse(String(DAILY));
  await page.evaluate((c) => { window.__daily = c; }, cfg);
  console.log('[render] daily lines:', JSON.stringify(cfg));
}
// Plates are registered by __init, so they can only be awaited AFTER it runs.
// Waiting earlier checks an empty registry and passes trivially.
try {
  await page.waitForFunction(() => window.__assetsReady(), { timeout: 30000 });
  const names = await page.evaluate(() => window.__plateNames || []);
  const loaded = await page.evaluate(() => window.__plateReport());
  if (names.length) console.log('[render] plates:', JSON.stringify(loaded));
  else console.log('[render] no plates declared (procedural film)');
} catch { console.log('[render] plate wait timed out (continuing)'); }
console.log(`[render] ${FILM} ${FMT} ${info.w}x${info.h} ${DUR}s @${FPS}fps x${SUB}sub`);

// ---- stills mode: the critique loop. Look at frames before paying for the render.
if (STILLS) {
  const times = String(STILLS).split(',').map(Number);
  mkdirSync(resolve(ROOT, 'out/stills'), { recursive: true });
  for (const t of times) {
    const b64 = await page.evaluate((tt) => window.__grabPNG(tt), t);
    const f = `out/stills/${FILM}__${FMT}__t${String(t).replace('.', '_')}.png`;
    writeFileSync(resolve(ROOT, f), Buffer.from(b64, 'base64'));
    console.log('[still]', f);
  }
  await browser.close();
  process.exit(0);
}

// ---- video mode
const args = [
  '-y', '-f', 'image2pipe', '-vcodec', 'mjpeg', '-framerate', String(FPS * SUB), '-i', '-',
];
if (SUB > 1) args.push('-vf', `tmix=frames=${SUB}:weights='${Array(SUB).fill(1).join(' ')}',select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/${FPS}/TB`);
args.push('-r', String(FPS),
  '-c:v', 'libx264', '-preset', 'medium', '-crf', String(CRF),
  '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.1',
  '-g', String(FPS * 2), '-movflags', '+faststart');
args.push(resolve(ROOT, OUT));

const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });
let ffDead = false;
const die = (why) => {
  console.error('[render] ffmpeg died: ' + why);
  try { browser.close(); } catch {}
  process.exit(1);
};
ff.on('error', e => die(e.message));
ff.on('close', (code) => { if (code !== 0) ffDead = true; });
// if ffmpeg exits mid-loop the 'drain' event never fires, so bail out explicitly
ff.stdin.on('error', e => die(e.code || e.message));

const TOTAL = Math.round(DUR * FPS * SUB);
for (let i = 0; i < TOTAL; i++) {
  const t = i / (FPS * SUB);
  const b64 = await page.evaluate((tt) => window.__grabJPEG(tt), t);
  const buf = Buffer.from(b64, 'base64');
  if (ffDead) die('exited early');
  if (!ff.stdin.write(buf)) {
    await Promise.race([
      new Promise(r => ff.stdin.once('drain', r)),
      new Promise(r => ff.stdin.once('close', r)),
      new Promise(r => ff.stdin.once('error', r)),
    ]);
    if (ffDead || ff.stdin.destroyed) die('pipe closed');
  }
  if (i % (FPS * SUB * 10) === 0) {
    const el = (Date.now() - t0) / 1000;
    process.stdout.write(`\r[render] ${((i / TOTAL) * 100).toFixed(0)}%  ${t.toFixed(1)}/${DUR}s  ${el.toFixed(0)}s  ${(i / Math.max(el, .01)).toFixed(1)} fps   `);
  }
}
ff.stdin.end();
await new Promise(r => ff.on('close', r));
await browser.close();

// ---- pass two: mux the audio, loudness-normalised to the platform target
if (AUDIO && AUDIO !== true) {
  await new Promise((res, rej) => {
    const m = spawn('ffmpeg', ['-y', '-v', 'error', '-i', OUT, '-i', String(resolve(ROOT, String(AUDIO))),
      // loudnorm single-pass overshoots true peak; the limiter makes the -1.5 dBTP
      // target a guarantee rather than an intention.
      '-filter:a', 'loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.891:attack=0.5:release=100:level=false', '-c:v', 'copy',
      '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', OUT + '.tmp.mp4'],
      { stdio: ['ignore', 'inherit', 'inherit'] });
    m.on('close', (c) => (c === 0 ? res() : rej(new Error('mux failed ' + c))));
    m.on('error', rej);
  });
  const { renameSync } = await import('node:fs');
  renameSync(resolve(ROOT, OUT + '.tmp.mp4'), resolve(ROOT, OUT));
}
const el = (Date.now() - t0) / 1000;
process.stdout.write(`\n[render] done ${OUT}  ${el.toFixed(1)}s  ${(TOTAL / el).toFixed(1)} frames/s\n`);
