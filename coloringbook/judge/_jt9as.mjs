// R5 dime throat — AS-DRAWN geometry of RELIEF.Roosevelt's `dark` (the jaw
// region) and `shade` (the throat region), read in the SAME (s,t) frame the
// photograph is measured in by _jt9prof.mjs, plus the jaw-to-throat clearance.
//
// The two paths are lifted out of src/art/coins.js by SOURCE TEXT, not by a
// coordinate match, so the tool keeps working after the art moves. Both are
// authored in head-local units, which is the frame _jt9prof's axis lives in, so
// no transform is involved and nothing here can drift with registration.
//
// §4 RESPONSE TEST: SELFTEST=1 replaces `shade` with a rectangle whose top edge
// is a known distance below the axis and requires that distance back.
// §4.1 NULL TEST: the perpendicular ray is cast +-HALF units and a crossing at
// +-HALF is printed BOUND, never as a value. The clearance is bounded below by
// 0 (the polygons touch) and above by HALF.
//
// Run: node coloringbook/judge/_jt9as.mjs [pathToCoins.js]
import { readFileSync } from 'node:fs';
import { marks } from './_jqgeom.mjs';
import { axisWalk } from './_jt9prof.mjs';

const HALF = Number(process.env.HALF || 9);
const SRC = process.argv[2] || new URL('../../src/art/coins.js', import.meta.url).pathname;

// pull `key:` out of RELIEF.Roosevelt as a concatenation of string literals
export function relief(key, src = SRC) {
  const text = readFileSync(src, 'utf8');
  const r = text.indexOf('\n  Roosevelt: {');
  if (r < 0) throw new Error('RELIEF.Roosevelt not found');
  const end = text.indexOf('\n  },', r);
  const body = text.slice(r, end);
  const k = body.indexOf(`\n    ${key}:`);
  if (k < 0) throw new Error(`${key} not found in RELIEF.Roosevelt`);
  // the value runs to the first line ending in `,` that is not inside a literal
  const rest = body.slice(k + `\n    ${key}:`.length);
  // the value ends at the first comma that closes an indent-4 property. A
  // `[A-Za-z]` lookahead is not enough: every property in this object is
  // preceded by a comment block, so `shade:` ran on through `face:` and
  // `faceFine:` and returned four subpaths instead of one.
  const stop = rest.search(/,\n {4}(?=[A-Za-z/])/);
  const expr = rest.slice(0, stop < 0 ? rest.length : stop);
  // ONE literal per line, taken before the trailing `// comment`. A whole-block
  // regex is wrong here: `// UP the muscle's lit front edge` contains an
  // apostrophe, and a naive scan pairs it with the next line's opening quote
  // and swallows two lines of path data.
  const lits = [];
  for (const line of expr.split('\n')) {
    const m = line.match(/'((?:[^'\\]|\\.)*)'/);
    if (m) lits.push(m[1]);
  }
  if (!lits.length) throw new Error(`no string literals in ${key}`);
  return lits.join('');
}
export const pathsOf = (svgFrag) => [...svgFrag.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]);

// polygon crossings of the ray p + n*t, t in [-HALF, HALF]
function crossings(poly, p, nx, ny, half = HALF) {
  const ts = [];
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[j], b = poly[i];
    // solve a + u(b-a) = p + t n
    const ex = b.x - a.x, ey = b.y - a.y;
    const den = ex * ny - ey * nx;
    if (Math.abs(den) < 1e-12) continue;
    const rx = p.x - a.x, ry = p.y - a.y;
    const u = (rx * ny - ry * nx) / den;
    if (u < 0 || u > 1) continue;
    const t = Math.abs(nx) > Math.abs(ny) ? (a.x + u * ex - p.x) / nx : (a.y + u * ey - p.y) / ny;
    if (t >= -half && t <= half) ts.push(t);
  }
  return ts.sort((u, v) => u - v);
}

// min distance between two polygons, local units (segment-to-segment)
export function polyDist(A, B) {
  const seg = (p, a, b) => {
    const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1;
    let u = ((p.x - a.x) * dx + (p.y - a.y) * dy) / L2; u = Math.max(0, Math.min(1, u));
    return Math.hypot(p.x - (a.x + u * dx), p.y - (a.y + u * dy));
  };
  let best = Infinity, at = null;
  for (let i = 0; i < A.length; i++) {
    const a0 = A[i], a1 = A[(i + 1) % A.length];
    for (let j = 0; j < B.length; j++) {
      const b0 = B[j], b1 = B[(j + 1) % B.length];
      const d = Math.min(seg(a0, b0, b1), seg(a1, b0, b1), seg(b0, a0, a1), seg(b1, a0, a1));
      if (d < best) { best = d; at = { a: a0, b: b0 }; }
    }
  }
  return { d: best, at };
}

