# buck — the $1 note — round 0

Judge, 2026-08-14, gates and hashes frozen at commit `c0ff971`. (The concurrent dime judge committed `fe55fa0` and `255b908` mid-round and swept this round's instruments into them; `src/art/coins.js` is byte-identical across all three, sha256 `565d70716e42`, so every value below is attributable to one subject state. This judge committed nothing.) Gates frozen and hashed **before** the
first measurement (`buck-gates.md`, sha256 `1427060e1e83`). A second judge ran
on the dime in the same session; both read-only on `src/art/coins.js`. No art
was changed. 20 of 20 frozen artefacts byte-identical at the end of the round;
`git status` shows no modified tracked file; `tests/coins.spec.js` +
`tests/pawcoins.spec.js` 18 passed.

**Scorecard verdict: FAIL.** 8 PASS, 16 FAIL, 3 UNMEASURED, 3 N/A, 2 ESCALATE.

The one-sentence version: **everything about the note that is a *quantity*
passes, and everything that is a *position* fails.** Containment,
well-formedness, tier behaviour, curve quality on the one fitted contour, and
discriminability all pass cleanly. The portrait is 16 units from where it
belongs, both seal roundels are 1.80× too wide and 26% too close together, and
at the tier the app draws a teaching card the note is half as inky as a real
one.

---

## 1. The rubric on a rectangle — which rows transfer, which need restating,
## which are genuinely N/A

This is a deliverable in its own right: D1–D13 have only ever been exercised
on discs, and four of the thirteen name disc-only machinery.

### Transfers unchanged — 8 of 13

**D3, D4, D6, D7, D9, D10, D11, D12.** Nothing in any of them is circular.
D6 is about width variation along a mark, D7 about knot turn, D9 about string
hygiene, D10 about size, D11 about pixels, D12 about eyes. D4's "repeated
element" needed a subject to be *found* on this design, not a new metric — the
pyramid's courses on the reverse and the corner numerals on the obverse.

### Restated — 5 of 13

| row | what changed and why |
|---|---|
| **D1** | "obverse silhouette" is the obverse's *principal device*. On a note that is the **portrait vignette**, and it is registered by a homography, not by a disc fit. |
| **D2** | **Split in two** (§18.4) and restated. The device is embedded in ornament with **no bare field**, so no contour is traceable; the available silhouette is the seal's **rim**, found by a curve-following score. Two rows fall out that a disc never needs: **D2c separation** and **D2d shape**. |
| **D5** | There is no band **radius**. PY2's two extremes, in Cartesian: cap-top Y and baseline Y in viewBox units, plus the X extent. |
| **D8** | **There is no field circle.** The analogous constraint is the **printed border rectangle** — the note's own outermost engraved element and the fiducial §18.1 registers on. Frozen as literals `X∈[5,95] Y∈[5,51]`, so a future round that moves `noteSVG`'s frame does not move the locus with it. A second, tighter locus was added: **each device against its own roundel**, because `struck()`'s own comment says `rField` is *"omitted where there is no field circle to respect (the $1 note)"*. |
| **D13** | **"Field" is not a place on a note.** A note is engraved edge to edge; there is no bare region anywhere. Field is frozen as a **statistic**: the p90 grey inside a frozen window — the lightest tenth of the device's own neighbourhood, which on the photograph is paper showing between engraved lines and in our art is `PALETTE.buck.field`/`.body`. |

### Genuinely N/A — 3 rows, each argued

- **D1/reverse** and **D2/obverse.** Each metric names one side (§3). The
  rows are kept, not omitted.
- **D7/reverse.** §3's D7 row says *fitted contours only*. Every path on the
  note's reverse is authored by hand in absolute viewBox coordinates — two
  triangles, six arcs, six axis-aligned cuts. The metric has no subject.
  Scored whole anyway as evidence: **42 of 48 knots over 75°, worst 145.1°**
  (176.9° at icon), and every one of them is a corner the design declares by
  construction. That is P1/P2's degenerate-metric case exactly: literally
  true, completely uninformative, cannot rank, so cannot route.

### What a rectangle ADDS that the rubric has no row for

1. **Anisotropy.** A disc has one scale. A rectangle has two, and ours
   deliberately do not match the note's (31 CFR 411 non-copy). Every circle on
   the note **must** be drawn as an ellipse 1.3145× taller than wide here. No
   rubric row asks whether a shape's aspect matches its target's — D2d had to
   be invented, and it fails by 23.9%.
2. **Two devices on one side.** §18.4 already says score them separately; the
   rubric's one-row-per-side shape fights it. D2 and D13 both had to split.
3. **No field.** Every dimension that assumes a bare region against which a
   device stands degrades here, and this round watched **180 detector settings
   return their own search bound** because of it (§4 below).

---

## 2. Registration — §18.1 confirmed, and one photograph is a non-answer

Reproduced `bill.md`'s numbers exactly, then added the checks it predates.

```
file            px w x h    | BORDER  PAPER   b-vs-p% | max|d-90| skew | p95 t/b/l/r | ink .72->.62
bill-obv.jpg     1216x519   | 2.4607 2.4540    -0.3 |   0.00  0.00/0.00 | 0.0 0.0 0.0 0.0 | 0.00%
bill-obv-2.jpg   3840x1673  | 2.4186 2.3145    -4.3 |   0.15  0.12/0.23 | 0.8 0.5 0.0 0.5 | 0.03%
bill-rev.jpg     1225x523   | 2.5610 2.4239    -5.4 |   0.07  0.00/0.33 | 0.5 0.0 0.0 0.0 | 0.00%
bill-rev-2.jpg   3840x1707  | 2.5827 2.3313    -9.7 |   0.19  0.00/0.65 | 0.7 0.6 0.0 0.0 | 0.04%
```

- **R0b reverse: 0.84% apart — PASS.** §18.1 holds at 4–5× the repeatability
  of the paper edge (0.84% against the paper's 4.0%), independently confirmed.
- **R0b obverse: 1.72% apart — FAIL**, and the diagnosis is sharper than
  `bill.md`'s. It is not two honest fits of a weak fiducial. **`bill-obv.jpg`
  is a degenerate answer**: its "border" and its paper box are the same
  rectangle to 0.3%, all four line fits return p95 = **0.0 px**, all four
  corners are **exactly 90.00°**, and moving the ink threshold by 14% moves
  the answer by **0.00%**. A perfectly straight, perfectly axis-aligned,
  zero-residual "engraved rule" is what a crop edge looks like.
- **I drew both quads on their own sources and looked**
  (`_jb1-fit.png`, generator `_jb1over.mjs`, with a 6× corner zoom). Both
  obverse quads sit **on blank paper** — inboard of the scrollwork, outboard
  of nothing. Neither obverse fit found a printed feature at all. The
  reverse quads sit on the printed rule.
- **R0e independence: PASS.** NCC 0.2895 (obverse pair) and 0.4626 (reverse
  pair) against controls of −0.0221 and 0.0877; four fitted border ratios all
  distinct to ten decimal places; pixel dimensions all different. And I can
  read the serials, districts and plate checks in the overlay:
  B‑03542754‑F/2009/New York and L‑11180916‑G/2003A/San Francisco, plate 56
  and plate 57. Four notes, verified rather than assumed for a seventh time.

**R1 — the source comment.** `noteSVG()` says *"the aspect ratio is 1.79:1
against a real note's 2.61:1"*. Re-derived: printed border **2.5718**, paper
edge 2.3145/2.3313, true paper 6.14/2.61 = **2.3525**, our outer box 1.7857,
our inner frame 1.9565. **2.61 is the note's height in inches.** Right by
accident (the border it is an analogue of measures 2.572, 1.4% away), wrong by
construction. Recorded as a documentation defect, not repairable art.

---

## 3. The two reverse devices, scored separately (§18.4)

`_blellipse.mjs`'s sixteen published numbers reproduced **bit-for-bit** by an
independent re-implementation (PY6), with the four checks that file predates
added: null test, selection set, PY5 degeneracy fraction.

```
                 cx      cy      rx      ry    ry/rx   ink   mean/field
photograph, PYRAMID
  bill-rev.jpg    23.00   27.75   8.75   11.25  1.286  0.502   0.7016
  bill-rev-2.jpg  23.25   28.00   9.00   11.50  1.278  0.484   0.7130
  mean            23.13   27.88   8.88   11.38  1.282
photograph, EAGLE
  bill-rev.jpg    77.25   27.75   9.50   12.75  1.342  0.714   0.6302
  bill-rev-2.jpg  76.50   27.75   8.25   12.00  1.455  0.678   0.6354
  mean            76.88   27.75   8.88   12.38  1.394
ours              30/70   28      16     16     1.000
```

| row | ours | measured | verdict |
|---|---|---|---|
| **D2a pyramid** IoU | 0.3943 (full), 0.4238 (icon) | gate ≥ 0.95 | **FAIL** |
| **D2b eagle** IoU | 0.4290 (full), 0.4473 (icon) | gate ≥ 0.95 | **FAIL** |
| centre | ±6.88 units toward the middle | ±1.0 | **FAIL** |
| semi-axes | rx ×1.80, ry ×1.41 / ×1.29 | ±5% | **FAIL** |
| **D2c separation** | 40.00 | 53.75, −25.6% | **FAIL** |
| **D2d shape** ry/rx | 1.000 | 1.3145 predicted, −23.9% | **FAIL** |

**Why the split matters, with a number.** The photograph's two devices carry
ink **0.554** and **0.618** in the same rectangular window (0.524 / 0.575 on
the second note) — the eagle half is 10–12% denser. Blended, the reverse reads
0.586 and *both* halves' shortfalls, which differ, become invisible. The
previous pass measured 0.493 / 0.696 over ellipses and found a 41% gap; a
different window shape gives a different gap and the same conclusion. §18.4 is
right on two independent constructions.

**A target-quality finding the old instrument could not report.** The eagle's
rim does **not** agree with itself as well as the pyramid's: rx 9.50 vs 8.25,
**15.2% apart**, and on `bill-rev-2.jpg` the best *different* candidate is only
**0.67 grey levels** behind the winner, against margins of 3.26–6.52 elsewhere.
The ±5% semi-axis clause on the eagle cannot be settled to better than ±7%.
The IoU verdict is untouched — it misses by 0.52 — but a repair round must not
chase the eagle's rx to two decimal places.

---

## 4. The roundels, and the fifth instance of a house habit

The brief said this was "owed and never fixed". Confirmed by measurement, not
by being told:

- both roundels **1.80× too wide** (r 16 against a measured rx 8.88);
- **26% too close together** (40.0 against 53.75);
- **circles where the registration requires ellipses**, ry/rx 1.314.

Our two r-16 roundels span X 14–46 and 54–86 — an **8-unit gap** — where the
note leaves a wide panel between two much smaller seals. That panel is where
the note's central ONE lives. Ours is squeezed into 8 units and the glyph is
~19 units wide, so **the word overprints both rims**, which I then saw in the
render.

This is §22.5's "size a motif to fill its container rather than to fit its
design" for the **fifth** time, and the third distinct manifestation on this
one subject (roundel width, roundel separation, portrait vignette).

**And a consequence nobody had measured.** `struck()`'s comment reads:

> `rField` is the field circle this massing is being struck inside, and it is
> what stops the offset copy from printing on the rim. **Omitted where there
> is no field circle to respect (the $1 note).**

So the note is the only subject in the set whose relief is authored against
nothing. Scored against each device's own roundel:

```
tier | pyramid outside r   depth | eagle outside r    depth
icon |   0.000%          -4.258 |  10.474%          4.840
mid  |   0.000%          -4.305 |   6.959%          3.767
full |   0.000%          -4.325 |   6.511%          2.148
```

The pyramid's deepest point is 4.3 units *inside* its rim. **The eagle is
outside its own roundel at every tier**, deepest at the icon tier: its wings
reach r 19.84 in a 15-unit roundel, **32% over**. D8 against the printed
border reads 0.0000% on the same draw, so the printed-border locus alone
cannot see this. I then looked, and the wings visibly cross the rim at both
upper corners.

---

## 5. Where the instruments failed, and what worked instead

**180 detector cells returned their own search bound.** `_jb4read.mjs`
returned every one of five extents at its window bound on both references.
`_jb5text.mjs` then swept 5 darkness levels × 3 density levels × 2 references
× 4 features = **120 cells and returned a bound in every single one**. Both
said so in their own output rather than publishing a number (§4.1).

The cause is structural and is the note's defining property: **a note is
engraved edge to edge, so within any window the surrounding lathework is
itself ink at any threshold that still admits the letters.** There is no bare
background to fall to anywhere on this subject. This is the same failure
`_blseal.mjs`'s radial sweep had (bit-identical answers twice, in both scan
directions), the same failure `_rvcontain.mjs` has on the coin reverses, and
the same failure four cent/quarter band finders had. It is now **seven
instruments across four subjects**, and on this subject it is not a bug —
defeating exactly this kind of separation is what a banknote's lathework is
*for*.

**What worked was the picture** (R3, PY7), for the third time in this series.
A 1-unit ladder drawn on the rectified reference at ≥ 20 px per viewBox unit
made every reading unambiguous:

- the central **ONE**: cap top Y 21.6, baseline Y 35.0, cap height **13.4**,
  X 35.3–65.4 (30.1 wide), centred at X 50.35 (`_jb6-one-ladder.png`);
- the **pyramid**: capstone a **detached** triangle at Y 18.4–23.0, a
  1.3-unit ray-filled gap, then a **truncated** body Y 24.3–33.6 carrying
  **13 courses** (`_jb5-pyramid-ladder.png`);
- the **portrait vignette**: cx 50.05, cy 30.30, rx 9.75, ry 14.00
  (`_jb6-portrait-ladder.png`).

**And the overlay caught a wrong feature, as it always does.** The automatic
course counter returned 10 peaks on both references — plausible, in bounds,
self-consistent. Drawn on the source, half of them land on the **sea** below
the pyramid, because the frozen window Y 28–38.5 includes it. Two decoys, two
photographs, one picture (`_jb4-reverse-features.png`).

---

## 6. The dimensions that pass, and why they are worth saying out loud

- **D8 containment: 0.0000%, depth 0.0000**, both sides, all three tiers,
  value scaffold on and off. The response test moves it (eagle cx 70 → 86
  gives 3.1064% / 6.9981) and the same metric on the quarter reverse against a
  3..97 box returns 0.0000%, so it is not a metric that returns zero because
  it cannot see.
- **D9: 0 over 150 renders** — 120 in `coins.js` (reproducing `_x6sweep.mjs`
  exactly) plus **30 in `src/art/pawcoins.js`, which has its own independent
  `noteSVG()` and which no sweep in this repo had ever covered.** The response
  test renames `HEAD.Washington` in a generated copy and takes 88 of 120
  renders red across `quarter` **and** `buck` — which is the whole argument
  for sweeping every id and not just the subject.
- **D7 obverse: 71.0°** against a 75° gate, 0 knots over. Inherited from the
  quarter's contour rather than earned, which is itself the reason D9 exists.
- **D10: 1.36× / 0.76× (obverse), 1.17× / 0.84× (reverse)** against a 4× gate,
  0 within-tier pops over the same threshold, swept 26–200 rather than 26–120
  per R2. With a caveat the numbers force: the within-tier p90 (0.048/0.056)
  is nearly as large as the real boundary jump, and the **largest
  discontinuity anywhere in the sweep is a within-tier one** — 0.06908 at
  47→48, pure resampling aliasing as the note's width changes by one device
  pixel. R2's complaint, from the other side: here the *denominator* is
  instrument noise. Reported, not relaxed.

---

## 7. D11 — the note is the most discriminable subject, and the instrument
## has never contained it

Confirmed rather than assumed, and the confirmation turned up a hole.

```
_x6lib.mjs:17   export const IDS = ['penny', 'nickel', 'dime', 'quarter'];
```

**The note has never been in the phase-6 matrix.** Every §17 number ever
published — the 0.0534 obverse minimum, the 0.0808/0.0794 reverse minimum, the
1.49×–1.51× ratio, method-doc §23's headline block — is an 8-cell matrix over
four denominations, in an app that ships five. That is PY3's failure applied
to the one dimension that scores the product goal.

Re-derived over all five, 10 cells, 45 pairs, on the frozen construction:

| | overall min | obverse min | reverse min | rev/obv |
|---|---|---|---|---|
| 4 coins (as published) | 0.0534 nickel.o/dime.o | 0.0534 | 0.0812 nickel.r/dime.r | 1.52× |
| **5 denominations (the app)** | **0.0534 nickel.o/dime.o** | **0.0534** | **0.0812** | **1.52×** |

- The note's nearest **different-denomination** pair is `nickel.r/buck.r` at
  **0.2344** — **4.39× the set minimum** and 2.89× the reverse-only minimum.
  Its own two sides (0.1049) are closer to each other than it is to anything
  else, which does not matter for denomination recognition.
- **Its contribution to the set minimum is exactly zero.** Adding it changes
  the overall, obverse and reverse minima by nothing. The 1.52× failure
  against §17's 3.0× gate is entirely a property of the four discs, and no
  amount of work on the note will move it. **ESCALATE**, as §6.2 requires on
  every scorecard until met.
- Response test: `NOTE_SCALE.w` 1.24 → 0.80 moves **17 of 17** note pairs and
  **0 of 28** others; the note's worst pair falls 0.1049 → 0.0716, i.e. a
  squarer note is a less distinguishable note.
- PY4: my re-derivation of the 4-coin obverse minimum matches the published
  0.0534 exactly; the reverse minimum reads 0.0812 nickel/dime where
  `discriminability.md` published 0.0794 dime/quarter. Expected — the penny,
  nickel and quarter have all been edited since. Both are recorded.

---

## 8. D13 — and what "field" means when there is no field

Windows frozen on the **measured** device centres, never ours. Photograph
box-filtered down to our device pixel count; no upsampling. Reference
invariance: bit-identical. Response test: motif `#6d9c73` → `#1a2a1c` moves
mean/field 0.8183 → 0.7566.

```
reverse, whole frame     ours          photograph        d mean   verdict
  icon  28x14 / 29x15    0.194 0.8500   0.255 0.8140     +0.0360   PASS
  mid   61x32 / 60x31    0.292 0.8093   0.378 0.7906     +0.0186   PASS
  full  212x108          0.280 0.8277   0.553 0.7163     +0.1114   FAIL
```

The failure is **tier-shaped, and the direction is the opposite of the
cent's**. At icon and mid the note's own engraving is destroyed by the
downsample and the photograph's mean/field rises to meet ours, so the gate is
met honestly. At full — 236 × 132 px, the teaching-card draw — the photograph
keeps its engraving and reads 0.72 where ours reads 0.83. **Our note carries
half the ink of a real one** (0.280 against 0.553) at the tier where a child
looks at it longest. Per device: pyramid Δ +0.1310/+0.1223, eagle
+0.1238/+0.1112 — both over twice the gate, and the shortfalls are unequal.

**One PASS that is worthless, and the scorecard says so.** D13-obverse's
`portrait-measured` window passes at mid (−0.0022) and full (+0.0291). The
window is centred at X 50.05 where the note's portrait is; we draw ours at
X 34, so the window covers our oval's right half plus the word ONE and the
densities happen to match. The `whole-frame` row (+0.0583 / +0.0525 / +0.0791,
FAIL at every tier) is the one that means anything. This is Appendix S5's
shape — a dimension passing while the drawing is wrong in exactly the place
the dimension is named for — and it is only visible because the locus was
frozen on the target rather than on us.

---

## 9. S1 — does the note have an `EDGE.field`?

`EDGE[id].field = 41.0` is one literal standing for four coins, measured by
three judges at 44.0 / 44.33 / 44.20. The note is not in `EDGE`. The analogous
never-measured claim, identified **before** measuring: our frame is two nested
rects, so `noteSVG` asserts a **margin between the paper edge and the printed
border**, in both axes, and nothing has ever checked it.

```
                  margin X   margin Y
  note            3.29%      7.62%      (bill-rev-2.jpg)
  ours            3.70%      6.77%
  ratio           1.13x      0.89x
```

In our own units, a note-correct border would sit at **X 4.59–95.41, Y
5.45–50.55** against the drawn 5–95 / 5–51 — **within half a viewBox unit on
every side**.

So: yes, the note has one, and **unlike `EDGE.field` it turns out to be
approximately right.** That is the first negative result in this series of
shared-constant audits and it is worth having: the habit is not "every
constant in this file is wrong", it is "every constant in this file is
unchecked", and checking one sometimes ends in a pass.

**ESCALATE, not PASS**, because exactly one artefact can carry the
measurement. It needs a sound border fit *and* a paper box that is a
measurement rather than a crop; `bill-obv.jpg`'s border fit is degenerate,
`bill-obv-2.jpg` has no real border fit either, and `bill-rev.jpg`'s paper
runs off the frame (2.4239 against a true 2.3525). PY1's rule applies.

---

## 10. What my eyes saw (D12)

The **control was rendered and read first** — the quarter, both sides, three
tiers — before I looked at the note, because after nine sections of arithmetic
every prior I held was of my own manufacture (R6).

**From the control:** a solid mid-grey device on a light field; a thin white
bevel sliver along the device's upper-left; legends only at `full`; a toothed
rim. Those are shared machinery.

**From the subject, with the control's list subtracted:**

- **The obverse at icon (32 × 18 px) is a plain dark oval left of centre and
  nothing else.** No head, no frame worth the name. It is unmistakably a note
  and unmistakably not a portrait.
- **The head does not fill its oval.** A pale crescent of the oval's own
  `p.field` runs down the left and along the bottom. This is arithmetic, not
  an impression: the head's local extent is −27..+22.5 by −30.9..+43.6, scaled
  0.50 and translated to (34, 24), so it is 24.75 units wide inside a 34-unit
  oval and 37.25 tall inside a 42-unit one. The *bevel* sliver, by contrast,
  is on the quarter too and is not a note defect — that attribution is the
  control doing its job.
- **The eagle does not read as an eagle at any tier.** It is a dark arrowhead
  with two bars, and its wings break out of the roundel at both upper corners.
  The quarter's eagle is legible at `mid`; this one is not legible at `full`.
  D8b measured the breakout at 6.5–10.5% and D7 found the 176.9° near-reversal
  in the icon wing bar; the render is what makes them one finding.
- **The central ONE overprints both roundel rims** — D2c's 8-unit gap, seen.
- **Both sides are pale.** Roundel interiors are `p.field`, motifs mid-green.
  D13's +0.11 at full, seen directly.
- The two corner numerals are **diagonally opposite**, which reads as an
  omission rather than a design.

The pyramid is the one device that survives: it reads as a pyramid at every
tier. It is also, per §4, the wrong pyramid — the Great Seal's is truncated
with a detached capstone floating above a ray-filled gap, and ours is a
pointed triangle with a second triangle overlapping its apex.

---

## 11. Instruments I distrust

- **`_jb4read.mjs` and `_jb5text.mjs` (mine, this round).** They do not work
  on this subject and they say so on every line. Kept as the record, per
  §23.6's precedent — the failure is the finding. Nothing derived from them is
  on the scorecard.
- **`_blellipse.mjs`'s eagle fit** — sound on the pyramid, marginal on the
  eagle: 15.2% cross-reference spread and a 0.67-grey-level selection margin
  on one of the two files. Good enough to fail a 0.95 IoU gate by 0.52; not
  good enough to found a ±5% semi-axis target on.
- **`_x6lib.mjs`** — correct at what it does, and **`IDS` has never contained
  the note.** The instrument is not wrong; its coverage is, and no scorecard
  could show it because no row was ever written.
- **My own D10 instrument.** It passes, but its denominator is dominated by
  resampling aliasing rather than by the drawing, so its 4× gate has little
  discriminating power on a subject whose device pixel width changes by one
  pixel per size step. I would not trust it to catch a small real pop.
- **The obverse registration, entirely.** There is no engraved fiducial on
  that face. Every obverse number in this document is taken through the paper
  box, whose two photographs disagree by 5.9%.

---

## 12. Process critique — proposed edits to `COIN-JUDGE.md`

Written to the standard of Appendices P, Q and R and restated in
`docs/COIN-JUDGE.md` under **BUCK r0 PROPOSALS**. Summary:

- **B1** — the rubric needs a declared **subject class**, because four of
  thirteen rows name disc machinery and a rectangle silently reinterprets them.
- **B2** — `N/A` needs a companion for "the metric's subject exists on the
  *reference* but our drawing does not have one": a presence-false row is not
  the same as a metric with no subject.
- **B3** — a **containment locus must be the tightest boundary the design
  declares**, not the outermost one. D8 passed at 0.0000% on a draw where a
  device is 32% outside its own device circle.
- **B4** — an instrument's **`IDS`/`PAIRS` list is a target and must be
  hashed and audited**, because a missing subject is a row nobody writes.
- **B5** — after *n* detectors fail on one subject, the round should be
  allowed to declare the **class** unmeasurable by that method and go
  straight to the picture, instead of paying for detector 6 and 7.
- **B6** — a **negative shared-constant result should be recorded as loudly
  as a positive one**.

---

## 13. Routing plan

**Repairable, in §5's priority order** (D9 → D8 → D1/D2 → D4 → D3/D13 → D5 →
D6 → D7 → D10):

