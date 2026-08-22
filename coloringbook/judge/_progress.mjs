// A plain progress sheet: every face of every denomination, as it stands now.
// No comparison, no overlay, no target — just the art, big enough to judge and
// again at the size a child actually sees it.
//
// Run: node coloringbook/judge/_progress.mjs
import sharp from 'sharp';
import { coinSVG, coinPx, COIN_IDS } from '../../src/art/coins.js';
import { readFileSync } from 'node:fs';
// Read the version rather than hard-coding it — this sheet is sent to the owner
// and carried a stale "v1.66.0" label for seven releases.
const VERSION = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url).pathname, 'utf8')).version;

const IDS = ['penny', 'nickel', 'dime', 'quarter', 'buck'];
const SIDES = ['obverse', 'reverse'];
const BIG = 300;          // detail view
const PAD = 16, LAB = 34, HEAD = 44, NAMEW = 96;

const render = async (id, side, px, box) => {
  const png = await sharp(Buffer.from(coinSVG(id, px, { side }))).png().toBuffer();
  return sharp(png).resize(box, box, { kernel: 'nearest', fit: 'contain', background: '#ffffff' }).png().toBuffer();
};

// ---- sheet 1: the detail view, both sides side by side, one row per coin
{
  const W = NAMEW + 2 * (BIG + PAD) + PAD;
  const H = HEAD + IDS.length * (BIG + PAD + LAB) + PAD;
  const layers = [];
  const text = [
    `<text x="${PAD}" y="26" font-family="monospace" font-size="18" fill="#111">Compounded — coin art, every face, v${VERSION}</text>`,
  ];
  for (let r = 0; r < IDS.length; r++) {
    const id = IDS[r];
    const top = HEAD + r * (BIG + PAD + LAB);
    text.push(`<text x="${PAD}" y="${top + 16}" font-family="monospace" font-size="15" fill="#333">${id}</text>`);
    for (let c = 0; c < SIDES.length; c++) {
      layers.push({ input: await render(id, SIDES[c], 380, BIG), left: NAMEW + PAD + c * (BIG + PAD), top: top + LAB - 12 });
      text.push(`<text x="${NAMEW + PAD + c * (BIG + PAD)}" y="${top + 16}" font-family="monospace" font-size="13" fill="#888">${SIDES[c]}</text>`);
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="#ffffff"/>${text.join('')}</svg>`;
  await sharp(Buffer.from(svg)).composite(layers).png()
    .toFile(new URL('./_progress-detail.png', import.meta.url).pathname);
  console.log(`wrote _progress-detail.png  (${W}x${H})`);
}

// ---- sheet 2: true size, the way a child sees them, all five together
// Sizes are read off the RENDER rather than assumed: coinPx() returns {w,h}
// scaled from the real diameters and the note is not square, so laying out
// from a single number gets the note wrong.
{
  const BASE = 84; // the naming draw
  const shots = [];
  for (const side of SIDES) {
    const row = [];
    for (const id of IDS) {
      const png = await sharp(Buffer.from(coinSVG(id, BASE, { side }))).png().toBuffer();
      const m = await sharp(png).metadata();
      row.push({ id, png, w: m.width, h: m.height });
    }
    shots.push(row);
  }
  const tall = Math.max(...shots.flat().map((s) => s.h));
  const wid = shots[0].reduce((s, c) => s + c.w + PAD, PAD);
  const W = Math.max(wid, 560), H = HEAD + SIDES.length * (tall + PAD + 20) + PAD;
  const layers = [];
  const text = [`<text x="${PAD}" y="26" font-family="monospace" font-size="16" fill="#111">true size at the naming draw (${BASE}px base) — what a child actually sees</text>`];
  for (let s = 0; s < SIDES.length; s++) {
    let x = PAD;
    const top = HEAD + s * (tall + PAD + 20);
    text.push(`<text x="${PAD}" y="${top + 13}" font-family="monospace" font-size="12" fill="#888">${SIDES[s]}</text>`);
    for (const c of shots[s]) {
      layers.push({ input: c.png, left: Math.round(x), top: Math.round(top + 20 + (tall - c.h) / 2) });
      x += c.w + PAD;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="#ffffff"/>${text.join('')}</svg>`;
  await sharp(Buffer.from(svg)).composite(layers).png()
    .toFile(new URL('./_progress-truesize.png', import.meta.url).pathname);
  console.log(`wrote _progress-truesize.png  (${W}x${H})   ` + shots[0].map((c) => `${c.id} ${c.w}x${c.h}`).join(', '));
}
