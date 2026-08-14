# Dime — round 0. FAIL, and the fourth independent measurement of `EDGE.field`

Judge run, 2026-08-14, commit `c0ff971`. Gates in `dime-gates.md`, **written and
hashed before the first measurement** (nickel N1). Scorecard
`dime-scorecard.json`. Every image named here has its generator named beside it.

```
  D1   obverse silhouette   obv   IoU 0.98063 vs a 0.95 gate            PASS
  D2   reverse motif        rev   min pairwise IoU 0.4466; ONE photo    BLOCKED
  D3   interior tone        obv   0.0399 (published 0.0443) vs 0.0567   PASS
  D3s  tone sign test       obv   one struck reference, no registration BLOCKED
  D3   interior tone        rev   no patch set exists anywhere          UNMEASURED
  D4   structural rhythm    obv   no repeated element                   N/A
  D4   structural rhythm    rev   target is single-source, LOW conf.    BLOCKED
  D5r  RIM SEAT            both   coin 43.75 +- 0.38, we draw 41.0      FAIL   <- the headline
  D5   band  LIBERTY        obv   rOuter -2.86 (rInner -0.87)           FAIL
  D5   band  USA            rev   rInner +1.95, rOuter -2.73            FAIL
  D5   cap                  obv   5.93 vs 7.92  = -25.1%                FAIL
  D5   cap                  rev   3.52 vs 8.20  = -57.1%                FAIL
  D5   span                 obv   70.7 vs 82 deg = -13.8%               PASS (marginal)
  D5   span                 rev   -31.1% and -42.5%                     FAIL
  D5   presence            both   NO LETTERING on the reverse below 190px FAIL
  D5   HF                  both   no instrument built                   UNMEASURED
  D6   edge quality        both   0.249-0.352 vs a 0.50 gate            PASS
  D7   curve quality        obv   fitted HEAD has a 111.0 deg knot      FAIL
  D7   curve quality        rev   no fitted contour on this side        N/A
  D8   containment         both   0.0000%, depth 0.0000                 PASS
  D9   well-formedness     both   0 of 180                              PASS
  D10  tier behaviour       obv   5.56x p90 at 42->44                   FAIL
  D10  tier behaviour       rev   3.87x / 0.80x                         PASS
  D11  discriminability    both   dime.o/nickel.o 0.0534 = SET MINIMUM  PASS (baseline) + ESCALATE 1.52x vs 3.0x
  D12  looked at           both   control first, read back, written     PASS
  D13  device vs field      obv   -0.0788 at 26px                       FAIL
  D13  device vs field      rev   +0.20 / +0.24 / +0.30                 FAIL   <- the worst number on the coin
```

**Verdict: FAIL.** 16 failing rows, of which 4 are `BLOCKED` on two
acquisitions and 12 are repairable.

---

## 1. The headline: the dime's own field radius is 43.75, and that settles the question

`EDGE` in `coins.js:628` gives all four coins one literal triple — full 41.0 /
mid 40.5 / icon 42.5 — that `scripts/coin-shared-claims.mjs` flags as never
measured against any of them. Three judges have now measured three coins. This
is the fourth and last, measured without looking at the other three until it was
frozen.

| reference | strike | disc p95 | silhouette lands at | **rim seat** |
|---|---|---|---|---|
| `dime-obv-2.jpg` | 2015-W cameo proof | 0.12 % of R | 47.08 | **43.7 ± 0.3** |
| `dime-obv-3.jpg` | 1996-S proof | 0.44 % | 46.74 | **44.3 ± 0.2** |
| `dime-obv.jpg` | 1996-W, 8.1° out of plane | 0.41 % | 46.94 | **43.6 ± 0.6** |
| `dime-rev-2.jpg` (= `dime-rev.jpg`) | proof | 0.15 % | 47.01 | **43.4 ± 0.4** |
| `dime-obv-4.jpg` | 2002-S | **5.28 %** | 47.99, spread 6.6 % | not used |

> **The dime's own field radius is 43.75, sd 0.38, from four independent
> photographs. We draw 41.0. Δ = −2.75 against a ±1.0 gate.**

