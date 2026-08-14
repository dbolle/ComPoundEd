# Penny (Lincoln cent) — judge round 0

Process: `docs/COIN-JUDGE.md`. Measurements: `docs/COIN-ART-METHOD.md`.
Gates: `coloringbook/judge/penny-gates.md`, written before any value below
existed. Scorecard: `penny-scorecard.json`. History: `penny-history.jsonl`.

**Verdict: FAIL.** 13 pass, 18 fail or unmeasured, 2 N/A, 0 waived, 0 untrusted.
**Nothing in `src/art/coins.js` was touched** — it is byte-identical to commit
`5c1aeb1` (`sha256 565d70716e429ca8…`).

```
  D9   well-formedness        0 of 180 renders faulty                    PASS  (blocking, clear)
  D8   containment      obv   7.9333% out, deepest breach 0.0038 units   FAIL  <- do NOT dispatch
  D8   containment      rev   0.0000% at all nine sizes                  PASS
  D1   obverse silhouette     IoU 0.95404 vs >= 0.95                     PASS
  D2   reverse silhouette     no target could be built (copper on copper) UNMEASURED = FAIL
  D4   rhythm           rev   count error 0, mean 0.048 gaps             PASS
  D4   rhythm           obv   no repeated structural element             N/A
  D3   interior tone    obv   0.1596 vs <= 0.10965 (= 1/2 flat floor)    FAIL
  D3s  tone sign test   obv   two independent struck refs, CORRELATED    PASS
  D3   interior tone    rev   no patch set, no normaliser                UNMEASURED = FAIL
  D13  device vs field  obv   -0.2537 at icon, -0.0558 at mid            FAIL  <- worst on the coin
  D13  device vs field  rev   -0.048 / -0.007 / +0.045                   PASS
  D5r  rim seat         both  coin 44.0 +- 0.8, we draw 41.0             FAIL  <- the headline
  D5   lettering        obv   band -2.29, cap -1.3%, span -31.7%         FAIL (cap PASSES)
  D5   lettering        rev   caps at 53% and 50%, spans -18% and -48%   FAIL
  D5t  lettering tier   rev   NO lettering at all below boxW ~171        FAIL
  D5h  lettering HF     both  no instrument run                          UNMEASURED = FAIL
  D6   edge quality     obv   0.106 of length is uniform-width           PASS
  D6   edge quality     rev   0.995 of length is uniform-width           FAIL
  D7   curve quality    obv   HAIR 144.5 deg, BEARD 95.7 deg             FAIL
  D7   curve quality    rev   statue polygon 94.5 deg, undeclared        FAIL
  D10  tier behaviour   obv   icon->mid 5.44x p90, d(mean) 0.1130        FAIL
  D10  tier behaviour   rev   2.71x and 0.47x                            PASS
  D11  discriminability       baseline set; set ratio 1.52x vs 3.0x      PASS + ESCALATE
  D12  looked at        both  control first, both sides, three tiers     PASS
```

---

## 1. The headline: the cent's own field radius is 44.0, not 41.0

`EDGE` in `coins.js` gives **all four coins the same literal triple** —
full 41.0 / mid 40.5 / icon 42.5 — and `scripts/coin-shared-claims.mjs` flags
it because it was never measured against any of them. The quarter's round 4
measured the quarter at **44.2** off three references and could not act on it,
because one coin's measurement is not evidence about a shared constant.

Measured on the cent, by a different judge, off a different reference set, with
a different instrument:

| | reference | disc p95 | where the coin's own silhouette lands | rim seat |
|---|---|---|---|---|
| obverse | `penny-obv-3.jpg` | 0.25 % of R | **47.18** (definitional 47.00) | **44.33** |
| reverse | `penny-rev-2.png` | 0.64 % of R | **46.95** | **43.15** |
| reverse cross-check | `penny-rev.jpg` | 2.13 % of R | 46.55 | 44.63 |

**Frozen: 44.0 ± 0.8.** Two coins, two judges, two reference sets, **0.2 units
apart**. The shared literal is wrong for the *set*, not for one coin.

