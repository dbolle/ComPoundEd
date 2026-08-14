// BUCK r0 — the picture every geometric reading in this round is taken off
// (§4.3 / PY7: "the picture the question is asked in").
//
// The reference is rectified into a chosen FIDUCIAL's normalised square and
// gridded in OUR viewBox units; our own render is put through the same map and
// shown beside it and washed over it.
//
// FID=border  (default, REVERSE ONLY)  unit square = the printed border quad,
//             which corresponds to our inner frame rect (5,5)-(95,51).
// FID=paper   unit square = the paper box, which corresponds to our OUTER
//             rect (1.4,1.4)-(98.6,54.6). This is the only fiducial available
//             on the obverse (R0: both obverse border fits land on blank
//             paper), and it is 4-5x less repeatable — every reading taken
//             through it carries that.
//
//   node coloringbook/judge/_jb2grid.mjs <file> <obverse|reverse> [S] [out]
//   env FID=border|paper  SIZE=190
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { fitBorder, grey } from '../_blfit.mjs';
import { homography, uv2px, at } from '../_blnorm.mjs';
const { coinSVG, coinPx } = await import('../../src/art/coins.js');

const file = process.argv[2] || 'bill-rev-2.jpg';
const side = process.argv[3] || 'reverse';
const S = +(process.argv[4] || 14);
const out = process.argv[5] || `coloringbook/judge/_jb2-${side}-${file.replace(/\W+/g, '_')}.png`;
const FID = process.env.FID || 'border';
const SIZE = +(process.env.SIZE || 190);

// our rect that corresponds to the chosen fiducial, in viewBox units
const F = FID === 'paper' ? { x0: 1.4, y0: 1.4, x1: 98.6, y1: 54.6 } : { x0: 5, y0: 5, x1: 95, y1: 51 };
const FW = F.x1 - F.x0, FH = F.y1 - F.y0;
const W = Math.round(FW * S), H = Math.round(FH * S);

const fit = await fitBorder(file);
const g = await grey(file);
let corners;
if (FID === 'paper') {
  const p = fit.paperBox;
  corners = { TL: [p.px0, p.py0], TR: [p.px1, p.py0], BR: [p.px1, p.py1], BL: [p.px0, p.py1] };
} else corners = fit.corners;
for (const c of Object.values(corners)) if (!c.every(Number.isFinite)) throw new Error('non-finite corner');
const Hm = homography(corners);
const ref = Buffer.alloc(W * H);
for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
  const [px, py] = uv2px(Hm, (i + 0.5) / W, (j + 0.5) / H);
  ref[j * W + i] = Math.max(0, Math.min(255, Math.round(at(g, px, py))));
}

// ours through the same map: render, then crop the rect F out of the 100x56 box
const box = coinPx('buck', SIZE);
const svg = coinSVG('buck', SIZE, { side });
if (/undefined|NaN|null/.test(svg)) throw new Error('undefined/NaN/null in our note SVG');
const RW = Math.round(FW * S * 100 / FW), RH = Math.round(RW * 56 / 100); // render 100 units at S px/unit * (100/FW)
const full = await sharp(Buffer.from(svg)).resize(Math.round(100 * S), Math.round(56 * S), { fit: 'fill' })
  .flatten({ background: '#ffffff' }).png().toBuffer();
const ours = await sharp(full).extract({
  left: Math.round(F.x0 * S), top: Math.round(F.y0 * S), width: W, height: H,
}).toColourspace('srgb').png().toBuffer();

const grid = (tag) => {
  let s = '';
  for (let X = F.x0; X <= F.x1 + 0.01; X += 5) {
    const x = (X - F.x0) * S;
    s += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#ff00c8" stroke-width="${Math.round(X) % 10 ? 0.6 : 1.2}" opacity="0.5"/>` +
      `<text x="${x + 2}" y="13" fill="#ff00c8" font-size="11" font-family="monospace">${X.toFixed(0)}</text>`;
  }
  for (let Y = F.y0; Y <= F.y1 + 0.01; Y += 5) {
    const y = (Y - F.y0) * S;
    s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#ff00c8" stroke-width="${Math.round(Y) % 10 ? 0.6 : 1.2}" opacity="0.5"/>` +
      `<text x="2" y="${y - 2}" fill="#ff00c8" font-size="11" font-family="monospace">${Y.toFixed(0)}</text>`;
  }
  s += `<text x="${W - 400}" y="${H - 8}" fill="#ffe000" font-size="16" font-family="monospace">${tag}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${s}</svg>`;
};
const tileA = await sharp(ref, { raw: { width: W, height: H, channels: 1 } }).toColourspace('srgb').png().toBuffer()
  .then((b) => sharp(b).composite([{ input: Buffer.from(grid(`${file}  FID=${FID}  grid = OUR viewBox units`)), top: 0, left: 0 }]).png().toBuffer());
const tileB = await sharp(ours).composite([{ input: Buffer.from(grid(`ours, buck ${side}, size ${SIZE}, same grid`)), top: 0, left: 0 }]).png().toBuffer();

await sharp({ create: { width: W + 16, height: 2 * H + 24, channels: 3, background: '#101010' } })
  .composite([{ input: tileA, left: 8, top: 8 }, { input: tileB, left: 8, top: H + 16 }]).png().toFile(out);
console.log(out, `${W + 16}x${2 * H + 24}`, `FID=${FID} ratio ${fit.ratio.toFixed(4)} paper ${fit.paperBox.ratio.toFixed(4)}`);
console.log(`grid labels are OUR viewBox units; the fiducial maps to X ${F.x0}..${F.x1}, Y ${F.y0}..${F.y1}`);
