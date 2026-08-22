// ROUND 8, cent obverse — D12 AT THE SIZES A CHILD ACTUALLY SEES.
//
// §3 D12: "a subject nobody has looked at is not finished", and the eagle
// proved the numbers and the 26px render can disagree with the render right.
// Every panel here is drawn at its REAL device pixel count and then nearest-
// neighbour upscaled, so what is shown is the pixels, not a resample of them.
//
// §3 D12's CONTROL (Q5): the BEFORE revision is drawn in the top row and the
// AFTER in the bottom, same sizes, same upscale. The icon sizes (26, 38) draw
// neither hair nor beard by construction (`const beard = ... && !icon`), so
// those two columns MUST be identical between the rows — they are this figure's
// built-in control, and a difference there would mean the change leaked into a
// tier it cannot reach.
//
// Run: node coloringbook/judge/_jh8tier.mjs
import sharp from 'sharp';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';

const SIZES = [26, 38, 44, 54, 84, 190];
const CELL = 260;
const rev = async (src) => (await import(src)).coinSVG;

// The BEFORE revision is materialised into src/art only for the length of this
// import (coins.js's '../engine/money.js' cannot resolve from anywhere else)
// and removed immediately, so nothing is left in the shipped tree.
writeFileSync('src/art/_jh8ctl.js', readFileSync('coloringbook/judge/_jh8-before-coins.js', 'utf8'));
let A;
try { A = await rev('../../src/art/_jh8ctl.js'); } finally { rmSync('src/art/_jh8ctl.js'); }
const B = await rev('../../src/art/coins.js');
const rows = [['BEFORE (control)', A], ['AFTER', B]];

const tiles = [];
for (let r = 0; r < rows.length; r++) {
  for (let c = 0; c < SIZES.length; c++) {
    const svg = rows[r][1]('penny', SIZES[c], { side: 'obverse' });
    const w = Math.round(Number(svg.match(/\bwidth="([\d.]+)"/)[1]));
    const png = await sharp(Buffer.from(svg)).resize(w, w, { fit: 'fill' }).png().toBuffer();
    const up = await sharp(png).resize(CELL, CELL, { kernel: 'nearest' }).png().toBuffer();
    tiles.push({ input: up, left: c * CELL, top: 24 + r * (CELL + 24) });
  }
}
const W = SIZES.length * CELL, H = 2 * (CELL + 24) + 24;
let txt = '';
SIZES.forEach((s, c) => { txt += `<text x="${c * CELL + 6}" y="16" font-family="monospace" font-size="14" fill="#000">${s}px (${s <= 42 ? 'icon' : s < 76 ? 'mid' : 'full'})</text>`; });
rows.forEach((r, i) => { txt += `<text x="6" y="${24 + i * (CELL + 24) + CELL + 17}" font-family="monospace" font-size="14" fill="#000">${r[0]}</text>`; });
txt += `<text x="${W - 470}" y="16" font-family="monospace" font-size="14" fill="#000">26 and 38 must be identical between rows (no beard at icon)</text>`;
await sharp({ create: { width: W, height: H, channels: 3, background: '#fff' } })
  .composite([...tiles, { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${txt}</svg>`), left: 0, top: 0 }])
  .png().toFile('coloringbook/_pv/_jh8tier.png');
console.log('wrote coloringbook/_pv/_jh8tier.png');
