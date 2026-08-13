// D2 diagnosis: WHERE does the field flood get into the device, and can the
// boundary ridge be closed without inventing it?
//
// The energy panel (_jq-rev3-panels.png) shows a device whose boundary is a
// bright ridge nearly all the way round and a field that is dark. The flood
// still walks in, which means the ridge has weak points — a flood is decided by
// its single weakest pixel, and a 2000px photograph has a lot of pixels for one
// of them to be weak in.
//
// So: measure the ridge's weakest point directly, via the barrier map. For the
// device to be floodable-around at all, there must be a T with
//     max(field barrier) < T < min(device-interior barrier)
// and the barrier map hands both of those over. If the two distributions
// overlap, no threshold exists, and no amount of knob-turning will make one.
//
// §4.1: bounds printed. §4.3: the leak points are emitted as coordinates and
// drawn, so the claim "it leaks at 7 o'clock" is a picture and not an assertion.
import sharp from 'sharp';
import { energy, barrier } from '../_qtedge.mjs';
import { DISC, GUARD, guarded } from './_jq21seg.mjs';

const dir = new URL('./', import.meta.url).pathname;
const FILE = process.argv[2] || 'quarter-rev-3.jpg';
const D = FILE === 'quarter-rev-3.jpg' ? DISC : { cx: 374.50, cy: 374.37, R: 374.98 };

// blur the ENERGY (not the image) by a box of radius `rad` px, taking the MAX.
// A grey-dilation closes single-pixel gaps in a ridge without moving the ridge
// crest, which is exactly the defect a flood is sensitive to. Reported as a
// knob and swept, because a knob that is not swept is a knob that decides.
function dilate(G, W, H, rad) {
  const t = new Float32Array(W * H), o = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let m = 0;
    for (let k = -rad; k <= rad; k++) { const xx = x + k; if (xx >= 0 && xx < W) { const v = G[y * W + xx]; if (v > m) m = v; } }
    t[y * W + x] = m;
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let m = 0;
    for (let k = -rad; k <= rad; k++) { const yy = y + k; if (yy >= 0 && yy < H) { const v = t[yy * W + x]; if (v > m) m = v; } }
    o[y * W + x] = m;
  }
  return o;
}

const { G, W, H } = await energy(FILE, D);
console.log(`${FILE}  ${W}x${H}  R ${D.R}`);
console.log('SWEEP BOUNDS: energy-dilation radius 0 .. 12 px; flood T 0.5 .. 8.0');
console.log('an area at 0% or at 100% of the disc is a failure report, not a value (§4.1)\n');

const A = Math.PI * D.R * D.R;
console.log('dil   ' + [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8].map((t) => ('T' + t).padStart(8)).join('') + '   (mask area as % of disc)');
const rows = {};
for (const rad of [0, 2, 4, 6, 8, 12]) {
  const Gd = rad ? dilate(G, W, H, rad) : G;
  const Gg = guarded(Gd, W, H, D);
  const Bar = barrier(Gg, W, H, D);
  const row = [];
  const areas = {};
  for (const T of [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8]) {
    let a = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const p = y * W + x;
      if (Math.hypot(x - D.cx, y - D.cy) <= 0.93 * D.R && Bar[p] > T) a++;
    }
    areas[T] = 100 * a / A;
    row.push(areas[T].toFixed(2).padStart(8));
  }
  rows[rad] = areas;
  console.log(String(rad).padEnd(6) + row.join(''));
}

// The plateau test, stated as a number rather than eyeballed: over the sweep,
// the widest run of consecutive T whose area varies by less than 2% RELATIVE.
console.log('\nplateau (widest run of consecutive T with < 2% relative area change):');
const Ts = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8];
for (const rad of Object.keys(rows)) {
  const a = Ts.map((t) => rows[rad][t]);
  let best = 1, bi = 0, cur = 1, ci = 0;
  for (let i = 1; i < a.length; i++) {
    if (Math.abs(a[i] - a[i - 1]) / Math.max(1e-9, (a[i] + a[i - 1]) / 2) < 0.02) { cur++; if (cur > best) { best = cur; bi = ci; } }
    else { cur = 1; ci = i; }
  }
  console.log(`  dilation ${String(rad).padStart(2)}: longest plateau ${best} thresholds, at T ${Ts[bi]}..${Ts[bi + best - 1]}, area ${a[bi].toFixed(2)}%..${a[bi + best - 1].toFixed(2)}%`);
}
console.log('\n(for scale: our own reverse motif covers ~35-45% of the disc. A "plateau"');
console.log(' at 0.4% or at 85% is the instrument returning nothing or everything.)');
