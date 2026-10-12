# GAUNTLET LEDGER — `15-recall` (Ahmed Academy, reel 5)

Playbook: `echris6/motion-video-kit` → **business-motion-film**.
Every round was judged by an agent that had never seen the builder's reasoning and
could only look at rendered pixels and measurements.

## Round table

| Round | Artifact | Critic's top findings | Changes made | Measured after |
|---|---|---|---|---|
| **Build** (builder self-review, 3 passes) | 49 stills | Sheets and logos rendering at **4 % alpha** (`p = 0.001` fed through a spring instead of the "already present" convention); CTA label drawn below its own button; empty cream card for 0.7 s; 12 lines overflowing the measure | `ease()` exact-match convention; label baseline centred on the capsule; card content arrives with the card | — |
| **Build** (self-review, stills 4–7) | 49 stills | **`fitText` regex mis-parses fractional px** (`/(\d+)px/` matches `44px` inside `37.44px`), so shrink-to-fit silently failed on most lines; pile of paper invisible on cream; badge/counter colliding; duplicated wordmark (the supplied plate already carries it); counter rendering 12 overlapping ghosts | `fitText`/`font_px`/`block` regex fixed **in `lib/brand.js`**; sheet `tint` for the pile; shared `lockup()`; one real counting number | — |
| **Round 1** (independent critic) | 19 s MP4 | **REVISE** — hook 6, readability@360 **4**, motion **3**, variety 6, composition 5, brand **2**, sound sync **3**. 12+ headlines revealed by a horizontal clip left broken mid-word fragments; end card printed a line twice and put the URL at 97.6 % frame height under platform UI; banned corner chip, radial glow, glossy gradient button; 360 px failures on the mono layer; blank/grey frames at 2.42–2.50; 1-frame luma jump at 13.284; logo vanishing then returning as a speck at 16.3; cuts at 1.300/3.600/7.600 landing in musical gaps | Clip reveal replaced with a rise; corner chip deleted; callout **box** → rule + text; logo glow, button gradient and gloss removed (flat `#facc15`); mono layer enlarged and lifted in contrast; handle moved to ~87 %; CTA now completes inside S9 and holds ~2.9 s; both fly-throughs made to **cover the frame before fading**; logo no longer re-animates at the 16.3 cut; per-shot 4 % camera push; SFX accents cued at the three off-grid cuts | frozen time **5.4 s → 0.5 s**; loudness −14.3 LUFS; TP −1.1 dBFS |
| **Round 2** (verification critic) | new render | **ONE MORE PASS** — hook 7, readability 5, motion **6**, variety 6, composition 5, brand **7**, sound sync 4. Fix 3 verified flat gold numerically. Remaining: the mask had only changed axis (horizontal slicing → vertical slicing, 7 sites); full-frame **blank at 13.301** (scaling a card covers width long before height) with the portrait re-entering as a 15 px speck; the end card **rebuilt itself at 16.303** (sub-line and bullets vanished, label blanked); "same hours…" measured **1.1 : 1** on cream; the sub-line and bullet 1 were near-identical sentences 90 px apart; accent at 7.600 read 150 ms late, 1.300 had none; tail collapsed 35 dB | **Mask deleted** — alpha + rise only, which is what the critic's own top recommendation was; fly-through forced to cover **both** axes before the cut and given ruled lines so it is a page passing camera, never a blank field; portrait crossfades at full size (no spring-from-zero); S9 staging compressed so nothing is behind the button; S10 and S11 render the offer block already standing; sub-line → "Free. No cost, no commitment."; three contrast failures raised; accents cued **early** so the envelope peak lands on the cut; bed re-cut so the fade falls outside the 19 s | frozen time **0.1 s**; loudness **−14.2 LUFS**; TP **−1.7 dBFS**; LRA 1.5 LU |
| **User revision** (4 rounds of creative feedback) | 38.4 s MP4 | User rejected the cut on feel, not compliance: too fast; the music only entered at 25.5 s; the per-shot camera push read as a zoom; the gold/cyan palette and gold plate were not the brand. Then: *"slow the beginning half more — if it makes the reel longer, no problem"*. | Global pacing gradient `SLOW_OPEN 3.60 → SLOW_TAIL 2.30` releasing across `REL_A 18.0 → REL_B 19.0`, so the first five shots run ~1.6x long and the reel tail keeps its original tempo; bed re-cut from **0.0 s** so audio runs under frame 1; camera push deleted (looping actor motion + light sweep only); palette → obsidian `#0a0a0c` / crimson `#dc2626`; real transparent plate `brand_logo.png` and the new headshot; flat crimson CTA. Two motion bugs fixed on the way: `inv()` was stretching the absolute-time fly-through windows by `SLOW` (added a linear `lin()` for absolute-time reveals), and **`CREAM_END` was pointed at `S1` instead of `S2`**, so shot 2's exit fade fired at its own start and zeroed the whole shot for 3.1 s — an almost entirely blank middle of the reel | duration **19 s → 38.4 s**; loudness **−14.1 LUFS**; TP **−1.6 dBFS**; LRA 3.9 LU; **0** static frame pairs |

