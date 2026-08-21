// _jn6ident — the BYTE-IDENTITY PARTITION (§5). Three rounds ran concurrently
// on three different obverses; the check that makes that safe is showing that
// each round's diff touches only its own face. This emits every id x side x
// size the app can draw, from the pristine copy and from the returned tree,
// and prints exactly which renders differ.
//
// A render that differs but should not is the bug, and it is the whole reason
// this file exists — not a summary statistic. So the FULL list of changed
// renders is printed, not a count.
//
// Run: node coloringbook/judge/_jn6ident.mjs
import { createHash } from 'node:crypto';

// The pristine copy lives beside the judge's files, where `../engine/money.js`
// does not resolve, so its ONE relative import is absolutised into a temp copy.
// Asserted to match exactly once, and asserted to be the ONLY difference.
const BEFORE = new URL('./_jn6-before-coins.js', import.meta.url).pathname;
const AFTER = new URL('../../src/art/coins.js', import.meta.url).pathname;
const { readFileSync, writeFileSync, mkdtempSync } = await import('node:fs');
const { tmpdir } = await import('node:os');
const { join } = await import('node:path');
const MONEY = new URL('../../src/engine/money.js', import.meta.url).pathname;
const rawB = readFileSync(BEFORE, 'utf8');
if (rawB.split("from '../engine/money.js'").length - 1 !== 1) throw new Error('import rewrite did not match once');
const bp = join(mkdtempSync(join(tmpdir(), 'jn6ident-')), 'coins.js');
writeFileSync(bp, rawB.split("from '../engine/money.js'").join(`from '${MONEY}'`));
if (readFileSync(bp, 'utf8').split(`from '${MONEY}'`).join("from '../engine/money.js'") !== rawB) throw new Error('copy differs by more than the import');
const a = await import(bp), b = await import(AFTER);
const SIZES = [26, 38, 42, 44, 54, 76, 84, 120, 190, 380];
const h = (s) => createHash('sha256').update(s).digest('hex').slice(0, 12);

const changed = [], same = [];
for (const id of a.COIN_IDS) for (const side of ['obverse', 'reverse']) for (const size of SIZES) {
  const x = a.coinSVG(id, size, { side }), y = b.coinSVG(id, size, { side });
  (x === y ? same : changed).push(`${id}.${side[0]}@${size}`);
}
console.log(`### byte-identity partition over ${same.length + changed.length} renders (${a.COIN_IDS.length} ids x 2 sides x ${SIZES.length} sizes)`);
console.log(`before ${BEFORE}  sha ${h(JSON.stringify(a.coinSVG('nickel', 380)))}`);
console.log(`unchanged: ${same.length}    CHANGED: ${changed.length}`);
console.log(`changed renders: ${changed.length ? changed.join(' ') : 'none'}`);
const faces = [...new Set(changed.map((c) => c.split('@')[0]))];
console.log(`faces touched: ${faces.join(', ') || 'none'}`);
if (faces.some((f) => f !== 'nickel.o')) console.log('*** A FACE OUTSIDE THIS ROUND\'S SCOPE MOVED — this diff is void under §5 ***');
else console.log('every changed render is on nickel.obverse, which is this round\'s subject');
// and the path data, separately: a tone-only change must leave every `d=` alone
let dsame = 0, ddiff = [];
for (const id of a.COIN_IDS) for (const side of ['obverse', 'reverse']) for (const size of SIZES) {
  const D = (s) => (s.match(/ d="[^"]*"/g) || []).join('|');
  (D(a.coinSVG(id, size, { side })) === D(b.coinSVG(id, size, { side })) ? dsame++ : ddiff.push(`${id}.${side[0]}@${size}`));
}
console.log(`\npath data (every d="..."): identical in ${dsame} of ${same.length + changed.length} renders` +
  (ddiff.length ? `; differs in ${ddiff.join(' ')}` : ' — NO GEOMETRY MOVED, this round is tone only'));
