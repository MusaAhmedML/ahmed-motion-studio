#!/usr/bin/env node
// DAILY HYPERFRAMES CREATIVE REEL GENERATOR (Option 2 - Kinetic Bento & Generative Visuals)
//
// Synthesizes a creative, highly dynamic 30-second HyperFrames vertical video reel (1080x1920)
// featuring energetic kinetic motion, glowing metrics counters, animated bento cards,
// Musa's portrait, sovereign branding, and brag_mix.wav halal audio bed.
//
//   node daily_hyperframes_creative.mjs            # today
//   node daily_hyperframes_creative.mjs 2026-10-12 # specific date
//   node daily_hyperframes_creative.mjs --force    # overwrite existing

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
const OUT_FILE = join(OUT_DIR, 'daily_hyperframes_creative_reel.mp4');
const AUDIO_FILE = resolve(ROOT, 'audio/brag_mix.wav');

const ASSETS_SRC = '/home/musaahmedml/GoogleDrive/01_Ahmed Academy/03_Content & Media/Videos/Launch_Reel_30s/assets';

if (existsSync(OUT_FILE) && !force) {
  console.log(`[hyperframes-creative] ${DATE} reel already exists at ${OUT_FILE}. Use --force to regenerate.`);
  process.exit(0);
}

mkdirSync(OUT_DIR, { recursive: true });

// Build directory
const BUILD_DIR = `/tmp/hf_creative_build_${DATE}`;
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

