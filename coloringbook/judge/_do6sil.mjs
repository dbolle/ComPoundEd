// THE SILHOUETTE, LADDERED AGAINST NINE PHOTOGRAPHS — D1 re-derived on the
// whole pool instead of on the one file HEAD.Roosevelt was traced from.
//
// `HEAD.Roosevelt` was fitted to a mask segmented from dime-obv-2.jpg and
// scores IoU 0.981 against THAT mask. That is one photograph. The comment
// beside it says the outline is "the DESIGN and not one strike" but no second
// file has ever been put against it, and the nickel's round 3 showed what that
// costs: its device read 4% larger against one reference than against another,
// which is larger than the correction that round was considering.
//
// METHOD.
//   1. The bust is the connected component containing the cheek (`_do5reg.mjs`),
//      at the file's own device/field threshold, inside r <= 38.
//   2. Our own bust is extracted the SAME WAY off a 1600px render, so the
//      contour stroke is included on both sides and nothing is compared against
//      an idealised path.
//   3. A SIMILARITY with rotation (k, theta, t) is fitted by ICP, ours onto the
//      reference. Rotation is a free parameter because a photographed coin's
//      die axis is not the crop's axis and the disc fit does not pin it; the
//      fitted angle is reported, and an angle that is not small is a warning
//      about the file, not a licence to use it.
//   4. Residuals are reported SIGNED along the outward normal, binned by the
//      part of the head they fall on, so "the crown is high" and "the back is
//      deep" are separate numbers rather than one RMS.
//
// A NULL TEST RUNS FIRST: our own render is fitted to ITSELF at a different
// raster size. If that does not come back at |mean| < 0.1 local units the
// instrument is not measuring the art.
//
// usage: node coloringbook/judge/_do6sil.mjs
import { join } from 'node:path';
import { ROOT } from './_paths.mjs';
import { POOL, samplerFor, samplerOurs } from './_dolib.mjs';
import { landmarks } from './_do5reg.mjs';

const RMASK = 38, STEP = 0.1;

/** bust boundary points, in the sampler's own viewBox units */
export function boundary(s) {
  const L = landmarks(s, { step: STEP });
  if (!L.crown) return null;
  // rebuild the component mask (landmarks does not return it)
  const N = Math.round((2 * RMASK) / STEP), ix = (i) => 50 - RMASK + i * STEP;
  const T = (L.field + L.device) / 2, up = L.up;
  const grid = new Uint8Array(N * N);
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x = ix(i), y = ix(j);
    if (Math.hypot(x - 50, y - 50) > RMASK) continue;
    const q = s.at(x, y);
    if (q == null) continue;
    if (up ? q > T : q < T) grid[j * N + i] = 1;
  }
  const seedI = Math.round(RMASK / STEP), seedJ = Math.round((RMASK - 3) / STEP);
  const comp = new Uint8Array(N * N);
  if (!grid[seedJ * N + seedI]) return null;
  const st = [seedJ * N + seedI]; comp[seedJ * N + seedI] = 1;
  while (st.length) {
    const p = st.pop(), i = p % N, j = (p / N) | 0;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const a = i + di, b = j + dj;
      if (a < 0 || b < 0 || a >= N || b >= N) continue;
      const q = b * N + a;
      if (grid[q] && !comp[q]) { comp[q] = 1; st.push(q); }
    }
  }
  const pts = [];
  for (let j = 1; j < N - 1; j++) for (let i = 1; i < N - 1; i++) {
    if (!comp[j * N + i]) continue;
    if (comp[j * N + i - 1] && comp[j * N + i + 1] && comp[(j - 1) * N + i] && comp[(j + 1) * N + i]) continue;
    pts.push([ix(i), ix(j)]);
  }
  return { pts, L };
}

