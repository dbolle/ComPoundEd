// ROUND (cent obverse, mid-jaw whisker field) — RE-DERIVATION of the coin's
// whisker-field TOP EDGE, from the photographs only.
//
// Why it exists: `src/art/coins.js` records, in prose, that "the coin's whisker
// field runs well above this top edge across the middle of the jaw: ours
// 4.9 / 7.3 / 9.8 / 11.8 / 12.9 at local x -8 / -4 / 0 / +4 / +8 against the
// photograph's ~0 / -3 / 0 / +4 / +8 — a lens-shaped shortfall peaking near 10
// local units at x = -4..0."  brief-common.md rule 2: a number without a
// generator is a description. That reading was taken by eye off
// `_jh8ladder.mjs` and no generator computes it, so it is re-derived here.
//
// WHAT IS MEASURED. The cent's beard is CUT INTO the die, so on a photograph it
// is not one tone — it is a striated field of grooves, while the cheek above it
// is a smooth plateau. The discriminator is therefore TEXTURE, not luminance:
// E(x,y) = the standard deviation of greyscale inside a disc of radius 1.2
// LOCAL units centred on local (x,y).
//
// LOCUS AND THRESHOLD ARE TARGET-DERIVED (§6.1). The threshold is the midpoint
// between the texture energy of the two patches the FROZEN
// `_tonepatches-penny.json` already declares on either side of the hole —
// `cheek` (local 8.5,-1.5) and `beardJaw` (local -4,17.5) — measured on the same
// photograph with the same window. Nothing about our own drawing enters this
// file: `src/art/coins.js` is never imported.
//
// NULL TEST (§4.1). The y search window is printed and is a literal (-8..+22).
// A crossing at either bound is reported as `BOUND` and never as a value.
// SELECTION TEST (§4.2). Every candidate crossing on a column is printed, not
// just the topmost, together with the run length that qualified it.
// RESPONSE TEST (§4). --shift <dy> translates the sampling grid by dy local
// units; every returned edge must move by -dy.
// OVERLAY (§4.3). The located edge is drawn on the source at full resolution by
// `_jy3over.mjs`, and it is looked at before any number here is used.
//
// Run: node coloringbook/judge/_jy2whisk.mjs [--shift dy]
import { grey, DISCS, localToDisc, loadJSON, PENNY } from '../_pylib.mjs';

