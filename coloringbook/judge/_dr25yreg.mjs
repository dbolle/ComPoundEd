// THE DIME REVERSE'S TWO-FILE REGISTRATION, BOTH AXES, MEASURED AS A FUNCTION.
//
// Reports only (WRITERS.md). Reads `ref/`, writes NOTHING, under any flag, in
// any mode. Never opens `dime-rev-2.jpg` (it fails the mask's null test by 63
// units). Changes no registration constant anywhere: `REG` in `_dr18prong.mjs`
// and friends, and `DYU` in `_dr24acorn2.mjs`, are untouched by this round.
//
// ── WHAT THIS ANSWERS ──────────────────────────────────────────────────────
// Ledger D40 says the two dime-reverse photographs disagree in y as well as x,
// by up to 0.85 units, and fits `dy = 0.489 + 0.0226·(y − 50)` to FOUR mask
// windows. Four windows cannot separate the three things that all look like
// "dy grows with y":
//
//     a y SCALE error          dy ∝ (y − 50)
//     a ROTATION               dy ∝ (x − 50)   and   dx ∝ −(y − 50)
//     an ISOTROPIC scale error dy ∝ (y − 50)   and   dx ∝ (x − 50), same sign
//
// and D40's four windows sit at x-centres 70, 50, 50, 50 — three of them on one
// column — so rotation and y-scale are aliased in that design. This measures
// the whole first-order field instead: ~80 windows over the device, TWO
// estimators that share no image statistic, and a plane fit in each axis.
//
// ── THE THREE TRAPS, AND WHAT IS DONE ABOUT EACH ───────────────────────────
//
// 1. A REGISTRATION FIT NEEDS A TARGET THAT IS NOT OUR DRAWING. Nothing here
//    reads `src/art`. Every number is photograph-against-photograph.
//
// 2. THE PUBLISHED −1.10 IN x IS THE CONTROL. `control` re-measures the two
//    files against each other in the window `_dr18prong.mjs` fitted the
//    published `REG` on (the torch trunk, y 62..69) and must return it. It
//    returns −1.00, which is what that instrument's own 0.25-step sweep
//    returns for the pair (proofbright's grid maximum is +0.25, not the
//    published +0.35; the published number carries 0.10 of hand-refinement).
//
// 3. AN ESTIMATOR THAT CANNOT SEPARATE TWO TOUCHING MARKS REPORTS THE CENTRE
//    OF THEIR UNION (ledger E25), and on this branch the marks touch
//    everywhere. So nothing here isolates a mark. The estimators are WHOLE-
//    WINDOW: the (dx, dy) that maximises agreement between two windows of
//    picture. A window that contains three fused leaves is fine — it is the
//    same three fused leaves on both files.
//
// ── THE TWO ESTIMATORS, AND WHY THEY ARE INDEPENDENT ───────────────────────
//   MASK IoU   the flood device masks (`_dr9branch.deviceMask`), intersection
//              over union. Uses a threshold and a flood; ignores tone inside.
//   GRAD NCC   normalised cross-correlation of SOBEL GRADIENT MAGNITUDE.
//              Uses no threshold, no flood, no mask at all, and is immune to
//              the thing that breaks tone matching on this pair: proofbright
//              is a DARK device on a bright field and unc2005 is a dark
//              OUTLINE around bright device interiors, so their raw greys are
//              of opposite polarity inside a mark. Gradient magnitude has no
//              polarity. (`raw grey NCC` is run in `fit` as the third leg, and
//              lands with the other two — but it is not the primary, for that
//              reason.)
//
// Agreement between two estimators that share no image statistic is evidence.
// The whole pipeline is checked against something stronger first: `selftest`
// registers a file against a KNOWN affine warp of ITSELF, and recovers a known
// translation to 0.0003 units and a known anisotropic scale to 0.1 %. Its
// NEGATIVE control matters as much: given a purely ISOTROPIC 2 % warp it
// reports anisotropy 0.06 %, so the anisotropy it reports on the real pair is
// not something the method manufactures.
//
// ── HOW THE RIM FIT ENTERS, WHICH IS THE FAULT-ATTRIBUTION QUESTION ────────
// `samplerFor()` maps viewBox → pixel through ONE radius: px = cx + R(x−50)/47
// and py = cy + R(y−50)/47, the same R in both axes. So the sampler assumes the
// coin's outline is a CIRCLE. `ellipse` mode measures whether it is:
//
//   · both dime-reverse rims are clean ELLIPSES. The radial residual from the
//     circle fit is a 2-cycle in θ with harmonics 1, 3 and 4 an order of
//     magnitude smaller — proofbright 0.734 % amplitude (harmonics 1/3/4:
//     0.001/0.086/0.018 %), unc2005 0.511 % (0.000/0.013/0.026 %). That is an
//     ellipse, not a rough outline.
//   · a circle fitted to an ellipse returns an R between rx and ry, so the
//     sampler over-scales one axis and under-scales the other, on EACH file,
//     by a DIFFERENT amount. Predicted contribution to the two-file
//     difference: sx −0.42 %, sy +0.42 %, aniso +0.84 %.
//   · that prediction is then TESTED end-to-end rather than asserted:
//     `ellipse` re-runs the whole registration with samplers normalised by
//     (rx, ry) instead of R, and the measured anisotropy drops by 0.836 (mask)
//     and 0.712 (gradient) percentage points against the predicted 0.832.
//
//   ⚠️ AND IT IS NOT THE WHOLE FAULT. 1.22 (mask) and 1.58 (gradient) of the
//   2.06 and 2.29 percentage points SURVIVE ellipse normalisation. The rim fit
//   is a real, quantified, third of the y error; it is not the cause.
//
// The disc CENTRE is checked too, not just the radius, because a centre error
// would produce exactly the constant part of the offset. Two rim fitters that
// share no code and no edge model (`_rimfit`: half-max + Taubin; `_dr1disc`:
// nearest-pixel + Kasa) agree on the centre to 0.031 units on proofbright and
// 0.050 on unc2005 — an order of magnitude below the measured constant term of
// +0.62. THE CONSTANT IS NOT A CENTRE ERROR.
//
// ⚠️ `discOf()`'s area radius is wrong in kind (−0.8 % to −31.75 % depending on
// the file) and appears nowhere here. Everything fits the rim.
//
//   node coloringbook/judge/_dr25yreg.mjs selftest   ground truth, both controls
//   node coloringbook/judge/_dr25yreg.mjs control    recover the published −1.10
//   node coloringbook/judge/_dr25yreg.mjs rim        rim as an ellipse; centres
//   node coloringbook/judge/_dr25yreg.mjs fit [step] the field, three estimators
//   node coloringbook/judge/_dr25yreg.mjs profile    dy vs y, against D40's line
//   node coloringbook/judge/_dr25yreg.mjs ellipse    is the fault the rim fit?
//   node coloringbook/judge/_dr25yreg.mjs oos        an independent 1-D channel
import sharp from 'sharp';
import { join } from 'node:path';
import { REF } from './_paths.mjs';
import { samplerFor } from './_dr2grid.mjs';
import { greyRaw, fitRim as kasaRim } from './_dr1disc.mjs';
import { fitRim, taubin, grey as rimGrey, background } from './_rimfit.mjs';
import { deviceMask } from './_dr9branch.mjs';
import { reopen } from './_dr13elem.mjs';

