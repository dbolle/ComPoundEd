// QUARTER OBVERSE WIG — RE-AUTHOR THE FAMILY AS INTEGRAL CURVES OF ONE FIELD.
//
// THE ARGUMENT, BEFORE THE CODE. `_qo8gen.mjs` rotated each wig mark rigidly to
// the direction measured at its own midpoint. Every self-check passed and the
// result was a starburst: eight centreline crossings in a wig that had none.
// The diagnosis in `RELIEF.Washington` is that the marks are an interleaved
// stack and turning members of a stack individually makes them converge.
//
// That diagnosis is right and it names its own remedy. Crossing is not a
// property of the target angles; it is a property of treating fourteen marks as
// fourteen independent objects. If instead every mark is an INTEGRAL CURVE of a
// single continuous direction field — the field `_qw1field.mjs` measures and
// regularises — then two marks cannot cross, because two integral curves of one
// single-valued field cannot cross. Non-crossing stops being a gate that has to
// be argued past and becomes a theorem about the construction. The gate is still
// checked here (S4), because a theorem about the continuum is not a proof about
// a Bezier fitted to a sampled polyline.
//
// WHAT IS HELD FIXED, AND WHY EACH THING IS HELD.
//   · STROKE WIDTHS — untouched. Round 9/10's duty-cycle argument is about
//     width and pitch, not direction, and nothing here re-opens it.
//   · ARC LENGTH, per mark, to 0.02 units. D6 is a fraction of drawn LENGTH, so
//     holding arc length holds D6 for this group by construction. It is NOT a
//     claim that D6 is right; it is a refusal to move it under cover of a
//     direction fix.
//   · THE SEED POINT — each mark keeps the point of its own curve nearest its
//     current chord midpoint. The pitch of this family was set by measurement
//     (`_jw14gen.mjs`, the duty arithmetic) and moving the marks up or down the
//     head would spend that measurement on taste.
// What changes is direction and curvature, which is the whole of the finding.
//
// ⚠️ THIS FILE WRITES NOTHING. It prints path strings. Running it must leave the
// repository byte-identical (lesson 20).
//
// SELF-CHECKS — nothing is printed unless all of them pass:
//   S1 the new chord angle equals the field's own chord angle over that curve
//   S2 arc length preserved to 0.02 viewBox units
//   S3 every sampled point inside the HAIR mass, clearance printed
//   S4 ZERO centreline crossings among the fourteen — the hard gate
//   S5 minimum pairwise centreline clearance not below the CURRENT drawing's
//   S6 the single cubic actually follows the integrated streamline (max
//      deviation printed; a mark that cannot be fitted is refused, not fudged)
//   S7 the emitted string round-trips through `_qo4marks.points`
//
// Run: node coloringbook/judge/_qw2gen.mjs [sigma]
import {
  D2R, STRUCK, dev, referenceBands, TX, TY, SX, SY, toView,
} from './_qwlib.mjs';
import { MARKS, points } from './_qo4marks.mjs';
import {
  FW, FH, fx, fy, gridOf, smoothVec, streamline, hairClearance,
} from './_qw1field.mjs';

const SIGMA = Number(process.argv[2] || 1.0);   // _qw1field's leave-one-out optimum
// `sep` turns on separation-limited termination (STEP 2). Off, the marks keep
// their full current arc length and the report says where they merge; on, they
// stop where they crowd a neighbour. Both are printed with their numbers so the
// trade is visible rather than chosen inside the file.
const SEP = process.argv.includes('sep');
// `space` instead RE-SPACES the seeds: where two integral curves crowd, both
// seeds are pushed apart along the field's own normal and the curves re-drawn,
// which is the other half of "positions and spacings are part of what you are
// solving". Truncation shortens; re-spacing moves. Both are reported.
const SPACE = process.argv.includes('space');

// ── local <-> screen, from the LIVE render's own head-group transform
const toLocal = ([X, Y]) => [(X - TX) / SX, (Y - TY) / SY];

