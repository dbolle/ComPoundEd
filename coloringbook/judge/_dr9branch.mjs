// DIME REVERSE — round 2. THE TWO BRANCHES: how much of the field they fill,
// where their foliage starts and stops, how big one blade is, and what else is
// on them.
//
// Reports only; writes only to the gitignored judge scratch (WRITERS.md).
//
// WHY THIS EXISTS. Every number `torch()` quotes about the branches — "olive
// blade 18.6 long by 5.5 wide", "oak leaf 11.8 by 5.5", "foliage 4.0 .. 29.5",
// "seven leaves a side" — was hand-read off ONE gridded crop of ONE photograph
// (`dime-rev-2.jpg`, which is also the file `_dr8shaft.mjs` refuses to publish
// a width from, because it is lit from the upper left). Nothing measured the
// branches' INK AGAINST THEIR OWN FIELD, which is the thing a child sees: on
// the coin the leaves stand in open field, and in our drawing they merge.
//
// THE ESTIMATOR, AND ITS NULL TEST. Device is separated from field by flooding
// the FIELD inward from the crop border through pixels at or above a per-file
// threshold; anything the flood cannot reach is device. This closes interior
// highlights (a proof's specular flute) and interior hollows (line art's white
// leaf bellies), which is what defeated a plain threshold — a run-based
// threshold estimator stopped at the first flute and reported the torch shaft
// as 0.2 units wide.
//
// The flood boundary sits on the OUTER edge of the relief outline, so the raw
// mask is DILATED. That bias is measured, not assumed: the torch shaft's width
// at the seven rows `_dr8shaft.mjs` established by a completely different
// estimator (darkest point, parabola-refined) is re-measured here, and the
// mask is eroded by half the mean overshoot. After erosion:
//
//     dime-rev-unc2005.png    mean err  0.01 units, sd 0.36  (7 rows)
//     dime-rev-proofbright.png mean err -0.80 units, sd 0.24  (7 rows)
//
// `dime-rev.jpg` / `dime-rev-2.jpg` are ONE photograph (NCC 0.9930) and neither
// separates: 16% of the branch box is below grey 30 on them, the relief's own
// shadow, and the flood leaks through it. They are measured and REPORTED here
// with that failure printed, not silently dropped.
//
// WHAT IS EXCLUDED FROM A BRANCH WINDOW. The legend (everything at r >= 33.5,
// which is UNITED STATES OF AMERICA's inner edge less half a leaf) and the
// torch itself (a per-row half-width following the shaft taper `torch()` now
// draws, plus 0.6). Without those, "foliage" counts letters and the shaft: an
// earlier pass of this instrument read the D of UNITED as an olive leaf at
// y 28, at offset 15..20, which is exactly where a leaf would be.
//
// Run: node coloringbook/judge/_dr9branch.mjs
import sharp from 'sharp';
import { join } from 'node:path';
import { SCRATCH } from './_paths.mjs';
import { samplerFor } from './_dr2grid.mjs';

const X0 = 13, X1 = 87, Y0 = 17, Y1 = 85, STEP = 0.05;
const W = Math.round((X1 - X0) / STEP), H = Math.round((Y1 - Y0) / STEP);

// `_dr8shaft.mjs`'s widths, by a different estimator on the same rim fits.
const SHAFT = {
  'dime-rev-unc2005.png': { 40: 9.67, 42: 8.21, 61: 6.43, 62: 5.78, 68: 4.93, 69: 4.84, 70: 5.02 },
  'dime-rev-proofbright.png': { 40: 10.41, 42: 10.47, 61: 7.13, 62: 6.96, 68: 6.08, 69: 6.08, 70: 5.87 },
};
export const FILES = [
  ['dime-rev-proofbright.png', 236, 0.55],
  ['dime-rev-unc2005.png', 190, 1.00],
  ['dime-rev-2.jpg', 150, 0],
  ['ours', 165, 0],
];

