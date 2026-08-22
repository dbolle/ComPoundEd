// SPECIALIST INSTRUMENT — round 2. THE ATTRIBUTION PARTITION.
//
// §1's hashing is praised in three appendices for the same reason: if you can
// show that 4 of 180 renders changed and the rest are byte-identical, most of
// the scorecard is settled without measuring anything. This does that for this
// round: every id x side x size, both revisions, byte-compared, and the
// `<text>` elements compared separately so "no legend moved" is a fact rather
// than an argument from intent.
//
// BOTH revisions are named explicitly. Neither defaults (brief §RULES: round
// 1's contact sheet compared the new art with itself because its "before"
// defaulted to a mutable path).
//
// §4 RESPONSE: run it with the same path twice and it must report 0 changed.
// §4.1 NULL: nothing searches.
//
//   node coloringbook/judge/_jt2diff.mjs <before.js> <after.js>
const [B, A] = process.argv.slice(2);
if (!B || !A) throw new Error('both revisions must be named explicitly');
const before = await import(B), after = await import(A);
const SIZES = [26, 38, 44, 54, 76, 84, 120, 190, 380];
const texts = (s) => (s.match(/<text[\s\S]*?<\/text>/g) || []).join('\n');

let n = 0, changed = [], textChanged = [];
for (const id of before.COIN_IDS ?? ['penny', 'nickel', 'dime', 'quarter', 'buck']) {
  for (const side of ['obverse', 'reverse']) for (const size of SIZES) {
    for (const withValue of [false, true]) {
      const b = before.coinSVG(id, size, { side, value: withValue });
      const a = after.coinSVG(id, size, { side, value: withValue });
      n++;
      const tag = `${id} ${side} ${size}px${withValue ? ' +value' : ''}`;
      if (b !== a) changed.push(tag);
      if (texts(b) !== texts(a)) textChanged.push(tag);
    }
  }
}
console.log(`\n=== _jt2diff  ${B}  ->  ${A} ===`);
console.log(`${n} renders compared. CHANGED: ${changed.length}. LETTERING CHANGED: ${textChanged.length}.`);
const faces = [...new Set(changed.map((t) => t.split(' ').slice(0, 2).join(' ')))];
console.log('faces with any change:', faces.length ? faces.join(', ') : '(none)');
console.log('faces with a lettering change:',
  [...new Set(textChanged.map((t) => t.split(' ').slice(0, 2).join(' ')))].join(', ') || '(none)');
console.log('\nunchanged faces (byte-identical at every size, value on and off):');
const all = [];
for (const id of before.COIN_IDS ?? ['penny', 'nickel', 'dime', 'quarter', 'buck'])
  for (const side of ['obverse', 'reverse']) all.push(`${id} ${side}`);
console.log('  ' + all.filter((f) => !faces.includes(f)).join('\n  '));
