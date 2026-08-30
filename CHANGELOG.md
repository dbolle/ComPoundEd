# Changelog

The version shown at the bottom of the Grown-Ups screen. Kid progress is
never affected by updates (see CLAUDE.md's preservation gate).

## v1.112.0 — 2026-08-30

**85 % of the disagreement between the dime's two reference photographs is
manufactured by one constant.** No art changed; `src/` is byte-identical. This
is a measurement and a negative result.

`deviceMask()` erodes its output by a fixed number of units on every side —
0.55 on proofbright, 1.00 on unc2005 — to pull the mask back off the shadow
skirt around a struck mark. Ledger A40 said a constant cannot be right for
marks whose widths differ by 5×. It is now measured rather than argued.
`_dr23halfmax.mjs edge` scans every field→device transition on the branch and
reports its 10–90 % rise distance:

- **proofbright, 329 transitions: median 0.600 units**, against the ~0.59 that
  would justify a 0.55 erosion — **1.01×. That constant is well calibrated**,
  and this release does not touch it.
- **unc2005, 609 transitions: median 0.400 units**, against the ~1.08 that
  would justify a 1.00 erosion — **0.37×. That constant is 2.7× too large.**
- Within either file the skirt varies about 4× from median to p90, so no single
  number is right everywhere. That part of A40 stands.

**What it costs, on the locked oak stem.** OUTSIDE reads **32.79 %** on
proofbright at its 0.55 and **70.75 %** on unc2005 at its 1.00 — a 37.96-point
gap. Score unc2005 at 0.37, its own measured median, and it reads **38.45 %**:
the gap falls to 5.66. **This is the mechanism behind ruling R4.** unc2005 has
been reading 15–20 points lower on containment than proofbright even where the
drawing was independently verified right, and three rounds were told to treat
it as the pessimistic file. It is not a worse photograph. Its erosion is 2.7×
its own edges.

The constant is **not changed here.** It is shared, and every published branch
number moves with it — that is the owner's call, and it is now a call that can
be made on a number.

**And a negative result, recorded so nobody spends a round rediscovering it.**
The obvious fix is a mask with no erosion constant at all: threshold each cell
against the midpoint of its local min and max — the half-max edge this branch
already uses as its standard — then flood as before. On synthetic bars it does
exactly what the algebra predicts, over-reading by the skirt width rather than
by 1.85× it, tracking each bar's own skirt, and **never** going negative, where
erosion by 1.00 recovered **0.00 units for a 1.0-unit bar** and deleted it
outright. On the actual photographs it collapses: the oak trunk reads 0.00–0.60
against a calibrated 2.20. The cause is texture. The frosted device is not a
flat tone but high-contrast speckle — across the trunk at y 68 proofbright runs
**44…222 inside the mark against a smooth 249 field** — so a local midpoint
calls half the frost field, punches holes through the device and lets the flood
in. The global threshold works precisely *because* every texel of the frost
sits below it. A future attempt needs a texture statistic, not an intensity
one. Ledger A44, closed negative.

The null test caught two of my own errors before it caught anything about the
coin: bars laid out on an even pitch ran into each other twice, so every method
"recovered" 17 units for a 5-unit bar. It now seats each bar clear of the last
one's skirt and throws if the row overruns the lattice.

Suite **225 + 239 = 464/464**.

## v1.111.0 — 2026-08-30

**The dime's oak branch now carries eight individual overlapping leaves in the
four groups the owner read off the coin, and the stem they hang on did not
move by one number.**

Fifteenth element round on this face. The mirrored seven-row `LADDER` is
retired from the oak: it was the OLIVE's table, read off the olive's blades and
copied across, and both the "seven a side" count (retracted in v1.110.0) and
its angle column had already been overruled twice on this branch. The oak now
has its own eight-row `OAKSEATS`, one entry per leaf, in the owner's topology —
**A** two on the inboard prong, **B** three terminating the outboard prong,
**C** one off the outboard prong's outboard face, **D** two off the trunk below
the fork.

**Every base is evaluated on the frozen stem, never written down.** `prongC`,
`prongFace`, `prongHW`, `oakC`, `oakInFace` and `oakTrunkOut` are asked where
the branch is at a given height and the leaf attaches there, so ruling R3's lock
holds by construction: the emitted oak-stem path (node `2.1.4`, 1015 bytes) is
**byte-identical** before and after, and so are all eighteen of the olive's
emitted paths.

Fitted to the coin's **silhouette** — the device mask with the field removed —
because no threshold separates these leaves on the coin either (v1.110.0's A42).
`dime-rev-proofbright.png` placed them at +0.35; `dime-rev-unc2005.png`, whose
outlines survive an overlap where relief does not, settled which leaf overlaps
which and where each petiole leaves the stem. Per-leaf **OUTSIDE**: 7.4 / 8.5 /
12.0 / 5.4 / 7.7 / 4.8 / 9.8 / 10.9 %, **8.00 % over all eight** (9.60 % on
unc2005). The whole drawn oak covers **69.3 %** of the coin's oak inside
x 58..82 y 25..61 and **91.8 %** of our own ink lands on device. The seven-leaf
drawing it replaces had a **153.55 sq unit stranded floating mass** — three
leaves and two stalks anchored on an extrapolated centreline five units above
where the inboard prong actually ends — and that is gone.

**Overlap is published beside containment, because on this element a low
OUTSIDE is not a pass.** A leaf can score well by sliding under a neighbour.
Measured as a fraction of each leaf's own ink: the B bunch shares 4.7–8.1 %
across its three, A1/A2 share 6.4 %, and the D bundle — which is one merged fan
on the coin — shares 43.8 / 36.8 %. That last pair was tuned against both
numbers at once: at rot 47 it read 7.0 % outside and **49.8 %** overlap (one
lump), at rot 55 **18.8 %** outside and 23.0 % overlap (out in the fork's own
open channel); 49 is where both are acceptable.

New instrument `coloringbook/judge/_dr22oakleaves.mjs` — `table` for the
geometry, the pairwise overlap matrix and containment on both files; `over` for
the eight outlined on each photograph at its own registration; `diff` for a
coin-only / ours-only map. It derives its node ids from `OAKSEATS`' order rather
than hard-coding them, because those ids move whenever a leaf is added and three
rounds have quoted a stale one.

**Published because it is not fixed:** the coin's inboard prong runs on to about
y 47.3 — the fork's open slot has a left wall that far up — where the locked stem
ends it at y 52.0. Five units of the coin's own branch are therefore covered by
leaf and petiole rather than by stem, which is why A1 and A2 carry the longest
petioles on the branch (1.5) against a coin that measures ~0.5. That is an
inherited stem defect, stated rather than corrected, because the stem is locked.

**And the ninth mass is the acorn.** A lobed-looking blob at x 56.8..63.2,
y 54.6..59.5 sits left of the trunk below the fork with nothing in the owner's
spec to match it. Measured: **21.53 sq units on proofbright, 21.72 on unc2005**,
centroids 0.7 units apart, attaching to the trunk by a neck at ~(63.5, 54.7).
Its circularity is **2.50** against **5.36** for a known oak leaf in the same
mask at the same threshold — it is round, not lobed — which agrees with round
35's two-file axis fit (30.2° / 31.3°, agreeing to 1.1°). It is already drawn,
as node `2.1.20`. No ninth leaf.

Partition: `dime.reverse` alone — of 80 emitted renders across 5 ids × 2 sides ×
4 sizes × value on/off, the 8 that changed are all `dime/reverse`. D9 180 renders
clean. D6 reverse **0.0915** against a 0.50 gate. Suite 225 + 239 = 464/464.

**CORRECTION, the same day, from the owner.** This round's largest residual —
an undrawn wedge at x 66..71, y 41..48 — was reported here as evidence that the
locked stem ends the inboard prong five units short of the coin's, and it asked
for the lock to be reopened. That is wrong. **The wedge is the coin's second
acorn**, which we do not draw: directly above (68.0, 48.5), spanning roughly
y 42..48 about x 67..69.5, pointing almost straight up, its stalk running down
past that point to the crotch. It also explains a correction from two rounds
back — *"the middle traces up the acorn's stem"* and *"well lined up on its
right side, but overflows the left side"*: the outboard prong was being pulled
onto this acorn's stalk. **The stem lock stands.** The residual is a missing
element, not a short one, and the ledger row is amended to say so.

## v1.110.0 — 2026-08-29

**FILL was never a grade out of 100, and the number that said the oak has seven
leaves a side was a reading of one threshold, not of the coin.** No art
changed; `src/` is byte-identical. This release is one new instrument and two
findings it produced.

`coloringbook/judge/_dr21target.mjs` opens the denominator `_dr13elem.mjs`
divides by. It takes the same mask, the same declared window and the same
exclusive subtraction, then splits what remains into **connected components**
with area, bounding box, centroid and cumulative share. The ceiling on an
element is the largest component's share — not 100. On `oak-stem` against
`dime-rev-proofbright.png` the exclusive target is **88.70 sq units in nine
components**, the largest **49.23 (55.5 %)**; the other 44.5 % is foliage and
lettering standing in the same rectangle, which no stem can reach without
drawing over its neighbours. Three rounds in a row read a correct element's
FILL as a failing grade. That closes ledger A41.

**Then it retracted a finding that had been constraining rounds for a week.**
Pointed at the oak with nothing of ours subtracted but the legends, the coin's
entire oak — trunk, fork, every leaf, the acorn — comes back as **ONE component
of 479.56 sq units, 97.2 % of the window**. Swept across erosion 0, 0.25, 0.50,
0.75, 1.00, 1.25 and 1.50, the count never leaves 4–5 and never once resolves a
leaf; the target simply shrinks from 493.58 to 264.10 sq units with the oak
still a single mass. **No erosion separates these leaves, because on the coin
they overlap.** So "seven leaves a side" was never a count of the coin's marks.
It was a count of what one threshold left separate, and ledger E25 — *an
estimator that cannot separate two touching marks reports their union* — turns
out to apply to a census exactly as it applies to a measurement. The owner's
ruling R5 (eight leaves, four groups, individually overlapping) is now the only
evidence on this element that is evidence at all. Ledger A42.

**And the window it was measured in is 41 % not-oak.** `WINDOWS['oak-branch']`
runs to y 78 and x 85, so its 822.38 sq unit raw target sweeps in the coin's
ONE DIME legend — a row of seven components at y 61.8..67.1 — and the rim band
beyond x 82. Our own `<text>` nodes do not subtract those, because subtraction
removes mask where *our* letters fall and ours are not the coin's. They are
real marks; they are not the branch's. The oak is x 58..82, y 25..61. The table
is not edited — `_dr13elem`'s `WINDOWS` is hashed into published rounds — so
the new instrument takes `--win x0,x1,y0,y1` instead. Ledger A43, open and
note-only.

Also recorded, as owner rulings rather than findings, so the next rounds
inherit them: **R3** the dime's oak stem is locked and verified by node diff;
**R4** proofbright is the placement reference and unc2005 refines shape only;
**R5** the eight-leaf topology above.

Suite **225 + 239 = 464/464**.

## v1.109.0 — 2026-08-29

**The prong's width was measured with one edge definition and its face with
another, and the branch carried the difference.** Fourteenth element round on
the dime reverse, third set by the owner's reading of the coin. Partition:
`dime.reverse` alone, 3 of 108 emitted paths (the oak branch at its three
relief tiers) — every other emitted path across 4 coins × 2 sides × 3 sizes is
**byte-identical**, and inside the one path that changed the oak subpath is
byte-identical too. D9 150 renders clean. D6 reverse **0.0934** against a 0.50
gate; D7 reverse's fitted subject is empty and the worst authored turn is
unchanged at 148.3° (the olive's); D8 dime reverse **0.0000 %**. Suite
**225 + 239 = 464/464**.

**THE OWNER.** *"The path of the right branch is very good. It is too thick
overall though, it is well lined up on its right side, but overflows the left
side. The left branch path is improved, but has similar issues."*

**THERE ARE THREE EDGE DEFINITIONS ON THIS PHOTOGRAPH AND THEY DIFFER BY 0.95
UNITS.** A raised branch on `dime-rev-proofbright.png` is a mid-grey RIDGE
between two DARK SHADOW VALLEYS with bright field outside. One row, y 53, raw
file offsets:

| estimator | inboard | outboard | width |
|---|---|---|---|
| valley-to-valley (the ridge alone) | 16.90 | 17.90 | **1.00** |
| half-max (mid-slope, both sides) | 16.70 | 18.20 | **1.50** |
| 237-cut footprint (shadows included) | 16.45 | 18.40 | **1.95** |

Every number this branch has ever been fitted against came from the third —
round 38's fork pocket, round 39's trunk, round 41's `PFACE`. So "1.90 wide"
and "1.00 wide" are both true readings of the same row, and picking between
them by eye is how a branch ends up 26 % over at the crotch and 65 % over at
the tip.

**THE CHOICE IS MADE BY CALIBRATION, NOT BY TASTE.** The oak TRUNK at y 62..69
was fitted in round 39 and the owner has never called it thick. Put all three
estimators on it (`judge/_dr20prongwidth.mjs hm`), proofbright, nine rows:

| | inboard | outboard | width |
|---|---|---|---|
| coin, 237-cut (y 68) | 14.78 | 17.35 | 2.57 |
| coin, **half-max** (y 68) | 14.95 | 17.15 | **2.20** (2.00..2.20 over nine rows) |
| coin, valley-to-valley | 15.10 | 16.95 | 1.85 |
| **our accepted trunk** | 15.10 | 17.25 | **2.15** |

Our accepted trunk is **0.05 off half-max in width** and 0.15 in / 0.10 out on
its two faces; it is 0.42 off the 237-cut and 0.30 off valley-to-valley.
**Half-max is the width standard.** It is also the only one of the three that
runs unchanged on our own render — whose profile is a step, so its half-max IS
its path — which is what makes the coin column and the drawn column comparable
at all.

**THE PRONG, half-max, on rows bounded by field on both sides.** `--erode 0`,
reopen 1.0 on proofbright only; unc2005 quoted, not reasoned from:

| y | 54.5 | 54 | 53.5 | 53 | 52.5 | 52 | 51.5 | 51 | 50.5 | 50 | 48 | 47.5 | 45 | 44.5 | 44 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| pb | 1.45 | 1.50 | 1.50 | 1.50 | 1.45 | 1.50 | 1.50 | 1.45 | 1.40 | 1.45 | 0.95 | 1.00 | 1.05 | 1.10 | 1.25 |
| unc | — | — | — | 1.60 | 1.65 | 1.55 | 1.50 | 1.65 | — | 1.40 | 1.25 | — | 0.80 | 1.20 | 1.70 |
| **drawn before** | 1.90† | 1.90 | 1.90 | 1.90 | 1.90 | 1.95 | 1.90 | 1.90 | 1.90 | 1.90 | 1.95 | 1.90 | 1.70 | 1.65 | 1.60 |
| **drawn now** | 1.50† | 1.50 | 1.50 | 1.50 | 1.50 | 1.55 | 1.50 | 1.50 | 1.50 | 1.50 | 1.20 | 1.20 | 1.20 | 1.15 | 1.15 |

† y 54.5 is computed from the shipped formula, not read off the ink: on that
row the prong's foot has already fused into the trunk and the element renders
one run there.

Pooled: **1.51** over y 50..54.5, **1.15** over y 44..48. Rows y 48.5..49.5 are
the two marks fusing (round 41) and are not used; the ramp between the two
plateaus is drawn over y 48..50 and is the only interpolation here.

**THE FACE DID NOT MOVE, AND THAT IS PROVED, NOT ASSERTED.** Half-max would
pull `PFACE` 0.26 inboard at y 53 — that is the path the owner just approved,
so it is refused with the number. The width comes off the INBOARD side only.
Both faces, coin against drawn, raw proofbright offsets:

| y | coin 237-cut | coin half-max | drawn **before** | drawn **now** |
|---|---|---|---|---|
| 54.0 | 16.05..18.05 | 16.25..17.75 | 16.10..**18.00** | 16.50..**18.00** |
| 53.0 | 16.45..18.40 | 16.70..18.20 | 16.55..**18.45** | 16.95..**18.45** |
| 52.0 | 16.90..18.95 | 17.20..18.70 | 17.00..**18.95** | 17.40..**18.95** |
| 51.0 | 17.35..19.35 | 17.70..19.15 | 17.50..**19.40** | 17.90..**19.40** |
| 50.0 | 17.80..19.80 | 18.10..19.55 | 17.95..**19.85** | 18.35..**19.85** |
| 48.0 | 19.20..20.80 | 19.50..20.45 | 18.85..**20.80** | 19.60..**20.80** |
| 47.5 | 19.45..21.00 | 19.65..20.65 | 19.10..**21.00** | 19.80..**21.00** |
| 45.0 | 20.00..21.45 | 20.20..21.25 | 19.85..**21.55** | 20.35..**21.55** |
| 44.0 | 19.85..21.60 | 20.05..21.30 | 19.95..**21.55** | 20.40..**21.55** |

The outboard column is identical in every row, and the emitted subpath proves
it: the seventeen points that run down the prong's outboard edge from the tip
to the crotch are unchanged character for character (`70.73 41.2 L 71.02 42 …
L 67.37 54.6`). Only the inboard return moved — **plus** the two points below
the crotch, `55.3` and `55.9`, which move 0.10 and 0.20 outboard. Those are the
FOOT TAPER, buried a unit and a half inside the trunk: the element's rendered
outboard end at y 55.0 and 55.5 is 17.55 and 17.50 before and after, unchanged,
because the prong's foot is fused into the trunk there and never reaches the
silhouette. Stated because "the face did not move" would otherwise be a claim
about 17 of 19 points. Mechanically, the prong is now defined by
`prongFace(y) − prongHW(y)`, where above the knee `prongFace` is round 41's
parabola PLUS round 41's half-width — the only construction that holds that
round's approved face fixed while the width changes underneath it.

**THE CROTCH IS NOT SPECIAL, AND THAT WAS WORTH CHECKING.** Half-max reads 1.45
at y 54.5 and 1.50 at y 54 — the same as every row up to y 50. The "1.95 at the
crotch" this round replaces was the 237-cut, which is 0.45 wider than half-max
*everywhere* on this branch. There is no widening into the fork to preserve.

**THE INBOARD PRONG IS NOT CHANGED, AND THE REASON IS A MEASUREMENT.** Round 38
recorded that its inboard face is never separable on either file; the 237-cut
brackets it on exactly three proofbright rows and gives 2.30 / 1.95 / 1.25 at
y 53.5 / 54 / 54.5 — a spread of 1.05, which settles nothing. But half-max at
y 53.5, the one row where both its faces are readable, gives **13.80..15.40**
against our drawn **13.80..15.35**: 0.00 on the inboard face, 0.05 on the
outboard. `FORK.hw` stays 0.78 because the coin says it is right, not because
the row was hard.

**PUBLISHED AGAINST ITSELF.** The element's FILL FELL and that is by
construction: FILL's target is the flood mask, which is the *footprint*, and we
have deliberately stopped drawing the shadow skirt. Raw 28.37 → 25.68 %,
exclusive 34.95 → 32.60 %, ink 79.60 → 72.90 sq units. What moved the right way
is OUTSIDE on `_dr17oakfork.mjs outside`: proofbright **7.34 → 5.58** sq units
(9.22 → 7.65 %). On unc2005 the absolute outside is **unchanged at 15.44** and
only its ratio rises (19.39 → 21.18 %) because the denominator shrank — that
file fuses this whole region into one slab, so ink removed from the inboard
side was ink inside its mask. And on `_dr13elem.mjs score`, whose window and
mask setting are different again, the absolute outside is **5.57 sq units
before and after** while its ratio rises 6.99 → 7.64 % — the same denominator
effect. Three numbers, one of them in our favour and two of them not; all
three published. The gate is the overlay, not any of them.

Nonzero vs evenodd area on the element: **72.90 against 71.97** — unequal, so
the two subpaths still wind the same way and the round-38 cancelling hole has
not come back.

**NO LEAF MOVED.** 3 connected components before and after; stranded mass
137.21 + 16.34 = **153.55 sq units, identical to the hundredth**; `oakC` is
untouched, so every leaf anchor is untouched.

**WHAT IS STILL WRONG, NAMED.** Holding the approved face while using the
half-max width leaves the drawn prong sitting ~0.15..0.26 outboard of its
half-max band on *both* faces. That is one stated uniform bias inherited from
`PFACE`, and the only way to remove it is to move the path — which is the
owner's call, not this round's. And `FORK.out` (0.95) is no longer this prong's
half-width: it is a flood-mask/pocket quantity, it never reaches the drawing,
and the two numbers have separated because they are measured with different
edge definitions. Both are correct for their own estimator; do not reconcile
them.

**THE DISPATCHED MEASUREMENT, CHECKED.** The width table sent with this round
reproduces exactly — as the half-max estimator with its row labels shifted: its
0.95 / 1.00 / 1.05 / 0.90 / 1.15 / 0.75 are the half-max widths of rows
y 44..49, not y 43..49.5. Its *diagnosis* does not: at y 50..54 proofbright has
open field on both sides of a **single** mark (16.40..17.80 inboard and
19.80..20.10 outboard at y 50) and the photograph shows one stippled ridge
there, so the 1.90 is the footprint of one prong including both shadow bands,
not the union of two marks. The correction is 1.90 → 1.50 on those rows, not
1.90 → 0.95.

## v1.108.0 — 2026-08-29

**The oak's outboard prong is ONE straight lean, and its outboard face was the
measurable thing all along.** Thirteenth element round on the dime reverse, and
the second set by the owner's reading of the coin. Partition: `dime.reverse`
alone, 3 of 108 emitted paths (the oak branch at its three relief tiers), all
sizes. D9 0 faulty over 180 renders. D6 reverse **0.0934** against a 0.50 gate;
D7's authored-turn census unchanged (worst 148.3° is the olive's, untouched);
D8 0.0000 % both sides, response test passes. Suite **464/464**.

**THE TWO FAULTS.** The owner: *"The left branch is much better. Its connection
point to the fork is not very smooth though. The right branch now starts well
and terminates at about the right place, but the middle traces up the acorn's
stem and then jumps across a blank space to get to that end instead of
following its own actual path."* Both held.

**THE MIDDLE. WE WERE A UNIT INBOARD ACROSS y 47..49.** Round 40 fitted the
prong to the fork channel's outboard wall, which is the wall of an enclosed
field pocket and therefore ends at y 47.4 — so the fit plateaued at y 49.9 and
a smoothstep (labelled at the time as the round's free parameter) carried it to
the tip. But the prong's OUTBOARD face is a different edge: it has open field
on the far side of it on **every** row from the trunk to y 47.5, and nothing
merges there. Read row by row off the grey profile with no mask in the path
(`judge/_dr19prongmid.mjs`), in this element's registration:

| y | 54 | 53 | 52 | 51 | 50 | 49 | 48 | 47.5 |
|---|---|---|---|---|---|---|---|---|
| coin, pb profile | 17.70 | 18.05 | 18.60 | 19.00 | 19.45 | 20.00 | 20.45 | 20.65 |
| coin, pb mask | 17.65 | 18.05 | 18.55 | 18.95 | 19.35 | 19.95 | 20.40 | 20.65 |
| coin, unc profile | 17.95 | 18.45 | 18.85 | 19.30 | 19.70 | 20.10 | 20.55 | 20.85 |
| drawn **before** | 17.85 | 18.25 | 18.65 | 19.05 | 19.40 | **19.45** | **19.45** | **19.65** |
| drawn **now** | 17.65 | 18.10 | 18.60 | 19.05 | 19.50 | 19.95 | 20.45 | 20.65 |

Least squares over the fifteen proofbright rows y 47.5..54.5: **17.325 +
0.4618·(54.7 − y), RMS 0.046, largest residual 0.083.** It is a LINE. unc2005,
which has the opposite polarity and reads 0.15..0.25 outboard everywhere, gives
the same shape at 0.4375 per unit. Worst face error was **1.00 at y 48**; it is
now **0.15 at y 55**, and 0.05 or less on fifteen of the seventeen rows.

**AND THE MARK OUR MIDDLE WAS DRAWN ON IS A DIFFERENT MARK.** At y 48
proofbright carries two marks with 0.15 units of field between them — offsets
17.30..18.70 and 18.85..20.45 — which fuse below y 49.5 into the single
1.95-wide slab round 38 measured. The prong is the outboard one: it continues
the fitted line and it arrives at the settled 20.40 at y 44. Ours sat on the
inboard one, the owner's "acorn's stem", from y 48 to y 50.

**WHICH RUN IS THE PRONG, DECIDED BY CONTINUITY AND NOTHING ELSE.** The table
above comes from a tracker seeded at y 55.5 on the trunk — one unambiguous mark
— that takes the run whose outboard end is nearest the row below's and STOPS if
the nearest has moved more than 0.6. It walks 19 rows on both proofbright
estimators and 18 on unc2005 before the crown closes over it at y 46.5. A rule
that picked "the outermost run inboard of offset 22" was tried first and is
refused: it locks onto the wreath's outer leaves, which are separated from the
prong by a channel only 0.3 wide on some rows.

**THE SHAPE IS NO LONGER AN INTERPOLATION.** Below the knee the centre is the
fitted face minus a half width, row by row. Above it, a parabola with its
vertex on the settled (20.40, y 44) — itself a measurement, three estimators
inside 0.02 (round 40). `knee` 47.97 and `k` 0.0582 are not free: they are the
unique pair that makes the parabola tangent to the line in value AND slope.
The centre's slope runs 0.46 / 0.46 / 0.41 / 0.29 / 0.17 / 0.06 per unit from
y 50 up to y 44 — monotone, no flat section, no step.

**THE CROTCH HAD A SHELF 1.37 UNITS TALL.** The shipped path ran
` L 65.2 54.7 L 63.83 54.35 `: the oak's inboard silhouette moved 1.37 in x
over 0.35 in y, a slope of 3.9, where the rows above and below it move at 0.1
and 0.7. proofbright's mask has no step at all — 12.55 / 13.05 / 13.50 / 13.80
/ 14.05 / 14.20 at y 53 / 53.5 / 54 / 54.5 / 55 / 55.5, one lean at about half
a unit per row. A **fillet** over y 54.25..55.9, the prong's own foot, replaces
the step: drawn, at the polygon's own vertices, 13.44 (54.35) / 13.50 (54.5) /
13.76 (54.7) / 14.19 (55.0) / 14.79 (55.4) / 15.16 (55.9) — monotone, steepest
segment 1.5 per unit of y instead of 3.9.

**⚠️ THE FILLET IS ADDED TO THE OUTLINE, NOT TO `oakC`, AND NO LEAF MOVES.**
`leafAt` anchors every oak leaf on `oakC`, and the ladder row ay 54.99 sits
inside the fillet's band; folding it into `oakC`/`oakHW` would have dragged
that leaf 0.37 units inboard, away from the coin's own local centre of 16.70 at
that height. A fillet is metal added at a junction — it does not move the
trunk's axis. So the oak's outline is no longer symmetric about `oakC`: the
outboard edge is `oakC + oakHW`, unchanged, and the inboard edge is a new
`oakInFace`, identical to the old expression outside y 54.25..55.9 by
construction. The oak side still has exactly **3** connected components,
the stranded upper mass is **138.78 sq units** to the hundredth as before, and
its nearest approach to the rest is **0.63 units at (59.0, 42.0)** — unchanged,
and on the inboard side, nowhere near the prong.

**WHAT IT COSTS AND WHAT IT BUYS.** Element ink 78.64 → **79.60 sq units**. At
each file's own registration (`judge/_dr18prong.mjs bands`) the fork band
y 48..54 goes **95.8 → 97.4 %** on proofbright and the whole element 95.4 →
95.6 % / 96.1 → 96.1 %. On the older un-registered `_dr17oakfork.mjs outside`
proofbright is 9.25 → **9.22 %** on more ink, and **unc2005 goes 17.65 →
19.39 %** — reported, not hidden: that instrument applies no per-file
registration, and unc2005's strokes are thinner than the coin's relief, so
moving onto proofbright's mark moves off unc's. The registered band table is
the one to reason from and it is flat on unc.

**NONZERO CHECKED.** The element's area is 79.600 under nonzero and 78.345
under evenodd — the two subpaths overlap by 1.255 sq units and it is unioned,
so there is no cancelling hole in the crotch.

**WHAT IS NOT DETERMINED.** The prong above y 44: `PRONG.out` is held constant
to the tip at y 40.3 because nothing up there is separable. And the trunk's
inboard face at y 55..58 is about **1.0 unit outboard** of the coin (drawn
15.19 at y 55, mask 14.05) — that is the same defect the round-39 ledger named
as the WAIST, it is out of this round's scope, and it is why the fillet lands
0.3..0.7 outboard of the coin's own silhouette instead of on it.

## v1.107.0 — 2026-08-27

**The oak's left prong ends almost at once; the right one goes up and OUT, not
straight up.** Twelfth element round on the dime reverse, and the first set by
the owner's own reading of the coin instead of by a metric. Partition:
`dime.reverse` alone, 6/60 cells, all sizes. D9 0 faulty over 180 renders. D6
reverse **0.0933** against a 0.50 gate; D7's authored-turn census unchanged
(worst 148.3° is the olive's, untouched); D8 0.0000 % both sides. Suite
464/464.

**THE THREE FAULTS.** The owner, reading the gridded proof: *"The left branch
should end almost immediately where it transitions to 2 overlapping leaves. The
right branch is too thin at the point of divergence, and then traces up the
acorn stem instead of continuing up to the right and tapering to where the 3
leaf bundle starts."* All three held.

| | drawn before | the coin | drawn now |
|---|---|---|---|
| inboard prong ends at | y 38.4 | y ≈ 52 (leaves take over) | **y 52.0**, tip (14.27, 52.0) |
| outboard prong at y 54 | 0.86 wide | 1.90 (15.75..17.65) | **1.95** (15.90..17.85) |
| outboard prong at y 44 | 17.52..19.42 | 19.55..21.25 | **19.60..21.20** |

**WHY NO MEASUREMENT HAD CAUGHT IT.** Channel width constrains only the GAP
between the two prongs over y 48..53. Both prongs can be displaced together, or
run the wrong way above y 48, and it still measures 1.50. The whole-element
figure has the same blindness in the other direction: it averaged a 79.6 % band
into two 99 % ones and reported 94.7 %. The new instrument
(`judge/_dr18prong.mjs`) scores the branch element alone, band by band, at each
file's own registration:

| band | before pb / unc | after pb / unc |
|---|---|---|
| upper prongs y36–44 | 79.6 / 66.9 % | **100.0 / 100.0 %** |
| prong mid y44–48 | 99.8 / 97.2 % | 97.4 / 99.2 % |
| fork y48–54 | 97.8 / 100.0 % | 95.8 / 100.0 % |
| trunk y54–62 | 95.7 / 96.0 % | 95.3 / 96.1 % |
| trunk y62–70 | 96.6 / 95.7 % | 96.6 / 95.7 % |
| foot y70–78 | 90.6 / 90.0 % | 90.6 / 90.0 % |

The upper band carried 9.20 sq units before and 4.27 after, so a good part of
that 20 points is ink WITHDRAWN, not ink moved — which is fault (1), stated as
a number.

**OFFSET 20.40, THREE WAYS, AGREEING TO 0.02.** The flood mask's isolated run
at y 43.5 / 44 / 44.5 centres on 20.38 / 20.40 / 20.38 and is 1.70 wide against
this prong's own measured 1.85..1.94 at y 50..53; unc2005 confirms its inboard
face on the same rows and has merged outboard. The grey profile, no mask in the
path at all, puts BARE FIELD at 19.0..19.5 on y 43, 44 and 45 — our prong was
drawn through it — and bare field at 19.75..21.10 on y 48, so the swing happens
between y 48 and y 45. The dark relief outline, which never touches the flood
mask, traces one continuous mark 17.05 (y 54) → 18.80 (y 50) → 20.75 (y 44);
quoted as a delta because it reads 0.36 outboard of the round-38 pocket fit on
the rows they share, that is +1.95 from y 50 to y 44, and 18.44 + 1.95 = 20.39.

**⚠️ SIX OAK NODES ARE STRANDED, AND THE ROUND WAS DISPATCHED WITH THAT
RELEASED.** `2.1.13`..`2.1.17` — three blades and two petioles, 137.21 sq units
— now float as one mass, nearest approach 0.95 units. Only the acorn was
detached before. Their ladder rows (ay 47.37, 45.68, 40.51, 40.04) hang on
`oakC` above the prong's new end; `oakC`/`oakHW` are unchanged so nothing moved,
it is the ink under them that went. The leaves are the next round.

**WHAT IS NOT DETERMINED.** The shape of the swing across y 46..47: both files
are one slab from offset 13 to 21 there, so no two curves sharing the endpoints
can be told apart. A smoothstep is drawn and labelled.

## v1.106.0 — 2026-08-27

**The oak trunk flares into its foot on ONE side only, ours leaned the other
way, and the two faults cancelled.** Eleventh element round on the dime
reverse. Partition: `dime.reverse` alone, 6/60 cells, all sizes — 3 of the 108
emitted paths differ and all three are the oak stem, so the olive is byte
identical. D9 0 faulty over 180 renders. D6 reverse **0.0922** unchanged
against a 0.50 gate; D7's authored-turn census unchanged; D8 0.0000 % both
sides. Suite 464/464.

**THE FAULT.** Flood mask at erode 0, eight clean rows, both files, in the
round-38 registration (widths need no registration; only the faces do):

| y | 62 | 63 | 64 | 65 | 66 | 67 | 68 | 69 |
|---|---|---|---|---|---|---|---|---|
| pooled inboard face | 14.65 | 14.68 | 14.70 | 14.70 | 14.68 | 14.58 | 14.48 | 14.53 |
| pooled outboard face | 17.10 | 17.05 | 17.03 | 17.00 | 16.95 | 17.03 | 17.05 | 17.10 |
| pooled width | 2.45 | 2.38 | 2.33 | 2.30 | 2.28 | 2.45 | 2.58 | 2.58 |
| before | 2.10 | 2.15 | 2.10 | 2.15 | 2.15 | 2.20 | 2.15 | 2.20 |
| **after** | **2.40** | **2.40** | **2.40** | **2.40** | **2.40** | **2.50** | **2.60** | **2.60** |

**TWO FAULTS THAT CANCELLED.** The coin's outboard face does not move —
17.03 ± 0.07 on the pooled reading and on each file taken alone. Ours leaned
inboard at `SC.b` = −0.0294 per unit of y, 17.05 → 16.90, because it was drawn
off `stemC`, a centreline fitted on both branches at once. Our inboard face
swept out 0.25, close to the coin's 0.20, and the outboard lean ate 0.15 of it.
Worst face error 0.30 → **0.10**.

**WHY THIS IS NOT THE `stemHW` WIDENING THAT WAS REFUSED.** That refusal is
about ABSOLUTE width, where the flood mask counts a proof's bevel skirt as
device and the dark-relief estimator disagrees by 0.5. A skirt is a constant
added to BOTH faces: it cancels in a difference between rows and it cannot be
one-sided. What is measured here is 0.20 of sweep on the inboard face with the
outboard face stationary, on each file independently. The second estimator is
consistent as far as it reaches (`_dr14oakstem.mjs line` reads the oak trunk at
2.30/2.55 near y 62 and 2.40/2.50 at y 68..69) but cannot arbitrate: the legend
blanks its rows y 62.5..67.5 and it never sees the middle of the span.

**THE OLIVE IS BYTE IDENTICAL**, verified by diffing all 108 emitted paths —
`stemC`/`stemHW` are untouched and the trunk is drawn from two new oak-only
faces, the same per-plant override `oakC`/`oakHW`/`OAKROT` already are. **No
oak leaf moved**: the measured shape is ramped in over y 58..62 because the
foliage closes over the trunk above y 62 on both files, and the lowest ladder
row attaches at ay 57.00. Overlap with all twelve sibling elements is unchanged
to 0.01 sq units; of 3.04 new sq units of ink, 2.90 is exclusive.

**⚠️ THE JUDGE'S "BLUNTER AND SHORTER BARB" IS REFUTED, WITH THE NUMBER, and
nothing in the foot is changed.** Our barb tip is (13.30, 75.4); proofbright's
is (13.10, 74.9) and unc2005's is (13.05, 76.2) — ours is 0.5 longer than one
file and 0.8 shorter than the other, i.e. at the pooled value and inside a
1.3-unit disagreement. Bluntness as the width 0.5 units above the tip: ours
0.72, proofbright 1.30, unc2005 0.85 — ours is the sharpest of the three. The
barb's inboard edge tracks the pooled edge within 0.10 on every row y 70..75,
its axis is 3.35 units long at 9.5° off vertical against a pooled 3.49 at
13.2°, and the notch floors at y 69.85 against a pooled 69.7.

**SCORES**, absolute sq units, element ink 93.61 → 96.65:

| | covered before | covered after | outside before | outside after |
|---|---|---|---|---|
| proofbright, erode 0 | 90.06 | **91.53** | 3.55 | **5.12** |
| proofbright, erode 0 `--reopen 1.0` | 86.37 | **87.84** | 7.24 | **8.81** |
| unc2005, erode 0 | 76.96 | **79.48** | 16.65 | **17.17** |

OUTSIDE rises on both files and that is arithmetic, not a regression: the score
is unregistered, the two photographs disagree by 1.00 unit in coin x, and the
drawing sits between them — so widening toward the pooled faces necessarily
crosses one file's raw mask. Of the 3.04 sq units of ink added, 1.47 lands on
proofbright's mask and 2.52 on unc2005's — a mean of **2.00 on device against
1.05 outside**.

**WHAT IS STILL NOT DRAWN.** Both files see a WAIST at y 57..58.5 — outboard
face 16.80 (pb 16.85, unc 16.75) against 17.08 at y 56 and 17.10 at y 62. Those
rows carry a leaf, so only the outboard half of it is readable, and drawing
half a waist would move the y-57.0 leaf for a shape no estimator has both sides
of. Named rather than chased.

## v1.105.0 — 2026-08-27

**The fork is a SLOT and not a wedge, the registration it was fitted in was
0.55 out, and the oak's foot has its third point.** Tenth element round on the
dime reverse. Partition: `dime.reverse` alone, 6/60 cells, all sizes — 12
distinct tags changed, every one at x ≥ 57.96, so the olive is byte identical.
D9 0 faulty over 180 renders. D6 reverse 0.0924 → **0.0922** against a 0.50
gate; D7's authored-turn census is unchanged (2 obverse / 19 reverse paths over
75°, same five worst). D8 0.0000 % both sides. Suite 464/464.

**THE FAULT.** The channel between the two prongs tapered 3.05 → 0.90 over
y 48..53 where both photographs hold a near-constant 1.5–1.8. Measured on the
element alone at 20 px/unit, the judge's own rule (largest field run with ink on
both sides):

| y | 48 | 49 | 50 | 51 | 52 | 53 | 54 |
|---|---|---|---|---|---|---|---|
| proofbright | 1.65 | 1.35 | 1.55 | 1.75 | 1.55 | 1.05 | 0.60 |
| unc2005 | 3.70 | 1.85 | 1.65 | 2.05 | 2.10 | 1.70 | 1.20 |
| before | 3.00 | 2.65 | 2.35 | 1.85 | 1.35 | 0.85 | 0.00 |
| **after** | **1.45** | **1.45** | **1.60** | **1.70** | **1.60** | **1.25** | **0.60** |

Worst residual against proofbright 0.20, and inside the two files' own envelope
on every row but y 48, where they disagree by 2.05.

**IT WAS TWO FAULTS AT OPPOSITE ENDS, AND NEITHER WAS "ONE PRONG LEANS TOO
HARD".** Read as the two walls of the enclosed field pocket (`_dr17oakfork.mjs
prongs`, seeded per file so unc2005's own 12.05 sq unit component is the one
measured), BOTH walls swing outboard out of the crotch and BOTH flatten by
y 50 — the fork is a lens, not a V. Our outboard prong kept leaning (18.80 at
y 50, 19.57 at y 48 against a pooled wall of 17.48 and 17.28) while the inboard
prong was clamped straight at −1.50. The outboard prong is also the one mark in
the fork whose BOTH faces are separable, so its half-width is now measured —
1.92 / 1.85 / 1.85 / 1.94 at y 50 / 51 / 52 / 53, i.e. **0.95**, not the
inboard prong's 0.78.

**THE REGISTRATION WAS 0.55 OUT AND THAT IS THE REUSABLE FINDING.** v1.104.0
placed each file by ONE row (y 55.5/56) of ONE mark — a row inside the fork,
where the outboard prong is still fused to the trunk and widens it. Re-measured
on the flood mask over the eight clean rows y 62..69, with the same estimator
run on OUR OWN RENDER as on the photographs:

| | oak trunk | olive trunk | torch shaft | v1.104.0 | now |
|---|---|---|---|---|---|
| proofbright | 16.184 | 15.494 | 50.348 | +0.18 | **−0.35** |
| unc2005 | 15.125 | 16.428 | 49.312 | +1.24 | **+0.65** |
| ours | 15.881 | 15.881 | 49.970 | | |

Three features and they agree. If the difference were OUR drawing — the two
branches too close together — the oak and the olive would disagree in sign;
they do not, so it is a whole-image translation. The file-to-file spread is 1.00
either way, so the two rounds differ only in COMMON MODE, which is exactly what
a one-mark registration cannot see and an oak/olive/torch null test can.

**THE FOOT'S THIRD POINT IS DRAWN, reversing v1.104.0's refusal.** On the mask
the spur is a SEPARATE run — proofbright y 69 carries 13.40..14.10 with a 0.50
gap before the trunk, unc2005 y 69.5 carries 13.50..13.95 — so it is 0.7 wide
and ~0.8 tall, not the "~0.5 units" it was refused as. The same pass found the
heel was already right (v1.104.0's "drawn 0.30 inside the pooled reading" was
the registration, not a margin) and the barb's inboard edge 0.4 to 1.2 too far
outboard on every row, which is why our foot read as a chamfer and the coin's
reads as a claw.

**WHAT IT COST, stated.** Element ink 86.00 → 93.61 sq units. Absolute outside
1.72 → 3.55 (proofbright, erode 0), 4.10 → 7.24 (with the fork reopened),
16.19 → 16.65 (unc2005); exclusive covered 64.59 → 70.66 and 52.98 → 61.13. The
fork alone is nearly free (+4.23 ink, +4.34 covered, **+0.19** outside on
proofbright); the foot is where the outside went, and it is registration —
the scorer applies none, so a mark drawn at the pooled position always costs
~0.35/row on proofbright and gains ~0.65 on unc2005.

**Six oak leaves moved with the branch, by 0.09 to 0.32 units; none stranded.**
`leafAt` already evaluates `oakC` on the oak.

**REFUSED, with the number.** The coin's trunk WIDENS toward the foot — mask
2.20 at y 63 to 2.55 at y 69 (pooled), where ours goes 2.05 to 2.20. That is
`stemHW`, which the mirrored olive reads, and the olive must stay byte
identical. Recorded for the round that owns both branches.

## v1.104.0 — 2026-08-26

**The oak's stem now runs up the INBOARD PRONG, the branch has a two-pointed
foot, and the leaf ladder moved with the branch.** Ninth element round on the
dime reverse, and the one that finally spends the refusal the last three rounds
kept writing down. Partition: `dime.reverse` alone, 6/60 cells, all sizes —
36 tags of 291, every one of them at x ≥ 62.41, so the olive is byte identical.
D9 unchanged (the reverse has no fitted contour; the authored-turn census is
identical, 457 over 75° on 107 paths, same six worst). D6 reverse 0.0926 →
**0.0924** against a 0.50 gate. Suite 464/464.

**THE FAULT, IN ONE LINE.** With the fork reopened, 6.82 of the element's 11.99
outside sq units — 58 % — was in the six rows y 47..53, where our spike was
drawn straight down the middle of a gap both photographs agree about. Those six
rows now carry **0.21**.

| proofbright, erode 0 + reopen 1.0 | y 47 | 48 | 49 | 50 | 51 | 52 | 53 | Σ |
|---|---|---|---|---|---|---|---|---|
| before, outside sq units | 0.53 | 0.89 | 0.76 | 1.22 | 1.52 | 1.22 | 0.68 | **6.82** |
| after | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.05 | 0.16 | **0.21** |

**WHERE THE INBOARD PRONG IS — measured, not taken from the dispatch.** The
number the last round published (centre 14.2..15.3 over y 48.5..53.5) is the
midpoint of the fork channel's inboard wall and the nearest bare run inboard of
the foliage: on proofbright at y 48.5 those are 16.6 and 11.2, so it takes the
middle of a 5.4-unit mass where the prong is 1.5 wide. It reports the centre of
prong-plus-leaf. Re-read instead off grey PROFILES across the fork — every 0.1
unit of offset at every half-row, so a mark's own two dark relief edges are
visible instead of only the bare field between marks — and each file put in the
drawing's frame by ITS OWN trunk on the same profiles by the same rule
(darkest-point to darkest-point): proofbright's trunk is 14.90..17.05 at y 55.5,
0.18 inboard of `stemC`; unc2005's is 13.80..16.00 at y 56, 1.24 inboard.

| y | 54 | 53 | 52 | 51 | 50 |
|---|---|---|---|---|---|
| proofbright | 15.13 | 14.83 | 14.83 | 14.65 | 15.15 |
| unc2005 | 14.54 | 14.34 | 14.49 | 14.89 | — |
| **pooled** | 14.84 | 14.59 | 14.66 | 14.77 | 15.15 |
| drawn | 15.29 | 14.74 | 14.77 | 14.80 | 14.83 |

The prong does not keep diverging: it kicks inboard at the crotch and then runs
**parallel to the trunk, 1.50 units inboard of it**, which is why `oakC` is a
clamp and not a lean. Max residual **0.16** over five rows on two files. The
same profiles put the crotch at y 54.3 (pb) and y 55.1 (unc); 54.7 is drawn.
The prong is 1.50..1.70 wide against the trunk's 2.15, so it is drawn at the
outboard prong's own 0.78 half-width. `stemHW` is untouched.

**THE FOOT HAS TWO POINTS.** Read off `_dr17oakfork.mjs crop 60 70 68 80 100`,
the photographs themselves at 100 px per unit with no mask in the path:

| | heel (outboard point) | barb tip |
|---|---|---|
| proofbright | 18.0 at y 70.9 | 13.68 at y 74.8 |
| unc2005 | 18.1 at y 71.1 | 13.74 at y 75.9 |
| **pooled** | 18.05 at y 71.0 | 13.71 at y 75.35 |
| drawn | 17.75 at y 71.0 | 13.55 at y 75.2 |

The heel is drawn 0.30 inside the pooled reading on purpose — a flare fitted
exactly to two hand-read points is fitted to two points. Foot rows y 73..75 went
**1.42 → 0.15** outside sq units on proofbright.

**THE LADDER MOVED WITH THE BRANCH, so nothing is stranded.** `leafAt` now
evaluates the plant's own centreline — `oakC` on the oak, `stemC` on the olive —
the same one-line per-plant override `OAKROT` already is. Five of the seven oak
rows sit above the crotch (ay 51.23, 50.38, 47.37, 45.68, 40.51, 40.04) and each
moved inboard by exactly 1.50 with its blade AND its petiole: in the emitted SVG
the five `<g transform>` blade groups and the five petiole polygons changed by
1.50 and nothing else did. **No leaf is detached.** Blade outlines, lengths and
angles are untouched; this is leaf PLACEMENT, which this round was dispatched
with permission to break.

| mask | OUTSIDE % | outside sq | FILL raw | FILL excl | exclusive covered | ceiling |
|---|---|---|---|---|---|---|
| pb erode 0.55 | 16.52 → 17.32 | 14.42 → 14.89 | 37.98 → 37.02 | 45.70 → 43.57 | 52.99 → 52.27 | 50.1 |
| pb erode 0 | 3.39 → **2.00** | 2.96 → **1.72** | 34.00 → 33.99 | 40.01 → 39.82 | 63.70 → **64.59** | 45.9 |
| pb erode 0 + reopen 1.0 | 13.74 → **4.77** | 11.99 → **4.10** | 32.04 → **35.04** | 37.72 → **41.42** | 56.53 → **62.61** | 47.0 |
| unc erode 1.00 | 59.19 → 62.57 | 51.65 → 53.81 | 26.27 → 23.51 | 30.91 → 27.56 | 24.82 → 22.59 | 35.3 |
| unc erode 0 | 18.42 → 18.83 | 16.08 → 16.19 | 29.05 → 28.46 | 33.46 → 32.85 | 53.44 → 52.98 | 39.9 |

Ink 87.26 → 86.00 sq units. **FILL % is not comparable across this change and
the covered column is why**: the leaves moved, so the exclusive target — "mask
nothing else draws" — moved with them (pb erode 0: 159.21 → 162.21). On the
reopened proofbright mask the drawing covers **6.1 more sq units of the coin
while drawing 1.26 fewer**, which is the whole claim. **The ceilings are
recomputed for the forked branch**: the published CEILING(2) assumed one
centreline plus a prong; CEILING(3) is a 2.35-wide band about `oakC` over
y 38.4..69.5, union the drawn foot's medial ± 1.175, union the outboard prong's
0.78 band. We sit at 88 % of it on the reopened mask, where we sat at 88 % of
CEILING(2) before — same headroom, higher absolute.

**THE NONZERO TRAP WAS CHECKED, not assumed.** Rasterised at 40 px/unit, the
element's ink runs across the crotch are single continuous spans on every row
(y 54.00 `14.40..17.13`, 54.25 `14.67..16.85`, 54.50 `14.97..16.90`, 54.75
`15.20..17.17`) and split into two only from y 53.75 up. No hole. The
arithmetic tell also holds: ink fell 1.26 sq units while ink ON the mask ROSE
6.1, which is only possible if the removed ink was the outside ink.

**PUBLISHED BECAUSE IT REGRESSES (R2).** The two ERODED settings get worse —
pb 0.55 +0.47 outside sq, unc 1.00 +2.16 — and both are the artefact the round
was told to score around: `deviceMask()` erodes 0.55 and 1.00 units A SIDE
against constants calibrated on the 5..10-unit torch shaft, so a 1.56-wide prong
loses more of itself proportionally than the 1.97-wide spike did. At erode 0,
where the stripe agrees with the dark-outline estimator, unc is flat (+0.11 sq)
and proofbright is 66 % better. unc's residual is the registration slip already
pooled away: its own trunk reads 1.24 units inboard of `stemC`, and the trunk is
shared with the olive and was not touched.

**REFUSED, WITH THE NUMBER.** (a) **Shortening the prong to y 42.** Rows y 40..42
carry 1.71 of proofbright's remaining 4.10 outside sq units, where the crown
closes over and nothing is separable on either file. Cutting there would remove
~3.5 sq units of ink to buy 0.93 — a percentage bought by drawing less, and it
would leave the two crown leaves with no stem to sit on. (b) **The small spur
that points up and inboard off the foot at y 69** (14.25 pb, 14.03 unc): real on
both files, ~0.5 units long, below what `struck()`'s three passes resolve at any
tier this face is drawn at, and 0.7 units of ink standing in bare field.
(c) **Moving `stemC`, `stemHW` or `prongC`.** None of the three changed; the
olive is byte identical and the outboard prong keeps its own 54.2 crotch.

**WHAT I COULD NOT DETERMINE:** where the inboard prong runs above y 48. Both
files are solid device from offset 10 to 21 there — the crown closes over the
branch — so it cannot be separated from the foliage it carries, and the clamp is
held constant above it and labelled an extrapolation in the source. And whether
the OLIVE's foot is two-pointed as well: the coin's two branches are one
mirrored mark everywhere else in this block, so it very likely is, but the olive
was out of scope this round and stays byte identical.

**Neighbour overlap, because a low OUTSIDE is not a pass:** 22.05 % →
**20.72 %** of this element is under something else (leaf 2.1.12 4.81 %,
E PLURIBUS UNUM 4.16 %). 5.3 % of the element's ink still falls outside
`WINDOWS['oak-stem']`, which is left alone so published FILLs stay comparable.

## v1.103.0 — 2026-08-26

**The dime's oak branch FORKS at y 54, and we drew a single spike straight up
the middle of the gap between the two prongs.** Eighth element round on this
face. The outboard prong is now drawn; `dime.reverse` alone, 6/60 cells, all
sizes; D9 0/180; D6 reverse 0.0955 → 0.0926 against a 0.50 gate.

**THE PREVIOUS ROUND ON THIS ELEMENT CONCLUDED "IT IS NOT CHANGED, BECAUSE IT
IS NOT WRONG", AND IT WAS MEASURING A MASK THAT COULD NOT SEE THE FAULT.**
`deviceMask()` floods field inward from the border and calls whatever the flood
cannot reach DEVICE, so a field pocket closed on all sides reads as solid — and
the oak's fork gap is exactly such a pocket. With it reopened, **6.82 of the
element's 11.73 outside sq units, 58 %, is in the six rows y 47..53**.

**THREE ESTIMATORS, TWO OF WHICH NEVER TOUCH THE FLOOD MASK**
(`judge/_dr17oakfork.mjs`, reports only):

| | proofbright | unc2005 |
|---|---|---|
| largest enclosed-field component on the OAK | **8.29** sq units, x 65.5..67.8, y 47.4..54.4 | **12.05** sq units, x 64.1..66.8, y 47.7..55.1 |
| largest anywhere on the OLIVE | 1.88 sq units, and not on its stem line | 31.35 sq units — a leaf belly at x 23.1..29.0 |

and the same channel read straight off each photograph with no mask in the path
at all (`bare`: within 15 % of that file's own field level, device on **both**
sides). Converted to `stemC`'s frame by each file's own trunk centre, which
cancels the ~1.0-unit registration slip between them:

|  y | 48 | 49 | 50 | 51 | 52 | 53 | 54 |
|---|---|---|---|---|---|---|---|
| pb | 15.97–17.37 | 16.37–17.57 | 16.07–17.47 | 15.57–16.97 | 15.27–16.57 | 15.27–16.17 | closed |
| unc | 15.80–16.70 | 15.80–17.50 | 16.00–17.50 | 15.50–17.30 | 15.00–16.90 | 15.20–16.40 | 15.00–16.00 |
| **ours** | 15.40–17.35 | 15.35–17.30 | 15.35–17.30 | 15.30–17.25 | 15.25–17.25 | 15.25–17.25 | 15.20–17.20 |

Two photographs agreeing to **0.1–0.4 units** about a GAP, on every row, and our
stem drawn down the middle of it.

**WHAT IS DRAWN: the outboard prong.** Its centre is the midpoint of the two
edges that bound it on proofbright, on the rows where both are clean —
**17.17 at y 53.5 through 19.27 at y 49, slope −0.467 per unit of y**. That line
extrapolated to y 41 gives offset 23 and the photograph gives 20.5, so it is
drawn as the quadratic through the crotch, that slope and that 20.5.

| mask | OUTSIDE % | outside sq | FILL raw | FILL excl | ceiling |
|---|---|---|---|---|---|
| pb erode 0.55 | 18.05 → **16.52** | 12.98 → 14.42 | 32.67 → **37.98** | 39.69 → **45.70** | 50.7 |
| pb erode 0 | 4.11 → **3.39** | 2.96 → **2.96** | 29.41 → **34.00** | 35.03 → **40.01** | 45.2 |
| pb erode 0 + reopen 1.0 | 16.31 → **13.74** | 11.73 → 11.99 | 27.28 → **32.04** | 32.42 → **37.72** | 42.8 |
| unc erode 1.00 | 56.73 → 59.19 | 40.80 → 51.65 | 25.11 → **26.27** | 30.30 → **30.91** | 36.9 |
| unc erode 0 | 16.95 → 18.42 | 12.19 → 16.08 | 25.79 → **29.05** | 30.20 → **33.46** | 38.6 |

The ceiling is recomputed for a FORKED branch (`_dr17oakfork.mjs ceiling`) — the
published 44.7 % assumed one centreline and is now the wrong denominator. Ink
71.91 → 87.26 sq units, and **on the un-eroded proofbright mask the 15.35 new
sq units add 0.00 outside**.

**A FILL-RULE BUG THAT ONLY A NUMBER CAUGHT, worth the paragraph.** The prong is
a second subpath in the same `<path>`, and the first version wound the opposite
way round. `<path>` fills NONZERO, so it CANCELLED where it overlapped the
spike — and it overlaps by construction, because the prong is fused into the
trunk at its foot. Rendered, the crotch had a **0.75-unit HOLE** in it at y 54.5.
It was invisible in the element's ink area (the hole is exactly the overlap a
union would not have counted) and it flattered OUTSIDE; the tell was a sweep of
the prong's offset coming back **below the un-forked drawing's absolute
outside**, which added ink cannot do. Both subpaths now run top point → down the
outboard edge → bottom point → up the inboard edge.

**PUBLISHED BECAUSE IT REGRESSES (R2).** unc2005 charges the prong **+3.89 sq
units**, all of it in the same rows y 47..53. Two things are in that number and
this round did not separate them. (a) **Registration.** Sweeping the prong's
offset, pb's minimum is at **+0.25** and unc's is at **−0.8 or beyond** — the
~1.0-unit slip loop 1 measured, pointing the two files in opposite directions:

| prong offset | −0.8 | −0.5 | −0.25 | **0** | +0.25 |
|---|---|---|---|---|---|
| pb outside sq | 13.21 | 12.69 | 12.28 | **11.99** | 11.97 |
| unc outside sq | 12.32 | 13.19 | 14.61 | **16.08** | 17.50 |

0 is kept: it is proofbright's reading, proofbright is the only file whose mask
carries the whole device, and the pooled optimum near −0.6 buys 1.85 sq units of
its gain by **sliding the prong under the spike** (ink 87.26 → 85.41). (b) **The
file.** The control is the OLIVE stem, the same path mirrored and untouched this
round: at erode 0 it reads **6.97 % on proofbright and 24.14 % on unc2005** —
one drawing, a 17-point gap, because unc2005 is a dark-outline photograph whose
thin marks' bright interiors reach the border flood (ledger D32).

**REFUSED WITH THE NUMBERS: moving the SPIKE onto the inboard prong**, where the
same measurement puts it (centre 14.2..15.3 over y 48.5..53.5, ~1.0 unit inboard
of `stemC`). `leafAt` anchors every leaf at `ax = stemC(ay)` and **five of the
seven oak rows sit above the fork**. Moving the stem without them leaves five
petiole roots floating in the coin's own gap; moving them is `leafAt`, which the
olive shares. **The oak's leaf ladder is hung on the fork's gap** — a
BRANCH-level correction, stem and ladder together, not an element one.
**Narrowing the spike instead** cannot reach the fault either: at y 51 the
channel is 15.54..17.14 inside a spike spanning 15.30..17.28, so only moving it
leaves the channel. `stemHW` is untouched and both branches still read it.

**NEIGHBOUR OVERLAP, because a low OUTSIDE is not a pass.** 18.33 % → **22.05 %**
of this element is under something else; the prong's share is 6.06 of its 15.35
sq units, mostly under leaf 2.1.12 (4.65). **5.3 % of the element's ink now falls
outside `WINDOWS['oak-stem']`** (the prong passes x 70); the window is left alone
so every FILL published against it stays comparable.

**RECORDED, NOT DRAWN:** the branch ends in a TWO-POINTED foot on both files —
a long barb to ≈ (13.4, 75.0) and a short outboard point at ≈ (17.6, 71.7) —
and we draw one spike. Read off the crops, not off an estimator, so it is
written down rather than shipped.

Verify: `node coloringbook/judge/_dr17oakfork.mjs pocket` ·
`bare` · `outside` · `ceiling` · `overlap` · `pic` · `crop`

## v1.103.0 — 2026-08-26

**The oak branch forks, and our stem was drawn up the gap.**

The owner: *"The stem is still flawed. We just discussed it and you acknowledged
it and corrected the mask. Why did we move on to leaves and acorns before stem
was correct?"* — a fair question with no good answer. An earlier round cleared
this stem **against a mask that had the fork filled in**, and the judge then ran
leaves, leaf angles and the acorn before returning.

**The fork is real, measured three ways, two of which never touch the flood
mask.** Read straight off each photograph — a field-toned run with device on
both sides, converted to the stem's own frame by each file's trunk centre so the
~1.0-unit registration slip cancels:

| y | 48 | 50 | 52 | 53 | 54 |
|---|---|---|---|---|---|
| proofbright | 15.97–17.37 | 16.07–17.47 | 15.27–16.57 | 15.27–16.17 | closed |
| unc2005 | 15.80–16.70 | 16.00–17.50 | 15.00–16.90 | 15.20–16.40 | 15.00–16.00 |
| **ours** | 15.40–17.35 | 15.35–17.30 | 15.25–17.25 | 15.25–17.25 | 15.20–17.20 |

**Two photographs agreeing to 0.1–0.4 units about a gap, and our stem drawn
down the middle of it.** Judge-verified independently with no mask in the path.
**6.82 of the element's 11.73 outside sq units — 58 % — is in rows y 47–53.**

The corresponding enclosed pocket is 8.29 sq units on proofbright and 12.05 on
unc2005; the olive's mirrored window has nothing comparable on its stem line
(1.88, and not on the line). The earlier "not wrong" verdict is refuted.

**Shipped: an outboard prong, oak only.** Centre 17.17 @ y 53.5 → 19.27 @ y 49,
slope −0.467/unit. The olive stem is byte-identical, judge-confirmed — of the
branch nodes only `2.1.4` moved.

| mask | OUTSIDE | FILL exclusive (ceiling) |
|---|---|---|
| pb erode 0 | 4.11 → **3.39 %** | 35.03 → **40.01 %** (45.2) |
| pb erode 0 + reopen | 16.31 → **13.74 %** | 32.42 → **37.72 %** (42.8) |

Ceilings are **recomputed for a forked branch** — the published 44.7 % assumed
one centreline and was the wrong denominator. The 15.35 new sq units add
**0.00** outside on the un-eroded mask.

**A rendering bug caught by arithmetic, not by eye.** The first prong wound the
opposite way, and since `<path>` fills NONZERO it **cancelled** where it
overlapped the spike, leaving a 0.75-unit hole at the crotch — invisible in the
ink area, invisible at 20 px/unit, and it *flattered* OUTSIDE. The tell was that
an offset sweep returned an absolute outside **below the un-forked drawing's**,
which added ink cannot do.

**The refusal is the important part, and it explains the whole sequencing
problem.** Moving the *spike* onto the inboard prong (measured ~1.0 inboard of
`stemC`) was refused because **`leafAt` anchors every leaf at `ax = stemC(ay)`
and five of the seven oak rows sit above the fork.** Moving the stem without
them leaves five petiole roots floating in the coin's own gap; moving them is
`leafAt`, which is shared with the olive. **The oak's leaf ladder is hung on the
fork's gap.** That is a branch-level correction — stem and ladder together — not
an element one, and it is now ledger **D36**.

**Regression published (R2):** unc2005 charges the prong +3.89 sq units, all in
y 47–53. Control for how much of that is the file rather than the drawing: the
olive stem is the *same path mirrored and untouched*, and reads **6.97 % pb vs
24.14 % unc** at erosion 0 — one drawing, 17 points apart.

**Recorded, not drawn:** the branch ends in a **two-pointed foot** on both files;
we draw one spike. And our spike's y 41–42 outside is it running through the
terminal leaf's lobe notches — same root cause, same branch-level fix.

**Could not determine:** where the inboard prong runs above y 48 — both files are
solid device from offset 10 to 21 there, so nothing drawn scores either way. A
ridge tracker was built, fails here, and is kept as the negative result.

## v1.102.0 — 2026-08-26

**The dime's acorn had been fitted to a bounding box four times, and a box
cannot decide which way up an acorn lies. Measured as an OBJECT, its axis is
30.2° and 31.3° on the two photographs — they agree to 1.1° — and the drawing
was at 15.1°.** Seventh element round on this face. Position untouched;
`dime.reverse` alone, 6/60 cells, all sizes; D9 0/180.

**THE BOX WAS THE PROBLEM, AND THE FILE SAID SO.** `torch()` already recorded
that "every rotation from 70 to 90 degrees can be scaled to land INSIDE the two
references' own disagreement", and chose 75 on the picture. That is a property
of an axis-aligned box round a near-round object, not of the coin. This round
measured the acorn as an object instead: at zero erosion it is **not a separate
component on either file** — it merges into the lowest oak blade and into its
own stalk — so it is isolated by a **morphological opening at 0.55**, the
smallest erosion that separates it on BOTH files, dilated back and intersected
with the erode-0 mask. The opened object carries a thin **stalk stub**, which is
stripped by slicing across the axis and refitting until stable.

| | len × wid | axis | area | len/wid |
|---|---|---|---|---|
| proofbright | 5.00 × 4.80 | **30.2°** | 18.06 | 1.04 |
| unc2005 | 4.87 × 4.72 | **31.3°** | 16.77 | 1.03 |
| drawn, before | 5.07 × 4.22 | **15.1°** | 14.67 | 1.20 |
| **drawn, after** | **4.97 × 4.77** | **31.3°** | **16.24** | **1.04** |

The two files agree to **1.1° on the axis, 0.13 on the length and 0.08 on the
width** — tighter than they agree on anything else on this branch. `rot` 75 →
**59** (the drawn axis is 90 − rot), and because the coin's acorn is very nearly
ROUND the uniform `s` is split into **`sw` 1.13 across the axis and `sl` 0.98
along it**, the way `leaf()` has always taken its two extents.

**THE ANGLE IS ALSO WHERE THE STALK LEAVES**, which is the one thing that makes
an acorn an acorn: body centroid to the stub's far end is **32.0°** on
proofbright and **33.7°** on unc2005. Round 28's reading — "the stalk enters
ABOVE the horizontal" — was right; 15° was simply not enough of it. This is not
a reversal of that judgement, it is the same judgement with a number under it.

**REJECTED WITH THE NUMBER (R2).** The unconstrained best overlap is rot 54,
sw 1.16, sl 1.14 at **mean IoU 0.712 against 0.667** for what shipped. Not
taken: it draws 5.77 × 4.89 at 35.9°, **outside both references on all three
measurements**, because IoU is scored against a target that still contains the
stalk stub the art does not draw, and the only way to cover a stub is to grow
past the body. Three agreed moments beat one score against a contaminated
target.

**"OUR ACORN IS ROUGHLY A THIRD OF THE COIN'S BY AREA" WAS A WINDOW ARTEFACT.**
`WINDOWS.acorn` is 11 × 11 units round a 5-unit object. Of its **47.25 sq unit**
exclusive target on proofbright, only **20.57 is acorn**: 9.54 is the torch
shaft's edge at x 54.00–55.35, 8.45 is a row of E PLURIBUS UNUM clipped by the
window's bottom at y 61.70–63.00, and 5.01 is oak in the top right corner. A
**perfect** acorn tops out at **43.5 %** there and **48.2 %** on unc2005.
Measured as an object the drawing was already **85 %** of the coin's by area,
not 31 %. (D22 again, one window further on.)

**Scores, both erosions, both files, before → after.** Reason from erode 0 —
the mask's erosion is calibrated on a 5–10 unit torch shaft and this object is
five units across:

| | OUTSIDE | FILL raw | FILL exclusive |
|---|---|---|---|
| proofbright, erode 0 + reopen | 5.99 → **4.65 %** | 26.23 → **29.43 %** | 29.39 → **32.97 %** |
| proofbright, erode 0.55 + reopen | 26.99 → 31.16 % | 45.10 → 47.03 % | 48.13 → 50.20 % |
| unc2005, erode 0 | 14.05 → 17.70 % | 25.14 → 26.62 % | 32.58 → **34.49 %** |
| unc2005, erode 1.00 | 60.82 → 63.58 % | 30.09 → 30.93 % | 38.11 → 39.18 % |

**Regressions published (R2):** OUTSIDE rises on unc2005 (14.05 → 17.70 % at
zero erosion) and at both calibrated erosions. The cause is the references'
own disagreement, not a defect the drawing can fix: unc2005's acorn sits **1.17
units left and 0.84 down** of proofbright's, the drawn centre is held between
them, and growing an object toward the mean grows its mismatch with either end.
Moving it was not on the table and the measurement did not ask for it — the
drawn centroid (59.15, 57.48) is 0.14 from the two files' mean.

**Separability held, before and after** — the test that exists because this
object has been deleted once and merged twice. Two components at every erosion
in `_dr12leaf.mjs` §4, and the acorn's overlap with every other drawn node on
the face is **0.00 sq units** on both sides of the change.

**Corrected, and the refusal still stands.** Round 34 recorded a stalk it chose
not to draw, on the evidence of a **separate 3.21 × 1.46 component at (14.62,
56.77)** carried by proofbright only. That is the OUTBOARD half of the stalk;
there is a nearer ~1.4-unit **stub attached to the acorn itself**, and it is on
**both** files (to (62.96, 54.94) and (61.27, 55.99)). So "unc2005 does not
carry it at all" was wrong about the stub. It is still not drawn, and its own
coordinates are why: **(62.96, 54.94) is inside the bounding box of the lowest
oak blade** (2.1.6, x 52.8–64.1, y 45.8–55.5), and merging into that blade is
what has broken this object twice. Its direction is what sets `rot`.

**Could not determine: the nut/cup proportion.** Neither photograph resolves the
cup's rim as interior relief. Sampled along the fitted axis, proofbright's grey
swings ~200 levels INSIDE the body from its frosting alone, and unc2005 is flat
bright inside with dark only at the outline. The drawn 1.6 / 2.1 split stands on
what an acorn is, not on these two files.

New instrument: `judge/_dr16acorn.mjs` (reports only).
Verify: `node coloringbook/judge/_dr16acorn.mjs` ·
`node coloringbook/judge/_dr13elem.mjs score 2.1.18 acorn --erode 0 --reopen 1.0` ·
`node coloringbook/judge/_dr12leaf.mjs`

## v1.101.0 — 2026-08-26

**Two of the dime's seven oak leaves were aimed into bare field on both
references. Both are fixed — and the fix the previous round published for the
worse of them turned out to be two leaves pointing at the same piece of coin.**

Sixth element round on this face, and the first to own a leaf's ANGLE and its
PETIOLE together: `stalkEnd`/`seatOn` both take `L.rot`, so they are one
quantity, and splitting them is what stopped the last round shipping. The
byte-identity partition reports `dime.reverse` alone, 6/60 cells, all sizes.

**THE ANGLE COLUMN IN `LADDER` WAS READ OFF THE OLIVE.** Every row of that
base/tip table came from the coin's olive branch — its own comment quotes "its
olive blades run 11.3 to 16.7" — and it is mirrored onto the oak, where D11/D12
already records two places the oak refuses it. So an oak measurement cannot be
written into `LADDER` without moving a branch nobody measured. New `OAKROT`
overrides the angle **on the oak only**; the olive's seven transforms are
byte-identical with and without it, checked by diffing all 66 transforms and
all 108 paths in the emitted SVG.

**Node 2.1.12 (mid-outboard), `rot` +17 → +35.** Two independent estimators on
two independent files, and no ink hidden to buy it:

| rot | +17 | +25 | +30 | **+34** | **+35** | +40 | +44 |
|---|---|---|---|---|---|---|---|
| OUTSIDE proofbright | 30.91 % | 16.86 | 10.34 | **8.57** | **8.54** | 10.01 | 10.24 |
| OUTSIDE unc2005 | 37.50 % | 17.75 | 7.96 | **4.50** | **4.74** | 8.37 | 11.15 |

Both files minimise at +34/+35, and this blade's overlap with the other six
leaves, the torch and the legends is **0.0 % at every angle from +10 to +50**
(0.2 % at +5 and 0.5 % at +55, the two ends of the sweep) —
so the fall is ink moving onto the coin's device, not under a neighbour. The
second estimator is the PCA of the coin's own isolated component at (76.9,
41.4), principal axis **+44°** (ledger D28). +35 costs 0.03 and 0.24 points
against the containment optimum and leans the difference toward the PCA.

**Node 2.1.14 (mid-inboard), `rot` +45 → +60, and the published side-flip is
REFUTED.** The candidate was a flip to outboard +25 on an OUTSIDE of 8.92 /
6.87. Both numbers reproduce — and 2.1.12's base is 1.7 units *below* it on
the other side, so at +35 the two tips land 0.5 units apart:

| 2.1.12 at | 2.1.14 out +25 shares, with the other six |
|---|---|
| its shipped +17 | 42.7 % |
| **the coin's +35** | **83.8 %** |

83.8 % is not a leaf, it is a highlight on 2.1.12. The two fixes the previous
round published are mutually exclusive.

**A NEW MEASUREMENT SAYS WHY, AND IT IS NOT THE ANGLE (ledger D33).** The
oak's inboard foliage column is **3.3–9.5 units deep** (`_dr15oakleaf.mjs
depth`, new), with a **waist at y 39–41** where both files fall to 3.9–5.4;
this node is drawn **13.42** long into it. The inboard sweep therefore has no
optimum — from +45 to +90 OUTSIDE falls 57.87 → 4.98 while overlap rises 5.2 →
62.3 % in step. The angle is taken from a **bound**, not the curve: +60 is the
shallowest whose tip clears the coin's own inboard edge (16.45 − 13.42 cos 60 =
9.74 at y 34.06, against an edge at 9.4 / 8.5). It takes **57.87 / 52.86 →
34.93 / 25.15**, and the third of the blade still in the channel is REACH,
which is measured and settled and not this round's to spend.

**Seven leaves, before → after, and the two petioles that moved with them:**

| node | leaf | pb e0+fork | unc e0 | on other leaves |
|---|---|---|---|---|
| 2.1.6 | foot-inboard | 26.60 % | 16.71 % | 13.1 % |
| 2.1.8 | foot-outboard | 4.99 % | 11.85 % | 0.0 % |
| 2.1.10 | low-inboard | 18.43 % | 20.56 % | 19.1 → 14.0 % |
| **2.1.12** | mid-outboard | **30.91 → 8.54 %** | **37.50 → 4.74 %** | 0.0 % |
| **2.1.14** | mid-inboard | **57.87 → 34.93 %** | **52.86 → 25.15 %** | 5.2 → 6.3 % |
| 2.1.16 | crown-outboard | 13.36 % | 15.72 % | 57.4 % |
| 2.1.17 | terminal | 17.99 % | 16.17 % | 43.2 → 48.2 % |

Petioles (`_dr15oakleaf.mjs stalks`, new — the half the last round was told not
to touch): **2.1.11** pb e0 0.00 → 0.00, unc e1.00 0.00 → 1.39; **2.1.13** pb
e0 0.00 → 0.00, unc e0 4.45 → 4.27. Both stayed on the coin.

**A third reading agrees, and it is a placement number rather than a
containment one.** FILL as a fraction of its own CEILING — the best that glyph
could do anywhere in its window — moved furthest on exactly the two nodes that
changed. The windows for 2.1.12 and 2.1.14 are drawn round **both** candidate
directions (the rule `winOf` already used for 2.1.8), so they cannot have been
fitted to the new drawing:

| node | FILL/ceiling pb | FILL/ceiling unc |
|---|---|---|
| 2.1.6 | 79 → 79 % | 69 → 69 % |
| 2.1.8 | 95 → 95 % | 81 → 81 % |
| 2.1.10 | 85 → 81 % | 65 → 65 % |
| **2.1.12** | **65 → 97 %** | **53 → 98 %** |
| **2.1.14** | **50 → 85 %** | **32 → 89 %** |
| 2.1.16 | 33 → 36 % | 35 → 37 % |
| 2.1.17 | 65 → 69 % | 62 → 62 % |

**Published regressions (R2):** 2.1.14's own overlap 5.2 → 6.3 %, and the
terminal's 43.2 → 48.2 % because the steepened blade nests against it. The
pairwise table trades one contact for another and gains none — 2.1.10/2.1.14 at
5.2 % is gone, 2.1.14/2.1.17 at 6.3 % takes its place.

**Refused, with the number: 2.1.6's height.** Its diagnosis is confirmed — the
blade hangs into the bare band above the acorn — and it is a node height, as
suspected. But every height that improves it buries it under 2.1.10: ay 56.96
(shipped) 26.60/16.71 at 13.1 % overlap; 55 → 4.23/0.91 at **35.7 %**; 54 →
2.75/2.52 at **50.2 %**; 51 → 21.58/24.83 at **95.3 %**. That is D11/D12's own
refusal arriving from the other direction with the number on it.

**What could not be determined:** whether the oak has an isolated blade at
2.1.14's node on any file. The erosion ladder resolves the inboard mass into
one near-circular cluster (16.4 × 15.2 on proofbright, aspect 1.08) whose axis
means nothing, so that node has exactly one estimator and it is monotone.

**The obvious depth estimator is wrong and is recorded as the thing that
failed.** "Walk inboard from `stemC(y)` until the first gap" returns the
**stem's own half-width**, 1.0 row after row, because the blades hang on
petioles with bare field in the gap — the finding `PTILT` is built on.

## v1.101.0 — 2026-08-26

**The two published oak fixes were mutually exclusive, and the angle table
belonged to the olive.**

`LADDER`'s angle column was read off the **olive** branch — its own comment
quotes *"its olive blades run 11.3 to 16.7"* — and mirrored onto the oak. So
neither queued fix could be applied without moving the olive. A new `OAKROT`
overrides the angle **on the oak only**; verified by diffing the emitted SVG,
**exactly 2 transforms and 2 paths differ** (×3 relief copies) and the olive is
byte-identical. Judge-confirmed independently: of ~20 branch nodes, the four
that moved are leaves `2.1.12`/`2.1.14` and their two petioles, **zero olive
nodes**.

**`2.1.12` +17 → +35 stands**, on two estimators. Sweep on both files —
+17 30.91/37.50 · +25 16.86/17.75 · +30 10.34/7.96 · **+34 8.57/4.50** ·
+35 8.54/4.74 · +40 10.01/8.37 — both minimise together, and overlap with every
other element is **0.0 % from +10° to +50°**, so the fall is ink moving *onto*
device rather than under a neighbour. The coin's isolated component at
(76.9, 41.4) has PCA axis **+44°**; +35 was taken as the compromise.

**The `2.1.14` side-flip is REFUSED, and this is the round's best catch.**
Outboard +25 does read 8.92/6.87 — the number reproduces. But `2.1.12`'s base
sits 1.7 units below it on the other side, so once `2.1.12` is at the coin's
+35 the two tips land **0.5 units apart**:

| with `2.1.12` at | `2.1.14` outboard +25 shares with the other six |
|---|---|
| its shipped +17 | 42.7 % |
| **the coin's +35** | **83.8 %** |

**83.8 % is not a leaf, it is a highlight on 2.1.12.** The previous round never
had both changes in the same render — it fell into the exact trap it had itself
measured and warned about. `2.1.14` instead goes to **+60 inboard**
(57.87 → 34.93 pb, 52.86 → 25.15 unc).

**New measurement (D33): the oak's inboard column.** Depth from `stemC(y)`,
erode 0, and **not one of the 22 readings over y 32–42 is clamped**:

```
y     32  33  34  35  36  37  38  39  40  41  42
pb   3.3 7.0 7.1 6.7 6.4 6.5 5.5 4.5 3.9 4.5 6.2
unc  4.0 7.3 8.0 7.9 7.0 7.5 7.0 5.4 5.1 5.0 5.5
```

Waist at y 39–41, and `2.1.14` is drawn **13.42 long into it** — which is why
its inboard sweep has **no optimum**: +45 → +90 takes OUTSIDE 57.87 → 4.98
while overlap rises 5.2 → 62.3 % in step. **+60 therefore comes from a bound,
not a curve**, and is labelled as such: the shallowest angle whose tip clears
the coin's own edge. A third of the blade is still in the channel, and that
residue is *reach*, which is settled.

The same walk on the olive is a **third independent line of D11/D12 evidence**:
over y 37–45 the olive's inboard column is *clamped* (> 9.5) where the oak's
reads 3.9–7.5 unclamped.

**`2.1.6` is confirmed as a node height, not an angle — and refused anyway.**
Every height that improves the number buries the leaf: `ay` 56.96 → 55 / 54 / 53
/ 51 takes OUTSIDE 26.60 → 4.23 → 2.75 → 6.65 → 21.58 while overlap with
`2.1.10` runs **13.1 → 35.7 → 50.2 → 66.2 → 95.3 %**.

**Corroboration, on windows drawn round *both* candidate directions so they
cannot be fitted to the new drawing:** FILL/ceiling `2.1.12` 65 → **97 %** pb and
53 → **98 %** unc; `2.1.14` 50 → **85 %** and 32 → **89 %**. The five unchanged
leaves read 79/95/81/36/69 against 79/95/85/33/65.

**Regressions published (R2):** `2.1.14`'s own overlap 5.2 → 6.3 %, terminal
43.2 → 48.2 %. The pairwise table trades one contact for another and gains none.

**Could not determine:** whether the oak has an isolated blade at `2.1.14`'s
node on **any** file — the erosion ladder resolves that inboard mass into one
near-circular cluster (16.4 × 15.2, aspect 1.08) whose axis means nothing. That
node has exactly one estimator, and it is monotone. Which is precisely why its
angle rests on a bound.

## v1.100.0 — 2026-08-25

**The dime reverse's torch shaft is one straight taper, and we drew it at
three quarters of its slope — too thin at the top, too fat at the bottom, and
parallel-sided for the last 4.6 units.**

Third element scored alone by `judge/_dr13elem.mjs`. Scope: the shaft path and
its own interior detail in `torch()`, plus `WINDOWS.shaft` in the judge. The
byte-identity partition reports `dime.reverse` alone, 6/60 cells, all sizes.

**Element 2.1.2, the shaft, against `deviceMask()`:**

| | OUTSIDE pb | FILL pb | OUTSIDE unc | FILL unc |
|---|---|---|---|---|
| before, shipped window | 2.17 % | 71.34 % | 10.60 % | 77.66 % |
| after, **same** window | **1.45 %** | **73.01 %** | **10.46 %** | **78.97 %** |
| after, corrected window | 1.45 % | 74.81 % | 10.46 % | 80.69 % |

All four numbers improve on the **unchanged** window, so the window correction
is not doing the work. Ink 263.58 → 265.91 sq units.

**THIRTY WIDTHS BECAME EIGHTY-SIX.** `_dr8shaft.mjs` published seven rows from
a darkest-point estimator. Running its own admission test against the mask —
a row counts only if the run containing x = 50 has a clear gap of ≥ 0.4 units
on **both** sides in **both** files — admits 86 of the 143 rows between y 38
and y 73.5, in two bands (y 38..43, y 57.5..73.5). Between them the olive
branch crosses the shaft and there is no boundary to read, which is the same
refusal `_dr8shaft.mjs` makes.

**On those 86 rows the shaft is ONE STRAIGHT LINE:**

| | w(38.5) | w(73.5) | slope/unit | rms | worst |
|---|---|---|---|---|---|
| proofbright | 11.12 | 4.97 | −0.1756 | 0.217 | 0.67 |
| unc2005 | 9.29 | 4.36 | −0.1409 | 0.177 | 0.94 |
| **mean of the two** | **10.20** | **4.67** | **−0.1583** | **0.173** | 0.73 |

An rms of 0.17 over 86 rows and 35 units of length is a taper with no second
term in it: no collar, no waist, no parallel section. Drawn against that mean,
row by row: **−0.72 at y 38.5, −0.73 at y 40, −0.04 at y 59, +0.02 at y 61,
+0.44 at y 63, +0.32 at y 68, +0.42 at y 71, +1.00 at y 73.5.** That is a
**slope** error pivoting near y 60 — −0.119 drawn against −0.158 measured,
25 % too shallow — not a size error.

**D19 IS CONFIRMED AND WAS THE SMALLER HALF.** The foot round reported that the
shaft runs parallel at 5.7 from y 69.6 while the coin keeps narrowing. It does:
pb 5.75 at y 71 and 4.95 at y 73.5, unc 4.80 and 4.45. But the same fit shows
the taper is also 0.72 too narrow at its top, and the two are one defect —
a slope.

**THE TOP ANCHOR IS CHANGED, AND THE FILE SAID IT WAS SETTLED.** v1.84.0 kept
9.4 at y 38.5 because "9.4 sits between the two files' 9.67 and 10.41 at
y 40". The anchor is at 38.5, so the width the taper actually **draws** at y 40
is **9.22 — below both**. Four estimates of that row: `_dr8shaft` 9.67 / 10.41,
the mask 9.05 / 10.85; means 10.04 and 9.95, and the fitted line gives 9.97.
The published **ratio** test — chosen because it cancels the disc fit and the
bevel skirt — says the same thing:

| | w61/w42 | w69/w42 |
|---|---|---|
| `_dr8shaft` unc / pb | 0.782 / 0.681 | 0.590 / 0.581 |
| `deviceMask` unc / pb | 0.696 / 0.682 | 0.568 / 0.549 |
| drawn (was) | 0.748 | **0.642 — above all four** |
| drawn (now) | 0.688 | 0.557 |

v1.84.0 printed its own 0.639 beside targets of 0.590 and 0.581 and did not
remark that it had missed both. Top anchor 9.4 → 10.20.

**AND THE AXIS FITS 50.** The same least squares on the mean of the two files'
run **centres** gives 50.00 at y 38.5 and 49.83 at y 73.5, rms 0.084. The flame
round asserted the two registrations cancel to 50 from three rows; this
confirms it from 86, over the shaft's whole length. The drawing stays on 50.

**WHERE THE REMAINING FILL IS, AND MOSTLY IT IS NOT THE SHAFT'S (D22).** Every
unfilled mask cell in the corrected window was tested against the ink of the
other elements of this face:

| | proofbright | unc2005 |
|---|---|---|
| branches 2.1.4+ | 37.59 (10.86 pts) | 26.56 (9.11 pts) |
| legend E PLURIBUS UNUM | 4.06 (1.17 pts) | 0.84 (0.29 pts) |
| collar/head 2.1.1 | 0.00 | 0.00 |
| nobody draws it | 45.52 (13.15 pts) | 28.91 (9.91 pts) |

12.03 points of pb's FILL and 9.40 of unc's is mask this element must **not**
fill. Credited only for mask nobody else draws, the shaft fills **85.05 %** and
**89.06 %**.

**AND THE REST IS REGISTRATION.** The same shape re-centred on each file's own
measured axis — computed to bound the residual, not to draw it, because
shifting onto one file's error is what the flame round refused:

| | on 50 | on the file's own axis |
|---|---|---|
| pb OUTSIDE / FILL | 1.45 % / 74.81 % | 0.14 % / 75.79 % |
| unc OUTSIDE / FILL | 10.46 % / 80.69 % | 6.62 % / 84.09 % |

90 % of pb's OUTSIDE is the 0.45-unit axis offset. unc's residual 6.62 % is its
erosion — its mask is eroded 1.00 per side against pb's 0.55, so a shape drawn
to the mean of the two is 0.45 per side proud of the narrower file by
construction. Neither is shape.

**CONVERGENCE DECLARED (ledger §0).** The evidence that would move these
numbers is not another constant but a per-element target that subtracts mask
already claimed by a neighbouring element's ink. That is an instrument change
and not the shaft's to make.

**THE WINDOW WAS CORRECTED AND NOW IT TILES.** `WINDOWS.shaft` was
`[43, 57, 38, 71]` and met neither neighbour: after the foot round moved the
foot's top to 73.5, the band y 71..73.5 was shaft mask in **no** element's
window (13.30 sq units pb, 11.79 unc), and y 38..38.5 sat below the drawn
collar, which ends at 38.5. Now `[43, 57, 38.5, 73.5]`: head | shaft | foot
meet edge to edge. The collar claiming **0.00** of the unfilled target is the
check that 38.5 is the right handover row.

**Reported, not changed:** the drawn collar is 11.7 wide and steps down to the
shaft at y 38.5, where the coin has no step at all (pb 11.50 / 11.00 / 10.50
at y 36 / 38.5 / 42; unc 9.65 / 9.25 / 8.75) — 0.75 per side now, down from
1.15, and the head's to answer, along with `WINDOWS.head`'s y1 of 40 still
overlapping this window by 1.5 units (**D23**). `_dr9branch.mjs`'s
`torchHalf()` mirrors the old taper and is now ~0.4 too narrow at the top;
changing it would move published branch numbers (**D24**).

**Interior detail follows, arithmetically.** The two flutes keep their 0.8-unit
inset and 0.8-unit width and the two shaft bands keep the shaft's full width at
their own top row, recomputed on the new taper. The third band is the collar's
and keeps the collar's 11.7. The flutes still stop at y 69.2: the mask cannot
see a flute — the flood closes interior highlights, which is why it works — so
nothing would justify running them further.

Verified by the judge: partition 6/60 `dime.reverse` alone; suite 225 + 239
green; T1 32/32, dime-reverse margin 0.233–0.236 (was 0.231–0.234); and the
overlay read back at 40 px per unit — the drawn edges run parallel to the
mask's on both files, with the residual a hairline of registration.

## v1.100.0 — 2026-08-25

**The dime's shaft had a slope error, not a bottom error — and the "settled"
top width was wrong too.**

Third element scored alone. The lead handed over was D19: the shaft runs
parallel for its last 4.6 units while the coin is still narrowing. **That was
confirmed, and it was the smaller half.**

| shaft, node `2.1.2` | OUT pb | FILL pb | OUT unc | FILL unc |
|---|---|---|---|---|
| before | 2.17 % | 71.34 % | 10.60 % | 77.66 % |
| after, **same** window | **1.45 %** | **73.01 %** | **10.46 %** | **78.97 %** |
| after, corrected window | 1.45 % | 74.81 % | 10.46 % | 80.69 % |

All four improve on the *unchanged* window, so the window correction is not
doing the work.

**The width profile**, admitted by `_dr8shaft.mjs`'s own rule — a row counts
only if the run holding x = 50 has a ≥ 0.4 gap to its neighbours on **both**
sides in **both** files. That admits **86 of 143 rows**, in two clean bands:

| | w(38.5) | w(73.5) | slope | rms |
|---|---|---|---|---|
| proofbright | 11.12 | 4.97 | −0.1756 | 0.217 |
| unc2005 | 9.29 | 4.36 | −0.1409 | 0.177 |
| **mean** | **10.20** | **4.67** | **−0.1583** | **0.173** |

rms 0.17 over 86 rows and 35 units — **one line, no second term.** Drawn minus
measured: −0.72 at the top, +1.00 at the bottom. **A slope error pivoting near
y 60** — drawn −0.119 against a measured −0.158, 25 % too shallow.

**A "settled" measurement is disagreed with, in public.** v1.84.0 kept the top
anchor at 9.4 because it "sits between the two files' 9.67 and 10.41 at y 40" —
but anchored at 38.5 that taper **draws 9.22 at y 40, below both**. Four
estimates of that row mean 10.04 and 9.95; the fit gives 9.97. And its own ratio
test agrees: the drawn `w69/w42` was **0.644 against targets of 0.549, 0.568,
0.581 and 0.590 — above all four.** v1.84.0 printed its own 0.639 beside targets
of 0.590/0.581 **without remarking that it had missed both.** Judge-verified
independently by measuring the isolated node: 0.644 → **0.557**.

**An 86-row confirmation of a 3-row claim:** the same fit on the run *centres*
gives axis 49.83, rms 0.084 — the flame round's finding that the two
registrations cancel to 50, now on 28× the evidence.

**The FILL ceiling is an instrument artefact (D22).** Testing every unfilled
cell against the other elements' ink shows **41.65 sq units on proofbright —
12.03 FILL points — is mask drawn by the branches and the legend**, because the
olive crosses the shaft at y 45..57 and E PLURIBUS UNUM stands against it at
y 62..66. Credited only for mask nobody else draws, the shaft fills **85.05 % /
89.06 %**.

**Refused, with the number:** keeping 9.4 and fixing only the bottom measures
OUT 0.75 % / FILL 69.66 % — **better OUTSIDE, worse FILL**. That is the
thinner-scores-better trap this element was warned about, and it was declined.

**Reported, not changed:** the drawn collar steps 0.75/side down to the shaft
where the coin has **no step** (D23, the head's to answer); `_dr9branch.mjs`'s
`torchHalf()` still mirrors the old taper and is now ~0.4 too narrow at the top,
but changing it would move published branch numbers (D24).

**Could not determine:** y 43–57.5 — 57 of 143 rows — where the olive touches
the shaft and no estimator separates them; the line is interpolated across that
gap and bracketed by the two clean bands. And ~0.85 units of the two files'
top-width disagreement is **not** explained by their erosion difference.

**Instrument defect fixed by the judge:** `_dr13elem.mjs` **ran its CLI when
imported**, so any module importing `nodes`/`resolve` printed a node listing
into its own output — found while verifying this round's ratio claim. Same
defect class as the sync server binding a port on every test run. Guarded.

## v1.99.0 — 2026-08-25

**The dime reverse's torch foot is a bead over a tapering spike, not a bowl —
and 47 % of the number that judged it was measuring the shaft.**

Second element scored by `judge/_dr13elem.mjs`. Scope: the foot path in
`torch()` and its window in the judge; the byte-identity partition reports
`dime.reverse` alone, all sizes.

**Element 2.1.3, the foot, against `deviceMask()`:**

| | OUTSIDE pb | FILL pb | OUTSIDE unc | FILL unc | ink |
|---|---|---|---|---|---|
| before | 34.30 % | 83.42 % | 38.15 % | 87.72 % | 35.78 |
| after | **4.43 %** | 75.21 % | 18.71 % | 71.46 % | 22.18 (target 28.18) |

FILL is quoted on the **corrected** window below, so the two rows compare the
same denominator. On the shipped window the same before/after is 44.11 % →
39.77 % (pb) and 47.23 % → 38.47 % (unc), and that window is wrong — see below.

**THE FOOT IS TWO MASSES AND IT IS STEPPED.** The standing comment called it
"a single rounded finial ... widest just below its shoulder and closing to a
blunt bottom", read off 0.5-unit scanline strips that give a widest and a
bottom and nothing between them. A widest-plus-a-bottom is satisfied by a bowl,
and a bowl is what was drawn. Scanned at the mask's own 0.25 units, every row
from y 66 to 84, on both references:

* a **bead** — a ring ~2.25 units tall standing ~1.5 units proud of the neck,
  which **returns to neck width below itself**: pb 5.00 at y 73.50 → 7.95 at
  y 75.25 → 5.90 at y 76.00; unc 4.30 → 6.85 → 4.60 over y 74.25..77.00. It is
  near-symmetric top-to-bottom — a torus, not a shoulder.
* a **tapering terminal** below it that keeps narrowing to a narrow tip:
  pb 5.90 → 1.50 over y 76.00..78.50, unc 4.60 → 2.00 over y 77.00..79.00.
  No second flare, no flat base.

Erosion-corrected (0.55 and 1.00 units) the two files' bead widths are 9.05 and
8.85 — agreement 0.20 — and their necks at y 69 are 6.95 and 7.00, agreement
0.05. The old path was ~8.4 wide from y 74.2 to 78 and rounded off at 79.4, so
it wore the bead's width on the terminal's rows: **at y 77.0 the coin is 4.55
(pb) and 4.60 (unc) and ours was 8.2, 78 % too wide**, and below y 78.75 the
coin has nothing at all on pb.

**THE WINDOW WAS WRONG AND IT IS SAID, NOT DRAWN INTO.** `WINDOWS.foot` began
at y 69, but the coin's shaft narrows monotonically to y 73.50 and only then
flares. **25.12 of the 53.30 sq units in that window — 47 % — is shaft, and the
drawn shaft node already covers 23.57 of it (94 %).** No foot could fill it
without drawing over the shaft. The window's top edge is now the measured
shaft/foot boundary, 73.5. Its bottom stays coarse at 81: the foot's mask ends
at 78.50/79.00 and `ONE DIME`'s own mask starts at y 81.75, **below** the
window, so no letter is inside it.

**The inset is swept once and the curve published**, so it is not re-tuned
blind. Same profile, inset varied, on the corrected window:

| inset | pb OUT | pb FILL | unc OUT | unc FILL |
|---|---|---|---|---|
| 0.00 | 8.40 % | 78.96 % | 22.50 % | 74.62 % |
| 0.15 | 6.15 % | 76.79 % | 20.33 % | 72.82 % |
| **0.25** | **4.51 %** | **75.28 %** | 18.78 % | 71.53 % |
| 0.40 | 1.92 % | 73.03 % | 16.72 % | 69.27 % |

At inset 0, OUTSIDE is 8.40 % against the registration's own prediction of
0.42/5.5 = 7.6 % — i.e. essentially **all** of it is the 0.45-unit offset
between the drawing's axis (50) and each file's (50.42 pb, 49.42 unc, mean
49.92). FILL moves 3.7 points across the whole sweep while OUTSIDE moves 6.5.

**Published, not tuned around (R2).** FILL **fell** — 83.42 % → 75.21 % (pb),
87.72 % → 71.46 % (unc). The old bowl covered ~100 % of every row it spanned
*because it was too big everywhere*; a shape that follows the profile pays the
inset and the registration. OUTSIDE fell by a factor of 7.7 for it. T1 dime
reverse margin 0.238–0.241 → 0.231–0.234 (32/32 held, per-photograph rows
unchanged to three decimals).

**Converged, and what would move it.** FILL has a ceiling of ~81 % here: the
coin's foot begins at y 73.50 and ours begins at 74.20, because **the drawn
shaft runs parallel at 5.7 from y 69.6 to 74.2 while the coin is still
narrowing** (5.00 at y 73.50). That band is 3.84 of the window's 28.18 sq units
— 14 % — and the drawn shaft already covers it, so the face has no hole there.
Of the 81 % reachable, this foot reaches 93 %, and the missing 7 % is the same
registration. **No shape change left raises FILL without raising OUTSIDE.** The
evidence that would move it is a shaft taper that runs on to the coin's 5.00 at
y 73.5 — the shaft's measurement to make; **reported, not changed** (ledger
D19).

D9 clean over 120 renders, D8 dime reverse 0.0000 % outside the field circle,
D10 dime PASS, full Playwright suite 464 passed.

## v1.99.0 — 2026-08-25

**The dime's torch foot is a bead and a taper. We drew a bowl.**

Second element scored alone. It was the worst on the face: **a third of what we
drew landed where the coin has no device.**

| foot, node `2.1.3` | before | after |
|---|---|---|
| **OUTSIDE** (proofbright) | 34.30 % | **4.43 %** |
| OUTSIDE (unc2005) | 38.15 % | **18.71 %** |
| FILL (proofbright) | 83.42 % | 75.21 % |
| ink | 35.78 | 22.18 (target 28.18) |

**What the coin actually has**, from a row-by-row scan at the mask's own 0.25
units, printing *runs* rather than one width so a crossing stem would show as a
second run (none does), on both references — **two masses, stepped**:

1. **A bead**: a ring ~2.25 units tall standing ~1.5 proud of the neck **which
   returns to neck width below itself** — 5.00 → **7.95** → 5.90 (pb), 4.30 →
   **6.85** → 4.60 (unc). Near-symmetric top to bottom: a torus, not a shoulder.
2. **A tapering terminal** below it, narrowing all the way — 5.90 → 1.50 (pb),
   4.60 → 2.00 (unc). No second flare, no flat base.

Erosion-corrected, the two files' bead widths are **9.05 and 8.85** (agree to
0.20) and their necks at y 69 are **6.95 and 7.00** (agree to 0.05) — the same
object, 0.75 units apart in y.

**Why the old comment was wrong.** It said "a single rounded finial… closing to
a blunt bottom", read from 0.5-unit scanline strips that give *a widest and a
bottom and nothing between* — a description a bowl also satisfies. The old path
wore the bead's width on the terminal's rows: **at y 77.0 the coin is 4.55/4.60
and ours was 8.2 — 78 % too wide** — and below y 78.75 proofbright has no device
at all.

**FILL fell, and that is published rather than tuned away (R2).** The old bowl
covered ~100 % of every row it spanned *because it was too big everywhere*.
OUTSIDE fell **7.7×** for it. T1 dime-reverse margin 0.238–0.241 → 0.231–0.234,
32/32 held.

**The window was wrong and the round said so instead of drawing into it.**
`WINDOWS.foot` began at y 69, but the coin's shaft narrows monotonically to
y 73.50 and only then flares — so **25.12 of the window's 53.30 sq units (47 %)
was shaft**, already covered by the drawn shaft node (94 %). No foot could fill
it without drawing over the shaft. Corrected to 73.5. It also checked the letter
trap explicitly: **`ONE DIME`'s mask starts at y 81.75, below the window** — no
letter was ever in the denominator.

**It stopped when it converged.** The inset was swept **once** and the curve
published (0.00 / 0.15 / 0.25 / 0.40) rather than tuned; at inset 0 the residual
OUTSIDE is 8.40 % against the registration's own prediction of 7.6 %, i.e.
almost all of what remains is the 0.45-unit axis offset between our 50 and the
files' 50.42 / 49.42. **There is no shape change left that raises FILL without
raising OUTSIDE.**

**Reported, not fixed (new ledger D19):** FILL here is capped at ~81 %, because
the coin's foot begins at y 73.50 and ours at 74.20 — **the drawn shaft runs
parallel at 5.7 from y 69.6 to 74.2 while the coin is still narrowing** (5.00 at
73.50, 4.30 at 74.25). Same defect class as the old `<rect>` shaft, on the last
4.6 units the taper never reached. Of the *reachable* 81 %, this foot reaches
93 %.

**Also found (D20):** `_rescore.mjs`'s D11 stage shells out to an **untracked**
file, so D11 dies with `MODULE_NOT_FOUND` and has been **silently missing from
every rescore**. Pre-existing.

## v1.98.0 — 2026-08-25

**The dime reverse's flame has five tongues, the tallest one right of the axis,
and the flame really is off-axis — the die does that, not the photographer.**

First round scored by `judge/_dr13elem.mjs`, which judges ONE drawn element
against the coin's own mask instead of judging the whole face. Four previous
rounds on this face judged the sum and three were reverted, twice while T1
rose. Scope: the `flame` path in `torch()` and nothing else — the byte-identity
partition reports `dime.reverse` alone, all sizes.

**Element 2.1.0, the flame, against `deviceMask()` on `dime-rev-proofbright`:**

| | OUTSIDE | FILL | ink |
|---|---|---|---|
| before | 5.76 % | 74.19 % | 136.52 |
| after | 3.44 % | 95.15 % | 170.89 (target 173.42) |

**The old flame was a teardrop with two horns; the coin's is a crown.** Its one
tall tongue stood ON the axis — which is where the coin has a NOTCH — and its
two 1.6-unit horns stood in two more notches. Measured on both surviving
references, the mask's top edge has **five** tongues at offsets −6.0, −1.9,
+1.25, +3.75 and +7.25 from the torch's own axis, and **the tallest is D, right
of centre**. The two files agree on those offsets to 0.5 units.

**The flame is off-axis and it is the die.** The standing comment said the
photograph's 1.9-unit shift was "the kind of thing a tilt or an off-centre light
does" and refused to copy it. That was right on one photograph and wrong here:
the separating measurement is a **control** — measure the torch's own axis from
the head, the clean shaft rows and the foot on the same mask, then quote the
flame as an offset FROM THAT AXIS, so registration cancels.

| | torch axis | flame centroid | offset |
|---|---|---|---|
| `dime-rev-proofbright` | 50.45 | 51.27 | **+0.82** |
| `dime-rev-unc2005` | 49.50 | 50.28 | **+0.78** |

The two files' own registrations differ by 0.95 units in **opposite**
directions and the offsets agree to 0.04. So it is +0.8, not +1.9, and it is
drawn — as tongue offsets, which is where it lives.

**The flame now sits squarely on the head.** The old path closed to a point at
(50, 33); the coin's flame is 9.85 units wide where it meets the head. Rows
y 31..33 carried 10.4 units of mask per row against 5.5 of our ink. That is the
largest single term in the fill.

**The residual OUTSIDE is the reference's registration, and that is measured,
not asserted.** Sweeping a rigid x-shift of the drawn element: proofbright
minimises at dx +0.45 (**0.56 %**) and unc2005 at dx −0.45, i.e. each file
minimises at its own measured registration offset, 0.9 units apart. The
shape-only residual is 0.56 % against the old flame's 3.38 % at ITS own
optimum — where its fill still could not exceed 76 % at any shift.

**Published, not tuned around (R2):** OUTSIDE on `unc2005` went 11.62 % →
17.35 % while its FILL went 85.11 % → **99.62 %**. Our flame now strictly
contains that mask; the 17 % is the 0.45-unit erosion difference between the
two masks (1.00 vs 0.55), and it cannot be reduced without drawing a flame
smaller than the coin's. The notch-wall pass also moved headline OUTSIDE on
proofbright 2.92 % → 3.44 % while the shape-only residual fell 0.88 % → 0.56 %.

**What was refused.** The coin's tips are above the mask's, because erosion
takes more off a point than off a slab — proofbright and unc2005 disagree by
0.45 (tongue D) to 2.25 (tongue A) units. A two-point extrapolation through two
erosions is not a measurement, so **the tips are drawn 0.15 units BELOW
proofbright's mask**, not above it. No corrected flame WIDTH is published
either: the slope between the two files' widest rows is −4.2 units per unit
eroded where a parallel-sided slab gives −2.0, which means the two rows are not
measuring the same feature.

T1 32/32 (dime reverse self-NCC 0.449–0.452 → 0.453–0.455, margin 0.224–0.228 →
0.238–0.241; the per-photograph rows are unchanged to three decimals). D9 clean
over 120 renders, D8 dime reverse 0.0000 % outside the field circle, D10 PASS,
D11 reverse-min 0.0730 → 0.0742.

## v1.96.0 — 2026-08-24

**A frozen artefact cannot carry its own retraction — and I proved that by
making the same mistake twice, one minute apart.**

`_jq8contain-v2.mjs` is pinned at hash `512f61d57444b288`, which **seven
published records cite**. The v1.91.0 repair to its response test was applied
**in place**, moving the hash to `28717096e3a2328a` and silently breaking every
one of those citations. §1.1 says *retract beside, never rewrite*; that was my
merge, and it did the opposite.

**Then, fixing exactly that, I restored the file byte-exact and added a
supersession note inside it** — moving the hash to `833c6f37f2eaf93e`. The same
error, during its own repair.

So: v2 is restored **byte-identical** at `512f61d5…`, the repair lives in
`_jq8contain-v3.mjs`, and the note sits in a **separate file beside it**. Three
live instruments import v2's helpers, and one of them documents that it does so
"unedited at its published hash" — true again.

**The general rule, now stated where it will be read: if a file's hash is cited
anywhere, the only safe edit is no edit.**

**The anchors test correctly went red on the restored file**, because v2's
anchor genuinely *is* stale — that defect is why v3 exists — but it may not be
fixed. The exemption added is deliberately narrow and **auditable**: `X.mjs` is
exempt if and only if `X.SUPERSEDED.md` sits beside it **and that note names the
file replacing it.** A silent skip-list would be a loophole; a note that must
name its successor is a record.

Response-tested three ways: with the note, green; **note removed, red**; **note
present but naming no successor, red.**

v3 verified working: response 0.0000 % → **4.1890 %**, injection asserted real,
zero-translate null test bit-identical.

## v1.98.0 — 2026-08-25

**The dime's flame has five tongues; we drew three. First element scored alone
against the coin's own mask.**

New method, at the owner's direction: one element at a time, judged by whether
it stays inside the mask *and* fills its intended part of it — never as part of
a whole-face sum, because a sum hid which term was wrong in four earlier rounds.

| flame, node `2.1.0` | before | after |
|---|---|---|
| **OUTSIDE** the mask | 5.76 % | **3.44 %** |
| **FILL** of target | 72.84 % | **93.42 %** |
| ink | 136.52 | 170.89 (target 176.63) |

*(Both FILL figures use the corrected window — see below. The old flame's ink
stopped at x 57.1, so it had none in the strip the correction adds; its hit
count is unchanged and the comparison is exact.)*

**The shape, measured.** The mask's top edge at 0.25-unit steps, on both
surviving references, referred to the torch's own axis:

| tongue | offset pb / unc | tip y pb / unc |
|---|---|---|
| A | −6.00 / −6.00 | 22.15 / 24.40 |
| B | −1.50 / −2.00 | 18.70 / 19.90 |
| C | +1.50 / +1.00 | 18.35 / 19.10 |
| D | +4.00 / +3.50 | **17.55 / 18.20** ← tallest, right of centre |
| E | +7.50 / +7.00 | 19.00 / 20.55 |

The old path had one tall tongue **on** the axis — where the coin has a notch
(floor 19.75) — and two 1.6-unit horns standing in the A|B and D|E notches. It
also closed to a **point** at (50, 33) where the coin's flame is 9.85 units wide
sitting on the head: rows y 31–33 carried 10.4 units of mask per row against
5.5 of our ink, and that waist was the largest single fill term.

**A standing refusal is reversed, by a control.** The file said the
photograph's off-centre flame was "the kind of thing a tilt or an off-centre
light does" and declined to copy it. The separating measurement is to quote the
flame as an offset from **the torch's own axis on the same mask**, so
registration cancels:

| | torch axis | flame centroid | offset |
|---|---|---|---|
| proofbright | 50.45 | 51.27 | **+0.82** |
| unc2005 | 49.50 | 50.28 | **+0.78** |

The two files' own registrations differ by **0.95 units in opposite
directions** and the offsets agree to **0.04**. The flame really is off-centre —
by +0.8, not the +1.9 a raw read suggests — and it is now drawn as tongue
offsets rather than a shift.

**Refused, with numbers:** lifting the tips (erosion takes more off a point than
a slab; the two files disagree by 0.45–2.25 units, and a two-point
extrapolation is not a measurement — tips drawn 0.15 *below* the mask); a
corrected flame width (the widest rows fall 4.2 units per unit eroded where a
parallel-sided slab gives 2.0, so the two rows are not measuring the same
feature); and shifting +0.45 onto proofbright's registration, which would have
taken OUTSIDE to 0.88 % **by tuning to one file's error**.

**R2 disclosure:** the notch-wall pass moved headline OUTSIDE *up*, 2.92 % →
3.44 %, while the shape-only residual fell 0.88 % → 0.56 %. On `unc2005`
OUTSIDE rose to 17.35 % — with FILL **99.62 %**, i.e. our flame strictly
contains that mask and the 17 % is the 0.45-unit erosion difference, not shape.
Published rather than tuned away.

**Instrument correction from the round:** `WINDOWS.flame` capped x at 58 while
the coin's flame reaches 58.75, so FILL's denominator was short. Widened to
59.5. The round also confirmed the blob at x ≈ 58 **is flame, not an oak leaf**.

## v1.97.0 — 2026-08-24

**The quarter obverse's wig is re-authored as one comb: every mark is now an
integral curve of the coin's own measured direction field, and the wig still has
zero centreline crossings.**

Ledger **D1**, the largest open art item, and the first round to change art
since v1.92.0.

**Round 11 measured the fault and refused the fix, correctly.** Rotating each of
the fourteen wig marks rigidly to the direction measured at its own midpoint
took the error to 0.1 deg — and put **eight centreline crossings** into a wig
that had none, because the marks are an interleaved stack and turning members of
a stack individually makes them converge. Its refusal named the remedy: crossing
is not a property of the target angles, it is a property of treating fourteen
marks as fourteen independent objects. **Two integral curves of one
single-valued field cannot cross.**

**So the field had to become a field.** `judge/_qw1field.mjs` measures
theta(X, Y) over the whole wig on a 0.5-unit grid — 3358 nodes inside the hair
mass — carrying orientation as a double-angle vector so it averages and smooths
with no wrap-around case. **The smoothing scale is measured, not chosen:** build
the field from two references, score it against the third where the third
resolves, sweep sigma. The leave-one-out minimum is sigma 1.0 at **9.08 deg**,
and the curve is nearly flat (9.33 at 0, 9.30 at 2.0, 12.90 at 8.0). That floor
is the honest error bar — no drawing can follow this field more closely than a
perfect tracing of two references follows the third.

**`judge/_qw2gen.mjs` draws each mark as a streamline** from its own former
midpoint, out to its own former arc length, fitted with two or three
C1-joined cubics. Widths untouched; total drawn length 206.8 → 206.4 units
(−0.2 %); seeds unmoved. Re-running the generator on the result re-derives it —
it is a fixed point, not a nudge.

**The published metric was asking a question the new marks cannot answer.** It
compares a mark's *chord* angle with the coin's direction at that chord's
*midpoint*; for a curve tangent to a curving field the chord matches nowhere in
particular, and its chord midpoint need not lie on the mark at all — on the new
marks it is up to **2.99 units away**. Both metrics are published:

| | before | after |
|---|---|---|
| **A** chord vs coin at the chord midpoint | median 10.3°, worst 37.8°, 9/14 out, sign **12:2 shallow** | median 9.0°, worst 28.4°, 5/14 out, sign **7:7** |
| **B** drawn tangent vs coin, 9 stations per mark | median 14.3°, worst 60.9°, **84/126** stations out, 10/14 marks | median **2.3°**, worst 20.0°, **8/126** stations out, **0/14** marks |

Metric A's median moves 1.3°. What it destroys is the finding it was raised on:
the error was one-sided 12:2 and is now 7:7, so there is no systematic
under-rotation left. Metric B is the one that shows the change, and 2.3° is well
inside the 9° the references support.

**Numbers that moved the wrong way, published and not tuned around** (R2):

- **T1** quarter-obverse self-score **0.573 → 0.562**, margin 0.379 → 0.368, at
  every size. Still **32/32**, still the widest margin on the obverse sheet.
- **The crown tone**, by 0.035. The streamlines pull `base[0]` and `base[1]`
  into more overlap, so the lit union over the `wigCrown` patch shrinks: mean
  grey 198.07 → 192.95, so ~1.336 → ~1.301 against the coin's 1.421. `wigMid`
  and `wigBack` are unmoved.
- **Eight pairs of marks crowd**, worst 0.50 units of overlap (0.42 device px at
  84). **Re-spacing the seeds to open them was refused with a number:** it does
  reduce the worst overlap to 0.17 and leaves metric B at 2.4 — and it takes
  ridge duty to **0.462, above the coin's own 0.350–0.443 band**. As drawn,
  ridge duty is 0.362 → 0.391 and cut duty 0.359 → 0.409, both still in band.
  Shortening the marks instead throws away up to 45 % of a mark's length and
  empties the front of the wig; also refused, also with its numbers.

**`_qo5field.mjs`'s own N4 null test had the straight-mark assumption baked in.**
It compared the tensor's reading at a mark's midpoint with that mark's *chord*,
so the published instrument refused to report on art that is closer to the coin
than the art it was written for. Corrected to the local *tangent* at the
mark's *mid-arc* point — identical for a straight mark, so nothing about the
round-11 measurement is weakened.

**Said plainly, because it is not resolved:** the coin's wig is not one laminar
family. At x 44–52, y 22–34 — the temple, in front of everything this drawing
draws — the field runs −57° to −82°, a near-vertical family we do not draw at
all. At the nape the references disagree by 28° because the coin has a rolled
*curl* there and a direction field is the wrong model for a spiral.

Verified: T1 32/32, D9 56/56, zero centreline crossings, suite green.

## v1.95.0 — 2026-08-24

**Instrument debt: an instrument was editing the art, five response tests were
dead, and the primary gate's registration walked outside its own bounds.**

No kid-facing change. `src/art/coins.js` is byte-identical to v1.94.0.

**`_sw8sync.mjs` WROTE `src/art/coins.js`.** `writeFileSync` at module top
level, no flag, no guard — so running the instrument library **edited the
drawing every gate scores**. It changed `VIGNETTE.coat` to a path built from
`_sw7gen.OVAL`, which is round 0's superseded ellipse (ry 14.00 against the
15.75 the art draws). Reverted, and the file is now a report-only drift
detector. `WRITERS.md`'s rule is restated wider: *running any instrument, in
any order, must leave the repository byte-identical — `src/art/` included.*

**Five response tests had gone stale and nobody noticed, because nobody runs
the library.** `_jd14d1resp`, `_jl1cap`, `_jl1floor`, `_jl3probe` and
`_jq10tier` all anchor on an exact fragment of `coins.js`; four of those
fragments died at v1.93.0/v1.94.0. Each guard *did* fire — they failed closed,
not open — which is why this went unseen for two releases while the gates kept
shipping verdicts. All re-anchored with an exactly-once assertion, a proof the
substitution reaches the *render* and not just the text, and a null test.
`tests/judge-anchors.spec.js` now enforces it inside `npm test`.

**The primary gate's registration search walked outside its declared bounds.**
`_jq20indep.bestReg` rebuilds `[best.du ± 0.005]` inside the loop that
reassigns `best`, so the neighbourhood crawls after the answer: **148 of 231
reference pairs (64.1 %) finished past ±0.035 R, the worst at 0.075 R**, with
NCC inflated by up to **+0.0537**. It is path-dependent — `dv` drifts four
times further than `du` purely because it is the inner loop. Superseded by
`_jq20indep-v2.mjs` (anchored, and it reports `atBound`); the old file is left
byte-identical at its published hash. **T1 is 32/32 under both**, no diagonal
cell moved, and every margin *widened*: obverse 38 px nickel 0.187 → 0.205,
dime 0.284 → 0.302. The walk had been understating the drawings.

**T1 runs in a worktree.** Eight eval modules under `coloringbook/` — not the
three previously recorded — were gitignored, so the primary gate did not exist
in any clone. Tracked, without moving them: no import rewritten, **no
instrument hash moved**, and the bytes are exactly those already hashed in
`_jd0hashes.json`, `_jp0hashes.json` and three scorecards.

**A bounded registration now says so.** 64.5 % of T1's registrations and 54.0 %
of T5's sit on a search bound, which makes them *lower bounds*. T5 marks each
such cell `~` in the table instead of only reporting the aggregate; T1 prints
its rate beside the verdict.

**`penny-rev.jpg` is published as unusable for geometry.** Its 4.9 % residual
is a frame CROP, not obliquity — the coin is square-on and ~11 px of it is off
the left edge. Three independent fitters disagree on R by 3.39 % where both of
its pool-mates agree to 0.47 %, so no coordinate is published; the correction
sheet learned how to refuse. It stays in T1, with its margin stated.

**`nickel-obv.jpg` / `nickel-obv-unc2004.jpg` confirmed one photograph** —
MADbox 5.01, dHam 3, against a nearest different-photograph pair at 57.14. No
T1 row moves; the exclusion now rests on evidence rather than one statistic.

**Two instruments stopped registering on the area.** `_nk17grid.mjs` — which
draws the ruler this project reads measurements off — and `_nk1cmp.mjs` now use
`_rimfit.fitRim`. Their grids and crops move outward by 0.82 %–5.00 % per file.
The count of nine area-registering instruments was wrong: it was two.

**`_jq10tier.mjs` retired by move.** Its "declared tier contract" table asserts
a contract v1.94.0 deleted; at 26/44/84 px the emitted SVG now has identical
element counts. Re-hashes identically at its new path.

## v1.94.0 — 2026-08-24

**Tier-era dead code removed — and twelve comments in it were false.**

Purely subtractive: **the byte-identity partition reads 0/60 at every one of
eleven steps**, and a stronger 240-cell grid (12 sizes including four the app
never draws, value on and off) is byte-identical too. Code lines
**1658 → 1540**; the *file* got longer, because a retraction is longer than the
claim it corrects.

Removed: `iconS`, `iconCy`, `iconCx`, `iconWig`, `iconBust`, `tierOf`,
`INS_MAIN_MIN`, `INS_REST_MIN`, `REV_TEXT_MIN`, all 11 `min:` gates, all 12
`tier ===` branches, `EWICON`/`EBODYICON`, `EDGE.field`'s per-tier object, and
**`tier` the parameter itself** — from `struck`, `bust`, all four motifs,
`discSVG`, `vignette`, `noteSVG` and `coinSVG`. The brief undercounted: there
were **five** `fine` declarations, not two.

**The dead code was not inert — it was misinformation.** Twelve false claims
retracted beside their corrections rather than deleted, including:

- *"`fine` (≥130) is NEVER true in the app — anything put behind it is invisible
  to a child."* **This is the comment that misled a round.** `boxW` is 332.2 at
  every size; the balustrade, fanlight, dome ribs, sills and shaft flutes all
  draw at 38 px.
- *"a coin at 190 px and a coin at 26 px are not the same drawing… `coinSVG`
  emits DIFFERENT GEOMETRY per size band"* → byte-identical apart from two
  attributes, pinned by `tests/coins.spec.js`.
- The nickel round's **entire justification for `min: 62`**: *"until this round
  it was not present at ANY size… a child saw LIBERTY, a bare left rim, and
  nothing else."* IN GOD WE TRUST was already there and `min: 62` changed
  nothing. Its companion claim — *"THE DATE IS NOT GIVEN A FLOOR… at 84 px it
  would add four glyphs of noise"* — was also false: the date draws at 84 px and
  always did.
- *"the shared 135 stranded three of the four coins with NO reverse legend at
  the naming size"* → nothing was ever stranded; four floors replaced one no-op.
- *"at 84 it is a speck of dirt on the die"* (the dentils) → they drew at 38 px.

Measurements were **kept wherever they survive the correction** — the 130 px
legibility observation, the icon energy histogram, the ink-coverage figures, an
earlier refusal, and the rim arithmetic all remain, several because they are
cited elsewhere as evidence.

**Found on the way, and not on the list:** `_jd14d1resp.mjs`'s response test
**anchors on a string that no longer exists**, so it **fails open** — the third
instance of that failure mode. **Seven live instruments keep a private
`tierOf`** and still print rows labelled "icon"/"mid": distinctions the art no
longer makes. And ledger **C2 is moot as written** — *"`hairFill` has the wrong
sign at mid"* names a branch that could never run; the live question is what
that sign does at 48 and 54 px, which has never been tested.

## v1.93.0 — 2026-08-24

**The primary gate scored four denominations, its control sorted a photograph
against itself, and its pool had never been audited.**

Three ledger items closed (A1, A2, A3), eight opened.

**The pool audit.** A new instrument sweeps all 78 images and every
within-face pair, using **no registration at all** — a content-box MAD and a
64-bit dHash, two statistics of different kinds, both required to agree.

| pair | MAD | dHash/64 | design NCC | in T1? |
|---|---|---|---|---|
| `dime-rev.jpg` + `dime-rev-2.jpg` | 1.4 | 1 | 0.995 | **both** |
| `nickel-obv.jpg` + `nickel-obv-unc2004.jpg` | 5.0 | 3 | 0.997 | one — **never recorded anywhere** |
| `quarter-obv.jpg` + `quarter-obv-2.jpg` | 2.5 | 2 | 0.996 | one |
| `quarter-rev.jpg` + `quarter-rev-5.jpg` | 1.3 | 1 | 0.995 | neither |

**Why registration-free matters, proved in-pool:** `qp1964-obv-pad.png` and
`qp1964-obv.png` are the *same image*, and their **registered** design NCC is
**0.019**. A duplicate detector that registers first cannot see duplicates.

**The transfer table barely moved — the control is where the damage was.**
Removing the duplicate changed exactly **one of 32 cells** (penny reverse, dime
column, 54 px, 0.290 → 0.289), *because a duplicate adds nothing.* But the
dime-reverse **control** fell **0.995 → 0.647 / 0.776 / 0.779**: the published
figure was a photograph sorted against itself. And the control held out only
`POOL[id][0]`, so it ran **8 tests where the pool supports 22** and had **never
sorted 14 of its 22 references**. Now leave-one-out, 11/11 per face.

**T1 can be extended after all.** Its circle was one function — the map from
grid (u,v) to source pixels — not a property of the method. Making that
per-subject (fitted rim / fitted printed border) leaves everything downstream
unchanged. Two modes are quoted together: **A** normalises aspect away, **B**
keeps it. Control A 26/26, null 52/52, **coins 32/32 from an implementation
sharing no code with T1**, buck **4/8** (A) and **7/8** (B).

Each response test had its prediction written **before** the run: stretching to
the photographs' aspect moves A by **+0.0002** (null holds) and B by **+0.4582**;
a quarter pasted into the frame flips A to `quarter`; a blank note collapses A
to 0.000 **and** fails B — so B is not silhouette-only.

**A retraction that is the most useful thing in the round.** It removed
`nickel-obv-4.jpg` on three converging signals, then ran the decisive test it
should have run first — leave-one-out under T1's own registration — which sorts
it correctly at 0.671. **Put back.** Chasing the discrepancy found the real bug:
**its own new fitter let a single stray background pixel set the radius.**
Flooding instead of thresholding took the error 14.78 % → **3.13 %** and fixed a
second reference too. *Two references were nearly blamed for a bug in the
instrument measuring them.*

**Art findings, reported not touched:** our note **reverse sorts as a PENNY at
all four app sizes** in mode A; and **the note is the wrong rectangle** — paper
aspect **1.7944 against the physical 2.3525** — where correcting aspect alone
moves the shape score **0.267 → 0.726**. `coins.js` says the box is deliberate,
so it is an owner decision (ledger D15).

**Opened:** `_jq20indep.bestReg`'s refine is **unanchored** — it rebuilds its
offsets inside the loop that reassigns `best`, so the search walks outside its
declared bounds. Reported, not edited: it is hashed into two rounds' frozen
sets. **54.1 % of registrations sit on a search bound**, so thin-margin rows are
the ones to distrust. And **T1 itself cannot run in a worktree** — the same
defect that made another instrument unrunnable, in the primary gate.
**Tier-era dead code removed from `src/art/coins.js`. Zero pixels moved:
the byte-identity partition reads 0 of 60 cells changed, and a wider
240-cell grid (12 sizes × value on/off × 5 ids × 2 sides) is also identical.**

v1.78.0 replaced the three-tier system with one drawing per face authored at
`DRAW_SIZE = 380`, but left the machinery in place. Since then `tier` has been
the literal `'full'` on every call and `boxW` has been the 380 px box at every
displayed size — 471.2 / 380 / 332.2 / 298.4 / 280.5 for the note, quarter,
nickel, cent and dime. Everything keyed on either was frozen, and some of it was
**actively misleading**: a comment asserting "`fine` (>=130) is NEVER true in the
app — anything put behind it is invisible to a child" had already been read by a
later round as licence to treat those marks as free. They draw at 38 px.

Removed, all verified at 0 code references afterwards: `tierOf()`; the `tier`
parameter itself, threaded through `struck`, `bust`, all four reverse motifs,
`discSVG`, `vignette` and `noteSVG`; **12** `tier === 'icon' / 'mid' / !== 'icon'`
branches, including four whole `icon` drawings (the Memorial, Monticello, the
torch, the note vignette); `fine` in five places; **11** `min:` size gates plus
`INS_MAIN_MIN`, `INS_REST_MIN` and `REV_TEXT_MIN`; the per-coin `iconS / iconCy /
iconCx` trios, `iconWig`, `iconBust`; `EDGE.field`'s per-tier object; `EWICON` /
`EBODYICON`; and two parameters that had quietly gone unused (`discSVG`'s `size`,
`boxW` on all four reverse motifs).

**Comments were retracted beside their corrections, never silently deleted**
(COIN-JUDGE §1.1). Nine false claims are now quoted with the fact next to them,
including the file's own opening paragraph ("a coin at 190px and a coin at 26px
are not the same drawing" — they are the same drawing) and two cases where a
round's stated justification was a no-op: the nickel's `min: 62` and the note's
`EWICON`, which held a **second, superseded set of wing tips** for a face that
had already shipped one wrong set for three rounds.

**Two things that look dead and are not**, reported rather than removed:
`_jd14d1resp.mjs` anchors its response test on the dime's now-deleted `iconS`
string, and seven judge instruments keep private copies of `tierOf` and still
label rows "icon"/"mid".

Code lines (non-comment, non-blank) 1658 → **1540**. Test suite green, 461/461.
`_jq9well.mjs` D9: 180 renders, 0 faulty.

## v1.92.0 — 2026-08-24

**Dime reverse Loop 3: the oak leaf's outline, and why two previous rounds
called their own result a bead chain.**

Both earlier attempts measured the leaf's **aspect** (1.6:1) and its **sinus
depth** (45–55 %) — and neither measured the quantity that actually decides the
shape. This round measured the **width profile along the midrib**: 28 bins, on
the one oak blade that is an isolated component on *both* usable references,
the two files agreeing to **0.06 of their own maximum half-width** across the
whole run.

- **The coin's lobe is broad and its sinus is a narrow slot.** Ours was the
  reverse — a circle on a spine, **which is a bead chain at any depth.** That is
  why deepening the sinuses never worked.
- **The coin's leaf has a lobe-free neck** for its first fifth, at under a fifth
  of its width. Ours reached half its width by a sixth along.
- **Four lobe pairs plus a terminal, not three.** An earlier count of "four"
  included the terminal; the path drew three plus a terminal.

Re-authored inside the same measured 12.0 × 7.5 box — the reach line, `lk`, `wk`
and every footprint number untouched. The oak now breaks into **4 pieces at
+1.2 erosion where it was 3**, largest mass **218 → 131 u²** (references
211 / 70). A first draft at 39–43 % sinus read as a comb and is recorded too.

**D10 closed, and the contradiction was never in the coin.** Reach (13.8),
petiole (3.3) and blade length (13.1) refused to add up by ~2.5 units. On the
one blade isolated on both files at zero erosion, the gap to the fitted
centreline is **1.50 and 1.52** — agreement to 0.02, which nothing else on this
face achieves — so the coin's petiole there is **~0.5 units**, not 2.5–3.0 and
not the 4.4 that built the TV aerial. Eroding by 1.2 moves the coin's reading
**+2.41 / +1.99**, about *twice* what was eroded. **The disagreement was between
two estimators, one of which reads a bevel skirt as air.**

**Two refusals, both with numbers:**

- **D11/D12 are one defect and it was not fixed.** The oak's lowest outboard
  blade is not at the wrong height — the mirrored angle has the **wrong sign**.
  Two estimators on two files put it at **+20° to +37° up-and-out**, where the
  ladder mirrors the olive's −13° down-and-out. And the oak carries **no inboard
  foliage below y 53** on either file (the acorn is there) while the olive
  carries it to y 57. **The two branches are not mirror images at the foot.**
  Refused because seven a side cannot be spent: moving that node forces every
  side assignment above it, and two ladder rows were authored as an
  *opposite-side pair*. Only two of the oak's seven nodes are isolated well
  enough to measure — *"exactly the position the round was in when it averaged
  two references and drew a TV aerial."*
- **Refused though it measured better:** scaling the oak blade's width by `lk`
  as well as its length. Drawn aspect 1.47–1.80 against a measured 1.40–1.63, so
  a uniform scale is closer on paper — but it widens every blade by up to 12 %,
  and "bigger leaves" is the trade that got an earlier round reverted.

**The two olive fruits were verified present** (they survived the revert),
centres agreeing to 0.9 units on both files. The files disagree on **size by
1.9× in both axes on both berries** — published, not averaged.

Acorn separability **2 / 2 / 2 objects at +0 / +0.3 / +0.6 erosion, unchanged**.
T1 32/32, reported not cited. Partition re-derived by the judge: 6/60,
`dime.reverse` alone. Suite 461. Cost stated: emitted face 32,969 → 42,545 bytes,
the oak path being drawn 21×.

**Judge's reservation:** at leaf scale the new lobes are closer to the coin than
the blob they replace, but they read more angular than the coin's rounded
projections, and at whole-branch scale the repetition is regular where the
coin's is not. No comb artefact survives at 38–84 px, which is what decided it.

## v1.91.0 — 2026-08-24

**Paying the instrument debt: eleven ledger items closed, and eight published
numbers corrected.**

No pixel changes — `src/art/coins.js` is byte-identical and the partition reads
**0/60**. What changed is that the gates now measure the art instead of
measuring copies of themselves.

**The cross-cutting bug, killed:** *an instrument must never hold its own copy
of the subject.* It was worse than recorded. `_jb14d1.mjs` had **both** sides of
its IoU as literals, so `D1 IoU 0.1496 FAIL` could not move for any reason
whatsoever. Recomputed live: **0.8834**, and **0.9872 PASS** against the
border-registered target. Retired by move, hash intact.

**A false gate constant, not a false drawing.** `_jb3seal.mjs`'s five buck D2
FAILs are PASSes. Its sixth — D2d-eagle **+6.06 %** — was believed real. It is
not: the note's printed-border fit **bleeds uniformly outward onto paper**,
which compresses a wide rectangle's aspect because the top and bottom errors
share a sign. Independent sub-pixel rule fits give **2.6352 / 2.6393** (two
photographs agreeing to 0.09 %) against the published 2.5610 / 2.5827, so the
shared anisotropy **1.3145 is 2.5–3.6 % low**. At the corrected value the eagle
reads **+3.5 % — a PASS.** *All six FAILs were the instruments' fault.*

**Published numbers now corrected** (old → right): buck D1 `0.1496 FAIL` →
0.8834 / **0.9872 PASS**; five buck D2 rows **FAIL → PASS**; D2d-eagle
+6.06 % → **+3.5 % PASS**; six `_jb8geom` D8b rows `0.000 %, depth −3.294` →
max ρ 0.7360 / 0.8872; note border ratio 2.5610 / 2.5827 → **2.6352 / 2.6393**;
anisotropy 1.3145 → **1.3475**; `_jp1discs.json`'s `penny-rev-artwork.jpg`
R 252.41 → **174.89**, cy 222.30 → **262.62**; and any note D1 reported as
**1.0000** was ours-vs-ours.

**Gates that could not fail, now able to:** `_jq8contain-v2.mjs`'s `RESPONSE=1`
**threw** on a missing anchor, so D8's ability to move was unverified while D8
verdicts kept shipping (0 → 4.1890 %, with the injection asserted real — 94 of
98 marks moved — and a zero-translate null test). `_jb8geom.mjs` had **two**
stale self-copies, one a `svg.replace(/cx="70"/)` that matched nothing.
`_jh8locus.mjs` now fails loudly on a stale anchor instead of carrying on.

**A canonical rim fitter, tested against ground truth:** `_rimfit.mjs` recovers
a **known** radius on synthetic discs (80 / 137.5 / 220 → 0.014 px), is
null-tested against an independent estimator to **−0.078 %**, and demonstrates
the failure it replaces on a synthetic annulus (rim exact, area **−19.65 %**).
Fresh per-file area error: `nickel-rev-2.png` **−31.71 %**,
`dime-rev-proofbright.png` **−28.84 %**, and five more. **Nine instruments still
register on area** and are named — each needs its own re-derivation, not a
blind repoint. Seven suspected files were false positives of the grep.

**Frozen artefacts are now protected** by `_freeze.mjs` (create if absent,
no-op on identical bytes, refuse a change without `JUDGE_REFREEZE=1`) — wired
into three instruments, one of which was an unrecorded fourth instance.

**A16 REFUTED, and the instrument was the problem.** The 0.459 "shared setup"
signal reproduces exactly but is ≈ cos(57°) between two unrelated background
ramps — the two files are different coins, publishers, decades and formats.
**Calibration: pairs known to share one plate score 0.039 and 0.106.** The
statistic ranks shared setups *below* unrelated ones, and 10 of 15 references
have no measurable background at all. No published number was contaminated.

**Two new items raised** rather than left implicit: three instruments still hold
stale copies of our art, one of them load-bearing (**A21**); and `.gitignore`
keeps the eval libraries out of the repo, so **63 of 286 instruments cannot run
in any worktree or clone** — §1.1's promise that any published number can be
reproduced does not currently hold for 22 % of the library (**A22**, owner
decision).
## v1.90.0 — 2026-08-24

**A petiole is not a free parameter, because the leaf's total reach is measured
too — which is why the previous attempt built an aerial.**

Loop 2b of the dime-reverse refinement, after Loop 2 was reverted for turning
the oak into a TV antenna and merging the acorn.

`reach = ped + blade`, and `LADDER`'s length column **is** reach — it was read
as base-on-stem *and* tip, on two files: 16.7, 16.5, 11.3, 15.0, 11.8, 12.2,
13.0 foot→crown. One line fits it (`reach(ay) = 13.79 + 0.2181(ay − 47.39)`,
residual RMS 1.7).

So lengthening a petiole without shortening its blade does not move the leaf
*off* the stem — **it throws the whole leaf outward**. The reverted round put
`ped` at 4.4 on a 12.0 oak blade: reach 16.4 where the coin measures 12.3. *An
aerial by construction.* The shipped drawing was already over at the crown for
the same reason (14.7–15.1 against 12.2–13.8) — **that is what made the crown a
tulip.** Reach now comes from the line and the blade takes the difference.

**The three carried findings, one of them half-retracted:**

- **The collinearity tilt is kept** (a blade at `rot` projects its width onto
  the offset axis magnified by 1/sin(rot)), but is now **per-branch, olive
  only** — see the acorn below.
- **The crown is one apex.** Terminal `rot` 77 → 86 and **sessile**, matching
  its measured 0.00 standoff. 77° inboard *cannot* produce the coin's central
  mark from a base at offset 16.6 whatever its length; 86° can. Our y29 run is
  `15.3-16.6` against proofbright's `15.3-16.4`. The 6.2 units of bare field
  between two prongs are gone.
- **"Width varies 1.72×" is RETRACTED for the olive.** That spread came from the
  crown *blob's* PCA width, and the blob is a **cluster**: proofbright's olive
  crown holds one component at every erosion level with a fixed centre —
  overlapping blades never split. Drawn at 1.35 the crown measured 8.28 wide
  against 7.09 and 5.40, **outside both files**; at 1.0 it lands between them.
  The **oak's 1.24 stands** — that one was a direct crop read.

**The acorn nearly died again, and the round caught it itself.** Applying the
tilt to both branches lowers an inboard leaf's base by `ped·(sin rot − sin
0.35rot)` — 1.0 unit at the 38° bottom node — which walked the lowest oak blade
onto the acorn: **two objects became one of area 55.** Hence per-branch tilt.
Final: the acorn measures **byte-identically to before**, `(9.19, 57.56)
5.03 × 4.2`, separate at +0, +0.3 and +0.6 erosion. **That test is now permanent
in the instrument** — the old windows excluded the acorn (offset > 6.5, area
≥ 6), which is exactly how the previous round lost it unseen.

**Oak petioles do not move.** Its two references disagree 2× (7.39/3.91 v 3.51);
ours reads back 0.5 short, and short is the right side to err.

**Rejected because it scored better:** terminal width ×1.35 on the olive — what
the blob extrapolation asks for, and the picture and the run table both say it
draws a spade.

**Could not determine, stated plainly:** reach (13.8 mean), petiole (3.3) and
isolated blade length (13.1) **do not add up** — about 2.5 units apart, and no
assignment satisfies all three. Most likely the standoff, since erosion eats a
struck coin's bevel before it eats our flat fill. Reach was chosen over petiole
length, at a stated cost: the olive stem stands alone on 9 of 21 rows where
proofbright has it on 20.

T1 reported not cited: 32/32, dime reverse 0.419 → 0.444. Partition re-derived
by the judge: 6/60 `dime.reverse` alone. D9 clean. Suite 461. Acorn
separability confirmed by the judge at 40×.

## v1.89.0 — 2026-08-24

**The dime's stem: the branches do not sweep, and the tulip had a stamen.**

Loop 1 of the owner's dime-reverse refinement, scoped strictly to the *path* so
its effect could be seen alone. **It refuted the brief's premise with a
number** — the judge had assumed the coin's branches curve and ours did not.

Measured with a **global chain** (cheapest path through every stem-shaped run
on every row, cost = total variation + a per-row skip charge) rather than a
local walk; a greedy predictor was tried first, drifted onto a petiole at y 56
and reported 18.48 where the raw runs are 15.8–16.3 and 18.0–18.9. It is kept
in the file as the thing that failed.

**One path, not two.** Taking the mean of (olive, oak) at each row cancels a
disc-fit centre error; those means agree between the two independent
photographs to mean |difference| **0.10** over 18 common rows, and the
half-differences are **−0.33 and +0.61** — opposite signs, similar size, i.e. a
registration slip rather than two shapes.

**The fit is a straight line:** `c(y) = 15.955 − 0.02941·(y − 62.5)`, residual
**RMS 0.140, max 0.376** — **1.68° outboard as it rises**. Ours leaned 0.43
units the *other* way and was **0.85 inboard at y 41**. The judge's
"14.0 → 17.3 across 48 units" was the span of a **tapered outline**, not a
centreline; the shipped centreline read 15.77 / 15.95 / 15.80 / 15.34 / 14.05 —
right in the middle, wrong at both ends.

**The tulip's stamen.** The stem ran to y 27.2, **twelve units above its own
topmost node, ending in a flat cut**. Our olive at y 28 carried *three* runs —
the middle one being bare stem standing between the two crown leaves. Neither
reference has a third mark there. That bar is a real part of why this branch
read as a flower. It now ends at y 38.4 in a point, and y 28 carries two runs.

**`ax: 15.9` is gone.** Each leaf's anchor is now `stemC(ay)` evaluated on the
drawn centreline at its own height — 16.15 at the foot to 16.76 at the crown.
The path is *generated* from `stemC`/`stemHW`, so an anchor and its branch
**cannot** disagree. That was the point of the loop.

**Shipped a change that makes an advisory number worse**, stated rather than
buried: D6 dime reverse 0.0937 → 0.0978, entirely because the drawing got 141
units shorter — the ratio-1.000 length is unchanged at 314.6, so the new stem
adds no uniform-width mark.

**Refused:** a uniform-width stem, which is what the data actually says (1.98
near the crown v 2.03 near the foot — no taper). A taper is drawn for D6
reasons and is **labelled a choice, not a measurement**.

**Could not determine, and labelled in the file:** the stem above y 54 is an
**extrapolation** of a line fitted below it — only one branch on one file has
stem in bare field up there, so there is no mirrored pair to cancel
registration with.

T1 reported, not cited: 32/32, dime reverse self .409 → .419. Partition
re-derived by the judge: 6/60, `dime.reverse` alone. D9 clean. Suite 461.

**Anchors:** the acorn does not move (it was never anchored to the stem). The
two olives' bodies are unchanged; only where their stalks *meet* the stem moved,
now read off the same centreline.

## v1.88.0 — 2026-08-24

**The note's relief copy was erasing the capstone gap and the eagle's rim at
the sizes the app draws. Tenth and last face of the sweep.**

`struck()` had never been removed from this face. The note's *obverse* dropped
it in an earlier round for a reason that applies verbatim here — an
intaglio-printed note has no lit die edge, and neither reference shows one —
but the reverse kept it, and the offset white copy was doing real damage:

- `reliefOff` clamps at **1.70 viewBox units** for every note narrower than
  69 px — that is **38, 48 and 54** — while the capstone's ray gap is **1.25
  units**. The white copy of the pyramid's truncated top landed at Y 22.25
  against the capstone's base at 22.70: **0.45 units of overlap, gap zero**, at
  three of the four sizes a child sees, and 0.12 short at the fourth. The
  detached capstone — which this drawing's own comment calls "the single most
  recognisable thing about the device" — **did not exist at any displayed
  size**.
- The same copy laid white ink outside the eagle roundel's rim and erased it
  from 9 o'clock through 12 to 3. At 54 px the roundel was an **open horseshoe**
  with the wings spilling through the gap; it is now a closed oval with the
  bird inside. Verified by the judge at 54 px against the previous build.

**The eagle's wings were never on a wing.** Drawn back onto both photographs
through the seal's own rim — by an instrument that parses the **emitted SVG**,
so it cannot drift from the drawing — the head, shield and tail land on their
features while the two crescents' tips sit past the E PLURIBUS ribbon in bare
hatched sky, and the outer edge runs through open ground for the top half of
its length. Measured tip ≈ **(−5.65, −5.25)** against the drawn **(−7.32,
−6.20)**. The published "wing span / rim width 0.8242" is retracted.

**Nothing was accepted because a number improved, and two got worse:** D6
reverse 36.73 % → 44.16 % (the denominator halved when the two bevel copies
stopped counting as marks — same ink), and D13 shortfall −0.339/−0.382 →
−0.344/−0.391 from the smaller wings. Both published rather than hidden.

**Refused, with the number:**
- **`EAG.ry` ≠ `PYR.ry` is a real defect and was not fixed.** The two seals are
  the *same circle* on both photographs (r/borderW **0.10071 vs 0.10069** —
  0.02 % agreement), so one value must serve both. The frozen eagle ellipse is
  **10.7 % out of round in photograph pixels**, which a circle cannot be, and
  that one bad fit is what dragged the mean. But the two candidate border
  ratios are 2.7 % apart and the constant is **shared with the obverse's
  vignette oval**, where a sibling round was working. Reported, not moved.
- **The eye is ~60 % oversize** (0.68 measured, 1.10 drawn) and **stays**: at
  0.68 it is 0.71 device px at the naming draw and vanishes, taking the only
  mark that says which triangle is the capstone. *Rejected because it would
  score better against the photograph and read worse on screen.*
- **A confident "12.7 % too wide" on the pyramid was withdrawn as the round's
  own error** — an early rim sweep returned 336 instead of 348 px, and every
  horizontal quantity divides by that radius. Nothing in `PY` moves; the trap
  is written into the file.

**Published miss:** the 1.25-unit gap *is* the note's (measured 0.1124 of r,
within 2.4 % of ours). It is 1.30 device px at 84 px and the gap row reads 226
against a 244 field — a **21 % dip, one row deep**. The detached capstone is
not carryable at the sizes this app draws, and that is stated rather than
papered over.

**Six instrument faults found**, four of them in shipped judge code: a
border-fit whose corners land 6–8 px onto blank paper (*the registration
everything on the note hangs from*), the out-of-round eagle ellipse, a D1 that
restates a stale obverse locus and fails code that no longer exists, a D8 whose
own response test does not move its number (it self-declares UNTRUSTED), and a
look-sheet rendering two sizes the app never draws while omitting the naming
draw. The sixth was the round's own: a DoG segmenter that failed its null test
and was discarded — **the eleventh instrument to fail at separating device from
field in this project.**

Suite 461. D9 0/180. Partition re-derived by the judge: 6/60, `buck.reverse`
alone.

## v1.87.0 — 2026-08-24

**Washington's portrait was 6.3 % of the note short, and the gate that should
have caught it was scoring our own ellipse against a copy of itself.**

Ninth face of the sweep. Both references proved independent **by reading them**
rather than by a correlation: two different physical notes — different serials,
districts, series and signatures.

**The defect began as a false claim.** "The obverse has no printed-border
fiducial" was asserted once and repeated twice in `coins.js`, and every
geometric number on this face was consequently registered on the *paper box*
with a 5.9 % caveat. The note does have one: the border-fit instrument was
scanning *inward* to the first threshold crossing instead of taking the
**darkest** line in the band, and landing on the wrong rule. Re-fitted, border
ratios agree **2.4973 / 2.4812 — 0.65 % apart** against a 1 % gate.

Re-fitting the vignette on that fiducial:

| | cx | cy | rx | ry |
|---|---|---|---|---|
| bill-obv.jpg | 50.00 | 31.50 | 10.00 | 15.75 |
| bill-obv-2.jpg | 50.00 | 31.25 | 9.75 | 15.75 |
| **the frozen locus** | 50.05 | **30.30** | 9.75 | **14.00** |

Two references agreeing to ≤0.25 units on every parameter. **The portrait was
28.0 units tall where the note's is 31.5** — on the most identifying device on
the face. `cy` and `ry` corrected; **`cx` and `rx` refused**, their deltas being
smaller than the sweep step and the two-reference spread. D1 0.8769 → **0.9872**.

**D1 could not see it because it scored our ellipse against a copy of our
ellipse and reported 1.0000.**

**Rejected because it scored better:** the corner numerals. Ours measure cap
height 7.30 against the note's 11.4/8.2, and a corrected font-size put the ink
*exactly* on the measured centres — then it was reverted after looking at
38/48/54/84, because the 9.6-unit glyph tangles with the scallop wave, and
moving that wave needs evidence this round does not have.

**And the round's own eye was overruled by its instrument:** it claimed the
numeral pair was asymmetric at 8.8 v 90.4; the render-diff put the ink at
9.00/90.60, symmetric about 49.80 — a fifth of a device pixel.

**Another false comment removed:** "that is where the Treasury seal sits, not a
legend the note carries" — the note *does* carry ONE there, overprinted across
the seal, which is why D5 had never scored it. Scored for the first time:
cap-top passes, baseline **FAILs** at 3.2× gate, X extent **FAILs** at +25.4 %.
Not repairable at this size and said so.

**Open and unmeasurable, stated plainly:** where the coat meets the oval —
inside the vignette the coat and the engraved ground are the same tone with no
boundary at any threshold, on 16 of 20 columns. Committed as a failure report
rather than deleted.

Suite 461. D9 0/180. Partition re-derived by the judge: 6/60, `buck.obverse`
alone.

## v1.86.0 — 2026-08-24

**The quarter's wreath was not a wreath. It was a solid crescent, and the
arithmetic said so exactly.**

Eighth face of the sweep. In the branch's own frame the stem heads −8.9° at
t 0.16 and −48.3° at t 0.92, and the leaves were set at −19.4° to −45.3° —
**within 3° of the stem at four of the six stations.** Six ellipses **10.4
units long** laid end-to-end along their own stem at centre spacings of
4.67–5.15 must overlap: **5.4 units of every 10.4, 52 % of each leaf.** A
3.2-unit ribbon ran the full length underneath and unioned what was left. The
result was **one closed region with zero field inside it anywhere**, and at
38/48/54 px it was the darkest mark on the coin, reading as a filled chevron.

The cameo proof settles what the coin does: blades **radiate** from the stem,
**alternate sides**, and struck field shows between every adjacent pair. A
blade is ~7 × 3 units against our 10.4 × 5.2, and the stem 1–1.5 against 3.2.
Now: blades radiate 55° off the tangent, alternating, 6.8 × 3.0; stem 1.4.

**The Bézier is untouched** — an edge treatment, because D2 is UNMEASURED here.
Alternation *phase* was checked both ways: starting outward puts the terminal
blade pointing up-and-in, as both proofs show, and drops max radius 36.70 →
35.88 against the bottom legend's real cap inner edge of **36.65** — computed
from the 6.25-unit cap height, *not* the 8.93 font-size, which would have
falsely reported a collision.

**T1 32/32**; quarter reverse own score 0.338 → **0.397**, margin 0.144 →
**0.223**. Partition re-derived by the judge: 6/60, `quarter.reverse` alone.
D9 0/180, D8 0.0000 %, suite 461. Reported, not cited — the picture was the
gate, and at every app size the chevron is now a wreath with separable leaves.

**Refused, with the number: the tail.** Rasterised alone against the union of
the arrows and the anatomy, **67.7 % of its 85.0 sq units is covered**, and the
27.5 that survive read as leg — it is sized to what covers it. The coin's tail
is *not* hidden: a shingled fan below the bundle, ~15 units wide, reaching 4
units past it. Refused anyway, because **the only two files that show it are
the two cameo proofs** — the worst disc fits in the pool (p95 4.79 % and
11.05 % against 0.15 %/0.32 %) and the exact pair suspected of a shared
photographic setup — and neither rim-fitted photograph shows it at ladder
magnification.

**The pool is NOT the healthiest in the project**, contradicting this sweep's
brief: `quarter-rev-6.jpg` is a **2006 Nebraska state quarter** and
`quarter-rev-5.jpg` is the **same photograph** as `quarter-rev.jpg` (raw NCC
0.9850). Effective pool **three files, one unusable for geometry**. Both facts
were already published elsewhere — a re-derivation, not a discovery. Unlike the
obverse, **no `coins.js` comment on this face cites either bad file.**

**Two instruments failed their own checks and said so.** A lace metric scores
bare field 26.5–30.5 against wreath 29.4–33.8 while a **solid** control scores
*higher* than field — the photograph column is surface texture, so only the
our-art column means anything (4.0 → **17.2** alternations per 100 units). And
D2 remains UNMEASURED: device fraction inside r 40 falls 0.996 → 0.010 across
thresholds, **monotone, no plateau** — segmentation still fails on a cameo
proof.

⚠️ **Handoff, not fixed here.** `coins.js` records *"the ladder puts the coin's
eye at (47.6, 24.5)"* and the code draws `cx="47.4" cy="25.4"` — a **0.92-unit
gap between a recorded measurement and the drawn constant**, on the mark the
file itself calls "worth more than any other mark on this motif". Same family
as the nickel's missing `eyeMark`.

## v1.85.0 — 2026-08-24

**No leaf on the dime was attached to anything.**

Second attempt at the branches, after the judge reverted the first for reading
as a tulip. `SPREAD` anchored each blade by its **centre** at a fitted offset
from the stem — so the ladder was seven free-floating glyphs beside a stalk,
and nothing in the file said otherwise because attachment had never been a
measured quantity. The base now lands *on* the stem and the centre is derived
from it: attachment is arithmetic, not a constant that happens to be close.

Four more, three of which no number in the file covered:

- **The blade was an ellipse — blunt at both ends.** Every leaf on both
  references is a lance: pointed tip, narrow base, widest a third up. Rounded
  ends are petals, and that is most of why the first attempt read as a flower.
- **The oak leaf sat in a 2.05:1 box nobody had re-measured.** Every oak leaf
  on the coin is 1.4:1–1.6:1 (13.9×9.3, 13×8, 11×7.5, 9.5×6). Four lobe pairs
  in a 2.05:1 box must be small and round — a bead string, which an earlier
  round *named* and then reproduced. Re-authored at 12.0 × 7.5.
- **The olive branch carries two olives and we drew none.** Not mentioned
  anywhere in the file; both references agree to 0.5 units.
- **Every leaf hangs off a petiole; ours were sessile.** The 2–3 unit gap is
  what breaks the branch into pieces instead of a column.

| foliage rows | olive | oak |
|---|---|---|
| the coin | 29.50 / 28.50 | 29.50 / 26.75 |
| ours before | **44.00** | **40.25** |
| ours after | **29.75** | **31.00** |

The oak's extra unit is the acorn, untouched. Its y-57 neighbourhood now reads
acorn | field | stem — the structure it lacked.

**The round took a WORSE T1 than the version that was reverted, deliberately.**
Own score 0.336 → **0.408**, margin 0.141 → **0.207**, against the reverted
attempt's 0.451 / 0.270 — and it said it would not have taken that one. It also
rejected two oak outlines *on the picture without scoring them* (one read as a
maple leaf, one as a bead chain), and published a real cost: the retired D11's
reverse-only minimum falls 5.4 %.

**T1 32/32, D9 0/180, partition 6/60 `dime.reverse` alone** (all re-derived by
the judge), suite 461.

**Stated as a choice, not a measurement:** the two references' oak-leaf widths
disagree by 36 % of the smaller, and 7.5 is the mean of four leaves read off
crops. One length per plant is a simplification the coin does not make — its
olive blades run 11.3 to 16.7.

## v1.84.1 — 2026-08-23

**The acorn is real. It was in the wrong place, and v1.84.0 deleted it instead
of moving it.**

Owner, looking at the same 40× crop: *"The zoomed object on the dime is an
acorn."* It is — a smooth rounded nut with the stalk entering at the upper
right and no leaf lobing on the nut itself. Restored at round 28's **own**
coordinates: it measured the object correctly and only named it wrong.

**Two failures of judgment here, both mine, and both worth naming:**

1. **I checked it twice and got it wrong the second time.** At moderate zoom I
   read it as an acorn and was ready to reject that part of the round. At
   higher zoom the "lobed all round" reading looked convincing and I deferred
   to the round's measurement over my own eyes — the exact inversion of §0,
   which says believe the picture and publish the disagreement.
2. **My supporting argument was void.** I reported that removal was harmless
   because `leafAt`'s ladder already puts 58.6 % ink at that spot before *and*
   after. Ink from a **misplaced leaf** at the right coordinates is not
   evidence that the right object is drawn there. **Coverage is not
   identification.** As the owner put it: just because misplaced leaves cover
   the same location isn't confirmation that the object is correct.

**Fitted, not asserted:** 5.6 × 4.6 units centred (58.8, 57.7) on unc2005 and
4.8 × 4.0 centred (59.2, 57.2) on proofbright — wider than tall, so the acorn
lies on its side with the cap toward the stalk, not upright as it was first
drawn. Rotation and scale were fitted to that box on the emitted path's own
control hull.

**What the box could not decide, stated rather than implied:** every rotation
from 70° to 90° can be scaled to land inside the two references' own
disagreement. The unconstrained best fit is 90° — cap dead horizontal — and it
is **rejected**: it is 0.03 units better and the photographs plainly show the
stalk entering *above* the horizontal. 75° is chosen on the picture; the number
only stops it being wrong by more than the references disagree.

The `ZM` separator fault is **not** reintroduced — the explicit space is in the
path and D9 stays **0 of 180**. Partition 6/60, `dime.reverse` alone. Suite 461.

**Both retractions are kept beside their corrections rather than deleted**, so
the sequence stays legible: a three-photograph re-measurement located an object
correctly and then misnamed it, and a judge with the right first instinct
talked himself out of it.

**Open, and larger than this fix — owner-raised:** *"The current branches/leaves
on either side of the torch need significant work still."* Confirmed by eye at
40×: on the coin the acorn sits in **open field** with clear separation between
leaves; ours is a merged dark mass because the leaves are oversized and
overlapping and fill field the coin leaves empty. The acorn is now correct and
still barely readable for that reason. This needs its own round — the leaf
ladder (`leafAt`, `SPREAD`, the 7-leaf count flagged LOW CONFIDENCE, and the
two unmeasured olive fruits) is the subject, not the acorn.

## v1.84.0 — 2026-08-23

**The dime's torch was a rectangle, and the acorn was a leaf.**

Fifth face of the sweep. Three defects, all marks never measured on this face,
plus the resolution of a malformed-path fault that had been open since the cent
reverse round.

**The shaft was `<rect width="9.4" height="31.1">`** — 9.4 units at all 31
rows, on the largest mark on the face, drawing at every size since v1.78.0. The
header table carried **one** width for it. Measured on two independent files:
w61/w42 = 0.782 and 0.681, w69/w42 = 0.590 and 0.581, **against our 1.000**. At
y 70 the coin is 5.02 and 5.87 units wide; we drew **9.4**. Now a linear taper
9.4 @ y 38.5 → 5.7 @ y 69.6.

**The foot was the rectangle's fault.** A 9.4 × 3.0 collar existed only to
bridge a 9.4 shaft to the table's own 5.0 "stalk" — it is in no measurement and
on no reference (60–87 % too wide there), and below it a 5.0 waist under an
8.7 flat base made a barbell. The table's "stalk" was never an element; it is
this same shaft near its bottom. Before, the torch reads as a thermometer with
a plunger at every size.

**The acorn is not where we drew it.** Round 27 put a nut-in-a-cup at exactly
(68, 45); on three references there is a **leaf** at that point. The object it
traced is a three-lobed oak leaflet nine units inboard and twelve down. The
judge checked this by eye at two magnifications and initially read the object
as an acorn — at higher zoom it is lobed all round, with no nut-and-cap, and
the round's identification stands. Removed. Ink at the real leaflet position is
**58.6 % before and after** — the leaf ladder already covers it, so no gap was
created — while ink at the wrong position fell 79.9 % → 53.3 %, leaving the leaf
the coin does have.

**The stems stopped at y 66** — that is the legend, not the end of the branch.
Four readings on two references put the tips at offset 14.0, y 75.6 (sd 0.95 /
0.8); we drew bare field from y 68 to 79 on both sides.

**The `ZM` token was the acorn**, and it is now explained rather than merely
gone: `… 0 2.45 Z` + `M -2.1 -1.15 …` concatenated with no separator. Legal
SVG that rendered correctly — cosmetic in the raster, but a real D9 fault, ×3
because `struck()` emits `solid` three times. **D9 18 of 180 renders faulty →
0 of 180.**

**T1 32/32.** Dime reverse margin 0.130 / 0.127 / 0.128 / 0.129 → **0.142 /
0.140 / 0.143 / 0.142**; every other face byte-identical. Partition re-derived
by the judge: 6/60, `dime.reverse` alone. D6 (advisory) 0.2210 → 0.1018. Suite
461.

**Rejected because it scored the same:** a full-length trapezoid, T1 margins
0.142/0.141/0.143/0.142 — indistinguishable from what shipped. Rejected on the
*measurement*: it gives 7.07 at y 61 and 4.8 at y 74 where the references say
6.43/7.13 and 5.02/5.87. Refusing a tie on evidence rather than taking it on
score is the right instinct.

**Refused with the number:** the stem's x offset. Ours is 15.1 at y 58–62 where
both references put it at 16.3 and 17.25 — and the file's own claim, 14.4, is
1.9–2.9 out. Moving it moves `leafAt`'s anchor and the whole seven-leaf ladder,
which this round could not bound. The consequence is written into the file
rather than hidden: the added tail runs near straight where the coin's leans.

**Reported, not added:** two olive fruits on short stalks at roughly (30, 42)
and (27, 57), present on both independent references and the 1960 proof, absent
from our olive branch. Both abut a leaf on every row, so no publishable
tolerance was reachable.

**Its own instruments failed and are kept as the record:** a fixed-window edge
reader reported the shaft *widening* 20.5 % and produced x = 88 617 170 517.85
on one row; a ±0.8-gate tracker walked onto a leaf at y 46 and never returned.
Both sit beside the instrument that worked. Two `_jd1discs.json` entries that
did not exist are now published (p95 1.12 % and 1.10 % of R).

## v1.83.0 — 2026-08-23

**The dime's date was 18 % short, and three of its four legends had never been
measured.**

Fourth face of the sweep, and the largest evidence pool in the project — nine
references, **all nine proved independent** (9/9 distinct sha256, max
off-diagonal edge-energy NCC 0.419; the largest raw-grey correlation is
*negative*, −0.551, which is polarity, not duplication).

`INSCRIPTION.dime.main` (LIBERTY) carries four measured paragraphs. The three
`rest` lines carried one relative sentence and no number — the cent obverse's
pattern exactly, on a different coin.

| date cap ÷ motto cap | |
|---|---|
| the coin, n = 9 | **1.385** (IQR 1.312–1.542) |
| ours | **1.130** |

The **ratio** is the statistic, and that choice is what makes it trustworthy: a
photographed raised letter carries a bevel skirt our flat fill does not, and
the cent round refused a size change on exactly that ground. A ratio of two
legends *on the same photograph* divides the skirt out — and since the skirt is
additive, **1.385 is a lower bound**. Date size **5.0 → 6.1**.

The accompanying `x` and `y` moves are **not** placement measurements and are
labelled as such: they are `flatText`'s upward growth plus §7 clearance. At 6.1
on the old placement the "1" **touched** the truncation — gap 0.085 viewBox
units. Now 0.838, with 2.027 to the field circle.

**Dead and wrong code removed:** `ear`, `eye` and `neck` in `OBVERSE.dime` were
unreachable — `bust()` reads `o.eyeMark || eye(o.eye)` and both marks are
present, and `neck` sits inside a branch `cut` switches off. Two were also
*wrong*: `ear: [1.07, −12.2, 3.0]` contradicted `EAR_ROOSEVELT`'s own comment.
Emitted string unchanged.

**The silhouette was refused, and this is the most valuable refusal so far.**
`HEAD.Roosevelt` had one photograph behind it; the round ICP'd our extracted
bust onto all nine. Signed residuals: crown −0.02, back-upper −0.02, back-lower
−0.03, truncation +0.07, jaw −0.00, face −0.05 local units — **the sign
disagrees in every region**, null test 0.038. There is nothing to correct. It
is the design.

**T1 32/32**, and the **numerator** moved at every size: dime obverse own
column 0.516 → **0.535** at 38 px (margin 0.263 → 0.284), and up at 48/54/84
too. Partition re-derived by the judge: 6/60, `dime.obverse` alone. Suite 461.

**Open, and stated as unmeasured rather than guessed:** the **ear** is visibly
too small and 2–4 units too low on all nine references — the strongest visual
finding in the round — but three instruments refused themselves (one misses our
own drawn hollow by 1.71; per-file reads span 5.7 units in x and 9.0 in y), so
no number was published and nothing was changed. The **hairline** is likewise
UNMEASURED: its texture ladder returns −5.50 **on our own art** where the
answer is 0.

**Structural finding for every face — the `min` presence-floors are dead.**
Since v1.78.0 the drawing is always authored at `DRAW_SIZE = 380`, so `boxW` is
the 380 px box at every displayed size (nickel: **332.2 at 38, 48, 54, 84 and
380 alike**, verified by the judge). `fine`'s 130 px threshold is therefore
permanently true, and every `min` floor is evaluated at 332.2 — including the
`min: 62` added by the nickel-obverse round, which is a **no-op**. This is
leftover tier-era machinery and it has already misled one round through a
comment asserting the opposite. Removal belongs in the pending
purely-subtractive round alongside `iconS`/`iconCy`/`iconCx`, `iconWig`,
`iconBust` and `tierOf`.

## v1.82.0 — 2026-08-23

**The nickel's roofline stepped up at the ends where the coin's runs flat.**

Third face of the ten-face sweep, no hints. The lead given was the cent
reverse's lesson — a passing check on an outer bound says nothing about the
interior — and Monticello duly had three defects nobody had measured on this
face.

| measured on all three references | the coin | drawn | now |
|---|---|---|---|
| end-pavilion roofline | 42.00 / 40.95 / 41.70 | **45.40** | 41.9 |
| wing roofline | 40.90 / 39.95 / 40.40 | 40.80 ✓ | 40.80 |
| **the step between them** | 1.10 / 1.00 / 1.30 | **4.60** | 1.10 |
| terrace width | 80.90 / 82.30 / 81.30 | **77.00** | 81.4 |

The step is a *difference of two ladders on the same photograph*, so
per-reference registration error cancels — which is why it is the strongest
number in the round. 3.85 units is 3.9 % of the coin's diameter, on the outer
fifth of the building, and it turned a nearly-flat roofline into a wedding
cake.

Third defect: **all three portico openings were built on x = 50.25** — door,
lining, pediment and both side bays — on a building whose every other mark is
on 50. The door pediment was 6.70 wide against a **4.90 clear opening** and was
drawn *after* `columns()`, covering 0.65 of one column and 1.15 of another.
That is the cent reverse's oversized seated figure again, on a different coin.

**A comment on this face was actively false and load-bearing:** it claimed the
`fine` detail level "is NEVER true in the app". Since v1.78.0 everything is
authored at `DRAW_SIZE = 380`, so the nickel's `boxW` is 332.2 and **`fine` is
true at every displayed size** — balustrade, fanlight, dome ribs, sills and
column flutes all draw at 38 px today. Corrected in place rather than deleted.

**Refused, retracted, and killed:** the header's claim that the wings' roofline
"reads at y ≈ 35.5–36.2" is **retracted** — three references say 40.90 / 39.95
/ 40.40, and what reads at 37.3–38.3 is the roof deck behind the gable, a
different plane. The round's own eye-read that the inner columns were 1.7 units
out was **killed by its own instrument**: the device on that reference sits
0.65–0.70 units right of its own rim fit, and divided out the columns land
within 0.45. And growing the end pilasters was **refused for looking better** —
they stop reading as pilasters and become a second pair of tall windows.

**T1 32/32** both faces, four sizes, controls 4/4. Nickel reverse own
agreement 0.610 → **0.618**, margin 0.299 → 0.301. Partition re-derived by the
judge: 6/60, `nickel.reverse` alone. Suite 461 green.

**THIS ROUND CORRECTED THE SWEEP'S OWN BRIEF, WITH NUMBERS.** The brief said
the area `discOf()` fails on cameo proofs. It does not — the test is the
relationship between device, field and SURROUND, not the strike. Measured
against rim fits: the cameo proof **−1.77 %** (its white surround keeps the
near-black mirror field counted as device), while a *bright* coin flattened
onto white failed **−31.75 %** (R 324.1 v 474.9). The rule "fit the rim" is
unchanged; the reason given for it was wrong, and the brief has been fixed for
the remaining seven faces. The frozen `_jn1discs.json` entries are rim fits and
sound, within 0.4 % of R.

## v1.81.0 — 2026-08-23

**The colonnade stood on nothing, and every storey above the base was too wide.**

Second face of the ten-face sweep, no hints given. Four findings, all the same
species as the cent obverse and the nickel's eye: a mark never measured on
*this* face, only inferred from the one dimension somebody had already checked.

**The stylobate did not exist.** The memorial's *outer* bounds had been checked
and pass — top 30.5 v 31.0, bottom 65.0 v 64.6, terrace line 59.6 v 59.6
exact — so every published check of this motif's height passed while its
**interior division was 3.8 units out**. The colonnade block simply ran down
through the platform the columns stand on. Column feet read 54.35 / 54.2 / 54.5
across three references; as a fraction of each reference's own building height,
which cancels disc error, **0.695 / 0.686 / 0.731 against ours at 0.774**.

**Every storey above the base was 12–22 % too wide:**

| | ours | the coin |
|---|---|---|
| attic | 21.5–78.5 | **26.3–73.7** |
| entablature | 16.5–83.5 | **20.9–79.1** |
| colonnade block | 17.5–82.3 | **21.4–78.1** |
| outer column centres | 22.37 / 77.63 | **25.05 / 74.75** |

v1.75.0's "memorial width" check measured the **terrace** — the widest slab,
which was right and is untouched. Nothing had ever measured the storeys above
it.

Also: the base was two fat slabs where the coin has one tall slab with a
0.8-unit lip; and the seated figure was sized to his bay rather than to
himself (5.6 units wide where the coin has 2.1), so his base painted over both
centre shafts and the middle of the colonnade filled in as one pale block.

**Refused, with the number:** the stylobate's three steps. The coin has them,
but at 38 px the band is 1.5 device pixels. T1 for this face, everything else
held: three steps 0.458–0.464, two steps 0.480–0.489, one lit top + one shade
0.511–0.516. Monotone, all passing. Not drawn.

**T1 32/32**, control 4/4 both faces. Penny reverse own column
0.495 → **0.562** at 38 px, margin 0.242 → **0.275**. Partition re-derived by
the judge against a pristine base: 6/60 cells, `penny.reverse` alone. Suite
green, 461 tests.

**Judge's reservations, recorded rather than smoothed over.** Against the
photographs our stepped base still reads heavier than the coin's — the
references show a shallow platform where we stack tall bands — and our attic
block is proportionally taller than the shallow band the coin has. Both are
*less* wrong than before this round. Neither is measured, so neither was
changed; they are the first thing a follow-up round should put a number on.

**Instrument faults found:** `_jp1discs.json` has **no entry** for
`penny-rev-1991d.png` (acquired after cent round 0, so the newest cent-reverse
reference has never been through the disc instrument), and its
`penny-rev-artwork.jpg` entry is **unusable and unflagged** — p95 13.93 % of R
with 244 of 720 rays at the window end. Frozen file not edited. Separately
`_jq9well.mjs` reports a bad path token on the **dime** reverse at every size —
pre-existing, flagged for that face's round.

## v1.80.0 — 2026-08-23

**LIBERTY had never been measured, and Lincoln's bow tie was twice the size of
the coin's, on the wrong centre.**

First face of a full ten-face review sweep, each face reviewed with no hints —
only the instruction to find anything off or never evaluated.

The cent obverse has **three** inscription lines. Its scorecard has `D5-band`,
`D5-cap` and `D5-span` rows for IN GOD WE TRUST and **no row at all** for
LIBERTY or the date: one line of three had ever been scored. `LIBERTY` was
authored whole in `eb4c947` (v1.55.0) and not one character changed in the 24
rounds since.

Measured by integrating |∇I| along each row of a window holding the word and
nothing else — a struck letter and the field beside it are the same
reflectance, so segmentation is impossible, but gradient does not care:

| ink-band midpoint | y |
|---|---|
| six references, each rim-registered | 53.60, 54.00, 54.55, 54.65, 54.70, 55.15 |
| **mean** | **54.44** (sd 0.51) |
| `penny-obv.jpg` (1909-S), dissents +2.5, published and excluded | 57.00 |
| **we drew** | **51.05** |

All seven put it lower than we drew it — 3.4 % of the coin's diameter too
high. `y` 53 → **56.4**.

**The bow tie**, same story: `bowTie()` and its one call site authored whole in
the same commit, never touched, no comment anywhere claiming a measurement.
Four ladder reads at one viewBox unit per line:

| | left | right | width | centre |
|---|---|---|---|---|
| mean of four references | 53.03 | 59.83 | **6.80** | 56.43 |
| **we drew** | **47.64** | 60.12 | **12.48** | **53.88** |

**The right edge was already right to 0.3 units on three of the four** — which
is what proves this a real 5.4-unit error on the *left* edge rather than a
registration slip, because a slip moves both edges. We drew a symmetric
butterfly 12.5 % of the coin's diameter wide with a round knot, centred on the
head's origin *behind the eye*; at 84 px it read as a dark bar laid across the
chest. The photographs show a small, compact, angular tie at the throat with
the lapels sweeping out of it. Half-width `8` → `4.36`, knot and apex scaled
by the same 0.545, and the call site moves the centre 2.55 units forward onto
the throat.

**Refused, with the numbers:** LIBERTY's `size` (ours reads 15 % small, but the
gap is the same order as the bevel systematic and could not be separated from
it — at threshold 0.55 our band collapses to 0.80 units where every
photograph's stays 3.6–4.6 wide, so it is an artefact, not a measurement);
LIBERTY's `x`; the date's `y` (−0.9, inside its own noise, and the window
necessarily holds the mintmark, the coat seam and the rim); and the tie's
height (four reads 4.4/5.5/6.0/5.5, mean 5.35, against the 5.30 already drawn
— nothing to correct).

**T1 transfer 32/32, unchanged**, control 4/4 both faces. The cent obverse's
own score rose 0.430 → 0.526 at 38 px and its margin 0.293 → 0.389, and
decomposition shows **LIBERTY carries all of the gain** while the tie is
score-neutral. The tie was taken on the measurement, not on the score.

**Instrument fault found, and it generalises:** the area `discOf()` fails *in
kind* on a cameo proof. The mirror field photographs as near-black, is counted
as background, and the fit encloses only the frosted device — on
`penny-obv-2.jpg`, R = **395.7** against a rim fit's **450.0 (−12.1 %)** with
the centre 7.0 units out in x, so every feature on that file lands seven units
from where it is. That is a different thing from the −0.8 %…−5.1 % bias already
on record. T1 and the frozen `_jp1discs.json` are unaffected; the private
copies of the area fit carried by ladder instruments are not.

## v1.79.0 — 2026-08-23

**Jefferson had no eye. He had the shared default, never measured on his face,
sitting on his cheek.**

The owner looked at the render and said the eye looked odd. It was worse than
odd: `OBVERSE.nickel` carried an `earMark` but **no `eyeMark` and no `eye`**,
where the cent has `EYE_LINCOLN` and the dime has `EYE_ROOSEVELT`. It fell
through to `bust()`'s shared default and had **never been measured on this
face at all**.

| | eye centre | length |
|---|---|---|
| the proof (1968-S) | (12.75, −7.25) | 3.5 |
| the 2004-P | (11.80, −6.80) | 3.5 |
| tone-map centroids, four references | x 10.80–14.33, y −6.86…−8.37 | |
| **we drew** | **(6.00, −2.60)** | 3.0, a circle |

**6.5 units too far back and 4.6 too low** — on the open cheek, level with the
middle of the nose, with the drawn hairline nearer to it than the brow. Now
`EYE_JEFFERSON`: a measured brow ridge and a deep-set almond rotated −22° so
the nose-side corner is high, in the same idiom and the same mark count as the
other two faces.

**Why nobody had seen it:** until v1.78.0 removed the tier system, the eye did
not draw below 76 px. Fixing the architecture is what made the error visible.

Found by the first: `RELIEF.Jefferson.fine`'s lit nose ridge **started inside
the eye socket**, at (14.27, −8.08). Re-started at the proof's own crest, which
also cleared a **pre-existing** §7 foul measured *before* any edit — worst
face-mark clearance **−0.284 → +0.466**, every face pair now clear.

### The round's refusal is the shape

The owner asked for shape first. It was measured — a ladder off the cameo
proof, where a frosted bust on a mirror field is separable by one threshold —
and the head reads **~1.2 units too big toward the back, ~0.6 too high at the
crown**, about 1 % of the diameter, with the sign surviving a threshold sweep.

**It was refused, because the references disagree by more than the finding.**
Registered against the 2004-P our device reads ~4 % *larger* than against the
proof. A 1.2-unit correction taken off one photograph, inside a 4 %
disagreement between photographs, is a number whose only argument is its own
score. The hairline is refused for the same reason — the two references
disagree by ~4 units and in *sign*, and the tool that tries to locate it
**refuses itself** on both.

### T1 could not see any of this

**32/32 before and after, identical to three decimal places.** The eye is too
small a share of blurred gradient energy for the transfer gate to register —
which is exactly §0.1's point that D12, looking at it, is the gate that finds
these. The owner found it by eye; no number in the project would have.

D9 clean, D1 bit-identical (the head was untouched), D6 fell 20.34 % → 19.88 %,
D8 deep-fraction 0.0000 % both sides. Partition: 10 of 100 cells, **nickel
obverse only**.

### An instrument fault of the judge's own, and it had already been published

`judge/_nk3over.mjs` — the overlay the judge used to form a view of this face
and **showed the owner** — normalised our render by half its width, 50 viewBox
units, while `outlineOf` draws the blank at **r = 47**. Our outline was drawn
**6.0 % small** against a reference cropped to its own disc, so every placement
it has ever shown was flattered. Corrected here.

Also reported, not fixed: `discOf()`'s `R = √(area/π)` is off a rim fit by
−0.8 % to −5.1 % depending on the photograph, and `nickel-obv-5.JPG` cannot be
disc-fitted at all — the coin fills the frame and every ray hits its own search
bound.

## v1.78.0 — 2026-08-22

**The tier system is gone. One drawing per face, scaled — and transfer goes
24/32 to 32/32.**

The owner asked what the small sizes would look like if they were simply the
large drawing scaled down instead of tiers dropping detail. It was measurable,
so it was measured rather than argued.

`coinSVG` used to simplify below 76 px and again below 44 px, on the theory
that sub-pixel detail is noise. **The theory was wrong and expensive.** Both
arms run to the same device pixels, through T1's own descriptor and fitted
registration:

| | T1 correct |
|---|---|
| tiers, as drawn before | **24 / 32** |
| one full-detail drawing, scaled | **32 / 32** |

Scaled wins **31 of 32 cells** (the exception is the nickel reverse at 84 px,
by 0.005). **Every one of the eight reverse confusions disappears** — the penny
reverse goes −0.063 → **+0.244** at 38 px, the quarter reverse −0.078 → +0.144
at 48 px. It also closes the two thinnest obverse margins, which the nickel
round had reported as unfixable without touching shared code: nickel at 48 px
**0.014 → 0.187**.

The detail the tiers discarded — reeding, legends, interior modelling — is most
of what makes a coin identifiable at small size.

### A third arm decided the implementation

Rasterising big and resampling with Lanczos is not what a browser does; a
browser renders the **vector** natively at 38 px. A third arm tested that
directly: full detail rendered natively small scores **32/32 too**, tracking
the resample within 0.005. So no raster pipeline is needed and the change is
purely *stop simplifying, set width and height*.

`coinSVG` now authors every face once at `DRAW_SIZE` and rewrites only the
outer element's `width`/`height`. The viewBox and every path are untouched,
which is what makes it one drawing rather than a variant. The owner's reason
for taking it is worth recording beside the numbers: **it leaves one target per
face**, so every future round measures one drawing.

### The test that had to be retuned, and the proof it was not weakened

`tests/coins.spec.js` pinned "wave 1's own size gets the FULL drawing, not the
silhouette" by comparing **byte length** at 84 px against 50 px and demanding
1.3×. That was a proxy for "84 is not in a stripped tier". With one drawing the
proxy compares two identical strings and can never pass — and the test's own
comment anticipated this: *"retune this test"*.

Retuned to assert the intent directly, for **all ten faces**: the naming draw
must be byte-identical to the 380 px render apart from `width`/`height`, and
must draw more than twelve paths (the old icon tier emitted four).

**Mutation-tested.** Reintroducing the tier system makes the retuned test go
**red**. It is strictly stronger than the length ratio it replaces: any future
size-dependent simplification, anywhere in the set, fails it.

### Cost, measured

A six-coin pile at 38 px is 89 KB of SVG markup, ~18 KB gzipped — these are
inline strings in a local-first app with no network fetch per coin, and D9
reports 120 renders clean with its response test going red as expected. D8 is
unchanged.

Now dead and left in place rather than removed in the same commit:
`iconS`/`iconCy`/`iconCx`, `iconWig`, `iconBust`, and `tierOf` itself, which is
still called by nothing on the drawing path.

## v1.77.0 — 2026-08-22

**Our nickel obverse was an outline with nothing inside it — and the gate that
was supposed to notice never registered scale.**

The specialist was given the photographs, the coin's full history and the
objective, and **no hint about what was wrong**. It printed T1's own descriptor
as a radial histogram and the answer was unambiguous:

| energy share, r ≤ 0.86 | 0–0.14 | 0.14–0.29 | 0.29–0.43 | 0.57–0.72 |
|---|---|---|---|---|
| ours at 38 px | 0.000 | 0.000 | 0.002 | **0.446** |
| the three photographs | 0.029–0.037 | 0.083–0.094 | 0.126–0.145 | 0.220–0.226 |

At pile size it held **0.2 % of its energy inside r ≤ 0.43 where every
photograph holds 25–27 %**, and double their share on the silhouette contour.
It was a line drawing of a coin, not a coin. That is also why it carried the
thinnest T1 margin in the set.

Two further defects, both found by looking at the sizes the app draws:

- **IN GOD WE TRUST was drawn at no size the app renders.** `INS_REST_MIN` is
  110 box px and the naming draw gives the nickel 73.4, so a child saw LIBERTY
  and a bare left rim. All three photographs show the legend, and this file's
  own comment records that the two legends are the *same height* on the coin.
- **`OBVERSE.nickel` was the last face still repeating its full-tier trio at
  icon** — the same over-fill that failed the cent and the quarter in v1.74.0.

Three hunks: the icon trio **derived** (`k = 42.5/44.07`, the rule the cent and
quarter already follow), a per-coin `iconWig` drawing the wig as a second mass
at icon, and `min: 62` on the motto with per-line `min` support in the obverse
branch of `inscriptionOf` — the reverse branch already had it.

**T1 at 38 px: margin 0.018 → 0.122**, the thinnest in the set to comfortable.
84 px 0.129. Byte-identity partition: 5 of 110 renders, **`nickel.obverse`
only** — both shared-code changes are gated (`icon && o.iconWig`, and
`l.min ?? INS_REST_MIN`) and provably reach nothing else.

### The primary gate never registered scale

`featOfOurs` hard-coded `R = 450 × 0.94 = 423` while the reference path calls
`discOf(file)`, which **fits** the disc — and `bestReg` searches rotation and
translation only, never scale. Measured on our own renders, `discOf` returns
423.9–438.1: our art was presented **0.2 %–3.6 % larger than the photographs,
by a different amount per coin** (nickel +3.2, penny +3.6, quarter +0.2, dime
+0.4).

Every "ours" number was depressed and the between-coin comparison was not
apples to apples. The **control was unaffected** — photo-vs-photo is fitted on
both sides — which is exactly why the verdicts stood while the numbers did not:
re-run with the fix on the pre-merge tree, T1 is still 24/32.

That is the **fourth** fault found in this one instrument, and the third found
by someone other than its author. Also fixed: its scratch cleanup ran only in
the direct-run block, so anything that *imported* it left renders in the shared
reference tree — the fault its own header documents about `_x6mat.mjs`.

### Refused because it only scored better

An `iconS` sweep found **0.84 giving margin 0.220 — four times what was
taken** — and it was refused. Its only argument is its own score: it shrinks the
icon head 11.6 % below the measured full-tier head and contradicts this file's
own measurement that the nickel's head is ~58 % of the disc. Same refusal the
quarter recorded at its 0.90.

### What it could not determine

**Mid tier (48 and 54 px) is not improved and it could not find a way.** Both
candidates are recorded with their numbers — the measured lit ridges *confused
the nickel with the dime* at both sizes. Its reading is that mid's real deficits
are two shared things it was not free to touch: `INS_MAIN_MIN = 62`, so **no
coin carries any lettering at mid** while the photographs plainly do at 48 px,
and the min-pixel stroke floor, which draws the silhouette contour at 2.1
viewBox units against its design 1.15. Those are the two thinnest margins left
in the set (0.014 and 0.024).

Also reported: at 84 px our outer band is now over-weighted (0.431 against the
photographs' 0.288–0.325) because our letters are hard vector edges where
photographic relief blurs; T1 preferred it strongly anyway, but it is a real
overshoot and it declined to invent a number to correct it.

## v1.76.0 — 2026-08-22

**The quarter's legends were the fault, not the bust — and the judge's
hypothesis was wrong for the second time in a row.**

The judge proposed that the bust filled the disc and crowded the text out.
Measured against two references, as a fraction of the **outer** diameter:

| | height / D | width / D |
|---|---|---|
| reference mean | 0.7323 | 0.5696 |
| **ours** | **0.7553** | **0.5606** |

3.1 % taller and **1.6 % narrower**. That is not a bust filling the disc, and
`OBVERSE.quarter` was left **byte-untouched** — so v1.74.0's icon-tier
derivation still holds exactly, because the placement it derives from has not
moved.

All three legends were wrong, and one badly:

| | reference | before | after |
|---|---|---|---|
| LIBERTY cap | 6.90–7.20 | **4.07** | 6.90 |
| LIBERTY span | 92.4° | **43.7°** | 92.4° |
| date band centre (r/R) | 0.828 | **0.711** | 0.834 |
| motto angle | 142.8° | **157.9°** | 142.6° |

LIBERTY was drawn at little over half the coin's cap height and at half its
angular span. **The date was seven units inboard, drawn on the truncation** —
and that is the fifth instance of a fault this file already documents for the
four reverses: a bottom legend's baseline is its band's *outer* edge, and the
quarter obverse never received the `rOff` correction the reverses got.

It **refused** to enlarge the motto, which would have scored better: our
rounded sans is 24 % wider per unit of cap than the coin's condensed Gothic,
the clear run on the lower left is 30–32 units, and the largest cap clearing
both the field circle and the jaw is 3.08 against the 3.00 already drawn.
Growing it would push ink outside the field to buy a number.

### A third locus gap in the judge's own primary gate

`_jt1transfer.mjs` asserted the app draws 38, 48 and 84. `src/screens/money.js:51`
declares `const coinRow = (ids, size = 54)` and line 122 calls it bare — **54 is
a size the app draws and the gate never tested it.**

That is the third such gap in this one instrument: it tested obverses only
until v1.74.0, it inherited the role from a D11 scored at 26 px which the app
never draws at all, and now this. All four sizes are tested; T1 is restated
over them.

**T1 at all four sizes, both faces: 24/32.** Obverse is **16/16** — every
obverse now sorts to its own denomination at every size the app draws. The
reverses are 8/16 and are where the whole remaining gap lives: the penny
reverse reads as a nickel at 38, 48 and 54 px, the dime reverse as a penny, and
the quarter reverse as a dime at 84.

### Honest scope

The date and the motto **are never seen in the app**: both need `boxW ≥ 110`
and the largest render is 84. Correcting them is right for larger renders and
reference sheets, but a child currently sees only LIBERTY on this face.

Also reported: `quarter-obv.jpg` and `quarter-obv-2.jpg` may not be
independent — same 1994-P, same die scratches, same mintmark, at 500 px and
750 px. They should go through `_jrefintake.mjs`. And the coin breaks the motto
`IN GOD WE / TRUST` where we break it `IN GOD / WE TRUST`; at our wider face a
nine-glyph first line is 32.1 units and does not fit the 30–32-unit run, so it
is left for a round that can change the face or the letterspacing.

## v1.75.0 — 2026-08-22

**"ONE CENT" stops running into the Lincoln Memorial, and all three of the
judge's guesses about why were wrong.**

The owner spotted it by looking at the render: the penny reverse's legend
overlapped the monument. The judge compared against two reference photographs
and proposed three causes. **The measurement overturned every one.**

| | reference | ours before | verdict on the judge's guess |
|---|---|---|---|
| ONE CENT cap / diameter | 0.1106 | 0.1144 | "letters twice the height" — **false**, +3.4 % |
| arc radius / diameter | 0.4394 | 0.4394 | "arc too small" — **false**, exact |
| memorial width / diameter | 0.791 | 0.778 | "memorial too wide" — **false and backwards**, ours is *narrower* |
| **ONE CENT ink span** | **113.0°** | **149.4°** | the actual defect |

The legend was wrong and the device was right. Our word spanned 149.4° where
the coin spans 113°, carrying the O and the T up the flanks until three
cap-box corners sat **0.47 units inside the terrace**. Now +2.39 units clear.

**The root cause is a checkable arithmetic error in the comment that justified
it.** The old constant was defended with *"7 advances over 136° at r 41.3 is
10.48 units each against a 10.4 cap."* At r = 41.3 that angle is **14.00**
units. 10.48 is the same angle taken at **r = 30.91** — the band's *inner*
edge — while `arcText` sets the baseline at the *outer* one. One wrong radius
made a legend 34 % too loose look justified.

Fix: one constant, `badv: 1.0099 → 0.73`. Byte-identity partition clean — only
`penny.reverse`, and only at the four sizes where the legend is drawn; the
memorial, field and rim are byte-identical. T1 moved in exactly one cell and
improved: penny reverse at 84 px, margin 0.032 → **0.071**.

### JUDGE RULING: the frozen span target is wrong, not the drawing

This change knowingly fails D5-span, because `_jp4band.json` records
`ONE CENT.span_deg = 136`. That target does not reproduce — the same
instrument, on the same file, at the same frozen disc, reads **113.0°**, while
reproducing that entry's neighbours to two decimals. Three references bracket
**113 / 119 / 124°**; none is near 136.

**And the record contradicts itself.** With its own `cap 10.4` at its own
`rOuter 41.3`, any plausible letter advance (0.85–1.15 × cap) gives an ink span
of 98–133°, with the measured 113° landing at almost exactly 1.0 × cap. The
asserted 136° would require **1.18 × cap** spacing.

`span_deg` is corrected to **113**. The drawing passes the corrected gate and
failed only the stale one.

### Reported, not fixed

The penny reverse's confusion with the nickel at 38 and 48 px is **structurally
out of reach of this round**: `min: 65` means no lettering is emitted at all
below 84 px, so at icon tier both coins are two grey building-blocks. That is a
separate, real defect and it is where the remaining reverse transfer gap lives.

## v1.74.0 — 2026-08-22

**The gates now serve the objective, and the first thing the new primary gate
found was that it could only see half the coins.**

### The objective, restated by the owner, and what it superseded

> "Creating artistic renderings of US currency that will teach a child to
> recognize real US currency." … "Distinguishing our renderings from each other
> is not the point, learning to identify real currency is."

`docs/COIN-JUDGE.md` **§0** rebuilds the gate set around that. **T1 transfer**
is primary — at 38/48/84 px, is each face nearer the *correct* denomination's
photographs than any other's? Five gates remain (well-formedness, containment,
counts, lettering presence, looking at it with a pinned control **at the sizes
the app draws**). Seven dimensions are demoted to **advisory: reported, never
gating**. **D11 is retired** — it measured our art against our own other art,
which the owner ruled is not the point.

### The icon tier was throwing away the information

At 38 px — `coinRow(opt.coins, 38)`, the size a child sees counting a **pile** —
our penny and quarter both read as **nickels**.

The cause was a house-invented rule contradicting a measurement in the same
file. At `icon`, `bust()` dropped the neck and coat and **enlarged the head to
fill the disc**: the cent at `iconS 1.253` against its full-tier `0.78`, sixty
percent bigger. Line 2644 of that file records the real cent's head as **~49 %
of the disc, the smallest in the set, high in the field over a big coat**. The
icon rule made it the *biggest* head in the set, low in the disc — which is
what a nickel looks like. All four obverses became near-identical blobs.

The fix is four lines and derived rather than fitted: the only thing that
genuinely differs at icon is the field circle, so the measured full-tier
placement carries over scaled by `k = 42.5/44.07`. Penny 0.084 → **0.317**,
quarter 0.115 → **0.332**. D10 improved as a consequence — the quarter went
11.55× to **1.83×, passing** — because icon and mid finally agree. A 108-cell
sweep found better-scoring cells at `iconS 0.90` and they were **refused**: no
derivation, only a better number.

### And 38 px was never too small

The owner offered to raise the app's minimum display size. Measured instead
(`judge/_jt2floor.mjs`), two sweeps over one size ladder:

| size | real photographs | our art |
|---|---|---|
| 16 px | **4/4** | 1/4 |
| 38 px | **4/4** | 3/4 |
| 44 px | **4/4** | **4/4** |

**Real coins remain separable down to 16 px.** The physical floor is far below
anything the app draws, so no size change was warranted — the art was
discarding the information, and raising the size would have hidden that.

### The primary gate could not see five of the ten faces

`_jt1transfer.mjs` rendered `side: 'obverse'` only, and its reference pool held
only `*-obv-*` files. It was promoted to primary in §0 **while structurally
incapable of seeing any reverse**. The dime/nickel reverse round found it: T1
was byte-identical across a 163-line redraw, which looks like a pass and is a
blind spot.

That is the same locus fault this project has now documented three times — D11
scored at a size the app never draws, `_jb14d1` never importing the art,
`_jb3seal` freezing our own geometry — and this one was committed by the judge,
in the instrument the judge had just promoted.

Fixed, and the result is worse and more useful: **obverse 12/12, reverse 7/12,
overall 19/24.** The penny reverse reads as a **nickel** at 38 and 48 px — two
neoclassical buildings — which is precisely the 1¢-vs-5¢ confusion the app
exists to teach against. The dime reverse reads as a penny; the quarter reverse
as a dime at 84 px.

### Two motifs the coins do not have

**The nickel's dome sprang below its own pediment apex** — base chord at y 38.0
against an apex at 34.5, so the gable was entirely swallowed and the silhouette
showed one shallow mound. Both references put the springing *above* the apex
and bracket the amount (−2.0 and −1.0); drawn was **+3.5, the wrong sign**. Now
−1.9. The drum the references clearly show was missing altogether. The icon
tier already had this right, so this closes a tier discontinuity.

**The dime's oak was not an oak.** The outline never came within 0.85 of its
half-width of the midrib — three beads on a stem. Re-authored from the real
leaf at 34.9 px/unit with sinuses cutting 45–55 % to the midrib, in the **same
±4.3 × ±2.1 box** so footprint and reach are untouched. And the acorn the
file's own header has always claimed is finally there.

Both rounds refused changes that measured better: the references read the
nickel's dome at 39..61 and it drew 41..59 anyway, because at the wider value
the drum's cornice hangs over bare field and reads worse at 73 px.

### Reported and not fixed

**Neither reverse carries any lettering at icon or mid** — 38 and 48 px, two of
the three sizes the app draws. Pre-existing and byte-identical to baseline, and
plausibly a large part of the reverse transfer gap: every photograph has a
peripheral ring of lettering energy and ours has none below 84 px.

### The library

**174 instruments retired** into `judge/retired/` — moved, never deleted, not a
byte edited. Verified: 606 stayers byte-identical in place, all 174
byte-identical at the new path, 25 sampled survivors run clean, 20 produce
byte-identical output before and after.

## v1.73.0 — 2026-08-22

**The dollar's portrait was the quarter's profile, shrunk.**

### Wrong in kind, and the old comment said so

The note's vignette contained `HEAD.Washington` — **the quarter's left-facing
profile** — inside `translate(51.5 27.63) scale(0.3333)`. Both obverse
photographs show a **near-frontal bust**. No transform of a profile is a
frontal head, so no amount of tuning that placement could ever have worked.

The tell was sitting in the comment above it, which reasoned about a bounding
box "because Washington faces left". Verified directly against the previous
revision rather than taken on report.

That is the fourth defect of this class — after the pyramid that was a triangle
with a hat, the roundels that were circles, and the nickel's phantom columns —
and it was the last one still visible by eye across the ten faces.

Replaced with a frontal Washington: five paths and nine ellipses, in **absolute
viewBox units with no group transform**, because the placement error lived
entirely in the `translate`/`scale` indirection. `struck()` is no longer called
here: a note is **printed, not struck**, and neither photograph shows a lit
edge.

**Scale decided the content, before anything was drawn.** One viewBox unit is
1.042 px at the naming draw, so the whole portrait is **20 × 29 device pixels**
there. Masses at icon, face and jabot at mid, features only at full.

**The tone was measured and the deviation published as a decision.** Both
photographs read the note as a *light* device on a *dark* ground (1.29–1.52×)
and ours was **inverted**. The order is now the note's, and the spacing is
deliberately stretched beyond the measurement — face 1.59 against a measured
1.33 — because a 1.16× step is invisible at 1 px per unit. That stretch is
recorded as a choice, not presented as the measurement.

### What it reported against itself

**D13 at icon regresses by 0.018**, stated as genuine rather than explained
away; four of six D13 rows improve, two regress, and every row fails both ways.
D6's fraction worsens 25.15 % → 28.28 % with the **numerator bit-identical** at
75.2 — the old drawing emitted the head three times and this one emits it once
— so no improvement and no regression is claimed.

It also declined the coat colour that fits the measurement better, taking the
one that looked right and saying plainly that the ~0.010 D13 gain was not the
reason. And it **discarded a suite run rather than report it**, because it had
swapped the art file for fifteen seconds mid-run to take before-numbers.

### The note's D1 has been reported by a tool that cannot see the note

`_jb14d1.mjs` holds `OURS` as a **frozen literal of a drawing superseded in
v1.63.0** and never imports `coins.js` at all. It prints `0.1496 FAIL` whatever
the art says — it fails a response test by construction. Re-derived properly,
D1 is **1.0000 at every tier**. Related: D9's response test perturbs
`HEAD.Washington`, which the note no longer uses, so it no longer covers this
face at all.

### What it could not determine

**The two obverse photographs disagree by 0.90 units on where the figure sits
inside the oval** (mask IoU 0.582), and this side has no printed-border
fiducial. Nothing in the round claims better than a unit, and overlays are
published on both. For the same reason it **refused to freeze a D2 target** for
the vignette: a target that disagrees with itself by 0.42 IoU cannot score art
to 0.05.

## v1.72.0 — 2026-08-22

**A refusal, and the instrument that made the refused change look attractive
turns out never to have measured its subject.**

### Variant B is refused, on measurement

Narrowing the quarter's lit rolls to 0.92 moves ridge duty **away** from the
coin, not toward it: 0.3619 → 0.293 at 190 px, and 0.3499 → **0.249** at 84 px,
against the coin's 0.350–0.443. Robust to reference selection — tested against
all three references, against dropping the state quarter, against dropping the
low-resolution file round 9 itself excluded, and against the 1932 alone.
**Further from the coin in all four.**

Round 9's claim that variant B put "ridge duty closer to the coin" does not
reproduce even by its own instrument, which reads 0.348 → 0.344 — *down*.

### RETRACTION: the ridge-duty figure was never about the lit rolls

**A lit roll is a flat-topped plateau.** A top wider than the prominence
window yields co-equal maxima, the "minimum" between them has the same grey,
prominence is exactly **0.0**, and the whole roll is discarded. Judge-verified
by running the round's own selection test: **of the six kept ridge candidates,
zero sit on any of the five `base` rolls** — the subject of the round. Three of
nine candidates are bare wig between cuts.

The signature is the one §4 names: set every roll to 1.9, then to 1.1 — a 1.7×
change on marks the transects demonstrably cross — and ridge duty is
**bit-identical** at 0.369 / 0.348 / 0.312, while *cut* duty on the same two
renders moves 0.316 → 0.322.

**So the published "ridge duty 0.348 against the coin's 0.350–0.443" is
computed over the two `fine` rolls and bare wig.** It came from round 9, and
the judge repeated it in two specialist briefs and in both BACKLOG and
CHANGELOG. It is retracted here by the party that propagated it.

The round also refused to compare an authored width against a half-prominence
duty without measuring the bridge between them: it is **not 1.0** but
0.90×–1.53×, median 1.43×, because half prominence is taken against whatever
shoulder the band has. Levels carry that slack; the **sign** cannot.

### A fourth D6 mode, and the cleanest statement yet of the first fault

D6 reads 20.50 % / 25.94 % with numerator 228.8 / 310.8 **identical to the
decimal** for variant B and for the shipped widths — across a 2× width change.
Δnumerator = Δdenominator = **0**. Alongside 100 %-numerator, 100 %-denominator,
and Δnum = Δden ≠ 0, that is a fourth mode, and it is the sharpest restatement
yet of D6 being blind to stroke width.

### What it refused that scored better, and why

Variant B moves `wigCrown` 1.332 → 1.239 against the coin's 1.113/1.116/0.925 —
a genuine D3 improvement. Refused because it is bought with the wrong lever:
round 9 diagnosed that oversized cuts had been cancelling a wig fill about 0.16
too light, and taking this would make the wig the right tone for the wrong
reason **again**, removing the reason the tone round is queued.

At 190 px variant B is finer-grained and it is easy to see why round 9 liked
it. **At 84 px — the recognition draw — it is visibly flatter and greyer, the
light going out of the wig.** The round said plainly that the 190 px preference
is taste under §8 and is explicitly *not* the ground for the refusal.

### A judge error the round caught

The frozen hash file it was handed lists five instruments that **do not exist
at its dispatch commit** — the set was generated from a later tree than the one
dispatched from, so a fresh worktree could not pass the integrity check at all.
The round hashed them in place, confirmed every digest matched, and reported it
rather than waiving the check. Frozen sets must be generated from the committed
dispatch tree.

## v1.71.0 — 2026-08-22

**The nickel's wig becomes one hair mass instead of two combs crossing — and a
round overturns a claim the judge had already published.**

### The back was 61° off the coin, and is now 7°

v1.69.0 fixed the front of Jefferson's wig and, with the same instrument,
measured the back and found it wrong: the new front courses lay **along** the
strands at 12.1° mean error while the untouched back ones **crossed** them at
61.2°. This round replaced nine near-upright arcs with **six** courses cut from
the *same* measured streamlines as the front, so the two families that used to
cross at 60–70° are now one family with a gap.

- back mean angular error: **61.2° → 7.0°** (median 6.1, worst 15.2)
- back coverage: 15/15 → 15/15 — **not** bought by drawing less
- front core: **bit-identical**, its own control
- spacing violations: **9 → 0** (the worst had been 0.07 units apart)

Marks went 9 → 6 because that is what the space holds: seeded at every
intermediate arc, each extra course is rejected for fouling another under the
method's own threshold. The nine pre-existing violations were what "more marks
than the space holds" looks like when the rule is not enforced.

### It overturned something already published, including in the judge's report

v1.69.0 concluded the two nickel references agree at the back **only because
both are reading the silhouette edge** — an artefact, leaving the face at n = 1
throughout. That went into the changelog and into the judge's own summary. It
is wrong.

First, the "~8°" figure never described the back: over the 14 back samples both
references answer, mean disagreement is **18.7°**. The small number lives only
in the band nearest the edge, which is exactly what made the edge story look
right.

Then the confound was broken **experimentally** rather than argued about:
shrink the measuring disc until it provably cannot contain edge pixels, holding
the sample set fixed. At a radius clearing the outline by 2.6 units the
near-edge points still agree **5 of 5 at 9.7°**. The identical sweep on the
front — where the two references are at the null — gives **42–49°**, i.e. at or
above chance everywhere. Small discs do not agree everywhere; the back
separates from the front by 4.5–7.2× at every radius.

**Scope stated honestly:** the n = 2 region is **five grid points** in a band
3.5–5 units inside the silhouette, not "the back". Beyond that the second
reference decays to the null. n = 2 is a band; n = 1 is the rest of the face.

### D6 fell, and the round refused to claim it

D6-obverse went 17.86 % → **13.91 %**. The numerator moved (227.7 → 169.2), so
Appendix R2 is satisfied on its face — but **Δnumerator equals Δdenominator
exactly**, because every mark removed was already uniform-width. No mark became
less uniform. That is a *third* kind of D6 movement, distinct from v1.69.0's
100 %-numerator rise and round 3's 100 %-denominator rise, and the honest
reading is that D6 fell because there is less stroke length, not because the
drawing improved. The round said exactly that and claimed nothing.

**A cost it chose and disclosed:** below y ≈ +7 the direction field turns hard
— adjacent samples are 137° apart and consensus collapses — so no streamline
may be integrated through it. The nape now carries **less** line work than
before. It chose that over filling in a direction it could not determine.

### The check that voids every round it verifies — the judge's own fault

`_rescore.mjs` invokes `_x6mat.mjs`, which unconditionally rewrites
`_x6-run.json` — and that file had been put in the hashed frozen set. So **the
first mandated check of every round destroyed a member of the set it was
verifying.** Its stored hash was stale on top of that.

Fixed here: a run **output** is not a frozen **target**, and the frozen set now
excludes run artefacts the same way it already excludes the append-only history
logs. Two related traps are recorded but not yet fixed: `_x6mat.mjs` is a
**symlink**, so in a worktree it writes into the *main* checkout and reads the
*main* checkout's art — meaning D11 via `_rescore.mjs` in a worktree measures
the wrong tree entirely.

And `_jn15agree.mjs`'s frozen sample list **omits three samples its own
generator returns clean** — all three of them back-most, precisely where the
n = 2 band turns out to live. The published 61.2° was over 15 of 18 available
samples; with all 18 it is ≈55.0°.

## v1.70.0 — 2026-08-22

**The quarter's eagle stops being a bat, and D7 turns out to measure who typed
the coordinates rather than how hard the curve turns.**

### D7's tangent measure is blind on the art it was built to score

This is the fourth proven rubric fault and the most serious, because it
undermines the D7 re-score shipped two versions ago.

`crToBezier` builds each knot's incoming and outgoing control points from the
**same** centripetal-Catmull-Rom neighbour formula, so the tangent is
continuous at every knot **by construction**. Any path still equal to its
fitter output therefore reads a tangent discontinuity of ~0 *no matter how
sharply the drawn outline turns*. Verified structurally by reading the
generator, not inferred from the data.

Five for five, that is exactly what happens — the quarter's `HAIR.Washington`
turns a chord of 102.0° and reads **tangent 1.2**; the cent's `HAIR.Lincoln`
turns 144.5° and reads **1.0**. The cent's `BEARD` is the only path
hand-edited after fitting, and it is the only one that registers anything.

**The ladder that settles it.** Measuring the chord turn of the *flattened,
drawn* outline at spans of 0.5 to 8 local units puts the shipped beard tip at
81.7°…103.7° and the **as-fitted version of the same corner** at 47.9°…126.8°.
The fitted version turns **harder at every span ≥ 2 units — and passes D7.**
The dimension ranks two revisions of one tip in the opposite order to the
drawing.

So v1.66.0's headline — "almost every published D7 failure was the metric, not
the drawing" — is true, but not for the reason given. Those paths pass because
they are unedited Catmull-Rom output, not because anything showed them to be
smooth. **D7-tangent is escalated.**

`BEARD` knot 7 is accepted as a **declared corner** under Appendix P2, with no
geometry changed. Three candidates take it to a clean pass and all three round
the point off — the drawn turn at 0.5 units goes 81.7° → 29.2° / 7.0° / 17.0°.
None taken.

Reported alongside: **`BEARD` is not a fitted contour at all any more.** The
frozen fitter output has 13 knots, the shipped path has 14, and knots 7–13 have
all moved. The half that moved is the jaw half, which was never fitted — it is
a hand-typed polyline — while the scorecard's D7 locus still describes this
path as one the fitter produces.

### The eagle

It read as a bat beside the other seven faces: unbroken dark membrane wings,
no feather separation, a head too small for the spread. Now the trailing edge
is five scallops instead of one sweep, the primaries are four grooves anchored
on the notches instead of five strokes floating in a 5-unit sliver, the coverts
go from two rows to four, and the head is a traced outline with a hooked bill.

**The restraint is what makes it safe.** D2 is unmeasured on this face, so the
round refused to *move* the silhouette it could not score: the five scallops
are placed on the old curve's own nodes, and at the midpoints of that same
curve, so the outline runs where it always ran to within a 0.85-unit sagitta.

**My brief was over-pessimistic and the round corrected it.** I warned the
reference pool was contaminated and that "only one usable reference" was a
likely finding. It is the **healthiest pool in the project — four mutually
independent same-design references.** Correctly discarded: a 2006 Nebraska
state quarter, a duplicate pair that is one photograph, and a posterised
*rendering* that the design test cannot distinguish from another denomination.

D6 rises honestly (numerator +33.8 against a denominator that moved 0.4 %), D13
improves at every tier, and **D10-reverse regresses** — 42→44 `d(ink)` 0.0502 →
0.0544 absolute — which the round reported rather than optimised away. It
explicitly declined to re-tune the icon head scale, which would have reduced
that numerator, because that is choosing a head size to move a gate. It also
rejected its own first head, which hit every measured extent and rendered as a
seal.

**It could not measure the device boundary, and said so.** Two instruments
failed in four configurations — a connected component that bridges wingtip to
legend at *every* threshold and survives 1.2 units of opening, and a ray scan
that rides its bound on 97 of 180 rays. Both kept as failure reports with **no
number quoted from either**. That is nine instruments across five subjects
failing the same way, each time replaced in minutes by a ladder overlay.

### A trap worth knowing about the judge's own tooling

`coloringbook/*` is gitignored except `judge/**`, so a specialist working in a
worktree symlinks the rest in — and **a symlinked `.mjs` resolves its relative
imports against the main checkout**. `_x6dark.mjs` therefore measured somebody
else's tree, printing identical numbers before and after an 860-character
change. Also: two instruments overwrite frozen hashed artefacts from a
documented CLI flag, with no guard — a specialist can void a round by typing an
argument.

## v1.69.0 — 2026-08-22

**Jefferson's wig gets strand detail across the front, and a third face in a row
turns out to rest on a single photograph.**

### The front two thirds of the wig was a bare cap

Round 3 fixed the hair *mass* on this face — three of four wig patches had been
rendering in **face tone** — and closed by reporting what it had created: every
lit ridge in `RELIEF.Jefferson` sat at x ≤ −23, so the front of the head was a
blank pale shape. Mass first, ornament after, is the method's own ordering, and
this is the after: **four new `base` and four new `fine` ridges**.

- strand coverage across the front core: **8 of 37 → 37 of 37**
- mean angular error against the photograph: **31.5° → 12.1°** (median 8.6°)
- the back region it did not touch: 61.1° → 61.2°, i.e. unmoved — its own control

The ridges were not eyeballed. A structure tensor measured the strand direction
field on the photograph, streamlines were integrated through it, and cubics
were fitted and trimmed. **Two wrong features were caught before any number was
published**: near the centre the tensor was reporting the *hairline* rather
than a strand, and at the back it was reporting the *silhouette edge* on both
sides — which is exactly why our art and the photograph appeared to "agree" to
2.8° there. Both are now screened out.

### D6 rises six points, and it is the right kind of rise

D6-obverse goes **11.85 % → 17.86 %** at 84 px. It is **100 % numerator**
(140.8 → 227.7), which is the *opposite* kind to round 3's rise on this same
face — that one was 100 % denominator with a bit-identical numerator, because a
corrected hairline is a shorter route.

Appendix R2 is symmetric and is applied that way: round 3 was charged no
regression because its numerator did not move, and this round **is** charged
one because its numerator did. Adding ornament raises D6 honestly, and §5 puts
the detail above D6.

### The trap in the brief ran the other way

The brief warned that extending pale ridges forward would paint out round 3's
dark curls. Checked by **rendering at 2400 px** rather than by reasoning:
`bust()` emits the lit-ridge group first and the dark curl group second, so the
curls paint over the ridges, not the reverse. The source comment claiming
otherwise was wrong; the clearance it produced is still right. The round
corrected **the comment and nothing else** — a repair to the evidence trail
rather than to the art.

### Three faces in a row now rest on one photograph

**Strand direction across the front is measurable on a single image.** The only
independent reference is degenerate there — coherence peaks at 0.36 and it
disagrees by up to 88°, agreeing only at the back where *both* are reading the
silhouette edge. And the image the field was measured on is **not independent**
of the file already in use (NCC 0.9674 — a re-encode). The round said so rather
than implying corroboration.

That is the cent's whisker boundary, the quarter obverse's tone, and now the
nickel's strand direction: **three faces where the evidence is n = 1.**

Also reported and not fixed: **the existing back ridges are ~60° off the coin**
— the overlay shows the new courses lying along the strands while the untouched
ones cross them — and nine pre-existing spacing violations, the worst 0.07
units apart. The new marks add none, and were trimmed to stop clear rather than
crossing: an earlier pass with better coverage was discarded for passing 0.12
units from an existing ridge, because two families crossing at 60–70° read as a
lattice.

## v1.68.0 — 2026-08-22

**The cent's mid-jaw whisker field, and a round that refused a better score
five separate times.**

### Two photographs of the same coin disagree about the sign

The cent's beard top edge ran well below the coin's whisker field across the
mid-jaw. Closing that gap sounds like one measurement. It is not: **the two
struck references disagree in sign**, and the round showed it is a *field*
rather than one bad patch. Behind local x = −2 both read 0.62–0.95 — darker
than the cheek. In *front* of it the reference of record reads 1.03–1.08 where
the 1909-S reads 0.57–0.82.

The reason is physical: a struck whisker field is bright ridges with dark
grooves, so **its median is not its mass tone**. Shape says close the gap; the
photograph D3 is actually scored against says that region is not dark. So the
lift is **rear-only** — the beard's top edge goes from y 5.15 to −0.80 at
x = −8, and the bare wedge of cheek between hair and beard closes from 13.25
units to 7.30, while everything forward of x = +0.9 is untouched.

### The measurement hole was filled before it could be gamed

There was no tone patch anywhere between `cheek` and `beardJaw`, so the region
being changed was unmeasured. The round placed one **first**, at the exact
midpoint of the two neighbouring patch centres with the radius both carry — so
it is derived from the frozen target and never reads `coins.js`. It went into
its own file rather than the hashed patch set, the writer was verified to
refuse overwrite, the patch was checked wholly inside the head mask at its
centre and 48 boundary samples, and its first value was published **as a
baseline**: coin 1.0603, ours 1.0000.

It also stated an **ink budget before drawing** — D13 at 44 px had 0.0036 of
headroom and the round allowed itself half — then spent 0.0010, and correctly
predicted in advance that D10's `d(ink)` would not move at all.

### Five refusals, and one of them is the point

- Two candidates scored **better on D13 than anything else tried** (+0.0000 and
  −0.0001 at 84 px). Both refused: one wrecks the new patch, one introduces an
  88.7° knot.
- The **tidiest curve of the eight, and the best-looking**, was refused on a
  number.
- A candidate was applied, measured, and then **withdrawn** — its front lift
  put 28.46 % of the new patch inside the beard while the frozen median did not
  move at all, because a median is a step function of coverage. It noticed its
  own gate had gone blind rather than banking the unchanged number.
- **The 12-patch D3 including the new patch is 0.1514, better than the shipped
  11-patch 0.1596 — and it refused to fold it in.** That would redefine a gate
  using a patch that happens to flatter it.

Nothing else moved: D1 bit-identical with its mutation test re-run, D3
unchanged, D8/D9/D11 unchanged, D10's `d(ink)` numerator bit-identical so **no
improvement is claimed** (R2). The byte-identity partition, re-run by the
judge, changed 7 renders of 100 — all cent obverse, all ≥44 px, with the icon
sizes identical because the beard is not drawn at icon.

### What it could not determine, and said so

**The coin's whisker boundary rests on a single reference.** On the other two
the frozen `beardJaw` patch is *less* textured than the cheek, so the
discriminator has no contrast and correctly refuses to answer. The
between-reference spread cannot be discharged at n=1, and the round labelled
its own boundary numbers a hand-checked overlay reading rather than a
gate-grade target.

Also reported: `_jh8locus.mjs`'s self-test is **stale** — the check that D1's
IoU *can* move prints "end marker not found" and carries on, so its absence
reads like a comment; `ref/penny-obv-4.png` is a hashed reference with no
whisker or hair detail anywhere on the bust; and **two different frozen disc
fits for `penny-obv-3.jpg` are live at once**, 0.23 local units apart, with
nothing saying which is authoritative.

## v1.67.0 — 2026-08-22

**A dime curve that was never drawn, a quarter round that correctly refused its
own brief, and a D3 regression the judge had already accepted.**

### The dime's front lock had a spur nobody authored

`HAIR.Roosevelt`'s last segment ended at `(10, -28.4)` — **0.516 units short of
its own `M` at `(10.37, -28.04)`** — so `Z` synthesised a straight line back to
the start, at the one place the outline is meant to be a corner.

**Two of the four "kinks" on this face were that spur**, not drawing decisions:
knot 30 (84.8°) was the spur itself and knot 0 (156.3°, a near fold-back) was
where it rejoined the crown. It also rendered as a visible white pinch in the
stroke at the front lock. Ending the curve on its own start point removes both.
`HAIR.Roosevelt` goes 31 knots → 30, tangent worst **156.3° (3 over) → 146.8°
(2 over)**.

**The other three corners were kept, because the coin has them.** The round
showed this from overlays registered through the frozen disc fits: the bust
truncation's forward point is an unmistakable hard V on two independent
references, and for the front lock's tip *half the wedge is measured rather
than eyeballed* — a device/field boundary walk on the cameo proof puts the
crown edge leaving that vertex at **−157 ± 2°** against the −159.5° we draw.

**Two changes that scored better were built, measured, and refused.** Curving
the bust truncation takes D7 to a **clean PASS** (111.2° → 59.4°, 0 over) and
draws the bust ending in a soft rounded U where the coin has a hard V. Swinging
the nape round removes another over-75 and draws a barb no reference shows.

### The quarter's `hairLit` round was dispatched to do something already done

`OBVERSE.quarter.hairLit` has been `true` since **thirty-nine commits ago**.
The brief told a specialist to set it. That was the judge relaying an earlier
round's prose as if it were a measurement — the exact failure this project has
a standing rule against, committed by the person who wrote the rule into the
brief. Round 9's "hairLit true gives wigMid 0.880 / wigBack 0.876" describes a
hairLit-**off** render; ours with the flag on is 1.148.

**And it surfaced a regression that had already shipped.** D3-obverse on the
quarter went **0.1447 → 0.1927** in round 9, against a gate of ≤0.1791 with no
regression permitted. Re-derived independently by the judge with the frozen
instrument at both revisions. Round 9 *did* report a per-patch tone cost, and
the judge read it as local — nobody converted it into the **aggregate**, which
is where the gate lives. A cost reported per-patch and a gate stated as a mean
are not the same quantity.

Round 9 flipped the *sign* of the wig-fill response: at round 0, turning
`hairLit` off made D3 worse; now it makes it better, because removing the
oversized dark cuts removed what had been holding the light fill down.

**Not reverted, and not waived.** Shapes come before tone by owner decision, and
round 9 fixed a real shape defect — our wig was a stripe pattern our own
instrument could not measure. The regression is recorded with its cause named.
The real repair is groove *duty* at the patch scale, which is its own round.

**The refusal was right on four independent legs**, and the strongest is that
the target cannot decide it: seven same-design photographs put the wig/cheek
ratio at 0.737–1.508, a spread roughly three times the 0.30 effect — and the
two references reading "wig darker" turn out to be **one photograph**, scoring
0.9959 against each other on the project's own independence check.

### The check that enforces every round could not run

`_rescore.mjs`'s §1 frozen-artefact check ran `sha256sum` from the wrong
directory, so it exited non-zero against every hash file this project
generates — and it sat at module top level with **no `try`/`catch`**, so that
failure took D9, D8, D11 and D10 down with it. A broken *check* silently
suppressed every *measurement*.

Fixed, with both tests it should always have had: corrupting a hash file now
reports 710 changed and **VOID**, and naming a missing file reports
**UNMEASURED — this is a failure report, not a pass** while the measurements
still run.

## v1.66.0 — 2026-08-21

**Three more obverse rounds, the $1 note's eagle redrawn, and a version-numbering
error corrected. Two owner decisions closed as declined.**

### First, a correction to this file

The commit titled *v1.63.0* bumped `package.json` from 1.61.1 straight to
1.63.0, but the entry it added below is headed **v1.62.0** — so the version
kids see at the bottom of Grown-Ups had no matching entry, and **the $1 note
rebuild that shipped in it was never documented at all**. The v1.62.0 heading
is left as written because two BACKLOG rows and a published judge card cite it
by that name, and judge evidence is append-only. What shipped as 1.63.0 is:
the v1.62.0 entry's work, *plus* the note rebuild recorded here.

### The $1 note was wrong in kind, not in degree (shipped in 1.63.0, undocumented until now)

The pyramid was a pointed triangle with a second triangle on top. The real one
is **truncated**, with a **detached** capstone above a ray gap — and the
capstone's base is the same width as the truncation beneath it, which is what
makes it read as detached rather than as a hat. The roundels were circles;
they are ellipses. Four corner numerals, where we drew two.

- D1 obverse IoU **0.1496 → 1.0000** at every tier, centre error −16.05 → 0.00
- D2 roundels **0.3943 → 0.9989** and **0.4290 → 0.9991**; separation −25.6% → 0.00%
- D4 obverse count error **2 → 0** at every tier
- The eagle spilling beyond its roundel: **154.8% of the rim → 0.000%**

The brief had carried that overhang as "10.474%" — measured against *our own*
round-0 roundel rather than the note's. The defect was fifteen times worse
than the figure we had been quoting ourselves.

**Two costs recorded rather than waived.** D11's note row fell 0.1049 → 0.0718
(telling the note's front from its back got harder; telling a note from a coin
did not — the set minimum and the §17 ratio are untouched at 0.0534 / 1.49×).
D6-reverse worsened 4.54% → 6.91%, driven by six course lines instead of three,
and kept because §5 puts D4 above D6.

**One finding overturned by the judge.** The round reported that
`src/art/pawcoins.js` holds a second, defective `noteSVG()`. It does not —
that file draws **Paw Bucks**, the app's own fictional currency, which
CHARTER.md requires stay visibly distinct from real money. "Repairing" it
toward the US note would have erased a deliberate distinction.

### The quarter's wig was a stripe pattern, and D6 cannot see that

Seven stroke widths changed; **no centreline moved**. `groove` 2.6/2.4 → 0.98,
`grooveFine` 1.1/1.0 → 0.36. At 2.5 units wide on a 4.05 pitch there is no lit
mass left between the marks to be cut — our own render scored 0 or 1 cuts on
7 of 7 transects, i.e. it could not be measured by the instrument that measures
the coin. Cut duty is now **0.322** against the coin's 0.258–0.429.

**D6 is blind to stroke width.** This round narrowed the exact defect D6 exists
to catch by 2.6×, and D6 moved by **0.0000** — 20.50% / 25.94% bit-identical
before and after, drawn length identical to the decimal. Meanwhile the only fix
for the *count* half of the same defect would raise D6 by 11 points. So D6 as
implemented cannot route a width repair and actively forbids a count repair.

### The nickel has no ear, and its wig covered a third of the head

Both independent references put the wig from temple to nape with **no ear
anywhere** — the glyph box landed in the middle of it. Replaced with
`earMark: CURLS_JEFFERSON`, three dark cuts following three measured grooves.

Worth keeping as a warning: **the tone ratio says the opposite.** The glyph box
reads 0.925–0.948 of the cheek — *darker*, nowhere near the wig's 1.207–1.224 —
because that part of the wig is the deepest-cut curl cluster. Anyone
re-deriving this from tone alone would conclude the glyph sits on skin.

The hair mass was far worse than the brief said: **three** of four wig patches
read exactly 1.000 because the drawn mass never reached them. The old run was a
strip down the back of the head, and the front two thirds of the wig rendered
in face tone. After: hairFront 0.0% → 85.3% covered, hairCrown 38.8% → 100%,
hairMid 0.0% → 100%, curls 30.5% → 100%, with all seven face patches still at
0.0% — no bleed.

### A third rubric fault, and the cleanest one

The corrected hairline is a **shorter route**. D6-obverse rose 0.1168 → 0.1185
and D8 rose 2.3714% → 2.4127% **with neither numerator changing** — D6's is
bit-identical at 140.8 (it actually fell), D8's breaching path, length and depth
are identical. The rise is 100% denominator in both.

Accepted with no regression charged. Appendix R2 says no improvement may be
claimed unless the numerator moved; applied symmetrically, no regression may be
charged either. A gate that a shorter and more correct outline can only make
worse is a gate on the wrong side of its own ratio.

### The note's eagle: the brief's headline number was wrong by 36%

The previous round left a note reading "the note's wings span 0.604 of the rim
against our 0.858 — too wide and too short," and that went into a brief as a
measurement. Measured properly, the note's wings span **0.8242** (0.8211/0.8273
across two references) against our 0.8421. **We were 2.2% too wide, not 42%.**
Neither 0.604 nor 0.756 has a generator anywhere in the tree.

What was actually wrong: the note's bird **hangs low** — tail to 0.893 of the
way down, centre offset +0.191, wings rising at 70.2°. Ours sat dead centre at
0.502 of the height with wings at 53.9°. After: span 0.8248, height 0.6939,
offset 0.1929, wings 70.0°.

The iteration that hit **every** measured proportion rendered as a **tuning
fork** — five separate masses, with `struck()`'s white bevel sitting in the
0.20-unit gap between head and shield, cutting the bird in half. The fix was
not lowering the target; every proportion is still within 0.010 of the note. It
was noticing that the *joins* had never been measured: on the note the head's
ruff and the shield's top edge meet, both at Y 28.33, and two shapes that meet
in a photograph must overlap in a drawing.

### D2 has a frozen dime-reverse target for the first time

D2 has been blocked since it was written, because thresholding a photograph of
struck metal records lighting as shape: four independent dime references agreed
at only IoU 0.36–0.53 against a 0.95 gate. The constructive path §2.1 already
allowed was a hand annotation — and the owner has no tracing tools, so the
judge traced and published candidates for selection instead.

The first attempt was wrong in a way only a person looking at it would catch.
The owner did: *"they all seem to be based off of a circle mask that clips the
image."* A hand-chosen `LOCUS = 0.70` circle was cutting the **torch flame flat
across the top**, so those candidates were the wrong *shape*, not merely
contaminated with lettering.

**There is no locus circle any more.** Three measurements replace it:

- **The legend ring is dropped by connected component, not by radius.** The
  relief is one merged mass and the legend letters are separate components, so
  selecting the dominant one excludes the whole ring without bounding the
  flame. The largest/second gap runs **26.3× / 18.7× / 16.9×**, and the script
  refuses to return a number if that gap ever collapses.
- **The E·PLURIBUS·UNUM baseline is found by the photographs.** Selecting the
  dominant mass already drops every free-standing letter, and those dropped
  pieces carry the baseline with them. Three independent images agree: median
  row **464.5 / 466.5 / 463**, letter height **39 / 40 / 42**. Taking min/max
  over every interior component was tried first and is fragile — one speckle on
  the mirror field stretched the band to 300 and 370 rows against 53.
- **Letters touching the torch are cut by a plain opening inside that band
  only**, because there the only relief is the thick torch shaft; outside it
  the thin twigs still need opening-by-reconstruction.

**The owner chose the 2010-S trace over the majority-vote average**, and the
numbers agree with the eye: it is the highest-resolution cameo proof, the only
one of the three where the band pass had nothing left to remove, and its
baseline cluster used 12 of 12 interior components against 13/17 and 10/14. The
average was closer to all three traces than any was to another — and better
than none of them.

Frozen as `judge/_jd2target-dime-reverse.png` with a `.json` sidecar carrying
every parameter and a SHA-256, **verified identical across two independent
runs**. §6.1 holds by construction: the generator never imports
`src/art/coins.js`, so no value in the target can depend on the artefact under
test. It is a **scoring target, not a source of coordinates** — the art stays
hand-placed from measurements.

### D7 re-scored, and almost every failure was the metric

`judge/_jd7tan.mjs` restates D7 on **tangent discontinuity**, response-tested
three ways: a known 90° kink reads 90.0, a G1-smooth join reads **tangent 0.0
against chord 90.0**, a straight run reads 0.0/0.0. `judge/_jd7fitted.mjs` then
restricts it to **fitted** contours, because Appendix P2 says authored polygons
declare their own corners.

Re-derived against the shipped art, the cent's `HAIR.Lincoln` goes chord 144.5
(2 knots over 75°) → **tangent 1.0 (0 over)**, and the quarter's
`HAIR.Washington` 102.0 → **1.2 (0)**. The quarter's 102° knot had been
described to a specialist as "confirmed by eye as a visible kink"; its actual
tangent discontinuity is 0.4°, and that description is retracted.

Real defects survive on two faces. The dime's `HEAD.Roosevelt` knot 23 at
111.2°, and `HAIR.Roosevelt` knots 0/16/30 at **156.3° / 114.9° / 84.8° —
three genuine kinks the chord metric never scored at all**. And the cent's
`BEARD` knot 7 at 85.0°, which was invisible until this release.

### An instrument that could not see its subject reported a pass

`_jd7fitted.mjs` parsed nine fitted constants and located only **eight** in a
render — so the cent's beard had no D7 number at all. It surfaced because the
script verifies its own extraction against the render before scoring anything,
a check added after an earlier version silently found only `BEARD` and printed
"no fitted contour emitted" for all four coins.

The cause: `arrValue()` ended each block at the literal `"\n];"`, but `BEARD`
ends `].join(' ')`. The block therefore ran on to the *next* array in the file
and the reconstruction carried a second constant's path literals, matching
nothing. Now terminated at the closing bracket in column 0.

The moment the instrument could see `BEARD`, a **fifth genuine kink** appeared
at knot 7. It had been there through every D7 run ever recorded.

### Two owner decisions, both declined

- **`EDGE.field.icon` 42.5 → 44.07: declined.** Previewed at true size. The
  thicker border is marginally better at the smallest size only, is noticeable
  only if pointed out and then closely examined, and it **doubles D10** (the
  42.5 ring currently masks half the bust discontinuity: the true figure is
  0.1528, not the published 0.0854). Not worth the complexity.
- **The inverted `PALETTE` base tone: declined.** Our device/field ratio is
  0.656 where the coins read 1.185–1.438 — measured, real, and deliberately
  left. The three silver coins are the same metal in life, so **staying
  consistent with each other outranks matching the photograph**, and
  `PALETTE.quarter === PALETTE.nickel === PALETTE.dime` being byte-identical is
  now protected rather than a defect to fix.

### A gate that could poison itself permanently

`tests/lifecycle.spec.js`'s restore test **purges** the fixed profile id
`res-kid`, and purge is deliberately irreversible. The test server allocates
its sync directory once at launch and `playwright.config.js` sets
`reuseExistingServer: true` — so a run that died between the purge and the
janitor at the end left a permanent `{"state":"purged"}` tombstone, and **every
later run against that server failed**, waiting two minutes for a restore
button that could never appear.

That is what it was doing: a server reused since 20:03 had accumulated state
from every run of the day. Diagnosed from the leftover file rather than
guessed, then verified both ways — the test passes in 9.0s on a clean server,
and with the fix it passes in 9.3s against a server poisoned with that exact
tombstone. The repair is to clean the id **before** the test as well as after;
no assertion was weakened.

### The suite went from ~50 minutes to a few — one test was almost all of it

`tests/countingpath.spec.js`'s first test took **42.6 minutes on its own**,
longer than the other 458 tests combined. It now runs in **96 ms**.

None of that was the code under test: `buildCountingPath` does all 2,400 of the
test's iterations in ~30 ms. The three property tests sweep 12 tables x 200
seeds x 3 chains and wrapped every check in an `expect()` — roughly **72,000
calls, each capturing a stack trace**, at ~35 ms apiece.

It hid itself twice over. Playwright's `timeout: 120_000` **cannot interrupt a
synchronous loop**, so a test 21x over the timeout still reported a pass. And
the `list` reporter prints only on completion, so a grinding spec looks exactly
like a hung one — several full-suite runs were killed at test 455 in the belief
they had stalled, and two orphaned workers were left spinning at 100% CPU,
which made every later run slower still.

The fix replaces `expect()` **inside the sweeps only** with a plain `ok()`
throw, checking the identical conditions with the same strictness;
`expect()` is kept for the per-test aggregates outside the loops. Assertion
messages now carry the failing case, which the previous version did not:
`table 7, seed 1: "56, 63, _, 77" solves to 70 but answer is 77`.

**A faster test that can no longer fail would be worse than a slow one**, so all
three converted sites were mutation-tested against deliberately broken source:
a wrong answer, two chains sharing a run, and two chains sharing a shape. Each
went red with a diagnosable message, and the source was restored and verified
clean before the suite was re-run.

**Reprioritised on the owner's instruction:** shapes and detail (D1, D2, D4, D6,
D7) come before tone (D3, D13). That also makes D13's escalation — its
normaliser measures the photograph's lighting, not the coin — much less costly
than it looked.

## v1.62.0 — 2026-08-21

**Two obverse rounds landed, and D7 joins the escalated list — its metric
returns 90° for a perfectly smooth curve.**

### D7's gate has never measured curvature

`_jqgeom.turns()` takes the angle between *chords* joining consecutive
on-curve knots, which is a property of how far apart the knots are, not of
whether the curve kinks. Verified independently: a G1-continuous join of two
half-circles returns a worst chord turn of **90.0°**, and **116.6°** when the
same smooth curve is sampled coarsely. A tangent estimator returns 0.0° on it.

It survived because the gate's own response test is *"a synthetic path with a
known 90° corner reports 90 ± 1"* — and **both** estimators pass that, so it
cannot tell them apart. A response test every candidate passes is not a
discriminator.

This invalidates every D7 verdict across four rounds, **including the dime's
D7 PASS in v1.61.0**. What survives is the per-knot *declarations*: each
compared our chord turn against the target mask's chord turn at the same
place, with a known-straight control — like against like, same estimator both
sides. What does not survive is the absolute gate. D7 is escalated on all four
coins, alongside D13 and D2.

### The quarter obverse, D6: one mark of 26 converted, and that is the result

23 of 26 marks have their first-third and third-third width medians separated
by **less** than the between-reference interquartile range — the photographs
do not support a taper on them. The wig grooves, 62 % of all uniform length,
were measured against the coin directly: its roll pitch is 0.95–1.75 viewBox
units and its cut width 0.25–0.55, while we draw grooves at 2.4–2.6 — **wider
than the coin's entire roll pitch**. Narrowing them is a tone change, not a
taper. D6 obverse 21.29 % → **20.50 %**.

A first attempt at the one conversion put two new 92° knots into the drawing
and was refused: a D6 repair that buys its number by breaking D7 is a
regression.

### Three errors of mine it caught

- **The D6 gate of ≤ 0.50 I put in the brief does not exist** for this coin.
  `quarter-gates.md` states D6 under the superseded metric; there was no gate
  to inherit, and I presented one as if there were.
- **The 1932 quarter's disc is R 999.37, not the 903 I published** — my
  background-differencing fitter under-measured it by 9.6 %.
- I repeated that the quarter's 102° knot was "confirmed by eye as a visible
  kink". Its tangent discontinuity is **0.4°**. Another instance of a described
  artefact being found by an eye that went looking for it.

### The cent's beard now meets the hair

`COIN-ART-METHOD` §20.8 has said since it was written that this beard's top
edge *"starts level with the bottom of the ear, not eight units lower."* It ran
**7.9 units lower**, and its rear tip sat **0.841 units outside the hair mass**
— a wedge of cheek tone between two masses the photographs show as one. The tip
moves to (−18.85, 4.00), 0.345 units inside, and the junction closes.

D1 is bit-identical, which is the point: a mutation test (replace either path
with a triangle) leaves all four D1 counters unchanged, so `HAIR` and `BEARD`
are outside its locus — free work on the coin with the tightest margin in the
set, 0.00378.

**And it overturned half the brief I wrote.** I claimed the sideburn was too
sharp: ours 35.5° against the coin's 40–45°. Those were never the same
measurement — mine read the knot polygon, the coin's was a ray fan at radius
8.27 units, and the knots either side of that tip are ~5 units apart. Measured
on the drawn outline at matched radii the sideburn already read **40.6°**.
There was no gap. That is the same chord-versus-curve fault that escalated D7,
surfacing independently inside a brief of mine.

It refused the tempting fix — widening the knot polygon so the metric would
print 40–45 — as *"a worse drawing for a better number"*, and reverted an
iteration that chased the coin's mid-jaw and drew a hump the coin has no trace
of. One cost, disclosed: D13-obverse at 44 px loses 0.0025, leaving 0.0036 of
margin.

### Also found: D13-obverse has no runnable instrument

`_r3d13.mjs` imports `./_rvnorm.mjs` from `judge/`, where the file lives one
directory up, so it throws on a clean checkout. `_x6dark.mjs` covers only the
four reverses. Every published D13-obverse figure came from something that
does not execute.


**The nickel's wig was drawn darker than the cheek; the coin draws it
brighter.** One property changed — `hairLit: true` on the nickel — and the
emitted diff is six characters.

- **D3 had never been scored on this face**, because no `_tonepatches-nickel.json`
  existed. There is one now: 13 patches placed on anatomy *before any scorer
  was written*, the writer verified to refuse overwrite, every patch checked
  wholly inside the head mask. First value: **0.2426 → 0.2137** against a
  0.1166 gate. Before the change the drawing was **worse than a flat fill**
  (the flat-drawing floor is 0.2332); it is now below the floor and still 1.8×
  the gate.
- The repair is the one relationship both usable references corroborate: the
  body of the wig reads 1.207–1.388 of the cheek on the photographs and we drew
  it 0.846–1.000 — the wrong side of 1.0 entirely. `hairLit` renders it at
  1.148, inside the band the references bracket. It is full-tier only, so the
  icon draw — all of D11, where this face is half the set's closest pair — is
  byte-identical.
- **A cost this round created and reported unprompted:** the mid→full boundary
  d(mean) rose 0.0051 → 0.0342, 6.7×, because the wig's tone now steps at
  74→76. D10's gate is on ink, which is binary and cannot see it. The dime
  carries the identical construction.
- **D10 was not touched, and the round found a trap in it.**
  `EDGE.nickel.field.icon = 42.5` is currently *masking* half the defect: that
  ring stroke falls inside D10's sampling disc and contributes 0.0674 of icon
  ink, where at 44.07 it would fall outside. The true bust discontinuity is
  0.1528, not the published 0.0854 — so **fixing D5-rim by making the icon
  field continuous would double D10 with no drawing change.** That is the
  queued shared-constant round, and it now has a price on it.
- **A setting that scored better was refused**: an icon-trio candidate cut the
  ink numerator by 90 % and comfortably met the gate, while nearly tripling the
  boundary d(mean) — satisfying the statistic the gate reads by worsening the
  discontinuity the dimension is named for.
- Corrected, mine: `nickel-obv-unc2004.jpg` is **not** an independent
  reference. NCC 0.9674 against the file already in use, where different
  photographs read 0.28–0.30 — it is a higher-resolution encode of the same
  image, and my plateau screen for that coin was measuring resolution, not
  field quality.

## v1.61.1 — 2026-08-21

**A round that changed no art, and found a regression I had shipped.**

The cent obverse round was dispatched at D3 (tone) and D7 (curves). It
returned 76 lines of comment and not one changed constant, having established
that neither was repairable as scoped — and having found, while re-deriving
the brief's figures, that **v1.57.0 moved D10 on every obverse and nobody
measured it.**

- **D10, the tier-boundary jump, at 42→44 px** — measured against the v1.56.0
  art through the instrument's own `ART` override, so the drawing is the only
  variable:

  | coin | v1.56.0 | now |
  |---|---|---|
  | cent | 5.44× (d 0.0658) | **24.64× (d 0.1921)** |
  | quarter | 6.36× (0.0504) | **12.43× (0.0855)** |
  | nickel | 24.21× (0.1895) | **9.12× (0.0854)** |
  | dime | 5.56× (0.0878) | **4.26× (0.0673)** |

  It is not "v1.57.0 broke D10" — two coins got worse, two got better, and all
  four failed the 4× gate before and after. What is squarely mine is that a
  change I made moved a gated dimension on all eight faces in both directions,
  and I published a round entry naming the dimensions I *had* checked without
  noticing D10 was absent. The cause is specific: the field radius went to
  44.07 at full and mid while **icon was deliberately held at 42.5**, which
  puts a 1.57-unit step exactly at the boundary D10 measures. I made that call
  and did not price it.
- **D10 is now in the standing re-derivation set** (`_rescore.mjs`), where
  D8/D9/D11 already were. A dimension not in that file is a dimension nobody
  is watching.
- **D3 on the cent cannot be repaired at the tone constants**, and the round
  says why rather than shrugging: the four hair patches want values that the
  two struck references *invert* between them (one says crown dark, the other
  says crown light), so no flat fill can satisfy both — ours is already within
  0.001 of the best any single value can do. The coat is the only large miss
  the references agree on, and darkening it far enough costs seven times D13's
  remaining margin at 44 px. Underneath both: our base tone is inverted, with
  the device darker than the field where the coin has it lighter, so **D3 and
  D13 pull in opposite directions on the same photograph**.
- **D7 is four knots, not two** — and the two extra are invisible to the
  scoring instrument, which never evaluates a closed path's closure knot. All
  four are splices between a de-spiked fitted run and a hand-authored chain,
  not oscillations in a fit; the target mask is smooth at one of them and does
  not contain another. Declared as authored corners with the mask readings,
  controls and photograph fans behind them, rather than smoothed.
- Two settings that **scored better were refused**: a coat tone that breaks a
  10-level separation rule written down before the sweep, and a flat fill over
  forehead and temple that would reverse a documented decision the file
  records being drawn, looked at, and removed for reading as a blindfold.

## v1.61.0 — 2026-08-21

**The dime's jaw stops being a pen line, and a long-standing curve failure
turns out to be a corner the die actually cuts.**

- **The jaw was a `stroke-width="1.5"` mark** — width-variation ratio 1.000 by
  construction — and its own comment called it "the only one drawn at full ink
  weight". It is now a filled region tapering 2.90 → 1.80 viewBox units, ratio
  1.505. The centreline is unchanged, so the geometry a previous pass measured
  is preserved and only the mark type changed. D6 obverse: 0.2493 → **0.2145**
  at 84px, 0.3517 → **0.3188** at 190.
- **The photograph contradicted the brief, and won.** I specified a shadow
  "deepest where the jaw overhangs most, thinning toward the chin". The
  references say the reverse: widest and deepest **at the chin**, fading back,
  with a second deepening at the angle under the ear. Every measured width is
  at least 1.9× the 1.5 the stroke drew — the mark was not only uniform, it was
  thin. Only a straight taper was drawn, because the three references agree to
  1.12× at the chin and spread 2.2–2.3× further back; the photograph's rise in
  the ear third sits inside that spread and was deliberately not drawn.
- **D7 obverse now PASSES, without redrawing anything.** Its 111° knot was
  located at the bust truncation, and the corner was measured *on the target*:
  the frozen mask's own turn there is 99–122°, against 6.4–37.9° for a control
  taken on the middle of the straight cut. The die cuts that corner, so it is
  declared an authored corner (knot index 23) and exempt — which is what the
  method's own appendix says to do, rather than smoothing a real feature to
  move a number.
- Two settings scored **better** on D3 and were refused: the chin tone patch's
  median is bimodal, so those optima sit in a window ~0.05 units wide, while
  the accepted setting sits on a broad plateau. Tuning to a step function is
  not an improvement.
- Unchanged and verified bit-identical: D1 (0.98063, still the best of the four
  coins), D3, D8, D9, D11. 6 of 140 emitted strings changed, all dime obverse.

## v1.60.0 — 2026-08-21

**Three lettering items cleared, and one of this project's own published
findings retracted.**

- **E PLURIBUS UNUM is now drawn on the cent reverse** — a fourth missing
  legend, previously absent at every size. It is **two straight lines**,
  not two arcs as planned: fitting a circle with a free centre to the ink
  returns a best radius of 1002 viewBox units (33× the coin), with the
  concentric model 1.41× and 1.76× worse than the straight one.
- **FIVE CENTS is now an arc on the nickel**, where we drew it flat.
  Baseline r 31.67 — and the planned "r ≈ 28" was the band *midline*, where
  this file's convention needs the band's **outer** edge for a bottom-of-coin
  legend. Using 28 would have sat the whole legend 3.5 units too far inboard,
  which is the exact error v1.58.0's retraction exists to prevent.
- 🔴 **RETRACTED: the cent does not read "UNITED STATES *of* AMERICA".**
  v1.58.0 published that on a round-1 incidental observation. Both letters
  are **capitals**, simply set smaller than the surrounding legend — checked
  on two references and then directly, on a 3× crop: the O has no x-height
  and the F's top aligns with it rather than rising above. No art changed and
  none should. What replaces it as the true finding: we don't reproduce the
  **size contrast** on OF, since `arcText` applies one size per call. And,
  noticed while verifying, the coin sets **E·PLURIBUS with a raised dot**
  where we emit a space.
- **The quarter obverse's D5-HF (2.0089× against ≤1.50×) was investigated and
  deliberately not touched.** The coin's obverse band is r 36.6–43.5 with cap
  6.9; ours is r 36.09–40.18 with cap 4.09, so the baseline is right and the
  cap is **41 % short**. But drawing the coin's own cap makes HF *worse* at
  84px (2.0089 → 2.6300) — the photograph's high-frequency energy collapses
  as relief blurs out at small reductions while vector edges stay hard. The
  owed item is D5-cap-obverse, which is unmeasured and has no frozen target.
  Tuning constants until the ratio dropped was the one move available and the
  one the method forbids.
- Fixed: `_jq8contain-v2.mjs`'s selftest asserted a field radius of 40.5 and
  so printed **FAIL on clean art from v1.57.0 until now**. It now checks the
  rule it exists to guard — no coin may pick the blank, the blank must be
  seen and *rejected* — instead of copying a number.
- Unchanged and used as controls: quarter, dime and the $1 note, byte-identical
  at every tier. 6 of 90 renders changed.

## v1.59.0 — 2026-08-21

**The dime's reverse fills its field the way the coin does — and the metric
that sent us there turns out to be measuring the photograph's lighting.**

- The olive and oak branches were narrow columns that stopped 12 viewBox
  units short of the torch that the coin's foliage reaches. Leaves now
  alternate inboard/outboard off the reference's own ladder, the olive blade
  is the coin's 18.6 long rather than 10.5, and the torch's collar, shaft
  and foot are at their measured widths. The clearest evidence is the
  icon-tier ink profile: two dead bands either side of the torch, at 0.00
  where the coin reads 0.73 and 0.87, are now 0.33 and 0.33.
- **D13 improved 13 % at icon and 25 % at mid/full — and is still 3× its
  gate, so it is ESCALATED rather than called progress.** The reason is an
  instrument fault the judge verified rather than accepted: D13 normalises
  by the p90 of the disc interior, which is a *field* level only if the
  brightest tenth of the interior is field. On the dime it is the specular
  highlight on the torch. Measured, with the patches drawn on the source and
  looked at: the coin's own bare field reads 27–165 grey against an ink
  threshold of 181, so **the reference's field is counted as ink on three of
  the four reverses** (dime 0.514 of p90, quarter 0.677, cent 0.757; only
  the nickel is clean at 0.949). Our flat SVG field sits at its own p90 and
  can never be ink, so the comparison is biased by the photograph's lighting
  rather than by our drawing. Fixing it needs a device/field segmentation —
  which is exactly what D2 is blocked on. Two dimensions, one missing thing.
- **A regression, costed and recorded rather than waived:** D11's reverse
  minimum went 0.0812 → 0.0797 (−1.8 %) and the set ratio 1.52 → 1.49. The
  dime's own two faces lost 16 %. Accepted on the same terms the quarter's
  round 1 accepted −1.54 %, and for consistency: this judge declined to bank
  1.49 → 1.52 as progress when the field radius moved it, so it cannot treat
  the reverse move as decisive.
- Two gated rows improved as a side effect: **D10's tier jump went from FAIL
  to PASS** (5.37× → 3.80×, with the absolute numerator falling, so not a
  denominator artefact) and **D6 improved to 0.2317**. D6 was earned the hard
  way — a parallel-sided stem at exactly 2.00 units is a uniform-width mark,
  and six copies of it had pushed D6 to 0.3965 before it was tapered.
- Lettering is untouched: 9 of 72 renders changed, all dime reverse, zero
  lettering changes.

## v1.58.0 — 2026-08-21

**Every coin now carries its legends at the size a child is asked to name
it, and the legends are the size the coins draw them.** This is the round
v1.57.0's field radius unblocked: the caps could not grow while the field
circle sat at 41.0 without becoming a containment breach.

- **Three of the four reverses were blank discs at the naming draw.**
  `money.js` asks the recognition question with `coinRow(q.coins, 84)` —
  one coin, alone, nothing to compare it against — and at that size the
  cent, nickel and dime reverses drew **no lettering at all** (measured on
  the emitted SVG: 0 glyphs → 28, 36 and 28). One shared floor
  (`REV_TEXT_MIN = 135`) was four different rules, because each coin gets a
  different box from the same `size`: the quarter 84 px, the nickel 73.4,
  the cent 66.0, the dime 62.0. Floors are now per coin, derived from the
  reference reduced to the same device pixel count.
- **MONTICELLO is drawn for the first time**, at any size. So is E PLURIBUS
  UNUM on the dime and on the quarter.
- **Cap heights and spans now match the coins.** Every arced legend was
  between 0.40 and 0.79 of its reference cap height; all are now ~0.97.
  Spans ran from −53.7 % to +11.0 %; all now land within 0.1° of the
  reference. Sizes and advances are per legend, off the photographs.
- **Retracted: three D5-band PASSes that compared disjoint bands.**
  `arcText` rotates a bottom-of-coin legend so its caps point at the
  centre, which makes the baseline radius that band's **outer** edge — and
  three round-0 scorecards compared our outer edge against the reference's
  inner edge. The quarter's reverse band ran 30.4–35.6 where the coin's
  runs 37.0–43.7, with no overlap, and it was published PASS. Retracted
  beside the original entries, never over them; the frozen target keeps its
  hash and its mislabelling is recorded rather than edited.
- Unchanged and used as the control: the **quarter obverse**, byte-identical
  at every size. D8, D9 and D11 are bit-identical to the pre-round baseline.
- Fixed in the judge's own tooling: `_jl1look.mjs` defaulted its "before"
  revision to a path in the shared checkout, so once a round was applied
  there it compared the new art with itself — the contact sheet showed the
  new legends in the BEFORE row and the control passed by construction. It
  now requires an explicit revision and refuses to run on two identical ones.
- Still not wired into anything kid-facing: store, wallet and cointray draw
  CSS discs.

## v1.57.0 — 2026-08-21

**The rim is now the measured rim.** `EDGE.field` moves from 41.0 to
**44.07**, the value four judges measured blind on four reference sets
(cent 44.00, nickel 44.33, quarter 44.20, dime 43.75 → 44.07 ± 0.25).
Owner-approved off the `_edgesheet` preview. Our rim ring was 6.0 viewBox
units where the real coins show ~2.7; it is now 2.93.

- Applied at `full` and `mid`. `icon` keeps 42.5 — a true-width ring is
  0.76 device px on a 26px wallet chip, below a pixel, so the smallest
  tier keeps a ring that exists (the old comment's reasoning, reversed).
- **Legends did not move.** Every baseline was judged against the old
  field, so the inscription offsets grew by the same 3.07 units the field
  did; the quarter's frozen 36.40/35.63 baselines hold exactly. The band
  this opens under the field circle is the headroom for the owed
  cap-height fix — the quarter's real caps (6.9/6.7) now fit with more
  than a unit to spare, where 41.0 made D5-cap and D8 mathematically
  incompatible.
- The specular highlight arc **stays at 43.4**, and therefore stops being
  "furniture outside the field circle" — it now sits 0.67 units inside it.
  Moving it out to the new rim band's middle (45.5) was tried and measured
  first: its stroke is 5.38 units wide at 26px against a 2.93-unit rim, so
  on the *reeded* coins it rides over the tooth valleys and lays white ink
  outside the blank (dime 8183 sub-pixels at 26px, quarter 4206; smooth
  penny and nickel zero; every coin zero at 84px). Instrument, with each
  coin controlled against its own 43.4 revision:
  `coloringbook/judge/_edgespill.mjs`.
- Fixed: `judge/_edgesheet.mjs` imported `../src/art/…` from `judge/` and
  could never have run as committed. A preserved generator that does not
  execute is not evidence (COIN-JUDGE.md §4.3).
- Retired for free: the nickel's 1.47-unit D8 bevel breach (head lit copy
  at 41.97 vs the old 40.5/41.0 field) — no drawing changed.
- Coin art still ships unwired (store/wallet/cointray draw CSS discs), so
  nothing kid-facing changes yet.

## v1.56.0 — 2026-08-13

**Every coin is now measured on both sides — and the most important number
is a failure.** v1.55.0 shipped with two of ten faces scored against
photographs. All ten have now been through the method in
`docs/COIN-ART-METHOD.md`, and the run added four phases to it.

- **The nickel's portico had two columns that do not exist.** `coins.js`
  drew six and asserted in its own comment that six *"is the real count"*.
  Three independent photographs say **four**; the phantom pair were the lit
  frames of the openings either side of the centre door, which read as
  shafts in a small image. It survived three releases behind a confident
  comment, and silhouette IoU could never have caught it — a colonnade's
  outline is a rectangle either way. This is the whole reason the new
  count gate exists, and it found the bug on its first run.
- **The reverses are not doing their job, and now we know by how much.**
  The reverses exist because four presidential profiles are four ovals with
  a nose at 19px. Measured for the first time: the reverse set is only
  **1.5×** more separable than the obverse set (1.7% with the shared rim
  discounted), against a 3× target. Two causes, both structural: a
  difference metric rewards covered *area*, so two large overlapping busts
  differ only at the fringe; and `PALETTE.nickel`, `.dime` and `.quarter`
  are byte-identical, so three of four coins get nothing from colour. That
  last one is the deliberate v1.55.0 accuracy decision — a real dime,
  nickel and quarter are one alloy — and **this is the first measurement of
  what that choice costs.** Nothing has been changed in response; the
  trade-off is the owner's to make.
- **Both never-measured obverses fixed.** Penny head-region IoU
  0.668 → **0.952**; quarter bust IoU 0.698 → **0.965**. In both, placement
  alone was about half the gap — the penny's head was drawn 20% too small.
  Two things the photographs simply settled: **Washington has no ear** (the
  wig covers it, and a shared glyph was drawing a helix on bare skin), and
  his bust ends in a truncation clear of the rim, where the file asserted
  the opposite in its own comment.
- **The dime's icon-size reverse was a pale bar where the real coin is a
  dense cluster** (ink coverage 0.174 against 0.678). Fixed at the cheapest
  of four measured options, costing 1.7% of coin-to-coin separation. As a
  side effect the icon→mid tier boundary no longer *pops* — it used to jump
  from a bare bar at 43px to a full branched torch at 54px.
- **The $1 note was measured but deliberately not redrawn.** Its roundels
  are 1.80× too wide and 26% too close together, and should be ellipses.
  That is "fill the container rather than fit the design" for the fourth
  time in this work — a house habit rather than a coin habit.

Nothing here changes a child's progress, prices, payouts or any saved data.

## v1.55.0 — 2026-08-13

**The coins in Money Math are real US coins now, and two of them are
measured rather than merely drawn.** v1.54.0 shipped the track using the
Paw Bucks art, which is fictional currency with a paw print and a printed
value. A child who learns a nickel there has learned a coin that exists
nowhere. `src/art/coins.js` is now real currency — both sides, all five
denominations — and the fictional art moves intact to
`src/art/pawcoins.js`, where a paw print is correct.

- **The dime obverse is fitted to a photograph, not to a memory.** A
  traced silhouette is frozen *before* the art is touched, then scored by
  intersection-over-union: 0.867 → **0.981**. A second pass measured the
  interior line work against a cheek-normalised patch-ratio vector, since
  IoU is blind to everything inside the outline. Both metrics, both
  thresholds and every iteration are written down in
  `docs/COIN-ART-METHOD.md`, along with the controls that make a score
  mean something — a flat drawing scores 0.1134, a palette alone 0.0410.
- **The nickel obverse got the same treatment with a weaker claim, stated
  as such.** Two references agree on its shape to 0.14–0.37% of diameter
  but disagree by 2.2% on how large the portrait sits on the disc, so the
  outline is right to **±1.1% of scale** — materially weaker than the
  dime's, and the doc says so rather than quoting one number for both.
- **Not yet measured: the penny, the quarter, and all five reverses.**
  They are drawn and they are recognisable; they have never been scored
  against a photograph, and this entry does not claim they have been.
- **The three silver coins are one silver.** A real dime, nickel and
  quarter are the same cupronickel; an earlier brightness ladder was a
  fact the app invented, and a child who learns "the bright one is a dime"
  fails on real change. Pinned by measurement — an earlier pass claimed to
  have removed it and left 3.88% behind.
- **Detail follows size.** Full drawing at 76px and up, a reduced tier at
  44, a silhouette below. Wave 1 asks "which coin is this?" at 84px, so
  the one screen that tests recognition gets everything the art has.
- **Paw Bucks are preserved but unwired.** `src/art/pawcoins.js` keeps its
  art and its own spec; no screen imports it today. The wallet and store
  draw CSS circles, as they have since v1.10 — unchanged by this release.

## v1.54.0 — 2026-08-09

**Money Math 🪙 — Phase 7's last piece, shipping as a preview.** The Paw
Bucks a child has been earning since v1.10 become the thing they study
(2.MD.8): meet the coins, count one kind, count a handful, spot equal
value, make an amount, count change up from the price, and read ¢ and $ as
two ways of writing the same amount. Seven waves, 134 identities.

- **Untimed, and that is structural rather than a preference.** A
  correct-but-slow answer stops at box 2 and mastery is box 3, so with any
  finite speed bar a multi-step coin question could never be mastered —
  the track would stall on wave 1 forever, unpaid. Money records through
  `recordMoneyAnswer`, which passes an infinite bar. No ⚡, no countdown.
- **Real coin art at last.** `src/art/coins.js` was written in v1.50.0 and
  imported by nothing; the track adopts it, so a child now sees a dime that
  is visibly smaller than a nickel *and* visibly says 10¢ — which is the
  single most confusing thing about US money and the reason wave 1 exists.
- **Three pigs.** Truffle, Barley and Hazel join the Cozy Corner at three
  grouped milestones, so a friend arrives for a real capability rather than
  for each of seven waves. They have their own voice — a soft oink — and
  their names deliberately avoid every term the content uses.
- **What it pays: 674¢.** Waves 1–4 (recognition and counting, which the
  trail already teaches) pay a penny; waves 5–7 (the new fluencies) pay a
  nickel; the three milestones pay a Paw Buck each. Half the first draft,
  which at 1370¢ out-earned the 1200¢ crown — money math alone would have
  bought the most aspirational thing in the store.
- **In preview.** Turn it on per child with the 🧪 beta chip in Grown-Ups.
  The gate is in TWO places on purpose — `moneyVisible()` carries the beta
  test as well as `/money` being a beta route — because gating the route
  alone leaves cards and tiles advertising a destination that bounces, the
  dead entry point this app has shipped three times. The pigs stay hidden
  in the Corner until the track is on. While in preview the ids and the
  payouts are not locked, and beta data is exempt from the preservation
  guarantee: **progress made during the preview may not survive to launch.**

## v1.53.2 — 2026-08-08

**Singular and plural now agree everywhere a child reads or hears a
count.** An audit of every counted string in the app found mismatches in
both registers — and the spoken ones matter most, because a pre-reader
gets nothing but the audio.

What children were actually hearing, before this:

- `10 Paw Pennys make 1 Paw Dime!` and `1 Paw Bucks make 4 Paw Quarters!`
  — **7 of the 11 coin-swap lines** were wrong.
- `five sandwichs... two hop away!` in Take away!, on picnic-theme days.
- `one pup were playing at the park... four more came!`
- `You saved 1 paw cents!` in the piggy bank, and `1 paw buck and 0 paw
  cents` when the cents were zero.
- `five bones...` spoken while the picture showed apples, shells or
  berries — the theme rotates daily, the spoken word did not.
- `10 walks unlocks the red bandana!` and `10 play dates … unlocks the
  blue collar!`

And reading: `Biscuit gets a bandana after 1 more walks!`, `Biscuit caught
the ball — good dogs!` for a single dog, `1 tiers earned`, and screen-reader
labels saying `1 cents`.

**The root cause was one helper.** `plural()` defaulted to a bare `+s`,
which is a trap in an app whose own activity counter is "fetch" and whose
currency is "Paw Penny". It now applies the two regular English spelling
rules (`-es` after s/x/z/ch/sh, `-ies` after consonant + y); an explicit
plural still wins, and every existing call produces byte-identical output.
Two companions join it: `verb()`, because a verb inverts the noun's rule
("1 walk unlocks", "3 walks unlock"), and `article()` for a/an in front of
a word that comes from data.

`tests/plurals.spec.js` pins the spelling rules, sweeps every themed item
word, every species' sound word, all 11 swap lines and every unlock
threshold, and bans hand-rolled `? 's' : ''` in kid-facing screens. One
existing assertion in `tests/vocab.spec.js` was pinning the bug — it
expected `unlocks the` — and now expects the grammatical form.

Deliberately unchanged: `Waffles's tricks` is correct US style and the only
form a screen reader pronounces as a possessive.

**Also: pig art, drawn but not yet wired.** Money Math gets its own habitat
(docs/PHASE7.md). `pig()` joins the species renderers — same skeleton as the
cat and rabbit, so every accessory already fits — but no pig is in `PETS`
yet: a pet may only be appended alongside the milestone that earns it, or
the positional mapping wraps. Nothing in the app can reach it today.

## v1.53.1 — 2026-08-08

**Fixed: worn gear disappeared on profiles where a parent had used "fresh
start".** Reported from a live profile — wearables looked right, were gone
on the next visit, and came back only after the child placed something
again.

Nothing was ever lost. `mergeProfiles` rebuilt the `gear` object with only
`placements`, dropping `placementEpoch` — and a placement whose stamp is
older than the current store epoch is deliberately HIDDEN, so that a stale
device cannot undo a fresh start. A missing stamp reads as epoch 1, so on
any profile whose epoch had moved past 1, every worn item vanished.

Two things made it look stranger than it was. Saving merges with the copy
on disk on *every* write, so the stamp was stripped constantly rather than
only when switching players. And because the stamp is a single field
covering all placements, putting *one* item on re-stamped it and everything
reappeared at once — which is why grooming a pup (which opens the wardrobe)
seemed to restore toys, gifts and treasures together.

- The merge now carries the epoch, keeping only the placements made in the
  winning one, so the fresh-start guard still holds.
- Profiles already damaged **heal themselves on the next load**, stamped
  from their own ledger — no re-dressing, and a stale device still resolves
  to its true epoch so its pre-reset choices stay cleared.

## v1.53.0 — 2026-08-08

**Groups! — the game that was built but unreachable.** The engine for equal
groups and arrays (2.OA.4) shipped in v1.50.0 with a full test suite, and
then sat there for three releases: no tile, no registry promotion, no
milestone. No child could open it. This wires it up.

- **Groups! 🧺 on the little shelf.** One item asks three things about the
  same picture — how many bowls, how many in each, how many altogether —
  because the point is seeing equal groups, not producing a total. A child
  who reads "12" off the screen without seeing three fours has not learned
  this, so a right total with a wrong group count masters nothing.
- Identities are keyed by FACTOR PAIR, so 3 groups of 4 and 4 groups of 3
  are one thing to know — but the picture shows both orientations, and the
  prompt names which is which.
- An errorless rung first: the repeated-addition sentence is visible while
  the child is still learning what the question means, and that rung can
  only ever teach — it counts attempts and never builds a streak.
- **Sprout the hedgehog** is adopted for all ten pairs — the last pet in the
  collection that had no way to be earned. MILESTONES and PETS are now both
  26, and the suite asserts they stay equal: from here a milestone and the
  pet that earns it must ship in the same commit, or the positional mapping
  wraps and re-adopts a pet the child already has.
- **Count on! finally shows its own goal.** It shipped in v1.50.0 without a
  `GOALS_BY_GAME` entry, so playing it pointed the next-friend meter at
  some other activity. Fixed alongside the same omission for Groups.

**A sitting round can no longer stack two hard facts.** `buildSittingRound`
spreads the weak facts out — the whole point of pet sitting is that it opens
with wins and never feels like a wall — but it decided slot by slot and
checked adjacency on only one of its three branches. Once the supply of
mastered and firm facts ran out, the leftover weak facts were appended with
no check at all, so a round could end on two hard facts in a row. Weak facts
are now placed in distinct gaps between the wins, which makes "never
back-to-back" true by construction rather than by luck. Found by the full
suite, which failed once and then passed on every isolated retry; a 10,000-round
unit test now stands in for that coin flip.

**Groundwork for the money track** (no kid-facing change yet):

- **The penny is no longer bigger than the nickel.** `.coin.penny` had no
  size rule at all and inherited the 34px base against the nickel's 30px —
  the exact inversion of the one fact money math has to teach, that the
  dime is the smallest coin while being worth more. Sizes now follow the
  real mint diameters already recorded in `src/art/coins.js`.
- Untimed mastery for money (`recordMoneyAnswer`). With a finite speed bar
  a multi-step coin question could never reach mastery at all, since a
  correct-but-slow answer stops at box 2 and mastery is box 3. Caught while
  building it: an infinite bar marks every correct answer "fast", which
  feeds the ⚡ Quick Paws ladder — a track with no speed bar now reports
  none, so it cannot hand out a lightning badge per coin question.
- The 134 wave identities are frozen and pinned by a fixture, so ids can
  never shift under a child's saved progress.
- **Schema v19** (additive): `subjects.money` and a `money` stat map.
  Nothing reads them yet.

## v1.52.0 — 2026-08-07

Bath time is a thing you can choose to do.

- **"Practice next" can now send a child to a bath.** Facts that were once
  strong and have gone dusty had no route to them: grooming existed, and
  paid, but a child only found it by wandering to a dog's page and noticing
  the dirt. It is now a real suggestion, aimed at the dog that most needs
  one — or at Biscuit's board-wide spa day when the dust is spread thin.
- **Only faded mastery counts as dust.** A child still learning has plenty
  of shaky facts, and none of them will ever send them to the tub instead
  of to the learning. Grooming is maintenance and is ranked as maintenance.
- **Cleaning pays five times more per day** (up to 25¢ rather than 5¢). It
  is a ceiling, not a target — a child who knows more has fewer dusty facts
  to find, so it quietly lowers itself as they improve.
- **"Rusty" and "polish" are gone from the child's side.** A dog can't go
  rusty. A fact goes **dusty**, and the fix is the bath they already tap —
  one idea with one word. The heatmap says how many dusty spots there are
  and gained a legend for them; grown-ups still see "rusty", which is the
  accurate word on a progress screen.
- **The Grown-Ups backup section was rewritten.** It now says plainly that
  everything lives on this device only and what could erase it, then
  separates the two ways to keep a copy: saving a file (works anywhere) and
  a home server (needs one you run). Long explanations are tucked away
  until asked for, and the home-server part stays shut unless this family
  plainly has a server — decided from what the app already knows, without
  asking the network.
- **The public version no longer offers home-server backup at all**, and no
  longer asks the network for one. It cannot exist there, so it now says so
  and links to the setup guide instead.

## v1.51.0 — 2026-08-07

Seven new things to save up for, and everything fits every friend properly.

- **New treasures and gifts**: a diamond collar ($11), a flower crown ($9)
  and a matching flower collar ($6) as one-of-a-kind treasures that move
  between friends; winter earmuffs ($4.50), a tiny top hat ($4), an
  engraved name tag ($3.50) and snow goggles ($3) as gifts for one friend.
  There was nothing at all to want between $2 and $8 before, and nothing
  new since the crown.
- **The name tag carries your friend's initial** — R for Rusty, K for
  Kiwi — so it's genuinely theirs rather than a spare collar tag.
- **Accessories now fit each animal.** Every item was drawn once for a
  dog, and most friends share that shape exactly, but a turtle's face sits
  far lower behind its shell and a hedgehog's is lower too. Hats floated,
  glasses missed the eyes, and the ear flower landed on a shell. Each
  species now says how it differs and the art follows, per kind of item —
  a hat and a pair of glasses need different answers on the same animal.
- **Wearing one thing at a time.** Putting something on now takes off
  whatever was already in that spot. Nothing enforced this before, which
  didn't show while the neck held only a flat scarf and a small bow — but
  three collar pieces that each cover the collar tag would have stacked.
  Toys are unaffected: a friend can still have several.
- The party hat is bigger, and its stripes now follow the cone instead of
  sitting slightly off it.
- **The times-tables trail now asks for counting by 3s and 4s too**, and
  Counting paths teaches those strides — the tables that gain most from a
  chain had none. No child who already has the tables loses them.

## v1.50.0 — 2026-08-05

**Count on! 🔢** — counting past nineteen, all the way to 120. Phase 7 R3.

- **A new little-pup game with three kinds of question.** What comes after
  29 (the crossings, which is exactly where counting stops being
  predictable); counting by tens from an odd starting place (24, 34,
  44…), where the tens pattern becomes visible; and where a number *sits*
  on a number path.
- **Each kind is tracked separately**, because knowing one says nothing
  about the others. Finishing the game needs the two counting skills;
  the number-path question pays but is never required — the research
  behind it used a board numbered to ten, and we don't pretend that
  licenses a line to 120.
- **The number path is graded by decade, not by pixel.** Tapping anywhere
  in the right ten counts, which on a phone means a target about the width
  of a thumb rather than three pixels. The whole 0–120 line sits above as
  a map, with the zoomed-in stretch highlighted.
- **The app can say every number up to 120** — it could only say them up
  to ten before, so anything larger was read out as digits. Eleven,
  twelve, thirteen and fifteen are spelled out rather than guessed at,
  which is the same reason the game hunts for the crossings.
- Finishing it adopts a new Cozy Corner friend.
**Counting paths, less predictable.** The skip-count warm-up before a
barely-tried times table always asked the same shape — the next number in a
run starting low. It now mixes three: a low run, a run starting further up
the table, and one with a gap in the middle (`8, _, 16, 20`). Still three
questions, still unscored, still no coins.

- Fixed: a coin for learning a number was paid one try early on the
  compare game, which needs a longer streak than the others to count as
  learned.
- Fixed: buying something with a well-stocked wallet briefly asked "how do
  you want to pay?" before every purchase. Paying the exact price is the
  one-tap default again, with counting change back offered as a button
  inside it — almost every wallet can do both, so the question was being
  asked nearly every time.
- Fixed: an animal-voice test compared a bird's brightness to a rabbit's
  with no margin left after the rabbit's voice changed, so a full test run
  failed at random.
- Groundwork not yet reachable by a child: the equal-groups engine, coin
  artwork with readable face values, and the money-track design
  (`docs/PHASE7.md`) — all landing in the next two releases.

## v1.49.0 — 2026-08-05

Counting out change at the shop counter — Phase 7 R2.

- **You can pay with a big coin now.** Hand coins over until the price is
  covered, then count your change back out of the shop's drawer, the way a
  shopkeeper counts it to you: "that's 90, 95, a dollar." The chain of
  numbers is shown as it grows, because counting *up* is the point — it's
  the same skill as counting on, not subtraction.
- **A dead end became the lesson.** A wallet that couldn't make the exact
  price used to be told to go swap coins somewhere else. Four quarters and a
  90¢ bowl is the honest version of that problem: no combination makes 90,
  so the only way to buy it is to hand over a dollar and count 10¢ back.
  That route now exists.
- **When both ways work, the child picks.** Paying exactly is still there
  and unchanged, and a child with a full wallet can still choose the harder
  counting-back route rather than only meeting it when stuck.
- **No way to get it wrong.** Coins that would overshoot are greyed out
  rather than accepted and corrected, coins too big to ever be part of the
  change aren't offered at all, and every coin can be put back. Nothing is
  bought until the change adds up exactly.
- You can also step back to pay with different coins without losing your
  place, start the change over, or walk away — and walking away charges
  nothing.

## v1.48.0 — 2026-08-04

The trail is written down, and readiness gates become one-way doors.
First release of Phase 7.

- **One place says what a child can learn.** Every game and track now has a
  single record — its names on both sides of the screen, the standards it
  supports, the skills it records and the exact numbers those cover. Five
  hand-maintained lists used to have to agree with each other; two of the
  four bugs fixed last release were them disagreeing.
- **A count that had quietly drifted.** The Grown-Ups "numbers known" total
  was measured against 130 when the real number is 132, so the figure was
  always slightly wrong. It's derived now. (The little-game count was wrong
  in two other places too — the README said twelve, the backlog said nine,
  and there are seventeen.)
- **A readiness gate can now be changed without taking anything away.**
  Once a track has been opened for a child it stays open, whatever later
  happens to the rule that opened it. Before, opening was recalculated from
  scratch every time, so a child who had *qualified* but not yet *played*
  could lose a track if the rule was ever adjusted — which in practice meant
  the rules could never be improved. A grown-up can still hide a track by
  hand, and Grown-Ups now distinguishes "opened" from "ready".
- **Two new documents.** `docs/TRAIL.md` maps the whole path from pre-K to
  upper elementary; `docs/PEDAGOGY.md` gives the reasoning, with every claim
  labelled as a standard, a research finding, a practice-guide
  recommendation, or our own inference — including where the research
  genuinely doesn't support what we built, and a plain statement that this
  app is not a curriculum and does not assess standards.

## v1.47.5 — 2026-08-04

- Security: patched a high-severity advisory in `fast-uri`
  (GHSA-7p8r-x3mc-p8w7, host confusion via a backslash authority
  introducer). Build-tooling only — it sits under
  vite-plugin-pwa → workbox-build → ajv and never reaches a browser.
  Unlike the `brace-expansion` pin, the fix was inside the range ajv
  already allows (3.1.4 → 3.1.5), so no override was needed and none was
  added; it will stay fixed on its own. Validated by a clean build and
  the full suite.

## v1.47.4 — 2026-08-04

Backup tells you when it stops working.

- **A device that has gone quiet now says so.** If backup is on but the
  device hasn't reached the home server in a few days, both the players
  screen and Grown-Ups say how long it's been — and that it can't pick up
  app updates either, which is the same problem wearing a different hat.
  Prompted by two tablets that went days without backing up: the app was
  telling the truth every time ("couldn't reach the home server") but only
  at the moment someone pressed the button, and nobody was pressing it.
- **A device that only checks in still counts as healthy.** A tablet with
  nothing new to save doesn't upload anything, and calling that "not
  backed up" would have cried wolf constantly.
- **When a secure address can't be reached, the app now names the likely
  reason** — a home-server certificate this device was never given. That
  failure is invisible in an installed app, because no certificate warning
  is ever shown; it simply looks like the server is missing.
- Nothing is claimed when backup is off, and the warning disappears the
  moment a device gets through again.

## v1.47.3 — 2026-08-04

Four defects, each one a gate in front of something a child was meant to
reach. Groundwork for Phase 7 (docs/PHASE7 plan).

- **Buying a gift crashed the shop.** Picking who a gift was for threw an
  error that killed "← Back to the shelves", so the only way out of the
  wearer picker was to leave the store. `↩️ Start over` in the checkout
  did nothing at all, for the same reason — one block of code had been
  pasted into the wrong function.
- **Counting paths could never be the "Play!" suggestion**, even though
  skip-counting by 2s, 5s and 10s is exactly what opens the times-tables
  track. A child could be waiting on a game the app would never offer.
- **Take away! never left the suggestion rotation**, however well it was
  known, crowding out games that still needed practice.
- **Change coins would have been voided after a store reset** — the
  ledger's epoch reader didn't recognise change entries. Nothing was lost
  (no screen can hand back change yet), but it would have cost a child
  their change the first time one did.
- Documented, after two iPads went days without backing up: a device that
  doesn't trust the home server's certificate cannot sync **or update**,
  and says only "couldn't reach the home server". The runbook now lists
  the three-part signature that identifies it, and the release checklist
  requires certificate trust per device.

## v1.47.2 — 2026-08-02

Every animal voice is settled. 🎧✅

- **The dog keeps BOTH round-2 picks.** With a whole pack, two voices
  beat one: each dog gets one consistent bark chosen from its id —
  roughly half the pack barks the big BOOF, half the little YIP, and
  the same dog always sounds the same (in the counting game, on the
  results card, everywhere). The round-3 distortion experiments lost
  and were removed; git remembers them.
- **The rabbit is the purr-click**; the soft squeak is saved in the
  bank for future use. The counting game asks "how many clicks?"
- Bird (two-note tweet) and sloth (soft sigh) were locked last round.
- The `/sounds.html` QA page becomes a settled listening board, and
  the counting-integrity test pins every bank option — in use or
  saved — to exactly one audible event.

## v1.47.1 — 2026-08-02

Animal voices, round 3 of the ear check.

- **Bird (option 3) and sloth (option 2) are locked in.** 🎉
- **Six new dog barks.** Round 2 still read as beeps because the voice
  was clean — a smooth tone through filters is a synth note however
  well it's shaped. Every new option adds the three things a real bark
  has: distortion on the voice (pressed phonation), a sub-audio growl
  flutter in the loudness, and a jaw gesture (formants snap open, then
  close — the "w-AH-oo"), plus a breathy "f" release. Your round-2
  picks (BOOF, YIP) are kept as A/B keeper buttons and can still win.
- **Six new rabbit voices** in the squeak/click family the round-2
  winners came from, all above the volume floor that sank the thumps;
  the two winners are kept as A/B keepers.
- Until round 3 settles, the app speaks with each keeper A. Because
  both rabbit keepers are voice sounds rather than foot thumps, the
  counting game now asks "how many squeaks?" — the question must name
  what the child actually hears.

## v1.47.0 — 2026-08-02

Economy hardening finished, following four product decisions.

- **Listed prices are now fixed by the build**, not just by intention: a
  snapshot test refuses any change to an already-listed price (adding new
  items stays free). Repricing an id would make one purchase worth two
  amounts across devices, which costs the child the item or the coins.
- **Payout rates stay tunable, safely.** Changing an amount now requires
  bumping that reward's version, which gives the re-rated earnings their
  own identity so old and new coexist. The build fails if an amount moves
  without it.
- **The store can take more than the exact price.** A child may hand over
  a quarter for a 10¢ toy and count the change back — and the purchase is
  refused unless the arithmetic is exactly right. (The counting-out screen
  itself comes with Phase 7; the rules underneath are in place.)
- **A damaged ledger entry is repaired when the fix is obvious** (a number
  stored as text) instead of being silently worth nothing; anything
  genuinely unreadable is listed in Grown-Ups so a missing reward can be
  explained rather than lost.
- The store is markedly faster on a long history (three screens' worth of
  bookkeeping went from 58ms to 18ms at today's size, and from 310ms to
  72ms at 5,000 entries) — ownership is now answered from one pass
  instead of rescanning the whole history for every item.

## v1.46.0 — 2026-08-01

Two independent audits of the money code, and the fixes they found. The
headline one was reachable today: a child could hold Paw Bucks she
literally could not spend, and the piggy bank's swap button would say
"1 quarter makes 5 nickels", play the sound, and change nothing —
forever.

- **The wallet is honest coin by coin now.** Purchases made before exact
  change existed (and any bought without counting coins out) never said
  which coins left, so the coin mix drifted above the balance and got
  quietly rebuilt on every read — swallowing swaps. Spending now moves
  real coins the way a shop counter does: hand over the biggest coins,
  take change back. Every swap the piggy bank offers now actually
  happens.
- **The double charge from the old "buy it again" bug is refunded.**
  Duplicate purchase records are recognised as one purchase, so those
  Paw Bucks come back automatically.
- **Overspending across two devices is genuinely forgiven** rather than
  quietly taken out of the next thing the child earns (finishing a whole
  table used to add 10¢ instead of a Paw Buck). Grown-Ups shows what was
  written off and the true total.
- **The checkout can't dead-end.** A coin is only offered if the rest of
  the wallet can still reach the price, there's a "Start over" button,
  and double-tapping Pay no longer claims the purchase failed after it
  succeeded.
- A fresh start now hands out real change (a Paw Buck broken into
  quarters, dimes, nickels and pennies) so even a 10¢ toy is payable,
  a parent's reset can't be undone by a stale device, and re-bought toys
  arrive in the toy box instead of pre-placed.

## v1.45.1 — 2026-08-01

- Fixed straight after the first live reset: the balance was right but
  the coins weren't. The coin tally was still being computed as if the
  fresh start hadn't happened, so old purchases were subtracted from the
  wallet — leaving a full total that couldn't actually be spent, since
  buying needs real coins counted out.
- The wallet now has a hard rule: **the coins always add up to the
  balance.** If the tallies ever disagree, the coins are rebuilt from the
  balance, and a fresh start hands out a practical mix (some quarters,
  dimes, nickels and pennies alongside the Paw Bucks) so even a 10¢ toy
  can be paid for without a trip to the piggy bank first.

## v1.45.0 — 2026-08-01

Fixes a real incident: toys disappeared from a child's pets, some could
not be taken back off, and a few appeared twice (saves v18, additive).

- **Bought means owned, permanently.** Ownership was being re-decided by
  replaying the whole coin history and asking whether each purchase was
  "affordable" at that moment — so a bookkeeping wobble could un-own a
  toy a child had been playing with for weeks. It vanished from her pets,
  she assumed she'd lost it and bought it again, and the second purchase
  charged her real Paw Bucks. Purchases now stand for good; the balance
  check happens only where it belongs, at the moment of buying.
- **Coin counts no longer cascade.** Two devices recording the same
  purchase with different coins used to void that record, corrupting the
  coin counts, which made dozens of legitimate coin swaps look
  unaffordable. Counts now floor at zero instead.
- If two devices ever do spend the same coins while apart, the shortfall
  is forgiven — a child never sees a negative balance or loses an item.
  Grown-Ups shows the true total.
- Toys can always be taken off a pet, and each shows once.
- **New in Grown-Ups: "Fresh start in the store"** (per player, two
  confirmations plus typing RESET). Gives back every Paw Buck ever
  earned, voids all past purchases, and lets the child buy anything
  again — as if the store opened today. Learning progress, pets and
  awards are untouched, nothing is deleted (the full history stays
  visible to you), and the reset holds even if an old device syncs later.

## v1.44.2 — 2026-08-01

- Found why the barks read as beeps: a tablet speaker reproduces almost
  nothing below ~400Hz, so voices built on a deep fundamental arrived as
  a thin whistle. Sounds are now measured through a simulated small
  speaker, and the animal voices carry their body in the band a real
  device can actually play.
- New dog options (2–6) are built from voiced noise with pitch jitter —
  breath and an irregular voice, which is what a bark actually is — as
  WOOF, ARF, BOOF, YIP and a RUFF-with-grumble. Option 1 (RUFF) is
  unchanged.
- Rabbit thumps are audible now (the impact moved into the 400–500Hz
  knock a speaker can radiate, with the low end only adding weight).
- Bird settles on the two-note tweet; the other two chirps are kept as a
  variety pool. Sloth gains an alternative with no drum-hit before the
  sigh. Hedgehog level brought back in line with the others.

## v1.44.1 — 2026-08-01

- The dog barked TWICE per call — wrong for a sound the counting game
  asks children to count. It is now a single, deeper woof, and a test
  measures every voice's burst count so "one sound" stays one sound.
- Hedgehog and turtle are louder (they were the two quietest).
- /sounds.html becomes a chooser: six dog options, six rabbit options,
  and three bird options to compare by ear, each marked single-event or
  not, with the settled voices alongside for comparison.

## v1.44.0 — 2026-08-01

- Animal voices are twice as long — they were being cut off mid-sound —
  and the dog is an actual woof now: a mouth-opening burst, a voiced
  body whose vowel closes as the pitch falls, and a breathy tail. (One
  fixed filter could only ever make a beep.)
- Cleanup from the audit's minor list: the backup service runs
  unprivileged (existing installs need a one-time `chown` — see
  deploy/README.md), exported profile files keep the same restrictive
  permissions as the live ones, an unreadable file can no longer fail
  the whole backup listing, and "Backed up" is no longer shown when
  there was nothing new to send.

## v1.43.0 — 2026-08-01

- Every animal now has its own voice. The old "bark" was two beeps that
  every creature shared — cats, rabbits and turtles included. Sounds are
  now built from breath (filtered noise) plus a voiced formant, and each
  species has its own: dog woofs, cat meows, rabbit thumps, guinea-pig
  wheeks, bird chirps, sloth sighs, hedgehog snuffles, turtle hums. Still
  synthesized — nothing downloaded, works offline, and all deliberately
  soft.
- The listen-and-count game now asks for the sound your buddy actually
  makes ("how many meows?" for a cat buddy), matching the number–noun
  agreement rule used everywhere else.
- Grown-ups: /sounds.html is a small unlinked page for listening to all
  eight voices on a real device.

## v1.42.0 — 2026-08-01

The rest of the independent audit's findings.

- Settings that collide during a storage recovery now keep BOTH values
  and ask a grown-up which to use (previously the losing value was
  deleted and the conflict was recorded where nothing could read it).
- One device guessing the family key wrong can no longer lock the whole
  family out: the limit is per device, and a correct key is never
  refused.
- The wallet's transaction merge is provably order-independent again
  (a legacy and an upgraded copy of the same coin swap could disagree
  and make two devices push each other in a loop). Randomized property
  tests now cover it.
- Merging two devices keeps unexpected fields from BOTH copies; absurdly
  large or deeply nested backup files are rejected before they can be
  stored; only one backup service can own the data directory.
- New tests for the promises that shipped untested: deleted-player
  listing pagination, a near-4MB profile through sync/delete/restore/
  purge, an interrupted migration, and the single-instance guard.

## v1.41.2 — 2026-08-01

Critical fixes from an independent audit of the hardening wave.

- **A deleted player could come back and then silently lose everything.**
  If a player was deleted while offline and another device kept playing,
  the next sync re-created that player on the picker — but every save to
  it was discarded, so a child could play a whole session that was never
  written. Deleting now suppresses the player everywhere until the
  deletion completes, a refused write is reported instead of ignored,
  and the same hole on a pre-cutover server (where it repeated on every
  sync) is closed too.
- **A deletion could wedge itself.** After the final progress upload
  succeeded, a dropped follow-up call made the retry mistake this
  device's own write for someone else's change — leaving a permanent
  "resolve this" conflict. The retry now completes normally.

## v1.41.1 — 2026-08-01

- Trace it!: the green start dot on the 4 sat where both strokes met,
  so it read as "trace the tall line first". The 4 now uses the
  standard school form (down-left, across — then the stem beside it),
  putting the dot at a clear starting point like every other number.

## v1.41.0 — 2026-08-01

Hardening wave R6/6 — the wave is complete.

- Storage failures no longer create a silent second universe: if the
  browser's main storage (IndexedDB) fails on a device where it used to
  work, a persistent warning explains that players are SAFE, new
  players need an explicit go-ahead, and everything done in the
  fallback merges back automatically on the next healthy start
  (profiles AND settings, ordered by a shared change counter that both
  storage layers continue — verified before fallback copies clear).
  If the browser allows no storage at all, the app says so honestly.
- Mid-trail readiness (the long-standing gap): a child with real
  multiplication/division history now auto-qualifies for the Adding
  track — no more parent-forcing for kids who joined the trail in the
  middle. Inference affects visibility ONLY; it never invents skills,
  coins, pets, or milestones (regression-tested).
- docs/RELEASE-CHECKLIST.md: the real-device manual gate (iOS install,
  two-device sync incl. delete/restore/purge, key flows, offline,
  Lighthouse) for wave-final releases.

## v1.40.0 — 2026-08-01

Hardening wave R5/6: the Paw Bucks economy becomes conflict-proof.

- If two devices spend the same coins while apart (offline race), the
  merged ledger now resolves it the same way on every device: the
  earlier purchase stands, the later one is quietly returned to the
  shelf — the child owes nothing, sees no negative numbers, and can
  simply buy it again. If missing earnings arrive later, a returned
  purchase can complete by itself, identically everywhere.
- Balances and coin counts are now derived by replaying the transaction
  history (nothing is ever rewritten or reversed); they are guaranteed
  nonnegative in total AND per coin. Grown-Ups' ledger annotates
  returned purchases and any corrupted duplicate entries (kept in the
  history, excluded from the totals).
- Merges of the transaction history are order-independent — syncing
  A-then-B and B-then-A now provably produce the identical wallet.

## v1.39.0 — 2026-08-01

Hardening wave R4/6: deleting a player is now safe, durable, and honest
across every device.

- Deleting a player removes them from all devices but keeps their full
  final progress archived in the family backup — even when the deleting
  device was OFFLINE (the final snapshot rides a durable intent that
  survives app restarts and uploads on reconnect). Product decision:
  archives are kept until a grown-up explicitly restores or PURGES
  them; purge is irreversible and leaves a marker that blocks any stale
  device from resurrecting the profile.
- Deleted players are managed in Grown-Ups (🗂 Deleted players:
  restore or purge forever) — and a blank replacement device can
  restore straight from the players screen.
- A tombstone always wins during automatic sync; recovery is only ever
  the explicit restore action. If a deletion collides with real
  lifecycle changes elsewhere (e.g. the player was restored on another
  device), NOTHING is auto-deleted — the grown-up gets a clear
  "delete everywhere / keep the player" choice.

## v1.38.0 — 2026-08-01

Hardening wave R3/6: the sync platform. Family backup moves to a real
conditional-write server with a family key.

- New sync sidecar (deploy/sync-server.mjs, zero dependencies): every
  profile write is compare-and-swap (content-hash ETags, If-Match) —
  two devices can no longer overwrite each other between read and
  write; regression-tested with a genuine interleaved write. Lifecycle
  envelopes, paginated listings, atomic tmp-file+rename writes, crash
  tested by killing the real process mid-write.
- Family key: the server refuses everything until a key is configured
  (secure by default; no anonymous fallback); devices enter it once
  (Grown-Ups, or the profiles screen on a fresh device). On plain-http
  addresses the first key use asks an explicit acknowledgement — the
  key is observable on your own network there; https://compounded.lan
  is preferred. The key lives only on the device, never in profiles or
  exports.
- Existing raw server files migrate zero-loss (originals kept until
  each wrap verifies); pre-update clients are safely write-blocked
  (HTTP 428) until their PWA self-updates. Cutover runbook + tested
  rollback path + emergency export tool in deploy/README.md.
- NOTE for the family: the live server cutover is a deliberate step
  (deploy/README.md) — until it happens, the app keeps speaking the
  old protocol to the current server.

## v1.37.0 — 2026-08-01

Hardening wave R2/6: the client side of family backup gets defensive.

- Anything arriving from the server or a file import is now validated
  before it can touch stored data: malformed documents and
  future-schema documents are skipped safely (and never overwritten on
  the server); one bad file can no longer silently stop the whole
  family's sync. Documents up to the full 4MB server limit are
  supported; unknown fields always survive migration.
- Sync heals on CONTENT, not timestamps: a server copy with a newer
  save time but missing this device's progress now receives the full
  union (the "stranded progress" audit case).
- Backup reporting is honest: "Backed up 💾" appears only when every
  write actually succeeded; a failed listing is treated as
  offline — never as "the server has no profiles" (which used to risk
  blind re-pushes).
- Fixed: changing "limit tables" in Grown-Ups now survives merges from
  devices that haven't seen the change yet (same fix subjects/avatar
  got in v1.33.0).

## v1.36.0 — 2026-08-01

Reliability & security hardening wave, release 1 of 6 (external audit
remediation — see BACKLOG for the wave map).

- Deploys are now machine-gated: GitHub Pages ships only after the full
  suite passes on an insecure origin AND the service-worker/offline
  specs pass on a secure one. A documented pre-push hook
  (`npm run setup-hooks`) guards kid-data preservation specs and scans
  outgoing commits for private terms (list lives outside the repo).
- New privacy tests pin the promises: every request is same-origin;
  ordinary kid play uploads nothing while backup is off; the backup
  offer probe reads without sending anything; the app works fully
  offline behind its service worker.
- Copy now matches reality: the charter says "no third-party requests,
  same-origin only" (the service worker and opt-in backup do talk to
  YOUR server), and Grown-Ups privacy text explains where backup
  copies live. Backlog updated to the current version/schema with the
  hardening wave scheduled ahead of Phase 7.

## v1.35.0 — 2026-07-31

- **Trace it! ✏️** — a new little-pup game for writing the numbers 1–9.
  The digit appears as a thick finger-wide guide with a green GO dot;
  the child traces it with a finger (wobbles welcome — the judge is
  gentle and there are no wrong answers, an incomplete trace just hears
  "Keep going!"). Unlocks once counting to five is strong; rounds are
  4 traces. Tracing all nine digits adopts a brand-new cozy friend —
  the first of the three pets that previously had no way to be earned.
- Kid-visible strings for the game follow the vocabulary canon
  ("Trace it!", spoken prompts like "Trace the three!").

## v1.34.0 — 2026-07-31

- Little pups now SEE why right answers matter: a next-friend meter (the
  pet's dim silhouette + a mini bar) sits in every game and on the
  little home. Correct answers visibly stamp it; getting a number fully
  known makes the pet pop with color; wrong answers conspicuously move
  nothing. Each game tracks the pet ITS OWN milestone earns.
- The Cozy Corner stops dangling pets a child can't earn: big kids
  without the little games no longer see the nine counting-milestone
  pets as ??? (adopted friends always stay), and the "next friend" goal
  never points at an unreachable activity.

## v1.33.1 — 2026-07-31

- Gold finally looks gold: the gold collar and accessory colors move
  from brand-amber to true gold, and award cards now carry their tier's
  color (bronze/silver/gold/diamond/royal/legend accents).
- Fixed dead taps on the "Pick a table" / division section toggles: a
  background sync check-in could replace the screen right as you
  tapped, killing the button's listener and reverting its saved state.
  Toggles now survive re-renders, preferences read coherently from a
  memory cache, and the screen never re-renders mid-tap.
- The hide-the-bones bowl now grows with what's under it — a bowl
  hiding six bones no longer looks like it could barely cover one.

## v1.33.0 — 2026-07-31

- Cross-device sync gets trustworthy (saves v17):
  - Parent settings and choices (subjects, buddy, outfits, toy
    placements) now merge by when they were CHANGED, not by which device
    saved last — a stale device can no longer quietly revert them.
  - Every save first folds in whatever a background check-in already
    pulled, and all writes to a profile go through a lock — two known
    ways progress could be overwritten are gone.
  - Failed backups retry with patience (4s/15s/60s), and big profiles no
    longer risk the browser's 64KB limit on page-close pushes.
  - If the family server already holds backups but THIS device's backup
    switch is off (each device — and each address it uses — has its own
    switch), the players screen offers to turn it on. Grown-Ups now
    shows per-device status: last backup and last check-in times.

## v1.32.2 — 2026-07-31

- Dependency security fixes (build toolchain only — nothing that ships
  to devices): fast-uri and postcss updated via npm audit fix;
  brace-expansion pinned to 5.0.8+ via an npm override (the advisory
  covers every earlier release, and the vulnerable copy was nested five
  levels deep under workbox-build). npm audit: 0 vulnerabilities.

## v1.32.1 — 2026-07-31

- Added SECURITY.md: a security policy for the public repo pointing
  researchers at GitHub's private vulnerability reporting (no public
  issues for security bugs). No app changes.

## v1.32.0 — 2026-07-25

- **The Pet Store is open for everyone!** 🏪 Out of beta after its
  preview run: no flag needed, the pack and Cozy Corner buttons go
  straight in, and the wallet's coin swaps (buck ↔ quarters/dimes,
  and the rest) are on for all. The store banner now reads "Buy
  something for your pet!". Store purchases were always on the real
  Paw Bucks ledger, so beta-era buys carry over untouched.
- The 🧪 Beta preview flag stays in Grown-Ups, empty until the next
  preview feature.

## v1.31.1 — 2026-07-25

- Leaving the Pet store now lands little pups back in the Cozy Corner
  (back button and the beta bounce alike). The pack takes over once a
  second dog is earned; pet-less fresh profiles still return to the
  pack rather than an empty corner.

## v1.31.0 — 2026-07-25

- Cozy Corner friends take toys now: a toy box row at the top of the
  Corner shows what's waiting, and every adopted friend's card offers a
  one-tap ➕ chip — tap the toy under a friend to give it to them, tap
  it again to take it back. No reading needed.
- Toys pay off in play: a pet's toys sit beside them when they host
  little-pup games, and the buddy keeps theirs on the little home.
- Gifts bought for a pet finally show ON the pet (corner cards, the
  buddy, and the store's "It's yours!" art).
- Any toy can go to a dog or a pet — micro toys aren't restricted,
  they're just the cheap end of the shelf.

## v1.30.0 — 2026-07-25

- Pet sitting no longer disappears for kids who finish: readiness now
  needs only 6 mastered facts (the old firm-facts requirement emptied
  out at exactly full mastery — the round builder already composes
  retention rounds from whatever's there).
- The Grown-Ups gate is now a 3×3 prime hunt: tap every prime under 50
  (tricky odd composites like 49 and 39 included), then unlock. A wrong
  pick deals a fresh grid, so it can't be whittled down by guessing.

## v1.29.1 — 2026-07-25

- The Pet store moved off the pack grid and into the top button row,
  next to Cozy Corner and Play date — and the Cozy Corner now has the
  same button up top. Beta profiles go shopping; everyone else keeps
  the "opening soon" tap.

## v1.29.0 — 2026-07-24

- Toys live somewhere now: a Toy box card on the pack screen holds
  unassigned toys; each dog's page grows a toy shelf (tap a boxed toy to
  hand it over, tap it again to take it back); and a pup's toys sit in
  their activity scenes during walks and games.
- Six micro toys (10–15¢): squeaky mouse, jingle bell, perfect stick,
  tickly feather, lucky sock, pinecone — first purchases sized for
  little-pup savings (littles still shop via a grown-up for now; their
  own storefront comes later).

## v1.28.0 — 2026-07-24

- Feed me!, tuned by watching a real 3-year-old: the serve button sits
  well clear of the bones (knuckle grazes), greys out during
  celebrations, and celebrations now burst BIG mid-stage where eyes are
  (the bottom feedback hides under a tapping hand).
- Settle delay: for a beat after each new question appears (after the
  first), little taps are ignored — carryover tapping can no longer
  answer the next question by accident.
- Friends eat their own food: a turtle buddy gets greens, a cat gets
  fish — no more bones for Tidepool.
- Number–noun agreement everywhere counts are spoken or shown: "one
  bone", "one walk", "three leaves" (irregulars included), across the
  little games, dog pages, and story lines.

## v1.27.0 — 2026-07-23

- Cross-device sync now CHECKS IN, not just pushes: the app pulls and
  merges on boot, on returning to the foreground, on visiting home, and
  immediately after picking a player (throttled to 45s) — and the
  running app refreshes its in-memory profile on passive screens, so a
  little pup's Cozy Corner appears on the new device by itself.
- Check-ins also heal stale server copies: if the merge knows more than
  the server (progress from the old debounced-push era that never
  landed), it pushes back without waiting for a new save.

## v1.26.2 — 2026-07-23 (beta)

- Store shelves show the actual accessory art (the real crown, scarf,
  glasses… cropped from the wearable renders) instead of emoji
  stand-ins. Toys already used their real art.

## v1.26.1 — 2026-07-23

- Fixed: gifts couldn't be taken off in the closet — undressing looked
  up the gift's owner from the (empty) target wearer and refused.
  Treasures were unaffected.

## v1.26.0 — 2026-07-23 (beta)

- Paying at the store is now EXACT CHANGE: the child counts out real
  coins from their own wallet (tap coins into the pay pile, take them
  back, Pay unlocks at the exact price). A lone Paw Buck can't pay 90¢ —
  the store sends you to the wallet to make change first (the swap
  table's whole purpose). Paid coins genuinely leave the wallet.
  Replaces the multiplication-line checkout — times tables live
  everywhere else; the store teaches money.

## v1.25.0 — 2026-07-22

- Family backup now writes to the server IMMEDIATELY after every save
  (every finished round/activity/purchase), with one retry and a
  last-chance keepalive push when the app is hidden or closed — device
  switches can no longer strand a round's transactions on the old device.
- Fixed devices sticking on old versions: the server never told browsers
  to revalidate the ROOT url (only /index.html), so Safari could
  heuristic-cache the app shell for days; `/` is now no-cache, and the
  installed app checks for updates hourly and on every return to the
  foreground.

## v1.24.1 — 2026-07-22

- Division and Taking Away no longer double-introduce facts: the
  missing-number bridge form IS the intro (the restated ×/+ fact was
  already mastered to unlock the track), so the echo now happens once at
  the operator's debut — the first "20 ÷ 5" or "12 − 8" is shown and
  typed, not asked.

## v1.24.0 — 2026-07-22

- 🧪 Beta preview flag (Grown-Ups): explicitly flagged profiles can reach
  in-development features; beta surfaces are preservation-exempt and may
  change or lose their data as they develop (warning shown).
- BETA: the Pet Store is open — shelves by tier with the pinned prices,
  and paying is the full coin math: the price decomposes into Paw Buck /
  quarter / dime / nickel lines the child multiplies out, plus an
  addition total ("3 × 25", "1 × 10", "1 × 5", then 75 + 10 + 5). Gifts
  ask who they're for and arrive being worn; toys land in the toy box.
- BETA: coin swaps in the wallet — both directions (10 dimes → a Paw
  Buck, a Paw Buck → 4 quarters…), net-zero money, real place value.

## v1.23.0 — 2026-07-22

- More skins, same skills: Quick Look flashes rotate through ten-frames,
  dice patterns and paw pads; Find it! sometimes gives only a spoken
  target (👂 no numeral crutch); Adding and Take away! sometimes play as
  park stories (pups arrive, pups nap); Feed me! rotates receivers
  (bowl, toy box, flowers).
- Adopted Cozy Corner friends now take turns co-hosting the games — the
  collection shows up to play.
- Daily item themes: the counting objects change with the day (classic
  bones, picnic, beach, snow, garden).

## v1.22.0 — 2026-07-22

- Same skills, new looks: How many? sometimes asks by EAR (the buddy
  barks, count the barks); Number Friends sometimes plays the cup game
  (bones hiding under the bowl — pure verification, no answer shown).
- Surprise! 🎁 — a mixed round sampling the child's own revealed games
  (unlocks at three): interleaved practice, little-pup style.

## v1.21.1 — 2026-07-22

- Type it!'s numpad was collapsing to min-content inside the centered
  stage (squished keys). It now has a real width (320px / 92vw) with
  chunky 54px-tall keys, and the model numeral shrank just enough to
  keep the whole game on a 600px phone with zero scrolling.

## v1.21.0 — 2026-07-21

- Early friends: two easily-reached milestones — First counts (knowing
  1–3) and Counting to five — so brand-new little pups adopt their
  first Cozy Corner friends within their first days of play, connecting
  correct answers to new friends from the start. Four new pets join the
  habitats: Nibbles 🐰, Pesto 🐦, Pistachio 🐹 and Sprout 🦔.

## v1.20.0 — 2026-07-21

- Take away! 🥣: subtraction's concrete stage — bones hop away before
  their eyes, how many are left? Unlocks from pictorial adding.
- Counting paths 🐾: skip-count chains for 2s/5s/10s plus counting
  backward; tap-choices until typing is known, then typed. Unlocks when
  the Doubles wave masters (doubles ↔ ×2).
- Type it! now serves decade numbers (20–90) once paths-of-10 is known.
- Times tables readiness is complete: within-20 waves + first Taking
  Away waves + the counting paths. Two more milestone pets. The
  automated trail now runs unbroken from first counts to division.

## v1.19.0 — 2026-07-21

- Type it! ⌨️: the numpad bridge — a numeral shows and speaks, the child
  types it (teens = two digits, early place value). Unlocks from Find
  it!; skills type:1–19 pay pennies; its own milestone pet. Adding
  readiness now requires typing 1–10 (you can't answer waves you can't
  type).
- The trail continues in place: Adding ➕ and Taking Away ➖ appear as
  little-home graduation tiles opening the right wave round directly —
  no big-kid home needed to keep climbing.

## v1.18.0 — 2026-07-21

- The automated readiness trail: Adding & Taking Away and the times
  tables now open THEMSELVES when a child demonstrates readiness
  (counting + what-comes-next for Adding; the within-20 strategy waves
  for tables) — anything ever started stays visible, and Grown-Ups
  chips become ✨Auto / On / Off overrides with a trail-map card.
- Reveals are a ratchet: once a game or track appears it can never
  vanish — fixes tiles disappearing when a bored little pup taps wrong
  answers on purpose. New tiles/tracks celebrate once (confetti+cheer).
- The little Play! hero rotates through every game with numbers left to
  learn (one step per round) instead of camping on one game.
- Pinch/double-tap zoom disabled in the installed app (OS accessibility
  zoom unaffected); large adding/teen questions wrap and shrink so
  every item stays on a portrait phone — enforced by a worst-case fit
  sweep in the suite. (saves v16)

## v1.17.0 — 2026-07-21

- One name for the outing: **Play date** everywhere ("Play together" is
  gone); "training" only ever appears as **collar training**. The dog
  page counter reads "N play dates"; wardrobe collar prices speak in
  play dates too.
- The group screen now shows live whether the picked pack counts:
  "🦮✨ Collar training!" as soon as a still-learning friend is aboard,
  "💤 Just for fun — add a friend who's still learning!" when not, and
  the start button echoes it ("Let's train!" vs "Let's go!").

## v1.16.1 — 2026-07-21

- Auto-picked play dates always earn collar credit — the picker already
  chose the most practice-needing friends available, so a fully polished
  pack no longer blocks the ladder. Manually-built groups keep the
  training-partner rule.

## v1.16.0 — 2026-07-20

- Play date 🐕🐕: one tap on any dog's page invites 1–3 auto-picked
  friends (whoever most needs the practice leads the invite) into a
  group training round — 6 facts per dog (12/18/24), earning collar
  credit when a friend still needs the work. Manual group play and its
  training tip stay as-is; group rounds everywhere now scale with the
  party instead of a fixed 6 questions.

## v1.15.0 — 2026-07-20

- Wardrobe: a collar row (original color + the blue/green/purple/gold
  ladder, locked swatches priced 🐕🐕10/25/50/100 with speak-on-tap) and
  a Closet 🧺 — owned store gear toggles on/off, gifts stay with their
  pup, treasures show who has them ("↩️ Bring from Scout").
- Group play: a tap-to-add tip suggests the pack's weakest table as the
  training partner ("Scout is still learning the ×7s — bring them along
  for collar training!").
- Dog pages: a 🐕🐕 training counter with the next-collar reward chip.
- Toys stay engine-only until the store opens.

## v1.14.0 — 2026-07-20

- Store backend (no store yet): pinned prices in the catalog (toys
  25¢–$1, gifts $1–$2 per wearer, tiara $8, crown $12 — all 5¢ steps
  against the ≈$54 lifetime economy); ownership derived from the ledger
  via deterministic buy txns (two devices buying the same thing merge to
  one charge); gear placements (saves v15, additive) with gifts bound to
  their wearer and treasures/toys moving freely; placed gear renders
  through the normal accessories pipeline.
- Collar colors: a new ladder (blue 10 / green 25 / purple 50 / gold 100)
  earned through GROUP sessions that include a training partner — a dog
  whose table is unmastered or rusty. Interleaving is the reward.

## v1.13.0 — 2026-07-20

- Pick your buddy 💛: adopted Cozy Corner pets have a "🤍 Pick me!"
  button — the chosen pet becomes the avatar everywhere (little home
  hero, games, profile cards, big-kid home) and gets fed in Feed me!.
  Any dog page's buddy button switches back. Saves v14 (additive
  avatarPetId; unknown ids fall back to the dog).

## v1.12.1 — 2026-07-19

- Every × table round now carries a 👋 button in its top bar — the
  always-available, repeatable door into that table's Meet lesson
  (previous entries only appeared for never-met or not-yet-strong
  tables, which hid the lesson from experienced profiles).

## v1.12.0 — 2026-07-19

- Meet the table 👋: an optional, repeatable, unfailable lesson before
  any quiz — the table's dog shows their tricks: a tap-in-order
  skip-count paw path, tap-to-build groups ("3 groups of 7 make 21!"),
  and anchor tricks (one more group than ×5, one less than ×10), all
  spoken. Entries: "Practice next" points never-met tables at the
  lesson, the quiz teach banner offers "Meet first", and results offer
  "Meet again" until the table is strong. Finishing flows into
  practice. No coins — teaching, not testing.

## v1.11.0 — 2026-07-19

- Echo-first: the very first time any fact appears in a kid's life —
  across ×, ÷, Adding and Taking Away — it's SHOWN, not asked: the full
  equation with "📣 New one! Type it in!". Typing it is an errorless
  first rep (typos wiggle, never punish); the next appearance is a real
  question. Removes the "ambushed by a stranger" feeling from new
  tables. No coins, no box movement — exposure only.

## v1.10.0 — 2026-07-19

- Little Pup guidance: a big "Play!" hero tile picks the most valuable
  game for right now (the learning frontier), a bouncing 🐾 marks it on
  the shelf, and the sparkle tile became a goal preview — the locked
  game's art with a meter showing which game feeds it and how close it is.
- Verification tightening: Quick Look blocks answers until the flash
  hides (quick eyes, not counting); Number Friends' pictures stage is
  teach-only (streaks start at the mixed stage); Feed me! now records
  skill (it's been failable since v1.4.1) — little ceiling 81¢ → 91¢;
  Who has more? needs a streak of 4 (two choices are guessable).
- Fixed: more/next/add number ranges could never grow — their bands
  waited on impossible numbers (a "more" question can't ask about 1).

## v1.9.0 — 2026-07-18

- Reward chips: accessory-color progress is finally visible — tiny meters
  filling toward the actual next swatch on the dog page, locked wardrobe
  colors shown in their real color with a visible price (🦮25) that
  speaks when tapped (tooltips don't exist on tablets), and "2 more
  walks!" nudges on activity finish cards.
- Vocabulary canon (docs/VOCABULARY.md): kid register vs grown-up
  register, enforced by tests. Kid screens now say "Get the ×7s strong ⭐"
  (never "Master"), "rusty — time for a polish!" everywhere, and Adding
  headers wear ➕ to match Taking Away's ➖.

## v1.8.0 — 2026-07-18

- Counting Path warm-up: a barely-tried × table starts with three
  unscored skip-count chains ("4, 8, 12, ❓") — the counting→tables
  connector, gentle either way, recording nothing.
- "Practice next" now ranks Adding and Taking Away waves alongside
  tables — one button, whole trail (first brick of the cross-track
  practice spine).
- Grown-Ups: Adding x/66 and Taking-away x/66 rows for bridge kids.
- Wave rounds' results show the next Cozy Corner friend to work toward.

## v1.7.0 — 2026-07-17

- Seven new Cozy Corner pets (Inky, Thumper, Waffle, Lemon, Dozer,
  Thistle, Tidepool) — one new neighbor per habitat, adopted per Taking
  Away wave mastered. Habitats stay seven readable rows.

## v1.6.0 — 2026-07-17

- Taking Away ➖: subtraction within 20 as think-addition — one entry per
  fact family (12−8 and 12−4 strengthen "4+8" together), seven waves
  mirroring Adding, each unlocked by mastering its Adding wave.
  Missing-addend presentation bridges to the − symbol as families
  strengthen; hints think addition or count up. Full frontier earning.
- Charter rewritten for the product reframe: one app, pre-K through upper
  elementary, drilling the math-fact canon (docs/PHASE6.md).
- Fix: wrong addition answers showed "undefined" instead of the correction.
  (saves v13)

## v1.5.0 — 2026-07-15

- Grown-Ups: a speech-voice picker — "✨ Automatic" (the scorer) by
  default, or choose any installed English voice; the pick overrides the
  scorer everywhere, persists per device, and changing it speaks a
  sample. Falls back to Automatic if the chosen voice disappears.
- Automatic scoring: legacy Mac voices (Fred, Ralph, Kathy, Victoria…)
  are now penalized; stale voice objects re-pick instead of silencing
  speech.

## v1.4.2 — 2026-07-14

- Voice fix: iOS novelty voices (Superstar, Bubbles, Zarvox, Grandma…)
  are hard-blocked from selection — "Superstar" was winning on a loose
  "super" match. Downloaded (Premium) voices now rank above (Enhanced).

## v1.4.1 — 2026-07-14

- Grown-Ups: "Hear the voice" button speaks a sample and refreshes the
  voice label (iOS reports its voice list only after speech is used);
  clearer install path for Enhanced voices.

## v1.4.0 — 2026-07-14

- Speech: the voice re-picks as the device's voice list loads (iOS reports
  it late), prefers enhanced/natural voices more strongly, and Grown-Ups
  shows which voice is in use with a tip for downloading a nicer one.
- Grown-Ups: Little pup progress card (xp, numbers known 0/81, per-game
  breakdowns, Cozy Corner count).
- Feed Me!: the child now serves the bowl with ✅ — bones toggle in and
  out, confirming a wrong count is a gentle, fixable miss (it previously
  auto-ended at the right count and could never be wrong).
- Number Friends: pictures-only first (a frame with empty cells and
  picture-pile choices), the symbolic ➕ equation appears with mastery,
  numerals-only last — fresh at each new whole (5, then 10).

## v1.3.0 — 2026-07-14

- Bridge Track 1: three graduation tiles on the little home, gated by
  demonstrated skill — Quick Look (a flash of the frame, then quick eyes),
  Number Friends (missing parts of 5, then 10), Teen Numbers (10-and-some).
- Cozy Corner: zero-maintenance companion pets adopted at bridge
  milestones and adding waves, grouped by species habitat. Piggy-bank chip
  on the little home; a penny the first time any number becomes known.

## v1.2.0 — 2026-07-14

- The Adding track (bridge Track 2): 66 addition facts within 20 in seven
  strategy waves (Step Ups → Doubles → Make Ten → Near Doubles → Tens &
  Teens → Ten Bridgers → Grand Finale), sequential unlocks, wave-matched
  hints on misses, full frontier earning (nickel per fact, Paw Buck per
  wave). Shown when a parent turns on "Adding games".

## v1.1.0 — 2026-07-14

- Grown-Ups "What <name> sees" controls: show/hide Little Pup, Adding
  (bridge), ×/÷ tables; child-can-switch (kid hops between the little and
  big homes); hide pet sitting; limit which × tables appear.
- Saves v12 (additive): subjects defaults, addition fact map, Cozy Corner
  pet unlocks — groundwork for the Phase 5 bridge (docs/PHASE5.md).

## v1.0.0 — 2026-07-14

First numbered release; everything to date, including this week's work:

- Frontier earning (Phase 4a): coins pay mastery crossings, table
  completions, and capped rust polish — never volume. Pet Store teaser.
- Little Pup honing: ten-frame layouts, staged patterns, CVD-safe palette,
  real per-number mastery tracking, adaptive 5→7→10 range, guided recount,
  better speech voices with an excited cheer + activity-matched praise.
- Store gear art (crown, tiara, 6 more wearables, 8 toys).
- Everything prior: ×/÷ Leitner tracks, 25 dogs, wardrobe/grooming,
  achievements, Little Pup mode, sync, PWA distribution. (saves v11)
