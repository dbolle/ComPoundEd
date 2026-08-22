// Nickel obverse: ours against the photographs, at matched disc scale.
// No prior conclusions assumed — this exists to LOOK.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { coinSVG } from '../../src/art/coins.js';
const REF = new URL('../ref/', import.meta.url).pathname;
const B = 430;
async function discOf(file){
  const {data,info}=await sharp(REF+file).greyscale().raw().toBuffer({resolveWithObject:true});
  const px=(x,y)=>data[y*info.width+x]; const b=[];
  for(let x=0;x<info.width;x++)b.push(px(x,0),px(x,info.height-1));
  for(let y=0;y<info.height;y++)b.push(px(0,y),px(info.width-1,y));
  b.sort((p,q)=>p-q); const bg=b[b.length>>1];
  let n=0,sx=0,sy=0;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++) if(Math.abs(px(x,y)-bg)>25){n++;sx+=x;sy+=y;}
  return {cx:sx/n, cy:sy/n, R:Math.sqrt(n/Math.PI), w:info.width, h:info.height};
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
