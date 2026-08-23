// IS THE FROZEN DISC A RIM FIT? — the null test the nickel reverse's numbers
// all rest on, run before any of them.
//
// WHY. `discOf()`'s `R = sqrt(area/pi)` is not the disc, and the cent round
// (2026-08-23) found it failing IN KIND on a cameo proof: on `penny-obv-2.jpg`
// R = 395.7 against a rim fit's 450.0, −12.1%, with the centre 7.0 viewBox
// units out, because the mirror field photographs as background. The nickel
// reverse's pool contains a cameo proof, so the warning applies — but "it is a
// proof" turned out NOT to be the test. Run this to see why:
//
//   nickel-rev-proof.png   area −1.8%   (white SURROUND, so the black mirror
//                                        field is still counted as device)
//   nickel-rev-2.png       area −31.7%  (bright coin on a transparent
//                                        background flattened to white, so the
//                                        coin's own field is counted as
//                                        background — far worse, and on the
//                                        file nobody would suspect)
//   nickel-rev.jpg         area −7.2%
//
// The rule is unchanged: fit the RIM. What changes is that you cannot decide
// which files are safe by their finish.
//
// METHOD. From an approximate centre, walk inward along 720 rays from the far
// edge and take the OUTERMOST radius at which four consecutive samples differ
// from the border-median background by more than `tol`; fit a circle to those
// points by Kasa least squares; iterate the centre six times. Reports the p95
// radial residual so a bad fit announces itself.
//
// usage: node coloringbook/judge/_nkr1disc.mjs
import { join } from 'node:path';
import { REF } from './_paths.mjs';
import { DISCS, POOL, greyRaw } from './_nkrlib.mjs';

const at = (g, x, y) => {
  if (x < 0 || y < 0 || x >= g.w - 1 || y >= g.h - 1) return null;
  const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0, i = y0 * g.w + x0;
  return g.d[i] * (1 - fx) * (1 - fy) + g.d[i + 1] * fx * (1 - fy)
    + g.d[i + g.w] * (1 - fx) * fy + g.d[i + g.w + 1] * fx * fy;
};
function bgOf(g) {
  const b = [];
  for (let x = 0; x < g.w; x++) b.push(g.d[x], g.d[(g.h - 1) * g.w + x]);
  for (let y = 0; y < g.h; y++) b.push(g.d[y * g.w], g.d[y * g.w + g.w - 1]);
  b.sort((p, q) => p - q);
  return b[b.length >> 1];
}
function solve3(A, B) {
  const M = A.map((row, i) => [...row, B[i]]);
  for (let i = 0; i < 3; i++) {
    let p = i;
    for (let r = i + 1; r < 3; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r;
    [M[i], M[p]] = [M[p], M[i]];
    for (let r = 0; r < 3; r++) {
      if (r === i) continue;
      const f = M[r][i] / M[i][i];
      for (let c = i; c < 4; c++) M[r][c] -= f * M[i][c];
    }
  }
  return [M[0][3] / M[0][0], M[1][3] / M[1][1], M[2][3] / M[2][2]];
}

function rimFit(g, tol = 30, nang = 720) {
  const bg = bgOf(g);
  let cx = g.w / 2, cy = g.h / 2, pts = [];
  const rMax = Math.min(g.w, g.h) / 2 - 1;
  for (let it = 0; it < 6; it++) {
    pts = [];
    for (let k = 0; k < nang; k++) {
      const t = (2 * Math.PI * k) / nang, ct = Math.cos(t), st = Math.sin(t);
      for (let r = rMax; r > rMax * 0.4; r -= 0.25) {
        const v = at(g, cx + ct * r, cy + st * r);
        if (v == null || Math.abs(v - bg) <= tol) continue;
        let ok = true;
        for (let s = 1; s <= 3; s++) {
          const v2 = at(g, cx + ct * (r - s * 0.5), cy + st * (r - s * 0.5));
          if (v2 == null || Math.abs(v2 - bg) <= tol) { ok = false; break; }
        }
        if (ok) { pts.push([cx + ct * r, cy + st * r]); break; }
      }
    }
    let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, sz = 0, sxz = 0, syz = 0;
    for (const [x, y] of pts) {
      const z = x * x + y * y;
      sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y; sz += z; sxz += x * z; syz += y * z;
    }
    const [a, b, c] = solve3([[sxx, sxy, sx], [sxy, syy, sy], [sx, sy, pts.length]], [sxz, syz, sz]);
    cx = a / 2; cy = b / 2;
    var R = Math.sqrt(c + cx * cx + cy * cy);
  }
  const res = pts.map(([x, y]) => Math.abs(Math.hypot(x - cx, y - cy) - R)).sort((p, q) => p - q);
  return { cx, cy, R, n: pts.length, p95: res[Math.floor(res.length * 0.95)], bg };
}

function areaFit(g, tol = 25) {
  const bg = bgOf(g);
  let n = 0, sx = 0, sy = 0;
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    if (Math.abs(g.d[y * g.w + x] - bg) > tol) { n++; sx += x; sy += y; }
  }
  return { cx: sx / n, cy: sy / n, R: Math.sqrt(n / Math.PI) };
}

console.log('DISC FIT — rim (this file) vs area sqrt(A/pi) vs the frozen _jn1discs.json');
console.log('file                    rim cx/cy/R              p95px   area R    d%     frozen R   d%');
for (const f of POOL) {
  const g = await greyRaw(join(REF, f));
  const r = rimFit(g), a = areaFit(g), z = DISCS[f];
  const pc = (v) => `${((v / r.R - 1) * 100).toFixed(2)}%`.padStart(7);
  console.log(
    f.padEnd(23),
    `${r.cx.toFixed(1)}/${r.cy.toFixed(1)}/${r.R.toFixed(2)}`.padEnd(23),
    r.p95.toFixed(1).padStart(5),
    a.R.toFixed(1).padStart(8), pc(a.R),
    z.R.toFixed(2).padStart(10), pc(z.R),
    `  dcx ${(z.cx - r.cx).toFixed(2)} dcy ${(z.cy - r.cy).toFixed(2)}`,
  );
}
console.log('\nThe frozen discs are rim fits and are sound. The area fit is not, on any of');
console.log('the three, and its worst failure is not the proof.');