> **Corroboration, arriving after this round froze.** The nickel judge ran
> concurrently and independently and committed `71b2134` / `52d7b89`: rim seat
> **44.33** on the nickel (per-reference 44.05 and 44.15), against the same
> 41.0. So the count is now **three coins measured, three answers between 44.0
> and 44.3, one shared literal of 41.0**, arrived at by three judges using
> different references and — the nickel's note says so explicitly — different
> rim-seat definitions. The dime is the only one left. This is recorded here
> because it changes nothing about the cent's measurement and everything about
> what should be done with it: PY1 below asks for a rubric row, and three of
> four is enough to act on.

What it costs, concretely. Our rim band runs 41.0 → 47.0, six units wide; the
coin's runs 44.0 → 47.0, three. `coins.js:3222` already spells out the trap for
the quarter — a cap height inside the ±15 % gate needs r 42.34, which is
*outside* a 41.0 field circle and is a D8 breach at every tier. **The cent is
the same trap with a bigger legend**: its `ONE CENT` wants a cap of 10.4 units
and 136° of arc, and there is nowhere to put it.

This is why the whole D5 family is listed as *blocked behind D5-rim* rather
than dispatched. It is not a lettering repair. It is one shared constant.

### 1.1 How it was read, and why not by a detector

Both band detectors I wrote this round **reported themselves at a search
bound** (§4.1) and neither number is published:

- `_jp5band.mjs` thresholds absolute grey, and on this coin that also selects
  the coin's dark outer edge at r 46 and the Memorial's relief at r 30. It
  returned cap heights of 14–15 units with the baseline sitting exactly on the
  window end.
- `_jp5band-v2.mjs` uses local angular variance, which is the right
  discriminator — and it still bounds out, because the memorial's relief on the
  reverse and the bust on the obverse run inboard of the legend **with no bare
  gutter between**. There is no shoulder to find.

Appendix R3 says a detector's failure is not the artefact's failure, and §2.1
says a hand annotation read off the source is a legitimate frozen target. So
the numbers come off the **polar unwrap** (`_jp4unwrap.mjs`) with a half-unit
ladder (`_jp6zoom.mjs`) — the coin redrawn in (angle, radius), where the legend
cannot be mistaken for anything else. That is Appendix S2's method, used on a
second coin, and it took about fifteen minutes.

### 1.2 One place where I was wrong and the measurement corrected me

Reading the unwrap by eye, I put the reverse's coin edge at "about 46.4" and
started to reason that every radius needed a 1.3 % correction. `_jp7edge.mjs`
— which finds the maximum radial gradient per angular column and reports where
it lands — says **46.95**, i.e. 0.1 % off the definition. The dark band I was
reading is the shadowed bevel *inside* the silhouette, not the silhouette.
Appendix R6 in the other direction: the judge cannot un-read its own eyeball
either, and the fix is the same one — publish what you found and check it.

The correction matters because it is what makes the rim numbers usable: on the
two frame references the disc fits need no correction at all.

---

## 2. What was frozen, what was reused, what had to be made

Everything scored against is hashed in `_jp0hashes.json`, written **before any
measurement**. Nothing was frozen after a number was seen.

**Reused, unchanged, at their published hashes:** `_headmask-penny.json`
(2048 points, `v ≤ 0.16`), `_tonepatches-penny.json` (12 patches),
`_pyreg.json`, `_rvtarget.json` (the penny entry carries a COUNT of 12 taken
**twice on two independent references**, which is §15.1's standard and is the
best-founded target this coin has), `_pyeval.mjs`, `_pylib.mjs`, `_rvnorm.mjs`,
`_x6lib.mjs`, `_x6dark.mjs`, `_jqgeom.mjs`, `_jq8contain-v2.mjs`, `_jq9well.mjs`,
`_jq67edge.mjs`, `_jq10tier-v2.mjs`, `_jq20indep.mjs`.

**Written this round, and hashed on creation before anything was scored against
them:** `_jp1discs.json` (the disc fits) and `_jp4band.json` (the rim seat and
the legend bands).

**Had to be made,** because nothing existed: the reference-independence run for
the cent, the disc-fit audit with overlays, the polar unwrap, the coin-edge
check, our own legend geometry off the shipped SVG, §3's **rewritten** D6
metric, a coin-parameterised D10, D13 for the **obverse**, and the D12 sheets.

**Two instruments were NOT edited even though they blocked me,** because
editing a hashed instrument voids the round (§1):

