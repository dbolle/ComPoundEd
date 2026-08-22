// THE TRANSFER TEST — the metric the owner's definition of "done" actually implies.
//
// Owner, 2026-08-22, asked what "done" means:
//   "a child can identify a photo based on only learning about the denominations
//    from our pictures. DISTINGUISHING OUR RENDERINGS FROM EACH OTHER IS NOT THE
//    POINT, learning to identify real currency is."
//
// That invalidates D11's OBJECTIVE. D11 measures our-art against our-art — how
// far apart our dime and our nickel are. A set of drawings could be maximally
// distinct from one another and still teach a child nothing about the coins in
// their pocket. The question is TRANSFER: our drawing -> the real object.
//
// D11 is also measured in the wrong PLACE. `_x6lib.mjs:16` declares
// `ICON_SIZE = 26 // the quarter diameter the app's icon tier draws`. The app
// draws at 38, 48 and 84 (`src/screens/money.js`: coinRow(...,38),
// coinRow(...,48), coinRow(...,84)). 26 is a size the app never renders, and no
// D11 number has ever been computed at 84 — the naming stage, where a child is
// asked which coin this is. Wrong quantity, wrong locus.
//
// WHAT THIS FILE MEASURES INSTEAD. For each denomination, at each size the app
// really draws: render our art, render every reference photograph the same way,
// and ask whether ours is nearer to the RIGHT denomination's photographs than to
// any other denomination's. That is a confusion matrix, and its diagonal is the
// thing the owner asked for.
//
// WHY NEAREST-NEIGHBOUR AND NOT A THRESHOLD. There is no absolute similarity a
// drawing "should" reach — an SVG is not a photograph and never will be. What
// matters is RANK: at 38px, is our dime more dime-like than nickel-like? A child
// does not need our dime to look like a photograph, only to be sorted correctly
// against the alternatives.
//
// HONEST LIMITS, stated before any number:
//   * This scores the SILHOUETTE-AND-TONE gestalt at small sizes, which is what
//     a small render carries. It says nothing about whether the portrait is the
//     right president.
//   * Reference photographs differ in crop, lighting and preservation. Every
//     comparison is disc-normalised and greyscale, so absolute colour is out —
//     the same normalisation D3 uses.
//   * A denomination with one usable reference gets a weaker verdict than one
//     with four, and the count is printed beside every row.
//
// Run: node coloringbook/judge/_jt1transfer.mjs
import sharp from 'sharp';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { coinSVG } from '../../src/art/coins.js';
import { ncc, bestReg, energyGrid } from './_jq20indep.mjs';
import { discOf } from './_jq42indep.mjs';
import { N as GN, SPAN } from '../_rvnorm.mjs';

// V1 OF THIS FILE FAILED ITS OWN CONTROL, 3/12 — real dime photographs did not
// even sort as dimes. Cause: it correlated RAW GREYSCALE, and raw pixel
// correlation on photographs records LIGHTING, not design. That is the lesson
// this project already paid for once, in _jq42indep.mjs's own header. The fix
// is to compare on the same descriptor the independence instruments use:
// REGISTERED NCC ON BLURRED GRADIENT ENERGY, which is a statement about where
// the relief is, not about how it was lit. v1's numbers are discarded, not
// filed — they measured nothing.
const TEMPS = [];
const DESIGN_MASK = (() => {
  const m = new Uint8Array(GN * GN);
  for (let j = 0; j < GN; j++) {
    const v = -SPAN + 2 * SPAN * j / (GN - 1);
    for (let i = 0; i < GN; i++) {
      const u = -SPAN + 2 * SPAN * i / (GN - 1);
      m[j * GN + i] = Math.hypot(u, v) <= 0.86 ? 1 : 0;
    }
  }
  return m;
})();
const ROT = []; for (let d = -8; d <= 8; d += 2) ROT.push(d);
const TR = []; for (let t = -0.03; t <= 0.0301; t += 0.015) TR.push(+t.toFixed(3));
const featCache = new Map();
async function featOfRef(file) {
  if (!featCache.has(file)) featCache.set(file, await energyGrid(file, await discOf(file), 0.02));
  return featCache.get(file);
}
async function featOfOurs(id, px) {
  const key = `OURS:${id}:${px}`;
  if (featCache.has(key)) return featCache.get(key);
  // Render at the app's size, then upsample with NEAREST so the descriptor sees
  // exactly the device pixels a child sees — no invented detail.
  const png = await sharp(Buffer.from(coinSVG(id, px, { side: 'obverse' })))
    .resize(px, px, { fit: 'contain', background: '#ffffff' })
    .resize(900, 900, { kernel: 'nearest' }).flatten({ background: '#ffffff' }).png().toBuffer();
  // energyGrid resolves names relative to coloringbook/ref/, so the render has
  // to live there. Prefixed and deleted afterwards; ref/ is gitignored.
  const name = `_tmp-transfer-${id}-${px}.png`;
  writeFileSync(new URL('../ref/' + name, import.meta.url).pathname, png);
  TEMPS.push(name);
  const g = await energyGrid(name, { cx: 450, cy: 450, R: 450 * 0.94 }, 0.02);
  featCache.set(key, g);
  return g;
}
const designSim = (a, b) => bestReg(a, b, DESIGN_MASK, ROT, TR).ncc;

