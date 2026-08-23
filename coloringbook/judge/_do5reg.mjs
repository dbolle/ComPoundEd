// REGISTRATION — put every reference into HEAD.Roosevelt's OWN local frame, so
// a feature can be read in the units `src/art/coins.js` is written in.
//
// WHY A SEPARATE STEP. `OBVERSE.dime`'s s/cx/cy were fitted to ONE photograph
// (dime-obv-2.jpg). Any figure taken off a different reference and compared
// against a literal in the file is comparing two frames unless the frames are
// tied together first, and "the disc" does not tie them: the bust sits at a
// different scale inside the disc on every strike and every crop.
//
// THE TIE IS THE SILHOUETTE'S OWN EXTREMES — the three points on the device
// boundary that no threshold choice can move much:
//
//     crown      the minimum y of the bust
//     nose       the maximum x
//     back       the minimum x   (the widest point of the skull)
//
// A uniform-scale similarity (sx=sy, no rotation — the dies are struck upright
// and the discs are fitted, so rotation is not free) is solved from those three
// by least squares against the SAME three read off our own flattened HEAD path.
// The residual is printed: a reference whose three landmarks cannot be brought
// within a unit of ours is not registered and says so.
//
// This exports `frameFor(file)` for the feature instruments; run directly for
// the table.
//
// usage: node coloringbook/judge/_do5reg.mjs
import { join } from 'node:path';
import { ROOT } from './_paths.mjs';
import { POOL, samplerFor, samplerOurs } from './_dolib.mjs';

const RMASK = 38; // viewBox radius inside which the whole dime bust lies

/** device mask landmarks in viewBox units, from a sampler. */
export function landmarks(s, opts = {}) {
  const step = opts.step ?? 0.1;
  // field level: annulus 39.5..41.5, just inside the rim seat and outside the bust
  const ring = [];
  for (let a = 0; a < 360; a += 0.5) for (let r = 39.5; r <= 41.5; r += 0.5) {
    const q = s.at(50 + r * Math.cos((a * Math.PI) / 180), 50 + r * Math.sin((a * Math.PI) / 180));
    if (q != null) ring.push(q);
  }
  ring.sort((a, b) => a - b);
  const field = ring[ring.length >> 1];
  // device level: the cheek box, covered by the bust on every Roosevelt dime
  const dev = [];
  for (let x = 44; x <= 54; x += 0.25) for (let y = 42; y <= 52; y += 0.25) {
    const q = s.at(x, y);
    if (q != null) dev.push(q);
  }
  dev.sort((a, b) => a - b);
  const device = dev[dev.length >> 1];
  const up = device > field, T = (field + device) / 2;
  // THE BUST IS THE CONNECTED COMPONENT THAT CONTAINS THE CHEEK, and it has to
  // be found that way rather than by scanning: a ray walk from the left finds
  // LIBERTY, whose letters are device too, and reported the nose at the scan
  // bound on all nine files. `RMASK` alone cannot separate them — at y = 43 the
  // L of LIBERTY sits at r = 38.6.
  const N = Math.round((2 * RMASK) / step);
  const ix = (i) => 50 - RMASK + i * step;
  const grid = new Uint8Array(N * N);
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x = ix(i), y = ix(j);
    if (Math.hypot(x - 50, y - 50) > RMASK) continue;
    const q = s.at(x, y);
    if (q == null) continue;
    if (up ? q > T : q < T) grid[j * N + i] = 1;
  }
  // seed on the cheek, four-connected flood
  const seedI = Math.round((50 - (50 - RMASK)) / step), seedJ = Math.round((47 - (50 - RMASK)) / step);
  const comp = new Uint8Array(N * N);
  if (!grid[seedJ * N + seedI]) return { crown: null, nose: null, back: null, field, device, sep: Math.abs(device - field), up };
  const stack = [seedJ * N + seedI];
  comp[seedJ * N + seedI] = 1;
  while (stack.length) {
    const p = stack.pop(), i = p % N, j = (p / N) | 0;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const a = i + di, b = j + dj;
      if (a < 0 || b < 0 || a >= N || b >= N) continue;
      const q = b * N + a;
      if (grid[q] && !comp[q]) { comp[q] = 1; stack.push(q); }
    }
  }
  let crown = null, nose = null, back = null, area = 0;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    if (!comp[j * N + i]) continue;
    area++;
    const x = ix(i), y = ix(j);
    if (!crown || y < crown[1]) crown = [x, y];
    if (!nose || x < nose[0]) nose = [x, y];
    if (!back || x > back[0]) back = [x, y];
  }
  return { crown, nose, back, field, device, sep: Math.abs(device - field), up, area: area * step * step };
}

