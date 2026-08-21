// ROUND 5, cent obverse — the COAT TONE sweep for D3.
//
// The coat is the largest single term in D3 (|D| 0.373 of a 0.1596 mean) and
// `_tonepatches-penny.json` says in as many words that it has never been owned:
// "coat is MEASURED but not targeted — it is drawn by the shared coat(), which
// this pass does not own." `PAL.penny.cloth` is used for exactly one thing on
// this coin (`const cloth = o.bare ? head : p.cloth`; Lincoln has no `hairLit`
// and no `r.plane`), so this sweep moves the coat and nothing else.
//
// It writes NO file under src/. It rewrites `PAL.penny.cloth` in a COPY in the
// scratch tree, scores it with `_pylib.mjs`/`_pytone.mjs`'s own ratio path at
// their published hashes, and prints the whole candidate ladder so the choice
// is made against a table rather than against one number (§4.2).
//
// RESPONSE TEST: the coat ratio must equal the swept colour's own grey ratio to
// `motif`, exactly — a flat-swatch round trip through the same raster (§4/§20.1).
// NULL TEST: n/a, nothing is searched; every candidate is enumerated.
//
// Run: node coloringbook/judge/_jc5coat.mjs
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { grey, DISC, DISCS, REF, ourRaster, ratioVector, loadJSON } from '../_pylib.mjs';

const { patches } = loadJSON(new URL('../_tonepatches-penny.json', import.meta.url).pathname);
const BASE = readFileSync('src/art/coins.js', 'utf8');
// The copies must live at src/art/ depth or coins.js's own
// `import { DENOMS } from '../engine/money.js'` cannot resolve. Named with a
// `_jc5tmp-` prefix and removed at the end; nothing under src/ is left behind.
const dir = 'src/art';
const written = [];
const photo = await grey(REF);
const ref = ratioVector(photo, DISC, patches);
const alt = ratioVector(await grey('coloringbook/ref/penny-obv.jpg'), DISCS['penny-obv.jpg'], patches);

const greyOf = async (hex) => (await sharp({ create: { width: 4, height: 4, channels: 3, background: hex } }).greyscale().raw().toBuffer())[0];
const MOTIF = await greyOf('#96521c');

// The window the choice has to live in, derived BEFORE any score:
//   upper bound — both struck references put the coat BELOW the cheek
//                 (0.769 and 0.609), so grey < motif 99.
//   lower bound — the coat's own contour, both seams, the lapel and the bow tie
//                 are all stroked/filled in `deep` (grey 71). The smallest
//                 fill-against-`deep` separation this file already ships and
//                 D12 has accepted is the HAIR mass: 81 against 71, ten levels.
//                 So grey >= 81.
const CANDS = [
  ['#a75f22', 'SHIPPED — cloth'],
  ['#9c5620', 'a copper one step down'],
  ['#8f4e1c', 'mid of the window'],
  ['#874a1a', ''],
  ['#82471a', ''],
  ['#7b4213', 'the HAIR tone (grey 81 = the floor of the window)'],
  ['#744010', 'BELOW the window — 10-level rule broken, scored to show the cost'],
  ['#6d390e', 'the DEEP tone — same grey as the bow tie and every seam'],
];

console.log('coat window: grey 81..98  (see the derivation in this file)');
console.log('hex        grey  ratio   coat|D|  D3 mean   vs1909   bowtie/seam contrast (grey - deep 71)');
for (const [hex, note] of CANDS) {
  const g = await greyOf(hex);
  const src = `${dir}/_jc5tmp-${hex.slice(1)}.js`;
  const out = BASE.replace(/(penny: \{ rim: '#8d5320'[^}]*cloth: ')#a75f22(')/, `$1${hex}$2`);
  if (out === BASE && hex !== '#a75f22') throw new Error(`the cloth rewrite did not match for ${hex}`);
  writeFileSync(src, out); written.push(src);
  const mod = await import(`${process.cwd()}/${src}`);
  const ours = ratioVector(await ourRaster(mod.coinSVG, DISC, photo.w, photo.h), DISC, patches);
  let s = 0, s9 = 0, n = 0;
  for (const p of patches) {
    if (p.name === 'cheek') continue;
    s += Math.abs(ours.rat[p.name] - ref.rat[p.name]);
    s9 += Math.abs(ours.rat[p.name] - alt.rat[p.name]); n++;
  }
  const cd = Math.abs(ours.rat.coat - ref.rat.coat);
  const rt = ours.rat.coat;
  const want = g / MOTIF;
  console.log(`${hex}  ${String(g).padStart(4)}  ${rt.toFixed(3)}  ${cd.toFixed(3)}    ${(s / n).toFixed(4)}   ${(s9 / n).toFixed(4)}   ${String(g - 71).padStart(3)}   ${Math.abs(rt - want) < 0.004 ? '' : `<< RESPONSE FAIL: raster says ${rt.toFixed(3)}, swatch says ${want.toFixed(3)}`} ${note}`);
}
for (const f of written) rmSync(f);
console.log(`\nreference coat/cheek: penny-obv-3.jpg ${ref.rat.coat.toFixed(3)}  |  penny-obv.jpg (1909-S) ${alt.rat.coat.toFixed(3)}  |  midpoint ${((ref.rat.coat + alt.rat.coat) / 2).toFixed(3)}`);
