// R4 dime jaw — draw the frozen tone patches on the photograph and look.
//
// The repair is being shaped by ONE frozen patch: `chin`, whose median flips
// 202 -> 149 on a 17 % overlap because its brightest level held only 54.3 % of
// it. Before trading away a measured width to protect that patch, §4.3 says
// draw the located feature on the source and look at it: is the `chin` patch on
// the ball of the chin, or is it straddling the jaw boundary — in which case a
// patch that is half lit chin and half shadow is bimodal BY CONSTRUCTION and
// its median is a coin toss.
//
// This EDITS NOTHING. _tonepatches.json is a frozen target; §1.1 says
// demonstrate and report, never fix.
//
// Run: node coloringbook/judge/_jw4patch.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { busted, discFor, makeMap } from './_jw4reg.mjs';
import { marks } from './_jqgeom.mjs';

const REF = 'dime-obv-2.jpg';
const { patches } = JSON.parse(readFileSync(new URL('../_tonepatches.json', import.meta.url)));
const B = await busted();
const disc = discFor(REF);
const M = makeMap(B, disc);
const src = new URL('../ref/' + REF, import.meta.url).pathname;
const md = await sharp(src).metadata();
let g = '';
for (const p of patches) {
  const c = M.toPx(p.local.x, p.local.y);
  const r = p.local.r * M.pxPerUnit;
  const col = p.name === 'chin' ? '#ff2200' : (p.name === 'cheek' ? '#00ffff' : '#ffee00');
  g += `<circle cx="${c.px.toFixed(1)}" cy="${c.py.toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="${col}" stroke-width="2.5"/>`;
}
const jawD = B.svg.match(/<path d="(M 19\.4 [\d.]+ C [^"]*Z)" stroke="none"\/>/)?.[1]
  || B.svg.match(/<path d="(M 19\.4 21\.4[^"]*)"/)?.[1];
const jp = marks(`<svg><path d="${jawD}"/></svg>`)[0].pts.map((q) => M.toPx(q.x, q.y));
g += `<polyline points="${jp.map((q) => `${q.px.toFixed(1)},${q.py.toFixed(1)}`).join(' ')}" fill="none" stroke="#ff00cc" stroke-width="3"/>`;
const ov = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${md.width}" height="${md.height}">${g}</svg>`)).png().toBuffer();
const merged = await sharp(src).composite([{ input: ov, left: 0, top: 0 }]).png().toBuffer();
const cs = [[-6, 6], [26, 6], [-6, 30], [26, 30]].map(([x, y]) => M.toPx(x, y));
const L = Math.floor(Math.min(...cs.map((c) => c.px))), T = Math.floor(Math.min(...cs.map((c) => c.py)));
const w = Math.ceil(Math.max(...cs.map((c) => c.px))) - L, h = Math.ceil(Math.max(...cs.map((c) => c.py))) - T;
const out = new URL('./_jw4patch-chin.png', import.meta.url).pathname;
await sharp(merged).extract({ left: L, top: T, width: w, height: h })
  .resize({ width: w * 3, height: h * 3, kernel: 'nearest' }).png().toFile(out);
console.log(`red = the frozen 'chin' patch, cyan = 'cheek' (the normaliser), yellow = the others,`);
console.log(`magenta = the jaw mark as it stands in src/art/coins.js`);
console.log('-> ' + out);
const chin = patches.find((p) => p.name === 'chin');
console.log(`chin patch: local (${chin.local.x}, ${chin.local.y}) r ${chin.local.r} -> local y spans `
  + `${(chin.local.y - chin.local.r).toFixed(1)} .. ${(chin.local.y + chin.local.r).toFixed(1)}`);
