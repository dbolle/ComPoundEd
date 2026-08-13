# Quarter — round 4 (judge)

2026-08-13. **A judge-only round: no specialist was dispatched.**
`src/art/coins.js` is `d8f57dbb…`, byte-identical to the subject round 2
recorded, so nothing about the art can have moved. Round 3's D13 work is
preserved unshipped at `r3-d13-UNSHIPPED.patch` and is not in the tree.

The round's job was the acquisition: four proof photographs arrived to unblock
D2, D4 and D5-band, and my first duty is to audit the instrument that admitted
them rather than to use it.

---

## 0. Audit of `_jqvalley.mjs` — the instrument is UNTRUSTED on three of the six files it scored

I was asked whether it is still wrong. It is, in a way its own control could
not catch, and the fault is the one this document keeps finding.

**Reproduced first.** Every published figure re-runs exactly: dime 0.8386,
`qp1964-rev-pad` 0.8414, ebay 0.7865, `qp1964-obv-pad` 0.6898, `qp1963-rev-pad`
0.6440, `qp1963-obv-pad` 0.5803. So this is not a question of arithmetic.

### 0.1 It fitted the padding rectangle, not the coin

`fitDisc` returns, for three *different* images:

| file | `fitDisc` | true disc (round 4, hand-seeded, overlay-verified) |
|---|---|---|
| `qp1963-obv-pad.png` | cx 460 cy 497 **R 318.3** | cx 467 cy 500 R 290.2 |
| `qp1964-obv-pad.png` | cx 460 cy 497 **R 318.3** | cx 465 cy 503 R 292.7 |
| `qp1964-rev-pad.png` | cx 460 cy 497 **R 318.3** | cx 461 cy 504 R 302.1 |

Three inputs, one bit-identical answer. §4: *two bit-identical answers from two
different inputs is not agreement* — and this one has an arithmetic identity
behind it. `((600 − 1) + (675 − 1)) / 4 = 318.25`. That is the half-mean side
of the **600 × 675 crop** these files were padded from to 920 × 995. The
instrument found the padding rectangle.

The reason is physical and it is the same reason round 2 named for D2: on a
cameo proof the field is a black mirror, so "dark" is the *coin*, not the
surround, and a flood keyed on background level cannot tell them apart. The
fix that made a light-background flood work made a dark-background flood find
the pad seam instead.

### 0.2 The disc-fit sanity gate cannot detect the failure it was added for

```
if (disc.aspect < 0.85 || disc.aspect > 1.18) …
if (disc.fill   < 0.72 || disc.fill   > 1.30) …
```

A 600 × 675 rectangle has bbox aspect **0.89** and fill
`405 000 / (π · 318.3²)` = **1.27**. Both are inside the windows. The gate's own
thresholds admit a rectangle, so a circularity test that a rectangle passes is
not a circularity test. It is also computed from the same mask it is checking,
which is the R6 failure — a prior of the instrument's own manufacture.

A gate that would have fired: the p95 radial residual of the mask boundary
about the fitted circle, as a fraction of R. `_jq41hand.mjs` prints it, and it
reads 0.6 % on the dime and 4.8 % / 11.1 % on the two 1964 files.

### 0.3 The published depths survive by luck, and are not the quantity claimed

`valley()` samples inside `0.80 · R`. With R = 318.3 at (460, 497) and the true
`qp1964-rev-pad` disc at (461, 504) R 302.1, the sampling circle is 254.6 px
where the coin is 302 — **inside the coin, by 47 px**. So the marble ground did
*not* get into the histogram and 0.8414 is a real in-disc valley. But the file
claims to sample 0.80 of the coin's radius, which would be 241.7, and it did
not. A number that is right because two errors did not quite meet is not a
measurement.

Re-derived at the frozen discs, inside the field circle, the same quantity
reads **0.9060** on the dime, **0.8055** on `qp1964-rev-pad`, **0.5941** on
`qp1963-rev-pad`. Three honest computations of "the dime's valley depth" now
exist — 0.8276 (round 2), 0.8386 (`_jqvalley`), 0.9060 (round 4) — and they
differ only in where they sample. **Valley depth is not a defined quantity
until the disc and the annulus are frozen with it**, and the positive control
agreeing to ±0.011 against a value produced by a *different* annulus is a
coincidence, not a calibration.

