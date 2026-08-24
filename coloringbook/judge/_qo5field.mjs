// QUARTER OBVERSE — THE WIG'S DIRECTION FIELD, v2, on a band-passed grid.
//
// v1 (`_qo3strand.mjs`) measured the raw photograph and got reference
// coherences of 0.05-0.58: at the strand scale the dominant signal in a raw
// patch is the FORM SHADING of the wig mass, not the strands, and three
// references disagreed by up to 81 deg. That is a non-answer, and it is
// reported rather than dressed up.
//
// This version resamples each image onto a common viewBox grid, removes
// everything coarser than the strands (I - Gaussian(sigma_lo)) and everything
// finer than them (Gaussian(sigma_hi)), and only then runs the structure
// tensor. The band is set from the file's own measured pitch: `RELIEF.Washington`
// records the coin's wig as "pitch 0.95-1.75 viewBox units (per-reference
// medians 1.10 / 1.45 / 1.30)", so the strand scale is ~1.3 units and the band
// is sigma_hi 0.30 .. sigma_lo 2.2 units.
//
// ⚠️ NULL TESTS FIRST, because coins.js records a predecessor that "returned
// coherence 1.000 at 0 degrees and did not respond when the art changed":
//   N1 synthetic stripes at seven known angles, THROUGH THE WHOLE PIPELINE
//   N2 a flat field must produce no direction
//   N3 stripes at the strand pitch buried under a strong low-frequency ramp —
//      the exact confound that defeated v1 — must still come back correct
//   N4 our own render must return the TANGENT the emitted path data draws at
//      its own mid-arc point (CORRECTED v1.96.0 — see the note beside the test)
//
// CONVENTION: screen frame, 0 = +x (right), positive = DOWN, modulo 180.
//
// Run: node coloringbook/judge/_qo5field.mjs
import { STRUCK, disc, grey, atVB, ours, atVBours } from './_qo1zoom.mjs';
import { MARKS, toView } from './_qo4marks.mjs';

const D2R = Math.PI / 180;
const X0 = 38, Y0 = 10, X1 = 86, Y1 = 62, PPU = 10;      // viewBox window and resolution
const W = (X1 - X0) * PPU, H = (Y1 - Y0) * PPU;
const gx = (i) => X0 + (i + 0.5) / PPU, gy = (j) => Y0 + (j + 0.5) / PPU;

function gauss(src, sigmaUnits) {
  const s = sigmaUnits * PPU;
  const r = Math.max(1, Math.ceil(3 * s));
  const k = []; let sum = 0;
  for (let t = -r; t <= r; t++) { const v = Math.exp(-t * t / (2 * s * s)); k.push(v); sum += v; }
  for (let t = 0; t < k.length; t++) k[t] /= sum;
  const tmp = new Float64Array(W * H), out = new Float64Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    let a = 0; for (let t = -r; t <= r; t++) a += k[t + r] * src[j * W + Math.max(0, Math.min(W - 1, i + t))];
    tmp[j * W + i] = a;
  }
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    let a = 0; for (let t = -r; t <= r; t++) a += k[t + r] * tmp[Math.max(0, Math.min(H - 1, j + t)) * W + i];
    out[j * W + i] = a;
  }
  return out;
}

const SIG_HI = 0.30, SIG_LO = 2.2;      // the strand band, in viewBox units
function bandpass(src) {
  const lo = gauss(src, SIG_LO), hi = gauss(src, SIG_HI);
  const out = new Float64Array(W * H);
  for (let p = 0; p < W * H; p++) out[p] = hi[p] - lo[p];
  return out;
}

