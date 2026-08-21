// Serialised judge round 2 of 4 — D7 re-stated on tangent discontinuity.
// The retraction is appended beside every published D7 figure (§1.1).
import { appendFileSync } from 'node:fs';

const shared = {
  date: '2026-08-21',
  kind: 'SERIALISED JUDGE ROUND — D7 re-stated on tangent discontinuity, with a retraction',
  the_fault_restated:
    '_jqgeom.turns() measures the angle between CHORDS joining consecutive on-curve knots — a property of knot ' +
    'SPACING, not of whether the curve kinks. Verified twice independently: a G1-continuous join of two ' +
    'half-circles returns a worst chord turn of 90.0 degrees (116.6 sampled coarsely) where the tangent measure ' +
    'returns 0.0.',
  why_it_survived_four_rounds:
    'The gate\'s stated response test is "a synthetic path with a known 90 degree corner reports 90 +- 1". BOTH ' +
    'estimators pass it, so it could never discriminate. The new instrument\'s test set adds the case that does: a ' +
    'G1-smooth join with the knots far apart, where the sound measure reads 0.0 and the unsound one reads 90.0.',
  new_instrument: 'coloringbook/judge/_jd7tan.mjs — parses the control points off the emitted `d` strings (which flattenPath discards), computes the tangent discontinuity at every join INCLUDING THE CLOSURE KNOT that turns() never evaluates, and prints the chord number beside it on every row so nothing is silently replaced. Response tests: known 90-degree tangent kink -> 90.0; G1-smooth join -> 0.0 tangent / 90.0 chord; straight run -> 0.0 / 0.0. Arcs are COUNTED and reported rather than scored as zero.',
  re_derived_both_measures: {
    note: 'worst angle and count over 75 degrees, at size 380, over EVERY path the face emits',
    'penny.obverse': { chord: [144.5, 17], tangent: [128.2, 13] },
    'penny.reverse': { chord: [94.5, 4], tangent: [94.5, 4] },
    'nickel.obverse': { chord: [173.0, 8], tangent: [123.2, 6] },
    'nickel.reverse': { chord: [180.0, 16], tangent: [180.0, 16] },
    'dime.obverse': { chord: [156.2, 21], tangent: [174.0, 15] },
    'dime.reverse': { chord: [166.3, 81], tangent: [142.6, 123] },
    'quarter.obverse': { chord: [156.1, 8], tangent: [121.0, 5] },
    'quarter.reverse': { chord: [132.5, 87], tangent: [141.5, 93] },
    'buck.obverse': { chord: [71.0, 0], tangent: [1.2, 0] },
    'buck.reverse': { chord: [145.1, 72], tangent: [145.1, 63] },
  },
  THE_FINDING_IS_NOT_WHAT_I_EXPECTED:
    'The two measures disagree IN BOTH DIRECTIONS, so neither is a refinement of the other. The note\'s obverse is ' +
    'the cleanest demonstration of the fault — chord 71.0 against tangent 1.2, i.e. a face the old metric put just ' +
    'under its gate is in truth almost perfectly smooth. But the dime reverse goes the other way: 81 knots over 75 ' +
    'by chord and 123 by tangent. A chord can HIDE a real kink as well as invent one, wherever the control legs ' +
    'are short relative to the chord. Every published D7 verdict therefore needs re-deriving on the sound measure; ' +
    'it is not enough to assume the old numbers were pessimistic.',
  RETRACTS: 'Every published D7 figure on every coin and side, across four rounds — including the dime obverse PASS accepted in v1.61.0, which turned a FAIL into a PASS by declaring a 111-degree CHORD knot an authored corner.',
  what_survives:
    'The per-knot DECLARATIONS remain defensible as relative statements, because each compared our chord turn ' +
    'against the TARGET MASK\'S chord turn at the same place with a known-straight control — like against like, ' +
    'same estimator on both sides. The dime\'s reads our 110.97 against the mask\'s 99-122 with a straight-cut ' +
    'control at 6.4-37.9, and that still says the die cuts a corner there. What does not survive is the ABSOLUTE ' +
    'gate: "0 knots turning more than 75 degrees" was never a statement about curvature.',
  WHAT_IS_STILL_OWED_AND_WHY_THIS_IS_NOT_A_FINISHED_RE_SCORE:
    'The sweep above scores EVERY path a face emits, while P2 restricts D7 to paths produced by FITTING a contour ' +
    '— an authored polygon declares its corners and those knots are exempt. So these numbers are a superset and ' +
    'are NOT directly comparable to the published per-coin figures, which were fitted-contour only. Completing the ' +
    're-score needs the fitted/authored partition applied per coin, which each scorecard names individually. ' +
    'Stating that limit rather than presenting the sweep as a finished verdict.',
  not_edited: '_jqgeom.mjs is untouched. It is shared with D6 and D8, which use it for mark extraction and path length — things it does correctly — and editing it mid-session would void work that is not at fault.',
};

for (const c of ['penny', 'nickel', 'dime', 'quarter', 'buck'])
  appendFileSync(new URL(`./${c}-history.jsonl`, import.meta.url).pathname, JSON.stringify({ coin: c, ...shared }) + '\n');
console.log('D7 retraction + re-derivation appended to all five subjects');