// Generate creative index.html
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1080, height=1920, initial-scale=1.0" />
  <title>Ahmed Academy Creative Reel - ${DATE}</title>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,800;0,900;1,800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body, html { width: 1080px; height: 1920px; overflow: hidden; background-color: #07080a; font-family: 'Montserrat', sans-serif; color: #ffffff; }
    .video-canvas { position: relative; width: 1080px; height: 1920px; background-color: #07080a; overflow: hidden; }
    .bg-grid { position: absolute; inset: 0; background-image: radial-gradient(circle, rgba(220, 38, 38, 0.08) 1.5px, transparent 1.5px); background-size: 48px 48px; z-index: 1; }
    .glow-ball { position: absolute; border-radius: 50%; filter: blur(130px); pointer-events: none; z-index: 2; }
    .scene { position: absolute; inset: 0; width: 1080px; height: 1920px; z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px; }
    .clip { opacity: 0; visibility: hidden; }
    .bento-card { background: rgba(13, 15, 20, 0.85); backdrop-filter: blur(28px); border: 1px solid rgba(255, 255, 255, 0.09); border-radius: 32px; padding: 40px; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.55); position: relative; overflow: hidden; }
    .bento-card-red { border-color: rgba(220, 38, 38, 0.4); background: linear-gradient(145deg, rgba(220, 38, 38, 0.12), rgba(13, 15, 20, 0.9)); }
    .tag { font-family: 'Space Mono', monospace; font-size: 13px; text-transform: uppercase; letter-spacing: 2.5px; color: #f87171; }
  </style>
</head>
<body>
  <div id="root" data-composition-id="main" data-start="0" data-width="1080" data-height="1920" data-duration="30" class="video-canvas">
    <div class="bg-grid"></div>
    <div class="glow-ball" style="top: 15%; left: 15%; width: 600px; height: 600px; background: rgba(220, 38, 38, 0.2);"></div>
    <div class="glow-ball" style="bottom: 15%; right: 15%; width: 500px; height: 500px; background: rgba(185, 28, 28, 0.15);"></div>

    <!-- Scene 1: Kinetic Brand Ignition (0 to 3.5s) -->
    <div class="scene clip" id="c-s1" data-start="0" data-end="3.5">
      <img id="c-logo" src="assets/logo.png" style="width: 290px; margin-bottom: 36px; filter: drop-shadow(0 0 50px rgba(220, 38, 38, 0.4));" />
      <div class="tag" style="margin-bottom: 18px; background: rgba(220, 38, 38, 0.15); padding: 8px 24px; border-radius: 99px; border: 1px solid rgba(220, 38, 38, 0.35);">SOVEREIGN ACADEMIC SYSTEM</div>
      <h1 style="font-size: 68px; font-weight: 900; letter-spacing: -2px; text-align: center;">AHMED ACADEMY</h1>
      <div style="font-family: 'Space Mono', monospace; font-size: 19px; color: #a1a1aa; margin-top: 16px; letter-spacing: 2px;">FOUNDED BY MUSA AHMED</div>
    </div>

    <!-- Scene 2: The Core Thesis (3.5 to 9s) -->
    <div class="scene clip" id="c-s2" data-start="3.5" data-end="9">
      <div style="width: 100%; text-align: center;">
        <div class="tag" style="margin-bottom: 24px;">NO GENERIC TUTORING</div>
        <h2 style="font-size: 78px; font-weight: 900; line-height: 1.08; letter-spacing: -2px; margin-bottom: 40px;">
          WE DO NOT TEACH<br /><span style="color: #dc2626;">THE CLASS.</span><br />WE SOLVE THE GAP.
        </h2>
        <div style="display: flex; gap: 20px; justify-content: center; margin-top: 50px;">
          <div class="bento-card bento-card-red" style="width: 290px; text-align: center;">
            <div style="font-size: 48px; font-weight: 900; color: #fff;">A*A*AAA</div>
            <div class="tag" style="margin-top: 8px;">FOUNDER A-LEVELS</div>
          </div>
          <div class="bento-card bento-card-red" style="width: 290px; text-align: center;">
            <div style="font-size: 48px; font-weight: 900; color: #fff;">5 OFFERS</div>
            <div class="tag" style="margin-top: 8px;">MANCHESTER · EDINBURGH</div>
          </div>
          <div class="bento-card bento-card-red" style="width: 290px; text-align: center;">
            <div style="font-size: 48px; font-weight: 900; color: #fff;">1-TO-1</div>
            <div class="tag" style="margin-top: 8px;">ZERO DELEGATION</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scene 3: The 3 Pillars Bento (9 to 23s) -->
    <div class="scene clip" id="c-s3" data-start="9" data-end="23">
      <div style="text-align: center; margin-bottom: 44px;">
        <div class="tag" style="margin-bottom: 14px;">PEDAGOGICAL ENGINE</div>
        <h3 style="font-size: 58px; font-weight: 900; letter-spacing: -1.5px;">HOW WE SECURE THE TOP GRADE</h3>
      </div>
      <div style="display: flex; flex-direction: column; gap: 24px; width: 100%;">
        <div class="bento-card" style="display: flex; align-items: center; gap: 32px;">
          <div style="font-size: 44px; font-weight: 900; color: #dc2626; font-family: 'Space Mono', monospace;">01</div>
          <div>
            <div class="tag">Bespoke Blueprint</div>
            <h4 style="font-size: 30px; font-weight: 800; margin-top: 4px;">Custom Plan Per Student</h4>
            <p style="font-size: 19px; color: #9ca3af; margin-top: 6px;">Every topic attack order is built around individual diagnostic weaknesses.</p>
          </div>
        </div>
        <div class="bento-card bento-card-red" style="display: flex; align-items: center; gap: 32px;">
          <div style="font-size: 44px; font-weight: 900; color: #fff; font-family: 'Space Mono', monospace;">02</div>
          <div>
            <div class="tag" style="color: #fff;">reMarkable 2 Screen Share</div>
            <h4 style="font-size: 30px; font-weight: 800; margin-top: 4px;">Live Derivation from First Principles</h4>
            <p style="font-size: 19px; color: #fecaca; margin-top: 6px;">No memorising answers. See the exact reasoning traced step by step.</p>
          </div>
        </div>
        <div class="bento-card" style="display: flex; align-items: center; gap: 32px;">
          <div style="font-size: 44px; font-weight: 900; color: #dc2626; font-family: 'Space Mono', monospace;">03</div>
          <div>
            <div class="tag">Transparent Rates</div>
            <h4 style="font-size: 30px; font-weight: 800; margin-top: 4px;">£29.99 A-Level · £24.99 GCSE / hr</h4>
            <p style="font-size: 19px; color: #9ca3af; margin-top: 6px;">Zero contracts. BACS monthly billing. Directly with Musa Ahmed.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Scene 4: High-Conversion CTA (23 to 30s) -->
    <div class="scene clip" id="c-s4" data-start="23" data-end="30">
      <div style="text-align: center; width: 100%;">
        <img src="assets/logo.png" style="width: 170px; margin-bottom: 24px;" />
        <div class="tag" style="margin-bottom: 20px;">LIMITED AUTUMN ENROLMENT</div>
        <h2 style="font-size: 74px; font-weight: 900; letter-spacing: -2px; margin-bottom: 24px;">RESERVE YOUR SEAT.</h2>
        <p style="font-size: 24px; color: #d4d4d8; max-width: 840px; margin: 0 auto 44px auto; line-height: 1.45;">
          Book a free 30-minute diagnostic session over Google Meet. An honest roadmap built for your target exam board.
        </p>
        <div class="bento-card bento-card-red" style="padding: 34px 50px; margin-bottom: 34px; max-width: 880px; margin-left: auto; margin-right: auto;">
          <div class="tag" style="margin-bottom: 10px;">OFFICIAL CALENDAR</div>
          <div style="font-family: 'Space Mono', monospace; font-size: 44px; font-weight: 700; color: #fff;">musaahmed.uk/academy</div>
        </div>
        <div style="display: inline-block; background: #dc2626; color: white; padding: 22px 64px; border-radius: 20px; font-size: 24px; font-weight: 800; box-shadow: 0 15px 35px rgba(220, 38, 38, 0.45);">
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
    tl.to("#c-s1", { autoAlpha: 1, duration: 0.4 }, 0)
      .from("#c-logo", { scale: 0.7, opacity: 0, duration: 0.8, ease: "back.out(1.6)" }, 0.1)
      .to("#c-s1", { autoAlpha: 0, duration: 0.4 }, 3.1);

    // S2
    tl.to("#c-s2", { autoAlpha: 1, duration: 0.4 }, 3.5)
      .from("#c-s2 h2", { y: 40, opacity: 0, duration: 0.7, ease: "power3.out" }, 3.6)
      .from("#c-s2 .bento-card", { scale: 0.85, opacity: 0, stagger: 0.15, duration: 0.6, ease: "back.out(1.3)" }, 4.2)
      .to("#c-s2", { autoAlpha: 0, duration: 0.4 }, 8.6);

    // S3
    tl.to("#c-s3", { autoAlpha: 1, duration: 0.4 }, 9.0)
      .from("#c-s3 .bento-card", { y: 45, opacity: 0, stagger: 0.2, duration: 0.7, ease: "power2.out" }, 9.2)
      .to("#c-s3", { autoAlpha: 0, duration: 0.4 }, 22.6);

    // S4
    tl.to("#c-s4", { autoAlpha: 1, duration: 0.5 }, 23.0)
      .from("#c-s4 h2", { scale: 0.9, opacity: 0, duration: 0.6 }, 23.2);

    window.__timelines["main"] = tl;
  </script>
</body>
</html>`;

writeFileSync(join(BUILD_DIR, 'index.html'), html);
console.log(`[hyperframes-creative] Creative composition generated at ${BUILD_DIR}/index.html`);

// Render with HyperFrames
const TMP_RAW = `/tmp/hf_creative_raw_${DATE}.mp4`;
console.log(`[hyperframes-creative] Rendering 30s creative video via HyperFrames...`);
const renderRes = spawnSync('npx', [
  'hyperframes', 'render', BUILD_DIR,
  '-o', TMP_RAW,
  '--low-memory-mode'
], { stdio: 'inherit' });

if (renderRes.status !== 0 || !existsSync(TMP_RAW)) {
  console.error('[hyperframes-creative] HyperFrames rendering failed.');
  process.exit(1);
}

// Mux audio bed with brag_mix.wav
console.log(`[hyperframes-creative] Muxing halal audio track (${AUDIO_FILE})...`);
const TMP_FINAL = `/tmp/hf_creative_final_${DATE}.mp4`;
execSync(`ffmpeg -y -i "${TMP_RAW}" -stream_loop -1 -i "${AUDIO_FILE}" -c:v copy -filter_complex "[1:a]afade=t=in:st=0:d=0.5,afade=t=out:st=28.5:d=1.5,volume=0.95[a]" -map 0:v:0 -map "[a]" -shortest -movflags +faststart "${TMP_FINAL}"`);

// Copy to final location
copyFileSync(TMP_FINAL, OUT_FILE);
console.log(`[hyperframes-creative] ✓ Successfully saved today's HyperFrames creative reel to ${OUT_FILE}`);
