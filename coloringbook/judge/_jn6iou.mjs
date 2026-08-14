// NICKEL round 0 — D1, obverse silhouette IoU against the frozen target.
//
// TARGET  coloringbook/_headmask-nickel.json  [REUSED, frozen by the v1.55.0
//         nickel obverse pass, BEFORE the art it scores moved. 313 points,
//         segmented on the ALPHA channel of Schlag's plaster model
//         (`nickel-obv-3.png`) and registered onto two coin photographs by
//         normal-direction ICP.]
// LOCUS   v <= 0.33 in DISC coordinates (`_nkeval.VCUT`), frozen with the
//         target, a horizontal cut just below the coin's chin. Not a function
//         of our art (§6.1).
// OURS    everything the art draws in that region: HEAD from the shipped SVG,
//         plus the bare neck, per §11.5 — scoring one path against a region
//         three paths cover produces an error you would then "fix" by drawing
//         the same thing twice.
//
// SCALE CAVEAT, carried with the number and not buried: the two registrations
// behind this target agree on SHAPE to 0.14-0.37% of diameter and disagree by
// 2.2% on portrait-to-disc SCALE. §11.4 puts that at ~0.04 of IoU on its own —
// bigger than the whole residual error of a good fit. This file therefore also
// scores our art against the target rescaled by each registration's own scale,
// so the gap is a number on the scorecard rather than a footnote.
//
// Response test (§4): cx +1, cy +1, s x1.03 must each move the IoU, and must
// not all move it to the same value (§4's bit-identity corollary).
//
// Run: node coloringbook/judge/_jn6iou.mjs
import { readFileSync } from 'node:fs';
import * as E from '../_nkeval.mjs';
import { bareNeck } from '../_nkparts.mjs';
import { OBVERSE, coinSVG } from '../../src/art/coins.js';

const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const M = JSON.parse(readFileSync(new URL('../_headmask-nickel.json', import.meta.url)));
const ICP = JSON.parse(readFileSync(new URL('../_nkicp.json', import.meta.url)));

const ref = await E.refMask();
const N = OBVERSE.nickel;

async function scoreAt({ s = N.s, cx = N.cx, cy = N.cy, dir = N.dir } = {}) {
  const svg = coinSVG('nickel', 600, { side: 'obverse' });
  const o = E.extract(svg);
  const m = await E.oursFull(o.d, '', bareNeck(41, dir, s, cx, cy), dir, s, cx, cy);
  return E.iou(m, ref);
}

const base = await scoreAt();
console.log(`TARGET  _headmask-nickel.json  ${M.poly.length} points, ${M.discFraction ?? '(fraction not recorded)'}`);
console.log(`LOCUS   v <= ${E.VCUT}, disc-normalised, 1024^2 grid, frozen with the target\n`);
console.log(`D1 obverse silhouette IoU = ${base.iou.toFixed(5)}   (ours-only ${base.oursOnly} px, ref-only ${base.refOnly} px)`);

console.log('\nresponse test (§4) — three perturbations, three different answers:');
for (const [lab, o] of [['cx +1', { cx: N.cx + 1 }], ['cy +1', { cy: N.cy + 1 }], ['s x1.03', { s: N.s * 1.03 }], ['s x0.978 (the -2.2% scale gap)', { s: N.s * 0.978 }]]) {
  const r = await scoreAt(o);
  console.log(`  ${lab.padEnd(32)} ${r.iou.toFixed(5)}   delta ${(r.iou - base.iou >= 0 ? '+' : '') + (r.iou - base.iou).toFixed(5)}`);
}

console.log('\nSCALE CONFIDENCE (§11.4) — the registrations behind the target:');
for (const g of ICP.regs) {
  const dPct = 100 * g.mean / (2 * g.disc.R);
  console.log(`  ${g.file.padEnd(20)} ICP s ${g.s.toFixed(5)}  residual mean ${g.mean.toFixed(2)} px = ${dPct.toFixed(3)}% of diameter  bias ${g.bias.toFixed(3)} px`);
}
const ss = ICP.regs.map((g) => g.s / g.disc.R);
console.log(`  portrait-to-disc scale from each: ${ss.map((x) => x.toFixed(6)).join('  ')}`);
console.log(`  DISAGREEMENT: ${(100 * Math.abs(ss[0] - ss[1]) / ((ss[0] + ss[1]) / 2)).toFixed(2)}% — the +-1.1% claim in §11.4, re-derived`);

// what that scale gap is worth, measured rather than asserted
const half = Math.abs(ss[0] - ss[1]) / ((ss[0] + ss[1]) / 2) / 2;
const up = await scoreAt({ s: N.s * (1 + half) }), dn = await scoreAt({ s: N.s * (1 - half) });
console.log(`  IoU at s x(1+${half.toFixed(4)}) = ${up.iou.toFixed(5)};  at s x(1-${half.toFixed(4)}) = ${dn.iou.toFixed(5)}`);
console.log(`  => the scale gap alone is worth ${(base.iou - Math.min(up.iou, dn.iou)).toFixed(5)} of IoU. A number measured against a target`);
console.log(`     this loose does not mean what a number measured against a tight one means (§11.4).`);

await E.diffPng(await (async () => {
  const o = E.extract(coinSVG('nickel', 600, { side: 'obverse' }));
  return E.oursFull(o.d, '', bareNeck(41, N.dir, N.s, N.cx, N.cy), N.dir, N.s, N.cx, N.cy);
})(), ref, HERE('_jn6-d1-diff.png'));
console.log('\n§4.3 overlay -> _jn6-d1-diff.png   grey = both, MAGENTA = ours outside the coin, GREEN = coin where we are not');
