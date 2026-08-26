// DIME REVERSE — DOES THE OAK BRANCH FORK, AND WHERE?
//
// Reports only (WRITERS.md). Never writes into src/.
//
// WHY THIS EXISTS. `_dr14oakstem.mjs` fitted ONE straight centreline to the oak
// stem and `torch()` ships it, extrapolated, from y 71 all the way up to y 38.4.
// The fit's own rows were y 54..71 and its own header says the part above y 54
// is an extrapolation. This instrument asks the question that extrapolation
// assumes away: whether there is a single stem up there at all.
//
// THE EVIDENCE THAT STARTED IT. `deviceMask()` floods field inward from the
// border, so any field pocket fully ENCLOSED by device is called device. The
// largest such pocket on the oak is 8.3 sq units at x 65.5..67.8, y 47.4..54.4.
// A pocket that shape, bounded by device left and right and closed at the
// bottom, is what a FORK looks like to a flood fill — and our stem is drawn
// straight through it.
//
// ESTIMATORS DELIBERATELY UNLIKE EACH OTHER, so the fork cannot be an artefact
// of any one of them — and the two that matter never touch the flood mask:
//
//   `pocket`  the enclosed-field components themselves, per file. On unc2005 a
//             global `--reopen 1.0` reopens 946 sq units because that file is
//             dark-outline with bright interiors (ledger D32), so the
//             components are BOUNDED here (inside a given window, area 1..40 sq
//             units) and every one is printed with its bbox rather than summed.
//             The comparison is between two files' pocket LISTS, not between
//             two masks. Point it at the OLIVE's mirrored window for the null.
//   `bare`    the bare field itself, row by row, straight off each photograph
//             with no mask in the path at all. A bare channel with device on
//             BOTH sides is a fork gap. THIS IS THE LOAD-BEARING ONE.
//   `runs`    the DARK RELIEF OUTLINE estimator (`_dr14oakstem.mjs`'s, which is
//             `_dr8shaft.mjs`'s) row by row: how many stem-shaped marks does
//             each row carry? Published with its failure rate — in the crown it
//             returns up to eight marks a row and is not usable there.
//   `prongs`  the pocket's own two walls, tabulated: they ARE the prongs' facing
//             faces, measured on the same rows.
//   `trace`   a continuity tracker seeded at the trunk and at each prong.
//             ⚠️ IT DOES NOT WORK HERE AND IS KEPT AS THE NEGATIVE RESULT.
//             Seeded from `bare`'s own channel walls it survives 1 row on
//             proofbright's prongs and 7 on unc2005's inboard prong before the
//             dark-outline estimator returns nothing 1.1..3.4 wide within 0.9
//             units of the prediction. That is the same failure `_dr8shaft.mjs`
//             recorded: in the oak crown this estimator has no boundary to find
//             because the foliage touches the stem. Anyone reaching for a
//             tracker here should read the output first.
//
// AND THE ONES THAT SCORE OUR OWN DRAWING AGAINST IT:
//
//   `outside` where our node's outside ink is, row by row, with the fork
//             reopened on proofbright — which `_dr14oakstem.mjs outside` cannot
//             do, so it reported the fork rows as clean.
//   `ceiling` FILL's ceiling recomputed for a FORKED branch. The published
//             44.7 % assumed one centreline and is the wrong denominator now.
//   `overlap` what this element hides under. A low OUTSIDE is not a pass.
//   `pic`     our stem over each reference's mask at 40 px per viewBox unit.
//   `crop`    the photographs themselves on a ONE-UNIT grid.
//
// usage:
//   node _dr17oakfork.mjs pocket [x0 x1 y0 y1]
//   node _dr17oakfork.mjs bare [offsetLo offsetHi]
//   node _dr17oakfork.mjs runs [offsetLo offsetHi]
//   node _dr17oakfork.mjs prongs | trace | ceiling
//   node _dr17oakfork.mjs outside [--node <id>]
//   node _dr17oakfork.mjs overlap [--node <id>]
//   node _dr17oakfork.mjs pic  [x0 x1 y0 y1]
//   node _dr17oakfork.mjs crop [x0 x1 y0 y1 [pxPerUnit]]
import { samplerFor } from './_dr2grid.mjs';
import { deviceMask } from './_dr9branch.mjs';

const REFS = ['dime-rev-proofbright.png', 'dime-rev-unc2005.png'];
const T_OF = { 'dime-rev-proofbright.png': 236, 'dime-rev-unc2005.png': 190 };
const X0 = 13, X1 = 87, Y0 = 17, Y1 = 85, S = 0.05;
const MW = Math.round((X1 - X0) / S), MH = Math.round((Y1 - Y0) / S);
const short = (f) => f.slice(9, -4);

// ── estimator 2's plumbing, copied in spirit from `_dr14oakstem.mjs` so the two
// can be compared, but scanning a WIDER offset band (10..26) because a prong
// leaves the 11..22 band the centreline instrument used.
const STEP = 0.05;
const sample = (at, x, y) => (at(x, y - 0.12) + at(x, y) + at(x, y + 0.12)) / 3;
const X = (f, o) => 50 + f * o;

function levels(at) {
  const field = [], solid = [];
  for (let a = 0; a < 360; a += 3) {
    const r = 43, t = (a * Math.PI) / 180;
    field.push(at(50 + r * Math.cos(t), 50 + r * Math.sin(t)));
  }
  for (let y = 40; y <= 44; y += 0.5) for (let x = 47; x <= 53; x += 0.5) solid.push(at(x, y));
  const med = (a) => a.slice().sort((p, q) => p - q)[a.length >> 1];
  return { field: med(field), solid: med(solid) };
}

