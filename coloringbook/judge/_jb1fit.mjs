// BUCK r0 — R0: registration. The judge's own re-derivation of §18.1/§18.2.
//
// SUBJECTS COVERED (PY3): id `buck`, BOTH sides, all four references.
//
// Wraps `_blfit.mjs` at its published hash (READ ONLY, §1) and adds the four
// checks the gates file's §3 requires and the note pass did not run:
//
//   NULL TEST (§4.1)      the fitter searches inward from the paper box; its
//                         bounds are that box. A quad that lands on the paper
//                         box, or whose four line fits all return p95 = 0.0
//                         with four exactly-90.00 corners, is a NON-ANSWER —
//                         a perfectly straight, perfectly axis-aligned,
//                         zero-residual "border" is what a crop edge looks
//                         like, not what an engraved rule looks like.
//   RESPONSE TEST (§4)    re-fit with the outer-skip INSET moved 0.02 -> 0.05
//                         and with the ink threshold moved 0.72 -> 0.62. The
//                         ratio must move on a sound fit and must move a LOT
//                         on a degenerate one.
//   SELECTION SET (§4.2)  print border ratio AND paper-edge ratio side by
//                         side for every file, in one column each. §4's
//                         bit-identity rule applied: border ≈ paper means the
//                         fitter did not find a border.
//   N4 (nickel r0)        print the fitted quantity for EVERY file in one
//                         column; two files with a bit-identical fit are one
//                         photograph until proved otherwise. Also prints raw
//                         pixel dimensions, which is what catches a crop.
//
//   node coloringbook/judge/_jb1fit.mjs [json]
import { writeFileSync } from 'node:fs';
import { fitBorder } from '../_blfit.mjs';

const FILES = ['bill-obv.jpg', 'bill-obv-2.jpg', 'bill-rev.jpg', 'bill-rev-2.jpg'];

const rows = {};
for (const f of FILES) {
  const base = await fitBorder(f);
  const pInset = await fitBorder(f, { inset: 0.05 });
  const pInk = await fitBorder(f, { ink: 0.62 });
  for (const [tag, r] of [['base', base], ['inset', pInset], ['ink', pInk]])
    if (!Number.isFinite(r.ratio) || !Object.values(r.corners).every((c) => c.every(Number.isFinite)))
      throw new Error(`${f}/${tag}: non-finite fit — an overlay may not be published from it (N3)`);
  const pb = base.paperBox;
  const degenerate =
    Object.values(base.fits).every((v) => v.p95 === 0) &&
    base.angles.every((a) => Math.abs(a - 90) < 0.005) &&
    Math.abs(pb.ratio / base.ratio - 1) < 0.01;
  rows[f] = {
    w: base.w, h: base.h,
    border: base.ratio, paper: pb.ratio,
    borderVsPaperPct: 100 * (pb.ratio / base.ratio - 1),
    angles: base.angles, skew: base.skew,
    p95: Object.fromEntries(Object.entries(base.fits).map(([k, v]) => [k, v.p95])),
    corners: base.corners, paperBox: pb,
    response: { inset05: pInset.ratio, ink062: pInk.ratio,
      movedInsetPct: 100 * (pInset.ratio / base.ratio - 1),
      movedInkPct: 100 * (pInk.ratio / base.ratio - 1) },
    degenerate,
  };
}

console.log('R0 — printed-border registration, judge re-derivation');
console.log('file            px w x h     | BORDER  PAPER   b-vs-p% | ang max|d-90| skew w/h | p95 t/b/l/r  | RESPONSE inset .02->.05  ink .72->.62 | verdict');
for (const [f, r] of Object.entries(rows)) {
  const maxAng = Math.max(...r.angles.map((a) => Math.abs(a - 90)));
  console.log(
    `${f.padEnd(15)} ${String(r.w).padStart(5)}x${String(r.h).padEnd(5)} | ` +
    `${r.border.toFixed(4)} ${r.paper.toFixed(4)} ${r.borderVsPaperPct.toFixed(1).padStart(7)} | ` +
    `${maxAng.toFixed(2).padStart(6)}  ${r.skew.wPct.toFixed(2)}/${r.skew.hPct.toFixed(2)} | ` +
    `${[r.p95.top, r.p95.bottom, r.p95.left, r.p95.right].map((v) => v.toFixed(1)).join(' ')} | ` +
    `${r.response.inset05.toFixed(4)} (${r.response.movedInsetPct.toFixed(2)}%)  ` +
    `${r.response.ink062.toFixed(4)} (${r.response.movedInkPct.toFixed(2)}%) | ` +
    (r.degenerate ? 'DEGENERATE — border == paper, zero residual, exact right angles' : 'fit'));
}

// N4 — one column of the fitted quantity, every file. Bit-identical => one photo.
console.log('\nN4 one-column fitted border ratios (bit-identical => one photograph):');
const seen = new Map();
for (const [f, r] of Object.entries(rows)) {
  const key = r.border.toFixed(10);
  if (seen.has(key)) console.log(`  !! ${f} and ${seen.get(key)} are BIT-IDENTICAL at ${key}`);
  seen.set(key, f);
  console.log(`  ${f.padEnd(15)} ${key}   ${r.w}x${r.h}`);
}

// R0b — per-face agreement between two independent photographs.
const pair = (a, b, tag) => {
  const d = 100 * Math.abs(rows[a].border - rows[b].border) / ((rows[a].border + rows[b].border) / 2);
  console.log(`  ${tag.padEnd(9)} ${rows[a].border.toFixed(4)} vs ${rows[b].border.toFixed(4)} = ${d.toFixed(2)}% apart  ` +
    `${d <= 1.0 ? 'PASS (<= 1.0%)' : 'FAIL (> 1.0%)'}`);
  return d;
};
console.log('\nR0b — border ratio agreement between two independent photographs of the same face:');
const obvPct = pair('bill-obv.jpg', 'bill-obv-2.jpg', 'obverse');
const revPct = pair('bill-rev.jpg', 'bill-rev-2.jpg', 'reverse');

// R1 — the aspect-ratio claims in noteSVG(), re-derived.
const revMean = (rows['bill-rev.jpg'].border + rows['bill-rev-2.jpg'].border) / 2;
console.log('\nR1 — the aspect ratios, re-derived:');
console.log(`  measured printed border, mean of two reverses   ${revMean.toFixed(4)}`);
console.log(`  measured paper edge, the two full-paper shots   ${rows['bill-obv-2.jpg'].paper.toFixed(4)} / ${rows['bill-rev-2.jpg'].paper.toFixed(4)}`);
console.log(`  true paper ratio 6.14 in / 2.61 in              ${(6.14 / 2.61).toFixed(4)}`);
console.log(`  noteSVG comment claims a real note is           2.6100 : 1   <- 2.61 is the HEIGHT IN INCHES`);
console.log(`  our outer box 100/56                            ${(100 / 56).toFixed(4)}`);
console.log(`  our inner frame rect 90/46                      ${(90 / 46).toFixed(4)}`);
console.log(`  uv2XY anisotropy = ${revMean.toFixed(4)} / ${(90 / 46).toFixed(4)} = ${(revMean / (90 / 46)).toFixed(4)}`);

if (process.argv[2] === 'json') {
  writeFileSync(new URL('./_jb1fits.json', import.meta.url),
    JSON.stringify({ generated: 'coloringbook/judge/_jb1fit.mjs', rows, obvPct, revPct, revMean }, null, 2) + '\n');
  console.log('\nwrote coloringbook/judge/_jb1fits.json');
}
