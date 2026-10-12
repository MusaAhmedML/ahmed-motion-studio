// Closed-form motion primitives. Every function here is a PURE function of time:
// given t it returns the same value forever, with no carried state between frames.
// That is what lets us render frame 812 without simulating frames 0..811, and what
// makes two runs of the same film byte-identical.

export const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const lerp = (a, b, t) => a + (b - a) * t;
export const inv = (t, a, b) => clamp((t - a) / (b - a));
export const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
export const smoother = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
export const TAU = Math.PI * 2;

// Deterministic PRNG (mulberry32). Math.random() is BANNED: it would make renders
// irreproducible and break the determinism contract.
export function rng(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5 | 0);
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Value noise, seeded and closed-form-ish: we sample a fixed lattice and smooth it.
// Deterministic for a given (seed, x).
export function makeNoise(seed) {
  const r = rng(seed);
  const N = 512, tbl = new Float32Array(N);
  for (let i = 0; i < N; i++) tbl[i] = r();
  return (x) => {
    const i = Math.floor(x), f = x - i;
    const a = tbl[((i % N) + N) % N], b = tbl[(((i + 1) % N) + N) % N];
    return lerp(a, b, smooth(f));
  };
}

// Damped harmonic oscillator solved analytically. Overshoot is the whole point:
// linear A->B easing is what makes AI motion look cheap.
export function spring(t, k = 170, d = 26) {
  if (t <= 0) return 0;
  const w0 = Math.sqrt(k);
  const z = d / (2 * w0);
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
}

// A value whose TARGET changes several times. Never restart the spring: add one
// spring per change, each starting at its own time. Motion stays continuous.
export function track(t, keys, k = 170, d = 26) {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], k, d);
  }
  return v;
}

// Spring that overshoots a 0->1 ramp and settles. `hold` delays the start.
export function pop(t, { delay = 0, k = 300, d = 24, amp = 1 } = {}) {
  return clamp(spring(t - delay, k, d) * amp);
}

// Leading/trailing edge springs with different stiffness => the indicator stretches
// between stops instead of teleporting.
export function indicator(t, stops, w = 120) {
  const lead = track(t, stops, 320, 30);
  const trail = track(t, stops, 140, 22);
  return { left: Math.min(lead, trail), right: Math.max(lead, trail) + w };
}

// Text inside a morphing container: in AFTER the morph starts, out BEFORE the next.
export function swapAlpha(t, tIn, tOut) {
  return Math.min(inv(t, tIn + 0.08, tIn + 0.22), inv(tOut, tOut - 0.12, tOut - 0.02));
}

// Entrance/exit envelope for a shot: 0 at both ends, 1 inside.
export function env(t, tIn, tOut, fade = 0.18) {
  return Math.min(inv(t, tIn, tIn + fade), inv(tOut, tOut - fade, tOut));
}

// Seamless loop time.
export const loopT = (t, dur) => ((t % dur) + dur) % dur;

// Fixed-length window inside a longer timeline (used by shot helper below).
export function shotAt(t, from, to) {
  return t >= from && t < to ? t - from : null;
}

// --- Musical timing ---------------------------------------------------------
// Beats are the spine of every edit in this studio. A cut that lands 40ms off the
// grid is invisible to a viewer consciously and very visible subconsciously.
export const bar = (bpm, beatsPerBar = 4) => (60 / bpm) * beatsPerBar;
export const beatTime = (bpm, i) => (60 / bpm) * i;

// Quantise a time to the nearest grid position, for SFX placement.
export function snap(t, bpm, division = 1) {
  const q = (60 / bpm) / division;
  return Math.round(t / q) * q;
}
