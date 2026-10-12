// FILM 03 — "DEPTH" · 2.5D parallax multi-plane
// No 3D engine, no GPU: real depth is faked with layers that move at different
// rates under a camera push, plus per-layer defocus and atmospheric haze.
// This is the route that gets "2.5D compositing" without a raytracer.
import {
  brandMonogram,
  C,
  F,
  bg,
  vignette,
  grain,
  text,
  block,
  setType,
  rule,
  hairline,
  monogram,
  ctaPill,
  footRail,
  fitText,
  ghostNumeral,
} from '../lib/brand.js';
import { clamp, lerp, inv, smooth, spring, env, rng, makeNoise, TAU } from '../lib/motion.js';

const DUR = 30;

// Five planes. depth = parallax rate (1 = foreground, 0.06 = far haze).
const PLANES = [
  { depth: 0.06, blur: 0.0,  a: 0.55 },
  { depth: 0.16, blur: 0.6,  a: 0.70 },
  { depth: 0.38, blur: 1.4,  a: 0.85 },
  { depth: 0.72, blur: 2.6,  a: 1.00 },
  { depth: 1.00, blur: 0.0,  a: 1.00 },
];

const noise = makeNoise(4211);

// Camera: a slow push-in with a lateral drift, plus a beat-synced punch on the
// big moments. Push is what sells depth more than layer separation.
function camera(t, t0, end) {
  const p = clamp((t - t0) / (end - t0));
  const e = smooth(p);
  const push = lerp(1.0, 1.52, e);
  const driftX = lerp(-0.085, 0.085, e) + Math.sin(t * 0.42) * 0.018;
  const driftY = lerp(0.02, -0.03, e) + Math.cos(t * 0.33) * 0.010;
  return { push, driftX, driftY, e, p };
}

function applyCam(g, L, cam, depth) {
  const k = lerp(0.04, 1.0, depth);
  g.translate(L.cx + cam.driftX * L.w * k, L.cy + cam.driftY * L.h * k);
  g.scale(cam.push * (0.42 + 0.58 * k), cam.push * (0.42 + 0.58 * k));
  g.translate(-L.cx, -L.cy);
}

// Far plane: a slow-drifting constellation of dots, like a starfield of topics.
function planeFar(g, L, t) {
  const r = rng(97);
  g.save();
  for (let i = 0; i < 90; i++) {
    const x = r() * L.w * 1.4 - L.w * 0.2;
    const y = r() * L.h * 1.4 - L.h * 0.2;
    const tw = noise(i * 0.7 + t * 0.55);
    const rad = L.tMicro * (0.05 + tw * 0.10);
    g.globalAlpha = PLANES[0].a * (0.10 + tw * 0.28);
    g.fillStyle = i % 9 === 0 ? C.crimson : C.bone;
    g.beginPath(); g.arc(x, y, rad, 0, TAU); g.fill();
  }
  g.restore();
}

// Mid-far: an isometric grid floor, receding. Gives the frame a ground plane.
function planeGrid(g, L, t, horizon) {
  g.save();
  g.globalAlpha = PLANES[1].a * 0.85;
  g.strokeStyle = C.line;
  g.lineWidth = 1.4;
  const drift = (t * 0.05) % 1;
  for (let i = 0; i <= 22; i++) {
    const u = i / 22;
    const y = horizon + Math.pow(u + drift * 0.045, 2.1) * (L.h * 0.95);
    if (y > L.h * 1.1) break;
    g.globalAlpha = PLANES[1].a * 0.75 * (1 - u * 0.62);
    g.beginPath(); g.moveTo(0, y); g.lineTo(L.w, y); g.stroke();
  }
  for (let i = -14; i <= 14; i++) {
    g.globalAlpha = PLANES[1].a * 0.30;
    g.beginPath();
    g.moveTo(L.cx + i * L.w * 0.035, horizon);
    g.lineTo(L.cx + i * L.w * 0.30, L.h * 1.05);
    g.stroke();
  }
  g.restore();
}

