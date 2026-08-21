# Specialist brief — round 1, D5 lettering, all four coins

Written by the judge 2026-08-21 against `src/art/coins.js` at v1.57.0.
Format: `docs/COIN-JUDGE.md` §7.

```
SUBJECT      penny, nickel, dime, quarter — BOTH SIDES (8 faces)
             (the $1 note is NOT in scope this round)
DIMENSION    D5 lettering — the sub-rows cap, span, band, presence
             (D5-rim is settled and PASSES on all four coins as of v1.57.0;
              do not touch EDGE)
```

## Why this round exists

`EDGE.field` moved 41.0 → 44.07 in v1.57.0 (four blind measurements, owner
approved). That number was the **blocker** on this dimension: the coins give
their legends 7.5–7.7 viewBox units of band and we were drawing into 4.6, so
D5-cap could not be met without a D8 containment breach. The arithmetic is
written out at `REV_TEXT.quarter` in `coins.js`. **The wall is gone and
nothing behind it has been collected.** Legends did not move in v1.57.0 —
every offset absorbed the field's 3.07-unit shift on purpose, so that the
lettering change would be one attributable edit. This is that edit.

## CURRENT — the judge's own re-derivation, round 0 scorecards

Cap height, ours vs the reference, as a fraction of the coin's:

| coin | side | legend | ours | coin | ratio |
|---|---|---|---|---|---|
| quarter | rev | UNITED STATES OF AMERICA | 4.44 | 6.9 | 0.64 |
| quarter | rev | QUARTER DOLLAR | 5.15 | 6.7 | 0.77 |
| nickel | obv | LIBERTY | 4.03 | 5.7 | 0.71 |
| nickel | obv | IN GOD WE TRUST | 3.60 | 5.7 | 0.63 |
| nickel | rev | (both legends) | — | 5.8 | FAIL |
| dime | obv | LIBERTY | 5.93 | 7.92 | 0.75 |
| dime | rev | — | 3.52 | 8.2 | 0.43 |
| penny | obv | LIBERTY | 3.75 | 3.8 | **0.99 PASS** |
| penny | obv | IN GOD WE TRUST | 3.52 | 6.6 | 0.53 |
| penny | rev | ONE CENT | 5.15 | 10.4 | 0.50 |

Angular span, ours vs the coin: penny obverse −31.7 %, penny reverse −18 %
and −48.4 %, dime obverse −13.8 % (passes), dime reverse −31.1 % and −42.5 %.

Presence — the fault that matters most to a child, because it is the
difference between a legend and no legend at the size the app asks them to
name the coin (`money.js` draws `coinRow(q.coins, 84)`):

- `REV_TEXT_MIN = 135`, so **the cent and the dime draw no reverse legend
  until 135 px**; the quarter was lowered to 84 in round 2 and the nickel's
  first legend lands at 156.
- dime: no lettering at all at 26/38/44/54/76 px; LIBERTY from 84; IN GOD WE
  TRUST and the date only from 190. Reverse: nothing until 190.
- penny: first lettering at boxW 170 — **nothing at 84 px or 120 px**.
- **MONTICELLO is not drawn at any size, on any tier.** So are E PLURIBUS
  UNUM on the dime and on the quarter. Three legends the coins carry and we
  do not draw at all.

## GATES — all stated before this round's values existed

| row | gate | source |
|---|---|---|
| D5-cap | **±15 %** of the reference cap height | quarter r4, derived before its own value |
| D5-span | **±15 %** of the reference angular span | same |
| D5-band | baseline (inner) radius within **±1.5 viewBox units** | `quarter-gates.md` D5 |
| D5-HF | **≤ 1.5×**, one-sided, at every tier that draws letters, **beside a presence flag** — a tier that draws nothing is `UNMEASURED`, not a pass | §3 + nickel r0 N5 |
| D5-presence | **baseline, NO GATE** — reported as a measured fact: does our drawing emit a legend at each tier where the reference, reduced to the same device pixel count, still resolves separated letter-marks | new |

Per COIN-JUDGE.md §8 you may **not** propose relaxing any of these.

