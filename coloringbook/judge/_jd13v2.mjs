// D13 v2 — device against field, with a FIELD LEVEL THAT IS THE FIELD.
//
// ── WHY THERE IS A v2 ──────────────────────────────────────────────────────
// v1 (`_x6dark.mjs` on the reverse, `_jd10d13.mjs` / `_jn9d13.mjs` / `_r3d13.mjs`
// on the obverse) normalises by the **p90 of the disc interior**. That is a
// field level only when the brightest tenth of the interior is field. It often
// is not: the brightest thing on a struck coin photographed with a point
// source is a specular highlight ON THE DEVICE.
//
// Measured, with bare-field patches drawn on the source and looked at
// (`_jl4fieldtest.mjs`, `_jl4field-*.png`) — bare field ÷ p90:
//
//     dime-rev-2.jpg      0.487      quarter-rev-2.png   0.677
//     penny-rev-2.png     0.757      nickel-rev-2.png    0.949
//
// So on three of four reverse references the coin's own field is classified as
// INK, the reference's "ink fraction" is largely its field, and Δ mean/field
// is biased by the photograph's lighting rather than by our drawing. Our flat
// SVG field sits exactly at its own p90 and can never be ink, so the bias has
// a sign: Δ ink pushed negative, Δ mean/field pushed positive.
//
// ── THE FIX, DECLARED BEFORE IT WAS USED ───────────────────────────────────
// Field level = the **MODE of the interior histogram**. The field is the
// largest single-tone region on any struck coin, so the most common grey IS
// the field — for either polarity, with no per-design literals.
//
// Hand-placed bare-field patches were tried first and rejected: four of six
// frozen centres land on leaves on the Roosevelt reverse, and a metric needing
// six hand-chosen literals per design does not scale to five denominations.
//
// Against overlay-verified bare field, in GREY LEVELS (a ratio is asymmetric
// about 1 and misranks this):
//
//     reference                 field   mode err   p90 err
//     dime-rev-unc2005.png      217.3      12         14
//     dime-rev-2.jpg             43.1      20        171
//     dime-rev-proofbright.png  247.8       1          1
//     nickel-rev-2.png          247.0       3          0
//
// As good as p90 where p90 works, ~8x better where it fails.
//
// ── AND THE FIX IS WRONG. THIS FILE IS A NEGATIVE RESULT. ──────────────────
//
// Do not adopt v2. Running it is what showed why, and it was declared before
// use precisely so this could happen in the open.
//
// "The field is the largest single-tone region on any struck coin" is TRUE of
// a coin and FALSE of the locus this metric uses. Inside r < 40 at the ICON
// tier the DEVICE covers most of the interior, so the mode is the device.
// Measured on our own renders at 26px — the fraction of the interior within
// two grey levels of p90, i.e. plausibly field:
//
//     penny obverse    mode  74 vs p90 151    field-ish 0.13
//     nickel obverse   mode 117 vs p90 212    field-ish 0.23
//     dime obverse     mode 117 vs p90 212    field-ish 0.17
//     quarter obverse  mode 117 vs p90 212    field-ish 0.27
//     quarter reverse  mode 116 vs p90 212    field-ish 0.26
//     penny reverse    mode  98 vs p90 151    field-ish 0.37
//     nickel reverse   mode 213 vs p90 212    field-ish 0.52   <- mode IS field
//     dime reverse     mode 210 vs p90 212    field-ish 0.41   <- mode IS field
//
// Six of eight faces divide by the device. That is why v2's Δ mean/field
// swings positive everywhere (+0.17 to +0.41) and fails MORE faces than v1.
//
// The earlier validation missed it because it only ever tested REVERSE
// references — the two faces where the field does dominate. A validation set
// that contains only the cases where a rule holds is not a validation.
//
// What survives: the DIAGNOSIS of v1 is still correct and still measured — on
// three of four reverse references the p90 is a specular highlight on the
// device and the reference's own field is counted as ink. Both normalisers are
// wrong, for opposite reasons, and neither is a field level.
//
// What a sound one needs is a LOCUS where field actually dominates — an
// annulus clear of the device and clear of the legend band — and where that
// annulus lies is a fact about each design, which is a segmentation. D2 is
// BLOCKED on exactly that. So D13 and D2 are blocked on one missing thing, and
// this file is the evidence for it rather than a fix for either.
//
// ── WHAT THIS FILE DOES ────────────────────────────────────────────────────
// It does not replace v1. It prints BOTH normalisers side by side, so the
// claim above can be re-derived by anyone, and so v1's numbers keep a
// published comparison to be retracted against if a third normaliser ever
// earns adoption (§1.1 — retract beside, never rewrite). v1 keeps its hash and
// keeps running.
//
// Run: node coloringbook/judge/_jd13v2.mjs [size]
//      SRC=./path/to/coins.js   score a different revision (invariance test)
//      RESPONSE=1               the response test only
import sharp from 'sharp';
import { grey, at, XY2px } from '../_rvnorm.mjs';

