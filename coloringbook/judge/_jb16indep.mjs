// BUCK r17 — R0e, REFERENCE INDEPENDENCE for the two note-reverse photographs.
//
// This face has the smallest pool in the project: two files. Two of the five
// pools reviewed in this sweep turned out to contain one photograph counted
// twice, so the pair has to be proved before either file is used.
// Registers both on their own printed border, resamples to one grid, and
// reports NCC on (a) raw grey and (b) blurred gradient energy — the descriptor
// the project's independence instruments use, because raw grey records
// lighting. CONTROL: each file against a re-encoded copy of ITSELF, which must
// come out near 1.0 or the test cannot say anything.
import sharp from 'sharp';
import { join } from 'node:path';
import { REF } from './_paths.mjs';
const BORDER = {
  'bill-rev.jpg':   { l: 43,  r: 1175, t: 44,  b: 474.5 },
  'bill-rev-2.jpg': { l: 225, r: 3681, t: 206, b: 1529 },
};
const W = 900, H = Math.round(900 / 2.62);
async function reg(file, jitter = 0) {
  const B = BORDER[file];
  const L = Math.round(B.l + jitter), T = Math.round(B.t + jitter);
  return (await sharp(join(REF, file))
    .extract({ left: L, top: T, width: Math.round(B.r - B.l), height: Math.round(B.b - B.t) })
    .greyscale().resize(W, H, { fit: 'fill' }).raw().toBuffer());
}
const ncc = (a, b) => {
  let ma = 0, mb = 0; const n = a.length;
  for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i]; } ma /= n; mb /= n;
  let sa = 0, sb = 0, s = 0;
  for (let i = 0; i < n; i++) { const u = a[i] - ma, v = b[i] - mb; sa += u * u; sb += v * v; s += u * v; }
  return s / Math.sqrt(sa * sb);
};
function energy(a, w, h, blur = 3) {
  const g = new Float64Array(w * h);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const gx = a[y * w + x + 1] - a[y * w + x - 1], gy = a[(y + 1) * w + x] - a[(y - 1) * w + x];
    g[y * w + x] = Math.hypot(gx, gy);
  }
  const k = blur, o = new Float64Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let s = 0, n = 0;
    for (let j = -k; j <= k; j++) for (let i = -k; i <= k; i++) {
      const yy = y + j, xx = x + i; if (yy < 0 || xx < 0 || yy >= h || xx >= w) continue; s += g[yy * w + xx]; n++; }
    o[y * w + x] = s / n; }
  return o;
}
const A = await reg('bill-rev.jpg'), B2 = await reg('bill-rev-2.jpg');
const Ac = await reg('bill-rev.jpg', 0), Bc = await reg('bill-rev-2.jpg', 0);
// control: the same photograph passed through a lossy re-encode
const rc = async (f) => { const B = BORDER[f];
  const buf = await sharp(join(REF, f)).extract({ left: Math.round(B.l), top: Math.round(B.t), width: Math.round(B.r - B.l), height: Math.round(B.b - B.t) }).jpeg({ quality: 70 }).toBuffer();
  return await sharp(buf).greyscale().resize(W, H, { fit: 'fill' }).raw().toBuffer(); };
const A2 = await rc('bill-rev.jpg'), B22 = await rc('bill-rev-2.jpg');
const eA = energy(A, W, H), eB = energy(B2, W, H), eA2 = energy(A2, W, H), eB22 = energy(B22, W, H);
console.log('CONTROL  same photograph, re-encoded:');
console.log('   bill-rev.jpg   vs itself    grey NCC', ncc(A, A2).toFixed(4), '  energy NCC', ncc(eA, eA2).toFixed(4));
console.log('   bill-rev-2.jpg vs itself    grey NCC', ncc(B2, B22).toFixed(4), '  energy NCC', ncc(eB, eB22).toFixed(4));
console.log('PAIR     the two files:');
console.log('   bill-rev vs bill-rev-2      grey NCC', ncc(A, B2).toFixed(4), '  energy NCC', ncc(eA, eB).toFixed(4));
