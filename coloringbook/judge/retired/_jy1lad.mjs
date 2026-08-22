// ROUND (cent obverse, mid-jaw) — a LOCAL-UNIT LADDER, same idea as the frozen
// `_jh8ladder.mjs` (which is hashed and is not edited), with three additions
// this round needs:
//
//   1. it can read `penny-obv-4.png` — the fourth frozen obverse reference,
//      2000 px with a frozen disc fit in `judge/_jp1discs.json`, which
//      `_pylib.DISCS` does not carry and `_jh8ladder.mjs` therefore cannot draw;
//   2. `JY1_POLY="x,y;x,y;…"` draws an arbitrary polyline in LOCAL units, so a
//      boundary READ OFF this picture can be drawn back onto the picture and
//      checked (§4.3: publish the located feature and look at it);
//   3. `--nocontour` for the control pass — the reading is taken with our own
//      art NOT drawn, so the eye is not led by it (§3 D12 / Appendix Q5).
//
// DISC FITS. `_pylib.DISCS` is used where it has an entry, because that is the
// fit the frozen tone-patch loci are expressed in; `judge/_jp1discs.json` is
// used for `penny-obv-4.png` only. The two disagree for `penny-obv-3.jpg` by
// 3.7 px in cy (0.23 local units) and both are printed, not averaged (§4.2).
//
// Run: node coloringbook/judge/_jy1lad.mjs <lx> <ly> <half> <tag> [--ours] [--nocontour] [files…]
import sharp from 'sharp';
import { flattenPath } from './_jqgeom.mjs';
import { DISCS, PENNY, loadJSON } from '../_pylib.mjs';

const P1 = loadJSON(new URL('./_jp1discs.json', import.meta.url).pathname);
const FITS = { ...DISCS, 'penny-obv-4.png': { cx: P1['penny-obv-4.png'].cx, cy: P1['penny-obv-4.png'].cy, R: P1['penny-obv-4.png'].R } };

const LX = Number(process.argv[2]), LY = Number(process.argv[3]);
const HALF = Number(process.argv[4] || 12);
const TAG = process.argv[5] || 'lad';
const OURS = process.argv.includes('--ours');
const only = process.argv.slice(6).filter((a) => !a.startsWith('--'));
const FILES = only.length ? only : Object.keys(FITS);
const OUT = 1200;
const vX = (lx) => 50 + PENNY.CX + PENNY.dir * PENNY.s * lx;
const vY = (ly) => PENNY.CY + PENNY.s * ly;

let contours = [];
if (OURS) {
  const mod = await import('../../src/art/coins.js');
  const svg = mod.coinSVG('penny', 380, { side: 'obverse' });
  const ds = [...svg.matchAll(/<path\b[^>]*?\sd="([^"]*)"/g)].map((m) => m[1]);
  contours = [['M 13.5 -27.05', '#ff2020'], ['M 15.15 12.77', '#20a0ff']]
    .map(([pre, c]) => [flattenPath(ds.find((d) => d.startsWith(pre))).pts, c]);
}
// JY1_POLY = "#rrggbb label:x,y x,y x,y | #rrggbb label:…"  — LOCAL units.
const POLYS = (process.env.JY1_POLY || '').split('|').filter(Boolean).map((s) => {
  const [head, pts] = s.split(':');
  const [col, ...lab] = head.trim().split(/\s+/);
  return { col, label: lab.join(' '), pts: pts.trim().split(/\s+/).map((p) => { const [x, y] = p.split(',').map(Number); return { x, y }; }) };
});

