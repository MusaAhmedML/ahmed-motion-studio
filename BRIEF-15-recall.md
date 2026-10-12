# BRIEF — Film 15 `15-recall` · "Re-reading is not revision"

> **Built to the Ahmed Academy reel standard, rev. 1.** That is *a* standard in this
> studio's repertoire — not the only one, and not a law of the internet. See
> `README.md` §7 for the rules and for the standards it deliberately leaves alive.

> **Timing note.** The tables below are the **19.0 s** cut as briefed. The shipped
> version is **38.4 s** after four rounds of feedback: the opening-half pacing gradient
> (`SLOW_OPEN 3.60 → SLOW_TAIL 2.30`) and a bed cut from `0.0s` rather than a 19 s
> window. Story, shot order, copy and claims are unchanged; only tempo and duration moved.
> Current measurements are in `GAUNTLET-15-LEDGER.md`.

Produced with the **business-motion-film** playbook (`echris6/motion-video-kit`) +
the **daily-video-idea** randomisation rules. This is the studio's fifth student
reel and the first one that is **diagram-led** rather than card-led.

---

## 1. Business

- **Business:** Ahmed Academy — one-to-one tutoring, GCSE (Maths, English, Science,
  CS) and A-Level (Maths, Physics, CS).
- **Buyer:** the student, 15–18, on a phone, mid-revision, phone in hand, sound
  usually off.
- **Viewer problem:** they re-read notes, recognise everything, and still lose marks
  in the exam. Revision volume is not the problem; retrieval is.
- **Single action:** book the **free onboarding call** (no cost, no commitment).
- **Truth — every string below is pre-approved in `lib/student-reel.js` `PROOF`:**
  A\*A\*AAA at A-Level · Manchester & Edinburgh university offers · straight 9s and
  8s in tutored subjects · free onboarding call · musaahmed.uk/academy.
  Musa's own headshot (`assets/face.jpg`) and gold logo (`assets/logo_gold.png`) are
  real, approved assets.
- **Must never be claimed:** invented testimonials, invented ratings, invented mark
  improvements, invented class sizes, invented student names, invented offer
  universities. **This film is a real client film, not a concept film** — so no
  "concept / AI-generated" label is needed and none may be implied.
- **Brand:** gold `#facc15` primary on bone `#f7f4ec` / ink `#0b1120`, cyan `#38bdf8`
  and emerald `#34d399` as data accents only. Type: Geist display, Geist Mono for
  labels. Tracking is set, never default.

## 2. Format

19.0 s · 1080×1920 · 60 fps · H.264 + AAC 48 kHz · −14 LUFS.
Reuse of the measured grid in `lib/beatgrid.js` (**140.625 BPM, beat = 0.4267 s**):
the bed is the same 19 s window used by reels 11–14, so every cut lands on a real
measured onset — `T2 = 6.82`, `T3 = 13.284`.

## 3. What this reel must do differently from reels 11–14

Reels 11–14 shared one template: a portrait top-plate, a karaoke question, three
glass cards, proof rows, CTA. This reel changes **three** things:

| Axis | Reels 11–14 | Film 15 |
|---|---|---|
| Hook style | Controversial question | **Methodology spotlight** — a claim about method, demonstrated |
| Structure | Heading + three cards (repeated 4×) | **Travelling-actor diagram**: one card is carried through 5 shots and physically becomes each idea |
| Subject | Generic | A-Level **Maths / Physics / CS**, with one real worked item (`d/dx sin x = cos x`) |

## 4. Randomised parameters (daily-video-idea)

| Parameter | Choice |
|---|---|
| Hook style | Methodology Spotlight — "the loop, shown" |
| Layout style | Travelling-actor diagram (Split-Hero cousin; the set's 11–14 already used the card stack) |
| Subject focus | A-Level Mathematics (derivatives) — instance of the universal method |
| Nasheed vibe | **Energetic / Rhythmic** — 140.625 BPM bed, cuts on onsets |

## 5. The business test (must pass on mute, first-time viewer)

By 19.0 s a first-time viewer must be able to say:
1. **What it is:** tutoring that fixes exam technique (free call → diagnosis → plan).
2. **What to do:** book the free call, `musaahmed.uk/academy`.
3. **Who it's for:** GCSE/A-Level maths, physics, CS.

## 6. Non-negotiables inherited from the studio

Deterministic `seek(t)` (no `requestAnimationFrame`, no `Math.random`, no
`Date.now`), layout as a function of format, SFX-free music bed only
(`audio/bed19.wav`, the established rule for this set), and the critique loop:
stills first, independent critic, fix the worst three, re-render.

## 7. Definition of done

- 13 distinct compositions in 19 s; no motionless stretch > 0.6 s except the end card.
- Hero type ≥ 180 px at 1080 wide; readable at 360 px.
- Lead subject fills 60–85 % of the usable frame in feature beats.
- `scripts/frozen-time.sh`: ≤ ~1 s of near-frozen per 19 s, no single hold > 0.6 s
  before the CTA.
- `scripts/loudness.sh`: −14 LUFS integrated, true peak ≤ −1 dBFS.
- Independent critic verdict KEEP on full film, plus a verification pass.
