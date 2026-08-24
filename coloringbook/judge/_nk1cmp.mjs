// Nickel obverse: ours against the photographs, at matched disc scale.
// No prior conclusions assumed — this exists to LOOK.
//
// ── "MATCHED DISC SCALE" WAS NOT MATCHED (ledger A9) ───────────────────────
// This file carried its own `discOf()` — `R = sqrt(area/pi)` over the threshold
// mask — and cropped each photograph to that radius before putting it beside
// our render. On these five files the area radius is 0.23 % to 5.00 % SMALL
// against a rim fit, and by a different amount per file, so the tiles it made
// were at five different scales while the picture's whole claim was that they
// were at one. A comparison picture whose scale is wrong per tile is worse than
// no picture: it is a picture that will be believed.
//
//     file                    area R    rim R    area error
//     nickel-obv-proof.png    1401.38  1412.97     -0.82 %
//     nickel-obv-5.JPG         467.41   473.52     -1.29 %
//     nickel-obv-4.jpg         376.76   393.29     -4.20 %
//     nickel-obv-3.png         453.69   452.66     +0.23 %  (a LINE DRAWING;
//                                       rim p95 34.50 % of R — not a disc)
//
// Registered on `_rimfit.fitRim` instead, which recovers a known radius on
// synthetic discs to 0.014 px. Every tile this file has ever produced was
// cropped 0.2-4.2 % tight, so our render read correspondingly LARGE beside it.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { coinSVG } from '../../src/art/coins.js';
import { fitRim } from './_rimfit.mjs';
const REF = new URL('../ref/', import.meta.url).pathname;
const B = 430;
async function discOf(file){
  const r = await fitRim(file);
  console.log(`  ${file.padEnd(22)} rim R ${r.R.toFixed(2)}  p95 ${r.p95pctR.toFixed(2)}% of R  (area ${r.areaR.toFixed(2)}, ${r.areaErrPct>0?'+':''}${r.areaErrPct}%)`
    + (r.p95pctR > 2.0 ? '   !! NOT A FITTED DISC — this tile is not to scale' : ''));
  return { cx: r.cx, cy: r.cy, R: r.R, w: r.w, h: r.h };
}
async function tile(file){
  const d=await discOf(file);
  const L=Math.max(0,Math.round(d.cx-d.R)), T=Math.max(0,Math.round(d.cy-d.R));
  const S=Math.round(Math.min(2*d.R, d.w-L, d.h-T));
  return sharp(REF+file).extract({left:L,top:T,width:S,height:S}).resize(B,B,{fit:'fill'}).png().toBuffer();
}
const files=['nickel-obv-proof.png','nickel-obv-5.JPG','nickel-obv-4.jpg','nickel-obv-3.png'];
const tiles=[await sharp(Buffer.from(coinSVG('nickel',560,{side:'obverse'}))).resize(B,B,{fit:'contain',background:'#fff'}).png().toBuffer()];
for(const f of files) tiles.push(await tile(f));
const names=['OURS',...files.map(f=>f.replace(/\.(png|jpg|JPG)$/,''))];
const W=tiles.length*(B+10)+10, H=B+44;
const txt=names.map((n,i)=>`<text x="${10+i*(B+10)}" y="26" font-family="monospace" font-size="15" fill="#111">${n}</text>`).join('');
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>${txt}</svg>`))
 .composite(tiles.map((b,i)=>({input:b,left:10+i*(B+10),top:34}))).png().toFile('coloringbook/judge/_nk1cmp.png');
console.log('wrote _nk1cmp.png');
