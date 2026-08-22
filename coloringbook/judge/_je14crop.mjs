// BUCK r14 (specialist) — LOOK AT THE EAGLE. Rectify each reverse reference
// into the note's border-normalised frame, map that into our 100x56 viewBox
// (the same `rectify` chain `_jb3seal.mjs` and `_jk9edge.mjs` use), crop the
// eagle's roundel, upscale, and draw a viewBox-unit ladder plus the FROZEN
// measured rim on top of it (§4.3: every located feature gets an overlay drawn
// on the source and you look at it).
//
// Nothing here is a target. This is the tool that lets a human read
// coordinates off the photograph.
//
//   node coloringbook/judge/_je14crop.mjs [tag] [--pyr]
import sharp from 'sharp';
import { rectify } from '../_blnorm.mjs';

const S = 40;                       // rectified px per viewBox unit
const X0 = 5, Y0 = 5, W = 90 * S, H = 46 * S;
const FILES = ['bill-rev.jpg', 'bill-rev-2.jpg'];
// FROZEN — `_jb4target.json`'s per-file rims. Never re-fitted here.
const RIM = {
  'bill-rev.jpg': { cx: 77.25, cy: 27.75, rx: 9.5, ry: 12.75 },
  'bill-rev-2.jpg': { cx: 76.5, cy: 27.75, rx: 8.25, ry: 12.0 },
};
const MEAN = { cx: 76.875, cy: 27.75, rx: 8.875, ry: 12.375 };

const pyr = process.argv.includes('--pyr');
const BOX = pyr ? { x0: 12, x1: 35, y0: 14, y1: 42 } : { x0: 65, x1: 89, y0: 13, y1: 43 };
const ZOOM = 34;                    // output px per viewBox unit

export async function grid(file) {
  const R = await rectify(file, W, H);
  return (X, Y) => {
    const x = (X - X0) * S, y = (Y - Y0) * S;
    if (x < 0 || y < 0 || x >= W - 1 || y >= H - 1) return 255;
    const i = x | 0, j = y | 0, fx = x - i, fy = y - j;
    return R.out[j * W + i] * (1 - fx) * (1 - fy) + R.out[j * W + i + 1] * fx * (1 - fy) +
      R.out[(j + 1) * W + i] * (1 - fx) * fy + R.out[(j + 1) * W + i + 1] * fx * fy;
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const f of FILES) {
    const px = await grid(f);
    const ow = Math.round((BOX.x1 - BOX.x0) * ZOOM), oh = Math.round((BOX.y1 - BOX.y0) * ZOOM);
    const buf = Buffer.alloc(ow * oh * 3);
    let lo = 255, hi = 0;
    const raw = new Float64Array(ow * oh);
    for (let j = 0; j < oh; j++) for (let i = 0; i < ow; i++) {
      const v = px(BOX.x0 + (i + 0.5) / ZOOM, BOX.y0 + (j + 0.5) / ZOOM);
      raw[j * ow + i] = v; if (v < lo) lo = v; if (v > hi) hi = v;
    }
    // stretch to full range so the engraving is readable at all
    for (let k = 0; k < ow * oh; k++) {
      const g = Math.max(0, Math.min(255, Math.round(255 * (raw[k] - lo) / (hi - lo))));
      buf[3 * k] = g; buf[3 * k + 1] = g; buf[3 * k + 2] = g;
    }
    const put = (i, j, r, g, b) => {
      if (i < 0 || j < 0 || i >= ow || j >= oh) return;
      const k = 3 * (j * ow + i); buf[k] = r; buf[k + 1] = g; buf[k + 2] = b;
    };
    const XY = (X, Y) => [Math.round((X - BOX.x0) * ZOOM), Math.round((Y - BOX.y0) * ZOOM)];
    // unit ladder: 1-unit grid faint, 5-unit grid strong
    for (let X = Math.ceil(BOX.x0); X <= BOX.x1; X++) {
      const [i] = XY(X, 0); const strong = X % 5 === 0;
      for (let j = 0; j < oh; j += strong ? 1 : 4) put(i, j, strong ? 0 : 120, strong ? 160 : 200, strong ? 255 : 255);
    }
    for (let Y = Math.ceil(BOX.y0); Y <= BOX.y1; Y++) {
      const [, j] = XY(0, Y); const strong = Y % 5 === 0;
      for (let i = 0; i < ow; i += strong ? 1 : 4) put(i, j, strong ? 0 : 120, strong ? 160 : 200, strong ? 255 : 255);
    }
    // the frozen rims: per-file (red) and the frozen mean (green)
    for (const [E, c] of [[RIM[f], [255, 40, 40]], [MEAN, [30, 200, 60]]])
      for (let a = 0; a < 2400; a++) {
        const t = 2 * Math.PI * a / 2400;
        const [i, j] = XY(E.cx + E.rx * Math.cos(t), E.cy + E.ry * Math.sin(t));
        put(i, j, ...c); put(i + 1, j, ...c);
      }
    const name = `coloringbook/judge/_je14crop-${pyr ? 'pyr' : 'eagle'}-${f.replace(/\W/g, '_')}.png`;
    await sharp(buf, { raw: { width: ow, height: oh, channels: 3 } }).png().toFile(name);
    console.log(`${name}  ${ow}x${oh}  viewBox X ${BOX.x0}..${BOX.x1} Y ${BOX.y0}..${BOX.y1} at ${ZOOM}px/unit` +
      `  grey range ${lo.toFixed(1)}..${hi.toFixed(1)}  red = this file's frozen rim, green = the frozen MEAN rim`);
  }
}
