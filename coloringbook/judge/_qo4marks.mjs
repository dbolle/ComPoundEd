// QUARTER OBVERSE — every mark this face actually EMITS, in viewBox units.
//
// It reads the LIVE render (`coinSVG('quarter', 380, {side:'obverse'})`), finds
// the head group and its `translate(...) scale(...)`, and reports each path's
// geometry in the screen frame. §6.1.1: assert, never copy — nothing here is
// transcribed from the source, so it cannot go stale when the art moves.
//
// ⚠️ coins.js records a tool that "handles M/L/q but not C, and silently
// collapsed four face marks". So the path reader below consumes EVERY command
// this file uses (M m L l C c q Q Z z) and ASSERTS that the number of
// coordinates it consumed equals the number of numbers in the string. A reader
// that silently drops a command is the failure mode being guarded against, and
// a count check is the cheapest way to make dropping impossible.
//
// Run: node coloringbook/judge/_qo4marks.mjs
import { coinSVG } from '../../src/art/coins.js';

const NUM = /[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g;

/** every ON-PATH point of a path `d`, in the order drawn, with a consumption check */
export function points(d) {
  const toks = d.match(/[MmLlCcQqZzHhVvSsTtAa]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g) || [];
  const total = (d.match(NUM) || []).length;
  let i = 0, used = 0, cx = 0, cy = 0, sx = 0, sy = 0, cmd = '';
  const pts = [];
  const num = () => { used++; return parseFloat(toks[i++]); };
  while (i < toks.length) {
    if (/[A-Za-z]/.test(toks[i])) { cmd = toks[i++]; }
    switch (cmd) {
      case 'M': cx = num(); cy = num(); sx = cx; sy = cy; pts.push([cx, cy]); cmd = 'L'; break;
      case 'm': cx += num(); cy += num(); sx = cx; sy = cy; pts.push([cx, cy]); cmd = 'l'; break;
      case 'L': cx = num(); cy = num(); pts.push([cx, cy]); break;
      case 'l': cx += num(); cy += num(); pts.push([cx, cy]); break;
      case 'H': cx = num(); pts.push([cx, cy]); break;
      case 'V': cy = num(); pts.push([cx, cy]); break;
      case 'C': num(); num(); num(); num(); cx = num(); cy = num(); pts.push([cx, cy]); break;
      case 'c': num(); num(); num(); num(); cx += num(); cy += num(); pts.push([cx, cy]); break;
      case 'Q': num(); num(); cx = num(); cy = num(); pts.push([cx, cy]); break;
      case 'q': num(); num(); cx += num(); cy += num(); pts.push([cx, cy]); break;
      case 'Z': case 'z': cx = sx; cy = sy; pts.push([cx, cy]); break;
      default: throw new Error('_qo4marks: unhandled path command "' + cmd + '" in ' + d.slice(0, 60));
    }
  }
  if (used !== total) throw new Error(`_qo4marks: consumed ${used} of ${total} numbers in "${d.slice(0, 60)}…" — the reader dropped a command`);
  return pts;
}

const SVG = coinSVG('quarter', 380, { side: 'obverse' });

// the head group: the one whose transform carries the scale
const gm = SVG.match(/transform="translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+) ([-\d.]+)\)"/);
if (!gm) throw new Error('_qo4marks: no head-group transform found in the live render');
export const TX = +gm[1], TY = +gm[2], SX = +gm[3], SY = +gm[4];
export const toView = ([x, y]) => [TX + SX * x, TY + SY * y];

// classify the relief sub-groups by the attributes bust() gives them.
// ⚠️ The body of a group is taken by BRACE MATCHING, not by a non-greedy regex:
// the `dark` group contains `eye()`'s own `<g transform="translate(8.7 -2.7)">`,
// and a non-greedy `<\/g>` stops at that inner tag — which silently reported the
// dark group as ONE mark instead of nine, and reported the eye 6.7 viewBox units
// from where it draws because the inner translate was never applied. Both faults
// were in v1 of this file. The nested translate is applied below.
const HEAD_BODY = SVG.slice(gm.index);
function groupBody(startIdx) {
  let i = startIdx, depth = 1;
  while (i < HEAD_BODY.length && depth > 0) {
    const open = HEAD_BODY.indexOf('<g', i), close = HEAD_BODY.indexOf('</g>', i);
    if (close < 0) throw new Error('_qo4marks: unbalanced <g> in the live render');
    if (open >= 0 && open < close) { depth++; i = open + 2; } else { depth--; i = close + 4; }
  }
  return HEAD_BODY.slice(startIdx, i - 4);
}
const GROUPS = [
  { group: 'grooves(ink .33)', re: /opacity="0\.33">/ },
  { group: 'lit(field .85)', re: /stroke="#[0-9a-f]{6}" stroke-linecap="round" stroke-linejoin="round" opacity="0\.85">/ },
  { group: 'modelling(.28)', re: /fill="none" stroke="#[0-9a-f]{6}" stroke-linecap="round" stroke-linejoin="round" opacity="0\.28">/ },
  { group: 'dark(ink .42)', re: /opacity="0\.42">/ },
];

const D2R = Math.PI / 180;
const ang = (a, b) => {
  let t = Math.atan2(b[1] - a[1], b[0] - a[0]) / D2R;
  while (t > 90) t -= 180; while (t <= -90) t += 180;
  return +t.toFixed(1);
};

export const MARKS = [];
for (const { group, re } of GROUPS) {
  const m = HEAD_BODY.match(re);
  if (!m) { console.error(`!! group ${group} not found`); continue; }
  const body = groupBody(m.index + m[0].length);
  // nested translate groups (eye()'s offset) — record the shift each path sits under
  const shifts = [];
  for (const g of body.matchAll(/<g transform="translate\(([-\d.]+) ([-\d.]+)\)">([\s\S]*?)<\/g>/g)) {
    shifts.push({ from: g.index, to: g.index + g[0].length, dx: +g[1], dy: +g[2] });
  }
  const shiftAt = (idx) => shifts.find((s) => idx >= s.from && idx < s.to) || { dx: 0, dy: 0 };
  const paths = [...body.matchAll(/<(?:path d="([^"]+)"|circle cx="([-\d.]+)" cy="([-\d.]+)" r="([\d.]+)")([^>]*)\/>/g)];
  paths.forEach((p, i) => {
    const sh = shiftAt(p.index);
    const raw = p[1]
      ? points(p[1])
      : [[+p[2] - +p[4], +p[3]], [+p[2] + +p[4], +p[3]]];   // a circle: its horizontal diameter
    const pts = raw.map(([x, y]) => toView([x + sh.dx, y + sh.dy]));
    const stroked = !/stroke="none"/.test(p[5]);
    const w = (p[5].match(/stroke-width="([\d.]+)"/) || [])[1];
    const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
    const a = pts[0], b = pts[pts.length - 1];
    const n = pts.length;
    const thirds = n >= 4
      ? [ang(pts[0], pts[Math.floor(n / 3)]), ang(pts[Math.floor(n / 3)], pts[Math.floor(2 * n / 3)]), ang(pts[Math.floor(2 * n / 3)], pts[n - 1])]
      : [ang(a, b)];
    MARKS.push({
      group, i, stroked, w: w ? +w : null,
      deg: ang(a, b), thirds,
      len: +Math.hypot(b[0] - a[0], b[1] - a[1]).toFixed(2),
      mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2],
      bbox: [+Math.min(...xs).toFixed(2), +Math.min(...ys).toFixed(2), +Math.max(...xs).toFixed(2), +Math.max(...ys).toFixed(2)],
      d: p[1] || p[0],
    });
  });
}

if (process.argv[1] && process.argv[1].endsWith('_qo4marks.mjs')) {
  console.log(`head group: translate(${TX} ${TY}) scale(${SX} ${SY})   [viewBox units]`);
  console.log(`${MARKS.length} marks emitted inside the head group\n`);
  console.log('group              #  strokeW   chord deg   per-third deg        chord len   bbox (viewBox)');
  for (const m of MARKS) {
    console.log(`${m.group.padEnd(18)}${String(m.i).padStart(2)}  ${String(m.w ?? 'region').padStart(6)}   ${String(m.deg).padStart(7)}   ${m.thirds.map((t) => String(t).padStart(6)).join(' ')}   ${String(m.len).padStart(7)}   ${m.bbox.join(' ')}`);
  }
  // the wig marks only — the ones the direction-field claim is about
  const wig = MARKS.filter((m) => (m.group.startsWith('grooves') || m.group.startsWith('lit')) && m.stroked && m.len > 4);
  const degs = wig.map((m) => m.deg).sort((a, b) => a - b);
  console.log(`\nWIG marks (grooves + lit ridges, chord longer than 4 viewBox units): n=${wig.length}`);
  console.log(`  chord angles: ${degs.join(', ')}`);
  console.log(`  range ${degs[0]} .. ${degs[degs.length - 1]} deg  (spread ${(degs[degs.length - 1] - degs[0]).toFixed(1)} deg)`);
  const all = wig.flatMap((m) => m.thirds).sort((a, b) => a - b);
  console.log(`  per-third angles over every wig mark: ${all[0]} .. ${all[all.length - 1]} deg (spread ${(all[all.length - 1] - all[0]).toFixed(1)})`);
}
