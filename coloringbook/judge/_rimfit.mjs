// THE DISC IS FITTED AT THE RIM. ONE IMPLEMENTATION, WITH ITS ERROR MEASURED.
//
// ── WHY THIS FILE EXISTS (ledger A9/A10) ───────────────────────────────────
// About ten live instruments carry a private copy of the same helper, usually
// called `discOf()`:
//
//     let n = 0; for (every pixel) if (|grey - bg| > tol) n++;
//     return { cx, cy, R: Math.sqrt(n / Math.PI) };
//
// That is the radius of a circle with the same AREA as the threshold mask. It
// is not the rim, and it is not wrong by a constant: it is wrong by however
// much of the coin the threshold happened to catch. Measured failures already
// on record: −12.1 % on a cent file, −31.75 % on a nickel file, −1.94 % to
// −15.47 % across nine dime obverses, −7.89 % / −14.90 % on the quarter.
//
// Two things that were said about this and are NOT the explanation:
//
//   · "it only fails on proofs." No. A cameo proof is the worst case because a
//     frosted device on a mirror field breaks the threshold, but the estimator
//     is wrong in kind on every image. The quantity that decides the error is
//     the DEVICE / FIELD / SURROUND relationship — how much of the coin the
//     threshold keeps, and how much of the surround it wrongly keeps — not the
//     strike.
//   · "it is close enough for an overlay." An overlay registered on an R that
//     is 12 % small draws our art 12 % large on the photograph, which flatters
//     containment and shifts every feature outward. `_nk3over.mjs` had exactly
//     this, on top of a separate 6 % scale error, and the judge published a
//     reading taken from the flattered picture.
//
// The rule is: ALWAYS FIT THE RIM. The area fit is kept here, exported, and
// printed beside the rim fit — as the error term, never as a coordinate.
//
// ── HOW THIS ONE IS DIFFERENT FROM `_dr1disc.mjs` ──────────────────────────
// `_dr1disc.mjs` and `_qr2disc.mjs` are good rim fitters and were not touched.
// This is a THIRD, deliberately independent implementation, so that the two can
// null-test each other (§4.1, and the standard `_dr9branch.mjs` set: null-test
// against a DIFFERENT estimator, not against yourself):
//
//   `_dr1disc`  steps inward in 0.5 px and takes the last pixel whose value
//               differs from the background — a NEAREST-PIXEL edge, quantised
//               to the step, read off the raw pixel grid.
//   this file   samples the grey profile BILINEARLY at continuous coordinates
//               and bisects to the HALF-MAX crossing of the coin's own contrast,
//               which is the unbiased edge of an antialiased step. Circle solve
//               is Taubin rather than Kasa, which is unbiased on partial arcs
//               where Kasa is not.
//
// Agreement between two estimators that share no code and no edge model is
// evidence. Agreement between an estimator and itself is not.
//
// It is checked against something stronger than another estimator first:
// SYNTHETIC DISCS OF KNOWN RADIUS. On R = 80 / 137.5 / 220 it returns 79.998 /
// 137.486 / 219.990 with the centre inside 0.007 px. Only then is the agreement
// with `_dr1disc` (mean −0.078 % over the four dime-reverse references)
// evidence of anything. And the failure being replaced is demonstrated in the
// same selftest: on a synthetic ANNULUS — the cameo-proof shape — the rim fit
// is still exact and the area fit reads −19.65 %.
//
// REPORTS ONLY (judge/WRITERS.md): reads `ref/`, writes nothing.
//
//   node coloringbook/judge/_rimfit.mjs                 -> selftest
//   node coloringbook/judge/_rimfit.mjs audit [file...] -> rim vs area, per file
import sharp from 'sharp';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { REF } from './_paths.mjs';

// ── pixels ──────────────────────────────────────────────────────────────────
/** Greyscale with alpha flattened onto white — the surface everything reads. */
export async function grey(fileOrBuf) {
  const src = Buffer.isBuffer(fileOrBuf) ? fileOrBuf : join(REF, fileOrBuf);
  const { data, info } = await sharp(src).flatten({ background: '#ffffff' })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
}

/** Background level: median of the four 12x12 corner patches. */
export function background(g) {
  const { d, w, h } = g, v = [];
  for (const [ox, oy] of [[0, 0], [w - 12, 0], [0, h - 12], [w - 12, h - 12]])
    for (let y = oy; y < oy + 12; y++) for (let x = ox; x < ox + 12; x++) v.push(d[y * w + x]);
  v.sort((a, b) => a - b);
  return v[v.length >> 1];
}

