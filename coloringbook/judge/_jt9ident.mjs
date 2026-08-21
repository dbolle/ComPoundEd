// R5 dime throat — the byte-identity partition (§5). Both revisions pinned:
// BEFORE is `_jt9-before-loadable.js`, written from the copy taken at dispatch
// (sha256 verified against src/art/coins.js at that moment) and differing from
// it on exactly one line, the money.js import path.
//
// Response test: RESPONSE=1 compares the AFTER module with itself and must
// report 0 differing cells.
//
// Run: node coloringbook/judge/_jt9ident.mjs
const here = (p) => new URL(p, import.meta.url).pathname;
const A = await import(here('./_jt9-before-loadable.js'));
const B = process.env.RESPONSE ? A : await import(here('../../src/art/coins.js'));
const SIZES = [26, 32, 38, 42, 44, 54, 62, 74, 76, 84, 120, 150, 190, 380];
let same = 0;
const diff = [];
for (const id of A.COIN_IDS) {
  for (const side of ['obverse', 'reverse']) {
    for (const size of SIZES) {
      const a = A.coinSVG(id, size, { side }), b = B.coinSVG(id, size, { side });
      if (a === b) same++; else diff.push({ id, side, size, dLen: b.length - a.length });
    }
  }
}
console.log(`${same} of ${same + diff.length} emitted strings byte-identical`);
for (const d of diff) console.log(`  DIFFERS  ${d.id.padEnd(8)} ${d.side.padEnd(8)} ${String(d.size).padStart(4)} px   length ${d.dLen > 0 ? '+' : ''}${d.dLen}`);
console.log(`\nsides that changed at any size: ${[...new Set(diff.map((d) => `${d.id}.${d.side}`))].join(', ') || 'none'}`);
