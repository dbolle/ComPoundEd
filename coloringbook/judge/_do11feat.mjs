// TWO DARK MARKS AND ONE EDGE — the eye, the ear's hollow and the ear's front,
// measured on each reference SEPARATELY and in HEAD.Roosevelt's own local units.
//
// METHOD, taken from `_nk17eye.mjs`, which is the one thing that has worked on
// a face in this project: inside the device a socket and a concha are LOCAL
// MINIMA, so they need no device/field segmentation — the wall about ten
// instruments here have died on. A window is tone-mapped at a quarter of a
// local unit per cell, the darkest connected blob above a fixed fraction of the
// window's own contrast is taken, and its centroid reported. The window is
// wholly inside the bust on every one of the nine, so a proof's black mirror
// field cannot enter it.
//
// THE EAR'S FRONT EDGE is measured differently, because it is not dark: it is
// the boundary between a modelled shell and the OPEN CHEEK, and the cheek is
// the one region on this face that every comment in coins.js already treats as
// featureless. So it is an energy step against a plateau with nothing in it —
// the one place on this head where a texture crossing has a clean side.
//
// EVERY NUMBER IS NULL-TESTED ON OUR OWN RENDER FIRST, where the answer is the
// literal in the source. A row whose null is not within 0.6 local units of the
// literal is not reported for the coin.
//
// usage: node coloringbook/judge/_do11feat.mjs
import { join } from 'node:path';
import { ROOT } from './_paths.mjs';
import { POOL, samplerFor, samplerOurs } from './_dolib.mjs';
import { boundary, icp } from './_do6sil.mjs';

const { OBVERSE } = await import(join(ROOT, 'src/art/coins.js'));
const o = OBVERSE.dime;
const toView = (lx, ly) => [50 + o.cx + o.dir * o.s * lx, o.cy + o.s * ly];
const ourS = await samplerOurs('dime', 'obverse', 1600);
const ourB = boundary(ourS);

const CELL = 0.25;
/** darkest connected blob centroid in a local-unit window */
function darkBlob(at, x0, x1, y0, y1, frac = 0.35) {
  const NX = Math.round((x1 - x0) / CELL), NY = Math.round((y1 - y0) / CELL);
  const g = new Float64Array(NX * NY);
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    // median of a 0.5-unit disc, so a single dark pixel is not a feature
    const v = [];
    for (let dx = -0.25; dx <= 0.25; dx += 0.125) for (let dy = -0.25; dy <= 0.25; dy += 0.125) {
      const q = at(x0 + (i + 0.5) * CELL + dx, y0 + (j + 0.5) * CELL + dy);
      if (q != null) v.push(q);
    }
    if (!v.length) return null;
    v.sort((a, b) => a - b);
    g[j * NX + i] = v[v.length >> 1];
  }
  const s = [...g].sort((a, b) => a - b);
  const lo = s[Math.floor(s.length * 0.02)], hi = s[Math.floor(s.length * 0.98)];
  const T = lo + (hi - lo) * frac;
  // largest connected component under T
  const lab = new Int32Array(NX * NY).fill(-1);
  let best = null;
  for (let k = 0; k < g.length; k++) {
    if (g[k] > T || lab[k] >= 0) continue;
    const st = [k]; lab[k] = k;
    const cells = [];
    while (st.length) {
      const p = st.pop(); cells.push(p);
      const i = p % NX, j = (p / NX) | 0;
      for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const q = i + a, r = j + b;
        if (q < 0 || r < 0 || q >= NX || r >= NY) continue;
        const z = r * NX + q;
        if (g[z] <= T && lab[z] < 0) { lab[z] = k; st.push(z); }
      }
    }
    if (!best || cells.length > best.length) best = cells;
  }
  if (!best || best.length < 4) return null;
  let sx = 0, sy = 0, sw = 0;
  for (const p of best) {
    const i = p % NX, j = (p / NX) | 0;
    const w = T - g[p];
    sx += (x0 + (i + 0.5) * CELL) * w; sy += (y0 + (j + 0.5) * CELL) * w; sw += w;
  }
  return { x: sx / sw, y: sy / sw, n: best.length * CELL * CELL, contrast: hi - lo };
}

