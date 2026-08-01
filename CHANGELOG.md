# Changelog

The version shown at the bottom of the Grown-Ups screen. Kid progress is
never affected by updates (see CLAUDE.md's preservation gate).

## v1.44.1 — 2026-08-01

- The dog barked TWICE per call — wrong for a sound the counting game
  asks children to count. It is now a single, deeper woof, and a test
  measures every voice's burst count so "one sound" stays one sound.
- Hedgehog and turtle are louder (they were the two quietest).
- /sounds.html becomes a chooser: six dog options, six rabbit options,
  and three bird options to compare by ear, each marked single-event or
  not, with the settled voices alongside for comparison.

## v1.44.0 — 2026-08-01

- Animal voices are twice as long — they were being cut off mid-sound —
  and the dog is an actual woof now: a mouth-opening burst, a voiced
  body whose vowel closes as the pitch falls, and a breathy tail. (One
  fixed filter could only ever make a beep.)
- Cleanup from the audit's minor list: the backup service runs
  unprivileged (existing installs need a one-time `chown` — see
  deploy/README.md), exported profile files keep the same restrictive
  permissions as the live ones, an unreadable file can no longer fail
  the whole backup listing, and "Backed up" is no longer shown when
  there was nothing new to send.

## v1.43.0 — 2026-08-01

- Every animal now has its own voice. The old "bark" was two beeps that
  every creature shared — cats, rabbits and turtles included. Sounds are
  now built from breath (filtered noise) plus a voiced formant, and each
  species has its own: dog woofs, cat meows, rabbit thumps, guinea-pig
  wheeks, bird chirps, sloth sighs, hedgehog snuffles, turtle hums. Still
  synthesized — nothing downloaded, works offline, and all deliberately
  soft.
- The listen-and-count game now asks for the sound your buddy actually
  makes ("how many meows?" for a cat buddy), matching the number–noun
  agreement rule used everywhere else.
- Grown-ups: /sounds.html is a small unlinked page for listening to all
  eight voices on a real device.

## v1.42.0 — 2026-08-01

The rest of the independent audit's findings.

- Settings that collide during a storage recovery now keep BOTH values
  and ask a grown-up which to use (previously the losing value was
  deleted and the conflict was recorded where nothing could read it).
- One device guessing the family key wrong can no longer lock the whole
  family out: the limit is per device, and a correct key is never
  refused.
- The wallet's transaction merge is provably order-independent again
  (a legacy and an upgraded copy of the same coin swap could disagree
  and make two devices push each other in a loop). Randomized property
  tests now cover it.
- Merging two devices keeps unexpected fields from BOTH copies; absurdly
  large or deeply nested backup files are rejected before they can be
  stored; only one backup service can own the data directory.
- New tests for the promises that shipped untested: deleted-player
  listing pagination, a near-4MB profile through sync/delete/restore/
  purge, an interrupted migration, and the single-instance guard.

## v1.41.2 — 2026-08-01

Critical fixes from an independent audit of the hardening wave.

- **A deleted player could come back and then silently lose everything.**
  If a player was deleted while offline and another device kept playing,
  the next sync re-created that player on the picker — but every save to
  it was discarded, so a child could play a whole session that was never
  written. Deleting now suppresses the player everywhere until the
  deletion completes, a refused write is reported instead of ignored,
  and the same hole on a pre-cutover server (where it repeated on every
  sync) is closed too.
- **A deletion could wedge itself.** After the final progress upload
  succeeded, a dropped follow-up call made the retry mistake this
  device's own write for someone else's change — leaving a permanent
  "resolve this" conflict. The retry now completes normally.

## v1.41.1 — 2026-08-01

- Trace it!: the green start dot on the 4 sat where both strokes met,
  so it read as "trace the tall line first". The 4 now uses the
  standard school form (down-left, across — then the stem beside it),
  putting the dot at a clear starting point like every other number.

## v1.41.0 — 2026-08-01

Hardening wave R6/6 — the wave is complete.

- Storage failures no longer create a silent second universe: if the
  browser's main storage (IndexedDB) fails on a device where it used to
  work, a persistent warning explains that players are SAFE, new
  players need an explicit go-ahead, and everything done in the
  fallback merges back automatically on the next healthy start
  (profiles AND settings, ordered by a shared change counter that both
  storage layers continue — verified before fallback copies clear).
  If the browser allows no storage at all, the app says so honestly.
- Mid-trail readiness (the long-standing gap): a child with real
  multiplication/division history now auto-qualifies for the Adding
  track — no more parent-forcing for kids who joined the trail in the
  middle. Inference affects visibility ONLY; it never invents skills,
  coins, pets, or milestones (regression-tested).
- docs/RELEASE-CHECKLIST.md: the real-device manual gate (iOS install,
  two-device sync incl. delete/restore/purge, key flows, offline,
  Lighthouse) for wave-final releases.

## v1.40.0 — 2026-08-01

Hardening wave R5/6: the Paw Bucks economy becomes conflict-proof.

- If two devices spend the same coins while apart (offline race), the
  merged ledger now resolves it the same way on every device: the
  earlier purchase stands, the later one is quietly returned to the
  shelf — the child owes nothing, sees no negative numbers, and can
  simply buy it again. If missing earnings arrive later, a returned
  purchase can complete by itself, identically everywhere.
- Balances and coin counts are now derived by replaying the transaction
  history (nothing is ever rewritten or reversed); they are guaranteed
  nonnegative in total AND per coin. Grown-Ups' ledger annotates
  returned purchases and any corrupted duplicate entries (kept in the
  history, excluded from the totals).
- Merges of the transaction history are order-independent — syncing
  A-then-B and B-then-A now provably produce the identical wallet.

## v1.39.0 — 2026-08-01

Hardening wave R4/6: deleting a player is now safe, durable, and honest
across every device.

- Deleting a player removes them from all devices but keeps their full
  final progress archived in the family backup — even when the deleting
  device was OFFLINE (the final snapshot rides a durable intent that
  survives app restarts and uploads on reconnect). Product decision:
  archives are kept until a grown-up explicitly restores or PURGES
  them; purge is irreversible and leaves a marker that blocks any stale
  device from resurrecting the profile.
- Deleted players are managed in Grown-Ups (🗂 Deleted players:
  restore or purge forever) — and a blank replacement device can
  restore straight from the players screen.
- A tombstone always wins during automatic sync; recovery is only ever
  the explicit restore action. If a deletion collides with real
  lifecycle changes elsewhere (e.g. the player was restored on another
  device), NOTHING is auto-deleted — the grown-up gets a clear
  "delete everywhere / keep the player" choice.

## v1.38.0 — 2026-08-01

Hardening wave R3/6: the sync platform. Family backup moves to a real
conditional-write server with a family key.

- New sync sidecar (deploy/sync-server.mjs, zero dependencies): every
  profile write is compare-and-swap (content-hash ETags, If-Match) —
  two devices can no longer overwrite each other between read and
  write; regression-tested with a genuine interleaved write. Lifecycle
  envelopes, paginated listings, atomic tmp-file+rename writes, crash
  tested by killing the real process mid-write.
- Family key: the server refuses everything until a key is configured
  (secure by default; no anonymous fallback); devices enter it once
  (Grown-Ups, or the profiles screen on a fresh device). On plain-http
  addresses the first key use asks an explicit acknowledgement — the
  key is observable on your own network there; https://compounded.lan
  is preferred. The key lives only on the device, never in profiles or
  exports.
- Existing raw server files migrate zero-loss (originals kept until
  each wrap verifies); pre-update clients are safely write-blocked
  (HTTP 428) until their PWA self-updates. Cutover runbook + tested
  rollback path + emergency export tool in deploy/README.md.
- NOTE for the family: the live server cutover is a deliberate step
  (deploy/README.md) — until it happens, the app keeps speaking the
  old protocol to the current server.

## v1.37.0 — 2026-08-01

Hardening wave R2/6: the client side of family backup gets defensive.

- Anything arriving from the server or a file import is now validated
  before it can touch stored data: malformed documents and
  future-schema documents are skipped safely (and never overwritten on
  the server); one bad file can no longer silently stop the whole
  family's sync. Documents up to the full 4MB server limit are
  supported; unknown fields always survive migration.
- Sync heals on CONTENT, not timestamps: a server copy with a newer
  save time but missing this device's progress now receives the full
  union (the "stranded progress" audit case).
- Backup reporting is honest: "Backed up 💾" appears only when every
  write actually succeeded; a failed listing is treated as
  offline — never as "the server has no profiles" (which used to risk
  blind re-pushes).
- Fixed: changing "limit tables" in Grown-Ups now survives merges from
  devices that haven't seen the change yet (same fix subjects/avatar
  got in v1.33.0).

