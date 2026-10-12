// FILM 02 — "ONE SHAPE, TEN LIVES" · UI morph
// The morph-loop technique: one container never cuts. It changes size, radius and
// fill while its content swaps behind a short blur. A cursor drives every change
// with a real click. The last frame EQUALS the first (cursor position and
// velocity included) so the reel loops with no seam.
import {
  brandMonogram,
  C,
  F,
  bg,
  vignette,
  grain,
  text,
  setType,
  block,
  monogram,
  wordmark,
  ctaPill,
  footRail,
  fitText,
} from '../lib/brand.js';
import { clamp, lerp, inv, smooth, spring, track, indicator, swapAlpha, env } from '../lib/motion.js';

const B = 0.5;
const S = (n) => n * B;

// ---- the state list. One element, ten identities, all measured off the beat grid.
const STATES = [
  { at: 0.0,  label: 'BUTTON',   x: 0.185, y: 0.50, w: 0.63, h: 0.088, r: 0.5,  fill: 'crimson', fg: '#fff' },
  { at: 0.9,  label: 'TYPED',    x: 0.13, y: 0.50, w: 0.74, h: 0.098, r: 0.14, fill: 'surface', fg: 'bone' },
  { at: 1.8,  label: 'LOADING',  x: 0.13, y: 0.50, w: 0.74, h: 0.098, r: 0.14, fill: 'surface', fg: 'bone' },
  { at: 2.7,  label: 'DONE',     x: 0.28, y: 0.50, w: 0.44, h: 0.088, r: 0.5,  fill: 'crimson', fg: '#fff' },
  { at: 3.6,  label: 'CARD',     x: 0.11, y: 0.36, w: 0.78, h: 0.30, r: 0.055, fill: 'surface', fg: 'bone' },
  { at: 4.5,  label: 'CHART',    x: 0.11, y: 0.40, w: 0.78, h: 0.22, r: 0.055, fill: 'surface', fg: 'bone' },
  { at: 5.4,  label: 'TOOLTIP',  x: 0.30, y: 0.30, w: 0.44, h: 0.085, r: 0.13, fill: 'crimson', fg: '#fff' },
  { at: 6.3,  label: 'PALETTE',  x: 0.09, y: 0.44, w: 0.82, h: 0.13, r: 0.075, fill: 'surface', fg: 'bone' },
  { at: 7.2,  label: 'TOAST',    x: 0.07, y: 0.13, w: 0.86, h: 0.10, r: 0.12, fill: 'surface', fg: 'bone' },
  { at: 8.1,  label: 'LOGO',     x: 0.32, y: 0.50, w: 0.36, h: 0.20, r: 0.06,  fill: 'none',   fg: 'bone' },
];

const LOOP = 9.0;                 // seconds; last state loops back to first
const K_SNAP = 420, D_SNAP = 30;  // geometry: snappy but with a hair of overshoot
const K_TRAIL = 150, D_TRAIL = 24;

// Geometry is a TRACK (one spring per change) so the shape stretches between
// states instead of teleporting, and every value stays a pure function of t.
function geom(t, key, def) {
  const keys = [[0, STATES[0][key]]];
  for (const s of STATES) if (s.at > 0) keys.push([s.at, s[key]]);
  // close the loop: last state eases back to the first over the tail
  keys.push([LOOP - 0.9, STATES[STATES.length - 1][key]]);
  keys.push([LOOP, STATES[0][key]]);
  return track(t, keys, K_SNAP, D_SNAP);
}
function geomTrail(t, key) {
  const keys = [[0, STATES[0][key]]];
  for (const s of STATES) if (s.at > 0) keys.push([s.at, s[key]]);
  keys.push([LOOP - 0.9, STATES[STATES.length - 1][key]]);
  keys.push([LOOP, STATES[0][key]]);
  return track(t, keys, K_TRAIL, D_TRAIL);
}

