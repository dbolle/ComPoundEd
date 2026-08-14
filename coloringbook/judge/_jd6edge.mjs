// DIME r0, TASK 4 — WHERE DOES THE PHOTOGRAPH'S OWN COIN EDGE LAND?
//
// Cent r0's PY7, in force for this round by my own gates file: every radius
// quoted is in viewBox units, and viewBox units are DEFINED by
// `X = 50 + 47 (px - cx) / R`, so the coin's own silhouette is r = 47 BY
// CONSTRUCTION. If the fitted R is not the silhouette radius, every radius
// derived from it is wrong by the same factor — and 1 % is 0.44 units at r 44,
// which is half the D5-rim gate.
//
// Method is `_jp7edge.mjs`'s, re-implemented against `_jd1discs.json`: for each
// angular column, the radius of maximum |d grey / d r| inside a frozen window,
// then the median and the p5/p95 spread. Correction factor = 47 / rEdge.
//
// §4.1 the window is printed; columns whose peak lands at a window end are
//      dropped and counted.
// §4.3 the located edge is drawn on the unwrap.
//
// Run: node coloringbook/judge/_jd6edge.mjs [ref ...]
import { readFileSync, writeFileSync } from 'node:fs';
import { unwrap, ladder, draw } from './_jd3unwrap.mjs';

const D = JSON.parse(readFileSync(new URL('./_jd1discs.json', import.meta.url)));
const LO = 44.0, HI = 49.0;      // frozen search window, viewBox units

const refs = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(D).filter((f) => D[f].R);
const OUT = {};
for (const f of refs) {
  if (!D[f] || !D[f].R) { console.log(`${f}: no frozen disc — skipped`); continue; }
  const u = await unwrap(f);
  const rowR = (j) => (u.RB - (u.RB - u.RA) * j / (u.H - 1)) * 47;
  const rows = []; for (let j = 0; j < u.H; j++) { const r = rowR(j); if (r >= LO && r <= HI) rows.push([j, r]); }
  // Background level: median of every VALID sample at r >= 48.5 (outside the
  // coin on every reference, and inside the frame on the ones that reach it).
  const bgv = [];
  for (let j = 0; j < u.H; j++) { const r = rowR(j); if (r < 48.5) continue;
    for (let i = 0; i < u.W; i++) if (u.ok[j * u.W + i]) bgv.push(u.buf[j * u.W + i]); }
  bgv.sort((a, b) => a - b);
  const bg = bgv.length ? bgv[bgv.length >> 1] : null;

  const hits = [], hitsB = []; let dropped = 0, droppedFrame = 0;
  for (let i = 0; i < u.W; i++) {
    // §4.1: a column that the FRAME cuts inside the window is not a measurement.
    // `_jp4unwrap.mjs` returned 0 out of frame, which is a 255-level step that
    // an edge finder happily locks onto; four of six dime references are cut.
    let allOk = true;
    for (const [j] of rows) if (!u.ok[j * u.W + i]) { allOk = false; break; }
    if (!allOk) { droppedFrame++; continue; }
    let best = -1, bestR = null;
    for (let k = 1; k < rows.length - 1; k++) {
      const g = Math.abs(u.buf[rows[k - 1][0] * u.W + i] - u.buf[rows[k + 1][0] * u.W + i]);
      if (g > best) { best = g; bestR = rows[k][1]; }
    }
    if (best < 8 || bestR >= HI - 0.1 || bestR <= LO + 0.1) { dropped++; continue; }
    hits.push(bestR);
    // estimator B — background departure, scanning INWARD from HI.
    if (bg !== null) {
      // rows[] runs OUTER (r ~ HI) to INNER (r ~ LO); walk inward from the
      // outside and stop at the first sample that is not background.
      for (let k = 0; k < rows.length; k++) {
        const [j, r] = rows[k];
        if (Math.abs(u.buf[j * u.W + i] - bg) > 30) { hitsB.push(r); break; }
      }
    }
  }
  hits.sort((a, b) => a - b); hitsB.sort((a, b) => a - b);
  const med = hits[hits.length >> 1], p5 = hits[(hits.length * 0.05) | 0], p95 = hits[(hits.length * 0.95) | 0];
  const medB = hitsB.length ? hitsB[hitsB.length >> 1] : null;
  console.log(`${f.padEnd(16)} background level ${bg}; estimator B (background departure) median r = ${medB === null ? 'n/a' : medB.toFixed(2)} from ${hitsB.length} columns`);
  const k = 47 / med, spread = 100 * (p95 - p5) / med;
  const p5B = hitsB.length ? hitsB[(hitsB.length * 0.05) | 0] : null, p95B = hitsB.length ? hitsB[(hitsB.length * 0.95) | 0] : null;
  const spreadB = medB === null ? null : 100 * (p95B - p5B) / medB;
  OUT[f] = { rEdgeMedian: +med.toFixed(2), p5: +p5.toFixed(2), p95: +p95.toFixed(2),
    spreadPct: +spread.toFixed(2), correction: +k.toFixed(4), dropped, droppedFrame, kept: hits.length,
    B_bgDeparture: medB === null ? null : +medB.toFixed(2), B_p5: p5B, B_p95: p95B,
    B_spreadPct: spreadB === null ? null : +spreadB.toFixed(2),
    B_correction: medB === null ? null : +(47 / medB).toFixed(4),
    usableForGeometry: (spreadB !== null ? spreadB : spread) <= 3.0 };
  console.log(`${f.padEnd(16)} window ${LO}..${HI}  ->  coin edge at r = ${med.toFixed(2)}  (p5 ${p5.toFixed(2)}, p95 ${p95.toFixed(2)}, spread ${spread.toFixed(2)}%)`);
  console.log(`${''.padEnd(16)} A: kept ${hits.length}, dropped ${dropped} (weak/at-bound) + ${droppedFrame} (frame cut) of ${u.W};  CORRECTION 47/${med.toFixed(2)} = ${k.toFixed(4)}`);
  console.log(`${''.padEnd(16)} B: median ${medB === null ? 'n/a' : medB.toFixed(2)}  p5 ${p5B === null ? '-' : p5B.toFixed(2)}  p95 ${p95B === null ? '-' : p95B.toFixed(2)}  spread ${spreadB === null ? '-' : spreadB.toFixed(2)}%  CORRECTION ${medB === null ? '-' : (47 / medB).toFixed(4)}` +
    `${spreadB !== null && spreadB > 3.0 ? '   <-- SPREAD > 3%: NOT USABLE FOR A GEOMETRIC GATE (gates file)' : ''}`);

  const y = (vbu) => (u.RB - vbu / 47) / (u.RB - u.RA) * (u.H - 1);
  const extra = [`<path d="M0 ${y(med).toFixed(1)}H${u.W}" stroke="#00ff00" stroke-width="2.4"/>`
    + `<text x="${u.W / 2 - 240}" y="${(y(med) - 6).toFixed(1)}" font-family="monospace" font-size="18" fill="#00ff00">measured coin edge r=${med.toFixed(2)} (must be 47.00)</text>`];
  await draw(u, ladder(u, extra), new URL(`./_jd6edge-${f.replace(/\..*/, '')}.png`, import.meta.url).pathname);
}
writeFileSync(new URL('./_jd6edge.json', import.meta.url).pathname, JSON.stringify(OUT, null, 1));
console.log('\n' + JSON.stringify(OUT, null, 1));