## v1.36.0 — 2026-08-01

Reliability & security hardening wave, release 1 of 6 (external audit
remediation — see BACKLOG for the wave map).

- Deploys are now machine-gated: GitHub Pages ships only after the full
  suite passes on an insecure origin AND the service-worker/offline
  specs pass on a secure one. A documented pre-push hook
  (`npm run setup-hooks`) guards kid-data preservation specs and scans
  outgoing commits for private terms (list lives outside the repo).
- New privacy tests pin the promises: every request is same-origin;
  ordinary kid play uploads nothing while backup is off; the backup
  offer probe reads without sending anything; the app works fully
  offline behind its service worker.
- Copy now matches reality: the charter says "no third-party requests,
  same-origin only" (the service worker and opt-in backup do talk to
  YOUR server), and Grown-Ups privacy text explains where backup
  copies live. Backlog updated to the current version/schema with the
  hardening wave scheduled ahead of Phase 7.

## v1.35.0 — 2026-07-31

- **Trace it! ✏️** — a new little-pup game for writing the numbers 1–9.
  The digit appears as a thick finger-wide guide with a green GO dot;
  the child traces it with a finger (wobbles welcome — the judge is
  gentle and there are no wrong answers, an incomplete trace just hears
  "Keep going!"). Unlocks once counting to five is strong; rounds are
  4 traces. Tracing all nine digits adopts a brand-new cozy friend —
  the first of the three pets that previously had no way to be earned.