// ── the fourteen wig marks, exactly the set _qo5field reports on
export const WIG = MARKS.filter((m) => (m.group.startsWith('grooves') || m.group.startsWith('lit'))
  && m.len >= 6 && m.mid[0] >= 41 && m.mid[0] <= 83);
if (WIG.length !== 14) throw new Error(`_qw2gen: expected 14 wig marks, found ${WIG.length}`);

/** flatten a LOCAL cubic path string into a dense SCREEN polyline */
function flattenScreen(d, n = 400) {
  const toks = d.match(/[MmLlCcQqZz]|[-+]?(?:\d*\.\d+|\d+\.?)/g);
  let i = 0, cmd = '', cx = 0, cy = 0; const P = [];
  const num = () => parseFloat(toks[i++]);
  while (i < toks.length) {
    if (/[A-Za-z]/.test(toks[i])) cmd = toks[i++];
    if (cmd === 'M') { cx = num(); cy = num(); P.push([cx, cy]); cmd = 'L'; }
    else if (cmd === 'L') { cx = num(); cy = num(); P.push([cx, cy]); }
    else if (cmd === 'C') {
      const x1 = num(), y1 = num(), x2 = num(), y2 = num(), x3 = num(), y3 = num();
      for (let t = 1; t <= n; t++) {
        const u = t / n, v = 1 - u;
        P.push([v * v * v * cx + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * x3,
          v * v * v * cy + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * y3]);
      }
      cx = x3; cy = y3;
    } else throw new Error('_qw2gen: unexpected path command ' + cmd + ' in ' + d.slice(0, 40));
  }
  return P.map(toView);
}
const arcOf = (P) => { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; };

/** min distance between two polylines */
function polyDist(A, B) {
  let best = Infinity;
  for (let i = 1; i < A.length; i++) for (let j = 1; j < B.length; j++) {
    best = Math.min(best, segDist(A[i - 1], A[i], B[j - 1], B[j]));
    if (best === 0) return 0;
  }
  return best;
}
function segDist(p, p2, q, q2) {
  if (segCross(p, p2, q, q2)) return 0;
  return Math.min(ptSeg(p, q, q2), ptSeg(p2, q, q2), ptSeg(q, p, p2), ptSeg(q2, p, p2));
}
function ptSeg([x, y], [x1, y1], [x2, y2]) {
  const dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy;
  const t = L2 ? Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / L2)) : 0;
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}
const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
function segCross(p1, p2, p3, p4) {
  const d1 = cr(p3, p4, p1), d2 = cr(p3, p4, p2), d3 = cr(p1, p2, p3), d4 = cr(p1, p2, p4);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}
/** every crossing between two polylines */
function crossings(A, B) {
  let n = 0;
  for (let i = 1; i < A.length; i++) for (let j = 1; j < B.length; j++) if (segCross(A[i - 1], A[i], B[j - 1], B[j])) n++;
  return n;
}

