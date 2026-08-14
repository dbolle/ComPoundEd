// DIME r0 — D5-band. The LEGEND BAND read off the reference, numerically, to
// settle a 1.6-unit disagreement my EYE found between two unwrap pictures.
// Angular high-pass (sigma 3 deg) across radius, over a sector frozen from the
// TARGET. §4.1 window printed; a band edge at a window end is a failure report.
// §4.2 every run over half the max is printed. §4.3 the located band is drawn.
import { readFileSync } from 'node:fs';
import { unwrap, ladder, draw } from './_jd3unwrap.mjs';
const HERE=(f)=>new URL('./'+f,import.meta.url).pathname;
const D=JSON.parse(readFileSync(HERE('_jd1discs.json'))), E=JSON.parse(readFileSync(HERE('_jd6edge.json')));
const RLO=28,RHI=46,STEP=0.05,SIG=3.0;
const JOBS=[
 {tag:'obv LIBERTY',sect:[160,245],refs:['dime-obv-2.jpg','dime-obv-3.jpg','dime-obv.jpg']},
 {tag:'obv IN GOD WE TRUST',sect:[95,142],refs:['dime-obv-2.jpg','dime-obv-3.jpg','dime-obv.jpg']},
 {tag:'rev UNITED STATES OF AMERICA',sect:[200,340],refs:['dime-rev-2.jpg']},
 {tag:'rev ONE DIME',sect:[40,140],refs:['dime-rev-2.jpg']},
];
function gaussSm(x,n){const out=new Float64Array(x.length);const k=Math.ceil(3*n);
 for(let i=0;i<x.length;i++){let s=0,w=0;for(let j=-k;j<=k;j++){const p=i+j;if(p<0||p>=x.length)continue;const g=Math.exp(-(j*j)/(2*n*n));s+=x[p]*g;w+=g;}out[i]=s/w;}return out;}
for(const job of JOBS){
 console.log(`\n=== ${job.tag}  sector ${job.sect} [FROZEN from the TARGET]  window r ${RLO}..${RHI}`);
 for(const f of job.refs){
  const k=E[f].B_correction,u=await unwrap(f);
  const rows=[];
  for(let r=RLO;r<=RHI;r+=STEP){
   const src=Math.round((u.RB-r/(47*k))/(u.RB-u.RA)*(u.H-1)); if(src<0||src>=u.H) continue;
   const t=[];for(let i=0;i<u.W;i++){const a=360*i/u.W;if(a<job.sect[0]||a>job.sect[1])continue;if(!u.ok[src*u.W+i])continue;t.push(u.buf[src*u.W+i]);}
   if(t.length<10){rows.push([r,0]);continue;}
   const sm=gaussSm(Float64Array.from(t),SIG/ (360/u.W));
   let s=0;for(let i=0;i<t.length;i++)s+=Math.abs(t[i]-sm[i]);
   rows.push([r,s/t.length]);
  }
  const mx=Math.max(...rows.map(x=>x[1])),med=rows.map(x=>x[1]).sort((a,b)=>a-b)[rows.length>>1];
  const runs=[];let cur=null;
  for(const [r,v] of rows){ if(v>=0.5*mx){ if(!cur)cur={lo:r,hi:r,peak:v,pr:r}; else {cur.hi=r; if(v>cur.peak){cur.peak=v;cur.pr=r;}} } else if(cur){runs.push(cur);cur=null;} }
  if(cur)runs.push(cur);
  console.log(`  ${f.padEnd(15)} hf max ${mx.toFixed(2)} median ${med.toFixed(2)} degeneracy ${(mx/(med||1e-9)).toFixed(2)}x`);
  for(const p of runs){const atB=p.lo<=RLO+1e-9||p.hi>=RHI-1e-9;
   console.log(`     run r ${p.lo.toFixed(2)}..${p.hi.toFixed(2)}  width ${(p.hi-p.lo).toFixed(2)}  peak ${p.peak.toFixed(1)} at ${p.pr.toFixed(2)}${atB?'   <-- AT A WINDOW BOUND (§4.1): FAILURE REPORT':''}`);}
  const main=runs.slice().sort((a,b)=>(b.hi-b.lo)-(a.hi-a.lo))[0];
  if(main)console.log(`     BAND (widest run): rInner ${main.lo.toFixed(2)}  rOuter ${main.hi.toFixed(2)}  cap ${(main.hi-main.lo).toFixed(2)}`);
 }
}