## Shipped measurements — 19 s cut (superseded)

| Check | Target | Result |
|---|---|---|
| Frozen time | ≤ ~1 s per 19 s | **0.1 s** (one sample, in the end-card hold) |
| Integrated loudness | −14 LUFS | **−14.2 LUFS** |
| True peak | ≤ −1 dBFS | **−1.7 dBFS** |
| Loudness range | 1.5–3 LU for this score | **1.5 LU**, short-term −13.1 → −16.5 |
| Composition count | 12–15 per 30 s | **11 in 19 s**, 11 distinct composition types |
| Determinism | pure function of `t` | no timers, no unseeded randomness |

## Shipped measurements — 38.4 s revision (current)

| Check | Target | Result |
|---|---|---|
| Duration | user's call; longer accepted | **38.400 s** (2304 frames @ 60 fps) |
| Format | 1080×1920 vertical | **1080×1920**, H.264 + AAC 48 kHz stereo, 22.5 MB |
| Frozen time | no static frames | **0** frame pairs at ≤ 1/255 max-pixel-delta; worst pair **17** |
| Integrated loudness | −14 LUFS | **−14.1 LUFS** |
| True peak | ≤ −1 dBFS | **−1.6 dBFS** |
| Loudness range | 1.5–3 LU for this score | **3.9 LU**, short-term −11.7 → −19.1 |
| Audio entry | under frame 1 | bed cut from **0.0 s**, no silent head |
| Pacing | opening slower than the tail | `SLOW` 3.60 for t < 18.0, 2.30 after t ≥ 19.0 |
| Composition count | 12–15 per 30 s | **11 shots in 38.4 s**, 11 distinct composition types |
| Camera moves | no zoom | none — per-shot push deleted; drift, sweep and spring only |
| Determinism | pure function of `t` | no timers, no unseeded randomness |

### Note on the kit's frozen-time metric

`scripts/frozen-time.sh` reports **143 near-frozen samples (≈14.3 s)** on this cut. That is
the mean-delta artefact it is known for: a 1080×1920 frame that is 99 % flat ink averages a
near-zero delta even when every visible element is breathing. The max-pixel-delta (YMAX)
test on the same pairs returns **0** static frames and a floor of **17/255**, so the hold is
real motion, not a freeze. Verified by eye at the three longest holds (14.0–17.0 s card
breath, 35.0–38.4 s end card, 24.9–25.8 s paper stack).

## What this build established

The four feedback rounds below produced the **Ahmed Academy reel standard, rev. 1** —
recorded in `README.md` §7. To be precise about its status: it is **a** standard, one
option among several the studio keeps open, not _the_ standard for vertical video. What it
earned here is evidence, not authority — the pacing gradient, the absolute-time/shot-time
clock split, the `CREAM_END` boundary bug and the flat-ink measurement artefact are all
recorded above because they are the parts a later reel would otherwise repeat.

`README.md` §7 also lists what this standard explicitly does **not** replace: SFX-only
cuts, faceless reels, the Remotion templates in `MUSAAHMED.md` §4, and hand-made animation.

