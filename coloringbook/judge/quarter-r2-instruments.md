# Quarter — round 2, JUDGE-SIDE INSTRUMENT WORK

2026-08-13. No art was scored and no verdict on the coin is issued here. This
is the judge discharging the four items round 1 routed to *itself*: three
`BLOCKED` dimensions waiting on an acquisition, one `UNMEASURED` dimension
waiting on judge work, and one gate that could not rank.

A specialist held `src/art/coins.js` for the whole of this session. It was
never opened, never edited, and every number below that touches it was taken
from `git show HEAD:src/art/coins.js` (`0b9e5303…`), not the working tree.
`git status --porcelain` at the end of this session: `M src/art/coins.js`, and
nothing else.

---

## 0. Summary

| item | round 1 | round 2 | changed by |
|---|---|---|---|
| D2 reverse silhouette | BLOCKED on a photograph | **still BLOCKED** — and the acquisition spec was wrong | measurement |
| D4 reverse rhythm | BLOCKED | **still BLOCKED** — but *not* `N/A`; the subject exists | measurement |
| D5 band, reverse | BLOCKED on a photograph | **still BLOCKED** — by the DESIGN, not the photograph | measurement |
| D3 reverse tone | UNMEASURED (judge work not done) | **target built and frozen; still not gateable** | the work was done |
| D8 depth term | one number, 400× apart in severity | **derived, hashed, measured, confirmed** | new instrument |

Three findings contradict what I was told going in. They are in §6.

---

## 1. Are the new references independent? Mostly no.

`_jq20indep.mjs`, sha256 `80aec1aa…`.

Round 1 was told four quarter-reverse references now exist. **Two of the four
are not usable and one is not even the right coin.**

### 1.1 Disc fits (§2.1)

| file | size | disc fit | p95 boundary residual |
|---|---|---|---|
| `quarter-rev.jpg` | 500×375 | cx 242.34 cy 199.14 R 228.21 | **25.90% of R** |
| `quarter-rev-2.png` | 750×749 | cx 374.50 cy 374.37 R 374.98 | 0.15% of R |
| `quarter-rev-3.jpg` | **2000×2000** | cx 999.50 cy 999.45 R 999.49 | **0.05% of R** |
| `quarter-rev-5.jpg` | 1024×768 | cx 497.05 cy 409.21 R 467.94 | **25.94% of R** |
| `quarter-rev-6.jpg` | 1000×665 | cx 495.11 cy 345.90 R 274.96 | 0.58% of R |

`quarter-rev-3.jpg` is the best disc fit in the entire `ref/` directory, on
either side, on any coin. `quarter-rev.jpg` and `-5.jpg` are shot obliquely at
26% of R — §2.1 says *do not correct for it, get a better photograph*.

### 1.2 Correlation, with controls

Raw disc-normalised NCC inside 0.90R, and a registered design-NCC on blurred
|grad| energy (rotation −8…+8°, translation ±0.03R, both refined). Controls:
`nickel-rev-2.png`, `penny-rev-2.png`, `dime-rev-2.jpg` — known different
designs, which set the floor at **0.1977**.

| pair | raw NCC | registered design-NCC | verdict |
|---|---|---|---|
| `quarter-rev.jpg` vs `quarter-rev-5.jpg` | **0.9850** | **0.9950** | **the same photograph** |
| `quarter-rev-2.png` vs `quarter-rev-3.jpg` | 0.1409 | **0.5091** (at rot 0.5°) | independent, same design |
| every other pair | ≤ 0.06 | ≤ 0.20 | different design / unregistrable |

`quarter-rev-6.jpg` is a **Nebraska 2006 state quarter** — sun, wagon, Chimney
Rock. It is not the Washington eagle reverse and is not a reference for this
coin at all. I saw that before I measured it, by looking; the numbers agree.

**So the acquisition delivered ONE new usable reference, not three.** It is a
good one, and the quarter reverse now has two genuinely independent
photographs for the first time — which is what made §12.7's sign test possible
in §4 below.

### 1.3 An instrument that was wrong, caught by looking

The first cut of `_jq20indep.mjs` used raw grey NCC alone and called
`rev-2` vs `rev-3` **"NOT the same design"** at 0.1409. I had already opened
both files and seen two Washington eagle reverses, so I knew the answer was
wrong before I could be misled by it. Its own §4 response test says why: on
`rev-3` a shift of 0.01R costs 0.55 of correlation, so the statistic is
registration-limited and two honest photographs at 2° of relative rotation
score like two different coins. Raw NCC answers *"is this the same
photograph"* — which it does very well, 0.985 against a 0.14 ceiling — and it
does not answer *"is this the same design"*. Those are two questions and they
now have two statistics.

