// SPECIALIST INSTRUMENT — round 3, D5 lettering. IS THIS LEGEND A CONCENTRIC
// ARC, OR A STRAIGHT LINE?
//
// `coins.js` can draw a legend two ways and only two: `arcText`, which puts the
// baseline on a circle CENTRED ON THE COIN and rotates every glyph to the local
// tangent, and `flatText`, which puts it on a horizontal cartesian line with
// every glyph upright. Choosing between them for a legend that has never been
// drawn is a decision about the reference, so it gets a measurement.
//
// The test: take the per-column ink envelope from `_jl3ink.mjs`, and fit a
// circle centred at (50, yc) with radius Rc — TWO free parameters, yc and Rc.
//   yc ~ 50            the legend is concentric with the coin -> arcText
//   |yc - 50| large    the legend's arc centre is far from the coin's, so the
//                      line is much flatter than the rim -> flatText, and the
//                      residual of the yc-free fit against the residual of the
//                      straight-line fit says how much is being given up.
// Reported beside them: the residual of the CONCENTRIC fit (yc pinned to 50)
// and of the STRAIGHT fit (y = const). Three residuals, one picture, no
// argument.
//
// Which envelope: the TOP one by default. A raised letter photographed with
// side lighting carries a dark drop shadow on one flank — on `penny-rev-2.png`
// low and left — so the BOTTOM envelope is the shadow's edge, not the glyph's.
// The shadow is a roughly constant offset, so it barely touches CURVATURE, but
// it does move a baseline, and this instrument is used for both.
//
// §4.1 NULL: the free parameter is searched over an explicit grid whose ends
//   are printed. A result at an end is reported as a bound hit, never a value.
// §4 RESPONSE: `--response` fits three SYNTHETIC point sets sampled over the
//   same x range — a true concentric arc at r 30, a true straight line at
//   y 22.8, and a large-radius arc centred well below the coin — and the fit
//   must recover each. A fitter that cannot tell those three apart cannot be
//   used to choose between `arcText` and `flatText`.
//
//   IT DID NOT, FIRST TIME. v1 of this file searched yc directly over
//   [-4000, 49.5] by golden section, and on the "true concentric r=30"
//   synthetic it returned yc = -4000 with rms 1.146 while the pinned
//   concentric model returned 0.0000. Two faults, both found by the response
//   test and neither by the real data: the bracket EXCLUDED the concentric
//   answer (yc = 50 is outside 49.5), and the sign was backwards — for a
//   legend ABOVE the centre a flatter-than-rim arc has its centre FURTHER
//   DOWN, yc > 50, not below. Recorded rather than quietly fixed, because
//   "the fitter's own response test is the only thing that caught it" is the
//   whole argument for §4.
//
// The parametrisation below is therefore CURVATURE, not centre position:
//   t = 1 / (yc - y0), y0 = mean y of the points.
//   t = 0                 a straight line (yc at infinity) — `flatText`
//   t = 1 / (50 - y0)     concentric with the coin           — `arcText`
// Both live in the interior of a uniform grid, the grid is symmetric about 0,
// and no reachable model is outside it.
//
// Run: node coloringbook/judge/_jl3fit.mjs <ref> <rect> <free> [--bottom] [--response]
import { inkSampler, grab, sigmaOf, envelope, floored } from './_jl3ink.mjs';

export const T_LIM = 0.06, T_N = 4801;   // |1/(yc-y0)| <= 0.06 => |Rc| >= ~16.7