### 0.4 Only half of the stated acceptance test was implemented — and every proof fails the other half

Round 2 wrote the adoption test as two conditions:

> in-disc grey histogram valley depth ≥ 0.5 **and** level-sweep area drift
> ≤ 15 % over ±30 grey levels.

`_jqvalley.mjs` implements the first. On the second:

| file | valley depth | **area drift ±30 levels** | |
|---|---|---|---|
| `dime-obv-2.jpg` (worked example) | 0.9060 | **6.6 %** | accept |
| `qp1963-obv-pad.png` | 0.5599 | 16.8 % | reject |
| `qp1964-rev-pad.png` | 0.8055 | 21.6 % | reject |
| `qp1964-obv-pad.png` | 0.6485 | 25.2 % | reject |
| `qp1963-rev-pad.png` | 0.5941 | **37.5 %** | reject |

The dropped condition is the one that predicts whether a *contour* is stable —
which is precisely what D2's 0.97 self-agreement gate asks. It is not a
coincidence that D2 did not freeze in §2 below.

### 0.5 The §4.2 selection test is present in name and absent in effect

`AMBIGUOUS — reporting, not choosing` fires on **6 of 6** files, including
every ACCEPT — and is then followed immediately by a choice and a verdict. It
flags 100 % of cases, so it cannot rank and cannot route: Appendix P1's
complaint about D6, in a new place. It is also inconsistent: `pairs` is sorted
by `depth × mass` while the ambiguity test compares `depth` alone, so the
"second best" it reports is not the runner-up on the criterion that chose the
winner. And it prints 4 candidates of the 300-plus that exist on the dime,
where §4.2 says *the whole set*.

### 0.6 A provenance error in `REFERENCES.md`

The table gives `quarter-1995d.jpg` a valley depth of 0.1439. Run on that file,
the instrument **refuses to score it** — `DISC FIT UNRELIABLE — aspect 2.02,
R 383 ≥ half-frame`, correctly, because it is a two-coin plate. The 0.1439 is
`q1995d-rev.png`. §1.1 promises a published number can be reproduced from what
it names; this one cannot.

### 0.7 What is right and should stand

The **diagnosis**. On one instrument, with one method, the circulation strike
reads 0.14–0.46 and the cameo proofs read 0.56–0.81. Round 2's claim that the
discriminating property is the *strike* and not the photograph is confirmed,
the acquisition was correctly named, and the owner's dark-background fix was
necessary and real. The instrument is wrong about *where the coin is*; it is
right about *what a coin has to be*.

---

## 1. Independence — every quarter pair, both sides

`_jq42indep.mjs`, re-using round 2's `_jq20indep.mjs` unedited at its published
hash. Three statistics: raw disc-normalised NCC (**same photograph?**),
registered NCC on blurred |grad| energy (**same design?**), and — new this
round, because the question asked was about a shared *setup* — background NCC
outside the coin and the illumination azimuth inside it.

### 1.1 The 1963 and 1964 plates: the answer differs by side

| pair | raw NCC | design NCC | background NCC | azimuth |
|---|---|---|---|---|
| `qp1963-obv-pad` vs `qp1964-obv-pad` | **0.7688** | **0.8617** | −0.082 | 89.5° vs 90.8° |
| `qp1963-rev-pad` vs `qp1964-rev-pad` | 0.3910 | 0.6656 | 0.190 | −162.5° vs 157.6° |

**The two OBVERSE plates share a photographic setup.** 0.7688 raw grey
correlation between two supposedly independent photographs, where every other
independent pair in the obverse set runs −0.20 to +0.36, and an illumination
azimuth agreeing to **1.3°**. They are not the same photograph — the coins are
a 1963 and a 1964 and the dates resolve — but for any measurement that depends
on illumination they are **one observation**, and §15.1's "count it on two
different photographs" is not satisfied by them.

The two **reverse** plates are genuinely independent: raw 0.3910, azimuths 40°
apart. Their design NCC of 0.6656 is the highest in the reverse set, which is
what two clean cameo proofs of one die *should* look like.

### 1.2 Two findings nobody was looking for

- **`quarter-obv.jpg` and `quarter-obv-2.jpg` are the same photograph.** Raw
  0.9542, design 0.9959. That is the **fifth** instance of the trap and the
  first on the obverse, which had never been correlated — rounds 0–2 only ever
  ran this on the reverses. No published number moves: D1's mask and D3's
  patches both name `quarter-obv-2.jpg` and only that.
