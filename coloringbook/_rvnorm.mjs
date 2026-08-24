// Disc-normalise any reference into a fixed NxN grid spanning u,v in [-SPAN,SPAN].
// This is the one coordinate move every reverse tool needs: after it, two
// photographs of the same design are directly comparable pixel for pixel.
import sharp from 'sharp';
export const P = (f) => new URL('./ref/' + f, import.meta.url).pathname;
export const DISCS = {
  'penny-rev.jpg':        { cx: 238.51, cy: 251.93, R: 249.28 },
  'penny-rev-2.png':      { cx: 371.75, cy: 372.04, R: 372.61 },
  'penny-rev-artwork.jpg':{ cx: 250.74, cy: 224.17, R: 256.57 },
  'nickel-rev.jpg':       { cx: 242.75, cy: 244.92, R: 230.99 },
  'nickel-rev-2.png':     { cx: 479.56, cy: 480.62, R: 475.75 },
  'nickel-rev-proof.png': { cx: 1439.60, cy: 1455.11, R: 1418.55 },
  'dime-rev.jpg':         { cx: 247.38, cy: 252.12, R: 243.06 },
  'dime-rev-2.jpg':       { cx: 373.25, cy: 380.42, R: 366.61 },
  'quarter-rev.jpg':      { cx: 242.34, cy: 199.14, R: 228.21 },
  'quarter-rev-2.png':    { cx: 374.50, cy: 374.37, R: 374.98 },
};
export async function grey(file){
  const {data,info}=await sharp(P(file)).flatten({background:'#ffffff'}).greyscale().raw().toBuffer({resolveWithObject:true});
  return {d:data,w:info.width,h:info.height};
}
// bilinear sample
export function at(g,x,y){
  const {d,w,h}=g;
  if(x<0||y<0||x>=w-1||y>=h-1) return 255;
  const x0=x|0,y0=y|0,fx=x-x0,fy=y-y0;
  const a=d[y0*w+x0],b=d[y0*w+x0+1],c=d[(y0+1)*w+x0],e=d[(y0+1)*w+x0+1];
  return a*(1-fx)*(1-fy)+b*fx*(1-fy)+c*(1-fx)*fy+e*fx*fy;
}
export const N=512, SPAN=1.02;
// returns Float64Array N*N of grey, index [j*N+i], u = -SPAN + 2*SPAN*i/(N-1)
export async function normalise(file, disc){
  const g=await grey(file); const D=disc||DISCS[file];
  const out=new Float64Array(N*N);
  for(let j=0;j<N;j++){ const v=-SPAN+2*SPAN*j/(N-1);
    for(let i=0;i<N;i++){ const u=-SPAN+2*SPAN*i/(N-1);
      out[j*N+i]=at(g, D.cx+u*D.R, D.cy+v*D.R); } }
  return out;
}
// view-box coordinate helpers: X = 50 + 47u, Y = 50 + 47v
export const uv2XY=(u,v)=>[50+47*u,50+47*v];
export const XY2uv=(X,Y)=>[(X-50)/47,(Y-50)/47];
export const px2XY=(D,px,py)=>[50+47*(px-D.cx)/D.R, 50+47*(py-D.cy)/D.R];
export const XY2px=(D,X,Y)=>[D.cx+D.R*(X-50)/47, D.cy+D.R*(Y-50)/47];
