// FILM 08 — "THE MAP" · knowledge graph / constellation
// The syllabus as a constellation: nodes pop on the beat, edges draw between
// them, and one path lights up to show how a grade is actually built.
// Same technique family as the parallax film but read as data, not as depth.
import { C, F, bg, vignette, grain, text, block, setType, rule, hairline,
         brandMonogram, monogram, wordmark, ctaPill, footRail, fitText, measure } from '../lib/brand.js';
import { clamp, lerp, inv, smooth, spring, env, rng, makeNoise, TAU } from '../lib/motion.js';

const DUR = 30;
const noise = makeNoise(9091);

// Nodes in normalised space. kind: core | topic | edge
const NODES = [
  { id: 'maths',  x: 0.50, y: 0.42, r: 0.075, kind: 'core', label: 'GCSE Maths', at: 0.4 },
  { id: 'algebra', x: 0.26, y: 0.27, r: 0.045, kind: 'topic', label: 'Algebra', at: 2.2 },
  { id: 'num',     x: 0.75, y: 0.25, r: 0.043, kind: 'topic', label: 'Number', at: 2.7 },
  { id: 'geom',    x: 0.24, y: 0.60, r: 0.044, kind: 'topic', label: 'Geometry', at: 3.2 },
  { id: 'stats',   x: 0.76, y: 0.60, r: 0.042, kind: 'topic', label: 'Statistics', at: 3.7 },
  { id: 'ratios',  x: 0.50, y: 0.19, r: 0.032, kind: 'edge', label: 'ratios', at: 5.2 },
  { id: 'bounds',  x: 0.50, y: 0.66, r: 0.032, kind: 'edge', label: 'bounds', at: 5.6 },
  { id: 'simult',  x: 0.14, y: 0.43, r: 0.032, kind: 'edge', label: 'simultaneous', at: 6.0 },
  { id: 'proof',   x: 0.87, y: 0.43, r: 0.030, kind: 'edge', label: 'proof', at: 6.4 },
];

const EDGES = [
  ['maths', 'algebra'], ['maths', 'num'], ['maths', 'geom'], ['maths', 'stats'],
  ['algebra', 'ratios'], ['algebra', 'simult'], ['num', 'proof'], ['geom', 'bounds'],
];

// The path that lights up: a traversal through the graph, drawn edge by edge.
const PATH = ['maths', 'algebra', 'ratios'];

function nodeP(n, t) {
  return clamp(spring(t - n.at, 260, 21));
}

// The official logo plate, composited by footRail(). Declared so the renderer
// preloads and blocks on it; without this the plate is still decoding when the
// first frames draw and the mark pops in mid-reel.
export const assets = ['brand_logo.png'];

