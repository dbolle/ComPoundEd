# Quarter — judge round 0

Process: `docs/COIN-JUDGE.md`. Measurements: `docs/COIN-ART-METHOD.md`.
Gates: `coloringbook/judge/quarter-gates.md`, written before any value below
existed. Scorecard: `quarter-scorecard.json`. History: `quarter-history.jsonl`.

**Verdict: FAIL.** 5 pass, 8 fail, 2 waived.
**Nothing in `src/art/coins.js` was touched.**

```
  D9  well-formedness      0 of 180 renders faulty                     PASS   (blocking, clear)
  D8  containment          0.7505% of drawn length outside the field   FAIL   <- highest priority
  D1  obverse silhouette   IoU 0.96530 vs >= 0.95                      PASS
  D2  reverse silhouette   no target could be built                    UNMEASURED = FAIL
  D3  interior tone (obv)  0.1447 vs <= 0.1791                         PASS
  D3s tone sign test       one usable reference exists                 WAIVED
  D3r interior tone (rev)  no patch set, no normaliser                 UNMEASURED = FAIL
  D4  rhythm (rev)         no rhythm vector, count not to §15.1        UNMEASURED = FAIL
  D4o rhythm (obv)         no repeated element on this design          WAIVED
  D5  lettering            band unresolvable; HF undecided at 84px     FAIL
  D6  edge quality         39 flags, 0 defended                        FAIL
  D7  curve quality        HAIR knot at 102.0 deg vs <= 75             FAIL
  D10 tier behaviour       reverse boundary jumps 5.6x and 6.0x        FAIL
  D11 discriminability     baseline set; rev/obv 1.49x                 PASS (+ ESCALATE)
  D12 looked at            both sides, three tiers, beside the coin    PASS
```

---

## 1. What was frozen, what was reused, what had to be made

Everything scored against is hashed in the scorecard. Nothing was frozen after
a number was seen.

**Reused, and trustworthy** — all frozen by earlier passes, all unchanged:

| artefact | why it is trustworthy |
|---|---|
| `_headmask-quarter-v3.json` | frozen before the obverse art moved; the guard sweep that produced it is published (three guards spanning the measured gap agree to 0.0014R); v1 and v2 were kept and the art is scored against all three |
| `_headmask-quarter-v2/v1.json` | kept as the record of the target being wrong twice — I scored against them too (0.96072 / 0.95177) |
| `_tonepatches-quarter.json` | 13 patches, containment-checked against the frozen mask before writing |
| `_rvtarget.json` | the only frozen reverse target; its quarter entry is an EXTENTS vector and one MEDIUM-confidence count |
| `_qtreg.json` | the registrations that put the tone patches on the same anatomy in other references |

**Reused with a stated limit:** `_rvtarget.json`'s quarter COUNT says
`n: 6, confidence: MEDIUM` from one reference. That is not §15.1's standard
(count twice, on two photographs, both written down), and I did not promote it
to one.

**Had to be made:** the judge's own eval library — `_jqgeom.mjs` (SVG parse,
path flattening, transforms, knot turns, radial length) and the nine `_jq*`
scorers. `_jqgeom` is the one thing D6, D7 and D8 all rest on, so it has its
own closed-form self-test (`_jqgeomtest.mjs`, 21 assertions, all against
answers computed by hand).

**Tried to make and failed:** a frozen reverse motif mask. §2 below.

---

## 2. D2 — the reverse mask could not be built, and that is the evidence

The quarter reverse has never had a silhouette target. I tried to build one
with the method's own tools, on the frame reference `quarter-rev-2.png`
(p95 disc residual 0.15% of R — shot square on).

Route: §21.1's gradient-**energy** flood (a lit struck coin has a dark trough
on one side of a relief boundary and a bright rim on the other, so nothing
that floods through "not dark" can enclose it), with §21.3's **guard** where
the device's gradient skirt merges with the legend's, then §21.2's crest
refinement, then §2.2's plateau test on the thing actually frozen.

The guard was placed off the labelled grid in `_jq-rev-ref.png`, not from
memory: the wing tip is at X 12.5 / 87.5, i.e. r = 0.80 R; the UNITED and
AMERICA letters at the same angle are at r 0.85–0.90 R; the wreath, the lowest
thing in the device, meets at (50, 79.5), r = 0.63 R. So the main guard sits at
0.835 R and a tighter one at 0.70 R in the bottom sector.

**There is no plateau.**

```
guard 0.835   T 2.5   3.0    3.5    4.0    4.5    5.0
eqR / R      0.756  0.656  0.590  0.505  0.458  0.226
components      6     10     24     32     38     47
```

