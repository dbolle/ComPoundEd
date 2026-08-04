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
- Little Pup: 9 games, ten-frame quantity layouts, staged patterns
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
8. **Phase 7 — Money math track. NEXT.** Coin counting (2.MD.8),
   read-your-own wallet, totals and change — Paw Bucks becomes
   curriculum. **The checkout's counting-out screen is the first
   piece**: `buyGear` already accepts overpayment plus counted-back
   change and refuses anything that doesn't balance, but the UI still
   only offers exact change, so no child can reach it yet.

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
