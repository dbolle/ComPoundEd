// PENNY ROUND 0 — the freeze. Hashes every target, reference, eval library and
// the subject itself, BEFORE any value is measured (COIN-JUDGE.md §1).
//
// Run: node coloringbook/judge/_jp0hash.mjs          -> table
//      node coloringbook/judge/_jp0hash.mjs json     -> _jp0hashes.json
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../../', import.meta.url).pathname;
const sha = (p) => createHash('sha256').update(readFileSync(join(ROOT, p))).digest('hex');

export const FILES = {
  subject: ['src/art/coins.js'],
  target: [
    'coloringbook/_headmask-penny.json',
    'coloringbook/_tonepatches-penny.json',
    'coloringbook/_pyreg.json',
    'coloringbook/_rvtarget.json',
  ],
  reference: [
    'coloringbook/ref/penny-obv.jpg',
    'coloringbook/ref/penny-obv-2.jpg',
    'coloringbook/ref/penny-obv-3.jpg',
    'coloringbook/ref/penny-obv-4.png',
    'coloringbook/ref/penny-rev.jpg',
    'coloringbook/ref/penny-rev-2.png',
    'coloringbook/ref/penny-rev-artwork.jpg',
  ],
  eval: [
    'coloringbook/judge/_jqgeom.mjs',
    'coloringbook/judge/_jq8contain-v2.mjs',
    'coloringbook/judge/_jq8depth.mjs',
    'coloringbook/judge/_jq8depthrun.mjs',
    'coloringbook/judge/_jq9well.mjs',
    'coloringbook/judge/_jq67edge.mjs',
    'coloringbook/judge/_jq10tier-v2.mjs',
    'coloringbook/judge/_jq11disc.mjs',
    'coloringbook/judge/_jq20indep.mjs',
    'coloringbook/judge/_jq23count.mjs',
    'coloringbook/judge/_jq44unwrap.mjs',
    'coloringbook/_pylib.mjs',
    'coloringbook/_pyeval.mjs',
    'coloringbook/_rvnorm.mjs',
    'coloringbook/_rvlib2.mjs',
    'coloringbook/_x6lib.mjs',
    'coloringbook/_x6dark.mjs',
  ],
  // written by this round, hashed once they exist
  roundTarget: [
    'coloringbook/judge/_jp1discs.json',
    'coloringbook/judge/_jp4band.json',
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
  writeFileSync(new URL('./_jp0hashes.json', import.meta.url).pathname, JSON.stringify(out, null, 1));
  console.log('wrote _jp0hashes.json');
}
for (const [f, v] of Object.entries(out)) {
  console.log(`${v.missing ? 'MISSING  ' : v.sha256.slice(0, 16)}  ${v.kind.padEnd(11)} ${f}`);
}
