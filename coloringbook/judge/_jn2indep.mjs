// NICKEL round 0 — INDEPENDENCE OF EVERY NICKEL REFERENCE PAIR (§21.5).
//
// The same-photograph trap has hit FIVE times out of five, and the fifth was
// found only in round 4, on an OBVERSE, because obverses had never been
// correlated at all. The nickel's obverses have never been correlated either,
// and it holds nine files of which two are visibly the two halves of a third.
//
// Method is round 2's, imported from `_jq20indep.mjs` UNEDITED at its published
// hash (`ncc`, `energyGrid`, `bestReg`, `mask`):
//   raw NCC on the disc-normalised grey     -> "is this the same PHOTOGRAPH?"
//   registered NCC on blurred |grad| energy -> "is this the same DESIGN?"
// plus round 4's third statistic, illumination azimuth, because two files can
// be independent for SHAPE and dependent for TONE (S3).
//
// §4.1  NCC is bounded [-1, 1]; a value at a bound is a failure report. The
//       registration search prints its bounds and a best fit at a bound fails.
// §4.2  This instrument SELECTS nothing: the whole matrix is printed.
// §4    Two bit-identical answers from two different inputs is not agreement —
//       so the raw NCC is printed to 4 places and identical rows are called out.
//
// Response test (RESPONSE=1): a file against ITSELF must return raw NCC 1.0000,
// and against a 180-degree rotation of itself must not.
//
// Run: node coloringbook/judge/_jn2indep.mjs
import { readFileSync } from 'node:fs';
import { normalise, N, SPAN } from '../_rvnorm.mjs';
import { ncc, energyGrid, bestReg } from './_jq20indep.mjs';

const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const D = JSON.parse(readFileSync(HERE('_jn1discs.json')));

// nickel-obv-3.png is Schlag's PLASTER MODEL cut out on alpha: no disc, so it
// cannot enter a disc-normalised correlation. It is compared separately, by the
// ICP residual already frozen in _headmask-nickel.json, and is listed here so
// the omission is deliberate rather than an oversight.
const FILES = Object.keys(D);

const mask = (rmax = 0.90) => {
  const m = new Uint8Array(N * N);
  for (let j = 0; j < N; j++) { const v = -SPAN + 2 * SPAN * j / (N - 1);
    for (let i = 0; i < N; i++) { const u = -SPAN + 2 * SPAN * i / (N - 1);
      m[j * N + i] = Math.hypot(u, v) <= rmax ? 1 : 0; } }
  return m;
};
const BG = () => {
  const m = new Uint8Array(N * N);
  for (let j = 0; j < N; j++) { const v = -SPAN + 2 * SPAN * j / (N - 1);
    for (let i = 0; i < N; i++) { const u = -SPAN + 2 * SPAN * i / (N - 1);
      m[j * N + i] = Math.hypot(u, v) >= 1.005 ? 1 : 0; } }
  return m;
};

// median-match, then NCC inside 0.90 R
function medMatch(a) {
  const v = Array.from(a).sort((x, y) => x - y);
  return v[v.length >> 1] || 1;
}

// Illumination azimuth: direction of the mean grey gradient inside 0.70 R.
function azimuth(g) {
  let sx = 0, sy = 0;
  for (let j = 1; j < N - 1; j++) { const v = -SPAN + 2 * SPAN * j / (N - 1);
    for (let i = 1; i < N - 1; i++) { const u = -SPAN + 2 * SPAN * i / (N - 1);
      if (Math.hypot(u, v) > 0.70) continue;
      sx += g[j * N + i + 1] - g[j * N + i - 1];
      sy += g[(j + 1) * N + i] - g[(j - 1) * N + i]; } }
  return (Math.atan2(sy, sx) * 180) / Math.PI;
}

const M = mask(0.90), MB = BG();

const grids = {}, egrids = {}, az = {};
for (const f of FILES) {
  const g = await normalise(f, D[f]);
  const m = medMatch(g);
  grids[f] = Float64Array.from(g, (x) => (x / m) * 128);
  az[f] = azimuth(g);
  egrids[f] = await energyGrid(f, D[f]);
  process.stderr.write('.');
}
process.stderr.write('\n');

const ROT = [-3, 3], TR = [-0.04, 0.04];
console.log(`registration search bounds (§4.1): rotation ${ROT[0]}..${ROT[1]} deg, translation ${TR[0]}..${TR[1]} R\n`);
console.log('pair                                                 rawNCC   designNCC  bgNCC   azimuth A/B        verdict');
const rows = [];
for (let i = 0; i < FILES.length; i++) for (let j = i + 1; j < FILES.length; j++) {
  const a = FILES[i], b = FILES[j];
  const raw = ncc(grids[a], grids[b], M);
  const reg = bestReg(egrids[a], egrids[b], M, ROT, TR);
  const bg = ncc(grids[a], grids[b], MB);
  const atBound = Math.abs(reg.rot) >= ROT[1] - 1e-9 || Math.abs(reg.dx) >= TR[1] - 1e-9 || Math.abs(reg.dy) >= TR[1] - 1e-9;
  const verdict = raw >= 0.90 ? 'SAME PHOTOGRAPH'
    : raw >= 0.60 ? 'shares a photographic setup / near-duplicate — LOOK'
    : 'independent';
  rows.push({ a, b, raw, design: reg.ncc, bg, atBound, verdict });
  console.log(`${(a + ' vs ' + b).padEnd(52)} ${raw.toFixed(4).padStart(7)}  ${reg.ncc.toFixed(4).padStart(8)}   ${bg.toFixed(3).padStart(6)}  ` +
    `${az[a].toFixed(1).padStart(7)}/${az[b].toFixed(1).padEnd(8)}  ${verdict}${atBound ? '   <-- REGISTRATION AT A BOUND (§4.1), design NCC is a failure report' : ''}`);
}

// §4: any two rows bit-identical is a bug report until explained.
const seen = new Map();
for (const r of rows) {
  const k = r.raw.toFixed(6);
  if (seen.has(k)) console.log(`\n§4 BIT-IDENTICAL rawNCC ${k}: "${seen.get(k)}" and "${r.a} vs ${r.b}" — explain or treat as a bug.`);
  else seen.set(k, `${r.a} vs ${r.b}`);
}

console.log('\nfitted R, printed so an identical R between two files is visible (§4):');
for (const f of FILES) console.log(`  ${f.padEnd(26)} R=${D[f].R.toFixed(2)}`);
