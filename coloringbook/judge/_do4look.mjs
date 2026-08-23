// D12 — LOOK AT IT, WITH A PINNED CONTROL RENDERED FIRST.
//
// The control is a real photograph, rim-fitted and reduced to the SAME device
// box the app gives this coin at each size, printed to the left of ours. If the
// control does not itself read as the coin at 38 px, the sheet says nothing and
// the round must say so.
//
// Sizes are `src/screens/money.js`'s: 38 (the pile a child counts), 48 (the
// target row), 54 (the default row) and 84 (the naming draw, ONE coin alone).
// 380 is the authoring size and is included only so a mark can be found; it is
// not a size the app ever draws.
//
// usage: node coloringbook/judge/_do4look.mjs [denom] [side] [out.png]
import sharp from 'sharp';
import { join } from 'node:path';
import { ROOT, REF, JUDGE } from './_paths.mjs';
import { greyRaw, rimFit } from './_dolib.mjs';

const id = process.argv[2] || 'dime';
const side = process.argv[3] || 'obverse';
const out = process.argv[4] || join(JUDGE, `_do4look-${id}-${side}.png`);
const CONTROLS = { dime: ['dime-obv-unc2005.png', 'dime-obv-3.jpg', 'dime-obv-pcgs2015.png'] };

const { coinSVG, coinPx } = await import(join(ROOT, 'src/art/coins.js'));
const SIZES = [38, 48, 54, 84, 380];
const PAD = 14, ZOOM = 4;

// control tiles: the photograph cropped to its own rim fit, reduced to box.w
const tiles = [];
for (const f of CONTROLS[id] || []) {
  const g = await greyRaw(join(REF, f));
  const D = rimFit(g);
  const left = Math.round(D.cx - D.R * (50 / 47)), top = Math.round(D.cy - D.R * (50 / 47));
  const sz = Math.round(D.R * (100 / 47));
  const row = [];
  for (const s of SIZES) {
    const box = coinPx(id, s);
    const buf = await sharp(join(REF, f))
      .extract({ left: Math.max(0, left), top: Math.max(0, top), width: Math.min(sz, g.w - Math.max(0, left)), height: Math.min(sz, g.h - Math.max(0, top)) })
      .resize(Math.round(box.w), Math.round(box.w), { fit: 'fill' })
      .resize(Math.round(box.w) * ZOOM, Math.round(box.w) * ZOOM, { kernel: 'nearest' })
      .png().toBuffer();
    row.push({ buf, w: Math.round(box.w) * ZOOM });
  }
  tiles.push({ label: f, row });
}
// ours
{
  const row = [];
  for (const s of SIZES) {
    const box = coinPx(id, s);
    const buf = await sharp(Buffer.from(coinSVG(id, s, { side })))
      .flatten({ background: '#ffffff' })
      .resize(Math.round(box.w) * ZOOM, Math.round(box.w) * ZOOM, { kernel: 'nearest' })
      .png().toBuffer();
    row.push({ buf, w: Math.round(box.w) * ZOOM });
  }
  tiles.push({ label: 'OURS', row });
}

const colW = SIZES.map((s, i) => Math.max(...tiles.map((t) => t.row[i].w)) + PAD);
const W = colW.reduce((a, b) => a + b, 0) + PAD;
const H = tiles.reduce((a, t) => a + Math.max(...t.row.map((r) => r.w)) + PAD, 0) + PAD;

const comps = [];
let y = PAD;
for (const t of tiles) {
  let x = PAD;
  const rowH = Math.max(...t.row.map((r) => r.w));
  t.row.forEach((r, i) => {
    comps.push({ input: r.buf, left: Math.round(x), top: Math.round(y + (rowH - r.w) / 2) });
    x += colW[i];
  });
  y += rowH + PAD;
}
await sharp({ create: { width: Math.round(W), height: Math.round(H), channels: 3, background: '#20242a' } })
  .composite(comps).png().toFile(out);
console.log('rows, top to bottom:', tiles.map((t) => t.label).join(' | '));
console.log('cols, left to right:', SIZES.join(' '), '(device px, nearest-neighbour zoom x' + ZOOM + ')');
console.log('wrote', out.replace(ROOT, '<root>'));
