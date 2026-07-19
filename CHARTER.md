# Compounded — Project Charter

*One dog-filled app a child follows from pre-K through upper elementary,
building automaticity for the math-fact canon.*

## Vision

A single app that grows with one child for years: counting → subitizing →
number bonds → addition and subtraction within 20 → multiplication and
division → money math → fraction and mental-math fluencies. Compounded
turns memorization — usually a chore — into a trail of short, joyful,
dog-filled practice sessions where every stage earns companions and coins,
mastery is something you can *see*, and the next step is always in reach.
(Reframed 2026-07-17 from the original times-tables scope: the trail is
the product.)

## Audience

- **One child, many ages (3 → 11+).** Each stage of the trail speaks its
  rider's language: tap-only spoken games with no fail states for
  pre-readers; numpad rounds, strategy hints, and collections for
  elementary kids.
- **Parents and teachers**, via a "Grown-Ups" area: progress per track,
  visibility controls per child, profiles, backup.

## Goals

1. **Automaticity** — fast, accurate recall of every fact set the research
   says must be automatic, taught in evidence-backed strategy order and
   driven by spaced repetition targeting each kid's weak facts. The app
   teaches lightly — echo intros, Meet-the-table lessons, strategy
   hints — but never replaces school teaching of concepts.
2. **Fun** — kids *want* to come back. Unlockable dogs and pets,
   celebrations, and visible progress make practice self-motivating.
3. **Privacy** — no data ever leaves the device (opt-in family backup to
   the family's own server only). No accounts, no analytics, no ads.
   COPPA-friendly by construction.
4. **Anywhere, for years** — installable PWA, fully offline, on tablets,
   phones, and desktops; a profile's progress survives device swaps and
   spans a childhood.

## Non-Goals

- No accounts or third-party cloud; sync stays family-owned and opt-in.
- No ads, in-app purchases, or monetization — and the in-game currency is
  fictitious forever.
- No cross-device leaderboards or social features.
- Not a full math curriculum: concepts, word problems, measurement and
  geometry belong to school; Compounded drills what must become automatic.

## Feature Roadmap

### v1

- Per-table practice (tables 1–12) and mixed review rounds (~10 questions, 2–3 minutes).
- Spaced-repetition mastery (Leitner boxes): weak facts resurface more often; careful answers (e.g. skip counting) climb the early levels, and promotion to mastery requires answers that are both correct and fast — learners see progress at every stage, and mastered still means memorized.
- Mastery heatmap: 13×13 grid showing every fact's strength at a glance.
- Adopt-a-dog collection: a starter dog plus one dog unlocked per table mastered — 13 dogs in "the pack."
- Multiple kid profiles on one shared device, each with independent progress.
- Installable, offline-first PWA.

### Later

- Division, addition, and subtraction fact modes.
- Optional cloud sync / family accounts.
- Sound effects and haptics (with settings).
- Printable/exportable progress reports for grown-ups.

## Design Principles (Kids' UX)

- **Big targets, little reading.** Large buttons and a number pad; icons and dogs over text.
- **Immediate feedback.** Every answer gets an instant, friendly response.
- **Celebrate effort, not just perfection.** Finishing a round is always a win; wrong answers teach, they don't punish.
- **Short by design.** Rounds fit in 2–3 minutes; a session never overstays its welcome.
- **No dark patterns.** No streak guilt, no countdown pressure outside of gentle speed goals, no manipulative retention hooks.

## Privacy Stance

All data (profiles, progress, unlocks) is stored locally on the device in IndexedDB/localStorage. The app makes **zero network requests at runtime** after the app shell is cached. No analytics, no telemetry, no third-party scripts. This is a deliberate, permanent commitment for the kid-facing experience.

The in-game currency (**Paw Bucks**) is fictitious forever: it is earned only
through practice, mirrors US denominations purely to teach currency math, and
will never connect to real money, purchases, or payments in any direction.

One opt-in exception, off by default: **Family Backup** (Grown-Ups area) copies profiles to the family's own home server over the local network, so progress survives cleared browsers and device swaps. It talks only to the same origin the app is served from — never a third-party service, never the internet.

## Technical Decisions

- **Stack:** Vanilla JavaScript + Vite, with `vite-plugin-pwa` for the service worker and web app manifest. No framework — the app is small, game-like, and animation-heavy; staying framework-free keeps it fast and dependency-light.
- **Data layer:** repository pattern with a versioned schema, so a future sync backend can slot in behind the same interface without rework.
- **Art:** public-domain / CC0 assets only (Openclipart, Kenney), plus original code-generated SVG dogs where style consistency matters. Sources recorded in `src/art/ATTRIBUTION.md`.

## Success Criteria

- Passes Lighthouse PWA audit; installable on Android, iOS, and desktop.
- Fully usable offline after first load.
- A first-time kid can complete a round and unlock their first dog within 5 minutes.
- Per-fact mastery measurably improves with use (visible in the heatmap).
