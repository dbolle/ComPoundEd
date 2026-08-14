# `buck` — the $1 note — frozen gates, round 0

**Written and hashed BEFORE the first measurement of this round** (nickel r0
proposal N1). Commit at time of writing: `c0ff971`. Judge: buck r0, 2026-08-14.
A second judge is running concurrently on the dime; both are read-only on
`src/art/coins.js`.

Every gate below is either

- **§3** — the rubric's typical gate, inherited unchanged; or
- **§18 / bill.md** — a number measured off the *photographs* in the
  2026-08-13 note pass, i.e. before this round and independent of our art; or
- **declared here** — a threshold this document states for the first time,
  with the derivation written out. §8 forbids relaxing any of them later.

Nothing in this file may be edited after its hash is recorded. If a gate turns
out to be wrong, the round publishes the miss and proposes the re-derivation
for the *next* round (§8).

---

## 0. The subject is not a coin. What that costs, stated first.

The rubric D1–D13 was written for a disc, and four of its thirteen rows name
disc-only machinery (a field *circle*, a lettering *band radius*, a *motif on a
bare field*, a fitted *contour*). This section fixes, **before measuring**, what
each row means on a rectangle. Every restatement is recorded on the scorecard
as `metric` + `locus`; this is the audit trail for why they read as they do.

| row | transfers? | what it means on the note |
|---|---|---|
| D1 | **restated** | "obverse silhouette" = the principal device of the obverse. On the note that is the **portrait vignette** (our `<ellipse cx=34 cy=28 rx=17 ry=21>`) and the head inside it, registered by homography, not by a disc |
| D2 | **restated + SPLIT** | §18.4 forbids one number. Two rows: `D2-pyramid` and `D2-eagle`. The device is embedded in ornament with no bare field, so a traced contour is not available (bill.md §5); the silhouette is the **rim ellipse**, and IoU is computed between our drawn roundel and the measured rim ellipse |
| D3 | transfers | patch ratios, normalised to a patch inside the device, against a flat-drawing floor. Needs a frozen patch set that has never existed for this subject |
| D4 | transfers | count + positions of a repeated element. Reverse: the **pyramid's courses**. Obverse: the **corner numerals** |
| D5 | **restated** | there is no band *radius*. A legend on a rectangle is frozen as a **baseline Y and a cap-top Y in viewBox units**, plus its X extent — the two extremes PY2 asks for, in Cartesian rather than polar form |
| D6 | transfers | width-variation ratio per mark. Nothing about it is circular |
| D7 | transfers | max knot turn on **fitted contours only** (§3 D7, as amended by P1/P2) |
| D8 | **restated** | there is no field circle. The analogous constraint is the **printed border rectangle** — the note's own outermost engraved element, and the thing §18.1 registers on. Second locus: the paper edge |
| D9 | transfers | unchanged, and it is the one that must sweep every id because the note shares `HEAD.Washington` |
| D10 | transfers | unchanged |
| D11 | transfers | unchanged, and the note is the set's most discriminable member by construction (a green rectangle among silver discs) |
| D12 | transfers | unchanged, control first |
| D13 | **restated** | "field" is not bare metal. See §6 below |

Rows expected to come out `N/A` are **not** decided in advance; §2.1 requires a
waiver-grade justification written against the measurement, so each is argued on
the scorecard, not here.

---

## 1. Registration — the prerequisite, gated before any geometry

| # | gate | source |
|---|---|---|
| R0a | the fiducial is the **printed border rectangle**, never the paper edge | §18.1 |
| R0b | the border ratio fitted from two independent photographs of the same face agrees within **1.0%** | §18.2 / bill.md N1 |
| R0c | the fitted quad is near-rectangular: every corner within **1.0°** of 90°, opposite sides within **1.0%** | §18.2 / bill.md N3 |
| R0d | every fitted quantity is **looked at** drawn on its own source | §4.3, integrity rule 3 |
| R0e | reference independence: every pair used as two references sits far below NCC 0.97, with a control pair computed; and the **fitted border ratio is printed for every file in one column** — two files with a bit-identical fit are one photograph until proved otherwise (nickel r0 N4) | §21.5 + N4 |

A round whose registration fails R0b on a face may still measure that face, but
every geometric value on it carries the registration's own uncertainty as a
stated caveat, and no geometric gate on that face may be recorded as a PASS
inside that uncertainty.

## 1.1 The aspect-ratio claim under test

`noteSVG()` comments *"the aspect ratio is 1.79:1 against a real note's
2.61:1"*. **2.61 is the note's height in inches, not a ratio.** Frozen truths,
all measured before this round:

- paper ratio 6.14 in / 2.61 in = **2.3524**
- printed border ratio, mean of two independent reverses = **2.572**
- our outer box 100/56 = **1.7857**; our inner frame rect 90/46 = **1.9565**
- therefore `uv2XY` is anisotropic by 2.572/1.9565 = **1.3143**, deliberately

