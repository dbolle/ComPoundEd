// TASK 2, step 3 — CHOOSING THE REVERSE'S NORMALISER.
//
// On the obverse it is the cheek: large, flat, feature-free, and §12.2's whole
// argument is that dividing by it removes exposure, lighting strength, white
// point and palette lightness and leaves the RELATIONSHIPS BETWEEN FEATURES,
// which is what line work controls. The reverse has no cheek, and the quarter's
// tone normaliser was already called "the weakest of the four coins" (§9 of the
// judge spec). So this is a selection, and §4.2 applies:
//
//   > Any instrument that picks one item out of a candidate set prints the
//   > WHOLE set, and throws when the choice is ambiguous.
//
// ELIGIBILITY, stated before any number exists:
//   The normaliser must be INSIDE THE DEVICE. The three `field*` patches are
//   measured and reported but are NOT eligible. Reason: normalising by the
//   field would fold the device-against-field level into all twelve ratios,
//   which (a) is the whole content of D13 and would be double-counted here, and
//   (b) destroys the property §12.2 exists for — that D3 measures internal
//   relationships and nothing else. §3 of the judge spec says D3 is
//   "structurally blind" to device-vs-field BY DESIGN; that blindness is the
//   feature and D13 is the compensation.
//
// SELECTION CRITERION, stated before any number exists:
//   Choose the eligible patch that MINIMISES the cross-reference disagreement
//   of the resulting ratio vector — mean |ratio(rev-3) - ratio(rev-2)| over the
//   other patches. Rationale: that disagreement is the metric's own noise
//   floor. Two independent photographs of the same design are measuring the
//   same die; whatever they disagree about is illumination and toning, not
//   design, and NO GATE CAN BE TIGHTER THAN IT. Choosing the normaliser that
//   minimises it is choosing the one that divides out the most illumination,
//   which is precisely the job §12.2 gives the cheek.
//   Tie-break, if the top two are within 10%: prefer the LARGER patch (§12.2's
//   "large, flat, feature-free"). If still within 10%, THROW — an ambiguous
//   selection is not a selection.
//
// Also computed, per §12.3: the FLAT FLOOR for each candidate — what a drawing
// with every ratio set to 1.000 would score. That is the anti-gaming floor and
// it must be reported with the choice, because a normaliser that makes the
// floor tiny has made the metric unable to reward anything.
import { writeFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { REFS, load } from './_jq30inv.mjs';
import { PATCHES, sample, XY2uv } from './_jq31patch.mjs';

const dir = new URL('./', import.meta.url).pathname;
const DEVICE = PATCHES.filter(([n]) => !n.startsWith('field'));
const FIELD = PATCHES.filter(([n]) => n.startsWith('field'));

const G = {};
for (const [tag, file, D] of REFS) G[tag] = { g: await load(file), D };

const med = {};
for (const tag of Object.keys(G)) {
  med[tag] = {};
  for (const [n, X, Y, r] of PATCHES) med[tag][n] = sample(G[tag].g, G[tag].D, X, Y, r).med;
}

console.log('=== candidate set (§4.2) — EVERY eligible normaliser, all printed ===');
console.log('normaliser   cross-ref mean|dR|  worst|dR| (patch)         flat floor rev-3  rev-2   patch area');
const cand = [];
for (const [nn, , , nr] of DEVICE) {
  const others = DEVICE.filter(([m]) => m !== nn).map(([m]) => m);
  const r3 = others.map((m) => med['rev-3'][m] / med['rev-3'][nn]);
  const r2 = others.map((m) => med['rev-2'][m] / med['rev-2'][nn]);
  const d = r3.map((v, i) => Math.abs(v - r2[i]));
  const mean = d.reduce((a, b) => a + b, 0) / d.length;
  const wi = d.indexOf(Math.max(...d));
  // §12.3 flat floor: every ratio set to 1.000 -> the reference's own deviation
  const f3 = r3.map((v) => Math.abs(v - 1)).reduce((a, b) => a + b, 0) / r3.length;
  const f2 = r2.map((v) => Math.abs(v - 1)).reduce((a, b) => a + b, 0) / r2.length;
  cand.push({ nn, mean, worst: d[wi], worstAt: others[wi], f3, f2, area: Math.PI * nr * nr });
}
cand.sort((a, b) => a.mean - b.mean);
for (const c of cand) console.log(`${c.nn.padEnd(12)} ${c.mean.toFixed(4).padStart(16)}  ${c.worst.toFixed(4)} (${c.worstAt.padEnd(9)})  ${c.f3.toFixed(4).padStart(14)} ${c.f2.toFixed(4).padStart(6)} ${c.area.toFixed(1).padStart(11)} vb^2`);

console.log('\nINELIGIBLE (field patches), shown for comparison only:');
for (const [nn] of FIELD) {
  const others = DEVICE.map(([m]) => m);
  const r3 = others.map((m) => med['rev-3'][m] / med['rev-3'][nn]);
  const r2 = others.map((m) => med['rev-2'][m] / med['rev-2'][nn]);
  const d = r3.map((v, i) => Math.abs(v - r2[i]));
  console.log(`${nn.padEnd(12)} ${(d.reduce((a, b) => a + b, 0) / d.length).toFixed(4).padStart(16)}`);
}

const a = cand[0], b = cand[1];
console.log(`\nbest ${a.nn} ${a.mean.toFixed(4)}   runner-up ${b.nn} ${b.mean.toFixed(4)}   gap ${(100 * (b.mean - a.mean) / b.mean).toFixed(1)}%`);
let chosen = a;
if ((b.mean - a.mean) / b.mean < 0.10) {
  console.log('within 10% — applying the declared tie-break: larger patch wins.');
  chosen = a.area >= b.area ? a : b;
  if (Math.abs(a.area - b.area) / Math.max(a.area, b.area) < 0.10)
    throw new Error(`AMBIGUOUS SELECTION: ${a.nn} and ${b.nn} within 10% on both criteria. §4.2 — this is not a selection.`);
}
console.log(`\nCHOSEN NORMALISER: ${chosen.nn}`);
console.log(`  cross-reference noise floor with this normaliser: mean |dRatio| ${chosen.mean.toFixed(4)}, worst ${chosen.worst.toFixed(4)} at ${chosen.worstAt}`);
console.log(`  §12.3 FLAT FLOOR: rev-3 ${chosen.f3.toFixed(4)}, rev-2 ${chosen.f2.toFixed(4)} — a drawing with no interior tone at all scores this.`);
console.log(`  A GATE TIGHTER THAN ${chosen.mean.toFixed(4)} IS NOT MEASURABLE with the references we hold.`);

// the ratio vectors themselves, both references, published
console.log('\n=== the frozen ratio vector (patch / ' + chosen.nn + '), both references ===');
console.log('patch        rev-3   rev-2   |diff|');
const others = DEVICE.filter(([m]) => m !== chosen.nn).map(([m]) => m);
const vec = {};
for (const m of others) {
  const v3 = med['rev-3'][m] / med['rev-3'][chosen.nn], v2 = med['rev-2'][m] / med['rev-2'][chosen.nn];
  vec[m] = { 'rev-3': +v3.toFixed(4), 'rev-2': +v2.toFixed(4), mean: +((v3 + v2) / 2).toFixed(4) };
  console.log(`${m.padEnd(11)} ${v3.toFixed(4)}  ${v2.toFixed(4)}  ${Math.abs(v3 - v2).toFixed(4)}`);
}
for (const [m] of FIELD) {
  const v3 = med['rev-3'][m] / med['rev-3'][chosen.nn], v2 = med['rev-2'][m] / med['rev-2'][chosen.nn];
  console.log(`${m.padEnd(11)} ${v3.toFixed(4)}  ${v2.toFixed(4)}  ${Math.abs(v3 - v2).toFixed(4)}   (field, not scored by D3)`);
}

// FREEZE — §6 rule 1: write once, refuse to overwrite.
const OUT = dir + '_jqrevtone.json';
const doc = {
  what: 'D3 reverse tone target for the QUARTER — patch set, normaliser, and the reference ratio vector',
  built: '2026-08-13, judge round 2',
  method: 'COIN-ART-METHOD.md 12.2 (cheek-normalised patch ratios), 13 (inventory first), 12.3 (flat floor)',
  references: REFS.map(([tag, file, D]) => ({ tag, file, disc: D })),
  independence: 'quarter-rev-3.jpg vs quarter-rev-2.png: registered design-NCC 0.5091 against a 0.1977 control floor (_jq20indep.mjs). Two photographs, two coins, two photographers.',
  coords: 'viewBox, X = 50 + 47u, Y = 50 + 47v, radius in viewBox units; disc r = 47',
  patches: PATCHES.map(([n, X, Y, r]) => ({ name: n, X, Y, r, uv: XY2uv(X, Y), scored: !n.startsWith('field') })),
  normaliser: chosen.nn,
  normaliser_selection: {
    criterion: 'minimise mean |ratio(rev-3) - ratio(rev-2)| over the scored patches; field patches ineligible; tie-break larger patch; throw if still within 10%',
    stated_before_measuring: true,
    candidates: cand.map((c) => ({ patch: c.nn, cross_ref_mean: +c.mean.toFixed(4), flat_floor_rev3: +c.f3.toFixed(4) })),
  },
  noise_floor: { cross_reference_mean_abs_dratio: +chosen.mean.toFixed(4), worst: +chosen.worst.toFixed(4), worst_at: chosen.worstAt },
  flat_floor: { 'rev-3': +chosen.f3.toFixed(4), 'rev-2': +chosen.f2.toFixed(4) },
  target_ratio_vector: vec,
  locus: 'the 12 device patches above, evaluated on the reverse motif at the tier stated by the scorecard; the field patches are reported but excluded from the D3 score (they belong to D13)',
};
if (existsSync(OUT)) { console.log(`\nREFUSING to overwrite ${OUT} — the target is frozen (§6 rule 1).`); }
else {
  writeFileSync(OUT, JSON.stringify(doc, null, 1));
  console.log(`\nFROZEN -> _jqrevtone.json  sha256:${createHash('sha256').update(JSON.stringify(doc, null, 1)).digest('hex')}`);
}
