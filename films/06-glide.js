// FILM 06 — "THE PRODUCT" · real-UI motion, the glide deck
// This is the production site's actual panel-glide interaction (scroll-snap decks,
// 950ms cooldown, exact-fit panels) animated for camera. Never invent the UI:
// every panel here is drawn from the real brand blueprint content.
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
import { clamp, lerp, inv, smooth, spring, env } from '../lib/motion.js';
import { plate, coverFit, containFit } from '../lib/assets.js';

const DUR = 30;

// Panels in glide order. Real content from the Ahmed Academy blueprint.
const PANELS = [
  { id: 'hero',  k: 'Sovereign slogan', at: 0.0 },
  { id: 'musa',  k: 'Meet Musa',       at: 5.0 },
  { id: 'price', k: 'Tuition rates',   at: 10.0 },
  { id: 'subj',  k: 'Subjects',        at: 15.0 },
  { id: 'book',  k: 'Booking',         at: 20.0 },
];

function panelRect(L, i) {
  // exact-fit deck: each panel fills the viewport minus the header
  return { x: 0, y: i * L.h, w: L.w, h: L.h };
}

function drawPanel(g, L, id, yOff, t, dt, localAlpha) {
  const a = localAlpha;
  if (a <= 0.004) return;
  const { w, h } = { w: L.w, h: L.h };
  g.save();
  g.globalAlpha = a;
  g.translate(0, yOff);

  // panel body + inner tile
  g.fillStyle = C.obsidian;
  g.fillRect(0, 0, w, h);
  const tx = L.w * 0.06, ty = L.h * 0.145;
  const tw = w - tx * 2, th = h - ty - L.h * 0.085;
  g.fillStyle = 'rgba(18,19,26,0.55)';
  g.beginPath(); g.roundRect(tx, ty, tw, th, L.tMicro * 0.34); g.fill();
  g.strokeStyle = C.line; g.lineWidth = 2; g.stroke();

  if (id === 'hero') {
    g.save(); g.globalAlpha = a * clamp(spring(dt, 160, 22));
    g.translate(L.cx, ty + th * 0.30);
    brandMonogram(g, 0, 0, L.tBig * 0.80);
    g.restore();
    block(g, 'YOU HAVE THE', L.cx, ty + th * 0.58, {
      font: F.display(300, L.tBig * 0.58), track: -0.04, lh: L.tBig * 0.66,
      fill: C.boneDim, align: 'center', maxW: tw * 0.86,
      alpha: clamp(spring(dt - 0.18, 180, 26)),
    });
    block(g, 'POTENTIAL.', L.cx, ty + th * 0.58 + L.tBig * 0.70, {
      font: F.display(800, L.tBig * 0.58), track: -0.045, lh: L.tBig * 0.66,
      fill: C.crimson, align: 'center', maxW: tw * 0.86,
      alpha: clamp(spring(dt - 0.30, 180, 26)),
    });
    const cta = clamp(spring(dt - 0.5, 200, 24));
    if (cta > 0.01) {
      const bw = tw * 0.42 * cta, bh = L.tSmall * 2.1;
      g.save(); g.globalAlpha = a * cta;
      const gr = g.createLinearGradient(0, ty + th * 0.86, 0, ty + th * 0.86 + bh);
      gr.addColorStop(0, C.crimsonHi); gr.addColorStop(1, C.crimson);
      g.fillStyle = gr;
      g.beginPath(); g.roundRect(L.cx - bw / 2, ty + th * 0.86, bw, bh, bh * 0.22); g.fill();
      text(g, 'Book a free diagnostic', L.cx, ty + th * 0.86 + bh * 0.66, {
        font: fitText(g, 'Book a free diagnostic', F.display(700, L.tSmall * 0.82), -0.015, bw * 0.84).font,
        fill: '#fff',
      });
      g.restore();
    }
  }
  if (id === 'musa') {
    text(g, 'MEET MUSA', tx + tw * 0.06, ty + th * 0.14, { font: F.mono(700, L.tSmall * 0.76), fill: C.crimson, align: 'left', track: 0.14 });
    hairline(g, L, ty + th * 0.175, a * 0.5);
    // portrait placeholder: a real silhouette block, not a fake photo
    const pw = tw * 0.34, ph = th * 0.46;
    const px = tx + tw * 0.06, py = ty + th * 0.24;
    // A real photo plate slot: framed, corner marks, initials. Never a fake photo,
    // never a blob — it reads as "image goes here", which is honest and looks designed.
    const ip = clamp(spring(dt - 0.1, 170, 24));
    g.save();
    g.globalAlpha = a * ip;
    g.fillStyle = 'rgba(26,28,38,0.85)';
    g.beginPath(); g.roundRect(px, py, pw, ph, L.tMicro * 0.28); g.fill();
    g.strokeStyle = C.line; g.lineWidth = 2; g.stroke();
    // diagonal hatch so it reads as a placeholder
    g.save();
    g.beginPath(); g.roundRect(px, py, pw, ph, L.tMicro * 0.28); g.clip();
    g.strokeStyle = 'rgba(255,255,255,0.05)'; g.lineWidth = 2;
    for (let i = -ph; i < pw; i += Math.max(10, L.tMicro * 0.9)) {
      g.beginPath(); g.moveTo(px + i, py + ph); g.lineTo(px + i + ph, py); g.stroke();
    }
    g.restore();
    // corner registration marks
    g.strokeStyle = C.crimson; g.lineWidth = Math.max(2, L.tMicro * 0.10);
    const cm = Math.max(8, pw * 0.11);
    [[px, py, 1, 1], [px + pw, py, -1, 1], [px, py + ph, 1, -1], [px + pw, py + ph, -1, -1]]
      .forEach(([cx, cy, sx, sy]) => {
        g.beginPath();
        g.moveTo(cx + sx * 4, cy + sy * cm); g.lineTo(cx + sx * 4, cy + sy * 4); g.lineTo(cx + sx * cm, cy + sy * 4);
        g.stroke();
      });
    // The real headshot, not the "MA / HEADSHOT" placeholder this panel used to draw.
    // The daily reel ships a portrait panel; shipping the words "HEADSHOT" in it is not
    // shippable, and the face is the whole point of the panel.
    const pt = clamp(spring(dt - 0.25, 190, 24));
    if (pt > 0.004) {
      g.globalAlpha = a * pt;
      if (!coverFit(g, plate('face.jpg'), px, py, pw * pt, ph * pt, 12)) {
        text(g, 'MUSA AHMED', px + pw / 2, py + ph * 0.56, {
          font: F.display(700, pw * 0.20), fill: 'rgba(245,245,244,0.22)', track: -0.02,
        });
      }
    }
    g.restore();
    const bullets = [
      'A*A*AAA at A-Level',
      'Manchester · Edinburgh · Glasgow · Liverpool',
      'Straight 9s and 8s, tutored subjects',
      'EPQ 54/54 full marks',
    ];
    bullets.forEach((b, i) => {
      const bp = clamp(spring(dt - 0.28 - i * 0.11, 230, 24));
      const y = py + ph * (0.06 + i * 0.145);
      g.save(); g.globalAlpha = a * bp * 0.95;
      g.strokeStyle = C.crimson; g.lineWidth = L.tMicro * 0.16;
      g.lineCap = 'round'; g.lineJoin = 'round';
      const sx = tx + tw * 0.47, sy = y;
      const s2 = L.tSmall * 0.52;
      g.beginPath();
      g.moveTo(sx, sy); g.lineTo(sx + s2 * 0.34 * bp, sy + s2 * 0.36 * bp);
      g.lineTo(sx + s2 * 0.95 * bp, sy - s2 * 0.36 * bp);
      g.stroke(); g.restore();
      text(g, b, sx + s2 * 1.5, y + L.tSmall * 0.18, {
        font: fitText(g, b, F.mono(600, L.tSmall * 0.70), 0.02, tx + tw - (sx + s2 * 1.5) - tw * 0.04).font,
        fill: C.bone, align: 'left', track: 0.02, alpha: bp,
      });
    });
  }
  if (id === 'price') {
    text(g, 'TUITION RATES', tx + tw * 0.06, ty + th * 0.14, { font: F.mono(700, L.tSmall * 0.76), fill: C.crimson, align: 'left', track: 0.14 });
    hairline(g, L, ty + th * 0.175, a * 0.5);
    const tiers = [
      ['A-Level 1-on-1', '£29.99'], ['GCSE 1-on-1', '£24.99'],
      ['A-Level Group', '£19.99'], ['GCSE Group', '£14.99'],
    ];
    const cw = tw * 0.44, ch = th * 0.155, gx = tw * 0.055, gy = ch * 1.22;
    tiers.forEach((tr, i) => {
      const cp = clamp(spring(dt - 0.14 - i * 0.12, 240, 23));
      const col = i % 2, row = (i / 2) | 0;
      const x = tx + tw * 0.06 + col * (cw + gx);
      const y = ty + th * 0.26 + row * gy;
      g.save(); g.globalAlpha = a * clamp(cp * 2);
      g.fillStyle = i === 0 ? C.crimson : C.surfaceHi;
      g.beginPath(); g.roundRect(x, y, cw * cp, ch, ch * 0.16); g.fill();
      g.restore();
      g.save(); g.globalAlpha = a * clamp(cp * 2); g.clip();
      text(g, tr[0], x + cw * 0.07, y + ch * 0.34, {
        font: fitText(g, tr[0], F.mono(600, L.tSmall * 0.60), 0.02, cw * 0.86).font,
        fill: i === 0 ? '#fff' : C.boneDim, align: 'left',
      });
      text(g, tr[1], x + cw * 0.07, y + ch * 0.80, {
        font: fitText(g, tr[1], F.display(800, L.tBig * 0.30), -0.03, cw * 0.86).font,
        fill: i === 0 ? '#fff' : C.bone, align: 'left',
      });
      g.restore();
    });
  }
  if (id === 'subj') {
    text(g, 'SUBJECTS & BOARDS', tx + tw * 0.06, ty + th * 0.14, { font: F.mono(700, L.tSmall * 0.76), fill: C.crimson, align: 'left', track: 0.14 });
    hairline(g, L, ty + th * 0.175, a * 0.5);
    const subs = [
      ['A-Level Maths', 'OCR MEI'], ['A-Level Physics', 'OCR A'], ['A-Level CS', 'AQA'],
      ['GCSE Higher Maths', 'AQA'], ['Triple Science', 'AQA'], ['GCSE English', 'AQA'],
    ];
    subs.forEach((s, i) => {
      const sp = clamp(spring(dt - 0.10 - i * 0.09, 240, 23));
      const x = tx + tw * 0.06 + (i % 2) * (tw * 0.44 + tw * 0.02);
      const y = ty + th * (0.25 + ((i / 2) | 0) * 0.155);
      g.save(); g.globalAlpha = a * sp;
      g.strokeStyle = C.line; g.lineWidth = 2;
      g.beginPath(); g.roundRect(x, y, tw * 0.42, th * 0.115, L.tMicro * 0.24); g.stroke();
      g.fillStyle = i % 3 === 0 ? C.crimson : C.surfaceHi;
      g.beginPath(); g.roundRect(x, y, L.tMicro * 0.16, th * 0.115, L.tMicro * 0.08); g.fill();
      g.restore();
      text(g, s[0], x + tw * 0.035, y + th * 0.052, {
        font: fitText(g, s[0], F.mono(600, L.tSmall * 0.60), 0.02, tw * 0.30).font,
        fill: C.bone, align: 'left', alpha: sp,
      });
      text(g, s[1], x + tw * 0.035, y + th * 0.088, {
        font: F.mono(500, L.tMicro), fill: C.boneDim, align: 'left', alpha: sp,
      });
    });
  }
  if (id === 'book') {
    text(g, 'BOOK A DIAGNOSTIC', tx + tw * 0.06, ty + th * 0.15, { font: F.mono(700, L.tSmall * 0.76), fill: C.crimson, align: 'left', track: 0.14 });
    hairline(g, L, ty + th * 0.185, a * 0.5);
    block(g, 'Ten places.', tx + tw * 0.06, ty + th * 0.40, {
      font: F.display(800, L.tBig * 0.62), track: -0.045, lh: L.tBig * 0.72,
      fill: C.bone, align: 'left', maxW: tw * 0.60, alpha: clamp(spring(dt - 0.14, 190, 25)),
    });
    block(g, 'Autumn 2026.', tx + tw * 0.06, ty + th * 0.40 + L.tBig * 0.76, {
      font: F.display(300, L.tBig * 0.62), track: -0.04, lh: L.tBig * 0.72,
      fill: C.crimson, align: 'left', maxW: tw * 0.60, alpha: clamp(spring(dt - 0.26, 190, 25)),
    });
    // two intake cards
    [['Instant', 'WhatsApp direct connect'], ['Structured', '5-field assessment form']].forEach((c, i) => {
      const cp = clamp(spring(dt - 0.40 + i * 0.14, 230, 23));
      const cw = tw * 0.44, x = tx + tw * 0.06 + i * (cw + tw * 0.03), y = ty + th * 0.66;
      g.save(); g.globalAlpha = a * clamp(cp * 2);
      g.fillStyle = i === 0 ? C.crimson : C.surfaceHi;
      g.beginPath(); g.roundRect(x, y, cw, th * 0.20, L.tMicro * 0.24); g.fill();
      g.restore();
      text(g, c[0], x + cw * 0.07, y + th * 0.085, {
        font: F.display(700, L.tSmall * 0.78), fill: i === 0 ? '#fff' : C.bone, align: 'left', alpha: cp,
      });
      text(g, c[1], x + cw * 0.07, y + th * 0.135, {
        font: fitText(g, c[1], F.mono(500, L.tMicro), 0.02, cw * 0.86).font,
        fill: i === 0 ? 'rgba(255,255,255,0.85)' : C.boneDim, align: 'left', alpha: cp,
      });
    });
  }
  g.restore();
}

