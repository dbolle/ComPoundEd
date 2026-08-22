// ROUND (cent obverse, mid-jaw) — how much of the new `jawMid` patch does
// BEARD actually cover, and does the patch's MEDIAN sit near a discontinuity?
//
// `_jy6tone.mjs` reports `jawMid` unchanged at 1.0000 before and after. A
// median is a step function of coverage: it does not move until the covered
// fraction passes 50%, so "unchanged" could mean "nothing happened" or "we are
// one percent from a cliff". §4's corollary — two bit-identical answers from
// two different inputs is not agreement — says to check which.
//
// So this prints, for each revision: the fraction of the patch's area inside
// BEARD (geometry, point-in-polygon on the flattened path), and the patch's
// MEAN ratio as well as its median, since the mean moves continuously.
//
// Run: node coloringbook/judge/_jyBcover.mjs <before.js> <after.js>
import { flattenPath } from './_jqgeom.mjs';
import { grey, DISC, REF, ourRaster, samplePatch, loadJSON, localToDisc, PENNY } from '../_pylib.mjs';

const J = loadJSON(new URL('./_jy0tonepatch-midjaw.json', import.meta.url).pathname).patches[0];
const CH = loadJSON(new URL('../_tonepatches-penny.json', import.meta.url).pathname).patches.find((p) => p.name === 'cheek');
const photo = await grey(REF);

const insidePoly = (poly, x, y) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
};
function meanRatio(g, disc, p, ch) {
  const one = (q) => {
    const px = disc.cx + q.u * disc.R, py = disc.cy + q.v * disc.R, rad = q.r * disc.R;
    let n = 0, s = 0;
    for (let y = Math.floor(py - rad); y <= Math.ceil(py + rad); y++)
      for (let x = Math.floor(px - rad); x <= Math.ceil(px + rad); x++) {
        if (x < 0 || y < 0 || x >= g.w || y >= g.h) continue;
        if ((x - px) ** 2 + (y - py) ** 2 > rad * rad) continue;
        s += g.d[y * g.w + x]; n++;
      }
    return s / n;
  };
  return one(p) / one(ch);
}

console.log('revision                cover(BEARD∩jawMid)   median ratio   mean ratio');
for (const f of process.argv.slice(2)) {
  const mod = await import(f.startsWith('/') ? `file://${f}` : `${process.cwd()}/${f}`);
  const svg = mod.coinSVG('penny', 380, { side: 'obverse' });
  const ds = [...svg.matchAll(/<path\b[^>]*?\sd="([^"]*)"/g)].map((m) => m[1]);
  const bd = ds.find((d) => d.startsWith('M 15.15 12.77'));
  if (!bd) throw new Error('BEARD not found');
  const P = flattenPath(bd).pts;
  let in_ = 0, tot = 0;
  for (let dy = -J.local.r; dy <= J.local.r; dy += 0.02)
    for (let dx = -J.local.r; dx <= J.local.r; dx += 0.02) {
      if (dx * dx + dy * dy > J.local.r ** 2) continue;
      tot++; if (insidePoly(P, J.local.x + dx, J.local.y + dy)) in_++;
    }
  const our = await ourRaster(mod.coinSVG, DISC, photo.w, photo.h);
  const med = samplePatch(our, DISC, J).med / samplePatch(our, DISC, CH).med;
  console.log(`${f.padEnd(24)} ${(100 * in_ / tot).toFixed(2).padStart(8)}%           ${med.toFixed(4)}        ${meanRatio(our, DISC, J, CH).toFixed(4)}`);
}
const ref = { med: samplePatch(photo, DISC, J).med / samplePatch(photo, DISC, CH).med, mean: meanRatio(photo, DISC, J, CH) };
console.log(`\nreference of record penny-obv-3.jpg      median ${ref.med.toFixed(4)}   mean ${ref.mean.toFixed(4)}`);
console.log('(the median only moves once coverage passes 50%; the mean moves continuously, which is why both are printed)');