for (const file of FILES) {
  const D = FITS[file];
  const pX = (v) => D.cx + (v - 50) / 47 * D.R, pY = (v) => D.cy + (v - 50) / 47 * D.R;
  const left = pX(vX(LX - HALF)), top = pY(vY(LY - HALF));
  const wpx = pX(vX(LX + HALF)) - left;
  const k = OUT / wpx;
  const X = (lx) => (pX(vX(lx)) - left) * k, Y = (ly) => (pY(vY(ly)) - top) * k;

  let g = '';
  for (let x = Math.ceil(LX - HALF); x <= LX + HALF; x++) {
    const major = x % 4 === 0;
    g += `<line x1="${X(x).toFixed(1)}" y1="0" x2="${X(x).toFixed(1)}" y2="${OUT}" stroke="${major ? '#00ff00' : '#00ffff'}" stroke-width="${major ? 1.4 : 0.7}" opacity="${major ? 0.75 : 0.28}"/>`;
    if (major) g += `<text x="${(X(x) + 3).toFixed(1)}" y="${OUT - 6}" font-family="monospace" font-size="17" fill="#00ff00">x=${x}</text>`;
  }
  for (let y = Math.ceil(LY - HALF); y <= LY + HALF; y++) {
    const major = y % 4 === 0;
    g += `<line x1="0" y1="${Y(y).toFixed(1)}" x2="${OUT}" y2="${Y(y).toFixed(1)}" stroke="${major ? '#ffff00' : '#ffaa00'}" stroke-width="${major ? 1.4 : 0.7}" opacity="${major ? 0.7 : 0.22}"/>`;
    if (major) g += `<text x="4" y="${(Y(y) - 4).toFixed(1)}" font-family="monospace" font-size="17" fill="#ffff00">y=${y}</text>`;
  }
  for (const b of (process.env.JY1_BOX || '').split(';').filter(Boolean)) {
    const [x0, y0, x1, y1] = b.split(',').map(Number);
    g += `<rect x="${X(x0).toFixed(1)}" y="${Y(y0).toFixed(1)}" width="${(X(x1) - X(x0)).toFixed(1)}" height="${(Y(y1) - Y(y0)).toFixed(1)}" fill="none" stroke="#ff00ff" stroke-width="3"/>`;
  }
  for (const c of (process.env.JY1_CIRC || '').split(';').filter(Boolean)) {
    const [cx, cy, r, label] = c.split(',');
    g += `<circle cx="${X(+cx).toFixed(1)}" cy="${Y(+cy).toFixed(1)}" r="${(+r * PENNY.s / 47 * D.R * k).toFixed(1)}" fill="none" stroke="#ff00ff" stroke-width="3"/>`
      + `<text x="${(X(+cx) + 6).toFixed(1)}" y="${(Y(+cy) - 6).toFixed(1)}" font-family="monospace" font-size="17" fill="#ff00ff">${label || ''}</text>`;
  }
  let li = 0;
  for (const P of POLYS) {
    g += `<polyline fill="none" stroke="${P.col}" stroke-width="3.2" opacity="0.95" points="${P.pts.map((p) => `${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ')}"/>`;
    g += `<rect x="0" y="${28 + li * 22}" width="${8 + 10 * P.label.length}" height="21" fill="#000" opacity="0.5"/>`
      + `<text x="5" y="${43 + li * 22}" font-family="monospace" font-size="16" fill="${P.col}">${P.label}</text>`;
    li++;
  }
  for (const [PP, c] of contours)
    // flattenPath returns points in Lincoln's LOCAL frame already (the
    // placement is a transform on the group), so they go straight through X/Y.
    g += `<polyline fill="none" stroke="${c}" stroke-width="2.4" opacity="0.95" points="${PP.map((p) => `${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ')}"/>`;
  g += `<rect x="0" y="0" width="${OUT}" height="24" fill="#000" opacity="0.55"/><text x="6" y="17" font-family="monospace" font-size="16" fill="#ffffff">${file} — LOCAL grid, 1 unit, green/yellow every 4. ${(OUT / (2 * HALF)).toFixed(1)} px/unit (source ${(PENNY.s / 47 * D.R).toFixed(1)} px/unit)${OURS ? '. red HAIR, blue BEARD (ours)' : ''}</text>`;

  const meta = await sharp(`coloringbook/ref/${file}`).metadata();
  const ex = { left: Math.round(left), top: Math.round(top), width: Math.round(wpx), height: Math.round(wpx) };
  if (ex.left < 0 || ex.top < 0 || ex.left + ex.width > meta.width || ex.top + ex.height > meta.height) { console.log(`  ${file}: out of bounds — skipped`); continue; }
  const base = await sharp(`coloringbook/ref/${file}`).extract(ex).resize(OUT, OUT, { fit: 'fill', kernel: 'nearest' }).png().toBuffer();
  const out = `coloringbook/_pv/_jy1lad-${TAG}-${file.replace(/\.\w+$/, '')}.png`;
  await sharp(base).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${OUT}" height="${OUT}">${g}</svg>`) }]).toFile(out);
  console.log(`wrote ${out}`);
}
