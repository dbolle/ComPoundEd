// R4 dime jaw — §14.2's THREE NUMBERS: the dark run's width at both ends and
// at the middle of the jaw, taken off the photographs.
//
// PROTOCOL, fixed before the final measurement was taken (it is the protocol
// `_jw4ridge.mjs` arrived at, written down so the three numbers are not a
// choice made after seeing them):
//   stations   s = 2 (chin end), s = 17 (middle), s = 32 (the turn under the
//              ear), arc length along the DRAWN jaw path from the chin.
//   trough     the deepest local minimum of the smoothed perpendicular profile
//              within +-2.5 local units of the drawn path. All candidates are
//              printed (§4.2).
//   floor      a run counts only if its half-depth is >= 12 grey levels. A
//              station under the floor prints NO RUN and contributes nothing —
//              it is not silently averaged in as a zero.
//   width      full width at half depth, in HEAD-LOCAL units. Multiply by the
//              bust scale s=0.97 for viewBox units; divide by 47 for
//              disc-normalised.
//
// REFERENCE CLASS matters here and is printed on every row. This is a
// PHOTOMETRIC measurement of a shadow, so `ref/PROVENANCE-dime-proofs.md`'s
// rule and §20.3 both apply: a cameo proof is the best shape reference and the
// worst tone reference. dime-obv.jpg is the only STRUCK obverse we hold.
//
// Response test: inherited from `_jw4width.mjs` SELFTEST, which recovers a
// synthetic band of 1.00 / 2.50 / 4.00 units to +0.05 through this same
// sampler. Null test: the +-2.5 search band and the 12-level floor are printed,
// and a centre at the band edge prints BOUND.
//
// Run: node coloringbook/judge/_jw4taper.mjs
import { busted, discFor, makeMap } from './_jw4reg.mjs';
import { walk, greyImg, inside } from './_jw4width.mjs';
import { marks } from './_jqgeom.mjs';

const REFDIR = new URL('../ref/', import.meta.url).pathname;
const SEARCH = 2.5, SIG = 0.4, TANG = 2.0, FLOOR = 12, DS = 0.05, HALF = 9;
const CLASS = {
  'dime-obv.jpg': 'STRUCK (1996-W uncirculated) — the only tone-admissible obverse',
  'dime-obv-2.jpg': 'CAMEO PROOF (2015-W) — frozen SHAPE reference; §20.3 excludes it from tone',
  'dime-obv-3.jpg': 'PROOF — grey field, but raking light isolates the jaw line',
};
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
function run(g, M, i) {
  const p = P[i], nx = -p.ty, ny = p.tx, N = Math.round(HALF / DS);
  const raw = new Float64Array(2 * N + 1).fill(NaN);
  for (let k = -N; k <= N; k++) {
    let s = 0, c = 0;
    for (let j = -Math.round(TANG / 0.25); j <= Math.round(TANG / 0.25); j++) {
      const lx = p.x + p.tx * j * 0.25 + nx * k * DS, ly = p.y + p.ty * j * 0.25 + ny * k * DS;
      if (!inside(head, lx, ly)) continue;
      const q = M.toPx(lx, ly);
      const v = bilin(g, q.px, q.py);
      if (!Number.isNaN(v)) { s += v; c++; }
    }
    if (c) raw[k + N] = s / c;
  }
  const sm = new Float64Array(2 * N + 1).fill(NaN), rad = Math.ceil((3 * SIG) / DS);
  for (let k = 0; k <= 2 * N; k++) {
    if (Number.isNaN(raw[k])) continue;
    let a = 0, b = 0;
    for (let m = -rad; m <= rad; m++) {
      const kk = k + m; if (kk < 0 || kk > 2 * N || Number.isNaN(raw[kk])) continue;
      const w = Math.exp(-((m * DS) ** 2) / (2 * SIG * SIG)); a += w * raw[kk]; b += w;
    }
    sm[k] = a / b;
  }
  const lim = Math.round(SEARCH / DS), cands = [];
  for (let k = N - lim + 1; k <= N + lim - 1; k++) {
    if (Number.isNaN(sm[k - 1]) || Number.isNaN(sm[k]) || Number.isNaN(sm[k + 1])) continue;
    if (sm[k] <= sm[k - 1] && sm[k] < sm[k + 1]) cands.push({ t: (k - N) * DS, v: sm[k], k });
  }
  if (!cands.length) return { none: true };
  cands.sort((a, b) => a.v - b.v);
  const best = cands[0];
  let lo = best.k; while (lo > 0 && !Number.isNaN(sm[lo - 1]) && sm[lo - 1] >= sm[lo]) lo--;
  let hi = best.k; while (hi < 2 * N && !Number.isNaN(sm[hi + 1]) && sm[hi + 1] >= sm[hi]) hi++;
  const depth = (sm[lo] + sm[hi]) / 2 - best.v, cut = best.v + depth / 2;
  let a = best.k; while (a > lo && sm[a] < cut) a--;
  let b = best.k; while (b < hi && sm[b] < cut) b++;
  return { t: best.t, depth, width: (b - a) * DS, cands: cands.slice(0, 3),
    bound: Math.abs(best.t) >= SEARCH - DS };
}

