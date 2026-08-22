// Round 18 (the note's eagle) — verdict. The brief's headline number was wrong
// by 36%, and the round measured its way out of it.
import { appendFileSync } from 'node:fs';

appendFileSync(new URL('./buck-history.jsonl', import.meta.url).pathname, JSON.stringify({
  coin: 'buck', round: 2, date: '2026-08-21',
  kind: 'specialist round — the $1 note, the eagle redrawn',
  verdict_on_the_round: 'ACCEPTED',
  what_changed: 'One hunk, the eagle only. Judge-verified: 18 of 180 renders differ, all buck reverse; the four coins and pawcoins.js byte-identical.',
  MY_BRIEF_WAS_WRONG_BY_36_PERCENT: {
    what_I_wrote: 'the note\'s wings span 0.604 of the rim against our 0.858 — "too wide and too short"',
    measured: 'the note\'s wings span 0.8242 (0.8211 / 0.8273 across two references, a 0.6% spread) and ours spanned 0.8421. WE WERE 2.2% TOO WIDE, not 42%.',
    what_was_actually_wrong:
      'Short, centred and shallow. The note\'s bird HANGS LOW — tail to 0.893 of the way down, wingtips only 0.511 ' +
      'of the way up, centre offset +0.191 of ry below the rim centre — and its wings rise at 70.2 degrees. Ours ' +
      'sat dead centre (offset 0.000) at 0.502 of the height with wings at 53.9 degrees. "Too wide" was the one ' +
      'thing it was not.',
    provenance: 'Neither 0.604 nor 0.756 has a GENERATOR anywhere in the tree — round 12 recorded them as prose in its own card, and I relayed them into a brief as measurements. The lesson is the session\'s recurring one: a number without a generator is a description, and this project has been wrong about descriptions eight times now.',
  },
  the_result: {
    'wing span / rim width': { note: 0.8242, before: 0.8421, after: 0.8248 },
    'bird height / rim height': { note: 0.7020, before: 0.5019, after: 0.6939 },
    'centre offset, dy of ry': { note: 0.1908, before: 0.0, after: 0.1929 },
    'wing angle from horizontal': { note: '70.2 deg', before: '53.9 deg', after: '70.0 deg' },
    'tail bottom, dy of ry': { note: 0.8928, before: 0.502, after: 0.887 },
  },
  how_it_segmented_an_engraving:
    'No grey threshold separates the bird from a roundel engraved edge to edge — bill.md had already recorded a ' +
    'density sweep returning a search bound twice. What separates them is SCALE: blur(0.35u) minus blur(2.6u) is ' +
    'negative exactly on the massing, and both wings then fall out as connected components, selected by area with ' +
    'the whole candidate set printed and an ambiguity throw. Head, shield and tail are light and were hand-read ' +
    'off 0.5-unit ladders, which §2.1/R3 permit.',
  the_iteration_that_measured_right_and_looked_wrong:
    'Iteration 1 hit every measured proportion and rendered as A TUNING FORK — head, wings and body were five ' +
    'separate masses and struck()\'s white bevel sat in the 0.20-unit gap between head and shield, cutting the bird ' +
    'in half. The fix was not lowering the target: every proportion is still within 0.010 of the note. It was ' +
    'noticing that the JOINS between masses had never been measured — on the note the head\'s ruff and the shield\'s ' +
    'top edge MEET, both at Y 28.33, and two shapes that meet in a photograph must overlap in a drawing. §8 held in ' +
    'both directions: the tidier drawing was not better, and the measured drawing was not automatically a bird.',
  gates: {
    D1_obverse: '1.0000 unchanged', D2a: '0.9989 unchanged', D2b: '0.9991 unchanged',
    D7_reverse: 'chord 145.1 -> 135.5 (over-75 72 -> 60), tangent 145.1 -> 137.8 (63 -> 48) — improved on BOTH measures, nothing smoothed to get it',
    D13_eagle: 'icon 0.1116 -> 0.1033, mid 0.0938 -> 0.0913, full 0.1424 -> 0.1375 — all three toward the photograph, all still outside the 0.05 gate',
    D11_note_pair: '0.0718 -> 0.0735 (+2.4%), recovering part of round 12\'s cost; set minimum 0.0534 and the §17 ratio untouched',
    D6_reverse: '6.91% -> 6.66%', D9: '150 renders clean',
  },
  the_one_row_that_worsened_and_the_null_test_that_placed_the_blame:
    'The struck() BEVEL copy now breaches its roundel at full (0.000% -> 1.004%) as well as icon and mid. The round ' +
    'solved for the largest wingtip the offset can contain at the note\'s own span: at icon and mid the SPAN ALONE ' +
    'breaches at any tip height, and at full the maximum containable tip is 0.419 against the note\'s 0.445-0.506 — ' +
    'all four corners of the two-reference spread breach. THE NULL TEST places the blame: with the offset set to ' +
    'zero the note\'s own wingtip IS containable. So the breach belongs to spendOf() bounding against a circle ' +
    'centred at (50,50) when this subject has two off-centre ellipses — a shared helper, already published as ' +
    '_jk9fitseal.mjs\'s own finding, and not the bird\'s fault.',
  rejected_because_it_scored_better: 'A uniform shrink. f = 0.96 clears the full-tier bevel and f ~= 0.82 is still not enough at icon. That is Appendix R2\'s move exactly and it was refused; the derivation is published instead.',
  faults_in_MY_brief_and_in_round_12s_instruments: [
    'My MUST-NOT-REGRESS row was mis-stated: "eagle beyond its roundel 0.000% at every tier" is true of the MASS copies only. For ALL copies it is 0.000% at full only — the tree I handed over was already at 2.969% icon and 1.718% mid.',
    'D2b/D2d CANNOT SEE THE EAGLE. _jk9score.mjs scores the roundel ellipse, not the bird, and D2d-eagle is the roundel\'s own ry/rx — +6.06% before and after. No redraw of the bird can move the dimension I briefed it to fix. The dimension the brief named is not the dimension the brief described.',
    '_jk9score.mjs\'s reference-invariance proof cannot run as documented (its before.js resolves relative to judge/, where a coins.js cannot resolve ../engine/money.js). Re-run from a workable path it reports BIT-IDENTICAL over 9 target-side tuples.',
    '_jk9look.mjs cannot run at all — its header documents a coloringbook/engine symlink that does not exist in this repo.',
    '_jk9ident.mjs and _jb11d11.mjs hard-code ../../src/art/coins.js and cannot score a before/after without checking the tree out.',
    '_jk9fitseal.mjs\'s null test prints worst r 0.9941 for the quarter, bit-identical to the eagle\'s own full reading in the before state — §4\'s "two bit-identical answers from two different inputs" tell. The specialist could not determine whether it is coincidence and flagged it rather than dismissing it.',
  ],
  its_own_instruments_it_caught: 'Two: a fixed fractional wing seed that landed inside both wings on one photograph and missed on the other, and an outer-edge angle fit that binned flattened vertices and mixed the crescent\'s INNER edge into the outer envelope — pulling the inner edge inboard moved the reported angle 70.1 -> 75.7 with the outer edge byte-identical. §4.3 applied to its own tools.',
  dropped_and_stated: 'The shield and head measure +0.03-0.05 rx right of centre on both photographs — 0.9 device px at 190 and 0.2 at icon. Drawn symmetric, and said so. The olive branch and arrow bundle are not drawn: they are held BY the eagle rather than part of it, and adding them would widen the massing further into the bevel problem.',
}) + '\n');
console.log('buck round 2 appended — ACCEPTED');
