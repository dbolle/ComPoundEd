// _jn6look — D12. The nickel obverse across the icon->mid seam, for the
// baseline trio and for the two candidate icon trios, each drawn at its REAL
// device pixel count and then nearest-neighbour enlarged so a pixel is a
// pixel. Plus a CONTROL row (§3 D12, Appendix Q5): the nickel REVERSE, which
// no candidate here can touch. If a difference shows up in the control row it
// is not the change.
//
// The control is rendered FIRST and read first, because by the time this runs
// I have already computed d(ink) for every candidate and R6 says the judge —
// and the specialist — cannot un-read their own arithmetic.
//
// Run: node coloringbook/judge/_jn6look.mjs
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SRC = new URL('../../src/art/coins.js', import.meta.url).pathname;
const MONEY = new URL('../../src/engine/money.js', import.meta.url).pathname;
const raw = readFileSync(SRC, 'utf8');
const ANCHOR = 's: 0.95, cy: 43.7, cx: -6.4, iconS: 0.95, iconCy: 43.7, iconCx: -6.4,';
const DIR = mkdtempSync(join(tmpdir(), 'jn6look-'));

const ROWS = [
  ['CONTROL nickel REVERSE (untouched)', 0.95, -6.4, 43.7, 'reverse'],
  ['baseline  iconS 0.950  fill 0.736', 0.95, -6.4, 43.7, 'obverse'],
  ['cand A    iconS 1.032  fill 0.800', 1.032, -7.03, 49.31, 'obverse'],
  ['cand B    iconS 1.109  fill 0.859', 1.109, -7.47, 52.69, 'obverse'],
];
const SIZES = [26, 38, 42, 44, 54, 84];
const Z = 5, PAD = 8;

const tiles = [];
for (const [label, s, cx, cy, side] of ROWS) {
  const p = join(DIR, `r${tiles.length}.js`);
  writeFileSync(p, raw.split("from '../engine/money.js'").join(`from '${MONEY}'`)
    .split(ANCHOR).join(`s: 0.95, cy: 43.7, cx: -6.4, iconS: ${s}, iconCy: ${cy}, iconCx: ${cx},`));
  const { coinSVG } = await import(p);
  const row = [];
  for (const size of SIZES) {
    const svg = coinSVG('nickel', size, { side });
    const W = Math.round(Number(svg.match(/width="([\d.]+)"/)[1]));
    row.push(await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
      .resize(W, W, { fit: 'fill' })
      .resize(W * Z, W * Z, { kernel: 'nearest' }).png().toBuffer());
  }
  tiles.push({ label, row });
}

const cellW = Math.round(Number((await import(join(DIR, 'r0.js'))).coinSVG('nickel', 84).match(/width="([\d.]+)"/)[1])) * Z;
const colX = []; let x = 260;
for (const s of SIZES) { colX.push(x); x += cellW + PAD; }
const H = tiles.length * (cellW + PAD) + 40;
const bg = await sharp({ create: { width: x + PAD, height: H, channels: 3, background: '#303030' } }).png().toBuffer();
const comp = [];
tiles.forEach((t, i) => t.row.forEach((b, j) => comp.push({ input: b, left: colX[j], top: 40 + i * (cellW + PAD) })));
const labels = tiles.map((t, i) => `<text x="6" y="${40 + i * (cellW + PAD) + cellW / 2}" font-family="monospace" font-size="16" fill="#fff">${t.label}</text>`).join('')
  + SIZES.map((s, j) => `<text x="${colX[j]}" y="26" font-family="monospace" font-size="16" fill="#8ff">${s}px  ${s >= 76 ? 'full' : s >= 44 ? 'mid' : 'icon'}</text>`).join('');
comp.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${x + PAD}" height="${H}">${labels}</svg>`) });
await sharp(bg).composite(comp).png().toFile(new URL('./_jn6look.png', import.meta.url).pathname);
console.log(`wrote _jn6look.png  (nearest-neighbour x${Z}; every coin drawn at its real device pixel count first)`);
console.log('rows: CONTROL first. columns cross the 42->44 icon/mid seam and the 74->76 mid/full seam.');
