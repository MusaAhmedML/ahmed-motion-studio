// FILM 15 — "BRAND REEL" · frame-exact port of AcademyBrandReel.tsx
//
// This is a faithful rebuild of the Remotion brand film in the studio's canvas
// engine. Same text, same beat map, same springs, same palette, same audio cues —
// nothing invented. Driven in FRAMES (30fps) so every animation lands on the same
// frame it did in Remotion.
//
// Source of truth: ~/.remotion_runtime_brag/src/brag/AcademyBrandReel.tsx
import { lerpClamp, remotionSpring, enter, exitFade, fadeOut } from '../lib/remotion-math.js';
import { plate } from '../lib/assets.js';

export const FPS = 30;
export const DURATION = 600;                    // 20.0s, unchanged

const BEAT = {
  hook:   { from: 0,   dur: 78 },               // 0.0  - 2.6
  brand:  { from: 72,  dur: 66 },               // 2.4  - 4.6
  method: { from: 132, dur: 156 },              // 4.4  - 9.6
  offer:  { from: 282, dur: 156 },              // 9.4  - 14.6
  cta:    { from: 430, dur: 170 },              // 14.3 - 20.0
};

/* Palette — titanium / obsidian / crimson. Verbatim. */
const C = {
  bg: '#07080c', bgDeep: '#040407',
  titanium: '#eef1f5', steel: '#c3c9d4', dim: '#828b99', faint: '#4a5261',
  crimson: '#dc2626', crimsonLit: '#f04a4a', crimsonDeep: '#7f1d1d',
};

const FD = (w, px) => `${w} ${px}px "Inter Tight", "Liberation Sans", sans-serif`;
const FB = (w, px) => `${w} ${px}px Inter, "Liberation Sans", sans-serif`;

export const assets = ['brag/logo.png', 'brag/headshot_endcard.png'];

// Canvas letter-spacing is in em; the source specifies px offsets at scale S.
// The divisor MUST be the font's own pixel size — a fixed divisor silently only
// works for 100px type, which is why tracking looked wrong everywhere else.
const lsEm = (px, S, fontPx) => `${(px * S) / fontPx}em`;
const fontPxOf = (font) => parseInt(font.match(/(\d+)px/)[1], 10);

function drawText(g, str, x, y, { font, fill, ls = 0, align = 'center', alpha = 1, shadow = null }) {
  if (alpha <= 0.002) return;
  g.save();
  g.globalAlpha *= alpha;   // multiply: respect the enclosing beat's fade
  g.font = font;
  g.letterSpacing = lsEm(ls, 1, fontPxOf(font));
  g.fillStyle = fill;
  g.textAlign = align;
  g.textBaseline = 'middle';
  if (shadow) { g.shadowColor = shadow[0]; g.shadowBlur = shadow[1]; }
  g.fillText(str, x, y);
  g.restore();
}

