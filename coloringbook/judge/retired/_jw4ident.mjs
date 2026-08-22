// R4 dime jaw — WHAT ELSE MOVED. The brief's last MUST-NOT-REGRESS row is "the
// dime REVERSE and all three other coins: byte-identical", and the only honest
// way to show that is to compare the emitted strings, not to reason about which
// branch the edit is on.
//
// Both revisions are pinned: the BEFORE side is `_jw4-before-loadable.js`,
// which `_jw4look.mjs` writes from the byte-identical copy taken at dispatch
// and which differs from it on exactly one line (the money.js import path).
//
// Every id x side x size is compared, including the sizes no dimension is
// scored at, because a tier boundary is exactly where a change hides.
//
// Response test: RESPONSE=1 compares the AFTER module with itself and must
// report 0 differing cells; if it did not, the comparison is not comparing.
//
// Run: node coloringbook/judge/_jw4ident.mjs
const here = (p) => new URL(p, import.meta.url).pathname;
const A = await import(here('./_jw4-before-loadable.js'));
const B = process.env.RESPONSE ? A : await import(here('../../src/art/coins.js'));
const SIZES = [26, 32, 38, 42, 44, 54, 62, 74, 76, 84, 120, 150, 190, 380];
let same = 0;
const diff = [];
for (const id of A.COIN_IDS) {
  for (const side of ['obverse', 'reverse']) {
    for (const size of SIZES) {
      const a = A.coinSVG(id, size, { side }), b = B.coinSVG(id, size, { side });
      if (a === b) same++;
      else diff.push({ id, side, size, dLen: b.length - a.length });
    }
  }
}
console.log(`${same} of ${same + diff.length} emitted strings byte-identical`);
if (!diff.length) console.log('  (nothing differs — this is the RESPONSE run if RESPONSE=1 was set)');
for (const d of diff) console.log(`  DIFFERS  ${d.id.padEnd(8)} ${d.side.padEnd(8)} ${String(d.size).padStart(4)} px   length ${d.dLen > 0 ? '+' : ''}${d.dLen}`);
const tiers = [...new Set(diff.map((d) => `${d.id}.${d.side}`))];
console.log(`\nsides that changed at any size: ${tiers.length ? tiers.join(', ') : 'none'}`);
console.log('the tier boundaries on this coin are 42->44 (icon->mid) and 74->76 (mid->full);');
console.log('sizes on both sides of both are in the list above.');
