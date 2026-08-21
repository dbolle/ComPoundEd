// ROUND 5, cent obverse — §4.3 OVERLAY for D7. Draw the frozen head mask, our
// three fitted contours, and the two over-75 knots, all in the same local frame,
// over the reference photograph. Also flags where the mask's own chord-angle
// estimator reads over 120 deg, so a control that looks alarming in a table can
// be looked at instead of argued about.
//
// Run: node coloringbook/judge/_jc5maskover.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { flattenPath } from './_jqgeom.mjs';
import * as B from '../_nkbuild.mjs';
import { DISC, REF } from '../_pylib.mjs';

const M = JSON.parse(readFileSync('coloringbook/_headmask-penny.json', 'utf8'));
const PLACE = { s: 0.78, cx: 3.88, cy: 40.0 };
const toLocal = ([u, v]) => [(50 + 47 * u - 50 - PLACE.cx) / PLACE.s, (50 + 47 * v - PLACE.cy) / PLACE.s];
const RAW = M.poly.map(toLocal);
const SM = B.smooth(RAW, 34, []);

// local -> screen(viewBox 100) -> photograph px -> output px
const OUT = 1000, SPAN = 1.0;                        // +-1.0 disc radii across
const k = OUT / (2 * SPAN * DISC.R);
const X = (lx) => ((DISC.cx + ((50 + PLACE.cx + PLACE.s * lx) - 50) / 47 * DISC.R) - (DISC.cx - SPAN * DISC.R)) * k;
const Y = (ly) => ((DISC.cy + ((PLACE.cy + PLACE.s * ly) - 50) / 47 * DISC.R) - (DISC.cy - SPAN * DISC.R)) * k;
const poly = (P, c, w) => `<polyline fill="none" stroke="${c}" stroke-width="${w}" points="${P.map((p) => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(' ')}"/>`;

const mod = await import('../../src/art/coins.js');
const svg = mod.coinSVG('penny', 380, { side: 'obverse' });
const ds = [...svg.matchAll(/<path\b[^>]*?\sd="([^"]*)"/g)].map((m) => m[1]);
const pick = (pre) => ds.find((d) => d.startsWith(pre));
const ours = (pre, c) => poly(flattenPath(pick(pre)).pts.map((p) => [p.x, p.y]), c, 2.5);

// where the smoothed mask's own chord estimator reads high, at the span our
// knots actually sit at (5-6 local units)
const seglen = (P, i) => Math.hypot(P[(i + 1) % P.length][0] - P[i][0], P[(i + 1) % P.length][1] - P[i][1]);
function chordAngle(P, i, span) {
  const n = P.length, at = (j) => P[((j % n) + n) % n];
  const w = (dir) => { let d = 0, kk = i; while (d < span) { d += dir > 0 ? seglen(P, ((kk % n) + n) % n) : seglen(P, ((kk - 1) % n + n) % n); kk += dir; if (Math.abs(kk - i) > n) break; } return at(kk); };
  const a = w(-1), b = at(i), c = w(+1);
  let t = Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(b[1] - a[1], b[0] - a[0]);
  while (t > Math.PI) t -= 2 * Math.PI; while (t < -Math.PI) t += 2 * Math.PI;
  return Math.abs(t * 180 / Math.PI);
}
let hot = '';
let nHot = 0;
for (let i = 0; i < SM.length; i++) {
  const a = chordAngle(SM, i, 6);
  if (a > 120) { nHot++; hot += `<circle cx="${X(SM[i][0]).toFixed(1)}" cy="${Y(SM[i][1]).toFixed(1)}" r="4" fill="#ff2020"/>`; }
}
console.log(`mask vertices whose 6-unit chord angle exceeds 120 deg: ${nHot} of ${SM.length}`);

const KN = [['HAIR 144.5', -19.03, 11.99, '#ffff00'], ['BEARD 95.7', -17.28, 8.63, '#00ff00']];
let marks = '';
for (const [nm, lx, ly, c] of KN)
  marks += `<circle cx="${X(lx).toFixed(1)}" cy="${Y(ly).toFixed(1)}" r="11" fill="none" stroke="${c}" stroke-width="3"/>`
    + `<text x="${(X(lx) + 15).toFixed(1)}" y="${(Y(ly) + 5).toFixed(1)}" font-family="monospace" font-size="20" fill="${c}">${nm}</text>`;

const over = `<svg xmlns="http://www.w3.org/2000/svg" width="${OUT}" height="${OUT}">`
  + poly([...SM, SM[0]], '#00c8ff', 2)
  + ours('M -20.39 18', '#ff00ff') + ours('M 13.5 -27.05', '#ff8000') + ours('M 15.15 12.77', '#ffffff')
  + hot + marks
  + `<text x="8" y="24" font-family="monospace" font-size="18" fill="#00c8ff">cyan = frozen mask (smoothed x34)</text>`
  + `<text x="8" y="46" font-family="monospace" font-size="18" fill="#ff00ff">magenta = HEAD   orange = HAIR   white = BEARD   red = mask chord angle &gt; 120 deg at span 6</text>`
  + `</svg>`;

const base = await sharp(REF).extract({
  left: Math.round(DISC.cx - SPAN * DISC.R), top: Math.round(DISC.cy - SPAN * DISC.R),
  width: Math.round(2 * SPAN * DISC.R), height: Math.round(2 * SPAN * DISC.R),
}).resize(OUT, OUT, { fit: 'fill' }).png().toBuffer();
await sharp(base).composite([{ input: Buffer.from(over) }]).toFile('coloringbook/_pv/_jc5maskover.png');
console.log('wrote coloringbook/_pv/_jc5maskover.png');