// ── the estimator we are replacing, kept so its error can be printed ────────
/** THE LEGACY AREA FIT. R = sqrt(area/pi). Never use this for a coordinate. */
export function areaFit(g, tol = 25) {
  const bg = background(g);
  let n = 0, sx = 0, sy = 0;
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++)
    if (Math.abs(g.d[y * g.w + x] - bg) > tol) { n++; sx += x; sy += y; }
  return { cx: sx / n, cy: sy / n, R: Math.sqrt(n / Math.PI), n };
}

// ── circle solve: Taubin ────────────────────────────────────────────────────
// Unbiased on partial arcs, where Kasa (which minimises the ALGEBRAIC residual)
// pulls the radius in. On a full 1440-ray rim the two agree to <0.01 %, but the
// rejection passes below can leave long gaps and then the difference shows.
export function taubin(pts) {
  const n = pts.length;
  let mx = 0, my = 0;
  for (const [x, y] of pts) { mx += x; my += y; }
  mx /= n; my /= n;
  let Mz = 0, Mzz = 0, Mxz = 0, Myz = 0, Mxx = 0, Myy = 0, Mxy = 0;
  for (const [X, Y] of pts) {
    const x = X - mx, y = Y - my, z = x * x + y * y;
    Mz += z; Mzz += z * z; Mxz += x * z; Myz += y * z; Mxx += x * x; Myy += y * y; Mxy += x * y;
  }
  Mz /= n; Mzz /= n; Mxz /= n; Myz /= n; Mxx /= n; Myy /= n; Mxy /= n;
  const Cov = Mxx + Myy;
  const A3 = 4 * Mz, A2 = -3 * Mz * Mz - Mzz, A1 = Mzz * Mz + 4 * Mz * (Mxx * Myy - Mxy * Mxy) - Mxz * Mxz - Myz * Myz - Mz * Mz * Mz;
  const A0 = Mxz * Mxz * Myy + Myz * Myz * Mxx - Mzz * (Mxx * Myy - Mxy * Mxy) - 2 * Mxz * Myz * Mxy + Mz * Mz * (Mxx * Myy - Mxy * Mxy);
  const A22 = 2 * A2, A33 = 3 * A3;
  let x = 0, y = A0;
  for (let i = 0; i < 99; i++) {                       // Newton from zero
    const Dy = A1 + x * (A22 + A33 * x);
    const xn = x - y / Dy;
    if (!isFinite(xn) || xn === x) break;
    const yn = A0 + xn * (A1 + xn * (A2 + xn * A3));
    if (Math.abs(yn) >= Math.abs(y)) break;
    x = xn; y = yn;
  }
  const det = 2 * (x * x - x * Cov + (Mxx * Myy - Mxy * Mxy));
  const cx = (Mxz * (Myy - x) - Myz * Mxy) / det;
  const cy = (Myz * (Mxx - x) - Mxz * Mxy) / det;
  return { cx: cx + mx, cy: cy + my, R: Math.sqrt(cx * cx + cy * cy + Cov - 2 * x) };
}

// ── the rim fit ─────────────────────────────────────────────────────────────
/**
 * Ray-cast from the mask centroid, find the OUTERMOST threshold crossing on
 * each ray to SUB-PIXEL precision by linear interpolation of the grey profile,
 * solve by Taubin, reject at 2.5 sigma three times.
 *
 * Returns { cx, cy, R, p95pctR, rays, kept, onWindowEnd, areaR, areaErrPct }.
 * `onWindowEnd` is the §4.1 null report: rays whose crossing was never found
 * inside the search window are a SEARCH BOUND, not an edge, and a fit with many
 * of them is not a fit. `_jp1discs.json`'s `penny-rev-artwork.jpg` entry has
 * 244 of 720 and was published without a flag.
 */
