// SPECIALIST (buck obverse) — a 1-unit ladder over the RECTIFIED obverse, in
// OUR viewBox (X,Y) coordinates, so the portrait vignette's contents can be
// read off in the same frame as the frozen D1 oval (cx 50.05 cy 30.30
// rx 9.75 ry 14.00).
//
// Registration caveat carried from buck r0 and NOT hidden: the obverse has no
// printed-border fiducial, so `fitBorder` returns the PAPER box on this side.
// Everything below is therefore read RELATIVE TO THE VIGNETTE OVAL that the
// same pipeline locates, which is self-registering and immune to that caveat.
//
//   node coloringbook/judge/_sw4ladder.mjs <ref#> <X0> <X1> <Y0> <Y1>
import sharp from 'sharp';
import { rectify, XY2uv } from '../_blnorm.mjs';

// _blfit.grey() resolves `./ref/<file>` against ITS OWN file URL, so these are
// bare basenames. NOTE (worktree trap): _blnorm/_blfit are symlinks into the
// main checkout, so they read the MAIN checkout's coloringbook/ref/. That is
// harmless here — they are read-only photographs and neither file touches
// src/ — but it is recorded rather than assumed.
const REFS = ['bill-obv.jpg', 'bill-obv-2.jpg'];
const which = Number(process.argv[2] || 2);
const X0 = Number(process.argv[3] ?? 34), X1 = Number(process.argv[4] ?? 66);
const Y0 = Number(process.argv[5] ?? 12), Y1 = Number(process.argv[6] ?? 50);

const NU = 1800, NV = 700;
const { out } = await rectify(REFS[which - 1], NU, NV);

// pixels-per-viewBox-unit in the rectified image
const [u0, v0] = XY2uv(X0, Y0), [u1, v1] = XY2uv(X1, Y1);
const px0 = Math.round(u0 * NU), py0 = Math.round(v0 * NV);
const px1 = Math.round(u1 * NU), py1 = Math.round(v1 * NV);
const W = px1 - px0, H = py1 - py0;

const raw = Buffer.alloc(W * H);
for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) raw[j * W + i] = Math.max(0, Math.min(255, Math.round(out[(py0 + j) * NU + (px0 + i)])));
const K = Math.max(1, Math.round(1300 / W));
const base = await sharp(raw, { raw: { width: W, height: H, channels: 1 } })
  .resize(W * K, H * K, { kernel: 'nearest' }).png().toBuffer();

// 1-unit ladder, every 5th unit heavy and labelled
let g = '';
for (let X = Math.ceil(X0); X <= X1; X++) {
  const x = ((X - X0) / (X1 - X0)) * W * K;
  const hv = X % 5 === 0;
  g += `<line x1="${x}" y1="0" x2="${x}" y2="${H * K}" stroke="${hv ? '#ff2d55' : '#ff2d55'}" stroke-width="${hv ? 1.6 : 0.5}" opacity="${hv ? 0.9 : 0.35}"/>`;
  if (hv) g += `<text x="${x + 2}" y="14" fill="#ff2d55" font-size="13" font-family="monospace">${X}</text>`;
}
for (let Y = Math.ceil(Y0); Y <= Y1; Y++) {
  const y = ((Y - Y0) / (Y1 - Y0)) * H * K;
  const hv = Y % 5 === 0;
  g += `<line x1="0" y1="${y}" x2="${W * K}" y2="${y}" stroke="#00c2ff" stroke-width="${hv ? 1.6 : 0.5}" opacity="${hv ? 0.9 : 0.35}"/>`;
  if (hv) g += `<text x="2" y="${y - 2}" fill="#00c2ff" font-size="13" font-family="monospace">${Y}</text>`;
}
// the FROZEN D1 oval, drawn so the ladder can be checked against it
const ex = ((50.05 - X0) / (X1 - X0)) * W * K, ey = ((30.3 - Y0) / (Y1 - Y0)) * H * K;
const erx = (9.75 / (X1 - X0)) * W * K, ery = (14 / (Y1 - Y0)) * H * K;
g += `<ellipse cx="${ex}" cy="${ey}" rx="${erx}" ry="${ery}" fill="none" stroke="#ffe000" stroke-width="2.4"/>`;

const out2 = `coloringbook/judge/_swout/_sw4-ladder-ref${which}.png`;
await sharp(base).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W * K}" height="${H * K}">${g}</svg>`), top: 0, left: 0 }]).png().toFile(out2);
console.log(out2, `X ${X0}..${X1}  Y ${Y0}..${Y1}   ${W}x${H} src px, x${K}`);
console.log('yellow = the FROZEN D1 oval cx 50.05 cy 30.30 rx 9.75 ry 14.00');
