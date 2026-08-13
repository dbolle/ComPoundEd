// ROUND 2, TASK 1a — INDEPENDENCE OF THE QUARTER-REVERSE REFERENCES (§21.5).
//
// Two files were byte-identical once already, and the dime's two "references"
// turned out to be one photograph at NCC 0.9931 against a 0.014 control. So
// before any of these five files is allowed to count as evidence, every PAIR is
// correlated, and the same-design question is asked explicitly.
//
// Method:
//   1. fit each disc (§2.1), report the p95 boundary residual as % of R —
//      that is the squareness check, and an oblique shot fails it;
//   2. disc-normalise all of them onto one 512x512 (u,v) grid (_rvnorm);
//   3. normalised cross-correlation inside r<=0.90R (excludes rim + background),
//      after removing each image's own mean and sd — so exposure and white
//      point cannot manufacture agreement;
//   4. CONTROLS, printed in the same table and not separately: the same
//      correlation against three reverses that are definitely different designs
//      (nickel, penny, dime). Those give the floor.
//
// §4.1 (null test): NCC is bounded [-1, 1]. A result at either bound is
// reported as a failure. §4.2 (selection): this instrument SELECTS nothing —
// it prints the whole matrix.
import { normalise, N, SPAN, DISCS } from '../_rvnorm.mjs';
import { fit } from '../_rvdisc.mjs';

export const QREV = ['quarter-rev.jpg', 'quarter-rev-2.png', 'quarter-rev-3.jpg',
  'quarter-rev-5.jpg', 'quarter-rev-6.jpg'];
export const CONTROLS = ['nickel-rev-2.png', 'penny-rev-2.png', 'dime-rev-2.jpg'];

// mask: inside 0.90R, so the rim, the reeding and the background are all out.
function mask(rmax = 0.90) {
  const m = new Uint8Array(N * N);
  for (let j = 0; j < N; j++) {
    const v = -SPAN + 2 * SPAN * j / (N - 1);
    for (let i = 0; i < N; i++) {
      const u = -SPAN + 2 * SPAN * i / (N - 1);
      m[j * N + i] = Math.hypot(u, v) <= rmax ? 1 : 0;
    }
  }
  return m;
}

export function ncc(a, b, m) {
  let n = 0, sa = 0, sb = 0;
  for (let p = 0; p < a.length; p++) if (m[p]) { n++; sa += a[p]; sb += b[p]; }
  const ma = sa / n, mb = sb / n;
  let saa = 0, sbb = 0, sab = 0;
  for (let p = 0; p < a.length; p++) if (m[p]) {
    const da = a[p] - ma, db = b[p] - mb;
    saa += da * da; sbb += db * db; sab += da * db;
  }
  return sab / Math.sqrt(saa * sbb);
}

// |grad| energy of a reference, disc-normalised onto the same NxN (u,v) grid,
// then blurred by `rb` (in units of R). Illumination direction changes the SIGN
// of a relief step's grey but not the fact that there IS a step, so this is the
// feature that survives two different lightings of one die.
export async function energyGrid(file, disc, rb = 0.02) {
  const { energy } = await import('../_qtedge.mjs');
  const { G, W, H } = await energy(file, disc);
  const out = new Float64Array(N * N);
  for (let j = 0; j < N; j++) {
    const v = -SPAN + 2 * SPAN * j / (N - 1);
    for (let i = 0; i < N; i++) {
      const u = -SPAN + 2 * SPAN * i / (N - 1);
      const x = disc.cx + u * disc.R, y = disc.cy + v * disc.R;
      const x0 = Math.round(x), y0 = Math.round(y);
      out[j * N + i] = (x0 > 0 && y0 > 0 && x0 < W && y0 < H) ? G[y0 * W + x0] : 0;
    }
  }
  // separable box blur, radius = rb in grid cells
  const rad = Math.max(1, Math.round(rb * (N - 1) / (2 * SPAN)));
  const tmp = new Float64Array(N * N), res = new Float64Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    let s = 0, n = 0;
    for (let k = -rad; k <= rad; k++) { const ii = i + k; if (ii >= 0 && ii < N) { s += out[j * N + ii]; n++; } }
    tmp[j * N + i] = s / n;
  }
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    let s = 0, n = 0;
    for (let k = -rad; k <= rad; k++) { const jj = j + k; if (jj >= 0 && jj < N) { s += tmp[jj * N + i]; n++; } }
    res[j * N + i] = s / n;
  }
  return res;
}

