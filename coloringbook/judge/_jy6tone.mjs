// ROUND (cent obverse, mid-jaw) — D3 over the frozen 12 patches AND the new
// `jawMid` patch, on a stated revision of the art.
//
// The 11-patch D3 number is computed with the frozen locus and the frozen
// normaliser and is NOT redefined by this round: `jawMid` is reported beside
// it, never folded into it, so the gate D3 is scored against still means what
// it meant before. Both means are printed.
//
// The patch set is read from two files: `_tonepatches-penny.json` (frozen,
// hashed, untouched) and `judge/_jy0tonepatch-midjaw.json` (this round's
// additive patch, written and hashed BEFORE this file existed).
//
// RESPONSE TEST (§4, and penny-gates.md's D3 row): `--flat` pushes a flat
// swatch of every cent palette colour through the same raster path and prints
// the grey that comes back, so a tone pipeline that is reading the wrong number
// of channels shows up as a wrong palette grey (§20.1).
//
// Run: node coloringbook/judge/_jy6tone.mjs [srcPath] [tag] [--flat]
import sharp from 'sharp';
import { grey, DISC, DISCS, REF, ourRaster, ratioVector, loadJSON } from '../_pylib.mjs';

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const SRC = args[0] || '../../src/art/coins.js';
const TAG = args[1] || 'base';
const FROZEN = loadJSON(new URL('../_tonepatches-penny.json', import.meta.url).pathname).patches;
const EXTRA = loadJSON(new URL('./_jy0tonepatch-midjaw.json', import.meta.url).pathname).patches;
const ALL = [...FROZEN, ...EXTRA];
const mod = await import(SRC.startsWith('.') ? SRC : `file://${SRC}`);

if (process.argv.includes('--flat')) {
  const P = mod.PALETTE ? mod.PALETTE.penny : null;
  console.log('RESPONSE / §20.1 flat-swatch check — a flat patch of a palette colour must come back as that colour\'s own grey');
  for (const [k, v] of Object.entries(P || {})) {
    if (typeof v !== 'string' || !v.startsWith('#')) continue;
    const b = await sharp({ create: { width: 32, height: 32, channels: 3, background: v } }).greyscale().raw().toBuffer();
    console.log(`  ${k.padEnd(10)} ${v}  ->  grey ${b[0]}`);
  }
}

const photo = await grey(REF);
const ref = ratioVector(photo, DISC, ALL);
const g1909 = await grey('coloringbook/ref/penny-obv.jpg');
const r1909 = ratioVector(g1909, DISCS['penny-obv.jpg'], ALL);
const our = await ourRaster(mod.coinSVG, DISC, photo.w, photo.h);
const ours = ratioVector(our, DISC, ALL);

console.log(`\nD3 patch vector — ${TAG}  (reference of record penny-obv-3.jpg; second struck reference penny-obv.jpg)`);
console.log('patch          ref-3   1909    ours    |D| vs ref-3');
let s11 = 0, n11 = 0, s12 = 0, n12 = 0, worst = 0, worstN = '';
for (const p of ALL) {
  if (p.name === 'cheek') continue;
  const d = Math.abs(ours.rat[p.name] - ref.rat[p.name]);
  if (p.name !== 'jawMid') { s11 += d; n11++; if (d > worst) { worst = d; worstN = p.name; } }
  s12 += d; n12++;
  console.log(`${p.name.padEnd(13)} ${ref.rat[p.name].toFixed(3)}  ${r1909.rat[p.name].toFixed(3)}  ${ours.rat[p.name].toFixed(3)}  ${d.toFixed(4)}${p.name === 'jawMid' ? '   <- NEW, reported beside the gate and NOT folded into it' : ''}`);
}
console.log(`\nD3 (frozen locus, ${n11} non-cheek patches, the gate of record) mean |D| = ${(s11 / n11).toFixed(4)}   worst ${worst.toFixed(4)} (${worstN})`);
console.log(`D3+jawMid (${n12} patches, reported only)              mean |D| = ${(s12 / n12).toFixed(4)}`);
const j = ALL.find((p) => p.name === 'jawMid');
console.log(`\njawMid  local (${j.local.x}, ${j.local.y}) r ${j.local.r}   coin ${ref.rat.jawMid.toFixed(4)}   1909 ${r1909.rat.jawMid.toFixed(4)}   ours ${ours.rat.jawMid.toFixed(4)}   |D| ${Math.abs(ours.rat.jawMid - ref.rat.jawMid).toFixed(4)}`);
console.log(`        (a ratio near ${ref.rat.jawMid.toFixed(2)} is "as dark as the coin's whisker field"; near 1.00 is "bare cheek")`);
