// ROUND 7 — D13 obverse, before and after, because the brief asks for it
// ("report it before and after so the judge can see it did not get worse") and
// the instrument that produced the published number CANNOT BE RUN.
//
// `_r3d13.mjs` line 20 is `import { grey, at, XY2px } from './_rvnorm.mjs'`,
// and `_rvnorm.mjs` is at `coloringbook/_rvnorm.mjs`, one directory up. On a
// clean checkout of main:
//
//   $ node coloringbook/judge/_r3d13.mjs
//   Error [ERR_MODULE_NOT_FOUND]: Cannot find module
//   '/home/USER/compounded/coloringbook/judge/_rvnorm.mjs'
//   imported from '/home/USER/compounded/coloringbook/judge/_r3d13.mjs'
//
// Reported, NOT fixed (spec 1.1). `_x6dark.mjs`, the hashed eval, covers the
// four REVERSES only, so there is no runnable instrument for D13-obverse at all.
//
// This re-implements the statistic exactly as `_r3d13.mjs` documents it — the
// same frozen literals, the same registration, nothing derived from our drawing:
//   · disc interior r < 40 viewBox units
//   · ours rasterised at W = round(size * COIN_SCALE[id]) device px
//   · the photograph reduced to the SAME W by 4x4 supersampling of the frozen
//     disc registration (quarter-obv-2.jpg, cx 374.41 cy 374.36 R 373.67)
//   · field = the image's OWN p90 level; ink = fraction below 0.85 x field
//
// VALIDATION, and it is the only reason any number below can be believed: the
// same code is run against the PRISTINE art saved at the head of this round
// (`_jq7-before-coins.js`, sha256 de270b12...) and must reproduce the published
// D13-obverse figures — ours 0.638, ref 0.774, delta -0.136, ink 0.802 / 0.634.
// If it does not, this file is measuring something else and its "after" number
// means nothing.
//
// Run: node coloringbook/judge/_jq7d13.mjs
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// The pristine snapshot lives at `coloringbook/judge/_jq7-before-coins.js`
// (where the brief asked for it), and `coins.js` carries one relative import,
// `../engine/money.js`, which does not resolve from `judge/`. So it is
// materialised OUTSIDE the repo with that one specifier rewritten to an
// absolute path and NOTHING else changed — the snapshot on disk is untouched
// and still hashes to de270b1282c9f2cca5211fe25fec38020f4705c1085c901053d7f7002f233364.
const BEFORE = (() => {
  const src = readFileSync('coloringbook/judge/_jq7-before-coins.js', 'utf8');
  const abs = new URL('../../src/engine/money.js', import.meta.url).pathname;
  const dir = mkdtempSync(join(tmpdir(), 'jq7-'));
  const out = join(dir, 'before-coins.mjs');
  writeFileSync(out, src.replace("from '../engine/money.js'", `from '${abs}'`));
  return out;
})();

const RAD = 40, INK = 0.85;
const D = { cx: 374.41, cy: 374.36, R: 373.67 };   // frozen, _r3d13.mjs
const REF = 'coloringbook/ref/quarter-obv-2.jpg';

const g = await (async () => {
  const { data, info } = await sharp(REF).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
})();
const at = (x, y) => {
  if (x < 0 || y < 0 || x > g.w - 2 || y > g.h - 2) return 255;
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, i = y0 * g.w + x0;
  return (1 - fx) * (1 - fy) * g.d[i] + fx * (1 - fy) * g.d[i + 1]
    + (1 - fx) * fy * g.d[i + g.w] + fx * fy * g.d[i + g.w + 1];
};
const XY2px = (X, Y) => [D.cx + (D.R * (X - 50)) / 47, D.cy + (D.R * (Y - 50)) / 47];

function stats(buf, W) {
  const inside = [];
  for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
    const X = (100 * (i + 0.5)) / W, Y = (100 * (j + 0.5)) / W;
    if ((X - 50) ** 2 + (Y - 50) ** 2 > RAD * RAD) continue;
    inside.push(buf[j * W + i]);
  }
  const sorted = [...inside].sort((a, b) => a - b);
  const f = sorted[(sorted.length * 0.9) | 0];
  const mean = inside.reduce((s, v) => s + v, 0) / inside.length / f;
  const n = inside.filter((v) => v < INK * f).length;
  return { field: f, mean, ink: n / inside.length, nInside: inside.length };
}

async function ours(src, size) {
  const mod = await import(src);
  const W = Math.round(size * mod.COIN_SCALE.quarter);
  const svg = mod.coinSVG('quarter', size, { side: 'obverse' });
  const b = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .greyscale().resize(W, W, { fit: 'fill' }).raw().toBuffer();
  return { ...stats(b, W), W };
}
function ref(W) {
  const rb = new Uint8Array(W * W);
  for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
    let s = 0;
    for (let b = 0; b < 4; b++) for (let a = 0; a < 4; a++) {
      const X = ((i + (a + 0.5) / 4) / W) * 100, Y = ((j + (b + 0.5) / 4) / W) * 100;
      const [px, py] = XY2px(X, Y); s += at(px, py);
    }
    rb[j * W + i] = Math.round(s / 16);
  }
  return stats(rb, W);
}

console.log('### D13 quarter OBVERSE — device against field, r < 40, ours vs quarter-obv-2.jpg at the same device pixel count');
console.log('tier   revision   W   field   mean/field    ink      ref mean/field   ref ink    delta mean/field   delta ink');
for (const size of [26, 44, 54, 84]) {
  const R = ref(Math.round(size * (await import('../../src/art/coins.js')).COIN_SCALE.quarter));
  for (const [name, src] of [['BEFORE (_jq7-before-coins.js)', BEFORE], ['AFTER  (src/art/coins.js)', '../../src/art/coins.js']]) {
    const o = await ours(src, size);
    console.log(`${String(size).padStart(4)}   ${name.padEnd(29)} ${String(o.W).padStart(3)}   ${String(o.field).padStart(5)}   ${o.mean.toFixed(4).padStart(9)}  ${o.ink.toFixed(4).padStart(6)}      ${R.mean.toFixed(4).padStart(9)}   ${R.ink.toFixed(4).padStart(6)}       ${(o.mean - R.mean).toFixed(4).padStart(8)}       ${(o.ink - R.ink).toFixed(4).padStart(8)}`);
  }
}
console.log('\nVALIDATION: the BEFORE row at 26px must reproduce the published D13-obverse');
console.log('  published (quarter-scorecard.json, round 4): ours 0.638  ref 0.774  delta -0.136  ink 0.802 / 0.634');
