// D7 RE-STATED — tangent discontinuity, across every subject and side.
//
// ── WHY D7 IS BEING RE-STATED ──────────────────────────────────────────────
// `_jqgeom.turns()` measures the angle between the CHORDS joining consecutive
// on-curve knots. That is a property of how far apart the knots are, not of
// whether the curve kinks. Verified independently by the judge: a
// G1-continuous join of two half-circles, sampled as knots, returns a worst
// chord turn of 90.0 degrees, and 116.6 sampled coarsely. The tangent measure
// returns 0.0 on the same path.
//
// It survived four rounds of verdicts because the gate's own response test —
// "a synthetic path with a known 90 degree corner reports 90 +- 1" — passes on
// BOTH estimators and therefore cannot distinguish them. A response test that
// every candidate passes is not a discriminator.
//
// The quantity Appendix P2 is actually about ("a >75 deg knot is an
// oscillation artefact") is the TANGENT DISCONTINUITY at the join: the angle
// between the arriving segment's tangent at its end and the departing
// segment's tangent at its start. That is what the eye reads as a kink, and it
// is zero for a smooth join however far apart the knots are.
//
// Round 7 built the first version of this for one face (`_jq7tan.mjs`); this
// is the same idea generalised to every subject, so D7 can be re-derived
// wholesale and every published figure retracted against a like-for-like
// replacement.
//
// ── WHAT IT DOES NOT DO ────────────────────────────────────────────────────
// It does not edit `_jqgeom.mjs`. That file is shared with D6 and D8, both of
// which use it for things it does correctly (mark extraction, path length),
// and changing it mid-session would void work that is not at fault. The chord
// number is printed BESIDE the tangent number on every row so the two are
// always comparable and no published figure is silently replaced.
//
// ── ARCS ───────────────────────────────────────────────────────────────────
// `A` segments are counted and reported, not silently scored as zero. §4's
// rule — "a path command this does not understand returns 0, which deletes the
// bevel: a failure you can SEE rather than a breach you cannot" — is why the
// count is printed rather than the arcs being skipped quietly.
//
// Run: node coloringbook/judge/_jd7tan.mjs [size]
//      RESPONSE=1   the response and null tests only
import { readFileSync } from 'node:fs';

const SIZE = Number(process.argv[2] || 380);
const SRC = process.env.SRC || '../../src/art/coins.js';
const { coinSVG } = await import(SRC);

const ang = (a, b) => {
  const na = Math.hypot(a[0], a[1]), nb = Math.hypot(b[0], b[1]);
  if (na < 1e-9 || nb < 1e-9) return null; // degenerate handle: no tangent to speak of
  const c = (a[0] * b[0] + a[1] * b[1]) / (na * nb);
  return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
};

// Parse one `d` string into segments carrying their control points.
// Handles M/L/H/V/C/Q/Z and their relative forms; counts A and S/T as
// unsupported rather than guessing at them.
function segments(d) {
  const t = d.match(/[MmLlHhVvCcQqAaSsTtZz]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) || [];
  let i = 0, cur = [0, 0], start = [0, 0], cmd = '';
  const segs = []; let arcs = 0, unsupported = 0;
  const num = () => parseFloat(t[i++]);
  while (i < t.length) {
    if (/[A-Za-z]/.test(t[i])) cmd = t[i++];
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    const off = rel ? cur : [0, 0];
    if (C === 'M') { const p = [num() + off[0], num() + off[1]]; cur = p; start = p; cmd = rel ? 'l' : 'L'; }
    else if (C === 'L') { const p = [num() + off[0], num() + off[1]]; segs.push({ k: 'L', p0: cur, p1: p }); cur = p; }
    else if (C === 'H') { const p = [num() + (rel ? cur[0] : 0), cur[1]]; segs.push({ k: 'L', p0: cur, p1: p }); cur = p; }
    else if (C === 'V') { const p = [cur[0], num() + (rel ? cur[1] : 0)]; segs.push({ k: 'L', p0: cur, p1: p }); cur = p; }
    else if (C === 'C') {
      const c1 = [num() + off[0], num() + off[1]], c2 = [num() + off[0], num() + off[1]], p = [num() + off[0], num() + off[1]];
      segs.push({ k: 'C', p0: cur, c1, c2, p1: p }); cur = p;
    } else if (C === 'Q') {
      const c1 = [num() + off[0], num() + off[1]], p = [num() + off[0], num() + off[1]];
      segs.push({ k: 'Q', p0: cur, c1, p1: p }); cur = p;
    } else if (C === 'A') { for (let k = 0; k < 5; k++) num(); const p = [num() + off[0], num() + off[1]]; segs.push({ k: 'A', p0: cur, p1: p }); cur = p; arcs++; }
    else if (C === 'Z') { if (Math.hypot(cur[0] - start[0], cur[1] - start[1]) > 1e-9) segs.push({ k: 'L', p0: cur, p1: start }); cur = start; segs.push({ k: 'Z' }); }
    else { unsupported++; i++; }
  }
  return { segs: segs.filter((s) => s.k !== 'Z'), closed: /[Zz]\s*$/.test(d.trim()), arcs, unsupported };
}

