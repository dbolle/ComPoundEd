// Round 3 (the D5 remainder) — the judge's verdict, and a RETRACTION.
//
// ACCEPTED. Three of the brief's four items were corrected by the specialist
// against the photographs, and one of those corrections retracts a claim this
// judge already PUBLISHED in v1.58.0's CHANGELOG and BACKLOG. §1.1: retract
// beside, never rewrite — the history keeps both, and the living documents are
// corrected with the retraction named.
import { appendFileSync } from 'node:fs';

const DATE = '2026-08-21';

const retraction = {
  date: DATE,
  kind: 'RETRACTION — a finding this judge published was wrong',
  published_in: 'v1.58.0 CHANGELOG and BACKLOG, and relayed as item 3 of brief-r3-lettering2.md',
  claim: 'The cent reverse reads "UNITED STATES of AMERICA" with a lowercase "of" on penny-rev-2.png; we set it all caps.',
  status: 'WRONG. No change was made to the art, and none should be.',
  evidence:
    'The round-3 specialist checked it against two references and reported it as false. The judge then looked ' +
    'directly, at a 3x crop of the top legend band of penny-rev-2.png: the O is a full round CAPITAL O with no ' +
    'x-height, and the F is a CAPITAL F whose top aligns with the O rather than rising above it as a lowercase ' +
    'f would. Both letters are simply set SMALLER than the surrounding capitals. There is no lowercase form on ' +
    'the coin.',
  how_it_happened:
    'Round 1 found it while measuring something else, reported it in a list of incidental observations, and the ' +
    'judge published it without opening the reference. That is the same failure the method names first — never ' +
    'describe a coin from memory, and a described expectation is a prior. It survived because it was plausible, ' +
    'small, and nobody had to act on it.',
  what_is_true_instead:
    'We do not reproduce the SIZE CONTRAST on OF — the coin sets those two capitals smaller than the rest of the ' +
    'legend, and arcText applies one size per call. That is a real, checkable difference and it is now the ' +
    'finding, in place of the false one.',
  also_found_by_the_judge_while_verifying:
    'The coin sets "E·PLURIBUS" with a RAISED DOT between the E and the P, visible in the same crop. The new ' +
    'code emits a plain space. Same class of item as the OF contrast: one string, checkable by a child holding ' +
    'the coin, and not yet drawn.',
};

const entries = {
  penny: {
    round: 3,
    kind: 'specialist round — D5 remainder',
    dimensions: [
      {
        id: 'D5-presence', side: 'reverse',
        value: 'E PLURIBUS / UNUM added, first drawn at box 120 (size 153); previously NEVER DRAWN at any size',
        verdict: 'PASS (baseline)',
        note:
          'A FOURTH missing legend, found by round 1 while measuring something else and never before listed. ' +
          'Verified by the judge on the emitted SVG: absent at every size before, present from size 153 after.',
      },
      {
        id: 'D5-shape', side: 'reverse',
        gate: 'the drawn form must be the form the coin uses',
        value: 'TWO STRAIGHT LINES of upright capitals, not two arcs',
        verdict: 'PASS — and the brief was WRONG',
        evidence:
          'The brief told the specialist to follow the quarter\'s two-arc pattern. Fitting a circle with a free ' +
          'centre to the ink edge returns a best radius of 1002 units — 33x the coin — with rms 1.0405 against ' +
          'the straight model\'s 1.0410, identical to four figures, while the concentric model is 1.41x worse on ' +
          'the top line and 1.76x worse on the lower. The cap edge holds y 19.40..19.65 across the whole word ' +
          'where an arc at r 30.6 would sag 3.2 units. The judge confirmed it by eye on a 3x crop: E·PLURIBUS ' +
          'runs dead level while STATES OF A curves along the rim above it. The pattern to follow was the ' +
          'dime\'s flats.',
      },
    ],
  },
  nickel: {
    round: 1,
    kind: 'specialist round — D5 remainder',
    dimensions: [
      {
        id: 'D5-shape', side: 'reverse',
        gate: 'the drawn form must be the form the coin uses',
        value: 'FIVE CENTS moved from a flat line at (50, 74.5) to an arc: baseline r 31.67, span 79.32 deg c2c, cap 5.54',
        verdict: 'PASS',
        evidence:
          'Concentric confirmed: per-glyph outer edge 30.90..31.67 over seven runs, 0.053 units of spread ' +
          'between the two whole-word runs across 86 degrees, and the polar unwrap shows cap and foot as two ' +
          'horizontal lines. Cross-checked on a second reference (nickel-rev.jpg, circulated, 231px against the ' +
          'proof\'s 476px): band 26.63..32.67, span 80.66 deg — about a unit of radius and 7% of span apart, ' +
          'inside both gates, RECORDED RATHER THAN AVERAGED.',
        the_brief_was_half_wrong:
          'It said "r ~= 28". That is the band MIDLINE (26.13..31.67 gives 28.9). Under this file\'s own ' +
          'convention a bottom-of-coin legend\'s baseline is the band\'s OUTER edge, 31.67 — the convention ' +
          'round 1 established and this judge verified from arcText. Handing 28 to arcText would have sat the ' +
          'whole legend 3.5 units too far inboard: the exact error the retraction in round 1 exists to prevent, ' +
          'nearly repeated by the judge who wrote that retraction.',
      },
    ],
  },
  quarter: {
    round: 7,
    kind: 'specialist round — D5 remainder (obverse HF investigated, no change made)',
    dimensions: [
      {
        id: 'D5-HF', side: 'obverse',
        gate: '<= 1.50x, one-sided, at the frozen locus r 38.9',
        value: 2.0089,
        verdict: 'FAIL — ESCALATE, not repairable by lettering geometry',
        finding:
          'Measured rather than tuned, which is what the brief asked for. The coin\'s own obverse band, read off ' +
          'a half-unit arc ladder on quarter-obv-2.jpg, is r 36.6..43.5 with cap 6.9 — and that 6.9 matches the ' +
          'frozen REVERSE top legend\'s cap to a tenth, which is the cross-check that the ladder read is real. ' +
          'Ours is r 36.09..40.18, cap 4.09: the baseline is right to half a unit and the CAP IS 41% SHORT.',
        the_probe_that_settles_it:
          'Drawing the coin\'s own 6.9 cap moves D5-HF at 84px from 2.0089x to 2.6300x — WORSE. A half-way 5.5 ' +
          'cap gives 2.5506x. At 190px the same change helps (1.1935x -> 1.1071x). Run on generated copies with ' +
          'src/art/coins.js untouched.',
        why:
          'Not "too many marks in the band" as the brief guessed: at 84px only LIBERTY draws (7 glyphs; the date ' +
          'and the second motto start at box 110), and at 190px with 13 glyphs the row PASSES. The movement is ' +
          'on the REFERENCE side — the photograph\'s HF at r 38.9 falls 0.6254 -> 0.1578 between the 190px and ' +
          '84px reductions because relief blurs out, while ours falls only 0.7465 -> 0.3170 because vector edges ' +
          'stay hard. We are being scored against a photograph that loses detail faster than a drawing does.',
        what_is_actually_owed:
          'D5-cap-obverse at -41%, which is currently UNMEASURED, has no frozen target anywhere (_jq4band.json ' +
          'holds only reverse legends, and its own note rules the two obverse proof plates out at +-2 to +-4.5 ' +
          'units of scale error), and which makes D5-HF at 84px worse. That is a trade to decide with both ' +
          'numbers on the table, not a fix. Freezing an obverse band target is the next judge task on this coin.',
      },
    ],
  },
};

