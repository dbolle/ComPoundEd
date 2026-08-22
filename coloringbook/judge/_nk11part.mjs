// THE BYTE-IDENTITY RENDER PARTITION (COIN-JUDGE.md §0.2).
//
// Renders every id x side x value x size from BOTH trees and partitions the
// results into identical and changed. A round that claims "nickel obverse
// only" is either provable this way or it is a claim.
//
// The BEFORE tree is passed as a path so it can be a pristine checkout of the
// dispatch commit rather than another round's working copy — the fault the
// nickel round-4 partition note names.
//
// Reports only: prints, writes nothing.
// Run: node coloringbook/judge/_nk11part.mjs /path/to/before/src/art/coins.js
import { createHash } from 'node:crypto';

const beforePath = process.argv[2];
if (!beforePath) { console.log('usage: _nk11part.mjs <before coins.js>'); process.exit(1); }
const A = await import(beforePath);
const B = await import('../../src/art/coins.js');

const IDS = ['penny', 'nickel', 'dime', 'quarter', 'buck'];
const SIZES = [26, 38, 44, 48, 54, 62, 76, 84, 120, 190, 380];
const h = (s) => createHash('sha256').update(s).digest('hex').slice(0, 12);

let same = 0; const changed = [];
for (const id of IDS) for (const side of ['obverse', 'reverse']) for (const value of [false, true]) for (const px of SIZES) {
  let a, b;
  try { a = A.coinSVG(id, px, { side, value }); } catch (e) { a = 'ERR ' + e.message; }
  try { b = B.coinSVG(id, px, { side, value }); } catch (e) { b = 'ERR ' + e.message; }
  if (a === b) same++; else changed.push({ id, side, value, px, a: h(a), b: h(b), da: b.length - a.length });
}
console.log(`${same + changed.length} renders: ${same} identical, ${changed.length} changed`);
const keys = new Set(changed.map((c) => `${c.id}.${c.side}`));
console.log('changed faces: ' + (keys.size ? [...keys].join(', ') : 'none'));
for (const c of changed) console.log(`  ${c.id.padEnd(8)}${c.side.padEnd(9)}value=${String(c.value).padEnd(6)}${String(c.px).padStart(4)}px  ${c.a} -> ${c.b}  ${c.da >= 0 ? '+' : ''}${c.da} bytes`);
