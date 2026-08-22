// BUCK r14 (specialist) — D12 at the one place this round can be judged by
// eye: the eagle's roundel, ours BEFORE and AFTER beside the photograph,
// all three cropped to the same viewBox window and rendered at the same
// pixel count.
//
// Both revisions are pinned by content hash in the caption (§7: pin both
// revisions explicitly in any before/after).
//
//   node coloringbook/judge/_je14peek.mjs [size]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { grid } from './_je14crop.mjs';

const AFTER = '../../src/art/coins.js', BEFORE = '../../src/art/_je14-before-coins.js';
const hashOf = (rel) => createHash('sha256').update(readFileSync(new URL(rel, import.meta.url))).digest('hex').slice(0, 12);
const after = await import(AFTER), before = await import(BEFORE);
const SIZE = Number(process.argv[2] || 190);
// the crop window, in viewBox units — the eagle's frozen roundel plus 1.5u
const EAG = { cx: 76.875, cy: 27.75, rx: 8.875, ry: 12.375 };
const WIN = { x0: EAG.cx - EAG.rx - 1.5, x1: EAG.cx + EAG.rx + 1.5, y0: EAG.cy - EAG.ry - 1.5, y1: EAG.cy + EAG.ry + 1.5 };
const Z = 30;                                     // output px per viewBox unit
const ow = Math.round((WIN.x1 - WIN.x0) * Z), oh = Math.round((WIN.y1 - WIN.y0) * Z);

async function ours(mod, tier) {
  const box = mod.coinPx('buck', tier);
  const svg = mod.coinSVG('buck', tier, { side: 'reverse', value: false });
  if (/undefined|NaN/.test(svg)) throw new Error('undefined/NaN in the emitted SVG');
  // render the whole note at the tier's own pixel size, then blow the roundel
  // up with NEAREST so what is on screen at that tier is what is looked at
  const full = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .resize(Math.round(box.w), Math.round(box.h), { fit: 'fill' }).png().toBuffer();
  const s = box.w / 100;                          // device px per viewBox unit
  const crop = { left: Math.round(WIN.x0 * s), top: Math.round(WIN.y0 * s),
    width: Math.max(1, Math.round((WIN.x1 - WIN.x0) * s)), height: Math.max(1, Math.round((WIN.y1 - WIN.y0) * s)) };
  return sharp(full).extract(crop).resize(ow, oh, { kernel: 'nearest' }).png().toBuffer();
}
async function photo(file) {
  const px = await grid(file);
  const buf = Buffer.alloc(ow * oh * 3);
  const raw = new Float64Array(ow * oh);
  let lo = 255, hi = 0;
  // the photograph is cropped by ITS OWN rim, not by our viewBox window, so the
  // two are compared at the same fraction-of-roundel rather than at the same
  // absolute coordinate — the rims differ by 15% between the two photographs
  const R = { 'bill-rev.jpg': { cx: 77.25, cy: 27.75, rx: 9.5, ry: 12.75 },
    'bill-rev-2.jpg': { cx: 76.5, cy: 27.75, rx: 8.25, ry: 12.0 } }[file];
  for (let j = 0; j < oh; j++) for (let i = 0; i < ow; i++) {
    const X = WIN.x0 + (i + 0.5) / Z, Y = WIN.y0 + (j + 0.5) / Z;
    const v = px(R.cx + (X - EAG.cx) / EAG.rx * R.rx, R.cy + (Y - EAG.cy) / EAG.ry * R.ry);
    raw[j * ow + i] = v; if (v < lo) lo = v; if (v > hi) hi = v;
  }
  for (let k = 0; k < ow * oh; k++) {
    const g = Math.round(255 * (raw[k] - lo) / (hi - lo));
    buf[3 * k] = g; buf[3 * k + 1] = g; buf[3 * k + 2] = g;
  }
  return sharp(buf, { raw: { width: ow, height: oh, channels: 3 } }).png().toBuffer();
}

const tiles = [
  ['bill-rev.jpg', await photo('bill-rev.jpg')],
  ['bill-rev-2.jpg', await photo('bill-rev-2.jpg')],
  [`BEFORE ${SIZE}`, await ours(before, SIZE)],
  [`AFTER ${SIZE}`, await ours(after, SIZE)],
];
const W = tiles.length * (ow + 12) + 12, H = oh + 74;
let labels = `<text x="12" y="24" fill="#fff" font-size="17" font-family="monospace">the eagle's roundel, same window, ${Z}px/unit.  coins.js BEFORE sha256:${hashOf(BEFORE)}  AFTER sha256:${hashOf(AFTER)}</text>`;
const comp = [];
tiles.forEach(([n, b], i) => {
  const x = 12 + i * (ow + 12);
  comp.push({ input: b, left: x, top: 44 });
  labels += `<text x="${x}" y="${44 + oh + 20}" fill="#9ad" font-size="15" font-family="monospace">${n}</text>`;
});
const base = await sharp({ create: { width: W, height: H, channels: 3, background: '#101010' } }).png().toBuffer();
const out = `coloringbook/judge/_je14peek-${SIZE}.png`;
await sharp(base).composite([...comp, { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${labels}</svg>`), top: 0, left: 0 }]).png().toFile(out);
console.log(`${out}  ${W}x${H}   window X ${WIN.x0.toFixed(2)}..${WIN.x1.toFixed(2)} Y ${WIN.y0.toFixed(2)}..${WIN.y1.toFixed(2)}`);
