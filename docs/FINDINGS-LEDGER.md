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
| A38 | **`_jq8contain-v2.mjs` no longer matches its own frozen hash.** Recorded as `512f61d5…` in `_jd0hashes.json:43`, `_jp0hashes.json:54`, `quarter-scorecard.json:59`, `penny-scorecard.json:31`, `nickel-scorecard.json:25` and `nickel-gates.md:49`; the file is now `28717096…` after the 2026-08-24 A11 repair edited it **in place** instead of superseding it beside. The most widely cited instrument in the library is the one whose hash is broken. Not fixable by editing — the record must be corrected, or the file restored and a v3 published. | **OPEN** (record) |
| A39 | **`_jb12tier.mjs` cannot run** — it imports `../_x6lib.mjs`, which is gitignored and so absent from every worktree and clone (A22 again, in a file `buck-scorecard.json:45` lists as an instrument of record). Note-only. | **TABLED** (R1) |

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
| D1 | **Quarter obverse wig: the direction field is measured wrong** (median 10.3°, worst 37.8°, 9 of 14 outside the between-reference spread) and correcting marks *individually* puts **8 centreline crossings** into a wig that had 0. **Must be re-authored as a set.** **R2 applies**: expect advisory numbers to move the wrong way mid-way. | **OPEN — largest art item** |
| D2 | **Quarter reverse eye: 0.92-unit gap between a recorded measurement and the drawn constant** — file says (47.6, 24.5), code draws (47.4, 25.4), on the mark the file calls the most important on that motif. | **OPEN** |
| D3 | Quarter obverse is the last face on the shared `EYE_MARK`; its shape has no derivation. The eye is ~3 viewBox units and the brow merges at every threshold. | **BLOCKED** (resolution) |
| D4 | **Dime obverse ear: too small and 2–4 units too low on all nine references** — three instruments refused themselves. | **BLOCKED** |
| D5 | **Dime obverse hairline UNMEASURED** — its ladder returns −5.50 on our own art where the answer is 0. | **BLOCKED** |
| D6 | **Cent reverse: the stepped base reads heavier than the coin's shallow platform**, and the attic block is proportionally taller. Unmeasured judge reservation. | **OPEN** |
| D7 | Cent reverse stylobate steps — 1.5 device px at 38, and T1 rises as you draw *fewer*. Ladder published. | **WONTFIX** |
| D8 | **The dime's oak lobe was a circle on a spine** — a bead chain at any depth. Re-authored from the width profile along the midrib. | **FIXED** v1.92.0 |
| D9 | Two olive fruits verified present; files disagree on size by 1.9× — published, not averaged. | **FIXED** v1.92.0 |
| D10 | **Reach/petiole/blade did not add up by ~2.5 units. The contradiction was never in the coin** — it was between two estimators, one of which reads a bevel skirt as air. | **FIXED** v1.92.0 |
| D11/D12 | **The two dime branches are not mirror images at the foot.** The oak's lowest outboard blade has the **wrong sign**, not the wrong height (+20°…+37° measured v a mirrored −13°), and the oak carries no inboard foliage below y 53 where the acorn is. Refused: seven a side cannot be spent, and only two of the oak's seven nodes are isolated well enough to measure. **Most at risk of spiralling — see R2.** | **OPEN** (refused with numbers) |
| D13 | The note's left half is empty. | **TABLED** (R1) |
| D14 | The detached capstone is not carryable at app sizes. | **TABLED** (R1) |
| D15 | **Our note is the wrong rectangle** (paper 1.7944 v physical 2.3525). **Owner ruling R1: this is correct and intended** — an artistic rendering's aspect must differ from the real note. **Not a defect.** | **WONTFIX** (R1) |
| D16 | Dime reverse: the upper olive berry is not separately readable; both its centre and the blade that swallows it are measured, so it needs a ladder change. | **OPEN** |
| D17 | Refused though it measured better: scaling the oak blade's width by `lk` — it widens every blade by up to 12 %, the trade that got an earlier round reverted. | **OPEN** (refused) |
| D18 | **Our note reverse sorts as a PENNY at all four app sizes** in the design mode. | **TABLED** (R1) |

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
19. **A SEARCH THAT DEPENDS ON LOOP NESTING ORDER IS NOT A MEASUREMENT.**
    `bestReg`'s `dv` drifted 0.075 R and its `du` only 0.045, for no reason
    except that `dv` is the inner loop and gets nine rebuilds to `du`'s three.
20. **AN INSTRUMENT MAY NOT WRITE THE SUBJECT.** WRITERS.md said "does not
    write" about the evidence trail. `_sw8sync.mjs` wrote `src/art/coins.js`.
    The rule is wider than the file it was written in: **running any instrument,
    in any order, must leave the repository byte-identical** — art included.
21. **A CORRECTION SHEET MUST BE ABLE TO REFUSE.** `penny-rev.jpg` has no
    publishable disc: three fitters disagree by 3.39 % of R. A sheet that can
    only *correct* forces you to invent a number in order to say a thing cannot
    be measured.
