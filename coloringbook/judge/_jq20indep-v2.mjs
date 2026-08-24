// REGISTERED INDEPENDENCE — v2. THE REFINE IS ANCHORED, AND A BOUNDED FIT SAYS SO.
//
// ── WHY THERE IS A v2 (ledger A24) ─────────────────────────────────────────
// `_jq20indep.bestReg` refines its coarse argmax like this:
//
//     for (const deg of [best.rot - 0.5, best.rot, best.rot + 0.5])
//       for (const du of [best.du - 0.005, best.du, best.du + 0.005])
//         for (const dv of [best.dv - 0.005, best.dv, best.dv + 0.005]) {
//           if (r > best.ncc) best = { ... };          // <-- reassigns `best`
//         }
//
// A `for...of` re-evaluates its iterable every time the loop is ENTERED, and
// the two inner loops are entered 3 and 9 times. So each time the body improves
// `best`, the next neighbourhood is rebuilt around the NEW answer and the
// search crawls away from the space the instrument declares it searched
// ("translation -0.03..0.03 R, refined to 0.005").
//
// MEASURED, over the 231 within-pool reference pairs the primary gate uses:
//
//     148 of 231 (64.1 %) of registrations finished OUTSIDE the declared
//     +-0.035 R envelope. Worst translation 0.075 R -- 2.5x the declared 0.03.
//     NCC inflation vs the anchored search: mean +0.0077, max +0.0537.
//
// The walk is one-sided (it is greedy on the same score, so it can only RAISE
// NCC) and, worse, it is PATH-DEPENDENT: `dv` reached 0.075 while `du` stopped
// at 0.045, purely because `dv` is the inner loop and gets nine rebuilds to
// `du`'s three. A registration whose answer depends on loop nesting order is
// not a measurement of the photographs.
//
// ── WHY THE OLD FILE IS NOT EDITED ─────────────────────────────────────────
// `_jq20indep.mjs` is hashed at `80aec1aa76b7dd1d…` into `_jd0hashes.json:47`,
// `_jp0hashes.json:82`, `nickel-scorecard.json:30` and `penny-scorecard.json:35`.
// COIN-JUDGE.md 1.1: retract BESIDE, never rewrite -- the faulty instrument is
// kept at its old hash so any number ever published can still be reproduced.
// It is therefore left byte-identical and this file sits next to it.
//
// ── WHAT MOVED, PUBLISHED RATHER THAN QUIETLY REPLACED ─────────────────────
// The primary gate `_jt1transfer.mjs` was re-run against both. The verdict did
// NOT change -- T1 is 32/32 before and after -- and neither did any diagonal
// (same-denomination) cell. What moved is every OFF-diagonal cell, because a
// true match's optimum is interior while a mismatch's sits on the bound and is
// exactly what the walk crawls past. The corrected table is published in the
// round report beside the old one. Every T1 margin widened or held:
//
//     obverse 38px  nickel 0.187 -> 0.205   dime 0.284 -> 0.302
//     reverse 38px  penny  0.275 -> 0.283   dime 0.215 -> 0.228
//
// So the walk was making the gate look WORSE than the drawings are. It never
// manufactured a pass; it understated every margin it touched.
//
// Everything above `bestReg` is carried over from `_jq20indep.mjs` unchanged,
// so the two differ in exactly one function and can be compared directly.
//
// Verify:  node coloringbook/judge/_jq20indep-v2.mjs
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
  // ANCHORED. `_jq20indep.mjs` writes these three arrays in terms of `best`,
  // which the loop body reassigns, so JS rebuilds them on every re-entry and
  // the neighbourhood crawls after the answer. Snapshot first.
  const c = { ...best };
  for (const deg of [c.rot - 0.5, c.rot, c.rot + 0.5])
    for (const du of [c.du - 0.005, c.du, c.du + 0.005])
      for (const dv of [c.dv - 0.005, c.dv, c.dv + 0.005]) {
        const r = score(deg, du, dv);
        if (r > best.ncc) best = { ncc: r, rot: deg, du: +du.toFixed(4), dv: +dv.toFixed(4) };
      }
  // §4.1 — SAY SO WHEN THE ANSWER IS ON A BOUND. A best-fit at the edge of the
  // search is a LOWER BOUND on the true optimum, not the optimum, and callers
  // have been quoting those as values. The declared envelope is the coarse
  // bound plus one refine step; `atBound` is the caller's cue that the number
  // is a floor. This is what `_jq20indep.bestReg` had no way to say.
  const rotMax = Math.max(...ROT.map(Math.abs)) + 0.5;
  const trMax = Math.max(...TR.map(Math.abs)) + 0.005;
  best.atBound = Math.abs(best.rot) >= rotMax - 1e-9
    || Math.abs(best.du) >= trMax - 1e-9 || Math.abs(best.dv) >= trMax - 1e-9;
  best.bounds = { rotMax, trMax };
  return best;
}

