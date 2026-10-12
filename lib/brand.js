// Ahmed Academy brand layer. Single source of truth for palette, type and layout.
// Colours come from the brand blueprint: Obsidian & Crimson (flagship dark mode).

import { plate, containFit } from './assets.js';

export const C = {
  obsidian: '#0a0a0c',
  surface: '#12131a',
  surfaceHi: '#1a1c26',
  crimson: '#dc2626',
  crimsonHi: '#ef4444',
  crimsonDim: '#7f1d1d',
  bone: '#f5f5f4',
  boneDim: '#a1a1aa',
  line: 'rgba(255,255,255,0.10)',
  gold: '#e8b64c',
};

// One display face, one UI face. Display = Geist (tight tracking), UI = Geist Mono.
export const F = {
  display: (w, s) => `${w} ${s}px Geist, "Inter", "Noto Sans", system-ui, sans-serif`,
  // Chromium does NOT resolve "Geist Mono" here: a canvas asking for it falls
  // back to proportional Geist (measured: identical advance for 'i' and 'W').
  // Every mono label in the studio was therefore rendering as body sans. These
  // two families measure 0.60em per glyph and do resolve.
  mono: (w, s) => `${w} ${s}px "Liberation Mono", "DejaVu Sans Mono", ui-monospace, monospace`,
};

// Layout as a FUNCTION of format, never fixed pixels. One film, three aspects.
// Type and UI are re-laid-out per aspect, not cropped.
export const FORMATS = {
  '9x16': { w: 1080, h: 1920, name: 'vertical' },
  '1x1': { w: 1080, h: 1080, name: 'square' },
  '16x9': { w: 1920, h: 1080, name: 'wide' },
};

export function layout(fmt) {
  const F0 = FORMATS[fmt];
  const S = F0.h / 1920; // type scale relative to the 9:16 master
  const vert = F0.h > F0.w * 1.2;
  const wide = F0.w > F0.h * 1.2;
  return {
    fmt, w: F0.w, h: F0.h, S, vert, wide,
    // Safe margins: generous on vertical, wider on 16:9 for action-safe titles.
    mx: Math.round(F0.w * (vert ? 0.10 : 0.075)),
    my: Math.round(F0.h * 0.085),
    // Optical centre: slightly above true centre reads as composed, not dropped.
    cx: F0.w / 2,
    cy: F0.h * (vert ? 0.46 : 0.48),
    safeTop: Math.round(F0.h * 0.12),
    safeBot: Math.round(F0.h * 0.88),
    // Type scale. Vertical reels need genuinely large type: at 1080x1920 a
    // hero line under ~180px reads as a caption, not a headline.
    tHero: Math.round(F0.w * (vert ? 0.190 : 0.105)),
    tBig: Math.round(F0.w * (vert ? 0.115 : 0.064)),
    tMid: Math.round(F0.w * (vert ? 0.068 : 0.037)),
    tSmall: Math.round(F0.w * (vert ? 0.036 : 0.019)),
    tMicro: Math.round(F0.w * (vert ? 0.0255 : 0.0135)),
    // Footer / CTA rail
    footY: Math.round(F0.h * (vert ? 0.905 : 0.90)),
  };
}

// --- Paint helpers ----------------------------------------------------------

export function bg(g, L, t = 0) {
  // Obsidian with a slow crimson breath. Never a flat gradient poster look:
  // the light source drifts so the frame has life even when nothing moves.
  const drift = Math.sin(t * 0.55) * 0.5 + 0.5;
  const g0 = g.createRadialGradient(
    L.cx + Math.cos(t * 0.22) * L.w * 0.30, L.cy * (0.82 + drift * 0.10), 0,
    L.cx, L.cy, Math.max(L.w, L.h) * 0.78
  );
  g0.addColorStop(0, C.surfaceHi);
  g0.addColorStop(0.55, C.obsidian);
  g0.addColorStop(1, '#050506');
  g.fillStyle = g0;
  g.fillRect(0, 0, L.w, L.h);
}

export function vignette(g, L, strength = 0.55) {
  const vg = g.createRadialGradient(L.cx, L.cy, Math.min(L.w, L.h) * 0.30, L.cx, L.cy, Math.max(L.w, L.h) * 0.72);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, `rgba(0,0,0,${strength})`);
  g.fillStyle = vg;
  g.fillRect(0, 0, L.w, L.h);
}

