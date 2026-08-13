# Quarter — round 2 (judge)

2026-08-13. Subject `src/art/coins.js` at `d8f57dbb…` (working tree, dirty).
Round-1 baseline recovered from `git show HEAD:src/art/coins.js` = `0b9e5303…`,
which matches the `subject_sha256` round 1 recorded, so the before/after really
is before and after.

Two agents ran in parallel this round: a **D5 lettering specialist** which owned
`src/art/coins.js`, and an **instrument-builder** which owned
`coloringbook/judge/` and committed its work as `2a656a3`. No number either of
them reported is accepted below. Every figure was re-derived.

---

## 0. Hash verification (§1)

**37 of 37 frozen artefacts byte-identical. The round is not void.**

- 9 targets (3 head masks, `_tonepatches-quarter.json`, `_rvtarget.json`,
  `_qtreg.json`, 3 references) — all match the round-1 scorecard.
- 28 eval libraries — all match, including `_jq8contain.mjs` v1, which is
  retired and is retained at its round-0 hash precisely so this check works.
- `quarter-gates.md` — `6949523209c142e5…`, matches. The gates are still the
  ones written before round 0's first value existed.
- The subject changed, which is the point.

`git status --porcelain --untracked-files=all` → `M src/art/coins.js`, and
nothing else. **The specialist edited exactly one file** and created none.

A note on §1.1's promise that any published number can be reproduced: it was
unkeepable until `2a656a3`, because `coloringbook/judge/` was gitignored. It is
now tracked, and `git status coloringbook/` is clean, so the instruments that
produced round 0's and round 1's numbers are recoverable at their published
hashes. That was the single most valuable thing the instrument-builder did.

---

## 1. THE LOCUS WAS COMPUTED FROM THE ARTEFACT UNDER TEST — upheld in full

`_jq5letter.mjs:193`:

```js
const rMid = ob ? (ob.baseMin + ob.baseMax) / 2 + 0.36 * (ob.outer - ob.inner) / 2 : 38.9;
const ho = hf(o.fn, rMid, …), hr = hf(refAtTier, rMid, …);
```

`ob` is our own parsed glyph geometry. Both our art **and the reference
photograph** are sampled at `rMid`. The literal `38.9` is only the fallback that
fires when we draw no glyphs — which is exactly the state round 1 measured on
the reverse, which is why this survived two rounds.

This is worse than §6.1's "a threshold needs a locus". The locus was **believed
frozen** — round 1's §7 brief says *"HF evaluated at r = 38.9 viewBox units …
Do not evaluate anywhere else"* — and the instrument silently overrode it the
moment the specialist made glyphs appear.

### 1.1 The evidence was in the judge's own published scorecard

Round 1's `D5.obverse.locus` field reads, verbatim:

> `"sector 250..290 deg; HF at r 38.9 (icon/mid) and 37.5 (84px), 36.0 (190px)"`

**Three radii in one `locus` field, one per tier of our own drawing.** §6.1 says
a locus is frozen *with the target*. A locus that lists one value per tier of
the artefact under test is not frozen, it is derived — and I wrote that field
myself, in the same document that forbids it. This is the third time the failure
signature was printed in my own output and went unread (§4's bit-identity rule
in round 0; `% outside disc` in round 1; this).

### 1.2 Reproduction, needing no trust in anybody

Reproduced with a faithful re-implementation of `_jq5letter.mjs` lines 154–196
(`_jq5letter.mjs` itself is **not edited** — it is hashed). Three revisions of
the art, the same byte-identical reference file:

| art revision | reverse 84px `rMid` | **reference's own HF** | ratio |
|---|---|---|---|
| round 1 (`git HEAD`) | **38.900** | **0.5135** | 0.0000× |
| round 2 (working tree) | **37.425** | **0.4004** | 0.7447× |
| round 2 + `QUARTER DOLLAR` `bs` 5.3→7.4 | **37.092** | **0.3637** | 0.7881× |

The third row is the demonstration. `QUARTER DOLLAR` is at the **bottom** of the
coin, entirely outside the 250–290° sector the metric samples. Enlarging a word
the instrument never looks at moved the **photograph's** score by **−9.2%**.

Control: the quarter **obverse** is byte-identical across all three revisions
and returns `rMid` 37.543, ref 0.2110, ratio 1.5074× in all three. Only the
changed side moves.

And the sensitivity is not small. The same reference, same tier, evaluated at
the two radii the instrument itself chose on two revisions: **0.5135 vs 0.4004
— 28% apart.**

### 1.3 Ruling

**`_jq5letter.mjs` is UNSOUND and RETIRED at hash `a8eb8643…`.** Not edited, not
deleted — it keeps its hash so round 0's and round 1's D5 numbers remain
reproducible (§1.1, retract beside). `_jq5letter-v2.mjs` supersedes it.

