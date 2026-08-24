import sharp from 'sharp';
export async function discFit(file, { bgT=235, verbose=false } = {}) {
  const { data, info } = await sharp(file).flatten({background:'#fff'}).greyscale().raw().toBuffer({resolveWithObject:true});
  const W=info.width,H=info.height;
  // flood near-white background inward from frame
  const bg=new Uint8Array(W*H); const st=new Int32Array(W*H); let sp=0;
  const push=(p)=>{ if(!bg[p]&&data[p]>=bgT){bg[p]=1;st[sp++]=p;} };
  for(let x=0;x<W;x++){ push(x); push((H-1)*W+x); }
  for(let y=0;y<H;y++){ push(y*W); push(y*W+W-1); }
  while(sp>0){ const p=st[--sp]; const x=p%W,y=(p-x)/W;
    if(x>0)push(p-1); if(x<W-1)push(p+1); if(y>0)push(p-W); if(y<H-1)push(p+W); }
  const blob=new Uint8Array(W*H); let n=0;
  for(let i=0;i<W*H;i++){ blob[i]=bg[i]?0:1; n+=blob[i]; }
  // boundary points, discarding those touching the frame
  const pts=[];
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){ const p=y*W+x; if(!blob[p])continue;
    if(blob[p-1]&&blob[p+1]&&blob[p-W]&&blob[p+W])continue;
    if(x<=2||y<=2||x>=W-3||y>=H-3)continue;
    pts.push([x,y]); }
  let keep=pts, cx=W/2, cy=H/2, R=Math.min(W,H)/2;
  for(let it=0; it<14; it++){
    // Kasa algebraic fit
    let Sx=0,Sy=0,Sxx=0,Syy=0,Sxy=0,Sxz=0,Syz=0,Sz=0,N=keep.length;
    for(const [x,y] of keep){ const z=x*x+y*y; Sx+=x;Sy+=y;Sxx+=x*x;Syy+=y*y;Sxy+=x*y;Sxz+=x*z;Syz+=y*z;Sz+=z; }
    const A=[[Sxx,Sxy,Sx],[Sxy,Syy,Sy],[Sx,Sy,N]], b=[Sxz,Syz,Sz];
    // solve 3x3
    const M=A.map((r,i)=>[...r,b[i]]);
    for(let i=0;i<3;i++){ let piv=i; for(let k=i+1;k<3;k++) if(Math.abs(M[k][i])>Math.abs(M[piv][i])) piv=k;
      [M[i],M[piv]]=[M[piv],M[i]];
      for(let k=0;k<3;k++){ if(k===i)continue; const f=M[k][i]/M[i][i]; for(let j=i;j<4;j++) M[k][j]-=f*M[i][j]; } }
    const a=M[0][3]/M[0][0], bb=M[1][3]/M[1][1], c=M[2][3]/M[2][2];
    cx=a/2; cy=bb/2; R=Math.sqrt(c+cx*cx+cy*cy);
    const tol=Math.max(2,0.02*R);
    keep=pts.filter(([x,y])=>Math.abs(Math.hypot(x-cx,y-cy)-R)<tol);
    if(keep.length<50) break;
  }
  const rs=keep.map(([x,y])=>Math.hypot(x-cx,y-cy)).sort((a,b)=>a-b);
  const q=(f)=>rs[Math.floor(f*(rs.length-1))];
  return { cx, cy, R, n:keep.length, p5:q(0.05), p95:q(0.95), W, H, blobArea:n };
}
