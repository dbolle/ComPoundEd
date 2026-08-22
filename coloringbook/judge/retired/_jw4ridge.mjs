// R4 dime jaw — TRACK the dark ridge, then DRAW WHAT WAS FOUND (§4.3).
//
// Why this exists: `_jw4width.mjs` measured the width of "the trough nearest
// the drawn line" and got troughs 2-4 units off the line, of opposite sign on
// different references, many pinned at its window. A number like that is not a
// taper measurement, it is a detector that has not been shown its own answer.
// So this one emits WHAT IT FOUND — the trough centre and the two half-depth
// edges, station by station — and paints all three on the photograph.
//
// Smoothing, and both halves are needed on a cameo proof:
//   · tangential average +-TANG units (blur along the feature, which cannot
//     blur its width);
//   · Gaussian sigma SIG units ACROSS the feature. The frost is +-20 grey
//     levels at 9.7 px/unit; without this the argmin is noise. SIG is printed
//     and swept in the response test so its effect on the answer is visible.
//
// SELECTION (§4.2): the trough is chosen from ALL local minima inside the
// search band, and the whole candidate list is printed per station, so a
// reader can see when the choice was close.
// NULL (§4.1): SEARCH is the half-band the argmin may live in; a centre at
// +-SEARCH is printed as BOUND and never used as a value.
// RESPONSE (§4): RESPONSE=1 sweeps SIG over 0.2/0.4/0.8 and SEARCH over 3/5/7
// and prints the answer for each, so a reader can see whether the answer is a
// property of the coin or of the window.
//
// Run: node coloringbook/judge/_jw4ridge.mjs [ref]
import sharp from 'sharp';
import { busted, discFor, makeMap } from './_jw4reg.mjs';
import { walk, greyImg, inside } from './_jw4width.mjs';
import { marks } from './_jqgeom.mjs';

const REFDIR = new URL('../ref/', import.meta.url).pathname;
const TANG = Number(process.env.TANG || 2.0);
const SIG = Number(process.env.SIG || 0.4);
const SEARCH = Number(process.env.SEARCH || 5);
const HALF = SEARCH + 4;
const DS = 0.05;

const B = await busted();
const jawD = B.svg.match(/<path d="(M 19\.4 21\.4[^"]*)"/)[1];
const jaw = marks(`<svg><path d="${jawD}"/></svg>`)[0];
const P = walk(jaw.pts, 0.5);
const head = marks(`<svg><path d="${B.headD}"/></svg>`)[0].pts;
const bilin = (g, x, y) => {
  if (x < 0 || y < 0 || x > g.w - 2 || y > g.h - 2) return NaN;
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
  const i = y0 * g.w + x0;
  return (1 - fx) * (1 - fy) * g.d[i] + fx * (1 - fy) * g.d[i + 1]
    + (1 - fx) * fy * g.d[i + g.w] + fx * fy * g.d[i + g.w + 1];
};

function station(g, M, i, sig = SIG, search = SEARCH, tang = TANG) {
  const p = P[i];
  const nx = -p.ty, ny = p.tx;
  const N = Math.round(HALF / DS);
  const raw = new Float64Array(2 * N + 1).fill(NaN);
  for (let k = -N; k <= N; k++) {
    let s = 0, c = 0;
    for (let j = -Math.round(tang / 0.25); j <= Math.round(tang / 0.25); j++) {
      const lx = p.x + p.tx * j * 0.25 + nx * k * DS, ly = p.y + p.ty * j * 0.25 + ny * k * DS;
      if (!inside(head, lx, ly)) continue;
      const q = M.toPx(lx, ly);
      const v = bilin(g, q.px, q.py);
      if (!Number.isNaN(v)) { s += v; c++; }
    }
    if (c) raw[k + N] = s / c;
  }
  // gaussian across, over valid samples only
  const sm = new Float64Array(2 * N + 1).fill(NaN);
  const rad = Math.ceil((3 * sig) / DS);
  for (let k = 0; k <= 2 * N; k++) {
    if (Number.isNaN(raw[k])) continue;
    let a = 0, b = 0;
    for (let m = -rad; m <= rad; m++) {
      const kk = k + m; if (kk < 0 || kk > 2 * N || Number.isNaN(raw[kk])) continue;
      const w = Math.exp(-((m * DS) ** 2) / (2 * sig * sig));
      a += w * raw[kk]; b += w;
    }
    sm[k] = a / b;
  }
  const lim = Math.round(search / DS);
  const cands = [];
  for (let k = N - lim + 1; k <= N + lim - 1; k++) {
    if (Number.isNaN(sm[k - 1]) || Number.isNaN(sm[k]) || Number.isNaN(sm[k + 1])) continue;
    if (sm[k] <= sm[k - 1] && sm[k] < sm[k + 1]) cands.push({ t: (k - N) * DS, v: sm[k], k });
  }
  cands.sort((a, b) => a.v - b.v);
  if (!cands.length) return { none: true, cands };
  const best = cands[0];
  let lo = best.k; while (lo > 0 && !Number.isNaN(sm[lo - 1]) && sm[lo - 1] >= sm[lo]) lo--;
  let hi = best.k; while (hi < 2 * N && !Number.isNaN(sm[hi + 1]) && sm[hi + 1] >= sm[hi]) hi++;
  const depth = (sm[lo] + sm[hi]) / 2 - best.v;
  const cut = best.v + depth / 2;
  let a = best.k; while (a > lo && sm[a] < cut) a--;
  let b = best.k; while (b < hi && sm[b] < cut) b++;
  return {
    t: best.t, v: best.v, depth, width: (b - a) * DS,
    tA: (a - N) * DS, tB: (b - N) * DS, cands: cands.slice(0, 3),
    bound: Math.abs(best.t) >= search - DS, clipped: a === lo || b === hi,
  };
}

