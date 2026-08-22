// Freeze the NICKEL obverse tone patches (§12.2). REFUSES TO OVERWRITE.
//
// D3 has been UNMEASURED on this face since round 0, and §2 says an unmeasured
// dimension fails. It has been unmeasured because there is no
// `_tonepatches-nickel.json` — the dime, the cent and the quarter each have
// one and this coin never got one.
//
// THE ORDER MATTERS AND IS THE POINT. This file is written, and its overlay
// published and looked at, BEFORE any scorer for it exists. A target frozen
// after the art moved proves nothing (COIN-ART-METHOD.md §2), and a target
// tuned until the score improves is not a target. The placement was done by
// reading local-frame coordinates off `_jn6grid.mjs`'s annotated crop of
// `nickel-obv-unc2004.jpg` at 1523x1500 — three placement passes, all three
// published, all three decided on ANATOMY (is the circle wholly inside the
// silhouette, is it on the feature it is named for) and none on a score,
// because at the time no score existed.
//
// WHAT IS FROZEN
//   13 patches, disc-normalised (u, v, r), in the head's local frame
//     screen = (50 + cx + dir*s*lx, cy + s*ly)   OBVERSE.nickel
//     u, v   = (screen - 50) / 47                r = r_local * s / 47
//   `cheek` is the NORMALISER and is excluded from the score (§12.2): it is
//   identically 1.000 on both sides and only dilutes the mean.
//
// CONTAINMENT: every patch is checked wholly inside `_headmask-nickel.json`,
// which is the COMPLETE portrait silhouette (head, hair, queue, coat), and the
// script exits non-zero rather than writing a file with a patch hanging over
// the field.
//
// Run: node coloringbook/judge/_jn6freezetone.mjs
import { existsSync, writeFileSync } from 'node:fs';
import { OBVERSE } from '../../src/art/coins.js';
import { loadJSON } from '../_qtlib.mjs';
import { inside, dist } from '../_nkflat.mjs';

const OUT = new URL('../_tonepatches-nickel.json', import.meta.url).pathname;
if (existsSync(OUT)) { console.log('REFUSING: the nickel tone patches are frozen'); process.exit(1); }

const N = OBVERSE.nickel;                       // cx -6.4, cy 43.7, s 0.95, dir -1

// local x, y, radius. POSITIVE local x is toward the FACE on every coin in this
// file (`dir` carries the handedness), so +x is Jefferson's left, -x the nape.
const LOCAL = [
  ['cheek',      9.0,   4.5, 2.6],  // NORMALISER — the open cheek below the eye, no mark on it
  ['forehead',  11.5, -16.5, 1.8],  // bare forehead between the hairline and the brow
  ['brow',      12.5,  -7.5, 1.2],  // brow ridge and eye socket
  ['lips',      15.5,  11.5, 1.1],  // the mouth mass, just behind the lip line
  ['chin',      13.5,  17.0, 1.3],  // the chin
  ['jaw',        5.0,  20.0, 1.6],  // the underside of the jaw, in shadow
  ['throat',     3.0,  23.0, 1.2],  // the strip of throat between the jaw and the stand collar
  ['hairFront',  7.0, -22.0, 2.2],  // the wig immediately behind the hairline
  ['hairCrown', -3.0, -28.0, 2.5],  // the crown, combed back
  ['hairMid',  -12.0, -12.0, 3.0],  // the middle of the wig mass
  ['hairBack', -25.0,  -6.0, 2.8],  // the back of the wig
  ['curls',    -20.0,   6.0, 2.5],  // the rolled curls above the nape
  ['queue',    -27.0,  17.0, 1.8],  // the queue where it leaves the curls
];

const M = loadJSON(new URL('../_headmask-nickel.json', import.meta.url).pathname);
const poly = M.poly;
const patches = LOCAL.map(([name, x, y, r]) => ({
  name,
  u: +((N.cx + N.dir * N.s * x) / 47).toFixed(5),
  v: +((N.cy + N.s * y - 50) / 47).toFixed(5),
  r: +((r * N.s) / 47).toFixed(5),
  local: [x, y, r],
}));

let bad = 0;
for (const p of patches) {
  const c = inside([p.u, p.v], poly) ? dist([p.u, p.v], poly) : -dist([p.u, p.v], poly);
  const clear = ((c - p.r) * 47) / N.s;          // back into local units
  if (clear < 0) { bad++; console.log(`  OUTSIDE/CLIPPED ${p.name}: clearance ${clear.toFixed(2)} local units`); }
  else console.log(`  ${p.name.padEnd(10)} u ${p.u.toFixed(4).padStart(8)} v ${p.v.toFixed(4).padStart(8)} r ${p.r.toFixed(4)}  clearance ${clear.toFixed(2)}u`);
}
if (bad) { console.log(`REFUSING: ${bad} patch(es) not wholly inside _headmask-nickel.json`); process.exit(1); }

writeFileSync(OUT, JSON.stringify({
  _comment: 'FROZEN tone-patch set for the Jefferson nickel OBVERSE. Disc-normalised (u,v,r): u=(px-cx)/R, v=(py-cy)/R on any disc fit. Written once by coloringbook/judge/_jn6freezetone.mjs, which refuses to overwrite.',
  metric: 'median luminance per patch, each divided by the cheek patch. Score = mean |dratio| over the 12 non-cheek patches; cheek is excluded because it is identically 1.0 on both sides and would only dilute the mean.',
  frame: 'nickel OBVERSE: CX=-6.4 CY=43.7 s=0.95 dir=-1; screen=(50+CX+dir*s*lx, CY+s*ly); u=(screen-50)/47; r=r_local*s/47',
  placedOn: 'coloringbook/ref/nickel-obv-unc2004.jpg (1523x1500), disc cx=740.62 cy=746.97 R=701.95, fitted by coloringbook/judge/_jn6disc.mjs (grey flood; hough agrees to 0.14%; p95 boundary residual 0.71% of R). Placement read off the local-frame grid drawn by _jn6grid.mjs and audited by eye against the silhouette; overlay _jn6grid-nickel_obv_unc2004_jpg.png.',
  references: {
    frame: 'nickel-obv-unc2004.jpg',
    warning: 'nickel-obv-unc2004.jpg and nickel-obv.jpg are THE SAME PHOTOGRAPH at two resolutions (NCC 0.9674 at 256px, against 0.25-0.28 for the genuinely different files; see _jn6same.mjs). They are ONE opinion, not two.',
    independent: 'nickel-obv-5.JPG (1945-P, a different coin under different light, frozen fit p95 0.15% of R) is the only genuinely independent struck reference this face has.',
    excludedByName: ['nickel-obv-proof.png (photometric exclusion, r6 brief)', 'nickel-obv-4.jpg (disc fit AMBIGUOUS at 62.13% residual)', 'nickel-obv-3.png (Schlag PLASTER MODEL — shaded plaster, not struck metal; it is the SHAPE target and must never be a tone target)'],
  },
  normaliser: 'cheek',
  mask: '_headmask-nickel.json',
  patches,
}, null, 1));
console.log(`FROZEN ${OUT}  ${patches.length} patches (12 scored + cheek)`);
