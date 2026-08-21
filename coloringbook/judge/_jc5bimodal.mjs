// ROUND 5, cent obverse — IS ANY D3 PATCH A STEP FUNCTION IN OUR RASTER?
//
// Round 4 on the dime found the frozen `chin` patch was: our flat palette spans
// two levels inside it, so its MEDIAN crosses on a ~4 % area change and |D|
// jumps 0.073 -> 0.081 -> 0.121 -> 0.229 with nothing in between. A repair got
// biased 0.8 units purely to stay off that step. The brief asks for the same
// check here before anything is optimised against a patch.
//
// The test: our raster is a FLAT palette, so the values inside a patch are a
// small set of levels plus anti-aliasing. For each patch print
//   - every level holding >= 2 % of the patch, with its area share
//   - the median, and MARGIN = how many percentage points of area the median
//     level would have to lose before the median jumps to the next level
// A margin under about 5 points is a step: the |D| for that patch is a
// threshold crossing, not a tone, and moving the drawing 1 unit can move it by
// the whole gap between two levels.
//
// RESPONSE TEST: a synthetic patch that is 51/49 between two levels must report
// margin ~1 point, and one that is 100 % one level must report margin ~50.
// NULL TEST: n/a — nothing is searched; every level is enumerated.
//
// Run: node coloringbook/judge/_jc5bimodal.mjs [src]
import { grey, DISC, DISCS, REF, ourRaster, ratioVector, loadJSON } from '../_pylib.mjs';

const { patches } = loadJSON(new URL('../_tonepatches-penny.json', import.meta.url).pathname);
const SRC = process.argv[2] || '../../src/art/coins.js';
const mod = await import(SRC.startsWith('.') ? SRC : `file://${SRC}`);

function levels(g, disc, p) {
  const { d, w, h } = g;
  const px = disc.cx + p.u * disc.R, py = disc.cy + p.v * disc.R, rad = p.r * disc.R;
  const vals = [];
  for (let y = Math.floor(py - rad); y <= Math.ceil(py + rad); y++)
    for (let x = Math.floor(px - rad); x <= Math.ceil(px + rad); x++) {
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      if ((x - px) ** 2 + (y - py) ** 2 > rad * rad) continue;
      vals.push(d[y * w + x]);
    }
  const cnt = new Map();
  for (const v of vals) cnt.set(v, (cnt.get(v) || 0) + 1);
  const n = vals.length;
  const big = [...cnt.entries()].filter(([, c]) => c / n >= 0.02).sort((a, b) => a[0] - b[0]);
  const sorted = [...vals].sort((a, b) => a - b);
  const med = sorted[Math.floor(n * 0.5)];
  // margin: cumulative share below the median level, and above it. The median
  // jumps when either side crosses 50 %.
  let below = 0, atMed = 0;
  for (const v of vals) { if (v < med) below++; else if (v === med) atMed++; }
  const above = n - below - atMed;
  const margin = Math.min(50 - 100 * below / n, 50 - 100 * above / n);
  return { n, med, big: big.map(([v, c]) => [v, +(100 * c / n).toFixed(1)]), margin: +margin.toFixed(1) };
}

console.log('=== RESPONSE TEST ===');
{
  const mk = (frac) => { const g = { d: null, w: 41, h: 41 }; const d = new Uint8Array(41 * 41); let k = 0;
    for (let y = 0; y < 41; y++) for (let x = 0; x < 41; x++) { d[y * 41 + x] = ((x - 20) ** 2 + (y - 20) ** 2 <= 400 && (k++ % 100) < frac * 100) ? 80 : 120; }
    g.d = d; return g; };
  for (const f of [0.51, 0.49, 1.0]) {
    const r = levels(mk(f), { cx: 20, cy: 20, R: 20 }, { u: 0, v: 0, r: 1.0 });
    console.log(`  synthetic ${(100 * f).toFixed(0)}% dark -> median ${r.med}, margin ${r.margin} pts, levels ${JSON.stringify(r.big)}`);
  }
}

const photo = await grey(REF);
const ref = ratioVector(photo, DISC, patches);
const our = await ourRaster(mod.coinSVG, DISC, photo.w, photo.h);
const ours = ratioVector(our, DISC, patches);

console.log(`\n=== every patch in OUR raster (src ${SRC}) ===`);
console.log('patch          n     med  ratio   ref    |D|   margin  levels >=2% of the patch (grey, %area)');
for (const p of patches) {
  const L = levels(our, DISC, p);
  const d = p.name === 'cheek' ? 0 : Math.abs(ours.rat[p.name] - ref.rat[p.name]);
  const flag = L.margin < 5 ? '  << STEP — |D| here is a threshold crossing, not a tone' : L.margin < 12 ? '  << narrow' : '';
  console.log(`${p.name.padEnd(13)} ${String(L.n).padStart(5)} ${String(L.med).padStart(5)}  ${ours.rat[p.name].toFixed(3)} ${ref.rat[p.name].toFixed(3)} ${d.toFixed(3)}  ${String(L.margin).padStart(5)}   ${JSON.stringify(L.big)}${flag}`);
}

// the same on the REFERENCE, so a patch that is a step in ours but a continuum
// in the photograph is distinguishable from one that is a step in both.
console.log('\n=== the same patches in penny-obv-3.jpg (a photograph: expect no steps) ===');
console.log('patch          n     med  distinct levels  margin');
for (const p of patches) {
  const L = levels(photo, DISC, p);
  console.log(`${p.name.padEnd(13)} ${String(L.n).padStart(5)} ${String(L.med).padStart(5)}  ${String(L.big.length).padStart(3)} at >=2%      ${String(L.margin).padStart(5)}`);
}
