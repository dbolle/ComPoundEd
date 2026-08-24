// DIME REVERSE — round 31. THE CENTRELINE OF EACH BRANCH, as a curve y -> x,
// and the branch's WIDTH at the same rows.
//
// Reports only; writes only to the gitignored judge scratch (WRITERS.md).
//
// WHY IT EXISTS. Everything this face has ever published about the stem is a
// SINGLE NUMBER for a varying quantity: "the coin's stem offset 13.5 .. 15.5,
// near straight", then "15.9 is the number" from eleven reads on six rows, and
// `leafAt` returns `ax: 15.9` for all seven leaves at seven different heights.
// `_dr9branch.mjs`'s own STEM CENTRE block samples six rows and prints `--`
// wherever a leaf touches the stem, which is most of them. Nothing has ever
// asked whether the offset is the same at y 40 as at y 70 — and on
// `_dr2grid.mjs 22 46 24 80 26` it plainly is not.
//
// THE ESTIMATOR is `_dr9branch.mjs`'s: flood the field inward, erode by that
// round's calibration, and read device runs on one branch as offsets from the
// axis. Its null test against `_dr8shaft.mjs` is that round's and is not
// re-derived here. What is added is a TRACKER: seed on a row where the stem is
// the only narrow mark in the window, then walk up and down one row at a time,
// taking the run whose centre is nearest a linear extrapolation of the rows
// already accepted, and refusing a step that jumps further than `MAXJUMP` or
// lands on a run wider than `MAXW`.
//
// WHAT THE TRACKER CANNOT DO, stated because it bounds every number below: it
// stops where a leaf touches the stem, because at that row the stem is not a
// run of its own. Every row it prints is a row where the stem stood in open
// field on both sides; every row it refuses is reported as a gap, not
// interpolated. E PLURIBUS UNUM's strokes are the same width as the stem, so
// the rows y 62..68 are the ones to distrust and they are flagged.
//
// Run: node coloringbook/judge/_dr11path.mjs [--rows]
import { deviceMask, branchRuns, FILES } from './_dr9branch.mjs';
import { samplerFor } from './_dr2grid.mjs';

// ---------------------------------------------------------------------------
// THE STEM'S WIDTH, by `_dr8shaft.mjs`'s estimator rather than by the flood
// mask. The mask cannot answer this and says so: on the same rows it reads the
// olive stem at 1.15-1.85 units on `dime-rev-proofbright.png` and 0.35-1.00 on
// `dime-rev-unc2005.png`, a factor of three, because a proof's bevel skirt is a
// large fraction of a THIN mark and is counted as device. On the torch shaft —
// nine units wide — the same skirt is a small fraction and the two files agree.
//
// So the stem is measured the way the shaft was: the boundary is the DARK
// RELIEF OUTLINE and the width is the distance between the two darkest points,
// searched outward from the stem centre the chain already found and clamped to
// +-2.2 units so a letter of E PLURIBUS UNUM cannot be picked up. Our own
// drawing is a flat fill with no outline, so its boundary is the fill edge, at
// `_dr8shaft.mjs`'s own threshold and by its own function — the SAME pairing
// that round used, so the numbers are comparable to its shaft ladder.
const STEP = 0.05;
const g3 = (at, x, y) => (at(x, y - 0.12) + at(x, y) + at(x, y + 0.12)) / 3;
function darkest(at, y, a, b) {
  let bx = a, bv = Infinity;
  for (let x = a; x <= b; x += STEP) { const v = g3(at, x, y); if (v < bv) { bv = v; bx = x; } }
  const p = g3(at, bx - STEP, y), c = g3(at, bx, y), n = g3(at, bx + STEP, y);
  const d = p - 2 * c + n;
  return bx + (d === 0 ? 0 : (STEP * 0.5 * (p - n)) / d);
}
function fillEdge(at, y, a, b, outward) {
  const T = 165; let last = NaN;
  for (let x = outward > 0 ? a : b; outward > 0 ? x <= b : x >= a; x += outward * STEP) {
    if (g3(at, x, y) < T) last = x;
  }
  return last;
}
/** stem width at row y, given the centre OFFSET c0, on one branch */
export function stemWidth(at, y, c0, mirror, ours, reach = 2.2) {
  const X = (o) => (mirror ? 50 - o : 50 + o);
  const lo = Math.min(X(c0 - reach), X(c0 + reach)), hi = Math.max(X(c0 - reach), X(c0 + reach));
  const mid = X(c0);
  const L = ours ? fillEdge(at, y, lo, mid, -1) : darkest(at, y, lo, mid - 0.15);
  const R = ours ? fillEdge(at, y, mid, hi, +1) : darkest(at, y, mid + 0.15, hi);
  return R - L;
}

