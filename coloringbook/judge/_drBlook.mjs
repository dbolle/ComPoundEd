// DIME REVERSE — round 1. D12: LOOK AT IT, at the sizes money.js draws, WITH A
// PINNED CONTROL RENDERED FIRST.
//
// Reports; writes one PNG into the gitignored judge scratch (WRITERS.md).
//
// The control is the CENT REVERSE, which this round does not touch. If it does
// not come out looking like the Memorial the rasteriser is broken and nothing
// below it may be believed. The dime OBVERSE is on the sheet for the same
// reason: it is the other half of the coin a child sees and this round must not
// have moved it.
//
// Run: node coloringbook/judge/_drBlook.mjs [tag]
import sharp from 'sharp';
import { join } from 'node:path';
import { JUDGE, ROOT } from './_paths.mjs';

const { coinSVG } = await import(join(ROOT, 'src/art/coins.js'));
const tag = process.argv[2] || 'now';
const SIZES = [38, 48, 54, 84], ZOOM = 5;
const rows = [
  ['CONTROL  cent reverse (untouched)', 'penny', 'reverse'],
  ['SUBJECT  dime reverse', 'dime', 'reverse'],
  ['dime obverse (untouched)', 'dime', 'obverse'],
  ['quarter reverse (untouched)', 'quarter', 'reverse'],
];
const parts = [];
let y = 10, maxX = 0;
for (const [, id, side] of rows) {
  let x = 250;
  for (const s of SIZES) {
    const svg = coinSVG(id, s, { side });
    const w = Number(svg.match(/width="([\d.]+)"/)[1]), h = Number(svg.match(/height="([\d.]+)"/)[1]);
    parts.push({
      input: await sharp(Buffer.from(svg)).resize(Math.round(w), Math.round(h))
        .flatten({ background: '#f2f2f2' })
        .resize(Math.round(w * ZOOM), Math.round(h * ZOOM), { kernel: 'nearest' }).png().toBuffer(),
      left: Math.round(x), top: Math.round(y),
    });
    x += Math.round(w * ZOOM) + 16;
  }
  maxX = Math.max(maxX, x);
  y += Math.round(Number(coinSVG(id, 84, { side }).match(/height="([\d.]+)"/)[1]) * ZOOM) + 26;
}
parts.push({
  input: await sharp(Buffer.from(coinSVG('dime', 380, { side: 'reverse' })))
    .flatten({ background: '#f2f2f2' }).png().toBuffer(),
  left: 250, top: Math.round(y),
});
const W = Math.max(maxX + 10, 800), H = y + 300;
const labels = rows.map((r, i) => `<text x="8" y="${28 + i * 138}" font-family="monospace" font-size="13" fill="#111">${r[0]}</text>`).join('')
  + `<text x="8" y="${y + 20}" font-family="monospace" font-size="13" fill="#111">dime reverse 380px (DRAW_SIZE)</text>`
  + `<text x="${W - 260}" y="18" font-family="monospace" font-size="13" fill="#111">38 / 48 / 54 / 84 px, x5   [${tag}]</text>`;
const out = join(JUDGE, `_drB-look-${tag}.png`);
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#f2f2f2"/>${labels}</svg>`))
  .composite(parts).png().toFile(out);
console.log('wrote', out.slice(ROOT.length + 1), '— CHECK THE CONTROL ROW FIRST');
