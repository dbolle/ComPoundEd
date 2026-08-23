// WHERE IS THE BUILDING'S OWN AXIS OF SYMMETRY?
//
// Monticello is bilaterally symmetric. So any x read off a photograph is only
// as good as the assumption that the device's axis is at viewBox 50 — and on
// two of these three references it is NOT. Reflecting each band about a trial x
// and taking the best NCC:
//
//                        dome+drum   pediment   whole building
//   nickel-rev.jpg          50.55      50.60       50.55  (ncc 0.57)
//   nickel-rev-2.png        50.70      50.60       50.70  (ncc 0.48)
//   nickel-rev-proof.png    50.10      50.15       50.45  (ncc 0.62)
//   ours                    49.95      49.95       49.95  (ncc 0.87)
//
// Half a unit of device offset is why this round took the terrace's WIDTH from
// the references and kept its CENTRE at 50, and why an eye-read of "the inner
// columns are 1.7 units out" evaporated once the offset was divided out. If you
// are about to move something sideways on this face, run this first.
//
// ⚠️ THE COLONNADE BAND (y 50..56) IS VOID ON ALL FOUR and is printed to show
// it: 47.05 / 53.60 / 50.90 / 49.10, ncc 0.45 / 0.24 / 0.35 / 0.56. Directional
// relief lighting puts the highlight on the same side of every shaft, and our
// own drawing does the same thing on purpose (`columns()` puts a white flute
// down each LEADING edge), so a mirror test cannot find an axis there. A number
// from that row is not evidence.
//
// usage: node coloringbook/judge/_nkr4axis.mjs [file|ours] [half-width]
import { samplerFor } from './_nkrlib.mjs';

const file = process.argv[2] || 'nickel-rev-2.png';
const HALF = Number(process.argv[3] ?? 14);
const { at } = await samplerFor(file);

function axisOf(y0, y1) {
  let best = null, bestC = -2;
  const curve = [];
  for (let a = 46; a <= 54; a += 0.05) {
    let sa = 0, sb = 0, saa = 0, sbb = 0, sab = 0, n = 0;
    for (let y = y0; y <= y1; y += 0.1) for (let d = 0.5; d <= HALF; d += 0.05) {
      const u = at(a - d, y), v = at(a + d, y);
      sa += u; sb += v; saa += u * u; sbb += v * v; sab += u * v; n++;
    }
    const ma = sa / n, mb = sb / n;
    const c = (sab / n - ma * mb) / Math.sqrt((saa / n - ma * ma) * (sbb / n - mb * mb));
    curve.push(c);
    if (c > bestC) { bestC = c; best = a; }
  }
  return { axis: best, ncc: bestC, contrast: bestC - Math.min(...curve) };
}
console.log(`# ${file}   best mirror axis per band, reflecting +-${HALF} viewBox units`);
for (const [y0, y1, what, note] of [
  [28, 36, 'dome + drum', ''],
  [37, 43, 'pediment + cornices', ''],
  [44, 57, 'colonnade + wings', ''],
  [50, 56, 'colonnade only', '   <- VOID: directional lighting, see header'],
  [57.5, 60.5, 'terrace', ''],
  [28, 60, 'whole building', ''],
]) {
  const r = axisOf(y0, y1);
  console.log(`  y ${String(y0).padStart(5)}..${String(y1).padEnd(5)} ${what.padEnd(21)} axis ${r.axis.toFixed(2)}  ncc ${r.ncc.toFixed(3)}  peak-to-floor ${r.contrast.toFixed(3)}${note}`);
}
