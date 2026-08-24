// §2.1 + §20.3 for the four REVERSES. Reuses _qtdisc's coinMask / rayCast /
// kasa (alpha-aware; the reverse refs include three alpha PNGs).
import { coinMask, rayCast, kasa } from './_qtdisc.mjs';

export const FILES = ['penny-rev.jpg','penny-rev-2.png','penny-rev-artwork.jpg',
  'nickel-rev.jpg','nickel-rev-2.png','nickel-rev-proof.png',
  'dime-rev.jpg','dime-rev-2.jpg','quarter-rev.jpg','quarter-rev-2.png'];

export async function fit(file){
  const { m, W, H, area, via } = await coinMask(file);
  const pts = rayCast(m, W, H, area);
  const use = pts.filter(([a]) => !(a > 25 && a < 155));  // drop bottom (edge thickness)
  const f = kasa(use);
  const res = pts.map(([a,x,y]) => [a, Math.hypot(x-f.cx,y-f.cy) - f.R]);
  const ur = res.filter(([a]) => !(a>25&&a<155)).map(r=>Math.abs(r[1])).sort((p,q)=>p-q);
  const all = pts.map(([,x,y])=>Math.hypot(x-f.cx,y-f.cy)).sort((p,q)=>p-q);
  return { file, W, H, via, area, ...f,
    p95: ur[(ur.length*0.95)|0], med: ur[ur.length>>1],
    r5: all[(all.length*0.05)|0], r95: all[(all.length*0.95)|0],
    sect: Array.from({length:12},(_,b)=>{
      const s=res.filter(([a])=>a>=b*30&&a<(b+1)*30).map(r=>r[1]);
      return s.reduce((p,q)=>p+q,0)/s.length; }) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out={};
  for (const f of FILES){
    const r = await fit(f);
    out[f]={cx:+r.cx.toFixed(2),cy:+r.cy.toFixed(2),R:+r.R.toFixed(2)};
    console.log(`${f.padEnd(22)} ${r.W}x${r.H} ${r.via}`);
    console.log(`   cx ${r.cx.toFixed(2)} cy ${r.cy.toFixed(2)} R ${r.R.toFixed(2)}  |res| med ${r.med.toFixed(2)} p95 ${r.p95.toFixed(2)} = ${(100*r.p95/r.R).toFixed(2)}% of R`);
    console.log(`   sector mean resid: ${r.sect.map((v,i)=>`${i*30}:${v.toFixed(1)}`).join(' ')}`);
  }
  console.log(JSON.stringify(out,null,1));
}
