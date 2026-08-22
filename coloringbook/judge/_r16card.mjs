// Round 16 (quarter obverse: the wig grooves) — verdict.
import { appendFileSync } from 'node:fs';

appendFileSync(new URL('./quarter-history.jsonl', import.meta.url).pathname, JSON.stringify({
  coin: 'quarter', round: 9, date: '2026-08-21',
  kind: 'specialist round — quarter obverse, the wig grooves',
  verdict_on_the_round: 'ACCEPTED, with a tone cost that came with its own diagnosis',
  what_changed: 'Seven stroke-width values. groove 2.6/2.6/2.6/2.4/2.4 -> 0.98 on all five; grooveFine 1.1/1.0 -> 0.36. NO centreline moved. Judge-verified: 10 of 180 renders differ, all quarter obverse.',
  the_measurement_that_decided_it:
    'Pitch is not a free parameter and width is. D6 is a fraction of drawn LENGTH and stroke-width appears nowhere ' +
    'in it, so reaching the coin\'s 1.25-unit pitch needs 3.2x our cut length and takes D6 from 20.50% to 31.71% ' +
    'at 84px — forbidden. With pitch pinned, matching the coin\'s cut WIDTH and its DUTY CYCLE are different targets ' +
    'and only one is reachable. Duty wins, because at 84px a 0.35-unit cut is 0.29 device px and resolves nowhere: ' +
    'all that reaches a child is the mean, and the mean of a cut train is its duty. After: cut duty 0.322 against ' +
    'the coin\'s 0.258-0.429; ridge duty 0.348 against 0.350-0.443.',
  what_our_wig_was:
    'Not a wide cut — a STRIPE PATTERN. At 2.5 wide on a 4.05 pitch there is no lit mass left between the marks to ' +
    'be cut, and the half-prominence finder scored 0 or 1 cuts on 7 of 7 lines: our own render could not be ' +
    'measured by the instrument that measures the coin. The overlay reads as a radiator.',
  THE_FINDING_THAT_MATTERS_MOST:
    'D6 IS BLIND TO STROKE WIDTH. This round narrowed the exact defect D6 exists to catch by 2.6x and D6 moved by ' +
    '0.0000 — judge-verified, 20.50% / 25.94% bit-identical before and after, drawn length and uniform length ' +
    'identical to the decimal. Meanwhile the only fix for the COUNT half of the same defect would raise D6 by 11 ' +
    'points. So D6 as implemented cannot route a width repair and actively forbids a count repair. That is a ' +
    'rubric fault of the same class as D7\'s, on the dimension section 14 exists to serve.',
  three_errors_in_my_brief: [
    '"The wig grooves are ranks 1-10" conflates two OPPOSITE groups: ranks 1-5 are the dark `groove` cuts, ranks 6-10 are the LIT rolls drawn in p.field at 0.85. The grooves alone are 7.20% of drawn length and 35.1% of uniform-width length, not 13.30% and 62%.',
    'Ranks 1-10 re-derive to 13.19% and 64.34%, not 13.30% and 62%.',
    'Transect T1 of the frozen set does not cross our wig at all — viewBox (55,46)->(45.6,21.6) is local x +4.1..-5.5, the forehead. It scores 0 cuts on our art at every revision.',
  ],
  the_cost_and_its_diagnosis:
    'Tone moved the wrong way on exactly the two patches that contain cuts: wigMid |delta| 0.039 -> 0.160, wigBack ' +
    '0.021 -> 0.084. Every other patch bit-identical. The specialist traced the cause instead of guessing: the wig ' +
    'FILL is about 0.16 too light, and cuts 2.1x the coin\'s dark area had been cancelling it. Fixing the texture ' +
    'exposed a pre-existing tone error — the wig was the right tone for the wrong reason. Setting ' +
    'OBVERSE.quarter.hairLit true gives wigMid 0.880 and wigBack 0.876, INSIDE the coin\'s range on all three ' +
    'references. That is per-coin data rather than shared mechanism, so it is dispatchable as its own round — and ' +
    'it is the same repair the nickel received in v1.62.0.',
  rejected_on_scope_not_merit:
    'Variant B also narrowed the lit rolls to 0.92 and LOOKS MATERIALLY BETTER at 190px, with ridge duty closer to ' +
    'the coin and tone unchanged. Rejected because the brief said "the wig grooves only" twice and the lit rolls ' +
    'are not grooves. The revision was verified back to its pre-variant hash. Queued rather than taken.',
  must_not_regress_verified: 'D1 0.96530 unchanged; D6 bit-identical; D7 chord and tangent both unchanged; D8 0.0000% every tier; D9 150 clean; D11 all 28 pairs bit-identical (0.0534 / 1.49x); quarter reverse and every other coin byte-identical.',
  faults_reported: [
    '_jn13d6.mjs is blind to stroke width (above) — the headline fault.',
    '_jq11disc.mjs sweeps 26/44/54px only, and wig relief is full-tier (>=76px), so D11 is bit-identical BY CONSTRUCTION rather than by measurement. No D11 number exists at 84 or 190.',
    '_jq7d7.mjs and _jd7tan.mjs disagree on the quarter obverse subject set (5 over 75 / worst 102.0 against 0 over 75 / worst 71.0), and round 8\'s published "tangent worst 81.9, 2 over 75" matches neither. NOTE: the judge\'s fitted-only re-score resolves this — restricted to fitted contours the quarter reads chord 102.0 / tangent 1.2 on HAIR and chord 71.0 / tangent 1.2 on HEAD, i.e. the 5-over-75 figure was counting authored regions.',
    'The wigCrown 1.421 in the source comment does not reproduce — 1.113 through the frozen patch file and registration. wigMid reproduces (0.863 vs 0.860); wigBack does not (0.788 vs 0.841).',
    'Its own disc check hits its search bound on the 1932 reference (R 999.37 in a 2000px frame means the disc touches the frame; the scan caps at 999 and returns 983.17) and is reported as a FAILURE REPORT rather than a value.',
    'quarter-obv-2 at 7.95 px/unit reads systematically wider cuts (duty 0.429) than the two high-resolution references (0.258, 0.342) — the expected direction for a blur floor on a 2.4px feature. Its duty was EXCLUDED from the target and the exclusion is stated rather than folded in.',
  ],
}) + '\n');
console.log('quarter round 9 appended — ACCEPTED');
