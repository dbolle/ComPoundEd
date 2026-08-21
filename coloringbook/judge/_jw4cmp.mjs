// R4 dime jaw — ours beside the coin at the SAME device pixel count.
//
// The judge's D12 protocol, borrowed for the specialist's own check: a drawn
// mark can only be judged too heavy or too light against the photograph reduced
// to the count a child actually sees, not against a 380 px zoom. The dime is
// drawn at size x 0.738, so 190 px of box is 140 device px.
//
// Order on the sheet, left to right: BEFORE, AFTER, then the three references,
// every one of them at 140 px, nearest-upscaled x3 and never resampled smooth.
// Both revisions are pinned by hash in `_jw4look.mjs`, which writes the
// loadable copy this imports.
//
// Run: node coloringbook/judge/_jw4look.mjs && node coloringbook/judge/_jw4cmp.mjs
import sharp from 'sharp';

const here = (p) => new URL(p, import.meta.url).pathname;
const DEV = Number(process.env.DEV || 140), K = 3;
const mA = await import(here('./_jw4-before-loadable.js'));
const mB = await import(here('../../src/art/coins.js'));
const tiles = [];
for (const [tag, mod] of [['BEFORE', mA], ['AFTER', mB]]) {
  const svg = mod.coinSVG('dime', Math.round(DEV / 0.738), { side: 'obverse' });
  const png = await sharp(Buffer.from(svg), { density: 72 }).resize({ width: DEV, height: DEV, fit: 'fill' }).png().toBuffer();
  tiles.push(await sharp(png).resize({ width: DEV * K, height: DEV * K, kernel: 'nearest' }).greyscale().png().toBuffer());
  console.log(`${tag}: ${DEV} device px`);
}
for (const ref of ['dime-obv.jpg', 'dime-obv-3.jpg', 'dime-obv-2.jpg']) {
  const p = here('../ref/' + ref);
  const png = await sharp(p).greyscale().resize({ width: DEV, height: DEV, fit: 'contain', background: '#000' }).png().toBuffer();
  tiles.push(await sharp(png).resize({ width: DEV * K, height: DEV * K, kernel: 'nearest' }).png().toBuffer());
  console.log(`${ref}: reduced to ${DEV} px`);
}
const c = DEV * K + 10;
await sharp({ create: { width: c * tiles.length, height: c, channels: 3, background: '#202020' } })
  .composite(tiles.map((input, i) => ({ input, left: i * c + 5, top: 5 })))
  .png().toFile(here('./_jw4cmp-140.png'));
console.log('-> ' + here('./_jw4cmp-140.png') + '   BEFORE | AFTER | dime-obv | dime-obv-3 | dime-obv-2');