// Film grain. Static-per-frame but time-varying in a seeded way: keeps flat digital
// fills from banding and reads as "shot on something".
let _grainTile = null;
export function grain(g, L, t, amount = 9, seed = 7) {
  if (!_grainTile) _grainTile = makeGrainTile(256);
  const frame = Math.floor(t * 24);
  g.save();
  g.globalAlpha = amount / 255;
  g.globalCompositeOperation = 'overlay';
  const pat = g.createPattern(_grainTile, 'repeat');
  // Shift the tile per frame so grain actually moves, deterministically.
  const off = (seed * 9301 + frame * 49297) % 233280;
  g.translate(-(off % 256), -((off * 7) % 256));
  g.fillStyle = pat;
  g.fillRect(0, 0, L.w + 256, L.h + 256);
  g.restore();
}

function makeGrainTile(n) {
  const c = document.createElement('canvas');
  c.width = c.height = n;
  const x = c.getContext('2d');
  const d = x.createImageData(n, n);
  let s = 1234567;
  for (let i = 0; i < d.data.length; i += 4) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const v = 128 + ((s >>> 24) - 128) * 0.55;
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
    d.data[i + 3] = 255;
  }
  x.putImageData(d, 0, 0);
  return c;
}

// Tracking-aware text. ctx.letterSpacing handles it natively in Chromium.
export function setType(g, font, trackEm = -0.03) {
  g.font = font;
  g.letterSpacing = `${trackEm}em`;
}

export function text(g, str, x, y, { font, fill = C.bone, align = 'center', track = -0.03, baseline = 'alphabetic', alpha = 1, maxW } = {}) {
  g.save();
  g.globalAlpha *= alpha;
  setType(g, font, track);
  g.fillStyle = fill;
  g.textAlign = align;
  g.textBaseline = baseline;
  if (maxW) g.fillText(str, x, y, maxW); else g.fillText(str, x, y);
  g.restore();
}

