// ROUND 4 — the 50 px coordinate ladder the hand disc seeds in `_jq41hand.mjs`
// were read off. §4.3: "an image's reproducible artefact is its GENERATOR" —
// the overlays are excluded from git for size, so this is the committed record
// of how they were drawn, and running it reproduces them exactly.
//
// Usage:  node judge/_jq41grid.mjs [file ...]     (run from coloringbook/)
import sharp from 'sharp';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const files = process.argv.slice(2).length ? process.argv.slice(2)
  : ['qp1964-obv-pad.png', 'qp1964-rev-pad.png', 'quarter-proof-ebay.jpg'];

for (const f of files) {
  const md = await sharp(P(f)).metadata();
  const W = md.width, H = md.height;
  let g = '';
  for (let x = 0; x < W; x += 50)
    g += `<path d="M${x} 0V${H}" stroke="${x % 200 ? '#00ffff55' : '#ff00ff'}" stroke-width="${x % 200 ? 1 : 2}"/>` +
      `<text x="${x + 2}" y="16" font-family="monospace" font-size="15" fill="#ff0">${x}</text>`;
  for (let y = 0; y < H; y += 50)
    g += `<path d="M0 ${y}H${W}" stroke="${y % 200 ? '#00ffff55' : '#ff00ff'}" stroke-width="${y % 200 ? 1 : 2}"/>` +
      `<text x="2" y="${y - 2}" font-family="monospace" font-size="15" fill="#ff0">${y}</text>`;
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${g}</svg>`);
  const full = await sharp(P(f)).flatten({ background: '#808080' }).composite([{ input: svg }]).png().toBuffer();
  const out = new URL(`./_jq41grid-${f.replace(/\..*/, '')}.png`, import.meta.url).pathname;
  await sharp(full).resize(920).png().toFile(out);
  console.log(`${f} ${W}x${H} -> ${out}   (labels are SOURCE pixel coordinates)`);
}