function rms(pts, yc, Rc) {
  let s = 0;
  for (const [x, y] of pts) { const d = Math.hypot(x - 50, y - yc) - Rc; s += d * d; }
  return Math.sqrt(s / pts.length);
}
function bestR(pts, yc) {
  let s = 0;
  for (const [x, y] of pts) s += Math.hypot(x - 50, y - yc);
  return s / pts.length;
}
export function fit(pts) {
  let y0 = 0; for (const [, y] of pts) y0 += y; y0 /= pts.length;
  let s0 = 0; for (const [, y] of pts) s0 += (y - y0) ** 2;
  const straight = { y: y0, rms: Math.sqrt(s0 / pts.length) };
  const f = (t) => {
    if (t === 0) return straight.rms;
    const yc = y0 + 1 / t;
    return rms(pts, yc, bestR(pts, yc));
  };
  let bestT = 0, bestF = straight.rms;
  for (let i = 0; i < T_N; i++) {
    const t = -T_LIM + (2 * T_LIM * i) / (T_N - 1);
    const v = f(t);
    if (v < bestF) { bestF = v; bestT = t; }
  }
  // local golden-section refinement inside the two neighbouring grid cells
  const h = (2 * T_LIM) / (T_N - 1), gr = (Math.sqrt(5) - 1) / 2;
  let lo = bestT - h, hi = bestT + h;
  let a = hi - gr * (hi - lo), b = lo + gr * (hi - lo), fa = f(a), fb = f(b);
  for (let i = 0; i < 80; i++) {
    if (fa < fb) { hi = b; b = a; fb = fa; a = hi - gr * (hi - lo); fa = f(a); }
    else { lo = a; a = b; fa = fb; b = lo + gr * (hi - lo); fb = f(b); }
  }
  const t = (lo + hi) / 2;
  const yc = t === 0 ? Infinity : y0 + 1 / t;
  const Rc = Number.isFinite(yc) ? bestR(pts, yc) : Infinity;
  const conc = { yc: 50, Rc: bestR(pts, 50) };
  conc.rms = rms(pts, conc.yc, conc.Rc);
  const tConc = 1 / (50 - y0);
  return { t, y0, yc, Rc, rms: Math.min(f(t), straight.rms), conc, straight, n: pts.length,
    grid: [-T_LIM, T_LIM], tConc,
    boundHit: Math.abs(t) >= T_LIM - 2 * h };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [file, rectS, freeS] = process.argv.slice(2);
  const rect = rectS.split(',').map(Number), free = freeS.split(',').map(Number);
  const opts = {};
  if (process.env.RMIN) opts.rMin = Number(process.env.RMIN);
  if (process.env.SEEDY) opts.seedY = Number(process.env.SEEDY);
  if (process.env.SEEDR) opts.seedR = Number(process.env.SEEDR);
  if (process.env.OPEN) opts.open = Number(process.env.OPEN);
  if (process.env.CLOSEY) opts.closeY = Number(process.env.CLOSEY);
  if (process.env.SEEDTOL) opts.seedTol = Number(process.env.SEEDTOL);
  if (process.env.RMAX) opts.rMax = Number(process.env.RMAX);
  if (process.env.K) opts.k = Number(process.env.K);
  const which = process.argv.includes('--bottom') ? 'bot' : 'top';
  const s = await inkSampler(file);
  const sgRaw = sigmaOf(grab(s, free));
  const sg = { ...sgRaw, ...floored(sgRaw.sigma) };
  const e = envelope(s, rect, sg.sigma, opts);
  const pts = e.cols.filter((c) => !Number.isNaN(c.top)).map((c) => [c.x, c[which]]);
  const r = fit(pts);
  console.log(`${file}  ${which} envelope  window ${rect.join(',')} r ${e.rMin}..${e.rMax}  n ${r.n}`
    + `  ${e.clip.length ? `*** window CLIP ${e.clip.join('+')} — the fit is over a truncated feature ***` : 'window clear'}`);
  console.log(`§4.1 t grid [${r.grid[0]}, ${r.grid[1]}], t=0 is straight, t=${r.tConc.toFixed(5)} is concentric`
    + `  ${r.boundHit ? '*** RESULT AT A GRID END — NOT A VALUE ***' : 'result interior'}`);
  console.log(`  free-curvature fit t ${r.t.toFixed(5)}  yc ${r.yc.toFixed(1)}  Rc ${r.Rc.toFixed(1)}   rms ${r.rms.toFixed(4)}`);
  console.log(`  CONCENTRIC (yc=50) Rc ${r.conc.Rc.toFixed(2)}                       rms ${r.conc.rms.toFixed(4)}   x${(r.conc.rms / r.rms).toFixed(2)} the free fit`);
  console.log(`  STRAIGHT  y ${r.straight.y.toFixed(2)}                              rms ${r.straight.rms.toFixed(4)}   x${(r.straight.rms / r.rms).toFixed(2)} the free fit`);

  if (process.argv.includes('--response')) {
    console.log('\n§4 RESPONSE — three synthetic point sets over the same x range');
    const xs = pts.map((p) => p[0]);
    const mk = (fn) => xs.map((x) => [x, fn(x)]);
    const cases = [
      ['true concentric r=30', mk((x) => 50 - Math.sqrt(Math.max(0, 900 - (x - 50) ** 2)))],
      ['true straight y=22.8', mk(() => 22.8)],
      ['arc centre yc=110, R=90', mk((x) => 110 - Math.sqrt(Math.max(0, 8100 - (x - 50) ** 2)))],
      ['arc centre yc=70, R=50', mk((x) => 70 - Math.sqrt(Math.max(0, 2500 - (x - 50) ** 2)))],
    ];
    for (const [name, p] of cases) {
      const q = fit(p);
      console.log(`  ${name.padEnd(24)} -> t ${q.t.toFixed(5)} yc ${q.yc.toFixed(1)} Rc ${q.Rc.toFixed(1)} rms ${q.rms.toFixed(5)}`
        + ` | conc rms ${q.conc.rms.toFixed(4)} | straight rms ${q.straight.rms.toFixed(4)}${q.boundHit ? '  *** grid end ***' : ''}`);
    }
  }
}
