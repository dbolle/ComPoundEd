// DIME REVERSE — round 1. RIM FIT for the four reverse references.
//
// Reports only; writes nothing (WRITERS.md).
//
// WHY THIS EXISTS. `judge/_jd1discs.json` carries fits for `dime-rev.jpg` and
// `dime-rev-2.jpg` only. The two references acquired since — `dime-rev-
// proofbright.png` and `dime-rev-unc2005.png` — have NO published disc, and
// `torch()` in coins.js quotes numbers off `dime-rev-unc2005.png` "fitted here
// by row and column profiles at threshold 225, because no published fit for
// this file exists anywhere in judge/; that is a gap, not a claim". This
// closes the gap.
//
// ⚠️ RIM, NOT AREA. `discOf()`'s R = sqrt(area/pi) has now failed on every face
// it was checked on (-12.1% on a cent file, -31.75% on a nickel file, -1.94%
// to -15.47% across nine dime obverses). Nothing here uses an area.
//
// METHOD. Background is the median of the four corner patches. A pixel is
// "coin" if it differs from the background by more than `T` (or, on an RGBA
// file, if alpha > 128 — an alpha matte is an exact silhouette and is used in
// preference to any threshold). Rays are cast from the mask centroid; the
// OUTERMOST coin pixel on each ray is a rim point. Those points are fitted by
// Kasa least squares with three rounds of 2.5-sigma rejection, and the p95
// residual is reported as a percentage of R so a bad fit cannot hide.
//
// Run: node coloringbook/judge/_dr1disc.mjs
import sharp from 'sharp';
import { join } from 'node:path';
import { REF } from './_paths.mjs';

export const POOL = [
  'dime-rev.jpg',
  'dime-rev-2.jpg',
  'dime-rev-proofbright.png',
  'dime-rev-unc2005.png',
];

export async function rgbaRaw(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
}

/** Greyscale, alpha flattened onto white — the sampling surface. */
export async function greyRaw(file) {
  const { data, info } = await sharp(file).flatten({ background: '#ffffff' })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
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
  const g = await rgbaRaw(join(REF, file));
  const { d, w, h } = g;
  const px = (i) => [d[i * 4], d[i * 4 + 1], d[i * 4 + 2], d[i * 4 + 3]];
  // is the file alpha-matted? (any interior pixel fully transparent)
  let transparent = 0;
  for (let i = 3; i < d.length; i += 4 * 97) if (d[i] < 128) transparent++;
  const useAlpha = transparent > (d.length / (4 * 97)) * 0.02;
  // background level from the four corners (greyscale over white)
  const cornerVals = [];
  for (const [ox, oy] of [[0, 0], [w - 12, 0], [0, h - 12], [w - 12, h - 12]]) {
    for (let y = oy; y < oy + 12; y++) for (let x = ox; x < ox + 12; x++) {
      const [r, gg, b, a] = px(y * w + x);
      const al = a / 255;
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
  // centroid of the mask
  let n = 0, mx = 0, my = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (isCoin(x, y)) { n++; mx += x; my += y; }
  mx /= n; my /= n;
  // outermost coin pixel on each of 1440 rays
  const RAYS = 1440, rMax = Math.hypot(w, h) / 2;
  let pts = [];
  for (let k = 0; k < RAYS; k++) {
    const th = (2 * Math.PI * k) / RAYS, cs = Math.cos(th), sn = Math.sin(th);
    let last = -1;
    for (let r = rMax; r > 4; r -= 0.5) {
      if (isCoin(Math.round(mx + cs * r), Math.round(my + sn * r))) { last = r; break; }
    }
    if (last > 0) pts.push([mx + cs * last, my + sn * last]);
  }
  let fit = kasa(pts);
  for (let it = 0; it < 3; it++) {
    const res = pts.map(([x, y]) => Math.hypot(x - fit.cx, y - fit.cy) - fit.R);
    const mu = res.reduce((a, b) => a + b, 0) / res.length;
    const sd = Math.sqrt(res.reduce((a, b) => a + (b - mu) ** 2, 0) / res.length);
    pts = pts.filter((_, i) => Math.abs(res[i] - mu) < 2.5 * sd);
    fit = kasa(pts);
  }
  const res = pts.map(([x, y]) => Math.abs(Math.hypot(x - fit.cx, y - fit.cy) - fit.R))
    .sort((a, b) => a - b);
  // the AREA disc, for the record only — never used for a coordinate
  const areaR = Math.sqrt(n / Math.PI);
  return {
    file, w, h, bg: +bg.toFixed(1), useAlpha,
    cx: +fit.cx.toFixed(2), cy: +fit.cy.toFixed(2), R: +fit.R.toFixed(2),
    p95pctR: +((res[Math.floor(res.length * 0.95)] / fit.R) * 100).toFixed(3),
    kept: pts.length,
    areaR: +areaR.toFixed(2),
    areaErrPct: +(((areaR - fit.R) / fit.R) * 100).toFixed(2),
  };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const out = {};
  for (const f of POOL) {
    const r = await fitRim(f);
    out[f] = r;
    console.log(
      `${f.padEnd(26)} ${r.w}x${r.h}  ${r.useAlpha ? 'ALPHA' : 'bg=' + r.bg}  ` +
      `cx ${r.cx} cy ${r.cy} R ${r.R}  p95 ${r.p95pctR}% of R  ` +
      `| area R ${r.areaR} (${r.areaErrPct > 0 ? '+' : ''}${r.areaErrPct}%)`,
    );
  }
  console.log('\nfrozen _jd1discs.json for comparison:');
  const { readFileSync } = await import('node:fs');
  const { JUDGE } = await import('./_paths.mjs');
  const D = JSON.parse(readFileSync(join(JUDGE, '_jd1discs.json'), 'utf8'));
  for (const f of POOL) {
    if (!D[f]) { console.log(`  ${f.padEnd(26)} NO PUBLISHED FIT`); continue; }
    const a = D[f], b = out[f];
    console.log(`  ${f.padEnd(26)} published cx ${a.cx} cy ${a.cy} R ${a.R} ` +
      `-> rim fit differs dR ${(b.R - a.R).toFixed(2)} (${(((b.R - a.R) / a.R) * 100).toFixed(2)}%) ` +
      `dc ${Math.hypot(b.cx - a.cx, b.cy - a.cy).toFixed(2)} px`);
  }
}
