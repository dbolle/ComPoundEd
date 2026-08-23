// QUARTER OBVERSE — THE DIRECTION FIELD OF THE WIG, ours against the coin's.
//
// ⚠️ SUPERSEDED BY `_qo5field.mjs`, AND KEPT AS A RECORDED NON-ANSWER. This
// version runs the tensor on the RAW photograph. Its null tests pass, but on
// real coins it returns reference coherences of 0.05-0.58 and the three files
// disagree by up to 81 deg at the same point — at the strand scale the dominant
// signal in a raw patch is the FORM SHADING of the wig mass, not the strands.
// Its numbers are not evidence. _qo5field band-passes first and adds a null
// test (N3) built from exactly this confound. Read this file for what failed;
// read _qo5field for what the coin does.
//
// WHY. `RELIEF.Washington`'s own header claims a measured direction FIELD:
//   "In the SCREEN frame the coin runs
//      crown (-6,-18)  -7.3 deg      mid-mass (-14,-12)  +10.9 deg
//      back (-18.5,-3) +54.1 deg     over the curls (-8,2)  +20.5 deg
//    ... A single angle would draw a combed sheet; this is a field."
// and the round that measured this face reported, in its own commit message,
// "strand direction: 15.3 deg against a 15 deg gate — a MISS, reported".
// Nothing in the file says the marks were ever turned to match. This measures
// both sides in the same frame and prints them beside each other.
//
// ⚠️ THE TOOL THAT DID THIS BEFORE LIED. coins.js records it: "the strand
// tensor returned coherence 1.000 at 0 degrees and did not respond when the art
// changed". So this file runs THREE null tests BEFORE it reports anything, and
// exits non-zero if any fails:
//   N1  synthetic stripes at a known angle must come back at that angle
//   N2  a flat patch must come back with coherence ~0 (no direction)
//   N3  OUR OWN RENDER must come back at the angle the paths are authored at,
//       which is computed independently from the path data by _qo4marks.mjs
// A tensor that cannot recover a stripe it was handed cannot measure a coin.
//
// CONVENTION. Screen frame, degrees, 0 = +x (to the right), positive = DOWN
// (+y), i.e. the same convention `_jq42indep.azimuth` uses. Strand direction is
// modulo 180 and is reported in (-90, 90].
//
// Run: node coloringbook/judge/_qo3strand.mjs
import { STRUCK, disc, grey, atVB, ours, atVBours } from './_qo1zoom.mjs';

const D2R = Math.PI / 180;

/** structure tensor over a disc of radius `rad` viewBox units centred (X,Y).
 *  `sample(X,Y)` returns greyscale. Step is `h` viewBox units. */
export function tensor(sample, X, Y, rad, h = 0.12) {
  let Jxx = 0, Jxy = 0, Jyy = 0, n = 0;
  const step = rad / 14;
  for (let dy = -rad; dy <= rad + 1e-9; dy += step) {
    for (let dx = -rad; dx <= rad + 1e-9; dx += step) {
      if (dx * dx + dy * dy > rad * rad) continue;
      const x = X + dx, y = Y + dy;
      const gx = (sample(x + h, y) - sample(x - h, y)) / (2 * h);
      const gy = (sample(x, y + h) - sample(x, y - h)) / (2 * h);
      const w = Math.exp(-(dx * dx + dy * dy) / (2 * (rad / 2) ** 2));
      Jxx += w * gx * gx; Jxy += w * gx * gy; Jyy += w * gy * gy; n++;
    }
  }
  const tr = Jxx + Jyy, det = Jxx * Jyy - Jxy * Jxy;
  const disc_ = Math.sqrt(Math.max(0, tr * tr / 4 - det));
  const l1 = tr / 2 + disc_, l2 = tr / 2 - disc_;
  // direction of MAXIMUM gradient
  const gdir = 0.5 * Math.atan2(2 * Jxy, Jxx - Jyy) / D2R;
  // strands lie PERPENDICULAR to the gradient
  let s = gdir + 90; while (s > 90) s -= 180; while (s <= -90) s += 180;
  return { deg: +s.toFixed(1), coh: +(tr > 0 ? (l1 - l2) / (l1 + l2) : 0).toFixed(3), energy: +(tr / n).toFixed(4) };
}

