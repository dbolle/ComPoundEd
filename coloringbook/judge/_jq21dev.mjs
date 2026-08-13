// D2, fair round two. _jq21agree.mjs's masks are the FIELD, not the device —
// the eagle shows as a negative hole in every one of them. IoU is not
// complement-invariant, so scoring the field's agreement and reporting it as
// the device's would be the wrong number, in the coin's favour or against it.
//
// So: DEVICE = (guard region) minus (largest field component), holes filled,
// largest component kept. Then the same self-agreement test, and the same
// picture, on the thing D2 actually scores.
import sharp from 'sharp';
import { largestFilled } from '../_qtedge.mjs';
import { DISC, GUARD, rasterUV, iou, fillHoles, smooth } from './_jq21seg.mjs';
import { trace } from '../_nktrace.mjs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const dir = new URL('./', import.meta.url).pathname;
const FILE = 'quarter-rev-3.jpg', D = DISC;

const raw = await sharp(P(FILE)).flatten({ background: '#808080' }).greyscale().raw().toBuffer({ resolveWithObject: true });
const W = raw.info.width, H = raw.info.height, g = raw.data;
const A = Math.PI * D.R * D.R;

const inGuard = new Uint8Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const dx = x - D.cx, dy = y - D.cy, r = Math.hypot(dx, dy) / D.R;
  if (r > 0.93) continue;
  const th = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
  const inB = th >= GUARD.bottomFrom && th <= GUARD.bottomTo;
  if (r > GUARD.main || (inB && r > GUARD.bottom)) continue;
  inGuard[y * W + x] = 1;
}

async function flat(sigR) {
  const b = await sharp(P(FILE)).flatten({ background: '#808080' }).greyscale().blur(sigR * D.R).raw().toBuffer();
  const o = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) o[i] = g[i] / Math.max(1, b[i]);
  return o;
}
function device(F, T, pol) {
  const fld = new Uint8Array(W * H);
  for (let p = 0; p < W * H; p++) if (inGuard[p] && (pol > 0 ? F[p] > T : F[p] < T)) fld[p] = 1;
  const big = largestFilled(fld, W, H);            // the field, holes filled
  const dev = new Uint8Array(W * H);
  for (let p = 0; p < W * H; p++) if (inGuard[p] && !big.m[p]) dev[p] = 1;
  return largestFilled(dev, W, H);                  // the device
}

const CAND = [
  ['s0.05 T1.00', 0.05, 1.00, +1], ['s0.10 T0.97', 0.10, 0.97, +1],
  ['s0.10 T1.00', 0.10, 1.00, +1], ['s0.20 T0.97', 0.20, 0.97, +1],
  ['s0.20 T1.00', 0.20, 1.00, +1],
];
const F = {};
for (const s of [0.05, 0.10, 0.20]) F[s] = await flat(s);

const M = {}, R = {};
for (const [n, s, T, pol] of CAND) {
  const m = device(F[s], T, pol);
  M[n] = m;
  let Pc = trace(fillHoles(m.m, W, H), W, H).map((p) => [p[0], p[1]]);
  Pc = smooth(Pc, 10);
  R[n] = await rasterUV(Pc.map((p) => [(p[0] - D.cx) / D.R, (p[1] - D.cy) / D.R]));
  console.log(`${n}  DEVICE area ${(100 * m.area / A).toFixed(2)}% of disc  ${Pc.length} pts`);
}
const names = CAND.map((c) => c[0]);
console.log('\nDEVICE contour agreement (IoU) across the segmenter\'s own knobs:');
console.log('             ' + names.map((n) => n.padStart(12)).join(''));
const all = [];
for (const a of names) {
  const row = [];
  for (const b of names) { const v = iou(R[a], R[b]); row.push(v.toFixed(4).padStart(12)); if (a < b) all.push(v); }
  console.log(a.padEnd(13) + row.join(''));
}
console.log(`\nDEVICE SELF-AGREEMENT: min ${Math.min(...all).toFixed(4)}  max ${Math.max(...all).toFixed(4)}`);
console.log(`round 0 (quarter-rev-2.png, energy flood):  0.4705 .. 0.6869`);
console.log(`GATE stated before measuring: min pairwise >= 0.97.  RESULT ${Math.min(...all) >= 0.97 ? 'MET' : 'MISSED'}`);
console.log(`D2's own gate is IoU >= 0.95; the target's ambiguity is ${(1 - Math.min(...all)).toFixed(4)}, i.e. ${((1 - Math.min(...all)) / 0.05).toFixed(1)}x the resolution the gate is asked for.`);

const S = 470, half = Math.round(1.02 * D.R);
const crop = async (buf) => {
  const png = await sharp(buf, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
  const ext = await sharp(png).extend({ top: half, bottom: half, left: half, right: half, background: { r: 0, g: 0, b: 0 } }).png().toBuffer();
  return sharp(ext).extract({ left: Math.round(D.cx), top: Math.round(D.cy), width: 2 * half, height: 2 * half }).resize(S, S).png().toBuffer();
};
const tiles = [['reference', await crop(Buffer.from(g))]];
for (const [n] of CAND) {
  const b = Buffer.alloc(W * H);
  for (let i = 0; i < W * H; i++) b[i] = M[n].m[i] ? 255 : 40;
  tiles.push([`${n}  ${(100 * M[n].area / A).toFixed(0)}%`, await crop(b)]);
}
const cols = 3, rowsN = Math.ceil(tiles.length / cols);
const lab = tiles.map((t, i) => `<text x="${(i % cols) * S + 6}" y="${Math.floor(i / cols) * S + 18}" fill="#0f0" font-size="16" font-family="monospace">${t[0]}</text>`).join('');
await sharp({ create: { width: cols * S, height: rowsN * S, channels: 3, background: '#000' } })
  .composite([...tiles.map((t, i) => ({ input: t[1], left: (i % cols) * S, top: Math.floor(i / cols) * S })),
    { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${cols * S}" height="${rowsN * S}">${lab}</svg>`), left: 0, top: 0 }])
  .png().toFile(dir + '_jq-rev3-device.png');
console.log('\nwrote _jq-rev3-device.png');