/* ---------- Stage: shared background system ---------- */
function Stage(g, L, F, energy, S, vertical) {
  g.fillStyle = C.bg;
  g.fillRect(0, 0, L.w, L.h);

  // Base radial — crimson bloom tracks the energy curve.
  //
  // The CSS version transitions from a TRANSLUCENT crimson to an OPAQUE near-black.
  // CSS interpolates premultiplied, so that yields a very dark falloff; canvas
  // interpolates raw RGBA and turns the same gradient into a red wash. So the
  // inner stop is pre-composited against the base colour and every stop is
  // opaque, which reproduces the original's appearance rather than its syntax.
  const cx = L.w / 2, cy = L.h * 0.42;
  const a = 0.1 + energy * 0.16;
  const base = [7, 8, 12];                       // C.bg
  const lit = base.map((b, i) => Math.round([220, 38, 38][i] * a + b * (1 - a)));
  const R = Math.round(Math.max(L.w, L.h) * 0.62);
  const rad = g.createRadialGradient(cx, cy, 0, cx, cy, R);
  rad.addColorStop(0.00, `rgb(${lit[0]},${lit[1]},${lit[2]})`);
  rad.addColorStop(0.30, `rgb(${Math.round(lit[0]*0.45+base[0]*0.55)},${Math.round(lit[1]*0.45+base[1]*0.55)},${Math.round(lit[2]*0.45+base[2]*0.55)})`);
  rad.addColorStop(0.62, 'rgb(10,11,16)');
  rad.addColorStop(1.00, C.bgDeep);
  g.fillStyle = rad;
  g.fillRect(0, 0, L.w, L.h);

  // titanium grid, 64px
  g.save();
  g.strokeStyle = 'rgba(195,201,212,0.05)';
  g.lineWidth = 1;
  const step = 64 * (vertical ? 1 : S);
  for (let x = 0; x <= L.w; x += step) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, L.h); g.stroke(); }
  for (let y = 0; y <= L.h; y += step) { g.beginPath(); g.moveTo(0, y); g.lineTo(L.w, y); g.stroke(); }
  g.restore();

  // slow drifting scanline sheen
  const t = F / FPS;
  const sy = 18 + ((t * 9) % 64);
  const sg = g.createLinearGradient(0, (sy / 100) * L.h, 0, ((sy + 8) / 100) * L.h);
  sg.addColorStop(0, 'rgba(238,241,245,0)');
  sg.addColorStop(0.5, 'rgba(238,241,245,0.035)');
  sg.addColorStop(1, 'rgba(238,241,245,0)');
  g.fillStyle = sg;
  g.fillRect(0, ((sy - 4) / 100) * L.h, L.w, (16 / 100) * L.h);

  // vignette
  const vg = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(L.w, L.h) * 0.60);
  vg.addColorStop(0.00, 'rgba(4,4,7,0)');
  vg.addColorStop(0.45, 'rgba(4,4,7,0)');
  vg.addColorStop(1.00, 'rgba(4,4,7,0.88)');
  g.fillStyle = vg;
  g.fillRect(0, 0, L.w, L.h);
}

/* ---------- Hook ---------- */
function Hook(g, L, F, S, vertical) {
  const at = 6;
  const p = enter(F, at, FPS, 14);
  const logoSize = Math.min(L.w * (vertical ? 0.86 : 0.34), L.h * (vertical ? 0.46 : 0.62)) * S;
  const sweep = lerpClamp(F, [at + 6, at + 30], [-60, 160]);
  const out = fadeOut(F, BEAT.hook.dur);
  const ls = lerpClamp(F, [at + 4, at + 26], [0.9, 0.16]);
  const labelOpacity = lerpClamp(F, [at + 20, at + 32], [0, 1]);

  const cx = L.cx, cy = beatCY(L);
  const logo = plate('brag/logo.png');
  g.save();
  g.globalAlpha = out;
  const sc = lerpClamp(p, [0, 1], [1.22, 1]);
  g.translate(cx, cy);
  g.scale(sc, sc);

  if (logo) {
    g.save();
    g.shadowColor = `rgba(220,38,38,0.5)`;
    g.shadowBlur = 34 * S;
    g.globalAlpha = out * lerpClamp(p, [0, 0.5, 1], [0, 0.35, 1]);
    const d = logoSize;
    g.drawImage(logo, -d / 2, -d / 2, d, d);
    g.restore();
    // specular sweep across the mark
    g.save();
    g.globalAlpha = out * 0.5;
    g.globalCompositeOperation = 'screen';
    const x0 = -d / 2;
    const sw = ((sweep - (-60)) / 220) * (d * 1.2);
    const sx = x0 + sw;
    const gr = g.createLinearGradient(sx - d * 0.16, 0, sx + d * 0.16, 0);
    gr.addColorStop(0, 'rgba(255,255,255,0)');
    gr.addColorStop(0.5, `rgba(255,255,255,${0.5 * out})`);
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(x0, -d / 2, d, d);
    g.restore();
  }

  // kicker — local coordinates, because the block is already translated to (cx, cy)
  drawText(g, 'GCSE & A-LEVEL TUITION', 0, logoSize / 2 + 34 * S + 12 * S, {
    font: FB(600, 21 * S), fill: C.steel, ls: ls * 62, alpha: labelOpacity,
  });
  g.restore();
}

