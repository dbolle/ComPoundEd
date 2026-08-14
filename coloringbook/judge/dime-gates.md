# Dime (Roosevelt) — gates, stated BEFORE measuring (round 0)

Written 2026-08-14 at commit `c0ff971`, **before any value in
`dime-scorecard.json` was computed**, and hashed into `_jd0hashes.json`
(`node coloringbook/judge/_jd0hash.mjs gates`) before the first instrument in
this round was run. That is nickel-r0's **N1** proposal, obeyed: a gates file
written after the values is a self-assessment, and a reader cannot tell the
difference from the outside.

Nothing has been measured on this coin by me at the time of writing except one
thing, which is disclosed here rather than hidden: I generated
`_jd0-refs.png` — the six reference photographs side by side at 520 px — and
looked at it, because `CLAUDE.md` and §7's brief template both forbid
describing a coin from memory and I could not write a locus without knowing
what is on the coin. **No number was taken off that sheet.** What it
established is the inventory: four obverse photographs (1996-W warm, 2015-W
black-mirror cameo proof, 1996-S grey cameo, 2002-S single-channel high-key),
two reverse photographs of the torch which prior work says are one image.

## Four rules I am holding myself to

1. **No gate is relaxed to fit a result** (§8). Where §3's typical gate is used
   unchanged it says so; where a number is set, its justification is a property
   of the subject, the instrument or an earlier round's *pre-value* derivation,
   never of the answer.
2. **Every locus is a frozen literal, or is derived from the TARGET** — the
   photograph, a frozen mask, a frozen band file. Never from our own drawing
   (§6.1, Appendix R1). Where a locus is read off a reference it is frozen into
   `_jd4band.json` *before* our art is measured against it, and the picture it
   was read from is published.
3. **I do not inherit a gate weaker than §3's typical.** The dime has more
   prior published gates than any other coin (`dime-p2.md`, `dime-p2b.md`,
   `dime-v6.md`); where one of those is weaker than §3, both are scored and
   **§3's is the gate of record**.
4. **`EDGE.dime.field` is under suspicion and is frozen HERE as literals.**
   `coins.js:628` gives all four coins the same triple — full 41.0 / mid 40.5 /
   icon 42.5 — and `scripts/coin-shared-claims.mjs` flags it as never measured
   against any coin. So D8's locus is the literal the file declares, and D8
   measures only "does the drawing stay inside the circle the file declares".
   Whether that circle is where **this coin** puts its rim is a separate row,
   **D5-rim**, measured against the photograph. The two must not be allowed to
   contaminate each other.

## The frozen artefacts these gates are scored against

Full table with full hashes in `_jd0hashes.json`, written before this file.
First 16 hex digits:

| kind | file | sha256 (first 16) |
|---|---|---|
| subject | `src/art/coins.js` | `565d70716e429ca8` |
| target | `coloringbook/_headmask.json` | `e556d8338d3bd526` |
| target | `coloringbook/_tonepatches.json` | `39577216c8819cbd` |
| target | `coloringbook/_p2strand.json` | `ce12053d9500a337` |
| target | `coloringbook/_rvtarget.json` | `034bcb0ab7b27234` |
| snapshot | `coloringbook/pre-dime-p2.js` | `329ec1f3af505865` |
| snapshot | `coloringbook/pre-dime-p2b.js` | `426e1a8705c47064` |
| reference | `ref/dime-obv.jpg` | `f9757ffbc0b28c81` |
| reference | `ref/dime-obv-2.jpg` | `727cde59eed44ff8` |
| reference | `ref/dime-obv-3.jpg` | `2bc2b50da4d121ad` |
| reference | `ref/dime-obv-4.jpg` | `a9cc9184ff70d6cd` |
| reference | `ref/dime-rev.jpg` | `53cacec1d0a9dfe7` |
| reference | `ref/dime-rev-2.jpg` | `dff27e2650805407` |

