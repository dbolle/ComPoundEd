// BUCK obverse round — REGISTRATION. Self-contained (the `_bl*` helpers the
// r0 instruments import are gitignored and absent in a worktree).
//
// Fits, on EVERY bill photograph in the pool and in one column (R0e):
//   · the PAPER box   — the outer extent of the note against its surround
//   · the PRINTED BORDER — the outermost engraved rule inside the paper
// and prints the darkness of the line each border edge landed on, so
// "the fit landed on blank paper" is a readable fact rather than an assertion.
//
// NULL TEST: each edge search prints its bounds and flags a result ON a bound.
// SELECTION: the top-3 candidate rows/cols and the margin to the runner-up
// from a DIFFERENT position are printed.
// CONTROL: the two REVERSE files, whose border fit r0 published (2.5610 /
// 2.5827), are fitted by the same code — reproducing those is the equivalence.
// REPORTS ONLY; writes nothing into the repo.
import sharp from 'sharp';
import { join } from 'node:path';
import { REF } from './_paths.mjs';

export async function grey(f) {
  const im = sharp(join(REF, f));
  const { width: W, height: H } = await im.metadata();
  const d = await im.clone().greyscale().raw().toBuffer();
  return { d, W, H };
}
export function otsu(d) {
  const h = new Array(256).fill(0); for (const v of d) h[v]++;
  const tot = d.length; let sum = 0; for (let i = 0; i < 256; i++) sum += i * h[i];
  let sB = 0, wB = 0, best = 0, bv = -1;
  for (let t = 0; t < 256; t++) {
    wB += h[t]; if (!wB) continue; const wF = tot - wB; if (!wF) break;
    sB += t * h[t];
    const v = wB * wF * ((sB / wB) - ((sum - sB) / wF)) ** 2;
    if (v > bv) { bv = v; best = t; }
  }
  return best;
}
export async function fit(f, verbose = false) {
  const { d, W, H } = await grey(f);
  const t = otsu(d);
  const rowFrac = [], colFrac = [];
  for (let y = 0; y < H; y++) { let c = 0; for (let x = 0; x < W; x++) if (d[y * W + x] > t) c++; rowFrac.push(c / W); }
  for (let x = 0; x < W; x++) { let c = 0; for (let y = 0; y < H; y++) if (d[y * W + x] > t) c++; colFrac.push(c / H); }
  const span = (a, thr) => { let i = 0, j = a.length - 1; while (i < a.length && a[i] < thr) i++; while (j > i && a[j] < thr) j--; return [i, j]; };
  const [py0, py1] = span(rowFrac, 0.5), [px0, px1] = span(colFrac, 0.5);
  const meanRow = (y, x0, x1) => { let s = 0; for (let x = x0; x <= x1; x++) s += d[y * W + x]; return s / (x1 - x0 + 1); };
  const meanCol = (x, y0, y1) => { let s = 0; for (let y = y0; y <= y1; y++) s += d[y * W + x]; return s / (y1 - y0 + 1); };
  const pw = px1 - px0, ph = py1 - py0;
  const ix0 = px0 + Math.round(0.25 * pw), ix1 = px1 - Math.round(0.25 * pw);
  const iy0 = py0 + Math.round(0.25 * ph), iy1 = py1 - Math.round(0.25 * ph);
  const seaY = Math.round(0.14 * ph), seaX = Math.round(0.14 * pw);
  const scan = (lo, hi, fn) => { const c = []; for (let i = lo; i <= hi; i++) c.push({ i, v: fn(i) }); c.sort((a, b) => a.v - b.v); return { lo, hi, c }; };
  const edges = {
    T: scan(py0, py0 + seaY, (y) => meanRow(y, ix0, ix1)),
    B: scan(py1 - seaY, py1, (y) => meanRow(y, ix0, ix1)),
    L: scan(px0, px0 + seaX, (x) => meanCol(x, iy0, iy1)),
    R: scan(px1 - seaX, px1, (x) => meanCol(x, iy0, iy1)),
  };
  const pick = {}; const flags = [];
  for (const [k, e] of Object.entries(edges)) {
    const best = e.c[0];
    const alt = e.c.find((q) => Math.abs(q.i - best.i) > 0.02 * (k === 'T' || k === 'B' ? ph : pw));
    pick[k] = best.i;
    if (best.i === e.lo || best.i === e.hi) flags.push(`${k}=ON-BOUND(${best.i} in [${e.lo},${e.hi}])`);
    if (verbose) console.log(`    ${k}: best ${best.i} grey ${best.v.toFixed(1)} | bounds [${e.lo},${e.hi}] | next-different ${alt ? `${alt.i} grey ${alt.v.toFixed(1)} (margin ${(alt.v - best.v).toFixed(2)})` : 'none'}`);
    pick[k + 'grey'] = best.v; pick[k + 'margin'] = alt ? alt.v - best.v : NaN;
  }
  const paperGrey = (() => { // median grey of the paper interior, for contrast context
    const s = []; for (let y = iy0; y <= iy1; y += 7) for (let x = ix0; x <= ix1; x += 7) s.push(d[y * W + x]);
    s.sort((a, b) => a - b); return s[Math.floor(s.length * 0.9)];
  })();
  return { f, W, H, otsu: t, paper: [px0, py0, px1, py1], paperRatio: pw / ph,
    border: [pick.L, pick.T, pick.R, pick.B], borderRatio: (pick.R - pick.L) / (pick.B - pick.T),
    grey: [pick.Lgrey, pick.Tgrey, pick.Rgrey, pick.Bgrey], margin: [pick.Lmargin, pick.Tmargin, pick.Rmargin, pick.Bmargin],
    paperP90: paperGrey, flags,
    marginPctX: 100 * ((pick.L - px0) + (px1 - pick.R)) / 2 / pw,
    marginPctY: 100 * ((pick.T - py0) + (py1 - pick.B)) / 2 / ph };
}
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  console.log('paper box, printed border, and the GREY OF THE LINE EACH BORDER EDGE LANDED ON.');
  console.log('A fit that "lands on blank paper" has an edge grey near the paper p90.\n');
  for (const f of ['bill-rev.jpg', 'bill-rev-2.jpg', 'bill-obv.jpg', 'bill-obv-2.jpg']) {
    console.log(f + (f.includes('rev') ? '   [CONTROL — r0 published border ratio 2.5610 / 2.5827]' : '   [SUBJECT]'));
    const r = await fit(f, true);
    console.log(`    paper  ${r.paper.join(',')}  ratio ${r.paperRatio.toFixed(4)}`);
    console.log(`    border ${r.border.join(',')}  ratio ${r.borderRatio.toFixed(4)}   margin% X ${r.marginPctX.toFixed(2)} Y ${r.marginPctY.toFixed(2)}`);
    console.log(`    edge greys L,T,R,B ${r.grey.map((g) => g.toFixed(0)).join(',')}   paper p90 ${r.paperP90}   ${r.flags.length ? 'FLAGS ' + r.flags.join(' ') : 'no bound hits'}\n`);
  }
}
