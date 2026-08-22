# Cent obverse, mid-jaw whisker round — what changed, and every number

Specialist report. **No verdicts here** — every value is the specialist's own
working measurement and the judge re-derives all of them (COIN-JUDGE §1, §7).
Tree: `8578995` (v1.66.0). Budget and baselines: `_jy9budget.md`, written before
`src/art/coins.js` was touched.

## The change

One hunk in `src/art/coins.js`, the last three lines of the `BEARD` literal (the
TOP-EDGE run only), plus the prose above it. The outer run, the rear tip
`(-18.85, 4.00)` and everything forward of `(0.9, 10.2)` are byte-identical.

```
-  'C -9.2 4.3 -7.2 5.6 -5.2 6.9 C -3.1 8.1 -1.1 9.3 0.9 10.2',
-  'C 2.95 11.2 5 12.3 7.06 12.94 C 9.55 12.84 14.56 11.75 15.15 12.77 Z',
+  'C -10.0 3.0 -9.0 -0.7 -7.6 -1.0 C -6.2 -1.3 -5.9 1.4 -5.2 2.6',
+  'C -3.6 5.3 -1.1 9.0 0.9 10.2 C 2.95 11.2 5 12.3 7.06 12.94',
+  'C 9.55 12.84 14.56 11.75 15.15 12.77 Z',
```

Also `playwright.config.js`: `const PORT = Number(process.env.TEST_PORT ?? 4180)`,
applied at the coordinator's instruction so three concurrent suites do not share
one server. Not part of the art.

## Gates, before → after

| gate | before | after | generator |
|---|---|---|---|
| D1 obverse IoU | 0.95378485 | **0.95378485** (bit-identical) | `_jh8locus.mjs` |
| D3 frozen 11-patch mean \|Δ\| | 0.1596 | **0.1596** | `_jy6tone.mjs` |
| D7 `BEARD` worst TANGENT turn | 85.0° at knot 7, 1 over | **85.0° at knot 7, 1 over** | `_jd7fitted.mjs` |
| D7 `BEARD` worst CHORD turn | 122.2°, 2 over | 122.2°, **3 over** (one added knot) | `_jd7fitted.mjs` |
| D8 penny obverse | 0.0000% / depth 0.0000 | **0.0000% / 0.0000** | `_rescore.mjs` |
| D9 | 120 renders clean | **120 clean** | `_rescore.mjs` |
| D10 obv 42→44 **d(ink) absolute** | **0.1921** (24.64× p90) | **0.1921** (24.64× p90) | `_rescore.mjs` |
| D10 obv 42→44 d(mean) | 0.1424 | 0.1415 | `_rescore.mjs` |
| D11 set minimum / rev-obv ratio | 0.0534 / 1.49× | **0.0534 / 1.49×** | `_rescore.mjs` |
| D13 obv Δ mean/field 26 px | −0.2537 | **−0.2537** (identical, by construction) | `_jp13d2d13.mjs` |
| D13 obv Δ mean/field 44 px | −0.0464 | **−0.0474** | `_jp13d2d13.mjs` |
| D13 obv Δ mean/field 84 px | +0.0017 | **+0.0008** | `_jp13d2d13.mjs` |
| `jawMid` median ratio, ours | 1.0000 (\|Δ\| 0.0603) | **1.0000 (\|Δ\| 0.0603)** | `_jy6tone.mjs` |
| `jawMid` BEARD coverage / MEAN ratio | 0.07% / 0.9765 | 0.08% / 0.9727 | `_jyBcover.mjs` |
| BEARD top edge y at x −8/−4/0/+4/+8 | 5.15 / 7.60 / 9.80 / 11.75 / 12.90 | **−0.80 / 4.55 / 9.55 / 11.75 / 12.90** | `_jy4ours.mjs` |
| bare cheek between HAIR and BEARD, x −8/−6/−4 | 13.25 / 16.45 / 19.80 | **7.30 / 10.65 / 16.75** | `_jy4ours.mjs` |

Byte-identity partition (`_jyCident.mjs`, 180 renders = 5 ids × 2 sides × 9
sizes × value on/off): **14 differ, all `penny obverse`**, and all at 44 px and
above — 26 px and 38 px are byte-identical because `beard` is gated on `!icon`.
No other face moved.

Frozen artefacts: **710 of 710 byte-identical** at the start and at the end
(`_jx1hash.mjs` against `hashes-v166.txt`).

## Test suite

`TEST_PORT=4182 PORT=8093 npm test` → **459 passed (10.5m)**, exit code 0.
(The two env vars are the coordinator's workaround for three concurrent suites
sharing port 4180 and `deploy/sync-server.mjs`'s 8092 self-start; only the
`playwright.config.js` line is in the diff, and it is not art.)

## The candidate sweep — every iteration, including the ones that got worse

