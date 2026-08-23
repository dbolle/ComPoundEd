// D12 — LOOK AT THE QUARTER OBVERSE AT THE SIZES THE APP DRAWS, control first.
//
// §0.1: "D12 look at it, with a pinned control rendered first. Every
// wrong-in-kind defect ever found here was found this way and none was found by
// a number. At the sizes the app draws — a 380 px overlay is not a substitute."
//
// The CONTROL rows are the three allowed photographs box-filtered to the exact
// device pixel count `src/screens/money.js` gives the quarter at 38 / 48 / 54 /
// 84 — `coinRow` scales by COIN_SCALE, so the quarter (the largest coin) gets
// the full number. They are rendered BEFORE our art and nothing about our art is
// used to produce them.
//
// Everything is magnified with NEAREST, so the sheet shows the pixels a child
// gets and invents nothing.
//
// Run: node coloringbook/judge/_qo6look.mjs [tag]
import sharp from 'sharp';
import { JUDGE } from './_paths.mjs';
import { coinSVG } from '../../src/art/coins.js';
import { STRUCK, disc, grey, atVB } from './_qo1zoom.mjs';

const SZ = [38, 48, 54, 84], MAG = 6, PAD = 10, LAB = 150, HDR = 46;
const cell = 84 * MAG;

const rows = [];
// ── CONTROL FIRST
for (const f of STRUCK) {
  const d = await disc(f), g = await grey(f);
  const tiles = [];
  for (const px of SZ) {
    const buf = Buffer.alloc(px * px);
    for (let j = 0; j < px; j++) for (let i = 0; i < px; i++) {
      let a = 0;
      for (let b = 0; b < 4; b++) for (let c = 0; c < 4; c++) {
        a += atVB(g, d, (100 * (i + (c + 0.5) / 4)) / px, (100 * (j + (b + 0.5) / 4)) / px);
      }
      buf[j * px + i] = Math.max(0, Math.min(255, Math.round(a / 16)));
    }
    tiles.push(await sharp(buf, { raw: { width: px, height: px, channels: 1 } })
      .resize(px * MAG, px * MAG, { kernel: 'nearest' }).png().toBuffer());
  }
  rows.push({ label: 'CONTROL ' + f, tiles, sizes: SZ });
}
// ── then ours
{
  const tiles = [];
  for (const px of SZ) {
    const png = await sharp(Buffer.from(coinSVG('quarter', px, { side: 'obverse' }))).png().toBuffer();
    const m = await sharp(png).metadata();
    tiles.push(await sharp(png).resize(m.width * MAG, m.height * MAG, { kernel: 'nearest' }).png().toBuffer());
  }
  rows.push({ label: 'OURS (live coins.js)', tiles, sizes: SZ });
}

const layers = [], text = [];
text.push(`<text x="${PAD}" y="24" font-family="monospace" font-size="16" fill="#111">quarter obverse at 38 / 48 / 54 / 84 px — the sizes src/screens/money.js draws — magnified ${MAG}x nearest. CONTROL PHOTOGRAPHS FIRST.</text>`);
SZ.forEach((px, ci) => text.push(`<text x="${LAB + PAD + ci * (cell + PAD) + cell / 2 - 16}" y="${HDR - 6}" font-family="monospace" font-size="14" fill="#555">${px}px</text>`));
for (let r = 0; r < rows.length; r++) {
  const top = HDR + r * (cell + PAD);
  text.push(`<text x="${PAD}" y="${top + cell / 2}" font-family="monospace" font-size="12" fill="#333">${rows[r].label}</text>`);
  for (let ci = 0; ci < SZ.length; ci++) {
    const w = SZ[ci] * MAG;
    layers.push({ input: rows[r].tiles[ci], left: LAB + PAD + ci * (cell + PAD) + Math.round((cell - w) / 2), top: top + Math.round((cell - w) / 2) });
  }
}
const W = LAB + PAD + SZ.length * (cell + PAD), H = HDR + rows.length * (cell + PAD) + PAD;
const out = `${JUDGE}/_qo6look-${process.argv[2] || 'now'}.png`;
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>${text.join('')}</svg>`))
  .composite(layers).png().toFile(out);
console.log('wrote judge/' + out.split('/').pop());
