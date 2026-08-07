# Backlog

Reorganized 2026-07-12 around the approved growth-ladder & economy roadmap
(research-backed: curriculum fluency progressions + mastery-contingent reward
design). Work top-down. Decision: **no back-pay grant** at earning launch —
reconsider after calibration.

## Where we are

- **v1.47.x**, schema v18 (saves v18), 295-test suite green on both CI
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
- Little Pup: 17 games (see docs/TRAIL.md — the count was wrong in two
  places until the registry made it derivable), ten-frame quantity
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
   - R4b `groups` (equal groups, composite units) — the engine
     (`src/engine/groups.js`) landed in v1.50.0; the game still needs
     wiring into the little-pup shelf and a milestone
   - Still open from the art review: on the **bird**, tall headwear
     overlaps the head tuft (pre-existing, visible now that every item is
     rendered side by side).
   - **R5 must also fix the CSS coin sizes.** `.coin.penny` inherits 34px
     while `.coin.nickel` is 30px, so the app draws the penny LARGER than
     the nickel — the reverse of reality (19.05mm vs 21.21mm). The money
     track's central fact is "the dime is the smallest coin yet worth more
     than the nickel", so this has to be right before that wave ships.
     Real ratios (quarter = 38px): dime 28, penny 30, nickel 33. Deferred
     from v1.50.0 only so the visual change lands with the coin art it
     belongs to, under one test run.
   - R5 the money track proper (schema v19, coin art, 7 waves, new pets)

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

- Back-pay grant for pre-earning mastery (after calibration).
- Biscuit dirt/groom interplay rethink (user is mulling; Biscuit currently
  never dirty, grooms board-wide rustiest).
- "Squeaky Clean" achievement family (deferred).
- Printable/exportable progress reports for grown-ups.

## Done (chronological highlights)

Profile durability + hermetic test suite; adaptive speed bar (v4);
teach-on-misses; time-based review; sounds & haptics; achievements → tiered
families (v6, v8); missing-number → division track + 12 division dogs (v5);
accessories + ÷ heatmap; encourage-new-facts bundles A–E; Little Pup mode
(v7) + buildout + honing (v11: skills/adaptive range/guided recount);
home simplification; self-paced hints; iPhone/iPad fit; public repo +
GitHub Pages; grooming Phase 1; wardrobe Phase 2 (v9); Paw Bucks Phase 3
(v10); store gear assets + teaser.
