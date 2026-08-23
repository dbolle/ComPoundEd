// THE HAIRLINE — the one interior division on this face that has never been
// measured, laddered on nine photographs.
//
// WHAT IT IS. `HAIR.Roosevelt` is two chains: the head's own knots run
// backwards (so the outer edge cannot drift) and a RETURN RUN which is the
// hairline, the sideburn, the sweep over the ear and the nape. The return run
// is written in one-decimal round numbers — (-22, 1.6), (-16.5, -0.6),
// (0.8, -15.1) — and the comment beside it argues its SHAPE ("a hairline
// running diagonally back from a high forehead ... a SIDEBURN ... the mass
// carries on to the NAPE") without a single coordinate taken off a photograph.
// The nickel's hairline was in the same state and was found to leave three of
// its own four frozen wig patches at 0.0% coverage.
//
// HOW IT IS MEASURED. Hair against face is device against device: no level
// threshold separates them and ~10 instruments in this project have died
// trying. But the die CUTS the hair and leaves the forehead smooth, so the
// discriminator is TEXTURE, not level — and it is polarity-free, so a cameo
// proof and a business strike can be pooled.
//
//   · at stations along our own drawn hairline, a RUNG is taken along the
//     local normal, +t into the hair, -t onto the face;
//   · energy E(t) is the median |grad I| in a 1.4-unit disc at that point,
//     with the gradient step fixed at 1/3 of a LOCAL unit on every file so a
//     960px photograph and a 320px one are differentiated at the same scale;
//   · the hair plateau is the median of E over t in [+3, +7], the face plateau
//     the median over t in [-7, -3], and the boundary is the half-way crossing
//     between them, found from the hair side outward.
//
// THE INSTRUMENT REFUSES ITSELF when it cannot see a step: if the hair plateau
// is under 1.35x the face plateau at a station, that station reports NO STEP
// and is dropped rather than contributing a number. Every drop is printed.
//
// NULL TEST. The same ladder is run on OUR OWN render first, where the answer
// is known to be 0 by construction. Our hair mass is a flat fill with grooves
// in it, so it has texture where the face has none, and the ladder must return
// ~0 at every station or it is not measuring what it claims.
//
// usage: node coloringbook/judge/_do9hairline.mjs
import { join } from 'node:path';
import { ROOT } from './_paths.mjs';
import { POOL, samplerFor, samplerOurs } from './_dolib.mjs';
import { boundary, icp } from './_do6sil.mjs';

const { OBVERSE } = await import(join(ROOT, 'src/art/coins.js'));
const o = OBVERSE.dime;
const toView = (lx, ly) => [50 + o.cx + o.dir * o.s * lx, o.cy + o.s * ly];

// Stations ON OUR DRAWN HAIRLINE, from the nape forward and up over the brow.
// Each is [x, y, nx, ny] where (nx, ny) is the unit normal pointing INTO the
// hair, taken from the drawn path's own local tangent.
const RUN = [
  [-30.93, 6.44], [-28.5, 4.6], [-26.5, 3.7], [-24, 2.5], [-22, 1.6], [-20, 0.7],
  [-18.1, -0.1], [-16.5, -0.6], [-14.9, -1.1], [-13.6, -1.6], [-12.2, -1.7],
  [-11.2, -1.4], [-10.2, -0.8], [-9.4, 0.4], [-8.9, 1.1], [-8.5, 1.4], [-8.2, 1.2],
  [-7.9, 0.6], [-7.4, -0.2], [-7, -0.9], [-6.3, -1.2], [-5.6, -2], [-4.9, -2.9],
  [-4.2, -3.8], [-3.5, -5.3], [-2.9, -6.6], [-2.3, -7.9], [-1.9, -9.3], [-1.3, -10.7],
  [-0.7, -12.1], [0.1, -13.5], [0.8, -15.1], [1.6, -16.6], [2.3, -18.4], [3.2, -20],
  [4.1, -21.6], [5, -23.5], [6.1, -24.9], [7.2, -26.3], [9.3, -27.8], [10.37, -28.04],
];
// Named stations: the ones a reader can find on the coin. Skip the two ends
// (the nape corner and the closure) — both are splices, not free boundary.
const PICK = [
  ['nape        ', 2], ['back-low    ', 5], ['over ear    ', 9],
  ['sideburn tip', 15], ['temple      ', 21], ['upper temple', 25],
  ['brow        ', 29], ['mid forehead', 33], ['high forehead', 37],
];

