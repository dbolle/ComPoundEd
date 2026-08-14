// BUCK r0 — D13 device against field, RESTATED for a note, and SPLIT into two
// devices on the reverse (§18.4).
//
// SUBJECTS COVERED (PY3): id `buck`, BOTH sides, tiers icon/mid/full. The
// frozen D13 instrument `_x6dark.mjs` covers neither: its PAIRS table is
// reverse-only (PY3) and has no `buck` row at all.
//
// "FIELD" ON A NOTE (gates file §6): a note has no bare field — it is engraved
// edge to edge, which is why every density instrument tried on this subject
// has returned its own search bound. Field is therefore frozen as a STATISTIC:
// the 90th-percentile grey inside a frozen window. On the photograph that is
// the paper showing between engraved lines; in our art it is PALETTE.buck's
// `field`/`body`. mean/field and ink fraction are then computed exactly as
// `_x6dark.mjs` computes them on a coin.
//
// CONSTRUCTION (§23.2, copied deliberately): our art is rendered at the tier's
// REAL device pixel count, and the photograph is box-filtered DOWN to the same
// count. No upsampling anywhere.
//
// Windows are frozen literals centred on the MEASURED device centres, never on
// ours, so a misplaced device cannot score itself (§6.1).
//
//   node coloringbook/judge/_jb10d13.mjs [json]
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { fitBorder, grey } from '../_blfit.mjs';
import { homography, uv2px, at } from '../_blnorm.mjs';
const { coinSVG, coinPx } = await import('../../src/art/coins.js');

const FRAME = { x0: 5, y0: 5, x1: 95, y1: 51 };          // == the printed border
const PAPERF = { x0: 1.4, y0: 1.4, x1: 98.6, y1: 54.6 };
const TIERS = { icon: 26, mid: 54, full: 190 };
// frozen windows, viewBox units (gates file §2 D13 row)
const WIN = {
  reverse: {
    pyramid: { x: [5.13, 41.13], y: [5, 51] },
    eagle: { x: [58.88, 94.88], y: [5, 51] },
    'whole-frame': { x: [5, 95], y: [5, 51] },
  },
  obverse: {
    // the portrait VIGNETTE as measured on bill-obv-2.jpg through the paper
    // fiducial (_jb6-portrait-ladder.png): cx 50.05 cy 30.3 rx 9.75 ry 14.0
    'portrait-measured': { x: [32.05, 68.05], y: [5, 51] },
    'whole-frame': { x: [5, 95], y: [5, 51] },
  },
};
const REF = { reverse: ['bill-rev.jpg', 'bill-rev-2.jpg'], obverse: ['bill-obv-2.jpg'] };
const FID = { reverse: 'border', obverse: 'paper' };

// ── the photograph, rectified then BOX-FILTERED to a device pixel count
async function refAt(file, fid, W, H) {
  const fit = await fitBorder(file), g = await grey(file);
  const p = fit.paperBox;
  const corners = fid === 'paper'
    ? { TL: [p.px0, p.py0], TR: [p.px1, p.py0], BR: [p.px1, p.py1], BL: [p.px0, p.py1] }
    : fit.corners;
  const Hm = homography(corners);
  const F = fid === 'paper' ? PAPERF : FRAME;
  // supersample 8x per device pixel, then average — a box filter, no upsampling
  const SS = 8, out = new Float64Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    let s = 0;
    for (let b = 0; b < SS; b++) for (let a = 0; a < SS; a++) {
      const u = (i + (a + 0.5) / SS) / W, v = (j + (b + 0.5) / SS) / H;
      const [px, py] = uv2px(Hm, u, v);
      s += at(g, px, py);
    }
    out[j * W + i] = s / (SS * SS);
  }
  return { out, W, H, F };
}