/** ICP: fit (k, theta, t) taking A onto B. */
export function icp(A, B, iters = 60) {
  // start from centroid + rms radius
  const cen = (P) => { let x = 0, y = 0; for (const p of P) { x += p[0]; y += p[1]; } return [x / P.length, y / P.length]; };
  const rad = (P, c) => Math.sqrt(P.reduce((a, p) => a + (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2, 0) / P.length);
  const ca = cen(A), cb = cen(B);
  let k = rad(B, cb) / rad(A, ca), th = 0;
  let t = [cb[0] - k * (Math.cos(th) * ca[0] - Math.sin(th) * ca[1]), cb[1] - k * (Math.sin(th) * ca[0] + Math.cos(th) * ca[1])];
  const grid = new Map();
  const G = 0.5;
  for (const p of B) {
    const key = `${Math.round(p[0] / G)},${Math.round(p[1] / G)}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(p);
  }
  const nearest = (p) => {
    let best = null, bd = Infinity;
    const gi = Math.round(p[0] / G), gj = Math.round(p[1] / G);
    for (let r = 0; r < 8 && !best; r++) {
      for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) {
        if (Math.max(Math.abs(a), Math.abs(b)) !== r) continue;
        const c = grid.get(`${gi + a},${gj + b}`);
        if (!c) continue;
        for (const q of c) { const d = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2; if (d < bd) { bd = d; best = q; } }
      }
      if (best && r >= 2) break;
    }
    return best;
  };
  let pairs = [];
  for (let it = 0; it < iters; it++) {
    pairs = [];
    for (const p of A) {
      const x = k * (Math.cos(th) * p[0] - Math.sin(th) * p[1]) + t[0];
      const y = k * (Math.sin(th) * p[0] + Math.cos(th) * p[1]) + t[1];
      const q = nearest([x, y]);
      if (q) pairs.push([p, q]);
    }
    if (pairs.length < 32) break;
    // closed-form similarity from correspondences
    let mx = 0, my = 0, nx = 0, ny = 0;
    for (const [p, q] of pairs) { mx += p[0]; my += p[1]; nx += q[0]; ny += q[1]; }
    mx /= pairs.length; my /= pairs.length; nx /= pairs.length; ny /= pairs.length;
    let sxy = 0, sxx = 0, num1 = 0, num2 = 0;
    for (const [p, q] of pairs) {
      const ax = p[0] - mx, ay = p[1] - my, bx = q[0] - nx, by = q[1] - ny;
      num1 += ax * bx + ay * by; num2 += ax * by - ay * bx; sxx += ax * ax + ay * ay;
    }
    th = Math.atan2(num2, num1);
    k = Math.hypot(num1, num2) / sxx;
    t = [nx - k * (Math.cos(th) * mx - Math.sin(th) * my), ny - k * (Math.sin(th) * mx + Math.cos(th) * my)];
  }
  return { k, th, t, pairs };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  // ── our own bust, and the null test ──────────────────────────────────────
  const ourB = boundary(await samplerOurs('dime', 'obverse', 1600));
  const ourB2 = boundary(await samplerOurs('dime', 'obverse', 900));
  {
    const f = icp(ourB.pts, ourB2.pts);
    const d = f.pairs.map(([p, q]) => Math.hypot(
      f.k * (Math.cos(f.th) * p[0] - Math.sin(f.th) * p[1]) + f.t[0] - q[0],
      f.k * (Math.sin(f.th) * p[0] + Math.cos(f.th) * p[1]) + f.t[1] - q[1]));
    const mean = d.reduce((a, b) => a + b, 0) / d.length;
    console.log(`NULL TEST  ours@1600 onto ours@900:  k ${f.k.toFixed(4)}  theta ${((f.th * 180) / Math.PI).toFixed(2)} deg  mean |d| ${mean.toFixed(3)} viewBox units`);
    if (mean > 0.2) console.log('  *** the instrument does not reproduce its own art; nothing below is evidence');
  }

  // ── the pool ─────────────────────────────────────────────────────────────
  // Regions in OUR viewBox, by angle about the bust centroid, so a residual can
  // be attributed. 0 deg is +x (behind the head), 180 is -x (the face).
  const REGIONS = [
    ['crown      ', 250, 300],
    ['back-upper ', 300, 350],
    ['back-lower ', 350, 30],
    ['truncation ', 30, 130],
    ['jaw/throat ', 130, 160],
    ['face       ', 160, 250],
  ];
  const inReg = (a, lo, hi) => (lo < hi ? a >= lo && a < hi : a >= lo || a < hi);

  console.log('\nSIGNED RADIAL RESIDUAL, ours minus the photograph, in OUR local head units.');
  console.log('  positive = our silhouette is OUTSIDE the coin\'s there.');
  console.log('  file                       k     theta   n     crown  back-up  back-lo  trunc   jaw    face    mean|d|');
  const { OBVERSE } = await import(join(ROOT, 'src/art/coins.js'));
  const S = OBVERSE.dime.s;
  const rows = [];
  for (const f of POOL) {
    const s = await samplerFor(f);
    const B = boundary(s);
    if (!B) { console.log('  ', f.padEnd(26), 'NO COMPONENT'); continue; }
    const fit = icp(ourB.pts, B.pts);
    // centroid of the mapped ours, for the angle bins
    let mx = 0, my = 0;
    const mapped = ourB.pts.map((p) => [
      fit.k * (Math.cos(fit.th) * p[0] - Math.sin(fit.th) * p[1]) + fit.t[0],
      fit.k * (Math.sin(fit.th) * p[0] + Math.cos(fit.th) * p[1]) + fit.t[1]]);
    for (const p of mapped) { mx += p[0]; my += p[1]; }
    mx /= mapped.length; my /= mapped.length;
    const per = fit.k / S; // reference viewBox units per OUR local unit
    const buckets = REGIONS.map(() => []);
    const all = [];
    fit.pairs.forEach(([p, q], i) => {
      const x = fit.k * (Math.cos(fit.th) * p[0] - Math.sin(fit.th) * p[1]) + fit.t[0];
      const y = fit.k * (Math.sin(fit.th) * p[0] + Math.cos(fit.th) * p[1]) + fit.t[1];
      const rOurs = Math.hypot(x - mx, y - my), rRef = Math.hypot(q[0] - mx, q[1] - my);
      const a = ((Math.atan2(y - my, x - mx) * 180) / Math.PI + 360) % 360;
      const d = (rOurs - rRef) / per; // in OUR local units
      all.push(Math.abs(d));
      REGIONS.forEach((R, k) => { if (inReg(a, R[1], R[2])) buckets[k].push(d); });
    });
    const med = (v) => { if (!v.length) return NaN; const w = [...v].sort((a, b) => a - b); return w[w.length >> 1]; };
    const row = { f, k: fit.k, th: (fit.th * 180) / Math.PI, n: fit.pairs.length, reg: buckets.map(med), mean: all.reduce((a, b) => a + b, 0) / all.length };
    rows.push(row);
    console.log(
      '  ', f.padEnd(26), fit.k.toFixed(3).padStart(5), row.th.toFixed(1).padStart(7),
      String(row.n).padStart(5), '  ',
      ...row.reg.map((v) => (Number.isNaN(v) ? '   -  ' : v.toFixed(2).padStart(6)) + ' '),
      row.mean.toFixed(2).padStart(6),
    );
  }
  // pooled, over the files whose fit is sane
  const GOOD = rows.filter((r) => Math.abs(r.th) < 8 && r.mean < 3);
  console.log(`\n  pooled median over ${GOOD.length} files with |theta| < 8 deg and mean|d| < 3:`);
  REGIONS.forEach((R, i) => {
    const v = GOOD.map((r) => r.reg[i]).filter((x) => !Number.isNaN(x)).sort((a, b) => a - b);
    if (!v.length) return;
    const lo = v[0], hi = v[v.length - 1];
    console.log(`     ${R[0]}  median ${v[v.length >> 1].toFixed(2).padStart(6)}   range ${lo.toFixed(2)} .. ${hi.toFixed(2)}   ${v.every((x) => x > 0) ? 'ALL POSITIVE' : v.every((x) => x < 0) ? 'ALL NEGATIVE' : 'sign disagrees'}`);
  });

}