/** uniform-scale similarity mapping reference viewBox -> our local head units */
function fit(refPts, ourPts) {
  // ourPt = k * refPt + t  (k scalar, t 2-vector), least squares over 3 points
  const n = refPts.length;
  const mr = [0, 0], mo = [0, 0];
  for (let i = 0; i < n; i++) { mr[0] += refPts[i][0]; mr[1] += refPts[i][1]; mo[0] += ourPts[i][0]; mo[1] += ourPts[i][1]; }
  mr[0] /= n; mr[1] /= n; mo[0] /= n; mo[1] /= n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    const rx = refPts[i][0] - mr[0], ry = refPts[i][1] - mr[1];
    const ox = ourPts[i][0] - mo[0], oy = ourPts[i][1] - mo[1];
    num += rx * ox + ry * oy; den += rx * rx + ry * ry;
  }
  const k = num / den;
  const t = [mo[0] - k * mr[0], mo[1] - k * mr[1]];
  const res = refPts.map((p, i) => Math.hypot(k * p[0] + t[0] - ourPts[i][0], k * p[1] + t[1] - ourPts[i][1]));
  return { k, t, res, map: (x, y) => [k * x + t[0], k * y + t[1]] };
}

/** Our own local-frame landmarks, read off our own render the same way. */
let _ours = null;
export async function oursLandmarks() {
  if (_ours) return _ours;
  const s = await samplerOurs('dime', 'obverse', 1600);
  const L = landmarks(s);
  // our screen -> local:  local = ((screen - centre) / s) with dir=-1 on x
  const { OBVERSE } = await import(join(ROOT, 'src/art/coins.js'));
  const o = OBVERSE.dime;
  const toLocal = ([x, y]) => [((x - (50 + o.cx)) / (o.dir * o.s)), (y - o.cy) / o.s];
  _ours = {
    screen: L,
    local: { crown: toLocal(L.crown), nose: toLocal(L.nose), back: toLocal(L.back) },
    o,
  };
  return _ours;
}

/** frameFor(file) -> { toLocal(x,y), toView(lx,ly), k, res, lm } */
export async function frameFor(file) {
  const s = await samplerFor(file);
  const L = landmarks(s);
  if (!L.crown || !L.nose || !L.back) return null;
  const O = await oursLandmarks();
  const f = fit([L.crown, L.nose, L.back], [O.screen.crown, O.screen.nose, O.screen.back]);
  const o = O.o;
  return {
    file, sampler: s, lm: L, k: f.k, res: f.res,
    // reference viewBox -> our SCREEN viewBox -> our LOCAL head units
    toLocal: (x, y) => {
      const [sx, sy] = f.map(x, y);
      return [(sx - (50 + o.cx)) / (o.dir * o.s), (sy - o.cy) / o.s];
    },
    // our LOCAL head units -> reference viewBox
    toRef: (lx, ly) => {
      const sx = 50 + o.cx + o.dir * o.s * lx, sy = o.cy + o.s * ly;
      return [(sx - f.t[0]) / f.k, (sy - f.t[1]) / f.k];
    },
    // sample the reference at a point given in our LOCAL head units
    atLocal: (lx, ly) => {
      const sx = 50 + o.cx + o.dir * o.s * lx, sy = o.cy + o.s * ly;
      return s.at((sx - f.t[0]) / f.k, (sy - f.t[1]) / f.k);
    },
    // viewBox units of the reference per local unit
    perLocal: o.s / f.k,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const O = await oursLandmarks();
  console.log('OUR OWN silhouette extremes, read off a 1600px render the same way:');
  console.log('   screen  crown', O.screen.crown.map((v) => v.toFixed(2)).join(', '),
    '  nose', O.screen.nose.map((v) => v.toFixed(2)).join(', '),
    '  back', O.screen.back.map((v) => v.toFixed(2)).join(', '));
  console.log('   local   crown', O.local.crown.map((v) => v.toFixed(2)).join(', '),
    '  nose', O.local.nose.map((v) => v.toFixed(2)).join(', '),
    '  back', O.local.back.map((v) => v.toFixed(2)).join(', '));
  console.log('   (HEAD.Roosevelt declares crown y -31.73, nose x +24.87..25.12, back x -34.72)');
  console.log('\nREFERENCES — landmarks in each file\'s own disc frame, then the fit');
  console.log('   file                       sep  crown x,y       nose x,y        back x,y        k      resid (crown/nose/back)');
  for (const f of POOL) {
    const fr = await frameFor(f);
    if (!fr) { console.log('  ', f.padEnd(26), ' NO FIT'); continue; }
    const p = (a) => `${a[0].toFixed(1)},${a[1].toFixed(1)}`.padEnd(16);
    console.log(
      '  ', f.padEnd(26), String(Math.round(fr.lm.sep)).padStart(4), ' ',
      p(fr.lm.crown), p(fr.lm.nose), p(fr.lm.back),
      fr.k.toFixed(3).padStart(6),
      '  ' + fr.res.map((r) => r.toFixed(2)).join(' / '),
    );
  }
}
