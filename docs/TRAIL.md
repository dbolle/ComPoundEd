# The trail — pre-K to upper elementary

The map of everything a child can learn here, what it is called on each
side of the screen, and where it lives in code. **Why** the trail is shaped
this way is [PEDAGOGY.md](PEDAGOGY.md); a standard cited here locates a
skill, it does not claim coverage of it.

`src/engine/trail.js` is the authority — this file documents it, and
`tests/trail.spec.js` fails if the two disagree in either direction. The
rows below were generated from the registry rather than typed, so they
cannot be wrong at birth; the test is what keeps them right.

## Reading the table

- **id** — the game/track id in code (`?game=<id>` deep-links a little game).
- **skill namespaces** — the key prefixes actually written, with the finite
  set of numbers each covers. `{2,5,10}` is a set, not a range. Namespaces
  marked *enrichment* pay coins but gate nothing.
- **milestone** — ids in `MILESTONES` (`src/engine/cozy.js`), each of which
  adopts a Cozy Corner pet. Append-only: the mapping is positional.
- **Q** — questions per round.

## Little Pup — counting, quantity, numerals (ages ~3–6)

| Kid-facing | Grown-up | Standards | id | Skill namespaces | Milestone | Q | Status |
|---|---|---|---|---|---|---|---|
| 🦴 Count it! | count objects 1–10, cardinality | `K.CC.4` `K.CC.5` | `count` | `count:` 1–10 | `count3` `count5` | 5 | shipped |
| 👆 Tap it! | one-to-one correspondence (errorless) | `K.CC.4` | `tap` | — | — | 3 | shipped |
| 5️⃣ Find it! | numeral → quantity | `K.CC.3` | `find` | `find:` 1–10 | — | 5 | shipped |
| 🥣 Feed it! | count OUT a quantity | `K.CC.5` | `feed` | `feed:` 1–10 | — | 3 | shipped |
| ⚖️ Who has more? | compare quantities | `K.CC.6` | `more` | `more:` 2–10 (streak 4) | — | 5 | shipped |
| 🔺 Find the shape! | shape identification (errorless) | `K.G.2` | `shape` | — | — | 5 | shipped |
| 🔁 What's next? | repeating patterns (errorless) | — | `pattern` | — | — | 5 | shipped |
| 🔢 What comes next? | number sequence to 10 | `K.CC.2` | `next` | `next:` 4–10 | — | 5 | shipped |
| ➕ Add it! | adding within 10 | `K.OA.2` | `add` | `add:` 2–10 | — | 5 | shipped |
| 👀 Quick Look | subitizing (ten-frame flash) | `K.CC.4` | `look` | `look:` 1–10 | `look` | 5 | shipped |
| 🧩 Number friends | number bonds of 5 and 10 | `K.OA.3` `K.OA.4` `1.OA.6` | `bond` | `bond5:` 0–5<br>`bond10:` 0–10 | `bond5` `bond10` | 5 | shipped |
| 1️⃣ Teen numbers | ten and some more | `K.NBT.1` | `teen` | `teen:` 1–9 | `teen` | 5 | shipped |
| ⌨️ Type it! | numeral transcription (numpad bridge) | `K.CC.3` `1.NBT.1` | `type` | `type:` 1–19 | `type` | 5 | shipped |
| 🥣 Take away! | concrete subtraction | `K.OA.1` `K.OA.2` | `taway` | `takeaway:` 0–9 | `taway` | 5 | shipped |
| 🐾 Counting paths | skip-count chains (tables connector) | `2.NBT.2` | `paths` | `path:` {2,5,10} | `paths` | 5 | shipped |
| ✏️ Trace it! | digit formation 1–9 | `K.CC.3` | `trace` | `trace:` 1–9 | `trace` | 4 | shipped |
| 🎁 Surprise! | interleaved practice over revealed games | — | `surprise` | — | — | 5 | shipped |

## The bridge — within 20 (ages ~4½–7)

Fact tracks rather than little games: 66 facts each, taught in seven
strategy waves, Leitner-tracked. Subtraction is keyed by the addition fact
it inverts, so `12 − 8` and `12 − 4` share one entry.

| Kid-facing | Grown-up | Standards | Track | Progress field | Readiness | Status |
|---|---|---|---|---|---|---|
| Adding ➕ | addition within 20, 7 strategy waves | `1.OA.6` `2.OA.2` | `adding` | `profile.addition` | `addingReady` | shipped |
| Taking away ➖ | subtraction within 20, think-addition | `1.OA.6` `2.OA.2` | `takingaway` | `profile.subtraction` | `takingAwayReady` | shipped |

Wave order (`src/engine/waves.js`): Step Ups → Doubles → Make Ten → Near
Doubles → Tens & Teens → Ten Bridgers → Grand Finale.

## The pack — multiplication and division (ages ~7–11)

| Kid-facing | Grown-up | Standards | Track | Progress field | Readiness | Status |
|---|---|---|---|---|---|---|
| The tables ×  | multiplication facts ×1–12 | `3.OA.7` | `tables` | `profile.facts` | `tablesReady` | shipped |
| Sharing ÷ | division facts ÷1–12, missing-factor bridge | `3.OA.7` | `division` | `profile.division` | per-table (×t mastered) | shipped |

`tablesReady` is the counting→tables connector: adding waves 1–5, taking
away waves 1–2, and skip-counting by 2s, 5s and 10s.

## Phase 7 — money math and the counting gaps

Planned in the approved Phase 7 plan; rows appear in the registry as they
ship, and this table's ids become real then.

| Kid-facing | Grown-up | Standards | id | Notes | Status |
|---|---|---|---|---|---|
| Count on! 🔢 | number sequence to 120, decade crossings | `1.NBT.1` `2.NBT.2` | `counton` | three independent namespaces: `seq:` crossings, `ten:` by-tens off-decade, `place:` magnitude (enrichment) | R3 |
| Groups! 🧺 | equal groups and arrays | `2.OA.4` | `groups` | keyed by factor pair, not total; assesses groups, size, and total | R4 |
| Paw Bucks 🪙 | money math: recognition → counting → equivalence → change → notation | `2.MD.8` | `money` | 7 waves, 134 identities, untimed mastery | R5 |

## Phase 8 — planned, not built

No code ids yet, deliberately: these are destinations, not promises about
shape.

| Grown-up | Standards | Why here |
|---|---|---|
| Fraction equivalence recognition | `3.NF.1` `3.NF.3` `4.NF.1` | Fractions and division are the strongest known predictors of later achievement — see PEDAGOGY.md §6 |
| Mental math within 100 / 1000 | `2.NBT.5` `3.NBT.2` | Follows the money track's two-digit work |
| Ten more / ten less | `1.NBT.5` | Falls out of `ten:` once it is fluent |
| Squares and primes | — | Enrichment; the Grown-Ups gate already teaches primes |
