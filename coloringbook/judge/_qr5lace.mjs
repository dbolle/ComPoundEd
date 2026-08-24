// QUARTER REVERSE, review sweep — "LACY OR SOLID?", measured without ever
// segmenting device from field.
//
// Reports only; writes nothing.
//
// THE QUESTION. The coin's olive wreath is an OPEN circlet: separate blades
// with struck field visible between every pair. Ours is a closed crescent —
// twelve ellipses 10.4 units long at 5.0-unit centres, so they overlap by
// construction — plus a 3.2-unit stem ribbon under them. "Is there field
// between the leaves" is exactly the kind of question that has defeated every
// device/field segmenter tried here, so this does not ask it.
//
// WHAT IT MEASURES INSTEAD. Along a circular arc drawn THROUGH the wreath, a
// lacy object alternates light-dark-light-dark once per blade; a solid object
// alternates twice in total, at its two ends. Counting ALTERNATIONS of a
// high-passed profile is polarity-free (it does not matter whether a leaf
// reads bright or dark), exposure-free (the high-pass removes the local mean)
// and tolerant of registration error of a fraction of a leaf.
//
// EVERY SOURCE IS BROUGHT TO ONE RESOLUTION FIRST, and that is not a detail.
// The first cut of this file sampled each photograph at its native resolution
// and `quarter-rev-3.jpg` (21.3 px per viewBox unit) scored 2.4x
// `quarter-rev-2.png` (8.0 px per unit) in EVERY band including bare field —
// it was counting sensor noise, not blades. Each source is now area-averaged
// onto a common 16 px/unit grid over the same viewBox square and blurred by
// 0.45 units, so "one blade" is the same number of samples everywhere.
//
// NULL TESTS (printed, always). Two regions of known character, measured by
// the same code on the same images:
//   · SOLID control  — a line straight along the arrow bundle's shaft, which
//     is one unbroken bar on the coin AND one <rect> in our art.
//   · FIELD control  — arcs in the bare annulus r 38..41 outside the top
//     legend's caps and inside the field circle, over the left and right
//     flanks where no legend reaches. Its value IS the noise floor.
// If FIELD is not clearly below WREATH on a photograph, this instrument
// cannot answer the question on that photograph and says so.
//
// Run: node coloringbook/judge/_qr5lace.mjs
import sharp from 'sharp';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { REF, JUDGE } from './_paths.mjs';
import { coinSVG } from '../../src/art/coins.js';

const D = JSON.parse(readFileSync(join(JUDGE, '_jq4discs.json'), 'utf8'));
const REFS = ['quarter-rev-2.png', 'quarter-rev-3.jpg', 'q1995d-rev.png'];
const K = 16;            // px per viewBox unit on the common grid
const NPX = 100 * K;     // 1600
const BLUR = 0.45 * K;   // sigma, in px of the common grid

/** area-average a source onto the common 100x100 viewBox grid at K px/unit */
async function commonGrid(input, disc) {
  const half = (50 / 47) * disc.R;               // half-side of the viewBox square, in source px
  const side = Math.round(2 * half);
  const meta = await sharp(input).metadata();
  // PAD rather than clamp: a clamped extract would silently shift the frame,
  // which is the registration error this whole file exists to avoid.
  const padL = Math.max(0, Math.ceil(half - disc.cx)), padT = Math.max(0, Math.ceil(half - disc.cy));
  const padR = Math.max(0, Math.ceil(disc.cx + half - meta.width));
  const padB = Math.max(0, Math.ceil(disc.cy + half - meta.height));
  // sharp applies `extend` AFTER `resize`, so the padding has to be its own
  // pass or the extract below runs against the unpadded image. (It did, and
  // threw `bad extract area` — recorded because a silent version of the same
  // mistake would have shifted every coordinate in this file.)
  const padded = await sharp(input).flatten({ background: '#ffffff' })
    .extend({ left: padL, top: padT, right: padR, bottom: padB, background: '#808080' })
    .png().toBuffer();
  const { data, info } = await sharp(padded)
    .extract({ left: Math.round(disc.cx - half) + padL, top: Math.round(disc.cy - half) + padT,
      width: side, height: side })
    .resize(NPX, NPX, { fit: 'fill', kernel: 'lanczos3' })
    .blur(BLUR).greyscale().raw().toBuffer({ resolveWithObject: true });
  if (data.length !== info.width * info.height) throw new Error('grid length — UNTRUSTED');
  return { d: data, w: info.width, h: info.height, padded: padL + padT + padR + padB > 0 };
}

function sampler(g) {
  return (X, Y) => {
    const px = X * K, py = Y * K;
    const x0 = Math.floor(px), y0 = Math.floor(py), fx = px - x0, fy = py - y0;
    const at = (x, y) => g.d[Math.max(0, Math.min(g.h - 1, y)) * g.w + Math.max(0, Math.min(g.w - 1, x))];
    return (at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx) * (1 - fy)
      + (at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx) * fy;
  };
}