108% drift, and the mask fragments as the threshold rises — the flood eats
into the device along the low-gradient channels between feather cuts. Filling
holes changes nothing (the fragmentation is not holes).

§21.2's answer to a drifting flood is that the *contour*, pushed to the ridge
crest, stops depending on T. It does not here:

```
contour agreement after crest refinement, IoU between thresholds
  T 2.5 vs 3.0   0.6260
  T 3.0 vs 3.5   0.6869
  T 2.5 vs 3.5   0.4705      (the quarter obverse's equivalent: 0.112% of diameter)
```

A target that disagrees with itself by 0.3 of IoU cannot measure art to 0.05.
**D2 is UNMEASURED, which fails.** The failed attempt is kept (`_jq2seg.mjs`,
`_jq2stab.mjs`) because the failure is the finding.

What it would take: a better reverse reference — a cameo proof of the
1932–1998 reverse, or, better, **the sculptor's model** (§11.1's route, which
is exactly what rescued the nickel: check the alpha channel before the grey
one). That is outside a specialist's brief and outside mine; it is an
acquisition.

**What can be said meanwhile.** `_rvtarget.json`'s frozen EXTENTS vector gives
eleven numbers and our eagle hits them to **mean 0.47 viewBox units, worst
1.10** — wing span 12.49/87.51 against 12/88, wing lowest point 64.00 against
64, head and arrows within a unit. The eagle's envelope is right. What is
wrong is inside it, and §5 below is where the eye says so.

---

## 3. D8 — the highest-priority failure, and it is small and specific

Gate 0.00%. Measured, on the shipped SVG, every tier, both sides:

```
side      size tier  rField   drawn len   % outside field   max radius
obverse   all  all             432-1384      0.0000%          40.15
reverse    26,38 icon  42.5       872.1      0.0000%          41.60
reverse    44,54 mid   40.5      1289.7      0.7505%          41.60
reverse    76    full  41.0      3291.3      0.1629%          41.40
reverse    84    full  41.0      3291.3      0.1161%          41.21
reverse  120,190,380  41.0      3291-3921    0.0000%          40.11-40.67
```

The offender is one mark: the **white lit copy of the eagle's wing**. `struck()`
draws the motif three times a hair apart, and the lit copy is translated by
`(-o, -o)` where `o = reliefOff(boxW)` has a device-pixel floor — so as the box
shrinks, the offset grows *in viewBox units*. The base wing tip sits at r 38.9,
1.6 units inside the field circle; at mid the offset carries its copy to 41.60
against a field circle at 40.5.

Three things make this the right first dispatch:

1. It is the second item in §5's priority order and the first that fails.
2. `coins.js` asserts the opposite in its own comment — *"Nothing the coin draws
   reaches past the field circle, so the contour never needs redrawing on top"* —
   which is §22.3 again: **do not trust a comment in your own source.**
3. The same mechanism is live on the **dime reverse** (0.1343%). The fix is
   shared code, so the brief has to name what must not move on the dime.

---

## 4. Instrument sanity — every response test, and the two that are worth reading

