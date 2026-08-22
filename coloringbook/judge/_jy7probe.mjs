// ROUND (cent obverse, mid-jaw) — EXPLORATORY tone probe, NOT a gate.
//
// The new `jawMid` patch came back at 1.0603 of the cheek on the reference of
// record and 0.7989 on the second struck reference — a SIGN DISAGREEMENT
// (§12.7). Before anything is drawn on the strength of either number, this maps
// the median-luminance ratio across the whole jaw on both struck references, so
// the disagreement can be seen as a field rather than argued from one patch.
//
// No gate is scored here and no locus is frozen here. It exists to answer one
// question: is the cent's mid-jaw whisker field DARK on the photographs, or is
// it a striated relief whose median sits near the cheek's?
//
// Run: node coloringbook/judge/_jy7probe.mjs [radius]
import { grey, DISC, DISCS, REF, samplePatch, localToDisc } from '../_pylib.mjs';

const R = Number(process.argv[2] || 2.0);
const XS = [-12, -8, -4, 0, 4, 8];
const YS = [-4, 0, 4, 8, 12, 16, 20];
const S = 0.78 / 47;

const srcs = [['penny-obv-3.jpg (reference of record)', REF, DISC],
  ['penny-obv.jpg (1909-S, second struck)', 'coloringbook/ref/penny-obv.jpg', DISCS['penny-obv.jpg']],
  ['penny-obv-2.jpg (2002-S cameo proof — EXCLUDED from tone by §20.3, shown for shape only)',
    'coloringbook/ref/penny-obv-2.jpg', DISCS['penny-obv-2.jpg']]];

for (const [label, file, D] of srcs) {
  const g = await grey(file);
  const cheekMed = samplePatch(g, D, { ...localToDisc(8.5, -1.5), r: 2.6 * S }).med;
  console.log(`\n${label}   cheek median = ${cheekMed}   probe radius ${R} local units`);
  console.log('     y \\ x' + XS.map((x) => String(x).padStart(8)).join(''));
  for (const y of YS) {
    console.log(`   ${String(y).padStart(6)}` + XS.map((x) => {
      const p = { ...localToDisc(x, y), r: R * S };
      const px = D.cx + p.u * D.R, py = D.cy + p.v * D.R, rad = p.r * D.R;
      if (px - rad < 0 || py - rad < 0 || px + rad >= g.w || py + rad >= g.h) return '     oob';
      return (samplePatch(g, D, p).med / cheekMed).toFixed(3).padStart(8);
    }).join(''));
  }
}
console.log('\n1.000 = as bright as the open cheek. Below 1 = darker than the cheek.');
