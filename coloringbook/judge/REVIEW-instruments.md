# Adversarial review — the instrument library and the evidence trail

Reviewer 2 of 3. Dispatch commit `44aacbb`. Area: the 617 `.mjs` instruments,
the frozen `.json` targets, and the 109 entries in `judge/*-history.jsonl`.
Reviewer 1 owns the process and rubric; reviewer 3 owns the image library and
the shipped art. I have stayed off both.

Everything below was executed, not read. Every probe is committed beside this
file as `coloringbook/judge/_rvinst*.mjs` and every number here can be
regenerated with one command, named at the point of use.

---

## 0. The nine numbers

| | |
|---|---|
| instrument files in scope | **617** — 370 tracked under `judge/`, **247 untracked** at `coloringbook/` top level |
| run with no arguments from the repo root | 610 executed; **420 (68.9 %) exit 0 with output**, 128 (21.0 %) throw, 45 print nothing at all, 4 hang past 120 s |
| `judge/` instruments that can reach `src/art/coins.js` | **244 of 370 (65.9 %)** |
| response test: output moves when the art is scaled 1.05× | **73 of 94 testable (77.7 %)**; 20 of the 21 non-movers have a defensible reason, **1 is measuring nothing** |
| determinism control (two independent runs, identity hook) | **156 of 156 byte-identical** once `mkdtemp` paths are normalised |
| frozen artefacts still at their recorded SHA-256 | **87 of 92** — the two that moved are the subject (expected) and **one eval library that was edited after two rounds froze it** |
| instruments cited as evidence that do not run today | **40 of the 270 cited**; 38 of those 40 fail for a reason other than a missing argument; **18 of them are cited inside `src/art/coins.js` itself** |
| instruments cited as evidence that exist on **one disk only** | **56 of 270 (20.7 %)** — including `_x6mat`, `_x6lib`, `_x6dark`, `_rvnorm`, `_pylib`, `_qtlib`, `_blnorm`, `_p2lib` |
| instruments that **write to the evidence trail on execution** | **14** — my sweep appended **54 duplicate round records** to the five history files, a 49.5 % inflation. Reverted (§4c). |

Hand-re-derived sample of published figures: **6 of 20 reproduce (30 %)**. The
automated upper bound — "does *any* instrument still print this string" — is
93.8 %, and that gap is the finding, not the 93.8 %.

The apparatus is **62,887 lines** (50,901 instrument code + 7,873 judge prose +
4,113 method docs) against **5,382 lines of art**. 11.7 : 1.

---

## 1. HOW MANY INSTRUMENTS ACTUALLY RUN?

`node coloringbook/judge/_rvinst_run.mjs` executed every `.mjs` once, with no
arguments, cwd = repo root, 120 s cap, 3 at a time. Seven were held back
because static analysis showed they write into the **shared** checkout
(`_look-*.mjs`, `coins.mjs`, `pigs.mjs`, `proof.mjs`, `oinks.mjs`).

```
617 in scope   (judge/ 370, coloringbook/ 247)
  7  not run — would write into the shared checkout
610 executed
  420  (68.9%)  exit 0 with output and no non-answer marker
  128  (21.0%)  THROW
   45  ( 7.4%)  exit 0 with NO OUTPUT AT ALL
   13  ( 2.1%)  exit 0 but print NaN / Infinity / undefined / a search bound / a self-declared FAIL
    4  ( 0.7%)  killed at 120 s
```

`judge/` alone: **249 of 370 (67.3 %) run clean**, 96 (25.9 %) throw, 8 print
nothing, 2 hang, 9 print a non-answer, 6 not run.

**Why the 128 throw** (`_rvinst_class.mjs`):

| reason | n | judge/ |
|---|---|---|
| needs an argument, says so, exits — **healthy** | 6 | 6 |
| depends on a `_XX-before-coins.js` / `_XXfitcheck.json` scratch snapshot that was never kept — **permanently unrunnable** | 25 | 25 |
| dead path or missing module | 18 | 15 |
| API drift — `Cannot read properties of undefined`, `not a function`, bad JSON | 31 | 29 |
| other (sharp write into a directory that does not exist, explicit stale-anchor throws) | 48 | 21 |

Only **6 of 128 throws are the healthy kind**. The single largest cause is a
class the process created for itself: 25 instruments take their "before" from a
file like `coloringbook/judge/_jc5-before-coins.js` that was a working copy and
was never committed. §4.3's rule — *"an image's reproducible artefact is its
GENERATOR"* — was applied to pictures and not to before/after comparators, and
a comparator whose "before" is gone is exactly as unreproducible as a PNG
whose generator is gone.

### The 13 non-answers, one by one

Of the 13, two are false positives of my regex (`_jb9well.mjs` and
`_rescore.mjs` print the *words* "undefined"/"NaN" while describing a response
test that went red on purpose). The remaining 11 split cleanly:

**§4.1 working exactly as designed — 4.** `_jn2indep.mjs`, `_jp3usmint.mjs`,
`_jq43ccby.mjs` and `_jq44band.mjs` all print `!! REGISTRATION AT A BOUND —
this is a failure report, not a value (§4.1)` beside the number. This is the
document's best rule and these four honour it.

**Instruments that declare themselves untrusted and are still cited — 2.**

- `_jb8geom.mjs`: `RESPONSE TEST — move the eagle roundel cx 70 -> 86:
  outside-border 0.0000% depth 0.0000 -> 0.0000% depth 0.0000 *** DID NOT MOVE
  — instrument UNTRUSTED`. It is named in `buck-scorecard.json` as the source
  of **D8 obverse = PASS** and D8 reverse = PASS.
- `_jk9prof.mjs`: `SEED-INVARIANCE — search axis 23.125 -> 24.125: 7/22 rows
  returned the same two edges *** SEED-DEPENDENT — treat as UNTRUSTED ***`.

**Raw NaN / Infinity / undefined with no guard — 5.** `_nk12.mjs`,
`_nk4.mjs`, `_pydisc.mjs`, `_qthairline.mjs` (all untracked), and — the
important one — **`_jq2ext.mjs`**:

```
device marks (fill #8e969e): 0
head        X 46..54  Y 25..31                 not found
whole device union: X Infinity..-Infinity  Y Infinity..-Infinity
  wing span left   target     12   ours Infinity   |d| Infinity
```

`_jq2ext.mjs` selects the quarter's reverse device by the literal fill
`#8e969e` (`PALETTE.quarter.motif`). The redrawn eagle emits `deep` and white,
never `motif`, so the selector matches **zero marks** and the instrument prints
`Infinity` in seven rows as if it were a measurement. This is §4.2's selection
failure, live today, in the instrument written to stand in for D2 on the
quarter reverse while that row sits `UNMEASURED` and no mask can be built.

---

## 2. HOW MANY CAN SEE THEIR OWN SUBJECT?

`_rvinst_blind.mjs` resolves, to four hops, whether each instrument reaches
`src/art/coins.js` — by importing it, by importing a library that does, or by
reading its source.

```
judge/ instruments                                     370
  can reach src/art/coins.js                           244  (65.9%)
  cannot                                               126
  cannot, YET PRINT AN "OURS" COLUMN                    14
```

The 14: `_jb13margin` `_jb14d1` `_jb3seal` `_jb4read` `_jb5text` `_jd1disc`
`_jl1font` `_jn15agree` `_jn3unwrap` `_jn5rim` `_r157card` `_r16card`
`_r1card` `_r4card`.

Four of those are legitimate (`_jn15agree` takes "ours" as a JSON argument
measured elsewhere; `_jd1disc` only labels an overlay; the `_r*card` files are
historical scorecards). **Three are misreporting right now.**

### 2a. `_jb14d1.mjs` — confirmed, and still uncorrected

```js
const OURS = { cx: 34, cy: 28, rx: 17, ry: 21 };
```

The note's vignette is now `cx 50.05 cy 30.30 rx 9.75 ry 14.00` — the frozen D1
locus itself (`coins.js:5081`). The instrument prints `IoU 0.1496 FAIL`. The
true value is **1.0000 PASS**.

