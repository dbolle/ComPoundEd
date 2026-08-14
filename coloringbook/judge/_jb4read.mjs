// BUCK r0 — D4 (rhythm) and D5 (lettering) on the REVERSE, read off the
// rectified reference in the coordinate system the features are defined in.
//
// SUBJECTS COVERED (PY3): id `buck`, REVERSE only (the obverse has no working
// fiducial — see _jb1fit.mjs). Both reverse references.
//
// §3's D5 is a band RADIUS. A rectangle has no radius, so PY2's two-extreme
// form is used in Cartesian: every legend is frozen as (Ytop, Ybase, X0, X1) —
// the extremes nearest the top edge and nearest the bottom edge, plus the
// horizontal extent — never as a single "baseline".
//
// Every window below is a FROZEN LITERAL read off the target (§6.1); none is
// computed from our drawing. Each instrument prints its window as its search
// bounds (§4.1) and flags an extent that lands on one.
//
//   node coloringbook/judge/_jb4read.mjs [json]
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { rectify } from '../_blnorm.mjs';

const S = 20, X0 = 5, Y0 = 5, W = Math.round(90 * S), H = Math.round(46 * S);
const FILES = ['bill-rev.jpg', 'bill-rev-2.jpg'];

// FROZEN search windows, in our viewBox units, read off _jb2-reverse-*.png
const WIN = {
  'legend-top':    { x: [18, 82], y: [5.0, 12.0] },   // THE UNITED STATES OF AMERICA
  'motto':         { x: [40, 62], y: [13.0, 19.0] },  // IN GOD WE TRUST
  'ONE-centre':    { x: [30, 70], y: [19.5, 40.0] },  // the big central ONE
  'legend-bottom': { x: [18, 82], y: [42.0, 51.0] },  // ONE DOLLAR
  'pyramid-body':  { x: [16.5, 30.0], y: [28.0, 38.5] }, // the courses
};
// what noteSVG draws, restated as literals so no locus is a function of our art
const OURS = {
  'ONE-centre': { note: 'text x=50 y=32 font-size=9 letter-spacing=0.6, full/mid only' },
  'legend-top': { note: 'not drawn' },
  'legend-bottom': { note: 'not drawn' },
  'motto': { note: 'not drawn' },
  'pyramid-body': { note: '3 cut lines at y 33.5 / 30.3 / 25.4 -> 4 courses, full/mid only; 0 at icon' },
};

const res = {};
for (const f of FILES) {
  const R = await rectify(f, W, H);
  const px = (X, Y) => {
    const x = (X - X0) * S, y = (Y - Y0) * S;
    if (x < 0 || y < 0 || x >= W - 1 || y >= H - 1) return 255;
    const i = x | 0, j = y | 0, fx = x - i, fy = y - j;
    return R.out[j * W + i] * (1 - fx) * (1 - fy) + R.out[j * W + i + 1] * fx * (1 - fy) +
      R.out[(j + 1) * W + i] * (1 - fx) * fy + R.out[(j + 1) * W + i + 1] * fx * fy;
  };
  // the note's "field" per gates §6: p90 grey over the whole inner frame
  const all = [];
  for (let Y = 5; Y < 51; Y += 0.25) for (let X = 5; X < 95; X += 0.25) all.push(px(X, Y));
  all.sort((a, b) => a - b);
  const field = all[(all.length * 0.9) | 0];
  const TH = 0.72 * field;
  res[f] = { field: Math.round(field), th: Math.round(TH), feat: {} };

  for (const [name, w] of Object.entries(WIN)) {
    // row and column ink-density profiles inside the frozen window
    const rows = [], cols = [];
    for (let Y = w.y[0]; Y <= w.y[1]; Y += 0.05) {
      let n = 0, k = 0;
      for (let X = w.x[0]; X <= w.x[1]; X += 0.05) { n++; if (px(X, Y) < TH) k++; }
      rows.push([Y, k / n]);
    }
    for (let X = w.x[0]; X <= w.x[1]; X += 0.05) {
      let n = 0, k = 0;
      for (let Y = w.y[0]; Y <= w.y[1]; Y += 0.05) { n++; if (px(X, Y) < TH) k++; }
      cols.push([X, k / n]);
    }
    const ext = (prof, frac) => {
      const hit = prof.filter((p) => p[1] >= frac);
      return hit.length ? [hit[0][0], hit[hit.length - 1][0]] : null;
    };
    const FRAC = 0.10;
    const ry = ext(rows, FRAC), rx = ext(cols, FRAC);
    const onBound = [];
    if (ry && (Math.abs(ry[0] - w.y[0]) < 0.06 || Math.abs(ry[1] - w.y[1]) < 0.06)) onBound.push('Y');
    if (rx && (Math.abs(rx[0] - w.x[0]) < 0.06 || Math.abs(rx[1] - w.x[1]) < 0.06)) onBound.push('X');
    res[f].feat[name] = { window: w, frac: FRAC, yExtent: ry, xExtent: rx, onBound,
      rowProfile: rows.filter((_, i) => i % 4 === 0).map(([y, v]) => [+y.toFixed(2), +v.toFixed(3)]) };
  }

  // D4 — count the pyramid's COURSES: local minima of the row profile inside
  // the pyramid body, prominence-filtered. Courses are dark ruled lines.
  const p = res[f].feat['pyramid-body'].rowProfile;
  const peaks = [];
  for (let i = 2; i < p.length - 2; i++)
    if (p[i][1] > p[i - 1][1] && p[i][1] >= p[i + 1][1] && p[i][1] > 0.20) {
      const l = Math.min(p[i - 1][1], p[i - 2][1]), r = Math.min(p[i + 1][1], p[i + 2][1]);
      const prom = p[i][1] - Math.max(l, r);
      if (prom > 0.05) peaks.push({ y: p[i][0], v: p[i][1], prom: +prom.toFixed(3) });
    }
  res[f].courses = peaks;
  console.log(`\n${f}   field(p90) ${res[f].field}   ink threshold ${res[f].th}`);
  for (const [name, v] of Object.entries(res[f].feat))
    console.log(`  ${name.padEnd(14)} window X ${v.window.x.join('..')} Y ${v.window.y.join('..')}` +
      `  ->  X ${v.xExtent ? v.xExtent.map((n) => n.toFixed(2)).join('..') : 'none'}` +
      `  Y ${v.yExtent ? v.yExtent.map((n) => n.toFixed(2)).join('..') : 'none'}` +
      `   cap height ${v.yExtent ? (v.yExtent[1] - v.yExtent[0]).toFixed(2) : '-'}` +
      `${v.onBound.length ? `   *** ON BOUND (${v.onBound.join(',')}) — failure report, not a value ***` : ''}`);
  console.log(`  pyramid course peaks: ${peaks.length} at Y ${peaks.map((q) => q.y.toFixed(2)).join(' ')}`);
}

