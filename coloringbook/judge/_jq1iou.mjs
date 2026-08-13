// D1 — obverse silhouette IoU, re-derived by the judge through the frozen
// _qt* eval core, against ALL THREE frozen masks (method doc §21.4: score
// against every version kept), plus the response test §4 demands.
import * as E from '../_qteval.mjs';
import * as E2 from '../_qtevalV2.mjs';
import * as E1 from '../_qtevalV1.mjs';

const mod = await import('../../src/art/coins.js');
const svg = () => mod.coinSVG('quarter', 600, { side: 'obverse' });

const score = async (EV) => {
  const p = EV.parts(svg());
  return EV.iou(await EV.oursMask(p), await EV.refMask()).iou;
};

const v3 = await score(E), v2 = await score(E2), v1 = await score(E1);
console.log(`D1 IoU vs v3 mask (the one scored against) = ${v3.toFixed(5)}`);
console.log(`   vs v2 mask = ${v2.toFixed(5)}   vs v1 mask = ${v1.toFixed(5)}`);
console.log(`   vcut = ${E.VCUT}, grid ${E.N}^2, mask ${E.POLY.length} points`);

// RESPONSE TEST: move the portrait one viewBox unit back and re-score.
const O = mod.OBVERSE.quarter;
const base = { s: O.s, cx: O.cx, cy: O.cy };
const at = async (s, cx, cy) => {
  O.s = s; O.cx = cx; O.cy = cy;
  const p = E.parts(svg());
  return E.iou(await E.oursMask(p), await E.refMask()).iou;
};
const shifted = await at(base.s, base.cx + 1, base.cy);
const shiftedY = await at(base.s, base.cx, base.cy + 1);
const scaled = await at(base.s * 1.03, base.cx, base.cy);
await at(base.s, base.cx, base.cy);
console.log(`\nRESPONSE TEST (D1)`);
console.log(`  cx +1 unit : ${v3.toFixed(5)} -> ${shifted.toFixed(5)}  (${(shifted - v3).toFixed(5)})`);
console.log(`  cy +1 unit : ${v3.toFixed(5)} -> ${shiftedY.toFixed(5)}  (${(shiftedY - v3).toFixed(5)})`);
console.log(`  s x1.03    : ${v3.toFixed(5)} -> ${scaled.toFixed(5)}  (${(scaled - v3).toFixed(5)})   <- the +-3% scale confidence of §5.1`);
const moved = [shifted, shiftedY, scaled].every((x) => Math.abs(x - v3) > 0.005) && new Set([shifted, shiftedY, scaled, v3]).size === 4;
console.log(moved ? '  RESPONSE TEST PASS — every perturbation moved the number, and no two agreed bit-for-bit'
                  : '  RESPONSE TEST FAIL — D1 is UNTRUSTED');
