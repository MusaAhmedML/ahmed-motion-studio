// FILM 10 — "THE MARK SCHEME" · the reel that follows the proven recipe
//
// The lesson from the bake-off: motion craft is invisible to a parent scrolling
// their phone. What sells is (1) the tutor's FACE, (2) SPECIFIC syllabus truth,
// (3) karaoke captions that reward watching, (4) the real logo, gold locked.
//
// So this film keeps the engine (closed-form springs, deterministic seek(t),
// beat-locked cuts, multi-format layout function) and throws away the abstraction.
// Every claim here is a real mark-scheme fact. No invented numbers, no "9s".
import { C, F, bg, vignette, grain, text, block, setType, rule, fitText } from '../lib/brand.js';
import { clamp, lerp, inv, smooth, spring, env, rng } from '../lib/motion.js';
import { plate, coverFit, containFit } from '../lib/assets.js';

const DUR = 19;
const B = 0.5;
const S = (n) => n * B;

export const assets = ['face.jpg', 'brand_logo.png'];

// Palette pulled from the skill's verified logo palette.
const K = {
  gold: '#facc15',
  goldDeep: '#ca8a04',
  cyan: '#38bdf8',
  cyanDeep: '#06b6d4',
  emerald: '#34d399',
  rose: '#fb7185',
  slate: '#94a3b8',
  ink: '#0b1120',
  ink2: '#111c33',
};

export function setup() {}

function plates() {
  return { face: plate('face.jpg'), logo: plate('brand_logo.png') };
}
const cover = (g, el, x, y, w, h, r = 0) => coverFit(g, el, x, y, w, h, r);
const contain = (g, el, cx, cy, s) => containFit(g, el, cx, cy, s);

// Warm ivory-to-night vertical wash: parent-friendly at the top, brand dark at the
// bottom. Not a flat dark gradient — that is the look we are avoiding.
// warm=true gives the parent-friendly ivory top (used where the portrait sits).
// warm=false is the dark plate for content beats — white type on cream is a
// contrast failure, so the ivory top must not be there when text lives up top.
function ground(g, L, t, warm = true) {
  const gr = g.createLinearGradient(0, 0, 0, L.h);
  if (warm) {
    gr.addColorStop(0.00, '#f7f4ec');
    gr.addColorStop(0.26, '#eae5d8');
  } else {
    gr.addColorStop(0.00, '#0d1526');
    gr.addColorStop(0.30, K.ink);
  }
  gr.addColorStop(0.52, K.ink);
  gr.addColorStop(1.00, '#070b14');
  g.fillStyle = gr;
  g.fillRect(0, 0, L.w, L.h);
  // one soft cyan bloom behind the photo so the eye has somewhere to land
  const bl = g.createRadialGradient(L.w * 0.5, L.h * 0.40, 20, L.w * 0.5, L.h * 0.40, L.w * 0.85);
  bl.addColorStop(0, 'rgba(56,189,248,0.16)');
  bl.addColorStop(1, 'rgba(56,189,248,0)');
  g.fillStyle = bl;
  g.fillRect(0, 0, L.w, L.h);
}

// Glass card at 35% fill — the skill's mandatory spec, and it looks right.
function card(g, L, x, y, w, h, p, { accent = K.cyan, radius = 22 } = {}) {
  const e = clamp(spring(p, 260, 22));
  if (e <= 0.004) return 0;
  const hx = lerp(-w * 0.25, 0, smooth(e));
  g.save();
  g.globalAlpha = clamp(e * 2);
  g.translate(hx, 0);
  g.fillStyle = 'rgba(2,6,23,0.35)';
  g.beginPath(); g.roundRect(x, y, w * lerp(0.86, 1, e), h, radius); g.fill();
  g.fillStyle = accent;
  g.fillRect(x, y, Math.max(5, L.tMicro * 0.22), h);
  g.restore();
  return clamp(e * 2);
}

// A bullet dot that pops.
function dot(g, L, x, y, p, colour) {
  const e = clamp(spring(p, 340, 18));
  if (e <= 0.004) return;
  g.save();
  g.globalAlpha = clamp(e * 2.2);
  g.translate(x, y);
  g.scale(lerp(0.2, 1, e), lerp(0.2, 1, e));
  g.fillStyle = colour;
  g.beginPath(); g.arc(0, 0, L.tMicro * 0.36, 0, Math.PI * 2); g.fill();
  g.restore();
}