v2's locus is the literal `FROZEN_R = 38.9`, sector 250–290°, every tier, both
sides — inherited verbatim from round 1's §7 brief so the numbers stay
comparable, and art-independent by construction. v2 adds a new test:

> **The reference-invariance test.** Score the same target against two different
> revisions of the art. Every reference-side number must be **bit-identical**.
> If it moves, the locus is a function of the artefact under test and every
> ratio the instrument has ever published is void.

v2 passes it: 8 of 8 reference values bit-identical to six decimal places across
the round-1 and round-2 revisions.

### 1.4 What it does to the published numbers — retract BESIDE

| dimension | published (round 0/1) | locus it was taken at | **corrected (frozen r 38.9)** |
|---|---|---|---|
| D5 obverse 84px | **1.51×** | r 37.5, art-derived | **2.0089×** |
| D5 obverse 190px | 0.75× | r 36.0, art-derived | 1.1935× |
| D5 obverse 26/44px | 0.76× / 0.88× | r 38.9 (fallback) | 0.7638× / 0.8772× — unchanged |
| D5 reverse 84px | 0.00× | r 38.9 (fallback) | 0.6194× *(new art)* |
| D5 reverse 190px | 1.17× | r 37.4, art-derived | 0.9598× |

**The quarter obverse is byte-identical between rounds 0, 1 and 2.** Its D5
value moved from 1.51× to 2.0089× purely because the instrument was fixed. The
old number was a miss by 0.01×; the true number is a miss by **0.51×**, and the
"agonisingly close" reading round 0 and round 1 both recorded was an artefact of
measuring our own drawing at a radius our own drawing chose.

Round 0's and round 1's history entries are **not rewritten**. A correction
entry is appended beside them.

### 1.5 Does the verdict change? Yes — on the side nobody was working on

- **D5 reverse HF: 0.0000× → 0.6194×.** The brief's gate, stated before any
  value existed, is `0.30× .. 1.50×` at r 38.9. **PASS.** The specialist's
  reported 0.62× is confirmed to four decimals — it evaluated at the frozen
  locus by hand, which the instrument did not. It was right and the instrument
  was wrong.
- **D5 obverse HF: FAIL, and by 34× more margin than published.**

### 1.6 Is this in any other instrument? One near-miss, no second instance

Audited every live instrument for a value that both the art and the target are
read at:

- `_jq8contain-v2` — `fieldRadius()` is read from our own SVG, and it is the
  *only* artefact in play; there is no target being co-sampled. Not circular.
- `_jq10tier` — samples only our art. **But its sweep window `26..120` is an
  undeclared locus and it interacts with the drawing.** See §4.
- `_x6dark` (D13) — the reference is reduced to *our* device pixel count. That
  is a co-sampling of art and target, and it is deliberate: §16.1/§22.1 require
  it, the tier IS the pixel count, and it is a property of the tier, not of the
  drawing. The reference-invariance test passes on it by inspection because the
  box width depends only on `size` and `COIN_SCALE`, never on the marks.
- `_jq11disc` — both revisions through the same frozen `_x6lib`. Not circular.
- `_jq5letter`'s **band** finder — reads the reference only. Not circular
  (separately BLOCKED for a different reason).

**Proposed spec rule (Appendix R1):** a locus may not be a function of the
artefact under test. Where a metric compares ours against a target, the locus
comes from the target or from a frozen literal, and the instrument carries a
reference-invariance test that fails loudly.

---

## 2. What the round actually did

**4 of 180 renders changed.** Path data (`d=`) is **byte-identical in all 180**.

```
quarter reverse  84px  value=true    glyphs  1 -> 35   bytes 11465 -> 13938
quarter reverse  84px  value=false   glyphs  0 -> 34   bytes 11129 -> 13602
quarter reverse 120px  value=true    glyphs  1 -> 35   bytes 12045 -> 14518
quarter reverse 120px  value=false   glyphs  0 -> 34   bytes 11709 -> 14182
```

penny, nickel, dime and dollar are byte-identical on every side at every size,
as is the entire quarter obverse and the quarter reverse at every other size.
The specialist's "three other coins byte-identical" is confirmed and is in fact
stronger than claimed: **four** other denominations, and both quarter tiers
below full.

That settles D1, D3, D3-signtest, D4-obverse, D6, D7, D10-obverse, D13-obverse
and D11-icon without measuring anything — an instrument fed a byte-identical
input cannot return a different number — and it makes the whole round
attributable to one flag on one coin on one side.

---

## 3. The honest D10 record — do not let this be a win

The specialist disclaimed its own D10 improvement. **The disclaimer is upheld,
and it understates the problem.**

Re-derived at the frozen D10 locus (`sizes 26..120`, `quarter-gates.md`):

| | round 1 | round 2 |
|---|---|---|
| reverse boundary 42→44 **d(ink) absolute** | **0.0904** | **0.0904** |
| reverse boundary 74→76 **d(ink) absolute** | **0.0922** | **0.0922** |
| within-tier p90 (the denominator) | 0.0156 | **0.0161** |
| published ratio | 5.80× / 5.92× | 5.63× / 5.74× |

