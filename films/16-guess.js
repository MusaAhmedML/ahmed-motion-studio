// ============================================================================
// FILM 16 — "THE DIAGNOSIS"  ·  DEFAULT BRANDREEL TEMPLATE
// ============================================================================
// The house template. Same engine, same look, same springs as FILM 15; the beats
// are simply a list over lib/brag-engine.js. Copy a new reel by copying the
// BEAT table and the three beat bodies below — do not redraw the stage.
//
//   DIAGNOSIS  0.0 - 5.0s   "Most tuition starts with a guess."  -> recedes
//                          "We start with a diagnosis."          -> lands
//   WHO       4.7 - 9.1s   Ahmed Academy · diagnostic-led teaching
//                         from an A*A*AAA student
//   BOOK      8.9 - 18.1s  Book a free diagnostic · musaahmed.uk/academy
//
// What was cut: the STANDALONE claim card, which made the viewer sit through a
// full beat before anything landed. What was kept: the setup line inside the
// diagnosis beat, because the hand-off needs something to hand off FROM. One
// appearance of the claim, not two.
//
// Every part is lifted from the original Remotion brand reel; nothing is new art.
// ============================================================================
import {
  FPS, DURATION, Stage, beatCY, energyAt, drawText, C, FD, FB,
} from '../lib/brag-engine.js';
import { lerpClamp, remotionSpring, fadeOut } from '../lib/remotion-math.js';
import { plate } from '../lib/assets.js';

export const assets = ['brag/logo.png', 'brag/headshot_endcard.png'];

// Default pair = today's line 0. The daily renderer injects window.__daily with a
// different pair, so the SAME file produces a different reel every day. Beats
// WHO and BOOK never change — only the first two clips do.
const DEFAULT_DAILY = {
  setup: 'Most tuition starts with a guess.', a: 'We start with a', b: 'diagnosis.',
};
// Read at DRAW time, never at import time. The module is imported during
// __init(), which is before the renderer injects window.__daily, so a
// module-level const would silently lock in the defaults for every day.
const daily = () => (typeof window !== 'undefined' && window.__daily) || DEFAULT_DAILY;

// Three beats, 513 frames (17.1s). The standalone opening card was cut: the reel
// now lands straight on the diagnosis, which is the line that actually sells.
// Same overlap rhythm as the original — each beat starts ~8 frames before the
// last one ends, so the deck never shows an empty frame.
const B2 = {
  diagnosis: { from: 0,   dur: 150 },  // 0.0  - 5.0   (line A hands off to B)
  who:       { from: 142, dur: 130 },  // 4.7  - 9.1
  book:      { from: 266, dur: 277 },  // 8.9  - 18.1
};
export const FRAMES = B2.book.from + B2.book.dur;

/* ---------- DIAGNOSIS: one setup line, then the hard landing ---------- */
function Diagnosis(g, L, F, S, vertical) {
  const f = F;
  const D = daily();
  const out = fadeOut(f, B2.diagnosis.dur);

  // LINE A — the guess. Appears ONCE, then recedes as the reply lands. This is the
  // original's hand-off, kept intact; only the standalone claim card was cut.
  const aIn = remotionSpring(f, FPS, { damping: 200, mass: 0.7, stiffness: 100 });
  const aFade = lerpClamp(f, [80, 104], [1, 0.16]);
  const bAt = 84;
  // LINE B — damping 16 is the original's hard-land spring
  const bIn = remotionSpring(f - bAt, FPS, { damping: 16, mass: 0.9, stiffness: 100 });
  const bOpacity = lerpClamp(f, [bAt, bAt + 8], [0, 1]);
  const cy = beatCY(L);

  g.save();
  g.globalAlpha = out * aFade;
  const aY = cy + lerpClamp(aIn, [0, 1], [22 * S, 0])
    + lerpClamp(f, [bAt - 4, bAt + 34], [0, -208 * S]) - 20 * S;
  g.translate(L.cx, aY);
  drawText(g, D.setup, 0, 0, {
    font: FB(400, (vertical ? 46 : 56) * S), fill: C.faint,
  });
  g.restore();

  g.save();
  g.globalAlpha = out * bOpacity;
  const bY = cy + lerpClamp(bIn, [0, 1], [34 * S, 0]);
  g.translate(L.cx, bY);
  const bs = lerpClamp(bIn, [0, 1], [0.94, 1]);
  g.scale(bs, bs);
  drawText(g, D.a, 0, -(vertical ? 50 : 62) * S, {
    font: FB(500, (vertical ? 50 : 62) * S), fill: C.steel, ls: -0.5,
  });
  drawText(g, D.b, 0, (vertical ? 44 : 56) * S, {
    font: FD(800, (vertical ? 96 : 122) * S), fill: C.titanium, ls: -2.2,
    shadow: ['rgba(220,38,38,0.3)', 30 * S],
  });
  g.restore();
}