const refs = process.argv[2] ? [process.argv[2]] : ['dime-obv-2.jpg', 'dime-obv-3.jpg', 'dime-obv.jpg'];
for (const ref of refs) {
  const disc = discFor(ref);
  const M = makeMap(B, disc);
  const g = await greyImg(REFDIR + ref);
  console.log(`\n=== ${ref}  ${M.pxPerUnit.toFixed(2)} px/unit   SIG=${SIG} SEARCH=+-${SEARCH} TANG=+-${TANG}`);
  console.log('  s   local(x,y)      t_centre  width  depth   band[tA,tB]   other minima (t,v)');
  const found = [];
  for (let i = 0; i < P.length; i += 2) {
    const r = station(g, M, i);
    if (r.none) { console.log(`${P[i].s.toFixed(1).padStart(4)}  no local minimum in band`); continue; }
    found.push({ i, s: P[i].s, ...r });
    if (i % 4 === 0) {
      console.log(`${P[i].s.toFixed(1).padStart(4)}  (${P[i].x.toFixed(1)},${P[i].y.toFixed(1)})`.padEnd(20)
        + `${r.t.toFixed(2).padStart(8)} ${r.width.toFixed(2).padStart(6)} ${r.depth.toFixed(0).padStart(6)}`
        + `   [${r.tA.toFixed(2)},${r.tB.toFixed(2)}]`.padEnd(17)
        + r.cands.slice(1).map((c) => `(${c.t.toFixed(1)},${c.v.toFixed(0)})`).join(' ')
        + (r.bound ? '  BOUND' : '') + (r.clipped ? '  clip' : ''));
    }
  }
  if (process.env.RESPONSE) {
    for (const sig of [0.2, 0.4, 0.8]) {
      for (const se of [3, 5, 7]) {
        const mid = station(g, M, 24, sig, se);
        console.log(`  RESPONSE sig=${sig} search=${se}: t=${mid.t?.toFixed(2)} w=${mid.width?.toFixed(2)}${mid.bound ? ' BOUND' : ''}`);
      }
    }
  }
  // ---- §4.3: paint the located ridge on the source
  const md = await sharp(REFDIR + ref).metadata();
  const seg = (pts, col, w) => `<polyline points="${pts.map((q) => `${q.px.toFixed(1)},${q.py.toFixed(1)}`).join(' ')}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
  const nAt = (i) => ({ nx: -P[i].ty, ny: P[i].tx });
  const at = (i, t) => { const n = nAt(i); return M.toPx(P[i].x + n.nx * t, P[i].y + n.ny * t); };
  const W = Math.max(1, disc.R / 260);
  let gsvg = seg(jaw.pts.map((q) => M.toPx(q.x, q.y)), '#ff00cc', W * 1.4);
  gsvg += seg(found.map((f) => at(f.i, f.t)), '#00ffff', W * 1.4);
  gsvg += seg(found.map((f) => at(f.i, f.tA)), '#ffee00', W);
  gsvg += seg(found.map((f) => at(f.i, f.tB)), '#ffee00', W);
  const ov = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${md.width}" height="${md.height}">${gsvg}</svg>`)).png().toBuffer();
  const cs = [[-20, 2], [26, 2], [-20, 34], [26, 34]].map(([x, y]) => M.toPx(x, y));
  const L = Math.max(0, Math.floor(Math.min(...cs.map((c) => c.px)))), T = Math.max(0, Math.floor(Math.min(...cs.map((c) => c.py))));
  const w2 = Math.min(md.width - L, Math.ceil(Math.max(...cs.map((c) => c.px))) - L);
  const h2 = Math.min(md.height - T, Math.ceil(Math.max(...cs.map((c) => c.py))) - T);
  const K = Math.max(1, Math.round(900 / w2));
  const out = new URL(`./_jw4ridge-${ref.replace(/\./g, '-')}.png`, import.meta.url).pathname;
  const merged = await sharp(REFDIR + ref).composite([{ input: ov, left: 0, top: 0 }]).png().toBuffer();
  await sharp(merged).extract({ left: L, top: T, width: w2, height: h2 })
    .resize({ width: w2 * K, height: h2 * K, kernel: 'nearest' }).png().toFile(out);
  console.log(`  overlay -> ${out}   magenta = the drawn jaw, cyan = the located trough, yellow = its half-depth edges`);
}
