// R4 dime jaw — §14.2, "taper is measured, not eyeballed": the WIDTH of the
// jaw's dark run on the photograph, sampled perpendicular to the drawn path,
// in head-local units.
//
// METHOD, and every choice in it is forced by something already in the record:
//   · walk the jaw path at 0.5-unit arc-length steps;
//   · at each step cast a perpendicular ray +-HALF units and read greyscale by
//     bilinear interpolation;
//   · AVERAGE the profile over a +-TANG-unit window ALONG the path. The 2015-W
//     is a cameo proof and its frosted bust is pure high-frequency noise;
//     §13.2's move is to blur past the frost before quantising, and a tangential
//     average is that blur applied only in the direction that carries no
//     information about a boundary's width.
//   · the dark run is the FULL WIDTH AT HALF DEPTH: shoulders = the max of the
//     profile on each side of the trough within the window, depth = mean
//     shoulder - trough, and the width is the run through the trough where
//     grey < trough + depth/2.
//
// §4.1 NULL TEST: HALF is printed on every line, and a width that reaches
// 2*HALF (or a trough sitting at +-HALF) is printed as `BOUND`, never as a
// value. Widening HALF and watching the answer move is the tell.
// §4 RESPONSE TEST: SELFTEST=1 synthesises an image containing a dark band of
// KNOWN width in local units, at the jaw's own place and angle, and requires
// the instrument to recover it.
//
// Run: node coloringbook/judge/_jw4width.mjs [ref]
//      SELFTEST=1 node coloringbook/judge/_jw4width.mjs
import sharp from 'sharp';
import { busted, discFor, makeMap } from './_jw4reg.mjs';
import { marks } from './_jqgeom.mjs';

const REFDIR = new URL('../ref/', import.meta.url).pathname;
const HALF = Number(process.env.HALF || 7);      // perpendicular half-window, local units
const TANG = Number(process.env.TANG || 1.5);    // tangential average half-window
const STEP = 0.5;

export async function greyImg(path) {
  const { data, info } = await sharp(path).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
}
const bilin = (g, x, y) => {
  if (x < 0 || y < 0 || x > g.w - 2 || y > g.h - 2) return NaN;
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
  const i = y0 * g.w + x0;
  return (1 - fx) * (1 - fy) * g.d[i] + fx * (1 - fy) * g.d[i + 1]
    + (1 - fx) * fy * g.d[i + g.w] + fx * fy * g.d[i + g.w + 1];
};

// resample a flattened polyline to equal arc length, and give a unit tangent
export function walk(pts, step) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const total = cum[cum.length - 1];
  const out = [];
  let seg = 1;
  for (let s = 0; s <= total + 1e-9; s += step) {
    while (seg < pts.length - 1 && cum[seg] < s) seg++;
    const a = pts[seg - 1], b = pts[seg];
    const L = cum[seg] - cum[seg - 1] || 1;
    const t = (s - cum[seg - 1]) / L;
    out.push({ s, x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, tx: (b.x - a.x) / L, ty: (b.y - a.y) / L });
  }
  return out;
}

// point-in-polygon on the head contour, in the head's own local frame. The
// perpendicular ray at the chin end runs straight off the profile into the
// FIELD, and on the proof the field is black: without this mask the deepest
// thing in the window is the background and the instrument reports the
// SILHOUETTE, which is §4.3's wrong-feature failure with a plausible number.
export function inside(poly, x, y) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
}

