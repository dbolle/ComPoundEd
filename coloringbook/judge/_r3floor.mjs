// ROUND 3 SPECIALIST — the FLOOR for D13, and what `field` actually is.
//
// D13 divides by `field` = the p90 of the r<40 interior. §12/§13 say compute
// the floors before a number means anything, so:
//
//  1. FLAT-DRAWING FLOOR — a bare disc with no device at all scores mean/field
//     exactly 1.000, so the reverse's whole available range is 1.000 down to
//     whatever ink can buy.
//  2. WHAT `field` IS. On our drawing the p90 is the bare field. On a
//     photograph it is a specular highlight ON the device. This measures the
//     flattest 5% of 3x3 neighbourhoods in each image — the best available
//     "this is bare field" detector that uses no segmentation — and divides by
//     the same p90 D13 uses. Overlay published so the located patches can be
//     checked by eye (spec §4.3).
//  3. PALETTE FLOOR — with a device of area `a` at palette grey `d` on a field
//     of 212, mean/field = 1 - a(1 - d/212). Solved for the coverage each
//     palette tone would need to reach the reference's number.
//
//   node coloringbook/_r3floor.mjs
import sharp from 'sharp';
import { grey, at, XY2px } from './_rvnorm.mjs';
import { REFS, ourBuf, refBuf, stats } from './_r3d13.mjs';

const SIZE = 84;
const tiles = [], labels = [];
let x = 0;
const CELL = 330, W0 = 4 * (CELL + 10) + 10;
console.log('flattest 5% of 3x3 neighbourhoods inside r<40 — the best "bare field" proxy that needs no segmentation\n');
console.log('side     who          p90(field)  flat-patch grey  flat/p90   interior mean/p90');
for (const side of ['obverse', 'reverse']) {
  const { buf, W } = await ourBuf('quarter', side, SIZE);
  const rb = await refBuf('quarter', side, W);
  for (const [who, b] of [['ours', buf], ['photograph', rb]]) {
    const f = stats(b, W).field;
    const cand = [];
    for (let j = 1; j < W - 1; j++) for (let i = 1; i < W - 1; i++) {
      const X = 100 * (i + 0.5) / W, Y = 100 * (j + 0.5) / W;
      if (Math.hypot(X - 50, Y - 50) > 39) continue;
      let s = 0, s2 = 0;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        const v = b[(j + dj) * W + i + di]; s += v; s2 += v * v;
      }
      cand.push({ i, j, sd: Math.sqrt(s2 / 9 - (s / 9) ** 2), m: s / 9 });
    }
    cand.sort((a, c) => a.sd - c.sd);
    const flat = cand.slice(0, Math.max(1, Math.round(cand.length * 0.05)));
    const fm = flat.reduce((s, p) => s + p.m, 0) / flat.length;
    const st = stats(b, W);
    console.log(`${side.padEnd(8)} ${who.padEnd(12)} ${String(f).padStart(9)}  ${fm.toFixed(1).padStart(14)}`
      + `  ${(fm / f).toFixed(4).padStart(8)}   ${st.mean.toFixed(4).padStart(15)}`);
    const rgb = Buffer.alloc(W * W * 3);
    for (let k = 0; k < W * W; k++) { rgb[k * 3] = rgb[k * 3 + 1] = rgb[k * 3 + 2] = b[k]; }
    for (const p of flat) { const k = (p.j * W + p.i) * 3; rgb[k] = 60; rgb[k + 1] = 220; rgb[k + 2] = 90; }
    tiles.push({ input: await sharp(rgb, { raw: { width: W, height: W, channels: 3 } }).resize(CELL, CELL, { kernel: 'nearest' }).png().toBuffer(), left: 10 + x * (CELL + 10), top: 30 });
    labels.push(`<text x="${14 + x * (CELL + 10)}" y="22" fill="#fff" font-size="14" font-family="monospace">${side} ${who}: flat 5% = ${(fm / f).toFixed(3)} x p90</text>`);
    x++;
  }
}
await sharp(Buffer.from(`<svg width="${W0}" height="${CELL + 40}"><rect width="${W0}" height="${CELL + 40}" fill="#111"/>${labels.join('')}</svg>`))
  .composite(tiles).png().toFile(new URL('./_r3-flatfield.png', import.meta.url).pathname);

console.log('\nPALETTE FLOOR — quarter field 212. Device area `a` at grey `d` gives mean/field = 1 - a(1 - d/212).');
console.log('coverage of the r<40 interior needed to reach the photograph\'s own number, per palette tone:');
const P = { motif: 149, hair: 126, deep: 114, ink: 43 };
for (const [side, target] of [['obverse @84px', 0.7485], ['reverse @84px', 0.6893]]) {
  const parts = Object.entries(P).map(([k, d]) => {
    const a = (1 - target) / (1 - d / 212);
    return `${k}(${d}) ${a > 1 ? 'IMPOSSIBLE' : (100 * a).toFixed(0) + '%'}`;
  });
  console.log(`  ${side} target ${target}: ${parts.join('   ')}`);
}
console.log('\nwrote coloringbook/_r3-flatfield.png (green = the flattest 5% of neighbourhoods)');