const SHIFT = process.argv.includes('--shift') ? Number(process.argv[process.argv.indexOf('--shift') + 1]) : 0;
const WIN = 1.2;                     // texture window radius, LOCAL units
const YLO = -8, YHI = 22;            // the search window, a literal
const RUN = 2.0;                     // a crossing must persist this far, LOCAL units
const STEP = 0.25;                   // y sampling, LOCAL units
const XS = [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const { patches } = loadJSON(new URL('../_tonepatches-penny.json', import.meta.url).pathname);

function energyAt(g, D, lx, ly, winLocal) {
  const { u, v } = localToDisc(lx, ly);
  const px = D.cx + u * D.R, py = D.cy + v * D.R;
  const rad = winLocal * PENNY.s / 47 * D.R;
  let n = 0, s = 0, s2 = 0;
  for (let y = Math.floor(py - rad); y <= Math.ceil(py + rad); y++)
    for (let x = Math.floor(px - rad); x <= Math.ceil(px + rad); x++) {
      if (x < 0 || y < 0 || x >= g.w || y >= g.h) return null;   // validity mask (DM3)
      if ((x - px) ** 2 + (y - py) ** 2 > rad * rad) continue;
      const val = g.d[y * g.w + x]; n++; s += val; s2 += val * val;
    }
  if (n < 12) return null;
  return Math.sqrt(Math.max(0, s2 / n - (s / n) ** 2));
}

// median texture energy over a frozen patch, same window as the profile
function patchEnergy(g, D, p) {
  const vals = [];
  for (let dy = -p.local.r; dy <= p.local.r; dy += 0.4)
    for (let dx = -p.local.r; dx <= p.local.r; dx += 0.4) {
      if (dx * dx + dy * dy > p.local.r ** 2) continue;
      const e = energyAt(g, D, p.local.x + dx, p.local.y + dy, WIN);
      if (e !== null) vals.push(e);
    }
  vals.sort((a, b) => a - b);
  return vals[Math.floor(vals.length / 2)];
}

export async function whiskerEdge(file, shift = 0, quiet = false) {
  const D = DISCS[file];
  const g = await grey(`coloringbook/ref/${file}`);
  const cheek = patches.find((p) => p.name === 'cheek');
  const beard = patches.find((p) => p.name === 'beardJaw');
  const Ec = patchEnergy(g, D, { ...cheek, local: { ...cheek.local, y: cheek.local.y + shift } });
  const Eb = patchEnergy(g, D, { ...beard, local: { ...beard.local, y: beard.local.y + shift } });
  const T = (Ec + Eb) / 2;
  if (!quiet) {
    console.log(`\n=== ${file}  (disc cx=${D.cx} cy=${D.cy} R=${D.R}; ${(PENNY.s / 47 * D.R).toFixed(2)} px per local unit)`);
    console.log(`    texture window r=${WIN} local; cheek E=${Ec.toFixed(2)}  beardJaw E=${Eb.toFixed(2)}  threshold T=${T.toFixed(2)} (midpoint, TARGET-derived)`);
    if (!(Eb > Ec)) console.log('    *** beardJaw is not more textured than cheek on this reference — the discriminator has no contrast here ***');
    console.log(`    y search window [${YLO}, ${YHI}], step ${STEP}, run ${RUN} local units`);
  }
  const edge = {};
  for (const x of XS) {
    const prof = [];
    for (let y = YLO; y <= YHI + 1e-9; y += STEP) prof.push([+y.toFixed(3), energyAt(g, D, x, y + shift, WIN)]);
    const need = Math.round(RUN / STEP);
    const cands = [];
    for (let i = 0; i + need < prof.length; i++) {
      if (prof[i][1] === null) continue;
      if (i > 0 && prof[i - 1][1] !== null && prof[i - 1][1] >= T) continue;   // only rising crossings
      let ok = true;
      for (let k = 0; k <= need; k++) if (prof[i + k][1] === null || prof[i + k][1] < T) { ok = false; break; }
      if (ok) cands.push(prof[i][0]);
    }
    const top = cands.length ? cands[0] : null;
    edge[x] = { top, cands, bound: top !== null && (Math.abs(top - YLO) < 1e-9 || Math.abs(top - YHI) < 1e-9) };
    if (!quiet) console.log(`    x=${String(x).padStart(3)}  top edge y = ${top === null ? 'NO CROSSING' : (edge[x].bound ? `BOUND ${top}` : top.toFixed(2).padStart(6))}   candidates [${cands.map((c) => c.toFixed(1)).join(', ')}]`);
  }
  return { edge, T, Ec, Eb };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = {};
  for (const f of Object.keys(DISCS)) out[f] = (await whiskerEdge(f, SHIFT)).edge;
  console.log('\nSUMMARY — coin whisker-field top edge, local y, by reference');
  console.log('    x   ' + Object.keys(DISCS).map((f) => f.padStart(17)).join(''));
  for (const x of XS) {
    console.log(`  ${String(x).padStart(3)}   ` + Object.keys(DISCS).map((f) => {
      const e = out[f][x]; return (e.top === null ? 'none' : e.bound ? `BOUND` : e.top.toFixed(2)).padStart(17);
    }).join(''));
  }
  if (SHIFT) console.log(`\n(RESPONSE TEST: grid shifted by ${SHIFT} local units in y; every edge above must be ${-SHIFT} from the unshifted run)`);
}
