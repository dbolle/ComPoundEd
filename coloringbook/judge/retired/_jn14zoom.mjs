// _jn14zoom — a FINE local-frame ladder over an arbitrary window of the nickel
// obverse, on any reference. This is the hand-annotation instrument §2's
// "try the overlay before you block" and PY7 ask for: the coin's own hairline
// is read off a labelled grid rather than described.
//
// It draws NOTHING of ours by default, so the picture cannot be read as a
// comparison; pass LINE=x1,y1,x2,y2,... to lay a candidate polyline over it.
//
//   node coloringbook/judge/_jn14zoom.mjs <ref> <x0> <x1> <y0> <y1> [step] [tag]
//
// LOCAL x runs RIGHT-to-LEFT on the image (dir = -1), which is a standing trap:
// the axis labels are drawn from the mapping itself, not assumed.
import sharp from 'sharp';
import { localToPx, pxPerLocal, REFP } from './_jn14map.mjs';

const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const [, , file, X0, X1, Y0, Y1, STEP = '2', TAG = 'z'] = process.argv;
const x0 = +X0, x1 = +X1, y0 = +Y0, y1 = +Y1, step = +STEP;
const m = await sharp(REFP(file)).metadata();
const ppl = pxPerLocal(file);
const P = (lx, ly) => localToPx(file, lx, ly);

const g = [];
for (let x = Math.ceil(x0 / step) * step; x <= x1; x += step) {
  const a = P(x, y0), b = P(x, y1);
  const major = x % (step * 5) === 0;
  g.push(`<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${major ? '#00e5ff' : '#00e5ff'}" stroke-width="${(major ? 0.16 : 0.07) * ppl}" opacity="${major ? 0.95 : 0.5}"/>`);
  if (major) g.push(`<text x="${a[0].toFixed(1)}" y="${(a[1] - 4).toFixed(1)}" font-family="monospace" font-size="${(2.0 * ppl).toFixed(0)}" fill="#00e5ff" text-anchor="middle">${x}</text>`);
}
for (let y = Math.ceil(y0 / step) * step; y <= y1; y += step) {
  const a = P(x0, y), b = P(x1, y);
  const major = y % (step * 5) === 0;
  g.push(`<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="#00e5ff" stroke-width="${(major ? 0.16 : 0.07) * ppl}" opacity="${major ? 0.95 : 0.5}"/>`);
  if (major) g.push(`<text x="${(Math.min(a[0], b[0]) - 4).toFixed(1)}" y="${a[1].toFixed(1)}" font-family="monospace" font-size="${(2.0 * ppl).toFixed(0)}" fill="#00e5ff" text-anchor="end">${y}</text>`);
}
if (process.env.LINE) {
  const nums = process.env.LINE.split(',').map(Number);
  const pts = [];
  for (let i = 0; i < nums.length; i += 2) pts.push(P(nums[i], nums[i + 1]));
  g.push(`<polyline points="${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')}" fill="none" stroke="#ff2d55" stroke-width="${0.45 * ppl}"/>`);
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${m.width}" height="${m.height}">${g.join('')}</svg>`;
const buf = await sharp(REFP(file)).composite([{ input: Buffer.from(svg) }]).png().toBuffer();
const c0 = P(x0, y0), c1 = P(x1, y1);
const L = Math.max(0, Math.round(Math.min(c0[0], c1[0]) - 6 * ppl)), T = Math.max(0, Math.round(Math.min(c0[1], c1[1]) - 4 * ppl));
const W = Math.min(m.width - L, Math.round(Math.abs(c1[0] - c0[0]) + 10 * ppl));
const H = Math.min(m.height - T, Math.round(Math.abs(c1[1] - c0[1]) + 8 * ppl));
const out = HERE(`_jn14zoom-${TAG}.png`);
await sharp(buf).extract({ left: L, top: T, width: W, height: H }).resize({ width: 1000 }).png().toFile(out);
console.log(`${file}  local x ${x0}..${x1}  y ${y0}..${y1}  step ${step}  (${ppl.toFixed(2)} px/local) -> ${out.split('/').pop()}`);
console.log('LOCAL +x is to the IMAGE LEFT on this face (dir = -1); the labels come from the mapping, not from an assumption.');