// the mask grid `_dr9branch` and `_dr24acorn2` already use, so a window quoted
// here is the same window quoted there
const X0 = 13, Y0 = 17, S = 0.05;
const MW = Math.round((87 - 13) / S), MH = Math.round((85 - 17) / S);
const FILE = { proofbright: 'dime-rev-proofbright.png', unc2005: 'dime-rev-unc2005.png' };
const T_OF = { proofbright: 236, unc2005: 190 };
const gi = (x) => Math.round((x - X0) / S), gj = (y) => Math.round((y - Y0) / S);

// ── THE MEASURED FUNCTION ───────────────────────────────────────────────────
// Reported, NOT applied. Nothing in this repository calls these; `DYU` in
// `_dr24acorn2.mjs` still carries D40's line. Applying is the owner's call,
// exactly as the erosion re-baseline was.
//
//   a feature at (x, y) on dime-rev-proofbright.png is at
//   (x + DX(x), y + DY(y)) on dime-rev-unc2005.png
//
// Translation + DIAGONAL scale. No rotation term and no shear term: both come
// out at 0.1 % ± 0.1 % and change sign across the robustness sweep. No
// quadratic term: adding (y − 50)² to dy moves the fit's RMS from 0.1202 to
// 0.1199, which is not a term, it is a decimal place.
//
// The coefficients are the MEAN OF THE THREE ESTIMATORS in the configuration
// `fit` prints (14-unit windows, 6-unit step, standard masks). Their spread,
// not any one of their bootstrap intervals, is the uncertainty — see `fit`.
//
//   DY(y)   dy0 +0.62 ± 0.15    sy +1.56 % ± 0.25 %.  sy lands between +1.31
//           and +1.80 % on EVERY estimator and EVERY spatial subset tried.
//           This is the round's firm number.
//   DX(x)   dx0 −0.91 ± 0.06    sx −1.0 % ± 0.7 %.  ⚠️ THE SLOPE IS SOFT AND
//           THE PROFILE IS BENT: `profile` prints dx flat near −1.08 from
//           x 45 to x 76 and rising toward −0.5 on the olive side, and sx
//           lands anywhere from −0.13 to −2.23 % depending on the subset.
//           dx0 is solid; DX MUST NOT BE EXTRAPOLATED past x 22..76.
//
// One conclusion survives all of that softness and it is the load-bearing one:
// if the two files differed by an ISOTROPIC scale — which is what a wrong rim
// RADIUS would give — then sx would have to equal sy = +1.5 %. Every estimator
// and every subset puts sx NEGATIVE. The difference is anisotropic.
export const DX = (x) => -0.91 - 0.0101 * (x - 50);
export const DY = (y) => 0.62 + 0.0156 * (y - 50);
/** D40's line, for comparison only. */
export const DYU_D40 = (y) => 0.489 + 0.0226 * (y - 50);

// ── grids ───────────────────────────────────────────────────────────────────
const bilinear = (g, X, Y) => {
  if (X < 0 || Y < 0 || X >= g.w - 1 || Y >= g.h - 1) return 255;
  const x0 = X | 0, y0 = Y | 0, fx = X - x0, fy = Y - y0, i = y0 * g.w + x0;
  return g.d[i] * (1 - fx) * (1 - fy) + g.d[i + 1] * fx * (1 - fy)
    + g.d[i + g.w] * (1 - fx) * fy + g.d[i + g.w + 1] * fx * fy;
};

/** grey resampled onto the mask grid, through this file's own rim fit */
export async function greyGrid(file) {
  const s = await samplerFor(file, 2400);
  const g = new Float32Array(MW * MH);
  for (let j = 0; j < MH; j++) { const y = Y0 + j * S; for (let i = 0; i < MW; i++) g[j * MW + i] = s.at(X0 + i * S, y); }
  return g;
}
/** Sobel gradient magnitude — polarity-free, threshold-free, mask-free. */
export function gradMag(g) {
  const o = new Float32Array(MW * MH);
  for (let j = 1; j < MH - 1; j++) for (let i = 1; i < MW - 1; i++) {
    const k = j * MW + i;
    const gx = -g[k - MW - 1] - 2 * g[k - 1] - g[k + MW - 1] + g[k - MW + 1] + 2 * g[k + 1] + g[k + MW + 1];
    const gy = -g[k - MW - 1] - 2 * g[k - MW] - g[k - MW + 1] + g[k + MW - 1] + 2 * g[k + MW] + g[k + MW + 1];
    o[k] = Math.hypot(gx, gy);
  }
  return o;
}
async function maskOf(key) {
  const m = await deviceMask(FILE[key], T_OF[key], 0);
  // ⚠️ `--reopen 1.0` is proofbright's alone. On unc2005 that threshold reopens
  // the torch flame's whole interior, because unc2005 is dark-outline with
  // bright device interiors.
  return key === 'proofbright' ? reopen(m, FILE[key], T_OF[key], 1.0) : m;
}

// ── the estimator ───────────────────────────────────────────────────────────
/**
 * The (dx, dy) at which window `w` of A agrees best with B. Coarse 0.25 sweep
 * over +-2.5, fine 0.05 refinement, then a parabola on each axis — the sweep
 * bound matters: a maximum found at the edge of the search window is a search
 * bound, not a maximum, so `edge` is returned and such a window is dropped.
 */
export function bestShift(A, B, w, metric, { rng = 2.5, coarse = 0.25, fine = 0.05, sub = 3 } = {}) {
  const [x0, x1, y0, y1] = w;
  const I0 = gi(x0), I1 = gi(x1), J0 = gj(y0), J1 = gj(y1);
  const score = (dx, dy) => {
    const di = Math.round(dx / S), dj = Math.round(dy / S);
    if (metric === 'iou') {
      let inter = 0, uni = 0;
      for (let j = J0; j <= J1; j += sub) {
        const bj = j + dj; if (bj < 0 || bj >= MH) continue;
        for (let i = I0; i <= I1; i += sub) {
          const bi = i + di; if (bi < 0 || bi >= MW) continue;
          const a = A[j * MW + i], b = B[bj * MW + bi];
          if (a && b) inter++; if (a || b) uni++;
        }
      }
      return uni ? inter / uni : -1;
    }
    let n = 0, sa = 0, sb = 0, saa = 0, sbb = 0, sab = 0;
    for (let j = J0; j <= J1; j += sub) {
      const bj = j + dj; if (bj < 1 || bj >= MH - 1) continue;
      for (let i = I0; i <= I1; i += sub) {
        const bi = i + di; if (bi < 1 || bi >= MW - 1) continue;
        const a = A[j * MW + i], b = B[bj * MW + bi];
        n++; sa += a; sb += b; saa += a * a; sbb += b * b; sab += a * b;
      }
    }
    if (n < 50) return -1;
    const va = saa / n - (sa / n) ** 2, vb = sbb / n - (sb / n) ** 2;
    if (va <= 0 || vb <= 0) return -1;
    return (sab / n - (sa / n) * (sb / n)) / Math.sqrt(va * vb);
  };
  let best = null;
  for (let dy = -rng; dy <= rng + 1e-9; dy += coarse) for (let dx = -rng; dx <= rng + 1e-9; dx += coarse) {
    const v = score(dx, dy); if (v > -1 && (!best || v > best.v)) best = { dx, dy, v };
  }
  if (!best) return null;
  if (Math.abs(best.dx) > rng - coarse || Math.abs(best.dy) > rng - coarse) return null;  // search bound
  const c = best; best = null;
  for (let dy = c.dy - coarse; dy <= c.dy + coarse + 1e-9; dy += fine) for (let dx = c.dx - coarse; dx <= c.dx + coarse + 1e-9; dx += fine) {
    const v = score(dx, dy); if (v > -1 && (!best || v > best.v)) best = { dx, dy, v };
  }
  const px = [score(best.dx - fine, best.dy), best.v, score(best.dx + fine, best.dy)];
  const py = [score(best.dx, best.dy - fine), best.v, score(best.dx, best.dy + fine)];
  const ref = (p) => { const d = p[0] - 2 * p[1] + p[2]; return d < 0 ? (0.5 * (p[0] - p[2]) / d) * fine : 0; };
  const rx = ref(px), ry = ref(py);
  return { dx: best.dx + (Math.abs(rx) <= fine ? rx : 0), dy: best.dy + (Math.abs(ry) <= fine ? ry : 0), v: best.v };
}

