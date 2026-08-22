// SPECIALIST round, cent obverse — is `BEARD` knot 7 a corner, and can the D7
// tangent metric see a corner at all on a Catmull-Rom path?
//
// The brief asks one question: is the 85.0 deg tangent discontinuity at knot 7
// a corner the coin has, or an authoring accident. Answering it needs three
// things this file computes and one thing only a photograph can supply:
//
//  (1) PROVENANCE. `coloringbook/_pyout.json` is the frozen output of
//      `_pybuild.mjs`, the fitter. It carries `BEARDD` (the path as FITTED) and
//      `beardKnots`. Scoring the fitted path with the SAME metric `_jd7fitted`
//      uses says whether the kink was fitted or authored.
//  (2) EQUIVALENCE (PY6). The metric here is re-implemented, so it first
//      reproduces `_jd7fitted.mjs`'s published numbers for every fitted path
//      BIT-FOR-BIT. A second implementation that does not reproduce the first
//      is not a check, it is a second opinion.
//  (3) COMMENSURABILITY. Tangent discontinuity at a knot and the turn of the
//      DRAWN outline are different quantities (brief-common rule 1). A
//      Catmull-Rom join is C1 by construction, so its tangent discontinuity is
//      ~0 whatever the curve does between knots. The drawn-outline chord ladder
//      — the angle between the chord arriving over L local units and the chord
//      leaving over the same L, on the flattened curve — is the quantity that
//      is comparable between a fitted knot and a hand-edited one, and it is
//      what `_jc5corner.mjs` already uses on the mask.
//
// CONTROLS, run every time:
//   C1 synthetic right angle, sampled at the flattened curve's own spacing
//      (response test: must read ~90 at every L).
//   C2 synthetic straight run (null test: must read ~0 at every L).
//   C3 the smoothest knot on each scored path — whatever that reads is the
//      flattening noise, and a query is only a corner if it stands clear of it.
//   C4 the whole-path distribution (median/p90/max) of the same estimator.
//
// The ladder is printed, never one L: a single span is a locus chosen at
// measuring time (COIN-JUDGE 6.1).
//
// Run: node coloringbook/judge/_sb7tan.mjs
import { readFileSync } from 'node:fs';
import { flattenPath } from './_jqgeom.mjs';

const ROOT = new URL('../../', import.meta.url).pathname;
const { coinSVG } = await import(`${ROOT}src/art/coins.js`);

// ── the metric, transcribed from _jd7fitted.mjs so the two are comparable ──
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const ang = (a, b) => {
  const na = Math.hypot(...a), nb = Math.hypot(...b);
  if (na < 1e-9 || nb < 1e-9) return null;
  return (Math.acos(Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1]) / (na * nb)))) * 180) / Math.PI;
};
function segments(d) {
  const t = d.match(/[MmLlHhVvCcQqAaSsTtZz]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) || [];
  let i = 0, cur = [0, 0], start = [0, 0], cmd = '';
  const segs = []; const num = () => parseFloat(t[i++]);
  while (i < t.length) {
    if (/[A-Za-z]/.test(t[i])) cmd = t[i++];
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase(), off = rel ? cur : [0, 0];
    if (C === 'M') { const p = [num() + off[0], num() + off[1]]; cur = p; start = p; cmd = rel ? 'l' : 'L'; }
    else if (C === 'L') { const p = [num() + off[0], num() + off[1]]; segs.push({ k: 'L', p0: cur, p1: p }); cur = p; }
    else if (C === 'C') { const c1 = [num() + off[0], num() + off[1]], c2 = [num() + off[0], num() + off[1]], p = [num() + off[0], num() + off[1]]; segs.push({ k: 'C', p0: cur, c1, c2, p1: p }); cur = p; }
    else if (C === 'Z') { if (Math.hypot(cur[0] - start[0], cur[1] - start[1]) > 1e-9) segs.push({ k: 'L', p0: cur, p1: start }); cur = start; }
    else i++;
  }
  return { segs, closed: /[Zz]\s*$/.test(d.trim()) };
}
const tanOut = (s) => (s.k === 'C' ? sub(s.c1, s.p0) : sub(s.p1, s.p0));
const tanIn = (s) => (s.k === 'C' ? sub(s.p1, s.c2) : sub(s.p1, s.p0));
function perKnot(d) {
  const { segs, closed } = segments(d);
  const joins = [];
  for (let i = 1; i < segs.length; i++) joins.push([segs[i - 1], segs[i], i]);
  if (closed && segs.length > 1) joins.push([segs[segs.length - 1], segs[0], 0]);
  return joins.map(([a, b, idx]) => ({
    idx, at: a.p1,
    tan: ang(tanIn(a), tanOut(b)),
    chord: ang(sub(a.p1, a.p0), sub(b.p1, b.p0)),
  })).filter((r) => r.tan !== null);
}
const worst = (rows, f) => rows.reduce((m, r) => Math.max(m, f(r)), 0);

