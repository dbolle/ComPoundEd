// BUCK r14 (specialist) — a copy of _jk9ident.mjs (READ ONLY, hashed) whose
// snap() takes the coins.js path as an argument, so the BEFORE snapshot can be
// taken from src/art/_je14-before-coins.js without checking the tree back out.
// Made as a copy because editing an instrument voids the round (S1.1).
// Original header follows.
//
// BUCK r9 (specialist) — §5's BYTE-IDENTITY PARTITION, which is the check that
// makes three concurrent rounds attributable: every emitted render, hashed, so
// the diff can be shown to touch only this round's own face.
//
// SUBJECTS COVERED (PY3): all five ids in `src/art/coins.js` x both sides x
// six sizes x value on/off = 120 renders, PLUS all of `src/art/pawcoins.js`
// (which carries a SECOND noteSVG this round does not touch).
//
//   node coloringbook/judge/_jk9ident.mjs <out.json>          write a snapshot
//   node coloringbook/judge/_jk9ident.mjs <a.json> <b.json>   compare two
import { createHash } from 'node:crypto';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';

const IDS = ['penny', 'nickel', 'dime', 'quarter', 'buck'];
const SIZES = [26, 40, 54, 84, 120, 190];
const SIDES = ['obverse', 'reverse'];
const h = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);

async function snap(coinsPath = '../../src/art/coins.js') {
  const out = {};
  for (const [mod, tag] of [[await import(coinsPath), 'coins'],
    [await import('../../src/art/pawcoins.js'), 'paw']]) {
    for (const id of (tag === 'coins' ? IDS : (mod.COIN_IDS || IDS)))
      for (const side of SIDES) for (const size of SIZES) for (const value of [false, true]) {
        const svg = mod.coinSVG(id, size, { side, value });
        out[`${tag}|${id}|${side}|${size}|${value ? 'v' : '-'}`] = h(svg);
      }
  }
  return out;
}


const A = await snap('../../src/art/_je14-before-coins.js');
const B = await snap('../../src/art/coins.js');
const keys = [...new Set([...Object.keys(A), ...Object.keys(B)])].sort();
const changed = keys.filter((k) => A[k] !== B[k]);
const byId = {};
for (const k of changed) { const [tag, id, side] = k.split('|'); byId[`${tag}/${id}/${side}`] = (byId[`${tag}/${id}/${side}`] || 0) + 1; }
console.log(`${changed.length} of ${keys.length} renders changed`);
for (const [k, n] of Object.entries(byId).sort()) console.log(`  ${k.padEnd(28)} ${n}`);
const stray = Object.keys(byId).filter((k) => !/^coins\/buck\//.test(k));
console.log(stray.length ? `*** OUT OF SCOPE — this round owns coins/buck only: ${stray.join(', ')} ***`
  : 'partition CLEAN — every changed render is coins/buck; the four coins and pawcoins.js are byte-identical');
// RESPONSE TEST — the partition must be able to SEE a change outside the note.
const C = await snap('../../src/art/coins.js');
C['coins|quarter|reverse|84|-'] = 'deadbeef';
const seen = keys.filter((k) => A[k] !== C[k]).some((k) => k.startsWith('coins|quarter'));
console.log(`RESPONSE TEST — a forged quarter hash in the AFTER snapshot: ${seen ? 'DETECTED as expected' : '*** NOT DETECTED — UNTRUSTED ***'}`);
