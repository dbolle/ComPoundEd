// ROUND 3 SPECIALIST — the D13 before/after contact sheet, and its generator
// (spec §4.3: an image's reproducible artefact is its generator).
//
// Renders, for each side and each frozen tier 26/44/54/84 px:
//     row 1  BEFORE   (SRC_BEFORE, default coloringbook/_r3-before-coins.js)
//     row 2  AFTER    (SRC_AFTER,  default src/art/coins.js)
//     row 3  REFERENCE reduced to the SAME device pixel count
// every tile rasterised at its own real device pixel count and then
// nearest-neighbour upscaled, so no tile invents a pixel.
//
//   node coloringbook/_r3sheet.mjs [out.png]
import sharp from 'sharp';
import { grey, at, XY2px } from './_rvnorm.mjs';
import { readFileSync } from 'node:fs';
import { REFS, TIERS } from './_r3d13.mjs';
import { loadCoins } from './judge/_jq8contain-v2.mjs';

const CELL = 260, PAD = 8, HEAD = 26, LAB = 96;
const OUT = process.argv[2] || new URL('./_r3-d13-before-after.png', import.meta.url).pathname;
const A = await import(process.env.SRC_AFTER || '../src/art/coins.js');
const B = await loadCoins(readFileSync(new URL(process.env.SRC_BEFORE || './_r3-before-coins.js', import.meta.url).pathname, 'utf8'));

async function ourTile(mod, side, size) {
  const W = Math.round(size * mod.COIN_SCALE.quarter);
  const svg = mod.coinSVG('quarter', size, { side });
  const small = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .resize(W, W, { fit: 'fill' }).png().toBuffer();
  return sharp(small).resize(CELL, CELL, { kernel: 'nearest' }).png().toBuffer();
}

async function refTile(side, W) {
  const { file, D } = REFS.quarter[side];
  const g = await grey(file);
  const buf = Buffer.alloc(W * W);
  for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
    let s = 0;
    for (let b = 0; b < 4; b++) for (let a = 0; a < 4; a++) {
      const X = (i + (a + 0.5) / 4) / W * 100, Y = (j + (b + 0.5) / 4) / W * 100;
      const [px, py] = XY2px(D, X, Y); s += at(g, px, py);
    }
    buf[j * W + i] = Math.round(s / 16);
  }
  return sharp(buf, { raw: { width: W, height: W, channels: 1 } })
    .resize(CELL, CELL, { kernel: 'nearest' }).png().toBuffer();
}

const ROWS = [['BEFORE', B], ['AFTER', A], ['PHOTOGRAPH', null]];
const W = LAB + TIERS.length * (CELL + PAD) + PAD;
const H = 2 * (HEAD + 3 * (CELL + PAD) + PAD);
const comps = [];
let top = 0;
const labels = [];
for (const side of ['obverse', 'reverse']) {
  labels.push(`<text x="6" y="${top + 18}" fill="#fff" font-size="15" font-family="monospace">quarter ${side.toUpperCase()} — D13 device against field, each tile at its own real device pixel count, nearest-upscaled</text>`);
  let y = top + HEAD;
  for (const [name, mod] of ROWS) {
    labels.push(`<text x="6" y="${y + CELL / 2}" fill="#bbb" font-size="13" font-family="monospace">${name}</text>`);
    let x = LAB;
    for (const size of TIERS) {
      const devW = Math.round(size * A.COIN_SCALE.quarter);
      comps.push({ input: mod ? await ourTile(mod, side, size) : await refTile(side, devW), left: x, top: y });
      if (name === 'BEFORE') labels.push(`<text x="${x + 4}" y="${top + 18 + 0}" fill="#8cf" font-size="13" font-family="monospace"></text>`);
      x += CELL + PAD;
    }
    y += CELL + PAD;
  }
  let x = LAB;
  for (const size of TIERS) {
    labels.push(`<text x="${x + 4}" y="${top + HEAD - 4}" fill="#8cf" font-size="13" font-family="monospace">${size}px = ${Math.round(size * A.COIN_SCALE.quarter)} device px</text>`);
    x += CELL + PAD;
  }
  top += HEAD + 3 * (CELL + PAD) + PAD;
}
const bg = `<svg width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#181818"/>${labels.join('')}</svg>`;
await sharp(Buffer.from(bg)).composite(comps).png().toFile(OUT);
console.log('wrote', OUT);
