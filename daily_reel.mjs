#!/usr/bin/env node
// DAILY BRANDREEL
//
// Renders today's Ahmed Academy brandreel with a fresh first-two-clips pair,
// then drops it where the hub and every platform expect to find it.
//
//   node daily_reel.mjs                # today
//   node daily_reel.mjs 2026-10-05     # a specific date (backfills, re-runs)
//
// Outputs:
//   1. the MP4            -> Daily Marketing/<date>/daily_reel_latest.mp4
//   2. the MP4            -> Motion Studio/Reels <date>/daily-reel__<date>.mp4
//   3. caption_<date>.txt -> same folder (per-platform copy + hashtags)
//   4. manifest.json      -> same folder (what to upload, where, specs)
//
// The reel is a pure function of the date: same day always renders the same file.

import { spawnSync, spawn } from 'node:child_process';
import { mkdirSync, existsSync, copyFileSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const sh = (c) => { const r = spawnSync('c', { shell: true, cwd: ROOT, encoding: 'utf8' }); return r; };

const { linesForDate, LINES } = await import(resolve(ROOT, 'lib/daily-lines.js'));

const DATE = process.argv[2] || new Date().toISOString().slice(0, 10);
// The daily reel is 16-guess (FRAMES below = 543 @ 30fps = 18.1s; note the film's own
// comment still says 513, which is stale). No --dur is passed: the
// film's own FRAMES export decides the length, and the manifest reads that same export,
// so the recorded duration can never disagree with the rendered file.
const FPS = 30, FMT = '9x16';
const DAILY_FILM = '16-guess';
// The film's own FRAMES export is the single source of truth for length, so the
// manifest can never drift from what was actually rendered.
const { FRAMES } = await import(resolve(ROOT, `films/${DAILY_FILM}.js`));
const TODAY = new Date().toISOString().slice(0, 10);

// Destinations
const DAILY_DIR = `/home/musaahmedml/CHROMEOS_BACKUP/MacroStudyHub/Daily Marketing/${DATE}`;
const REELS_DIR = '/home/musaahmedml/GoogleDrive/01_Ahmed Academy/03_Content & Media/Motion Studio/Reels 2026-09-30';
const OUT_LOCAL = `out/daily-reel__${DATE}.mp4`;
const AUDIO = 'audio/brag_mix.wav';

console.log(`[daily] ${DATE}  line ${linesForDate(DATE).index + 1}/${LINES.length}`);
console.log(`[daily]   setup: "${linesForDate(DATE).setup}"`);
console.log(`[daily]   answer: "${linesForDate(DATE).a} ${linesForDate(DATE).b}"`);

// Force GPU-less software rendering and keep memory low; this runs unattended at 02:00.
mkdirSync(resolve(ROOT, 'out'), { recursive: true });
mkdirSync(DAILY_DIR, { recursive: true });
try { mkdirSync(REELS_DIR, { recursive: true }); } catch {}

// static server for ES modules
let server = null;
try {
  const probe = spawnSync('bash', ['-lc', 'curl -sf --max-time 2 http://127.0.0.1:8171/index.html -o /dev/null']);
  if (probe.status !== 0) {
    server = spawn('node', ['serve.mjs', '8171'], { cwd: ROOT, detached: true, stdio: 'ignore' });
    server.unref();
    await new Promise((r) => setTimeout(r, 1800));
  }
} catch {}

// ---- render ------------------------------------------------------------------
const daily = JSON.stringify({
  setup: linesForDate(DATE).setup,
  a: linesForDate(DATE).a,
  b: linesForDate(DATE).b,
});

const t0 = Date.now();
// 16-guess, not 15-brag. This used to render 15-brag, whose beat order is
// Hook -> Brand -> Method -> Offer -> Cta, so the reel OPENED on the logo and
// "MUSA AHMED" and only reached the hook at ~7s — the exact thing the reel standard
// (ahmed-motion-studio/README.md 7) rules out. The manifest already claimed 16-guess,
// so the code and the manifest disagreed; this was the bug.
//
// Required beat order for every daily reel, going forward:
//   1. hook   2. answer   3. brand/logo + name   4. outro / CTA
// 16-guess already does this (diagnosis 0.0-5.0s, who 4.7-9.1s, book 8.9-18.1s) and it
// consumes window.__daily, so the rotating setup/answer lines still change every day.
const r = spawnSync('node', [
  'render.mjs', '--film', DAILY_FILM, '--fmt', FMT,
  '--fps', String(FPS), '--sub', '1', '--crf', '16',
  '--out', OUT_LOCAL, '--audio', AUDIO, '--daily', daily,
], { cwd: ROOT, encoding: 'utf8' });

const log = (r.stdout || '') + (r.stderr || '');
const done = log.includes('] done');
if (!done) {
  console.error('[daily] RENDER FAILED\n' + log.split('\n').filter(l => !/libx264|^\s*i\d|frame=|profile|kb\/s|encoder|Stream|Metadata|Side data|out#0|Press|deprecated/i.test(l)).slice(-25).join('\n'));
  process.exit(1);
}
console.log(`[daily] rendered in ${((Date.now() - t0) / 1000).toFixed(0)}s`);

// ---- publish -----------------------------------------------------------------
const dst = join(DAILY_DIR, 'daily_reel_latest.mp4');
copyFileSync(resolve(ROOT, OUT_LOCAL), dst);
console.log(`[daily] hub drop : ${dst}`);

const archived = join(REELS_DIR, `daily-reel__${DATE}.mp4`);
try { copyFileSync(resolve(ROOT, OUT_LOCAL), archived); console.log(`[daily] archive  : ${archived}`); } catch (e) { console.warn('[daily] archive skipped:', e.message); }

// ---- platform copy -----------------------------------------------------------
const L = linesForDate(DATE);
const caption = [
  `${L.setup.replace(/\.$/, '')}`,
  `${L.a} ${L.b.replace(/\.$/, '')}.`,
  '',
  `Musa Ahmed — A*A*AAA at A-Level.`,
  `Manchester · Edinburgh · Glasgow · Liverpool offers.`,
  '',
  `GCSE: Maths · English · Science · Computer Science`,
  `A-Level: Maths · Physics · Computer Science`,
  '',
  `Free 20-minute diagnostic. You leave with a written plan.`,
  `Tuition only if you want it.`,
  '',
  `Book: musaahmed.uk/academy`,
  '',
  `#ALevel #GCSE #MathsTutor #Physics #ExamSeason #RevisionThatWorks #StudyTips #AStarMaths #AhmedAcademy`,
].join('\n');

const captionTxt = join(DAILY_DIR, `caption_${DATE}.txt`);
writeFileSync(captionTxt, caption);

const manifest = {
  date: DATE,
  generated_at: new Date().toISOString(),
  reel: 'daily-reel',
  film: DAILY_FILM,
  engine: 'ahmed-motion-studio (seek(t) canvas, deterministic)',
  lines: { index: L.index, total: LINES.length, setup: L.setup, answer: `${L.a} ${L.b}` },
  file: 'daily_reel_latest.mp4',
  specs: { width: 1080, height: 1920, fps: FPS, duration_s: Number((FRAMES / FPS).toFixed(2)), aspect: '9:16', codec: 'h264', audio: 'aac 48k stereo', loudness: '-14 LUFS' },
  ready_for: [
    { platform: 'TikTok', spec: '9:16 1080x1920', max_s: 600, note: 'upload as post; caption fits' },
    { platform: 'Instagram Reels', spec: '9:16 1080x1920', max_s: 900, note: 'caption in caption_<date>.txt' },
    { platform: 'LinkedIn Business Page', spec: '9:16 accepted, 1:1 preferred', note: 'same file; trim nothing' },
    { platform: 'Facebook Reels', spec: '9:16 1080x1920', max_s: 900, note: 'caption in caption_<date>.txt' },
  ],
  caption_file: `caption_${DATE}.txt`,
};
writeFileSync(join(DAILY_DIR, `manifest_${DATE}.json`), JSON.stringify(manifest, null, 2));
console.log(`[daily] caption  : ${captionTxt}`);
console.log(`[daily] manifest : ${DAILY_DIR}/manifest_${DATE}.json`);
console.log(`[daily] DONE`);