Eval libraries are hashed in the same file (26 of them, including the ones
inherited from the quarter's, the nickel's and the cent's rounds at their
published hashes: `_jqgeom`, `_jq8contain-v2`, `_jq9well`, `_jq67edge`,
`_jq10tier-v2`, `_jq20indep`, `_jp4unwrap`, `_jp7edge`, `_jn5rim`).

**Reused from the cent's round 0 at their published hashes, because they are
already id-parameterised and re-implementing them would be less trustworthy
than running them:** `_jp9edge.mjs [id]` (D6 on the *adopted* width-variation
metric, D7 on fitted contours, and the D8 response test), `_jp10tier.mjs [id]`
(D10 with the id as an argument, which `_jq10tier-v2.mjs` hard-codes),
`_jp8ours.mjs [id]` (our own legend geometry off the shipped SVG). Their
hashes are recorded in `_jd0hashes.json` under `evals` only if listed there;
the three above are hashed in `_jd0extra.json`, written before they were run.

**Written by this round and hashed on creation, before anything is scored
against them:** `_jd1discs.json` (the disc fits, one per reference) and
`_jd4band.json` (the rim seat, the legend bands and the bare-field sectors,
all read off the polar unwrap of the references).

## Primary references, declared now

| side | primary | why | cross-checks |
|---|---|---|---|
| obverse (geometry) | `dime-obv-2.jpg` | the 2015-W cameo proof; it is `_p2lib.REF` and the reference the frozen `_headmask.json` was traced from, so D1 must be scored against it or the mask means nothing | `dime-obv-3.jpg`, `dime-obv-4.jpg`, `dime-obv.jpg` |
| obverse (tone) | `dime-obv-2.jpg` **and** `dime-obv-3.jpg`/`dime-obv.jpg` | §20.3: a frosted proof is the best shape reference and the **worst** tone reference. The published phase-2 vector used `dime-obv-2`; it is re-derived here against that reference for comparability **and** against the struck references for the sign test | — |
| reverse | `dime-rev-2.jpg` | the larger of the two files | `dime-rev.jpg` — **expected to be the same photograph** (prior NCC 0.9931). Re-run this round; if confirmed, every reverse number is single-source and says so |

## Gates

Every row is scored **per side**. A blank is `UNMEASURED` and fails (§2).
Verdicts are §2.1's: `PASS` / `FAIL` / `UNMEASURED` / `BLOCKED` / `N/A` /
`WAIVED` / `UNTRUSTED`.

