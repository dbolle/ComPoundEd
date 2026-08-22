// ROUND 7, QUARTER OBVERSE — spec 4.3: draw the located feature on the source
// and LOOK at it. Here the "located feature" is every one of our own drawn
// marks, plotted on the photograph in the photograph's own pixels, so that
// before any width is measured perpendicular to one of our centrelines it is
// visible whether that centreline is sitting on the coin's feature at all.
//
// This is the check that decides whether a width profile means anything. A
// perpendicular sample taken across a centreline that misses the coin's cut by
// three units measures the field, and reports a confident number for it.
//
// viewBox -> image px is the file's own definition (COIN-ART-METHOD, and
// `_jd6edge.mjs` states it): X = 50 + 47 (px - cx) / R, inverted.
//
// Colour code:  cyan  = stroke-rendered marks (the D6 subjects)
//               red   = the four ranked highest, labelled by rank
//               green = filled regions, for context
//
// Run: node coloringbook/judge/_jq7over.mjs [ref] [size]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { marks } from './_jqgeom.mjs';

const REF = process.argv[2] || 'quarter-obv-1932ngc.jpg';
const SIZE = Number(process.argv[3] || 84);
const FITS = JSON.parse(readFileSync('coloringbook/judge/_jq7fit.json'));
const FROZEN = { 'quarter-obv-2.jpg': { cx: 374.41, cy: 374.36, R: 373.67 } }; // _r3d13.mjs
const D = FROZEN[REF] || FITS[REF];
if (!D) throw new Error(`no disc fit for ${REF} — run _jq7fit.mjs first`);

const mod = await import('../../src/art/coins.js');
const svg = mod.coinSVG('quarter', SIZE, { side: 'obverse' });
const isBlankOrField = (m) => m.el === 'circle'
  && Math.abs(m.bbox.x0 + m.bbox.x1 - 100) < 1e-6 && (m.bbox.x1 - m.bbox.x0) / 2 > 35;
const isSpecular = (m) => m.stroke === '#ffffff' && Math.abs(m.opacity - 0.26) < 1e-6;
const all = marks(svg).slice(1).filter((m) => !isBlankOrField(m) && !isSpecular(m));

export const toPx = (p) => ({ x: D.cx + (D.R * (p.x - 50)) / 47, y: D.cy + (D.R * (p.y - 50)) / 47 });
const plen = (P) => { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y); return L; };

const strokes = all.filter((m) => m.isStroke).sort((a, b) => plen(b.pts) - plen(a.pts));
const regions = all.filter((m) => !m.isStroke);

const poly = (m, col, w) => `<polyline points="${m.pts.map((p) => { const q = toPx(p); return `${q.x.toFixed(1)},${q.y.toFixed(1)}`; }).join(' ')}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
const meta = await sharp(`coloringbook/ref/${REF}`).metadata();
const sc = D.R / 373.67;
const parts = [];
for (const m of regions) parts.push(poly(m, '#00ff00', 2 * sc));
strokes.forEach((m, i) => {
  parts.push(poly(m, i < 4 ? '#ff0000' : '#00ffff', (i < 4 ? 3 : 2) * sc));
  const q = toPx(m.pts[0]);
  parts.push(`<text x="${(q.x + 4 * sc).toFixed(1)}" y="${q.y.toFixed(1)}" font-family="monospace" font-size="${(14 * sc).toFixed(0)}" fill="#ff00ff">${i + 1}</text>`);
});
const out = `<svg xmlns="http://www.w3.org/2000/svg" width="${meta.width}" height="${meta.height}">`
  + `<circle cx="${D.cx}" cy="${D.cy}" r="${(D.R * 44.07 / 47).toFixed(1)}" fill="none" stroke="#ffff00" stroke-width="${1.5 * sc}" opacity="0.6"/>`
  + parts.join('')
  + `<text x="10" y="${(24 * sc).toFixed(0)}" font-family="monospace" font-size="${(18 * sc).toFixed(0)}" fill="#ff0000">our quarter obverse @${SIZE}px on ${REF} (disc ${D.cx},${D.cy} R ${D.R}); numbers = D6 length rank</text></svg>`;
const dst = `coloringbook/judge/_jq7over-${REF.replace(/\..*/, '')}-${SIZE}.png`;
await sharp(`coloringbook/ref/${REF}`).composite([{ input: Buffer.from(out), top: 0, left: 0 }]).png().toFile(dst);
console.log(`wrote ${dst}  (${strokes.length} stroke marks, ${regions.length} regions)`);