// ---- karaoke captions ------------------------------------------------------
// Word-by-word highlight that sweeps with the timing. This is the element that
// earns rewatches: viewers follow the word to the end.
const CAP = [
  // [fromBeat, text, keyWord]
  [0,    'Most students lose the marks', null],
  [1.5,  'in places they were never taught.', 'never taught'],
  [3.5,  'It is not ability. It is routing.', 'routing'],
];

function karaoke(g, L, t, p, line, key, { y, size = L.tBig * 0.62, colour = '#ffffff' } = {}) {
  const a = clamp(spring(p, 200, 24));
  if (a <= 0.004) return;
  const font = F.display(800, size);
  g.save();
  setType(g, font, -0.03);
  const words = line.split(' ');
  const widths = words.map(w => g.measureText(w + ' ').width);
  const total = widths.reduce((x, y) => x + y, 0);
  const x0 = L.cx - total / 2;
  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';
  let x = x0;
  words.forEach((w, i) => {
    // sweep: words light up one by one across the caption's life
    const wp = clamp((p - 0.14) * 1.9 - i * 0.16);
    const isKey = key && w.replace(/[.,]/g, '').toLowerCase() === key.split(' ')[0].toLowerCase();
    g.fillStyle = wp > 0.5 ? colour : 'rgba(255,255,255,0.42)';
    g.fillText(w, x, y);
    if (isKey && wp > 0.5) {
      // gold pop on the keyword, with a small overshoot
      const pop = clamp(spring(wp - 0.5, 420, 18));
      g.save();
      g.globalAlpha = a * pop;
      g.fillStyle = K.gold;
      g.fillRect(x - 2, y + size * 0.10, widths[i] - size * 0.06, Math.max(3, size * 0.045));
      g.restore();
    }
    x += widths[i];
  });
  g.restore();
}

