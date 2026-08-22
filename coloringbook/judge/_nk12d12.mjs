// D12 — LOOK AT IT, AT THE SIZES THE APP DRAWS, WITH A PINNED CONTROL FIRST.
//
// Column 1 is the DIME OBVERSE, drawn from the AFTER tree, and it is the
// control: the byte partition says it did not move this round, so if column 1
// differs from the same coin in the BEFORE tree the sheet is of something other
// than this round's change and nothing beside it can be read. Column 2 is the
// nickel obverse BEFORE, column 3 AFTER, columns 4-6 the three nickel obverse
// photographs in T1's pool reduced to the same device size.
//
// Every cell is rendered at the app's own size and then nearest-upsampled, so
// no pixel in the sheet is invented.
//
// Reports only: one gitignored PNG under judge/.
// Run: node coloringbook/judge/_nk12d12.mjs <before coins.js>
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { POOL_BY_SIDE } from './_jt1transfer.mjs';

const beforePath = process.argv[2];
if (!beforePath) { console.log('usage: _nk12d12.mjs <before coins.js>'); process.exit(1); }
const A = await import(beforePath);
const B = await import('../../src/art/coins.js');

const REF = new URL('../ref/', import.meta.url).pathname;
const DISCS = JSON.parse(readFileSync(new URL('./_jp1discs.json', import.meta.url).pathname, 'utf8'));
const PX = [38, 48, 54, 84];
const Z = 190;

const draw = async (M, id, px) => sharp(Buffer.from(M.coinSVG(id, px, { side: 'obverse' })))
  .resize(px, px, { fit: 'contain', background: '#ffffff' })
  .flatten({ background: '#ffffff' }).resize(Z, Z, { kernel: 'nearest' }).png().toBuffer();

async function refAt(file, px) {
  const d = DISCS[file]; const m = await sharp(REF + file).metadata();
  const cx = d ? d.cx : m.width / 2, cy = d ? d.cy : m.height / 2;
  const R = d ? d.R : Math.min(m.width, m.height) / 2 * 0.95;
  const L = Math.max(0, Math.round(cx - R)), T = Math.max(0, Math.round(cy - R));
  const S = Math.round(Math.min(2 * R, m.width - L, m.height - T));
  return sharp(REF + file).extract({ left: L, top: T, width: S, height: S })
    .resize(px, px, { fit: 'fill' }).resize(Z, Z, { kernel: 'nearest' }).png().toBuffer();
}

// the control's own check, printed before the sheet exists
let ctrlSame = 0;
for (const px of PX) if (A.coinSVG('dime', px, { side: 'obverse' }) === B.coinSVG('dime', px, { side: 'obverse' })) ctrlSame++;
console.log(`CONTROL dime obverse byte-identical at ${ctrlSame}/${PX.length} sizes`);
if (ctrlSame !== PX.length) { console.log('!! control moved — sheet not written'); process.exit(1); }

const rows = [];
for (const px of PX) {
  const cells = [
    { t: `CONTROL dime ${px}`, b: await draw(B, 'dime', px) },
    { t: `BEFORE nickel ${px}`, b: await draw(A, 'nickel', px) },
    { t: `AFTER nickel ${px}`, b: await draw(B, 'nickel', px) },
  ];
  for (const f of POOL_BY_SIDE.obverse.nickel) cells.push({ t: `${f} @${px}`, b: await refAt(f, px) });
  rows.push(cells);
}
const COLS = rows[0].length;
const W = COLS * (Z + 8) + 8, H = rows.length * (Z + 24) + 8;
const txt = rows.flatMap((cs, r) => cs.map((c, i) =>
  `<text x="${8 + i * (Z + 8)}" y="${8 + r * (Z + 24) + 12}" font-family="monospace" font-size="10" fill="#111">${c.t}</text>`)).join('');
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>${txt}</svg>`))
  .composite(rows.flatMap((cs, r) => cs.map((c, i) => ({ input: c.b, left: 8 + i * (Z + 8), top: 8 + r * (Z + 24) + 16 }))))
  .png().toFile('coloringbook/judge/_nk12d12.png');
console.log('wrote _nk12d12.png');
