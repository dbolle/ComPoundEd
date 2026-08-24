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
| A4 | **`_jb14d1.mjs` held a stale hardcoded copy of our own geometry** (`cx:34 cy:28 rx:17 ry:21`, last true at v1.83.0) and published `D1 IoU 0.1496 FAIL` against code that no longer exists. **RETIRED** (moved, not edited, sha256 `e3ed115e5a64da59` unchanged). Both of its ellipses were literals, so its number could not move for any reason. Superseded by `_bxCrecord.mjs`, which parses the live SVG. | **FIXED** v1.91.0 | `node coloringbook/judge/_bxCrecord.mjs` |
| A5 | **`_jb3seal.mjs` likewise** (circles r16 at cx 30/70). **RETIRED** (sha256 `bd2ac2aa4e128082` unchanged). Five of its six published buck D2 FAILs are PASSes. The sixth — D2d-eagle +6.06 % — is **not** a real art defect either: A6 shows the 1.3145 anisotropy it is scored against is 2.5–3.6 % low. | **FIXED** v1.91.0 | `node coloringbook/judge/_bxCrecord.mjs` |
| A6 | **`_jb1fit.mjs`'s printed-border corners land 6–8 px onto blank paper — CONFIRMED and RESOLVED.** Independent sub-pixel rule fits give **2.6352 / 2.6393** (agreeing to 0.09 %) against the published 2.5610 / 2.5827, i.e. **−2.81 % / −2.08 %**. Mechanism: a uniform outward bleed onto paper, which bites the short axis 2.6× harder because top and bottom errors share a sign. **`_jb1fit.mjs` itself cannot be repaired here — it is a wrapper around the gitignored `../_blfit.mjs` and contains no fitting code.** | **BLOCKED** on the eval library | see round report; `node coloringbook/judge/_bx1fit.mjs` already returns 2.6439 / 2.7348 |
| A7 | **`_jb8geom.mjs` failed its own response test.** Two stale self-copies: `svg.replace(/cx="70"/…)` matched nothing, and `ROUNDEL` was circles r16 at cx 30/70. Response now translates the whole device group (0.0000 % → 15.8974 % outside), with a zero-translate null test; D8b is scored against the photograph-measured roundel from `_jb4target.json`. **Six D8b rows retracted.** | **FIXED** v1.91.0 | `node coloringbook/judge/_jb8geom.mjs` |
| A8 | **`_jb15look.mjs` renders 26/54/190.** `src/screens/money.js` draws **38, 48, 54, 84** and nothing else. **RETIRED** (sha256 `7ab2409bc2ea5a02` unchanged) — superseded by `_jb16look.mjs`, which already sheets exactly those four. | **FIXED** v1.91.0 | `node coloringbook/judge/_jb16look.mjs control` |
| A9 | **The area `discOf()` is wrong in kind.** A canonical rim fitter now exists — `_rimfit.mjs`, checked against **synthetic discs of known radius** (R 80/137.5/220 recovered to 0.014 px, centre to 0.007 px), response-tested, and null-tested against `_dr1disc.mjs`'s independent estimator to a mean of **−0.078 %**. Fresh per-file area error, measured 2026-08-24: `nickel-rev-2.png` **−31.71 %**, `dime-rev-proofbright.png` **−28.84 %**, `nickel-obv-4.jpg` −7.78 %, `nickel-rev.jpg` −6.98 %, `nickel-obv.jpg` −5.00 %, `quarter-obv-2.jpg` −4.55 %, `dime-obv.jpg` −3.24 %. **9 instruments still register on area** and are listed in the round report. | **PARTLY FIXED** v1.91.0 | `node coloringbook/judge/_rimfit.mjs` |
| A10 | **`_nk3over.mjs` carried a failing area `discOf()`.** Repointed at `_rimfit.mjs`, which now also PRINTS the error it used to register on: `nickel-obv-proof.png` −0.82 %, `nickel-obv-5.JPG` −1.29 %, both in the same direction as the already-fixed 6 % blank-radius error and on top of it. | **FIXED** v1.91.0 | `node coloringbook/judge/_nk3over.mjs` |
| A11 | **`_jq8contain-v2.mjs`'s RESPONSE anchor was stale** — `'<circle cx="50" cy="27.8" r="${rHead}"/>'` is nowhere in `coins.js`, so `RESPONSE=1` threw and D8's ability to move had not been checked for an unknown number of rounds. Replaced by an injection defined on the emitted SVG, with the injection asserted real (94 of 98 marks moved) and a zero-translate null test. 0.0000 % → 4.1890 %. | **FIXED** v1.91.0 | `RESPONSE=1 node coloringbook/judge/_jq8contain-v2.mjs` |
| A12 | **`_jc5corner.mjs` queries BEARD knot 7 at (−17.28, 8.63)**; the drawn knot 7 is (−18.85, 4.00) and the old value survives only in a comment. Removed by commit `88324fc` (v1.63.0). **RETIRED** (sha256 `88feed07d80b645e` unchanged) — it also cannot run anywhere but the main checkout. | **FIXED** v1.91.0 | `grep -n -- '-17.28' src/art/coins.js` → one comment |
| A13 | **`_jh8locus.mjs`'s self-test printed "end marker not found" and carried on.** A missing anchor is now recorded as `STALE ANCHOR`, a mutation that leaves the source byte-identical as `NO-OP`, and the run ends by asserting the response case both RAN and MOVED — `process.exitCode = 1` and UNTRUSTED on stdout if not. | **FIXED** v1.91.0 | `node coloringbook/judge/_jh8locus.mjs` (needs the gitignored `../_pyeval.mjs`) |
| A14 | **`_jb11d11.mjs` / `_jb10d13.mjs` overwrote frozen artefacts from a CLI flag.** Both now go through `_freeze.mjs`: create if absent, no-op on identical bytes, **refuse** a change unless `JUDGE_REFREEZE=1`. `_jb8geom.mjs json` was a third, unrecorded instance and is guarded too. | **FIXED** v1.91.0 | `node coloringbook/judge/_freeze.mjs` |
| A15 | **`_jp1discs.json` has no entry for `penny-rev-1991d.png`** and its `penny-rev-artwork.jpg` entry is unusable and unflagged. Frozen file left byte-identical; correction published beside it in `_jp1discs-corrections.json` and served through `_jpdiscs.mjs`, which **refuses** an entry flagged unusable. **A live consequence was found:** `_jp15rev.mjs` resolved `FROZEN[f] ?? FITTED[f]`, so blend/grid/crop registered that reference at **R 44.3 % too large and cy 40.32 px off** while its own `discs` subcommand printed the good fit. Precedence corrected. | **FIXED** v1.91.0 | `node coloringbook/judge/_jpdiscs.mjs` |
| A16 | **REFUTED, and the instrument is worse than the finding.** The two files are a 1963 CoinWeek plate on teal velvet and a 1998-S eBay seller photo on neutral grey — different coins, publishers, decades, formats and framings. 0.459 reproduces exactly (0.458759) but is ≈ cos(57°) between two unrelated background ramps; background-NCC correlates with Δramp-direction at r = 0.803. **Calibration: pairs KNOWN to share one plate score 0.039 and 0.106.** The statistic ranks shared setups *below* unrelated ones, and 10 of 15 pool files have no measurable background at all. | **FIXED (refuted)** v1.91.0 | see the header note now on `_jq42indep.mjs` |
| A17 | **D1 on the note scored our ellipse against a copy of our ellipse.** Confirmed: `_bx4vig.mjs`'s `OURS` is `{50.05, 30.30, 9.75, 14.00}`, which is the r0 target verbatim. The live art is `{50.05, 31.38, 9.75, 15.75}` — the r0 locus is **IoU 0.8769 against the border fit**, and the portrait it hid was 2 × (15.75 − 14.00) = 3.5 units short on a 56-unit note, **6.25 %**. `_bx4vig.mjs`'s `OURS` is still stale; it is a display column, not its gate. | **PARTLY FIXED** v1.91.0 | `node coloringbook/judge/_bxCrecord.mjs` |
| A1 | **T1 has no `buck` row.** `POOL_BY_SIDE` is `{penny,nickel,dime,quarter}`, so "32/32" is four denominations. §0 calls T1 the primary gate; it is blind to a fifth of the set. The claim that it "cannot be fixed by adding a row" was true of the FILE and false of the METHOD: only the (u,v)→pixel map assumes a circle. `_jt5note.mjs` makes that map per-subject (rim for a coin, printed border for a note) and scores all five. **T1 alone is a statement about four fifths of the set; quote T1 with T5.** | **FIXED** v1.91.0 | `node coloringbook/judge/_jt5note.mjs` — control 52/52, null 52/52, buck rows scored |
| A2 | **T1's dime-reverse pool counted one photograph twice** — `dime-rev.jpg` + `dime-rev-2.jpg`. Confirmed registration-free: MADbox **1.4**, dHash Hamming **1 of 64** (design NCC 0.995). `dime-rev.jpg` removed. **The transfer numbers barely moved** (one 0.001 on the penny-reverse row at 54 px) *because a duplicate adds nothing* — but the **CONTROL** figure for the dime reverse was **0.995, a photograph sorted against itself**, and the true values are **0.647 / 0.776 / 0.779**. | **FIXED** v1.91.0 | `node coloringbook/judge/_jt4pool.mjs dime rev` |
| A3 | **`dime-rev-proofbright.png` was not in the T1 pool at all.** Added; independent of both remaining files (MADbox 86–113, dHash 24–47; design NCC 0.62 / 0.78). | **FIXED** v1.91.0 | `grep proofbright coloringbook/judge/_jt1transfer.mjs` |
| A21 | **The least well registered file in the pool, and the near-miss that found a bug in the new instrument.** `nickel-obv-4.jpg` was REMOVED from T1's pool and PUT BACK. It was dropped because `_jt5note.fitDisc` disagreed with `_rvdisc.fit` by **14.8 % of R** (centre 19.1 %), because `_jn1discs.json` records the nickel round's own chroma fit at `p95resid_pctR: 62.13, ambiguous: true`, and because it re-sorted as a **dime** under that fitter. Then the decisive test was run, which should have come first — leave-one-out under **the registration T1 uses** — and it sorts **nickel, 0.671**. Chasing the discrepancy found the real bug, **in the new fitter**: it took the last pixel unlike the background along each ray, so one stray light pixel in the surround set the radius. Flooding the background in from the frame and keeping the largest component: dR **14.78 % → 3.13 %**, centre **19.12 % → 3.82 %**, p95 **12.22 % → 2.59 %**, and `nickel-rev-proof.png` came with it (3.16 % → 0.15 %, p95 13.05 % → 0.81 %). What survives: this file still fits at 3.1 % where every other pool member is under 1 %, and `_jn1disc.mjs`'s chroma route cannot fit it at all. | **OPEN — reported, deliberately not acted on** | `node coloringbook/judge/_jt4pool.mjs nickel obv` |
| A28 | **`penny-rev.jpg`, in T1's pool, fits at p95 4.9 % of R** — five times the project's own 1.0 % "NOT SQUARE-ON" threshold (`_jq20indep.mjs`), and the worst of the 22 pool members. `penny-obv-2.jpg` is 1.4 %. Both sort correctly, so nothing is retracted; but a pool has never had its fit quality printed beside it before, and now it does. | **OPEN** | `node coloringbook/judge/_jt4pool.mjs penny rev` |
| A22 | **A second pool duplicate, never recorded anywhere:** `nickel-obv.jpg` and `nickel-obv-unc2004.jpg` are one photograph (MADbox **5.0**, dHash **3**, design NCC 0.997). Neither T1 nor the nickel round double-counted them, so no published number moves — but nothing in the library would have stopped one. | **FIXED** (documented) v1.91.0 | `node coloringbook/judge/_jt4pool.mjs nickel obv` |
| A23 | **T1's control held out ONE file per denomination** (`POOL[id][0]`), so it ran 8 tests where the pool supports 22, and A21's file was one it never tested. Now leave-one-out over every reference: 11/11 per face. | **FIXED** v1.91.0 | read the control loop |
| A24 | **`bestReg`'s refine is not anchored.** `_jq20indep.mjs` rebuilds `[best.du - 0.005, best.du, best.du + 0.005]` *inside* the loop that reassigns `best`, so the offsets compound and the search walks outside its declared bounds — observed translations of 0.055 and 0.075 against a declared 0.03. §4.1 says an answer at a bound is not an answer; this makes that untestable. Fixed in `_jt5note.mjs`; **reported, not edited, in `_jq20indep.mjs`**, which T1 and the quarter independence matrix import at a published hash. | **OPEN** in `_jq20indep.mjs` | read its refine loop |
| A25 | **The primary gate cannot run in a worktree.** `_jt1transfer.mjs` imports `../_rvnorm.mjs`, and through `_jq20indep.mjs` also `../_qtedge.mjs` and `../_rvdisc.mjs` — all three matched by `coloringbook/*` in .gitignore. This is A5's defect sitting in T1. Fixing it means moving three modules into `judge/`, which changes the hash of every instrument importing them. `_jt5note.mjs` deliberately imports nothing outside `judge/`. | **OPEN** | `git check-ignore coloringbook/_rvnorm.mjs` |
| A26 | **A live reproduction of the registration-defeat failure mode, inside the current pool.** `qp1964-obv-pad.png` and `qp1964-obv.png` are the same image (MADbox **3.5**, dHash **0 of 64**) and their registered design NCC is **0.019** — i.e. "different design". Same for the reverse pair at 4.7 / 2 / 0.348. This is exactly why `_jt4pool.mjs`'s duplicate evidence uses no fit. | **OPEN** (neither is in the T1 pool) | `node coloringbook/judge/_jt4pool.mjs quarter obv` |
| A27 | **Thirteen vetted, independent, same-design photographs sit unused**, while three T1 rows carry **n=2** — dime obverse, quarter obverse, quarter reverse. Available and clean: dime obv `dime-obv-pcgs2015.png`, `dime-obv-unc2005.png`, `dime-obv.jpg`, `dime-obv-proof1960/1968/2010.png`; penny obv `penny-obv-1991d.png`, `penny-obv-proof2021.jpg`, `penny-obv-unc2005.png`; quarter obv `quarter-obv-1932ngc.jpg`, `q1995d-obv.png`; quarter rev `qp1963-rev-pad.png`, `qgimg-rev-pad.png`. Not added here: **enlarging the pool changes what the gate MEANS**, and that is a deliberate act for the judge, not a side effect of a bug fix. Evidence published. | **OPEN — judge decision** | `node coloringbook/judge/_jt4pool.mjs` |
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

