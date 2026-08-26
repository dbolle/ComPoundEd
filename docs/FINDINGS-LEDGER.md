# Findings ledger — the ten-face sweep and the dime-reverse loops

Owner, 2026-08-24: *"It seems like we keep rediscovering the same issues but
stopping before fixing them."*

That was correct. Across ten face rounds and four dime-reverse loops every
finding was recorded faithfully and then the next face was dispatched, so
successive rounds re-found the same defects while the fixes stayed queued.
**A finding that is recorded but not scheduled is not progress.**

⚠️ **This file was rebuilt on 2026-08-24 after a union merge duplicated rows
A4–A17 with conflicting statuses.** A ledger that cannot be trusted is worse
than none. One row per item; status verified against the code, not copied.

Status: **OPEN** (confirmed present) · **FIXED** (with the version) ·
**BLOCKED** (needs evidence or an owner decision that does not exist yet) ·
**WONTFIX** (declined, with the reason) · **TABLED** (owner has parked it).

**An item may only move to FIXED with a verification command beside it.**

---

## 0. Standing rulings from the owner

**R1 — THE $1 NOTE IS TABLED (2026-08-24).** It is substantively different from
the coins and needs its **own pipeline**, not the coin machinery bent around it.
**Its aspect ratio must differ from the real note**, per the owner's research on
artistic representations of currency — so a gate scoring our note against the
real note's proportions is asking the wrong question. Everything note-only below
is TABLED, not failed. **Do not dispatch note art rounds.** Note findings already
measured stay recorded, because the separate pipeline will want them.

**R2 — LOCAL REGRESSION IS ALLOWED WHEN IT SERVES A HOLISTIC FIX
(2026-08-24).** Where several coupled parts of a face are wrong, correcting one
may make the whole *temporarily* worse — fixing the dime's oak branch can lower
the overall read while the leaves are still wrong. **A round is not required to
improve every number.** The judge's job is to keep rounds working **sequentially
toward a holistic solution**, and to detect a loop that is **spiralling** rather
than converging.

### The convergence test — how to tell the difference

**CONVERGING**, round over round:

1. **Each round explains the previous failure** rather than merely avoiding it.
   *(Loop 2b explained the TV aerial via `reach = ped + blade`; Loop 3 explained
   the bead chain via the width profile along the midrib.)*
2. **A new measured quantity enters** — not a re-tuned constant.
3. **The diagnosis gets more specific**, and earlier claims are retracted with
   numbers.
4. **Refusals are backed by numbers.**

**SPIRALLING** — stop it, and say so:

1. **The same subject is reverted twice with no advance in the diagnosis.**
2. **Conclusions oscillate** (A → B → A) with **no new evidence** between them.
3. Rounds **re-tune constants** instead of measuring a new quantity.
4. The **evidence base has not grown** but conclusions keep flipping — the
   references cannot settle it, so more rounds cannot either.
5. A round's justification is **a score**, not a measurement or the picture.

**On spiral: stop the loop, publish what is genuinely unresolved, and name what
new evidence would settle it.** Three references have repeatedly proved
insufficient; the honest output is then a request for a fourth, not a fifth
round.

---

## A. Gates and instruments