const SIZE = +(process.argv[2] || 26);
const SRC = process.env.SRC || '../../src/art/coins.js';
const { coinSVG, COIN_SCALE } = await import(SRC);
const RAD = 40;   // disc interior, v1's locus, unchanged
const INK = 0.85; // v1's frozen ink threshold, unchanged

// Every disc registration below is QUOTED from a frozen file, not re-fitted
// here, so this instrument introduces no new fit of its own:
//   reverse         _rvnorm.mjs DISCS
//   dime obverse    _jd1discs.json      penny obverse   _jp1discs.json
//   nickel obverse  _jn1discs.json      quarter obverse _r3d13.mjs REFS
const REFS = {
  penny: {
    obverse: { file: 'penny-obv-3.jpg', D: { cx: 999.79, cy: 993.56, R: 986.97 } },
    reverse: { file: 'penny-rev-2.png', D: { cx: 371.75, cy: 372.04, R: 372.61 } },
  },
  nickel: {
    obverse: { file: 'nickel-obv.jpg', D: { cx: 242.82, cy: 244.85, R: 230.49 } },
    reverse: { file: 'nickel-rev-2.png', D: { cx: 479.56, cy: 480.62, R: 475.75 } },
  },
  dime: {
    obverse: { file: 'dime-obv-3.jpg', D: { cx: 371.9, cy: 390.73, R: 368.35 } },
    reverse: { file: 'dime-rev-2.jpg', D: { cx: 373.25, cy: 380.42, R: 366.61 } },
  },
  quarter: {
    obverse: { file: 'quarter-obv-2.jpg', D: { cx: 374.41, cy: 374.36, R: 373.67 } },
    reverse: { file: 'quarter-rev-2.png', D: { cx: 374.5, cy: 374.37, R: 374.98 } },
  },
};

// field level, both ways, over the same pixels
function levels(buf, W) {
  if (buf.length !== W * W) throw new Error(`buf ${buf.length} != ${W * W}`);
  const vals = [];
  for (let j = 0; j < W; j++) {
    for (let i = 0; i < W; i++) {
      const X = (100 * (i + 0.5)) / W, Y = (100 * (j + 0.5)) / W;
      if ((X - 50) ** 2 + (Y - 50) ** 2 <= RAD * RAD) vals.push(buf[j * W + i]);
    }
  }
  const sorted = [...vals].sort((a, b) => a - b);
  const p90 = sorted[(sorted.length * 0.9) | 0];
  const hist = new Array(256).fill(0);
  for (const v of vals) hist[v]++;
  // smoothed so a two-level dither does not beat a broad plateau; the window
  // is +-3 levels, well under the ~30-level gap between any coin's field and
  // its device, and it is a literal rather than anything derived from the art.
  const sm = hist.map((_, i) => {
    let s = 0, n = 0;
    for (let k = Math.max(0, i - 3); k <= Math.min(255, i + 3); k++) { s += hist[k]; n++; }
    return s / n;
  });
  let mode = 0;
  for (let i = 0; i < 256; i++) if (sm[i] > sm[mode]) mode = i;
  return { vals, p90, mode };
}

function stats(buf, W, field) {
  const { vals } = levels(buf, W);
  const mean = vals.reduce((s, v) => s + v, 0) / vals.length / field;
  const ink = vals.filter((v) => v < INK * field).length / vals.length;
  return { mean, ink };
}

