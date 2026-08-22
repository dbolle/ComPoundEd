import sharp from 'sharp';
import * as NOW  from '../../src/art/coins.js';
import * as WIDE from '../../src/art/_edge_preview.js';
const IDS=['penny','nickel','dime','quarter'], SIDES=['obverse','reverse'];
const CELL=150,PAD=10,LAB=104,HEAD=52;
const up=async(m,id,side,px)=>{
  const png=await sharp(Buffer.from(m.coinSVG(id,px,{side}))).png().toBuffer();
  return sharp(png).resize(CELL,CELL,{kernel:'nearest',fit:'contain',background:'#fff'}).png().toBuffer();
};
const rows=[]; for(const s of SIDES) for(const id of IDS) rows.push({id,side:s});
const W=LAB+2*(CELL+PAD)+PAD, H=HEAD+rows.length*(CELL+PAD)+PAD;
const layers=[];
for(let r=0;r<rows.length;r++){
  const {id,side}=rows[r];
  layers.push({input:await up(NOW ,id,side,84),left:LAB+PAD,            top:HEAD+r*(CELL+PAD)+PAD});
  layers.push({input:await up(WIDE,id,side,84),left:LAB+PAD+(CELL+PAD), top:HEAD+r*(CELL+PAD)+PAD});
}
const heads=`<text x="${LAB+PAD}" y="20" font-family="monospace" font-size="14" fill="#999">NOW  field 41.0</text>`+
 `<text x="${LAB+PAD}" y="38" font-family="monospace" font-size="11" fill="#777">0.872 of disc</text>`+
 `<text x="${LAB+PAD+CELL+PAD}" y="20" font-family="monospace" font-size="14" fill="#5f5">MEASURED  44.07</text>`+
 `<text x="${LAB+PAD+CELL+PAD}" y="38" font-family="monospace" font-size="11" fill="#4a4">0.938 of disc, 4 judges</text>`;
const labs=rows.map((o,i)=>`<text x="8" y="${HEAD+i*(CELL+PAD)+PAD+CELL/2}" font-family="monospace" font-size="13" fill="#eee">${o.id}</text>`+
 `<text x="8" y="${HEAD+i*(CELL+PAD)+PAD+CELL/2+16}" font-family="monospace" font-size="11" fill="#888">${o.side}</text>`).join('');
await sharp({create:{width:W,height:H,channels:3,background:'#161616'}})
 .composite([...layers,{input:Buffer.from(`<svg width="${W}" height="${H}">${heads}${labs}</svg>`),left:0,top:0}])
 .png().toFile('_edge-field-preview.png');
console.log('  wrote _edge-field-preview.png '+W+'x'+H);
