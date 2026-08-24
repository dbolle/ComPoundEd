// BUCK obverse round — BYTE-IDENTITY RENDER PARTITION.
// Hashes every id x side x size x value-scaffold render of the LIVE art, so a
// round can prove that exactly one face moved. Also runs D9 (0 of N
// undefined/NaN/null/malformed numbers) over the same sweep.
// REPORTS ONLY. Prints a stable, diffable table.
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { ROOT } from './_paths.mjs';
const { coinSVG, COIN_IDS } = await import(join(ROOT, 'src/art/coins.js'));
const SIZES = [26, 38, 44, 48, 54, 76, 84, 190, 380]; // 5 ids x 2 sides x 9 sizes x 2 value states = 180 cells
const rows = [];
let bad = 0, n = 0;
for (const id of COIN_IDS) for (const side of ['obverse', 'reverse']) {
  const h = createHash('sha256');
  for (const size of SIZES) for (const value of [false, true]) {
    const svg = coinSVG(id, size, { side, value, decorative: true });
    h.update(svg); n++;
    if (/undefined|NaN|null|Infinity/.test(svg)) { bad++; console.log(`D9 FAIL ${id}/${side}/${size}/value=${value}`); }
    for (const m of svg.matchAll(/\sd="([^"]*)"/g)) for (const tok of m[1].match(/-?\d*\.?\d+(e[-+]?\d+)?/gi) || []) if (!isFinite(+tok)) { bad++; console.log(`D9 FAIL malformed path number ${tok} in ${id}/${side}/${size}`); }
  }
  rows.push(`${id.padEnd(8)} ${side.padEnd(8)} ${h.digest('hex').slice(0, 16)}`);
}
console.log(rows.join('\n'));
console.log(`\nD9: ${bad} of ${n * 1} renders carry an undefined/NaN/null/malformed number (${COIN_IDS.length} ids x 2 sides x ${SIZES.length} sizes x 2 value states = ${n})`);
