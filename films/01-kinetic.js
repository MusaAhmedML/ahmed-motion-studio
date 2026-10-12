// FILM 01 — "THE HOOK" · kinetic-type explainer
// Message first, brand last. Every beat is a claim; the brand only arrives at the end.
// 38s @ 120BPM, beat-locked. All motion is a pure function of local time `dt`.
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
  wordmark,
  ctaPill,
  footRail,
  ghostNumeral,
} from '../lib/brand.js';
import { clamp, lerp, inv, smooth, spring, pop, env, rng } from '../lib/motion.js';

const B = 0.5;            // one beat at 120bpm
const S = (n) => n * B;   // beats -> seconds

// Word-level kinetic entrance. Each word rides its own spring so a line ASSEMBLES
// rather than fading in as a block. Pass LOCAL time.
function kineticLine(g, L, words, dt, t0, {
  size, y, fill = C.bone, align = 'center', trackEm = -0.045, stagger = 0.05,
  weight = 700, alpha = 1,
} = {}) {
  const font = F.display(weight, size);
  g.save();
  setType(g, font, trackEm);
  const widths = words.map(w => g.measureText(w).width);
  const space = size * 0.24;
  const total = widths.reduce((a, b) => a + b, 0) + space * (words.length - 1);
  const x0 = align === 'center' ? L.cx - total / 2 : align === 'right' ? L.w - L.mx - total : L.mx;
  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';
  let x = x0;
  words.forEach((w, i) => {
    const s = clamp(spring(dt - t0 - i * stagger, 210, 23));
    const p = clamp(s);
    g.save();
    g.globalAlpha *= alpha * clamp(p * 2.2);
    g.translate(x + widths[i] / 2, y + (1 - p) * size * 0.30);
    const sc = lerp(0.93, 1, p);
    g.scale(sc, sc);
    g.fillStyle = fill;
    g.fillText(w, -widths[i] / 2, 0);
    g.restore();
    x += widths[i] + space;
  });
  g.restore();
  return total;
}

// Structural grid: keeps the frame composed instead of a type island in a void.
function grid(g, L, a, cols = 12, y0 = 0.18, y1 = 0.78) {
  if (a <= 0.004) return;
  g.save();
  g.globalAlpha = a * 0.5;
  g.strokeStyle = C.line; g.lineWidth = 1;
  for (let i = 0; i <= cols; i++) {
    const x = L.mx + (L.w - L.mx * 2) * (i / cols);
    g.beginPath(); g.moveTo(x, L.h * y0); g.lineTo(x, L.h * y1); g.stroke();
  }
  g.restore();
}

// Crimson progress rail down the left edge: shows how much reel is left, on-beat.
// Progress ladder down the gutter: reads as a deliberate rule, not a stray line.
function rail(g, L, t, DUR) {
  const y0 = L.h * 0.15, y1 = L.h * 0.855;
  const x = L.mx * 0.30, w = Math.max(3, Math.round(L.tMicro * 0.12));
  g.save();
  g.fillStyle = 'rgba(255,255,255,0.07)';
  g.fillRect(x, y0, w, y1 - y0);
  g.fillStyle = C.crimson;
  g.fillRect(x, y0, w, (y1 - y0) * (t / DUR));
  g.restore();
}

// Bottom-third kicker: one supporting line that anchors the lower frame so the
// composition reads as designed rather than top-weighted.
function kicker(g, L, dt, t0, str, { color = C.boneDim, y = 0.790 } = {}) {
  const p = clamp(spring(dt - t0, 170, 26));
  if (p <= 0.004) return;
  const yy = L.h * y;
  g.save();
  g.globalAlpha = clamp(p * 2) * 0.85;
  g.fillStyle = C.line;
  g.fillRect(L.mx, yy - L.tMid * 0.95, L.w - L.mx * 2, 1);
  g.restore();
  text(g, str, L.mx, yy - L.tMid * 0.42, {
    font: F.mono(500, L.tSmall * 0.86), fill: color, align: 'left', track: 0.03,
    alpha: clamp(p * 2),
  });
}

