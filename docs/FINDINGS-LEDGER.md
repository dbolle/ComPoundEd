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
| A9 | **The area `discOf()` is wrong in kind.** `_rimfit.mjs` recovers a **known** radius on synthetic discs to 0.014 px, is null-tested against an independent estimator to −0.078 %, and demonstrates the failure it replaces (area −19.65 % on a synthetic annulus). **Nine instruments still register on area.** | **PARTLY FIXED** v1.91.0 |
| A10 | **`_nk3over.mjs` carried a failing area fit.** Repointed; now prints the error it used to register on. | **FIXED** v1.91.0 |
| A11 | **`_jq8contain-v2.mjs`'s `RESPONSE=1` threw** on a missing anchor, so D8's ability to move was unverified while D8 verdicts shipped. 0 → 4.1890 %, injection asserted real, null test added. | **FIXED** v1.91.0 |
| A12 | **`_jc5corner.mjs` queried a coordinate removed at v1.63.0.** Retired. | **FIXED** v1.91.0 |
| A13 | **`_jh8locus.mjs` printed "end marker not found" and carried on.** Now asserts the response case both ran and moved. | **FIXED** v1.91.0 |
| A14 | **Frozen artefacts overwritable from a CLI flag.** `_freeze.mjs` guards three instruments — one an unrecorded fourth instance. | **FIXED** v1.91.0 |
| A15 | **`_jp1discs.json` missing/unusable entries.** Correction published beside the frozen file; a resolver refuses the unusable entry. One instrument had been registering a reference **44.3 % too large**. | **FIXED** v1.91.0 |
| A16 | **Suspected shared photographic setup (NCC 0.459). REFUTED** — ≈cos(57°) between two unrelated background ramps, and pairs *known* to share a plate score **0.039 and 0.106**. The statistic ranked shared setups *below* unrelated ones. | **FIXED** (refuted) v1.91.0 |
| A17 | **An instrument holding its own copy of the subject** — the disease behind A4/A5. `_sw7gen.mjs` still does, and its copy is **load-bearing**. (`_bx4vig.mjs`, `_jb4read.mjs` are note-only → R1.) | **OPEN** |
| A22 | **63 of 286 instruments cannot run in any worktree or clone** — `.gitignore` keeps the eval libraries out, so §1.1's reproducibility promise does not hold for 22 % of the library. | **BLOCKED** (owner) |
| A24 | **`_jq20indep.bestReg`'s refine is unanchored** — it rebuilds offsets inside the loop that reassigns `best`, so the search walks outside its declared bounds. Not edited: hashed into two rounds' frozen sets. | **OPEN** |
| A25 | **The primary gate cannot run in a worktree** (A22, in T1). | **OPEN** |
| A26 | **Live reproduction of registration-defeat inside the pool:** two files that are the *same image* score a **registered** design NCC of **0.019**. Duplicate detection must not register first. | **FIXED** (method) v1.93.0 |
| A27 | **A second never-recorded duplicate:** `nickel-obv.jpg` + `nickel-obv-unc2004.jpg`, design NCC 0.997 (judge-verified raw 0.9674), one member in the T1 pool. | **OPEN** |
| A28 | **`penny-rev.jpg` fits at p95 4.9 % of R** against this project's own 1.0 % threshold, and is in T1's pool. | **OPEN** |
| A29 | **54.1 % of T5 registrations sit on a search bound** (median NCC 0.118). Those are lower bounds; thin-margin rows are the ones to distrust. | **OPEN** |
| A30 | **`_jd14d1resp.mjs`'s response test anchors on a string that no longer exists — it FAILS OPEN.** Third instance of this mode (cf. A11, A13). | **OPEN** |
| A31 | **Seven live instruments keep a private `tierOf`** and print rows labelled "icon"/"mid" — distinctions the art no longer makes. | **OPEN** |
| A32 | Byte-identity partition is an instrument, null/response/self/size-dependence tested. | **FIXED** v1.80.0 |
| A33 | Three privacy gates; the pre-push gate no longer fails open under `pipefail`. | **FIXED** v1.84.2 |
| A34 | Instruments derive paths; machine-specific values are gitignored. | **FIXED** v1.87.0 |
| A35 | `coloringbook/ref/_scratch/` holds 36 stale renders from a crashed run. | **OPEN** (trivial) |

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
