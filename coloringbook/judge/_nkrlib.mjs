// SHARED PLUMBING FOR THE NICKEL-REVERSE INSTRUMENTS (`_nkr*.mjs`).
//
// Reports only. Writes nothing outside the gitignored `judge/*.png` scratch,
// never touches `ref/`, a `*-history.jsonl` or a frozen `.json` (WRITERS.md).
//
// It deliberately does NOT import `coloringbook/_rvnorm.mjs`: that file is
// gitignored, so it is absent in a fresh checkout and in every agent worktree,
// and a round that cannot re-run the instruments cannot check the round. The
// three discs it needs are read from `judge/_jn1discs.json`, which IS tracked
// and IS frozen — and which this round verified against an independent rim fit
// (`_nkr1disc.mjs`): −0.38% / +0.18% / −0.04% of R, under 3 px of centre.
//
// COORDINATES. Everything is in the 100-unit viewBox `src/art/coins.js` draws
// in, where the blank's edge is r = 47 (`reededPath(n, 47, depth)`) and NOT
// half the width. Normalising our own render by its width draws our device 6%
// small and flatters every placement — the fault `_nk3over.mjs` records.
//
//   viewBox X  ->  reference pixel   px = cx + R*(X-50)/47
//   viewBox X  ->  our render pixel  px = W*X/100
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REF, JUDGE, ROOT } from './_paths.mjs';

export const DISCS = JSON.parse(readFileSync(join(JUDGE, '_jn1discs.json'), 'utf8'));
export const POOL = ['nickel-rev.jpg', 'nickel-rev-2.png', 'nickel-rev-proof.png'];

export async function greyRaw(file) {
  const { data, info } = await sharp(file).flatten({ background: '#ffffff' }).greyscale()
    .raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
}

const bilinear = (g, X, Y) => {
  if (X < 0 || Y < 0 || X >= g.w - 1 || Y >= g.h - 1) return 255;
  const x0 = X | 0, y0 = Y | 0, fx = X - x0, fy = Y - y0, i = y0 * g.w + x0;
  return g.d[i] * (1 - fx) * (1 - fy) + g.d[i + 1] * fx * (1 - fy)
    + g.d[i + g.w] * (1 - fx) * fy + g.d[i + g.w + 1] * fx * fy;
};

/** A viewBox sampler for one reference, or for our own nickel reverse. */
export async function samplerFor(file) {
  if (file === 'ours') {
    const { coinSVG } = await import(join(ROOT, 'src/art/coins.js'));
    const g = await greyRaw(Buffer.from(coinSVG('nickel', 1600, { side: 'reverse' })));
    return { at: (x, y) => bilinear(g, (x / 100) * g.w, (y / 100) * g.h), disc: null };
  }
  const D = DISCS[file];
  if (!D) throw new Error(`_nkrlib: no frozen disc for ${file} in _jn1discs.json`);
  const g = await greyRaw(join(REF, file));
  return {
    at: (x, y) => bilinear(g, D.cx + (D.R * (x - 50)) / 47, D.cy + (D.R * (y - 50)) / 47),
    disc: D,
  };
}

/** Median grey over a viewBox rectangle — used for field and device levels. */
export function med(at, x0, x1, y0, y1, s = 0.25) {
  const v = [];
  for (let x = x0; x <= x1; x += s) for (let y = y0; y <= y1; y += s) v.push(at(x, y));
  v.sort((a, b) => a - b);
  return v[v.length >> 1];
}

/**
 * Field and device levels, reported not assumed.
 *  field  the bare arc between MONTICELLO and the building, y 63.5..65.5
 *  device the middle of the left wing wall, y 51..54 — device on all three
 * A separation under 25 grey levels means the file does not segment and the
 * caller must say so rather than publish a threshold.
 */
export function levels(at) {
  const field = med(at, 20, 80, 63.5, 65.5, 0.5);
  const device = med(at, 24, 30, 51, 54);
  return { field, device, T: (field + device) / 2, up: device > field, sep: Math.abs(device - field) };
}

export const bar = (v, lo, hi, n = 56) => '#'.repeat(Math.max(0, Math.round(((v - lo) / (hi - lo)) * n)));
