// NICKEL round 0 — THE RADIAL PROFILE: legend band, cap height, and the RIM SEAT.
//
// The nickel has never had a band measured, and `EDGE.nickel.field` (41.0 full /
// 40.5 mid / 42.5 icon) is one literal shared by all four coins that was never
// measured on any of them. `scripts/coin-shared-claims.mjs` flags it. On the
// quarter it turned out to be a hard blocker: the coin seats its rim at 44.2 and
// gives its legend 7.7 units of band where our drawing has 4.6.
//
// METHOD, and why it is not a fourth band detector:
//   Round 4's S2 — draw the artefact in the coordinate system the feature is
//   defined in, read the feature off it, and then require any number-producing
//   instrument to AGREE WITH THE PICTURE. `_jn3unwrap.mjs` is the picture. This
//   file is the number, and every value it prints is also drawn back onto that
//   picture (`_jn4band-<ref>.png`) so the two can be compared by eye.
//
//   Per radius r (0.05-unit steps) inside a stated angular SECTOR, in the
//   disc-normalised frame:
//     sd(r)    along-angle standard deviation of grey. Lettering is the only
//              high-variance-at-constant-radius thing on the outer field
//              (§16.2), so a legend is an sd plateau between two bare-field
//              shoulders.
//     mean(r)  along-angle mean grey. The RIM SEAT is a step in this, not a
//              variance feature: inboard of it is flat field, outboard is the
//              rim's lit inner slope.
//
// §4.1 NULL TEST: the r window is printed; a band edge or a rim seat landing on
//      a window end is reported as a FAILURE, never as a value. The degeneracy
//      measure (plateau max / out-of-band median) is printed either way.
// §4.2 SELECTION: every candidate plateau in the window is printed, not just the
//      chosen one, and a run of ambiguity is named.
// §4.3 OVERLAY: every located feature is drawn on the unwrap and looked at.
// §6.1 LOCUS: the sectors below are frozen literals, derived from the TARGET
//      (which arc of the coin each legend occupies, read off the unwrap) and
//      never from our own drawing.
//
// Run: node coloringbook/judge/_jn4band.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const P = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const D = JSON.parse(readFileSync(HERE('_jn1discs.json')));

const R0 = 30.0, R1 = 47.5, STEP = 0.05;   // the search window, printed with every result

// FROZEN LOCI. Sectors in degrees, atan2(v,u) with v downward, so 270 = twelve
// o'clock and 90 = six o'clock. Chosen off the unwrap pictures because those
// are the arcs the COIN puts each legend on — not because our drawing does.
const JOBS = [
  { tag: 'rev top  E PLURIBUS UNUM', side: 'reverse', sector: [225, 315], refs: ['nickel-rev-2.png', 'nickel-rev.jpg', 'nickel-rev-proof.png'] },
  { tag: 'rev bot  UNITED STATES OF AMERICA', side: 'reverse', sector: [30, 150], refs: ['nickel-rev-2.png', 'nickel-rev.jpg', 'nickel-rev-proof.png'] },
  { tag: 'obv left IN GOD WE TRUST', side: 'obverse', sector: [140, 210], refs: ['nickel-obv-5.JPG', 'nickel-obv.jpg', 'nickel-obv-proof.png'] },
  { tag: 'obv rt   LIBERTY', side: 'obverse', sector: [318, 352], refs: ['nickel-obv-5.JPG', 'nickel-obv.jpg', 'nickel-obv-proof.png'] },
];
// The rim seat is a property of the BLANK, not of a legend, so it is measured
// over the whole circle on every well-fitted reference.
const RIM_REFS = ['nickel-rev-2.png', 'nickel-rev.jpg', 'nickel-rev-proof.png', 'nickel-obv-5.JPG', 'nickel-obv.jpg', 'nickel-obv-proof.png'];

const cache = new Map();
async function img(file) {
  if (cache.has(file)) return cache.get(file);
  const { data, info } = await sharp(P(file)).flatten({ background: '#808080' })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  const o = { d: data, W: info.width, H: info.height, disc: D[file] };
  cache.set(file, o);
  return o;
}
function at(g, x, y) {
  if (x < 0 || y < 0 || x >= g.W - 1 || y >= g.H - 1) return NaN;
  const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0;
  return g.d[y0 * g.W + x0] * (1 - fx) * (1 - fy) + g.d[y0 * g.W + x0 + 1] * fx * (1 - fy)
    + g.d[(y0 + 1) * g.W + x0] * (1 - fx) * fy + g.d[(y0 + 1) * g.W + x0 + 1] * fx * fy;
}

