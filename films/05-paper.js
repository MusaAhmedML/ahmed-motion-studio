// FILM 05 — "THE PAGE" · paper / exam-sheet route
// The hand-made-look route without any raster assets: paper is generated as a
// noise-textured surface, the writing is a real stroke polyline that draws on,
// and the fold is a 3D-ish quad transform done in 2D canvas maths.
import { C, F, bg, vignette, grain, text, block, setType, rule, hairline,
         monogram, wordmark, ctaPill, footRail, fitText, measure } from '../lib/brand.js';
import { clamp, lerp, inv, smooth, spring, env, rng, makeNoise, TAU } from '../lib/motion.js';

const DUR = 34;
const nf = makeNoise(5150);
const nb = makeNoise(777);

// Paper fibre texture generated per frame, deterministically.
function paper(g, L, x, y, w, h, t, { fold = 0, flip = false } = {}) {
  const tilt = Math.sin(t * 0.42) * 0.012;
  g.save();
  g.translate(x + w / 2, y + h / 2);
  g.transform(1, tilt, 0, 1, 0, 0);
  if (flip) g.scale(-1, 1);
  g.translate(-w / 2, -h / 2);
  // drop shadow
  g.save();
  g.shadowColor = 'rgba(0,0,0,0.75)'; g.shadowBlur = L.tHero * 0.16; g.shadowOffsetY = L.tHero * 0.05;
  g.fillStyle = '#efece3';
  g.fillRect(0, 0, w, h);
  g.restore();
  // fibre speckle
  g.save();
  g.globalAlpha = 0.16;
  const r = rng(4242);
  for (let i = 0; i < 220; i++) {
    const px = r() * w, py = r() * h;
    const v = nb(i * 0.31 + t * 0.02);
    g.fillStyle = v > 0.5 ? '#d9d4c6' : '#fbf9f3';
    g.fillRect(px, py, 1.6, 1.6);
  }
  g.restore();
  // fold shadow down the middle when fold > 0
  if (fold > 0.01) {
    const fw = w * 0.085;
    const fg = g.createLinearGradient(w * 0.5 - fw, 0, w * 0.5, 0);
    fg.addColorStop(0.00, 'rgba(0,0,0,0)');
    fg.addColorStop(0.55, `rgba(0,0,0,${0.13 * fold})`);
    fg.addColorStop(1.00, `rgba(0,0,0,${0.05 * fold})`);
    g.fillStyle = fg;
    g.fillRect(w * 0.5 - fw, 0, fw, h);
    const fg2 = g.createLinearGradient(w * 0.5, 0, w * 0.5 + fw * 0.6, 0);
    fg2.addColorStop(0, `rgba(255,255,255,${0.09 * fold})`);
    fg2.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = fg2;
    g.fillRect(w * 0.5, 0, fw * 0.6, h);
  }
  // edge darkening so it isn't a flat rectangle
  const vg = g.createLinearGradient(0, 0, 0, h);
  vg.addColorStop(0, 'rgba(0,0,0,0.10)');
  vg.addColorStop(0.18, 'rgba(0,0,0,0)');
  vg.addColorStop(0.85, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.12)');
  g.fillStyle = vg;
  g.fillRect(0, 0, w, h);
  g.restore();
}

// A handwritten-looking stroke: jittered polyline, drawn on progressively.
function handStroke(g, pts, { colour = '#1b2430', width = 3.2, p = 1, seed = 3 } = {}) {
  if (p <= 0.002 || pts.length < 2) return;
  const r = rng(seed);
  const jit = width * 0.16;
  g.save();
  g.strokeStyle = colour;
  g.lineWidth = width;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.beginPath();
  const n = Math.max(2, Math.round(pts.length * clamp(p)));
  for (let i = 0; i < n; i++) {
    const jx = (r() - 0.5) * jit, jy = (r() - 0.5) * jit;
    if (i === 0) g.moveTo(pts[i][0] + jx, pts[i][1] + jy);
    else g.lineTo(pts[i][0] + jx, pts[i][1] + jy);
  }
  g.stroke();
  g.restore();
}

