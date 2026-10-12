// FILM 04 — "THE SYSTEM" · blueprint / technical schematic
// The illustrated route, done as precise drafting rather than a figure: this is
// the drawing language of a real technical sheet, and every line, dimension
// arrow, callout and hatch is generated as vector geometry on the beat grid.
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
  measure,
} from '../lib/brand.js';
import { clamp, lerp, inv, smooth, spring, env, rng, makeNoise, TAU } from '../lib/motion.js';

const DUR = 30;

// --- drafting primitives -----------------------------------------------------

// Line that draws itself from A to B with an optional arrowhead at the end.
function dim(g, ax, ay, bx, by, p, { colour = C.crimson, width = 3, arrow = false } = {}) {
  const e = smooth(clamp(p));
  if (e <= 0.001) return;
  const ex = lerp(ax, bx, e), ey = lerp(ay, by, e);
  g.save();
  g.strokeStyle = colour;
  g.lineWidth = width;
  g.lineCap = 'round';
  g.beginPath(); g.moveTo(ax, ay); g.lineTo(ex, ey); g.stroke();
  if (arrow && e > 0.9) {
    const ang = Math.atan2(by - ay, bx - ax);
    const s = width * 3.4, ap = clamp((e - 0.9) / 0.1);
    g.globalAlpha = ap;
    g.fillStyle = colour;
    g.beginPath();
    g.moveTo(ex, ey);
    g.lineTo(ex - Math.cos(ang - 0.4) * s, ey - Math.sin(ang - 0.4) * s);
    g.lineTo(ex - Math.cos(ang + 0.4) * s, ey - Math.sin(ang + 0.4) * s);
    g.closePath(); g.fill();
  }
  g.restore();
}

// Extension-line dimension: two ticks + a leader, the way a real sheet measures.
function dimension(g, L, ax, ay, bx, by, p, label, { side = 1 } = {}) {
  const e = smooth(clamp(p));
  if (e <= 0.001) return;
  dim(g, ax, ay, bx, by, e, { colour: C.crimson, width: Math.max(2, L.tMicro * 0.09) });
  const t = Math.max(4, L.tMicro * 0.22);
  g.save();
  g.strokeStyle = C.crimson;
  g.lineWidth = Math.max(2, L.tMicro * 0.075);
  g.lineCap = 'round';
  const ang = Math.atan2(by - ay, bx - ax) + Math.PI / 2;
  for (const [px, py] of [[ax, ay], [bx, by]]) {
    g.beginPath();
    g.moveTo(px + Math.cos(ang) * t * side, py + Math.sin(ang) * t * side);
    g.lineTo(px - Math.cos(ang) * t * side, py - Math.sin(ang) * t * side);
    g.stroke();
  }
  g.restore();
  const mx = (ax + bx) / 2, my = (ay + by) / 2;
  text(g, label, mx, my - Math.max(8, L.tMicro * 0.7) * side, {
    font: F.mono(600, L.tMicro), fill: C.crimsonHi, alpha: clamp((e - 0.5) * 2.6), track: 0.04,
  });
}

// Diagonal hatch inside a shape: the standard section fill.
function hatch(g, x, y, w, h, p, { gap = 14, colour = 'rgba(220,38,38,0.22)', width = 1.6 } = {}) {
  const e = clamp(p);
  if (e <= 0.001) return;
  g.save();
  g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.strokeStyle = colour;
  g.lineWidth = width;
  const n = Math.ceil((w + h) / gap);
  const count = Math.round(n * e);
  for (let i = 0; i < count; i++) {
    const o = i * gap - h;
    g.beginPath();
    g.moveTo(x + o, y + h);
    g.lineTo(x + o + h, y);
    g.stroke();
  }
  g.restore();
}

// A circle drawn with a revolving dash, like a compass arc in progress.
function arc(g, cx, cy, r, p, { colour = C.bone, width = 3, from = 0, to = TAU } = {}) {
  const e = clamp(p);
  if (e <= 0.001) return;
  g.save();
  g.strokeStyle = colour;
  g.lineWidth = width;
  g.lineCap = 'round';
  g.beginPath();
  g.arc(cx, cy, r, from, from + (to - from) * smooth(e));
  g.stroke();
  g.restore();
}

