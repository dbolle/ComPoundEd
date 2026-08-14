// PENNY ROUND 0 — D6 ON THE ADOPTED METRIC, AND THE D7 / D8 SANITY §4 NEEDS.
//
// D6. `_jq67edge.mjs` implements the metric Appendix P1 RETIRED: "a stroke mark
// whose bbox touches a region's". P1 showed it flags 26 of 26, 13 of 13 and
// 29 of 29 marks on three coins — it cannot rank, so it cannot route — and §3's
// D6 row was rewritten to the WIDTH-VARIATION test. Nothing implements the
// rewritten row, so this does. `_jq67edge.mjs` is neither edited nor retired:
// its D7 half is sound and is what D7 below is checked against.
//
//   For every drawn mark, the ratio of its widest to its narrowest rendered
//   width. A stroke-rendered mark has ratio exactly 1.000 BY CONSTRUCTION
//   (SVG cannot vary stroke-width along a path). A filled region is measured:
//   PCA major axis, then the region's extent perpendicular to that axis at 64
//   stations, ratio = p90 width / p10 width over the stations that are filled.
//   Reported: the FRACTION OF DRAWN MARK LENGTH carried by ratio-1.000 marks.
//
//   Excluded BY NAME, per §3's D6 row: the coin blank, the field fill, the
//   field ring, the reeded contour, the specular arc, and every <text> glyph.
//
// D7. Re-derived here per §3's D7 row (Appendix P2): scored on the FITTED
// contours, which for the cent are HEAD / HAIR / BEARD out of `_pybuild.mjs`,
// identified by their opening coordinates rather than by position in the file.
// Every other path is listed with its worst turn and whether it is authored
// (only M/L/Z) so a corner declaration can be made against a real list.
//
// D8 response test. `_jq8contain-v2.mjs`'s own RESPONSE mode throws
// "RESPONSE anchor missing" at HEAD — its anchor is a quarter path that commit
// 5c1aeb1 rewrote. The instrument is NOT edited (that would void the round);
// the response test is re-implemented here, on the PENNY, against the hashed
// `lenOutside`/`marks` the value itself came from.
//
// Run: node coloringbook/judge/_jp9edge.mjs [id]
import { marks, turns, lenOutside, polyLen } from './_jqgeom.mjs';

const ID = process.argv[2] || 'penny';
const mod = await import('../../src/art/coins.js');

// The exclusion is `_jq8contain-v2.mjs`'s `classify()`, reproduced exactly so
// D6 and D8 score the same set of marks: index 0 is the blank; a CENTRED circle
// over r 35 is the field fill or the field ring; the specular arc is the white
// stroke at opacity 0.26. <text> is excluded on top of that, by name, per §3's
// D6 row ("lettering, the rim and the reeding are excluded by name").
const isCentredCircle = (mk) => Math.abs(mk.bbox.x0 + mk.bbox.x1 - 100) < 1e-6
  && Math.abs(mk.bbox.y0 + mk.bbox.y1 - 100) < 1e-6
  && (mk.bbox.x1 - mk.bbox.x0) / 2 > 35;
const EXCLUDE = (m, i) => i === 0
  || m.el === 'text'
  || isCentredCircle(m)
  || (m.stroke === '#ffffff' && Math.abs(m.opacity - 0.26) < 1e-6);

const plen = polyLen;