The buck round-3 history entry *reports* this fault, correctly and in full.
Nothing was done about it: `_jb14d1.mjs` is unedited, `buck-scorecard.json`
still carries `"value": 0.1496, "verdict": "FAIL"`, and no retraction row sits
beside the round-0 D1 entry in `buck-history.jsonl`. §1.1 requires the judge to
*"rule, fix, re-hash, and re-score retrospectively"*. Step one happened; steps
two to four did not.

### 2b. `_jb3seal.mjs` — the same bug, undetected, and it cites §6.1 as its licence

```js
// what noteSVG draws, read from the source and restated here as a literal so
// the LOCUS is never a function of the artefact (§6.1)
const OURS = {
  full: { pyramid: { cx: 30, cy: 28, rx: 16, ry: 16 }, eagle: { cx: 70, ... } },
```

The roundels are now `PYR {23.13, 27.88, 8.88, 11.38}` and
`EAG {76.88, 27.75, 8.88, 12.38}` — again, the instrument's own measured target.
Re-derived with OURS taken from the art (`_rvinst_seal.mjs`, target side
untouched):

| row | published | today | published verdict | true verdict |
|---|---|---|---|---|
| D2a pyramid IoU | 0.3943 | **1.0000** | FAIL | PASS |
| D2b eagle IoU | 0.4290 | **1.0000** | FAIL | PASS |
| D2c separation | 40.00 (−25.6 %) | **53.75 (0.0 %)** | FAIL | PASS |
| D2d pyramid ry/rx | 1.000 (−23.9 %) | **1.282 (−2.5 %)** | FAIL | PASS |
| D2d eagle ry/rx | 1.000 (−23.9 %) | **1.394 (+6.1 %)** | FAIL | FAIL |

**Six published FAILs; five of them are PASSes.** The instrument still runs
clean and still prints all six as FAIL, today, at HEAD.

**This is the most important single finding in my area, and it is not the bug —
it is the comment.** `_jb3seal.mjs` believes it is *obeying* §6.1 by copying our
own drawing into a literal. §6.1 says a **locus** — the place a metric is
evaluated — may not be a function of the artefact. It does not say the
artefact's own value may be a constant. The document does not distinguish the
two clearly enough to stop a careful author making this exact mistake, and the
same author made it twice (`_jb14d1`, `_jb3seal`) on the same coin in the same
round. The project has already written the right rule, in a commit message, and
never promoted it into the method:

> *"An assertion about a constant should name the constant, never copy it."*
> — v1.60.0, on `_jq8contain-v2.mjs`'s selftest

### 2c. `_jn5rim.mjs` and `_jd5rim.mjs` — a stale "ours" line drawn into the §4.3 overlay

```js
[41.0, '#ff00d4', 'OURS EDGE.nickel.field.full 41.0']          // _jn5rim.mjs:183
`...OURS EDGE.dime.field.full 41.0`                             // _jd5rim.mjs:194
```

`EDGE[*].field.full` has been **44.07** since v1.57.0. Both instruments draw a
magenta line at 41.0, label it "OURS", and hand the picture to the judge under
§4.3 — the rule the document calls *"the highest-yield rule in this document"*.
`_jn3unwrap.mjs` does the same at 40.5 and 41.0, and `_jp9edge.mjs` computes
D8 containment against `const rField = 41.0`.

Consequence, across four scorecards:

| coin | reference seat | scorecard says "ours" | actual | published | true |
|---|---|---|---|---|---|
| penny | 44.33 | 41.0 (Δ −3.0) | 44.07 | FAIL | **PASS** (Δ −0.26) |
| nickel | 44.33 | 41.0 (Δ −3.33) | 44.07 | FAIL | **PASS** (Δ −0.26) |
| dime | 43.75 | 41.0 (Δ −2.75) | 44.07 | FAIL | **PASS** (Δ +0.32) |
| quarter | 44.20 | 41.0 (Δ −3.2) | 44.07 | FAIL | **PASS** (Δ −0.13) |

Four coins' D5-rim rows are wrong, in the same direction, for the same reason.
The gate is ±1.0 and every one now passes.

---

## 3. RESPONSE-TESTING THE INSTRUMENTS

`_rvinst_hook.mjs` is an ESM `load` hook that rebinds `coinSVG` after the module
evaluates, so the art can be perturbed **without touching a byte of `src/`**.
Two modes: `RVP=none` (identity — a determinism control) and `RVP=scale`
(every drawn coordinate scaled 1.05× about the viewBox origin, path data scaled
command-aware so arc flags and rotations survive).

I ran the 156 `judge/` instruments that (a) ran clean at baseline and (b) can
reach `coins.js`, under both modes, and diffed stdout.

```
ran clean under both hooks                                      147
  MOVED                                                          73  (49.7%)
  never calls coinSVG — measures only the reference              38   [correct: this is §6.1's
                                                                       reference-invariance test passing]
  re-evaluates coins.js from TEXT — probe cannot reach it         15   [not tested]
  CALLS coinSVG AND DID NOT MOVE                                 21
pass rate over the 94 the probe can actually test               77.7%
```

**Determinism control: 156 of 156 identical** across two independent runs, once
three `mkdtemp` paths are normalised (`_jl3probe`, `_jn6attr`, `_jn6icon`, which
each print a random temp directory and are otherwise byte-identical). That is a
genuinely good result and worth saying plainly: **nothing in this library is
non-deterministic.**

I then opened all 21 non-movers rather than reporting them as failures:

| explanation | n | files |
|---|---|---|
| stdout is a filename — the **picture** moved, the text could not | 12 | `_jb15look` `_jd13look` `_jn11look` `_jp12look` `_jq12look` `_jq12look-r2` `_sq3look` `_sqAbig` `_sqCba` `_jt2over` `_sq5over` `_progress` |
| the metric is scale-invariant **by construction** (turn angles, fault counts) | 3 | `_jd7tan` `_jd9d7` `_jq9well` |
| reference-side geometry only | 2 | `_jb2grid` `_sq4grid` |
| reads `coins.js` as text — probe cannot reach it | 1 | `_jn14hair` |
| needs arguments; printed only a header | 2 | `_jyBcover` `_part-cent` |
| **genuinely measuring nothing** | **1** | **`_jq2ext.mjs`** |

So the honest verdict is **not** "half the library is dead". It is: one
instrument in the tested set is measuring nothing, and my perturbation is the
wrong shape for a third of the rest — which is itself the lesson. **A single
global perturbation cannot response-test a library of thirteen different
metrics.** The response test has to be written by the person who wrote the
metric, and §4 already says so; what is missing is that it must be *runnable on
demand* and *asserted*, not recorded as a sentence in a scorecard.

### The response tests are the first thing to rot, and two are rotten now

Both of these throw loudly, which is good design, and both have been left
standing, which is not:

- **`_jq8contain-v2.mjs`, `RESPONSE=1`** →
  `Error: RESPONSE anchor missing — fix the test before trusting D8`.
  Its anchor is a quarter path that commit `5c1aeb1` rewrote — **34 commits
  ago**. D8 is published PASS on the quarter, dime, nickel-reverse and buck. By
  §4's own words those are `UNTRUSTED`, and `quarter-scorecard.json` states
  *"no dimension on the quarter is left UNTRUSTED"*.
- **`_x6sens.mjs`** — the sensitivity control for the **entire D11
  discriminability matrix** →
  `Error: perturbation anchor not found — this control is stale, fix it before
  trusting the matrix`. Its anchor is the dime's icon shaft
  `<rect x="45.6" y="38" width="8.8" height="32"/>`, which v1.59.0 (`52955d4`,
  21 commits ago) removed. D11 is published PASS on all five coins.

Two of the three response-test *controls* in the project are broken, in both
cases because the control hard-codes a fragment of the art. Same root cause as
§2. **The response test is the one part of an instrument that must copy the
art, and therefore the one part that must be re-checked every time the art
moves.**

---

## 4. THE EVIDENCE TRAIL

### 4a. The reproduction rate

Two measurements, deliberately reported together.

