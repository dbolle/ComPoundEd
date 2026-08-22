// T1's OBVERSE TABLE, RE-PRINTED FROM T1's OWN IMPORTS — a working instrument
// for iterating on one face without waiting for the full both-faces run.
//
// It is NOT evidence. It calls `featOfOurs`, `featOfRef` and `designSim`
// exported by `_jt1transfer.mjs` and reproduces the same rows; the gate is
// still `node coloringbook/judge/_jt1transfer.mjs`, and every number in the
// hand-back comes from that. This exists because the nickel obverse row has to
// be read a few dozen times and the reverse half of the gate is irrelevant to
// it.
//
// It runs T1's CONTROL first, exactly as T1 does, and prints nothing about our
// art if the control does not sort 4/4.
//
// Reports only: prints, writes nothing.
// Run: node coloringbook/judge/_nk6row.mjs
import { featOfOurs, featOfRef, designSim, setSide, POOL_BY_SIDE, SIZES } from './_jt1transfer.mjs';

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
console.log(`CONTROL ${cpass}/${IDS.length}`);
if (cpass < IDS.length) { console.log('control failed — nothing reported'); process.exit(1); }

for (const px of SIZES) {
  console.log(`=== ${px}px ===   ` + IDS.map((i) => i.padStart(9)).join(''));
  for (const id of IDS) {
    const o = await featOfOurs(id, px);
    const sc = [];
    for (const t of IDS) {
      const vs = [];
      for (const f of POOL[t]) vs.push(designSim(o, await featOfRef(f)));
      sc.push(Math.max(...vs));
    }
    const best = IDS[sc.indexOf(Math.max(...sc))];
    const margin = Math.max(...sc) - Math.max(...sc.filter((_, k) => IDS[k] !== id));
    console.log(`${id.padEnd(9)}       ` + sc.map((v) => v.toFixed(3).padStart(9)).join('')
      + `   ${best === id ? `OK  margin ${margin.toFixed(3)}` : '!! CONFUSED WITH ' + best}`);
  }
}

// LEAVE NO RESIDUE. `_jt1transfer.mjs:featOfOurs` writes each render into
// `ref/_scratch/` and pushes the name onto a TEMPS list that is only unlinked
// by that file's own direct-run block — so any instrument that IMPORTS it
// leaves files in the reference tree (36 were sitting there from earlier runs
// when this round started). WRITERS.md requires running the library to leave
// the repository byte-identical, so this cleans up after itself. Reported as
// an instrument fault; `_jt1transfer.mjs` is not edited.
import { unlinkSync } from 'node:fs';
for (const id of IDS) for (const px of SIZES) {
  try { unlinkSync(new URL(`../ref/_scratch/obverse-${id}-${px}.png`, import.meta.url).pathname); } catch { /* already gone */ }
}
