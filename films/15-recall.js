// REEL 5 - `15-recall` - "Re-reading is not revision."
//
// The first diagram-led reel in the set. Reels 11-14 all ran the same template
// (portrait plate -> karaoke question -> three glass cards -> proof rows -> CTA);
// this one carries a single actor - a sheet of paper - through eleven
// compositions, and it becomes every idea on the way: the page you re-read, the
// blank card you answer from memory, the chip on the rail, the card that returns
// on day 3, the one card left out of a whole chapter.
//
// MOTION: deliberately unhurried. The reviewer's note on the previous cut was that
// the animations were too fast to read, so every spring is slower and every reveal
// window is longer (see SLOW below). There is also NO camera push: a per-shot zoom
// that resets at each cut reads as zoom-in / zoom-out / zoom-in, which is exactly
// what was flagged. The graphics themselves carry the motion.
//
// BRAND: obsidian + crimson, per the locked spec in
// .agents/skills/academy-marketing/SKILL.md - "Obsidian #0a0a0c, crimson #dc2626,
// AA monogram watermark, stacked AHMED/ACADEMY type, musaahmed.uk/academy". The
// real transparent logo plate (assets/brand_logo.png) is composited, never redrawn.
// The previous cut's gold + cyan accent pair is gone.
//
// AUDIO: the bed is cut from 0:00 of the track, not from 25.5s into it, and the cut
// map is snapped to onsets measured in that opening.
//
// Everything is a pure function of t: no timers, no unseeded randomness.

import { F, text, fitText, setType, vignette, grain } from '../lib/brand.js';
import { clamp, lerp, smooth, spring as mspring, rng } from '../lib/motion.js';
import { plate, coverFit, containFit } from '../lib/assets.js';
import { PROOF } from '../lib/student-reel.js';

export const DURATION = 38.4;
export const assets = ['headshot_new.jpg', 'brand_logo.png'];

// --- pacing ------------------------------------------------------------------
// SLOW governs the reel's tempo: omega0 = sqrt(k), so dividing k by SLOW^2 and d
// by SLOW keeps every damping ratio identical and only makes it slower, and reveal
// windows stretch by the same factor.
//
// It is a function of ABSOLUTE time, not a constant. The opening runs far slower
// and then releases into the second half's tempo, so the film decelerates into its
// subject and settles once it reaches the ask. Set once per frame from draw(), so
// the whole film is still a pure function of t.
const SLOW_TAIL = 2.30;
const SLOW_OPEN = 3.60;
const REL_A = 18.0, REL_B = 19.0;      // the release, placed inside S5's tail
let SLOW = SLOW_TAIL;
function slowAt(t) {
  if (t < REL_A) return SLOW_OPEN;
  if (t >= REL_B) return SLOW_TAIL;
  return lerp(SLOW_OPEN, SLOW_TAIL, smooth((t - REL_A) / (REL_B - REL_A)));
}
const spring = (t, k = 170, d = 26) => mspring(t, k / (SLOW * SLOW), d / SLOW);
const inv = (t, a, b) => clamp((t - a) / ((b - a) * SLOW));
// For anything measured in absolute time - the two fly-throughs, and shot2's
// own exit fade - the tempo must NOT stretch the window.
const lin = (t, a, b) => clamp((t - a) / (b - a));

// --- palette -----------------------------------------------------------------
const OBSIDIAN = '#0a0a0c';
const SURFACE = '#14151b';
const CRIMSON = '#dc2626';
const CRIMSON_HI = '#ef4444';
const SILVER = '#c9ced7';
const BONE = '#f5f5f4';
const BONE_DIM = '#9aa0aa';
const PAPER = '#f2f2ef';
const PAPER_2 = '#dededa';

const INK = OBSIDIAN;
const GOLD = CRIMSON;        // local name kept: it is the film's one accent now
const GOLD_DEEP = '#8f1216';
const CYAN = SILVER;
const EMERALD = INK;
const ROSE = CRIMSON_HI;
const SLATE = BONE_DIM;
const INK_DEEP = SURFACE;
const PILL_INK = '#fdf4f3';

// --- shot map -----------------------------------------------------------------
// Shot boundaries. The two hard cuts are both fly-throughs: the outgoing actor
// scales past the camera with the next scene already painted underneath.
// Cuts are snapped to MEASURED onsets in the opening 24s of audio/halal.mp3
// (spectral-flux detection). Two boundaries fall inside a musical gap and are
// carried by a synthesised accent instead - see the sfx table below.
// The opening runs at SLOW_OPEN, so the first five shots are ~1.6x longer than the
// previous cut; the second half keeps its established durations. Boundaries are
// snapped to measured onsets in the track's opening; the ones inside a musical gap
// are carried by a synthesised accent.
const CREAM_END = 7.300;
const S1 = 4.200, S2 = 7.300, S3 = 10.200, S4 = 14.025, S5 = 18.982;
const S6 = 22.936, S7 = 25.900, S8 = 29.269, S9 = 35.387, S10 = 36.780;
const T_END = DURATION;

// Geometry shared by the brand arrival and the end card, so the logo that forms
// in S9 is the exact button the viewer is told to press in S10 and S11.
const CARD_CY = 0.400 * 1920;  // 768 — the recall card's centre-line, S3 and S4
const CARD_PAD = 62;            // the card's inner margin, shared by S3 and S4
const CAP_CY = 0.500 * 1920;   // 960 — button centre-line
const CAP_H = 190;
const LOCK_Y = 470;            // brand lockup centre (the plate carries its own wordmark)
const SUBJ_Y = 700;            // subject line under the lockup