**Automated, generous (`_rvinst_repro.mjs`):** 502 distinct numeric figures
appear in the five scorecards. **471 (93.8 %)** still appear verbatim in the
stdout of at least one of the 610 instruments run today. This is an *upper
bound* and a weak one — a substring match across 610 outputs cannot tell you
whether the right tool produced it.

**Hand re-derivation, 20 figures picked across all five coins and eleven
dimensions:**

| # | published | today | reproduces? | why not |
|---|---|---|---|---|
| 1 | buck D1 0.1496 FAIL | 1.0000 PASS | ✗ | instrument is blind |
| 2 | buck D2a 0.3943 | 1.0000 | ✗ | instrument is blind |
| 3 | buck D2b 0.4290 | 1.0000 | ✗ | instrument is blind |
| 4 | buck D2c 40.00 / −25.6 % | 53.75 / 0.0 % | ✗ | instrument is blind |
| 5 | buck D2d −23.9 % | −2.5 % / +6.1 % | ✗ | instrument is blind |
| 6 | penny D5-rim ours 41.0 | 44.07 | ✗ | constant copied, art moved |
| 7 | nickel D5-rim ours 41.0 | 44.07 | ✗ | constant copied, art moved |
| 8 | dime D5-rim ours 41.0 | 44.07 | ✗ | constant copied, art moved |
| 9 | quarter D5-rim ours 41.0 | 44.07 | ✗ | constant copied, art moved |
| 10 | quarter D10 obv **3.44× PASS** | **11.55× FAIL** | ✗ | art moved; known in a comment, not in the scorecard |
| 11 | penny D10 obv 5.44× | 24.64× | ✗ | art moved |
| 12 | nickel D10 obv 24.21× | 9.12× | ✗ | art moved |
| 13 | dime D10 obv 5.56× | 4.26× | ✗ | art moved |
| 14 | nickel D8 obv 0.0809 % | **2.4127 %** | ✗ | art moved — see note |
| 15 | buck D11b set 1.52× | 1.49× | ✗ | art moved |
| 16 | quarter D5-HF rev 44px 0.6403 **PASS** | **0.0000 FAIL** | ✗ | art moved; see below |
| 17 | quarter D11-set 1.487× | 1.49× | ✓ | |
| 18 | D11 minimum 0.0534 | 0.0534 | ✓ | |
| 19 | D9 = 0 | 0, 120 renders clean | ✓ | |
| 20 | quarter D1 0.9653 · dime D1 0.98063 · quarter D5-HF obv 2.0089 · penny D7 HEAD 69.1 · `_jn15agree`'s 62 REF angles | all bit-identical | ✓ (×5 checks) | |

**6 of 20 reproduce. 30 %.**

Row 14 needs its second half stated, because Appendix R2 exists to stop exactly
this: nickel D8 obverse's *fraction* went 0.0809 % → 2.4127 % while its
*deepest breach* went 1.4698 → **0.0039** units and its deep-fraction 0.0280 %
→ **0.0000 %**. The bevel breach the round-0 diagnosis named is fixed; what
remains is 2.4 % of path length sitting a third of a thousandth of a unit
outside a field circle that itself moved 40.5 → 44.07. Reporting only the
fraction would say "30× worse"; reporting only the depth would say "solved".
The scorecard says neither, because it has not been rewritten.

Every other failure is honest — the art moved, the scorecard did not — but §6's
rule is *"the scorecard is rewritten whole each round"* and no scorecard has
been rewritten since:

| scorecard | round | commit | commits behind HEAD | `coins.js` commits since |
|---|---|---|---|---|
| quarter | 4 | `b1b94e9` | 43 | — |
| nickel, penny | 0 | `5c1aeb1` | 34 | — |
| buck, dime | 0 | `c0ff971` | 31 | **15** |

`buck-history.jsonl` records rounds 1, 2 and 3, all `ACCEPTED`.
`buck-scorecard.json` still says `"round": 0`.

Rows 10–13 are the sharpest illustration that this is a *reporting* failure and
not a measuring one. `_rescore.mjs`'s own header comment already records the
D10 movement — *"cent 5.44x -> 24.64x, quarter 6.36 -> 12.43, nickel 24.21 ->
9.12, dime 5.56 -> 4.26"* — and adds *"a dimension that is not in this file is
a dimension nobody is watching."* The knowledge exists, in a code comment, in
the same repository, while four scorecards still publish the superseded values
and one of them publishes a `PASS`.

### 4b. The one that matters most: quarter D5-HF reverse

The scorecard's own gate:

> `"gate": "0.30x .. 1.50x, one-sided at the top (the lower bound was stated in
> the round-1 brief before measuring: 0.00x is not 'safely undershooting', it
> is absent)"`, `"verdict": "PASS"`

`node coloringbook/judge/_jq5letter-v2.mjs`, today:

```
   44px (box  44): legend NONE DRAWN
         HF@38.9: ours 0.0000  ref 0.1368  RATIO 0.0000x
```

Published 0.6403. Today **0.0000** — the exact condition the gate's own words
call *absent*. The obverse row's 44px figure moved 0.8772 → 0.0503 in the same
run. This took one command and no argument. **The single highest-value change
available to this project is to run `_rescore.mjs` and the per-coin instruments
on every release and diff the output against the scorecards.**

### 4c. Fourteen instruments WRITE to the evidence trail when you run them

This is the most consequential thing I found, and I found it by accident:
after the sweep, `git status` showed

```
 M coloringbook/judge/buck-history.jsonl        +7
 M coloringbook/judge/dime-history.jsonl       +11
 M coloringbook/judge/nickel-history.jsonl     +10
 M coloringbook/judge/penny-history.jsonl      +16
 M coloringbook/judge/quarter-history.jsonl    +10
```

**54 duplicate round records appended to the tracked evidence trail — a 49.5 %
inflation of the 109-entry history — purely as a side effect of running the
instruments.** I reverted them with `git checkout --` and the five files are
back at 109; the main checkout was never touched (its `judge/` files are real,
not symlinked). No history entry was lost.

The cause, in full, is `_r10card.mjs` lines 1–8:

```js
// Round 10 (dime obverse: the throat) — verdict, plus a standing lesson ...
import { appendFileSync } from 'node:fs';

appendFileSync(new URL('./dime-history.jsonl', import.meta.url).pathname, JSON.stringify({
  coin: 'dime', round: 5, date: '2026-08-21',
```

A hard-coded round record, appended **at module top level**, with **no guard of
any kind** — no `import.meta.url === process.argv[1]` check, no idempotency
check, no "is this round already recorded" check. Fourteen files do this:
`_r1card` `_r2card` `_r3card` `_r4card` `_r8card` `_r10card` `_r11card`
`_r12card` `_r13card` `_r15card` `_r157card` `_r16card` `_r17card` `_r18card`.

Three separate rules are broken at once:

- **§1.1's retirement rule, exactly.** The document already names this pattern:
  *"`_jq8contain.mjs` runs its report at module top level, so merely importing
  it prints retracted PASS rows that a reader could attribute to the live
  tool."* The `_r*card` family is the same defect one step worse — it does not
  print, it **writes**, and it writes to the file §1.1 relies on for
  *"any number ever published can still be reproduced"*.
- **§1's separation of powers.** These are instruments. They emit verdicts.
  `_rescore.mjs` is careful to say *"it never writes a verdict. Verdicts are
  written into the scorecards by hand, with reasoning, because a verdict that a
  script can emit is a verdict nobody thought about."* Fourteen scripts in the
  same directory emit verdicts, unprompted, on execution.
- **The append is not idempotent.** Running any `_r*card.mjs` twice puts the
  same round in the history twice, with the same `round` number and date. Six
  of the fourteen were also in my response-test set, so they ran three times
  each — which is why 14 files produced 54 rows.

All fourteen are in my ORPHAN bucket: they are never imported and never named
in any tracked file. They are round-verdict scripts that have already done
their one job. **They should be deleted, and the history should be appended to
by hand or by one guarded writer, never by a runnable module's top level.**