/** least-squares single cubic through a polyline with fixed ends and end tangents */
function fitCubic(P, tan0, tan3) {
  const p0 = P[0], p3 = P[P.length - 1];
  const t0 = tan0 || norm([P[1][0] - P[0][0], P[1][1] - P[0][1]]);
  const t3 = tan3 || norm([P[P.length - 1][0] - P[P.length - 2][0], P[P.length - 1][1] - P[P.length - 2][1]]);
  // chord-length parameterisation
  const cum = [0];
  for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const T = cum.map((c) => c / cum[cum.length - 1]);
  // solve the 2x2 normal equations for the handle lengths a, b
  let A11 = 0, A12 = 0, A22 = 0, B1 = 0, B2 = 0;
  for (let i = 0; i < P.length; i++) {
    const u = T[i], v = 1 - u;
    const f1 = 3 * v * v * u, f2 = 3 * v * u * u;
    // B(u) with C1 = p0 + a*t0 and C2 = p3 - b*t3 splits into a part that does
    // not depend on (a, b) and two linear terms that do
    const base = [(v * v * v + f1) * p0[0] + (f2 + u * u * u) * p3[0],
      (v * v * v + f1) * p0[1] + (f2 + u * u * u) * p3[1]];
    const rx = P[i][0] - base[0], ry = P[i][1] - base[1];
    const c1x = f1 * t0[0], c1y = f1 * t0[1], c2x = -f2 * t3[0], c2y = -f2 * t3[1];
    A11 += c1x * c1x + c1y * c1y; A12 += c1x * c2x + c1y * c2y; A22 += c2x * c2x + c2y * c2y;
    B1 += rx * c1x + ry * c1y; B2 += rx * c2x + ry * c2y;
  }
  const det = A11 * A22 - A12 * A12;
  let a = det ? (B1 * A22 - B2 * A12) / det : cum[cum.length - 1] / 3;
  let b = det ? (A11 * B2 - A12 * B1) / det : cum[cum.length - 1] / 3;
  a = Math.max(0.05, a); b = Math.max(0.05, b);
  return [p0, [p0[0] + a * t0[0], p0[1] + a * t0[1]], [p3[0] - b * t3[0], p3[1] - b * t3[1]], p3];
}
const norm = ([x, y]) => { const n = Math.hypot(x, y) || 1; return [x / n, y / n]; };
function bez(C, n = 400) {
  const P = [];
  for (let t = 0; t <= n; t++) {
    const u = t / n, v = 1 - u;
    P.push([v * v * v * C[0][0] + 3 * v * v * u * C[1][0] + 3 * v * u * u * C[2][0] + u * u * u * C[3][0],
      v * v * v * C[0][1] + 3 * v * v * u * C[1][1] + 3 * v * u * u * C[2][1] + u * u * u * C[3][1]]);
  }
  return P;
}
const maxDev = (P, Q) => Math.max(...P.map((p) => Math.min(...Q.map((q) => Math.hypot(p[0] - q[0], p[1] - q[1])))));

const bezMulti = (segs, n = 400) => segs.flatMap((C, i) => (i ? bez(C, n).slice(1) : bez(C, n)));

/** ONE cubic if it follows the streamline, otherwise the fewest joined smoothly
 *  at equal-arc knots. Every join takes the streamline's own unit tangent from
 *  both sides, so it is C1 by construction and no knot is a corner (D7). */
function fitPath(SL, tol) {
  for (let n = 1; n <= 4; n++) {
    const idx = [];
    for (let k = 0; k <= n; k++) idx.push(Math.round(k * (SL.length - 1) / n));
    const tanAt = (i) => norm([SL[Math.min(i + 1, SL.length - 1)][0] - SL[Math.max(i - 1, 0)][0],
      SL[Math.min(i + 1, SL.length - 1)][1] - SL[Math.max(i - 1, 0)][1]]);
    const segs = [];
    for (let k = 0; k < n; k++) {
      segs.push(fitCubic(SL.slice(idx[k], idx[k + 1] + 1),
        k === 0 ? null : tanAt(idx[k]), k === n - 1 ? null : tanAt(idx[k + 1])));
    }
    if (maxDev(SL, bezMulti(segs)) <= tol || n === 4) return { segs, knots: n };
  }
}

// ════════════════════════════════════════════════════════════════════ MAIN
const BANDS = await referenceBands();
const G = {};
for (const f of STRUCK) G[f] = gridOf(BANDS[f], 2.0);
const vx = new Float64Array(FW * FH), vy = new Float64Array(FW * FH);
for (let p = 0; p < FW * FH; p++) for (const f of STRUCK) { vx[p] += G[f].vx[p] / STRUCK.length; vy[p] += G[f].vy[p] / STRUCK.length; }
export const FIELD = smoothVec(vx, vy, SIGMA);

