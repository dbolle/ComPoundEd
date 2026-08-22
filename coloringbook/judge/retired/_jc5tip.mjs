// ROUND 5, cent obverse — the HAND ANNOTATION for D7 (§2.1 / Appendix R3: an
// overlay read off the source is a legitimate target when no detector can find
// the feature). The two over-75 knots are TIPS: the sideburn's and the beard's.
// A tip's turn angle is 180 minus its INCLUDED angle, so "is 144.5 deg too much"
// is the question "does the coin taper this feature to about 35 deg".
//
// Neither tip is on the head mask (they are boundaries between two tone regions,
// and the mask is a silhouette), so the chord estimator in `_jc5corner.mjs` has
// no target to measure. What is left is to draw a RAY FAN centred on the tip,
// every 15 deg, labelled, and read the included angle off the photograph.
//
// Run: node coloringbook/judge/_jc5tip.mjs <lx> <ly> <tag>
import sharp from 'sharp';
import { DISC, REF } from '../_pylib.mjs';

const LX = Number(process.argv[2]), LY = Number(process.argv[3]), TAG = process.argv[4] || 'tip';
const PLACE = { s: 0.78, cx: 3.88, cy: 40.0 };
const HALF = 9;                                     // local units either side
const OUT = 820;
const vX = (lx) => 50 + PLACE.cx + PLACE.s * lx;
const vY = (ly) => PLACE.cy + PLACE.s * ly;
const pX = (v) => DISC.cx + (v - 50) / 47 * DISC.R;
const pY = (v) => DISC.cy + (v - 50) / 47 * DISC.R;
const left = pX(vX(LX - HALF)), top = pY(vY(LY - HALF));
const wpx = pX(vX(LX + HALF)) - left;
const k = OUT / wpx;
const cx = (pX(vX(LX)) - left) * k, cy = (pY(vY(LY)) - top) * k;
const R = OUT * 0.46;

let g = '';
for (let a = 0; a < 360; a += 15) {
  const t = a * Math.PI / 180;
  const bold = a % 45 === 0;
  g += `<line x1="${cx.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${(cx + R * Math.cos(t)).toFixed(1)}" y2="${(cy + R * Math.sin(t)).toFixed(1)}" stroke="${bold ? '#00ff00' : '#ff00ff'}" stroke-width="${bold ? 2 : 1}" opacity="0.85"/>`;
  if (bold) g += `<text x="${(cx + (R + 6) * Math.cos(t)).toFixed(1)}" y="${(cy + (R + 6) * Math.sin(t)).toFixed(1)}" font-family="monospace" font-size="16" fill="#00ff00">${a}</text>`;
}
g += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="5" fill="#ffff00"/>`;
g += `<text x="6" y="20" font-family="monospace" font-size="16" fill="#ffff00">tip at local (${LX}, ${LY}); rays every 15 deg, screen convention (0 = +x, 90 = DOWN)</text>`;

const base = await sharp(REF).extract({ left: Math.round(left), top: Math.round(top), width: Math.round(wpx), height: Math.round(wpx) })
  .resize(OUT, OUT, { fit: 'fill' }).png().toBuffer();
await sharp(base).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${OUT}" height="${OUT}">${g}</svg>`) }])
  .toFile(`coloringbook/_pv/_jc5tip-${TAG}.png`);
console.log(`wrote coloringbook/_pv/_jc5tip-${TAG}.png  (window ${2 * HALF} local units across, ${(OUT / (2 * HALF)).toFixed(1)} px per local unit)`);