// ── overlay (§4.3): everything located, drawn on the source it came from
const F = 'bill-rev-2.jpg';
const R = await rectify(F, W, H);
const buf = Buffer.alloc(W * H);
for (let i = 0; i < W * H; i++) buf[i] = Math.max(0, Math.min(255, Math.round(R.out[i])));
const X = (v) => (v - X0) * S, Y = (v) => (v - Y0) * S;
let g = '';
for (const [name, v] of Object.entries(res[F].feat)) {
  if (!v.xExtent || !v.yExtent) continue;
  const a = [X(v.xExtent[0]), Y(v.yExtent[0]), X(v.xExtent[1]) - X(v.xExtent[0]), Y(v.yExtent[1]) - Y(v.yExtent[0])];
  if (!a.every(Number.isFinite)) throw new Error(`${name}: non-finite overlay geometry`);
  g += `<rect x="${a[0]}" y="${a[1]}" width="${a[2]}" height="${a[3]}" fill="none" stroke="#ffe000" stroke-width="2"/>` +
    `<text x="${a[0] + 3}" y="${a[1] - 4}" fill="#ffe000" font-size="15" font-family="monospace">${name} X${v.xExtent[0].toFixed(1)}-${v.xExtent[1].toFixed(1)} Y${v.yExtent[0].toFixed(1)}-${v.yExtent[1].toFixed(1)}</text>`;
}
for (const q of res[F].courses)
  g += `<line x1="${X(16.5)}" y1="${Y(q.y)}" x2="${X(30)}" y2="${Y(q.y)}" stroke="#00e0ff" stroke-width="1.5"/>`;
// our own features, in magenta, for comparison
g += `<rect x="${X(41)}" y="${Y(24.5)}" width="${X(59) - X(41)}" height="${Y(32) - Y(24.5)}" fill="none" stroke="#ff00c8" stroke-width="2" stroke-dasharray="7 5"/>` +
  `<text x="${X(41)}" y="${Y(24.5) - 4}" fill="#ff00c8" font-size="15" font-family="monospace">OURS: ONE (approx box of text x=50 y=32 size 9)</text>`;
for (const y of [33.5, 30.3, 25.4])
  g += `<line x1="${X(31)}" y1="${Y(y)}" x2="${X(40)}" y2="${Y(y)}" stroke="#ff00c8" stroke-width="2"/>`;
g += `<text x="${X(31)}" y="${Y(23)}" fill="#ff00c8" font-size="15" font-family="monospace">OURS: 3 pyramid cuts</text>`;
await sharp(buf, { raw: { width: W, height: H, channels: 1 } }).toColourspace('srgb').png().toBuffer()
  .then((b) => sharp(b).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${g}</svg>`), top: 0, left: 0 }])
    .png().toFile('coloringbook/judge/_jb4-reverse-features.png'));
console.log('\noverlay: coloringbook/judge/_jb4-reverse-features.png');

// pyramid zoom, for the course count by eye (R3's hand annotation is evidence)
await sharp(buf, { raw: { width: W, height: H, channels: 1 } })
  .extract({ left: Math.round(X(15)), top: Math.round(Y(14)), width: Math.round(19 * S), height: Math.round(26 * S) })
  .resize(Math.round(19 * S * 2.2), Math.round(26 * S * 2.2), { kernel: 'nearest' })
  .toColourspace('srgb').png().toFile('coloringbook/judge/_jb4-pyramid-zoom.png');
console.log('zoom:    coloringbook/judge/_jb4-pyramid-zoom.png  (X 15..34, Y 14..40, 2.2x)');

if (process.argv[2] === 'json')
  writeFileSync(new URL('./_jb4read.json', import.meta.url), JSON.stringify({ generated: 'coloringbook/judge/_jb4read.mjs', WIN, OURS, res }, null, 2) + '\n');
