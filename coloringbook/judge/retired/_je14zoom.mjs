// BUCK r14 (specialist) — arbitrary-window zoom on a rectified reverse
// reference, with a labelled viewBox-unit ladder. This is the hand-reading
// instrument: §2.1/R3 say an overlay drawn on the source and read off by hand
// is legitimate evidence, and §4.3 says every located feature is drawn on the
// source and looked at.
//
//   node coloringbook/judge/_je14zoom.mjs <file> <X0> <X1> <Y0> <Y1> [zoom] [tag]
import sharp from 'sharp';
import { grid } from './_je14crop.mjs';

const [file, aX0, aX1, aY0, aY1, aZ, tag] = process.argv.slice(2);
const BX0 = +aX0, BX1 = +aX1, BY0 = +aY0, BY1 = +aY1, ZOOM = +(aZ || 40);
const px = await grid(file);
const ow = Math.round((BX1 - BX0) * ZOOM), oh = Math.round((BY1 - BY0) * ZOOM);
const raw = new Float64Array(ow * oh);
let lo = 255, hi = 0;
for (let j = 0; j < oh; j++) for (let i = 0; i < ow; i++) {
  const v = px(BX0 + (i + 0.5) / ZOOM, BY0 + (j + 0.5) / ZOOM);
  raw[j * ow + i] = v; if (v < lo) lo = v; if (v > hi) hi = v;
}
const buf = Buffer.alloc(ow * oh * 3);
for (let k = 0; k < ow * oh; k++) {
  const g = Math.max(0, Math.min(255, Math.round(255 * (raw[k] - lo) / (hi - lo))));
  buf[3 * k] = g; buf[3 * k + 1] = g; buf[3 * k + 2] = g;
}
const put = (i, j, c) => {
  if (i < 0 || j < 0 || i >= ow || j >= oh) return;
  const k = 3 * (j * ow + i); buf[k] = c[0]; buf[k + 1] = c[1]; buf[k + 2] = c[2];
};
const I = (X) => Math.round((X - BX0) * ZOOM), J = (Y) => Math.round((Y - BY0) * ZOOM);
// half-unit ticks (magenta dots), whole units (cyan), 5-units (blue solid)
for (let X = Math.ceil(BX0 * 2) / 2; X <= BX1; X += 0.5) {
  const i = I(X), whole = Math.abs(X - Math.round(X)) < 1e-9, five = whole && Math.round(X) % 5 === 0;
  for (let j = 0; j < oh; j += five ? 1 : whole ? 3 : 9) put(i, j, five ? [0, 90, 255] : whole ? [0, 190, 255] : [255, 0, 200]);
}
for (let Y = Math.ceil(BY0 * 2) / 2; Y <= BY1; Y += 0.5) {
  const j = J(Y), whole = Math.abs(Y - Math.round(Y)) < 1e-9, five = whole && Math.round(Y) % 5 === 0;
  for (let i = 0; i < ow; i += five ? 1 : whole ? 3 : 9) put(i, j, five ? [0, 90, 255] : whole ? [0, 190, 255] : [255, 0, 200]);
}
const name = `coloringbook/judge/_je14zoom-${tag || 'x'}-${file.replace(/\W/g, '_')}.png`;
await sharp(buf, { raw: { width: ow, height: oh, channels: 3 } }).png().toFile(name);
console.log(`${name}  ${ow}x${oh}  X ${BX0}..${BX1}  Y ${BY0}..${BY1}  ${ZOOM}px/unit  grey ${lo.toFixed(1)}..${hi.toFixed(1)}`);
console.log('  blue solid = 5-unit, cyan dashed = 1-unit, magenta fine-dotted = 0.5-unit');