const tanOut = (s) => (s.k === 'C' ? sub(s.c1, s.p0) : s.k === 'Q' ? sub(s.c1, s.p0) : sub(s.p1, s.p0));
const tanIn = (s) => (s.k === 'C' ? sub(s.p1, s.c2) : s.k === 'Q' ? sub(s.p1, s.c1) : sub(s.p1, s.p0));
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];

// chord turn, exactly as _jqgeom.turns() computes it, for comparison
const chordTurn = (a, b, c) => ang(sub(b, a), sub(c, b));

function scorePath(d) {
  const { segs, closed, arcs, unsupported } = segments(d);
  let worstT = 0, overT = 0, worstC = 0, overC = 0, n = 0, degenerate = 0;
  const joins = [];
  for (let i = 1; i < segs.length; i++) joins.push([segs[i - 1], segs[i]]);
  if (closed && segs.length > 1) joins.push([segs[segs.length - 1], segs[0]]); // the closure knot _jqgeom never evaluates
  for (const [a, b] of joins) {
    const tt = ang(tanIn(a), tanOut(b));
    const cc = chordTurn(a.p0, a.p1, b.p1);
    if (tt === null) { degenerate++; continue; }
    n++;
    if (tt > worstT) worstT = tt;
    if (tt > 75) overT++;
    if (cc !== null) { if (cc > worstC) worstC = cc; if (cc > 75) overC++; }
  }
  return { worstT, overT, worstC, overC, n, arcs, unsupported, degenerate };
}

if (process.env.RESPONSE) {
  console.log('RESPONSE / NULL TESTS');
  const cases = [
    ['known 90 deg TANGENT kink', 'M 0 0 C 1 0 2 0 3 0 C 3 1 3 2 3 3', 90, 90],
    ['G1-smooth join, knots far apart', 'M 0 0 C 0 5.5 4.5 10 10 10 C 15.5 10 20 5.5 20 0', 0, 90],
    ['straight run through a knot', 'M 0 0 C 1 0 2 0 3 0 C 4 0 5 0 6 0', 0, 0],
  ];
  for (const [name, d, wantT, wantC] of cases) {
    const r = scorePath(d);
    console.log(
      `  ${name.padEnd(34)} tangent ${r.worstT.toFixed(1).padStart(6)} (want ~${wantT})   chord ${r.worstC.toFixed(1).padStart(6)} (want ~${wantC})` +
        `  ${Math.abs(r.worstT - wantT) < 1.5 ? 'PASS' : '*** FAIL'}`
    );
  }
  console.log('  null: every angle is bounded [0,180] by construction (acos of a clamped dot product);');
  console.log('        a result AT 0 or 180 is printed as a value only because both are geometrically reachable.');
  console.log('        Degenerate handles (zero-length control legs) are COUNTED, never scored as 0.');
  process.exit(0);
}

console.log(`D7 re-stated — tangent discontinuity vs the chord turn _jqgeom measures. size ${SIZE}.`);
console.log('gate: 0 knots over 75 deg on fitted contours (authored corners exempt if declared)\n');
console.log('subject        side      paths  knots |  CHORD worst  over75 |  TANGENT worst  over75 |  arcs  degen');
const rows = {};
for (const id of ['penny', 'nickel', 'dime', 'quarter', 'buck']) {
  for (const side of ['obverse', 'reverse']) {
    const svg = coinSVG(id, SIZE, { side });
    const ds = [...svg.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]);
    let wc = 0, oc = 0, wt = 0, ot = 0, kn = 0, ar = 0, dg = 0;
    for (const d of ds) {
      const r = scorePath(d);
      wc = Math.max(wc, r.worstC); oc += r.overC;
      wt = Math.max(wt, r.worstT); ot += r.overT;
      kn += r.n; ar += r.arcs; dg += r.degenerate;
    }
    rows[`${id}.${side}`] = { chordWorst: +wc.toFixed(1), chordOver: oc, tanWorst: +wt.toFixed(1), tanOver: ot, knots: kn };
    console.log(
      `${id.padEnd(9)} ${side.padEnd(9)} ${String(ds.length).padStart(5)} ${String(kn).padStart(6)} | ` +
        `${wc.toFixed(1).padStart(11)} ${String(oc).padStart(7)} | ${wt.toFixed(1).padStart(13)} ${String(ot).padStart(7)} | ` +
        `${String(ar).padStart(5)} ${String(dg).padStart(6)}`
    );
  }
}
console.log('\nJSON', JSON.stringify(rows));