1. **D8b + D2a/b/c/d as ONE brief** — the eagle's breach cannot be repaired
   independently of the roundel it breaches, because that roundel is about to
   move and shrink. §7 brief filled in below.
2. **D1** — the obverse portrait, same class of error, weaker registration.
3. **D4** — the pyramid's truncation and detached capstone; the corner
   numerals.
4. **D13** — tone, after the structure stops moving.
5. **D5** — the central ONE; partly repairs itself once D2c lands.
6. **D6** — six constant-width cuts and one rim ellipse.

**Blocked / routed to the judge:** D3 (no patch set has ever been frozen),
D5-obverse (freeze the legends off the ladder), R0b-obverse (fit the portrait
vignette as a conic — it is the obvious fiducial and nobody has tried), S1
(needs a second full-paper reverse photograph), D11b (property of the four
discs; the note contributes nothing), R1 (a comment).

---

## 14. §7 brief — the top repairable failure

```
SUBJECT      buck ($1 note), reverse
DIMENSION    D2a/D2b/D2c/D2d device registration, and D8b containment
CURRENT      D2a pyramid IoU 0.3943 (full) / 0.4238 (icon)
             D2b eagle   IoU 0.4290 (full) / 0.4473 (icon)
             D2c separation 40.00 against 53.75  (-25.6%)
             D2d ry/rx 1.000 against 1.3145      (-23.9%)
             D8b eagle outside its own roundel 10.474% / depth 4.840 (icon),
                 6.959% / 3.767 (mid), 6.511% / 2.148 (full)
GATE         D2a/D2b  IoU >= 0.95; centre within +-1.0 viewBox unit;
                      each semi-axis within +-5%  (eagle rx: see CAVEAT)
             D2c      separation within +-5% of 53.75
             D2d      ry/rx within +-5% of 1.3145
             D8b      0.00% of motif length outside its own roundel, and
                      depth 0.0000, at EVERY tier

TARGET       coloringbook/judge/_jb4target.json          [READ ONLY - hashed]
               pyramid  cx 23.13  cy 27.88  rx 8.88  ry 11.38
               eagle    cx 76.88  cy 27.75  rx 8.88  ry 12.38
               separation 53.75; anisotropy 1.3145
EVAL         coloringbook/judge/_jb3seal.mjs             [READ ONLY - hashed]
             coloringbook/judge/_jb8geom.mjs             [READ ONLY - hashed]
             coloringbook/_blellipse.mjs, _blnorm.mjs    [READ ONLY - hashed]
REFERENCES   coloringbook/ref/bill-rev.jpg, bill-rev-2.jpg  (independent notes,
             NCC 0.4626 against controls of -0.02 / 0.09)
PICTURES     _jb2-reverse-bill_rev_2_jpg.png   the note and our art, same grid
             _jb6-ladder-reverse-*.png         1-unit ladder, both halves
             _jb5-pyramid-ladder.png           the pyramid at 3x with a Y ladder

MUST NOT REGRESS (current values, re-measured by the judge after you return)
  D8 border   0.0000% depth 0.0000, both sides, all tiers, value on and off
  D9          0 over 150 renders (120 coins.js + 30 pawcoins.js)
  D10 reverse boundary 1.17x / 0.84x, 0 within-tier pops, absolute jumps
              0.06524 and 0.04664
  D11         buck's nearest different-denomination pair 0.2344; the set
              minima 0.0534 / 0.0812 must not move at all (they are not the
              note's, and if they move you have edited something else)
  D13c        reverse whole-frame icon +0.0360 and mid +0.0186 both stay
              inside +-0.05.  The full-tier row is ALREADY failing at +0.1114
              and you are not being asked to fix it; do not make it worse.
  D7 obverse  71.0 deg
  tests       npx playwright test tests/coins.spec.js tests/pawcoins.spec.js

THE JOB
  The two roundels are 1.80x too wide, 26% too close together, and drawn as
  CIRCLES in a box whose anisotropy is 1.3145, so they must become ELLIPSES.
  The pyramid and eagle geometry inside them is hand-placed in absolute
  viewBox coordinates around the r=16 circles, so this re-places every path
  in both devices. That is the job; it is not a nudge.

  Note two things before you start:
  - The eagle's wings currently reach r 19.84 in a 15-unit roundel. Shrinking
    the roundel to rx 8.88 makes the breach WORSE unless the wings come in
    with it. D8b is measured at every tier and icon is the worst one.
  - `struck(...)` is called with rField = 0 for this subject, so nothing stops
    the bevel copy printing outside the roundel. Whether that stays 0 is a
    decision for the judge, not for you; report what you observe.

CAVEAT ON ONE TARGET NUMBER
  The eagle's rx is 9.50 on one reference and 8.25 on the other - 15.2% apart -
  and on bill-rev-2.jpg the runner-up ellipse is only 0.67 grey levels behind
  the winner. Treat the eagle's rx as 8.88 +- 0.63. Do not tune it finer than
  that; the IoU gate does not need you to.

RULES
  - Never describe the note from memory. Open the reference and measure. If
    the photograph contradicts this brief, the photograph wins - say so. One
    comment in this very file is provably wrong about the note's aspect ratio.
  - Do not edit the target or the eval libraries. They are hashed; editing
    them voids the round. If you believe one is faulty, REPORT it with a
    reproduction and continue - reporting is your job, fixing is the judge's
    (§1.1).
  - Report EVERY iteration including the ones that got worse.
  - Do not report a verdict. You report what you changed and what you
    observed; the judge decides whether it passed.
```
