// D2, second method family — §2.2's LEVEL threshold, after flattening the
// illumination (divide by a heavy blur), which is the standard move for a coin
// that is not a frosted proof on a black field.
//
// This exists so that "D2 is blocked" is not a statement about one segmenter.
// The energy family (_jq21probe.mjs) fails; if the level family also fails, the
// claim is about the photographs.
//
// §4.1 declared bounds, and the two degenerate answers named in advance:
//   area == 0            -> nothing found
//   area == guard area   -> the flood never entered; the answer IS the bound
// Both are failure reports.
import sharp from 'sharp';
import { largestFilled } from '../_qtedge.mjs';
import { DISC, GUARD } from './_jq21seg.mjs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const FILE = process.argv[2] || 'quarter-rev-3.jpg';
const D = FILE === 'quarter-rev-3.jpg' ? DISC : { cx: 374.50, cy: 374.37, R: 374.98 };

const raw = await sharp(P(FILE)).flatten({ background: '#808080' }).greyscale().raw().toBuffer({ resolveWithObject: true });
const W = raw.info.width, H = raw.info.height, g = raw.data;
const A = Math.PI * D.R * D.R;

// guard area, computed not assumed — this is the null bound the sweep must not
// return (§4.1). Two of round 0's three instrument failures were bound-returns.
let guardArea = 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const dx = x - D.cx, dy = y - D.cy, r = Math.hypot(dx, dy) / D.R;
  const th = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
  const inB = th >= GUARD.bottomFrom && th <= GUARD.bottomTo;
  if (r <= 0.93 && !(r > GUARD.main || (inB && r > GUARD.bottom))) guardArea++;
}
console.log(`${FILE} ${W}x${H} R ${D.R}`);
console.log(`NULL BOUNDS: area 0 px (nothing) and area ${guardArea} px = ${(100 * guardArea / A).toFixed(2)}% of disc (the guard itself).`);

// illumination flattening: I / blur(I, sig), sig in units of R
async function flat(sigR) {
  const b = await sharp(P(FILE)).flatten({ background: '#808080' }).greyscale().blur(sigR * D.R).raw().toBuffer();
  const o = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) o[i] = g[i] / Math.max(1, b[i]);
  return o;
}

function levelMask(F, T, polarity) {
  const raw2 = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = x - D.cx, dy = y - D.cy, r = Math.hypot(dx, dy) / D.R;
    if (r > 0.93) continue;
    const th = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
    const inB = th >= GUARD.bottomFrom && th <= GUARD.bottomTo;
    if (r > GUARD.main || (inB && r > GUARD.bottom)) continue;
    const p = y * W + x;
    if (polarity > 0 ? F[p] > T : F[p] < T) raw2[p] = 1;
  }
  return largestFilled(raw2, W, H);
}

const SIG = [0.05, 0.10, 0.20];
const TT = [0.90, 0.94, 0.97, 1.00, 1.03, 1.06, 1.10];
console.log(`\nSWEEP BOUNDS: flatten sigma ${SIG[0]}..${SIG[SIG.length - 1]} R; level T ${TT[0]}..${TT[TT.length - 1]} (ratio to local mean)\n`);
for (const pol of [+1, -1]) {
  console.log(`polarity ${pol > 0 ? 'device BRIGHTER than local mean' : 'device DARKER than local mean'}`);
  console.log('sig   ' + TT.map((t) => t.toFixed(2).padStart(8)).join('') + '   (largest filled component, % of disc)');
  for (const s of SIG) {
    const F = await flat(s);
    const row = [];
    for (const T of TT) {
      const m = levelMask(F, T, pol);
      const pct = 100 * m.area / A;
      const bound = m.area === 0 ? '*' : (Math.abs(m.area - guardArea) / guardArea < 0.01 ? '#' : ' ');
      row.push((pct.toFixed(2) + bound).padStart(8));
    }
    console.log(String(s).padEnd(6) + row.join(''));
  }
  console.log('');
}
console.log('* = nothing found (bound). # = the whole guard region (bound). Neither is a value.');
console.log('the device covers ~35-45% of the disc; a usable segmentation rests there across the sweep.');