// ── N1/N2: synthetic
function synth(angleDeg, amp = 60, period = 1.3) {
  const a = angleDeg * D2R, nx = -Math.sin(a), ny = Math.cos(a); // normal to the stripes
  return (X, Y) => 128 + amp * Math.sin(2 * Math.PI * (X * nx + Y * ny) / period);
}
console.log('=== NULL TESTS (nothing is reported unless all three pass) ===');
let bad = 0;
for (const want of [-60, -30, -7.3, 0, 10.9, 54.1, 80]) {
  const got = tensor(synth(want), 50, 50, 3);
  const err = Math.abs(((got.deg - want + 90) % 180 + 180) % 180 - 90);
  const ok = err < 1.0 && got.coh > 0.9;
  if (!ok) bad++;
  console.log(`  N1 stripes at ${String(want).padStart(6)} deg -> ${String(got.deg).padStart(6)} deg  coh ${got.coh}  ${ok ? 'ok' : '!! FAIL'}`);
}
{
  const flat = tensor(() => 137, 50, 50, 3);
  const ok = flat.coh < 0.05 || flat.energy < 1e-9;
  if (!ok) bad++;
  console.log(`  N2 flat field -> coh ${flat.coh} energy ${flat.energy}  ${ok ? 'ok (no direction invented)' : '!! FAIL'}`);
}

// ── the loci. coins.js's own four, converted from the head's LOCAL frame to
// the viewBox: OBVERSE.quarter is translate(50+cx, cy) scale(dir*s, s) with
// cx -0.4, cy 41.8, dir -1, s 0.98 — so X = 49.6 - 0.98*lx, Y = 41.8 + 0.98*ly.
const L2V = ([lx, ly]) => [+(49.6 - 0.98 * lx).toFixed(2), +(41.8 + 0.98 * ly).toFixed(2)];
const LOCI = [
  ['crown       (-6,-18)', [-6, -18], -7.3],
  ['mid-mass   (-14,-12)', [-14, -12], 10.9],
  ['back      (-18.5,-3)', [-18.5, -3], 54.1],
  ['over curls   (-8, 2)', [-8, 2], 20.5],
];

const o = await ours(1800);
const oursAt = (X, Y) => atVBours(o, X, Y);

// N3: our own render at a locus that sits on one authored mark, against the
// chord angle of that mark computed from the path data by _qo4marks.mjs.
{
  const { MARKS } = await import('./_qo4marks.mjs');
  const m = MARKS.find((k) => k.group.startsWith('lit') && k.i === 3);
  const mid = m.mid;
  const got = tensor(oursAt, mid[0], mid[1], 1.4);
  const err = Math.abs(((got.deg - m.deg + 90) % 180 + 180) % 180 - 90);
  const ok = err < 8;
  if (!ok) bad++;
  console.log(`  N3 our own base[0] at viewBox (${mid[0].toFixed(1)}, ${mid[1].toFixed(1)}): tensor ${got.deg} deg vs authored chord ${m.deg} deg  coh ${got.coh}  ${ok ? 'ok' : '!! FAIL'}`);
}
if (bad) { console.log(`\n!! ${bad} null tests failed — this instrument reports nothing.`); process.exit(1); }
console.log('  all null tests pass.\n');

