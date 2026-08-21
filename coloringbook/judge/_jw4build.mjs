// R4 dime jaw — build the tapered REGION from the measured widths, and check
// what came out before it is pasted into the source.
//
// The centreline is the CURRENT jaw path, unchanged: the brief keeps the
// geometry and the two references that show the feature put the drawn line on
// the dark run (`_jw4ridge-dime-obv-3-jpg.png`). Only the width changes.
//
// WIDTH, from `_jw4taper.mjs` (viewBox units, = local x 0.97):
//   chin third   2.94   (mean of per-reference medians; obv 2.85, obv-3 3.20)
//   middle third 2.35   (obv 3.30, obv-3 2.45, obv-2 1.50)
//   ear third    2.58   (obv 3.93, obv-3 2.38, obv-2 1.68)
//   the tip, s=34  1.78 (obv 1.75, obv-3 1.30, obv-2 2.45)
// The chin third is the only one where the references agree (1.12x between
// them); the middle and the ear spread 2.2x and 2.3x, so the data support
// "wider at the chin than at the tip" and nothing finer. A straight taper
// 2.90 -> 1.80 between the two ends therefore carries all of it, and it
// PREDICTS the middle third at s=17 as 2.35 against a measured 2.35.
//
// The offset outline is built by offsetting each cubic's control polygon along
// the curve normal at t = 0, 1/3, 2/3, 1 — an approximation, so the emitted
// region is measured back perpendicular to the centreline and the residual
// against the target profile is printed. CHECKS printed with it:
//   · every point of the region is inside the HEAD contour (no spill onto the
//     field: the fault that put 25.1% of the cent's lapel on bare field);
//   · the clearance to `shade`'s top edge, which the source's own comment says
//     must not close ("closing that gap merges the two into one dark bar").
//
// Run: node coloringbook/judge/_jw4build.mjs
import { busted } from './_jw4reg.mjs';
import { walk, inside } from './_jw4width.mjs';
import { marks } from './_jqgeom.mjs';

const S = 0.97; // the bust scale: local units x S = viewBox units
const W0 = 2.90 / S, W1 = 1.80 / S; // viewBox -> local
const CENTRE = [
  [[19.4, 21.4], [17.6, 21.4], [14.2, 21.4], [11, 21.2]],
  [[11, 21.2], [7, 21], [3.4, 19.4], [0.4, 18.2]],
  [[0.4, 18.2], [-3.2, 16.8], [-7.4, 15], [-10.4, 13.6]],
  [[-10.4, 13.6], [-11.4, 13], [-12.2, 12.4], [-12.6, 11.6]],
];
const bez = (P, t) => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * P[0][k] + 3 * u * u * t * P[1][k] + 3 * u * t * t * P[2][k] + t * t * t * P[3][k]);
};
const dbez = (P, t) => {
  const u = 1 - t;
  return [0, 1].map((k) => 3 * u * u * (P[1][k] - P[0][k]) + 6 * u * t * (P[2][k] - P[1][k]) + 3 * t * t * (P[3][k] - P[2][k]));
};
// arc length along the whole chain, so the width can be a function of s
const LENS = CENTRE.map((P) => {
  let L = 0, p = bez(P, 0);
  for (let i = 1; i <= 200; i++) { const q = bez(P, i / 200); L += Math.hypot(q[0] - p[0], q[1] - p[1]); p = q; }
  return L;
});
const TOTAL = LENS.reduce((a, b) => a + b, 0);
const sAt = (seg, t) => {
  let s = 0;
  for (let i = 0; i < seg; i++) s += LENS[i];
  let p = bez(CENTRE[seg], 0);
  for (let i = 1; i <= 200; i++) {
    const tt = (i / 200) * t, q = bez(CENTRE[seg], tt);
    s += Math.hypot(q[0] - p[0], q[1] - p[1]); p = q;
  }
  return s;
};
const halfW = (s) => (W0 + (W1 - W0) * (s / TOTAL)) / 2;

// offset control polygon: shift P_k along the normal at t = k/3
function offsetSeg(P, sign) {
  return [0, 1, 2, 3].map((k) => {
    const t = k / 3;
    const d = dbez(P, t), L = Math.hypot(d[0], d[1]);
    const n = [-d[1] / L, d[0] / L];
    const h = halfW(sAt(CENTRE.indexOf(P), t));
    return [P[k][0] + sign * n[0] * h, P[k][1] + sign * n[1] * h];
  });
}
const n2 = (v) => (Math.round(v * 100) / 100).toFixed(2).replace(/\.?0+$/, '') || '0';
const upper = CENTRE.map((P) => offsetSeg(P, 1));
const lower = CENTRE.map((P) => offsetSeg(P, -1));