- `_jq10tier-v2.mjs` hard-codes `'quarter'` at line 64. `_jp10tier.mjs` is the
  same computation with the id as an argument; run on the quarter it reproduces
  v2's four boundary numbers bit-for-bit (0.0504 / 6.36×, 0.0252 / 3.18×,
  0.0895 / 5.98×, 0.0169 / 1.13×). That equivalence is printed by the tool.
- `_jq8contain-v2.mjs`'s `RESPONSE=1` mode throws **`RESPONSE anchor missing`**
  at HEAD: its anchor string is a quarter path that commit `5c1aeb1` rewrote.
  So the containment response test is re-implemented on the *penny* in
  `_jp9edge.mjs`, against the same hashed `lenOutside`/`marks` the value came
  from. **This is a live fault in a hashed instrument and it is reported, not
  fixed** — the file's own comment says it "fails loudly so it cannot silently
  go stale", and it did exactly that. It is the judge's to repair.

---

## 3. The reference audit — the cent's obverse set had never been correlated

The same-photograph trap has hit **five times out of five**, most recently on a
quarter obverse pair nobody had checked. `penny-obv.md` §2.2 calls the cent's
three obverse references "three coins struck in 1909, 2002 and 2025" on the
strength of an **ICP residual**, which is not a correlation.

Run (`_jp2indep.mjs`, reusing `_jq20indep.mjs` and `_jq42indep.mjs` unedited):

```
raw NCC inside 0.90R          -0.139 .. +0.219   (same-photograph line 0.95)
background NCC (1.10..1.40R)  -0.005 .. +0.009
illumination azimuth          -54.4 / 172.8 / 49.7 / -96.9 deg
design NCC vs a MEASURED different-design floor of 0.3114
                              0.515 .. 0.773
```

**The cent's four obverse references are four genuinely independent
observations** — the first reference set of the five checked where the trap
does *not* fire. That is what makes D3's sign test (§12.7) legitimate on this
coin, and it is now backed by a number rather than by an assumption.

Two things I have to report against myself:

- **4 of 7 penny registrations landed at the ±0.03R translation bound.** Those
  design-NCC figures are **lower bounds, not values** (§4.1). Every
  `INDEPENDENT` verdict rests on raw NCC, which is bound-free, so no verdict
  moves — but the column is not what it looks like.
- `penny-rev.jpg` vs `penny-rev-2.png` clears the different-design floor by
  **0.024**. That is a thin margin for a statistic round 4 showed is one-sided.

### 3.1 The disc fit is a located feature and it had never been drawn

Appendix S1 (proposed, not in force) says every radial locus is expressed in
units of a fitted disc and the fit is a located feature §4.3 has never been
applied to. `_jq valley` fitted a padding rectangle on three quarter files for
exactly that reason. So: **three strategies per reference, all printed, all
drawn on their own source** (`_jp3disc-overlay.png`, generator `_jp3disc.mjs`).
I looked at it.

| file | flood | edge-walk | disagreement | p95 | verdict |
|---|---|---|---|---|---|
| `penny-obv-3.jpg` | R 984.97 | R 986.97 | 0.20 % | **0.25 %** | the obverse frame |
| `penny-rev-2.png` | R 372.61 | R 372.04 | 0.15 % | **0.64 %** | the reverse frame |
| `penny-obv.jpg` | R 249.02 | R 250.74 | 0.69 % | 0.60 % | usable |
| `penny-obv-2.jpg` | R 445.83 | R 440.50 | **3.42 % of R** | 1.38 % | **see below** |
| `penny-rev.jpg` | R 249.28 | R 240.88 | **5.20 % of R** | 2.13 % | counting only |
| `penny-obv-4.png` | R 989.97 | R 988.89 | 0.11 % | 0.57 % | tilted (known) |

**`penny-obv-2.jpg` is the file `_headmask-penny.json` was traced from**, and
it is the second-worst fit in the set: the two strategies put its centre 3.4 %
of R apart, and in the overlay the fitted circle visibly runs outside the coin
at the lower left and inside it at the upper right. `_jp7edge.mjs` puts its own
silhouette at r **45.71** against a definitional 47.00 — but with a p5–p95
spread of **9.4 %**, i.e. the estimate is bimodal (a mirror-black field on one
side and white on the other), so **I am not publishing a 2.8 % scale error**.
What I am publishing is that the frozen obverse mask's scale rests on a disc
that two independent fitters disagree about by 3.4 %, and that `penny-obv.md`'s
"sized to ±1.0 %" is optimistic. Re-deriving that mask's scale is judge work.

