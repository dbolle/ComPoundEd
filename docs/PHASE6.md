# Phase 6 — Taking Away + trail integration (SHIPPED: v1.6.0–v1.8.0, 2026-07-17/18)

Completes the K–2 fluency ladder (2.OA.2: add AND subtract within 20) and
closes the Phase 5 seams. Product context: the 2026-07-17 charter reframe —
one app, pre-K → upper elementary, the trail IS the product.

## Decisions (user-approved as recommended)

1. Kid-facing name: **"Taking away ➖"** (not "Subtraction").
2. Skip-count warm-up: **automatic** before barely-tried tables.
3. Subtraction pets: **new members in existing habitats** (Corner stays 7 rows).

## Track 3 — Taking Away (v1.6.0) ✅

- One Leitner entry per fact FAMILY, keyed by the addition fact it inverts
  (`4+8` covers 12−8 and 12−4) — 66 families in `profile.subtraction`
  (schema v13, additive; merge richer-wins).
- The same seven waves as Adding; wave i unlocks when ADDITION wave i is
  mastered (mirrors ÷t ← ×t). Several sub waves can be open at once.
- Presentation bridge by family box: `8 + _ = 12` (Number Friends format)
  until box ≥ 2, then `12 − 8`. Hints: think-addition; count-up when the
  difference ≤ 3.
- Economy: 5¢ per family (`mastery-sub-4+8`), $1 per wave (`set-sub-wN`),
  deterministic ids. Ceiling +$10.30 → ≈ $54.41 lifetime.
- Also fixed: addition questions were missing `correction` (wrong answers
  rendered "undefined").

## v1.7.0 — pets + Cozy Corner growth ✅

Seven new generated CC0 pets, one per existing habitat (plus doubling a
7-slot spread), adopted per subtraction wave via MILESTONES extension.
Praise/speech lines for Taking Away rounds.

## v1.8.0 — connectors ✅

- Skip-count "Counting Path" warm-up: 3 unscored chain questions before
  table rounds on tables with ≤3 tried facts (the training-round state);
  no Leitner recording, no coins; isolated block for rollback.
- suggest-next learns waves (add + sub) for bridge profiles — first brick
  of the future cross-track practice spine.
- Grown-Ups progress card: "Adding x/66" and "Taking away x/66" rows.
- Add/sub results show the next-pet goal like ×/÷ show the next dog.

## Out of scope

Pet Store 4b (calibration ledgers ~Jul 21–28), add/sub heatmaps, back-pay,
Biscuit interplay, printable reports, readiness-driven track auto-reveal
(flagged as a future default decision).