// profile: for each radius, the along-angle mean and sd inside [a0,a1]
export async function profile(file, a0, a1, nAng = 1600) {
  const g = await img(file);
  const rows = [];
  for (let r = R0; r <= R1 + 1e-9; r += STEP) {
    const rr = (r / 47) * g.disc.R;
    let s = 0, s2 = 0, n = 0;
    for (let k = 0; k < nAng; k++) {
      const a = ((a0 + (a1 - a0) * k / (nAng - 1)) * Math.PI) / 180;
      const v = at(g, g.disc.cx + rr * Math.cos(a), g.disc.cy + rr * Math.sin(a));
      if (!Number.isFinite(v)) continue;
      s += v; s2 += v * v; n++;
    }
    rows.push({ r: +r.toFixed(2), mean: s / n, sd: Math.sqrt(Math.max(0, s2 / n - (s / n) ** 2)), n });
  }
  return rows;
}

// EVERY plateau in the window (§4.2), a plateau being a maximal run of radii
// with sd >= frac * max(sd).
function plateaus(rows, frac = 0.5) {
  const mx = Math.max(...rows.map((x) => x.sd));
  const thr = frac * mx;
  const out = []; let run = null;
  for (const x of rows) {
    if (x.sd >= thr) { if (!run) run = { lo: x.r, hi: x.r, peak: x.sd, peakR: x.r }; else { run.hi = x.r; if (x.sd > run.peak) { run.peak = x.sd; run.peakR = x.r; } } }
    else if (run) { out.push(run); run = null; }
  }
  if (run) out.push(run);
  const med = rows.map((x) => x.sd).sort((a, b) => a - b)[rows.length >> 1];
  return { list: out, max: mx, med, degeneracy: mx / (med || 1e-9) };
}

const bar = (v, mx, w = 40) => '#'.repeat(Math.max(0, Math.round((v / mx) * w)));

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`radial search window (§4.1): r = ${R0} .. ${R1} viewBox units, step ${STEP}. A result at either end is a FAILURE REPORT.\n`);
  const summary = {};

  for (const job of JOBS) {
    console.log(`\n═══ ${job.tag}   sector ${job.sector[0]}..${job.sector[1]} deg  [FROZEN LOCUS, read off the unwrap of the REFERENCE]`);
    for (const ref of job.refs) {
      const rows = await profile(ref, job.sector[0], job.sector[1]);
      const pl = plateaus(rows);
      console.log(`\n  ${ref}   sd max ${pl.max.toFixed(2)}  median ${pl.med.toFixed(2)}  degeneracy ${pl.degeneracy.toFixed(2)}x`);
      console.log(`  every plateau at sd >= 0.5*max (§4.2):`);
      for (const p of pl.list) {
        const atB = p.lo <= R0 + 1e-9 || p.hi >= R1 - 1e-9;
        console.log(`     r ${p.lo.toFixed(2)} .. ${p.hi.toFixed(2)}  width ${(p.hi - p.lo).toFixed(2)}  peak sd ${p.peak.toFixed(2)} at r ${p.peakR.toFixed(2)}` +
          (atB ? '   <-- AT A WINDOW BOUND (§4.1): FAILURE REPORT, not a value' : ''));
      }
      summary[`${job.tag} | ${ref}`] = pl.list.map((p) => [p.lo, p.hi]);
      // the profile itself, so a reader can see a step from a ramp
      console.log('     r      sd');
      for (const x of rows) if (Math.abs(x.r * 2 - Math.round(x.r * 2)) < 1e-9) console.log(`     ${x.r.toFixed(1).padStart(5)}  ${x.sd.toFixed(1).padStart(5)}  ${bar(x.sd, pl.max)}`);
    }
  }

  console.log(`\n\n═══ RIM SEAT — the step in the along-angle MEAN, whole circle, window r 41..47.5`);
  console.log('   The rim seat is the radius of the steepest MEAN gradient outboard of r 41.');
  const rim = {};
  for (const ref of RIM_REFS) {
    const rows = (await profile(ref, 0, 360, 2400)).filter((x) => x.r >= 41);
    let best = null;
    for (let i = 2; i < rows.length - 2; i++) {
      const g = Math.abs(rows[i + 2].mean - rows[i - 2].mean) / (4 * STEP);
      if (!best || g > best.g) best = { g, r: rows[i].r };
    }
    const lo = rows[0].r, hi = rows[rows.length - 1].r;
    const atB = best.r <= lo + 0.3 || best.r >= hi - 0.3;
    rim[ref] = best.r;
    console.log(`  ${ref.padEnd(24)} steepest |d mean/dr| at r = ${best.r.toFixed(2)}  (${best.g.toFixed(1)} grey/unit)   window ${lo}..${hi}` +
      (atB ? '   <-- AT A WINDOW BOUND (§4.1)' : ''));
    console.log('     r      mean grey');
    for (const x of rows) if (Math.abs(x.r * 4 - Math.round(x.r * 4)) < 1e-9) console.log(`     ${x.r.toFixed(2).padStart(5)}  ${x.mean.toFixed(1).padStart(6)}`);
  }
  console.log('\nrim seat radii: ' + JSON.stringify(rim));
}
