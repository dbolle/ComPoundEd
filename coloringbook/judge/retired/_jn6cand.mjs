// _jn6cand — writes the two icon-trio candidates as importable copies of
// coins.js so the EXISTING instruments (`_jn8tier.mjs`, `_jq8contain-v2.mjs`,
// `_x6mat.mjs`, `_jn6tone.mjs`) can be pointed at them with ART=/SRC=.
// src/art/coins.js is not written. Run: node coloringbook/judge/_jn6cand.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const SRC = new URL('../../src/art/coins.js', import.meta.url).pathname;
const MONEY = new URL('../../src/engine/money.js', import.meta.url).pathname;
const OUT = new URL('./_jn6cand/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const raw = readFileSync(SRC, 'utf8');
const A = 's: 0.95, cy: 43.7, cx: -6.4, iconS: 0.95, iconCy: 43.7, iconCx: -6.4,';
if (raw.split(A).length - 1 !== 1) throw new Error('anchor not unique — refusing');
const C = { A: [1.032, -7.03, 49.31], B: [1.109, -7.47, 52.69] };
for (const [k, [s, cx, cy]] of Object.entries(C)) {
  writeFileSync(OUT + k + '.js', raw.split("from '../engine/money.js'").join(`from '${MONEY}'`)
    .split(A).join(`s: 0.95, cy: 43.7, cx: -6.4, iconS: ${s}, iconCy: ${cy}, iconCx: ${cx},`));
  console.log(`${OUT}${k}.js  iconS ${s} iconCx ${cx} iconCy ${cy}`);
}