---

## 4. D13-obverse: the worst number on the coin, and D3 is structurally blind to it

`_x6dark.mjs` — the frozen D13 instrument — is **reverse-only**: its `PAIRS`
table pairs every id with a `*-rev-*` reference. So **the obverse half of D13
has never been measured on any of the four coins.** `_jp13d2d13.mjs` computes
the same quantity with the same frozen constants (r < 40, ink at 0.85 × the
side's own p90 field, our render at the real device pixel count and the
photograph reduced to the same count, no upsampling) for both sides.

```
penny obverse   26px (20 device px)   ours 0.6278   coin 0.8815   Δ -0.2537   FAIL
                                      our ink 0.740   coin ink 0.337
penny obverse   44px (35 device px)   ours 0.7800   coin 0.8358   Δ -0.0558   FAIL
penny obverse   84px (66 device px)   ours 0.8084   coin 0.8093   Δ -0.0009   PASS
```

**Five times the gate at the icon tier.** D3 scores 0.1596 on the same side and
sees none of it, because every D3 ratio is divided by the cheek: a device that
is uniformly too dark against its field has perfect internal relationships.
That is the blindness §3 says D13 exists to cover, and this is the clearest
instance yet.

D12 found it independently and without the number: at 26 px ours is a solid
dark head-shaped blob on a pale disc and the coin is a soft mottle in which the
head is barely darker than the field.

D10-obverse is very likely the same defect seen from another angle — the
icon→mid boundary carries a `d(mean)` of **0.1130**, the largest single tonal
step anywhere on this coin, because the icon tier is a blob and the mid tier is
not.

---

## 5. D12 — what I saw that the numbers missed

Control first (Appendix Q5). Round 0 has no specialist claim to be misled by,
but it has priors, and Appendix R6 says a number I computed myself is as strong
a prior as a sentence somebody told me. Control: **the nickel**, both sides,
same three tiers, rendered and read before the penny. It shares `bust()`,
`coat()`, `struck()`, `reedGeom()`, the field/ring pair and the specular arc
with the cent, and differs in the portrait and the motif.

Artefacts: `_jp12-control.png`, `_jp12-subject.png`, `_jp12-big-obverse.png`,
`_jp12-big-reverse.png`. Generator: `_jp12look.mjs`.

**What the control settled before I looked at the cent.** Three of the loudest
things on our penny are on the nickel too: the very wide pale rim annulus, the
solid-blob obverse at 26 px, and a pale specular sausage lying across the rim
at ten o'clock. **None of those is a cent defect.** The rim one is D5-rim and
is now measured; the blob is D13-obverse; the sausage is `struck()`'s highlight
and is shared by four coins.

**What the eye added.**

- **The rim is the single loudest difference at every tier.** The numbers said
  three viewBox units. In the picture, ours has a fat pale ring taking the
  outer fifth of the disc and the photograph at the same device pixel count has
  a rim you can barely see, with the legend running almost to the silhouette.
- **Our reverse at 26 px is two horizontal bars** — a dark band over a lighter
  band over a line. It reads as a flag, not a building. D13's shape statistic
  is the same finding as a number: our ink bounding box has **aspect 0.40**
  against the coin's 0.93 at that tier, and 0.47 against 1.00 at 84 px. mean/
  field passes at every tier and the *shape* of the ink does not.
- **Our legends float in the middle of the field.** On the reverse there is a
  six-unit bare gutter between `ONE CENT` and the rim that the coin does not
  have. D5-band-reverse-bottom **passes its gate** — our `rInner` is within
  1.13 units — because the gate is stated on the inner extreme and the error is
  at the outer one (−6.38). Appendix S5, live, on a second coin.
- **The reverse draws no lettering at all at 84 px**, the size at which the app
  asks a child to name the coin, and none at 120 px either. The first size that
  draws any is boxW ≈ 171. The quarter had this and it was lowered to 84 in
  round 2; the cent still takes the shared `REV_TEXT_MIN = 135`. In the
  reference panel at the same device pixel count, `ONE CENT` is the most
  legible thing on the coin.