// ── the paths ─────────────────────────────────────────────────────────────
const svgP = coinSVG('penny', 380, { side: 'obverse' });
const dsP = [...svgP.matchAll(/<path\b[^>]*?\sd="([^"]*)"/g)].map((m) => m[1]);
const pick = (pre) => dsP.find((d) => d.startsWith(pre));
const SHIPPED = {
  'HEAD.Lincoln': pick('M -20.39 18'),
  'HAIR.Lincoln': pick('M 13.5 -27.05'),
  BEARD: pick('M 15.15 12.77'),
};
const PYOUT = JSON.parse(readFileSync(`${ROOT}coloringbook/_pyout.json`, 'utf8'));
const BUILT = { 'BEARD (as FITTED, _pyout.json)': PYOUT.BEARDD, 'HEAD.Lincoln (as FITTED)': PYOUT.HEADD, 'HAIR.Lincoln (as FITTED)': PYOUT.HAIRD };

// ── (2) EQUIVALENCE with the frozen instrument, before anything else ──────
console.log('EQUIVALENCE (PY6) — this file\'s metric vs _jd7fitted.mjs\'s published JSON, same tree:');
const PUB = {
  'HEAD.Lincoln': { chord: [69.1, 0], tangent: [0.7, 0], knots: 32 },
  'HAIR.Lincoln': { chord: [144.5, 2], tangent: [1, 0], knots: 27 },
  BEARD: { chord: [122.2, 3], tangent: [85, 1], knots: 14 },
};
let eqOK = true;
for (const [name, d] of Object.entries(SHIPPED)) {
  const rows = perKnot(d);
  const got = {
    chord: [+worst(rows, (r) => r.chord ?? 0).toFixed(1), rows.filter((r) => (r.chord ?? 0) > 75).length],
    tangent: [+worst(rows, (r) => r.tan).toFixed(1), rows.filter((r) => r.tan > 75).length],
    knots: rows.length,
  };
  const ok = JSON.stringify(got) === JSON.stringify(PUB[name]);
  eqOK &&= ok;
  console.log(`  ${name.padEnd(14)} ${JSON.stringify(got)}  vs published ${JSON.stringify(PUB[name])}  ${ok ? 'IDENTICAL' : '*** DIFFERS ***'}`);
}
console.log(`  => ${eqOK ? 'reproduced bit-for-bit; the numbers below are comparable to the published D7 run.' : 'NOT reproduced — nothing below may be believed.'}\n`);