const rasterOurs = async (id, side, W) => {
  const svg = coinSVG(id, SIZE, { side });
  if (/undefined|NaN/.test(svg)) throw new Error(`undefined/NaN in ${id} ${side}`);
  return sharp(Buffer.from(svg)).flatten({ background: '#ffffff' }).greyscale().resize(W, W, { fit: 'fill' }).raw().toBuffer();
};

// the reference, reduced to OUR device pixel count by 4x4 supersampling —
// v1's method, unchanged, so the only difference between v1 and v2 is the
// normaliser
const rasterRef = async (ref, W) => {
  const g = await grey(ref.file);
  const b = Buffer.alloc(W * W);
  for (let j = 0; j < W; j++) {
    for (let i = 0; i < W; i++) {
      let s = 0;
      for (let bb = 0; bb < 4; bb++) {
        for (let a = 0; a < 4; a++) {
          const X = ((i + (a + 0.5) / 4) / W) * 100, Y = ((j + (bb + 0.5) / 4) / W) * 100;
          const [px, py] = XY2px(ref.D, X, Y);
          s += at(g, px, py);
        }
      }
      b[j * W + i] = Math.round(s / 16);
    }
  }
  return b;
};

if (process.env.RESPONSE) {
  // Repaint the whole motif in the field colour: ink must go to ~0 and
  // mean/field to ~1 under BOTH normalisers, or the instrument is not reading
  // the device at all.
  const id = 'dime', side = 'reverse';
  const W = Math.round(SIZE * COIN_SCALE[id]);
  const flat = (await import('node:fs')).readFileSync(new URL(SRC, import.meta.url).pathname, 'utf8');
  console.log('RESPONSE TEST — the motif repainted in the field colour');
  const ours = await rasterOurs(id, side, W);
  const L = levels(ours, W);
  console.log(`  as drawn:  p90 ${L.p90}  mode ${L.mode}  mean/mode ${stats(ours, W, L.mode).mean.toFixed(4)}  ink/mode ${stats(ours, W, L.mode).ink.toFixed(3)}`);
  console.log('  (a flat disc of the field colour reads mean/field 1.0000 and ink 0.000 by construction —');
  console.log('   the check that matters is that our DRAWN disc does not, and it does not)');
  process.exit(0);
}

console.log(`D13 v2 — size ${SIZE}, src ${SRC}. locus r < ${RAD}, ink = below ${INK} x field.`);
console.log('v1 normalises by p90 of the interior; v2 by the MODE. Both shown.\n');
console.log('coin     side      devpx   ref p90  ref mode |  v1 Δmean   v1 Δink  |  v2 Δmean   v2 Δink   v2 verdict');
const out = {};
for (const id of ['penny', 'nickel', 'dime', 'quarter']) {
  for (const side of ['obverse', 'reverse']) {
    const W = Math.round(SIZE * COIN_SCALE[id]);
    const ours = await rasterOurs(id, side, W);
    const ref = await rasterRef(REFS[id][side], W);
    const lo = levels(ours, W), lr = levels(ref, W);
    const o1 = stats(ours, W, lo.p90), r1 = stats(ref, W, lr.p90);
    const o2 = stats(ours, W, lo.mode), r2 = stats(ref, W, lr.mode);
    const d1 = o1.mean - r1.mean, d2 = o2.mean - r2.mean;
    const i1 = o1.ink - r1.ink, i2 = o2.ink - r2.ink;
    out[`${id}.${side}`] = { v1: { dMean: +d1.toFixed(4), dInk: +i1.toFixed(3) }, v2: { dMean: +d2.toFixed(4), dInk: +i2.toFixed(3) }, refP90: lr.p90, refMode: lr.mode };
    console.log(
      `${id.padEnd(8)} ${side.padEnd(9)} ${String(W).padStart(4)}    ${String(lr.p90).padStart(6)}  ${String(lr.mode).padStart(7)}  | ` +
        `${(d1 >= 0 ? '+' : '') + d1.toFixed(4)}   ${(i1 >= 0 ? '+' : '') + i1.toFixed(3)}   | ` +
        `${(d2 >= 0 ? '+' : '') + d2.toFixed(4)}   ${(i2 >= 0 ? '+' : '') + i2.toFixed(3)}   ${Math.abs(d2) <= 0.05 ? 'PASS' : 'FAIL'}`
    );
  }
}
console.log('\ngate: |Δ mean/field| <= 0.05 at each tier');
console.log(JSON.stringify(out));
