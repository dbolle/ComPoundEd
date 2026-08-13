// ROUND 4 — A DISC FIT THAT DOES NOT DEPEND ON A BACKGROUND FLOOD.
//
// Why this exists. `_rvdisc.fit()` (and `_jqvalley.mjs`'s own `fitDisc`) both
// locate the coin by flooding the BACKGROUND in from the frame edge. On a
// CAMEO PROOF that is exactly backwards: the coin's field is a black mirror,
// so a dark background is the same grey as the thing we are trying to isolate,
// and the flood either walks into the coin or stops on the wrong contour.
// Round 4's overlay (`_jq4-fits.png`, from `_jq40fit.mjs`) shows both failures:
//
//   qp1964-obv-pad.png  flood(dark 99) -> R 183 centred on LIBERTY, p95 74.3%
//   qp1964-rev-pad.png  flood(dark 62) -> R 318, circle well outside the coin
//   quarter-proof-ebay  flood(light 220) -> R 591, p95 9.6%
//
// This one uses the coin's OUTER EDGE, which is a closed high-|grad| circle
// whatever the polarity of the surround:
//   1. Sobel gradient, with its direction;
//   2. every strong edge pixel votes for a centre at +-r along its own gradient
//      direction, for every r in the search range -> 2D centre accumulator;
//   3. the radius is then the mode of |p - centre| over the strong edge pixels.
//
// §4.1 null test: the R search range is printed, and an answer at either end is
// a failure report. §4.2 selection test: the top 5 centre candidates and the
// top 5 radius candidates are printed, every time, not just the winner.
// §4.3: `overlay()` in `_jq40fit.mjs` draws the result on the source and the
// judge looks at it. No fit in this file is used before that has happened.
import sharp from 'sharp';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;