Gate R1: the round **re-derives** all four numbers and reports whether the
comment is wrong. It is not a repairable dimension (the non-copy box is a
deliberate 31 CFR 411 choice); it is a documentation defect and is reported as
one.

---

## 2. The rubric gates

`SIDE` is `obverse` / `reverse`; every row is scored on **both** unless the
metric names one (§3).

| # | dimension | gate | locus (frozen literal) | source |
|---|---|---|---|---|
| D1 | obverse principal-device silhouette | region IoU **≥ 0.95** vs a frozen target | the portrait vignette region in border-normalised (u,v), rasterised at 900×350 | §3 |
| D2a | reverse motif — **pyramid** | IoU **≥ 0.95** of our drawn roundel against the measured rim ellipse; centre within **±1.0** viewBox unit; each semi-axis within **±5%** | the ellipse fitted by `_blellipse.mjs` on `bill-rev.jpg` + `bill-rev-2.jpg`, mean **cx 23.13 cy 27.88 rx 8.88 ry 11.38** | §3 + bill.md §4 |
| D2b | reverse motif — **eagle** | as D2a | mean **cx 76.88 cy 27.75 rx 8.88 ry 12.38** | §3 + bill.md §4 |
| D2c | device **separation** | within **±5%** of the measured centre separation **53.75** viewBox units | the two measured centres above | bill.md §4.2 |
| D2d | device **shape** | our roundel's ry/rx within **±5%** of **1.314** (the anisotropy the registration predicts, confirmed at 1.340 by a quantity nothing was fitted to) | — | bill.md §3 |
| D3 | interior tone | mean \|Δratio\| **≤ ½ the flat-drawing floor** measured on the same reference, per side | a frozen patch set in (u,v); none exists — if none is frozen this round the row is `UNMEASURED`, never blank | §3 |
| D4 | structural rhythm | **count error 0**; mean centre error **≤ 0.15 gaps** | reverse: the pyramid's courses, counted on the rectified reference. obverse: the corner numerals | §3 |
| D5 | lettering | our legend's **baseline Y and cap-top Y** each within **±1.5 viewBox units** of the same extremes measured on the reference; X extent within **±15%**; HF variance **≤ 1.5×** the blurred reference at the frozen locus, with a **presence flag** printed beside every ratio | frozen per legend as (Ybaseline, Ycap, X0, X1) read off the rectified reference at ≥ 12 px per viewBox unit | §3 + PY2's two-extreme form |
| D6 | edge quality | **0.00%** of relief-mark drawn length carried by ratio-1.000 (uniform-width) marks. Lettering, the two frame rects and the scallop border wave are **excluded by name**, not by argument. The fraction is reported unrounded and the marks are ranked by contributed length | every `<path>`/`<rect>`/`<circle>` in the note's `struck()` massing and its `detail` argument, both sides, all three tiers | §3 D6 row (P1's width-variation form); the 0.00% threshold is **declared here**, from §14's "a real coin has no uniform-width marks anywhere" — a note is *entirely* engraved line work and has fewer, not more |
| D7 | curve quality | max knot turn **≤ 75°**, **fitted contours only**; a path authored as a polygon declares its corners and those knots are exempt | the note's own path set, per side per tier | §3 D7 |
| D8 | containment | **0.00%** of drawn path length outside the printed-border rect, **and** the max depth in viewBox units, at **every** tier. Reported unrounded; the depth is reported beside it so severities four hundred times apart can be ranked (Q3) | **frozen literal**: the rect X∈[5,95], Y∈[5,51], i.e. `_blnorm.mjs FRAME` at its published hash. Second locus, also frozen: the paper rect X∈[1.4,98.6], Y∈[1.4,54.6]. **These are literals: if a future round moves `noteSVG`'s frame, this locus does not move with it** | §3 D8 + §6.1 |
| D9 | well-formedness | **0** `undefined`/`NaN`/`null`/malformed path numbers over **every id × side × tier × value-scaffold** — all five ids, not just `buck`, because the note draws `HEAD.Washington` | 5 ids × 2 sides × 6 sizes × value on/off | §3 D9, **blocking** |
| D10 | tier behaviour | byte-identity where declared; boundary jump **≤ 4×** the 90th-percentile within-tier jump, with the **numerator printed in absolute units** beside the ratio | size swept **26..200 inclusive, step 1**, at the note's own device pixel count — declared here at 200 rather than 120 because R2 found a legend switch sitting permanently outside a 26..120 window | §3 D10 + R2 |
| D11 | discriminability | **two numbers, always** (§6.2): (a) the note's own pairwise minima at the icon tier, equal width — no regression vs round 0, which round 0 passes by construction and must say so; (b) the **set** §17 ratio reverse-min ÷ obverse-min **≥ 3.0**, reported `ESCALATE` until met | `_x6lib.mjs`'s frozen construction: rasterise at the real device pixel count, then nearest-resample to 64×64; metric `mad()` | §3 D11 + §6.2 + §17 |
| D12 | looked at | the judge renders a **control first**, before reading any description, and **reads the PNG back with the Read tool** and says in the round document what is in it. "The file exists" is not "the overlay was drawn" (nickel r0 N3) | both sides, icon + full, plus a control the round cannot have touched | §3 D12 |
| D13 | device against field | \|Δ mean/field\| **≤ 0.05** at each tier, ours vs the photograph reduced to the **same device pixel count**; ink fraction reported beside it. **Two rows on the reverse** (pyramid, eagle) — §18.4 | frozen windows in viewBox units: pyramid X∈[5.13,41.13], eagle X∈[58.88,94.88], both Y∈[5,51]. "Field" = the **90th-percentile grey of the window** (see §6) | §3 D13 |

