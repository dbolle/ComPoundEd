import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { coinSVG } from '../../src/art/coins.js';
const D = JSON.parse(readFileSync(new URL('./_jp1discs.json', import.meta.url).pathname,'utf8'));
const REF = new URL('../ref/', import.meta.url).pathname;
async function refDisc(file, box) {
  const m = await sharp(REF+file).metadata();
  const d = D[file];
  const cx = d?d.cx:m.width/2, cy = d?d.cy:m.height/2, R = d?d.R:Math.min(m.width,m.height)/2*0.95;
  const L=Math.max(0,Math.round(cx-R)), T=Math.max(0,Math.round(cy-R));
  const S=Math.round(Math.min(2*R, m.width-L, m.height-T));
  return sharp(REF+file).extract({left:L,top:T,width:S,height:S}).resize(box,box,{fit:'fill'}).png().toBuffer();
}
const B=400;
const rows = [
  ['penny reverse',  await sharp(Buffer.from(coinSVG('penny',520,{side:'reverse'}))).resize(B,B,{fit:'contain',background:'#fff'}).png().toBuffer(),
   await refDisc('penny-rev-2.png',B), await refDisc('penny-rev-1991d.png',B)],
  ['quarter obverse', await sharp(Buffer.from(coinSVG('quarter',520,{side:'obverse'}))).resize(B,B,{fit:'contain',background:'#fff'}).png().toBuffer(),
   await refDisc('quarter-obv.jpg',B), await refDisc('quarter-obv-3.png',B)],
];
const W=B*3+40, H=rows.length*(B+34)+10;
const txt=[]; const layers=[];
rows.forEach((r,ri)=>{
  const top=ri*(B+34)+28;
  txt.push(`<text x="10" y="${top-8}" font-family="monospace" font-size="15" fill="#111">${r[0]} — OURS | reference | reference</text>`);
  [r[1],r[2],r[3]].forEach((b,ci)=>layers.push({input:b,left:10+ci*(B+10),top}));
});
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>${txt.join('')}</svg>`))
  .composite(layers).png().toFile('coloringbook/judge/_look3.png');
console.log('wrote _look3.png');
