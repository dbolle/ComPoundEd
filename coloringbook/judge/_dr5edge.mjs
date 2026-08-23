// DIME REVERSE — round 1. EDGE LADDER on the torch.
//
// Reports only (WRITERS.md).
//
// WHAT IT MEASURES. The torch is the one mark on this face that has to read at
// 38 px, and `torch()` draws its shaft as `<rect width="9.4">` — dead
// parallel-sided over 31 units. This walks a ladder of horizontal scanlines
// across the shaft on every reference and reports the LEFT and RIGHT boundary
// at each, so the taper (or the absence of one) is a number rather than an
// impression.
//
// SEGMENTATION, and why it is a GRADIENT and not a threshold. The three
// independent reverse photographs light the relief three different ways:
// `dime-rev-unc2005.png` is near line-art (white device, white field, dark
// outline), `dime-rev-proofbright.png` is a frosted device on a bright field,
// and `dime-rev-2.jpg` is lit from the upper left so the torch's LEFT edge is
// a bright highlight and its RIGHT edge a dark shadow. No single threshold
// survives all three; the one thing they share is that a relief boundary is
// where the grey changes fastest. The estimator is the |d/dx| maximum inside a
// stated search window, refined to sub-unit by a parabola through the peak.
//
// RATIOS ARE PREFERRED TO ABSOLUTES. Two features measured on ONE photograph
// cancel that photograph's registration error and its bevel skirt; the width
// ladder below is reported both absolutely and as a fraction of the same
// file's own head width.
//
// ⚠️ THIS INSTRUMENT IS WRONG ON THIS FACE AND IS KEPT AS THE RECORD OF WHY
// (COIN-JUDGE §1.1, retract beside). Its search windows are FIXED, and on the
// dime reverse the olive leaf crosses the shaft at y 48..56 and the caps of
// E PLURIBUS UNUM sit against it at y 63..67, so the window's strongest
// gradient is a leaf or a letter rather than the shaft. Run as authored it
// reports a 14.33-unit "shaft" at y 66 on `dime-rev-2.jpg`, a taper of +20.5%
// where the coin's is -31%, and one row where the left edge lands at
// x = 88617170517.85 because the parabola refinement divides by a flat peak.
// `judge/_dr8shaft.mjs` replaces it: it seeds where every reference is clear
// and TRACKS each edge row by row inside a +-0.8 unit gate.
//
// Run: node coloringbook/judge/_dr5edge.mjs
import { POOL } from './_dr1disc.mjs';
import { samplerFor } from './_dr2grid.mjs';

const STEP = 0.02;

/** smoothed grey along a row */
function row(at, y, x0, x1) {
  const n = Math.round((x1 - x0) / STEP) + 1, v = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    // average three sub-rows so a single scratch cannot make an edge
    const X = x0 + i * STEP;
    v[i] = (at(X, y - 0.12) + at(X, y) + at(X, y + 0.12)) / 3;
  }
  // box blur, half-width 0.12 units
  const k = Math.max(1, Math.round(0.12 / STEP));
  const s = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let a = 0, c = 0;
    for (let j = -k; j <= k; j++) { const t = i + j; if (t >= 0 && t < n) { a += v[t]; c++; } }
    s[i] = a / c;
  }
  return s;
}

/** the |d/dx| maximum inside [a,b] of a row starting at x0, parabola-refined */
export function edge(s, x0, a, b) {
  const ia = Math.round((a - x0) / STEP), ib = Math.round((b - x0) / STEP);
  let best = -1, bi = -1;
  for (let i = Math.max(1, ia); i <= Math.min(s.length - 2, ib); i++) {
    const g = Math.abs(s[i + 1] - s[i - 1]);
    if (g > best) { best = g; bi = i; }
  }
  if (bi < 1) return { x: NaN, g: 0 };
  const gm = (i) => Math.abs(s[i + 1] - s[i - 1]);
  const y0 = gm(bi - 1), y1 = gm(bi), y2 = gm(bi + 1);
  const d = y0 - 2 * y1 + y2;
  const off = d === 0 ? 0 : (0.5 * (y0 - y2)) / d;
  return { x: x0 + (bi + off) * STEP, g: best / STEP };
}

export async function ladder(file, rows, win) {
  const s = await samplerFor(file);
  const out = [];
  for (const y of rows) {
    const r = row(s.at, y, win[0], win[3]);
    const L = edge(r, win[0], win[0], win[1]);
    const R = edge(r, win[0], win[2], win[3]);
    out.push({ y, L: L.x, R: R.x, w: R.x - L.x, c: (R.x + L.x) / 2, gL: L.g, gR: R.g });
  }
  return out;
}

if (process.argv[1] && process.argv[1].endsWith('_dr5edge.mjs')) {
  // rows chosen CLEAR OF THE FOLIAGE on all three independent references:
  // the leaves cross the shaft at y 44..54 on the left and y 41..50 on the
  // right, so those rows are excluded and said so rather than averaged in.
  const ROWS = [34, 36, 38, 40, 42, 56, 58, 60, 62, 64, 66, 68];
  const FILES = ['dime-rev-2.jpg', 'dime-rev-proofbright.png', 'dime-rev-unc2005.png', 'ours'];
  const res = {};
  for (const f of FILES) res[f] = await ladder(f, ROWS, [42.5, 49, 51, 58]);
  console.log('TORCH SHAFT WIDTH LADDER — viewBox units, |d/dx| edges\n');
  console.log('  y  ' + FILES.map((f) => f.slice(0, 14).padStart(21)).join(''));
  for (let i = 0; i < ROWS.length; i++) {
    let line = String(ROWS[i]).padStart(4) + ' ';
    for (const f of FILES) {
      const r = res[f][i];
      line += `${r.L.toFixed(2)}..${r.R.toFixed(2)} w${r.w.toFixed(2)}`.padStart(21);
    }
    console.log(line);
  }
  console.log('\nTAPER — width at y 66 minus width at y 38, and the axis drift:');
  for (const f of FILES) {
    const a = res[f].find((r) => r.y === 38), b = res[f].find((r) => r.y === 66);
    console.log(`  ${f.padEnd(26)} w38 ${a.w.toFixed(2)}  w66 ${b.w.toFixed(2)}  ` +
      `dw ${(b.w - a.w).toFixed(2)} (${(((b.w - a.w) / a.w) * 100).toFixed(1)}%)  ` +
      `centre ${a.c.toFixed(2)} -> ${b.c.toFixed(2)}`);
  }
}
