// _jn6same — are two nickel obverse references actually two photographs?
//
// §8: "two files can be the same photograph (the dime's were, NCC 0.9931)".
// The brief calls `nickel-obv-unc2004.jpg` a NEW reference and the best in the
// set; it looks to the eye exactly like `nickel-obv.jpg`. This decides it
// before anything is frozen from it, because a D3 target derived from a second
// copy of the reference we already use is not a second opinion.
//
// Method: reduce both to a common 256x256 greyscale, mean-subtract, and take
// the normalised cross-correlation. NCC is scale/exposure invariant, which is
// what makes it the right test for "same photograph, different encode".
//
// RESPONSE TEST: the same coin's REVERSE and a horizontally flipped copy of
// the obverse are scored too. If those come back near 1.0 the instrument is
// measuring nothing and no number here may be used.
// NULL TEST: NCC is bounded [-1,1]; a result of exactly 1.0000 would be the
// bound and is reported as "byte-identical after resample", not as a value.
import sharp from 'sharp';

const N = 256;
const load = async (f) => {
  const { data } = await sharp(`coloringbook/ref/${f}`)
    .resize(N, N, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  return Float64Array.from(data);
};
const flip = async (f) => {
  const { data } = await sharp(`coloringbook/ref/${f}`).flop()
    .resize(N, N, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  return Float64Array.from(data);
};
const ncc = (a, b) => {
  const ma = a.reduce((x, y) => x + y, 0) / a.length, mb = b.reduce((x, y) => x + y, 0) / b.length;
  let n = 0, da = 0, db = 0;
  for (let i = 0; i < a.length; i++) { const u = a[i] - ma, v = b[i] - mb; n += u * v; da += u * u; db += v * v; }
  return n / Math.sqrt(da * db);
};

const A = await load('nickel-obv.jpg');
const rows = [
  ['nickel-obv.jpg  vs  nickel-obv-unc2004.jpg', await load('nickel-obv-unc2004.jpg')],
  ['nickel-obv.jpg  vs  nickel-obv-5.JPG', await load('nickel-obv-5.JPG')],
  ['nickel-obv.jpg  vs  nickel-obv-3.png', await load('nickel-obv-3.png')],
  ['nickel-obv.jpg  vs  nickel-obv-4.jpg', await load('nickel-obv-4.jpg')],
  ['RESPONSE: obv vs nickel-rev.jpg (must be low)', await load('nickel-rev.jpg')],
  ['RESPONSE: obv vs its own MIRROR (must be low)', await flip('nickel-obv.jpg')],
  ['CONTROL: obv vs itself (must be exactly 1)', A],
];
console.log(`### _jn6same — NCC at ${N}x${N} greyscale, exposure-invariant. bounds [-1, 1].`);
for (const [label, B] of rows) {
  const v = ncc(A, B);
  console.log(`${label.padEnd(48)} ${v.toFixed(4)}${Math.abs(v - 1) < 1e-9 ? '   <-- at the bound' : ''}`);
}
