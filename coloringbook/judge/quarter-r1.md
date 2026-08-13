# Quarter — round 1 (judge)

2026-08-13. Subject `src/art/coins.js` at `0b9e5303…` (working tree, dirty,
uncommitted). Round-0 baseline recovered from `git show HEAD:src/art/coins.js`
= `782c914f…`, which matches the `subject_sha256` round 0 recorded, so the
before/after really is before and after.

---

## 0. Hash verification (§1)

**34 of 34 frozen artefacts byte-identical. The round is not void.**

- 9 targets (3 head masks, the tone patch set, `_rvtarget.json`, `_qtreg.json`,
  3 references) — all match.
- 25 eval libraries — all match, including `_jq8contain.mjs` itself, which is
  the file this round is about.
- `quarter-gates.md` — `6949523209c142e5…`, matches. The gates this round is
  scored against are the ones written before round 0's first value existed.
- The subject changed, which is the point.

The specialist edited exactly one file. `git status --porcelain` shows
`M src/art/coins.js` and nothing else.

---

## 1. The `_jq8contain` challenge — UPHELD IN FULL

The specialist is right, and it is right for exactly the reason it gave.

`fieldRadius()` returned the **first** centred circle over r 35 in document
order. On the quarter and the dime the blank is a reeded `<path>`, so the first
such circle really is the field circle and v1 was correct. On the penny and the
nickel the blank **is** `<circle cx="50" cy="50" r="47">`, emitted first — so
those two coins were scored against a circle 6.5 units larger than the one they
are drawn inside.

I enumerated every centred circle over r 35 across 5 coins × 2 sides × 9 sizes.
The complete candidate set is:

```
quarter/dime   40.5(fill) 40.5(ring)          | 41 41 | 42.5 42.5
nickel/penny   47(BLANK)  40.5(fill) 40.5(ring) | ...
```

No motif anywhere draws a centred circle over r 35. So "the smallest
qualifying circle" and "not the blank" pick the same circle, and v2 checks
both and throws if they ever disagree.

### The part that is mine to own

**The tell was printed in round 0's own console output and I did not read it.**
v1 printed `% outside field` and `% outside disc` (the latter hardcoded at 47)
side by side. On exactly the penny and the nickel those two columns came out
**bit-identical**. §4 of the judge spec says, in as many words:

> Two bit-identical answers from two different inputs is not agreement. Both
> times that happened, the value was a search bound.

I wrote that sentence into the round-0 critique and then failed to apply it to
my own instrument in the same session. The instrument had a §4 failure
signature visible on its own stdout.

### What it does to round 0's history

Round 0's entry in `quarter-history.jsonl` is **not rewritten**. A correction
entry is appended beside it, so the history shows what was believed and then
what was retracted:

| coin/side | round 0 published | correct value | verdict was | verdict is |
|---|---|---|---|---|
| penny obverse | 0.0000% PASS | 3.1778% mid, 7.9333% at 76px | PASS | **FAIL** |
| nickel obverse | 0.0000% PASS | 8.0928% mid, 3.7634% at 76px | PASS | **FAIL** |
| nickel reverse | 0.0000% PASS | 0.0424% mid, depth 0.6057 | PASS | **FAIL** |
| quarter, dime, penny reverse | — | unaffected | — | — |

Every figure the specialist quoted, I re-derived and confirmed to four decimal
places, including "the nickel's `HEAD` itself reaching 40.640 before any
offset" (40.6398).

`_jq8contain.mjs` v1 is **retired, not deleted and not edited** — it keeps its
round-0 hash so the history is auditable. `_jq8contain-v2.mjs` supersedes it.

### A second fault, which is mine and not the specialist's

D8's metric — "% of drawn path length outside the field circle", gate 0.00% —
has **no depth term, and therefore cannot rank**. Decomposing the two obverse
failures:

| | fraction outside | deepest breach | fraction deeper than 0.01 units |
|---|---|---|---|
| nickel obverse @44px | 8.0928% | **1.4698 units** | 2.7972% |
| penny obverse @76px | 7.9333% | **0.0038 units** | **0.0000%** |