export async function deviceMask(file, T, erodeUnits) {
  const s = await samplerFor(file, 2400);
  const light = new Uint8Array(W * H);
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) light[j * W + i] = s.at(X0 + i * STEP, Y0 + j * STEP) >= T ? 1 : 0;
  }
  const field = new Uint8Array(W * H); const st = [];
  const push = (i, j) => {
    if (i < 0 || j < 0 || i >= W || j >= H) return;
    const k = j * W + i; if (field[k] || !light[k]) return; field[k] = 1; st.push(k);
  };
  for (let i = 0; i < W; i++) { push(i, 0); push(i, H - 1); }
  for (let j = 0; j < H; j++) { push(0, j); push(W - 1, j); }
  while (st.length) { const k = st.pop(); const i = k % W, j = (k - i) / W; push(i + 1, j); push(i - 1, j); push(i, j + 1); push(i, j - 1); }
  let dev = new Uint8Array(W * H);
  for (let k = 0; k < W * H; k++) dev[k] = field[k] ? 0 : 1;
  dev = erodeBy(dev, erodeUnits);
  return dev;
}
export function erodeBy(dev, units) {
  const r = Math.round(units / STEP);
  for (let p = 0; p < r; p++) {
    const nx = new Uint8Array(W * H);
    for (let j = 1; j < H - 1; j++) {
      for (let i = 1; i < W - 1; i++) {
        const k = j * W + i;
        nx[k] = dev[k] && dev[k - 1] && dev[k + 1] && dev[k - W] && dev[k + W] ? 1 : 0;
      }
    }
    dev = nx;
  }
  return dev;
}
/** the half-width the torch occupies at row y, from the paths `torch()` emits */
const torchHalf = (y) => (y < 33 ? 8.0 : y < 38.5 ? 6.2 : y < 74 ? 4.7 - ((y - 38.5) * 1.85) / 31.1 + 0.6 : 4.8);
/** device runs on one branch, as OFFSETS from the coin's vertical axis */
export function branchRuns(dev, y, mirror, minlen = 0.3) {
  const j = Math.round((y - Y0) / STEP); const out = []; let s = null;
  for (let o = torchHalf(y); o <= 34; o += STEP) {
    const x = mirror ? 50 - o : 50 + o;
    const inside = Math.hypot(x - 50, y - 50) < 33.5;
    const i = Math.round((x - X0) / STEP);
    const v = inside && j >= 0 && j < H && dev[j * W + i];
    if (v && s === null) s = o;
    if (!v && s !== null) { if (o - s >= minlen) out.push([+s.toFixed(2), +o.toFixed(2)]); s = null; }
  }
  if (s !== null) out.push([+s.toFixed(2), 34]);
  return out;
}
function shaftCheck(dev, truth) {
  const errs = [];
  for (const y of Object.keys(truth).map(Number)) {
    const j = Math.round((y - Y0) / STEP);
    let a = Math.round((50 - X0) / STEP), b = a;
    while (a > 0 && dev[j * W + a - 1]) a--;
    while (b < W - 1 && dev[j * W + b + 1]) b++;
    errs.push((b - a) * STEP - truth[y]);
  }
  const mu = errs.reduce((p, c) => p + c, 0) / errs.length;
  return { mu, sd: Math.sqrt(errs.reduce((p, c) => p + (c - mu) ** 2, 0) / errs.length) };
}
/** connected blobs of an eroded mask inside one branch window, with PCA extents */
export function blobs(dev, mirror, minArea = 1.0) {
  const lab = new Int32Array(W * H).fill(-1); const out = [];
  const keep = (x, y) => Math.hypot(x - 50, y - 50) < 33.0 && y > 24 && y < 62
    && (mirror ? x < 50 - torchHalf(y) : x > 50 + torchHalf(y));
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const k = j * W + i;
      if (!dev[k] || lab[k] >= 0) continue;
      if (!keep(X0 + i * STEP, Y0 + j * STEP)) { lab[k] = -2; continue; }
      const st = [k]; lab[k] = 1; const pts = [];
      while (st.length) {
        const q = st.pop(); const qi = q % W, qj = (q - qi) / W;
        pts.push([X0 + qi * STEP, Y0 + qj * STEP]);
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ni = qi + di, nj = qj + dj;
          if (ni < 0 || nj < 0 || ni >= W || nj >= H) continue;
          const nk = nj * W + ni;
          if (dev[nk] && lab[nk] < 0 && keep(X0 + ni * STEP, Y0 + nj * STEP)) { lab[nk] = 1; st.push(nk); }
        }
      }
      const area = pts.length * STEP * STEP;
      if (area < minArea) continue;
      let mx = 0, my = 0; for (const [x, y] of pts) { mx += x; my += y; }
      mx /= pts.length; my /= pts.length;
      let sxx = 0, syy = 0, sxy = 0;
      for (const [x, y] of pts) { sxx += (x - mx) ** 2; syy += (y - my) ** 2; sxy += (x - mx) * (y - my); }
      const th = 0.5 * Math.atan2((2 * sxy) / pts.length, (sxx - syy) / pts.length);
      const c = Math.cos(th), s2 = Math.sin(th);
      let l0 = 1e9, l1 = -1e9, w0 = 1e9, w1 = -1e9;
      for (const [x, y] of pts) {
        const u = (x - mx) * c + (y - my) * s2, v = -(x - mx) * s2 + (y - my) * c;
        l0 = Math.min(l0, u); l1 = Math.max(l1, u); w0 = Math.min(w0, v); w1 = Math.max(w1, v);
      }
      out.push({ cx: +mx.toFixed(2), cy: +my.toFixed(2), area: +area.toFixed(1), len: +(l1 - l0).toFixed(2), wid: +(w1 - w0).toFixed(2), ang: Math.round((th * 180) / Math.PI) });
    }
  }
  return out.sort((a, b) => b.area - a.area);
}

