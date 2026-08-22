# buck, round 1 — the obverse portrait vignette (SPECIALIST report)

**Subject:** `buck` obverse, the portrait vignette only.
**Dispatch commit:** `d2353ca` (v1.70.0).
**Nothing here is a verdict.** The judge re-derives every number.

---

## 0. Harness

The fresh worktree checked out `be6cb73` (v1.54.0), not the dispatch commit —
**fast-forwarded to `d2353ca` before anything was measured**, and every number
below is from that tree. Gitignored inputs linked with `_jx0link.mjs`.

Frozen set at start: **765 checked, 0 CHANGED.**
Frozen set at end: **765 checked, 1 CHANGED — `coloringbook/_x6-run.json`**, which
the coordinator flagged mid-round as a run artefact `_x6mat.mjs` rewrites
unconditionally, and whose stored hash `93252d…` was already stale at dispatch
against the deterministic actual `0e3f23…`. The other **764 are unchanged**.
`_x6mat.mjs` is a symlink, so that write landed in the main checkout.

D11 was therefore **not** taken from `_rescore.mjs` (which invokes `_x6mat.mjs`
through the symlink and measures the main checkout's art). It was taken from
`_jb11d11.mjs`, which is a real file in `judge/` and imports
`../../src/art/coins.js` relatively — i.e. this worktree.

---

## 1. What was wrong, and it was wrong in kind

The oval contained `HEAD.Washington` — **the quarter's traced left-facing
PROFILE** — scaled 0.3333 and translated in, with `struck()`'s bevel over it.
It rendered as a featureless blob at every tier.

Both obverse photographs show a **near-frontal bust**: wig curls on both sides,
a dark coat, a light jabot at the throat. No transform of a profile is a
frontal head. This is the same class of error as the pointed pyramid and the
circular roundels, and the tell was in the old comment itself — it reasoned
about a bbox running *"local x −30.2..+22.5, because Washington faces left"*.

---

## 2. What is drawn now

Five fills and nine small ellipses, all in **absolute viewBox units** with no
group transform (the old placement error lived entirely in reasoning about
`translate(51.5 27.63) scale(0.3333)`).

| mass | element | tiers | tone |
|---|---|---|---|
| head + wig | path, 25 knots | all | `cloth` |
| throat | path, 7 knots | all | `cloth` |
| face | path, 17 knots | mid, full | `body` |
| coat (closes on the frozen oval with 4 exact arcs) | path, 16 knots | all | `ink` |
| jabot | path, 11 knots | mid, full | `field` |
| 2 brows, mouth | ellipse | full | `rim` |
| nose shadow, 3 curl notches | ellipse | full | `motif` |
| 2 eyes | ellipse | full | `ink` |

Generator: **`coloringbook/judge/_sw7gen.mjs`**; `_sw8sync.mjs` copies its
output into the art and is idempotent (`5 paths, 0 changed` on the shipped
tree, i.e. the art and the generator agree exactly).

`struck()` is **no longer called** on this face. A note is intaglio-printed,
not struck; neither photograph shows a directional lit edge on the vignette,
and `struck()`'s `deep` layer is dead paint at mid and full by its own note.
No shared helper was touched.

### Scale, stated because the brief asked

One viewBox unit is **2.356 device px at 190, 1.042 px at the 84 naming draw,
0.670 at 54, 0.471 at icon**. The oval is 19.5 × 28 units, so the whole
portrait is **20 × 29 device px at the draw a child is asked to name** — about
an eighth of the area the quarter gives its head. That is why the tiers buy
masses first and features only at `full`.

### Tone: the order is the note's, the spacing is not

`_sw6tone.mjs` reads both photographs inside the frozen oval. The ordering is
identical on both: wig crown and face 1.29–1.52 × the oval ground, jabot
1.23–1.34, wig rolls 1.07–1.24, **coat below the ground at 0.71–0.94**. So the
note is a LIGHT device on a DARK ground and ours was the reverse.

| mass | note (mean of 2 refs) | ours | palette |
|---|---|---|---|
| face | 1.33 | 1.59 | `body` |
| jabot | 1.29 | 1.74 | `field` |
| wig | 1.16 | 1.36 | `cloth` |
| **ground** | 1.00 | 1.00 | `motif` |
| coat | 0.83 | 0.51 | `ink` |

Every ratio is stretched **away from 1.0**, uniformly in direction, because the
note carries a 1.16× step on a 300-dpi engraving and at the naming draw one
viewBox unit is one device pixel. `PALETTE.buck` is untouched.

---

## 3. Gates, before → after, re-measured on this tree

The "before" column is `d2353ca`'s own art, measured by the same instruments
after temporarily restoring it (SHA-verified back afterwards), **not** quoted
from the r0 scorecard, which is at `c0ff971`.

| dimension | before | after | note |
|---|---|---|---|
| **D1 obverse** (vignette IoU) | 1.0000 | **1.0000** | the two `<ellipse>` elements are untouched |
| **D6 obverse** icon | 75.2 / 298.9 = 25.15% | **75.2 / 265.9 = 28.28%** | numerator **bit-identical** |
| D6 obverse mid | 75.2 / 362.5 = 20.74% | **75.2 / 311.0 = 24.18%** | numerator bit-identical |
| D6 obverse full | 75.2 / 362.5 = 20.74% | **75.2 / 350.7 = 21.44%** | numerator bit-identical |
| **D7 obverse** (fitted-only) | 71.0°, 0 over 75 | **51.6°, 0 over 75** | numerator moved; real |
| D7 obverse (overall) | 0 over 75 | **2 over 75, worst 130.6°** | see below |
| **D8 obverse** | 0.0000%, depth 0.0000 | **0.0000%, depth 0.0000** | every tier, value on and off |
| **D9** | 0 | **0** | 120 + 30 renders clean |
| **D10 obverse** 43→44 | 0.04234 abs = 0.96× | **0.04090 abs = 0.94×** | PASS |
| D10 obverse 75→76 | 0.03823 abs = 0.87× | **0.03734 abs = 0.85×** | PASS |
| **D11** set minimum | 0.0534 nickel.o/dime.o | **0.0534, unchanged** | note's own worst pair 0.0735 → 0.0717 |
| D11 §17 set ratio | 1.49× | **1.49×** | ESCALATE, pre-existing |
| **D13 obv** portrait icon | +0.0792 | **+0.0973** | **regressed 0.018** |
| D13 obv portrait mid | +0.0705 | **+0.0654** | improved |
| D13 obv portrait full | +0.0984 | **+0.0844** | improved |
| D13 obv frame icon | +0.1192 | **+0.1270** | regressed 0.008 |
| D13 obv frame mid | +0.0834 | **+0.0812** | improved |
| D13 obv frame full | +0.1089 | **+0.1033** | improved |

**Byte-identity partition:** 120 renders (5 ids × 2 sides × 6 sizes × value
on/off = 120 via `_sw9ident.mjs`), **12 changed, all `buck.obverse`**; 0 of 12
on `buck.reverse` and 0 of 12 on each of the eight coin faces.

### D6 is a denominator move and no improvement is claimed

The **entire D6-obverse numerator is the vignette ellipse's own stroke, 75.2
units, and it is bit-identical before and after.** The fraction got *worse*
purely because the denominator shrank: the old drawing emitted `HEAD.Washington`
**three times** (bevel + `deep` + `motif`), and the new one emits each mass once.
Per the common brief's rule 3 applied symmetrically, **no regression is charged
when only the denominator moved** — and equally none of the mid/full movement
is claimed as anything.

### D7's two over-75 chord turns

Both are in **declared polygons** (≤ 20 knots), which `_jb8geom.mjs` excludes
from the fitted-only column that carries the gate — the same treatment the
note's reverse already gets at 33 over-75.

- **130.6° at (59.51, 33.69)** — the coat's shoulder meeting the frozen oval,
  where the ellipse's tangent is near-vertical, so a near-horizontal shoulder
  genuinely turns ~110°. It sits under the vignette rule's own 1.4-unit stroke
  at every tier. Splitting the closing arc into five instead of three buys
  130.6° → 124.0° and pushes `coat` to 18 knots, two short of the line where
  the instrument reclassifies it as *fitted* and starts scoring it. **Rejected:
  buying 7° on a chord artefact by moving a path toward a reclassification
  boundary is not a trade worth making.**
- **91.9° at (53.15, 31.1)** — the throat's shoulder, completely covered by the
  coat at every tier.

### D13-icon is a real regression, not an artefact

Ours is lighter than the note in every window, before and after; the gate is
|Δ| ≤ 0.05 and every row FAILs both ways. Four of six rows improved and two
regressed, the worst being the icon portrait window at +0.018. Cause: the old
icon drew a large `deep` head on a `field` ground (ink 0.333); the new one
draws a light head on a `motif` ground with only the coat dark (ink 0.256,
against the note's 0.376).

Five ground/coat pairs were swept (`_swAsweep.mjs`, `_swout/_swA-sweep.png`).
Going darker improves D13 **monotonically and by at most 0.014 across the whole
range** — the D13 failure is dominated by the note's overall lightness, which
is a settled owner decision, not by anything this round chooses.

---

## 4. Rejected, including the things that scored better

- **`rim` for the coat.** `rim`'s ratio 0.72 is the CLOSER of the two to the
  note's measured 0.83; `ink` at 0.51 is further. `ink` was taken anyway
  because it is the only pair in the sweep where the coat still separates from
  the ground at icon. It also happens to score ~0.010 better on D13 and **that
  is not why**.
- **`body` for the icon head.** 31 more grey levels against the ground; reads
  no better at 9 × 13 px, introduces a tone change across the icon/mid
  boundary, and costs 0.012 on D13's icon portrait window. `cloth` shipped.
- **A shadowed side of the face** (`SHADE_REJECTED` in `_sw7gen.mjs`). It is in
  both photographs. The palette has no step between `cloth` 186.6 and `body`
  217.7 to put it in, so in the wig's own tone it was indistinguishable from
  moving the wig/face boundary right, and the face rendered as a narrow strip.
  It scored no gate either way; it just looked worse.
- **The lapel V.** The note has one, 1.5 units deep = 1.5 device px at the
  naming draw, and at icon (where the jabot is not drawn) the throat showed
  through the notch as a pale spike below the coat. A feature that cannot
  resolve and breaks the tier below it is not a feature.
- **Three curl notches as 4-point paths.** A 4-point closed loop turns ~90° at
  every corner by construction; as paths they put **eleven** over-75 chord
  turns into D7's obverse table for three sub-2px marks. Drawn as `<ellipse>`,
  which is also the honest shape for a 1.7 × 1.1 px mark.

## 5. Iterations that got worse, recorded as required

1. Silhouette run from the jaw into the throat — the overlay showed it slicing
   the lower half of the face off. The chin is interior on a frontal portrait.
2. Wig drawn as one smooth lobe — rendered as a bald dome. Scalloping the
   silhouette did not survive (0.4-unit notches with the same colour on both
   sides of the edge); the separations had to be cut *into* the mass.
3. Face, throat and jabot all in `body` — the three fused into a single pale
   wedge from the hairline to Y 41. A goatee, and the r14 tuning fork in a new
   place. Fixed by giving the throat `cloth` and the jabot `field`, both of
   which are what the note does.
4. Head's cheek corner at 78.2° and then 94.2° over the D7 gate before landing
   at 51.6°.

---

## 6. Instrument faults found — reported, NOT fixed (§1.1)

### F1. `_jb14d1.mjs` cannot measure D1 at all

```js
const OURS = { cx: 34, cy: 28, rx: 17, ry: 21 };
```

That is a frozen literal of a drawing **superseded in v1.63.0**, and the file
never imports `coins.js`. It prints `IoU 0.1496 FAIL` whatever the art says,
and it fails §4's response test *by construction*: perturb the artefact and the
number cannot move. Reproduction without trusting this report: run it on any
tree, at any commit, and compare its `ours` line to the `<ellipse>` the art
actually emits.

The evidence was already in the judge's own output — the scorecard's D1 locus
names `cx 50.05 cy 30.30 rx 9.75 ry 14.00` and the instrument's `ours` line
prints `34 / 28 / 17 / 21` two lines below it.

Re-derivation in `_swBd1.mjs` (parses the emitted SVG, runs the selection test
over both emitted ellipses, and the response test): **D1 obverse = 1.0000 at
sizes 26/38/54/84/190**, unchanged by this round.

### F2. D9's response test no longer covers the note

`_jb9well.mjs` perturbs `HEAD.Washington` and its own output says *"the note is
one of them, which is the point of the sweep"*. The note no longer uses that
symbol, so the test now reports **44 failures over 120 renders, ids affected:
quarter** where it used to report 88 across two ids. The test still fires and
D9 is still swept over all 120 renders; only that particular coupling is gone.
`VIGNETTE.head` would restore it.

### F3. `_jb8geom.mjs` prints its own D8 response test as UNTRUSTED

`RESPONSE TEST — move the eagle roundel cx 70 -> 86: … *** DID NOT MOVE —
instrument UNTRUSTED ***`. Pre-existing, unchanged by this round, and it is
printed on every run including the ones whose D8 numbers are quoted above.

### F4. `_jx0link.mjs` leaves an untracked `node_modules` in the worktree

`.gitignore:1` is `node_modules/` with a trailing slash, which does not match a
symlink named `node_modules`. It shows in `git status` as untracked and could
be committed by accident.

---

## 7. What could not be determined

- **Whether the drawing is right to a unit.** `_sw5seg.mjs` segments the light
  head-and-wig mass on both obverse photographs inside the frozen oval; they
  disagree by **0.90 units in X on both edges** (`bill-obv.jpg` puts the figure
  0.9 right of `bill-obv-2.jpg`) and the two masks agree at only **IoU 0.582**.
  The obverse has no printed-border fiducial. The control points are read off
  `bill-obv-2.jpg`; against the other photograph the drawing sits about a unit
  left. **Nothing here claims better than a unit**, and the overlay is published
  on both references rather than on the one that flatters it.
- **A D2-obverse target for the vignette CONTENTS.** The brief asked for one.
  The Otsu segmentation is speckle-riddled by the engraved hatching, excludes
  the wig's darker lower rolls and the jabot entirely (see the overlay), and the
  two photographs agree at IoU 0.582 — **a target that disagrees with itself by
  0.42 IoU cannot score art to 0.05**, so I did not freeze one. The masses are
  laid out from the ladder instead. Whether that is `BLOCKED` (needs a better
  obverse photograph, or a border fiducial) or `UNMEASURED` is the judge's call.
- **Whether a child reads it as Washington.** Out of scope for any instrument
  here (§8).

## 8. Cross-side observation, not mine to act on

The note's obverse now has a **dark** vignette ground with light devices; its
**reverse** still has light devices on a light ground. At 26 and 38 px the two
sides of the same note read at very different weights. That is the reverse's
row, not this one's, and no reverse byte was touched.

---

## Artefacts and their generators (§4.3)

| artefact | generator |
|---|---|
| `_swout/_swC-control.png`, `_swC-buck-obverse.png` | `_swCd12.mjs` |
| `_swout/_sw1-buck-obv.png`, `_sw1-vig-{38,47,84,190}.png` | `_sw1look.mjs` |
| `_swout/_sw4-ladder-ref2.png` (1-unit ladder + frozen oval) | `_sw4ladder.mjs` |
| `_swout/_sw5-seg-*.png` (two-reference segmentation) | `_sw5seg.mjs` |
| `_swout/_sw7-over-ref1.png`, `-ref2.png` (masses on both sources) | `_sw7gen.mjs over` |
| `_swout/_swA-sweep.png` (five ground/coat pairs) | `_swAsweep.mjs` |
| the tone table | `_sw6tone.mjs` |
| D1 re-derivation | `_swBd1.mjs` |
| byte-identity partition | `_sw9ident.mjs` |
| every path in the art | `_sw7gen.mjs` + `_sw8sync.mjs` |

`TEST_PORT=4195 PORT=8105 npm test` — **459 passed (10.5m), exit 0.**

The build in that run started from `coins.js` at `b22b6d49…`; the shipping file
is `cf02e60a…`. `_swDcmp.mjs` shows the two are **CODE IDENTICAL — every
difference is on a comment line**, and `_sw8sync.mjs` plus `_sw9ident.mjs`
both report no change to the emitted strings, so the suite's result holds for
the shipping tree.

An earlier run of the suite was **discarded rather than reported**: `coins.js`
was swapped to the base revision for about fifteen seconds mid-run in order to
take the "before" D11 numbers, so nothing that run said could be trusted either
way. It was stopped and re-run clean.

---

## Postscript — sync integrity

`_sw8sync.mjs` now also VERIFIES the nine full-tier ellipses against
`_sw7gen.mjs`'s `ELLIPSES` and throws on drift, so all fourteen marks in the
vignette have one source. On the shipped tree it reports:

```
synced 5 paths (0 changed) into src/art/coins.js
verified 9 full-tier ellipses identical to _sw7gen.mjs ELLIPSES
```
