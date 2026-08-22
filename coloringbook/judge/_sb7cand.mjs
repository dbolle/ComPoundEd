// SPECIALIST round, cent obverse — what does it COST to take `BEARD` knot 7's
// tangent discontinuity under the 75 deg gate?
//
// There is exactly one way to move a tangent discontinuity at a knot without
// moving the knot: rotate one or both of the flanking control points until the
// incoming and outgoing tangents are parallel. This builds the three variants
// that do that and measures each with the same estimator `_sb7tan.mjs` uses,
// plus the position the rear tip's two edges then leave in.
//
// Nothing here is proposed. It exists so the round can publish the cost of the
// edit it did not make (brief-common rule 4: do not take a change because it
// scores better; publish the derivation).
//
// Run: node coloringbook/judge/_sb7cand.mjs
import { flattenPath } from './_jqgeom.mjs';

const ROOT = new URL('../../', import.meta.url).pathname;
const { coinSVG } = await import(`${ROOT}src/art/coins.js`);
const D = [...coinSVG('penny', 380, { side: 'obverse' }).matchAll(/<path\b[^>]*?\sd="([^"]*)"/g)]
  .map((m) => m[1]).find((d) => d.startsWith('M 15.15 12.77'));

// knot 7 and its two flanking controls, as they appear in the emitted string
const P = [-18.85, 4];                 // knot 7, the rear tip
const CIN = [-17.84, 7.14];            // c2 of the segment arriving at knot 7
const COUT = [-18.02, 3.65];           // c1 of the segment leaving knot 7
const n2 = (v) => (Math.round(v * 100) / 100).toFixed(2).replace(/\.?0+$/, '') || '0';

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const norm = (a) => { const n = Math.hypot(...a); return [a[0] / n, a[1] / n]; };
const len = (a) => Math.hypot(...a);
const degOf = (a) => Math.atan2(a[1], a[0]) * 180 / Math.PI;
const tIn = sub(P, CIN), tOut = sub(COUT, P);
const aIn = degOf(tIn), aOut = degOf(tOut);
let diff = aOut - aIn; while (diff > 180) diff -= 360; while (diff < -180) diff += 360;
console.log(`knot 7 (${P}) — incoming tangent ${aIn.toFixed(2)} deg (len ${len(tIn).toFixed(3)}), outgoing ${aOut.toFixed(2)} deg (len ${len(tOut).toFixed(3)}), break ${Math.abs(diff).toFixed(2)} deg`);
console.log(`  (screen convention: 0 = +x = toward the face, +90 = DOWN. The rear edge ARRIVES heading down-left; the top edge LEAVES heading forward.)\n`);

const mid = (aIn + (aIn + diff)) / 2;
const dirAt = (deg) => [Math.cos(deg * Math.PI / 180), Math.sin(deg * Math.PI / 180)];
const CANDS = [
  ['A  keep the rear edge, rotate the top edge to match', CIN, [P[0] + len(tOut) * norm(tIn)[0], P[1] + len(tOut) * norm(tIn)[1]]],
  ['B  keep the top edge, rotate the rear edge to match', [P[0] - len(tIn) * norm(tOut)[0], P[1] - len(tIn) * norm(tOut)[1]], COUT],
  ['C  split the difference, both rotated by half', [P[0] - len(tIn) * dirAt(mid)[0], P[1] - len(tIn) * dirAt(mid)[1]], [P[0] + len(tOut) * dirAt(mid)[0], P[1] + len(tOut) * dirAt(mid)[1]]],
];

// ── the estimators, identical to _sb7tan.mjs ──────────────────────────────
const ang = (a, b) => (Math.acos(Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1]) / (Math.hypot(...a) * Math.hypot(...b))))) * 180) / Math.PI;
const SPANS = [0.5, 1, 2, 3, 4, 6, 8];
function ladder(d, q) {
  const pts = flattenPath(d, 96).pts, N = pts.length;
  const at = (i) => pts[((i % N) + N) % N];
  const seglen = (i) => Math.hypot(at(i + 1).x - at(i).x, at(i + 1).y - at(i).y);
  let bi = 0, bd = 1e9;
  for (let i = 0; i < N; i++) { const dd = Math.hypot(at(i).x - q[0], at(i).y - q[1]); if (dd < bd) { bd = dd; bi = i; } }
  const walk = (span, dir) => { let dd = 0, k = bi; while (dd < span) { dd += dir > 0 ? seglen(k) : seglen(k - 1); k += dir; if (Math.abs(k - bi) > N) break; } return at(k); };
  return SPANS.map((span) => {
    const a = walk(span, -1), b = at(bi), c = walk(span, +1);
    let t = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(b.y - a.y, b.x - a.x);
    while (t > Math.PI) t -= 2 * Math.PI; while (t < -Math.PI) t += 2 * Math.PI;
    return Math.abs(t * 180 / Math.PI);
  });
}
// area of the closed outline, so a candidate that eats the tip is visible as mass lost
const area = (d) => { const p = flattenPath(d, 96).pts; let s = 0; for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; s += p[i].x * q.y - q.x * p[i].y; } return Math.abs(s) / 2; };

const OLD = `C -16.35 12.52 ${n2(CIN[0])} ${n2(CIN[1])} -18.85 4 C ${n2(COUT[0])} ${n2(COUT[1])}`;
if (!D.includes(OLD)) { console.log(`!! anchor not found in the render — FIX THIS FILE, do not trust the numbers.\n   wanted: ${OLD}`); process.exit(1); }

const row = (label, arr) => console.log(`  ${label.padEnd(52)}` + arr.map((a) => a.toFixed(1).padStart(7)).join(''));
console.log(`DRAWN-OUTLINE TURN AT THE REAR TIP, per candidate` + `\n  ${' '.repeat(52)}` + SPANS.map((s) => String(s).padStart(7)).join('') + '   <- span, local units');
row('SHIPPED  (tangent break 85.0)', ladder(D, P));
const out = [];
for (const [name, cin, cout] of CANDS) {
  const d2 = D.replace(OLD, `C -16.35 12.52 ${n2(cin[0])} ${n2(cin[1])} -18.85 4 C ${n2(cout[0])} ${n2(cout[1])}`);
  const brk = ang(sub(P, cin), sub(cout, P));
  row(`${name}  (tangent break ${brk.toFixed(1)})`, ladder(d2, P));
  out.push([name, cin, cout, brk, d2]);
}
console.log(`\nWHERE THE CONTROLS END UP, and what that does to the two edges:`);
console.log(`  SHIPPED    rear-edge control (${n2(CIN[0])}, ${n2(CIN[1])})   top-edge control (${n2(COUT[0])}, ${n2(COUT[1])})   outline area ${area(D).toFixed(2)} sq local units`);
for (const [name, cin, cout, brk, d2] of out)
  console.log(`  ${name.slice(0, 1)}          rear-edge control (${n2(cin[0])}, ${n2(cin[1])})   top-edge control (${n2(cout[0])}, ${n2(cout[1])})   outline area ${area(d2).toFixed(2)}   tangent break ${brk.toFixed(2)}`);

console.log(`\nEvery candidate keeps knot 7 exactly where v1.62.0 measured it; only the`);
console.log(`control points move. The question the numbers answer is whether making the`);
console.log(`JOIN smooth makes the DRAWN TIP better or worse.`);