---

## 2. D2 — reverse silhouette. STILL BLOCKED, and the acquisition spec was wrong.

`_jq21seg.mjs` (`261d71f5…`), `_jq21probe.mjs`, `_jq21grey.mjs`,
`_jq21agree.mjs`, `_jq21dev.mjs`, `_jq21ctl.mjs`.

**The gate for freezing was stated before any value existed** (`_jq21stab.mjs`
header): freeze only if the minimum pairwise contour IoU across swept
thresholds is ≥ 0.97 — i.e. the target's own ambiguity is at most 0.03, under
half the 0.05 the D2 gate is asked to resolve — and only if two segmenters
agree with each other at ≥ 0.95.

### 2.1 What was tried

| family | knobs swept | result |
|---|---|---|
| energy flood (round 0's method) | T 2.0…4.0 | area 6.54% → 0.44% of disc, monotone, no plateau |
| barrier map `{Bar > T}` | T 2.0…8.0 | **bit-identical to the flood at equal T** |
| energy flood + ridge dilation | dilation 0…12 px × T 0.5…8.0, 60 combinations | area 64.26% → 0.73%, monotone |
| illumination-flattened level | σ 0.05/0.10/0.20 R × T 0.90…1.10, both polarities | area 1.5% → 58.6%, monotone |

Two of those rows are findings in their own right:

- **The barrier map is not a second method.** `{Bar > T}` is by construction
  exactly the set the flood at T fails to reach, and it returned bit-identical
  results (F2/B2, F3/B3, F4/B4 all IoU 1.0000). §4's rule — *two bit-identical
  answers from two different inputs is not agreement* — applied here means the
  two "methods" are one method. I had claimed method-independence in the file
  header before running it; it was not true, and the run said so.
- **The 64.26% "plateau" is the guard region.** Computed independently in
  `_jq21grey.mjs`: the guard's own area is 2 016 718 px = 64.26% of the disc.
  The flood at low T never enters at all, so the "stable" answer *is* the
  search bound. §4.1.
- **Both polarities produce a plausible-sized mask.** "Device brighter than
  local mean" gives 34–46% of the disc; "device darker" gives 39–52%. A
  segmenter that answers plausibly whichever way you point it is reporting the
  knob.

### 2.2 The self-agreement numbers

Contour-vs-contour IoU across the segmenter's own knobs, the same currency
round 0 reported:

| | round 0 (`rev-2`, energy flood) | round 2 (`rev-3`, level family) |
|---|---|---|
| **field** side | — | 0.7217 … 0.8885 within one polarity; 0.2986 … 0.9231 overall |
| **device** side (what D2 scores) | **0.4705 … 0.6869** | **0.2770 … 0.7786** |

IoU is not complement-invariant, so scoring the field's agreement and reporting
it as the device's would have flattered the result by 0.4. The device number is
the one that counts and it is **worse** than round 0's.

The target's ambiguity is 1 − 0.2770 = **0.7230, i.e. 14.5× the 0.05 the D2
gate is asked to resolve.** Nothing was frozen. `_jq-rev3-device.png` shows
why: not one candidate is the eagle.

### 2.3 Why — and this is the part that contradicts round 1

Round 1 named the acquisition as *"a square-on, evenly-lit quarter reverse
photograph with the device separable from the field."* `quarter-rev-3.jpg` **is
square-on** (0.05% of R, the best fit we hold) **and evenly lit**, and it fails
anyway. The spec was incomplete.

The discriminating quantity is the shape of the in-disc grey histogram
(`_jq21ctl.mjs`):

| reference | Otsu separability | **valley depth** | area drift over ±30 grey levels |
|---|---|---|---|
| `dime-obv-2.jpg` — §2.2's worked example | 0.8546 | **0.8276** | **7.0%** ← a target can be cut here |
| `nickel-rev-proof.png` — cameo proof | 0.8222 | 0.2178 | 42.4% |
| `nickel-obv-proof.png` — cameo proof | 0.7427 | 0.1113 | 141.4% |
| `quarter-rev-3.jpg` | 0.6520 | **0.0822** | 152.0% |
| `quarter-rev-2.png` | 0.6548 | **0.0485** | 193.0% |

Otsu separability barely discriminates (0.65 vs 0.85). **Valley depth
discriminates by a factor of ten.** The physical fact: on a struck circulation
coin lit diffusely, the device and the field are *the same metal at the same
reflectance*, and the flat top surfaces of the relief are exactly as bright as
the field beside them. The only signal is shading at the edges, which vanishes
wherever an edge runs parallel to the light. There is no threshold because
there are not two populations.

**The acquisition D2 needs, stated properly:** a photograph in which device and
field differ in **reflectance**, not in shading — a frosted/cameo proof against
a **dark** field, of the kind `dime-obv-2.jpg` is. The test to apply to a
candidate before adopting it is one line: in-disc grey histogram valley depth
≥ 0.5 and level-sweep area drift ≤ 15% over ±30 grey levels. Failing that,
photometric stereo (the same coin under ≥3 known light directions) or the
artist's model (§11.1).

> A methodological note I owe: my first control was the same energy-flood
> instrument run on a cameo proof, and it failed there too — which said nothing
> about the quarter and everything about my instrument choice. §2.2's method
> for a frosted proof is a *level* threshold, because on a proof the two
> surfaces genuinely differ in reflectance. A control run with the wrong
> instrument is not a control. `_jq21ctl.mjs` v1 is superseded in place;
> v2 is what is quoted above.

---

## 3. D4 — reverse rhythm. STILL BLOCKED, and `N/A` is NOT available.

`_jq23count.mjs`.

Round 1 recorded D4-obverse as `N/A` ("no repeated element") and D4-reverse as
`BLOCKED`. I was asked whether `N/A` is the honest answer on the reverse. **It
is not.** I looked at `quarter-rev-3.jpg` at 2000px and there are three
candidate repeated elements, all visible in the published zooms:

1. **wing primaries** — long parallel grooves down each wing;
2. **wreath leaves** — olive leaves in pairs down two branches;
3. **arrowheads** — the tips at the left end of the bundle.

So D4 has a subject. The question is whether a **count** is resolvable, and
§15.1 is explicit: count it in the reference, twice, on two different
photographs, and write both counts down.

Counting the wing primaries (the most countable of the three) with a
plateau-safe zero-crossing counter — response test: synthetic combs of 9 and 13
flat-bottomed grooves return 9 and 13, a flat signal returns 0 —

| | r/R 0.450 … 0.800, 15 radii |
|---|---|
| `quarter-rev-3.jpg` | 12, 21, 17, 18, 20, 25, 20, 27, 26, 27, 28, 25, 25, 22, 19 |
| `quarter-rev-2.png` | 6, 5, 7, 8, 12, 9, 7, 5, 8, 8, 7, 10, 13, 11, 5 |

**Radii at which the two independent references return the same count: 0 of
15.** rev-3 spans 12–28, rev-2 spans 5–13; the modal values differ by 5×.
§15.1's threshold for a count error is *zero*, and a count this unstable cannot
carry a zero-error gate.

Verdict: **BLOCKED**, not `N/A`, not `UNMEASURED`. The acquisition is the same
one D2 needs, for the same physical reason — the grooves are relief, and on a
circulation strike lit diffusely their contrast is toning-dependent (rev-3 is a
toned coin and the counter is almost certainly picking up toning streaks as
grooves; rev-2 is too coarse and loses real ones).

A gate observation, offered as a proposal and not applied: §15 was written
*"for the architectural reverses"*, where the count IS the recognisable content
of the design. On an eagle the primaries are line-work texture, not structure,
and a zero-error count gate may simply be the wrong gate for a non-architectural
reverse. That is a re-derivation for a future round, with the derivation
written first (§8).

---

## 4. D5, the band half, reverse. STILL BLOCKED — by the DESIGN.

`_jq22band.mjs` (`3a62e61d…`), `_jq22sect.mjs`.

§22.8's method is a radial sweep of angular σ, taken *"in a sector where nothing
else lives"*, with the legend showing as a plateau between two low shoulders.

The published profile (`_jq22band.mjs` prints it in full, §4.3) shows there is
no plateau in the straight-up sector on either reference: σ is elevated
continuously from 28 to 43 viewBox units and then falls off a cliff at the rim.
The reason is structural — **the eagle's wings occupy every radius inboard of
the legend, so the inner shoulder does not exist.**

That could have been a fact about my choice of sector, so I swept all of them.
24 sector centres × 30° width × 2 independent references, acceptance stated
before any value existed: plateau contrast ≥ 1.8× (round 0 rejected 1.67 and
1.44) **and** the two references placing both band edges within 1.0 viewBox
unit.

```
plateau contrast over all 48 sector × reference combinations: min 1.17x  max 2.60x
sectors meeting BOTH conditions: NONE
```

The near-misses are instructive: sectors 300°, 330° and 345° agree between
references to 0.1–1.5 viewBox units but carry contrast 1.37–1.53 on `rev-3`;
sectors that reach contrast 1.8–2.6 on `rev-2` disagree with `rev-3` by 2–10
units. No sector is good on both axes at once.

Verdict: **BLOCKED**, and — unlike D2 — **not on an acquisition**. A better
photograph does not move the wings. What would settle D5-band-reverse is a
different *metric*: measure the legend band off the glyph geometry directly
(cap top and baseline radii per glyph, as `_jq5letter.mjs` already does for our
own art) rather than off an angular-σ plateau that this design cannot produce.
That is a metric re-derivation and belongs in a round of its own.

For the record, §22.8's published figure for this coin is `quarter ~ 35.7 ..
43.7` and carries a tilde. Nothing in this round supports tightening it.

### 4.1 Q4's failure mode, for the third time — and this time I drew it

The band finder's chosen runs are **interior** to their bounds on both
references, so they pass §4.1's null test cleanly. They are still the wrong
feature, and the picture is unambiguous (`_jq-rev-band.png`):

- the **top** band, 36.54…37.84 viewBox, brackets **E PLURIBUS UNUM** — the
  inner legend — not `UNITED STATES OF AMERICA`;
- the **bottom** band, 30.08…33.49 viewBox, brackets the **wreath** — not
  `QUARTER DOLLAR`.

Round 0's band finder locked onto the bust edge. Round 1's locked onto the bust
edge again. Round 2's locks onto a different legend and a wreath. That is three
rounds in which an in-bounds, response-tested, bound-checked detector returned a
confident answer to the wrong question, and in all three the thing that caught
it was **drawing what it found on the source and looking at it** (§4.3). The
degeneracy measure agreed each time — 1.33× and 1.38× here — but the degeneracy
measure alone would not have told me *which* feature it had found.

§22.8's related note is also confirmed by this picture: the quarter's reverse
carries `E PLURIBUS UNUM` in the upper arc, and we do not draw it.

---

## 5. D3 reverse tone — the target is built and frozen, and it still cannot gate.

`_jq30inv.mjs`, `_jq31patch.mjs` (`8643f9f7…`),
`_jq32norm.mjs` → **`_jqrevtone.json` sha256 `84e9b96d…`**,
`_jq33sym.mjs` → **`_jqrevtone-v2.json` sha256 `260f8109…`**.

Round 1: *"no acquisition needed — the judge must freeze a reverse patch set
and a normaliser. This is judge work that has simply not been done."* It is
done. The honest result is that it does not yet support a gate, and I would
rather say that than publish a number.

### 5.1 The inventory came first (§13)

Radial and angular sweeps of median grey over the interior, on both references,
each divided by its own interior median. Cross-reference disagreement **before
a single patch was chosen**: radial mean 0.1192 / max 0.3469; angular mean
0.1182 / max 0.3415. For scale, the whole D3 *obverse* value is 0.1447.

### 5.2 The patch set

16 patches in viewBox coordinates read off the published grid
(`_jq-rev3-grid.png`) — 13 device, 3 bare field — drawn back over **both**
references (`_jq-rev-patches-rev-3.png`, `-rev-2.png`) and audited by eye.
Three were moved after looking: `head` was sitting on the neck, `arrows`
overflowed a bundle thinner than its radius, `fieldLo` was clipping the tail.

### 5.3 The normaliser — the hard choice, and what it costs

**Eligibility, stated before any number existed:** the normaliser must be
*inside the device*. The field patches are measured and reported but are
ineligible, because normalising by the field folds the device-against-field
level into all twelve ratios — which is the entire content of D13, and which
destroys the property §12.2 exists for. §3 of the judge spec says D3 is
"structurally blind" to device-vs-field **by design**; that blindness is the
feature and D13 is the compensation.

**Selection criterion, stated before any number existed:** minimise the
cross-reference disagreement of the resulting ratio vector, because that
disagreement is the metric's own noise floor and no gate can be tighter than
it. Tie-break on patch size; throw if still within 10% (§4.2). All 13
candidates printed.

The winner was `wreathL` at 0.1937, over `arrows` at 0.2111 — an 8.2% gap, so
the declared tie-break fired and the larger patch won.

**And it is not usable, by its own numbers:**

```
cross-reference noise floor   0.1937
§12.3 flat floor (rev-3)      0.1732
```

The noise floor **exceeds** the flat floor. A drawing with no interior tone at
all scores 0.1732; two honest photographs of the same die disagree by 0.1937.
No gate can separate a good drawing from a blank one.

### 5.4 The diagnosis, and a repair that gets most of the way

v1's own ratio vector says what is wrong. The mirror pairs invert between
references:

| pair | rev-3 L/R | rev-2 L/R | |
|---|---|---|---|
| `wingIn` | 1.3125 | 0.8433 | opposite sign |
| `wingMid` | 1.1679 | 0.8554 | opposite sign |
| `wingOut` | 0.8720 | 1.7367 | opposite sign |
| `wreathSide` | 0.9938 | 1.2439 | opposite sign |

**0 of 4 mirror pairs agree in sign.** If the L/R difference were a property of
the die it would be 4 of 4. It is the light.

The eagle is bilaterally symmetric about X = 50, so the design assigns the same
tone to `wingInL` and `wingInR` and any difference between them is
illumination. Scoring the **mean of each mirror pair** as one group cancels the
antisymmetric term of the lighting exactly and costs resolution only where the
design is genuinely asymmetric — which on this device is nowhere.

Acceptance for the symmetrised set was stated before its numbers: usable iff
noise ≤ 0.6 × flat.

| | normaliser | noise | flat (rev-3) | noise/flat |
|---|---|---|---|---|
| v1 unsymmetrised | `wreathL` | 0.1937 | 0.1732 | **1.118** |
| v2 symmetrised | `wreathSide` | **0.1620** | 0.1760 | **0.920** |
| acceptance | | | | ≤ 0.600 |

Symmetrising is a real 18% improvement and still misses. **D3-reverse is
`BLOCKED`, not `UNMEASURED`** — the target exists, is frozen, and names exactly
what it lacks.

v1 is kept, not deleted and not edited (§1.1, retract beside). v2 supersedes it.

**What would unblock it, quantified.** The residual is illumination difference
between two lightings. Averaging N independent references reduces it roughly as
1/√N. To reach 0.6 × flat from 0.920 needs a factor 1.53, i.e. N ≈ 2 × 1.53² ≈
**5 independent, on-design, square-on quarter-reverse photographs**. We have 2.
That is a concrete ask, and unlike D2's it does not require proofs — ordinary
square-on photographs will do, as long as they are genuinely different
photographs (see §1: two of the five we were handed were one photograph and one
was a different coin).

### 5.5 The published target

`_jqrevtone-v2.json`: 16 patches, 9 mirror groups, normaliser `wreathSide`,
the full candidate table, the noise floor, the flat floor, both references'
ratio vectors and their mean as the target, and a `gate_note` recording that no
gate may be tighter than the noise floor.

---

## 6. D8 — the depth term. Derived, hashed, measured, confirmed.

Derivation: **`_jq8depth.mjs`, sha256 `2e655dfd6e45b9ff20cac8093251405408284f62efc79b8459797512ed29cef8`, hashed 2026-08-13T15:23:44Z.**
Measurement: `_jq8depthrun.mjs`, which re-hashes the derivation at start-up and
throws if it changed. The order "derivation, then value" is provable, not
claimed (§8).

### 6.1 What is not changing

**The gate stays 0.0000% of drawn length outside the field circle, every
tier.** Not relaxed, not widened, no exemption folded into the fraction. The
penny obverse and the nickel obverse both FAIL it before this derivation and
after it. Nothing below moves any verdict.

### 6.2 The derivation

A breach matters because a viewer can see ink outside the field circle, and
what a viewer sees is **device pixels of overhang at the size actually drawn**.

```
depth(m)       = maxRadius(m, incl. half its stroke width) − rField     [viewBox units]
depth_px(m,B)  = depth(m) × B / 100                                     [device px]
D8depth        = max over drawn marks and over ALL TIERS of depth_px
```

Two floors, derived rather than chosen:

- **representation floor = 0.01 viewBox units.** Coordinates are written to two
  decimals, so a point meant to lie on the field circle can sit up to
  0.005·√2 = 0.00707 off it radially. Rounded up to the quantum: 0.01.
- **perceptual floor = 0.5 device pixels.** Ink covering less than half a pixel
  is blended by the rasteriser into the field-ring stroke drawn over it. Same
  floor §22.4 uses when it insists a tier claim is a fact about pixels.

Three bands, and the routing rule:

| band | definition | routes to |
|---|---|---|
| **R** representational | depth ≤ 0.01 units | **nobody** — record it, do not dispatch |
| **S** sub-pixel | depth > 0.01 but D8depth < 0.5 px at every tier | lowest priority |
| **V** visible | D8depth ≥ 0.5 px at some tier | dispatch first, ordered by D8depth |

### 6.3 Measured, against `git HEAD:src/art/coins.js`

| coin | side | % outside (gate 0.0000) | deepest breach | D8depth | band | verdict |
|---|---|---|---|---|---|---|
| nickel | obverse | 8.0928% @44px | 1.4698 units | **0.694 px** @ box 47.2 | **V** | **FAIL** |
| penny | obverse | 7.9333% @76px | 0.0038 units | 0.011 px @ box 298.4 | **R** | **FAIL** |
| penny/nickel/dime/quarter | the other 6 sides | 0.0000% | 0.0000 | 0.000 | R | PASS |

**Fractions differ by 1.02×. D8depth differs by 392× and by two bands.** The
routing order the term produces is: nickel obverse first; the penny obverse is
flagged `R` with *"do NOT dispatch: this is the 2-dp coordinate quantum"* beside
it. That is the whole purpose.

### 6.4 The predictions, and the one that was wrong

The derivation was hashed carrying explicit predictions, which is what makes it
a derivation and not a fit.

- **Bands: both CONFIRMED.** penny obverse R, nickel obverse V, all six others
  R/PASS. Depths reproduced to four decimals.
- **Magnitudes: my arithmetic was wrong, and the instrument was right.** I
  predicted 5.585 px for the nickel from `1.4698 × 3.80`, assuming a requested
  draw size of 380 gives a 380px box. It does not — the requested size is the
  *quarter's* box and every other coin is scaled by relative diameter:

  | requested | penny | nickel | dime | quarter |
  |---|---|---|---|---|
  | 380 | 298.4 | 332.2 | 280.5 | 380 |
  | 54 | 42.4 | **47.2** | 39.9 | 54 |

  and, separately, the nickel's 1.4698-unit breach lives in the mid tier, not
  at the largest box. The true D8depth is **0.694 px**, not 5.585.

  The instrument never used the bad constant — `boxWidthOf()` reads the box off
  the emitted SVG's own `width` attribute at run time, exactly because "never
  assumed" was written into the derivation. The definition survives; the
  illustrative arithmetic in its prose does not. `_jq8depth.mjs` is **not
  edited** — it is hashed, and editing it would destroy the ordering proof.
  This paragraph is the retraction, beside it (§1.1).

  Worth saying plainly: **0.694 px is uncomfortably close to the 0.5 px band
  boundary.** The nickel's breach is band V by 39%, not by an order of
  magnitude. If a future round wants to lean on the band rather than the
  number, that margin is where it will break.

### 6.5 Tests

- **§4 response test**, declared in the hashed derivation and run afterwards:
  shrink the quarter reverse's field circle by 3.000 units. D8depth
  0.000 → **34.224 device px**, band R → V. Expected ~11.4 px at the 380 box;
  measured larger because the deepest mark is a stroked one and half its stroke
  width now also lies outside. Direction and order of magnitude correct. **PASS.**
- **§4.1 null test:** D8depth is a maximum over a finite enumerated set, not a
  search. It has no bounds to return, and that is stated rather than assumed.
- **§4.2 selection test:** the one selection in the pipeline is `fieldRadius()`,
  which `_jq8contain-v2.mjs` already audits by printing its whole candidate set
  and throwing on disagreement. This round adds no new selection.

---

## 7. Which instruments passed which test

| instrument | §4 response | §4.1 null | §4.2 selection | §4.3 located feature |
|---|---|---|---|---|
| `_jq20indep` NCC | PASS — self-shift 0.01…0.10R monotone drop; diagonal exactly 1.0 or it throws | PASS — NCC bounded [−1,1], bounds printed | n/a — prints the whole matrix, selects nothing | PASS — I opened all five images first |
| `_jq20indep` design-NCC | PASS — same | **reports 10 bound-returns as failures**, all on pairs that are different designs or unregistrable | n/a | PASS |
| `_jq21probe` / `_jq21grey` | PASS — area responds to both knobs across 60 combinations | **PASS and it fired**: the 64.26% "plateau" was identified as the guard's own area, computed not assumed | n/a | PASS — `_jq-rev3-panels.png`, `_jq-rev3-candidates.png`, `_jq-rev3-device.png` |
| `_jq21ctl` | PASS | PASS | n/a | PASS — v1 discarded for using the wrong instrument on the control |
| `_jq22band` | PASS | PASS — bounds 0.60…0.985R printed, best-fit interior | **PASS and it fired** — printed 1–12 candidate runs per sector and flagged "AMBIGUOUS: top two within 10%" | PASS — full profile printed, `_jq-rev-band.png` |
| `_jq22sect` | PASS | PASS | PASS — all 48 combinations printed | PASS |
| `_jq23count` | **PASS** — synthetic combs of 9 → 9, 13 → 13, flat → 0 | PASS — bounds 0…40 declared | n/a | PASS — zooms opened and read |
| `_jq32norm` / `_jq33sym` | PASS — patch medians move with the reference | PASS | **PASS and it fired** — 13 then 9 candidates printed, declared tie-break applied at an 8.2% gap, throws under 10% on both criteria | PASS — patches drawn on both references and three corrected after looking |
| `_jq8depthrun` | **PASS** — 0.000 → 34.224 px, band R → V | PASS — a maximum, no bounds | PASS — inherits v2's audited `fieldRadius()` | PASS — worst mark's path data printed |

Nothing built this round is `UNTRUSTED`. Two instruments were **discarded as
unsound before publishing a number**: the raw-NCC-only design test (§1.3) and
the energy-flood control on a proof (§2.3).

---

## 8. Things that contradict what I was told

1. **"Four quarter-reverse references now exist."** Two of the five files are
   one photograph (NCC 0.9850 / design 0.9950), one is a **Nebraska state
   quarter**, and the pair that is duplicated is also 26%-of-R oblique and
   unusable under §2.1 regardless. The real count of usable, independent,
   on-design references is **two**, of which one is new.

2. **"D2 is blocked on a square-on, evenly-lit photograph with the device
   separable from the field."** `quarter-rev-3.jpg` is square-on to 0.05% of R
   — the best disc fit we hold — and evenly lit, and D2 is still blocked. The
   missing property is not squareness or exposure; it is a **reflectance**
   difference between device and field, which a circulation strike does not
   have at all. The correct acquisition is a cameo proof against a dark field,
   and the one-line test for a candidate is in §2.3.

3. **"D4 reverse — `N/A` is a legitimate answer."** It is not, on this side.
   The design has three repeated elements and I have looked at all three at
   2000px. D4-reverse is `BLOCKED` on the count's resolvability (0 of 15 radii
   agree between references), not `N/A` on the subject's existence.

4. **D5-band-reverse was routed as blocked on "the same photograph."** It is
   not. 48 sector × reference combinations say the design puts the eagle's
   wings at every radius inboard of the legend, so the σ-plateau method has no
   inner shoulder to find in any sector. No photograph fixes that; a different
   metric might.

5. **The requested draw size is not the SVG box width** for three of the four
   coins (penny 380 → 298.4, nickel 380 → 332.2, dime 380 → 280.5). Any
   instrument converting viewBox units to device pixels with the requested size
   is wrong by up to 26%. Mine reads the box off the emitted SVG; my prose
   prediction did not, and was out by 8×.

---

## 9. What round 3 should carry

- **D2 / D4** — one acquisition, precisely specified: a cameo-proof quarter
  reverse against a dark field, accepted only if in-disc histogram valley depth
  ≥ 0.5 and level-sweep area drift ≤ 15% over ±30 grey levels.
- **D3-reverse** — three more independent square-on quarter-reverse
  photographs (5 total), which the arithmetic in §5.4 says brings noise/flat
  from 0.920 to ≈0.60. Ordinary photographs; no proof required.
- **D5-band-reverse** — a metric re-derivation, not an acquisition.
- **D8** — the depth term is live and the routing order it produces is: nickel
  obverse (band V, 0.694 px) first; penny obverse (band R, 0.011 px) not at
  all. Neither is the quarter.
