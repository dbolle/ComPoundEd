# Compounded — Project Charter

*A dog-themed math-facts app for kids.*

## Vision

Every kid can master their multiplication tables through short, joyful, dog-filled practice sessions. Compounded turns memorization — usually a chore — into a game where practice earns you a growing pack of dogs, and mastery is something you can *see*.

## Audience

- **Primary:** kids ages 7–10 learning multiplication facts (0×0 through 12×12).
- **Little pups:** ages 3–5, via Little Pup mode — tap-only counting and numeral games with spoken prompts, no reading or typing required, and no fail states.
- **Secondary:** parents and teachers, via a "Grown-Ups" area for viewing progress and managing profiles.

## Goals

1. **Fluency** — fast, accurate recall of multiplication facts 0–12, driven by spaced repetition that targets each kid's weak facts.
2. **Fun** — kids *want* to come back. Unlockable dogs, celebrations, and visible progress make practice self-motivating.
3. **Privacy** — no data ever leaves the device. No accounts, no analytics, no ads. COPPA-friendly by construction.
4. **Anywhere** — installable PWA that works fully offline, on tablets, phones, and desktops.

## Non-Goals (v1)

- No accounts, servers, or cloud sync (architecture allows adding sync later).
- No ads, in-app purchases, or monetization.
- No cross-device leaderboards or social features.
- No other operations yet — addition, subtraction, and division are roadmap items.

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
