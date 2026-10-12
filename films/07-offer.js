// FILM 07 — "TEN" · the scarcity hook
// A single number, fought for across the whole reel. Countdown slots fill one at a
// time on the beat grid, so the argument is made by the animation, not the copy.
import { C, F, bg, vignette, grain, text, block, setType, rule, hairline,
         brandMonogram, monogram, wordmark, ctaPill, footRail, ghostNumeral, fitText } from '../lib/brand.js';
import { clamp, lerp, inv, smooth, spring, env, rng, makeNoise } from '../lib/motion.js';

const DUR = 26;
const noise = makeNoise(3311);

const SLOTS = 10;

// Occupancy: slots fill one per beat-ish, staggered. Empty = outlined. Full = crimson.
function filled(t) {
  const order = [4.2, 5.0, 5.7, 6.4, 7.1, 7.8, 8.6, 9.4, 10.3, 11.4];
  let n = 0;
  for (const o of order) if (t >= o) n++;
  return n;
}

// The official logo plate, composited by footRail(). Declared so the renderer
// preloads and blocks on it; without this the plate is still decoding when the
// first frames draw and the mark pops in mid-reel.
export const assets = ['brand_logo.png'];

export function setup() {}
export function draw(g, L, t, DURF) {
  const tt = ((t % DURF) + DURF) % DURF;
  bg(g, L, tt);

  const n = filled(tt);
  const p = clamp(tt / 13.5);
  const inA = 1 - clamp(spring(tt - 13.0, 150, 24));

  // ---- Hook, 0-3.5s: the claim, huge, no logo.
  if (tt < 4.0) {
    const dt = tt;
    text(g, 'AUTUMN 2026', L.cx, L.h * 0.165, {
      font: F.mono(700, L.tSmall * 0.80), fill: C.boneDim, track: 0.24,
      alpha: clamp(spring(dt - 0.1, 180, 26)),
    });
    const s1 = clamp(spring(dt - 0.30, 200, 22));
    text(g, 'TEN', L.cx, L.h * 0.475, {
      font: fitText(g, 'TEN', F.display(800, L.tHero * 2.1), -0.06, L.w - L.mx * 2).font,
      fill: C.crimson, track: -0.06, alpha: s1,
    });
    const s2 = clamp(spring(dt - 0.62, 190, 23));
    text(g, 'STUDENTS.', L.cx, L.h * 0.585, {
      font: fitText(g, 'STUDENTS.', F.display(700, L.tHero * 0.86), -0.045, L.w - L.mx * 2).font,
      fill: C.bone, track: -0.045, alpha: s2,
    });
    rule(g, L, L.cx, L.h * 0.635, L.tHero * 2.2, clamp(spring(dt - 0.85, 300, 20)), { thick: Math.round(L.tMicro * 0.36) });
    text(g, 'That is the whole cohort. Every term.', L.cx, L.h * 0.695, {
      font: fitText(g, 'That is the whole cohort. Every term.', F.mono(500, L.tMid * 0.60), 0.02, L.w - L.mx * 2.2).font,
      fill: C.boneDim, track: 0.02, alpha: clamp(spring(dt - 1.05, 170, 26)),
    });
    vignette(g, L, 0.62);
    return;
  }

  // ---- 4-13.5s: the slots fill. One per beat, with a pop and a chime.
  if (tt < 13.6) {
    const dt = tt - 4.0;
    const a = env(tt, 4.0, 13.6, 0.35);
    g.save(); g.globalAlpha = a;

    const nNow = filled(tt);
    text(g, 'PLACES FILLED', L.cx, L.h * 0.155, {
      font: F.mono(700, L.tSmall * 0.76), fill: C.boneDim, track: 0.22,
    });
    // Big live count, counts up on its own spring.
    const cp = clamp(spring(dt, 110, 25));
    const nStr = String(Math.round(lerp(0, nNow, smooth(cp))));
    const nFont = F.display(800, L.tHero * 1.55);
    g.save(); setType(g, nFont, -0.055); const nW = g.measureText(nStr).width; g.restore();
    text(g, nStr, L.cx, L.h * 0.345, { font: nFont, fill: C.bone, track: -0.055 });
    text(g, `/ ${SLOTS}`, L.cx + nW / 2 + L.tSmall * 0.42, L.h * 0.345, {
      font: F.display(300, L.tHero * 0.58), fill: C.boneDim, track: -0.03, align: 'left',
    });

    // The slot grid: 5 x 2. Filled slots pop and lock crimson.
    const cols = 5, rows = 2;
    const gw = L.w * 0.80, gh = L.h * 0.20;
    const gx = (L.w - gw) / 2, gy = L.h * 0.435;
    const cw = gw / cols, chh = gh / rows;
    const order = [4.2, 5.0, 5.7, 6.4, 7.1, 7.8, 8.6, 9.4, 10.3, 11.4];
    for (let i = 0; i < SLOTS; i++) {
      const col = i % cols, row = (i / cols) | 0;
      const cx = gx + col * cw + cw / 2, cy = gy + row * chh + chh / 2;
      const s = cw * 0.30;
      const sp = clamp(spring(tt - order[i], 300, 20));
      const isOn = tt >= order[i];
      g.save();
      g.translate(cx, cy);
      g.scale(lerp(0.7, 1, sp), lerp(0.7, 1, sp));
      if (isOn) {
        g.shadowColor = 'rgba(220,38,38,0.55)';
        g.shadowBlur = s * (0.5 + 0.5 * (1 - sp));
        g.fillStyle = C.crimson;
      } else {
        g.fillStyle = 'rgba(255,255,255,0.045)';
      }
      g.beginPath();
      g.roundRect(-s, -s, s * 2, s * 2, s * 0.28);
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = isOn ? 'rgba(239,68,68,0.55)' : C.line;
      g.lineWidth = Math.max(2, L.tMicro * 0.09);
      g.stroke();
      g.restore();
      // slot index in mono
      text(g, String(i + 1).padStart(2, '0'), cx, cy + s * 1.45, {
        font: F.mono(600, L.tMicro * 0.9), fill: isOn ? C.crimsonHi : 'rgba(255,255,255,0.20)',
        track: 0.06, alpha: isOn ? 0.85 : 0.6,
      });
    }

    // Fill meter under the grid.
    const mw = L.w * 0.80, mx = (L.w - mw) / 2, my = gy + gh + L.h * 0.045;
    g.fillStyle = 'rgba(255,255,255,0.10)';
    g.beginPath(); g.roundRect(mx, my, mw, Math.max(5, L.tMicro * 0.20), L.tMicro * 0.10); g.fill();
    const mp = clamp(nNow / SLOTS);
    g.fillStyle = C.crimson;
    g.beginPath(); g.roundRect(mx, my, mw * mp, Math.max(5, L.tMicro * 0.20), L.tMicro * 0.10); g.fill();
    text(g, mp >= 1 ? 'FULL' : 'capacity', mx, my + L.tSmall * 1.05, {
      font: F.mono(700, L.tMicro), fill: mp >= 1 ? C.crimsonHi : C.boneDim, align: 'left', track: 0.16,
    });
    text(g, `${nNow} of ${SLOTS} taken`, mx + mw, my + L.tSmall * 1.05, {
      font: F.mono(500, L.tMicro), fill: C.boneDim, align: 'right', track: 0.04,
    });
    g.restore();
    vignette(g, L, 0.55);
    return;
  }

  // ---- 13.6s+: the truth + brand last.
  const dt = tt - 13.6;
  const a = env(tt, 13.6, DURF, 0.4);
  g.save(); g.globalAlpha = a;
  block(g, 'It is not a', L.cx, L.h * 0.315, {
    font: F.display(300, L.tBig * 0.86), track: -0.04, lh: L.tBig * 1.06,
    fill: C.boneDim, align: 'center', maxW: L.w - L.mx * 2,
  });
  block(g, 'marketing', L.cx, L.h * 0.315 + L.tBig * 1.02, {
    font: F.display(800, L.tBig * 0.86), track: -0.045, lh: L.tBig * 1.06,
    fill: C.bone, align: 'center', maxW: L.w - L.mx * 2,
  });
  block(g, 'decision.', L.cx, L.h * 0.315 + L.tBig * 2.04, {
    font: F.display(800, L.tBig * 0.86), track: -0.045, lh: L.tBig * 1.06,
    fill: C.crimson, align: 'center', maxW: L.w - L.mx * 2, alpha: clamp(spring(dt - 0.25, 180, 25)),
  });
  block(g, 'It is how much of your child I can actually see.', L.cx, L.h * 0.560, {
    font: F.mono(500, L.tMid * 0.56), lh: L.tMid * 0.86, fill: C.boneDim, track: 0.02,
    maxW: L.w - L.mx * 2.2, alpha: clamp(spring(dt - 0.55, 175, 26)),
  });
  const bp = clamp(spring(dt - 0.85, 160, 24));
  g.save(); g.globalAlpha = a * bp;
  g.translate(L.cx, L.h * 0.735); g.scale(lerp(0.85, 1, bp), lerp(0.85, 1, bp));
  brandMonogram(g, 0, 0, L.tBig * 0.56);
  g.restore();
  g.save(); g.globalAlpha = a * clamp(spring(dt - 1.0, 170, 26));
  setType(g, F.display(650, L.tBig * 0.26), 0.16);
  g.textAlign = 'center'; g.fillStyle = C.bone;
  g.fillText('AHMED ACADEMY', L.cx, L.h * 0.790);
  g.restore();
  ctaPill(g, L, L.cx, L.h * 0.855, 0.72, clamp(spring(dt - 1.2, 200, 24)));
  footRail(g, L, clamp(spring(dt - 1.45, 160, 28)));
  grain(g, L, tt, 7);
  vignette(g, L, 0.6);
}

export const sfx = [
  { t: 0.02, type: 'thump' },
  { t: 0.30, type: 'hit' },
  { t: 0.62, type: 'pop' },
  { t: 1.05, type: 'tick' },
  { t: 3.8, type: 'whoosh' },
  { t: 4.2, type: 'pop' }, { t: 5.0, type: 'pop' }, { t: 5.7, type: 'pop' },
  { t: 6.4, type: 'pop' }, { t: 7.1, type: 'pop' }, { t: 7.8, type: 'pop' },
  { t: 8.6, type: 'pop' }, { t: 9.4, type: 'pop' }, { t: 10.3, type: 'pop' },
  { t: 11.4, type: 'hit' },
  { t: 13.6, type: 'swell' },
  { t: 14.6, type: 'pop' },
  { t: 15.9, type: 'hit' },
];