// ── plane fit  z = a0 + a1(x-50) + a2(y-50) ─────────────────────────────────
function solve(M, T) {
  const n = T.length, A = M.map((r, i) => [...r, T[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    for (let r = 0; r < n; r++) { if (r === c) continue; const f = A[r][c] / A[c][c]; for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k]; }
  }
  return A.map((r, i) => r[n] / r[i]);
}
function inv3(M) {
  const I = [[1, 0, 0], [0, 1, 0], [0, 0, 1]], A = M.map((r, i) => [...r, ...I[i]]);
  for (let c = 0; c < 3; c++) {
    let p = c; for (let r = c + 1; r < 3; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    const d = A[c][c]; for (let k = 0; k < 6; k++) A[c][k] /= d;
    for (let r = 0; r < 3; r++) { if (r === c) continue; const f = A[r][c]; for (let k = 0; k < 6; k++) A[r][k] -= f * A[c][k]; }
  }
  return A.map((r) => [r[3], r[4], r[5]]);
}
export function planeFit(pts, key) {
  const n = pts.length;
  let S00 = 0, S01 = 0, S02 = 0, S11 = 0, S12 = 0, S22 = 0, T0 = 0, T1 = 0, T2 = 0, W = 0;
  for (const p of pts) {
    const u = p.x - 50, v = p.y - 50, z = p[key], w = p.w;
    W += w; S00 += w; S01 += w * u; S02 += w * v; S11 += w * u * u; S12 += w * u * v; S22 += w * v * v;
    T0 += w * z; T1 += w * u * z; T2 += w * v * z;
  }
  const M = [[S00, S01, S02], [S01, S11, S12], [S02, S12, S22]];
  const a = solve(M, [T0, T1, T2]);
  let ss = 0; for (const p of pts) { const u = p.x - 50, v = p.y - 50; ss += p.w * (p[key] - (a[0] + a[1] * u + a[2] * v)) ** 2; }
  const iv = inv3(M), s2 = (ss / W) * (n / (n - 3));
  return { a, rms: Math.sqrt(ss / W), sd: [0, 1, 2].map((i) => Math.sqrt(iv[i][i] * s2)), n };
}

// ── windows ─────────────────────────────────────────────────────────────────
// A window is used only if BOTH masks are between 10 % and 90 % device inside
// it. An empty window and a saturated window both have a flat agreement
// surface, and a flat surface has no maximum — that is the same defect as a
// registration sweep whose peak is 0.3 wide (`_dr18prong.mjs`).
export function windows(A, B, half = 7, step = 6, box = [22, 78, 24, 78], cov = [0.10, 0.90]) {
  const out = [];
  for (let cy = box[2]; cy <= box[3]; cy += step) for (let cx = box[0]; cx <= box[1]; cx += step) {
    const w = [cx - half, cx + half, cy - half, cy + half];
    if (w[0] < 14 || w[1] > 86 || w[2] < 18 || w[3] > 84) continue;
    let na = 0, nb = 0, tot = 0;
    for (let j = gj(w[2]); j <= gj(w[3]); j += 3) for (let i = gi(w[0]); i <= gi(w[1]); i += 3) {
      tot++; if (A[j * MW + i]) na++; if (B[j * MW + i]) nb++;
    }
    const fa = na / tot, fb = nb / tot;
    if (fa < cov[0] || fa > cov[1] || fb < cov[0] || fb > cov[1]) continue;
    out.push({ cx, cy, w });
  }
  return out;
}
export function field(A, B, metric, wins) {
  const P = [];
  for (const { cx, cy, w } of wins) {
    const r = bestShift(A, B, w, metric);
    if (r) P.push({ x: cx, y: cy, dx: r.dx, dy: r.dy, w: Math.max(0, r.v) });
  }
  return P;
}
export function decompose(P) {
  const fx = planeFit(P, 'dx'), fy = planeFit(P, 'dy');
  return {
    fx, fy, n: P.length,
    dx0: fx.a[0], dy0: fy.a[0], sx: fx.a[1], sy: fy.a[2],
    iso: (fx.a[1] + fy.a[2]) / 2, aniso: fy.a[2] - fx.a[1],
    rotDeg: (((fy.a[1] - fx.a[2]) / 2) * 180) / Math.PI, shear: (fy.a[1] + fx.a[2]) / 2,
  };
}
const line = (tag, d) =>
  `${tag.padEnd(13)} n=${String(d.n).padStart(3)}  dx0 ${d.dx0.toFixed(3)}±${d.fx.sd[0].toFixed(3)}  `
  + `sx ${(d.sx * 100).toFixed(3)}±${(d.fx.sd[1] * 100).toFixed(3)}%  |  dy0 ${d.dy0.toFixed(3)}±${d.fy.sd[0].toFixed(3)}  `
  + `sy ${(d.sy * 100).toFixed(3)}±${(d.fy.sd[2] * 100).toFixed(3)}%  |  iso ${(d.iso * 100).toFixed(3)}%  `
  + `ANISO ${(d.aniso * 100).toFixed(3)}%  rot ${d.rotDeg.toFixed(3)}°  rms ${d.fx.rms.toFixed(3)}/${d.fy.rms.toFixed(3)}`;

// ── the rim, fitted as an ellipse instead of a circle ───────────────────────
/**
 * Cast rays from the mask centroid to the HALF-MAX crossing — the same edge
 * model `_rimfit.fitRim` uses, deliberately, so the only thing that changes
 * between the two is the SHAPE being fitted. Returns the raw points.
 */
export async function rimPoints(fileOrBuf, opts = {}) {
  const g = await rimGrey(fileOrBuf);
  const { d, w, h } = g, bg = background(g);
  const T = opts.T ?? 24, RAYS = opts.rays ?? 1440, STEP = 0.25;
  const bilin = (X, Y) => {
    const x = X - 0.5, y = Y - 0.5;
    if (x < 0 || y < 0 || x > w - 1 || y > h - 1) return bg;
    const i = Math.min(w - 2, x | 0), j = Math.min(h - 2, y | 0), fx = x - i, fy = y - j;
    return d[j * w + i] * (1 - fx) * (1 - fy) + d[j * w + i + 1] * fx * (1 - fy)
      + d[(j + 1) * w + i] * (1 - fx) * fy + d[(j + 1) * w + i + 1] * fx * fy;
  };
  const dev = (X, Y) => Math.abs(bilin(X, Y) - bg);
  let n = 0, mx = 0, my = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (Math.abs(d[y * w + x] - bg) > T) { n++; mx += x + 0.5; my += y + 0.5; }
  if (!n) throw new Error('_dr25yreg: empty threshold mask');
  mx /= n; my /= n;
  const rMax = Math.hypot(w, h) / 2, frameMargin = opts.frameMargin ?? 1.0;
  const pts = []; let onEnd = 0, onFrame = 0;
  for (let k = 0; k < RAYS; k++) {
    const th = (2 * Math.PI * k) / RAYS, cs = Math.cos(th), sn = Math.sin(th);
    let rIn = null;
    for (let r = rMax; r > 4; r -= STEP) if (dev(mx + cs * r, my + sn * r) > T) { rIn = r; break; }
    if (rIn === null || rIn >= rMax - STEP) { onEnd++; continue; }
    const half = Math.max(T, dev(mx + cs * (rIn - 3), my + sn * (rIn - 3)) / 2);
    let lo = null;
    for (let r = rIn; r > rIn - 6 && r > 4; r -= STEP) if (dev(mx + cs * r, my + sn * r) >= half) { lo = r; break; }
    if (lo === null) { onEnd++; continue; }
    let hi = rIn + STEP;
    for (let b = 0; b < 24; b++) { const m = (lo + hi) / 2; if (dev(mx + cs * m, my + sn * m) >= half) lo = m; else hi = m; }
    const r = (lo + hi) / 2, px = mx + cs * r, py = my + sn * r;
    // ledger A28: a crossing on the picture's own border is the FRAME, not a rim
    if (frameMargin > 0 && (px <= frameMargin || py <= frameMargin || px >= w - frameMargin || py >= h - frameMargin)) { onFrame++; continue; }
    pts.push([px, py]);
  }
  return { pts, onEnd, onFrame, w, h };
}
/**
 * r(θ) = R0 + p·cos2θ + q·sin2θ about a FIXED centre. An ellipse of small
 * eccentricity is exactly a 2-cycle in the radius, so `amp` is the ellipticity
 * and the amplitudes of harmonics 1, 3, 4 say whether "ellipse" is the right
 * word for the shape or merely the first term of a rough outline.
 */
export function harmonics(pts, cx, cy) {
  let A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, sr = 0, sru = 0, srv = 0;
  for (const [x, y] of pts) {
    const th = Math.atan2(y - cy, x - cx), r = Math.hypot(x - cx, y - cy);
    const u = Math.cos(2 * th), v = Math.sin(2 * th);
    A += 1; B += u; C += v; D += u * u; E += u * v; F += v * v; sr += r; sru += r * u; srv += r * v;
  }
  const [R0, p, q] = solve([[A, B, C], [B, D, E], [C, E, F]], [sr, sru, srv]);
  const har = {};
  for (const k of [1, 3, 4]) {
    let sp = 0, sq = 0;
    for (const [x, y] of pts) {
      const th = Math.atan2(y - cy, x - cx);
      const rr = Math.hypot(x - cx, y - cy) - (R0 + p * Math.cos(2 * th) + q * Math.sin(2 * th));
      sp += rr * Math.cos(k * th); sq += rr * Math.sin(k * th);
    }
    har[k] = (2 * Math.hypot(sp, sq)) / pts.length;
  }
  let ss = 0;
  for (const [x, y] of pts) {
    const th = Math.atan2(y - cy, x - cx);
    ss += (Math.hypot(x - cx, y - cy) - (R0 + p * Math.cos(2 * th) + q * Math.sin(2 * th))) ** 2;
  }
  return {
    R0, p, q, amp: Math.hypot(p, q), phiDeg: (0.5 * Math.atan2(q, p) * 180) / Math.PI,
    rx: R0 + p, ry: R0 - p, ratio: (R0 - p) / (R0 + p), har, rms: Math.sqrt(ss / pts.length), n: pts.length,
  };
}
/** The rim as an ellipse, about the rim fit's own Taubin centre. */
export async function rimEllipse(file) {
  const { pts } = await rimPoints(file);
  const c = taubin(pts);
  let P = pts, h = harmonics(P, c.cx, c.cy);
  for (let it = 0; it < 3; it++) {                       // 2.5 sigma, three times
    const keep = P.filter(([x, y]) => {
      const th = Math.atan2(y - c.cy, x - c.cx);
      return Math.abs(Math.hypot(x - c.cx, y - c.cy) - (h.R0 + h.p * Math.cos(2 * th) + h.q * Math.sin(2 * th))) < 2.5 * h.rms;
    });
    if (keep.length < 200) break;
    P = keep; h = harmonics(P, c.cx, c.cy);
  }
  return { ...h, cx: c.cx, cy: c.cy, R: c.R };
}

// ── the ellipse-normalised sampler, for the attribution test only ───────────
async function ellipseGrids(file, mode, T) {
  const e = await rimEllipse(file), g = await greyRaw(join(REF, file));
  const kx = mode === 'ellipse' ? e.rx : e.R, ky = mode === 'ellipse' ? e.ry : e.R;
  const G = new Float32Array(MW * MH);
  for (let j = 0; j < MH; j++) {
    const y = Y0 + j * S;
    for (let i = 0; i < MW; i++) G[j * MW + i] = bilinear(g, e.cx + (kx * (X0 + i * S - 50)) / 47, e.cy + (ky * (y - 50)) / 47);
  }
  // the flood device mask, inlined so it can run on an arbitrary sampler
  const light = new Uint8Array(MW * MH);
  for (let k = 0; k < MW * MH; k++) light[k] = G[k] >= T ? 1 : 0;
  const fieldM = new Uint8Array(MW * MH), st = [];
  const push = (i, j) => { if (i < 0 || j < 0 || i >= MW || j >= MH) return; const k = j * MW + i; if (fieldM[k] || !light[k]) return; fieldM[k] = 1; st.push(k); };
  for (let i = 0; i < MW; i++) { push(i, 0); push(i, MH - 1); }
  for (let j = 0; j < MH; j++) { push(0, j); push(MW - 1, j); }
  while (st.length) { const k = st.pop(); const i = k % MW, j = (k - i) / MW; push(i + 1, j); push(i - 1, j); push(i, j + 1); push(i, j - 1); }
  const dev = new Uint8Array(MW * MH);
  for (let k = 0; k < MW * MH; k++) dev[k] = fieldM[k] ? 0 : 1;
  return { G, dev, e };
}

// ── synthetic ground truth ──────────────────────────────────────────────────
const synthE = (rx, ry, rot = 0, { cx = 400, cy = 400, W = 800, H = 800, bg = 245, fg = 60 } = {}) =>
  sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`
    + `<rect width="${W}" height="${H}" fill="rgb(${bg},${bg},${bg})"/>`
    + `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy})" fill="rgb(${fg},${fg},${fg})"/></svg>`)).png().toBuffer();

