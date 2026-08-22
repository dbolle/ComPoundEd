// ROUND 7, QUARTER OBVERSE — D6 working instrument: RANK the stroke-rendered
// marks by the length they contribute.
//
// `_jn13d6.mjs` (the judge's D6 instrument, adopted from Appendix P1) reports
// one number per side/size: the fraction of drawn length carried by marks whose
// width-variation ratio is 1.000. That number routes a round to a coin; it does
// not route a round to a MARK. The brief says "rank them by length contribution,
// convert the ones you can justify", so this prints the same partition
// _jn13d6.mjs computes, itemised, with each mark's source group named.
//
// It reuses `_jn13d6.mjs`'s exclusions verbatim (blank, the two centred field
// circles over r 35, the specular arc) so the per-mark lengths SUM to the
// judge's own totals — that identity is printed as a check, and if it ever
// fails this instrument is measuring a different set of marks than the gate is.
//
// NULL TEST (spec 4.1): this instrument searches nothing and selects nothing —
// it enumerates. Its bound-equivalent is the sum identity above: a per-mark
// table whose total does not equal the judge's total is a failure report, not a
// value.
// RESPONSE TEST (spec 4): run with RESP=1 — the same enumeration against an art
// revision in which one named mark was converted must show that mark leave the
// stroke partition and the total fall by that mark's own length.
//
// Run: node coloringbook/judge/_jq7rank.mjs [id] [side] [size]
import { marks } from './_jqgeom.mjs';

const ID = process.argv[2] || 'quarter';
const SIDE = process.argv[3] || 'obverse';
const SIZE = Number(process.argv[4] || 84);
const mod = await import('../../src/art/coins.js');

const isBlankOrField = (m) => m.el === 'circle'
  && Math.abs(m.bbox.x0 + m.bbox.x1 - 100) < 1e-6 && (m.bbox.x1 - m.bbox.x0) / 2 > 35;
const isSpecular = (m) => m.stroke === '#ffffff' && Math.abs(m.opacity - 0.26) < 1e-6;
const len = (m) => {
  let L = 0; const P = m.pts || [];
  for (let i = 1; i < P.length; i++) L += Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y);
  return L;
};

// Which authored group a mark came from, by its rendered stroke/fill/opacity —
// the same signature the file's own head builder stamps on each group.
function group(m) {
  const o = m.opacity;
  const near = (a, b) => Math.abs(a - b) < 1e-6;
  if (m.stroke === '#242c33' && near(o, 0.33)) return 'groove/grooveFine';
  if (m.stroke === '#cfd5da' && near(o, 0.85)) return 'base/fine';
  if (m.stroke === '#242c33' && near(o, 0.28)) return 'face/faceFine';
  if (m.stroke === '#242c33' && near(o, 0.42)) return 'dark/eye/earMark';
  if (m.fill === '#242c33' && near(o, 0.28)) return 'shade (region)';
  if (m.fill === '#a4acb4') return 'plane (region)';
  return `${m.fill}/${m.stroke}@${o}`;
}

const svg = mod.coinSVG(ID, SIZE, { side: SIDE });
const all = marks(svg).slice(1).filter((m) => !isBlankOrField(m) && !isSpecular(m));
let total = 0, uni = 0;
const rows = [];
for (const m of all) {
  const L = len(m); total += L;
  if (m.isStroke) uni += L;
  rows.push({ L, m });
}
rows.sort((a, b) => b.L - a.L);

console.log(`### _jq7rank — ${ID} ${SIDE} @${SIZE}px, ${all.length} drawn marks, total length ${total.toFixed(1)}`);
console.log(`### stroke-rendered (ratio 1.000): ${rows.filter((r) => r.m.isStroke).length} marks, ${uni.toFixed(1)} units, ${(100 * uni / total).toFixed(2)}%`);
console.log('');
console.log('rank  kind    len    share  cum%   group                 sw    d');
let cum = 0, rank = 0;
for (const r of rows) {
  if (!r.m.isStroke) continue;
  rank++; cum += r.L;
  const d = (r.m.tag.match(/\sd="([^"]*)"/) || [, ''])[1].replace(/\s+/g, ' ');
  console.log(
    `${String(rank).padStart(4)}  STROKE ${r.L.toFixed(2).padStart(6)}  ${(100 * r.L / total).toFixed(2).padStart(5)}%  ${(100 * cum / total).toFixed(2).padStart(5)}%  ${group(r.m).padEnd(20)} ${String(r.m.sw).padStart(4)}  ${d.slice(0, 70)}`,
  );
}
console.log('');
console.log('regions, for scale:');
for (const r of rows) {
  if (r.m.isStroke) continue;
  console.log(`      REGION ${r.L.toFixed(2).padStart(6)}  ${(100 * r.L / total).toFixed(2).padStart(5)}%         ${group(r.m).padEnd(20)}`);
}
console.log(`\nSUM CHECK: stroke ${uni.toFixed(4)} + region ${(total - uni).toFixed(4)} = ${total.toFixed(4)};  fraction ${(uni / total).toFixed(4)}`);
