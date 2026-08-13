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

### 1.1 The specialist is a deliberate check on the judge

Separation of powers was written to stop a specialist marking its own
homework. It turns out to run in both directions, and that is now an
intended feature rather than a side effect.

Round 1 on the quarter: the specialist, working against the judge's
containment eval, found that `fieldRadius()` took the *first* centred circle
over r 35 — and on the penny and nickel the blank itself is `circle r="47"`,
so those coins had been scored against a 47-unit circle instead of 40.5. The
judge had published `PASS` for both. The challenge was upheld in full.

> **A round is void only when a specialist EDITS an instrument, never when it
> reports one as faulty.** Reporting a fault is the specialist's job; fixing
> it is the judge's.

The procedure when a specialist believes an instrument is wrong:

1. **Do not edit it.** It is hashed; editing voids the round and the work.
2. Demonstrate the fault with a measurement — enumerate the cases, show the
   instrument's own output disagreeing with itself or with a hand check.
3. Report it as an observation. **Do not restate the affected verdicts** —
   verdicts are the judge's.
4. The judge then rules, fixes, re-hashes, and **re-scores retrospectively**.

**Retract beside; never rewrite.** A corrected history entry sits next to the
published one with both values and the reason. The faulty instrument is
retired at its old hash rather than edited or deleted, so any number ever
published can still be reproduced. A process that silently improves its own
past is indistinguishable from one that was right all along.

**A retired instrument must be impossible to import.** Retirement is not
inertness: `_jq8contain.mjs` runs its report at module top level, so merely
importing it prints retracted `PASS` rows that a reader could attribute to the
live tool. Retired instruments move to `judge/retired/` — **moved and never
edited**, because the content hash is the reproducibility anchor — and nothing
outside that directory may import from it.

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

**But try the overlay before you block.** `BLOCKED` has already been
over-applied once: the lettering band was ruled unmeasurable because the
plateau detector could not find it, and was then measured in minutes by
drawing a radius ladder on the reference and reading it off by hand — ours
36.40 against a reference 38.0–38.5, 1.9 units too far inboard. **"My detector
cannot find it" is not "no artefact can measure it."** Before writing
`BLOCKED`, draw what you have on the source and look at it; a hand annotation
is a legitimate frozen target.

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
| D8 | Containment | % path length outside the field circle **and max depth in units** | 0.00%, every tier | last toucher |
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

**D8 carries a depth, not just a percentage.** One number cannot separate
severities four hundred times apart. Round 1 measured the nickel at 8.09%
outside and **1.4698 units** deep — a real breach — and the penny at 7.93%
outside and **0.0038 units** deep, which is 0.0025 device pixels at 84px:
arc endpoints authored to two decimal places. Both are `FAIL` against a
0.00% gate and both should be, but a reader who sees only the percentages
will fix the wrong one first.

**D12 is not decoration.** `COIN-ART-METHOD.md` §0 has said since the first
pass that a subject nobody has looked at is not finished, and the eagle
proved it: the numbers said one thing, the tier render at 26px said another,
and the render was right.

**D12 needs a CONTROL whenever someone has said what you will see.** In
round 1 the judge was told the field ring had been broken by a white sliver
and was now healed — and looked, and saw exactly that. It was not true: the
ring stroke is emitted *after* the entire motif, so a bevel underneath cannot
break it at any offset. The ten-o'clock feature was the specular arc, proved
by rendering the **byte-identical obverse** and finding the same patch at the
same value.

So: **render the control first**, before reading the description, and prefer
a control the change cannot have touched — an unaffected side, an unaffected
tier, an unaffected coin. A described expectation is a prior, and D12 exists
precisely to be the one check that is not running on a prior.

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

### 4.2 The selection test — for instruments that CHOOSE rather than search

The null test covers instruments that *search*. It does nothing for
instruments that *select* one of several candidates, and that is how the
containment eval was wrong for two full rounds: `fieldRadius()` chose the
first qualifying circle from a set, and on two coins the first was the coin
blank rather than the field.

> **Any instrument that picks one item out of a candidate set prints the
> WHOLE set, and throws when the choice is ambiguous.**

