# Nickel — gates, and where each one comes from (round 0)

Written 2026-08-14 at commit `5c1aeb1`, subject `src/art/coins.js`
sha256 `565d70716e429ca8…`.

**A disclosure I owe first, because §3 says a gate is stated before measuring
and a reader is entitled to check that claim rather than take it.** This file
was written *after* the round's measurements were taken, and it would be a lie
to present it as the pre-registration `quarter-gates.md` was. What is true, and
what makes the round still worth something, is narrower and checkable:

- **Not one gate below is a number I chose.** Every one is either §3's typical
  gate, or the identical gate `quarter-gates.md` stated before its own values
  existed, or a gate written into an instrument's header on the quarter in an
  earlier round, or a threshold derived from a **reference photograph** before
  our own value was computed. Each row names which.
- Where a value has no pre-existing gate — D6 under its revised metric, D5-cap
  on this coin, D5-presence — the row says **"baseline, no gate"** and the
  verdict is `UNMEASURED`-equivalent rather than a pass I invented.
- §8 forbids relaxing a gate to fit a result. Nothing here is relaxed; two
  rows (D4-icon, D7) are recorded as misses that I could have argued away and
  did not.

The honest process note is in `nickel-r0.md` §9 and is proposed as a spec edit:
**the gates file must be written and committed before the first measurement, or
the round is a self-assessment.**

## Frozen artefacts these gates are scored against

| kind | file | sha256 (first 16) | provenance |
|---|---|---|---|
| subject | `src/art/coins.js` | `565d70716e429ca8` | the art under test, untouched all round |
| target | `coloringbook/_headmask-nickel.json` | `58eaa016e0481a8f` | REUSED, frozen v1.55.0 from Schlag's model, **before** the art it scores moved |
| target | `coloringbook/_rvtarget.json` | `034bcb0ab7b27234` | REUSED, frozen by the reverses pass; nickel entry carries **three** independent column counts |
| registration | `coloringbook/_nkicp.json` | `4b4d703d458f4769` | REUSED |
| registration | `coloringbook/_nkreg.json` | `5b2bdff97b3677fb` | REUSED |
| target (new) | `coloringbook/judge/_jn1discs.json` | `fb5e43261ade106c` | the nine disc fits, drawn on their own sources and looked at before any radius was quoted |
| reference | `ref/nickel-obv.jpg` | `87744e23c452670e` | 2004-P, p95 disc residual 0.78 % of R |
| reference | `ref/nickel-obv-3.png` | `432900bcdadf21af` | **Schlag's plaster model**, alpha matte; no disc (§11.2) |
| reference | `ref/nickel-obv-4.jpg` | `baf36e9c361672de` | 1988, **p95 62 % of R — REJECTED for anything geometric** |
| reference | `ref/nickel-obv-5.JPG` | `98844ad0e718b076` | 1945-P, p95 0.15 % of R |
| reference | `ref/nickel-obv-proof.png` | `fe61e366883e9021` | 1968-S proof — **the left half of `nickel-proof-both.jpg`** (§1 of the round report) |
| reference | `ref/nickel-proof-both.jpg` | `a822706160b92b63` | 1968-S proof, both faces on one plate |
| reference | `ref/nickel-rev.jpg` | `a1791666398dc2e7` | p95 0.80 % of R |
| reference | `ref/nickel-rev-2.png` | `697bfb228cc6ce06` | p95 0.47 % of R — the frame reference, reverse |
| reference | `ref/nickel-rev-proof.png` | `d323c18ceed592bc` | 1968-S proof — **the right half of `nickel-proof-both.jpg`** |

Eval libraries, all hashed, none edited this round:
`_jqgeom.mjs 38e0eef4…`, `_jq8contain-v2.mjs 512f61d5…`, `_jq9well.mjs d07d6150…`,
`_jq67edge.mjs 419c4666…`, `_jq10tier-v2.mjs 6aca7466…`, `_jq43seg.mjs 98a6ad0c…`,
`_jq20indep.mjs 80aec1aa…`, `_jq41disc.mjs 5c6a81d8…`, `_nkeval.mjs 6bd0ec90…`,
`_nkparts.mjs 3fb1f6d6…`, `_rvnorm.mjs 90edc1eb…`, `_rvscore.mjs d5db0bfc…`,
`_rvlib2.mjs 1766e318…`, `_x6lib.mjs f5339d0f…`, `_x6dark.mjs 56e7c944…`.

