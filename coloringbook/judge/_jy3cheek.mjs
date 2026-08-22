// ROUND (cent obverse, mid-jaw) — WHERE THE BARE CHEEK ENDS, on the coin.
//
// `_jy2whisk.mjs` (this round's first instrument) walked each column DOWNWARD
// from the top of its window looking for the first textured run, and returned
// its own search bound on 13 of 21 columns on the best reference: above the
// whisker field is the SIDEBURN, which is textured too, so "topmost textured
// run" is not the whisker boundary. That is a §4.1 failure report, not a value,
// and it is published as one.
//
// This is the second instrument and it asks the question from the other side.
// The feature we actually need is the edge of the BARE CHEEK — the smooth
// plateau the frozen `cheek` patch sits in. So: flood-fill the smooth region
// (texture energy below the same TARGET-derived threshold) starting from the
// frozen `cheek` patch centre, inside a stated locus, and report the LOWEST
// smooth y in each column. Below that line the coin is whiskers.
//
// LOCUS (frozen literal, §6.1): local x in [-14, 14], y in [-14, 16]. Nothing
// from our drawing enters this file; `src/art/coins.js` is never imported.
// THRESHOLD (target-derived): the midpoint of the texture energy of the two
// frozen patches either side of the hole, `cheek` and `beardJaw`, measured on
// the same photograph with the same window. Printed for every reference.
// DEGENERACY (PY5): the selected area as a fraction of the locus is printed. A
// flood covering more than 90% or less than 1% of the locus is a failure
// report, whatever its self-consistency.
// SEED CHECK (§4.3): the seed must itself be smooth; if the cheek patch centre
// is above threshold on a reference, that reference cannot carry this reading.
// RESPONSE TEST (§4): --shift dy moves the whole sampling grid; every boundary
// must move by -dy.
// OVERLAY (§4.3): print the boundary as a JY1_POLY string, draw it on the
// source with `_jy1lad.mjs`, and look at it before using any number.
//
// Run: node coloringbook/judge/_jy3cheek.mjs [--shift dy]
import { grey, DISCS, localToDisc, loadJSON, PENNY } from '../_pylib.mjs';

const SHIFT = process.argv.includes('--shift') ? Number(process.argv[process.argv.indexOf('--shift') + 1]) : 0;
const WIN = 1.2;
const X0 = -14, X1 = 14, Y0 = -14, Y1 = 16, STEP = 0.25;
const { patches } = loadJSON(new URL('../_tonepatches-penny.json', import.meta.url).pathname);
const cheek = patches.find((p) => p.name === 'cheek');
const beardJaw = patches.find((p) => p.name === 'beardJaw');

function energyGrid(g, D, shift) {
  const nx = Math.round((X1 - X0) / STEP) + 1, ny = Math.round((Y1 - Y0) / STEP) + 1;
  const E = new Float64Array(nx * ny).fill(NaN);
  const rad = WIN * PENNY.s / 47 * D.R;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const lx = X0 + i * STEP, ly = Y0 + j * STEP + shift;
    const { u, v } = localToDisc(lx, ly);
    const px = D.cx + u * D.R, py = D.cy + v * D.R;
    let n = 0, s = 0, s2 = 0, out = false;
    for (let y = Math.floor(py - rad); y <= Math.ceil(py + rad) && !out; y++)
      for (let x = Math.floor(px - rad); x <= Math.ceil(px + rad); x++) {
        if (x < 0 || y < 0 || x >= g.w || y >= g.h) { out = true; break; }
        if ((x - px) ** 2 + (y - py) ** 2 > rad * rad) continue;
        const val = g.d[y * g.w + x]; n++; s += val; s2 += val * val;
      }
    if (!out && n >= 12) E[j * nx + i] = Math.sqrt(Math.max(0, s2 / n - (s / n) ** 2));
  }
  return { E, nx, ny };
}

function patchE(E, nx, ny, p, shift) {
  const vals = [];
  for (let dy = -p.local.r; dy <= p.local.r; dy += STEP)
    for (let dx = -p.local.r; dx <= p.local.r; dx += STEP) {
      if (dx * dx + dy * dy > p.local.r ** 2) continue;
      const i = Math.round((p.local.x + dx - X0) / STEP), j = Math.round((p.local.y + dy - Y0) / STEP);
      if (i < 0 || j < 0 || i >= nx || j >= ny) continue;
      const v = E[j * nx + i]; if (!Number.isNaN(v)) vals.push(v);
    }
  vals.sort((a, b) => a - b);
  return vals.length ? vals[Math.floor(vals.length / 2)] : NaN;
}

