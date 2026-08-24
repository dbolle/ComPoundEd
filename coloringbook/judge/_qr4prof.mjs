// QUARTER REVERSE, review sweep — ROW / COLUMN PROFILES in viewBox units, on
// the references AND on our own live art, sampled through the same window.
//
// Reports only; writes nothing.
//
// WHY A PROFILE AND NOT A SEGMENTATION. Device-from-field on a struck coin has
// defeated ~10 instruments in this project. A profile does not need a mask: a
// raised bar lit from the upper left is a BRIGHT run followed by a DARK run,
// and the pair's outer edges bracket the relief. The bracket is read off the
// signed deviation from the local field level, which is estimated from the
// rows above and below the window and never from the window itself.
//
// Run:
//   node coloringbook/judge/_qr4prof.mjs rows <X0> <X1> <Y0> <Y1>
//   node coloringbook/judge/_qr4prof.mjs cols <X0> <X1> <Y0> <Y1>
import sharp from 'sharp';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { REF, JUDGE } from './_paths.mjs';
import { coinSVG } from '../../src/art/coins.js';

const D = JSON.parse(readFileSync(join(JUDGE, '_jq4discs.json'), 'utf8'));
export const FILES = ['quarter-rev-2.png', 'quarter-rev-3.jpg', 'q1995d-rev.png'];

async function greyOf(file) {
  const { data, info } = await sharp(join(REF, file))
    .flatten({ background: '#ffffff' }).greyscale().raw()
    .toBuffer({ resolveWithObject: true });
  if (data.length !== info.width * info.height) throw new Error('grey length — UNTRUSTED');
  return { d: data, w: info.width, h: info.height };
}

/** our live art, rendered big, in the same viewBox frame (disc r 47) */
export async function ours(side = 'reverse', px = 1200) {
  const svg = coinSVG('quarter', 380, { side }).replace(
    /^(<svg[^>]*?)width="[\d.]+" height="[\d.]+"/, `$1width="${px}" height="${px}"`);
  const { data, info } = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  return { g: { d: data, w: info.width, h: info.height },
    disc: { cx: info.width / 2, cy: info.height / 2, R: (info.width / 2) * (47 / 50) } };
}

export function sampler(g, disc) {
  return (X, Y) => {
    const px = disc.cx + ((X - 50) / 47) * disc.R, py = disc.cy + ((Y - 50) / 47) * disc.R;
    const x0 = Math.floor(px), y0 = Math.floor(py), fx = px - x0, fy = py - y0;
    const at = (x, y) => g.d[Math.max(0, Math.min(g.h - 1, y)) * g.w + Math.max(0, Math.min(g.w - 1, x))];
    return (at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx) * (1 - fy)
      + (at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx) * fy;
  };
}

export async function source(name) {
  if (name === 'OURS') { const o = await ours(); return { s: sampler(o.g, o.disc) }; }
  return { s: sampler(await greyOf(name), D[name]) };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const mode = process.argv[2] || 'rows';
  const [X0, X1, Y0, Y1] = process.argv.slice(3, 7).map(Number);
  const names = [...FILES, 'OURS'];
  const step = 0.25;
  const cols = {};
  for (const n of names) {
    const { s } = await source(n);
    const series = [];
    if (mode === 'rows') {
      for (let Y = Y0; Y <= Y1 + 1e-9; Y += step) {
        let acc = 0, k = 0;
        for (let X = X0; X <= X1; X += step) { acc += s(X, Y); k++; }
        series.push([+Y.toFixed(2), acc / k]);
      }
    } else {
      for (let X = X0; X <= X1 + 1e-9; X += step) {
        let acc = 0, k = 0;
        for (let Y = Y0; Y <= Y1; Y += step) { acc += s(X, Y); k++; }
        series.push([+X.toFixed(2), acc / k]);
      }
    }
    // normalise each series to its own 5th..95th percentile so four sources
    // with four exposures are comparable; monotone, so no edge moves.
    const v = series.map((r) => r[1]).sort((a, b) => a - b);
    const lo = v[Math.floor(v.length * 0.05)], hi = v[Math.floor(v.length * 0.95)];
    cols[n] = series.map(([t, x]) => [t, (x - lo) / Math.max(1e-9, hi - lo)]);
  }
  const t = cols[names[0]].map((r) => r[0]);
  console.log(`${mode} over viewBox X ${X0}..${X1}, Y ${Y0}..${Y1}; each series normalised to its own p05..p95`);
  console.log(['  ' + (mode === 'rows' ? 'Y' : 'X'), ...names.map((n) => n.slice(0, 14).padStart(15))].join(''));
  for (let i = 0; i < t.length; i++) {
    console.log([String(t[i]).padStart(6), ...names.map((n) => cols[n][i][1].toFixed(3).padStart(15))].join(''));
  }
}
