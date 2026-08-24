# Findings ledger — the ten-face sweep and the dime-reverse loops

Owner, 2026-08-24: *"It seems like we keep rediscovering the same issues but
stopping before fixing them."*

That is correct, and this file exists because it was correct. Across ten face
rounds and four dime-reverse loops the judge recorded every finding faithfully
and then dispatched the next face, so the same defects were re-found by
successive rounds while the fixes stayed queued. **A finding that is recorded
but not scheduled is not progress.**

Every item below was **verified against the code on 2026-08-24**, not copied
from an earlier note. Status is one of:

- **OPEN** — confirmed present, not yet fixed
- **FIXED** — closed, with the version that closed it
- **BLOCKED** — needs evidence or an owner decision that does not exist yet
- **WONTFIX** — deliberately declined, with the reason

The rule going forward: **an item may only move to FIXED with a verification
command beside it.** No item leaves this file because a round mentioned it.

---

## A. Gates and instruments — the highest-value debt

These matter more than any single drawing, because a blind gate lets every
future round ship a defect.

| # | Finding | Status | Verify |
|---|---|---|---|
| A1 | **T1 has no `buck` row.** `POOL_BY_SIDE` is `{penny,nickel,dime,quarter}`, so "32/32" is four denominations. §0 calls T1 the primary gate; it is blind to a fifth of the set. Cannot be fixed by adding a row — T1 registers via `discOf()` and samples a **disc**. Needs a rectangular registration. | **OPEN** | `grep -c buck coloringbook/judge/_jt1transfer.mjs` → 0 |
| A2 | **T1's dime-reverse pool counts one photograph twice** — `dime-rev.jpg` + `dime-rev-2.jpg`, NCC 0.9930 disc-normalised / 0.9977 raw. Every dime-reverse T1 figure published as n=3 is n=2, including figures used to accept and reject rounds. | **OPEN** | line 152 of `_jt1transfer.mjs` |
| A3 | **`dime-rev-proofbright.png` — the best shape reference on that face — is not in the T1 pool at all.** | **OPEN** | same line |
| A4 | **`_jb14d1.mjs` holds a stale hardcoded copy of our own geometry** (`cx:34 cy:28 rx:17 ry:21`, last true at v1.83.0) and publishes `D1 IoU 0.1496 FAIL` against code that no longer exists. | **OPEN** | `sed -n 13p coloringbook/judge/_jb14d1.mjs` |
| A5 | **`_jb3seal.mjs` likewise** (circles r16 at cx 30/70) **and cannot run in a worktree** — it imports the gitignored `../_blnorm.mjs`. Five of its six published buck D2 FAILs are PASSes; the sixth is real (D2d-eagle +6.06 %). | **OPEN** | `sed -n 36,37p coloringbook/judge/_jb3seal.mjs` |
| A6 | **`_jb1fit.mjs`'s printed-border corners land 6–8 px onto blank paper.** This is the registration everything on the note hangs from. | **OPEN** | note round 17 report |
| A7 | **`_jb8geom.mjs` fails its own response test** (moving the eagle roundel does not move its number) and self-declares UNTRUSTED. | **OPEN** | run it |
| A8 | **`_jb15look.mjs` renders 26/54/190** — two sizes the app never draws — and **omits the 84 px naming draw**. | **OPEN** | read its size list |
| A9 | **The area `discOf()` is wrong in kind and ~10 live instruments carry a private copy.** Measured failures: −12.1 % (cent), −31.75 % (nickel), −1.94 %…−15.47 % (nine dime obverses), −7.89 %/−14.90 % (quarter). The test is the device/field/**surround** relationship, **not** whether the coin is a proof — that was the sweep brief's own error. **Always fit the rim.** | **OPEN** | `grep -l 'sqrt(n / Math.PI)' coloringbook/judge/*.mjs` |
| A10 | **`_nk3over.mjs` still carries a failing area `discOf()`**, and separately had a 6 % scale error (normalised by 50 where the blank draws at r 47) that flattered every overlay it ever produced. Scale fixed; the disc fit is not. | **OPEN** | read its header |
| A11 | **`_jq8contain-v2.mjs`'s RESPONSE anchor is stale.** | **OPEN** | run it |
| A12 | **`_jc5corner.mjs` queries a BEARD coordinate the art has not had since v1.62.0.** | **OPEN** | run it |
| A13 | **`_jh8locus.mjs`'s self-test prints "end marker not found" and carries on** — so the check that D1 *can* move never runs. | **OPEN** | run it |
| A14 | **`_jb11d11.mjs` / `_jb10d13.mjs` overwrite frozen artefacts from a CLI flag.** | **OPEN** | read their argv handling |
| A15 | **`_jp1discs.json` has no entry for `penny-rev-1991d.png`**, and its `penny-rev-artwork.jpg` entry is **unusable and unflagged** (p95 13.93 % of R, 244 of 720 rays at the window end). | **OPEN** | inspect the json |
| A16 | **Independence risk, unchecked:** `qp1963-obv-pad.png` and `quarter-proof-ebay.jpg` show **background NCC 0.459**, the largest off-diagonal in the matrix — suggesting one photographic setup. | **OPEN** | `_jq42indep.mjs` |
| A17 | **D1 on the note scored our ellipse against a copy of our ellipse and reported 1.0000.** The general disease behind A4/A5: **an instrument holding its own copy of the subject.** | **OPEN** | — |
| A18 | **The byte-identity partition is now an instrument** (`_jp9partition.mjs`), null/response/self/size-dependence tested. | **FIXED** v1.80.0 | `node coloringbook/judge/_jp9partition.mjs <dir> .` |
| A19 | **Three privacy gates enforce private data, and the pre-push gate no longer fails open** under `pipefail`. | **FIXED** v1.84.2 | `npx playwright test tests/privacy.spec.js` |
| A20 | **Instruments derive paths from `import.meta.url`; machine-specific values live in gitignored `judge.local.json`.** | **FIXED** v1.87.0-era | `tests/privacy.spec.js` |

**A cross-cutting rule this sweep earned:** *an instrument must never hold its
own copy of the subject.* A4, A5, A17 and the stale-anchor items are all the
same bug. Instruments should read the **emitted SVG** (as the note round's
overlay does) or import `coins.js` directly.

---

## B. Dead code — tier-era machinery, all confirmed present

v1.78.0 removed the tier system: `coinSVG` authors at `DRAW_SIZE = 380` and
rewrites only the outer `width`/`height`. So `boxW` is the 380 px box **at every
displayed size** (nickel: 332.2 at 38, 48, 54, 84 and 380 alike).

| # | Finding | Status |
|---|---|---|
| B1 | `iconS` (12 refs), `iconCy` (11), `iconCx` (11), `iconWig` (5), `iconBust` (4), `tierOf` (2) | **OPEN** |
| B2 | `INS_MAIN_MIN` (3), `INS_REST_MIN` (4), and **11 `min:` gates** — all evaluated at 332.2, permanently true. The nickel round's `min: 62` is a **no-op**. | **OPEN** |
| B3 | `fine = boxW >= 130` in two places — **permanently true**. A comment asserting the opposite ("`fine` is NEVER true in the app") already misled one round. | **OPEN** |
| B4 | **12 `tier === 'icon' / 'mid'` branches** — `tier` is hardcoded `'full'`. Confirmed unreachable across 180 renders by the note round. | **OPEN** |
| B5 | `EWICON` / `EBODYICON` — unreachable, and still carrying superseded coordinates. | **OPEN** |

**Why this is not cosmetic:** B3 already caused a false comment that a round
reasoned from. Dead branches carrying *stale numbers* are a trap, because the
next round reads them as evidence.

---

## C. Shared helpers — known defects, deliberately untouched by face rounds

| # | Finding | Status |
|---|---|---|
| C1 | **`spendOf()` bounds against a CIRCLE** while the note has two off-centre ellipses. | **OPEN** |
| C2 | **`bust()`'s `hairFill` has the wrong sign at mid.** | **OPEN** |
| C3 | **`CORNERS` is shared between note faces**, and the reverse numeral was never checked: ink centre ≈ (10.2, 10.9) and 9.3 units tall against our (8.8, 12.05) and ~7.1 — **1.4 right, 1.15 up, ~24 % small**. | **OPEN** |
| C4 | **`EAG.ry` ≠ `PYR.ry` though the two seals are the same circle** on both photographs (r/borderW 0.10071 v 0.10069). The frozen eagle ellipse is **10.7 % out of round in photograph pixels**, which a circle cannot be. Blocked: candidate border ratios are 2.7 % apart and the constant is shared with the obverse vignette. | **BLOCKED** |

---

## D. Art — measured, not yet drawn

| # | Finding | Status |
|---|---|---|
| D1 | **Quarter obverse wig: the direction field is measured wrong** (median 10.3°, worst 37.8°, 9 of 14 outside the between-reference spread) and **the fix is refused** — rotating marks individually puts 8 centreline crossings into a wig that had 0. **The wig must be re-authored as a set.** Brief is written. | **OPEN — the largest single art item** |
| D2 | **Quarter reverse eye: a 0.92-unit gap between a recorded measurement and the drawn constant** — the file says (47.6, 24.5), the code draws (47.4, 25.4), on the mark it calls the most important on that motif. | **OPEN** |
| D3 | **Quarter obverse is the last face on the shared `EYE_MARK`**, whose shape has no derivation anywhere. Both faces that measured their own eye discarded this glyph. Placement is fine; form is UNMEASURED (the eye is ~3 viewBox units and the brow merges at every threshold). | **BLOCKED** on resolution |
| D4 | **Dime obverse ear: visibly too small and 2–4 units too low on all nine references** — the strongest visual finding of that round — but three instruments refused themselves. | **BLOCKED** |
| D5 | **Dime obverse hairline: UNMEASURED.** Its ladder returns −5.50 **on our own art** where the answer is 0. | **BLOCKED** |
| D6 | **Cent reverse: the stepped base reads heavier than the coin's shallow platform, and the attic block is proportionally taller.** Judge's reservation, unmeasured. | **OPEN** |
| D7 | **Cent reverse stylobate steps** — the coin has three; at 38 px the band is 1.5 device px and T1 rises monotonically as you draw *fewer*. Ladder published. | **WONTFIX** (published) |
| D8 | **Dime reverse leaf outlines**: ours are rounded blobs where the coin's oak is deeply lobed. | **OPEN — Loop 3** |
| D9 | **Two olive fruits** at ≈(30, 42) and (27, 57) — present on both independent references and the 1960 proof. *(Added in the reverted round; must be re-verified as present in the shipped art.)* | **OPEN — Loop 3** |
| D10 | **Reach, petiole and blade length do not add up** — 13.8 / 3.3 / 13.1, about 2.5 units apart, no assignment satisfying all three. Most likely the standoff (erosion eats a struck bevel before it eats our flat fill). | **OPEN — Loop 3** |
| D11 | **Proofbright's oak carries no inboard foliage below y 53** where the mirrored ladder puts a leaf — so the mirror may be putting a leaf where the coin puts the acorn. Seven a side is confirmed on both references, so dropping one is not available. | **OPEN — Loop 3** |
| D12 | **The oak's lowest outboard leaf sits 2–3 units higher than both references** (row 57: coin `18.6-24.3`/`18.3-23.1`, ours `25.6-26.9`). Its node is a *measured* `ay`, so it was not moved on row-reading alone. | **OPEN — Loop 3** |
| D13 | **The note's left half is empty** where the note carries the Federal Reserve seal, the legal-tender legend and a serial. Composition, not a measurable defect. | **BLOCKED** on owner |
| D14 | **The detached capstone is not carryable at app sizes** — 1.30 device px at 84, a 21 % one-row dip. Published, not exaggerated. | **WONTFIX** (published) |

---

## E. Lessons that must be applied consistently

These are the sweep's real output. Each was learned by a failure.

1. **Look at the render; the gate cannot see most of these.** T1 scored 32/32 on
   both sides of a 6.5-unit eye error. It rose 0.336 → 0.451 on a drawing that
   read as a tulip, and 0.419 → 0.461 on one that read as a TV antenna. **Three
   rounds on one face were reverted after a look.**
2. **T1 is not the arbiter** — and on the dime reverse it is actively
   misleading (A2, A3).
3. **Coverage is not identification.** Ink at the right coordinates does not
   mean the right object is drawn there. *(The judge's own error, caught by the
   owner.)*
4. **A passing check on an OUTER bound says nothing about the INTERIOR.**
5. **A single constant standing in for a varying quantity** — the `<rect>` torch
   shaft (one width for 31 rows), `ax: 15.9` (one x for seven leaves), one blade
   size for seven nodes.
6. **Is the mark ATTACHED to what it belongs to, or merely placed near it?**
7. **When two references disagree by 2×, publish the disagreement — do not ship
   their mean as a measurement.** (The oak petiole; the antenna.)
8. **A quantity may not be free if something else already constrains it.**
   `reach = ped + blade`, and reach was measured.
9. **An instrument must never hold its own copy of the subject.**
10. **Never `| grep -q` under `pipefail`** — it fails open. This bug appeared in
    the pre-push hook *and* was rewritten into a new verifier an hour after
    being documented, which is why enforcement must be a test, not prose.
11. **Ratios of two features on the same photograph** cancel registration error
    and the bevel skirt — the sweep's strongest numbers came from them.
12. **Fit the RIM, never the area** (A9), and *"it is a proof"* is not the test.
