// QUARTER OBVERSE — turn each wig mark to the direction the coin runs THERE.
//
// ⚠️ THE CHANGE THIS FILE GENERATES WAS APPLIED, MEASURED, AND REFUSED. It is
// kept because the refusal is the round's finding and this is its evidence
// (§1.1, retract-beside). Applied, it takes the direction error from median
// 10.3 deg to 0.1 and from 9-of-14 marks out to 0-of-14 — and it puts EIGHT
// centreline crossings into a wig that had zero, because these marks are an
// interleaved stack and rotating individual members of a stack makes them
// converge. A crossing-guarded greedy subset keeps only 4 of 9 and throws away
// the two tightest reference agreements. See RELIEF.Washington in coins.js.
// DO NOT PASTE THE OUTPUT unless the whole family is being re-authored.
//
// THE RULE IS STATED BEFORE THE NUMBERS, and it is the same rule the queue-fold
// taper was accepted under (`RELIEF.Washington.dark`): a mark moves only if the
// references RESOLVE it. Concretely, a mark is rotated iff
//   (a) at least two of the three allowed struck references have coherence
//       >= 0.25 at that mark's own midpoint, and
//   (b) |ours - coin mean| there is LARGER than the worst deviation between
//       those references at the same point.
// Anything that fails either test is left byte-identical: a difference smaller
// than the references' own disagreement is unresolved, not wrong.
//
// The rotation is RIGID ABOUT THE MARK'S OWN CHORD MIDPOINT. Nothing else about
// the mark changes: length, stroke width, curvature and midpoint are all
// preserved, so D6 (a fraction of drawn LENGTH) is unchanged by construction and
// the round-9/10 duty argument — which is about width and pitch — is untouched.
//
// FRAMES. The head group is `translate(49.6 41.8) scale(-0.98 0.98)`. The x
// mirror means a screen-frame angle is the NEGATIVE of the local-frame angle, so
// raising the screen angle by D means rotating the local path by -D. Getting
// that sign wrong would turn every mark the wrong way and still look plausible,
// so the generator re-measures the emitted result and refuses to print a mark
// whose new screen chord angle is not the target within 0.2 deg.
//
// SELF-CHECKS, all of which must pass or nothing is printed:
//   S1 chord angle of the rewritten path == target within 0.2 deg (SCREEN frame)
//   S2 chord length unchanged within 0.02 viewBox units
//   S3 every on-path point still inside the HAIR mass, taken from the LIVE
//      render's own hair path, with the clearance printed
//   S4 the rewritten string round-trips through the same parser
//
// Run: node coloringbook/judge/_qo8gen.mjs
import { MARKS, points, toView } from './_qo4marks.mjs';
import { coinSVG } from '../../src/art/coins.js';

const D2R = Math.PI / 180;
// measured by _qo5field.mjs on quarter-obv.jpg / quarter-obv-3.png /
// quarter-obv-1932ngc.jpg — the three independent, same-design struck files.
// [group, index, coin mean deg, n refs, worst between-reference deviation deg]
export const FIELD = [
  ['grooves', 0, 20.0, 3, 8.6], ['grooves', 1, 28.0, 3, 14.2], ['grooves', 2, 9.8, 3, 14.3],
  ['grooves', 3, 14.2, 3, 10.1], ['grooves', 4, 58.6, 2, 13.6], ['grooves', 5, 19.3, 3, 15.0],
  ['grooves', 6, 29.1, 2, 4.1],
  ['lit', 0, 15.5, 3, 4.6], ['lit', 1, 9.8, 3, 7.5], ['lit', 2, 27.9, 3, 4.1],
  ['lit', 3, 21.6, 2, 7.3], ['lit', 4, 7.2, 3, 15.1], ['lit', 5, 14.7, 3, 15.4],
  ['lit', 6, 36.2, 2, 6.3],
];

