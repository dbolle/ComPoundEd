// ROUND 9 (relief/edge), QUARTER OBVERSE — an INDEPENDENT check of the three
// disc registrations everything else in this round divides by.
//
// WHY. Round 8's own report names a judge error of exactly this kind: the 1932
// NGC quarter was published at disc R 903 and is really R 999.37, a 9.6% error,
// which is a 9.6% error in every viewBox-unit measurement taken off it. Before
// re-deriving a pitch in viewBox units I check the number the units come from,
// by a method that is not the one that produced the stored fit.
//
// METHOD (independent of `_jq7fit.mjs`, which differences the background):
// walk 720 rays from a candidate centre; on each ray find the radius of maximum
// |d grey / d r| (the disc edge against the backdrop); fit centre and radius by
// least squares on those 720 points; iterate the centre 12 times. Robustified
// by dropping rays whose edge radius is more than 3% from the running median.
//
// §4.1 the search band is printed. An edge radius at a band end is dropped and
//      counted, never used.
// §4.2 SELECTION: the per-ray radii are summarised (median, IQR, min, max) so a
//      fit that is really two circles is visible rather than averaged.
// §4   RESPONSE: a synthetic disc of known radius is fitted first.
//
// Run: node coloringbook/judge/_jw14fit.mjs
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const REFS = ['quarter-obv-2.jpg', 'quarter-obv-1932ngc.jpg', 'quarter-obv-4.jpg'];
// what the record says, for comparison only — never used as a starting guess
const PUBLISHED = {
  'quarter-obv-2.jpg': { cx: 374.41, cy: 374.36, R: 373.67, src: 'frozen, _r3d13.mjs' },
  'quarter-obv-1932ngc.jpg': { cx: 999.52, cy: 999.49, R: 999.37, src: '_jq7fit.json (round 8 correction)' },
  'quarter-obv-4.jpg': { cx: 1000.25, cy: 1001.81, R: 985.89, src: '_jq7fit.json' },
};

async function grey(input) {
  const { data, info } = await sharp(input).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
}
const bil = (g, x, y) => {
  if (x < 0 || y < 0 || x > g.w - 2 || y > g.h - 2) return NaN;
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, i = y0 * g.w + x0;
  return (1 - fx) * (1 - fy) * g.d[i] + fx * (1 - fy) * g.d[i + 1]
    + (1 - fx) * fy * g.d[i + g.w] + fx * fy * g.d[i + g.w + 1];
};

function fit(g) {
  let cx = g.w / 2, cy = g.h / 2;
  const rMax = Math.min(g.w, g.h) / 2 - 1;
  const rMin = 0.35 * rMax;                       // §4.1 search band
  let R = 0, rays = [];
  for (let it = 0; it < 12; it++) {
    rays = [];
    for (let k = 0; k < 720; k++) {
      const th = (2 * Math.PI * k) / 720, ux = Math.cos(th), uy = Math.sin(th);
      // §4.3 THE OUTERMOST STRONG EDGE, not the strongest. The first version of this
      // fitter took the maximum gradient on the ray and locked onto the BUST
      // PROFILE on 43% of rays — the per-ray radii came back bimodal (q1 214,
      // q3 370 on quarter-obv-2) which is the selection-test tell. The disc
      // edge is the last edge before the backdrop, so scan inward from rMax.
      const grad = [];
      let gmax = 0;
      for (let r = rMin; r <= rMax; r += 0.25) {
        const a = bil(g, cx + ux * (r - 1.5), cy + uy * (r - 1.5));
        const b = bil(g, cx + ux * (r + 1.5), cy + uy * (r + 1.5));
        if (Number.isNaN(a) || Number.isNaN(b)) { grad.push({ r, d: NaN }); continue; }
        const d = Math.abs(a - b);
        if (d > gmax) gmax = d;
        grad.push({ r, d });
      }
      let bestR = NaN;
      for (let i = grad.length - 2; i >= 1; i--) {
        const g0 = grad[i];
        if (Number.isNaN(g0.d) || g0.d < 0.5 * gmax) continue;
        if (g0.d >= grad[i - 1].d && g0.d >= grad[i + 1].d) { bestR = g0.r; break; }
      }
      if (!Number.isNaN(bestR) && bestR > rMin + 0.3 && bestR < rMax - 0.3) rays.push({ th, ux, uy, r: bestR });
    }
    const rs = rays.map((p) => p.r).sort((a, b) => a - b);
    const m = rs[rs.length >> 1];
    const keep = rays.filter((p) => Math.abs(p.r - m) / m < 0.03);
    // least squares on x = cx + r cos, y = cy + r sin  ->  solve for dcx,dcy,R
    let sxx = keep.length, sc = 0, ss = 0, scc = 0, sss = 0, scs = 0, sr = 0, src_ = 0, srs = 0;
    for (const p of keep) { sc += p.ux; ss += p.uy; scc += p.ux * p.ux; sss += p.uy * p.uy; scs += p.ux * p.uy; sr += p.r; src_ += p.r * p.ux; srs += p.r * p.uy; }
    // r_i ~ R + dcx*cos + dcy*sin
    const A = [[sxx, sc, ss], [sc, scc, scs], [ss, scs, sss]];
    const bvec = [sr, src_, srs];
    const sol = solve3(A, bvec);
    R = sol[0]; cx += sol[1]; cy += sol[2];
    if (Math.hypot(sol[1], sol[2]) < 1e-4) break;
  }
  const rs = rays.map((p) => p.r).sort((a, b) => a - b);
  return { cx, cy, R, n: rays.length, med: rs[rs.length >> 1],
    q1: rs[Math.floor(rs.length * 0.25)], q3: rs[Math.floor(rs.length * 0.75)], min: rs[0], max: rs[rs.length - 1],
    rMin, rMax };
}
function solve3(A, b) {
  const M = A.map((row, i) => [...row, b[i]]);
  for (let i = 0; i < 3; i++) {
    let p = i; for (let j = i + 1; j < 3; j++) if (Math.abs(M[j][i]) > Math.abs(M[p][i])) p = j;
    [M[i], M[p]] = [M[p], M[i]];
    for (let j = i + 1; j < 3; j++) { const f = M[j][i] / M[i][i]; for (let k = i; k < 4; k++) M[j][k] -= f * M[i][k]; }
  }
  const x = [0, 0, 0];
  for (let i = 2; i >= 0; i--) { let s = M[i][3]; for (let k = i + 1; k < 3; k++) s -= M[i][k] * x[k]; x[i] = s / M[i][i]; }
  return x;
}

