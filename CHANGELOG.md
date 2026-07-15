# Changelog

The version shown at the bottom of the Grown-Ups screen. Kid progress is
never affected by updates (see CLAUDE.md's preservation gate).

## v1.5.0 — 2026-07-15

- Grown-Ups: a speech-voice picker — "✨ Automatic" (the scorer) by
  default, or choose any installed English voice; the pick overrides the
  scorer everywhere, persists per device, and changing it speaks a
  sample. Falls back to Automatic if the chosen voice disappears.
- Automatic scoring: legacy Mac voices (Fred, Ralph, Kathy, Victoria…)
  are now penalized; stale voice objects re-pick instead of silencing
  speech.

## v1.4.2 — 2026-07-14

- Voice fix: iOS novelty voices (Superstar, Bubbles, Zarvox, Grandma…)
  are hard-blocked from selection — "Superstar" was winning on a loose
  "super" match. Downloaded (Premium) voices now rank above (Enhanced).

## v1.4.1 — 2026-07-14

- Grown-Ups: "Hear the voice" button speaks a sample and refreshes the
  voice label (iOS reports its voice list only after speech is used);
  clearer install path for Enhanced voices.

## v1.4.0 — 2026-07-14

- Speech: the voice re-picks as the device's voice list loads (iOS reports
  it late), prefers enhanced/natural voices more strongly, and Grown-Ups
  shows which voice is in use with a tip for downloading a nicer one.
- Grown-Ups: Little pup progress card (xp, numbers known 0/81, per-game
  breakdowns, Cozy Corner count).
- Feed Me!: the child now serves the bowl with ✅ — bones toggle in and
  out, confirming a wrong count is a gentle, fixable miss (it previously
  auto-ended at the right count and could never be wrong).
- Number Friends: pictures-only first (a frame with empty cells and
  picture-pile choices), the symbolic ➕ equation appears with mastery,
  numerals-only last — fresh at each new whole (5, then 10).

## v1.3.0 — 2026-07-14

- Bridge Track 1: three graduation tiles on the little home, gated by
  demonstrated skill — Quick Look (a flash of the frame, then quick eyes),
  Number Friends (missing parts of 5, then 10), Teen Numbers (10-and-some).
- Cozy Corner: zero-maintenance companion pets adopted at bridge
  milestones and adding waves, grouped by species habitat. Piggy-bank chip
  on the little home; a penny the first time any number becomes known.

## v1.2.0 — 2026-07-14

- The Adding track (bridge Track 2): 66 addition facts within 20 in seven
  strategy waves (Step Ups → Doubles → Make Ten → Near Doubles → Tens &
  Teens → Ten Bridgers → Grand Finale), sequential unlocks, wave-matched
  hints on misses, full frontier earning (nickel per fact, Paw Buck per
  wave). Shown when a parent turns on "Adding games".

## v1.1.0 — 2026-07-14

- Grown-Ups "What <name> sees" controls: show/hide Little Pup, Adding
  (bridge), ×/÷ tables; child-can-switch (kid hops between the little and
  big homes); hide pet sitting; limit which × tables appear.
- Saves v12 (additive): subjects defaults, addition fact map, Cozy Corner
  pet unlocks — groundwork for the Phase 5 bridge (docs/PHASE5.md).

## v1.0.0 — 2026-07-14

First numbered release; everything to date, including this week's work:

- Frontier earning (Phase 4a): coins pay mastery crossings, table
  completions, and capped rust polish — never volume. Pet Store teaser.
- Little Pup honing: ten-frame layouts, staged patterns, CVD-safe palette,
  real per-number mastery tracking, adaptive 5→7→10 range, guided recount,
  better speech voices with an excited cheer + activity-matched praise.
- Store gear art (crown, tiara, 6 more wearables, 8 toys).
- Everything prior: ×/÷ Leitner tracks, 25 dogs, wardrobe/grooming,
  achievements, Little Pup mode, sync, PWA distribution. (saves v11)