export function frame(src = SRC) {
  const jaw = marks(`<svg>${relief('dark', src)}</svg>`)[0].pts;
  const shd = pathsOf(relief('shade', src)).map((d) => marks(`<svg><path d="${d}"/></svg>`)[0].pts);
  return { jaw, shd };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const P = axisWalk(2);
  if (process.env.SELFTEST) {
    // a rectangle whose top edge is TOPAT below the axis at s=16
    for (const TOPAT of [-2, -3.5, -5]) {
      const p = P[8], nx = -p.ty, ny = p.tx;
      const q = (t, u) => ({ x: p.x + nx * t + p.tx * u, y: p.y + ny * t + p.ty * u });
      const rect = [q(TOPAT, -6), q(TOPAT, 6), q(TOPAT - 4, 6), q(TOPAT - 4, -6)];
      const ts = crossings(rect, p, nx, ny);
      console.log(`SELFTEST top edge at t=${TOPAT} -> crossings ${ts.map((t) => t.toFixed(3)).join(' ')}`
        + (ts.some((t) => Math.abs(Math.abs(t) - HALF) < 1e-6) ? '  BOUND' : ''));
    }
    process.exit(0);
  }
  const { jaw, shd } = frame();
  console.log(`source: ${SRC}`);
  console.log(`jaw region: ${jaw.length} pts;  shade: ${shd.length} subpath(s), ${shd.map((s) => s.length).join('+')} pts`);
  console.log(`NULL TEST: perpendicular cast +-${HALF} local units; a crossing at +-${HALF} is BOUND.`);
  console.log('\n   s   local(x,y)        jaw t[min..max]        shade t[min..max]      gap along t');
  for (let i = 0; i < P.length; i++) {
    const p = P[i], nx = -p.ty, ny = p.tx;
    const jt = crossings(jaw, p, nx, ny);
    const st = shd.flatMap((s) => crossings(s, p, nx, ny));
    const jl = jt.length ? `${jt[0].toFixed(2)}..${jt[jt.length - 1].toFixed(2)}` : '—';
    const sl = st.length ? `${st[0].toFixed(2)}..${st[st.length - 1].toFixed(2)}` : '—';
    const gap = jt.length && st.length ? (jt[0] - st[st.length - 1]) : NaN;
    console.log(`${p.s.toFixed(1).padStart(5)} (${p.x.toFixed(1)},${p.y.toFixed(1)})`.padEnd(22)
      + jl.padEnd(22) + sl.padEnd(22) + (Number.isNaN(gap) ? '—' : gap.toFixed(2)));
  }
  // CONTAINMENT IN THE HEAD. `shade` is a filled region, so a boundary point
  // outside the silhouette paints ink on bare field — the fault that put 25.1%
  // of the cent's lapel outside its coat and was invisible to IoU. The scan
  // walks the region's own boundary, so 0 is an answer and not a search bound.
  {
    const { busted } = await import('./_jw4reg.mjs');
    const { inside } = await import('./_jw4width.mjs');
    const B = await busted();
    const head = marks(`<svg><path d="${B.headD}"/></svg>`)[0].pts;
    let out = 0, worst = 0, n = 0;
    for (const sp of shd) for (const p of sp) {
      n++;
      if (inside(head, p.x, p.y)) continue;
      out++;
      let d = Infinity;
      for (let i = 0, j = head.length - 1; i < head.length; j = i++) {
        const a = head[j], b = head[i], dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1;
        let u = ((p.x - a.x) * dx + (p.y - a.y) * dy) / L2; u = Math.max(0, Math.min(1, u));
        d = Math.min(d, Math.hypot(p.x - (a.x + u * dx), p.y - (a.y + u * dy)));
      }
      worst = Math.max(worst, d);
    }
    console.log(`\nCONTAINMENT of \`shade\` in the HEAD contour: ${out} of ${n} boundary points outside`
      + `  (worst overhang ${worst.toFixed(3)} local units)`);
  }
  const all = shd.flat();
  const { d, at } = polyDist(jaw, all);
  console.log(`\nMIN EUCLIDEAN CLEARANCE jaw region -> shade region: ${d.toFixed(4)} local units`);
  console.log(`  nearest jaw pt (${at.a.x.toFixed(2)}, ${at.a.y.toFixed(2)})  nearest shade pt (${at.b.x.toFixed(2)}, ${at.b.y.toFixed(2)})`);
  const bb = (pts) => `x ${Math.min(...pts.map((p) => p.x)).toFixed(2)}..${Math.max(...pts.map((p) => p.x)).toFixed(2)}  y ${Math.min(...pts.map((p) => p.y)).toFixed(2)}..${Math.max(...pts.map((p) => p.y)).toFixed(2)}`;
  console.log(`  jaw bbox   ${bb(jaw)}`);
  console.log(`  shade bbox ${bb(all)}`);
}