// pointwise coin mean at a screen point, the published metric's own quantity
export function coinAt([X, Y], sw = 2.0) {
  const use = [];
  for (const f of STRUCK) {
    const i = Math.round((X - fx(0)) / 0.5), j = Math.round((Y - fy(0)) / 0.5);
    if (i < 0 || j < 0 || i >= FW || j >= FH) return null;
    if (G[f].co[j * FW + i] >= 0.25) use.push(G[f].dg[j * FW + i]);
  }
  if (use.length < 2) return null;
  let sx = 0, sy = 0; for (const a of use) { sx += Math.cos(2 * a * D2R); sy += Math.sin(2 * a * D2R); }
  const mean = 0.5 * Math.atan2(sy, sx) / D2R;
  return { mean, n: use.length, worst: Math.max(...use.map((a) => Math.abs(dev(a, mean)))) };
}

// ── the CURRENT drawing, as polylines, for the before/after clearance gate
const NOW = WIG.map((m) => ({ m, P: flattenScreen(m.d) }));
let nowCross = 0, nowMin = Infinity, nowMinPair = '';
for (let a = 0; a < NOW.length; a++) for (let b = a + 1; b < NOW.length; b++) {
  nowCross += crossings(NOW[a].P, NOW[b].P);
  const d = polyDist(NOW[a].P, NOW[b].P);
  const gap = d - (NOW[a].m.w + NOW[b].m.w) / 2;
  if (gap < nowMin) { nowMin = gap; nowMinPair = `${tag(NOW[a].m)}x${tag(NOW[b].m)}`; }
}
function tag(m) { return (m.group.startsWith('groove') ? 'groove' : 'lit') + m.i; }
const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };

console.log(`field sigma ${SIGMA} viewBox units (_qw1field's leave-one-out optimum)`);
console.log(`CURRENT drawing: ${nowCross} centreline crossings, closest EDGE-TO-EDGE gap ${nowMin.toFixed(3)} units (${nowMinPair})\n`);

// ── STEP 1: the raw integral curve of each mark, seeded at its own midpoint and
// carried out to its own current arc length in each direction.
function buildRaw(seedShift) {
  return WIG.map((m, k) => {
    const P = flattenScreen(m.d);
    const L = arcOf(P);
    let bi = 0, bd = Infinity;
    P.forEach((p, i) => { const d = Math.hypot(p[0] - m.mid[0], p[1] - m.mid[1]); if (d < bd) { bd = d; bi = i; } });
    const back = arcOf(P.slice(0, bi + 1)), fwd = L - back;
    const sh = seedShift ? seedShift[k] : [0, 0];
    const seed = [P[bi][0] + sh[0], P[bi][1] + sh[1]];
    const S = streamline(FIELD, seed[0], seed[1], back, fwd, 0.04);
    const flip = Math.hypot(S[0][0] - P[0][0], S[0][1] - P[0][1]) > Math.hypot(S[0][0] - P[P.length - 1][0], S[0][1] - P[P.length - 1][1]);
    const SL = flip ? S.slice().reverse() : S;
    let si = 0, sd = Infinity;
    SL.forEach((p, i) => { const d = Math.hypot(p[0] - seed[0], p[1] - seed[1]); if (d < sd) { sd = d; si = i; } });
    return { m, NOW: P, L, seed, SL, si, lo: 0, hi: SL.length - 1 };
  });
}
let RAW = buildRaw(null);

