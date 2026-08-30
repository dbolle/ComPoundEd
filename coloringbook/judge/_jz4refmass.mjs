// C2 — THE AREA MEAN, WHICH IS WHAT A 38 PX RENDER ACTUALLY INTEGRATES.
//
// `_jz3refsign.mjs` samples the frozen tone patches: three or four small discs
// per face. That is the right instrument for "is this groove in the right
// place", and it is the WRONG one for this question, because the overlay it
// prints shows why — on `quarter-obv-2.jpg` `wigCrown` sits on a lit crest at
// 1.42 of the cheek while `wigMid` sits in the shadow beside it at 0.86. Both
// are correct readings of the same wig. A patch median is a statement about
// where you put the patch.
//
// At 38 px the whole quarter is 38 device pixels across and the wig is about
// 200 of them; every crest and every groove lands inside one pixel together.
// So the quantity that decides whether `hairFill` has the right sign is the
// MEAN OVER THE WHOLE MASS, not a sample of it.
//
// METHOD. Take OUR OWN hair and head masses — extracted from the emitted SVG
// (`_jzlib.mjs`) so they are registered to the drawing exactly — and map them
// onto each photograph through the same disc fit T1 registers with. The coin's
// outer edge is viewBox radius 47 (`reededPath` draws it at 97,50) and the
// frozen tone-patch sets declare the same frame, `u = (screen - 50) / 47`, so
// the mapping is the one four earlier rounds already used. Then read the
// photograph's mean grey inside the hair mask and inside the face mask
// (head minus hair minus beard) and divide.
//
// `--overlay` draws the two masks on each photograph. LOOK AT IT before
// believing any row: a mask that has slipped onto the field will still return a
// number, and the whole reason this round exists is that a number nobody looked
// behind stood for four releases.
//
// HONEST LIMITS:
//   * The disc fit gives centre and scale, NOT rotation, and our art is not a
//     tracing of any one photograph. A mask that fits the drawing perfectly can
//     still overhang the coin. Read the overlays.
//   * Every ratio is device-over-device (hair over face), never
//     device-over-field, so a cameo proof's mirror field cannot distort it.
//   * This is a TONE statistic. It says nothing about whether the hair is the
//     right shape, and §0 ranks shape above tone.
//
// Run: node coloringbook/judge/_jz4refmass.mjs [--overlay]
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { SCRATCH, REF } from './_paths.mjs';
import { discOf } from './_jq42indep.mjs';
import { coinSVG, OBVERSE } from '../../src/art/coins.js';
import { headOnlySVG, massOnlySVG } from './_jzlib.mjs';

// The canvas: 1000 px for the 100-unit viewBox, so the coin's outer radius
// (47 units) is 470 px and a photograph's fitted disc resamples to the same.
const CANVAS = 1000, R_UNITS = 47, R_PX = CANVAS * R_UNITS / 100;

// Photographs per face. The exclusions are the ones the frozen sets already
// declare by name: `nickel-obv-3.png` is a Schlag PLASTER MODEL (a shape
// target that must never be a tone target), `nickel-obv-4.jpg`'s disc fit is
// ambiguous, `nickel-obv-proof.png` is a photometric exclusion, and
// `nickel-obv.jpg` is the same photograph as `nickel-obv-unc2004.jpg` at
// another resolution.
const PHOTOS = {
  penny: ['penny-obv-3.jpg', 'penny-obv.jpg', 'penny-obv-2.jpg', 'penny-obv-4.png'],
  nickel: ['nickel-obv-unc2004.jpg', 'nickel-obv-5.JPG'],
  // dime-obv-2/-3/-4 are all CAMEO PROOFS (mirror field, frosted device);
  // dime-obv.jpg is a 1996-W uncirculated strike and is the only dime obverse
  // reference here that is not a proof. It is listed last and named, because
  // "three references agree" means less when all three share a finish.
  dime: ['dime-obv-2.jpg', 'dime-obv-3.jpg', 'dime-obv-4.jpg', 'dime-obv.jpg'],
  quarter: ['quarter-obv-2.jpg', 'quarter-obv.jpg', 'quarter-obv-4.jpg'],
};
const SHIPPED = { penny: 'DARKER', nickel: 'BRIGHTER', dime: 'BRIGHTER', quarter: 'BRIGHTER' };

