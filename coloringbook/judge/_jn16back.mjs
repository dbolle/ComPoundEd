// _jn16back — IS THE BACK OF THE WIG THE ONE REGION WHERE THE NICKEL OBVERSE
// HAS A SECOND USABLE REFERENCE?
//
// Round 15 reported that the two struck references agree at the back of the wig
// to about 8 degrees, and attributed that agreement to BOTH tensors reading the
// SILHOUETTE EDGE rather than a strand. If that attribution is right the
// agreement is an artefact and this face still has n = 1. This file settles it.
//
// It does not re-measure anything. `_jn15strand.mjs` is the frozen instrument
// and is run unmodified, once per (reference, radius); this file only does
// arithmetic on its printed rows. Nothing here reads src/art/coins.js.
//
// THREE TESTS, and they are independent of one another:
//
//  T1  EDGE-TANGENT TEST.  For every back sample, compare each reference's
//      tensor angle against the TANGENT OF THE FROZEN OUTLINE at the nearest
//      point on it (_jn15locus.OUTLINE, the D1 target — target-derived, §6.1).
//      If both references are reading the edge, both angles sit on the edge
//      tangent and their mutual agreement is entailed. The discriminating
//      quantity is therefore NOT err(A,B); it is err(A,B) compared against
//      err(A,edge) and err(B,edge). Agreement that is CLOSER than either
//      reference is to the edge is information the edge cannot supply.
//
//  T2  DISTANCE TEST.  Regress err(A,B) on d(edge). Edge-driven agreement must
//      decay with distance from the edge; strand-driven agreement must not.
//
//  T3  RADIUS TEST — the decisive one.  Re-run the frozen tensor with a smaller
//      sample disc (RAD), holding the SAMPLE SET fixed at the radius-3.0 screen
//      so that shrinking the disc cannot smuggle new points in. At RAD 3.0 a
//      sample 3.6 units from the outline has a disc that reaches to within 0.6
//      units of it; at RAD 1.5 the same disc is 2.1 units clear and CANNOT see
//      the edge at all. If the agreement is edge-driven it must collapse; if it
//      is strand-driven it must survive.
//
// NULL / DEGENERACY (§4.1): every cell that the frozen instrument reported as
// CONTAMINATED, NO-ORIENTATION or out of frame is carried through as a
// non-answer and counted, never silently dropped. Coverage is printed for every
// radius so a "better" number bought by measuring fewer points is visible.
//
// Run: node coloringbook/judge/_jn16back.mjs
import { execFileSync } from 'node:child_process';
import { OUTLINE } from './_jn15locus.mjs';

const STRAND = new URL('./_jn15strand.mjs', import.meta.url).pathname;
const REFS = ['nickel-obv-unc2004.jpg', 'nickel-obv-5.JPG'];
const RADII = [3.0, 2.5, 2.0, 1.5, 1.0];

// The BACK, as _jn15agree.mjs freezes it: local x < -20.
const isBack = ([x]) => x < -20;

const fold = (d) => { let a = d; while (a <= -90) a += 180; while (a > 90) a -= 180; return a; };
const cdiff = (a, b) => { let d = Math.abs(a - b) % 180; return d > 90 ? 180 - d : d; };

// ── run the FROZEN instrument and parse its rows. No re-implementation: if the
// tensor is wrong, it is wrong identically here and in the published numbers.
function measure(file, rad) {
  const out = execFileSync('node', [STRAND, file], {
    env: { ...process.env, RAD: String(rad) }, encoding: 'utf8', maxBuffer: 1 << 26,
  });
  const rows = {};
  for (const line of out.split('\n')) {
    const m = line.match(/^\s*(-?\d+)\s+(-?\d+)\s+\|\s+(--|-?[\d.]+) deg\s+\|\s+([\d.]+)\s+\|\s+(\d+) \/\s+(\d+) \|\s+([\d.]+)\s+([\d.]+)(.*)$/);
    if (!m) continue;
    rows[`${+m[1]},${+m[2]}`] = {
      x: +m[1], y: +m[2], ang: m[3] === '--' ? null : +m[3], coh: +m[4],
      dHair: +m[7], dEdge: +m[8], note: m[9].trim(),
    };
  }
  return rows;
}