export async function cheekFloor(file, shift = 0, quiet = false, discOverride = null, pathOverride = null) {
  const D = discOverride || DISCS[file];
  const g = await grey(pathOverride || `coloringbook/ref/${file}`);
  const { E, nx, ny } = energyGrid(g, D, shift);
  const Ec = patchE(E, nx, ny, cheek, shift), Eb = patchE(E, nx, ny, beardJaw, shift);
  const T = (Ec + Eb) / 2;
  const si = Math.round((cheek.local.x - X0) / STEP), sj = Math.round((cheek.local.y - Y0) / STEP);
  const seedOK = E[sj * nx + si] < T;
  if (!quiet) {
    console.log(`\n=== ${file}  R=${D.R}  ${(PENNY.s / 47 * D.R).toFixed(2)} px/local unit`);
    console.log(`    locus x[${X0},${X1}] y[${Y0},${Y1}] step ${STEP}; window r=${WIN}; cheek E=${Ec.toFixed(2)} beardJaw E=${Eb.toFixed(2)} T=${T.toFixed(2)}`);
    console.log(`    seed = frozen cheek centre (${cheek.local.x}, ${cheek.local.y}); E there = ${E[sj * nx + si].toFixed(2)} → ${seedOK ? 'smooth, usable' : 'ABOVE THRESHOLD — this reference cannot carry the reading'}`);
    if (!(Eb > Ec)) console.log('    *** beardJaw not more textured than cheek here — no contrast, reference unusable ***');
  }
  if (!seedOK || !(Eb > Ec)) return null;

  const mark = new Uint8Array(nx * ny);
  const st = [sj * nx + si]; mark[st[0]] = 1; let area = 0;
  while (st.length) {
    const k = st.pop(); area++;
    const i = k % nx, j = (k - i) / nx;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= nx || b >= ny) continue;
      const kk = b * nx + a; if (mark[kk]) continue;
      const v = E[kk]; if (Number.isNaN(v) || v >= T) continue;
      mark[kk] = 1; st.push(kk);
    }
  }
  const frac = area / (nx * ny);
  if (!quiet) console.log(`    flood selected ${area} of ${nx * ny} cells = ${(100 * frac).toFixed(1)}% of the locus  ${frac > 0.9 || frac < 0.01 ? '*** DEGENERATE (PY5) ***' : '(1%..90%: usable)'}`);
  if (frac > 0.9 || frac < 0.01) return null;

  const floor = {};
  for (let i = 0; i < nx; i++) {
    let last = null;
    for (let j = 0; j < ny; j++) if (mark[j * nx + i]) last = j;
    floor[+(X0 + i * STEP).toFixed(2)] = last === null ? null : +(Y0 + last * STEP).toFixed(2);
  }
  return { floor, T, Ec, Eb, frac };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const XS = [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const res = {};
  for (const f of Object.keys(DISCS)) res[f] = await cheekFloor(f, SHIFT);
  console.log('\nBOTTOM OF THE BARE CHEEK (local y) — below this line the coin is whiskers');
  console.log('   x   ' + Object.keys(DISCS).map((f) => f.padStart(18)).join(''));
  for (const x of XS) console.log(`  ${String(x).padStart(3)}  ` + Object.keys(DISCS)
    .map((f) => (res[f] === null ? 'n/a' : res[f].floor[x] === null ? 'no smooth cell' : res[f].floor[x].toFixed(2)).padStart(18)).join(''));
  for (const f of Object.keys(DISCS)) {
    if (!res[f]) continue;
    console.log(`\nJY1_POLY for ${f}:`);
    console.log('  ' + XS.filter((x) => res[f].floor[x] !== null).map((x) => `${x},${res[f].floor[x]}`).join(' '));
  }
  if (SHIFT) console.log(`\n(RESPONSE TEST: grid shifted ${SHIFT} in y; every boundary must be ${-SHIFT} from the unshifted run)`);
}