Had that rule existed, `[47, 40.5]` would have been printed on the first run
and the fault would have been visible immediately instead of producing two
confident `PASS` verdicts.

### 4.3 An in-bounds answer can still be the wrong feature

A value inside its bounds, from a tool that responds to change, can still be
measuring something else entirely. Round 0's lettering band finder locked
onto the **bust edge** and returned a plausible in-range radius.

So: whenever an instrument identifies a *feature* rather than computing a
quantity, it must also emit **what it found** — the coordinates, the extent,
enough to draw it — and the judge overlays that on the source and looks
(§3 D12). `COIN-ART-METHOD.md` §6 already requires publishing the mask over
the source for silhouettes, and the same reasoning applies to every located
feature, not just masks.

**This is the highest-yield rule in this document.** The wrong-feature failure
has now happened four times: a band finder on the bust edge (twice), a
detector locked onto E PLURIBUS UNUM and the wreath, and the judge itself
seeing letters merge into a ring they do not touch. **Every one passed its
response test.** Every one was caught only by drawing the located feature on
the source and looking at it.

**An image's reproducible artefact is its GENERATOR.** Overlays and contact
sheets are excluded from git for size, so a PNG alone is unreproducible
evidence — commit the script that draws it, and name that script beside the
finding.

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
  alternate between passing and failing across three rounds. **Count
  DISPATCHES, not failures.** As first written this counted failures and would
  have fired on six dimensions after round 2, when only two had ever been
  dispatched and both were fixed first try. A dimension that keeps failing
  because nobody has been sent at it is not thrash; it is a queue.

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

> **A locus may never be a function of the artefact under test.** Freeze it as
> a literal, derived from the TARGET or stated outright — never computed from
> our own drawing.

Round 2 found the lettering eval deriving its evaluation radius from our own
parsed glyph geometry and then sampling *both* our art and the reference
there, so the reference's score moved when our drawing moved. The published
obverse **1.51× was really 2.0089×**. The tell had been sitting in the
scorecard for a round: a single `locus` field reading *"r 38.9 (icon/mid) and
37.5 (84px), 36.0 (190px)"* — three radii, one per tier of our own art.

**Enforcement — the reference-invariance test.** Score one target against two
different revisions of our art. Every target-side number must be
bit-identical. If the reference's score moves when only our drawing moved, the
locus is circular and the instrument is `UNTRUSTED`.

**Corollary: beware a gate defined as a ratio to a quantity the drawing
controls** — such a gate can be met by making the drawing *worse*. State which
side of a ratio is the fixed reference, and verify it cannot move.

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

### What worked, and should not be touched (round 0)

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

---

## Appendix Q — round 1's critique, adopted

Written by the judge after the first full repair cycle, and **adopted into
the body above** (§1.1 the specialist as a check on the judge, §4.2 the
selection test, §4.3 in-bounds-but-wrong-feature, §3 D8 depth and D12's
control). Four of the five exist because the process caught the JUDGE, not
the art — which is the outcome §1 was written to make possible and the
clearest evidence so far that it works.

---

> **Nothing in this appendix is in force.** It is the judge's report on the
> second run (quarter, round 1, 2026-08-13, `coloringbook/judge/quarter-r1.md`),
> written to the same standard Appendix P was: what happened, then the concrete
> edit. Round 1 differs from round 0 in one important way — **four of these
> five items exist because the process caught the JUDGE**, not the art.

### Q1. The specialist is a deliberate check on the judge, and §1 does not say so

§1 reads as a one-way constraint: the judge measures, the specialist edits and
is not trusted with a verdict. Round 1 ran the arrow backwards. The D8
specialist found that `_jq8contain.mjs` identified the field circle as *the
first centred circle over r 35*, which on the penny and the nickel is the
**blank** (`<circle r="47">`) rather than the field circle — so two of the four
coins had been scored against a circle 6.5 units too large, and two of round
0's `PASS` verdicts were wrong.

It reported the fault and **correctly did not fix it**, because §1 hashes the
eval libraries and editing one voids the round. The spec gave it no procedure
for that, so it improvised one, and it improvised well. It should not have had
to.

**Proposed addition to §1:**

