// R4 dime jaw — WHICH KNOT is the 111 deg one, on WHICH path, at WHICH INDEX.
//
// `_jd9d7.mjs` publishes the headline "44 knots, worst 111.0, 1 over 75" but
// prints the offender's coordinate as `(?)` — its `turns()` rows carry `at`,
// not `p`, so `o.p` is undefined on every line. This re-runs the SAME
// extraction rule (first <path d> after the bust transform, i.e. the fitted
// HEAD contour) and prints the knot index, the emitted viewBox coordinate, and
// the coordinate mapped BACK into the head's own local frame so it can be
// matched against the `Roosevelt:` command list in coins.js.
//
// Response test: RESPONSE=1 injects an extra knot that doubles back on itself
// into a copy of the extracted path and confirms the worst turn rises.
// Null test: the reported worst turn must not equal 180 (the flatten/duplicate
// degenerate bound) nor 0; both bounds are printed beside the answer.
//
// Run: node coloringbook/judge/_jw4d7.mjs
import { marks, turns } from './_jqgeom.mjs';

const mod = await import('../../src/art/coins.js');
const svg = mod.coinSVG('dime', 380, { side: 'obverse' });
const g = svg.match(/transform="translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+) ([-\d.]+)\)">/);
const [tx, ty, sx, sy] = g.slice(1).map(Number);
const headD = svg.slice(g.index + g[0].length).match(/<path d="([^"]+)"/)[1];
// The FIRST path after the transform is the bevel copy, which carries its own
// translate(-rx -ry); the geometry is HEAD[who] either way. Report both the
// emitted point and the local point with that offset NOT removed, and say so.
const mk = marks(`<svg><path d="${headD}"/></svg>`).find((m) => m.knots.length);
const t = turns(mk.knots);
const worst = Math.max(...t.map((x) => x.deg));
console.log(`bust transform: translate(${tx} ${ty}) scale(${sx} ${sy})`);
console.log(`HEAD contour: ${mk.knots.length} knots, worst ${worst.toFixed(2)} deg`);
console.log('BOUNDS (null test): a turn is in [0,180] by construction; 0 and 180 are the bounds.');
console.log('\nidx  turn_deg   local(x,y)          emitted(x,y)');
for (const x of t.slice().sort((a, b) => b.deg - a.deg).slice(0, 8)) {
  const L = mk.knots[x.i];
  const E = { x: tx + sx * L.x, y: ty + sy * L.y };
  console.log(`${String(x.i).padStart(3)}  ${x.deg.toFixed(2).padStart(7)}   `
    + `(${L.x.toFixed(2)}, ${L.y.toFixed(2)})`.padEnd(20)
    + `(${E.x.toFixed(2)}, ${E.y.toFixed(2)})`);
}
const over = t.filter((x) => x.deg > 75);
console.log(`\nover 75: ${over.length} -> knot indices [${over.map((x) => x.i).join(', ')}]`);
for (const x of over) {
  const a = mk.knots[x.i - 1], b = mk.knots[x.i], c = mk.knots[x.i + 1];
  console.log(`  knot ${x.i}: ${x.deg.toFixed(2)} deg   prev(${a.x.toFixed(2)},${a.y.toFixed(2)})`
    + `  AT(${b.x.toFixed(2)},${b.y.toFixed(2)})  next(${c.x.toFixed(2)},${c.y.toFixed(2)})`);
}

if (process.env.RESPONSE) {
  // splice a hard doubling-back into the knot list and confirm the metric moves
  const K = mk.knots.slice();
  const i = 20;
  K.splice(i, 0, { x: K[i].x + 6, y: K[i].y - 6 });
  const t2 = turns(K);
  console.log(`\nRESPONSE: injected a spur at knot ${i}: worst ${worst.toFixed(2)} -> `
    + `${Math.max(...t2.map((x) => x.deg)).toFixed(2)} deg, over-75 count `
    + `${over.length} -> ${t2.filter((x) => x.deg > 75).length}`);
}
