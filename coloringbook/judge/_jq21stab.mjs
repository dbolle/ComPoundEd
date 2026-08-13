// ROUND 2 — the D2 self-agreement test, exactly as round 0 ran it, on the new
// reference, plus the barrier segmenter as a second, independent method.
//
// The verdict rule is stated HERE, BEFORE any value exists (§8, §6.1):
//
//   D2's gate is IoU >= 0.95 against the frozen mask. A target whose own
//   threshold-to-threshold spread is comparable to the gate's headroom cannot
//   support it. Round 0's spread was 0.4705..0.6869. I will freeze a target
//   only if BOTH of the following hold:
//     (a) the MINIMUM pairwise IoU between contours from the swept thresholds
//         is >= 0.97 — i.e. the target's own ambiguity is at most 0.03, less
//         than half the 0.05 the gate is asked to resolve; and
//     (b) the two segmenters (flood and barrier) agree with EACH OTHER at
//         IoU >= 0.95 at their respective plateau centres — method-independence,
//         not just knob-independence.
//   Anything less and D2 stays BLOCKED. This threshold is written down now so
//   it cannot be chosen after the numbers are seen.
import { energy, barrier, largestFilled } from '../_qtedge.mjs';
import { FILE, DISC, GUARD, guarded, floodMask, contour, rasterUV, iou } from './_jq21seg.mjs';

const TF = [2.0, 2.5, 3.0, 3.5, 4.0];        // flood thresholds (declared bounds)
const TB = [2.0, 3.0, 4.0, 5.0, 6.0, 8.0];   // barrier thresholds (declared bounds)

const { G, W, H } = await energy(FILE, DISC);
const Gg = guarded(G, W, H, DISC);
const A = Math.PI * DISC.R * DISC.R;

console.log(`ref ${FILE}  ${W}x${H}  disc R ${DISC.R}`);
console.log(`guard ${JSON.stringify(GUARD)}`);

console.log('\n=== A. plain energy flood (round 0 method), area plateau ===');
console.log(`search bounds: T ${TF[0]} .. ${TF[TF.length - 1]}`);
const fm = {};
for (const T of TF) {
  const s = floodMask(Gg, W, H, DISC, T);
  fm[T] = s;
  console.log(`  T ${T.toFixed(1)}  area ${s.area}px = ${(100 * s.area / A).toFixed(2)}% of disc  eqR/R ${(s.eqR / DISC.R).toFixed(4)}  blobs ${s.blobs}`);
}

console.log('\n=== B. barrier map {Bar > T} (§_qtedge.barrier), area plateau ===');
console.log(`search bounds: T ${TB[0]} .. ${TB[TB.length - 1]}`);
const Bar = barrier(Gg, W, H, DISC);
const bm = {};
for (const T of TB) {
  const raw = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = y * W + x;
    if (Math.hypot(x - DISC.cx, y - DISC.cy) <= 0.93 * DISC.R && Bar[p] > T) raw[p] = 1;
  }
  const s = largestFilled(raw, W, H);
  bm[T] = s;
  console.log(`  T ${T.toFixed(1)}  area ${s.area}px = ${(100 * s.area / A).toFixed(2)}% of disc  eqR/R ${(s.eqR / DISC.R).toFixed(4)}  blobs ${s.blobs}`);
}

console.log('\n=== contours, crest-refined, and their agreement WITH EACH OTHER ===');
const C = {}, R = {};
for (const T of TF) { C['F' + T] = contour(fm[T].m, W, H, G, DISC); R['F' + T] = await rasterUV(C['F' + T].uv); }
for (const T of TB) { C['B' + T] = contour(bm[T].m, W, H, G, DISC); R['B' + T] = await rasterUV(C['B' + T].uv); }

const keys = Object.keys(R);
console.log('        ' + keys.map((k) => k.padStart(8)).join(''));
const vals = {};
for (const a of keys) {
  const row = [];
  for (const b of keys) { const v = iou(R[a], R[b]); vals[a + '|' + b] = v; row.push(v.toFixed(4).padStart(8)); }
  console.log(a.padEnd(8) + row.join(''));
}

const pair = (ks) => {
  const out = [];
  for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) out.push(vals[ks[i] + '|' + ks[j]]);
  return out;
};
const fk = TF.map((t) => 'F' + t), bk = TB.map((t) => 'B' + t);
const fp = pair(fk), bp = pair(bk);
console.log(`\nflood   pairwise IoU: min ${Math.min(...fp).toFixed(4)} max ${Math.max(...fp).toFixed(4)}`);
console.log(`barrier pairwise IoU: min ${Math.min(...bp).toFixed(4)} max ${Math.max(...bp).toFixed(4)}`);
const cross = [];
for (const a of fk) for (const b of bk) cross.push([a, b, vals[a + '|' + b]]);
cross.sort((x, y) => y[2] - x[2]);
console.log(`cross-method best: ${cross[0][0]} vs ${cross[0][1]} = ${cross[0][2].toFixed(4)};  worst ${cross[cross.length - 1][2].toFixed(4)}`);
console.log(`\nround 0 on quarter-rev-2.png, for comparison: 0.4705 .. 0.6869`);
console.log(`\nGATE (a) min pairwise >= 0.97   -> flood ${Math.min(...fp) >= 0.97 ? 'MET' : 'MISSED'} (${Math.min(...fp).toFixed(4)}), barrier ${Math.min(...bp) >= 0.97 ? 'MET' : 'MISSED'} (${Math.min(...bp).toFixed(4)})`);
console.log(`GATE (b) cross-method >= 0.95   -> ${cross[0][2] >= 0.95 ? 'MET' : 'MISSED'} (best ${cross[0][2].toFixed(4)})`);