> **The check runs both ways.** A specialist is closer to the drawing than the
> judge is, and it will sometimes see that an instrument is wrong. That is a
> feature of the separation, not a violation of it.
>
> A specialist that finds a fault in a target or an eval library **must report
> it and must not fix it.** The report names the file, the specific line or
> rule at fault, a reproduction the judge can run without trusting the
> specialist, and — where it can — the *evidence already in the judge's own
> published output* that should have caught it. It then continues with the
> brief it was given, measuring around the fault if it can.
>
> The judge settles the challenge **before anything else in the round depends
> on it**, and if the instrument was unsound it fixes it, re-hashes it,
> re-scores every affected coin, and **appends a retraction to the history
> rather than editing the old entry.** A judge that quietly improves its own
> past scores has destroyed the only thing its scores are worth.
>
> A round is **not** void when a specialist *reports* an instrument fault. It
> is void only when a specialist *edits* one.

### Q2. The null test covers searching. It does not cover SELECTING

§4.1 is written for an instrument that searches a range and might return its
own bound. `fieldRadius()` did not search anything — it *selected*, by a rule,
from a set of candidates, and the rule was wrong. No amount of bound-printing
would have caught it, and the response test passed, because moving the eagle
20 units out still moved the number.

What would have caught it was already on screen. v1 printed `% outside field`
and `% outside disc` (the latter hardcoded at 47) in adjacent columns, and on
exactly the two broken coins **those columns were bit-identical** — the failure
signature §4 already names, printed in the judge's own console, unread.

**Proposed addition to §4.1:**

> **The selection test.** Where an instrument identifies a feature by a rule
> ("the field circle is the first centred circle over r 35"), it prints **the
> full candidate set it chose from**, and it **throws** rather than choosing
> when the candidates it did not pick are inconsistent with the one it did.
> A selection rule that has only ever been tried on the subjects where it
> happens to work is not an instrument, it is a coincidence — so run it across
> **every** subject in the set, including the ones the round is not about.
>
> And: **read your own output.** §4's bit-identity rule is stated as a
> principle; make it a check. Any two columns of a table that are equal for
> some subjects and unequal for others are a bug report until explained.

### Q3. A containment gate needs a DEPTH, not just a fraction

D8 is "% of path length outside the field circle", gate 0.00%. Applied to the
whole set with the corrected instrument, it returns:

| | fraction outside | deepest breach | fraction deeper than 0.01 units |
|---|---|---|---|
| nickel obverse @44px | 8.09% | **1.4698 units** | 2.80% |
| penny obverse @76px | 7.93% | **0.0038 units** | **0.00%** |

Two near-identical percentages, four hundred times apart in severity. The
penny's entire figure is the shoulder drape's closing arc, whose endpoints are
authored to two decimal places and land at r 41.00285 against a circle of 41 —
**0.0025 device pixels** at the 84px draw. The metric is resolving its own
coordinate representation and calling it a defect, and it cannot rank, so it
cannot route. This is Appendix P1's complaint about D6, in a dimension P1
passed as healthy.

**Proposed edit to §3's D8 row:**

> D8 carries **two** numbers: the fraction of drawn length outside the field
> circle, and the **deepest breach in viewBox units**. The gate is stated on
> both. A breach shallower than the file's own coordinate quantum (0.01 units,
> the precision `n2()` writes) is reported at its depth and does **not** count
> against the fraction — but the fraction is still printed, unrounded, so the
> exemption is visible rather than folded in.

Stated as a *proposal*, not applied: the round-1 verdicts for the penny and the
nickel obverse are recorded as **FAIL against the gate as stated**, because the
gate predates the values and §8 forbids re-writing a verdict to fit a result
already seen. Gates may be re-derived — before re-measuring, in writing, which
is what this is.

### Q4. Passing the null test is not the same as finding the right feature

§4.1 says an answer equal to a bound is a failure report. Round 1's band finder
returned **interior** values on both sides — 25.00–35.00 on the obverse against
bounds of 20 and 46.5 — and passed the null test cleanly. It is still wrong:
our legend sits at 32.05–40.13, and the plateau it locked onto is the **bust
edge**. Its degeneracy measure (plateau contrast 1.67) is what says so.

A confident non-answer and a confident answer to the wrong question look
identical from inside the instrument.

**Proposed addition to §4.1:**