// A wheel tick slides exactly one panel, then the deck HOLDS. Glide 0.42s, hold
// the rest: a reel must land on a clean, composed frame, not a half-scrolled one.
const GLIDE = 0.42;
function glide(t) {
  let i = 0;
  for (let k = 0; k < PANELS.length; k++) if (t >= PANELS[k].at) i = k;
  const t0 = PANELS[i].at;
  const p = clamp((t - t0) / GLIDE);
  return { i, p, dt: Math.max(0, t - t0) };
}

// The official logo plate, composited by footRail(). Declared so the renderer
// preloads and blocks on it; without this the plate is still decoding when the
// first frames draw and the mark pops in mid-reel.
export const assets = ['brand_logo.png', 'face.jpg'];

export function setup() {}
export function draw(g, L, t, DURF) {
  const tt = ((t % DURF) + DURF) % DURF;
  bg(g, L, tt);
  const G = glide(tt);

  // Panels are drawn on a sliding canvas so the deck glides exactly one panel
  // per wheel tick, with the 950ms cooldown expressed as the spring constant.
  const e = smooth(G.p);
  // The glide slides panel (i-1) up and parks panel i at the top. e=0 => still on
  // panel i-1, e=1 => parked on panel i. Getting this wrong parks the panel a
  // full screen off-canvas, which is exactly what a scrolled-looking frame is.
  const slideFrom = Math.max(0, G.i - 1);
  const offset = -(slideFrom + e) * L.h;

  // draw visible panels only
  for (let k = Math.max(0, G.i - 1); k <= Math.min(PANELS.length - 1, G.i + 1); k++) {
    const pa = k === G.i ? 1 : 0.25;
    drawPanel(g, L, PANELS[k].id, offset + k * L.h, tt, tt - PANELS[k].at, pa);
  }

  // chrome: header bar, position bar, dots
  g.save();
  g.fillStyle = 'rgba(10,10,12,0.86)';
  g.fillRect(0, 0, L.w, L.h * 0.10);
  g.fillStyle = C.line;
  g.fillRect(0, L.h * 0.10 - 1, L.w, 1);
  // The OFFICIAL plate, not the drawn monogram. This header used to stroke an approximate
  // AA, which is why the daily x-reel never carried the real logo.
  const lgOk = plate('brand_logo.png');
  if (lgOk) {
    containFit(g, lgOk, L.mx + L.tMicro * 3.2, L.h * 0.058, L.tMicro * 5.4);
  } else {
    g.save(); g.translate(L.mx, L.h * 0.055); monogram(g, 0, 0, L.tMicro * 1.15, { weight: 0.95, stroke: C.crimson }); g.restore();
  }
  if (!lgOk) text(g, 'AHMED ACADEMY', L.mx + L.tMicro * 1.2, L.h * 0.062, {
    font: F.display(650, L.tSmall * 0.56), fill: C.bone, align: 'left', track: 0.14,
  });
  text(g, 'musaahmed.uk/academy', L.w - L.mx, L.h * 0.062, {
    font: F.mono(500, L.tMicro), fill: C.boneDim, align: 'right', track: 0.02,
  });
  g.restore();

  // position bar
  const pbY = L.h * 0.955, pbW = L.w * 0.34, pbX = (L.w - pbW) / 2;
  g.save();
  g.fillStyle = 'rgba(255,255,255,0.12)';
  g.beginPath(); g.roundRect(pbX, pbY, pbW, Math.max(4, L.tMicro * 0.14), L.tMicro * 0.07); g.fill();
  g.fillStyle = C.crimson;
  g.beginPath(); g.roundRect(pbX, pbY, pbW * ((G.i + e) / PANELS.length), Math.max(4, L.tMicro * 0.14), L.tMicro * 0.07); g.fill();
  // dots
  PANELS.forEach((p, i) => {
    const on = i === G.i;
    const dx = L.cx - (PANELS.length - 1) * L.tMicro * 0.55 + i * L.tMicro * 1.1;
    g.fillStyle = on ? C.crimson : 'rgba(255,255,255,0.25)';
    g.beginPath(); g.arc(dx, pbY + L.tMicro * 1.0, on ? L.tMicro * 0.22 : L.tMicro * 0.15, 0, Math.PI * 2); g.fill();
  });
  g.restore();

  // swipe hint on the first panel
  if (G.i === 0 && G.p === 0) {
    const h = 0.5 + 0.5 * Math.sin(tt * 3.0);
    g.save(); g.globalAlpha = clamp(spring(tt - 1.0, 180, 26)) * h * 0.8;
    text(g, 'swipe', L.cx, L.h * 0.845, { font: F.mono(500, L.tSmall * 0.62), fill: C.boneDim, track: 0.24 });
    g.strokeStyle = C.crimson; g.lineWidth = L.tMicro * 0.10; g.lineCap = 'round';
    g.beginPath();
    g.moveTo(L.cx - L.tMicro * 0.5, L.h * 0.865);
    g.lineTo(L.cx + L.tMicro * 0.5, L.h * 0.865);
    g.moveTo(L.cx + L.tMicro * 0.1, L.h * 0.865 - L.tMicro * 0.35);
    g.lineTo(L.cx + L.tMicro * 0.5, L.h * 0.865);
    g.lineTo(L.cx + L.tMicro * 0.1, L.h * 0.865 + L.tMicro * 0.35);
    g.stroke();
    g.restore();
  }

  grain(g, L, tt, 6);
  vignette(g, L, 0.55);
}

export const sfx = (() => {
  const cues = [{ t: 0.02, type: 'swell', gain: 0.6 }];
  PANELS.forEach((p, i) => {
    if (i > 0) cues.push({ t: p.at - 0.06, type: 'whoosh' });
    cues.push({ t: p.at + 0.10, type: 'click' });
    for (let k = 1; k <= 3; k++) cues.push({ t: p.at + 0.25 + k * 0.13, type: 'tick' });
  });
  cues.push({ t: 20.0, type: 'swell' });
  cues.push({ t: 21.2, type: 'hit' });
  return cues;
})();
