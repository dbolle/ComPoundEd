# Specialist brief — round 8, the CENT obverse: the hair and the beard

Written by the judge 2026-08-21, continuing the cent obverse on the opening
round 4 (`penny` round 4, the D3/D7 round) found and handed over.

```
SUBJECT      penny (cent), OBVERSE — the HAIR.Lincoln and BEARD paths only
DIMENSION    D1-adjacent shape fidelity, measured against the photograph
             (these two paths are OUTSIDE D1's scored locus — see below)
```

## CONCURRENCY

Two other rounds are running, on the **nickel obverse** and the **quarter
obverse**. You own the **cent obverse**. You may **not** edit any shared helper
— `struck`, `reliefOff`, `spendOf`/`fitOff`, `arcText`/`flatText`, `EDGE`,
`PALETTE`, the tier logic. `EDGE` and `PALETTE` are additionally the subject of
queued serialised rounds; touching them voids this one. If a repair genuinely
needs one, stop and report it.

## Why this round exists, and why it is cheap

The previous cent round established two things that make this the right next
move, and both are already measured:

1. **`HAIR.Lincoln` and `BEARD` are outside D1's locus.** `_pyeval.parts()`
   scores HEAD ∪ bare neck ∪ coat. This coin's D1 is **0.95378 against a 0.95
   gate — 0.00378 of margin, the tightest of the four coins** — and that margin
   is exactly why the head silhouette is untouchable. The hair and beard are
   not in it. **Verify that claim yourself before relying on it**, and report
   D1 before and after regardless.
2. **The photograph and our drawing disagree at both declared corners**, and
   the readings exist:

   | feature | the coin (ray fans on `penny-obv-3.jpg`) | ours |
   |---|---|---|
   | sideburn tip, included angle | **40–45°** | 35.5° (knot turn 144.5°) |
   | beard rear tip, included angle | **~100°** | 84.3° (knot turn 95.7°) |

   Ours is **sharper than the coin at both tips**. That is a fidelity gap in a
   locus that costs nothing to move.

## The four declared corners are yours to keep or improve, not to ignore

The previous round declared four authored corners on these two paths —
`HAIR.Lincoln` knot 16 (sideburn tip) and its closure knot (forehead hairline
junction), `BEARD` knot 7 (rear tip) and its closure (front tip). Those
declarations were accepted on evidence: the target mask reads 25.6° at the
sideburn against 25.4° on a known-smooth stretch of the same mask, so the
144.5° is the hairline turning back, not an oscillation in a fit.

**Keep the declarations true.** If your reshape changes a declared knot's
angle, update the declaration comment beside it with the new value and the new
measurement. If it removes one, say so. A declaration that no longer matches
the path is worse than no declaration.

## The landmine — read this before you nudge a hair stroke

`hairBack` **is a step function in our raster**, with a margin of 5.2
percentage points: the patch is 55.2 % grey 81 (`hair`) and 40.3 % grey 140 (a
`field@0.85` lit stroke). Losing five points of area at level 81 flips the
median 81 → 140 and its D3 |Δ| jumps **0.172 → 0.424** with nothing in
between. `beardJaw` (margin 11.6) and `brow` (margin 14.8) are narrow too.

So: **run `_jc5bimodal.mjs` before and after on all 12 patches**, and if a
reshape moves a patch across a step, that is a finding to report, not a number
to optimise around. Round 4 lost real work to exactly this on the dime.

## What NOT to do

- **Do not chase D3.** The previous round established the hair tone is already
  within 0.001 of the best any single flat fill can achieve, because the two
  struck references *invert* on which part of the hair is dark. Shape is your
  subject; tone is not.
- **Do not chase D13.** Both normalisers are unsound — the p90 is a specular
  highlight on three of four references, and the mode is the *device* on six of
  eight faces. Report it before and after; do not aim at it.
- **Do not touch the head silhouette, the neck or the coat.** They are D1's
  locus and there are 0.00378 units of margin.

## MUST NOT REGRESS — re-measured by the judge

| dimension | current (re-derived today) | how |
|---|---|---|
| **D1 obverse** | **0.95378**, margin 0.00378 | `_pyscore.mjs` |
| D3 obverse | 0.1596, and the per-patch table | `_pytone.mjs` |
| D6 obverse | 0.1052 @84, 0.1308 @190 | `_jp9edge.mjs penny` |
| D7 obverse | 4 knots over 75°, all declared | `_jc5d7.mjs` (the judge's `_jp9edge` D7 half is a null result on this coin) |
| D8 | 0.0000 %, both sides, depth 0.0000 | `_jq8contain-v2.mjs` |
| D9 | 150 renders clean | `_jb9well.mjs` |
| D10 obverse | **24.64×**, absolute d(ink) 0.1921 | `_jp10tier.mjs penny` — newly in the standing set |
| D11 | overall min 0.0534, cross-side `penny.o vs penny.r` **0.0750** | `_x6mat.mjs` |
| the cent REVERSE and all three other coins | **byte-identical** | — |

**D10 is the row to watch here and it is not protected.** It is 24.64× against
a 4× gate, the worst in the set, and the hair mass is a large share of what the
icon tier draws — so a reshape can move the icon→mid ink step in either
direction. Report the absolute d(ink) beside the ratio (Appendix R2: no
improvement may be claimed unless the numerator moved), and if it worsens, cost
it rather than discovering it later. That is precisely the failure the judge
committed on this dimension in v1.57.0.

## References

`penny-obv-3.jpg` (2000×2000) carries the frozen disc fit, the head mask and
the tone patches, and is the target of record. `penny-obv.jpg` is the 1909-S
and is the second struck reference. **`penny-obv-2.jpg` is a cameo proof and is
excluded from anything photometric by `penny-gates.md`'s own D3s row** — but it
is legitimate for *shape*, which is this round's subject, and at that job a
frosted proof is the best reference there is (§20.3). Say which you used for
what. `penny-obv-unc2005.png` (U.S. Mint, public domain, diffuse) has no frozen
disc fit and may not carry a scored value.

## RULES (§7)

- **Never describe the coin from memory. Open the reference and measure.** The
  brief has been the thing in error in five consecutive rounds; assume it is
  again and re-derive.
- Do not edit a target or an eval library. If one is wrong, §1.1: demonstrate,
  report, do **not** fix.
- Every located feature gets an overlay drawn on the source and you look at it.
- Response test and null test on every instrument you write; prefix `_jh8`.
- Pin both revisions explicitly in any before/after artefact.
- Report every iteration, including the ones that got worse, and any setting
  you rejected because it scored better.
- **Do not report a verdict.**