// Section number that draws itself as a hairline box.
function chip(g, L, x, y, label, p, { w, h, fill = C.crimson, fg = '#fff' } = {}) {
  const px = clamp(p);
  if (px <= 0.004) return;
  g.save();
  g.globalAlpha = clamp(px * 2.4);
  g.fillStyle = fill;
  g.beginPath();
  g.roundRect(x, y, w * lerp(0.82, 1, px), h, h * 0.22);
  g.fill();
  g.restore();
  g.save();
  g.globalAlpha = clamp((px - 0.35) * 3);
  g.fillStyle = fg;
  text(g, label, x + w * 0.5, y + h * 0.68, {
    font: F.mono(700, h * 0.46), fill: fg, track: 0.10, align: 'center',
  });
  g.restore();
}

// The proof rows: a crimson tick that draws, then two lines of claim.
function claimRow(g, L, i, dt, t0, big, small) {
  const p = clamp(spring(dt - t0, 230, 24));
  if (p <= 0.004) return 0;
  const y = L.cy + L.tBig * 1.30 + i * L.tSmall * 3.30;
  const x = L.mx + L.tSmall * 0.9;
  g.save();
  g.globalAlpha = clamp(p * 2.4);
  g.strokeStyle = C.crimson;
  g.lineWidth = Math.max(3, L.tMicro * 0.30);
  g.lineCap = 'round'; g.lineJoin = 'round';
  const s = L.tMicro * 1.05;
  g.beginPath();
  g.moveTo(x, y - L.tMicro * 0.1);
  g.lineTo(x + s * 0.36 * p, y + L.tMicro * 0.28 * p);
  g.lineTo(x + s * 1.0 * p, y - L.tMicro * 0.44 * p);
  g.stroke();
  g.restore();
  text(g, big, x + s * 1.6, y, { font: F.display(700, L.tSmall), fill: C.bone, align: 'left', track: -0.02, alpha: clamp(p * 2.4) });
  text(g, small, x + s * 1.6, y + L.tSmall * 0.86, { font: F.mono(500, L.tMicro), fill: C.boneDim, align: 'left', track: 0.02, alpha: clamp(p * 2.4) });
  return y + L.tSmall * 1.2;
}

