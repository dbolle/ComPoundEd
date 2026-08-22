// DOES T1 UNDERSTATE THE ART BY DISCARDING COLOUR?
//
// T1 scores registered NCC on blurred gradient ENERGY of a GREYSCALE raster.
// Colour contributes exactly nothing. But the cent is the only copper coin in
// the set, and at 38px colour is the most salient thing a child sees. So T1's
// headline "penny reverse reads as a nickel" may be an artefact of the gate
// rather than a defect of the drawing.
//
// This tests it the cheapest honest way: mean chroma (CIE-ish a*,b* proxy via
// RGB opponent channels) over the disc, for our art and for every reference,
// at the sizes the app draws. If our penny sits with the copper references and
// far from the silver ones, then a child has a cue T1 cannot see.
//
// This is NOT a proposal to add colour to T1 — a colour term would need its own
// control and its own reference-invariance test. It is a check on how much
// weight the existing number deserves.
//
// Run: node coloringbook/judge/_jt3colour.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { coinSVG } from '../../src/art/coins.js';
const DISCS = JSON.parse(readFileSync(new URL('./_jp1discs.json', import.meta.url).pathname,'utf8'));
const REF = new URL('../ref/', import.meta.url).pathname;
const POOL = {
  penny:  ['penny-rev.jpg','penny-rev-2.png','penny-rev-1991d.png'],
  nickel: ['nickel-rev.jpg','nickel-rev-2.png'],
  dime:   ['dime-rev.jpg','dime-rev-2.jpg'],
  quarter:['quarter-rev-2.png','quarter-rev-3.jpg'],
};
// opponent-colour chroma: warm-cool (R-B) and green-magenta (G-(R+B)/2),
// averaged over the disc. Copper is strongly +warm; silver is near zero.
async function chroma(buf, cx, cy, R) {
  const { data, info } = await sharp(buf).flatten({background:'#808080'}).raw().toBuffer({resolveWithObject:true});
  const ch = info.channels; let n=0, warm=0;
  for (let y=0;y<info.height;y++) for (let x=0;x<info.width;x++) {
    if (Math.hypot((x-cx)/R,(y-cy)/R) > 0.9) continue;
    const o=(y*info.width+x)*ch;
    warm += (data[o]-data[o+2]); n++;
  }
  return n ? warm/n : 0;
}
console.log('MEAN WARM CHROMA (R-B) over the disc. Copper is strongly positive; silver ~0.\n');
for (const id of Object.keys(POOL)) {
  const vals=[];
  for (const f of POOL[id]) {
    const m = await sharp(REF+f).metadata(); const d=DISCS[f];
    const cx=d?d.cx:m.width/2, cy=d?d.cy:m.height/2, R=d?d.R:Math.min(m.width,m.height)/2*0.95;
    vals.push(await chroma(readFileSync(REF+f), cx, cy, R));
  }
  const ours=[];
  for (const px of [38,48,54,84]) {
    const png = await sharp(Buffer.from(coinSVG(id, px, {side:'reverse'}))).png().toBuffer();
    const mm = await sharp(png).metadata();
    ours.push(await chroma(png, mm.width/2, mm.height/2, Math.min(mm.width,mm.height)/2));
  }
  console.log(`${id.padEnd(8)} references ${vals.map(v=>v.toFixed(1).padStart(7)).join('')}   |  OURS at 38/48/54/84 ${ours.map(v=>v.toFixed(1).padStart(7)).join('')}`);
}
console.log('\nIf our penny sits with the copper references and far from the silver ones,');
console.log('a child has a cue T1 is structurally unable to see, and T1 understates the art.');
