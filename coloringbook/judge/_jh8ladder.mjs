// ROUND 8, cent obverse — a LOCAL-UNIT LADDER on the references, so a boundary
// that no detector can segment can still be read off by hand.
//
// Appendix R3: "BLOCKED means no artefact we have can measure it. It does not
// mean the instrument I built cannot measure it. Before a BLOCKED is recorded,
// draw the feature's candidate location on the source at full resolution and
// look." The quarter's lettering band was settled exactly this way — a radius
// ladder drawn on the photograph and read by eye — after two rounds of being
// called unmeasurable.
//
// This draws a grid of vertical lines at whole local x, with ticks and labels
// every 2 local units of y, over each reference, and (optionally) our own
// contours on top. A reading taken off it is a HAND ANNOTATION: reproducible
// because this generator is committed, and visible because the artefact is a
// PNG anyone can re-read.
//
// CONTROL. The ladder is drawn from `_pylib`'s frozen placement literals and is
// identical on all three references by construction, so a feature that reads at
// a different local coordinate on two references is a real disagreement between
// the coins and not a framing error. That between-reference spread is the only
// error bar this reading has, and it is reported rather than averaged away.
//
// Run: node coloringbook/judge/_jh8ladder.mjs <lx> <ly> <half> <tag> [--ours]
import sharp from 'sharp';
import { flattenPath } from './_jqgeom.mjs';
import { DISCS, PENNY } from '../_pylib.mjs';

const LX = Number(process.argv[2]), LY = Number(process.argv[3]);
const HALF = Number(process.argv[4] || 14);
const TAG = process.argv[5] || 'ladder';
const OURS = process.argv.includes('--ours');
const OUT = 1000;
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

for (const [file, D] of Object.entries(DISCS)) {
  const pX = (v) => D.cx + (v - 50) / 47 * D.R, pY = (v) => D.cy + (v - 50) / 47 * D.R;
  const left = pX(vX(LX - HALF)), top = pY(vY(LY - HALF));
  const wpx = pX(vX(LX + HALF)) - left;
  const k = OUT / wpx;
  const X = (lx) => (pX(vX(lx)) - left) * k, Y = (ly) => (pY(vY(ly)) - top) * k;

  let g = '';
  for (let x = Math.ceil(LX - HALF); x <= LX + HALF; x++) {
    const major = x % 4 === 0;
    g += `<line x1="${X(x).toFixed(1)}" y1="0" x2="${X(x).toFixed(1)}" y2="${OUT}" stroke="${major ? '#00ff00' : '#00ffff'}" stroke-width="${major ? 1.4 : 0.7}" opacity="${major ? 0.75 : 0.3}"/>`;
    if (major) g += `<text x="${(X(x) + 3).toFixed(1)}" y="${OUT - 6}" font-family="monospace" font-size="15" fill="#00ff00">x=${x}</text>`;
  }
  for (let y = Math.ceil(LY - HALF); y <= LY + HALF; y++) {
    const major = y % 4 === 0;
    g += `<line x1="0" y1="${Y(y).toFixed(1)}" x2="${OUT}" y2="${Y(y).toFixed(1)}" stroke="${major ? '#ffff00' : '#ffaa00'}" stroke-width="${major ? 1.4 : 0.7}" opacity="${major ? 0.7 : 0.25}"/>`;
    if (major) g += `<text x="4" y="${(Y(y) - 4).toFixed(1)}" font-family="monospace" font-size="15" fill="#ffff00">y=${y}</text>`;
  }
  // JH8_BOX="x0,y0,x1,y1[;…]" draws rectangles in LOCAL units. Used to put
  // COIN-ART-METHOD §20.8's published ear-helix literal (local x -16..-9,
  // y -10..+3) on the photograph, so the ear's position in this report is
  // anchored to a number already in the method doc rather than to my eye. If
  // the box does not land on the ear, the literal is wrong and that is the
  // finding (§1.1: report, do not fix).
  for (const b of (process.env.JH8_BOX || '').split(';').filter(Boolean)) {
    const [x0, y0, x1, y1] = b.split(',').map(Number);
    g += `<rect x="${X(x0).toFixed(1)}" y="${Y(y0).toFixed(1)}" width="${(X(x1) - X(x0)).toFixed(1)}" height="${(Y(y1) - Y(y0)).toFixed(1)}" fill="none" stroke="#ff00ff" stroke-width="3"/>`;
    g += `<text x="${(X(x0) + 4).toFixed(1)}" y="${(Y(y0) - 6).toFixed(1)}" font-family="monospace" font-size="15" fill="#ff00ff">local ${x0}..${x1}, ${y0}..${y1}</text>`;
  }
  for (const [P, c] of contours)
    g += `<polyline fill="none" stroke="${c}" stroke-width="2.4" opacity="0.95" points="${P.map((p) => `${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ')}"/>`;
  g += `<rect x="0" y="0" width="${OUT}" height="22" fill="#000" opacity="0.55"/><text x="6" y="16" font-family="monospace" font-size="15" fill="#ffffff">${file} — LOCAL grid, 1 unit spacing, green/yellow every 4. ${(OUT / (2 * HALF)).toFixed(1)} px per local unit${OURS ? '. red HAIR, blue BEARD (ours)' : ''}</text>`;

  const meta = await sharp(`coloringbook/ref/${file}`).metadata();
  const ex = { left: Math.round(left), top: Math.round(top), width: Math.round(wpx), height: Math.round(wpx) };
  if (ex.left < 0 || ex.top < 0 || ex.left + ex.width > meta.width || ex.top + ex.height > meta.height) { console.log(`  ${file}: out of bounds — skipped`); continue; }
  const base = await sharp(`coloringbook/ref/${file}`).extract(ex).resize(OUT, OUT, { fit: 'fill' }).png().toBuffer();
  const out = `coloringbook/_pv/_jh8ladder-${TAG}-${file.replace(/\.\w+$/, '')}.png`;
  await sharp(base).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${OUT}" height="${OUT}">${g}</svg>`) }]).toFile(out);
  console.log(`wrote ${out}`);
}
