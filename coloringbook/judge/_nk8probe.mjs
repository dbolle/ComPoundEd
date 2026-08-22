// A PROBE: score a CANDIDATE nickel obverse without editing the art file.
//
// `OBVERSE` is an exported object literal, so a candidate can be applied by
// mutating `OBVERSE.nickel` in memory before the first render. Nothing is
// written; the file on disk is untouched; the process exits and the mutation
// dies with it. This is the same idiom `_jl3probe.mjs` uses, and it exists so
// that a placement or flag sweep costs one process each instead of one edit
// each — an edit-per-candidate loop is how a number with no derivation behind
// it gets committed by accident.
//
// It prints T1's own obverse table, computed with T1's own exports, and runs
// T1's control first. It is a WORKING INSTRUMENT, not evidence: every number in
// the hand-back comes from `node coloringbook/judge/_jt1transfer.mjs` run
// against the committed file.
//
// Run: node coloringbook/judge/_nk8probe.mjs '{"iconS":0.916}'
import { OBVERSE } from '../../src/art/coins.js';
import { featOfOurs, featOfRef, designSim, setSide, POOL_BY_SIDE, SIZES } from './_jt1transfer.mjs';

const patch = JSON.parse(process.argv[2] || '{}');
Object.assign(OBVERSE.nickel, patch);
console.log('patch ' + JSON.stringify(patch));

setSide('obverse');
const IDS = Object.keys(POOL_BY_SIDE.obverse);
const POOL = POOL_BY_SIDE.obverse;

let cpass = 0;
for (const id of IDS) {
  const held = POOL[id][0];
  const h = await featOfRef(held);
  const sc = [];
  for (const t of IDS) {
    const vs = [];
    for (const f of POOL[t].filter((f) => f !== held)) vs.push(designSim(h, await featOfRef(f)));
    sc.push(Math.max(...vs));
  }
  if (IDS[sc.indexOf(Math.max(...sc))] === id) cpass++;
}
if (cpass < IDS.length) { console.log(`CONTROL ${cpass}/4 — nothing reported`); process.exit(1); }

for (const px of SIZES) {
  const o = await featOfOurs('nickel', px);
  const sc = [];
  for (const t of IDS) {
    const vs = [];
    for (const f of POOL[t]) vs.push(designSim(o, await featOfRef(f)));
    sc.push(Math.max(...vs));
  }
  const best = IDS[sc.indexOf(Math.max(...sc))];
  const margin = Math.max(...sc) - Math.max(...sc.filter((_, k) => IDS[k] !== 'nickel'));
  console.log(`${String(px).padStart(3)}px  ` + IDS.map((i, k) => `${i} ${sc[k].toFixed(3)}`).join('  ')
    + `   ${best === 'nickel' ? `OK margin ${margin.toFixed(3)}` : '!! ' + best}`);
}

// LEAVE NO RESIDUE — see the note at the foot of `_nk6row.mjs`.
import { unlinkSync } from 'node:fs';
for (const px of SIZES) {
  try { unlinkSync(new URL(`../ref/_scratch/obverse-nickel-${px}.png`, import.meta.url).pathname); } catch { /* already gone */ }
}