The penny's entire 7.93% is the shoulder drape's closing arc
`A 41 41 0 0 0 76.63 81.73`, whose endpoints are authored to two decimal places
and land at r 41.00285 — **0.003 viewBox units, 0.0025 device pixels at 84px**,
outside a circle of radius 41. The quarter reverse's real breach was 1.097
units. One number called both a FAIL, at the same severity.

That is the same defect I flagged in D6 in round 0 ("it cannot rank, so it
cannot route"), in a dimension I had passed as healthy.

**I am not relaxing the gate this round.** The penny obverse and the nickel
obverse are both recorded as **FAIL against the gate as stated**, because the
gate was stated before the values existed and §8 forbids re-writing a verdict
to fit a result I have already seen. v2 reports the depth partition **beside**
the fraction, unchanged, as evidence — and §7 below proposes the re-derivation
for round 2, with the derivation written down first.

---

## 2. What the round actually did

**20 of 180 renders changed**, and I confirmed the partition myself:

- reverse only; `mid` and `full` only; quarter, dime and nickel only
- **every obverse render is byte-identical**, and every icon render
- **path data (`d=`) is byte-identical in all 90 renders** — only the wrapping
  `translate()` on the lit copy moved (quarter reverse 54px: `-1.7` → `-0.81`)

That is a stronger regression proof than re-measuring: an instrument fed a
byte-identical input cannot return a different number. It settles D1, D3,
D3-signtest, D4o, D5-obverse, D10-obverse and D13-obverse without argument, and
it settles D6 and D7 on both sides, since both read only path data.

### D8, re-derived with the corrected instrument

| coin / side | round 0 | round 1 | verdict |
|---|---|---|---|
| quarter obverse | 0.0000% | 0.0000% | PASS |
| **quarter reverse** | **0.7505%** (depth 1.0968) | **0.0000%** | **PASS — target fixed** |
| dime reverse | 0.1343% (depth 0.5972) | 0.0000% | PASS |
| nickel reverse | 0.0424% (depth 0.6057) | 0.0000% | PASS |
| nickel obverse | 8.0928% (depth 1.4698) | 8.0928% | FAIL — untouched, real |
| penny obverse | 7.9333% (depth 0.0038) | 7.9333% | FAIL — untouched, sub-representational |
| penny reverse | 0.0000% | 0.0000% | PASS |

Response test on v2: eagle head moved 20 units up → quarter reverse worst
`0.0000 → 3.4446`. PASS.

---

## 3. Scorecard verdict

**The coin: FAIL.** **The round: ACCEPT.**

Nine dimension-rows fail. Four are blocked on one missing photograph.

| # | side | value | verdict |
|---|---|---|---|
| D9 | both | 0 / 180 | PASS *(blocking, clear)* |
| D8 | obv / rev | 0.0000% / 0.0000% | **PASS / PASS** |
| D1 | obv | 0.9653 | PASS |
| D1 | rev | — | N/A |
| D2 | rev | contour self-IoU 0.4705–0.6869 | **BLOCKED** |
| D3 | obv | 0.1447 | PASS |
| D3 | rev | no frozen patch set | UNMEASURED → *the judge* |
| D3-signtest | obv | 7/12 | WAIVED |
| D4 | rev | not resolvable on either reference | **BLOCKED** |
| D4 | obv | no repeated element | N/A *(was WAIVED)* |
| D5 | obv | HF 1.51× vs 1.50× at 84px; band blocked | **FAIL** |
| D5 | rev | **0 glyphs at 84px**, HF 0.00× vs ref 0.5135 | **FAIL** |
| D6 | obv / rev | 26 + 13 flags; 21.29% / 9.90% length uniform | FAIL |
| D7 | obv / rev | 102.0° / 109.1° | FAIL |
| D10 | obv | 3.4× / 1.7× | PASS |
| D10 | rev | 5.8× / 5.9× *(was 5.6 / 6.0)* | FAIL |
| D11 | both | 0 of 28 pairs moved at icon | PASS |
| D11-set | both | **1.487× vs 3.0×** | **ESCALATE** |
| D13 | obv | Δ −0.136 at icon | **FAIL** |
| D13 | rev | Δ +0.065 / +0.141 / +0.163 / +0.184 | **FAIL** |
| D12 | both | done, and it corrected the specialist | PASS |

Reclassifications under the revised §2.1, applied retrospectively and said out
loud: D2 and D4-reverse move `UNMEASURED → BLOCKED`; D4-obverse moves
`WAIVED → N/A`.

---

## 4. The D11 decision

**Not a broken gate. A costed, accepted spend.** Three reasons, in descending
order of weight.

**(1) The set's binding constraint did not move.** This is the one that
decides it, and neither the brief nor the specialist mentions it. At *both*
mid sizes the overall pairwise minimum is held by **`dime.o/quarter.o` — an
obverse pair** — at 0.0621 (44px) and 0.0605 (54px), and it is **bit-identical**
across the round. The reverse minimum sits *above* it (0.0633 / 0.0637) and
stayed above it. The number that decides whether the set is separable at all
was not touched, and could not have been: the change is reverse-only.

**(2) The locus was frozen at icon, before any value existed.** `quarter-gates.md`
D11 reads "`_x6lib` MAD, **icon tier**, all coins at equal width." At that
locus, **0 of 28 pairs moved, bit for bit**, self-distance exactly 0 and the
far-pair control 0.2571 → 0.2571. Extending the locus to mid *after* seeing the
mid numbers is precisely the abuse §6.1 exists to forbid, and I will not do it
in the direction that would let me fail a fix either.

**(3) Magnitude.** The worst single pair is `nickel.r/quarter.r`, 0.0655 →
0.0645 at 54px: **−0.0010** in a metric whose own set gate is missed by a factor
of two. Against that, the round removed up to **1.0968 viewBox units** of white
ink printed *outside the field circle* on three coins.

I re-derived every figure the specialist reported and all of them are right:
44px rev-min 0.0637→0.0633 (−0.66%), 54px 0.0645→0.0637 (−1.26%), worst pair
−1.54%.

One caveat I will not hide: the fix pays for containment by shrinking the
bevel **across the whole motif**, not only where it breached — `fitOff` reduces
one offset for the entire fragment, so the eagle's breast lost bevel to buy the
wing tip's containment. That is a genuine cost, it is what the mid-tier MAD is
detecting, and it is the reason this is recorded as a *spend* rather than as a
free win.

§6.2's two numbers, carried: **coin** — 0 of 28 pairs moved, quarter's own
pairs all bit-identical. **Set** — 1.487× against a 3.0× gate, unchanged,
**ESCALATE**, and worse at mid (1.019× at 44px, 1.052× at 54px).

---

## 5. What my eyes saw (D12)

Artefacts: `_jq-look-{obverse,reverse}-r1.png`, `_jq-big-*-r1.png`,
`_jq-r1-{quarter,dime,nickel}-reverse.png` (r0 / r1 / |difference|, nearest,
at the real device pixel count).

**The specialist's visual claim is NOT SUPPORTED as stated**, and this is the
thing I most nearly got wrong.

It reported that "the field ring, previously broken by a white sliver at about
ten o'clock, now runs unbroken." On first reading the 54px crop I believed I
saw exactly that — because I had been told it would be there.

Then I checked the paint order. **The field ring stroke is emitted at line 101
of the 106-line 54px reverse document — after the entire motif.** A white bevel
drawn underneath cannot break it, at any tier, ever.

Measured, at *device* resolution (the eye reads device pixels, not the ring's
mathematical centreline — my first probe used the wrong locus and found nothing
on either side): the darkest pixel available in the ring band, per 0.5°. The
quarter reverse at 54px goes from **31 washed-out angles of 720 to 30**, and
the lightest sample is **identical** — 197 at 223.0° in both revisions.

**Reattribution.** The light interruption a viewer reads at ten-to-eleven
o'clock is the **specular highlight arc** (white, opacity 0.26, r 43.4, drawn
last, running through the upper-left). Proof: the quarter **obverse** — which
is byte-identical between rounds and has no eagle on it — shows the same
washed-out angles with the same lightest values (197 at 223.0° at 54px; 183 at
240.5° at 84px).

