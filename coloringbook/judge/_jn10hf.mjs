// NICKEL round 0 — D5-HF: along-band high-frequency energy, ours / reference.
//
// FROZEN LOCUS (§6.1), and it is NOT a function of our drawing. Round 2 on the
// quarter found a lettering eval computing its evaluation radius from our own
// parsed glyph geometry and sampling the REFERENCE there too, so the
// photograph's score moved when our drawing moved. The radii below come from
// `_jn5rim.mjs`'s high-pass band on the REFERENCES ONLY, are written here as
// literals, and are the mid-radius of that band:
//
//   reverse  band 36.9 .. 43.1  ->  r = 40.00,  sector 225..315 (E PLURIBUS UNUM)
//                                   r = 40.00,  sector  30..150 (UNITED STATES ...)
//   obverse  band 36.9 .. 43.2  ->  r = 40.05,  sector 140..210 (IN GOD WE TRUST)
//                                   r = 40.05,  sector 318..352 (LIBERTY)
//
// REFERENCE-INVARIANCE TEST (§6.1, mandatory): the reference side of every
// ratio is computed from the photograph, the frozen disc and the literal radius
// alone. To prove it, the run scores the SAME reference against our live art and
// against `coloringbook/pre-nickel.js` (a different revision) and asserts every
// reference-side number is BIT-IDENTICAL. If one moves, this instrument is
// UNTRUSTED and so is every ratio it has published.
//
// Both sides are reduced to the tier's REAL device pixel count and normalised by
// their own p90 field level, so the ratio is dimensionless. No upsampling
// anywhere (§22.1) — one viewBox point maps to one device pixel.
//
// §4.1: the sampling is not a search, so there is no bound to report; instead
// the number of independent device samples along the arc is printed, and a band
// with fewer than 12 is reported as unresolvable rather than as a value.
//
// Run: node coloringbook/judge/_jn10hf.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { grey, at, XY2px } from '../_rvnorm.mjs';
import { COIN_SCALE } from '../../src/art/coins.js';

const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const JD = JSON.parse(readFileSync(HERE('_jn1discs.json')));

const JOBS = [
  { side: 'reverse', name: 'E PLURIBUS UNUM', r: 40.00, sector: [225, 315], ref: 'nickel-rev-2.png' },
  { side: 'reverse', name: 'UNITED STATES OF AMERICA', r: 40.00, sector: [30, 150], ref: 'nickel-rev-2.png' },
  { side: 'obverse', name: 'IN GOD WE TRUST', r: 40.05, sector: [140, 210], ref: 'nickel-obv.jpg' },
  { side: 'obverse', name: 'LIBERTY', r: 40.05, sector: [318, 352], ref: 'nickel-obv.jpg' },
];
const SIZES = [26, 44, 54, 84, 120, 190];

const pick = (buf, W, X, Y) => buf[Math.min(W - 1, Math.max(0, Math.floor(Y / 100 * W))) * W + Math.min(W - 1, Math.max(0, Math.floor(X / 100 * W)))];
const p90 = (a) => { const s = Array.from(a).sort((x, y) => x - y); return s[(s.length * 0.9) | 0]; };
const hfOf = (v) => { let s = 0; for (let i = 1; i < v.length; i++) s += Math.abs(v[i] - v[i - 1]); return s / (v.length - 1); };