| # | Finding | Status |
|---|---|---|
| A1 | **T1 had no `buck` row** — "32/32" was four denominations. Fixed by making the grid→pixel map per-subject. **Superseded by R1**: the note gate stays, but note verdicts are advisory until the separate pipeline exists. | **FIXED** v1.93.0 |
| A2 | **T1's dime-reverse pool counted one photograph twice.** One transfer cell moved (0.290→0.289); the **control** fell 0.995 → 0.647/0.776/0.779 — it had been sorting a photograph against itself. | **FIXED** v1.93.0 |
| A3 | **`dime-rev-proofbright.png` was absent from the pool.** Added. | **FIXED** v1.93.0 |
| A4 | **`_jb14d1.mjs` held a stale copy of our geometry** — *both* sides of its IoU were literals, so `IoU 0.1496 FAIL` could not move for any reason. Live: 0.8834, and **0.9872 PASS** border-registered. Retired by move. | **FIXED** v1.91.0 |
| A5 | **`_jb3seal.mjs` likewise.** Five of six buck D2 FAILs are PASSes; the sixth is an artefact of A6. Retired by move. | **FIXED** v1.91.0 |
| A6 | **`_jb1fit.mjs`'s border corners land 6–8 px onto blank paper.** Resolved *around* it: independent sub-pixel rule fits give **2.6352 / 2.6393** (0.09 % apart) v the published 2.5610 / 2.5827, so the anisotropy 1.3145 is **2.5–3.6 % low**. The file is a wrapper around a gitignored module. Note-only. | **TABLED** (R1) |
| A7 | **`_jb8geom.mjs` failed its own response test** — two stale self-copies. Response now moves the whole device group (0 → 15.8974 %) with a null test; six D8b rows retracted. | **FIXED** v1.91.0 |
| A8 | **`_jb15look.mjs` rendered sizes the app never draws** and omitted the naming draw. Retired. | **FIXED** v1.91.0 |
| A9 | **The area `discOf()` is wrong in kind.** `_rimfit.mjs` recovers a **known** radius on synthetic discs to 0.014 px, null-tests against an independent estimator to −0.078 %, and demonstrates the failure it replaces (area −19.65 % on a synthetic annulus). **THE COUNT OF NINE WAS WRONG.** Only **two** live instruments returned an unrefined `sqrt(area/π)` as a coordinate — `_nk17grid.mjs`, `_nk1cmp.mjs` — and both are now on the rim fit. `_jq42indep`/`_jp2indep`'s `discOf` is a frozen table plus a Kasa **rim** fit, and `_py1grid`/`_py2text`/`_py3band` use area only as a seed. Verify: `node coloringbook/judge/_rimfit.mjs` · `node coloringbook/judge/_nk17grid.mjs` | **FIXED** v1.95.0 |
| A10 | **`_nk3over.mjs` carried a failing area fit.** Repointed; now prints the error it used to register on. | **FIXED** v1.91.0 |
| A11 | **`_jq8contain-v2.mjs`'s `RESPONSE=1` threw** on a missing anchor, so D8's ability to move was unverified while D8 verdicts shipped. 0 → 4.1890 %, injection asserted real, null test added. | **FIXED** v1.91.0 |
| A12 | **`_jc5corner.mjs` queried a coordinate removed at v1.63.0.** Retired. | **FIXED** v1.91.0 |
| A13 | **`_jh8locus.mjs` printed "end marker not found" and carried on.** Now asserts the response case both ran and moved. | **FIXED** v1.91.0 |
| A14 | **Frozen artefacts overwritable from a CLI flag.** `_freeze.mjs` guards three instruments — one an unrecorded fourth instance. | **FIXED** v1.91.0 |
| A15 | **`_jp1discs.json` missing/unusable entries.** Correction published beside the frozen file; a resolver refuses the unusable entry. One instrument had been registering a reference **44.3 % too large**. | **FIXED** v1.91.0 |
| A16 | **Suspected shared photographic setup (NCC 0.459). REFUTED** — ≈cos(57°) between two unrelated background ramps, and pairs *known* to share a plate score **0.039 and 0.106**. The statistic ranked shared setups *below* unrelated ones. | **FIXED** (refuted) v1.91.0 |
| A17 | **An instrument holding its own copy of the subject.** `_sw7gen.OVAL` is round 0's superseded locus (cy 30.30, ry 14.00) where the art draws cy 31.38, ry 15.75 — **ry 11.11 % short** — and `coatPath()`/`outsideOval()` compute from it. **`_sw7gen.mjs` is the BUCK OBVERSE vignette generator, so it is note-only and R1 tables it**; the ledger row that said otherwise was wrong. The drift is now *detected* rather than assumed. Verify: `node coloringbook/judge/_sw8sync.mjs` | **TABLED** (R1), drift measured |
| A22 | **63 of 286 instruments cannot run in any worktree or clone** — `.gitignore` keeps the eval libraries out, so §1.1's reproducibility promise does not hold for 22 % of the library. | **BLOCKED** (owner) |
| A24 | **`_jq20indep.bestReg`'s refine is unanchored** — it rebuilds its offsets inside the loop that reassigns `best`, so the search walks past its declared bounds. **148 of 231 pool pairs (64.1 %) finished outside ±0.035 R, worst 0.075 R, NCC inflated by up to +0.0537 (mean +0.0077).** Path-dependent: `dv` walks 4× further than `du` because it is the inner loop. Old file left byte-identical at `80aec1aa…`; superseded by `_jq20indep-v2.mjs`, which anchors and reports `atBound`. **T1 is 32/32 under both**; every off-diagonal cell moved and every margin widened. Verify: `node coloringbook/judge/_jq20indep-v2.mjs` | **FIXED** v1.95.0 (retract-beside) |
| A25 | **The primary gate could not run in a worktree.** Not three gitignored modules but **eight** (`_rvnorm`, `_rvdisc`, `_qtdisc`, `_qtedge`, `_qtseg`, `_nkdisc`, `_pyellipse`, `_pyseg`, 638 lines). Fixed by **tracking** them — eight `!` lines in `.gitignore`, no import rewritten, **no instrument hash moved**, and the bytes are the ones already hashed in `_jd0hashes.json`/`_jp0hashes.json`/three scorecards. `coloringbook/ref/` stays untracked by policy (third-party, never redistributed) and is linked by `scripts/round-setup.sh`; T1 now preflights and names it. Verify: `node coloringbook/judge/_jt1transfer.mjs` in a fresh worktree | **FIXED** v1.95.0 |
| A26 | **Live reproduction of registration-defeat inside the pool:** two files that are the *same image* score a **registered** design NCC of **0.019**. Duplicate detection must not register first. | **FIXED** (method) v1.93.0 |
| A27 | **`nickel-obv.jpg` + `nickel-obv-unc2004.jpg`: CONFIRMED the same photograph.** MADbox 5.01, dHash Hamming 3, both inside `_jt4pool`'s own rule (MADbox < 6 **and** dHam ≤ 6). The duplicate cluster runs MADbox 1.25–5.01; the nearest different-photograph pair is **57.14** — an 11× gap, so "largest of the four" is not "borderline". The excess is resolution, not content: the pair is 3.05× apart in linear size, and downscaling the large file to 500×492 gives MADbox **4.01, dHam 1**. **No T1 row moves** — `unc2004` was already excluded and `nickel-obv.jpg` already in the pool; the exclusion is now backed by evidence instead of by one statistic. Verify: `node coloringbook/judge/_jt4pool.mjs` | **FIXED** (confirmed) v1.95.0 |
| A28 | **`penny-rev.jpg` p95 4.9 % of R.** The §2.1 diagnosis was wrong: the coin is square-on and the disc is **CROPPED** — ~11 px off the left frame, ~23 % of scored rays terminating on the boundary at 155–208°, a straight-chord residual (150° +9.9, 180° −9.4, 210° +12.6) where obliquity gives a smooth two-cycle. **Published as unusable for geometry**, because three independent fitters disagree on R by **8.46 px = 3.39 %** (both pool-mates: 0.47 %) and no coordinate can be published that they agree on. Retained in T1 with its margin stated (sorts penny 0.517 v 0.193). `_rimfit.mjs` gained a frame guard, ground-truth tested. Verify: `node coloringbook/judge/_jpdiscs.mjs` · `node coloringbook/judge/_rimfit.mjs` | **FIXED** (published as unusable) v1.95.0 |
| A29 | **Registrations on a search bound are lower bounds.** Not a T5 property: **T1 is 64.5 % (369/572)** by the same test, beside T5's 54.0 % (1292/2392). T5 now marks every bounded cell in the table with `~` rather than only reporting the aggregate, and T1 prints its own rate beside the verdict. Verify: `node coloringbook/judge/_jt5note.mjs` · `node coloringbook/judge/_jt1transfer.mjs` | **FIXED** v1.95.0 |
| A30 | **`_jd14d1resp.mjs`'s response anchor was stale.** Correction to the finding: it did **not** fail open — it threw — and it was **not** stale before v1.93.0; it was exact at dime r0 and died when `iconS/iconCy/iconCx` were removed. The real defect is that **nothing runs the library**, so four gates were dead and shipping. The sweep found **five** stale anchors, not one: `_jd14d1resp`, `_jl1cap`, `_jl1floor`, `_jl3probe`, `_jq10tier`. All re-anchored (or retired), each with an exactly-once assertion, a proof the substitution reaches the render, and a null test. Enforcement is now `tests/judge-anchors.spec.js` in `npm test`. Verify: `TEST_PORT=4471 PORT=8371 npx playwright test tests/judge-anchors.spec.js` | **FIXED** v1.95.0 |
| A31 | **Private `tierOf` after `tier` was deleted.** Nine files carry it, not seven, and only **four** print `icon`/`mid` rows. `_jq10tier.mjs` **retired by move** (`dcf2ebb44cd4ffc1`, re-hashes identically): its "declared tier contract" table asserted a contract v1.94.0 deleted, and at 26/44/84 px the SVG now has identical element counts. `_jl1cap.mjs` corrected (tier column removed, response test re-anchored and passing). Five are hashed into published rounds and are **left unedited with the reason** — see the round report. Verify: `RESPONSE=1 node coloringbook/judge/_jl1cap.mjs` | **PARTLY FIXED** v1.95.0 |
| A32 | Byte-identity partition is an instrument, null/response/self/size-dependence tested. | **FIXED** v1.80.0 |
| A33 | Three privacy gates; the pre-push gate no longer fails open under `pipefail`. | **FIXED** v1.84.2 |
| A34 | Instruments derive paths; machine-specific values are gitignored. | **FIXED** v1.87.0 |
| A35 | `coloringbook/ref/_scratch/` stale renders. Cleared (64 present by then, not 36). Every instrument that writes there already unlinks on exit; the directory is re-created on demand. Verify: `ls coloringbook/ref/_scratch` | **FIXED** v1.95.0 |
| A36 | **`_sw8sync.mjs` WROTE `src/art/coins.js`** — `writeFileSync` at module top level, no flag, no guard. Running the instrument sweep on 2026-08-24 **edited the subject**: it rewrote `VIGNETTE.coat` to `_sw7gen.OVAL`'s superseded ellipse (ry 15.75 → 14.00). WRITERS.md's fourteen `_r<N>card.mjs` files wrote a *record*; this wrote the *drawing every gate scores*. Now a report-only drift detector that writes nothing under any flag, and its ellipse check is scoped to the VIGNETTE block (it had been scanning the whole file and throwing on an unrelated ellipse). Verify: `node coloringbook/judge/_sw8sync.mjs` | **FIXED** v1.95.0 |
| A37 | **`_jq20indep`'s rotation null test can never fire.** `Math.abs(r.rot) === 10` with `ROT` spanning −8..8 and the refine adding ±0.5, so the maximum reachable is 8.5. Half of the §4.1 check on the quarter independence matrix has always been dead. Not edited (hashed); `_jq20indep-v2.mjs` computes the bound from `ROT` itself. | **FIXED** v1.95.0 (in v2) |
| A38 | **`_jq8contain-v2.mjs` no longer matched its own frozen hash** — the A11 repair edited it **in place**, moving `512f61d57444b288` → `28717096e3a2328a` and silently breaking **seven** citations. Restored byte-exact; the repair is now `_jq8contain-v3.mjs`, and the supersession note lives in a **separate file** because putting it *inside* moved the hash again (`833c6f37…`) — the same error, one minute later, during its own repair. Verify: `sha256sum coloringbook/judge/_jq8contain-v2.mjs` → `512f61d5…` | **FIXED** v1.96.0 |
| A39 | **`_jb12tier.mjs` cannot run** — it imports `../_x6lib.mjs`, which is gitignored and so absent from every worktree and clone (A22 again, in a file `buck-scorecard.json:45` lists as an instrument of record). Note-only. | **TABLED** (R1) |
| A40 | **`deviceMask()`'s erosion is comparable to a thin element's whole width, so OUTSIDE does not measure a thin element's placement.** `erodeBy(dev, units)` shrinks every device region by `units` on **every side** — 0.55 on proofbright, 1.00 on unc2005 — and those constants were calibrated against the **torch shaft**, 5–10 units wide, where they cost 11–20 %. The dime's stem is **~2 units** wide, where 1.00 a side costs all of it. Sweeping only that argument: the oak stem reads OUTSIDE **4.11 / 8.97 / 18.05\* / 39.07 %** on proofbright and **16.95 / 26.66 / 37.81 / 56.73\* %** on unc2005 at erode 0 / 0.25 / 0.55 / 1.00, while the mask's own stem stripe goes **2.30 → 0.30** and **2.45 → 0.45**. `2.0 − 2×erode` reproduces every stripe width to 0.1. The un-eroded stripe (2.30 / 2.45) agrees with the dark-outline estimator; the eroded one does not. **Consequence: a thin element drawn THINNER scores better while being more wrong**, which is the failure mode `_dr13elem.mjs`'s own header warns about, now with a number. Not fixed here — the mask is shared and every published branch number moves with it. **The evidence that would settle it** is an erosion radius chosen per element scale, or an OUTSIDE scored against the un-eroded mask with the skirt handled explicitly. Verify: `node coloringbook/judge/_dr14oakstem.mjs control` | **OPEN** (new) |
| A41 | **`WINDOWS['oak-stem']` has a FILL ceiling of 42.8 % / 34.4 %, not 100 %.** Of the window's exclusive target, the fraction within one stem half-width of the coin's own centreline is **53.81 of 125.78 sq units (proofbright)** and **29.18 of 84.87 (unc2005)**; **68 % / 73 % of the target lies above y 54**, where the oak's own foliage stands and no stem can be. The shipped 37.58 % / 28.94 % is therefore **88 % / 84 % of the maximum a perfect stem could score**, not 38 % of a possible 100. The window contains the element with margin and is not *wrong*; it is a whole-branch column and the leaf mask inside it survives the exclusive subtraction because our leaves are drawn elsewhere. **Report the ceiling beside FILL, or FILL will keep reading as a failing grade for a correct element.** Verify: `node coloringbook/judge/_dr14oakstem.mjs window` | **OPEN** (new) |

