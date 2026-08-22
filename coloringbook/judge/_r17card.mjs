// Round 17 (nickel obverse: the ear and the hairline) — verdict, and a THIRD
// ratio pathology, this one the cleanest of the three.
import { appendFileSync } from 'node:fs';

appendFileSync(new URL('./nickel-history.jsonl', import.meta.url).pathname, JSON.stringify({
  coin: 'nickel', round: 3, date: '2026-08-21',
  kind: 'specialist round — nickel obverse, the ear glyph and the hair mass',
  verdict_on_the_round: 'ACCEPTED',
  what_changed: 'Three edits, all nickel depiction: HAIR.Jefferson\'s inner run redrawn, a new CURLS_JEFFERSON, and `ear:` replaced by `earMark:`. Judge-verified: 14 of 180 renders differ, all nickel obverse; no icon size changed, which is why D11 cannot move.',
  the_ear: {
    finding: 'The glyph box (local x -21.78..-12.70, y -7.56..8.34) lands in the middle of the wig on BOTH independent references, and NEITHER COIN HAS AN EAR ANYWHERE — the wig comes down from temple to nape. Exactly the quarter\'s case, and §7 of the method says in as many words: do not add anatomy the coin does not have.',
    a_warning_worth_keeping:
      'THE TONE RATIO SAYS THE OPPOSITE. Glyph box / cheek reads 0.925 and 0.948 — DARKER than the cheek, nowhere ' +
      'near the wig\'s 1.207-1.224 — because that part of the wig is the deepest-cut curl cluster. Anyone ' +
      're-deriving this from tone alone would conclude the glyph is on skin. Only the picture settles it (§4.3).',
    repair: 'earMark: CURLS_JEFFERSON — three dark cuts following three grooves read off a 1-unit ladder, stopping at x = -22 because RELIEF.Jefferson\'s lit ridges begin at -23.2 and a pale stroke paints out a dark one.',
  },
  the_hair_mass_was_far_worse_than_my_brief_said: {
    my_brief: 'named ONE patch (hairMid) as unreached',
    measured: 'THREE of four wig patches read exactly 1.000 because the drawn mass never reached them — hairFront 0.0% covered, hairCrown 38.8%, hairMid 0.0%. The old return run swept back to x ~= -21.8 and crossed the crown at y ~= -28.7: the mass was a strip down the BACK of the head and the front two thirds of the wig rendered in FACE TONE. The specialist\'s own words: a bald man with a bracket in the middle of his skull.',
    after: 'hairFront 85.3%, hairCrown 100%, hairMid 100%, curls 30.5% -> 100%. All seven FACE patches still 0.0% — no bleed. Confirmed by the judge on a before/after render: the wig now reads as a wig.',
    method: 'the hairline was read by hand off a labelled local-unit ladder on both references, which agree to ~1.5 units, then Catmull-Rom\'d. BOTH splice knots unchanged, so the outer run is still the head\'s own knots byte for byte.',
  },
  D3_reported_three_ways_unprompted:
    'vs the frame reference 0.2137 -> 0.2086; vs the independent 1945-P 0.2671 -> 0.2500; vs their MIDPOINT 0.1943 ' +
    '-> 0.1967, SLIGHTLY WORSE. The specialist insisted on all three and said plainly: a wash on the midpoint, an ' +
    'improvement on either reference taken alone, do not quote only the first. The midpoint verdict is driven by ' +
    'hairFront (references disagree by 0.479) and curls (0.295). That is the right way to report a target that ' +
    'disagrees with itself by more than the gate.',
  A_THIRD_RATIO_PATHOLOGY_AND_THE_CLEANEST_ONE: {
    what_happened: 'D6 obverse rose 0.1168 -> 0.1185 and D8 rose 2.3714% -> 2.4127%, with NO CHANGE TO EITHER NUMERATOR.',
    judge_verified: 'D6\'s numerator is bit-identical at 140.8 (it actually FELL, 140.81 -> 140.77) while the denominator fell 1206.1 -> 1187.6. D8\'s len-out is bit-identical at 25.39, the same breaching path (the coat\'s closing arc), the same depth 0.0039 — below the 0.01 authoring quantum — and deep-fraction 0.0000% both sides. The rise is 100% denominator in both.',
    why: 'The corrected hairline is a SHORTER ROUTE. A more accurate outline draws less length, so a metric defined as defect-length over total-length gets worse.',
    the_ruling:
      'ACCEPTED with no regression charged. Appendix R2 says no improvement may be claimed unless the numerator ' +
      'moved; applied symmetrically, no regression may be charged either. A gate that a shorter and more correct ' +
      'outline can only make worse is a gate on the wrong side of its own ratio. This is the THIRD rubric fault of ' +
      'the day — after D6 being blind to stroke width and D7\'s chord metric never measuring curvature — and it is ' +
      'the cleanest, because here the drawing indisputably improved and two gates indisputably worsened.',
  },
  faults_reported_not_fixed: [
    'bust()\'s hairFill is the WRONG SIGN at mid: `o.hairLit && tier === "full" ? p.cloth : p.hair` draws the wig DARKER than the face at mid, where both references read 1.207-1.388. The inversion used to cover a back strip and now covers most of the head, so this repair ENLARGED a pre-existing error — the 74->76 boundary d(mean) doubled, 0.0342 -> 0.0634. The fix is one branch in a shared helper this round could not touch. QUEUED.',
    'The QUEUE is drawn too far forward: HEAD/HAIR put the lobe at local x -13..-33, both references put it at -22..-30 and make x -13..-20 COAT. That is why the new inner run\'s lower junction sits on the collar. D1/D2 territory.',
    '_jn6same.mjs\'s low-control does not bound "independent": its own obverse-vs-reverse control reads 0.5802, HIGHER than a genuinely different photograph of the same face (0.2817). The 0.9674-vs-0.2817 conclusion stands; the instrument cannot support a general threshold.',
    'A texture-energy hairline locator returns the brow, eye and nose on the frame reference and `none` at 7 of 11 heights on the worn 1945-P. Printed as REFUSED as a value, and its §6.1 reference-invariance test passes — the photograph-side numbers are bit-identical across revisions.',
    'Its own two bugs disclosed: sharp applies `extract` before `composite`, and a /\'[^\']*\'/g path scraper is fooled by apostrophes in comments inside an array literal — it spliced prose into a path and produced 144 NaN points, caught only because a coverage number moved on a patch nothing had touched.',
  ],
  rejected_because_it_scored_better: 'Shortening the curl strokes by ~2.1 units would put D6@84 back under its old value. That is moving a denominator, not the drawing. Not done — and it is the same pathology as the one above, recognised and refused rather than exploited.',
  queued: 'The front two thirds of the wig now has no strand detail — RELIEF.Jefferson\'s lit ridges all sit at x <= -23. Adding them is ornament (§5\'s order) and would raise D6\'s numerator, so it is its own round.',
}) + '\n');
console.log('nickel round 3 appended — ACCEPTED');
