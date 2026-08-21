// ROUND 8, cent obverse — OUR HAIR AND BEARD OUTLINES ON EVERY SHAPE REFERENCE,
// cropped to a window in local units.
//
// `_jc5maskover.mjs` draws the whole coin on penny-obv-3 at 1000px, which is
// ~10 px per local unit — far too coarse to read a tip. This draws the same two
// contours on all three references that carry a frozen disc fit, cropped to a
// window, so the disagreement between references (and between ours and each of
// them) is visible at the scale of the feature.
//
// The transform chain is `_pylib`'s literals (PENNY.CX/CY/s/dir and DISCS),
// copied by import rather than restated, so this overlay and every scored
// number use one placement.
//
// §4.3 CONTROL: `--ctl` also draws the SAME contours 3 local units to the left.
// If the offset copy looks like it fits the photograph as well as the real one
// does, the overlay is not discriminating and nothing may be concluded from it.
//
// Run: node coloringbook/judge/_jh8over.mjs <lx> <ly> <half> <tag> [src] [--ctl]
import sharp from 'sharp';
import { flattenPath } from './_jqgeom.mjs';
import { DISCS, PENNY } from '../_pylib.mjs';

const LX = Number(process.argv[2]), LY = Number(process.argv[3]);
const HALF = Number(process.argv[4] || 10);
const TAG = process.argv[5] || 'over';
const SRC = process.argv[6] && !process.argv[6].startsWith('--') ? process.argv[6] : '../../src/art/coins.js';
const CTL = process.argv.includes('--ctl');
const OUT = 900;

const mod = await import(SRC.startsWith('.') ? SRC : `file://${SRC}`);
const svg = mod.coinSVG('penny', 380, { side: 'obverse' });
const ds = [...svg.matchAll(/<path\b[^>]*?\sd="([^"]*)"/g)].map((m) => m[1]);
const pick = (pre) => ds.find((d) => d.startsWith(pre));
const CONTOURS = [
  ['HEAD', 'M -20.39 18', '#00ff00'],
  ['HAIR', 'M 13.5 -27.05', '#ff2020'],
  ['BEARD', 'M 15.15 12.77', '#20a0ff'],
];

const vX = (lx) => 50 + PENNY.CX + PENNY.dir * PENNY.s * lx;
const vY = (ly) => PENNY.CY + PENNY.s * ly;

for (const [file, D] of Object.entries(DISCS)) {
  const pX = (v) => D.cx + (v - 50) / 47 * D.R, pY = (v) => D.cy + (v - 50) / 47 * D.R;
  const left = pX(vX(LX - HALF)), top = pY(vY(LY - HALF));
  const wpx = pX(vX(LX + HALF)) - left;
  const k = OUT / wpx;
  const X = (lx) => (pX(vX(lx)) - left) * k, Y = (ly) => (pY(vY(ly)) - top) * k;

  let g = '';
  for (const [name, pre, col] of CONTOURS) {
    const d = pick(pre);
    if (!d) { console.log(`  ${name}: path not found (start literal moved?) — skipped`); continue; }
    const P = flattenPath(d).pts;
    g += `<polyline fill="none" stroke="${col}" stroke-width="2.2" opacity="0.95" points="${P.map((p) => `${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ')}"/>`;
    if (CTL) g += `<polyline fill="none" stroke="${col}" stroke-width="1.6" stroke-dasharray="6 6" opacity="0.7" points="${P.map((p) => `${X(p.x - 3).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ')}"/>`;
    // knots as dots, so a knot can be named in the report
    for (const q of flattenPath(d).knots)
      g += `<circle cx="${X(q.x).toFixed(1)}" cy="${Y(q.y).toFixed(1)}" r="3" fill="${col}"/>`;
  }
  g += `<text x="6" y="18" font-family="monospace" font-size="15" fill="#ffff00">${file}  centre local (${LX}, ${LY}) half ${HALF}  ${(OUT / (2 * HALF)).toFixed(1)} px/local unit  src ${SRC.split('/').pop()}${CTL ? '   DASHED = same contours shifted 3 local units (CONTROL)' : ''}</text>`;
  g += `<text x="6" y="36" font-family="monospace" font-size="15" fill="#ffff00">green HEAD, red HAIR, blue BEARD; dots are authored knots</text>`;

  const meta = await sharp(`coloringbook/ref/${file}`).metadata();
  const ex = { left: Math.round(left), top: Math.round(top), width: Math.round(wpx), height: Math.round(wpx) };
  if (ex.left < 0 || ex.top < 0 || ex.left + ex.width > meta.width || ex.top + ex.height > meta.height) { console.log(`  ${file}: out of bounds — skipped`); continue; }
  const base = await sharp(`coloringbook/ref/${file}`).extract(ex).resize(OUT, OUT, { fit: 'fill' }).png().toBuffer();
  const out = `coloringbook/_pv/_jh8over-${TAG}-${file.replace(/\.\w+$/, '')}.png`;
  await sharp(base).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${OUT}" height="${OUT}">${g}</svg>`) }]).toFile(out);
  console.log(`wrote ${out}`);
}
