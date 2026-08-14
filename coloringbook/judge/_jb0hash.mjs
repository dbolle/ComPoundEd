// BUCK ($1 NOTE) ROUND 0 — the freeze. Hashes the gates file, every reference,
// every eval library and the subject itself, BEFORE any value is measured
// (COIN-JUDGE.md §1, and nickel r0 proposal N1 for the gates file).
//
// Run: node coloringbook/judge/_jb0hash.mjs        -> table
//      node coloringbook/judge/_jb0hash.mjs json   -> _jb0hashes.json
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../../', import.meta.url).pathname;
const sha = (p) => createHash('sha256').update(readFileSync(join(ROOT, p))).digest('hex');

export const FILES = {
  subject: ['src/art/coins.js', 'src/art/pawcoins.js'],
  gates: ['coloringbook/judge/buck-gates.md'],
  reference: [
    'coloringbook/ref/bill-obv.jpg',
    'coloringbook/ref/bill-obv-2.jpg',
    'coloringbook/ref/bill-rev.jpg',
    'coloringbook/ref/bill-rev-2.jpg',
  ],
  // the `_bl*` family is the note's own toolchain, written by the 2026-08-13
  // note pass. It is READ ONLY for this round — the brief says do not rebuild
  // the toolchain, and §1 says a hashed instrument may not be edited.
  eval: [
    'coloringbook/_blfit.mjs',
    'coloringbook/_blnorm.mjs',
    'coloringbook/_blover.mjs',
    'coloringbook/_blgrid.mjs',
    'coloringbook/_blindep.mjs',
    'coloringbook/_blellipse.mjs',
    'coloringbook/_blseal.mjs',
    'coloringbook/_blours.mjs',
    'coloringbook/_x6lib.mjs',
    'coloringbook/_x6dark.mjs',
    'coloringbook/_x6sweep.mjs',
    'coloringbook/_x6mat.mjs',
  ],
  // written by this round, hashed once they exist
  roundTarget: [
    'coloringbook/judge/_jb1fits.json',
    'coloringbook/judge/_jb4target.json',
  ],
};

const out = {};
for (const [kind, list] of Object.entries(FILES)) {
  for (const f of list) {
    if (!existsSync(join(ROOT, f))) { out[f] = { kind, sha256: null, missing: true }; continue; }
    out[f] = { kind, sha256: sha(f) };
  }
}
if (process.argv[2] === 'json') {
  writeFileSync(join(ROOT, 'coloringbook/judge/_jb0hashes.json'), JSON.stringify(out, null, 2) + '\n');
  console.log('wrote coloringbook/judge/_jb0hashes.json');
}
console.log('kind        sha256(12)    file');
for (const [f, v] of Object.entries(out))
  console.log(`${v.kind.padEnd(11)} ${(v.sha256 ? v.sha256.slice(0, 12) : 'MISSING     ')}  ${f}`);
