// ROUND 9 (relief/edge), QUARTER OBVERSE — LOOK AT THE WIG AT THE SIZE IT IS
// DRAWN, beside the coin reduced to exactly that size (§4.3 / §3 D12).
//
// The numbers in `_jw14see.mjs` say the coin's wig behaves as two different
// objects at our two full-tier draws: at 84 px it reduces to 2-4 broad dark
// bands, at 190 px it still resolves 6-13 fine cuts. A choice about what to
// draw cannot be made from that table alone — §4.3 is the highest-yield rule in
// COIN-JUDGE and it says draw the located feature on the source and look.
//
// CONTROL (Q5): the cent obverse is rendered in the same sheet at the same
// sizes. It is a different coin, untouched by this round, so any artefact of
// the reduction pipeline (Lanczos ringing, the 8x nearest upsample) that shows
// up on the quarter must show up there too.
//
// Run: node coloringbook/judge/_jw14look.mjs [tag]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const FITS = JSON.parse(readFileSync('coloringbook/judge/_jw14fitcheck.json', 'utf8'));
const DISC = FITS.disc;
const TAG = process.argv[2] || 'now';

// the wig, in viewBox units: our grooves span screen x 51.7..72.1, y 19.5..46.3
const BOX = { x0: 48, y0: 16, x1: 78, y1: 50 };
const ZOOM = 14;

async function refAt(f, ppu) {
  const D = DISC[f];
  const scale = (47 * ppu) / D.R;
  const meta = await sharp(`coloringbook/ref/${f}`).metadata();
  const buf = await sharp(`coloringbook/ref/${f}`).greyscale()
    .resize(Math.round(meta.width * scale), Math.round(meta.height * scale), { kernel: 'lanczos3' })
    .png().toBuffer();
  // re-centre so the disc centre lands at viewBox (50,50) in a 100*ppu canvas.
  // PAD FIRST: on the 1932 the disc fills the frame (R 999.37 in a 2000 px
  // image), so the 50-unit half-box runs off the edge and `extract` throws.
  const pad = Math.ceil(100 * ppu);
  const cx = D.cx * scale + pad, cy = D.cy * scale + pad;
  const side = Math.round(100 * ppu);
  // two pipelines on purpose: sharp runs the FIRST .extract() of a pipeline
  // before .extend(), which is not what is wanted here.
  const padded = await sharp(buf)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: '#ffffff' })
    .png().toBuffer();
  return sharp(padded).extract({
    left: Math.round(cx - 50 * ppu), top: Math.round(cy - 50 * ppu),
    width: side, height: side,
  }).png().toBuffer();
}

async function oursAt(id, px, mod) {
  return sharp(Buffer.from(mod.coinSVG(id, px, { side: 'obverse' }))).png().toBuffer();
}

async function crop(buf, ppu, label) {
  const big = await sharp(buf).resize(Math.round(100 * ppu * ZOOM), Math.round(100 * ppu * ZOOM),
    { kernel: 'nearest' }).png().toBuffer();
  const s = ppu * ZOOM;
  return sharp(big).extract({
    left: Math.round(BOX.x0 * s), top: Math.round(BOX.y0 * s),
    width: Math.round((BOX.x1 - BOX.x0) * s), height: Math.round((BOX.y1 - BOX.y0) * s),
  }).resize({ width: 420, kernel: 'nearest' }).png().toBuffer().then((b) => ({ b, label }));
}

const B = await import('../../src/art/coins.js');
const REFS = Object.keys(DISC);

for (const px of [84, 190]) {
  const ppu = px / 100;
  const tiles = [];
  for (const f of REFS) tiles.push(await crop(await refAt(f, ppu), ppu, f));
  tiles.push(await crop(await oursAt('quarter', px, B), ppu, 'OURS quarter'));
  tiles.push(await crop(await oursAt('penny', px, B), ppu, 'CONTROL cent'));
  const H = (await sharp(tiles[0].b).metadata()).height;
  const W = 420;
  const canvas = sharp({ create: { width: W * tiles.length, height: H + 22, channels: 3, background: '#ffffff' } });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W * tiles.length}" height="${H + 22}">`
    + tiles.map((t, i) => `<text x="${i * W + 6}" y="${H + 16}" font-family="monospace" font-size="13">${t.label}</text>`).join('')
    + '</svg>';
  await canvas.composite([
    ...tiles.map((t, i) => ({ input: t.b, left: i * W, top: 0 })),
    { input: Buffer.from(svg), left: 0, top: 0 },
  ]).png().toFile(`coloringbook/judge/_jw14look-${px}px-${TAG}.png`);
  console.log(`wrote _jw14look-${px}px-${TAG}.png  (viewBox ${BOX.x0}..${BOX.x1} x ${BOX.y0}..${BOX.y1}, ${ZOOM}x nearest)`);
}
