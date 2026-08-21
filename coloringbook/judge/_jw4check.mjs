// R4 dime jaw — check the region that is actually in the source.
//
// Four things, all of which a previous pass on some coin got wrong:
//   1. WIDTH PROFILE as drawn, perpendicular to the centreline, against the
//      taper it was built to. This is the "the jaw as drawn" number.
//   2. CONTAINMENT IN THE HEAD. `fill="none"` has no area, so a stroke that
//      overhung the silhouette cost nothing; a REGION that overhangs paints
//      ink on bare field. This is the fault that put 25.1 % of the cent's
//      lapel outside its coat and was invisible to IoU.
//   3. CLEARANCE TO `shade`, the throat region. The source's own comment says
//      the light band between them is on the photograph and that closing it
//      "merges the two into one dark bar" — so the clearance is printed for
//      the region as drawn AND for the stroke it replaced.
//   4. KNOT TURNS of the new path. D7's locus is the fitted HEAD contour only,
//      so these are out of its scope, but an authored corner that nobody
//      declared is exactly what Appendix P2 is about, so they are published.
//
// Null test: the containment scan walks the region's own boundary points, so
// its "worst overhang" has a natural zero and no search window; the value 0 is
// the answer, not a bound. Response test: RESPONSE=1 translates the region 3
// units down and requires the overhang to appear.
//
// Run: node coloringbook/judge/_jw4check.mjs
import { busted } from './_jw4reg.mjs';
import { walk, inside } from './_jw4width.mjs';
import { marks, turns } from './_jqgeom.mjs';

const S = 0.97;
const CENTRE_D = 'M 19.4 21.4 C 17.6 21.4 14.2 21.4 11 21.2 C 7 21 3.4 19.4 0.4 18.2'
  + ' C -3.2 16.8 -7.4 15 -10.4 13.6 C -11.4 13 -12.2 12.4 -12.6 11.6';
const SHADE_D = 'M 14.2 23.2 C 12.6 25.2 10.6 26.4 8.4 27.1 C 5.6 27.9 2.8 28.6 1.7 29.3'
  + ' C 0.9 28.5 -0.8 27.6 -2.6 26.8 C -4.6 25.8 -6.2 23.6 -6.6 21.4 C -6.9 19.6 -6.4 18 -5.6 17.2'
  + ' C -3.2 18.4 -0.4 20 2.2 21.2 C 5.6 22 9.8 22.8 14.2 23.2 Z';

const B = await busted();
// Pull the jaw region out of the EMITTED SVG rather than out of the source
// text: the source splits the path over ten concatenated string literals with
// comments between them, and a regex over that captured the comments too and
// produced a mark of 372 NaN points that still reported "0 knots over 75".
// The `d` attribute of an emitted path is authored in the head's LOCAL frame,
// which is the frame everything below is in.
const jawD = B.svg.match(/<path d="(M 19\.4 [\d.]+ C [^"]*Z)" stroke="none"\/>/)[1];
const dy = Number(process.env.RESPONSE ? 3 : 0);
const region = marks(`<svg><g transform="translate(0 ${dy})"><path d="${jawD}"/></g></svg>`)[0];
const head = marks(`<svg><path d="${B.headD}"/></svg>`)[0].pts;
const shade = marks(`<svg><path d="${SHADE_D}"/></svg>`)[0].pts;
const cen = walk(marks(`<svg><path d="${CENTRE_D}"/></svg>`)[0].pts, 0.5);

console.log(`region: ${region.pts.length} flattened points, ${region.knots.length} knots`
  + (dy ? `   [RESPONSE: translated ${dy} units down]` : ''));

// 2. containment in the head
let out = 0, worst = 0;
for (const p of region.pts) {
  if (inside(head, p.x, p.y)) continue;
  out++;
  let best = Infinity;
  for (let i = 1; i < head.length; i++) best = Math.min(best, Math.hypot(p.x - head[i].x, p.y - head[i].y));
  worst = Math.max(worst, best);
}
console.log(`\nCONTAINMENT: ${out} of ${region.pts.length} boundary points outside the HEAD contour`
  + `  (worst overhang ${worst.toFixed(2)} local units = ${(worst * S).toFixed(2)} viewBox)`);

// 1 + 3. width and clearance along the centreline
console.log('\n   s   drawn width (vb)   clearance to shade (local)   was, as a 1.5 stroke');
let minGap = Infinity, minGapOld = Infinity, wmin = Infinity, wmax = 0;
const H0 = 0.75 / S;
for (const p of cen) {
  const nx = -p.ty, ny = p.tx;
  let hi = 0, lo = 0;
  for (let t = 0; t < 5; t += 0.01) { if (inside(region.pts, p.x + nx * t, p.y + ny * t)) hi = t; else break; }
  for (let t = 0; t < 5; t += 0.01) { if (inside(region.pts, p.x - nx * t, p.y - ny * t)) lo = t; else break; }
  const w = (hi + lo) * S;
  if (p.s > 0.4 && p.s < cen[cen.length - 1].s - 0.4) { wmin = Math.min(wmin, w); wmax = Math.max(wmax, w); }
  let gap = Infinity, gapOld = Infinity;
  for (let t = 0; t < 12; t += 0.02) if (inside(shade, p.x - nx * (lo + t), p.y - ny * (lo + t))) { gap = t; break; }
  for (let t = 0; t < 12; t += 0.02) if (inside(shade, p.x - nx * (H0 + t), p.y - ny * (H0 + t))) { gapOld = t; break; }
  minGap = Math.min(minGap, gap); minGapOld = Math.min(minGapOld, gapOld);
  if (Math.round(p.s * 2) % 8 === 0) {
    console.log(`${p.s.toFixed(1).padStart(5)}   ${w.toFixed(2).padStart(14)}   `
      + `${(gap === Infinity ? '>12' : gap.toFixed(2)).padStart(25)}   ${gapOld === Infinity ? '>12' : gapOld.toFixed(2)}`);
  }
}
console.log(`\nwidth range over the interior of the run: ${wmin.toFixed(2)} .. ${wmax.toFixed(2)} viewBox`);
console.log(`WIDTH-VARIATION RATIO = ${(wmax / wmin).toFixed(3)}   (a stroke-width mark is 1.000 by construction)`);
console.log(`minimum clearance to the throat region: ${minGap.toFixed(2)} local units`
  + `  (the 1.5 stroke it replaced: ${minGapOld.toFixed(2)})`);

// 4. knot turns
const t = turns(region.knots);
const srt = t.slice().sort((a, b) => b.deg - a.deg);
console.log(`\nKNOTS: ${region.knots.length}, worst turn ${srt[0].deg.toFixed(1)} deg, ${t.filter((x) => x.deg > 75).length} over 75`);
for (const x of srt.slice(0, 4)) console.log(`   idx ${x.i}  ${x.deg.toFixed(1)} deg at (${x.at.x.toFixed(2)}, ${x.at.y.toFixed(2)})`);
console.log('D7 scores the FITTED HEAD contour only (dime scorecard locus), so these are outside its subject;');
console.log('published because Appendix P2 says an authored corner is declared rather than assumed.');
