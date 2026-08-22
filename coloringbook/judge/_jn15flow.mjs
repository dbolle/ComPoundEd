// _jn15flow — turn the measured strand-direction field into COURSES.
//
// _jn15strand.mjs says which way the hair runs at 66 places on the photograph.
// A ridge has to be a curve, not an angle, so this integrates streamlines
// through that field: seed on the hairline, step backwards along the local
// direction, stop at the frozen silhouette or when the field runs out.
//
// The field is smoothed with an inverse-distance kernel over the DIRECTION
// DOUBLED (2*theta), which is the standard way to average an undirected
// orientation — averaging theta itself puts +80 and -80 at 0 instead of at 90.
//
// NULL TEST: every streamline prints the reason it stopped. A line that stops
// because it hit the step budget is a failure report, not a course.
// RESPONSE TEST: SEEDSHIFT=<n> moves every seed n units along the hairline; the
// courses must move with them and must not change shape.
//
// Run: node coloringbook/judge/_jn15flow.mjs
import { dOutline, dHair } from './_jn15locus.mjs';

// THE MEASURED FIELD — pasted from _jn15strand.mjs's run on
// nickel-obv-unc2004.jpg at RAD=3, coherence floor 0.15, both screens applied.
// Only samples that survived both screens are here. This is a transcription of
// an instrument's output, and the instrument is re-runnable: the check is
// `node coloringbook/judge/_jn15strand.mjs nickel-obv-unc2004.jpg`.
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

const SIG = 5.0; // inverse-distance kernel width, local units
function dirAt(x, y) {
  let sx = 0, sy = 0, wsum = 0;
  for (const [fx, fy, a] of F) {
    const d2 = (x - fx) ** 2 + (y - fy) ** 2;
    const w = Math.exp(-d2 / (2 * SIG * SIG));
    const t = 2 * a * Math.PI / 180;
    sx += w * Math.cos(t); sy += w * Math.sin(t); wsum += w;
  }
  if (wsum < 1e-9) return null;
  const th = Math.atan2(sy / wsum, sx / wsum) / 2;
  const coh = Math.hypot(sx, sy) / wsum;
  return [Math.cos(th), Math.sin(th), coh];
}

// SEEDS ARE GENERATED FROM THE HAIRLINE, not hand-placed: walk the frozen
// hairline polyline at a fixed arc-length spacing and step INWARD along its own
// normal by OFFSET local units. That keeps every ridge the same distance behind
// the hairline, which is what the photograph shows and what a hand-placed seed
// set cannot promise.
import { HAIRLINE } from './_jn15locus.mjs';
const OFFSET = +(process.env.OFFSET || 2.6);
const SPACING = +(process.env.SPACING || 4.6);
const SHIFT = +(process.env.SEEDSHIFT || 0);
function seedsFromHairline() {
  const out = [];
  let acc = 0, next = 3.0 + SHIFT;
  for (let i = 0; i + 1 < HAIRLINE.length; i++) {
    const [ax, ay] = HAIRLINE[i], [bx, by] = HAIRLINE[i + 1];
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
    while (next <= acc + L) {
      const t = (next - acc) / L;
      const px = ax + t * dx, py = ay + t * dy;
      // inward normal: the one that decreases x (into the wig)
      let nx = dy / L, ny = -dx / L;
      if (nx > 0) { nx = -nx; ny = -ny; }
      out.push([+(px + OFFSET * nx).toFixed(2), +(py + OFFSET * ny).toFixed(2)]);
      next += SPACING;
    }
    acc += L;
  }
  return out;
}
const SEEDS = process.env.SEEDS
  ? process.env.SEEDS.split(' ').map((s) => s.split(',').map(Number))
  : seedsFromHairline();
const STEP = 0.5, MAXSTEP = 200;
const XSTOP = +(process.env.XSTOP || -22), YSTOP = +(process.env.YSTOP || 0);

console.log(`field: ${F.length} measured samples, kernel sigma ${SIG} local units (orientation averaged as 2*theta)`);
console.log(`seeds: ${SEEDS.length}   step ${STEP}   budget ${MAXSTEP}   SEEDSHIFT ${SHIFT}`);
for (const [sx0, sy0] of SEEDS) {
  let x = sx0, y = sy0;
  const pts = [[x, y]];
  let stop = 'STEP BUDGET EXHAUSTED — this is a failure report, not a course';
  for (let i = 0; i < MAXSTEP; i++) {
    const d = dirAt(x, y);
    if (!d) { stop = 'field ran out'; break; }
    // walk BACKWARD along the strand: local -x
    let [ux, uy] = d;
    if (ux > 0) { ux = -ux; uy = -uy; }
    // RK2
    const mx = x + ux * STEP / 2, my = y + uy * STEP / 2;
    const d2 = dirAt(mx, my);
    let [vx, vy] = d2 || [ux, uy];
    if (vx > 0) { vx = -vx; vy = -vy; }
    x += vx * STEP; y += vy * STEP;
    pts.push([x, y]);
    if (dOutline(x, y) < 2.2) { stop = `reached the silhouette (d(edge) ${dOutline(x, y).toFixed(2)})`; break; }
    if (x < XSTOP) { stop = `reached x = ${XSTOP}, the front edge of the EXISTING ridge family`; break; }
    if (y > YSTOP) { stop = `reached y = ${YSTOP}, the top of the curl cluster`; break; }
  }
  const last = pts[pts.length - 1];
  const q = pts.filter((_, i) => i % Math.max(1, Math.round((pts.length - 1) / 4)) === 0);
  if (q[q.length - 1] !== last) q.push(last);
  console.log(`\nseed (${sx0}, ${sy0})  d(hair) ${dHair(sx0, sy0).toFixed(2)}   ${pts.length - 1} steps -> ${stop}`);
  console.log('   course: ' + q.map(([a, b]) => `(${a.toFixed(2)}, ${b.toFixed(2)})`).join(' '));
}
