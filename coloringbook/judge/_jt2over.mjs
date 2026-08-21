// SPECIALIST INSTRUMENT — round 2, D13, dime reverse. §4.3 OVERLAY:
// OUR DRAWING ON TOP OF THE PHOTOGRAPH, in the photograph's own frame.
//
// `_jl1grid.mjs` (round 1, hashed, NOT edited) already resamples a reference
// into the 100-unit viewBox the art is authored in, using the judge's own
// frozen disc fit. This calls that exported `grid()` and then composites our
// reverse motif over the result at the SAME scale, so "our olive branch stops
// 3 units short of the coin's" is a thing you can see rather than a claim.
//
// Nothing here measures anything. It is a picture, and it exists because §4.3
// says a located feature is drawn on the source and looked at. The numbers all
// come from `_jt2ink.mjs` / `_x6dark.mjs` / `_jd10d13.mjs`.
//
// §4.1 NULL: no search, no bounds. Its failure mode is a bad disc fit, which
//   `_jl1grid.mjs` already exposes as the red r=47 ring leaving the coin edge.
// §4 RESPONSE: the overlay is our own SVG. Pass two different revisions via SRC
//   and the drawn outline must differ; that is the response test and it is the
//   whole point of the tool.
//
//   node coloringbook/judge/_jt2over.mjs <tier-size> <SRC> <tag>
import sharp from 'sharp';
import { grid } from './_jl1grid.mjs';

const size = +(process.argv[2] || 84);
const SRC = process.argv[3] || '../../src/art/coins.js';
const TAG = process.argv[4] || 'now';
const REF = 'dime-rev-2.jpg';
const S = 1400;
const HERE = (f) => new URL('./' + f, import.meta.url).pathname;

const mod = await import(SRC);
const base = HERE(await grid(REF, `_jt2over-base.png`, S));

// Our art, re-rendered at S px with the coin blank and the field made
// transparent so only the DEVICE lands on the photograph. The blank, the two
// field circles and the specular arc are furniture, not the motif.
let svg = mod.coinSVG('dime', size, { side: 'reverse' });
svg = svg.replace(/width="[\d.]+" height="[\d.]+"/, `width="${S}" height="${S}"`)
  .replace(/<path d="M 97 50[\s\S]*?\/>/, '')                       // the reeded blank
  .replace(/<circle cx="50" cy="50" r="[\d.]+" fill="#[0-9a-f]{6}"\/>/, '')  // the field disc
  .replace(/<circle cx="50" cy="50" r="[\d.]+" fill="none"[^>]*\/>/, '')     // the field ring
  .replace(/<path d="M [\d.]+ [\d.]+ A 43\.4[\s\S]*?\/>/, '');       // the specular arc
const ours = await sharp(Buffer.from(svg), { density: 300 }).resize(S, S, { fit: 'fill' }).png().toBuffer();

const out = HERE(`_jt2over-${TAG}-${size}.png`);
await sharp(base).composite([{ input: ours, blend: 'over' }]).png().toFile(out);
console.log(`overlay: ours (${TAG}, tier size ${size}) drawn over ${REF} in viewBox coordinates`);
console.log('wrote ' + out);
