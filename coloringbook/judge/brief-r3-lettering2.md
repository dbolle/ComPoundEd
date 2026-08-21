# Specialist brief — round 3, the D5 remainder

Written by the judge 2026-08-21 after round 2 was accepted.
Format: `docs/COIN-JUDGE.md` §7.

```
SUBJECT      penny reverse; nickel reverse; quarter OBVERSE
DIMENSION    D5 — the four items round 1 found and did not fix, plus the one
             D5 row that is still FAIL on art round 1 deliberately left alone
```

## Why these, and why not the tone dimensions

D3, D13 and D2 are all now **escalated or blocked on the same missing
capability** — a device/field segmentation. Round 2 established that D13's
normaliser is the p90 of the disc interior, which on three of four reverses
is a specular highlight on the device rather than the field, so the reference's
own field is counted as ink and the ±0.05 gate is very likely unreachable
whatever the art does. Chasing it further would spend real separability on an
artefact; the D11 reverse minimum already paid 1.8 % for round 2. **So this
round goes back to lettering**, where the targets are geometric, the
instruments are clean, and round 1 built the tooling.

## The work, all of it already measured and named

### 1. A FOURTH missing legend — E PLURIBUS UNUM on the CENT reverse

Round 1 found it while measuring something else and nobody had ever listed it:
the cent's reverse carries E PLURIBUS UNUM in two arcs above the memorial at
r ≈ 29..35, plainly visible on `_jl1grid-penny-rev-2-png.png`. We do not draw
it at any size. The quarter's equivalent went in during round 1 as two arcs
with their own `min` floor (`REV_TEXT.quarter.arcs`, `min: 190`); that is the
pattern to follow, with this coin's own measured radii and spans.

### 2. FIVE CENTS is an ARC on the nickel and we draw it flat

At r ≈ 28, centred at six o'clock (`_jl1grid-nkrev-monti.png`). We emit
`flat: { text: 'FIVE CENTS', x: 50, y: 74.5, size: 5.2 }`. Round 1 left this
alone as "a shape change with no frozen target" — deriving that target is part
of this round. Read the arc's radius and span off the reference the way round 1
read MONTICELLO's baseline, and say so if the photograph disagrees with this
brief.

### 3. The cent's reverse legend reads UNITED STATES **of** AMERICA

Lowercase `of`, on `penny-rev-2.png`. We set it all caps. This is the smallest
item here and it is the kind that survives for years: it is one string, and it
is checkable by a child holding the coin. Confirm it on the reference first —
if a second cent reference disagrees, the finding is wrong and should be
reported as wrong.

### 4. D5-HF on the QUARTER OBVERSE — the one still-FAIL row on untouched art

`2.0089×` against a `≤ 1.50×` one-sided gate, at the frozen locus r 38.9,
84 px. This number has a history worth reading before touching anything: it
was published twice as `1.51×` — celebrated as a near-miss the process refused
to round away — and the true figure only appeared when round 2 of the quarter
found the instrument sampling **both** our art and the reference at a radius
derived from our own glyph geometry. The art has not changed across any of it.

HF too **high** means our band carries more high-frequency energy than the
coin's. Round 1 deliberately did not touch this, and its reasoning was right:
**growing the type is the wrong direction here.** The obverse has no frozen
band or cap target, so there is nothing to grow toward, and a bigger face
would raise HF further. Candidate causes, to be measured rather than assumed:
too many marks in the band (the date and a second motto sharing the band with
LIBERTY), letter-spacing tighter than the coin's, or stroke weight. Measure
first. **If your conclusion is that this row needs a frozen obverse band
target before it can be repaired, that is a legitimate finding — report it and
stop, rather than tuning a number until the ratio drops.**

## GATES — unchanged, and none of them may be relaxed (§8)

| row | gate |
|---|---|
| D5-cap | ±15 % of the reference cap height |
| D5-span | ±15 % of the reference angular span |
| D5-band | baseline within ±1.5 viewBox units |
| D5-HF | ≤ 1.50×, one-sided, at the frozen locus |
| D5-presence | baseline, reported as a measured fact |

Note the convention round 1 established and the judge verified from
`arcText` itself: **a bottom-of-coin legend's baseline radius is its band's
OUTER edge**, because the glyphs are rotated so their caps point at the
centre. Three published PASSes were retracted over this. Read `_jq4band.json`
and the round-0 scorecards with that in mind — their labels are the wrong way
round and the target files are hashed, so the mislabelling is recorded rather
than corrected in place.

## MUST NOT REGRESS — re-measured by the judge

| dimension | current | how |
|---|---|---|
| D9 | 150 renders clean | `_jb9well.mjs` |
| D8 | 0.0000 % on 7 of 8 faces; nickel obverse 0.0039 units | `_jq8contain-v2.mjs` |
| D11 | overall min **0.0534**, reverse min **0.0797**, ratio **1.49×** | `_x6mat.mjs` |
| D5 round 1 | caps ~0.97 of reference, spans within 0.1°, legends present at every coin's 84 px naming draw | `_jl1cap.mjs`, `_jl1pres.mjs` |
| D13 dime reverse | +0.1509 / +0.1726 / +0.1724 | `_x6dark.mjs` |
| D6 dime reverse | 0.2317 / 0.2351 | `_jp9edge.mjs dime` |
| D10 dime reverse | 3.80× at the 42→44 boundary | `_jp10tier.mjs dime` |
| the dime reverse | **byte-identical** — it was round 2's subject and is not yours | — |

**D11 has already been spent once.** Round 2 cost the reverse minimum 1.8 %
and it was accepted as a costed trade. It should not be spent again in the
same release for lettering, which at the icon tier cannot move it at all —
the icon tier draws no inscription. If you find yourself changing what icon
emits, stop.

## Containment, which is now the binding constraint on lettering

The field circle is 44.07 at full and mid, 42.5 at icon. Round 1 left the
worst glyph-box clearance at **0.5761 units** (quarter reverse "R" at 84 px).
There is much less headroom than round 1 had. Any new legend must be measured
against 44.07 at every tier before you report it, and the cent's E PLURIBUS
UNUM sits *inboard* of its main legend, so it should be nowhere near the
limit — if your numbers say otherwise, something is wrong with the placement.

## RULES (§7)

- **Never describe a coin from memory. Open the reference and measure.** If a
  photograph contradicts this brief, the photograph wins — say so. Two of the
  four items above are the judge repeating a specialist's reading; check them.
- Do not edit a target or an eval library (147 hashed). If one is wrong,
  §1.1: demonstrate, report, do not fix.
- Every located feature gets an overlay drawn on the source, and you look at
  it (§4.3).
- Response test and null test on every instrument you write. Round 2's own
  relief instrument failed its null test at all six thresholds and the
  specialist reported it as a failure instead of using the numbers — that is
  the standard.
- **A control may not be a function of a mutable path.** Round 1's contact
  sheet compared the new art with itself because its "before" defaulted to
  the shared checkout, and the judge nearly accepted the picture. Pin both
  revisions explicitly; `_jl1look.mjs` now requires it.
- Report every iteration, including the ones that got worse.
- **Do not report a verdict.**
