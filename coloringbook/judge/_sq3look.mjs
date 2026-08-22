// SPECIALIST, quarter reverse (eagle) — D12 "look at it", WITH A CONTROL.
//
// Top row    : quarter reverse at the five sizes a child sees.
// Second row : NICKEL reverse at the same sizes — the control (COIN-JUDGE Q5).
//              This round cannot touch it, so anything that appears in BOTH
//              rows is not attributable to the eagle.
// Third row  : the reference, disc-normalised, reduced to the same pixel counts.
//
// Usage: node _sq3look.mjs [outfile]
// Generator for: coloringbook/judge/_sq3-look*.png
import sharp from 'sharp';
import { coinSVG, coinPx } from '../../src/art/coins.js';
import { normalise, N, SPAN } from '../_rvnorm.mjs';
import { discOf } from './_jq42indep.mjs';

const SIZES = [26, 44, 54, 84, 190];
const REF = process.env.SQ_REF || 'quarter-rev-3.jpg';
const out = process.argv[2] || '_sq3-look.png';
const PAD = 12, LBL = 18;
const CELL = 210;

async function raster(id, side, size) {
  const box = coinPx(id, size);
  const svg = coinSVG(id, size, { side, decorative: true });
  return sharp(Buffer.from(`<?xml version="1.0"?>` + svg))
    .resize(Math.round(box.w), Math.round(box.w)).png().toBuffer();
}

// the reference reduced to exactly `px` device pixels across the disc, then
// blown back up nearest-neighbour so the eye sees what the child's retina gets.
const d = await discOf(REF);
const g = await normalise(REF, d);
const buf = Buffer.alloc(N * N);
for (let p = 0; p < N * N; p++) buf[p] = Math.max(0, Math.min(255, Math.round(g[p])));
async function refAt(px) {
  const small = await sharp(buf, { raw: { width: N, height: N, channels: 1 } })
    .resize(Math.round(px / (2 * SPAN) * 2 * SPAN), Math.round(px)).png().toBuffer();
  return small;
}

const rows = [
  { name: 'quarter.reverse (SUBJECT)', get: (s) => raster('quarter', 'reverse', s) },
  { name: 'nickel.reverse  (CONTROL)', get: (s) => raster('nickel', 'reverse', s) },
  { name: `ref ${REF}`, get: (s) => refAt(s) },
];

const W = 300 + SIZES.length * CELL, H = rows.length * (CELL + LBL) + PAD;
const comps = [];
let svg = `<svg width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#f4f4f4"/>`;
for (let r = 0; r < rows.length; r++) {
  const top = r * (CELL + LBL) + PAD;
  svg += `<text x="6" y="${top + CELL / 2}" font-family="monospace" font-size="13" fill="#000">${rows[r].name}</text>`;
  for (let c = 0; c < SIZES.length; c++) {
    const s = SIZES[c];
    const png = await rows[r].get(s);
    const meta = await sharp(png).metadata();
    // nearest-neighbour blow-up to CELL so the real pixel grid stays visible
    const big = await sharp(png).resize(CELL - 16, CELL - 16, { kernel: 'nearest', fit: 'contain', background: '#f4f4f4' }).png().toBuffer();
    comps.push({ input: big, left: 300 + c * CELL + 8, top: top + 8 });
    svg += `<text x="${300 + c * CELL + 8}" y="${top + CELL + 13}" font-family="monospace" font-size="12" fill="#333">${s}px -> ${meta.width}px</text>`;
  }
}
svg += '</svg>';
await sharp(Buffer.from(svg)).composite(comps).png()
  .toFile(new URL('./' + out, import.meta.url).pathname);
console.log('wrote ' + out + '  ref=' + REF);
