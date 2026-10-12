// FILM 09 — "THE ROOM" · generate-then-trace hybrid
// The GPU route. A diffusion model generates a photographic base plate on the GPU;
// this file then REDRAWS the entire film in code on top of it, so the viewer only
// ever sees the code-drawn graphic layer over generated texture. That is the
// "generate-then-trace" trick, and it is the one thing the CPU pipeline cannot do.
//
// If the plates are absent (no GPU run), every plate falls back to a procedural
// gradient so the film still renders, still loops, and is still honest about it.
import { C, F, bg, vignette, grain, text, block, setType, rule, hairline,
         brandMonogram, monogram, wordmark, ctaPill, footRail, fitText, ghostNumeral } from '../lib/brand.js';
import { clamp, lerp, inv, smooth, spring, env, rng, makeNoise, TAU } from '../lib/motion.js';

const DUR = 30;
const noise = makeNoise(2026);

// Plates the GPU pass writes into ./assets/
export const assets = ['room.png', 'paper.png', 'brand_logo.png'];

let PLATE = { room: null, paper: null };
export function setup() {
  // index.html preloads these; if the GPU never ran they simply stay incomplete.
  PLATE.room = document.querySelector ? null : null;
}

// Resolve lazily: the film must never throw if an asset is missing.
function img(name) {
  const el = new Image();
  el.src = '/assets/' + name;
  return (el.complete && el.naturalWidth > 0) ? el : null;
}
let CACHE = null;
function plates() {
  if (CACHE) return CACHE;
  CACHE = { room: img('room.png'), paper: img('paper.png') };
  return CACHE;
}

// Cover-fit a plate into a rect, cropped to fill and centred.
function cover(g, el, x, y, w, h, zoom = 1, ox = 0.5, oy = 0.5) {
  if (!el) return false;
  const ir = el.naturalWidth / el.naturalHeight;
  const rr = w / h;
  let dw = w, dh = h;
  if (ir > rr) dw = h * ir; else dh = w / ir;
  dw *= zoom; dh *= zoom;
  g.drawImage(el, x + w * ox - dw / 2, y + h * oy - dh / 2, dw, dh);
  return true;
}

// Draw a plate into a parallax plane, so generated art gets real depth too.
function platePlane(g, L, el, t, depth, { alpha = 1, dim = 0.35, zoom0 = 1.02, zoom1 = 1.16 } = {}) {
  if (!el) return false;
  const p = clamp((t - 0.2) / (DUR - 2));
  const z = lerp(zoom0, zoom1, smooth(p));
  const dx = Math.sin(t * 0.34) * L.w * 0.012 * depth;
  const dy = Math.cos(t * 0.29) * L.h * 0.010 * depth;
  g.save();
  g.globalAlpha = alpha;
  cover(g, el, -dx, -dy, L.w + Math.abs(dx) * 2, L.h + Math.abs(dy) * 2, z);
  // Knock the plate back toward obsidian so the crimson layer always wins.
  if (dim > 0) {
    g.globalAlpha = alpha * dim;
    g.fillStyle = C.obsidian;
    g.fillRect(0, 0, L.w, L.h);
  }
  g.restore();
  return true;
}

