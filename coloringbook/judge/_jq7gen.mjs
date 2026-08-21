// ROUND 7, QUARTER OBVERSE — the GENERATOR for the one stroke-to-region
// conversion the photographs support. Spec 4.3: "an image's reproducible
// artefact is its GENERATOR" — the same applies to a path. This file, not the
// path it prints, is the evidence.
//
// SUBJECT: `_jq7w.mjs` rank 13, the second queue fold,
//   <path d="M -17.6 16.2 q -0.8 3.6 -1.3 6.8" fill="none" stroke-width="1.6"/>
// the only one of 26 stroke-rendered marks on this face whose per-third width
// medians are separated by more than the between-reference IQR (see the round-7
// report for the other 25 and the numbers that leave them alone).
//
// MEASURED, `_jq7w.mjs`, three references, thirds, viewBox units:
//   quarter-obv-2.jpg        0.80  1.60  2.60   (26 of 28 stations, 2 at bound)
//   quarter-obv-1932ngc.jpg  0.80  2.80   -     (12 of 28, 16 at bound)
//   quarter-obv-4.jpg         -    0.40  1.30   (12 of 28, 16 at bound)
//   pooled q25-med-q75    0.65-0.80-1.15  0.55-1.60-2.80  1.60-2.50-2.65
// All three agree in SIGN: the fold widens downward. They disagree in magnitude
// by 7x in the middle third, so — round 4's rule — a STRAIGHT taper is all the
// data supports, and nothing finer. A straight 0.80 -> 2.50 predicts the middle
// third at 1.65 against a pooled median of 1.60.
//
// The instrument's own bias is subtracted: its response test recovers synthetic
// bands of 0.60 / 1.20 / 2.40 as 0.65 / 1.25 / 2.45, a flat +0.05 from the
// half-depth crossing on an antialiased edge. So 0.75 -> 2.45.
//
// AND THEN CLAMPED, which is the round-4 move (there, the cap corners were
// pulled back inside the HEAD contour; here it is the neighbouring folds). A
// 2.45-wide region at the bottom would MERGE with both neighbours, and that is
// also what the measurement is: at the bottom of the queue the four folds
// converge, so a perpendicular profile there is reading the whole tail's
// shadow, not this fold. Our own geometry sets the limit:
//   fold 15 (`M -19.6 17.0 ...`) ends 1.6 units away, drawn sw 1.5 -> half 0.75
//   fold 14 (`M -15.4 15.8 ...`) ends 1.9 units away, drawn sw 1.6 -> half 0.80
// Leaving round 4's own 0.15-unit clearance, and iterated against the actual
// closest approach (which is not at either path's endpoint), the bottom is
// drawn at 1.30 local, not the measured 2.50 — and BOTH numbers are reported.
// Worst clearance as generated: 0.150 to fold 15, 0.365 to fold 14.
//
// Run: node coloringbook/judge/_jq7gen.mjs
const n2 = (v) => (Math.round(v * 100) / 100).toFixed(2).replace(/\.?0+$/, '') || '0';

// the centreline as authored: M (-17.6,16.2) q (-0.8,3.6) (-1.3,6.8)
const P0 = { x: -17.6, y: 16.2 };
const C = { x: P0.x - 0.8, y: P0.y + 3.6 };
const P1 = { x: P0.x - 1.3, y: P0.y + 6.8 };
const at = (t) => ({
  x: (1 - t) * (1 - t) * P0.x + 2 * (1 - t) * t * C.x + t * t * P1.x,
  y: (1 - t) * (1 - t) * P0.y + 2 * (1 - t) * t * C.y + t * t * P1.y,
});
const tan = (t) => {
  const dx = 2 * (1 - t) * (C.x - P0.x) + 2 * t * (P1.x - C.x);
  const dy = 2 * (1 - t) * (C.y - P0.y) + 2 * t * (P1.y - C.y);
  const m = Math.hypot(dx, dy);
  return { x: dx / m, y: dy / m };
};
// LOCAL vs VIEWBOX. Every width above is in VIEWBOX units, because that is what
// `_jq7w.mjs` measures against a disc-normalised reference. This path is
// authored in the head's LOCAL frame, which the builder scales by s = 0.98
// (checked: rank 13's emitted polyline is 6.79 viewBox units long against a
// local path length of 6.93, ratio 0.980). So the measured 0.75 and 2.45
// viewBox become 0.77 and 2.50 local.
//
// CLEARANCE, iterated. 1.43 local (the full measured 2.50 clamped by the
// neighbour rule) left 0.10 units to fold 15 rather than round 4's 0.15,
// because the closest approach is not at either path's endpoint. 1.30 makes it.
const W0 = 0.77, W1 = 1.30;               // measured top, clamped bottom, LOCAL units
const half = (t) => (W0 + (W1 - W0) * t) / 2;

