# Penny (Lincoln cent) — gates, stated BEFORE measuring (round 0)

Written 2026-08-14 at commit `5c1aeb1`, **before any value in
`penny-scorecard.json` was computed**. A gate invented after seeing the value is
not a gate (`docs/COIN-JUDGE.md` §3, §8).

Three rules I am holding myself to, and one that is new for this coin:

- **No gate is relaxed to fit a result.** Where §3's typical gate is used
  unchanged, it says so. Where I set a number, the justification is a property
  of the subject or of the instrument, never of the answer.
- **Where a prior pass stated a gate for this coin** (`penny-obv.md` §1, written
  before that pass's own measurements), I record it — but I do **not** inherit a
  gate that is *weaker* than §3's typical. Inheriting a weaker gate is relaxing
  by another route. D3 is the live case: `penny-obv.md` gated tone at "below the
  flat-drawing floor" where §3 says "≤ ½ the flat floor". **Both are scored, and
  the §3 typical is the gate of record.**
- **Every locus below is a literal, or is derived from the TARGET.** Never from
  our own drawing (§6.1, Appendix R1).
- **`EDGE.penny.field` is itself under suspicion.** `scripts/coin-shared-claims.mjs`
  flags it: one literal triple (full 41.0 / mid 40.5 / icon 42.5) shared by all
  four coins and never measured against any of them. D8's locus is therefore
  frozen here **as literals**, so that D8 measures "does the drawing stay inside
  the circle the file declares" and cannot silently become a function of the
  artefact under test. Whether that circle is where the *coin* puts its rim is a
  separate row (**D5-rim**), measured against the photograph.

## The frozen artefacts these gates are scored against

Full table in `_jp0hashes.json` (written by `_jp0hash.mjs` before any
measurement). First 16 hex digits:

| kind | file | sha256 (first 16) |
|---|---|---|
| subject | `src/art/coins.js` | `565d70716e429ca8` |
| target | `coloringbook/_headmask-penny.json` | `94e58055954f1802` |
| target | `coloringbook/_tonepatches-penny.json` | `b368bdbdb4306da8` |
| target | `coloringbook/_pyreg.json` | `37bafec1c34b9a2f` |
| target | `coloringbook/_rvtarget.json` | `034bcb0ab7b27234` |
| reference | `ref/penny-obv.jpg` | `bc663dc496f2d2b1` |
| reference | `ref/penny-obv-2.jpg` | `3615e64428191d48` |
| reference | `ref/penny-obv-3.jpg` | `fe1b8cf868a62560` |
| reference | `ref/penny-obv-4.png` | `c7e5d02b248b26be` |
| reference | `ref/penny-rev.jpg` | `23ee8c2e140cfe02` |
| reference | `ref/penny-rev-2.png` | `0105b257503a9455` |
| reference | `ref/penny-rev-artwork.jpg` | `622069e8964d7961` |

Eval libraries are hashed in the same file. Two targets are **written by this
round** and hashed on creation, before anything is scored against them:
`_jp1discs.json` (the disc fits) and `_jp4band.json` (the band / rim reading off
the polar unwrap).

## Gates

Every row is scored **per side**. A blank is `UNMEASURED` and fails (§2).

| # | dimension | side | metric | LOCUS (frozen literal / target-derived) | GATE | where the gate comes from |
|---|---|---|---|---|---|---|
| D1 | obverse silhouette | obv | region IoU vs `_headmask-penny.json` | `v ≤ 0.16` in DISC coordinates, 1024² grid, `SPAN` 1.05; ours = HEAD ∪ bare neck ∪ coat (§11.5) | **≥ 0.95** | §3 typical, and identical to the gate `penny-obv.md` §1 stated before its own value |
| D2 | reverse motif silhouette | rev | motif IoU vs a frozen reverse mask | `r ≤ 0.862 R` (viewBox 40.5) on a disc-normalised grid | **≥ 0.95**, and the target only freezes if its **minimum pairwise IoU across the threshold sweep ≥ 0.97** and two independent references agree at **≥ 0.95** | §3 typical for the score; the freeze condition is round 2's, inherited unchanged and **not softened for a building** |
| D3 | interior tone | obv | mean \|Δratio\| over the 11 non-cheek frozen patches vs `penny-obv-3.jpg` | the 12 patches in `_tonepatches-penny.json`, disc-normalised `(u,v,r)` | **≤ ½ the flat-drawing floor**, re-derived this round; ALSO reported against `penny-obv.md`'s weaker "≤ the flat floor" | §3 typical. See the third rule above: the weaker prior gate is reported, not adopted |
| D3s | tone sign test | obv | §12.7 sign agreement across independent references | same patches | **at least two mutually independent struck references**; a cameo proof is excluded from tone by §20.3 | §12.7 / `penny-obv.md` §5 |
| D3r | interior tone | rev | same metric | needs a frozen patch set **and** a normaliser patch on the reverse | if neither exists → `UNMEASURED` | §2 |
| D4 | structural rhythm | rev | column count and centre positions vs `_rvtarget.json` penny `COUNT`/`RHYTHM` | capital band, target-derived: `penny-rev-2.png` band Y 41.0–43.5, 12 centres, mean gap 4.94 | **count error 0**; mean \|Δposition\| ≤ **0.15 gaps**, worst ≤ **0.30 gaps** | §3 typical / §15.2 |
| D4 | structural rhythm | obv | — | — | decided on the evidence: if the Brenner obverse carries no repeated structural element the verdict is `N/A` **with a written justification**, not a waiver | §2.1 |
| D5-band | lettering band radius | both | legend baseline radius in viewBox units vs the radius read off the **polar unwrap of the reference** | `_jp4band.json`, frozen from the reference before our art is measured | **±1.5 viewBox units** | inherited unchanged from `quarter-gates.md` D5; the justification there is instrument resolution (1 unit ≈ 2 device px at the 84px draw) and it transfers |
| D5-cap | lettering cap height | both | cap height in viewBox units vs the same unwrap reading | `_jp4band.json` | **±15%** of the reference cap height | round 4 on the quarter derived ±15% before its own value; adopted here before any penny value exists. It is a *size* gate, and §3's D5 row as written can be met by a legend in the right place at half the size |
| D5-span | lettering angular span | both | angular span of each legend in degrees vs the unwrap | `_jp4band.json` | **±15%** of the reference span | same derivation |
| D5-HF | lettering high-frequency energy | both | along-band HF energy of our render ÷ the reference reduced to the same device pixel count | radius and sector **frozen in `_jp4band.json` from the reference band**, never from our glyphs (§6.1, Appendix R1) | **≤ 1.5×**, one-sided (undershoot is safe, §22.4), at every tier that draws letters | §3 typical |
| D5-rim | rim seat radius | both | the radius at which the coin seats its rim, off the unwrap, vs `EDGE.penny.field.full` | `_jp4band.json` | **±1.0 viewBox units** | round 4 on the quarter set ±1.0 before its own value. This is the row that tests the shared `EDGE.field` claim |
| D6 | edge quality | both | for every drawn relief mark, the ratio of widest to narrowest rendered width; then the **fraction of drawn relief length carried by ratio-1.000 marks** | all marks emitted for the id/side at 380px **except** lettering, the coin blank, the field ring, the specular arc and the reeded contour — excluded **by name**, per §3's D6 row | **fraction ≤ 0.50** | §3's revised D6 row says "declared per coin". 0.50 is chosen as "the majority of relief length has been tapered", which is the smallest claim that is a claim: §14 asserts a real coin has *no* uniform-width marks, so any gate under 1.00 is a real gate and 0.50 is the point at which the metric can still rank the residual. Stated before any value |
| D7 | curve quality | both | max knot turn, **fitted contours only** (§3 D7, Appendix P2) | obverse `HEAD`, `HAIR`, `BEARD` — the three paths `_pybuild.mjs` fits from the frozen mask. Any path authored as a polygon declares its corners and is exempt; a path with no declaration is scored whole | **0 knots turning > 75°** | §3 typical |
| D8 | containment | both | % of drawn path length outside the field circle, **and the deepest breach in viewBox units** | `EDGE.penny.field` frozen HERE as literals: **icon 42.5, mid 40.5, full 41.0**; sizes 26/38/44/54/76/84/120/190/380 | **0.00% at every tier, both sides**, and the depth reported beside it | §3 typical. ~~Round 1 on the quarter proposed exempting breaches shallower than the file's 0.01-unit coordinate quantum; that proposal is **in force** (§3's D8 row), so a breach shallower than 0.01 units is reported at its depth and does not count against the fraction~~ — **CORRECTION, see below** — **and the raw fraction is still printed unrounded** |

