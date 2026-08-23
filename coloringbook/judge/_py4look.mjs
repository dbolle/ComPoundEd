// D12 FOR THE CENT OBVERSE — look at it, at the sizes the app draws, with a
// PINNED CONTROL RENDERED FIRST (§3 D12 / Appendix Q5).
//
// CONTROL: the NICKEL obverse, same side, same sizes. It shares `bust()`,
// `coat()`, `struck()`, the field/ring pair, the specular arc and the whole
// inscription machinery with the cent and differs in the portrait, the legend
// layout and the palette. Anything that appears in BOTH panels is the shared
// machinery, not the cent — and in a repair round it is also the proof that a
// change scoped to `OBVERSE.penny` did not move a neighbour.
//
// Rendered at the REAL device pixel count `src/screens/money.js` asks for
// (`coinRow(ids, 38 | 48 | 54 | 84)`, so the cent's own box is 38 x
// COIN_SCALE.penny etc.), then nearest-upscaled so a human can see the pixels
// that actually ship. A 380 px overlay is not a substitute for this and §0.1
// says so.
//
// READS NOTHING, WRITES ONE PNG into judge/ (gitignored).
//
//   node coloringbook/judge/_py4look.mjs [tag]
import sharp from 'sharp';
import { coinSVG } from '../../src/art/coins.js';
const OUT = new URL('./', import.meta.url).pathname;
const tag = process.argv[2] || 'now';
const SIZES = [38, 48, 54, 84];
const CELL = 300;

async function cell(id, size) {
  const svg = coinSVG(id, size, { side: 'obverse' });
  const W = Math.round(Number(svg.match(/width="([\d.]+)"/)[1]));
  const H = Math.round(Number(svg.match(/height="([\d.]+)"/)[1]));
  const png = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .resize(W, H, { fit: 'fill' }).png().toBuffer();
  return sharp(png).resize(CELL, CELL, { kernel: 'nearest', fit: 'contain', background: '#ffffff' }).png().toBuffer();
}

const rows = [['CONTROL nickel obverse', 'nickel'], ['SUBJECT penny obverse', 'penny']];
const tiles = [];
for (const [, id] of rows) for (const s of SIZES) tiles.push(await cell(id, s));
const W = 20 + SIZES.length * (CELL + 12);
const H = 60 + rows.length * (CELL + 40);
const labels = rows.map(([n], r) => `<text x="14" y="${52 + r * (CELL + 40)}" font-family="monospace" font-size="18" fill="#111">${n}</text>`).join('') +
  SIZES.map((s, c) => `<text x="${20 + c * (CELL + 12)}" y="26" font-family="monospace" font-size="18" fill="#111">${s} px</text>`).join('');
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>${labels}</svg>`))
  .composite(tiles.map((b, i) => ({
    input: b,
    left: 20 + (i % SIZES.length) * (CELL + 12),
    top: 60 + Math.floor(i / SIZES.length) * (CELL + 40),
  })))
  .png().toFile(`${OUT}_py4-look-${tag}.png`);
console.log(`wrote ${OUT}_py4-look-${tag}.png  (control row first)`);