/* ---------- Brand ---------- */
function Brand(g, L, F, S, vertical) {
  const f = F;
  const out = fadeOut(f, BEAT.brand.dur);
  const rise = remotionSpring(f, FPS, { damping: 200, mass: 0.6, stiffness: 100 });
  const ls = lerpClamp(f, [0, 26], [0.62, 0.03]);
  const rule = lerpClamp(f, [8, 30], [0, 1]);

  const cy = beatCY(L);
  const nameSize = (vertical ? 108 : 132) * S;
  const yName = cy - 40 * S;
  g.save();
  g.globalAlpha = out;
  g.translate(0, lerpClamp(rise, [0, 1], [26 * S, 0]));

  drawText(g, 'MUSA AHMED', L.cx, yName, {
    font: FD(800, nameSize), fill: C.titanium, ls: ls * 78,
    shadow: ['rgba(238,241,245,0.18)', 44 * S],
  });

  // crimson rule grows from the centre
  const rw = lerpClamp(rule, [0, 1], [0, (vertical ? 430 : 640)]) * S;
  const rh = 3 * S;
  const ry = yName + nameSize * 0.5 + 30 * S;
  if (rw > 0.5) {
    const gr = g.createLinearGradient(L.cx - rw / 2, 0, L.cx + rw / 2, 0);
    gr.addColorStop(0, 'rgba(220,38,38,0)');
    gr.addColorStop(0.5, C.crimson);
    gr.addColorStop(1, 'rgba(220,38,38,0)');
    g.fillStyle = gr;
    g.fillRect(L.cx - rw / 2, ry, rw, rh);
  }

  drawText(g, 'DIAGNOSTIC-LED TEACHING', L.cx, ry + rh + 26 * S + 15 * S, {
    font: FB(500, 30 * S), fill: C.dim, ls: 10,
    alpha: lerpClamp(f, [14, 34], [0, 1]),
  });
  g.restore();
}

/* ---------- Method ---------- */
function Method(g, L, F, S, vertical) {
  const f = F;
  const out = fadeOut(f, BEAT.method.dur);
  const aIn = remotionSpring(f, FPS, { damping: 200, mass: 0.7, stiffness: 100 });
  const aFade = lerpClamp(f, [86, 104], [1, 0.16]);
  const bAt = 96;
  const bIn = remotionSpring(f - bAt, FPS, { damping: 16, mass: 0.9, stiffness: 100 });
  const bOpacity = lerpClamp(f, [bAt, bAt + 8], [0, 1]);

  const D = (typeof window !== 'undefined' && window.__daily) || null;
  const A = (D && D.setup) || 'Most tuition starts with a guess.';
  const B1 = (D && D.a) || 'We start with a';
  const B2 = (D && D.b) || 'diagnosis.';

  g.save();
  g.globalAlpha = out;

  // LINE A — recedes upward as it hands off
  const aY = beatCY(L) + lerpClamp(aIn, [0, 1], [22 * S, 0])
    + lerpClamp(f, [bAt - 4, bAt + 34], [0, -208 * S])
    + 40 * S;
  const aScale = lerpClamp(f, [0, 104], [1, 0.9]);
  g.save();
  g.globalAlpha = out * aFade;
  g.translate(L.cx, aY);
  g.scale(aScale, aScale);
  drawText(g, A, 0, 0, { font: FB(400, (vertical ? 46 : 56) * S), fill: C.dim });
  const uw = lerpClamp(aIn, [0, 1], [0, 190]) * S;
  const uh = 2 * S;
  if (uw > 0.5) {
    const gr = g.createLinearGradient(-uw / 2, 0, uw / 2, 0);
    gr.addColorStop(0, 'rgba(74,82,97,0)');
    gr.addColorStop(0.5, C.faint);
    gr.addColorStop(1, 'rgba(74,82,97,0)');
    g.fillStyle = gr;
    g.fillRect(-uw / 2, (vertical ? 46 : 56) * S * 0.5 + 20 * S, uw, uh);
  }
  g.restore();

  // LINE B
  g.save();
  g.globalAlpha = out * bOpacity;
  const bY = beatCY(L) + lerpClamp(bIn, [0, 1], [34 * S, 0]) + 26 * S;
  g.translate(L.cx, bY);
  const bs = lerpClamp(bIn, [0, 1], [0.94, 1]);
  g.scale(bs, bs);
  drawText(g, B1, 0, -(vertical ? 50 : 62) * S, {
    font: FB(500, (vertical ? 50 : 62) * S), fill: C.steel, ls: -0.5,
  });
  drawText(g, B2, 0, (vertical ? 44 : 56) * S, {
    font: FD(800, (vertical ? 96 : 122) * S), fill: C.titanium, ls: -2.2,
    shadow: ['rgba(220,38,38,0.3)', 30 * S],
  });
  g.restore();
  g.restore();
}