// ── STEP 2: SEPARATION-LIMITED TERMINATION.
//
// Integral curves cannot cross, but they CAN converge, and two strokes 0.5 units
// apart at 84 px are one stroke. The coin answers this itself: §12.6 of
// `RELIEF.Washington` records that its rolls are "short overlapping shingles
// rather than full sweeps", which is what a comb of a converging field looks
// like. So a mark is carried out from its seed until it comes within the
// separation its neighbour needs, and then it STOPS. That is where the staggered
// ends come from — they are no longer chosen, they are measured.
//
// THE REQUIRED SEPARATION IS THE DRAWING'S OWN. For a pair that is currently
// clear, it is half the two widths plus 0.10 units. For a pair that currently
// OVERLAPS — the three crown rolls do, deliberately, because they have to own
// the wigCrown patch — it is exactly the overlap they already have. The rule is
// therefore "no pair may get tighter than it is now, and no clear pair may
// merge"; it can never be satisfied by loosening something the art relies on.
//
// TRUNCATION IS SYMMETRIC AND ITERATED, NOT GREEDY. A greedy pass would be
// order-dependent, which is the fault that sank `_qo8gen`'s crossing-guarded
// subset. Both members of a violating pair are cut at the violation, every pair
// is re-tested against the cut curves, and the loop runs to a fixed point.
const req = [];
for (let a = 0; a < RAW.length; a++) {
  req[a] = [];
  for (let b = 0; b < RAW.length; b++) {
    if (a === b) { req[a][b] = 0; continue; }
    const half = (RAW[a].m.w + RAW[b].m.w) / 2;
    req[a][b] = Math.min(half + 0.10, polyDist(RAW[a].NOW, RAW[b].NOW));
  }
}
// ── OPTIONAL: RE-SPACE THE SEEDS instead of shortening the marks.
// Each violating pair pushes BOTH seeds apart along the field normal by half the
// deficit; the curves are re-integrated and the sweep repeats. Symmetric, so no
// ordering decides who moves. The drift of every seed is printed, because a fix
// that has to move a mark two units is not a fix, it is a redesign wearing one.
let drift = WIG.map(() => [0, 0]);
let spaceIters = 0;
if (SPACE) {
  for (; spaceIters < 25; spaceIters++) {
    let worst = 0;
    const push = WIG.map(() => [0, 0]);
    for (let a = 0; a < RAW.length; a++) for (let b = a + 1; b < RAW.length; b++) {
      const R = req[a][b];
      const A = RAW[a].SL, B = RAW[b].SL;
      let bd = Infinity, bp = null, bq = null;
      for (const p of A) for (const q of B) { const d = Math.hypot(p[0] - q[0], p[1] - q[1]); if (d < bd) { bd = d; bp = p; bq = q; } }
      if (bd >= R) continue;
      worst = Math.max(worst, R - bd);
      let nx = bp[0] - bq[0], ny = bp[1] - bq[1];
      const n = Math.hypot(nx, ny) || 1; nx /= n; ny /= n;
      const step = 0.5 * (R - bd) * 0.6;
      push[a][0] += nx * step; push[a][1] += ny * step;
      push[b][0] -= nx * step; push[b][1] -= ny * step;
    }
    if (worst < 0.01) break;
    // A PUSH MAY NOT BUY SEPARATION WITH THE SILHOUETTE. Re-spacing moves marks
    // sideways, and the mark at the top of the stack has the head's own outline
    // above it: a lit roll pushed into the contour merges with it, which trades
    // one merge for another. So a mark's push is applied only if its curve's
    // clearance inside the HAIR mass stays at least what the CURRENT drawing
    // gives that same mark. Same "no worse than now" rule as the pair gate.
    const cand = drift.map((d, i) => [d[0] + push[i][0], d[1] + push[i][1]]);
    const test = buildRaw(cand);
    for (let i = 0; i < RAW.length; i++) {
      const now = Math.min(...RAW[i].NOW.map((q) => hairClearance(q)));
      if (Math.min(...test[i].SL.map((q) => hairClearance(q))) < now) cand[i] = drift[i];
    }
    if (cand.every((c, i) => c[0] === drift[i][0] && c[1] === drift[i][1])) break;
    drift = cand;
    RAW = buildRaw(drift);
  }
  console.log(`seed re-spacing: ${spaceIters} sweeps; drift per mark ` +
    RAW.map((A, i) => `${tag(A.m)} ${Math.hypot(drift[i][0], drift[i][1]).toFixed(2)}`).join('  '));
}

