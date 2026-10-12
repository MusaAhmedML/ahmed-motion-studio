# GAUNTLET 15 — round 1 (independent critic, no fixes attempted)

> **Dating note.** This report judges the **19 s** cut, which predates the Ahmed
> Academy reel standard rev. 1 (`README.md` §7). It is kept verbatim as the record of
> what the loop caught; the standard is what came out of the feedback rounds after it.

hook 6 · readability@360 **4** · motion **3** · variety 6 · composition 5 · brand **2** · sound sync **3**
Worst three: clip-reveal text mechanic, brand/type/glow violations, unreadable supporting layer.

## 1. Scenes

| # | Range | On screen | Empty | Lose | Ranked problems |
|---|---|---|---|---|---|
| S1 | 0–1.30 | Cream page, "RE-READING IS NOT REVISION.", READ 00/46 | 35% | 0.4s | Static 1.0s; slab serif, not Geist |
| S2 | 1.30–2.42 | Red strike-through; "Not one of them recalled." | 40% | 0.4s | Banned corner chip fades in; subject strip tiny grey |
| S3 | 2.42–3.60 | Ink, "RETRIEVAL IS." + ghost 01 | 50% | 0.3s | **2 blank frames + 1 grey-gradient glitch frame**; "RETRIEVA" clipped |
| S4 | 3.60–5.16 | "d/dx sin x", "CLOSED NOTES · 30 SECONDS" | 45% | 0.5s | "That is the whole difference." ~2.5:1 grey |
| S5 | 5.16–7.60 | "= COS X", "Blank page first. Always." | 50% | 0.6s | Callout box = banned frame border |
| S6 | 7.60–9.63 | "Then it comes back." + DAY 1/3/7/14 | 50% | 0.6s | Headline clipped to **"Then"**; cut lands in 0.70s music gap |
| S7 | 9.63–10.81 | "So the notes shrink." 48→27→8→4 | 40% | 0.3s | Counters crawl one at a time |
| S8 | 10.81–13.28 | RECALL/MARK/REPEAT, triangle path | 45% | 0.8s | 2.5s on one layout; gold line unreadable olive-on-ink |
| S9 | 13.28–16.30 | "Four returns beat forty rereads." + checklist | 40% | 0.5s | Sliding card **occludes headline and gold strip**; dead zone 15.4–16.2 |
| S10 | 16.30–17.03 | Portrait + A\*A\*AAA / Manchester · Edinburgh | 45% | 0.4s | Logo dissolves to zero, returns as 30px speck, grows |
| S11 | 17.03–19.0 | Logo, "Book the free call", bullets, URL | 45% | 0.5s | **Duplicate line**; **URL at 97.6% height**; reveal restarts 17.15 |

## 2. Clipped / spliced words
Every headline reveals by a horizontal clip leaving broken fragments for 3–5 frames: 2.20 "This is w / revis"; 2.60 "RETRIEVA"; 7.60 "Then"; 7.62 "Blank page first. Alwa"; 9.63 "So t"; 13.05 "Four cards. That is th"; 13.28 "M / Mus / Musa A"; 16.42 "answered first, mar"; 17.03 "We find the one t → costing y → costing you mark"; 17.10 "We fin"; 17.50 "Musa Ah". A mask bug, not a reveal.

## 3. Momentaneous defects
- **2.42–2.50:** two blank cream frames, then a soft grey gradient frame with no content.
- Hard cuts, no ease: **2.48** luma 211→37 in 4 frames; **13.284** 111→38 in 1 frame.
- **13.05–13.45:** card slides over "The topic you drilled:" and over the gold subject strip.
- **13.42:** dark wipe quad clips strip text.
- **16.5–16.9:** logo fades to zero, reappears as a speck, scales up.
- **16.60:** CTA pill contains a stray **"E"** and a ghosted logo watermark.
- **17.15–17.28:** end-card reveal restarts from "We find th".
- Bottom 45% empty in every frame of 17.03–17.28.

## 4. Readability
At 360px these fail (≤6px, low contrast): "answered still there nearly gone automatic", "12 MINUTES A WEEK IS ENOUGH TO START", "0 questions answered", "at A-Level", "university offers", "in tutored subjects", "THE GAP YOU FOUND TODAY IS CLOSED BY THURSDAY". Headlines and DAY 1/3/7/14 are fine. "We find the one topic costing you marks" and "If you cannot produce it…" are long enough to force the type down.

## 5. Truthfulness / clarity
Correctly used: A\*A\*AAA; Manchester · Edinburgh as "university offers"; "Straight 9s and 8s" qualified "in tutored subjects"; "Book the free call"; "tuition only if you want it"; musaahmed.uk/academy.
- **UNSUPPORTED — "you leave with a written plan."** Guaranteed deliverable, not on the approved list.
- **Over-promising:** "The topic you drilled: answered first, marks intact." implies a guaranteed exam result; "We find the one topic costing you marks" asserts diagnostic certainty a free call cannot deliver.
- **Embarrassing:** "48 pages / 0 questions answered" invents a figure about the viewer.
- On mute a first-timer *can* tell it is A-level tutoring, but the next action appears only in the last ~1.2s at 97.6% frame height — platform UI will cover it. Conversion-critical.

## 6. Audio
I −14.3 LUFS, TP −1.5 dBFS, LRA **1.5 LU**. Loudness is right and clips nothing; it never dies early. But LRA 1.5 is a wall-to-bed with no dynamic shaping, and only 3 of 10 cuts land within ±30ms. Worst: **7.600 is 0.70s after the last onset** — the film's biggest scene change lands in silence. Also 10.809 +349ms, 9.625 +295ms, 16.303 +277ms. Music cuts dead at 19.00.

## 7. Top changes
1. **Kill the clip-reveal.** Per-line fade + 12px rise, cubic-bezier(.22,1,.36,1), 40ms stagger. Kills ~14 spliced words and both glitch frames.
2. **End card:** delete the duplicated line; lift URL to y≈1560; three bullets max; no mid-card hole.
3. **Delete the top corner chip** (banned) from every frame; keep subjects on the end card.
4. **Type:** Geist display + Geist Mono only. Three families are on screen now.
5. **Flatten chrome:** supplied flat gold plate; drop the glow behind logo and button; flat #facc15, no gloss.
6. **Supporting layer** to ≥40px cap and ≥4.5:1; cut "answered still there…" and "0 questions answered".
7. **Recompose:** keep content within y=300–1620; the lower 40% is dead in six scenes.
8. **Re-cut audio** to the ten beats, open 2–3dB at 15.4–16.2, let the tail breathe past 19.0.

## 8. Verdict
**REVISE**