# GAUNTLET 15 — round 2 (independent critic, no fixes attempted)

> **Dating note.** This report judges the **19 s** cut, which predates the Ahmed
> Academy reel standard rev. 1 (`README.md` §7). It is kept verbatim as the record of
> what the loop caught; the standard is what came out of the feedback rounds after it.

hook 7 · readability@360 5 · motion 6 · variety 6 · composition 5 · brand 7 · sound sync 4

## 1. Claimed fixes

| # | Verdict | Evidence |
|---|---|---|
| 1 Vertical mask | **PARTLY** | Vertical slicing gone, but the bottom-anchored mask now slices **horizontally**: "IS." 2.68, "One pass. Three steps." 5.24–5.27, "Then it comes back." 7.717–7.75, "So the notes shrink." 9.71–9.77, "answered first." 12.20–12.25, "Musa Ahmed" 13.40–13.43, bullet 2 16.60. Same defect, new axis, 7 sites. |
| 2 End card | **PARTLY** | No duplicate; URL measured 85.8–87.7% (was 97.6%). But the card **rebuilds itself at the 16.303 cut**: sub-line + all three bullets vanish 16.32–16.50 (d3), button label gone 16.32–16.58, sub-line returns 16.88, URL only at 17.55. Label is on 15.8–16.30 then 16.58–end = 3.1s total. |
| 3 Chrome | **FIXED** | No corner chip 0–19s. Button samples flat #f8ca14 at every row (247.6/202.4/20.0), zero gradient/gloss. Logo region shows no halo. |
| 4 Type | **PARTLY** | Two families now; mono is genuinely monospaced (even advance on the release strip). Display face is still **not Geist** — it is a Poppins-class geometric. |
| 5 Supporting layer | **PARTLY** | "answered still there" + "automatic" split works. But **"same hours · nothing to show for it" (2.10) measures 190–220 on a 218 cream page ≈1.1:1** — invisible at any width. "THE GAP YOU FOUND TODAY…" (9.20) still dim gold. |
| 6 Copy | **FIXED** | "A whole chapter." at 1.60; "answered first." at 12.30. |
| 7 Fly-throughs | **STILL PRESENT** | 2.45 is a muddy grey gradient frame, pale washed "RETRIEVAL", no content. 5.173 luma 81.5→30.4 in one frame; 7.617 empty except a grey box; 10.70 a solid grey blank; **13.301 luma 108→22.6 in one frame = a full-frame blank**, portrait then enters as a ~15px speck at 13.334. |
| 8 Camera push | **FIXED** | RECALL card 132→136px over 6.2–7.4 (+3.0%). Measurable, no held shot. |
| 9 Logo at 16.3 | **FIXED** | No luma delta >6 anywhere near 16.303; logo present throughout. |
| 10 Audio | **PARTLY** | I −14.3 LUFS, TP −1.1 dBFS, LRA 1.6 — all confirmed. 3.600 is a clean +9 dB transient within 5 ms. 7.600 still **+150 ms** (rms dips −25.3 at 7.600, peaks −2.7 at 7.785). 1.300 has **no transient** (−16.3 vs −18.1). 1/10 cuts within ±30 ms. Tail dies: 18.60 −27 → 18.99 −61.8 dBFS. |

## 2. New defects
- **13.301 blank frame + portrait speck** (was the 16.5 logo speck). Worst single frame in the film.
- **12.90**: cream card still occludes "The topic you drilled:" (reads "Th…illed:") and "answered first."; orphaned pale block sits on the Q1 vectors row 12.9–13.28.
- **14.6–15.4**: unlabelled gold pill (logo only) **on top of** "Manchester · Edinburgh / university offers".
- **0.40**: "READ 09 / 46" collides with "THE ONE LINE THAT MATTERS".
- Sub-line and bullet 1 are near-identical sentences, 90px apart, 16.3–19.0.

## 3. Claims
"you leave with a written plan" **still on screen 16.3–19.0** — was never on the fix list. "We find the one topic costing you marks" still asserts diagnostic certainty a free call cannot deliver. 48-pages and marks-intact are genuinely handled.

## 4. Highest-value change
Delete the mask. Per-line alpha fade + 12px rise, no clip region — removes 7 sliced headlines in one edit.

## 5. Scores
hook 6→7 · readability 4→5 · motion 3→6 · variety 6→6 · composition 5→5 · brand 2→7 · sound sync 3→4

## 6. Verdict
ONE MORE PASS — remove the reveal mask; make the end card render once and never re-animate after 16.30; delete the blank frame at 13.301.