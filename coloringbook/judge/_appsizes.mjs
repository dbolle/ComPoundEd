// Every face at the sizes the app ACTUALLY draws — 38, 48, 54, 84.
// src/screens/money.js: coinRow(opt.coins, 38), coinRow(q.coins, 48),
// coinRow(q.coins) whose default is 54, and coinRow(q.coins, 84).
// Rendered at true device pixels, then magnified 3x with NEAREST so the sheet
// shows exactly the pixels a child gets and invents nothing.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { coinSVG } from '../../src/art/coins.js';
const VERSION = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url).pathname,'utf8')).version;
const IDS=['penny','nickel','dime','quarter','buck'], SIDES=['obverse','reverse'];
const SZ=[38,48,54,84], MAG=3, PAD=14, LAB=76, HEAD=54;
const cell = 84*MAG;
const layers=[], text=[];
text.push(`<text x="${PAD}" y="24" font-family="monospace" font-size="17" fill="#111">v${VERSION} — every face at the sizes the app draws, magnified 3x (nearest), no invented detail</text>`);
SZ.forEach((px,ci)=>text.push(`<text x="${LAB+PAD+ci*(cell+PAD)+cell/2-14}" y="46" font-family="monospace" font-size="14" fill="#555">${px}px</text>`));
let row=0;
for(const id of IDS) for(const side of SIDES){
  const top = HEAD + row*(cell+PAD);
  text.push(`<text x="${PAD}" y="${top+cell/2}" font-family="monospace" font-size="12" fill="#333">${id}</text>`);
  text.push(`<text x="${PAD}" y="${top+cell/2+14}" font-family="monospace" font-size="11" fill="#888">${side.slice(0,3)}</text>`);
  for(let ci=0;ci<SZ.length;ci++){
    const png = await sharp(Buffer.from(coinSVG(id, SZ[ci], {side}))).png().toBuffer();
    const m = await sharp(png).metadata();
    const up = await sharp(png).resize(m.width*MAG, m.height*MAG, {kernel:'nearest'}).png().toBuffer();
    layers.push({input:up, left: LAB+PAD+ci*(cell+PAD)+Math.round((cell-m.width*MAG)/2), top: top+Math.round((cell-m.height*MAG)/2)});
  }
  row++;
}
const W = LAB+PAD+SZ.length*(cell+PAD), H = HEAD+row*(cell+PAD)+PAD;
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>${text.join('')}</svg>`))
  .composite(layers).png().toFile('coloringbook/judge/_appsizes.png');
console.log(`wrote _appsizes.png (${W}x${H})`);
