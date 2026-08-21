// ROUND 8, cent obverse — a CLEAN crop, drawn before any annotation.
//
// The round-8 fan (`_jh8fan.mjs`) at 5-degree spacing covers the feature it is
// supposed to measure: 72 rays over a 900px window leaves very little
// photograph visible. §4.3 / R6 say draw the located feature on the source and
// LOOK — which requires being able to see the source. So this writes the same
// window with nothing on it, and it is read FIRST, before the fan, so the
// reading is not made through a grid that suggests where the edges are.
//
// Same local-unit framing as _jh8fan.mjs so the two are directly comparable.
//
// Run: node coloringbook/judge/_jh8crop.mjs <lx> <ly> <tag> [halfLocal] [file]
import sharp from 'sharp';
import { DISCS, PENNY } from '../_pylib.mjs';

const LX = Number(process.argv[2]), LY = Number(process.argv[3]);
const TAG = process.argv[4] || 'crop';
const HALF = Number(process.argv[5] || 10);
const ONLY = process.argv[6] || null;
const OUT = 900;
const vX = (lx) => 50 + PENNY.CX + PENNY.dir * PENNY.s * lx;
const vY = (ly) => PENNY.CY + PENNY.s * ly;

for (const [file, D] of Object.entries(DISCS)) {
  if (ONLY && file !== ONLY) continue;
  const pX = (v) => D.cx + (v - 50) / 47 * D.R, pY = (v) => D.cy + (v - 50) / 47 * D.R;
  const left = pX(vX(LX - HALF)), top = pY(vY(LY - HALF));
  const wpx = pX(vX(LX + HALF)) - left;
  const meta = await sharp(`coloringbook/ref/${file}`).metadata();
  const ex = { left: Math.round(left), top: Math.round(top), width: Math.round(wpx), height: Math.round(wpx) };
  if (ex.left < 0 || ex.top < 0 || ex.left + ex.width > meta.width || ex.top + ex.height > meta.height) { console.log(`  ${file}: out of bounds — skipped`); continue; }
  const out = `coloringbook/_pv/_jh8crop-${TAG}-${file.replace(/\.\w+$/, '')}.png`;
  await sharp(`coloringbook/ref/${file}`).extract(ex).resize(OUT, OUT, { fit: 'fill' })
    .composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${OUT}" height="${OUT}"><text x="6" y="18" font-family="monospace" font-size="15" fill="#ffff00">${file} centre local (${LX}, ${LY}) half ${HALF} local units, ${(OUT / (2 * HALF)).toFixed(1)} px per local unit</text></svg>`) }])
    .toFile(out);
  console.log(`wrote ${out}`);
}