// best NCC of `a` against `b` warped by (rotation, du, dv). Returns the whole
// argmax so the caller can null-test it against the search bounds.
export function bestReg(a, b, m, ROT, TR, step = 4) {
  const c2i = (c) => (c + SPAN) * (N - 1) / (2 * SPAN);
  const i2c = (i) => -SPAN + 2 * SPAN * i / (N - 1);
  const idx = [];
  for (let j = 0; j < N; j += step) for (let i = 0; i < N; i += step) if (m[j * N + i]) idx.push(j * N + i);
  const score = (deg, du, dv) => {
    const th = deg * Math.PI / 180, C = Math.cos(th), S = Math.sin(th);
    let n = 0, sa = 0, sb = 0, saa = 0, sbb = 0, sab = 0;
    for (const p of idx) {
      const i = p % N, j = (p - i) / N;
      const u = i2c(i), v = i2c(j);
      const ii = Math.round(c2i(C * u - S * v + du)), jj = Math.round(c2i(S * u + C * v + dv));
      if (ii < 0 || jj < 0 || ii >= N || jj >= N) continue;
      const A = a[p], B = b[jj * N + ii];
      n++; sa += A; sb += B; saa += A * A; sbb += B * B; sab += A * B;
    }
    const cov = sab / n - (sa / n) * (sb / n);
    return cov / Math.sqrt((saa / n - (sa / n) ** 2) * (sbb / n - (sb / n) ** 2));
  };
  // coarse pass over the declared bounds, then one local refine at half step.
  let best = { ncc: -2, rot: null, du: null, dv: null };
  for (const deg of ROT) for (const du of TR) for (const dv of TR) {
    const r = score(deg, du, dv);
    if (r > best.ncc) best = { ncc: r, rot: deg, du, dv };
  }
  for (const deg of [best.rot - 0.5, best.rot, best.rot + 0.5])
    for (const du of [best.du - 0.005, best.du, best.du + 0.005])
      for (const dv of [best.dv - 0.005, best.dv, best.dv + 0.005]) {
        const r = score(deg, du, dv);
        if (r > best.ncc) best = { ncc: r, rot: deg, du: +du.toFixed(4), dv: +dv.toFixed(4) };
      }
  return best;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const files = [...QREV, ...CONTROLS];
  const discs = {};
  console.log('=== step 1: disc fits (§2.1). p95 = 95th pct |boundary residual| as % of R ===');
  for (const f of files) {
    const r = await fit(f);
    discs[f] = { cx: +r.cx.toFixed(2), cy: +r.cy.toFixed(2), R: +r.R.toFixed(2) };
    const flag = (100 * r.p95 / r.R) > 1.0 ? '   <-- NOT SQUARE-ON (§2.1: get a better photograph)' : '';
    console.log(`${f.padEnd(20)} ${String(r.W).padStart(4)}x${String(r.H).padEnd(4)} via ${String(r.via).padEnd(6)} cx ${r.cx.toFixed(2)} cy ${r.cy.toFixed(2)} R ${r.R.toFixed(2)}  p95 ${(100 * r.p95 / r.R).toFixed(2)}% of R${flag}`);
  }
  console.log('\nDISCS (paste-able):');
  console.log(JSON.stringify(discs, null, 1));

  const G = {};
  for (const f of files) G[f] = await normalise(f, discs[f]);
  const m = mask(0.90);
  let nm = 0; for (let p = 0; p < m.length; p++) nm += m[p];

  console.log(`\n=== step 2: NCC on disc-normalised grey, inside r<=0.90R (${nm} px of ${N * N}) ===`);
  console.log('bounds: NCC in [-1, +1]. A value AT a bound is a failure report, not a value (§4.1).');
  const hdr = '                     ' + files.map((f) => f.slice(8, 15).padStart(8)).join('');
  console.log(hdr);
  const M = {};
  for (const a of files) {
    const row = [];
    for (const b of files) { const v = ncc(G[a], G[b], m); M[a + '|' + b] = v; row.push(v.toFixed(4).padStart(8)); }
    console.log(a.padEnd(21) + row.join(''));
  }

  // self-check: the diagonal must be exactly 1, and if it is not the estimator
  // is broken (§4 response test's degenerate half).
  const diag = files.map((f) => M[f + '|' + f]);
  console.log(`\ndiagonal (must be 1.0000 exactly): ${diag.map((v) => v.toFixed(6)).join(' ')}`);
  if (diag.some((v) => Math.abs(v - 1) > 1e-9)) throw new Error('NCC self-correlation != 1 — instrument UNTRUSTED');

  // response test: correlate a file against itself shifted by 2% of R. It must drop.
  const shift = (g, du) => {
    const o = new Float64Array(N * N);
    const s = Math.round(du * (N - 1) / (2 * SPAN));
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const ii = i - s; o[j * N + i] = (ii >= 0 && ii < N) ? g[j * N + ii] : 255;
    }
    return o;
  };
  console.log('\n=== §4 response test: correlate each file with ITSELF shifted in u ===');
  for (const f of QREV) {
    const r = [0.01, 0.02, 0.05, 0.10].map((d) => `${d}R:${ncc(G[f], shift(G[f], d), m).toFixed(4)}`);
    console.log(`${f.padEnd(21)} 0R:1.0000 ${r.join(' ')}`);
  }

  // -------------------------------------------------------------------------
  // §4.3. Raw-grey NCC answers "is this the same PHOTOGRAPH". It does NOT
  // answer "is this the same DESIGN", and its own response test says why: on
  // quarter-rev-3 a shift of 0.01R already costs 0.55 of correlation, so the
  // statistic is registration-limited and two honest photographs of one design
  // at 2 degrees of relative rotation score like two different coins. Asking
  // it the design question would be the round-0 mistake in a new place.
  //
  // The design question therefore gets its own statistic:
  //   feature  = |grad| energy (relief lives there whatever the illumination),
  //              blurred to 0.02R so fine frost and JPEG do not dominate,
  //   estimate = best NCC over a search of rotation and translation.
  // Bounds are printed and a best-at-a-bound is a failure report (§4.1).
  console.log('\n=== step 2b: DESIGN identity — registered NCC on blurred |grad| energy ===');
  const RB = 0.02;                       // blur, in units of R
  const feat = {};
  for (const f of files) feat[f] = await energyGrid(f, discs[f], RB);
  const mD = mask(0.86);                 // tighter: keep the legend, drop the rim
  const ROT = [], TR = [];
  for (let d = -8; d <= 8; d += 2) ROT.push(d);
  for (let t = -0.03; t <= 0.0301; t += 0.015) TR.push(+t.toFixed(3));
  console.log(`search bounds: rotation ${ROT[0]}..${ROT[ROT.length - 1]} deg (step 2, refined to 0.5); translation ${TR[0]}..${TR[TR.length - 1]} R (step 0.015, refined to 0.005) in u and v`);
  const D = {};
  for (const a of files) {
    const row = [];
    for (const b of files) {
      const key = a + '|' + b, rev = b + '|' + a;
      const r = D[rev] ? { ...D[rev], rot: -D[rev].rot } : bestReg(feat[a], feat[b], mD, ROT, TR);
      D[key] = r;
      row.push(r.ncc.toFixed(3).padStart(7));
    }
    console.log(a.padEnd(21) + row.join(''));
  }
  const atBound = [];
  for (const a of QREV) for (const b of QREV) {
    if (a === b) continue;
    const r = D[a + '|' + b];
    if (Math.abs(r.rot) === 10 || Math.abs(r.du) >= 0.04 || Math.abs(r.dv) >= 0.04) atBound.push(`${a}|${b} rot ${r.rot} du ${r.du} dv ${r.dv}`);
  }
  console.log(atBound.length ? `NULL TEST FAILURES (best at a search bound — these are NOT values):\n  ${atBound.join('\n  ')}`
    : 'null test: every best-fit is interior to the search bounds. PASS');

  console.log('\n=== step 3: verdicts ===');
  const ctlPairs = [];
  for (const a of QREV) for (const c of CONTROLS) ctlPairs.push(D[a + '|' + c].ncc);
  const FLOOR = Math.max(...ctlPairs);
  console.log(`control floor = max registered design-NCC of any quarter-reverse file against a KNOWN-different design = ${FLOOR.toFixed(4)}`);
  const seen = new Set();
  for (const a of QREV) for (const b of QREV) {
    if (a === b || seen.has(b + '|' + a)) continue;
    seen.add(a + '|' + b);
    const raw = M[a + '|' + b], d = D[a + '|' + b];
    let call;
    if (raw > 0.95) call = 'SAME PHOTOGRAPH — must NOT be counted as two references';
    else if (d.ncc > FLOOR + 0.15) call = `same design, different photograph — INDEPENDENT (rot ${d.rot} deg)`;
    else call = 'DIFFERENT DESIGN — not a reference for this coin';
    console.log(`${a.padEnd(20)} vs ${b.padEnd(20)} raw ${raw.toFixed(4)}  design ${d.ncc.toFixed(4)}   ${call}`);
  }
}
