// SHARED PLUMBING FOR THE DIME-OBVERSE REVIEW INSTRUMENTS (`_do*.mjs`).
//
// Reports only; writes nothing outside the gitignored `judge/*.png` scratch
// (WRITERS.md). Self-contained on purpose: the gitignored `coloringbook/_rv*`
// helpers are ABSENT in an agent worktree, so an instrument that imports them
// cannot be re-run by whoever checks the round.
//
// COORDINATES. Everything is in the 100-unit viewBox `src/art/coins.js` draws
// in, where the BLANK's edge is r = 47 (`reededPath(n, 47, depth)`) and not
// half the box. Normalising a render by its width draws the device 6% small —
// the fault `_nk3over.mjs` records.
//
//   viewBox X  ->  reference pixel   px = cx + R*(X-50)/47
//   viewBox X  ->  our render pixel  px = W*X/100
//
// DISCS ARE RIM FITS, ALWAYS. `discOf()`'s `R = sqrt(area/pi)` is off by
// -1.8% to -31.7% depending on the file and the failure does not track the
// strike (see `_nkr1disc.mjs`). Every disc used here is produced by `rimFit()`
// below and its p95 residual is printed beside it.
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REF, ROOT } from './_paths.mjs';

// The nine dime-obverse references, in acquisition order.
export const POOL = [
  'dime-obv.jpg',
  'dime-obv-2.jpg',
  'dime-obv-3.jpg',
  'dime-obv-4.jpg',
  'dime-obv-unc2005.png',
  'dime-obv-pcgs2015.png',
  'dime-obv-proof1960.png',
  'dime-obv-proof1968.png',
  'dime-obv-proof2010.png',
];

export async function greyRaw(file) {
  const { data, info } = await sharp(file)
    .flatten({ background: '#ffffff' })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
}

export const at = (g, x, y) => {
  if (x < 0 || y < 0 || x >= g.w - 1 || y >= g.h - 1) return null;
  const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0, i = y0 * g.w + x0;
  return g.d[i] * (1 - fx) * (1 - fy) + g.d[i + 1] * fx * (1 - fy)
    + g.d[i + g.w] * (1 - fx) * fy + g.d[i + g.w + 1] * fx * fy;
};

export function bgOf(g) {
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

/** Kasa circle fit to the OUTERMOST background/foreground crossing on 720 rays. */
export function rimFit(g, tol = 30, nang = 720) {
  const bg = bgOf(g);
  let cx = g.w / 2, cy = g.h / 2, pts = [], R = 0;
  const rMax = Math.min(g.w, g.h) / 2 - 1;
  for (let it = 0; it < 8; it++) {
    pts = [];
    for (let k = 0; k < nang; k++) {
      const t = (2 * Math.PI * k) / nang, ct = Math.cos(t), st = Math.sin(t);
      for (let r = rMax; r > rMax * 0.35; r -= 0.25) {
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
    if (pts.length < 32) return null;
    let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, sz = 0, sxz = 0, syz = 0;
    for (const [x, y] of pts) {
      const z = x * x + y * y;
      sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y; sz += z; sxz += x * z; syz += y * z;
    }
    const [a, b, c] = solve3([[sxx, sxy, sx], [sxy, syy, sy], [sx, sy, pts.length]], [sxz, syz, sz]);
    cx = a / 2; cy = b / 2;
    R = Math.sqrt(c + cx * cx + cy * cy);
  }
  const res = pts.map(([x, y]) => Math.abs(Math.hypot(x - cx, y - cy) - R)).sort((p, q) => p - q);
  // ellipse check: p95 of |r - R| split by axis tells a tilt from a bad fit
  const ang = pts.map(([x, y]) => [Math.atan2(y - cy, x - cx), Math.hypot(x - cx, y - cy)]);
  let sxx2 = 0, sxy2 = 0, syy2 = 0, n = 0;
  for (const [t, r] of ang) { sxx2 += r * Math.cos(2 * t); syy2 += r * Math.sin(2 * t); n++; }
  const ecc = (2 * Math.hypot(sxx2 / n, syy2 / n)) / R;
  return { cx, cy, R, n: pts.length, p95: res[Math.floor(res.length * 0.95)], bg, ecc };
}

export function areaFit(g, tol = 25) {
  const bg = bgOf(g);
  let n = 0, sx = 0, sy = 0;
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    if (Math.abs(g.d[y * g.w + x] - bg) > tol) { n++; sx += x; sy += y; }
  }
  return { cx: sx / n, cy: sy / n, R: Math.sqrt(n / Math.PI) };
}

const _cache = new Map();
/** A viewBox sampler for one reference file, registered on its own RIM FIT. */
export async function samplerFor(file) {
  if (_cache.has(file)) return _cache.get(file);
  const g = await greyRaw(join(REF, file));
  const D = rimFit(g);
  if (!D) throw new Error(`_dolib: rim fit failed on ${file}`);
  const s = {
    file, g, disc: D,
    at: (x, y) => at(g, D.cx + (D.R * (x - 50)) / 47, D.cy + (D.R * (y - 50)) / 47),
    // pixels per viewBox unit
    ppu: D.R / 47,
  };
  _cache.set(file, s);
  return s;
}

/** A viewBox sampler over OUR OWN render of a face, at `px` device pixels. */
export async function samplerOurs(id = 'dime', side = 'obverse', px = 1600, opts = {}) {
  const { coinSVG } = await import(join(ROOT, 'src/art/coins.js'));
  const svg = coinSVG(id, px, { side, ...opts });
  const g = await greyRaw(Buffer.from(svg));
  return {
    file: `ours:${id}:${side}:${px}`, g, disc: null,
    at: (x, y) => at(g, (x / 100) * g.w, (y / 100) * g.h),
    ppu: g.w / 100,
  };
}

/** Median grey over a viewBox rectangle. */
export function med(s, x0, x1, y0, y1, step = 0.25) {
  const v = [];
  for (let x = x0; x <= x1; x += step) for (let y = y0; y <= y1; y += step) {
    const q = s.at(x, y);
    if (q != null) v.push(q);
  }
  v.sort((a, b) => a - b);
  return v.length ? v[v.length >> 1] : null;
}

export const bar = (v, lo, hi, n = 48) =>
  '#'.repeat(Math.max(0, Math.min(n, Math.round(((v - lo) / (hi - lo)) * n))));

/** sha256 of a reference file, for the independence table. */
export function sha(file) {
  return createHash('sha256').update(readFileSync(join(REF, file))).digest('hex');
}
