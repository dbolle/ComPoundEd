// ROUND 5, cent obverse — D12 contact sheet. Renders the cent obverse at the
// three tiers a child actually sees, at their REAL device pixel counts and then
// nearest-upscaled (never resampled), for any number of revisions side by side.
//
// THE CONTROL IS RENDERED FIRST (Appendix Q5). Column 1 is always the pinned
// baseline `coloringbook/judge/_jc5-before-coins.js`, whatever else is asked for,
// so anything visible in column 1 cannot be attributed to this round.
//
// Run: node coloringbook/judge/_jc5look.mjs <tag> [srcA] [srcB] ...
import sharp from 'sharp';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';

const TAG = process.argv[2] || 'look';
const SRCS = ['coloringbook/judge/_jc5-before-coins.js', ...process.argv.slice(3)];
const TIERS = [26, 44, 84];
const UP = 6;
const PAD = 10;

async function loadRevision(p, i) {
  const tmp = `src/art/_jc5tmp-look${i}.js`;
  writeFileSync(tmp, readFileSync(p, 'utf8'));
  try { return await import(`${process.cwd()}/${tmp}?t=${Date.now()}`); } finally { rmSync(tmp); }
}

const cols = [];
for (let i = 0; i < SRCS.length; i++) {
  const mod = await loadRevision(SRCS[i], i);
  const tiles = [];
  for (const t of TIERS) {
    const svg = mod.coinSVG('penny', t, { side: 'obverse' });
    const px = Number(svg.match(/width="([0-9.]+)"/)[1]);
    const buf = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
      .resize(Math.round(px * UP), Math.round(px * UP), { kernel: 'nearest' }).png().toBuffer();
    tiles.push({ buf, w: Math.round(px * UP), h: Math.round(px * UP), t, px });
  }
  cols.push({ src: SRCS[i], tiles });
}

const colW = Math.max(...cols.flatMap((c) => c.tiles.map((t) => t.w))) + PAD;
const rowY = []; let y = 26;
for (let r = 0; r < TIERS.length; r++) { rowY.push(y); y += Math.max(...cols.map((c) => c.tiles[r].h)) + 26; }
const W = colW * cols.length, H = y;
const comp = [];
let lab = '';
for (let i = 0; i < cols.length; i++) {
  lab += `<text x="${i * colW + 4}" y="18" font-family="monospace" font-size="14" fill="#000">${i === 0 ? 'CONTROL ' : ''}${cols[i].src.split('/').pop()}</text>`;
  for (let r = 0; r < TIERS.length; r++) {
    comp.push({ input: cols[i].tiles[r].buf, left: i * colW + PAD / 2, top: rowY[r] });
    lab += `<text x="${i * colW + 4}" y="${rowY[r] + cols[i].tiles[r].h + 18}" font-family="monospace" font-size="13" fill="#000">${TIERS[r]}px box = ${cols[i].tiles[r].px} device px, x${UP} nearest</text>`;
  }
}
await sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } })
  .composite([...comp, { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${lab}</svg>`), top: 0, left: 0 }])
  .toFile(`coloringbook/_pv/_jc5look-${TAG}.png`);
console.log(`wrote coloringbook/_pv/_jc5look-${TAG}.png  columns: ${cols.map((c) => c.src).join('  |  ')}`);
