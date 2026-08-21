# Backlog

Reorganized 2026-07-12 around the approved growth-ladder & economy roadmap
(research-backed: curriculum fluency progressions + mastery-contingent reward
design). Work top-down. Decision: **no back-pay grant** at earning launch —
reconsider after calibration.

## Where we are

- **v1.53.0**, schema v19 (saves v19), full suite green on both CI
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