/** structure tensor at viewBox (X,Y) with a Gaussian window of sigma `sw` units */
function tensorAt(band, X, Y, sw = 2.0) {
  const ci = (X - X0) * PPU - 0.5, cj = (Y - Y0) * PPU - 0.5;
  const r = Math.ceil(2.5 * sw * PPU);
  let Jxx = 0, Jxy = 0, Jyy = 0;
  for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) {
    const i = Math.round(ci + di), j = Math.round(cj + dj);
    if (i < 1 || j < 1 || i >= W - 1 || j >= H - 1) continue;
    const w = Math.exp(-(di * di + dj * dj) / (2 * (sw * PPU) ** 2));
    const Ix = (band[j * W + i + 1] - band[j * W + i - 1]) / 2;
    const Iy = (band[(j + 1) * W + i] - band[(j - 1) * W + i]) / 2;
    Jxx += w * Ix * Ix; Jxy += w * Ix * Iy; Jyy += w * Iy * Iy;
  }
  const tr = Jxx + Jyy, det = Jxx * Jyy - Jxy * Jxy;
  const d = Math.sqrt(Math.max(0, tr * tr / 4 - det));
  let s = 0.5 * Math.atan2(2 * Jxy, Jxx - Jyy) / D2R + 90;
  while (s > 90) s -= 180; while (s <= -90) s += 180;
  return { deg: +s.toFixed(1), coh: +(tr > 0 ? d * 2 / tr : 0).toFixed(3) };
}

const build = (sample) => { const a = new Float64Array(W * H); for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) a[j * W + i] = sample(gx(i), gy(j)); return a; };
const dev = (a, b) => { let d = ((a - b + 90) % 180 + 180) % 180 - 90; return d; };