// ── (1) PROVENANCE: fitted vs shipped, knot by knot ───────────────────────
console.log('PROVENANCE — every knot of BEARD, as FITTED (_pyout.json, frozen) and as SHIPPED:');
console.log('  idx |            fitted knot   tan   chord |           shipped knot   tan   chord | moved?');
const fb = perKnot(BUILT['BEARD (as FITTED, _pyout.json)']);
const sb = perKnot(SHIPPED.BEARD);
const fmt = (r) => r ? `(${r.at[0].toFixed(2)}, ${r.at[1].toFixed(2)})`.padStart(20) + `${r.tan.toFixed(1).padStart(6)}${(r.chord ?? 0).toFixed(1).padStart(8)}` : ' '.repeat(34);
for (let i = 0; i < Math.max(fb.length, sb.length); i++) {
  const a = fb.find((r) => r.idx === i), b = sb.find((r) => r.idx === i);
  const moved = a && b ? (Math.hypot(a.at[0] - b.at[0], a.at[1] - b.at[1]) > 1e-9 ? `MOVED ${Math.hypot(a.at[0] - b.at[0], a.at[1] - b.at[1]).toFixed(2)}u` : 'same') : 'n/a';
  console.log(`  ${String(i).padStart(3)} |${fmt(a)} |${fmt(b)} | ${moved}`);
}
console.log('\nWorst per path, both measures:');
for (const [name, d] of [...Object.entries(BUILT), ...Object.entries(SHIPPED)]) {
  const rows = perKnot(d);
  console.log(`  ${name.padEnd(34)} knots ${String(rows.length).padStart(3)}  tangent worst ${worst(rows, (r) => r.tan).toFixed(1).padStart(6)} (${rows.filter((r) => r.tan > 75).length} over 75)  chord worst ${worst(rows, (r) => r.chord ?? 0).toFixed(1).padStart(6)} (${rows.filter((r) => (r.chord ?? 0) > 75).length} over 75)`);
}

// ── (2b) IS THE TANGENT MEASURE READING AUTHORSHIP? ───────────────────────
// Every fitted path in this project comes out of `crToBezier`, which is C1 by
// construction, so a knot that has not been touched since the fit CANNOT carry
// a tangent discontinuity. If that is right, D7-on-tangent flags hand-edited
// knots and nothing else. The check is mechanical: compare each shipped path
// against its own fitter output. `_qtout.json` is included because the quarter
// OBVERSE is not a face any concurrent round owns, and it is a second coin.
{
  const key = (x) => x.replace(/\s+/g, '');
  const QT = JSON.parse(readFileSync(`${ROOT}coloringbook/_qtout.json`, 'utf8'));
  const dsOf = (id) => [...coinSVG(id, 380, { side: 'obverse' }).matchAll(/<path\b[^>]*?\sd="([^"]*)"/g)].map((m) => m[1]);
  const qd = dsOf('quarter'), cd = dsOf('penny');
  const CASES = [
    ['quarter HEAD.Washington', QT.HEADD, qd], ['quarter HAIR.Washington', QT.HAIRD, qd],
    ['cent    HEAD.Lincoln', PYOUT.HEADD, cd], ['cent    HAIR.Lincoln', PYOUT.HAIRD, cd],
    ['cent    BEARD', PYOUT.BEARDD, cd],
  ];
  console.log('\nAUTHORSHIP vs the tangent measure — shipped path against its own fitter output:');
  console.log('  path                       still equals the fit? | tangent worst | chord worst');
  for (const [name, fit, ds] of CASES) {
    const hit = ds.find((x) => key(x) === key(fit));
    const scored = ds.find((x) => x.slice(0, 12) === fit.slice(0, 12)) || hit;
    const rows = perKnot(scored);
    console.log(`  ${name.padEnd(26)} ${(hit ? 'YES' : 'NO — hand-edited').padEnd(21)}|${worst(rows, (r) => r.tan).toFixed(1).padStart(14)} |${worst(rows, (r) => r.chord ?? 0).toFixed(1).padStart(12)}`);
  }
  console.log('  (a chord corner up to 144.5 reads tangent <= 1.2 while the path still equals its fit.)');
}