const SC = [
  // 0-9s: the room resolves out of black. Hook first, no brand.
  { frm: 0, to: 9, draw(g, L, t, dt) {
      const P = plates();
      const a = clamp(spring(dt - 0.15, 110, 24));
      if (!platePlane(g, L, P.room, t, 1.0, { alpha: a, dim: 0.46 })) {
        // procedural fallback: a warm pool of light on obsidian
        g.save(); g.globalAlpha = a;
        const rg = g.createRadialGradient(L.cx, L.h * 0.58, 20, L.cx, L.h * 0.58, L.w * 0.95);
        rg.addColorStop(0, '#2a2118'); rg.addColorStop(0.5, '#141118'); rg.addColorStop(1, '#08080a');
        g.fillStyle = rg; g.fillRect(0, 0, L.w, L.h); g.restore();
      }
      // horizon line that draws itself: our layer over the generated base
      dim(g, L, L.cx, L.h * 0.605, L.w * 0.52, dt, { color: C.crimson });
      text(g, 'WHERE THE WORK ACTUALLY HAPPENS', L.cx, L.h * 0.155, {
        font: fitText(g, 'WHERE THE WORK ACTUALLY HAPPENS', F.mono(700, L.tSmall * 0.74), 0.18, L.w * 0.80).font,
        fill: C.boneDim, alpha: clamp(spring(dt - 1.2, 180, 26)), track: 0.18,
      });
      kineticWords(g, L, dt, 1.9, ['NOT', 'THE', 'HIGHLIGHTER.'], L.h * 0.415, L.tHero * 0.72, C.bone);
      kineticWords(g, L, dt, 2.5, ['THE', 'DESK.'], L.h * 0.560, L.tHero, C.crimson);
      vignette(g, L, 0.62);
      grain(g, L, t, 8);
    }},
  // 9-19s: the argument, over the plate, with three measured callouts.
  { frm: 9, to: 19, draw(g, L, t, dt) {
      const P = plates();
      const a = env(t, 9, 19, 0.45);
      if (!platePlane(g, L, P.room, t, 1.0, { alpha: a, dim: 0.56, zoom1: 1.22 })) {
        bg(g, L, t);
      }
      g.save(); g.globalAlpha = a * 0.9;
      block(g, 'Everything I ask', L.cx, L.h * 0.255, {
        font: F.display(300, L.tBig * 0.66), lh: L.tBig * 0.78, fill: C.boneDim,
        track: -0.035, align: 'center', maxW: L.w * 0.84, alpha: clamp(spring(dt, 190, 26)),
      });
      block(g, 'a student does,', L.cx, L.h * 0.255 + L.tBig * 0.78, {
        font: F.display(300, L.tBig * 0.66), lh: L.tBig * 0.78, fill: C.boneDim,
        track: -0.035, align: 'center', maxW: L.w * 0.84, alpha: clamp(spring(dt - 0.12, 190, 26)),
      });
      block(g, 'I have seen before.', L.cx, L.h * 0.255 + L.tBig * 1.56, {
        font: F.display(800, L.tBig * 0.66), lh: L.tBig * 0.78, fill: C.crimson,
        track: -0.04, align: 'center', maxW: L.w * 0.84, alpha: clamp(spring(dt - 0.24, 190, 26)),
      });
      const items = ['the pause before they answer', 'the wrong method they trust', 'the topic they avoid'];
      items.forEach((s, i) => {
        const it = clamp(spring(dt - 0.5 - i * 0.22, 235, 24));
        if (it <= 0.004) return;
        const y = L.h * 0.615 + i * L.tSmall * 1.75;
        g.save(); g.globalAlpha = a * clamp(it * 2);
        g.fillStyle = 'rgba(10,10,12,0.62)';
        g.beginPath(); g.roundRect(L.mx, y, (L.w - L.mx * 2) * it, L.tSmall * 1.28, L.tSmall * 0.22); g.fill();
        g.strokeStyle = C.crimson; g.lineWidth = Math.max(2, L.tMicro * 0.10);
        g.beginPath(); g.roundRect(L.mx, y, (L.w - L.mx * 2) * it, L.tSmall * 1.28, L.tSmall * 0.22); g.stroke();
        g.restore();
        text(g, s, L.mx + L.tSmall * 0.55, y + L.tSmall * 0.84, {
          font: fitText(g, s, F.mono(600, L.tSmall * 0.74), 0.02, L.w - L.mx * 2 - L.tSmall * 1.1).font,
          fill: C.bone, align: 'left', alpha: clamp(it * 2.2),
        });
      });
      g.restore();
      vignette(g, L, 0.58);
      grain(g, L, t, 8);
    }},
  // 19-30s: brand last, over the paper plate.
  { frm: 19, to: 30, draw(g, L, t, dt) {
      const P = plates();
      const a = env(t, 19, 30, 0.45);
      if (!platePlane(g, L, P.paper, t, 0.55, { alpha: a * 0.95, dim: 0.62, zoom1: 1.10 })) {
        bg(g, L, t);
      }
      g.save(); g.globalAlpha = a * clamp(spring(dt, 160, 24));
      g.translate(L.cx, L.h * 0.300); g.scale(lerp(0.85, 1, clamp(spring(dt, 160, 24))), lerp(0.85, 1, clamp(spring(dt, 160, 24))));
      brandMonogram(g, 0, 0, L.tBig * 1.05);
      g.restore();
      g.save(); g.globalAlpha = a * clamp(spring(dt - 0.28, 170, 26));
      setType(g, F.display(650, L.tBig * 0.46), 0.16);
      g.textAlign = 'center'; g.fillStyle = C.bone;
      g.fillText('AHMED ACADEMY', L.cx, L.h * 0.435);
      g.restore();
      text(g, 'YOU HAVE THE POTENTIAL. I HAVE THE FORMULA.', L.cx, L.h * 0.485, {
        font: fitText(g, 'YOU HAVE THE POTENTIAL. I HAVE THE FORMULA.', F.mono(600, L.tSmall * 0.80), 0.10, L.w * 0.84).font,
        fill: C.boneDim, alpha: clamp(spring(dt - 0.5, 180, 26)), track: 0.10,
      });
      const rows = [['A*A*AAA', 'at A-Level'], ['Manchester · Edinburgh', 'university offers'], ['Straight 9s and 8s', 'tutored subjects']];
      rows.forEach((r, i) => {
        const rp = clamp(spring(dt - 0.7 - i * 0.15, 230, 24));
        const y = L.h * 0.560 + i * L.tSmall * 1.55;
        text(g, r[0], L.mx, y, {
          font: fitText(g, r[0], F.display(700, L.tSmall * 0.94), -0.02, L.w * 0.50).font,
          fill: C.bone, align: 'left', alpha: rp,
        });
        text(g, r[1], L.w - L.mx, y, { font: F.mono(500, L.tMicro), fill: C.boneDim, align: 'right', alpha: rp });
        g.save(); g.globalAlpha = rp * 0.55;
        g.fillStyle = C.line; g.fillRect(L.mx, y + L.tSmall * 0.34, L.w - L.mx * 2, 1);
        g.restore();
      });
      ctaPill(g, L, L.cx, L.h * 0.855, 0.80, clamp(spring(dt - 1.15, 200, 24)));
      footRail(g, L, clamp(spring(dt - 1.4, 160, 28)));
      vignette(g, L, 0.60);
      grain(g, L, t, 8);
    }},
];