console.log('=== NULL TESTS ===');
let bad = 0;
const stripes = (ang, period = 1.3, amp = 40, ramp = 0) => {
  const t = ang * D2R, nx = -Math.sin(t), ny = Math.cos(t);
  return (X, Y) => 128 + amp * Math.sin(2 * Math.PI * (X * nx + Y * ny) / period) + ramp * (X - X0) / (X1 - X0) * 120;
};
for (const want of [-70, -40, -7.3, 0, 10.9, 48, 54.1, 75]) {
  const t = tensorAt(bandpass(build(stripes(want))), 60, 35);
  const ok = Math.abs(dev(t.deg, want)) < 2 && t.coh > 0.85;
  if (!ok) bad++;
  console.log(`  N1 stripes ${String(want).padStart(6)} -> ${String(t.deg).padStart(6)}  coh ${t.coh}  ${ok ? 'ok' : '!! FAIL'}`);
}
{
  const t = tensorAt(bandpass(build(() => 137)), 60, 35);
  const ok = t.coh < 0.10; if (!ok) bad++;
  console.log(`  N2 flat -> coh ${t.coh}  ${ok ? 'ok' : '!! FAIL'}`);
  const t3 = tensorAt(bandpass(build(stripes(48, 1.3, 12, 1))), 60, 35);
  const ok3 = Math.abs(dev(t3.deg, 48)) < 3 && t3.coh > 0.8; if (!ok3) bad++;
  console.log(`  N3 stripes 48 at amp 12 under a 120-level ramp -> ${t3.deg}  coh ${t3.coh}  ${ok3 ? 'ok (the confound that defeated v1 is handled)' : '!! FAIL'}`);
}
const o = await ours(2000);
const oursBand = bandpass(build((X, Y) => atVBours(o, X, Y)));
// ⚠️ CORRECTED 2026-08-24 (v1.96.0). N4 used to compare the tensor's reading at
// a mark's midpoint with that mark's CHORD angle. That is only the same question
// when the mark is straight, and it silently encoded the assumption that they
// are: once `RELIEF.Washington`'s wig was re-authored as integral curves of this
// very field, lit[4] read 15.2 against a chord of 23.9 and lit[6] 48.6 against
// 40.6, and this instrument refused to report on art that is CLOSER to the coin
// than the art it was written for. The tensor measures a LOCAL direction, so the
// thing it must reproduce is the LOCAL TANGENT. For a straight mark the two are
// identical, so nothing about the round-11 measurement is weakened by the fix.
const tangentAtMid = (m) => {
  const toks = m.d.match(/[MmLlCcQqZz]|[-+]?(?:\d*\.\d+|\d+\.?)/g);
  let i = 0, cmd = '', cx = 0, cy = 0; const P = [];
  const num = () => parseFloat(toks[i++]);
  while (i < toks.length) {
    if (/[A-Za-z]/.test(toks[i])) cmd = toks[i++];
    if (cmd === 'M') { cx = num(); cy = num(); P.push([cx, cy]); cmd = 'L'; }
    else if (cmd === 'L') { cx = num(); cy = num(); P.push([cx, cy]); }
    else if (cmd === 'C') {
      const x1 = num(), y1 = num(), x2 = num(), y2 = num(), x3 = num(), y3 = num();
      for (let t = 1; t <= 100; t++) {
        const u = t / 100, v = 1 - u;
        P.push([v * v * v * cx + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * x3,
          v * v * v * cy + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * y3]);
      }
      cx = x3; cy = y3;
    } else throw new Error('_qo5field: N4 cannot flatten command ' + cmd);
  }
  const S = P.map(toView);   // the LIVE head transform, not a copy of it
  // AND SAMPLED AT THE MID-ARC POINT, NOT THE CHORD MIDPOINT. A curved mark's
  // chord midpoint need not lie on the mark at all: measured on the re-authored
  // wig it is up to 2.99 viewBox units away (lit6 2.99, groove6 2.86, groove3
  // 2.08), far enough to be sitting on a NEIGHBOURING mark. At lit6's chord
  // midpoint this tensor reads 51 deg at every window from sigma 0.5 to 1.1 — it
  // is not a window artefact, it is the wrong place. The same fact is why the
  // published chord-vs-chord-midpoint metric below is still printed but is no
  // longer the question this face is judged on.
  const cum = [0];
  for (let k = 1; k < S.length; k++) cum.push(cum[k - 1] + Math.hypot(S[k][0] - S[k - 1][0], S[k][1] - S[k - 1][1]));
  const half = cum[cum.length - 1] / 2;
  let bi = 1; while (bi < cum.length - 1 && cum[bi] < half) bi++;
  const a = S[Math.max(0, bi - 3)], b = S[Math.min(S.length - 1, bi + 3)];
  let t = Math.atan2(b[1] - a[1], b[0] - a[0]) / D2R;
  while (t > 90) t -= 180; while (t <= -90) t += 180;
  return { at: S[bi], deg: +t.toFixed(1) };
};
for (const idx of [0, 3, 4, 6]) {
  const m = MARKS.find((k) => k.group.startsWith('lit') && k.i === idx);
  const tan = tangentAtMid(m);
  const t = tensorAt(oursBand, tan.at[0], tan.at[1], 1.1);
  const ok = Math.abs(dev(t.deg, tan.deg)) < 8; if (!ok) bad++;
  console.log(`  N4 our lit[${idx}] at its MID-ARC point (${tan.at[0].toFixed(1)},${tan.at[1].toFixed(1)}) -> ${String(t.deg).padStart(6)} vs the authored TANGENT there ${String(tan.deg).padStart(6)} (chord ${String(m.deg).padStart(6)})  coh ${t.coh}  ${ok ? 'ok' : '!! FAIL'}`);
}
if (bad) { console.log(`\n!! ${bad} null tests failed — nothing reported.`); process.exit(1); }
console.log('  all null tests pass.\n');

const BAND = {};
for (const f of STRUCK) { const d = await disc(f); const g = await grey(f); BAND[f] = bandpass(build((X, Y) => atVB(g, d, X, Y))); }

