const A = await import('/tmp/claude-1000/-home-USER-compounded/50ad3f5d-491c-4745-97b9-38751da704e7/scratchpad/base173/src/art/coins.js');
const B = await import('/home/USER/compounded/src/art/coins.js');
const IDS=['penny','nickel','dime','quarter','buck'], SIDES=['obverse','reverse'];
const SZ=[26,38,42,44,62,84,110,190,380,600];
let same=0; const diff=[];
for(const id of IDS) for(const s of SIDES) for(const px of SZ){
  if(A.coinSVG(id,px,{side:s})===B.coinSVG(id,px,{side:s})) same++; else diff.push(`${id}.${s}@${px}`);
}
console.log(`identical ${same}, changed ${diff.length}`);
console.log('faces touched:', [...new Set(diff.map(d=>d.split('@')[0]))].join(', '));