## Findings I did not accept, with evidence

- **"Three type families, display face is a Poppins-class geometric."** Measured in
  Chromium: `"Geist Mono"` returns exactly the same advance as `"Geist"` for `iiiiiiiiii`
  and `WWWWWWWWWW`, so the studio's UI face was never loading and every mono label was
  proportional. That was a real defect (now fixed: `F.mono` leads with a family that
  measures 0.60 em/char). The display face resolves as Geist — 800 gives a wider advance
  than 500, and both differ from `system-ui` and from the mono fallback. "Poppins-class"
  is a misidentification; the serif wordmark the critic saw is inside the **supplied**
  logo plate and cannot be changed.
- **"you leave with a written plan" is unsupported.** It is the pre-approved wording
  already shipped in reels 11–14 (`lib/student-reel.js`). Keeping the set consistent
  mattered more than the critic's objection, but it is recorded here as an open question
  for the brand owner.
- **"answered first, marks intact"** was over-promising and **was** removed → "answered first."
- **"48 pages / 0 questions answered"** invented a statistic about the viewer and **was**
  removed → "A whole chapter." / "not one question answered".

## Shared-code fixes found by this build (affect every film)

1. `lib/brand.js` — `fitText` and `block` regex could not parse fractional px sizes, so
   shrink-to-fit overflowed the measure on most lines.
2. `lib/brand.js` — `F.mono` named a family Chromium cannot resolve; all "monospace"
   labels in the studio were rendering as body sans.
3. `sfx.mjs` — `if (v === 0) break;` killed any voice whose envelope starts at zero, so
   every **whoosh, pop, riser and swell** cue rendered silent. Measured after the fix:
   accents at −1.7 / −3.7 / −2.1 dBFS on the three cuts.
4. `render.mjs` — the mux pass used single-pass `loudnorm` with no limiter and measured
   **+0.1 dBFS true peak**. Now `loudnorm,alimiter=limit=0.763:attack=0.5`; a 5 ms attack
   let transients through, 0.5 ms holds.

## Reproduce

```bash
cd ~/ahmed-motion-studio
node serve.mjs 8171 &                                   # already running
node sfx.mjs films/15-recall.js out/audio/15-recall.wav 38.4
ffmpeg -y -ss 0.0 -i audio/halal.mp3 -t 38.4 \
  -af "afade=t=in:st=0:d=0.35,loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 -ac 2 /tmp/bed38long.wav
ffmpeg -y -i /tmp/bed38long.wav -t 38.4 -ar 48000 -ac 2 audio/bed15.wav
ffmpeg -y -i audio/bed15.wav -i out/audio/15-recall.wav \
  -filter_complex "[0:a]volume=0.74[a];[1:a]volume=0.52[s]; \
  [a][s]amix=inputs=2:duration=first:normalize=0[m]; \
  [m]loudnorm=I=-13.8:TP=-2:LRA=11,alimiter=limit=0.794:level=false[out]" \
  -map "[out]" -ar 48000 -ac 2 audio/bed15-recall.wav
node render.mjs --film 15-recall --fmt 9x16 --dur 38.4 --sub 1 --crf 16 \
  --out out/15-recall__9x16.mp4 --audio audio/bed15-recall.wav
```

## Honest limits

- The frozen-time threshold (0.35 mean luma delta) was calibrated on camera-motion films.
  This one is graphic-motion — type and diagrams on a held ground — so the script reports
  **143 near-frozen samples (≈14.3 s)** that the YMAX test proves are live motion
  (**0** static pairs, floor **17/255**). Treat that script's number on this film as noise.
- Nobody listened to the mix. Loudness, true peak and LRA are measured; whether the
  nasheed bed suits the edit is a judgement I could not make. A music-only fallback is
  `audio/bed15.wav`.
- 9:16 is the master. The layout is a function of format and 1:1 renders without error,
  but the vertical offsets below 1080 px fall outside a square frame — same as reels
  11–14. A square cut needs its own offsets.
