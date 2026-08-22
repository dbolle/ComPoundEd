// SPECIALIST round, cent obverse — the §4.3 / Appendix R6 OVERLAY for knot 7.
//
// "Every located feature publishes an overlay artefact by filename in the
// scorecard, and a dimension whose instrument locates a feature without a
// published overlay is UNTRUSTED." D7 locates a knot. This draws it.
//
// What is drawn, on every reference that carries a frozen disc fit:
//   · the whole `BEARD` contour, with EVERY knot numbered, so "knot 7" can be
//     checked against the index the instrument prints rather than assumed;
//   · at knot 7, the incoming and outgoing tangent rays as the SHIPPED path
//     has them (the 85.0 deg break), in two colours;
//   · the same two rays for candidate A (the collinear repair that meets the
//     gate), dashed, so the difference between "the tip" and "the repair" is
//     visible on the photograph rather than argued from a table.
//
// CONTROL. `--ctl` draws the identical figure 3 local units to the left. If the
// offset copy sits on the coin's relief as convincingly as the real one, this
// overlay is not discriminating and nothing may be read off it (this is
// _jh8over.mjs's control, kept because it is the right one).
//
// Run: node coloringbook/judge/_sb7over.mjs [half] [--ctl]
import sharp from 'sharp';
import { flattenPath } from './_jqgeom.mjs';
import { DISCS, PENNY } from '../_pylib.mjs';

const ROOT = new URL('../../', import.meta.url).pathname;
const { coinSVG } = await import(`${ROOT}src/art/coins.js`);
const HALF = Number(process.argv[2] || 10);
const CTL = process.argv.includes('--ctl');
const DX = CTL ? -3 : 0;
const OUT = 1000;
const LX = -18.85 + DX, LY = 4;

const d = [...coinSVG('penny', 380, { side: 'obverse' }).matchAll(/<path\b[^>]*?\sd="([^"]*)"/g)]
  .map((m) => m[1]).find((x) => x.startsWith('M 15.15 12.77'));
const knots = [...d.matchAll(/C\s*[-\d.]+\s+[-\d.]+\s+[-\d.]+\s+[-\d.]+\s+([-\d.]+)\s+([-\d.]+)/g)]
  .map((m) => [Number(m[1]), Number(m[2])]);
knots.unshift([15.15, 12.77]);          // the M point is knot 0
const flat = flattenPath(d, 96).pts;

const P = [-18.85, 4], CIN = [-17.84, 7.14], COUT = [-18.02, 3.65];
const norm = (a) => { const n = Math.hypot(...a); return [a[0] / n, a[1] / n]; };
const tIn = norm([P[0] - CIN[0], P[1] - CIN[1]]);       // arriving direction
const tOut = norm([COUT[0] - P[0], COUT[1] - P[1]]);    // leaving direction
const RAY = 6;                                          // local units

const vX = (lx) => 50 + PENNY.CX + PENNY.dir * PENNY.s * lx;
const vY = (ly) => PENNY.CY + PENNY.s * ly;

for (const [file, D] of Object.entries(DISCS)) {
  const pX = (v) => D.cx + (v - 50) / 47 * D.R, pY = (v) => D.cy + (v - 50) / 47 * D.R;
  const left = pX(vX(LX - HALF)), top = pY(vY(LY - HALF));
  const wpx = pX(vX(LX + HALF)) - left;
  const k = OUT / wpx;
  const X = (lx) => (pX(vX(lx + DX)) - left) * k, Y = (ly) => (pY(vY(ly)) - top) * k;

  let g = `<polyline points="${flat.map((p) => `${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ')}" fill="none" stroke="#20a0ff" stroke-width="2"/>`;
  knots.forEach((q, i) => {
    g += `<circle cx="${X(q[0]).toFixed(1)}" cy="${Y(q[1]).toFixed(1)}" r="${i === 7 ? 6 : 3.5}" fill="${i === 7 ? '#ffff00' : '#20a0ff'}"/>`;
    g += `<text x="${(X(q[0]) + 7).toFixed(1)}" y="${(Y(q[1]) - 6).toFixed(1)}" font-family="monospace" font-size="17" fill="${i === 7 ? '#ffff00' : '#a0d8ff'}">${i}</text>`;
  });
  // shipped tangents: arriving ray drawn BACK from the tip, leaving ray forward
  const ray = (dir, sign, colour, dash) =>
    `<line x1="${X(P[0]).toFixed(1)}" y1="${Y(P[1]).toFixed(1)}" x2="${X(P[0] + sign * RAY * dir[0]).toFixed(1)}" y2="${Y(P[1] + sign * RAY * dir[1]).toFixed(1)}" stroke="${colour}" stroke-width="2.4"${dash ? ' stroke-dasharray="7 6"' : ''}/>`;
  g += ray(tIn, -1, '#ff3030', false);      // where the rear edge came from
  g += ray(tOut, +1, '#00ff66', false);     // where the top edge goes
  g += ray(tIn, +1, '#00ff66', true);       // candidate A's leaving ray = the arriving direction
  g += `<text x="8" y="22" font-family="monospace" font-size="17" fill="#ffff00">${file}  BEARD, knots numbered; knot 7 = (-18.85, 4.00)${CTL ? '   *** CONTROL: whole figure shifted -3 local units ***' : ''}</text>`;
  g += `<text x="8" y="44" font-family="monospace" font-size="17" fill="#ffff00">RED = rear edge arriving   GREEN solid = top edge leaving (the 85.0 break)   GREEN dashed = candidate A, collinear, gate met</text>`;
  g += `<text x="8" y="66" font-family="monospace" font-size="17" fill="#ffff00">${(wpx / (2 * HALF)).toFixed(2)} SOURCE px per local unit — the 0.5-unit rung the ladder disputes is ${(wpx / (2 * HALF) * 0.5).toFixed(1)} source px</text>`;

  const meta = await sharp(`coloringbook/ref/${file}`).metadata();
  const ex = { left: Math.round(left), top: Math.round(top), width: Math.round(wpx), height: Math.round(wpx) };
  if (ex.left < 0 || ex.top < 0 || ex.left + ex.width > meta.width || ex.top + ex.height > meta.height) { console.log(`  ${file}: out of bounds — skipped`); continue; }
  const out = `coloringbook/_pv/_sb7over${CTL ? '-CTL' : ''}-${file.replace(/\.\w+$/, '')}.png`;
  await sharp(`coloringbook/ref/${file}`).extract(ex).resize(OUT, OUT, { fit: 'fill' })
    .composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${OUT}" height="${OUT}">${g}</svg>`) }]).toFile(out);
  console.log(`wrote ${out}   (${(wpx / (2 * HALF)).toFixed(2)} source px per local unit)`);
}