- **`quarter-obv-4.jpg` is the 1999+ state-quarter obverse**, a different
  design: registered design NCC 0.246–0.298 against every 1932–98 obverse,
  under the different-design floor + 0.15. I looked before I believed the
  number — the legend is rearranged and QUARTER DOLLAR has moved to the
  obverse. `coins.js:1796` cites it as a confirming reference for the curls;
  that citation should be re-checked by whoever owns the obverse.

### 1.3 A false negative I must report

`q1995d-rev.png` **is** the Washington heraldic-eagle reverse — I opened it —
and the design statistic calls it `DIFFERENT DESIGN` against every other
reverse (0.099–0.212 against a floor + 0.15 of 0.329). The statistic is
one-sided: `SAME PHOTOGRAPH` and `INDEPENDENT` are actionable, **`DIFFERENT
DESIGN` is not**, and must be confirmed by looking. Background NCC is weaker
still — `qp1963-rev` vs the Nebraska quarter scores 0.472, the highest
background correlation between two non-identical files in the set.

---

## 2. D2 — reverse motif silhouette. It did NOT freeze. `BLOCKED` is withdrawn.

Gate, unchanged from round 2 and stated in `_jq43seg.mjs` before any value:
freeze only if the **minimum pairwise device IoU across the threshold sweep is
≥ 0.97** and two independent references agree at **≥ 0.95**.

Locus, frozen before measuring and not a function of our art: `r ≤ 0.862 R`
(viewBox 40.5, the field circle) on a 700 × 700 disc-normalised grid; the motif
is the connected component of `{grey ≥ T}` containing the centre; `T` swept
`Tv ± 15` in steps of 5, `Tv` the histogram valley floor **of the photograph**.

| | min pairwise IoU (±15) | min adjacent (±5) | area of the field |
|---|---|---|---|
| `qp1963-rev-pad.png` | **0.8431** | 0.9578 | 65.1 % |
| `qp1964-rev-pad.png` | **0.9072** | 0.9761 | 71.6 % |
| round 2 (`rev-3`) | 0.2770 … 0.7786 | — | — |
| round 0 (`rev-2`) | 0.4705 … 0.6869 | — | — |

Cross-reference registered IoU: **0.7372** at 1.5°, against a 0.95 gate.

**The acquisition worked.** Self-agreement went from 0.28 to 0.91, and
`_jq43seg-qp1963-rev-pad.png` shows the contour running along the eagle's
wings, the arrow bundle, the wreath and both legends. I looked at it. Round 2's
physics was right and the reference it named is the right reference.

**Nothing is frozen, because 0.0928 of ambiguity cannot resolve 0.05.** Three
obstacles, and every one of them is judge work, not a photograph:

1. **Both proof reverses are oblique.** They fit a *circle* to p95 4.8 % and
   11.1 % of R. At r 40 that is ±2 to ±4.5 viewBox units. Most of the 0.7372 is
   registration error, not disagreement about the eagle. An ellipse /
   perspective rectification is the missing step and it needs no acquisition.
2. **The eagle merges with the legends at every threshold.** E PLURIBUS UNUM
   sits directly above the head and UNITED STATES OF AMERICA runs within a
   unit of the wingtips, so the connected component is 65–72 % of the field and
   is not the motif. Cutting the locus down to `r ≤ 0.65 R` lifts
   self-agreement only to 0.9518 and amputates the wingtips, which reach r 38.9
   in our own drawing.
3. **The second half of the adoption test was never run** (§0.4), and it is the
   half that predicts exactly this.

Per Appendix R3 — *`BLOCKED` means no artefact we have can measure it, not "the
instrument I built cannot"; if the overlay can see the feature the verdict is
`UNMEASURED` and the work is the judge's* — **D2 is `UNMEASURED`.** I am not
naming an acquisition this round.

### 2.1 A coarser gate was derived, and it failed too — published, not adopted

The round-3 failure this round exists to prevent was not a 0.05 failure; the
eagle read as **a sailboat**. So I derived, in writing and before any value
(`_jq47profile.mjs` header), a descriptor an ambiguous target could still
carry: the **radial extent profile**, 72 bins × 5°, 95th-percentile device
radius, gate declared as **2.0 ×** the target's own worst floor before the
floor was known.

