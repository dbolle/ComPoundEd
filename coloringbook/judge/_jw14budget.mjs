// ROUND 9 (relief/edge), QUARTER OBVERSE — THE D6 LENGTH BUDGET for the wig.
//
// D6 as implemented (`_jn13d6.mjs`, adopted from Appendix P1) is
//   fraction = (drawn LENGTH of marks with width-variation ratio 1.000)
//            / (drawn LENGTH of every scored mark)
// and `stroke-width` appears NOWHERE in it. So this round's whole subject —
// marks that are 7x too wide — is invisible to the gate, and the only way the
// gate moves is by changing centreline LENGTH.
//
// That cuts both ways and this file is the arithmetic. Because U < T, replacing
// groove length L with length L' gives (U-L+L')/(T-L+L'), which RISES if
// L' > L and FALLS if L' < L. So a wig redraw that keeps its total centreline
// length at or under the current total cannot regress D6, whatever it does to
// the count, the pitch or the width.
//
// Run: node coloringbook/judge/_jw14budget.mjs
import { marks } from './_jqgeom.mjs';

const mod = await import('../../src/art/coins.js');
const isBlankOrField = (m) => m.el === 'circle'
  && Math.abs(m.bbox.x0 + m.bbox.x1 - 100) < 1e-6 && (m.bbox.x1 - m.bbox.x0) / 2 > 35;
const isSpecular = (m) => m.stroke === '#ffffff' && Math.abs(m.opacity - 0.26) < 1e-6;
const len = (m) => {
  let L = 0; const P = m.pts || [];
  for (let i = 1; i < P.length; i++) L += Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y);
  return L;
};
// the wig's DARK cuts, identified by the group they are emitted in: `groove`
// (all full tiers) is stroked in p.ink at opacity 0.33; `grooveFine` joins it at
// boxW >= 130. Both are drawn INSIDE the head group, so their coordinates come
// back scaled by s = 0.98; the table prints both frames.
const S = 0.98;

console.log('### _jw14budget — the wig cuts, and what D6 lets them cost');
for (const size of [84, 190]) {
  const svg = mod.coinSVG('quarter', size, { side: 'obverse' });
  const all = marks(svg).slice(1).filter((m) => !isBlankOrField(m) && !isSpecular(m));
  let total = 0, uni = 0;
  for (const m of all) { const L = len(m); total += L; if (m.isStroke) uni += L; }
  // opacity 0.33 + stroke ink is the groove group's signature
  const cutMarks = all.filter((m) => m.isStroke && Math.abs(m.opacity - 0.33) < 1e-6);
  const cutLen = cutMarks.reduce((a, m) => a + len(m), 0);
  console.log(`\n## ${size} px   total drawn ${total.toFixed(2)}   uniform ${uni.toFixed(2)}   D6 ${(100 * uni / total).toFixed(2)}%`);
  console.log(`   wig CUTS (stroke @0.33 opacity): ${cutMarks.length} marks, ${cutLen.toFixed(2)} screen units `
    + `= ${(cutLen / S).toFixed(2)} local units`);
  for (const m of cutMarks) {
    console.log(`     sw ${(m.sw ?? 0).toFixed(2).padStart(5)}  len ${len(m).toFixed(2).padStart(6)} screen `
      + `${(len(m) / S).toFixed(2).padStart(6)} local   ${(m.tag||"").replace(/.*d="/,"").slice(0, 52)}`);
  }
  // what D6 reads if the cut length is replaced by X
  console.log('   D6 as a function of replacement cut length X (screen units):');
  for (const f of [0.5, 0.75, 1.0, 1.5, 2.0, 3.0]) {
    const X = cutLen * f;
    console.log(`     X = ${(f * 100).toFixed(0).padStart(3)}% of now (${X.toFixed(1).padStart(6)}) -> `
      + `${(100 * (uni - cutLen + X) / (total - cutLen + X)).toFixed(2)}%`);
  }
}
