# Compounded — project note (as described by the owner)

A single reference of everything I've been told about this project: what
it is, the rules that never change, decisions already made, and what's
still open. Written to be copy-pasted into notes.

---

## What the product is

**One app a child follows from pre-K through upper elementary**, drilling
automaticity for the math-fact canon. The trail *is* the product: counting
→ bridge (subitizing, number bonds, teens) → addition → subtraction →
multiplication → division, with money math and fractions planned.

Dog-themed. Real kids use it daily (two big kids, two little pups); two
adult test profiles exist. Vanilla JS + Vite PWA, no framework, deployed
on the family's own home server (LAN) and GitHub Pages.

---

## Rules that never change

1. **Never lose kid progress.** This outranks everything. Profiles live in
   browser IndexedDB (DB `compounded`, stores `profiles`/`meta`) — never
   rename them, never bump the version destructively. Any profile-shape
   change is an **additive** migration. Unknown fields are preserved.
2. **Never ship red.** The full test suite must pass before any commit,
   with the commit gated on the result (not chained with `;`).
3. **Documentation ships with the change** — CHANGELOG, version bump
   (visible in the Grown-Ups footer), BACKLOG, README when behavior
   changes, docs/ for larger designs.
4. **Paw Bucks are fictitious forever.** Earned only through practice,
   mirroring US denominations to teach money math; never connected to
   real money in any direction.
5. **Frontier-pays economy.** Rewards follow the learning frontier;
   mastered facts pay nothing. No back-pay (revisit post-calibration).
6. **Kid vocabulary is canon** (docs/VOCABULARY.md, enforced by tests):
   strong ⭐ not "master", rusty → polish, play date 🐕🐕 (never "play
   together"), collar training, Trace it! ✏️, number–noun agreement.
7. **Every feature needs an entry point an experienced profile can
   reach.** Mechanics are *shown* — icon + meter + a picture of the
   reward, at the point of action. Never tooltips (tablets).
8. **Beta exemption:** features behind `isBeta()` are previews whose data
   may change or be purged without migration. Everything else keeps the
   full preservation guarantee.
9. **Privacy:** no accounts, no ads, no analytics, no third-party
   requests. Same-origin only (service-worker updates + optional family
   backup to the family's own server).
10. **Nothing private in the public repo** — no kid names, no LAN
    addresses, no home paths, in files *or* commit messages. The
    `local-history` branch is never pushed.

---

## Decisions already made

**Product**
- Store prices stay pinned (calibration confirmed them); micro toys at
  10–15¢ seed little-pup savings.
- Purchases require exact change from real coins ("like giving exact
  change at a real store"); the piggy bank can swap denominations.
- Any toy can go to any friend — pack dogs *or* Cozy Corner pets. No
  little-only items.
- The store left beta and is open to everyone.
- Pet-store exits return littles to the Cozy Corner, big kids to the pack.
- Progress feedback for pre-readers: a **next-friend meter** in every
  game and on the little home — correct answers visibly move it, wrong
  answers move nothing.
- Deleted players are archived, restorable, and **permanently purged only
  by a parent** — purge is irreversible by design.
- Trace it! judging is gentle: follow the guide, cover most of it,
  wobbles fine, no stroke-order rules, no wrong answers.

**Technical**
- Family backup is opt-in, LAN-only, to the family's own server, now
  behind a **family key** (secure by default; a keyless server refuses
  everything). On plain-http addresses the key is LAN-observable — the
  app requires an explicit acknowledgement there and prefers the HTTPS
  hostname.
- Sync uses a small dependency-free **sidecar with compare-and-swap
  writes** (ETags/If-Match), lifecycle envelopes, and pagination —
  native WebDAV could not provide a trustworthy conditional write.
- Settings/cosmetics merge by *when they changed*, not by which device
  saved last.
- Deploys are gated by CI on two lanes (insecure origin for the full
  suite, secure origin for service-worker/offline/privacy specs), plus an
  opt-in local pre-push hook that also scans for private terms.
- One address per device: each address keeps its own local storage and
  its own backup switch.

---

## Working agreements

- Test-first for regressions where feasible; small, reviewable commits.
- Verify visual changes by rendering/screenshotting, not by reasoning.
- Python heredoc edits must assert their anchors (silent no-op replaces
  have caused repeated bugs).
- Test on the deployed insecure origin, not just localhost —
  secure-context-only APIs differ.
- Delete any test profiles created against the live server afterward.
- Independent audits are welcome and acted on; findings get fixed in
  severity order with regression tests that would have caught them.

---

## Open items / next up

- **Phase 7 — money math** (coin counting, reading your own wallet,
  totals and change) is the next feature phase, after reliability work.
- **Phase 8 — beyond:** fraction equivalence first, then mental math
  within 100/1000, 10-more/less, squares/primes.
- Per-species animal sounds (synthesized first; recorded samples are a
  later option if synthesis isn't convincing enough).
- Little-pup piggy-bank swap UI; two Cozy Corner pets still have no
  earning path; boredom guard (fast wrong taps shouldn't reset streaks).
- Append-only transaction ledger growth needs a lossless compaction
  design eventually.
- Manual real-device release checklist (iOS install, two-device sync,
  delete → restore → purge, offline, Lighthouse) is the ship gate for
  wave-final releases.

---

## Things the owner has flagged as important to get right

- Kids lose transactions moving between devices — sync must actually
  converge, and the app must never *claim* a backup that didn't happen.
- A 3-year-old will exploit any feedback gap (typing 12 for 1 because
  "2 comes after 1"); success must be visibly tied to reward progress.
- Games must verify knowledge, not just entertain; items must never
  render off-screen; interfaces stay simple enough for a preschooler.
- Kids onboarded mid-trail must not be stuck behind gates meant for
  beginners.
- Claims in product copy must match shipped behavior.
