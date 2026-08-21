// Round 8 (cent obverse: the hair and the beard) — the judge's verdict.
// ACCEPTED. And it overturned half the brief I wrote for it.
import { appendFileSync } from 'node:fs';

appendFileSync(new URL('./penny-history.jsonl', import.meta.url).pathname, JSON.stringify({
  coin: 'penny', round: 5, date: '2026-08-21',
  kind: 'specialist round — cent obverse, the hair and the beard',
  verdict_on_the_round: 'ACCEPTED',
  what_changed:
    'BEARD only. HAIR.Lincoln\'s path is byte-identical and gained a comment. Judge-verified attribution: ' +
    '14 of 180 renders differ, ALL penny obverse; 26px and 38px untouched because the beard is not drawn at icon.',
  the_repair:
    'COIN-ART-METHOD 20.8, this coin\'s own entry, says the beard "tapers to a point at the sideburn, and its top ' +
    'edge starts level with the bottom of the ear, not eight units lower". The drawing had never done it: the old ' +
    'top edge ran at y +10.6 against the ear\'s lower bound at +2.7 — 7.9 units lower, the named error still ' +
    'present after all this time. And the old rear tip at (-17.28, 8.63) sat 0.841 units OUTSIDE the hair mass, ' +
    'leaving a wedge of cheek tone between two masses the photographs show as one. The new tip (-18.85, 4.00) is ' +
    '0.345 units inside and the junction is closed. Confirmed by the judge on a before/after crop.',
  D1_locus_confirmed_by_mutation:
    'Not assumed. Replacing HAIR.Lincoln with a triangle, and separately BEARD with a triangle, leaves D1 ' +
    'BIT-IDENTICAL on all four counters (0.95378485, inter 127109 / oursOnly 2805 / refOnly 3354) under a mutation ' +
    'that changes the drawn area by tens of percent. Re-confirmed empirically here: this round genuinely reshaped ' +
    'the beard and D1 did not move. That is what makes this locus free work on a coin with 0.00378 of margin.',
  the_brief_was_wrong_and_this_is_the_important_part:
    'My tip table compared two different measurements and I did not notice. "Ours 35.5 / 84.3" are ' +
    '_jqgeom.turns() readings of the KNOT POLYGON; the coin\'s "40-45 / ~100" are ray fans read at radius 8.27 ' +
    'local units. The knots either side of the sideburn tip are ~5 units apart, so the two are not commensurable. ' +
    'Measured on the DRAWN outline at matched radii the sideburn already read 40.6 degrees against the coin\'s ' +
    '40-45 — THERE WAS NO GAP, and half this round\'s premise was an artefact of mismatched estimators. The beard ' +
    'tip\'s gap was correspondingly LARGER than I stated (52.9 against ~100). This is the same chord-versus-curve ' +
    'fault that escalated D7 today, surfacing independently inside a brief I wrote.',
  rejected_because_it_scored_better:
    'Widening HAIR.Lincoln\'s knot polygon so turns() would print 40-45 and appear to close the gap. It would have ' +
    'opened the DRAWN wedge past the coin\'s — a worse drawing for a better number.',
  reverted_iteration:
    'it3 lifted the top edge further to chase the coin\'s mid-jaw boundary and drew a HUMP the coin has no trace of ' +
    '(the coin\'s boundary is monotone; ours must dive back to the chin closure). It also spent D13@44px down to ' +
    '0.0013 of margin. Reverted, and the reasoning recorded in coins.js.',
  before_after: {
    D1: '0.95378 bit-identical',
    D3: '0.1596 unchanged',
    D6: { before: { '84px': 0.1052, '190px': 0.1308 }, after: { '84px': 0.1046, '190px': 0.1300 } },
    D7: 'BEARD knot 7 declaration updated 95.7 -> 85.0 with its new measurement; the other three unchanged and still true',
    D8: '0.0000% unchanged', D9: '150 renders clean',
    D10: 'd(ink) 0.1921 BIT-IDENTICAL — no improvement claimed (Appendix R2)',
    D11: 'bit-identical; the icon tier draws no beard',
    D13_obverse: { before: [-0.2537, -0.0439, 0.0042], after: [-0.2537, -0.0464, 0.0017],
      cost: '0.0025 at 44px, leaving 0.0036 of a +-0.05 margin — the one real cost, disclosed unprompted' },
  },
  bimodal_check:
    '_jc5bimodal.mjs on all 12 patches before and after: every patch bit-identical — same n, median, ratio, ' +
    '|delta|, margin and level histogram. hairBack stays at margin 5.2. Nothing crossed a step, which is exactly ' +
    'what the brief warned about after round 4 lost work to one.',
  faults_reported_not_fixed: [
    'The specialist declared its OWN texture-energy boundary finder UNTRUSTED: it passes its response test, its ' +
    'null test, and correctly refuses one reference — and still returns confident, in-bounds, INCOHERENT answers ' +
    'on the real references, adjacent columns jumping -13.75 to +18.75 with the region above the "boundary" ' +
    'rougher than below. The overlay shows it locking onto the eyebrow, the hair, the ear and the collar. ' +
    'Appendix Q4/R6 exactly, caught only by drawing it and looking. No value was taken from it.',
    '_jc5corner.mjs (the previous round\'s instrument) hard-codes the cusp coordinates, so after any reshape it ' +
    'silently tests a point that no longer exists and reports a smooth stretch. The same defect bit this round\'s ' +
    'first run of its own tool, which was then parameterised to print the point actually found.',
    'The frozen tone-patch set has a HOLE exactly where our drawing and the photographs disagree most — there is ' +
    'no patch between `cheek` (8.5, -1.5) and `beardJaw` (-4, 17.5), so nothing frozen can adjudicate the mid-jaw.',
  ],
  left_for_a_future_round:
    'Read off a 1-unit grid on the proof, the coin\'s whisker field runs well above our top edge across the ' +
    'mid-jaw — a lens-shaped shortfall peaking near 10 local units at x = -4..0. it3 demonstrates it cannot be ' +
    'closed inside this brief: it needs its own round, its own D13 budget, and probably a mid-jaw tone patch.',
}) + '\n');
console.log('penny round 5 appended — ACCEPTED');