// ── (3) the DRAWN-OUTLINE chord ladder ────────────────────────────────────
const SPANS = [0.5, 1, 2, 3, 4, 6, 8];
function ladderOn(pts, q) {
  const N = pts.length;
  const at = (i) => pts[((i % N) + N) % N];
  const seglen = (i) => Math.hypot(at(i + 1).x - at(i).x, at(i + 1).y - at(i).y);
  let bi = 0, bd = 1e9;
  for (let i = 0; i < N; i++) { const dd = Math.hypot(at(i).x - q[0], at(i).y - q[1]); if (dd < bd) { bd = dd; bi = i; } }
  const walk = (i, span, dir) => { let d = 0, k = i; while (d < span) { const s = dir > 0 ? seglen(k) : seglen(k - 1); d += s; k += dir; if (Math.abs(k - i) > N) break; } return at(k); };
  const one = (span) => {
    const a = walk(bi, span, -1), b = at(bi), c = walk(bi, span, +1);
    let t = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(b.y - a.y, b.x - a.x);
    while (t > Math.PI) t -= 2 * Math.PI; while (t < -Math.PI) t += 2 * Math.PI;
    return Math.abs(t * 180 / Math.PI);
  };
  return { d: bd, i: bi, angles: SPANS.map(one) };
}
const flat = (d) => flattenPath(d, 96).pts;
const row = (label, angles) => console.log(`  ${label.padEnd(46)}` + angles.map((a) => a.toFixed(1).padStart(7)).join(''));

console.log(`\nDRAWN-OUTLINE CHORD LADDER  (turn angle of the flattened curve; 0 = straight, 180 = doubles back)`);
console.log(`  ${' '.repeat(46)}` + SPANS.map((s) => String(s).padStart(7)).join('') + '   <- chord span, local units');

// C1 / C2 synthetic controls at the flattened curve's own spacing
{
  const step = 0.05;
  const mk = (fn, n) => { const P = []; for (let k = 0; k < n; k++) P.push(fn(k * step)); return P; };
  const corner = mk((t) => (t < 30 ? { x: t - 30, y: 0 } : { x: 0, y: t - 30 }), Math.ceil(60 / step));
  const line = mk((t) => ({ x: t - 30, y: 0 }), Math.ceil(60 / step));
  const openLadder = (P, q) => {
    const i = P.reduce((b, p, k) => (Math.hypot(p.x - q[0], p.y - q[1]) < Math.hypot(P[b].x - q[0], P[b].y - q[1]) ? k : b), 0);
    const w = (dir, span) => { let d = 0, k = i; while (d < span && k > 0 && k < P.length - 1) { const j = dir > 0 ? k : k - 1; d += Math.hypot(P[j + 1].x - P[j].x, P[j + 1].y - P[j].y); k += dir; } return P[k]; };
    return SPANS.map((span) => {
      const a = w(-1, span), b = P[i], c = w(+1, span);
      let t = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(b.y - a.y, b.x - a.x);
      while (t > Math.PI) t -= 2 * Math.PI; while (t < -Math.PI) t += 2 * Math.PI;
      return Math.abs(t * 180 / Math.PI);
    });
  };
  row('C1 RESPONSE  synthetic right angle (want 90)', openLadder(corner, [0, 0]));
  row('C2 NULL      synthetic straight run (want 0)', openLadder(line, [0, 0]));
}

