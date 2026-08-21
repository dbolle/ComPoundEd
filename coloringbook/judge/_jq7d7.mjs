// ROUND 7, QUARTER OBVERSE — D7, knot by knot.
//
// Step 1 is IDENTIFICATION, which the scorecard never had: which path, which
// knot index, which authored source string. D7-obverse has been recorded for
// four rounds as "worst 102 deg, 5 knots over 75, across 7 paths" with a locus
// of "obv HEAD, HAIR" — but the 7 paths include `plane`, `shade` and the curls,
// which are authored polygons, and Appendix P2 (adopted into §3) says the gate
// is for paths PRODUCED BY FITTING A CONTOUR. A polygon declares its corners
// and those knots are exempt; a path with no declaration is scored whole.
//
// Step 2 is the EVIDENCE, and it comes off the TARGET: `_headmask-quarter-v3.json`,
// the traced silhouette of `quarter-obv-2.jpg`, frozen before this round. For a
// knot that lies on the silhouette, find the nearest mask vertex, take a chord
// from it to the vertex ARM units away on each side, and report the turn
// between the chords. If the coin's own outline turns as much there, the knot
// is the object; if it does not, the knot is an oscillation and it is smoothed.
//
// The chord estimator is round 4's (`_jw4corner.mjs`), including the reason it
// is a chord and not a total-least-squares fit: TLS returns an undirected axis
// and orienting it by the arm's end-to-end vector FLIPPED on round 4's smooth
// control.
//
// §4.2 SELECTION — the arm length is swept over 2/3/4/5/6 units and every
//      answer is printed. A corner measured at one arm length is a choice.
// §4.1 NULL — a turn lies in [0,180] by construction and both bounds are
//      printed, with the mask's own vertex spacing so a reader can see the arms
//      contain enough points.
// CONTROLS — two, both on this coin: a point in the MIDDLE of the long straight
//      bust truncation, where the outline must turn by ~0 at every arm length,
//      and a knot on the smooth back of the wig, where it must be small.
//
// Run: node coloringbook/judge/_jq7d7.mjs
import { readFileSync } from 'node:fs';
import { marks, turns } from './_jqgeom.mjs';

const MASK = JSON.parse(readFileSync('coloringbook/_headmask-quarter-v3.json'));
const mod = await import('../../src/art/coins.js');
const svg = mod.coinSVG('quarter', 190, { side: 'obverse' });
const all = marks(svg).slice(1);

// mask (u,v) with u = (px-cx)/R  ->  viewBox, which is X = 50 + 47u
// SMOOTHING THE TARGET BEFORE MEASURING — processing, not editing (spec 1: the
// file on disk is untouched and its hash is unchanged).
//
// It is needed because of a property of this target that no round has recorded.
// `_headmask-quarter-v3.json` is a Douglas-Peucker simplification of a trace
// whose every point was "moved along its own outward normal to the local
// maximum of |grad I|, 4 passes". That crest refinement leaves normal jitter of
// a few tenths of a unit at a mean vertex spacing of 0.906, and a turn angle is
// the derivative of exactly that. Swept over all 308 vertices with the estimator
// below, the RAW mask's own turn distribution is
//
//   arm      p5    p25    med    p75    p95    max
//     2     3.3   21.1   53.5   89.6  128.9  179.4
//     6     4.4   17.7   44.1   74.8  121.8  169.4
//
// — a median of 44-54 degrees at a point taken at random on a bust outline that
// is, to the eye, smooth nearly everywhere. A 102-degree knot cannot be called
// a corner against a target whose own p75 is 90.
//
// SMOOTH=n binomial passes over the polygon; the noise floor is re-printed for
// whatever n is used, so a reader can see what the smoothing bought. SMOOTH=0
// prints the raw target.
const SMOOTH = Number(process.env.SMOOTH ?? 6);
let P = MASK.poly.map(([u, v]) => ({ x: 50 + 47 * u, y: 50 + 47 * v }));
for (let k = 0; k < SMOOTH; k++) {
  const Q = P;
  P = Q.map((_, i) => {
    const a = Q[(i - 1 + Q.length) % Q.length], b = Q[i], c = Q[(i + 1) % Q.length];
    return { x: (a.x + 2 * b.x + c.x) / 4, y: (a.y + 2 * b.y + c.y) / 4 };
  });
}
const spacing = (() => { let s = 0; for (let i = 1; i < P.length; i++) s += Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y); return s / (P.length - 1); })();