const MAXJUMP = 0.9;   // units of offset per 0.25 of y
const MAXW = 4.2;      // a run wider than this is a leaf, not a stem
const MINW = 0.4;

/** Walk the stem from a seed row, one STEP at a time, in direction `dir`.
 *  COASTING: a row where the stem is welded to a leaf carries no run of its
 *  own. Rather than stop there — which is what confined every previous
 *  measurement of this stem to the bare rows below the foliage — the walk
 *  carries the prediction forward on its current slope for up to `COAST`
 *  units of y and resumes if a legal run reappears near it. Coasted rows are
 *  NOT reported as measurements; only the rows that were actually read are,
 *  and the gaps are printed. */
function walk(dev, mirror, y0, x0, dir, yStop, step = 0.25, COAST = 4.0) {
  const out = [];
  let pred = x0, slope = 0, miss = 0;
  const hist = [[y0, x0]];
  for (let y = y0 + dir * step; dir > 0 ? y <= yStop : y >= yStop; y += dir * step) {
    pred += slope * dir * step;
    const runs = branchRuns(dev, y, mirror, 0.2)
      .map(([a, b]) => ({ a, b, c: (a + b) / 2, w: b - a }))
      .filter((r) => r.w >= MINW && r.w <= MAXW && r.c > 8 && r.c < 26);
    const best = runs.length
      ? runs.reduce((p, c) => (Math.abs(c.c - pred) < Math.abs(p.c - pred) ? c : p)) : null;
    if (!best || Math.abs(best.c - pred) > MAXJUMP) {
      miss += step;
      if (miss > COAST) break;
      continue;
    }
    miss = 0;
    out.push({ y: +y.toFixed(2), x: +best.c.toFixed(2), w: +best.w.toFixed(2) });
    hist.push([y, best.c]);
    if (hist.length > 24) hist.shift();
    // local slope from the last rows accepted (least squares), damped
    if (hist.length >= 6) {
      const n = hist.length;
      const my = hist.reduce((p, c) => p + c[0], 0) / n;
      const mx = hist.reduce((p, c) => p + c[1], 0) / n;
      let sxy = 0, syy = 0;
      for (const [hy, hx] of hist) { sxy += (hy - my) * (hx - mx); syy += (hy - my) ** 2; }
      slope = 0.6 * (sxy / syy);
    }
    pred = best.c;
  }
  return out;
}

/** Seed row: the lowest row in [lo,hi] carrying exactly ONE narrow run. */
function seed(dev, mirror, lo, hi) {
  for (let y = hi; y >= lo; y -= 0.25) {
    const runs = branchRuns(dev, y, mirror, 0.2)
      .map(([a, b]) => ({ c: (a + b) / 2, w: b - a }))
      .filter((r) => r.w >= 0.6 && r.w <= 3.6 && r.c > 10 && r.c < 22);
    if (runs.length === 1) return { y, x: runs[0].c };
  }
  return null;
}