// ── the frozen outline's own tangent at the point nearest (x,y).
//
// §4 INSTRUMENT NOTE, found by running the single-segment version first: the D1
// mask polygon is a traced contour with short, staircase-y segments, so the
// tangent of the ONE nearest segment flips by tens of degrees between adjacent
// vertices (it returned +25.1 and +83.4 deg at two points whose neighbours read
// -50 and -66). A single segment is not a tangent estimate. This fits a line by
// PCA over every vertex within WIN local units of the nearest point, which is
// the same smoothing scale as the tensor's own sample disc.
const WIN = 3.0;
function edgeTangent(x, y) {
  let best = Infinity, bi = 0, bp = null;
  const n = OUTLINE.length;
  for (let i = 0; i < n; i++) {
    const [ax, ay] = OUTLINE[i], [bx, by] = OUTLINE[(i + 1) % n];
    const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    const t = L === 0 ? 0 : Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L));
    const d = Math.hypot(x - (ax + t * dx), y - (ay + t * dy));
    if (d < best) { best = d; bi = i; bp = [ax + t * dx, ay + t * dy]; }
  }
  // vertices within WIN of the closest point, walking both ways from bi
  const win = [];
  for (let k = -40; k <= 40; k++) {
    const p = OUTLINE[((bi + k) % n + n) % n];
    if (Math.hypot(p[0] - bp[0], p[1] - bp[1]) <= WIN) win.push(p);
  }
  if (win.length < 3) return { d: best, ang: null, n: win.length };
  const mxx = win.reduce((s, p) => s + p[0], 0) / win.length;
  const myy = win.reduce((s, p) => s + p[1], 0) / win.length;
  let sxx = 0, syy = 0, sxy = 0;
  for (const p of win) { const a = p[0] - mxx, b = p[1] - myy; sxx += a * a; syy += b * b; sxy += a * b; }
  // principal axis = eigenvector of the LARGER eigenvalue
  const ang = fold(0.5 * Math.atan2(2 * sxy, sxx - syy) * 180 / Math.PI);
  return { d: best, ang, n: win.length };
}

// ── measure everything up front
const M = {};
for (const rad of RADII) for (const f of REFS) M[`${f}@${rad}`] = measure(f, rad);

// The sample set is FROZEN at the radius-3.0 screen, for both references, so
// that shrinking the disc cannot admit points the frozen locus excluded.
const base = M[`${REFS[0]}@3`], base5 = M[`${REFS[1]}@3`];
const SET = Object.keys(base)
  .filter((k) => isBack([base[k].x, base[k].y]))
  .filter((k) => base[k].ang !== null && base5[k] && base5[k].ang !== null)
  .sort((a, b) => base[a].dEdge - base[b].dEdge);

console.log(`\n=== _jn16back — is the back of the nickel's wig an n=2 region?`);
console.log(`sample set: the ${SET.length} BACK points (local x < -20) that BOTH references`);
console.log(`answer at the frozen radius 3.0 after the frozen hairline and silhouette screens.`);
console.log(`(back points on the grid: ${Object.keys(base).filter((k) => isBack([base[k].x, base[k].y])).length}; both-answered: ${SET.length})\n`);