**The boundary values are bit-identical. Every bit of the ratio's movement is
the denominator.** The gate is `boundary jump ≤ 4× the within-tier p90` — a
ratio whose denominator is a property of the drawing — so **a change that makes
the drawing more discontinuous makes this gate read better.** That is a gameable
gate, and round 2 is a live instance of it being gamed accidentally.

Recorded as **NO CHANGE**. D10 reverse remains **FAIL**.

### 3.1 The window is an undeclared locus, and the pop moved into it

The specialist's second disclaimer — that the old 135 switch was outside the
26–120 window — is upheld, and I can now put both numbers on it. Extending the
sweep to 26–200 on both revisions:

| | worst WITHIN-tier pop | where | inside the 26–120 window? |
|---|---|---|---|
| round 1 art | d(ink) **0.0611** | 134→136 (legend switches on) | **no** |
| round 2 art | d(ink) **0.0783** | 82→84 (legend switches on) | **yes** |

So the change did not create a pop and did not remove one. **It moved the pop
from 135 down to 84 and made it 28% larger** — expected, since the same 34
glyphs now land in a smaller pixel budget. What is new is that it is now inside
the size range a child actually sees, and I confirmed it by eye (§6).

Two further facts that keep this fair to the specialist:

- The **obverse**, which PASSES D10, already carries two within-tier legend
  switches of exactly this kind — 60→62 (`d(ink)` 0.0146, 6.7× the within-tier
  median) and 108→110 (0.0168, 7.7×). A legend switching on mid-tier is
  established practice in the shipped art, not something this round invented.
- The gate **does not test within-tier pops at all.** It only ever looks at the
  two tier boundaries. Both the old 135 pop and the new 84 pop are invisible to
  it, in both directions.

And the window itself decides the answer: swept 26–200, the same untouched
boundaries read **9.04× / 9.22×** instead of 5.63× / 5.74×, because the
denominator falls. §6.1 applied to D10: the sweep window is the locus and it was
never derived from anything.

`_jq10tier-v2.mjs` is added beside v1 (v1 is **not** retired — it is sound
within the window it sweeps). v2 parameterises the art and the window, prints
the boundary jump in absolute `d(ink)` beside the ratio, and prints the
within-tier pops the gate ignores. Response test: field circle at mid shrunk
40.5 → 34.0 gives 0.0504 → 0.2419, 3.44× → 17.97×. **PASS.**

---

## 4. The four blocked dimensions — rulings

I checked the instrument-builder's reasoning rather than accepting it. Three of
its four conclusions are upheld. **One is overturned, in our favour.**

### 4.1 D2 reverse silhouette — BLOCKED upheld, and the acquisition spec was mine and it was wrong

Upheld. Round 1 named the acquisition as *"a square-on, evenly-lit quarter
reverse photograph with the device separable from the field."* `quarter-rev-3.jpg`
is square-on to 0.05% of R — the best disc fit in the whole `ref/` directory —
and evenly lit, and it still cannot be segmented. The physics is the point: on a
struck circulation coin the device and the field are **the same metal at the same
reflectance**, so there are not two populations to threshold. Valley depth 0.0822
against the dime worked example's 0.8276 is a factor of ten, and Otsu
separability (0.65 vs 0.85) barely discriminates at all.

The device-side self-agreement — the number D2 actually scores — is
**0.2770 … 0.7786**, worse than round 0's 0.4705 … 0.6869. A target whose own
ambiguity is 0.72 cannot resolve a 0.05 gate.

**Verdict: `BLOCKED`. Acquisition: a frosted/cameo-proof quarter reverse against
a dark field.** Adoption test, one line, stated before a candidate exists:
in-disc grey histogram valley depth ≥ 0.5 **and** level-sweep area drift ≤ 15%
over ±30 grey levels.

I also accept the correction to my own spec: **squareness and exposure were the
wrong ask.** The missing property is a reflectance difference, and no amount of
lighting discipline puts one into a circulation strike.

### 4.2 D4 reverse rhythm — BLOCKED upheld; `N/A` is NOT available

Upheld, and I verified the subject exists by opening `quarter-rev-3.jpg` myself
(§4.3, and the overlay in §5 below): wing primaries, wreath leaves in pairs, and
the arrowheads are all plainly there. So the metric has a subject and `N/A` is
not honest.

Whether a **count** is resolvable is the separate question, and it is not:
across 15 radii the two independent references agree on the count **0 times**,
rev-3 spanning 12–28 and rev-2 spanning 5–13. §15.1 asks for a zero-error count
gate; a count with a 5× modal disagreement cannot carry one.

**Verdict: `BLOCKED`, same acquisition as D2, same physical reason.**

The offered observation that §15's zero-error count gate may simply be the wrong
gate for a non-architectural reverse is noted as a **re-derivation for a future
round**, to be written down before it is measured (§8). It is not applied.