**What genuinely did change, and it is real.** At 54px there was white bevel
spill on the **reeded rim, just outside the field ring**, at 200–204° (≈9.7
o'clock), reaching grey **221** against a rim median of 197. In round 1 the
maximum on that circle equals the median exactly — the spill is gone. The
obverse never had it in either revision, which is what attributes it to the
bevel rather than to the specular arc.

So: right that something was there, right that it is fixed, **wrong about the
mechanism and overstated in its effect** — and I would have inherited the false
belief if I had trusted the sentence instead of the render.

Also seen and unchanged: the eagle's wing hatching survives to 84px and dies at
54px; the reverse carries no lettering at all until 190px; at 26px both sides
are a dark blob on a pale disc, which is what D13 says numerically.

---

## 6. Instruments

**`UNTRUSTED`: none, on the quarter, as of round 1.** `_jq8contain.mjs` v1 is
**RETIRED as unsound**; it is not a live instrument any more.

Null tests (§4.1), bounds printed:

| instrument | bounds | result | null test |
|---|---|---|---|
| `_jq5letter` band finder | 20 … 46.5 | obv 25.00–35.00, rev 22.50–28.00 | interior — **not** a bound-return |
| `_jq8contain-v2` fieldRadius | selection, not a search | prints its full candidate set; throws on disagreement | SELFTEST: all five coins read 40.5 at mid |
| `_jq12ring` | 0 … 360°, 720 samples | interior; wrap-around would be reported | PASS |
| `_jq11disc` | not a search | self-distance exactly 0; far-pair control stable | PASS |

The band finder **passes** its null test and is still `BLOCKED`, which is worth
saying plainly: its degeneracy measure fails (plateau contrast 1.67 and 1.44),
and the band it locks onto — 25–35 on the obverse — is not where our legend is
(32.05–40.13). It is finding the bust edge. A non-bound answer can still be the
wrong feature, and §4.1 as written would have let that through.

Response tests re-run this round: D8-v2 (0.0000 → 3.4446), D1 (three
perturbations, three answers, none bit-identical), D3 (hairLit off → exactly
the 6 wig patches move; restored value bit-identical), D9 (0/180 live).

Tests: `npx playwright test tests/coins.spec.js tests/pawcoins.spec.js` →
**18 passed**, exit 0.

---

## 7. Routing: the next round

**Partition first (§5).**

*Blocked — route to the judge, not to a specialist:*

| dimension | acquisition needed |
|---|---|
| D2 reverse silhouette | a square-on, evenly-lit quarter reverse photograph with the device separable from the field |
| D4 reverse rhythm | the same photograph |
| D5 band half, both sides | the same photograph, plus an obverse frame good enough for a legend-band plateau |
| D3 reverse tone | **no acquisition** — the judge must freeze a reverse patch set and a normaliser. This is judge work that has simply not been done. |

*Repairable, in §5 priority order:* D8 (nickel obverse) → D5 → D6 → D7 → D10 →
D13.

D8 is nominally first, and its remaining real failure is the **nickel** obverse
— a different coin from the subject, whose `HEAD` is over the line at 40.640
*before any offset*, so bounding the light cannot fix it. That is a drawing to
re-author, not an offset to clamp, and it is not the quarter.

**So the next dispatch on this coin is D5 reverse lettering**, which is the
largest repairable failure on the subject and the one that touches a child
directly: at the 84px draw — the size the app uses when it asks a child to name
the coin — our reverse draws **zero glyphs**.

### §7 brief — filled in

```
SUBJECT      quarter, reverse
DIMENSION    D5 lettering (the HF half; the band half is BLOCKED and is NOT
             in scope — do not try to fit a band radius to the photograph)
CURRENT      84px: 0 glyphs drawn. Along-band HF energy 0.0000 against the
             photograph's 0.5135 at the same device pixel count. Ratio 0.00x.
             First glyph appears only at 190px (34 glyphs).
             Obverse for contrast: 7 glyphs at 84px, HF ratio 1.51x.
GATE         84px reverse: HF ratio in 0.30x .. 1.50x, one-sided at the top
             (undershoot is the safe side, method 22.4). The lower bound is
             new and is stated HERE, before measuring: 0.00x is not
             "safely undershooting", it is absent, and the gate as written
             could not tell those apart.
             Locus (FROZEN WITH THIS BRIEF, spec 6.1): sector 250..290 deg,
             HF evaluated at r = 38.9 viewBox units, 84px draw, device pixel
             count 84x84. Do not evaluate anywhere else.
TARGET       coloringbook/ref/quarter-rev-2.png    [READ ONLY — hashed]
EVAL         coloringbook/judge/_jq5letter.mjs     [READ ONLY — hashed]
             coloringbook/judge/_jqgeom.mjs        [READ ONLY — hashed]

MUST NOT REGRESS (current values, re-measured by the judge after you return)
  D8  quarter reverse   0.0000% outside field, EVERY tier, and max breach
                        depth 0.0000 units. Glyphs are scored by D8 as cap
                        boxes: a legend at r 36 with font-size 7 has its box
                        corners at ~39.9. Check it before you believe it fits.
  D8  quarter obverse   0.0000%          D8 dime/nickel/penny reverse 0.0000%
  D9  0 of 180 renders faulty            D1  0.9653
  D3  0.1447                             D7  reverse worst 109.1 deg (do not add a worse knot)
  D10 obverse 3.4x / 1.7x  (PASS — must stay under 4x)
  D10 reverse 5.8x / 5.9x  (already FAIL; must not get worse — adding glyphs
                            at 84px changes ink fraction across the 74->76
                            boundary, so this one is a live risk)
  D11 icon, all 28 pairs bit-identical to round 1 (the icon tier draws no
      lettering at all: if any icon pair moves, you have changed the wrong tier)
  D11 mid  44px rev-min 0.0633, 54px rev-min 0.0637, overall-min 0.0621/0.0605
  D13 reverse 84px mean/field 0.8728 (ours) — adding ink moves this TOWARD the
      reference (0.6893), which is the good direction; report what it does.

RULES
  - Never describe the coin from memory. Open coloringbook/ref/quarter-rev-2.png
    and measure. If the photograph contradicts this brief, the photograph wins
    — say so.
  - Do not edit the target or the eval libraries. They are hashed; editing
    them voids the round.
  - If you find a defect in an eval library, REPORT IT AND DO NOT FIX IT.
    Round 1's specialist did exactly that and it was the most valuable thing
    that happened in this loop.
  - Report EVERY iteration including the ones that got worse.
  - Do not report a verdict. You report what you changed and what you
    observed; the judge decides whether it passed.
```

---

## 8. Process critique — round 1

Proposals P10–P13 are written into `docs/COIN-JUDGE.md` as a clearly marked
Appendix Q. Nothing in them is in force. In short:

- **P10** — the specialist is a deliberate check on the judge, and the spec
  should say so, and say how to report an instrument fault it is forbidden to
  fix. It happened this round and the spec had no procedure for it.
- **P11** — every instrument that identifies a feature by a *rule* (rather
  than searching for it) must print the full candidate set it chose from. The
  null test does not cover selection, and that is what broke.
- **P12** — a containment-style gate needs a **depth** as well as a fraction.
  7.93% of the penny's obverse and 0.7505% of the quarter's reverse were the
  same verdict at four hundred times the severity.
- **P13** — §4.1's null test is necessary and not sufficient: the band finder
  returned an interior value that was the wrong feature. A detector must also
  report *what* it locked onto, against something independent.
- **P14** — D12 needs a control. My eye confirmed a claim that was false; the
  thing that caught it was rendering the *unchanged* side and finding the same
  artefact there.
