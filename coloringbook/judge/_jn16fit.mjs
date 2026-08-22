// _jn16fit — redraw the BACK of Jefferson's wig (the lit ridges at local
// x <= -24) as continuations of the SAME measured streamlines the front courses
// were cut from.
//
// WHY THIS SHAPE OF FIX. Round 15 measured the untouched back ridges at a mean
// 61.2 deg from the photograph while its own new front courses sat at 12.1 deg,
// and it then had to TRIM the front courses short to stop them crossing the back
// family, because two ridge families meeting at 60-70 deg read as a lattice
// rather than as hair. Rotating the back ridges to some better angle would fix
// the number and leave two families. Cutting them from the same streamlines
// makes them ONE family with a gap in it, which is what the photograph shows.
//
// FIELD. Not transcribed. This file RUNS the frozen `_jn15strand.mjs` and parses
// its rows, so there is a generator behind every number here (brief-common
// standing rule 2). It therefore also picks up the two back-most samples
// (-32,-2) and (-32,2) that `_jn15flow.mjs`'s frozen literal predates, which is
// the part of the field the back courses actually run through.
//
// SEEDS. Identical to `_jn15fit.mjs`: arc length along the frozen HAIRLINE,
// stepped 2.6 units inward along its own normal. The back course for arc A is
// literally the continuation of the front course for arc A past x = XSPLIT.
// Nothing here is hand-placed and nothing is computed from src/art/coins.js.
//
// TRIM. Both ends. The back end stops at the frozen silhouette; the FRONT end is
// trimmed until it clears the existing front family and the dark curls by that
// pair's own §7 threshold, because unlike round 15 the clash here is at the
// start of the course, not the end.
//
// Run: node coloringbook/judge/_jn16fit.mjs
import { execFileSync } from 'node:child_process';
import { dOutline, dHair, HAIRLINE } from './_jn15locus.mjs';

const STRAND = new URL('./_jn15strand.mjs', import.meta.url).pathname;
const FITTOL = 0.30;
const CLEAR = +(process.env.CLEAR || 2.4);   // off the dark curls
const MARGIN = +(process.env.MARGIN || 0.35);
const XSPLIT = +(process.env.XSPLIT || -21); // where the front family ends

// ── the field, from the frozen instrument ──────────────────────────────────
function field(file) {
  const out = execFileSync('node', [STRAND, file], { env: { ...process.env, RAD: '3.0' }, encoding: 'utf8', maxBuffer: 1 << 26 });
  const F = [];
  for (const line of out.split('\n')) {
    const m = line.match(/^\s*(-?\d+)\s+(-?\d+)\s+\|\s+(-?[\d.]+) deg\s+\|\s+([\d.]+)/);
    if (m) F.push([+m[1], +m[2], +m[3], +m[4]]);
  }
  return F;
}
const F = field('nickel-obv-unc2004.jpg');
const SIG = 5.0;
function dirAt(x, y) {
  let sx = 0, sy = 0, w = 0;
  for (const [fx, fy, a] of F) {
    const k = Math.exp(-(((x - fx) ** 2 + (y - fy) ** 2) / (2 * SIG * SIG)));
    const t = 2 * a * Math.PI / 180;
    sx += k * Math.cos(t); sy += k * Math.sin(t); w += k;
  }
  const th = Math.atan2(sy / w, sx / w) / 2;
  return [Math.cos(th), Math.sin(th), Math.hypot(sx, sy) / w];
}
// COHSTOP — the field's own consensus, and why a streamline must stop at it.
//
// dirAt returns |sum w e^(2i.theta)| / sum w: how far the MEASURED SAMPLES near
// this place agree with one another. It is not the tensor's per-sample
// coherence and the two must not be compared (brief-common standing rule 1).
// At the bottom of the wig the field genuinely turns — the samples at (-28,6)
// and (-28,10) are 137 deg apart — so consensus there collapses to 0.20-0.36,
// and a streamline integrated through it hooks round into a shape no single
// cubic can carry: the first run of this file produced two courses with fit
// deviations of 1.815 and 0.733 against the 0.30 tolerance inherited from
// _jn15fit.mjs. Those are failure reports, not courses.
//
// R = 0.55 corresponds to a scatter of about +/-31 deg among the samples that
// determine the course (circular sd of the doubled angle, sqrt(-2 ln R) / 2).
// Below that the field disagrees with itself by half the 61.2 deg error this
// round exists to remove, so a course drawn there could not be claimed as a
// correction to it.
const COHSTOP = +(process.env.COHSTOP || 0.55);
function streamline(x, y) {
  const pts = [[x, y]];
  let stop = 'STEP BUDGET EXHAUSTED — a failure report, not a course';
  for (let i = 0; i < 300; i++) {
    let [ux, uy] = dirAt(x, y); if (ux > 0) { ux = -ux; uy = -uy; }
    let [vx, vy] = dirAt(x + ux * 0.25, y + uy * 0.25); if (vx > 0) { vx = -vx; vy = -vy; }
    x += vx * 0.5; y += vy * 0.5;
    pts.push([x, y]);
    if (dOutline(x, y) < 2.2) { stop = `reached the silhouette (d(edge) ${dOutline(x, y).toFixed(2)})`; break; }
    if (dirAt(x, y)[2] < COHSTOP) { stop = `field consensus fell to ${dirAt(x, y)[2].toFixed(2)} (< ${COHSTOP}) — the field turns here and stops determining a course`; break; }
    if (y > 16) { stop = 'reached y = 16, the nape'; break; }
  }
  return { pts, stop };
}

