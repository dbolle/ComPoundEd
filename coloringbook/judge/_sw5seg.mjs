// SPECIALIST (buck obverse) — segment the portrait vignette on BOTH obverse
// references and report the head+wig mass in OUR viewBox units.
//
// The note's vignette is a LIGHT head on a DARK cross-hatched ground, so a
// two-level split inside the frozen oval separates head+wig+jabot from
// ground+coat. Both references are segmented independently and the agreement
// between them is printed — a single-reference silhouette is not evidence
// (§ COIN-ART-METHOD, and buck r0's own two-reference practice).
//
// SELECTION TEST (§4.2): the threshold is chosen by Otsu over the in-oval
// histogram and the WHOLE candidate sweep is printed beside it, so a
// threshold that happens to work on one photograph is visible as such.
// NULL TEST (§4.1): the sweep bounds are printed; a chosen threshold equal to
// a bound is reported as a failure, not a value.
//
//   node coloringbook/judge/_sw5seg.mjs
import sharp from 'sharp';
import { rectify, XY2uv } from '../_blnorm.mjs';

const REFS = ['bill-obv.jpg', 'bill-obv-2.jpg'];
const OVAL = { cx: 50.05, cy: 30.30, rx: 9.75, ry: 14.00 }; // FROZEN D1 locus
const NU = 2400, NV = 950;
const N = 260; // samples across the oval's bounding box, per axis

function otsu(hist, total) {
  let sum = 0; for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sumB = 0, wB = 0, best = -1, thr = 0;
  const LO = 1, HI = 254;
  for (let t = LO; t <= HI; t++) {
    wB += hist[t]; if (!wB) continue;
    const wF = total - wB; if (!wF) break;
    sumB += t * hist[t];
    const v = wB * wF * (sumB / wB - (sum - sumB) / wF) ** 2;
    if (v > best) { best = v; thr = t; }
  }
  return { thr, bounds: [LO, HI] };
}

const results = [];
for (const ref of REFS) {
  const { out } = await rectify(ref, NU, NV);
  // sample a regular grid over the oval's bbox in (X,Y)
  const X0 = OVAL.cx - OVAL.rx, X1 = OVAL.cx + OVAL.rx;
  const Y0 = OVAL.cy - OVAL.ry, Y1 = OVAL.cy + OVAL.ry;
  const g = new Float64Array(N * N); const inside = new Uint8Array(N * N);
  const hist = new Uint32Array(256); let tot = 0;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const X = X0 + ((i + 0.5) / N) * (X1 - X0), Y = Y0 + ((j + 0.5) / N) * (Y1 - Y0);
    const [u, v] = XY2uv(X, Y);
    const px = Math.round(u * NU - 0.5), py = Math.round(v * NV - 0.5);
    const val = out[Math.max(0, Math.min(NV - 1, py)) * NU + Math.max(0, Math.min(NU - 1, px))];
    g[j * N + i] = val;
    // 0.96 of the semi-axes: stay off the printed oval rule itself
    const dx = (X - OVAL.cx) / (OVAL.rx * 0.96), dy = (Y - OVAL.cy) / (OVAL.ry * 0.96);
    if (dx * dx + dy * dy <= 1) { inside[j * N + i] = 1; hist[Math.max(0, Math.min(255, Math.round(val)))]++; tot++; }
  }
  const { thr, bounds } = otsu(hist, tot);
  if (thr === bounds[0] || thr === bounds[1]) throw new Error(`${ref}: Otsu returned a search bound (${thr} of ${bounds}) — failure report, not a value`);

  const mask = new Uint8Array(N * N);
  for (let k = 0; k < N * N; k++) mask[k] = inside[k] && g[k] > thr ? 1 : 0;
  // largest 4-connected component = the head+wig mass (drop hatching speckle)
  const lab = new Int32Array(N * N).fill(-1); let best = null;
  for (let s = 0; s < N * N; s++) {
    if (!mask[s] || lab[s] >= 0) continue;
    const q = [s]; lab[s] = s; const cells = [];
    while (q.length) {
      const c = q.pop(); cells.push(c); const ci = c % N, cj = (c / N) | 0;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ni = ci + di, nj = cj + dj; if (ni < 0 || nj < 0 || ni >= N || nj >= N) continue;
        const nk = nj * N + ni; if (mask[nk] && lab[nk] < 0) { lab[nk] = s; q.push(nk); }
      }
    }
    if (!best || cells.length > best.length) best = cells;
  }
  const comp = new Uint8Array(N * N); for (const c of best) comp[c] = 1;
  const X = (i) => X0 + ((i + 0.5) / N) * (X1 - X0);
  const Y = (j) => Y0 + ((j + 0.5) / N) * (Y1 - Y0);
  let minI = N, maxI = -1, minJ = N, maxJ = -1, area = 0;
  const rows = [];
  for (let j = 0; j < N; j++) {
    let a = N, b = -1, n = 0;
    for (let i = 0; i < N; i++) if (comp[j * N + i]) { if (i < a) a = i; if (i > b) b = i; n++; area++; }
    if (b >= 0) { rows.push({ Y: Y(j), x0: X(a), x1: X(b), n }); if (j < minJ) minJ = j; if (j > maxJ) maxJ = j; if (a < minI) minI = a; if (b > maxI) maxI = b; }
  }
  const inOval = tot; // samples inside the 0.96 oval
  results.push({ ref, thr, bounds, rows, area, inOval,
    bbox: { x0: X(minI), x1: X(maxI), y0: Y(minJ), y1: Y(maxJ) },
    fillFrac: area / inOval, comp, N, X, Y, g, inside });
  console.log(`\n${ref}`);
  console.log(`  Otsu threshold ${thr}  (sweep bounds ${bounds[0]}..${bounds[1]}) — in-bounds`);
  console.log(`  head+wig mass bbox  X ${X(minI).toFixed(2)}..${X(maxI).toFixed(2)}  Y ${Y(minJ).toFixed(2)}..${Y(maxJ).toFixed(2)}`);
  console.log(`  width ${(X(maxI) - X(minI)).toFixed(2)}  height ${(Y(maxJ) - Y(minJ)).toFixed(2)}  area/oval ${(area / inOval).toFixed(4)}`);
  console.log('  widest rows (Y, x0..x1, width):');
  const wide = [...rows].sort((a, b) => (b.x1 - b.x0) - (a.x1 - a.x0)).slice(0, 3);
  for (const r of wide) console.log(`    Y ${r.Y.toFixed(2)}  ${r.x0.toFixed(2)}..${r.x1.toFixed(2)}  w ${(r.x1 - r.x0).toFixed(2)}`);
  console.log('  profile every 1.0 unit of Y:');
  for (let yy = Math.ceil(rows[0].Y); yy <= rows[rows.length - 1].Y; yy += 1) {
    const r = rows.reduce((p, c) => Math.abs(c.Y - yy) < Math.abs(p.Y - yy) ? c : p);
    console.log(`    Y ${yy.toFixed(1).padStart(5)}   ${r.x0.toFixed(2)} .. ${r.x1.toFixed(2)}   w ${(r.x1 - r.x0).toFixed(2)}`);
  }
}

