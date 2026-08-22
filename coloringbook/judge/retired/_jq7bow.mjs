// ROUND 7 — D7, the 102 deg knot: the located feature drawn on the source, and
// our own render beside it (spec 4.3 + spec 3 D12, control first).
//
// The knot is HAIR.Washington knot 20 of 35, local (-26.64, 36.29), viewBox
// (75.71, 77.36) — the TIP OF THE RIBBON BOW, where the wig's outline stops
// running down the bust silhouette and turns back up along the top of the bow.
// HEAD.Washington passes through the SAME coordinate and turns 42.1 deg there;
// only HAIR turns 102.
//
// CONTROL: the same crop rendered at 84 px, where the drawing is byte-identical
// in this region between revisions this round did not touch, so anything
// visible in both crops is not this knot.
//
// Run: node coloringbook/judge/_jq7bow.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { marks } from './_jqgeom.mjs';

const FITS = JSON.parse(readFileSync('coloringbook/judge/_jq7fit.json'));
const D = FITS['quarter-obv-1932ngc.jpg'];
const toPx = (p) => ({ x: D.cx + (D.R * (p.x - 50)) / 47, y: D.cy + (D.R * (p.y - 50)) / 47 });
const mod = await import('../../src/art/coins.js');
const all = marks(mod.coinSVG('quarter', 190, { side: 'obverse' })).slice(1);
const hair = all.find((m) => m.el === 'path' && m.knots.length >= 34 && m.fill === '#a4acb4');
const K = hair.knots[20];
const poly = hair.pts.map(toPx).map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ');
const k = toPx(K);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="2000">`
  + `<polyline points="${poly}" fill="none" stroke="#ff2020" stroke-width="5"/>`
  + `<circle cx="${k.x.toFixed(1)}" cy="${k.y.toFixed(1)}" r="16" fill="none" stroke="#00ff00" stroke-width="5"/>`
  + [19, 21].map((i) => { const q = toPx(hair.knots[i]); return `<circle cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="9" fill="#00ffff"/>`; }).join('')
  + '</svg>';
const over = await sharp(Buffer.from(svg)).resize(2000, 2000, { fit: 'fill' }).png().toBuffer();
// composite and extract in two passes: sharp applies `extract` before
// `composite` in one pipeline, so the 2000x2000 overlay is then larger than the
// 620x560 crop and it throws.
const full = await sharp('coloringbook/ref/quarter-obv-1932ngc.jpg')
  .composite([{ input: over, top: 0, left: 0 }]).png().toBuffer();
await sharp(full)
  .extract({ left: Math.round(k.x - 330), top: Math.round(k.y - 300), width: 620, height: 560 })
  .resize(620).png().toFile('coloringbook/judge/_jq7bow-ref.png');

for (const px of [190, 84]) {
  const s = (px * 6) / 100;
  // same two-pass reason: sharp's `extract` runs BEFORE `resize` in one
  // pipeline, so the crop would be taken from the un-magnified render.
  const big = await sharp(Buffer.from(mod.coinSVG('quarter', px, { side: 'obverse' })))
    .resize(px * 6, px * 6, { kernel: 'nearest' }).png().toBuffer();
  await sharp(big)
    .extract({ left: Math.round((K.x - 9) * s), top: Math.round((K.y - 8) * s),
      width: Math.round(18 * s), height: Math.round(16 * s) })
    .resize(620).png().toFile(`coloringbook/judge/_jq7bow-ours-${px}.png`);
}
console.log(`knot 20 viewBox (${K.x.toFixed(2)}, ${K.y.toFixed(2)}) -> ref px (${k.x.toFixed(0)}, ${k.y.toFixed(0)})`);
console.log('wrote _jq7bow-ref.png, _jq7bow-ours-190.png, _jq7bow-ours-84.png');