// Greedy wrap by measured width. Returns lines.
export function wrap(g, str, font, track, maxW) {
  g.save();
  setType(g, font, track);
  const words = str.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (g.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  g.restore();
  return lines;
}

export function block(g, str, x, y, { font, track = -0.03, lh, fill = C.bone, align = 'center', alpha = 1, maxW }) {
  const lines = wrap(g, str, font, track, maxW);
  const step = lh ?? parseFloat(font.match(/(\d+(?:\.\d+)?)px/)[1]) * 1.14;
  g.save();
  g.globalAlpha *= alpha;
  setType(g, font, track);
  g.fillStyle = fill;
  g.textAlign = align;
  g.textBaseline = 'alphabetic';
  const x0 = align === 'center' ? x : align === 'right' ? x - g.measureText(lines[0]).width : x;
  lines.forEach((ln, i) => g.fillText(ln, x0, y + i * step));
  g.restore();
  return { lines: lines.length, step, height: lines.length * step };
}

export function measure(g, str, font, track) {
  g.save();
  setType(g, font, track);
  const w = g.measureText(str).width;
  g.restore();
  return w;
}

// Crimson rule that draws itself. Signature brand element.
export function rule(g, L, cx, y, w, p, { thick = 6, fill = C.crimson } = {}) {
  const ww = w * Math.min(1, Math.max(0, p));
  if (ww <= 0) return;
  g.save();
  g.fillStyle = fill;
  g.fillRect(cx - ww / 2, y, ww, thick);
  g.restore();
}

// AA monogram, drawn in code (not the raster logo) so it can morph and animate.
// Two distinct A's that TOUCH at the baseline: apex up, crossbar just below centre.
// Getting the crossbar height right is what makes it read "AA" and not "M".
export function monogram(g, x, y, size, { weight = 1, alpha = 1, stroke = C.crimson, fill = null } = {}) {
  g.save();
  g.translate(x, y);
  g.globalAlpha *= alpha;
  g.lineWidth = Math.max(2.5, size * 0.088 * weight);
  g.lineJoin = 'miter';
  g.lineCap = 'butt';
  g.strokeStyle = stroke;
  if (fill) g.fillStyle = fill;
  const u = size / 100;
  const P = (a, b) => [a * u, b * u];
  const letter = (cxo) => {
    // apex, base-left, base-right, crossbar-left, crossbar-right
    const ap = P(cxo, -52), bl = P(cxo - 27, 52), br = P(cxo + 27, 52);
    const cl = P(cxo - 17, 13), cr = P(cxo + 17, 13);
    g.beginPath(); g.moveTo(bl[0], bl[1]); g.lineTo(ap[0], ap[1]); g.lineTo(br[0], br[1]); g.stroke();
    g.beginPath(); g.moveTo(cl[0], cl[1]); g.lineTo(cr[0], cr[1]); g.stroke();
  };
  letter(-30);
  letter(30);
  g.restore();
}

// Stacked AHMED / ACADEMY wordmark with the hairline crimson rule between.
export function wordmark(g, L, cx, cy, s, { alpha = 1, track = 0.16 } = {}) {
  const fs = Math.round(L.tSmall * s);
  g.save();
  g.globalAlpha *= alpha;
  setType(g, F.display(600, fs), track);
  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  g.fillStyle = C.bone;
  g.fillText('AHMED', cx, cy);
  const w1 = g.measureText('AHMED').width;
  setType(g, F.display(300, fs), track);
  g.fillStyle = C.boneDim;
  g.fillText('ACADEMY', cx, cy + fs * 1.32);
  const w2 = g.measureText('ACADEMY').width;
  g.restore();
  const ruleW = Math.max(w1, w2) * 1.06;
  g.save();
  g.globalAlpha *= alpha;
  g.fillStyle = C.crimson;
  g.fillRect(cx - ruleW / 2, cy - fs * 1.02, ruleW, Math.max(2, fs * 0.055));
  g.restore();
}

// CTA pill. Real action, reads at 360px.
export function ctaPill(g, L, cx, y, s, p, { label = 'Book a free diagnostic', sub = 'musaahmed.uk/academy' } = {}) {
  const p2 = Math.min(1, Math.max(0, p));
  if (p2 <= 0.001) return;
  const fs = Math.round(L.tMid * 0.92 * s);
  const pw = Math.round(fs * 11.6), ph = Math.round(fs * 2.6);
  const w = pw * (0.86 + 0.14 * p2);
  g.save();
  g.globalAlpha *= p2;
  g.translate(cx - w / 2, y - ph / 2);
  const grd = g.createLinearGradient(0, 0, 0, ph);
  grd.addColorStop(0, C.crimsonHi);
  grd.addColorStop(1, C.crimson);
  g.fillStyle = grd;
  g.beginPath();
  g.roundRect(0, 0, w, ph, ph * 0.22);
  g.fill();
  g.fillStyle = '#fff';
  setType(g, F.display(700, fs * 0.62), -0.015);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(label, w / 2, ph * 0.40);
  setType(g, F.mono(500, fs * 0.42), 0.02);
  g.fillStyle = 'rgba(255,255,255,0.90)';
  g.fillText(sub, w / 2, ph * 0.73);
  g.restore();
}

// Persistent footer rail: monogram + domain. Brand last, so it only earns opacity late.
// The foot rail carries the OFFICIAL logo plate, composited — the same
// assets/brand_logo.png the reels and posters use.
//
// It used to call `monogram()`, which strokes an approximate AA out of paths. That
// lookalike is why "the motion graphics doesn't use my official logo" was true of every
// film in the daily pool: the mark was drawn, never composited, so it never matched the
// supplied silver-and-crimson plate and could not match the posters. `monogram()` is kept
// below as the pre-load fallback so a frame drawn before the plate decodes still shows a
// mark rather than a gap.
export function footRail(g, L, a, label = 'musaahmed.uk/academy') {
  if (a <= 0.002) return;
  const size = L.tMicro * 1.1;
  g.save();
  g.globalAlpha *= a;
  const lg = plate('brand_logo.png');
  // containFit fits the WHOLE plate (monogram + stacked wordmark) into the square, so the
  // mark reads at this size. If it cannot be placed, fall back to the drawn monogram.
  if (!lg || !containFit(g, lg, L.mx + L.tMicro * 0.62, L.footY, size * 2.1)) {
    monogram(g, L.mx + L.tMicro * 0.62, L.footY, size, { alpha: 0.9, weight: 0.9 });
  }
  g.restore();
  text(g, label, L.mx + L.tMicro * 2.6, L.footY + L.tMicro * 0.36, {
    font: F.mono(500, L.tMicro), fill: C.boneDim, align: 'left', track: 0.02, alpha: a,
  });
}

// 1px crimson hairline, the structural motif used to divide beats.
export function hairline(g, L, y, a = 1) {
  if (a <= 0.002) return;
  g.save();
  g.globalAlpha = a;
  g.fillStyle = C.line;
  g.fillRect(L.mx, y, L.w - L.mx * 2, 1);
  g.restore();
}

// Huge outlined numeral set into the lower third. Fills the frame with structure
// without competing with the message, and drifts on its own slow spring.
export function ghostNumeral(g, L, str, x, y, size, p, { alpha = 0.13, stroke = C.crimson } = {}) {
  const pp = clamp01(p);
  if (pp <= 0.004) return;
  g.save();
  g.globalAlpha = alpha * clamp01(pp * 1.8);
  g.translate(x + (1 - pp) * size * 0.10, y);
  g.scale(lerpN(0.97, 1, pp), lerpN(0.97, 1, pp));
  g.font = `800 ${size}px Geist, "Inter", sans-serif`;
  g.letterSpacing = '-0.06em';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.lineWidth = Math.max(2, size * 0.016);
  g.strokeStyle = stroke;
  g.strokeText(str, 0, 0);
  g.restore();
}

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerpN = (a, b, t) => a + (b - a) * t;

// Shrink-to-fit: keeps a label inside its container instead of spilling out of a
// pill or card. Returns the font actually used.
export function fitText(g, str, font, track, maxW, minScale = 0.55) {
  g.save();
  setType(g, font, track);
  let w = g.measureText(str).width;
  if (w <= maxW) { g.restore(); return { font, scale: 1 }; }
  // Sizes here are routinely fractional (L.tSmall * 0.96 = 37.44). A /(\d+)px/
  // pattern matches "44px" inside "37.44px", so it scaled the wrong digits and
  // the line overflowed its measure. Parse the whole number.
  const px = parseFloat(font.match(/(\d+(?:\.\d+)?)px/)[1]);
  const scale = Math.max(minScale, maxW / w);
  g.restore();
  return { font: font.replace(/(\d+(?:\.\d+)?)px/, `${Math.max(6, Math.round(px * scale))}px`), scale };
}

// The official mark, composited, for films that want a full brand beat rather than the
// small foot-rail mark. Replaces the drawn `monogram()` + `fillText('AHMED ACADEMY')`
// pair that 8 films used: those redrew a lookalike out of stroked paths, which is why
// "it doesn't use my official logo" was true of every one of them. The plate already
// carries the monogram AND the stacked wordmark, so callers drop both calls.
//
// cx/cy is the plate's centre; `width` is the plate's full width in layout units.
export function brandPlate(g, cx, cy, width, alpha = 1) {
  if (alpha <= 0.004) return;
  const lg = plate('brand_logo.png');
  if (!lg) return;                       // pre-load: caller should keep its fallback
  g.save();
  g.globalAlpha *= alpha;
  containFit(g, lg, cx, cy, width);
  g.restore();
}

// Same, but keeps the drawn mark as a fallback for the frames before the plate decodes.
export function brandPlateOrMonogram(g, cx, cy, width, alpha = 1, size = 0) {
  if (alpha <= 0.004) return;
  if (!brandPlate(g, cx, cy, width, alpha) && size > 0) {
    g.save();
    g.globalAlpha *= alpha;
    monogram(g, cx, cy, size, { stroke: C.crimson });
    g.restore();
  }
}

// Just the MONOGRAM out of the official plate, cropped from the plate itself (never
// redrawn). For the films that pair a brand beat's wordmark with a mark: those already
// set 'AHMED ACADEMY' as live type, which is fine, but they were DRAWING the AA beside
// it. This puts the real mark there while leaving each film's typography alone.
//
// The plate is a 1100x1100 PNG whose opaque bbox is roughly x[31,1070] y[57,1024]; the
// monogram is the top ~55% of that bbox. Those fractions are cut with an explicit
// drawImage source rect into a cached offscreen canvas.
//
// NOTE: `plate()` returns an HTMLImageElement, not a bitmap, so there is no getbbox() to
// call - the fractions below are why. An earlier version guarded on `lg.getbbox` and
// silently drew the WHOLE plate, which doubled the wordmark next to the film's own.
let MONO_PLATE = null;
function monoPlate() {
  if (MONO_PLATE !== null) return MONO_PLATE || null;
  const lg = plate('brand_logo.png');
  if (!lg || !lg.naturalWidth) return null;
  const L = 0.028, T = 0.052, R = 0.973, B = 0.535;
  const cv = document.createElement('canvas');
  cv.width = Math.max(1, Math.round(lg.naturalWidth * (R - L)));
  cv.height = Math.max(1, Math.round(lg.naturalHeight * (B - T)));
  const cx2 = cv.getContext('2d');
  if (!cx2) return null;
  cx2.drawImage(lg,
    lg.naturalWidth * L, lg.naturalHeight * T, lg.naturalWidth * (R - L), lg.naturalHeight * (B - T),
    0, 0, cv.width, cv.height);
  // containFit() reads naturalWidth/naturalHeight, which a canvas does not have.
  // Expose them so the shared helper can size it like any other plate.
  cv.naturalWidth = cv.width;
  cv.naturalHeight = cv.height;
  MONO_PLATE = cv;
  return cv;
}

export function brandMonogram(g, cx, cy, size, alpha = 1) {
  if (alpha <= 0.004) return false;
  const m = monoPlate();
  if (!m) return false;
  g.save();
  g.globalAlpha *= alpha;
  containFit(g, m, cx, cy, size);
  g.restore();
  return true;
}
