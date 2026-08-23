// QUARTER OBVERSE — a viewBox-gridded zoom of any window, on every reference
// this face is ALLOWED to use, beside the same window of our own render.
//
// WHY IT IS SELF-CONTAINED. A round worktree has none of the gitignored
// `coloringbook/_*.mjs` helpers except the two this imports, and every private
// copy of the AREA `discOf()` in this library is off a rim fit by -1.9% to
// -31.8%. This uses `_rvdisc.fit` — ray-cast boundary points to a Kasa circle,
// a RIM fit — and prints its p95 residual as a fraction of R beside every
// number, so a bad fit is visible rather than assumed.
//
// THE REFERENCE LIST IS THE POINT. `_jq42indep.mjs` re-run 2026-08-23 in this
// worktree reproduces the 2026-08-22 judge ruling exactly:
//   quarter-obv.jpg  vs quarter-obv-2.jpg   design NCC 0.9959 — ONE photograph
//   quarter-obv-4.jpg vs everything          0.2460..0.2920 on a 0.2318 floor
//                                            — the 1999+ state quarter
// and `_jq43ccby.mjs quarter-obv-1932ngc.jpg` adds a file the ruling did not
// cover: design NCC 0.6171 / 0.6331 / 0.5062 against obv / obv-2 / obv-3 on a
// 0.2402 floor, registration off every bound for those three. So the usable
// STRUCK set is THREE files, not one, and it is the list below.
//
// Mapping: our blank is drawn at r=47 of the 100-unit viewBox (`outlineOf`
// calls `reededPath(n, 47, depth)`), so viewBox X -> px = cx + ((X-50)/47)*R.
// Getting that wrong by using 50 is the 6% flattery `_nk3over.mjs` records.
//
// Run: node coloringbook/judge/_qo1zoom.mjs <x0> <y0> <x1> <y1> [tag]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { REF, JUDGE } from './_paths.mjs';
import { fit } from '../_rvdisc.mjs';
import { coinSVG } from '../../src/art/coins.js';

export const STRUCK = ['quarter-obv.jpg', 'quarter-obv-3.png', 'quarter-obv-1932ngc.jpg'];
export const EXCLUDED = {
  'quarter-obv-2.jpg': 'same photograph as quarter-obv.jpg (design NCC 0.9959)',
  'quarter-obv-4.jpg': '1999+ state-quarter obverse, a different design (0.2460..0.2920 on a 0.2318 floor)',
};

const cache = new Map();
export async function disc(file) {
  if (cache.has(file)) return cache.get(file);
  const r = await fit(file);
  const d = { cx: r.cx, cy: r.cy, R: r.R, p95pc: 100 * r.p95 / r.R, W: r.W, H: r.H, via: r.via };
  cache.set(file, d);
  return d;
}