### 4.3 D3 reverse tone — BLOCKED upheld

Upheld, and the reasoning is exactly right: the noise floor is the metric's own
resolution and no gate can be tighter than it.

```
v1 unsymmetrised   normaliser wreathL      noise 0.1937   flat 0.1732   ratio 1.118
v2 symmetrised     normaliser wreathSide   noise 0.1620   flat 0.1760   ratio 0.920
acceptance, stated before the numbers                                   ratio <= 0.600
```

A noise floor above the flat-drawing floor means **the metric cannot tell a good
drawing from a drawing with no interior at all**. That is not a failing coin,
it is an unusable ruler, and publishing a number from it would have been the
exact fault §4 exists to prevent.

The mirror-pair diagnosis is the strongest thing in that report: **0 of 4 mirror
pairs agree in sign between the two references.** On a bilaterally symmetric
device that cannot be the die, so it is the light, and symmetrising cancels it —
an 18% real improvement that still misses.

**Verdict: `BLOCKED`. Acquisition: three more independent, square-on,
on-design quarter reverse photographs (5 total). No proof required.** The 1/√N
arithmetic is sound to the precision it claims.

The target is frozen at `_jqrevtone-v2.json` (`260f8109…`) with v1 kept beside
it. That is §1.1's "retract beside" applied correctly.

### 4.4 D5 band, reverse — BLOCKED **OVERTURNED**

This is the one I disagree with, and the disagreement came from doing what §4.3
tells the judge to do: draw the located feature on the source and look.

The instrument-builder is right that the **σ-plateau method** cannot work here.
48 sector × reference combinations, no sector meeting both contrast ≥ 1.8× and
inter-reference agreement ≤ 1.0 unit; and the structural reason is real — the
eagle's wings occupy every radius inboard of the legend, so there is no inner
shoulder to find. Its Q4 illustration is also correct, and I verified it with my
own eyes on `_jq-rev-band.png`: the top band brackets **E PLURIBUS UNUM**, not
`UNITED STATES OF AMERICA`, and the bottom band brackets the **wreath**, not
`QUARTER DOLLAR`. Three rounds, three detectors, three wrong features.

**But "this detector cannot find the band" is not "the band cannot be
measured".** The legend is directly locatable by overlay. I drew a radius ladder
on `quarter-rev-3.jpg` at 2000px (`_jq-r2-locus3.png`) and on `quarter-rev-2.png`
(`_jq-r2-locus.png`) and read it off:

| | reference `UNITED STATES OF AMERICA` | ours (top string) |
|---|---|---|
| baseline radius | **≈ 38.0 – 38.5** | **36.40** |
| cap top radius | ≈ 41.0 | 39.64 |
| cap height | ≈ 2.7 units | 3.24 units |

**Our top legend sits about 1.9 viewBox units too far inboard, and its letters
are about 20% too tall.** The D5 band gate is ±1.5 units on the inner radius, so
this is a **miss** — and it is a miss that no acquisition is needed to see.

`BLOCKED` means *not measurable with any artefact we have*. It is measurable
with the artefacts we have. **Reclassified `UNMEASURED`, owner: THE JUDGE**, the
same category D3-reverse carried in round 1 — the work is freezing a target, and
freezing a target is not a specialist's job.

The numbers above are a **provisional overlay reading, not a frozen target**, and
they are recorded as evidence, not as a scorecard `value`. What round 3 needs is
the annotation done properly: read both references independently, state the
agreement gate before reading, and freeze.

**This also fixes the D5 HF locus.** The ladder shows that `r = 38.9` runs
through the **middle of the reference's legend** — so the frozen locus is,
by luck rather than derivation, on the right feature on the target side. On
*our* side it is near our cap tops, because our band is displaced inward. That
is a defensible comparison and a lucky one, and round 3 should re-derive it from
the annotation rather than keep relying on it.

---

## 5. Re-scored: every dimension, both sides

Gate column is `quarter-gates.md`, unchanged and hash-verified.

