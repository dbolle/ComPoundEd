// BUCK r0 — a focused ladder crop of the rectified reference, for the hand
// readings D5 needs after both automatic detectors returned their own bounds.
//   node coloringbook/judge/_jb6crop.mjs <file> <X0> <X1> <Y0> <Y1> <zoom> <out>
import sharp from 'sharp';
import { fitBorder, grey } from '../_blfit.mjs';
import { homography, uv2px, at } from '../_blnorm.mjs';
const [file,a,b,c,d,Z,out]=[process.argv[2],+process.argv[3],+process.argv[4],+process.argv[5],+process.argv[6],+process.argv[7],process.argv[8]];
const FID=process.env.FID||'border';
const F=FID==='paper'?{x0:1.4,y0:1.4,x1:98.6,y1:54.6}:{x0:5,y0:5,x1:95,y1:51};
const S=26,W=Math.round((F.x1-F.x0)*S),H=Math.round((F.y1-F.y0)*S);
const fit=await fitBorder(file),g=await grey(file);
const p=fit.paperBox;
const corners=FID==='paper'?{TL:[p.px0,p.py0],TR:[p.px1,p.py0],BR:[p.px1,p.py1],BL:[p.px0,p.py1]}:fit.corners;
const Hm=homography(corners);const buf=Buffer.alloc(W*H);
for(let j=0;j<H;j++)for(let i=0;i<W;i++){const[px,py]=uv2px(Hm,(i+0.5)/W,(j+0.5)/H);buf[j*W+i]=Math.max(0,Math.min(255,Math.round(at(g,px,py))));}
const left=Math.round((a-F.x0)*S),top=Math.round((c-F.y0)*S),ww=Math.round((b-a)*S),hh=Math.round((d-c)*S);
if(![left,top,ww,hh].every(Number.isFinite)||ww<=0||hh<=0)throw new Error('bad crop');
let s='';
for(let X=Math.ceil(a);X<=b+1e-9;X+=1){const x=(X-a)*S*Z,maj=X%5===0;s+=`<line x1="${x}" y1="0" x2="${x}" y2="${hh*Z}" stroke="#ff2000" stroke-width="${maj?1.6:0.6}" opacity="${maj?0.9:0.45}"/>`;if(maj)s+=`<text x="${x+3}" y="18" fill="#ff2000" font-size="17" font-family="monospace">${X}</text><text x="${x+3}" y="${hh*Z-5}" fill="#ff2000" font-size="17" font-family="monospace">${X}</text>`;}
for(let Y=Math.ceil(c);Y<=d+1e-9;Y+=1){const y=(Y-c)*S*Z,maj=Y%5===0;s+=`<line x1="0" y1="${y}" x2="${ww*Z}" y2="${y}" stroke="#ff2000" stroke-width="${maj?1.6:0.6}" opacity="${maj?0.9:0.45}"/>`;if(maj)s+=`<text x="4" y="${y-4}" fill="#ff2000" font-size="17" font-family="monospace">${Y}</text><text x="${ww*Z-30}" y="${y-4}" fill="#ff2000" font-size="17" font-family="monospace">${Y}</text>`;}
await sharp(buf,{raw:{width:W,height:H,channels:1}}).extract({left,top,width:ww,height:hh}).resize(Math.round(ww*Z),Math.round(hh*Z)).toColourspace('srgb').png().toBuffer()
 .then(bb=>sharp(bb).composite([{input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(ww*Z)}" height="${Math.round(hh*Z)}">${s}</svg>`),top:0,left:0}]).png().toFile(out));
console.log(out,`X ${a}..${b} Y ${c}..${d} zoom ${Z} FID=${FID}`);
