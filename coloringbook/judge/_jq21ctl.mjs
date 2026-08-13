// THE CONTROL FOR D2's "BLOCKED" (§3 D12 / §4.3 applied to an instrument).
//
// v1 of this file ran the ENERGY plateau test on a cameo proof as the control
// and the control failed too — which said nothing about the quarter and
// everything about my choice of instrument. §2.2's method for a frosted proof
// is a LEVEL threshold at the midpoint of the two brightness modes, because on
// a proof the device and the field are two different SURFACES (frost vs mirror)
// with two different reflectances. That is the instrument the nickel's and the
// dime's frozen targets were built with, so that is the instrument the control
// must use. v1 is kept in git history as the wrong-instrument case.
//
// The quantity that decides whether §2.2 can run at all is therefore not a
// segmentation result, it is the SHAPE OF THE GREY HISTOGRAM inside the design:
//   - two modes with a deep valley  -> a level threshold exists, and a sweep of
//     it has a plateau (this is what "the device is separable from the field"
//     physically MEANS);
//   - one mode  -> device and field are the same material at the same
//     reflectance, the only signal is relief shading, and no threshold exists
//     at any setting of anything.
//
// Reported: Otsu separability (between-class variance / total variance — 1.0 is
// two delta functions, 0.0 is no structure), the valley depth, and the level
// sweep's own area plateau. Bounds printed (§4.1).
import sharp from 'sharp';
import { largestFilled } from '../_qtedge.mjs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const SUBJ = [
  ['quarter-rev-3.jpg', { cx: 999.50, cy: 999.45, R: 999.49 }, 'NEW acquisition: square-on (p95 0.05% of R), even light, 2000px, CIRCULATION strike'],
  ['quarter-rev-2.png', { cx: 374.50, cy: 374.37, R: 374.98 }, 'round 0/1 reference: square-on, uncirculated CIRCULATION strike'],
  ['nickel-rev-proof.png', { cx: 1439.60, cy: 1455.11, R: 1418.55 }, 'CONTROL: cameo PROOF — frosted device on a mirror field'],
  ['nickel-obv-proof.png', null, 'CONTROL 2: cameo PROOF, obverse'],
  ['dime-obv-2.jpg', null, 'CONTROL 3: the dime obverse §2.2 names as the worked example'],
];

console.log('SEARCH BOUNDS: grey level 0..255. Otsu separability in [0,1]; a value at 0 or 1 is a failure report.\n');

for (const [file, D0, note] of SUBJ) {
  let D = D0;
  if (!D) { const { fit } = await import('../_qtdisc.mjs').then(async () => ({ fit: (await import('../_rvdisc.mjs')).fit })); }
  if (!D) {
    const { coinMask, rayCast, kasa } = await import('../_qtdisc.mjs');
    const cm = await coinMask(file); const pts = rayCast(cm.m, cm.W, cm.H, cm.area);
    const f = kasa(pts.filter(([a]) => !(a > 25 && a < 155))); D = { cx: f.cx, cy: f.cy, R: f.R };
  }
  const { data, info } = await sharp(P(file)).flatten({ background: '#808080' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  // §2.2 step 2: only inside 0.90R, so the rim ring and background are excluded
  const h = new Array(256).fill(0); let n = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (Math.hypot(x - D.cx, y - D.cy) > 0.90 * D.R) continue;
    h[data[y * W + x]]++; n++;
  }
  const p = h.map((c) => c / n);
  let mu = 0; for (let i = 0; i < 256; i++) mu += i * p[i];
  let vt = 0; for (let i = 0; i < 256; i++) vt += (i - mu) ** 2 * p[i];
  let w0 = 0, m0 = 0, bestV = -1, bestT = 0;
  for (let t = 0; t < 255; t++) {
    w0 += p[t]; m0 += t * p[t];
    const w1 = 1 - w0; if (w0 <= 0 || w1 <= 0) continue;
    const v = w0 * w1 * ((m0 / w0) - ((mu - m0) / w1)) ** 2;
    if (v > bestV) { bestV = v; bestT = t; }
  }
  const sep = bestV / vt;
  // valley depth: smoothed histogram, the two modes either side of Otsu's T
  const s = p.map((_, i) => { let a = 0, c = 0; for (let k = -4; k <= 4; k++) if (i + k >= 0 && i + k < 256) { a += p[i + k]; c++; } return a / c; });
  const lo = Math.max(...s.slice(0, bestT)), hi = Math.max(...s.slice(bestT)), val = s[bestT];
  const depth = 1 - val / Math.min(lo, hi);

  // and the actual §2.2 level sweep, since that is what a target would be cut with
  const A = Math.PI * D.R * D.R;
  const Ts = [bestT - 30, bestT - 20, bestT - 10, bestT, bestT + 10, bestT + 20, bestT + 30].filter((t) => t > 0 && t < 255);
  const areas = Ts.map((T) => {
    const raw = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (Math.hypot(x - D.cx, y - D.cy) > 0.93 * D.R) continue;
      if (data[y * W + x] > T) raw[y * W + x] = 1;
    }
    return 100 * largestFilled(raw, W, H).area / A;
  });
  const drift = 100 * (Math.max(...areas) - Math.min(...areas)) / ((Math.max(...areas) + Math.min(...areas)) / 2);

  console.log(`${file}\n   ${note}`);
  console.log(`   Otsu T ${bestT}   separability ${sep.toFixed(4)}   valley depth ${depth.toFixed(4)}`);
  console.log(`   level sweep T ${Ts[0]}..${Ts[Ts.length - 1]}: largest component ${areas.map((a) => a.toFixed(1) + '%').join(' ')}`);
  console.log(`   area drift over +-30 grey levels: ${drift.toFixed(1)}%   ${drift < 15 ? '<- PLATEAU (a target can be cut here)' : '<- NO PLATEAU'}`);
  console.log('');
}
console.log('§2.2: "If your feature does not have a plateau like that, the photograph is not good enough."');