Corollary for anyone repeating this review: **`git status` is part of the
method.** An instrument sweep is not read-only, and nothing in `COIN-JUDGE.md`
says an instrument must be.

### 4d. Provenance is named, but never the invocation

```
published rows carrying an id and a value/verdict            310
  mentioning ANY .mjs anywhere in the row                      52  (16.8%)
  with an `instrument` field                                    8  ( 2.6%)
```

83 % of published rows do not say which of 617 tools produced them. The files
themselves are better: **277 of 370 (75 %)** carry a `Run:` line. The gap is
entirely in the scorecard.

Related, and worse:

```
scored rows with a real value and a PASS/FAIL/ESCALATE verdict   113
  carrying a `response_test` field (§4 makes this mandatory)      32  (28.3%)
  carrying a `locus` field (§6.1 makes this mandatory)           101  (89.4%)
```

**81 of 113 scored rows (71.7 %) have no response test recorded.** §4: *"A
number whose tool has not passed its response test is `UNTRUSTED`, and
`UNTRUSTED` blocks like `FAIL`."* Applied literally, the majority of every
scorecard is currently red for a reason nobody has counted. The 12 rows missing
a `locus` are all on the penny.

### 4e. 56 cited instruments live on one disk

`.gitignore` states the intent in full:

> *"Reference photographs and scratch tooling stay out; the JUDGE'S EVIDENCE
> does not. `docs/COIN-JUDGE.md` 1.1 promises any number ever published can be
> reproduced … unkeepable if the scorecards, derivations and eval libraries
> only ever live on one disk."*

The rules that follow un-ignore `coloringbook/judge/*.mjs` and nothing else.
**56 of the 270 instruments named in the tracked evidence (20.7 %) sit one
directory up and are not in any commit.** They are not scratch — they are the
eval libraries the scorecards are built on:

- `_x6mat.mjs` — the §17 pairwise matrix. **D11 on all five coins.** Cited in
  17 places, including nine specialist briefs. `_rescore.mjs` invokes it.
- `_x6lib.mjs`, `_x6dark.mjs` (cited in **24** places including `coins.js` and
  `COIN-JUDGE.md`), `_x6sens.mjs`, `_x6check.mjs`, `_x6sweep.mjs`, `_x6grid.mjs`
- `_rvnorm.mjs`, `_rvlib2.mjs`, `_rvscore.mjs`, `_rvcontain.mjs`, `_rvicon.mjs`
- `_pylib.mjs`, `_pyeval.mjs`, `_pybuild.mjs`, `_pytone.mjs` (the cent)
- `_qtlib.mjs`, `_qteval.mjs`, `_qtevalV1/V2.mjs`, `_qttone.mjs` (the quarter)
- `_nkeval.mjs`, `_nkbuild.mjs`, `_nkparts.mjs`, `_nktrace.mjs` (the nickel)
- `_blnorm.mjs`, `_blellipse.mjs`, `_blindep.mjs`, `_blseal.mjs` (the note)
- `_p2lib.mjs`, `_p2iou.mjs`, `_p2build.mjs`, `_p2score.mjs` (the dime)

Four more are cited and **absent from the tree entirely**: `_jqhl6tier.mjs`
(quarter history), `server.mjs`, `sync-server.mjs`, `export-live.mjs`.

Several of these are hashed as frozen artefacts in `_jb0hashes.json` /
`_jd0hashes.json` / `_jp0hashes.json`. The judge is recording the SHA-256 of
files that no clone of this repository will ever contain.

### 4f. The frozen-hash discipline, which mostly works

`_rvinst_hash.mjs` re-checks all 92 hashed entries: **87 unchanged**. Exactly
two files moved — `src/art/coins.js` (kind `subject`; it is *supposed* to move)
and `coloringbook/judge/_jq8contain-v2.mjs`, kind **`eval`**, edited in v1.60.0
after the dime and penny rounds froze it. That edit was justified and
documented at length in the commit message, and it is exactly the right kind of
fix. But the hash files were never re-frozen and no note sits beside them, so
`_rescore.mjs`'s §1 check now reports *"ROUND IS VOID — a hashed target or
instrument was edited"* for two coins, permanently, on clean art. A check that
cries wolf gets ignored — which is the argument that commit itself made about
the selftest.

### 4g. A live worktree hazard, which my own run demonstrated

`_jx0link.mjs` symlinks `coloringbook/*` from the main checkout into a
worktree. Those symlinks are followed **on write**. Running the library from
this worktree rewrote **92 files in the shared checkout**, including the hashed
frozen target `coloringbook/_pyreg.json`.

Content was unaffected — every regeneration was deterministic and `_pyreg.json`
still matches its recorded SHA-256, which I verified. But that is luck, not
design: had the art moved, a specialist running any generator in a worktree
would have silently re-frozen the judge's target in the shared tree, and §1's
enforcement would have compared it against itself. This is the same class as
the `_rescore.mjs` fault the dispatch brief already names, and it is still open
one level up.

Additionally, `_edgespill.mjs` shells out to write **`src/art/_arcctl.js`** — a
judge instrument that creates a file inside the art directory. It failed here
only because of cwd.

---

## 5. STALE LOCI AND §6.1

`_rvinst_locus.mjs` sweeps every path-prefix literal used as a selector: **6 in
live code, 0 stale.** The two named in my dispatch are fine —
`'M 13.5 -27.05'` and `'M 15.15 12.77'` both still resolve. So path selectors
are *not* the problem. **Frozen coordinates are.**

### `_jc5corner.mjs` — the locus drifted, the coordinate did not vanish

Its two queries are literals: `HAIR knot 16 (-19.03, 11.99)` and
`BEARD knot 7 (-17.28, 8.63)`. Re-derived from the art (`_rvinst_beard.mjs`):

| query | claims | actually |
|---|---|---|
| HAIR knot 16 | (−19.03, 11.99) | (−19.03, 11.99) turning 144.5° ✓ |
| BEARD knot 7 | (−17.28, 8.63) | **(−18.85, 4.00)** turning 85.0° — **4.89 units away** |
| — | not queried | **BEARD knot 10 (−7.60, −1.00) turning 108.3°**, the coin's worst beard corner |

The instrument's own output gives it away: `QUERY BEARD knot 7 (-17.28, 8.63)
-> v1618 d1.86` — the nearest mask vertex is 1.86 units from the query, against
a mean vertex spacing of 0.225. It is interrogating bare field, and the corner
it exists to adjudicate is not in its query list at all.

### `_jn15agree.mjs` — 4 clean samples omitted from a 62-entry frozen table

`_rvinst_n15.mjs` runs the generator `_jn15strand.mjs` and diffs its clean
output against `_jn15agree.mjs`'s `REF`:

```
generator returns 66 CLEAN samples; the frozen REF has 62
in the generator but MISSING from REF (4):
    -24,10   angle  42.6   coherence 0.183
    -28,10   angle  74.2   coherence 0.361
    -32,-2   angle -59.3   coherence 0.673
     -32,2   angle -76.1   coherence 0.48
