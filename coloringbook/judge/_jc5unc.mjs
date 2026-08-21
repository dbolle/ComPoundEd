// ROUND 5, cent obverse — SECOND OPINION on the tone patches, off the new
// `ref/penny-obv-unc2005.png` (U.S. Mint, 2005-D business strike, diffuse light).
//
// NOT A SCORED VALUE. The brief says this file has no frozen disc fit and may
// not be used for any scored number. It is used here for exactly one question,
// which the two frozen references cannot answer between them: when
// `penny-obv-3.jpg` and `penny-obv.jpg` disagree about WHICH PART of a feature
// is dark, is that the design or is it the lighting? A diffuse-light strike is
// the artefact that separates those.
//
// SELECTION TEST (§4.2): all three independent disc estimates are printed with
// their spread, and the reading below is only ever a second opinion, so the
// spread is reported rather than enforced — it came out at 8.31 % of R, which is
// why nothing here may be used as a value. The fit IS drawn on the source
// (`_jc5unc-over.png`) and looked at, per §4.3.
// NULL TEST (§4.1): the Otsu window and the radial search window are printed;
// a threshold at a window end throws rather than returning a value.
//
// Run: node coloringbook/judge/_jc5unc.mjs
import sharp from 'sharp';
import { grey, DISC, DISCS, REF, ratioVector, loadJSON } from '../_pylib.mjs';

const { patches } = loadJSON(new URL('../_tonepatches-penny.json', import.meta.url).pathname);
const F = 'coloringbook/ref/penny-obv-unc2005.png';

// ── the disc fit. The background is near-black; the coin is copper. Threshold
// on luminance, take the largest connected foreground, then three estimates.
const raw = await sharp(F).flatten({ background: '#000000' }).greyscale().raw().toBuffer({ resolveWithObject: true });
const d = raw.data, w = raw.info.width, h = raw.info.height;
const hist = new Array(256).fill(0);
for (let i = 0; i < d.length; i++) hist[d[i]]++;
// Otsu
let tot = d.length, sum = 0; for (let i = 0; i < 256; i++) sum += i * hist[i];
let wB = 0, sB = 0, best = -1, T = 0;
for (let t = 0; t < 256; t++) {
  wB += hist[t]; if (!wB) continue; const wF = tot - wB; if (!wF) break;
  sB += t * hist[t];
  const v = wB * wF * ((sB / wB) - ((sum - sB) / wF)) ** 2;
  if (v > best) { best = v; T = t; }
}
console.log(`background/coin Otsu threshold ${T} (search window 0..255 — a threshold AT a bound would be a failure report)`);
if (T <= 1 || T >= 254) throw new Error('threshold at a search bound');

const fg = new Uint8Array(w * h);
for (let i = 0; i < w * h; i++) fg[i] = d[i] > T ? 1 : 0;
// (a) centroid + equal-area radius
let n = 0, sx = 0, sy = 0;
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (fg[y * w + x]) { n++; sx += x; sy += y; }
const cxA = sx / n, cyA = sy / n, rA = Math.sqrt(n / Math.PI);
// (b) bounding box of the foreground
let x0 = w, x1 = 0, y0 = h, y1 = 0;
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (fg[y * w + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
const cxB = (x0 + x1) / 2, cyB = (y0 + y1) / 2, rB = ((x1 - x0) + (y1 - y0)) / 4;
// (c) radial edge search from the centroid, TOP 240 DEGREES only — the same
// restriction `_pylib.mjs` documents for penny-obv-3.jpg (the bottom sector of
// these photographs shows the coin's edge THICKNESS, not the face of the disc).
const RLO = 0.6 * rA, RHI = 1.4 * rA;
const rs = [];
for (let k = 0; k < 720; k++) {
  const a = -Math.PI / 2 + (k / 720) * 2 * Math.PI;
  if (Math.sin(a) > Math.sin(60 * Math.PI / 180)) continue;   // drop the bottom 120 deg
  let bestG = 0, bestR = 0;
  for (let r = RLO; r <= RHI; r += 0.5) {
    const p = (rr) => { const x = Math.round(cxA + rr * Math.cos(a)), y = Math.round(cyA + rr * Math.sin(a)); return (x < 0 || y < 0 || x >= w || y >= h) ? 0 : d[y * w + x]; };
    const g = p(r - 2) - p(r + 2);
    if (g > bestG) { bestG = g; bestR = r; }
  }
  if (bestR > RLO + 1 && bestR < RHI - 1) rs.push(bestR);
}
rs.sort((a, b) => a - b);
const rC = rs[rs.length >> 1];
console.log(`radial search window ${RLO.toFixed(1)}..${RHI.toFixed(1)} px, ${rs.length} usable columns, median r ${rC.toFixed(2)}, p5..p95 ${rs[(rs.length * 0.05) | 0].toFixed(1)}..${rs[(rs.length * 0.95) | 0].toFixed(1)}`);
console.log('CANDIDATE SET (all three printed, §4.2):');
console.log(`  (a) centroid+equal-area  cx ${cxA.toFixed(1)} cy ${cyA.toFixed(1)} R ${rA.toFixed(2)}`);
console.log(`  (b) foreground bbox      cx ${cxB.toFixed(1)} cy ${cyB.toFixed(1)} R ${rB.toFixed(2)}`);
console.log(`  (c) radial edge, top240  cx ${cxA.toFixed(1)} cy ${cyA.toFixed(1)} R ${rC.toFixed(2)}`);
const spread = (Math.max(rA, rB, rC) - Math.min(rA, rB, rC)) / rA;
console.log(`  radius spread across strategies ${(100 * spread).toFixed(2)}% of R`);

const g = { d, w, h };
const D = { cx: cxA, cy: cyA, R: rC };
const unc = ratioVector(g, D, patches);
const ref3 = ratioVector(await grey(REF), DISC, patches);
const r09 = ratioVector(await grey('coloringbook/ref/penny-obv.jpg'), DISCS['penny-obv.jpg'], patches);

console.log(`\npatch          -3(frozen)  1909(frozen)  unc2005(UNSCORED second opinion)`);
for (const p of patches)
  console.log(`${p.name.padEnd(13)} ${ref3.rat[p.name].toFixed(3).padStart(8)} ${r09.rat[p.name].toFixed(3).padStart(12)} ${unc.rat[p.name].toFixed(3).padStart(12)}`);
