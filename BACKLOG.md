# Backlog

Reorganized 2026-07-12 around the approved growth-ladder & economy roadmap
(research-backed: curriculum fluency progressions + mastery-contingent reward
design). Work top-down. Decision: **no back-pay grant** at earning launch —
reconsider after calibration.

## Where we are

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
- 🟢 **THE QUARTER'S n=1 PROBLEM MAY ALREADY BE SOLVED, AND NOTHING NEEDS
  ACQUIRING.** `coloringbook/ref/quarter-obv-1963ccby.jpg` is a **1963 struck
  business-strike Washington quarter obverse** — the correct 1932–1998 design,
  under **flat diffuse light** on a plain background, 2.7 MB — and it is
  **CC BY 2.0** (James St. John via Flickr), the cleanest licence in the pool.
  It was acquired *for tone*. **It is not in `_qtlib.DISCS`**, the D3 candidate
  set, which instead carries a state quarter and a duplicated photograph.
  Verified by eye by the judge; it is exactly the "second struck business-strike
  quarter obverse under diffuse light" the acquisition list below asks for.
  ⚠️ **Not yet measured for independence** — `_jq42indep.mjs`'s `QOBV` list
  omits it, and extending it means editing a frozen artefact, which would void
  the two rounds in flight. It also keeps its comparison helpers private, so a
  new instrument cannot reuse them without a second implementation. **Do this
  first when the slots are free:** export the helpers or extend `QOBV`, run the
  independence check on the extended pool, and if it is independent and
  same-design, put it in the D3 set. That single change could take the quarter
  obverse from n=1 to n=2 without acquiring anything.
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
- 🔴 **Two harness collisions found by running three rounds at once.**
  (a) `deploy/sync-server.mjs` self-starts during every `npm test` — its guard
  is `import.meta.url.endsWith(argv[1].split('/').pop())`, and when
  `tests/server.mjs` imports it that basename is `server.mjs`, which
  `sync-server.mjs` ends with. Every suite binds `0.0.0.0:8092` for a listener
  the tests never use, so concurrent suites die on `EADDRINUSE`. Needs a
  distinct `PORT` as well as `TEST_PORT` until the guard is fixed.
  (b) Fresh git worktrees check out an **old default commit** (`be6cb73`,
  v1.54.0) rather than the dispatch commit, and contain no `coloringbook/` or
  `node_modules`. Both specialists had to reset and symlink before measuring —
  a specialist that did not notice would silently measure v1.54.0.
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