// Cursor follows its own track to each state's target point. At t=LOOP it is back
// at its start WITH the same velocity, which is what makes the loop seamless.
function cursor(t) {
  const keys = [[0, 0.5]];
  for (const s of STATES) {
    keys.push([s.at - 0.28, s.cursorX ?? (s.x + s.w * 0.5)]);
    keys.push([s.at, (s.x + s.w * 0.5)]);
    keys.push([s.at + 0.14, (s.x + s.w * 0.5)]);
  }
  keys.push([LOOP - 0.9, 0.5]);
  keys.push([LOOP, 0.5]);
  const X = keys.map(k => [k[0], k[1]]);
  return { x: track(t, X, 190, 24), y: track(t, X.map((k, i) => [k[0], 0.60 + Math.sin(k[0] * 1.7) * 0.06]), 190, 24) };
}

// Which state am I inside, and how far through it?
function phase(t) {
  const tt = ((t % LOOP) + LOOP) % LOOP;
  let i = 0;
  for (let k = 0; k < STATES.length; k++) if (tt >= STATES[k].at) i = k;
  const t0 = STATES[i].at;
  const t1 = i + 1 < STATES.length ? STATES[i + 1].at : LOOP;
  return { i, tt, dt: tt - t0, t0, t1, dur: t1 - t0 };
}

// Ripple on click: one ring per state change, expanding and fading.
// Click ripple: starts AT the cursor (where the click lands), not the shape centre,
// and is only visible in the first ~400ms after the press.
function ripple(g, x, y, dt, colour) {
  if (dt > 0.42 || dt < 0) return;
  const p = clamp(dt / 0.42);
  const e = 1 - Math.pow(1 - p, 3);
  g.save();
  g.globalAlpha = (1 - e) * 0.34;
  g.strokeStyle = colour;
  g.lineWidth = Math.max(2, _W * 0.0035 * (1 - p));
  g.beginPath();
  g.arc(x, y, e * _W * 0.075, 0, Math.PI * 2);
  g.stroke();
  g.restore();
}
let _W = 1000;
const L_w = () => _W;

export const DURATION = LOOP;
// The official logo plate, composited by footRail(). Declared so the renderer
// preloads and blocks on it; without this the plate is still decoding when the
// first frames draw and the mark pops in mid-reel.
export const assets = ['brand_logo.png'];

export function setup(L) { _W = L.w; }