The floors came back at 1.21–2.46 units, which would have given a 4.9-unit
gate — and then the profile itself reads **34–39 viewBox units in almost every
direction**. That is the legend's outer radius. The descriptor is measuring the
same merge that broke the IoU, and it is published as a failure and **not
adopted**. A target forced into existence is worse than none.

---

## 3. D4 — reverse rhythm. Counted on both proofs. `BLOCKED` is withdrawn.

Same detector (`_jq23count.mjs`, imported unedited at its round-2 hash — the
judge may not edit an instrument to get an answer), same declared locus (left
wing primaries, sector 150–205°, r/R 0.450–0.800, 15 radii). Response test
re-run: combs of 9 and 13 return 9 and 13, flat returns 0.

| reference | 15 counts | range | modal |
|---|---|---|---|
| `qp1963-rev-pad.png` | 5 6 4 6 5 4 5 4 5 6 6 5 9 5 6 | 4–9 | **5** (6/15) |
| `qp1964-rev-pad.png` | 4 4 4 4 8 5 6 5 9 7 10 7 8 10 5 | 4–10 | **4** (4/15) |
| `quarter-rev-3.jpg` (control) | 13 23 17 21 19 20 23 28 27 24 31 26 28 20 21 | 13–31 | 20 (2/15) |
| `quarter-rev-2.png` (control) | 6 5 7 8 12 9 7 5 8 8 7 10 13 11 5 | 5–13 | 5 (3/15) |

**Both counts, as §15.1 asks: 5 and 4.**

Round 2's two references spanned 12–28 and 5–13 with modal values 5× apart. The
two proofs overlap almost entirely and their modes differ by **one**. The
toning hypothesis is confirmed: `quarter-rev-3` is a toned coin and it is the
only reference that returns 20–31 grooves on a wing that has fewer than ten.

Agreement is still only **1 of 15 radii**, so §15.1's zero-error gate is not
met and D4 still fails. But the remaining fault is visible in the overlay and
it is a *metric* fault I own: the primaries run **down-and-in** across the wing,
and a circular arc centred on the coin crosses them at a shallow,
radius-dependent angle, so the counted midpoints scatter off the groove lines.
A sampling path perpendicular to the groove direction is the fix and it needs
no photograph. **`UNMEASURED`.**

---

## 4. D5-band — frozen. And round 2's hand read is retracted.

Round 2 blocked this "by the design", then R3 correctly said a detector's
failure is not an artefact's failure. The right move turned out to be neither a
detector nor a radius ladder on the face, but a **polar unwrap** — the coin
redrawn in the coordinates the question is asked in, angle × radius, with a
viewBox ladder on it (`_jq44unwrap.mjs`). In that picture the legend cannot be
mistaken for anything else. Four references are published.

**The band is a scale question, not a reflectance question**, so it is measured
on the two *best-fitted* references, not the proofs: `quarter-rev-2.png` (alpha
matte, p95 0.15 % of R) and `quarter-rev-3.jpg` (p95 0.32 %). The proofs fit to
4.8 % and 11.1 %, which at r 40 is three times the ±1.5-unit gate. **Round 2's
acquisition was never needed for D5-band.**

| | reference (frozen) | ours | Δ |
|---|---|---|---|
| top legend baseline r | **36.5** (36.1 / 36.9) | 36.40 | **−0.10** |
| top legend cap top r | **43.4** (43.3 / 43.5) | 39.6 | −3.8 |
| top legend cap height | **6.9** | **3.2** | **46 % of it** |
| bottom legend baseline r | 37.0 | 35.63 | −1.37 |
| bottom legend cap height | 6.7 | 3.8 | 57 % of it |
| rim seat r | **44.2** (44.15 / 44.2 / 44.3) | 41.0 | **−3.2** |

**D5-band-reverse PASSES**: −0.10 against ±1.5.

**Round 2's published hand read is retracted, beside and not rewritten.** It
said *"ours 36.40 against a reference 38.0–38.5, 1.9 units too far inboard"*
and *"letters about 20 % too tall"*. The reference baseline is 36.1–36.9; our
baseline was right to a tenth of a unit. And the letters are not 20 % too tall,
they are **less than half the height they should be**.