// ── SELFTEST / NULL TEST ───────────────────────────────────────────────────
// The bug is invisible on any score function whose optimum is interior, which
// is why it survived: a detector that never sees a walk reports zero and looks
// like a clean bill of health. (That happened once while measuring this very
// finding.) So the null test uses a score whose optimum lies OUTSIDE the
// declared bound, where the walking form must walk and this one must not.
if (import.meta.url === `file://${process.argv[1]}`) {
  const walking = (score, best) => {
    for (const deg of [best.rot - 0.5, best.rot, best.rot + 0.5])
      for (const du of [best.du - 0.005, best.du, best.du + 0.005])
        for (const dv of [best.dv - 0.005, best.dv, best.dv + 0.005]) {
          const r = score(deg, du, dv);
          if (r > best.ncc) best = { ncc: r, rot: deg, du: +du.toFixed(4), dv: +dv.toFixed(4) };
        }
    return best;
  };
  const anchored = (score, coarse) => {
    let best = { ...coarse };
    const R = [coarse.rot - 0.5, coarse.rot, coarse.rot + 0.5];
    const U = [coarse.du - 0.005, coarse.du, coarse.du + 0.005];
    const V = [coarse.dv - 0.005, coarse.dv, coarse.dv + 0.005];
    for (const deg of R) for (const du of U) for (const dv of V) {
      const r = score(deg, du, dv);
      if (r > best.ncc) best = { ncc: r, rot: deg, du: +du.toFixed(4), dv: +dv.toFixed(4) };
    }
    return best;
  };
  const r = [];
  // 1. a ramp whose optimum is far outside the bound: the walk must escape.
  const ramp = (deg, du, dv) => -(Math.abs(du - 0.2) + Math.abs(dv - 0.2) + Math.abs(deg) * 1e-4);
  const coarse = { ncc: ramp(0, 0.03, 0.03), rot: 0, du: 0.03, dv: 0.03 };
  const w = walking(ramp, { ...coarse }), a = anchored(ramp, coarse);
  r.push(['the walking refine leaves the +-0.035 envelope', Math.max(Math.abs(w.du), Math.abs(w.dv)) > 0.035, true]);
  r.push(['  it drifts further in dv (inner loop) than du', Math.abs(w.dv) > Math.abs(w.du), true]);
  r.push(['the anchored refine stays inside it', Math.max(Math.abs(a.du), Math.abs(a.dv)) <= 0.0351, true]);
  // 2. an optimum that IS the coarse argmax: the two must agree exactly, so v2
  //    is the same metric and not a differently-tuned one. (An earlier version
  //    of this check put the optimum at the origin while the coarse argmax was
  //    at 0.015, and the walking form legitimately crawled toward it — the two
  //    disagreed for a reason that had nothing to do with the bug. A control
  //    has to isolate the thing it is controlling for.)
  const bump = (deg, du, dv) => -((du - 0.015) ** 2 + (dv - 0.015) ** 2) - Math.abs(deg) * 1e-4;
  const c2 = { ncc: bump(0, 0.015, 0.015), rot: 0, du: 0.015, dv: 0.015 };
  const w2 = walking(bump, { ...c2 }), a2 = anchored(bump, c2);
  r.push(['interior optimum: walking and anchored agree', Math.abs(w2.ncc - a2.ncc) < 1e-12, true]);
  // 3. atBound must fire on a bound and not fire off it.
  const ROT = []; for (let d = -8; d <= 8; d += 2) ROT.push(d);
  const TR = []; for (let t = -0.03; t <= 0.0301; t += 0.015) TR.push(+t.toFixed(3));
  const M = new Uint8Array(N * N).fill(1);
  const g = (fn) => { const o = new Float64Array(N * N);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) o[j * N + i] = fn(i, j); return o; };
  const base = g((i, j) => Math.sin(i / 7) * Math.cos(j / 9) * 100);
  const same = bestReg(base, base, M, ROT, TR);
  r.push(['identical grids: NCC is 1', Math.abs(same.ncc - 1) < 1e-9, true]);
  r.push(['identical grids: not atBound', same.atBound, false]);
  // shift the second grid far enough that the best fit must sit on the bound
  const far = g((i, j) => Math.sin((i - 60) / 7) * Math.cos(j / 9) * 100);
  const shoved = bestReg(base, far, M, ROT, TR);
  r.push(['a fit driven onto the bound reports atBound', shoved.atBound, true]);
  console.log('_jq20indep-v2.mjs SELFTEST');
  let bad = 0;
  for (const [what, got, want] of r) {
    const ok = got === want; if (!ok) bad++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${what.padEnd(48)} got ${String(got).padStart(5)}  want ${String(want).padStart(5)}`);
  }
  console.log(`  the walk it replaces reached du ${w.du} dv ${w.dv} against a declared +-0.035`);
  console.log(bad ? `SELFTEST FAIL (${bad})` : 'SELFTEST PASS — the refine cannot leave its declared bounds, and says so when it lands on one');
  process.exit(bad ? 1 : 0);
}