const L2V = ([lx, ly]) => [+(49.6 - 0.98 * lx).toFixed(2), +(41.8 + 0.98 * ly).toFixed(2)];
const LOCI = [
  ['crown       (-6,-18)', [-6, -18], -7.3],
  ['mid-mass   (-14,-12)', [-14, -12], 10.9],
  ['back      (-18.5,-3)', [-18.5, -3], 54.1],
  ['over curls   (-8, 2)', [-8, 2], 20.5],
];
console.log("=== coins.js's own four loci, re-derived ===");
console.log('locus                 file says     OURS       ' + STRUCK.map((f) => f.replace('quarter-obv', 'q').replace(/\.(jpg|png)$/, '').padStart(16)).join('') + '     coin mean');
for (const [name, loc, claimed] of LOCI) {
  const [X, Y] = L2V(loc);
  const mine = tensorAt(oursBand, X, Y, 2.0);
  let row = `${name.padEnd(22)}${String(claimed).padStart(6)}   ${String(mine.deg).padStart(6)} [${mine.coh}]`;
  const use = [];
  for (const f of STRUCK) {
    const t = tensorAt(BAND[f], X, Y, 2.0);
    row += `${String(t.deg).padStart(8)} [${t.coh}]`;
    if (t.coh >= 0.25) use.push(t.deg);
  }
  if (use.length >= 2) {
    let sx = 0, sy = 0; for (const a of use) { sx += Math.cos(2 * a * D2R); sy += Math.sin(2 * a * D2R); }
    const mean = 0.5 * Math.atan2(sy, sx) / D2R;
    const worst = Math.max(...use.map((a) => Math.abs(dev(a, mean))));
    row += `   ${mean.toFixed(1).padStart(6)} (n=${use.length}, worst dev ${worst.toFixed(1)})  OURS-COIN ${dev(mine.deg, mean).toFixed(1).padStart(6)}`;
  } else row += '   UNMEASURED (fewer than two references have a direction here)';
  console.log(row);
}

console.log('\n=== every one of our own wig marks, at ITS OWN midpoint ===');
console.log('the question each row asks: at the place we drew a strand, which way does the coin run?\n');
console.log('mark                 ours   ' + STRUCK.map((f) => f.replace('quarter-obv', 'q').replace(/\.(jpg|png)$/, '').padStart(16)).join('') + '     coin mean   ours-coin');
const rows = [];
for (const m of MARKS) {
  if (!(m.group.startsWith('grooves') || m.group.startsWith('lit')) || m.len < 6) continue;
  if (m.mid[0] < X0 + 3 || m.mid[0] > X1 - 3) continue;
  const [X, Y] = m.mid;
  let row = `${(m.group.slice(0, 7) + '[' + m.i + ']').padEnd(12)}${String(m.deg).padStart(7)}   `;
  const use = [];
  for (const f of STRUCK) {
    const t = tensorAt(BAND[f], X, Y, 2.0);
    row += `${String(t.deg).padStart(8)} [${t.coh}]`;
    if (t.coh >= 0.25) use.push(t.deg);
  }
  if (use.length >= 2) {
    let sx = 0, sy = 0; for (const a of use) { sx += Math.cos(2 * a * D2R); sy += Math.sin(2 * a * D2R); }
    const mean = 0.5 * Math.atan2(sy, sx) / D2R;
    const worst = Math.max(...use.map((a) => Math.abs(dev(a, mean))));
    const d = dev(m.deg, mean);
    rows.push({ m, mean, d, n: use.length, worst });
    row += `   ${mean.toFixed(1).padStart(6)} (n=${use.length}, worst ${worst.toFixed(1)})  ${d.toFixed(1).padStart(7)}`;
  } else row += '   UNMEASURED';
  console.log(row);
}
if (rows.length) {
  const abs = rows.map((r) => Math.abs(r.d)).sort((a, b) => a - b);
  const pos = rows.filter((r) => r.d > 0).length, neg = rows.filter((r) => r.d < 0).length;
  const decided = rows.filter((r) => Math.abs(r.d) > r.worst);
  console.log(`\n${rows.length} of our wig marks sit where at least two references agree on a direction.`);
  console.log(`  |ours - coin|   median ${abs[abs.length >> 1].toFixed(1)} deg   worst ${abs[abs.length - 1].toFixed(1)} deg`);
  console.log(`  sign            ${pos} shallower-than-coin(+), ${neg} steeper(-)`);
  console.log(`  ${decided.length} of ${rows.length} marks are out by MORE than the spread between the references at that same point`);
  console.log('  (a mark whose error is smaller than the references\' own disagreement is UNRESOLVED, not wrong)');
}
