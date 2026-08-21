// ROUND 8, cent obverse — RAY FAN ON EVERY SHAPE REFERENCE, not just one.
//
// `_jc5tip.mjs` draws the fan on `_pylib.REF` only (penny-obv-3.jpg). The brief
// asks for the between-reference spread, and `penny-gates.md` excludes
// penny-obv-2.jpg from anything PHOTOMETRIC only — for SHAPE a cameo proof is
// the best reference there is (COIN-ART-METHOD §20.3). So this draws the same
// fan, at the same local scale, on all three references that carry a frozen
// disc fit in `_pylib.DISCS`, and writes one PNG per reference so the three can
// be read independently and their disagreement reported rather than averaged.
//
// SCALE IS PINNED IN LOCAL UNITS, not pixels. The three photographs are
// 500 / 900 / 2000 px, so a fixed pixel radius would read the tip at three
// different physical scales and the spread would be an artefact of that. Every
// fan here spans `2*HALF` local units and its rays run to `RAYLEN` local units,
// printed on the image, because a tip's included angle is a function of the
// radius you read it at (this round's central finding: ours reads 76.9 deg at
// 0.5 units and 40.6 at 8).
//
// CONTROL (§4.3, and _jc5tip's own precedent): pass `cheek` as the tag to put
// the identical fan on the middle of the cheek, where there is no corner. If a
// fan "shows" a wedge there, the wedge is being supplied by the reader.
//
// Run: node coloringbook/judge/_jh8fan.mjs <lx> <ly> <tag> [rayLenLocal]
import sharp from 'sharp';
import { DISCS, PENNY } from '../_pylib.mjs';

const LX = Number(process.argv[2]), LY = Number(process.argv[3]);
const TAG = process.argv[4] || 'tip';
const RAYLEN = Number(process.argv[5] || 8);      // local units — pinned, printed
const HALF = 10;                                  // local units either side of the tip
const OUT = 900;

const vX = (lx) => 50 + PENNY.CX + PENNY.dir * PENNY.s * lx;
const vY = (ly) => PENNY.CY + PENNY.s * ly;

for (const [file, D] of Object.entries(DISCS)) {
  const pX = (v) => D.cx + (v - 50) / 47 * D.R;
  const pY = (v) => D.cy + (v - 50) / 47 * D.R;
  const left = pX(vX(LX - HALF)), top = pY(vY(LY - HALF));
  const wpx = pX(vX(LX + HALF)) - left;
  const k = OUT / wpx;                                  // output px per source px
  const perLocal = (OUT / (2 * HALF));                  // output px per LOCAL unit
  const cx = (pX(vX(LX)) - left) * k, cy = (pY(vY(LY)) - top) * k;
  const R = RAYLEN * perLocal;

  // Rays start at INNER (local units) and run to RAYLEN, so the feature the fan
  // is measuring is never covered by the fan. A 5-degree fan drawn from the
  // centre put 72 lines over the tip and made it unreadable — the first version
  // of this file did exactly that, and the crop had to be read separately.
  const INNER = Number(process.env.JH8_INNER || 1.8) * perLocal;
  let g = '';
  for (let a = 0; a < 360; a += 5) {
    const t = a * Math.PI / 180;
    const major = a % 45 === 0, minor = a % 15 === 0;
    g += `<line x1="${(cx + INNER * Math.cos(t)).toFixed(1)}" y1="${(cy + INNER * Math.sin(t)).toFixed(1)}" x2="${(cx + R * Math.cos(t)).toFixed(1)}" y2="${(cy + R * Math.sin(t)).toFixed(1)}" stroke="${major ? '#00ff00' : minor ? '#ff00ff' : '#00ffff'}" stroke-width="${major ? 2 : 1}" opacity="${major ? 0.9 : minor ? 0.55 : 0.3}"/>`;
    if (minor) g += `<text x="${(cx + (R + 8) * Math.cos(t)).toFixed(1)}" y="${(cy + (R + 8) * Math.sin(t)).toFixed(1)}" font-family="monospace" font-size="15" fill="${major ? '#00ff00' : '#ff66ff'}">${a}</text>`;
  }
  // radius ticks at 2, 4, 6, 8 local units, so an angle can be read AT a radius
  for (const r of [2, 4, 6, 8].filter((r) => r <= RAYLEN))
    g += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(r * perLocal).toFixed(1)}" fill="none" stroke="#ffff00" stroke-width="1" opacity="0.5"/>`;
  g += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4" fill="#ffff00"/>`;
  g += `<text x="6" y="20" font-family="monospace" font-size="16" fill="#ffff00">${file}  local (${LX}, ${LY})  ${perLocal.toFixed(1)} px/local unit  rays to ${RAYLEN} local units</text>`;
  g += `<text x="6" y="40" font-family="monospace" font-size="16" fill="#ffff00">rays every 5 deg; magenta 15; green 45. yellow circles at 2/4/6/8 local units. screen convention: 0 = +x (toward the face), 90 = DOWN</text>`;

  const meta = await sharp(`coloringbook/ref/${file}`).metadata();
  const ex = { left: Math.round(left), top: Math.round(top), width: Math.round(wpx), height: Math.round(wpx) };
  if (ex.left < 0 || ex.top < 0 || ex.left + ex.width > meta.width || ex.top + ex.height > meta.height) {
    console.log(`  ${file}: window out of bounds — SKIPPED (${JSON.stringify(ex)} vs ${meta.width}x${meta.height})`);
    continue;
  }
  const base = await sharp(`coloringbook/ref/${file}`).extract(ex).resize(OUT, OUT, { fit: 'fill' }).png().toBuffer();
  const out = `coloringbook/_pv/_jh8fan-${TAG}-${file.replace(/\.\w+$/, '')}.png`;
  await sharp(base).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${OUT}" height="${OUT}">${g}</svg>`) }]).toFile(out);
  console.log(`wrote ${out}  (source px per local unit ${(wpx / (2 * HALF)).toFixed(2)}; upscale ${k.toFixed(2)}x)`);
}
