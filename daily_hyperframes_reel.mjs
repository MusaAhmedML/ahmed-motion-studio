#!/usr/bin/env node
// DAILY HYPERFRAMES REEL GENERATOR
//
// Generates today's Ahmed Academy 30-second HyperFrames vertical video reel (1080x1920)
// with rotating educational concepts, 16:10 laptop UI views, Musa's face,
// sovereign obsidian/crimson branding, and brag_mix.wav halal audio bed.
//
//   node daily_hyperframes_reel.mjs            # today
//   node daily_hyperframes_reel.mjs 2026-10-12 # specific date
//   node daily_hyperframes_reel.mjs --force    # overwrite existing

import { spawnSync, execSync } from 'node:child_process';
import { mkdirSync, existsSync, writeFileSync, copyFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const force = args.includes('--force');
const dateArg = args.find(a => /^\d{4}-\d{2}-\d{2}$/.test(a));
const DATE = dateArg || new Date().toISOString().slice(0, 10);

const OUT_DIR = `/home/musaahmedml/CHROMEOS_BACKUP/MacroStudyHub/Daily Marketing/${DATE}`;
const OUT_FILE = join(OUT_DIR, 'daily_hyperframes_reel.mp4');
const AUDIO_FILE = resolve(ROOT, 'audio/brag_mix.wav');

const ASSETS_SRC = '/home/musaahmedml/GoogleDrive/01_Ahmed Academy/03_Content & Media/Videos/Launch_Reel_30s/assets';

if (existsSync(OUT_FILE) && !force) {
  console.log(`[hyperframes-reel] ${DATE} reel already exists at ${OUT_FILE}. Use --force to regenerate.`);
  process.exit(0);
}

mkdirSync(OUT_DIR, { recursive: true });

// Rotate concept themes deterministically by day
const CONCEPTS = [
  {
    theme: 'THE SYSTEM FOR THE TOP GRADE.',
    headline: 'THE SYSTEM FOR THE TOP GRADE.',
    hookWord: 'TOP GRADE.',
    feat1Badge: 'TAILORED ARCHITECTURE',
    feat1Title: 'A PLAN FOR EVERY GAP',
    feat1Image: 'ui_method_16_10.png',
    feat1Bullet1: 'Target Grade',
    feat1Desc1: 'Pinpoints exact topics holding back the grade',
    feat1Bullet2: 'Order of Attack',
    feat1Desc2: 'Structured roadmap attacking weaknesses first',
    feat1Bullet3: 'No Guesswork',
    feat1Desc3: 'Written per student, never shared with a class',
    feat2Badge: 'DIRECT MENTORSHIP',
    feat2Title: 'LIVE DERIVATIONS. NO HAND-OFFS.',
    feat2Image: 'ui_hero_16_10.png',
    feat3Badge: 'EXAM MASTERY',
    feat3Title: 'PRICED PLAINLY. BUILT FOR RESULTS.',
    feat3Image: 'ui_pricing_16_10.png'
  },
  {
    theme: 'RE-READING IS NOT REVISION.',
    headline: 'RE-READING IS NOT REVISION.',
    hookWord: 'NOT REVISION.',
    feat1Badge: 'COGNITIVE DERIVATION',
    feat1Title: 'DERIVE IT FROM FIRST PRINCIPLES',
    feat1Image: 'ui_method_16_10.png',
    feat1Bullet1: 'Active Recall',
    feat1Desc1: 'Pull concepts out of memory under timed pressure',
    feat1Bullet2: 'Tablet Screencast',
    feat1Desc2: 'Live derivation on reMarkable 2 screen share',
    feat1Bullet3: 'Zero Agency Bloat',
    feat1Desc3: 'Taught directly by Musa Ahmed start to finish',
    feat2Badge: 'PROVEN PEDAGOGY',
    feat2Title: 'A*A*AAA FOUNDER TRACK RECORD',
    feat2Image: 'ui_hero_16_10.png',
    feat3Badge: 'TRANSPARENT TUITION',
    feat3Title: 'NO CONTRACTS. NO GUESSWORK.',
    feat3Image: 'ui_pricing_16_10.png'
  },
  {
    theme: 'JANUARY MOCKS DECIDE SUMMER.',
    headline: 'JANUARY MOCKS DECIDE SUMMER.',
    hookWord: 'DECIDE SUMMER.',
    feat1Badge: 'MARK SCHEME HABITS',
    feat1Title: 'TIMED DRILL & MARK SCHEME DECODING',
    feat1Image: 'ui_method_16_10.png',
    feat1Bullet1: 'Keyword Precision',
    feat1Desc1: 'Learn exactly what examiners award marks for',
    feat1Bullet2: 'Weekly Review',
    feat1Desc2: 'Every past paper mistake logged and corrected',
    feat1Bullet3: 'Zero Decay',
    feat1Desc3: 'Spaced review intervals keep methods permanently fresh',
    feat2Badge: 'OFFERS & STANDARDS',
    feat2Title: '5 TOP UK UNIVERSITY OFFERS',
    feat2Image: 'ui_hero_16_10.png',
    feat3Badge: 'INVESTMENT & TIERS',
    feat3Title: '£29.99/HR A-LEVEL · £24.99/HR GCSE',
    feat3Image: 'ui_pricing_16_10.png'
  }
];

const dayNum = Math.floor(new Date(DATE + 'T00:00:00Z').getTime() / 86400000);
const concept = CONCEPTS[dayNum % CONCEPTS.length];

console.log(`[hyperframes-reel] ${DATE} selected theme: "${concept.theme}"`);

// Build directory
const BUILD_DIR = `/tmp/hf_reel_build_${DATE}`;
mkdirSync(BUILD_DIR, { recursive: true });
const BUILD_ASSETS = join(BUILD_DIR, 'assets');
mkdirSync(BUILD_ASSETS, { recursive: true });

// Copy images
const images = ['logo.png', 'ui_method_16_10.png', 'ui_hero_16_10.png', 'ui_pricing_16_10.png'];
for (const img of images) {
  const src = join(ASSETS_SRC, img);
  if (existsSync(src)) {
    copyFileSync(src, join(BUILD_ASSETS, img));
  }
}

// Generate index.html
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1080, height=1920, initial-scale=1.0" />
  <title>Ahmed Academy Reel - ${DATE}</title>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body, html { width: 1080px; height: 1920px; overflow: hidden; background-color: #07080a; font-family: 'Montserrat', sans-serif; color: #ffffff; }
    .video-canvas { position: relative; width: 1080px; height: 1920px; background-color: #07080a; overflow: hidden; }
    .bg-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 72px 72px; z-index: 1; }
    .glow-radial { position: absolute; width: 700px; height: 700px; border-radius: 50%; filter: blur(140px); opacity: 0.22; pointer-events: none; z-index: 2; }
    .glow-red { background: #dc2626; }
    .scene { position: absolute; inset: 0; width: 1080px; height: 1920px; z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .clip { opacity: 0; visibility: hidden; }
    .glass-card { background: rgba(14, 16, 21, 0.78); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 28px; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6); }
    .feature-device-card { width: 980px; height: 656px; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.12); background: #0c0d12; box-shadow: 0 36px 80px rgba(0, 0, 0, 0.7); overflow: hidden; display: flex; flex-direction: column; }
    .browser-header-bar { height: 44px; background: #13151c; border-bottom: 1px solid rgba(255, 255, 255, 0.08); display: flex; align-items: center; padding: 0 18px; position: relative; }
    .browser-dots { display: flex; gap: 8px; }
    .browser-dot { width: 12px; height: 12px; border-radius: 50%; }
    .browser-url-pill { position: absolute; left: 50%; transform: translateX(-50%); background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 3px 20px; font-family: 'Space Mono', monospace; font-size: 13px; color: #8e95a5; display: flex; align-items: center; gap: 6px; }
    .browser-screen-wrap { width: 980px; height: 612px; position: relative; background: #07080a; overflow: hidden; display: flex; align-items: center; justify-content: center; }
    .browser-screen-wrap img { width: 100%; height: 100%; object-fit: contain; display: block; }
    .badge-pill { font-family: 'Space Mono', monospace; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #f87171; background: rgba(220, 38, 38, 0.12); border: 1px solid rgba(220, 38, 38, 0.3); border-radius: 100px; padding: 8px 24px; font-weight: 700; }
  </style>
</head>
<body>
  <div id="root" data-composition-id="main" data-start="0" data-width="1080" data-height="1920" data-duration="30" class="video-canvas">
    <div class="bg-grid"></div>
    <div class="glow-radial glow-red" id="bg-glow" style="top: 20%; left: 18%;"></div>

    <!-- Scene 1: Logo Reveal (0 to 3s) -->
    <div class="scene clip" id="scene-logo" data-start="0" data-end="3.2">
      <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
        <img id="logo-emblem" src="assets/logo.png" style="width: 280px; height: auto; filter: drop-shadow(0 20px 40px rgba(220, 38, 38, 0.35)); margin-bottom: 40px;" />
        <div class="badge-pill" style="margin-bottom: 24px;">FOUNDED BY MUSA AHMED</div>
        <h1 style="font-size: 64px; font-weight: 900; letter-spacing: -1.5px; margin-bottom: 16px;">AHMED ACADEMY</h1>
        <div style="width: 120px; height: 3px; background: #dc2626; margin: 0 auto 28px auto;"></div>
        <p style="font-family: 'Space Mono', monospace; font-size: 18px; color: #a1a1aa; letter-spacing: 2px;">ONE-TO-ONE TUITION · CUSTOM LEARNING PLANS</p>
      </div>
    </div>

    <!-- Scene 2: Kinetic Headline (3 to 8s) -->
    <div class="scene clip" id="scene-headline" data-start="3" data-end="8.2">
      <div style="max-width: 940px; text-align: center;">
        <div class="badge-pill" style="margin-bottom: 44px; display: inline-block;">THE ACADEMIC STANDARD</div>
        <h2 style="font-size: 88px; font-weight: 900; line-height: 1.05; letter-spacing: -2px;">
          ${concept.headline.split(' ').map((w, i) => `<span class="k-word" style="display: inline-block; margin-right: 18px; ${w.includes(concept.hookWord.split(' ')[0]) ? 'color: #dc2626;' : ''}">${w}</span>`).join('')}
        </h2>
        <p id="headline-sub" style="margin-top: 50px; font-size: 24px; color: #9ca3af; font-weight: 400; line-height: 1.5;">
          A bespoke learning plan for every gap. Taught directly by Musa Ahmed over Google Meet with live derivations.
        </p>
      </div>
    </div>

    <!-- Scene 3: Feature 1 (8 to 13s) -->
    <div class="scene clip" id="scene-feat1" data-start="8" data-end="13.2">
      <div style="text-align: center; margin-bottom: 36px;">
        <div class="badge-pill" style="margin-bottom: 16px; display: inline-block;">• FEATURE 01 · ${concept.feat1Badge}</div>
        <h3 style="font-size: 62px; font-weight: 900; letter-spacing: -1px;">${concept.feat1Title}</h3>
      </div>
      <div class="feature-device-card">
        <div class="browser-header-bar">
          <div class="browser-dots">
            <div class="browser-dot" style="background: #ff5f56;"></div>
            <div class="browser-dot" style="background: #ffbd2e;"></div>
            <div class="browser-dot" style="background: #27c93f;"></div>
          </div>
          <div class="browser-url-pill"><span>🔒</span> musaahmed.uk/academy</div>
        </div>
        <div class="browser-screen-wrap">
          <img src="assets/${concept.feat1Image}" />
        </div>
      </div>
      <div style="margin-top: 36px; display: flex; gap: 20px; width: 980px;">
        <div class="glass-card" style="flex: 1; padding: 24px;">
          <div style="font-family: 'Space Mono', monospace; font-size: 13px; color: #f87171; margin-bottom: 8px;">01 // ${concept.feat1Bullet1}</div>
          <p style="font-size: 19px; font-weight: 700; line-height: 1.3;">${concept.feat1Desc1}</p>
        </div>
        <div class="glass-card" style="flex: 1; padding: 24px;">
          <div style="font-family: 'Space Mono', monospace; font-size: 13px; color: #f87171; margin-bottom: 8px;">02 // ${concept.feat1Bullet2}</div>
          <p style="font-size: 19px; font-weight: 700; line-height: 1.3;">${concept.feat1Desc2}</p>
        </div>
        <div class="glass-card" style="flex: 1; padding: 24px;">
          <div style="font-family: 'Space Mono', monospace; font-size: 13px; color: #f87171; margin-bottom: 8px;">03 // ${concept.feat1Bullet3}</div>
          <p style="font-size: 19px; font-weight: 700; line-height: 1.3;">${concept.feat1Desc3}</p>
        </div>
      </div>
    </div>

    <!-- Scene 4: Feature 2 (13 to 18s) -->
    <div class="scene clip" id="scene-feat2" data-start="13" data-end="18.2">
      <div style="text-align: center; margin-bottom: 36px;">
        <div class="badge-pill" style="margin-bottom: 16px; display: inline-block;">• FEATURE 02 · ${concept.feat2Badge}</div>
        <h3 style="font-size: 62px; font-weight: 900; letter-spacing: -1px;">${concept.feat2Title}</h3>
      </div>
      <div class="feature-device-card">
        <div class="browser-header-bar">
          <div class="browser-dots">
            <div class="browser-dot" style="background: #ff5f56;"></div>
            <div class="browser-dot" style="background: #ffbd2e;"></div>
            <div class="browser-dot" style="background: #27c93f;"></div>
          </div>
          <div class="browser-url-pill"><span>🔒</span> musaahmed.uk/academy</div>
        </div>
        <div class="browser-screen-wrap">
          <img src="assets/${concept.feat2Image}" />
        </div>
      </div>
      <div style="margin-top: 36px; display: flex; gap: 20px; width: 980px;">
        <div class="glass-card" style="flex: 1; padding: 24px;">
          <div style="font-family: 'Space Mono', monospace; font-size: 13px; color: #f87171; margin-bottom: 8px;">01 // PROVEN TRACK RECORD</div>
          <p style="font-size: 19px; font-weight: 700; line-height: 1.3;">5 top UK university offers (Manchester 2x, Edinburgh)</p>
        </div>
        <div class="glass-card" style="flex: 1; padding: 24px;">
          <div style="font-family: 'Space Mono', monospace; font-size: 13px; color: #f87171; margin-bottom: 8px;">02 // FIRST PRINCIPLES</div>
          <p style="font-size: 19px; font-weight: 700; line-height: 1.3;">Live derivation on reMarkable 2 tablet screen share</p>
        </div>
        <div class="glass-card" style="flex: 1; padding: 24px;">
          <div style="font-family: 'Space Mono', monospace; font-size: 13px; color: #f87171; margin-bottom: 8px;">03 // ZERO AGENCIES</div>
          <p style="font-size: 19px; font-weight: 700; line-height: 1.3;">Taught directly by Musa. One mentor start to finish</p>
        </div>
      </div>
    </div>

    <!-- Scene 5: Feature 3 (18 to 23s) -->
    <div class="scene clip" id="scene-feat3" data-start="18" data-end="23.2">
      <div style="text-align: center; margin-bottom: 36px;">
        <div class="badge-pill" style="margin-bottom: 16px; display: inline-block;">• FEATURE 03 · ${concept.feat3Badge}</div>
        <h3 style="font-size: 62px; font-weight: 900; letter-spacing: -1px;">${concept.feat3Title}</h3>
      </div>
      <div class="feature-device-card">
        <div class="browser-header-bar">
          <div class="browser-dots">
            <div class="browser-dot" style="background: #ff5f56;"></div>
            <div class="browser-dot" style="background: #ffbd2e;"></div>
            <div class="browser-dot" style="background: #27c93f;"></div>
          </div>
          <div class="browser-url-pill"><span>🔒</span> musaahmed.uk/academy</div>
        </div>
        <div class="browser-screen-wrap">
          <img src="assets/${concept.feat3Image}" />
        </div>
      </div>
      <div style="margin-top: 36px; display: flex; gap: 20px; width: 980px;">
        <div class="glass-card" style="flex: 1; padding: 24px;">
          <div style="font-family: 'Space Mono', monospace; font-size: 13px; color: #a1a1aa; margin-bottom: 4px;">A-LEVEL (Y12 & Y13)</div>
          <p style="font-size: 32px; font-weight: 900; color: #fff;">£29.99 <span style="font-size: 16px; font-weight: 400; color: #a1a1aa;">/ hr</span></p>
          <div style="font-family: 'Space Mono', monospace; font-size: 13px; color: #4ade80; margin-top: 8px;">✓ Maths, Physics, CS · BACS</div>
        </div>
        <div class="glass-card" style="flex: 1; padding: 24px;">
          <div style="font-family: 'Space Mono', monospace; font-size: 13px; color: #a1a1aa; margin-bottom: 4px;">GCSE (Y9, Y10 & Y11)</div>
          <p style="font-size: 32px; font-weight: 900; color: #fff;">£24.99 <span style="font-size: 16px; font-weight: 400; color: #a1a1aa;">/ hr</span></p>
          <div style="font-family: 'Space Mono', monospace; font-size: 13px; color: #4ade80; margin-top: 8px;">✓ Maths, Science, CS, English</div>
        </div>
        <div class="glass-card" style="flex: 1; padding: 24px;">
          <div style="font-family: 'Space Mono', monospace; font-size: 13px; color: #a1a1aa; margin-bottom: 4px;">GROUP SESSIONS</div>
          <p style="font-size: 32px; font-weight: 900; color: #fff;">Negotiated</p>
          <div style="font-family: 'Space Mono', monospace; font-size: 13px; color: #4ade80; margin-top: 8px;">✓ Families with siblings</div>
        </div>
      </div>
    </div>

    <!-- Scene 6: CTA & URL (23 to 30s) -->
    <div class="scene clip" id="scene-cta" data-start="23" data-end="30">
      <div style="text-align: center; display: flex; flex-direction: column; align-items: center; width: 920px;">
        <img src="assets/logo.png" style="width: 150px; margin-bottom: 28px;" />
        <div class="badge-pill" style="margin-bottom: 24px;">• LIMITED AUTUMN INTAKE</div>
        <h2 style="font-size: 74px; font-weight: 900; letter-spacing: -2px; margin-bottom: 20px;">FIND THE REAL BLOCKER.</h2>
        <p style="font-size: 26px; color: #d4d4d8; line-height: 1.45; font-weight: 500; margin-bottom: 50px;">
          Book a free 30-minute diagnostic call over Google Meet. No cost, no obligation, and an honest roadmap for the top grade.
        </p>
        <div class="glass-card" style="padding: 38px 60px; border-color: rgba(220, 38, 38, 0.4); margin-bottom: 36px; width: 100%;">
          <div style="font-family: 'Space Mono', monospace; font-size: 15px; color: #f87171; letter-spacing: 3px; margin-bottom: 12px;">OFFICIAL PLATFORM & BOOKING</div>
          <div style="font-family: 'Space Mono', monospace; font-size: 46px; font-weight: 700; color: #ffffff;">musaahmed.uk/academy</div>
        </div>
        <div style="background: #dc2626; color: white; padding: 22px 64px; border-radius: 20px; font-size: 24px; font-weight: 800; box-shadow: 0 15px 35px rgba(220, 38, 38, 0.45);">
          BOOK DIAGNOSTIC CALL →
        </div>
      </div>
    </div>
  </div>

  <script>
    window.__timelines = window.__timelines || {};
    gsap.set(".clip", { autoAlpha: 0 });
    const tl = gsap.timeline({ paused: true });

    // S1
    tl.to("#scene-logo", { autoAlpha: 1, duration: 0.4 }, 0)
      .from("#logo-emblem", { scale: 0.7, duration: 0.9, ease: "back.out(1.5)" }, 0.1)
      .to("#scene-logo", { autoAlpha: 0, duration: 0.4 }, 2.7);

    // S2
    tl.to("#scene-headline", { autoAlpha: 1, duration: 0.4 }, 3.0)
      .from(".k-word", { opacity: 0, y: 35, duration: 0.5, stagger: 0.15, ease: "power3.out" }, 3.1)
      .from("#headline-sub", { opacity: 0, y: 20, duration: 0.6 }, 4.4)
      .to("#scene-headline", { autoAlpha: 0, duration: 0.4 }, 7.7);

    // S3
    tl.to("#scene-feat1", { autoAlpha: 1, duration: 0.4 }, 8.0)
      .from("#scene-feat1 .feature-device-card", { y: 40, opacity: 0, duration: 0.7, ease: "power3.out" }, 8.1)
      .to("#scene-feat1", { autoAlpha: 0, duration: 0.4 }, 12.7);

    // S4
    tl.to("#scene-feat2", { autoAlpha: 1, duration: 0.4 }, 13.0)
      .from("#scene-feat2 .feature-device-card", { y: 40, opacity: 0, duration: 0.7, ease: "power3.out" }, 13.1)
      .to("#scene-feat2", { autoAlpha: 0, duration: 0.4 }, 17.7);

    // S5
    tl.to("#scene-feat3", { autoAlpha: 1, duration: 0.4 }, 18.0)
      .from("#scene-feat3 .feature-device-card", { y: 40, opacity: 0, duration: 0.7, ease: "power3.out" }, 18.1)
      .to("#scene-feat3", { autoAlpha: 0, duration: 0.4 }, 22.7);

    // S6
    tl.to("#scene-cta", { autoAlpha: 1, duration: 0.5 }, 23.0)
      .from("#scene-cta .glass-card", { scale: 0.92, opacity: 0, duration: 0.7, ease: "power2.out" }, 23.3);

    window.__timelines["main"] = tl;
  </script>
</body>
</html>`;

writeFileSync(join(BUILD_DIR, 'index.html'), html);
console.log(`[hyperframes-reel] Composition generated at ${BUILD_DIR}/index.html`);

// Render with HyperFrames
const TMP_RAW = `/tmp/hf_raw_${DATE}.mp4`;
console.log(`[hyperframes-reel] Rendering 30s video via HyperFrames...`);
const renderRes = spawnSync('npx', [
  'hyperframes', 'render', BUILD_DIR,
  '-o', TMP_RAW,
  '--low-memory-mode'
], { stdio: 'inherit' });

if (renderRes.status !== 0 || !existsSync(TMP_RAW)) {
  console.error('[hyperframes-reel] HyperFrames rendering failed.');
  process.exit(1);
}

// Mux audio bed with brag_mix.wav
console.log(`[hyperframes-reel] Muxing halal audio track (${AUDIO_FILE})...`);
const TMP_FINAL = `/tmp/hf_final_${DATE}.mp4`;
execSync(`ffmpeg -y -i "${TMP_RAW}" -stream_loop -1 -i "${AUDIO_FILE}" -c:v copy -filter_complex "[1:a]afade=t=in:st=0:d=0.5,afade=t=out:st=28.5:d=1.5,volume=0.95[a]" -map 0:v:0 -map "[a]" -shortest -movflags +faststart "${TMP_FINAL}"`);

// Copy to final location
copyFileSync(TMP_FINAL, OUT_FILE);
console.log(`[hyperframes-reel] ✓ Successfully saved today's HyperFrames reel to ${OUT_FILE}`);
