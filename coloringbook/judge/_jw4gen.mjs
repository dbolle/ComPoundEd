// R4 dime jaw — the region GENERATOR, parameterised, plus a sweep of the one
// parameter the frozen tone target forces on it.
//
// Iteration 1 of this repair (symmetric about the drawn line, 2.90 -> 1.80
// viewBox) took D3 from 0.0399 to 0.0589 — past its 0.0567 gate — and
// `_jw4chin.mjs` shows the whole fall is the `chin` patch's MEDIAN flipping:
// its brightest level held 54.3 % of the patch, a 4.3-point margin, and the
// region's top edge took that to 37.4 %. The patch is bimodal, so there is no
// intermediate value: the region either stays out of it or costs 0.21 of
// |dratio| on one patch.
//
// The one free parameter is therefore the CENTRE BIAS at the chin end, and it
// is not free-floating — the references disagree about the run's centre there
// by 3.4 units. Per-third mean centre offset, positive = toward the face:
//     chin third    dime-obv (STRUCK) -1.46    dime-obv-3 +0.89   pooled -0.28
//     middle third  dime-obv          -0.41    dime-obv-3 -0.68   pooled -0.54
//     ear third     dime-obv          +0.20    dime-obv-3 -0.13   pooled +0.04
// So a NEGATIVE bias at the chin (away from the face, under the chin) is what
// the only tone-admissible reference says, and any value between 0 and -1.46 is
// inside the measurement. This sweeps it and prints D3 and the chin patch for
// each, so the value chosen is the one the frozen target permits rather than
// the one that scored best after the fact.
//
// Response test: the sweep IS the response test — D3 must move with the
// parameter, and the chin patch must be the thing that moves.
// Null test: the sweep's ends (0 and -1.4) are printed; a chosen value at an
// end would mean the window, not the coin, picked it.
//
// Run: node coloringbook/judge/_jw4gen.mjs            -> emit the path at BIAS
//      node coloringbook/judge/_jw4gen.mjs sweep      -> sweep and score D3
import { writeFileSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { marks } from './_jqgeom.mjs';
import { inside as pip } from './_jw4width.mjs';
import { busted } from './_jw4reg.mjs';

const BUST = await busted();
const HEADPOLY = marks(`<svg><path d="${BUST.headD}"/></svg>`)[0].pts;
const SHADE = marks(`<svg><path d="M 14.2 23.2 C 12.6 25.2 10.6 26.4 8.4 27.1 C 5.6 27.9 2.8 28.6 1.7 29.3 C 0.9 28.5 -0.8 27.6 -2.6 26.8 C -4.6 25.8 -6.2 23.6 -6.6 21.4 C -6.9 19.6 -6.4 18 -5.6 17.2 C -3.2 18.4 -0.4 20 2.2 21.2 C 5.6 22 9.8 22.8 14.2 23.2 Z"/></svg>`)[0].pts;

const S = 0.97;
const W0 = 2.90 / S, W1 = 1.80 / S;
const CENTRE = [
  [[19.4, 21.4], [17.6, 21.4], [14.2, 21.4], [11, 21.2]],
  [[11, 21.2], [7, 21], [3.4, 19.4], [0.4, 18.2]],
  [[0.4, 18.2], [-3.2, 16.8], [-7.4, 15], [-10.4, 13.6]],
  [[-10.4, 13.6], [-11.4, 13], [-12.2, 12.4], [-12.6, 11.6]],
];
const bez = (P, t) => { const u = 1 - t; return [0, 1].map((k) => u ** 3 * P[0][k] + 3 * u * u * t * P[1][k] + 3 * u * t * t * P[2][k] + t ** 3 * P[3][k]); };
const dbez = (P, t) => { const u = 1 - t; return [0, 1].map((k) => 3 * u * u * (P[1][k] - P[0][k]) + 6 * u * t * (P[2][k] - P[1][k]) + 3 * t * t * (P[3][k] - P[2][k])); };
const LENS = CENTRE.map((P) => { let L = 0, p = bez(P, 0); for (let i = 1; i <= 200; i++) { const q = bez(P, i / 200); L += Math.hypot(q[0] - p[0], q[1] - p[1]); p = q; } return L; });
const TOTAL = LENS.reduce((a, b) => a + b, 0);
const sAt = (seg, t) => { let s = 0; for (let i = 0; i < seg; i++) s += LENS[i]; let p = bez(CENTRE[seg], 0); for (let i = 1; i <= 200; i++) { const q = bez(CENTRE[seg], (i / 200) * t); s += Math.hypot(q[0] - p[0], q[1] - p[1]); p = q; } return s; };
const halfW = (s) => (W0 + (W1 - W0) * (s / TOTAL)) / 2;
export function build(bias, RAMP = 14) {
  const c = (s) => (s < RAMP ? bias * (1 - s / RAMP) : 0);
  const off = (P, sign) => [0, 1, 2, 3].map((k) => {
    const t = k / 3, d = dbez(P, t), L = Math.hypot(d[0], d[1]);
    const n = [-d[1] / L, d[0] / L], s = sAt(CENTRE.indexOf(P), t), h = c(s) + sign * halfW(s);
    return [P[k][0] + n[0] * h, P[k][1] + n[1] * h];
  });
  const n2 = (v) => String(Math.round(v * 100) / 100);
  const up = CENTRE.map((P) => off(P, 1)), lo = CENTRE.map((P) => off(P, -1));
  // The chin cap butts the profile, and a REGION that overhangs it paints ink
  // on bare field (the cent's lapel). Pull the two cap corners back along the
  // normal until they are CAP_IN inside the head contour — the corner at the
  // throat side is the one that leaves, because the silhouette turns under the
  // chin faster than the run does.
  const CAP_IN = 0.15;
  const d0 = dbez(CENTRE[0], 0), L0 = Math.hypot(d0[0], d0[1]), n0 = [-d0[1] / L0, d0[0] / L0];
  for (const [arr, sign] of [[up, 1], [lo, -1]]) {
    let h = c(0) + sign * halfW(0);
    for (let k = 0; k < 400; k++) {
      const p = [CENTRE[0][0][0] + n0[0] * h, CENTRE[0][0][1] + n0[1] * h];
      if (HEADPOLY && !pip(HEADPOLY, p[0], p[1])) h -= sign * 0.02; else break;
    }
    h -= sign * CAP_IN;
    arr[0][0] = [CENTRE[0][0][0] + n0[0] * h, CENTRE[0][0][1] + n0[1] * h];
  }
  let d = `M ${n2(up[0][0][0])} ${n2(up[0][0][1])}`;
  for (const Q of up) d += ` C ${n2(Q[1][0])} ${n2(Q[1][1])} ${n2(Q[2][0])} ${n2(Q[2][1])} ${n2(Q[3][0])} ${n2(Q[3][1])}`;
  const td = dbez(CENTRE[3], 1), tL = Math.hypot(td[0], td[1]), tu = [td[0] / tL, td[1] / tL], hT = halfW(TOTAL) * 0.7;
  const a = up[3][3], b = lo[3][3];
  d += ` C ${n2(a[0] + tu[0] * hT)} ${n2(a[1] + tu[1] * hT)} ${n2(b[0] + tu[0] * hT)} ${n2(b[1] + tu[1] * hT)} ${n2(b[0])} ${n2(b[1])}`;
  for (let i = 3; i >= 0; i--) { const Q = lo[i]; d += ` C ${n2(Q[2][0])} ${n2(Q[2][1])} ${n2(Q[1][0])} ${n2(Q[1][1])} ${n2(Q[0][0])} ${n2(Q[0][1])}`; }
  return d + ' Z';
}

// the two geometric constraints the frozen artefacts impose, measured
export function constraints(d) {
  const reg = marks(`<svg><path d="${d}"/></svg>`)[0].pts;
  let outside = 0, worstOut = 0;
  for (const p of reg) {
    if (pip(HEADPOLY, p.x, p.y)) continue;
    outside++;
    let best = Infinity;
    for (let i = 1; i < HEADPOLY.length; i++) best = Math.min(best, Math.hypot(p.x - HEADPOLY[i].x, p.y - HEADPOLY[i].y));
    worstOut = Math.max(worstOut, best);
  }
  let gap = Infinity;
  for (const p of reg) {
    for (let t = 0; t < 6; t += 0.02) {
      const q = [p.x, p.y + t];
      if (pip(SHADE, q[0], q[1])) { gap = Math.min(gap, t); break; }
    }
  }
  return { outside, worstOut, gap };
}

export function variant(bias, tag, ramp = 14) {
  const src = readFileSync(new URL('../../src/art/coins.js', import.meta.url).pathname, 'utf8');
  const d = build(bias, ramp);
  const out = src.replace(/(\n    dark:\n)([\s\S]*?)(,\n    \/\/ THE THROAT SHADOW)/,
    `$1      '<path d="${d}" stroke="none"/>'$3`);
  if (out === src) throw new Error('the dark: block did not match — refusing to write a variant');
  const p = new URL(`./_jw4var-${tag}.js`, import.meta.url).pathname;
  writeFileSync(p, out.replace("from '../engine/money.js'", "from '../../src/engine/money.js'"));
  return p;
}

if (process.argv[2] === 'sweep') {
  console.log('CONSTRAINTS, all three of them, stated before the sweep:');
  console.log('  D3 mean|dratio| must be <= 0.0399, its value on the mark this replaces (the brief: MUST NOT REGRESS)');
  console.log('  0 boundary points outside the HEAD contour — a region that overhangs paints ink on bare field');
  console.log('  clearance to the throat region >= 0.60 local units, which is what the 1.5 stroke had\n');
  console.log('bias  ramp   D3 mean|d|   chin |d|  chin med   outside  worst-out   gap to shade');
  for (const [bias, ramp] of [[0, 14], [-0.35, 14], [-0.5, 14], [-0.6, 14], [-0.7, 14],
    [-0.7, 8], [-0.7, 10], [-0.7, 11], [-0.7, 12], [-0.7, 13], [-0.7, 18], [-0.7, 22],
    [-0.8, 11], [-0.9, 11], [-0.9, 18], [-1.2, 22], [-1.4, 14]]) {
    const tag = `${String(bias).replace('.', 'p').replace('-', 'm')}_r${ramp}`;
    const p = variant(bias, tag, ramp);
    const c = constraints(build(bias, ramp));
    const o = execFileSync('node', [new URL('../_p2score.mjs', import.meta.url).pathname, p, tag], { encoding: 'utf8' });
    const mean = o.match(/mean \|Δratio\| over 11 patches = ([\d.]+)/);
    const chin = o.match(/chin\s+(\d+)\s+(\d+)\s+\|\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
    console.log(`${String(bias).padStart(4)} ${String(ramp).padStart(5)}   ${mean[1].padStart(9)}   ${chin[5].padStart(7)}`
      + `${chin[2].padStart(10)}   ${String(c.outside).padStart(7)}   ${c.worstOut.toFixed(2).padStart(9)}   ${c.gap.toFixed(2).padStart(12)}`);
  }
  console.log('\nnull test: the sweep spans bias 0 .. -1.4 and ramp 8 .. 22, and both ends of both are');
  console.log('printed. The measured pooled centre at the chin third is -0.28 and the STRUCK reference');
  console.log('alone says -1.46, so every bias in the sweep is inside the photographs\' own disagreement.');
} else {
  console.log(build(Number(process.env.BIAS || -0.7), Number(process.env.RAMP || 14)));
  console.log(JSON.stringify(constraints(build(Number(process.env.BIAS || -0.7), Number(process.env.RAMP || 14)))));
}