New instruments written this round (all `_jn*`, all in `coloringbook/judge/`):
`_jn1disc 3ac0b403…`, `_jn1over 235e247a…`, `_jn2indep accdee9e…`,
`_jn3unwrap 24c0dae3…`, `_jn4band c33f41fb…`, `_jn5rim aae42178…`,
`_jn6iou 6e756627…`, `_jn8tier 378215ad…`, `_jn9d13 9c04e2c8…`,
`_jn10hf 335910d9…`, `_jn11look 7240c1fe…`, `_jn12seg 7977eefd…`,
`_jn13d6 e44fd203…`.

## Gates

| # | dimension | side | metric | GATE | where the gate comes from |
|---|---|---|---|---|---|
| D1 | obverse silhouette | obv | region IoU vs `_headmask-nickel.json`, **locus `v ≤ 0.33`** (frozen with the target), 1024² grid, ours = HEAD ∪ bare neck (§11.5) | **≥ 0.95** | §3 typical; identical to `quarter-gates.md` D1 |
| D2 | reverse motif silhouette | rev | freeze first: min pairwise device IoU across the threshold sweep, then two independent references | **≥ 0.97 self, ≥ 0.95 cross**, then motif IoU ≥ 0.95 | round 2 on the quarter (`_jq21stab.mjs` header), inherited unchanged |
| D3 | interior tone | both | mean \|Δratio\| over a frozen patch set, cheek-normalised | **≤ ½ the flat-drawing floor** | §3 typical. **The nickel has no frozen patch set**, so this cannot be scored |
| D4 | structural rhythm | rev | element count vs `_rvtarget.json`; centres as fractions of the element's own span | **count error 0; mean ≤ 0.15 gaps; worst ≤ 0.30** | §3 typical / §15.2, identical to `quarter-gates.md` D4 |
| D4 | structural rhythm | obv | — | the Jefferson obverse carries no repeated structural element | decided on the evidence |
| D5-band | lettering, radius | both | legend band inner radius, ours vs the **references'** high-pass band | **±1.5 viewBox units** | `quarter-gates.md` D5, stated before its own value |
| D5-cap | lettering, size | both | cap height, ours (0.72 × font size) vs the references' band width | **±15 %** | round 4's quarter brief, stated before its own value |
| D5-HF | lettering, texture | both | along-band HF energy, ours ÷ reference at the same device pixel count, at the **frozen radii below** | **≤ 1.5×, one-sided** | §3 typical (HF ≤ 1.5×) |
| D5-presence | lettering | both | does our drawing emit a legend at the tiers where the **reference reduced to the same device pixel count still resolves separated letter-marks** | **baseline, NO GATE** — reported as a measured fact | new this round |
| D5-rim | the field circle | both | `EDGE.nickel.field` vs the **coin's own measured rim seat** | **±1.0 viewBox unit** | round 4's quarter brief D5-rim, stated there before any nickel value existed |
| D6 | edge quality | both | **width-variation ratio** per mark; fraction of drawn length carried by ratio-1.000 marks | **baseline, NO GATE** — must not rise in a later round; any ratio-1.000 mark defended in writing | §3 as revised by Appendix P1 |
| D7 | curve quality | both | max knot turn on **fitted contours only**; authored polygons declare their corners | **0 knots > 75° on fitted contours** | §3 as revised by Appendix P2 |
| D8 | containment | both | % of drawn path length outside `EDGE.nickel.field[tier]`, **and deepest breach in units** | **0.00 %, every tier**; depth exempt below 0.01 units (`n2()`'s quantum) | §3 typical + Appendix Q3, both pre-existing |
| D9 | well-formedness | both | `undefined`/`NaN`/`Infinity`/`null`/empty attribute over 180 renders | **0** | §3, blocking |
| D10 | tier behaviour | both | boundary d(ink) vs the within-tier p90, **swept 26…200** so the legend switches are inside the window | **≤ 4× p90**, numerator printed absolute | `quarter-gates.md` D10 + Appendix R2 |
| D11 | discriminability | both | `_x6lib` MAD, icon tier, equal width; **plus** the §17 set ratio | **baseline** for the coin; set gate **rev-min ≥ 3× obv-min**, `ESCALATE` until met | §3 / §6.2 |
| D12 | looked at | both | the judge reads the render at 26/44/84/190 px at the real device pixel count, **with a control rendered and read first** | **must have happened** | §3 / Appendix Q5 |
| D13 | device against field | both | mean/field and ink fraction, ours vs the photograph reduced to the same device pixel count, at RAD 40 **and** RAD 33 | **\|Δ mean/field\| ≤ 0.05 at each tier** | §3 as added by Appendix P3, which states the number |

## Frozen loci, as literals (§6.1)

None of these is computed from `src/art/coins.js`.

```
D1        v <= 0.33 in disc coordinates (_nkeval.VCUT), 1024^2 grid.
D2        r <= 0.862 R on a 700^2 disc-normalised grid; motif = the connected
          component of {grey >= T} containing the centre; T = Tv +- 15 step 5,
          Tv the histogram valley floor OF THE PHOTOGRAPH.
D4        count sector: the portico band, Y 46.0..56.0, X 34..66 (_rvscore's
          nickel SPEC, frozen by the reverses pass).
D5-band   angular sectors, read off the polar unwraps of the REFERENCES:
            reverse top    E PLURIBUS UNUM           225..315 deg
            reverse bottom UNITED STATES OF AMERICA   30..150 deg
            obverse left   IN GOD WE TRUST           140..210 deg
            obverse right  LIBERTY                   318..352 deg
          radial search window r 33..46, step 0.05, angular high-pass sigma 3.0 deg.
D5-HF     r = 40.00 (reverse) and r = 40.05 (obverse) — the MID-RADIUS of the
          band the references themselves show, written as literals in
          _jn10hf.mjs, with a reference-invariance test asserting every
          reference-side number is bit-identical across two revisions of our art.
D5-rim    rim seat = the innermost radius in r 42.0..46.5 at which the
          along-angle MEAN grey falls more than 25 levels below the field level,
          the field level being the median mean over r 41.0..43.0.
D8        EDGE.nickel.field[tier], with the full candidate circle set printed.
D10       sizes 26..200 step 2, at each size's real device pixel count.
D11       icon tier, 26 px, all coins at equal width, 64^2 grid.
D13       disc interior r < 40 (whole) and r < 33 (inside every legend, §22.8).
```

## Instrument sanity (§4) — what each one had to survive

| instrument | test | result |
|---|---|---|
| `_jn1disc` / `_jq41disc` | §4.2: print every strategy's fit for every file | 3 of 9 flagged AMBIGUOUS; `nickel-obv-4.jpg` visibly wrong in the overlay and rejected |
| `_jn1over` | §4.3: the fit must be **drawn** | found that `_jq41disc.mjs`'s own overlay draws **NaN** circles — see `nickel-r0.md` §2 |
| `_jn2indep` | §4: two bit-identical answers from two different inputs is not agreement | 7 bit-identical `rawNCC` rows, all explained by one finding |
| `_jn4band` | §4.1 bounds printed; §4.3 overlay | **FAILED its own overlay** — see `nickel-r0.md` §3. Superseded by `_jn5rim`, kept unedited |
| `_jn5rim` | §4.3 overlay on two references | agrees with the picture on `nickel-rev-2`; **disagrees on `nickel-obv-5`**, which is therefore not used |
| `_jn6iou` | cx +1 / cy +1 / s ×1.03 / s ×0.978 | 0.98946 → 0.95506 / 0.96528 / 0.95186 / 0.96453 — four different answers, none bit-identical |
| `_jn8tier` | regression: `ID=quarter` must reproduce the quarter's published 3.4× / 1.7× | reproduced exactly |
| `_jn9d13` | §22.1: recovered field must be the palette's own grey | asserted per render; **two RAD-33 rows recovered 210 and 180, reported as bug reports and not used** |
| `_jn10hf` | §6.1 reference-invariance across two revisions of our art | **PASS** — every reference-side number bit-identical |
| `_jn12seg` | §4.1 sweep bounds + monotone-area check; §4.3 overlay | area monotone on 2 of 3 → reported as bounds, not values |
| `_jn13d6` | ranks against the dime, §14's named instance | dime 24.9 %/35.2 % vs nickel 11.7 %/15.9 % — it ranks |
| `_jq8contain-v2` | its own SELFTEST and the printed candidate set | candidates `47(blank,rejected) 40.5(fill) 40.5(ring)` on every nickel row |
| `_jq9well` | `RESPONSE=1` injects `undefined` | (inherited; the live sweep returns 0/180) |
| `_x6check` | all 32 palette colours through the raster path | exact; field recovers as 212 / 148 |