Obverse-only it is 43.87 ± 0.38; the single reverse photograph reads 43.4.

**Now compared with the other three, and the comparison is the answer to the
question that was asked:**

| coin | measured | judge | references |
|---|---|---|---|
| cent | 44.0 ± 0.8 | penny r0 | 3 |
| nickel | 44.33 ± 0.32 | nickel r0 | 3 |
| quarter | 44.20 | quarter r4 | 3 |
| **dime** | **43.75 ± 0.38** | this round | **4** |

Four coins, four judges, four reference sets, four instruments: **44.07 ± 0.24**
against one shared literal of **41.0**. The dime is the lowest of the four and
it is the coin with the best physical reason to be different — it is the
smallest (17.91 mm) and Roosevelt's head very nearly fills it — but 0.32 units
below the mean, with its own spread of 0.38, is **not** a per-coin difference.
Every pairwise gap is inside one standard deviation.

**This is a single corrected constant, not a per-coin table.** The evidence now
supports `EDGE[*].field.full ≈ 44.0`, and the residual disagreement between
coins (0.58 units, max to min) is smaller than any one coin's own measurement
spread. If a per-coin table is wanted later it needs better photographs, not
more coins.

### 1.1 How it was read, and the wrong feature it would have been

E1 and E2 were frozen in `dime-gates.md` before the first run. They disagree
across the dime's references **by up to 3.4 units against a 1.0-unit gate**, and
the unwrap picture says exactly why:

- `dime-obv-2.jpg` is a cameo proof. Its **mirror field throws lens-shaped
  specular highlights at r 41.5–43.5** over roughly a third of the circle
  (visible in `_jd7seat-dime-obv-2.png` at 0–90° and 170–200°). Those are
  **field**, not rim. E1 on the bare-field sectors returns **41.83** — a
  confident, in-bounds, response-tested answer to the wrong question, for the
  sixth time in this project, and caught for the sixth time by drawing what was
  found and looking at it (§4.3).
- E2 on the reverse returns **41.39–41.49**: it locks onto the **cap tops of
  UNITED STATES OF AMERICA**, which reach r ≈ 42.5–43.0 on this coin.
- On `dime-obv.jpg` E1 returns **40.05 and 40.25 — at the window bound**, and is
  reported as a failure, not as a value (§4.1). Its field falls monotonically
  from 189 at r 38 to 135 at r 41.5 through illumination alone.

So the value of record is **E3, the picture**: the coin redrawn in
(angle, radius) with a 0.25-unit ladder over r 41.5–46.0 (`_jd7seat.mjs`),
corrected so each photograph's own silhouette is 47.00, and read at reading
magnification. Five band finders across two coins have now failed and the same
picture has worked three times.

All of E1, E1m (angular median), E2, the signed-dark rule and the signed-bright
rule are published per reference and per locus in `_jd4band.json`.

### 1.2 Two instrument corrections, both made before any value was published

**`_jp4unwrap.mjs` returns 0 outside the image.** Out-of-frame is not black; it
is a 255-level step at the frame edge, and on **four of the dime's six
references** the frame cuts inside the unwrap's outer radius. Run as inherited,
the coin-edge finder locked onto the frame on 288–708 columns per reference and
returned edge spreads of **7.7–9.7 %** — all six references would have been
ruled unusable for a geometric gate by my own gates file. `_jd3unwrap.mjs`
marks out-of-frame samples invalid and every consumer skips them; the fault is
in the cent's hashed instrument and is **reported, not fixed there** (§1.1).

**`_jp7edge.mjs`'s max-radial-gradient rule finds the reeded edge, not the
silhouette.** With the frame problem fixed it still returns 45.25–46.94 with
3.7–8.6 % spreads. A second estimator — *background departure*, scanning inward
from outside the coin — returns **46.74–47.08 with 0.07–1.59 % spreads** on five
of six. The cent's published 47.18 / 46.95 / 46.55 came off the gradient rule
and should be re-checked with the background rule before anything else leans on
it. Both are printed in `_jd6edge.json`.

### 1.3 The equivalence run (cent PY6)