`_jy8sweep.mjs`, whose BASELINE row reproduces `_jp13d2d13.mjs` (0.6278 /
0.7894 / 0.8109), its D3 (0.1596) and `_jd7fitted.mjs`'s knot 7 (85.0) exactly.

| candidate | D13 44 px | D13 84 px | ink 44 | D3(11) | `jawMid` \|Δ\| | worst turn |
|---|---|---|---|---|---|---|
| BASELINE | −0.0464 | +0.0017 | 0.556 | 0.1596 | 0.0603 | 85.0 (knot 7) |
| V1 flat | −0.0472 | +0.0009 | 0.556 | 0.1596 | 0.0603 | 85.0 |
| V2 peak −1 | −0.0478 | +0.0004 | 0.556 | 0.1596 | 0.0603 | 85.0, **knot 9 at 72.9** |
| V3 peak −5 | −0.0484 | −0.0001 | 0.556 | 0.1596 | 0.0603 | **88.7 — a NEW knot over the gate** |
| V4 front too | −0.0491 | −0.0009 | 0.556 | 0.1596 | **0.3431** | 85.0 |
| V5 soft entry | −0.0477 | +0.0005 | 0.556 | 0.1596 | 0.0603 | 85.0 |
| V6 monotone | −0.0474 | +0.0007 | 0.556 | 0.1596 | **0.2017** | 85.0 |
| V7 to jawMid edge | −0.0481 | +0.0000 | 0.556 | 0.1596 | **0.3431** | 85.0 |
| **V8 rear only (shipped)** | **−0.0474** | **+0.0008** | 0.556 | 0.1596 | **0.0603** | 85.0 |

Rejections, and the reason each was rejected:

- **V3** introduces an 88.7° knot. Refused on D7 — it is the biggest shape gain
  on the table and it breaks a gate to get it.
- **V2** leaves knot 9 at 72.9°, 2.1° inside a 75° gate. Refused: buying shape
  with a near-miss on another gate is not a bargain, and V5 gets the same edge
  with that knot at 36.0°.
- **V4 and V7** close the front of the shortfall — the largest *shape*
  improvement of any candidate — and take `jawMid` from 1.0000 to 0.7172,
  \|Δ\| 0.0603 → 0.3431 against the reference of record. Refused.
- **V6** is the tidiest curve of the eight, a single monotone run with no lobe.
  Refused: it puts BEARD across the `jawMid` patch and takes it to 0.8586,
  \|Δ\| 0.2017. This is the one that "looked best" and it is rejected on a number.
- **V5** was applied first, measured, and then withdrawn in favour of V8 —
  see the coverage finding below.

## The finding that decided the round

`_jy0tonepatch-midjaw.json`'s `jawMid` reads **1.0603** on `penny-obv-3.jpg`
(the reference D3 is scored against) and **0.7989** on `penny-obv.jpg` (the
1909-S). Those disagree in **sign** about whether the mid-jaw is darker or
lighter than the cheek, so §12.7's sign test fails at this patch and the patch
is not a target. `_jy7probe.mjs` shows it is not a one-patch fluke: over
(0…4, 4…8) the reference of record reads 1.03–1.08 and the 1909-S 0.57–0.82,
while behind x = −2 both read 0.62–0.95.

