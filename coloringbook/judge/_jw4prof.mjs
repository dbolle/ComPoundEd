// R4 dime jaw — the PROFILE, printed, before any width is believed.
//
// `_jw4width.mjs` returned troughs pinned at its own +-3 window on two of three
// references and offsets of opposite SIGN on the other, which is §4.1's tell
// exactly: the answer was the search bound. So print the thing the width is
// derived from — the grey profile perpendicular to the drawn jaw, station by
// station — and read the structure off it instead of trusting a peak finder.
//
// Sign convention, stated once: the normal is n = (-ty, tx) on a path that runs
// from the chin BACKWARD, so near the chin n points UP into the face and a
// NEGATIVE offset is DOWN into the neck. Every table below is printed with
// negative offsets on the right so the picture reads face-up / neck-down.
//
// Null test: the window is +-HALF and both ends are printed, so a reader can
// see whether the structure runs off the edge. Response test: it shares
// `runAt`'s sampler with `_jw4width.mjs`, whose SELFTEST recovers a synthetic
// band of known width to 0.05 units.
//
// Run: node coloringbook/judge/_jw4prof.mjs [ref]
import { busted, discFor, makeMap } from './_jw4reg.mjs';
import { walk, runAt, greyImg, inside } from './_jw4width.mjs';
import { marks } from './_jqgeom.mjs';

const REFDIR = new URL('../ref/', import.meta.url).pathname;
const HALF = Number(process.env.HALF || 7);
const TANG = Number(process.env.TANG || 1.5);
const B = await busted();
const jawD = B.svg.match(/<path d="(M 19\.4 21\.4[^"]*)"/)[1];
const mk = marks(`<svg><path d="${jawD}"/></svg>`)[0];
const P = walk(mk.pts, 0.5);
const head = marks(`<svg><path d="${B.headD}"/></svg>`)[0].pts;
const ref = process.argv[2] || 'dime-obv-2.jpg';
const disc = discFor(ref);
const M = makeMap(B, disc);
const g = await greyImg(REFDIR + ref);
console.log(`${ref}  ${M.pxPerUnit.toFixed(2)} px/unit   window +-${HALF} units, tangential +-${TANG}`);
console.log('offset runs +face .. 0 = the drawn line .. -neck\n');
const cols = [];
for (let t = HALF; t >= -HALF; t -= 0.5) cols.push(t);
console.log('  s  |' + cols.map((t) => String(t.toFixed(0)).padStart(4)).join(''));
for (let i = 0; i < P.length; i += 4) {
  const r = runAt(g, M, P, i, HALF, TANG, head, HALF);
  if (!r.prof) { console.log(`${P[i].s.toFixed(0).padStart(4)} | all outside the head`); continue; }
  const N = r.N;
  const row = cols.map((t) => {
    const v = r.prof[Math.round(N + t / 0.05)];
    return Number.isNaN(v) ? '   .' : String(Math.round(v)).padStart(4);
  });
  console.log(`${P[i].s.toFixed(0).padStart(4)} |` + row.join(''));
}
