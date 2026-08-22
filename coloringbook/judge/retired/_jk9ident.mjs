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

async function snap() {
  const out = {};
  for (const [mod, tag] of [[await import('../../src/art/coins.js'), 'coins'],
    [await import('../../src/art/pawcoins.js'), 'paw']]) {
    for (const id of (tag === 'coins' ? IDS : (mod.COIN_IDS || IDS)))
      for (const side of SIDES) for (const size of SIZES) for (const value of [false, true]) {
        const svg = mod.coinSVG(id, size, { side, value });
        out[`${tag}|${id}|${side}|${size}|${value ? 'v' : '-'}`] = h(svg);
      }
  }
  return out;
}

const [a, b] = [process.argv[2], process.argv[3]];
if (!b) {
  const s = await snap();
  writeFileSync(a, JSON.stringify(s, null, 0) + '\n');
  console.log(`${a}: ${Object.keys(s).length} renders hashed`);
} else {
  if (!existsSync(a)) throw new Error('missing ' + a);
  const A = JSON.parse(readFileSync(a, 'utf8'));
  const B = existsSync(b) ? JSON.parse(readFileSync(b, 'utf8')) : await snap();
  if (!existsSync(b)) writeFileSync(b, JSON.stringify(B, null, 0) + '\n');
  const keys = [...new Set([...Object.keys(A), ...Object.keys(B)])].sort();
  const changed = keys.filter((k) => A[k] !== B[k]);
  const byId = {};
  for (const k of changed) { const [tag, id, side] = k.split('|'); byId[`${tag}/${id}/${side}`] = (byId[`${tag}/${id}/${side}`] || 0) + 1; }
  console.log(`${changed.length} of ${keys.length} renders changed`);
  for (const [k, n] of Object.entries(byId).sort()) console.log(`  ${k.padEnd(28)} ${n}`);
  const stray = Object.keys(byId).filter((k) => !/^coins\/buck\//.test(k));
  console.log(stray.length
    ? `*** OUT OF SCOPE — this round owns coins/buck only: ${stray.join(', ')} ***`
    : 'partition CLEAN — every changed render is coins/buck; the four coins and pawcoins.js are byte-identical');
}