## 2.1 D2's obverse row and D1's reverse row

D1 names the obverse and D2 names the reverse. Following §3 ("a dimension
scored on one side is a blank on the other, and §2 applies to blanks"), the
scorecard carries `D1/reverse` and `D2/obverse` rows and argues each as `N/A`
against the §2.1 standard, rather than omitting them.

---

## 3. Instrument obligations, stated before any instrument is written

Every number on the scorecard is produced by a `_jb*` instrument that has
published, in its own output:

1. **response test** — perturb the art in a way that must move this number;
   record the direction and rough size (§4);
2. **null test** — print the search bounds beside the result; a result equal to
   a bound is a failure report, never a value (§4.1);
3. **selection test** — print the WHOLE candidate set when the instrument
   chooses one of several, and throw when the choice is ambiguous (§4.2);
4. **the size of what it selected as a fraction of what it was allowed to
   select**, for any segmenter — >90% or <1% is a failure report whatever its
   self-agreement (PY5);
5. **reference-invariance** — score the same target against two revisions of
   our art and require every target-side number to be bit-identical (§6.1);
6. **subjects covered** — the instrument states which ids/sides it covers; a
   subject it does not cover is `UNMEASURED`, not absent (PY3);
7. **overlay** — every located feature is drawn on its source, the geometry is
   asserted finite before rasterising, the PNG is read back, and the filename
   is named on the scorecard (§4.3, R6, N3).

---

## 4. Termination and budget

Round 0 measures; it dispatches nothing. Budget for the loop: 4 rounds (§5).

---

## 5. The shared-constant question

`EDGE[id].field` is one literal (`41.0/40.5/42.5`) standing for four coins;
three judges have now measured it independently at **44.0 / 44.33 / 44.20**.
The note is not in `EDGE`. Gate:

> **S1** — enumerate every literal in `noteSVG()` that encodes a *measurable
> property of a real note*, and say for each whether it has ever been measured.
> Any that has not is reported as an escalation with the measurement this round
> can make, and the row routes to the **judge**, not to a specialist (PY1's
> "a constant shared across subjects may not be scored per subject until it has
> been measured on every subject that shares it").

The candidate identified before measuring: the note's frame is two nested
rects, `(1.4,1.4,97.2,53.2)` outer and `(5,5,90,46)` inner. The **margin
between the paper edge and the printed border** is therefore a claim our art
makes about a real note, in both axes, and it has never been measured. It is
measurable this round from `_blfit.mjs`'s own output, which already reports the
paper box and the border quad in the same pixels.

---

## 6. What "field" means on a note — D13's restatement, in full

On a coin, the field is bare struck metal: a large, connected, near-uniform
region against which the device stands. **A note has no such region.** The
paper inside the printed border is covered edge to edge with engraved
ornament — that is precisely why bill.md §5's density-based extent finder
returned its own search bound twice, in both scan directions, on two different
photographs.

So D13's "field" is frozen as a **statistic, not a place**:

> **field = the 90th-percentile grey inside a frozen 36 × 46-unit window
> centred on the device's measured centre.** It is the lightest tenth of the
> device's own neighbourhood: on the photograph that is the paper showing
> between engraved lines, and in our art it is `PALETTE.buck.field` /
> `.body`. `mean/field` and `ink fraction` are then computed exactly as
> `_x6dark.mjs` computes them on a coin.

Two consequences, both stated now so neither can be discovered conveniently
later:

- the note's `mean/field` is **not** comparable to a coin's, because the
  denominators are different kinds of thing. It is only ever compared to the
  photograph's own value in the same window, which is what the gate does.
- the window is centred on the **measured** device centre, never on ours, so a
  misplaced device cannot score itself (§6.1's rule against a locus that is a
  function of the artefact under test).

---

## 7. Hashes

Recorded in `buck-scorecard.json` under `targets` and `eval_libraries`, taken
**before** the first measurement and re-taken at the end of the round. This
file's own hash is recorded there as `buck-gates.md`.
