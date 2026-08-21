// BUCK r9 (specialist, silhouette/rhythm) — the PYRAMID's own geometry on the
// photograph, in our viewBox units, through the printed-border fiducial.
//
// WHY AN EDGE FIT AND NOT A DENSITY FINDER. B5/§23.6: a note is engraved edge
// to edge, so no density threshold separates a device from its background —
// buck r0 burned 180 detector cells proving it. The pyramid's two slopes, its
// base and its truncated top are LONG STRAIGHT EDGES, which is the one class
// §23.6 says can still be found. This instrument fits lines to them and
// nothing else; the numbers are cross-checked against a hand read off
// `_jb6crop.mjs` ladders, which are published beside it.
//
// SUBJECTS COVERED (PY3): id `buck`, REVERSE only, both reverse references
// (`bill-rev.jpg`, `bill-rev-2.jpg`). The obverse has no device of this kind.
//
// POLARITY, which is what makes the fit selective rather than a gradient hunt:
// crossing the LEFT slope outward→inward goes background → the pyramid's own
// shadow band, medium → very dark. Crossing the RIGHT slope inward→outward
// goes the lit face → background, bright → medium. Both are "the left sample
// is brighter than the right sample", so ONE signed score serves both edges
// and a line that merely sits on strong unsigned gradient does not win.
//
//   node coloringbook/judge/_jk9edge.mjs
import { rectify } from '../_blnorm.mjs';

const S = 20, X0 = 5, Y0 = 5;                    // px per viewBox unit, frame origin
const W = Math.round(90 * S), H = Math.round(46 * S);
const FILES = ['bill-rev.jpg', 'bill-rev-2.jpg'];

// FROZEN SEARCH BOUNDS — literals, printed with every result (§4.1)
const B = {
  left:  { xb: [17.0, 22.0], m: [-0.70, -0.10] },
  right: { xb: [25.0, 30.0], m: [ 0.10,  0.70] },
  slopeY: [25.5, 32.5],                          // the span the slopes are fitted over
  baseY: [32.0, 35.5],                           // the ground line under the pyramid
  topY:  [22.5, 26.0],                           // the truncation
  stepX: 0.02, stepM: 0.005, stepY: 0.02,
};
const D = 0.45;                                  // half-separation of the two samples, units

