# Ahmed Academy — Graphic Animation Studio

**Built:** 30 September 2026 · **Overnight autonomous run**
**Goal:** beat the Opus 5.5 "Graphic Animation" hype with our own pipeline — and be reusable.

---

## 1. The thing the internet is actually doing

The viral Opus 5.5 reels are **code2video**. The model does not emit an MP4. It emits a
**program**, and something else turns the program into frames. Every "one prompt" clip is
`seek(t)` → headless browser → ffmpeg.

The distinction that matters: the prompt is ~10% of the result. **The harness is the other 90%.**
Thariq from the Claude Code team put it exactly right — *"the post says one-shot, the prompt
is 10k characters with skills, examples, keys."*

What the viral reels did **not** tell you:
- No GPU was used. Canvas 2D, not WebGL.
- No video model, no diffusion. Every pixel is vector geometry.
- Audio is **synthesised in code**, not licensed music.
- The good ones ran a **critique loop** — render stills, look at them, fix the worst three,
  repeat. Mable Joseph's 45s hand-painted film was **163 model calls over ~6¾ hours**.

So: this is not a GPU arms race. It is an **engineering** contest.

---

## 2. What we built

A deterministic render engine plus eight films, each demonstrating a different technique.

### The engine (`lib/motion.js`, `render.mjs`)

| Decision | Why it matters |
|---|---|
| `window.seek(t)` — pure function of time | Renders frame 812 without simulating 0–811. Two runs are byte-identical. A change is a one-line edit. |
| Closed-form damped springs | Cheap motion eases A→B on a fixed curve. Expensive motion has **mass** — it overshoots a hair, then settles. |
| `track()` for multi-target values | A value with several targets gets **one spring per change**, each starting at its own time. Never restart the spring. |
| Seeded `mulberry32`, never `Math.random` | Determinism is the whole contract. |
| `ctx.letterSpacing` | Native tracking in Chromium — the difference between set type and default type. |
| Layout as a **function of format** | One film renders 9:16 / 1:1 / 16:9 by re-laying out. Never crop 16:9 to vertical. |
| SFX synthesised in code | Zero licensing risk. Hits land on the measured beat grid. |

### The eight films

| # | Film | Family | Technique demonstrated |
|---|---|---|---|
| 01 | **THE HOOK** | 2D motion | Word-level kinetic assembly; each word on its own spring. Counter-counting number, ghost numerals, progress ladder. |
| 02 | **ONE SHAPE, TEN LIVES** | UI motion | **The morph loop.** One container never cuts — it changes size, radius and fill while content swaps behind a blur. Cursor drives every change. Last frame = first frame, so it loops seamlessly. |
| 03 | **DEPTH** | 2.5D composite | Multi-plane parallax + camera push + **atmospheric haze between planes** (the trick that stops parallax looking like flat cards). No raytracer. |
| 04 | **THE SYSTEM** | Illustration | Technical schematic: self-drawing dimensions, arrowheads, diagonal hatch, centre-lines, callout leaders. Precision line work. |
| 05 | **THE PAGE** | Paper / print | Generated paper fibre texture, handwriting as jittered polylines that draw on, a real fold transform in 2D canvas maths. |
| 06 | **THE PRODUCT** | UI motion | The production site's **actual** panel-glide deck (scroll-snap, 950ms cooldown, exact-fit panels). Never invent the UI. |
| 07 | **TEN** | Data / count | A single number fought for across the reel. Slots fill one per beat on the grid. |
| 08 | **THE MAP** | Data / graph | Syllabus as a constellation; a traversal lights up hop by hop to show how a grade is built. |

---

## 3. Honest notes on decisions

**The music bed is gone, deliberately.** The halal track was quarantined on 2026-09-20
(private clip) and no longer exists on disk. Your locked rule already said this: *"SFX only.
NO music bed."* We honoured the **spirit** — clean audio, nothing unlicensed — by synthesising
the score and every SFX in code. Beat-locked, loudness-normalised to −14 LUFS. This is the
one route that is legally airtight.

**The character film was cut.** We built a rigged vector tutor first. Looked at the frames.
It read as a stick figure, and a stick figure in a premium reel is worse than no figure.
Visual quality was the stated priority, so we rebuilt slot 04 as a **blueprint schematic** —
a drawing language that is genuinely achievable at studio quality. This is the honest trade:
we did not ship a weak illustration to tick a family.