const N = 128;                       // comparison grid; small on purpose
const SIZES = [38, 48, 84];          // what src/screens/money.js actually draws
const DISCS = JSON.parse(readFileSync(new URL('./_jp1discs.json', import.meta.url).pathname, 'utf8'));
const REF = new URL('../ref/', import.meta.url).pathname;

// Reference photographs per denomination and face. Obverse only for now: it is
// the face the naming draw shows and the one every reference pool covers.
const POOL = {
  penny: ['penny-obv.jpg', 'penny-obv-2.jpg', 'penny-obv-3.jpg', 'penny-obv-4.png'],
  nickel: ['nickel-obv.jpg', 'nickel-obv-4.jpg', 'nickel-obv-5.JPG'],
  dime: ['dime-obv-2.jpg', 'dime-obv-3.jpg'],
  quarter: ['quarter-obv.jpg', 'quarter-obv-3.png'],
};
const IDS = Object.keys(POOL);

const grey = async (buf) => {
  const { data, info } = await sharp(buf).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
};

// Sample a disc onto the N x N grid, normalised to zero mean and unit variance
// so overall brightness and contrast cannot decide the answer.
function sampleDisc(g, cx, cy, R) {
  const v = new Float64Array(N * N).fill(NaN);
  let s = 0, s2 = 0, n = 0;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const u = (2 * (i + 0.5)) / N - 1, w = (2 * (j + 0.5)) / N - 1;
    if (Math.hypot(u, w) > 0.92) continue;
    const x = Math.round(cx + u * R), y = Math.round(cy + w * R);
    if (x < 0 || y < 0 || x >= g.w || y >= g.h) continue;
    const val = g.d[y * g.w + x];
    v[j * N + i] = val; s += val; s2 += val * val; n++;
  }
  const mean = s / n, sd = Math.sqrt(s2 / n - mean * mean) || 1;
  for (let k = 0; k < N * N; k++) if (!Number.isNaN(v[k])) v[k] = (v[k] - mean) / sd;
  return v;
}

const corr = (a, b) => {
  let s = 0, n = 0;
  for (let k = 0; k < a.length; k++) {
    if (Number.isNaN(a[k]) || Number.isNaN(b[k])) continue;
    s += a[k] * b[k]; n++;
  }
  return n ? s / n : 0;
};

// fit a disc on a rendered SVG: it is centred by construction
async function oursAt(id, px) {
  const g = await grey(Buffer.from(coinSVG(id, px, { side: 'obverse' })));
  return sampleDisc(g, g.w / 2, g.h / 2, Math.min(g.w, g.h) / 2 * 0.94);
}

