// BUCK r9 (specialist) — where the obverse ONE's INK actually lands, measured
// by rendering rather than by estimating a font advance.
//
// The D1 repair moved the portrait to the note's own centre, which shrank the
// right-hand panel the word sits in from 43 units to 35. Whether 13pt ONE
// still fits between the vignette's rim and the printed border is a question
// about a font's metrics, and this file answers it the only honest way: render
// the note twice, once with the glyph and once without, and diff the pixels.
//
//   node coloringbook/judge/_jk9text.mjs [x] [font-size]
import sharp from 'sharp';
const mod = await import('../../src/art/coins.js');

const W = 2000, VB = 100;                      // px, viewBox units across
const px2u = (px) => (px * VB) / W;

async function inkColumns(svg) {
  const { data, info } = await sharp(Buffer.from(svg)).resize(W).flatten({ background: '#ffffff' })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

const argX = process.argv[2], argF = process.argv[3];
let svg = mod.coinSVG('buck', 190, { side: 'obverse', value: false });
if (argX) svg = svg.replace(/<text x="[\d.]+" y="33"/, `<text x="${argX}" y="33"`);
if (argF) svg = svg.replace(/(<text x="[\d.]+" y="33"[^>]*font-size=")13(")/, `$1${argF}$2`);
const bare = svg.replace(/<text[^>]*>ONE<\/text>/, '');
if (bare === svg) throw new Error('ONE not found — the null case would be indistinguishable from a match');

const A = await inkColumns(svg), B = await inkColumns(bare);
let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, n = 0;
for (let j = 0; j < A.h; j++) for (let i = 0; i < A.w; i++) {
  if (Math.abs(A.data[j * A.w + i] - B.data[j * A.w + i]) > 12) {
    n++; x0 = Math.min(x0, i); x1 = Math.max(x1, i); y0 = Math.min(y0, j); y1 = Math.max(y1, j);
  }
}
if (!n) throw new Error('no pixels differ — the glyph did not render');
const vign = { cx: 50.05, rx: 9.75 };
console.log(`ONE at x=${argX || 79} size ${argF || 13}:  ink X ${px2u(x0).toFixed(2)}..${px2u(x1).toFixed(2)} (w ${px2u(x1 - x0).toFixed(2)})` +
  `  Y ${px2u(y0).toFixed(2)}..${px2u(y1).toFixed(2)} (cap ${px2u(y1 - y0).toFixed(2)})   ${n} px differ`);
console.log(`  clearance: vignette rim ${(vign.cx + vign.rx).toFixed(2)} -> ${(px2u(x0) - vign.cx - vign.rx).toFixed(2)} units` +
  `   printed border inner edge 94.20 -> ${(94.2 - px2u(x1)).toFixed(2)} units` +
  `   ${px2u(x0) > vign.cx + vign.rx && px2u(x1) < 94.2 ? 'CLEAR both' : '*** COLLIDES ***'}`);