console.log('=== STRAND DIRECTION, screen frame, deg (0 = +x, positive = DOWN) ===');
console.log('rad = 3.0 viewBox units; coherence in brackets; a coherence under ~0.25 is a non-answer\n');
const head = 'locus'.padEnd(22) + 'coins.js says' + '   OURS'.padEnd(18);
console.log(head + STRUCK.map((f) => f.replace('quarter-obv', 'q').replace(/\.(jpg|png)$/, '').padStart(16)).join(''));
const G = {}; const D = {};
for (const f of STRUCK) { D[f] = await disc(f); G[f] = await grey(f); }
for (const [name, loc, claimed] of LOCI) {
  const [X, Y] = L2V(loc);
  const mine = tensor(oursAt, X, Y, 3);
  let row = name.padEnd(22) + String(claimed).padStart(8) + '     ' + `${String(mine.deg).padStart(6)} [${mine.coh}]`.padEnd(18);
  for (const f of STRUCK) {
    const t = tensor((x, y) => atVB(G[f], D[f], x, y), X, Y, 3);
    row += `${String(t.deg).padStart(8)} [${t.coh}]`;
  }
  console.log(row);
}

console.log('\n=== the same, on a 3-unit grid over the wig (coin mean of the three refs) ===');
console.log('X, Y are viewBox; "ours" is the live render; refs are listed individually\n');
const pts = [];
for (let lx = -22; lx <= -2; lx += 4) for (let ly = -22; ly <= 6; ly += 4) pts.push([lx, ly]);
console.log('local(x,y)   viewBox(X,Y)      OURS        ' + STRUCK.map((f) => f.replace('quarter-obv', 'q').replace(/\.(jpg|png)$/, '').padStart(15)).join(''));
const diffs = [];
for (const p of pts) {
  const [X, Y] = L2V(p);
  const mine = tensor(oursAt, X, Y, 2.2);
  if (mine.coh < 0.20) continue;              // nothing of ours is there
  let row = `(${String(p[0]).padStart(4)},${String(p[1]).padStart(4)})  (${X.toFixed(1)},${Y.toFixed(1)})`.padEnd(27)
    + `${String(mine.deg).padStart(6)} [${mine.coh}]  `;
  const each = [];
  for (const f of STRUCK) {
    const t = tensor((x, y) => atVB(G[f], D[f], x, y), X, Y, 2.2);
    each.push(t);
    row += `${String(t.deg).padStart(7)} [${t.coh}]`;
  }
  const usable = each.filter((t) => t.coh >= 0.20);
  if (usable.length >= 2) {
    // circular mean modulo 180
    let sx = 0, sy = 0;
    for (const t of usable) { sx += Math.cos(2 * t.deg * D2R); sy += Math.sin(2 * t.deg * D2R); }
    const mean = 0.5 * Math.atan2(sy, sx) / D2R;
    const spread = usable.map((t) => Math.abs(((t.deg - mean + 90) % 180 + 180) % 180 - 90));
    let d = ((mine.deg - mean + 90) % 180 + 180) % 180 - 90;
    diffs.push({ p, X, Y, mine: mine.deg, mean: +mean.toFixed(1), d: +d.toFixed(1), n: usable.length, spread: +Math.max(...spread).toFixed(1) });
    row += `   coin mean ${mean.toFixed(1).padStart(6)} (n=${usable.length}, worst dev ${Math.max(...spread).toFixed(1)})  OURS-COIN ${d.toFixed(1).padStart(6)}`;
  }
  console.log(row);
}
if (diffs.length) {
  const abs = diffs.map((x) => Math.abs(x.d)).sort((a, b) => a - b);
  const signs = diffs.map((x) => Math.sign(x.d));
  console.log(`\n${diffs.length} cells where our art AND at least two references both have a direction.`);
  console.log(`  |ours - coin|  median ${abs[abs.length >> 1].toFixed(1)} deg   worst ${abs[abs.length - 1].toFixed(1)} deg`);
  console.log(`  sign: ${signs.filter((s) => s > 0).length} positive, ${signs.filter((s) => s < 0).length} negative`
    + '   (a consistent sign is a systematic rotation; mixed signs are a FIELD error, not an offset)');
}