## TARGETS AND INSTRUMENTS — READ ONLY, HASHED

```
coloringbook/judge/_jq4band.json     quarter frozen band target
coloringbook/judge/_jd4band.json     dime
coloringbook/judge/_jp4band.json     penny
coloringbook/judge/*.mjs             every judge instrument
coloringbook/_x6*.mjs                the cross-coin libraries
coloringbook/ref/*                   the photographs
```

147 artefacts are hashed. **Editing any of them voids the round** (§1). If you
believe an instrument is wrong, §1.1 applies: demonstrate the fault, report it,
do **not** fix it, and carry on measuring around it.

## MUST NOT REGRESS — re-measured by the judge after you return

| dimension | current | how |
|---|---|---|
| D9 well-formedness | 150 renders clean, 0 `undefined`/`NaN` | `judge/_jb9well.mjs` |
| D8 containment | 0.0000 % on 7 of 8 faces; nickel obverse 2.3714 % at 44 px but **0.0039 units deep**, below the 0.01 authoring quantum | `judge/_jq8contain-v2.mjs` |
| D11 discriminability | overall min **0.0534** (nickel.o/dime.o), reverse min **0.0812**, set ratio **1.52×** | `_x6mat.mjs` |
| D1/D2 silhouettes | unchanged — **do not touch any motif or bust path** | — |

D11 is structurally safe here and you should still not assume it: the icon
tier draws no inscription at all (`tier === 'icon' ? '' : inscriptionOf(...)`),
and D11 is measured at icon only. If you find yourself changing what icon
emits, stop — that is out of scope.

## The headroom you are spending, and its hard limit

The field circle is now **44.07**. An arced glyph's cap box reaches
`r = hypot(baseline + 0.72·size, 0.31·size)`. Cap tops currently top out at
about 40.9, so there are roughly 3.1 units of unused band — that is the
budget. **The hard limit is D8: no glyph may cross 44.07 at any tier.** Leave
room for `n2()`'s two decimal places, as round 4 did (it held its measured max
at 40.954 against 41.0).

Note `EDGE.field.icon` is still **42.5**, not 44.07, and the icon tier draws no
letters — but `mid` is now 44.07 where it used to be 40.5, so any legend that
draws at mid gained 3.57 units, not 3.07.

## RULES (§7)

- **Never describe a coin from memory. Open the reference and measure.** If a
  photograph contradicts this brief, the photograph wins — say so.
- Do not edit any target or eval library. They are hashed.
- Every located feature gets an **overlay drawn on the source** and looked at
  (§4.3 — the highest-yield rule in the document; the wrong-feature failure has
  happened four times, and every one passed its response test).
- Every instrument you write yourself passes the **response test** (perturb the
  art, confirm the number moves) and the **null test** (print your search
  bounds; a result equal to a bound is a failure report, not a value).
- A locus may never be computed from our own drawing (§6.1). Freeze it as a
  literal or derive it from the target.
- Report **every** iteration, including the ones that got worse.
- **Do not report a verdict.** Report what you changed and what you observed.
  The judge re-derives every number and decides.

## Suggested order of attack (yours to overrule with evidence)

1. **Presence first.** It is the largest kid-facing defect, it is a per-coin
   `min` floor (`t.min ?? REV_TEXT_MIN`, the house idiom, already used by the
   quarter), and the method for deriving a floor is written down and has been
   run once: render the legend, compare along-band HF energy with the reference
   reduced to the SAME device pixel count, and take the floor down to the size
   where the reference is still a chain of separated marks. `REV_TEXT_MIN`
   stranding three coins at the naming size is a known finding.
2. **The three missing legends** — MONTICELLO, and E PLURIBUS UNUM on the dime
   and the quarter. Position them off the references, not off each other.
3. **Cap and span together.** They are one edit: `ts`/`bs` set the cap,
   `tadv`/`badv` set the span, and growing one without the other either
   overruns the arc or leaves gappy letterspacing. The quarter's `bOff` is a
   pinned literal precisely so size and radius stay independent — read its note
   before touching it.
4. Re-check band radii last; they should not have moved.
