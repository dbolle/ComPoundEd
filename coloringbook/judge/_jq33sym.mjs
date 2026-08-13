// TASK 2, step 4 — THE REVERSE PATCH SET v1 IS FROZEN AND IT IS NOT USABLE AS
// A GATE. THIS IS THE DIAGNOSIS AND THE REPAIR.
//
// _jqrevtone.json (v1, sha256 84e9b96d…) is frozen and stays frozen (§1.1:
// retract beside, never rewrite). Its own published numbers condemn it:
//
//     cross-reference noise floor   0.1937
//     §12.3 flat floor (rev-3)      0.1732
//
// The noise floor EXCEEDS the flat floor. A drawing with no interior tone at
// all scores 0.1732; two honest photographs of the same die disagree by
// 0.1937. There is no gate that can separate a good drawing from a blank one,
// so publishing a D3-reverse number off v1 would be publishing noise.
//
// DIAGNOSIS, from v1's own ratio vector rather than from a hunch. The
// left/right pairs INVERT between the two references:
//
//     patch      rev-3    rev-2
//     wingInL    0.9209   0.6314
//     wingInR    0.7017   0.7487
//     wingOutL   0.6830   0.8311
//     wingOutR   0.7832   0.4786
//
// rev-3 has L brighter than R on both wing pairs; rev-2 has R brighter than L
// on both. That is not two dies disagreeing, it is two LIGHTS. §20.5 / §21.6
// already say to re-measure the sign per coin and per region; on a bilaterally
// symmetric device there is a stronger move available.
//
// REPAIR, and its criterion is stated before its numbers:
//   The eagle is mirror-symmetric about X = 50. The DESIGN therefore assigns
//   the same tone to wingInL and wingInR. Any difference between them is
//   illumination. So score the MEAN of each mirror pair as one patch. This
//   cancels the leading (antisymmetric) term of the lighting exactly, keeps
//   every symmetric relationship the design actually controls, and costs
//   resolution only where the design is genuinely asymmetric — which on this
//   device is nowhere, by construction.
//   ACCEPTANCE: the symmetrised set is usable iff its cross-reference noise
//   floor is BELOW its own flat floor, with margin — specifically
//   noise <= 0.6 x flat. Below that the metric can rank drawings; above it,
//   D3-reverse is BLOCKED and I say so.
import { writeFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { REFS, load } from './_jq30inv.mjs';
import { PATCHES, sample, XY2uv } from './_jq31patch.mjs';

const dir = new URL('./', import.meta.url).pathname;

// mirror groups. A group of two is a symmetric pair; a group of one sits on the
// axis and is already symmetric.
export const GROUPS = [
  ['head', ['head']],
  ['breast', ['breast']],
  ['bodyLow', ['bodyLow']],
  ['wingIn', ['wingInL', 'wingInR']],
  ['wingMid', ['wingMidL', 'wingMidR']],
  ['wingOut', ['wingOutL', 'wingOutR']],
  ['arrows', ['arrows']],
  ['wreathSide', ['wreathL', 'wreathR']],
  ['wreathBot', ['wreathBot']],
];
export const FIELDG = [['fieldUp', ['fieldUL', 'fieldUR']], ['fieldLo', ['fieldLo']]];

const G = {};
for (const [tag, file, D] of REFS) G[tag] = { g: await load(file), D };
const med = {};
for (const tag of Object.keys(G)) {
  med[tag] = {};
  for (const [n, X, Y, r] of PATCHES) med[tag][n] = sample(G[tag].g, G[tag].D, X, Y, r).med;
}
const grpVal = (tag, members) => members.reduce((a, m) => a + med[tag][m], 0) / members.length;

// mirror asymmetry, measured, so the diagnosis is a number and not a story
console.log('=== the diagnosis, as a number: mirror asymmetry per pair ===');
console.log('pair          rev-3 L/R    rev-2 L/R    (a design difference has the SAME sign in both)');
let sameSign = 0, nPairs = 0;
for (const [g, m] of GROUPS) {
  if (m.length !== 2) continue;
  const a3 = med['rev-3'][m[0]] / med['rev-3'][m[1]], a2 = med['rev-2'][m[0]] / med['rev-2'][m[1]];
  const ss = (a3 - 1) * (a2 - 1) > 0;
  if (ss) sameSign++; nPairs++;
  console.log(`${g.padEnd(13)} ${a3.toFixed(4).padStart(9)}    ${a2.toFixed(4).padStart(9)}    ${ss ? 'same sign' : 'OPPOSITE SIGN — illumination, not design'}`);
}
console.log(`${sameSign} of ${nPairs} mirror pairs agree in sign across the two references.`);
console.log(`(if the L/R difference were a property of the DIE, it would be ${nPairs} of ${nPairs}.)\n`);

console.log('=== symmetrised candidate set (§4.2) — every eligible normaliser ===');
console.log('normaliser    cross-ref mean|dR|   flat floor rev-3  rev-2   noise/flat');
const cand = [];
for (const [gn] of GROUPS) {
  const others = GROUPS.filter(([m]) => m !== gn).map(([m]) => m);
  const r3 = others.map((m) => grpVal('rev-3', GROUPS.find(([q]) => q === m)[1]) / grpVal('rev-3', GROUPS.find(([q]) => q === gn)[1]));
  const r2 = others.map((m) => grpVal('rev-2', GROUPS.find(([q]) => q === m)[1]) / grpVal('rev-2', GROUPS.find(([q]) => q === gn)[1]));
  const d = r3.map((v, i) => Math.abs(v - r2[i]));
  const mean = d.reduce((a, b) => a + b, 0) / d.length;
  const f3 = r3.map((v) => Math.abs(v - 1)).reduce((a, b) => a + b, 0) / r3.length;
  const f2 = r2.map((v) => Math.abs(v - 1)).reduce((a, b) => a + b, 0) / r2.length;
  cand.push({ gn, mean, f3, f2, ratio: mean / f3, others, r3, r2 });
}
cand.sort((a, b) => a.ratio - b.ratio);
for (const c of cand) console.log(`${c.gn.padEnd(13)} ${c.mean.toFixed(4).padStart(15)}   ${c.f3.toFixed(4).padStart(14)} ${c.f2.toFixed(4).padStart(6)}   ${c.ratio.toFixed(3).padStart(8)}`);

const best = cand[0], second = cand[1];
console.log(`\nbest ${best.gn} noise/flat ${best.ratio.toFixed(3)}; runner-up ${second.gn} ${second.ratio.toFixed(3)}; gap ${(100 * (second.ratio - best.ratio) / second.ratio).toFixed(1)}%`);
if ((second.ratio - best.ratio) / second.ratio < 0.10) throw new Error('AMBIGUOUS SELECTION (§4.2) — top two normalisers within 10%.');

console.log(`\nv1 (unsymmetrised, wreathL):  noise 0.1937  flat 0.1732  noise/flat 1.118  -> UNUSABLE`);
console.log(`v2 (symmetrised, ${best.gn}):  noise ${best.mean.toFixed(4)}  flat ${best.f3.toFixed(4)}  noise/flat ${best.ratio.toFixed(3)}`);
console.log(`ACCEPTANCE was stated as noise <= 0.6 x flat, i.e. noise/flat <= 0.600.  RESULT: ${best.ratio <= 0.6 ? 'MET — D3-reverse is measurable' : 'MISSED — D3-reverse stays BLOCKED'}`);

console.log('\n=== symmetrised ratio vector (group / ' + best.gn + ') ===');
console.log('group         rev-3   rev-2   |diff|   target(mean)');
const vec = {};
best.others.forEach((m, i) => {
  vec[m] = { 'rev-3': +best.r3[i].toFixed(4), 'rev-2': +best.r2[i].toFixed(4), target: +((best.r3[i] + best.r2[i]) / 2).toFixed(4) };
  console.log(`${m.padEnd(13)} ${best.r3[i].toFixed(4)}  ${best.r2[i].toFixed(4)}  ${Math.abs(best.r3[i] - best.r2[i]).toFixed(4)}   ${((best.r3[i] + best.r2[i]) / 2).toFixed(4)}`);
});

const OUT = dir + '_jqrevtone-v2.json';
const doc = {
  what: 'D3 reverse tone target for the QUARTER, v2 — MIRROR-SYMMETRISED patch groups',
  supersedes: '_jqrevtone.json (v1) — kept, not deleted and not edited (§1.1 retract beside, never rewrite). v1 is unusable: its cross-reference noise floor 0.1937 exceeds its own flat floor 0.1732.',
  built: '2026-08-13, judge round 2',
  method: 'COIN-ART-METHOD.md 12.2 / 12.3 / 13, plus mirror symmetrisation of L/R patch pairs',
  why_symmetrised: `${nPairs - sameSign} of ${nPairs} mirror pairs invert sign between the two independent references, so the L/R difference is the light and not the die.`,
  references: REFS.map(([tag, file, D]) => ({ tag, file, disc: D })),
  patches: PATCHES.map(([n, X, Y, r]) => ({ name: n, X, Y, r, uv: XY2uv(X, Y) })),
  groups: GROUPS.map(([g, m]) => ({ group: g, members: m })),
  field_groups: FIELDG.map(([g, m]) => ({ group: g, members: m })),
  normaliser: best.gn,
  normaliser_selection: {
    criterion: 'minimise (cross-reference noise floor) / (flat floor); field groups ineligible; throw if top two within 10%',
    stated_before_measuring: true,
    candidates: cand.map((c) => ({ group: c.gn, noise: +c.mean.toFixed(4), flat_rev3: +c.f3.toFixed(4), ratio: +c.ratio.toFixed(4) })),
  },
  noise_floor: +best.mean.toFixed(4),
  flat_floor: { 'rev-3': +best.f3.toFixed(4), 'rev-2': +best.f2.toFixed(4) },
  usable_as_a_gate: best.ratio <= 0.6,
  target_ratio_vector: vec,
  locus: 'the 8 non-normaliser device groups above, on the reverse motif, at the tier the scorecard states; field groups reported but excluded (they belong to D13)',
  gate_note: 'NO GATE MAY BE TIGHTER THAN THE NOISE FLOOR. Any D3-reverse gate must be stated as a multiple of it and written down before a value exists (spec §8).',
};
if (existsSync(OUT)) console.log(`\nREFUSING to overwrite ${OUT} — frozen (§6 rule 1).`);
else {
  const s = JSON.stringify(doc, null, 1);
  writeFileSync(OUT, s);
  console.log(`\nFROZEN -> _jqrevtone-v2.json  sha256:${createHash('sha256').update(s).digest('hex')}`);
}