export function setup() {}
export function draw(g, L, t, DURF) {
  const tt = ((t % DURF) + DURF) % DURF;
  bg(g, L, tt);
  const byId = Object.fromEntries(NODES.map(n => [n.id, n]));
  const px = (n) => L.w * n.x, py = (n) => L.h * n.y;
  const nr = (n) => L.w * n.r * 1.45;

  // ---- 0-7.5s: the core lands, then topics fan out on the beat.
  if (tt < 8.0) {
    const dt = tt;
    text(g, 'A GRADE IS NOT ONE THING.', L.cx, L.h * 0.135, {
      font: F.mono(700, L.tSmall * 0.76), fill: C.boneDim, track: 0.18,
      alpha: clamp(spring(dt - 0.15, 180, 26)),
    });
    hairline(g, L, L.h * 0.165, clamp(spring(dt - 0.3, 180, 26)) * 0.45);

    // edges first, behind nodes
    EDGES.forEach(([a, b], i) => {
      const A = byId[a], B = byId[b];
      const pa = nodeP(A, tt), pb = nodeP(B, tt);
      const p = clamp(Math.min(pa, pb));
      if (p <= 0.004) return;
      const dx = px(B) - px(A), dy = py(B) - py(A);
      const len = Math.hypot(dx, dy);
      const ex = px(A) + dx * p, ey = py(A) + dy * p;
      g.save();
      g.globalAlpha = 0.34 * clamp(p * 2);
      g.strokeStyle = 'rgba(255,255,255,0.30)';
      g.lineWidth = Math.max(1.5, L.tMicro * 0.055);
      g.beginPath();
      // stop at each node's edge so lines never run under the disc
      const ux = dx / len, uy = dy / len;
      const sx = px(A) + ux * nr(A) * p, sy = py(A) + uy * nr(A) * p;
      const tx = px(B) - ux * nr(B) * p, ty = py(B) - uy * nr(B) * p;
      const cut = Math.min(1, Math.max(0, (ex - sx) / Math.max(1, tx - sx)));
      g.moveTo(sx, sy);
      g.lineTo(lerp(sx, tx, cut), lerp(sy, ty, cut));
      g.stroke();
      g.restore();
    });

    // nodes
    NODES.forEach((n) => {
      const p = nodeP(n, tt);
      if (p <= 0.004) return;
      const r = nr(n) * lerp(0.5, 1, p);
      const x = px(n), y = py(n);
      const core = n.kind === 'core';
      g.save();
      g.globalAlpha = clamp(p * 2);
      if (core) {
        g.shadowColor = 'rgba(220,38,38,0.6)'; g.shadowBlur = r * 1.1 * p;
      }
      g.fillStyle = core ? C.crimson : (n.kind === 'topic' ? C.surfaceHi : 'rgba(18,19,26,0.9)');
      g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = core ? 'rgba(239,68,68,0.7)' : C.line;
      g.lineWidth = Math.max(2, L.tMicro * 0.075);
      g.stroke();
      // ring pulse on arrival
      if (p < 1) {
        g.globalAlpha = (1 - p) * 0.7;
        g.strokeStyle = core ? C.crimsonHi : C.bone;
        g.lineWidth = Math.max(2, L.tMicro * 0.09);
        g.beginPath(); g.arc(x, y, r * (1 + (1 - p) * 1.9), 0, TAU); g.stroke();
      }
      g.restore();
      if (core) {
        text(g, n.label, x, y + r * 2.1, {
          font: F.mono(700, L.tSmall * 0.66), fill: C.bone, track: 0.06, alpha: clamp(p * 2),
        });
      } else if (n.kind === 'topic') {
        text(g, n.label, x, y + r * 1.9, {
          font: F.mono(500, L.tMicro), fill: C.boneDim, track: 0.04, alpha: clamp(p * 2),
        });
      }
    });
    vignette(g, L, 0.58);
    return;
  }

  // ---- 8-18s: the path lights up and the count lands.
  if (tt < 18.5) {
    const dt = tt - 8.0;
    const a = env(tt, 8.0, 18.5, 0.4);
    // dim the unlit graph so the path reads
    g.save(); g.globalAlpha = 0.55 * a;
    EDGES.forEach(([x, y]) => {
      const A = byId[x], B = byId[y];
      g.strokeStyle = 'rgba(255,255,255,0.34)';
      g.lineWidth = Math.max(2, L.tMicro * 0.07);
      g.beginPath();
      const dx = px(B) - px(A), dy = py(B) - py(A), len = Math.hypot(dx, dy);
      const ux = dx / len, uy = dy / len;
      g.moveTo(px(A) + ux * nr(A), py(A) + uy * nr(A));
      g.lineTo(px(B) - ux * nr(B), py(B) - uy * nr(B));
      g.stroke();
    });
    NODES.forEach((n) => {
      g.fillStyle = n.kind === 'core' ? 'rgba(220,38,38,0.55)' : 'rgba(30,32,42,0.95)';
      g.beginPath(); g.arc(px(n), py(n), nr(n), 0, TAU); g.fill();
    });
    g.restore();

    // the traversal
    for (let i = 0; i < PATH.length - 1; i++) {
      const A = byId[PATH[i]], B = byId[PATH[i + 1]];
      const start = 0.5 + i * 1.5;
      const p = clamp(spring(dt - start, 190, 24));
      if (p <= 0.004) continue;
      const dx = px(B) - px(A), dy = py(B) - py(A), len = Math.hypot(dx, dy);
      const ux = dx / len, uy = dy / len;
      const sx = px(A) + ux * nr(A), sy = py(A) + uy * nr(A);
      const ex = px(B) - ux * nr(B) * p, ey = py(B) - uy * nr(B) * p;
      g.save();
      g.globalAlpha = a * 0.95;
      g.strokeStyle = C.crimson;
      g.lineWidth = Math.max(3, L.tMicro * 0.14);
      g.lineCap = 'round';
      g.shadowColor = 'rgba(220,38,38,0.7)'; g.shadowBlur = L.tMicro * 0.5;
      g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.stroke();
      g.restore();
      // a dot travelling the edge
      if (p < 1) {
        const q = smooth(p);
        g.save();
        g.globalAlpha = a;
        g.fillStyle = C.bone;
        g.beginPath(); g.arc(lerp(sx, ex, q), lerp(sy, ey, q), L.tMicro * 0.26, 0, TAU); g.fill();
        g.restore();
      }
      // label the hop
      const lx = lerp(sx, ex, 0.5), ly = lerp(sy, ey, 0.5);
      text(g, String(i + 1), lx, ly - L.tMicro * 0.6, {
        font: F.mono(700, L.tMicro), fill: C.crimsonHi, track: 0.04, alpha: a * clamp(p * 1.6),
      });
    }
    // Lit nodes on the path, so every hop lands on something visible.
    PATH.forEach((id, i) => {
      const n = byId[id];
      const lp = clamp(spring(dt - 0.3 - i * 1.5, 240, 22));
      if (lp <= 0.004) return;
      g.save();
      g.globalAlpha = a * clamp(lp * 2);
      g.shadowColor = 'rgba(220,38,38,0.6)'; g.shadowBlur = nr(n) * 0.7;
      g.fillStyle = C.crimson;
      g.beginPath(); g.arc(px(n), py(n), nr(n) * lerp(0.6, 1, lp), 0, TAU); g.fill();
      g.shadowColor = 'transparent';
      g.restore();
      text(g, n.label, px(n), py(n) + nr(n) * 1.95, {
        font: F.mono(700, L.tMicro * 1.05), fill: C.bone, track: 0.05, alpha: a * clamp(lp * 2),
      });
    });
    // step labels, positioned under the node they belong to
    const steps = ['Diagnose', 'Isolate', 'Rebuild'];
    steps.forEach((s, i) => {
      const n = byId[PATH[i]];
      const sp = clamp(spring(dt - 0.4 - i * 1.5, 220, 24));
      const x = clamp(px(n), L.w * 0.16, L.w * 0.84);
      text(g, s, x, L.h * 0.775, {
        font: fitText(g, s, F.mono(700, L.tSmall * 0.58), 0.08, L.w * 0.26).font,
        fill: i === 2 ? C.crimsonHi : C.bone, track: 0.08, alpha: a * sp,
      });
      g.save(); g.globalAlpha = a * sp * 0.45;
      g.fillStyle = C.line;
      g.fillRect(x - L.w * 0.06, L.h * 0.795, L.w * 0.12, 1);
      g.restore();
    });
    const cp = clamp(spring(dt - 3.2, 200, 24));
    text(g, 'Three hops. That is the whole syllabus.', L.cx, L.h * 0.855, {
      font: fitText(g, 'Three hops. That is the whole syllabus.', F.mono(500, L.tSmall * 0.70), 0.02, L.w - L.mx * 2.4).font,
      fill: C.boneDim, track: 0.02, alpha: a * cp,
    });
    vignette(g, L, 0.55);
    return;
  }

  // ---- 18.5s+: brand last.
  const dt = tt - 18.5;
  const a = env(tt, 18.5, DURF, 0.45);
  const bp = clamp(spring(dt, 160, 24));
  g.save(); g.globalAlpha = a * bp;
  g.translate(L.cx, L.h * 0.315); g.scale(lerp(0.85, 1, bp), lerp(0.85, 1, bp));
  brandMonogram(g, 0, 0, L.tBig * 0.95);
  g.restore();
  g.save(); g.globalAlpha = a * clamp(spring(dt - 0.28, 170, 26));
  setType(g, F.display(650, L.tBig * 0.44), 0.16);
  g.textAlign = 'center'; g.fillStyle = C.bone;
  g.fillText('AHMED ACADEMY', L.cx, L.h * 0.445);
  g.restore();
  rule(g, L, L.cx, L.h * 0.482, L.tBig * 1.9, clamp(spring(dt - 0.45, 300, 20)), { thick: Math.max(2, L.tMicro * 0.16) });
  block(g, 'I did it', L.cx, L.h * 0.575, {
    font: F.display(300, L.tBig * 0.62), track: -0.04, lh: L.tBig * 0.74,
    fill: C.boneDim, align: 'center', maxW: L.w - L.mx * 2, alpha: clamp(spring(dt - 0.6, 180, 25)),
  });
  block(g, 'so I will show you.', L.cx, L.h * 0.575 + L.tBig * 0.74, {
    font: F.display(800, L.tBig * 0.62), track: -0.045, lh: L.tBig * 0.74,
    fill: C.crimson, align: 'center', maxW: L.w - L.mx * 2, alpha: clamp(spring(dt - 0.72, 180, 25)),
  });
  ctaPill(g, L, L.cx, L.h * 0.815, 0.86, clamp(spring(dt - 0.95, 200, 24)));
  footRail(g, L, clamp(spring(dt - 1.2, 160, 28)));
  grain(g, L, tt, 7);
  vignette(g, L, 0.6);
}

export const sfx = [
  { t: 0.02, type: 'swell' },
  { t: 0.4, type: 'thump' },
  { t: 2.2, type: 'pop' }, { t: 2.7, type: 'pop' },
  { t: 3.2, type: 'pop' }, { t: 3.7, type: 'pop' },
  { t: 5.2, type: 'tick' }, { t: 5.6, type: 'tick' },
  { t: 6.0, type: 'tick' }, { t: 6.4, type: 'tick' },
  { t: 8.0, type: 'whoosh' },
  { t: 8.5, type: 'click' }, { t: 10.0, type: 'click' },
  { t: 11.5, type: 'hit' },
  { t: 18.5, type: 'swell' },
  { t: 20.4, type: 'pop' },
  { t: 22.0, type: 'hit' },
];
