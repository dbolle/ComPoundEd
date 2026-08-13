# The coin judge — a holistic pass/fail loop with specialist repair

A reusable process for taking **one coin** to a defensible standard across
every dimension at once, instead of the ad-hoc "pick a subject, run a phase,
look at it" loop that produced v1.55.0 and v1.56.0.

That loop worked, but it had three faults this one is built to remove:

1. **A subject could pass every phase it was given and still be bad**,
   because nobody scored the dimensions nobody thought to run. The cent and
   nickel shipped with a shoulder slab that no published number covered
   (v1.56.0, §24) — every figure was clipped to a region that excluded it.
2. **Improving one dimension silently damaged another.** Narrowing the coat
   pushed 25.1% of the cent's lapel onto bare field, invisible to IoU
   because `fill="none"` has no area.
3. **The agent that changed the art also reported the score.** Six tools
   produced confident wrong numbers in one night; a self-reported number
   from the party with an interest in it is not evidence.

Companion to `docs/COIN-ART-METHOD.md`, which defines the *measurements*.
This defines the *process* that applies them.

---

## 1. Separation of powers — the one rule everything else rests on

> **The JUDGE measures and never edits. A SPECIALIST edits and never scores
> its own gate.**

The judge owns the frozen targets, the eval libraries, and the scorecard.
Specialists receive a scoped brief and return dirty files. The judge then
re-derives **every** number itself, from the artefacts, and never accepts a
number a specialist reports.

A specialist may of course measure while it works — it must, to work at all.
That measurement is a working instrument, not evidence. Only the judge's
re-derivation goes on the scorecard.

**Enforcement, mechanically:** the judge records a SHA-256 of every frozen
target and every eval library before dispatching. If any changed when the
specialist returns, **the round is void** — revert and re-dispatch with the
violation named. Freezing a target after the art moved proves nothing
(`COIN-ART-METHOD.md` §2), and a specialist that can edit the target can
score anything it likes.

---

## 2. Absent evidence is a FAIL

A dimension that has never been measured is **not passing**. It is `UNMEASURED`,
and `UNMEASURED` blocks the coin exactly as `FAIL` does.

This is the fault that let the quarter reverse ship with "phase 1 only" while
the coin as a whole looked finished, and the fault that hid the shoulder for
two releases. A scorecard with a blank in it is a red scorecard.

The only escape is `WAIVED`, which requires a written reason naming *why the
measurement cannot be made* — not why it is inconvenient. "The dime has one
reference, so scale confidence is unmeasurable" is a waiver. "We ran out of
time" is a FAIL.

---

## 3. The rubric

Every dimension carries: a metric, a gate **stated before measuring**, a
verdict, and the specialist that owns repair. Gates are per-coin and live in
the scorecard, not here — this table fixes the *dimensions*, not the numbers.

| # | Dimension | Metric | Typical gate | Owner |
|---|---|---|---|---|
| D1 | Obverse silhouette | region IoU vs frozen mask | ≥ 0.95 | `silhouette` |
| D2 | Reverse motif silhouette | motif IoU vs frozen mask | ≥ 0.95 | `silhouette` |
| D3 | Interior tone | mean \|Δratio\| vs flat-drawing and palette floors | ≤ ½ flat floor | `tone` |
| D4 | Structural rhythm | element count; centre positions | **count error 0**; mean ≤ 0.15 gaps | `rhythm` |
| D5 | Lettering | band radius/extent; HF variance vs blurred ref | HF ≤ 1.5× | `lettering` |
| D6 | Edge quality | stroke-rendered marks with filled-region neighbours | 0 unexplained | `edge` |
| D7 | Curve quality | max knot turn on scored paths | ≤ 75° | `silhouette` |
| D8 | Containment | % path length drawn outside the field circle | 0.00%, every tier | last toucher |
| D9 | Well-formedness | `undefined`/`NaN` over every id × side × tier | 0 | **blocking** |
| D10 | Tier behaviour | byte-identity where declared; no tier *pop* | as declared | `tier` |
| D11 | Discriminability | pairwise minimum at icon, equal width | no regression vs round 0 | `cross-coin` |
| D12 | Looked at | a human or the judge read the render | must have happened | judge |

