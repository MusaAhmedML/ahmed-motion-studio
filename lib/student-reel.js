// FILM TEMPLATE — student-facing pain reel
//
// Four reels, one engine, four configs. The point of this file is that adding a
// fifth reel tomorrow is a config object, not a new film.
//
// Arc (message first, brand last):
//   0-7s   HOOK        the student's own question, huge, karaoke-captions
//   7-13s  THE TRUTH   the reframe — it is one specific thing, not the student
//   13-19s THE FIX      free onboarding call → diagnose + roadmap → proof → CTA
//
// Subject-agnostic by default. When a pain is subject-bound (e.g. calculations)
// the config supplies the exact words, so the claim stays true.

import { C, F, bg, vignette, grain, text, block, setType, rule, fitText } from './brand.js';
import { clamp, lerp, smooth, spring } from './motion.js';
import { plate, coverFit, containFit } from './assets.js';

// Verified palette from the logo extraction.
export const K = {
  gold: '#facc15', goldDeep: '#ca8a04',
  cyan: '#38bdf8', cyanDeep: '#06b6d4',
  emerald: '#34d399', rose: '#fb7185',
  slate: '#94a3b8', ink: '#0b1120',
};

const B = 0.5;

export const SUBJECTS_GCSE = 'GCSE Maths · English · Science · CS';
export const SUBJECTS_ALVL = 'A-Level Maths · Physics · CS';

// Brand constants — approved claims only. Never invent numbers or testimonials.
export const PROOF = [
  ['A*A*AAA', 'at A-Level'],
  ['Manchester · Edinburgh', 'university offers'],
  ['Straight 9s and 8s', 'in tutored subjects'],
];

function ground(g, L, warm) {
  const gr = g.createLinearGradient(0, 0, 0, L.h);
  if (warm) {
    gr.addColorStop(0.00, '#f7f4ec');
    gr.addColorStop(0.30, '#e7e1d2');
  } else {
    gr.addColorStop(0.00, '#0d1526');
    gr.addColorStop(0.34, K.ink);
  }
  gr.addColorStop(0.58, K.ink);
  gr.addColorStop(1.00, '#070b14');
  g.fillStyle = gr;
  g.fillRect(0, 0, L.w, L.h);
  const bl = g.createRadialGradient(L.w * 0.5, L.h * 0.38, 20, L.w * 0.5, L.h * 0.38, L.w * 0.9);
  bl.addColorStop(0, 'rgba(56,189,248,0.15)');
  bl.addColorStop(1, 'rgba(56,189,248,0)');
  g.fillStyle = bl;
  g.fillRect(0, 0, L.w, L.h);
}

// Karaoke caption: word-by-word sweep with a gold underline on the key word.
export function karaoke(g, L, p, line, key, { y, size, colour = '#ffffff', centre = true, maxW }) {
  const a = clamp(spring(p, 200, 24));
  if (a <= 0.004) return;
  // Shrink to fit the measure. A hook that runs off both edges is worse than
  // one that is 15% smaller — the hook is the whole reel.
  const avail = maxW ?? (L.w - L.mx * 1.7);
  setType(g, F.display(800, size), -0.03);
  let w = g.measureText(line + ' ').width;
  if (w > avail) size = Math.max(18, Math.floor(size * (avail / w)));
  const font = F.display(800, size);
  g.save();
  setType(g, font, -0.03);
  const words = line.split(' ');
  const widths = words.map(w => g.measureText(w + ' ').width);
  const total = widths.reduce((x, y) => x + y, 0);
  let x = centre ? L.cx - total / 2 : L.mx;
  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';
  const keyWords = (key || '').toLowerCase().split(' ').filter(Boolean);
  words.forEach((w, i) => {
    const wp = clamp((p - 0.14) * 1.9 - i * 0.16);
    const bare = w.replace(/[.,—?!:]/g, '').toLowerCase();
    const isKey = keyWords.includes(bare);
    g.fillStyle = wp > 0.5 ? colour : 'rgba(255,255,255,0.40)';
    g.fillText(w, x, y);
    if (isKey && wp > 0.5) {
      const pop = clamp(spring(wp - 0.5, 420, 18));
      g.save();
      g.globalAlpha = a * pop;
      g.fillStyle = K.gold;
      g.fillRect(x - 2, y + size * 0.11, widths[i] - size * 0.06, Math.max(3, size * 0.045));
      g.restore();
    }
    x += widths[i];
  });
  g.restore();
}