// ── our art at the tier's real device pixel count
async function oursAt(side, size) {
  const box = coinPx('buck', size);
  const W = Math.round(box.w), H = Math.round(box.h);
  const svg = coinSVG('buck', size, { side });
  if (/undefined|NaN/.test(svg)) throw new Error('undefined/NaN');
  const buf = await sharp(Buffer.from(svg)).resize(W, H, { fit: 'fill' })
    .flatten({ background: '#ffffff' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  if (buf.info.channels !== 1) throw new Error(`channels ${buf.info.channels}`);
  if (buf.data.length !== W * H) throw new Error(`buffer ${buf.data.length} != ${W * H}`);
  return { d: buf.data, W, H };
}

// measure ink + mean/field inside a viewBox window, on a raster covering `F`
function measure(get, W, H, F, win) {
  const u0 = (win.x[0] - F.x0) / (F.x1 - F.x0), u1 = (win.x[1] - F.x0) / (F.x1 - F.x0);
  const v0 = (win.y[0] - F.y0) / (F.y1 - F.y0), v1 = (win.y[1] - F.y0) / (F.y1 - F.y0);
  const i0 = Math.max(0, Math.round(u0 * W)), i1 = Math.min(W, Math.round(u1 * W));
  const j0 = Math.max(0, Math.round(v0 * H)), j1 = Math.min(H, Math.round(v1 * H));
  const vals = [];
  for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) vals.push(get(i, j));
  if (vals.length < 16) throw new Error(`window too small: ${vals.length} px`);
  const s = [...vals].sort((a, b) => a - b);
  const field = s[Math.min(s.length - 1, (s.length * 0.9) | 0)];
  const th = 0.72 * field;
  let sum = 0, ink = 0;
  for (const v of vals) { sum += v; if (v < th) ink++; }
  return { n: vals.length, px: `${i1 - i0}x${j1 - j0}`, field: +field.toFixed(1), ink: ink / vals.length, meanOverField: sum / vals.length / field };
}

const rows = [];
for (const side of ['reverse', 'obverse']) {
  for (const [tier, size] of Object.entries(TIERS)) {
    const O = await oursAt(side, size);
    // our raster covers the whole viewBox 0..100 x 0..56; express windows in it
    const OF = { x0: 0, y0: 0, x1: 100, y1: 56 };
    for (const file of REF[side]) {
      // the reference raster covers the fiducial rect at the SAME device pixel
      // density as our render: our W px spans 100 viewBox units, so the
      // fiducial's width in px is W*(F.x1-F.x0)/100
      const F = FID[side] === 'paper' ? PAPERF : FRAME;
      const RW = Math.max(4, Math.round(O.W * (F.x1 - F.x0) / 100));
      const RH = Math.max(4, Math.round(O.H * (F.y1 - F.y0) / 56));
      const R = await refAt(file, FID[side], RW, RH);
      for (const [name, win] of Object.entries(WIN[side])) {
        const ours = measure((i, j) => O.d[j * O.W + i], O.W, O.H, OF, win);
        const ref = measure((i, j) => R.out[j * RW + i], RW, RH, F, win);
        rows.push({ side, tier, size, file, name, ours, ref,
          dMean: ours.meanOverField - ref.meanOverField, dInk: ours.ink - ref.ink });
      }
    }
  }
}

console.log('D13 — device against field. Gate |d mean/field| <= 0.05 at each tier.');
console.log('"field" = p90 grey of the frozen window (gates §6). Photograph box-filtered to OUR device pixel count; no upsampling.');
console.log('side     tier  window             ref file        | ours px   ink  mean/fld | ref px    ink  mean/fld |  d mean   d ink   verdict');
for (const r of rows)
  console.log(`${r.side.padEnd(8)} ${r.tier.padEnd(5)} ${r.name.padEnd(18)} ${r.file.padEnd(15)} | ` +
    `${r.ours.px.padEnd(8)} ${r.ours.ink.toFixed(3)} ${r.ours.meanOverField.toFixed(4).padStart(8)} | ` +
    `${r.ref.px.padEnd(8)} ${r.ref.ink.toFixed(3)} ${r.ref.meanOverField.toFixed(4).padStart(8)} | ` +
    `${r.dMean.toFixed(4).padStart(7)} ${r.dInk.toFixed(3).padStart(7)}   ${Math.abs(r.dMean) <= 0.05 ? 'PASS' : 'FAIL'}`);

// §18.4 — the two devices are NOT the same number, which is the point
console.log('\n§18.4 — the reverse\'s two devices, never blended:');
for (const file of REF.reverse) {
  const p = rows.find((r) => r.file === file && r.name === 'pyramid' && r.tier === 'full');
  const e = rows.find((r) => r.file === file && r.name === 'eagle' && r.tier === 'full');
  console.log(`  ${file}: photograph ink pyramid ${p.ref.ink.toFixed(3)}  eagle ${e.ref.ink.toFixed(3)}  -> eagle is ${(100 * (e.ref.ink / p.ref.ink - 1)).toFixed(0)}% denser` +
    `;  blended would be ${((p.ref.ink + e.ref.ink) / 2).toFixed(3)} and both facts invisible`);
  console.log(`  ${''.padEnd(file.length)}  ours       ink pyramid ${p.ours.ink.toFixed(3)}  eagle ${e.ours.ink.toFixed(3)}  -> shortfalls ${(p.ours.ink - p.ref.ink).toFixed(3)} / ${(e.ours.ink - e.ref.ink).toFixed(3)}`);
}

// PY4 — two implementations of one quantity, and the spread
{
  const a = rows.find((r) => r.file === 'bill-rev.jpg' && r.name === 'pyramid' && r.tier === 'full');
  const b = rows.find((r) => r.file === 'bill-rev-2.jpg' && r.name === 'pyramid' && r.tier === 'full');
  console.log(`\nPY4 — the same quantity through two references: pyramid mean/field ${a.ref.meanOverField.toFixed(4)} / ${b.ref.meanOverField.toFixed(4)}` +
    `  spread ${Math.abs(a.ref.meanOverField - b.ref.meanOverField).toFixed(4)} = ${(100 * Math.abs(a.ref.meanOverField - b.ref.meanOverField) / 0.05).toFixed(0)}% of the gate`);
  console.log(`  bill.md §4 published, through _blellipse.mjs over the ELLIPSE (not this rectangular window): pyramid 0.7016 / 0.7130, eagle 0.6302 / 0.6354`);
}

// RESPONSE TEST — darken our motif and confirm mean/field falls
{
  const size = 190, box = coinPx('buck', size), W = Math.round(box.w), H = Math.round(box.h);
  const svg = coinSVG('buck', size, { side: 'reverse' });
  const dark = svg.replace(/fill="#6d9c73"/g, 'fill="#1a2a1c"');
  if (dark === svg) throw new Error('RESPONSE anchor missing — PALETTE.buck.motif not found in the reverse SVG; fix the test before trusting D13');
  const grab = async (s) => {
    const b = await sharp(Buffer.from(s)).resize(W, H, { fit: 'fill' }).flatten({ background: '#ffffff' }).greyscale().raw().toBuffer();
    return measure((i, j) => b[j * W + i], W, H, { x0: 0, y0: 0, x1: 100, y1: 56 }, WIN.reverse.eagle);
  };
  const a = await grab(svg), b = await grab(dark);
  console.log(`\nRESPONSE TEST — PALETTE.buck.motif #6d9c73 -> #1a2a1c on the eagle window: mean/field ${a.meanOverField.toFixed(4)} -> ${b.meanOverField.toFixed(4)}` +
    `, ink ${a.ink.toFixed(3)} -> ${b.ink.toFixed(3)}   ${b.meanOverField < a.meanOverField ? 'MOVED as expected (darker)' : '*** DID NOT MOVE — UNTRUSTED ***'}`);
}
// REFERENCE-INVARIANCE (§6.1) — the target-side numbers must not move when our art does
{
  const F = FRAME, W = Math.round(coinPx('buck', 190).w), H = Math.round(coinPx('buck', 190).h);
  const R = await refAt('bill-rev-2.jpg', 'border', Math.round(W * 0.9), Math.round(H * 46 / 56));
  const m = measure((i, j) => R.out[j * R.W + i], R.W, R.H, F, WIN.reverse.eagle);
  const base = rows.find((r) => r.file === 'bill-rev-2.jpg' && r.name === 'eagle' && r.tier === 'full');
  console.log(`REFERENCE-INVARIANCE — eagle window on bill-rev-2.jpg recomputed independently of our render: ` +
    `mean/field ${m.meanOverField.toFixed(6)} vs ${base.ref.meanOverField.toFixed(6)}  ${m.meanOverField === base.ref.meanOverField ? 'BIT-IDENTICAL' : 'DIFFERS — the locus depends on our art'}`);
}

if (process.argv[2] === 'json')
  writeFileSync(new URL('./_jb10d13.json', import.meta.url), JSON.stringify({ generated: 'coloringbook/judge/_jb10d13.mjs', WIN, TIERS, rows }, null, 2) + '\n');
