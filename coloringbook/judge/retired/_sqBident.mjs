// SPECIALIST, quarter reverse — the BYTE-IDENTITY PARTITION for this round.
//
// `_jq7ident.mjs` does the same job but against `_jq7-before-coins.js`, a
// snapshot of commit b1ce909; this round's dispatch commit is b788b0a
// (v1.67.0), so that instrument would attribute thirteen versions of other
// people's work to this round. Method is `_jq7ident.mjs`'s, unchanged, with
// this round's own BEFORE.
//
// BEFORE comes from `_sqBefore.mjs`, which runs `git show b788b0a:src/art/coins.js`
// and prints its sha256 (a5f42e8c…44bb) so the comparison is reproducible from
// the repository rather than from a file this round happened to leave behind.
//
// The claim this settles: only `quarter.reverse` moved. Anything else changing
// means a shared helper was touched and all three concurrent rounds are void.
import { createHash } from 'node:crypto';
import { beforeModule } from './_sqBefore.mjs';

const before = beforeModule();
console.log(`BEFORE ${before.rev}  sha256 ${before.sha256}`);

const A = await import(before.path);
const B = await import('../../src/art/coins.js');
const SIZES = [20, 26, 38, 44, 54, 76, 84, 120, 190];
const h = (s) => createHash('sha256').update(s).digest('hex').slice(0, 12);

let same = 0; const changed = [];
for (const id of A.COIN_IDS) for (const side of ['obverse', 'reverse'])
  for (const size of SIZES) for (const value of [false, true]) {
    const a = A.coinSVG(id, size, { side, value }), b = B.coinSVG(id, size, { side, value });
    if (a === b) { same++; continue; }
    changed.push({ id, side, size, value, a: h(a), b: h(b), da: a.length, db: b.length });
  }

console.log(`### byte-identity partition — ${same + changed.length} renders (${A.COIN_IDS.length} ids x 2 sides x ${SIZES.length} sizes x 2 value)`);
console.log(`identical: ${same}      changed: ${changed.length}`);
const faces = new Set(changed.map((c) => `${c.id}.${c.side}`));
console.log('faces that moved: ' + [...faces].join(', '));
for (const c of changed)
  console.log(`  CHANGED  ${c.id.padEnd(8)} ${c.side.padEnd(8)} ${String(c.size).padStart(4)}px value=${String(c.value).padEnd(5)}  ${c.a} -> ${c.b}   ${c.da} -> ${c.db} chars`);
console.log(faces.size === 1 && faces.has('quarter.reverse')
  ? '\nATTRIBUTABLE: exactly one face moved, and it is this round\'s subject.'
  : `\n!!! NOT ATTRIBUTABLE: ${faces.size} faces moved.`);
