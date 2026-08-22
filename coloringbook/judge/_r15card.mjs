// D7 FINISHED — the fitted-contour re-score, and what it does to four rounds
// of verdicts. §1.1: retract beside, never rewrite.
import { appendFileSync } from 'node:fs';

const table = {
  'penny.HEAD.Lincoln': { chord: [69.1, 0], tangent: [0.7, 0] },
  'penny.HAIR.Lincoln': { chord: [144.5, 2], tangent: [1.0, 0] },
  'nickel.HEAD.Jefferson': { chord: [71.5, 0], tangent: [1.6, 0] },
  'nickel.HAIR.Jefferson': { chord: [173.0, 1], tangent: [14.0, 0] },
  'dime.HEAD.Roosevelt': { chord: [111.0, 1], tangent: [111.2, 1] },
  'dime.HAIR.Roosevelt': { chord: [156.2, 4], tangent: [156.3, 3] },
  'quarter.HEAD.Washington': { chord: [71.0, 0], tangent: [1.2, 0] },
  'quarter.HAIR.Washington': { chord: [102.0, 1], tangent: [1.2, 0] },
};

const shared = {
  date: '2026-08-21',
  kind: 'SERIALISED JUDGE ROUND — D7 re-scored on FITTED CONTOURS ONLY, completing the escalation',
  what_was_owed:
    'The first re-derivation scored every path a face emits, while Appendix P2 restricts D7 to paths produced by ' +
    'FITTING a contour. I said at the time that made it a superset and not a finished verdict. This finishes it: ' +
    'HEAD, HAIR and BEARD are the constants _pybuild.mjs fits from the frozen masks, identified by matching their ' +
    'geometry against the emitted `d` rather than by any name in the SVG.',
  the_result: table,
  WHAT_IT_MEANS: [
    'THE CENT\'S HAIR IS SMOOTH. HAIR.Lincoln reads chord 144.5 with 2 knots over 75, and tangent 1.0 with NONE. ' +
    'Round 5 spent an entire round establishing those two knots as authored corners — mask readings, a chord ' +
    'estimator with synthetic 90/0 controls, ray fans on the photograph, a declaration written into coins.js. That ' +
    'work was careful and it was unnecessary: the knots never kinked. They were an artefact of measuring a curve ' +
    'by the polygon through its knots.',
    'THE NICKEL\'S HAIR IS SMOOTH TOO: chord 173.0 (1 over) against tangent 14.0 (none).',
    'THE QUARTER\'S HAIR IS SMOOTH: chord 102.0 (1 over) against tangent 1.2. That is the knot round 8 was told, on ' +
    'my authority, had been "confirmed by eye as a visible kink". It has a tangent discontinuity of 1.2 degrees. ' +
    'Round 8 measured it at 0.4 and called the claim contradicted; this confirms it independently.',
    'THE DIME\'S IS REAL. HEAD.Roosevelt reads 111.0 by chord and 111.2 by tangent — the two agree, so knot 23 is a ' +
    'genuine 111-degree tangent discontinuity. Round 4\'s declaration therefore STANDS on its own evidence (the ' +
    'frozen mask turns 99-122 degrees there against a straight-cut control at 6.4-37.9): it is a corner the die ' +
    'cuts, and it is exempt because it is declared, not because the metric was wrong.',
  ],
  A_FAILURE_NOBODY_HAD_SEEN:
    'HAIR.Roosevelt carries THREE genuine tangent kinks — 156.3 at the closure knot, 114.9 at knot 16, 84.8 at ' +
    'knot 30 — and it has never been scored. The dime\'s published D7 locus is "FITTED HEAD" only; its hair was ' +
    'never in the subject set. So the dime obverse has a real, undeclared D7 failure that four rounds of scoring ' +
    'could not have found, because the locus omitted the path.',
  the_net_effect_on_verdicts:
    'Three of the four coins PASS D7 on fitted contours under the sound measure with no declarations needed at all. ' +
    'The dime fails, once by a declared and defensible corner and once by three undeclared kinks on a path nobody ' +
    'was scoring. The published figures were not uniformly pessimistic — they were unrelated to curvature, and ' +
    'happened to be conservative on three coins and blind on the fourth.',
  instrument_note:
    'The extractor\'s FIRST version silently found only BEARD and printed "no fitted contour emitted" for all four ' +
    'coins — a null result that reads exactly like a measurement. It was caught by a verification step that checks ' +
    'every parsed constant against a real render before anything is scored, and the cause was mundane: the source ' +
    'concatenates its literals without the separating space the emitted string carries ("11.99C" against "11.99 C"). ' +
    'BEARD still does not match and IS REPORTED AS UNFOUND rather than skipped, so the cent\'s beard is not covered ' +
    'by this re-score and is still owed.',
  still_owed: 'BEARD (the cent) is not matched by the extractor and is unscored here. The note is not covered — its paths are not fitted from a head mask. _jqgeom.mjs is untouched, so D6 and D8 are unaffected.',
};

for (const c of ['penny', 'nickel', 'dime', 'quarter'])
  appendFileSync(new URL(`./${c}-history.jsonl`, import.meta.url).pathname, JSON.stringify({ coin: c, ...shared }) + '\n');
console.log('D7 fitted-only re-score appended to all four coins');