| # | dimension | side | metric | LOCUS (frozen literal / target-derived) | GATE | where the gate comes from |
|---|---|---|---|---|---|---|
| D1 | obverse silhouette | obv | region IoU of our filled head against `_headmask.json` | disc-normalised `(u,v)`, 1024² grid, `SPAN` 1.05, clipped at the mask's own `v ≤ VCUT` as recorded in that file's provenance; ours = the HEAD path as emitted by `coinSVG('dime', …, {side:'obverse'})` at 380 px, pushed through the bust transform parsed out of that same SVG | **≥ 0.95** | §3 typical. `dime-v6.md` published 0.981 for this coin; that is a *value*, not a gate, and is not inherited as one |
| D2 | reverse motif silhouette | rev | motif IoU against a frozen reverse mask | `r ≤ 0.862 R` (viewBox 40.5) on a disc-normalised grid; motif = the connected component of `{grey ≤ T}` containing the centre, `T` swept `Tv ± 15` step 5, `Tv` the histogram valley floor **of the photograph** | **≥ 0.95**, and the target only freezes if its **minimum pairwise IoU across the threshold sweep ≥ 0.97** AND **two independent references agree at ≥ 0.95** AND (cent PY5) the selected area is between **1 % and 90 % of the locus** | the score gate is §3 typical; the freeze condition is quarter r2's, inherited unchanged; the degeneracy clause is penny r0's PY5, adopted here **before** any dime value exists |
| D3 | interior tone | obv | mean \|Δratio\| over the 11 non-cheek frozen patches, ours ÷ cheek against the photograph ÷ cheek, **through the FIXED `_p2lib.ourRaster`** | the 12 patches in `_tonepatches.json`, disc-normalised `(u,v,r)` | **≤ ½ the flat-drawing floor**, the floor re-derived this round; ALSO reported against `dime-p2.md`'s own "≤ 0.10" and the palette floor | §3 typical. `dime-p2.md` gated at 0.10 against a flat floor of 0.1134; that is *weaker* than ½ the floor (0.0567) and rule 3 above forbids inheriting it |
| D3s | tone sign test | obv | §12.7 per-patch sign agreement across independent references | same patches | **at least two mutually independent struck references agree in sign on ≥ 9 of 11 patches**; a cameo proof is excluded from tone by §20.3 | §12.7. The 9/11 threshold is stated here before any value: it is the smallest majority that survives one patch disagreeing on each of two references |
| D3r | interior tone | rev | same metric | needs a frozen reverse patch set **and** a normaliser patch on the reverse | neither exists → `UNMEASURED` unless one is frozen this round | §2 |
| D4 | structural rhythm | rev | leaf count and centre positions vs `_rvtarget.json` dime `COUNT` (olive 7, oak 7) | the branch bounding boxes recorded in `_rvtarget.json` `BRANCHES`, target-derived | **count error 0**; mean \|Δposition\| ≤ **0.15 gaps**, worst ≤ **0.30 gaps** | §3 typical. **Note in advance:** `_rvtarget.json` marks this COUNT `confidence: LOW` on a single reference. If the target itself cannot be re-derived to ±0 on a second independent reference, the honest verdict is `BLOCKED` on an acquisition, not a number |
| D4 | structural rhythm | obv | — | — | decided on the evidence: if the Roosevelt obverse carries no repeated structural element, `N/A` **with a written justification** | §2.1 |
| D5-band | lettering band radius | both | each legend's `rInner` and `rOuter` in viewBox units vs the same two radii read off the **polar unwrap of the reference** | `_jd4band.json`, frozen from the reference before our art is measured | **±1.5 viewBox units on BOTH extremes** | ±1.5 inherited unchanged from `quarter-gates.md` D5 (instrument resolution: 1 unit ≈ 2 device px at the 84 px draw). **Both extremes** is cent r0's PY2, adopted here before any dime value: a gate on one extreme passes while the legend floats in the wrong place |
| D5-cap | lettering cap height | both | cap height in viewBox units vs the unwrap reading | `_jd4band.json` | **±15 %** of the reference cap height | quarter r4 derived ±15 % before its own value |
| D5-span | lettering angular span | both | angular span per legend in degrees vs the unwrap | `_jd4band.json` | **±15 %** of the reference span | same derivation |
| D5-HF | lettering high-frequency energy | both | along-band HF energy of our render ÷ the reference reduced to the same device pixel count | radius and sector **frozen in `_jd4band.json` from the reference band**, never from our glyphs | **≤ 1.5×**, one-sided, at every tier that draws letters — and (nickel N5) reported beside a **presence flag**; where our drawing emits no letters at that tier the cell is **not a pass**, it is `UNMEASURED` | §3 typical; the presence rule is nickel r0's N5, adopted here before any dime value, because a one-sided ratio gate that rewards drawing nothing is not a gate |
| **D5-rim** | **rim seat radius** | **both** | **the radius at which the coin's flat field ends and the raised rim begins, read off the polar unwrap of every usable reference, vs `EDGE.dime.field.full = 41.0`** | **`_jd4band.json`; three estimators, all published with their spread (cent PY4)** — see the block below | **±1.0 viewBox units** | quarter r4 set ±1.0 before its own value. This is the row this round exists to settle |
| D6 | edge quality | both | for every drawn relief mark, the ratio of widest to narrowest rendered width; then the **fraction of drawn relief length carried by ratio-1.000 marks**, and separately the count adjacent to a tapered region | all marks emitted for the id/side at 380 px **except**, by name: lettering (`<text>`), the coin blank, the field fill, the field ring, the specular arc and the reeded contour | **fraction ≤ 0.50** | §3's revised D6 row says "declared per coin"; 0.50 is `penny-gates.md`'s declaration and its reasoning transfers unchanged (§14 asserts a real coin has *no* uniform-width marks, so any gate under 1.00 is a real gate, and 0.50 is where the metric can still rank the residual). Declared before any dime value |
| D7 | curve quality | both | max knot turn, **fitted contours only** | the paths the dime's own toolchain fits from the frozen mask — `HEAD` and `HAIR` per `_p2build.mjs` — identified by their opening coordinates, not by file position. Every other path is listed with its worst turn and whether it is authored (`M`/`L`/`Z` only) so a corner declaration can be made against a real list | **0 knots turning > 75°** on the fitted contours | §3 typical / Appendix P2 |
| D8 | containment | both | % of drawn path length outside the field circle, **and the deepest breach in viewBox units** | `EDGE.dime.field` frozen HERE as literals: **icon 42.5, mid 40.5, full 41.0**; sizes 26/38/44/54/76/84/120/190/380 | **0.00 % at every tier, both sides.** The depth is printed beside it for ranking and **does not excuse the fraction** | §3 typical. Appendix Q3's sub-quantum exemption is a **proposal, not in force** — Q3 says so itself and Q's body calls a 0.0038-unit breach and a 1.4698-unit breach "both `FAIL` … and both should be". `penny-gates.md` records the same correction |
| D9 | well-formedness | both | `undefined`/`NaN`/`Infinity`/`null`/empty attribute/tag balance/non-numeric path number over every id × side × size × value | all five ids, both sides, 9 sizes, value on and off | **0** | §3, **blocking** |
| D10 | tier behaviour | both | ink fraction at each box width at its real device pixel count; the jump across a tier boundary against the within-tier jump distribution, with the **numerator in absolute Δink** printed beside the ratio, and every within-tier pop listed | sweep **26 … 200 step 2**, a literal. 26–120 is NOT used (quarter r2 found a real within-tier pop permanently outside it) | boundary jump ≤ **4×** the 90th-percentile within-tier jump, **and** the absolute Δink reported; a ratio may not be recorded as improved unless the numerator moved | `quarter-gates.md` D10 / `penny-gates.md` D10, inherited with the widened window for the stated reason |
| D11 | discriminability | both | `_x6lib` MAD, greyscale, all coins at equal width | **icon tier, 26 px**, frozen | **round 0 establishes the baseline**; and the §17 **set** gate (reverse minimum ≥ 3× the obverse minimum) is reported with its own verdict and `ESCALATE` (§6.2) | §3 / §6.2 |
| D12 | looked at | both | the judge reads the render with the Read tool, **with a control rendered and read FIRST** | 26 / 44 / 84 px at the real device pixel count, nearest-upscaled, beside the photograph reduced to the same pixel count | **must have happened**, the control named, and what was seen written down before the subject was rendered | §3 / Appendix Q5 / Appendix R6 |
| D13 | device against field | both | mean ÷ field and ink fraction over the disc interior, ours vs the photograph reduced to the SAME device pixel count | disc interior **r < 40 viewBox units** (`RAD=40`), ink threshold **0.85 × that side's own p90 field level** (both frozen in `_x6dark.mjs`), tiers **26 / 44 / 84 px**, no upsampling anywhere | **\|Δ mean/field\| ≤ 0.05 at each tier** | §3's D13 row, typical. `_x6dark.mjs` is **reverse-only** (cent PY3); the obverse half is computed with the same frozen constants and its reverse output is cross-checked against `_x6dark.mjs` bit-for-bit |