function darkRuns(at, y, f, a, b, T) {
  const runs = []; let s = null;
  for (let o = a; o <= b; o += STEP) {
    const dark = sample(at, X(f, o), y) < T;
    if (dark && s === null) s = o;
    if (!dark && s !== null) { if (o - s >= 0.15) runs.push([s, o - STEP]); s = null; }
  }
  if (s !== null) runs.push([s, b]);
  return runs;
}

const WMIN = 1.1, WMAX = 3.4;
/** EVERY stem-shaped mark on the row, not just the one nearest a guess. */
function stemsOn(at, y, f, a, b, T) {
  const runs = darkRuns(at, y, f, a, b, T);
  const thin = (r) => r[1] - r[0] <= 1.3;
  const got = [];
  for (let i = 0; i < runs.length - 1; i++) {
    const w = runs[i + 1][1] - runs[i][0];
    if (w >= WMIN && w <= WMAX && thin(runs[i]) && thin(runs[i + 1])) got.push([runs[i][0], runs[i + 1][1]]);
  }
  if (got.length) return got;
  return runs.filter((r) => r[1] - r[0] >= WMIN && r[1] - r[0] <= WMAX);
}

const files = {};
for (const f of REFS) {
  const s = await samplerFor(f);
  const L = levels(s.at);
  files[f] = { at: s.at, L, T: (L.field + L.solid) / 2 };
}

const mode = process.argv[2] || 'pocket';

// ── 1. THE POCKETS THEMSELVES, per file, bounded so unc2005 can be read too.
if (mode === 'pocket') {
  const WIN = process.argv.length > 6 ? process.argv.slice(3, 7).map(Number) : [58, 80, 36, 62];
  console.log(`ENCLOSED-FIELD COMPONENTS inside x ${WIN[0]}..${WIN[1]} y ${WIN[2]}..${WIN[3]}.`);
  console.log('A component is field (>= the file\'s own threshold) that the border flood');
  console.log('could not reach. Listed, not summed: 1..40 sq units, largest first.\n');
  for (const f of REFS) {
    const T = T_OF[f];
    const mask = await deviceMask(f, T, 0);
    const s = await samplerFor(f, 2400);
    const light = new Uint8Array(MW * MH);
    for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
      light[j * MW + i] = s.at(X0 + i * S, Y0 + j * S) >= T ? 1 : 0;
    }
    const seen = new Int8Array(MW * MH);
    const comps = [];
    for (let k0 = 0; k0 < MW * MH; k0++) {
      if (!mask[k0] || !light[k0] || seen[k0]) continue;
      const q = [k0]; seen[k0] = 1; const cells = [k0];
      while (q.length) {
        const c = q.pop(), i = c % MW;
        for (const d of [1, -1, MW, -MW]) {
          const m = c + d;
          if (m < 0 || m >= MW * MH) continue;
          if (d === 1 && i === MW - 1) continue;
          if (d === -1 && i === 0) continue;
          if (mask[m] && light[m] && !seen[m]) { seen[m] = 1; q.push(m); cells.push(m); }
        }
      }
      let ax0 = 1e9, ax1 = -1e9, ay0 = 1e9, ay1 = -1e9;
      for (const c of cells) {
        const i = c % MW, j = (c - i) / MW, x = X0 + i * S, y = Y0 + j * S;
        if (x < ax0) ax0 = x; if (x > ax1) ax1 = x;
        if (y < ay0) ay0 = y; if (y > ay1) ay1 = y;
      }
      const area = cells.length * S * S;
      if (area < 1 || area > 40) continue;
      if (ax0 < WIN[0] || ax1 > WIN[1] || ay0 < WIN[2] || ay1 > WIN[3]) continue;
      comps.push({ area, ax0, ax1, ay0, ay1 });
    }
    comps.sort((a, b) => b.area - a.area);
    console.log(`  == ${f}`);
    for (const c of comps.slice(0, 8)) {
      console.log(`     ${c.area.toFixed(2).padStart(6)} sq units   x ${c.ax0.toFixed(1)}..${c.ax1.toFixed(1)}`
        + `  y ${c.ay0.toFixed(1)}..${c.ay1.toFixed(1)}`
        + `   (offsets ${(c.ax0 - 50).toFixed(1)}..${(c.ax1 - 50).toFixed(1)})`);
    }
    if (!comps.length) console.log('     (none in range)');
    console.log('');
  }
  process.exit(0);
}

// ── 2. HOW MANY STEM-SHAPED MARKS PER ROW, by the dark-outline estimator.
if (mode === 'runs') {
  const A = Number(process.argv[3] ?? 10), B = Number(process.argv[4] ?? 26);
  console.log(`STEM-SHAPED MARKS (dark relief outline, width ${WMIN}..${WMAX}) per row,`);
  console.log(`offsets ${A}..${B} on the OAK. Two marks on a row = the branch has divided.\n`);
  console.log('    y |  proofbright oak                 |  unc2005 oak');
  for (let y = 40; y <= 60; y += 0.5) {
    const cells = REFS.map((f) => stemsOn(files[f].at, y, +1, A, B, files[f].T)
      .map(([p, q]) => `${((p + q) / 2).toFixed(2)}/${(q - p).toFixed(2)}`).join('  ') || '—');
    console.log(`${String(y).padStart(5)} | ${cells[0].padEnd(32)} | ${cells[1]}`);
  }
  console.log('\nFor contrast, the OLIVE on the same rows — the branch that does NOT fork:');
  console.log('    y |  proofbright olive               |  unc2005 olive');
  for (let y = 40; y <= 60; y += 0.5) {
    const cells = REFS.map((f) => stemsOn(files[f].at, y, -1, A, B, files[f].T)
      .map(([p, q]) => `${((p + q) / 2).toFixed(2)}/${(q - p).toFixed(2)}`).join('  ') || '—');
    console.log(`${String(y).padStart(5)} | ${cells[0].padEnd(32)} | ${cells[1]}`);
  }
  process.exit(0);
}

