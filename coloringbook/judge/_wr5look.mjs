// ROUND 10 (specialist), QUARTER OBVERSE — D12, with the CONTROL rendered
// first (Appendix Q5, Appendix R6).
//
// I have been TOLD what I will see: round 9 recorded that variant B "LOOKS
// MATERIALLY BETTER at 190px". That is a prior, and a described artefact is
// found by an eye that went looking for it. So this sheet puts the control on
// the left of every row, and the control is chosen so that the change cannot
// have touched it:
//   row 1  the quarter REVERSE at the same size, twice — the change cannot
//          reach it at all; any difference between these two panels is the
//          renderer, not the art.
//   row 2  the quarter obverse wig, AS SHIPPED, twice — same as row 1 for the
//          face under test.
//   row 3  as shipped | variant B (every lit roll 0.92). This is the only row
//          in which anything is allowed to differ.
// The panels are emitted in that order and the file names say which is which.
//
// The crop is the wig: viewBox 44..72 x 20..50, the box the seven measuring
// lines run through. It is a frozen literal, not computed from our drawing.
//
// Run: node coloringbook/judge/_wr5look.mjs [size]
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const SIZE = Number(process.argv[2] || 190);
const CROP = { x0: 44, y0: 20, x1: 72, y1: 50 };   // viewBox units, frozen literal
const ZOOM = 14;

const ROLLS = [
  ['M -8.6 -22.8 C -6 -23.6 -3 -23.7 3.3 -22.6', '1.9'],
  ['M -13.4 -21 C -10 -21.9 -6 -21.9 0.9 -20.5', '1.9'],
  ['M -16.6 -17.2 C -13.4 -17.8 -10.2 -18.4 -5.0 -19.2', '1.8'],
  ['M -20 -12.4 C -16.4 -13.2 -12.4 -14.0 -5.3 -15.4', '1.1'],
  ['M -21.8 -3.2 C -18.4 -4.2 -14.4 -5.6 -7.5 -7.6', '1.1'],
];
const SRC = readFileSync('src/art/coins.js', 'utf8');
mkdirSync('coloringbook/_pv/wr1', { recursive: true });
async function moduleAt(width) {
  if (width === null) return import('../../src/art/coins.js');
  let s = SRC;
  for (const [d, w] of ROLLS) {
    const from = `<path d="${d}" fill="none" stroke-width="${w}"/>`;
    if (!s.includes(from)) throw new Error(`SUBSTITUTION MISS: ${from}`);
    s = s.replace(from, `<path d="${d}" fill="none" stroke-width="${width}"/>`);
  }
  s = s.replace("from '../engine/money.js'", "from '../../../src/engine/money.js'");
  const f = `coloringbook/_pv/wr1/coins-${String(width).replace('.', 'p')}.js`;
  writeFileSync(f, s);
  return import(`../_pv/wr1/coins-${String(width).replace('.', 'p')}.js`);
}

// render at the REAL device pixel count, then crop, then magnify with nearest
// neighbour — so what is magnified is the pixels a child gets, not a re-render
// at a size nobody draws (round 1's lesson).
async function panel(mod, side, width) {
  const svg = mod.coinSVG('quarter', SIZE, { side });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  const ppu = SIZE / 100;
  const left = Math.round(CROP.x0 * ppu), top = Math.round(CROP.y0 * ppu);
  const w = Math.round((CROP.x1 - CROP.x0) * ppu), h = Math.round((CROP.y1 - CROP.y0) * ppu);
  return sharp(png).extract({ left, top, width: w, height: h })
    .resize({ width: w * ZOOM, height: h * ZOOM, kernel: 'nearest' }).png().toBuffer();
}

const shipped = await moduleAt(null);
const varB = await moduleAt(0.92);

const rows = [
  ['row1-CONTROL-reverse', await panel(shipped, 'reverse'), await panel(shipped, 'reverse')],
  ['row2-CONTROL-obverse-shipped-twice', await panel(shipped, 'obverse'), await panel(shipped, 'obverse')],
  ['row3-SUBJECT-shipped-vs-variantB', await panel(shipped, 'obverse'), await panel(varB, 'obverse')],
];

const meta = await sharp(rows[0][1]).metadata();
const PW = meta.width, PH = meta.height, GAP = 16;
const sheet = sharp({ create: { width: PW * 2 + GAP * 3, height: (PH + GAP) * 3 + GAP, channels: 3, background: '#101418' } });
const comp = [];
rows.forEach((r, i) => {
  comp.push({ input: r[1], left: GAP, top: GAP + i * (PH + GAP) });
  comp.push({ input: r[2], left: GAP * 2 + PW, top: GAP + i * (PH + GAP) });
});
await sheet.composite(comp).png().toFile(`coloringbook/judge/_wr5look-${SIZE}.png`);
console.log(`### _wr5look — D12 sheet, quarter @${SIZE}px, wig crop viewBox `
  + `${CROP.x0}..${CROP.x1} x ${CROP.y0}..${CROP.y1}, ${ZOOM}x nearest-neighbour`);
rows.forEach((r, i) => console.log(`   row ${i + 1}  ${r[0]}`));
console.log(`   -> coloringbook/judge/_wr5look-${SIZE}.png`);

// byte-identity of the two control rows, so "I saw no difference" is checked
// rather than asserted
const same = (a, b) => Buffer.compare(a, b) === 0;
console.log(`\n   row 1 panels byte-identical: ${same(rows[0][1], rows[0][2])}`);
console.log(`   row 2 panels byte-identical: ${same(rows[1][1], rows[1][2])}`);
console.log(`   row 3 panels byte-identical: ${same(rows[2][1], rows[2][2])}  <- must be false, or the`
  + ` substitution did not reach the render`);