The cap height is cross-checked by a route that does not use the radius ladder
at all. `UNITED STATES OF AMERICA` is 24 characters — 23 advances — over ≈170°
of arc read off the unwrap, which at r 40 is 118.7 viewBox units, so **5.16
units per advance**; a bold caps face advances about 0.72 × cap height, giving
**7.2**. The ladder says 6.9. Two methods that share no step agree to 0.3
units. The arc route is not very sensitive to the 170°: at 160° it gives 6.8
and at 180° it gives 7.6, so the conclusion — the coin's cap is a bit under
7 units and ours is 3.2 — survives any reading of the span I could defend.

Two new failing rows fall out of the same measurement and are added to the
scorecard: **D5-cap** (the legend is in the right place at half the size) and
**D5-rim** (the coin seats its rim at 44.2 on three references; we draw the
field circle at 41.0, a rim band 2.1× too wide). D5-rim is scored on the
quarter only — `EDGE` in `coins.js` gives all four coins the same literal 41.0
and the other three have not been measured. That is a judge task, not a
specialist's, and it is not in the brief below.

### 4.1 The re-derived HF locus

§6.1 forbids a locus computed from the artefact under test, and round 2 found
`r 38.9` surviving only as the fallback for "we drew no glyphs". Derived from
the target instead:

> **D5-HF, reverse. Frozen locus: r = 39.95 viewBox units, the mid-radius of
> the frozen reference band (36.5 + 43.4) / 2, sector 195–345°.**
> **D5-HF, obverse: unchanged and still 38.9** — it is not re-derived here
> because the obverse band has not been measured on the unwrap this round, and
> a locus may not be changed to a number I have not derived.

The old reverse value of 38.9 lands 1.05 units inboard of this. It was, as
round 2 suspected, on the real legend by luck: the band runs 36.5–43.4, so any
radius in a seven-unit window would have looked plausible. The sector is
narrowed from 250–290° to 195–345° for a stated reason — E PLURIBUS UNUM lives
at 250–290° *inboard* of r 37, so the old sector sampled two legends at once.

---

## 5. Re-scored

| dimension | round 2 | round 4 | why |
|---|---|---|---|
| D2 reverse | `BLOCKED` | **`UNMEASURED`** | acquisition worked; 0.8431/0.9072 vs 0.97; the work is the judge's |
| D4 reverse | `BLOCKED` | **`UNMEASURED`** | counts 5 and 4; the sampling path is the fault |
| D5-band reverse | `UNMEASURED` | **`PASS`** | frozen 36.5; ours 36.40 |
| D5-band obverse | `UNMEASURED` | `UNMEASURED` | not measured this round; the unwrap method is now available for it |
| D5-cap reverse | — | **`FAIL`** (new) | 3.2 vs 6.9 |
| D5-rim both | — | **`FAIL`** (new) | 41.0 vs 44.2 |
| D13 reverse | `FAIL` | `FAIL` | subject byte-identical, reference unchanged; the hash is the evidence |

D13 is deliberately **not** re-referenced to the proofs. `COIN-ART-METHOD` §20.3
— a frosted proof is the best shape reference and the worst tone reference — and
a cameo proof's device/field ratio is a property of the frosting, not of the
design. Its round-2 reference stands.

---

## 6. Round-4 specialist brief — the eagle's mass AND silhouette

