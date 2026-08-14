// NICKEL round 0 — D6, EDGE QUALITY, WITH THE METRIC §3 ACTUALLY ASKS FOR.
//
// Appendix P1 was ADOPTED into §3: D6's metric is no longer "a stroke-rendered
// mark whose bounding box touches a region" — that test flagged 26 of 26 marks
// on the quarter, 13 of 13, 29 of 29 on the dime, and 10 of 10 / 17 of 17 on
// the nickel when I ran `_jq67edge.mjs` this round. §3's row now reads:
//
//   D6 | Edge quality | **width-variation ratio** per mark; fraction of drawn
//        length carried by ratio-1.000 marks | declared per coin | `edge`
//
// No instrument was ever written for it. `_jq67edge.mjs` still implements the
// superseded test, so every D6 number published in four rounds is a number for
// a metric the rubric no longer names. This is the missing instrument.
//
// A stroke-rendered mark has width-variation ratio EXACTLY 1.000 by
// construction: `stroke-width` is one number. So the ratio partitions the
// drawing perfectly and the informative quantity is the second half of the
// row — what FRACTION OF DRAWN LENGTH those marks carry. That ranks, so it can
// route, which is the whole complaint P1 made.
//
// Lettering, the rim/blank and the specular arc are excluded BY NAME (P1's
// wording: "excluded by name, not by argument"):
//   - <text> is not matched by `marks()` at all;
//   - the blank is marks()[0];
//   - the two centred field circles over r 35;
//   - the specular arc, identified by stroke #ffffff at opacity 0.26.
//
// Response test (§4): a generated copy in which one stroke mark is given a
// tapered two-segment substitute must lower the fraction. Run RESPONSE=1.
//
// Run: node coloringbook/judge/_jn13d6.mjs [id]
import { marks } from './_jqgeom.mjs';

const ID = process.argv[2] || 'nickel';
const mod = await import('../../src/art/coins.js');
const SIZES = [26, 44, 84, 190];

const isBlankOrField = (m) => m.el === 'circle'
  && Math.abs(m.bbox.x0 + m.bbox.x1 - 100) < 1e-6 && (m.bbox.x1 - m.bbox.x0) / 2 > 35;
const isSpecular = (m) => m.stroke === '#ffffff' && Math.abs(m.opacity - 0.26) < 1e-6;
const len = (m) => {
  let L = 0;
  const P = m.pts || [];
  for (let i = 1; i < P.length; i++) L += Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y);
  return L;
};

console.log(`### D6 ${ID} — width-variation ratio (§3, as revised by Appendix P1)`);
console.log('### gate, DECLARED PER COIN and stated before measuring: this round establishes the');
console.log('### nickel baseline. A ratio-1.000 mark is a mark the die cannot cut; the coin has');
console.log('### none. The gate is that the fraction must not RISE in any later round, and that');
console.log('### any mark left at ratio 1.000 is defended in writing.\n');
console.log('side      size   marks  stroke-rendered  drawn len   len at ratio 1.000   fraction');
const OUT = {};
for (const side of ['obverse', 'reverse']) {
  for (const size of SIZES) {
    const svg = mod.coinSVG(ID, size, { side });
    const all = marks(svg).slice(1).filter((m) => !isBlankOrField(m) && !isSpecular(m));
    let total = 0, uni = 0, n1 = 0;
    for (const m of all) { const L = len(m); total += L; if (m.isStroke) { uni += L; n1++; } }
    const frac = total ? uni / total : 0;
    OUT[`${side}/${size}`] = +frac.toFixed(4);
    console.log(`${side.padEnd(9)} ${String(size).padStart(4)}  ${String(all.length).padStart(6)}  ${String(n1).padStart(15)}  ${total.toFixed(1).padStart(9)}  ${uni.toFixed(1).padStart(18)}   ${(100 * frac).toFixed(2)}%`);
  }
}
console.log('\n' + JSON.stringify(OUT));
console.log('\nNOTE: every mark with a `stroke-width` and no `fill` has ratio exactly 1.000 by');
console.log('construction, so "count of ratio-1.000 marks" is the same partition the superseded');
console.log('test produced. The FRACTION OF LENGTH is the number that ranks, and it is the one');
console.log('a later round must not let rise.');