---

## B. Dead code — CLOSED

| # | Finding | Status |
|---|---|---|
| B1–B5 | All tier-era machinery removed, including **`tier` the parameter itself**. Partition **0/60 at every one of eleven steps**; code lines 1658 → 1540. | **FIXED** v1.94.0 |
| B6 | **The dead code was misinformation, not inert** — twelve false comments retracted, including the one that misled a round (*"`fine` is NEVER true in the app"*) and a gate's entire justification, for a gate that changed nothing. | **FIXED** v1.94.0 |

---

## C. Shared helpers

| # | Finding | Status |
|---|---|---|
| C1 | `spendOf()` bounds against a CIRCLE while the note has two off-centre ellipses. Note-only. | **TABLED** (R1) |
| C2 | **"`hairFill` has the wrong sign at mid" is MOOT AS WRITTEN** — `mid` could never run. **The live question is what that sign does at 48 and 54 px**, which the app draws, and which has never been tested. | **OPEN** (reframed) |
| C3 | `CORNERS` shared between note faces; the reverse numeral never checked. | **TABLED** (R1) |
| C4 | `EAG.ry` ≠ `PYR.ry` though the two seals are the same circle. | **TABLED** (R1) |

---

## D. Art

| # | Finding | Status |
|---|---|---|
| D1 | **Quarter obverse wig: the direction field was measured wrong** and correcting marks *individually* put **8 centreline crossings** into a wig that had 0. **Re-authored as a set at v1.96.0**: every mark is an **integral curve of one measured field**, so non-crossing is a property of the construction (0 crossings, verified). The smoothing scale is chosen by leave-one-out over the three references — sigma 1.0, floor **9.08°**, curve nearly flat. **The published metric was asking the wrong question of a curved mark** (its chord midpoint is up to 2.99 units off the mark): metric A median 10.3 → 9.0° and sign **12:2 shallow → 7:7**; new metric B (drawn tangent, 9 stations a mark) **14.3 → 2.3°, 84/126 → 8/126 stations out, 10/14 → 0/14 marks**. **R2 regressions published:** T1 quarter-obv 0.573 → 0.562 (32/32 held), crown tone ~1.336 → ~1.301, eight pairs crowd by ≤0.50 units. Re-spacing (ridge duty 0.462, above the 0.350–0.443 band) and shortening (−45 % length) both refused with numbers. Verify: `node coloringbook/judge/_qw1field.mjs` · `node coloringbook/judge/_qw2gen.mjs` · `node coloringbook/judge/_qo5field.mjs` | **FIXED** v1.96.0 |
| D1a | **The quarter's wig is not one laminar family.** At x 44–52, y 22–34 (the temple, in front of every mark we draw) the measured field runs **−57° to −82°** — a near-vertical strand family the drawing does not draw at all. At the nape the three references disagree by **28°** (grooves[4]: 80.0 and 52.2, third at coherence 0.095) because the coin has a rolled **curl** and a direction field is the wrong model for a spiral. Recorded as unmeasured, not guessed. Needs a fourth high-resolution same-design reference, or a curl model. | **OPEN** (new) |
| D2 | **Quarter reverse eye: 0.92-unit gap between a recorded measurement and the drawn constant** — file says (47.6, 24.5), code draws (47.4, 25.4), on the mark the file calls the most important on that motif. | **OPEN** |
| D3 | Quarter obverse is the last face on the shared `EYE_MARK`; its shape has no derivation. The eye is ~3 viewBox units and the brow merges at every threshold. | **BLOCKED** (resolution) |
| D4 | **Dime obverse ear: too small and 2–4 units too low on all nine references** — three instruments refused themselves. | **BLOCKED** |
| D5 | **Dime obverse hairline UNMEASURED** — its ladder returns −5.50 on our own art where the answer is 0. | **BLOCKED** |
| D6 | **Cent reverse: the stepped base reads heavier than the coin's shallow platform**, and the attic block is proportionally taller. Unmeasured judge reservation. | **OPEN** |
| D7 | Cent reverse stylobate steps — 1.5 device px at 38, and T1 rises as you draw *fewer*. Ladder published. | **WONTFIX** |
| D8 | **The dime's oak lobe was a circle on a spine** — a bead chain at any depth. Re-authored from the width profile along the midrib. | **FIXED** v1.92.0 |
| D9 | Two olive fruits verified present; files disagree on size by 1.9× — published, not averaged. | **FIXED** v1.92.0 |
| D10 | **Reach/petiole/blade did not add up by ~2.5 units. The contradiction was never in the coin** — it was between two estimators, one of which reads a bevel skirt as air. | **FIXED** v1.92.0 |
| D11/D12 | **The two dime branches are not mirror images at the foot.** The oak's lowest outboard blade has the **wrong sign**, not the wrong height (+20°…+37° measured v a mirrored −13°), and the oak carries no inboard foliage below y 53 where the acorn is. Refused: seven a side cannot be spent, and only two of the oak's seven nodes are isolated well enough to measure. **Most at risk of spiralling — see R2.** ⚠️ **The 2026-08-25 corroboration from the two stems is WITHDRAWN** — see D25. This row stands on its FOLIAGE evidence alone; nothing about the two STEMS supports it. ⚠️ **2026-08-26, per-leaf scoring: NARROWED, NOT SETTLED — see D27.** The named missing input (an erosion ladder) has now been run and does not deliver; the merge objection is measured and is **wrong for this pair**; and the two files **split** on the shape test, 4.5 points to proofbright's reading and 0.4 to the shipped one. | **OPEN** (refused with numbers; one corroboration withdrawn; erosion-ladder route now closed) |
| D13 | The note's left half is empty. | **TABLED** (R1) |
| D14 | The detached capstone is not carryable at app sizes. | **TABLED** (R1) |
| D15 | **Our note is the wrong rectangle** (paper 1.7944 v physical 2.3525). **Owner ruling R1: this is correct and intended** — an artistic rendering's aspect must differ from the real note. **Not a defect.** | **WONTFIX** (R1) |
| D16 | Dime reverse: the upper olive berry is not separately readable; both its centre and the blade that swallows it are measured, so it needs a ladder change. | **OPEN** |
| D17 | Refused though it measured better: scaling the oak blade's width by `lk` — it widens every blade by up to 12 %, the trade that got an earlier round reverted. | **OPEN** (refused) |
| D18 | **Our note reverse sorts as a PENNY at all four app sizes** in the design mode. | **TABLED** (R1) |
| D19 | **The dime's torch shaft stops tapering 4.6 units early.** It is drawn parallel at 5.7 from y 69.6 to 74.2; the coin keeps narrowing to **5.00 at y 73.50** (proofbright) and **4.30 at y 74.25** (unc2005) before it flares into the foot's bead. Found by the foot round, which is capped at ~81 % FILL by it: the band y 73.5..74.2 is 3.84 of the foot window's 28.18 sq units and only the shaft can fill it. **Not a hole in the face** — the drawn shaft covers it — but it is the same defect class as the `<rect>` shaft (lesson E5), one constant standing in for a varying quantity, on the last 4.6 units the round 28 taper did not reach. Reported by the foot round, **not changed** (out of scope). Verify: `node coloringbook/judge/_dr13elem.mjs score 2.1.2 shaft` | **CLOSED** (v1.100.0 — confirmed at 86 rows and fixed; see D21) |
| D21 | **The dime's torch shaft was one straight taper drawn at 75 % of its slope, and the top anchor was the number that had never been re-fitted.** `deviceMask()` admits 86 rows between y 38 and 73.5 where the shaft's run has a ≥ 0.4 gap to its neighbours in BOTH files; least squares on the two files' mean width gives **w(38.5) = 10.20, w(73.5) = 4.67, slope −0.1583/unit, rms 0.173** — one line, no second term. Drawn was 9.4 → 5.7 at −0.119/unit then parallel: **−0.72 too narrow at y 38.5, +0.42 at y 71, +1.00 at y 73.5**. The published ratio test agrees — drawn w69/w42 was **0.642 against four measurements of 0.549, 0.568, 0.581, 0.590**, i.e. above all of them, and v1.84.0 printed its own 0.639 beside targets of 0.590/0.581 without remarking on it. The top anchor's stated justification ("9.4 sits between 9.67 and 10.41 at y 40") does not hold at the row it cites: anchored at 38.5, the taper draws **9.22** at y 40, below both. Corrected to one path, 10.20 @ 38.5 → 4.55 @ 74.2. The same fit on the run CENTRES gives **axis 50.00 → 49.83, rms 0.084** — an 86-row confirmation of the face's axis. | **CLOSED** (v1.100.0) |
| D22 | **A per-element FILL denominator counts its neighbours.** In `WINDOWS.shaft` **41.65 sq units on proofbright (12.03 points of FILL) and 27.40 on unc2005 (9.40 points) is mask drawn by the BRANCHES and the LEGEND**, because the olive branch crosses the shaft at y 45..57 and the caps of E PLURIBUS UNUM stand against it at y 62..66 — and no rectangle separates them. Credited only for mask no other element draws, the shaft fills 85.05 % / 89.06 % against the headline 74.81 % / 80.69 %. Windows cannot fix this; the fix is a target that subtracts mask already claimed by a neighbouring element's ink. **Instrument change, named as the evidence that would move these numbers.** Measured by the shaft round. | **OPEN** (new) |
| D23 | **The dime's drawn collar steps down to the shaft and the coin has no step there.** The collar is 11.7 wide to y 38.5 and the shaft now 10.20 (was 9.4). The mask runs 11.50 → 11.00 → 10.50 (pb) and 9.65 → 9.25 → 8.75 (unc) through y 36 → 38.5 → 42: one continuous taper. 0.75 per side, down from 1.15. Also `WINDOWS.head` runs to y 40 and overlaps `WINDOWS.shaft` by 1.5 units. Both the **head's** to answer. Reported by the shaft round, not changed. | **OPEN** (new) |
| D24 | **`judge/_dr9branch.mjs`'s `torchHalf()` mirrors the shaft's OLD taper** to exclude the torch from the branch windows, so after D21 it is ~0.4 units too narrow at the top. Changing it would move published branch numbers, so the shaft round left it and said so. The branch round's to reconcile. | **OPEN** (new) |
| D25 | **"A mirror that fits one side and not the other is not a mirror" — the two dime stems ARE one mirror, and the 18.05 % v 38.39 % gap was the instrument.** Both nodes rasterise to **71.91 sq units** and `branch(mirror)` negates one set of numbers, so no gap between them can be a property of the drawing; a difference in OUTSIDE had to come from the mask, and it does (A40). With the erosion off, the proofbright gap is **20.28 → 2.86 points** and the unc2005 gap **25.79 → 7.19** — **86 % and 72 % manufactured**. Decomposed row by row, **0.96 of the oak's 1.30 outside sq units and 2.37 of the olive's 2.78 is a correctly-wide stem overhanging an eroded stripe**, never placement; the eroded stripe is 1.05–1.50 wide on proofbright and **0.25–0.50 on unc2005** where the coin's stem is ~2.0. The residual after erosion is the registration slip loop 1 already pooled: against the un-eroded mask our centre is **0.28 INBOARD on proofbright and 0.87 OUTBOARD on unc2005**, opposite signs, half-difference **0.58** against loop 1's independently-measured 0.61. **No change to `stemC`, `stemHW` or `STEM_YS`; the drawing is byte-identical on all eight faces.** Widening toward the un-eroded mask refused with the number, in `torch()`. Verify: `node coloringbook/judge/_dr14oakstem.mjs control` · `node coloringbook/judge/_dr14oakstem.mjs outside` | **CLOSED** (refuted, not a defect) |
| D26 | **What could not be determined about the oak stem, stated rather than guessed.** (a) **Above y 54 nothing can be measured** — the oak's foliage closes over its stem on both files and the row-by-row decomposition returns "inside" for every row from y 38.5 to 58 because the leaf mass covers it; loop 1's extrapolation there is neither confirmed nor refuted. (b) **The tail below y 71 disagrees between the files**: proofbright's oak stem ends at y ≈ 74.3 (we draw to 75.7) while loop 1's scanline table puts unc2005's tip at y 76.2, and unc2005 carries a **second mark inboard of the stem below y 69** that defeats the dark-outline estimator. (c) A y-dependent asymmetry between the branches was tested — a slipped disc centre adds a **constant** to (oak − olive), so a shared **slope** would be real — and the two files' slopes are **−0.0125 and −0.1103 per unit**, an 8× disagreement with unc2005's own read jumping up to 1.9 units row to row. **No asymmetry established; no asymmetry excluded.** Verify: `node coloringbook/judge/_dr14oakstem.mjs foot` | **BLOCKED** (needs a third reference) |
| D27 | **Two of the dime's seven oak blades are aimed into bare field, on BOTH references, and neither is fixable without moving a petiole.** Scored one leaf at a time against the coin's own mask at **zero erosion** (`judge/_dr15oakleaf.mjs`): five of the seven are contained at **5–26 % (proofbright, both mask corrections applied) / 12–21 % (unc2005)**, and none of the five passes by cheating — no leaf puts any ink on the legends and only two touch the torch (8.1 %, 5.5 %). The two that fail: **2.1.14 (mid-inboard) 57.87 % / 52.86 %**, all of it inboard of the coin's own foliage edge, which the two files put at **offset 9.2–12.7 on every row from y 35.5 to 43** while this blade runs from 5.9 — its **midrib alone** is 2.9 units out of bounds at y 40, so no outline change, narrowing or shortening reaches it (blade 12 → 8 only moves it 37.71/32.80); and **2.1.12 (mid-outboard) 30.91 % / 37.50 %**, all of it outboard, bridging a notch where the coin's edge falls from ~30 to 21.3–23.5 at y 46–47. Both faults are `rot`, and `rot` rotates the petiole. **Refused with the numbers**: 2.1.12 +17 → +35 takes it to **8.54 / 4.74**, 2.1.14 inboard +45 → outboard +25 takes it to **8.92 / 6.87**. Also confirmed here, at the coordinator's request: **2.1.6 reads 26.60 % and neither correction moves it** (the fork is worth 0.0 points on that node) — it hangs down-and-inboard into the bare band between the foliage above it and the acorn below, covering offset 5.2–13.9 at y 53–55 where proofbright has device only at 4.4–5.3 and 12.9–15.7; the coin's own inboard blade there is 4–5 units higher. Verify: `node coloringbook/judge/_dr15oakleaf.mjs outside` · `probe 2.1.14` · `probe 2.1.6` | **OPEN** (measured, refused for scope) |
| D28 | **A THIRD oak blade is measurable, and it is a second, independent vote against node 2.1.12's angle.** The erosion ladder D11/D12 asked for was run (`_dr15oakleaf.mjs split`, erode 0 → 2.4 on both files) and it does **not** resolve seven blades — four components at best on proofbright, three on unc2005, and the files disagree on which. What it did yield is **proofbright (76.9, 41.4), 10.8 × 5.4 at erode 0.8, axis +44°, centre stable to 0.1 units through erode 2.4** — node 2.1.12's blade, ~**12.2 × 6.3** extrapolated to zero erosion. That matches the 12.0 length this file draws and **contradicts its +17 angle**, agreeing instead with the containment sweep's independent optimum of +35..+40. Not on unc2005 at any erosion. | **OPEN** (one file; hand to the ladder round) |
| D29 | **D11's shape test splits between the two references, so the row is not settled.** Seating row 1 outboard at +25 and the shipped row 2 outboard at −13 put their ink centres **0.69 and 0.66 units** from the coin's own blob at that node — the centre cannot discriminate, because they are two ways of covering the same piece of coin. Matched by SHAPE (component dilated back to its own erosion, clipped to the un-eroded mask): **proofbright 51.5 % v 47.0 % IoU** (favours the ledger's reading), **unc2005 41.2 % v 41.6 %** (a tie favouring the shipped one). Neither exceeds 52 %, because the component is **105.75 / 90.80 sq units against a 53–58 sq unit blade** — still a cluster, and a cluster cannot adjudicate a blade. **The stated merge objection is refuted for this pair**: swapped, rows 1 and 2 share **0.0 %** of their ink. What the swap costs instead is that the swapped row 2 puts **40.8 %** of its ink on the other five leaves and 16.8 % on the torch. Missing input unchanged: a third photograph, or an isolation leaving ~60 sq units. Verify: `node coloringbook/judge/_dr15oakleaf.mjs blade proofbright 0.8 74.4 52.9` · `swap 25 20` | **BLOCKED** (needs a third reference) |
| D30 | **The dime's crown pair is one object.** 2.1.16 and 2.1.17 share **57.4 %** of the smaller leaf's ink; every other pair of the seven shares 0.0 % except 2.1.6/2.1.10 (14.0 %) and 2.1.10/2.1.14 (5.2 %). Their OUTSIDE is fine — 6.10/15.72 and 13.30/16.17 — which is the point: **a merged pair is invisible to a containment score and instant in the picture.** This is the "tulip cup" `torch()` has named twice. Verify: `node coloringbook/judge/_dr15oakleaf.mjs pairs` | **OPEN** (new) |
| D31 | **`judge/_dr13elem.mjs` cannot see two of the three legends.** Its "everything else" set is siblings plus any **top-level `<text>`**, and on the dime reverse only E PLURIBUS UNUM is a bare top-level `<text>`; UNITED STATES OF AMERICA and ONE DIME are `<text>` wrapped in a `<g>` that carries the font, and node 4 runs to **y 58.7 across x 13..87** — through the outboard half of every branch window. FILL exclusive on the branches has been charging each element for lettering mask. Measured on the oak's seven leaves the error is **0.0–2.4 sq units** of exclusive target (worst on 2.1.8); nearer the rim it would be larger. `includes('<text')` fixes it. **Left unfixed in `_dr13elem.mjs` on purpose**, so every number already published against it stays reproducible; `_dr15oakleaf.mjs` uses the corrected rule. | **OPEN** (new) |
| D32 | **`--reopen 1.0` is right on `dime-rev-proofbright.png` and destroys `dime-rev-unc2005.png`'s mask — the threshold is a property of the photograph, not of the method.** On proofbright the two populations separate cleanly (18 enclosed-field components at ≥ 1.0 sq unit = 44.2 sq units; 5985 below it; nothing between). The same scan on unc2005 finds **27 components ≥ 1.0 totalling 456.8 sq units**, and the largest is **101.13 sq units at x 45.8..57.1 y 17.3..33.8 — the torch flame's interior** — followed by 49.51, 36.90, 34.44 and 30.05, every one of them a **leaf belly**. unc2005 is a dark-outline photograph with bright device interiors, which is the exact case `_dr9branch.mjs`'s inward flood exists to close ("interior hollows (line art's white leaf bellies)"); reopening it at 1.0 deletes the device and all seven oak leaves read **68–81 % outside** instead of 12–21 %. **There is no clean threshold on that file** — its real gaps and its device interiors are both large, with nothing between them. `_dr15oakleaf.mjs` therefore applies the correction PER FILE, on this measurement, rather than as a default. Verify: `node coloringbook/judge/_dr15oakleaf.mjs holes` | **OPEN** (new; affects any round quoting `--reopen` on unc2005) |
| D20 | **`judge/_rescore.mjs`'s D11 stage cannot run**: it shells out to `coloringbook/_x6mat.mjs`, which is not a tracked file and does not exist in a fresh checkout, so the stage dies with `MODULE_NOT_FOUND` and D11 is silently absent from every rescore. Pre-existing, seen by the foot round. Lesson E17 exactly: a guard nobody can run is not a gate. | **OPEN** (new) |