- Kid-visible strings for the game follow the vocabulary canon
  ("Trace it!", spoken prompts like "Trace the three!").

## v1.34.0 — 2026-07-31

- Little pups now SEE why right answers matter: a next-friend meter (the
  pet's dim silhouette + a mini bar) sits in every game and on the
  little home. Correct answers visibly stamp it; getting a number fully
  known makes the pet pop with color; wrong answers conspicuously move
  nothing. Each game tracks the pet ITS OWN milestone earns.
- The Cozy Corner stops dangling pets a child can't earn: big kids
  without the little games no longer see the nine counting-milestone
  pets as ??? (adopted friends always stay), and the "next friend" goal
  never points at an unreachable activity.

## v1.33.1 — 2026-07-31

- Gold finally looks gold: the gold collar and accessory colors move
  from brand-amber to true gold, and award cards now carry their tier's
  color (bronze/silver/gold/diamond/royal/legend accents).
- Fixed dead taps on the "Pick a table" / division section toggles: a
  background sync check-in could replace the screen right as you
  tapped, killing the button's listener and reverting its saved state.
  Toggles now survive re-renders, preferences read coherently from a
  memory cache, and the screen never re-renders mid-tap.
- The hide-the-bones bowl now grows with what's under it — a bowl
  hiding six bones no longer looks like it could barely cover one.

## v1.33.0 — 2026-07-31

- Cross-device sync gets trustworthy (saves v17):
  - Parent settings and choices (subjects, buddy, outfits, toy
    placements) now merge by when they were CHANGED, not by which device
    saved last — a stale device can no longer quietly revert them.
  - Every save first folds in whatever a background check-in already
    pulled, and all writes to a profile go through a lock — two known
    ways progress could be overwritten are gone.
  - Failed backups retry with patience (4s/15s/60s), and big profiles no
    longer risk the browser's 64KB limit on page-close pushes.
  - If the family server already holds backups but THIS device's backup
    switch is off (each device — and each address it uses — has its own
    switch), the players screen offers to turn it on. Grown-Ups now
    shows per-device status: last backup and last check-in times.

## v1.32.2 — 2026-07-31

- Dependency security fixes (build toolchain only — nothing that ships
  to devices): fast-uri and postcss updated via npm audit fix;
  brace-expansion pinned to 5.0.8+ via an npm override (the advisory
  covers every earlier release, and the vulnerable copy was nested five
  levels deep under workbox-build). npm audit: 0 vulnerabilities.

## v1.32.1 — 2026-07-31

- Added SECURITY.md: a security policy for the public repo pointing
  researchers at GitHub's private vulnerability reporting (no public
  issues for security bugs). No app changes.

