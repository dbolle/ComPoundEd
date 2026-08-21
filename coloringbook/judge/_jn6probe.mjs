// _jn6probe — round 6, nickel obverse. A WORKING instrument, not evidence.
//
// Prints the same ink/mean statistic `_jn8tier.mjs` computes (same locus,
// same 0.84R disc, same field = 90th percentile) but per SIZE rather than
// per JUMP, so the shape of the icon->mid step is visible rather than
// summarised into one d(ink). It also prints boxW and the tier so the two
// different "size" scales in this file (requested size vs device box) can
// never be confused again.
//
// It is a copy of _jn8tier.mjs's `stats()` verbatim; it does not re-derive
// anything and it may not be quoted as a value.
import sharp from 'sharp';

const tierOf = (s) => (s >= 76 ? 'full' : s >= 44 ? 'mid' : 'icon');

async function raster(svg, W) {
  const { data, info } = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .resize(W, W, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  if (info.channels !== 1) throw new Error('expected 1 channel');
  return { d: data, w: info.width, h: info.height };
}

async function stats(mod, id, side, size) {
  const svg = mod.coinSVG(id, size, { side });
  const W = Number(svg.match(/width="([\d.]+)"/)[1]);
  const g = await raster(svg, Math.max(8, Math.round(W)));
  const R = g.w / 2, cx = g.w / 2, cy = g.h / 2;
  const vals = [];
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= 0.84 * R) vals.push(g.d[y * g.w + x]);
  }
  vals.sort((a, b) => a - b);
  const field = vals[Math.floor(vals.length * 0.9)];
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const ink = vals.filter((v) => v < field - 8).length / vals.length;
  return { px: g.w, boxW: Math.round(W), field, mean: mean / field, ink, glyphs: (svg.match(/<text/g) || []).length, len: svg.length };
}

const ID = process.env.ID || 'nickel';
const SIDE = process.env.SIDE || 'obverse';
const LO = Number(process.env.LO || 26), HI = Number(process.env.HI || 120), STEP = Number(process.env.STEP || 2);
const ARTPATH = process.env.ART || new URL('../../src/art/coins.js', import.meta.url).pathname;
const mod = await import(ARTPATH);

console.log(`### _jn6probe  art=${ARTPATH}  ${ID}/${SIDE}  sizes ${LO}..${HI} step ${STEP}`);
console.log('size  tier  boxW  devpx  field    mean      ink      d(ink)  glyphs  svgLen');
let prev = null;
for (let s = LO; s <= HI; s += STEP) {
  const r = await stats(mod, ID, SIDE, s);
  const d = prev == null ? 0 : r.ink - prev;
  const mark = prev != null && tierOf(s) !== tierOf(s - STEP) ? '  <== TIER BOUNDARY' : '';
  console.log(`${String(s).padStart(4)}  ${tierOf(s).padEnd(4)}  ${String(r.boxW).padStart(4)}  ${String(r.px).padStart(5)}  ${String(r.field).padStart(5)}  ${r.mean.toFixed(4)}  ${r.ink.toFixed(4)}  ${(d >= 0 ? '+' : '') + d.toFixed(4)}  ${String(r.glyphs).padStart(6)}  ${String(r.len).padStart(6)}${mark}`);
  prev = r.ink;
}