**No face on screen.** You said hook first, brand last. So the reel opens on a claim and the
logo only ever appears in the final beat. Musa's headshots exist in Drive; the face belongs on
a later, trust-led piece where it is the whole point.

---

## 4. What beat Opus 5.5, and what didn't

**Where we win:**
1. **Reusability.** Swap text, ship a new reel. Our films are data, not one-off renders.
2. **Three formats from one timeline.** A layout *function*, not fixed pixels.
3. **Determinism.** Same input → same bytes. A re-render is never a gamble.
4. **Zero spend.** No API keys, no rented GPU, no stock music, no diffusion credits.
5. **The critique loop is built in**, not optional. `node render.mjs --film X --stills 0,1,3`
   renders frames without paying for the video. Every film in this set went through it.

**Where they still win:** an 8,700-line Remotion Steve Jobs film with 23 transitions is a
different league of ambition. We did not attempt to out-volume a 12-hour run. We won on
**craft density per second** and on **cost per reel** — which is the metric that decides
whether you can post daily for a year.

---

## 5. How to run it

```bash
cd ~/ahmed-motion-studio
node serve.mjs 8171 &                     # ES modules need a real origin

./build.sh 9x16                            # render every film
./build.sh 16x9                            # same films, re-laid out for wide
node render.mjs --film 02-uimorph --fmt 1x1 --dur 9   # square
node render.mjs --film 01-kinetic --stills 0,2,4,6     # critique loop, no video cost
node sfx.mjs films/01-kinetic.js out/audio/x.wav 38     # regenerate the cue sheet
```

New film = one file in `films/`, one entry in `index.html`, one line in `build.sh`.

---

## 6. The house rules that made the difference

- Banned: centred title on a gradient, everything fading in, corner labels, frame borders,
  glow on UI chrome, generic particle bursts.
- Every 2–4 seconds, something new happens on screen.
- One display face, one UI face, one accent colour.
- Nothing slides — it eases. Overshoot on UI, none on type.
- Score frames 1–10 on: hook in first 2s · readability at 360px · motion quality · variety ·
  composition · brand accuracy · sound sync. Fix the worst three. Repeat until all 8+.

---
---

## 7. Standard: the Ahmed Academy reel standard (rev. 1)

**This is _a_ standard, not _the_ standard.** It is the approach film 05 (`15-recall`)
landed on after four rounds of creative feedback, written down so the next reel can start
from it instead of from nothing. Nothing here is a law of vertical video. The studio keeps
other standards alive — listed below — and a reel is free to ignore this one entirely, as
long as ignoring it is a decision rather than an accident.

Adopt it per reel when it fits the idea. Where you deviate, write the reason into that
reel's ledger. That is the whole contract.

### The rules this standard holds to

| | Rule | Why |
|---|---|---|
| 1 | **The film is a program, not a recording.** A pure function of `t`. | Renders out of order, byte-identical twice, edits are one line. |
| 2 | **Judge pixels, never intentions.** Stills → a critic with no access to the reasoning → fix the worst three. | The prompt is ~10% of the result; the harness is the other 90%. |
| 3 | **Brand is supplied, never approximated.** Real logo plate, real headshot, real palette tokens. | A lookalike plate reads as fake at 360px. |
| 4 | **Motion eases; nothing slides; no zoom.** Drift, light sweep, spring, looping actor motion. | A per-shot camera push reads as amateur on a phone. Overshoot on UI, none on type. |
| 5 | **Tempo is authored per shot, as a gradient.** A pacing curve (`SLOW_OPEN → SLOW_TAIL`, released at a chosen time) so the opening carries and the tail lands. | One global speed cannot do both. |
| 6 | **Transitions live on absolute time; content reveals scale with shot tempo.** | Two clocks in one file, deliberately separated. Conflating them makes cuts land early or late. |
| 7 | **Audio starts on frame 1.** Bed cut from `0.0s`, accents cued to land on the cut, measured to −14 LUFS. | A silent head loses the first two seconds. |
| 8 | **Type is the subject.** Readability checked at 360px, shrink-to-fit, never overflow. | Watched at arm's length, muted, by someone scrolling. |
| 9 | **One pre-approved claim.** Only wording already cleared for use. | No invented numbers, ratings or testimonials, ever. |
| 10 | **Measure the thing that matters.** Max-pixel-delta, not mean luma delta, for held-ground graphic motion. | A frame that is 99% flat ink averages near-zero delta while every visible element breathes. |

