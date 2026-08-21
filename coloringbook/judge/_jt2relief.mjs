// SPECIALIST INSTRUMENT — round 2, D13, dime reverse. WHERE THE COIN PUTS ITS
// RELIEF, measured off the photograph rather than eyeballed off a grid.
//
// The brief's starting hypothesis is that our torch and branches "occupy the
// middle half of a field the coin fills", and it asks for that to be TESTED
// against the reference's own element extents rather than assumed. The D13
// instruments cannot answer it: their ink test is `grey < 0.85 x p90`, an
// ABSOLUTE level, and on `dime-rev-2.jpg` the whole coin is lit from the upper
// left, so their ink map is as much a map of the lighting as of the device.
//
// Relief is a LOCAL property: a struck mark has a bright side and a dark side a
// unit or two apart, and bare field has neither. So this measures
//
//     relief(X,Y) = | g(X,Y) - blur(g, 3 units)(X,Y) |
//
// and calls a pixel "device" where that exceeds T. A lighting gradient is
// smooth on a 3-unit scale and cancels; a leaf edge does not.
//
// LOCUS, frozen literal, target-derived (§6.1): the legend-free region of THIS
// coin, r < 34.20 (the inner edge of UNITED STATES OF AMERICA, read off this
// same photograph in round 1 and now a literal in `REV_TEXT.dime`) and
// Y <= 62.0 (1.6 units clear of E PLURIBUS UNUM's cap top at 63.6, same round).
// Nothing here is computed from our drawing.
//
// §4.1 NULL: T is swept over a declared ladder and every answer is printed. The
//   extents are reported against the locus edge, and an extent that lands ON
//   the locus edge is a failure report, not a value.
// §4.2 SELECTION: it selects no candidate. Every threshold's whole answer is
//   printed, and the reported extents are the ones stable across the sweep.
// §4 RESPONSE: RESPONSE=1 re-runs on the reference blurred by 2 extra units.
//   A relief detector must lose most of its coverage; a brightness detector
//   would not.
// §4.3 OVERLAY: PNG=1 draws the mask on the source and it is looked at.
//
//   node coloringbook/judge/_jt2relief.mjs [T]
import sharp from 'sharp';
import { grey, at, DISCS, XY2px } from '../_rvnorm.mjs';

const REF = 'dime-rev-2.jpg';
const N = 700;                       // grid over the whole 100-unit viewBox
const BLUR_UNITS = 3.0;              // the scale a struck mark's light/dark pair lives on
const LOCUS = { r: 34.20, y1: 62.0 };
const TLADDER = [4, 6, 8, 10, 12, 14];
const PRE = +(process.env.PREBLUR || 0);

const D = DISCS[REF];
const g = await grey(REF);
// viewBox -> photograph, through the judge's own frozen disc fit.
const src = new Float64Array(N * N);
for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
  const X = 100 * (i + 0.5) / N, Y = 100 * (j + 0.5) / N;
  const [px, py] = XY2px(D, X, Y);
  src[j * N + i] = at(g, px, py);
}
const u = N / 100;                                    // grid px per viewBox unit
function boxBlur(a, rad) {                            // separable, rad in grid px
  const t = new Float64Array(N * N), o = new Float64Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    let s = 0, c = 0;
    for (let k = -rad; k <= rad; k++) { const q = i + k; if (q >= 0 && q < N) { s += a[j * N + q]; c++; } }
    t[j * N + i] = s / c;
  }
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    let s = 0, c = 0;
    for (let k = -rad; k <= rad; k++) { const q = j + k; if (q >= 0 && q < N) { s += t[q * N + i]; c++; } }
    o[j * N + i] = s / c;
  }
  return o;
}
const base = PRE ? boxBlur(src, Math.round(PRE * u)) : src;
const bl = boxBlur(base, Math.round(BLUR_UNITS * u));
const rel = new Float64Array(N * N);
for (let p = 0; p < N * N; p++) rel[p] = Math.abs(base[p] - bl[p]);

const inLocus = (X, Y) => (X - 50) ** 2 + (Y - 50) ** 2 < LOCUS.r ** 2 && Y <= LOCUS.y1;

console.log(`\n=== _jt2relief  ${REF}${PRE ? `  PRE-BLURRED ${PRE} units` : ''} ===`);
console.log(`relief = |g - boxblur(${BLUR_UNITS} units)| on a ${N}x${N} viewBox grid through the frozen disc fit ` +
  `cx ${D.cx} cy ${D.cy} R ${D.R}`);