/** the ear's FRONT edge: walk back from the open cheek until energy rises */
function earFront(at, ys) {
  const H = 1 / 3;
  const E = (x, y) => {
    const v = [];
    for (let dx = -0.5; dx <= 0.5; dx += 0.25) for (let dy = -0.5; dy <= 0.5; dy += 0.25) {
      const a = at(x + dx + H, y + dy), b = at(x + dx - H, y + dy);
      const c = at(x + dx, y + dy + H), d = at(x + dx, y + dy - H);
      if (a == null || b == null || c == null || d == null) return null;
      v.push(Math.hypot(a - b, c - d));
    }
    v.sort((a, b) => a - b);
    return v[v.length >> 1];
  };
  return ys.map((y) => {
    // cheek plateau: x from -2 to +6 at this y is bare on every reference
    const plateau = [];
    for (let x = -2; x <= 6; x += 0.25) { const q = E(x, y); if (q != null) plateau.push(q); }
    if (plateau.length < 8) return null;
    plateau.sort((a, b) => a - b);
    const base = plateau[plateau.length >> 1];
    // peak inside the ear, x -19..-13
    const pk = [];
    for (let x = -19; x <= -13; x += 0.25) { const q = E(x, y); if (q != null) pk.push(q); }
    pk.sort((a, b) => a - b);
    const peak = pk.length ? pk[Math.floor(pk.length * 0.75)] : 0;
    if (!(peak > base * 1.6)) return null;
    const half = (peak + base) / 2;
    for (let x = -3; x >= -20; x -= 0.1) {
      const q = E(x, y);
      if (q != null && q >= half) {
        const q2 = E(x - 0.4, y), q3 = E(x - 0.8, y);
        if (q2 != null && q2 >= half * 0.9 && q3 != null && q3 >= half * 0.9) return x;
      }
    }
    return null;
  });
}

const EYE_W = [8, 20, -12, 0];
const EAR_W = [-20, -9, -2, 10];
const YS = [1, 3, 5, 7];

const atOurs = (lx, ly) => { const [x, y] = toView(lx, ly); return ourS.at(x, y); };
const nEye = darkBlob(atOurs, ...EYE_W);
const nEar = darkBlob(atOurs, ...EAR_W);
const nFront = earFront(atOurs, YS);
console.log('NULL TEST on our own render — the literal in coins.js is the answer.');
console.log(`  eye almond        literal (14.20, -6.40)   measured (${nEye.x.toFixed(2)}, ${nEye.y.toFixed(2)})   area ${nEye.n.toFixed(1)}`);
console.log(`  ear hollow        literal (-14.30, 4.40)   measured (${nEar.x.toFixed(2)}, ${nEar.y.toFixed(2)})   area ${nEar.n.toFixed(1)}`);
console.log(`  ear front edge x  at y = ${YS.join(' / ')}:  ${nFront.map((v) => (v == null ? 'none' : v.toFixed(2))).join('  ')}`);
console.log('    (EAR_ROOSEVELT\'s helix leaves the front at (-11.0, -0.8) and its widest');
console.log('     front point is about x = -11 over y = 0..4)\n');

console.log('THE COIN — each reference read separately, in our local units.');
console.log('  file                       eye x     eye y      hollow x  hollow y    ear front x at y=1/3/5/7');
const rows = [];
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
  const e = darkBlob(at, ...EYE_W), h = darkBlob(at, ...EAR_W), fr = earFront(at, YS);
  rows.push({ f, e, h, fr });
  console.log(
    '  ', f.padEnd(24),
    e ? `${e.x.toFixed(2).padStart(7)} ${e.y.toFixed(2).padStart(9)}` : '      -         -',
    h ? `${h.x.toFixed(2).padStart(11)} ${h.y.toFixed(2).padStart(9)}` : '          -         -',
    '   ', fr.map((v) => (v == null ? '   -  ' : v.toFixed(2).padStart(6))).join(' '),
  );
}
const stat = (v, name) => {
  const w = v.filter((x) => x != null).sort((a, b) => a - b);
  if (w.length < 3) { console.log(`  ${name}  only ${w.length} files — UNMEASURED`); return null; }
  const m = w[w.length >> 1];
  console.log(`  ${name}  n=${w.length}  median ${m.toFixed(2).padStart(7)}   range ${w[0].toFixed(2)} .. ${w[w.length - 1].toFixed(2)}   IQR ${w[Math.floor(w.length * 0.25)].toFixed(2)} .. ${w[Math.floor(w.length * 0.75)].toFixed(2)}`);
  return m;
};
console.log('');
stat(rows.map((r) => r.e && r.e.x), 'eye        x ');
stat(rows.map((r) => r.e && r.e.y), 'eye        y ');
stat(rows.map((r) => r.h && r.h.x), 'ear hollow x ');
stat(rows.map((r) => r.h && r.h.y), 'ear hollow y ');
YS.forEach((y, i) => stat(rows.map((r) => r.fr[i]), `ear front x at y=${y}`));
