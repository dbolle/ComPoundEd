// SPECIALIST, quarter reverse — §4.1 NULL TEST on _jq42indep's design-NCC.
//
// The eye (_sq1-refpool.png) says quarter-rev.jpg, quarter-rev-5.jpg and
// q1995d-rev.png are all the 1932-1998 heraldic-eagle reverse. The instrument
// calls every one of them "DIFFERENT DESIGN". One of the two is wrong.
//
// This script does NOT edit _jq42indep.mjs or _jq20indep.mjs. It imports
// bestReg unedited and calls it with (a) the instrument's own bounds, printing
// the argmax so a bound hit is visible, and (b) widened bounds plus a SCALE
// sweep, which bestReg has no term for at all.
//
// Generator for the numbers quoted in the round report.
import { bestReg, ncc } from './_jq20indep.mjs';
import { energyGrid } from './_jq20indep.mjs';
import { discOf } from './_jq42indep.mjs';
import { normalise, N, SPAN } from '../_rvnorm.mjs';

function mask(rmax) {
  const m = new Uint8Array(N * N);
  for (let j = 0; j < N; j++) { const v = -SPAN + 2 * SPAN * j / (N - 1);
    for (let i = 0; i < N; i++) { const u = -SPAN + 2 * SPAN * i / (N - 1);
      m[j * N + i] = Math.hypot(u, v) <= rmax ? 1 : 0; } }
  return m;
}
const mDes = mask(0.86);

const ROT0 = []; for (let d = -8; d <= 8; d += 2) ROT0.push(d);
const TR0 = []; for (let t = -0.03; t <= 0.0301; t += 0.015) TR0.push(+t.toFixed(3));
const ROT1 = []; for (let d = -30; d <= 30; d += 2) ROT1.push(d);
const TR1 = []; for (let t = -0.09; t <= 0.0901; t += 0.015) TR1.push(+t.toFixed(3));
const SCALES = [0.88, 0.92, 0.96, 1.00, 1.04, 1.08, 1.12];

// ANCHOR = the file every candidate is tested against. quarter-rev-2.png is
// the straight-on, unwatermarked, full-disc shot; it is inside the cluster the
// instrument itself already calls mutually independent.
const ANCHOR = 'quarter-rev-2.png';
const CAND = ['quarter-rev.jpg', 'quarter-rev-3.jpg', 'quarter-rev-5.jpg',
  'q1995d-rev.png', 'qp1963-rev-pad.png', 'qp1964-rev-pad.png',
  'quarter-rev-6.jpg',                       // known-wrong design (Nebraska)
  'nickel-rev-2.png', 'penny-rev-2.png', 'dime-rev-2.jpg'];  // known-wrong controls

const dA = await discOf(ANCHOR);
const fA = await energyGrid(ANCHOR, dA, 0.02);

console.log(`=== null + scale test of the design-NCC, anchor ${ANCHOR} ===`);
console.log(`narrow bounds (the instrument's own): rot ${ROT0[0]}..${ROT0.at(-1)}, tr ${TR0[0]}..${TR0.at(-1)}`);
console.log(`wide   bounds:                        rot ${ROT1[0]}..${ROT1.at(-1)}, tr ${TR1[0]}..${TR1.at(-1)}, scale ${SCALES[0]}..${SCALES.at(-1)}`);
console.log('a * beside a value means the argmax sat ON a search bound = failure report, not a value (S4.1)\n');
console.log('file                      narrow  rot   du     dv    bnd |  wide   rot  scale   bnd');

const atB = (v, arr) => v === arr[0] || v === arr.at(-1);

for (const f of CAND) {
  const d0 = await discOf(f);
  const g0 = await energyGrid(f, d0, 0.02);
  const n0 = bestReg(fA, g0, mDes, ROT0, TR0);
  const b0 = atB(n0.rot, ROT0) || atB(n0.du, TR0) || atB(n0.dv, TR0);

  let best = { ncc: -2 };
  for (const s of SCALES) {
    const ds = { cx: d0.cx, cy: d0.cy, R: d0.R * s };
    const gs = await energyGrid(f, ds, 0.02);
    const r = bestReg(fA, gs, mDes, ROT1, TR1);
    if (r.ncc > best.ncc) best = { ...r, scale: s };
  }
  const b1 = atB(best.rot, ROT1) || atB(best.du, TR1) || atB(best.dv, TR1) || atB(best.scale, SCALES);
  console.log(`${f.padEnd(22)} ${n0.ncc.toFixed(4).padStart(7)} ${String(n0.rot).padStart(5)} ${String(n0.du).padStart(6)} ${String(n0.dv).padStart(6)} ${(b0 ? '  *' : '   ')} | ${best.ncc.toFixed(4).padStart(6)} ${String(best.rot).padStart(5)} ${String(best.scale).padStart(6)} ${(b1 ? '  *' : '   ')}`);
}