// ---------------------------------------------------------------------------
// THE GREEDY WALK ABOVE IS KEPT ONLY AS THE THING THAT FAILED. It drifts: on
// `dime-rev-proofbright.png` OLIVE it stepped off the stem onto a petiole at
// y 56 and reported 18.48 at y 54, where the raw runs at that row are
// `15.8-16.3` and `18.0-18.9`. A first-order predictor cannot tell a petiole
// from a stem, because at the row it forks they are the same mark.
//
// WHAT REPLACES IT is a global choice instead of a local one: build every
// stem-shaped run on every row into a graph, and take the CHEAPEST CHAIN from
// the bottom of the stem to the top, cost = total variation of the centre plus
// a fixed charge per row skipped. A petiole costs its whole excursion and back;
// the stem costs its net lean. This has no seed, no direction and no memory to
// drift, and it is what every number reported below rests on.
const SKIP = 0.5;     // cost of leaving one 0.25-row unexplained
const STEMW = 3.2;    // a run wider than this is not stem alone

export function chain(dev, mirror, yLo, yHi, step = 0.25) {
  const rows = [];
  for (let y = yLo; y <= yHi + 1e-9; y += step) {
    const cand = branchRuns(dev, y, mirror, 0.15)
      .map(([a, b]) => ({ c: (a + b) / 2, w: b - a }))
      .filter((r) => r.w <= STEMW && r.c >= 11 && r.c <= 21);
    rows.push({ y: +y.toFixed(2), cand });
  }
  // dp[i][k] = cheapest cost of a chain ending at row i, candidate k
  const dp = rows.map((r) => r.cand.map(() => Infinity));
  const bk = rows.map((r) => r.cand.map(() => null));
  for (let i = 0; i < rows.length; i++) {
    for (let k = 0; k < rows[i].cand.length; k++) {
      let best = 0, from = null;              // free to start anywhere
      for (let j = i - 1; j >= 0 && i - j <= 24; j--) {
        for (let m = 0; m < rows[j].cand.length; m++) {
          if (!Number.isFinite(dp[j][m])) continue;
          const d = Math.abs(rows[i].cand[k].c - rows[j].cand[m].c);
          if (d > 1.2 * (i - j) * step + 0.35) continue;
          const cost = dp[j][m] + d + SKIP * (i - j - 1);
          if (cost < best || from === null) { best = cost; from = [j, m]; }
        }
      }
      dp[i][k] = best; bk[i][k] = from;
    }
  }
  // the chain that spans the most rows for the least cost: score = cost - gain
  let bi = -1, bk2 = -1, bs = Infinity;
  for (let i = 0; i < rows.length; i++) {
    for (let k = 0; k < rows[i].cand.length; k++) {
      const span = (() => { let j = i, m = k, n = 0;
        while (bk[j][m]) { n += 1; [j, m] = bk[j][m]; } return n; })();
      const s = dp[i][k] - 0.55 * span * step * 4;   // pay 0.55 per row covered
      if (s < bs) { bs = s; bi = i; bk2 = k; }
    }
  }
  if (bi < 0) return [];
  const out = []; let j = bi, m = bk2;
  for (;;) { out.push({ y: rows[j].y, x: +rows[j].cand[m].c.toFixed(2), w: +rows[j].cand[m].w.toFixed(2) });
    const p = bk[j][m]; if (!p) break; [j, m] = p; }
  return out.reverse();
}

export async function trace(file, mirror, T, E) {
  const dev = await deviceMask(file, T, E);
  const s = seed(dev, mirror, 66, 72);
  if (!s) return null;
  const up = walk(dev, mirror, s.y, s.x, -1, 24);
  const dn = walk(dev, mirror, s.y, s.x, +1, 82);
  return { seed: s, pts: [...up.reverse(), { y: s.y, x: +s.x.toFixed(2), w: NaN }, ...dn] };
}

