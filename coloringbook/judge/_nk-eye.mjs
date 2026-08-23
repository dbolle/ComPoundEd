import sharp from 'sharp';
import { coinSVG } from '../../src/art/coins.js';
const png = await sharp(Buffer.from(coinSVG('nickel', 900, { side: 'obverse' }))).png().toBuffer();
const m = await sharp(png).metadata();
await sharp(png).extract({ left: Math.round(m.width*0.14), top: Math.round(m.height*0.20),
  width: Math.round(m.width*0.42), height: Math.round(m.height*0.36) })
  .resize(760, null).png().toFile(new URL('./_nk-eye.png', import.meta.url).pathname);
console.log('eye crop written');
