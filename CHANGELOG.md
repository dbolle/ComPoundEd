# Changelog

The version shown at the bottom of the Grown-Ups screen. Kid progress is
never affected by updates (see CLAUDE.md's preservation gate).

## v1.13.0 — 2026-07-20

- Pick your buddy 💛: adopted Cozy Corner pets have a "🤍 Pick me!"
  button — the chosen pet becomes the avatar everywhere (little home
  hero, games, profile cards, big-kid home) and gets fed in Feed me!.
  Any dog page's buddy button switches back. Saves v14 (additive
  avatarPetId; unknown ids fall back to the dog).

## v1.12.1 — 2026-07-19

- Every × table round now carries a 👋 button in its top bar — the
  always-available, repeatable door into that table's Meet lesson
  (previous entries only appeared for never-met or not-yet-strong
  tables, which hid the lesson from experienced profiles).

## v1.12.0 — 2026-07-19

- Meet the table 👋: an optional, repeatable, unfailable lesson before
  any quiz — the table's dog shows their tricks: a tap-in-order
  skip-count paw path, tap-to-build groups ("3 groups of 7 make 21!"),
  and anchor tricks (one more group than ×5, one less than ×10), all
  spoken. Entries: "Practice next" points never-met tables at the
  lesson, the quiz teach banner offers "Meet first", and results offer
  "Meet again" until the table is strong. Finishing flows into
  practice. No coins — teaching, not testing.

## v1.11.0 — 2026-07-19

- Echo-first: the very first time any fact appears in a kid's life —
  across ×, ÷, Adding and Taking Away — it's SHOWN, not asked: the full
  equation with "📣 New one! Type it in!". Typing it is an errorless
  first rep (typos wiggle, never punish); the next appearance is a real
  question. Removes the "ambushed by a stranger" feeling from new
  tables. No coins, no box movement — exposure only.

## v1.10.0 — 2026-07-19

- Little Pup guidance: a big "Play!" hero tile picks the most valuable
  game for right now (the learning frontier), a bouncing 🐾 marks it on
  the shelf, and the sparkle tile became a goal preview — the locked
  game's art with a meter showing which game feeds it and how close it is.
- Verification tightening: Quick Look blocks answers until the flash
  hides (quick eyes, not counting); Number Friends' pictures stage is
  teach-only (streaks start at the mixed stage); Feed me! now records
  skill (it's been failable since v1.4.1) — little ceiling 81¢ → 91¢;
  Who has more? needs a streak of 4 (two choices are guessable).
- Fixed: more/next/add number ranges could never grow — their bands
  waited on impossible numbers (a "more" question can't ask about 1).

## v1.9.0 — 2026-07-18

- Reward chips: accessory-color progress is finally visible — tiny meters
  filling toward the actual next swatch on the dog page, locked wardrobe
  colors shown in their real color with a visible price (🦮25) that
  speaks when tapped (tooltips don't exist on tablets), and "2 more
  walks!" nudges on activity finish cards.
- Vocabulary canon (docs/VOCABULARY.md): kid register vs grown-up
  register, enforced by tests. Kid screens now say "Get the ×7s strong ⭐"
  (never "Master"), "rusty — time for a polish!" everywhere, and Adding
  headers wear ➕ to match Taking Away's ➖.

## v1.8.0 — 2026-07-18

- Counting Path warm-up: a barely-tried × table starts with three
  unscored skip-count chains ("4, 8, 12, ❓") — the counting→tables
  connector, gentle either way, recording nothing.
- "Practice next" now ranks Adding and Taking Away waves alongside
  tables — one button, whole trail (first brick of the cross-track
  practice spine).
- Grown-Ups: Adding x/66 and Taking-away x/66 rows for bridge kids.
- Wave rounds' results show the next Cozy Corner friend to work toward.

## v1.7.0 — 2026-07-17

- Seven new Cozy Corner pets (Inky, Thumper, Waffle, Lemon, Dozer,
  Thistle, Tidepool) — one new neighbor per habitat, adopted per Taking
  Away wave mastered. Habitats stay seven readable rows.

## v1.6.0 — 2026-07-17

- Taking Away ➖: subtraction within 20 as think-addition — one entry per
  fact family (12−8 and 12−4 strengthen "4+8" together), seven waves
  mirroring Adding, each unlocked by mastering its Adding wave.
  Missing-addend presentation bridges to the − symbol as families
  strengthen; hints think addition or count up. Full frontier earning.
- Charter rewritten for the product reframe: one app, pre-K through upper
  elementary, drilling the math-fact canon (docs/PHASE6.md).
- Fix: wrong addition answers showed "undefined" instead of the correction.
  (saves v13)

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