// ── fit / flatten / distance, shape-for-shape from _jn15fit.mjs ────────────
function fitCubic(P) {
  const n = P.length, t = [0];
  for (let i = 1; i < n; i++) t.push(t[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const T = t.map((v) => v / t[n - 1]);
  const P0 = P[0], P3 = P[n - 1];
  const B = (u) => [(1 - u) ** 3, 3 * u * (1 - u) ** 2, 3 * u * u * (1 - u), u ** 3];
  let a11 = 0, a12 = 0, a22 = 0, bx1 = 0, bx2 = 0, by1 = 0, by2 = 0;
  for (let i = 0; i < n; i++) {
    const b = B(T[i]);
    const rx = P[i][0] - b[0] * P0[0] - b[3] * P3[0], ry = P[i][1] - b[0] * P0[1] - b[3] * P3[1];
    a11 += b[1] * b[1]; a12 += b[1] * b[2]; a22 += b[2] * b[2];
    bx1 += b[1] * rx; bx2 += b[2] * rx; by1 += b[1] * ry; by2 += b[2] * ry;
  }
  const det = a11 * a22 - a12 * a12;
  const P1 = [(a22 * bx1 - a12 * bx2) / det, (a22 * by1 - a12 * by2) / det];
  const P2 = [(a11 * bx2 - a12 * bx1) / det, (a11 * by2 - a12 * by1) / det];
  const bez = (u) => { const b = B(u); return [b[0] * P0[0] + b[1] * P1[0] + b[2] * P2[0] + b[3] * P3[0], b[0] * P0[1] + b[1] * P1[1] + b[2] * P2[1] + b[3] * P3[1]]; };
  let worst = 0;
  for (let i = 0; i < n; i++) { const q = bez(T[i]); worst = Math.max(worst, Math.hypot(q[0] - P[i][0], q[1] - P[i][1])); }
  return { P0, P1, P2, P3, worst, bez };
}
const n2 = (v) => +(Math.round(v * 100) / 100).toFixed(2);
const emit = (f, w) => `<path d="M ${n2(f.P0[0])} ${n2(f.P0[1])} C ${n2(f.P1[0])} ${n2(f.P1[1])} ${n2(f.P2[0])} ${n2(f.P2[1])} ${n2(f.P3[0])} ${n2(f.P3[1])}" fill="none" stroke-width="${w}"/>`;
function flat(d) {
  const tok = d.trim().split(/[\s,]+/); let i = 0, cur = [0, 0]; const out = [];
  const num = () => +tok[i++];
  while (i < tok.length) {
    const c = tok[i++];
    if (c === 'M') { cur = [num(), num()]; out.push(cur.slice()); }
    else if (c === 'q') { const c1 = [cur[0] + num(), cur[1] + num()], e = [cur[0] + num(), cur[1] + num()];
      for (let k = 1; k <= 24; k++) { const u = k / 24; out.push([(1 - u) ** 2 * cur[0] + 2 * u * (1 - u) * c1[0] + u * u * e[0], (1 - u) ** 2 * cur[1] + 2 * u * (1 - u) * c1[1] + u * u * e[1]]); } cur = e; }
    else if (c === 'C') { const c1 = [num(), num()], c2 = [num(), num()], e = [num(), num()];
      for (let k = 1; k <= 24; k++) { const u = k / 24; out.push([(1 - u) ** 3 * cur[0] + 3 * u * (1 - u) ** 2 * c1[0] + 3 * u * u * (1 - u) * c2[0] + u ** 3 * e[0], (1 - u) ** 3 * cur[1] + 3 * u * (1 - u) ** 2 * c1[1] + 3 * u * u * (1 - u) * c2[1] + u ** 3 * e[1]]); } cur = e; }
    else throw new Error('unsupported command ' + c);
  }
  return out;
}
const minDist = (A, B) => { let m = Infinity; for (const a of A) for (const b of B) m = Math.min(m, Math.hypot(a[0] - b[0], a[1] - b[1])); return m; };

// ── what is already drawn. FRONT + curls are KEEP-OFF (this round does not own
// them); the nine BACK marks are what this round replaces and are listed so the
// before/after §7 count is over the same population.
const FRONT = [
  ['RELIEF base[0] front', 1.6, 'M 6.14 -23.58 C -2.87 -24.62 -12.31 -30.15 -21.16 -25.44'],
  ['RELIEF base[1] front', 1.55, 'M 4.03 -18.68 C -3.62 -17.25 -11.54 -15.58 -17.83 -10.71'],
  ['RELIEF base[2] front', 1.5, 'M 1.35 -13.31 C -6.1 -9.61 -13.51 -5.6 -19.56 0.21'],
  ['RELIEF base[3] front', 1.42, 'M -1.33 -7.95 C -5.57 -5.31 -9.96 -2.87 -13.88 0.25'],
  ['RELIEF fine[0] front', 1.22, 'M 3.75 -21.34 C -0.58 -21.43 -4.89 -22.03 -9.23 -22.05'],
  ['RELIEF fine[1] front', 1.15, 'M -11.22 -21.95 C -14.22 -21.71 -17.13 -20.72 -19.74 -19.25'],
  ['RELIEF fine[2] front', 1.2, 'M -1.02 -14.5 C -4.72 -12.97 -8.39 -11.36 -11.8 -9.26'],
  ['RELIEF fine[3] front', 1.12, 'M -13.48 -8.18 C -15.98 -6.51 -18.29 -4.58 -20.52 -2.57'],
];
const CURLSRC = [
  ['CURL 1 (dark)', 1.5, 'M -6.4 1.0 C -8.6 1.8 -10.0 3.4 -9.8 5.2 C -9.6 6.8 -8.9 7.6 -8.0 7.9'],
  ['CURL 2 (dark)', 1.4, 'M -11.6 3.2 C -13.8 4.2 -15.4 6.0 -15.0 7.9 C -14.7 9.3 -14.0 9.9 -13.2 10.1'],
  ['CURL 3 (dark)', 1.4, 'M -16.4 1.6 C -18.6 3.0 -20.4 4.8 -21.2 7.0 C -21.6 8.1 -21.6 8.9 -21.4 9.6'],
];
const OLDBACK = [
  ['OLD base[4]', 1.63, 'M -26.24 -26.41 q 6.4 8.8 5.6 18.6'],
  ['OLD base[5]', 1.63, 'M -30.25 -18.35 q 5.0 9.2 4.2 18.8'],
  ['OLD base[6]', 1.55, 'M -27.04 1.8 q 2.0 7.8 -0.4 13.6'],
  ['OLD base[7]', 1.46, 'M -28.04 -25.0 q 5.6 6.0 6.4 13.4'],
  ['OLD base[8]', 1.46, 'M -30.75 -16.94 q 4.0 7.4 4.0 15.0'],
  ['OLD base[9]', 1.38, 'M -25.43 1.8 q 3.2 6.4 2.2 12.6'],
  ['OLD fine[4]', 1.2, 'M -24.03 -18.76 q 3.6 4.0 3.8 8.4'],
  ['OLD fine[5]', 1.2, 'M -33.25 -6.26 q 2.2 6.4 0.6 11.6'],
  ['OLD fine[6]', 1.12, 'M -26.44 -27.42 q 4.0 3.0 5.2 6.6'],
];

// ── seeds on the hairline, exactly _jn15fit.mjs's rule ─────────────────────
const OFFSET = 2.6;
function seedAt(arc) {
  let acc = 0;
  for (let i = 0; i + 1 < HAIRLINE.length; i++) {
    const [ax, ay] = HAIRLINE[i], [bx, by] = HAIRLINE[i + 1];
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
    if (arc <= acc + L) { const t = (arc - acc) / L;
      let nx = dy / L, ny = -dx / L; if (nx > 0) { nx = -nx; ny = -ny; }
      return [+(ax + t * dx + OFFSET * nx).toFixed(2), +(ay + t * dy + OFFSET * ny).toFixed(2)]; }
    acc += L;
  }
  throw new Error('arc past the end of the hairline: ' + arc);
}

// THE PLAN. Six `base` courses and three `fine` — the same 6/3 split the nine
// marks being replaced had, so D6's mark count and D3's lit fraction are not
// quietly changed by this round on top of the direction fix. Arcs 3/9/15/21 are
// the front `base` courses continued; 6/12/18 are the intermediate arcs, which
// in the back have room the front does not because the courses fan apart.
const PLAN = [
  { tier: 'base', arc: 3.0, w: 1.63 },
  { tier: 'base', arc: 9.0, w: 1.63 },
  { tier: 'base', arc: 15.0, w: 1.55 },
  { tier: 'base', arc: 21.0, w: 1.46 },
  // `fine` appears only above 130 px and carries texture BETWEEN the base
  // courses, so it is seeded at the intermediate arcs — the same 3-unit stagger
  // `_jn15fit.mjs` uses on the front. HOW MANY MARKS THE BACK HOLDS IS A
  // QUESTION, NOT AN ASSUMPTION: a first run put base courses on all of
  // 3/6/9/12/15 and every intermediate `fine` seed was then rejected for fouling
  // one of them under §7's own threshold. The nine marks this round replaces
  // carried nine §7 violations, which is what "more marks than the space holds"
  // looks like when the rule is not enforced.
  { tier: 'fine', arc: 6.0, w: 1.22 },
  { tier: 'fine', arc: 12.0, w: 1.2 },
  { tier: 'fine', arc: 18.0, w: 1.12 },
  // THE ONE COURSE NOT CUT FROM THE SMOOTHED FIELD, and it is the best-evidenced
  // mark on this face. The bottom of the wig is where the field turns and the
  // consensus collapses, so no streamline may be integrated through it — but the
  // sample AT (-28, 10) is one of the five points `_jn16back.mjs` shows carry
  // genuine TWO-REFERENCE agreement: nickel-obv-unc2004.jpg reads +74.2 deg and
  // nickel-obv-5.JPG reads +77.4 deg, 3.2 deg apart, and that agreement survives
  // shrinking the sample disc to RAD 1.0, where it is 2.6 units clear of the
  // frozen silhouette and cannot be reading the edge. Two independent
  // photographs at 3.2 deg is stronger evidence than a smoothed field, so this
  // ridge is laid along their mean, +75.8 deg, through the sample itself.
  // It is drawn short because a two-reference angle is a measurement at ONE
  // PLACE and says nothing about the curvature either side of it.
  { tier: 'base', n2: [-28, 10, 75.8, 3.6], w: 1.55 },
];

console.log(`field: ${F.length} samples parsed from _jn15strand.mjs on nickel-obv-unc2004.jpg (RAD 3.0)`);
console.log(`  back-most samples now in the field: ${F.filter((f) => f[0] <= -28).map((f) => `(${f[0]},${f[1]})${f[2].toFixed(0)}`).join(' ')}`);
console.log(`XSPLIT ${XSPLIT}   CLEAR ${CLEAR}   MARGIN ${MARGIN}   fit tolerance ${FITTOL}\n`);

const KEEPOFF = FRONT.concat(CURLSRC).map((e) => ({ name: e[0], w: e[1], pts: flat(e[2]) }));
const made = [];
for (let s = 0; s < PLAN.length; s++) {
  let pts, stop, seed;
  if (PLAN[s].n2) {
    const [cx, cy, ang, half] = PLAN[s].n2;
    const a = ang * Math.PI / 180;
    pts = [];
    for (let t = -half; t <= half + 1e-9; t += 0.5) pts.push([cx + t * Math.cos(a), cy + t * Math.sin(a)]);
    // a straight ridge is drawn back-to-front like every streamline here
    if (pts[0][0] > pts[pts.length - 1][0]) pts.reverse();
    seed = [cx, cy];
    stop = `laid along the TWO-REFERENCE mean angle ${ang} deg at the measured sample (${cx}, ${cy})`;
  } else {
    seed = seedAt(PLAN[s].arc);
    const sl = streamline(seed[0], seed[1]);
    stop = sl.stop;
    const k = sl.pts.findIndex((p) => p[0] <= XSPLIT);
    if (k < 0) { console.log(`#${s + 1} arc ${PLAN[s].arc}: streamline never reaches x = ${XSPLIT} — reported, not drawn`); continue; }
    pts = sl.pts.slice(k);
  }
  const off = KEEPOFF.concat(made.map((m) => ({ name: m.name, w: m.w, pts: m.flat })));
  const clash = (P) => off.find((o) => {
    const th = o.name.startsWith('CURL') ? CLEAR : (PLAN[s].w + o.w) / 2 + 0.4 + MARGIN;
    return minDist(P, o.pts) < th;
  });
  const MINLEN = 8;
  let trimmed = 0;
  while (pts.length > MINLEN + 1 && clash([pts[0]])) { pts.shift(); trimmed++; }
  while (pts.length > MINLEN + 1 && clash([pts[pts.length - 1]])) { pts.pop(); trimmed++; }
  const still = clash(pts);
  if (still) { console.log(`#${s + 1} ${PLAN[s].tier} ${PLAN[s].n2 ? "TWO-REFERENCE" : "arc " + PLAN[s].arc}: REJECTED — after trimming to the ${(pts.length - 1) * 0.5}-unit minimum it still fouls ${still.name}. Reported, not drawn.`); continue; }
  const f = fitCubic(pts);
  if (f.worst > FITTOL) {
    console.log(`#${s + 1} ${PLAN[s].tier} ${PLAN[s].n2 ? "TWO-REFERENCE" : "arc " + PLAN[s].arc}: REJECTED — one cubic cannot carry this streamline (deviation ${f.worst.toFixed(3)} > ${FITTOL}). Reported, not drawn.`);
    continue;
  }
  const flatNew = []; for (let i = 0; i <= 48; i++) flatNew.push(f.bez(i / 48));
  const name = `NEW #${s + 1} (${PLAN[s].tier})`;
  made.push({ name, tier: PLAN[s].tier, w: PLAN[s].w, f, flat: flatNew });
  // the direction this course actually carries, against the field it came from
  const mid = f.bez(0.5), m2 = f.bez(0.52), ang = Math.atan2(m2[1] - mid[1], m2[0] - mid[0]) * 180 / Math.PI;
  const fld = dirAt(mid[0], mid[1]);
  const fang = Math.atan2(fld[1], fld[0]) * 180 / Math.PI;
  let d = Math.abs(ang - fang) % 180; if (d > 90) d = 180 - d;
  console.log(`#${s + 1} ${PLAN[s].tier} w ${PLAN[s].w} ${PLAN[s].n2 ? "TWO-REFERENCE" : "arc " + PLAN[s].arc}  seed (${seed})  ${(pts.length - 1) * 0.5} units, ${trimmed} steps trimmed  [${stop}]`);
  console.log(`   fit deviation ${f.worst.toFixed(3)} ${f.worst > FITTOL ? '*** WORSE THAN TOLERANCE ***' : 'OK'}   mid-course angle ${ang.toFixed(1)} vs field ${fang.toFixed(1)} (${d.toFixed(1)} deg)   field coherence ${fld[2].toFixed(2)}`);
  console.log(`   d(edge) ends ${dOutline(...f.P0).toFixed(2)} / ${dOutline(...f.P3).toFixed(2)}   d(hair) ${dHair(...f.P0).toFixed(2)} / ${dHair(...f.P3).toFixed(2)}`);
  console.log(`   ${emit(f, PLAN[s].w)}`);
}

// ── §7, before and after, over the same population ─────────────────────────
function spacing(label, marks) {
  let bad = 0;
  const lines = [];
  for (let i = 0; i < marks.length; i++) for (let j = i + 1; j < marks.length; j++) {
    const d = minDist(marks[i].pts, marks[j].pts), th = (marks[i].w + marks[j].w) / 2 + 0.4;
    if (d < th) { lines.push(`    ${marks[i].name} x ${marks[j].name}:  gap ${d.toFixed(2)} < ${th.toFixed(2)}`); bad++; }
  }
  console.log(`\n=== §7 SPACING ${label}: ${bad} violation${bad === 1 ? '' : 's'}`);
  lines.slice(0, 14).forEach((l) => console.log(l));
  if (lines.length > 14) console.log(`    ... and ${lines.length - 14} more`);
  return bad;
}
const asMarks = (arr) => arr.map((e) => ({ name: e[0], w: e[1], pts: flat(e[2]) }));
const before = spacing('BEFORE (front + old back + curls)', asMarks(FRONT).concat(asMarks(OLDBACK), asMarks(CURLSRC)));
const after = spacing('AFTER (front + new back + curls)', asMarks(FRONT).concat(made.map((m) => ({ name: m.name, w: m.w, pts: m.flat })), asMarks(CURLSRC)));
console.log(`\n§7 violations: ${before} before -> ${after} after`);

console.log('\n=== the two strings, ready to paste');
for (const t of ['base', 'fine']) {
  console.log(`-- ${t} --`);
  for (const m of made) if (m.tier === t) console.log(`      '${emit(m.f, m.w)}' +`);
}
