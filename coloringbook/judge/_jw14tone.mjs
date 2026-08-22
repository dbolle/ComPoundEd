// ROUND 9 (relief/edge), QUARTER OBVERSE — the WIG'S TONE, ours and the coin's,
// through the frozen patch set.
//
// WHY. This round narrows the wig cuts. Narrowing a dark mark removes dark
// AREA, and §14.3 is explicit: "phase 3 runs last, after tone is settled — it
// changes shapes, and a shape change moves the phase-2 patches. Re-run phase 2
// after it and report both numbers." This is that re-run, as a WORKING
// instrument: the judge re-derives.
//
// LOCUS, frozen and not a function of our art: `_tonepatches-quarter.json`,
// frozen by `_qtfreezetone.mjs` before this round, normaliser `cheek`. The
// three wig patches are wigCrown (-4,-22,r3), wigMid (-13,-10,r3) and
// wigBack (-21,2,r3) in the head's local frame.
//
// §4   RESPONSE: run RESP=1 — the wig fill is swapped for the palette's `deep`
//      in a copy of the source and the three wig ratios must fall while `cheek`,
//      `lips` and `chin` stay bit-identical.
// §4.1 no search: the patch centres and radii are literals from the frozen file.
// §6.1 REFERENCE INVARIANCE: the coin's own ratios are computed from the
//      photograph alone and printed; they cannot move when our drawing moves,
//      and the run prints them from a code path our art never enters.
//
// Run: node coloringbook/judge/_jw14tone.mjs [size]
//      RESP=1 node coloringbook/judge/_jw14tone.mjs
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SIZE = Number(process.argv[2] || 190);
const P = JSON.parse(readFileSync('coloringbook/_tonepatches-quarter.json', 'utf8'));
const FITS = JSON.parse(readFileSync('coloringbook/judge/_jw14fitcheck.json', 'utf8'));
const DISC = FITS.disc;

// patch centres are stored disc-normalised (u,v in [-1,1]-ish of the disc
// radius); viewBox = 50 + 47*u, 50 + 47*v.
const toVB = (p) => ({ x: 50 + 47 * p.u, y: 50 + 47 * p.v, r: 47 * p.r, name: p.name });
const PATCH = P.patches.map(toVB);

async function meanOf(sample, p, ppu) {
  // integrate over the disc at ~1/3 device pixel steps so a 190px render and a
  // 750px photograph are integrated the same way in viewBox space
  const step = Math.min(0.25, 0.33 / ppu);
  let s = 0, n = 0;
  for (let dy = -p.r; dy <= p.r; dy += step) {
    for (let dx = -p.r; dx <= p.r; dx += step) {
      if (dx * dx + dy * dy > p.r * p.r) continue;
      const v = sample(p.x + dx, p.y + dy);
      if (v !== null) { s += v; n++; }
    }
  }
  return n ? s / n : NaN;
}
const bil = (data, W, H) => (x, y) => {
  if (x < 0 || y < 0 || x >= W - 1 || y >= H - 1) return null;
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, i = y0 * W + x0;
  return data[i] * (1 - fx) * (1 - fy) + data[i + 1] * fx * (1 - fy)
    + data[i + W] * (1 - fx) * fy + data[i + W + 1] * fx * fy;
};

async function ourSampler(mod, px) {
  const { data, info } = await sharp(Buffer.from(mod.coinSVG('quarter', px, { side: 'obverse' })))
    .png().greyscale().raw().toBuffer({ resolveWithObject: true });
  const ppu = info.width / 100, at = bil(data, info.width, info.height);
  return { sample: (x, y) => at(x * ppu, y * ppu), ppu };
}
async function refSampler(f) {
  const D = DISC[f], upp = D.R / 47;
  const { data, info } = await sharp(`coloringbook/ref/${f}`).greyscale().raw()
    .toBuffer({ resolveWithObject: true });
  const at = bil(data, info.width, info.height);
  return { sample: (x, y) => at(D.cx + (D.R * (x - 50)) / 47, D.cy + (D.R * (y - 50)) / 47), ppu: upp };
}

async function table(label, img) {
  const vals = {};
  for (const p of PATCH) vals[p.name] = await meanOf(img.sample, p, img.ppu);
  const ch = vals.cheek;
  const out = {};
  for (const k of Object.keys(vals)) out[k] = +(vals[k] / ch).toFixed(4);
  console.log(`${label.padEnd(34)} cheek ${ch.toFixed(1).padStart(6)}   `
    + ['wigCrown', 'wigMid', 'wigBack', 'curls', 'queue', 'bow', 'forehead', 'chin']
      .map((k) => `${k} ${out[k].toFixed(3)}`).join('  '));
  return out;
}

const mod = await import('../../src/art/coins.js');
console.log(`### _jw14tone — wig tone at ${SIZE} px, normaliser cheek, locus _tonepatches-quarter.json (frozen)\n`);
console.log('## THE COIN (target side; cannot move when our drawing moves — §6.1)');
for (const f of Object.keys(DISC)) await table(f, await refSampler(f));
console.log('\n## OURS');
await table(`quarter obverse @${SIZE}px`, await ourSampler(mod, SIZE));

if (process.env.RESP) {
  console.log('\n## RESPONSE TEST (§4): wig fill forced to `deep` in a copy of the source.');
  const src = readFileSync('src/art/coins.js', 'utf8');
  const abs = new URL('../../src/engine/money.js', import.meta.url).pathname;
  const patched = src
    .replace("from '../engine/money.js'", `from '${abs}'`)
    .replace('const hairFill = o.hairLit && tier === \'full\' ? p.cloth : p.hair;',
      'const hairFill = p.deep;');
  const dir = mkdtempSync(join(tmpdir(), 'jw14t-'));
  const out = join(dir, 'resp-coins.mjs');
  writeFileSync(out, patched);
  const R = await import(out);
  await table(`RESP wig fill = deep @${SIZE}px`, await ourSampler(R, SIZE));
  console.log('expected: the three wig patches FALL; cheek/lips/chin unchanged.');
}
