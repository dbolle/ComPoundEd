// R4 dime jaw — is D7's 111 deg knot a corner the DIE cuts, or an artefact of
// the fit? Appendix P2 says that is the first question, and that a real corner
// is declared rather than smoothed.
//
// The knot is index 23 of the fitted HEAD contour, at head-local (-2.31, 41.34)
// — the point of the bust truncation, where the near-vertical front of the bust
// meets the straight ~37 deg cut. Our path turns 110.97 deg there.
//
// The evidence is taken from the TARGET, not from our drawing: `_headmask.json`
// is the traced outline of dime-obv-2.jpg, frozen before any of this. This
// finds the mask vertex nearest the knot, fits a line to ARM units of mask
// contour on each side by total least squares, and reports the turn between
// them. If the coin's own outline turns by the same amount there, the knot is
// the object and not the curve fitter.
//
// SELECTION (§4.2): the arm length is swept over 2/3/4/5/6 local units and ALL
// answers are printed, because a corner measured over one arm length is a
// choice. NULL (§4.1): a turn is in [0,180] by construction and both bounds are
// printed; the mask's own vertex spacing is printed too, so a reader can see
// the arms contain enough points to fit.
// RESPONSE: the same measurement is run at a knot in the middle of the smooth
// throat (index 20), where the answer must come back small.
//
// Run: node coloringbook/judge/_jw4corner.mjs
import { readFileSync } from 'node:fs';
import { busted } from './_jw4reg.mjs';
import { marks, turns } from './_jqgeom.mjs';

const MASK = JSON.parse(readFileSync(new URL('../_headmask.json', import.meta.url)));
const B = await busted();
const { TX, TY, SX, SY } = B;
// mask (u,v) -> head local, through the same chain _jw4reg.mjs draws with
const toLocal = ([u, v]) => ({ x: (50 + 47 * u - TX) / SX, y: (50 + 47 * v - TY) / SY });
const P = MASK.polygon.map(toLocal);
const head = marks(`<svg><path d="${B.headD}"/></svg>`)[0];
const T = turns(head.knots);

const spacing = (() => {
  let s = 0;
  for (let i = 1; i < P.length; i++) s += Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y);
  return s / (P.length - 1);
})();
console.log(`mask: ${P.length} vertices, mean spacing ${spacing.toFixed(3)} local units`);
console.log('BOUNDS (null test): a turn angle lies in [0, 180] by construction.\n');

function maskTurn(target, arm) {
  let bi = 0, bd = Infinity;
  for (let i = 0; i < P.length; i++) {
    const d = Math.hypot(P[i].x - target.x, P[i].y - target.y);
    if (d < bd) { bd = d; bi = i; }
  }
  // CHORD, not a least-squares line. A TLS fit on a curved arm returns an
  // undirected axis, and orienting it by the arm's own end-to-end vector flipped
  // on the smooth-throat control: arm 3 reported 9.4 deg where arms 2 and 4
  // reported 165 and 148. A chord from the corner to the vertex `arm` units
  // along has an unambiguous direction and is monotone in `arm`; the arm's
  // maximum deviation from its own chord is printed as the straightness check.
  const dir = (from, step) => {
    const pts = [];
    for (let k = 0, i = from; k * spacing <= arm && k < P.length; k++, i = (i + step + P.length) % P.length) pts.push(P[i]);
    const n = pts.length, e = pts[n - 1], o = pts[0];
    const L = Math.hypot(e.x - o.x, e.y - o.y);
    const v = { x: (e.x - o.x) / L, y: (e.y - o.y) / L };
    let res = 0;
    for (const p of pts) res = Math.max(res, Math.abs((p.x - o.x) * v.y - (p.y - o.y) * v.x));
    return { v, n, res };
  };
  const a = dir(bi, -1), b = dir(bi, 1);
  const interior = (Math.acos(Math.max(-1, Math.min(1, a.v.x * b.v.x + a.v.y * b.v.y))) * 180) / Math.PI;
  return { at: P[bi], dist: bd, arm, nA: a.n, nB: b.n, resA: a.res, resB: b.res, turn: 180 - interior };
}

// The controls (§4): a point in the MIDDLE of the straight truncation cut,
// where the coin's own outline must turn by ~0 whatever the arm length, and a
// knot on the smooth throat. The first is the one that matters — if the
// estimator returns ~100 deg in the middle of a straight line it is measuring
// the estimator, not the die.
const MIDCUT = { x: (-2.31 + -31.49) / 2, y: (41.34 + 19.07) / 2 };
for (const [label, idx] of [['THE TRUNCATION POINT', 23],
  ['CONTROL: the middle of the straight cut', 'midcut'],
  ['CONTROL: a knot on the smooth throat', 20]]) {
  const k = idx === 'midcut' ? MIDCUT : head.knots[idx];
  const ours = idx === 'midcut' ? { deg: 0 } : T.find((t) => t.i === idx);
  console.log(`${label} — ${idx === 'midcut' ? 'a point on' : 'fitted HEAD knot ' + idx + ' at'} local (${k.x.toFixed(2)}, ${k.y.toFixed(2)}); our path turns ${ours.deg.toFixed(2)} deg`);
  console.log('   arm   nearest mask vertex   pts/side   line residual   MASK turn');
  for (const arm of [2, 3, 4, 5, 6]) {
    const r = maskTurn(k, arm);
    console.log(`   ${String(arm).padStart(3)}   (${r.at.x.toFixed(2)}, ${r.at.y.toFixed(2)}) d=${r.dist.toFixed(2)}`
      + `      ${String(r.nA).padStart(3)}/${String(r.nB).padStart(3)}   ${r.resA.toFixed(3)}/${r.resB.toFixed(3)}`
      + `        ${r.turn.toFixed(1)} deg`);
  }
  console.log('');
}
