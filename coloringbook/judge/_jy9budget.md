# Cent obverse, mid-jaw whisker round — INK BUDGET AND BASELINES

Written **before** `src/art/coins.js` was edited, and before the mid-jaw patch
was scored on any revision other than the untouched tree. Nickel N1: a budget
written after the values is not a budget. The tree is `8578995` (v1.66.0) and
every number below is this round's own re-derivation on that tree, with the
generator named beside it. The judge re-derives all of them; nothing here is a
verdict.

## Frozen artefacts

710 of 710 listed in `hashes-v166.txt` byte-identical at the start of the round
(`judge/_jx1hash.mjs`). `_tonepatches-penny.json` is one of them and is **not**
edited: the new patch is written to its own file.

## The new locus, placed before any scorer existed

`judge/_jy0tonepatch-midjaw.json`, sha256
`22cb4d754a95208bc4ebd658f2361d7c5d709d91189ba2856e6141cd2f173f88`, written by
`judge/_jy0freeze-midjaw.mjs`, which **refuses to overwrite** (verified: second
run prints `REFUSING` and exits 1).

- `jawMid`, local **(2.25, 8.0) r 2.6** — the exact midpoint of the frozen
  `cheek` (8.5, −1.5) and `beardJaw` (−4, 17.5) centres, radius 2.6 as both of
  them carry. Derived from the TARGET's own frozen loci; the writer never reads
  `src/art/coins.js` (§6.1).
- Wholly inside `_headmask-penny.json` (centre + 48 boundary samples).
- Clear of all 12 existing patches; nearest centre distance 9.25 (`lips`)
  against a touching distance of 3.8.
- Overlay drawn on both struck references and looked at:
  `_pv/_jy1lad-patch-penny-obv-3.png`, `_pv/_jy1lad-cross-penny-obv-3.png`.

## Baselines on the untouched tree

| quantity | baseline | generator |
|---|---|---|
| D3, frozen 11-patch locus, mean \|Δratio\| | **0.1596** (worst 0.3726 `coat`) | `_jy6tone.mjs` — reproduces penny-r0's published 0.1596 |
| `jawMid` ratio, coin (`penny-obv-3.jpg`) | **1.0603** | `_jy6tone.mjs` |
| `jawMid` ratio, 1909-S (`penny-obv.jpg`) | **0.7989** | `_jy6tone.mjs` |
| `jawMid` ratio, OURS | **1.0000** | `_jy6tone.mjs` |
| `jawMid` \|Δ\| vs reference of record | **0.0603** | `_jy6tone.mjs` |
| D13 obverse Δ mean/field, 26 px | **−0.2537** (FAIL) | `_jp13d2d13.mjs` |
| D13 obverse Δ mean/field, 44 px | **−0.0464** (PASS) | `_jp13d2d13.mjs` |
| D13 obverse Δ mean/field, 84 px | **+0.0017** (PASS) | `_jp13d2d13.mjs` |
| D10 obverse 42→44 **d(ink) absolute** | **0.1921** (24.64× p90) | `_rescore.mjs` |
| D8 penny obverse worst fraction / depth | 0.0000% / 0.0000 | `_rescore.mjs` |
| D9 | 120 renders clean | `_rescore.mjs` |
| D11 set minimum / rev-obv ratio | 0.0534 / 1.49× | `_rescore.mjs` |
| D7 `BEARD` worst tangent turn | **85.0° at knot 7** (1 over gate) | `_jd7fitted.mjs` |
| our BEARD top edge, local y at x −8/−4/0/+4/+8 | **5.15 / 7.60 / 9.80 / 11.75 / 12.90** | `_jy4ours.mjs` |

The last row re-derives, with a generator, the "ours 4.9 / 7.3 / 9.8 / 11.8 /
12.9" that `coins.js` states in prose. It agrees to ≤ 0.30 local units.

## THE BUDGET

Stated as absolute numerators (Appendix R2), one-sided where the gate is.

