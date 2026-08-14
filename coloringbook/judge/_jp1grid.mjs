// PENNY ROUND 0 — the coordinate ladder every hand disc seed in `_jp1disc.mjs`
// is read off. §4.3: an image's reproducible artefact is its GENERATOR, and the
// PNGs are not tracked, so this file is the committed record.
//
// Same construction as `_jq41grid.mjs` (the quarter's, round 4) — reimplemented
// rather than imported only so that its outputs land under the `_jp` prefix
// this round owns.
//
// Usage:  node coloringbook/judge/_jp1grid.mjs [file ...] [STEP=50]
import sharp from 'sharp';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
export const PENNY_REFS = ['penny-obv.jpg', 'penny-obv-2.jpg', 'penny-obv-3.jpg',
  'penny-obv-4.png', 'penny-rev.jpg', 'penny-rev-2.png', 'penny-rev-artwork.jpg'];

const STEP = +(process.env.STEP || 50);
const files = process.argv.slice(2).length ? process.argv.slice(2) : PENNY_REFS;

for (const f of files) {
  const md = await sharp(P(f)).metadata();
  const W = md.width, H = md.height;
  const maj = STEP * 4;
  let g = '';
  for (let x = 0; x < W; x += STEP)
    g += `<path d="M${x} 0V${H}" stroke="${x % maj ? '#00ffff55' : '#ff00ff'}" stroke-width="${x % maj ? 1 : 2}"/>`
      + `<text x="${x + 2}" y="16" font-family="monospace" font-size="15" fill="#ff0">${x}</text>`;
  for (let y = 0; y < H; y += STEP)
    g += `<path d="M0 ${y}H${W}" stroke="${y % maj ? '#00ffff55' : '#ff00ff'}" stroke-width="${y % maj ? 1 : 2}"/>`
      + `<text x="2" y="${y - 2}" font-family="monospace" font-size="15" fill="#ff0">${y}</text>`;
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${g}</svg>`);
  const full = await sharp(P(f)).flatten({ background: '#808080' }).composite([{ input: svg }]).png().toBuffer();
  const out = new URL(`./_jp1grid-${f.replace(/\..*/, '')}.png`, import.meta.url).pathname;
  await sharp(full).resize(940).png().toFile(out);
  console.log(`${f} ${W}x${H} -> ${out}   (labels are SOURCE pixel coordinates, step ${STEP})`);
}
