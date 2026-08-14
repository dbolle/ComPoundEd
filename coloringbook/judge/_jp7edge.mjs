// PENNY ROUND 0, TASK 4d — WHERE DOES THE PHOTOGRAPH'S COIN EDGE LAND?
//
// Every radius this round quotes is in viewBox units, and viewBox units are
// defined by `X = 50 + 47 (px - cx) / R`: the coin's own silhouette is r = 47
// BY CONSTRUCTION. So if the fitted R is not the silhouette radius, every
// radius derived from it is wrong by the same factor — and the polar unwrap
// makes that visible: on `penny-rev-2.png` the background does not begin at the
// 47 rule, it begins near 46.4.
//
// That is Appendix S1's cost, measured: the disc is a located feature and a 1%
// error in it is 0.4 viewBox units at r 43, comparable with the gates.
//
// This measures the silhouette directly IN the unwrap — for each angular
// column, the radius of maximum |d grey / d r| inside a stated window — and
// reports the median and the spread. The correction factor is 47 / rEdge.
//
// §4.1 the window is printed; columns whose peak lands at a window end are
// dropped and counted.
// §4.3 the located edge is drawn on the unwrap.
//
// Run: node coloringbook/judge/_jp7edge.mjs [ref ...]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { unwrap } from './_jp4unwrap.mjs';

const D = JSON.parse(readFileSync(new URL('./_jp1discs.json', import.meta.url)));
const LO = 44.0, HI = 49.0;      // frozen search window, viewBox units

const refs = process.argv.slice(2).length ? process.argv.slice(2)
  : ['penny-rev-2.png', 'penny-obv-3.jpg', 'penny-obv.jpg', 'penny-obv-2.jpg', 'penny-obv-4.png', 'penny-rev.jpg'];
const OUT = {};
for (const f of refs) {
  if (!D[f] || !D[f].R) { console.log(`${f}: no frozen disc — skipped`); continue; }
  const u = await unwrap(f);
  const rowR = (j) => (u.RB - (u.RB - u.RA) * j / (u.H - 1)) * 47;
  const rows = []; for (let j = 0; j < u.H; j++) { const r = rowR(j); if (r >= LO && r <= HI) rows.push([j, r]); }
  const hits = []; let dropped = 0;
  for (let i = 0; i < u.W; i++) {
    let best = -1, bestR = null;
    for (let k = 1; k < rows.length - 1; k++) {
      const g = Math.abs(u.buf[rows[k - 1][0] * u.W + i] - u.buf[rows[k + 1][0] * u.W + i]);
      if (g > best) { best = g; bestR = rows[k][1]; }
    }
    if (best < 8) { dropped++; continue; }
    if (bestR >= HI - 0.1 || bestR <= LO + 0.1) { dropped++; continue; }   // §4.1
    hits.push(bestR);
  }
  hits.sort((a, b) => a - b);
  const med = hits[hits.length >> 1], p5 = hits[(hits.length * 0.05) | 0], p95 = hits[(hits.length * 0.95) | 0];
  const k = 47 / med;
  OUT[f] = { rEdgeMedian: +med.toFixed(2), p5: +p5.toFixed(2), p95: +p95.toFixed(2),
    spreadPct: +(100 * (p95 - p5) / med).toFixed(2), correction: +k.toFixed(4), dropped };
  console.log(`${f.padEnd(24)} window ${LO}..${HI};  coin edge lands at r = ${med.toFixed(2)}  (p5 ${p5.toFixed(2)}, p95 ${p95.toFixed(2)}, spread ${(100 * (p95 - p5) / med).toFixed(2)}% )`);
  console.log(`${''.padEnd(24)} columns dropped ${dropped} of ${u.W};  CORRECTION FACTOR 47/${med.toFixed(2)} = ${k.toFixed(4)}  (a radius r reads r*${k.toFixed(4)} once the edge is put at 47)`);

  const { buf, W, H } = u;
  const y = (vbu) => (u.RB - vbu / 47) / (u.RB - u.RA) * (H - 1);
  let g = '';
  for (let vbu = 30; vbu <= 49; vbu++)
    g += `<path d="M0 ${y(vbu).toFixed(1)}H${W}" stroke="${vbu % 5 === 0 ? '#ff2d55' : '#00e5ff'}" stroke-width="0.8" opacity="0.4"/>`
      + `<text x="3" y="${(y(vbu) - 2).toFixed(1)}" font-family="monospace" font-size="13" fill="#ffe600">${vbu}</text>`;
  g += `<path d="M0 ${y(med).toFixed(1)}H${W}" stroke="#00ff00" stroke-width="2.4"/>`
    + `<text x="${W / 2 - 200}" y="${(y(med) - 5).toFixed(1)}" font-family="monospace" font-size="18" fill="#00ff00">measured coin edge r=${med.toFixed(2)} (should be 47.00)</text>`;
  const grey = await sharp(buf, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
  const rgb = await sharp(grey).toColourspace('srgb').png().toBuffer();
  const out = new URL(`./_jp7edge-${f.replace(/\..*/, '')}.png`, import.meta.url).pathname;
  await sharp(rgb).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${g}</svg>`) }]).toFile(out);
}
console.log('\n' + JSON.stringify(OUT, null, 1));