The physical reading is that a struck whisker field is bright ridges with dark
grooves, and its MEDIAN is not the tone of the mass — so the shape defect
("the coin has beard here and we draw cheek") and the tone evidence ("this
region is not dark on the photograph we score against") are both true. This
round takes the half both references agree on and publishes the half they do
not.

## A near-miss the frozen metric could not see

`_jyBcover.mjs`: V5 put **28.46%** of the `jawMid` patch inside BEARD. Its
MEDIAN — the frozen metric — did **not move at all**, because a median is a step
function of coverage and does not turn over until 50%. The patch's MEAN went
0.9765 → 0.8761, away from the reference's 1.0820. V8 keeps coverage at 0.08%
and the mean at 0.9727. Reported because §4's corollary applies in reverse:
two bit-identical answers from two different drawings is not agreement.

## Instrument sanity for this round's own tools

- `_jy8sweep.mjs` — EQUIVALENCE: its BASELINE row reproduces `_jp13d2d13.mjs`
  (0.6278 / 0.7894 / 0.8109 with refs 0.8815 / 0.8358 / 0.8093), `_jy6tone.mjs`'s
  D3 (0.1596) and `_jd7fitted.mjs`'s knot 7 (85.0) exactly.
- `_jy6tone.mjs` — reproduces penny-r0's published D3 0.1596 on the untouched
  tree.
- `_jy3cheek.mjs` — RESPONSE + NULL, on a synthetic subject with a known
  boundary (`_jyEresp.mjs`): the returned floor tracks the true boundary 1:1
  with worst error **0.95 local units** over y0 = 0 / +3 / +6; y0 = −6 and −3
  are **correctly refused**, because the frozen `cheek` seed at y −1.5 is inside
  the striped region there. NULL: smooth-everywhere refuses (flood degenerate),
  striped-everywhere refuses at the seed check. DEGENERACY (PY5): the real run
  selects **6.2% of the locus**, inside the 1–90% band.
  The naive response test (translate the grid) is recorded as **not applicable**
  and why: `--shift` moves the two frozen normaliser patches too, so the
  threshold inverts and the run refuses. An instrument whose threshold is
  derived from its own subject cannot be tested by moving the subject.
- `_jy2whisk.mjs` — see observation 2 below. Published as a failure report.

## Instrument observations (§1.1 — reported, not fixed)

1. **`_jh8locus.mjs`'s mutation self-test is stale.** On both the untouched
   v1.66.0 tree and this one it prints `HAIR.Lincoln: end marker not found` and
   `HEAD.Lincoln (the RESPONSE test — must MOVE): end marker not found`, then
   carries on and prints the BEARD bit-identity result. So the check that D1's
   IoU can move **does not run**, and its absence looks like a comment rather
   than a failure. PY6: a stale self-test is an instrument fault. DM5: "I found
   none" and "I cannot look here" must not be the same output — here the tool
   emits neither a throw nor a non-zero exit.
   *What still stands:* the BEARD mutant IS applied and D1 is bit-identical
   under it, so "BEARD is outside D1's locus" is verified. What is NOT verified
   this round is that the instrument could have shown a difference at all.
2. **`_jy2whisk.mjs` (mine) returned its own search bound on 13 of 21 columns**
   on the best reference, and is published as a §4.1 failure report rather than
   as a value. The cause is physical: above the whisker field is the sideburn,
   which is textured too, so "topmost textured run" is not the whisker boundary.
   This is BUCK B5's class again. The replacement was a picture with a ladder
   (`_jy3cheek.mjs` + `_jy1lad.mjs`), which worked.
3. **The two disc fits for `penny-obv-3.jpg` differ**: `_pylib.mjs` has
   cy 997.3 R 984.97, `judge/_jp1discs.json` has cy 993.56 R 986.97 — 3.7 px,
   0.23 local units. Both are in use by live instruments (`_jp13d2d13.mjs` uses
   the second, the frozen tone patches are expressed against the first). Small,
   but it is one artefact with two frozen geometries and nothing says which.
4. **`_jy0tonepatch-midjaw.json` is a new frozen artefact and is NOT in
   `_tonepatches-penny.json`.** That file is hashed for this round and a
   specialist may not edit it. Folding the patch in and re-hashing is the
   judge's move.
5. **`ref/penny-obv-4.png` carries no whisker detail at all.** It is one of the
   four obverse references hashed in `penny-gates.md` and it has a frozen disc
   fit in `_jp1discs.json`, and drawn under the local ladder
   (`_pv/_jy1lad-p4-penny-obv-4.png`, and closer in
   `_pv/_jy1lad-jawB-penny-obv-4.png`) its whole bust is a uniform fine
   granulation with **no hair strands and no whiskers anywhere on the jaw** —
   a matte/model surface rather than a struck-and-lit coin. Not an
   identification, just what the picture shows. Consequence for this round:
   it cannot carry a whisker-boundary reading, and its granulation would defeat
   any texture discriminator run on it. Worth a line in the references file
   before some later round spends an afternoon on it.

## What this round could NOT determine

- **The coin's whisker boundary rests on ONE reference.** Only
  `penny-obv-2.jpg` supports the reading: on `penny-obv-3.jpg` and
  `penny-obv.jpg` the frozen `beardJaw` patch is *less* textured than the frozen
  `cheek` patch, so the discriminator has no contrast and the instrument refuses
  (correctly). `penny-obv-4.png` has no whisker detail (above). So DM4's
  "report the target's own between-reference spread" **cannot be discharged** —
  n = 1, and there is no error bar on the boundary numbers. They should be read
  as a hand-checked overlay reading, not as a gate-grade target.
- **The true mid-jaw tone.** Two struck references, opposite signs, no third
  struck reference with a frozen disc fit. `penny-obv-unc2005.png` exists but
  `_jc5unc.mjs` records that it has no frozen fit (three disc estimates spread
  8.31% of R) and may not carry a scored number.
- **Whether the residual gap at x = −4 should be closed by BEARD or by HAIR.**
  16.75 local units of bare cheek remain there and HAIR's lower boundary is at
  y −12.25; on the coin the two masses meet. Which path should move is not
  something this round can settle from its own face.
- **Whether the front of the jaw should carry cut grooves.** The evidence points
  that way — a bright field with dark grooves is exactly what the photographs
  show — but `RELIEF.Lincoln` is outside this brief's "nothing else on the cent".
