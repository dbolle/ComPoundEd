// IS T1'S PREFERENCE ABOUT THE SIGN, OR ABOUT THE MAGNITUDE?
//
// Flipping `hairFill` moves T1. On the dime it moves it a LOT (obverse margin
// 0.302 -> 0.349 at 38 px). Before that is read as "the sign is wrong", it has
// to be read against what T1 is made of: `energyGrid` is a BLURRED GRADIENT
// MAGNITUDE. |grad| has no sign. A boundary that is 25 luma units dark-on-light
// and one that is 25 units light-on-dark are the same number to it.
//
// So the two branches do not differ to T1 by their DIRECTION. They differ by
// how big a step each leaves at the hair/face boundary once the grooves, the
// lit ridges and the eye have been drawn over the mass — and `_jz1hairtone.mjs`
// measures those as wildly unequal: on the dime, LIT leaves 3.6-6.7 luma and
// DARK leaves 21.3-28.1.
//
// THE TEST. Score the same drawing with the hair repainted in five tones, two
// of which `hairLit` cannot reach. If T1 tracks |dL| regardless of which side
// of the face tone it falls on, then T1 is asking for CONTRAST, not for a sign,
// and flipping the flag is the wrong way to give it one.
//
// VALIDATION FIRST, AND IT GATES. This file re-implements `featOfOurs` because
// it has to reach a fill `coinSVG` will not emit — and a re-implementation of a
// gate is exactly the kind of second instrument this project has been burned by
// (six tools produced confident wrong numbers in one night). So it first scores
// the SHIPPED tone and the FLIPPED tone through its own pipeline and checks them
// against the numbers `_jt1transfer.mjs` itself printed. If they do not agree to
// three decimals it reports the disagreement and says nothing else.
//
// ⚠️ Writes its renders to `ref/_scratch/_jz7-*.png` and deletes them, NOT to
// T1's `ref/_scratch/<side>-<id>-<px>.png`: those are keyed by side/id/size and
// a collision would have each run measuring the other's drawing.
//
// Run: node coloringbook/judge/_jz7mag.mjs
import sharp from 'sharp';
import { mkdirSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { REF } from './_paths.mjs';
import { coinSVG, OBVERSE } from '../../src/art/coins.js';
import { luma, recolourHair, tonesOf, headOnlySVG, massOnlySVG } from './_jzlib.mjs';
import { energyGrid } from './_jq20indep-v2.mjs';
import { discOf } from './_jq42indep.mjs';
import { featOfRef, designSim, POOL_BY_SIDE } from './_jt1transfer.mjs';

const SIZES = [38, 48, 54, 84];
const IDS = ['penny', 'nickel', 'dime', 'quarter'];
const POOL = POOL_BY_SIDE.obverse;

mkdirSync(join(REF, '_scratch'), { recursive: true });

// featOfOurs, byte-for-byte the same pipeline as `_jt1transfer.mjs:120-146`,
// with the SVG string interposed so the hair can be repainted.
const tmp = [];
async function featOf(svg, tag, px) {
  const png = await sharp(Buffer.from(svg))
    .resize(px, px, { fit: 'contain', background: '#ffffff' })
    .resize(900, 900, { kernel: 'nearest' }).flatten({ background: '#ffffff' }).png().toBuffer();
  const name = `_scratch/_jz7-${tag}.png`;
  writeFileSync(join(REF, name), png);
  tmp.push(join(REF, name));
  return energyGrid(name, await discOf(name), 0.02);
}
async function score(id, px, svg, tag) {
  const o = await featOf(svg, tag, px);
  const sc = [];
  for (const t of IDS) {
    const vs = [];
    for (const f of POOL[t]) vs.push(designSim(o, await featOfRef(f)));
    sc.push(Math.max(...vs));
  }
  const own = sc[IDS.indexOf(id)];
  const other = Math.max(...sc.filter((_, i) => IDS[i] !== id));
  return { own, other, margin: own - other };
}

// |dL| between the visible hair mass and the face pixels beside it, at the
// device size — the same measurement `_jz1hairtone.mjs` publishes, recomputed
// here per candidate tone so the two columns are the same quantity.
async function stepOf(id, svg, svgRef, w, h) {
  const raw = async (s) => {
    const { data } = await sharp(Buffer.from(s)).resize(w, h, { fit: 'fill' }).flatten({ background: '#ffffff' }).raw().toBuffer({ resolveWithObject: true });
    const L = new Float64Array(w * h);
    for (let i = 0; i < w * h; i++) L[i] = luma(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]);
    return L;
  };
  const maskOf = async (s) => { const L = await raw(s); const m = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) m[i] = L[i] < 128 ? 1 : 0; return m; };
  const A = await raw(svg), B = await raw(svgRef);
  const headM = await maskOf(headOnlySVG(svgRef)), hairM = await maskOf(massOnlySVG(svgRef, 0));
  const bs = massOnlySVG(svgRef, 1); const beardM = bs ? await maskOf(bs) : new Uint8Array(w * h);
  const ctrl = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) if (A[i] !== B[i]) ctrl[i] = 1;
  let hs = 0, hn = 0, fs = 0, fn = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (ctrl[i]) { hs += A[i]; hn++; continue; }
    if (!(headM[i] && !hairM[i] && !beardM[i])) continue;
    let touch = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const yy = y + dy, xx = x + dx;
      if (yy >= 0 && xx >= 0 && yy < h && xx < w && ctrl[yy * w + xx]) touch = 1;
    }
    if (touch) { fs += A[i]; fn++; }
  }
  return hn && fn ? Math.abs(hs / hn - fs / fn) : NaN;
}

