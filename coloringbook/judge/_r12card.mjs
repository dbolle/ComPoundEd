// Round 12 (the $1 note) — the judge's verdict. The largest single improvement
// of the session, one costed regression, and one finding of the specialist's
// that the judge overturns.
import { appendFileSync } from 'node:fs';

appendFileSync(new URL('./buck-history.jsonl', import.meta.url).pathname, JSON.stringify({
  coin: 'buck', round: 1, date: '2026-08-21',
  kind: 'specialist round — the $1 note: D2 roundels, D4 counts, D1 vignette',
  verdict_on_the_round: 'ACCEPTED, with two costs recorded',
  headline: {
    'D1 obverse IoU': '0.1496 -> 1.0000, dcx -16.05 -> 0.00, at every tier',
    'D2a roundel IoU': '0.3943 -> 0.9989',
    'D2b roundel IoU': '0.4290 -> 0.9991',
    'D2c separation': '-25.6% -> 0.00%',
    'D4 obverse count': 'error 2 -> error 0 at every tier (four corner numerals, where we drew two)',
    'the eagle beyond its roundel': '154.8% of the rim, 13.735 units -> 0.000% at every tier; at full every copy including the bevel is 0.000%',
    'D10 43->44': 'obverse 1.36x -> 0.96x and reverse 1.17x -> 0.96x, with the ABSOLUTE numerator moving both times (R2)',
  },
  the_drawing_was_wrong_in_kind_not_degree:
    'The pyramid was a pointed triangle with a second triangle on top. The real one is TRUNCATED, with a DETACHED ' +
    'capstone above a ray gap — and the capstone\'s base is the same width as the truncation below it, which is ' +
    'what makes it detached rather than a hat. The roundels were circles; they are ellipses. Same class as the ' +
    'nickel\'s phantom columns: a confident drawing of something the object does not do.',
  the_number_the_brief_had_wrong_in_our_favour:
    'The brief quoted the eagle at "10.474% outside, 4.840 units deep". That is measured against OUR OWN round-0 ' +
    'drawn roundel. Against the note\'s MEASURED roundel the same drawing was 154.8% beyond the rim, 13.735 units. ' +
    'The defect was fifteen times worse than the figure we had been carrying.',
  costs_recorded_not_waived: [
    'D11\'s note row fell 0.1049 -> 0.0718, -31.6%. buck.o/buck.r is now the third-smallest pair in the 45-pair matrix where at round 0 it was outside the ten smallest. Both faces became smaller, paler devices inside the same frame with the same four corner numerals. THE SET MINIMUM AND THE SECTION 17 RATIO ARE UNTOUCHED (0.0534, 1.49x) and the note\'s nearest different-DENOMINATION pair is still above 0.0938 — so telling a note from a coin is unaffected; telling its front from its back is harder. Judge-verified: _x6mat is unchanged because its IDS list has never included the note, so this cost is measured by the note\'s own instrument rather than by the set matrix.',
    'D6 reverse worsened 4.54% -> 6.91%. Arithmetic: uniform length fell 45.4 -> 38.4 while total device length fell 999.8 -> 555.0 because the devices shrank; six course lines instead of three is the driver. Kept because section 5 puts D4 above D6 and D4-reverse\'s error goes 9 -> 6. The trade is stated rather than hidden.',
  ],
  rejected_because_it_scored_better:
    'rx = 9.2 satisfies ALL FOUR D2 rows at once and sits inside the target\'s own 8.25-9.50 spread. Refused ' +
    'because D2d is a ratio between two numbers the drawing controls, and Appendix R2 says exactly that gate can ' +
    'be met by choosing the drawing. D2d-eagle is therefore left outside +-5% at +6.06%.',
  a_wrong_feature_caught_by_an_overlay:
    'The pyramid\'s LEFT slope line-fit was rejected: the overlay shows it tracking the pyramid\'s CAST SHADOW ' +
    'where it spills left of the masonry near the base. Its selection margin was also the weakest in the run (3.94 ' +
    'grey against 17.00 on the right). The axis was taken from the seal\'s own measured centre instead. Section 4.3 ' +
    'catching a wrong feature for the second time this session.',
  THE_JUDGE_OVERTURNS_ONE_FINDING: {
    the_claim: 'Finding 7: "src/art/pawcoins.js contains a second, independent noteSVG() which this round did not touch. Its note still carries every defect repaired here."',
    the_ruling: 'WRONG, and acting on it would break a charter rule.',
    why: 'pawcoins.js is not a stale copy of the US note. It is the app\'s own FICTIONAL currency — Paw Bucks — split out of coins.js in v1.55.0, and its own header states the case in bold: "The two must not merge again. Paw Bucks are FICTITIOUS FOREVER (CHARTER.md) — earned by learning, spent in the Pet Store, never real money... paw names, face value printed, because a made-up coin has no real-world design a child could otherwise read. US currency (coins.js) is what a child STUDIES." Its note draws a Paw Buck, not a dollar. "Repairing" it toward the US note would erase a deliberate distinction the charter requires.',
    how_the_judge_checked: 'Read pawcoins.js\'s header directly and traced the imports: src/screens/money.js imports coinSVG from ../art/coins.js, and nothing in src/ imports pawcoins.js at all.',
  },
  a_fact_worth_recording_while_tracing_that:
    'The money screen IS reachable: src/main.js line 140 registers /money, gated by BETA_ROUTES while in preview. ' +
    'So this art does reach children, behind the beta gate — which is also why CLAUDE.md\'s BETA EXEMPTION applies ' +
    'to it. The backlog\'s older note that coins.js is "wired into nothing" is stale.',
  instrument_faults_reported: [
    '_jb8geom.mjs\'s D8b locus is OUR OWN ROUND-0 DRAWING (ROUNDEL frozen as cx 30/70, r 15/16) — a locus that is a function of the artefact under test, which section 6.1 forbids outright. Its post-repair numbers are measured against a boundary the drawing no longer declares.',
    '_jb8geom.mjs\'s response test now self-reports UNTRUSTED: it perturbs cx="70", which no longer exists in the emitted SVG. The perturbation was written against round-0 art rather than against a property of the drawing.',
    '_jb3seal.mjs and _jb14d1.mjs carry OURS as a hard-coded table, so neither can see any change to coins.js — both would report round-0 numbers on any revision. Correct at round 0; it means they cannot score a repair.',
    '_jb8geom.mjs identifies the scallop wave by a magic 25-unit width, while section 3 excludes it BY NAME. A 4-unit change to an ornament moved D6-obverse by 6 percentage points with the drawing otherwise identical.',
    'spendOf() bounds the relief offset against a circle centred at (50,50), so this subject\'s two off-centre elliptical boundaries cannot be respected at the call site even if rField were passed. Shared helper; queued.',
  ],
  an_instrument_bug_the_specialist_caught_in_itself:
    'Its own sweep rebuilt a substitution string as "scale(0.5154 0.5154)" where the SVG emits "scale(0.5154)", so ' +
    'replaceAll silently did nothing and EVERY ROW RETURNED A BIT-IDENTICAL ANSWER — section 4\'s own tell. Fixed, ' +
    'with an assertion that the substitution took.',
  what_it_left: 'The eagle\'s silhouette is still wrong and no affine map fixes it: on the note the wings span 0.604 of the rim width and the bird 0.756 of its height; ours are 0.858 and 0.513 — too wide and too short. It needs redrawing with raised, steeper wings, not rescaling.',
  the_first_accurate_brief: 'The specialist reports that every figure in this brief reproduced exactly — the first round in seven where that was true. The one correction is the eagle-overhang figure above, which was measured against our own drawing rather than the note.',
}) + '\n');
console.log('buck round 1 appended — ACCEPTED');
