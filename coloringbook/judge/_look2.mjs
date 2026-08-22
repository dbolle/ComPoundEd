import sharp from 'sharp';
import { coinSVG } from '../../src/art/coins.js';
const jobs = [['penny','reverse'],['quarter','obverse']];
const tiles = [];
for (const [id,side] of jobs) {
  tiles.push(await sharp(Buffer.from(coinSVG(id, 520, { side }))).resize(460,460,{fit:'contain',background:'#fff'}).png().toBuffer());
}
const W = 460*2+30, H = 460+40;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>
<text x="10" y="22" font-family="monospace" font-size="15" fill="#111">penny reverse</text>
<text x="${460+20}" y="22" font-family="monospace" font-size="15" fill="#111">quarter obverse</text></svg>`;
await sharp(Buffer.from(svg)).composite(tiles.map((b,i)=>({input:b,left:10+i*(460+10),top:32}))).png()
  .toFile('coloringbook/judge/_look2.png');
console.log('wrote _look2.png');