> **CORRECTION to the D8 row, written before the value was scored and recorded
> here rather than by rewriting the row above.** I read Appendix Q3's sub-quantum
> exemption as adopted. It is not. Appendix Q's preamble says §3's D8 row gained
> the **depth**, and the body's D8 prose says in as many words that a 0.00 %-gate
> failure at 0.0038 units and one at 1.4698 units are "**both `FAIL` … and both
> should be**". Q3 itself is explicit that it is "stated as a *proposal*, not
> applied". Since the briefing for this round told me the cent's obverse figure
> before I wrote this file, adopting the softer reading would be the exact move
> §8 forbids. **The gate of record is 0.00 % of drawn length outside the field
> circle at every tier, both sides. The depth is reported beside it for
> ranking, and it does not excuse the fraction.**
| D9 | well-formedness | both | `undefined`/`NaN`/`Infinity`/`null`/empty attribute over every id × side × size × value | all five ids, both sides, 9 sizes, value on/off | **0** | §3, blocking |
| D10 | tier behaviour | both | ink fraction at each box width at its real device pixel count; the jump across a tier boundary against the within-tier jump distribution, with the **numerator in absolute Δink** beside the ratio | sweep **26 … 200 step 2**, declared here as a literal. 26–120 is NOT used: round 2 found a real within-tier pop sitting permanently outside that window | boundary jump ≤ **4×** the 90th-percentile within-tier jump, **and** the absolute Δink reported; a ratio may not be recorded as improved unless the numerator moved (Appendix R2) | `quarter-gates.md` D10, inherited; the window is widened for the stated reason |
| D11 | discriminability | both | `_x6lib` MAD, greyscale, all coins at equal width | **icon tier, 26 px**, frozen | **round 0 establishes the baseline**; and the §17 **set** gate (reverse minimum ≥ 3× the obverse minimum) is reported with its own verdict and `ESCALATE` (§6.2) | §3 / §6.2 |
| D12 | looked at | both | the judge reads the render with the Read tool, **with a control rendered FIRST** | 26 / 44 / 84 px at the real device pixel count, nearest-upscaled, beside the photograph reduced to the same pixels | **must have happened**, the control named, and what was seen written down | §3 / Appendix Q5 |
| D13 | device against field | both | mean ÷ field and ink fraction over the disc interior, ours vs the photograph reduced to the SAME device pixel count | disc interior **r < 40 viewBox units** (`RAD=40`), ink threshold **0.85 × field** (frozen in `_x6dark.mjs`), tiers **26 / 44 / 84 px** | **\|Δ mean/field\| ≤ 0.05 at each tier** | §3's D13 row, typical |

