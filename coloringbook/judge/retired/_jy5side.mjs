// ROUND (cent obverse, mid-jaw) — OUR DRAWING under the SAME local ladder as
// the photograph, so the two pictures can be put side by side and the same
// question asked of both. `_pylib.ourRaster` places our render on a frame the
// size of the chosen reference at that reference's disc scale, so a local
// coordinate lands on the same place in both images by construction.
//
// This is the D12 artefact for this round. It is a picture, not a number.
//
// Run: node coloringbook/judge/_jy5side.mjs <lx> <ly> <half> <tag> [ref] [srcPath]
import sharp from 'sharp';
import { grey, DISCS, ourRaster, PENNY } from '../_pylib.mjs';

const LX = Number(process.argv[2]), LY = Number(process.argv[3]), HALF = Number(process.argv[4] || 12);
const TAG = process.argv[5] || 'side';
const FILE = process.argv[6] || 'penny-obv-2.jpg';
const SRC = process.argv[7] || '../../src/art/coins.js';
const OUT = 1000;
const D = DISCS[FILE];
const mod = await import(SRC.startsWith('.') ? SRC : `file://${SRC}`);

const vX = (lx) => 50 + PENNY.CX + PENNY.dir * PENNY.s * lx;
const vY = (ly) => PENNY.CY + PENNY.s * ly;
const pX = (v) => D.cx + (v - 50) / 47 * D.R, pY = (v) => D.cy + (v - 50) / 47 * D.R;
const left = pX(vX(LX - HALF)), top = pY(vY(LY - HALF)), wpx = pX(vX(LX + HALF)) - left;
const k = OUT / wpx;
const X = (lx) => (pX(vX(lx)) - left) * k, Y = (ly) => (pY(vY(ly)) - top) * k;

let g = '';
for (let x = Math.ceil(LX - HALF); x <= LX + HALF; x++) {
  const major = x % 4 === 0;
  g += `<line x1="${X(x).toFixed(1)}" y1="0" x2="${X(x).toFixed(1)}" y2="${OUT}" stroke="#00ff00" stroke-width="${major ? 1.4 : 0.6}" opacity="${major ? 0.8 : 0.25}"/>`;
  if (major) g += `<text x="${(X(x) + 3).toFixed(1)}" y="${OUT - 6}" font-family="monospace" font-size="16" fill="#00ff00">x=${x}</text>`;
}
for (let y = Math.ceil(LY - HALF); y <= LY + HALF; y++) {
  const major = y % 4 === 0;
  g += `<line x1="0" y1="${Y(y).toFixed(1)}" x2="${OUT}" y2="${Y(y).toFixed(1)}" stroke="#ffff00" stroke-width="${major ? 1.4 : 0.6}" opacity="${major ? 0.75 : 0.2}"/>`;
  if (major) g += `<text x="4" y="${(Y(y) - 4).toFixed(1)}" font-family="monospace" font-size="16" fill="#ffff00">y=${y}</text>`;
}
for (const P of (process.env.JY1_POLY || '').split('|').filter(Boolean)) {
  const [head, pts] = P.split(':'); const [col, ...lab] = head.trim().split(/\s+/);
  g += `<polyline fill="none" stroke="${col}" stroke-width="3" opacity="0.9" points="${pts.trim().split(/\s+/).map((p) => { const [a, b] = p.split(',').map(Number); return `${X(a).toFixed(1)},${Y(b).toFixed(1)}`; }).join(' ')}"/>`;
}

const photo = await grey(`coloringbook/ref/${FILE}`);
const our = await ourRaster(mod.coinSVG, D, photo.w, photo.h);
const ex = { left: Math.round(left), top: Math.round(top), width: Math.round(wpx), height: Math.round(wpx) };
const panes = [];
for (const [name, buf] of [[FILE, photo], ['OURS', our]]) {
  const base = await sharp(buf.d, { raw: { width: buf.w, height: buf.h, channels: 1 } })
    .extract(ex).resize(OUT, OUT, { fit: 'fill', kernel: 'nearest' }).toColourspace('srgb').png().toBuffer();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${OUT}" height="${OUT}">${g}`
    + `<rect x="0" y="0" width="${OUT}" height="24" fill="#000" opacity="0.6"/>`
    + `<text x="6" y="17" font-family="monospace" font-size="16" fill="#fff">${name} — local x ${LX - HALF}..${LX + HALF}, y ${LY - HALF}..${LY + HALF}</text></svg>`;
  panes.push(await sharp(base).composite([{ input: Buffer.from(svg) }]).png().toBuffer());
}
const out = `coloringbook/_pv/_jy5side-${TAG}.png`;
await sharp({ create: { width: 2 * OUT + 8, height: OUT, channels: 3, background: '#ffffff' } })
  .composite([{ input: panes[0], left: 0, top: 0 }, { input: panes[1], left: OUT + 8, top: 0 }]).toFile(out);
console.log('wrote', out);
