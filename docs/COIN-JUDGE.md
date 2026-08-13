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

### 2.1 The five verdicts

Round 0 on the quarter hit four distinct situations that all wanted to be
called `UNMEASURED`, and they route to different people. One word for four
problems sends specialists at work they cannot do.

| verdict | meaning | fails? | routes to |
|---|---|---|---|
| `PASS` | value meets the gate | no | — |
| `FAIL` | value misses the gate | yes | specialist |
| `UNMEASURED` | nobody has measured it yet | yes | specialist |
| `BLOCKED` | measurable in principle, but **not with any artefact we have** | yes | **the judge** — names the acquisition needed |
| `N/A` | the metric has **no subject** on this side of this design | no | — |
| `WAIVED` | the measurement **cannot be made**, with a written reason | no | — |
| `UNTRUSTED` | the instrument failed §4 | yes | the judge |

`BLOCKED` is the one that earns its place. The quarter's reverse silhouette
is not unmeasured because nobody tried — it is unmeasured because no
reference we hold supports a segmentation, and the contours from three
thresholds agree with each other at only IoU 0.47–0.69. **A target that
disagrees with itself by 0.3 IoU cannot measure art to 0.05.** Dispatching a
specialist at that wastes a whole round; what it needs is a photograph.

`N/A` is not a waiver. A waiver is about a measurement that cannot be *made*;
`N/A` is about a metric with nothing to measure — structural rhythm on a
design with no repeated element. Both keep their row on the scorecard.

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
| D6 | Edge quality | **width-variation ratio** per mark; fraction of drawn length carried by ratio-1.000 marks | declared per coin | `edge` |
| D7 | Curve quality | max knot turn, **fitted contours only** | ≤ 75° | `silhouette` |
| D8 | Containment | % path length drawn outside the field circle | 0.00%, every tier | last toucher |
| D9 | Well-formedness | `undefined`/`NaN` over every id × side × tier | 0 | **blocking** |
| D10 | Tier behaviour | byte-identity where declared; no tier *pop* | as declared | `tier` |
| D11 | Discriminability | pairwise minimum at icon, equal width | no regression vs round 0 | `cross-coin` |
| D12 | Looked at | a human or the judge read the render | must have happened | judge |
| D13 | Device against field | device mean ÷ field mean, and ink fraction, vs the same on the reference | declared per coin | `tone` |

**Every dimension is scored PER SIDE.** Obverse and reverse get their own
row, their own gate and their own verdict. Round 0 found three failures that
only exist on one side — a containment breach, a tier jump, and "the reverse
draws no lettering at all at the size the app asks a child to name the coin".
A single per-coin row would have averaged every one of them away.

**D13 exists because D3 is structurally blind to it.** D3's ratios are
normalised against a patch *inside the device* (the cheek), so a device that
is uniformly too light against its field scores perfectly — every internal
relationship is right. But device-against-field is the entire content of the
icon tier, where the device is two or three tones and nothing else. Round 0
measured the quarter's reverse at 0.838 of its field where the coin is
0.689, and the obverse at 26px at 0.638 where the coin is 0.774: too light
on one side, too dark on the other, and D3 passed.

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

### 4.1 The null test — a search bound is not an answer

The response test catches an instrument that cannot move. It does **not**
catch one that moves but reports a non-answer, and that has now happened
three times: two extent finders and a band finder each returned **their own
search bound**, which looks exactly like a measurement.

> **Every searching instrument prints its bounds beside its result, and a
> result equal to a bound is reported as a failure, never as a value.**

Round 0's band finder passed its response test on a synthetic ring and still
could not read the real coin — plateau contrast 1.67 and 1.44, and it
returned the search bound on both sides. Widening the window moved the
answer, which is the tell. The correct verdict there is `BLOCKED`, not a
number.

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

**Partition by repairability BEFORE applying the order.** Split the failures
into *repairable* (a specialist can move them) and *blocked* (`BLOCKED`, or
`UNTRUSTED` — no specialist can help). Dispatch the highest-priority
**repairable** failure; list the blocked ones with the acquisition each
needs, and route those to the judge.

This is not hypothetical. On the quarter's round 0, three of the failures
were blocked on a single missing artefact — a reverse photograph good enough
to segment. Applying the priority order naively would have sent a silhouette
specialist at D2 with no target to fit, and burned a round producing nothing.

**Priority order** among the repairable: D9 → D8 → D1/D2 → D4 → D3/D13 → D5 →
D6 → D7 → D10. Structure before tone before ornament: a tone pass over a
wrong silhouette is work thrown away, and this order is why the rhythm gate
found the nickel's phantom columns before anyone tuned its greys.

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

### 6.1 A gate needs a LOCUS, not just a threshold

**A threshold without a locus can be met by choosing where to look.** Round 0
could not settle D5 because the same "HF ≤ 1.5×" ratio ran **0.98× → 2.14×**
swept over three viewBox units of radius at 84px. The threshold had been
stated in advance, as required; the *place it is evaluated* had not, and that
is the half that decides the verdict.

