# Changelog

The version shown at the bottom of the Grown-Ups screen. Kid progress is
never affected by updates (see CLAUDE.md's preservation gate).

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