const N = 6;
const L = [], Rt = [];
for (let i = 0; i <= N; i++) {
  const t = i / N, p = at(t), u = tan(t), h = half(t);
  L.push({ x: p.x - u.y * h, y: p.y + u.x * h });
  Rt.push({ x: p.x + u.y * h, y: p.y - u.x * h });
}
// ROUND THE BOTTOM END rather than cutting it square: the coin's fold dies into
// the ribbon knot, it does not stop at a chisel edge, and a square cap on a
// 1.30-wide region reads as a bar at 190px.
//
// AND ROUND IT IN CAP SEGMENTS, which is a D7 correction to this generator's
// own first output. A single `Q` across the foot put TWO knots at 92.6 and 92.0
// degrees into the drawing — D7's gate is 0 knots over 75 — so the round-7 D6
// repair broke D7 by two knots on its first try. The cap turns through 180
// degrees whatever happens; splitting it over CAPN segments divides that turn,
// and at 5 segments the largest knot on the cap is 180/5 = 36 degrees, well
// inside the gate. Measured after the change: 0 knots over 75 on this path.
const CAPN = 5;
const cap = [];
{
  const c = at(1), u = tan(1), h = half(1);
  // sweep the outward normal from the LEFT edge round to the RIGHT edge,
  // bulging forward along the tangent by the same half-width, so the foot is a
  // semicircular cap of radius h centred on the centreline's own end point.
  for (let k = 1; k < CAPN; k++) {
    const a = Math.PI * (k / CAPN);
    // start direction is (-u.y, u.x) (the left offset), rotating toward (+u.y, -u.x)
    const nx = -u.y * Math.cos(a) + u.x * Math.sin(a);
    const ny = u.x * Math.cos(a) + u.y * Math.sin(a);
    cap.push({ x: c.x + nx * h, y: c.y + ny * h });
  }
}
const d = `M ${n2(L[0].x)} ${n2(L[0].y)}`
  + L.slice(1).map((p) => ` L ${n2(p.x)} ${n2(p.y)}`).join('')
  + cap.map((p) => ` L ${n2(p.x)} ${n2(p.y)}`).join('')
  + ` L ${n2(Rt[N].x)} ${n2(Rt[N].y)}`
  + Rt.slice(0, N).reverse().map((p) => ` L ${n2(p.x)} ${n2(p.y)}`).join('')
  + ' Z';

// D7 check on the generated outline itself, before it is pasted anywhere.
{
  const K = [...L, ...cap, Rt[N], ...Rt.slice(0, N).reverse()];
  let worst = 0, n = 0;
  for (let i = 1; i < K.length - 1; i++) {
    const a = K[i - 1], b = K[i], c2 = K[i + 1];
    let t = Math.atan2(c2.y - b.y, c2.x - b.x) - Math.atan2(b.y - a.y, b.x - a.x);
    while (t > Math.PI) t -= 2 * Math.PI;
    while (t < -Math.PI) t += 2 * Math.PI;
    const deg = Math.abs((t * 180) / Math.PI);
    if (deg > worst) worst = deg;
    if (deg > 75) n++;
  }
  console.log(`D7 on this outline: ${K.length} knots, worst turn ${worst.toFixed(1)} deg, ${n} over 75`);
}

console.log('centreline  M -17.6 16.2 q -0.8 3.6 -1.3 6.8   (drawn stroke-width 1.6, ratio 1.000)');
console.log(`widths      ${W0} at t=0 -> ${W1} at t=1 (local units), straight; width-variation ratio ${(W1 / W0).toFixed(3)}`);
console.log(`            measured, unclamped, would be ${W0} -> ${(2.45 / 0.98).toFixed(2)} = ratio ${(2.45 / 0.98 / W0).toFixed(3)}`);
console.log(`region      <path d="${d}" stroke="none"/>`);
console.log('');
console.log('station widths as generated (t, centre, half-width):');
for (let i = 0; i <= N; i++) {
  const t = i / N, p = at(t);
  console.log(`  t=${t.toFixed(2)}  (${p.x.toFixed(2)}, ${p.y.toFixed(2)})  half ${half(t).toFixed(3)}  full ${(2 * half(t)).toFixed(2)}`);
}
// clearance check against the two neighbouring folds, at their own drawn half-widths
const nb = [
  { name: 'fold 14  M -15.4 15.8 q -0.9 3.4 -1.6 6.6', P0: { x: -15.4, y: 15.8 }, C: { x: -16.3, y: 19.2 }, P1: { x: -17.0, y: 22.4 }, h: 0.80 },
  { name: 'fold 15  M -19.6 17.0 q -0.6 3.4 -0.9 6.4', P0: { x: -19.6, y: 17.0 }, C: { x: -20.2, y: 20.4 }, P1: { x: -20.5, y: 23.4 }, h: 0.75 },
];
console.log('\nclearance to the neighbouring folds (edge to edge, viewBox units):');
for (const b of nb) {
  let worst = Infinity, wt = 0;
  for (let i = 0; i <= 40; i++) {
    const t = i / 40, p = at(t);
    let dmin = Infinity;
    for (let j = 0; j <= 60; j++) {
      const s = j / 60;
      const qp = {
        x: (1 - s) * (1 - s) * b.P0.x + 2 * (1 - s) * s * b.C.x + s * s * b.P1.x,
        y: (1 - s) * (1 - s) * b.P0.y + 2 * (1 - s) * s * b.C.y + s * s * b.P1.y,
      };
      dmin = Math.min(dmin, Math.hypot(qp.x - p.x, qp.y - p.y));
    }
    const clear = dmin - half(t) - b.h;
    if (clear < worst) { worst = clear; wt = t; }
  }
  console.log(`  ${b.name}: worst clearance ${worst.toFixed(3)} at t=${wt.toFixed(2)}`);
}
