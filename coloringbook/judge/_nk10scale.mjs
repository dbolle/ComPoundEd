// IS T1 COMPARING OUR ART AND THE PHOTOGRAPHS AT THE SAME SCALE?
//
// `_jt1transfer.mjs:featOfOurs` normalises our render with a HARD-CODED disc,
// `{ cx: 450, cy: 450, R: 450 * 0.94 }`, while `featOfRef` uses `discOf(file)`,
// which FITS the disc to the photograph. If the rendered coin actually fills
// the 900 px square — which it does, because featOfOurs resizes with
// `fit: 'contain'` and sharp enlarges by default — then the true radius is 450
// and the assumed one is 423, a 6.4 % scale error in ONE of the two operands.
// `bestReg` searches rotation and translation only; nothing recovers scale.
//
// THIS FILE DOES NOT ASSERT THAT. It measures it, on both operands, the same
// way: find the radius at which the RIM's energy peaks, in units of the disc
// each pipeline assumes. On a struck coin the rim is the strongest circular
// edge there is; if the two pipelines agree, both peaks land at the same u.
//
// It changes nothing. COIN-JUDGE.md §1.1: a specialist reports an instrument
// fault and never edits the instrument.
//
// Run: node coloringbook/judge/_nk10scale.mjs
import sharp from 'sharp';
import { coinSVG } from '../../src/art/coins.js';
import { discOf } from './_jq42indep.mjs';
import { POOL_BY_SIDE } from './_jt1transfer.mjs';

const { energy } = await import('../_qtedge.mjs');
const REF = new URL('../ref/', import.meta.url).pathname;

// radial energy profile in units of the ASSUMED disc radius, 0..1.15
async function profile(file, disc) {
  const { G, W, H } = await energy(file, disc);
  const B = 46, acc = new Float64Array(B), cnt = new Float64Array(B);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const u = (x - disc.cx) / disc.R, v = (y - disc.cy) / disc.R;
    const r = Math.hypot(u, v); if (r >= 1.15) continue;
    const k = Math.floor(r / 1.15 * B); acc[k] += G[y * W + x]; cnt[k]++;
  }
  const out = []; for (let k = 0; k < B; k++) out.push(cnt[k] ? acc[k] / cnt[k] : 0);
  return out;
}
const peakU = (p) => {
  // the rim is the outermost strong ring: search from 0.70 out
  let bi = -1, bv = -1;
  for (let k = 0; k < p.length; k++) { const u = (k + 0.5) / p.length * 1.15; if (u < 0.70) continue; if (p[k] > bv) { bv = p[k]; bi = k; } }
  return (bi + 0.5) / p.length * 1.15;
};

console.log('rim-energy peak, in units of the disc radius each pipeline assumes');
console.log('(a coin\'s rim is at u = 1.00 by definition of "the disc")\n');

for (const f of POOL_BY_SIDE.obverse.nickel) {
  const d = await discOf(f);
  console.log(`  REF  ${f.padEnd(20)} peak u = ${peakU(await profile(f, d)).toFixed(3)}   (R fitted ${d.R})`);
}

// our art, through featOfOurs' own pipeline
const mkdir = (await import('node:fs')).mkdirSync, wf = (await import('node:fs')).writeFileSync;
mkdir(new URL('../ref/_scratch/', import.meta.url).pathname, { recursive: true });
for (const id of ['nickel', 'quarter', 'dime']) {
  const png = await sharp(Buffer.from(coinSVG(id, 84, { side: 'obverse' })))
    .resize(84, 84, { fit: 'contain', background: '#ffffff' })
    .resize(900, 900, { kernel: 'nearest' }).flatten({ background: '#ffffff' }).png().toBuffer();
  const name = `_scratch/_nk10-${id}.png`;
  wf(new URL('../ref/' + name, import.meta.url).pathname, png);
  const assumed = { cx: 450, cy: 450, R: 450 * 0.94 };
  const fitted = await discOf(name);
  console.log(`  OURS ${id.padEnd(20)} peak u = ${peakU(await profile(name, assumed)).toFixed(3)}`
    + `   (R assumed ${assumed.R}, R fitted ${fitted.R})`);
  (await import('node:fs')).unlinkSync(new URL('../ref/' + name, import.meta.url).pathname);
}
console.log('\nIf the OURS peaks sit above 1.00 while the REF peaks sit at 1.00, the two');
console.log('operands are not the same size and the mismatch is the ratio of the two.');