## Instrument sanity (§4, §4.1, §4.2, §4.3) — stated before running

A number whose tool fails these is `UNTRUSTED` and blocks like `FAIL`.

| instrument | response test | null test (bounds printed) | selection test (whole candidate set) | located feature drawn? |
|---|---|---|---|---|
| D1 IoU | shift `OBVERSE.penny.cx` by +1 unit → IoU must fall 0.01–0.05 | n/a (no search) | n/a | mask over the reference already published (`_pyover.mjs`); re-published this round |
| D2 segmenter | threshold sweep must move the contour | the sweep window is printed; a contour at a window end is a failure report | the component chosen out of all components is printed | **yes — the contour on the source, and I look** |
| D3 tone | (a) flat swatch of every penny palette colour through `_pylib.ourRaster` returns that colour's own grey; (b) a structural change to a hair fill must move ≳0.02 | n/a | n/a | patches over the reference |
| D4 count | synthetic combs of 9 and 13 return 9 and 13; a flat profile returns 0 | prominence and window printed | every extremum printed, not only the chosen ones | **yes — the counted centres on the source** |
| D5 unwrap | not a detector: it is the coin redrawn in (angle, radius) with a labelled ladder. The reading is by eye off the picture (Appendix R3, §2.1) | n/a | n/a | **it IS the picture** |
| D5-HF | a synthetic ring of angular stripes must raise HF; **reference-invariance**: the reference's own HF must be bit-identical across two revisions of our art (§6.1) | n/a | n/a | the sampled annulus drawn on both |
| D6 width ratio | taper one mark in a generated copy → the fraction must fall | n/a | the full mark list with each ratio printed | the flagged marks listed by id |
| D7 knot turn | closed form: a square corner reads 90.000° | n/a | n/a | the worst knot's coordinates printed |
| D8 containment | move one mark 20 units outward in a generated copy → % outside goes 0 → clearly non-zero | n/a | **the full field-circle candidate set printed; throws on ambiguity** (this is the v2 correction; v1 is retired and must not be imported) | the breaching marks named with their max radius |
| D9 sweep | inject `undefined` into one emitted attribute → caught, and the render named | n/a | n/a | n/a |
| D10 tier | move `EDGE.penny.field.mid` 40.5 → 34.0 in a generated copy → the boundary jump becomes the largest in the band | the sweep window printed | n/a | the ink-fraction curve printed in full |
| D11 matrix | `_x6sens.mjs` + `_x6check.mjs` as those tools state | n/a | the whole 8×8 matrix printed | `_x6grid.mjs` icon sheet |
| D13 | `_x6check.mjs` palette round-trip; the recovered field level must be the palette's own grey (148 on the cent) | n/a | n/a | the reduced reference beside ours |
| disc fits | three strategies per reference, all printed | the ray search window printed; edges at the window end dropped and counted | **every strategy's answer for every reference**, not only the chosen one | **yes — every fit drawn on its own source before any value derived from it is recorded** |
| independence | a control pair of two different designs | NCC is bounded [−1,1]; a value at a bound is a failure report | the whole matrix printed | n/a |