/* ---------- Offer ---------- */
const OFFER_LINES = [
  { text: 'GCSE and A-Level.' },
  { text: 'One-to-one or small group.' },
  { text: "Your child's level,", sub: 'not the year group.' },
];

function Offer(g, L, F, S, vertical) {
  const f = F;
  const out = fadeOut(f, BEAT.offer.dur);
  const gap = 40 * S;
  const rowH = (vertical ? 54 : 62) * S;
  const size = (vertical ? 62 : 76) * S;
  const subSize = (vertical ? 46 : 56) * S;
  // total stack height, centred
  let total = 0;
  OFFER_LINES.forEach((l, i) => { total += rowH + (i ? gap : 0) + (l.sub ? subSize * 1.15 : 0); });
  let y = beatCY(L) - total / 2;

  g.save();
  g.globalAlpha = out;
  OFFER_LINES.forEach((line, i) => {
    const at = i * 40;
    const p = remotionSpring(f - at, FPS, { damping: 18, mass: 0.8, stiffness: 100 });
    const isLast = i === OFFER_LINES.length - 1;
    const op = lerpClamp(f - at, [0, 6], [0, 1]);
    const dx = lerpClamp(p, [0, 1], [-38 * S, 0]);

    // widest row sets the block width so the stack stays visually centred
    g.save();
    g.font = FD(isLast ? 800 : 600, size);
    g.letterSpacing = lsEm(-1.4, 1, fontPxOf(FD(isLast ? 800 : 600, size)));
    const tw = g.measureText(line.text).width;
    g.restore();
    const subW = line.sub ? (() => { g.save(); g.font = FB(500, subSize); g.letterSpacing = lsEm(-0.4, 1, subSize); const w = g.measureText(line.sub).width; g.restore(); return w; })() : 0;
    const blockW = Math.max(tw, subW) + 3 * S + 26 * S;

    g.save();
    g.globalAlpha = op * out;
    g.translate(L.cx + dx, y + rowH / 2);
    // crimson rule marker scales up from its centre
    const mrk = lerpClamp(p, [0, 1], [0, 1]);
    const mg = g.createLinearGradient(0, -rowH / 2, 0, rowH / 2);
    mg.addColorStop(0, C.crimsonLit);
    mg.addColorStop(1, C.crimsonDeep);
    g.fillStyle = mg;
    g.save();
    g.translate(-blockW / 2, 0);
    g.scale(1, mrk);
    g.fillRect(0, -rowH / 2, 3 * S, rowH);
    g.restore();
    const tx = -blockW / 2 + 3 * S + 26 * S;
    g.save();
    g.shadowColor = isLast ? 'rgba(220,38,38,0.4)' : 'transparent';
    g.shadowBlur = isLast ? 40 * S : 0;
    drawText(g, line.text, tx, line.sub ? -(subSize * 0.62) : 0, {
      font: FD(isLast ? 800 : 600, size),
      fill: isLast ? C.titanium : C.steel, ls: -1.4, align: 'left',
    });
    g.restore();
    if (line.sub) {
      drawText(g, line.sub, tx, (subSize * 0.78), {
        font: FB(500, subSize), fill: C.dim, ls: -0.4, align: 'left',
      });
    }
    g.restore();
    y += rowH + (i ? gap : 0) + (line.sub ? subSize * 1.15 : 0);
  });
  g.restore();
}

/* ---------- CTA (holds to the final frame) ---------- */
const CTA_LINES = ['Free trial session'];

// offscreen silhouette buffer for the end-card rim light
let _sil = null, _silG = null;

