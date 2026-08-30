// _dr23halfmax.mjs — A DEVICE MASK WITH NO EROSION CONSTANT IN IT.
//
// ── THE DEFECT THIS REPLACES (ledger A40) ───────────────────────────────────
// `deviceMask()` in `_dr9branch.mjs` thresholds the photograph at a GLOBAL
// grey level, floods the field inward from the border, calls everything the
// flood cannot reach device — and then ERODES the result by a fixed number of
// units on every side.
//
// The erosion is there for a real reason. A struck mark on a photographed coin
// carries a SHADOW SKIRT: the field beside it is darkened by the relief, falls
// below the global threshold, and is counted as device. So the raw mask is
// bigger than the coin's mark, and a constant erosion pulls it back.
//
// The constants — 0.55 on proofbright, 1.00 on unc2005 — were fitted on the
// TORCH SHAFT, which is 5–10 units wide, where they cost 11–20 %. They are
// applied to every element. On the dime's oak stem, ~2 units wide, 1.00 a side
// takes essentially all of it: the mask's own stem stripe goes 2.30 → 0.30 on
// proofbright and 2.45 → 0.45 on unc2005 as erosion runs 0 → 1.00, and
// `2.0 − 2×erode` reproduces every stripe width to 0.1. **A thin element drawn
// THINNER therefore scores better while being more wrong.** That is not a
// tuning problem; a single length subtracted from every mark cannot be right
// for marks whose widths differ by 5×.
//
// ── WHAT THIS DOES INSTEAD ─────────────────────────────────────────────────
// The skirt is a GRADIENT, so put the boundary in the middle of it — which is
// the edge definition this branch already calibrated as its standard. At y 68
// the accepted trunk reads **237-cut 2.60, half-max 2.20**, and our drawing
// 2.15; half-max is the number the art was fitted to.
//
// So: keep the flood exactly as it is — it is what makes unc2005 work, where
// the device has BRIGHT interiors behind dark outlines and a plain intensity
// rule would call the interiors field — but replace the global threshold with
// a LOCAL half-max one, and then erode by NOTHING.
//
// For each cell, take the min and max intensity in a square window of radius
// `--radius` units and classify as field where the intensity is at or above
// their midpoint. Near a mark, the local max is the field and the local min is
// the mark, so the midpoint IS the half-max crossing and the boundary lands at
// the middle of the skirt by construction, at whatever width that mark's own
// skirt happens to be. Deep inside a large uniform region the window sees no
// contrast at all and the midpoint is meaningless, so below `--floor` counts
// the cell falls back to the file's global threshold — the standard Bernsen
// guard, and without it the interior of the torch dissolves into speckle.
//
// The scale that matters is the SKIRT's, not the element's: the window has to
// be wide enough to see both the mark and the clean field beside it. 1.5 units
// is the default and `radii` sweeps it.
//
// ── VERIFY IT BEFORE YOU BELIEVE IT ────────────────────────────────────────
//   node coloringbook/judge/_dr23halfmax.mjs null      synthetic bars, known
//                                                      width, known skirt
//   node coloringbook/judge/_dr23halfmax.mjs trunk     against the calibrated
//                                                      half-max on the coin
//   node coloringbook/judge/_dr23halfmax.mjs radii     sensitivity to --radius
//   node coloringbook/judge/_dr23halfmax.mjs png       look at it
//
// `null` is the load-bearing one: it builds bars of KNOWN width with a KNOWN
// skirt and asks both methods to recover the width. An instrument that cannot
// recover a width it was handed has no business publishing one.
//
// This file adds a mask; it does not change one. `_dr9branch.deviceMask` is
// untouched and every number published against it stays reproducible.
import sharp from 'sharp';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolve as resolve_ } from 'node:path';
import { JUDGE } from './_paths.mjs';
import { samplerFor } from './_dr2grid.mjs';
import { deviceMask } from './_dr9branch.mjs';

const X0 = 13, X1 = 87, Y0 = 17, Y1 = 85, STEP = 0.05;
const W = Math.round((X1 - X0) / STEP), H = Math.round((Y1 - Y0) / STEP);

