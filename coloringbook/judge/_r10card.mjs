// Round 10 (dime obverse: the throat) — verdict, plus a standing lesson about
// the briefs this judge has been writing.
import { appendFileSync } from 'node:fs';

appendFileSync(new URL('./dime-history.jsonl', import.meta.url).pathname, JSON.stringify({
  coin: 'dime', round: 5, date: '2026-08-21',
  kind: 'specialist round — dime obverse, the throat region',
  verdict_on_the_round: 'ACCEPTED',
  what_changed: 'Seven y-coordinates in RELIEF.Roosevelt.shade, all by exactly +0.30 — the measured mean error. Nothing else in the drawing. Judge-verified: 10 of 180 renders differ, all dime obverse.',
  the_brief_was_wrong_AGAIN_AND_IN_THE_SAME_WAY:
    'I wrote that the throat\'s top edge was "1-2 units too high", from round 4\'s note. Both of that note\'s ' +
    'figures reproduce — but they are not the same measurement. 3-4 is the photograph run\'s TROUGH, the darkest ' +
    'station across it; 1.3-2.3 is our EDGE. Measured like against like, as the full-width-at-half-depth top edge ' +
    'that §14.2 already uses for the jaw\'s own width, the photograph starts 2.01 below the jaw line and we started ' +
    '1.73. The error was 0.30, NOT 1-2. Comparing a centre with a boundary overstated it sixfold.',
  the_pattern_this_makes:
    'THIRD ROUND RUNNING that a brief of mine compared two quantities that were not the same measurement: ' +
    '(1) round 8, our knot-polygon angle against the coin\'s ray-fan angle at a different radius — the apparent ' +
    'sideburn gap did not exist; (2) the D7 escalation, chord turn against curvature — the metric flags smooth ' +
    'curves; (3) here, a trough against an edge — a 0.30 error published as 1-2. Every one was found by a ' +
    'specialist re-deriving before acting, which is why that instruction is now first in every brief. The standing ' +
    'lesson: BEFORE COMPARING TWO NUMBERS, STATE WHAT EACH ONE MEASURES. A response test cannot catch this, ' +
    'because both numbers are individually correct.',
  the_repair: 'Top edge and front corner down 0.30; mean |error| 0.32 -> 0.15, RMS 0.37 -> 0.18. Jaw-to-throat clearance 0.0616 -> 0.2701. The REAR corner did not move — it already sat at -1.43 against a measured -1.50 — so the correction tapers from 0.30 at the chin to nothing at the ear.',
  an_iteration_rejected_for_0_0001:
    'Moving the rear corner too gave a better fit RMS (0.202) but took D6 obverse from 0.2145 to 0.2146 at 84px, ' +
    'because shortening that edge cut total drawn length while the ratio-1.000 length was unchanged. A ' +
    'deterministic 0.0001 regression, not noise. Rejected, and the version kept is ALSO the better fit (0.181). ' +
    'Judge-verified: D6 is exactly 0.2145 / 0.3188 after the merge.',
  reference_limits_it_established: [
    'Only ONE of three references can measure this edge. dime-obv-3 is blown to 255 along the neck by raking light and returns the search bound at 16 of 17 stations; dime-obv.jpg merges jaw and throat into one run whose top edge sits at or ABOVE the jaw line at 6 of 8 stations; dime-obv-4 is excluded by its own frozen disc (A/B disagree by 6.0% of R).',
    'It is the exact mirror of round 4: dime-obv-2 has no measurable JAW run, and the struck references have no measurable THROAT edge. One reference measures each, and neither measures both.',
    'A claim in the source is only one-third true. Phase 2b justified the gap with "the photograph puts light on the underside of the jaw before the shadow starts". On dime-obv-3 that ridge is real (8-31 grey levels proud). On dime-obv-2 there is NO ridge — the profile falls monotonically from the lit chin into the throat — and none on dime-obv.jpg either. The gap is drawn because one reference has it, and because two adjacent flat fills that touch read as a bar. That is now recorded rather than silently inherited.',
  ],
  faults_in_round_4s_own_instruments: [
    '_jw4check.mjs hardcodes SHADE_D as a LITERAL COPY of the old shade path, so its "clearance to the throat" column does not move when shade moves — it still prints 0.08 after this change, against a live-source 0.2701. Two bit-identical answers from two different inputs: §4\'s own named tell, in an instrument written to satisfy §4.',
    '_jw4width.mjs\'s CLI entry throws on the current tree because it looks for "M 19.4 21.4", the stroke ROUND 4 ITSELF replaced. An instrument that hardcodes the art it measures breaks against its own repair.',
    '_jw4reg.mjs silently draws no jaw for the same reason — the overlay layer is empty, with no error.',
  ],
  honest_caveat_from_the_specialist: 'The registration residual (0.266 local units) is the same size as the correction (0.30). It is a shape-fit residual rather than a frame offset and the measurement is differential within one frame, but it bounds how finely this edge can be placed. Raised unprompted.',
  before_after: { D1: '0.98063 unchanged (HEAD byte-identical)', D3: '0.0399, every patch identical', D6: '0.2145 / 0.3188 unchanged', D8: '0.0000% unchanged', D9: '150 clean', D10: 'numerators bit-identical, 0.0673 ABS at 42->44', D11: 'all 28 cells identical', D13_obverse_84px: '+0.0417 -> +0.0418, against a +-0.05 gate' },
}) + '\n');
console.log('dime round 5 appended — ACCEPTED');