My E1 is `_jn5rim.mjs`'s rule with one generalisation declared in the gates file
before any value: the test is `|m − L| > DROP`, not `L − m > DROP`, because a
cameo proof's mirror field is near-black and its rim is *brighter*. Given
`_jn5rim.mjs`'s own parameters and discs, my implementation returns:

```
  nickel-rev.jpg    44.05   (_jn5rim.mjs published 44.05)   EXACT
  nickel-rev-2.png  44.30   (_jn5rim.mjs published 44.30)   EXACT
  nickel-obv.jpg    44.20   (_jn5rim.mjs published 44.15)   one 0.05-unit step
```

**But the generalisation is not innocuous and that must be said.** On
`nickel-obv.jpg` the `|·|` form returns 43.30 where the signed form returns
44.20, and on `nickel-obv-proof.png` 42.60 against 45.70 — because `|·|` fires
on the rim's *lit* inner slope where the signed rule waits for its *shadowed*
one. The two rules measure opposite sides of the same bevel. That is a real
cross-coin comparability problem for the four published numbers and it is a
proposal below (**DM2**).

---

## 2. The phase-2 re-derivation: the published number moved, and it moved the right way

`TOOLS.md` records that `_p2lib.ourRaster` used `sharp.composite()`, which is not
tone-preserving, that it was fixed on 2026-08-13, and that **the dime's phase-2
and phase-2b ratio vectors were measured through it**. They had never been
re-derived.

**§20.1a flat-swatch round trip, all eight dime palette colours** (`_jd8p2old.mjs`):

```
colour     direct   FIXED path   OLD composite path   old error
rim          146         146            139             -7
body         197         197            193             -4
field        212         212            207             -5
motif        149         149            142             -7
deep         114         114            107             -7
hair         126         126            119             -7
cloth        171         171            164             -7
ink           43          43             36             -7
```

The fixed path is exact on 8 of 8. The old path is 4–7 levels low on 8 of 8.

**The two vectors, same art, same patches, same reference:**

| | published | old path re-implemented | fixed path |
|---|---|---|---|
| mean \|Δratio\| | **0.0443** | **0.0443** | **0.0399** |
| worst | 0.1114 `hairOverEar` | 0.1114 | 0.1115 `hairOverEar` |

The old path **reproduces the published number to 5 × 10⁻⁴**, so the attribution
is proved rather than assumed. The re-derived value is **0.0399, −9.9 %**.

**Did it move the published conclusions?** Yes, and in a direction nobody
predicted:

- the value is **better**, not worse. The briefing's expectation was −1.8 % on
  `cloth` to −14.3 % on `ink`; the dime's twelve frozen patches contain **no
  `ink` patch at all** — they are skin, hair and cloth tones whose composite
  error is nearly constant, so most of it divides out against the cheek. The
  largest single move is `chin`, 0.1050 → 0.0734;
- the worst patch is unchanged, so the phase-2b conclusion "`hairOverEar` is the
  residual" stands;
- **the dime's obverse tone is now 0.0011 BELOW its own palette floor** (0.0410
  from `_p2bfloor.mjs`). A drawing cannot beat the floor; what that says is that
  the floor's enumeration of legal rungs is missing at least one combination our
  art actually uses. Reported as a caveat on the floor, not as an achievement.

D3 passes either way — 0.0399 and 0.0443 are both under the 0.0567 gate — so **no
verdict moves**, but the published figure for the best-measured face in the set
was wrong by a tenth of itself and is corrected here.

**The caveat that matters more than the number.** D3's reference of record is
`dime-obv-2.jpg`, a 2015-W cameo proof — the exact class of reference §20.3 names
as the **worst possible tone reference**. There is no struck cross-check
(D3s is `BLOCKED`). The dime's tone score is 0.0399 against a photograph that
§20.3 says should not be used for tone.

---

## 3. What was frozen, reused, and had to be built

**Hashed before the first measurement** (`_jd0hashes.json`, then
`_jd0hashes.json` again with the gates file): 1 subject, 6 targets/snapshots,
6 references, 26 eval libraries. **`_jd0extra.json`**: 15 more, the cent-round
and phase-6 instruments this round reuses, hashed before they were run.

