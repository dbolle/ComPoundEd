// BUCK r14 (specialist) — OUR eagle, measured in the SAME roundel-relative
// terms `_je14anat.mjs` measures the photograph in, off the SVG the app
// actually emits, at every tier, and split into `struck()`'s mass copies and
// its bevel copy.
//
// The comparison this makes possible is the whole point: a fraction-of-roundel
// figure for ours and for the note that came out of the same definition. The
// note's side of it is frozen in `_je14anat.mjs` and NOTHING here can move it
// (§6.1); this file only reads `coins.js`.
//
//   node coloringbook/judge/_je14ours.mjs [before.js]
import { marks } from './_jqgeom.mjs';
const mod = await import('../../src/art/coins.js');

const EAG = { cx: 76.875, cy: 27.75, rx: 8.875, ry: 12.375 };   // frozen `_jb4target.json`
const SIZES = { icon: 38, mid: 54, full: 190 };
// THE TARGET, from `_je14anat.mjs`, restated as literals. Target-side only.
// `height` and `centreDy` are DERIVED from the tip and tail rows rather than
// taken from `_je14anat.mjs`'s own height row: that row takes
// min(tipLY, tipRY) per file, and on `bill-rev.jpg` the left wing's component
// leaks into the background (its k-sweep moves the left tip 2.4 units where
// the right moves 0.7, and its profile is non-monotonic), so its minimum is
// 1.7 units above its own right tip. Built from the two-sided means instead,
// height = (0.8928 + 0.5112)/2 = 0.7020 and centre = (0.8928 - 0.5112)/2 =
// 0.1908. `_je14anat.mjs`'s 0.7252 / 0.1676 are the same quantity carrying
// that leak, and both are reported.
const T = {
  span: 0.8242, height: 0.7020, centreDy: 0.1908,
  tipDx: 0.8242, tipDy: -0.5112, wingBotDy: 0.3636, wingAngle: 70.2,
  headTopDy: -0.2497, shieldTopDy: 0.0504, shieldBotDy: 0.5799, tailBotDy: 0.8928,
};

function eagleMarks(svg, only) {
  return marks(svg).filter((m) => (m.el === 'path' || m.el === 'circle'))
    .filter((m) => Math.abs((m.bbox.x0 + m.bbox.x1) / 2 - EAG.cx) < 26)
    .filter((m) => (only === 'all' ? true : only === 'bevel' ? m.fill === '#ffffff' : m.fill !== '#ffffff'));
}