### A21 — the self-copy sweep, 2026-08-24

The whole live library (286 files) was swept for the pattern, not just the
three named. **Still stale, not yet closed:**

| file | line | pasted | live |
|---|---|---|---|
| `_sw7gen.mjs` | 22 | `OVAL = {50.05, 30.30, 9.75, 14.00}` | `{50.05, 31.38, 9.75, 15.75}` — and `coatPath()` / `outsideOval()` are computed **from** it, so this is not a display column |
| `_bx4vig.mjs` | 31 | `OURS = {50.05, 30.3, 9.75, 14}` | same; the r0 target restated as "ours" — the A17 mechanism itself |
| `_jb4read.mjs` | 38 | pyramid has 3 cut lines / 4 courses | `COURSES = 7`, six cut lines |

**Holds our geometry and currently matches** — latent, one art change from
being A4 again: `_jb16contain.mjs` (PYR/EAG), `_jb13margin.mjs` (both frame
rects), `_jb5text.mjs` (`ONE-centre`), `_jk9text.mjs` (`vign`, carries only
cx/rx so a cy/ry change is invisible), `_jc5maskover.mjs` (`PLACE`),
`_jn14map.mjs` (`FRAME`, self-checks against its own snapshot and not against
`coins.js`), `_sw7gen.mjs` `ELLIPSES`/`FEATURES`.

