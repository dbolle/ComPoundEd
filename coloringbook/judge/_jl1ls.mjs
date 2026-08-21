// SPECIALIST INSTRUMENT — round 1, D5 lettering. DOES THE RENDERER HONOUR
// letter-spacing, AND WHERE DOES IT PUT THE INK?
//
// MONTICELLO and the dime's E PLURIBUS UNUM are set SPACED OUT across the
// middle of their reverses — 5.87 units per advance on a 3.89-unit cap for
// MONTICELLO, measured off `_jl1grid-nkrev-monti.png` — and drawing them solid
// would make them 40% too short. There are two ways to do that in SVG and this
// checks which one the pipeline actually implements, instead of assuming.
//
// It also answers the question that decides whether the caller's `x` needs
// compensating: with `text-anchor="middle"`, does the trailing letter-space
// move the INK? librsvg and a browser differ here, and the answer decides
// whether `flatText` should shift `x` by ls/2 (it should not — see the note in
// coins.js: the shift would be right for one renderer and wrong for the other).
//
// §4 RESPONSE: the ink width must grow by exactly (n−1) × spacing.
// §4.1 NULL: nothing is searched; the ink box is a full-canvas scan and the
//   canvas bounds are large enough that no string reaches them (checked).
//
// Run: node coloringbook/judge/_jl1ls.mjs
import sharp from 'sharp';

const FONT = "ui-rounded, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

async function box(extra, text = 'MONTICELLO') {
  const S = 2600, H = 400;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${H}">`
    + `<rect width="${S}" height="${H}" fill="#fff"/>`
    + `<text x="${S / 2}" y="300" text-anchor="middle" font-family="${FONT}" font-size="100" font-weight="700" fill="#000" ${extra}>${text}</text></svg>`;
  const { data, info } = await sharp(Buffer.from(svg)).greyscale().raw().toBuffer({ resolveWithObject: true });
  let x0 = 1e9, x1 = -1e9;
  for (let j = 0; j < info.height; j++) {
    for (let i = 0; i < info.width; i++) if (data[j * info.width + i] < 128) { if (i < x0) x0 = i; if (i > x1) x1 = i; }
  }
  return { x0, x1, w: x1 - x0 + 1, mid: (x0 + x1) / 2, centre: S / 2, atBound: x0 <= 0 || x1 >= S - 1 };
}

console.log('=== which spacing mechanism does the renderer honour? (MONTICELLO, font-size 100) ===');
const plain = await box('');
console.log(`  plain                                 ink width ${plain.w}${plain.atBound ? '  *** TOUCHES CANVAS BOUND ***' : ''}`);
for (const ls of [20, 40, 60]) {
  const b = await box(`letter-spacing="${ls}"`);
  const expect = plain.w + 9 * ls;
  console.log(`  letter-spacing="${ls}"                  ink width ${b.w}   expected ${expect} (9 gaps)   ${b.w === expect ? 'HONOURED' : 'differs'}`);
}
const tl = await box('textLength="1400" lengthAdjust="spacing"');
console.log(`  textLength="1400" lengthAdjust=spacing ink width ${tl.w}   ${tl.w === plain.w ? 'IGNORED — do not use it' : 'honoured'}`);

console.log('\n=== ink centring: does the trailing letter-space move the ink? ===');
for (const ls of [0, 20, 40, 60]) {
  const b = await box(ls ? `letter-spacing="${ls}"` : '');
  console.log(`  ls ${String(ls).padStart(3)}   ink ${b.x0}..${b.x1}   ink midpoint ${b.mid.toFixed(1)}   offset from the anchor ${(b.mid - b.centre).toFixed(1)}`);
}
console.log('  a constant offset across all four rows means this renderer centres the INK,');
console.log('  i.e. it does NOT count the trailing space. A browser does count it and would');
console.log('  shift the ink left by ls/2 — 0.94 viewBox units on MONTICELLO, 0.26 on the dime.');