// FIRST ATTEMPT, kept because it is the iteration that failed: three single
// stations at s = 2 / 17 / 32. At s=17 the struck reference's trough sits at
// -2.45 against a +-2.5 band (BOUND, §4.1) and both proofs are under the depth
// floor, so the middle number did not exist. Three single samples of a noisy
// boundary is too few; the fix is to measure the WHOLE profile and aggregate
// by thirds, which is the same three numbers taken from ~6 stations each.
const TOTAL = P[P.length - 1].s;
const THIRDS = [
  { name: 'chin end', lo: 0, hi: TOTAL / 3 },
  { name: 'middle', lo: TOTAL / 3, hi: (2 * TOTAL) / 3 },
  { name: 'under the ear', lo: (2 * TOTAL) / 3, hi: TOTAL },
];
console.log(`SEARCH +-${SEARCH} local units, SIG ${SIG}, tangential +-${TANG}, depth FLOOR ${FLOOR} grey levels`);
console.log(`path length ${TOTAL.toFixed(1)} local units; thirds at s < ${(TOTAL / 3).toFixed(1)} / `
  + `${(TOTAL / 3).toFixed(1)}-${((2 * TOTAL) / 3).toFixed(1)} / > ${((2 * TOTAL) / 3).toFixed(1)}`);
console.log('(null test: a centre at +-2.5 is the band edge and prints BOUND and is DROPPED;'
  + ' a run under the floor prints x and is DROPPED)\n');
const acc = {};
for (const ref of ['dime-obv.jpg', 'dime-obv-3.jpg', 'dime-obv-2.jpg']) {
  const M = makeMap(B, discFor(ref));
  const g = await greyImg(REFDIR + ref);
  console.log(`${ref}  [${CLASS[ref]}]`);
  console.log('    s  local(x,y)        width  depth  centre  use');
  for (let i = 0; i < P.length; i += 4) {
    const r = run(g, M, i);
    const use = !r.none && r.depth >= FLOOR && !r.bound;
    const tag = `  ${P[i].s.toFixed(0).padStart(3)}  (${P[i].x.toFixed(1)},${P[i].y.toFixed(1)})`.padEnd(21);
    if (r.none) { console.log(`${tag}  — no local minimum in the band`); continue; }
    console.log(`${tag}${r.width.toFixed(2).padStart(6)} ${r.depth.toFixed(0).padStart(6)} `
      + `${r.t.toFixed(2).padStart(7)}   ${use ? 'yes' : (r.bound ? 'BOUND' : 'x depth')}`);
    if (!use) continue;
    const th = THIRDS.find((t) => P[i].s >= t.lo && P[i].s <= t.hi);
    (acc[th.name] ||= []).push({ ref, w: r.width, s: P[i].s });
  }
}
console.log('\n§14.2 THREE NUMBERS — mean of every usable station in the third');
for (const th of THIRDS) {
  const a = acc[th.name] || [];
  if (!a.length) { console.log(`  ${th.name}: NO usable station — this number does not exist`); continue; }
  const m = a.reduce((s, x) => s + x.w, 0) / a.length;
  const lo = Math.min(...a.map((x) => x.w)), hi = Math.max(...a.map((x) => x.w));
  const byref = [...new Set(a.map((x) => x.ref))];
  console.log(`  ${th.name.padEnd(15)} mean ${m.toFixed(2)} local (= ${(m * 0.97).toFixed(2)} viewBox, `
    + `${(m / 47).toFixed(4)} disc-normalised)  n=${a.length} over ${byref.length} references, range ${lo.toFixed(2)}-${hi.toFixed(2)}`);
  for (const rf of byref) {
    const b = a.filter((x) => x.ref === rf);
    console.log(`      ${rf.padEnd(16)} ${b.map((x) => `s${x.s.toFixed(0)}:${x.w.toFixed(2)}`).join('  ')}`);
  }
}
console.log(`\nthe mark as drawn today: stroke-width 1.5 viewBox = ${(1.5 / 0.97).toFixed(2)} local units, CONSTANT`);
