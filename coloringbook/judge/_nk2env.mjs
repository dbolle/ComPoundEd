// Nickel obverse BUST ENVELOPE, as a fraction of the coin's outer diameter.
// Frame-invariant, so it compares a photograph and an SVG honestly.
// Device located by contrast against the FIELD, not by threshold on absolute
// grey: on the cameo proof the device is frosted-bright on a mirror-dark field;
// on ours it is ink on a pale field. Both are "differs from the field median".
import sharp from 'sharp';
import { coinSVG } from '../../src/art/coins.js';
const REF = new URL('../ref/', import.meta.url).pathname;

async function envelope(buf, label) {
  const { data, info } = await sharp(buf).flatten({ background:'#ffffff' }).greyscale()
    .raw().toBuffer({ resolveWithObject:true });
  const { width:w, height:h } = info; const px=(x,y)=>data[y*w+x];
  // disc = everything differing from the image border median
  const b=[]; for(let x=0;x<w;x++)b.push(px(x,0),px(x,h-1)); for(let y=0;y<h;y++)b.push(px(0,y),px(w-1,y));
  b.sort((p,q)=>p-q); const bg=b[b.length>>1];
  let n=0,sx=0,sy=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++) if(Math.abs(px(x,y)-bg)>25){n++;sx+=x;sy+=y;}
  const cx=sx/n, cy=sy/n, R=Math.sqrt(n/Math.PI);
  // FIELD = the annulus just inside the rim at the LEFT, which on this design
  // is bare field on every reference and on ours. Its median is the datum.
  const fv=[];
  for(let a=150;a<=210;a+=2){ const t=a*Math.PI/180;
    for(let r=0.62;r<=0.80;r+=0.02){ const x=Math.round(cx+Math.cos(t)*R*r), y=Math.round(cy+Math.sin(t)*R*r);
      if(x>=0&&y>=0&&x<w&&y<h) fv.push(px(x,y)); } }
  fv.sort((p,q)=>p-q); const field=fv[fv.length>>1];
  // device = inside 0.88R and differing from the field by more than 12 grey
  let top=1e9, bot=-1e9, lef=1e9, rig=-1e9, cnt=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const u=(x-cx)/R, v=(y-cy)/R; if(Math.hypot(u,v)>0.88) continue;
    if(Math.abs(px(x,y)-field)<=12) continue;
    cnt++; if(v<top)top=v; if(v>bot)bot=v; if(u<lef)lef=u; if(u>rig)rig=u;
  }
  const D=2; // in u,v units the diameter is 2
  console.log(`${label.padEnd(22)} R ${R.toFixed(0).padStart(5)}  device px ${String(cnt).padStart(8)}  h/D ${((bot-top)/D).toFixed(4)}  w/D ${((rig-lef)/D).toFixed(4)}  top ${(top).toFixed(3)}  bot ${(bot).toFixed(3)}`);
  return {h:(bot-top)/D, w:(rig-lef)/D};
}

console.log('BUST ENVELOPE, fraction of the coin\'s outer diameter\n');
const ours = await envelope(await sharp(Buffer.from(coinSVG('nickel',900,{side:'obverse'}))).png().toBuffer(), 'OURS');
const refs=[];
for (const f of ['nickel-obv-proof.png','nickel-obv-5.JPG','nickel-obv-4.jpg']) {
  refs.push(await envelope(await sharp(REF+f).png().toBuffer(), f));
}
const mh = refs.reduce((s,r)=>s+r.h,0)/refs.length, mw = refs.reduce((s,r)=>s+r.w,0)/refs.length;
console.log(`\nreference mean          h/D ${mh.toFixed(4)}  w/D ${mw.toFixed(4)}`);
console.log(`OURS vs mean            h/D ${((ours.h/mh-1)*100).toFixed(1)}%   w/D ${((ours.w/mw-1)*100).toFixed(1)}%`);