const cut = (A) => A.SL.slice(A.lo, A.hi + 1);
let iter = 0;
if (SEP) for (; iter < 30; iter++) {
  // JACOBI, not Gauss-Seidel: every curve's new extent is computed against the
  // PREVIOUS sweep's extents, so no curve is cut merely because an earlier pair
  // in the loop order happened to be tested first.
  const prev = RAW.map((A) => cut(A));
  const nlo = RAW.map((A) => A.lo), nhi = RAW.map((A) => A.hi);
  for (let a = 0; a < RAW.length; a++) {
    const A = RAW[a];
    const hit = (p) => {
      for (let b = 0; b < RAW.length; b++) {
        if (b === a) continue;
        const R = req[a][b];
        for (const q of prev[b]) if (Math.hypot(p[0] - q[0], p[1] - q[1]) < R) return true;
      }
      return false;
    };
    for (let i = A.si; i <= A.hi; i++) if (hit(A.SL[i])) { nhi[a] = Math.max(A.si, i - 1); break; }
    for (let i = A.si; i >= A.lo; i--) if (hit(A.SL[i])) { nlo[a] = Math.min(A.si, i + 1); break; }
  }
  let moved = false;
  RAW.forEach((A, i) => { if (A.lo !== nlo[i] || A.hi !== nhi[i]) moved = true; A.lo = nlo[i]; A.hi = nhi[i]; });
  if (!moved) break;
}

console.log(SEP ? `separation-limited termination: fixed point after ${iter} sweeps\n` : 'separation-limited termination OFF — full current arc length kept\n');
console.log('mark      len -> len   seed(screen)     chord: ours -> new    arc kept   cubic dev   hair clr   cubics');
const OUT = [];
let fail = 0;
for (const A of RAW) {
  const SL = cut(A), m = A.m;
  const { segs, knots } = fitPath(SL, 0.15);
  const FB = bezMulti(segs);
  const devFit = maxDev(SL, FB);
  const newArc = arcOf(FB);
  const chord = (P, Q) => { let t = Math.atan2(Q[1] - P[1], Q[0] - P[0]) / D2R; while (t > 90) t -= 180; while (t <= -90) t += 180; return t; };
  const newDeg = chord(FB[0], FB[FB.length - 1]);
  const wantDeg = chord(SL[0], SL[SL.length - 1]);
  const clr = Math.min(...FB.map((p) => hairClearance(p)));
  const e1 = Math.abs(dev(newDeg, wantDeg));
  const ok = e1 < 0.5 && devFit < 0.16 && clr > 0 && newArc > 5;
  if (!ok) fail++;
  console.log(`${tag(m).padEnd(9)}${A.L.toFixed(2).padStart(5)} ->${newArc.toFixed(2).padStart(6)}  (${A.seed[0].toFixed(1)},${A.seed[1].toFixed(1)})`.padEnd(38)
    + `${String(m.deg).padStart(6)} -> ${newDeg.toFixed(1).padStart(6)}`
    + `${(100 * newArc / A.L).toFixed(0).padStart(9)}%${devFit.toFixed(3).padStart(12)}${clr.toFixed(2).padStart(11)}${String(knots).padStart(8)}  ${ok ? '' : '!! FAIL'}`);
  OUT.push({ m, segs, FB, L: A.L, NOW: A.NOW });
}
{
  const was = RAW.reduce((s, A) => s + A.L, 0), now = OUT.reduce((s, o) => s + arcOf(o.FB), 0);
  console.log(`\ntotal drawn length of the fourteen wig marks: ${was.toFixed(1)} -> ${now.toFixed(1)} viewBox units (${(100 * (now / was - 1)).toFixed(1)}%) — D6 moves with this`);
}