// C3 / C4: each path's own noise floor, then the queries
const QUERIES = [
  ['BEARD  shipped  knot 7 rear tip (-18.85, 4.00)', SHIPPED.BEARD, [-18.85, 4.0]],
  ['BEARD  FITTED   knot 7 rear tip (-17.28, 8.63)', BUILT['BEARD (as FITTED, _pyout.json)'], [-17.28, 8.63]],
  ['BEARD  shipped  knot 10 sideburn (-7.60,-1.00)', SHIPPED.BEARD, [-7.6, -1.0]],
  ['HAIR.Lincoln    knot 16 cusp   (-19.03,11.99)', SHIPPED['HAIR.Lincoln'], [-19.03, 11.99]],
];
console.log('');
for (const [name, d] of Object.entries(SHIPPED)) {
  const pts = flat(d), rows = perKnot(d);
  const cands = rows.map((r) => ({ r, L: ladderOn(pts, r.at) }));
  const smooth = cands.reduce((b, c) => (c.L.angles[3] < b.L.angles[3] ? c : b));
  row(`C3 FLOOR ${name} smoothest knot ${smooth.r.idx}`, smooth.L.angles);
}
{
  const pts = flat(SHIPPED.BEARD), N = pts.length;
  const all = [];
  for (let i = 0; i < N; i += 2) all.push(ladderOn(pts, [pts[i].x, pts[i].y]).angles);
  for (const q of ['median', 'p90', 'max']) {
    row(`C4 FLOOR BEARD whole-outline ${q}`, SPANS.map((_, j) => {
      const a = all.map((x) => x[j]).sort((x, y) => x - y);
      return q === 'max' ? a[a.length - 1] : a[Math.floor(a.length * (q === 'median' ? 0.5 : 0.9))];
    }));
  }
}
console.log('');
for (const [name, d, q] of QUERIES) {
  const L = ladderOn(flat(d), q);
  row(`QUERY ${name} d${L.d.toFixed(3)}`, L.angles);
}
console.log('\n(turn angle; INCLUDED angle at the tip = 180 - turn.)');

// ── COVERAGE: is the rear tip inside the HAIR mass, and by how much? ──────
// v1.62.0 recorded "the tip is now (-18.85, 4.00), 0.345 units INSIDE the hair"
// and the round is not allowed to quote that — it re-derives it. The beard
// group is emitted AFTER the hair group, so "inside" does not mean hidden: it
// means the two masses OVERLAP there instead of leaving a wedge of cheek
// between them, which is the defect that move was made to close.
const inside = (P, q) => {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++)
    if ((P[i].y > q[1]) !== (P[j].y > q[1]) && q[0] < ((P[j].x - P[i].x) * (q[1] - P[i].y)) / (P[j].y - P[i].y) + P[i].x) c = !c;
  return c;
};
const distTo = (P, q) => {
  let best = 1e9;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const dx = P[i].x - P[j].x, dy = P[i].y - P[j].y, L2 = dx * dx + dy * dy;
    let t = L2 ? ((q[0] - P[j].x) * dx + (q[1] - P[j].y) * dy) / L2 : 0;
    t = Math.max(0, Math.min(1, t));
    best = Math.min(best, Math.hypot(q[0] - (P[j].x + t * dx), q[1] - (P[j].y + t * dy)));
  }
  return best;
};
const hairPts = flat(SHIPPED['HAIR.Lincoln']);
console.log('\nCOVERAGE — where the rear tip sits relative to the HAIR mass it tucks under:');
for (const [name, q] of [['shipped tip (-18.85, 4.00)', [-18.85, 4.0]], ['fitted  tip (-17.28, 8.63)', [-17.28, 8.63]]]) {
  const io = inside(hairPts, q);
  console.log(`  ${name}  ${io ? 'INSIDE ' : 'OUTSIDE'} the HAIR outline by ${distTo(hairPts, q).toFixed(3)} local units`);
}
// how much of the beard outline within 6 units of the tip is covered by hair
{
  const pts = flat(SHIPPED.BEARD);
  const near = pts.filter((p) => Math.hypot(p.x + 18.85, p.y - 4) <= 6);
  const cov = near.filter((p) => inside(hairPts, [p.x, p.y])).length;
  console.log(`  of the beard outline within 6 local units of the tip, ${cov}/${near.length} sampled points lie inside HAIR`);
}
// device scale, so the ladder's spans can be read in the pixels the app draws
const { coinPx } = await import(`${ROOT}src/art/pawcoins.js`);
console.log('\nSCALE — 1 local unit in the pixels the app actually draws (bust scale s = 0.78):');
for (const s of [38, 48, 54, 84]) {
  const w = coinPx('penny', s).w;
  console.log(`  coinRow size ${String(s).padStart(3)} -> penny box ${String(w).padStart(5)} css px; 1 local unit = ${(0.78 * w / 100).toFixed(3)} css px; the 0.5-unit rung = ${(0.39 * w / 100).toFixed(3)} css px`);
}
