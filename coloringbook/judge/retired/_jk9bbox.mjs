// BUCK r9 (specialist) — a working ruler: the bounding box of every mark the
// note emits, in viewBox units, so a device can be fitted to a measured
// roundel instead of to the container. Uses `_jqgeom.mjs`'s `marks()` at its
// published hash (transforms applied), not a regex over the source.
//
//   node coloringbook/judge/_jk9bbox.mjs <side> <tier-size> [filter]
import { marks } from './_jqgeom.mjs';
const { coinSVG } = await import('../../src/art/coins.js');
const side = process.argv[2] || 'reverse', size = +(process.argv[3] || 190);
const filt = process.argv[4];
const M = marks(coinSVG('buck', size, { side, value: false }));
let X0 = 1e9, X1 = -1e9, Y0 = 1e9, Y1 = -1e9;
for (const m of M) {
  const t = m.tag.replace(/\s+/g, ' ');
  if (filt && !t.includes(filt)) continue;
  console.log(`${m.el.padEnd(8)} x ${m.bbox.x0.toFixed(2).padStart(7)}..${m.bbox.x1.toFixed(2).padStart(7)}  y ${m.bbox.y0.toFixed(2).padStart(7)}..${m.bbox.y1.toFixed(2).padStart(7)}  ${t.slice(0, 88)}`);
  X0 = Math.min(X0, m.bbox.x0); X1 = Math.max(X1, m.bbox.x1);
  Y0 = Math.min(Y0, m.bbox.y0); Y1 = Math.max(Y1, m.bbox.y1);
}
console.log(`UNION  x ${X0.toFixed(2)}..${X1.toFixed(2)} (w ${(X1 - X0).toFixed(2)})  y ${Y0.toFixed(2)}..${Y1.toFixed(2)} (h ${(Y1 - Y0).toFixed(2)})  centre (${((X0 + X1) / 2).toFixed(2)}, ${((Y0 + Y1) / 2).toFixed(2)})`);