in REF but not clean in the generator today: 0
values that disagree:                       0 of 62
```

All 62 values reproduce **bit-exactly** — this is one of the best-behaved
targets in the project. But four samples the generator returns clean were
dropped when the table was typed, and all four are in the BACK region, so
`_jn15agree`'s "covered n/25" denominator is understated by 4. A frozen table
that is *transcribed* rather than *generated* drifts silently.

### How widespread

The genuinely widespread stale-locus class is the copied art constant, not the
path selector: `EDGE.field = 41.0` still appears as "ours" in **five** live
instruments (`_jn5rim`, `_jd5rim`, `_jn3unwrap`, `_jp9edge`, and the D5-rim rows
of four scorecards), the note's vignette in `_jb14d1`, the note's roundels in
`_jb3seal`, the quarter's device fill in `_jq2ext`, and the response-test
anchors in `_jq8contain-v2` and `_x6sens`. **Ten instruments, one bug.**

---

## 6. THE CULL

`_rvinst_cull.mjs` buckets all 370 `judge/` instruments by the strongest reason
each could be retired. Buckets are disjoint; the full name lists are in the
probe's output.

| bucket | n | what it is |
|---|---|---|
| **WORKTREE** | **11** | hard-codes a path inside another agent's worktree (`_look-buck` → `agent-a1a1ebe49a797b145`). Unreproducible the moment that worktree is cleaned; **0 of 11 cited anywhere**. `_look-*` ×6, `_part-*` ×5. |
| **SCRATCH** | **15** | needs a `_XX-before-coins.js` / `_XXfitcheck.json` that was never kept. Permanently unrunnable; 2 of 15 cited. |
| **DRIFT** | **73** | throws for a reason other than a missing argument. |
| **SILENT** | **1** | no output and cited nowhere (`_sq2bound.mjs`). |
| **ORPHAN** | **91** | runs, but never imported and never named in any tracked prose or evidence file. |
| **KEEP** | **179** | imported by another instrument, or named in the evidence trail. |

**191 of 370 (51.6 %) are proposed for retirement; the kept set is 179 files
and 57 % of the lines.** Add the 247 untracked top-level files and the library
is **617 files of which roughly 380 are doing nothing**.

Two important refinements before anyone deletes anything:

1. **40 of the DRIFT/SCRATCH set are cited in the evidence trail** — including
   **18 cited inside `src/art/coins.js`** as the provenance of a drawn feature:
   `_edgespill` `_jb6crop` `_jc5d13sweep` `_jc5tip` `_je14seg` `_jh8ladder`
   `_jh8over` `_jl3fit` `_jl3ink` `_jn14ear` `_jn14gen` `_jn14zoom`
   `_jn6freezetone` `_sb7tan` `_sd7edge` `_sd7fan` `_sw5seg` `_swAsweep`.
   §1.1 forbids deleting or editing these. They must be **moved to
   `judge/retired/`** — moved, not edited, so the content hash survives — with
   a one-line note. That directory already works: 3 instruments live there and
   **nothing outside it imports from it**, which I verified.
2. The 91 ORPHANs are the real deletion candidates. They are the `-ident`,
   `-look`, `-zoom`, `-over`, `-grid`, `-cand`, `-probe`, `-patch` family: one
   throwaway viewer per specialist round, kept forever. Family sizes tell the
   story: the `_jn1*` round files are 28, `_jw4*` 17, `_jn6*` 15, `_jq7*` 13 —
   and of `_jq7*`'s 13, **eleven** are orphaned or permanently unrunnable.
3. **Delete the fourteen `_r*card.mjs` files first, before anything else.**
   They are orphans by every measure *and* they write to the evidence trail on
   execution (§4c). Until they are gone, nobody can sweep this library — the
   act of auditing it corrupts the thing being audited. This is a five-minute
   change and it is the single highest-priority item in this review.

### 6.1 Proposed convention — five rules that would have caught all of this

**R1. An instrument may not contain a copy of our own art.**
Every "ours" value is imported from `src/art/coins.js` or derived from
`coinSVG()` output, never typed. Where a constant genuinely must be pinned
(a response-test anchor, a target), the instrument **asserts** it and throws
with the live value in the message:

```js
const OURS = vignetteFromArt(mod);              // never a literal
assertPinned('EDGE.penny.field.full', mod.EDGE.penny.field.full, 44.07);
```

This one rule kills `_jb14d1`, `_jb3seal`, `_jn5rim`, `_jd5rim`, `_jn3unwrap`,
`_jp9edge`, `_jq2ext`, `_jq8contain-v2`'s response mode and `_x6sens` — nine of
the ten faults above, plus the four D5-rim scorecard rows and the six buck
D2 rows. The project has already written this rule once, in a commit message.
Promote it into `COIN-JUDGE.md` §4 and give §6.1 an explicit second paragraph
saying that *freezing the locus is not licence to freeze the value*.

**R2. Naming carries lifetime.** Three prefixes, enforced by the reviewer:
- `_j*` — **evidence**. Tracked, hashed, cited on the scorecard by name **and
  invocation**, never deleted, retired by moving.
- `_w*` — **working**. Untracked, deleted at the end of the round that made it.
  All 91 ORPHANs and 15 SCRATCH files are this and were misfiled as evidence.
- `_x*` — **library**. Imported by others, tracked, hashed, response-tested.

Today the split is by directory (`judge/` vs `coloringbook/`) and it is exactly
backwards: 91 throwaway viewers are tracked forever inside `judge/`, while
`_x6mat.mjs` — the source of D11 on all five coins — is not in git at all.

**R3. A scorecard row names its instrument AND its invocation, or the row is
`UNMEASURED`.** `"instrument": "_jq5letter-v2.mjs"` is not enough;
`"run": "node coloringbook/judge/_jq5letter-v2.mjs"` is. Then `_rescore.mjs`
can be generated from the scorecards instead of hand-maintained, and the
"a dimension nobody is watching" failure its own comments describe becomes
impossible. It currently covers **4 of 13 dimensions**, via **4 distinct
instruments (7 invocations) out of 617**.

Two smaller ones, both cheap:

- **R4.** Un-ignore the eval libraries. One line in `.gitignore`
  (`!coloringbook/_{x6,rv,py,qt,nk,bl,p2}*.mjs`) tracks the 56 cited files —
  about **0.2 MB** — and closes the §1.1 hole completely.
- **R5.** Make `_jx0link.mjs` link **read-only** (`ln -s` into a
  `coloringbook/ref-ro/` and refuse writes), or copy rather than symlink. A
  worktree must not be able to write through to the shared tree.

---

## 7. What is genuinely excellent — the template for the fix

These are not consolation prizes. Every one of them does something the rest of
the library should copy.

**`_jq5letter-v2.mjs` — the best instrument in the project.** Frozen literal
locus stated in the header (`sector 250..290 deg, r = 38.9`), a
reference-invariance test (*"8 of 8 reference-side values bit-identical to 6 dp
across the round-1 and round-2 revisions of the art"*), a synthetic response
test (`1.9407 vs flat 0.0000`), and a `retraction` field that keeps the wrong
1.51× beside the right 2.0089× with the reason. It is also the instrument that
caught **its own predecessor** deriving the evaluation radius from our glyph
geometry. It reproduced bit-exactly today, and it is the tool that surfaced the
D5-HF reverse regression the moment I ran it.

**`_jc5corner.mjs` — the best control design.** Four controls, all run every
time: a synthetic right angle (must read 90), a synthetic straight run (must
read 0), three smooth stretches of the real mask, and — the good one —
**the whole-mask distribution of the same estimator at each span**, so "this is
a corner" means "this stands clear of the mask's own p99 trace noise". It
prints a ladder of chord spans rather than one number, precisely because *"a
single L is a locus chosen at measuring time (§6.1)"*. Its query coordinates
have drifted; its method has not.

**`_jn15strand.mjs` — the best §4 discipline.** It reasons about why the null
test does not apply (*"the angle is an eigenvector — there is no bound to
return"*) and then supplies the right substitute: both eigenvalues printed, a
coherence floor, `NO-ORIENTATION (degenerate)` instead of a value, an explicit
`CONTAMINATED by the hairline` screen it derived by finding the wrong feature
first, a `ROTATE=` response test, and a tick overlay. It is also the *reason*
`_jn15agree`'s 62 values reproduce to the last digit.

**`_jb3seal.mjs`'s target half.** Ignore its `OURS` and it is exemplary: search
bounds printed with `on-bound: none`, the whole candidate set printed with the
runner-up's margin (`SELECT top5 … best-different candidate … margin 0.67`), a
PY5 degenerate-pass check (*"selected ellipse is 39.9 % of the largest ellipse
the sweep could return"*), and a PY6 equivalence run against an independent
implementation at its published hash. Every §4 rule, honoured — on the half of
the comparison that was not a literal.

**`_jq43ccby.mjs`'s refusal.** After a first pass rides the registration bound
it widens the search, prints the new bounds, and says: *"'the instrument cannot
look here' is not 'the answer is no'. Do NOT add it on my say-so."* That is the
right instinct and the document should quote it.

**`_rescore.mjs`.** A reporter, not a gate, and it says so. It prints the
absolute `d(ink)` beside every D10 ratio because *"a ratio improves if the
denominator worsens"* (Appendix R2). Its §1 check is wrapped in a try/catch
after a bug where a broken check silently deleted four measurements. Its
comments record the D10 omission as a process failure. It is under-scoped, not
badly built.

**`_jp5band-v2.mjs`.** Explains, in the header, why v1 is **not** retired — v1's
null test fired correctly and its rim half still stands, so only its legend half
is superseded. Precise retirement, not blanket retirement.

**`judge/retired/`.** Three instruments, moved and not edited, and **nothing
outside the directory imports from them.** `COIN-JUDGE.md` Appendix R4 works,
and it is the mechanism the 40 broken-but-cited instruments should now use.

**`_jb9well.mjs` / `_jq9well.mjs` (D9).** 120–180 renders swept per run, an
equivalence check against `_x6sweep.mjs` at its published hash, and a response
test that injects `undefined` and confirms it goes red. D9 is the one dimension
I could reproduce with no caveats at all.

---

## 8. The honest question

> *Is this apparatus producing better art for a seven-year-old, or paperwork?*

**Both, and the split is visible in the data.**

It is producing better art. Every one of the four "wrong in kind" defects — the
quarter's profile standing in for a frontal Washington, the pointed pyramid, the
circular roundels, the nickel's phantom columns — was found by an instrument or
by an overlay an instrument drew, and none of them would have survived a child's
eye for a second once fixed. The note's D2 went from IoU 0.39 to **1.0000**.
`EDGE.field` went from a shared literal nobody measured to 44.07, corroborated
independently on four coins. `_jq5letter-v2` caught a published number that was
wrong because the instrument measured our own drawing at a radius our own
drawing chose. That is not paperwork; that is the process working exactly as
designed, twice in one session.

It is also producing paperwork, and I can put a number on it. **91 of 370
tracked instruments have never been named in a single tracked file** — one
`-ident`, one `-look`, one `-zoom` per round, kept forever. Another **99** are
unrunnable. Against that, **65 instruments are cited in `coins.js` itself**, and
those 65 are the ones that changed the drawing. The ratio of tools-that-moved-
the-art to tools-that-exist is about **1 in 9**.

The waste is not in the measuring. It is in three specific places:

1. **The scorecards have stopped tracking the art.** Five scorecards, 31–43
   commits stale, three accepted rounds unrecorded, a published PASS
   (`quarter D5-HF reverse`) that is now `0.0000` against its own stated floor.
   The measuring is fine; the *reporting* has fallen a release behind and
   nobody diffs it. One command would close this.
2. **Instruments copy the art instead of importing it.** Ten instruments, four
   wrong scorecard rows on four coins, six wrong rows on the note, and two dead
   response-test controls — all one bug, and the project has already written
   the sentence that fixes it and left it in a commit message.
3. **The library has no lifetime convention**, so a throwaway viewer and an eval
   library are stored the same way — except backwards, with the viewer tracked
   and the eval library gitignored. At the extreme, fourteen throwaway
   round-verdict scripts *write to the evidence file* the moment they are run.

Fix those three and the apparatus gets *smaller*, *faster* and *more
trustworthy* at the same time. Nothing here argues for measuring less. It
argues for measuring the same things from one source of truth, re-running them
on every release, and throwing away the viewers.

---

## Reproducing this review

All my probes are read-only and take no arguments unless stated. From the repo
root, after `node coloringbook/judge/_jx0link.mjs`.

⚠️ **`_rvinst_run.mjs` is NOT read-only, through no fault of its own** — it
executes the library, and fourteen members of the library append to
`judge/*-history.jsonl` on execution (§4c). Check `git status` afterwards and
`git checkout --` the five history files, or delete the `_r*card.mjs` files
first.

| probe | answers |
|---|---|
| `_rvinst_scan.mjs` | static inventory (writes, imports, dead worktree refs) |
| `_rvinst_run.mjs <out> 3 <scan>` | executes all 610 safe instruments |
| `_rvinst_class.mjs <run> <scan>` | §1 — clean / throws / non-answers |
| `_rvinst_blind.mjs` | §2 — who can see `coins.js` |
| `_rvinst_seal.mjs` | §2b — buck D2 re-derived from the art |
| `_rvinst_hook.mjs` + `_rvinst_boot.mjs` | the perturbation hook (`RVP=none\|shift\|scale`) |
| `_rvinst_run2.mjs <list> <out> 3` | §3 — re-run under the hook |
| `_rvinst_resp.mjs` / `_rvinst_resp2.mjs` | §3 — the response-test tables |
| `_rvinst_repro.mjs <run>` | §4a — the automated reproduction bound |
| `_rvinst_hist.mjs`, `_rvinst_track.mjs` | §4d, §4e — the evidence trail |
| `_rvinst_hash.mjs` | §4f — 92 frozen hashes re-checked |
| `_rvinst_locus.mjs`, `_rvinst_beard.mjs`, `_rvinst_n15.mjs` | §5 — stale loci |
| `_rvinst_cite.mjs`, `_rvinst_cull.mjs`, `_rvinst_hygiene.mjs` | §6 — the cull |

**Caveats on my own numbers, stated so they can be checked.**
The 1.05× perturbation is scale-invariant for angle and count metrics and
cannot reach the 15 instruments that re-evaluate `coins.js` from text — I
excluded both classes rather than count them as failures. The 93.8 % automated
reproduction figure is a substring match and is an upper bound; the 30 % is the
hand-checked number and is the one I stand behind. Running the library from
this worktree rewrote 92 gitignored artefacts in the shared checkout through
`_jx0link.mjs`'s symlinks — content-identical, hashes re-verified (§4g), but I
caused it and it is reported rather than hidden.

---

# EXECUTED — 2026-08-22

*Written by the agent that carried out the cull, not by the reviewer.
Dispatch commit `7f6d727` (`docs: section 0 — rebuild the gates around the
owner's actual objective`). Everything above this line is reviewer 2's text,
unedited and byte-identical to the file it was written in
(sha256 `304c4256d20b57e4…`).*

**Provenance note, stated first because it changes how §6 should be read.**
This review was never committed. It existed only in reviewer 2's own worktree
(`.claude/worktrees/agent-a828eb63745810ecd/`), untracked, and was copied into
the tree verbatim as part of this cull so that the proposal and its execution
live in the same commit. The cull buckets were **regenerated**, not trusted:
`_rvinst_cull.mjs` was re-run against reviewer 2's `class.json`, `cite.json`
and `scan.json` and reproduced §6's table exactly — 11 / 15 / 73 / 1 / 91 /
179, 191 proposed. The probe files themselves (`_rvinst_*.mjs`) remain
uncommitted in reviewer 2's worktree and are **not** brought in here; that is
§4e's finding turned on the review itself, and it is left for the reviewer to
land or discard.

## The one-line result

**174 of the 191 proposed files were moved to `judge/retired/`. 14 could not be
moved because they no longer exist, and 3 were declined.** The judge library
goes from 358 top-level instruments to **184**; `retired/` goes from 3 to 177.

## What moved, by bucket

| bucket | proposed | moved | not moved | why |
|---|---|---|---|---|
| WORKTREE | 11 | **11** | 0 | |
| SCRATCH | 15 | **15** | 0 | |
| DRIFT | 73 | **70** | 3 | 2 declined (below), 1 (`_je14seg`) declined |
| SILENT | 1 | **1** | 0 | |
| ORPHAN | 91 | **77** | 14 | the `_r*card.mjs` family was already deleted |
| **total** | **191** | **174** | **17** | |

**WORKTREE (11)**

```
_look-buck _look-cent-jaw _look-dime-d7 _look-eagle _look-nback _look-nickel
_part-buck _part-cent _part-eagle _part-nback _part-nickel
```

**SCRATCH (15)**

```
_jc5cand _jc5d13sweep _jc5ident _jc5look _jh8ident _jh8tier _jq7d13
_jq7ident _jq7look _jw14cross _jw14ident _jw14look _jw14see _jw14tone
_wr7ident
```

**DRIFT (70)**

```
_edgesheet _edgespill _jb6crop _jc5tip _jc5zoom _je14ident _je14look
_je14peek _je14zoom _jh8crop _jh8fan _jh8ladder _jh8over _jh8side _jk9ident
_jk9look _jk9over _jk9variants _jl1grid _jl1look _jl3fit _jl3flat _jl3ink
_jl3over _jl3unwrap _jn14ear _jn14gen _jn14ident _jn14look _jn14zoom
_jn15part _jn15size _jn6freezetone _jn6ident _jn6look2 _jq12look-r1
_jq12ring _jt2diff _jt2hash _jt9ident _jt9look _jw4chin _jw4cmp _jw4ident
_jw4look _jw4prof _jw4ridge _jw4taper _jx1hash _jy0freeze-midjaw _jy1lad
_jy5side _jy8sweep _jyCident _r3d13 _r3diff _r3floor _r3p90 _r3sheet _sb7tan
_sd7edge _sd7fan _sw1look _sw3ref _sw4ladder _sw5seg _sw9ident _swAsweep
_swCd12 _swDcmp
```

**SILENT (1)**

```
_sq2bound
```

**ORPHAN (77)**

```
_jc5base _jc5patch _jd2freeze _jd2sep _je14bevel _je14d11 _je14ours _jh8tex
_jk9bbox _jk9prof _jl1derive _jl1ours _jl1spec _jl3attr _jl3glyph _jn15d6
_jn15inhair _jn15ours _jn15over _jn15wig _jn16over _jn6attr _jn6cand _jn6d6
_jn6disc _jn6grid _jn6icon _jn6look _jn6probe _jn6tone _jp4wear _jq12look-r2
_jq21grid _jq21look _jq7bow _jq7fit _jq7over _jq7prof _jq7rank _jq7tan
_jq7trans _jq7w _jt2over _jt2run _jt9dump _jt9over _jw14budget _jw14fit
_jw4build _jw4corner _jw4d7 _jw4gen _jw4hash _jw4patch _jw4zoom _jyAlook
_progress _sb7over _sd7d1 _sd7ident _sd7over _sd7reject _sd7resp _sq1sheet
_sq3look _sq4grid _sq5over _sq6width _sq7width2 _sq9ray _sqAbig _sqBident
_sqCba _sqDsymlink _sw2dump _wr1duty _wr2where
```

## What was declined, and why

### The 14 `_r*card.mjs` files — already gone, so nothing to move

`_r1card _r2card _r3card _r4card _r8card _r10card _r11card _r12card _r13card
_r15card _r157card _r16card _r17card _r18card`.

§6's recommendation 3 — *"delete the fourteen `_r*card.mjs` files first, before
anything else"* — **was already carried out** between this review and the
dispatch commit, and is documented in `judge/WRITERS.md`. Each card's payload
was verified present in the committed `*-history.jsonl` first, 14 of 14. The
`git mv` therefore had nothing to move. This is the one place where §6's
proposal was executed by *deletion* rather than by moving, and the reviewer's
own reasoning stands: a hard-coded round record appended at module top level is
not evidence, it is a duplicate of evidence, and it can only corrupt the trail.

Confirmed clean at HEAD: the five `*-history.jsonl` files are untouched by this
cull, and no file remaining in `judge/` — retired or live — appends to any of
them.

### `_je14seg.mjs` (DRIFT) — DECLINED, load-bearing

Imported by `_je14bird.mjs`, which is in the KEEP set and **exits 0 today**.
The DRIFT classification is correct about its behaviour standalone (it throws
without an argument) and wrong about its role: it is a module, and moving it
breaks a working instrument. §6's own framing — *"a cull that breaks a live
scorer is worse than no cull"* — decides this.

### `_jw4width.mjs` (DRIFT) — DECLINED, load-bearing, three importers

Imported by `_jt9as.mjs`, `_jt9prof.mjs` and `_jw4check.mjs`, all in the KEEP
set, **all three exit 0 today** (`_jt9prof` prints its three dime-obverse
profiles; `_jw4check` its full check). Same reasoning.

*How these two were found, and why the bucketing missed them:* the cull probe's
ORPHAN/KEEP split uses `importedBy` from `_rvinst_cite.mjs`, but DRIFT is tested
**before** import status — a file that throws standalone falls into DRIFT
whether or not the live library depends on it. Re-deriving the import graph
directly from the `from`/`import(`/`require(` specifiers found **6** genuine
import edges into the proposed set, of which **2** originate in files that stay.
Those 2 are the declines. The other 4 (`_jl1grid`←`_jt2over`,
`_jl3ink`←`_jl3fit`/`_jl3flat`/`_jl3over`, `_jl3unwrap`←`_jl3ink`,
`_r3d13`←`_jq7d13`/`_r3floor`/`_r3p90`/`_r3sheet`) move as intact families, so
their relative imports still resolve inside `retired/`.

**Recommendation for whoever writes R2 (naming carries lifetime): a bucket
computed from "does it run" must be intersected with the import graph before it
becomes a delete list.** DRIFT and ORPHAN are not disjoint from *load-bearing*.

### `_jq11disc.mjs` (SCRATCH→ per §6, DRIFT bucket) — DECLINED, it is a frozen artefact

`_jq11disc.mjs` is listed by name in **`_jp0hashes.json`** and re-hashed on every
run of **`_jp0hash.mjs`**, the penny round's frozen-artefact manifest checker:

```
coloringbook/judge/_jp0hash.mjs:38:    'coloringbook/judge/_jq11disc.mjs',
```

Moving it makes `_jp0hash.mjs` fail to open a target it is required to hash, and
§0.2 names *"§1 separation of powers and the frozen-artefact hashing"* as one of
the things that survives the rebuild unchanged. A cull may not break the check
that makes the cull auditable. `_jp0hash.mjs` runs clean after the move and
still reports `5cd4dcf745cb1eae eval coloringbook/judge/_jq11disc.mjs`.

This was the only such case: a sweep of every `*hash*` / `*freeze*` manifest in
`judge/` against the move list found `_jq11disc.mjs` and nothing else.

## What was NOT expanded, and why — the §0 question

The dispatch invited a larger cull under §0's test: *does this file serve T1
transfer, one of the five remaining gates (D9, D8, D4, D5-presence, D12), or
the surviving process rules?* Applied literally, that would also retire the
instruments for **D11**, which §0 retires outright, and for **D5-rim**, which
§0 retires as a gate.

**It was not expanded, deliberately.** §1.1 promises that *"any number ever
published can still be reproduced"*, and five scorecards currently publish D11
verdicts on all five coins. Retiring the tool that produced a number the
scorecard still asserts does not reduce paperwork; it converts a stale number
into an unreproducible one. The right order is the reviewer's own §8.1 — rewrite
the scorecards against the live art first, *then* retire what nothing cites.
Until that happens the D11 instruments stay, correctly labelled:

- **`_jb11d11.mjs`** and **`_jq11disc.mjs`** measure a **RETIRED** dimension.
  They gate nothing. `_jb11d11.mjs json` also overwrites the frozen
  `_jb11d11.json` from a documented CLI flag with no guard (`WRITERS.md`, open
  violation 2) — that is unchanged by this cull.
- **61 of the 184 remaining instruments are ADVISORY-ONLY** under §0: their
  headers name only D1, D2, D3, D6, D7, D10 or D13. They may inform a round;
  they may not fail one. The list is reproducible with a header scan and
  includes `_jb3seal`, `_jb14d1`, `_jq2ext`, `_jd7tan`, `_jd9d7`, `_jc5corner`,
  `_jd1disc`, the whole `_jq21*` and `_jq2*` families, and every `*tier*` /
  `*d13*` / `*tone*` file.
- **41 instruments touch a surviving gate**; 78 carry no dimension tag in their
  header at all, which is its own finding and is not one this cull can fix.

Nothing was retired for measuring a retired or advisory dimension. **Retiring
by dimension is a second, separate cull, and it is blocked on the scorecards
being rewritten.**

## Citations: checked before and after

- **60** of the 174 moved files are named in a tracked file that stays.
- **25** are named in `src/art/coins.js`; **17** of those are cited as a `.mjs`
  and the other 8 as the `.png` the instrument generates (§4.3: *"an image's
  reproducible artefact is its GENERATOR"* — the generator must stay findable,
  and it does). The review's count of 18-in-`coins.js` becomes 17 here for one
  reason: `_je14seg` was declined.
- **Every citation still resolves by name.** `git ls-files | grep _name` finds
  all 174.
- **19 citations name an explicit path** and now point one directory shallower
  than the file. They are listed below rather than fixed, because
  `src/art/coins.js`, `BACKLOG.md`, `CHANGELOG.md` and the frozen scorecards
  were all out of scope for this cull. `judge/retired/README.md` tells a reader
  to insert `retired/`.

| moved file | explicit-path citation lives in |
|---|---|
| `_edgesheet` | `BACKLOG.md`, `CHANGELOG.md` |
| `_edgespill` | `CHANGELOG.md`, `src/art/coins.js` |
| `_jl3fit` `_jl3ink` `_jn14ear` `_jn14gen` `_jn6freezetone` `_sb7tan` `_sd7edge` `_sd7fan` | `src/art/coins.js` |
| `_jn14zoom` | `src/art/coins.js`, `judge/_jn14hair.mjs` (a prose comment, not a path read) |
| `_jq12look-r1` `_jq12ring` | `judge/quarter-scorecard.json` |
| `_jx1hash` `_jy0freeze-midjaw` | `judge/_jy9budget.md` |
| `_sw4ladder` | `judge/_sw6tone.mjs` (comment) |
| `_wr1duty` `_wr2where` | `judge/_wr4censor.mjs` (a `Run:` line) |

The only one of these that is a **live functional** reference was
`_jq11disc` ← `_jp0hash.mjs`, and that file was declined for exactly that
reason. **Nothing that stayed reads a moved file at runtime**: a static sweep of
all 184 remaining instruments for `import`/`require` specifiers and for
`judge/*.mjs` string literals found **zero** live references to a moved file.

## Verification

**Frozen set.** `sha256sum -c hashes-v173.txt` (781 entries) before the cull:
**781 OK, 0 failures.** After the cull: **607 OK, 174 "No such file", 0 content
mismatches.** The 174 missing are exactly the 174 moved — the same list, checked
by name. Re-running the same 174 hashes against `judge/retired/` gives **174 OK,
0 failures**: every moved file is byte-identical at its new path, which is the
whole point of moving rather than editing.

**Nothing that stayed changed content.** 607 of 607 verify.

**Sample runs.** 20 kept instruments were run to completion before the move and
again after, and their combined stdout is **byte-identical** — `diff` is empty:

```
_jt1transfer  _jq5letter-v2  _jb9well  _jq9well  _jc5corner  _jn15strand
_jq8contain-v2  _jn15agree  _jd1disc  _jb1fit  _jp5band-v2  _jd7tan
_jb2grid  _je14bird  _jt9as  _jt9prof  _jw4check  _jd13v2  _jl3derive
_jn14hair
```

All 20 exit 0. `_je14bird`, `_jt9as`, `_jt9prof` and `_jw4check` are in that
list on purpose: they are the four importers of the two declined files, and
they are the evidence the declines were right.

A second sample of 25 more — every frozen-hash manifest checker and every §0
gate instrument — was run after the move: `_jb0hash _jd0hash _jp0hash _rescore
_jb9well _jd9d7 _jq9well _jb8geom _jp9edge _jd5rim _jn5rim _jn3unwrap _jb10d13
_jb11d11 _jb12tier _jb13margin _jb1over _jb2grid _jb3seal _jb4read _jb5text
_jl1font _jn15agree _jd3unwrap _jq5letter-v2`. **25 of 25 exit 0**, no
`ENOENT`, no missing-target report. (Their *verdicts* are unchanged by this
cull and remain what §2 and §4 say they are — `_jb3seal` still prints six FAILs
that are five PASSes, `_jn5rim`/`_jd5rim` still draw "OURS" at 41.0. A cull does
not fix a wrong instrument, and this one did not try to.)

**The trail is intact.** `git status` shows 174 renames, 2 new files
(`retired/README.md`, this file) and nothing else — no modified
`*-history.jsonl`, no modified scorecard, no modified frozen `.json`. §4c's
corollary — *"`git status` is part of the method"* — was applied at every step,
including after the sample runs, which is when it would have caught a
write-through.

**`npm test`** was run with `TEST_PORT=4205 PORT=8115` and is green.

## Hazards moved, and flagged

§0.3: *"An instrument reports; it does not write."* **13 of the 174 moved files
write when executed**, and they were moved rather than deleted because — unlike
the `_r*card.mjs` family — they are cited evidence. They are enumerated with
their exact write targets in `judge/retired/README.md`. In summary:

- **Three are still dangerous after the move**, because their write path is
  anchored at the repo root rather than at the instrument: `_jq7fit.mjs` →
  `judge/_jq7fit.json` (tracked **and frozen**), `_jw14fit.mjs` →
  `judge/_jw14fitcheck.json`, and `_jh8tier.mjs` → **`src/art/_jh8ctl.js`**, a
  judge instrument writing into the art directory.
- **Seven were defused by the move itself**, because they wrote to a path
  relative to their own location, which is now inside `retired/`:
  `_je14d11` (was the frozen `_jb11d11.json`), `_jn6disc` (frozen
  `_jn6discs.json`), `_jd2freeze` (frozen `_jd2target-dime-reverse.json`),
  `_jn6freezetone` (`coloringbook/_tonepatches-nickel.json`, a symlink into the
  shared checkout from any worktree), `_jy0freeze-midjaw`, `_jn15ours`, and
  `_edgespill`, which shelled out to write **`src/art/_arcctl.js`** and now
  resolves that path to a directory that does not exist.

That last group is a happy accident, not a design. **`retired/` is not a
sandbox** and should not be treated as one. The three root-anchored writers
above are unchanged and will still overwrite a frozen target if anyone runs
them.

**No moved file appends to a `*-history.jsonl`.** That class was the
`_r*card.mjs` family and it is gone.

## One change outside `judge/`: `.gitignore`

`.gitignore`'s `coloringbook/judge/*` line re-ignores the whole subtree, so its
`!coloringbook/judge/*.md` carve-out does not reach `judge/retired/`. The three
instruments already in `retired/` are tracked only because they were tracked
*before* they were moved, and `git mv` carries that over — a new file in there
would have been silently ignored, including `retired/README.md`.

Five lines were added mirroring the existing `judge/` rules for
`judge/retired/`. This is `.gitignore` honouring its own stated intent —
*"the JUDGE'S EVIDENCE does not [stay out] … a retired instrument kept at its
old hash — unkeepable if [it] only ever lives on one disk"* — and it is the
same class of hole as §4e's 56 untracked eval libraries, one directory further
down. **R4 in §6.1 should be widened to cover it.**

## What this cull did not do

- It did not touch `src/`, `BACKLOG.md`, `CHANGELOG.md` or `package.json`.
- It did not edit a single retired file. Not one byte — verified by hash.
- It did not fix any of §2's blind instruments, §3's two dead response-test
  controls, or §4b's `quarter D5-HF reverse` regression. Those are the
  reviewer's findings and the judge's to rule on; §1.1 forbids the party doing
  the moving from restating the verdicts.
- It did not adopt §6.1's R1–R5 conventions. R1 (*an instrument may not contain
  a copy of our own art*) is the one that would have prevented ten of the
  eleven faults in this review, and it belongs in `COIN-JUDGE.md` §4, not in a
  cull.
- It did not land the `_rvinst_*.mjs` probes. They are still on one disk, which
  is §4e's finding applied to the review that made it.

## The number that matters

The library the next round has to reason about is **184 instruments** instead of
358 — and every one of the 174 that left is one `git mv` from coming back, at
its original bytes, with its reason written down.
