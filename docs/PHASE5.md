# Phase 5 — The Bridge (plan of record, scoped 2026-07-14)

Bridges Little Pup (counting) to big-kid mode (multiplication) with the K–2
fluency band: subitizing → number bonds → addition facts within 20. Decisions
locked with the user; see BACKLOG.md for the phase's place in the roadmap.

## Decisions (user-confirmed)

1. **Placement — split.** Track 1 (Quick Look subitizing, number bonds of
   5/10, teen numbers) joins the Little Pup tile trail as graduation games.
   Track 2 (addition facts within 20) is an "Adding" section on the big-kid
   home, structured like the tables grid. A transitioning kid can see both.
2. **Pets — generate as needed, themed, overwhelm-managed** (design below).
3. **Coins — full ladder.** Addition facts pay exactly like ×/÷ (nickel per
   fact mastery, Paw Buck per wave, polish pennies, same daily caps).
   Little Pup: a penny when a number is first "known" (streak of 3),
   deterministic txn ids (`skill-count:7`) so re-derives can't double-pay.
   A piggy-bank tile on the little home shows the balance — no reading.
4. **Parent controls — full set.** Per-profile: show/hide Little Pup games,
   Bridge/Adding, ×/÷; `childCanSwitch` (kid can hop between homes);
   hide-sitting; limit-tables (cap which × tables appear).

## Track 2: addition waves (evidence order)

Facts are `a+b`, addends 0–10, normalized (a ≤ b) — 66 unique facts on the
same Leitner engine (`profile.addition`). A fact belongs to its FIRST
matching wave; waves unlock sequentially (mastering one opens the next):

| # | Wave | Membership | Strategy hint style |
|---|------|-----------|---------------------|
| 1 | Step Ups | b−a ≤ 2 with a ≤ 2 … i.e. +0/+1/+2 | count on from the bigger number |
| 2 | Doubles | a = b | "double it" |
| 3 | Make Ten | a + b = 10 | bonds of ten |
| 4 | Near Doubles | b = a+1 | "double the small one, one more" |
| 5 | Tens & Teens | a = 10 or sum 11–19 with a 10-partner | teen = ten and some |
| 6 | Ten Bridgers | a or b ∈ {8, 9}, sum > 10 | make ten first, add the rest |
| 7 | Grand Finale | everything left | anchor on a known neighbor |

Quiz/results/economy reuse the existing round machinery (`kind: 'add'`).
No addition heatmap in Phase 5 (wave meters on the grid carry progress);
revisit with Phase 6.

## Track 1: little graduation tiles

Three new tiles at the end of the trail, unlocked by counting mastery
(little.skills, not xp):

- **Quick Look 👀** (unlock: count 1–5 known): a ten-frame flashes ~1.5s,
  then hides — tap the numeral. Trains subitizing; prevents counting-one-
  by-one by design. Skills: `look:n`.
- **Number Friends 🤝** (unlock: Quick Look 1–5 known): missing-part bonds,
  5 first, then 10 ("7 and ❓ make 10" with tap choices). Skills `bond5:n`,
  `bond10:n`.
- **Teen Numbers 🔟** (unlock: bonds of 10 known): "10 and 4 make ❓" —
  numerals to 19. Skills: `teen:n`.

Milestones (each pays like a wave and adopts a pet): Quick Look 1–10 known;
bonds of 5; bonds of 10; teens 11–19.

## Pets: the Cozy Corner (theme + overwhelm management)

**Theme:** dogs are the working pack (earned by ×/÷ mastery, they need
walks/grooming). Pets are *cozy companions* earned along the bridge — they
live in the **Cozy Corner**, a new screen off the little home and pack
screen, organized by species habitat:

Cat Cushion 🛋️ · Rabbit Burrow 🕳️ · Guinea Cottage 🏠 · Bird Perch 🌿 ·
Sloth Tree 🌳 · Hedgehog Hollow 🍂 · Turtle Pond 💧

**Why this can't overwhelm:**
- Pets are **zero-maintenance** by design — no dirt, no feeding meters, no
  care queue. They host games, visit for pet-sitting, and can be petted
  (tap → animation + sound). The care workload stays with the dogs.
- The Corner groups by habitat — a full collection reads as 7 cozy rows of
  2–4, never a wall of 20+ cards.
- One **cozy buddy** (the newest pet) is featured on the little home and
  hosts that kid's games, so the collection has a face, not just a count.
- Adoption pacing ≈ one pet per milestone/wave: 4 (Track 1) + 7 (Track 2)
  = 11 in Phase 5, drawn from the existing 15; Phase 6 subtraction
  generates new pets per its sets (the art generator scales to any count).

## Schema v12 (additive)

- `subjects` grows: `{ little, bridge, tables, childCanSwitch, hideSitting,
  limitTables: [] }` (existing docs default to current behavior: little as
  set, everything else visible, no child switch).
- `addition: {}` fact map (same stat shape as facts/division).
- `petUnlocks: [{ petId, milestone, at }]` (starter-free; empty default).
- Merge: addition richer-wins per fact (same as facts); petUnlocks union by
  petId; subjects newer-doc-wins (parent setting, as today).

## Versioning & docs (standing directive)

- `package.json` becomes **1.0.0**; Vite injects `__APP_VERSION__`;
  Grown-Ups shows "Compounded v1.0.0 · saves v12" at the bottom.
- `CHANGELOG.md` starts now — one entry per release, matching the version.
- Every future change updates BACKLOG.md/CHANGELOG.md (+ README for
  user-facing behavior) in the same commit.

## Build order (rollbackable commits)

1. Version display + CHANGELOG + docs discipline (this commit).
2. Schema v12 + parent visibility controls (full set) + child switch.
3. Addition engine (waves, hints, selector, economy) + "Adding" grid + quiz.
4. Track 1 tiles + piggy bank + Cozy Corner + pet adoptions.
