// ROUND 3 SPECIALIST — attribution sweep (spec §1's cheapest evidence).
// Emits every id x side x value x size for the before and the after source and
// reports which strings changed. Anything outside `quarter` changing is a bug:
// glyphs are shared (the $1 note draws HEAD.Washington) and `struck()` gained a
// parameter this round.
//   node coloringbook/_r3diff.mjs
import { readFileSync } from 'node:fs';
import { loadCoins } from './judge/_jq8contain-v2.mjs';

const ROOT = new URL('../', import.meta.url).pathname;
const A = await loadCoins(readFileSync(new URL('./_r3-before-coins.js', import.meta.url).pathname, 'utf8'));
const B = await loadCoins(readFileSync(ROOT + 'src/art/coins.js', 'utf8'));
const SIZES = [26, 38, 44, 54, 62, 76, 84, 120, 190, 380];
let n = 0, changed = 0;
const by = {};
for (const id of [...A.COIN_IDS, 'buck']) {
  for (const side of ['obverse', 'reverse']) for (const value of [false, true]) for (const size of SIZES) {
    const a = A.coinSVG(id, size, { side, value });
    const b = B.coinSVG(id, size, { side, value });
    if (/undefined|NaN|Infinity|null/.test(b)) throw new Error(`FAULTY: ${id}/${side}/${size}/value=${value}`);
    n++;
    if (a !== b) { changed++; (by[`${id}/${side}`] ??= []).push(size); }
  }
}
console.log(`${n} renders compared, ${changed} changed, ${n - changed} byte-identical`);
for (const [k, v] of Object.entries(by)) console.log(`  ${k.padEnd(18)} changed at ${v.join(', ')}px`);
const stray = Object.keys(by).filter((k) => !k.startsWith('quarter'));
console.log(stray.length ? `  !! NON-QUARTER CHANGES: ${stray.join(' ')}` : '  no non-quarter render changed');