**D9 is blocking**: if it fails, nothing else is scored that round. A drawing
that emits `undefined` has no meaningful IoU.

**D11 is measured but rarely repaired per-coin.** It is a property of the
*set* (v1.56.0: the three silver reverses sit at 0.081/0.079/0.098 whichever
way the dime is drawn). Its role here is as a **regression tripwire** — a
specialist must not spend the set's separability to buy one coin's fidelity
without that being visible and costed.

**D12 is not decoration.** `COIN-ART-METHOD.md` §0 has said since the first
pass that a subject nobody has looked at is not finished, and the eagle
proved it: the numbers said one thing, the tier render at 26px said another,
and the render was right.

---

## 4. Instrument sanity — every metric proves it can move

Before a number enters the scorecard, its tool passes a **response test**:

> Perturb the art in a way that must change this number, re-measure, and
> confirm it moved in the expected direction and roughly the expected amount.

Six tools failed this in one night: a path rewriter that dropped `C`
commands; a strand tensor that returned the same value when the art changed;
a tone tool that read a 3-channel buffer as 1-channel; a peak finder that
returned 0 for four rectangular columns; two extent finders that returned
their own search bounds.

Two corollaries, both paid for:

- **Two bit-identical answers from two different inputs is not agreement.**
  Both times that happened, the value was a search bound.
- **Feed any tone pipeline a flat patch of a known palette colour and check
  the number that comes back is that colour's own grey** (§20.1). One line.

The response test's result is recorded on the scorecard beside the value. A
number whose tool has not passed its response test is `UNTRUSTED`, and
`UNTRUSTED` blocks like `FAIL`.

---

## 5. The loop

```
round 0   judge: freeze targets, hash them, score ALL dimensions,
                 write scorecard, look at the render
          ├─ all PASS ................................ done
          └─ otherwise
round N   judge: pick the highest-priority failing dimension
          dispatch its specialist with a SCOPED brief
          specialist: edit, return dirty
          judge: verify hashes unchanged, re-score ALL dimensions
          ├─ target fixed, nothing regressed ......... accept, commit
          ├─ target fixed, another gate broken ....... REVERT, re-dispatch
          │                                            naming the regression
          └─ target not fixed ........................ record, try once more,
                                                       then escalate
```

**Priority order** when several fail: D9 → D8 → D1/D2 → D4 → D3 → D5 → D6 →
D7 → D10. Structure before tone before ornament: a tone pass over a wrong
silhouette is work thrown away, and this order is why the rhythm gate found
the nickel's phantom columns before anyone tuned its greys.

**One specialist at a time.** Non-negotiable on this box — 7.6 GB and 4
cores, OOM-crashed twice by concurrent Chromium. It is also better process:
two specialists editing one file cannot be attributed when a gate moves.

### Termination

The loop **must** stop. It ends on any of:

- all dimensions PASS or WAIVED;
- **round budget** exhausted (default 4 — at ~60–100 min per specialist that
  is most of a working day);
- **no net progress**: two consecutive rounds where no failing dimension
  improved by more than its noise floor;
- **thrash**: the same dimension fails three times, or two dimensions
  alternate between passing and failing across three rounds.

Every ending except the first is an **escalation**, and an escalation writes
down what it could not fix and what it would need. A loop that quietly runs
out of budget and reports its last scorecard as a result is the failure this
whole document exists to prevent.

---

## 6. The scorecard

`coloringbook/judge/<coin>-scorecard.json`, rewritten whole each round, and
appended to `<coin>-history.jsonl` so regressions are visible over time.

