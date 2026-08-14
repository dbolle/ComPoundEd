// DIME r0 — pre-flight: LOOK AT THE REFERENCES. Not a measurement; a picture.
import sharp from 'sharp';
const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const F = ['dime-obv.jpg','dime-obv-2.jpg','dime-obv-3.jpg','dime-obv-4.jpg','dime-rev.jpg','dime-rev-2.jpg'];
const tiles = [];
for (const f of F) {
  const md = await sharp(P(f)).metadata();
  console.log(f, md.width + 'x' + md.height, md.format, md.channels);
  const base = await sharp(P(f)).flatten({background:'#303030'}).resize(520,520,{fit:'contain',background:'#202020'}).png().toBuffer();
  const lab = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="520" height="520"><text x="8" y="24" font-family="monospace" font-size="20" fill="#ff0">${f} ${md.width}x${md.height}</text></svg>`);
  tiles.push(await sharp(base).composite([{input:lab}]).png().toBuffer());
}
await sharp({create:{width:520*3,height:520*2,channels:3,background:'#202020'}})
  .composite(tiles.map((input,i)=>({input,left:520*(i%3),top:520*((i/3)|0)}))).png()
  .toFile(new URL('./_jd0-refs.png', import.meta.url).pathname);
console.log('-> _jd0-refs.png');
