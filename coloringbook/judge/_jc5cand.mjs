// ROUND 5 helper — write candidate revisions of coins.js that differ from the
// PINNED BASELINE by exactly one palette entry, so `_jc5look.mjs` can put them
// beside the control. Writes to coloringbook/_pv/, never to src/.
// Run: node coloringbook/judge/_jc5cand.mjs <hex> [hex...]
import { readFileSync, writeFileSync } from 'node:fs';
const BASE = readFileSync('coloringbook/judge/_jc5-before-coins.js', 'utf8');
for (const hex of process.argv.slice(2)) {
  const out = BASE.replace(/(penny: \{ rim: '#8d5320'[^}]*cloth: ')#a75f22(')/, `$1${hex}$2`);
  if (out === BASE) throw new Error(`rewrite did not match for ${hex}`);
  const f = `coloringbook/_pv/_jc5cand-${hex.slice(1)}.js`;
  writeFileSync(f, out);
  console.log('wrote', f);
}