| # | side | gate | round 1 | **round 2** | verdict |
|---|---|---|---|---|---|
| D9 | both | 0 | 0 / 180 | **0 / 180** | **PASS** *(blocking, clear)* |
| D8 | obv | 0.0000% | 0.0000% | **0.0000%**, depth 0.0000 | **PASS** |
| D8 | rev | 0.0000% | 0.0000% | **0.0000%** every tier, max r 40.949 < 41 | **PASS** |
| D1 | obv | ≥ 0.95 | 0.9653 | **0.9653** *(byte-identical)* | **PASS** |
| D1 | rev | — | — | — | N/A |
| D2 | rev | ≥ 0.95 | self-IoU 0.47–0.69 | **self-IoU 0.2770–0.7786** | **BLOCKED** |
| D3 | obv | ≤ 0.1791 | 0.1447 | **0.1447** *(byte-identical)* | **PASS** |
| D3 | rev | ≤ ½ flat | UNMEASURED | **noise/flat 0.920 vs ≤ 0.600** | **BLOCKED** |
| D3-sign | obv | all agree | 7/12 | 7/12 | WAIVED |
| D4 | obv | — | no repeated element | unchanged | N/A |
| D4 | rev | count error 0 | not resolvable | **0 of 15 radii agree** | **BLOCKED** |
| **D5-HF** | **obv** | ≤ 1.50× | *1.51×* | **2.0089×** @ frozen r 38.9 | **FAIL** |
| **D5-HF** | **rev** | 0.30–1.50× | *0.00×* | **0.6194×** @ frozen r 38.9 | **PASS** |
| D5-band | obv | ±1.5 units | BLOCKED | detector on bust edge, contrast 1.67 | **UNMEASURED** *(judge)* |
| D5-band | rev | ±1.5 units | BLOCKED | **overlay: ours 36.4 vs ref ≈38.3** | **UNMEASURED** *(judge)* |
| D6 | obv | 0 flags | 26 | **26** of 33 marks | **FAIL** |
| D6 | rev | 0 flags | 13 | **13** of 92 marks | **FAIL** |
| D7 | obv | 0 > 75° | 102.0°, 5 knots | **102.0°, 5 knots** | **FAIL** |
| D7 | rev | 0 > 75° | 109.1°, 39 knots | **109.1°, 39 knots** | **FAIL** |
| D10 | obv | ≤ 4× | 3.4× / 1.7× | **3.44× / 1.72×** | **PASS** |
| D10 | rev | ≤ 4× | 5.80× / 5.92× | **5.63× / 5.74×** *(denominator only)* | **FAIL — no change** |
| D11 | both | no regression | 0/28 at icon | **0/28 at icon AND at 44 and 54** | **PASS** |
| D11-set | both | ≥ 3.0× | 1.487× | **1.487×** | **ESCALATE** |
| D13 | obv | \|Δ\| ≤ 0.05 | −0.136 icon | **−0.136** *(byte-identical)* | **FAIL** |
| D13 | rev | \|Δ\| ≤ 0.05 | +0.1835 @ 84px | **+0.1631 @ 84px** | **FAIL — improved** |
| D12 | both | must happen | done | **done, with a control, and it corrected me** | **PASS** |

D13 reverse in full, gate 0.05 at each tier:

| | 26px | 44px | 54px | 84px |
|---|---|---|---|---|
| round 1 Δ | +0.0652 | +0.1409 | +0.1628 | +0.1835 |
| **round 2 Δ** | +0.0652 | +0.1409 | +0.1628 | **+0.1631** |
| ink ours / ref @84px | | | | **0.503** / 0.764 *(was 0.441)* |

Only 84px moves, which is correct — it is the only tier that changed. The
improvement is real (11.1% of the gap closed) and the tier still misses by 3.3×.

D11 is worth stating plainly because it is the contrast with round 1: **0 of 28
pairs moved at 26, 44 and 54px — bit-identical, controls stable (self-distance
exactly 0, `penny.o/quarter.r` 0.2571 → 0.2571).** Round 1 spent 1.54% of the
worst pair to buy containment. **Round 2 spent nothing.**

---

## 6. What my eyes saw (D12) — the control went first

Artefacts: `_jq-r2-control.png`, `_jq-r2-subject.png`, `_jq-r2-crop84.png`,
`_jq-r2-locus.png`, `_jq-r2-locus3.png`. All at the real device pixel count,
nearest-upscaled.

**Control rendered and read BEFORE the subject**, and before I formed any
expectation about the 84px reverse — dime reverse @84 (62 dev px), nickel
reverse @84 (73 dev px), quarter reverse @76 (below the new floor), quarter
**obverse** @84 (byte-identical). Written down at the time:

> dime and nickel reverses: motif only, no lettering — both keep the 135 floor.
> quarter reverse @76: eagle mass, cross-hatched wings, no lettering, plain
> field ring. **quarter obverse @84: `LIBERTY` IS drawn, and at 84 device pixels
> it reads as a row of small dark ticks along the top arc — the letters are not
> individually legible.**

That last line is the control that matters, and it was obtained before I looked
at the subject. **The shipped, D5-passing obverse already carries a legend at
84px that does not read as words.**

**Then the subject.** At 84px the reverse now carries `UNITED STATES OF AMERICA`
and `QUARTER DOLLAR`. Honest reading at 20× nearest (`_jq-r2-crop84.png`): near
top-centre the letters are separated marks; toward both ends they run together.
**It is a serrated band of letter-sized marks, not words** — the same character
as the obverse control, slightly better because `QUARTER DOLLAR` is set larger.

The specialist's source comment argues this is faithful rather than damaged,
because the reference at the same device pixel count is *also* a chain of
separated marks. **The photograph supports it**: reference HF at the frozen
locus at 84px is 0.5135, not 0.0000. Ours is 0.3181 — the same kind of thing,
sparser. Whether a legend that cannot be read should be drawn at all is a
product question, and §8 says the judge does not rule on it. Recorded, not
gated, and no legibility gate is invented after the fact.

