// THE RESOLUTION FLOOR — how small can a US coin be drawn and still be the
// coin it is?
//
// The owner, 2026-08-22: "If we need to adjust the displayed size in app to
// accomplish our goals it is acceptable to set a minimum resolution and rewrite
// the module to the spec rather than forcing fidelity at a resolution that
// can't support it."
//
// That turns the 38px transfer failure from a drawing problem into an EMPIRICAL
// question, and it is the right one: at what size do the five denominations
// stop being distinguishable AT ALL?
//
// THE EXPERIMENT. Two sweeps over the same size ladder, using the machinery
// _jt1transfer.mjs already validated (registered NCC on blurred gradient
// energy — raw greyscale was tried, failed its own control 3/12, and was
// discarded):
//
//   CONTROL — real photographs against real photographs. Hold one out per
//   denomination and ask whether it sorts to its own kind. This is the PHYSICAL
//   FLOOR: the size below which the coins themselves are not separable when
//   downsampled. No drawing, however good, can beat it. If real photographs of
//   a cent and a nickel are indistinguishable at 38px, then our art failing at
//   38px is not an art defect and no round can fix it — the app must draw bigger.
//
//   OURS — our art against the real photographs, the T1 question, at each size.
//
// The two numbers answer different things and both are needed:
//   * where CONTROL first succeeds  = the smallest size the app may legitimately
//     use for a naming/counting task, whatever the art.
//   * where OURS first succeeds     = where our drawings currently earn that.
//   * the gap between them          = our deficit, and the only part a
//     specialist round can close.
//
// Run: node coloringbook/judge/_jt2floor.mjs
import { POOL, IDS, featOfRef, featOfOurs, designSim } from './_jt1transfer.mjs';

const LADDER = [16, 20, 24, 28, 32, 38, 44, 48, 56, 64, 84, 110];

// Downsampled references, per size. featOfRef reads the full-resolution file,
// so the control needs its own size-aware path: render the reference THROUGH
// the same device-pixel bottleneck our art goes through.
import sharp from 'sharp';
import { readFileSync, writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
const REFDIR = new URL('../ref/', import.meta.url).pathname;
const DISCS = JSON.parse(readFileSync(new URL('./_jp1discs.json', import.meta.url).pathname, 'utf8'));
const TEMPS = [];

async function refAtSize(file, px) {
  const m = await sharp(REFDIR + file).metadata();
  const d = DISCS[file];
  const cx = d ? d.cx : m.width / 2, cy = d ? d.cy : m.height / 2;
  const R = d ? d.R : Math.min(m.width, m.height) / 2 * 0.95;
  const L = Math.max(0, Math.round(cx - R)), T = Math.max(0, Math.round(cy - R));
  const S = Math.round(Math.min(2 * R, m.width - L, m.height - T));
  // crop to the disc, squeeze through px device pixels, then blow back up with
  // NEAREST so the descriptor sees exactly the information px pixels carry.
  const png = await sharp(REFDIR + file).extract({ left: L, top: T, width: S, height: S })
    .resize(px, px, { fit: 'fill' }).resize(900, 900, { kernel: 'nearest' })
    .flatten({ background: '#ffffff' }).png().toBuffer();
  mkdirSync(REFDIR + '_scratch/', { recursive: true });
  const name = `_scratch/floor-${file.replace(/[^a-z0-9]/gi, '')}-${px}.png`;
  writeFileSync(REFDIR + name, png);
  TEMPS.push(name);
  const { energyGrid } = await import('./_jq20indep.mjs');
  return energyGrid(name, { cx: 450, cy: 450, R: 450 * 0.94 }, 0.02);
}

console.log('THE RESOLUTION FLOOR — how small can a US coin be and still be itself?\n');
console.log('CONTROL = real photographs sorted against real photographs at that size.');
console.log('          This is the PHYSICAL floor. No drawing can beat it.');
console.log('OURS    = our art sorted against real photographs at that size (T1).\n');
console.log(' size    control   ours     note');

let firstControl = null, firstOurs = null;
for (const px of LADDER) {
  const refs = {};
  for (const id of IDS) {
    refs[id] = [];
    for (const f of POOL[id]) refs[id].push(await refAtSize(f, px));
  }
  // control: hold one out
  let cok = 0, ctot = 0;
  for (const id of IDS) {
    if (POOL[id].length < 2) continue;
    const held = refs[id][0];
    const sc = IDS.map((t) => {
      const pool = t === id ? refs[t].slice(1) : refs[t];
      return pool.length ? Math.max(...pool.map((r) => designSim(held, r))) : -1;
    });
    ctot++; if (IDS[sc.indexOf(Math.max(...sc))] === id) cok++;
  }
  // ours
  let ook = 0, otot = 0;
  for (const id of IDS) {
    const o = await featOfOurs(id, px);
    const sc = IDS.map((t) => Math.max(...refs[t].map((r) => designSim(o, r))));
    otot++; if (IDS[sc.indexOf(Math.max(...sc))] === id) ook++;
  }
  if (firstControl === null && cok === ctot) firstControl = px;
  if (firstOurs === null && ook === otot) firstOurs = px;
  const note = cok < ctot ? 'REAL COINS NOT SEPARABLE HERE — no art can fix this'
    : ook < otot ? 'coins separable; OUR ART is the deficit' : 'both fine';
  console.log(` ${String(px).padStart(4)}     ${cok}/${ctot}      ${ook}/${otot}     ${note}`);
}

console.log(`\nSmallest size where REAL PHOTOGRAPHS sort correctly: ${firstControl ?? 'never, on this ladder'}`);
console.log(`Smallest size where OUR ART sorts correctly:          ${firstOurs ?? 'never, on this ladder'}`);
console.log(`\nThe app currently draws at 38, 48 and 84 (src/screens/money.js).`);
if (firstControl && 38 < firstControl) {
  console.log(`\n  => 38px IS BELOW THE PHYSICAL FLOOR (${firstControl}px). Our art failing there is`);
  console.log('     NOT an art defect and no specialist round can fix it. The owner has authorised');
  console.log('     raising the minimum displayed size; this is the number to raise it to.');
} else if (firstControl) {
  console.log(`\n  => 38px is at or above the physical floor (${firstControl}px), so the failure there`);
  console.log('     is OUR ART and a round can close it.');
}
for (const t of TEMPS) { try { unlinkSync(REFDIR + t); } catch {} }