// 35%-fill glass card with a coloured spine — the house spec.
export function card(g, L, x, y, w, h, p, { accent = K.cyan, radius = 20, alpha0 = 0.35 } = {}) {
  const e = clamp(spring(p, 260, 22));
  if (e <= 0.004) return 0;
  g.save();
  g.globalAlpha = clamp(e * 2);
  g.translate(lerp(-w * 0.22, 0, smooth(e)), 0);
  g.fillStyle = `rgba(2,6,23,${alpha0})`;
  g.beginPath(); g.roundRect(x, y, w * lerp(0.86, 1, e), h, radius); g.fill();
  g.fillStyle = accent;
  g.fillRect(x, y, Math.max(5, L.tMicro * 0.20), h);
  g.restore();
  return clamp(e * 2);
}

export function dot(g, L, x, y, p, colour) {
  const e = clamp(spring(p, 340, 18));
  if (e <= 0.004) return;
  g.save();
  g.globalAlpha = clamp(e * 2.2);
  g.translate(x, y);
  g.scale(lerp(0.2, 1, e), lerp(0.2, 1, e));
  g.fillStyle = colour;
  g.beginPath(); g.arc(0, 0, L.tMicro * 0.34, 0, Math.PI * 2); g.fill();
  g.restore();
}

// The official logo plate, composited — never redrawn. This used to plate
// `logo_gold.png` behind a gold radial glow. Both are wrong now: the supplied asset
// `brand_logo.png` IS the official mark (silver AA monogram + stacked AHMED ACADEMY),
// and the reel standard bans glow on brand chrome. Reels 11-14 use this shared helper,
// which is why the gold mark kept reappearing after 15-recall had already moved to
// the real one. Kept byte-identical in framing to the original so nothing else shifts.
export function logoLock(g, L, cx, cy, size, p) {
  const lp = clamp(spring(p, 190, 24));
  if (lp <= 0.004) return;
  const lg = plate('brand_logo.png');
  if (!containFit(g, lg, cx, cy, size * lp)) {
    const cw = size * lp, ch = size * 0.33;
    g.save(); g.globalAlpha = lp;
    g.fillStyle = '#ffffff';
    g.beginPath(); g.roundRect(cx - cw / 2, cy - ch / 2, cw, ch, ch * 0.4); g.fill();
    text(g, 'AHMED ACADEMY', cx, cy + ch * 0.16, {
      font: fitText(g, 'AHMED ACADEMY', F.display(700, L.tSmall * 0.46), 0.06, cw * 0.86).font,
      fill: K.ink, track: 0.06,
    });
    g.restore();
  }
}

export function portrait(g, L, x, y, w, h, p, { radius = 16 } = {}) {
  const e = clamp(spring(p, 190, 24));
  if (e <= 0.004) return;
  const face = plate('face.jpg');
  const we = w * e, he = h * e;
  if (!coverFit(g, face, x, y, we, he, radius)) {
    g.save(); g.globalAlpha = e; g.fillStyle = 'rgba(255,255,255,0.12)';
    g.beginPath(); g.roundRect(x, y, we, he, radius); g.fill(); g.restore();
  } else {
    // lift the portrait so it never dissolves into the dark plate
    g.save();
    g.beginPath(); g.roundRect(x, y, we, he, radius); g.clip();
    g.globalCompositeOperation = 'lighten';
    g.globalAlpha = 0.10 * e;
    g.fillStyle = '#7d8ea8';
    g.fillRect(x, y, we, he);
    g.restore();
  }
  g.save();
  g.globalAlpha = e;
  g.strokeStyle = K.gold;
  g.lineWidth = Math.max(2, L.tMicro * 0.11);
  g.beginPath(); g.roundRect(x, y, we, he, radius); g.stroke();
  g.restore();
  return e;
}

export function finish(g, L, t) {
  vignette(g, L, 0.42);
  grain(g, L, t, 5);
}

/**
 * Build a film module from a config. Four films exist; a fifth is one object.
 *
 * cfg = {
 *   id, dur, badge,
 *   hook:  'question shown huge',
 *   key:   'words in the hook that get the gold underline',
 *   truth: ['line one', 'line two'],       // the reframe
 *   truthKey: 'gold this word',
 *   fix:   [['label','body','accent'], ...], // 2-3 cards
 *   note:  'single line under the cards',
 * }
 */
