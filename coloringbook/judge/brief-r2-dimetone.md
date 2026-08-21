# Specialist brief — round 2, D13, the dime reverse

Written by the judge 2026-08-21 after round 1 (lettering) was accepted.
Format: `docs/COIN-JUDGE.md` §7.

```
SUBJECT      dime, REVERSE
DIMENSION    D13 — device against field
```

## Why this one, and why only this one

§5 says partition the failures into **repairable** and **blocked** before
applying the priority order. On the dime reverse:

- **D2** (motif silhouette) — `BLOCKED`. No reference we hold supports a
  segmentation; the dime's two reverse files are the **same photograph**
  (NCC 0.9931). That is an acquisition, and it routes to the judge and the
  owner, not to you. **Do not attempt it.**
- **D4** (structural rhythm) — `BLOCKED`, same missing artefact.
- **D3** (interior tone) — `UNMEASURED`, and its noise floor is the same
  problem.
- **D13** — `FAIL`, measurable, and yours.

So this round is narrow on purpose. It is not an invitation to redraw the
reverse; it is a request to put the right amount of ink in the right place.

## CURRENT — the judge's own re-derivation

`_x6dark.mjs`, reverse, our render against the reference reduced to the same
device pixel count. Gate: **|Δ mean/field| ≤ 0.05 at each tier.**

| tier | Δ mean/field |
|---|---|
| 26 px | **+0.2004** |
| 44 px | **+0.2351** |
| 84 px | **+0.2950** |

At the icon tier the full row reads: reference mean/field **0.7268**, ours
**0.8999**; reference ink fraction **0.661**, ours **0.299**.

The sign matters. **Positive Δ means our device is too LIGHT against its own
field** — and the ink fraction says why: we are drawing less than half the
reference's ink. The three other coins sit at −0.0261, +0.0012 and −0.0179,
so this is not a palette problem the set shares; it is this drawing.

The ink bounding box is the other half of it: ours spans **23.7..76.3** where
the reference spans **13.2..86.8**. Our torch and branches occupy the middle
half of a field the coin fills. **No change to greys will fix that** — a tone
constant cannot put ink where there is none.

## GATE

**|Δ mean/field| ≤ 0.05 at each tier**, stated in `dime-gates.md` before any
value existed. §8 forbids proposing a relaxation.

## An instrument caveat you should know, and must not exploit

`_x6dark.mjs` counts ink over the whole `r < 40` interior, and at the icon
tier **our art draws no lettering by design**. On the cent and the nickel a
share of their ink deficit is therefore the presence decision rather than a
tone defect — the judge has recorded this.

**It does not excuse the dime**, and here is the test the judge will apply:
the dime's deficit must shrink *inside the motif's own bounding box*, where
there is no lettering in either image. Ink added by making legends bigger,
or by drawing letters at icon, will be treated as gaming the metric and the
round reverted. Round 1 already put this coin's legends where they belong.

## TARGETS AND INSTRUMENTS — READ ONLY, HASHED

```
coloringbook/judge/_jd*.json, _jd*.mjs   the dime's frozen targets
coloringbook/judge/*.mjs                 every judge instrument
coloringbook/_x6*.mjs                    the cross-coin libraries
coloringbook/ref/dime-rev*.jpg           the references — note there is
                                         effectively ONE, and say so if it
                                         limits what you can conclude
```

Editing any of them voids the round (§1). If you believe one is wrong, §1.1:
demonstrate, report, do **not** fix. Round 1's specialist found three real
faults that way and it was the most valuable thing it did.

New instruments are welcome as NEW files, prefixed `_jt2`.

## MUST NOT REGRESS — re-measured by the judge

| dimension | current | how |
|---|---|---|
| D9 | 150 renders clean | `judge/_jb9well.mjs` |
| D8 | 0.0000 % on 7 of 8 faces; nickel obverse 0.0039 units (not this coin) | `judge/_jq8contain-v2.mjs` |
| D11 | overall min **0.0534**, reverse min **0.0812**, set ratio **1.52×** | `_x6mat.mjs` |
| D5 (all rows) | round 1's values — caps ~0.97 of reference, spans within 0.1°, legends present at the 84 px naming draw | `judge/_jl1cap.mjs`, `_jl1pres.mjs` |
| the other three coins | **byte-identical** — this round touches the dime reverse only | — |

**D11 is the one to watch here, and it is not protected this time.** The
reverse minimum is `nickel.r vs dime.r = 0.0812`, i.e. the dime reverse is
one half of the closest reverse pair in the set, and D11 is measured at the
**icon tier where this change bites hardest**. Making the dime reverse
darker and fuller could push it toward the nickel reverse. If your change
costs set separability, the judge needs to see it costed, not discovered.
Report the D11 matrix before and after.

## RULES (§7)

- **Never describe the coin from memory. Open the reference and measure.**
  If the photograph contradicts this brief, the photograph wins — say so.
- Do not edit a target or an eval library. They are hashed.
- Every located feature gets an **overlay drawn on the source**, and you look
  at it (§4.3).
- Response test and null test on every instrument you write.
- A locus may never be computed from our own drawing (§6.1). And a
  **control** may not be either: round 1's contact sheet compared the new art
  with itself because its "before" defaulted to a mutable path, and the judge
  nearly accepted the picture that came out. If you build a before/after
  artefact, pin both revisions explicitly.
- Report every iteration, including the ones that got worse.
- **Do not report a verdict.**

## What "the right ink" probably means, as a starting hypothesis you should test

The reference fills the field: torch, oak branch and olive branch reach out
toward the legend band. Ours stop at r ≈ 26 (bbox 23.7..76.3 is ±26.3 about
the centre). Widening and lengthening the three elements toward the coin's
own extents is the obvious move, and it is a **depiction** claim about this
coin, so it belongs in the dime's own entry rather than in a shared helper
(`scripts/coin-shared-claims.mjs` explains the distinction; run it when done).

Test the hypothesis rather than assuming it: measure the reference's own
element extents first, and if they say something else, follow them.