| dimension | perturbation | response |
|---|---|---|
| D1 | cx +1 / cy +1 / s ×1.03 | 0.96530 → 0.93852 / 0.94254 / 0.93678 — three different answers, none bit-identical (§4's corollary) |
| D3 | palette swatch round-trip; `hairLit` off; cx +2; restore | all 8 colours exact; 0.1447 → 0.1696 with **exactly the six wig patches moving**; → 0.2694; restore bit-identical |
| D5 | synthetic ring of angular stripes at r 38..42 | found 38.00..42.00, not at a bound; HF stripes 1.92 vs flat 0.00 |
| D6 | run on the **dime**, §14's known instance | jaw line flagged — and so is every other stroke mark |
| D7 | closed-form: square = 90.000°, relative = absolute, `C` not dropped, arc length = 2πr | all pass |
| D8 | eagle head moved 20 units up | 0.7505% → 4.6538% |
| D9 | `undefined` interpolated into one attribute | 0/180 → 144/180, and it names the render |
| D10 | `EDGE.quarter.field.mid` 40.5 → 34.0 | boundary jump 3.4× → 18.0× |
| D11 | `_x6sens` + `_x6check` | the 7 pairs involving the changed art move, the other 21 are bit-identical; field recovers as 212/148 |

**No instrument failed its response test.** Two produced results that block
anyway, and the distinction matters:

- **D6's checker works and is degenerate.** It flags the documented dime case —
  and it flags 100% of stroke marks on every coin, because a portrait's relief
  necessarily sits on top of the head, which is a region. A test that returns
  "yes" for everything is not measuring; §14.1 needs rewriting (§7 below).
- **D5's band finder works on a synthetic target and cannot read this coin.**
  Plateau contrast is 1.67 (obverse) and 1.44 (reverse) — no
  shoulder-plateau-shoulder. With the window at r 30..46 it returned its own
  inner bound on both sides, which §23.6 says to treat as a failure report;
  widening the window moved the answer, which proves it was choosing between
  features rather than finding one.

I also re-ran §20.1's flat-swatch check on the tone path before quoting any
ratio: all eight quarter palette colours come back as their own greys
(field 212, motif 149, ink 43…), and the tier sampler recovers field = **212**
at every size — the palette's own value, per §22.1's rule that anything else is
a bug report.

---

## 5. D12 — what I saw that no number caught

Sheets: `_jq-look-obverse.png`, `_jq-look-reverse.png` (ours at 84/54/26 px at
the real device pixel count, nearest-upscaled, with the photograph reduced to
the same pixels underneath), `_jq-big-obverse.png`, `_jq-big-reverse.png`.

**The reverse does not read as a bird.** At 380px the head is a small circle
with a beak stub, sitting on a rectangular slab cut with a grid of straight
lines that reads as a radiator grille; the wings are two thin swept fans of
straight parallel hatching; the tail is a broad pale skirt. Every envelope
number is right to half a unit. The drawing is still not the object, and
nothing in the rubric can say so — D2's IoU would have, and D2 has no target.

**The arrow bundle is drawn with a flared wedge at both ends**, so it reads as
a double-headed arrow. The frozen target says heads LEFT (tapered at X 31),
fletching RIGHT (squared at X 70). The extents check passes because both ends
are at the right X. This is the shoulder-blob failure mode again (§24): the
number was clipped to the thing that was right.

**At 84 and 54px the reverse is an abstract symbol** — two dark triangles, a
vertical bar, a horizontal bar, an open bowl. The photograph at those same
pixels is a bird with hanging wings. This is the *inverse* of §22.7's eagle
lesson: there the small tiers looked like a regression and the reference proved
the eye wrong; here the eye and the reference agree.

**The 102° knot is visible.** The lower back of the bust has a hard angular
kink where the bow meets the truncation. D7 found it mechanically at screen
(75.7, 77.4); at 380px it is a corner the coin does not have.

**The wig reads as a louvre.** Five long parallel diagonal strokes of near-equal
length, running edge to edge. The coin's wig is short overlapping rolls. The
queue and the bow are two clusters of four short parallel strokes that read as
tally marks. All of this is *inside* the frozen tone patches and scores 0.1447,
which is a PASS — the patch metric measures level, and this is texture.

**At 26px the obverse is too dark.** Ours is a solid dark head-shaped blob on a
pale disc; the coin is a soft mottle where the head is barely darker than the
field. Measured: mean/field 0.638 against 0.774, ink 0.802 against 0.634. That
may be the right trade for legibility at a wallet chip — but nobody has made it
deliberately, and it is not in any gate.

**Where my eye was wrong, and I say so.** At 84px I read our device as darker
than the field and the coin's as lighter. The numbers say the opposite on the
reverse: ours mean/field 0.838 against the coin's 0.689, ink 0.567 against
0.767 — our reverse is too *light* and too sparse. What I was reacting to is
contrast structure, not level. The caveat on the number is real too: this
reference's bare-field normaliser is the weakest of the four coins because the
eagle covers most of the disc.

---

## 6. Routing plan

Priority order from §5 of the process, restricted to what actually fails:

```
  1. D8  containment          FAIL 0.7505%      -> DISPATCH NOW (brief below)
  2. D2  reverse silhouette   UNMEASURED        -> BLOCKED ON AN ACQUISITION, not a specialist.
                                                   A better reverse reference or Flanagan's model.
                                                   Judge's job, not a repair. Escalated.
  3. D4  rhythm (reverse)     UNMEASURED        -> partially blocked on the same reference.
                                                   A count to §15.1's standard may still be
                                                   possible off quarter-rev.jpg at higher zoom.
  4. D5  lettering            FAIL              -> band half blocked on the same reference;
                                                   the HF half needs a decision about our
                                                   LIBERTY's outer extent, not a repair.
  5. D6  edge quality         FAIL              -> instrument needs rewriting first (§7).
                                                   Do not dispatch against a 100%-flag detector.
  6. D7  curve quality        FAIL 102.0 deg    -> one knot on HAIR, cheap, and D12 confirms it
                                                   is visible. Good second dispatch.
  7. D10 tier behaviour       FAIL 5.6x / 6.0x  -> reverse only; likely the same relief-offset
                                                   and detail-gating mechanism as D8.
```

Three of the seven are blocked on evidence rather than on art. That is the
honest shape of this coin's round 0 and it is worth saying loudly: **the
quarter reverse's problem is that nobody can measure it, not that nobody has
drawn it.**

---

## 7. SPECIALIST BRIEF — dispatch this one

```
SUBJECT      quarter, reverse (and the dime reverse, which shares the mechanism)
DIMENSION    D8 containment
CURRENT      0.7505% of drawn path length outside the field circle at mid
             (44 and 54px); 0.1629% at 76px; 0.1161% at 84px; 0.0000% at
             icon and at 120px and above. Max radius 41.60 against a field
             circle at 40.5.
             The offender is the WHITE lit copy of the eagle wing emitted by
             struck() at transform="translate(-o -o)". The base wing tip is at
             r 38.9; reliefOff(boxW) has a device-pixel floor, so the offset
             GROWS in viewBox units as the box shrinks and carries the lit
             copy over the field circle at the small tiers.
             The dime reverse has the same defect at 0.1343%.
GATE         0.00% of drawn path length outside EDGE[id].field[tier], every
             tier, both sides, on the quarter AND on the dime.
TARGET       coloringbook/_rvtarget.json            [READ ONLY — hashed]
             coloringbook/_headmask-quarter-v3.json [READ ONLY — hashed]
             coloringbook/_tonepatches-quarter.json [READ ONLY — hashed]
EVAL         coloringbook/judge/_jq8contain.mjs     [READ ONLY — hashed]
             coloringbook/judge/_jqgeom.mjs         [READ ONLY — hashed]
             (run: node coloringbook/judge/_jq8contain.mjs)

MUST NOT REGRESS (current values, ALL re-measured by the judge after you return)
  D1  obverse IoU        0.96530   (v2 mask 0.96072, v1 mask 0.95177)
  D2  reverse envelope   mean |d| 0.47 units, worst 1.10, vs _rvtarget EXTENTS
                         — in particular wing span 12.49/87.51 and wing
                         lowest point Y 64.00. If you shrink the wing to make
                         it fit, you have traded a gate for a gate and I will
                         record it as a regression.
  D3  obverse tone       0.1447 mean |dratio|, worst 0.482 (lips)
  D7  worst knot turn    HEAD 71.0 deg (do not make it worse; HAIR's 102.0 is
                         a KNOWN failure and is NOT yours to fix this round)
  D9  well-formedness    0 of 180
  D10 tier jumps         obverse 3.4x and 1.7x; reverse 5.6x and 6.0x
                         (the reverse pair already fails; do not worsen it)
  D11 discriminability   overall min 0.0534 (nickel.o/dime.o)
                         reverse min 0.0794 (dime.r/quarter.r)
                         quarter.o/dime.o 0.0657, quarter.r/nickel.r 0.0979
                         rev/obv ratio 1.49x
                         NOTE: _x6mat measures the ICON tier, where this
                         defect does not occur. Per §24.8, ALSO report the
                         matrix at mid and full, which is where you are
                         working.
  tests                  npx playwright test tests/coins.spec.js
                         tests/pawcoins.spec.js -> 18 passed

RULES
  - Never describe the coin from memory. Open the reference and measure.
    If the photograph contradicts this brief, the photograph wins — say so.
  - Do not edit the targets or the eval libraries. They are hashed; editing
    them voids the round.
  - Report EVERY iteration including the ones that got worse.
  - Do not report a verdict. You report what you changed and what you
    observed; the judge decides whether it passed.

WHAT THE JUDGE ALREADY KNOWS, so you do not spend the round rediscovering it
  - The obvious fix — shrink the wing — spends D2's envelope, which is the one
    reverse number that currently passes anything. The wing tip is where the
    coin puts it.
  - The other obvious fix — clip — is forbidden: no <defs>, no ids, no clip
    paths anywhere in this file (§8).
  - reliefOff(boxW) is shared by every struck motif on every coin. Changing it
    changes four reverses; the identity sweep and the well-formedness sweep
    both have to be run (§21.8), not just the containment one.
  - §24.4 is the precedent: a decoration that does not move with the shape it
    decorates. The lit copy is a decoration of the wing.
```

---

## 8. Verification of this round

- `npx playwright test tests/coins.spec.js tests/pawcoins.spec.js` — **18
  passed**, exit 0 (written to a file, exit code echoed, never piped through
  `tail`).
- `node coloringbook/judge/_jqgeomtest.mjs` — 21/21 closed-form assertions.
- One browser at a time; everything else is `sharp`.
- `src/art/coins.js` is byte-identical to commit `0ffbaad`
  (sha256 `782c914f…`), verified after every generated-copy response test —
  each of those writes its mutated copy to a temp directory, never to the
  repo.