// the path: up the face side, round the tip, back along the neck side, cap.
let d = `M ${n2(upper[0][0][0])} ${n2(upper[0][0][1])}`;
for (const Q of upper) d += ` C ${n2(Q[1][0])} ${n2(Q[1][1])} ${n2(Q[2][0])} ${n2(Q[2][1])} ${n2(Q[3][0])} ${n2(Q[3][1])}`;
const tipA = upper[3][3], tipB = lower[3][3];
const td = dbez(CENTRE[3], 1), tL = Math.hypot(td[0], td[1]);
const tu = [td[0] / tL, td[1] / tL], hT = halfW(TOTAL);
d += ` C ${n2(tipA[0] + tu[0] * hT * 0.7)} ${n2(tipA[1] + tu[1] * hT * 0.7)}`
  + ` ${n2(tipB[0] + tu[0] * hT * 0.7)} ${n2(tipB[1] + tu[1] * hT * 0.7)}`
  + ` ${n2(tipB[0])} ${n2(tipB[1])}`;
for (let i = 3; i >= 0; i--) {
  const Q = lower[i];
  d += ` C ${n2(Q[2][0])} ${n2(Q[2][1])} ${n2(Q[1][0])} ${n2(Q[1][1])} ${n2(Q[0][0])} ${n2(Q[0][1])}`;
}
d += ' Z';
console.log('PATH:\n' + d + '\n');
console.log(`centreline length ${TOTAL.toFixed(2)} local units; width ${(W0 * S).toFixed(2)} -> ${(W1 * S).toFixed(2)} viewBox`);

// ---- measure the emitted region back, perpendicular to the centreline
const poly = marks(`<svg><path d="${d}"/></svg>`)[0].pts;
const cpts = [];
for (const P of CENTRE) for (let i = 0; i <= 60; i++) cpts.push({ x: bez(P, i / 60)[0], y: bez(P, i / 60)[1] });
const W = walk(cpts, 0.5);
console.log('\n   s   target(vb)  drawn(vb)  err    inside HEAD?');
const B = await busted();
const head = marks(`<svg><path d="${B.headD}"/></svg>`)[0].pts;
let worstErr = 0, allIn = true, minGap = Infinity;
const shade = marks(`<svg><path d="${'M 14.2 23.2 C 12.6 25.2 10.6 26.4 8.4 27.1 C 5.6 27.9 2.8 28.6 1.7 29.3 C 0.9 28.5 -0.8 27.6 -2.6 26.8 C -4.6 25.8 -6.2 23.6 -6.6 21.4 C -6.9 19.6 -6.4 18 -5.6 17.2 C -3.2 18.4 -0.4 20 2.2 21.2 C 5.6 22 9.8 22.8 14.2 23.2 Z'}"/></svg>`)[0].pts;
for (let i = 0; i < W.length; i++) {
  const p = W[i], nx = -p.ty, ny = p.tx;
  let hi = 0, lo = 0;
  for (let t = 0; t < 4; t += 0.01) { if (inside(poly, p.x + nx * t, p.y + ny * t)) hi = t; else break; }
  for (let t = 0; t < 4; t += 0.01) { if (inside(poly, p.x - nx * t, p.y - ny * t)) lo = t; else break; }
  const drawn = (hi + lo) * S, target = 2 * halfW(p.s) * S;
  worstErr = Math.max(worstErr, Math.abs(drawn - target));
  const in1 = inside(head, p.x + nx * hi, p.y + ny * hi), in2 = inside(head, p.x - nx * lo, p.y - ny * lo);
  if (!in1 || !in2) allIn = false;
  // clearance from the region's lower edge to shade's boundary, straight down
  let gap = Infinity;
  for (let t = 0; t < 12; t += 0.05) if (inside(shade, p.x - nx * (lo + t), p.y - ny * (lo + t))) { gap = t; break; }
  minGap = Math.min(minGap, gap);
  if (Math.round(p.s * 2) % 8 === 0) {
    console.log(`${p.s.toFixed(1).padStart(5)}  ${target.toFixed(2).padStart(8)}  ${drawn.toFixed(2).padStart(8)}  `
      + `${(drawn - target).toFixed(2).padStart(6)}   ${in1 && in2 ? 'yes' : 'NO — SPILL'}   gap to shade ${gap === Infinity ? '>12' : gap.toFixed(2)}`);
  }
}
console.log(`\nworst |drawn - target| = ${worstErr.toFixed(3)} viewBox units over the whole length`);
console.log(`every sampled edge point inside the HEAD contour: ${allIn ? 'YES' : 'NO'}`);
console.log(`minimum clearance to the throat region: ${minGap === Infinity ? '>12' : minGap.toFixed(2)} local units`);
console.log(`\nwidth-variation ratio of the drawn mark = ${(W0 / W1).toFixed(3)} (a stroke is 1.000 by construction)`);
