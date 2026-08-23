// THE PICTURES. D12 is the gate that has found every wrong-in-kind defect on
// this project and none was found by a number, so the three sheets a nickel
// reverse round needs are here in one place. Reports; writes only PNGs into
// the gitignored `judge/` scratch (WRITERS.md).
//
//   grid   <x0> <x1> <y0> <y1> <pxPerUnit>
//          each reference cropped to the SAME viewBox window at its own frozen
//          disc, with a 1-unit grid, 5-unit rules and the x=50 axis in green.
//          Coordinates are read off it directly. This is how every number in
//          the v1.82.0 header block was checked by eye after the ladders gave
//          it, and how the "inner columns are 1.7 units out" hypothesis was
//          killed (it was `nickel-rev-2.png`'s 0.65-unit device offset — see
//          `_nkr4axis.mjs`).
//
//   side   <x0> <x1> <y0> <y1> <pxPerUnit>
//          OUR render stacked above the three photographs in the same window.
//          Our blank is r=47 of the viewBox, NOT half the width; normalising by
//          the width draws our device 6% small and flatters it (`_nk3over.mjs`).
//
//   look   D12 at the sizes money.js draws — 38/48/54/84 — WITH A PINNED
//          CONTROL RENDERED FIRST. The control is the CENT reverse: if it does
//          not come out looking like the Memorial, the rasteriser is broken and
//          nothing below it may be believed.
//
// usage: node coloringbook/judge/_nkr5sheet.mjs <grid|side|look> [args]
import sharp from 'sharp';
import { join } from 'node:path';
import { JUDGE, REF, ROOT } from './_paths.mjs';
import { DISCS, POOL } from './_nkrlib.mjs';

const { coinSVG } = await import(join(ROOT, 'src/art/coins.js'));
const mode = process.argv[2] || 'look';
const num = (i, d) => (process.argv[i] === undefined ? d : Number(process.argv[i]));

async function refTile(f, x0, x1, y0, y1, W, H) {
  const D = DISCS[f];
  return sharp(join(REF, f)).flatten({ background: '#ffffff' }).extract({
    left: Math.round(D.cx + (D.R * (x0 - 50)) / 47),
    top: Math.round(D.cy + (D.R * (y0 - 50)) / 47),
    width: Math.round((D.R * (x1 - x0)) / 47),
    height: Math.round((D.R * (y1 - y0)) / 47),
  }).resize(W, H, { fit: 'fill' }).normalise().png().toBuffer();
}
async function oursTile(x0, x1, y0, y1, W, H) {
  const png = await sharp(Buffer.from(coinSVG('nickel', 2000, { side: 'reverse' })))
    .flatten({ background: '#ffffff' }).png().toBuffer();
  const m = await sharp(png).metadata();
  return sharp(png).extract({
    left: Math.round((x0 / 100) * m.width), top: Math.round((y0 / 100) * m.height),
    width: Math.round(((x1 - x0) / 100) * m.width), height: Math.round(((y1 - y0) / 100) * m.height),
  }).resize(W, H, { fit: 'fill' }).png().toBuffer();
}
function gridSvg(x0, x1, y0, y1, PPU, W, H) {
  const l = [];
  for (let X = Math.ceil(x0); X <= x1; X++) {
    const px = (X - x0) * PPU, major = X % 5 === 0;
    l.push(`<line x1="${px}" y1="0" x2="${px}" y2="${H}" stroke="${major ? '#ff2020' : '#20a0ff'}" stroke-width="${major ? 1.1 : 0.5}" opacity="${major ? 0.75 : 0.4}"/>`);
    if (major) l.push(`<text x="${px + 2}" y="12" font-family="monospace" font-size="11" fill="#ff2020">${X}</text>`);
  }
  for (let Y = Math.ceil(y0); Y <= y1; Y++) {
    const py = (Y - y0) * PPU, major = Y % 5 === 0;
    l.push(`<line x1="0" y1="${py}" x2="${W}" y2="${py}" stroke="${major ? '#ff2020' : '#20a0ff'}" stroke-width="${major ? 1.1 : 0.5}" opacity="${major ? 0.75 : 0.4}"/>`);
    if (major) l.push(`<text x="2" y="${py - 2}" font-family="monospace" font-size="11" fill="#ff2020">${Y}</text>`);
  }
  l.push(`<line x1="${(50 - x0) * PPU}" y1="0" x2="${(50 - x0) * PPU}" y2="${H}" stroke="#00c000" stroke-width="1.4" opacity="0.8"/>`);
  return l.join('');
}

if (mode === 'grid' || mode === 'side') {
  const x0 = num(3, 8), x1 = num(4, 92), y0 = num(5, 22), y1 = num(6, 64), PPU = num(7, 12);
  const W = Math.round((x1 - x0) * PPU), H = Math.round((y1 - y0) * PPU);
  const names = [], tiles = [];
  if (mode === 'side') { names.push('OURS (live src/art/coins.js)'); tiles.push(await oursTile(x0, x1, y0, y1, W, H)); }
  for (const f of POOL) { names.push(f); tiles.push(await refTile(f, x0, x1, y0, y1, W, H)); }
  if (mode === 'grid') {
    const g = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${gridSvg(x0, x1, y0, y1, PPU, W, H)}</svg>`);
    for (let i = 0; i < tiles.length; i++) tiles[i] = await sharp(tiles[i]).composite([{ input: g }]).png().toBuffer();
  }
  const HH = tiles.length * (H + 24) + 8;
  const txt = names.map((n, i) => `<text x="6" y="${20 + i * (H + 24)}" font-family="monospace" font-size="13" fill="#111">${n}</text>`).join('');
  const out = join(JUDGE, `_nkr5-${mode}-${x0}_${x1}_${y0}_${y1}.png`);
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${HH}"><rect width="${W}" height="${HH}" fill="#fff"/>${txt}</svg>`))
    .composite(tiles.map((b, i) => ({ input: b, left: 0, top: 24 + i * (H + 24) })))
    .png().toFile(out);
  console.log('wrote', out.slice(ROOT.length + 1), `window x ${x0}..${x1} y ${y0}..${y1} at ${PPU}px/unit`);
} else {
  const SIZES = [38, 48, 54, 84], ZOOM = 5;
  const rows = [['CONTROL  cent reverse', 'penny', 'reverse'],
    ['SUBJECT  nickel reverse', 'nickel', 'reverse'],
    ['nickel obverse (untouched)', 'nickel', 'obverse']];
  const parts = [];
  let y = 10, maxX = 0;
  for (const [, id, side] of rows) {
    let x = 190;
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
  parts.push({ input: await sharp(Buffer.from(coinSVG('nickel', 380, { side: 'reverse' }))).flatten({ background: '#f2f2f2' }).png().toBuffer(), left: 190, top: Math.round(y) });
  const W = Math.max(maxX + 10, 760), H = y + 350;
  const labels = rows.map((r, i) => `<text x="8" y="${28 + i * 138}" font-family="monospace" font-size="13" fill="#111">${r[0]}</text>`).join('')
    + `<text x="8" y="${y + 20}" font-family="monospace" font-size="13" fill="#111">380px (DRAW_SIZE)</text>`
    + `<text x="${W - 250}" y="18" font-family="monospace" font-size="13" fill="#111">38 / 48 / 54 / 84 px, x5</text>`;
  const out = join(JUDGE, '_nkr5-look.png');
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#f2f2f2"/>${labels}</svg>`))
    .composite(parts).png().toFile(out);
  console.log('wrote', out.slice(ROOT.length + 1), '— CHECK THE CONTROL ROW FIRST');
}
