# Changelog

The version shown at the bottom of the Grown-Ups screen. Kid progress is
never affected by updates (see CLAUDE.md's preservation gate).

## v1.26.2 — 2026-07-23 (beta)

- Store shelves show the actual accessory art (the real crown, scarf,
  glasses… cropped from the wearable renders) instead of emoji
  stand-ins. Toys already used their real art.

## v1.26.1 — 2026-07-23

- Fixed: gifts couldn't be taken off in the closet — undressing looked
  up the gift's owner from the (empty) target wearer and refused.
  Treasures were unaffected.

## v1.26.0 — 2026-07-23 (beta)

- Paying at the store is now EXACT CHANGE: the child counts out real
  coins from their own wallet (tap coins into the pay pile, take them
  back, Pay unlocks at the exact price). A lone Paw Buck can't pay 90¢ —
  the store sends you to the wallet to make change first (the swap
  table's whole purpose). Paid coins genuinely leave the wallet.
  Replaces the multiplication-line checkout — times tables live
  everywhere else; the store teaches money.

## v1.25.0 — 2026-07-22

- Family backup now writes to the server IMMEDIATELY after every save
  (every finished round/activity/purchase), with one retry and a
  last-chance keepalive push when the app is hidden or closed — device
  switches can no longer strand a round's transactions on the old device.
- Fixed devices sticking on old versions: the server never told browsers
  to revalidate the ROOT url (only /index.html), so Safari could
  heuristic-cache the app shell for days; `/` is now no-cache, and the
  installed app checks for updates hourly and on every return to the
  foreground.

## v1.24.1 — 2026-07-22

- Division and Taking Away no longer double-introduce facts: the
  missing-number bridge form IS the intro (the restated ×/+ fact was
  already mastered to unlock the track), so the echo now happens once at
  the operator's debut — the first "20 ÷ 5" or "12 − 8" is shown and
  typed, not asked.

## v1.24.0 — 2026-07-22

- 🧪 Beta preview flag (Grown-Ups): explicitly flagged profiles can reach
  in-development features; beta surfaces are preservation-exempt and may
  change or lose their data as they develop (warning shown).
- BETA: the Pet Store is open — shelves by tier with the pinned prices,
  and paying is the full coin math: the price decomposes into Paw Buck /
  quarter / dime / nickel lines the child multiplies out, plus an
  addition total ("3 × 25", "1 × 10", "1 × 5", then 75 + 10 + 5). Gifts
  ask who they're for and arrive being worn; toys land in the toy box.
- BETA: coin swaps in the wallet — both directions (10 dimes → a Paw
  Buck, a Paw Buck → 4 quarters…), net-zero money, real place value.

## v1.23.0 — 2026-07-22

- More skins, same skills: Quick Look flashes rotate through ten-frames,
  dice patterns and paw pads; Find it! sometimes gives only a spoken
  target (👂 no numeral crutch); Adding and Take away! sometimes play as
  park stories (pups arrive, pups nap); Feed me! rotates receivers
  (bowl, toy box, flowers).
- Adopted Cozy Corner friends now take turns co-hosting the games — the
  collection shows up to play.
- Daily item themes: the counting objects change with the day (classic
  bones, picnic, beach, snow, garden).

## v1.22.0 — 2026-07-22

- Same skills, new looks: How many? sometimes asks by EAR (the buddy
  barks, count the barks); Number Friends sometimes plays the cup game
  (bones hiding under the bowl — pure verification, no answer shown).
- Surprise! 🎁 — a mixed round sampling the child's own revealed games
  (unlocks at three): interleaved practice, little-pup style.

## v1.21.1 — 2026-07-22

- Type it!'s numpad was collapsing to min-content inside the centered
  stage (squished keys). It now has a real width (320px / 92vw) with
  chunky 54px-tall keys, and the model numeral shrank just enough to
  keep the whole game on a 600px phone with zero scrolling.

## v1.21.0 — 2026-07-21

- Early friends: two easily-reached milestones — First counts (knowing
  1–3) and Counting to five — so brand-new little pups adopt their
  first Cozy Corner friends within their first days of play, connecting
  correct answers to new friends from the start. Four new pets join the
  habitats: Nibbles 🐰, Pesto 🐦, Pistachio 🐹 and Sprout 🦔.

## v1.20.0 — 2026-07-21

- Take away! 🥣: subtraction's concrete stage — bones hop away before
  their eyes, how many are left? Unlocks from pictorial adding.
- Counting paths 🐾: skip-count chains for 2s/5s/10s plus counting
  backward; tap-choices until typing is known, then typed. Unlocks when
  the Doubles wave masters (doubles ↔ ×2).
- Type it! now serves decade numbers (20–90) once paths-of-10 is known.
- Times tables readiness is complete: within-20 waves + first Taking
  Away waves + the counting paths. Two more milestone pets. The
  automated trail now runs unbroken from first counts to division.

## v1.19.0 — 2026-07-21

- Type it! ⌨️: the numpad bridge — a numeral shows and speaks, the child
  types it (teens = two digits, early place value). Unlocks from Find
  it!; skills type:1–19 pay pennies; its own milestone pet. Adding
  readiness now requires typing 1–10 (you can't answer waves you can't
  type).
- The trail continues in place: Adding ➕ and Taking Away ➖ appear as
  little-home graduation tiles opening the right wave round directly —
  no big-kid home needed to keep climbing.

## v1.18.0 — 2026-07-21

- The automated readiness trail: Adding & Taking Away and the times
  tables now open THEMSELVES when a child demonstrates readiness
  (counting + what-comes-next for Adding; the within-20 strategy waves
  for tables) — anything ever started stays visible, and Grown-Ups
  chips become ✨Auto / On / Off overrides with a trail-map card.
- Reveals are a ratchet: once a game or track appears it can never
  vanish — fixes tiles disappearing when a bored little pup taps wrong
  answers on purpose. New tiles/tracks celebrate once (confetti+cheer).
- The little Play! hero rotates through every game with numbers left to
  learn (one step per round) instead of camping on one game.
- Pinch/double-tap zoom disabled in the installed app (OS accessibility
  zoom unaffected); large adding/teen questions wrap and shrink so
  every item stays on a portrait phone — enforced by a worst-case fit
  sweep in the suite. (saves v16)

## v1.17.0 — 2026-07-21

- One name for the outing: **Play date** everywhere ("Play together" is
  gone); "training" only ever appears as **collar training**. The dog
  page counter reads "N play dates"; wardrobe collar prices speak in
  play dates too.
- The group screen now shows live whether the picked pack counts:
  "🦮✨ Collar training!" as soon as a still-learning friend is aboard,
  "💤 Just for fun — add a friend who's still learning!" when not, and
  the start button echoes it ("Let's train!" vs "Let's go!").

## v1.16.1 — 2026-07-21

- Auto-picked play dates always earn collar credit — the picker already
  chose the most practice-needing friends available, so a fully polished
  pack no longer blocks the ladder. Manually-built groups keep the
  training-partner rule.

## v1.16.0 — 2026-07-20

- Play date 🐕🐕: one tap on any dog's page invites 1–3 auto-picked
  friends (whoever most needs the practice leads the invite) into a
  group training round — 6 facts per dog (12/18/24), earning collar
  credit when a friend still needs the work. Manual group play and its
  training tip stay as-is; group rounds everywhere now scale with the
  party instead of a fixed 6 questions.

## v1.15.0 — 2026-07-20

- Wardrobe: a collar row (original color + the blue/green/purple/gold
  ladder, locked swatches priced 🐕🐕10/25/50/100 with speak-on-tap) and
  a Closet 🧺 — owned store gear toggles on/off, gifts stay with their
  pup, treasures show who has them ("↩️ Bring from Scout").
- Group play: a tap-to-add tip suggests the pack's weakest table as the
  training partner ("Scout is still learning the ×7s — bring them along
  for collar training!").
- Dog pages: a 🐕🐕 training counter with the next-collar reward chip.
- Toys stay engine-only until the store opens.

## v1.14.0 — 2026-07-20

- Store backend (no store yet): pinned prices in the catalog (toys
  25¢–$1, gifts $1–$2 per wearer, tiara $8, crown $12 — all 5¢ steps
  against the ≈$54 lifetime economy); ownership derived from the ledger
  via deterministic buy txns (two devices buying the same thing merge to
  one charge); gear placements (saves v15, additive) with gifts bound to
  their wearer and treasures/toys moving freely; placed gear renders
  through the normal accessories pipeline.
- Collar colors: a new ladder (blue 10 / green 25 / purple 50 / gold 100)
  earned through GROUP sessions that include a training partner — a dog
  whose table is unmastered or rusty. Interleaving is the reward.

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