function Cta(g, L, F, S, vertical, W, H) {
  const f = F;
  const dur = BEAT.cta.dur;
  const out = 1;
  const p = remotionSpring(f, FPS, { damping: 200, mass: 0.7, stiffness: 100 });
  const headIn = remotionSpring(f - 6, FPS, { damping: 22, mass: 0.9, stiffness: 100 });
  const drift = lerpClamp(f, [0, dur], [0, -12 * S]);

  const headSize = (vertical ? 0.3 : 0.62) * H;
  const headW = headSize * 0.75 * S, headH = headSize * S;

  g.save();
  g.globalAlpha = out;
  g.translate(0, drift);

  // vertical stack: portrait above type
  const typeW = (vertical ? 186 : 224) * S;
  // logo (square) + marginBottom + CTA line + marginTop + email + marginTop + domain
  const typeH = typeW
    + (vertical ? 26 : 30) * S
    + (vertical ? 74 : 86) * S * 1.02
    + (vertical ? 30 : 34) * S
    + (vertical ? 38 : 44) * S * 1.2
    + (vertical ? 12 : 14) * S
    + (vertical ? 30 : 34) * S * 1.2;
  const gapOuter = (vertical ? 54 : 86) * S;
  const totalH = headH + gapOuter + typeH;
  let y = beatCY(L) - totalH / 2;

  // portrait
  g.save();
  g.globalAlpha = lerpClamp(headIn, [0, 0.5, 1], [0, 0.4, 1]);
  g.translate(L.cx - headW / 2, y);
  g.scale(lerpClamp(headIn, [0, 1], [1.1, 1]), lerpClamp(headIn, [0, 1], [1.1, 1]));
  // Crimson edge-light.
  //
  // The source stacks a blurred crimson div BEHIND the masked portrait, so the
  // glow survives around the silhouette. Masking the glow on the same canvas
  // erases it (destination-in hits the glow too), which just leaves a flat red
  // rectangle. So the silhouette is rasterised offscreen first, the glow is
  // drawn from a scaled copy of it, then the crisp masked portrait goes on top.
  const hs = plate('brag/headshot_endcard.png');
  if (hs) {
    const iw = hs.naturalWidth, ih = hs.naturalHeight;
    const target = headW / headH, sr = iw / ih;
    let dw = headW, dh = headH, dx = 0, dy = 0;
    if (sr > target) { dw = headH * sr; dx = -(dw - headW) * 0.5; }
    else { dh = headW / sr; dy = -(dh - headH) * 0.22; }

    if (!_sil || _sil.width !== Math.round(headW) || _sil.height !== Math.round(headH)) {
      _sil = document.createElement('canvas');
      _sil.width = Math.max(1, Math.round(headW));
      _sil.height = Math.max(1, Math.round(headH));
      _silG = _sil.getContext('2d');
    }
    _silG.setTransform(1, 0, 0, 1, 0, 0);
    _silG.clearRect(0, 0, _sil.width, _sil.height);
    _silG.globalCompositeOperation = 'source-over';
    _silG.drawImage(hs, dx, dy, dw, dh);
    // radial mask melts the dark studio bg into the stage
    // The CSS mask is an ELLIPSE (78% x 74%), not a circle. Scaling into unit
    // space is the only way to get two independent radii out of canvas.
    _silG.globalCompositeOperation = 'destination-in';
    _silG.save();
    _silG.translate(headW / 2, headH * 0.38);
    _silG.scale(0.78 * headW, 0.74 * headH);
    const mg = _silG.createRadialGradient(0, 0, 0, 0, 0, 1);
    mg.addColorStop(0.00, 'rgba(0,0,0,1)');
    mg.addColorStop(0.58, 'rgba(0,0,0,1)');
    mg.addColorStop(1.00, 'rgba(0,0,0,0)');
    _silG.fillStyle = mg;
    _silG.fillRect(-1, -1, 2, 2);
    _silG.restore();
    _silG.globalCompositeOperation = 'source-over';

    // Glow FIRST, unmasked — the source puts a blurred crimson div behind the
    // portrait, so it reads as a directional rim on the top-left edge, not as a
    // symmetric halo. Drawing it from the silhouette would radiate every side.
    g.save();
    g.filter = `blur(${14 * S}px)`;
    g.globalAlpha = 0.85;
    const eg = g.createLinearGradient(0, 0, headW, headH);
    eg.addColorStop(0.00, C.crimson);
    eg.addColorStop(0.45, C.crimsonDeep);
    eg.addColorStop(0.70, 'rgba(127,29,29,0)');
    g.fillStyle = eg;
    g.fillRect(0, 0, headW, headH);
    g.restore();

    // crisp portrait on top
    g.drawImage(_sil, 0, 0, headW, headH);
  }
  // titanium hairline frame
  g.save();
  g.strokeStyle = 'rgba(195,201,212,0.22)';
  g.lineWidth = 1.5 * S;
  g.strokeRect(0, 0, headW, headH);
  g.restore();
  g.restore();

  y += headH + gapOuter;

  // type block
  g.save();
  g.globalAlpha = p;
  g.translate(L.cx, y);
  g.translate(0, lerpClamp(p, [0, 1], [24 * S, 0]));

  const logo = plate('brag/logo.png');
  const lw = typeW;
  if (logo) {
    g.save();
    g.globalAlpha = lerpClamp(f, [4, 20], [0, 0.95]);
    const lh = lw * (logo.naturalHeight / logo.naturalWidth);
    g.drawImage(logo, -lw / 2, 0, lw, lh);
    g.restore();
  }
  let ty = (vertical ? 26 : 30) * S + (logo ? lw * (logo.naturalHeight / logo.naturalWidth) : 0);

  CTA_LINES.forEach((line) => {
    drawText(g, line, 0, ty + (vertical ? 74 : 86) * S * 0.5, {
      font: FD(800, (vertical ? 74 : 86) * S), fill: C.titanium, ls: -1.8,
      shadow: ['rgba(220,38,38,0.28)', 26 * S],
    });
    ty += (vertical ? 74 : 86) * S * 1.02;
  });

  ty += (vertical ? 30 : 34) * S;
  drawText(g, 'musa@musaahmed.uk', 0, ty + (vertical ? 38 : 44) * S * 0.6, {
    font: FB(600, (vertical ? 38 : 44) * S), fill: C.crimsonLit, ls: -0.2,
  });
  ty += (vertical ? 38 : 44) * S * 1.2 + (vertical ? 12 : 14) * S;
  drawText(g, 'musaahmed.uk', 0, ty + (vertical ? 30 : 34) * S * 0.6, {
    font: FB(500, (vertical ? 30 : 34) * S), fill: C.dim,
  });
  g.restore();
  g.restore();
}

