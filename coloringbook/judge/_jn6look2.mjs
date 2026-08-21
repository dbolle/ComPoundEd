// _jn6look2 — D12 for the change that was actually kept (`hairLit` on the
// nickel). Two revisions, named by path, at the tiers that draw the hair mass,
// each beside the photograph reduced to the SAME device pixel count.
//
// CONTROL FIRST (§3 D12 / Appendix Q5): the top row is the nickel REVERSE from
// BOTH revisions. The byte-identity partition says those 10 renders are
// identical, so anything that appears to differ there is my eye, not the
// change — and I have already computed d(ratio) for this change, which R6 says
// is as strong a prior as being told.
//
// Run: node coloringbook/judge/_jn6look2.mjs
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const AFTER = new URL('../../src/art/coins.js', import.meta.url).pathname;
const BEFORE0 = new URL('./_jn6-before-coins.js', import.meta.url).pathname;
const MONEY = new URL('../../src/engine/money.js', import.meta.url).pathname;
const raw = readFileSync(BEFORE0, 'utf8');
const bp = join(mkdtempSync(join(tmpdir(), 'jn6look2-')), 'coins.js');
writeFileSync(bp, raw.split("from '../engine/money.js'").join(`from '${MONEY}'`));
const A = await import(bp), B = await import(AFTER);

const SIZES = [84, 120, 190];
const Z = 3, PAD = 10;
const rows = [
  ['CONTROL nickel.reverse  BEFORE', A, 'reverse'],
  ['CONTROL nickel.reverse  AFTER ', B, 'reverse'],
  ['nickel.obverse  BEFORE (hair = p.hair)', A, 'obverse'],
  ['nickel.obverse  AFTER  (hair = p.cloth)', B, 'obverse'],
];
const cells = [];
for (const [label, m, side] of rows) {
  const r = [];
  for (const size of SIZES) {
    const svg = m.coinSVG('nickel', size, { side });
    const W = Math.round(Number(svg.match(/width="([\d.]+)"/)[1]));
    r.push({ buf: await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
      .resize(W, W, { fit: 'fill' }).resize(W * Z, W * Z, { kernel: 'nearest' }).png().toBuffer(), W: W * Z });
  }
  cells.push({ label, r });
}
// the photograph at the same device pixel count as the 190px draw
const bigW = cells[0].r[SIZES.length - 1].W / Z;
// our viewBox is 100 units across a disc of radius 47, so the crop that
// corresponds to our whole SVG box is 100/47 x the fitted disc RADIUS, centred
// on the fitted centre. It runs off the top-left of this file by a few pixels,
// so the crop is clamped and the pad is added back — clamping silently would
// misregister the comparison.
{
  const R = 701.95, cx = 740.62, cy = 746.97, half = R * 100 / 94;
  const L = Math.round(cx - half), T = Math.round(cy - half), S = Math.round(2 * half);
  const padL = Math.max(0, -L), padT = Math.max(0, -T);
  var photo = await sharp(new URL('../ref/nickel-obv-unc2004.jpg', import.meta.url).pathname)
    .extract({ left: L + padL, top: T + padT, width: S - padL, height: S - padT })
    .extend({ left: padL, top: padT, background: '#ffffff' })
    .resize(bigW, bigW).resize(bigW * Z, bigW * Z, { kernel: 'nearest' }).png().toBuffer();
}

const colW = cells[0].r.map((c) => c.W);
const X = []; let x = 340;
for (const w of colW) { X.push(x); x += w + PAD; }
const photoX = x; x += bigW * Z + PAD;
const H = cells.reduce((s, c) => s + c.r[c.r.length - 1].W + PAD, 0) + 40;
const comp = [];
let y = 40;
const labels = [];
for (const c of cells) {
  c.r.forEach((cell, j) => comp.push({ input: cell.buf, left: X[j], top: y }));
  labels.push(`<text x="6" y="${y + 30}" font-family="monospace" font-size="17" fill="#fff">${c.label}</text>`);
  y += c.r[c.r.length - 1].W + PAD;
}
comp.push({ input: photo, left: photoX, top: 40 });
labels.push(SIZES.map((s, j) => `<text x="${X[j]}" y="26" font-family="monospace" font-size="16" fill="#8ff">${s}px</text>`).join(''));
labels.push(`<text x="${photoX}" y="26" font-family="monospace" font-size="16" fill="#fd6">nickel-obv-unc2004.jpg reduced to ${bigW}px</text>`);
comp.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${x}" height="${H}">${labels.join('')}</svg>`) });
await sharp({ create: { width: x, height: H, channels: 3, background: '#303030' } })
  .composite(comp).png().toFile(new URL('./_jn6look2.png', import.meta.url).pathname);
console.log(`wrote _jn6look2.png   before=${BEFORE0}  after=${AFTER}`);