// ── 2b. THE BARE FIELD ITSELF, row by row, straight off the photograph.
//
// No flood, no mask, no run-width rule: a sample is BARE if it is within 15 %
// of this file's own field level, which is the same normalisation
// `_dr14oakstem.mjs profile` prints as '.'. Everything else is device. A row
// below the fork shows ONE device band with bare field either side; a row above
// it shows TWO, with a bare channel between them. That channel is the fork gap,
// and it is being read here without any of the three estimators above.
if (mode === 'bare') {
  const A = Number(process.argv[3] ?? 8), B = Number(process.argv[4] ?? 28);
  console.log(`BARE FIELD on the OAK, offsets ${A}..${B}, straight off the photograph.`);
  console.log('(bare = within 15 % of this file\'s own field level; runs shorter than 0.4 dropped)\n');
  for (const f of REFS) {
    const { at, L } = files[f];
    const cut = L.solid + 0.85 * (L.field - L.solid);
    console.log(`  == ${f}   field ${L.field.toFixed(0)}  solid ${L.solid.toFixed(0)}  bare > ${cut.toFixed(0)}`);
    for (let y = 38; y <= 60; y += 0.5) {
      const runs = []; let s = null;
      for (let o = A; o <= B; o += STEP) {
        const bare = sample(at, X(+1, o), y) > cut;
        if (bare && s === null) s = o;
        if (!bare && s !== null) { if (o - s >= 0.4) runs.push([s, o - STEP]); s = null; }
      }
      if (s !== null && B - s >= 0.4) runs.push([s, B]);
      // an INTERIOR bare run is one with device on both sides inside the band
      const marks = runs.map(([p, q], i) => `${p.toFixed(1)}-${q.toFixed(1)}`
        + (i > 0 && i < runs.length - 1 ? '*' : (p > A + 0.01 && q < B - 0.01 ? '*' : '')));
      console.log(`   y=${String(y).padStart(4)}  ${marks.join('  ')}`);
    }
    console.log('   * = a bare channel with device on BOTH sides of it\n');
  }
  process.exit(0);
}

// ── 3. THE POCKET'S OWN WALLS ARE THE PRONGS.
//
// The two prongs are read WITHOUT the run estimator, from the pocket itself:
// on each row the pocket's left edge is the inboard prong's outboard face and
// its right edge is the outboard prong's inboard face. Those are two edges of
// two different marks, they are measured on the SAME rows, and a straight line
// through each meets at the fork. That is a construction the run estimator
// cannot bias, because it does not use it.
if (mode === 'prongs') {
  const fits = {};
  for (const f of REFS) {
    const T = T_OF[f];
    const mask = await deviceMask(f, T, 0);
    const s = await samplerFor(f, 2400);
    const light = new Uint8Array(MW * MH);
    for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
      light[j * MW + i] = s.at(X0 + i * S, Y0 + j * S) >= T ? 1 : 0;
    }
    // the pocket = the enclosed component whose bbox straddles x 66, y 50
    const seen = new Int8Array(MW * MH);
    let best = null;
    for (let k0 = 0; k0 < MW * MH; k0++) {
      if (!mask[k0] || !light[k0] || seen[k0]) continue;
      const q = [k0]; seen[k0] = 1; const cells = [k0];
      while (q.length) {
        const c = q.pop(), i = c % MW;
        for (const d of [1, -1, MW, -MW]) {
          const m = c + d;
          if (m < 0 || m >= MW * MH) continue;
          if (d === 1 && i === MW - 1) continue;
          if (d === -1 && i === 0) continue;
          if (mask[m] && light[m] && !seen[m]) { seen[m] = 1; q.push(m); cells.push(m); }
        }
      }
      const area = cells.length * S * S;
      if (area < 2) continue;
      let hit = false;
      for (const c of cells) {
        const i = c % MW, j = (c - i) / MW;
        if (Math.abs(X0 + i * S - 66.5) < 1.2 && Math.abs(Y0 + j * S - 51) < 1.5) { hit = true; break; }
      }
      if (hit && (!best || cells.length > best.length)) best = cells;
    }
    if (!best) { console.log(`  ${f}: no enclosed pocket at (66.5, 51)`); continue; }
    const rows = new Map();
    for (const c of best) {
      const i = c % MW, j = (c - i) / MW, x = X0 + i * S, y = +(Y0 + j * S).toFixed(2);
      const r = rows.get(y) ?? [1e9, -1e9];
      rows.set(y, [Math.min(r[0], x), Math.max(r[1], x)]);
    }
    const ys = [...rows.keys()].sort((a, b) => a - b);
    console.log(`\n== ${f}   pocket ${(best.length * S * S).toFixed(2)} sq units,`
      + ` y ${ys[0].toFixed(1)}..${ys[ys.length - 1].toFixed(1)}`);
    console.log('     y  | pocket left  pocket right  width');
    for (const y of ys) {
      if (Math.abs(y * 2 - Math.round(y * 2)) > 1e-6) continue;
      const [a, b] = rows.get(y);
      console.log(`  ${y.toFixed(1).padStart(5)} |   ${(a - 50).toFixed(2).padStart(6)}`
        + `      ${(b - 50).toFixed(2).padStart(6)}      ${(b - a).toFixed(2)}`);
    }
    // fit each wall over the rows where the pocket is more than 0.4 wide, so the
    // rows where the two walls have already met are not fitted as if they had not
    const use = ys.filter((y) => rows.get(y)[1] - rows.get(y)[0] >= 0.4);
    const fit = (pick) => {
      const pts = use.map((y) => [y, pick(rows.get(y)) - 50]);
      const my = pts.reduce((p, q) => p + q[0], 0) / pts.length;
      const mc = pts.reduce((p, q) => p + q[1], 0) / pts.length;
      const b = pts.reduce((p, q) => p + (q[0] - my) * (q[1] - mc), 0)
        / pts.reduce((p, q) => p + (q[0] - my) ** 2, 0);
      const res = pts.map(([y, c]) => c - (mc + b * (y - my)));
      return { my, mc, b, n: pts.length,
        rms: Math.sqrt(res.reduce((p, q) => p + q * q, 0) / res.length) };
    };
    const L = fit((r) => r[0]), R = fit((r) => r[1]);
    const at = (F, y) => F.mc + F.b * (y - F.my);
    // where the two walls meet: solve at(L,y) = at(R,y)
    const yMeet = (at(R, 0) - at(L, 0)) / (L.b - R.b);
    fits[f] = { L, R, at, yMeet };
    console.log(`  inboard prong's OUTBOARD face:  o(y) = ${at(L, 50).toFixed(2)} `
      + `${L.b >= 0 ? '+' : '−'} ${Math.abs(L.b).toFixed(4)}·(y − 50)   n=${L.n} RMS ${L.rms.toFixed(3)}`);
    console.log(`  outboard prong's INBOARD face:  o(y) = ${at(R, 50).toFixed(2)} `
      + `${R.b >= 0 ? '+' : '−'} ${Math.abs(R.b).toFixed(4)}·(y − 50)   n=${R.n} RMS ${R.rms.toFixed(3)}`);
    console.log(`  the two faces meet at y ${yMeet.toFixed(2)}, offset ${at(L, yMeet).toFixed(2)}  <- THE FORK`);
  }
  if (Object.keys(fits).length === 2) {
    const [p, q] = REFS.map((f) => fits[f]);
    console.log(`\nTHE TWO FILES AGREE: fork y ${p.yMeet.toFixed(2)} and ${q.yMeet.toFixed(2)}`
      + `  (mean ${((p.yMeet + q.yMeet) / 2).toFixed(2)})`);
    console.log(`  inboard-wall slopes ${p.L.b.toFixed(4)} / ${q.L.b.toFixed(4)}`
      + `   outboard-wall slopes ${p.R.b.toFixed(4)} / ${q.R.b.toFixed(4)}`);
  }
  process.exit(0);
}

