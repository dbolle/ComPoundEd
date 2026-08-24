// QUARTER OBVERSE WIG — the band-passed orientation machinery, as a library.
//
// `_qo5field.mjs` established this pipeline and its four null tests, and it is
// left byte-identical because it is the published record of the round-11
// measurement. This file is the same arithmetic, factored so that more than one
// instrument can call it — and `_qw1field.mjs` asserts that it reproduces
// `_qo5field.mjs`'s fourteen published numbers before it reports anything, so a
// divergence between the two is a test failure rather than a silent second
// opinion.
//
// ⚠️ NOTHING HERE HOLDS A COPY OF THE SUBJECT. Every geometry number comes from
// `_qo4marks.mjs`, which reads the live render. Nothing here writes.
//
// CONVENTION: screen frame, 0 = +x (right), positive = DOWN, modulo 180.
import { STRUCK, disc, grey, atVB, ours, atVBours } from './_qo1zoom.mjs';

export const D2R = Math.PI / 180;
export const X0 = 38, Y0 = 10, X1 = 86, Y1 = 62, PPU = 10;   // _qo5field's window
export const W = (X1 - X0) * PPU, H = (Y1 - Y0) * PPU;
export const gx = (i) => X0 + (i + 0.5) / PPU, gy = (j) => Y0 + (j + 0.5) / PPU;
export const SIG_HI = 0.30, SIG_LO = 2.2;                    // the strand band

/** the head group transform, read from the live render by _qo4marks */
export { TX, TY, SX, SY, toView } from './_qo4marks.mjs';

export function gauss(src, sigmaUnits, w = W, h = H) {
  const s = sigmaUnits * PPU;
  const r = Math.max(1, Math.ceil(3 * s));
  const k = []; let sum = 0;
  for (let t = -r; t <= r; t++) { const v = Math.exp(-t * t / (2 * s * s)); k.push(v); sum += v; }
  for (let t = 0; t < k.length; t++) k[t] /= sum;
  const tmp = new Float64Array(w * h), out = new Float64Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    let a = 0; for (let t = -r; t <= r; t++) a += k[t + r] * src[j * w + Math.max(0, Math.min(w - 1, i + t))];
    tmp[j * w + i] = a;
  }
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    let a = 0; for (let t = -r; t <= r; t++) a += k[t + r] * tmp[Math.max(0, Math.min(h - 1, j + t)) * w + i];
    out[j * w + i] = a;
  }
  return out;
}

export function bandpass(src) {
  const lo = gauss(src, SIG_LO), hi = gauss(src, SIG_HI);
  const out = new Float64Array(W * H);
  for (let p = 0; p < W * H; p++) out[p] = hi[p] - lo[p];
  return out;
}

/** structure tensor at viewBox (X,Y) with a Gaussian window of sigma `sw` units */
export function tensorAt(band, X, Y, sw = 2.0) {
  const ci = (X - X0) * PPU - 0.5, cj = (Y - Y0) * PPU - 0.5;
  const r = Math.ceil(2.5 * sw * PPU);
  let Jxx = 0, Jxy = 0, Jyy = 0;
  for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) {
    const i = Math.round(ci + di), j = Math.round(cj + dj);
    if (i < 1 || j < 1 || i >= W - 1 || j >= H - 1) continue;
    const w = Math.exp(-(di * di + dj * dj) / (2 * (sw * PPU) ** 2));
    const Ix = (band[j * W + i + 1] - band[j * W + i - 1]) / 2;
    const Iy = (band[(j + 1) * W + i] - band[(j - 1) * W + i]) / 2;
    Jxx += w * Ix * Ix; Jxy += w * Ix * Iy; Jyy += w * Iy * Iy;
  }
  const tr = Jxx + Jyy, det = Jxx * Jyy - Jxy * Jxy;
  const d = Math.sqrt(Math.max(0, tr * tr / 4 - det));
  let s = 0.5 * Math.atan2(2 * Jxy, Jxx - Jyy) / D2R + 90;
  while (s > 90) s -= 180; while (s <= -90) s += 180;
  return { deg: +s.toFixed(1), coh: +(tr > 0 ? d * 2 / tr : 0).toFixed(3) };
}

export const build = (sample) => {
  const a = new Float64Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) a[j * W + i] = sample(gx(i), gy(j));
  return a;
};

/** signed smallest difference between two mod-180 angles, in degrees */
export const dev = (a, b) => (((a - b + 90) % 180 + 180) % 180) - 90;

/** circular (double-angle) mean of a list of mod-180 angles */
export function cmean(list, wts) {
  let sx = 0, sy = 0;
  list.forEach((a, i) => { const w = wts ? wts[i] : 1; sx += w * Math.cos(2 * a * D2R); sy += w * Math.sin(2 * a * D2R); });
  return { deg: 0.5 * Math.atan2(sy, sx) / D2R, r: Math.hypot(sx, sy) };
}

/** band-passed grids for the three allowed struck references, keyed by filename */
export async function referenceBands() {
  const B = {};
  for (const f of STRUCK) {
    const d = await disc(f), g = await grey(f);
    B[f] = bandpass(build((X, Y) => atVB(g, d, X, Y)));
  }
  return B;
}

/** band-passed grid of our own live render */
export async function ourBand(size = 2000) {
  const o = await ours(size);
  return bandpass(build((X, Y) => atVBours(o, X, Y)));
}

export { STRUCK, disc, grey, atVB, ours, atVBours };
