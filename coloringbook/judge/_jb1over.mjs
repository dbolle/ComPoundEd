// BUCK r0 — §4.3 / R0d: draw the fitted quad on the photograph it came from,
// AND a 6x zoom of the top-left corner of each, because at 1100px wide the
// difference between "on the printed rule" and "on the paper edge" is one
// pixel. Geometry is asserted finite before rasterising (nickel r0 N3) and the
// judge reads the PNG back.
//
//   node coloringbook/judge/_jb1over.mjs [file ...]   -> judge/_jb1-fit.png
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { fitBorder } from '../_blfit.mjs';

const files = process.argv.slice(2).length ? process.argv.slice(2)
  : ['bill-obv.jpg', 'bill-obv-2.jpg', 'bill-rev.jpg', 'bill-rev-2.jpg'];
const OUTW = 1100, ZOOM = 6, ZW = 300, ZH = 200;
const tiles = [];
for (const f of files) {
  const r = await fitBorder(f);
  const c = r.corners, pb = r.paperBox;
  for (const p of Object.values(c)) if (!p.every(Number.isFinite)) throw new Error(`${f}: non-finite corner`);
  const k = OUTW / r.w;
  const P = (p) => `${(p[0] * k).toFixed(1)},${(p[1] * k).toFixed(1)}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${OUTW}" height="${Math.round(r.h * k)}">
    <rect x="${pb.px0 * k}" y="${pb.py0 * k}" width="${(pb.px1 - pb.px0) * k}" height="${(pb.py1 - pb.py0) * k}"
      fill="none" stroke="#00a0ff" stroke-width="2" stroke-dasharray="8 6"/>
    <polygon points="${P(c.TL)} ${P(c.TR)} ${P(c.BR)} ${P(c.BL)}" fill="none" stroke="#ff00c8" stroke-width="1.6"/>
    <text x="8" y="20" fill="#ff00c8" font-size="17" font-family="monospace">${f}  MAGENTA=fitted border ${r.ratio.toFixed(4)}  BLUE=paper box ${pb.ratio.toFixed(4)}</text>
  </svg>`;
  const src = fileURLToPath(new URL(`../ref/${f}`, import.meta.url));
  const base = await sharp(src).resize(OUTW).toColourspace('srgb').png().toBuffer();
  const wide = await sharp(base).composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).png().toBuffer();

  // TL-corner zoom, in ORIGINAL pixels, quad + paper box drawn in the same frame
  const cx = Math.round(c.TL[0]), cy = Math.round(c.TL[1]);
  const x0 = Math.max(0, cx - Math.round(ZW / ZOOM / 2)), y0 = Math.max(0, cy - Math.round(ZH / ZOOM / 2));
  const cw = Math.min(r.w - x0, Math.round(ZW / ZOOM)), ch = Math.min(r.h - y0, Math.round(ZH / ZOOM));
  const crop = await sharp(src).extract({ left: x0, top: y0, width: cw, height: ch })
    .resize(cw * ZOOM, ch * ZOOM, { kernel: 'nearest' }).toColourspace('srgb').png().toBuffer();
  const zsvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cw * ZOOM}" height="${ch * ZOOM}">
    <line x1="0" y1="${(c.TL[1] - y0) * ZOOM}" x2="${cw * ZOOM}" y2="${(c.TL[1] - y0) * ZOOM}" stroke="#ff00c8" stroke-width="2"/>
    <line x1="${(c.TL[0] - x0) * ZOOM}" y1="0" x2="${(c.TL[0] - x0) * ZOOM}" y2="${ch * ZOOM}" stroke="#ff00c8" stroke-width="2"/>
    <line x1="0" y1="${(pb.py0 - y0) * ZOOM}" x2="${cw * ZOOM}" y2="${(pb.py0 - y0) * ZOOM}" stroke="#00a0ff" stroke-width="2" stroke-dasharray="6 5"/>
    <line x1="${(pb.px0 - x0) * ZOOM}" y1="0" x2="${(pb.px0 - x0) * ZOOM}" y2="${ch * ZOOM}" stroke="#00a0ff" stroke-width="2" stroke-dasharray="6 5"/>
    <text x="6" y="18" fill="#ffe000" font-size="15" font-family="monospace">TL x${ZOOM}</text></svg>`;
  const zoom = await sharp(crop).composite([{ input: Buffer.from(zsvg), top: 0, left: 0 }]).png().toBuffer();
  const wm = await sharp(wide).metadata(), zm = await sharp(zoom).metadata();
  const H = Math.max(wm.height, zm.height);
  tiles.push(await sharp({ create: { width: OUTW + zm.width + 12, height: H, channels: 3, background: '#101010' } })
    .composite([{ input: wide, left: 0, top: 0 }, { input: zoom, left: OUTW + 12, top: 0 }]).png().toBuffer());
}
const metas = await Promise.all(tiles.map((t) => sharp(t).metadata()));
const W = Math.max(...metas.map((m) => m.width));
const H = metas.reduce((s, m) => s + m.height + 8, 8);
let y = 8; const comp = [];
for (const [i, t] of tiles.entries()) { comp.push({ input: t, left: 8, top: y }); y += metas[i].height + 8; }
await sharp({ create: { width: W + 16, height: H, channels: 3, background: '#101010' } })
  .composite(comp).png().toFile('coloringbook/judge/_jb1-fit.png');
console.log('coloringbook/judge/_jb1-fit.png', `${W + 16}x${H}`);