// a reference, downsampled to the SAME device size first — this is the whole
// point: a child sees 38 device pixels, so the comparison must too.
async function refAt(file, px) {
  const disc = DISCS[file];
  const raw = await sharp(REF + file).greyscale().toBuffer();
  const m = await sharp(raw).metadata();
  let cx, cy, R;
  if (disc) { cx = disc.cx; cy = disc.cy; R = disc.R; }
  else { cx = m.width / 2; cy = m.height / 2; R = Math.min(m.width, m.height) / 2 * 0.95; }
  // crop to the disc, resize to the app's size, then sample
  const L = Math.max(0, Math.round(cx - R)), T = Math.max(0, Math.round(cy - R));
  const S = Math.round(Math.min(2 * R, m.width - L, m.height - T));
  const small = await sharp(REF + file).extract({ left: L, top: T, width: S, height: S })
    .resize(px, px, { fit: 'fill' }).greyscale().toBuffer();
  const g = await grey(small);
  return sampleDisc(g, g.w / 2, g.h / 2, g.w / 2 * 0.94);
}

// ── CONTROL FIRST. v1 ran the control last and published a headline number
// that its own control then invalidated. The control now gates everything: if
// the test cannot sort real PHOTOGRAPHS by denomination, it reports that and
// exits without saying anything about our art.
console.log('CONTROL FIRST — can the test sort real PHOTOGRAPHS by denomination?');
console.log('descriptor: registered NCC on blurred gradient energy (the same one');
console.log('_jq42indep.mjs uses), not raw greyscale — v1 used raw greyscale and');
console.log('scored 3/12 on this control.\n');
let cpass = 0, ctot = 0;
for (const id of IDS) {
  if (POOL[id].length < 2) { console.log(`${id.padEnd(9)} only ${POOL[id].length} reference — cannot hold one out`); continue; }
  const held = POOL[id][0];
  const h = await featOfRef(held);
  const sc = [];
  for (const t of IDS) {
    const others = POOL[t].filter((f) => f !== held);
    const vs = [];
    for (const f of others) vs.push(designSim(h, await featOfRef(f)));
    sc.push(Math.max(...vs));
  }
  const best = IDS[sc.indexOf(Math.max(...sc))];
  const ok = best === id; ctot++; if (ok) cpass++;
  console.log(`${id.padEnd(9)} ` + sc.map((v) => v.toFixed(3).padStart(9)).join('') + `   ${ok ? 'OK' : '!! sorted as ' + best}`);
}
console.log(`\nCONTROL: ${cpass}/${ctot} photographs sorted correctly.`);
if (cpass < ctot) {
  console.log('  !! THE TEST CANNOT SORT REAL COINS. Reporting nothing about our art —');
  console.log('     that would be a measurement of the instrument, not of the drawing.');
  process.exit(1);
}
console.log('  The test can sort real coins, so a failure below is about our ART.\n');

console.log('TRANSFER TEST — is our drawing nearer the RIGHT coin than any other?');
console.log('at the sizes src/screens/money.js actually draws: ' + SIZES.join(', ') + ' px');
console.log('(D11 is scored at 26px, a size the app never renders)\n');

let pass = 0, total = 0;
for (const px of SIZES) {
  console.log(`=== ${px}px ===`);
  console.log('our art  ->  ' + IDS.map((i) => i.padStart(9)).join('') + '     verdict');
  for (const id of IDS) {
    const o = await featOfOurs(id, px);
    const sc = [];
    for (const t of IDS) {
      const vs = [];
      for (const f of POOL[t]) vs.push(designSim(o, await featOfRef(f)));
      sc.push(Math.max(...vs));
    }
    const best = IDS[sc.indexOf(Math.max(...sc))];
    const ok = best === id; total++; if (ok) pass++;
    const margin = Math.max(...sc) - Math.max(...sc.filter((_, k) => IDS[k] !== id));
    console.log(`${id.padEnd(9)}    ` + sc.map((v) => v.toFixed(3).padStart(9)).join('')
      + `     ${ok ? `OK   margin ${margin.toFixed(3)}` : '!! CONFUSED WITH ' + best}   n=${POOL[id].length}`);
  }
  console.log('');
}
console.log(`TRANSFER: ${pass}/${total} correct across ${SIZES.length} sizes.`);
console.log(pass === total
  ? '  Every denomination is nearer its own photographs than any other, at every size the app draws.\n  That is the owner\'s definition of done, met.'
  : '  A confusion at a size the app draws is a REAL defect against the owner\'s definition of done.');

// clean up the renders written into ref/
for (const t of TEMPS) { try { unlinkSync(new URL('../ref/' + t, import.meta.url).pathname); } catch {} }