const SC = [
  // ---- 0:00  HOOK. No logo, no brand, no setup. Just the problem.
  { frm: 0, to: S(7), draw(g, L, t, dt, DUR) {
      grid(g, L, clamp(spring(dt - 0.1, 180, 21)), 12, 0.30, 0.62);
      kineticLine(g, L, ['YOUR', 'CHILD', 'IS'], dt, 0.10, { size: L.tMid, y: L.cy - L.tHero * 0.62, fill: C.boneDim, trackEm: 0.04, weight: 600, stagger: 0.06 });
      kineticLine(g, L, ['STUCK'], dt, 0.42, { size: L.tHero, y: L.cy + L.tHero * 0.30, fill: C.crimson, weight: 800, stagger: 0.05 });
      rule(g, L, L.cx, L.cy + L.tHero * 0.62, L.tHero * 1.9, clamp(spring(dt - 0.62, 300, 20)), { thick: Math.round(L.tMid * 0.10) });
      text(g, 'and it is not their fault.', L.cx, L.cy + L.tHero * 1.12, {
        font: F.mono(500, L.tMid * 0.62), fill: C.boneDim, track: 0.02,
        alpha: clamp(spring(dt - 0.95, 160, 26)),
      });
      ghostNumeral(g, L, '01', L.cx, L.h * 0.645, L.tHero * 1.75, clamp(spring(dt - 0.7, 150, 26)), { alpha: 0.085 });
      kicker(g, L, dt, 1.05, 'Most parents find out in March. Too late.');
      rail(g, L, t, DUR);
      vignette(g, L, 0.62);
    }},

  // ---- 0:03.5  Reframe: symptom vs cause. Panel wipes in from the left.
  { frm: S(7), to: S(15), draw(g, L, t, dt, DUR) {
      const a = env(t, S(7), S(15), 0.26);
      const outA = 1 - a;
      g.save(); g.globalAlpha = outA;
      grid(g, L, outA, 12, 0.30, 0.62);
      kineticLine(g, L, ['YOUR', 'CHILD', 'IS'], dt - S(7), 0.10, { size: L.tMid, y: L.cy - L.tHero * 0.62, fill: C.boneDim, trackEm: 0.04, weight: 600, alpha: outA });
      kineticLine(g, L, ['STUCK'], dt - S(7), 0.42, { size: L.tHero, y: L.cy + L.tHero * 0.30, fill: C.crimson, weight: 800, alpha: outA });
      g.restore();

      const px = lerp(-L.w, 0, smooth(clamp(spring(dt, 150, 24))));
      g.save();
      g.translate(px, 0);
      g.fillStyle = C.surface;
      g.fillRect(0, L.h * 0.18, L.w, L.h * 0.60);
      g.fillStyle = C.crimson;
      g.fillRect(0, L.h * 0.18, Math.round(L.tMicro * 0.5), L.h * 0.60);
      // hairline top+bottom of the panel, drawing out with it
      g.fillStyle = C.line;
      g.fillRect(0, L.h * 0.18, L.w, 1);
      g.fillRect(0, L.h * 0.78 - 1, L.w, 1);
      block(g, 'The grade is', L.mx, L.cy - L.tHero * 0.18, {
        font: F.display(700, L.tBig), track: -0.045, lh: L.tBig * 1.10,
        fill: C.bone, align: 'left', maxW: L.w - L.mx * 2,
      });
      const a2 = clamp(spring(dt - 0.42, 170, 25));
      block(g, 'the symptom.', L.mx, L.cy + L.tBig * 0.92, {
        font: F.display(300, L.tBig), track: -0.04, lh: L.tBig * 1.1,
        fill: C.boneDim, align: 'left', maxW: L.w - L.mx * 2, alpha: a2,
      });
      text(g, 'The method is the cause.', L.mx, L.h * 0.735, {
        font: F.mono(600, L.tSmall), fill: C.crimsonHi, align: 'left', track: 0.03,
        alpha: clamp(spring(dt - 0.78, 180, 26)),
      });
      g.restore();
      ghostNumeral(g, L, '00', L.cx, L.h * 0.885, L.tHero * 1.5, clamp(spring(dt - 0.4, 150, 26)), { alpha: 0.065 });
      rail(g, L, t, DUR);
      vignette(g, L, 0.55);
    }},

  // ---- 0:07.5  Method 01 DIAGNOSE. Number counts up, hairline rule overshoots.
  { frm: S(15), to: S(23), draw(g, L, t, dt, DUR) {
      const a = env(t, S(15), S(23), 0.26);
      g.save(); g.globalAlpha = a;
      chip(g, L, L.mx, L.h * 0.24, '01 / DIAGNOSE', clamp(spring(dt, 240, 23)), { w: L.tSmall * 6.4, h: L.tSmall * 1.5 });
      text(g, 'One thing causes', L.mx, L.cy - L.tBig * 0.85, { font: F.display(300, L.tMid), fill: C.boneDim, align: 'left', track: -0.03 });
      text(g, '80% of lost marks.', L.mx, L.cy - L.tBig * 0.30, { font: F.display(700, L.tMid), fill: C.bone, align: 'left', track: -0.035 });
      const p = clamp(spring(dt - 0.18, 110, 26));
      const v = Math.round(lerp(0, 80, smooth(p)));
      text(g, String(v) + '%', L.mx, L.cy + L.tBig * 0.85, { font: F.display(800, L.tBig * 1.25), fill: C.crimson, align: 'left', track: -0.05 });
      rule(g, L, L.mx + L.tBig * 0.75, L.cy + L.tBig * 1.02, L.tBig * 1.5 * p, clamp(spring(dt - 0.24, 300, 20)), { thick: Math.round(L.tMicro * 0.42) });
      text(g, 'is one thing nobody ever diagnosed.', L.mx, L.cy + L.tBig * 1.55, {
        font: F.mono(500, L.tSmall), fill: C.boneDim, align: 'left', track: 0.02,
        alpha: clamp(spring(dt - 0.6, 160, 26)),
      });
      g.restore();
      ghostNumeral(g, L, '01', L.cx + L.w * 0.29, L.h * 0.655, L.tHero * 1.55, clamp(spring(dt - 0.2, 150, 26)), { alpha: 0.09 });
      kicker(g, L, dt, 0.7, 'I start every student here. Before any notes.', { y: 0.775 });
      rail(g, L, t, DUR);
      vignette(g, L, 0.5);
    }},

  // ---- 0:11.5  Method 02 REBUILD. Three bars grow on staggered springs.
  { frm: S(23), to: S(31), draw(g, L, t, dt, DUR) {
      const a = env(t, S(23), S(31), 0.26);
      g.save(); g.globalAlpha = a;
      chip(g, L, L.mx, L.h * 0.24, '02 / REBUILD', clamp(spring(dt, 240, 23)), { w: L.tSmall * 6.4, h: L.tSmall * 1.5 });
      text(g, 'Then rebuild it.', L.mx, L.cy - L.tBig * 0.95, { font: F.display(700, L.tBig * 0.80), fill: C.bone, align: 'left', track: -0.04 });
      const labels = ['explain it', 'prove it', 'repeat it'];
      const bx = L.mx, bw = L.w - L.mx * 2;
      labels.forEach((lb, i) => {
        const p = clamp(spring(dt - 0.24 - i * 0.13, 240, 22));
        const y = L.cy - L.tBig * 0.20 + i * L.tSmall * 2.0;
        const hh = L.tSmall * 1.32;
        g.save();
        g.globalAlpha = a * clamp(p * 2.2);
        g.fillStyle = i === 0 ? C.crimson : C.surfaceHi;
        g.beginPath(); g.roundRect(bx, y, bw * p, hh, hh * 0.18); g.fill();
        g.save();
        g.beginPath(); g.rect(bx, y, bw * p, hh); g.clip();
        text(g, lb, bx + L.tSmall * 0.7, y + hh * 0.66, {
          font: F.mono(700, L.tSmall * 0.78), fill: i === 0 ? '#fff' : C.bone, align: 'left', track: 0.06,
        });
        text(g, String(i + 1).padStart(2, '0'), bx + bw - L.tSmall * 0.7, y + hh * 0.66, {
          font: F.mono(700, L.tSmall * 0.66), fill: i === 0 ? 'rgba(255,255,255,0.7)' : C.boneDim, align: 'right', track: 0.06,
        });
        g.restore();
        g.restore();
      });
      g.restore();
      ghostNumeral(g, L, '02', L.cx + L.w * 0.29, L.h * 0.655, L.tHero * 1.55, clamp(spring(dt - 0.2, 150, 26)), { alpha: 0.09 });
      kicker(g, L, dt, 0.7, 'Same three steps. Every subject. Every week.', { y: 0.775 });
      rail(g, L, t, DUR);
      vignette(g, L, 0.5);
    }},

  // ---- 0:15.5  PROOF. Approved claims only.
  { frm: S(31), to: S(41), draw(g, L, t, dt, DUR) {
      const a = env(t, S(31), S(41), 0.3);
      g.save(); g.globalAlpha = a;
      text(g, 'I DID IT.', L.mx, L.cy - L.tBig * 1.05, { font: F.display(800, L.tBig), fill: C.bone, align: 'left', track: -0.05 });
      rule(g, L, L.mx + L.tBig * 1.1, L.cy - L.tBig * 0.82, L.tBig * 2.2, clamp(spring(dt - 0.2, 300, 20)), { thick: Math.round(L.tMicro * 0.40) });
      g.restore();
      claimRow(g, L, 0, dt, 0.45, 'A*A*AAA', 'at A-Level');
      claimRow(g, L, 1, dt, 0.61, 'Manchester · Edinburgh', 'university offers');
      claimRow(g, L, 2, dt, 0.77, 'Straight 9s and 8s', 'in tutored subjects');
      kicker(g, L, dt, 1.0, 'Every one of those was me first.', { color: C.crimsonHi, y: 0.795 });
      rail(g, L, t, DUR);
      vignette(g, L, 0.5);
    }},

  // ---- 0:20.5  BRAND LAST. The only beat that carries the logo.
  { frm: S(41), to: S(76), draw(g, L, t, dt, DUR) {
      const p = clamp(spring(dt - 0.1, 150, 22));
      const s = lerp(0.84, 1, p);
      g.save();
      g.globalAlpha = p;
      g.translate(L.cx, L.cy - L.tBig * 0.55);
      g.scale(s, s);
      brandMonogram(g, 0, 0, L.tBig * 1.35);
      g.restore();
      wordmark(g, L, L.cx, L.cy + L.tBig * 0.92, 1.15, { alpha: clamp(spring(dt - 0.3, 170, 26)) });
      const sl = clamp(spring(dt - 0.7, 180, 26));
      // Crimson hairline divider between mark and slogan.
      g.save();
      g.globalAlpha = sl * 0.5;
      g.fillStyle = C.crimson;
      g.fillRect(L.cx - L.tMicro * 3.2, L.cy + L.tBig * 1.52, L.tMicro * 6.4, Math.max(2, L.tMicro * 0.10));
      g.restore();
      text(g, 'YOU HAVE THE POTENTIAL.', L.cx, L.cy + L.tBig * 1.95, {
        font: F.mono(600, L.tSmall), fill: C.bone, track: 0.10, alpha: sl * 0.95,
      });
      text(g, 'I HAVE THE FORMULA.', L.cx, L.cy + L.tBig * 2.34, {
        font: F.mono(600, L.tSmall), fill: C.crimsonHi, track: 0.10, alpha: clamp(spring(dt - 0.82, 180, 26)) * 0.95,
      });
      ctaPill(g, L, L.cx, L.cy + L.tBig * 3.12, 1.0, clamp(spring(dt - 1.0, 200, 24)));
      footRail(g, L, clamp(spring(dt - 1.25, 160, 28)));
      grain(g, L, t, 7);
      vignette(g, L, 0.6);
    }},
];

