// R5 dime throat — render BEFORE and AFTER side by side, both revisions pinned
// by path (never by a mutable "current"), plus a CONTROL the change cannot have
// touched: the dime REVERSE, which the identity partition says is byte-identical.
// Run: node coloringbook/judge/_jt9look.mjs [size]
import sharp from 'sharp';
const here = (p) => new URL(p, import.meta.url).pathname;
const size = Number(process.argv[2] || 380);
const A = await import(here('./_jt9-before-loadable.js'));
const B = await import(here('../../src/art/coins.js'));
const png = async (svg) => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
const cells = [
  ['before obv', await png(A.coinSVG('dime', size, { side: 'obverse' }))],
  ['after  obv', await png(B.coinSVG('dime', size, { side: 'obverse' }))],
  ['control rev (after)', await png(B.coinSVG('dime', size, { side: 'reverse' }))],
];
const W = size * cells.length;
await sharp({ create: { width: W, height: size, channels: 3, background: '#ffffff' } })
  .composite(cells.map((c, i) => ({ input: c[1], left: i * size, top: 0 })))
  .png().toFile(here(`./_jt9look-${size}.png`));
console.log('wrote ' + here(`./_jt9look-${size}.png`) + '  — ' + cells.map((c) => c[0]).join(' | '));