### A22 — 63 of 286 instruments cannot run outside the owner's main checkout

A5 records that `_jb3seal.mjs` "cannot run in a worktree". That is not one
file. `.gitignore` keeps `coloringbook/*` and un-ignores only
`coloringbook/judge/**`, so every eval library that lives one level up —
`_blnorm`, `_blfit`, `_pylib`, `_pyeval`, `_rvnorm`, `_rvdisc`, `_qtedge`,
`_qtdisc`, `_x6lib`, `_nkbuild`, `_nkeval`, … — is absent from any worktree and
from any clone. **63 instruments import at least one of them.** Among them:
`_jb1fit.mjs` (A6's subject, and a wrapper with no fitting code of its own),
`_jc5corner.mjs`, `_jh8locus.mjs`, `_jb11d11.mjs`, `_jb10d13.mjs`,
`_jq42indep.mjs`, `_jt1transfer.mjs`.

`node coloringbook/judge/_jp0hash.mjs` prints **MISSING** for 6 of the penny
round's own frozen eval libraries, so that round's freeze cannot be verified
anywhere but one disk. The `.gitignore` comment above the rule states the
intent — *"§1.1 promises any number ever published can be reproduced …
unkeepable if the scorecards, derivations and eval libraries only ever live on
one disk"* — and the rule as written does not achieve it. **Owner decision
needed:** track the eval libraries, or accept that 22 % of the library is
unreproducible.

### A23 — `_jq42indep.mjs`'s background NCC is anti-correlated with what it measures

Established while refuting A16. Pairs known to share one photographic plate
score **0.039** and **0.106**; the pair A16 accused, which is demonstrably two
publishers a generation apart, scores **0.459**. The statistic is ≈ the cosine
of the angle between two background gradients (r = 0.803 against Δramp
direction over 15 informative pairs), and 10 of the 15 quarter references have
no measurable background at all — 96–98 % of their annulus is the
out-of-bounds fill constant 255, so their whole rows read ±0.01 by
construction. **The background-NCC column is not evidence of independence in
either direction.** No published number is contaminated (no instrument averages
over both files).


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
| C4 | **`EAG.ry` ≠ `PYR.ry` though the two seals are the same circle** on both photographs (r/borderW 0.10071 v 0.10069). The frozen eagle ellipse is **10.7 % out of round in photograph pixels**, which a circle cannot be. Blocked: candidate border ratios are 2.7 % apart and the constant is shared with the obverse vignette. **Confirmed by looking, 2026-08-24:** at 84 px beside the photographs, both roundels read as **tall ovals** where the note's seals are plainly circles. Worth testing against `D15` before it is unblocked — our note's box is 28 % too square, and an ellipse is what you draw when you are fitting a circle into a squashed frame. If `D15` is taken, re-derive `EAG.ry`/`PYR.ry` afterwards, not before. | **BLOCKED** |

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
| D8 | **Dime reverse leaf outlines**: ours are rounded blobs where the coin's oak is deeply lobed. Closed by measuring the quantity the two earlier attempts never took — the **width profile along the midrib** (28 bins, the one oak blade isolated on both files, the two files agreeing to 0.06 of their own maximum). Depth and aspect were never the variable: the coin's lobe is BROAD and its sinus is a NARROW SLOT, and its leaf has a lobe-free NECK for its first fifth. Four lobe pairs plus a terminal, sinuses at 48–59% (inside round 27's measured 45–55%). Oak breaks into **4 pieces at +1.2 erosion where it used to be 3** and its largest mass falls 218 → 131 u² (references 211/70). | **FIXED** — dime loop 3 | `node coloringbook/judge/_dr10sprig.mjs` → look at `_dr10-oak.png` |
| D9 | **Two olive fruits** at ≈(30, 42) and (27, 57) — present on both independent references and the 1960 proof. *(Added in the reverted round; must be re-verified as present in the shipped art.)* **They survived the revert and are shipped.** Re-measured at zero erosion: centres agree with the drawing to 0.9 units on both files; the two files disagree on SIZE by 1.9× in both axes (5.87 × 2.59 v 3.09 × 1.45 upper, 4.55 × 2.53 v 2.32 × 1.43 lower), so the disagreement is published and no size is changed. **Residual, split out as D15:** our UPPER berry is not a separate component at zero erosion — the olive blade above it swallows it. | **FIXED** — dime loop 3 (presence + measurement) | `node coloringbook/judge/_dr10sprig.mjs` → "small bodies" rows |
| D10 | **Reach, petiole and blade length do not add up** — 13.8 / 3.3 / 13.1, about 2.5 units apart, no assignment satisfying all three. Most likely the standoff (erosion eats a struck bevel before it eats our flat fill). **The hypothesis is confirmed and the arithmetic closes.** On the one blade isolated on both files at zero erosion the standoff is 1.50 / 1.52 (agreeing to 0.02); +1.2 units of erosion moves it +2.41 / +1.99, about twice what was eroded. The coin's petiole at that node is ~0.5 units, not 2.5–3.0 and not 818817d's 4.4. Reach = 12.7–16.5 there against the line's 15.88 — inside the files' own spread. **Erring short was right.** | **FIXED** — dime loop 3 | `torch()`, the block above `const reach` |
| D11 | **Proofbright's oak carries no inboard foliage below y 53** where the mirrored ladder puts a leaf — so the mirror may be putting a leaf where the coin puts the acorn. Seven a side is confirmed on both references, so dropping one is not available. **Confirmed on both files and REFUSED**: the oak has only stem inboard at y 53–55 on both, and the acorn at offset 7.0–11.5 at y 56–58; the olive by contrast carries inboard foliage at 4.2–13.1 on every row to y 57. The two branches are **not** mirror images at the foot. | **BLOCKED — needs the oak's five unmeasured nodes** | `node coloringbook/judge/_dr12leaf.mjs`, OAK rows y 53–58 |
| D12 | **The oak's lowest outboard leaf sits 2–3 units higher than both references** (row 57: coin `18.6-24.3`/`18.3-23.1`, ours `25.6-26.9`). Its node is a *measured* `ay`, so it was not moved on row-reading alone. **Diagnosed and REFUSED**: it is not a height error, it is a SIGN error in the mirrored angle. Two estimators on two files (PCA with the narrow end identifying the base; the per-row inner/outer edges, which fit nothing) put that blade at **+20° to +37° up-and-out from a base near (17.7, 57)**, where the ladder mirrors the olive's −13° down-and-out. Fixing it forces every side assignment above it and merges rows 2 and 3; five of the oak's seven nodes are unmeasurable. | **BLOCKED — same input as D11** | `node coloringbook/judge/_dr10sprig.mjs` → "the neighbourhood at y 57" |
| D15 | **Dime reverse: our upper olive berry is not separately readable.** At zero erosion both references keep it clear in open field; ours merges with the olive blade above into one 8.61 × 6.50 blob. Both the berry's centre and the blade's node are measured, so it needs a ladder change, not a nudge. | **OPEN** | `node coloringbook/judge/_dr10sprig.mjs` |
| D16 | **Dime reverse: the oak blade's drawn aspect ratio varies 1.47–1.80** because `lk` scales x only while the authored width is a constant 7.5 — the `ax: 15.9` defect again. Measured 1.40/1.61 on the two isolated blades, 1.47–1.63 on four crop reads. Scaling width by `lk` too was tried, measured better, and was **refused**: it widens every oak blade by up to 12%, and "bigger leaves" is the exact trade that got round 29 reverted. | **OPEN — refused with reason, recorded in `OAK`** | `torch()`, the block above `const OAK` |
| D13 | **The note's left half is empty** where the note carries the Federal Reserve seal, the legal-tender legend and a serial. Composition, not a measurable defect. | **BLOCKED** on owner |
| D8 | **Dime reverse leaf outlines**: ours are rounded blobs where the coin's oak is deeply lobed. | **OPEN — Loop 3** |
| D9 | **Two olive fruits** at ≈(30, 42) and (27, 57) — present on both independent references and the 1960 proof. *(Added in the reverted round; must be re-verified as present in the shipped art.)* | **OPEN — Loop 3** |
| D10 | **Reach, petiole and blade length do not add up** — 13.8 / 3.3 / 13.1, about 2.5 units apart, no assignment satisfying all three. Most likely the standoff (erosion eats a struck bevel before it eats our flat fill). | **OPEN — Loop 3** |
| D11 | **Proofbright's oak carries no inboard foliage below y 53** where the mirrored ladder puts a leaf — so the mirror may be putting a leaf where the coin puts the acorn. Seven a side is confirmed on both references, so dropping one is not available. | **OPEN — Loop 3** |
| D12 | **The oak's lowest outboard leaf sits 2–3 units higher than both references** (row 57: coin `18.6-24.3`/`18.3-23.1`, ours `25.6-26.9`). Its node is a *measured* `ay`, so it was not moved on row-reading alone. | **OPEN — Loop 3** |
| D13 | **The note's left half is empty** where the note carries the Federal Reserve seal, the legal-tender legend and a serial. Composition, not a measurable defect. Now has a number beside it: with the aspect normalised away, our note **reverse** sorts as a **PENNY at all four sizes** (T5 mode A, buck row 4/8 overall). An empty field with one central device is a coin. | **BLOCKED** on owner |
| D15 | **The note is the wrong shape, and shape is the note's whole identity channel.** `NOTE_SCALE = {w: 1.24, h: 0.694}` gives a paper aspect **1.787** where a $1 note is 155.956 x 66.294 mm = **2.3524** (−24.0 %); our fitted printed border is **1.835** against the four photographs' **2.4812–2.6411**, mean 2.5643 (−28.4 %). The registration is trustworthy to ~2 % against that outside ruler (background-bbox paper aspect on the four photographs: mean error −1.7 %). **`coins.js:146` says this is deliberate** — the note keeps the old `.coin.buck` CSS box (46x26) so adopting the art was not a layout change. But T5's response test prices it: resampling our render to the photographs' border ratio, **changing no printing at all**, moves the shape-aware score from **0.267 to 0.726**. §0's list of identity channels calls the note "a rectangle, which no coin can ever be" — and we draw the wrong rectangle. | **OPEN — owner decision, it is a layout change** |
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
13. **A control that holds out ONE file per class cannot find a bad file.** T1's
    control was 4/4 for months while never testing 14 of its 22 references.
    Leave one out, every time, every file.
13b. **Run the decisive test BEFORE you act, not after — and suspect the new
    instrument first.** A reference was removed from the pool because a fitter
    written this round could not register it. The test that mattered —
    leave-one-out under the fitter T1 *uses* — passed it comfortably, so the
    removal was reverted; and chasing the discrepancy found the bug **in the new
    fitter**, which had let one stray background pixel set the radius. Fixing it
    improved two references' registration by an order of magnitude. When a new
    instrument disagrees with an old one about an old artefact, the prior
    belongs with the artefact.
14. **Duplicate detection must not depend on a registration, and one statistic
    is not enough.** The pool contains a pair of identical images whose
    *registered* design NCC is **0.019**. Two registration-free statistics of
    different KINDS — a magnitude and a sign pattern — must agree before
    anything is called a duplicate.
15. **A duplicate is not harmless just because the headline number does not
    move.** Removing `dime-rev.jpg` changed the transfer figures by 0.001, and
    changed the dime-reverse CONTROL from 0.995 to 0.647–0.779. The duplicate
    was not inflating the score; it was hollowing out the check on the score.
16. **The shape of the registration is not the shape of the method.** "T1
    samples a disc, so the note needs a different instrument" was believed for
    two rounds. T1's circle was one function.
17. **A statistic that may not FAIL a round may not GATE one either.** T5's
    shape mode is advisory for coins by construction, and its control was
    nevertheless blocking every verdict in the file — including the note's —
    on a quarter-against-nickel margin of 0.015. A control must gate exactly
    the rows its statistic is quoted for. §0.1's advisory/gate split has to
    reach the controls, not just the verdicts.
