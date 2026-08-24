// ROUND 5, cent obverse — D7: is each over-75 knot a corner the DIE CUTS, or an
// artefact of the fit? Round 4 on the dime settled the same question by measuring
// the corner ON THE FROZEN MASK with a chord estimator against a control; this
// runs that test on the cent's two failing knots.
//
// WHAT THE ESTIMATOR DOES. At a query point it finds the nearest mask vertex and
// measures the angle between the chord arriving over a span of L local units and
// the chord leaving over the same span, for a ladder of L. A real corner holds a
// large angle at every L (it is scale-free); a pixel-trace wiggle collapses
// toward 0 as L grows. The ladder is printed, not a single number, because a
// single L is a locus chosen at measuring time (§6.1).
//
// CONTROLS, all three run every time:
//   (1) a SYNTHETIC RIGHT ANGLE   — must read ~90 at every L (response test).
//   (2) a SYNTHETIC STRAIGHT RUN  — must read ~0 at every L (null test).
//   (3) a SMOOTH STRETCH OF THIS MASK — the crown at local (0, -34), which our
//       own fitted HEAD passes through with no knot over 69.1 deg. Whatever this
//       reads is the mask's own trace noise, and a query is only a corner if it
//       stands clear of it.
//
// The mask is read at its published hash and is not written.
//
// Run: node coloringbook/judge/_jc5corner.mjs
import { readFileSync } from 'node:fs';
import { flattenPath, turns } from './_jqgeom.mjs';
import * as B from '../_nkbuild.mjs';

const M = JSON.parse(readFileSync('coloringbook/_headmask-penny.json', 'utf8'));
const PLACE = { s: 0.78, cx: 3.88, cy: 40.0 };     // _pybuild.mjs's own frame, as literals
const toLocal = ([u, v]) => [(50 + 47 * u - 50 - PLACE.cx) / PLACE.s, (50 + 47 * v - PLACE.cy) / PLACE.s];
// The mask is a RAW PIXEL TRACE: 2048 vertices at 0.286-unit spacing, and at
// chord spans under ~4 units its own quantisation noise reads 74-140 deg on
// stretches that are visibly smooth. `_pybuild.mjs` does not fit that chain; it
// fits `B.smooth(chain, 34)`. So the estimator runs on the same smoothed chain,
// at the same 34 passes, as a literal — and the raw chain is scored too, so the
// difference is visible rather than assumed.
const RAWL = M.poly.map(toLocal);
const PASSES = 34;
const L = process.env.RAWMASK ? RAWL : B.smooth(RAWL, PASSES, []);
const N = L.length;
const at = (i) => L[((i % N) + N) % N];

const seglen = (i) => Math.hypot(at(i + 1)[0] - at(i)[0], at(i + 1)[1] - at(i)[1]);
let per = 0; for (let i = 0; i < N; i++) per += seglen(i);
console.log(`mask: ${N} vertices, perimeter ${per.toFixed(1)} local units, mean spacing ${(per / N).toFixed(3)}`);

// walk `span` local units back / forward from vertex i along the polygon
function walk(i, span, dir) {
  let d = 0, k = i;
  while (d < span) { const s = dir > 0 ? seglen(k) : seglen(k - 1); d += s; k += dir; if (Math.abs(k - i) > N) break; }
  return at(k);
}
function chordAngle(i, span) {
  const a = walk(i, span, -1), b = at(i), c = walk(i, span, +1);
  let t = Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(b[1] - a[1], b[0] - a[0]);
  while (t > Math.PI) t -= 2 * Math.PI; while (t < -Math.PI) t += 2 * Math.PI;
  return Math.abs(t * 180 / Math.PI);
}
const nearest = (p) => { let b = 0, bd = 1e9; for (let i = 0; i < N; i++) { const d = Math.hypot(at(i)[0] - p[0], at(i)[1] - p[1]); if (d < bd) { bd = d; b = i; } } return { i: b, d: bd }; };

const SPANS = [1, 2, 3, 4, 6, 8];
const row = (label, f) => console.log(`  ${label.padEnd(42)} ` + SPANS.map((s) => f(s).toFixed(1).padStart(7)).join(''));

console.log(`\nchord spans (local units):            ` + SPANS.map((s) => String(s).padStart(7)).join(''));