function normals() {
  return RUN.map((p, i) => {
    const a = RUN[Math.max(0, i - 1)], b = RUN[Math.min(RUN.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const L = Math.hypot(tx, ty); tx /= L; ty /= L;
    // The hair lies to the LEFT of the run as written (nape -> forehead), which
    // in this frame (y down) is the normal (ty, -tx). Verified by the null test.
    return [p[0], p[1], ty, -tx];
  });
}
const NRM = normals();

function ladder(at, label) {
  const H = 1 / 3;
  const E = (x, y) => {
    const v = [];
    for (let dx = -0.7; dx <= 0.7; dx += 0.35) for (let dy = -0.7; dy <= 0.7; dy += 0.35) {
      if (Math.hypot(dx, dy) > 0.7) continue;
      const a = at(x + dx + H, y + dy), b = at(x + dx - H, y + dy);
      const c = at(x + dx, y + dy + H), d = at(x + dx, y + dy - H);
      if (a == null || b == null || c == null || d == null) return null;
      v.push(Math.hypot(a - b, c - d));
    }
    if (!v.length) return null;
    v.sort((p, q) => p - q);
    return v[v.length >> 1];
  };
  const out = [];
  for (const [name, i] of PICK) {
    const [x, y, nx, ny] = NRM[i];
    const prof = [];
    for (let t = -8; t <= 8; t += 0.25) prof.push([t, E(x + nx * t, y + ny * t)]);
    if (prof.some(([, v]) => v == null)) { out.push({ name, d: null, why: 'off frame' }); continue; }
    const band = (lo, hi) => {
      const v = prof.filter(([t]) => t >= lo && t <= hi).map(([, q]) => q).sort((a, b) => a - b);
      return v[v.length >> 1];
    };
    const hair = band(3, 7), face = band(-7, -3);
    if (!(hair > face * 1.35)) { out.push({ name, d: null, why: `no step (hair ${hair.toFixed(1)} vs face ${face.toFixed(1)})` }); continue; }
    const half = (hair + face) / 2;
    // walk OUT from the hair side; the crossing is the last t (going down) at
    // which E is still above `half` for two consecutive samples
    let cross = null;
    for (let k = prof.length - 1; k >= 1; k--) {
      const [t, v] = prof[k];
      if (t > 5) continue;
      if (v >= half && prof[k - 1][1] < half) { cross = t - 0.25 * (v - half) / Math.max(1e-6, v - prof[k - 1][1]); }
    }
    out.push({ name, d: cross, hair, face });
  }
  return out;
}

// ── NULL TEST on our own art ─────────────────────────────────────────────
const ourS = await samplerOurs('dime', 'obverse', 1600);
const ourB = boundary(ourS);
const nullRun = ladder((lx, ly) => { const [x, y] = toView(lx, ly); return ourS.at(x, y); });
console.log('NULL TEST — the same ladder on OUR OWN render. The answer is 0 by construction.');
console.log('  station        offset   hairE  faceE   note');
for (const r of nullRun) {
  console.log('  ', r.name.padEnd(14), (r.d == null ? '   -  ' : r.d.toFixed(2).padStart(6)),
    r.hair ? `${r.hair.toFixed(1).padStart(6)} ${r.face.toFixed(1).padStart(6)}` : '             ', r.why || '');
}
const nz = nullRun.filter((r) => r.d != null).map((r) => r.d);
console.log(`  null mean ${(nz.reduce((a, b) => a + b, 0) / nz.length).toFixed(2)}  max |.| ${Math.max(...nz.map(Math.abs)).toFixed(2)}  over ${nz.length}/${PICK.length} stations\n`);

// ── the pool ─────────────────────────────────────────────────────────────
console.log('THE COIN — signed offset of the hairline from where WE draw it, local units.');
console.log('  POSITIVE = the coin\'s hair reaches FURTHER onto the face than ours does');
console.log('  (i.e. our bare forehead/temple is too big there).\n');
const cols = PICK.map(([n]) => n.trim());
process.stdout.write('  file                    ');
for (const c of cols) process.stdout.write(c.slice(0, 8).padStart(10));
process.stdout.write('\n');
const table = [];
for (const f of POOL) {
  const s = await samplerFor(f);
  const B = boundary(s);
  if (!B) continue;
  const fit = icp(ourB.pts, B.pts);
  const c = Math.cos(fit.th), si = Math.sin(fit.th);
  const at = (lx, ly) => {
    const [x, y] = toView(lx, ly);
    return s.at(fit.k * (c * x - si * y) + fit.t[0], fit.k * (si * x + c * y) + fit.t[1]);
  };
  const r = ladder(at);
  table.push({ f, r });
  process.stdout.write('  ' + f.padEnd(24));
  for (const q of r) process.stdout.write((q.d == null ? '-' : q.d.toFixed(2)).padStart(10));
  process.stdout.write('\n');
}
console.log('');
PICK.forEach(([name], i) => {
  const v = table.map((t) => t.r[i].d).filter((x) => x != null).sort((a, b) => a - b);
  if (v.length < 3) {
    const why = table.map((t) => t.r[i].why).filter(Boolean);
    console.log(`  ${name}  only ${v.length} files returned a crossing — UNMEASURED. (${why[0] || ''})`);
    return;
  }
  const med = v[v.length >> 1];
  const q1 = v[Math.floor(v.length * 0.25)], q3 = v[Math.floor(v.length * 0.75)];
  const sign = v.every((x) => x > 0.5) ? 'ALL POSITIVE' : v.every((x) => x < -0.5) ? 'ALL NEGATIVE' : 'sign disagrees';
  console.log(`  ${name}  n=${String(v.length).padStart(2)}  median ${med.toFixed(2).padStart(6)}   IQR ${q1.toFixed(2)} .. ${q3.toFixed(2)}   range ${v[0].toFixed(2)} .. ${v[v.length - 1].toFixed(2)}   ${sign}`);
});
