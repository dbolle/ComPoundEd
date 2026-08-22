// ROUND 3 SPECIALIST working instrument — D13 device against field, BOTH sides.
//
// `_x6dark.mjs` (the hashed eval) computes D13 for the four REVERSES only. The
// obverse number in the brief (-0.136 at 26px) has no library of its own, so
// this file re-implements the SAME statistic and is validated against
// `_x6dark.mjs`'s own printed output on the reverse before any obverse number
// is believed (`node coloringbook/_r3d13.mjs --check`).
//
// The locus is the brief's frozen literal and nothing here computes any part of
// it from our drawing:
//   - disc interior r < 40 viewBox units
//   - tiers 26 / 44 / 54 / 84 px
//   - ours rasterised at W = round(size * COIN_SCALE[id]) device px
//   - the photograph reduced to the SAME W by 4x4 supersampling of the frozen
//     disc registration
//   - ink = fraction of the interior below 0.85 x that image's OWN p90 level
//
//   node coloringbook/_r3d13.mjs [--check] [--json out.json] [SRC=...]
import { grey, at, XY2px } from './_rvnorm.mjs';

const SRC = process.env.SRC || '../src/art/coins.js';
const { coinSVG: coinSVGD, COIN_SCALE: COIN_SCALED } = await import(SRC);
const sharp = (await import('sharp')).default;

export const TIERS = [26, 44, 54, 84];
const INK = 0.85;   // frozen, same literal as _x6dark.mjs
const RAD = 40;     // frozen, same literal as _x6dark.mjs

// frozen registrations: reverse from _rvnorm.mjs DISCS, obverse from _qtlib.mjs
export const REFS = {
  quarter: {
    obverse: { file: 'quarter-obv-2.jpg', D: { cx: 374.41, cy: 374.36, R: 373.67 } },
    reverse: { file: 'quarter-rev-2.png', D: { cx: 374.50, cy: 374.37, R: 374.98 } },
  },
  dime: {
    reverse: { file: 'dime-rev-2.jpg', D: { cx: 373.25, cy: 380.42, R: 366.61 } },
  },
};

export function stats(buf, W) {
  if (buf.length !== W * W) throw new Error(`buf ${buf.length} != ${W * W}`);
  const inside = [];
  for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
    const X = 100 * (i + 0.5) / W, Y = 100 * (j + 0.5) / W;
    if ((X - 50) ** 2 + (Y - 50) ** 2 > RAD * RAD) continue;
    inside.push({ X, Y, v: buf[j * W + i] });
  }
  const sorted = inside.map((p) => p.v).sort((a, b) => a - b);
  const f = sorted[(sorted.length * 0.9) | 0];
  const mean = inside.reduce((s, p) => s + p.v, 0) / inside.length / f;
  let n = 0, r2 = 0;
  for (const p of inside) if (p.v < INK * f) { n++; r2 += (p.X - 50) ** 2 + (p.Y - 50) ** 2; }
  return { field: f, mean, ink: n / inside.length, spread: n ? Math.sqrt(r2 / n) : 0, nInside: inside.length };
}

export async function ourBuf(id, side, size, mod) {
  const { coinSVG, COIN_SCALE } = mod || { coinSVG: coinSVGD, COIN_SCALE: COIN_SCALED };
  const W = Math.round(size * COIN_SCALE[id]);
  const svg = coinSVG(id, size, { side });
  if (/undefined|NaN/.test(svg)) throw new Error(`undefined/NaN in ${id}/${side}@${size}`);
  const b = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .greyscale().resize(W, W, { fit: 'fill' }).raw().toBuffer();
  return { buf: b, W };
}

const refCache = new Map();
export async function refBuf(id, side, W) {
  const key = `${id}/${side}/${W}`;
  if (refCache.has(key)) return refCache.get(key);
  const { file, D } = REFS[id][side];
  const g = await grey(file);
  const rb = Buffer.alloc(W * W);
  for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
    let s = 0;
    for (let b = 0; b < 4; b++) for (let a = 0; a < 4; a++) {
      const X = (i + (a + 0.5) / 4) / W * 100, Y = (j + (b + 0.5) / 4) / W * 100;
      const [px, py] = XY2px(D, X, Y); s += at(g, px, py);
    }
    rb[j * W + i] = Math.round(s / 16);
  }
  refCache.set(key, rb);
  return rb;
}

export async function d13(id, side, size, mod) {
  const { buf, W } = await ourBuf(id, side, size, mod);
  const o = stats(buf, W), r = stats(await refBuf(id, side, W), W);
  return { size, W, ours: o, ref: r, dMean: o.mean - r.mean, dInk: o.ink - r.ink };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const rows = [];
  console.log(`D13 device against field — r < ${RAD}, ink < ${INK} x own p90 field, src ${SRC}`);
  for (const side of ['obverse', 'reverse']) {
    console.log(`\n${side}   px  devpx | ours field  mean/field   ink  spread | ref field  mean/field   ink  spread |   Dmean    Dink`);
    for (const size of TIERS) {
      const x = await d13('quarter', side, size);
      rows.push({ side, ...x });
      const sg = (v, d = 4) => (v >= 0 ? '+' : '') + v.toFixed(d);
      console.log(`      ${String(size).padStart(5)} ${String(x.W).padStart(5)} |`
        + ` ${String(x.ours.field).padStart(9)} ${x.ours.mean.toFixed(4).padStart(11)}`
        + ` ${x.ours.ink.toFixed(3).padStart(6)} ${x.ours.spread.toFixed(2).padStart(6)} |`
        + ` ${String(x.ref.field).padStart(8)} ${x.ref.mean.toFixed(4).padStart(11)}`
        + ` ${x.ref.ink.toFixed(3).padStart(6)} ${x.ref.spread.toFixed(2).padStart(6)} |`
        + ` ${sg(x.dMean).padStart(7)} ${sg(x.dInk, 3).padStart(7)}`
        + `  ${Math.abs(x.dMean) <= 0.05 ? 'in-gate' : 'MISS'}`);
    }
  }
  if (process.argv.includes('--json')) {
    const out = process.argv[process.argv.indexOf('--json') + 1];
    const { writeFileSync } = await import('node:fs');
    writeFileSync(out, JSON.stringify(rows, null, 1));
    console.log(`\nwrote ${out}`);
  }
}