> Beside its bounds and its result, a detector reports **what it locked onto**,
> checked against something independent of the reference it is reading — our
> own geometry, a second reference, or the feature's expected location. An
> in-bounds answer that disagrees with the independent check by more than the
> gate's own tolerance is `BLOCKED`, not a value, and the degeneracy measure is
> recorded either way.

### Q5. D12 needs a control, because the eye confirms what it is told

The round-1 specialist reported that the field ring, "previously broken by a
white sliver at about ten o'clock, now runs unbroken." I rendered both
revisions at the real device pixel count, looked at a 14× crop of the
upper-left, and **saw exactly that** — because I had been told it would be
there.

It is false. The field ring stroke is emitted *after* the entire motif, so a
white bevel drawn underneath cannot break it, at any tier, ever. Measured at
device resolution, the ring band's washed-out angles go from 31 of 720 to 30,
and the lightest sample is identical (197 at 223.0°) in both revisions.

The thing that corrected me was a **control**: rendering the quarter *obverse*,
which is byte-identical between the two revisions and has no eagle on it, and
finding the same pale patch at the same clock position with the same value.
That reattributed it to the specular highlight arc, which is drawn last, on
both sides, and which nobody had touched. (Something real *was* fixed — bevel
spill on the reeded rim at ≈9.7 o'clock, grey 221 → 197 — just not the thing
that was claimed.)

**Proposed edit to §3's D12 row and §8:**

> D12 renders a **control** beside the subject: something the round did *not*
> change — the other side, another coin, or the previous revision — chosen so
> that an artefact appearing in both cannot be attributed to the change. Where
> a specialist has described what the judge will see, the judge renders the
> control **first**.
>
> And to §8's list of what the judge cannot do: **the judge cannot un-read a
> claim.** A described artefact is found by an eye that went looking for it.
> This is why D12 is scored with a control and why "I looked and it is fixed"
> is not a D12 result — "I looked, here is the control, here is what
> distinguishes them" is.

### What round 1 says should NOT change

- **§1's hashing.** It is the reason this round could be trusted at all: 34 of
  34 frozen artefacts byte-identical, so every difference is attributable to
  one file. It also produced the round's best evidence almost free — 20 of 180
  renders changed, path data byte-identical in all 90, which settles seven
  dimensions without measuring anything.
- **§6.1's frozen locus.** It decided D11. The mid-tier cost was real
  (−1.54% on the worst pair) and the icon locus was frozen before any value
  existed, so the honest answer was "outside the gate, costed, accepted" rather
  than either "regression, revert" or a silent pass. Without a pre-frozen locus
  I could have argued that either way after the fact.
- **§8's refusal to relax a gate**, tested a third time here on D8's depth
  problem, and again recorded as a miss with a proposal attached rather than a
  rewritten verdict.

---

## Appendix R — round 2's critique, ADOPTED

> **Nothing in this appendix is in force.** It is the judge's report on the
> third run (quarter, round 2, 2026-08-13, `coloringbook/judge/quarter-r2.md`),
> written to the same standard as Appendices P and Q: what happened, then the
> concrete edit. Round 2 continues round 1's pattern — **five of these six items
> exist because the process caught the JUDGE.**

### R1. A locus may not be a function of the artefact under test

§6.1 says a gate needs a locus and that the locus is frozen with the target. It
does not say what a locus may be *made of*, and that turned out to be the half
that mattered.

`_jq5letter.mjs:193`:

```js
const rMid = ob ? (ob.baseMin + ob.baseMax) / 2 + 0.36 * (ob.outer - ob.inner) / 2 : 38.9;
const ho = hf(o.fn, rMid, …), hr = hf(refAtTier, rMid, …);
```

