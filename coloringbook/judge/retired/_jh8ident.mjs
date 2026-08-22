// ROUND 8 — BYTE IDENTITY between this round's pinned baseline
// (coloringbook/judge/_jh8-before-coins.js) and the working tree, over every
// render the judge scores.
//
// Why a new file rather than `_jc5ident.mjs`: that one hard-codes round 5's
// baseline path (`_jc5-before-coins.js`), which does not exist on this tree. It
// is not edited (§1.1). Everything else here is its logic, unchanged.
//
// §5's ATTRIBUTION CHECK. Three specialists are running concurrently on three
// different faces. If this round's diff touches only `penny obverse`, the round
// is attributable; a render that changes on any other coin or side is the bug,
// not the result.
//
// RESPONSE TEST: the two revisions are also each compared against THEMSELVES,
// which must report 0 differing renders. A comparator that cannot report
// identity is not evidence of difference either.
//
// Run: node coloringbook/judge/_jh8ident.mjs
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';

const IDS = ['penny', 'nickel', 'dime', 'quarter', 'buck'];
const SIZES = [26, 38, 44, 54, 76, 84, 120, 190, 380];
const SIDES = ['obverse', 'reverse'];

async function load(p, tag) {
  const tmp = `src/art/_jh8tmp-${tag}.js`;
  writeFileSync(tmp, readFileSync(p, 'utf8'));
  try { return await import(`${process.cwd()}/${tmp}?t=${Date.now()}${Math.random()}`); } finally { rmSync(tmp); }
}
const A = await load('coloringbook/judge/_jh8-before-coins.js', 'idA');
const B = await load('src/art/coins.js', 'idB');
const A2 = await load('coloringbook/judge/_jh8-before-coins.js', 'idA2');

function compare(X, Y) {
  let n = 0; const diff = [];
  for (const id of IDS) for (const side of SIDES) for (const size of SIZES) for (const value of [true, false]) {
    n++;
    if (X.coinSVG(id, size, { side, value }) !== Y.coinSVG(id, size, { side, value })) diff.push(`${id} ${side} ${size}px value=${value}`);
  }
  return { n, diff };
}
const h = (m) => createHash('sha256').update(IDS.flatMap((id) => SIDES.flatMap((s) => SIZES.map((z) => m.coinSVG(id, z, { side: s })))).join('\0')).digest('hex');

const self = compare(A, A2);
console.log(`RESPONSE TEST — baseline vs a second load of the SAME baseline: ${self.diff.length} of ${self.n} differ (must be 0)`);
const r = compare(A, B);
console.log(`\n${r.n} renders compared`);
console.log(`baseline concat sha256 ${h(A)}`);
console.log(`working  concat sha256 ${h(B)}`);
if (!r.diff.length) console.log('BYTE-IDENTICAL on every render');
else {
  const byFace = new Map();
  for (const d of r.diff) { const k = d.split(' ').slice(0, 2).join(' '); byFace.set(k, (byFace.get(k) || 0) + 1); }
  console.log(`${r.diff.length} renders differ, by FACE:`);
  for (const [k, v] of [...byFace].sort()) console.log(`   ${k.padEnd(20)} ${v}`);
  const stray = [...byFace.keys()].filter((k) => k !== 'penny obverse');
  console.log(stray.length ? `   ATTRIBUTION FAILURE — faces outside this round's scope changed: ${stray.join(', ')}` : '   attribution clean — every changed render is penny obverse');
}
