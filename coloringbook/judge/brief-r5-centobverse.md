# Specialist brief — round 5, the CENT obverse

Written by the judge 2026-08-21, on the owner's direction that the obverse
portraits are the remaining work and that the three coins other than the dime
need full iterative loops. This is the first of those three.

```
SUBJECT      penny (cent), OBVERSE
DIMENSIONS   D3 interior tone   — the largest sound failure on this face
             D7 curve quality   — two knots over 75 deg on FITTED contours
```

## READ THIS FIRST: every "current" figure below is from ROUND 0 and at least
## two of them are known stale. Re-derive before you act on any of them.

This has now bitten three rounds running — each time the brief itself carried
the error, and each time the specialist caught it. So this one does not pretend
otherwise. **Your first task is to re-derive the current values and report
them**, and if they differ from the table below, the table is wrong.

Known stale already:

- **D5-band obverse (−2.29) and D5-span obverse (−31.7 %)** almost certainly
  PASS now. Round 1 changed this coin's `IN GOD WE TRUST` to `rOff 3.47`
  (reference band inner 39.4) and `adv 1.34` (reference span 130° over 14
  advances) and reported the span at −0.0 %. Nobody re-scored the row.
- **D8 obverse (7.9333 % at 76 px) PASSES now** — I re-derived it today at
  **0.0000 %** on every tier. v1.57.0 moved the field circle from 41.0 to
  44.07 and the breach went with it.

Round-0 figures, to be checked and not trusted:

| row | round-0 value | gate |
|---|---|---|
| **D3 obverse** | **0.1596** | **≤ 0.10965** = ½ the flat-drawing floor |
| **D7 obverse** | `HEAD.Lincoln` 69.1° (0 over) · **`HAIR.Lincoln` 144.5° (1 over)** · **`BEARD` 95.7° (1 over)** | 0 knots turning > 75° on fitted contours |
| D1 obverse | 0.95404 | ≥ 0.95 — the tightest margin of the four coins |
| D6 obverse | 0.1056 @84, 0.1317 @190 | ≤ 0.50 |
| D10 obverse | 5.44× at the 42→44 boundary | ≤ 4× the within-tier p90 |
| D13 obverse | −0.2537 at icon | **ESCALATED — do not chase, see below** |

## Item 1 — D3, interior tone

Metric: mean |Δratio| over the **11 non-cheek frozen patches** against
`penny-obv-3.jpg`; locus `_tonepatches-penny.json`, disc-normalised (u, v, r).
Every patch ratio is normalised by the cheek, which is what makes D3 immune to
exposure and palette lightness and leaves the relationships line work controls.

0.1596 against a 0.10965 gate is the largest sound tone failure on any obverse.
**Report the per-patch table, not just the mean** — a mean of eleven hides
which relationships are wrong, and the repair is per-patch.

**A warning that cost round 4 real work.** On the dime, the frozen `chin` patch
turned out to be a **step function**: our flat palette spans two levels inside
that patch, so its median crosses on a ~4 % area change and its |Δ| jumps
0.073 → 0.081 → 0.121 → 0.229 with nothing in between. A repair got biased 0.8
units purely to stay off a step, and two settings that scored *better* were
refused as tuning to a metric. **Check whether any cent patch is bimodal in our
raster before you optimise against it**, and say so if one is — that is a
finding about the target, not a number to chase.

## Item 2 — D7, and unlike the dime's these are probably real

The dime's single over-75 knot turned out to be the bust truncation — a corner
the die genuinely cuts, measured on the frozen mask at 99–122° against a
straight-cut control at 6.4–37.9°, and it was declared exempt rather than
smoothed (Appendix P2).

**Do not assume the same answer here.** These two are on `HAIR.Lincoln` and
`BEARD`, which `_pybuild.mjs` fits from the frozen mask, and 144.5° on a fitted
hair contour is the signature P2 describes as a genuine oscillation artefact —
the quarter's `HAIR` had a 102° knot that D12 confirmed as a visible kink. Test
it the way round 4 did: measure the corner **on the target mask** with a chord
estimator, and run a control on a stretch you know is smooth. Then either
smooth it or declare it, on the evidence.

## D13 is ESCALATED — do not chase it

This face reads −0.2537 at icon, the worst D13 number on any coin, and it is
**not a target this round**. Both available normalisers are unsound: the p90
of the disc interior is a specular highlight on three of four references, and
the mode is the *device* on six of eight faces (the judge proposed the mode,
tested it, and retracted it today). Do not optimise against D13. Just report it
before and after so the judge can see it did not get worse.

There is one thing worth knowing while you work: the obverses fail D13 in the
**opposite** direction to the known bias — ours too dark, carrying roughly
twice the reference's ink — so the deficit is real and if anything understated.
If a D3 repair happens to move D13 toward zero, say so; do not aim at it.

## References

`penny-obv-3.jpg` (2000×2000) carries the frozen disc fit and the tone patches
and is the target of record. A **new** reference landed today and is NOT wired
into any instrument: `penny-obv-unc2005.png` (945×955, U.S. Mint, public
domain, a 2005-D business strike under diffuse light). It has no frozen disc
fit, so it may **not** be used for any scored value. It is legitimate as a
second opinion when a reading looks odd — say when you use it and for what.

## MUST NOT REGRESS — re-measured by the judge

| dimension | current | how |
|---|---|---|
| D1 obverse | **0.95404** — margin 0.004 over the gate, the tightest of the four coins | the cent's own D1 instrument |
| D6 obverse | 0.1056 @84, 0.1317 @190 | `_jp9edge.mjs penny` |
| D8 | 0.0000 % every tier (re-derived today) | `_jq8contain-v2.mjs` |
| D9 | 150 renders clean | `_jb9well.mjs` |
| D11 | overall min 0.0534, reverse min 0.0797, ratio 1.49×; cross-side `penny.o vs penny.r` **0.0750** | `_x6mat.mjs` |
| D5 obverse | round 1's lettering — re-derive and hold | `_jl1cap.mjs`, `_jl1pres.mjs` |
| the cent REVERSE and all three other coins | **byte-identical** | — |

**D1 is the row to watch.** At 0.95404 against a 0.95 gate there is 0.004 of
margin, and any change to the head silhouette spends it. The dime's equivalent
sits at 0.98063; this coin has no such room.

## RULES (§7)

- **Never describe the coin from memory. Open the reference and measure.** If a
  photograph contradicts this brief, the photograph wins — say so. It has, in
  every round so far.
- Do not edit a target or an eval library. If one is wrong, §1.1: demonstrate,
  report, do **not** fix. Round 4 found two that way.
- Every located feature gets an overlay drawn on the source and you look at it
  (§4.3).
- Response test and null test on every instrument you write; new files prefixed
  `_jc5`.
- Pin both revisions explicitly in any before/after artefact.
- Report every iteration, including the ones that got worse, and any setting
  you rejected *because* it scored better.
- **Do not report a verdict.**
