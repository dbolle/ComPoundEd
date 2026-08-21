# Specialist brief — round 4, the dime obverse: the jaw, and the curve

Written by the judge 2026-08-21, on the owner's direction that the obverse
portraits are the remaining work and that *"the dime is the best of the 4, but
still needs the jaw line fixed"*.

```
SUBJECT      dime, OBVERSE
DIMENSIONS   D6 edge quality — the jaw line, §14's own named case
             D7 curve quality — one knot at 111 deg
```

## Item 1 — the jaw is a stroke, and it is the last one that should be

`src/art/coins.js`, `OBVERSE.dime.dark`, at about line 1572:

```
'<path d="M 19.4 21.4 C 17.6 21.4 14.2 21.4 11 21.2 C 7 21 3.4 19.4 0.4 18.2'
' C -3.2 16.8 -7.4 15 -10.4 13.6 C -11.4 13 -12.2 12.4 -12.6 11.6"
  fill="none" stroke-width="1.5"/>'
```

Its own comment calls it *"still the strongest dark on the coin and still the
only one drawn at full `ink` weight, because on the photograph it is the
deepest shadow on the obverse."* Every neighbouring mark became a filled
region in phase 2b; this one did not.

**Why that is a defect and not a style.** `COIN-ART-METHOD.md` §14: *a real
coin has no uniform-width marks anywhere — relief carries light, and light
varies along a feature.* A `stroke-width` path has a width-variation ratio of
exactly **1.000 by construction**, which is why D6 is defined as the fraction
of drawn length carried by ratio-1.000 marks. This mark is the case §14 names
by name, and it has outlived three releases of the phase that was supposed to
take it.

**The position and shape are already right and are NOT what you are changing.**
The comment records the measured boundary — (18, 20.5) → (10, 21.5) →
(2, 18.6) → (−6, 15.4), ending in a defined angle tucked under the ear lobe at
about (−11, 13.6) where it turns up — and records that the previous pass
stopping a unit short of that angle left the lower head "one flat pentagon".
Keep the geometry. Change the mark from a constant-width stroke to a filled
region whose width varies along its length, the way a die-cut shadow does:
deepest where the jaw overhangs most, thinning toward the chin and toward the
turn under the ear.

Round 2 on the dime reverse learned the same lesson the expensive way and it
is the model for this: a parallel-sided stem at exactly 2.00 units scored as a
uniform-width mark and pushed D6 from 0.2685 to 0.3965 before it was tapered
2.6 → 1.3.

## Item 2 — D7, one knot at 111 degrees

`{"knots": 44, "worst_deg": 111, "over_75": 1}` — FAIL against a ≤75° gate.

Read Appendix P2 before you touch it. **D7 applies to paths produced by
FITTING a contour**, not to authored polygons: a trapezoid's corner and a
crescent's tip are corners the die genuinely cuts, and the gate was written
for oscillation artefacts in fitted curves. So the first question is not "how
do I get this under 75°" — it is **which path the knot is on, and whether that
corner is real on the photograph.** If it is real, the correct outcome is a
declaration in the scorecard naming the path and the knot index as an authored
corner, and no change to the drawing. If it is an artefact, smooth it.

The quarter has the precedent for a genuine one: its `HAIR` has a 102° knot
that D12 confirmed as a visible kink, and it failed honestly.

## GATES

| row | gate | current |
|---|---|---|
| D6 obverse | fraction of drawn length at ratio 1.000 **≤ 0.50** | 0.2493 @84, 0.3517 @190 — **passing, and must improve** |
| D7 obverse | max knot turn **≤ 75°** on fitted contours; authored corners exempt **if declared** | 44 knots, worst 111°, 1 over |

D6 already passes its gate, so the number to beat is the current value, not
0.50. §8 forbids proposing a relaxation of either.

## MUST NOT REGRESS — re-measured by the judge

| dimension | current | how |
|---|---|---|
| D1 obverse silhouette | **0.98063** — the best of the four coins; this is what "the dime is the best" means numerically | the dime's own D1 instrument |
| D3 obverse tone | **0.0399** | — |
| D8 | 0.0000 %, max drawn radius 39.372 | `_jq8contain-v2.mjs` |
| D9 | 150 renders clean | `_jb9well.mjs` |
| D11 | overall min **0.0534** (`nickel.o vs dime.o` — the dime obverse is HALF of the set's closest pair), reverse min 0.0797, ratio 1.49× | `_x6mat.mjs` |
| D13 obverse | −0.0788 / −0.0153 / +0.0431 | `_jd10d13.mjs` |
| the dime REVERSE and all three other coins | **byte-identical** | — |

**D11 is not protected this time and you should assume it is watching.** The
dime obverse is one half of `nickel.o vs dime.o = 0.0534`, the closest pair in
the whole set, and the icon tier *does* draw the bust. Darkening or thickening
the jaw could push it. Report the matrix before and after.

**A caution on D13 that is the judge's problem, not yours.** D13's normaliser
is under repair — it divides by the p90 of the disc interior, which on three
of four references is a specular highlight rather than the field. The obverse
numbers fail in the *opposite* direction to that bias (ours too dark, ~2× the
reference's ink), so the deficit is real and if anything understated. Do not
chase D13 in this round; just do not make it worse.

## RULES (§7)

- **Never describe the coin from memory. Open `ref/dime-obv-*.jpg` and
  measure.** If a photograph contradicts this brief, the photograph wins — say
  so. The last three rounds each corrected the judge on a point exactly like
  the ones above.
- Do not edit a target or an eval library (147 hashed). If one is wrong, §1.1:
  demonstrate, report, do **not** fix.
- Every located feature gets an overlay drawn on the source and you look at it
  (§4.3).
- Response test and null test on every instrument you write; new files
  prefixed `_jw4`.
- Pin both revisions explicitly in any before/after artefact — a control may
  not be a function of a mutable path.
- Report every iteration, including the ones that got worse.
- **Do not report a verdict.**
