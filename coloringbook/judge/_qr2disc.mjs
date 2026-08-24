// QUARTER REVERSE, review sweep — RIM FIT for every candidate reference, and
// a pool-independence re-derivation. Reports only; writes nothing.
//
// ⚠️ RIM, NOT AREA. `discOf()`'s R = sqrt(area/pi) has failed on every face it
// was checked on (-12.1% cent, -31.75% nickel, -1.94%..-15.47% dime). Nothing
// here uses an area for a coordinate; the area R is printed for the record so
// the size of that error on THIS pool is on the page.
//
// Method is `_dr1disc.mjs`'s, re-implemented standalone (the brief's rule:
// gitignored helpers are absent in a worktree): background = median of the
// four corner patches; a pixel is coin if it differs by > T, or if alpha > 128
// on an alpha-matted file; 1440 rays from the mask centroid take the OUTERMOST
// coin pixel; Kasa least squares with three rounds of 2.5-sigma rejection;
// p95 residual reported as a percentage of R so a bad fit cannot hide.
//
// Run: node coloringbook/judge/_qr2disc.mjs
import sharp from 'sharp';
import { join } from 'node:path';
import { REF } from './_paths.mjs';

export const POOL = [
  'quarter-rev.jpg',
  'quarter-rev-2.png',
  'quarter-rev-3.jpg',
  'quarter-rev-5.jpg',
  'quarter-rev-6.jpg',
  'q1995d-rev.png',
  'qp1963-rev-pad.png',
  'qp1964-rev-pad.png',
];

export async function rgbaRaw(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
}

export async function greyRaw(file) {
  const { data, info } = await sharp(join(REF, file)).flatten({ background: '#ffffff' })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  if (data.length !== info.width * info.height) throw new Error('grey buffer length — UNTRUSTED');
  return { d: data, w: info.width, h: info.height };
}

function kasa(pts) {
  let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, sxz = 0, syz = 0, sz = 0;
  const n = pts.length;
  for (const [x, y] of pts) {
    const z = x * x + y * y;
    sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y;
    sxz += x * z; syz += y * z; sz += z;
  }
  const a11 = 2 * (sxx - (sx * sx) / n), a12 = 2 * (sxy - (sx * sy) / n);
  const a22 = 2 * (syy - (sy * sy) / n);
  const b1 = sxz - (sx * sz) / n, b2 = syz - (sy * sz) / n;
  const det = a11 * a22 - a12 * a12;
  const cx = (b1 * a22 - b2 * a12) / det, cy = (a11 * b2 - a12 * b1) / det;
  let ss = 0;
  for (const [x, y] of pts) ss += Math.hypot(x - cx, y - cy);
  return { cx, cy, R: ss / n };
}

export async function fitRim(file, opts = {}) {
  const { d, w, h } = await rgbaRaw(join(REF, file));
  const px = (i) => [d[i * 4], d[i * 4 + 1], d[i * 4 + 2], d[i * 4 + 3]];
  let transparent = 0;
  for (let i = 3; i < d.length; i += 4 * 97) if (d[i] < 128) transparent++;
  const useAlpha = transparent > (d.length / (4 * 97)) * 0.02;
  const cornerVals = [];
  for (const [ox, oy] of [[0, 0], [w - 12, 0], [0, h - 12], [w - 12, h - 12]]) {
    for (let y = oy; y < oy + 12; y++) for (let x = ox; x < ox + 12; x++) {
      const [r, gg, b, a] = px(y * w + x); const al = a / 255;
      cornerVals.push(0.299 * (r * al + 255 * (1 - al)) + 0.587 * (gg * al + 255 * (1 - al))
        + 0.114 * (b * al + 255 * (1 - al)));
    }
  }
  cornerVals.sort((a, b) => a - b);
  const bg = cornerVals[cornerVals.length >> 1];
  const T = opts.T ?? 24;
  const isCoin = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return false;
    const [r, gg, b, a] = px(y * w + x);
    if (useAlpha) return a > 128;
    const al = a / 255;
    const v = 0.299 * (r * al + 255 * (1 - al)) + 0.587 * (gg * al + 255 * (1 - al))
      + 0.114 * (b * al + 255 * (1 - al));
    return Math.abs(v - bg) > T;
  };
  let n = 0, mx = 0, my = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (isCoin(x, y)) { n++; mx += x; my += y; }
  mx /= n; my /= n;
  const RAYS = 1440, rMax = Math.hypot(w, h) / 2;
  let pts = [];
  for (let k = 0; k < RAYS; k++) {
    const th = (2 * Math.PI * k) / RAYS, cs = Math.cos(th), sn = Math.sin(th);
    for (let r = rMax; r > 4; r -= 0.5) {
      if (isCoin(Math.round(mx + cs * r), Math.round(my + sn * r))) { pts.push([mx + cs * r, my + sn * r]); break; }
    }
  }
  let fit = kasa(pts);
  for (let it = 0; it < 3; it++) {
    const res = pts.map(([x, y]) => Math.hypot(x - fit.cx, y - fit.cy) - fit.R);
    const mu = res.reduce((a, b) => a + b, 0) / res.length;
    const sd = Math.sqrt(res.reduce((a, b) => a + (b - mu) ** 2, 0) / res.length);
    pts = pts.filter((_, i) => Math.abs(res[i] - mu) < 2.5 * sd);
    fit = kasa(pts);
  }
  const res = pts.map(([x, y]) => Math.abs(Math.hypot(x - fit.cx, y - fit.cy) - fit.R)).sort((a, b) => a - b);
  const areaR = Math.sqrt(n / Math.PI);
  return {
    file, w, h, bg: +bg.toFixed(1), useAlpha,
    cx: +fit.cx.toFixed(2), cy: +fit.cy.toFixed(2), R: +fit.R.toFixed(2),
    p95pctR: +((res[Math.floor(res.length * 0.95)] / fit.R) * 100).toFixed(3),
    kept: pts.length, areaR: +areaR.toFixed(2),
    areaErrPct: +(((areaR - fit.R) / fit.R) * 100).toFixed(2),
  };
}

/** viewBox (0..100, coin centred 50,50 at r 47) -> source pixel */
export function mapper(disc) {
  return (X, Y) => [disc.cx + ((X - 50) / 47) * disc.R, disc.cy + ((Y - 50) / 47) * disc.R];
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  for (const f of POOL) {
    const r = await fitRim(f);
    console.log(
      `${f.padEnd(22)} ${String(r.w).padStart(4)}x${String(r.h).padStart(4)}  ` +
      `${r.useAlpha ? 'ALPHA   ' : 'bg=' + String(r.bg).padStart(5)}  ` +
      `cx ${String(r.cx).padStart(7)} cy ${String(r.cy).padStart(7)} R ${String(r.R).padStart(7)}  ` +
      `p95 ${String(r.p95pctR).padStart(6)}% of R  | areaR ${String(r.areaR).padStart(7)} (${r.areaErrPct > 0 ? '+' : ''}${r.areaErrPct}%)`,
    );
  }
}