1. **D13 obverse at 44 px is the binding constraint.** Baseline −0.0464 against
   ±0.05 leaves **0.0036** of margin. The round may spend at most **half** of
   it: Δ mean/field at 44 px must stay **≥ −0.0482**. If a candidate needs more,
   it is refused and the trade is published rather than taken.
2. **D13 obverse at 84 px** must stay ≥ −0.0500 (baseline +0.0017, 0.0517 of
   room). Not expected to bind.
3. **D13 obverse at 26 px must be byte-identical**, because `BEARD` is gated on
   `!icon` and is not emitted at the icon tier at all. Identity here is **by
   construction, not by measurement**, and is reported as such.
4. **D10 42→44 d(ink) absolute must not exceed 0.2000** (baseline 0.1921, i.e.
   at most +0.0079). Prediction, written before measuring: this should barely
   move, because the ink threshold is 0.85 × p90 field = ~128 and the cheek this
   round darkens is already `motif` = grey 99, i.e. **already counted as ink**.
   Turning already-ink pixels darker changes the ink *fraction* not at all and
   the *mean* continuously — which is why 1 binds and 4 does not. If d(ink)
   moves, the ratio may not be reported as improved unless the numerator moved.
5. **D3 at the frozen 11-patch locus must not rise above 0.1596.**
6. **`jawMid` must not get worse against the reference of record by more than
   0.05** (baseline 0.0603).
7. **D1, D8, D9, D11 must not regress**; `BEARD` knot 7 must still read exactly
   **85.0°** (it is another round's subject, see below) and no NEW knot may
   exceed 75°.

## Knot 7 — checked, and NOT mine

`BEARD` knot 7 is local **(−18.85, 4.00)**, the rear tip at the sideburn. The
mid-jaw region this round works in is local **x ∈ [−11, +8]**, so knot 7 is
**7.85 local units outside it** and is not touched. Concretely: the segment
`C -18.02 3.65 -17.2 2.95 -16.6 3.05` keeps its FIRST control point
`-18.02 3.65` unchanged, which is what fixes knot 7's outgoing tangent, and the
segment into knot 7 is untouched. Its 85.0° must therefore be bit-identical
after this round; if it is not, this round broke something.

## What the tone evidence says BEFORE the drawing moves — and the limit it sets

`_jy7probe.mjs` maps median/cheek over the jaw on both struck references:

| local (x, y) | `penny-obv-3.jpg` (record) | `penny-obv.jpg` (1909-S) |
|---|---|---|
| (−8, −4) / (−4, −4) | 0.734 / 0.653 | 0.718 / 0.787 |
| (−8, 0) / (−4, 0) | 0.950 / 0.874 | 0.638 / 0.626 |
| (−8, 4) / (−4, 4) | 0.869 / 1.015 | 0.718 / 0.776 |
| (0, 4) / (4, 4) | **1.065 / 1.045** | 0.718 / 0.569 |
| (0, 8) / (4, 8) | **1.030 / 1.075** | 0.816 / 0.816 |
| (0, 12) / (4, 12) | 0.678 / 0.985 | 0.724 / 0.810 |

Read before drawing: **the two struck references agree that the jaw BEHIND
x ≈ −2 is darker than the cheek (0.62–0.95 on both), and disagree in sign about
the jaw in FRONT of it** — the reference of record puts (0…4, 4…8) at 1.03–1.08,
*brighter* than the cheek, where the 1909-S puts it at 0.57–0.82. `jawMid` sits
at (2.25, 8), inside the disagreement, and its two struck values (1.0603 and
0.7989) fail §12.7's sign test.

So the budget carries one more line, and it is a shape line, not an ink line:

8. **The lift is rear-weighted and stops short of `jawMid`.** Darkening
   x ≤ −2 is supported by both struck references; darkening x ≥ +2 is supported
   by one and contradicted by the other, and §12.7 says a patch whose two
   independent references disagree in sign is not a target. A full closure of
   the shortfall would put `deep` (renders 0.61–0.72 of the cheek) where the
   reference of record reads 1.03–1.08 — a ten-fold worsening of `jawMid`, on
   the one photograph D3 is scored against. That is refused here, and the
   residual shortfall in front of x = 0 is published rather than closed.