### D5-rim: the three estimators, frozen before the first run

All three are computed on **every** reference that has a sound disc fit, and on
**two loci each** — the whole circle, and the bare-field angular sectors frozen
in `_jd4band.json`. The value of record is the **median across references of
the bare-field-sector reading of E1**; E2 and E3 are published beside it and
the **spread is reported as a fraction of the ±1.0 gate** (cent PY4: a spread
over half the gate makes the dimension `UNTRUSTED`).

- **E1 — field departure.** Radial mean profile `m(r)` over the locus. Field
  level `L` = median of `m(r)` over `FIELD_WIN = [36.0, 42.0]`. Seat = the
  innermost `r` in `RIM_WIN = [40.0, 46.5]` with `|m(r) − L| > DROP = 25` grey
  levels. `STEP = 0.05` units, angular sampling `0.25°`.
  This is `_jn5rim.mjs`'s rule with **one** generalisation, stated now and not
  after: the test is on `|m − L|`, not `L − m`. A cameo proof's mirror field
  photographs near-black and its rim is **brighter**, so a signed drop cannot
  find it. My implementation must reproduce `_jn5rim.mjs`'s six nickel rim
  seats **bit-for-bit** when given the nickel's own parameters and discs
  (cent PY6's equivalence rule); that run is printed and goes in the scorecard.
  `FIELD_WIN` is 6 units wide and read by **median**, so it survives up to
  ~3 units of rim contamination at its outer end.
- **E2 — gradient shoulder.** Innermost local maximum of `|dm/dr|`
  (`m` smoothed over 0.5 units) in `[40.0, 46.0]` whose prominence is ≥ 30 % of
  the window maximum. §4.1: bounds printed; a pick at a bound is a failure
  report, not a value.
- **E3 — the picture.** Read off the polar unwrap with a labelled 1-unit
  ladder and a 0.5-unit zoom, by eye, to the nearest 0.25 units, with the
  reading written down in `dime-r0.md` (Appendix R3 / quarter r4 S2).

**Prerequisite, and it gates all three (cent PY7):** the unwrap's own units
come from a fitted disc, so each reference must publish **where its own
silhouette lands in unwrap units**. It is 47.00 by construction. A reference
whose silhouette lands more than 1 % from 47.00 has every radius corrected by
`47 / rEdge`, and the correction is published; a reference whose per-column
edge spread (p5–p95) exceeds 3 % is **not used for a geometric gate**.

## Instrument sanity (§4, §4.1, §4.2, §4.3) — stated before running

A number whose tool fails these is `UNTRUSTED` and blocks like `FAIL`. Each
row also states **the subjects the instrument covers** (cent PY3): a subject an
instrument does not cover is `UNMEASURED`, never absent.

| instrument | covers | response test | null test (bounds printed) | selection test (whole candidate set) | located feature drawn? |
|---|---|---|---|---|---|
| `_jd1disc` disc fits | all 6 dime refs | shift the seed centre 5 px → the refined fit returns to within 0.5 px | ray window printed; rays landing at a window end dropped and counted | **every strategy's answer for every reference** printed, not only the chosen one | **yes — every fit drawn on its own source, and read back with the Read tool, before any value derived from it is recorded** |
| `_jd2indep` independence | all 6 dime refs, pairwise | a control pair of two different designs | NCC bounded [−1,1]; a value at a bound is a failure report | the whole matrix printed, **plus the fitted R in one column** (nickel N4: two files with a bit-identical R are one photograph until proved otherwise) | n/a |
| `_jd3unwrap` | all refs with a disc | not a detector — it is the coin redrawn in (angle, radius). It cannot be wrong about where a feature is; it IS the picture | n/a | n/a | **it IS the picture** |
| `_jd5rim` E1/E2 | all refs with a disc, both sides | (a) **equivalence**: reproduce `_jn5rim.mjs`'s nickel seats bit-for-bit; (b) shift the disc R by +2 % → every seat must move by −2 % | `FIELD_WIN`/`RIM_WIN` printed; a seat at a window end is a **failure report** | every candidate crossing printed, not only the innermost | **yes — the seat drawn on the unwrap, and read back** |
| `_jd6edge` coin-edge check | all refs with a disc | `_jp7edge.mjs`'s rule, re-implemented against this round's discs; it must return 47.00 ± 1 % on a reference whose disc is sound | window `[44,49]` printed; columns at a bound dropped and counted | n/a | **yes — drawn on the unwrap** |
| D1 IoU (`_jd7iou`) | dime obverse only | shift `OBVERSE.dime.cx` by +1 unit in a generated copy → IoU must fall by 0.01–0.05 | n/a | n/a | mask over the reference, published and read back |
| D2 segmenter (`_jd8d2`) | dime reverse only | threshold sweep must move the contour | sweep window printed; a contour at a window end is a failure report | every threshold's component count **and selected-area fraction of the locus** printed (PY5) | **yes — the contour on the source, and I look** |
| D3 tone (`_p2score` + `_p2lib`) | dime obverse only | (a) §20.1's flat-swatch round trip: every dime palette colour through `_p2lib.ourRaster` must come back as that colour's own grey; (b) a structural change to a hair fill must move the mean ≳ 0.02 | n/a | n/a | patches over the reference |
| D4 count (`_jd9count`) | dime reverse only | synthetic combs of 5 and 9 return 5 and 9; a flat profile returns 0 | prominence and window printed | every extremum printed, not only the chosen ones | **yes — the counted centres on the source** |
| D5-HF | both sides | a synthetic ring of angular stripes must raise HF; **reference-invariance** (§6.1): the reference's own HF must be bit-identical across two revisions of our art | n/a | n/a | the sampled annulus drawn on both |
| D6 / D7 (`_jp9edge [dime]`) | any id, both sides | taper one mark in a generated copy → the ratio-1.000 fraction must fall; a square corner reads 90.000° | n/a | the full mark list with each ratio printed | the flagged marks listed by id; the worst knot's coordinates printed |
| D8 (`_jq8contain-v2`) | all five ids, both sides, 9 sizes | move one mark 20 units outward in a generated copy → % outside goes 0 → clearly non-zero. **`_jq8contain-v2.mjs`'s own `RESPONSE=1` throws at `HEAD`** (cent PY6: its anchor is a quarter path commit `5c1aeb1` rewrote). The instrument is **not edited**; the response test is re-run through `_jp9edge.mjs`'s re-implementation on the dime | n/a | **the full field-circle candidate set printed; throws on ambiguity** | the breaching marks named with their max radius |
| D9 (`_jq9well`) | all five ids, both sides, 9 sizes, value on/off | inject `undefined` into one emitted attribute → caught, and the render named | n/a | n/a | n/a |
| D10 (`_jp10tier [dime]`) | any id, both sides | move `EDGE.dime.field.mid` 40.5 → 34.0 in a generated copy → the boundary jump becomes the largest in the band | the sweep window printed | n/a | the full ink-fraction curve printed |
| D11 (`_x6mat`, `_x6lib`) | all 8 id×side cells | `_x6sens.mjs`: widening the dime's icon shaft must move exactly the 7 pairs involving `dime.reverse` and leave the other 21 bit-identical | n/a | the whole 8×8 matrix printed | `_x6grid.mjs` icon sheet |
| D13 (`_x6dark` + `_jd10d13`) | `_x6dark` covers **reverses only**; `_jd10d13` adds the obverse with the same frozen constants and reproduces `_x6dark` on the reverse | `_x6check.mjs` palette round trip; the recovered field level must be the palette's own grey (212 on the silver coins) | n/a | n/a | the reduced reference beside ours, read back |
| D12 (`_jd11look`) | both sides, 3 tiers | n/a — it is the looking | n/a | n/a | **it IS the picture; the CONTROL is rendered and read FIRST** |

## What I will not be able to do, and will say so (§8)

- The reverse is expected to be **single-source**. If `dime-rev.jpg` and
  `dime-rev-2.jpg` are confirmed to be one photograph, then D2's "two
  independent references agree at ≥ 0.95" **cannot be satisfied with any
  artefact we hold**, and the verdict is `BLOCKED` naming the acquisition — not
  a softened freeze condition.
- D3's sign test needs two mutually independent **struck** references. Whether
  the dime has them is a fact about the reference set, not about the coin, and
  is settled by `_jd2indep` before D3 is scored.
- The judge does not measure whether a child can name a dime (§8). D11 is a
  pixel proxy. `nickel.o/dime.o = 0.0534` is the set minimum across all 28
  pairs and that is reported as a set fact, not as a dime defect.
