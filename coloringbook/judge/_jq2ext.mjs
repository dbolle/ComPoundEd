// D2 supplement — the quarter reverse motif measured against the ONE frozen
// reverse target that exists: `_rvtarget.json`'s EXTENTS vector (head, body,
// wing span, wing lowest point, arrows, wreath), frozen by the reverses pass
// off `quarter-rev-2.png` and hashed by the judge.
//
// This is NOT D2's stated metric (region IoU vs a frozen mask). It is what can
// be measured now that the mask has proved unbuildable from these references
// (_jq2seg / _jq2stab), and it is the vector a specialist would work against.
import { readFileSync } from 'node:fs';
import { marks } from './_jqgeom.mjs';

const T = JSON.parse(readFileSync(new URL('../_rvtarget.json', import.meta.url).pathname, 'utf8')).quarter.EXTENTS;
const mod = await import('../../src/art/coins.js');

// the motif's own base copy: struck() emits white(offset) / deep / motif; take
// the LAST group, which is the device in place with no relief offset
function motifMarks(size) {
  const svg = mod.coinSVG('quarter', size, { side: 'reverse' });
  const all = marks(svg);
  // group boundaries: the three struck copies repeat the same geometry, so take
  // the marks whose fill is the motif colour (the third copy) plus any detail
  const byFill = {};
  for (const m of all) byFill[m.fill] = (byFill[m.fill] || 0) + 1;
  const fills = Object.entries(byFill);
  return { all, svg, fills };
}

const { all, svg, fills } = motifMarks(190);
console.log('marks by fill:', JSON.stringify(fills));

// the "in place" copy is the one drawn with the motif colour (#8e969e for the
// quarter); pick it structurally as the last full repetition of the geometry
const motifFill = '#8e969e';
const dev = all.filter((m) => m.fill === motifFill);
console.log(`device marks (fill ${motifFill}): ${dev.length}`);

const box = (ms) => ({
  x0: Math.min(...ms.map((m) => m.bbox.x0)), x1: Math.max(...ms.map((m) => m.bbox.x1)),
  y0: Math.min(...ms.map((m) => m.bbox.y0)), y1: Math.max(...ms.map((m) => m.bbox.y1)),
});

const wings = dev.filter((m) => /M 5?4?5\.5 27\.6|M 54\.5 27\.6/.test(m.tag.replace(/\s+/g, ' ')));
const head = dev.filter((m) => m.el === 'circle');
const arrows = dev.filter((m) => /rect x="34\.5"|M 35\.5 60\.4|M 65 60\.9/.test(m.tag.replace(/\s+/g, ' ')));
const wreath = dev.filter((m) => /M 50 81\.2/.test(m.tag.replace(/\s+/g, ' ')));
const bodyP = dev.filter((m) => /M 45\.4 32/.test(m.tag.replace(/\s+/g, ' ')));

const fmt = (b) => `X ${b.x0.toFixed(1)}..${b.x1.toFixed(1)}  Y ${b.y0.toFixed(1)}..${b.y1.toFixed(1)}`;
console.log('\nelement            MEASURED (frozen _rvtarget)        OURS');
console.log(`head        X ${T.head.X.join('..')}  Y ${T.head.Y.join('..')}                 ${head.length ? fmt(box(head)) : 'not found'}`);
console.log(`body        X ${T.body.X.join('..')}  Y ${T.body.Y.join('..')}                 ${bodyP.length ? fmt(box(bodyP)) : 'not found'}`);
console.log(`wing span   X ${T.wings.span.join('..')}   shoulderY ${T.wings.shoulderY}  tipY ${T.wings.tipY}   ${wings.length ? fmt(box(wings)) : 'not found'}`);
console.log(`arrows      X ${T.arrows.X.join('..')}  Y ${T.arrows.Y.join('..')}           ${arrows.length ? fmt(box(arrows)) : 'not found'}`);
console.log(`wreath      meet ${JSON.stringify(T.wreath.meetAt)} ends ${JSON.stringify(T.wreath.endsAt)}   ${wreath.length ? fmt(box(wreath)) : 'not found'}`);
console.log(`\nwhole device union: ${fmt(box(dev))}`);
console.log(`target says the primaries hang to Y 63-65: ${T.wings.form}`);

// numeric errors on the four numbers the target states unambiguously
const ourWing = box(wings), ourHead = box(head), ourArr = box(arrows);
const rows = [
  ['wing span left', T.wings.span[0], ourWing.x0],
  ['wing span right', T.wings.span[1], ourWing.x1],
  ['wing lowest Y', 64, ourWing.y1],
  ['head X0', T.head.X[0], ourHead.x0],
  ['head X1', T.head.X[1], ourHead.x1],
  ['head Y0', T.head.Y[0], ourHead.y0],
  ['head Y1', T.head.Y[1], ourHead.y1],
  ['arrows X0', T.arrows.X[0], ourArr.x0],
  ['arrows X1', T.arrows.X[1], ourArr.x1],
  ['arrows Y0', T.arrows.Y[0], ourArr.y0],
  ['arrows Y1', T.arrows.Y[1], ourArr.y1],
];
console.log('\nnumeric envelope error, viewBox units (disc radius 47):');
let worst = 0, sum = 0;
for (const [n, t, o] of rows) {
  const e = Math.abs(o - t); sum += e; if (e > worst) worst = e;
  console.log(`  ${n.padEnd(16)} target ${String(t).padStart(6)}   ours ${o.toFixed(2).padStart(7)}   |d| ${e.toFixed(2)}`);
}
console.log(`  mean |d| ${(sum / rows.length).toFixed(2)} units, worst ${worst.toFixed(2)} units`);
