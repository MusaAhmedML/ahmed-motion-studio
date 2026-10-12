// Reproduce the brand reel's audio mix EXACTLY as the Remotion version had it.
// Same track, same gains, same frame offsets:
//   track   vol 0.85 at frame 0
//   impact  vol 0.70 at frame 6
//   riser   vol 0.32 at frame 100
//   click   vol 0.16 at frames [24,40,96,108,140,230,290,330,380,440]
//   resolve vol 0.34 at frame 432
//   resolve2 vol 0.26 at frame 432
import { spawnSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const FPS = 30;
const OUT = resolve(ROOT, 'audio/brag_mix.wav');
mkdirSync(dirname(OUT), { recursive: true });

const A = (n) => resolve(ROOT, 'assets/brag', n);
const S = (n) => resolve(ROOT, 'assets/brag/sfx', n);

const CLIP = (file, atFrame, vol) => {
  const t = (atFrame / FPS).toFixed(4);
  const delay = (1000 * atFrame / FPS).toFixed(1);
  return `[${delay}]adelay=${delay}|${delay}[a${atFrame}]` +
         `;[${atFrame}]volume=${vol}[v${atFrame}];[v${atFrame}]aresample=48000[a${atFrame}v]`;
};

const parts = [];
const labels = [];
const add = (file, atFrame, vol, tag) => {
  if (!existsSync(file)) { console.warn('[brag] missing', file); return; }
  parts.push(`[${FPS === 30 ? Math.round(atFrame / FPS * 48000) : 0}]`); // placeholder, replaced below
  labels.push(tag);
};

// Build the filtergraph explicitly — one amix stage, exact per-clip gain.
const inputs = ['-i', A('brag_music_20s.mp3')];
const chains = [];
const CLIPS = [
  ['impact.wav', 6, 0.70, 'impact'],
  ['riser.wav', 100, 0.32, 'riser'],
  ['resolve.wav', 432, 0.34, 'resolve'],
  ['resolve2.wav', 432, 0.26, 'resolve2'],
];
const CLICKS = [24, 40, 96, 108, 140, 230, 290, 330, 380, 440];

let idx = 1;
const mixLabels = ['[0:a]volume=0.85,aresample=48000[a0]'];
CLIPS.forEach(([f, at, vol, tag]) => {
  if (!existsSync(S(f))) { console.warn('[brag] missing sfx', f); return; }
  inputs.push('-i', S(f));
  const d = (1000 * at / FPS).toFixed(1);
  mixLabels.push(`[${idx}:a]aresample=48000,volume=${vol},adelay=${d}|${d}[a${idx}]`);
  idx++;
});
CLICKS.forEach((at, n) => {
  inputs.push('-i', S('click.wav'));
  const d = (1000 * at / FPS).toFixed(1);
  mixLabels.push(`[${idx}:a]aresample=48000,volume=0.16,adelay=${d}|${d}[a${idx}]`);
  idx++;
});

const n = mixLabels.length;
const fc = `${mixLabels.join(';')};${mixLabels.map((_, i) => `[a${i}]`).join('')}` +
           `amix=inputs=${n}:duration=first:dropout_transition=0:normalize=0[mixed];` +
           `[mixed]loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.891:level=disabled[out]`;

const r = spawnSync('ffmpeg', ['-y', '-v', 'error', ...inputs, '-filter_complex', fc, '-map', '[out]',
  '-ar', '48000', '-ac', '2', '-t', '20.04', OUT], { encoding: 'utf8' });

if (r.status !== 0) { console.error('[brag] ffmpeg failed:', r.stderr); process.exit(1); }
console.log(`[brag] mix built -> ${OUT}`);