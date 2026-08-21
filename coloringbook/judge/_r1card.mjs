// Round 1 (lettering) — the judge's scorecard entry, and three RETRACTIONS.
//
// §1.1: "Retract beside; never rewrite." A corrected history entry sits next
// to the published one with both values and the reason. Nothing below edits an
// existing line of any *-history.jsonl; every correction is appended.
//
// The round was dispatched to fix D5-cap/span/presence. It did — and it also
// caught the judge, for the third round running, on something nobody was
// looking at: the CONVENTION for where a bottom legend's baseline sits.
//
// Run: node coloringbook/judge/_r1card.mjs   (appends)
//      DRY=1 ...                             (prints)
import { appendFileSync, readFileSync } from 'node:fs';

const HERE = new URL('.', import.meta.url).pathname;
const DATE = '2026-08-21';

// ── The retraction, verified by the judge from the code, not from the report ─
// arcText() places each glyph at radius r and rotates it by (deg + 90), or
// (deg - 90) when `rev`. For a TOP legend (centre 270) the glyphs grow away
// from the centre, so the baseline radius is the band's INNER edge. For a
// BOTTOM legend (centre 90, rev) the same construction rotates the glyph so
// its "up" points AT the centre — so the band is [r - cap, r] and the
// baseline radius is the band's OUTER edge.
//
// Three round-0 scorecards compared OUR baseline (an outer edge) against the
// REFERENCE's inner edge, and published PASS on bands that do not overlap.
const RETRACTIONS = {
  quarter: {
    dimension: 'D5-band, reverse bottom (QUARTER DOLLAR)',
    published: { ours: 35.63, target_field: 'baseline_r 37.0 (_jq4band.json)', delta: -1.37, verdict: 'PASS' },
    corrected: { ours_band: [30.4, 35.63], coin_band: [37.0, 43.7], overlap: 'NONE', verdict: 'FAIL' },
    why:
      'Our 35.63 is the OUTER edge of our band; the target’s 37.0 is the INNER edge of the coin’s. The two ' +
      'numbers are not the same quantity, so their difference was never a band error. Round 4 pinned bOff to ' +
      'hold 35.63 and recorded it as "the exact radius the round-4 target froze us at", which is how a ' +
      'convention mismatch became a frozen constant.',
    target_fault:
      '_jq4band.json labels the reverse-bottom legend baseline_r 37.0 / cap_top_r 43.7. For a legend whose ' +
      'caps point at the coin centre those labels are swapped: 43.7 is the baseline and 37.0 is the cap top. ' +
      'The TARGET FILE IS NOT EDITED (it is hashed and it is the reproducibility anchor); the mislabelling is ' +
      'recorded here and the round reads it correctly.',
  },
  nickel: {
    dimension: 'D5-band, reverse bottom (UNITED STATES OF AMERICA)',
    published: { ours: 36.35, target_field: 'coin 36.72', delta: -0.37, verdict: 'PASS' },
    corrected: { ours_band: [31.1, 36.6], coin_band: [36.72, 42.52], overlap: 'NONE', verdict: 'FAIL' },
    why: 'Same convention mismatch: ours is an outer edge, the coin’s figure is an inner edge.',
  },
  penny: {
    dimension: 'D5-band, reverse bottom (ONE CENT)',
    published: { ours_rInner: 29.77, coin_rInner: 30.9, delta: -1.13, verdict: 'PASS' },
    corrected: {
      note:
        'This row is the least wrong of the three and says so itself: it printed deltaOuter -6.38 beside the ' +
        'PASS. A 6.38-unit outer error next to a 1.13-unit inner one is the signature of two bands of ' +
        'different WIDTH being compared at one end, which is what a cap-height failure looks like from inside ' +
        'a band metric.',
      verdict: 'FAIL',
    },
  },
};

