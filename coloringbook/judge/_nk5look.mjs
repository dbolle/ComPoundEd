// D12 LOOK, at the sizes the app draws, WITH A PINNED CONTROL RENDERED FIRST.
//
// Control column 1 is always the PENNY obverse at the same size, rendered by
// the same code path. If the control does not look like our penny, the sheet
// is of something other than the app's art and nothing beside it can be read.
// Column 2 is our nickel obverse. Columns 3+ are the nickel photographs from
// T1's own pool, cropped to their fitted disc and downsampled to the SAME
// device size, then nearest-upsampled — i.e. exactly the pixels T1 compares.
//
// Reports only: one gitignored PNG under judge/, no target touched.
// Run: node coloringbook/judge/_nk5look.mjs [sizes...]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { coinSVG } from '../../src/art/coins.js';
import { POOL_BY_SIDE } from './_jt1transfer.mjs';

const REF = new URL('../ref/', import.meta.url).pathname;
const DISCS = JSON.parse(readFileSync(new URL('./_jp1discs.json', import.meta.url).pathname, 'utf8'));
const SIZES = process.argv.slice(2).map(Number).filter(Boolean);
const PX = SIZES.length ? SIZES : [38, 48, 54, 84];
const Z = 200;

const oursAt = async (id, px) => sharp(Buffer.from(coinSVG(id, px, { side: 'obverse' })))
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

const rows = [];
for (const px of PX) {
  const cells = [{ t: `CONTROL penny ${px}`, b: await oursAt('penny', px) },
                 { t: `OURS nickel ${px}`, b: await oursAt('nickel', px) }];
  for (const f of POOL_BY_SIDE.obverse.nickel) cells.push({ t: `${f} @${px}`, b: await refAt(f, px) });
  rows.push(cells);
}
const COLS = rows[0].length;
const W = COLS * (Z + 8) + 8, H = rows.length * (Z + 26) + 8;
const txt = rows.flatMap((cs, r) => cs.map((c, i) =>
  `<text x="${8 + i * (Z + 8)}" y="${8 + r * (Z + 26) + 14}" font-family="monospace" font-size="11" fill="#111">${c.t}</text>`)).join('');
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>${txt}</svg>`))
  .composite(rows.flatMap((cs, r) => cs.map((c, i) => ({ input: c.b, left: 8 + i * (Z + 8), top: 8 + r * (Z + 26) + 20 }))))
  .png().toFile('coloringbook/judge/_nk5look.png');
console.log('wrote _nk5look.png  sizes ' + PX.join(','));
