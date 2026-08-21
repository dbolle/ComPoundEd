// ROUND 7 — the BYTE-IDENTITY PARTITION (spec 5: "the check that makes this
// safe is one the process already runs every round").
//
// Three specialists are working concurrently on three different coins' obverses
// under the amended spec 5. The condition that makes that attributable is that
// each round's diff touches only its own face. This emits every render both
// revisions produce and partitions them into identical and changed, so the
// claim "only the quarter obverse moved" is a measurement rather than an
// assertion.
//
// BEFORE is `_jq7-before-coins.js`, the snapshot taken at the head of this round
// (sha256 de270b1282c9f2cca5211fe25fec38020f4705c1085c901053d7f7002f233364,
// byte-identical to `src/art/coins.js` on main at commit b1ce909).
//
// Run: node coloringbook/judge/_jq7ident.mjs
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BEFORE = (() => {
  const src = readFileSync('coloringbook/judge/_jq7-before-coins.js', 'utf8');
  const abs = new URL('../../src/engine/money.js', import.meta.url).pathname;
  const dir = mkdtempSync(join(tmpdir(), 'jq7i-'));
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
console.log(faces.length === 1 && faces[0] === 'quarter/obverse'
  ? 'ATTRIBUTABLE: every changed render is the quarter obverse; no other coin and no other face moved.'
  : 'NOT the single-face partition spec 5 requires — see the list above.');
