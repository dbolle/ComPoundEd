// _jn6d6 — D6 EDGE QUALITY for the nickel, at the CENT'S DECLARED LOCUS.
//
// THE GATE, AND WHERE IT COMES FROM. §3's D6 row says "declared per coin", and
// the nickel's scorecard row reads "BASELINE, NO GATE" — which is why the row
// is `UNMEASURED` and, per §2, fails. `penny-gates.md` line 71 declares the
// cent's, and declared it before any cent value existed:
//
//   metric  for every drawn relief mark, widest/narrowest rendered width; then
//           the FRACTION OF DRAWN RELIEF LENGTH carried by ratio-1.000 marks
//   locus   all marks emitted for the id/side at 380px EXCEPT lettering, the
//           coin blank, the field ring, the specular arc and the reeded
//           contour — excluded BY NAME, per §3's D6 row
//   gate    fraction <= 0.50, because "the majority of relief length has been
//           tapered" is the smallest claim that is a claim: §14 asserts a real
//           coin has NO uniform-width marks, so any gate under 1.00 is a real
//           gate and 0.50 is where the metric can still rank the residual
//
// THE NICKEL INHERITS 0.50, FOR THE CENT'S REASONS, and there is nothing about
// this coin that argues for a different number: §14's claim is about struck
// metal, not about which president is on it. The dime inherited it the same
// way.
//
// AND THE HONEST CAVEAT, because the order matters (§8). The cent's 0.50 was
// stated before any cent value. The NICKEL'S VALUES WERE ALREADY PUBLISHED —
// round 0 printed 0 / 0.0115 / 0.1171 / 0.1592 as a baseline with no gate, and
// the r6 brief repeats them. So this declaration is made in knowledge of the
// numbers it will be applied to. It is inherited rather than invented, and the
// margin is not marginal (the worst nickel figure is under a third of the
// gate), but a reader is entitled to know the sequence and here it is.
//
// The locus is widened to print 84 / 190 / 380: `penny-gates.md` says 380px and
// the cent's own SCORECARD row says "84 and 190px". Those are two different
// loci in one declaration and this file will not choose between them — it
// prints all three and names the disagreement (§6.1: the locus is half the
// verdict). Reporting the discrepancy, not fixing it (§1.1).
//
// RESPONSE TEST (§4), the one `penny-gates.md` line 104 specifies: taper one
// mark in a generated copy -> the fraction must FALL. Run RESPONSE=1.
// NULL TEST (§4.1): 0.0 and 1.0 are the metric's bounds. The reverse reads
// exactly 0.0000 at three sizes; that is reported as AT THE BOUND and checked
// against the mark counts, which are non-zero, so it is a real zero and not an
// empty set.
//
// Run: node coloringbook/judge/_jn6d6.mjs
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { marks } from './_jqgeom.mjs';

const SRC = new URL('../../src/art/coins.js', import.meta.url).pathname;
const MONEY = new URL('../../src/engine/money.js', import.meta.url).pathname;
const SIZES = [84, 190, 380];
const GATE = 0.5;

const isBlankOrField = (m) => m.el === 'circle'
  && Math.abs(m.bbox.x0 + m.bbox.x1 - 100) < 1e-6 && (m.bbox.x1 - m.bbox.x0) / 2 > 35;
const isSpecular = (m) => m.stroke === '#ffffff' && Math.abs(m.opacity - 0.26) < 1e-6;
const len = (m) => {
  let L = 0; const P = m.pts || [];
  for (let i = 1; i < P.length; i++) L += Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y);
  return L;
};

let path = SRC;
if (process.env.RESPONSE) {
  // taper ONE mark: the first of RELIEF.Jefferson's `base` ridges becomes a
  // two-width filled region of the same length. Asserted unique.
  const raw = readFileSync(SRC, 'utf8');
  const from = '\'<path d="M -26.24 -26.41 q 6.4 8.8 5.6 18.6" fill="none" stroke-width="1.63"/>\' +';
  if (raw.split(from).length - 1 !== 1) throw new Error('RESPONSE anchor not unique');
  const to = '\'<path d="M -26.24 -26.41 q 6.4 8.8 5.6 18.6 q -1.2 -9.0 -6.4 -18.0 Z" stroke="none"/>\' +';
  path = join(mkdtempSync(join(tmpdir(), 'jn6d6-')), 'coins.js');
  writeFileSync(path, raw.split("from '../engine/money.js'").join(`from '${MONEY}'`).split(from).join(to));
}
const mod = await import(path);

console.log(`### D6 nickel — width-variation ratio. art ${path}${process.env.RESPONSE ? '  [RESPONSE VARIANT]' : ''}`);
console.log(`### GATE, INHERITED FROM penny-gates.md line 71: fraction of drawn relief length`);
console.log(`### carried by ratio-1.000 marks <= ${GATE.toFixed(2)}. Bounds of the metric: 0.0 .. 1.0.\n`);
console.log('side      size   marks  stroke-rendered  drawn len   len at ratio 1.000   fraction   vs gate');
const OUT = {};
for (const side of ['obverse', 'reverse']) {
  for (const size of SIZES) {
    const svg = mod.coinSVG('nickel', size, { side });
    const all = marks(svg).slice(1).filter((m) => !isBlankOrField(m) && !isSpecular(m));
    let total = 0, uni = 0, n1 = 0;
    for (const m of all) { const L = len(m); total += L; if (m.isStroke) { uni += L; n1++; } }
    const frac = total ? uni / total : 0;
    OUT[`${side}/${size}`] = +frac.toFixed(4);
    const bound = frac === 0 || frac === 1 ? `   AT THE BOUND (${all.length} marks in the set, so ${frac === 0 ? 'a real zero, not an empty set' : 'nothing is tapered'})` : '';
    console.log(`${side.padEnd(9)} ${String(size).padStart(4)}  ${String(all.length).padStart(6)}  ${String(n1).padStart(15)}  ${total.toFixed(1).padStart(9)}  ${uni.toFixed(1).padStart(18)}   ${(100 * frac).toFixed(2).padStart(6)}%   ${frac <= GATE ? 'under' : 'OVER'}${bound}`);
  }
}
console.log('\n' + JSON.stringify(OUT));
