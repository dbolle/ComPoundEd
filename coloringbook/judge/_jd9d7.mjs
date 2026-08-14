// DIME r0 — D7 on the FITTED CONTOURS, which `_jp9edge.mjs` cannot find on this
// coin: its fitted-path identification is by the CENT's HEAD/HAIR/BEARD opening
// coordinates, so on the dime it reports "every path is authored" and D7's
// subject is empty. That is cent PY3's fault again — an instrument that does not
// cover this subject — and the row would have been silently absent.
//
// The dime's fitted contour is the HEAD path: `_p2build.mjs` builds it from
// `_headmask.json` by smoothing, resampling and centripetal Catmull-Rom, and
// `_p2iou.mjs` extracts it as "the first <path d> after the bust transform".
// That extraction rule is reused here unedited so D1 and D7 score the same path.
//
// Run: node coloringbook/judge/_jd9d7.mjs
import { marks, turns } from './_jqgeom.mjs';
const mod = await import('../../src/art/coins.js');
for (const side of ['obverse', 'reverse']) {
  const svg = mod.coinSVG('dime', 380, { side });
  const g = svg.match(/transform="translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+) ([-\d.]+)\)">/);
  const headD = g ? svg.slice(g.index + g[0].length).match(/<path d="([^"]+)"/)[1] : null;
  console.log(`=== dime ${side}`);
  if (headD) {
    const mk = marks(`<svg><path d="${headD}"/></svg>`).find((m) => m.knots && m.knots.length);
    const t = turns(mk.knots);
    const over = t.filter((x) => x.deg > 75);
    console.log(`  FITTED HEAD: ${mk.knots.length} knots, worst turn ${Math.max(...t.map((x) => x.deg)).toFixed(1)} deg, ${over.length} over 75`);
    for (const o of over.slice(0, 6)) console.log(`     ${o.deg.toFixed(1)} deg at (${o.p ? o.p.x.toFixed(2) + ',' + o.p.y.toFixed(2) : '?'})`);
  } else console.log('  no bust transform on this side (reverse motif is drawn directly in the viewBox)');
  const all = marks(svg).slice(1);
  const rows = [];
  for (const m of all) {
    if (m.el !== 'path' || !m.knots.length) continue;
    const t = turns(m.knots); if (!t.length) continue;
    const w = Math.max(...t.map((x) => x.deg));
    const authored = !/[CcQqSsTtAa]/.test(m.d || '');
    rows.push({ w, n: t.filter((x) => x.deg > 75).length, authored, d: (m.d || '').slice(0, 60) });
  }
  rows.sort((a, b) => b.w - a.w);
  console.log(`  all ${rows.length} paths; worst turns:`);
  for (const r of rows.slice(0, 6)) console.log(`     ${r.w.toFixed(1).padStart(6)} deg  ${r.n} over 75  ${r.authored ? 'AUTHORED (M/L/Z only)' : 'has curves'}  ${r.d}`);
}