// ── 4. FOLLOW EACH PRONG UP FROM THE FORK, ON THE PHOTOGRAPH.
//
// Neither the flood mask nor a row-wide run search can do this. The mask at
// erode 0 is dilated enough that every prong touches a leaf and the whole crown
// is one grey slab (see `pic`); a row-wide search returns eight marks a row up
// here and no rule picks the right one twice running.
//
// A TRACKER CAN. The mark itself is read with the SAME dark-relief-outline
// estimator `_dr8shaft.mjs` established and `_dr14oakstem.mjs` fitted the
// centreline with — a stem is a pair of thin dark outlines 1.1..3.4 apart, or
// one merged dark run of that width — so the quantity traced here is the
// quantity that instrument published, and the two are commensurable. What is
// new is only the SELECTION RULE: of the several such marks a crown row
// carries, take the one whose centre is nearest the position predicted from the
// rows below. Continuity is the whole of the rule; nothing about where the
// prong "should" be enters it.
//
// A BRIGHTNESS TRACKER WAS TRIED FIRST AND IS REFUSED, with the number: the two
// files have OPPOSITE polarity — proofbright's field is brighter than its
// frosted relief, unc2005's relief interior is brighter than its outlines — so
// "the bright run" is the FIELD on one file and the DEVICE on the other. Seeded
// at y 58 it locked onto offset 13.13 (pb) and 11.95 (unc) where the trunk is
// at 15.5, i.e. it tracked the bare channel beside the stem on both.
//
// AND IT STOPS RATHER THAN GUESSING. A prong that runs into a leaf stops being
// a 1.1..3.4 unit mark, so the trace ENDS at the first row with no such mark,
// or where the nearest one jumps more than 0.9 units. The row it stops on is
// printed. That is the difference between this and `_dr8shaft.mjs`'s rejected
// estimator #2, which returned a number for every row.
if (mode === 'trace') {
  const marksAt = (f, y) => stemsOn(files[f].at, y, +1, 8, 28, files[f].T)
    .map(([p, q]) => ({ c: (p + q) / 2, w: q - p }));
  /** walk from `y0` to `y1` (either direction) starting at offset `c0` */
  const walk = (f, y0, y1, c0) => {
    const dy = y1 > y0 ? 0.25 : -0.25;
    let c = c0, slope = 0, prev = null;
    const trace = [];
    for (let y = y0; dy > 0 ? y <= y1 : y >= y1; y += dy) {
      const pred = c + slope * dy;
      const cand = marksAt(f, y).sort((r, s) => Math.abs(r.c - pred) - Math.abs(s.c - pred));
      if (!cand.length) return { trace, stop: `${y}: no mark 1.1..3.4 wide on this row` };
      const g = cand[0];
      if (Math.abs(g.c - pred) > 0.9) return { trace, stop: `${y}: nearest mark ${g.c.toFixed(2)} jumps ${Math.abs(g.c - pred).toFixed(2)} from ${pred.toFixed(2)}` };
      if (prev !== null) slope = (slope * 2 + (g.c - prev) / dy) / 3;
      prev = c = g.c;
      trace.push([y, g.c, g.w]);
    }
    return { trace, stop: 'reached the end of the requested range' };
  };
  const fit = (tr) => {
    const my = tr.reduce((p, q) => p + q[0], 0) / tr.length;
    const mc = tr.reduce((p, q) => p + q[1], 0) / tr.length;
    const b = tr.reduce((p, q) => p + (q[0] - my) * (q[1] - mc), 0)
      / tr.reduce((p, q) => p + (q[0] - my) ** 2, 0);
    const res = tr.map(([y, c]) => c - (mc + b * (y - my)));
    const w = tr.map((q) => q[2]).sort((p, q) => p - q);
    return { my, mc, b, n: tr.length, w: w[w.length >> 1],
      rms: Math.sqrt(res.reduce((p, q) => p + q * q, 0) / res.length) };
  };
  /** the bare fork channel on row `y`: the interior bare run nearest offset 16 */
  const barecChannel = (f, y) => {
    const { at, L } = files[f];
    const cut = L.solid + 0.85 * (L.field - L.solid);
    const runs = []; let s = null;
    for (let o = 10; o <= 26; o += STEP) {
      const bare = sample(at, X(+1, o), y) > cut;
      if (bare && s === null) s = o;
      if (!bare && s !== null) { if (o - s >= 0.4) runs.push([s, o - STEP]); s = null; }
    }
    const inner = runs.filter((r) => r[0] > 10.01 && r[1] < 25.99 && r[1] - r[0] <= 2.5);
    if (!inner.length) return null;
    return inner.sort((a, b) => Math.abs((a[0] + a[1]) / 2 - 16) - Math.abs((b[0] + b[1]) / 2 - 16))[0];
  };
  const SEEDS = [
    ['TRUNK    ', 58, 46, null],   // up from below the fork; where does it stop?
    ['INBOARD  ', 51, 40, -1],     // up from mid-fork, inboard of the channel
    ['OUTBOARD ', 51, 40, +1],     // up from mid-fork, outboard of the channel
  ];
  console.log('RIDGE TRACES on the OAK — dark-outline mark, nearest-to-predicted, 0.25 units.\n');
  const out = {};
  for (const f of REFS) {
    console.log(`  == ${f}   (dark < ${files[f].T.toFixed(0)})`);
    // The trunk's seed is the mark nearest the CENTRELINE ALREADY PUBLISHED for
    // this row — `_dr14oakstem.mjs`'s fit, which was made on rows y 54..71 where
    // there is only one mark to fit and no fork question arises. Seeding a
    // tracker from the number under test is legitimate only because the trunk is
    // not what is under test; the prongs are, and they are seeded from the
    // pocket, which is a different measurement entirely.
    const CL = (y) => 15.955 - 0.02941 * (y - 62.5);
    const trunkSeed = marksAt(f, 58).sort((a, b) => Math.abs(a.c - CL(58)) - Math.abs(b.c - CL(58)))[0];
    if (!trunkSeed) { console.log('     no trunk mark at y 58'); continue; }
    for (const [label, y0, y1, side] of SEEDS) {
      let c0 = trunkSeed.c;
      if (side !== null) {
        // Each prong is seeded from the FORK CHANNEL's own wall at the seed row
        // — `bare`'s measurement, not this estimator's, and not a nomination —
        // one stem-width beyond it on that prong's side.
        const ch = barecChannel(f, y0);
        if (!ch) { console.log(`     ${label} no bare fork channel at y ${y0} to seed from`); continue; }
        c0 = side < 0 ? ch[0] - 1.0 : ch[1] + 1.0;
      }
      const r = walk(f, y0, y1, c0);
      if (r.trace.length < 4) { console.log(`     ${label} trace too short (${r.trace.length}) — ${r.stop}`); continue; }
      const F = fit(r.trace);
      out[`${f}|${label.trim()}`] = { F, trace: r.trace, stop: r.stop };
      const t = r.trace;
      console.log(`     ${label} y ${t[0][0]} → ${t[t.length - 1][0]}   n=${F.n}  median width ${F.w.toFixed(2)}`);
      console.log(`        o(y) = ${(F.mc + F.b * (50 - F.my)).toFixed(2)} `
        + `${F.b >= 0 ? '+' : '−'} ${Math.abs(F.b).toFixed(4)}·(y − 50)   RMS ${F.rms.toFixed(3)}`);
      console.log(`        stopped: ${r.stop}`);
      console.log('        ' + t.filter((q) => Math.abs(q[0] * 2 - Math.round(q[0] * 2)) < 1e-9
        && Math.abs(q[0] - Math.round(q[0])) < 1e-9)
        .map(([y, c, w]) => `y${y}:${c.toFixed(2)}/${w.toFixed(2)}`).join('  '));
    }
    console.log('');
  }
  console.log('WHERE THE THREE LINES MEET — the fork, solved from the fits:');
  for (const f of REFS) {
    const T = out[`${f}|TRUNK`], I = out[`${f}|INBOARD`], O = out[`${f}|OUTBOARD`];
    if (!T || !I || !O) { console.log(`  ${short(f)}: not all three traced`); continue; }
    const at = (F, y) => F.F.mc + F.F.b * (y - F.F.my);
    const meet = (A, B) => (at(B, 0) - at(A, 0)) / (A.F.b - B.F.b);
    const yio = meet(I, O);
    console.log(`  ${short(f).padEnd(12)} inboard × outboard at y ${yio.toFixed(2)}, offset ${at(I, yio).toFixed(2)}`);
    console.log(`  ${''.padEnd(12)} trunk   × inboard  at y ${meet(T, I).toFixed(2)}`
      + `   trunk × outboard at y ${meet(T, O).toFixed(2)}`);
  }
  process.exit(0);
}