// The source centres every beat at true 50% (justifyContent: center), not at the
// optical 46% this studio's layout helper uses elsewhere. Fidelity wins here.
const beatCY = (L) => L.h * 0.5;

export function setup() {}

export function draw(g, L, t) {
  const F = Math.round(t * FPS);
  const frame = ((F % DURATION) + DURATION) % DURATION;
  const vertical = L.h > L.w;
  const S = Math.min(L.w, L.h) / 1080;

  const energy = lerpClamp(frame, [0, 96, 240, 400, 470, DURATION], [0.06, 0.22, 0.5, 0.66, 1, 0.72]);

  Stage(g, L, frame, energy, S, vertical);

  // Sequences: local frame = global - from, bounded by duration.
  if (frame >= BEAT.hook.from && frame < BEAT.hook.from + BEAT.hook.dur) {
    Hook(g, L, frame - BEAT.hook.from, S, vertical);
  }
  if (frame >= BEAT.brand.from && frame < BEAT.brand.from + BEAT.brand.dur) {
    Brand(g, L, frame - BEAT.brand.from, S, vertical);
  }
  if (frame >= BEAT.method.from && frame < BEAT.method.from + BEAT.method.dur) {
    Method(g, L, frame - BEAT.method.from, S, vertical);
  }
  if (frame >= BEAT.offer.from && frame < BEAT.offer.from + BEAT.offer.dur) {
    Offer(g, L, frame - BEAT.offer.from, S, vertical);
  }
  if (frame >= BEAT.cta.from && frame < BEAT.cta.from + BEAT.cta.dur) {
    Cta(g, L, frame - BEAT.cta.from, S, vertical, L.w, L.h);
  }
}

// Audio cues are reproduced from the original mix. The SFX files ship in
// assets/brag/sfx; build_brag_audio.py assembles them onto the track at the
// exact frames the Remotion version used.
export const sfx = [];