export function makeStudentReel(cfg, grid) {
  // Cuts land on MEASURED onsets in the track, so the edit is locked to the music.
  const T1 = 0;
  const T2 = grid ? grid.T2 : cfg.dur * 0.38;
  const T3 = grid ? grid.T3 : cfg.dur * 0.70;

  return {
    assets: ['face.jpg', 'brand_logo.png'],
    duration: cfg.dur,
    setup() {},
    draw(g, L, t) {
      // ---- HOOK
      if (t < T2) {
        const dt = t - T1;
        ground(g, L, true);
        const pw = L.w * 0.74, ph = pw * 1.10;
        const px = (L.w - pw) / 2, py = L.h * 0.075;
        portrait(g, L, px, py, pw, ph, clamp(spring(dt, 170, 23)));
        // scrim + who am I
        const sg = g.createLinearGradient(0, py + ph * 0.55, 0, py + ph);
        sg.addColorStop(0, 'rgba(2,6,23,0)');
        sg.addColorStop(1, 'rgba(2,6,23,0.94)');
        g.fillStyle = sg; g.fillRect(px, py + ph * 0.55, pw, ph * 0.45);
        text(g, 'MUSA AHMED', L.cx, py + ph - L.tSmall * 1.10, {
          font: fitText(g, 'MUSA AHMED', F.display(800, L.tSmall * 1.22), 0.02, pw * 0.84).font,
          fill: '#ffffff', alpha: clamp(spring(dt - 0.25, 200, 25)), track: 0.02,
        });
        text(g, 'A*A*AAA  ·  Manchester & Edinburgh', L.cx, py + ph - L.tSmall * 0.26, {
          font: fitText(g, 'A*A*AAA  ·  Manchester & Edinburgh', F.mono(600, L.tMicro * 1.0), 0.02, pw * 0.88).font,
          fill: K.gold, alpha: clamp(spring(dt - 0.4, 200, 25)), track: 0.02,
        });
        // badge
        const bp = clamp(spring(dt - 0.55, 250, 22));
        if (bp > 0.01) {
          const bw = L.w * 0.56 * bp, bh = L.tSmall * 1.38;
          g.save(); g.globalAlpha = clamp(bp * 2); g.fillStyle = K.gold;
          g.beginPath(); g.roundRect(L.cx - bw / 2, py - bh * 0.62, bw, bh, bh * 0.3); g.fill(); g.restore();
          text(g, cfg.badge, L.cx, py - bh * 0.62 + bh * 0.68, {
            font: fitText(g, cfg.badge, F.display(800, L.tSmall * 0.80), 0.10, bw * 0.88).font,
            fill: K.ink, alpha: clamp(bp * 2.2), track: 0.10,
          });
        }
        karaoke(g, L, dt - 0.85, cfg.hook, cfg.key, { y: L.h * 0.705, size: L.tBig * 0.50 });
        rule(g, L, L.cx, L.h * 0.780, L.w * 0.30, clamp(spring(dt - 1.6, 300, 20)),
             { thick: Math.max(3, L.tMicro * 0.16), fill: K.gold });
        text(g, 'Free onboarding call — no cost, no commitment', L.cx, L.h * 0.850, {
          font: fitText(g, 'Free onboarding call — no cost, no commitment', F.mono(600, L.tSmall * 0.72), 0.02, L.w - L.mx * 1.7).font,
          fill: '#ffffff', alpha: clamp(spring(dt - 1.8, 200, 26)), track: 0.02,
        });
        finish(g, L, t);
        return;
      }

      // ---- TRUTH
      if (t < T3) {
        const dt = t - T2;
        ground(g, L, false);
        karaoke(g, L, dt - 0.10, cfg.truth[0], cfg.truthKey, { y: L.h * 0.185, size: L.tBig * 0.56 });
        karaoke(g, L, dt - 1.05, cfg.truth[1], cfg.truthKey, { y: L.h * 0.285, size: L.tBig * 0.56 });
        cfg.fix.forEach((f, i) => {
          const y = L.h * (0.375 + i * 0.125);
          const a = card(g, L, L.mx, y, L.w - L.mx * 2, L.h * 0.104, dt - 0.35 - i * 0.18, { accent: f[2] });
          if (a <= 0.004) return;
          dot(g, L, L.mx + L.tSmall * 0.62, y + L.tSmall * 0.56, dt - 0.35 - i * 0.18, f[2]);
          const tx = L.mx + L.tSmall * 1.15;
          const avail = (L.w - L.mx) - tx - L.tSmall * 0.5;
          text(g, f[0], tx, y + L.tSmall * 0.74, {
            font: fitText(g, f[0], F.mono(700, L.tSmall * 0.80), 0.08, avail).font,
            fill: '#ffffff', align: 'left', alpha: a, track: 0.08,
          });
          text(g, f[1], tx, y + L.tSmall * 1.45, {
            font: fitText(g, f[1], F.mono(500, L.tMicro * 1.0), 0.0, avail).font,
            fill: K.slate, align: 'left', alpha: a * 0.95,
          });
        });
        if (cfg.note) {
          text(g, cfg.note, L.cx, L.h * 0.815, {
            font: fitText(g, cfg.note, F.mono(600, L.tSmall * 0.74), 0.02, L.w - L.mx * 1.7).font,
            fill: K.gold, alpha: clamp(spring(dt - 1.2, 200, 26)), track: 0.02,
          });
        }
        finish(g, L, t);
        return;
      }

      // ---- FIX + PROOF + CTA
      const dt = t - T3;
      ground(g, L, false);
      // what the free call actually is
      text(g, 'THE FREE ONBOARDING CALL', L.mx, L.h * 0.155, {
        font: fitText(g, 'THE FREE ONBOARDING CALL', F.mono(700, L.tMicro * 1.05), 0.16, L.w - L.mx * 2).font,
        fill: K.gold, align: 'left', alpha: clamp(spring(dt, 200, 26)), track: 0.16,
      });
      const steps = [
        ['DIAGNOSE', 'we find the one topic costing you marks', K.cyan],
        ['ROADMAP', 'you leave with a written plan, free', K.emerald],
        ['DECIDE', 'tuition only if you want it', K.gold],
      ];
      steps.forEach((s, i) => {
        const y = L.h * (0.215 + i * 0.082);
        const a = card(g, L, L.mx, y, L.w - L.mx * 2, L.h * 0.066, dt - 0.20 - i * 0.16, { accent: s[2], radius: 16 });
        if (a <= 0.004) return;
        const labFont = F.display(800, L.tSmall * 0.78);
        const labX = L.mx + L.tSmall * 0.70;
        g.save(); setType(g, labFont, 0.10); const lw = g.measureText(s[0]).width; g.restore();
        text(g, s[0], labX, y + L.tSmall * 0.92, { font: labFont, fill: s[2], align: 'left', alpha: a, track: 0.10 });
        const bx = labX + lw + L.tSmall * 0.70;
        text(g, s[1], bx, y + L.tSmall * 0.92, {
          font: fitText(g, s[1], F.mono(500, L.tSmall * 0.68), 0.0, (L.w - L.mx) - bx - L.tSmall * 0.5).font,
          fill: '#ffffff', align: 'left', alpha: a * 0.92,
        });
      });
      // proof: I did it too
      PROOF.forEach((r, i) => {
        const rp = clamp(spring(dt - 0.65 - i * 0.15, 230, 24));
        const y = L.h * 0.505 + i * L.tSmall * 1.42;
        text(g, r[0], L.mx, y, {
          font: fitText(g, r[0], F.display(700, L.tSmall * 0.90), -0.02, L.w * 0.48).font,
          fill: '#ffffff', align: 'left', alpha: rp,
        });
        text(g, r[1], L.w - L.mx, y, { font: F.mono(500, L.tMicro), fill: K.slate, align: 'right', alpha: rp });
        g.save(); g.globalAlpha = rp * 0.5;
        g.fillStyle = 'rgba(255,255,255,0.16)';
        g.fillRect(L.mx, y + L.tSmall * 0.32, L.w - L.mx * 2, 1);
        g.restore();
      });
      portrait(g, L, L.mx, L.h * 0.615, L.w * 0.20, L.w * 0.20 * 1.15, dt - 0.55, { radius: 12 });
      logoLock(g, L, L.w - L.mx - L.tSmall * 1.7, L.h * 0.700, L.tSmall * 3.6, dt - 0.45);
      // CTA
      const cp = clamp(spring(dt - 0.95, 220, 23));
      if (cp > 0.004) {
        const bw = (L.w - L.mx * 2) * 0.96 * cp, bh = L.tSmall * 2.5;
        const bx = L.cx - bw / 2, by = L.h * 0.845;
        g.save(); g.globalAlpha = clamp(cp * 2);
        const gr = g.createLinearGradient(0, by, 0, by + bh);
        gr.addColorStop(0, K.cyan); gr.addColorStop(1, K.cyanDeep);
        g.fillStyle = gr;
        g.beginPath(); g.roundRect(bx, by, bw, bh, bh * 0.20); g.fill(); g.restore();
        text(g, 'Book the free call', L.cx, by + bh * 0.62, {
          font: fitText(g, 'Book the free call', F.display(800, L.tSmall * 0.98), -0.015, bw * 0.86).font,
          fill: '#04121f', alpha: clamp(cp * 2.2),
        });
      }
      text(g, 'musaahmed.uk/academy', L.cx, L.h * 0.945, {
        font: F.mono(600, L.tMicro), fill: K.gold, alpha: clamp(spring(dt - 1.2, 200, 25)), track: 0.06,
      });
      finish(g, L, t);
    },
    // No SFX by decision: the reel is carried by the music bed alone.
    sfx: [],
  };
}