// (1) and (2): synthetic controls, on a polygon sampled at the mask's own spacing
{
  const step = per / N;
  const mk = (fn, n) => { const P = []; for (let k = 0; k < n; k++) P.push(fn(k * step)); return P; };
  const corner = mk((t) => (t < 30 ? [t - 30, 0] : [0, t - 30]), Math.ceil(60 / step));
  const line = mk((t) => [t - 30, 0], Math.ceil(60 / step));
  const ang = (P, span) => {
    const i = P.findIndex((p) => Math.abs(p[0]) < step && Math.abs(p[1]) < step);
    const w = (dir) => { let d = 0, k = i; while (d < span && k > 0 && k < P.length - 1) { const j = dir > 0 ? k : k - 1; d += Math.hypot(P[j + 1][0] - P[j][0], P[j + 1][1] - P[j][1]); k += dir; } return P[k]; };
    const a = w(-1), b = P[i], c = w(+1);
    let t = Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(b[1] - a[1], b[0] - a[0]);
    while (t > Math.PI) t -= 2 * Math.PI; while (t < -Math.PI) t += 2 * Math.PI;
    return Math.abs(t * 180 / Math.PI);
  };
  row('CONTROL 1  synthetic right angle (want 90)', (s) => ang(corner, s));
  row('CONTROL 2  synthetic straight run (want 0)', (s) => ang(line, s));
}

// (3) smooth stretches of THIS mask
for (const [name, p] of [['crown (0,-34)', [0, -34]], ['back of head (-26,-6)', [-26, -6]], ['profile/nose (18,-3)', [18, -3]]]) {
  const q = nearest(p);
  row(`CONTROL 3  mask, ${name}, v${q.i} d${q.d.toFixed(2)}`, (s) => chordAngle(q.i, s));
}

// CONTROL 4 — the strongest one: the DISTRIBUTION of the same estimator over
// every vertex of the mask at each span. A query is only a corner if it stands
// clear of the mask's own noise, and the p99/max of that noise is what "clear"
// has to mean.
console.log('');
for (const q of ['median', 'p90', 'p99', 'max']) {
  row(`CONTROL 4  whole-mask chord-angle ${q}`, (s) => {
    const a = []; for (let i = 0; i < N; i += 4) a.push(chordAngle(i, s));
    a.sort((x, y) => x - y);
    return q === 'max' ? a[a.length - 1] : a[Math.min(a.length - 1, Math.floor(a.length * ({ median: 0.5, p90: 0.9, p99: 0.99 })[q]))];
  });
}

// the two queries
console.log('');
for (const [name, p] of [['HAIR knot 16  (-19.03, 11.99)', [-19.03, 11.99]], ['BEARD knot 7  (-17.28, 8.63)', [-17.28, 8.63]]]) {
  const q = nearest(p);
  row(`QUERY  ${name} -> v${q.i} d${q.d.toFixed(2)}`, (s) => chordAngle(q.i, s));
}

// ── and what our own paths do there, for comparison, at the same spans.
const mod = await import('../../src/art/coins.js');
const svg = mod.coinSVG('penny', 380, { side: 'obverse' });
const ds = [...svg.matchAll(/<path\b[^>]*?\sd="([^"]*)"/g)].map((m) => m[1]);
const pick = (pre) => ds.find((d) => d.startsWith(pre));
console.log('\nOUR OWN KNOT TURNS (the D7 number), and our knot spacing:');
for (const [nm, pre] of [['HEAD', 'M -20.39 18'], ['HAIR', 'M 13.5 -27.05'], ['BEARD', 'M 15.15 12.77']]) {
  const K = flattenPath(pick(pre)).knots;
  const T = turns(K);
  let s = 0; for (let i = 1; i < K.length; i++) s += Math.hypot(K[i].x - K[i - 1].x, K[i].y - K[i - 1].y);
  console.log(`  ${nm.padEnd(6)} ${K.length} knots, mean knot spacing ${(s / (K.length - 1)).toFixed(2)} local units, worst turn ${Math.max(...T.map((t) => t.deg)).toFixed(1)} deg`);
}

// ── is the cusp COVERED? Both cusps sit where two drawn masses abut. The beard
// is emitted after the hair, so anything of the hair inside the beard region is
// painted over. Point-in-polygon on the dense flattened outlines.
const inside = (P, x, y) => {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++)
    if ((P[i].y > y) !== (P[j].y > y) && x < (P[j].x - P[i].x) * (y - P[i].y) / (P[j].y - P[i].y) + P[i].x) c = !c;
  return c;
};
const HAIRP = flattenPath(pick('M 13.5 -27.05')).pts;
const BEARDP = flattenPath(pick('M 15.15 12.77')).pts;
console.log('\nCOVERAGE (the beard group is emitted AFTER the hair group, so the beard paints over it):');
console.log(`  HAIR cusp (-19.03, 11.99) inside the BEARD region? ${inside(BEARDP, -19.03, 11.99)}`);
console.log(`  BEARD cusp (-17.28, 8.63) inside the HAIR region?  ${inside(HAIRP, -17.28, 8.63)}`);
