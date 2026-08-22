// _jn15fit — fit the measured streamlines to single cubic Beziers, TRIM them
// off the dark curls, and check every gap in the wig against §7's arithmetic
// rule (gap >= (w1 + w2)/2 + 0.4).
//
// Three jobs, and the second and third are the ones the brief calls the most
// likely way to sink this round:
//
//  1. FIT. One cubic per course, least squares with chord-length
//     parameterisation. Max deviation is printed; a fit worse than 0.30 local
//     units is reported as a failure, not accepted quietly.
//  2. TRIM. Every new pale ridge is shortened from its back end until it clears
//     CURLS_JEFFERSON by CLEAR local units. The curls are DARK and, in bust(),
//     are emitted AFTER the lit-ridge group — so the paint-out actually runs
//     dark-over-pale here, not the other way round (see the report). Either way
//     an overlap is clutter, so the clearance is enforced geometrically.
//  3. SPACE. Pairwise minimum distance between every pair of drawn marks in the
//     wig — new against new, new against the existing RELIEF ridges, and new
//     against the curls — with §7's threshold from the two widths.
//
// Run: node coloringbook/judge/_jn15fit.mjs
import { dOutline, dHair, HAIRLINE } from './_jn15locus.mjs';

const CLEAR = +(process.env.CLEAR || 2.4);
const FITTOL = 0.30;

// ── the field and the integrator, identical to _jn15flow.mjs ────────────────
const F = [
  [0, -26, 19.0], [0, -22, 17.8], [0, -18, -32.0], [0, -14, -49.5],
  [-4, -26, 26.4], [-4, -22, 18.6], [-4, -18, -10.1], [-4, -14, -15.1], [-4, -10, -32.2], [-4, -6, -47.3],
  [-8, -26, 29.9], [-8, -22, 13.5], [-8, -18, -12.9], [-8, -14, -23.6], [-8, -10, -19.1], [-8, -6, -28.8], [-8, -2, -26.4], [-8, 2, -3.8],
  [-12, -26, 8.8], [-12, -22, 8.3], [-12, -18, -27.5], [-12, -14, -32.2], [-12, -10, -31.5], [-12, -6, -32.6], [-12, -2, -40.4], [-12, 2, -46.2], [-12, 6, -41.7],
  [-16, -26, -2.8], [-16, -22, -10.2], [-16, -18, -28.7], [-16, -14, -26.5], [-16, -10, -40.8], [-16, -6, -37.8], [-16, -2, -46.5], [-16, 2, -33.5], [-16, 6, -38.7], [-16, 10, -19.0],
  [-20, -26, -22.4], [-20, -22, -28.3], [-20, -18, -34.6], [-20, -14, -36.1], [-20, -10, -35.3], [-20, -6, -40.7], [-20, -2, -55.9], [-20, 2, -41.7], [-20, 6, -44.4], [-20, 10, -43.8],
  [-24, -26, -41.9], [-24, -22, -36.3], [-24, -18, -39.7], [-24, -14, -38.2], [-24, -10, -38.9], [-24, -6, -36.7], [-24, -2, -40.4], [-24, 2, -34.7], [-24, 6, -47.1],
  [-28, -14, -54.9], [-28, -10, -60.1], [-28, -6, -56.8], [-28, -2, -45.4], [-28, 2, -33.2], [-28, 6, -62.9],
];
const SIG = 5.0;
function dirAt(x, y) {
  let sx = 0, sy = 0, w = 0;
  for (const [fx, fy, a] of F) {
    const k = Math.exp(-(((x - fx) ** 2 + (y - fy) ** 2) / (2 * SIG * SIG)));
    const t = 2 * a * Math.PI / 180;
    sx += k * Math.cos(t); sy += k * Math.sin(t); w += k;
  }
  const th = Math.atan2(sy / w, sx / w) / 2;
  return [Math.cos(th), Math.sin(th)];
}
function streamline(x, y, xstop, ystop) {
  const pts = [[x, y]];
  for (let i = 0; i < 200; i++) {
    let [ux, uy] = dirAt(x, y); if (ux > 0) { ux = -ux; uy = -uy; }
    let [vx, vy] = dirAt(x + ux * 0.25, y + uy * 0.25); if (vx > 0) { vx = -vx; vy = -vy; }
    x += vx * 0.5; y += vy * 0.5;
    pts.push([x, y]);
    if (dOutline(x, y) < 2.2 || x < xstop || y > ystop) break;
  }
  return pts;
}