export async function grey(file) {
  const { data, info } = await sharp(REF + '/' + file)
    .flatten({ background: '#ffffff' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  if (data.length !== info.width * info.height) throw new Error(file + ': buffer length — UNTRUSTED');
  return { d: data, w: info.width, h: info.height };
}

/** bilinear sample of a photograph at viewBox (X, Y) */
export function atVB(g, d, X, Y) {
  const px = d.cx + ((X - 50) / 47) * d.R, py = d.cy + ((Y - 50) / 47) * d.R;
  const x0 = Math.floor(px), y0 = Math.floor(py), fx = px - x0, fy = py - y0;
  const gp = (x, y) => g.d[Math.max(0, Math.min(g.h - 1, y)) * g.w + Math.max(0, Math.min(g.w - 1, x))];
  return (gp(x0, y0) * (1 - fx) + gp(x0 + 1, y0) * fx) * (1 - fy)
    + (gp(x0, y0 + 1) * (1 - fx) + gp(x0 + 1, y0 + 1) * fx) * fy;
}

/** our own render, greyscale, as a viewBox sampler at NPX px per 100 units */
export async function ours(size = 1600, side = 'obverse') {
  const png = await sharp(Buffer.from(coinSVG('quarter', size, { side })))
    .flatten({ background: '#ffffff' }).png().toBuffer();
  const { data, info } = await sharp(png).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height, k: info.width / 100 };
}
export function atVBours(o, X, Y) {
  const px = X * o.k, py = Y * o.k;
  const x0 = Math.floor(px), y0 = Math.floor(py), fx = px - x0, fy = py - y0;
  const gp = (x, y) => o.d[Math.max(0, Math.min(o.h - 1, y)) * o.w + Math.max(0, Math.min(o.w - 1, x))];
  return (gp(x0, y0) * (1 - fx) + gp(x0 + 1, y0) * fx) * (1 - fy)
    + (gp(x0, y0 + 1) * (1 - fx) + gp(x0 + 1, y0 + 1) * fx) * fy;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const [x0, y0, x1, y1] = process.argv.slice(2, 6).map(Number);
  const tag = process.argv[6] || 'win';
  if (![x0, y0, x1, y1].every(Number.isFinite)) {
    console.log('usage: node _qo1zoom.mjs x0 y0 x1 y1 [tag]   (viewBox units, 0..100)');
    process.exit(2);
  }
  const PPU = Math.max(6, Math.round(560 / Math.max(x1 - x0, y1 - y0))); // px per viewBox unit
  const w = Math.round((x1 - x0) * PPU), h = Math.round((y1 - y0) * PPU);

  const panels = [];
  const o = await ours(1600);
  const mk = (sample) => {
    const buf = Buffer.alloc(w * h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      buf[j * w + i] = Math.max(0, Math.min(255, Math.round(sample(x0 + (i + 0.5) / PPU, y0 + (j + 0.5) / PPU))));
    }
    return buf;
  };
  panels.push({ name: 'OURS (live coins.js)', buf: mk((X, Y) => atVBours(o, X, Y)) });
  console.log(`window viewBox x ${x0}..${x1}  y ${y0}..${y1}   ${PPU} px per viewBox unit`);
  for (const f of STRUCK) {
    const d = await disc(f);
    console.log(`${f.padEnd(26)} ${d.W}x${d.H} ${d.via}  cx ${d.cx.toFixed(1)} cy ${d.cy.toFixed(1)} R ${d.R.toFixed(1)}  rim p95 ${d.p95pc.toFixed(2)}% of R`);
    const g = await grey(f);
    panels.push({ name: f, buf: mk((X, Y) => atVB(g, d, X, Y)) });
  }

  // grid every viewBox unit, every 5th heavy, drawn as an SVG overlay
  const LAB = 26, PAD = 12;
  const gridSvg = () => {
    let s = '';
    for (let X = Math.ceil(x0); X <= x1; X++) {
      const px = (X - x0) * PPU;
      s += `<line x1="${px}" y1="0" x2="${px}" y2="${h}" stroke="#ff0000" stroke-opacity="${X % 5 ? 0.18 : 0.5}" stroke-width="${X % 5 ? 0.6 : 1.1}"/>`;
    }
    for (let Y = Math.ceil(y0); Y <= y1; Y++) {
      const py = (Y - y0) * PPU;
      s += `<line x1="0" y1="${py}" x2="${w}" y2="${py}" stroke="#ff0000" stroke-opacity="${Y % 5 ? 0.18 : 0.5}" stroke-width="${Y % 5 ? 0.6 : 1.1}"/>`;
    }
    for (let X = Math.ceil(x0 / 5) * 5; X <= x1; X += 5) s += `<text x="${(X - x0) * PPU + 2}" y="12" font-family="monospace" font-size="11" fill="#c00">${X}</text>`;
    for (let Y = Math.ceil(y0 / 5) * 5; Y <= y1; Y += 5) s += `<text x="2" y="${(Y - y0) * PPU - 2}" font-family="monospace" font-size="11" fill="#c00">${Y}</text>`;
    return s;
  };
  const tiles = [];
  for (let i = 0; i < panels.length; i++) {
    const base = await sharp(panels[i].buf, { raw: { width: w, height: h, channels: 1 } }).png().toBuffer();
    const withGrid = await sharp(base).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${gridSvg()}</svg>`) }]).png().toBuffer();
    tiles.push({ input: withGrid, left: PAD + i * (w + PAD), top: LAB });
  }
  const W = PAD + panels.length * (w + PAD), H = LAB + h + PAD;
  const labels = panels.map((p, i) => `<text x="${PAD + i * (w + PAD)}" y="18" font-family="monospace" font-size="13" fill="#111">${p.name}</text>`).join('');
  const out = `${JUDGE}/_qo1zoom-${tag}.png`;
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>${labels}</svg>`))
    .composite(tiles).png().toFile(out);
  console.log('wrote ' + out.slice(out.lastIndexOf('/judge/') + 1));
}
