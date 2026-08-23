// DIME REVERSE — round 1. Disc-normalised, GRIDDED crops of the reference pool
// and of our own render, so every number quoted in `torch()` can be re-read on
// the picture it came from.
//
// Reports only: every file it writes goes to the gitignored judge scratch under
// `_dr2-*.png` (WRITERS.md — nothing in `ref/`, no frozen json, no history).
//
// COORDINATES. viewBox X -> reference pixel px = cx + R*(X-50)/47, using the
// RIM fit from `_dr1disc.mjs` (never the area disc). Our own render is sampled
// px = W*X/100, because `coinSVG` draws the blank at r = 47 of the same viewBox.
//
// Run: node coloringbook/judge/_dr2grid.mjs [x0 x1 y0 y1] [pxPerUnit]
import sharp from 'sharp';
import { join } from 'node:path';
import { SCRATCH, ROOT, REF } from './_paths.mjs';
import { POOL, fitRim, greyRaw } from './_dr1disc.mjs';

const bilinear = (g, X, Y) => {
  if (X < 0 || Y < 0 || X >= g.w - 1 || Y >= g.h - 1) return 255;
  const x0 = X | 0, y0 = Y | 0, fx = X - x0, fy = Y - y0, i = y0 * g.w + x0;
  return g.d[i] * (1 - fx) * (1 - fy) + g.d[i + 1] * fx * (1 - fy)
    + g.d[i + g.w] * (1 - fx) * fy + g.d[i + g.w + 1] * fx * fy;
};

/** A viewBox sampler for one reference file, or 'ours'. */
export async function samplerFor(file, size = 1600) {
  if (file === 'ours') {
    const { coinSVG } = await import(join(ROOT, 'src/art/coins.js'));
    const g = await greyRaw(Buffer.from(coinSVG('dime', size, { side: 'reverse' })));
    return { at: (x, y) => bilinear(g, (x / 100) * g.w, (y / 100) * g.h), disc: null, g };
  }
  const D = await fitRim(file);
  const g = await greyRaw(join(REF, file));
  return {
    at: (x, y) => bilinear(g, D.cx + (D.R * (x - 50)) / 47, D.cy + (D.R * (y - 50)) / 47),
    disc: D, g,
  };
}

export async function crop(file, x0, x1, y0, y1, ppu, out) {
  const s = await samplerFor(file);
  const W = Math.round((x1 - x0) * ppu), H = Math.round((y1 - y0) * ppu);
  const buf = Buffer.alloc(W * H * 3);
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const v = Math.max(0, Math.min(255, Math.round(s.at(x0 + i / ppu, y0 + j / ppu))));
      const k = (j * W + i) * 3;
      buf[k] = buf[k + 1] = buf[k + 2] = v;
    }
  }
  // grid: red every 5 units, brighter red every 10
  for (let X = Math.ceil(x0 / 5) * 5; X <= x1; X += 5) {
    const i = Math.round((X - x0) * ppu);
    if (i < 0 || i >= W) continue;
    for (let j = 0; j < H; j++) {
      const k = (j * W + i) * 3;
      buf[k] = 255; buf[k + 1] = X % 10 === 0 ? 0 : 140; buf[k + 2] = X % 10 === 0 ? 0 : 140;
    }
  }
  for (let Y = Math.ceil(y0 / 5) * 5; Y <= y1; Y += 5) {
    const j = Math.round((Y - y0) * ppu);
    if (j < 0 || j >= H) continue;
    for (let i = 0; i < W; i++) {
      const k = (j * W + i) * 3;
      buf[k] = 255; buf[k + 1] = Y % 10 === 0 ? 0 : 140; buf[k + 2] = Y % 10 === 0 ? 0 : 140;
    }
  }
  await sharp(buf, { raw: { width: W, height: H, channels: 3 } }).png()
    .toFile(join(SCRATCH, out));
  return { out, W, H, disc: s.disc };
}

if (process.argv[1] && process.argv[1].endsWith('_dr2grid.mjs')) {
  const a = process.argv.slice(2).map(Number);
  const [x0, x1, y0, y1] = a.length >= 4 ? a : [4, 96, 4, 96];
  const ppu = a[4] || 12;
  for (const f of [...POOL, 'ours']) {
    const tag = f.replace(/[^a-z0-9]/gi, '_');
    const r = await crop(f, x0, x1, y0, y1, ppu, `_dr2-${tag}.png`);
    console.log(`${f.padEnd(26)} -> ${r.out} ${r.W}x${r.H}`);
  }
}