if (process.argv[1] && process.argv[1].endsWith('_dr9branch.mjs')) {
  const masks = {};
  console.log('NULL TEST — torch-shaft width against _dr8shaft.mjs (7 rows):');
  for (const [f, T, e] of FILES) {
    masks[f] = await deviceMask(f, T, e);
    if (SHAFT[f]) {
      const n = shaftCheck(masks[f], SHAFT[f]);
      console.log(`  ${f.padEnd(26)} T=${T} erode=${e}  mean err ${n.mu.toFixed(2)} sd ${n.sd.toFixed(2)}`);
    } else if (f !== 'ours') {
      const n = shaftCheck(masks[f], SHAFT['dime-rev-unc2005.png']);
      console.log(`  ${f.padEnd(26)} T=${T} erode=${e}  mean err ${n.mu.toFixed(2)} sd ${n.sd.toFixed(2)}  <-- FAILS, not used`);
    }
  }
  const USE = FILES.filter(([f]) => f !== 'dime-rev-2.jpg');
  for (const [nm, mir] of [['OLIVE (left)', true], ['OAK (right)', false]]) {
    console.log(`\n=== ${nm}: FOLIAGE ROWS (a row carrying any device run >= 3.0 units;`);
    console.log('    the stems are 1.3..2.6 wide, so only a leaf can make one).');
    console.log('    Scanned y 22..62 ONLY: E PLURIBUS UNUM starts at y 62.5 and its');
    console.log('    caps make 3-unit runs inside the branch window on our drawing ===');
    for (const [f] of USE) {
      let first = null, last = null;
      for (let y = 22; y <= 62; y += 0.25) {
        const r = branchRuns(masks[f], y, mir);
        if (r.some(([a, b]) => b - a >= 3.0)) { if (first === null) first = y; last = y; }
      }
      console.log(`  ${f.padEnd(26)} y ${first} .. ${last}   span ${(last - first).toFixed(2)}`);
    }
    console.log(`  --- ink per row (units of device between the torch and r 33.5) ---`);
    console.log('     y  ' + USE.map(([f]) => f.slice(9, 20).padStart(12)).join(''));
    for (let y = 24; y <= 64; y += 2) {
      console.log(`    ${String(y).padStart(2)}  ` + USE.map(([f]) => branchRuns(masks[f], y, mir)
        .reduce((p, [a, b]) => p + b - a, 0).toFixed(1).padStart(12)).join(''));
    }
    console.log('  --- blades: connected blobs, PCA extents at three extra erosions');
    console.log('      of an ALREADY-CALIBRATED mask, and the least-squares');
    console.log('      extrapolation of each back to zero erosion (L0 x W0).');
    console.log('      ⚠️ DO NOT correct a LENGTH by "+2*erode": that holds for a slab');
    console.log('      with perpendicular ends, which is what the shaft null test');
    console.log('      calibrates, and NOT for a pointed leaf. A blade 17 long and 7');
    console.log('      wide has a tip half-angle of 22 degrees, so erosion takes');
    console.log('      1/sin(22) = 2.6 units off each end per unit eroded. Applying the');
    console.log('      slab rule to this face made a 17-unit blade measure 13 and was');
    console.log('      about to be drawn that way. The slope below is measured per blob,');
    console.log('      so it needs no assumption about the shape at all: widths come out');
    console.log('      near -2.0 per unit (parallel edges) and lengths near -3.0 (points).');
    for (const [f] of USE) {
      const ERO = [0.6, 1.2, 1.8];
      const sets = ERO.map((e) => blobs(erodeBy(masks[f], e), mir, 0.8));
      for (const b of sets[0]) {
        const track = sets.map((S) => S.reduce((best, c) => (Math.hypot(c.cx - b.cx, c.cy - b.cy) < Math.hypot(best.cx - b.cx, best.cy - b.cy) ? c : best), S[0]));
        if (track.some((t, i) => Math.hypot(t.cx - b.cx, t.cy - b.cy) > 2.5 && i)) continue;
        const fit = (key) => {
          const n = ERO.length;
          const mx = ERO.reduce((p, c) => p + c, 0) / n;
          const my = track.reduce((p, c) => p + c[key], 0) / n;
          let sxy = 0, sxx = 0;
          ERO.forEach((e, i) => { sxy += (e - mx) * (track[i][key] - my); sxx += (e - mx) ** 2; });
          const m = sxy / sxx;
          return { at0: +(my - m * mx).toFixed(2), slope: +m.toFixed(2) };
        };
        const L = fit('len'), Wd = fit('wid');
        console.log(`   ${f.padEnd(26)} (${b.cx},${b.cy}) a${b.area} ` +
          `L0 ${L.at0} (slope ${L.slope})  W0 ${Wd.at0} (slope ${Wd.slope})  ` +
          `raw ${track.map((t) => `${t.len}x${t.wid}`).join(' ')}`);
      }
    }
  }
  console.log('\n=== SMALL BODIES on the branches (blobs 0.8..8 u2 at +1.0 erosion) ===');
  for (const [nm, mir] of [['OLIVE', true], ['OAK', false]]) {
    for (const [f] of USE) {
      const bs = blobs(erodeBy(masks[f], 1.0), mir, 0.8).filter((b) => b.area <= 8);
      console.log(`  ${nm.padEnd(6)} ${f.padEnd(26)} ` + (bs.map((b) => `(${b.cx},${b.cy}) ${b.len}x${b.wid} a${b.area}`).join('  ') || '(none)'));
    }
  }
  console.log('\n=== STEM CENTRE, as an offset from the axis: the run 0.8..3.2 units');
  console.log('    wide nearest offset 16 on rows where the leaves leave it clear ===');
  for (const [nm, mir] of [['OLIVE', true], ['OAK', false]]) {
    for (const [f] of USE) {
      const got = [];
      for (const y of [44, 48, 52, 56, 60, 62]) {
        const cand = branchRuns(masks[f], y, mir).filter(([a, b]) => b - a >= 0.5 && b - a <= 3.4 && a > 12 && b < 22);
        got.push(`y${y} ` + (cand.length === 1 ? ((cand[0][0] + cand[0][1]) / 2).toFixed(1) : '--'));
      }
      console.log(`  ${nm.padEnd(6)} ${f.padEnd(26)} ${got.join('  ')}`);
    }
  }
  // a picture of every mask used, so the segmentation can be checked by eye
  for (const [f] of FILES) {
    const buf = Buffer.alloc(W * H * 3);
    for (let k = 0; k < W * H; k++) { const v = masks[f][k] ? 60 : 235; buf[k * 3] = buf[k * 3 + 1] = buf[k * 3 + 2] = v; }
    const out = `_dr9mask-${f.replace(/\W/g, '_')}.png`;
    await sharp(buf, { raw: { width: W, height: H, channels: 3 } }).resize(760).png().toFile(join(SCRATCH, out));
    console.log('  mask ->', out);
  }
}