// Underline flourish that sweeps left to right.
function flourish(g, x0, x1, y, p, colour = C.crimson, width = 4) {
  if (p <= 0.002) return;
  const e = smooth(clamp(p));
  const x = lerp(x0, x1, e);
  g.save();
  g.strokeStyle = colour;
  g.lineWidth = width;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(x0, y);
  g.lineTo(x, y - Math.sin(e * Math.PI) * 3.5);
  g.stroke();
  g.restore();
}

const SC = [
  // 0-8: a blank sheet lies on the desk, then the question writes itself.
  { frm: 0, to: 8, draw(g, L, t, dt) {
      const pw = L.w * 0.86, ph = pw * 1.30;
      const px = (L.w - pw) / 2, py = L.h * 0.075;
      const drop = clamp(spring(dt, 150, 22));
      const sc = lerp(0.90, 1, drop);
      g.save();
      g.translate(L.cx, py + ph / 2); g.scale(sc, sc); g.translate(-L.cx, -(py + ph / 2));
      paper(g, L, px, py, pw, ph, t, { fold: 0.3 * drop });
      // printed question
      g.save();
      g.globalAlpha = 0.85 * drop;
      text(g, 'Q3', px + pw * 0.10, py + ph * 0.115, { font: F.display(700, L.tSmall * 0.86), fill: '#1b2430', align: 'left', track: -0.01 });
      text(g, '(4 marks)', px + pw * 0.90, py + ph * 0.115, { font: F.mono(500, L.tMicro), fill: '#6b7280', align: 'right', track: 0.02 });
      g.restore();
      const lw = pw * 0.80, lx = px + pw * 0.10;
      const qLines = ['Solve for x:', '', '  3x + 7 = 2x − 19'];
      qLines.forEach((ln, i) => {
        if (!ln) return;
        text(g, ln, lx, py + ph * (0.185 + i * 0.058), {
          font: F.display(400, L.tSmall * 0.94), fill: '#1b2430', align: 'left', track: -0.005,
          alpha: clamp(spring(dt - 0.5 - i * 0.12, 200, 26)) * 0.9,
        });
      });
      // answer line
      g.save();
      g.globalAlpha = 0.35 * drop;
      g.fillStyle = '#9ca3af';
      g.fillRect(lx, py + ph * 0.30, lw, 1.2);
      g.restore();
      // the working, in hand, drawn on in stages
      const w1 = clamp((dt - 1.5) / 1.1);
      handStroke(g, [[lx + lw * 0.02, py + ph * 0.40], [lx + lw * 0.30, py + ph * 0.40]], { p: w1, seed: 11, width: L.tMicro * 0.16 });
      handStroke(g, [[lx + lw * 0.02, py + ph * 0.475], [lx + lw * 0.32, py + ph * 0.475]], { p: clamp((dt - 1.9) / 1.1), seed: 12, width: L.tMicro * 0.16 });
      text(g, '− 2x', lx + lw * 0.335, py + ph * 0.475, { font: F.display(400, L.tSmall * 0.90), fill: '#1b2430', align: 'left', alpha: clamp((dt - 2.6) * 4) });
      const w2 = clamp((dt - 2.9) / 1.1);
      handStroke(g, [[lx + lw * 0.02, py + ph * 0.555], [lx + lw * 0.30, py + ph * 0.555]], { p: w2, seed: 13, width: L.tMicro * 0.16 });
      text(g, 'x + 7 = −19', lx + lw * 0.03, py + ph * 0.635, {
        font: F.display(400, L.tSmall * 0.90), fill: '#1b2430', align: 'left',
        alpha: clamp(spring(dt - 3.4, 200, 26)),
      });
      const w3 = clamp((dt - 3.9) / 1.0);
      handStroke(g, [[lx + lw * 0.02, py + ph * 0.715], [lx + lw * 0.22, py + ph * 0.715]], { p: w3, seed: 14, width: L.tMicro * 0.16 });
      flourish(g, lx + lw * 0.235, lx + lw * 0.50, py + ph * 0.715, clamp((dt - 4.4) / 0.9), '#1b2430', L.tMicro * 0.20);
      const w4 = clamp((dt - 5.0) / 1.0);
      handStroke(g, [[lx + lw * 0.02, py + ph * 0.815], [lx + lw * 0.16, py + ph * 0.815]], { p: w4, seed: 15, width: L.tMicro * 0.16 });
      text(g, 'x = −26', lx + lw * 0.03, py + ph * 0.885, {
        font: F.display(800, L.tSmall * 1.18), fill: '#0f172a', align: 'left',
        alpha: clamp(spring(dt - 5.6, 230, 24)),
      });
      // mark awarded, in crimson, stamped
      const st = clamp(spring(dt - 6.4, 260, 20));
      if (st > 0.01) {
        g.save();
        g.globalAlpha = st * 0.95;
        g.translate(px + pw * 0.80, py + ph * 0.865);
        g.rotate(-0.20);
        const rr = L.tSmall * 1.15 * lerp(1.55, 1, st);
        g.rotate(-0.16);
        g.strokeStyle = C.crimson;
        g.lineWidth = Math.max(3, L.tMicro * 0.20);
        g.beginPath(); g.roundRect(-rr, -rr * 0.62, rr * 2, rr * 1.24, rr * 0.18); g.stroke();
        text(g, '4/4', 0, rr * 0.26, { font: F.display(800, L.tSmall * 1.45), fill: C.crimson, track: -0.03 });
        g.restore();
      }
      g.restore();
      vignette(g, L, 0.66);
      grain(g, L, t, 6);
    }},
  // 8-20: the page folds away and the point lands.
  { frm: 8, to: 20, draw(g, L, t, dt) {
      const a = env(t, 8, 20, 0.5);
      g.save(); g.globalAlpha = a * (1 - clamp((dt - 0.1) / 0.9));
      const pw = L.w * 0.86, ph = pw * 1.30;
      const px = (L.w - pw) / 2, py = L.h * 0.075;
      const fold = clamp(dt / 1.0);
      // fold the sheet in half: left half compresses toward the crease
      g.save();
      g.translate(L.cx, py + ph / 2);
      g.scale(lerp(1, 0.06, smooth(fold)) * (1 + fold * 0.5), lerp(1, 1.06, fold));
      g.translate(-L.cx, -(py + ph / 2));
      paper(g, L, px, py, pw, ph, t, { fold });
      g.restore();
      g.restore();
      const p = clamp(spring(dt - 0.55, 150, 23));
      g.save(); g.globalAlpha = p;
      g.fillStyle = 'rgba(10,10,12,0.72)';
      g.fillRect(0, L.h * 0.30, L.w, L.h * 0.42);
      block(g, 'Four marks.', L.cx, L.h * 0.415, {
        font: F.display(300, L.tBig * 0.86), track: -0.04, lh: L.tBig * 1.06,
        fill: C.boneDim, align: 'center', maxW: L.w - L.mx * 2,
      });
      block(g, 'Three steps.', L.cx, L.h * 0.415 + L.tBig * 1.02, {
        font: F.display(800, L.tBig * 0.86), track: -0.045, lh: L.tBig * 1.06,
        fill: C.crimson, align: 'center', maxW: L.w - L.mx * 2,
      });
      block(g, 'That is the entire method. Every question. Every subject.', L.cx, L.h * 0.600, {
        font: F.mono(500, L.tSmall * 0.82), lh: L.tSmall * 1.24, fill: C.boneDim, track: 0.02,
        maxW: L.w - L.mx * 2.4, alpha: clamp(spring(dt - 0.9, 180, 26)),
      });
      g.restore();
      vignette(g, L, 0.58);
    }},
  // 20-34: brand last, on paper-coloured card.
  { frm: 20, to: 34, draw(g, L, t, dt) {
      const p = clamp(spring(dt, 160, 24));
      const pw = L.w * 0.80, ph = pw * 0.72;
      const px = (L.w - pw) / 2, py = L.h * 0.14;
      g.save(); g.globalAlpha = p;
      g.translate(L.cx, py + ph / 2); g.scale(lerp(0.9, 1, p), lerp(0.9, 1, p)); g.translate(-L.cx, -(py + ph / 2));
      paper(g, L, px, py, pw, ph, t, { fold: 0.15 * p });
      text(g, 'AHMED ACADEMY', px + pw / 2, py + ph * 0.235, {
        font: F.display(650, L.tSmall * 1.05), fill: '#1b2430', track: 0.14,
      });
      g.save();
      g.globalAlpha = p;
      g.fillStyle = C.crimson;
      g.fillRect(px + pw * 0.36, py + ph * 0.285, pw * 0.28, Math.max(2, L.tMicro * 0.09));
      g.restore();
      text(g, 'I DID IT. SO I WILL SHOW YOU.', px + pw / 2, py + ph * 0.415, {
        font: F.display(400, L.tSmall * 0.80), fill: '#4b5563', track: 0.03,
        alpha: clamp(spring(dt - 0.3, 180, 26)),
      });
      const rows = [['A*A*AAA', 'at A-Level'], ['Manchester · Edinburgh', 'university offers'], ['Straight 9s and 8s', 'tutored subjects']];
      rows.forEach((r, i) => {
        const rp = clamp(spring(dt - 0.55 - i * 0.15, 230, 24));
        const y = py + ph * (0.500 + i * 0.155);
        const titleFont = fitText(g, r[0], F.display(700, L.tSmall * 0.74), -0.01, pw * 0.44).font;
        text(g, r[0], px + pw * 0.12, y, { font: titleFont, fill: '#1b2430', align: 'left', alpha: rp });
        text(g, r[1], px + pw * 0.88, y, { font: F.mono(500, L.tMicro), fill: '#6b7280', align: 'right', alpha: rp });
        // underline sits clear BELOW the baseline: never a strikethrough
        flourish(g, px + pw * 0.12, px + pw * (0.12 + 0.30 * rp), y + L.tSmall * 0.24, rp, C.crimson, L.tMicro * 0.09);
      });
      g.restore();
      // CTA on obsidian below the card
      ctaPill(g, L, L.cx, py + ph + L.tHero * 0.42, 0.92, clamp(spring(dt - 1.05, 200, 24)));
      footRail(g, L, clamp(spring(dt - 1.3, 160, 28)));
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
  // First two beats run on a warm desk, not obsidian.
  if (tt < 20) {
    const gr = g.createLinearGradient(0, 0, 0, L.h);
    gr.addColorStop(0, '#16161c');
    gr.addColorStop(0.55, '#1d1c22');
    gr.addColorStop(1, '#0d0d11');
    g.fillStyle = gr; g.fillRect(0, 0, L.w, L.h);
  } else {
    bg(g, L, tt);
  }
  for (const s of SC) if (tt >= s.frm && tt < s.to) { s.draw(g, L, tt, tt - s.frm); return; }
}

export const sfx = [
  { t: 0.02, type: 'swell' },
  { t: 1.5, type: 'tick' }, { t: 1.9, type: 'tick' }, { t: 2.6, type: 'pop' },
  { t: 2.9, type: 'tick' }, { t: 3.4, type: 'tick' }, { t: 3.9, type: 'tick' },
  { t: 4.4, type: 'tick' }, { t: 5.0, type: 'tick' }, { t: 5.6, type: 'hit' },
  { t: 6.4, type: 'hit' },
  { t: 8.0, type: 'whoosh' },
  { t: 8.55, type: 'pop' },
  { t: 9.8, type: 'tick' },
  { t: 20.0, type: 'swell' },
  { t: 21.4, type: 'pop' },
  { t: 22.5, type: 'tick' }, { t: 23.2, type: 'tick' }, { t: 23.9, type: 'hit' },
];
