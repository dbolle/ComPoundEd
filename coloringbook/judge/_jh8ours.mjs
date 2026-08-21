// ROUND 8, cent obverse — WHAT ANGLE DOES OUR TIP ACTUALLY DRAW?
//
// The brief's table compares the coin's ray-fan reading (sideburn 40-45 deg
// included) against "ours 35.5 deg (knot turn 144.5)". The 35.5 is 180 minus
// `_jqgeom.turns()`, and `turns()` walks the KNOT POLYGON: at knot i it takes
// the chord from knot i-1 and the chord to knot i+1. On HAIR.Lincoln the knots
// either side of the sideburn tip are 5.06 local units apart on average, so the
// knot polygon is a very coarse approximation of the drawn curve, and its
// corner angle is not the drawn corner angle whenever the Bezier handles are
// long.
//
// This measures the DRAWN outline instead, three independent ways, and prints
// all three so they can disagree in public:
//
//   (a) TANGENT included angle at the knot — the analytic angle between the two
//       Bezier handles meeting there. This is what the curve does in the limit
//       at the point itself.
//   (b) CHORD-ANGLE LADDER on the dense flattened outline (24 subdivisions per
//       segment), the same estimator `_jc5corner.mjs` runs on the frozen mask,
//       at the same spans, so our art and the target mask are read by one tool.
//   (c) BLUNTNESS — the arclength of outline within 0.25 local units of the
//       extreme point, i.e. how wide the flat bit at the bottom of the "tip" is.
//
// CONTROLS, every run:
//   response — a synthetic 40-degree wedge drawn as two straight `L` runs must
//     read 40 on the ladder at every span, and its tangent angle must read 40.
//   null     — a synthetic straight run must read 0 at every span.
//   in-art   — a stretch of OUR OWN path that no one calls a corner (the crown),
//     so the ladder's reading at the tip has to stand clear of our own noise.
//
// Nothing here is written; coins.js is read through `coinSVG`.
//
// To read the BEFORE revision, materialise the pinned baseline into src/art
// first (coins.js imports '../engine/money.js', which only resolves from
// there) and remove it afterwards:
//   cp coloringbook/judge/_jh8-before-coins.js src/art/_jh8ctl.js
//   JH8_BTIP="-17.28,8.63" node coloringbook/judge/_jh8ours.mjs ../../src/art/_jh8ctl.js
//   rm src/art/_jh8ctl.js
//
// Run: node coloringbook/judge/_jh8ours.mjs [srcPath]
import { flattenPath, turns } from './_jqgeom.mjs';

const SRC = process.argv[2] || '../../src/art/coins.js';
const mod = await import(SRC.startsWith('.') ? SRC : `file://${SRC}`);
const svg = mod.coinSVG('penny', 380, { side: 'obverse' });
const ds = [...svg.matchAll(/<path\b[^>]*?\sd="([^"]*)"/g)].map((m) => m[1]);
const pick = (pre) => ds.find((d) => d.startsWith(pre));

const SPANS = [0.5, 1, 2, 3, 4, 6, 8];
const deg = (r) => r * 180 / Math.PI;

// chord-angle ladder on a closed dense polyline
function ladder(P, idx) {
  const N = P.length;
  const at = (i) => P[((i % N) + N) % N];
  const seg = (i) => Math.hypot(at(i + 1).x - at(i).x, at(i + 1).y - at(i).y);
  const walk = (i, span, dir) => { let d = 0, k = i; while (d < span) { const s = dir > 0 ? seg(k) : seg(k - 1); if (!(s > 0)) { k += dir; continue; } d += s; k += dir; if (Math.abs(k - i) > N) break; } return at(k); };
  return SPANS.map((span) => {
    const a = walk(idx, span, -1), b = at(idx), c = walk(idx, span, +1);
    let t = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(b.y - a.y, b.x - a.x);
    while (t > Math.PI) t -= 2 * Math.PI; while (t < -Math.PI) t += 2 * Math.PI;
    return 180 - Math.abs(deg(t));                      // INCLUDED angle, not the turn
  });
}
const nearestIdx = (P, x, y) => { let b = 0, bd = 1e9; for (let i = 0; i < P.length; i++) { const d = Math.hypot(P[i].x - x, P[i].y - y); if (d < bd) { bd = d; b = i; } } return b; };
const row = (label, vals) => console.log(`  ${label.padEnd(50)}` + vals.map((v) => v.toFixed(1).padStart(7)).join(''));

console.log(`src ${SRC}`);
console.log(`\nINCLUDED angle (180 - turn). spans, local units:      ` + SPANS.map((s) => String(s).padStart(7)).join(''));

