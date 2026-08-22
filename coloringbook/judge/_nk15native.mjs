// THE QUESTION THE ARCHITECTURE CHANGE TURNS ON.
//
// _nk14scaletest.mjs proved that the 380px drawing RESAMPLED with Lanczos to a
// small size beats the tier system 32/32 vs 24/32. But the app does not
// resample: it puts an SVG in the DOM and the browser renders the VECTOR
// natively at 38px. Those are not the same operation, and if native-small
// rendering of full detail behaves like the tiers rather than like the
// resample, then removing the tier branch buys nothing.
//
// So: three arms, all ending at the same device pixels, all through T1's own
// descriptor and fitted registration.
//   TIERS   coinSVG(id, px)                     -- today
//   NATIVE  the FULL-DETAIL svg, width/height rewritten to px, rasterised at px
//           -- what a browser would actually do after the tier branch is removed
//   LANCZOS coinSVG(id, 380) resampled to px    -- the _nk14 arm, the upper bound
import sharp from 'sharp';
import { writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { coinSVG } from '../../src/art/coins.js';
import { energyGrid } from './_jq20indep.mjs';
import { discOf } from './_jq42indep.mjs';
import { POOL_BY_SIDE, IDS, SIZES, featOfRef, designSim, setSide } from './_jt1transfer.mjs';

const REFDIR = new URL('../ref/', import.meta.url).pathname;
const TEMPS = [];

// full-detail SVG at an arbitrary pixel size: take the 380px (full-tier) string
// and rewrite only its width/height. The viewBox and every path are untouched,
// so this is exactly "the same drawing, smaller viewport".
function fullDetailAt(id, side, px) {
  const big = coinSVG(id, 380, { side });
  const m = big.match(/width="(\d+(?:\.\d+)?)" height="(\d+(?:\.\d+)?)"/);
  const k = px / 380;
  return big.replace(/width="[\d.]+" height="[\d.]+"/,
    `width="${(+m[1] * k).toFixed(2)}" height="${(+m[2] * k).toFixed(2)}"`);
}

async function featOf(id, side, px, mode) {
  let chain;
  if (mode === 'tiers') {
    chain = sharp(Buffer.from(coinSVG(id, px, { side }))).resize(px, px, { fit: 'contain', background: '#ffffff' });
  } else if (mode === 'native') {
    chain = sharp(Buffer.from(fullDetailAt(id, side, px))).resize(px, px, { fit: 'contain', background: '#ffffff' });
  } else {
    chain = sharp(Buffer.from(coinSVG(id, 380, { side }))).resize(px, px, { fit: 'contain', background: '#ffffff', kernel: 'lanczos3' });
  }
  const up = await chain.resize(900, 900, { kernel: 'nearest' }).flatten({ background: '#ffffff' }).png().toBuffer();
  mkdirSync(REFDIR + '_scratch/', { recursive: true });
  const name = `_scratch/nv-${mode}-${side}-${id}-${px}.png`;
  writeFileSync(REFDIR + name, up); TEMPS.push(name);
  return energyGrid(name, await discOf(name), 0.02);
}

const MODES = ['tiers', 'native', 'lanczos'];
const tot = { tiers: 0, native: 0, lanczos: 0 };
let n = 0;
console.log('THREE ARMS — does full detail rendered NATIVELY small behave like the resample?\n');
for (const side of ['obverse', 'reverse']) {
  setSide(side);
  console.log(`--- ${side} ---`);
  console.log('          size |  TIERS margin | NATIVE margin | LANCZOS margin');
  for (const px of SIZES) for (const id of IDS) {
    const r = {};
    for (const mode of MODES) {
      const o = await featOf(id, side, px, mode);
      const sc = [];
      for (const t of IDS) { const vs = []; for (const f of POOL_BY_SIDE[side][t]) vs.push(designSim(o, await featOfRef(f))); sc.push(Math.max(...vs)); }
      const own = sc[IDS.indexOf(id)], other = Math.max(...sc.filter((_, k) => IDS[k] !== id));
      r[mode] = { m: own - other, ok: own > other };
    }
    n++; for (const mode of MODES) if (r[mode].ok) tot[mode]++;
    console.log(`${id.padEnd(8)} ${String(px).padStart(5)} | ${r.tiers.m.toFixed(3).padStart(13)} | ${r.native.m.toFixed(3).padStart(13)} | ${r.lanczos.m.toFixed(3).padStart(14)}`);
  }
}
console.log(`\nT1 correct:  TIERS ${tot.tiers}/${n}   NATIVE ${tot.native}/${n}   LANCZOS ${tot.lanczos}/${n}`);
console.log(tot.native >= tot.lanczos - 1
  ? '\n  => NATIVE tracks the resample. Removing the tier branch is enough; no raster pipeline needed.'
  : '\n  => NATIVE does NOT track the resample. Removing the tier branch alone would not buy the gain.');
for (const t of TEMPS) { try { unlinkSync(REFDIR + t); } catch {} }