export async function fitRim(fileOrBuf, opts = {}) {
  const g = await grey(fileOrBuf);
  const { d, w, h } = g;
  const bg = background(g);
  const T = opts.T ?? 24;
  const RAYS = opts.rays ?? 1440;
  // ── coordinates ──────────────────────────────────────────────────────────
  // Everything below is in CONTINUOUS image coordinates, where pixel index i
  // covers [i, i+1) and its SAMPLE sits at i + 0.5. Getting that convention
  // wrong is worth exactly half a pixel in each axis, which on a 175 px disc is
  // 0.4 % — small, systematic, and invisible unless you fit something whose
  // radius you already know. The selftest below fits synthetic discs for that
  // reason.
  const bilin = (X, Y) => {
    const x = X - 0.5, y = Y - 0.5;
    if (x < 0 || y < 0 || x > w - 1 || y > h - 1) return bg;
    const i = Math.min(w - 2, x | 0), j = Math.min(h - 2, y | 0), fx = x - i, fy = y - j;
    return d[j * w + i] * (1 - fx) * (1 - fy) + d[j * w + i + 1] * fx * (1 - fy)
      + d[(j + 1) * w + i] * (1 - fx) * fy + d[(j + 1) * w + i + 1] * fx * fy;
  };
  const dev = (X, Y) => Math.abs(bilin(X, Y) - bg);        // 0 on background

  // centroid of the threshold mask, as a starting point only
  let n = 0, mx = 0, my = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (Math.abs(d[y * w + x] - bg) > T) { n++; mx += x + 0.5; my += y + 0.5; }
  if (!n) throw new Error('_rimfit: the threshold mask is empty — check T against the background');
  mx /= n; my /= n;

  const rMax = Math.hypot(w, h) / 2;
  const STEP = 0.25;
  // ── A RAY THAT LANDS ON THE FRAME HAS NOT FOUND A RIM (ledger A28) ────────
  // The `rIn >= rMax - STEP` guard below only catches a ray that ran the whole
  // window without crossing. It does NOT catch the far commoner case: the coin
  // is CROPPED, so the ray crosses the threshold at the picture's edge, where
  // there is a real, sharp, high-contrast step — the frame — and the fitter
  // takes it for the rim. Nothing about that crossing looks wrong locally.
  //
  // `penny-rev.jpg` is the case that found this. Its disc runs about 11 px off
  // the left of the frame; 529 of the 2301 rays another fitter scores (23 %)
  // terminate on the boundary at 155°-208°, and the residual they produce is a
  // STRAIGHT CHORD (+9.9 at 150°, -9.4 at 180°, +12.6 at 210°) — not an
  // ellipse's smooth two-cycle. The file was read as "NOT SQUARE-ON, get a
  // better photograph" for that reason, and the coin is in fact perfectly
  // square-on: it is short of margin, not flat to the sensor.
  //
  // So a crossing within `frameMargin` of any border is discarded and counted.
  // It is on by default because there is no situation in which the picture's
  // own edge is evidence about a coin's rim. `onFrame` is reported beside the
  // fit so the reader can see how much of the circle actually got measured.
  const frameMargin = opts.frameMargin ?? 1.0;
  let pts = [], onWindowEnd = 0, onFrame = 0;
  for (let k = 0; k < RAYS; k++) {
    const th = (2 * Math.PI * k) / RAYS, cs = Math.cos(th), sn = Math.sin(th);
    // walk in until dev crosses T, then solve the crossing by HALF-MAX, which
    // is the unbiased edge for an antialiased step. Interpolating to a fixed
    // absolute T instead lands wherever the contrast happens to put it — on a
    // 185-level step with T = 24 that is 0.87 of the way across the bracket,
    // and the whole disc comes out half a pixel large.
    let rIn = null;
    for (let r = rMax; r > 4; r -= STEP) {
      if (dev(mx + cs * r, my + sn * r) > T) { rIn = r; break; }
    }
    if (rIn === null) { onWindowEnd++; continue; }
    if (rIn >= rMax - STEP) { onWindowEnd++; continue; }    // the coin touches the frame
    // plateau level a short way inside, so half-max is measured against the
    // coin's own contrast rather than against the threshold constant
    const plateau = dev(mx + cs * (rIn - 3), my + sn * (rIn - 3));
    const half = Math.max(T, plateau / 2);
    // step further in until the profile reaches half-max, then bisect
    let lo = null;
    for (let r = rIn; r > rIn - 6 && r > 4; r -= STEP)
      if (dev(mx + cs * r, my + sn * r) >= half) { lo = r; break; }
    if (lo === null) { onWindowEnd++; continue; }
    let hi = rIn + STEP;                                    // dev(hi) <= T <= half
    for (let b = 0; b < 24; b++) {
      const m = (lo + hi) / 2;
      if (dev(mx + cs * m, my + sn * m) >= half) lo = m; else hi = m;
    }
    const r = (lo + hi) / 2;
    const px = mx + cs * r, py = my + sn * r;
    if (frameMargin > 0 && (px <= frameMargin || py <= frameMargin
      || px >= w - frameMargin || py >= h - frameMargin)) { onFrame++; continue; }
    pts.push([px, py]);
  }
  if (pts.length < 32) throw new Error(`_rimfit: only ${pts.length} rim points — not a fit`);

  let fit = taubin(pts);
  for (let it = 0; it < 3; it++) {
    const res = pts.map(([x, y]) => Math.hypot(x - fit.cx, y - fit.cy) - fit.R);
    const mu = res.reduce((s, v) => s + v, 0) / res.length;
    const sd = Math.sqrt(res.reduce((s, v) => s + (v - mu) ** 2, 0) / res.length);
    if (!(sd > 0)) break;
    const keep = pts.filter((_, i) => Math.abs(res[i] - mu) < 2.5 * sd);
    if (keep.length < 32) break;
    pts = keep; fit = taubin(pts);
  }
  const res = pts.map(([x, y]) => Math.abs(Math.hypot(x - fit.cx, y - fit.cy) - fit.R)).sort((a, b) => a - b);
  const a = areaFit(g, opts.areaTol ?? 25);
  return {
    cx: +fit.cx.toFixed(3), cy: +fit.cy.toFixed(3), R: +fit.R.toFixed(3),
    p95pctR: +((res[Math.floor(res.length * 0.95)] / fit.R) * 100).toFixed(3),
    rays: RAYS, kept: pts.length, onWindowEnd, onFrame,
    arcDeg: +((360 * pts.length) / RAYS).toFixed(1),   // how much of the circle was actually measured
    areaR: +a.R.toFixed(3), areaErrPct: +(((a.R - fit.R) / fit.R) * 100).toFixed(2),
    w, h, bg,
  };
}