So every dimension carries a mandatory `locus` field — the region, radius
band, patch set or path list the metric is evaluated over — and **the locus
is frozen with the target**, not chosen at measuring time.

### 6.2 D11 carries two numbers, always

The set gate and the coin's contribution are different things, and reporting
only the second hides the first. Round 0's D11 "passed" purely by
construction — it is defined as *no regression versus round 0*, and in round
0 there is nothing to regress from — while the §17 set ratio sat at **1.49×
against a 3.0× gate**. A scorecard that shows only the green half is lying by
omission.

Every scorecard therefore carries both: the coin's pairwise minima, and the
set's current §17 ratio with its own verdict, **escalated on every round**
until the set passes or the gate is re-derived.

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

---

## Appendix P — round 0's critique of this document

Written by the judge on the process's first run, and **adopted into the body
above** (§2.1 five verdicts, §3 D6/D7/D13 and per-side scoring, §4.1 the null
test, §5 the repairability partition, §6.1 locus, §6.2 D11's two numbers).
Kept here because the reasoning is the evidence for each edit, and because a
process that cannot show why it changed is no better than one that never did.

What round 0 said should NOT change: §2 (absent evidence is a FAIL) — four
dimensions would otherwise have been blank rather than red; §1, which cost
nothing to obey; and §8's refusal to relax a gate, which was tested twice in
one round (a 1.51 against a 1.50 gate, and an over-broad 75° gate) and both
times recorded as a miss instead of a rewrite.

---

> **Nothing in this appendix is in force.** It is the first user's report on
> the first run (quarter, round 0, 2026-08-13, `coloringbook/judge/quarter-r0.md`),
> written because the owner asked for the spec to change now rather than after
> four coins had been scored against a bad rubric. Each item says what happened,
> then the concrete edit.

### P1. §14.1's D6 metric is degenerate — it flags 100% of marks

Applied verbatim to the quarter: **26 of 26** stroke-rendered marks flagged on
the obverse, **13 of 13** on the reverse, and **29 of 29** on the dime, whose
jaw line §14 names as the known instance. Of course it does — every relief mark
on a portrait sits on top of the head, and the head is a filled region, so
"stroke-rendered mark with a region neighbour" is true of every relief mark
ever drawn. The verdict FAIL is *literally* correct (nothing is defended in
writing, and every mark on this coin genuinely is uniform-width) and it is also
uninformative: it cannot rank, so it cannot route.

**Proposed edit to §3's D6 row and to `COIN-ART-METHOD.md` §14.1:** replace the
bounding-box neighbour test with a width-variation test, which is what §14 is
actually about ("a real coin has no uniform-width marks anywhere: relief carries
light, and light varies along a feature"):

> **D6 metric** — for every drawn mark, the ratio of its widest to its
> narrowest rendered width. A stroke-rendered mark has ratio exactly 1.000 by
> construction. Gate: report the **fraction of drawn mark length carried by
> ratio-1.000 marks**, and the count of those that are adjacent to a tapered
> region (the jaw-line signature, which is a *sub*-set). Lettering, the rim and
> the reeding are excluded by name, not by argument.

That gives a number that moves when a mark is tapered, ranks marks by how much
length they contribute, and still isolates §14's original case.

### P2. D7's 75° gate is meaningless on authored polygons

§4's turn-angle rule was written for a curve **fitted to a traced contour**,
where a >75° knot is an oscillation artefact. Applied to every scored path it
also flags a trapezoid's corner and a crescent's tip: the quarter's reverse
reports 39 knots over 75° and 30 of them are corners the die genuinely cuts.
The dimension still fails honestly here — `HAIR` has a 102.0° knot that D12
confirms is a visible kink — but only because the failure survives the
ambiguity.

**Proposed edit to §3's D7 row:**

> D7 applies to paths **produced by fitting a contour** (the smooth/resample/
> Catmull-Rom family). A path authored as a polygon declares its corners in the
> scorecard, by index, and those knots are exempt. A path with no declaration
> is scored whole.

### P3. The rubric has no dimension for the device against the FIELD

D3 divides every patch by the cheek. That is right — it removes exposure and
palette lightness and leaves the relationships line work controls — and it
makes the metric **blind to the one relationship the icon tier is made of**:
how dark the whole device is against the bare field. Round 0 measured it
outside the rubric and found the quarter's reverse at mean/field 0.838 against
the coin's 0.689 (too light, too sparse) and its obverse at 26px at 0.638
against 0.774 (too dark, too inky) — two real, opposite, unrepresented errors,
on the two draws a child actually sees.

**Proposed new row in §3:**

| # | Dimension | Metric | Typical gate | Owner |
|---|---|---|---|---|
| D13 | Device against field | mean/field and ink fraction over the disc interior, ours vs the photograph reduced to the SAME device pixel count, at every tier | \|Δ mean/field\| ≤ 0.05 at each tier | `tone` |

`_x6dark.mjs` already computes it; it just was not in the rubric.

### P4. Three verdicts are doing the work of five

`UNMEASURED` covered four very different situations on this coin, and they
route to different people:

- **nobody has done it yet** (D4's rhythm vector) → a specialist can do it;
- **the evidence does not exist** (D2: no reverse reference supports a
  segmentation; the contour disagrees with itself at IoU 0.47 across
  thresholds) → this needs an **acquisition**, and dispatching a specialist
  against it wastes a round;
- **the metric has no subject** (D4 on an obverse with no repeated element) —
  which is not the same as §2's waiver, because §2's waiver is about a
  measurement that cannot be *made*, not one that has nothing to measure;
- **the instrument returned a search bound** (D5's band finder) — a non-answer
  that looks exactly like an answer.

**Proposed edit to §2:** keep `UNMEASURED` (fails) and `WAIVED` (does not), and
add:

> `BLOCKED` — measurable in principle, but not with any artefact we have.
> Fails like `UNMEASURED`, and **routes to the judge, not to a specialist**: it
> names the artefact that would unblock it.
> `N/A` — the metric has no subject on this side of this design. Does not fail.
> Requires the same written justification a waiver does, and the scorecard keeps
> the row.

### P5. The priority order needs a repairability partition first

§5 says dispatch the highest-priority failing dimension. On the quarter that
would have been D8 (correct), but had D8 passed it would have been D2 — which
no specialist can move, because the target does not exist. **Proposed edit to
§5:** before applying the order, partition the failures into *repairable* and
*blocked*, dispatch the highest-priority **repairable** one, and list the
blocked ones with the acquisition each needs. Three of this coin's seven
failures are blocked on one thing: a usable reverse reference.

### P6. A gate needs a LOCUS, not just a threshold

D5's "HF ≤ 1.5×" is a real gate and I could not settle it, because the value
depends on where you measure it: swept over three viewBox units of radius at
84px, the same ratio runs 0.98× → 2.14×. The threshold was stated in advance;
the *locus* was not, and a threshold without a locus can be met by choosing
where to look.

**Proposed edit to §6:** every dimension in the scorecard carries a mandatory
`locus` field — the region, radius, sector, tier and patch set the value was
taken at — and the locus is frozen with the target, not chosen with the value.

### P7. §4 should require the null test as well as the response test

The method doc has it (§23.6, "print your bounds, and treat a result that
equals one as a failure report") and the judge spec does not. My band finder
passed its response test on a synthetic target and then returned its own inner
search bound on both real references — a confident non-answer.

**Proposed addition to §4:**

> **The null test.** Print the instrument's search bounds beside its answer. An
> answer equal to a bound is a failure report, not a value. Where a detector can
> return "no feature", make it able to, and record the degeneracy measure it used
> (for a plateau detector: max ÷ median).

### P8. D11 can pass while §17 fails, and round 0 makes that invisible

D11's gate is "no regression vs round 0", so round 0 passes by construction —
while the set-level §17 gate it exists to protect (reverse minimum ≥ 3× the
obverse minimum) fails at **1.49×**, as it did in v1.56.0. A green D11 next to
a red §17 is exactly the shape of scorecard this document was written to
prevent.

**Proposed edit to §3's D11 row:** D11 carries two numbers — the per-round
tripwire (no regression) **and** the set gate (rev/obv ratio), and the set gate
is reported as `ESCALATE` on every scorecard until it is met, on every coin.

### P9. Say that every dimension is scored per SIDE

§3 makes D1 and D2 side-specific and leaves the rest ambiguous. I scored all
of them on both sides, which is what turned up D8 (reverse only), D10 (reverse
only) and D5's "the reverse draws no lettering at all at the 84px recognition
draw". **Proposed edit to §3:** "every dimension is scored on **each side**
unless its metric names one; a dimension scored on one side is a blank on the
other, and §2 applies to blanks."

### What worked, and should not be touched

- **§2 (absent evidence is a FAIL)** is the best thing in the document. Four
  dimensions on this coin would have been silently blank under the old loop,
  and two of them — the reverse's tone and rhythm — are where the coin is
  actually weakest.
- **§1 (the judge never edits)** cost nothing and was easy to keep. The
  temptation it prevents is real: D8's fix looks like three characters.
- **§4's response tests** caught nothing this round — every instrument moved —
  but two of them (D3's "exactly the six wig patches moved", D11's "the other
  21 pairs are bit-identical") are what make the numbers believable at all, and
  they cost about ten minutes each.
- **§8's refusal to lower a gate** was tested twice: D5's 1.51× against 1.50,
  and D7's gate being broader than it should have been. Both are recorded as
  misses with the reasoning, and P2/P6 propose fixing the *next* round's gates
  rather than this one's verdict. That is the right shape and the document
  should keep saying so.
