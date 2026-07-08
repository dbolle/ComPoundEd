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

## Later / roadmap

- Division mode (inverse facts reuse the same fact data), then addition &
  subtraction for younger kids.
- Printable/exportable progress reports for grown-ups.
