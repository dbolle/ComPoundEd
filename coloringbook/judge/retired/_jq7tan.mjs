// ROUND 7, QUARTER OBVERSE — is D7 measuring the CURVE or its chord polygon?
//
// `_jqgeom.mjs`'s `turns()` walks the ON-CURVE knots K[i-1], K[i], K[i+1] and
// returns the angle between the two CHORDS. On a polyline that is the corner.
// On a cubic Bezier path it is not: two knots joined by a long curved segment
// have a chord whose direction is the segment's AVERAGE direction, not its
// direction at the knot. A perfectly smooth join can then report a large angle,
// and a real kink can report a small one.
//
// The quantity Appendix P2 is actually about — "a >75 deg knot is an
// oscillation artefact" — is the TANGENT DISCONTINUITY at the join: the angle
// between the incoming tangent (P3 - P2 of the arriving cubic) and the outgoing
// tangent (C1 - P3 of the departing one). That is what the eye sees as a kink,
// and it is zero for a G1-continuous join however far apart the knots are.
//
// This prints BOTH for every knot on the quarter obverse's fitted contours, so
// the two can be compared. It parses the `d` string itself rather than using
// `flattenPath`, because the control points are exactly what `flattenPath`
// throws away.
//
// RESPONSE TEST — a synthetic path with a KNOWN 90 deg tangent kink
// ('M 0 0 C 1 0 2 0 3 0 C 3 1 3 2 3 3') must report 90 for the tangent measure,
// and a synthetic SMOOTH join of two half-circles must report ~0 while its
// chord measure is large. Both are printed. This is `quarter-gates.md`'s own
// stated D7 response test ("a synthetic path with a known 90 deg corner
// reports 90 +- 1"), applied to both estimators.
//
// Run: node coloringbook/judge/_jq7tan.mjs
import { marks, turns } from './_jqgeom.mjs';

const NUM = /[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g;

// Parse a path's cubic structure: for each on-curve knot, the incoming and
// outgoing tangent directions. Supports M/C/Q/L/Z, which is all this file emits
// on these paths.
function tangents(d) {
  const toks = d.match(/[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g) || [];
  let i = 0, cur = null, start = null, cmd = null;
  const knots = [];        // { p, tin, tout }
  const num = () => Number(toks[i++]);
  const push = (p, tin, tout) => knots.push({ p, tin, tout });
  while (i < toks.length) {
    if (/[A-Za-z]/.test(toks[i])) cmd = toks[i++];
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
    const ox = rel ? cur?.x || 0 : 0, oy = rel ? cur?.y || 0 : 0;
    if (C === 'M') {
      cur = { x: num() + ox, y: num() + oy }; start = { ...cur };
      push({ ...cur }, null, null); cmd = rel ? 'l' : 'L';
    } else if (C === 'L') {
      const e = { x: num() + ox, y: num() + oy };
      const t = { x: e.x - cur.x, y: e.y - cur.y };
      knots[knots.length - 1].tout = t;
      push(e, t, null); cur = e;
    } else if (C === 'C') {
      const c1 = { x: num() + ox, y: num() + oy };
      const c2 = { x: num() + ox, y: num() + oy };
      const e = { x: num() + ox, y: num() + oy };
      knots[knots.length - 1].tout = { x: c1.x - cur.x, y: c1.y - cur.y };
      push(e, { x: e.x - c2.x, y: e.y - c2.y }, null); cur = e;
    } else if (C === 'Q') {
      const c1 = { x: num() + ox, y: num() + oy };
      const e = { x: num() + ox, y: num() + oy };
      knots[knots.length - 1].tout = { x: c1.x - cur.x, y: c1.y - cur.y };
      push(e, { x: e.x - c1.x, y: e.y - c1.y }, null); cur = e;
    } else if (C === 'Z') {
      cur = { ...start };
    } else { i++; }
  }
  return knots;
}
const ang = (a, b) => {
  if (!a || !b) return null;
  let t = Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x);
  while (t > Math.PI) t -= 2 * Math.PI;
  while (t < -Math.PI) t += 2 * Math.PI;
  return Math.abs((t * 180) / Math.PI);
};

console.log('### RESPONSE TESTS (quarter-gates.md: "a synthetic path with a known 90 deg corner reports 90 +- 1")');
const kink = 'M 0 0 C 1 0 2 0 3 0 C 3 1 3 2 3 3';
const kt = tangents(kink);
console.log(`  known 90 deg tangent kink : tangent measure ${ang(kt[1].tin, kt[1].tout).toFixed(1)} deg`
  + `, chord measure ${turns(marks(`<svg><path d="${kink}"/></svg>`)[0].knots)[0].deg.toFixed(1)} deg`);
// two half-circles joined smoothly: G1 continuous, but the chords turn hard
const kappa = 0.5523;
const smooth = `M 0 -1 C ${kappa} -1 1 ${-kappa} 1 0 C 1 ${kappa} ${kappa} 1 0 1`;
const st = tangents(smooth);
console.log(`  known SMOOTH G1 join      : tangent measure ${ang(st[1].tin, st[1].tout).toFixed(1)} deg`
  + `, chord measure ${turns(marks(`<svg><path d="${smooth}"/></svg>`)[0].knots)[0].deg.toFixed(1)} deg`);
console.log('');

const mod = await import('../../src/art/coins.js');
const svg = mod.coinSVG('quarter', 190, { side: 'obverse' });
const all = marks(svg).slice(1);
// pull the raw `d` strings out of the emitted SVG itself — `marks()` truncates
// its `tag` at 200 characters, so the long contours cannot be read back from it.
const ds = [...svg.matchAll(/<path[^>]*\sd="([^"]*)"/g)].map((m) => m[1]);

console.log('### every knot the CHORD measure puts over 75 deg, with its TANGENT discontinuity');
console.log('  chord   tangent   knot            path (first 60 chars of d)');
let worstChord = 0, worstTan = 0, overChord = 0, overTan = 0;
const seen = new Set();
for (const d of ds) {
  if (seen.has(d)) continue;
  seen.add(d);
  const mk = marks(`<svg><path d="${d}"/></svg>`)[0];
  if (!mk || !mk.knots.length) continue;
  const T = turns(mk.knots), G = tangents(d);
  for (const t of T) {
    const g = G[t.i] ? ang(G[t.i].tin, G[t.i].tout) : null;
    if (t.deg > worstChord) worstChord = t.deg;
    if (g !== null && g > worstTan) worstTan = g;
    if (t.deg > 75) overChord++;
    if (g !== null && g > 75) overTan++;
    if (t.deg <= 75) continue;
    console.log(`  ${t.deg.toFixed(1).padStart(5)}   ${g === null ? '  -  ' : g.toFixed(1).padStart(5)}    ${String(t.i).padStart(2)} of ${String(mk.knots.length).padStart(2)}   ${d.replace(/\s+/g, ' ').slice(0, 60)}`);
  }
}
console.log('');
console.log(`CHORD   measure: worst ${worstChord.toFixed(1)} deg, ${overChord} knots over 75  <- what the scorecard reports`);
console.log(`TANGENT measure: worst ${worstTan.toFixed(1)} deg, ${overTan} knots over 75`);
