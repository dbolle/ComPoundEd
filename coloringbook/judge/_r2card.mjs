// Round 2 (D13, dime reverse) — the judge's verdict.
//
// ACCEPTED AS A COSTED TRADE, and D13 ESCALATED. The reasoning is in the
// entry; the short version is that the accept does NOT rest on D13 moving,
// because the judge verified that D13's normaliser is measuring the
// photograph's lighting on this coin.
import { appendFileSync } from 'node:fs';

const entry = {
  coin: 'dime',
  round: 3,
  date: '2026-08-21',
  kind: 'specialist round — D13 device against field, dime reverse',
  verdict_on_the_round: 'ACCEPTED AS A COSTED TRADE, and D13 ESCALATED',
  dimensions: [
    {
      id: 'D13', side: 'reverse', gate: '|delta mean/field| <= 0.05 at each tier',
      value: { '26px': 0.1509, '44px': 0.1726, '84px': 0.1724 },
      was: { '26px': 0.1731, '44px': 0.2296, '84px': 0.2326 },
      verdict: 'FAIL — ESCALATE',
      why_escalate:
        'Improved 13% at icon and 25% at mid/full, and still 3x the gate. The gate is not reachable ' +
        'with this instrument on this reference — see instrument_bias_VERIFIED_BY_THE_JUDGE.',
    },
    {
      id: 'D11', side: 'both', gate: 'no regression vs round 0',
      value: { reverse_min: 0.0797, overall_min: 0.0534, set_ratio: 1.49 },
      was: { reverse_min: 0.0812, overall_min: 0.0534, set_ratio: 1.52 },
      verdict: 'REGRESSED 1.8% ON THE REVERSE MINIMUM — costed and accepted, not waived',
      costing:
        'The pair is nickel.r/dime.r, the closest reverse pair in the set. Also ungated but real: the ' +
        'dime OWN two faces lost 16% (0.0903 -> 0.0759). The precedent for accepting a costed D11 loss ' +
        'is the quarter round 1, where -1.54% on the worst pair was recorded as "outside the gate, ' +
        'costed, accepted" rather than reverted or silently passed — and COIN-JUDGE 6.1 lists that as ' +
        'something round 1 says should NOT change. Two things make this one acceptable on the same ' +
        'terms. (a) MAD has been documented since v1.56.0 as not shape-aware and as understating the ' +
        'reverses; a torch-and-branches against a colonnade is not 1.8% of a difference to a child. ' +
        '(b) Consistency: this judge refused to bank 1.49 -> 1.52 as progress when EDGE moved it, on ' +
        'the grounds that shared-furniture-sized movement in a suspect metric is noise. It cannot now ' +
        'treat 1.52 -> 1.49 as decisive.',
    },
    {
      id: 'D6', side: 'reverse', gate: 'fraction of drawn length at ratio 1.000 <= 0.50',
      value: { '84px': 0.2317, '190px': 0.2351 }, was: { '84px': 0.2685, '190px': 0.2720 },
      verdict: 'PASS, improved',
      note:
        'Earned the hard way mid-round: the specialist first drew a parallel-sided stem at exactly 2.00 ' +
        'units, which is a uniform-width mark, and six copies of it (two branches x three struck() ' +
        'passes) pushed D6 from 0.2685 to 0.3965. Tapered 2.6 -> 1.3 it lands better than baseline. ' +
        'Section 14 is right that a real coin has no uniform-width marks and a straight stem is no ' +
        'excuse for drawing one.',
    },
    {
      id: 'D10', side: 'reverse', gate: 'boundary jump <= 4x the within-tier p90',
      value: { boundary_42_44: '3.80x', d_ink_absolute: 0.0684 },
      was: { boundary_42_44: '5.37x', d_ink_absolute: 0.0920 },
      verdict: 'FAIL -> PASS',
      note:
        'Not an Appendix-R2 denominator artefact: the ABSOLUTE numerator fell 0.0920 -> 0.0684. Noted ' +
        'for a future round, unprompted by any gate: the reverse within-tier MAX is 0.1951, larger than ' +
        'the boundary jump this row is gated on — exactly the defect R2 says this gate cannot see.',
    },
    { id: 'D8', side: 'reverse', gate: '0.00% at every tier', value: '0.0000% at all 9 sizes, deepest 0.0000 units', verdict: 'PASS' },
    { id: 'D9', side: 'both', gate: '0 undefined/NaN', value: { renders: 150, failures: 0 }, verdict: 'PASS' },
    { id: 'D5', side: 'both', gate: 'round 1 values hold', value: '9 of 72 renders changed, all dime reverse; LETTERING CHANGED: 0', verdict: 'PASS — untouched' },
  ],
  instrument_bias_VERIFIED_BY_THE_JUDGE: {
    claim: 'D13 normalises by the p90 of the r<40 interior, which is a FIELD level only if the brightest tenth of the interior is field.',
    measured: {
      'dime-rev-2.jpg': { p90: 213, bare_field_patch_mean: 109.4, ratio: 0.514, patches_counted_as_ink: '6 of 6', ink_threshold: 180.8 },
      'penny-rev-2.png': { p90: 222, bare_field_patch_mean: 168.1, ratio: 0.757, patches_counted_as_ink: '6 of 6' },
      'nickel-rev-2.png': { p90: 247, bare_field_patch_mean: 234.4, ratio: 0.949, patches_counted_as_ink: '0 of 6' },
      'quarter-rev-2.png': { p90: 161, bare_field_patch_mean: 108.9, ratio: 0.677, patches_counted_as_ink: '6 of 6' },
    },
    judge_verification:
      'Not taken on report. I ran _jt2field.mjs and LOOKED at its overlay (_jt2field-dime-rev-2-jpg.png, ' +
      'in the round worktree). All six patches sit on visibly bare field at 27..165 grey against an ink ' +
      'threshold of 181, and the p90 of 213 is set by specular highlights on the torch and the leaves — ' +
      'the brightest object on this coin is its device. So on three of the four reverse references the ' +
      'coin OWN field is classified as ink, and the reference "ink fraction 0.661" on the dime largely IS ' +
      'its field. Our flat SVG field sits exactly at its own p90 and can therefore never be ink.',
    consequence:
      'Delta ink is biased negative and delta mean/field biased positive by an amount set by the ' +
      'PHOTOGRAPH lighting rather than by our drawing, so the +-0.05 gate is very likely unreachable on ' +
      'the dime, cent and quarter reverses whatever the art does. Only the nickel reference is clean, ' +
      'which is also what proves the instrument CAN be clean and that this is not an excuse. Fixing it ' +
      'needs a device/field segmentation — which is exactly what D2 is BLOCKED on. The two dimensions ' +
      'are now known to be blocked on the same missing thing, and that is new.',
  },
  what_the_accept_rests_on:
    'NOT on D13 moving. The direction is confirmed by direct comparison with the photograph, ' +
    'independent of D13 arithmetic: the icon-tier X-band ink profile had two dead bands either side of ' +
    'the torch (.00 / .00) where the coin has .73 / .87 — a bare gutter the coin has no trace of — and ' +
    'they are now .33 / .33. The overlay _jt2over-before-84.png is what found it: our branches were ' +
    'narrow columns stopping 12 units short of the torch that the coin foliage reaches.',
  disclosed_costs_that_are_not_gated: [
    'spread moved AWAY from the reference: icon 22.57 -> 19.73 against the reference 29.03, because the ink added is inboard while the reference excess is outboard.',
    'the ink bounding box is unchanged at 23.7..76.3 against the reference 13.2..86.8 — the reference outer 13 units are its legend ring, which our icon tier does not draw by design.',
    'the oak leaf is drawn +22%/+9% over the coin measured 11.8 x 5.5, disclosed, because the coin spray has more lobes than the 7 glyphs D4 freezes.',
    'the OAK lobe cusp worsened 148.6 -> 153.3 deg under the non-uniform scale.',
  ],
  specialist_judgment_the_judge_ENDORSES:
    'It rejected a variant that measured BETTER on D13 and would have IMPROVED the reverse minimum 1.1% ' +
    'instead of costing 1.8%, because the unbounded leaf ladder threw the topmost olive tip to r 41.6 — ' +
    'across the legend band, where the coin outermost tip is r 29.9 — leaving 0.044 units of containment ' +
    'clearance against the field circle, and causing fitOff() to clamp the lit bevel to 0.58 units at ' +
    'icon, which reliefOff own comment says is below where a bevel stops being visible. Part of the D13 ' +
    'gain it was about to report would have been MISSING WHITE, not extents. Choosing 6 units of margin ' +
    'and a working bevel over a better number is the right call, and it is exactly the taste that ' +
    'section 8 says the judge cannot measure.',
  instrument_faults_reported_by_the_specialist_not_fixed: [
    'The brief CURRENT table was stale at two of three tiers: it quoted round 0 _jd10d13 values, but round 1 changed the legends, so 44/84 had moved. The judge wrote that brief and should have re-derived before dispatching.',
    '_jb9well.mjs and _jp9edge.mjs hard-code ../../src/art/coins.js with no SRC/ART override, while _jp10tier has ART and _x6dark/_x6mat have SRC. Getting a before/after out of the first two means swapping the working tree, and doing that is how the specialist destroyed its own edits mid-round and had to re-apply eleven changes.',
    '_jp9edge.mjs prints "region w min..max" beside ratio = p90/p10, so a rectangle reads "w 4.48..9.41 ratio 1.000" and looks self-contradictory. Not unsound; printing the p10/p90 pair would read as what it is.',
    '_jt2relief.mjs — the specialist own instrument — FAILS ITS OWN NULL TEST at all six thresholds (extents equal a locus bound, coverage 0.72-0.91, the mirror field micro-texture triggers everywhere). It reported this rather than using the numbers, and every value in its report came from hand-read grid crops instead. That is the rule working.',
  ],
};

appendFileSync(new URL('./dime-history.jsonl', import.meta.url).pathname, JSON.stringify(entry) + '\n');
console.log('dime: round 3 appended — ACCEPTED (costed), D13 ESCALATED');