// ── controls ──────────────────────────────────────────────────────────────
{
  const mk = (d) => flattenPath(d).pts;
  // a 40-degree wedge pointing down: two straight arms 20 units long
  const half = 20 * Math.PI / 180;
  const wx = 20 * Math.sin(half), wy = 20 * Math.cos(half);
  const wedge = mk(`M ${-wx} ${-wy} L 0 0 L ${wx} ${-wy} L ${wx + 4} ${-wy - 30} L ${-wx - 4} ${-wy - 30} Z`);
  row('CONTROL response  synthetic 40-deg wedge (want 40)', ladder(wedge, nearestIdx(wedge, 0, 0)));
  const line = mk('M -30 0 L 0 0 L 30 0 L 30 -20 L -30 -20 Z');
  row('CONTROL null      synthetic straight run (want 180)', ladder(line, nearestIdx(line, 0, 0)));
  const nin = mk(`M ${-wx} ${-wy} L 0 0 L ${wx} ${-wy} L ${wx + 4} ${-wy - 30} L ${-wx - 4} ${-wy - 30} Z`);
  row('CONTROL response  same wedge, 90-deg variant', ladder(mk('M -20 -20 L 0 0 L 20 -20 L 24 -50 L -24 -50 Z'), nearestIdx(nin, 0, 0)));
}

// ── the two tips, on our art ──────────────────────────────────────────────
// A query is a POINT, and a reshape moves the point. Hard-coding the old
// coordinates made the "after" run snap to whatever lay nearest and report a
// smooth stretch at 179.9 deg — a confident answer about the wrong feature
// (Q4). So the beard's rear tip is passed in: JH8_BTIP="x,y". Both revisions
// are always reported at THEIR OWN tip, and both coordinates are printed.
const BTIP = (process.env.JH8_BTIP || '-17.28,8.63').split(',').map(Number);
const QUERIES = [
  ['HAIR sideburn tip', 'M 13.5 -27.05', -19.03, 11.99],
  [`BEARD rear tip (${BTIP[0]}, ${BTIP[1]})`, 'M 15.15 12.77', BTIP[0], BTIP[1]],
  ['BEARD front tip (closure)', 'M 15.15 12.77', 15.15, 12.77],
  ['HAIR forehead junction (closure)', 'M 13.5 -27.05', 13.50, -27.05],
];
const SMOOTH = [
  ['HAIR crown', 'M 13.5 -27.05', -8.77, -34.04],
  ['BEARD lower run', 'M 15.15 12.77', -5.16, 24.28],
];

// Every row prints the point the nearest-point search ACTUALLY landed on, not
// the point asked for. A query coordinate that a reshape has moved otherwise
// snaps silently to a smooth stretch and reports ~180 as if it were the tip.
console.log('');
for (const [name, pre, x, y] of SMOOTH) {
  const P = flattenPath(pick(pre)).pts;
  const i = nearestIdx(P, x, y);
  row(`IN-ART CONTROL  ${name} -> (${P[i].x.toFixed(2)},${P[i].y.toFixed(2)}) d${Math.hypot(P[i].x - x, P[i].y - y).toFixed(2)}`, ladder(P, i));
}
console.log('');
for (const [name, pre, x, y] of QUERIES) {
  const P = flattenPath(pick(pre)).pts;
  const i = nearestIdx(P, x, y);
  row(`QUERY  ${name} -> (${P[i].x.toFixed(2)},${P[i].y.toFixed(2)}) d${Math.hypot(P[i].x - x, P[i].y - y).toFixed(2)}`, ladder(P, i));
}