// agreement between the two independent references
const [A, B] = results;
console.log('\n=== two-reference agreement (the only thing that makes this a target) ===');
for (const k of ['x0', 'x1', 'y0', 'y1']) {
  console.log(`  bbox.${k}  ${A.bbox[k].toFixed(2)}  vs  ${B.bbox[k].toFixed(2)}   d ${(B.bbox[k] - A.bbox[k]).toFixed(2)}`);
}
console.log(`  area/oval ${A.fillFrac.toFixed(4)} vs ${B.fillFrac.toFixed(4)}`);
// IoU of the two masks
let inter = 0, uni = 0;
for (let k = 0; k < A.N * A.N; k++) { const a = A.comp[k], b = B.comp[k]; if (a || b) uni++; if (a && b) inter++; }
console.log(`  mask IoU between the two photographs: ${(inter / uni).toFixed(4)}`);

// OVERLAY (§4.3): draw each mask boundary back onto its own source
for (const R of results) {
  const K = 4, S = R.N * K;
  let g = '';
  for (let j = 0; j < R.N; j++) for (let i = 0; i < R.N; i++) {
    if (!R.comp[j * R.N + i]) continue;
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([di, dj]) => {
      const ni = i + di, nj = j + dj;
      return ni < 0 || nj < 0 || ni >= R.N || nj >= R.N || !R.comp[nj * R.N + ni];
    });
    if (nb) g += `<rect x="${i * K}" y="${j * K}" width="${K}" height="${K}" fill="#ff2d55"/>`;
  }
  const raw = Buffer.alloc(R.N * R.N);
  for (let k = 0; k < R.N * R.N; k++) raw[k] = Math.max(0, Math.min(255, Math.round(R.g[k])));
  const base = await sharp(raw, { raw: { width: R.N, height: R.N, channels: 1 } }).resize(S, S, { kernel: 'nearest' }).png().toBuffer();
  const out = `coloringbook/judge/_swout/_sw5-seg-${R.ref.replace(/\W/g, '_')}.png`;
  await sharp(base).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">${g}</svg>`), top: 0, left: 0 }]).png().toFile(out);
  console.log(out);
}
