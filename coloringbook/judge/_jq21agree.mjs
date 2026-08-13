// D2 — the self-agreement number, in the same currency round 0 reported
// (contour-vs-contour IoU across the segmenter's own knobs), on the new
// reference, plus the picture that says what the numbers mean.
//
// Round 0, quarter-rev-2.png, energy flood, T 2.5/3.0/3.5:  IoU 0.4705 .. 0.6869
//
// Here the candidate segmentations are the ones the level sweep put at a
// PLAUSIBLE size (35-47% of the disc) — i.e. every setting that a person who
// wanted a target would have been tempted to freeze. If those disagree, the
// target does not exist; if they agree, it does.
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

async function flat(sigR) {
  const b = await sharp(P(FILE)).flatten({ background: '#808080' }).greyscale().blur(sigR * D.R).raw().toBuffer();
  const o = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) o[i] = g[i] / Math.max(1, b[i]);
  return o;
}
function levelMask(F, T, pol) {
  const r2 = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = x - D.cx, dy = y - D.cy, r = Math.hypot(dx, dy) / D.R;
    if (r > 0.93) continue;
    const th = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
    const inB = th >= GUARD.bottomFrom && th <= GUARD.bottomTo;
    if (r > GUARD.main || (inB && r > GUARD.bottom)) continue;
    const p = y * W + x;
    if (pol > 0 ? F[p] > T : F[p] < T) r2[p] = 1;
  }
  return largestFilled(r2, W, H);
}

// the settings that land in the plausible size band, from _jq21grey.mjs's sweep
const CAND = [
  ['bright s0.05 T1.00', 0.05, 1.00, +1],
  ['bright s0.10 T0.97', 0.10, 0.97, +1],
  ['bright s0.10 T1.00', 0.10, 1.00, +1],
  ['bright s0.20 T0.97', 0.20, 0.97, +1],
  ['dark   s0.05 T1.06', 0.05, 1.06, -1],
  ['dark   s0.10 T1.10', 0.10, 1.10, -1],
  ['dark   s0.20 T1.10', 0.20, 1.10, -1],
];

const F = {};
for (const s of [0.05, 0.10, 0.20]) F[s] = await flat(s);

const M = {}, R = {};
for (const [name, s, T, pol] of CAND) {
  const m = levelMask(F[s], T, pol);
  M[name] = m;
  const filled = fillHoles(m.m, W, H);
  let Pc = trace(filled, W, H).map((p) => [p[0], p[1]]);
  Pc = smooth(Pc, 8);
  R[name] = await rasterUV(Pc.map((p) => [(p[0] - D.cx) / D.R, (p[1] - D.cy) / D.R]));
  console.log(`${name}  area ${(100 * m.area / A).toFixed(2)}% of disc  ${Pc.length} contour pts`);
}

console.log('\ncontour agreement (IoU) between candidate segmentations of the SAME photograph:');
const names = CAND.map((c) => c[0]);
console.log('                     ' + names.map((n) => n.slice(0, 6).padStart(8)).join(''));
const all = [];
for (const a of names) {
  const row = [];
  for (const b of names) { const v = iou(R[a], R[b]); row.push(v.toFixed(4).padStart(8)); if (a < b) all.push([a, b, v]); }
  console.log(a.padEnd(21) + row.join(''));
}
const vs = all.map((x) => x[2]);
console.log(`\nSELF-AGREEMENT: min ${Math.min(...vs).toFixed(4)}  max ${Math.max(...vs).toFixed(4)}  (n=${vs.length} pairs)`);
const bright = all.filter((x) => x[0].startsWith('bright') && x[1].startsWith('bright')).map((x) => x[2]);
console.log(`within the BRIGHT family only:  min ${Math.min(...bright).toFixed(4)} max ${Math.max(...bright).toFixed(4)}`);
console.log(`round 0, quarter-rev-2.png, energy flood: 0.4705 .. 0.6869`);
console.log(`\nGATE stated before measuring (_jq21stab.mjs): min pairwise >= 0.97 to freeze.`);
console.log(`RESULT: ${Math.min(...bright) >= 0.97 ? 'MET' : 'MISSED'}`);

// §4.3 — publish what was found.
const S = 470, half = Math.round(1.02 * D.R);
const crop = async (buf) => {
  const png = await sharp(buf, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
  const ext = await sharp(png).extend({ top: half, bottom: half, left: half, right: half, background: { r: 0, g: 0, b: 0 } }).png().toBuffer();
  return sharp(ext).extract({ left: Math.round(D.cx), top: Math.round(D.cy), width: 2 * half, height: 2 * half }).resize(S, S).png().toBuffer();
};
const tiles = [['reference', await crop(Buffer.from(g))]];
for (const [name] of CAND) {
  const b = Buffer.alloc(W * H);
  for (let i = 0; i < W * H; i++) b[i] = M[name].m[i] ? 255 : 40;
  tiles.push([`${name} ${(100 * M[name].area / A).toFixed(0)}%`, await crop(b)]);
}
const cols = 4, rowsN = Math.ceil(tiles.length / cols);
const lab = tiles.map((t, i) => `<text x="${(i % cols) * S + 6}" y="${Math.floor(i / cols) * S + 18}" fill="#0f0" font-size="16" font-family="monospace">${t[0]}</text>`).join('');
await sharp({ create: { width: cols * S, height: rowsN * S, channels: 3, background: '#000' } })
  .composite([...tiles.map((t, i) => ({ input: t[1], left: (i % cols) * S, top: Math.floor(i / cols) * S })),
    { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${cols * S}" height="${rowsN * S}">${lab}</svg>`), left: 0, top: 0 }])
  .png().toFile(dir + '_jq-rev3-candidates.png');
console.log('\nwrote _jq-rev3-candidates.png — LOOK AT IT before believing any of the above.');