```json
{
  "coin": "quarter", "round": 2, "commit": "2e2d104",
  "targets": { "_qtmask.json": "sha256:…", "_qtlib.mjs": "sha256:…" },
  "dimensions": [
    { "id": "D1", "name": "obverse silhouette",
      "metric": "region IoU vs _qtmask.json, v<=0.76",
      "gate": ">= 0.95", "value": 0.9653, "verdict": "PASS",
      "response_test": "shifted cx by 1 unit -> 0.9653->0.9418, moved as expected",
      "owner": "silhouette", "round_first_measured": 0 }
  ],
  "verdict": "FAIL", "failing": ["D4", "D5"],
  "looked_at": "coloringbook/judge/quarter-r2.png",
  "notes": "…"
}
```

Rules: `value` is **the judge's own re-derivation**; `gate` is written before
`value` is known; a dimension never silently disappears between rounds — if
it stops being measurable it becomes `UNMEASURED`, which fails.

---

## 7. Specialist brief template

Every specialist gets exactly this shape. The constraints section is what
keeps a fix from becoming a regression.

```
SUBJECT      quarter, reverse
DIMENSION    D4 structural rhythm
CURRENT      count error 2; mean position 0.31 gaps
GATE         count error 0; mean <= 0.15 gaps; worst <= 0.30
TARGET       coloringbook/_qtmask-rev.json   [READ ONLY — hashed]
EVAL         coloringbook/_qtlib.mjs         [READ ONLY — hashed]

MUST NOT REGRESS (current values, re-measured by the judge after you return)
  D1 0.9653   D3 0.1447   D8 0.00%   D9 0   D11 rev-min 0.0794

RULES
  - Never describe the coin from memory. Open the reference and measure.
    If the photograph contradicts this brief, the photograph wins — say so.
  - Do not edit the target or the eval library. They are hashed; editing
    them voids the round.
  - Report EVERY iteration including the ones that got worse.
  - Do not report a verdict. You report what you changed and what you
    observed; the judge decides whether it passed.
```

That last line matters. A specialist that reports "PASS" has crossed into
the judge's role, and the judge should ignore the claim and re-derive.

---

## 8. What the judge cannot do, and must say so

The judge measures conformance to photographs. It does not measure:

- **whether a child can name the coin** — that is D11's crude proxy at best,
  and D11 is a pixel metric, not a recognition model. v1.56.0 recorded a
  live suspicion that mean-absolute-difference *understates* the reverses
  because every pair shares an identical disc, rim and field, and because
  MAD is not shape-aware;
- **whether the reference is any good** — a frosted proof is the best shape
  reference and the worst tone reference (§20.3), and two files can be the
  same photograph (the dime's were, NCC 0.9931);
- **taste.** The eagle's tidier old silhouette scored and looked better to
  an agent's eye, and was further from the coin.

When a dimension fails for one of these reasons, the honest verdict is
`ESCALATE`, not a lower gate. **Lowering a gate to make a coin pass is the
one move this process forbids outright.** Gates may be re-derived — with the
derivation written down, before re-measuring — but never relaxed to fit a
result that already exists.

---

## 9. Testbed: the quarter

The quarter was chosen to build this because its state exercises every path:

- **a genuine near-miss** — strand direction 15.3° against a 15° gate,
  reported as a miss rather than rounded;
- **UNMEASURED dimensions** — the reverse got phase 1 only: no rhythm
  vector, no band vector;
- **the weakest tone normaliser of the four coins**, so D3 is honestly hard;
- **the weakest scale confidence**, ±3%, four times the residual error — a
  case where a high IoU means less than it appears and the judge must say so;
- **single-photograph tone**, so §12.7's sign test cannot run — a real
  `WAIVED` candidate, which exercises the waiver path;
- and it is **one half of the closest obverse pair** (nickel/quarter), so
  D11 has something to say about it.

Run log lives in `coloringbook/judge/quarter-*.md`.
