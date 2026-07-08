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

## Prioritized

1. **Teach on misses** — after a wrong answer, show a micro-strategy, not
   just the correction: nearest known anchor fact ("you know 7×7=49 — one
   more 7 is 56") or a skip-count strip. Turns misses into learning moments.
2. **Time-based review (retention)** — boxes currently never decay. Give
   each box a review interval (box 5 ≈ weeks) and treat overdue facts as due
   in selection, so the heatmap stays honest over months. Engine-deep;
   benefits from the test suite existing first.
3. **Sounds & haptics** — soft chime on correct, happy bark on unlock,
   vibration where supported; toggle in Grown-Ups, default respectful.

## On hold (per user)

- Skip-count warm-up mode for new tables.
- Durable rewards from play counters (bandanas/hats for dogs).

## Later / roadmap

- Division mode (inverse facts reuse the same fact data), then addition &
  subtraction for younger kids.
- Printable/exportable progress reports for grown-ups.
