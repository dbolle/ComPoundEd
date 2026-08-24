// OUR OUTLINE ON THE PHOTOGRAPH.
//
// TWO OF MY OWN INSTRUMENTS FAILED BEFORE THIS ONE WORKED, both recorded:
//  1. _nk2env.mjs tried to measure the bust envelope by segmenting device from
//     field. Every reference returned h/D 0.879 — exactly the 0.88R clip bound.
//     A null result riding its own search bound; the same wall ~10 instruments
//     in this project have hit. Its numbers are void.
//  2. v1 of THIS file built the edge test on keys rounded to 1/400 while
//     sampling the mask at 900px (u-step 1/450). The neighbour lookup missed,
//     interior pixels were marked as edge, and the overlay came out as a red
//     LATTICE. It looked like a plausible outline at a glance, which is exactly
//     why it is recorded rather than quietly fixed.
//
// This version works on a boolean grid at the render's own resolution, so the
// neighbour test is exact by construction.
// ── THE THIRD FAILURE, FIXED 2026-08-24 (ledger A10) ───────────────────────
//  3. The private `discOf()` below registered the PHOTOGRAPH by AREA:
//         R = sqrt(count(|grey - bg| > 25) / PI)
//     That is the radius of a circle with the mask's area, not the rim. On the
//     two references this file crops it reads
//         nickel-obv-proof.png   area 1401.38 vs rim 1412.97   -0.82 %
//         nickel-obv-5.JPG       area  467.41 vs rim  473.54   -1.29 %
//     so the crop box was 0.8-1.3 % too tight, the coin filled slightly more of
//     the tile than it should, and our outline was drawn correspondingly small
//     against it — the SAME DIRECTION as the 6.0 % blank-radius error recorded
//     below, on top of it. That error was found and fixed; this one was left,
//     and every overlay this file has produced since carries it.
//
//     The registration is now `_rimfit.mjs`, which recovers a known radius on a
//     synthetic disc to 0.014 px and agrees with `_dr1disc.mjs`'s independent
//     rim fitter to a mean of -0.078 %. Its area fit is still computed, and is
//     PRINTED, as the error term — never as a coordinate.
import sharp from 'sharp';
import { join } from 'node:path';
import { coinSVG } from '../../src/art/coins.js';
import { fitRim } from './_rimfit.mjs';
import { REF as REF_DIR, JUDGE } from './_paths.mjs';
const REF = REF_DIR + '/';
const N = 720;

const png = await sharp(Buffer.from(coinSVG('nickel', N, {side:'obverse'}))).flatten({background:'#ffffff'}).png().toBuffer();
const { data, info } = await sharp(png).greyscale().raw().toBuffer({resolveWithObject:true});
const W=info.width, H=info.height, P=(x,y)=>data[y*W+x];
// THE BLANK IS DRAWN AT r=47, NOT 50. `outlineOf` calls
// `reededPath(n, 47, depth)`, so the coin's edge sits at 47 of the 100-unit
// viewBox. Normalising our render by half its WIDTH (=50 units) drew our
// outline 6.0% SMALL against a reference cropped to its own disc — which made
// our art look like it fits inside the coin better than it does. Every
// placement this overlay has shown was flattered by 6%. Found by the nickel
// shape round; the judge had already published a reading from the flattered
// version.
const BLANK_R = 47;
const cx=W/2, cy=H/2, R=Math.min(W,H)/2 * (BLANK_R/50);
const fv=[]; for(let a=150;a<=210;a+=2){const t=a*Math.PI/180;
  for(let r=0.62;r<=0.80;r+=0.02){const x=Math.round(cx+Math.cos(t)*R*r), y=Math.round(cy+Math.sin(t)*R*r); fv.push(P(x,y));}}
fv.sort((p,q)=>p-q); const field=fv[fv.length>>1];

// boolean grid at the render's own resolution — exact neighbour test
const on = new Uint8Array(W*H);
for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const u=(x-cx)/R, v=(y-cy)/R; if(Math.hypot(u,v)>0.86) continue;
  if(Math.abs(P(x,y)-field)>14) on[y*W+x]=1;
}
const edge=[];
for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
  if(!on[y*W+x]) continue;
  if(on[(y-1)*W+x] && on[(y+1)*W+x] && on[y*W+x-1] && on[y*W+x+1]) continue;
  edge.push([(x-cx)/R,(y-cy)/R]);
}
// SELF-CHECK: an outline must be a small fraction of the filled area. A lattice
// is not. If it is over 25% the extraction is broken and we say so.
let area=0; for(let k=0;k<W*H;k++) area+=on[k];
const frac = edge.length/area;
console.log(`filled ${area}, outline ${edge.length}, ratio ${(frac*100).toFixed(1)}%`);
if (frac > 0.25) { console.log('!! OUTLINE IS NOT AN OUTLINE — extraction broken, nothing published.'); process.exit(1); }

const B=560, tiles=[], names=[];
for (const f of ['nickel-obv-proof.png','nickel-obv-5.JPG']) {
  const d=await fitRim(f);
  console.log(`  ${f}  rim R ${d.R.toFixed(2)} (p95 ${d.p95pctR}% of R)  |  the AREA fit this file used to register on: ${d.areaR.toFixed(2)}, ${d.areaErrPct>0?'+':''}${d.areaErrPct}%`);
  const L=Math.max(0,Math.round(d.cx-d.R)),T=Math.max(0,Math.round(d.cy-d.R));
  const S=Math.round(Math.min(2*d.R,d.w-L,d.h-T));
  const base=await sharp(REF+f).extract({left:L,top:T,width:S,height:S}).resize(B,B,{fit:'fill'}).png().toBuffer();
  const dots=edge.map(([u,v])=>`<rect x="${(B/2+u*B/2).toFixed(1)}" y="${(B/2+v*B/2).toFixed(1)}" width="1.7" height="1.7" fill="#ff1010"/>`).join('');
  tiles.push(await sharp(base).composite([{input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${B}" height="${B}">${dots}</svg>`)}]).png().toBuffer());
  names.push(f);
}
const WW=tiles.length*(B+10)+10,HH=B+40;
const txt=names.map((n,i)=>`<text x="${10+i*(B+10)}" y="24" font-family="monospace" font-size="14" fill="#111">our outline on ${n}</text>`).join('');
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${WW}" height="${HH}"><rect width="${WW}" height="${HH}" fill="#fff"/>${txt}</svg>`))
 .composite(tiles.map((b,i)=>({input:b,left:10+i*(B+10),top:32}))).png().toFile(join(JUDGE,'_nk3over.png'));
console.log('wrote _nk3over.png');