// returns { width, depth, trough, off, bound } in local units
export function runAt(g, M, P, i, half = HALF, tang = TANG, poly = null, troughHalf = 3) {
  const p = P[i];
  const nx = -p.ty, ny = p.tx;
  const N = Math.round(half / 0.05);
  const prof = new Float64Array(2 * N + 1);
  const cnt = new Float64Array(2 * N + 1);
  const jmax = Math.round(tang / 0.25);
  for (let j = -jmax; j <= jmax; j++) {
    const q = { x: p.x + p.tx * j * 0.25, y: p.y + p.ty * j * 0.25 };
    for (let k = -N; k <= N; k++) {
      const t = k * 0.05;
      const lx = q.x + nx * t, ly = q.y + ny * t;
      if (poly && !inside(poly, lx, ly)) continue;
      const px = M.toPx(lx, ly);
      const v = bilin(g, px.px, px.py);
      if (!Number.isNaN(v)) { prof[k + N] += v; cnt[k + N]++; }
    }
  }
  const ok = [];
  for (let k = 0; k < prof.length; k++) { prof[k] = cnt[k] ? prof[k] / cnt[k] : NaN; if (cnt[k]) ok.push(k); }
  if (!ok.length) return { width: NaN, bound: true, clipped: true };
  const lo = ok[0], hi = ok[ok.length - 1];
  // trough: the minimum within +-troughHalf of the drawn path, not of the window
  let m = Infinity, mi = -1;
  const tl = Math.max(lo, N - Math.round(troughHalf / 0.05)), th = Math.min(hi, N + Math.round(troughHalf / 0.05));
  for (let k = tl; k <= th; k++) if (prof[k] < m) { m = prof[k]; mi = k; }
  let sl = -Infinity; for (let k = lo; k <= mi; k++) if (prof[k] > sl) sl = prof[k];
  let sr = -Infinity; for (let k = mi; k <= hi; k++) if (prof[k] > sr) sr = prof[k];
  const depth = (sl + sr) / 2 - m;
  const cut = m + depth / 2;
  let a = mi; while (a > lo && prof[a] < cut) a--;
  let b = mi; while (b < hi && prof[b] < cut) b++;
  const width = (b - a) * 0.05;
  const off = (mi - N) * 0.05;
  return { width, depth, trough: m, shoulderL: sl, shoulderR: sr, off,
    clipped: lo > 0 || hi < prof.length - 1,
    bound: a === lo || b === hi || Math.abs(off) >= troughHalf - 0.05, prof, N };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const B = await busted();
  const jawD = B.svg.match(/<path d="(M 19\.4 21\.4[^"]*)"/)?.[1]
    ?? B.svg.match(/<path d="(M 19\.4 21\.4[^"]*)"/)?.[1];
  const src = jawD || process.env.PATHD;
  const mk = marks(`<svg><path d="${src}"/></svg>`)[0];
  const P = walk(mk.pts, STEP);
  const total = P[P.length - 1].s;
  console.log(`jaw path: ${total.toFixed(2)} local units long, ${P.length} samples at ${STEP}`);
  console.log(`WINDOW (null test): perpendicular half-window HALF=${HALF} local units; `
    + `tangential average +-${TANG}. A width of ${2 * HALF} or an offset of +-${HALF} is the BOUND.`);

  if (process.env.SELFTEST) {
    // synthesise: white field, a dark band of known width laid exactly along the
    // jaw path, rendered into a 940x940 image with the SAME map as dime-obv-2.
    const disc = discFor('dime-obv-2.jpg');
    const M = makeMap(B, disc);
    for (const W of [1.0, 2.5, 4.0]) {
      const stroke = W * M.pxPerUnit;
      const pts = mk.pts.map((p) => M.toPx(p.x, p.y));
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="951" height="951">`
        + `<rect width="951" height="951" fill="#c8c8c8"/>`
        + `<polyline points="${pts.map((q) => `${q.px.toFixed(2)},${q.py.toFixed(2)}`).join(' ')}" `
        + `fill="none" stroke="#303030" stroke-width="${stroke.toFixed(2)}"/></svg>`;
      const buf = await sharp(Buffer.from(svg)).png().toBuffer();
      const g = await greyImg(buf);
      const res = [0.15, 0.5, 0.85].map((f) => runAt(g, M, P, Math.round(f * (P.length - 1)), HALF, TANG, null));
      console.log(`SELFTEST true width ${W.toFixed(2)} -> recovered `
        + res.map((r) => r.width.toFixed(2)).join(' / ')
        + `  (err ${res.map((r) => (r.width - W).toFixed(2)).join(' / ')})`
        + (res.some((r) => r.bound) ? '  BOUND' : ''));
    }
    process.exit(0);
  }

  const head = marks(`<svg><path d="${B.headD}"/></svg>`)[0].pts;
  const refs = process.argv[2] ? [process.argv[2]] : ['dime-obv-2.jpg', 'dime-obv-3.jpg', 'dime-obv.jpg'];
  const table = {};
  for (const ref of refs) {
    const disc = discFor(ref);
    const M = makeMap(B, disc);
    const g = await greyImg(REFDIR + ref);
    console.log(`\n=== ${ref}   ${M.pxPerUnit.toFixed(2)} px per local unit`);
    console.log('  s     local(x,y)        width  depth  trough  shoulders   offset');
    const rows = [];
    for (let i = 0; i < P.length; i += 4) {
      const r = runAt(g, M, P, i, HALF, TANG, head);
      rows.push({ s: P[i].s, x: P[i].x, y: P[i].y, ...r });
      console.log(`${P[i].s.toFixed(1).padStart(5)}  (${P[i].x.toFixed(1)},${P[i].y.toFixed(1)})`.padEnd(24)
        + `${r.width.toFixed(2).padStart(6)} ${r.depth.toFixed(1).padStart(6)} `
        + `${r.trough.toFixed(0).padStart(6)}  ${r.shoulderL.toFixed(0)}/${r.shoulderR.toFixed(0)}`.padEnd(14)
        + `${r.off.toFixed(2).padStart(6)}${r.bound ? '  BOUND' : ''}${r.clipped ? '  clip' : ''}`);
    }
    table[ref] = rows.map((r) => ({ s: +r.s.toFixed(1), w: +r.width.toFixed(2), d: +r.depth.toFixed(1), off: +r.off.toFixed(2), bound: r.bound }));
  }
  console.log('\n' + JSON.stringify(table));
}