// A block on the schematic that draws itself and then takes a label.
function blockBox(g, L, x, y, w, h, p, label, { active = false, delay = 0, r = 6 } = {}) {
  const pp = clamp(spring(p - delay, 240, 23));
  if (pp <= 0.004) return 0;
  const wv = w * lerp(0.72, 1, pp), hv = h * lerp(0.72, 1, pp);
  const cx = x + w / 2, cy = y + h / 2;
  g.save();
  g.globalAlpha = clamp(pp * 2);
  g.strokeStyle = active ? C.crimson : 'rgba(255,255,255,0.34)';
  g.lineWidth = Math.max(2, L.tMicro * (active ? 0.14 : 0.085));
  g.fillStyle = active ? 'rgba(220,38,38,0.10)' : 'rgba(18,19,26,0.55)';
  g.beginPath(); g.roundRect(cx - wv / 2, cy - hv / 2, wv, hv, r); g.fill(); g.stroke();
  g.restore();
  text(g, label, cx, cy + L.tMicro * 0.34, {
    font: fitText(g, label, F.mono(700, L.tMicro * 1.1), 0.06, wv * 0.84).font,
    fill: active ? C.bone : C.boneDim, alpha: clamp(pp * 2.2), track: 0.06,
  });
  return clamp(pp * 2.2);
}

// Centre-lines: the long dash-dot rules that cross a technical drawing.
function centreline(g, L, p) {
  const e = smooth(clamp(p));
  if (e <= 0.001) return;
  g.save();
  g.globalAlpha = 0.30;
  g.strokeStyle = C.boneDim;
  g.lineWidth = 1.4;
  g.setLineDash([L.tMicro * 1.5, L.tMicro * 0.7, L.tMicro * 0.3, L.tMicro * 0.7]);
  g.beginPath();
  g.moveTo(L.w * 0.5, lerp(L.h * 0.16, L.h * 0.86, e * 0.5));
  g.lineTo(L.w * 0.5, lerp(L.h * 0.16, L.h * 0.86, 0.5 + e * 0.5));
  g.moveTo(lerp(L.w * 0.10, L.w * 0.90, e * 0.5), L.h * 0.42);
  g.lineTo(lerp(L.w * 0.10, L.w * 0.90, 0.5 + e * 0.5), L.h * 0.42);
  g.stroke();
  g.restore();
}