export async function oursGrid(svgText) {
  const svg = (svgText ?? coinSVG('quarter', 380, { side: 'reverse' }))
    .replace(/^(<svg[^>]*?)width="[\d.]+" height="[\d.]+"/, `$1width="${NPX}" height="${NPX}"`);
  const png = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' }).png().toBuffer();
  // our SVG's viewBox IS 0..100, so the whole raster is the common grid already
  return commonGrid(png, { cx: NPX / 2, cy: NPX / 2, R: (NPX / 2) * (47 / 50) });
}

function crossings(vals, stepLen, winUnits = 7, amp = 0.25) {
  const n = vals.length, wp = Math.max(3, Math.round(winUnits / stepLen)) | 1, h = wp >> 1;
  const hp = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let acc = 0, k = 0;
    for (let j = i - h; j <= i + h; j++) { const q = Math.min(n - 1, Math.max(0, j)); acc += vals[q]; k++; }
    hp[i] = vals[i] - acc / k;
  }
  const abs = Array.from(hp, Math.abs).sort((a, b) => a - b);
  const A = abs[Math.floor(abs.length * 0.90)];
  if (A < 1e-9) return { per100: 0, count: 0, amp: 0 };
  const T = amp * A;
  let state = 0, count = 0;
  for (let i = 0; i < n; i++) {
    if (state <= 0 && hp[i] > T) { if (state !== 0) count++; state = 1; }
    else if (state >= 0 && hp[i] < -T) { if (state !== 0) count++; state = -1; }
  }
  return { per100: +((count / (n * stepLen)) * 100).toFixed(1), count, ampAbs: +A.toFixed(2) };
}

function arc(s, r, a1, a2, step = 0.15) {
  const len = (Math.abs(a2 - a1) * Math.PI / 180) * r;
  const n = Math.max(8, Math.round(len / step));
  const vals = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const a = (a1 + ((a2 - a1) * i) / (n - 1)) * Math.PI / 180;
    vals[i] = s(50 + r * Math.cos(a), 50 + r * Math.sin(a));
  }
  return { vals, stepLen: len / (n - 1) };
}

function line(s, x1, y1, x2, y2, step = 0.15) {
  const len = Math.hypot(x2 - x1, y2 - y1), n = Math.max(8, Math.round(len / step));
  const vals = new Float64Array(n);
  for (let i = 0; i < n; i++) vals[i] = s(x1 + ((x2 - x1) * i) / (n - 1), y1 + ((y2 - y1) * i) / (n - 1));
  return { vals, stepLen: len / (n - 1) };
}

// 0deg = +x (right), 90deg = +y (DOWN). The wreath is the bottom sector.
export const BANDS = [
  ['WREATH  arcs r26..32, 25..155deg', (s) => [26, 28, 30, 32].map((r) => crossings(...Object.values(arc(s, r, 25, 155))).per100)],
  ['SOLID   along the arrow shaft   ', (s) => [62.6, 63.6, 64.6].map((y) => crossings(...Object.values(line(s, 34, y, 66, y))).per100)],
  ['FIELD   arcs r38..41, flanks    ', (s) => [38, 39.5, 41].map((r) => [...arc(s, r, 160, 200).vals]).map((v, i) => {
    const r = [38, 39.5, 41][i]; const a = arc(s, r, 160, 200); const b = arc(s, r, -20, 20);
    const ca = crossings(a.vals, a.stepLen).per100, cb = crossings(b.vals, b.stepLen).per100;
    return +(((ca + cb) / 2).toFixed(1));
  })],
];

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const S = {}, meta = {};
  for (const f of REFS) { const g = await commonGrid(join(REF, f), D[f]); S[f] = sampler(g); meta[f] = g.padded; }
  const og = await oursGrid(); S.OURS = sampler(og); meta.OURS = og.padded;
  const names = [...REFS, 'OURS'];
  for (const n of names) if (meta[n]) console.log(`WARNING: ${n} viewBox square was PADDED beyond the image edge (grey)`);
  console.log(`common grid ${K} px per viewBox unit, blur sigma ${(BLUR / K).toFixed(2)} units.`);
  console.log('alternations of a 7-unit high-pass, per 100 viewBox units of path.');
  console.log('high = lacy (a pair of crossings per blade); low = solid or bare.\n');
  console.log('band'.padEnd(34) + names.map((n) => n.slice(0, 14).padStart(18)).join(''));
  for (const [label, fn] of BANDS) {
    const row = names.map((n) => {
      const per = fn(S[n]);
      const mean = per.reduce((a, b) => a + b, 0) / per.length;
      return `${mean.toFixed(1)} [${per.map((v) => v.toFixed(0)).join(' ')}]`.padStart(18);
    });
    console.log(label.padEnd(34) + row.join(''));
  }
}