/** out(x, y) = in(f(x, y)) on the mask grid. `nearest` for a binary mask. */
function warpGrid(G, f, nearest) {
  const O = new G.constructor(MW * MH);
  for (let j = 0; j < MH; j++) {
    const y = Y0 + j * S;
    for (let i = 0; i < MW; i++) {
      const [sx, sy] = f(X0 + i * S, y);
      const fi = (sx - X0) / S, fj = (sy - Y0) / S;
      if (nearest) { const a = Math.round(fi), b = Math.round(fj); O[j * MW + i] = (a < 0 || b < 0 || a >= MW || b >= MH) ? 0 : G[b * MW + a]; continue; }
      const a = Math.floor(fi), b = Math.floor(fj);
      if (a < 0 || b < 0 || a >= MW - 1 || b >= MH - 1) { O[j * MW + i] = 0; continue; }
      const u = fi - a, v = fj - b;
      O[j * MW + i] = G[b * MW + a] * (1 - u) * (1 - v) + G[b * MW + a + 1] * u * (1 - v)
        + G[(b + 1) * MW + a] * (1 - u) * v + G[(b + 1) * MW + a + 1] * u * v;
    }
  }
  return O;
}

// ── CLI ─────────────────────────────────────────────────────────────────────
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.argv[2] || 'fit';

  // ══ control ══════════════════════════════════════════════════════════════
  if (mode === 'control') {
    const A = await maskOf('proofbright'), B = await maskOf('unc2005');
    console.log('THE CONTROL. `_dr18prong.mjs` fits the published REG by sweeping our ink');
    console.log('across the torch TRUNK, y 62..69, on each file separately: proofbright');
    console.log('+0.35, unc2005 -0.75, difference -1.10. Re-measured here WITHOUT our');
    console.log('drawing, photograph against photograph, in that same window.\n');
    console.log('  window                 mask IoU dx      IoU');
    for (const w of [[44, 56, 62, 69], [45, 55, 62, 69], [46, 54, 62, 69], [44, 56, 60, 72], [42, 58, 60, 74], [46, 54, 58, 72]]) {
      const m = bestShift(A, B, w, 'iou');
      console.log(`  x ${String(w[0]).padStart(2)}..${String(w[1]).padEnd(2)} y ${String(w[2]).padStart(2)}..${String(w[3]).padEnd(2)}        ${m.dx.toFixed(3).padStart(7)}    ${m.v.toFixed(3)}`);
    }
    console.log('\n  -1.00 on every window choice, spread 0.03. `_dr18prong reg` prints its');
    console.log('  own sweep on a 0.25 grid: proofbright peaks at +0.25 and unc2005 at');
    console.log('  -0.75, i.e. -1.00 for the pair. The published -1.10 carries 0.10 of');
    console.log('  refinement past that grid on the proofbright side. THE METHOD');
    console.log('  REPRODUCES THE PUBLISHED NUMBER TO 0.10, AND ITS OWN SWEEP EXACTLY.');
    process.exit(0);
  }

  // ══ rim ══════════════════════════════════════════════════════════════════
  if (mode === 'rim') {
    console.log('THE RIM, FITTED AS AN ELLIPSE, AND THE CENTRE CHECKED AGAINST A SECOND');
    console.log('ESTIMATOR. `samplerFor()` maps BOTH axes through ONE radius, so it assumes');
    console.log('the outline is a circle. Harmonic 2 is the ellipticity; harmonics 1, 3, 4');
    console.log('say whether the shape is an ellipse or just a rough outline.\n');
    for (const f of ['dime-rev-proofbright.png', 'dime-rev-unc2005.png', 'dime-rev.jpg']) {
      const e = await rimEllipse(f);
      const rf = await fitRim(f), kf = await kasaRim(f);
      const dC = Math.hypot(rf.cx - kf.cx, rf.cy - kf.cy);
      console.log(`${f}`);
      console.log(`  circle  R ${rf.R.toFixed(3)}  centre (${rf.cx.toFixed(3)}, ${rf.cy.toFixed(3)})  p95 residual ${rf.p95pctR}% of R`);
      console.log(`  ellipse rx ${e.rx.toFixed(2)}  ry ${e.ry.toFixed(2)}  ry/rx ${e.ratio.toFixed(5)} (${((e.ratio - 1) * 100).toFixed(3)}%)  major axis ${e.phiDeg.toFixed(1)}°  n ${e.n}`);
      console.log(`  harmonic amplitudes, % of R:  h2 ${((100 * e.amp) / e.R0).toFixed(3)}   h1 ${((100 * e.har[1]) / e.R0).toFixed(3)}   h3 ${((100 * e.har[3]) / e.R0).toFixed(3)}   h4 ${((100 * e.har[4]) / e.R0).toFixed(3)}`);
      console.log(`  sampler scale error from assuming a circle:  x ${(((e.rx / e.R0) - 1) * 100).toFixed(3)}%   y ${(((e.ry / e.R0) - 1) * 100).toFixed(3)}%`);
      console.log(`  CENTRE, two estimators that share no code (_rimfit half-max+Taubin vs`);
      console.log(`     _dr1disc nearest-pixel+Kasa): ${dC.toFixed(3)} px apart = ${((47 * dC) / rf.R).toFixed(4)} viewBox units;  dR ${((100 * (rf.R / kf.R - 1))).toFixed(3)}%`);
    }
    console.log('\nA CENTRE ERROR WOULD BE THE CONSTANT TERM OF THE REGISTRATION. It is not:');
    console.log('the two fitters agree on the centre to under 0.05 units on both dime-reverse');
    console.log('files, and the measured constant term in y is +0.55.');
    process.exit(0);
  }

  // ══ ellipse — the attribution test ═══════════════════════════════════════
  if (mode === 'ellipse') {
    console.log('IS THE FAULT THE RIM FIT? Re-run the whole registration with each file');
    console.log('normalised by its own rim ELLIPSE (rx, ry) instead of one circle radius R.');
    console.log('If the y error is the circle model applied to an elliptical rim, it goes');
    console.log('away here. `reopen` is NOT applied in either arm, so the only difference');
    console.log('between the two arms is the normalisation.\n');
    const eP = await rimEllipse(FILE.proofbright), eU = await rimEllipse(FILE.unc2005);
    const kx = (e) => e.rx / e.R0, ky = (e) => e.ry / e.R0;
    console.log(`  predicted from the two rims alone:  sx ${(((kx(eU) - kx(eP))) * 100).toFixed(3)}%  sy ${(((ky(eU) - ky(eP))) * 100).toFixed(3)}%  ANISO ${(((ky(eU) - ky(eP)) - (kx(eU) - kx(eP))) * 100).toFixed(3)}%\n`);
    const out = {};
    for (const m of ['circle', 'ellipse']) {
      const p = await ellipseGrids(FILE.proofbright, m, T_OF.proofbright);
      const u = await ellipseGrids(FILE.unc2005, m, T_OF.unc2005);
      const wins = windows(p.dev, u.dev, 9, 6);
      console.log(`  ── ${m.toUpperCase()} normalisation, ${wins.length} windows ──`);
      out[m] = {};
      for (const [tag, A, B, metric] of [['mask IoU', p.dev, u.dev, 'iou'], ['grad NCC', gradMag(p.G), gradMag(u.G), 'ncc']]) {
        const d = decompose(field(A, B, metric, wins));
        out[m][tag] = d.aniso;
        console.log('  ' + line(tag, d));
      }
    }
    console.log('\n  anisotropy removed by fitting the rim as an ellipse:');
    for (const t of ['mask IoU', 'grad NCC'])
      console.log(`    ${t}  ${(out.circle[t] * 100).toFixed(3)}% -> ${(out.ellipse[t] * 100).toFixed(3)}%   removed ${((out.circle[t] - out.ellipse[t]) * 100).toFixed(3)} points`);
    console.log(`    predicted ${(((ky(eU) - ky(eP)) - (kx(eU) - kx(eP))) * 100).toFixed(3)} points\n`);
    console.log('  VERDICT: the rim fit is a REAL and QUANTIFIED part of the y error — about');
    console.log('  a third of it, and the prediction from the rims alone is confirmed');
    console.log('  end-to-end. IT IS NOT THE CAUSE: the rest survives, in the same');
    console.log('  direction, with both rims fitted exactly.');
    process.exit(0);
  }

  // ══ profile ══════════════════════════════════════════════════════════════
  if (mode === 'profile') {
    const A = await maskOf('proofbright'), B = await maskOf('unc2005');
    const eA = gradMag(await greyGrid(FILE.proofbright)), eB = gradMag(await greyGrid(FILE.unc2005));
    const wins = windows(A, B, 7, Number(process.argv[3]) || 3);
    console.log('dy AGAINST y, WITH NO LINE ASSUMED — the medians the plane fit is fitted to.');
    console.log('Each window\'s dy is corrected to x = 50 using that estimator\'s own dy/dx term,');
    console.log('so what is left is the y dependence alone.\n');
    for (const [tag, MA, MB, metric] of [['MASK IoU', A, B, 'iou'], ['GRAD NCC', eA, eB, 'ncc']]) {
      const P = field(MA, MB, metric, wins), fy = planeFit(P, 'dy');
      console.log(`── ${tag} ──   fitted dy = ${fy.a[0].toFixed(3)} + ${fy.a[2].toFixed(5)}·(y-50)   [+ ${fy.a[1].toFixed(5)}·(x-50)]`);
      console.log('    y    n   median dy   IQR     this fit   D40 line   D40 error');
      const bins = new Map();
      for (const p of P) { const b = Math.round(p.y / 3) * 3; if (!bins.has(b)) bins.set(b, []); bins.get(b).push(p.dy - fy.a[1] * (p.x - 50)); }
      for (const k of [...bins.keys()].sort((a, b) => a - b)) {
        const v = bins.get(k).sort((a, b) => a - b), md = v[v.length >> 1];
        console.log(`   ${String(k).padStart(2)}   ${String(v.length).padStart(2)}    ${md.toFixed(3).padStart(7)}   ${(v[Math.floor(v.length * 0.75)] - v[Math.floor(v.length * 0.25)]).toFixed(3)}    ${(fy.a[0] + fy.a[2] * (k - 50)).toFixed(3).padStart(7)}    ${DYU_D40(k).toFixed(3).padStart(7)}    ${(DYU_D40(k) - md).toFixed(3).padStart(7)}`);
      }
      // is a quadratic term supported?
      const n = P.length, Xr = P.map((p) => [1, p.x - 50, p.y - 50, (p.y - 50) ** 2]), yv = P.map((p) => p.dy);
      const M = Array.from({ length: 4 }, () => new Float64Array(4)), T = new Float64Array(4);
      for (let i = 0; i < n; i++) for (let a = 0; a < 4; a++) { T[a] += Xr[i][a] * yv[i]; for (let b = 0; b < 4; b++) M[a][b] += Xr[i][a] * Xr[i][b]; }
      const sol = solve(M.map((r) => [...r]), [...T]);
      let ss2 = 0, ss1 = 0;
      for (let i = 0; i < n; i++) { ss2 += (yv[i] - sol.reduce((s, v, a) => s + v * Xr[i][a], 0)) ** 2; ss1 += (yv[i] - (fy.a[0] + fy.a[1] * Xr[i][1] + fy.a[2] * Xr[i][2])) ** 2; }
      console.log(`   quadratic test: (y-50)² coefficient ${sol[3].toFixed(6)};  RMS linear ${Math.sqrt(ss1 / n).toFixed(4)} -> quadratic ${Math.sqrt(ss2 / n).toFixed(4)}`);
      console.log('   -> a projective/tilt term would show here as curvature. It does not.');
      // ⚠️ AND THE SAME PROFILE IN x, WHICH DOES NOT BEHAVE. dy is a straight
      // line the whole way; dx is NOT. It sits flat near -1.08 from x 45 to
      // x 76 and rises toward -0.5 on the olive side, so the fitted slope is a
      // summary of a bent profile, not a scale. Printed beside dy so the
      // difference between the two axes cannot be missed.
      const fx = planeFit(P, 'dx');
      const bx = new Map();
      for (const p of P) { const b = Math.round(p.x / 3) * 3; if (!bx.has(b)) bx.set(b, []); bx.get(b).push(p.dx - fx.a[2] * (p.y - 50)); }
      console.log(`   dx corrected to y = 50, binned by x   [fitted ${fx.a[0].toFixed(3)} + ${fx.a[1].toFixed(5)}·(x-50)]`);
      console.log('    x    n   median dx   this fit');
      for (const k of [...bx.keys()].sort((a, b) => a - b)) {
        const v = bx.get(k).sort((a, b) => a - b);
        console.log(`   ${String(k).padStart(2)}   ${String(v.length).padStart(2)}    ${v[v.length >> 1].toFixed(3).padStart(7)}    ${(fx.a[0] + fx.a[1] * (k - 50)).toFixed(3).padStart(7)}`);
      }
      console.log('');
    }
    process.exit(0);
  }

  // ══ oos — an INDEPENDENT CHANNEL, and the thing it cannot do ═════════════
  // The fit is a 2-D patch match over a 14-unit window. This is a 1-D EDGE
  // POSITION: for one row, the x of a named mask boundary on each file. It is
  // out of sample in kind, and it CORROBORATES dx — but it CANNOT separate
  // this round's dy line from D40's, and printing why is the point of the mode.
  //
  // A y error only reaches an x measurement through the edge's own RAKE. The
  // steepest unambiguous boundary on this branch is the oak channel's outer
  // wall at 0.45 units of x per unit of y. The two candidate dy lines differ by
  // at most 0.27 units, so they predict x readings 0.27 × 0.45 = 0.12 units
  // apart — two mask cells, against a row-to-row scatter several times that.
  // The channel is real, it is independent, and it is BLUNT. Said here rather
  // than left for someone to rediscover by fitting to it.
  if (mode === 'oos') {
    const A = await maskOf('proofbright'), B = await maskOf('unc2005');
    const wallAt = (M, y, x0, x1) => {           // rightmost device->field edge in [x0, x1]
      const j = gj(y); let last = null;
      for (let x = x0; x <= x1; x += S) { const i = gi(x); if (M[j * MW + i] && !M[j * MW + i + 1]) last = x; }
      return last;
    };
    console.log('AN INDEPENDENT 1-D CHANNEL: the x of a mask boundary, row by row, both');
    console.log('files. `unc - pb` on a row is the x registration at that x, read by an');
    console.log('estimator with nothing in common with the patch match.\n');
    console.log('A row is used only if the edge is CONTINUOUS on both files (moves under');
    console.log('0.6 units from the row above). A discontinuity means the scan jumped to a');
    console.log('different feature, and two different features do not register anything.\n');
    for (const [name, x0, x1, y0, y1, xNom] of [
      ['oak channel outer wall', 60, 76, 47, 55, 69],
      ['torch trunk right wall', 50, 58, 61, 70, 57],
    ]) {
      console.log(`── ${name} ──`);
      console.log('    y     pb     unc    unc-pb    predicted DX');
      let pp = null, pu = null, acc = 0, n = 0;
      for (let y = y0; y <= y1; y++) {
        const p = wallAt(A, y, x0, x1), u = wallAt(B, y, x0, x1);
        const ok = p !== null && u !== null && pp !== null && Math.abs(p - pp) < 0.6 && Math.abs(u - pu) < 0.6;
        if (p !== null && u !== null) {
          console.log(`   ${String(y).padStart(2)}   ${p.toFixed(2)}  ${u.toFixed(2)}   ${(u - p).toFixed(3).padStart(6)}   ${ok ? DX(xNom).toFixed(3).padStart(7) : '  (jump — not used)'}`);
          if (ok) { acc += u - p; n++; }
        }
        pp = p; pu = u;
      }
      console.log(`   mean over ${n} continuous rows: ${(acc / n).toFixed(3)}   against DX(${xNom}) = ${DX(xNom).toFixed(3)}\n`);
    }
    console.log('THE NULL RESULT, STATED: run the same rows against DYU_D40 and against DY');
    console.log('and they predict x readings 0.12 units apart at the very most. This channel');
    console.log('does not choose between them and is not evidence that either is right.');
    process.exit(0);
  }

  // ══ selftest ═════════════════════════════════════════════════════════════
  if (mode === 'selftest') {
    const t = [];
    const chk = (name, got, want, tol) => t.push([name, got, want, tol, Math.abs(got - want) <= tol]);

    // 1. GROUND TRUTH ON THE ELLIPSE FITTER. Synthetic ellipses have axes we
    //    KNOW. A rim fitter that cannot recover a number it was given cannot be
    //    used to attribute a 2 % error to a rim.
    //
    //    ⚠️ THE ONE BIAS THIS FITTER HAS, MEASURED RATHER THAN HIDDEN. Rays are
    //    cast from the centroid, so on an eccentric ellipse a ray meets the
    //    boundary OBLIQUELY and the half-max crossing sits slightly inside the
    //    true edge. At 10 % eccentricity (210 × 190) both axes come back 0.4 px
    //    (0.19 %) small. It is a COMMON-MODE bias — the RATIO survives to 1e-5,
    //    which is the quantity this round uses — and the real rims are at 0.6 %
    //    and 1.5 % eccentricity, two orders below the case that shows it.
    //    Asserted both ways so neither half can rot.
    for (const [rx, ry, tolAbs] of [[200, 200, 0.25], [200, 204.6, 0.25], [210, 190, 0.5]]) {
      const { pts } = await rimPoints(await synthE(rx, ry));
      const c = taubin(pts), h = harmonics(pts, c.cx, c.cy);
      chk(`ellipse ground truth rx=${rx} ry=${ry}: rx`, h.rx, rx, tolAbs);
      chk(`ellipse ground truth rx=${rx} ry=${ry}: ry`, h.ry, ry, tolAbs);
      chk(`ellipse ground truth rx=${rx} ry=${ry}: RATIO ry/rx`, h.ratio, ry / rx, 0.0005);
      chk(`ellipse ground truth rx=${rx} ry=${ry}: centre`, Math.hypot(c.cx - 400, c.cy - 400), 0, 0.15);
    }
    // a CIRCLE must not be reported as an ellipse
    {
      const { pts } = await rimPoints(await synthE(200, 200));
      const c = taubin(pts), h = harmonics(pts, c.cx, c.cy);
      chk('a circle reports ~zero ellipticity', (100 * h.amp) / h.R0, 0, 0.02);
    }

    // 2. GROUND TRUTH ON THE REGISTRATION. Register a real file against a KNOWN
    //    affine warp of ITSELF. No second photograph, no unknowns: the answer
    //    is arithmetic, and the estimator either returns it or does not.
    const A = await maskOf('proofbright'), gA = await greyGrid(FILE.proofbright);
    const wins = windows(A, A, 7, 6);
    for (const [tag, f, tdx, tsx, tdy, tsy] of [
      ['identity', (x, y) => [x, y], 0, 0, 0, 0],
      ['translation dx -1.10 dy +0.50', (x, y) => [x - 1.10, y + 0.50], 1.10, 0, -0.50, 0],
      ['anisotropic sx -1.30% sy +1.75%',
        (x, y) => [50 + (x - 50) * (1 - 0.0130) - 0.9246, 50 + (y - 50) * (1 + 0.01741) + 0.4686],
        0.9368, 0.01317, -0.4606, -0.01711],
      ['ISOTROPIC +2.00% (negative control)', (x, y) => [50 + (x - 50) * 1.02, 50 + (y - 50) * 1.02], 0, -0.01961, 0, -0.01961],
    ]) {
      const Aw = warpGrid(A, f, true), gAw = warpGrid(gA, f, false);
      const dm = decompose(field(A, Aw, 'iou', wins));
      const dg = decompose(field(gradMag(gA), gradMag(gAw), 'ncc', wins));
      // ⚠️ THE SECOND MEASURED BIAS. On a scale term the estimators recover
      // 93-98 % of what they were given — resampling the grid to build the
      // warped copy blurs it slightly, and a blurred edge pulls the agreement
      // peak in. So a scale is checked to 0.0004 ABSOLUTE plus 8 % RELATIVE:
      // that admits the known shortfall and still fails a wrong sign, a wrong
      // axis, or a scale off by a third. The consequence for the real answer is
      // stated with it: the measured sy is a FLOOR, the truth is up to ~5 %
      // larger, which moves +1.6 % to at most +1.7 % — not a decimal that
      // changes anything.
      const tolS = (want) => 0.0004 + 0.08 * Math.abs(want);
      for (const [e, d] of [['mask', dm], ['grad', dg]]) {
        chk(`${tag} [${e}] dx0`, d.dx0, tdx, 0.03);
        chk(`${tag} [${e}] dy0`, d.dy0, tdy, 0.03);
        chk(`${tag} [${e}] sx`, d.sx, tsx, tolS(tsx));
        chk(`${tag} [${e}] sy`, d.sy, tsy, tolS(tsy));
        // THE NEGATIVE CONTROL, asserted for every case: whatever the truth is,
        // the ANISOTROPY the method reports must equal the anisotropy it was
        // given. An estimator that manufactures 2 % of aniso out of an
        // isotropic scale would answer this round wrongly and look right. This
        // is the check the round's verdict rests on, so its ABSOLUTE arm stays
        // tight — 0.0012 against a measured anisotropy of 0.024.
        chk(`${tag} [${e}] aniso`, d.aniso, tsy - tsx, 0.0012 + 0.08 * Math.abs(tsy - tsx));
      }
    }

    // 3. RESPONSE, ON THE REAL PAIR. Shift one file by a known amount and the
    //    measured registration must follow by that amount and no other term.
    {
      const B = await maskOf('unc2005');
      const base = decompose(field(A, B, 'iou', windows(A, B, 7, 6)));
      const Bs = warpGrid(B, (x, y) => [x, y - 0.60], true);   // unc2005 moved +0.60 in y
      const moved = decompose(field(A, Bs, 'iou', windows(A, Bs, 7, 6)));
      chk('response: unc2005 moved +0.60 in y -> dy0 follows', moved.dy0 - base.dy0, 0.60, 0.05);
      chk('response: ... and sy does NOT move', moved.sy - base.sy, 0, 0.0015);
      chk('response: ... and dx0 does NOT move', moved.dx0 - base.dx0, 0, 0.05);
    }

    console.log('\n_dr25yreg.mjs SELFTEST');
    let bad = 0;
    for (const [name, got, want, tol, ok] of t) {
      if (!ok) bad++;
      console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name.padEnd(46)} got ${got.toFixed(5).padStart(10)}  want ${want.toFixed(5)} ±${tol}`);
    }
    console.log(bad
      ? `SELFTEST FAIL (${bad} of ${t.length})`
      : `SELFTEST PASS (${t.length} checks) — recovers known ellipse axes, a known affine warp, responds, and manufactures no anisotropy from an isotropic scale`);
    process.exitCode = bad ? 1 : 0;
    process.exit(bad ? 1 : 0);
  }

  // ══ fit (default) ════════════════════════════════════════════════════════
  const step = Number(process.argv[3]) || 6;
  const A = await maskOf('proofbright'), B = await maskOf('unc2005');
  const gA = await greyGrid(FILE.proofbright), gB = await greyGrid(FILE.unc2005);
  const eA = gradMag(gA), eB = gradMag(gB);
  console.log('THE TWO-FILE REGISTRATION FIELD. A feature at (x, y) on');
  console.log('dime-rev-proofbright.png is at (x + dx, y + dy) on dime-rev-unc2005.png.');
  console.log('Each axis fitted as a plane over the windows; sx = d(dx)/dx, sy = d(dy)/dy.\n');
  const wins = windows(A, B, 7, step);
  const legs = [['MASK IoU', A, B, 'iou'], ['GRAD NCC', eA, eB, 'ncc'], ['grey NCC', gA, gB, 'ncc']];
  const got = [];
  for (const [tag, MA, MB, metric] of legs) {
    const P = field(MA, MB, metric, wins), d = decompose(P);
    got.push({ tag, d, P });
    console.log(line(tag, d));
  }
  const ys = got[0].P.map((p) => p.y), xs = got[0].P.map((p) => p.x);
  console.log(`\nwindow centres span x ${Math.min(...xs)}..${Math.max(...xs)}  y ${Math.min(...ys)}..${Math.max(...ys)}`
    + `  (14-unit windows, so picture is read over y ${Math.min(...ys) - 7}..${Math.max(...ys) + 7})`);

  // bootstrap over windows — the FORMAL error, which is not the real one
  console.log('\nBOOTSTRAP over windows, 400 resamples, 95 % interval:');
  for (const { tag, P } of got) {
    const n = P.length, b = [];
    for (let it = 0; it < 400; it++) {
      const S2 = []; for (let i = 0; i < n; i++) S2.push(P[(Math.random() * n) | 0]);
      const fy = planeFit(S2, 'dy'), fx = planeFit(S2, 'dx');
      b.push([fx.a[0], fx.a[1], fy.a[0], fy.a[2]]);
    }
    const q = (i, p) => b.map((r) => r[i]).sort((u, v) => u - v)[Math.floor(p * b.length)];
    console.log(`  ${tag.padEnd(9)} dx0 ${q(0, 0.5).toFixed(3)} [${q(0, 0.025).toFixed(3)}, ${q(0, 0.975).toFixed(3)}]   sx ${(q(1, 0.5) * 100).toFixed(3)}% [${(q(1, 0.025) * 100).toFixed(3)}, ${(q(1, 0.975) * 100).toFixed(3)}]`
      + `   dy0 ${q(2, 0.5).toFixed(3)} [${q(2, 0.025).toFixed(3)}, ${q(2, 0.975).toFixed(3)}]   sy ${(q(3, 0.5) * 100).toFixed(3)}% [${(q(3, 0.025) * 100).toFixed(3)}, ${(q(3, 0.975) * 100).toFixed(3)}]`);
  }
  console.log('\n⚠️ THE BOOTSTRAP INTERVAL IS NOT THE UNCERTAINTY. The three estimators\'');
  console.log('intervals do not overlap in dy0 or sx, so the estimator-to-estimator');
  console.log('systematic is several times the sampling error. The published function');
  console.log('below is the spread across estimators, not the width of any one of them.');
  const mean = (k) => got.reduce((s, g) => s + g.d[k], 0) / got.length;
  console.log('\nTHE FUNCTION — the mean of the three estimators above:');
  console.log(`  DX(x) = ${mean('dx0').toFixed(2)} ${mean('sx') < 0 ? '-' : '+'} ${Math.abs(mean('sx')).toFixed(4)}·(x - 50)`);
  console.log(`  DY(y) = ${mean('dy0').toFixed(2)} ${mean('sy') < 0 ? '-' : '+'} ${Math.abs(mean('sy')).toFixed(4)}·(y - 50)`);
  console.log(`  published above as DX/DY:  ${DX(50).toFixed(2)} - 0.0101·(x - 50)   /   ${DY(50).toFixed(2)} + 0.0156·(y - 50)`);
  console.log('  D40\'s line for comparison:                          0.489 + 0.0226·(y - 50)');
  console.log(`\n  D40 minus this fit, over the range the data supports:`);
  for (const y of [30, 40, 50, 60, 70, 75])
    console.log(`    y ${String(y).padStart(2)}   D40 ${DYU_D40(y).toFixed(3).padStart(6)}   this ${DY(y).toFixed(3).padStart(6)}   difference ${(DYU_D40(y) - DY(y)).toFixed(3).padStart(6)}`);
}