## v1.32.0 — 2026-07-25

- **The Pet Store is open for everyone!** 🏪 Out of beta after its
  preview run: no flag needed, the pack and Cozy Corner buttons go
  straight in, and the wallet's coin swaps (buck ↔ quarters/dimes,
  and the rest) are on for all. The store banner now reads "Buy
  something for your pet!". Store purchases were always on the real
  Paw Bucks ledger, so beta-era buys carry over untouched.
- The 🧪 Beta preview flag stays in Grown-Ups, empty until the next
  preview feature.

## v1.31.1 — 2026-07-25

- Leaving the Pet store now lands little pups back in the Cozy Corner
  (back button and the beta bounce alike). The pack takes over once a
  second dog is earned; pet-less fresh profiles still return to the
  pack rather than an empty corner.

## v1.31.0 — 2026-07-25

- Cozy Corner friends take toys now: a toy box row at the top of the
  Corner shows what's waiting, and every adopted friend's card offers a
  one-tap ➕ chip — tap the toy under a friend to give it to them, tap
  it again to take it back. No reading needed.
- Toys pay off in play: a pet's toys sit beside them when they host
  little-pup games, and the buddy keeps theirs on the little home.
- Gifts bought for a pet finally show ON the pet (corner cards, the
  buddy, and the store's "It's yours!" art).
- Any toy can go to a dog or a pet — micro toys aren't restricted,
  they're just the cheap end of the shelf.

## v1.30.0 — 2026-07-25

- Pet sitting no longer disappears for kids who finish: readiness now
  needs only 6 mastered facts (the old firm-facts requirement emptied
  out at exactly full mastery — the round builder already composes
  retention rounds from whatever's there).
- The Grown-Ups gate is now a 3×3 prime hunt: tap every prime under 50
  (tricky odd composites like 49 and 39 included), then unlock. A wrong
  pick deals a fresh grid, so it can't be whittled down by guessing.

## v1.29.1 — 2026-07-25

- The Pet store moved off the pack grid and into the top button row,
  next to Cozy Corner and Play date — and the Cozy Corner now has the
  same button up top. Beta profiles go shopping; everyone else keeps
  the "opening soon" tap.

## v1.29.0 — 2026-07-24

- Toys live somewhere now: a Toy box card on the pack screen holds
  unassigned toys; each dog's page grows a toy shelf (tap a boxed toy to
  hand it over, tap it again to take it back); and a pup's toys sit in
  their activity scenes during walks and games.
- Six micro toys (10–15¢): squeaky mouse, jingle bell, perfect stick,
  tickly feather, lucky sock, pinecone — first purchases sized for
  little-pup savings (littles still shop via a grown-up for now; their
  own storefront comes later).

## v1.28.0 — 2026-07-24

- Feed me!, tuned by watching a real 3-year-old: the serve button sits
  well clear of the bones (knuckle grazes), greys out during
  celebrations, and celebrations now burst BIG mid-stage where eyes are
  (the bottom feedback hides under a tapping hand).
- Settle delay: for a beat after each new question appears (after the
  first), little taps are ignored — carryover tapping can no longer
  answer the next question by accident.
- Friends eat their own food: a turtle buddy gets greens, a cat gets
  fish — no more bones for Tidepool.
- Number–noun agreement everywhere counts are spoken or shown: "one
  bone", "one walk", "three leaves" (irregulars included), across the
  little games, dog pages, and story lines.

## v1.27.0 — 2026-07-23

- Cross-device sync now CHECKS IN, not just pushes: the app pulls and
  merges on boot, on returning to the foreground, on visiting home, and
  immediately after picking a player (throttled to 45s) — and the
  running app refreshes its in-memory profile on passive screens, so a
  little pup's Cozy Corner appears on the new device by itself.
- Check-ins also heal stale server copies: if the merge knows more than
  the server (progress from the old debounced-push era that never
  landed), it pushes back without waiting for a new save.

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
