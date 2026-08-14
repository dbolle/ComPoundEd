// NICKEL round 0 — D2, REVERSE MOTIF SILHOUETTE: can a target be frozen?
//
// GATE, INHERITED UNCHANGED from round 2 on the quarter (`_jq21stab.mjs`,
// restated in `_jq43seg.mjs`), which is to say it existed long before any
// nickel value did and is not re-derived to fit this coin:
//   FREEZE only if (a) the MINIMUM pairwise IoU of the device contour across
//   the swept thresholds is >= 0.97, and (b) two INDEPENDENT references agree
//   at >= 0.95.
//
// LOCUS, frozen before measuring, not a function of our art (§6.1): r <= 0.862 R
// (viewBox 40.5) on a 700^2 disc-normalised grid; the motif is the connected
// component of {grey >= T} containing the centre; T swept Tv +- 15 in steps of
// 5, Tv the histogram valley floor OF THE PHOTOGRAPH.
//
// Every scoring function — motif(), iou(), valleyFloor(), inField() — is
// IMPORTED FROM `_jq43seg.mjs` UNEDITED at its published hash. Only `gridOf` is
// re-implemented, because the quarter's version reads `_jq4discs.json`, which
// has no nickel rows. The re-implementation is line-for-line the same bilinear
// sampler against `_jn1discs.json`.
//
// The nickel's case differs from the quarter's in one way that matters: the
// quarter's round 2 diagnosis was that a CIRCULATION STRIKE has no reflectance
// difference between device and field, and had to buy proof photographs. The
// nickel already holds a cameo proof reverse (`nickel-rev-proof.png`) whose
// field is a black mirror. This run finds out whether that is enough.
//
// §4.1 the sweep bounds are printed. §4.3 `_jn12seg-<ref>.png` draws every
// threshold's contour on the source and nothing freezes before I have looked.
//
// Run: node coloringbook/judge/_jn12seg.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { NG, SPANG, RFIELD, inField, motif, iou, valleyFloor } from './_jq43seg.mjs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const D = JSON.parse(readFileSync(HERE('_jn1discs.json')));

async function gridOf(file) {
  const d = D[file];
  const { data, info } = await sharp(P(file)).flatten({ background: '#808080' })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const at = (x, y) => {
    if (x < 0 || y < 0 || x >= W - 1 || y >= H - 1) return NaN;
    const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0;
    return data[y0 * W + x0] * (1 - fx) * (1 - fy) + data[y0 * W + x0 + 1] * fx * (1 - fy)
      + data[(y0 + 1) * W + x0] * (1 - fx) * fy + data[(y0 + 1) * W + x0 + 1] * fx * fy;
  };
  const g = new Float64Array(NG * NG);
  for (let j = 0; j < NG; j++) { const v = -SPANG + 2 * SPANG * j / (NG - 1);
    for (let i = 0; i < NG; i++) { const u = -SPANG + 2 * SPANG * i / (NG - 1);
      g[j * NG + i] = at(d.cx + u * d.R, d.cy + v * d.R); } }
  return g;
}

const refs = process.argv.slice(2).length ? process.argv.slice(2)
  : ['nickel-rev-proof.png', 'nickel-rev-2.png', 'nickel-rev.jpg'];
const fld = inField(); let nf = 0; for (const p of fld) nf += p;
console.log(`locus: r <= ${RFIELD} R (viewBox 40.5) on a ${NG}x${NG} grid = ${nf} cells`);
console.log("gate (round 2's, inherited): min pairwise IoU across the sweep >= 0.97, AND two independent references >= 0.95.\n");
const store = {};
for (const f of refs) {
  const g = await gridOf(f);
  const vf = valleyFloor(g, fld);
  console.log(f);
  if (!vf.best) { console.log('  no separable mode pair in the histogram — no threshold exists here.\n'); continue; }
  const Tv = vf.best.arg;
  const TS = [-15, -10, -5, 0, 5, 10, 15].map((d) => Tv + d);
  console.log(`  modes ${vf.best.lo}/${vf.best.hi}   valley floor Tv = ${Tv}   depth ${vf.best.depth.toFixed(4)}`);
  console.log(`  sweep bounds (§4.1): T = ${TS[0]} .. ${TS[TS.length - 1]} step 5`);
  const masks = TS.map((T) => ({ T, ...motif(g, T, fld) }));
  console.log('  T      area   %field');
  for (const m of masks) console.log(`  ${String(m.T).padStart(4)}  ${String(m.area).padStart(7)}  ${(100 * m.area / nf).toFixed(1)}%`);
  let minAll = 1, minAdj = 1;
  for (let i = 0; i < masks.length; i++) for (let j = i + 1; j < masks.length; j++) {
    const v = iou(masks[i].m, masks[j].m);
    if (v < minAll) minAll = v;
    if (j === i + 1 && v < minAdj) minAdj = v;
  }
  const mono = masks.every((m, i) => i === 0 || m.area <= masks[i - 1].area);
  console.log(`  min pairwise IoU (+-15) = ${minAll.toFixed(4)}   min adjacent (+-5) = ${minAdj.toFixed(4)}   ${minAll >= 0.97 ? 'MEETS 0.97' : '**MISSES 0.97 — nothing freezes**'}`);
  console.log(`  area monotone across the whole sweep? ${mono ? 'YES — no interior plateau; §4.1 says report a bound, not a value' : 'no (there is an interior plateau)'}`);
  store[f] = masks[3].m;

  // §4.3 — draw every threshold's boundary on the source
  const d = D[f], meta = await sharp(P(f)).metadata();
  const cols = ['#ff2d55', '#ff9500', '#ffe600', '#00ff6a', '#00e5ff', '#5e5ce6', '#ff00d4'];
  let svg = '';
  masks.forEach((m, k) => {
    let pts = '';
    for (let j = 1; j < NG - 1; j++) for (let i = 1; i < NG - 1; i++) {
      const p = j * NG + i; if (!m.m[p]) continue;
      if (m.m[p - 1] && m.m[p + 1] && m.m[p - NG] && m.m[p + NG]) continue;
      const u = -SPANG + 2 * SPANG * i / (NG - 1), v = -SPANG + 2 * SPANG * j / (NG - 1);
      pts += `<rect x="${(d.cx + u * d.R).toFixed(1)}" y="${(d.cy + v * d.R).toFixed(1)}" width="3" height="3" fill="${cols[k]}"/>`;
    }
    svg += pts;
  });
  const comp = await sharp(P(f)).flatten({ background: '#808080' })
    .composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${meta.width}" height="${meta.height}">${svg}</svg>`) }])
    .png().toBuffer();
  await sharp(comp).resize(1000, 1000, { fit: 'inside' }).png().toFile(HERE(`_jn12seg-${f.replace(/\..*$/, '')}.png`));
  console.log(`  §4.3 overlay -> _jn12seg-${f.replace(/\..*$/, '')}.png  (red = Tv-15 ... magenta = Tv+15)\n`);
}
const ks = Object.keys(store);
for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++)
  console.log(`cross-reference IoU at Tv, UNREGISTERED: ${ks[i]} vs ${ks[j]} = ${iou(store[ks[i]], store[ks[j]]).toFixed(4)}`);