// ─────────────────────────────── T1 ───────────────────────────────
console.log('--- T1  EDGE-TANGENT TEST  (frozen outline = _headmask-nickel.json, the D1 target)');
console.log('  point    d(edge) |  A=unc2004  B=obv-5   edge tan |  err(A,B)  err(A,E)  err(B,E) | verdict');
const T1 = [];
for (const k of SET) {
  const a = base[k], b = base5[k];
  const E = edgeTangent(a.x, a.y);
  const eAB = cdiff(a.ang, b.ang), eAE = cdiff(a.ang, E.ang), eBE = cdiff(b.ang, E.ang);
  // Agreement is EXPLAINED by the edge when both references sit about as close
  // to the edge tangent as they do to each other.
  const explained = eAE <= eAB + 10 && eBE <= eAB + 10;
  T1.push({ k, d: a.dEdge, eAB, eAE, eBE, explained });
  console.log(`  ${k.padStart(8)}  ${a.dEdge.toFixed(1).padStart(5)}  |` +
    ` ${a.ang.toFixed(1).padStart(7)}  ${b.ang.toFixed(1).padStart(7)}  ${E.ang.toFixed(1).padStart(7)} |` +
    ` ${eAB.toFixed(1).padStart(7)}  ${eAE.toFixed(1).padStart(7)}  ${eBE.toFixed(1).padStart(7)} | ` +
    (explained ? 'edge explains it' : 'NOT explained by the edge'));
}
const mean = (v) => v.reduce((s, x) => s + x, 0) / v.length;
console.log(`\n  mean err(A,B) ${mean(T1.map((r) => r.eAB)).toFixed(1)} deg` +
  `   mean err(A,edge) ${mean(T1.map((r) => r.eAE)).toFixed(1)} deg` +
  `   mean err(B,edge) ${mean(T1.map((r) => r.eBE)).toFixed(1)} deg`);
console.log(`  explained by the edge: ${T1.filter((r) => r.explained).length}/${T1.length}`);

// ─────────────────────────────── T2 ───────────────────────────────
console.log('\n--- T2  DISTANCE TEST  (does the agreement decay with distance from the edge?)');
const xs = T1.map((r) => r.d), ys = T1.map((r) => r.eAB);
const mx = mean(xs), my = mean(ys);
const cov = mean(xs.map((x, i) => (x - mx) * (ys[i] - my)));
const sx = Math.sqrt(mean(xs.map((x) => (x - mx) ** 2))), sy = Math.sqrt(mean(ys.map((y) => (y - my) ** 2)));
const r = cov / (sx * sy), slope = cov / (sx * sx);
console.log(`  err(A,B) vs d(edge):  Pearson r = ${r.toFixed(3)},  slope = ${slope.toFixed(2)} deg per local unit`);
for (const [lo, hi] of [[0, 5], [5, 8], [8, 99]]) {
  const g = T1.filter((t) => t.d >= lo && t.d < hi);
  if (g.length) console.log(`    d(edge) ${lo}-${hi === 99 ? '+' : hi} units: n=${g.length}  mean err(A,B) ${mean(g.map((t) => t.eAB)).toFixed(1)} deg`);
}

// ─────────────────────────────── T3 ───────────────────────────────
console.log('\n--- T3  RADIUS TEST  (shrink the disc so it cannot reach the edge; sample set held fixed)');
console.log('  RAD |  covered  | mean err(A,B) | median | mean coh A / B | of those, discs CLEAR of the edge');
for (const rad of RADII) {
  const A = M[`${REFS[0]}@${rad}`], B = M[`${REFS[1]}@${rad}`];
  const got = SET.filter((k) => A[k] && B[k] && A[k].ang !== null && B[k].ang !== null);
  if (!got.length) { console.log(`  ${rad.toFixed(1)} |   0/${SET.length}  | no answers`); continue; }
  const errs = got.map((k) => cdiff(A[k].ang, B[k].ang)).sort((a, b) => a - b);
  const clear = got.filter((k) => base[k].dEdge > rad + 1.0);
  const cErrs = clear.map((k) => cdiff(A[k].ang, B[k].ang));
  console.log(`  ${rad.toFixed(1)} |  ${String(got.length).padStart(2)}/${SET.length}   |` +
    `    ${mean(errs).toFixed(1).padStart(5)} deg  |  ${errs[Math.floor(errs.length / 2)].toFixed(1).padStart(5)} |` +
    `  ${mean(got.map((k) => A[k].coh)).toFixed(3)} / ${mean(got.map((k) => B[k].coh)).toFixed(3)}  |` +
    `  n=${clear.length}  mean ${clear.length ? mean(cErrs).toFixed(1) : ' -- '} deg`);
}