export function measure(svg, only = 'mass') {
  const M = eagleMarks(svg, only);
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, topAtX = 0, tip = null;
  const pts = [];
  for (const m of M) for (const p of m.pts) {
    pts.push(p);
    if (p.x < x0) x0 = p.x;
    if (p.x > x1) x1 = p.x;
    if (p.y < y0) { y0 = p.y; topAtX = p.x; }
    if (p.y > y1) y1 = p.y;
  }
  if (!pts.length) return null;
  // the LEFT wingtip: the leftmost point, and where it sits vertically
  let L = pts[0], R = pts[0];
  for (const p of pts) { if (p.x < L.x) L = p; if (p.x > R.x) R = p; }
  // OUTER-EDGE ANGLE, over the LEFT ENVELOPE. Iteration 2 caught this
  // measuring the wrong feature: the first version fitted every point within
  // 35% of the bbox width of the left edge, which on a crescent picks up the
  // INNER edge as well, and pulling the inner edge inboard moved the reported
  // angle 70.1 -> 75.7 with the outer edge byte-identical. §4.3, on my own
  // instrument. What it fits now is min-x per 0.25-unit y slice, which is
  // exactly the x0(Y) `_je14bird.mjs` fits on the photograph.
  // The envelope is INTERPOLATED ALONG SEGMENTS, not taken as min over the
  // flattened vertices. Binning vertices was tried first and was wrong: the
  // flattener's samples are irregular, so a bin can hold an inner-edge vertex
  // and no outer-edge vertex, and the icon's inner edge and head then appear
  // in the fit (69.83, 70.37, 69.87, 70.93, 70.02 ... alternating between the
  // two edges). It reported 65.2 deg for a wing whose chord is 70.9.
  const SL = 0.2;
  const edge = [];
  for (let Y = L.y + SL; Y < L.y + 0.5 * (y1 - y0); Y += SL) {
    let best = Infinity;
    for (const m of M) for (let i = 1; i < m.pts.length; i++) {
      const a = m.pts[i - 1], b = m.pts[i];
      if ((a.y - Y) * (b.y - Y) > 0 || a.y === b.y) continue;
      const x = a.x + (b.x - a.x) * (Y - a.y) / (b.y - a.y);
      if (x < best) best = x;
    }
    if (best < Infinity) edge.push({ x: best, y: Y });
  }
  let ang = NaN;
  if (edge.length > 3) {
    let sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (const p of edge) { sx += p.y; sy += p.x; sxx += p.y * p.y; sxy += p.y * p.x; }
    const n = edge.length, slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    ang = Math.atan2(1, Math.abs(slope)) * 180 / Math.PI;
  }
  return { x0, x1, y0, y1, topAtX, L, R, ang, n: M.length,
    span: (x1 - x0) / (2 * EAG.rx), height: (y1 - y0) / (2 * EAG.ry),
    centreDy: ((y0 + y1) / 2 - EAG.cy) / EAG.ry,
    tipDx: (EAG.cx - L.x) / EAG.rx, tipDxR: (R.x - EAG.cx) / EAG.rx,
    tipDy: (L.y - EAG.cy) / EAG.ry, topDy: (y0 - EAG.cy) / EAG.ry, botDy: (y1 - EAG.cy) / EAG.ry };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const runs = [['working tree', mod]];
  if (process.argv[2]) runs.push([process.argv[2], await import(process.argv[2])]);
  for (const [label, m] of runs) {
    console.log(`\n=== ${label} ===`);
    console.log('tier copies  bbox X            bbox Y            span/W  height/H  centreDy  tipDx L/R  tipDy   topDy   botDy   outer angle  paths');
    for (const [tier, size] of Object.entries(SIZES)) for (const only of ['mass', 'bevel']) {
      const r = measure(m.coinSVG('buck', size, { side: 'reverse', value: false }), only);
      if (!r) { console.log(`${tier} ${only}: no marks`); continue; }
      console.log(`${tier.padEnd(5)}${only.padEnd(7)} ${r.x0.toFixed(2)}..${r.x1.toFixed(2)}   ${r.y0.toFixed(2)}..${r.y1.toFixed(2)}   ` +
        `${r.span.toFixed(4)}  ${r.height.toFixed(4)}   ${r.centreDy.toFixed(4).padStart(7)}   ${r.tipDx.toFixed(3)}/${r.tipDxR.toFixed(3)}  ` +
        `${r.tipDy.toFixed(3).padStart(6)}  ${r.topDy.toFixed(3).padStart(6)}  ${r.botDy.toFixed(3).padStart(6)}   ${r.ang.toFixed(1).padStart(5)}°       ${r.n}`);
    }
  }
  console.log('\nAGAINST THE NOTE (`_je14anat.mjs`, mean of two references) — mass copies only');
  console.log('quantity            note     icon      mid       full      worst |delta|');
  for (const [k, t] of Object.entries(T)) {
    const v = Object.entries(SIZES).map(([, s]) => measure(mod.coinSVG('buck', s, { side: 'reverse', value: false }), 'mass'));
    const g = (r) => (k === 'wingAngle' ? r.ang : k === 'tipDx' ? r.tipDx : r[k]);
    const vals = v.map(g).filter((x) => x != null && !Number.isNaN(x));
    if (!vals.length) { console.log(`${k.padEnd(18)} ${t.toFixed(4)}   (not measurable on ours)`); continue; }
    const worst = Math.max(...vals.map((x) => Math.abs(x - t)));
    console.log(`${k.padEnd(18)} ${t.toFixed(4).padStart(8)} ${vals.map((x) => x.toFixed(4).padStart(9)).join(' ')}   ${worst.toFixed(4)}`);
  }

  // RESPONSE TEST — scale the seal transform down 10% in a generated copy; the
  // span must fall by ~10%.
  {
    const svg = mod.coinSVG('buck', 190, { side: 'reverse', value: false });
    const cur = svg.match(/translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+)(?: ([-\d.]+))?\)/);
    if (!cur) throw new Error('no seal transform in the emitted SVG — the response test cannot run, this is a failure report');
    const sx = Number(cur[3]), sy = cur[4] === undefined ? sx : Number(cur[4]);
    const to = `translate(${cur[1]} ${cur[2]}) scale(${(sx * 0.9).toFixed(5)} ${(sy * 0.9).toFixed(5)})`;
    const s2 = svg.replaceAll(cur[0], to);
    if (s2 === svg) throw new Error('substitution did not take — every row would be bit-identical (§4)');
    const a = measure(svg, 'mass'), b = measure(s2, 'mass');
    console.log(`\nRESPONSE TEST — seal transform scaled x0.9 in a generated copy: span/W ${a.span.toFixed(4)} -> ${b.span.toFixed(4)}` +
      ` (expected ${(a.span * 0.9).toFixed(4)})  ${Math.abs(b.span - a.span * 0.9) < 0.005 ? 'MOVED as expected' : '*** UNTRUSTED ***'}`);
  }
  // NULL TEST — the same measure on the PYRAMID half of the same drawing, whose
  // geometry is published as literals in coins.js (baseHW 4.0 about axis 23.1,
  // baseY 33.25, apexY 19.4). A tool that reports the eagle must reproduce them.
  {
    const svg = mod.coinSVG('buck', 190, { side: 'reverse', value: false });
    const M = marks(svg).filter((m) => (m.el === 'path' || m.el === 'circle') && m.fill !== '#ffffff')
      .filter((m) => Math.abs((m.bbox.x0 + m.bbox.x1) / 2 - 23.125) < 12);
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const m of M) for (const p of m.pts) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
    console.log(`NULL/CROSS-DEVICE — the pyramid by the same reader: X ${x0.toFixed(2)}..${x1.toFixed(2)} (half-width ${((x1 - x0) / 2).toFixed(2)}),` +
      ` Y ${y0.toFixed(2)}..${y1.toFixed(2)}  — coins.js publishes baseHW 4.0, apexY 19.4, baseY 33.25` +
      `  ${Math.abs((x1 - x0) / 2 - 4.0) < 0.05 && Math.abs(y0 - 19.4) < 0.05 && Math.abs(y1 - 33.25) < 0.05 ? 'REPRODUCED' : '*** DOES NOT REPRODUCE THE PUBLISHED LITERALS ***'}`);
  }
}
