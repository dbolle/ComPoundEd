// SPECIALIST INSTRUMENT — round 3. WHICH RENDERS CHANGED, AND WHICH DID NOT.
//
// §1's hashing argument, applied to the art instead of the instruments: the
// cheapest evidence in this whole process is the partition between the renders
// a change touched and the renders it did not. Round 1 settled seven dimensions
// with it and round 2 nine, because a byte-identical render cannot have moved
// any metric computed from it.
//
// Compares two PINNED revisions of `coins.js` — both given as paths, neither
// defaulting to a mutable one, which is the round-1 mistake the brief names
// ("a control may not be a function of a mutable path"). Prints, for every
// id x side x tier size, whether the emitted SVG is byte-identical, and where
// it is not, the change in length and the first differing offset.
//
// §4 RESPONSE: run it with the same path twice; every row must read IDENTICAL.
//   That is the null case and it is checked on every run, printed at the end.
// §4.1 NULL: nothing searched.
//
// Run: node coloringbook/judge/_jl3attr.mjs <before.js> <after.js>
import { readFileSync } from 'node:fs';
import { loadCoins } from './_jq8contain-v2.mjs';

const SIZES = [26, 38, 44, 54, 76, 84, 120, 190, 380];

export async function compare(aSrc, bSrc) {
  const A = await loadCoins(aSrc), B = await loadCoins(bSrc);
  const rows = [];
  for (const id of A.COIN_IDS) {
    for (const side of ['obverse', 'reverse']) {
      for (const size of SIZES) {
        const a = A.coinSVG(id, size, { side }), b = B.coinSVG(id, size, { side });
        let at = -1;
        if (a !== b) { const n = Math.min(a.length, b.length); for (let i = 0; i < n; i++) if (a[i] !== b[i]) { at = i; break; } }
        rows.push({ id, side, size, same: a === b, dLen: b.length - a.length, at });
      }
    }
  }
  return rows;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [aP, bP] = process.argv.slice(2);
  if (!aP || !bP) throw new Error('both revisions must be given explicitly — no default, no mutable path');
  const rows = await compare(readFileSync(aP, 'utf8'), readFileSync(bP, 'utf8'));
  console.log(`before ${aP}\nafter  ${bP}`);
  const changed = rows.filter((r) => !r.same);
  console.log(`${rows.length} renders, ${changed.length} changed, ${rows.length - changed.length} byte-identical`);
  for (const r of changed) console.log(`  CHANGED ${r.id.padEnd(8)} ${r.side.padEnd(8)} ${String(r.size).padStart(4)}px   length ${r.dLen > 0 ? '+' : ''}${r.dLen}   first difference at byte ${r.at}`);
  const untouched = [...new Set(rows.filter((r) => r.same).map((r) => `${r.id} ${r.side}`))]
    .filter((k) => !changed.some((c) => `${c.id} ${c.side}` === k));
  console.log(`faces byte-identical at EVERY tier: ${untouched.join(', ')}`);
  const self = await compare(readFileSync(bP, 'utf8'), readFileSync(bP, 'utf8'));
  console.log(`§4 null case (after vs after): ${self.filter((r) => !r.same).length} changed — must be 0`);
}