// ── T3b, the focused version: take ONLY the points that produced the small
// agreement figure — the near-edge band — and shrink the disc until it is
// provably clear of the edge. This is the whole question in one table.
console.log('\n--- T3b FOCUSED: the near-edge band alone (d(edge) < 5), disc shrunk until it cannot see the edge');
const NEAR = SET.filter((k) => base[k].dEdge < 5);
console.log(`  the ${NEAR.length} points that carry the small figure: ${NEAR.join('  ')}`);
console.log('  RAD | clearance | covered |  per-point err(A,B)                     | mean');
for (const rad of RADII) {
  const A = M[`${REFS[0]}@${rad}`], B = M[`${REFS[1]}@${rad}`];
  const got = NEAR.filter((k) => A[k] && B[k] && A[k].ang !== null && B[k].ang !== null);
  const errs = got.map((k) => cdiff(A[k].ang, B[k].ang));
  const clr = Math.min(...NEAR.map((k) => base[k].dEdge)) - rad;
  console.log(`  ${rad.toFixed(1)} |   ${clr.toFixed(1).padStart(4)}    |  ${got.length}/${NEAR.length}    | ` +
    got.map((k, i) => `${k}:${errs[i].toFixed(0)}`).join('  ').padEnd(38) + ` | ${errs.length ? (errs.reduce((a, b) => a + b, 0) / errs.length).toFixed(1) : ' -- '} deg`);
}

// ── T4  WHICH VARIABLE ACTUALLY PREDICTS THE AGREEMENT?
// T2 shows err(A,B) rising with d(edge). Two accounts fit that: (a) the edge is
// manufacturing the agreement near it, or (b) the SECOND reference simply runs
// out of signal further in — obv-5 is a weaker, softer photograph and its
// coherence is what decays. These make opposite recommendations, so they have
// to be separated rather than assumed.
console.log('\n--- T4  d(edge) or coherence? (competing explanations for T2)');
{
  const rows = SET.map((k) => ({ d: base[k].dEdge, cB: base5[k].coh, cA: base[k].coh, e: cdiff(base[k].ang, base5[k].ang) }));
  const corr = (f) => {
    const X = rows.map(f), Y = rows.map((r) => r.e);
    const mX = mean(X), mY = mean(Y);
    const c = mean(X.map((x, i) => (x - mX) * (Y[i] - mY)));
    return c / (Math.sqrt(mean(X.map((x) => (x - mX) ** 2))) * Math.sqrt(mean(Y.map((y) => (y - mY) ** 2))));
  };
  console.log(`  err(A,B) vs d(edge)          r = ${corr((r) => r.d).toFixed(3)}`);
  console.log(`  err(A,B) vs coherence(obv-5) r = ${corr((r) => r.cB).toFixed(3)}`);
  console.log(`  err(A,B) vs coherence(unc)   r = ${corr((r) => r.cA).toFixed(3)}`);
  console.log(`  d(edge)  vs coherence(obv-5) r = ${(() => {
    const X = rows.map((r) => r.d), Y = rows.map((r) => r.cB), mX = mean(X), mY = mean(Y);
    return (mean(X.map((x, i) => (x - mX) * (Y[i] - mY))) / (Math.sqrt(mean(X.map((x) => (x - mX) ** 2))) * Math.sqrt(mean(Y.map((y) => (y - mY) ** 2))))).toFixed(3);
  })()}   <- if these two predictors are collinear, T2 cannot separate them`);
  for (const [lo, hi] of [[0, 0.25], [0.25, 0.35], [0.35, 1]]) {
    const g = rows.filter((r) => r.cB >= lo && r.cB < hi);
    if (g.length) console.log(`    coherence(obv-5) ${lo}-${hi}: n=${g.length}  mean err(A,B) ${mean(g.map((r) => r.e)).toFixed(1)} deg   mean d(edge) ${mean(g.map((r) => r.d)).toFixed(1)}`);
  }
}