console.log(`### D7 quarter obverse — mask ${P.length} vertices, mean spacing ${spacing.toFixed(3)} viewBox units`);
console.log('### BOUNDS (null test): a turn angle lies in [0, 180] by construction.\n');

// ── step 1: every knot over 75 deg, identified ─────────────────────────────
console.log('## every knot turning more than 75 deg, with its path and index');
const over = [];
for (const m of all) {
  if (m.el !== 'path' || !m.knots.length) continue;
  const d = (m.tag.match(/\sd="([^"]*)"/) || [, ''])[1].replace(/\s+/g, ' ');
  for (const t of turns(m.knots)) {
    if (t.deg <= 75) continue;
    over.push({ deg: t.deg, i: t.i, at: t.at, d, knots: m.knots.length, m });
    console.log(`  ${t.deg.toFixed(1).padStart(6)} deg  knot ${String(t.i).padStart(2)} of ${String(m.knots.length).padStart(2)}  at viewBox (${t.at.x.toFixed(2)}, ${t.at.y.toFixed(2)})`);
    console.log(`            ${d.slice(0, 118)}`);
  }
}
console.log(`  -> ${over.length} knots over 75 deg\n`);

// ── step 2: the corner on the TARGET ───────────────────────────────────────
function maskTurn(target, arm) {
  let bi = 0, bd = Infinity;
  for (let i = 0; i < P.length; i++) {
    const dd = Math.hypot(P[i].x - target.x, P[i].y - target.y);
    if (dd < bd) { bd = dd; bi = i; }
  }
  // TLS PRINCIPAL AXIS, ORIENTED BY THE CHORD — not the bare chord round 4
  // used, and the reason is a property of THIS target rather than of the method.
  // `_headmask-quarter-v3.json` is a Douglas-Peucker simplification (epsilon
  // 0.0016 disc units) of a crest-refined trace, and DP keeps the extreme points
  // and drops the ones in between, so consecutive vertices ZIGZAG at the
  // 1-unit scale: swept over all 308 vertices at arm 3 the mask's own turn
  // distribution is p5 3.3, median 51.3, p75 84.6, p95 145.8 degrees, and the
  // vertex spacing jumps from a mean of 0.906 to 2.3 units at the crown. A bare
  // chord between two individual vertices inherits all of that — the first
  // version of this file duly reported 121-178 degrees for a control taken on
  // the smooth crown.
  //
  // TLS over the whole arm averages the zigzag out. Round 4 rejected TLS
  // because an undirected axis flipped sign on its control; that is fixed here
  // by orienting the axis explicitly against the arm's own chord instead of
  // letting the eigenvector's sign decide.
  const dir = (from, step) => {
    const pts = [];
    for (let k = 0, i = from; k * spacing <= arm && k < P.length; k++, i = (i + step + P.length) % P.length) pts.push(P[i]);
    const n = pts.length, e = pts[n - 1], o = pts[0];
    let mx = 0, my = 0;
    for (const p of pts) { mx += p.x; my += p.y; }
    mx /= n; my /= n;
    let sxx = 0, syy = 0, sxy = 0;
    for (const p of pts) { const dx = p.x - mx, dy = p.y - my; sxx += dx * dx; syy += dy * dy; sxy += dx * dy; }
    const th = 0.5 * Math.atan2(2 * sxy, sxx - syy);
    let v = { x: Math.cos(th), y: Math.sin(th) };
    const ch = { x: e.x - o.x, y: e.y - o.y };
    if (v.x * ch.x + v.y * ch.y < 0) v = { x: -v.x, y: -v.y };
    let res = 0;
    for (const p of pts) res = Math.max(res, Math.abs((p.x - mx) * v.y - (p.y - my) * v.x));
    return { v, n, res };
  };
  const a = dir(bi, -1), b = dir(bi, 1);
  const interior = (Math.acos(Math.max(-1, Math.min(1, a.v.x * b.v.x + a.v.y * b.v.y))) * 180) / Math.PI;
  return { at: P[bi], dist: bd, nA: a.n, nB: b.n, resA: a.res, resB: b.res, turn: 180 - interior };
}

function report(label, pt, ourDeg) {
  console.log(`${label} — viewBox (${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})${ourDeg === null ? '' : `; our path turns ${ourDeg.toFixed(2)} deg`}`);
  console.log('   arm   nearest mask vertex        pts/side   chord residual   MASK turn');
  for (const arm of [2, 3, 4, 5, 6]) {
    const r = maskTurn(pt, arm);
    console.log(`   ${String(arm).padStart(3)}   (${r.at.x.toFixed(2)}, ${r.at.y.toFixed(2)}) d=${r.dist.toFixed(2)}`
      + `        ${String(r.nA).padStart(3)}/${String(r.nB).padStart(3)}   ${r.resA.toFixed(3)}/${r.resB.toFixed(3)}`
      + `        ${r.turn.toFixed(1)} deg`);
  }
  console.log('');
}

