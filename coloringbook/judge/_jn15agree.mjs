// _jn15agree — the round's headline number, and it is a PAIR, not one figure.
//
//   COVERAGE   how many of the clean wig-interior sample points our drawing
//              puts ANY oriented line work at all (coherence >= 0.15). Round
//              3 left the front two thirds at coherence 0.000 — literally no
//              line work — and a point with no mark has no direction, so it
//              cannot have a direction error either. Reporting only the mean
//              error would have made the bare cap look perfect.
//   ERROR      over the points BOTH the photograph and our drawing mark, the
//              circular difference between the two angles, in degrees, folded
//              into [0, 90].
//
// Both sides are measured by the same structure tensor on the same frozen grid
// with the same two screens (_jn15locus.mjs). The photograph side is
// _jn15strand.mjs's output on nickel-obv-unc2004.jpg; it does not depend on our
// art in any way, so §6.1's reference-invariance test is exact by construction.
//
// Run: node coloringbook/judge/_jn15agree.mjs <ours-A.json> <ours-B.json>
import { readFileSync } from 'node:fs';

const REF = {
  '0,-26': 19.0, '0,-22': 17.8, '0,-18': -32.0, '0,-14': -49.5,
  '-4,-26': 26.4, '-4,-22': 18.6, '-4,-18': -10.1, '-4,-14': -15.1, '-4,-10': -32.2, '-4,-6': -47.3,
  '-8,-26': 29.9, '-8,-22': 13.5, '-8,-18': -12.9, '-8,-14': -23.6, '-8,-10': -19.1, '-8,-6': -28.8, '-8,-2': -26.4, '-8,2': -3.8,
  '-12,-26': 8.8, '-12,-22': 8.3, '-12,-18': -27.5, '-12,-14': -32.2, '-12,-10': -31.5, '-12,-6': -32.6, '-12,-2': -40.4, '-12,2': -46.2, '-12,6': -41.7,
  '-16,-26': -2.8, '-16,-22': -10.2, '-16,-18': -28.7, '-16,-14': -26.5, '-16,-10': -40.8, '-16,-6': -37.8, '-16,-2': -46.5, '-16,2': -33.5, '-16,6': -38.7, '-16,10': -19.0,
  '-20,-26': -22.4, '-20,-22': -28.3, '-20,-18': -34.6, '-20,-14': -36.1, '-20,-10': -35.3, '-20,-6': -40.7, '-20,-2': -55.9, '-20,2': -41.7, '-20,6': -44.4, '-20,10': -43.8,
  '-24,-26': -41.9, '-24,-22': -36.3, '-24,-18': -39.7, '-24,-14': -38.2, '-24,-10': -38.9, '-24,-6': -36.7, '-24,-2': -40.4, '-24,2': -34.7, '-24,6': -47.1,
  '-28,-14': -54.9, '-28,-10': -60.1, '-28,-6': -56.8, '-28,-2': -45.4, '-28,2': -33.2, '-28,6': -62.9,
};
// FRONT is the region this round owns: everything at local x >= -20, which is
// forward of the first existing ridge's forward-most point (-20.23). BACK is
// the rest, and this round did not touch it.
const isFront = (k) => +k.split(',')[0] >= -20;
const cdiff = (a, b) => { let d = Math.abs(a - b) % 180; if (d > 90) d = 180 - d; return d; };

if (process.env.DETAIL) {
  const ours = JSON.parse(readFileSync(process.env.DETAIL, 'utf8'));
  const rows = Object.keys(REF).filter(isFront).map((k) => ({ k, ref: REF[k], our: k in ours ? ours[k] : null }));
  rows.forEach((r) => { r.e = r.our === null ? null : cdiff(r.our, REF[r.k]); });
  rows.sort((a, b) => (b.e ?? -1) - (a.e ?? -1));
  console.log('per-sample residual, FRONT, worst first:');
  for (const r of rows) console.log(`  ${r.k.padStart(8)}  photo ${String(r.ref).padStart(6)}   ours ${r.our === null ? '  (no mark)' : r.our.toFixed(1).padStart(6)}   err ${r.e === null ? ' --' : r.e.toFixed(1).padStart(5)}`);
}

const files = process.argv.slice(2);
const keys = Object.keys(REF);
console.log(`${keys.length} photograph samples on the frozen grid (${keys.filter(isFront).length} front, ${keys.filter((k) => !isFront(k)).length} back)`);
for (const f of files) {
  const ours = JSON.parse(readFileSync(f, 'utf8'));
  for (const [label, sel] of [
    ['FRONT (x >= -20, this round)', isFront],
    ['FRONT-CORE (x >= -16)', (k) => +k.split(',')[0] >= -16],
    ['BACK  (x <  -20, untouched)', (k) => !isFront(k)]]) {
    const K = keys.filter(sel);
    const marked = K.filter((k) => k in ours);
    const errs = marked.map((k) => cdiff(ours[k], REF[k])).sort((a, b) => a - b);
    const mean = errs.length ? errs.reduce((a, b) => a + b, 0) / errs.length : NaN;
    console.log(`  ${f.split('/').pop().padEnd(24)} ${label.padEnd(30)} covered ${String(marked.length).padStart(2)}/${K.length}` +
      (errs.length ? `   mean |dtheta| ${mean.toFixed(1)} deg   median ${errs[Math.floor(errs.length / 2)].toFixed(1)}   worst ${errs[errs.length - 1].toFixed(1)}` : '   no marks -> no direction error to report'));
  }
}
