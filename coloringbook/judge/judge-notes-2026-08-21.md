# Judge notes — 2026-08-21, the v1.57.0 re-derivation

Written by the judge after `EDGE.field` 41.0 → 44.07 landed, before round 1's
specialist returned. Every number here is the judge's own re-derivation on the
committed tree (`8156883`), not a specialist's report.

## What the field change settled, measured rather than predicted

| dimension | before (round 0) | after v1.57.0 |
|---|---|---|
| D5-rim, cent | ours 41.0 vs coin 44.00 — **FAIL** | 44.07, Δ **+0.07** — PASS (gate ±1.0) |
| D5-rim, nickel | ours 41.0 vs coin 44.33 — **FAIL** | Δ **−0.26** — PASS |
| D5-rim, quarter | ours 41.0 vs coin 44.20 — **FAIL** | Δ **−0.13** — PASS |
| D5-rim, dime | ours 41.0 vs coin 43.75 — **FAIL** | Δ **+0.32** — PASS |
| D8, nickel obverse | 8.09 % outside, **1.4698 units deep** | 2.3714 % outside, **0.0039 units deep** |
| D8, every other face | — | **0.0000 %** |
| D9 | clean | clean, 150 renders, response test goes red as expected |
| D11 set ratio | 1.49× | **1.52×** (gate ≥ 3.0 — still `ESCALATE`, §6.2) |

Four D5-rim FAILs and one real D8 breach retired by one constant, and the D8
repair changed no drawing at all: the nickel's head still reaches 40.64 with
its lit copy at 41.97, and the circle it is measured against moved out from
under it. The 0.0039 residual is the coat's closing arc authored at exactly
r 44.07 and is a coordinate-representation artefact (Q3), not a defect.

**D11 improving was not predicted and is not a win to bank.** The set ratio
moved 1.49× → 1.52× because the rim ring narrowed on all four coins at once,
which is a change to the *shared* furniture — exactly the area that
contributes zero difference between coins and inflates the MAD denominator
(v1.56.0's standing suspicion). A 2 % move in a metric that is already
suspected of being the wrong metric is noise, not progress.

## D13 reverse, re-derived (`_x6dark.mjs`, icon tier, 26 px)

Gate: |Δ mean/field| ≤ 0.05.

| coin | ref mean/field | ours | Δ | ink ref | ink ours |
|---|---|---|---|---|---|
| penny | 0.8497 | 0.8235 | −0.0261 | 0.500 | 0.462 |
| nickel | 0.8605 | 0.8617 | **+0.0012** | 0.448 | 0.387 |
| dime | 0.7268 | 0.8999 | **+0.1731** | 0.661 | 0.299 |
| quarter | 0.7667 | 0.7488 | −0.0179 | 0.660 | 0.548 |

**The dime reverse is the outlier by a factor of 6.6** against the next worst,
and it fails in both channels at once: far too light against its own field
(+0.1731, 3.5× the gate) and carrying **less than half** the reference's ink
(0.299 vs 0.661). Its ink bounding box is 23.7..76.3 where the reference's is
13.2..86.8 — our torch-and-branches occupies the middle half of a field the
coin fills. That is the next repairable D13, and it is a *drawing* fix, not a
tone-constant fix: no change to greys will put ink where there is none.

## An instrument caveat, recorded rather than acted on (§1.1, inverted)

`_x6dark.mjs` compares ink fraction over the whole `r < 40` interior at the
**icon** tier. Our icon tier draws **no lettering at all**, by an explicit
design decision (`tier === 'icon' ? '' : inscriptionOf(...)` — a blurred word
reads as damage). The references have their legends, and on the cent and the
nickel those legends are most of what fills the top and bottom of the
interior: ours read Y 32.5..62.5 and 28.3..63 against references at 12.5..87.5
and 10.9..89.1, and the `aspect` column collapses to 0.40 and 0.47 against
~1.0 for exactly that reason.

So a share of the cent's and the nickel's ink deficit is **not a tone defect,
it is the presence decision the design already made on purpose**, and the
instrument cannot currently separate the two. This does not touch the dime's
finding — the dime's deficit is inside the motif's own bounding box, where
there is no lettering in either image — and it does not touch `mean/field`,
which is a ratio over the interior rather than a count.

Owed before D13 is dispatched on the cent or the nickel: either mask the
reference's legend band out of the ink count, or state the locus as the motif
bounding box rather than the disc interior. **Not fixed here**, because
changing an instrument mid-round to make a coin look better is the move §8
forbids, and because the fix changes published numbers on two coins and wants
its own retraction entry (§1.1, retract beside — never rewrite).
