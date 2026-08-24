// BUCK obverse round — D12 render harness. REPORTS ONLY; writes PNGs to SCRATCH.
// Control first: a face this round cannot have touched (quarter obverse) is
// rendered before anything else, so a broken pipeline is visible immediately.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { ROOT, SCRATCH } from './_paths.mjs';
const { coinSVG } = await import(join(ROOT, 'src/art/coins.js'));
const OUT = process.env.BX_OUT || join(SCRATCH, '_bxout');
mkdirSync(OUT, { recursive: true });
const SIZES = [38, 48, 54, 84];
const Z = 8; // magnification for reading; the SVG is rendered at its OWN size then nearest-upscaled
async function shot(id, side, size, tag) {
  const svg = coinSVG(id, size, { side, decorative: true });
  const m = svg.match(/width="([\d.]+)" height="([\d.]+)"/);
  const w = Math.max(1, Math.round(+m[1])), h = Math.max(1, Math.round(+m[2]));
  const buf = await sharp(Buffer.from(svg), { density: 96 }).resize(w, h).png().toBuffer();
  const big = await sharp(buf).resize(w * Z, h * Z, { kernel: 'nearest' }).png().toBuffer();
  return { buf, big, w, h, tag: `${tag} ${size}px (${w}x${h})` };
}
async function strip(name, items) {
  const H = Math.max(...items.map((i) => i.h)) * Z + 4;
  const W = items.reduce((s, i) => s + i.w * Z + 8, 8);
  let x = 8; const comp = [];
  for (const i of items) { comp.push({ input: i.big, left: x, top: 2 }); x += i.w * Z + 8; }
  await sharp({ create: { width: W, height: H, channels: 3, background: '#888' } })
    .composite(comp).png().toFile(join(OUT, name));
  console.log(' ', name, items.map((i) => i.tag).join(' | '));
}
console.log('CONTROL FIRST — quarter obverse, untouched by this round:');
await strip('bx-control-quarter-obv.png', await Promise.all(SIZES.map((s) => shot('quarter', 'obverse', s, 'q-obv'))));
console.log('SUBJECT — buck obverse:');
await strip('bx-buck-obv.png', await Promise.all(SIZES.map((s) => shot('buck', 'obverse', s, 'buck-obv'))));
console.log('SIBLING (untouched control) — buck reverse:');
await strip('bx-buck-rev.png', await Promise.all(SIZES.map((s) => shot('buck', 'reverse', s, 'buck-rev'))));
for (const [id, side, size, z] of [['buck', 'obverse', 380, 1]]) {
  const svg = coinSVG(id, size, { side, decorative: true });
  const m = svg.match(/width="([\d.]+)" height="([\d.]+)"/);
  await sharp(Buffer.from(svg), { density: 96 }).resize(Math.round(+m[1]) * z, Math.round(+m[2]) * z).png()
    .toFile(join(OUT, `bx-${id}-${side}-${size}.png`));
  console.log(`  bx-${id}-${side}-${size}.png`);
}
console.log('out:', OUT.startsWith(ROOT) ? OUT.slice(ROOT.length + 1) : '<scratch>');
