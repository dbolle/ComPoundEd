// D12, the checkable half — "the field ring runs unbroken" as a number.
//
// The eye said the ring at ten o'clock looked different between r0 and r1. An
// impression from a nearest-upscaled 54x54 tile is exactly the kind of thing
// §8 warns about, so the same claim is also measured: walk the field-ring
// circle in the RENDERED raster, one sample per 0.5 degree, and report the
// brightest sample on it. A ring drawn in rim grey over a pale field is DARK;
// a white bevel printed across it is LIGHT. So "broken" = a run of samples on
// the ring that are lighter than the field the ring is drawn against.
//
// Bounds are printed (§4.1): the search is over the full 0..360, and the
// reported break angles are interior to it or there is no break.
//
// Run: node coloringbook/judge/_jq12ring.mjs <before.js> <after.js>
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { loadCoins } from './_jq8contain-v2.mjs';

const R_FIELD = { icon: 42.5, mid: 40.5, full: 41 };
const tierOf = (s) => (s >= 76 ? 'full' : s >= 44 ? 'mid' : 'icon');

async function raster(mod, id, side, size) {
  const svg = mod.coinSVG(id, size, { side });
  const w = Math.round(Number(svg.match(/width="([\d.]+)"/)[1]));
  const h = Math.round(Number(svg.match(/height="([\d.]+)"/)[1]));
  // 8x supersample so a sub-pixel sliver is not lost to the sampling grid; the
  // DRAWING is still the one the browser gets at `size`.
  const S = 8;
  const { data, info } = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .resize(w * S, h * S, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  if (data.length !== info.width * info.height) throw new Error('buffer length — D12 UNTRUSTED');
  return { d: data, w: info.width, h: info.height, S, boxW: w };
}

function walk(r, rField) {
  // viewBox (0..100) -> raster pixels
  const px = (X, Y) => {
    const i = Math.max(0, Math.min(r.w - 1, Math.round((X / 100) * r.w)));
    const j = Math.max(0, Math.min(r.h - 1, Math.round((Y / 100) * r.h)));
    return r.d[j * r.w + i];
  };
  const N = 720; // 0.5 degree
  const vals = [];
  for (let k = 0; k < N; k++) {
    const a = (k / N) * 2 * Math.PI;
    vals.push({ deg: (k / N) * 360, v: px(50 + rField * Math.cos(a), 50 + rField * Math.sin(a)) });
  }
  // the field the ring is drawn against, read just inside it
  const inner = [];
  for (let k = 0; k < N; k++) {
    const a = (k / N) * 2 * Math.PI;
    inner.push(px(50 + (rField - 3) * Math.cos(a), 50 + (rField - 3) * Math.sin(a)));
  }
  const fieldLvl = inner.slice().sort((x, y) => x - y)[Math.floor(inner.length / 2)];
  const ringLvl = vals.map((x) => x.v).slice().sort((x, y) => x - y)[Math.floor(N / 2)];
  const breaks = vals.filter((x) => x.v > fieldLvl);
  // clock position: SVG y grows downward, 12 o'clock is -y i.e. deg 270
  const clock = (deg) => {
    const c = (((deg - 270) / 360) * 12 + 12) % 12;
    return (c < 0.5 ? 12 : Math.round(c * 2) / 2).toFixed(1);
  };
  return {
    fieldLvl, ringLvl, max: Math.max(...vals.map((x) => x.v)), min: Math.min(...vals.map((x) => x.v)),
    nBreak: breaks.length,
    breakSpan: breaks.length ? `${breaks[0].deg.toFixed(1)}..${breaks[breaks.length - 1].deg.toFixed(1)} deg (~${clock(breaks[0].deg)} o'clock)` : '—',
    bounds: '0..360 deg, 720 samples',
  };
}

const [beforePath, afterPath] = process.argv.slice(2);
const A = await loadCoins(readFileSync(beforePath, 'utf8'));
const B = await loadCoins(readFileSync(afterPath, 'utf8'));

console.log('coin/side/size          rev  field  ring   max on ring   samples lighter than field   where');
for (const [id, side] of [['quarter', 'reverse'], ['dime', 'reverse'], ['nickel', 'reverse'], ['penny', 'reverse'], ['quarter', 'obverse'], ['nickel', 'obverse'], ['penny', 'obverse']]) {
  for (const size of [84, 54, 26]) {
    const rF = R_FIELD[tierOf(size)];
    for (const [tag, mod] of [['r0', A], ['r1', B]]) {
      const w = walk(await raster(mod, id, side, size), rF);
      console.log(
        `${(id + ' ' + side + ' ' + size).padEnd(23)} ${tag}  ${String(w.fieldLvl).padStart(5)}  ${String(w.ringLvl).padStart(4)}  ${String(w.max).padStart(11)}   ${String(w.nBreak).padStart(25)}   ${w.breakSpan}`
      );
    }
  }
}
console.log('\nnull test: search bounds are the full circle (0..360, 720 samples); a break span touching both 0.0 and 359.5 would be a wrap-around, reported not hidden.');