const SC = [
  // 0-6.5s: FACE FIRST. The trust anchor opens the reel before a single claim.
  { frm: 0, to: S(13), draw(g, L, t, dt) {
      ground(g, L, t);
      const { face, logo } = plates();
      // Portrait card, big and high. The FACE is the trust anchor, so it gets
      // the most real estate in the whole reel.
      const pw = L.w * 0.78, ph = pw * 1.12;
      const px = (L.w - pw) / 2, py = L.h * 0.085;
      const e = clamp(spring(dt, 170, 23));
      g.save();
      g.globalAlpha = e;
      g.strokeStyle = K.gold;
      g.lineWidth = Math.max(3, L.tMicro * 0.13);
      g.strokeRect(px - L.tMicro * 0.4, py - L.tMicro * 0.4, pw + L.tMicro * 0.8, ph + L.tMicro * 0.8);
      g.restore();
      if (!cover(g, face, px, py, pw, ph, 16)) {
        g.save(); g.fillStyle = 'rgba(255,255,255,0.12)';
        g.beginPath(); g.roundRect(px, py, pw, ph, 16); g.fill(); g.restore();
      } else {
        // lift the portrait off the background so it never dissolves into it
        g.save();
        g.beginPath(); g.roundRect(px, py, pw, ph, 16); g.clip();
        g.globalCompositeOperation = 'lighten';
        g.globalAlpha = 0.10 * e;
        g.fillStyle = '#7d8ea8';
        g.fillRect(px, py, pw, ph);
        g.restore();
      }
      // bottom scrim so the name plate always sits on contrast
      const sg = g.createLinearGradient(0, py + ph * 0.52, 0, py + ph);
      sg.addColorStop(0, 'rgba(2,6,23,0)');
      sg.addColorStop(1, 'rgba(2,6,23,0.94)');
      g.fillStyle = sg;
      g.fillRect(px, py + ph * 0.52, pw, ph * 0.48);
      text(g, 'MUSA AHMED', L.cx, py + ph - L.tSmall * 1.15, {
        font: fitText(g, 'MUSA AHMED', F.display(800, L.tSmall * 1.28), 0.02, pw * 0.84).font,
        fill: '#ffffff', alpha: clamp(spring(dt - 0.35, 200, 25)), track: 0.02,
      });
      text(g, 'A*A*AAA  ·  Manchester & Edinburgh offers', L.cx, py + ph - L.tSmall * 0.28, {
        font: fitText(g, 'A*A*AAA  ·  Manchester & Edinburgh offers', F.mono(600, L.tMicro * 1.0), 0.02, pw * 0.88).font,
        fill: K.gold, alpha: clamp(spring(dt - 0.5, 200, 25)), track: 0.02,
      });
      // subject badge straddles the top frame edge
      const bp = clamp(spring(dt - 0.7, 250, 22));
      if (bp > 0.01) {
        const bw = L.w * 0.50 * bp, bh = L.tSmall * 1.42;
        g.save(); g.globalAlpha = clamp(bp * 2);
        g.fillStyle = K.gold;
        g.beginPath(); g.roundRect(L.cx - bw / 2, py - bh * 0.62, bw, bh, bh * 0.3); g.fill();
        g.restore();
        text(g, 'A-LEVEL PHYSICS', L.cx, py - bh * 0.62 + bh * 0.68, {
          font: fitText(g, 'A-LEVEL PHYSICS', F.display(800, L.tSmall * 0.84), 0.10, bw * 0.88).font,
          fill: K.ink, alpha: clamp(bp * 2.2), track: 0.10,
        });
      }
      // karaoke claim BELOW the photo, with real clearance
      karaoke(g, L, t, dt - 0.95, CAP[0][1], CAP[0][2], { y: L.h * 0.700, size: L.tBig * 0.52 });
      rule(g, L, L.cx, L.h * 0.775, L.w * 0.30, clamp(spring(dt - 1.7, 300, 20)), { thick: Math.max(3, L.tMicro * 0.16), fill: K.gold });
      text(g, 'Free 20-minute diagnostic — musaahmed.uk/academy', L.cx, L.h * 0.845, {
        font: fitText(g, 'Free 20-minute diagnostic — musaahmed.uk/academy', F.mono(600, L.tSmall * 0.74), 0.02, L.w - L.mx * 1.8).font,
        fill: '#ffffff', alpha: clamp(spring(dt - 1.9, 200, 26)), track: 0.02,
      });
      vignette(g, L, 0.42);
      grain(g, L, t, 5);
    }},
  // 6.5-11.5s: the specific syllabus truth. This is the line a parent recognises.
  { frm: S(13), to: S(23), draw(g, L, t, dt) {
      ground(g, L, t, false);
      const { face } = plates();
      text(g, 'WHERE THE MARKS ACTUALLY GO', L.mx, L.h * 0.175, {
        font: fitText(g, 'WHERE THE MARKS ACTUALLY GO', F.mono(700, L.tMicro * 1.05), 0.16, L.w - L.mx * 2).font,
        fill: K.gold, alpha: clamp(spring(dt, 200, 26)), track: 0.16, align: 'left',
      });
      const rows = [
        ['CIRCULAR MOTION', 'Nobody resolves the angle between velocity and force. 2–3 marks, gone.', K.cyan],
        ['RESISTIVE FORCES', 'They write F = mg and stop. Components never happen.', K.emerald],
        ['CAPACITORS', 'Energy is asked in joules. They answer in coulombs.', K.rose],
      ];
      rows.forEach((r, i) => {
        const cw = L.w - L.mx * 2;
        const a = card(g, L, L.mx, L.h * (0.225 + i * 0.145), cw, L.h * 0.132, dt, { accent: r[2] });
        if (a <= 0.004) return;
        dot(g, L, L.mx + L.tSmall * 0.60, L.h * (0.225 + i * 0.135) + L.tSmall * 0.52, dt, r[2]);
        const tx = L.mx + L.tSmall * 1.15;
        const avail = (L.mx + cw) - tx - L.tSmall * 0.5;   // from text start to card padding
        text(g, r[0], tx, L.h * (0.225 + i * 0.145) + L.tSmall * 0.76, {
          font: fitText(g, r[0], F.mono(700, L.tSmall * 0.80), 0.08, avail).font,
          fill: '#ffffff', align: 'left', alpha: a, track: 0.08,
        });
        block(g, r[1], tx, L.h * (0.225 + i * 0.145) + L.tSmall * 1.58, {
          font: F.mono(500, L.tMicro * 1.02), lh: L.tMicro * 1.30, fill: K.slate,
          align: 'left', maxW: avail, alpha: a * 0.95,
        });
      });
      rule(g, L, L.cx, L.h * 0.775, L.w * 0.34, clamp(spring(dt - 1.2, 300, 20)), { thick: Math.max(3, L.tMicro * 0.16), fill: K.gold });
      text(g, 'Three marks. One afternoon. That is the whole gap.', L.cx, L.h * 0.845, {
        font: fitText(g, 'Three marks. One afternoon. That is the whole gap.', F.mono(600, L.tSmall * 0.76), 0.02, L.w - L.mx * 1.7).font,
        fill: '#ffffff', alpha: clamp(spring(dt - 1.4, 200, 26)), track: 0.02,
      });
      vignette(g, L, 0.40);
      grain(g, L, t, 5);
    }},
  // 11.5-19s: the fix, then the real logo and the CTA. Brand LAST, face present.
  { frm: S(23), to: DUR, draw(g, L, t, dt) {
      ground(g, L, t, false);
      const { face, logo } = plates();
      karaoke(g, L, t, dt - 0.15, CAP[2][1], CAP[2][2], { y: L.h * 0.215, size: L.tBig * 0.58 });

      // three method chips
      const chips = [
        ['TRACE', 'the exact step that loses the mark', K.cyan],
        ['FIX', 'that one step, every question', K.emerald],
        ['REPEAT', 'until it is automatic', K.gold],
      ];
      chips.forEach((c, i) => {
        const y = L.h * (0.295 + i * 0.085);
        const a = card(g, L, L.mx, y, L.w - L.mx * 2, L.h * 0.068, dt - 0.30 - i * 0.16, { accent: c[2], radius: 16 });
        if (a <= 0.004) return;
        const labFont = F.display(800, L.tSmall * 0.80);
        const labX = L.mx + L.tSmall * 0.75;
        g.save(); setType(g, labFont, 0.10); const labW = g.measureText(c[0]).width; g.restore();
        text(g, c[0], labX, y + L.tSmall * 0.95, { font: labFont, fill: c[2], align: 'left', alpha: a, track: 0.10 });
        // body starts AFTER the measured label, never at a guessed offset
        const bodyX = labX + labW + L.tSmall * 0.75;
        text(g, c[1], bodyX, y + L.tSmall * 0.95, {
          font: fitText(g, c[1], F.mono(500, L.tSmall * 0.70), 0.0, (L.w - L.mx) - bodyX - L.tSmall * 0.5).font,
          fill: '#ffffff', align: 'left', alpha: a * 0.92,
        });
      });

      // photo returns, full strength, as the trust close
      const pw = L.w * 0.26, ph = pw * 1.18;
      const px = L.mx, py = L.h * 0.560;
      const pe = clamp(spring(dt - 0.75, 200, 24));
      cover(g, face, px, py, pw * pe, ph * pe, 14);
      g.save(); g.globalAlpha = pe;
      g.strokeStyle = K.gold; g.lineWidth = Math.max(2, L.tMicro * 0.10);
      g.strokeRect(px, py, pw * pe, ph * pe);
      g.restore();

      // REAL logo — the model never draws the logo, it is composited
      const lp = clamp(spring(dt - 0.55, 190, 24));
      if (lp > 0.004) {
        const lx = L.w - L.mx - L.tSmall * 1.8, ly = L.h * 0.645;
        g.save(); g.globalAlpha = lp;
        // faint gold halo so the emblem separates from the dark plate
        const hg = g.createRadialGradient(lx, ly, 4, lx, ly, L.tSmall * 2.6 * lp);
        hg.addColorStop(0, 'rgba(250,204,21,0.22)');
        hg.addColorStop(1, 'rgba(250,204,21,0)');
        g.fillStyle = hg;
        g.fillRect(lx - L.tSmall * 2.6, ly - L.tSmall * 2.6, L.tSmall * 5.2, L.tSmall * 5.2);
        g.restore();
        if (!contain(g, logo, lx, ly, L.tSmall * 4.2 * lp)) {
          // fallback: gold capsule with the wordmark
          const cw = L.tSmall * 3.0 * lp, ch = L.tSmall * 1.0;
          g.save(); g.globalAlpha = lp;
          g.fillStyle = '#ffffff';
          g.beginPath(); g.roundRect(lx - cw / 2, ly - ch / 2, cw, ch, ch * 0.4); g.fill();
          text(g, 'AHMED ACADEMY', lx, ly + ch * 0.16, {
            font: fitText(g, 'AHMED ACADEMY', F.display(700, L.tSmall * 0.46), 0.06, cw * 0.86).font,
            fill: K.ink, track: 0.06,
          });
          g.restore();
        }
      }

      // CTA
      const cp = clamp(spring(dt - 1.05, 220, 23));
      if (cp > 0.004) {
        const bw = (L.w - L.mx * 2) * 0.96 * cp, bh = L.tSmall * 2.5;
        const bx = L.cx - bw / 2, by = L.h * 0.815;
        g.save(); g.globalAlpha = clamp(cp * 2);
        const gr = g.createLinearGradient(0, by, 0, by + bh);
        gr.addColorStop(0, K.cyan); gr.addColorStop(1, K.cyanDeep);
        g.fillStyle = gr;
        g.beginPath(); g.roundRect(bx, by, bw, bh, bh * 0.20); g.fill();
        g.restore();
        text(g, 'Book a free diagnostic', L.cx, by + bh * 0.60, {
          font: fitText(g, 'Book a free diagnostic', F.display(800, L.tSmall * 0.98), -0.015, bw * 0.86).font,
          fill: '#04121f', alpha: clamp(cp * 2.2),
        });
        text(g, 'musaahmed.uk/academy', L.cx, by + bh * 1.55, {
          font: F.mono(600, L.tMicro), fill: K.gold, alpha: clamp(spring(dt - 1.3, 200, 25)), track: 0.06,
        });
      }
      text(g, 'A*A*AAA · Manchester · Edinburgh · Glasgow · Liverpool', L.cx, L.h * 0.945, {
        font: fitText(g, 'A*A*AAA · Manchester · Edinburgh · Glasgow · Liverpool', F.mono(500, L.tMicro * 0.96), 0.04, L.w - L.mx * 1.6).font,
        fill: 'rgba(255,255,255,0.55)', alpha: clamp(spring(dt - 1.5, 190, 26)), track: 0.04,
      });
      vignette(g, L, 0.42);
      grain(g, L, t, 5);
    }},
];