console.log(`locus: r < ${LOCUS.r} and Y <= ${LOCUS.y1}  (legend-free on this coin; both bounds are round 1 readings of this photograph)`);
console.log('\n  T   coverage   X extent (locus edge 15.8..84.2)   Y extent (19.4..62.0)   left-lobe X   right-lobe X');
const rows = [];
for (const T of TLADDER) {
  let n = 0, k = 0, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  let lx0 = 1e9, lx1 = -1e9, rx0 = 1e9, rx1 = -1e9;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const X = 100 * (i + 0.5) / N, Y = 100 * (j + 0.5) / N;
    if (!inLocus(X, Y)) continue;
    n++;
    if (rel[j * N + i] <= T) continue;
    k++;
    x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y);
    // the two branch lobes, split at the torch's own authored half-width so the
    // split is a stated literal and not a minimum found in the data
    if (X < 44) { lx0 = Math.min(lx0, X); lx1 = Math.max(lx1, X); }
    if (X > 56) { rx0 = Math.min(rx0, X); rx1 = Math.max(rx1, X); }
  }
  const f = (v) => v.toFixed(1).padStart(5);
  rows.push({ T, cov: k / n, x0, x1, y0, y1, lx0, lx1, rx0, rx1 });
  console.log(` ${String(T).padStart(3)}   ${(k / n).toFixed(3)}      ${f(x0)} ..${f(x1)}${x0 <= 15.9 || x1 >= 84.1 ? '  AT BOUND' : '         '}` +
    `   ${f(y0)} ..${f(y1)}${y1 >= 61.9 ? ' AT BOUND' : '         '}   ${f(lx0)} ..${f(lx1)}   ${f(rx0)} ..${f(rx1)}`);
}
console.log('\nOURS, the same extents read straight off the authored geometry (no photograph involved):');
console.log('  icon  olive leaves+stem  X 23.7 .. 37.0     oak  X 63.0 .. 76.3     flame/shaft/foot  Y 20.0 .. 78.4');
console.log('  full  olive leaves+stem  X 24.9 .. 37.0     oak  X 63.0 .. 75.1');

if (process.env.RESPONSE) {
  console.log('\nRESPONSE: re-run with PREBLUR=2 — a relief detector must lose most of its coverage.');
}
if (process.env.PNG) {
  const T = +(process.argv[2] || 8);
  const S = 1000, out = Buffer.alloc(S * S * 3);
  for (let J = 0; J < S; J++) for (let I = 0; I < S; I++) {
    const i = Math.min(N - 1, ((I / S) * N) | 0), j = Math.min(N - 1, ((J / S) * N) | 0);
    const X = 100 * (i + 0.5) / N, Y = 100 * (j + 0.5) / N;
    const v = base[j * N + i], hit = inLocus(X, Y) && rel[j * N + i] > T;
    const o = 3 * (J * S + I);
    out[o] = hit ? 255 : v; out[o + 1] = hit ? (v * 0.4) | 0 : v; out[o + 2] = hit ? (v * 0.4) | 0 : v;
  }
  const k = S / 100;
  const ov = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">`
    + `<circle cx="${50 * k}" cy="${50 * k}" r="${LOCUS.r * k}" fill="none" stroke="#00c8ff" stroke-width="2"/>`
    + `<line x1="0" y1="${LOCUS.y1 * k}" x2="${S}" y2="${LOCUS.y1 * k}" stroke="#00c8ff" stroke-width="2"/>`
    + [20, 25, 30, 35, 40, 45, 55, 60, 65, 70, 75, 80].map((X) =>
      `<line x1="${X * k}" y1="${16 * k}" x2="${X * k}" y2="${64 * k}" stroke="#ffe000" stroke-width="${X % 10 ? 0.7 : 1.6}" opacity="0.7"/>`
      + `<text x="${X * k + 2}" y="${18 * k}" font-family="monospace" font-size="14" fill="#ffe000">${X}</text>`).join('')
    + `<text x="6" y="18" font-family="monospace" font-size="16" fill="#00c8ff">relief mask T=${T}${PRE ? ` PREBLUR=${PRE}` : ''}</text></svg>`;
  const f = new URL(`./_jt2relief-T${T}${PRE ? `-pre${PRE}` : ''}.png`, import.meta.url).pathname;
  await sharp(out, { raw: { width: S, height: S, channels: 3 } })
    .composite([{ input: Buffer.from(ov) }]).png().toFile(f);
  console.log('wrote ' + f);
}