console.log('### _jw14fit — independent disc registration check');
// §4 response test
{
  const R = 411.5, W = 1000;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}">`
    + `<rect width="${W}" height="${W}" fill="#101010"/>`
    + `<circle cx="${W / 2 + 7}" cy="${W / 2 - 5}" r="${R}" fill="#c0c0c0"/></svg>`;
  const g = await grey(Buffer.from(svg));
  const f = fit(g);
  console.log(`RESPONSE: synthetic disc R ${R} at (${W / 2 + 7}, ${W / 2 - 5}) -> `
    + `R ${f.R.toFixed(2)} at (${f.cx.toFixed(2)}, ${f.cy.toFixed(2)})  err ${(f.R - R).toFixed(2)} px `
    + `(${(100 * (f.R - R) / R).toFixed(3)}%)`);
}
console.log('');
const out = { disc: {}, checkedAt: new Date().toISOString().slice(0, 10) };
for (const f of REFS) {
  const g = await grey(`coloringbook/ref/${f}`);
  const r = fit(g);
  const p = PUBLISHED[f];
  console.log(`${f}  ${g.w}x${g.h}`);
  console.log(`  search band r ${r.rMin.toFixed(0)}..${r.rMax.toFixed(0)} px; ${r.n} of 720 rays kept`);
  console.log(`  per-ray edge radius: min ${r.min.toFixed(1)} q1 ${r.q1.toFixed(1)} med ${r.med.toFixed(1)} q3 ${r.q3.toFixed(1)} max ${r.max.toFixed(1)}`);
  console.log(`  MINE      cx ${r.cx.toFixed(2)} cy ${r.cy.toFixed(2)} R ${r.R.toFixed(2)}`);
  console.log(`  published cx ${p.cx.toFixed(2)} cy ${p.cy.toFixed(2)} R ${p.R.toFixed(2)}   (${p.src})`);
  console.log(`  delta     dcx ${(r.cx - p.cx).toFixed(2)} dcy ${(r.cy - p.cy).toFixed(2)} dR ${(r.R - p.R).toFixed(2)} px = ${(100 * (r.R - p.R) / p.R).toFixed(2)}%`);
  // The round USES the published values, so that every number stays comparable
  // to round 8's. This file records the check, not a replacement.
  out.disc[f] = { ...p, mineCx: +r.cx.toFixed(2), mineCy: +r.cy.toFixed(2), mineR: +r.R.toFixed(2) };
  console.log('');
}
writeFileSync('coloringbook/judge/_jw14fitcheck.json', JSON.stringify(out, null, 1));
console.log('wrote coloringbook/judge/_jw14fitcheck.json (PUBLISHED values are what the round uses)');
