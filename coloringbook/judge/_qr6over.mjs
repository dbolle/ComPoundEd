// QUARTER REVERSE, review sweep — OVERLAY our live outline on a photograph at
// a matched disc (COIN-JUDGE §4.3, the obligation that caught seven wrong
// features every response test had passed).
//
// Reports only; writes PNGs to the gitignored scratch dir.
//
// SELF-CHECK, printed every run. `_nk3over.mjs` drew our device 6% small for
// its whole life and flattered every placement it showed. This one prints the
// diameter of OUR rendered blank and of the photograph's fitted rim in the
// SAME output pixels; if those two numbers are not equal the overlay is void
// and the run says so.
//
// Run: node coloringbook/judge/_qr6over.mjs [file] [outname]
import sharp from 'sharp';
import { join } from 'node:path';
import { readFileSync, mkdirSync } from 'node:fs';
import { REF, JUDGE, SCRATCH } from './_paths.mjs';
import { coinSVG } from '../../src/art/coins.js';

const D = JSON.parse(readFileSync(join(JUDGE, '_jq4discs.json'), 'utf8'));
const NPX = 1200;                       // output raster, 12 px per viewBox unit
const K = NPX / 100;

async function photoGrid(file, disc) {
  const half = (50 / 47) * disc.R;
  const meta = await sharp(join(REF, file)).metadata();
  const padL = Math.max(0, Math.ceil(half - disc.cx)), padT = Math.max(0, Math.ceil(half - disc.cy));
  const padR = Math.max(0, Math.ceil(disc.cx + half - meta.width));
  const padB = Math.max(0, Math.ceil(disc.cy + half - meta.height));
  const padded = await sharp(join(REF, file)).flatten({ background: '#ffffff' })
    .extend({ left: padL, top: padT, right: padR, bottom: padB, background: '#808080' })
    .png().toBuffer();
  return sharp(padded)
    .extract({ left: Math.round(disc.cx - half) + padL, top: Math.round(disc.cy - half) + padT,
      width: Math.round(2 * half), height: Math.round(2 * half) })
    .resize(NPX, NPX, { fit: 'fill' }).greyscale().normalise().png().toBuffer();
}

/** our live art as a raw greyscale on the same grid */
async function oursRaw(svgText) {
  const svg = (svgText ?? coinSVG('quarter', 380, { side: 'reverse' }))
    .replace(/^(<svg[^>]*?)width="[\d.]+" height="[\d.]+"/, `$1width="${NPX}" height="${NPX}"`);
  const { data, info } = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
}

const file = process.argv[2] || 'quarter-rev-2.png';
const name = process.argv[3] || 'qr6';
const disc = D[file];
if (!disc) throw new Error(`no frozen disc for ${file} in _jq4discs.json`);
mkdirSync(SCRATCH, { recursive: true });

const ours = await oursRaw();
// SELF-CHECK: measure our own blank's diameter in output pixels by scanning the
// centre row for the outermost pixel that is not page white.
let l = 0, r = ours.w - 1;
const row = Math.round(ours.h / 2);
while (l < ours.w && ours.d[row * ours.w + l] > 250) l++;
while (r > 0 && ours.d[row * ours.w + r] > 250) r--;
const oursDia = r - l + 1;
// The blank's PATH is r 47 by construction, but it is stroked `sw(2.6,1.0)`
// = 2.6 units centred on that path, so the outermost non-white pixel is at
// r 48.3, not 47. The first version of this check compared against 47 and
// declared every overlay VOID at +2.84% — which is exactly half the stroke.
// Recorded because the opposite mistake is the one `_nk3over.mjs` made for
// its whole life: a self-check has to know what it is measuring.
const oursExpected = 2 * ((47 + 2.6 / 2) / 50) * (NPX / 2);
console.log(`SELF-CHECK  our blank outer edge ${oursDia}px   expected (r 47 + half of a 2.6 stroke) ` +
  `${oursExpected.toFixed(1)}px   delta ${(((oursDia - oursExpected) / oursExpected) * 100).toFixed(2)}%` +
  (Math.abs(oursDia - oursExpected) / oursExpected > 0.005 ? '   *** OVERLAY VOID ***' : '   ok'));

// our motif as a mask: anything darker than the field tone
const MASK_T = 170;
const mask = new Uint8Array(ours.w * ours.h);
for (let i = 0; i < mask.length; i++) mask[i] = ours.d[i] < MASK_T ? 1 : 0;
// boundary = a mask pixel with a non-mask 4-neighbour
const edge = new Uint8Array(mask.length);
for (let y = 1; y < ours.h - 1; y++) for (let x = 1; x < ours.w - 1; x++) {
  const p = y * ours.w + x;
  if (mask[p] && !(mask[p - 1] && mask[p + 1] && mask[p - ours.w] && mask[p + ours.w])) edge[p] = 1;
}

const base = await photoGrid(file, disc);
const { data: bg } = await sharp(base).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const out = Buffer.alloc(ours.w * ours.h * 3);
for (let i = 0; i < mask.length; i++) {
  const v = bg[i * 4];
  if (edge[i]) { out[i * 3] = 255; out[i * 3 + 1] = 30; out[i * 3 + 2] = 30; }
  else { out[i * 3] = v; out[i * 3 + 1] = v; out[i * 3 + 2] = v; }
}
const p = join(SCRATCH, `${name}-${file.replace(/[.-]/g, '_')}.png`);
await sharp(out, { raw: { width: ours.w, height: ours.h, channels: 3 } }).png().toFile(p);
console.log('wrote (scratch):', p.split('/').pop());
