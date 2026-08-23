// §7 CLEARANCE for the nickel obverse's face marks, ours against ours.
//
// Two marks whose INKED bodies come closer than about 0.15 local units read as
// one mark at the sizes this coin draws; round 4 worked to that margin and
// round 16 recorded nine violations at 0.07. This measures the gap between
// every drawn mark on the nickel obverse and every other one, edge to edge —
// polyline-to-polyline distance minus the two stroke half-widths — in the
// head's own local units, and prints the worst pairs.
//
// The head CONTOUR is included as a mark: its stroke is 1.15 device units wide
// inside a group scaled by s, i.e. 0.605 local half-width at the authored size,
// and a face mark that fouls it is the same defect as one that fouls a ridge.
import { coinSVG } from '../../src/art/coins.js';

const S = 0.95;
const CONTOUR_HW = (1.15 / S) / 2;

function flattenPath(d) {
  const t = d.match(/-?[\d.]+|[A-Za-z]/g);
  const pts = []; let i = 0, cur = [0, 0], start = [0, 0], cmd = '';
  const bez = (p0, p1, p2, p3) => { for (let s = 1; s <= 24; s++) { const u = s / 24, v = 1 - u;
    pts.push([v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0],
      v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]); } };
  const quad = (p0, p1, p2) => { for (let s = 1; s <= 16; s++) { const u = s / 16, v = 1 - u;
    pts.push([v * v * p0[0] + 2 * v * u * p1[0] + u * u * p2[0], v * v * p0[1] + 2 * v * u * p1[1] + u * u * p2[1]]); } };
  while (i < t.length) {
    if (/[A-Za-z]/.test(t[i])) { cmd = t[i++]; if (cmd === 'Z' || cmd === 'z') { pts.push(start); continue; } }
    if (cmd === 'M') { cur = [+t[i++], +t[i++]]; start = cur; pts.push(cur); }
    else if (cmd === 'L') { cur = [+t[i++], +t[i++]]; pts.push(cur); }
    else if (cmd === 'C') { const a = [+t[i++], +t[i++]], b = [+t[i++], +t[i++]], c = [+t[i++], +t[i++]]; bez(cur, a, b, c); cur = c; }
    else if (cmd === 'c') { const a = [cur[0] + +t[i++], cur[1] + +t[i++]], b = [cur[0] + +t[i++], cur[1] + +t[i++]], c = [cur[0] + +t[i++], cur[1] + +t[i++]]; bez(cur, a, b, c); cur = c; }
    else if (cmd === 'q') { const a = [cur[0] + +t[i++], cur[1] + +t[i++]], c = [cur[0] + +t[i++], cur[1] + +t[i++]]; quad(cur, a, c); cur = c; }
    else if (cmd === 'Q') { const a = [+t[i++], +t[i++]], c = [+t[i++], +t[i++]]; quad(cur, a, c); cur = c; }
    else if (cmd === 'A') { i += 5; cur = [+t[i++], +t[i++]]; pts.push(cur); }
    else i++;
  }
  return pts;
}
const segDist = (p, a, b) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
  let t = L ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
};
const polyDist = (A, B) => {
  let m = Infinity;
  for (const p of A) for (let k = 0; k + 1 < B.length; k++) m = Math.min(m, segDist(p, B[k], B[k + 1]));
  for (const p of B) for (let k = 0; k + 1 < A.length; k++) m = Math.min(m, segDist(p, A[k], A[k + 1]));
  return m;
};

// pull every mark inside the bust group out of the emitted SVG, in LOCAL units
const svg = coinSVG('nickel', 380, { side: 'obverse' });
const g = svg.slice(svg.indexOf('scale('));
const marks = [];
for (const m of g.matchAll(/<path d="([^"]+)"([^>]*)>/g)) {
  const attrs = m[2];
  const swm = attrs.match(/stroke-width="([\d.]+)"/);
  const filled = /stroke="none"/.test(attrs);
  const pts = flattenPath(m[1]);
  if (pts.length < 2) continue;
  marks.push({ pts, hw: filled ? 0 : (swm ? +swm[1] : CONTOUR_HW * 2) / 2, d: m[1].slice(0, 34) });
}
for (const m of g.matchAll(/<ellipse cx="([-\d.]+)" cy="([-\d.]+)" rx="([\d.]+)" ry="([\d.]+)"(?: transform="rotate\(([-\d.]+)[^)]*\))?/g)) {
  const [cx, cy, rx, ry] = [+m[1], +m[2], +m[3], +m[4]];
  const a = ((+m[5] || 0) * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  const pts = [];
  for (let k = 0; k <= 48; k++) { const t = (k / 48) * 2 * Math.PI, x = rx * Math.cos(t), y = ry * Math.sin(t);
    pts.push([cx + x * ca - y * sa, cy + x * sa + y * ca]); }
  marks.push({ pts, hw: 0, d: `ellipse (${cx}, ${cy})` });
}
for (const m of g.matchAll(/<circle cx="([-\d.]+)" cy="([-\d.]+)" r="([\d.]+)"/g)) {
  const [cx, cy, r] = [+m[1], +m[2], +m[3]];
  const pts = [];
  for (let k = 0; k <= 48; k++) { const t = (k / 48) * 2 * Math.PI; pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); }
  marks.push({ pts, hw: 0, d: `circle (${cx}, ${cy})` });
}
// keep only the ones with any point in the FACE window
const inFace = (m) => m.pts.some(([x, y]) => x > -2 && x < 26 && y > -18 && y < 14);
const face = marks.filter(inFace);
console.log(`nickel obverse: ${marks.length} marks in the bust group, ${face.length} with ink in the face window (x -2..26, y -18..14)`);
// the three HEAD copies (bevel lit, bevel dark, the drawn one) are the same
// curve at three offsets; only the DRAWN one carries the contour stroke, so
// collapse them to the one with a stroke and drop the rest.
const isHead = (m) => m.d.startsWith('M 10.09 25.93');
const kept = face.filter((m) => !isHead(m) || m.hw > 0);
const name = (m) => (isHead(m) ? 'HEAD contour' : m.d.startsWith('M 9.32 -25.96') ? 'HAIR mass' : m.d);
const pairs = [];
for (let i = 0; i < kept.length; i++) for (let j = i + 1; j < kept.length; j++) {
  const gap = polyDist(kept[i].pts, kept[j].pts) - kept[i].hw - kept[j].hw;
  pairs.push([gap, name(kept[i]), name(kept[j])]);
}
pairs.sort((a, b) => a[0] - b[0]);
console.log(`\n${kept.length} distinct face marks; closest pairs, edge to edge, LOCAL units (§7 works to 0.15):`);
for (const [gp, a, b] of pairs.slice(0, 12)) console.log(`  ${gp.toFixed(3).padStart(7)}   ${a}   ||   ${b}`);