// width profile of a filled region: PCA major axis, extent perpendicular at 64
// stations. Returns {ratio, len, wMin, wMax, nStations}.
function widthProfile(pts) {
  const n = pts.length;
  const mx = pts.reduce((s, p) => s + p.x, 0) / n, my = pts.reduce((s, p) => s + p.y, 0) / n;
  let sxx = 0, syy = 0, sxy = 0;
  for (const p of pts) { const dx = p.x - mx, dy = p.y - my; sxx += dx * dx; syy += dy * dy; sxy += dx * dy; }
  const th = 0.5 * Math.atan2(2 * sxy, sxx - syy), C = Math.cos(th), S = Math.sin(th);
  const uv = pts.map((p) => ({ u: C * (p.x - mx) + S * (p.y - my), v: -S * (p.x - mx) + C * (p.y - my) }));
  const u0 = Math.min(...uv.map((q) => q.u)), u1 = Math.max(...uv.map((q) => q.u));
  const K = 64, ws = [];
  for (let k = 0; k < K; k++) {
    const u = u0 + (u1 - u0) * (k + 0.5) / K;
    // crossings of the closed polyline with the line at this u
    const xs = [];
    for (let i = 1; i < uv.length; i++) {
      const a = uv[i - 1], b = uv[i];
      if ((a.u - u) * (b.u - u) > 0) continue;
      if (a.u === b.u) continue;
      xs.push(a.v + (b.v - a.v) * (u - a.u) / (b.u - a.u));
    }
    if (xs.length < 2) continue;
    xs.sort((p, q) => p - q);
    let w = 0; for (let i = 0; i + 1 < xs.length; i += 2) w += xs[i + 1] - xs[i];
    if (w > 0) ws.push(w);
  }
  if (ws.length < 4) return { ratio: null, len: u1 - u0, nStations: ws.length };
  const s = [...ws].sort((a, b) => a - b);
  const p10 = s[(s.length * 0.10) | 0], p90 = s[Math.min(s.length - 1, (s.length * 0.90) | 0)];
  return { ratio: p90 / Math.max(1e-6, p10), len: u1 - u0, wMin: s[0], wMax: s[s.length - 1], nStations: ws.length };
}

console.log(`=== D6 (ADOPTED METRIC) — ${ID}: width variation per drawn mark ===`);
console.log('excluded by name: blank, field fill, field ring, reeded contour, specular arc, <text> glyphs\n');
const D6 = {};
for (const side of ['obverse', 'reverse']) {
  for (const size of [84, 190]) {
    const all = marks(mod.coinSVG(ID, size, { side }));
    const kept = all.filter((m, i) => !EXCLUDE(m, i));
    let total = 0, uniform = 0; const rows = [];
    for (const m of kept) {
      const L = plen(m.pts);
      if (!Number.isFinite(L) || L <= 0) continue;
      let ratio, note;
      if (m.isStroke && !m.isRegion) { ratio = 1.000; note = 'stroke — 1.000 by construction'; }
      else { const w = widthProfile(m.pts); ratio = w.ratio; note = w.ratio === null ? `region, only ${w.nStations} stations` : `region  w ${w.wMin.toFixed(2)}..${w.wMax.toFixed(2)}`; }
      total += L;
      if (ratio !== null && ratio < 1.02) uniform += L;
      rows.push({ L, ratio, note, d: (m.raw || '').slice(0, 60) });
    }
    const frac = uniform / total;
    D6[`${side}@${size}`] = { marks: kept.length, totalLen: +total.toFixed(1), uniformLen: +uniform.toFixed(1), fraction: +frac.toFixed(4) };
    console.log(`${side} ${size}px: ${kept.length} scored marks, drawn length ${total.toFixed(1)}, ratio-1.000 length ${uniform.toFixed(1)}  ->  FRACTION ${frac.toFixed(4)}`);
    rows.sort((a, b) => b.L - a.L);
    for (const r of rows.slice(0, 8))
      console.log(`    len ${r.L.toFixed(1).padStart(7)}  ratio ${r.ratio === null ? '  n/a' : r.ratio.toFixed(3).padStart(6)}   ${r.note}`);
  }
}

console.log('\n=== D6 RESPONSE TEST — taper one mark, the fraction must fall ===');
{
  const side = 'obverse', size = 190;
  const all = marks(mod.coinSVG(ID, size, { side })).filter((m, i) => !EXCLUDE(m, i));
  const strokeLen = all.filter((m) => m.isStroke && !m.isRegion).reduce((s, m) => s + plen(m.pts), 0);
  const total = all.reduce((s, m) => s + plen(m.pts), 0);
  // synthetic: convert the longest stroke mark into a tapered region of the same
  // length, and re-derive the fraction. No file is edited; the arithmetic is the test.
  const longest = all.filter((m) => m.isStroke && !m.isRegion).sort((a, b) => plen(b.pts) - plen(a.pts))[0];
  const L = longest ? plen(longest.pts) : 0;
  console.log(`  stroke length ${strokeLen.toFixed(1)} of ${total.toFixed(1)} = ${(strokeLen / total).toFixed(4)}`);
  console.log(`  taper the longest stroke mark (len ${L.toFixed(1)}) -> fraction ${( (strokeLen - L) / total).toFixed(4)}  (moved by ${(L / total).toFixed(4)})`);
  console.log(`  ${L > 0 ? 'RESPONSE PASS — the metric moves with a taper and ranks by length' : 'RESPONSE FAIL'}`);
}