```
SUBJECT      quarter, reverse
DIMENSIONS   D5-cap (FAIL, 0.46 of reference) and D13-reverse (FAIL),
             fixed TOGETHER. This is one brief, not two.
             D2 is NOT a live gate — see WHY below. Do not pretend it is.

TARGETS      coloringbook/judge/_jq4band.json          [READ ONLY — hashed
                sha256:7e9c9b446577c0cc0d34263fbd34da37db0a3c0321d7fa3158e47dc05444177b]
             coloringbook/judge/_jq4discs.json         [READ ONLY — hashed
                sha256:8b6084d6afcf29d2232a4e66f01bf1fd8268f09f1cf531926d640b2c7737a2e0]
             coloringbook/ref/quarter-rev-2.png        [READ ONLY — hashed]
             coloringbook/ref/quarter-rev-3.jpg        [READ ONLY — hashed]
             coloringbook/ref/qp1963-rev-pad.png       [READ ONLY — hashed]
             coloringbook/ref/qp1964-rev-pad.png       [READ ONLY — hashed]
EVAL         everything in coloringbook/judge/         [READ ONLY — hashed]

FROZEN LOCI AND GATES, AS LITERALS

  D5-cap  reverse top legend UNITED STATES OF AMERICA
            baseline radius       36.5   viewBox units, gate +-1.5   (now 36.40, PASSES — do not move it)
            cap top radius        43.4   viewBox units
            cap height            6.9    viewBox units, gate +-15%  => 5.87 .. 7.94   (now 3.2)
          reverse bottom legend QUARTER DOLLAR
            baseline radius       37.0   viewBox units, gate +-1.5   (now 35.63)
            cap height            6.7    viewBox units, gate +-15%  => 5.70 .. 7.71   (now 3.8)
          angular span of the top legend on the coin: ~170 deg (now 134 deg:
            arcText advance = 0.82 x 4.5 = 3.69 units, 23 advances at r 36.4)

  D5-rim  rim seat radius         44.2   viewBox units, gate +-1.0   (now 41.0)
          DO NOT TOUCH THIS IN THIS ROUND. It is EDGE.quarter.field.full and it
          is shared with three other coins that have not been measured. It is
          listed so you know the legend you are enlarging has 44.2 - 36.5 = 7.7
          units of real estate on the coin and only 41.0 - 36.4 = 4.6 in our
          drawing, and so that you report — not fix — anything that collides.

  D13     |delta mean/field| <= 0.05 at each tier, both sides, against
          ref/quarter-rev-2.png reduced to the same device pixel count.
          Round 3 reached +0.048 and produced a sailboat. Reaching this number
          is NOT the objective; reaching it while D12 below passes is.

  D12     THE BINDING GATE THIS ROUND. Contact sheet at 26 / 44 / 54 px,
          three panels per tier:
            (a) the round-2 baseline reverse   — the CONTROL, rendered FIRST
            (b) your reverse
            (c) ref/quarter-rev-2.png reduced to the same device pixel count
          You render it and hand it over. You do NOT report a verdict on it.
          Round 3's whole failure is invisible in every number on this page and
          visible in one glance at that sheet.

MUST NOT REGRESS (current values; the judge re-measures all of them)
  D1 obv 0.9653   D3 obv 0.1447   D8 0.00% both sides, depth 0.0000
  D9 0            D10 obv PASS    D11 rev-min 0.0794   D5-band rev 36.40

WHY D2 IS NOT LIVE, STATED PLAINLY
  Round 4 could not freeze a reverse silhouette target. Self-agreement across
  the threshold sweep is 0.8431 and 0.9072 against a pre-stated 0.97, and the
  two proof references agree with each other at 0.7372 against 0.95. A target
  whose own ambiguity is 0.09 cannot judge a drawing to 0.05, and a target
  forced into existence would be worse than none. D12's control sheet is
  standing in for it, and that is a weaker guard, and you should know it is.

  What that means for you: the sailboat is not going to be caught by a number.
  It will be caught by the sheet. Draw the eagle so that at 26 px it still has
  TWO wings and a body between them, and check that yourself at 26 px before
  you check anything else.

RULES
  - Never describe the coin from memory. Open the reference and measure. If the
    photograph contradicts this brief, THE PHOTOGRAPH WINS — say so, loudly, and
    do not quietly follow the brief. Round 4 retracted two round-2 numbers this
    way.
  - The polar unwraps (judge/_jq44unwrap-*.png) are the fastest way to read any
    radius on this coin. Use them. Do not build another band finder; three have
    been built and all three found the wrong feature.
  - Do not edit anything in coloringbook/judge/ or coloringbook/ref/. They are
    hashed; editing one voids the round. If you believe an instrument or a
    target is WRONG, report it with a reproduction and continue — reporting a
    fault is your job, fixing it is the judge's, and a round is not void for it.
  - Report EVERY iteration including the ones that got worse.
  - Do not report a verdict.
```

---

## 7. Process critique — proposed for Appendix S, nothing in force

### S1. A locus needs a disc, and the disc is a located feature nobody hashes

§6.1 made the locus a first-class frozen object. It stopped one class of error
and left the class underneath it untouched: **every radial locus on a coin is
expressed in units of a fitted disc, and the fit is itself a located feature
that §4.3 has never been applied to.** `_jqvalley.mjs` fitted a padding
rectangle on three files and nobody could see it, because no fit in four rounds
has ever been drawn on its own source. The first thing round 4 did was draw
eighteen of them, and three were visibly wrong within one glance
(`_jq4-fits.png`).