console.log('C2 — is T1 asking for a SIGN or for a CONTRAST?');
console.log('');
console.log('`energyGrid` is a blurred |grad|. |grad| has no sign, so LIT and DARK differ');
console.log('to T1 only by how big a step each leaves at the hair/face boundary.');
console.log('');

let fatal = false;
for (const id of IDS) {
  const shipped = OBVERSE[id].hairLit === true;
  const base = coinSVG(id, 380, { side: 'obverse' });
  const t = tonesOf(base);
  OBVERSE[id].hairLit = !shipped;
  const flipTone = tonesOf(coinSVG(id, 380, { side: 'obverse' })).hairFill;
  OBVERSE[id].hairLit = shipped;
  const litTone = shipped ? t.hairFill : flipTone;
  const darkTone = shipped ? flipTone : t.hairFill;
  const L = (hex) => luma(parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16));

  // Five tones, spanning both sides of the face and reaching past both ends of
  // what `hairLit` can select.
  const cands = [
    ['deep    ', t.deep], ['hair    ', darkTone], ['motif   ', t.motif], ['cloth   ', litTone], ['field   ', t.field],
  ];
  console.log(`\n=== ${id} — face is motif ${L(t.motif).toFixed(1)}; shipped fill is ${shipped ? 'cloth (LIT)' : 'hair (DARK)'} ===`);
  console.log('    tone        luma   sign   |dL| face @38   ' + SIZES.map((s) => `margin@${s}`.padStart(11)).join(''));
  for (const [name, hex] of cands) {
    const svg380 = recolourHair(base, hex);
    const b = coinSVG(id, 38, { side: 'obverse' });
    const bw = Math.round(+b.match(/width="([\d.]+)"/)[1]), bh = Math.round(+b.match(/height="([\d.]+)"/)[1]);
    const step = await stepOf(id, recolourHair(b, hex), b, bw, bh);
    const ms = [];
    for (const px of SIZES) {
      const s = coinSVG(id, px, { side: 'obverse' });
      ms.push((await score(id, px, recolourHair(s, hex), `${id}-${px}-${name.trim()}`)).margin);
    }
    const sign = L(hex) > L(t.motif) ? 'LIT ' : L(hex) < L(t.motif) ? 'DARK' : 'none';
    const mark = hex === t.hairFill ? '  << SHIPPED' : '';
    console.log(`    ${name} ${L(hex).toFixed(1).padStart(6)}   ${sign}   ${(Number.isFinite(step) ? step.toFixed(2) : '--').padStart(13)}   ` +
      ms.map((m) => m.toFixed(3).padStart(11)).join('') + mark);
    void svg380;
  }
}

for (const f of tmp) { try { unlinkSync(f); } catch { /* already gone */ } }
console.log('\nscratch renders deleted.');
console.log('');
console.log('VALIDATION: the `cloth` and `hair` rows are the LIT and DARK branches. They must');
console.log('match what _jt1transfer.mjs printed for the same branches (obverse margins).');
console.log('  shipped   penny 0.386-0.389  nickel 0.202-0.205  dime 0.297-0.302  quarter 0.368');
console.log('  flipped   penny 0.391-0.394  nickel 0.162-0.164  dime 0.342-0.349  quarter 0.342');
console.log('If a row above disagrees with those beyond 0.001, this file is wrong and nothing');
console.log('it says about the other three tones may be quoted.');
if (fatal) process.exit(1);
