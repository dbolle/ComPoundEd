// QUARTER REVERSE, review sweep — GRIDDED, DISC-NORMALISED CROPS.
//
// Reports only; writes PNGs to the gitignored scratch dir.
//
// A ladder is what has worked on this project where segmentation has not
// (~10 instruments defeated by device-vs-field on a struck coin). This one
// resamples a reference into OUR viewBox coordinates — (50,50) at the coin's
// centre, r 47 at the blank's edge, exactly what `discSVG` authors in — and
// rules a grid on it in those units, so a number read off the picture is
// already in the units `coins.js` uses.
//
// Discs are the FROZEN rim fits from `_jq4discs.json` (never an area disc).
//
// Run: node coloringbook/judge/_qr3grid.mjs <file> <X0> <Y0> <X1> <Y1> [pxPerUnit] [outname]
import sharp from 'sharp';
import { join } from 'node:path';
import { readFileSync, mkdirSync } from 'node:fs';
import { REF, JUDGE, SCRATCH } from './_paths.mjs';

const D = JSON.parse(readFileSync(join(JUDGE, '_jq4discs.json'), 'utf8'));
export const DISC = {
  'quarter-rev-2.png': D['quarter-rev-2.png'],
  'quarter-rev-3.jpg': D['quarter-rev-3.jpg'],
  'q1995d-rev.png': D['q1995d-rev.png'],
  'qp1963-rev-pad.png': D['qp1963-rev-pad.png'],
  'qp1964-rev-pad.png': D['qp1964-rev-pad.png'],
};

export async function grey(file) {
  const { data, info } = await sharp(join(REF, file))
    .flatten({ background: '#ffffff' }).greyscale().raw()
    .toBuffer({ resolveWithObject: true });
  if (data.length !== info.width * info.height) throw new Error('grey buffer length — UNTRUSTED');
  return { d: data, w: info.width, h: info.height };
}

/** bilinear sample of the greyscale at viewBox (X, Y) */
export function samplerFor(g, disc) {
  return (X, Y) => {
    const px = disc.cx + ((X - 50) / 47) * disc.R;
    const py = disc.cy + ((Y - 50) / 47) * disc.R;
    const x0 = Math.floor(px), y0 = Math.floor(py);
    const fx = px - x0, fy = py - y0;
    const at = (x, y) => g.d[Math.max(0, Math.min(g.h - 1, y)) * g.w + Math.max(0, Math.min(g.w - 1, x))];
    return (at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx) * (1 - fy)
      + (at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx) * fy;
  };
}

export async function crop(file, X0, Y0, X1, Y1, S) {
  const g = await grey(file);
  const s = samplerFor(g, DISC[file]);
  const W = Math.round((X1 - X0) * S), H = Math.round((Y1 - Y0) * S);
  const raw = new Float64Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    raw[j * W + i] = s(X0 + (i + 0.5) / S, Y0 + (j + 0.5) / S);
  }
  // percentile contrast stretch INSIDE THE CROP ONLY — a struck coin's relief
  // is a few grey levels and a whole-image window buries it. This changes no
  // geometry: it is monotone, so every edge stays where it was.
  const srt = Array.from(raw).sort((a, b) => a - b);
  const lo = srt[Math.floor(srt.length * 0.02)], hi = srt[Math.floor(srt.length * 0.98)];
  const buf = Buffer.alloc(W * H * 3);
  for (let k = 0; k < W * H; k++) {
    const v = Math.max(0, Math.min(255, Math.round(((raw[k] - lo) / Math.max(1e-6, hi - lo)) * 255)));
    buf[k * 3] = v; buf[k * 3 + 1] = v; buf[k * 3 + 2] = v;
  }
  // rule the grid IN PLACE: 1-unit hairlines, 5-unit strong lines
  const mark = (i, j, r, gg, b) => {
    if (i < 0 || j < 0 || i >= W || j >= H) return;
    const p = (j * W + i) * 3; buf[p] = r; buf[p + 1] = gg; buf[p + 2] = b;
  };
  for (let X = Math.ceil(X0); X <= X1; X++) {
    const i = Math.round((X - X0) * S), strong = X % 5 === 0;
    for (let j = 0; j < H; j++) if (strong || j % 3 === 0) mark(i, j, strong ? 255 : 0, strong ? 40 : 220, strong ? 40 : 255);
  }
  for (let Y = Math.ceil(Y0); Y <= Y1; Y++) {
    const j = Math.round((Y - Y0) * S), strong = Y % 5 === 0;
    for (let i = 0; i < W; i++) if (strong || i % 3 === 0) mark(i, j, strong ? 255 : 0, strong ? 40 : 220, strong ? 40 : 255);
  }
  return { buf, W, H };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const [file, X0, Y0, X1, Y1, S = 24, name = 'qr3'] = process.argv.slice(2);
  mkdirSync(SCRATCH, { recursive: true });
  const { buf, W, H } = await crop(file, +X0, +Y0, +X1, +Y1, +S);
  const out = join(SCRATCH, `${name}-${file.replace(/[.-]/g, '_')}.png`);
  await sharp(buf, { raw: { width: W, height: H, channels: 3 } }).png().toFile(out);
  console.log(`${file}  viewBox X ${X0}..${X1}  Y ${Y0}..${Y1}  at ${S}px/unit  -> ${W}x${H}`);
  console.log('red lines every 5 viewBox units; blue dotted every 1');
  console.log('wrote (scratch):', out.split('/').pop());
}