// which of our marks is the fitted silhouette? the largest filled region.
const plen = (Q) => { let L = 0; for (let i = 1; i < Q.length; i++) L += Math.hypot(Q[i].x - Q[i - 1].x, Q[i].y - Q[i - 1].y); return L; };
const sil = all.filter((m) => m.fill && m.fill !== 'none').sort((a, b) => plen(b.pts) - plen(a.pts))[0];

// THE MASK'S OWN NOISE FLOOR, printed before any knot is judged. Every reading
// below has to be compared against this, not against zero: a corner estimator
// that returns 60 degrees at a typical point on this outline cannot be used to
// call a 60-degree knot a corner.
console.log('## THE TARGET\'S OWN TURN DISTRIBUTION, all 308 mask vertices, same estimator');
console.log('   arm    p5    p25    med    p75    p95    max');
for (const arm of [2, 3, 4, 5, 6]) {
  const t = P.map((_, i) => maskTurn(P[i], arm).turn).sort((a, b) => a - b);
  const q = (f) => t[Math.min(t.length - 1, Math.floor(t.length * f))].toFixed(1).padStart(6);
  console.log(`   ${String(arm).padStart(3)} ${q(0.05)} ${q(0.25)} ${q(0.5)} ${q(0.75)} ${q(0.95)} ${q(1)}`);
}
console.log('');

console.log('## THE CONTROLS, first (spec 3 D12: render the control before reading the claim)');
// the long straight truncation cut, taken off the MASK itself: the two mask
// vertices furthest apart along the bottom edge, midpoint between them.
let lo = null, hi = null;
for (const p of P) { if (p.y > 50 + 47 * 0.60) { if (!lo || p.x < lo.x) lo = p; if (!hi || p.x > hi.x) hi = p; } }
report('CONTROL A: the middle of the bust truncation, a straight cut', { x: (lo.x + hi.x) / 2, y: (lo.y + hi.y) / 2 }, null);
// A SMOOTH STRETCH. The first choice here was the mask's RIGHTMOST vertex, on
// the reasoning that the occiput is a smooth bulge — and it returned 80.8 /
// 74.2 / 99.4 / 52.4 / 68.3 degrees over the five arm lengths, which is not a
// smooth control, it is a second corner. A single extremum in x is exactly
// where a chord estimator has no reason to be small: both arms leave in the
// same x direction. So the control is taken instead as the mask vertex nearest
// the TOP of the crown, where the outline is a long shallow arc, and it is
// reported at all five arm lengths like everything else.
let top = P[0]; for (const p of P) if (p.y < top.y) top = p;
let crown = P[0], cbest = Infinity;
for (const p of P) { const d2 = Math.hypot(p.x - (top.x + 4), p.y - top.y); if (d2 < cbest) { cbest = d2; crown = p; } }
report('CONTROL B: the crown, a long shallow arc on the mask', crown, null);

console.log('## THE KNOTS');
for (const o of over) {
  // IDENTITY, not string equality. `marks()` stores `tag: t.slice(0, 200)`, so
  // any path longer than 200 characters has a TRUNCATED tag and its `d` does not
  // parse out — two long paths then compare equal as two empty strings, and the
  // first version of this file duly labelled `plane` (8 knots) and HAIR (35) as
  // the same path. Object identity cannot do that.
  const onSil = o.m === sil;
  const dmin = Math.min(...P.map((p) => Math.hypot(p.x - o.at.x, p.y - o.at.y)));
  console.log(`### ${o.deg.toFixed(1)} deg, knot ${o.i} of ${o.knots}, ${onSil ? 'ON THE FITTED SILHOUETTE' : 'NOT on the silhouette path'}; nearest mask vertex ${dmin.toFixed(2)} units away`);
  if (dmin > 2.0) {
    console.log(`   ${dmin.toFixed(2)} units from the traced outline — this knot is an INTERIOR mark, not a contour.`);
    console.log('   Appendix P2: the 75 deg gate is for paths produced by FITTING a contour. Declared, not measured against the mask.\n');
    continue;
  }
  report('   corner on the target', o.at, o.deg);
}