// ── 5. WHERE OUR OWN OUTSIDE INK IS, row by row, with the fork REOPENED.
//
// `_dr14oakstem.mjs outside` does this against the mask as flooded, which fills
// the fork and therefore reports the fork rows as clean. This repeats it with
// `--reopen 1.0` on proofbright, so the rows that are actually costing the
// element are visible. `--node <id>` scores any node, so a candidate stem can be
// compared row for row with the shipped one.
if (mode === 'outside') {
  const sharp = (await import('sharp')).default;
  const { nodes, resolve, reopen } = await import('./_dr13elem.mjs');
  const { coinSVG } = await import('../../src/art/coins.js');
  const id = process.argv.includes('--node')
    ? process.argv[process.argv.indexOf('--node') + 1] : '2.1.4';
  const { head, out } = nodes(coinSVG('dime', 380, { side: 'reverse' }));
  const full = Math.round(100 / S);
  const { data, info } = await sharp(Buffer.from(`${head}${resolve(head, out, id)}</svg>`))
    .resize(full, full, { fit: 'fill' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const ink = new Uint8Array(MW * MH);
  for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
    const p = (Math.round((Y0 + j * S) / S) * info.width + Math.round((X0 + i * S) / S)) * info.channels;
    if (data[p + info.channels - 1] > 24) ink[j * MW + i] = 1;
  }
  console.log(`OUR NODE ${id}, outside ink by row. erode 0 on both files;`);
  console.log('proofbright ALSO with --reopen 1.0, unc2005 never (it reopens 946 sq units there).\n');
  const masks = [];
  for (const f of REFS) {
    let m = await deviceMask(f, T_OF[f], 0);
    if (f === REFS[0]) m = await reopen(m, f, T_OF[f], 1.0);
    masks.push(m);
  }
  console.log('     y  |  our span     |  pb out   unc out   (sq units per 1.0-unit band)');
  let tp = 0, tu = 0, tn = 0;
  for (let y = 36; y < 78; y += 1) {
    let n = 0, op = 0, ou = 0, a = 1e9, b = -1e9;
    for (let j = Math.round((y - Y0) / S); j < Math.round((y + 1 - Y0) / S); j++) {
      for (let i = 0; i < MW; i++) {
        const k = j * MW + i; if (!ink[k]) continue;
        n++; const x = X0 + i * S; if (x < a) a = x; if (x > b) b = x;
        if (!masks[0][k]) op++;
        if (!masks[1][k]) ou++;
      }
    }
    if (!n) continue;
    tp += op; tu += ou; tn += n;
    console.log(`  ${String(y).padStart(4)}  |  ${(a - 50).toFixed(2)}..${(b - 50).toFixed(2)}`
      + `  |  ${(op * S * S).toFixed(2).padStart(6)}   ${(ou * S * S).toFixed(2).padStart(6)}`
      + `   ${op * S * S > 0.3 ? '<<<' : ''}`);
  }
  console.log(`  TOTAL ink ${(tn * S * S).toFixed(2)}   pb outside ${(tp * S * S).toFixed(2)}`
    + ` (${(100 * tp / tn).toFixed(2)} %)   unc outside ${(tu * S * S).toFixed(2)} (${(100 * tu / tn).toFixed(2)} %)`);
  process.exit(0);
}

// ── 6. WHAT DOES THIS ELEMENT HIDE UNDER?
//
// A low OUTSIDE is not a pass: ink that lands under a NEIGHBOUR is ink the mask
// already accounts for, so an element can score well by sliding beneath the
// leaves rather than by being in the right place. The oak stem's neighbours are
// its own seven leaves, the acorn, the torch and the legend, and this prints
// the shared area with each of them, as a fraction of this element's own ink.
// It needs no mask and no reference at all — it is a property of the drawing.
if (mode === 'overlap') {
  const sharp = (await import('sharp')).default;
  const { nodes, resolve, childrenOf } = await import('./_dr13elem.mjs');
  const { coinSVG } = await import('../../src/art/coins.js');
  const id = process.argv.includes('--node')
    ? process.argv[process.argv.indexOf('--node') + 1] : '2.1.4';
  const { head, out } = nodes(coinSVG('dime', 380, { side: 'reverse' }));
  const inkOf = async (frag) => {
    const full = Math.round(100 / S);
    const { data, info } = await sharp(Buffer.from(`${head}${frag}</svg>`))
      .resize(full, full, { fit: 'fill' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const a = new Uint8Array(MW * MH);
    for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
      const p = (Math.round((Y0 + j * S) / S) * info.width + Math.round((X0 + i * S) / S)) * info.channels;
      if (data[p + info.channels - 1] > 24) a[j * MW + i] = 1;
    }
    return a;
  };
  const mine = await inkOf(resolve(head, out, id));
  let n = 0; for (let k = 0; k < MW * MH; k++) if (mine[k]) n++;
  const parent = id.split('.').slice(0, -1).join('.');
  let pnode = null, plist = out;
  for (const q of parent.split('.').map(Number)) {
    pnode = plist[q]; if (pnode && pnode.startsWith('<g')) plist = childrenOf(pnode).kids;
  }
  const kids = childrenOf(pnode).kids;
  console.log(`node ${id}: ${(n * S * S).toFixed(2)} sq units of ink. Shared with each sibling:\n`);
  const union = new Uint8Array(MW * MH);
  for (let q = 0; q < kids.length; q++) {
    if (String(q) === id.split('.').pop()) continue;
    const a = await inkOf(resolve(head, out, `${parent}.${q}`));
    let s = 0;
    for (let k = 0; k < MW * MH; k++) { if (a[k] && mine[k]) { s++; union[k] = 1; } }
    if (s) console.log(`  ${parent}.${q}`.padEnd(12)
      + `${(s * S * S).toFixed(2).padStart(7)} sq units   ${(100 * s / n).toFixed(2)} % of this element`);
  }
  for (let q = 0; q < out.length; q++) {
    if (!out[q].includes('<text')) continue;
    const a = await inkOf(out[q]);
    let s = 0;
    for (let k = 0; k < MW * MH; k++) { if (a[k] && mine[k]) { s++; union[k] = 1; } }
    if (s) console.log(`  text ${q}`.padEnd(12)
      + `${(s * S * S).toFixed(2).padStart(7)} sq units   ${(100 * s / n).toFixed(2)} % of this element`);
  }
  let u = 0; for (let k = 0; k < MW * MH; k++) if (union[k]) u++;
  console.log(`\n  UNION of all of them: ${(u * S * S).toFixed(2)} sq units, ${(100 * u / n).toFixed(2)} %`
    + ' of this element is under something else.');
  process.exit(0);
}

// ── 7. THE CEILING, RECOMPUTED FOR A FORKED BRANCH.
//
// `_dr14oakstem.mjs window` computes what fraction of the oak-stem window's
// exclusive target lies within one stem half-width of "the coin's own
// centreline", singular — 44.7 % on proofbright at the shipped erosion. That
// number is now wrong in the direction that flatters the element: with the
// branch forked there are TWO centrelines up there, and a drawing that reaches
// both can legitimately cover more. This recomputes the ceiling as the union of
// a band about the trunk/spike and a band about the outboard prong, and prints
// it beside our own FILL so the two are the same kind of number.
if (mode === 'ceiling') {
  const sharp = (await import('sharp')).default;
  const { nodes, resolve, reopen } = await import('./_dr13elem.mjs');
  const { coinSVG } = await import('../../src/art/coins.js');
  const WIN = [62, 70, 36, 78];
  const cLine = (y) => (y <= 71 ? 15.96 - 0.0294 * (y - 62.5)
    : 15.71 - 0.0778 * (y - 71) - 0.0586 * (y - 71) ** 2);
  const pC = (y) => { const u = 54.2 - y; return 16.4 + 0.7011 * u - 0.0306 * u * u; };
  const { head, out } = nodes(coinSVG('dime', 380, { side: 'reverse' }));
  const inkOf = async (frag) => {
    const full = Math.round(100 / S);
    const { data, info } = await sharp(Buffer.from(`${head}${frag}</svg>`))
      .resize(full, full, { fit: 'fill' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const a = new Uint8Array(MW * MH);
    for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
      const p = (Math.round((Y0 + j * S) / S) * info.width + Math.round((X0 + i * S) / S)) * info.channels;
      if (data[p + info.channels - 1] > 24) a[j * MW + i] = 1;
    }
    return a;
  };
  const mine = await inkOf(resolve(head, out, '2.1.4'));
  // everything else on the face, as `_dr13elem.mjs` builds it
  const others = new Uint8Array(MW * MH);
  {
    const { childrenOf } = await import('./_dr13elem.mjs');
    let pnode = null, plist = out;
    for (const q of [2, 1]) { pnode = plist[q]; if (pnode && pnode.startsWith('<g')) plist = childrenOf(pnode).kids; }
    const kids = childrenOf(pnode).kids;
    for (let q = 0; q < kids.length; q++) {
      if (q === 4) continue;
      const a = await inkOf(resolve(head, out, `2.1.${q}`));
      for (let k = 0; k < MW * MH; k++) if (a[k]) others[k] = 1;
    }
    for (let q = 0; q < out.length; q++) if (out[q].includes('<text')) {
      const a = await inkOf(out[q]); for (let k = 0; k < MW * MH; k++) if (a[k]) others[k] = 1;
    }
  }
  console.log(`WINDOWS['oak-stem'] = [${WIN.join(', ')}], exclusive target, three mask settings.`);
  console.log('CEILING(1) = within 1.175 of the single fitted centreline (what `_dr14oakstem window` prints)');
  console.log('CEILING(2) = that band UNION a 0.78 half-width band about the measured outboard prong\n');
  for (const [f, E, rp] of [['dime-rev-proofbright.png', 0.55, 0], ['dime-rev-proofbright.png', 0, 0],
    ['dime-rev-proofbright.png', 0, 1.0], ['dime-rev-unc2005.png', 1.0, 0], ['dime-rev-unc2005.png', 0, 0]]) {
    let m = await deviceMask(f, T_OF[f], E);
    if (rp > 0) m = await reopen(m, f, T_OF[f], rp);
    let ex = 0, c1 = 0, c2 = 0, hit = 0, mineOutWin = 0;
    for (let j = 0; j < MH; j++) {
      const y = Y0 + j * S; if (y < WIN[2] || y > WIN[3]) continue;
      for (let i = 0; i < MW; i++) {
        const x = X0 + i * S; const k = j * MW + i;
        if (x < WIN[0] || x > WIN[1]) { if (mine[k]) mineOutWin++; continue; }
        if (!m[k] || others[k]) continue;
        ex++; if (mine[k]) hit++;
        const inTrunk = y >= 38.4 && y <= 75.7 && Math.abs((x - 50) - cLine(y)) <= 1.175;
        const inProng = y >= 42 && y <= 55.6 && Math.abs((x - 50) - pC(y)) <= 0.78;
        if (inTrunk) c1++;
        if (inTrunk || inProng) c2++;
      }
    }
    const u = (v) => (v * S * S).toFixed(2);
    console.log(`  ${short(f).padEnd(12)} erode ${E.toFixed(2)}${rp ? ' reopen 1.0' : '          '}`
      + `  exclusive ${u(ex).padStart(7)}   ours ${(100 * hit / ex).toFixed(2)}%`
      + `   CEILING(1) ${(100 * c1 / ex).toFixed(1)}%   CEILING(2) ${(100 * c2 / ex).toFixed(1)}%`);
  }
  let n = 0, ow = 0;
  for (let j = 0; j < MH; j++) {
    const y = Y0 + j * S;
    for (let i = 0; i < MW; i++) {
      const x = X0 + i * S, k = j * MW + i;
      if (!mine[k]) continue; n++;
      if (x < WIN[0] || x > WIN[1] || y < WIN[2] || y > WIN[3]) ow++;
    }
  }
  console.log(`\n  OUR OWN INK OUTSIDE THE WINDOW: ${(ow * S * S).toFixed(2)} of ${(n * S * S).toFixed(2)}`
    + ` sq units (${(100 * ow / n).toFixed(1)} %) — the prong's outboard end passes x 70,`);
  console.log('  so FILL\'s denominator does not cover all of this element. WINDOWS is left alone:');
  console.log('  moving it would make every FILL published against it incomparable.');
  process.exit(0);
}

// ── THE PICTURE. Our drawn stem over each reference's own reopened mask, at
// 40 px per viewBox unit, so the fork can be SEEN and not only fitted.
if (mode === 'pic') {
  const sharp = (await import('sharp')).default;
  const { join } = await import('node:path');
  const { JUDGE } = await import('./_paths.mjs');
  const { nodes, resolve, reopen } = await import('./_dr13elem.mjs');
  const { coinSVG } = await import('../../src/art/coins.js');
  const [cx0, cx1, cy0, cy1] = process.argv.length > 6
    ? process.argv.slice(3, 7).map(Number) : [61, 74, 42, 60];
  const { head, out } = nodes(coinSVG('dime', 380, { side: 'reverse' }));
  const full = Math.round(100 / S);
  const { data, info } = await sharp(Buffer.from(`${head}${resolve(head, out, '2.1.4')}</svg>`))
    .resize(full, full, { fit: 'fill' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const ink = new Uint8Array(MW * MH);
  for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
    const p = (Math.round((Y0 + j * S) / S) * info.width + Math.round((X0 + i * S) / S)) * info.channels;
    if (data[p + info.channels - 1] > 24) ink[j * MW + i] = 1;
  }
  const w = Math.round((cx1 - cx0) / S), h = Math.round((cy1 - cy0) / S);
  const Z = Number(process.argv[7] ?? 2); // 20 px per viewBox unit x Z
  const panels = [];
  for (const f of REFS) {
    let m = await deviceMask(f, T_OF[f], 0);
    if (f === REFS[0]) m = await reopen(m, f, T_OF[f], 1.0);
    const b = Buffer.alloc(w * h * 3, 255);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const k = (Math.round((cy0 - Y0) / S) + j) * MW + Math.round((cx0 - X0) / S) + i;
      const c = ink[k] && m[k] ? [20, 110, 60] : ink[k] ? [210, 40, 40] : m[k] ? [190, 190, 190] : [255, 255, 255];
      b[(j * w + i) * 3] = c[0]; b[(j * w + i) * 3 + 1] = c[1]; b[(j * w + i) * 3 + 2] = c[2];
    }
    panels.push(await sharp(b, { raw: { width: w, height: h, channels: 3 } })
      .resize(w * Z, h * Z, { kernel: 'nearest' }).png().toBuffer());
  }
  const fo = join(JUDGE, '_dr17-fork.png');
  await sharp({ create: { width: w * Z * 2 + 30, height: h * Z, channels: 3, background: '#fff' } })
    .composite([{ input: panels[0], left: 0, top: 0 }, { input: panels[1], left: w * Z + 30, top: 0 }])
    .png().toFile(fo);
  console.log(`wrote ${fo}  —  proofbright (reopened 1.0) | unc2005 (raw, erode 0), ${Z * 20} px/unit`);
  console.log('  green = our stem on device, RED = our stem on bare field, grey = device we do not draw');
  process.exit(0);
}

// ── THE PHOTOGRAPH ITSELF, on a ONE-UNIT grid.
//
// `_dr2grid.mjs crop` rules a line every 5 units, which is the right density
// for placing a leaf and the wrong one for reading a fork: a prong crosses two
// gridlines over its whole length there and every coordinate off it is an
// interpolation by eye. This is the same sampler and the same disc fit, ruled
// every unit (dotted) with every fifth solid, so a number read off it is read
// off a line and not between two.
if (mode === 'crop') {
  const sharp = (await import('sharp')).default;
  const { join } = await import('node:path');
  const { SCRATCH } = await import('./_paths.mjs');
  const [x0, x1, y0, y1, ppu] = process.argv.length > 7
    ? process.argv.slice(3, 8).map(Number) : [60, 80, 34, 58, 40];
  for (const f of [...REFS, 'ours']) {
    const s = await samplerFor(f);
    const W = Math.round((x1 - x0) * ppu), H = Math.round((y1 - y0) * ppu);
    const buf = Buffer.alloc(W * H * 3);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const v = Math.max(0, Math.min(255, Math.round(s.at(x0 + i / ppu, y0 + j / ppu))));
      const k = (j * W + i) * 3; buf[k] = buf[k + 1] = buf[k + 2] = v;
    }
    for (let Xv = Math.ceil(x0); Xv <= x1; Xv++) {
      const i = Math.round((Xv - x0) * ppu); if (i < 0 || i >= W) continue;
      const maj = Xv % 5 === 0;
      for (let j = 0; j < H; j++) {
        if (!maj && j % 16 > 1) continue;
        const k = (j * W + i) * 3;
        buf[k] = 255; buf[k + 1] = maj ? 0 : 170; buf[k + 2] = maj ? 0 : 170;
      }
    }
    for (let Yv = Math.ceil(y0); Yv <= y1; Yv++) {
      const j = Math.round((Yv - y0) * ppu); if (j < 0 || j >= H) continue;
      const maj = Yv % 5 === 0;
      for (let i = 0; i < W; i++) {
        if (!maj && i % 16 > 1) continue;
        const k = (j * W + i) * 3;
        buf[k] = maj ? 0 : 80; buf[k + 1] = maj ? 110 : 255; buf[k + 2] = 255;
      }
    }
    const o = `_dr17-crop-${f.replace(/\W/g, '_')}.png`;
    await sharp(buf, { raw: { width: W, height: H, channels: 3 } }).png().toFile(join(SCRATCH, o));
    console.log(`  ${f.padEnd(26)} -> ${o}  ${W}x${H}   x ${x0}..${x1}  y ${y0}..${y1} @ ${ppu} px/unit`);
  }
  console.log('  red verticals = viewBox x (solid every 5), cyan horizontals = viewBox y');
  process.exit(0);
}

console.log('usage: node _dr17oakfork.mjs [pocket|runs|prongs|trace|pic|crop [x0 x1 y0 y1 [ppu]]]');
