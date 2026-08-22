// ROUND 5 — BYTE IDENTITY between the pinned baseline and the working tree,
// over every render the judge scores. §1's hashing argument, applied to the art:
// if every emitted string is byte-identical then every pixel metric on the
// scorecard is unchanged by construction and nothing needs re-measuring to know
// it did not regress. If some differ, the list of which is the attribution.
//
// Run: node coloringbook/judge/_jc5ident.mjs
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';

const IDS = ['penny', 'nickel', 'dime', 'quarter', 'buck'];
const SIZES = [26, 38, 44, 54, 76, 84, 120, 190, 380];
const SIDES = ['obverse', 'reverse'];

async function load(p, tag) {
  const tmp = `src/art/_jc5tmp-${tag}.js`;
  writeFileSync(tmp, readFileSync(p, 'utf8'));
  try { return await import(`${process.cwd()}/${tmp}?t=${Date.now()}`); } finally { rmSync(tmp); }
}
const A = await load('coloringbook/judge/_jc5-before-coins.js', 'idA');
const B = await load('src/art/coins.js', 'idB');

let n = 0; const diff = [];
for (const id of IDS) for (const side of SIDES) for (const size of SIZES) for (const value of [true, false]) {
  const a = A.coinSVG(id, size, { side, value });
  const b = B.coinSVG(id, size, { side, value });
  n++;
  if (a !== b) diff.push(`${id} ${side} ${size}px value=${value}`);
}
const h = (m) => createHash('sha256').update(IDS.flatMap((id) => SIDES.flatMap((s) => SIZES.map((z) => m.coinSVG(id, z, { side: s })))).join('\0')).digest('hex');
console.log(`${n} renders compared`);
console.log(`baseline concat sha256 ${h(A)}`);
console.log(`working  concat sha256 ${h(B)}`);
console.log(diff.length === 0
  ? 'BYTE-IDENTICAL on every render — the change is comments only, so every pixel metric is unchanged by construction'
  : `${diff.length} renders differ:\n  ` + diff.join('\n  '));