The 82px tile confirms the D10 finding by eye: **scrub 82 → 84 and a whole
legend materialises.** The pop is real and visible.

### 6.1 The control caught me again — this time with no specialist involved

From the geometry I computed that the field ring (`r 41`, `stroke-width 1.4`)
has its inner stroke edge at **40.30**, and our outermost glyph reaches
**39.64** — an optical clearance of **0.66 viewBox units = 0.55 device pixels at
84px**, half the 1.330 units of margin the specialist reported (which is margin
to the circle's centreline, not to the stroke). Looking at the crop with that
number in my head, I saw the letters at ten and two o'clock merging into the
field ring.

**They do not.** Walking the ring band (r 40.3 … 41.7) per 0.5° at device
resolution, round 1 vs round 2:

```
quarter reverse 84px : ring-band angles DARKENED by round 2: 1 / 720, worst +5 grey levels at 330.5deg
quarter obverse 84px : 0 / 720   (byte-identical control)
quarter reverse 82px : 0 / 720   (below-floor control)
```

Band darkest 146 and lightest-min 183 in **both** revisions. One angle, five
levels. The letters sit inboard of the ring and do not contaminate it.

Q5 said the judge cannot un-read a claim. Round 2 adds the mirror case: **the
judge cannot un-read its own arithmetic.** I had no specialist telling me what
to see — I had computed 0.55 px and gone looking for the consequence. The
control and the device-resolution walk are what corrected me, exactly as in
round 1, and D12 is the only check in this process that is not running on a
prior.

---

## 7. Instruments (§4 / §4.1 / §4.2 / §4.3)

| instrument | response | null | selection | located feature |
|---|---|---|---|---|
| `_jq5letter-v2` | **PASS** — synthetic stripes 1.9407 vs flat 0.0000 at the frozen locus | n/a — the locus is a literal, there is no search | n/a | n/a; **plus reference-invariance: 8/8 bit-identical** |
| `_jq5letter` v1 band finder | PASS on a synthetic ring | PASS — interior on both sides | n/a | **FAIL — locks onto the bust edge / E PLURIBUS UNUM / the wreath.** Verified by my own reading of `_jq-rev-band.png` |
| `_jq8contain-v2` | inherited, PASS | a maximum, no bounds | **PASS and it fires** — prints `47(blank,rejected) 40.5(fill) 40.5(ring)` on every penny and nickel row | worst mark's path data printed |
| `_jq9well` | **PASS** — injected `undefined` caught in 144 of 180 | n/a | n/a | id/side/size named |
| `_jq10tier-v2` | **PASS** — mid field 40.5→34.0 gives 3.44× → 17.97× | window printed as a locus | n/a | within-tier pops enumerated with the size range |
| `_jq11disc` | frozen `_x6lib`; self-distance exactly 0 or it throws | not a search | n/a | far-pair control 0.2571 → 0.2571 |
| `_x6dark` (D13) | field recovers as the palette's own greys (212 silver, 151 cent) — §20.1 | n/a | n/a | ink bbox printed per coin |
| `_jq67edge` (D6) | PASS as a detector | n/a | n/a | **DEGENERATE as a discriminator — flags 100% of stroke marks.** Appendix P1, still unaddressed |

**`UNTRUSTED` this round: `_jq5letter.mjs` v1 — RETIRED.** No dimension is left
untrusted: D5's HF half moves to v2, and D5's band half was already not carrying
a value.

### 7.1 Q4's failure mode, for the third and fourth time

The parent asked me to note that Q4 has now appeared three times. It has
appeared **four**, and the fourth is mine:

1. round 0 — band finder locks onto the **bust edge**;
2. round 1 — same, again;
3. round 2 — band finder locks onto **E PLURIBUS UNUM** and the **wreath**;
4. round 2 — **the judge** locks onto a ring collision that is not there (§6.1).

All four were in-bounds, response-tested, and confident. All four were caught by
the same thing: **drawing what was found on the source and looking at it.** §4.3
is the highest-yield rule in the document and it should be promoted from a
paragraph to a numbered obligation with an artefact filename attached.

### 7.2 A hygiene fault: a retired instrument is still executing

`_jq5letter.mjs:150` does `await import('./_jq8contain.mjs')` — the **retired,
unsound v1** — to destructure a `textMarks` it never uses. The import has side
effects: v1 runs its full sweep and prints a containment table at the top of
D5's output, in which the nickel obverse reads **`0.0000%` PASS** because v1
measures it against the r 47 blank. A retired instrument printing retracted
verdicts into a live instrument's console is exactly how the retraction gets
un-retracted. Proposed as R4.

---

## 8. Round decision: **ACCEPT**

**The coin: FAIL.** **The round: ACCEPT — do not revert.**

- **Target fixed.** D5 reverse HF, the dispatched dimension, went 0.0000× →
  **0.6194×** at the locus frozen in the brief, inside the gate stated before
  any value existed.
- **Nothing that passed broke.** D8 still 0.0000% at every tier *including the
  new glyphs, scored as cap boxes* (max r 40.949 against a field circle of 41 —
  the brief's specific warning was heeded); D9 0 of 180; D1, D3, D6, D7,
  D10-obverse, D13-obverse byte-identical; D11 bit-identical at the frozen locus
  **and** at both mid sizes.
- **A second gate improved as a side effect.** D13 reverse at 84px, +0.1835 →
  +0.1631, ink 0.441 → 0.503 against a reference at 0.764.
- **Specialist hygiene: clean.** One file edited, no target or eval library
  touched, four alternatives reported including the ones that were worse, a
  global floor of 62 rejected on blast radius, and **both of its own results
  disclaimed as artefacts rather than banked.** Disclaiming your own win is the
  behaviour §1 is trying to buy and it should be said out loud.
- **Costs, recorded and not hidden.** A within-tier discontinuity now sits at
  82→84 (`d(ink)` 0.0783) where it used to sit at 134→136 (0.0611) — moved into
  the visible range and 28% larger, invisible to D10's gate in both positions.
  And the legend it switches on is not legible at 84px, which is faithful to the
  photograph and is still worth writing down.

Tests: `npx playwright test tests/coins.spec.js tests/pawcoins.spec.js` →
**18 passed, exit 0.**

---

## 9. Termination check (§5)

Budget 4 rounds; this is round 2; **two remain**.

- **All PASS or WAIVED?** No. 11 dimension-rows fail.
- **No net progress?** Not triggered. Round 1 moved D8 (0.7505% → 0.0000%);
  round 2 moved D5-rev-HF (0.00× → 0.62×) and D13-rev-84 (+0.1835 → +0.1631).
  Two consecutive rounds, both with movement well above any noise floor.
- **Thrash?** Not triggered — **but the rule as written fires spuriously and
  needs fixing.** §5 says thrash is "the same dimension fails three times". By
  that literal reading, **six** dimensions trip it right now (D5, D6, D7,
  D10-rev, D13, and D2/D4 as blocked), because they have failed in rounds 0, 1
  and 2 — while only **two** dimensions have ever been *dispatched* (D8 in round
  1, fixed; D5-reverse in round 2, fixed). Neither thrashed. A dimension that
  fails three times **without ever being worked on** is not thrash, it is a
  backlog. Proposed as R5.

**The loop should continue.**

---

## 10. Routing: round 3

### 10.1 Partition first (§5)

*Blocked — the judge, and each names its acquisition:*

| dimension | acquisition | adoption test, stated now |
|---|---|---|
| D2 reverse | a cameo/frosted-proof quarter reverse against a **dark field** | in-disc grey histogram valley depth ≥ 0.5 **and** level-sweep area drift ≤ 15% over ±30 grey levels |
| D4 reverse | the same photograph | the same |
| D3 reverse | **three more** independent, square-on, on-design quarter reverse photographs (5 total) | genuinely different photographs — raw NCC < 0.5 against every one we hold, and disc-fit p95 residual ≤ 1% of R |

*Judge work, no acquisition needed:*

| dimension | work |
|---|---|
| D5-band, both sides | freeze the legend band radii by **direct overlay annotation** on `quarter-rev-3.jpg` at 2000px, cross-checked against `quarter-rev-2.png`, with the inter-reference agreement gate stated before either is read. Newly possible — see §4.4. |
| D5-HF locus | re-derive `r = 38.9` from that annotation instead of relying on it being lucky |

*Repairable, in §5 priority order* (D9→D8→D1/D2→D4→D3/D13→D5→D6→D7→D10):

1. **D13** — reverse fails at every tier by 1.3×–3.3× the gate; obverse fails at
   icon by 2.7×. **Highest-priority repairable failure on this coin.**
2. D8 nickel obverse — band V, 0.694 px, real. **A different coin**, and its
   `HEAD` is over the line at 40.640 before any offset, so it is a redraw.
3. D5-obverse HF, 2.0089× against 1.50× — newly corrected, newly large.
4. D6 (metric is degenerate, Appendix P1 still unadopted), D7, D10-reverse.

### 10.2 The dispatch: D13, quarter, both sides

D13 is where the priority order lands and it is also where the coin is worst on
the two draws a child actually sees. The two sides fail in **opposite
directions**, which is the interesting part and the reason to do them together.

```
SUBJECT      quarter, obverse AND reverse
DIMENSION    D13 device against field
CURRENT      reverse  26px +0.0652   44px +0.1409   54px +0.1628   84px +0.1631
                      ink @84px 0.503 ours vs 0.764 reference
                      the device is far too LIGHT and far too SPARSE at every tier
             obverse  26px -0.136,  ink 0.802 ours vs 0.634 reference
                      the device is too DARK and too INKY at icon
             The two sides miss in OPPOSITE directions. A single global
             lightness change cannot fix both, and if you find yourself
             reaching for one, say so and stop.
GATE         |delta mean/field| <= 0.05 at EVERY tier, EACH side.
             Derivation: round-0 Appendix P3, written before this dimension
             existed in the rubric. Not relaxed.
             Locus (FROZEN WITH THIS BRIEF, spec 6.1 and spec R1): the disc
             interior r < 40 viewBox units, at 26 / 44 / 54 / 84 px, each side
             rasterised at ITS OWN real device pixel count and the photograph
             reduced to the SAME count. The locus is a literal. Do not compute
             any part of it from the drawing. Do not evaluate anywhere else.
TARGET       coloringbook/ref/quarter-obv-2.jpg    [READ ONLY - hashed]
             coloringbook/ref/quarter-rev-2.png    [READ ONLY - hashed]
EVAL         coloringbook/_x6dark.mjs              [READ ONLY - hashed]
             coloringbook/_rvnorm.mjs              [READ ONLY - hashed]
             coloringbook/_x6lib.mjs               [READ ONLY - hashed]

MUST NOT REGRESS (current values, re-measured by the judge after you return)
  D8  quarter both sides  0.0000% outside the field circle, EVERY tier, max
                          breach depth 0.0000 units. The reverse at 84px is at
                          max r 40.949 against a field circle of 41 - there is
                          0.05 units of headroom and glyph cap boxes are scored.
                          Adding ink outward WILL break this.
  D9  0 of 180 renders faulty        D1  obverse 0.9653
  D3  obverse 0.1447 (gate <= 0.1791 AND no regression) - D3 normalises by the
      CHEEK, so a change that darkens the whole obverse device can leave D3
      untouched while moving D13. That is the point of D13. Report both.
  D5-HF obverse 2.0089x (already FAIL - do not make it worse)
  D5-HF reverse 0.6194x at the frozen locus r 38.9 (PASS - the safe direction
      is down toward 0.30x, and adding ink in the legend band pushes it UP)
  D7  obverse 102.0 deg / reverse 109.1 deg (do not add a worse knot)
  D10 obverse 3.44x / 1.72x (PASS - must stay under 4x)
  D10 reverse 5.63x / 5.74x (already FAIL; must not get worse). NOTE: this gate
      is a RATIO whose denominator is the within-tier p90. Do not report an
      improvement in it without reporting the absolute boundary d(ink), which
      is currently 0.0904 and 0.0922 and has not moved in two rounds.
  D11 icon 26px: all 28 pairs bit-identical. AND 44px and 54px: all 28 pairs
      bit-identical. Round 2 spent nothing here and round 3 should not either.
      THE LIVE RISK: the dime reverse is also far too light (+0.2756 at 84px)
      and dime.r/quarter.r is the reverse-minimum pair at every tier
      (0.0794 / 0.0633 / 0.0637). Darkening the quarter reverse toward its
      reference moves it TOWARD the dime unless the dime moves too. Measure it.
  D11-set 1.487x (ESCALATE, unchanged for three rounds)

RULES
  - Never describe the coin from memory. Open the reference and measure. If the
    photograph contradicts this brief, the photograph wins - say so.
  - Do not edit a target or an eval library. They are hashed; editing one voids
    the round. If you find a defect in one, REPORT IT AND DO NOT FIX IT - that
    has now been the most valuable event in two of the three rounds so far.
  - Any locus you introduce must be a literal or come from the TARGET. If a
    number you compute from our own drawing decides where a measurement is
    taken, that is the fault that voided D5's instrument in round 2.
  - Report EVERY iteration including the ones that got worse.
  - Do not report a verdict. You report what you changed and what you observed;
    the judge decides whether it passed.
```

---

## 11. Process critique — round 2

Proposals R1–R6 are written into `docs/COIN-JUDGE.md` as a clearly marked
Appendix R. **Nothing in them is in force.** In short:

- **R1** — a locus may not be a function of the artefact under test, and every
  instrument that compares ours against a target carries a
  **reference-invariance test**. This round's headline.
- **R2** — a gate whose value is a **ratio to a quantity the drawing controls**
  can be moved by making the drawing worse. D10 is one. Report the numerator
  absolutely, always.
- **R3** — `BLOCKED` has been over-applied. "This detector cannot find it" is
  not "no artefact we have can measure it". Before a `BLOCKED`, the judge must
  try the **overlay**: draw the feature's candidate location on the source and
  look. That is what overturned D5-band.
- **R4** — a retired instrument must not be importable by a live one.
- **R5** — §5's thrash rule counts *failures*; it should count
  *dispatch-and-still-failing*. As written it fires on six dimensions here, none
  of which has ever been worked on.
- **R6** — §4.3 should be a numbered obligation with a published artefact, not a
  paragraph. Four for four this round.
