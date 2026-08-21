# Specialist brief — round 6, the NICKEL obverse

Written by the judge 2026-08-21. Second of the three obverse loops.

```
SUBJECT      nickel, OBVERSE — and nothing else
DIMENSIONS   D10 tier behaviour  — 24.21x, the worst tier jump in the set
             D3 and D6           — UNMEASURED on this face, which per §2 FAILS
```

## CONCURRENCY — read this before you touch anything

Two other rounds are running at the same time, on the **cent obverse** and the
**quarter obverse**. `docs/COIN-JUDGE.md` §5 was amended today to allow this,
and it allows it only under one condition:

> Concurrent rounds each own a different coin's face, and **none may edit a
> shared helper** — `struck`, `reliefOff`, `spendOf`/`fitOff`, `arcText`/
> `flatText`, `EDGE`, `PALETTE`, the tier logic. Depiction is per-coin and may
> be edited; mechanism is shared and may not.

If your repair genuinely requires a shared-helper change, **stop and report
that** — it is a finding, and it routes to the judge for a serialised round.
A diff that touches lines another round moved is void and re-dispatched.

## Every "current" figure here is ROUND 0 and some are known stale

Re-derive first and report what the tree actually says. At least one row below
is certainly stale, and this is the fourth round running where the brief itself
was the thing in error.

- **D5-cap obverse (LIBERTY 0.71, IN GOD WE TRUST 0.63) almost certainly
  PASSES now.** Round 1 took both to ~0.973 of the reference cap. Nobody
  re-scored the row.
- **D8 obverse (8.09 % outside, 1.4698 units deep) is retired.** I re-derived
  it today: 2.3714 % at 44 px but **0.0039 units deep**, below the 0.01
  authoring quantum — the coat's closing arc, not a breach. v1.57.0's field
  radius did that with no drawing change.

| row | round-0 value | gate |
|---|---|---|
| **D10 obverse** | **24.21×** at the 42→44 boundary, absolute d(ink) 0.1895 | boundary jump ≤ **4×** the within-tier p90 |
| **D3 obverse** | **UNMEASURED** | ≤ ½ the flat-drawing floor |
| **D6 obverse** | **UNMEASURED** (reported unscored: 0 / 0.0115 / 0.1171 / 0.1592 at 26/44/84/190) | ≤ 0.50, declared per coin |
| D7 obverse | `HEAD.Jefferson` 71.5° over 37 knots (under the gate); the hair/queue path is the one to check | 0 knots > 75° on fitted contours |
| D1 obverse | — | ≥ 0.95 |
| D13 obverse | −0.1434 at icon | **ESCALATED — do not chase** |

## Item 1 — D10 at 24.21×, and why it matters more than it looks

This is the largest tier discontinuity anywhere in the set — the quarter's
worst reverse boundary was 5.37× before round 2 fixed it, and the gate is 4×.
At 24× the coin visibly *pops* as it crosses 42→44 px, which is inside the
range a wallet row and a pile actually draw.

Read Appendix R2 before you touch it. The gate is a **ratio**, and a ratio can
be improved by making the denominator worse: round 2 caught exactly that on the
dime, where the boundary values were bit-identical and all the movement was in
the within-tier p90. **So report the absolute d(ink) alongside the ratio, and
the round may not claim an improvement unless the numerator moved.** The
absolute figure here is 0.1895; that is the number to beat.

Also per R2: report the **within-tier** distribution and any within-tier pop,
not only the boundary. A drawing that jumps discontinuously *inside* a tier is
the defect the dimension is named for and the gate cannot see it.

## Item 2 — D3 and D6 are UNMEASURED, and §2 says that fails

*Absent evidence is a FAIL.* Neither has ever been scored on this face. The
first deliverable is therefore a **measurement**, not a repair:

- **D3** needs frozen tone patches for this coin. `_tonepatches.json`,
  `-penny` and `-quarter` exist; there is **no nickel file**. Creating one is
  legitimate work — §14's patch list and the cent's file are the models —
  but it is a **frozen target**, so: derive it from the photograph, publish the
  patches drawn over the source, make the writer refuse to overwrite, and
  freeze it **before** any value exists. If you cannot do that honestly, report
  that instead and score nothing.
- **D6** has printed numbers but no declared gate. The cent declared 0.50 and
  the dime inherited it. Declare this coin's before measuring, with the
  reasoning, and if the answer is "0.50, for the cent's reasons", say so.

## References

`nickel-obv.jpg` (500×492) carries the frozen disc fit in `_jn1discs.json` and
is the target of record. **A far better reference landed today and is not yet
wired into anything**: `nickel-obv-unc2004.jpg` — U.S. Mint Historical Image
Library, public domain, **1523×1500, the highest-resolution reference in the
whole set**, a business strike under diffuse light. It has **no frozen disc
fit**, so it may not carry a scored value; but it is much the best thing to
*look* at, and if you build a frozen target (the D3 patches) it is a strong
candidate to build it from — in which case freeze its disc fit first, publish
the fit drawn on the source, and say so.

Excluded by name for anything photometric: `nickel-obv-proof.png` and
`nickel-obv-4.jpg` (the latter is flagged AMBIGUOUS in `_jn1discs.json` at
62.13 % residual).

## MUST NOT REGRESS — re-measured by the judge

| dimension | current | how |
|---|---|---|
| D8 | 2.3714 % at 44 px, **0.0039 units deep** (below quantum) | `_jq8contain-v2.mjs` |
| D9 | 150 renders clean | `_jb9well.mjs` |
| D11 | overall min **0.0534** (`nickel.o vs dime.o` — this face is half the set's closest pair), reverse min 0.0797, ratio 1.49× | `_x6mat.mjs` |
| D5 obverse | round 1's lettering — re-derive and hold | `_jl1cap.mjs`, `_jl1pres.mjs` |
| the nickel REVERSE and all three other coins | **byte-identical** | — |

**D11 is the row at risk and it is not protected here.** `nickel.o vs dime.o
= 0.0534` is the closest pair in the whole set, the icon tier draws the bust,
and a D10 repair is *specifically* a change to what the icon tier emits.
Report the matrix before and after, and cost it if it moves.

## RULES (§7)

- **Never describe the coin from memory. Open the reference and measure.** If a
  photograph contradicts this brief, the photograph wins — say so. It has, in
  every round so far.
- Do not edit a target or an eval library. If one is wrong, §1.1: demonstrate,
  report, do **not** fix.
- Every located feature gets an overlay drawn on the source and you look at it.
- Response test and null test on every instrument you write; prefix `_jn6`.
- Pin both revisions explicitly in any before/after artefact.
- Report every iteration, including the ones that got worse, and any setting
  you rejected because it scored better.
- **Do not report a verdict.**
