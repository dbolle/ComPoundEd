# Backlog

Reorganized 2026-07-12 around the approved growth-ladder & economy roadmap
(research-backed: curriculum fluency progressions + mastery-contingent reward
design). Work top-down. Decision: **no back-pay grant** at earning launch —
reconsider after calibration.

## Where we are

- 🟢 **THE DIME REVERSE'S FLAME IS RE-DRAWN AS A FIVE-TONGUED CROWN, AND IT IS
  THE FIRST ELEMENT EVER SCORED ALONE (v1.98.0).** The owner's method: score
  ONE drawn element against the coin's own mask, because a face is a sum and a
  sum hides which term is wrong — this face had four whole-face rounds and
  three reverts, twice while T1 rose. `judge/_dr13elem.mjs` is the instrument.
  - **Element 2.1.0 (the flame) on `dime-rev-proofbright`: OUTSIDE 5.76 % →
    3.44 %, FILL 74.19 % → 95.15 %.** The old path was a teardrop with two
    horns whose single tall tongue stood ON the axis, where the coin has a
    notch; and it closed to a POINT at (50, 33) where the coin's flame is 9.85
    units wide on the head.
    Verify: `node coloringbook/judge/_dr13elem.mjs score 2.1.0 flame`
  - **THE OFF-AXIS FLAME IS THE DIE, AND A CONTROL PROVED IT.** The standing
    comment refused the photograph's 1.9-unit shift as a tilt or a light. The
    separating measurement is to quote the flame's centroid as an offset from
    the TORCH'S OWN AXIS (head + clean shaft rows + foot on the same mask), so
    registration cancels: **+0.82** on proofbright and **+0.78** on unc2005,
    while those two files' own registrations differ by 0.95 units in OPPOSITE
    directions. So it is +0.8, and it is drawn.
  - **The residual OUTSIDE is the reference's registration, measured not
    asserted.** A rigid x-shift sweep puts proofbright's minimum at dx +0.45
    (**0.56 %**) and unc2005's at dx −0.45 — each at its own registration
    offset. Shape-only residual 0.56 % against the old flame's 3.38 % at ITS
    own optimum, where its fill could not pass 76 % at any shift.
  - **Published, not tuned around (R2):** OUTSIDE on `unc2005` 11.62 % →
    17.35 %, with FILL 85.11 % → **99.62 %** — our flame strictly contains that
    mask and the 17 % is the two masks' 0.45-unit erosion difference.
  - **Refused:** no lifted tips (the two files' tips disagree by 0.45 to 2.25
    units under different erosions; a two-point extrapolation is not a
    measurement, so tips are drawn 0.15 BELOW proofbright's mask) and no
    corrected flame WIDTH (the slope between the two widest rows is −4.2 per
    unit eroded where a slab gives −2.0, so they are not the same feature).
  - **Still open on this face, and NOT this element's scope:** the olive and
    oak branches, the head/collar, the shaft, the acorn and the legends have
    not been scored element-by-element. `_dr13elem.mjs list 2.1` enumerates
    all 37 nodes; only 2.1.0 has been through this gate.

- 🟢 **THE QUARTER OBVERSE WIG IS RE-AUTHORED AS ONE COMB (v1.96.0). Ledger
  D1 FIXED** — the largest open art item, and the first art change since
  v1.92.0. Every wig mark is now an **integral curve of the coin's own measured
  direction field**, so **zero centreline crossings** is a property of the
  construction rather than a gate to argue past.
  - **The field is now a field, and its smoothing scale is measured.**
    `judge/_qw1field.mjs` measures theta(X, Y) on a 0.5-unit grid over 3358
    nodes; leave-one-out cross-validation over the three references picks
    sigma 1.0 at **9.08 deg**, and the curve is nearly flat. That is the floor:
    no drawing can follow this field more closely than a perfect tracing of two
    references follows the third.
    Verify: `node coloringbook/judge/_qw1field.mjs`
  - **The published metric was asking the wrong question of a curved mark.** Its
    chord midpoint is up to 2.99 units off the mark itself. Metric A
    10.3 → 9.0 deg median and — the finding it was raised on — sign 12:2
    shallow → **7:7**. Metric B (drawn tangent, nine stations a mark)
    **14.3 → 2.3 deg median, 84/126 → 8/126 stations out, 10/14 → 0/14 marks**.
    Verify: `node coloringbook/judge/_qw2gen.mjs` · `node coloringbook/judge/_qo5field.mjs`
  - **Regressions published, not tuned around (R2):** T1 quarter-obverse
    0.573 → 0.562 (still 32/32), crown tone ~1.336 → ~1.301 against the coin's
    1.421, and eight pairs of marks crowd by up to 0.50 units.
  - **Two alternatives refused with numbers.** Re-spacing the seeds opens the
    crowding to 0.17 but takes ridge duty to 0.462, **above** the coin's
    0.350–0.443 band; shortening the marks costs up to 45 % of a mark's length
    and empties the front of the wig. As drawn, ridge duty 0.362 → 0.391 and cut
    duty 0.359 → 0.409, both in band.
  **What this round found and did NOT close:**
  - **The coin's wig is not one laminar family.** At x 44–52, y 22–34 — the
    temple, in front of everything we draw — the field runs −57° to −82°, a
    near-vertical strand family this drawing does not draw at all. Recorded as
    unmeasured; drawing it is a new mark set, not a correction to these.
  - **At the nape the references disagree by 28°** (grooves[4]: 80.0 and 52.2,
    the third at coherence 0.095) because the coin has a rolled **curl** there.
    A direction field is the wrong model for a spiral. Three references cannot
    settle it — this one wants a fourth, high-resolution, same-design.
  - **D3 is untouched**: the shared `EYE_MARK` still has no derivation.

- 🟢 **INSTRUMENT DEBT: the library was editing the art, and five of its
  response tests were dead (v1.95.0). No art changed** — `src/art/coins.js` is
  byte-identical to v1.94.0. Ledger **A9, A24, A25, A27, A28, A29, A30, A35
  FIXED**, **A31 partly**, **A17 tabled with the drift measured**, each with a
  verify command in `docs/FINDINGS-LEDGER.md`.
  - **`_sw8sync.mjs` wrote `src/art/coins.js`** — unguarded, at module top
    level. Running the library edited the subject. Now report-only;
    `WRITERS.md`'s rule restated to cover `src/art/`.
  - **The A30 sweep found five stale anchors, not one.** Every guard fired
    correctly; the defect is that **nobody runs the library**, so four gates
    were dead across two releases while their verdicts shipped. Enforcement
    moved into `npm test` (`tests/judge-anchors.spec.js`).
  - **T1's registration walked outside its declared bounds on 64.1 % of pairs.**
    Superseded beside; T1 stays 32/32 and every margin widened.
  - **T1 runs in a worktree.** Eight modules tracked, no hash moved.
  **What this round found and did NOT close — needs an owner:**
  - **A38 — `_jq8contain-v2.mjs` no longer matches its own frozen hash.**
    Recorded as `512f61d5…` in six places; the file is `28717096…` after the
    2026-08-24 A11 repair edited it **in place** rather than superseding it
    beside. The most-cited instrument in the library is the one whose
    reproducibility anchor is broken. Restore-and-v3, or correct the record.
  - **A31, five hashed instruments** still compute a private `tierOf`
    (`_jp10tier`, `_jn8tier`, `_jq9well`, `_jq10tier-v2`, `_jq8contain-v2`).
    Their per-tier rows are now guaranteed identical, so they are degenerate
    rather than wrong. Editing them voids published hashes; the honest fix is a
    v2 the next time a round needs that measurement.
  - **C2 is still open**: what `hairFill`'s sign does at 48 and 54 px.


- 🟢 **TIER-ERA DEAD CODE removed from `src/art/coins.js` (v1.93.0). No art
  changed — the byte-identity partition reads 0/60, and a wider 240-cell grid
  is identical too.** Ledger items **B1–B5 all FIXED**, each with a verify
  command. `tier` and `boxW`-keyed gates are gone: `tierOf`, the `tier`
  parameter, 12 branches, four whole `icon` drawings, `fine` ×5, 11 `min:`
  gates, the icon placement trios, `EDGE.field`'s per-tier object, and
  `EWICON`/`EBODYICON` — which held a **second, superseded set of wing tips**.
  Code lines 1658 → 1540; nine false comments retracted beside their
  corrections rather than deleted.
  **New, from B6 — things that look dead and are not:**
  - ~~**`_jd14d1resp.mjs`'s response anchor is now stale.** The response test
    fails open — the A11/A13 pattern.~~ **FIXED v1.95.0, and two claims here
    were wrong: it failed CLOSED (it threw), and the sweep found FIVE stale
    anchors, not one.**
  - ~~**Seven instruments keep a private `tierOf`.**~~ **Nine, not seven, and
    only four print `icon`/`mid` rows. Partly fixed v1.95.0** — `_jq10tier.mjs`
    retired by move, `_jl1cap.mjs` corrected; five are hashed and left with the
    reason.
  - **C2 (`hairFill`'s sign at `mid`) is moot as written** — that branch could
    not run. The real open question is what the sign does at the 48 and 54 px
    the app actually draws.

- 🟢 **STALE INSTRUMENTS closed (v1.91.0). No art changed.** Ten of the
  fourteen ledger items this round owned are FIXED, with a verification command
  beside each in `docs/FINDINGS-LEDGER.md`. Four instruments retired by MOVE at
  their original hash; `_rimfit.mjs`, `_freeze.mjs`, `_jpdiscs.mjs` added.
  **What is still open and needs an owner:**
  - **A22 — 63 of 286 instruments cannot run outside the main checkout.**
    `.gitignore` keeps the eval libraries (`_blnorm`, `_blfit`, `_pylib`,
    `_pyeval`, `_rvnorm`, `_qtedge`, `_x6lib`, …) out of the repo, and
    `_jp0hash.mjs` prints MISSING for 6 of the penny round's own frozen
    libraries. §1.1's promise that any published number can be reproduced does
    not hold for 22 % of the library. **Track them, or say plainly that it does
    not hold.** *(v1.95.0 answered this for the PRIMARY GATE's eight modules by
    tracking them — no import and no hash moved, so the precedent is cheap and
    is the one to copy. The rest of the 63 are unswept.)*
  - **A6 — the note's border ratio is 2.6352/2.6393, not 2.5610/2.5827**, and
    the shared anisotropy constant `1.3145` is 2.5–3.6 % low. This is the
    registration everything on the note hangs from; it touches `EAG.ry`,
    `PYR.ry`, the obverse vignette and the D2d gate. `_jb1fit.mjs` cannot be
    repaired in-repo — it is a wrapper around a gitignored library.
  - **A9 — nine instruments still register on the area disc**
    (`_jc5unc`, `_jd2proof`, `_jd2rule`, `_jl4mode`, `_jl4fieldtest`,
    `_nk17ladder`, `_nk17eye`, `_nk17grid`, `_nk1cmp`, `_nk2env`). Each needs
    its own re-derivation, not a blind repoint.
  - **A21 — three instruments still hold stale copies of our art**
    (`_sw7gen.mjs`'s `OVAL` is the load-bearing one: `coatPath()` and
    `outsideOval()` are computed from it).
- 🟢 **INSTRUMENT DEBT: the primary gate scored four denominations out of five,
  and its reference pool had never been audited.** v1.91.0. Ledger **A1, A2, A3**
  closed; **A21–A28** and **D15** opened. No art changed.
  - **`_jt4pool.mjs` (new) audits the pool with no disc fit.** Two statistics of
    different kinds must agree before it calls a duplicate — a content-box MAD
    and a difference-hash Hamming distance — because `_jrefintake.mjs` records
    that a fit-based detector once passed two byte-identical files as
    `INDEPENDENT`. The pool still contains a live example: `qp1964-obv-pad.png`
    and `qp1964-obv.png` are the same image (MADbox 3.5, dHash **0**) and their
    registered design NCC is **0.019**.
  - **Two pool corrections, before/after published.** `dime-rev.jpg` removed
    (one photograph with `dime-rev-2.jpg`: MADbox 1.4, dHash 1) — **exactly one
    transfer cell moved, by 0.001, but the dime-reverse CONTROL was 0.995, a
    photograph sorted against itself; the true values are 0.647/0.776/0.779.**
    `dime-rev-proofbright.png` added. T1 is **32/32** before and after; its
    control is now leave-one-out over every reference, **11/11 per face**, where
    it used to hold out one file per class and so never tested 14 of 22.
  - **And one correction RETRACTED, which matters more than if it had stood.**
    `nickel-obv-4.jpg` was removed — this round's new fitter disagreed with
    `_rvdisc` by 14.8 % of R and re-sorted it as a *dime*, and `_jn1discs.json`
    records it `ambiguous: true` at p95 62 %. Then the decisive test was run,
    which should have come first: leave-one-out **under the registration T1
    actually uses**. It sorts **nickel, 0.671**. Chasing the discrepancy found
    the real bug — **in the new fitter**, which let one stray background pixel
    set the radius. Fixed by flooding rather than thresholding: dR 14.78 % →
    **3.13 %**, p95 12.22 % → **2.59 %**, and `nickel-rev-proof.png` improved
    with it (3.16 % → 0.15 %). Two references were nearly blamed for a bug in
    the instrument measuring them (`A21`).
  - **`_jt5note.mjs` (new) gives the note a real gate.** The ledger said T1 could
    not be extended because it samples a disc. T1's circle is in ONE function —
    the map from grid (u,v) to source pixels — and making it per-subject (rim for
    a coin, printed border for a note) leaves everything downstream unchanged.
    Control mode A **26/26**, mode B note rows **4/4**, null **52/52** (every
    coin photograph offered to the note question comes back "coin"). Mode A
    (design, aspect normalised away) **coins 32/32 — the same verdict T1 reaches
    from an independent implementation** — **buck 4/8**. Mode B (shape-aware)
    buck **7/8**; its coin rows are advisory and so is its control, which had to
    be fixed mid-round: it was blocking the note verdict on a quarter-vs-nickel
    margin of 0.016. **A statistic that may not fail a round may not gate one.**
  - 🔴 **What it found in the art, for whoever takes the note next.**
    **Our note reverse sorts as a PENNY at all four sizes** once the aspect is
    normalised away, which puts a number on `D13` ("the left half is empty" — an
    empty field with one central device *is* a coin). And **the note is the wrong
    rectangle** (`D15`): our printed border fits at **1.8353** against the
    photographs' **2.5643**, our paper at **1.7944** against the physical note's
    **2.3525**. `coins.js:146` says the box is deliberate — it preserves the old
    `.coin.buck` CSS layout — so this is an **owner decision**, and T5 prices it:
    resampling to the right aspect, changing no printing, moves the shape-aware
    score **0.267 → 0.726**.
  - **Still open, reported not edited** (both in files hashed into other rounds'
    frozen sets): `_jq20indep.bestReg`'s refine is unanchored and walks outside
    its declared search bounds; and **T1 cannot run in a worktree**, because it
    imports three gitignored modules — the ledger's A5 defect, in the primary
    gate. Thirteen vetted references also sit unused while three T1 rows carry n=2;
    the evidence is published and the decision left to the judge, because
    enlarging the pool changes what the gate means.

- 🔴 **DIME LEAVES loop 2: REVERTED by the judge, measurements KEPT.** Mixed
  result and the render decided it. **The olive improved** — the stem became
  visible between the leaves for the first time, which is exactly what the
  round's best finding was for. **The oak over-corrected**: petioles became long
  straight bars with leaves floating at their ends, reading as a **TV antenna**
  rather than foliage, where the coin's oak sits close to its own stem. And the
  **acorn regressed** — it was a distinct blob in open field and is now merged
  into the leaf above it, which is the feature the owner specifically had
  restored in v1.84.1. T1 rose (0.419 → 0.461) and was again not the arbiter.
  **KEEP AND REUSE — `_dr12leaf.mjs` is retained:**
  - **THE COLLINEARITY FAULT, which nobody had named, and which is the real
    reason the stem disappears.** A blade at angle `rot` projects its width onto
    the offset axis magnified by **1/sin(rot)**, so the 38° lowest inboard leaf
    at 8.3 wide covered **13.5 units of offset** and swallowed the stem. Both
    references show the stem as a **separate mark with bare field on both sides
    from y 41 to y 61** (pb y52: `4.5-12.4 | 15.8-16.6 | 19.3-31.5`); ours read
    `5.3-28.5`. One constant — putting the petiole at `rot × 0.35` rather than
    collinear with the blade — moved our inboard edge to 12.97 against the
    coin's 12.4/12.8. **This finding is sound and should be carried forward.**
  - **The crown was a fork where the coin has one apex.** `rot` 72/77 put the
    two tips 7.8 apart with **6.2 units of bare field between them at y 27**;
    both references come to a single point at offset 15.8–16.9 and widen
    downward. The crown springs at y 40.5/41.0, not 39.5/40.0, and the terminal
    leaf's measured standoff is **0.00 on both files — it is sessile.**
  - **One blade size for seven nodes is wrong.** Six zero-erosion reads run
    11.63–15.52 long and **5.56–9.57 wide** — width varies **1.72×**, length
    only 1.26× — and the drawn blade had been sized off the two narrowest only.
  - Measured standoffs: olive 3.19/4.28/4.87 (pb), 2.93/5.83/4.28 (unc); oak
    **7.39/3.91 (pb) but 3.51 (unc)** — note the oak's own references disagree
    by 2×, which is very likely why the oak overshot and the olive did not.
  **FOR LOOP 2b:** keep the collinearity tilt and the crown apex; treat the oak
  petiole length as **unresolved** (its two references disagree 7.39 v 3.51) and
  err short — the coin's oak foliage sits close to the stem. **The acorn must
  remain a separately readable blob**; check it explicitly at 40× before
  concluding.

- 🔴🔴 **T1 — THE PRIMARY GATE — HAS NO `buck` ROW. "32/32" NEVER INCLUDED THE
  $1 NOTE.** `POOL_BY_SIDE` in `_jt1transfer.mjs` is `{penny, nickel, dime,
  quarter}`, so 32 = **4** denominations × 2 faces × 4 sizes. The judge repeated
  "T1 32/32" in eight commit messages and to the owner as though it covered the
  set; it covers **four fifths of it**. This is the third instance of the exact
  locus fault that file documents about its own predecessors — an instrument
  pointed at the wrong place — and it is the most consequential, because §0
  names T1 the primary gate. It cannot be extended by adding a row: T1
  registers via `discOf()` and samples a **disc**, and a note is not a disc.
  The note round wrote `_bxEt1note.mjs` (obverse-vs-reverse, control 4/4 first,
  8/8) as a stopgap; a real note gate needs a rectangular registration.
- 🔴 **T1's dime-reverse pool counts ONE PHOTOGRAPH TWICE.** It lists
  `dime-rev.jpg` *and* `dime-rev-2.jpg`, which measure **raw NCC 0.9977**
  (judge-verified) and are the same shoot. Every T1 dime-reverse figure
  published as **n=3 is really n=2**, including the ones used to accept and to
  reject rounds on that face. The quarter pools are clean — they happen to
  exclude both bad quarter files — so this is the only contaminated row.
- ✅ **Five of six published buck D2 FAILs are PASSes**, as suspected.
  Recomputed from the **live** SVG against the judge's own frozen target: D2a
  IoU 0.9989, D2b 0.9991, centres 0.007/0.005, semi-axes +0.06 %, separation
  53.75 exact. The sixth is **real**: D2d-eagle ry/rx 1.3941 v a predicted
  1.3145, **+6.06 %**, and it fails because the gate assumes one anisotropy for
  two rims the note draws differently (1.281 / 1.394).
  Cause of the false FAILs: `_jb3seal.mjs` and `_jb14d1.mjs` both carry
  **stale hardcoded copies of our own geometry** (`_jb14d1.mjs`'s `OURS` left
  `coins.js` at v1.83.0), and `_jb3seal.mjs` cannot even run in a worktree —
  it imports a gitignored helper. Both still ship and still publish false
  verdicts. **An instrument holding its own copy of the subject is the bug.**

- 🔴 **DIME BRANCHES: round REVERTED by the judge, measurements KEPT. The next
  round's brief is here.** The owner reported the branches "need significant
  work"; the round confirmed it and measured it, then over-corrected into
  something less recognisable, and **T1 rose while the drawing got worse** —
  own score 0.336 → 0.451, margin 0.141 → 0.270, the first movement ever on
  this face. Looking at it is what caught this. At 40× the coin's olive is a
  **sprig**: lance-shaped leaves attached along the stem, alternating, pointing
  up and out, with two small fruits. The round's version reads as a **tulip** —
  a three-petal flower head on a bare stalk with two paddle leaves — and at
  38–84 px both branches read as scattered specks. Recognising real currency is
  the objective, so this fails §0 regardless of the gate.
  **THE MEASUREMENTS ARE SOUND AND MUST BE REUSED — do not re-derive them.**
  `_dr9branch.mjs` is kept (it floods the FIELD inward rather than
  thresholding, which is what closes a proof's specular flutes and line-art's
  hollow leaf bellies — a plain threshold called the shaft 0.2 units wide) and
  it is **null-tested against `_dr8shaft.mjs`'s seven shaft widths by a wholly
  different estimator**: mean error 0.00 sd 0.24 and −0.01 sd 0.35. It reports
  that **`dime-rev-2.jpg` fails that null test by 63 units** — the file
  *everything on this branch was originally drawn from*, and the same file
  `_dr8shaft.mjs` already refuses to publish a width from.

  | foliage rows (run ≥ 3.0 units) | olive | oak |
  |---|---|---|
  | proofbright | 28.25–57.75 (**29.50**) | 28.75–58.25 (**29.50**) |
  | unc2005 | 29.50–58.00 (**28.50**) | 31.75–58.50 (**26.75**) |
  | **ours (shipping)** | **22.00–66.00 (44.00)** | **24.75–65.00 (40.25)** |

  At y 60 the coin carries 1.2/0.0 and 2.0/1.5 units — **bare stem**. Ours
  carries 12.0 and 8.8, standing on E PLURIBUS UNUM and on the acorn. And
  **ours is one object where the coin's is four**: eroded until the leaves let
  go, the coin's olive breaks into four blobs on *both* references at centres
  agreeing to 0.7 units; ours does not break at all — a single 197 u²
  component, 37.9 × 22.1.
  **Seven leaves a side is CONFIRMED, not the error.** One isolated blade is
  ≈20 u²; the four olive groups are 49/52/20/38 → 2+2+1+2 = 7, independently on
  both references. D4's blocked count was never the problem.
  Four claims in `coins.js` are refuted and should be retracted when the art is
  re-authored: **"bigger leaves, not more of them"** (the trade that caused
  what the owner saw); **"olive blade 18.6 × 5.5"** (extrapolates to 14.52×6.75
  and 11.63×5.56); **"one uniform factor cannot hit both"** for the oak
  (11.8/8.6 = 1.372 v 5.5/4.2 = 1.310, a 4.7 % difference — 1.34 lands inside
  2.5 % on both, and was never checked); and **the stem refusal** (stem
  measures 15.9, sd 0.6 over ten reads, against our 14.3).
  **CONSTRAINTS FOR THE RE-AUTHORING ROUND, since the numbers alone led one
  round astray:** the branch must read as a sprig of foliage *attached to a
  stem* at 38 px — not a flower, not detached blobs. Reduce the span to the
  measured ≈28.5–29.5 and open the field **without** detaching leaves from the
  stem and **without** dropping below seven a side. The render at 38/48/54/84
  is the gate; T1 is not, and this round is the proof.

- ✅ **WITHDRAWN: "the quarter obverse's D3 rests on ONE struck photograph."**
  It rests on **three**. The quarter-obverse round settled the pool with
  numbers: `quarter-obv.jpg` v `quarter-obv-2.jpg` design NCC **0.9959** (one
  photograph counted twice — confirmed) and `quarter-obv-4.jpg` 0.2460–0.2920
  against a 0.2318 floor (the 1999+ state quarter — confirmed, and it was
  cited as evidence in `coins.js` in three places, now corrected). But the
  1932 NGC scores **0.6171 / 0.6331 / 0.5062** against a 0.2402 floor and is
  registration-clean on every bound. Usable struck set: `quarter-obv.jpg`,
  `quarter-obv-3.png`, `quarter-obv-1932ngc.jpg`, rim-fitted to p95
  0.24 / 0.24 / 0.05 % of R. The n=1 weakness recorded here for weeks was an
  artefact of nobody scoring the 1932.
- 🔴 **THE QUARTER'S WIG DIRECTION FIELD IS MEASURED, WRONG, AND THE FIX IS
  REFUSED — this is a brief for a re-authoring round, not a defect to nudge.**
  `RELIEF.Washington`'s header claims a measured field (−7.3 / +10.9 / **+54.1**
  / +20.5°) and argues "a single angle would draw a combed sheet; this is a
  field". Re-derived band-passed with four null tests: **+1.4 / +18.6 / +38.8 /
  +25.2** — the shape survives, the numbers do not. And **the art never
  followed it**: at our own 14 wig marks' midpoints ours−coin is 12 of 14
  negative, **median 10.3°, worst 37.8°**, 9 of 14 out by more than the
  between-reference spread at that same point. Every resolved mark is too
  shallow.
  **Why it was reverted, which is the valuable part.** Rotating each mark
  rigidly about its own chord midpoint (so length, width, curvature and
  midpoint are preserved and D6 is unchanged *by construction*) takes the error
  to **0.1° median, 0 of 14 failing** — and puts **8 centreline crossings into
  a wig that had 0**, collapsing the 380 px render into a starburst. The cause
  is structural: the marks are an interleaved stack, so turning members
  individually makes them converge. A crossing-guarded greedy subset keeps only
  4 of 9 and discards the two *tightest* reference agreements, and which four
  survive is order-dependent. **The wig has to be re-authored as a set, not
  corrected mark by mark.**
- ⚠️ **The quarter obverse is the last face still using the shared `EYE_MARK`,
  and its shape is UNMEASURED.** `eye: [8.7, −2.7]` — a 6.66-unit flat lid over
  a 2.94-unit filled circle — with no derivation recorded anywhere. Placement
  is fine (pupil centre lands inside the coin's eye on all three files); the
  form is not: the eye is ~3 viewBox units (15 px on the best file) and the
  brow merges with it at every threshold on all three. **Both faces that ever
  measured their own eye threw this glyph away** — the nickel's absence of one
  was v1.79.0's finding.
- 🔎 **Flagged for the judge, outside any face:** `qp1963-obv-pad.png` and
  `quarter-proof-ebay.jpg` show **background NCC 0.459**, by far the largest
  off-diagonal in the matrix — suggesting one photographic setup, i.e. a
  possible independence failure in a pool nobody has re-checked.

- ✅ **Instruments no longer name machines — `_paths.mjs` (2026-08-23).** The
  redaction removed the username; this removes the cause. Two rules: no tracked
  file contains an absolute path (everything derives from `import.meta.url`),
  and anything genuinely machine-specific — LAN address, ports, scratch dir —
  lives in **`judge.local.json`, which is gitignored**, read via `local()`. A
  value that is not in the repo cannot be committed to the repo.
  `judge.local.example.json` is tracked as the template.
  This also fixed a second-order bug worth naming: the hardcoded paths pointed
  at the MAIN checkout, so an instrument copied into a round's worktree
  **measured the main checkout's `coins.js` while appearing to measure the
  round's** — the same class as the symlink trap, and equally invisible in the
  output. `_jx0link.mjs` now finds the main checkout with
  `git rev-parse --git-common-dir`, which is the correct derivation from inside
  a linked worktree and needs no configuration at all; it refuses to run in the
  main checkout (tested), and linked 217 entries correctly from a worktree.
  Three one-off partition scripts (`_nk-part`, `_nk-part2`, `_part-motif`) were
  **retired rather than repaired** — `_jp9partition.mjs` supersedes them.
  ⚠️ **19 retired instruments keep the `USER` placeholder.** Retirement is
  supposed to preserve an instrument at its old hash (COIN-JUDGE 1.1) and the
  redaction has already broken that for these files. They are inert historical
  artefacts and are not runnable as-is; the alternative was publishing a
  username. Recorded here rather than quietly.
- 🔴 **A PRE-EXISTING exposure on the public remote, owner's call, not acted
  on.** Commit `45394e6` (2026-07-12, public ~6 weeks) contains a stray
  `.claude/settings.local.json.tmp.…` — 100 permission rules carrying the
  **home-server LAN IP (16x)** and the **username (27x)**. Not introduced by
  the 2026-08-23 push; removed from the tree in a later commit but present in
  2 published commits. **No credentials, tokens or keys** (scanned), the IP is
  **RFC1918** and unroutable, and **no kid name appears in it** — the terms
  that leaked are an internal address and a username.
  Access data is thin and the gap is the point: **0 forks**, 0 stars, 0
  watchers; 22 clones from 9 unique cloners with **0 views and 0 referrers**
  over the last 14 days, which is a crawler signature rather than human
  interest. GitHub retains only 14 days, so the first ~5 weeks — the bulk of
  the exposure — is unmeasurable, and there is no per-object access data
  anywhere, so nothing can say whether that blob was ever fetched. A purge
  would be effective on GitHub's side (no forks) but cannot retract a clone.

- 🔴🔴 **The pre-push privacy gate FAILED OPEN, and it failed open exactly when
  the leak was newest.** The scan read `git log … | grep -qiF -- "$term"` under
  `set -o pipefail`. `grep -q` exits the instant it matches; the upstream
  writer then takes SIGPIPE; pipefail turns the whole pipeline non-zero; and
  `if` reads non-zero as **"no match"**. So a detected leak was reported as
  clean. It only misfires when the match happens early enough that the writer
  still has output buffered — meaning the gate was reliable for a term buried
  deep in history and **silently useless for one in the most recent commits**.
  Proven with a synthetic leak in the newest commit: the old form printed
  "private-term scan clean" and exited 0. Fixed by testing with a herestring
  (`grep -qiF -- "$term" <<< "$msgs"`), which has no pipeline and no SIGPIPE.
  Response-tested four ways: clean tree → 0; bare term in the newest commit
  message → 1; term concatenated into a path in an added line → 1; allowlisted
  word alone → 0.
  ⚠️ Two further faults found in the same hook. Its added-lines check passed
  the all-zeros SHA to `git diff` with `2>/dev/null` when pushing a branch for
  the first time, so **every added line went unchecked on exactly the push that
  publishes a branch** — now uses the empty-tree hash. And the gate had never
  actually reached its added-lines check before, because the message check
  always failed first.
- 🔴 **A real leak this caught: the username in 20 tracked files.** Hardcoded
  absolute paths (`/home/<user>/compounded/…` and scratchpad paths) in judge
  instruments, present in **43 of 74 unpushed commits**. `origin/main` was
  clean, so nothing had escaped; redacted across the whole unpushed range with
  `filter-branch`, verified zero occurrences in every message and every blob of
  the range, with `src/`, `tests/` and `package.json` byte-identical
  afterwards. **Live instruments should derive paths from `import.meta.url`
  rather than hardcoding — still to do; the redaction only removed the name.**
- 🔴 **NOTHING IN THIS REPOSITORY MAY CHARACTERISE A PRIVATE TERM.** Not its
  length, not its shape, not how many times it occurs, not which words contain
  it, not why it needed special handling — in code, comments, docs, or commit
  messages. This rule exists because the privacy machinery had become its own
  disclosure: a tracked allowlist names the very words that contain a term, and
  the tracked comment explaining *why* a term needed one supplied its length,
  its occurrence count and the surrounding word family. From a public checkout
  that is enough to enumerate candidates and confirm one by its hit count. The
  secret was never committed; the description of it was almost as good.
  **The fix removes the need to explain anything in public.** The allowlist is
  gone. Matching policy now lives per-term in the private, never-tracked terms
  file — `<term>` for substring (the default and the strict one), `<term>|word`
  for whole-word only — so the one term that needed different treatment is
  handled without any public artefact mentioning that it exists. Substring
  remains the default because a term concatenated into a path, hostname or
  identifier is a real leak that whole-word matching would miss.

- 🔄 **Ten-face review sweep, no hints given, one face at a time.** Each round
  is told only to find anything off or never evaluated. Motivated by v1.78.0:
  removing the tier system means details that never drew below 76 px now draw
  at 38 px, so anything inherited from a shared default has been shipping
  unlooked-at. **Done: penny obverse (v1.80.0 — two findings).** Remaining:
  penny rev, nickel obv/rev, dime obv/rev, quarter obv/rev, buck obv/rev.
  The pattern is holding across three consecutive rounds now: **the defects are
  features that were never measured on their own face**, not constants that
  drifted. Both cent findings were authored whole in `eb4c947` (v1.55.0) and
  untouched for 24 rounds; the nickel's eye did not exist as a face-local
  feature at all.
  ⚠️ **And T1 could not see any of them.** 32/32 before and after on the
  nickel's eye to 3 d.p.; on the cent the tie is score-neutral and was taken on
  the measurement alone. **Looking at the render is the gate that finds these.**
- 🔴 **The area `discOf()` fails IN KIND on a cameo proof — fit the rim.**
  Found by the cent round. The mirror field photographs near-black, is counted
  as background, and the fit encloses only the frosted device: on
  `penny-obv-2.jpg` R = **395.7** vs a rim fit's **450.0 (−12.1 %)**, centre
  **7.0 viewBox units** out in x. Every feature measured on that file lands
  seven units from where it is. This is a different failure from the
  −0.8 %…−5.1 % area-vs-rim bias already recorded — that is a bias, this is a
  wrong object. **Scope:** T1 is safe (it registers through `_rvdisc.fit`,
  which reads 445.8 there) and frozen `_jp1discs.json` is correct at 445.83;
  the fault is in the **private copies** of the area `discOf()` carried by
  ladder/overlay instruments (`_nk17grid.mjs` and family). Every remaining face
  with a proof in its pool is exposed — the dime has three.
- ✅ **The scope check every round needed was re-derived by hand each time —
  now an instrument.** `_jp9partition.mjs` renders all 5 ids x 2 sides x 6
  sizes on both sides of a change and hashes the bytes, so a round's claim to
  have touched ONE face is checked structurally instead of trusted. This is
  the check T1 cannot do: T1 scored **32/32 before and after** the nickel's
  6.5-unit eye error, identical to 3 d.p. (v1.79.0) — a gate blind to a defect
  is equally blind to one you introduce.
  Validated four ways before first use: **null** (two distinct checkouts at
  d19a503 -> 0/60), **response** (across the eye commit -> nickel.obverse
  alone, 6/60), **self-test** (same dir twice -> refuses, exit 2), and
  **size-dependence** (across the tier removal -> all 10 faces move at
  24-84 px but not at 380, because 380 was already the `full` tier; the one
  face that also moves at 380 is nickel.obverse, which is exactly the later
  eye commit). It carries the two traps that have each cost a round: the
  **stale base** (the Agent tool's own worktree isolation checks out ~25
  commits behind, so the before-side is named and its commit printed) and the
  **symlink trap** (a symlinked `.mjs` resolves relative imports against the
  link target, measuring one checkout twice — absolute-path import avoids it,
  and the self-test proves the two modules are distinct objects).
  `scripts/round-setup.sh` builds round worktrees at the dispatch commit for
  the same reason, linking the gitignored `ref/` and `node_modules` in.
- ⚠️ **Do not merge the branch `worktree-agent-af59d13f68c79bc97` (56e2fc5).**
  It is a superseded copy of the 174-instrument retirement — `main` already
  has all 177 files — and it **commits `node_modules` as a symlink blob**
  (mode 120000), the captured artefact of the incident that destroyed the
  toolchain and needed `npm ci` to restore. Left in place as evidence, never
  to be merged.
- ✅ **The gate was 45+ minutes and one test was nearly all of it — fixed in
  v1.66.0.** `tests/countingpath.spec.js`'s first test ran **42.6 minutes
  alone**, longer than the other 458 combined; it now runs in **96 ms**, and
  the whole file in 11.5s. None of it was the code under test —
  `buildCountingPath` does all 2,400 iterations in ~30 ms. The three property
  tests sweep 12 tables x 200 seeds x 3 chains and wrapped every check in an
  `expect()`: ~**72,000 stack-trace captures** at ~35 ms each.
  **It hid itself twice.** Playwright's `timeout: 120_000` cannot interrupt a
  synchronous loop, so a test 21x over the timeout still reported a pass; and
  the `list` reporter prints only on completion, so grinding is
  indistinguishable from hanging. Several full-suite runs were killed at test
  455 believing they had stalled, leaving **orphaned workers spinning at 100%
  CPU** that made every later run slower — two of them were eating half the
  machine before anyone looked.
  The fix swaps `expect()` for a plain `ok()` throw **inside the sweeps only**,
  same conditions and same strictness, `expect()` kept for the aggregates.
  Messages now carry the failing case. **Mutation-tested at all three converted
  sites** (wrong answer / two chains sharing a run / two chains sharing a
  shape) — each went red, source restored and verified clean afterwards.
  ⚠️ **The general lesson:** a synchronous test cannot be timed out by
  Playwright, so "it passed" is not evidence that a test is not pathological.
- 🔴 **A test that could poison its own server permanently.**
  `tests/lifecycle.spec.js`'s restore test **purges** the fixed id `res-kid`,
  and purge is irreversible by design. The test server allocates its sync dir
  once at launch and `reuseExistingServer: true` keeps it alive between runs,
  so a run that died between the purge and the janitor left a tombstone that
  failed **every later run on that server** — a two-minute wait for a restore
  button that could never appear. Fixed in v1.66.0 by cleaning the id before
  the test as well as after; verified against a deliberately poisoned server
  (9.3s pass, where the real failure was a 2.0m timeout). No assertion weakened.
- 🔴🔴 **D7-TANGENT IS ESCALATED: it measures AUTHORSHIP, not curvature — and
  this undermines the D7 re-score shipped in v1.66.0.** `crToBezier`
  (`coloringbook/_nkbuild.mjs`) builds each knot's incoming and outgoing
  controls from the **same** centripetal neighbour formula, so every unedited
  path is **C1 by construction** and reads tangent ≈ 0 however sharply the
  drawn outline turns. Verified by reading the generator, not inferred from
  data. Five for five: quarter `HAIR.Washington` chord 102.0 → tangent **1.2**;
  cent `HAIR.Lincoln` chord 144.5 → **1.0**. `BEARD` is the only hand-edited
  path and the only one that registers.
  **The ladder that settles it:** chord turn of the *flattened, drawn* outline
  at 0.5–8 unit spans puts the shipped beard tip at 81.7…103.7 and the
  **as-fitted version of the same corner** at 47.9…126.8 — harder at every span
  ≥ 2, **and it passes**. D7 ranks two revisions of one tip in the opposite
  order to the drawing.
  v1.66.0's "almost every published D7 failure was the metric" is **true but
  for the wrong reason**: those paths pass because they are unedited
  Catmull-Rom output, not because anything showed them smooth. **Any D7 repair
  must score the drawn outline at a declared span, not knot tangents.** That is
  now the fourth proven rubric fault, alongside D6-blind-to-width,
  D7-chord-never-curvature, and D6/D8 worsening on a shorter correct outline.
- ⚖️ **RULED: `BEARD` knot 7 is a declared corner (Appendix P2), no geometry
  changed.** Three candidates reach a clean D7 pass and all three round the
  point off. The photographs **cannot resolve it**: the best reference gives
  16.35 px per local unit so the disputed rung is 2–8 source pixels, and all
  three show one continuous lock-and-whisker relief with **no beard/hair
  boundary** — the coin has no exposed corner there because it is a junction
  between two masses we draw and the die strikes as one.
  ⚠️ Still owed: **where declarations live.** The content currently sits beside
  the constant, which is this file's convention; P2 says the scorecard, by
  index. Indices: `HEAD.Roosevelt` 23, `HAIR.Roosevelt` 0 and 16, `BEARD` 7.
- 🔴 **`BEARD` is no longer a fitted contour, and the scorecard still says it
  is.** The frozen fitter output has 13 knots; the shipped path has 14, and
  knots 7–13 have all moved (4.89–13.70 units) while 0–6 are byte-identical.
  The half that moved is the jaw half, which was never fitted — a hand-typed
  polyline. The penny scorecard's D7 `locus` still reads "the three paths
  `_pybuild.mjs` fits from the frozen mask".
- 🔴 **The judge's own tooling has two live traps.**
  (a) **Symlinked instruments measure the wrong tree.** `coloringbook/*` is
  gitignored except `judge/**`, so specialists symlink the rest in — and a
  symlinked `.mjs` resolves its **relative imports against the main checkout**.
  `_x6dark.mjs` measured somebody else's tree and printed identical numbers
  before and after an 860-character change. Only `_x6dark`/`_rvnorm`/`_rvdisc`
  are symlinks and only `_x6dark` reads `src/`; every `judge/*` file is real.
  (b) **`_jb11d11.mjs json` and `_jb10d13.mjs json` overwrite frozen hashed
  artefacts** from a documented CLI flag, with no guard and no warning. A
  specialist can void a round by typing an argument.
- 🔴 **The quarter reverse device boundary is unmeasurable with what we hold.**
  Two instruments failed in four configurations — a connected component that
  bridges wingtip to legend at *every* threshold and survives 1.2 units of
  opening, and a ray scan riding its bound on 97/180 rays. The only
  device-separating references are cameo proofs, already recorded as oblique to
  p95 4.8–11.1 % of R, which is **bigger than the feature**. That is nine
  instruments across five subjects failing this way, each replaced in minutes
  by a ladder overlay. **D2-reverse stays UNMEASURED.**
- 🟡 **n=1 is now n=1-and-a-bit: the nickel has a two-reference BAND.** A round
  broke the confound experimentally rather than arguing it — shrink the
  measuring disc until it provably cannot contain edge pixels and the near-edge
  points still agree 5/5 at 9.7°, while the identical sweep on the front (where
  the references are at the null) gives 42–49°. **Scope: five grid points, 3.5–5
  units inside the silhouette. Not "the back".** Beyond that the second
  reference decays to the null. This overturns v1.69.0's "the agreement is a
  silhouette-edge artefact", which the judge repeated in its own report.
  The cent's whisker boundary and the quarter obverse's tone are **still n=1**,
  and the acquisitions below remain the highest-value work available.
- 🔴 **THE JUDGE'S OWN CHECK VOIDED EVERY ROUND IT VERIFIED — fixed in
  v1.71.0.** `_rescore.mjs` runs `_x6mat.mjs`, which unconditionally rewrites
  `coloringbook/_x6-run.json`, and that file had been put in the hashed frozen
  set. Every specialist's first mandated check destroyed a member of the set it
  was checking; its stored hash was stale on top of that (`93252d…` stored,
  `0e3f23…` actual and deterministic). A run **output** is not a frozen
  **target**; the set now excludes run artefacts as it already excluded the
  append-only history logs.
  🔴 **Still open, and worse:** `coloringbook/_x6mat.mjs` is a **symlink**, so
  in a worktree `import.meta.url` realpaths to the main checkout — its write
  lands in the *main* tree (hitting concurrent rounds) and its
  `import('../src/art/coins.js')` reads the *main* checkout's art. **D11 via
  `_rescore.mjs` in a worktree measures the wrong tree.**
- 🔴 **`_jn15agree.mjs`'s frozen sample list omits three samples its own
  generator returns clean** — `(-28,10)`, `(-32,-2)`, `(-32,2)`, all back-most,
  and precisely where the nickel's n=2 band turns out to live. The published
  61.2° was over 15 of 18 available samples; with all 18 it is ≈55.0°. Also:
  `_jn2indep.mjs`'s file list does not include `nickel-obv-unc2004.jpg`, the
  file the entire strand direction field is measured on.
- 🔴 **RETRACTED: the quarter's "ridge duty" was never a measurement of the lit
  rolls.** `_jw14cross.mjs` discards a lit roll entirely, because a roll is a
  **flat-topped plateau**: a top wider than the prominence window gives
  co-equal maxima, the minimum between them has the same grey, prominence is
  exactly 0.0. Judge-verified: **of six kept ridge candidates, ZERO sit on any
  of the five `base` rolls**; three are bare wig between cuts. The §4 tell is
  clean — a 1.7× width change leaves ridge duty bit-identical while cut duty on
  the same renders moves. **The figure "ridge duty 0.348 against 0.350–0.443"
  came from round 9 and the judge repeated it in two briefs and in both docs.
  It is retracted.** Any future statement about the lit rolls needs an
  instrument that can see a plateau.
- ⚠️ **A FOURTH D6 mode: Δnumerator = Δdenominator = 0 across a 2× width
  change.** The list is now: 100 %-numerator (honest ornament); 100 %-denominator
  (a shorter, more correct outline — no regression chargeable); Δnum = Δden ≠ 0
  (less stroke length — not an improvement); and Δnum = Δden = 0 (blind
  entirely). **R2 needs clauses for the last two.**
- 🔴 **Frozen sets must be generated from the COMMITTED dispatch tree.** A
  specialist was handed a hash file listing five instruments that did not exist
  at its dispatch commit, because the judge generated the set from a later
  working tree. A fresh worktree could not pass §1 at all. The round hashed
  them in place, confirmed the digests and reported it rather than waiving the
  check — but the next one might waive it.
- ⚠️ **A THIRD kind of D6 movement, and it is not an improvement.** v1.71.0's
  D6 fell 17.86 % → 13.91 % with the numerator moving — so R2 is satisfied on
  its face — but **Δnumerator equals Δdenominator exactly**, because every mark
  removed was already uniform-width. No mark became less uniform. Alongside
  100 %-numerator (honest ornament) and 100 %-denominator (a shorter, more
  correct outline), this is "there is simply less stroke length". **R2 needs a
  third clause: a ratio that falls because its subject shrank is not a
  result.**
- 🔴 **THREE FACES NOW REST ON n=1, and that is the project's real blocker.**
  Not a rubric problem and not a drawing problem — an evidence problem:
  - **cent** whisker boundary: only `penny-obv-2.jpg` supports it; the other
    two struck references have no contrast there and the discriminator
    correctly refuses.
  - **quarter obverse** tone: after removing the state quarter and collapsing
    the duplicate pair, one struck photograph (judge ruling above).
  - **nickel** strand direction across the front wig: the only independent
    reference is degenerate there (coherence 0.36, disagreeing by up to 88°),
    and the image the field was measured on is a **re-encode** of the file
    already in use, NCC 0.9674.
  **The acquisitions are now specific, and they are worth more than any queued
  round:** a second *struck business-strike* quarter obverse under diffuse
  light; a third *struck* cent obverse with a frozen disc fit; a plain
  business-strike dime reverse under diffuse light; and a genuinely independent
  high-resolution nickel obverse. Until these exist, several gates are tuning
  to a single photograph and cannot be trusted to a decimal.
- 🔴 **The nickel's EXISTING back ridges are ~60° off the coin.** Same tensor,
  same grid as the new front courses: mean 61.2°, median 59.0°. The overlay
  shows the new courses lying along the strands while the untouched ones cross
  them. The new work was **trimmed to stop clear** — untrimmed, one course
  passes 0.12 units from an existing ridge, and two families crossing at 60–70°
  read as a lattice. Its own round. Also there: nine pre-existing spacing
  violations, worst 0.07 units apart; the eight new marks add zero.
- 🔴 **The cent's whisker boundary rests on ONE reference (n=1).** Only
  `penny-obv-2.jpg` supports it; on the other two struck references the frozen
  `beardJaw` patch is *less* textured than `cheek`, so the discriminator has no
  contrast and correctly refuses. The between-reference spread cannot be
  discharged. Those boundary numbers are a hand-checked overlay reading, **not
  a gate-grade target** — and the two references **disagree in sign** at the
  mid-jaw, so the front of the jaw was deliberately left alone.
  **Outstanding acquisition: a third struck cent obverse with a frozen disc
  fit.** ⚠️ Also open on this face: whether the front of the jaw wants cut
  grooves rather than mass (evidence points that way; `RELIEF.Lincoln`), and
  whether the 16.75 units of bare cheek left at x = −4 belong to `BEARD` or to
  `HAIR` — only `HAIR` can close it.
- 🔴 **Two frozen disc fits for `penny-obv-3.jpg` are live at once.**
  `_pylib.mjs` says cy 997.3 / R 984.97 — which is what the tone patches are
  expressed against — while `judge/_jp1discs.json` says cy 993.56 / R 986.97,
  which is what `_jp13d2d13.mjs` uses. 3.7 px, 0.23 local units. One artefact,
  two geometries, and nothing anywhere saying which is authoritative.
- 🔴 **`_jh8locus.mjs`'s self-test is stale and fails silently.** On an
  untouched tree it prints `end marker not found` for both `HAIR.Lincoln` and
  the `HEAD.Lincoln` **response test** — the check that D1's IoU *can* move —
  and then carries on. An absent check reads exactly like a passing one.
- ⚠️ **`ref/penny-obv-4.png` is unusable for texture**: a hashed obverse
  reference with a frozen disc fit whose entire bust is uniform granulation
  with no strands anywhere. Wants a line in `REFERENCES.md`.
- 🔴 **`_jb14d1.mjs` cannot measure the note's D1 and has not been able to
  since v1.63.0.** Its `OURS` is a frozen literal of a superseded drawing and
  the file never imports `coins.js`; it prints `0.1496 FAIL` whatever the art
  says, failing a response test by construction. True value: **1.0000 at every
  tier**. Related: D9's response test perturbs `HEAD.Washington`, which the
  note no longer uses, so **D9 no longer covers the note at all** — pointing it
  at `VIGNETTE.head` restores it.
- 🔴 **The note's obverse has no D2 target and cannot get one from what we
  hold.** The two obverse photographs disagree by **0.90 units in X** on where
  the figure sits inside the frozen oval (mask IoU 0.582), and this side has no
  printed-border fiducial to register against. A target that disagrees with
  itself by 0.42 IoU cannot score art to 0.05, so the round refused to freeze
  one. **Judge call owed: BLOCKED or UNMEASURED.**
- ⚠️ **The note's two sides now read at different weights.** The obverse is a
  dark vignette ground with light devices; the reverse is still light-on-light.
  At 26–38 px that difference is visible. Flagged by the portrait round, not
  acted on.
- 🔴 **The quarter's n=1 problem is NOT solved, and the judge's earlier
  optimism here is withdrawn.** `coloringbook/ref/quarter-obv-1963ccby.jpg` is a
  1963 **struck** business-strike Washington quarter obverse under flat diffuse
  light, CC BY 2.0, absent from the D3 candidate set — and the judge flagged it
  as likely to take this face from n=1 to n=2. **It does not.**
  Measured with `judge/_jq43ccby.mjs`, which runs `_jq42indep.mjs`'s own
  imported comparison on an extended file list and **reproduces four of its
  published figures exactly** before reporting anything new (the first version
  of that file failed the check — my mask ignored `SPAN` — and it refused to
  report, which is the only reason the result is trustworthy):
  - at the standard bounds, design NCC **0.0787–0.1630** against every file,
    with **7 of 8 comparisons riding the registration bound**. That is a §4.1
    non-answer, not a "different design" verdict — the coin in the photograph
    is visibly tilted and the ±8° search cannot reach it.
  - **widened to ±30° and ±0.09R it still cannot be placed**: best 0.1888
    against a design floor of 0.2402, argmax *still* on a bound.
  **Verdict: UNMEASURED.** The coin is the right design by eye, but the
  instrument cannot corroborate it, and "the instrument cannot look here" is
  not "the answer is no". It is not added. The acquisition below is still open.
  ⚠️ The lesson is the session's recurring one and this time it was the judge:
  I saw the right coin under the right light and reported it as a likely fix
  before measuring whether the pipeline could use it.
- ⚖️ **JUDGE RULING (2026-08-22): the quarter obverse D3 candidate set is four
  files that are really ONE piece of usable evidence.** Re-derived by the judge
  with the project's own frozen `_jq42indep.mjs`, whole matrix printed:
  - `quarter-obv-4.jpg` is a **DIFFERENT DESIGN** against every other file —
    design NCC 0.2460 / 0.2507 / 0.2576 / 0.2881 / 0.2920 against a 0.2318
    floor. It is the 1999+ state-quarter obverse. **RULED OUT of the D3
    candidate set.**
  - `quarter-obv.jpg` and `quarter-obv-2.jpg` score **0.9959** against each
    other. **One photograph. They count as one reference, not two.**
  - Three files ARE independent and same-design and are **absent from the
    table**: `qp1963-obv-pad.png`, `qp1964-obv-pad.png`,
    `quarter-proof-ebay.jpg` — but all three are **proofs**, which §20.3 calls
    the worst possible tone reference.
  **So after de-duplicating and removing the wrong coin, the quarter obverse's
  D3 rests on a single struck photograph (n=1)** — the same position the cent
  is in. That materially weakens the case for chasing the D3 miss and
  strengthens the decision not to revert round 9: we would be tuning tone to
  one photograph. ⚠️ The edit to `_qtlib.DISCS` is **deferred** — it is a
  frozen artefact and three rounds are in flight; changing it now would void
  them. Apply when the slots are free, and re-hash.
  **Outstanding acquisition, now concrete: a second STRUCK (business-strike)
  quarter obverse under diffuse light.**
- ⚖️ **JUDGE RULING OWED, not yet made: where corner declarations live.**
  Appendix P2 says an authored polygon "declares its corners in the scorecard,
  by index", and **no coin in this project has ever done so** — the dime's own
  scorecard says as much. The dime round showed why it matters: its two
  surviving over-75 knots are *exactly* the two seams where the fitted outer
  run meets the hand-authored run, which is where P2 says a declaration
  belongs. Indices owed: `HEAD.Roosevelt` 23, `HAIR.Roosevelt` 0 and 16,
  `BEARD` 7. Until this is ruled, D7 reports genuine corners as failures.
- 🔴 **D3-obverse on the QUARTER is failing, and round 9 caused it.**
  0.1447 → **0.1927** against a gate of ≤0.1791 with no regression permitted.
  Judge-re-derived with the frozen `_jq3tone.mjs` at both revisions. Round 9
  reported a per-patch tone cost and the judge read it as local — **nobody
  converted it into the aggregate, which is where the gate lives.** Not
  reverted: shapes come before tone by owner decision and round 9 fixed a real
  shape defect. The real repair is **groove duty at the patch scale**
  (`RELIEF.Washington` pitch/opacity) — its own round, and it is the one that
  actually closes this. ⚠️ Turning `hairLit` off would clear the gate
  (0.1390) and was **refused**: the target cannot decide it (seven photographs
  span ~3× the effect, and the two reading "wig darker" are one photograph at
  design NCC 0.9959), it contradicts the owner's cross-coin palette decision,
  and with the flag off the quarter drops out of family at 84px.
- 🔴 **No corner declaration exists for any coin.** Appendix P2 says an
  authored polygon declares its corners in the scorecard by index; none does.
  The dime round showed its two surviving over-75 knots are **exactly the two
  seams where the fitted outer run meets the hand-authored run** — which is
  where P2 says a declaration belongs. Indices owed: `HEAD.Roosevelt` 23,
  `HAIR.Roosevelt` 0 and 16, `BEARD` 7. **Judge ruling owed, not specialist
  work.**
- ✅ **FIXED 2026-08-23 — `deploy/sync-server.mjs` no longer self-starts when
  something imports it.** Its guard compared the entry point's BASENAME as a
  suffix of its own URL, and `tests/server.mjs` imports it:
  `"…/sync-server.mjs".endsWith("server.mjs")` is **true**, so every `npm test`
  bound `0.0.0.0:8092` for a listener the tests never use and concurrent suites
  died on `EADDRINUSE`. That is why every specialist round this week was handed
  a distinct `PORT` as well as a distinct `TEST_PORT` — **no longer needed**.
  Not only a test problem: **any** script whose filename ends `server.mjs` and
  imported this module would have silently started a real sync sidecar against
  the family's data directory. Now compares resolved paths, which is exact.
  Response-tested three ways — run directly it still binds and answers HTTP
  200; imported it does not start; a near-miss basename does not start it —
  and the full suite is green **without** a distinct `PORT`.
- 🔴 **The other harness collision is still open.** Fresh git worktrees check
  out an **old default commit** (`be6cb73`, v1.54.0) rather than the dispatch
  commit, and contain no `coloringbook/` or `node_modules`. Every specialist
  this week has had to reset and symlink before measuring; one that did not
  notice would silently measure a tree twenty versions old. **This is the
  highest-value harness fix left** — it is the only one that can silently
  produce wrong measurements rather than a loud failure.
- ⚠️ **The frozen-hash convention has a wrinkle:** `*-history.jsonl` files are
  **append-only evidence** and are in the hashed set, so recording a verdict
  makes the next check report them as CHANGED. Exclude history logs when
  regenerating the frozen set; they are a log, not a target.
- **v1.66.0**, schema v19 (saves v19), full suite green on both CI
  lanes, deployed
  on LAN (https://compounded.lan + :8091) + GitHub Pages (CI-gated);
  versions in Grown-Ups footer, releases in CHANGELOG.md.
- Big-kid mode: ×1–12 and ÷ tracks (Leitner, adaptive speed bar, hints,
  achievements, heatmap), 25 dogs + wardrobe + grooming + reward chips,
  echo-first fact intros, "Meet the table" lessons (👋 from any table
  round), Counting Path warm-up, frontier earning (mastery nickels, set
  Paw Bucks, polish pennies, sitting dimes), wallet + ledger.
- Bridge: Adding + Taking Away (7 waves each, think-addition), Track 1
  tiles (Quick Look, Number Friends, Teen Numbers), Cozy Corner pets,
  piggy bank, cross-track suggest.
- Store **gear assets shipped** (8 wearables incl. crown/tiara, 8 toys) and
  the **"opening soon" teaser** is live on pack + wallet. No store yet.
- Little Pup: 18 games (see docs/TRAIL.md — the count was wrong in two
  places until the registry made it derivable, and is now read off it),
  ten-frame quantity
  layouts, staged patterns
  (one dimension at a time), CVD-safe palette, **real mastery tracking**
  (little.skills first-try streaks; known = 3 in a row), adaptive 5→7→10
  range, guided recount on misses (`GUIDED_RECOUNT` flag rolls back).

## Prioritized

1. ~~Phase 4a earning engine~~ ✅ shipped v1.0.0 era (milestones-only).
2. **Calibration window — CURRENT.** Store backend + prices shipped
   (v1.14–15: ownership ledger, placements, collar training ladder);
   ledgers now VERIFY the pinned prices rather than set them. Observe real kid income for ~1–2 weeks (teaser
   already building anticipation + savings habit). Revisit: back-pay
   question, payout tuning.
3. **Phase 4b — Pet Store: ✅ SHIPPED v1.32.0** (beta v1.24–v1.31;
   released with exact-change checkout, coin swaps, toy surfaces for
   dogs AND Cozy Corner pets, micro toys for littles). Approved mechanics: denomination prices set
   from observed time-to-earn (cheap toys ≈ days, wearables ≈ 1–2 weeks,
   crown/tiara aspirational ≈ a month); checkout lines are real ×5/×10
   facts, totals are addition; spends = negative ledger txns; nothing
   expires, no sales pressure.
4. **Phase 5 — Bridge tracks 1–2 (Little Pup → big kid)** — ✅ SHIPPED
   v1.1.0–v1.3.0 (parent controls, Adding waves, Track 1 tiles, piggy bank, Cozy Corner; plan: docs/PHASE5.md). Quick Look
   subitizing (ten-frame flash → numpad), number bonds of 5/10, teen
   numbers, then addition facts within 20 rolled out in strategy waves
   (+0/+1/+2 → doubles → make-ten → near-doubles → rest) with hints,
   Leitner-tracked; pets as the track's adoptables. **Per-profile
   visibility controls in Grown-Ups ride along** (subjects config:
   which tracks a child sees, childCanSwitch, hide-sitting,
   limit-tables).
5. **Phase 6 — Taking Away + connectors** — ✅ SHIPPED (docs/PHASE6.md;
   engine v1.6.0, pets v1.7.0, connectors v1.8.0).
6. **Reliability & security hardening — ✅ SHIPPED v1.36–v1.41
   (before Phase 7).** Audit remediation: CI-gated deploys + privacy
   tests (v1.36); ingest validation + structured sync results (v1.37);
   sync sidecar with conditional writes + family key (v1.38); durable
   delete/restore/purge lifecycle (v1.39); convergent economy replay
   (v1.40); storage reconciliation + mid-trail readiness fix (v1.41).
7. **Economy hardening — ✅ SHIPPED v1.42–v1.47** (after a live toy
   incident and two independent audits): purchases never un-owned,
   cross-device overspend forgiven, per-profile store reset, wallet
   coins always equal the balance, randomized invariant suite,
   snapshot-locked prices, versioned payout rates, change-making
   contract, damaged entries repaired-or-surfaced.
8. **Phase 7 — Money math track. IN PROGRESS.** Coin counting (2.MD.8),
   read-your-own wallet, totals and change — Paw Bucks becomes
   curriculum. Plan of record: docs/TRAIL.md + docs/PEDAGOGY.md.
   - ✅ R0 (v1.47.3) four blocking defects
   - ✅ R1 (v1.48.0) trail registry, one-way readiness gates, the two docs
   - ✅ R2 (v1.49.0) counting-out change at the checkout (`canOverpay`,
     the two doors, `src/ui/cointray.js` for reuse in R5)
   - ✅ R3 (v1.50.0) `counton` — sequence to 120, the number path,
     `numberWord` 0–120; groundwork landed for R4/R5 (groups engine,
     coin art, docs/PHASE7.md)
   - ✅ R4a (v1.50.0) skip-count warm-up widened to three shapes
   - ✅ v1.51.0 seven new store wearables (prices locked after an art
     review behind the 🧪 chip), per-species accessory fitting,
     one-item-per-slot wearing, `tablesReady` raised to 2/3/4/5/10 with
     `paths` teaching all five
   - ✅ R4b (v1.53.0) `groups` wired into the little-pup shelf: tile,
     registry promotion, three-part item, and the `groups` milestone
     adopting Sprout — the last pet with no earning path. MILESTONES and
     PETS are both 26 now and the suite pins them equal, so a milestone
     and its pet must ship together from here. Also fixed: `counton`
     shipped in v1.50.0 with no `GOALS_BY_GAME` entry, so its own
     next-friend meter never appeared.
   - Still open from the art review: on the **bird**, tall headwear
     overlaps the head tuft (pre-existing, visible now that every item is
     rendered side by side).
   - ✅ (v1.53.0) coin sizes corrected — the penny no longer draws larger
     than the nickel. Derived from `COIN_SCALE` in `src/art/coins.js` so
     the CSS and the art cannot disagree.
   - ✅ (v1.53.0) R5 groundwork, all behind no UI: `recordMoneyAnswer`
     (untimed mastery — a finite speed bar makes money mastery literally
     unreachable, since correct-but-slow stops at box 2 and mastery is 3);
     `src/engine/moneywaves.js` with the 134 identities frozen and pinned
     by `tests/fixtures-money-skills.json`; schema **v19** (`subjects.money`,
     `money` stat map) additive and read by nothing yet.
   - ✅ **R5 (v1.54.0) the money track SHIPPED, in preview.** Screen, seven
     waves, coin art adopted, three pigs + three grouped milestones, 674¢,
     untimed mastery, beta-gated in both `moneyVisible()` and
     `BETA_ROUTES`. **Phase 7 is complete.** Leaving preview is its own
     step: lock the 134 ids against the fixture, lock the payouts, drop
     `/money` from `BETA_ROUTES`, drop `isBeta` from `moneyVisible`, and
     decide explicitly whether preview progress is kept or cleared.
   - ⚠️ **`quarter-obv.jpg` and `quarter-obv-2.jpg` may not be independent** —
     same 1994-P, same die scratches, same mintmark, at 500 px and 750 px, with
     near-superimposable unwraps. Run both through `judge/_jrefintake.mjs`
     (§0.3). If they are one photograph, the quarter obverse's independent pool
     is `quarter-obv.jpg` + `quarter-obv-3.png` only.
   - ⚠️ **The quarter's date and motto are never seen in the app.** Both need
     `boxW ≥ 110` (`INS_REST_MIN`) and the largest render is 84, so a child sees
     only LIBERTY on this face. v1.76.0 corrected them for larger renders and
     reference sheets; do not treat that as user-visible work.
   - ⚠️ **The motto's line break is wrong and cannot be fixed at this face.**
     The coin breaks `IN GOD WE / TRUST`; we break `IN GOD / WE TRUST`. At our
     wider letterface a nine-glyph first line is 32.1 units against a 30–32-unit
     clear run. Needs a round that can change the face or the letterspacing.
   - ⚖️ **JUDGE RULING: `_jp4band.json`'s `ONE CENT.span_deg` was wrong, not the
     drawing.** Corrected 136 → **113**. It did not reproduce: the same
     instrument, same file, same frozen disc reads 113.0 while reproducing that
     entry's neighbours to two decimals, and three references bracket
     113/119/124. The record also contradicted itself — with its own `cap 10.4`
     at its own `rOuter 41.3`, any plausible advance (0.85–1.15× cap) gives
     98–133° of ink, 113 landing at almost exactly 1.0× cap, while 136 needs
     1.18×.
   - ⚠️ **`hashes-v*.txt` cannot be verified from a worktree.** It lists files
     that are untracked in the main checkout, and `_jx0link.mjs` deliberately
     skips `judge/`, so `_rescore.mjs` reports UNMEASURED for the whole set. Any
     frozen-set claim made from a worktree needs the two-part check the penny
     round used (in-tree hashes plus direct hashes against main).
   - ✅ **DONE (v1.78.0) — the tier system is gone. T1 24/32 → 32/32.**
     Owner-approved after the measurement below. `coinSVG` authors one drawing
     per face at `DRAW_SIZE` and rewrites only the outer `width`/`height`.
     A third arm settled the implementation: full detail rendered NATIVELY
     small scores 32/32 too, tracking the Lanczos resample within 0.005, so no
     raster pipeline was needed. ⚠️ Now DEAD and deliberately left in place
     rather than removed in the same commit: `iconS`/`iconCy`/`iconCx`,
     `iconWig`, `iconBust`, and `tierOf` itself. Removing them is a separate,
     purely-subtractive round.
   - 📋 **The evidence that justified it:**
     The owner asked what the small sizes would look like if they were simply
     the large drawing scaled down instead of tiers dropping detail. Measured
     with `judge/_nk14scaletest.mjs`, both arms ending at the same device pixels
     through T1's own descriptor and fitted registration:
     - **SCALED wins 31 of 32 cells** (the single exception is the nickel
       reverse at 84 px, by 0.005).
     - **Every one of the eight reverse confusions disappears.** The penny
       reverse goes from −0.063 to **+0.244** at 38 px; the quarter reverse from
       −0.078 to +0.144 at 48 px.
     - It also closes the two thinnest obverse margins, which the nickel round
       had reported as unfixable without touching shared code: nickel 48 px
       0.014 → **0.187**, 54 px 0.024 → 0.187.
     **The tier system is costing recognition, not protecting it.** It was built
     on the theory that sub-pixel detail is noise; the measurement says the
     detail it discards — reeding, legends, interior modelling — is most of what
     makes a coin identifiable at small size.
     ✅ The three open questions were answered before acting: a six-coin pile at
     38 px is 89 KB of markup / ~18 KB gzipped, inline in a local-first app with
     no per-coin fetch; native small vector rendering matches the resample; and
     D9 reports 120 renders clean with its response test red, D8 unchanged.
     ⚠️ **Instrument note:** two earlier versions of this test rasterised the
     tiers arm at natural size and then resampled, which handicapped it by ~0.03
     of own-score and reported TIERS 22/32. **It was caught because it did not
     reconcile with the official gate's 24/32.** A new instrument that argues
     against an existing one must reproduce the existing one first.
   - ✅ **RESOLVED by v1.78.0 — every coin now carries its lettering at every
     size.** The mid-tier lettering gap and the two thinnest margins (nickel
     0.014 at 48 px, 0.024 at 54 px) were both consequences of the tier system;
     one drawing per face removes them. The nickel round's diagnosis was right
     and its proposed fix — a serialised round on `INS_MAIN_MIN` and the
     min-pixel stroke floor — is no longer needed.
   - ⚠️ **superseded — NO COIN CARRIES ANY LETTERING AT MID (48 and 54 px)** — `INS_MAIN_MIN`
     is 62 — while every photograph plainly does at 48 px. Together with the
     min-pixel stroke floor (`sw(1.15, 0.9, boxW)`, which draws the silhouette
     contour at 2.1 viewBox units against its design 1.15), this is the nickel
     round's diagnosis of why **mid is the weakest tier in the set**: its two
     margins, 0.014 at 48 px and 0.024 at 54 px, are now the thinnest anywhere.
     Both are **shared code**, so this is a serialised judge round, and it is
     the highest-value one left.
   - ⚠️ **At 84 px our outer band is over-weighted** — 0.431 of energy against
     the photographs' 0.288–0.325 — because our letters are hard vector edges
     where photographic relief blurs. T1 prefers it strongly, so it is not a
     regression, but it is a real overshoot and no honest correction was
     available without inventing a number.
   - ⚠️ **T1 UNDERSTATES THE ART, BECAUSE IT DISCARDS COLOUR.** T1 scores
     registered NCC on blurred gradient energy of a **greyscale** raster, so
     colour contributes exactly nothing — yet the cent is the only copper coin
     in the set and colour is the most salient cue at 38 px.
     Measured (`judge/_jt3colour.mjs`, mean warm chroma R−B over the disc):

     | | references | ours at 38/48/54/84 |
     |---|---|---|
     | penny | +87.9 / +61.6 / +89.1 | **+120.9 … +126.3** |
     | nickel | 0.0 / +5.3 | −12.6 … −12.4 |
     | dime | −3.1 / −3.0 | −12.3 … −12.5 |
     | quarter | +10.0 / +52.0 | −13.5 … −13.6 |

     Our penny is **more strongly copper than the real coins**, and sits ~135
     chroma units from any of our silver coins. **So T1's "penny reverse reads
     as a nickel" is substantially a greyscale artefact** — no child confuses a
     copper disc with a silver one. The dime→penny and quarter→dime confusions
     are silver-on-silver and are NOT excused by this.
     ⚠️ Do not simply bolt colour onto T1: a colour term needs its own control
     and its own reference-invariance test, and `quarter-rev-3.jpg` reads +52,
     so the reference chroma is not clean. Treat the 24/32 as a **lower bound**
     on the art until that work is done.
   - 🔴 **T1 IS 24/32 ACROSS BOTH FACES AND ALL FOUR APP SIZES (38/48/54/84).**
     **Obverse is 16/16** — every obverse sorts to its own denomination at every
     size the app draws. **The reverses are 8/16 and are the entire remaining
     gap**: the penny reverse reads as a NICKEL at 38, 48 and 54 px, the dime
     reverse as a penny, the quarter reverse as a dime at 84.
     ⚠️ THREE locus gaps have now been found in this one instrument, all by
     someone other than its author: it tested obverses only; it asserted three
     app sizes when `coinRow`'s default makes four; and it inherited the primary
     role from a D11 scored at 26 px, which the app never draws at all.
   - 🔴 **superseded — T1 REVERSE WAS 7/12 — the weak half, and the gate could not see it
     until v1.74.0.** Obverse is 12/12; overall **19/24**. Confusions, at the
     sizes the app draws:
     - **penny reverse reads as a NICKEL at 38 and 48 px.** Two neoclassical
       buildings. This is the 1¢-vs-5¢ confusion the app exists to teach
       against, and it is the highest-value defect open.
     - dime reverse reads as a penny at 38 and 48 px.
     - quarter reverse reads as a dime at 84 px.
   - 🔴 **NEITHER REVERSE CARRIES LETTERING AT ICON OR MID** — 38 and 48 px,
     two of the three sizes the app draws (`discSVG` emits no inscription when
     `tier === 'icon'`). Pre-existing. Every reference photograph has a
     peripheral ring of lettering energy and ours has none below 84 px; that is
     plausibly a large part of the reverse transfer gap above. The line is in
     shared code affecting all four coins, so it is a **serialised judge
     round**, not a specialist one.
   - ✅ **The resolution floor was measured, and no display-size change is
     warranted.** The owner authorised raising the app's minimum size.
     `judge/_jt2floor.mjs` sweeps a size ladder twice: real photographs sort
     **4/4 at every size down to 16 px**, while our art needed **44 px**. The
     physical floor is far below anything the app draws — the art was
     discarding the information, and raising the size would have hidden that.
     Re-run this before ever proposing a size change.
   - ⚠️ **The nickel obverse still carries the OLD icon trio.** Its 38 px margin
     is 0.018 and its 48 px margin 0.020 — passing, but by a tenth of what the
     penny and quarter now clear. The same `k = 42.5/44.07` correction applies.
   - 📌 **OWNER DECISIONS, 2026-08-22 — these supersede where they conflict.**
     1. **"DONE" IS A TRANSFER CRITERION.** Verbatim: *"No remaining wrong in
        kind defects AND a child can identify a photo based on only learning
        about the denominations from our pictures. **Distinguishing our
        renderings from each other is not the point, learning to identify real
        currency is.**"*
        ⚖️ **This invalidates D11's OBJECTIVE.** D11 measures our-art against
        our-art. A set of drawings could be maximally distinct from one another
        and teach a child nothing about the coins in their hand. Replaced by
        `judge/_jt1transfer.mjs`, which asks whether each of our faces is nearer
        the **right denomination's photographs** than any other's, at the sizes
        the app really draws.
     2. **The four proven-broken dimensions are DEMOTED TO ADVISORY** — D6, both
        D7 metrics, and D8's shorter-outline behaviour are **reported, not
        gated**. Stop optimising against them; stop warning specialists to
        disbelieve them in every brief.
     3. **References: keep using sourced photographs for now.** The owner has a
        scanner available "in a few days" — **raise it again then if reference
        quality is still blocking**, which it currently is on the cent's
        whisker boundary.
     4. **Small rulings delegated to the judge**, overturnable later.
   - 🔴 **FIFTH RUBRIC FAULT — a LOCUS fault, not an estimator fault. D11 is
     scored at a size the app never draws.** `_x6lib.mjs:16` says
     `ICON_SIZE = 26 // the quarter diameter the app's icon tier draws`. That
     comment is **false**: `src/screens/money.js` draws `coinRow(...,38)`,
     `coinRow(...,48)` and `coinRow(...,84)`. **No D11 number has ever been
     computed at 84px, the naming stage.** The response test passes at every
     size, so the tool is sound — the locus was never derived. Consequence: the
     closest pair changes with size (nickel/dime at 26px, dime/quarter at 84px,
     two pairs moving 7–9 ranks), and the §17 ratio reads 1.49× / 1.40× / 1.69×
     at 26 / 48 / 84. So D11 was measuring the wrong quantity **and** in the
     wrong place.
   - 🔴 **THE TRANSFER TEST FAILS AT 38px, AND 38px IS THE PILE DRAW.**
     `judge/_jt1transfer.mjs`, control-gated (it sorts real photographs 4/4
     before it will say anything about our art):
     **10 of 12 correct.** At 48px and 84px it is **8/8** with margins growing
     to 0.216. Both failures are at **38px**: our **penny reads as a nickel**
     (0.084 vs 0.165) and our **quarter reads as a nickel** (0.115 vs 0.276).
     38px is `coinRow(opt.coins, 38)` — the size a child sees when counting a
     **pile**. Confusing a cent with a nickel there is a 1¢-vs-5¢ error in the
     exact task the app teaches. **This is the first defect found against the
     owner's own definition of done, and no existing gate can see it.**
     ⚠️ v1 of this instrument used raw greyscale correlation and **failed its
     own control 3/12** — real dime photographs did not sort as dimes, because
     raw pixel correlation on photographs records lighting, not design. Its
     numbers were discarded, not filed. The control now runs FIRST and exits
     before reporting anything if it fails.
   - 📌 **Standing owner decisions on the coin art (2026-08-21). Do not
     re-open without overturning these first.**
     1. **Shapes and detail before tone.** D1, D2, D4, D6, D7 outrank D3 and
        D13. Do not spend a round chasing a tone gate while a shape gate is
        open. This also makes D13's escalation much cheaper than it looked.
     2. **The current palette stays.** The candidate base tone was previewed
        and declined. Our device/field ratio is 0.656 where the coins read
        1.185–1.438 — measured, real, and deliberately left.
     3. **The three silver coins stay tonally identical to each other.** In
        life they are the same metal, so consistency between them outranks
        matching any photograph. `PALETTE.quarter === PALETTE.nickel ===
        PALETTE.dime` being byte-identical is **protected**, not the
        "partially uniform" defect `scripts/coin-shared-claims.mjs` flags.
     4. **`EDGE.field.icon` stays at 42.5** — see the D10 row below for the
        price this decision knowingly accepts.
   - ✅ **(v1.55.0) real US currency art, split from Paw Bucks.**
     `src/art/coins.js` is now real money (both sides, five denominations);
     the fictional art moved intact to `src/art/pawcoins.js` with its own
     spec. Method, metrics and every iteration in `docs/COIN-ART-METHOD.md`.
     **Measured: dime obverse** (silhouette IoU 0.867 → 0.981, plus a phase-2
     interior pass on a cheek-normalised patch-ratio vector) and **nickel
     obverse** (shape agreed to 0.14–0.37% of diameter, scale only ±1.1%).
     - `src/art/pawcoins.js` is preserved but **imported by nothing**; the
       wallet and store still draw CSS discs, unchanged since v1.10.
   - ✅ **(v1.56.0) all ten faces measured.** Penny obverse IoU
     0.668 → 0.952, quarter obverse 0.698 → 0.965, all four reverses scored,
     the note measured. Four phases added to the method: §14 edge quality,
     §15 structural rhythm, §16 lettering as a tone band, §17 cross-coin
     discriminability, §18 rectangle registration for the note.
     **The nickel's portico had 6 columns drawn where the coin has 4**, and
     the file asserted six in its own comment — found by the new count gate,
     invisible to IoU.
   - 🔴 **DECISION OWED: the reverses are not separating the coins.**
     Measured for the first time (§17): the reverse set is only **1.5×** more
     separable than the obverse set — 1.7× with the shared rim discounted —
     against a 3× target. The reverses exist *solely* because four
     presidential profiles are four ovals with a nose at 19px, so this is the
     justification for half the art not holding up. Two structural causes:
     - a difference metric rewards covered **area**, so two large overlapping
       busts differ only at the fringe while two small sparse motifs barely
       overlap;
     - `PALETTE.nickel`, `.dime` and `.quarter` are **byte-identical**, so
       three of four coins get nothing from colour. This is the deliberate
       v1.55.0 accuracy decision (one real alloy, and the invented brightness
       ladder was rejected as a false fact) — **v1.56.0 is the first
       measurement of what that choice costs.**
     Options, none taken, all reversible: accept it and lean on the size
     channel wherever two coins are shown together; differentiate reverse
     motifs by gross mass distribution rather than fine detail; or revisit
     the one-silver decision. **Note the 3× gate was set by inspection, not
     derived** — it may itself be miscalibrated for a mean-absolute-difference
     metric where a large shared disc dominates. Worth re-deriving before
     treating the failure as settled.
   - 🔬 **Cheapest next experiment: re-run §17 with a shape-aware distance.**
     From looking at the render beside the numbers
     (`coloringbook/_final-candidates.png`): at 26px the three silver
     obverses really are interchangeable, exactly as the metric says — but at
     84px and 54px an eagle, a torch, a colonnade and a portico are
     *obviously* different shapes, far more so than 1.5× implies. So MAD
     appears to understate the reverses specifically, and there are two
     reasons it would: every pair shares an identical disc, rim and field,
     which is most of the compared area, contributes zero difference, and
     inflates the denominator; and MAD is **not shape-aware**, so it cannot
     reward "different silhouette" the way recognition does. Re-measure on
     the **motif only, disc excluded**, with a shape-sensitive distance (IoU
     of the thresholded motif mask, or a shape descriptor). If that separates
     the reverses where MAD did not, the metric was the problem and the art
     is closer to fine than v1.56.0 claims.
   - 🔧 **Opportunistic depiction/mechanism separation (owner, 2026-08-13).**
     Not a refactor of `src/art/coins.js` — 56% of that file is reasoning, and
     five diverging copies of the reasoning would be worse than one shared
     bug. Instead: **push a value down to the coin the moment it turns out to
     be a claim about one coin**, keeping the shared default
     (`t.min ?? REV_TEXT_MIN`, `o.eyeMark || eye(o.eye)`). That is already the
     house idiom; it just had no name and no way to find the next candidate.
     `scripts/coin-shared-claims.mjs` is that finder — run it when touching
     coin art. Distinguish the two kinds of sharing:
     - **mechanism** (`struck`, `reliefOff`, `spendOf`/`fitOff`, `onField`,
       tiers, the emitter) — sharing is the *point*: one containment fix
       repaired the quarter, dime and nickel in a single edit;
     - **depiction** — sharing is a bug in a helper's clothes. `REV_TEXT_MIN`
       was the nickel's floor governing three other coins for three releases;
       `ear()` drew a helix on a coin whose wig covers the ear.
     First candidate it found: **`EDGE` gives all four coins the identical
     field radius** (full 41.0 / mid 40.5 / icon 42.5) — structurally
     per-coin, actually one number nobody measured per coin. The shoulder-fix
     run already found ours is smaller than the real coins' (cent reaches
     r=0.913 of the disc, nickel 0.991, ours stops at 0.8723), and this value
     also sets every legend baseline. Measure it per coin.
     `PALETTE` is correctly flagged partially uniform (quarter = nickel =
     dime) — that one is the deliberate one-alloy accuracy decision and
     should stay, with the reason recorded rather than the flag silenced.
   - ✅ **RESOLVED v1.57.0 (2026-08-21): `EDGE.field` was ~3.3 units too
     small on every coin.**
     Two independent measurements by two unrelated methods now agree, and it is
     blocking real gates on two coins:
     - nickel round 0: **44.33**, sd 0.32, from four independent well-fitted
       references (photometric);
     - quarter round 4: **44.20**, from a polar unwrap of the legend band.
     We drew **41.0** (full), i.e. 0.872 of the disc radius where the coins
     show 0.940–0.943. **Our rim ring is 6.0 units wide where the real coins
     show 2.7** — more than twice too thick.
     Consequences already measured: the coins give their legends 7.5–7.7 units
     of band and we give 4.6, so **D5-cap is unreachable behind D5-rim on both
     the quarter and the nickel** — the quarter's legend cannot reach correct
     height without crossing the field circle. Widening it would also **retire
     the nickel's 1.47-unit D8 breach for free**.
     Not changed unilaterally: `EDGE` is shared by all four coins, sets every
     legend baseline, and moving it visibly thins the rim on all of them. It
     is the exact "shared claim wearing per-coin clothes" that
     `scripts/coin-shared-claims.mjs` was written to find, and it was that
     script's first report. Got the owner's eye 2026-08-21 ("I like the new
     thinner edge", off the `_edgesheet` preview) and was applied at
     **44.07** as ONE shared value, not per-coin: four blind per-coin
     measurements agree within 0.58, so this is the PALETTE treatment —
     genuinely shared, reason recorded at the constant.
   - ✅ **(2026-08-14) all five subjects judged; four scorecards added.**
     Every denomination has now had a holistic pass. All five FAIL, which is
     the expected and useful result — the point was to find what nobody had
     scored. Scorecards, gates, histories and instruments in
     `coloringbook/judge/` (tracked).
     - 🔴 **`EDGE.field` is one wrong constant, settled.** Four judges, four
       reference sets, four methods, deliberately not shown each other's
       answers: cent **44.00**, nickel **44.33**, quarter **44.20**, dime
       **43.75** → **44.07 ± 0.25**, range 0.58. We drew **41.0**. Preview
       rendered (`coloringbook/judge/_edgesheet.mjs`): the rim goes 6.0 → 2.9
       units where the coins show 2.7. Unblocks D5-cap/D5-rim on quarter and
       nickel and retires the nickel's 1.47-unit D8 breach for free.
       **✅ Applied in v1.57.0**, owner-approved by eye: 44.07 at full/mid,
       icon holds 42.5 (a true 2.93-unit ring is sub-pixel on a 26px chip);
       legend offsets absorbed the 3.07-unit move so every judged baseline
       held (quarter 36.40/35.63 exact); the specular arc rode out 43.4 →
       45.5 to stay in the rim band.
     - 🔴 **`_x6lib.mjs:17` has never contained `buck`.** Every phase-6
       discriminability figure ever published, including the 1.487×/1.520×
       set ratios quoted in four commits, was an 8-cell matrix over **four**
       of five denominations. Re-derived over five, the conclusion survives —
       the note is 4.39× the set minimum and contributes zero to it — but it
       survived by luck, not coverage.
     - 🔴 **The note draws the wrong pyramid.** The real one is truncated with
       a detached capstone above a ray gap; ours is a pointed triangle with a
       second triangle on top. Same class as the nickel's six columns.
     - `REV_TEXT_MIN` has now stranded **three** coins at the naming size: the
       cent and the dime still take the shared 135 while the quarter was
       lowered to 84 in round 2.
     - **D13-obverse had never been measured on any coin** — `_x6dark.mjs` is
       reverse-only, so it was not a blank row but an absent subject. It is
       the cent's worst number (−0.2537 at icon).
     - **D8 is nearly useless on the note**: it passes at 0.0000% while the
       eagle sits 10.474% outside its own roundel, 4.840 units deep, because
       `struck()` passes `rField = 0` there by design.
     - The dime's phase-2 numbers re-derived through the fixed rasteriser:
       **0.0443 → 0.0399** (−9.9%), with the old path re-implemented and
       reproducing 0.0443 to 5e-4 to prove the attribution.
     - Seven instruments were caught returning confident wrong numbers, every
       one by drawing the located feature and looking at it. Two judges
       disclosed their own process violations unprompted.
   - 🔴 **ESCALATED (v1.59.0): D13's normaliser measures the photograph's
     lighting, not the field.** D13 divides by the p90 of the disc interior,
     which is a field level only when the brightest tenth of the interior is
     field. On the dime it is the specular highlight on the torch. Bare-field
     patches, drawn on the source and looked at, read 27–165 grey against an
     ink threshold of 181 — so **the reference's own field counts as ink on
     three of four reverses** (dime 0.514 of p90, quarter 0.677, cent 0.757;
     nickel clean at 0.949). Our flat SVG field sits at its own p90 and can
     never be ink, so |Δ mean/field| ≤ 0.05 is very likely unreachable on
     those three however the art is drawn. **Do not relax the gate** (§8).
     The fix is a device/field segmentation — the same thing **D2 is BLOCKED
     on**, so the two dimensions share one blocker, which nobody knew.
   - 🔴 **D2 is not unblocked by more photographs, and now we know why.** The
     owner supplied four independent dime reverse references (1960/1968/2010
     proofs + a 2015 special strike; provenance in
     `coloringbook/judge/PROVENANCE-dime-proofs.md`). With verified disc fits
     their thresholded masks agree at only **IoU 0.36–0.53** against a 0.95
     gate; a tighter legend-free locus gets 0.43–0.53. The quarter hit the
     same wall in round 0 (0.47–0.69). Two coins now say the same thing about
     the **rubric**: thresholding a photograph of struck metal records
     lighting as shape. The constructive path the acquisition DID open is the
     one §2.1 already allows — **a hand annotation is a legitimate frozen
     target**, and that needs a traceable reference, which
     `dime-pcgs2015-pair.jpg` at ~870px finally is. Tracing is a judgment
     task: owner or a dedicated judge session, not a specialist.
     ✅ **RESOLVED (v1.66.0) — the D2 dime-reverse target is frozen.** The
     owner picked the **2010-S trace**, not the average: *"The 2010 dime trace
     is very good. Every other trace and the average is worse than that single
     trace."* The measurements agree with the eye — the 2010-S is the
     highest-resolution cameo proof, it is the **only one of the three where
     the text-band pass had nothing left to remove** (0.0%: no letter touches
     its relief), and its baseline cluster used **12 of 12** interior
     components against 13/17 and 10/14. Majority voting was averaging one good
     trace together with two worse ones, which is why the average sat at IoU
     0.66/0.72/0.57 — closer to all three than any was to another, and better
     than none of them.
     Frozen as `judge/_jd2target-dime-reverse.png` + `.json`, mask area
     **31.88% of the disc**, disc fit cx 266.2921 / cy 274.0711 / R 241.3558,
     SHA-256 `c36b8aea…e939c8`, **verified identical across two independent
     runs**. §6.1 holds by construction: the generator's module graph never
     touches `src/art/coins.js`, so no value in the target can depend on the
     artefact under test. **It is a scoring target, not a source of
     coordinates** — no path data may be lifted from it into `coins.js`.
     ⚠️ Still owed: a scorer that extracts the same quantity from OUR render.
     The two sides are not symmetric and the asymmetry must be declared — on
     the photograph the lettering has to be *inferred*, in our own SVG we
     *know* which elements are lettering and can exclude them by construction.
     🟡 **Superseded — how the target was reached.** The owner has no
     tracing tools, so the judge traced instead and published candidates:
     `judge/_jd2trace.mjs` traces **each** cameo proof on its own terms rather
     than hunting one threshold that works everywhere, then combines them by
     **majority vote** — a pixel is motif when at least two of three
     independent photographs say so, which is the same corroboration rule §5
     applies everywhere else. Candidates: 2010-S 58.3% of the locus, 1960
     44.8%, 1968 45.8%, average **51.6%**. The individual traces agree with
     each other at only IoU 0.4339–0.5345 — the same wall as before — but the
     **average agrees with each of them at 0.7720 / 0.7069 / 0.6285**, i.e.
     it is closer to all three than any is to another. Six overlays written
     (`_jd2trace-own-*.png`, `_jd2trace-avg-*.png`).
     ⚠️ **Known defect in the candidates:** the 0.70 locus excludes the
     legend ring but **not** E·PLURIBUS·UNUM, which sits at r ≈ 0.5–0.6, so
     every trace currently swallows those letters. Lettering is D5's subject,
     not D2's. Whichever candidate is chosen needs the letters cut before it
     is frozen as the target.
   - ⚠️ **The proofs cannot help the tone side.** Three are cameo proofs and
     the fourth has inverted contrast, so D3/D13/D5-rim on the dime still
     rest on the single circulation photograph. **A plain business-strike
     dime reverse under diffuse light is the outstanding acquisition.**
   - 🔴 **D10 fails on all four obverses, and v1.57.0 moved it in both
     directions without anyone measuring.** At the 42→44 boundary: cent
     5.44× → **24.64×**, quarter 6.36× → **12.43×**, nickel 24.21× →
     **9.12×**, dime 5.56× → **4.26×** (gate ≤4×; absolute d(ink) beside
     every ratio, per R2, so none of it is a denominator artefact). Cause:
     the field radius went to 44.07 at full and mid while **icon was held
     at 42.5**, putting a 1.57-unit step exactly at the boundary D10
     measures. The candidate repair is to reconsider `EDGE.field.icon` —
     which is a **shared constant across all four coins**, so it cannot go
     in a parallel round and is queued as a serialised judge round.
     D10 is now in `_rescore.mjs`'s standing set.
     ⛔ **The owner declined that repair (v1.66.0), with the preview in
     hand.** At true size the thicker border is marginally better at the
     smallest size only and is noticeable only if pointed out and then closely
     examined — while the change **doubles D10**, because the 42.5 ring
     currently falls inside D10's sampling disc and masks half the defect (the
     true bust discontinuity is **0.1528**, not the published 0.0854). So D10
     stays red *by decision*, with the price known and written down. Do not
     re-propose without overturning this.
   - 🔴 **D7 is ESCALATED: its metric has never measured curvature.**
     `_jqgeom.turns()` takes the angle between *chords* joining consecutive
     on-curve knots, which is a property of knot spacing. Verified: a
     G1-continuous join of two half-circles returns **90.0°**, and **116.6°**
     sampled coarsely; a tangent estimator returns 0.0°. It survived because
     the gate's own response test ("a known 90° corner reports 90 ± 1")
     passes on **both** estimators and cannot tell them apart. This
     invalidates every D7 verdict across four rounds, **including the dime
     PASS in v1.61.0**. The per-knot *declarations* survive as relative
     statements (ours vs the target's chord turn at the same place, with a
     straight control — like against like); the absolute gate does not.
     **Queued serialised repair:** re-state D7 on tangent discontinuity,
     re-derive on every coin and side, retract every published figure.
     `_jqgeom.mjs` is shared with D6 and D8.
     ✅ **Done (v1.66.0).** `judge/_jd7tan.mjs` restates it on tangent
     discontinuity — response-tested three ways: a known 90° kink reads 90.0,
     a G1-smooth join reads **tangent 0.0 against chord 90.0**, a straight run
     reads 0.0/0.0. `judge/_jd7fitted.mjs` then restricts it to **fitted**
     contours, per Appendix P2 (authored polygons declare their own corners).
     Almost every published D7 failure was the metric, not the drawing. The
     full fitted-contour table **as of v1.66.0** (chord worst / over-75, then
     tangent worst / over-75 — both measured on the same knots, so they are
     commensurable with each other and with nothing else):

     | face | fitted path | knots | chord | tangent |
     |---|---|---|---|---|
     | penny obv | `HEAD.Lincoln` | 32 | 69.1 (0) | **0.7 (0)** |
     | penny obv | `HAIR.Lincoln` | 27 | 144.5 (2) | **1.0 (0)** |
     | penny obv | `BEARD` | 13 | 122.2 (2) | **85.0 (1)** 🔴 |
     | nickel obv | `HEAD.Jefferson` | 36 | 71.5 (0) | **1.6 (0)** |
     | nickel obv | `HAIR.Jefferson` | 34 | 69.9 (0) | **31.8 (0)** |
     | dime obv | `HEAD.Roosevelt` | 43 | 111.0 (1) | **111.2 (1)** 🔴 |
     | dime obv | `HAIR.Roosevelt` | 31 | 156.2 (4) | **156.3 (3)** 🔴 |
     | quarter obv | `HEAD.Washington` | 40 | 71.0 (0) | **1.2 (0)** |
     | quarter obv | `HAIR.Washington` | 34 | 102.0 (1) | **1.2 (0)** |

     Real defects survive on **two** faces. Dime: `HEAD.Roosevelt` knot 23 at
     111.2°, and `HAIR.Roosevelt` knots 0 / 16 / 30 at **156.3° / 114.9° /
     84.8° — three genuine kinks the chord metric never scored at all.** Cent:
     `BEARD` knot 7 at **85.0°**. Two rounds, on two different faces.
     ⚠️ Corrected, mine: an earlier draft of this row quoted the nickel as
     "173.0 → 14.0". Those are **pre-v1.66.0** numbers, measured before r17
     redrew `HAIR.Jefferson` — quoting them under a version that contains the
     redraw compares two different drawings. The table above is re-derived
     against the shipped art.
     ✅ **Extractor fault found and fixed, and it was hiding a defect.**
     `_jd7fitted.mjs` parsed nine fitted constants but located only eight in a
     render, so **the cent's beard had no D7 number at all** — reported by the
     script's own extraction check rather than passing silently. Cause:
     `arrValue()` ended each block at the literal `"\n];"`, but `BEARD` ends
     `].join(' ')`, so the block ran on to the *next* array in the file and the
     reconstruction carried a second constant's literals. Now terminated at the
     closing bracket in column 0. The moment it could see `BEARD`, a **fifth
     genuine kink** appeared — knot 7 at 85.0° — which no D7 run had ever
     scored. An instrument that cannot see a subject reports a pass.
     ⚠️ Also retracted here: the quarter's 102° knot was described to a
     specialist as "confirmed by eye as a visible kink." Its tangent
     discontinuity is 0.4°. It was never a kink.
   - 🔴 **D13-obverse has no runnable instrument at all.** `_r3d13.mjs`
     imports `./_rvnorm.mjs` from `judge/` where the file lives one level up,
     so it throws on a clean checkout; `_x6dark.mjs` covers only the four
     reverses. Every published D13-obverse figure came from something that
     does not execute. (`judge/_jd13v2.mjs`, written this session, does cover
     both sides — but its own normaliser is the one proven unsound.)
   - ✅ **v1.62.0 — quarter obverse D6 21.29% → 20.50%**, one mark of 26
     converted. That restraint *is* the finding: 23 of 26 have their
     first/third-third width medians separated by **less** than the
     between-reference IQR. The wig grooves (62 % of all uniform length) were
     measured against the coin — its roll pitch is 0.95–1.75 units and cut
     width 0.25–0.55, while we draw grooves at 2.4–2.6, **wider than the
     coin's entire roll pitch**. Narrowing them is a tone change, not a taper.
   - ✅ **v1.62.0 — the cent's beard now meets the hair.** §20.8 has said
     since it was written that the top edge "starts level with the bottom of
     the ear, not eight units lower"; it ran **7.9 units lower**, and the rear
     tip sat **0.841 units outside the hair mass**, leaving a wedge of cheek
     tone between two masses the photographs show as one. Tip moved to
     (−18.85, 4.00), 0.345 inside; junction closed. D1 bit-identical — the
     mutation test confirms `HAIR`/`BEARD` are outside D1's locus, which is
     free work on a coin with 0.00378 of margin.
     ⚠️ **Left owed:** the coin's whisker field runs well above our top edge
     across the mid-jaw — a lens-shaped shortfall peaking near **10 local
     units** at x = −4..0. It needs its own round, its own D13 budget, and
     probably a mid-jaw tone patch, because **the frozen patch set has a hole
     exactly there** (nothing between `cheek` and `beardJaw`).
   - ✅ **v1.66.0 — the $1 note was wrong in kind, not in degree.** The
     pyramid was a pointed triangle with a hat; the real one is **truncated**
     with a **detached** capstone whose base matches the truncation beneath
     it. The roundels were circles; they are ellipses. Four corner numerals
     where we drew two. D1 obverse **0.1496 → 1.0000**, D2 roundels 0.3943 →
     0.9989 and 0.4290 → 0.9991, D4 count error 2 → 0. The eagle's spill past
     its roundel was **154.8% of the rim → 0.000%** — and the 10.474% we had
     been quoting was measured against **our own** round-0 roundel, so the
     defect was fifteen times worse than our own number said.
     ⚠️ Costs kept, not waived: D11's note row 0.1049 → 0.0718 (front-vs-back
     got harder; note-vs-coin did not — set minimum and the §17 ratio are
     untouched), and D6-reverse 4.54% → 6.91%, kept because §5 puts D4 above
     D6. ⛔ Overturned: `src/art/pawcoins.js` is **not** a stale copy to
     repair — it draws Paw Bucks, which CHARTER.md requires stay visibly
     distinct from real money.
   - ✅ **v1.66.0 — the quarter's wig was a stripe pattern.** Seven stroke
     widths, **no centreline moved**: `groove` 2.6/2.4 → 0.98, `grooveFine`
     1.1/1.0 → 0.36. At 2.5 wide on a 4.05 pitch there is no lit mass left to
     be cut — our own render scored 0 or 1 cuts on 7 of 7 transects, i.e. it
     could not be measured by the instrument that measures the coin. Cut duty
     now **0.322** against the coin's 0.258–0.429. Pitch is not a free
     parameter and width is: reaching the coin's 1.25-unit pitch needs 3.2×
     our cut length and takes D6 to 31.71%.
     🔴 **The finding that matters most: D6 IS BLIND TO STROKE WIDTH.** This
     narrowed the exact defect D6 exists to catch by 2.6× and D6 moved by
     **0.0000** (bit-identical, verified). The count half of the same defect
     would raise D6 by 11 points. D6 cannot route a width repair and forbids a
     count repair — a rubric fault of D7's class, on the dimension §14 exists
     to serve.
     **Queued:** variant B also narrows the **lit rolls** to 0.92 and looks
     materially better at 190px with tone unchanged. Rejected on scope only —
     the brief said "the wig grooves" twice and the lit rolls are not grooves.
   - ✅ **v1.66.0 — the nickel has no ear, and its wig covered a third of the
     head.** Both references run the wig temple-to-nape with **no ear
     anywhere**; the glyph box landed in the middle of it. Replaced with
     `earMark: CURLS_JEFFERSON`. ⚠️ Keep this warning: **tone says the
     opposite** — the glyph box reads 0.925–0.948 of the cheek, *darker*, not
     the wig's 1.207–1.224, because that is the deepest-cut curl cluster.
     Re-deriving from tone alone concludes the glyph sits on skin. Only the
     picture settles it (§4.3).
     The hair mass was worse than the brief said: **three** of four wig
     patches read exactly 1.000 because the drawn mass never reached them —
     the front two thirds of the wig rendered in **face tone**. After:
     hairFront 0.0% → 85.3%, hairCrown 38.8% → 100%, hairMid 0.0% → 100%,
     curls 30.5% → 100%, all seven face patches still 0.0%.
     **Queued:** the front two thirds now has no strand detail — every lit
     ridge in `RELIEF.Jefferson` sits at x ≤ −23.
   - 🔴 **A third ratio pathology, and the cleanest one (v1.66.0).** The
     corrected nickel hairline is a **shorter route**, so D6-obverse rose
     0.1168 → 0.1185 and D8 rose 2.3714% → 2.4127% **with neither numerator
     changing** — D6's is bit-identical at 140.8 (it fell), D8's breaching
     path, length and depth identical. 100% denominator, both. Accepted with
     no regression charged: R2 forbids claiming an improvement without the
     numerator moving, and applied symmetrically it forbids charging a
     regression too. A gate a shorter, more correct outline can only worsen is
     on the wrong side of its own ratio.
   - ✅ **v1.66.0 — the note's eagle, and a brief wrong by 36%.** "The note's
     wings span 0.604 of the rim against our 0.858 — too wide and too short"
     was prose from an earlier card that got relayed into a brief as a
     measurement. Measured: the note's wings span **0.8242** (0.8211/0.8273
     across two references) against our 0.8421 — **2.2% too wide, not 42%**.
     Neither 0.604 nor 0.756 has a generator anywhere in the tree. What was
     actually wrong: the bird **hangs low** (tail to 0.893, centre offset
     +0.191, wings at 70.2°) where ours sat dead centre at 0.502 with wings at
     53.9°. After: 0.8248 / 0.6939 / 0.1929 / 70.0°.
     **The lesson worth keeping:** the iteration that hit *every* measured
     proportion rendered as a **tuning fork**, because `struck()`'s white
     bevel sat in the 0.20-unit gap between head and shield and cut the bird
     in half. The fix was not lowering the target — every proportion is still
     within 0.010 — it was noticing the **joins** had never been measured. On
     the note the head's ruff and the shield's top edge meet at Y 28.33, and
     two shapes that meet in a photograph must overlap in a drawing.
     🔴 **Shared-helper fault, queued:** `spendOf()` bounds the relief offset
     against a **circle centred at (50,50)** when this subject has two
     off-centre ellipses. The null test places the blame precisely — with the
     offset zeroed, the note's own wingtip *is* containable.
   - 🔴 **`bust()`'s `hairFill` is the wrong sign at mid.** `o.hairLit &&
     tier === "full" ? p.cloth : p.hair` draws the wig **darker** than the
     face at mid, where both references read 1.207–1.388. The nickel repair
     above *enlarged* this pre-existing error by covering more of the head —
     the 74→76 boundary d(mean) doubled, 0.0342 → 0.0634. One branch, in a
     shared helper no parallel round may touch. **Serialised round.**
   - 🔴 **Two D7 instrument faults, both silent, both affecting every coin.**
     `_jqgeom.turns()` walks `i = 1 … K.length-2`, so a closed path's
     **closure knot is never evaluated** — it exempts one knot on every
     closed path in the file, in every round D7 has ever been scored, and on
     the cent obverse alone it hides two knots over 75°. Separately
     `_jp9edge.mjs`'s D7 half is a **null result** on the cent, because
     `_jqgeom.mjs:179` truncates the tag to 200 characters and the `d="…"`
     match then never closes.
   - 🔴 **`PALETTE`'s base tone is inverted against the coins.** Measured on
     the cent: our cheek/field is 0.656 where the two struck references read
     1.185 and 1.438 — a struck coin's raised device catches light and its
     sunken field does not, and this palette draws every device darker than
     its field on all five subjects. **D3 and D13 pull in opposite
     directions on the same photograph** because of it, which is why the
     cent's coat is simultaneously too light against the cheek and too dark
     against the field. Fixing it means moving `motif`, which is shared with
     each coin's reverse.
   - Owed on the art, in priority order:
     - **The note's roundels are 1.80× too wide and 26% too close together**,
       and should be ellipses (ry/rx 1.314). "Fill the container rather than
       fit the design" has now been found four times — it is a house habit,
       not a coin habit, and worth a sweep of every motif.
     - ✅ **DONE v1.61.0 — the dime's jaw line.** Now a filled region
       tapering 2.90 → 1.80 units (ratio 1.505, was 1.000 by construction);
       centreline unchanged. D6 obverse 0.2493 → 0.2145 @84. The
       photograph contradicted the brief and won: the shadow is widest and
       deepest **at the chin**, not at the overhang. **D7 obverse also
       passes now** — its 111° knot is at the bust truncation and the
       frozen mask's own turn there is 99–122° against a straight-cut
       control at 6.4–37.9°, so it is a corner the die cuts and is declared
       exempt (knot 23) rather than smoothed.
       ⚠️ **Left owed by that round:** the throat region `shade`'s top edge
       looks 1–2 units too high (its own dark run sits 3–4 units below the
       jaw on `dime-obv-2`), and jaw-to-throat clearance is now 0.08 units
       where the photograph shows a gap.
     - 🔴 **A frozen target, not the photograph, is the binding constraint
       on the dime's chin.** The `chin` tone patch is correctly sited, but
       in our flat-palette raster it spans two palette steps, so its median
       crosses on a ~4 % area change and |Δ| jumps 0.073 → 0.081 → 0.121 →
       0.229 → 0.282 with nothing in between. A repair had to be biased 0.8
       units to stay off a step. Worth a judge round: a median over a
       two-step raster is not a tone measurement.
     - 🔧 **`_jd9d7.mjs` mislabels every path in its secondary table.**
       `marks()` returns no `d` field, so the authored-vs-fitted test
       evaluates against `''` and prints "AUTHORED (M/L/Z only)" on paths
       that are all cubics; the offending knot prints `(?)` because
       `turns()` returns `at`, not `p`. The headline FITTED HEAD figure is
       computed separately and is correct, which is why it survived.
     - ✅ **DONE v1.58.0.** MONTICELLO and E PLURIBUS UNUM (dime, quarter)
       are drawn; caps went from 0.40–0.79 of the references to ~0.97 and
       spans to within 0.1°; per-coin presence floors put a legend on all
       eight faces at the 84px naming draw, where three reverses had been
       blank discs. The round also retracted three D5-band PASSes that had
       compared disjoint bands (bottom-legend baselines are the band's
       OUTER edge — see the retraction in the histories).
   - ✅ **v1.60.0 cleared three of those four, and RETRACTED the fourth.**
     E PLURIBUS UNUM is now drawn on the **cent** reverse (the fourth
     missing legend, previously absent at every size) — as **two straight
     lines**, not two arcs: a free-centre circle fit returns a best radius
     of 1002 units, 33× the coin, and the concentric model is 1.41×/1.76×
     worse. FIVE CENTS is now an **arc** on the nickel (baseline r 31.67 —
     the brief's "r ≈ 28" was the band *midline* where the convention needs
     the outer edge, which would have sat it 3.5 units too far inboard).
     🔴 **RETRACTED: the cent does NOT read "UNITED STATES *of* AMERICA".**
     Both letters are capitals, simply set smaller than the surrounding
     legend — checked on two references by the specialist and then directly
     by the judge on a 3× crop. This was published in v1.58.0 on a round-1
     incidental observation that nobody opened the reference to confirm.
     What *is* true and now replaces it: we do not reproduce the **size
     contrast** on OF, and `arcText` applies one size per call. Also found
     while verifying: the coin sets **E·PLURIBUS with a raised dot** and we
     emit a plain space.
     Still owed: `INS_REST_MIN = 110` withholds every secondary obverse
     line (dates, second mottoes) at the naming size — those floors have no
     frozen target to derive from yet.
   - 🔴 **D5-HF on the quarter obverse (2.0089× against ≤1.50×) is NOT
     repairable by lettering geometry, and the real miss is elsewhere.**
     Measured rather than tuned: the coin's obverse band is r 36.6–43.5 with
     cap 6.9 (cross-checked — that 6.9 matches the frozen *reverse* legend's
     cap to a tenth); ours is r 36.09–40.18 with cap 4.09, so the baseline is
     right and **the cap is 41 % short**. Drawing the coin's own cap makes
     HF *worse* at 84px (2.0089 → 2.6300) while helping at 190px, because the
     photograph's HF collapses 0.6254 → 0.1578 as relief blurs out while ours
     only falls 0.7465 → 0.3170 — vector edges stay hard. **The owed item is
     D5-cap-obverse at −41 %**, which is unmeasured and has no frozen target
     (`_jq4band.json` holds reverse legends only, and rules the obverse proof
     plates out at ±2–4.5 units of scale error). Freezing an obverse band
     target is the next judge task on this coin.
     - Dime reverse leaf count is **low confidence** and the dime has only
       **one** reference (its two files are the same photograph).
     - The quarter's scale confidence is the weakest of the four at ±3%.
     - Close the nickel's ±1.1% scale gap (`OBVERSE.nickel.s`).
   - **Measurement hygiene learned the hard way: six tools produced
     confident, plausible, wrong numbers** during this work — a path
     rewriter that handled `M`/`L`/`q` but not `C`; a strand tensor that
     did not change when the art changed; a tone tool that read a 3-channel
     buffer as 1-channel; a peak finder that returned 0 for four rectangular
     columns; two extent finders that returned a search bound. Standing rule
     now in the method: **change the input and confirm the number moves
     before trusting it**, and two bit-identical answers from two different
     inputs is not agreement.
   - Superseded plan for R5: `src/screens/money.js`, the seven waves
     wired, THREE appended pets shipped in the SAME commit as their
     three grouped milestones, Grown-Ups `data-subj="money"` toggle + `SUBJ_LABELS`
     (adding the schema key alone creates no control), and adoption of
     `src/art/coins.js` — written and tested in v1.50.0 and STILL wired
     into nothing; store/wallet/cointray all still draw CSS discs.
   - **When money ships, its `trail.js` record needs `timed: false`** — the
     shipped-track factory defaults `timed: true`, which would contradict
     the untimed mastery the engine enforces.
   - ✅ **Money rewards halved and pets capped (owner, 2026-08-08).** The
     draft paid 5¢ for all 134 identities plus 7 × 100¢ = 1370¢, which
     out-earned the 1200¢ crown — one track buying the most aspirational
     thing in the store. Revised to **674¢** (49.2%) and **3 pets**:
     waves 1–4 (recognition and counting) pay a 1¢ `skill` penny, waves
     5–7 (make an amount, count change, notation — the genuinely new
     fluencies) pay a 5¢ `mastery` nickel, and 3 grouped milestones pay
     100¢ each instead of 7. Wave 1 falls 25¢ → 5¢, the deepest cut,
     because recognising a dime is the app's smallest unit of learning.
     Payouts are made in real COINS, so 1¢/5¢/100¢ were the only levers —
     and all three already exist at those amounts, so this still needs no
     `RATE_VERSION` bump and no `fixtures-rates.json` change. Full table
     in docs/PHASE7.md.

   Also open from the economy audits: stale placements can pre-place a
   re-bought item (partly scoped by store epoch); `profileSignature`
   memoization; assorted minor findings (A-F5 malformed-event edges,
   A-F10, B-m2/m3/m7/m8/m10). Ledger compaction stays deferred — it
   needs its own lossless cross-device design.
9. **Phase 8 — Beyond.** Fraction equivalence recognition first (highest
   predictive value), then mental math within 100/1000, 10-more/less,
   squares/primes.

## Recently shipped (July 21)

- The automated readiness trail v1.18–v1.20: tri-state ✨Auto subjects,
  reveal ratchet (nothing earned ever vanishes), hero rotation, zoom
  prevention, worst-case fit sweep, Type it! ⌨️, Take away! 🥣,
  Counting paths 🐾, full tables readiness. Trail runs pre-K → ÷ with
  no parent gates required.

## Recently shipped (July 19)

- Little guidance layer + verification tightening (v1.10.0), vocabulary
  canon + reward chips (v1.9.0), echo-first fact intros (v1.11.0), Meet
  the table lessons (v1.12.0) — teach-before-drill now spans the app.

## Prioritized (new)

- ~~Readiness gates can't see skills proven above them~~ ✅ FIXED
  v1.41.0: higher-track history satisfies lower-track readiness
  (visibility only — nothing synthesized). Original note (mid-trail
  readiness case, 2026-07-25): `addingReady` only reads little-pup counting skills, so a
  child onboarded mid-trail (straight into tables) can never auto-qualify
  for the tracks below — parents must force them on. Options: strength
  above implies readiness below (any multiplication history satisfies
  addingReady), or a one-time placement shortcut. Related: the v16
  migration collapsed true/false→'auto', so pre-trail manual enables are
  indistinguishable from auto reveals when diagnosing these.

- ~~Little pups can't use the store~~ ✅ resolved v1.29–1.31: store
  reachable from the Cozy Corner; micro toys (10–15¢) sized to little
  savings; pets receive toys via corner give-chips. Still open: a
  little-home piggy swap UI (see parked list).

## ✅ SHIPPED v1.52.0 — decided with the owner 2026-08-07

**A. Polishing becomes a visible activity (its own release).**
Polishing already works and is better aimed than the README says: a fact in
box 0 is ALWAYS due, so a penny is paid for every correct answer on a
child's weakest facts, not only on decayed mastered ones. And the activity
already exists — `buildGroomRound` sorts a dog's facts due-first, and
Biscuit's spa quizzes the 13 rustiest on the whole board. What is missing is
a ROUTE and a REASON:
- Add grooming to `suggest.js` ("Practice next" has four candidate branches
  and grooming is not one of them — the affordance a child actually looks at
  ignores the polish activity entirely).
- Raise `POLISH_CAP_CENTS_PER_DAY` 5 → **25**. My concern was that 25¢/day
  (9,125¢/yr) dwarfs the entire one-time pot (4,750¢); the owner's answer is
  that the cap self-lowers in practice, because a child who has mastered
  more facts has fewer rusty ones on any given day. The cap is a ceiling,
  not a quota. (No `RATE_VERSION` bump: the penny itself does not change.)
- Show the cap as a goal, house pattern (icon + meter + reward at the point
  of action): "🧼 3 friends need a bath · 🪙 4 of 25 today".

**B. Kid vocabulary moves from rusty/polish to the grooming metaphor.**
Owner decision: centre the kid register on **dusty / dirty / cleaning /
bath / grooming**, not rusty/polish. An animal cannot get rusty, so the
metaphor was incoherent; the grooming framing also keeps the attention on
the child's effort at a hard thing rather than on playing with the puppy.
Touches `docs/VOCABULARY.md` (the canon row), `tests/vocab.spec.js` (which
currently REQUIRES the word "rusty" in heatmap.js), `src/screens/heatmap.js`,
and `BADGE_TEXT.polish` in money.js. Grown-up register keeps "rusty" —
this is a kid-register change only.

**C. Grown-Ups backup panel (started in v1.51.0, more to do).**
- Long descriptions become collapsible, collapsed by default.
- The home-server group collapses by default unless there is EVIDENCE of a
  server. The evidence already exists without any network call:
  `isSyncEnabled()`, or a non-null `lastPushAt`/`lastPullAt`, or a probe
  that returned `denied` (a server that wants a key) or `count > 0`.
  Expand on evidence, collapse otherwise.
- On the public GitHub Pages build, hide the home-server controls entirely
  and show one line plus a link to the setup docs. A same-origin `/sync/`
  on github.io can never be a home server, so the buttons are noise and the
  probe is a pointless request. Cleanest signal is a build-time flag set by
  the Pages workflow rather than sniffing the hostname.
- Probe answer for the record: the app DOES probe, in `offerBackup()` —
  a same-origin GET to `/sync/profiles/`, carrying no key and no child data
  (enforced by privacy.spec.js), and only while backup is off and the offer
  has not been dismissed. It stops once dismissed or enabled.

## Sync honesty — ✅ SHIPPED v1.47.4 (from the 2026-08-03 cert incident)

Two iPads couldn't back up for an unknown length of time because they
never trusted the local CA. The app was honest but not *useful*, and
nothing anywhere said "this device hasn't reached the server in days".
Both features below shipped in v1.47.4; the diagnostic signature is in
deploy/README.md and per-device cert trust is now a release-checklist
item.

- ✅ **Staleness is the real signal.** Grown-Ups already stores
  `lastPushAt`/`lastPullAt`. Show "last backed up N days ago" per device
  and flag it once it passes a threshold, on the profiles screen as well
  as in Grown-Ups. A device silently not syncing for weeks is the
  failure mode that actually costs progress — and it also catches a
  stranded service worker, since a device that can't sync can't update.
- ✅ **A transport failure on an https origin names the likely
  cause.** JS cannot see *why* a fetch failed (a TLS rejection is an
  opaque error), but the app knows it is on https and knows the cert is
  locally signed, so the offline message can add: "if this device has
  never trusted your home server's certificate, backup fails silently —
  open https://compounded.lan in Safari to check." Companion to the
  existing http-transport acknowledgement.

## Parked / reconsider later

- **Voice variety pool** (2026-08-01): the unchosen options in
  `VOICE_OPTIONS` (extra bird chirps, rabbit vocalizations, dog barks)
  are deliberately kept — a future "the pets have moods" or
  daily-variety feature can draw from them instead of new synthesis.

- **Append-only ledger growth** (2026-08-01): pawBucks.txns only grows
  (deterministic ids make it merge-safe). Fine for years at kid pace,
  but unbounded; compaction needs its own lossless cross-device design
  (checkpointing + tombstoned prefixes) — NOT attempted in the
  hardening wave.

- **Pets #25–26 reserved**: Trace it! shipped as milestone #24
  (v1.35.0); the last two pets still have no earning path — candidates:
  shapes/pattern mastery, a Surprise! ladder, or Phase 7 money-math
  milestones.
- **Dependency pin to revisit:** `overrides.brace-expansion = ^5.0.8`
  in package.json (v1.32.2, 2026-07-31) force-pins across majors to
  clear GHSA-mh99-v99m-4gvg (all ≤5.0.7 vulnerable, nested 5 deep under
  workbox-build). Drop the override once workbox-build/ejs/jake/filelist
  ship patched ranges — check with `npm ls brace-expansion` and
  `npm audit` after removing it. Full rationale in CLAUDE.md and the
  v1.32.2 CHANGELOG entry.

- Boredom guard: wrong answers faster than ~600ms stop RESETTING little
  streaks (still never build them) — awaiting observation of the v1.18
  ratchet's effect first (user, 2026-07-21).

- **Kid-facing wording, still open** (from the v1.53.2 agreement audit):
  the piggy bank says "paw cents", which is not in docs/VOCABULARY.md's
  currency row (penny/nickel/dime/quarter) — agreement was fixed, the WORD
  was left alone because changing it is a register decision. Also
  `home.js` at n=1 reads "1 more unlocks as you master their × tables!":
  grammatical, but "their" is loose for a single item, and rewording it
  touches the master/strong register.
- Back-pay grant for pre-earning mastery (after calibration).
- Biscuit dirt/groom interplay rethink (user is mulling; Biscuit currently
  never dirty, grooms board-wide rustiest).
- "Squeaky Clean" achievement family (deferred).
- Printable/exportable progress reports for grown-ups.
- **Colouring book (side project, off the app's critical path).**
  `scripts/coloringbook.mjs` renders every dog, friend and wearable as
  black line art and lays them out as a print-ready PDF, using the
  chromium Playwright already installs — no new dependency, nothing
  shipped to the PWA. Two treatments exist for marks that carry no
  outline in the source art (blush cheeks, the turtle's shell plates,
  the sloth's brow tuft): `--drop` removes them, the default gives them
  a grey edge so they read as a suggestion rather than a boundary.
  Owner reviewed both, 2026-08-08. Notes for whoever touches it next:
  fills go white (never removed) so drawing order keeps occlusion;
  stroke width is derived from the target millimetres on paper, because
  SVG user units make line weight scale with drawing size; and three
  cases are NOT colour-only marks despite looking like it — a cat's
  whiskers (a stroked `<g opacity>`), a rabbit's teeth (white fill with
  its own brown stroke) and a dog's tongue (a straight top edge that
  only the mouth's *stroke* covered, so the book clips it to the mouth
  curve). The 120×120 viewBox is widened to `-4 -11 128 128` for the
  book because rabbit ears reach y = -7 and would print sliced flat.
  The script is intentionally uncommitted for now — it should ride
  along with a future commit that carries real code changes (user,
  2026-08-08).

## Done (chronological highlights)

Profile durability + hermetic test suite; adaptive speed bar (v4);
teach-on-misses; time-based review; sounds & haptics; achievements → tiered
families (v6, v8); missing-number → division track + 12 division dogs (v5);
accessories + ÷ heatmap; encourage-new-facts bundles A–E; Little Pup mode
(v7) + buildout + honing (v11: skills/adaptive range/guided recount);
home simplification; self-paced hints; iPhone/iPad fit; public repo +
GitHub Pages; grooming Phase 1; wardrobe Phase 2 (v9); Paw Bucks Phase 3
(v10); store gear assets + teaser.