export const REFS = {
// ⚠️ THE unc2005 EROSION IS 0.37, NOT 1.00 — RE-BASELINED 2026-08-30 (ledger A40).
// The 1.00 was fitted on the 5-10 unit torch shaft. Measured across 609
// field->device transitions on this branch, unc2005's median 10-90 % edge rise
// is 0.400 units, against the ~1.08 that would justify 1.00 — so the old
// constant was 2.7x the file's own edges and was not removing a skirt, it was
// shrinking the coin. On the locked oak stem it cost 37.96 points of OUTSIDE
// (70.75 % at 1.00 against proofbright's 32.79 % at its well-calibrated 0.55;
// 38.45 % at 0.37). proofbright's 0.55 measures 1.01x its own median rise and
// is UNCHANGED. Every unc2005 number published before this date was measured
// at 1.00 and is not comparable — re-derive rather than compare.
  proofbright: ['dime-rev-proofbright.png', 236, 0.55],
  unc2005: ['dime-rev-unc2005.png', 190, 0.37],
};

const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : d; };

/** sliding-window min and max over a square of half-width `r` cells, separable */
function localMinMax(v, r) {
  const t1 = new Float32Array(W * H), t2 = new Float32Array(W * H);
  const mn = new Float32Array(W * H), mx = new Float32Array(W * H);
  for (let j = 0; j < H; j++) {                       // horizontal pass
    for (let i = 0; i < W; i++) {
      let a = Infinity, b = -Infinity;
      const lo = Math.max(0, i - r), hi = Math.min(W - 1, i + r);
      for (let k = lo; k <= hi; k++) { const u = v[j * W + k]; if (u < a) a = u; if (u > b) b = u; }
      t1[j * W + i] = a; t2[j * W + i] = b;
    }
  }
  for (let i = 0; i < W; i++) {                       // vertical pass
    for (let j = 0; j < H; j++) {
      let a = Infinity, b = -Infinity;
      const lo = Math.max(0, j - r), hi = Math.min(H - 1, j + r);
      for (let k = lo; k <= hi; k++) { const c = k * W + i; if (t1[c] < a) a = t1[c]; if (t2[c] > b) b = t2[c]; }
      mn[j * W + i] = a; mx[j * W + i] = b;
    }
  }
  return { mn, mx };
}

/** flood the field inward from the border through `light`, return device */
function floodDevice(light) {
  const field = new Uint8Array(W * H), st = [];
  const push = (i, j) => {
    if (i < 0 || j < 0 || i >= W || j >= H) return;
    const k = j * W + i; if (field[k] || !light[k]) return; field[k] = 1; st.push(k);
  };
  for (let i = 0; i < W; i++) { push(i, 0); push(i, H - 1); }
  for (let j = 0; j < H; j++) { push(0, j); push(W - 1, j); }
  while (st.length) { const k = st.pop(), i = k % W, j = (k - i) / W; push(i + 1, j); push(i - 1, j); push(i, j + 1); push(i, j - 1); }
  const dev = new Uint8Array(W * H);
  for (let k = 0; k < W * H; k++) dev[k] = field[k] ? 0 : 1;
  return dev;
}

/** the intensity grid for a file, on the mask's own sampling lattice */
async function gridOf(file) {
  const s = await samplerFor(file, 2400);
  const v = new Float32Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) v[j * W + i] = s.at(X0 + i * STEP, Y0 + j * STEP);
  return v;
}

/**
 * DEVICE MASK AT THE LOCAL HALF-MAX. No erosion, by construction.
 * @param file    reference filename, or a Float32Array of intensities already
 *                on the lattice (that is how the null test injects synthetics)
 * @param T       the file's global threshold — used ONLY in the low-contrast
 *                fallback, never as the edge
 * @param radius  half-width of the local window, in viewBox units
 * @param floor   minimum local contrast for the half-max rule to apply
 */
export async function halfMaxMask(file, T, radius = 1.5, floor = 18) {
  const v = file instanceof Float32Array ? file : await gridOf(file);
  const r = Math.max(1, Math.round(radius / STEP));
  const { mn, mx } = localMinMax(v, r);
  const light = new Uint8Array(W * H);
  for (let k = 0; k < W * H; k++) {
    const c = mx[k] - mn[k];
    light[k] = c < floor ? (v[k] >= T ? 1 : 0) : (v[k] >= (mn[k] + mx[k]) / 2 ? 1 : 0);
  }
  return floodDevice(light);
}

/** width of the device run crossing x=`xc` on row `y`, in viewBox units */
export function stripeAt(dev, y, xc) {
  const j = Math.round((y - Y0) / STEP), i0 = Math.round((xc - X0) / STEP);
  if (j < 0 || j >= H || i0 < 0 || i0 >= W || !dev[j * W + i0]) return 0;
  let a = i0, b = i0;
  while (a > 0 && dev[j * W + a - 1]) a--;
  while (b < W - 1 && dev[j * W + b + 1]) b++;
  return +((b - a + 1) * STEP).toFixed(2);
}

