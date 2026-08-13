# Quarter — gates, stated BEFORE measuring (round 0)

Written 2026-08-13, at commit `0ffbaad`, **before any value in
`quarter-scorecard.json` was computed**, except where a row says otherwise and
names the prior published number it inherits. A gate invented after seeing the
value is not a gate (`docs/COIN-JUDGE.md` §3, §8).

Two rules I am holding myself to:

- **No gate is relaxed to fit a result.** Where a §3 typical gate is used
  unchanged, it says so. Where I set a number, the justification is a property
  of the subject or of the instrument, never of the answer.
- **Where a prior run already stated a gate for this coin** (`quarter-obv.md`
  §1, stated before that run's measurements), I inherit it rather than invent a
  new one, and I say so. Inheriting is safe: those gates were written before
  their own values existed.

## The frozen artefacts these gates are scored against

| kind | file | sha256 (first 16) | provenance |
|---|---|---|---|
| target | `_headmask-quarter-v3.json` | `9e80a9384767d157` | REUSED, frozen by the quarter obverse pass |
| target (cross-check) | `_headmask-quarter-v2.json` | `1b224f6bcc653619` | REUSED |
| target (cross-check) | `_headmask-quarter.json` | `923b05671d461d23` | REUSED |
| target | `_tonepatches-quarter.json` | `62cde95a86e8bcfb` | REUSED |
| target | `_rvtarget.json` | `034bcb0ab7b27234` | REUSED (quarter entry: EXTENTS + one count) |
| registration | `_qtreg.json` | `d94711a2545d483e` | REUSED |
| reference | `ref/quarter-obv-2.jpg` | `25bdfecefd243031` | the frame reference, obverse |
| reference | `ref/quarter-rev-2.png` | `b49b43bf3b0137c0` | the frame reference, reverse |
| reference | `ref/quarter-rev.jpg` | `8493330fd5fd4fec` | reverse cross-check (tilted, counting only) |
| subject | `src/art/coins.js` | `782c914f54ba2a01` | the art under test |

## Gates

| # | dimension | side | metric | GATE | where the gate comes from |
|---|---|---|---|---|---|
| D1 | obverse silhouette | obv | region IoU vs `_headmask-quarter-v3.json`, `v ≤ 0.76`, 1024² grid | **≥ 0.95** | §3 typical, and identical to the gate `quarter-obv.md` §1 stated before its own measurement |
| D2 | reverse motif silhouette | rev | motif IoU vs a frozen reverse mask | **≥ 0.95** | §3 typical. **Deliberately NOT softened for the subject.** I have no evidence a spread-winged motif deserves a looser gate than a bust, and inventing one before the target exists would be inventing it to fit. If it fails between 0.90 and 0.95 that is recorded as a FAIL and routed. |
| D3 | interior tone | obv | mean \|Δratio\| over the 12 non-cheek frozen patches, vs `quarter-obv-2.jpg` | **≤ 0.1791** = ½ the published flat-drawing floor (0.3582), §3 typical; AND **no regression** vs the published 0.1447 | §3 typical; floor is a published property of the photograph, not of our art |
| D3r | interior tone | rev | same metric | **needs a frozen patch set + a normaliser**; if neither exists, `UNMEASURED` | §2 |
| D4 | structural rhythm | rev | element count vs `_rvtarget.json`; centre positions as fractions of the element's own span | **count error 0**; mean \|Δposition\| ≤ 0.15 gaps, worst ≤ 0.30 | §3 typical / §15.2 |
| D4 | structural rhythm | obv | — | see the scorecard: the Flanagan obverse carries no repeated structural element. Verdict decided on the evidence, not assumed. | |
| D5 | lettering | both | legend band inner/outer radius in viewBox units vs the photograph's radial-σ plateau; along-band HF energy of our render vs the photograph reduced to the same device pixel count | band inner radius within **±1.5 viewBox units**; HF **≤ 1.5×** the reference at every tier that draws letters, **one-sided** (undershoot is the safe side, §22.4) | §3 typical (HF ≤ 1.5×); the ±1.5-unit band tolerance is mine: one unit is ~2 device px at the 84px draw and ~0.5 px at 26px, so a unit and a half is the smallest tolerance the instrument can resolve at the size the coin is asked to be named at |
| D6 | edge quality | both | stroke-rendered marks (`stroke-width`, no `fill`) whose bounding box touches a filled-region mark | **0 unexplained** | §3 typical / §14.1 |
| D7 | curve quality | both | max knot turn on scored paths (obv `HEAD`, `HAIR`; rev motif `solid`) | **0 knots turning > 75°** | §3 typical / §4 |
| D8 | containment | both | % of path length of every drawn mark (motif + inscription) outside the field circle `EDGE.quarter.field[tier]`, every tier | **0.00%**, every tier, both sides | §3 typical; and `coins.js` asserts it in its own comment ("Nothing the coin draws reaches past the field circle") |
| D9 | well-formedness | both | `undefined`/`NaN`/`Infinity`/`null`/empty attribute over every id × side × tier × value on/off | **0** | §3, blocking |
| D10 | tier behaviour | both | ink fraction of our own render at each size 26…120, at that size's real device pixel count; the jump across a tier boundary against the within-tier jump distribution | boundary jump ≤ **4×** the 90th-percentile within-tier jump | mine. A tier boundary is *expected* to be a step — the tier exists to change the drawing — so the gate has to be on the step's size relative to the drawing's own scale trend. 4× is chosen as "clearly outside the trend" before any value was computed; the dime's icon→mid bar-to-torch pop (§23.3) is the precedent for what a real pop looks like |
| D11 | discriminability | both | `_x6lib` MAD, icon tier, all coins at equal width | **round 0 establishes the baseline**; later rounds: no regression. Reported: overall/obverse/reverse minima and the quarter's own closest pairs | §3; D11 is a property of the set, not of this coin |
| D12 | looked at | both | the judge reads the render at 84/54/26 px, nearest-upscaled, with the Read tool | **must have happened**, and what was seen is written down | §3 / §0 |

## Instrument sanity (§4) — the response test each instrument must pass first

Stated before running them. A number whose tool fails these is `UNTRUSTED` and
blocks like `FAIL`.

| instrument | perturbation | expected response |
|---|---|---|
| D1/D2 IoU | shift `OBVERSE.quarter.cx` by +1 viewBox unit | IoU falls by ~0.01–0.05 |
| D3 tone | (a) flat swatch of every palette colour through the raster path returns that colour's own grey; (b) flip `hairLit` | (a) exact; (b) mean \|Δratio\| moves by ≳0.02 |
| D4 count/extrema | a synthetic square wave with 4 flat-topped columns | returns 4, at the plateau centres |
| D5 band finder | a synthetic ring of angular stripes at a known radius | σ plateau at that radius ±1 unit |
| D6 edge classifier | run on the **dime**, whose jaw line §14 records as a known instance of the defect | must flag the dime jaw line |
| D7 knot turn | a synthetic path with a known 90° corner | reports 90° ± 1° |
| D8 containment | translate one mark 20 units outward in a generated copy | % outside goes from 0 to clearly non-zero |
| D9 sweep | inject `undefined` into one emitted attribute in a generated copy | caught, and the id/side/size named |
| D10 tier pop | generated copy with `EDGE.quarter.field.mid` moved 40.5 → 36 | the boundary jump at 44 becomes the largest jump in the band |
| D11 matrix | `_x6sens.mjs` (widens the dime's icon shaft; 7 pairs must move, 21 must be bit-identical) + `_x6check.mjs` palette round-trip | as stated in the tool |