for (const f of FILES) {
  const R = await rectify(f, W, H);
  if (R.out.length !== W * H) throw new Error('rectify size');
  const px = (X, Y) => {
    const x = (X - X0) * S, y = (Y - Y0) * S;
    if (x < 0 || y < 0 || x >= W - 1 || y >= H - 1) return 255;
    const i = x | 0, j = y | 0, fx = x - i, fy = y - j;
    return R.out[j * W + i] * (1 - fx) * (1 - fy) + R.out[j * W + i + 1] * fx * (1 - fy) +
      R.out[(j + 1) * W + i] * (1 - fx) * fy + R.out[(j + 1) * W + i + 1] * fx * fy;
  };

  // ── the two slopes.  x(Y) = xb + m*(Y - 33).  Score: mean signed step.
  const fitSlope = (side) => {
    const b = B[side], cand = [];
    for (let xb = b.xb[0]; xb <= b.xb[1] + 1e-9; xb += B.stepX)
      for (let m = b.m[0]; m <= b.m[1] + 1e-9; m += B.stepM) {
        let s = 0, n = 0;
        for (let Y = B.slopeY[0]; Y <= B.slopeY[1] + 1e-9; Y += 0.05) {
          const x = xb + m * (Y - 33);
          s += px(x - D, Y) - px(x + D, Y); n++;
        }
        cand.push({ xb: +xb.toFixed(3), m: +m.toFixed(4), v: s / n });
      }
    cand.sort((p, q) => q.v - p.v);
    const best = cand[0];
    const onBound = [];
    if (Math.abs(best.xb - b.xb[0]) < 1e-6 || Math.abs(best.xb - b.xb[1]) < 1e-6) onBound.push('xb');
    if (Math.abs(best.m - b.m[0]) < 1e-6 || Math.abs(best.m - b.m[1]) < 1e-6) onBound.push('m');
    const far = cand.find((c) => Math.abs(c.xb - best.xb) > 0.5 || Math.abs(c.m - best.m) > 0.06);
    return { best, onBound, far, top5: cand.slice(0, 5) };
  };

  // ── a horizontal edge.  Score: mean signed step across it, over an X window.
  const fitH = (range, x0, x1, sign) => {
    const cand = [];
    for (let Y = range[0]; Y <= range[1] + 1e-9; Y += B.stepY) {
      let s = 0, n = 0;
      for (let X = x0; X <= x1 + 1e-9; X += 0.05) { s += sign * (px(X, Y - D) - px(X, Y + D)); n++; }
      cand.push({ Y: +Y.toFixed(3), v: s / n });
    }
    cand.sort((p, q) => q.v - p.v);
    const best = cand[0];
    const onBound = Math.abs(best.Y - range[0]) < 1e-6 || Math.abs(best.Y - range[1]) < 1e-6;
    const far = cand.find((c) => Math.abs(c.Y - best.Y) > 0.5);
    return { best, onBound, far, top5: cand.slice(0, 5) };
  };

  const L = fitSlope('left'), Rt = fitSlope('right');
  const xAt = (fit, Y) => fit.best.xb + fit.best.m * (Y - 33);
  const cxGuess = (xAt(L, 30) + xAt(Rt, 30)) / 2;
  // base: bright pyramid above, dark ground below  -> sign +1
  const base = fitH(B.baseY, cxGuess - 2.5, cxGuess + 2.5, +1);
  // truncation: the glory above is brighter than the coursed face below -> +1
  const top = fitH(B.topY, cxGuess - 1.2, cxGuess + 1.2, +1);

  const yb = base.best.Y, yt = top.best.Y;
  const bl = xAt(L, yb), br = xAt(Rt, yb), tl = xAt(L, yt), tr = xAt(Rt, yt);
  // the virtual apex, where the two fitted slopes meet
  const yApex = 33 + (Rt.best.xb - L.best.xb) / (L.best.m - Rt.best.m);
  const xApex = xAt(L, yApex);

  console.log(`\n${f}`);
  console.log(`  LEFT  slope  x(33) ${L.best.xb.toFixed(2)}  dx/dY ${L.best.m.toFixed(3)}   score ${L.best.v.toFixed(2)}`);
  console.log(`      NULL bounds xb ${B.left.xb}  m ${B.left.m}  step ${B.stepX}/${B.stepM}  -> on-bound: ${L.onBound.length ? L.onBound.join(',') + '  *** FAILURE REPORT ***' : 'none'}`);
  console.log(`      SELECT top5 ${L.top5.map((c) => `(${c.xb},${c.m})${c.v.toFixed(1)}`).join(' ')}`);
  console.log(`      best-different candidate ${L.far ? `(${L.far.xb},${L.far.m}) ${L.far.v.toFixed(2)} — margin ${(L.best.v - L.far.v).toFixed(2)} grey` : 'NONE'}`);
  console.log(`  RIGHT slope  x(33) ${Rt.best.xb.toFixed(2)}  dx/dY ${Rt.best.m.toFixed(3)}   score ${Rt.best.v.toFixed(2)}`);
  console.log(`      NULL bounds xb ${B.right.xb}  m ${B.right.m}  -> on-bound: ${Rt.onBound.length ? Rt.onBound.join(',') + '  *** FAILURE REPORT ***' : 'none'}`);
  console.log(`      SELECT top5 ${Rt.top5.map((c) => `(${c.xb},${c.m})${c.v.toFixed(1)}`).join(' ')}`);
  console.log(`      best-different candidate ${Rt.far ? `(${Rt.far.xb},${Rt.far.m}) ${Rt.far.v.toFixed(2)} — margin ${(Rt.best.v - Rt.far.v).toFixed(2)} grey` : 'NONE'}`);
  console.log(`  BASE  Y ${yb.toFixed(2)}   score ${base.best.v.toFixed(2)}  bounds ${B.baseY} -> on-bound: ${base.onBound ? '*** YES, FAILURE REPORT ***' : 'none'}  best-different Y ${base.far ? base.far.Y + ' margin ' + (base.best.v - base.far.v).toFixed(2) : 'NONE'}`);
  console.log(`  TOP   Y ${yt.toFixed(2)}   score ${top.best.v.toFixed(2)}  bounds ${B.topY} -> on-bound: ${top.onBound ? '*** YES, FAILURE REPORT ***' : 'none'}  best-different Y ${top.far ? top.far.Y + ' margin ' + (top.best.v - top.far.v).toFixed(2) : 'NONE'}`);
  console.log(`  => trapezoid  base Y ${yb.toFixed(2)} X ${bl.toFixed(2)}..${br.toFixed(2)} (w ${(br - bl).toFixed(2)})   top Y ${yt.toFixed(2)} X ${tl.toFixed(2)}..${tr.toFixed(2)} (w ${(tr - tl).toFixed(2)})`);
  console.log(`     centre X ${((bl + br) / 2).toFixed(2)} / ${((tl + tr) / 2).toFixed(2)}   virtual apex (${xApex.toFixed(2)}, ${yApex.toFixed(2)})   height base->top ${(yb - yt).toFixed(2)}`);

  // ── RESPONSE TEST (§4): displace the image 1 unit right by re-sampling and
  // confirm the fitted xb follows by ~1 unit.
  {
    const shift = 1.0;
    const px2 = (X, Y) => px(X - shift, Y);
    let bestS = { v: -1e9 };
    for (let xb = B.left.xb[0]; xb <= B.left.xb[1] + shift + 1e-9; xb += B.stepX)
      for (let m = B.left.m[0]; m <= B.left.m[1] + 1e-9; m += B.stepM) {
        let s = 0, n = 0;
        for (let Y = B.slopeY[0]; Y <= B.slopeY[1] + 1e-9; Y += 0.05) {
          const x = xb + m * (Y - 33); s += px2(x - D, Y) - px2(x + D, Y); n++;
        }
        if (s / n > bestS.v) bestS = { xb, m, v: s / n };
      }
    const moved = bestS.xb - L.best.xb;
    console.log(`  RESPONSE TEST — resample the photograph 1.00 unit right: LEFT xb ${L.best.xb.toFixed(2)} -> ${bestS.xb.toFixed(2)} (moved ${moved.toFixed(2)})  ${Math.abs(moved - shift) < 0.15 ? 'MOVED as expected' : '*** DID NOT TRACK — UNTRUSTED ***'}`);
  }
  // ── NULL TEST on a place with no pyramid: the same fit run over the blank
  // panel between the two seals must NOT return a confident edge.
  {
    let bestN = { v: -1e9 };
    for (let xb = 45; xb <= 55; xb += B.stepX)
      for (let m = B.left.m[0]; m <= B.left.m[1] + 1e-9; m += B.stepM) {
        let s = 0, n = 0;
        for (let Y = B.slopeY[0]; Y <= B.slopeY[1] + 1e-9; Y += 0.05) {
          const x = xb + m * (Y - 33); s += px(x - D, Y) - px(x + D, Y); n++;
        }
        if (s / n > bestN.v) bestN = { xb, m, v: s / n };
      }
    console.log(`  NULL TEST — same fit over the empty central panel X 45..55: best score ${bestN.v.toFixed(2)} at (${bestN.xb.toFixed(2)},${bestN.m.toFixed(3)})` +
      `  vs the pyramid's ${L.best.v.toFixed(2)}  — ratio ${(L.best.v / Math.max(0.01, bestN.v)).toFixed(1)}x`);
  }
}