// ── one-cubic least-squares fit ─────────────────────────────────────────────
function fitCubic(P) {
  const n = P.length;
  const t = [0];
  for (let i = 1; i < n; i++) t.push(t[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const T = t.map((v) => v / t[n - 1]);
  const P0 = P[0], P3 = P[n - 1];
  // solve for the two interior control points, x and y independently
  const B = (u) => [(1 - u) ** 3, 3 * u * (1 - u) ** 2, 3 * u * u * (1 - u), u ** 3];
  let a11 = 0, a12 = 0, a22 = 0, bx1 = 0, bx2 = 0, by1 = 0, by2 = 0;
  for (let i = 0; i < n; i++) {
    const b = B(T[i]);
    const rx = P[i][0] - b[0] * P0[0] - b[3] * P3[0];
    const ry = P[i][1] - b[0] * P0[1] - b[3] * P3[1];
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

// ── existing marks in the wig, transcribed from src/art/coins.js ────────────
const EXISTING = [
  ['RELIEF base[0]', 1.63, 'M -26.24 -26.41 q 6.4 8.8 5.6 18.6'],
  ['RELIEF base[1]', 1.63, 'M -30.25 -18.35 q 5.0 9.2 4.2 18.8'],
  ['RELIEF base[2]', 1.55, 'M -27.04 1.8 q 2.0 7.8 -0.4 13.6'],
  ['RELIEF base[3]', 1.46, 'M -28.04 -25.0 q 5.6 6.0 6.4 13.4'],
  ['RELIEF base[4]', 1.46, 'M -30.75 -16.94 q 4.0 7.4 4.0 15.0'],
  ['RELIEF base[5]', 1.38, 'M -25.43 1.8 q 3.2 6.4 2.2 12.6'],
  ['RELIEF fine[0]', 1.2, 'M -24.03 -18.76 q 3.6 4.0 3.8 8.4'],
  ['RELIEF fine[1]', 1.2, 'M -33.25 -6.26 q 2.2 6.4 0.6 11.6'],
  ['RELIEF fine[2]', 1.12, 'M -26.44 -27.42 q 4.0 3.0 5.2 6.6'],
  ['CURL 1 (dark)', 1.5, 'M -6.4 1.0 C -8.6 1.8 -10.0 3.4 -9.8 5.2 C -9.6 6.8 -8.9 7.6 -8.0 7.9'],
  ['CURL 2 (dark)', 1.4, 'M -11.6 3.2 C -13.8 4.2 -15.4 6.0 -15.0 7.9 C -14.7 9.3 -14.0 9.9 -13.2 10.1'],
  ['CURL 3 (dark)', 1.4, 'M -16.4 1.6 C -18.6 3.0 -20.4 4.8 -21.2 7.0 C -21.6 8.1 -21.6 8.9 -21.4 9.6'],
];
// flatten a path made only of M / q / C
function flat(d) {
  const tok = d.trim().split(/[\s,]+/);
  let i = 0, cur = [0, 0]; const out = [];
  const num = () => +tok[i++];
  while (i < tok.length) {
    const c = tok[i++];
    if (c === 'M') { cur = [num(), num()]; out.push(cur.slice()); }
    else if (c === 'q') {
      const c1 = [cur[0] + num(), cur[1] + num()], e = [cur[0] + num(), cur[1] + num()];
      for (let k = 1; k <= 24; k++) { const u = k / 24; out.push([(1 - u) ** 2 * cur[0] + 2 * u * (1 - u) * c1[0] + u * u * e[0], (1 - u) ** 2 * cur[1] + 2 * u * (1 - u) * c1[1] + u * u * e[1]]); }
      cur = e;
    } else if (c === 'C') {
      const c1 = [num(), num()], c2 = [num(), num()], e = [num(), num()];
      for (let k = 1; k <= 24; k++) { const u = k / 24; out.push([(1 - u) ** 3 * cur[0] + 3 * u * (1 - u) ** 2 * c1[0] + 3 * u * u * (1 - u) * c2[0] + u ** 3 * e[0], (1 - u) ** 3 * cur[1] + 3 * u * (1 - u) ** 2 * c1[1] + 3 * u * u * (1 - u) * c2[1] + u ** 3 * e[1]]); }
      cur = e;
    } else throw new Error('unsupported command ' + c);
  }
  return out;
}
const minDist = (A, B) => { let m = Infinity; for (const a of A) for (const b of B) m = Math.min(m, Math.hypot(a[0] - b[0], a[1] - b[1])); return m; };
const CURLS = EXISTING.filter((e) => e[0].startsWith('CURL')).map((e) => flat(e[2]));

// ── seeds ON THE HAIRLINE, at a stated arc length, stepped inward ──────────
const OFFSET = 2.6;
function seedAt(arc) {
  let acc = 0;
  for (let i = 0; i + 1 < HAIRLINE.length; i++) {
    const [ax, ay] = HAIRLINE[i], [bx, by] = HAIRLINE[i + 1];
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
    if (arc <= acc + L) {
      const t = (arc - acc) / L;
      let nx = dy / L, ny = -dx / L; if (nx > 0) { nx = -nx; ny = -ny; }
      return [+(ax + t * dx + OFFSET * nx).toFixed(2), +(ay + t * dy + OFFSET * ny).toFixed(2)];
    }
    acc += L;
  }
  throw new Error('arc past the end of the hairline: ' + arc);
}

// THE SET. `base` is drawn at every full-tier size, so it carries the FLOW:
// four long sweeps, six arc-units apart on the hairline. `fine` appears only
// above 130px and carries the TEXTURE: medium strokes, staggered — started part
// way along their own streamline rather than at the hairline — because on the
// photograph the cuts between the long strands are short and offset from each
// other, not a second full-length comb. `skip`/`len` are in local units of arc
// along the streamline.
const PLAN = [
  { tier: 'base', arc: 3.0, w: 1.6, skip: 0, len: 99 },
  { tier: 'base', arc: 9.0, w: 1.55, skip: 0, len: 99 },
  { tier: 'base', arc: 15.0, w: 1.5, skip: 0, len: 99 },
  { tier: 'base', arc: 21.0, w: 1.42, skip: 0, len: 99 },
  { tier: 'fine', arc: 6.0, w: 1.22, skip: 1.5, len: 13 },
  { tier: 'fine', arc: 6.0, w: 1.15, skip: 16.5, len: 11 },
  { tier: 'fine', arc: 12.0, w: 1.2, skip: 4.0, len: 12 },
  { tier: 'fine', arc: 12.0, w: 1.12, skip: 18.0, len: 9 },
  { tier: 'fine', arc: 18.0, w: 1.18, skip: 3.0, len: 11 },
  { tier: 'fine', arc: 18.0, w: 1.1, skip: 16.0, len: 8 },
  { tier: 'fine', arc: 24.0, w: 1.12, skip: 0.5, len: 6 },
];
const seeds = PLAN.map((p) => seedAt(p.arc));
const TIERS = PLAN.map((p) => p.tier);
const WIDTH = PLAN.map((p) => p.w);

console.log(`CLEAR = ${CLEAR} local units off the dark curls;  fit tolerance ${FITTOL}`);
// KEEP-OFF SET: everything already drawn in the wig. A new streamline is
// trimmed from its back end until its last point clears each of these by that
// pair's own §7 threshold plus MARGIN. Three of the nine courses run straight
// through the EXISTING back ridge family otherwise — gaps 0.12, 0.21 and 0.69
// local units — because those ridges stand nearly upright while the coin's
// strands there lie at about -35 deg, so the two families CROSS. A lattice of
// crossing pale strokes does not read as hair.
const MARGIN = 0.35;
const KEEPOFF = EXISTING.map((e) => ({ name: e[0], w: e[1], pts: flat(e[2]) }));
const made = [];
for (let s = 0; s < PLAN.length; s++) {
  let pts = streamline(seeds[s][0], seeds[s][1], -22, 0);
  // apply skip / len, measured as arc along the streamline (0.5 per step)
  const skipN = Math.round(PLAN[s].skip / 0.5), lenN = Math.round(PLAN[s].len / 0.5);
  pts = pts.slice(skipN, skipN + lenN + 1);
  const off = KEEPOFF.concat(made.map((m) => ({ name: `NEW #${m.i + 1}`, w: m.w, pts: m.flat })));
  const clash = (P) => off.find((o) => {
    const th = o.name.startsWith('CURL') ? CLEAR : (WIDTH[s] + o.w) / 2 + 0.4 + MARGIN;
    return minDist(P, o.pts) < th;
  });
  const MINLEN = 8; // steps, i.e. 4 local units — shorter than this is a fleck
  let trimmed = 0;
  while (pts.length > MINLEN + 1 && clash([pts[pts.length - 1]])) { pts.pop(); trimmed++; }
  const still = clash(pts);
  if (still) {
    console.log(`\n#${s + 1} ${TIERS[s]} w ${WIDTH[s]}  seed (${seeds[s]})  REJECTED — after trimming to the ${(pts.length - 1) * 0.5}-unit minimum it still fouls ${still.name}. Reported, not drawn.`);
    continue;
  }
  const f = fitCubic(pts);
  const flatNew = [];
  for (let k = 0; k <= 48; k++) flatNew.push(f.bez(k / 48));
  made.push({ i: s, tier: TIERS[s], w: WIDTH[s], f, flat: flatNew, pts });
  const cl = Math.min(...CURLS.map((c) => minDist(flatNew, c)));
  console.log(`\n#${s + 1} ${TIERS[s]} w ${WIDTH[s]}  seed (${seeds[s]})  ${pts.length - 1} steps, ${trimmed} trimmed`);
  console.log(`   fit deviation ${f.worst.toFixed(3)} local units ${f.worst > FITTOL ? '*** WORSE THAN TOLERANCE ***' : 'OK'}`);
  console.log(`   clearance to the nearest dark curl ${cl.toFixed(2)}   d(hair) at both ends ${dHair(...f.P0).toFixed(2)} / ${dHair(...f.P3).toFixed(2)}   d(edge) ${dOutline(...f.P0).toFixed(2)} / ${dOutline(...f.P3).toFixed(2)}`);
  console.log(`   ${emit(f, WIDTH[s])}`);
}

console.log('\n=== §7 SPACING: every pair closer than its threshold (w1+w2)/2 + 0.4');
const all = made.map((m) => ({ name: `NEW #${m.i + 1} (${m.tier})`, w: m.w, pts: m.flat }))
  .concat(EXISTING.map((e) => ({ name: e[0], w: e[1], pts: flat(e[2]) })));
let bad = 0;
for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
  const d = minDist(all[i].pts, all[j].pts), th = (all[i].w + all[j].w) / 2 + 0.4;
  if (d < th) { console.log(`  VIOLATION  ${all[i].name} x ${all[j].name}:  gap ${d.toFixed(2)} < ${th.toFixed(2)}`); bad++; }
}
console.log(bad ? `  ${bad} violations` : '  none — every pair clears its threshold');

console.log('\n=== the two strings, ready to paste');
for (const t of ['base', 'fine']) {
  console.log(`-- ${t} --`);
  for (const m of made) if (m.tier === t) console.log(`      '${emit(m.f, m.w)}' +`);
}