const IS_MAIN = process.argv[1] && import.meta.url === pathToFileURL(resolve_(process.argv[1])).href;

if (IS_MAIN) {
  const mode = process.argv[2] || 'null';
  const radius = Number(arg('--radius', '1.5'));
  const floor = Number(arg('--floor', '18'));

  // ── NULL TEST ────────────────────────────────────────────────────────────
  // Bars of KNOWN width, on a bright field, each wearing a skirt of KNOWN
  // extent: intensity ramps linearly from the bar's darkness back up to the
  // field over `skirt` units on each side. The true edge is the bar's own
  // boundary; the half-max crossing sits exactly there by construction, and a
  // global threshold at the field's level sits `skirt` units outside it.
  //
  // This is the whole argument for the method, so it is the default mode.
  if (mode === 'null') {
    // Bars of KNOWN width wearing skirts of KNOWN and DIFFERING extent. The
    // differing skirt is the whole point: relief height varies across a coin,
    // so the skirt does too, and a constant erosion can be exactly right for
    // one skirt and only that one.
    //
    // Intensity ramps linearly from the bar to the field over `s` units beyond
    // the bar's true edge. For a global cut at T the recovered edge sits at
    // s·(T−bar)/(field−bar) outside the truth; for the half-max rule it sits at
    // s/2 outside. So, analytically: global error = +1.85s, half-max = +1.0s,
    // and erosion by e turns the first into 1.85s − 2e — exact only where
    // e = 0.925s, i.e. for ONE skirt.
    const FIELD = 250, BAR = 60;
    const CASES = [        // width, skirt
      [1.0, 0.6], [2.0, 0.6], [5.0, 0.6], [12.0, 0.6],
      [1.0, 0.2], [2.0, 1.2], [5.0, 1.2],
    ];
    const v = new Float32Array(W * H).fill(FIELD);
    // PLACED CUMULATIVELY, NOT AT A FIXED PITCH. Two earlier drafts of this
    // test put the bars on an even pitch and the wide ones ran into each other,
    // so the flood joined them and every method "recovered" 17-18 units for a
    // 5-unit bar. A null test whose subjects overlap is measuring its own
    // layout. Each bar is seated clear of the previous one's skirt by 3 units.
    const centres = [];
    {
      let edge = 16;
      for (const [wid, sk] of CASES) { const c = edge + sk + 2.5 + wid / 2; centres.push(c); edge = c + wid / 2 + sk; }
      if (edge > X1 - 2) throw new Error(`null-test bars run past the lattice: last edge ${edge.toFixed(1)} > ${X1 - 2}`);
    }
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const x = X0 + i * STEP;
      for (let k = 0; k < CASES.length; k++) {
        const [wid, sk] = CASES[k];
        const d = Math.abs(x - centres[k]) - wid / 2;
        if (d <= 0) v[j * W + i] = BAR;
        else if (d < sk) v[j * W + i] = Math.min(v[j * W + i], BAR + (FIELD - BAR) * (d / sk));
      }
    }
    const T = 236;
    const hm = await halfMaxMask(v, T, radius, floor);
    const light = new Uint8Array(W * H);
    for (let k = 0; k < W * H; k++) light[k] = v[k] >= T ? 1 : 0;
    const raw = floodDevice(light);
    const { erodeBy } = await import('./_dr9branch.mjs');
    const er055 = erodeBy(Uint8Array.from(raw), 0.55);
    const er100 = erodeBy(Uint8Array.from(raw), 1.00);

    console.log(`NULL TEST — bars of known width, skirts of DIFFERING known extent`);
    console.log(`field ${FIELD}, bar ${BAR}, half-max radius ${radius}, contrast floor ${floor}\n`);
    console.log('  width  skirt    half-max        global cut      +erode0.55      +erode1.00');
    const err = { hm: [], raw: [], e55: [], e100: [] };
    for (let k = 0; k < CASES.length; k++) {
      const [t, sk] = CASES[k], c = centres[k];
      const a = stripeAt(hm, 50, c), b = stripeAt(raw, 50, c);
      const d = stripeAt(er055, 50, c), e = stripeAt(er100, 50, c);
      err.hm.push(a - t); err.raw.push(b - t); err.e55.push(d - t); err.e100.push(e - t);
      const f = (u) => `${u.toFixed(2).padStart(5)} (${(u - t >= 0 ? '+' : '') + (u - t).toFixed(2)})`;
      console.log(`  ${t.toFixed(1).padStart(5)}  ${sk.toFixed(1).padStart(5)}   ${f(a)}   ${f(b)}   ${f(d)}   ${f(e)}`);
    }
    const rng = (a) => `${Math.min(...a).toFixed(2)} .. ${Math.max(...a).toFixed(2)}`;
    const rel = (a) => Math.max(...a.map((e2, k) => Math.abs(e2) / CASES[k][0]));
    console.log(`\n  error range   half-max ${rng(err.hm)}   global ${rng(err.raw)}`
      + `   erode0.55 ${rng(err.e55)}   erode1.00 ${rng(err.e100)}`);
    console.log(`  worst error as a FRACTION of the true width:`);
    console.log(`     half-max ${(100 * rel(err.hm)).toFixed(0)} %   erode0.55 ${(100 * rel(err.e55)).toFixed(0)} %   erode1.00 ${(100 * rel(err.e100)).toFixed(0)} %`);
    console.log('\n  READ THE SIGNS, AND DO NOT OVERSELL THIS. Half-max is NOT exact: on a');
    console.log('  one-sided shadow ramp it lands mid-ramp, so it over-reads by about the');
    console.log('  skirt width. Two things still make it the right mask for a thin element:');
    console.log('  it over-reads rather than under-reads — an under-read mask charges a');
    console.log('  correctly drawn element for ink that IS on device, which is the failure');
    console.log('  ledger A40 documents — and its error tracks the skirt instead of being a');
    console.log('  constant fitted on one 5-10 unit mark and then applied to a 2-unit one.');
    console.log('  Where the skirt is uniform, a well-fitted erosion beats it. Say which.');
    process.exit(0);
  }


  // ── HOW WIDE IS THE EDGE, REALLY? ────────────────────────────────────────
  // The erosion constants exist to pull the mask back off a SHADOW SKIRT. This
  // mode measures the skirt instead of assuming it: it scans rows across the
  // branch, finds every field→device transition, and reports the 10–90 %
  // distance of each — the standard rise distance. If the skirt were what the
  // constants say it is, these would run about 1.2 units on proofbright and
  // 2.2 on unc2005 (1.85·s = 2·erode gives s = 1.08·erode).
  if (mode === 'edge') {
    for (const key of ['proofbright', 'unc2005']) {
      const [file, T, eDefault] = REFS[key];
      const s2 = await samplerFor(file, 2400);
      const SM = 0.15;                    // smooth along the scan: the device is
      const at = (x, y) => {              // frosted speckle, not a flat tone
        let a = 0, n = 0;
        for (let d = -SM; d <= SM; d += STEP) { a += s2.at(x + d, y); n++; }
        return a / n;
      };
      const rises = [];
      for (let y = 40; y <= 76; y += 0.5) {
        for (let x = 56; x <= 84; x += STEP) {
          const a = at(x, y), b = at(x + STEP, y);
          if (!(a >= T && b < T)) continue;                  // a field→device crossing
          let hi = a, lo = b;                                 // local plateau either side
          for (let d = STEP; d <= 1.5; d += STEP) { const u = at(x - d, y); if (u > hi) hi = u; }
          for (let d = 0; d <= 1.5; d += STEP) { const u = at(x + STEP + d, y); if (u < lo) lo = u; }
          if (hi - lo < 60) continue;                         // not a real edge
          const p90 = lo + 0.9 * (hi - lo), p10 = lo + 0.1 * (hi - lo);
          let x90 = null, x10 = null;
          for (let d = -1.5; d <= 1.5; d += STEP) {
            const u = at(x + d, y);
            if (x90 === null && u <= p90) x90 = x + d;
            if (x90 !== null && x10 === null && u <= p10) x10 = x + d;
          }
          if (x90 !== null && x10 !== null && x10 >= x90) rises.push(x10 - x90);
        }
      }
      rises.sort((a, b) => a - b);
      const q = (f) => rises.length ? rises[Math.min(rises.length - 1, Math.floor(f * rises.length))] : NaN;
      console.log(`\n${key}  (${file}, T ${T}, calibrated erosion ${eDefault} per side)`);
      console.log(`  ${rises.length} field→device transitions scanned, y 40..76 x 56..84`);
      console.log(`  10-90 % rise distance:  median ${q(0.5).toFixed(3)}   p90 ${q(0.9).toFixed(3)}`
        + `   max ${q(0.999).toFixed(3)} units`);
      const implied = 1.08 * eDefault;
      console.log(`  a skirt that would JUSTIFY the ${eDefault} erosion: ~${implied.toFixed(2)} units`);
      console.log(`  ratio measured/justifying: ${(q(0.5) / implied).toFixed(2)}x at the median,`
        + ` ${(q(0.9) / implied).toFixed(2)}x at p90`);
    }
    console.log('\n  The erosion is subtracted from EVERY mark on EVERY row. If the measured');
    console.log('  rise is a small fraction of the skirt the constant assumes, the constant is');
    console.log('  not removing a skirt — it is shrinking the coin. On a 5-10 unit torch shaft');
    console.log('  that reads as a modest correction; on a 2-unit stem it is the whole mark.');
    process.exit(0);
  }

  // ── AGAINST THE COIN ─────────────────────────────────────────────────────
  // The oak trunk is the one mark on this branch with a published half-max
  // width from an independent estimator: at y 68, 237-cut 2.60, half-max 2.20,
  // and our accepted drawing 2.15. That is the number to reproduce.
  if (mode === 'trunk') {
    const ROWS = [58, 62, 65, 68, 70, 72];
    for (const key of ['proofbright', 'unc2005']) {
      const [file, T, eDefault] = REFS[key];
      const v = await gridOf(file);
      const hm = await halfMaxMask(v, T, radius, floor);
      const light = new Uint8Array(W * H);
      for (let k = 0; k < W * H; k++) light[k] = v[k] >= T ? 1 : 0;
      const raw = floodDevice(light);
      const { erodeBy } = await import('./_dr9branch.mjs');
      const er = erodeBy(Uint8Array.from(raw), eDefault);
      console.log(`\n${key}  (${file}, T ${T}, calibrated erosion ${eDefault})`);
      console.log('    y     half-max   flood erode0   flood erode' + eDefault.toFixed(2));
      for (const y of ROWS) {
        const xc = 66.0;                                  // through the oak trunk
        console.log(`  ${String(y).padStart(3)}   ${stripeAt(hm, y, xc).toFixed(2).padStart(8)}`
          + `   ${stripeAt(raw, y, xc).toFixed(2).padStart(12)}   ${stripeAt(er, y, xc).toFixed(2).padStart(12)}`);
      }
    }
    console.log('\n  CALIBRATION ROW: at y 68 the accepted trunk is 237-cut 2.60, half-max 2.20,');
    console.log('  our drawing 2.15. Half-max is the standard this branch was fitted to, so the');
    console.log('  half-max column is the one that should read ~2.20 there.');
    process.exit(0);
  }

  if (mode === 'radii') {
    const [file, T] = REFS[arg('--ref', 'proofbright')];
    const v = await gridOf(file);
    console.log(`sensitivity of the oak trunk stripe to --radius  (${file}, floor ${floor})`);
    console.log('  radius   y58    y62    y65    y68    y70    y72');
    for (const r of [0.5, 1.0, 1.5, 2.0, 3.0]) {
      const m = await halfMaxMask(v, T, r, floor);
      console.log(`  ${r.toFixed(2).padStart(6)}` + [58, 62, 65, 68, 70, 72]
        .map((y) => stripeAt(m, y, 66.0).toFixed(2).padStart(7)).join(''));
    }
    console.log('\n  A method whose answer moves with a free parameter has not removed the free');
    console.log('  parameter, it has renamed it. Read this table before quoting any width.');
    process.exit(0);
  }

  if (mode === 'png') {
    const key = arg('--ref', 'proofbright');
    const [file, T, eDefault] = REFS[key];
    const v = await gridOf(file);
    const hm = await halfMaxMask(v, T, radius, floor);
    const old = await deviceMask(file, T, eDefault);
    const b = Buffer.alloc(W * H * 3, 255);
    for (let k = 0; k < W * H; k++) {
      const a = hm[k], o = old[k];
      if (a && o) { b[k * 3] = 120; b[k * 3 + 1] = 120; b[k * 3 + 2] = 120; }   // both
      else if (a) { b[k * 3] = 210; b[k * 3 + 1] = 40; b[k * 3 + 2] = 40; }     // half-max only
      else if (o) { b[k * 3] = 40; b[k * 3 + 1] = 110; b[k * 3 + 2] = 210; }    // old mask only
    }
    const p = join(JUDGE, `_dr23-mask-${key}.png`);
    await sharp(b, { raw: { width: W, height: H, channels: 3 } }).png().toFile(p);
    console.log(`wrote ${p}   grey both · red half-max only · blue eroded-flood only`);
    process.exit(0);
  }

  console.error('modes: null | edge | trunk | radii | png   [--radius u] [--floor n] [--ref key]');
  process.exit(2);
}
