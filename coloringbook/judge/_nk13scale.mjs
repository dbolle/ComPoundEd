// WHAT IF THE SMALL SIZES WERE JUST THE BIG ONE SCALED DOWN?
//
// The owner's question. Today the art uses TIERS: at `icon` and `mid` the
// drawing deliberately omits detail rather than shrinking it, on the theory
// that sub-pixel detail is noise. The transfer results have repeatedly found
// the icon tier DESTROYING recognisability (the cent and quarter read as
// nickels until v1.74.0; the nickel was "an outline with nothing inside it"
// until v1.77.0), so the theory deserves a test rather than an assumption.
//
// LEFT of each pair: what the app draws now — coinSVG(id, px), tiers applied.
// RIGHT: coinSVG(id, 380) — full detail — resampled down to the SAME px with
// Lanczos, i.e. exactly the same device pixels a browser would produce if the
// module simply drew big and scaled.
//
// Both are then magnified 4x with NEAREST so the sheet shows real pixels.
import sharp from 'sharp';
import { coinSVG } from '../../src/art/coins.js';
const SZ = [38, 48, 54, 84], MAG = 4, BIG = 380;
const FACES = [['penny','obverse'],['nickel','obverse'],['dime','obverse'],['quarter','obverse'],
               ['penny','reverse'],['nickel','reverse'],['dime','reverse'],['quarter','reverse']];
const cell = 84*MAG + 8;
const layers=[], text=[];
text.push(`<text x="14" y="26" font-family="monospace" font-size="17" fill="#111">LEFT of each pair: tiers as drawn today.   RIGHT: the 380px drawing resampled down to the same size.   4x nearest, real pixels.</text>`);
SZ.forEach((px,ci)=>text.push(`<text x="${150+ci*(cell*2+22)+cell-24}" y="50" font-family="monospace" font-size="14" fill="#555">${px}px</text>`));
let row=0;
for (const [id,side] of FACES) {
  const top = 62 + row*(cell+10);
  text.push(`<text x="14" y="${top+cell/2}" font-family="monospace" font-size="12" fill="#333">${id}</text>`);
  text.push(`<text x="14" y="${top+cell/2+14}" font-family="monospace" font-size="11" fill="#888">${side.slice(0,3)}</text>`);
  const big = await sharp(Buffer.from(coinSVG(id, BIG, {side}))).png().toBuffer();
  for (let ci=0; ci<SZ.length; ci++) {
    const px = SZ[ci];
    const now = await sharp(Buffer.from(coinSVG(id, px, {side}))).png().toBuffer();
    const nm = await sharp(now).metadata();
    const bm = await sharp(big).metadata();
    // scale the big render so its WIDTH matches what the tiered render occupies
    const scaled = await sharp(big).resize(nm.width, Math.round(bm.height*nm.width/bm.width), {kernel:'lanczos3'}).png().toBuffer();
    for (const [k,buf] of [[0,now],[1,scaled]]) {
      const m = await sharp(buf).metadata();
      const up = await sharp(buf).resize(m.width*MAG, m.height*MAG, {kernel:'nearest'}).png().toBuffer();
      layers.push({input:up, left: 150+ci*(cell*2+22)+k*cell+Math.round((cell-m.width*MAG)/2), top: top+Math.round((cell-m.height*MAG)/2)});
    }
  }
  row++;
}
const W = 150 + SZ.length*(cell*2+22), H = 62 + row*(cell+10) + 10;
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>${text.join('')}</svg>`))
  .composite(layers).png().toFile('coloringbook/judge/_nk13scale.png');
console.log(`wrote _nk13scale.png (${W}x${H})`);
