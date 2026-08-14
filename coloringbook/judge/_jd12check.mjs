// DIME r0 — WHY DO TWO REFERENCES PUT LIBERTY 1.7 UNITS APART?
// A ratio that cannot depend on the fitted R: measure the coin EDGE and the
// LEGEND OUTER EDGE in the SAME angular sector, in raw pixels from the same
// centre, and report legend/edge. If the two references disagree on that ratio,
// the disagreement is in the photographs; if they agree, it is in my disc fits.
import { readFileSync } from 'node:fs';
import { unwrap } from './_jd3unwrap.mjs';
const HERE=(f)=>new URL('./'+f,import.meta.url).pathname;
const D=JSON.parse(readFileSync(HERE('_jd1discs.json')));
const SECT=[160,245], RLO=28, RHI=49, STEP=0.05, SIG=3.0;
function gaussSm(x,n){const out=new Float64Array(x.length);const k=Math.ceil(3*n);
 for(let i=0;i<x.length;i++){let s=0,w=0;for(let j=-k;j<=k;j++){const p=i+j;if(p<0||p>=x.length)continue;const g=Math.exp(-(j*j)/(2*n*n));s+=x[p]*g;w+=g;}out[i]=s/w;}return out;}
console.log('sector', SECT, '(LIBERTY). All radii in RAW UNCORRECTED unwrap units (47 = fitted R).');
console.log('ref              coinEdge   legendOuter  legendInner   legOuter/edge  legInner/edge  cap/edge');
for(const f of ['dime-obv-2.jpg','dime-obv-3.jpg','dime-obv.jpg']){
 const u=await unwrap(f);
 const rows=[],edge=[];
 for(let r=RLO;r<=RHI;r+=STEP){
  const src=Math.round((u.RB-r/47)/(u.RB-u.RA)*(u.H-1)); if(src<0||src>=u.H) continue;
  const t=[];for(let i=0;i<u.W;i++){const a=360*i/u.W;if(a<SECT[0]||a>SECT[1])continue;if(!u.ok[src*u.W+i])continue;t.push(u.buf[src*u.W+i]);}
  if(t.length<10)continue;
  const sm=gaussSm(Float64Array.from(t),SIG/(360/u.W));
  let s=0;for(let i=0;i<t.length;i++)s+=Math.abs(t[i]-sm[i]);
  rows.push([r,s/t.length]);
  edge.push([r,t.reduce((p,q)=>p+q,0)/t.length]);
 }
 // coin edge in this sector = outermost radius whose mean is not background
 const bg=edge.filter(([r])=>r>=48.5).map(([,v])=>v).sort((a,b)=>a-b);
 const bgl=bg.length?bg[bg.length>>1]:255;
 let ce=null; for(let i=edge.length-1;i>=0;i--){ if(Math.abs(edge[i][1]-bgl)>30){ce=edge[i][0];break;} }
 const mx=Math.max(...rows.map(x=>x[1]));
 let lo=null,hi=null;
 for(const [r,v] of rows) if(v>=0.5*mx){ if(lo===null)lo=r; hi=r; }
 console.log(`${f.padEnd(16)} ${ce.toFixed(2).padStart(8)} ${hi.toFixed(2).padStart(12)} ${lo.toFixed(2).padStart(12)}   ${(47*hi/ce).toFixed(2).padStart(12)} ${(47*lo/ce).toFixed(2).padStart(14)} ${(47*(hi-lo)/ce).toFixed(2).padStart(9)}`);
}
console.log('\nThe last three columns are the legend radii RE-EXPRESSED against each');
console.log("photograph's OWN coin edge in the SAME sector, so the fitted R cancels.");
