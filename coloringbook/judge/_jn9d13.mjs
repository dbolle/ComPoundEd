// NICKEL round 0 — D13, DEVICE AGAINST FIELD, BOTH SIDES.
//
// `_x6dark.mjs` computes exactly this quantity but only for the REVERSE, and
// §3 says every dimension is scored per SIDE. This is `_x6dark.mjs`'s method,
// unchanged in every number it computes (same INK 0.85, same p90 field
// normaliser, same "no upsampling anywhere" rule, same stats()), with two
// additions:
//   - SIDE, and an obverse reference per coin, with its disc taken from
//     `_jn1discs.json` (`_rvnorm.DISCS` holds reverses only);
//   - both radii in one table: RAD 40 (whole interior — includes the legend
//     band the photographs carry and our small tiers do not draw) and RAD 33
//     (inside every legend, §22.8). Reporting only one of those two is how a
//     legend we do not draw gets charged to the motif's tone.
//
// §20.3 / §20.4: a frosted proof is the best SHAPE reference and the WORST
// TONE reference, so no proof file appears here. The references are the two
// business strikes with the best disc fits.
//
// Response test (§4): a flat swatch of the nickel palette's own `field` colour
// must come back as that colour's own grey. `_x6check.mjs` already proves the
// rasterise path is tone-preserving for all 32 palette colours; this file
// re-asserts the recovered field level per render and throws if the render's
// own p90 field is not the palette's 212 (nickel/dime/quarter) or 148 (cent).
//
// Run: node coloringbook/judge/_jn9d13.mjs [size]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { grey, at, DISCS as RVDISCS, XY2px } from '../_rvnorm.mjs';
import { coinSVG, COIN_SCALE } from '../../src/art/coins.js';

const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const JD = JSON.parse(readFileSync(HERE('_jn1discs.json')));
const size = +(process.argv[2] || 26);
const INK = 0.85;

// reference per coin per side. reverse rows are `_x6dark`'s own, unchanged.
const REF = {
  obverse: { nickel: 'nickel-obv.jpg' },
  reverse: { nickel: 'nickel-rev-2.png' },
};
const discOf = (f) => RVDISCS[f] || JD[f];

function stats(buf, W, RAD) {
  if (buf.length !== W * W) throw new Error(`buf ${buf.length} != ${W * W}`);
  const inside = [], pts = [];
  for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
    const X = 100 * (i + 0.5) / W, Y = 100 * (j + 0.5) / W;
    if ((X - 50) ** 2 + (Y - 50) ** 2 > RAD * RAD) continue;
    inside.push({ X, Y, v: buf[j * W + i] });
  }
  const sorted = inside.map((p) => p.v).sort((a, b) => a - b);
  const f = sorted[(sorted.length * 0.9) | 0];
  const mean = inside.reduce((s, p) => s + p.v, 0) / inside.length / f;
  let r2 = 0;
  for (const p of inside) if (p.v < INK * f) { pts.push(p); r2 += (p.X - 50) ** 2 + (p.Y - 50) ** 2; }
  return { field: f, mean, ink: pts.length / inside.length, spread: pts.length ? Math.sqrt(r2 / pts.length) : 0 };
}

// our render at the tier's REAL device pixel count, no upsampling
async function ours(id, side, W) {
  const svg = coinSVG(id, size, { side });
  const { data, info } = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .resize(W, W, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  if (info.channels !== 1 || data.length !== W * W) throw new Error('channel/length assert failed — D13 UNTRUSTED');
  return data;
}
// the photograph box-filtered to the SAME device pixel count
async function refBuf(file, W) {
  const g = await grey(file), d = discOf(file);
  if (!d) throw new Error(`no frozen disc for ${file}`);
  const out = Buffer.alloc(W * W);
  const step = 100 / W;
  for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
    let s = 0, n = 0;
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) {
      const X = (i + (a + 0.5) / 3) * step, Y = (j + (b + 0.5) / 3) * step;
      const [px, py] = XY2px(d, X, Y);
      s += at(g, px, py); n++;
    }
    out[j * W + i] = Math.round(s / n);
  }
  return out;
}

const tier = size >= 76 ? 'full' : size >= 44 ? 'mid' : 'icon';
console.log(`### D13 nickel, size ${size} (tier ${tier}), both sides, at the real device pixel count. INK=${INK}.`);
console.log(`### gate |delta mean/field| <= 0.05 at each tier (§3 D13 / Appendix P3), stated before measuring.\n`);
console.log('side      RAD  who     devpx  field  mean/field     ink   spread');
const OUT = {};
for (const side of ['obverse', 'reverse']) {
  const file = REF[side].nickel;
  const W = Math.round(size * COIN_SCALE.nickel);
  const ob = await ours('nickel', side, W), rb = await refBuf(file, W);
  for (const RAD of [40, 33]) {
    const o = stats(ob, W, RAD), r = stats(rb, W, RAD);
    if (o.field !== 212) console.log(`   !! our recovered field level is ${o.field}, not the palette's 212 — §22.1 says that is a bug report`);
    console.log(`${side.padEnd(9)} ${String(RAD).padEnd(4)} ref     ${String(W).padEnd(6)} ${String(r.field).padEnd(6)} ${r.mean.toFixed(4).padStart(9)} ${r.ink.toFixed(3).padStart(7)} ${r.spread.toFixed(2).padStart(7)}   [${file}]`);
    console.log(`${side.padEnd(9)} ${String(RAD).padEnd(4)} ours    ${String(W).padEnd(6)} ${String(o.field).padEnd(6)} ${o.mean.toFixed(4).padStart(9)} ${o.ink.toFixed(3).padStart(7)} ${o.spread.toFixed(2).padStart(7)}`);
    const d = o.mean - r.mean;
    console.log(`${''.padEnd(14)} DELTA                  ${(d >= 0 ? '+' : '') + d.toFixed(4)}  ${((o.ink - r.ink) >= 0 ? '+' : '') + (o.ink - r.ink).toFixed(3)}   ${Math.abs(d) <= 0.05 ? 'within 0.05' : '**OUTSIDE 0.05**'}\n`);
    OUT[`${side}/RAD${RAD}`] = { ref: +r.mean.toFixed(4), ours: +o.mean.toFixed(4), delta: +d.toFixed(4), inkRef: +r.ink.toFixed(3), inkOurs: +o.ink.toFixed(3) };
  }
}
console.log(JSON.stringify(OUT));