---

## E. Lessons — apply these, do not re-learn them

1. **Look at the render; the gate cannot see most of these.** T1 scored 32/32 on both sides of a 6.5-unit eye error, rose 0.336 → 0.451 on a drawing that read as a tulip, and 0.419 → 0.461 on one that read as a TV antenna.
2. **T1 is not the arbiter**, and its own control sorted a photograph against itself until v1.93.0.
3. **Coverage is not identification.** *(The judge's error, caught by the owner.)*
4. **A passing check on an OUTER bound says nothing about the INTERIOR.**
5. **A single constant standing in for a varying quantity** — the `<rect>` torch shaft, `ax: 15.9`, one blade size for seven nodes.
6. **Is the mark ATTACHED to what it belongs to, or merely placed near it?**
7. **When two references disagree by 2×, publish the disagreement** — that mean built the TV aerial.
8. **A quantity may not be free if something else already constrains it.** `reach = ped + blade`.
9. **An instrument must never hold its own copy of the subject.**
10. **Never `| grep -q` under `pipefail`** — it fails open, and was rewritten into a new verifier an hour after being documented. Enforcement must be a test, not prose.
11. **Ratios of two features on the same photograph** cancel registration error and the bevel skirt.
12. **Fit the RIM, never the area** — *"it is a proof"* is not the test; the surround is.
13. **Dead branches carrying stale numbers manufacture false findings.**
14. **A duplicate detector must not register first** — two identical images scored 0.019 registered.
15. **Chase a disagreement into the instrument before blaming the reference.**
16. **R2: a round need not improve every number.** Judge **convergence**, not monotonic improvement — and stop a spiral rather than feed it.
17. **A GUARD IS NOT A GATE IF NOBODY RUNS IT.** All five stale-anchor
    instruments *did* check their anchor and *did* throw. Four had been dead for
    one or two releases and their verdicts kept shipping, because running the
    library is nobody's job. The fix is never a better guard; it is moving the
    check into `npm test`, which cannot be skipped. (Lesson 10, second offence.)
18. **A DETECTOR THAT HAS NEVER SEEN THE FAULT REPORTS ZERO.** The first A24
    measurement said "0 of 384 pairs walk, ΔNCC 0.00000" and it was a harness
    bug — an array passed into a `step` parameter — that made every score `NaN`.
    It looked exactly like a clean bill of health. **Null-test the instrument
    against a case where you KNOW the answer is non-zero, before you publish a
    zero.**
19. **A METRIC CAN ENCODE A SHAPE ASSUMPTION AND NOBODY NOTICES UNTIL THE
    SHAPE CHANGES.** The quarter wig's direction gate compared a mark's CHORD
    with the coin at that chord's MIDPOINT. That is the same question only for
    a STRAIGHT mark. When the marks became curves the midpoint moved up to 2.99
    units off the mark — onto a neighbour — and `_qo5field`'s own null test
    refused to report on art that was closer to the coin. Publish the old
    metric, say what it now measures, and add the one that asks the question.
20. **IF INDIVIDUAL CORRECTION MAKES A FAMILY CROSS, THE FAMILY IS THE OBJECT.**
    Fourteen marks rotated one at a time gave 0.1° and a starburst. The same
    fourteen drawn as integral curves of one field gave 2.3° and zero crossings,
    because two integral curves of a single-valued field cannot cross. The gate
    was never the enemy; treating members of a comb as independent was.
21. **A SEARCH THAT DEPENDS ON LOOP NESTING ORDER IS NOT A MEASUREMENT.**
    `bestReg`'s `dv` drifted 0.075 R and its `du` only 0.045, for no reason
    except that `dv` is the inner loop and gets nine rebuilds to `du`'s three.
22. **AN INSTRUMENT MAY NOT WRITE THE SUBJECT.** WRITERS.md said "does not
    write" about the evidence trail. `_sw8sync.mjs` wrote `src/art/coins.js`.
    The rule is wider than the file it was written in: **running any instrument,
    in any order, must leave the repository byte-identical** — art included.
23. **A CORRECTION SHEET MUST BE ABLE TO REFUSE.** `penny-rev.jpg` has no
    publishable disc: three fitters disagree by 3.39 % of R. A sheet that can
    only *correct* forces you to invent a number in order to say a thing cannot
    be measured.