const NUMS = /[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g;
/** rotate every coordinate PAIR in a local path string about (mx,my) by `degLocal` */
function rotatePath(d, mx, my, degLocal) {
  const t = degLocal * D2R, c = Math.cos(t), s = Math.sin(t);
  const out = [];
  let k = 0, pending = null;
  const re = /([MmLlCcQqZzHhVvSsTtAa])|([-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?)/g;
  let m, rel = false;
  const buf = [];
  while ((m = re.exec(d))) {
    if (m[1]) { rel = /[a-z]/.test(m[1]); buf.push({ cmd: m[1] }); k = 0; }
    else buf.push({ n: parseFloat(m[2]), rel });
  }
  // pair up numbers; every command this face uses takes coordinate PAIRS
  const res = [];
  for (let i = 0; i < buf.length; i++) {
    if (buf[i].cmd) { res.push(buf[i].cmd); continue; }
    const a = buf[i], b = buf[i + 1];
    if (!b || b.cmd) throw new Error('_qo8gen: odd number of coordinates — path uses a non-pair command');
    i++;
    let x = a.n, y = b.n;
    if (a.rel) { const nx = x * c - y * s, ny = x * s + y * c; res.push(round(nx), round(ny)); }
    else { const dx = x - mx, dy = y - my; res.push(round(mx + dx * c - dy * s), round(my + dx * s + dy * c)); }
  }
  return res.join(' ').replace(/([MmLlCcQqZzHhVv]) /g, '$1 ');
}
const round = (v) => +(+v).toFixed(2);

// ── the HAIR mass, from the live render, as a flattened polygon in LOCAL units
const SVG = coinSVG('quarter', 380, { side: 'obverse' });
const hairM = SVG.match(/<g fill="#[0-9a-f]{6}" stroke="#[0-9a-f]{6}" stroke-width="[\d.]+" stroke-linejoin="round"><path d="(M 6\.55[^"]+)"/);
if (!hairM) throw new Error('_qo8gen: could not find the hair path in the live render');
function flatten(d) {
  const toks = d.match(/[MmLlCcQqZz]|[-+]?(?:\d*\.\d+|\d+\.?)/g);
  let i = 0, cmd = '', cx = 0, cy = 0, sx = 0, sy = 0; const P = [];
  const num = () => parseFloat(toks[i++]);
  const cub = (x1, y1, x2, y2, x3, y3) => {
    for (let t = 1; t <= 12; t++) {
      const u = t / 12, v = 1 - u;
      P.push([v * v * v * cx + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * x3,
        v * v * v * cy + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * y3]);
    }
    cx = x3; cy = y3;
  };
  while (i < toks.length) {
    if (/[A-Za-z]/.test(toks[i])) cmd = toks[i++];
    if (cmd === 'M') { cx = num(); cy = num(); sx = cx; sy = cy; P.push([cx, cy]); cmd = 'L'; }
    else if (cmd === 'L') { cx = num(); cy = num(); P.push([cx, cy]); }
    else if (cmd === 'C') cub(num(), num(), num(), num(), num(), num());
    else if (cmd === 'Z' || cmd === 'z') { cx = sx; cy = sy; P.push([cx, cy]); }
    else throw new Error('_qo8gen: hair path command ' + cmd);
  }
  return P;
}
const HAIR = flatten(hairM[1]);
function inside([x, y]) {
  let c = false;
  for (let i = 0, j = HAIR.length - 1; i < HAIR.length; j = i++) {
    const [xi, yi] = HAIR[i], [xj, yj] = HAIR[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}
function clearance([x, y]) {           // distance to the hair boundary, signed +inside
  let best = Infinity;
  for (let i = 0, j = HAIR.length - 1; i < HAIR.length; j = i++) {
    const [xi, yi] = HAIR[i], [xj, yj] = HAIR[j];
    const dx = xj - xi, dy = yj - yi, L2 = dx * dx + dy * dy;
    const t = L2 ? Math.max(0, Math.min(1, ((x - xi) * dx + (y - yi) * dy) / L2)) : 0;
    best = Math.min(best, Math.hypot(x - (xi + t * dx), y - (yi + t * dy)));
  }
  return (inside([x, y]) ? 1 : -1) * best;
}

const scr = (a, b) => { let t = Math.atan2(b[1] - a[1], b[0] - a[0]) / D2R; while (t > 90) t -= 180; while (t <= -90) t += 180; return t; };

console.log('rule: rotate iff n>=2 references agree AND |ours-coin| > worst between-reference deviation\n');
console.log('mark          ours   coin  n  spread   |d|>spread?   ACTION');
const OUT = [];
let fail = 0;
for (const [g, idx, coin, n, spread] of FIELD) {
  const m = MARKS.find((k) => k.group.startsWith(g) && k.i === idx);
  if (!m) { console.log(`!! ${g}[${idx}] not found in the live render`); fail++; continue; }
  let d = ((m.deg - coin + 90) % 180 + 180) % 180 - 90;
  const move = n >= 2 && Math.abs(d) > spread;
  console.log(`${(g + '[' + idx + ']').padEnd(12)}${String(m.deg).padStart(6)} ${String(coin).padStart(6)}  ${n}  ${String(spread).padStart(5)}   ${(Math.abs(d).toFixed(1) + ' vs ' + spread).padEnd(14)}${move ? `ROTATE by ${(-d).toFixed(1)} deg (screen)` : 'unresolved — LEFT ALONE'}`);
  if (!move) continue;
  // screen angle rises by (-d); local angle therefore falls by (-d)
  const localPts = points(m.d);
  const a = localPts[0], b = localPts[localPts.length - 1];
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const nd = rotatePath(m.d, mx, my, d);            // local rotation = +d  (screen = -d)
  // S1/S2/S4
  const np = points(nd);
  const A = toView(np[0]), B = toView(np[np.length - 1]);
  const gotDeg = scr(A, B);
  const wantDeg = coin;
  const e1 = Math.abs(((gotDeg - wantDeg + 90) % 180 + 180) % 180 - 90);
  const L0 = m.len, L1 = Math.hypot(B[0] - A[0], B[1] - A[1]);
  const e2 = Math.abs(L1 - L0);
  const cl = np.map(clearance);
  const worstCl = Math.min(...cl);
  const ok = e1 < 0.2 && e2 < 0.02 && worstCl > 0;
  if (!ok) fail++;
  console.log(`    S1 chord ${gotDeg.toFixed(2)} vs target ${wantDeg} (err ${e1.toFixed(3)})   S2 len ${L1.toFixed(3)} vs ${L0} (err ${e2.toFixed(3)})   S3 worst clearance inside HAIR ${worstCl.toFixed(2)} local units   ${ok ? 'PASS' : '!! FAIL'}`);
  OUT.push({ g, idx, w: m.w, nd });
}
if (fail) { console.log(`\n!! ${fail} self-checks failed — no path printed.`); process.exit(1); }

console.log('\n=== new path strings (local units, ready to paste) ===');
for (const o of OUT) console.log(`${o.g}[${o.idx}]  '<path d="${o.nd}" fill="none" stroke-width="${o.w}"/>' +`);
