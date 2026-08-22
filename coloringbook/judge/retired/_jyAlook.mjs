// ROUND (cent obverse, mid-jaw) — the D12 sheet, WITH CONTROLS RENDERED FIRST.
//
// Appendix Q5 / R6: the judge cannot un-read a claim, and a described artefact
// is found by an eye that went looking for it. So this sheet puts the CONTROLS
// in the top rows — the penny REVERSE and the nickel OBVERSE, neither of which
// this round can have touched — before the subject, and renders every row for
// BOTH revisions. Anything that appears in a control row is not this round's.
//
// Each cell is drawn at the tier's REAL device pixel count and then upscaled
// nearest-neighbour, so what is on screen is what a child's device rasterises.
//
// Run: node coloringbook/judge/_jyAlook.mjs <before.js> [tag]
import sharp from 'sharp';

const BEFORE = process.argv[2];
const TAG = process.argv[3] || 'v5';
if (!BEFORE) throw new Error('give the path to the BEFORE copy of coins.js');
const before = await import(BEFORE.startsWith('/') ? `file://${BEFORE}` : `${process.cwd()}/${BEFORE}`);
const after = await import(`${process.cwd()}/src/art/coins.js`);

const ROWS = [
  ['CONTROL penny reverse', 'penny', 'reverse'],
  ['CONTROL nickel obverse', 'nickel', 'obverse'],
  ['SUBJECT penny obverse', 'penny', 'obverse'],
];
const SIZES = [26, 44, 84, 190];
const CELL = 300, PAD = 10, LAB = 26, HEAD = 30, NAMEW = 200;

const cell = async (mod, id, side, px) => {
  const svg = mod.coinSVG(id, px, { side });
  const W = Math.round(Number(svg.match(/width="([\d.]+)"/)[1]));
  const png = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' }).resize(W, W, { fit: 'fill' }).png().toBuffer();
  return { buf: await sharp(png).resize(CELL, CELL, { kernel: 'nearest', fit: 'contain', background: '#ffffff' }).png().toBuffer(), W };
};

const cols = SIZES.length * 2;
const Wpx = NAMEW + cols * (CELL + PAD) + PAD;
const Hpx = HEAD + ROWS.length * (CELL + PAD + LAB) + PAD;
const layers = []; const text = [];
text.push(`<text x="8" y="20" font-family="monospace" font-size="16" fill="#111">cent obverse mid-jaw round — CONTROLS FIRST. per size: LEFT = before, RIGHT = after (${TAG}). Each cell is the real device pixel count, nearest-upscaled.</text>`);
for (let r = 0; r < ROWS.length; r++) {
  const [label, id, side] = ROWS[r];
  const top = HEAD + r * (CELL + PAD + LAB);
  text.push(`<text x="8" y="${top + CELL / 2}" font-family="monospace" font-size="15" fill="#333">${label}</text>`);
  for (let c = 0; c < SIZES.length; c++) {
    for (let k = 0; k < 2; k++) {
      const mod = k === 0 ? before : after;
      const { buf, W } = await cell(mod, id, side, SIZES[c]);
      const left = NAMEW + (2 * c + k) * (CELL + PAD) + PAD;
      layers.push({ input: buf, left, top });
      text.push(`<text x="${left}" y="${top + CELL + 18}" font-family="monospace" font-size="14" fill="#333">${SIZES[c]}px = ${W}dev ${k === 0 ? 'BEFORE' : 'AFTER'}</text>`);
    }
  }
}
const out = `coloringbook/_pv/_jyAlook-${TAG}.png`;
await sharp({ create: { width: Wpx, height: Hpx, channels: 3, background: '#ffffff' } })
  .composite([...layers, { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${Wpx}" height="${Hpx}">${text.join('')}</svg>`), top: 0, left: 0 }])
  .toFile(out);
console.log('wrote', out);