const common = {
  date: DATE,
  verified_by_the_judge: {
    frozen_artefacts: '147 checked, 0 changed',
    attribution: '6 of 90 renders changed — penny reverse at 190/380 and nickel reverse at 84/120/190/380. Quarter, dime, buck and both obverses byte-identical at every tier.',
    D9: '150 renders clean, response test goes red',
    D8: '0.0000% on 7 of 8 faces; nickel obverse 2.3714% at 0.0039 units (the coat arc, unchanged)',
    D11: 'overall min 0.0534, reverse min 0.0797, ratio 1.49x — BIT-IDENTICAL',
    D12: 'before/after at 380px on both changed faces, control quarter obverse byte-identical by SHA-256',
  },
  instrument_fault_found_by_the_specialist_and_FIXED_by_the_judge: {
    file: '_jq8contain-v2.mjs',
    fault:
      'SELFTEST asserted rField == 40.5 at mid. v1.57.0 moved the field to 44.07, so from that release until ' +
      'today the selftest printed SELFTEST FAIL on completely clean art, on all four coins. The specialist ' +
      'reported it and did not fix it (§1.1), which is correct.',
    judge_action:
      'Fixed, because the judge owns instruments. The assertion now checks the RULE the test exists to guard ' +
      'rather than a copied number: no coin may pick the blank (r 47), the blank must be seen and REJECTED ' +
      'where it is a candidate, and all coins must agree on one radius since EDGE is one shared value. It now ' +
      'passes and prints "(blank offered and rejected)" on exactly the penny and the nickel — the two coins v1 ' +
      'got wrong. An assertion about a constant should name the constant or check the property, never copy the ' +
      'value.',
  },
  instrument_faults_reported_and_NOT_fixed: [
    'textMarks() collapses a whole flat legend to a single 0.62*size glyph box centred on the <text> anchor, so MONTICELLO, the dime\'s E PLURIBUS UNUM and now the cent\'s two lines each contribute one ~3.4-unit box rather than their true 16-56 unit extent. D8 is therefore blind to a flat legend\'s horizontal reach. Pre-existing; it does not bite here (the cent\'s true ink corner is r 33.3 against 44.07) but it would on a wide flat legend near the rim.',
    'nickel-rev-2.png has a mathematically FLAT field: every 5x5 patch on the disc interior returns MAD 0.000, so any threshold derived as k*sigma is 0 and the whole window becomes ink. The specialist floored sigma at 1.0 grey and prints a warning when the floor binds. Worth knowing for any future tone or edge instrument pointed at that reference.',
    'The specialist\'s own response test showed the cent legend\'s CAP TOP is rock stable (19.400 across k=4,5,6 and half sampling step) while its FOOT is not (24.500 -> 23.650 -> 23.600), because the relief drop shadow sits below the letters. It took the baseline from the median of clean per-glyph runs and said which edge is soft. That is the standard.',
  ],
};

for (const [coin, e] of Object.entries(entries)) {
  const line = JSON.stringify({ coin, ...e, ...common });
  appendFileSync(new URL(`./${coin}-history.jsonl`, import.meta.url).pathname, line + '\n');
  console.log(`${coin}: round ${e.round} appended`);
}
appendFileSync(new URL('./penny-history.jsonl', import.meta.url).pathname, JSON.stringify({ coin: 'penny', ...retraction }) + '\n');
console.log('penny: RETRACTION of the lowercase-"of" finding appended');
