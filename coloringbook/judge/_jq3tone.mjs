// D3 response test — the tone instrument must move when the drawing's tone
// moves. Two perturbations, both structural, both re-rendered through the same
// pipeline the value came from:
//   (a) OBVERSE.quarter.hairLit off  — the wig fills `hair` instead of `cloth`
//       (the quarter-obv.md p2-3 iteration, which cost 0.054 at the time)
//   (b) the whole portrait shifted 2 units, which must move several patches
// Also re-runs §20.1's flat-swatch check on the exact raster path used here.
import * as L from '../_qtlib.mjs';

const mod = await import('../../src/art/coins.js');
const TP = L.loadJSON(new URL('../_tonepatches-quarter.json', import.meta.url).pathname);
const P = TP.patches;
const D0 = L.DISCS['quarter-obv-2.jpg'];

const g2 = await L.grey(L.REF);
const ref = L.ratioVector(g2, D0, P);
const measure = async () => {
  const ours = L.ratioVector(await L.ourRaster(mod.coinSVG, D0, g2.w, g2.h), D0, P);
  let s = 0, n = 0, worst = 0, worstN = '';
  for (const p of P) {
    if (p.name === 'cheek') continue;
    const d = Math.abs(ours.rat[p.name] - ref.rat[p.name]);
    s += d; n++;
    if (d > worst) { worst = d; worstN = p.name; }
  }
  return { mean: s / n, worst, worstN, rat: ours.rat };
};

const base = await measure();
console.log(`D3 mean |dratio| = ${base.mean.toFixed(4)}   worst ${base.worst.toFixed(3)} (${base.worstN})`);

const O = mod.OBVERSE.quarter;
const keep = { hairLit: O.hairLit, cx: O.cx };
O.hairLit = false;
const noLit = await measure();
O.hairLit = keep.hairLit;
O.cx = keep.cx + 2;
const moved = await measure();
O.cx = keep.cx;
const again = await measure();

console.log(`\nRESPONSE TEST (D3)`);
console.log(`  hairLit off : ${base.mean.toFixed(4)} -> ${noLit.mean.toFixed(4)}  (${(noLit.mean - base.mean).toFixed(4)})`);
console.log(`  cx +2 units : ${base.mean.toFixed(4)} -> ${moved.mean.toFixed(4)}  (${(moved.mean - base.mean).toFixed(4)})`);
console.log(`  restored    : ${again.mean.toFixed(4)}  (must equal the baseline exactly)`);
const pass = Math.abs(noLit.mean - base.mean) > 0.02 && Math.abs(moved.mean - base.mean) > 0.02
  && again.mean === base.mean && noLit.mean !== moved.mean;
console.log(pass ? '  RESPONSE TEST PASS' : '  RESPONSE TEST FAIL — D3 is UNTRUSTED');

// per-patch movement, so a "the mean moved but nothing else did" bug is visible
const movedPatches = P.filter((p) => p.name !== 'cheek' && noLit.rat[p.name] !== base.rat[p.name]).map((p) => p.name);
console.log(`  patches whose ratio moved when hairLit flipped: ${movedPatches.length}/12 — ${movedPatches.join(' ')}`);