const hexA = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${clamp(a)})`;
};

const font_px = (font) => parseFloat(String(font).match(/(\d+(?:\.\d+)?)px/)[1]);

// Springs everywhere, EXCEPT p <= 0.001, which is the "already on screen, do not
// animate me" convention (an element handed over from the previous shot at
// identical coordinates). Feeding 0.001 through a spring returns ~0.02, which
// silently draws everything at 4% alpha — so the convention has to be explicit.
const ease = (p, k = 190, d = 24) => (p === 0.001 ? 1 : clamp(spring(p, k, d)));

// --- grounds ------------------------------------------------------------------

function groundCream(g, L, t) {
  const gr = g.createLinearGradient(0, 0, 0, L.h);
  gr.addColorStop(0.00, '#f7f7f5');
  gr.addColorStop(0.34, PAPER);
  gr.addColorStop(0.72, PAPER_2);
  gr.addColorStop(1.00, '#d2d2ce');
  g.fillStyle = gr;
  g.fillRect(0, 0, L.w, L.h);
  const d = Math.sin(t * 0.5) * 0.5 + 0.5;
  const kl = g.createRadialGradient(
    L.cx + Math.cos(t * 0.20) * L.w * 0.22, L.h * (0.30 + d * 0.06), 40,
    L.cx, L.h * 0.36, L.w * 1.05);
  kl.addColorStop(0, 'rgba(255,255,255,0.55)');
  kl.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = kl;
  g.fillRect(0, 0, L.w, L.h);
}

function groundInk(g, L, t) {
  const gr = g.createLinearGradient(0, 0, 0, L.h);
  gr.addColorStop(0.00, '#1b1c22');
  gr.addColorStop(0.30, INK_DEEP);
  gr.addColorStop(0.62, OBSIDIAN);
  gr.addColorStop(1.00, '#050506');
  g.fillStyle = gr;
  g.fillRect(0, 0, L.w, L.h);
  const d = Math.sin(t * 0.34) * 0.5 + 0.5;
  const bl = g.createRadialGradient(
    L.cx + Math.cos(t * 0.17) * L.w * 0.26, L.h * (0.30 + d * 0.08), 30,
    L.cx, L.h * 0.34, L.w * 0.95);
  bl.addColorStop(0, hexA(CRIMSON, 0.20));
  bl.addColorStop(1, hexA(CRIMSON, 0));
  g.fillStyle = bl;
  g.fillRect(0, 0, L.w, L.h);
}

// One light source drifting across the whole film, at a constant rate. This is
// what keeps a held graphic frame alive now that there is no camera push: it is a
// luminance change, not a zoom, and because it never resets it cannot read as
// zoom-in / zoom-out. A soft diagonal band, 7% at its strongest on ink.
function lightSweep(g, L, t, cream) {
  const period = 13.0;
  const u = ((t % period) / period);
  const cx = lerp(-0.35, 1.35, u) * L.w;
  const w = L.w * 0.52;
  const gr = g.createLinearGradient(cx - w, 0, cx + w, L.h);
  const a = cream ? 0.10 : 0.085;
  gr.addColorStop(0.00, 'rgba(255,255,255,0)');
  gr.addColorStop(0.42, `rgba(255,255,255,${a})`);
  gr.addColorStop(0.58, `rgba(255,255,255,${a * 0.75})`);
  gr.addColorStop(1.00, 'rgba(255,255,255,0)');
  g.save();
  g.globalCompositeOperation = 'screen';
  g.fillStyle = gr;
  g.fillRect(0, 0, L.w, L.h);
  g.restore();
}

function finish(g, L, t, cream = false) {
  lightSweep(g, L, t, cream);
  vignette(g, L, cream ? 0.24 : 0.42);
  grain(g, L, t, cream ? 4 : 5);
}

// --- primitives ---------------------------------------------------------------

// Ragged ruled lines: what a page of notes looks like at 1:1. Seeded, so it is
// the same page every render.
function ruled(g, x, y, w, h, { rows = 40, seed = 7, alpha = 0.15, ink = INK } = {}) {
  const step = h / (rows - 1);
  const th = Math.max(2, step * 0.16);
  const r = rng(seed);
  g.save();
  for (let i = 0; i < rows; i++) {
    const lw = w * (0.58 + r() * 0.42);
    g.fillStyle = hexA(ink, alpha * (0.72 + r() * 0.28));
    g.fillRect(x, y + i * step, lw, th);
  }
  g.restore();
  return step;
}

// Fit a stack of lines to ONE shared size, so a block never looks assembled.
function fitBlock(g, lines, { weight = 800, size = 150, track = -0.035, maxW, lh = 1.06 } = {}) {
  g.save();
  setType(g, F.display(weight, size), track);
  let w = 0;
  for (const l of lines) w = Math.max(w, g.measureText(l).width);
  g.restore();
  const px = w > maxW ? Math.floor(size * (maxW / w)) : size;
  return { font: F.display(weight, px), size: px, lh: px * lh, height: (lines.length - 1) * px * lh + px };
}

// Text revealed by a hard-edged mask that wipes across. No fades: type either has
// arrived or has not, so a title is never half-legible.
function wipeText(g, L, str, x, y, p, { font, fill = '#ffffff', align = 'left', track = -0.03, dir = 1 } = {}) {
  // Alpha plus a rise, and NO clip region. Every mask variant tried here sliced
  // letters on one axis or the other — a horizontal mask cut the stems, a
  // vertical mask cut the x-height — and a half-erased headline always reads as
  // a bug rather than as motion. The rise is what the eye tracks.
  const t = clamp(p);
  if (t <= 0.001) return;
  const e = smooth(t);
  const fs = font_px(font);
  const rise = (1 - e) * fs * 0.17;
  g.save();
  g.globalAlpha *= e;
  setType(g, font, track);
  g.textAlign = align; g.textBaseline = 'alphabetic';
  g.fillStyle = fill;
  g.fillText(str, x, y - rise);
  g.restore();
}

// The actor. A sheet of paper: cream plate, hairline, one accent bar. Used at
// every scale in the film — page, card, chip, plan.
function sheet(g, L, x, y, w, h, p, { alpha = 1, accent = GOLD, radius = 14, shadow = true, tint = 0 } = {}) {
  const e = ease(p, 190, 24);
  if (e <= 0.004) return;
  g.save();
  g.globalAlpha *= alpha * clamp(e * 2);
  if (shadow) {
    g.save();
    g.shadowColor = 'rgba(0,0,0,0.42)';
    g.shadowBlur = L.tMid * 0.9;
    g.shadowOffsetY = L.tSmall * 0.28;
    g.fillStyle = PAPER;
    g.beginPath(); g.roundRect(x, y, w, h, radius); g.fill();
    g.restore();
  }
  g.fillStyle = PAPER;
  g.beginPath(); g.roundRect(x, y, w, h, radius); g.fill();
  // paper warmth: a corner falloff so it is a material, not a white box
  const pg = g.createLinearGradient(x, y, x + w * 0.35, y + h);
  pg.addColorStop(0, 'rgba(255,255,255,0.85)');
  pg.addColorStop(0.55, 'rgba(247,244,236,0)');
  pg.addColorStop(1, 'rgba(214,205,184,0.55)');
  g.fillStyle = pg;
  g.beginPath(); g.roundRect(x, y, w, h, radius); g.fill();
  g.strokeStyle = hexA(INK, 0.16);
  g.lineWidth = Math.max(1, L.tMicro * 0.035);
  g.beginPath(); g.roundRect(x, y, w, h, radius); g.stroke();
  if (tint > 0.004) {
    // paper in shadow. Without this, a stack of cream cards on a cream page is
    // invisible — the pile has to read as separate sheets.
    g.fillStyle = `rgba(24,20,14,${tint})`;
    g.beginPath(); g.roundRect(x, y, w, h, radius); g.fill();
  }
  if (accent) {
    g.fillStyle = accent;
    g.fillRect(x, y, Math.max(4, L.tMicro * 0.16), h);
  }
  g.restore();
}

// Glass chip: the house spec for anything that is UI rather than paper.
function chip(g, L, x, y, w, h, p, { accent = CYAN, alpha0 = 0.42, radius = 16 } = {}) {
  const e = ease(p, 260, 22);
  if (e <= 0.004) return 0;
  g.save();
  g.globalAlpha = clamp(e * 2);
  g.translate(lerp(-w * 0.20, 0, smooth(e)), 0);
  g.fillStyle = `rgba(2,6,23,${alpha0})`;
  g.beginPath(); g.roundRect(x, y, w * lerp(0.88, 1, e), h, radius); g.fill();
  g.strokeStyle = hexA(accent, 0.30);
  g.lineWidth = Math.max(1, L.tMicro * 0.03);
  g.beginPath(); g.roundRect(x, y, w * lerp(0.88, 1, e), h, radius); g.stroke();
  g.fillStyle = accent;
  g.fillRect(x, y, Math.max(4, L.tMicro * 0.14), h);
  g.restore();
  return clamp(e * 2);
}

function stationDot(g, L, x, y, r, p, colour) {
  const e = ease(p, 340, 18);
  if (e <= 0.004) return;
  g.save();
  g.globalAlpha = clamp(e * 2.2);
  g.translate(x, y);
  g.scale(lerp(0.2, 1, e), lerp(0.2, 1, e));
  g.fillStyle = colour;
  g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
  g.restore();
}

// Ghost numeral: outlined, set into the field so structure exists without noise.
function ghost(g, L, str, cx, cy, size, p, { alpha = 0.10, stroke = GOLD } = {}) {
  const e = ease(p, 150, 24);
  if (e <= 0.004) return;
  g.save();
  g.globalAlpha = alpha * clamp(e * 2);
  g.translate(cx, cy);
  g.font = `800 ${size}px Geist, "Inter", sans-serif`;
  g.letterSpacing = '-0.06em';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = Math.max(2, size * 0.014);
  g.strokeStyle = stroke;
  g.strokeText(str, 0, 0);
  g.restore();
}

// Real logo composited, never drawn. Falls back to a gold capsule.
function logoLock(g, L, cx, cy, size, p) {
  const lp = ease(p, 185, 24);
  if (lp <= 0.004) return;
  const lg = plate('brand_logo.png');
  if (!containFit(g, lg, cx, cy, size * lp)) {
    // the stacked wordmark, as the brand spec describes it
    const fs = Math.round(size * 0.20 * lp);
    g.save(); g.globalAlpha = lp;
    setType(g, F.display(600, fs), 0.18);
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.fillStyle = BONE;
    g.fillText('AHMED', cx, cy + fs * 0.36);
    setType(g, F.display(300, fs), 0.18);
    g.fillStyle = BONE_DIM;
    g.fillText('ACADEMY', cx, cy + fs * 1.52);
    g.fillStyle = CRIMSON;
    g.fillRect(cx - fs * 1.6, cy - fs * 0.72, fs * 3.2, Math.max(2, fs * 0.07));
    g.restore();
  }
}

function portrait(g, L, x, y, w, h, p, { radius = 14, alpha = 1 } = {}) {
  const e = ease(p, 185, 24), a = e * alpha;   // geometry from e, opacity from a
  if (a <= 0.004) return;
  const face = plate('headshot_new.jpg');
  const we = w * e, he = h * e;
  if (!coverFit(g, face, x, y, we, he, radius)) {
    g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(255,255,255,0.10)';
    g.beginPath(); g.roundRect(x, y, we, he, radius); g.fill(); g.restore();
  } else {
    g.save();
    g.beginPath(); g.roundRect(x, y, we, he, radius); g.clip();
    g.globalCompositeOperation = 'lighten';
    g.globalAlpha = 0.10 * a;
    g.fillStyle = '#7d8ea8';
    g.fillRect(x, y, we, he);
    g.restore();
  }
  g.save();
  g.globalAlpha = a;
  g.strokeStyle = GOLD;
  g.lineWidth = Math.max(2, L.tMicro * 0.10);
  g.beginPath(); g.roundRect(x, y, we, he, radius); g.stroke();
  g.restore();
  return a;
}

function monoTag(g, L, str, x, y, p, { fill = GOLD, track = 0.16, size, maxW } = {}) {
  const a = clamp(spring(p, 200, 26));
  if (a <= 0.004) return;
  const f = fitText(g, str, F.mono(700, size ?? L.tMicro * 0.95), track, maxW ?? (L.w - L.mx) - x);
  text(g, str, x, y, { font: f.font, fill, align: 'left', track, alpha: a });
}

export function setup() {}

// Audio. The 19 s bed supplies the pulse, but three cuts in this film (1.300,
// 3.600, 7.600) sit in a musical gap rather than on a measured onset — those get
// a soft synthesised accent so the edit still lands. Everything else is silent by
// design: no tick without a real action, no sting where the picture already works.
// Cuts 2.009 and 6.444 sit on measured onsets. The rest fall in a musical gap or
// land where a soft accent is what the viewer actually feels, so the cue is placed
// EARLY: the whoosh envelope peaks about 0.2s in, and an accent whose peak lands
// after the cut reads as a late accent.
export const sfx = [
  { t: 4.020, type: 'whoosh', gain: 0.50 },  // the page pulls back           @4.200
  { t: 7.060, type: 'whoosh', gain: 0.50 },  // the pile resolves             @7.300
  { t: 7.420, type: 'whoosh', gain: 0.50 },  // the sheet clears the frame
  { t: 10.000, type: 'hit', gain: 0.44 },    // the word becomes the card     @10.200
  { t: 13.820, type: 'hit', gain: 0.40 },    // the answer is written         @14.025
  { t: 18.760, type: 'whoosh', gain: 0.58 }, // the rail straightens          @18.982
  { t: 22.720, type: 'whoosh', gain: 0.52 }, // the loop becomes the axis     @22.936
  { t: 25.700, type: 'hit', gain: 0.38 },    // the paper lands               @25.900
  { t: 26.500, type: 'tick', gain: 0.30 },   // tick 1
  { t: 26.900, type: 'tick', gain: 0.30 },   // tick 2
  { t: 27.300, type: 'tick', gain: 0.30 },   // tick 3
  { t: 28.900, type: 'hit', gain: 0.40 },    // the card flies through        @29.269
  { t: 35.150, type: 'pop', gain: 0.52 },    // the logo becomes the button   @35.387
  { t: 36.600, type: 'click', gain: 0.32 },  // the handle seats on the card
  { t: 37.880, type: 'click', gain: 0.28 },
];

// =============================================================================
export function draw(g, L, t) {
  const M = L.mx, SW = L.w - L.mx * 2;
  SLOW = slowAt(t);        // the film's tempo for this frame

  if (t < CREAM_END) groundCream(g, L, t); else groundInk(g, L, t);

  if (t < S1) shot1(g, L, t, M, SW);
  else if (t < S2) shot2(g, L, t, M, SW);

  if (t >= S2) {
    if (t < S3) shot3(g, L, t, M, SW);
    else if (t < S4) shot4(g, L, t, M, SW);
    else if (t < S5) shot5(g, L, t, M, SW);
    else if (t < S6) shot6(g, L, t, M, SW);
    else if (t < S7) shot7(g, L, t, M, SW);
    else if (t < S8) shot8(g, L, t, M, SW);
    else if (t < S9) shot9(g, L, t, M, SW);
    else if (t < S10) shot10(g, L, t, M, SW);
    else shot11(g, L, t, M, SW);
  }

  if (t >= 6.660 && t < 7.560) flySheet(g, L, t, 6.660, 7.560, M, SW);
  if (t >= 28.060 && t < 29.720) flyCard(g, L, t, 28.060, 29.720, M, SW);

  finish(g, L, t, t < CREAM_END);
}

// --- S1 · page macro + the hook ----------------------------------------------
function shot1(g, L, t, M, SW) {
  const sx = M, sy = 230, sw = SW, sh = 1240;
  const pad = L.tMid * 0.7;

  monoTag(g, L, 'A-LEVEL  MATHS · PHYSICS · CS', M + 4, 168, 0.001,
    { fill: INK, track: 0.14, size: L.tMicro * 0.98, maxW: SW * 0.9 });

  g.save();
  sheet(g, L, sx, sy, sw, sh, 0.001, { accent: CRIMSON, radius: 16 });
  const step = ruled(g, sx + pad, sy + pad * 1.1, sw - pad * 2, sh - pad * 2.2,
    { rows: 46, seed: 71, alpha: 0.26, ink: INK });

  // the reading highlight: one person, one page, forty times
  const hp = smooth(inv(t, 0.05, 1.18));
  const ROWS = 46;
  const row = Math.min(ROWS - 1, Math.floor(hp * ROWS));
  const hy = sy + pad * 1.1 + row * step;
  g.save();
  g.globalAlpha = 0.26 * clamp(spring(t, 220, 24) * 2);
  g.fillStyle = CRIMSON;
  g.beginPath(); g.roundRect(sx + pad * 0.5, hy - step * 0.42, sw - pad * 1.0, step * 1.05, 6); g.fill();
  g.restore();
  // the counter rides the TOP of the page, not the highlight: riding the
  // highlight walked it straight into the panel's own label
  text(g, `READ ${String(row).padStart(2, '0')} / ${ROWS}`, sx + sw - pad, sy + pad * 1.5, {
    font: F.mono(700, L.tMicro * 1.05), fill: hexA(INK, 0.82), align: 'right', track: 0.06,
  });

  // the hook sits on a deliberate inset panel, the way a quote sits on a page
  const blk = fitBlock(g, ['RE-READING', 'IS NOT', 'REVISION.'], { size: 156, maxW: sw - pad * 1.7 });
  const bTop = sy + (sh - blk.height) / 2;
  const pTop = bTop - blk.size * 0.92, pH = blk.height + blk.size * 1.10;
  g.save();
  g.globalAlpha = 0.96;
  g.fillStyle = PAPER;
  g.beginPath(); g.roundRect(sx + pad * 0.5, pTop, sw - pad * 1.0, pH, 10); g.fill();
  g.restore();
  g.save();
  g.globalAlpha = 0.85; g.strokeStyle = hexA(GOLD, 0.55);
  g.lineWidth = Math.max(1, L.tMicro * 0.04);
  g.strokeRect(sx + pad * 0.5, pTop, sw - pad * 1.0, pH);
  g.restore();
  g.save();
  g.fillStyle = GOLD;
  g.fillRect(sx + pad * 0.5, pTop, Math.max(5, L.tMicro * 0.18), pH);
  g.restore();
  text(g, 'THE ONE LINE THAT MATTERS', L.cx, pTop - L.tSmall * 0.42, {
    font: fitText(g, 'THE ONE LINE THAT MATTERS', F.mono(700, L.tMicro * 1.10), 0.14, sw * 0.8).font,
    fill: hexA(INK, 0.52), align: 'center', track: 0.14,
  });

  ['RE-READING', 'IS NOT', 'REVISION.'].forEach((ln, i) => {
    const y = bTop + blk.size * 0.80 + i * blk.lh;
    // a per-line settle so the block breathes without ever half-entering
    const w = 1 + 0.012 * Math.sin(t * 1.6 - i * 0.7);
    g.save();
    g.translate(L.cx, y); g.scale(w, w); g.translate(-L.cx, -y);
    text(g, ln, L.cx, y, { font: blk.font, fill: INK, track: -0.035 });
    g.restore();
    if (i === 0) {
      const sp = smooth(inv(t, 0.18, 1.05));   // the strike
      g.save();
      setType(g, blk.font, -0.035);
      const lw = g.measureText(ln).width;
      g.restore();
      g.save();
      g.globalAlpha = clamp(sp * 2);
      g.fillStyle = CRIMSON_HI;
      g.fillRect(L.cx - lw / 2, y - blk.size * 0.30 - blk.size * 0.038, lw * sp, blk.size * 0.076);
      g.restore();
    }
  });
  g.restore(); // push group

  // the rest of the hook's payload — no dead zone under the page
  text(g, 'Forty pages. Recognised all of them.', L.cx, 1616, {
    font: fitText(g, 'Forty pages. Recognised all of them.', F.display(700, L.tSmall * 1.06), -0.01, SW).font,
    fill: hexA(INK, 0.80), alpha: clamp(spring(t - 0.26, 210, 26)), track: -0.01,
  });
  text(g, 'Not one of them recalled.', L.cx, 1682, {
    font: fitText(g, 'Not one of them recalled.', F.display(700, L.tSmall * 1.06), -0.01, SW).font,
    fill: ROSE, alpha: clamp(spring(t - 0.38, 210, 26)), track: -0.01,
  });
  g.save();
  g.globalAlpha = clamp(spring(t - 0.48, 300, 20));
  g.fillStyle = CRIMSON;
  g.fillRect(L.cx - SW * 0.16, 1734, SW * 0.32, Math.max(3, L.tMicro * 0.13));
  g.restore();
  text(g, 'A-LEVEL · GCSE · ENGLISH · SCIENCE · CS', L.cx, 1806, {
    font: fitText(g, 'A-LEVEL · GCSE · ENGLISH · SCIENCE · CS', F.mono(600, L.tMicro * 1.12), 0.10, SW * 0.94).font,
    fill: hexA(INK, 0.72), alpha: clamp(spring(t - 0.56, 200, 26)), track: 0.10,
  });
}

// --- S2 · pull back to the pile ----------------------------------------------
function shot2(g, L, t, M, SW) {
  const dt = t - S1;
  // the pile is already on its way out; the sheet is about to cover it
  g.save();
  g.globalAlpha *= 1 - smooth(lin(t, 7.100, 7.470));   // matches the fly-through at 6.66-7.56
  const pull = smooth(inv(dt, 0, 0.34));
  const cw = lerp(SW, SW * 0.415, pull);
  const ch = lerp(1240, 700, pull);
  const cx = L.cx, cy = L.h * 0.440;

  // the pile: six dim sheets, seeded, never random per frame
  const r = rng(913);
  for (let i = 0; i < 6; i++) {
    const a = (i / 5 - 0.5) * 1.0;
    const px = cx + a * cw * 0.92;
    const py = cy + (i % 2 ? 1 : -1) * ch * 0.062 + (i - 2.5) * ch * 0.016;
    const rot = a * 0.16 + (r() - 0.5) * 0.05;
    const al = clamp(spring(dt - 0.10 - i * 0.045, 220, 24)) * 0.85;
    if (al <= 0.004) continue;
    g.save();
    g.translate(px, py); g.rotate(rot); g.translate(-cx, -cy);
    g.globalAlpha *= al;   // multiply, or the group fade cannot reach this sheet
    sheet(g, L, cx - cw / 2, cy - ch / 2, cw, ch, 0.001, { accent: null, radius: 14, shadow: false, tint: 0.30 });
    g.restore();
  }

  // the actor, still the brightest thing on screen
  sheet(g, L, cx - cw / 2, cy - ch / 2, cw, ch, dt, { accent: GOLD, radius: 14 });
  ruled(g, cx - cw / 2 + cw * 0.08, cy - ch / 2 + ch * 0.10, cw * 0.84, ch * 0.16,
    { rows: 7, seed: 71, alpha: 0.16, ink: INK });
  // no invented statistic about the viewer: this is one chapter, not a number
  text(g, 'A whole chapter.', cx, cy + ch * 0.19, {
    font: fitBlock(g, ['A whole chapter.'], { weight: 800, size: 132, maxW: cw * 0.86 }).font,
    fill: INK, track: -0.035,
  });
  text(g, 'not one question answered', cx, cy + ch * 0.30, {
    font: fitText(g, 'not one question answered', F.mono(600, L.tSmall * 0.94), 0.02, cw * 0.90).font,
    fill: ROSE, track: 0.02,
  });

  // headline above the pile — two lines, one shared size
  const hb = fitBlock(g, ['This is what', 'revision looks like.'], { weight: 800, size: 132, maxW: SW });
  ['This is what', 'revision looks like.'].forEach((ln, i) => {
    wipeText(g, L, ln, L.cx, 330 + i * hb.lh, inv(dt, 0.02 + i * 0.10, 0.34 + i * 0.10), {
      font: hb.font, fill: INK, align: 'center', track: -0.035,
    });
  });
  wipeText(g, L, 'You read it. You recognised it.', L.cx, 1330, inv(dt, 0.30, 0.70), {
    font: F.display(700, L.tSmall * 1.14), fill: hexA(INK, 0.78), align: 'center', track: -0.01,
  });
  text(g, 'Recognition is not retrieval.', L.cx, 1406, {
    font: fitText(g, 'Recognition is not retrieval.', F.display(700, L.tSmall * 1.14), -0.01, SW).font,
    fill: INK, alpha: clamp(spring(dt - 0.92, 200, 26)), track: -0.01,
  });
  g.save();
  g.globalAlpha = clamp(spring(dt - 1.02, 300, 20));
  g.fillStyle = CRIMSON;
  g.fillRect(L.cx - SW * 0.18, 1470, SW * 0.36, Math.max(3, L.tMicro * 0.13));
  g.restore();
  text(g, 'same hours · nothing to show for it', L.cx, 1540, {
    font: fitText(g, 'same hours · nothing to show for it', F.mono(600, L.tMicro * 1.15), 0.06, SW * 0.94).font,
    fill: hexA(INK, 0.78), alpha: clamp(spring(dt - 1.18, 200, 26)), track: 0.06,
  });
  g.restore();
}

// --- S3 · the reframe ---------------------------------------------------------
function shot3(g, L, t, M, SW) {
  const dt = t - S2;
  const blk = fitBlock(g, ['RETRIEVAL', 'IS.'], { weight: 800, size: 196, maxW: SW * 0.98 });
  const top = L.h * 0.335;
  // The card grows into exactly the box S4 opens on, so the hand-off is
  // pixel-exact. The type leaves as the foreground (it scales through camera)
  // while the card is already in place underneath — never an empty gap.
  const cw = SW, ch = L.h * 0.34, cy = CARD_CY;
  const mk = smooth(inv(dt, 0.22, 0.38));

  ghost(g, L, '01', L.cx, L.h * 0.50, L.w * 0.62, 0.001, { alpha: 0.085 * (1 - mk), stroke: CYAN });
  // type first, on ink, at full contrast
  // the reveal starts before the sheet has finished clearing, so the cut never
  // lands on an empty frame
  wipeText(g, L, 'RETRIEVAL', L.cx, top, inv(dt, -0.10, 0.20), { font: blk.font, fill: GOLD, align: 'center', track: -0.04 });
  wipeText(g, L, 'IS.', L.cx, top + blk.lh, inv(dt, 0.06, 0.30), { font: blk.font, fill: '#ffffff', align: 'center', track: -0.04 });
  // then the sheet grows over it — the word becomes the card
  g.save();
  g.globalAlpha = ease(mk, 200, 24);
  sheet(g, L, L.cx - cw / 2, cy - ch / 2, cw, ch, 0.001, { accent: GOLD, radius: 18 });
  // the card's contents arrive with S4, which is long enough to hold them
  g.restore();

  wipeText(g, L, 'Pull it out of your head.', L.cx, 1240, inv(dt, 0.28, 0.46), {
    font: F.display(700, L.tSmall * 1.30), fill: '#ffffff', align: 'center', track: -0.01,
  });
  text(g, 'That is the whole difference.', L.cx, 1316, {
    font: fitText(g, 'That is the whole difference.', F.mono(500, L.tSmall * 0.98), 0.02, SW * 0.94).font,
    fill: SLATE, alpha: clamp(spring(dt - 0.66, 200, 26)), track: 0.02,
  });
  text(g, 'No more hours. Same hours, used properly.', L.cx, 1700, {
    font: fitText(g, 'No more hours. Same hours, used properly.', F.mono(600, L.tMicro * 1.15), 0.04, SW * 0.96).font,
    fill: hexA(GOLD, 0.80), alpha: clamp(spring(dt - 0.86, 200, 26)), track: 0.04,
  });
}

// --- S4 · card macro: the method, on a real item -----------------------------
function shot4(g, L, t, M, SW) {
  const dt = t - S3;
  const cw = SW, ch = L.h * 0.34;
  const cx = L.cx, cy = CARD_CY;
  const pad = CARD_PAD;

  // hand-off from S3: the card is already at exactly these coordinates
  sheet(g, L, cx - cw / 2, cy - ch / 2, cw, ch, 0.001, { accent: CRIMSON, radius: 18 });

  monoTag(g, L, 'CLOSED NOTES · 30 SECONDS', cx - cw / 2 + pad, cy - ch / 2 + pad * 1.55, dt,
    { fill: hexA(INK, 0.55), track: 0.14, size: L.tMicro * 0.95, maxW: cw - pad * 2 });

  // the prompt — a real A-Level item
  text(g, 'd/dx  sin x', cx - cw / 2 + pad, cy - ch * 0.08, {
    font: fitBlock(g, ['d/dx  sin x'], { weight: 700, size: 150, maxW: cw - pad * 2 }).font,
    fill: INK, align: 'left', track: -0.02,
  });
  // the answer: written once, in gold, revealed by a pen mask
  const ap = inv(dt, 0.90, 1.25);
  const ansFont = fitBlock(g, ['=  cos x'], { weight: 800, size: 168, maxW: cw - pad * 2 }).font;
  wipeText(g, L, '=  cos x', cx - cw / 2 + pad, cy + ch * 0.24, ap, {
    font: ansFont, fill: GOLD, align: 'left', track: -0.02,
  });
  g.save();
  setType(g, ansFont, -0.02);
  const aw = g.measureText('=  cos x').width;
  g.restore();
  g.save();
  g.globalAlpha = clamp(ap * 2);
  g.fillStyle = GOLD_DEEP;
  g.fillRect(cx - cw / 2 + pad, cy + ch * 0.31, aw * ap, Math.max(3, L.tMicro * 0.09));
  g.restore();

  // elapsed rail: the "seconds, not hours" claim made visible
  const tp = inv(dt, 0.30, 1.00);
  const tx = cx - cw / 2 + pad, tw = cw - pad * 2, ty = cy + ch * 0.42;
  g.save();
  g.globalAlpha = 0.35; g.fillStyle = hexA(INK, 0.30);
  g.fillRect(tx, ty, tw, Math.max(3, L.tMicro * 0.07));
  g.fillStyle = GOLD;
  g.fillRect(tx, ty, tw * tp, Math.max(3, L.tMicro * 0.07));
  g.restore();
  text(g, '00:30', tx, ty - L.tSmall * 0.42, {
    font: F.mono(700, L.tMicro * 1.12), fill: hexA(INK, 0.55), align: 'left', track: 0.06,
  });
  text(g, '30 SECONDS, NOT 3 HOURS', cx + cw / 2 - pad, ty - L.tSmall * 0.42, {
    font: fitText(g, '30 SECONDS, NOT 3 HOURS', F.mono(700, L.tMicro * 1.12), 0.06, tw * 0.7).font,
    fill: hexA(INK, 0.55), align: 'right', track: 0.06,
  });

  wipeText(g, L, 'Blank page first. Always.', L.cx, 1200, inv(dt, 0.16, 0.52), {
    font: fitBlock(g, ['Blank page first. Always.'], { weight: 800, size: 128, maxW: SW }).font,
    fill: '#ffffff', align: 'center', track: -0.035,
  });
  wipeText(g, L, 'No notes. No phone. Thirty seconds.', L.cx, 1284, inv(dt, 0.38, 0.66), {
    font: fitText(g, 'No notes. No phone. Thirty seconds.', F.mono(500, L.tSmall * 1.0), 0.02, SW * 0.94).font,
    fill: SLATE, align: 'center', track: 0.02,
  });

  // the teacher's voice: this is the trust beat
  // a rule and two lines, not an outlined box: the brand bans frame borders
  const cv = smooth(inv(dt, 1.06, 1.30));
  g.save();
  g.globalAlpha = cv;
  g.fillStyle = CYAN;
  g.fillRect(M, 1478, Math.max(4, L.tMicro * 0.13), L.tSmall * 2.05);
  g.restore();
  ['If you cannot produce it,', 'that is the topic to fix. Today.'].forEach((ln, i) => {
    wipeText(g, L, ln, M + L.tSmall * 0.62, 1470 + L.tSmall * (1.10 + i * 1.02), inv(dt, 1.14 + i * 0.10, 1.34 + i * 0.10), {
      font: fitText(g, ln, F.display(700, L.tSmall * 1.02), -0.01, SW - L.tSmall * 1.24).font,
      fill: i ? CYAN : '#ffffff', align: 'left', track: -0.01,
    });
  });
}

// --- S5 · the rail, then the loop --------------------------------------------
function shot5(g, L, t, M, SW) {
  const dt = t - S4;
  const cols = [
    ['RECALL', 'blank page first'],
    ['MARK', 'mark the gap'],
    ['REPEAT', 'back on day 3'],
  ];
  const gutter = L.tSmall * 0.7;
  const colW = (SW - gutter * 2) / 3;
  const railY = L.h * 0.600;
  const chipY = L.h * 0.300, chipH = L.h * 0.170;
  const lp = smooth(inv(dt, 0.56, 0.96));

  wipeText(g, L, 'One pass. Three steps.', L.cx, 470, inv(dt, 0.02, 0.30), {
    font: fitBlock(g, ['One pass. Three steps.'], { weight: 800, size: 132, maxW: SW }).font,
    fill: '#ffffff', align: 'center', track: -0.035,
  });

  // the actor has become column one: the paper survives into the UI
  if (dt >= 0) {
    sheet(g, L, M, chipY, colW, chipH, 0.001, { accent: GOLD, radius: 18 });
    ruled(g, M + colW * 0.10, chipY + chipH * 0.09, colW * 0.80, chipH * 0.30,
      { rows: 4, seed: 71, alpha: 0.22, ink: INK });
  }
  for (let i = 1; i < 3; i++) {
    chip(g, L, M + i * (colW + gutter), chipY, colW, chipH, 0.001, { accent: CYAN, radius: 18 });
  }

  // labels: equal columns, shared top edge, one reading target per column
  cols.forEach((c, i) => {
    const x = M + i * (colW + gutter);
    // labels are already standing at the cut: a shot that opens on three empty
    // boxes reads as a blank frame
    const a = clamp(spring(dt + 0.14 - i * 0.06, 250, 24));
    if (a <= 0.004) return;
    text(g, c[0], x + colW * 0.5, chipY + chipH * 0.68, {
      font: fitText(g, c[0], F.display(800, L.tMid * 0.84), -0.01, colW * 0.86).font,
      fill: i === 0 ? INK : '#ffffff', align: 'center', alpha: a, track: -0.01,
    });
    // dark ink only on the paper chip; on glass the gloss has to be light or it
    // is unreadable
    text(g, c[1], x + colW * 0.5, chipY + chipH * 0.90, {
      font: fitText(g, c[1], F.mono(500, L.tSmall * 0.62), 0.0, colW * 0.94).font,
      fill: i === 0 ? hexA(INK, 0.70) : hexA(SLATE, 0.95), align: 'center', alpha: a,
    });
  });

  // the rail: one rule, drawn once, surviving into the next shot as the axis
  const rp = inv(dt, 0.32, 0.70);
  g.save();
  g.globalAlpha = 1 - lp * 0.9;
  g.fillStyle = GOLD;
  g.fillRect(M, railY, SW * rp, Math.max(3, L.tMicro * 0.12));
  g.restore();
  cols.forEach((c, i) => {
    const x = M + i * (colW + gutter) + colW * 0.5;
    stationDot(g, L, x, railY + Math.max(3, L.tMicro * 0.12) / 2, L.tMicro * 0.30,
      dt - 0.42 - i * 0.12, i === 0 ? GOLD : CYAN);
  });

  // ---- the rail curls into the loop, and the actor laps it ------------------
  if (lp > 0.004) {
    const lx = L.cx, ly = railY, R = L.w * 0.285;
    const st = [[lx, ly - R * 0.66], [lx - R * 0.94, ly + R * 0.62], [lx + R * 0.94, ly + R * 0.62]];
    const startX = [M, M + colW + gutter + colW * 0.5, M + 2 * (colW + gutter) + colW * 0.5];
    g.save();
    g.globalAlpha = lp;
    g.strokeStyle = GOLD;
    g.lineWidth = Math.max(3, L.tMicro * 0.12);
    g.lineCap = 'round';
    g.setLineDash([L.tSmall * 0.5, L.tSmall * 0.42]);
    g.lineDashOffset = -dt * L.tSmall * 2.2;
    g.beginPath();
    g.moveTo(lerp(startX[0], st[0][0], lp), lerp(railY, st[0][1], lp));
    for (let i = 1; i < 3; i++) g.lineTo(lerp(startX[i], st[i][0], lp), lerp(railY, st[i][1], lp));
    g.lineTo(lerp(startX[2], st[0][0], lp), lerp(railY, st[0][1], lp));
    g.stroke();
    g.restore();
    st.forEach((s, i) => {
      const a = clamp(spring(dt - 0.86 - i * 0.08, 300, 22));
      if (a <= 0.004) return;
      const x = lerp(startX[i], s[0], lp), y = lerp(railY, s[1], lp);
      g.save();
      g.globalAlpha = a * 0.92;
      g.fillStyle = INK;
      g.beginPath(); g.arc(x, y, L.tMicro * 0.40, 0, Math.PI * 2); g.fill();
      g.strokeStyle = GOLD; g.lineWidth = Math.max(2, L.tMicro * 0.07); g.stroke();
      g.restore();
    });
    // the actor, travelling the loop - continuously, because a loop that runs
    // once and then stops stops being a loop
    const lapT = Math.max(0, dt - 1.00);
    const q = ((lapT / 1.55) % 1 + 1) % 1;
    if (q > 0.001 && q < 0.999 && lapT < 5.0) {
      const leg = Math.min(2, Math.floor(q * 3));
      const fr = q * 3 - leg;
      const a0 = st[leg], a1 = st[(leg + 1) % 3];
      const x = lerp(a0[0], a1[0], fr), y = lerp(a0[1], a1[1], fr);
      const cwv = L.w * 0.13, chv = cwv * 0.62;
      g.save();
      g.globalAlpha = 0.95;
      sheet(g, L, x - cwv / 2, y - chv / 2 - L.tMicro * 0.6, cwv, chv, 0.001, { accent: GOLD, radius: 8 });
      g.restore();
    }
  }

  g.save();
  g.globalAlpha = 0.22; g.fillStyle = CRIMSON;
  g.fillRect(L.cx - SW * 0.16, 1420, SW * 0.32, Math.max(2, L.tMicro * 0.05));
  g.restore();
  wipeText(g, L, 'Three steps, on a schedule.', L.cx, 1520, inv(dt, 1.02, 1.34), {
    font: fitText(g, 'Three steps, on a schedule.', F.display(700, L.tSmall * 1.16), -0.01, SW * 0.98).font,
    fill: '#ffffff', align: 'center', track: -0.01,
  });
  wipeText(g, L, 'Most students only ever do the first one twice.', L.cx, 1606, inv(dt, 0.30, 0.66), {
    font: fitText(g, 'Most students only ever do the first one twice.', F.mono(500, L.tSmall * 0.98), 0.02, SW * 0.98).font,
    fill: SLATE, align: 'center', track: 0.02,
  });
  wipeText(g, L, '12 MINUTES A WEEK IS ENOUGH TO START', L.cx, 1712, inv(dt, 0.88, 1.22), {
    font: fitText(g, '12 MINUTES A WEEK IS ENOUGH TO START', F.mono(700, L.tMicro * 1.15), 0.10, SW * 0.96).font,
    fill: GOLD, align: 'center', track: 0.10,
  });
}

// --- S6 · the spaced-repetition axis -----------------------------------------
function shot6(g, L, t, M, SW) {
  const dt = t - S5;
  const axisY = L.h * 0.480;
  const days = [1, 3, 7, 14];
  const res = ['answered', 'still there', '', 'automatic'];   // empty = no label
  const stepX = SW / (days.length + 1);
  const bigW = SW * 0.40, bigH = bigW * 0.62;

  wipeText(g, L, 'Then it comes back.', L.cx, 400, inv(dt, 0.04, 0.34), {
    font: fitBlock(g, ['Then it comes back.'], { weight: 800, size: 132, maxW: SW }).font,
    fill: '#ffffff', align: 'center', track: -0.035,
  });
  wipeText(g, L, 'Four returns beat forty rereads. Every time.', L.cx, 500, inv(dt, 0.22, 0.52), {
    font: fitText(g, 'Four returns beat forty rereads. Every time.', F.mono(500, L.tSmall * 0.98), 0.02, SW * 0.96).font,
    fill: SLATE, align: 'center', track: 0.02,
  });

  // the rail straightens into a time axis
  g.save();
  g.fillStyle = GOLD;
  g.fillRect(M, axisY, SW * inv(dt, 0.0, 0.28), Math.max(3, L.tMicro * 0.12));
  g.restore();

  // the actor lands on day 1, then lifts — one card, four returns
  const lx = M + stepX;
  const land = smooth(inv(dt, 0.24, 0.60));
  const park = smooth(inv(dt, 0.80, 1.20));
  const cardY = axisY - bigH - L.tSmall * 0.85 - (1 - land) * L.h * 0.04;
  g.save();
  // it dims once the returns start arriving: it is the same card every time
  g.globalAlpha = clamp(spring(dt, 210, 24) * 2) * (1 - park * 0.52);
  sheet(g, L, lx - bigW / 2, cardY, bigW, bigH, 0.001, { accent: GOLD, radius: 12 });
  g.restore();
  ruled(g, lx - bigW / 2 + bigW * 0.09, cardY + bigH * 0.16, bigW * 0.82, bigH * 0.60,
    { rows: 5, seed: 71, alpha: 0.18, ink: INK });

  days.forEach((d, i) => {
    const x = M + stepX * (i + 1);
    const dp = clamp(spring(dt - 0.24 - i * 0.52, 300, 22));
    if (i > 0) {
      g.save();
      g.fillStyle = hexA(GOLD, 0.85);
      g.fillRect(M + stepX * i, axisY, stepX, Math.max(3, L.tMicro * 0.12));
      g.restore();
    }
    if (dp <= 0.004) return;
    stationDot(g, L, x, axisY + Math.max(3, L.tMicro * 0.12) / 2, L.tMicro * 0.26, dt - 0.24 - i * 0.52, GOLD);
    text(g, `DAY ${d}`, x, axisY + L.tSmall * 1.10, {
      font: fitText(g, `DAY ${d}`, F.mono(700, L.tMicro * 1.15), 0.08, stepX * 0.94).font,
      fill: GOLD, align: 'center', alpha: dp, track: 0.08,
    });
    // each landed return leaves a copy on the shelf beneath the axis
    const gw = stepX * 0.66, gh = gw * 0.62;
    const gy = axisY + L.tSmall * 1.60;
    g.save();
    g.globalAlpha = clamp(dp * 2) * 0.94;
    sheet(g, L, x - gw / 2, gy, gw, gh, 0.001, { accent: GOLD, radius: 7, shadow: false });
    g.restore();
    ruled(g, x - gw / 2 + gw * 0.10, gy + gh * 0.18, gw * 0.80, gh * 0.58,
      { rows: 4, seed: 71 + i, alpha: 0.20, ink: INK });
    if (!res[i]) return;
    wipeText(g, L, res[i], x, gy + gh + L.tSmall * 0.62, inv(dt, 0.42 + i * 0.52, 0.64 + i * 0.52), {
      font: fitText(g, res[i], F.mono(600, L.tSmall * 0.86), 0.02, stepX * 0.96).font,
      fill: CYAN, align: 'center', track: 0.02,
    });
  });

  // the elapsed-time cursor: the one thing on screen that is always moving, and
  // it is the point of the shot - this is how the four returns are spaced
  {
    const cu = clamp((dt - 0.18) / 2.50);
    const cxp = M + SW * cu;
    const ca = clamp(smooth(inv(dt, 0.16, 0.42))) * (1 - smooth(inv(dt, 3.20, 3.62)));
    if (ca > 0.01) {
      g.save();
      g.globalAlpha = ca;
      g.fillStyle = hexA(CRIMSON_HI, 0.16);
      g.fillRect(cxp - L.tMicro * 0.5, axisY - L.tSmall * 1.5, L.tMicro, L.tSmall * 2.2);
      g.fillStyle = CRIMSON_HI;
      g.beginPath();
      g.moveTo(cxp, axisY - L.tMicro * 0.9);
      g.lineTo(cxp - L.tMicro * 0.34, axisY - L.tMicro * 0.1);
      g.lineTo(cxp + L.tMicro * 0.34, axisY - L.tMicro * 0.1);
      g.closePath(); g.fill();
      g.restore();
    }
  }

  // one becomes four
  const sp = smooth(inv(dt, 1.74, 2.02));
  if (sp > 0.004) {
    const gw = stepX * 0.66, gh = gw * 0.62;
    const gy = axisY + L.tSmall * 1.60;
    for (let k = 0; k < 4; k++) {
      const gx = M + stepX * (k + 1);
      const pop = clamp(spring(dt - 2.55 - k * 0.06, 380, 17));
      g.save();
      g.globalAlpha = pop * 0.35;
      g.translate(gx, gy + gh * 0.5); g.scale(1 + 0.10 * sp, 1 + 0.10 * sp); g.translate(-gx, -(gy + gh * 0.5));
      g.strokeStyle = GOLD; g.lineWidth = Math.max(2, L.tMicro * 0.05);
      g.beginPath(); g.roundRect(gx - gw / 2, gy, gw, gh, 7); g.stroke();
      g.restore();
    }
  }
  // the summary block under the axis, so the lower third is not left empty
  g.save();
  g.globalAlpha = 0.16; g.fillStyle = GOLD;
  g.fillRect(M, 1270, SW, Math.max(2, L.tMicro * 0.05));
  g.restore();
  wipeText(g, L, 'Same card. Four dates. No new notes to write.', L.cx, 1360, inv(dt, 2.30, 2.62), {
    font: fitText(g, 'Same card. Four dates. No new notes to write.', F.display(700, L.tSmall * 1.10), -0.01, SW).font,
    fill: '#ffffff', align: 'center', track: -0.01,
  });
  wipeText(g, L, 'The method is the product, not the hours.', L.cx, 1446, inv(dt, 2.52, 2.84), {
    font: fitText(g, 'The method is the product, not the hours.', F.mono(500, L.tSmall * 1.0), 0.02, SW * 0.96).font,
    fill: SLATE, align: 'center', track: 0.02,
  });
  text(g, 'THE GAP YOU FOUND TODAY IS CLOSED BY THURSDAY', L.cx, 1700, {
    font: fitText(g, 'THE GAP YOU FOUND TODAY IS CLOSED BY THURSDAY', F.mono(700, L.tMicro * 1.15), 0.10, SW * 0.96).font,
    fill: '#ffffff', alpha: clamp(spring(dt - 2.70, 200, 26)), track: 0.10,
  });
}

// --- S7 · 48 pages become 4 cards -------------------------------------------
function shot7(g, L, t, M, SW) {
  const dt = t - S6;
  const collapse = smooth(inv(dt, 0.06, 0.72)) * (1 - 0.16 * smooth(inv(dt, 0.72, 1.30)));
  const rows = 24;
  const stackTop = 560, stackH = 900;
  const mid = stackTop + stackH * 0.46;

  wipeText(g, L, 'So the notes shrink.', L.cx, 400, inv(dt, 0.0, 0.24), {
    font: fitBlock(g, ['So the notes shrink.'], { weight: 800, size: 132, maxW: SW }).font,
    fill: '#ffffff', align: 'center', track: -0.035,
  });

  // the counter: 48 → 4, two aligned columns
  const bigFont = fitBlock(g, ['00'], { weight: 800, size: 300, maxW: SW * 0.44 }).font;
  const colL = M, colR = M + SW * 0.52;
  // One number that actually counts 48 -> 4, on a mask. Stacked ghost numerals
  // read as a rendering glitch, not as counting.
  const c1 = smooth(inv(dt, 0.14, 0.64));
  text(g, '48', colL, 800, {
    font: bigFont, fill: hexA(SLATE, 0.32 * (1 - c1 * 0.8)), align: 'left', track: -0.05,
  });
  const cv = String(Math.max(4, Math.round(lerp(48, 4, c1))));
  wipeText(g, L, cv, colR, 800, inv(dt, 0.18, 0.58), { font: bigFont, fill: CRIMSON, align: 'left', track: -0.05 });
  text(g, 'pages of notes', colL, 862, {
    font: fitText(g, 'pages of notes', F.mono(600, L.tMicro * 1.15), 0.10, SW * 0.46).font,
    fill: hexA(SLATE, 0.55), align: 'left', track: 0.10,
  });
  text(g, 'cards worth revising', colR, 862, {
    font: fitText(g, 'cards worth revising', F.mono(700, L.tMicro * 1.15), 0.04, SW * 0.46).font,
    fill: GOLD, align: 'left', alpha: clamp(spring(dt - 0.5, 200, 26)), track: 0.04,
  });
  g.save();
  g.globalAlpha = 0.14; g.fillStyle = '#ffffff';
  g.fillRect(M + SW * 0.485, 700, Math.max(2, L.tMicro * 0.05), 150);
  g.restore();

  // the stack: 24 ruled lines collapsing to the middle
  const r = rng(517);
  for (let i = 0; i < rows; i++) {
    const y = stackTop + i * (stackH / (rows - 1));
    const cy2 = lerp(y, mid, collapse);
    const w = lerp(SW * (0.62 + r() * 0.38), SW * 0.40, collapse);
    const a = clamp(spring(dt - i * 0.012, 220, 26)) * (1 - collapse * 0.6);
    g.save();
    g.globalAlpha = a * 0.5;
    g.fillStyle = hexA(i % 4 === 0 ? GOLD : SLATE, 0.55);
    g.fillRect(L.cx - w / 2, cy2, w, Math.max(2, L.tMicro * 0.09));
    g.restore();
  }

  // the four cards, taking the place of the stack
  const fp = smooth(inv(dt, 0.86, 1.24));
  if (fp > 0.004) {
    const cw = SW * 0.30, ch = cw * 0.62;
    for (let k = 0; k < 4; k++) {
      const a = (k - 1.5) / 1.5;
      const x = L.cx + a * SW * 0.32 * fp;
      const y = mid - ch * 0.5 + Math.abs(a) * L.tSmall * 0.55 * fp;
      g.save();
      g.globalAlpha = clamp(fp * 2) * (0.64 + 0.36 * (1 - Math.abs(a)));
      g.translate(x, y); g.rotate(a * 0.10 * fp); g.translate(-x, -y);
      sheet(g, L, x - cw / 2, y, cw, ch, 0.001, { accent: GOLD, radius: 10, shadow: k === 1 || k === 2 });
      g.restore();
      ruled(g, x - cw / 2 + cw * 0.10, y + ch * 0.16, cw * 0.80, ch * 0.60,
        { rows: 5, seed: 200 + k, alpha: 0.18, ink: INK });
    }
  }
  wipeText(g, L, 'Four cards. That is the revision.', L.cx, 1450, inv(dt, 1.30, 1.56), {
    font: fitBlock(g, ['Four cards. That is the revision.'], { weight: 800, size: 118, maxW: SW }).font,
    fill: '#ffffff', align: 'center', track: -0.035,
  });
  wipeText(g, L, 'This is what I teach first.', L.cx, 1546, inv(dt, 1.48, 1.74), {
    font: fitText(g, 'This is what I teach first.', F.mono(500, L.tSmall * 1.0), 0.02, SW * 0.94).font,
    fill: SLATE, align: 'center', track: 0.02,
  });
  wipeText(g, L, 'It is free, on the call.', L.cx, 1626, inv(dt, 1.66, 1.92), {
    font: fitText(g, 'It is free, on the call.', F.mono(700, L.tSmall * 1.0), 0.02, SW * 0.94).font,
    fill: GOLD, align: 'center', track: 0.02,
  });
}

// --- S8 · the exam paper: cause → effect -------------------------------------
function shot8(g, L, t, M, SW) {
  const dt = t - S7;
  const fade = inv(dt, 0.0, 0.16);
  g.save(); g.globalAlpha *= fade;
  const pw = SW, ph = L.h * 0.46;
  const px = M, py = L.h * 0.195;
  const qs = [['Q3', 'differentiation', 0.00], ['Q7', 'circular motion', 0.34], ['Q11', 'vectors', 0.66]];

  sheet(g, L, px, py, pw, ph, 0.001, { accent: GOLD, radius: 14 });
  monoTag(g, L, 'MOCK PAPER · 2026', px + L.tMid * 0.85, py + L.tSmall * 1.24, dt,
    { fill: hexA(INK, 0.5), track: 0.14, size: L.tMicro * 0.95, maxW: pw - L.tMid * 1.7 });
  g.save();
  g.globalAlpha = 0.20;
  g.fillStyle = INK;
  g.fillRect(px + L.tMid * 0.85, py + L.tSmall * 1.62, pw - L.tMid * 1.7, Math.max(2, L.tMicro * 0.05));
  g.restore();

  // three rows, equal height, shared left edge, ticks landing in order
  qs.forEach((q, i) => {
    const y = py + L.tSmall * 2.6 + i * (ph * 0.20);
    const a = 1;
    if (a <= 0.004) return;
    const bx = px + L.tMid * 0.85, by = y - L.tSmall * 0.88, bs = L.tSmall * 1.04;
    g.save();
    g.globalAlpha = a * 0.85;
    g.strokeStyle = hexA(INK, 0.30);
    g.lineWidth = Math.max(2, L.tMicro * 0.05);
    g.beginPath(); g.roundRect(bx, by, bs, bs, 6); g.stroke();
    g.restore();
    const tk = smooth(inv(dt, 0.40 + i * 0.42, 0.58 + i * 0.42));
    if (tk > 0.004) {
      g.save();
      g.globalAlpha = tk;
      g.strokeStyle = INK;
      g.lineWidth = Math.max(3, L.tMicro * 0.11);
      g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath();
      g.moveTo(bx + bs * 0.20, by + bs * 0.54);
      g.lineTo(bx + bs * 0.42, by + bs * 0.76);
      g.lineTo(bx + bs * 0.82, by + bs * 0.22);
      g.stroke();
      g.restore();
    }
    text(g, q[0], bx + bs + L.tSmall * 0.52, y, {
      font: F.mono(700, L.tSmall * 0.86), fill: hexA(INK, 0.55), align: 'left', track: 0.06, alpha: a,
    });
    wipeText(g, L, q[1], bx + bs + L.tSmall * 1.86, y, inv(dt, 0.02 + i * 0.05, 0.26 + i * 0.05), {
      font: fitText(g, q[1], F.display(700, L.tSmall * 1.02), -0.01, pw * 0.50).font,
      fill: INK, align: 'left', track: -0.01,
    });
    g.save();
    g.globalAlpha = a * 0.14;
    g.fillStyle = INK;
    g.fillRect(px + L.tMid * 0.85, y + L.tSmall * 0.46, pw - L.tMid * 1.7, Math.max(1, L.tMicro * 0.03));
    g.restore();
    // the working space under each question: two ruled answer lines
    if (i < 2) {
      const ly = y + L.tSmall * 0.86;
      g.save();
      g.globalAlpha = a * 0.13;
      g.fillStyle = INK;
      for (let r = 0; r < 2; r++) {
        g.fillRect(px + L.tMid * 0.85 + (r === 1 ? L.tSmall * 1.2 : 0), ly + r * L.tSmall * 0.52,
          (pw - L.tMid * 1.7) * (r === 1 ? 0.62 : 0.94), Math.max(2, L.tMicro * 0.035));
      }
      g.restore();
    }
  });
  // the working area below the questions: a ruled answer space, as on a real paper
  {
    const wy = py + L.tSmall * 2.6 + qs.length * (ph * 0.20) + L.tSmall * 0.50;
    const rows = Math.floor((py + ph - L.tSmall * 0.9 - wy) / (L.tSmall * 0.84));
    g.save();
    g.globalAlpha = 0.12;
    g.fillStyle = INK;
    const r2 = rng(404);
    for (let i = 0; i < rows; i++) {
      g.fillRect(px + L.tMid * 0.85, wy + i * L.tSmall * 0.84,
        (pw - L.tMid * 1.7) * (0.70 + r2() * 0.28), Math.max(2, L.tMicro * 0.032));
    }
    g.restore();
    monoTag(g, L, 'WORKING', px + L.tMid * 0.85, wy - L.tSmall * 0.34, dt,
      { fill: hexA(INK, 0.32), track: 0.18, size: L.tMicro * 0.88, maxW: pw * 0.4 });
  }

  // marks column on the right of the paper, as on a real paper
  ['4', '3', '3'].forEach((mk, i) => {
    const y = py + L.tSmall * 2.6 + i * (ph * 0.20);
    const a = clamp(spring(dt - 0.20 - i * 0.10, 240, 24));
    if (a <= 0.004) return;
    text(g, mk, px + pw - L.tMid * 0.85, y, {
      font: F.mono(700, L.tSmall * 0.86), fill: hexA(INK, 0.45), align: 'right', track: 0.04, alpha: a,
    });
    g.save();
    g.globalAlpha = a * 0.16;
    g.fillStyle = INK;
    g.fillRect(px + pw - L.tMid * 0.85 - L.tSmall * 0.30, y - L.tSmall * 0.90, Math.max(1, L.tMicro * 0.03), L.tSmall * 1.10);
    g.restore();
  });

  wipeText(g, L, 'The topic you drilled:', L.cx, 1400, inv(dt, 1.55, 1.88), {
    font: fitBlock(g, ['The topic you drilled:'], { weight: 800, size: 126, maxW: SW }).font,
    fill: '#ffffff', align: 'center', track: -0.035,
  });
  wipeText(g, L, 'answered first.', L.cx, 1540, inv(dt, 1.80, 2.14), {
    font: fitBlock(g, ['answered first.'], { weight: 800, size: 126, maxW: SW }).font,
    fill: GOLD, align: 'center', track: -0.035,
  });
  wipeText(g, L, 'That is a method, not luck.', L.cx, 1650, inv(dt, 2.06, 2.38), {
    font: fitText(g, 'That is a method, not luck.', F.mono(500, L.tSmall * 1.0), 0.02, SW * 0.94).font,
    fill: SLATE, align: 'center', track: 0.02,
  });
  text(g, 'A-LEVEL MATHS · PHYSICS · COMPUTER SCIENCE', L.cx, 1790, {
    font: fitText(g, 'A-LEVEL MATHS · PHYSICS · COMPUTER SCIENCE', F.mono(700, L.tMicro * 1.15), 0.10, SW * 0.96).font,
    fill: SILVER, alpha: clamp(spring(dt - 2.55, 200, 26)), track: 0.10,
  });
  g.restore();
}

const CALL_SUB = 'Free. No cost, no commitment.';   // both halves pre-approved
const CALL_SUB_Y = 1152;   // the call's promise, under the button
const LIST_Y = 1300;       // what the free call is
const RULE_Y = 1560;
const HANDLE_Y = 1665;     // clear of the platform UI, even after the end push

function callSubFont(g, L, SW) {
  return fitText(g, CALL_SUB, F.mono(600, L.tSmall * 1.02), 0.04, SW * 0.96).font;
}

// The gold capsule once it has become the call to action. The label is only
// legible on the wide button, so it appears as the capsule widens and then never
// leaves — the CTA is on screen for the last three seconds of the reel.
function button(g, L, fold, widen, p, t) {
  const box = capsule(g, L, fold, widen, t);
  if (!box || widen < 0.55) return box;
  const cf = fitBlock(g, ['Book the free call'], { weight: 800, size: 118, maxW: box.w * 0.82 });
  wipeText(g, L, 'Book the free call', L.cx, CAP_CY + cf.size * 0.35, inv(p, 0.18, 0.52), {
    font: cf.font, fill: PILL_INK, align: 'center', track: -0.02,
  });
  return box;
}

// What the free call is. These three lines are the pre-approved offer wording from
// reels 11-14; they are the reason a first-time viewer knows what to expect.
function callList(g, L, dotP, textP, M, SW) {
  const lines = [
    ['we start with the topic costing you marks', GOLD],
    ['you leave with a written plan', SILVER],
    ['tuition only if you want it', BONE_DIM],
  ];
  lines.forEach((l, i) => {
    const y = LIST_Y + i * 84;
    const a = clamp(spring(dotP - 0.06 - i * 0.12, 220, 25));
    if (a > 0.004) {
      g.save();
      g.globalAlpha = a;
      g.fillStyle = l[1];
      g.beginPath(); g.arc(M + L.tMicro * 0.36, y - L.tMicro * 0.32, L.tMicro * 0.28, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    wipeText(g, L, l[0], M + L.tSmall * 0.84, y, inv(textP, 0.08 + i * 0.12, 0.32 + i * 0.12), {
      font: fitText(g, l[0], F.mono(500, L.tSmall * 1.02), 0.02, (L.w - M) - (M + L.tSmall * 0.84)).font,
      fill: '#ffffff', align: 'left', track: 0.02,
    });
  });
}

// --- S9 · proof rows fold into the logo --------------------------------------
function shot9(g, L, t, M, SW) {
  const dt = t - S8;
  const pw = 365, ph = pw * 1.15;
  const px = L.cx - pw / 2, py = 286;

  // The portrait and its name compress into the same fold as the proof rows, so
  // the brand lockup below has a clear frame to arrive into.
  // full-size geometry, opacity only: a spring from zero puts a 15px speck on
  // screen for a few frames after the cut
  const clear = 1 - smooth(inv(dt, 1.66, 2.02));
  const cf = clamp(smooth(inv(dt, 0.04, 0.34))) * clear;
  portrait(g, L, px, py + (1 - clear) * 150, pw, ph, 0.001, { alpha: cf });
  g.save();
  g.globalAlpha *= clear;
  g.translate(L.cx, 806 + (1 - clear) * 150);
  g.scale(1, Math.max(clear, 0.001));
  g.translate(-L.cx, -(806 + (1 - clear) * 150));
  wipeText(g, L, 'Musa Ahmed', L.cx, 806, inv(dt, 0.02, 0.28), {
    font: fitBlock(g, ['Musa Ahmed'], { weight: 800, size: 96, maxW: SW * 0.7 }).font,
    fill: '#ffffff', align: 'center', track: -0.02,
  });
  g.restore();

  // the fold: rows compress toward the capsule, which grows over them
  // the capsule must not appear while the proof rows are still on screen, or it
  // lands as an unlabelled gold pill across them
  const fold = smooth(inv(dt, 2.60, 3.10));
  const rowFade = 1 - smooth(inv(dt, 1.30, 1.66));
  PROOF.forEach((r0, i) => {
    const y = 892 + i * 92;
    const rp = clamp(spring(dt - 0.16 - i * 0.16, 240, 24)) * rowFade;
    if (rp <= 0.004) return;
    const cy = lerp(y, CAP_CY, fold);
    text(g, r0[0], M, cy, {
      font: fitText(g, r0[0], F.display(800, L.tSmall * 1.02), -0.02, SW * 0.5).font,
      fill: '#ffffff', align: 'left', alpha: rp, track: -0.02,
    });
    text(g, r0[1], L.w - M, cy, {
      font: fitText(g, r0[1], F.mono(600, L.tMicro * 1.15), 0.02, SW * 0.44).font,
      fill: SLATE, align: 'right', alpha: rp * 0.95, track: 0.02,
    });
    g.save();
    g.globalAlpha = rp * 0.16;
    g.fillStyle = '#ffffff';
    g.fillRect(M, cy + 30, SW, Math.max(1, L.tMicro * 0.03));
    g.restore();
  });

  // the proof line hands off to the ask: both live in the same band, so it must
  // leave before the call block arrives or the two collide
  g.save();
  g.globalAlpha *= 1 - smooth(inv(dt, 1.20, 1.56));
  wipeText(g, L, 'I got these the same way.', L.cx, 1218, inv(dt, 0.62, 0.98), {
    font: fitBlock(g, ['I got these the same way.'], { weight: 800, size: 122, maxW: SW }).font,
    fill: '#ffffff', align: 'center', track: -0.035,
  });
  wipeText(g, L, 'One card at a time. Four returns. For years.', L.cx, 1298, inv(dt, 0.82, 1.14), {
    font: fitText(g, 'One card at a time. Four returns. For years.', F.mono(500, L.tSmall * 0.98), 0.02, SW * 0.96).font,
    fill: SLATE, align: 'center', track: 0.02,
  });
  g.restore();

  // The capsule becomes the button inside this shot, so the one action the reel
  // sells is on screen for the last three seconds rather than the last one.
  const widen = smooth(inv(dt, 3.00, 3.50));
  button(g, L, fold, widen, dt - 3.45, t);
  lockup(g, L, dt - 2.45, inv(dt, 2.70, 3.15));
  wipeText(g, L, CALL_SUB, L.cx, CALL_SUB_Y, inv(dt, 3.35, 3.80), {
    font: callSubFont(g, L, SW), fill: '#ffffff', align: 'center', track: 0.02,
  });
  callList(g, L, dt - 2.90, dt - 4.13, M, SW);
}

// The brand lockup: the real gold plate (monogram + wordmark, as supplied), a
// hairline, and the subject line. One function, so S9, S10 and S11 cannot drift
// apart or double up the wordmark.
function lockup(g, L, p, subP = 1) {
  logoLock(g, L, L.cx, LOCK_Y, L.w * 0.34, p);
  const a = clamp(spring(p - 0.24, 220, 25));
  if (a > 0.004) {
    g.save();
    g.globalAlpha = a * 0.85; g.fillStyle = CRIMSON;
    g.fillRect(L.cx - L.tMicro * 5.4, LOCK_Y + L.w * 0.235, L.tMicro * 10.8, Math.max(2, L.tMicro * 0.06));
    g.restore();
  }
  wipeText(g, L, 'GCSE · A-LEVEL · MATHS · PHYSICS · CS · ENGLISH', L.cx, SUBJ_Y, subP, {
    font: fitText(g, 'GCSE · A-LEVEL · MATHS · PHYSICS · CS · ENGLISH', F.mono(600, L.tMicro * 1.15), 0.06, SW_(L) * 0.98).font,
    fill: SLATE, align: 'center', track: 0.06,
  });
}

// The gold capsule: rows → bar → button. S9 lands it at rest, S10 widens it,
// S11 holds it. One shape, three states, so the logo and the action are the
// same object the whole way.
function capsule(g, L, fold, widen = 0, t = 0) {
  const h = lerp(26, CAP_H, fold);
  const w = lerp(SW_(L) * 0.44, SW_(L) * 0.94, widen);
  const x = L.cx - w / 2, y = CAP_CY - h / 2;
  if (fold <= 0.004) return null;
  const a = clamp(spring(fold, 220, 24) * 2);
  // Flat, no gradient and no gloss - the brand bans glow on UI chrome - but the
  // fill drifts a little in value so the button keeps catching the eye through a
  // long hold. One slow cycle for the whole film; it never pumps.
  const br = t > 0 ? 0.5 + 0.5 * Math.sin(t * 0.72 - 1.2) : 0;
  const fill = br > 0.5
    ? `rgb(${Math.round(220 + 15 * (br - 0.5) * 2)},${Math.round(38 + 8 * (br - 0.5) * 2)},${Math.round(38 + 6 * (br - 0.5) * 2)})`
    : `rgb(${Math.round(220 - 22 * (0.5 - br) * 2)},${Math.round(38 - 12 * (0.5 - br) * 2)},${Math.round(38 - 10 * (0.5 - br) * 2)})`;
  g.save();
  g.globalAlpha = a;
  g.fillStyle = fill;
  g.beginPath(); g.roundRect(x, y, w, h, h * 0.26); g.fill();
  g.restore();
  // The mark sits inside the narrow capsule and hands off to the lockup above as
  // the capsule widens into the button — so the logo and the action are the same
  // object without a label ever having to share the bar with it.
  const ms = Math.min(h * 0.62, w * 0.30);
  const ma = clamp(fold * 2 - 0.4) * (1 - widen);
  if (ms > 6 && ma > 0.01) {
    const lg = plate('brand_logo.png');
    g.save();
    g.globalAlpha = a * ma;
    if (!containFit(g, lg, L.cx, CAP_CY, ms)) {
      g.fillStyle = '#ffffff';
      g.beginPath(); g.arc(L.cx, CAP_CY, ms * 0.40, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }
  return { x, y, w, h };
}
const SW_ = (L) => L.w - L.mx * 2;

// --- S10 · what the call actually is (the business test, on mute) -----------
function shot10(g, L, t, M, SW) {
  const dt = t - S9;
  // the whole card block is already standing from S9; S10 only keeps it alive, so
  // nothing can re-animate or blank across this cut
  lockup(g, L, 0.001, 1);
  button(g, L, 1, 1, 1, t);
  wipeText(g, L, CALL_SUB, L.cx, CALL_SUB_Y, 1, {
    font: callSubFont(g, L, SW), fill: '#ffffff', align: 'center', track: 0.04,
  });
  callList(g, L, 1, 1, M, SW);
}

// --- S11 · end card: readable, with drift ------------------------------------
function shot11(g, L, t, M, SW) {
  const dt = t - S10;
  lockup(g, L, 0.001, 1);
  button(g, L, 1, 1, 1, t);
  // the CTA has been on screen since 16.3; the handle is the last thing to land
  wipeText(g, L, CALL_SUB, L.cx, CALL_SUB_Y, 1, {
    font: callSubFont(g, L, SW), fill: '#ffffff', align: 'center', track: 0.04,
  });
  callList(g, L, 1, 1, M, SW);   // already on screen since S9 — do not replay
  g.save();
  g.globalAlpha = clamp(spring(dt - 0.34, 220, 25)) * 0.85;
  g.fillStyle = CRIMSON;
  g.fillRect(M, RULE_Y, SW, Math.max(1, L.tMicro * 0.05));
  g.restore();
  wipeText(g, L, 'musaahmed.uk/academy', L.cx, HANDLE_Y, inv(dt, 0.40, 0.72), {
    font: fitText(g, 'musaahmed.uk/academy', F.mono(700, L.tSmall * 1.10), 0.08, SW * 0.9).font,
    fill: GOLD, align: 'center', track: 0.08,
  });
}

// --- transitions --------------------------------------------------------------

// S2 -> S3: the sheet flies through the camera; S3 is already painted beneath.
function flySheet(g, L, t, t0, t1, M, SW) {
  const p = lin(t, t0, t1);
  const fp = (v, a, b) => clamp((v - a) / (b - a));
  // a hard cover before the fade, so the transition never shows an empty gap
  const cover = smooth(fp(p, 0.32, 0.50));
  const s = lerp(1, 2.6, Math.pow(p, 1.6)) * (1 + cover * 2.4);
  const cx = L.cx, cy = L.h * 0.440;
  const cw = SW * 0.415 * s, ch = L.h * 0.36 * s;
  const a = 1 - smooth(fp(p, 0.52, 0.78));
  g.save();
  g.globalAlpha = clamp(a * 1.4);
  sheet(g, L, cx - cw / 2, cy - ch / 2, cw, ch, 0.001, { accent: GOLD, radius: 14 * s, shadow: false });
  ruled(g, cx - cw / 2 + cw * 0.05, cy - ch / 2 + ch * 0.06, cw * 0.90, ch * 0.88,
    { rows: 26, seed: 71, alpha: 0.20, ink: INK });
  g.restore();
}

// S8 -> S9: the card flies up through the paper, with a streak for speed.
function flyCard(g, L, t, t0, t1, M, SW) {
  const p = lin(t, t0, t1);
  const fp = (v, a, b) => clamp((v - a) / (b - a));
  const cw0 = SW * 0.30, ch0 = cw0 * 0.62;
  // it leaves from the top-left of the paper and exits above the headline, so it
  // never occludes the row it is flying past or the line it lands over
  const cx = lerp(L.cx, L.cx - SW * 0.16, p);
  const cy = L.h * 0.40;
  const y = lerp(cy, cy - L.h * 0.62, Math.pow(p, 1.5));
  // cover the frame on BOTH axes before the cut: scaling a card can cover width
  // long before it covers height, which left a full-frame blank at the cut
  const cover = smooth(fp(p, 0.34, 0.52));
  let cw = cw0 * lerp(1, 2.6, Math.pow(p, 2.0)) * (1 + cover * 3.2);
  let ch = cw * 0.62;
  if (ch < L.h * 1.04) { const k = (L.h * 1.04) / ch; cw *= k; ch *= k; }
  if (cw < L.w * 1.04) { const k = (L.w * 1.04) / cw; cw *= k; ch *= k; }
  g.save();
  g.globalAlpha = 1 - smooth(fp(p, 0.56, 1));
  g.translate(cx, y); g.rotate(p * 0.22);
  g.translate(cx - cw / 2, cy - ch / 2); g.scale(cw / cw0, ch / ch0); g.translate(-cx, -cy);
  sheet(g, L, cx - cw / 2, cy - ch / 2, cw, ch, 0.001, { accent: GOLD, radius: 10 });
  ruled(g, cx - cw / 2 + cw * 0.06, cy - ch / 2 + ch * 0.08, cw * 0.88, ch * 0.84,
    { rows: 22, seed: 71, alpha: 0.22, ink: INK });
  g.restore();
  const sp = smooth(fp(p, 0.0, 0.7));
  g.save();
  g.globalAlpha = 0.30 * sp * (1 - smooth(fp(p, 0.6, 1)));
  const sg = g.createLinearGradient(0, cy - ch * 0.5, 0, cy - ch * 0.5 - L.h * 0.22 * sp);
  sg.addColorStop(0, hexA(GOLD, 0.55));
  sg.addColorStop(1, hexA(GOLD, 0));
  g.fillStyle = sg;
  g.fillRect(cx - cw * 0.34, cy - ch * 0.5 - L.h * 0.22 * sp, cw * 0.68, L.h * 0.22 * sp);
  g.restore();
}