- **The hair reads as five long parallel diagonal strokes** over a smooth mass.
  The coin's crown is a dense wavy field of curls with a part and a crest. This
  is the quarter's "louvre" failure on the cent; `penny-obv.md` §7 flagged it as
  unmeasured and it still is — D6-obverse *passes*, because the metric is width
  variation and these strokes are inside tapered regions.
- **The beard reads as a bib.** Six short vertical bars inside a rounded box.
  The coin's beard is a hanging mass with a jaw line, a cheek hollow and a
  pointed chin.
- **The bow tie is clip art** — a hard geometric bow with a round knot, on a
  coin where the tie is barely visible under the beard. It is also the 173.5°
  knot D7 found.
- **The ear is two concentric C arcs** floating on the cheek; the eye is a
  single dash with no socket.

**Where my eye was wrong, and the record is kept.** At 44 px our colonnade
reads as a comb of *dark* teeth and I wrote down "the tone polarity is
inverted — the coin's shafts are lit". At 380 px the shafts are plainly **pale**
with dark intercolumniations, which is the coin's polarity. The 44 px
appearance is a tier-reduction artefact of shaft width. The note stays as the
record of the correction rather than being deleted.

---

## 6. D2 — the reverse mask could not be built, and it is physics, not a missing photograph

Freeze condition, stated before any value and inherited unchanged from round 2
on the quarter (deliberately **not** softened for a building): min pairwise IoU
≥ 0.97 across the threshold sweep, and two independent references agreeing
≥ 0.95. Locus a frozen literal: r ≤ 0.862 R on a 700² disc-normalised grid, T
swept Tv ± 15 in steps of 5 with Tv the **photograph's** own histogram valley.

```
penny-rev-2.png   valley depth 0.1275   726 components at Tv
                  largest component 1.3% of the locus
                  min pairwise IoU 0.6728            MISSES 0.97

penny-rev.jpg     min pairwise IoU 0.9899            "meets" 0.97
                  largest component 99.3% of the locus  <- DEGENERATE
```

The second row is why §4.2 exists. A sweep that returns *everything* agrees
with itself perfectly. The instrument prints the area fraction beside the IoU
so that cannot be published as agreement, and it is not.

**§4.3, and I looked.** `_jp13d2-penny-rev-2.png` draws the T = 78 contour on
the source: it is a thin magenta sliver along the terrace's shadow line and is
nowhere near the building.

The diagnosis is already in the repository. `penny-obv.md` §2.1 documents four
segmenters failing on the cent **obverse** for one reason — copper on copper,
the device and the field are the same metal at the same brightness, and there
is no plateau anywhere. This is the reverse instance of a known result.

**Per Appendix R3 the verdict is `UNMEASURED`, not `BLOCKED`, and I am not
naming an acquisition.** `ref/penny-rev-artwork.jpg` is **Gasparro's own
plaster model** — §11.1's route, the one that rescued the nickel. It is a
monochrome rendering with real device/field separation and a **drawn border
circle** which is, by construction, the coin's edge. `_rvtarget.json` records
it as having no fittable disc at 19.3 % residual; that is the fitter looking
for the *plaster's* edge. Fitting the **drawn circle** instead is the missing
step, it needs no photograph, and it is the judge's.

---

## 7. Instrument sanity — every response test, and the three that failed

| dimension | test | result |
|---|---|---|
| D1 | `_pyeval` at its published hash; the +0.0019 against the published 0.95213 is attributable to the v1.56.0 shoulder fix moving the coat inside the scored region | attributable |
| D3 | tier sampler recovers field = **151**, `#c98a3c`'s own grey (§22.1) | pass |
| D4 | `_rvlib2.extrema` returns 9 and 13 on combs of 9 and 13, 0 on flat | pass |
| D6 | tapering the longest stroke mark moves the fraction 0.1317 → 0.1168 | pass |
| D7 | `_jq67edge` closed forms: square = 90.000°, relative = absolute, `C` not dropped, arc = 2πr | pass |
| D8 | 20-unit outward translation: obverse 7.7020 % → 19.4296 %, reverse 0.0000 % → 20.9778 % | pass (re-implemented) |
| D8 selection | full candidate set printed on every row: `47(blank,rejected) 41(fill) 41(ring)`; `SELFTEST` reads 40.5 at mid on all five coins | pass |
| D9 | `undefined` injected → caught in 144 of 180, render named | pass |
| D10 | reproduces `_jq10tier-v2` on the quarter bit-for-bit | pass |
| D11 | `_x6check` (32 colours exact, `upN`, closed-form `mad`/`ncc`) + `_x6sens` (7 pairs move, 21 bit-identical) | pass |
| D13 | field recovered as the palette's own grey; **two implementations disagree by ±0.022** | see below |
| disc fits | three strategies per reference, all printed, all drawn on their source | pass |
| independence | control pair of two different designs; NCC bounds printed | pass, with 4 of 7 registrations at a bound |