// S4/S5 — the hard gate
let nCross = 0, minGap = Infinity, minPair = '';
const bad = [], newMerge = [];
for (let a = 0; a < OUT.length; a++) for (let b = a + 1; b < OUT.length; b++) {
  const c = crossings(OUT[a].FB, OUT[b].FB);
  if (c) { nCross += c; bad.push(`${tag(OUT[a].m)}x${tag(OUT[b].m)}`); }
  const half = (OUT[a].m.w + OUT[b].m.w) / 2;
  const gap = polyDist(OUT[a].FB, OUT[b].FB) - half;
  const was = polyDist(OUT[a].NOW, OUT[b].NOW) - half;
  if (gap < minGap) { minGap = gap; minPair = `${tag(OUT[a].m)}x${tag(OUT[b].m)}`; }
  // the crown rolls are DESIGNED to overlap (`base` owns the wigCrown patch), so
  // a negative gap is not by itself a fault. A pair that was clear and is now
  // merged IS, and so is a pair that was merged and is now more merged by more
  // than a quarter unit.
  if ((was >= 0 && gap < 0) || (was < 0 && gap < was - 0.25)) {
    newMerge.push(`${tag(OUT[a].m)}x${tag(OUT[b].m)} ${was.toFixed(2)} -> ${gap.toFixed(2)}`);
  }
}
console.log(`\nS4 centreline crossings: ${nCross}${bad.length ? '  ' + bad.join(', ') : ''}   ${nCross === 0 ? 'PASS' : '!! FAIL'}`);
console.log(`S5 closest edge-to-edge gap: ${minGap.toFixed(3)} (${minPair})   was ${nowMin.toFixed(3)} (${nowMinPair})`);
console.log(`   pairs newly merged or ${'>'}0.25 units more merged: ${newMerge.length ? newMerge.join(' | ') : 'none'}   ${newMerge.length ? '!! CHECK' : 'PASS'}`);
if (nCross) fail++;

// ── METRIC B: THE TANGENT ALONG THE WHOLE MARK, NOT THE CHORD AT ITS MIDDLE.
//
// The published metric compares a mark's CHORD angle with the coin's direction
// at that chord's midpoint. That is the right question for a straight mark and
// the wrong one for a mark that follows a curving field: a curve tangent to the
// field everywhere has a chord that matches the field NOWHERE in particular.
// It is not a metric that can be satisfied and improved at the same time, which
// is one reason the fix looked impossible.
//
// So: sample nine stations per mark between 10% and 90% of arc length, take the
// DRAWN TANGENT there, and compare it with the coin's pointwise mean at that
// station. Same references, same coherence gate, same between-reference spread.
// 126 comparisons instead of 14, and every one of them asks the question the
// drawing is actually trying to answer.
function tangentRows(P) {
  const cum = [0];
  for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const L = cum[cum.length - 1], out = [];
  for (let k = 1; k <= 9; k++) {
    const s = L * (0.1 + 0.8 * (k - 1) / 8);
    let i = 1; while (i < cum.length - 1 && cum[i] < s) i++;
    const a = P[Math.max(0, i - 2)], b = P[Math.min(P.length - 1, i + 1)];
    let t = Math.atan2(b[1] - a[1], b[0] - a[0]) / D2R;
    while (t > 90) t -= 180; while (t <= -90) t += 180;
    const c = coinAt(P[i]);
    if (c) out.push({ at: P[i], drawn: t, ...c, err: Math.abs(dev(t, c.mean)) });
  }
  return out;
}
{
  console.log('\n=== METRIC B — drawn TANGENT vs the coin, nine stations per mark ===');
  console.log('mark        stations   BEFORE med / worst   AFTER med / worst   spread med   before out / after out');
  let bAll = [], aAll = [], bOutM = 0, aOutM = 0, bOutS = 0, aOutS = 0, nS = 0;
  for (const o of OUT) {
    const rb = tangentRows(o.NOW), ra = tangentRows(o.FB);
    const mb = med(rb.map((r) => r.err)), ma = med(ra.map((r) => r.err));
    const sp = med(ra.map((r) => r.worst));
    bAll.push(...rb.map((r) => r.err)); aAll.push(...ra.map((r) => r.err));
    bOutS += rb.filter((r) => r.err > r.worst).length; aOutS += ra.filter((r) => r.err > r.worst).length;
    nS += ra.length;
    if (mb > sp) bOutM++; if (ma > sp) aOutM++;
    console.log(`${tag(o.m).padEnd(10)}${String(ra.length).padStart(6)}     ${mb.toFixed(1).padStart(6)} /${Math.max(...rb.map((r) => r.err)).toFixed(1).padStart(6)}`
      + `      ${ma.toFixed(1).padStart(6)} /${Math.max(...ra.map((r) => r.err)).toFixed(1).padStart(6)}`
      + `${sp.toFixed(1).padStart(12)}       ${(mb > sp ? 'OUT' : ' in')} ${'->'} ${(ma > sp ? 'OUT' : ' in')}`);
  }
  console.log(`\n  BEFORE  median ${med(bAll).toFixed(1)} deg  worst ${Math.max(...bAll).toFixed(1)}   ${bOutS} of ${nS} stations outside the between-reference spread   ${bOutM} of 14 marks out on their median`);
  console.log(`  AFTER   median ${med(aAll).toFixed(1)} deg  worst ${Math.max(...aAll).toFixed(1)}   ${aOutS} of ${nS} stations outside the between-reference spread   ${aOutM} of 14 marks out on their median`);
}