// ── DO THE TWO MASSES JOIN? ───────────────────────────────────────────────
// COIN-ART-METHOD §20.8: "On the coin the beard tapers to a POINT AT THE
// SIDEBURN". `_jc5corner.mjs` tested this with point-in-polygon and found both
// cusps outside the other mass — i.e. a wedge of cheek tone between the hair
// and the beard, where the photographs show one continuous dark mass. Its query
// coordinates are hard-coded to the round-5 path, so it cannot be re-run after a
// reshape without silently testing a point that no longer exists; this repeats
// the test at whatever the current tip actually is, and reports the DEPTH of the
// overlap rather than a boolean, because a 0.01-unit overlap and a 1-unit
// overlap render very differently under a 0.9-unit stroke.
//
// RESPONSE TEST: a point deliberately placed 2 units inside the hair must read
// inside with a positive depth; NULL TEST: a point on the bare cheek (the
// `cheek` tone-patch centre, 8.5,-1.5) must read outside both masses.
{
  const inside = (P, x, y) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i].y > y) !== (P[j].y > y) && x < (P[j].x - P[i].x) * (y - P[i].y) / (P[j].y - P[i].y) + P[i].x) c = !c; return c; };
  const dist = (P, x, y) => Math.min(...P.map((p) => Math.hypot(p.x - x, p.y - y)));
  const HAIRP = flattenPath(pick('M 13.5 -27.05')).pts;
  const BEARDP = flattenPath(pick('M 15.15 12.77')).pts;
  const bt = flattenPath(pick('M 15.15 12.77')).knots.reduce((m, k) => (k.x < m.x ? k : m));
  console.log('\nJUNCTION (§20.8 — the beard must taper to a point AT the sideburn)');
  console.log(`  RESPONSE  a point 2 units inside the hair (-20.5, 4) -> inside hair: ${inside(HAIRP, -20.5, 4)}`);
  console.log(`  NULL      the cheek patch centre (8.5, -1.5)        -> inside hair: ${inside(HAIRP, 8.5, -1.5)}, inside beard: ${inside(BEARDP, 8.5, -1.5)}`);
  console.log(`  beard rear-most knot (${bt.x.toFixed(2)}, ${bt.y.toFixed(2)}) inside the HAIR mass? ${inside(HAIRP, bt.x, bt.y)}   distance to the nearest hair-outline point ${dist(HAIRP, bt.x, bt.y).toFixed(3)} local units`);
  console.log(`  HAIR sideburn tip (-19.03, 11.99) inside the BEARD mass? ${inside(BEARDP, -19.03, 11.99)}`);
}

// ── (a) tangent included angle, and (c) bluntness ─────────────────────────
console.log('\nTANGENT included angle at the knot (the two Bezier handles), and BLUNTNESS');
console.log('  (bluntness = arclength of outline within 0.25 local units of the extreme point,');
console.log('   and the chord width of that stretch — a true point has both near 0)');
for (const [name, pre, x, y] of QUERIES) {
  const F = flattenPath(pick(pre));
  const P = F.pts, K = F.knots;
  const i = nearestIdx(P, x, y);
  const N = P.length;
  const at = (k) => P[((k % N) + N) % N];
  // tangent: use points a hair either side of the knot on the dense polyline
  const a = at(i - 1), b = at(i), c = at(i + 1);
  let t = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(b.y - a.y, b.x - a.x);
  while (t > Math.PI) t -= 2 * Math.PI; while (t < -Math.PI) t += 2 * Math.PI;
  const tangentIncluded = 180 - Math.abs(deg(t));
  // bluntness about the local extremum in the outward direction of the tip
  // (outward = away from the path centroid)
  let cx = 0, cy = 0; for (const p of P) { cx += p.x; cy += p.y; } cx /= N; cy /= N;
  const ux = b.x - cx, uy = b.y - cy, un = Math.hypot(ux, uy);
  const proj = (p) => ((p.x - cx) * ux + (p.y - cy) * uy) / un;
  // find the local max of proj within 6 units of arclength of the knot
  let best = i, bp = proj(at(i));
  for (let k = -60; k <= 60; k++) { const q = proj(at(i + k)); if (q > bp) { bp = q; best = i + k; } }
  let arc = 0, lo = best, hi = best;
  while (proj(at(lo - 1)) > bp - 0.25) { arc += Math.hypot(at(lo).x - at(lo - 1).x, at(lo).y - at(lo - 1).y); lo--; if (best - lo > 200) break; }
  while (proj(at(hi + 1)) > bp - 0.25) { arc += Math.hypot(at(hi + 1).x - at(hi).x, at(hi + 1).y - at(hi).y); hi++; if (hi - best > 200) break; }
  const chord = Math.hypot(at(hi).x - at(lo).x, at(hi).y - at(lo).y);
  const T = turns(K);
  const kt = T.reduce((m, q) => (Math.hypot(q.at.x - x, q.at.y - y) < Math.hypot(m ? m.at.x - x : 1e9, m ? m.at.y - y : 1e9) ? q : m), null);
  console.log(`  ${name.padEnd(34)} tangent-included ${tangentIncluded.toFixed(1).padStart(6)}   knot-polygon-included ${kt && Math.hypot(kt.at.x - x, kt.at.y - y) < 0.3 ? (180 - kt.deg).toFixed(1).padStart(6) : '  (closure)'}   blunt arc ${arc.toFixed(2)} chord ${chord.toFixed(2)} local units`);
}
