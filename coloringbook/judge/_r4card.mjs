// Round 4 (dime obverse: the jaw, and the corner) — the judge's verdict.
//
// ACCEPTED. And a RULING on an authored-corner declaration, which turns a
// long-standing D7 FAIL into a PASS by measurement rather than by redrawing.
import { appendFileSync } from 'node:fs';

const entry = {
  coin: 'dime',
  round: 4,
  date: '2026-08-21',
  kind: 'specialist round — D6 the jaw line, D7 the 111 degree knot',
  verdict_on_the_round: 'ACCEPTED',
  dimensions: [
    {
      id: 'D6', side: 'obverse',
      gate: 'fraction of drawn length carried by ratio-1.000 marks <= 0.50; and the current value is the number to beat',
      value: { '84px': 0.2145, '190px': 0.3188 },
      was: { '84px': 0.2493, '190px': 0.3517 },
      verdict: 'PASS, improved',
      what_changed:
        'The jaw stopped being a stroke. It was `fill="none" stroke-width="1.5"`, i.e. width-variation ratio 1.000 ' +
        'BY CONSTRUCTION, and its own comment called it "the only one drawn at full ink weight". It is now a closed ' +
        'filled region tapering 2.90 -> 1.80 viewBox units, measured ratio 1.505. The CENTRELINE is unchanged — the ' +
        'region is that same curve offset by a half-width — so the geometry the previous pass measured is preserved ' +
        'and only the mark type changed. This is COIN-ART-METHOD 14 own named case, and it had outlived three ' +
        'releases of the phase meant to take it.',
      the_photograph_contradicted_the_brief:
        'I wrote that the shadow should be "deepest where the jaw overhangs most, thinning toward the chin and ' +
        'toward the turn under the ear". The references say the opposite: it is widest and deepest AT THE CHIN and ' +
        'fades back, with a second deepening at the angle under the ear (half-depths 67/85 grey levels at the chin, ' +
        '24/9 in the middle, 77/25 at the angle). Every measured width is at least 1.9x the 1.5 the stroke drew — ' +
        'the mark was not only uniform, it was thin.',
      why_only_a_straight_taper:
        'The three references agree to 1.12x on the chin third and spread 2.2x and 2.3x on the middle and ear ' +
        'thirds, because on the warm-lit struck coin the neck plane is in shadow and the run merges into it. The ' +
        'data support "wider at the chin than at the tip" and nothing finer, so a straight taper carries all of it — ' +
        'and it predicts the middle third at 2.35 against a measured 2.35. The photograph\'s profile rises again in ' +
        'the ear third; that rise sits inside that third\'s own 1.68-3.93 between-reference spread and was NOT drawn.',
    },
    {
      id: 'D7', side: 'obverse',
      gate: 'max knot turn <= 75 degrees on FITTED contours; authored corners exempt IF DECLARED (Appendix P2)',
      value: { knots: 44, worst_deg: 110.97, over_75: 1 },
      was: { knots: 44, worst_deg: 110.97, over_75: 1 },
      verdict: 'PASS — the declaration is ACCEPTED and the corner is exempt',
      ruling:
        'The specialist did not smooth it, which was the right call and the one the brief invited. It located the ' +
        'knot — index 23 on the fitted HEAD contour, head-local (-2.31, 41.34), the point of the bust truncation ' +
        'where the near-vertical front of the bust meets the authored straight cut — and then measured the corner ' +
        'ON THE TARGET rather than on our art: a chord estimator over _headmask.json\'s 985 vertices gives the ' +
        'MASK\'s own turn at that point as 99.0-122.3 degrees (mean 108.5) against our 110.97, while the same ' +
        'estimator run on the middle of the straight cut — the control — returns 6.4-37.9. The die cuts that ' +
        'corner. P2 exists for exactly this case: the gate was written for oscillation artefacts in fitted curves, ' +
        'not for corners a die genuinely cuts.',
      declaration_accepted: { path: 'HEAD.Roosevelt, the fitted contour emitted inside the bust transform', knot_index: 23, head_local: [-2.31, 41.34] },
      note:
        'The new region introduces 10 knots of its own, worst 109.9 at local (-13.43, 12.01) — the cusp of the tip ' +
        'cap under the ear lobe. That is OUTSIDE D7\'s declared locus, which is the fitted HEAD contour only. ' +
        'Published rather than omitted, because P2 says an authored corner is declared and not assumed.',
    },
    { id: 'D1', side: 'obverse', gate: '>= 0.95', value: 0.98063, was: 0.98063, verdict: 'PASS — unchanged, still the best of the four coins' },
    { id: 'D3', side: 'obverse', gate: '<= 0.0567', value: 0.0399, was: 0.0399, verdict: 'PASS — unchanged, worst patch 0.112 hairOverEar both sides' },
    { id: 'D8', side: 'obverse', gate: '0.00% at every tier', value: '0.0000%, and 0 of 218 region boundary points outside the head contour', verdict: 'PASS' },
    { id: 'D9', side: 'both', gate: '0 undefined/NaN', value: { renders: 150, failures: 0 }, verdict: 'PASS' },
    {
      id: 'D11', side: 'both', gate: 'no regression',
      value: { overall_min: 0.0534, obverse_min: 0.0534, reverse_min: 0.0797, ratio: 1.49 },
      verdict: 'PASS — bit-identical',
      why_structurally:
        'relief is emitted at tier === full only and D11\'s locus is the 26px icon tier, so this change cannot ' +
        'reach it. Confirmed by byte identity rather than by trusting that argument: 134 of 140 emitted strings ' +
        'identical across 4 ids x 2 sides x 14 sizes, the 6 that differ being dime obverse at 76/84/120/150/190/380. ' +
        'The dime obverse is half of the set\'s closest pair (nickel.o vs dime.o), so this was the row most at risk.',
    },
  ],
  judgment_the_judge_ENDORSES:
    'Two settings scored BETTER on D3 (0.0369 and 0.0356 against the accepted 0.0399) and the specialist refused ' +
    'them, because the chin tone patch\'s median is bimodal — 54.3% of the patch at level 202, 21.2% at 149 — so ' +
    'those optima sit in a window about 0.05 viewBox units wide, with -0.55 giving 179 and -0.65 giving 200. The ' +
    'accepted setting sits on a broad plateau where -0.8, -0.9, -1.2 and -1.4 all give exactly 202. Taking a ' +
    '0.05-unit optimum in a step function is tuning to the metric, and it said so and declined.',
  disclosed_costs: [
    'Clearance between the jaw region and the throat shade falls from 0.60 to 0.08 local units where shade\'s front tip reaches under the chin. The two darks touch at that one point; on the photograph they do not.',
    'The chin end is biased 0.8 local units down, dying away over the first 11 units. Not from the photograph — the references disagree on the centre there (-1.46 struck, +0.89 proof, pooled -0.28) — but forced by a frozen tone patch, see the instrument note below.',
  ],
  instrument_faults_reported_not_fixed: [
    '_jd9d7.mjs mislabels EVERY path in its secondary table: marks() in _jqgeom.mjs returns no `d` field, so `m.d` is always undefined, the authored-vs-fitted test evaluates against the empty string and returns true for everything, and the table prints "AUTHORED (M/L/Z only)" on paths that are all cubics. The offending knot also prints its coordinate as (?) because turns() returns `at`, not `p`. The headline FITTED HEAD figure is computed separately and is unaffected — which is why nobody noticed.',
    'The frozen `chin` tone patch\'s |delta| is a STEP FUNCTION of geometry: in our flat-palette raster the patch spans two palette steps, so its median crosses on a ~4% area change and |delta| jumps 0.073 -> 0.081 -> 0.121 -> 0.229 -> 0.282 with nothing in between. Drawn on the photograph the patch IS correctly sited on the ball of the chin, so this is not a siting error — it is a median taken over a two-step raster. It made a FROZEN TARGET, rather than the photograph, the binding constraint on this repair. That is worth a judge round of its own.',
    'The specialist flagged that its own registration residual (0.266 local units) is identical on all three references because _headmask.json exists only in dime-obv-2\'s frame and simply scales — so it is one measurement reported three times, not three agreeing measurements. Section 4 own rule, applied to itself, unprompted.',
    'A lead for whoever takes the throat: on dime-obv-2 the throat\'s own dark run sits 3-4 local units BELOW the jaw line, and `shade` as drawn starts 1.3-2.3 units below it. Its top edge looks 1-2 units too high. Untouched this round.',
  ],
  judge_could_not_reproduce: {
    claim: 'the specialist reported D6 REVERSE as 0.0000 @84 / 0.0044 @190 and called the scorecard\'s 0.2685/0.2720 stale',
    my_rederivation: '_jp9edge.mjs dime gives reverse 0.2317 @84 / 0.2351 @190 — round 2\'s accepted values, unchanged by this round',
    ruling: 'The reverse being UNCHANGED is what this round needed and that holds either way. The specific figures do not reproduce for me and are not carried into any scorecard row.',
  },
  stale_figures_in_my_own_brief_corrected: {
    'D13 obverse': 'brief said -0.0788 / -0.0153 / +0.0431; the tree before this round gives -0.0788 / +0.0014 / +0.0428. The 44px cell was stale by 0.0167.',
    'D8 max drawn radius': 'brief said 39.372; the tree gives 42.669 at >= 84px (38.030 icon/mid). Breach fraction 0.0000% either way.',
    lesson: 'I wrote that brief from a round-0 scorecard without re-deriving. The specialist re-derived and caught it, which is the third round running that the brief itself carried an error.',
  },
};

appendFileSync(new URL('./dime-history.jsonl', import.meta.url).pathname, JSON.stringify(entry) + '\n');
console.log('dime: round 4 appended — ACCEPTED; D7 authored-corner declaration ACCEPTED');