// ── D5 after the round, the judge's own re-derivation ───────────────────────
// Cap ratios are computed from the constants (cap = 0.730 x size, measured) and
// cross-checked against the emitted geometry. Spans are computed from
// arcText's own arithmetic: perGlyph = (size*advF/r) * 180/PI, span =
// perGlyph * (len - 1), which the judge reproduced exactly for the quarter
// (23 advances x 7.391 deg = 170.0 deg against the coin's ~170).
const D5 = {
  penny: { caps: [['UNITED STATES OF AMERICA', 6.6, 0.973], ['ONE CENT', 10.4, 0.974], ['IN GOD WE TRUST', 3.8, 0.921]], presence_84: '0 -> 28 glyphs' },
  nickel: { caps: [['E PLURIBUS UNUM', 5.8, 0.973], ['UNITED STATES OF AMERICA', 5.8, 0.973], ['LIBERTY', 5.7, 0.973], ['IN GOD WE TRUST', 5.7, 0.973]], presence_84: '0 -> 36 glyphs, and MONTICELLO drawn for the first time at any size' },
  dime: { caps: [['UNITED STATES OF AMERICA', 8.2, 0.973], ['ONE DIME', 8.2, 0.973], ['LIBERTY', 7.92, 0.973]], presence_84: '0 -> 28 glyphs' },
  quarter: { caps: [['UNITED STATES OF AMERICA', 6.9, 0.973], ['QUARTER DOLLAR', 6.7, 0.973]], presence_84: '34 -> 34 glyphs (already lettered; caps and spans grew)' },
};

