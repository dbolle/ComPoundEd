// SPECIALIST INSTRUMENT — round 3. FINDING A LETTER-FREE PATCH, by enumeration.
//
// `_jl3ink.mjs` needs its threshold from a rectangle with no relief in it, and
// that rectangle must not be guessed: a sigma taken over a patch that happens
// to clip a letter is a threshold set by the feature it is about to measure.
//
// So this enumerates EVERY candidate patch of a given size on a lattice over
// the disc interior, computes the residual MAD of each against the same
// background model `_jl3ink.mjs` uses, and prints the whole ranked set (§4.2 —
// an instrument that selects prints what it selected from). The caller reads
// the table and picks, with the picture beside it.
//
// §4.1 NULL: the lattice bounds are printed. A winner on the lattice EDGE is
//   reported as suspect, because the true minimum may be outside the scan.
// §4 RESPONSE: the same scan at a different patch size must rank the same
//   region first; run with two sizes and compare.
//
// Run: node coloringbook/judge/_jl3flat.mjs <ref> [size] [rMax]
import { inkSampler, grab, sigmaOf } from './_jl3ink.mjs';

const [file, sizeS, rMaxS] = process.argv.slice(2);
const SZ = Number(sizeS || 5), RMAX = Number(rMaxS || 43);
const s = await inkSampler(file);
const rows = [];
for (let y = 50 - RMAX; y + SZ <= 50 + RMAX; y += 2) {
  for (let x = 50 - RMAX; x + SZ <= 50 + RMAX; x += 2) {
    // whole patch inside the disc interior
    const corners = [[x, y], [x + SZ, y], [x, y + SZ], [x + SZ, y + SZ]];
    if (corners.some(([a, b]) => Math.hypot(a - 50, b - 50) > RMAX)) continue;
    const g = sigmaOf(grab(s, [x, y, x + SZ, y + SZ]));
    rows.push({ x, y, mad: g.mad, sigma: g.sigma, r: Math.hypot(x + SZ / 2 - 50, y + SZ / 2 - 50) });
  }
}
rows.sort((a, b) => a.mad - b.mad);
console.log(`${file}  patch ${SZ}x${SZ}  lattice step 2  |r| <= ${RMAX}  candidates ${rows.length}`);
console.log('§4.1 lattice bounds: x,y in [' + (50 - RMAX) + ', ' + (50 + RMAX - SZ) + ']');
console.log('rank   rect                        r      MAD     sigma');
rows.slice(0, 25).forEach((r, i) => console.log(
  `${String(i + 1).padStart(4)}   ${`${r.x},${r.y},${r.x + SZ},${r.y + SZ}`.padEnd(24)} ${r.r.toFixed(1).padStart(5)}  ${r.mad.toFixed(3).padStart(6)}  ${r.sigma.toFixed(3)}`));
console.log('   ... worst:');
rows.slice(-3).forEach((r) => console.log(
  `       ${`${r.x},${r.y},${r.x + SZ},${r.y + SZ}`.padEnd(24)} ${r.r.toFixed(1).padStart(5)}  ${r.mad.toFixed(3).padStart(6)}  ${r.sigma.toFixed(3)}`));
