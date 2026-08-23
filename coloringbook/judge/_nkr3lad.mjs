// BRIGHTNESS LADDERS ACROSS AND DOWN A BAND, in viewBox units.
//
// This is the instrument that works on all three references AND on our own
// render, because it never asks a threshold to decide what is device: it prints
// mean brightness along one axis over a band of the other and lets the courses,
// edges and shafts show up as maxima and minima, to be read by LOOKING. The
// proof and `nickel-rev-2.png` have OPPOSITE polarity (frosted-on-black vs
// bright-on-white) and both read fine here, which a threshold cannot claim.
//
// It is what the end-pavilion and terrace findings of v1.82.0 rest on, and both
// were taken as a DIFFERENCE OF TWO READINGS ON THE SAME PHOTOGRAPH, so the
// per-reference registration error cancels:
//
//   v 21 27 37 45   the wing roofline      40.90 / 39.95 / 40.40   drawn 40.80
//   v 14 17 38 50   the end pavilion roof  42.00 / 40.95 / 41.70   drawn 45.40
//                   step, per reference     1.10 /  1.00 /  1.30   drawn  4.60
//   h 58.2 59 8 13  terrace left edge      10.10 /  9.40 /  9.30   drawn 11.50
//   h 58.2 59 87 93 terrace right edge     91.00 / 91.70 / 90.60   drawn 88.50
//                   width                  80.90 / 82.30 / 81.30   drawn 77.00
//   (order: nickel-rev.jpg / nickel-rev-2.png / nickel-rev-proof.png)
//
// usage:
//   node coloringbook/judge/_nkr3lad.mjs h <file|ours> <y0> <y1> <x0> <x1>
//   node coloringbook/judge/_nkr3lad.mjs v <file|ours> <x0> <x1> <y0> <y1>
import { samplerFor, levels, bar } from './_nkrlib.mjs';

const axis = process.argv[2] === 'v' ? 'v' : 'h';
const file = process.argv[3] || 'nickel-rev-2.png';
const [a0, a1, b0, b1] = process.argv.slice(4, 8).map(Number);
if ([a0, a1, b0, b1].some((n) => !Number.isFinite(n))) {
  console.log('usage: _nkr3lad.mjs h <file|ours> <y0> <y1> <x0> <x1>   (ladder ACROSS x)');
  console.log('       _nkr3lad.mjs v <file|ours> <x0> <x1> <y0> <y1>   (ladder DOWN y)');
  process.exit(1);
}
const { at } = await samplerFor(file);
const L = levels(at);
const along = [], vals = [];
for (let t = b0; t <= b1; t += 0.05) {
  let s = 0, n = 0;
  for (let u = a0; u <= a1; u += 0.05) { s += axis === 'h' ? at(t, u) : at(u, t); n++; }
  along.push(t); vals.push(s / n);
}
// 0.25-unit smoothing: below that the frosting on the proof dominates
const sm = vals.map((_, i) => {
  let s = 0, n = 0;
  for (let k = -2; k <= 2; k++) if (i + k >= 0 && i + k < vals.length) { s += vals[i + k]; n++; }
  return s / n;
});
const lo = Math.min(...sm), hi = Math.max(...sm);
console.log(`# ${file}  ladder ${axis === 'h' ? 'ACROSS x' : 'DOWN y'} over the band ${a0}..${a1}`);
console.log(`# field ${L.field.toFixed(1)}  device ${L.device.toFixed(1)}  (device is ${L.up ? 'BRIGHTER' : 'DARKER'} than field here)`);
console.log(`# ladder min ${lo.toFixed(1)} max ${hi.toFixed(1)}`);
for (let i = 0; i < along.length; i += 2) {
  console.log(along[i].toFixed(2).padStart(7), sm[i].toFixed(1).padStart(7), bar(sm[i], lo, hi));
}