### Standards this one does not replace

- **SFX-only, no music bed** — the studio's original locked rule (see §3). Still available
  and still the right call for some cuts.
- **Faceless reels** — the face is reserved for trust-led pieces where it is the whole point.
- **The Remotion / daily-reel templates** — shonen pacing, talking head, screen shake. A
  different engine, a different standard, fully legitimate. Documented in `MUSAAHMED.md` §4.
- **Anything shot, drawn or animated by hand** — this standard is about generated motion.

### Failure modes this standard exists to prevent

- **Cut constants that silently disagree.** `CREAM_END` once pointed one shot early, so that
  shot's exit fade fired at its own start and held the whole shot at zero alpha — 3.1 seconds
  of near-empty reel that measured as "correct". Assert cut constants against each other.
- **One clock used for two jobs.** Shot-relative scaling applied to an absolute-time
  transition window. Keep the two helpers separate and name them for which one they are.
- **A filled CTA with no label.** The fill and the label must share a reveal.
- **Trusting a thumbnail.** A legible label can look absent at 290px wide. Verify full-res
  before "fixing" something that is not broken.

---

## 8. Standard: the Ahmed Academy reel structure standard (rev. 1)

**This is _a_ standard, not _the_ standard.** §7 governs **how** a reel is made — craft.
This one governs **what shape it takes** — structure. They are orthogonal: adopt either,
both, or neither. A reel is free to ignore this one entirely, as long as ignoring it is a
decision rather than an accident. Where you deviate, write the reason into that reel's
ledger.

It is the shape of the films that were actually liked: **hook → business → picture + a way
to reach him.**

### The skeleton

| Beat | `16-guess` — the default template (18.1s, 9:16) | `15-brag` — 5-beat variant (20.0s) |
|---|---|---|
| **Hook** | `DIAGNOSIS` 0.0–5.0s — "Most tuition starts with a guess." recedes → "We start with a **diagnosis**." lands | `hook` 0.0–2.6s |
| **Business** | `WHO` 4.7–9.1s — `AHMED ACADEMY`, crimson rule, `DIAGNOSTIC-LED TEACHING`, `FROM AN A*A*AAA STUDENT` | `brand` 2.4–4.6s · `method` 4.4–9.6s · `offer` 9.4–14.6s |
| **Picture + reach** | `BOOK` 8.9–18.1s — headshot, logo, "Book a free diagnostic", `musaahmed.uk/academy`, "or see the bio" | `cta` 14.3–20.0s — headshot, `musa@musaahmed.uk`, `musaahmed.uk` |

### The rules

1. **Hook is the first thing on screen.** No card, logo or claim in front of it.
2. **One appearance of the claim, not two.** The setup line survives only so the handoff
   has something to hand off *from*.
3. **The business is named before the ask.**
4. **The face lives in the CTA, not the opening** — it is the trust anchor at the moment
   of the ask, and leading with it fights the hook.
5. **The ask is concrete** — a real URL and/or a real email, held to the final frame, no
   outro fade.
6. **Beats overlap ~8 frames**, so no empty frame ever ships.
7. **Structure is data.** Copy the `BEAT` table and the beat bodies over `lib/brag-engine.js`;
   never redraw the stage. `daily_reel.mjs` swaps only the hook copy, so one film file
   yields a different reel each day, deterministically.

### What this does not replace

- **§7's craft standard** — orthogonal, not a prerequisite.
- **SFX-only, no music bed** — §3. Still available, still right for some cuts.
- **Faceless reels** — the face is reserved for trust-led pieces where it is the whole point.
- **The Remotion / daily-reel templates** — shonen pacing, talking head, screen shake.
  A different engine, a different standard, fully legitimate.
- **Single-actor films** that run eleven compositions instead of three (`15-recall`).
- **Anything shot, drawn or animated by hand.**

Fuller statement, with the cross-references, in `MUSAAHMED.md` §4.5.