for (const coin of ['penny', 'nickel', 'dime', 'quarter']) {
  const prev = JSON.parse(readFileSync(`${HERE}${coin}-scorecard.json`, 'utf8'));
  const round = (prev.round ?? 0) + 2; // +1 was the v1.57.0 judge round
  const entry = {
    coin,
    round,
    date: DATE,
    kind: 'specialist round — D5 lettering (cap, span, presence)',
    dimensions: [
      {
        id: 'D5-cap',
        side: 'both',
        gate: '+- 15% of the reference cap height',
        value: Object.fromEntries(D5[coin].caps.map(([n, ref, ratio]) => [n, { reference: ref, ratio_ours_over_ref: ratio }])),
        verdict: 'PASS',
        was: 'FAIL on every legend (0.40 - 0.79 of the reference)',
        model_caveat:
          'The ratio depends on which cap model is used, and the judge’s own scorecards use three different ' +
          'ones (0.71, 0.72 and 0.78 x font-size on the quarter, nickel and penny/dime respectively — a 9.9% ' +
          'spread, two thirds of the gate). The judge measured the rendered face directly: flat-topped ' +
          'capitals give cap/em 0.7400 / 0.7450 / 0.7300 at font-size 100 / 200 / 400. The specialist reported ' +
          '0.7300 "invariant, spread 0.0000"; that exact invariance DOES NOT REPRODUCE for the judge, which is ' +
          'recorded because §4 says so. It does not move the verdict: under every model in play the caps land ' +
          'between 0.96 and 0.99 of the references, well inside +-15%.',
      },
      {
        id: 'D5-span',
        side: 'both',
        gate: '+- 15% of the reference angular span',
        value: 'every arced legend within 0.1 deg of its reference span (centre-to-centre convention); +3.2% to +11.9% under the ink-span convention',
        verdict: 'PASS',
        was: 'FAIL — -53.7% to +11.0%',
        verification: 'reproduced from arcText’s own arithmetic: quarter top, 23 advances x 7.391 deg = 170.0 deg against the coin’s ~170.',
      },
      {
        id: 'D5-presence',
        side: 'both',
        gate: 'BASELINE, NO GATE — reported as a measured fact',
        value: D5[coin].presence_84,
        verdict: 'PASS (baseline)',
        note:
          'Measured by the judge directly off the emitted SVG at each coin’s own box for size 84 — the size at ' +
          'which money.js asks a child to name ONE coin with no sibling to compare against. Three of the four ' +
          'reverses were blank discs there.',
      },
      { id: 'D9', side: 'both', gate: '0 undefined/NaN', value: { renders: 150, failures: 0 }, verdict: 'PASS' },
      {
        id: 'D8',
        side: 'both',
        gate: '0.00% at every tier',
        value: 'bit-identical to the pre-round baseline: 0.0000% on 7 of 8 faces; nickel obverse 2.3714% at 0.0039 units deep (the coat arc, not lettering)',
        verdict: 'PASS',
        note: 'worst glyph-box clearance 0.5761 units (quarter reverse "R" at 84px) against the 44.07 field circle.',
      },
      {
        id: 'D11',
        side: 'both',
        gate: 'no regression | set gate >= 3.0x',
        value: { overall_min: 0.0534, reverse_min: 0.0812, set_ratio: 1.52 },
        verdict: 'PASS (tripwire)',
        note: 'every cell bit-identical — the icon tier draws no inscription, so lettering cannot move this metric by construction.',
        escalate: 'set ratio 1.52x against 3.0x, unchanged.',
      },
      {
        id: 'D12',
        side: 'both',
        gate: 'a human or the judge read the render, WITH a control',
        value: 'coloringbook/judge/_jl1look-84.png and -190.png; control = the quarter obverse, byte-identical by SHA-256',
        verdict: 'PASS',
        instrument_fault_found_and_fixed:
          '_jl1look.mjs defaulted BEFORE to an absolute path into the SHARED checkout. Once the judge applied ' +
          'the round there, "before" and "after" became the same file: the sheet showed the new legends in the ' +
          'BEFORE row and the control passed BY CONSTRUCTION, because a file is byte-identical to itself. The ' +
          'judge looked at that sheet and nearly accepted it. This is §6.1 in a new place — a CONTROL that is a ' +
          'function of whatever the tree happens to hold at run time — and it is worse than a wrong number ' +
          'because it produces a picture, and D12 is the one check that is supposed not to run on a prior. ' +
          'BEFORE is now required, with no default, and the run throws if the two revisions are byte-identical.',
      },
    ],
    retraction: RETRACTIONS[coin] || null,
    still_owed: [
      'E PLURIBUS UNUM is on the CENT reverse too (two arcs at r ~29..35, visible on _jl1grid-penny-rev-2-png.png) and we do not draw it. That is a FOURTH missing legend and nobody had listed it.',
      'FIVE CENTS is an ARC on the nickel (r ~28, centred at six o’clock); we draw it flat at (50, 74.5). Left alone this round: a shape change with no frozen target.',
      'The cent’s reverse legend reads "UNITED STATES of AMERICA" with a lowercase "of" on penny-rev-2.png; we set it all caps.',
      'INS_REST_MIN = 110 is untouched, so the secondary obverse lines (dates, second mottoes) still do not draw at the naming size. Their floors cannot be derived the same way — they have no frozen cap or band target.',
      '_jn10hf.mjs reports a per-SIDE "draws letters?" flag, so it prints ratio 0.000x for legends that were never emitted. A 0.000x from an absent legend is UNMEASURED, not a value.',
    ],
    notes:
      'Accepted. The dispatched target moved on every legend on every coin, and D8/D9/D11 are bit-identical to ' +
      'the pre-round baseline. The round ALSO caught the judge on the bottom-legend baseline convention, which ' +
      'is the third consecutive round in which the specialist corrected the judge rather than the other way ' +
      'round — the outcome §1 was written to make possible.',
  };
  const line = JSON.stringify(entry);
  if (process.env.DRY) console.log(`${coin}: round ${round} (dry, ${line.length} bytes)`);
  else {
    appendFileSync(`${HERE}${coin}-history.jsonl`, line + '\n');
    console.log(`${coin}: round ${round} appended${RETRACTIONS[coin] ? ' WITH RETRACTION' : ''}`);
  }
}