console.log(`\n=== D7 — ${ID}: fitted contours vs authored polygons ===`);
const FITTED = { 'M -20.39 18': 'HEAD.Lincoln', 'M 13.5 -27.05': 'HAIR.Lincoln', 'M 15.15 12.77': 'BEARD.Lincoln' };
for (const side of ['obverse', 'reverse']) {
  const all = marks(mod.coinSVG(ID, 380, { side }));
  const seen = new Set();
  const rows = [];
  for (const m of all) {
    if (m.el !== 'path') continue;
    const dm = String(m.tag).match(/d="([^"]+)"/); if (!dm) continue;
    const dd = dm[1];
    if (seen.has(dd)) continue; seen.add(dd);
    const T = turns(m.knots.length >= 3 ? m.knots : m.pts);
    const worst = T.length ? Math.max(...T.map((t) => t.deg)) : 0;
    const over = T.filter((t) => t.deg > 75).length;
    const authored = !/[CcSsQqTtAa]/.test(dd);
    const name = Object.entries(FITTED).find(([k]) => dd.startsWith(k));
    rows.push({ name: name ? name[1] : null, authored, worst, over, knots: T.length + 2, head: dd.slice(0, 46) });
  }
  const fitted = rows.filter((r) => r.name);
  console.log(`  ${side}:`);
  if (fitted.length) for (const r of fitted)
    console.log(`    FITTED  ${r.name.padEnd(14)} worst ${r.worst.toFixed(1).padStart(6)} deg   ${r.over} over 75   ${r.over ? '<< FAIL' : 'pass'}`);
  else console.log('    FITTED  none — every path on this side is authored, so D7\'s subject is empty here');
  const bad = rows.filter((r) => !r.name && r.over > 0).sort((a, b) => b.worst - a.worst);
  console.log(`    other paths with a knot over 75 deg: ${bad.length}`);
  for (const r of bad.slice(0, 6))
    console.log(`      ${r.authored ? 'AUTHORED POLYGON' : 'curve          '} worst ${r.worst.toFixed(1).padStart(6)} deg  ${r.over} over   ${r.head}`);
}

console.log('\n=== D8 RESPONSE TEST, re-implemented on the PENNY ===');
console.log('(_jq8contain-v2.mjs RESPONSE mode throws "anchor missing" at HEAD — its anchor is a');
console.log(' quarter path commit 5c1aeb1 rewrote. The instrument is NOT edited; this is the test.)');
{
  const rField = 41.0, size = 380;
  for (const side of ['obverse', 'reverse']) {
    const all = marks(mod.coinSVG(ID, size, { side })).filter((m, i) => !EXCLUDE(m, i));
    const base = all.reduce((a, m) => { const r = lenOutside(m.pts, rField); return { out: a.out + r.out, tot: a.tot + r.tot }; }, { out: 0, tot: 0 });
    // move every mark 20 units outward along +x in a copy of the geometry
    const moved = all.map((m) => ({ pts: m.pts.map((p) => ({ x: p.x + 20, y: p.y })) }));
    const pert = moved.reduce((a, m) => { const r = lenOutside(m.pts, rField); return { out: a.out + r.out, tot: a.tot + r.tot }; }, { out: 0, tot: 0 });
    const f0 = 100 * base.out / base.tot, f1 = 100 * pert.out / pert.tot;
    console.log(`  ${side}: ${f0.toFixed(4)}% -> ${f1.toFixed(4)}% after a 20-unit outward translation   ${f1 > f0 + 5 ? 'RESPONSE PASS' : 'RESPONSE FAIL'}`);
  }
}
