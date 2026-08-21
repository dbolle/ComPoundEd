// ROUND 5, cent obverse — the CHEEK AGAINST THE FIELD, measured on both struck
// references and on ours. D3 divides every patch by the cheek and is blind to
// this; D13 divides the whole interior by the field and cannot separate it from
// everything else in the interior. Between them nobody measures the one number
// that decides whether the base tone is right: cheek / bare field.
//
// The field patch is placed as a frozen literal, NOT found: disc-normalised
// (u, v) = (-0.62, 0.00), r = 0.05 — a point on the mid-left of the field, on the
// horizontal through the disc centre, chosen because on the cent obverse that
// radius is bare field on every reference (the bust's back reaches u = -0.44 and
// LIBERTY sits below it at v = +0.06..+0.14 in the reference's own frame). It is
// drawn on each source by `_jc5basefield.png` and looked at (§4.3).
//
// RESPONSE TEST: our own field patch must recover the palette's own grey for
// `field` (#c98a3c = 151) exactly, and our cheek patch `motif` (#96521c = 99).
// A number that is not one of this palette's greys is a bug report (§22.1).
//
// Run: node coloringbook/judge/_jc5base.mjs
import sharp from 'sharp';
import { grey, DISC, DISCS, REF, ourRaster, samplePatch, loadJSON } from '../_pylib.mjs';

const { patches } = loadJSON(new URL('../_tonepatches-penny.json', import.meta.url).pathname);
const cheek = patches.find((p) => p.name === 'cheek');
const FIELD = { name: 'field', u: -0.62, v: 0.0, r: 0.05 };
const mod = await import('../../src/art/coins.js');

const coatP = patches.find((p) => p.name === 'coat');
const rows = [];
for (const [label, file, disc] of [
  ['penny-obv-3.jpg (FRAME)', 'coloringbook/ref/penny-obv-3.jpg', DISC],
  ['penny-obv.jpg (1909-S)', 'coloringbook/ref/penny-obv.jpg', DISCS['penny-obv.jpg']],
]) {
  const g = await grey(file);
  rows.push([label, samplePatch(g, disc, cheek).med, samplePatch(g, disc, FIELD).med, samplePatch(g, disc, coatP).med]);
}
const photo = await grey(REF);
const our = await ourRaster(mod.coinSVG, DISC, photo.w, photo.h);
rows.push(['OURS (src/art/coins.js)', samplePatch(our, DISC, cheek).med, samplePatch(our, DISC, FIELD).med, samplePatch(our, DISC, coatP).med]);

console.log('source                      cheek  field   coat  cheek/field  coat/field  coat/cheek');
for (const [l, c, f, ct] of rows) console.log(`${l.padEnd(26)} ${String(c).padStart(5)} ${String(f).padStart(6)} ${String(ct).padStart(6)}   ${(c / f).toFixed(4)}      ${(ct / f).toFixed(4)}      ${(ct / c).toFixed(4)}`);
const [, oc, of_] = rows[2];
console.log(`\nRESPONSE TEST: ours must recover the palette's own greys — motif 99, field 151.`);
console.log(`  got cheek ${oc}, field ${of_}   ${oc === 99 && of_ === 151 ? 'PASS' : '<< FAIL, the raster is not tone-preserving here'}`);

// draw the two patches on every source
const OUT = 760;
async function over(buf, w, h, disc, file, title) {
  const k = OUT / (2.2 * disc.R), ox = disc.cx - 1.1 * disc.R, oy = disc.cy - 1.1 * disc.R;
  const X = (u) => ((disc.cx + u * disc.R) - ox) * k, Y = (v) => ((disc.cy + v * disc.R) - oy) * k;
  let g = '';
  for (const [p, c] of [[cheek, '#ffff00'], [FIELD, '#00ff00']])
    g += `<circle cx="${X(p.u).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="${(p.r * disc.R * k).toFixed(1)}" fill="none" stroke="${c}" stroke-width="3"/>`
      + `<text x="${(X(p.u) + p.r * disc.R * k + 5).toFixed(1)}" y="${(Y(p.v) + 5).toFixed(1)}" font-family="monospace" font-size="18" fill="${c}">${p.name}</text>`;
  g += `<text x="6" y="20" font-family="monospace" font-size="16" fill="#ff00ff">${title}</text>`;
  const base = await sharp(buf, { raw: { width: w, height: h, channels: 1 } })
    .extract({ left: Math.max(0, Math.round(ox)), top: Math.max(0, Math.round(oy)),
      width: Math.min(w - Math.max(0, Math.round(ox)), Math.round(2.2 * disc.R)),
      height: Math.min(h - Math.max(0, Math.round(oy)), Math.round(2.2 * disc.R)) })
    .resize(OUT, OUT, { fit: 'fill' }).toColourspace('srgb').png().toBuffer();
  await sharp(base).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${OUT}" height="${OUT}">${g}</svg>`) }]).toFile(file);
  console.log('wrote', file);
}
await over(photo.d, photo.w, photo.h, DISC, 'coloringbook/_pv/_jc5basefield-ref3.png', 'penny-obv-3.jpg — cheek and the frozen field patch');
const g9 = await grey('coloringbook/ref/penny-obv.jpg');
await over(g9.d, g9.w, g9.h, DISCS['penny-obv.jpg'], 'coloringbook/_pv/_jc5basefield-1909.png', 'penny-obv.jpg (1909-S)');
await over(our.d, our.w, our.h, DISC, 'coloringbook/_pv/_jc5basefield-ours.png', 'OURS');