async function ourBuf(mod, size, side) {
  const boxW = Math.round(size * COIN_SCALE.nickel);
  const b = await sharp(Buffer.from(mod.coinSVG('nickel', size, { side }))).flatten({ background: '#ffffff' })
    .greyscale().resize(boxW, boxW, { fit: 'fill' }).raw().toBuffer();
  if (b.length !== boxW * boxW) throw new Error('channel surprise — D5 UNTRUSTED');
  return { b, boxW };
}
async function refBuf(file, boxW) {
  const g = await grey(file), d = JD[file];
  const out = Buffer.alloc(boxW * boxW), step = 100 / boxW;
  for (let j = 0; j < boxW; j++) for (let i = 0; i < boxW; i++) {
    let s = 0;
    for (let a = 0; a < 3; a++) for (let bq = 0; bq < 3; bq++) {
      const [px, py] = XY2px(d, (i + (a + 0.5) / 3) * step, (j + (bq + 0.5) / 3) * step);
      s += at(g, px, py);
    }
    out[j * boxW + i] = Math.round(s / 9);
  }
  return out;
}
// sample the arc at ~one device pixel of arc length
function arc(buf, boxW, r, [a0, a1]) {
  const arcLen = (Math.abs(a1 - a0) * Math.PI / 180) * r;      // viewBox units
  const n = Math.max(2, Math.round(arcLen * boxW / 100));
  const v = [];
  for (let k = 0; k < n; k++) {
    const a = ((a0 + (a1 - a0) * k / (n - 1)) * Math.PI) / 180;
    v.push(pick(buf, boxW, 50 + r * Math.cos(a), 50 + r * Math.sin(a)));
  }
  const f = p90(v) || 1;
  return { v: v.map((x) => x / f), n };
}

const live = await import('../../src/art/coins.js');
let old = null;
try { old = await import('../pre-nickel.js'); } catch { /* snapshot import may fail */ }

console.log('D5-HF. Gate: ours <= 1.5x the reference, one-sided (undershoot is the safe side, §22.4),');
console.log('at the frozen radii and sectors above, at every tier that DRAWS letters.\n');
console.log('side     legend                     size  devpx  samples  refHF   ourHF   ratio   ours draws letters?');
const OUT = {}, refCheck = {};
for (const job of JOBS) {
  for (const size of SIZES) {
    const { b, boxW } = await ourBuf(live, size, job.side);
    const rb = await refBuf(job.ref, boxW);
    const A = arc(rb, boxW, job.r, job.sector), B = arc(b, boxW, job.r, job.sector);
    const rh = hfOf(A.v), oh = hfOf(B.v);
    const svg = live.coinSVG('nickel', size, { side: job.side });
    const draws = (svg.match(/<text/g) || []).length > 0;
    const key = `${job.side}|${job.name}|${size}`;
    refCheck[key] = rh;
    OUT[key] = { refHF: +rh.toFixed(4), ourHF: +oh.toFixed(4), ratio: rh > 0 ? +(oh / rh).toFixed(4) : null, samples: A.n, draws };
    console.log(`${job.side.slice(0, 3).padEnd(8)} ${job.name.padEnd(26)} ${String(size).padStart(4)} ${String(boxW).padStart(6)} ${String(A.n).padStart(8)}  ${rh.toFixed(4)}  ${oh.toFixed(4)}  ${(rh > 0 ? (oh / rh).toFixed(3) + 'x' : '—').padStart(7)}   ${draws ? 'yes' : 'NO — the coin has a legend here and we draw none'}` +
      (A.n < 12 ? '   <-- fewer than 12 device samples: unresolvable, not a value' : ''));
  }
}

if (old) {
  console.log('\nREFERENCE-INVARIANCE TEST (§6.1): same reference, different revision of our art.');
  let bad = 0;
  for (const job of JOBS) for (const size of SIZES) {
    const { boxW } = await ourBuf(old, size, job.side);
    const rb = await refBuf(job.ref, boxW);
    const rh = hfOf(arc(rb, boxW, job.r, job.sector).v);
    if (rh !== refCheck[`${job.side}|${job.name}|${size}`]) { bad++; console.log(`  MOVED: ${job.side} ${job.name} ${size}: ${refCheck[`${job.side}|${job.name}|${size}`]} -> ${rh}`); }
  }
  console.log(bad === 0 ? '  PASS — every reference-side number bit-identical across two revisions of our art.'
    : `  FAIL — ${bad} reference-side numbers moved. This instrument is UNTRUSTED (§6.1).`);
} else {
  console.log('\nREFERENCE-INVARIANCE TEST: could not import coloringbook/pre-nickel.js — NOT RUN.');
}
console.log('\n' + JSON.stringify(OUT));