export const DURATION = 38;
// The official logo plate, composited by footRail(). Declared so the renderer
// preloads and blocks on it; without this the plate is still decoding when the
// first frames draw and the mark pops in mid-reel.
export const assets = ['brand_logo.png'];

export function setup() {}

export function draw(g, L, t, DUR) {
  const tt = ((t % DUR) + DUR) % DUR;
  bg(g, L, tt);
  for (const s of SC) if (tt >= s.frm && tt < s.to) { s.draw(g, L, tt, tt - s.frm, DUR); return; }
}

// SFX cue sheet: beat-locked hits only. SFX-first, no music bed.
export const sfx = [
  { t: S(0) + 0.02, type: 'thump' },
  { t: S(0) + 0.10, type: 'pop' },
  { t: S(0) + 0.16, type: 'tick' },
  { t: S(0) + 0.42, type: 'hit' },
  { t: S(0) + 0.95, type: 'tick' },
  { t: S(7), type: 'whoosh' },
  { t: S(7) + 0.42, type: 'pop' },
  { t: S(7) + 0.78, type: 'tick' },
  { t: S(15), type: 'click' },
  { t: S(15) + 0.18, type: 'riser' },
  { t: S(15) + 0.78, type: 'pop' },
  { t: S(23), type: 'whoosh' },
  { t: S(23) + 0.24, type: 'tick' },
  { t: S(23) + 0.37, type: 'tick' },
  { t: S(23) + 0.50, type: 'tick' },
  { t: S(31), type: 'hit' },
  { t: S(31) + 0.45, type: 'pop' },
  { t: S(31) + 0.61, type: 'tick' },
  { t: S(31) + 0.77, type: 'tick' },
  { t: S(41), type: 'swell' },
  { t: S(41) + 1.0, type: 'pop' },
  { t: S(41) + 1.45, type: 'hit' },
];
