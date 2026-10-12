// SFX synthesised in code. SFX-first: hits land on the measured beat grid, no music
// bed (halal track was quarantined 2026-09-20; nothing unlicensed ships).
//   node sfx.mjs <film.js> <out.wav> [startDur]
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';

const filmPath = process.argv[2];
const outPath = process.argv[3] || 'out/sfx.wav';
const dur = Number(process.argv[4] || 38);
if (!filmPath) { console.error('usage: node sfx.mjs <film.js> <out.wav> [dur]'); process.exit(1); }

const mod = await import(pathToFileURL(resolve(filmPath)).href);
const cues = mod.sfx || [];

const SR = 48000, N = Math.ceil(dur * SR);
const L = new Float32Array(N), R = new Float32Array(N);
let seed = 20260929;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2147483648 - 1; };

function envAD(t, len, a = 0.004, d = null) {
  const at = a, dt = d ?? len * 0.5;
  if (t < at) return t / at;
  if (t < at + dt) return 1 - (t - at) / dt * (1 - 0.001);
  return 0;
}

// --- voices -----------------------------------------------------------------
// Each returns a sample at local time t (seconds).
const VOICES = {
  click: (t) => {
    if (t > 0.05) return 0;
    return (Math.sin(2 * Math.PI * 2400 * t) * 0.6 + rnd() * 0.25) * Math.exp(-t * 160) * 0.34;
  },
  tick: (t) => {
    if (t > 0.06) return 0;
    return (Math.sin(2 * Math.PI * 3200 * t) * 0.5 + rnd() * 0.4) * Math.exp(-t * 190) * 0.22;
  },
  pop: (t) => {
    if (t > 0.18) return 0;
    const f = 520 + 1250 * Math.min(1, t / 0.06);
    return Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 26) * 0.42;
  },
  thump: (t) => {
    if (t > 0.55) return 0;
    const f = 105 - 62 * Math.min(1, t / 0.4);
    return Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 8.5) * 0.72;
  },
  hit: (t) => {
    if (t > 0.7) return 0;
    const body = Math.sin(2 * Math.PI * 78 * t) * Math.exp(-t * 7) * 0.6;
    const snap = (Math.sin(2 * Math.PI * 1800 * t) * 0.4 + rnd() * 0.5) * Math.exp(-t * 60) * 0.4;
    const air = rnd() * Math.exp(-t * 22) * 0.12;
    return body + snap + air;
  },
  whoosh: (t) => {
    if (t > 0.42) return 0;
    // Band-passed noise sweep: brighten then fall away.
    const p = t / 0.42;
    const n = rnd() * 2 - 1;
    const shaped = Math.sin(Math.PI * p);
    return n * shaped * shaped * 0.26;
  },
  riser: (t) => {
    if (t > 0.62) return 0;
    const p = t / 0.62;
    const n = rnd() * 2 - 1;
    const f = 300 + 3400 * p * p;
    return n * p * p * 0.19;
  },
  swell: (t) => {
    if (t > 1.5) return 0;
    const p = t / 1.5;
    // Warm sustained pad, filtered noise + soft sine stack. No melody, no vocals.
    const s = Math.sin(2 * Math.PI * 220 * t) * 0.5 + Math.sin(2 * Math.PI * 330 * t) * 0.28
            + Math.sin(2 * Math.PI * 440 * t) * 0.14;
    const n = rnd() * 0.5;
    const shape = Math.sin(Math.PI * p) * p;
    return (s * 0.5 + n * 0.5) * shape * 0.26;
  },
};

for (const c of cues) {
  const fn = VOICES[c.type] || VOICES.click;
  const start = Math.floor(c.t * SR);
  const maxT = 1.6;
  for (let i = 0; i < maxT * SR && start + i < N; i++) {
    const lt = i / SR;
    const v = fn(lt);
    // Do NOT break on a zero sample. Every voice whose envelope starts at zero
    // (whoosh, pop, riser, swell — sin(0) === 0) was being killed on its first
    // sample, so those cues rendered silent. Each voice already returns 0 past
    // its own length, so summing the rest of the window is free.
    if (v === 0) continue;
    L[start + i] += v * (c.gain ?? 1);
    R[start + i] += v * (c.gain ?? 1) * 0.97;   // tiny width, mono-safe
  }
}

// --- master -----------------------------------------------------------
// Two-stage gain: peak-safe first, then push RMS to a -14 LUFS target so the bed
// sits correctly under platform normalisation instead of arriving 16dB down.
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const peakNorm = peak > 0 ? 0.86 / peak : 1;
for (let i = 0; i < N; i++) { L[i] *= peakNorm; R[i] *= peakNorm; }
let sum0 = 0;
for (let i = 0; i < N; i++) sum0 += L[i] * L[i] + R[i] * R[i];
const rms0 = Math.sqrt(sum0 / (N * 2)) || 1e-9;
const target = Math.pow(10, -14 / 20) * 0.691;   // -14 LUFS in linear RMS
const loudGain = Math.min(6.0, target / rms0);
for (let i = 0; i < N; i++) { L[i] *= loudGain; R[i] *= loudGain; }
// re-clamp peaks after the loudness push
let pk2 = 0;
for (let i = 0; i < N; i++) pk2 = Math.max(pk2, Math.abs(L[i]), Math.abs(R[i]));
const post = pk2 > 0.97 ? 0.97 / pk2 : 1;
const norm = post;
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
let o = 44, sum = 0;
for (let i = 0; i < N; i++) {
  const l = Math.tanh(L[i] * norm * 1.25) * 0.94;
  const r = Math.tanh(R[i] * norm * 1.25) * 0.94;
  sum += l * l + r * r;
  buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(l * 32767))), o); o += 2;
  buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(r * 32767))), o); o += 2;
}
mkdirSync(resolve(outPath, '..'), { recursive: true });
writeFileSync(outPath, buf);
const rms = Math.sqrt(sum / (N * 2));
const lufs = 20 * Math.log10(rms || 1e-9) - 0.691;
console.log(`[sfx] ${cues.length} cues -> ${outPath}  peak=${peak.toFixed(3)}  ~${lufs.toFixed(1)} LUFS`);