/** viewBox (0..100, coin centred 50,50 drawn at r 47) -> source pixel. */
export const mapper = (disc) => (X, Y) => [disc.cx + ((X - 50) / 47) * disc.R, disc.cy + ((Y - 50) / 47) * disc.R];

// ── CLI ─────────────────────────────────────────────────────────────────────
const synth = async (R, { cx = 300, cy = 300, W = 600, H = 600, inner = null, bg = 245, fg = 60 } = {}) => {
  let s = `<rect width="${W}" height="${H}" fill="rgb(${bg},${bg},${bg})"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${R}" fill="rgb(${fg},${fg},${fg})"/>`;
  // `inner` punches a bright device out of the middle: the cameo-proof shape, where
  // the threshold mask loses area the rim still has.
  if (inner) s += `<circle cx="${cx}" cy="${cy}" r="${inner}" fill="rgb(${bg},${bg},${bg})"/>`;
  return sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${s}</svg>`)).png().toBuffer();
};

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.argv[2] || 'selftest';

  if (mode === 'audit') {
    const files = process.argv.slice(3).length ? process.argv.slice(3)
      : ['penny-obv.jpg', 'penny-rev-2.png', 'nickel-obv.jpg', 'nickel-obv-proof.png', 'nickel-rev-proof.png',
        'dime-obv.jpg', 'dime-obv-proof1960.png', 'dime-rev-proofbright.png',
        'quarter-obv-2.jpg', 'quarter-rev-2.png'];
    console.log('RIM vs AREA — the error every private `discOf()` is carrying, per file');
    console.log('file                        rim cx      cy       R    p95%R  end |  area R   error');
    for (const f of files) {
      if (!existsSync(join(REF, f))) { console.log(`${f.padEnd(26)} (absent from ref/)`); continue; }
      const r = await fitRim(f);
      console.log(`${f.padEnd(26)} ${r.cx.toFixed(1).padStart(7)} ${r.cy.toFixed(1).padStart(7)} ${r.R.toFixed(2).padStart(8)} ${String(r.p95pctR).padStart(7)} ${String(r.onWindowEnd).padStart(4)} | ${r.areaR.toFixed(2).padStart(8)} ${(r.areaErrPct > 0 ? '+' : '') + r.areaErrPct}%`);
    }
    console.log('\n"end" = rays that never found a crossing inside the window (a search bound, not an edge).');
    console.log('"error" = how far the AREA fit is from the RIM fit, as a percentage of the rim radius.');
    process.exit(0);
  }

  // ── SELFTEST ──────────────────────────────────────────────────────────────
  const t = [];
  const chk = (name, got, want, tol) => t.push([name, got, want, tol, Math.abs(got - want) <= tol]);

  // 1. GROUND TRUTH. A synthetic disc has a radius we KNOW, which no reference
  //    photograph does. If the fitter cannot recover a number it was given, no
  //    agreement with another fitter means anything.
  for (const R of [80, 137.5, 220]) {
    const f = await fitRim(await synth(R));
    chk(`ground truth: plain disc R=${R}`, f.R, R, 0.25);
    chk(`ground truth: plain disc R=${R} centre`, Math.hypot(f.cx - 300, f.cy - 300), 0, 0.15);
  }

  // 2. THE FAILURE MODE, DEMONSTRATED. A bright device inside a dark field —
  //    the cameo-proof shape — is exactly what breaks the area fit. The rim is
  //    unchanged; the area is not. This is the number A9 is about.
  {
    const R = 200, inner = 120;
    const f = await fitRim(await synth(R, { inner }));
    chk('cameo shape: RIM still finds R=200', f.R, R, 0.25);
    const areaTrue = Math.sqrt((R * R - inner * inner));     // sqrt(area/pi) of an annulus
    chk('cameo shape: AREA fit is wrong by the predicted amount', f.areaR, areaTrue, 2.0);
    t.push(['  -> the area error it would have registered on', f.areaErrPct, f.areaErrPct, Infinity, true]);
  }

  // 2b. GROUND TRUTH ON A CLIPPED FRAME (ledger A28). The disc's radius is
  //     known and part of it is off the picture, which is `penny-rev.jpg`'s
  //     actual condition. Without the frame guard the fitter takes the
  //     picture's own edge for the rim; with it, the known radius comes back
  //     from the arc that remains. Both arms are asserted, because a guard
  //     whose absence changes nothing is not doing anything.
  {
    const R = 200;
    // 70 px off the left. A SHALLOW clip is not a test: at 10 px the sigma
    // rejection already removes the frame points on its own and the guard
    // changes nothing, so a test built there would assert that the guard is
    // pointless. The error the guard prevents grows with the clip — measured
    // on this synthetic at 10 / 40 / 70 / 100 / 120 px off frame it is
    // -0.01 / -1.22 / -13.69 / -23.63 / -31.25 px of R, and the guarded fit is
    // 199.99 at every one of them.
    const clipped = await synth(R, { cx: 130, W: 520, H: 600 });
    const on = await fitRim(clipped);
    const off = await fitRim(clipped, { frameMargin: 0 });
    chk('clipped frame: rim still finds R=200', on.R, R, 0.5);
    chk('clipped frame: centre still found', Math.hypot(on.cx - 130, on.cy - 300), 0, 0.5);
    t.push(['  -> rays discarded as frame, not rim', on.onFrame, on.onFrame, Infinity, true]);
    t.push([`  -> arc actually measured (deg)`, on.arcDeg, on.arcDeg, Infinity, true]);
    chk('clipped frame: WITHOUT the guard the fit is wrong', Math.abs(off.R - R) > 5.0 ? 1 : 0, 1, 0);
    t.push(['  -> what the unguarded fit returns for R', off.R, off.R, Infinity, true]);
  }

  // 3. RESPONSE. Change the subject, the number must follow.
  {
    const a = await fitRim(await synth(150));
    const b = await fitRim(await synth(180));
    chk('response: R 150 -> 180 follows', b.R - a.R, 30, 1.0);
    const c = await fitRim(await synth(150, { cx: 340 }));
    chk('response: centre moved +40 px follows', c.cx - a.cx, 40, 0.5);
  }

  // 4. NULL TEST AGAINST A DIFFERENT ESTIMATOR (§4.1, the `_dr9branch` standard).
  //    `_dr1disc.fitRim` shares no code with this file: nearest-pixel edge +
  //    Kasa, against sub-pixel interpolation + Taubin. Mean error should be ~0.
  const { fitRim: drFit, POOL } = await import('./_dr1disc.mjs');
  const errs = [];
  for (const f of POOL) {
    if (!existsSync(join(REF, f))) continue;
    const mine = await fitRim(f), theirs = await drFit(f);
    const e = 100 * (mine.R / theirs.R - 1);
    errs.push(e);
    t.push([`  cross-estimator ${f}`, +e.toFixed(3), 0, 0.6, Math.abs(e) <= 0.6]);
  }
  if (errs.length) {
    const mean = errs.reduce((a, b) => a + b, 0) / errs.length;
    chk(`cross-estimator MEAN error over ${errs.length} files (%)`, +mean.toFixed(3), 0, 0.25);
  } else {
    t.push(['cross-estimator null test', NaN, 0, 0, false]);
    console.log('  (ref/ is absent — the cross-estimator null test could not run)');
  }

  console.log('\n_rimfit.mjs SELFTEST');
  let bad = 0;
  for (const [name, got, want, tol, ok] of t) {
    if (!ok) bad++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name.padEnd(52)} got ${String(typeof got === 'number' ? got.toFixed(3) : got).padStart(9)}` +
      (tol === Infinity ? '' : `  want ${want.toFixed(3)} +-${tol}`));
  }
  console.log(bad ? `SELFTEST FAIL (${bad} of ${t.length})` : `SELFTEST PASS (${t.length} checks) — recovers a known radius, responds, and agrees with an independent estimator`);
  process.exitCode = bad ? 1 : 0;
}
