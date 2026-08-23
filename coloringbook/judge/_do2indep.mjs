// INDEPENDENCE, POLARITY-INVARIANT — because raw grey NCC answers the wrong
// question on this pool.
//
// `_do1pool.mjs` reports the raw-grey matrix, and its largest magnitude is a
// NEGATIVE number: dime-obv-2.jpg against dime-obv-pcgs2015.png at -0.551. A
// strong anti-correlation between two photographs of the same design is not
// "independent", it is the signature of one image with its field polarity
// flipped (frosted device on a black mirror against the same device on a white
// one). Grey NCC cannot tell "different coin" from "same coin, other lighting".
//
// So the descriptor here is the one that does not care: blurred |grad I|, which
// is large at a relief EDGE whichever side of it is bright. That is also the
// descriptor T1 scores, so the numbers are commensurable with the transfer
// gate. Two frames of the same photograph correlate ~0.9+; two photographs of
// the same design correlate far lower.
//
// A second, independent check is run beside it: the ANGLE of the profile's
// silhouette landmarks in each file's own disc frame. Two crops of one
// photograph put the crown, the nose and the truncation on the same viewBox
// coordinates to a fraction of a unit; two photographs do not.
//
// usage: node coloringbook/judge/_do2indep.mjs
import { POOL, samplerFor } from './_dolib.mjs';

const N = 200, RMAX = 45;
const idx = [];
for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
  const x = 50 + ((i + 0.5) / N - 0.5) * 92, y = 50 + ((j + 0.5) / N - 0.5) * 92;
  if (Math.hypot(x - 50, y - 50) <= RMAX) idx.push([x, y]);
}

async function descriptor(f) {
  const s = await samplerFor(f);
  const h = 0.6; // viewBox units — ~6 source px on the big files
  const v = idx.map(([x, y]) => {
    const gx = (s.at(x + h, y) ?? 128) - (s.at(x - h, y) ?? 128);
    const gy = (s.at(x, y + h) ?? 128) - (s.at(x, y - h) ?? 128);
    return Math.hypot(gx, gy);
  });
  // blur along the sample list is meaningless; blur in viewBox space instead
  const m = v.reduce((a, b) => a + b, 0) / v.length;
  const c = v.map((q) => q - m);
  const nrm = Math.sqrt(c.reduce((a, b) => a + b * b, 0));
  return c.map((q) => q / nrm);
}

const D = {};
for (const f of POOL) D[f] = await descriptor(f);

const short = (f) => f.replace('dime-obv', 'd').replace(/\.(jpg|png)$/, '');
console.log('EDGE-ENERGY NCC (polarity-invariant), device disc r<=45');
process.stdout.write('   '.padEnd(20));
for (const f of POOL) process.stdout.write(short(f).padStart(11));
process.stdout.write('\n');
const pairs = [];
for (const a of POOL) {
  process.stdout.write('   ' + short(a).padEnd(17));
  for (const b of POOL) {
    let s = 0;
    for (let i = 0; i < D[a].length; i++) s += D[a][i] * D[b][i];
    process.stdout.write(s.toFixed(3).padStart(11));
    if (a < b) pairs.push([s, a, b]);
  }
  process.stdout.write('\n');
}
pairs.sort((p, q) => q[0] - p[0]);
console.log('\n   ranked pairs (top 6):');
for (const [s, a, b] of pairs.slice(0, 6)) console.log(`     ${s.toFixed(4)}  ${a}  vs  ${b}`);
console.log(`     ...`);
console.log(`     ${pairs[pairs.length - 1][0].toFixed(4)}  ${pairs[pairs.length - 1][1]}  vs  ${pairs[pairs.length - 1][2]}  (lowest)`);

// ── landmark check ───────────────────────────────────────────────────────
// The device/field boundary, walked inward from the field on 360 rays, at the
// file's own threshold. Reports the extreme landmarks in viewBox units.
console.log('\nSILHOUETTE LANDMARKS in each file\'s own disc frame (viewBox units)');
console.log('   file                      crown y   nose x   back x   trunc y   T(sep)');
for (const f of POOL) {
  const s = await samplerFor(f);
  // field level: the annulus just inside the rim seat, 40.5..42.5
  const ring = [];
  for (let a = 0; a < 360; a += 1) for (let r = 40.5; r <= 42.5; r += 0.5) {
    const q = s.at(50 + r * Math.cos((a * Math.PI) / 180), 50 + r * Math.sin((a * Math.PI) / 180));
    if (q != null) ring.push(q);
  }
  ring.sort((a, b) => a - b);
  const field = ring[ring.length >> 1];
  // device level: the cheek, a box the bust covers on every dime
  const dev = [];
  for (let x = 46; x <= 54; x += 0.25) for (let y = 44; y <= 52; y += 0.25) {
    const q = s.at(x, y);
    if (q != null) dev.push(q);
  }
  dev.sort((a, b) => a - b);
  const device = dev[dev.length >> 1];
  const T = (field + device) / 2, upIsDevice = device > field;
  const isDev = (x, y) => {
    const q = s.at(x, y);
    if (q == null) return false;
    return upIsDevice ? q > T : q < T;
  };
  // walk inward on rays; first radius where 4 consecutive samples are device
  const hit = (adeg) => {
    const t = (adeg * Math.PI) / 180, ct = Math.cos(t), st = Math.sin(t);
    for (let r = 42; r > 2; r -= 0.2) {
      let ok = true;
      for (let k = 0; k < 4; k++) if (!isDev(50 + ct * (r - k * 0.2), 50 + st * (r - k * 0.2))) { ok = false; break; }
      if (ok) return r;
    }
    return null;
  };
  let crownY = 99, noseX = -99, backX = 99, truncY = -99;
  for (let a = 0; a < 360; a += 0.5) {
    const r = hit(a);
    if (r == null) continue;
    const x = 50 + r * Math.cos((a * Math.PI) / 180), y = 50 + r * Math.sin((a * Math.PI) / 180);
    if (y < crownY) crownY = y;
    if (x > noseX) noseX = x;
    if (x < backX) backX = x;
    if (y > truncY) truncY = y;
  }
  console.log(
    '  ', f.padEnd(25),
    crownY.toFixed(2).padStart(7), noseX.toFixed(2).padStart(8),
    backX.toFixed(2).padStart(8), truncY.toFixed(2).padStart(9),
    `${Math.abs(device - field).toFixed(0)}`.padStart(8),
  );
}
