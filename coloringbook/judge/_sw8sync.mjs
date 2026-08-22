// SPECIALIST (buck obverse) — copy the generator's output into the art, so
// the strings in `src/art/coins.js` cannot drift from `_sw7gen.mjs`.
// Idempotent: run it after any edit to the control points.
//   node coloringbook/judge/_sw8sync.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PATHS, ELLIPSES } from './_sw7gen.mjs';

const f = fileURLToPath(new URL('../../src/art/coins.js', import.meta.url));
let s = readFileSync(f, 'utf8');
let n = 0;
for (const [k, d] of Object.entries(PATHS)) {
  const re = new RegExp(`(  ${k}: ')[^']*(',)`);
  if (!re.test(s)) throw new Error(`VIGNETTE.${k} not found in coins.js — sync aborted`);
  const before = s;
  s = s.replace(re, `$1${d}$2`);
  if (s !== before) n++;
}
writeFileSync(f, s);
console.log(`synced ${Object.keys(PATHS).length} paths (${n} changed) into src/art/coins.js`);

// The full-tier ellipses are VERIFIED rather than rewritten: they are one line
// each inside a template literal and a blind substitution there is more
// dangerous than a check. A mismatch throws, so the generator cannot silently
// stop being the source of the numbers in the art.
const emitted = [...s.matchAll(/<ellipse cx="([\d.]+)" cy="([\d.]+)" rx="([\d.]+)" ry="([\d.]+)"\/>/g)]
  .map((m) => ({ cx: +m[1], cy: +m[2], rx: +m[3], ry: +m[4] }))
  .filter((e) => e.rx < 5); // the vignette rule is rx 9.75 and is not ours to touch
const want = JSON.stringify(ELLIPSES);
const got = JSON.stringify(emitted);
if (want !== got) {
  throw new Error(`ELLIPSES DRIFTED between _sw7gen.mjs and coins.js\n  generator: ${want}\n  art:       ${got}`);
}
console.log(`verified ${emitted.length} full-tier ellipses identical to _sw7gen.mjs ELLIPSES`);
