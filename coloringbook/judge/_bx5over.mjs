// BUCK obverse round — §4.3 OVERLAY. Draws THE LIVE ART (run, not restated)
// over each rectified obverse photograph at a matched printed-border box, and
// writes a side-by-side. The art is taken from `coinSVG` so no literal in this
// file can drift from the drawing (§6.1.1 assert-never-copy).
//
// SELF-CHECK, because `_nk3over.mjs` drew our device 6% small for its whole
// life: this instrument renders our SVG at exactly W x H = the rectified
// plane's size, and asserts that our viewBox is "0 0 100 56" and that the
// rectifier's FRAME literals still read 5..95 / 5..51. If either moves the
// overlay is meaningless and it throws.
// REPORTS ONLY.
import sharp from 'sharp';
import { join } from 'node:path';
import { ROOT } from './_paths.mjs';
import { rectify, S, W, H, FRAME } from './_bx3rect.mjs';
const { coinSVG } = await import(join(ROOT, 'src/art/coins.js'));

const svg = coinSVG('buck', 380, { side: 'obverse', decorative: true });
if (!/viewBox="0 0 100 56"/.test(svg)) throw new Error('obverse viewBox is not "0 0 100 56" — this overlay is invalid');
if (FRAME.x0 !== 5 || FRAME.x1 !== 95 || FRAME.y0 !== 5 || FRAME.y1 !== 51) throw new Error('rectifier FRAME literals moved');
const ours = svg.replace(/width="[\d.]+" height="[\d.]+"/, `width="${W}" height="${H}"`);
console.log(`our obverse rendered at ${W}x${H} px = ${S} px per viewBox unit, same as the rectified plane`);

const dir = process.argv[2];
const oursPng = await sharp(Buffer.from(ours)).resize(W, H).png().toBuffer();
const oursGrey = await sharp(oursPng).greyscale().raw().toBuffer();
for (const f of ['bill-obv.jpg', 'bill-obv-2.jpg']) {
  const r = await rectify(f);
  const base = await sharp(r.colour, { raw: { width: W, height: H, channels: 3 } }).png().toBuffer();
  // 50/50 blend, plus a strip of ours alone underneath
  const blend = await sharp(base).composite([{ input: oursPng, blend: 'over', opacity: 0.5 }]).png().toBuffer();
  await sharp({ create: { width: W, height: H * 3 + 16, channels: 3, background: '#202020' } })
    .composite([{ input: base, top: 0, left: 0 }, { input: blend, top: H + 8, left: 0 }, { input: oursPng, top: 2 * H + 16, left: 0 }])
    .png().toFile(join(dir, 'bx5-' + f.replace('.jpg', '.png')));
  console.log('wrote bx5-' + f.replace('.jpg', '.png') + '  (reference / 50-50 blend / ours)');
}