**Reused unedited at their published hashes:** `_jp9edge.mjs` (D6 on the adopted
width-variation metric, D7, the D8 response test), `_jp10tier.mjs` (D10),
`_jp8ours.mjs` (our legend geometry off the shipped SVG), `_jq8contain-v2.mjs`
(D8), `_jq9well.mjs` (D9), `_x6lib/_x6mat/_x6sens/_x6check/_x6dark` (D11, D13),
`_p2score/_p2flat/_p2bfloor/_p2iou/_p2lib` (D1, D3).

**Written this round and hashed on creation:** `_jd1discs.json`,
`_jd4band.json`, `_jd6edge.json`.

**Had to be built, because nothing existed:** the dime's reference-independence
matrix with the fitted-R column, the disc-fit audit with overlays, the polar
unwrap, the coin-edge check with a second estimator, the rim-seat instrument
with its nickel equivalence run, the legend-band reader, the fitted-contour D7
(cent PY3 again), D13-obverse, the old-rasteriser reproduction, and the D12
sheets.

**Nothing hashed was edited.** 55 of 55 byte-identical at the end of the round;
`git status` shows no modified tracked file.

---

## 4. What my eyes saw

**Control first** (`_jd13look.mjs control` → `_jd13-control.png`), read before
the dime and before re-reading any of my own arithmetic. I held four priors: the
jaw line is a uniform stroke; the icon reverse was widened in v1.56.0;
`nickel.o/dime.o` is the set minimum; and my own D13 numbers.

The **quarter** at 26/44/84 px shows: a fat pale rim annulus on every tile; a
solid dark head-blob at 26 and 44 with no interior; a scalloped reeded contour;
a pale specular lens at upper left; and a reverse that at 26 px is a **big solid
dark eagle**. Those are the shared machinery.

Then the **dime** (`_jd13-subject.png`), ours above the photograph reduced to the
same device pixel count:

- **obverse, 26 px.** Ours is a uniform dark blob, the same shape as the
  quarter's, so the blob is machinery. The photograph at the same 19 px is
  *mottled* — dark hair mass at the top, light face, mid-grey neck. That is
  D13-obverse's −0.0788, visible.
- **obverse, 84 px.** Our LIBERTY sits well inside the rim with a broad empty
  gutter outside it; the coin's LIBERTY runs almost into the rim. The coin has
  **almost no bare field** — head, legend, motto and date fill it edge to edge —
  and ours has a six-unit empty annulus. That is D5-rim and D5-band, visible, in
  the same picture.
- **reverse, 26 and 44 px.** This is the loud one. Ours is a pale, spindly torch
  with two thin feathery branches and a great deal of empty field. The
  photograph is a **dense dark mass filling the whole disc**. At 26 px our two
  branches read as two vertical bars.
- **reverse, 84 px.** The photograph's most prominent feature is the ring of
  letters. **Ours draws no letters at all at 84 px** — nor at 120 px. Wave 1
  draws the dime at 62 device px.

The control earns its place twice: the fat rim and the dark obverse blob are
*shared*, so they are not evidence about the dime; the pale reverse is *not*
shared — the quarter's reverse is solid and dark at the same size — so it is the
dime's own.

---

## 5. Instruments I distrust, and why

1. **`_jp4unwrap.mjs`'s out-of-frame handling** (returns 0). See §1.2. Reported
   under §1.1, not fixed there.
2. **`_jp7edge.mjs`'s max-gradient silhouette rule.** Finds the reeded edge. Its
   answers were in-bounds and its response test would pass. See §1.2.
3. **`_jp9edge.mjs`'s fitted-contour identification.** Says "every path on this
   side is authored, so D7's subject is empty" for the dime, because it looks
   for the *cent's* HEAD/HAIR/BEARD opening coordinates. D7-obverse would have
   been silently absent. Cent PY3, third instance.