**Three things failed and none of them is a coin defect.**

1. **`_jp5band.mjs` and `_jp5band-v2.mjs` both returned their own search
   bound.** Reported as failures, not published as values. §4.1 worked.
2. **`_jq8contain-v2.mjs`'s response mode throws at HEAD.** Its anchor is a
   quarter path that `5c1aeb1` rewrote. The file's comment says it "fails
   loudly so it cannot silently go stale" — it did. It is a live fault in a
   hashed instrument, reported and not fixed. The response test was
   re-implemented for the penny instead.
3. **`_jp9edge.mjs`'s own D7 half returned a null result** — "FITTED none",
   because `_jqgeom`'s `mark.tag` is truncated at 200 characters so the closing
   quote of a long `d=` never matches my regex. **That result is not
   published.** D7's numbers are `_jq67edge.mjs`'s, with the paths identified by
   grepping `coins.js` for their opening coordinates (lines 842, 1093, 1252).

And one disagreement worth a round of its own eventually: **D13's two
implementations differ by up to 0.022** on the reverse — `_x6dark.mjs` gives
−0.0261 / −0.0210 / +0.0415 where `_jp13d2d13.mjs` gives −0.0481 / −0.0066 /
+0.0446 — because they resample the photograph differently. That is 44 % of the
gate. Both say PASS at all three tiers, so the verdict is robust; a future round
that needs this number to 0.01 must freeze which resampling is the instrument.

**A fault I found in my own tooling and fixed before anything depended on it:**
`_jp5band.mjs` ran its whole report at module top level, so importing `SECTORS`
from it printed a full set of bound-failure rows into `_jp5band-v2.mjs`'s
console. That is Appendix R4 exactly — `_jq5letter.mjs` doing it with the
retired containment v1 — reproduced in a file written the same afternoon by
someone who had read R4 that morning. It now has a main guard.

---

## 8. Routing plan

**Partition first (§5), then rank.** Four of the failures cannot be moved by a
specialist at all.

### Blocked — route to the JUDGE, with the work named

```
  D2-reverse   UNMEASURED   NOT an acquisition (R3). Fit the DRAWN border circle on
                            ref/penny-rev-artwork.jpg — Gasparro's plaster model —
                            instead of the plaster's edge, and re-run the sweep.
  D3-reverse   UNMEASURED   Needs a frozen reverse patch set and a normaliser patch.
                            Interacts with D2: the patches must be containment-checked
                            against a motif mask that does not exist yet.
  D5-HF        UNMEASURED   Needs an HF instrument pointed at a frozen LITERAL locus.
                            _jq5letter-v2 derives its radius from our own glyphs (R1).
  D5-rim       FAIL -3.0u   EDGE.penny.field, shared by four coins, now measured on TWO.
                            Judge / EDGE owner. This is the gate every D5 row sits behind.
```

### Repairable, in §5's priority order