// Local helpers (kept here so this film needs nothing extra from brand.js)
function dim(g, L, cx, y, w, t, { color = C.crimson } = {}) {
  const e = smooth(clamp((t - 0.6) / 1.4));
  if (e <= 0.002) return;
  g.save();
  g.globalAlpha = 0.85 * e;
  g.fillStyle = color;
  g.fillRect(cx - w * e / 2, y, w * e, Math.max(2, L.tMicro * 0.14));
  g.restore();
}

function kineticWords(g, L, dt, t0, words, y, size, fill) {
  const font = F.display(800, size);
  g.save();
  setType(g, font, -0.05);
  const widths = words.map(w => g.measureText(w).width);
  const space = size * 0.24;
  const total = widths.reduce((a, b) => a + b, 0) + space * (words.length - 1);
  let x = L.cx - total / 2;
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  words.forEach((w, i) => {
    const s = clamp(spring(dt - t0 - i * 0.055, 205, 22));
    g.save();
    g.globalAlpha *= clamp(s * 2.2);
    g.translate(x + widths[i] / 2, y + (1 - s) * size * 0.30);
    const sc = lerp(0.93, 1, s);
    g.scale(sc, sc);
    g.fillStyle = fill;
    g.fillText(w, -widths[i] / 2, 0);
    g.restore();
    x += widths[i] + space;
  });
  g.restore();
}

export function draw(g, L, t, DURF) {
  const tt = ((t % DURF) + DURF) % DURF;
  bg(g, L, tt);
  for (const s of SC) if (tt >= s.frm && tt < s.to) { s.draw(g, L, tt, tt - s.frm); return; }
}

export const sfx = [
  { t: 0.02, type: 'swell' },
  { t: 1.9, type: 'pop' }, { t: 2.05, type: 'tick' },
  { t: 2.5, type: 'hit' }, { t: 2.65, type: 'tick' },
  { t: 9.0, type: 'whoosh' },
  { t: 9.6, type: 'pop' }, { t: 10.2, type: 'tick' },
  { t: 11.0, type: 'hit' }, { t: 11.9, type: 'tick' }, { t: 12.8, type: 'pop' },
  { t: 19.0, type: 'swell' },
  { t: 20.6, type: 'pop' },
  { t: 21.8, type: 'tick' }, { t: 22.8, type: 'hit' },
  { t: 24.4, type: 'tick' },
];
