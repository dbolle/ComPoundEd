# Specialist brief — round 14, the $1 note's EAGLE

Round 12 rebuilt this subject (D1 0.1496 → 1.0000, both roundels → 0.999) and
left one thing it could not do by rescaling.

```
SUBJECT      the $1 note (`buck`), REVERSE — the eagle only
DIMENSION    D2b/D2d shape fidelity of the eagle device
```

## The measurement round 12 left

On the note the eagle's wings span **0.604** of its roundel's width and the
bird stands **0.756** of its height. Ours are **0.858** and **0.513** — too
wide and too short. No affine map of the existing paths fixes that; it needs
redrawing with raised, steeper wings.

D2d-eagle currently sits at **+6.06%** against a ±5% gate. Round 12 explicitly
refused `rx = 9.2`, which satisfies all four D2 rows at once and is inside the
target's own spread, because **D2d is a ratio between two numbers the drawing
controls** and Appendix R2 says exactly that gate can be met by choosing the
drawing. Do not take that shortcut either — fix the bird, not the ratio.

## Re-derive first

Every figure here is round 12's, measured hours ago on the tree you are
handed. Confirm them before acting. Seven of the last nine rounds found the
brief itself in error.

## CONCURRENCY

Rounds are running on the **cent obverse** and the **nickel obverse**. You own
the **note**. Do not edit shared helpers — `struck`, `reliefOff`,
`spendOf`/`fitOff`, `arcText`/`flatText`, `EDGE`, `PALETTE`, tier logic.
`EDGE` and `PALETTE` are the subject of owner-blocked rounds; touching them
voids this one.

## MUST NOT REGRESS

| row | current | how |
|---|---|---|
| D1 obverse | **1.0000** — round 12 earned this; do not spend it | `_jk9score.mjs` |
| D2a pyramid roundel | 0.9989 | `_jk9score.mjs` |
| D2b eagle roundel | 0.9991 | `_jk9score.mjs` |
| eagle beyond its roundel | **0.000% at every tier**; the residual at icon/mid is the `struck()` bevel only, 0.698 device px | `_jk9fitseal.mjs` |
| D4 obverse | error 0 | `_jk9score.mjs` |
| D9 | 150 renders clean | `_jb9well.mjs` |
| the four coins | **byte-identical** | `_jk9ident.mjs` |

**D11 cannot see this subject** — `_x6mat.mjs`'s `IDS` list has never included
the note. The note's own two-sided pair fell to 0.0718 in round 12 and is the
number to watch; report it rather than assuming the set matrix covers it.

## D7 IS ESCALATED — report both measures

Its chord metric returns 90° for a perfectly smooth curve. Use
`_jd7tan.mjs`'s tangent measure alongside it and report both; do not smooth
anything to satisfy the chord number.

## RULES (§7)

- **Never describe the note from memory. Open the reference and measure.**
- Do not edit a target or an eval library (351 hashed). §1.1 if one is wrong.
- Every located feature gets an overlay drawn on the source and you look at it.
- Response and null tests on every instrument; prefix `_je14`.
- Pin both revisions explicitly in any before/after.
- Report every iteration, including the ones that got worse, and anything you
  rejected because it scored better.
- **Do not report a verdict.**