// Near-mid: floating cards, the "syllabus" planes, drifting on their own springs.
const CARDS = [
  { x: 0.16, y: 0.30, w: 0.30, h: 0.115, t: 'GCSE Maths',   v: '62%', at: 0.30 },
  { x: 0.60, y: 0.24, w: 0.26, h: 0.100, t: 'A-Level Physics', v: 'OCR A', at: 0.62 },
  { x: 0.22, y: 0.60, w: 0.28, h: 0.108, t: 'GCSE English', v: '71%', at: 0.94 },
  { x: 0.62, y: 0.64, w: 0.30, h: 0.115, t: 'Computer Sci', v: 'AQA', at: 1.26 },
];

function planeCards(g, L, t, horizon) {
  CARDS.forEach((c, i) => {
    const p = clamp(spring(t - c.at, 130, 21));
    if (p <= 0.004) return;
    const bob = Math.sin(t * 0.62 + i * 1.7) * L.tHero * 0.016;
    const w = L.w * c.w * p, h = L.h * c.h * p;
    const x = L.w * c.x - w / 2, y = L.h * c.y - h / 2 + bob * p;
    g.save();
    g.globalAlpha = PLANES[2].a * clamp(p * 1.8);
    g.filter = 'blur(0.4px)';
    g.fillStyle = 'rgba(18,19,26,0.90)';
    g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = L.tHero * 0.09; g.shadowOffsetY = L.tHero * 0.014;
    g.beginPath(); g.roundRect(x, y, w, h, h * 0.14); g.fill();
    g.shadowColor = 'transparent';
    g.strokeStyle = C.line; g.lineWidth = 1.6; g.stroke();
    g.restore();
    g.save();
    g.globalAlpha = PLANES[2].a * clamp(p * 1.8);
    g.filter = 'blur(0.4px)';
    // title on its own line, value beneath: no chance of collision at any card width
    text(g, c.t, x + w * 0.10, y + h * 0.40, {
      font: fitText(g, c.t, F.mono(600, L.tSmall * 0.74), 0.02, w * 0.80).font,
      fill: C.bone, align: 'left', track: 0.02,
    });
    text(g, c.v, x + w * 0.10, y + h * 0.72, {
      font: F.mono(700, L.tSmall * 0.70), fill: C.crimson, align: 'left', track: 0.02,
    });
    g.fillStyle = 'rgba(255,255,255,0.09)';
    g.fillRect(x + w * 0.10, y + h * 0.84, w * 0.80 * (0.4 + 0.5 * ((i * 37) % 10) / 10), Math.max(2, h * 0.030));
    g.restore();
  });
}

// Foreground: a large soft crimson arc + the message. Always sharpest, biggest.
function planeFore(g, L, t, dt) {
  const p = clamp(spring(dt, 120, 24));
  if (p <= 0.004) return;
  // Foreground depth cue: a soft crimson horizon glow, not a hard arc.
  g.save();
  g.globalAlpha = 0.22 * p;
  const hg = g.createLinearGradient(0, L.h * 0.40, 0, L.h * 0.62);
  hg.addColorStop(0, 'rgba(220,38,38,0)');
  hg.addColorStop(0.5, 'rgba(220,38,38,0.30)');
  hg.addColorStop(1, 'rgba(220,38,38,0)');
  g.fillStyle = hg;
  g.fillRect(0, L.h * 0.40, L.w, L.h * 0.22);
  g.restore();
}

// Haze between planes: the trick that stops parallax looking like flat cards.
// Fades in AND out so the band never shows a hard edge.
function haze(g, L, y0, y1, rgb, a) {
  const top = Math.min(y0, y1), bot = Math.max(y0, y1);
  const gr = g.createLinearGradient(0, top, 0, bot);
  gr.addColorStop(0.00, `rgba(${rgb},0)`);
  gr.addColorStop(0.42, `rgba(${rgb},${a})`);
  gr.addColorStop(0.72, `rgba(${rgb},${a})`);
  gr.addColorStop(1.00, `rgba(${rgb},0)`);
  g.fillStyle = gr;
  g.fillRect(0, top, L.w, bot - top);
}