// direction error, before and after, on _qo5field's own metric
console.log('\n=== METRIC A — the published metric (mark CHORD vs coin at the chord midpoint) ===');
console.log('mark        ours   new    coin (n, spread)     |old|   |new|   old out?   new out?');
const oldE = [], newE = [];
let oldOut = 0, newOut = 0;
for (const o of OUT) {
  const chord = (A, B) => { let t = Math.atan2(B[1] - A[1], B[0] - A[0]) / D2R; while (t > 90) t -= 180; while (t <= -90) t += 180; return t; };
  const nd = chord(o.FB[0], o.FB[o.FB.length - 1]);
  // the midpoint MOVES with the curve; the metric is evaluated at the new chord midpoint
  const nmid = [(o.FB[0][0] + o.FB[o.FB.length - 1][0]) / 2, (o.FB[0][1] + o.FB[o.FB.length - 1][1]) / 2];
  const cOld = coinAt(o.m.mid), cNew = coinAt(nmid);
  if (!cOld || !cNew) { console.log(`${tag(o.m).padEnd(10)} UNMEASURED at one of the two midpoints`); continue; }
  const dO = Math.abs(dev(o.m.deg, cOld.mean)), dN = Math.abs(dev(nd, cNew.mean));
  oldE.push(dO); newE.push(dN);
  if (dO > cOld.worst) oldOut++;
  if (dN > cNew.worst) newOut++;
  console.log(`${tag(o.m).padEnd(10)}${String(o.m.deg).padStart(6)}${nd.toFixed(1).padStart(7)}   ${cNew.mean.toFixed(1).padStart(6)} (n=${cNew.n}, ${cNew.worst.toFixed(1)})`.padEnd(46)
    + `${dO.toFixed(1).padStart(7)}${dN.toFixed(1).padStart(8)}${(dO > cOld.worst ? '   YES' : '    no').padStart(11)}${(dN > cNew.worst ? '   YES' : '    no').padStart(11)}`);
}
console.log(`\n  BEFORE  median ${med(oldE).toFixed(1)} deg   worst ${Math.max(...oldE).toFixed(1)}   ${oldOut} of ${oldE.length} outside the between-reference spread`);
console.log(`  AFTER   median ${med(newE).toFixed(1)} deg   worst ${Math.max(...newE).toFixed(1)}   ${newOut} of ${newE.length} outside the between-reference spread`);

if (fail) { console.log(`\n!! ${fail} checks failed — no path printed.`); process.exit(1); }

// ── S7 and the emission
console.log('\n=== new path strings, LOCAL units, ready to paste ===');
const r2 = (v) => +(+v).toFixed(2);
for (const o of OUT) {
  const L = o.segs.map((C) => C.map(toLocal).map(([x, y]) => [r2(x), r2(y)]));
  let d = `M ${L[0][0][0]} ${L[0][0][1]}`;
  for (const C of L) d += ` C ${C[1][0]} ${C[1][1]} ${C[2][0]} ${C[2][1]} ${C[3][0]} ${C[3][1]}`;
  const rt = points(d);
  if (rt.length !== o.segs.length + 1) throw new Error('_qw2gen: S7 round-trip failed for ' + tag(o.m));
  console.log(`${tag(o.m).padEnd(9)} '<path d="${d}" fill="none" stroke-width="${o.m.w}"/>' +`);
}
