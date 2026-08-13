// D6 (edge quality, method doc §14.1) and D7 (curve quality, §4) — both read
// the same parse of the shipped SVG.
//
// D6: classify every drawn mark as stroke-rendered (has stroke-width, no fill)
// or region (closed fill). Flag any stroke-rendered mark whose bounding box
// touches or overlaps a region's. A flag is not automatically a defect — the
// rule is that it must be converted to a tapered region or DEFENDED in writing.
//
// D7: walk the on-curve knots of the scored paths and report the turn angle at
// each. Gate: zero knots over 75 degrees.
//
// Run: node coloringbook/judge/_jq67edge.mjs [id]
//      DIME=1 -> the response test: run D6 on the dime, whose jaw line the
//      method doc records as a KNOWN instance of the defect (§14). A checker
//      that does not flag it is broken.
import { marks, turns } from './_jqgeom.mjs';

const ID = process.argv[2] || 'quarter';
const mod = await import('../../src/art/coins.js');
const overlap = (a, b, pad = 0) =>
  a.x0 - pad <= b.x1 + pad && b.x0 - pad <= a.x1 + pad && a.y0 - pad <= b.y1 + pad && b.y0 - pad <= a.y1 + pad;

function d6(id, side, size) {
  const svg = mod.coinSVG(id, size, { side });
  const all = marks(svg).slice(1);                 // drop the blank
  const drawn = all.filter((m) => !(m.el === 'circle' && Math.abs(m.bbox.x0 + m.bbox.x1 - 100) < 1e-6 && (m.bbox.x1 - m.bbox.x0) / 2 > 35))
                    .filter((m) => !(m.stroke === '#ffffff' && Math.abs(m.opacity - 0.26) < 1e-6));
  const strokes = drawn.filter((m) => m.isStroke);
  const regions = drawn.filter((m) => m.isRegion);
  const flags = [];
  for (const s of strokes) {
    const nb = regions.filter((r) => overlap(s.bbox, r.bbox));
    if (nb.length) flags.push({ stroke: s, n: nb.length });
  }
  return { svg, drawn, strokes, regions, flags };
}

console.log(`=== D6 edge quality — ${ID}`);
for (const side of ['obverse', 'reverse']) {
  for (const size of [84, 190]) {
    const r = d6(ID, side, size);
    console.log(`${side} ${size}px: ${r.drawn.length} drawn marks, ${r.strokes.length} stroke-rendered, ${r.regions.length} regions, ${r.flags.length} FLAGGED`);
    for (const f of r.flags) {
      const t = f.stroke.tag.replace(/\s+/g, ' ');
      console.log(`   flag: sw=${f.stroke.sw} stroke=${f.stroke.stroke} opacity=${f.stroke.opacity} bbox=[${f.stroke.bbox.x0.toFixed(1)},${f.stroke.bbox.y0.toFixed(1)}..${f.stroke.bbox.x1.toFixed(1)},${f.stroke.bbox.y1.toFixed(1)}] neighbours=${f.n}  ${t.slice(0, 90)}`);
    }
  }
}

console.log(`\n=== D7 curve quality — ${ID} (gate: 0 knots turning > 75 deg)`);
for (const side of ['obverse', 'reverse']) {
  const svg = mod.coinSVG(ID, 190, { side });
  const all = marks(svg).slice(1);
  let worstAll = 0, over = 0, rows = [];
  for (const m of all) {
    if (m.el !== 'path' || !m.knots.length) continue;
    const t = turns(m.knots);
    if (!t.length) continue;
    const w = Math.max(...t.map((x) => x.deg));
    const n = t.filter((x) => x.deg > 75).length;
    over += n;
    if (w > worstAll) worstAll = w;
    rows.push({ n, w, len: m.knots.length, tag: m.tag.replace(/\s+/g, ' ').slice(0, 60) });
  }
  rows.sort((a, b) => b.w - a.w);
  console.log(`${side}: worst turn ${worstAll.toFixed(1)} deg, ${over} knots over 75 deg, across ${rows.length} paths`);
  for (const r of rows.slice(0, 8)) console.log(`   ${r.w.toFixed(1).padStart(6)} deg  ${String(r.n).padStart(2)} over  ${String(r.len).padStart(3)} knots  ${r.tag}`);
}

if (process.env.DIME) {
  console.log('\n=== RESPONSE TEST for D6: the dime, whose jaw line §14 records as a known instance');
  const r = d6('dime', 'obverse', 190);
  console.log(`dime obverse 190px: ${r.strokes.length} stroke-rendered marks, ${r.flags.length} flagged`);
  for (const f of r.flags) console.log('   ' + f.stroke.tag.replace(/\s+/g, ' ').slice(0, 110));
  console.log(r.flags.length > 0 ? 'RESPONSE TEST PASS — the checker flags the documented case' : 'RESPONSE TEST FAIL — D6 is UNTRUSTED');
}
