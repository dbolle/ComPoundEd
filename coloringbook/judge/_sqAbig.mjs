// SPECIALIST, quarter reverse — a big render of our own drawing, cropped to
// the left wing, on the same viewBox ladder as `_sq8zoom.mjs` puts on the
// references. Same frame, same rings, same grid, so the two can be read
// against each other without registering anything.
//
// Usage: node _sqAbig.mjs [out.png]   env SQ_X0/X1/Y0/Y1/SQ_SC as _sq8zoom
// Generator for: coloringbook/judge/_sqA-*.png
import sharp from 'sharp';
import { coinSVG } from '../../src/art/coins.js';

const X0 = +(process.env.SQ_X0 ?? 8), X1 = +(process.env.SQ_X1 ?? 52);
const Y0 = +(process.env.SQ_Y0 ?? 16), Y1 = +(process.env.SQ_Y1 ?? 72);
const SC = +(process.env.SQ_SC ?? 18);
const SIZE = +(process.env.SQ_SIZE ?? 380);
const out = process.argv[2] || '_sqA-wing.png';

const PXW = Math.round((X1 - X0) * SC), PXH = Math.round((Y1 - Y0) * SC);
const svg = coinSVG('quarter', SIZE, { side: 'reverse', decorative: true })
  .replace(/viewBox="0 0 100 100"/, `viewBox="${X0} ${Y0} ${X1 - X0} ${Y1 - Y0}"`)
  .replace(/width="\d+" height="\d+"/, `width="${PXW}" height="${PXH}"`);

let ov = `<svg xmlns="http://www.w3.org/2000/svg" width="${PXW}" height="${PXH}">`;
const X2p = (X) => (X - X0) * SC, Y2p = (Y) => (Y - Y0) * SC;
for (let r = 26; r <= 42; r += 2)
  ov += `<circle cx="${X2p(50)}" cy="${Y2p(50)}" r="${r * SC}" fill="none" stroke="#00c8ff" stroke-width="${r === 36 ? 2 : 1}" opacity="${r === 36 ? 0.9 : 0.45}"/>` +
    `<text x="${X2p(50 - r) + 3}" y="${Y2p(50) - 4}" font-family="monospace" font-size="13" fill="${r === 36 ? '#ffe600' : '#00c8ff'}">${r}</text>`;
for (let X = Math.ceil(X0 / 5) * 5; X <= X1; X += 5)
  ov += `<line x1="${X2p(X)}" y1="0" x2="${X2p(X)}" y2="${PXH}" stroke="#ff8800" stroke-width="0.6" opacity="0.45"/><text x="${X2p(X) + 2}" y="13" font-family="monospace" font-size="12" fill="#ff8800">${X}</text>`;
for (let Y = Math.ceil(Y0 / 5) * 5; Y <= Y1; Y += 5)
  ov += `<line x1="0" y1="${Y2p(Y)}" x2="${PXW}" y2="${Y2p(Y)}" stroke="#ff8800" stroke-width="0.6" opacity="0.45"/><text x="2" y="${Y2p(Y) - 3}" font-family="monospace" font-size="12" fill="#ff8800">${Y}</text>`;
ov += '</svg>';

await sharp(Buffer.from(svg)).composite([{ input: Buffer.from(ov) }]).png()
  .toFile(new URL('./' + out, import.meta.url).pathname);
console.log(`wrote ${out}  (${PXW}x${PXH}, X ${X0}..${X1}, Y ${Y0}..${Y1}, size ${SIZE}px)`);