4. **`_jq8contain-v2.mjs`'s `RESPONSE=1`** still throws `RESPONSE anchor
   missing` at `HEAD`. Cent PY6 reported it; it is still stale, and the D8
   response test is now maintained in two unhashed places.
5. **`_jq67edge.mjs`'s D6** is still the metric Appendix P1 retired (26 of 26,
   29 of 29). Not used for a value here.
6. **`_p2bfloor.mjs`'s palette floor**, which our own drawing now scores 0.0011
   below. A floor a drawing can beat is not a floor.
7. **My own E1/E2**, which returned 41.83 and 41.39 for a 43.75 feature. They
   are published in full precisely so the picture can overrule them in writing.
8. **The dime's D5-band target itself.** Three obverse photographs put LIBERTY
   at rOuter 40.86 / 43.39 / 42.50 — a ±1.29-unit spread, comparable with the
   ±1.5-unit gate — and the disagreement survives re-expressing every radius
   against each photograph's **own** coin edge in the **same** sector, so it is
   not my disc fits (`_jd12check.mjs`). The likely cause is that a coin
   photographed slightly off-axis shows its **reeded side wall** outside the
   face, so the "silhouette" is not the face boundary; the correction differs per
   photograph. D5-band is scored `FAIL` because the miss (−2.86 on rOuter, −25 %
   on cap) is larger than the spread, but the target is weaker than the gate it
   is serving.

---

## 6. Routing plan

**Partition first (§5).**

*Blocked — no specialist can move these; they need an acquisition, and they route
to the judge:*

| row | acquisition |
|---|---|
| D2-reverse, D4-reverse | a **second, independent dime reverse photograph**, ideally a cameo proof reverse — the strike class that gave the quarter device/field separation. `dime-rev.jpg` and `dime-rev-2.jpg` are one photograph (NCC 0.9934, re-confirmed). |
| D3s | a second **struck** dime obverse photograph, plus a dime registration transform (`_dmreg.json` does not exist). |
| D5-band `ONE DIME`, D5-band `IN GOD WE TRUST` | `UNTRUSTED` at degeneracy 1.59×–2.00×; needs a reference whose legend separates from the rim, or a hand annotation at higher magnification. |

*Judge's own work, not a specialist's:* **D5-rim.** `EDGE.field` is one shared
literal across four coins and all four are now measured. This is an owner
decision about a constant, and it is the gate the entire D5 family sits behind:
`coins.js:3222` already records that a legend cap inside its own ±15 % gate needs
r 42.34, which is outside a 41.0 field circle and a D8 breach at every tier. The
dime is the same trap — its LIBERTY wants a cap of 7.9 units reaching r 42.25,
and there is nowhere to put it inside 41.0.

*Repairable, in §5's priority order:*

```
  1. D10-obverse   FAIL 5.56x   -> tier. The 42->44 boundary jump.
  2. D13-reverse   FAIL +0.295  -> tone. THE TOP REPAIRABLE FAILURE. Brief below.
  3. D13-obverse   FAIL -0.0788 -> tone. Icon tier only; the blob is shared machinery,
                                   so this is partly a set problem (see D11).
  4. D5 family     FAIL         -> BLOCKED BEHIND D5-rim. Growing the legend to its
                                   measured size needs the field circle moved first.
  5. D7-obverse    FAIL 111 deg -> silhouette. One knot on the fitted HEAD.
  6. D3-reverse    UNMEASURED   -> tone, but it needs a frozen reverse patch set first,
                                   which is judge work.
  7. D5-HF         UNMEASURED   -> judge; build the instrument, then gate it.
```

**D13-reverse is dispatched first among the repairable**, ahead of D10-obverse's
higher nominal priority, and the reason is stated rather than assumed: D10's
failure is a 0.0878 ink step at a tier boundary nobody sees twice, and
D13-reverse is a **0.20–0.30 error at every tier**, on the side and at the size
the app asks a child to name the coin, confirmed independently by two
implementations, by the RAD=33 control, and by D12. Priority order is a default,
not a rule that outranks the evidence — and it is written down here so the
departure is visible.

---

## 7. Specialist brief — D13-reverse

```
SUBJECT      dime, reverse
DIMENSION    D13 device against field
CURRENT      D mean/field  +0.2004 (26px)  +0.2351 (44px)  +0.2950 (84px)
             ink fraction   ours 0.299 / 0.338 / 0.268   coin 0.734 / 0.741 / 0.748
             restricted to RAD=33, inside the legend (§22.8), it is no better:
             ours 0.8637 / 0.8806 / 0.8939 against the coin's 0.7006 / 0.6431 / 0.6204
             ink ours 0.405 / 0.428 / 0.381 against the coin's 0.678 / 0.744 / 0.758
