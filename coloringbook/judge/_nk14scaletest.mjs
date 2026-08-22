// DOES "DRAW BIG AND SCALE DOWN" BEAT THE TIER SYSTEM ON TRANSFER?
//
// The owner asked what the small sizes would look like if they were simply the
// large drawing scaled down instead of tiers dropping detail. The picture
// (_nk13scale.png) says the scaled version keeps the reeding, the legends and
// the interior modelling. This measures whether that is recognition or just
// prettiness, using T1's own machinery.
//
// FAIRNESS. Both arms end at the SAME device pixels and are registered the
// same way: render -> px device pixels -> upsample 900 nearest -> energyGrid
// with a FITTED disc (discOf), which is the registration fix made in v1.77.0.
// The only difference is how the px pixels were produced:
//   TIERS  coinSVG(id, px)                      -- what the app draws today
//   SCALED coinSVG(id, 380) resampled to px     -- draw big, scale down
import sharp from 'sharp';
import { writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { coinSVG } from '../../src/art/coins.js';
import { energyGrid } from './_jq20indep.mjs';
import { discOf } from './_jq42indep.mjs';
import { POOL_BY_SIDE, IDS, SIZES, featOfRef, designSim, setSide } from './_jt1transfer.mjs';

const REFDIR = new URL('../ref/', import.meta.url).pathname;
const TEMPS = [];
async function featOf(id, side, px, mode) {
  // BOTH ARMS AS SINGLE CHAINS FROM THE SVG, exactly as _jt1transfer.featOfOurs
  // does. sharp rasterises an SVG at the size you ASK for, so
  // `sharp(svg).resize(px,px)` is a NATIVE vector render at px, whereas
  // rasterising at natural size and then resampling is a degraded one. Two
  // earlier versions of this file did the latter for the tiers arm and
  // handicapped it by ~0.03 of own-score — reporting TIERS 22/32 against the
  // official gate's 24/32. The mismatch with the official number is what
  // exposed it, which is the whole reason a new instrument must reconcile with
  // the one it is arguing against before it is believed.
  //
  // The SCALED arm legitimately carries a downsample — that is the thing under
  // test — but it starts from a native 380px vector render, not a resample.
  const chain = mode === 'tiers'
    ? sharp(Buffer.from(coinSVG(id, px, { side }))).resize(px, px, { fit: 'contain', background: '#ffffff' })
    : sharp(Buffer.from(coinSVG(id, 380, { side }))).resize(px, px, { fit: 'contain', background: '#ffffff', kernel: 'lanczos3' });
  const up = await chain.resize(900, 900, { kernel: 'nearest' }).flatten({ background: '#ffffff' }).png().toBuffer();
  mkdirSync(REFDIR + '_scratch/', { recursive: true });
  const name = `_scratch/st-${mode}-${side}-${id}-${px}.png`;
  writeFileSync(REFDIR + name, up); TEMPS.push(name);
  return energyGrid(name, await discOf(name), 0.02);
}

console.log('TIERS vs DRAW-BIG-AND-SCALE, on T1\'s own descriptor and registration\n');
let tot = { tiers: 0, scaled: 0 }, n = 0;
for (const side of ['obverse', 'reverse']) {
  setSide(side);
  console.log(`--- ${side} ---`);
  console.log('        size   TIERS own  margin   |  SCALED own  margin   |  winner');
  for (const px of SIZES) {
    for (const id of IDS) {
      const row = {};
      for (const mode of ['tiers', 'scaled']) {
        const o = await featOf(id, side, px, mode);
        const sc = [];
        for (const t of IDS) {
          const vs = [];
          for (const f of POOL_BY_SIDE[side][t]) vs.push(designSim(o, await featOfRef(f)));
          sc.push(Math.max(...vs));
        }
        const own = sc[IDS.indexOf(id)];
        const bestOther = Math.max(...sc.filter((_, k) => IDS[k] !== id));
        row[mode] = { own, margin: own - bestOther, ok: own > bestOther };
      }
      n++; if (row.tiers.ok) tot.tiers++; if (row.scaled.ok) tot.scaled++;
      const w = row.scaled.margin > row.tiers.margin ? 'SCALED' : row.tiers.margin > row.scaled.margin ? 'tiers' : '=';
      console.log(`${id.padEnd(8)} ${String(px).padStart(4)}   ${row.tiers.own.toFixed(3).padStart(8)} ${row.tiers.margin.toFixed(3).padStart(8)}   |  ${row.scaled.own.toFixed(3).padStart(8)} ${row.scaled.margin.toFixed(3).padStart(8)}   |  ${w}${row.tiers.ok !== row.scaled.ok ? (row.scaled.ok ? '  <-- SCALED FIXES A CONFUSION' : '  <-- scaled BREAKS one') : ''}`);
    }
  }
}
console.log(`\nT1 correct:  TIERS ${tot.tiers}/${n}   SCALED ${tot.scaled}/${n}`);
for (const t of TEMPS) { try { unlinkSync(REFDIR + t); } catch {} }