const SC = [
  // 0-6s: the sheet establishes. Grid, border, title block.
  { frm: 0, to: 6, draw(g, L, t, dt) {
      // drafting border
      const p = clamp(spring(dt, 150, 24));
      g.save();
      g.globalAlpha = p * 0.5;
      g.strokeStyle = C.line;
      g.lineWidth = 2;
      g.strokeRect(L.w * 0.055, L.h * 0.085, L.w * 0.89, L.h * 0.83);
      g.strokeStyle = 'rgba(255,255,255,0.06)';
      g.strokeRect(L.w * 0.075, L.h * 0.100, L.w * 0.85, L.h * 0.80);
      g.restore();
      centreline(g, L, clamp(spring(dt - 0.5, 170, 26)));
      text(g, 'AHMED ACADEMY · TEACHING METHOD', L.w * 0.085, L.h * 0.145, {
        font: fitText(g, 'AHMED ACADEMY · TEACHING METHOD', F.mono(700, L.tMicro * 0.98), 0.16, L.w * 0.46).font,
        fill: C.crimson, align: 'left', track: 0.16,
        alpha: clamp(spring(dt - 0.7, 180, 26)),
      });
      text(g, 'SYSTEM DIAGRAM · SHEET 1 OF 1', L.w * 0.915, L.h * 0.145, {
        font: fitText(g, 'SYSTEM DIAGRAM · SHEET 1 OF 1', F.mono(500, L.tMicro * 0.92), 0.08, L.w * 0.40).font,
        fill: C.boneDim, align: 'right', track: 0.08,
        alpha: clamp(spring(dt - 0.9, 180, 26)),
      });
      block(g, 'Most tutors improvise.', L.cx, L.h * 0.535, {
        font: F.display(300, L.tBig * 0.62), lh: L.tBig * 0.76, fill: C.boneDim,
        track: -0.035, align: 'center', maxW: L.w * 0.80, alpha: clamp(spring(dt - 1.2, 180, 26)),
      });
      block(g, 'This is engineered.', L.cx, L.h * 0.535 + L.tBig * 0.76, {
        font: F.display(800, L.tBig * 0.62), lh: L.tBig * 0.76, fill: C.crimson,
        track: -0.04, align: 'center', maxW: L.w * 0.80, alpha: clamp(spring(dt - 1.4, 180, 26)),
      });
      vignette(g, L, 0.6);
    }},
  // 6-17s: the schematic builds. Three blocks, measured, with callouts.
  { frm: 6, to: 17, draw(g, L, t, dt) {
      g.save();
      g.globalAlpha = 0.5;
      g.strokeStyle = C.line; g.lineWidth = 2;
      g.strokeRect(L.w * 0.055, L.h * 0.085, L.w * 0.89, L.h * 0.83);
      g.restore();
      centreline(g, L, 1);
      text(g, 'AHMED ACADEMY · TEACHING METHOD', L.w * 0.085, L.h * 0.145, {
        font: fitText(g, 'AHMED ACADEMY · TEACHING METHOD', F.mono(700, L.tMicro * 0.98), 0.16, L.w * 0.46).font, fill: C.crimson, align: 'left', track: 0.16, alpha: 1,
      });
      text(g, 'SYSTEM DIAGRAM · SHEET 1 OF 1', L.w * 0.915, L.h * 0.145, {
        font: fitText(g, 'SYSTEM DIAGRAM · SHEET 1 OF 1', F.mono(500, L.tMicro * 0.92), 0.08, L.w * 0.40).font, fill: C.boneDim, align: 'right', track: 0.08, alpha: 1,
      });

      const bw = L.w * 0.30, bh = L.h * 0.085;
      const bx = L.cx - bw / 2, by = L.h * 0.235;
      const gap = L.h * 0.055;
      const b1 = blockBox(g, L, bx, by, bw, bh, dt, 'DIAGNOSE', { active: dt > 0, delay: 0 });
      const b2 = blockBox(g, L, bx, by + bh + gap, bw, bh, dt, 'REBUILD', { active: dt > 1.6, delay: 1.6 });
      const b3 = blockBox(g, L, bx, by + (bh + gap) * 2, bw, bh, dt, 'REVIEW', { active: dt > 3.2, delay: 3.2 });

      // connectors with arrowheads
      dim(g, L.cx, by + bh, L.cx, by + bh + gap, dt, { colour: 'rgba(255,255,255,0.42)', width: 3, arrow: true });
      dim(g, L.cx, by + bh + gap + bh, L.cx, by + (bh + gap) * 2, dt, { colour: 'rgba(255,255,255,0.42)', width: 3, arrow: true });

      // dimensions down the left, the way a real sheet states the steps
      dimension(g, L, bx - L.w * 0.055, by + bh / 2, bx - L.w * 0.055, by + bh / 2 + gap, dt, '01', { side: -1 });
      dimension(g, L, bx - L.w * 0.055, by + gap + bh * 1.5, bx - L.w * 0.055, by + gap + bh * 1.5 + gap, dt, '02', { side: -1 });

      // hatched section on the active block
      hatch(g, bx + bw * 0.70, by + bh * 1.12, bw * 0.28, bh * 0.76, dt, { gap: L.tMicro * 0.7 });

      // output: the result, called out to the right with a leader
      const resP = clamp(spring(dt - 4.2, 220, 23));
      if (resP > 0.004) {
        const rx = L.cx + bw / 2, ry = by + (bh + gap) * 2 + bh / 2;
        dim(g, rx, ry, L.w * 0.845, ry, dt, { colour: C.crimson, width: 2.5 });
        g.save();
        g.globalAlpha = resP;
        g.strokeStyle = 'rgba(255,255,255,0.30)'; g.lineWidth = 2;
        g.beginPath(); g.roundRect(L.w * 0.700, ry - L.h * 0.045, L.w * 0.215, L.h * 0.090, 6); g.stroke();
        g.restore();
        text(g, 'GRADE', L.w * 0.8075, ry - L.h * 0.008, {
          font: F.display(700, L.tSmall * 0.80), fill: C.bone, alpha: resP, track: -0.02,
        });
        text(g, 'next paper', L.w * 0.8075, ry + L.h * 0.022, {
          font: F.mono(500, L.tMicro), fill: C.crimsonHi, alpha: resP, track: 0.06,
        });
      }

      // input: the student, called out to the left
      const inP = clamp(spring(dt - 0.4, 220, 23));
      dim(g, L.w * 0.155, by + bh / 2, bx, by + bh / 2, dt, { colour: 'rgba(255,255,255,0.42)', width: 2.5 });
      arc(g, L.w * 0.155, by + bh / 2, L.h * 0.042, dt, { colour: 'rgba(255,255,255,0.55)', width: 2.5 });
      text(g, 'STUDENT', L.w * 0.155, by + bh / 2 + L.tMicro * 0.4, {
        font: F.mono(700, L.tMicro), fill: C.boneDim, alpha: inP, track: 0.10,
      });

      // running dimension for the whole stack
      dimension(g, L, L.w * 0.935, by, L.w * 0.935, by + (bh + gap) * 2 + bh, dt - 4.2, '3', { side: 1 });

      text(g, 'SAME METHOD. EVERY SUBJECT. EVERY WEEK.', L.cx, L.h * 0.795, {
        font: fitText(g, 'SAME METHOD. EVERY SUBJECT. EVERY WEEK.', F.mono(600, L.tSmall * 0.66), 0.10, L.w * 0.72).font,
        fill: C.boneDim, alpha: clamp(spring(dt - 5.0, 180, 26)), track: 0.10,
      });
      vignette(g, L, 0.55);
    }},
  // 17-30s: brand last.
  { frm: 17, to: 30, draw(g, L, t, dt) {
      const a = env(t, 17, 30, 0.5);
      const bp = clamp(spring(dt, 160, 24));
      g.save(); g.globalAlpha = a * bp;
      g.translate(L.cx, L.h * 0.315); g.scale(lerp(0.86, 1, bp), lerp(0.86, 1, bp));
      brandMonogram(g, 0, 0, L.tBig * 1.05);
      g.restore();
      g.save(); g.globalAlpha = a * clamp(spring(dt - 0.28, 170, 26));
      setType(g, F.display(650, L.tBig * 0.46), 0.16);
      g.textAlign = 'center'; g.fillStyle = C.bone;
      g.fillText('AHMED ACADEMY', L.cx, L.h * 0.450);
      g.restore();
      rule(g, L, L.cx, L.h * 0.492, L.tBig * 2.0, clamp(spring(dt - 0.45, 300, 20)), { thick: Math.max(2, L.tMicro * 0.18) });
      block(g, 'I did it', L.cx, L.h * 0.585, {
        font: F.display(300, L.tBig * 0.60), lh: L.tBig * 0.72, fill: C.boneDim,
        track: -0.04, align: 'center', maxW: L.w * 0.84, alpha: clamp(spring(dt - 0.6, 180, 25)),
      });
      block(g, 'so I will show you.', L.cx, L.h * 0.585 + L.tBig * 0.72, {
        font: F.display(800, L.tBig * 0.60), lh: L.tBig * 0.72, fill: C.crimson,
        track: -0.045, align: 'center', maxW: L.w * 0.84, alpha: clamp(spring(dt - 0.72, 180, 25)),
      });
      ctaPill(g, L, L.cx, L.h * 0.825, 0.86, clamp(spring(dt - 0.95, 200, 24)));
      footRail(g, L, clamp(spring(dt - 1.2, 160, 28)));
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
  { t: 0.5, type: 'tick' },
  { t: 1.2, type: 'pop' },
  { t: 2.2, type: 'click' },
  { t: 3.0, type: 'tick' },
  { t: 4.0, type: 'hit' },
  { t: 6.0, type: 'whoosh' },
  { t: 6.4, type: 'click' },
  { t: 8.0, type: 'tick' },
  { t: 7.6, type: 'pop' },
  { t: 9.0, type: 'click' },
  { t: 10.0, type: 'pop' },
  { t: 10.8, type: 'click' },
  { t: 11.8, type: 'hit' },
  { t: 13.0, type: 'tick' },
  { t: 17.0, type: 'swell' },
  { t: 18.6, type: 'pop' },
  { t: 20.4, type: 'hit' },
  { t: 22.2, type: 'tick' },
];