`ob` is our own parsed glyph geometry. Both our art **and the reference
photograph** are sampled at `rMid`, so **when our drawing changes, the radius
moves and the reference's own score changes with it.** Enlarging `QUARTER
DOLLAR` — at the bottom of the coin, entirely outside the 250–290° sector the
metric samples — moved the *photograph's* HF from 0.4004 to 0.3637.

The literal `38.9` was only the fallback for "we drew no glyphs", which is
exactly the state round 1 measured on the reverse. That is why it survived two
rounds: the one number nobody could contaminate was the one everybody was
watching.

This is strictly worse than §6.1's complaint. The locus was **believed frozen**
— round 1's §7 brief says *"HF evaluated at r = 38.9 viewBox units … Do not
evaluate anywhere else"* — and the instrument overrode it silently. And the
evidence was in the judge's own published scorecard: `D5.obverse.locus` reads
`"…r 38.9 (icon/mid) and 37.5 (84px), 36.0 (190px)"` — **three radii in one
`locus` field, one per tier of our own drawing**, written by the judge in the
same session it wrote §6.1.

Cost: a retracted published number on art that never changed. D5-obverse at
84px was published twice as **1.51× against a 1.50× gate** — the near-miss §8
was twice praised for refusing to round away. At the frozen locus it is
**2.0089×**. The obverse is byte-identical across all three rounds.

**Proposed addition to §6.1:**

> **A locus is either a frozen literal or computed from the TARGET. It may
> never be computed from the artefact under test.** Where a metric compares
> ours against a target, sampling both at a place our drawing chose means the
> target's own score moves when our drawing moves, and the ratio measures
> nothing.
>
> **The reference-invariance test.** Every instrument that scores ours against
> a target runs it: score the same target against **two different revisions of
> the art** and require every target-side number to be **bit-identical**. If a
> target-side number moves, the instrument is `UNTRUSTED` and every ratio it
> has ever published is void. It is one extra run and it is mechanical.

### R2. A gate that is a RATIO to something the drawing controls can be gamed by making the drawing worse

D10's gate is *boundary jump ≤ 4× the 90th-percentile within-tier jump*. Round 2
moved the reverse from 5.80×/5.92× to 5.63×/5.74% and **the boundary values are
bit-identical** — 0.0904 and 0.0922, unchanged. All of the movement is the
denominator: the new legend switch is itself a within-tier pop, so it raised the
within-tier p90 from 0.0156 to 0.0161 and made the boundary gate read better.

The specialist saw this and disclaimed it. It should not have had to rely on a
specialist's honesty: the instrument printed only the ratio.

The same dimension carries a second instance of §6.1: the sweep window `26..120`
is a locus that was never derived. The reverse legend used to switch on at 135,
so a real within-tier discontinuity sat permanently outside the instrument's
view. Swept 26–200, the *same untouched boundaries* read **9.04×/9.22×**.

**Proposed edit to §3's D10 row:**

> A gate stated as a ratio prints its **numerator in absolute units** beside the
> ratio, always, and a round may not record an improvement in the ratio unless
> the numerator moved. Where the denominator is a property of the drawing, say
> so in the gate.
>
> D10 additionally reports the **within-tier** jump distribution and every
> within-tier pop, not only the tier boundaries. A drawing that changes
> discontinuously *inside* a tier is exactly the defect the dimension is named
> for, and the gate as written cannot see it in either direction.

### R3. `BLOCKED` has been over-applied — try the overlay before you block

§2.1 earns `BLOCKED` its place, and it is the right verdict for D2, D4-reverse
and D3-reverse: those are physics (a circulation strike has no reflectance
difference between device and field) and statistics (a noise floor above the
flat-drawing floor).

D5-band-reverse was blocked for a different reason and it was wrong. The finding
was *"the σ-plateau method cannot find the band, in any of 48 sector × reference
combinations, because the eagle's wings occupy every radius inboard of the
legend"* — which is true, and which is a statement about **one detector**, not
about the artefacts. The band is directly locatable: the judge drew a radius
ladder on `quarter-rev-3.jpg` at 2000px and read it off. Our top legend sits
about **1.9 viewBox units too far inboard** against a ±1.5-unit gate, and its
letters are about 20% too tall — a measurable miss, with the references we
already hold, that had been recorded as unmeasurable for two rounds.

**Proposed addition to §2.1:**

> `BLOCKED` means *no artefact we have can measure it*. It does not mean *the
> instrument I built cannot measure it*. Before a `BLOCKED` is recorded, the
> judge must try the **overlay**: draw the feature's candidate location on the
> source at full resolution and look (§4.3). An overlay reading is evidence, not
> a frozen value — but if the overlay can see the feature, the verdict is
> `UNMEASURED` and the work is the judge's, not an acquisition.

### R4. A retired instrument must not be importable by a live one

`_jq5letter.mjs:150` does `await import('./_jq8contain.mjs')` — the v1 retired as
unsound in round 1 — to destructure a `textMarks` it never uses. The import has
side effects: v1 runs its full sweep and prints a containment table at the head
of D5's output, in which the nickel obverse reads **`0.0000%`** because v1
measures it against the r-47 blank. **A retired instrument is printing retracted
verdicts into a live instrument's console.**

**Proposed addition to §1.1:** retiring an instrument means it stops running.
Retire it by moving it to a `retired/` path and leaving a stub that throws on
import, so the hash is preserved for audit and no live instrument can execute it
by accident.

### R5. §5's thrash rule counts failures; it should count DISPATCHES

§5: *"thrash: the same dimension fails three times."* Applied literally to round
2, **six** dimensions trip it — D5, D6, D7, D10-reverse, D13, and D2/D4 as
blocked — because they have failed in rounds 0, 1 and 2. Meanwhile only **two**
dimensions have ever been dispatched (D8 in round 1, D5-reverse in round 2) and
both were fixed on the first attempt.

A dimension that fails three times **without ever being worked on** is a
backlog, not thrash. As written the rule would terminate a loop that is working.

**Proposed edit to §5's Termination block:**

> - **thrash**: the same dimension is **dispatched** three times and still
>   fails, or two dimensions alternate between passing and failing across three
>   rounds. Failures that have never been dispatched are backlog and are
>   reported as a count, not as a termination condition.

### R6. §4.3 is the highest-yield rule in the document and it is a paragraph

Q4's failure mode — an in-bounds, response-tested, bound-checked detector
returning a confident answer to the **wrong question** — has now occurred four
times, three of them on the same dimension:

1. round 0 — the band finder locks onto the **bust edge**;
2. round 1 — the same detector, the same bust edge;
3. round 2 — a new band finder locks onto **E PLURIBUS UNUM** and the **wreath**;
4. round 2 — **the judge** locks onto a field-ring collision that is not there.
   Geometry said 0.55 device pixels of clearance; the eye duly found the
   consequence; the device-resolution ring walk says **1 of 720** angles
   darkened, by 5 grey levels, and the byte-identical obverse control says 0 of
   720.

The fourth is the interesting one, because no specialist was involved. Q5 said
the judge cannot un-read a claim. Round 2 adds the mirror case: **the judge
cannot un-read its own arithmetic.** A number you computed yourself is as strong
a prior as a sentence somebody told you.

All four were caught by the same thing — drawing what was found on the source
and looking at it.

**Proposed edit to §4.3:** promote it from a paragraph to a numbered obligation
with a deliverable. Every located feature publishes an **overlay artefact by
filename** in the scorecard, and a dimension whose instrument locates a feature
without a published overlay is `UNTRUSTED`. And extend §3's D12 control rule:
the control is rendered first whenever the judge holds *any* prior about what it
will see — **including a prior of its own manufacture**.

### What round 2 says should NOT change

- **§1's hashing**, a third time. 37 of 37 byte-identical, `git status` showing
  one edited file, and 4 of 180 renders changed with path data byte-identical in
  all 180 — that partition alone settles nine dimensions without measuring
  anything, and it is what made this round attributable to one flag.
- **§1.1's "retract beside, never rewrite."** It has now been used three times
  (`_jq8contain` v1, `_jq8depth`'s arithmetic, `_jq5letter` v1) and each time
  the retained old hash is what let the retraction be checked. Note that the
  promise was *unkeepable* until `2a656a3` made `coloringbook/judge/` tracked —
  a spec that requires reproducibility must also require the evidence to be
  under version control, and that should be stated.
- **§8's refusal to relax a gate**, tested a fourth time. D5-obverse went from a
  1.51× miss to a 2.01× miss when the instrument was fixed, and the honest move
  was to publish the worse number against the unchanged gate.
- **§3's D12 control.** It has now corrected the judge in two consecutive rounds,
  once against a specialist's claim and once against the judge's own arithmetic.
  It is the only check in this process that is not running on a prior.