export async function houghDisc(file, opts = {}) {
  const { data, info } = await sharp(P(file)).flatten({ background: '#808080' })
    .greyscale().blur(2).raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const rMin = Math.round(opts.rMin ?? 0.12 * Math.min(W, H));
  const rMax = Math.round(opts.rMax ?? 0.52 * Math.min(W, H));
  // Sobel
  const gx = new Float32Array(W * H), gy = new Float32Array(W * H), gm = new Float32Array(W * H);
  let gsum = 0, gn = 0;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x;
    const a = -data[i - W - 1] - 2 * data[i - 1] - data[i + W - 1] + data[i - W + 1] + 2 * data[i + 1] + data[i + W + 1];
    const b = -data[i - W - 1] - 2 * data[i - W] - data[i - W + 1] + data[i + W - 1] + 2 * data[i + W] + data[i + W + 1];
    gx[i] = a / 8; gy[i] = b / 8; gm[i] = Math.hypot(a, b) / 8; gsum += gm[i]; gn++;
  }
  const gmean = gsum / gn;
  const thr = (opts.gthr ?? 3.0) * gmean;
  // centre accumulator at 2px resolution
  const S = 2, AW = Math.ceil(W / S), AH = Math.ceil(H / S);
  const acc = new Float32Array(AW * AH);
  const edges = [];
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x; if (gm[i] < thr) continue;
    edges.push(i);
    const ux = gx[i] / gm[i], uy = gy[i] / gm[i];
    for (let r = rMin; r <= rMax; r += 2) for (const s of [1, -1]) {
      const ax = Math.round((x + s * ux * r) / S), ay = Math.round((y + s * uy * r) / S);
      if (ax >= 0 && ay >= 0 && ax < AW && ay < AH) acc[ay * AW + ax] += 1;
    }
  }
  // top centre candidates, non-maximum-suppressed at 8 accumulator cells
  const order = Array.from(acc.keys()).sort((a, b) => acc[b] - acc[a]);
  const cands = [];
  for (const k of order) {
    const ax = k % AW, ay = (k - ax) / AW;
    if (cands.some((c) => Math.hypot(c.ax - ax, c.ay - ay) < 8)) continue;
    cands.push({ ax, ay, v: acc[k] });
    if (cands.length >= 5) break;
  }
  const rate = (cx, cy) => {
    // radius histogram (1px bins) over strong edge pixels whose gradient points
    // at/away from the centre — that excludes lettering and relief edges.
    const hist = new Float64Array(rMax + 2);
    for (const i of edges) {
      const x = i % W, y = (i - x) / W;
      const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy);
      if (d < rMin || d > rMax) continue;
      const al = Math.abs((gx[i] * dx + gy[i] * dy) / (gm[i] * d));
      if (al < 0.86) continue;                       // within ~30 deg of radial
      hist[Math.round(d)] += gm[i] * al / d;         // /d: equal weight per unit angle
    }
    const sm = new Float64Array(hist.length);
    for (let r = 0; r < hist.length; r++) { let s = 0, n = 0;
      for (let k = -2; k <= 2; k++) if (hist[r + k] !== undefined) { s += hist[r + k] || 0; n++; }
      sm[r] = s / n; }
    const rs = Array.from(sm.keys()).filter((r) => r >= rMin && r <= rMax).sort((a, b) => sm[b] - sm[a]);
    const picks = [];
    for (const r of rs) { if (picks.some((p) => Math.abs(p.r - r) < 6)) continue; picks.push({ r, v: sm[r] }); if (picks.length >= 5) break; }
    return picks;
  };
  const scored = cands.map((c) => {
    const cx = c.ax * S, cy = c.ay * S, picks = rate(cx, cy);
    return { cx, cy, votes: c.v, picks, best: picks[0] };
  }).sort((a, b) => b.best.v - a.best.v);
  const win = scored[0];
  // sub-pixel refine: local search over cx, cy, R
  let bf = { cx: win.cx, cy: win.cy, R: win.best.r, v: win.best.v };
  for (let it = 0; it < 3; it++) {
    const st = [2, 1, 0.5][it];
    for (let dx = -4; dx <= 4; dx++) for (let dy = -4; dy <= 4; dy++) {
      const cx = bf.cx + dx * st, cy = bf.cy + dy * st;
      const p = rate(cx, cy)[0];
      if (p && Math.abs(p.r - bf.R) < 12 && p.v > bf.v) bf = { cx, cy, R: p.r, v: p.v };
    }
  }
  // residual: p95 |dist - R| over radial edge pixels near the fitted circle
  const res = [];
  for (const i of edges) {
    const x = i % W, y = (i - x) / W;
    const dx = x - bf.cx, dy = y - bf.cy, d = Math.hypot(dx, dy);
    if (Math.abs(d - bf.R) > 0.08 * bf.R) continue;
    const al = Math.abs((gx[i] * dx + gy[i] * dy) / (gm[i] * d));
    if (al < 0.86) continue;
    res.push(Math.abs(d - bf.R));
  }
  res.sort((a, b) => a - b);
  return { file, W, H, cx: +bf.cx.toFixed(2), cy: +bf.cy.toFixed(2), R: +bf.R.toFixed(2),
    rMin, rMax, atBound: bf.R <= rMin + 2 || bf.R >= rMax - 2,
    p95: res.length ? +res[(res.length * 0.95) | 0].toFixed(2) : NaN,
    centres: scored.map((s) => ({ cx: s.cx, cy: s.cy, votes: Math.round(s.votes), R: s.best.r, score: +s.best.v.toFixed(1) })),
    radii: win.picks.map((p) => ({ r: p.r, score: +p.v.toFixed(1) })) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const files = process.argv.slice(2).length ? process.argv.slice(2)
    : ['dime-obv-2.jpg', 'qp1963-obv-pad.png', 'qp1963-rev-pad.png', 'qp1964-obv-pad.png',
       'qp1964-rev-pad.png', 'quarter-proof-ebay.jpg', 'q1995d-rev.png',
       'quarter-rev-2.png', 'quarter-rev-3.jpg'];
  const out = {};
  for (const f of files) {
    const r = await houghDisc(f);
    out[f] = { cx: r.cx, cy: r.cy, R: r.R };
    console.log(`${f.padEnd(24)} ${r.W}x${r.H}  R search [${r.rMin}, ${r.rMax}]${r.atBound ? '  <-- AT BOUND, NOT A VALUE (§4.1)' : ''}`);
    console.log(`   fit  cx ${r.cx} cy ${r.cy} R ${r.R}   p95 residual ${r.p95} = ${(100 * r.p95 / r.R).toFixed(2)}% of R`);
    console.log(`   centre candidates (§4.2): ${r.centres.map((c) => `(${c.cx},${c.cy})r${c.R}/${c.score}`).join('  ')}`);
    console.log(`   radius candidates (§4.2): ${r.radii.map((p) => `${p.r}/${p.score}`).join('  ')}`);
  }
  console.log('\nDISCS:'); console.log(JSON.stringify(out, null, 1));
}