if (process.argv[1] && process.argv[1].endsWith('_dr11path.mjs')) {
  const USE = FILES.filter(([f]) => f !== 'dime-rev-2.jpg');
  const all = {};
  for (const [f, T, E] of USE) {
    const dev = await deviceMask(f, T, E);
    for (const [nm, mir] of [['OLIVE', true], ['OAK', false]]) {
      const pts = chain(dev, mir, 38, 76);
      all[`${nm} ${f}`] = { seed: { y: pts[0] && pts[0].y, x: pts[0] ? pts[0].x : 0 }, pts };
      const r = all[`${nm} ${f}`];
      if (!r) { console.log(`${nm} ${f}: NO SEED`); continue; }
      const ys = r.pts.map((p) => p.y);
      console.log(`\n=== ${nm}  ${f} ===  seed y${r.seed.y} @ ${r.seed.x.toFixed(2)}` +
        `   traced y ${Math.min(...ys)} .. ${Math.max(...ys)}  (${r.pts.length} rows)`);
      const rows = r.pts.filter((p) => Math.abs(p.y % 2) < 0.01);
      console.log('   ' + rows.map((p) => `y${p.y}:${p.x.toFixed(1)}`).join('  '));
      console.log('   w  ' + rows.map((p) => `${p.w.toFixed(1)}`).join('    '));
    }
  }
  // side-by-side table at every even row
  console.log('\n=== CENTRE OFFSET BY ROW (blank = the tracker refused that row) ===');
  const keys = Object.keys(all);
  console.log('  y   ' + keys.map((k) => k.split(' ')[0].slice(0, 3) + '/' + k.split(' ')[1].slice(9, 16)).map((s) => s.padStart(14)).join(''));
  for (let y = 26; y <= 80; y += 1) {
    const cells = keys.map((k) => {
      const p = all[k] && all[k].pts.find((q) => Math.abs(q.y - y) < 0.13);
      return (p ? p.x.toFixed(2) : '.').padStart(14);
    });
    if (cells.some((c) => c.trim() !== '.')) console.log(`  ${String(y).padStart(2)}  ` + cells.join(''));
  }
  console.log('\n=== WIDTH BY ROW ===');
  console.log('  y   ' + keys.map((k) => k.split(' ')[0].slice(0, 3) + '/' + k.split(' ')[1].slice(9, 16)).map((s) => s.padStart(14)).join(''));
  for (let y = 26; y <= 80; y += 1) {
    const cells = keys.map((k) => {
      const p = all[k] && all[k].pts.find((q) => Math.abs(q.y - y) < 0.13);
      return (p && !Number.isNaN(p.w) ? p.w.toFixed(2) : '.').padStart(14);
    });
    if (cells.some((c) => c.trim() !== '.')) console.log(`  ${String(y).padStart(2)}  ` + cells.join(''));
  }
  // ---- the two branches, pooled the only way that cancels a registration slip
  console.log('\n=== ONE PATH OR TWO? The mean of (olive offset, oak offset) at a row is');
  console.log('    invariant to an error in the disc fit\'s CENTRE: such an error adds to');
  console.log('    one branch exactly what it takes from the other. The half-difference IS');
  console.log('    that error plus any real asymmetry, and it is printed beside it. ===');
  const mirroredMean = {};
  console.log('   y      pb mean   pb half-d    unc mean  unc half-d      POOLED');
  for (let y = 40; y <= 76; y += 1) {
    const g = (nm, f) => { const r = all[`${nm} ${f}`]; const p = r && r.pts.find((q) => Math.abs(q.y - y) < 0.13); return p ? p.x : null; };
    const per = [];
    const cells = [];
    for (const f of ['dime-rev-proofbright.png', 'dime-rev-unc2005.png']) {
      const o = g('OLIVE', f), k = g('OAK', f);
      if (o !== null && k !== null) { per.push((o + k) / 2); cells.push(((o + k) / 2).toFixed(2).padStart(11), ((o - k) / 2).toFixed(2).padStart(12)); }
      else cells.push('.'.padStart(11), '.'.padStart(12));
    }
    if (!per.length) continue;
    const m = per.reduce((p, c) => p + c, 0) / per.length;
    mirroredMean[y] = m;
    console.log(`  ${String(y).padStart(2)}  ` + cells.join('') + m.toFixed(2).padStart(12));
  }
  // least-squares straight line through the pooled rows in the main run
  const RUN = Object.keys(mirroredMean).map(Number).filter((y) => y >= 40 && y <= 71);
  const n = RUN.length;
  const my = RUN.reduce((p, c) => p + c, 0) / n;
  const mc = RUN.reduce((p, c) => p + mirroredMean[c], 0) / n;
  let sxy = 0, sxx = 0;
  for (const y of RUN) { sxy += (y - my) * (mirroredMean[y] - mc); sxx += (y - my) ** 2; }
  const B = sxy / sxx;
  console.log(`\n  STRAIGHT-LINE FIT over the ${n} pooled rows y ${Math.min(...RUN)}..${Math.max(...RUN)}:`);
  console.log(`    c(y) = ${mc.toFixed(3)} ${B >= 0 ? '+' : '-'} ${Math.abs(B).toFixed(5)} * (y - ${my.toFixed(1)})`
    + `   i.e. ${(Math.atan(-B) * 180 / Math.PI).toFixed(2)} degrees OUTBOARD as it rises`);
  let ss = 0, mx = 0;
  for (const y of RUN) { const r = mirroredMean[y] - (mc + B * (y - my)); ss += r * r; mx = Math.max(mx, Math.abs(r)); }
  console.log(`    residual RMS ${Math.sqrt(ss / n).toFixed(3)}  max |resid| ${mx.toFixed(3)}`);
  console.log(`    c(40) ${(mc + B * (40 - my)).toFixed(2)}   c(57) ${(mc + B * (57 - my)).toFixed(2)}` +
    `   c(71) ${(mc + B * (71 - my)).toFixed(2)}`);

  console.log('\n=== STEM WIDTH by the relief-outline estimator (_dr8shaft.mjs\'s),');
  console.log('    on the rows where the chain found the stem in bare field ===');
  const wid = {};
  for (const [f, T, E] of USE) {
    const s = await samplerFor(f, 2400);
    for (const [nm, mir] of [['OLIVE', true], ['OAK', false]]) {
      const key = `${nm} ${f}`;
      wid[key] = {};
      for (const p of (all[key] ? all[key].pts : [])) {
        if (Math.abs(p.y % 1) > 0.01) continue;
        wid[key][p.y] = stemWidth(s.at, p.y, p.x, mir, f === 'ours');
      }
    }
  }
  const wk = Object.keys(wid);
  console.log('  y   ' + wk.map((k) => k.split(' ')[0].slice(0, 3) + '/' + k.split(' ')[1].slice(9, 16)).map((t) => t.padStart(14)).join(''));
  for (let y = 40; y <= 76; y += 1) {
    const cells = wk.map((k) => (wid[k][y] !== undefined && Number.isFinite(wid[k][y]) ? wid[k][y].toFixed(2) : '.').padStart(14));
    if (cells.some((c) => c.trim() !== '.')) console.log(`  ${String(y).padStart(2)}  ` + cells.join(''));
  }
  console.log('\n  TAPER RATIOS against the same branch\'s own w(68):');
  for (const k of wk) {
    const b = wid[k][68];
    if (!b || !Number.isFinite(b)) { console.log(`  ${k.padEnd(34)} no w(68)`); continue; }
    console.log(`  ${k.padEnd(34)} w68 ${b.toFixed(2)}   ` + [44, 50, 56, 62, 72]
      .map((y) => `w${y}/w68 ${wid[k][y] && Number.isFinite(wid[k][y]) ? (wid[k][y] / b).toFixed(2) : ' -- '}`).join('  '));
  }
  if (process.argv.includes('--rows')) {
    console.log('\n=== EVERY RUN, BOTH BRANCHES (offset a..b) ===');
    for (const [f, T, E] of USE) {
      const dev = await deviceMask(f, T, E);
      for (const [nm, mir] of [['OLIVE', true], ['OAK', false]]) {
        console.log(`-- ${nm} ${f}`);
        for (let y = 26; y <= 80; y += 1) {
          console.log(`   y${String(y).padStart(2)}  ` +
            branchRuns(dev, y, mir, 0.2).map(([a, b]) => `${a.toFixed(1)}-${b.toFixed(1)}`).join('  '));
        }
      }
    }
  }
}