const SC = [
  // 0-8s: reveal the stack. Camera pulls back from inside the stack.
  { frm: 0, to: 8, t0: 0, t1: 8, draw(g, L, t, dt) {
      const cam = camera(t, 0, 8);
      const horizon = L.h * 0.52;
      const inA = 1 - env(t, 0, 8, 1.4) * 0.92;
      g.save(); g.globalAlpha = inA;
      applyCam(g, L, cam, PLANES[0].depth); planeFar(g, L, t);
      g.restore();
      haze(g, L, horizon - L.h * 0.34, horizon + L.h * 0.30, '26,28,38', 0.90);
      g.save(); g.globalAlpha = 0.9;
      applyCam(g, L, cam, PLANES[1].depth); planeGrid(g, L, t, horizon);
      g.restore();
      haze(g, L, horizon - L.h * 0.16, L.h * 1.02, '10,10,12', 0.86);
      g.save();
      applyCam(g, L, cam, PLANES[2].depth); planeCards(g, L, t, horizon);
      g.restore();
      planeFore(g, L, t, dt);
      text(g, 'EVERY STUDENT IS A STACK', L.cx, L.h * 0.135, {
        font: F.mono(700, L.tSmall * 0.86), fill: C.boneDim, track: 0.22,
        alpha: clamp(spring(dt - 0.5, 170, 26)),
      });
      vignette(g, L, 0.58);
    }},
  // 8-19s: the message sits in the foreground while the stack drifts behind it.
  { frm: 8, to: 19, t0: 8, t1: 19, draw(g, L, t, dt) {
      const cam = camera(t, 8, 19);
      const horizon = L.h * 0.52;
      g.save(); g.globalAlpha = 0.8;
      applyCam(g, L, cam, PLANES[0].depth); planeFar(g, L, t);
      g.restore();
      haze(g, L, horizon - L.h * 0.36, horizon + L.h * 0.28, '26,28,38', 0.92);
      g.save(); g.globalAlpha = 0.75;
      applyCam(g, L, cam, PLANES[1].depth); planeGrid(g, L, t, horizon);
      g.restore();
      haze(g, L, horizon - L.h * 0.16, L.h * 1.02, '10,10,12', 0.88);
      g.save();
      applyCam(g, L, cam, PLANES[2].depth); planeCards(g, L, t, horizon);
      g.restore();
      planeFore(g, L, t, dt);
      // Foreground message: sharp, largest, un-defocused.
      const a = env(t, 8, 19, 0.5);
      g.save(); g.globalAlpha = a;
      g.fillStyle = 'rgba(10,10,12,0.86)';
      g.fillRect(L.mx * 0.55, L.h * 0.30, L.w - L.mx * 1.1, L.h * 0.40);
      g.fillStyle = C.crimson;
      g.fillRect(L.mx * 0.55, L.h * 0.30, Math.round(L.tMicro * 0.5), L.h * 0.40);
      block(g, 'You do not have', L.mx, L.h * 0.395, {
        font: F.display(300, L.tBig * 0.92), track: -0.04, lh: L.tBig * 1.08,
        fill: C.boneDim, align: 'left', maxW: L.w - L.mx * 2.1,
      });
      block(g, 'a motivation', L.mx, L.h * 0.395 + L.tBig * 1.10, {
        font: F.display(800, L.tBig * 0.92), track: -0.045, lh: L.tBig * 1.08,
        fill: C.bone, align: 'left', maxW: L.w - L.mx * 2.1,
      });
      const a2 = clamp(spring(dt - 0.55, 175, 25));
      block(g, 'problem.', L.mx, L.h * 0.395 + L.tBig * 2.20, {
        font: F.display(800, L.tBig * 0.92), track: -0.045, lh: L.tBig * 1.08,
        fill: C.crimson, align: 'left', maxW: L.w - L.mx * 2.1, alpha: a2,
      });
      g.restore();
      text(g, 'DEPTH, NOT MOTIVATION', L.cx, L.h * 0.80, {
        font: F.mono(700, L.tSmall * 0.80), fill: C.boneDim, track: 0.20,
        alpha: a * clamp(spring(dt - 0.9, 170, 26)),
      });
      vignette(g, L, 0.55);
    }},
  // 19-30s: pull everything together, brand last.
  { frm: 19, to: 30, t0: 19, t1: 30, draw(g, L, t, dt) {
      const cam = camera(t, 19, 30);
      const horizon = L.h * 0.52;
      g.save(); g.globalAlpha = 0.55 * (1 - clamp(dt / 2.4));
      applyCam(g, L, cam, PLANES[0].depth); planeFar(g, L, t);
      g.restore();
      haze(g, L, horizon - L.h * 0.36, horizon + L.h * 0.28, '26,28,38', 0.90);
      g.save(); g.globalAlpha = 0.5 * (1 - clamp(dt / 2.4));
      applyCam(g, L, cam, PLANES[1].depth); planeGrid(g, L, t, horizon);
      g.restore();
      haze(g, L, horizon - L.h * 0.16, L.h * 1.02, '10,10,12', 0.90);
      const bp = clamp(spring(dt, 150, 23));
      g.save(); g.globalAlpha = bp;
      g.translate(L.cx, L.h * 0.415); g.scale(lerp(0.85, 1, bp), lerp(0.85, 1, bp));
      brandMonogram(g, 0, 0, L.tBig * 1.25);
      g.restore();
      g.save(); g.globalAlpha = clamp(spring(dt - 0.28, 170, 26));
      setType(g, F.display(650, L.tBig * 0.50), 0.16);
      g.textAlign = 'center'; g.fillStyle = C.bone;
      g.fillText('AHMED ACADEMY', L.cx, L.h * 0.545);
      g.restore();
      text(g, 'FOUNDATION  ·  METHOD  ·  MOMENTUM', L.cx, L.h * 0.605, {
        font: F.mono(500, L.tSmall * 0.82), fill: C.crimsonHi, track: 0.16,
        alpha: clamp(spring(dt - 0.5, 180, 26)),
      });
      ctaPill(g, L, L.cx, L.h * 0.735, 0.92, clamp(spring(dt - 0.8, 200, 24)));
      footRail(g, L, clamp(spring(dt - 1.1, 160, 28)));
      grain(g, L, t, 7);
      vignette(g, L, 0.6);
    }},
];

// The official logo plate, composited by footRail(). Declared so the renderer
// preloads and blocks on it; without this the plate is still decoding when the
// first frames draw and the mark pops in mid-reel.
export const assets = ['brand_logo.png'];

export function setup() {}
export function draw(g, L, t, DURF) {
  const tt = ((t % DURF) + DURF) % DURF;
  bg(g, L, tt);
  for (const s of SC) if (tt >= s.frm && tt < s.to) { s.draw(g, L, tt, tt - s.frm); return; }
}

export const sfx = [
  { t: 0.02, type: 'swell' },
  { t: 1.2, type: 'pop' },
  { t: 2.4, type: 'tick' },
  { t: 3.6, type: 'tick' },
  { t: 4.8, type: 'tick' },
  { t: 6.0, type: 'tick' },
  { t: 8.0, type: 'whoosh' },
  { t: 9.0, type: 'pop' },
  { t: 11.5, type: 'tick' },
  { t: 14.0, type: 'hit' },
  { t: 19.0, type: 'swell' },
  { t: 20.4, type: 'pop' },
  { t: 22.0, type: 'hit' },
  { t: 23.6, type: 'tick' },
];
