// BUCK r9 (specialist) — the pyramid's WIDTH PROFILE, row by row, and a
// symmetric-trapezoid fit to it.
//
// WHY A SECOND INSTRUMENT. `_jk9edge.mjs` fits the two slopes independently
// and they came back ASYMMETRIC (|m| 0.400 left against 0.315 right) with a
// base centre 0.9 units left of the seal's own measured centre. The overlay
// (`_jk9-basecheck.png`) shows why and it is §4.3 again: near the base the
// pyramid's shadow spills LEFT of the pyramid, so the left line fit tracks the
// shadow's outer boundary rather than the masonry. This instrument measures
// each row's own left and right edge and reports the per-row centre, so a
// drifting edge is visible as a drifting centre instead of being averaged into
// a slope.
//
// SUBJECTS COVERED (PY3): id `buck`, REVERSE only, both reverse references.
//
//   node coloringbook/judge/_jk9prof.mjs
import { rectify } from '../_blnorm.mjs';

const S = 20, X0 = 5, Y0 = 5;
const W = Math.round(90 * S), H = Math.round(46 * S);
const FILES = ['bill-rev.jpg', 'bill-rev-2.jpg'];
// FROZEN SEARCH BOUNDS (§4.1) — printed with every row.
const AXIS = 23.125;                 // the seal's measured centre, the frozen D2 target
const SEARCH = 6.0;                  // how far either side of AXIS a row edge may be found
const ROWS = [];
for (let Y = 24.6; Y <= 33.0 + 1e-9; Y += 0.4) ROWS.push(+Y.toFixed(2));
const D = 0.40;

const all = {};
for (const f of FILES) {
  const R = await rectify(f, W, H);
  const px = (X, Y) => {
    const x = (X - X0) * S, y = (Y - Y0) * S;
    if (x < 0 || y < 0 || x >= W - 1 || y >= H - 1) return 255;
    const i = x | 0, j = y | 0, fx = x - i, fy = y - j;
    return R.out[j * W + i] * (1 - fx) * (1 - fy) + R.out[j * W + i + 1] * fx * (1 - fy) +
      R.out[(j + 1) * W + i] * (1 - fx) * fy + R.out[(j + 1) * W + i + 1] * fx * fy;
  };
  // average the step over +-0.5 units of Y so one course line cannot decide a row
  const step = (X, Y) => { let s = 0; for (let dy = -0.5; dy <= 0.5; dy += 0.1) s += px(X - D, Y + dy) - px(X + D, Y + dy); return s / 11; };
  const rows = [];
  for (const Y of ROWS) {
    let bl = { v: -1e9 }, br = { v: -1e9 };
    for (let X = AXIS - SEARCH; X <= AXIS - 0.6; X += 0.02) { const v = step(X, Y); if (v > bl.v) bl = { X, v }; }
    for (let X = AXIS + 0.6; X <= AXIS + SEARCH; X += 0.02) { const v = step(X, Y); if (v > br.v) br = { X, v }; }
    const onBound = (Math.abs(bl.X - (AXIS - SEARCH)) < 0.03 ? 'L' : '') + (Math.abs(br.X - (AXIS + SEARCH)) < 0.03 ? 'R' : '');
    rows.push({ Y, L: bl.X, R: br.X, vL: bl.v, vR: br.v, c: (bl.X + br.X) / 2, hw: (br.X - bl.X) / 2, onBound });
  }
  all[f] = rows;
  console.log(`\n${f}   search bounds X ${(AXIS - SEARCH).toFixed(2)}..${(AXIS - 0.6).toFixed(2)} | ${(AXIS + 0.6).toFixed(2)}..${(AXIS + SEARCH).toFixed(2)}  (a result on a bound is a failure report, not a value)`);
  console.log('   Y      Lx     Rx    centre  half-w   stepL  stepR  bound');
  for (const r of rows)
    console.log(`  ${r.Y.toFixed(2)}  ${r.L.toFixed(2)}  ${r.R.toFixed(2)}   ${r.c.toFixed(2)}   ${r.hw.toFixed(2)}   ${r.vL.toFixed(1).padStart(6)} ${r.vR.toFixed(1).padStart(6)}  ${r.onBound || '-'}`);
  // least squares half-width = k*(Y - Yapex) over the rows whose two edges are
  // both strong (step >= 25 grey), which excludes the rows where the shadow wins
  const good = rows.filter((r) => r.vL >= 25 && r.vR >= 25 && !r.onBound);
  const n = good.length;
  const sx = good.reduce((s, r) => s + r.Y, 0), sy = good.reduce((s, r) => s + r.hw, 0);
  const sxx = good.reduce((s, r) => s + r.Y * r.Y, 0), sxy = good.reduce((s, r) => s + r.Y * r.hw, 0);
  const k = (n * sxy - sx * sy) / (n * sxx - sx * sx), b0 = (sy - k * sx) / n;
  const yApex = -b0 / k;
  const cMean = good.reduce((s, r) => s + r.c, 0) / n;
  const cSd = Math.sqrt(good.reduce((s, r) => s + (r.c - cMean) ** 2, 0) / n);
  console.log(`  FIT over ${n}/${rows.length} rows with both steps >= 25 grey:  half-width = ${k.toFixed(4)}*(Y - ${yApex.toFixed(2)})`);
  console.log(`      per-row centre  mean ${cMean.toFixed(2)}  sd ${cSd.toFixed(2)}  (AXIS used for the search was ${AXIS})`);
  console.log(`      half-width at Y 33.25 = ${(k * (33.25 - yApex)).toFixed(2)}   at Y 23.92 = ${(k * (23.92 - yApex)).toFixed(2)}`);
  all[f].fit = { k, yApex, cMean, cSd, n };
}

// RESPONSE TEST — shift the search axis 1 unit right and confirm the per-row
// centres do NOT move (they are a property of the photograph, not of the seed).
{
  const f = FILES[0];
  const R = await rectify(f, W, H);
  const px = (X, Y) => {
    const x = (X - X0) * S, y = (Y - Y0) * S;
    if (x < 0 || y < 0 || x >= W - 1 || y >= H - 1) return 255;
    const i = x | 0, j = y | 0, fx = x - i, fy = y - j;
    return R.out[j * W + i] * (1 - fx) * (1 - fy) + R.out[j * W + i + 1] * fx * (1 - fy) +
      R.out[(j + 1) * W + i] * (1 - fx) * fy + R.out[(j + 1) * W + i + 1] * fx * fy;
  };
  const step = (X, Y) => { let s = 0; for (let dy = -0.5; dy <= 0.5; dy += 0.1) s += px(X - D, Y + dy) - px(X + D, Y + dy); return s / 11; };
  const A2 = AXIS + 1;
  let same = 0, tot = 0;
  for (const r of all[f]) {
    let bl = { v: -1e9 }, br = { v: -1e9 };
    for (let X = A2 - SEARCH; X <= A2 - 0.6; X += 0.02) { const v = step(X, r.Y); if (v > bl.v) bl = { X, v }; }
    for (let X = A2 + 0.6; X <= A2 + SEARCH; X += 0.02) { const v = step(X, r.Y); if (v > br.v) br = { X, v }; }
    tot++; if (Math.abs(bl.X - r.L) < 0.1 && Math.abs(br.X - r.R) < 0.1) same++;
  }
  console.log(`\nSEED-INVARIANCE — search axis ${AXIS} -> ${A2}: ${same}/${tot} rows returned the same two edges to 0.1 units` +
    `  ${same >= tot - 2 ? 'the answer is the photograph, not the seed' : '*** SEED-DEPENDENT — treat as UNTRUSTED ***'}`);
}