The cost is not hypothetical: the same band, measured on references that fit to
0.15 % and to 11 % of R, moves by 1.3 viewBox units — comparable to the ±1.5
gate it is being judged against.

> **Proposed addition to §6.1:** a disc fit is a frozen target. It is published
> as a table with its p95 boundary residual, hashed like any other target,
> **drawn on its own source before any value derived from it is recorded**, and
> a reference whose fit exceeds p95 1 % of R may not carry a *geometric* gate —
> though it may still carry a photometric one. State which kind each dimension
> is: D2/D13 are photometric and want reflectance; D5-band and D4 are geometric
> and want a square-on disc. **They are not the same acquisition, and round 2
> named one artefact for both.**

### S2. Publish the picture the question is asked in, not just an overlay of the answer

§4.3 says: draw what the instrument found on the source and look. Four rounds
of band finders were each caught that way — after they had run. The polar
unwrap inverts the order: it is the coin drawn in (angle, radius), and the
legend is simply *visible* in it. It took ten minutes to write, it settled a
dimension that had been `BLOCKED` and `UNMEASURED` for three rounds, and it
retracted a published number.

> **Proposed addition to §4.3:** before building a detector for a feature,
> render the artefact in the coordinate system the feature is defined in, with
> a labelled ladder, and read the feature off it. That reading is a legitimate
> frozen target (§2.1 already says so) and it is also the **control the
> detector must agree with**. A detector that disagrees with the picture is
> wrong, whatever its bounds and its response test say.

### S3. "Independent" needs a third question: same photographic *setup*

§21.5 asks *same photograph?* and round 2 added *same design?*. Round 4's
obverse pair is neither the same photograph (0.7688) nor a different design —
and it is also not two observations: same copy stand, illumination azimuth
1.3° apart. Any statistic that depends on where the light came from — tone,
relief inference, shading, D13 — gets one observation from those two files and
§12.7's sign test cannot run on them.

> **Proposed addition to §21.5:** report the **illumination azimuth** and the
> background correlation beside the two NCCs, and state which dimensions a pair
> is independent *for*. Two photographs may be independent for shape and
> dependent for tone.

### S4. A sanity gate computed from the mask it is checking is not a check

`_jqvalley`'s aspect and fill both come from the very mask whose validity is in
question, and a 600 × 675 rectangle passes both. R6 said the judge cannot
un-read its own arithmetic; this is the mechanical version.

> **Proposed addition to §4.2:** a sanity gate on a located feature must be
> computed from data the locating step did **not** use — a residual against an
> independent estimate, a second strategy's answer, or the source pixels the
> mask excluded. And **print every strategy's answer for every subject**, not
> only the chosen one: `_jq41disc.mjs` prints three fits per file in one table,
> and the three rows that disagreed by 40 % were the three broken files.

### S5. A dimension can PASS and the coin still be wrong in the same place

D5-band-reverse passes at −0.10 units. The legend is nevertheless less than
half the height it should be, spans 134° where the coin spans ≈170°, and leaves
a bare gutter three units wide that the coin does not have. One number, a real
gate, honestly met, on a feature that is plainly wrong — because the dimension
was specified as a *radius* and the error is a *size*.

This is §2's complaint ("a subject could pass every phase it was given and
still be bad") reappearing one level down, inside a dimension that exists.

> **Proposed edit to §3's D5 row:** lettering carries **three** numbers per
> legend — band radius, **cap height**, and **angular span** — because a legend
> can be in the right place, at the wrong size, over the wrong arc, and any one
> of the three alone reads as a pass.

### S6. What round 4 says should NOT change

- **§4's bit-identity rule.** It found the padding rectangle. Three files, one
  R of 318.3, and the arithmetic identity was one line away.
- **§2.1's "a hand annotation is a legitimate frozen target."** Every automatic
  disc fitter in the repository failed on the 1964 plate; a seed read off a
  50 px ladder by eye, refined by an outermost-edge walk, controls to 0.58 % on
  the dime and 0.18 % on `quarter-rev-3`.
- **§8's refusal to relax a gate**, tested a fifth time. D2's 0.97 was round
  2's, it was inconvenient, and the honest move was to publish 0.8431 against
  it and freeze nothing.
- **§1.1's "retract beside, never rewrite."** Used twice this round, both times
  against numbers I would have preferred to keep.