GATE         |D mean/field| <= 0.05 at 26, 44 and 84 px
LOCUS        disc interior r < 40 viewBox units (RAD=40), ink = below 0.85 x that
             side's own p90 field level, our render at the tier's REAL device pixel
             count and the photograph reduced to the same count, NO UPSAMPLING.
             All four constants are frozen in _x6dark.mjs and are literals.
TARGET       coloringbook/ref/dime-rev-2.jpg          [READ ONLY — hashed]
             ** SINGLE SOURCE. dime-rev.jpg is the same photograph (NCC 0.9934).
                Every reverse number you or I quote rests on one image. Say so. **
EVAL         coloringbook/_x6dark.mjs                 [READ ONLY — hashed]
             coloringbook/judge/_jd10d13.mjs          [READ ONLY — hashed]

MUST NOT REGRESS (current values, re-measured by the judge after you return)
  D8  reverse 0.0000%, depth 0.0000, max r 41.097 at icon
  D9  0 of 180
  D10 reverse 3.87x / 0.80x  (and do not create a new within-tier pop: the
      182->184 legend switch is already 14.2x the within-tier median)
  D11 dime.reverse pairwise minimum 0.0812 (vs nickel.reverse).
      ** BUDGET: you may spend up to 2.0% of that — it may not fall below
      0.0796 — and you must report the cost whether or not you spend it.
      v1.56.0 bought ink 0.174 -> 0.405 for 1.7%; that trade is roughly half
      of the remaining error and half of the remaining budget. **
      The SET minimum is nickel.obverse/dime.obverse 0.0534 and it must not move
      at all: do not touch the obverse.
  D6  reverse 0.2685 (84px) / 0.2720 (190px), gate <= 0.50
  D2  do not add anything that assumes a reverse silhouette target; there is none.

WHAT THE PICTURE SAYS (dime-r0.md §4, _jd13-subject.png)
  At 26 and 44 px ours is a pale spindly torch with two thin branches and a lot
  of empty field; the photograph is a dense dark mass that fills the disc. The
  two branches read as vertical bars. The coin's ink fraction is 2.2-2.8x ours
  at every tier. The QUARTER reverse at the same size is a big solid dark
  device, so this is NOT the shared machinery — it is this motif.

RULES
  - Never describe the coin from memory. Open the reference and measure.
    If the photograph contradicts this brief, the photograph wins — say so.
  - Do not edit the target or the eval libraries. They are hashed; editing them
    voids the round. If you believe an instrument is WRONG, report it with a
    reproduction and continue; reporting a fault is your job, fixing it is mine
    (COIN-JUDGE.md §1.1).
  - EDGE.dime.field is under measurement by me (43.75 vs the drawn 41.0) and is
    NOT yours to change. If a wider device collides with the 41.0 field circle,
    report the collision with its radius; do not move the circle.
  - Report EVERY iteration including the ones that got worse.
  - Do not report a verdict. You report what you changed and what you observed;
    the judge decides whether it passed.
```

---

## 8. What this round could not do, and says so (§8)

- It cannot tell you **whether a child can name a dime**. D11 says the dime
  obverse and the nickel obverse are the closest pair in the whole app at
  0.0534 — closer than any reverse pair, closer than any cross-side pair — and
  that is a pixel metric on two silver discs with the same palette, the same rim
  ring and the same specular arc. The honest statement is that the product's
  single most fragile discrimination is measured, unimproved, and outside any
  one coin's repair scope.
- It cannot **freeze a reverse target**. One photograph, contours that disagree
  with themselves at IoU 0.4466 across a ±15-level sweep, and a leaf count its
  own target file marks `LOW`.
- It cannot say **whether `dime-obv-2.jpg` or `dime-obv-3.jpg` is right** about
  where LIBERTY sits. They differ by 2.5 units in a ratio that cancels the disc
  fit entirely. Something about how a dime's reeded side wall photographs is
  not in any of our models.
