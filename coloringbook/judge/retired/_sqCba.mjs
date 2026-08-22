// SPECIALIST, quarter reverse — D12 with a CONTROL (COIN-JUDGE Q5).
//
// Rows: quarter reverse BEFORE (b788b0a) and AFTER, then the NICKEL reverse
// twice from the same two revisions. The nickel row is the control: the
// byte-identity partition (`_sqBident.mjs`) says those two strings are equal,
// so any difference visible between the two nickel tiles is a rendering
// artefact of this sheet and NOT attributable to the round. Render the control
// first and read it before reading the subject.
//
// Generator for: coloringbook/judge/_sqC-before-after.png
import sharp from 'sharp';
import { beforeModule } from './_sqBefore.mjs';

const before = beforeModule();
const A = await import(before.path), B = await import('../../src/art/coins.js');
console.log(`BEFORE ${before.rev} sha256 ${before.sha256}`);

const SIZES = [26, 44, 54, 84, 190];
const CELL = 230, LBL = 18, PAD = 10, LEFTW = 330;
const ROWS = [
  ['nickel.reverse  CONTROL  before', A, 'nickel'],
  ['nickel.reverse  CONTROL  after ', B, 'nickel'],
  ['quarter.reverse SUBJECT  before', A, 'quarter'],
  ['quarter.reverse SUBJECT  after ', B, 'quarter'],
];

const W = LEFTW + SIZES.length * CELL, H = ROWS.length * (CELL + LBL) + PAD;
const comps = [];
let svg = `<svg width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#f4f4f4"/>`;
for (let r = 0; r < ROWS.length; r++) {
  const [name, mod, id] = ROWS[r];
  const top = r * (CELL + LBL) + PAD;
  svg += `<text x="6" y="${top + CELL / 2}" font-family="monospace" font-size="14" fill="#000">${name}</text>`;
  for (let c = 0; c < SIZES.length; c++) {
    const s = SIZES[c], box = mod.coinPx(id, s);
    const png = await sharp(Buffer.from(mod.coinSVG(id, s, { side: 'reverse', decorative: true })))
      .resize(Math.round(box.w), Math.round(box.w)).png().toBuffer();
    const big = await sharp(png).resize(CELL - 14, CELL - 14, { kernel: 'nearest', fit: 'contain', background: '#f4f4f4' }).png().toBuffer();
    comps.push({ input: big, left: LEFTW + c * CELL + 7, top: top + 7 });
    svg += `<text x="${LEFTW + c * CELL + 7}" y="${top + CELL + 13}" font-family="monospace" font-size="12" fill="#333">${s}px</text>`;
  }
}
svg += '</svg>';
await sharp(Buffer.from(svg)).composite(comps).png()
  .toFile(new URL('./_sqC-before-after.png', import.meta.url).pathname);
console.log('wrote _sqC-before-after.png');
