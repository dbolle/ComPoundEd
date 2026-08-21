# Specialist brief — round 7, the QUARTER obverse

Written by the judge 2026-08-21. Third of the three obverse loops.

```
SUBJECT      quarter, OBVERSE — and nothing else
DIMENSIONS   D6 edge quality  — 26 of 33 marks are stroke-rendered
             D7 curve quality — 5 knots over 75 deg across 7 paths
```

## CONCURRENCY — read this before you touch anything

Two other rounds are running at the same time, on the **cent obverse** and the
**nickel obverse**. `docs/COIN-JUDGE.md` §5 was amended today to allow this,
and only under one condition:

> Concurrent rounds each own a different coin's face, and **none may edit a
> shared helper** — `struck`, `reliefOff`, `spendOf`/`fitOff`, `arcText`/
> `flatText`, `EDGE`, `PALETTE`, the tier logic. Depiction is per-coin and may
> be edited; mechanism is shared and may not.

If your repair genuinely requires a shared-helper change, **stop and report
that** — it routes to the judge for a serialised round. A diff that touches
lines another round moved is void and re-dispatched.

## Every "current" figure here is ROUND 0–4 and some are stale

Re-derive first and report what the tree says. This is the fourth round running
where the brief itself has been the thing in error.

| row | recorded value | gate |
|---|---|---|
| **D6 obverse** | **26 of 33 marks stroke-rendered, 21.29 % of drawn length** | ≤ 0.50 |
| **D7 obverse** | **worst 102°, 5 knots over 75, across 7 paths** | 0 knots > 75° on fitted contours |
| D5-HF obverse | 2.0089× | **ESCALATED — do not touch, see below** |
| D13 obverse | −0.136, ink 0.802 vs 0.634 | **ESCALATED — do not chase** |
| D1 obverse | — | ≥ 0.95 |

## Item 1 — D6, and this is the dime's jaw twenty-six times over

Round 4 took the dime's jaw from a `stroke-width="1.5"` mark — width-variation
ratio **1.000 by construction** — to a filled region tapering 2.90 → 1.80,
ratio 1.505, and D6 moved 0.2493 → 0.2145. **This face has twenty-six such
marks**, carrying 21.29 % of its drawn length.

`COIN-ART-METHOD.md` §14: *a real coin has no uniform-width marks anywhere —
relief carries light, and light varies along a feature.*

Two things round 4 learned that apply directly:

1. **The photograph decides the width profile, not intuition.** My round-4
   brief specified the taper backwards (I said thinning toward the chin; the
   coin is widest there) and the specialist measured it and overruled me.
   Measure full width at half depth along each mark, per third of its length,
   on more than one reference, and **report the between-reference spread** —
   round 4 drew only a straight taper because the thirds disagreed 2.2–2.3×
   and the data supported nothing finer.
2. **A parallel-sided region is still a uniform-width mark.** Round 2 drew a
   stem at exactly 2.00 units and D6 got *worse* (0.2685 → 0.3965) before it
   was tapered.

You are not obliged to convert all 26. Converting the few that carry the most
length, correctly and with measurement behind each, is worth more than 26 done
by eye. Rank by length contribution and say what you left.

## Item 2 — D7, five knots and probably a mix

The dime's single over-75 knot turned out to be the **bust truncation**, a
corner the die genuinely cuts: measured on the frozen mask at 99–122° against a
straight-cut control at 6.4–37.9°, it was declared exempt under Appendix P2
rather than smoothed.

**Five knots across seven paths will not all be that.** The quarter's `HAIR`
has a 102° knot that D12 previously confirmed as a **visible kink** — a real
oscillation artefact, the case P2 says the gate was written for. So: for each
of the five, locate it by path and knot index, measure the corner **on the
target mask** with a chord estimator plus a control on a stretch you know is
smooth, and then either smooth it or declare it. Expect both answers.

Note P2's other half: a path authored as a polygon declares its corners and
those knots are exempt; a path with **no declaration is scored whole**. Part of
the work here may be declaring what is authored.

## What is escalated, and why not to touch it

- **D5-HF at 2.0089×** — round 3 established this cannot be repaired by
  lettering geometry: the coin's obverse cap is 6.9 and ours is 4.09, 41 %
  short, and *drawing the coin's own cap makes HF worse at 84 px* (2.0089 →
  2.6300) because the photograph's high-frequency energy collapses as relief
  blurs out while vector edges stay hard. The owed item is D5-cap-obverse,
  which has **no frozen target** — `_jq4band.json` holds reverse legends only.
  Do not touch the obverse lettering.
- **D13 at −0.136** — both normalisers are unsound (the p90 is a specular
  highlight on three of four references; the mode is the *device* on six of
  eight faces — I proposed the mode, tested it and retracted it today). Report
  it before and after so the judge can see it did not get worse. Do not aim
  at it.

## References

`quarter-obv-2.jpg` (750×750) carries the frozen disc registration used by
`_r3d13.mjs` (cx 374.41, cy 374.36, R 373.67) and is the target of record.

Two landed today, neither wired into anything:

- `quarter-obv-1932ngc.jpg` — **shape only, and it is much the best**: disc
  R 903 against the incumbent's ~374. Its toning measures 25.9 (mean |R−B|),
  which makes it useless for anything photometric but excellent for edges,
  contours and width profiles. **This is probably your best tool for item 1.**
- `quarter-obv-1963ccby.jpg` — better tone (plateau 0.029 vs 0.017) but only
  modestly, and it is a worn circulated coin.

Neither has a frozen disc fit, so **neither may carry a scored value**. Use
them to look and to cross-check; fit and freeze first if you want to measure
from one, and publish the fit drawn on the source.

## MUST NOT REGRESS — re-measured by the judge

| dimension | current | how |
|---|---|---|
| D1 obverse | — re-derive and hold | the quarter's own D1 instrument |
| D8 | 0.0000 % every tier | `_jq8contain-v2.mjs` |
| D9 | 150 renders clean | `_jb9well.mjs` |
| D11 | overall min 0.0534, reverse min 0.0797, ratio 1.49×; `dime.o vs quarter.o` **0.0657** is the second-closest pair in the set | `_x6mat.mjs` |
| D5 obverse | byte-identical — the obverse lettering is out of scope | `_jl1cap.mjs` |
| the quarter REVERSE and all three other coins | **byte-identical** | — |

## RULES (§7)

- **Never describe the coin from memory. Open the reference and measure.** If a
  photograph contradicts this brief, the photograph wins — say so.
- Do not edit a target or an eval library. If one is wrong, §1.1: demonstrate,
  report, do **not** fix.
- Every located feature gets an overlay drawn on the source and you look at it.
- Response test and null test on every instrument you write; prefix `_jq7`.
- Pin both revisions explicitly in any before/after artefact.
- Report every iteration, including the ones that got worse, and any setting
  you rejected because it scored better.
- **Do not report a verdict.**