/* ---------- WHO: the original Brand beat, verbatim ---------- */
function Who(g, L, F, S, vertical) {
  const f = F;
  const out = fadeOut(f, B2.who.dur);
  const rise = remotionSpring(f, FPS, { damping: 200, mass: 0.6, stiffness: 100 });
  const ls = lerpClamp(f, [0, 26], [0.62, 0.03]);
  const rule = lerpClamp(f, [8, 30], [0, 1]);

  const cy = beatCY(L);
  const nameSize = (vertical ? 108 : 132) * S;
  g.save();
  g.globalAlpha = out;
  g.translate(0, lerpClamp(rise, [0, 1], [26 * S, 0]));

  // Tracked out hard, so a 14-character word fits the same measure the name did.
  drawText(g, 'AHMED ACADEMY', L.cx, cy, {
    font: FD(800, nameSize), fill: C.titanium, ls: ls * 92,
    shadow: ['rgba(238,241,245,0.18)', 44 * S],
  });
  const rw = lerpClamp(rule, [0, 1], [0, (vertical ? 430 : 640)]) * S;
  const ry = cy + nameSize * 0.5 + 30 * S;
  if (rw > 0.5) {
    const gr = g.createLinearGradient(L.cx - rw / 2, 0, L.cx + rw / 2, 0);
    gr.addColorStop(0, 'rgba(220,38,38,0)');
    gr.addColorStop(0.5, C.crimson);
    gr.addColorStop(1, 'rgba(220,38,38,0)');
    g.fillStyle = gr;
    g.fillRect(L.cx - rw / 2, ry, rw, 3 * S);
  }
  const subA = lerpClamp(f, [14, 34], [0, 1]);
  drawText(g, 'DIAGNOSTIC-LED TEACHING', L.cx, ry + 3 * S + 26 * S + 15 * S, {
    font: FB(500, 30 * S), fill: C.dim, ls: 10, alpha: subA,
  });
  drawText(g, 'FROM AN A*A*AAA STUDENT', L.cx, ry + 3 * S + 26 * S + 15 * S + (vertical ? 44 : 52) * S, {
    font: FB(500, 30 * S), fill: C.faint, ls: 10, alpha: lerpClamp(f, [22, 42], [0, 1]),
  });
  g.restore();
}

/* ---------- BOOK: the original CTA, re-copied to the live booking route ---------- */
function Book(g, L, F, S, vertical, W, H) {
  const f = F;
  const dur = B2.book.dur;
  const out = 1;                                  // holds to the final frame
  const p = remotionSpring(f, FPS, { damping: 200, mass: 0.7, stiffness: 100 });
  const headIn = remotionSpring(f - 6, FPS, { damping: 22, mass: 0.9, stiffness: 100 });
  const drift = lerpClamp(f, [0, dur], [0, -12 * S]);

  const headSize = (vertical ? 0.3 : 0.62) * H;
  const headW = headSize * 0.75 * S, headH = headSize * S;

  let _sil = null, _silG = null;

  g.save();
  g.globalAlpha = out;
  g.translate(0, drift);

  const typeW = (vertical ? 186 : 224) * S;
  const lineSize = (vertical ? 74 : 86) * S;
  const emailSize = (vertical ? 38 : 44) * S;
  const siteSize = (vertical ? 30 : 34) * S;
  const typeH = typeW + 26 * S + lineSize * 1.02 + 30 * S + emailSize * 1.2 + 12 * S + siteSize * 1.2;
  const gapOuter = (vertical ? 54 : 86) * S;
  let y = beatCY(L) - (headH + gapOuter + typeH) / 2;

  // portrait — same masked cutout + directional crimson rim as the original
  g.save();
  g.globalAlpha = lerpClamp(headIn, [0, 0.5, 1], [0, 0.4, 1]);
  g.translate(L.cx - headW / 2, y);
  const hs = plate('brag/headshot_endcard.png');
  if (hs) {
    if (!_sil || _sil.width !== Math.round(headW)) {
      _sil = document.createElement('canvas');
      _sil.width = Math.max(1, Math.round(headW));
      _sil.height = Math.max(1, Math.round(headH));
      _silG = _sil.getContext('2d');
    }
    _silG.setTransform(1, 0, 0, 1, 0, 0);
    _silG.clearRect(0, 0, _sil.width, _sil.height);
    _silG.globalCompositeOperation = 'source-over';
    _silG.drawImage(hs, 0, 0, headW, headH);
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
    g.drawImage(_sil, 0, 0, headW, headH);
  }
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
  let ty = 0;
  if (logo) {
    g.save();
    g.globalAlpha = lerpClamp(f, [4, 20], [0, 0.95]);
    const lh = typeW * (logo.naturalHeight / logo.naturalWidth);
    g.drawImage(logo, -typeW / 2, 0, typeW, lh);
    g.restore();
    ty = lh + 26 * S;
  }
  drawText(g, 'Book a free diagnostic', 0, ty + lineSize * 0.5, {
    font: FD(800, lineSize), fill: C.titanium, ls: -1.8,
    shadow: ['rgba(220,38,38,0.28)', 26 * S],
  });
  ty += lineSize * 1.02 + 30 * S;
  drawText(g, 'musaahmed.uk/academy', 0, ty + emailSize * 0.6, {
    font: FB(600, emailSize), fill: C.crimsonLit, ls: -0.2,
  });
  ty += emailSize * 1.2 + 12 * S;
  drawText(g, 'or see the bio', 0, ty + siteSize * 0.6, {
    font: FB(500, siteSize), fill: C.dim,
  });
  g.restore();
  g.restore();
}

export function setup() {}

export function draw(g, L, t) {
  const F = Math.round(t * FPS);
  const frame = ((F % FRAMES) + FRAMES) % FRAMES;
  const vertical = L.h > L.w;
  const S = Math.min(L.w, L.h) / 1080;

  Stage(g, L, frame, energyAt(frame), S, vertical);

  if (frame >= B2.diagnosis.from && frame < B2.diagnosis.from + B2.diagnosis.dur) {
    Diagnosis(g, L, frame - B2.diagnosis.from, S, vertical);
  }
  if (frame >= B2.who.from && frame < B2.who.from + B2.who.dur) {
    Who(g, L, frame - B2.who.from, S, vertical);
  }
  if (frame >= B2.book.from && frame < B2.book.from + B2.book.dur) {
    Book(g, L, frame - B2.book.from, S, vertical, L.w, L.h);
  }
}

export const sfx = [];