```
  1. D8-obverse   FAIL 7.9333%  ->  DO NOT DISPATCH. 0.0038 viewBox units deep
                                    = 0.0025 device pixels at the 84px draw; the whole
                                    figure is two coat-drape closing arcs whose endpoints
                                    are authored to two decimals and land at r 41.004
                                    against a circle of 41. Route to the judge as a GATE
                                    RE-DERIVATION (Appendix Q3's depth exemption, which is
                                    proposed and NOT in force, so this round records FAIL).
  2. D13-obverse  FAIL -0.2537  ->  DISPATCH NOW, with D3-obverse. Brief below.
  3. D3-obverse   FAIL 0.1596       Same side, same owner (`tone`), same brief.
  4. D5 family    FAIL          ->  blocked behind D5-rim. coins.js:3222's arithmetic
                                    shows the caps cannot be reached inside a 41.0 circle.
                                    The ONE cheap exception is D5-tier-reverse: giving
                                    REV_TEXT.penny a `min` the way the quarter got one.
  5. D6-reverse   FAIL 0.995    ->  real, and it is a redraw of the colonnade, not a tweak.
  6. D7-obverse   FAIL 144.5deg ->  HAIR's closure knot; the quarter has the same construct.
  7. D7-reverse   FAIL 94.5deg  ->  CHEAPEST ITEM ON THE CARD: declare the statue polygon's
                                    four corners. A documentation act, not an art change.
  8. D10-obverse  FAIL 5.44x    ->  likely falls out of the D13-obverse repair.
```

---

## 9. SPECIALIST BRIEF — dispatch this one

