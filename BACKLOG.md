# Backlog

Ranked and agreed 2026-07-07. Work top-down.

## ✅ Done

- **Profile durability** — family backup sync to the home server (opt-in,
  LAN-only), restore on new devices, file export/import, lossless merges.
- **Regression test suite** — `npm test`: Playwright tests against a
  hermetic server (kid flow, migration preservation, play modes, sync,
  touch). Gates every future change.
- **Adaptive speed bar** — the ⚡ threshold calibrates per kid from
  gimme-fact (×0/×1) response speed: 1.5× baseline + 1.5s, clamped 4–10s,
  default 6s until 5 samples. Schema v4. Grown-Ups shows each kid's bar.
- **Teach on misses** — wrong answers show a 💡 micro-strategy: structural
  tricks (×0/×1/×10/×11/×2), else an anchor on a well-known neighbor fact
  ("you know 7×7=49 — one more 7 makes 56"), else a skip-count tail. A
  known fact missed in flipped orientation gets the reflexive hint ("7×5 is
  the same as 5×7").
- **Time-based review** — per-box freshness windows (1 day → 3 weeks); due
  facts jump the queue in rounds, show faded on the heatmap ("time for a
  refresh"), and are counted for parents. Levels/stars/dogs never regress.
- **Sounds & haptics** — synthesized Web Audio (no assets/network): chime on
  correct, sparkle on ⚡, soft boop on wrong, arpeggio celebrations, bark on
  dog unlocks; vibration where supported. Grown-Ups toggle, on by default.

## Prioritized

*(empty — next items come from On hold or Later when the user green-lights
them)*

## On hold (per user)

- Skip-count warm-up mode for new tables.
- Durable rewards from play counters (bandanas/hats for dogs).

## ✅ Also done

- **Achievements** — 37 laddered awards (uniform value/target model):
  first-session quick wins, then streak/perfect/speed/comeback/care/pack/
  mastery ladders. Awards screen with "Next up!" progress; reveals on
  results and activity finishes. Schema v6 (lifetime stats + earned map).

- **Missing number → division** — ÷t track unlocks when ×t is mastered;
  missing-factor presentation ("5 × _ = 20") bridges to ÷ form as facts
  strengthen; 12 new division dogs; inverse-anchored hints. Schema v5.

- **Stacked achievements** — the 37 flat badges became 14 tiered families
  (Bronze → Legend, endless doubling for counters); legacy earned badges
  migrated to equivalent tiers (schema v8).

- **Accessories & division map** — dogs wear earned gear from play counters
  (no schema change); the progress map gained a ×/÷ toggle.

- **Encourage-new-facts bundles (A–E, discrete commits)** — A: first-try
  misses are streak-neutral; B: 🦁 Brave Paw family rewards attempts; C:
  teach-the-puppy framing for untried tables; D: sniff-the-map coverage
  (n/169 + row badges); E: training-treat first rounds (mostly wins).

## Next agreed

- **Per-profile visibility controls in Grown-Ups** (home simplification #3).
  The `subjects` config now EXISTS (schema v7; `subjects.little` is its
  first consumer, toggled at profile creation and in Grown-Ups). Remaining:
  extend it so a parent selects multiplication/division vs addition/
  subtraction visibility — or grants the child an independent subject
  toggle (`childCanSwitch`) — plus hide-sitting / limit-tables options.
- **Little Pup expansion** — more games as the 3yo grows: tap-to-count
  (one-to-one correspondence), what-comes-next, shapes, simple addition
  within 5. Same tap-card framework.

## Later / roadmap

- **Pet pool ready** — `src/art/pets.js` holds 15 original characters across
  7 new species (cats, rabbits, guinea pigs, birds, sloths, hedgehogs,
  turtles), sharing the dogs' style and accessory system — ready for future
  modes (e.g. +/− packs, new sitting guests, little-pup friends).

- Addition & subtraction fact modes for younger kids.
- Printable/exportable progress reports for grown-ups.