const OVERLAY = process.argv.includes('--overlay');
const OUT = join(SCRATCH, '_jz1');
if (OVERLAY) mkdirSync(OUT, { recursive: true });

async function maskAt(svg) {
  const { data } = await sharp(Buffer.from(svg)).resize(CANVAS, CANVAS, { fit: 'fill' })
    .flatten({ background: '#ffffff' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const m = new Uint8Array(CANVAS * CANVAS);
  for (let i = 0; i < CANVAS * CANVAS; i++) m[i] = data[i] < 128 ? 1 : 0;
  return m;
}

// The photograph, cropped to its fitted disc and resampled so its radius is
// R_PX in the same 1000 px frame the masks live in.
async function photoAt(f) {
  const d = await discOf(f);
  const meta = await sharp(join(REF, f)).metadata();
  const L = Math.round(d.cx - d.R), T = Math.round(d.cy - d.R), S = Math.round(2 * d.R);
  const padL = Math.max(0, -L), padT = Math.max(0, -T);
  const x0 = Math.max(0, L), y0 = Math.max(0, T);
  const w = Math.min(S - padL, meta.width - x0), h = Math.min(S - padT, meta.height - y0);
  let img = sharp(join(REF, f)).extract({ left: x0, top: y0, width: w, height: h });
  if (padL || padT || w < S || h < S) {
    img = sharp(await img.toBuffer()).extend({ top: padT, left: padL, bottom: S - h - padT, right: S - w - padL, background: '#808080' });
  }
  const side = Math.round(2 * R_PX);
  const off = Math.round((CANVAS - side) / 2);
  const { data } = await sharp(await img.resize(side, side, { fit: 'fill' }).greyscale().png().toBuffer())
    .extend({ top: off, left: off, bottom: CANVAS - side - off, right: CANVAS - side - off, background: '#808080' })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  return data;
}

const meanIn = (g, m) => { let s = 0, n = 0; for (let i = 0; i < g.length; i++) if (m[i]) { s += g[i]; n++; } return { mean: s / n, n }; };

console.log('C2 — hair mass over face mass, AREA MEANS, on real photographs.');
console.log('');
console.log('Our own hair/head masks, mapped onto each photograph through the disc fit T1');
console.log('registers with. > 1.00 means the real coin\'s hair is BRIGHTER than its face,');
console.log('which is what `hairLit: true` draws; < 1.00 means darker.');
console.log('');

const verdicts = [];
for (const [id, files] of Object.entries(PHOTOS)) {
  const svg = coinSVG(id, 380, { side: 'obverse' });
  const headM = await maskAt(headOnlySVG(svg));
  const hairM = await maskAt(massOnlySVG(svg, 0));
  const beardSvg = massOnlySVG(svg, 1);
  const beardM = beardSvg ? await maskAt(beardSvg) : new Uint8Array(CANVAS * CANVAS);
  const faceM = new Uint8Array(CANVAS * CANVAS);
  for (let i = 0; i < faceM.length; i++) if (headM[i] && !hairM[i] && !beardM[i]) faceM[i] = 1;

  console.log(`\n=== ${id} (${OBVERSE[id].who}) — hair mask ${meanIn(new Uint8Array(CANVAS * CANVAS), hairM).n} px, face mask ${meanIn(new Uint8Array(CANVAS * CANVAS), faceM).n} px of a ${Math.round(Math.PI * R_PX * R_PX)} px disc ===`);
  console.log('    photograph                          hair    face   hair/face');
  const rs = [];
  for (const f of files) {
    if (!existsSync(join(REF, f))) { console.log(`    ${f.padEnd(34)}  ABSENT`); continue; }
    const g = await photoAt(f);
    const hh = meanIn(g, hairM), ff = meanIn(g, faceM);
    const r = hh.mean / ff.mean;
    rs.push(r);
    console.log(`    ${f.padEnd(34)} ${hh.mean.toFixed(1).padStart(6)}  ${ff.mean.toFixed(1).padStart(6)}      ${r.toFixed(3)}`);
    if (OVERLAY) {
      const rgb = Buffer.alloc(CANVAS * CANVAS * 3);
      for (let i = 0; i < CANVAS * CANVAS; i++) {
        rgb[i * 3] = g[i]; rgb[i * 3 + 1] = g[i]; rgb[i * 3 + 2] = g[i];
        if (hairM[i]) rgb[i * 3] = Math.min(255, g[i] + 90);
        else if (faceM[i]) rgb[i * 3 + 2] = Math.min(255, g[i] + 90);
      }
      await sharp(rgb, { raw: { width: CANVAS, height: CANVAS, channels: 3 } })
        .png().toFile(join(OUT, `_jz4-mask-${id}-${f.replace(/[^\w]/g, '_')}.png`));
    }
  }
  const up = rs.every((v) => v > 1), down = rs.every((v) => v < 1);
  verdicts.push({ id, rs, says: up ? 'BRIGHTER' : down ? 'DARKER' : 'SPLIT' });
  console.log(`    -> ${rs.map((v) => v.toFixed(3)).join('  ')}   ${up ? 'BRIGHTER' : down ? 'DARKER' : 'SPLIT'}`);
}

// OURS THROUGH THE SAME TWO MASKS, so the comparison is apples to apples: the
// identical hair and face masks, the identical 1000 px frame, the only
// difference being that the pixels underneath are our drawing instead of a
// photograph. This is the one number that can say which BRANCH lands inside the
// band the photographs establish, rather than which is louder.
console.log('\n\nOURS, read through the same masks in the same frame');
console.log('  coin      LIT    DARK   photographs (median)   |LIT-med|  |DARK-med|   nearer');
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const nearer = [];
for (const v of verdicts) {
  const id = v.id;
  const svg = coinSVG(id, 380, { side: 'obverse' });
  const headM = await maskAt(headOnlySVG(svg));
  const hairM = await maskAt(massOnlySVG(svg, 0));
  const bs = massOnlySVG(svg, 1);
  const beardM = bs ? await maskAt(bs) : new Uint8Array(CANVAS * CANVAS);
  const faceM = new Uint8Array(CANVAS * CANVAS);
  for (let i = 0; i < faceM.length; i++) if (headM[i] && !hairM[i] && !beardM[i]) faceM[i] = 1;
  const was = OBVERSE[id].hairLit;
  const ratioFor = async (lit) => {
    OBVERSE[id].hairLit = lit;
    const s = coinSVG(id, 380, { side: 'obverse' });
    OBVERSE[id].hairLit = was;
    const { data } = await sharp(Buffer.from(s)).resize(CANVAS, CANVAS, { fit: 'fill' })
      .flatten({ background: '#ffffff' }).greyscale().raw().toBuffer({ resolveWithObject: true });
    return meanIn(data, hairM).mean / meanIn(data, faceM).mean;
  };
  const lit = await ratioFor(true), dark = await ratioFor(false);
  const med = median(v.rs);
  const dl = Math.abs(lit - med), dd = Math.abs(dark - med);
  nearer.push({ id, win: dl < dd ? 'LIT' : 'DARK', shipped: SHIPPED[id] === 'BRIGHTER' ? 'LIT' : 'DARK', gap: Math.abs(dl - dd) });
  console.log(`  ${id.padEnd(8)} ${lit.toFixed(3)}  ${dark.toFixed(3)}          ${med.toFixed(3)}       ${dl.toFixed(3)}      ${dd.toFixed(3)}   ${dl < dd ? 'LIT ' : 'DARK'}${SHIPPED[id] === (dl < dd ? 'BRIGHTER' : 'DARKER') ? '  = shipped' : '  != shipped'}${Math.abs(dl - dd) < 0.02 ? '  (a wash, gap ' + Math.abs(dl - dd).toFixed(3) + ')' : ''}`);
}

console.log('\n\nVERDICT — area means');
console.log('  coin      range           photographs say   coins.js draws   agree?');
for (const v of verdicts) {
  console.log(`  ${v.id.padEnd(8)} ${Math.min(...v.rs).toFixed(3)}-${Math.max(...v.rs).toFixed(3)}   ${v.says.padStart(15)}   ${SHIPPED[v.id].padStart(14)}   ${v.says === SHIPPED[v.id] ? 'yes' : v.says === 'SPLIT' ? 'undetermined' : 'NO'}`);
}
if (OVERLAY) console.log('\noverlays (hair tinted red, face tinted blue):', OUT);