```
SUBJECT      penny, OBVERSE
DIMENSIONS   D13-obverse (FAIL) and D3-obverse (FAIL), fixed TOGETHER.
             This is one brief, not two: they are the same side, the same
             owner, and D3 is structurally blind to what D13 measures, so a
             repair aimed at D3 alone can make D13 worse without showing it.

CURRENT      D13 |D mean/field| against ref/penny-obv-3.jpg reduced to the same
               device pixel count, over r < 40, ink at 0.85 x own p90 field:
                 26px (20 device px)   ours 0.6278  coin 0.8815   D -0.2537
                 44px (35 device px)   ours 0.7800  coin 0.8358   D -0.0558
                 84px (66 device px)   ours 0.8084  coin 0.8093   D -0.0009
               ink fraction at 26px:   ours 0.740   coin 0.337
             D3 mean |Dratio| over the 11 non-cheek frozen patches = 0.1596
               worst: coat 0.373, hairMid 0.286, hairCrown 0.275,
                      forehead 0.191, temple 0.171

GATE         D13  |D mean/field| <= 0.05 at EACH of 26 / 44 / 84 px
             D3   mean |Dratio| <= 0.10965  (= 1/2 the flat-drawing floor 0.2193)
             Both gates were written down in penny-gates.md before either value
             was computed.

TARGETS      coloringbook/_headmask-penny.json     [READ ONLY - hashed 94e58055954f1802]
             coloringbook/_tonepatches-penny.json  [READ ONLY - hashed b368bdbdb4306da8]
             coloringbook/judge/_jp1discs.json     [READ ONLY - hashed de72c3e35287a49d]
             coloringbook/judge/_jp4band.json      [READ ONLY - hashed d92b8c7b57f2a743]
             coloringbook/ref/penny-obv-3.jpg      [READ ONLY - hashed fe1b8cf868a62560]
             coloringbook/ref/penny-obv.jpg        [READ ONLY - hashed bc663dc496f2d2b1]
EVAL         everything in coloringbook/judge/ and coloringbook/_py*, _x6*
                                                   [READ ONLY - hashed]
             run: node coloringbook/judge/_jp13d2d13.mjs d13
                  node coloringbook/_pytone.mjs

FROZEN LOCI, AS LITERALS
  D13  disc interior r < 40 viewBox units; ink = below 0.85 x the side's OWN
       p90 field level; our render at the tier's REAL device pixel count and
       the photograph reduced to the SAME count; NO upsampling anywhere.
       Tiers 26 / 44 / 84 px. None of these is a function of our drawing.
  D3   the 12 patches in _tonepatches-penny.json, in disc coordinates.
       The cheek is the normaliser and is identically 1.000.

MUST NOT REGRESS  (current values; the judge re-measures every one of them)
  D1  obverse IoU            0.95404   (>= 0.95)
  D3s sign test              2 independent struck references still used;
                             penny-obv-2.jpg is a CAMEO PROOF and stays OUT of
                             the tone vector (§20.3). Do not "fix" a patch
                             against it.
  D6  obverse fraction       0.1056 at 84px, 0.1317 at 190px  (<= 0.50)
  D7  HEAD.Lincoln           69.1 deg worst, 0 knots over 75
                             (HAIR 144.5 and BEARD 95.7 are KNOWN failures and
                              are NOT yours this round — do not make them worse)
  D8  obverse                7.9333% at 76px, deepest breach 0.0038 units.
                             The fraction is already a FAIL; the DEPTH must not
                             grow. Anything over 0.01 units is a new defect.
  D8  reverse                0.0000% at all nine sizes
  D9  well-formedness        0 of 180
  D10 obverse                icon->mid 5.44x p90, abs d(ink) 0.0658.
                             REPORT THE ABSOLUTE NUMERATOR, not just the ratio:
                             raising the within-tier p90 lowers this ratio
                             without improving anything (Appendix R2).
  D11 discriminability       penny.o/penny.r 0.0750 (the set's cross-side
                             minimum), penny's nearest other coin 0.1453,
                             overall set minimum 0.0534 (nickel.o/dime.o),
                             set ratio 1.52x. Measured at the ICON tier, which
                             is where you are working — a darkness change on the
                             cent obverse can move this and it must be costed.
  tests                      npx playwright test tests/coins.spec.js
                             tests/pawcoins.spec.js -> 18 passed

D12 IS A BINDING DELIVERABLE, NOT A COURTESY
  Render a contact sheet at 26 / 44 / 84 px, three panels per tier:
    (a) the round-0 baseline penny obverse  - the CONTROL, rendered FIRST
    (b) your penny obverse
    (c) ref/penny-obv-3.jpg reduced to the same device pixel count
  `node coloringbook/judge/_jp12look.mjs` builds (a) and (c) already.
  You render it and hand it over. You do NOT report a verdict on it.

WHAT THE JUDGE ALREADY KNOWS, so you do not spend the round rediscovering it
  - The obvious move - lighten the head fill - is the one that will work, and
    it is also the one that can spend D11. At 26px our ink fraction is 0.740
    against the coin's 0.337: more than half the excess is AREA, not level.
    Look at whether the icon tier should be drawing fewer marks rather than
    paler ones.
  - `coat` at 0.373 is 34% of D3's whole remaining error and it is a DELIBERATE,
    DOCUMENTED decision (coat()'s own comment: the head has to be the darkest
    thing on the coin). It is also SHARED CODE - the nickel uses coat(). If you
    move it, PALETTE.penny.cloth is penny-only and coats/nickel must be re-checked.
  - `hairCrown` and `hairMid`: the two references disagree by 0.34 here
    (0.543 vs 0.879). §12.7 says do not chase one photograph. Our 0.818 and the
    floor's best rung 0.636 give IDENTICAL mean error across the two.
  - `forehead` and `temple`: the two references disagree on the SIGN. Left bare
    on purpose; penny-obv.md §6 records that drawing the temple hit the metric
    and drew a BLINDFOLD.
  - Band-map the region BEFORE you draw it (§13.2). The cent's face is a RAMP,
    not a step, and a flat fill can always be sized to hit a patch median.

RULES
  - Never describe the coin from memory. Open the reference and measure. If the
    photograph contradicts this brief, THE PHOTOGRAPH WINS - say so, loudly.
  - Do not edit anything in coloringbook/judge/, coloringbook/ref/, or any
    frozen target. They are hashed; editing one voids the round. If you believe
    an instrument or a target is WRONG, report it with a reproduction the judge
    can run without trusting you, and CONTINUE. Reporting a fault is your job;
    fixing it is the judge's, and a round is not void for it.
  - Report EVERY iteration including the ones that got worse.
  - Do not report a verdict. You report what you changed and what you observed;
    the judge decides whether it passed.
```

---

## 10. Verification of this round

- `npx playwright test tests/coins.spec.js tests/pawcoins.spec.js` — **18
  passed**, exit 0 (written to a file, exit code echoed, never piped through
  `tail`).
- `src/art/coins.js` byte-identical to `5c1aeb1` throughout; `git status` shows
  no modified tracked file. Every generated-copy test writes to a temp
  directory.
- One browser at a time; everything else is `sharp`. A second judge was running
  on the nickel and no file was shared: this round wrote only
  `coloringbook/judge/penny-*` and `coloringbook/judge/_jp*`.
- No frozen target or eval library was edited. Two were reported as faulty
  (`_jq8contain-v2.mjs`'s response anchor, `_jq10tier-v2.mjs`'s hard-coded id)
  and worked around, not touched.