// Content that lives INSIDE the morphing container, swapping behind a short blur.
function inner(g, L, P, dt) {
  const S0 = STATES[P.i];
  const x = L.mx + (L.w - L.mx * 2) * geom(P.tt, 'x');
  const y = L.h * geom(P.tt, 'y');
  const w = (L.w - L.mx * 2) * geom(P.tt, 'w');
  const h = L.h * geom(P.tt, 'h');
  const a = swapAlpha(P.tt, S0.at, P.t1);
  if (a <= 0.004) return;
  const blur = (1 - a) * 3.2;   // content is briefly blurred mid-swap
  g.save();
  g.beginPath(); g.roundRect(x, y, w, h, h * geom(P.tt, 'r')); g.clip();
  if (blur > 0.02) g.filter = `blur(${blur.toFixed(2)}px)`;
  g.globalAlpha = a;
  const cx = x + w / 2, cy = y + h / 2;

  switch (S0.label) {
    case 'BUTTON': {
      const press = clamp(1 - Math.abs(dt - 0.18) / 0.14);
      const inner = w - h * 0.9;
      text(g, 'Book a free diagnostic', cx, cy - h * 0.03, {
        font: fitText(g, 'Book a free diagnostic', F.display(700, L.tSmall * 1.02), -0.02, inner).font,
        fill: '#fff', track: -0.02,
      });
      text(g, 'musaahmed.uk/academy', cx, cy + h * 0.31, {
        font: fitText(g, 'musaahmed.uk/academy', F.mono(500, L.tSmall * 0.66), 0.02, inner).font,
        fill: 'rgba(255,255,255,0.88)', track: 0.02,
      });
      if (press > 0.01) {
        g.save();
        g.globalAlpha = a * press * 0.5;
        g.fillStyle = '#000';
        g.fillRect(x, y, w, h);
        g.restore();
      }
      break;
    }
    case 'TYPED': {
      const str = 'musaahmed.uk/academy';
      const n = Math.floor(clamp(spring(dt - 0.12, 150, 26)) * (str.length + 2));
      text(g, str.slice(0, n), x + h * 0.34, cy + h * 0.12, {
        font: F.mono(600, L.tSmall * 0.94), fill: C.bone, align: 'left', track: 0.01,
      });
      if (n > 0 && n < str.length && Math.sin(dt * 22) > -0.2) {
        const wpx = (str.slice(0, n).length) * L.tSmall * 0.94 * 0.60;
        g.fillStyle = C.crimson;
        g.fillRect(x + h * 0.34 + wpx + 4, cy - h * 0.20, Math.max(3, L.tMicro * 0.10), h * 0.40);
      }
      break;
    }
    case 'LOADING': {
      // Determinate bar that fills, then a check that draws itself.
      const p = clamp(dt / 0.72);
      text(g, 'DIAGNOSING', x + h * 0.34, cy - h * 0.10, {
        font: F.mono(600, L.tSmall * 0.72), fill: C.boneDim, align: 'left', track: 0.10,
      });
      const bw = w - h * 0.68;
      g.fillStyle = 'rgba(255,255,255,0.10)';
      g.beginPath(); g.roundRect(x + h * 0.34, cy + h * 0.02, bw, h * 0.13, h * 0.065); g.fill();
      g.fillStyle = C.crimson;
      g.beginPath(); g.roundRect(x + h * 0.34, cy + h * 0.02, bw * p, h * 0.13, h * 0.065); g.fill();
      const cp = clamp((dt - 0.76) / 0.22);
      if (cp > 0) {
        g.strokeStyle = C.bone; g.lineWidth = Math.max(3, h * 0.07);
        g.lineCap = 'round'; g.lineJoin = 'round';
        g.beginPath();
        g.moveTo(cx - h * 0.16 * cp, cy + h * 0.30);
        g.lineTo(cx - h * 0.04 * cp, cy + h * 0.40 * cp);
        g.lineTo(cx + h * 0.20 * cp, cy + h * 0.14 * cp);
        g.stroke();
      }
      break;
    }
    case 'DONE': {
      const iw = w - h * 0.9;
      text(g, 'Booked', cx, cy - h * 0.03, { font: F.display(700, L.tSmall * 1.02), fill: '#fff', track: -0.02 });
      text(g, 'reply within 24h', cx, cy + h * 0.31, {
        font: fitText(g, 'reply within 24h', F.mono(500, L.tSmall * 0.66), 0.02, iw).font,
        fill: 'rgba(255,255,255,0.88)', track: 0.02,
      });
      break;
    }
    case 'CARD': {
      const px = x + h * 0.28;
      text(g, 'YOUR DIAGNOSTIC', px, y + h * 0.20, { font: F.mono(700, L.tSmall * 0.62), fill: C.crimson, align: 'left', track: 0.12 });
      const rows = [
        ['GCSE Maths', '62%', 0.62], ['GCSE English', '71%', 0.71], ['Physics', '54%', 0.54],
      ];
      rows.forEach((r, i) => {
        const rp = clamp(spring(dt - 0.14 - i * 0.10, 200, 24));
        const yy = y + h * (0.40 + i * 0.185);
        text(g, r[0], px, yy, { font: F.mono(600, L.tSmall * 0.72), fill: C.bone, align: 'left', track: 0.02, alpha: rp });
        text(g, r[1], x + w - h * 0.28, yy, { font: F.mono(700, L.tSmall * 0.72), fill: C.boneDim, align: 'right', track: 0.02, alpha: rp });
        const bwid = (w - h * 0.56) * r[2] * rp;
        g.save(); g.globalAlpha = rp * 0.5;
        g.fillStyle = C.crimson;
        g.fillRect(px, yy + h * 0.045, (w - h * 0.56) * r[2] * rp, Math.max(2, h * 0.022));
        g.restore();
      });
      break;
    }
    case 'CHART': {
      text(g, 'GRADE TRAJECTORY', x + h * 0.30, y + h * 0.16, { font: F.mono(700, L.tSmall * 0.60), fill: C.boneDim, align: 'left', track: 0.12 });
      const vals = [0.34, 0.42, 0.48, 0.61, 0.74, 0.86];
      const bw = (w - h * 0.6) / vals.length;
      vals.forEach((v, i) => {
        const rp = clamp(spring(dt - 0.10 - i * 0.075, 210, 24));
        const bh = (h * 0.62) * v * rp;
        g.fillStyle = i === vals.length - 1 ? C.crimson : 'rgba(255,255,255,0.20)';
        g.beginPath();
        g.roundRect(x + h * 0.30 + i * bw + bw * 0.16, y + h * 0.80 - bh, bw * 0.68, bh, bw * 0.14);
        g.fill();
      });
      break;
    }
    case 'TOOLTIP': {
      text(g, '+34%', cx, cy - h * 0.04, { font: F.display(800, L.tBig * 0.72), fill: '#fff', track: -0.04 });
      text(g, 'in 8 weeks', cx, cy + h * 0.28, { font: F.mono(600, L.tSmall * 0.60), fill: 'rgba(255,255,255,0.9)', track: 0.06 });
      break;
    }
    case 'PALETTE': {
      text(g, 'Quick actions', x + h * 0.26, cy - h * 0.06, { font: F.mono(700, L.tSmall * 0.62), fill: C.boneDim, align: 'left', track: 0.10 });
      const tabs = ['Notes', 'Past papers', 'Mock exam', 'Timetable'];
      const n = tabs.length;
      const tw = (w - h * 0.52) / n;
      tabs.forEach((tb, i) => {
        const tx = x + h * 0.26 + i * tw;
        const sel = i === 2;
        if (sel) {
          g.save();
          g.globalAlpha = a;
          g.fillStyle = 'rgba(220,38,38,0.16)';
          g.beginPath(); g.roundRect(tx + tw * 0.06, cy - h * 0.24, tw * 0.88, h * 0.48, h * 0.12); g.fill();
          g.fillStyle = C.crimson;
          g.fillRect(tx + tw * 0.06, cy + h * 0.24, tw * 0.88, Math.max(3, h * 0.035));
          g.restore();
        }
        text(g, tb, tx + tw * 0.5, cy + h * 0.06, {
          font: F.mono(700, L.tSmall * 0.58), fill: sel ? C.bone : C.boneDim, align: 'center', track: 0.04,
        });
      });
      break;
    }
    case 'TOAST': {
      const okp = clamp(spring(dt - 0.10, 260, 22));
      g.fillStyle = C.crimson;
      g.beginPath(); g.arc(x + h * 0.30, cy, h * 0.10 * okp, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#fff'; g.lineWidth = Math.max(3, h * 0.05);
      g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath();
      g.moveTo(x + h * 0.30 - h * 0.05 * okp, cy);
      g.lineTo(x + h * 0.30 - h * 0.01 * okp, cy + h * 0.045 * okp);
      g.lineTo(x + h * 0.30 + h * 0.07 * okp, cy - h * 0.05 * okp);
      g.stroke();
      text(g, 'Diagnostic booked', x + h * 0.52, cy - h * 0.06, {
        font: F.display(700, L.tSmall * 0.80), fill: C.bone, align: 'left', track: -0.015,
      });
      text(g, 'Tutor notified · 24h reply', x + h * 0.52, cy + h * 0.20, {
        font: F.mono(500, L.tSmall * 0.56), fill: C.boneDim, align: 'left', track: 0.03,
      });
      break;
    }
    case 'LOGO': {
      g.save();
      g.translate(cx, cy - h * 0.10);
      brandMonogram(g, 0, 0, h * 0.52);
      g.restore();
      text(g, 'AHMED ACADEMY', cx, cy + h * 0.36, {
        font: F.display(650, L.tSmall * 0.80), fill: C.bone, track: 0.14,
      });
      break;
    }
  }
  g.restore();
}

export function draw(g, L, t, DUR) {
  const P = phase(t);
  bg(g, L, P.tt);
  _W = L.w;

  const S0 = STATES[P.i];
  const x = L.mx + (L.w - L.mx * 2) * geom(P.tt, 'x');
  const y = L.h * geom(P.tt, 'y');
  const w = (L.w - L.mx * 2) * geom(P.tt, 'w');
  const h = L.h * geom(P.tt, 'h');
  const r = h * geom(P.tt, 'r');

  // Caption above: what the shape is NOW. This is the reel's teaching device.
  const lab = swapAlpha(P.tt, S0.at, P.t1);
  if (lab > 0.004) {
    text(g, S0.label, L.cx, L.h * 0.185, {
      font: F.mono(700, L.tSmall * 0.80), fill: C.boneDim, track: 0.22, alpha: lab * 0.9,
    });
    g.save();
    g.globalAlpha = lab * 0.45;
    g.fillStyle = C.line;
    g.fillRect(L.cx - L.tMicro * 2.4, L.h * 0.205, L.tMicro * 4.8, 1);
    g.restore();
  }

  // Glow/shadow so the card floats rather than sits flat on the background.
  g.save();
  g.shadowColor = S0.fill === 'crimson' ? 'rgba(220,38,38,0.45)' : 'rgba(0,0,0,0.65)';
  g.shadowBlur = L.tHero * 0.20;
  g.shadowOffsetY = L.tHero * 0.035;
  if (S0.fill === 'none') {
    g.strokeStyle = C.line;
    g.lineWidth = Math.max(2, L.tMicro * 0.10);
    g.beginPath(); g.roundRect(x, y, w, h, r); g.stroke();
  } else {
    g.fillStyle = S0.fill === 'crimson' ? C.crimson : C.surfaceHi;
    g.beginPath(); g.roundRect(x, y, w, h, r); g.fill();
    g.strokeStyle = C.line; g.lineWidth = Math.max(1, L.tMicro * 0.05);
    g.stroke();
  }
  g.restore();

  // Progress ticks: one per state, filling on the beat grid.
  const tickW = (L.w - L.mx * 2) / STATES.length;
  STATES.forEach((s, i) => {
    const gap = tickW * 0.26;
    const tx = L.mx + i * tickW;
    g.fillStyle = 'rgba(255,255,255,0.13)';
    g.fillRect(tx + gap * 0.5, L.h * 0.845, tickW - gap, Math.max(3, L.tMicro * 0.13));
    if (i < P.i) {
      g.fillStyle = C.crimson;
      g.fillRect(tx + gap * 0.5, L.h * 0.845, tickW - gap, Math.max(3, L.tMicro * 0.13));
    } else if (i === P.i) {
      const f = clamp(spring(P.dt, 300, 26));
      g.fillStyle = C.crimson;
      g.fillRect(tx + gap * 0.5, L.h * 0.845, (tickW - gap) * f, Math.max(3, L.tMicro * 0.13));
    }
  });

  inner(g, L, P, P.dt);
    // Cursor last, above everything.
  const cur = cursor(P.tt);
  const px = L.mx + (L.w - L.mx * 2) * cur.x;
  const py = L.h * cur.y;
  const cs = L.tSmall * 0.62;
  g.save();
  g.translate(px, py);
  g.rotate(-0.28);
  g.shadowColor = 'rgba(0,0,0,0.7)'; g.shadowBlur = cs * 0.22; g.shadowOffsetY = cs * 0.05;
  g.fillStyle = '#f5f5f4';
  g.beginPath();
  g.moveTo(0, 0); g.lineTo(0, cs * 1.05); g.lineTo(cs * 0.30, cs * 0.78);
  g.lineTo(cs * 0.56, cs * 1.34); g.lineTo(cs * 0.80, cs * 1.20);
  g.lineTo(cs * 0.54, cs * 0.66); g.lineTo(cs * 0.92, cs * 0.57);
  g.closePath(); g.fill();
  g.shadowColor = 'transparent';
  g.strokeStyle = 'rgba(10,10,12,0.85)'; g.lineWidth = Math.max(1.5, cs * 0.075); g.stroke();
  g.restore();
  // Click press flash under the tip
  if (P.dt >= 0 && P.dt < 0.16) {
    const p = clamp(P.dt / 0.16);
    g.save();
    g.globalAlpha = (1 - p) * 0.30;
    g.fillStyle = C.crimson;
    g.beginPath(); g.arc(px, py, cs * (0.28 + p * 0.55), 0, Math.PI * 2); g.fill();
    g.restore();
  }

  footRail(g, L, 0.9);
  grain(g, L, P.tt, 6);
  vignette(g, L, 0.52);
}

export const sfx = (() => {
  const cues = [];
  STATES.forEach((s, i) => {
    cues.push({ t: s.at + 0.02, type: 'click' });
    cues.push({ t: s.at + 0.14, type: i % 3 === 0 ? 'pop' : 'tick' });
  });
  cues.push({ t: 0.0, type: 'swell', gain: 0.5 });
  cues.push({ t: LOOP - 0.9, type: 'riser', gain: 0.6 });
  return cues;
})();