export function draw(g, L, t, DURF) {
  const tt = ((t % DURF) + DURF) % DURF;
  for (const s of SC) if (tt >= s.frm && tt < s.to) { s.draw(g, L, tt, tt - s.frm); return; }
  ground(g, L, tt);
}

// Beat-locked SFX. SFX-first per the locked brand rule; no music bed.
export const sfx = [
  { t: 0.02, type: 'swell' },
  { t: 0.35, type: 'pop' },
  { t: 0.70, type: 'tick' },
  { t: 0.95, type: 'click' },
  { t: 1.20, type: 'tick' },
  { t: 1.45, type: 'tick' },
  { t: 1.70, type: 'tick' },
  { t: 2.60, type: 'hit' },
  { t: 6.50, type: 'whoosh' },
  { t: 6.80, type: 'click' },
  { t: 7.30, type: 'tick' },
  { t: 8.00, type: 'click' },
  { t: 8.70, type: 'tick' },
  { t: 9.40, type: 'click' },
  { t: 10.10, type: 'tick' },
  { t: 11.50, type: 'swell' },
  { t: 11.80, type: 'pop' },
  { t: 12.30, type: 'click' },
  { t: 13.00, type: 'tick' },
  { t: 13.70, type: 'click' },
  { t: 14.40, type: 'pop' },
  { t: 15.30, type: 'hit' },
  { t: 16.40, type: 'click' },
  { t: 17.20, type: 'hit' },
];
