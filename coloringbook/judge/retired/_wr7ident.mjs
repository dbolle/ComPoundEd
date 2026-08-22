// ROUND 10 (specialist), QUARTER OBVERSE — THE BYTE-IDENTITY PARTITION.
// Same shape as `_jw14ident.mjs`, against this round's own snapshot.
//
// BEFORE is `_wr0-before-coins.js`, taken at the head of this round
// (sha256 64fbe991b4edcdf6315fb7a5c681b5eaa4fba34ebfd598b7bdca6f03edffe10f,
// byte-identical to `src/art/coins.js` at commit d2353ca, v1.70.0).
//
// This round is a REFUSAL: it changes no stroke width and no path. The expected
// result is therefore `changed: 0` — every render on every coin, both sides,
// nine sizes, both value flags, byte-identical. A comment-only edit that moved
// a render would be a bug in the edit.
//
// Run: node coloringbook/judge/_wr7ident.mjs
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BEFORE = (() => {
  const src = readFileSync('coloringbook/judge/_wr0-before-coins.js', 'utf8');
  const abs = new URL('../../src/engine/money.js', import.meta.url).pathname;
  const dir = mkdtempSync(join(tmpdir(), 'wr7i-'));
  const out = join(dir, 'before-coins.mjs');
  writeFileSync(out, src.replace("from '../engine/money.js'", `from '${abs}'`));
  return out;
})();

const A = await import(BEFORE);
const B = await import('../../src/art/coins.js');
const SIZES = [20, 26, 38, 44, 54, 76, 84, 120, 190];
const h = (s) => createHash('sha256').update(s).digest('hex').slice(0, 12);

let same = 0; const changed = [];
for (const id of A.COIN_IDS) {
  for (const side of ['obverse', 'reverse']) {
    for (const size of SIZES) {
      for (const value of [false, true]) {
        const a = A.coinSVG(id, size, { side, value }), b = B.coinSVG(id, size, { side, value });
        if (a === b) { same++; continue; }
        changed.push({ id, side, size, value, a: h(a), b: h(b), da: a.length, db: b.length });
      }
    }
  }
}
console.log(`### byte-identity partition — ${same + changed.length} renders (${A.COIN_IDS.length} ids x 2 sides x ${SIZES.length} sizes x 2 value)`);
console.log(`identical: ${same}      changed: ${changed.length}`);
for (const c of changed) {
  console.log(`  CHANGED  ${c.id.padEnd(8)} ${c.side.padEnd(8)} ${String(c.size).padStart(4)}px value=${String(c.value).padEnd(5)}  ${c.a} -> ${c.b}   ${c.da} -> ${c.db} chars`);
}
const faces = [...new Set(changed.map((c) => `${c.id}/${c.side}`))];
console.log(`\nfaces touched: ${faces.length ? faces.join(', ') : 'none'}`);
console.log(changed.length === 0
  ? 'REFUSAL CONFIRMED: no render on any coin changed. The diff is comment-only.'
  : `NOT a refusal — ${faces.join(', ')} moved. Check the diff.`);
