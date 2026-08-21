// _jn6grid — draw the NICKEL HEAD'S LOCAL FRAME on the photograph, so tone
// patches can be placed by reading coordinates off the source instead of
// describing the coin from memory (§7 of the brief; MEMORY.md's standing rule).
//
// The chain is `_nktone.mjs`'s, verbatim, and it is the same one bust() uses:
//   screen = (50 + cx + dir*s*lx,  cy + s*ly)      OBVERSE.nickel
//   u,v    = (screen - 50) / 47
//   photo  = (D.cx + u*D.R, D.cy + v*D.R)          D from _jn6discs.json
//
// The grid is labelled in LOCAL units every 10, with a finer 5-unit rule, and
// the head's own silhouette (HEAD.Jefferson, pushed through the same chain) is
// drawn in magenta. If the magenta does not sit on the photographed bust, the
// frame is wrong and NO patch coordinate read off this image means anything —
// that check is the whole point of drawing it (§4.3).
//
// Run: node coloringbook/judge/_jn6grid.mjs [ref]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { OBVERSE } from '../../src/art/coins.js';
import { internals } from './_jn6mod.mjs';
import { flatten } from '../_nkflat.mjs';
const { HEAD } = await internals();

const REF = process.argv[2] || 'nickel-obv-unc2004.jpg';
const D = JSON.parse(readFileSync(new URL('./_jn6discs.json', import.meta.url).pathname, 'utf8'))[REF]
  || JSON.parse(readFileSync(new URL('./_jn1discs.json', import.meta.url).pathname, 'utf8'))[REF];
if (!D) throw new Error(`no disc fit for ${REF}`);
const N = OBVERSE.nickel;

const toPx = (lx, ly) => {
  const u = (N.cx + N.dir * N.s * lx) / 47;
  const v = (N.cy + N.s * ly - 50) / 47;
  return [D.cx + u * D.R, D.cy + v * D.R];
};

// crop to the head: local x -45..+30, y -40..+45, with margin
const CORNERS = [[-48, -42], [34, -42], [34, 48], [-48, 48]].map(([a, b]) => toPx(a, b));
const x0 = Math.max(0, Math.floor(Math.min(...CORNERS.map((p) => p[0]))));
const x1 = Math.ceil(Math.max(...CORNERS.map((p) => p[0])));
const y0 = Math.max(0, Math.floor(Math.min(...CORNERS.map((p) => p[1]))));
const y1 = Math.ceil(Math.max(...CORNERS.map((p) => p[1])));
const W = x1 - x0, H = y1 - y0;

const g = [];
for (let lx = -45; lx <= 30; lx += 5) {
  const a = toPx(lx, -40), b = toPx(lx, 45);
  const maj = lx % 10 === 0;
  g.push(`<line x1="${a[0] - x0}" y1="${a[1] - y0}" x2="${b[0] - x0}" y2="${b[1] - y0}" stroke="#00b0ff" stroke-width="${maj ? 1.6 : 0.7}" opacity="${maj ? 0.75 : 0.4}"/>`);
  if (maj) g.push(`<text x="${a[0] - x0 + 2}" y="${a[1] - y0 + 16}" font-family="monospace" font-size="15" fill="#00b0ff">x${lx}</text>`);
}
for (let ly = -40; ly <= 45; ly += 5) {
  const a = toPx(-45, ly), b = toPx(30, ly);
  const maj = ly % 10 === 0;
  g.push(`<line x1="${a[0] - x0}" y1="${a[1] - y0}" x2="${b[0] - x0}" y2="${b[1] - y0}" stroke="#00b0ff" stroke-width="${maj ? 1.6 : 0.7}" opacity="${maj ? 0.75 : 0.4}"/>`);
  if (maj) g.push(`<text x="${b[0] - x0 - 44}" y="${b[1] - y0 - 4}" font-family="monospace" font-size="15" fill="#00b0ff">y${ly}</text>`);
}
// the head silhouette in the same frame — the check that the frame is right
const pts = flatten(HEAD.Jefferson).map(([lx, ly]) => toPx(lx, ly).map((c, i) => c - (i ? y0 : x0)));
g.push(`<polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="#ff2d55" stroke-width="2.4"/>`);

// optional patch overlay: PATCHES=name:x:y:r,...
for (const spec of (process.env.PATCHES || '').split(',').filter(Boolean)) {
  const [name, lx, ly, r] = spec.split(':');
  const c = toPx(+lx, +ly), e = toPx(+lx + +r, +ly);
  const rp = Math.hypot(e[0] - c[0], e[1] - c[1]);
  g.push(`<circle cx="${c[0] - x0}" cy="${c[1] - y0}" r="${rp}" fill="none" stroke="#ffd60a" stroke-width="2.6"/>`);
  g.push(`<text x="${c[0] - x0 + rp + 3}" y="${c[1] - y0 + 5}" font-family="monospace" font-size="17" fill="#ffd60a">${name}</text>`);
}

const OUT = new URL(`./_jn6grid-${REF.replace(/\W+/g, '_')}.png`, import.meta.url).pathname;
await sharp(new URL('../ref/' + REF, import.meta.url).pathname)
  .extract({ left: x0, top: y0, width: W, height: H })
  .composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${g.join('')}</svg>`) }])
  .png().toFile(OUT);
console.log(`${REF}: disc cx ${D.cx} cy ${D.cy} R ${D.R}; crop ${W}x${H} at (${x0},${y0})`);
console.log(`wrote ${OUT}`);
console.log('MAGENTA = HEAD.Jefferson pushed through the same chain. If it is not on the bust, the frame is wrong.');
