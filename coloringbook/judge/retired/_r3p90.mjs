// ROUND 3 SPECIALIST — §4.3 applied to D13's NORMALISER.
//
// `_x6dark.mjs` divides both images by `field`, defined as the p90 of the
// r<40 interior. That is a LOCATED FEATURE ("the bare field"), so §4.3 says:
// draw what it found on the source and look at it. This paints the top-decile
// pixels red on both images at the 84px tier and prints where they sit.
//   node coloringbook/_r3p90.mjs
import sharp from 'sharp';
import { REFS, ourBuf, refBuf, stats } from './_r3d13.mjs';

const SIZE = 84, CELL = 340;
const tiles = [], labels = [];
let x = 0;
const W0 = 4 * (CELL + 10) + 10;
for (const side of ['obverse', 'reverse']) {
  const { buf, W } = await ourBuf('quarter', side, SIZE);
  const rb = await refBuf('quarter', side, W);
  for (const [who, b] of [['ours', buf], ['photograph', rb]]) {
    const f = stats(b, W).field;
    const rgb = Buffer.alloc(W * W * 3);
    let hi = 0, hiR = 0, tot = 0, totR = 0;
    for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
      const X = 100 * (i + 0.5) / W, Y = 100 * (j + 0.5) / W;
      const r = Math.hypot(X - 50, Y - 50), v = b[j * W + i], k = (j * W + i) * 3;
      const inside = r <= 40;
      if (inside) { tot++; totR += r; }
      if (inside && v >= f) { // the top decile — the pixels that SET `field`
        rgb[k] = 255; rgb[k + 1] = 40; rgb[k + 2] = 40; hi++; hiR += r;
      } else { rgb[k] = rgb[k + 1] = rgb[k + 2] = v; }
    }
    console.log(`${side.padEnd(8)} ${who.padEnd(11)} field=${String(f).padStart(3)}  top-decile pixels: ${hi}`
      + `  mean radius of top decile ${(hiR / hi).toFixed(2)}  vs mean radius of interior ${(totR / tot).toFixed(2)}`);
    tiles.push({
      input: await sharp(rgb, { raw: { width: W, height: W, channels: 3 } })
        .resize(CELL, CELL, { kernel: 'nearest' }).png().toBuffer(), left: 10 + x * (CELL + 10), top: 30,
    });
    labels.push(`<text x="${14 + x * (CELL + 10)}" y="22" fill="#fff" font-size="14" font-family="monospace">${side} ${who} (field=${f})</text>`);
    x++;
  }
}
const H = CELL + 40;
await sharp(Buffer.from(`<svg width="${W0}" height="${H}"><rect width="${W0}" height="${H}" fill="#111"/>${labels.join('')}</svg>`))
  .composite(tiles).png().toFile(new URL('./_r3-p90-locus.png', import.meta.url).pathname);
console.log('\nwrote coloringbook/_r3-p90-locus.png  (red = the pixels at or above the p90 that becomes `field`)');