// ── T5  THE NEGATIVE CONTROL, and T3b means nothing without it.
// T3b's agreement survives shrinking the disc. The objection to that is
// "small discs agree everywhere" — fewer pixels, smoother statistics, maybe the
// tensor just returns something bland and correlated. So run the identical
// radius sweep on the FRONT, where the same two references disagree at 42.3 deg
// (near the 45 deg null) and where no agreement should appear at any radius.
// If the front stays near 45 while the back's near-edge band stays near 10, the
// back's agreement is a property of the back and not of the instrument.
console.log('\n--- T5  NEGATIVE CONTROL: the same radius sweep on the FRONT (x >= -20)');
console.log('  RAD | covered | mean err(A,B) FRONT | mean err(A,B) BACK near-edge | ratio');
{
  const FSET = Object.keys(base).filter((k) => !isBack([base[k].x, base[k].y]))
    .filter((k) => base[k].ang !== null && base5[k] && base5[k].ang !== null);
  const NEAR = SET.filter((k) => base[k].dEdge < 5);
  for (const rad of RADII) {
    const A = M[`${REFS[0]}@${rad}`], B = M[`${REFS[1]}@${rad}`];
    const f = FSET.filter((k) => A[k] && B[k] && A[k].ang !== null && B[k].ang !== null);
    const n = NEAR.filter((k) => A[k] && B[k] && A[k].ang !== null && B[k].ang !== null);
    const fe = f.length ? mean(f.map((k) => cdiff(A[k].ang, B[k].ang))) : NaN;
    const ne = n.length ? mean(n.map((k) => cdiff(A[k].ang, B[k].ang))) : NaN;
    console.log(`  ${rad.toFixed(1)} | ${String(f.length).padStart(2)}/${FSET.length}   |        ${fe.toFixed(1).padStart(5)} deg        |            ${ne.toFixed(1).padStart(5)} deg           | ${(fe / ne).toFixed(1)}x`);
  }
}

// ── the NULL for this whole question (§4.1). Two angle fields that carry no
// common information give a mean folded difference of 45 deg exactly (uniform
// on a half-turn). Every number above has to be read against 45, not against 0.
console.log('\n--- NULL: two independent uniform angle fields give mean |dtheta| = 45.0 deg.');
console.log('    Read every figure above against 45, not against 0.');

// ── control (§3 D12 / R6): the SAME arithmetic on the FRONT, where round 15
// established the tensor is reading strands and not the edge. If the front
// behaves like the back, none of the above is about the back.
console.log('\n--- CONTROL: the same three numbers on the FRONT (x >= -20), where the strands are real');
const F = Object.keys(base).filter((k) => !isBack([base[k].x, base[k].y]))
  .filter((k) => base[k].ang !== null && base5[k] && base5[k].ang !== null);
const fT = F.map((k) => {
  const E = edgeTangent(base[k].x, base[k].y);
  return { d: base[k].dEdge, eAB: cdiff(base[k].ang, base5[k].ang), eAE: cdiff(base[k].ang, E.ang) };
});
console.log(`  n=${fT.length}  mean err(A,B) ${mean(fT.map((t) => t.eAB)).toFixed(1)} deg   mean err(A,edge) ${mean(fT.map((t) => t.eAE)).toFixed(1)} deg   mean d(edge) ${mean(fT.map((t) => t.d)).toFixed(1)}`);
