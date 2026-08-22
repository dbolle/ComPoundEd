// ROUND (cent obverse, mid-jaw) — the CANDIDATE SWEEP.
//
// Substitutes a candidate `BEARD` top-edge run into a copy of the working tree
// and prices each candidate against the budget in `_jy9budget.md`: D13 obverse
// at 26/44/84 px, the ink fraction, the resulting top edge in local units, the
// new `jawMid` patch, D3 at the frozen 11-patch locus, and every `BEARD` knot
// turn (so a lift that buys shape by introducing a kink is visible).
//
// EQUIVALENCE (PY6). The D13 arithmetic is `_jp13d2d13.mjs`'s obverse half
// reproduced constant for constant — RAD 40, INK 0.85, flatten to white,
// greyscale, no upsampling, the reference cropped to its frozen disc through a
// 300 px pad. The BASELINE row must reproduce that instrument's own output on
// the untouched tree to 4 dp; the check is printed on every run and the tool is
// UNTRUSTED if it fails.
//
// The candidate list is data, at the bottom of this file, so the whole sweep is
// reproducible from the committed source.
//
// Run: node coloringbook/judge/_jy8sweep.mjs
import sharp from 'sharp';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { flattenPath } from './_jqgeom.mjs';
import { grey, DISC, DISCS, REF, ourRaster, ratioVector, loadJSON } from '../_pylib.mjs';

const RAD = 40, INK = 0.85;
const D1 = loadJSON(new URL('./_jp1discs.json', import.meta.url).pathname);
const FROZEN = loadJSON(new URL('../_tonepatches-penny.json', import.meta.url).pathname).patches;
const EXTRA = loadJSON(new URL('./_jy0tonepatch-midjaw.json', import.meta.url).pathname).patches;
const ALL = [...FROZEN, ...EXTRA];
const SRC = 'src/art/coins.js';
const BASE = readFileSync(SRC, 'utf8');

async function gridOf(buf, W) {
  const { data, info } = await sharp(buf).flatten({ background: '#ffffff' }).resize(W, W, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  if (info.channels !== 1) throw new Error('channels != 1 — UNTRUSTED');
  return data;
}
function stats(d, W) {
  const inside = [];
  for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
    const X = 100 * (i + 0.5) / W, Y = 100 * (j + 0.5) / W;
    if ((X - 50) ** 2 + (Y - 50) ** 2 > RAD * RAD) continue;
    inside.push(d[j * W + i]);
  }
  const s = [...inside].sort((a, b) => a - b);
  const f = s[(s.length * 0.9) | 0];
  return { field: f, mean: inside.reduce((a, c) => a + c, 0) / inside.length / f,
    ink: inside.filter((v) => v < INK * f).length / inside.length };
}
const PAD = 300;
const refBuf = async () => {
  const d = D1['penny-obv-3.jpg'];
  const padded = await sharp('coloringbook/ref/penny-obv-3.jpg').flatten({ background: '#ffffff' })
    .extend({ top: PAD, bottom: PAD, left: PAD, right: PAD, background: '#ffffff' }).png().toBuffer();
  return sharp(padded).extract({ left: Math.round(d.cx - d.R) + PAD, top: Math.round(d.cy - d.R) + PAD, width: Math.round(2 * d.R), height: Math.round(2 * d.R) }).png().toBuffer();
};

const RB = await refBuf();
const R = {};
const XS = [-10, -8, -6, -4, -2, 0, 2, 4, 6, 8];
const photo = await grey(REF);
const g1909 = await grey('coloringbook/ref/penny-obv.jpg');
const REFV = ratioVector(photo, DISC, ALL);
const R1909 = ratioVector(g1909, DISCS['penny-obv.jpg'], ALL);

// D7's TANGENT measure, re-implemented from `_jd7fitted.mjs` so the sweep can
// price a candidate's curve quality without editing that hashed instrument.
// PY6's equivalence rule applies: the BASELINE row must reproduce
// `_jd7fitted.mjs`'s own "knot 7: tangent 85.0" exactly, and the run says so.
const sub2 = (a, b) => [a[0] - b[0], a[1] - b[1]];
const ang2 = (a, b) => {
  const na = Math.hypot(...a), nb = Math.hypot(...b);
  if (na < 1e-9 || nb < 1e-9) return null;
  return (Math.acos(Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1]) / (na * nb)))) * 180) / Math.PI;
};
function segsOf(d) {
  const t = d.match(/[MmLlHhVvCcQqAaSsTtZz]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) || [];
  let i = 0, cur = [0, 0], start = [0, 0], cmd = '';
  const segs = []; const num = () => parseFloat(t[i++]);
  while (i < t.length) {
    if (/[A-Za-z]/.test(t[i])) cmd = t[i++];
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase(), off = rel ? cur : [0, 0];
    if (C === 'M') { const p = [num() + off[0], num() + off[1]]; cur = p; start = p; cmd = rel ? 'l' : 'L'; }
    else if (C === 'L') { const p = [num() + off[0], num() + off[1]]; segs.push({ k: 'L', p0: cur, p1: p }); cur = p; }
    else if (C === 'C') { const c1 = [num() + off[0], num() + off[1]], c2 = [num() + off[0], num() + off[1]], p = [num() + off[0], num() + off[1]]; segs.push({ k: 'C', p0: cur, c1, c2, p1: p }); cur = p; }
    else if (C === 'Z') { if (Math.hypot(cur[0] - start[0], cur[1] - start[1]) > 1e-9) segs.push({ k: 'L', p0: cur, p1: start }); cur = start; }
    else i++;
  }
  return { segs, closed: /[Zz]\s*$/.test(d.trim()) };
}
const tOut = (s) => (s.k === 'C' ? sub2(s.c1, s.p0) : sub2(s.p1, s.p0));
const tIn = (s) => (s.k === 'C' ? sub2(s.p1, s.c2) : sub2(s.p1, s.p0));
function tangentTurns(d) {
  const { segs, closed } = segsOf(d);
  const joins = [];
  for (let i = 1; i < segs.length; i++) joins.push([segs[i - 1], segs[i], i]);
  if (closed && segs.length > 1) joins.push([segs[segs.length - 1], segs[0], 0]);
  const res = [];
  for (const [a, b, idx] of joins) {
    const tt = ang2(tIn(a), tOut(b));
    if (tt !== null) res.push({ idx, deg: +tt.toFixed(1) });
  }
  res.sort((p, q) => p.idx - q.idx);
  return res;
}

const insidePoly = (poly, x, y) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
};

export async function measure(name, beardBody) {
  let out = BASE;
  if (beardBody !== null) {
    const re = /const BEARD = \[\n[\s\S]*?\n\]\.join\(' '\);/;
    if (!re.test(BASE)) throw new Error('BEARD literal not found — the signature is stale');
    out = BASE.replace(re, `const BEARD = [\n${beardBody}\n].join(' ');`);
    if (out === BASE) throw new Error('rewrite did not change the source');
  }
  const tmp = 'src/art/_jy8tmp.js';
  writeFileSync(tmp, out);
  let mod; try { mod = await import(`${process.cwd()}/${tmp}?t=${Date.now()}${Math.random()}`); } finally { rmSync(tmp); }

  const row = { name, d13: {}, ink: {} };
  for (const size of [26, 44, 84]) {
    const svg = mod.coinSVG('penny', size, { side: 'obverse' });
    const W = Math.round(Number(svg.match(/width="([\d.]+)"/)[1]));
    const o = stats(await gridOf(await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' }).png().toBuffer(), W), W);
    if (!R[size]) R[size] = stats(await gridOf(RB, W), W);
    row.d13[size] = { ours: o.mean, ref: R[size].mean, d: o.mean - R[size].mean };
    row.ink[size] = { ours: o.ink, ref: R[size].ink };
  }
  // geometry
  const svg380 = mod.coinSVG('penny', 380, { side: 'obverse' });
  const ds = [...svg380.matchAll(/<path\b[^>]*?\sd="([^"]*)"/g)].map((m) => m[1]);
  const bd = ds.find((d) => d.startsWith('M 15.15 12.77'));
  if (!bd) throw new Error('BEARD not found in the render');
  row.pts = flattenPath(bd).pts;
  row.top = {};
  for (const x of XS) {
    let t = null;
    for (let y = -14; y <= 30; y += 0.05) if (insidePoly(row.pts, x, y)) { t = +y.toFixed(2); break; }
    row.top[x] = t;
  }
  row.turns = tangentTurns(bd);
  // tone
  const our = await ourRaster(mod.coinSVG, DISC, photo.w, photo.h);
  const ov = ratioVector(our, DISC, ALL);
  let s = 0, n = 0;
  for (const p of ALL) { if (p.name === 'cheek' || p.name === 'jawMid') continue; s += Math.abs(ov.rat[p.name] - REFV.rat[p.name]); n++; }
  row.d3 = s / n;
  row.jawMid = ov.rat.jawMid;
  row.jawMidD = Math.abs(ov.rat.jawMid - REFV.rat.jawMid);
  return row;
}

function report(rows) {
  console.log('\ncandidate            | D13 44px  ours    D      | D13 84px  ours    D      | ink44  | D3(11) | jawMid ours   |D|  | max knot turn');
  for (const r of rows) {
    console.log(`${r.name.padEnd(20)} |  ${r.d13[44].ours.toFixed(4)} ${(r.d13[44].d >= 0 ? '+' : '') + r.d13[44].d.toFixed(4)} ${Math.abs(r.d13[44].d) <= 0.05 ? 'PASS' : 'FAIL'} |  ${r.d13[84].ours.toFixed(4)} ${(r.d13[84].d >= 0 ? '+' : '') + r.d13[84].d.toFixed(4)} ${Math.abs(r.d13[84].d) <= 0.05 ? 'PASS' : 'FAIL'} | ${r.ink[44].ours.toFixed(3)}  | ${r.d3.toFixed(4)} | ${r.jawMid.toFixed(4)} ${r.jawMidD.toFixed(4)} | ${Math.max(...r.turns.map((t) => t.deg)).toFixed(1)}`);
  }
  console.log('\nBEARD top edge, local y by local x');
  console.log('name                ' + XS.map((x) => String(x).padStart(7)).join(''));
  for (const r of rows) console.log(r.name.padEnd(20) + XS.map((x) => (r.top[x] === null ? 'none' : r.top[x].toFixed(2)).padStart(7)).join(''));
  console.log('\nBEARD knot turns (degrees), knot 0 first');
  for (const r of rows) console.log(r.name.padEnd(20) + r.turns.map((t) => `${t.idx}:${t.deg.toFixed(1)}`.padStart(9)).join(''));
}

// ── the candidates. Each is the whole `BEARD` array body.
const CANDS = [];
const OUTER = `  'M 15.15 12.77 C 15.64 13.62 13.67 16.33 12.3 17.51',
  'C 10.84 18.76 8.36 18.92 6.51 19.89 C 4.62 20.89 3.04 22.71 1.07 23.44',
  'C -0.86 24.16 -3.1 24.78 -5.16 24.28',
  'C -7.57 23.7 -10.53 21.19 -12.31 19.33',
  'C -13.79 17.79 -14.7 16.08 -15.53 14.3',
  'C -16.35 12.52 -17.84 7.14 -18.85 4 C -18.02 3.65 -17.2 2.95 -16.6 3.05',
  'C -15 3.05 -13 3.3 -11.2 3.6',`;
const cand = (n, top) => CANDS.push([n, `${OUTER}\n${top}`]);

// V1 — flat under the ear to x -5.2, then the same descent to an unchanged chin
cand('V1 flat', `  'C -9.2 3.6 -7.2 3.6 -5.2 3.65 C -3.2 3.9 -1.1 6.6 0.9 8.2',
  'C 2.95 9.6 5 11.6 7.06 12.94 C 9.55 12.84 14.56 11.75 15.15 12.77 Z',`);
// V2 — a shallow rise in front of the ear, peak near x -8
cand('V2 peak -1', `  'C -10.2 1.6 -9.4 -0.8 -7.6 -1.0 C -6.2 -1.1 -5.9 1.4 -5.2 2.6',
  'C -3.9 4.9 -1.6 6.6 0.9 8.0 C 2.95 9.5 5 11.5 7.06 12.94',
  'C 9.55 12.84 14.56 11.75 15.15 12.77 Z',`);
// V3 — the same shape, taken up to meet HAIR's lower edge in front of the ear
cand('V3 peak -5', `  'C -10.4 -0.6 -9.6 -4.8 -7.6 -5.0 C -6.1 -5.1 -5.8 0.6 -5.2 2.2',
  'C -4.0 5.3 -1.6 6.7 0.9 8.0 C 2.95 9.5 5 11.5 7.06 12.94',
  'C 9.55 12.84 14.56 11.75 15.15 12.77 Z',`);
// V4 — V2's rear, and the front lifted too (the closure the tone evidence refuses)
cand('V4 front too', `  'C -10.2 1.6 -9.4 -0.8 -7.6 -1.0 C -6.2 -1.1 -5.9 0.4 -5.2 1.2',
  'C -3.9 2.7 -1.6 3.6 0.9 4.4 C 3.2 5.2 5.2 6.6 7.06 8.6',
  'C 9.55 9.6 14.56 10.9 15.15 12.77 Z',`);

// V5 — V2's rear peak with a GENTLER tangent at knot 9 (V2 put that knot at
// 72.9 deg, 2.1 deg off the 75 gate; a near-miss bought for shape is not a
// bargain)
cand('V5 soft entry', `  'C -10.0 3.0 -9.0 -0.7 -7.6 -1.0 C -6.2 -1.3 -5.9 1.4 -5.2 2.6',
  'C -3.9 4.9 -1.6 6.6 0.9 8.0 C 2.95 9.5 5.0 12.0 7.06 12.94',
  'C 9.55 12.84 14.56 11.75 15.15 12.77 Z',`);
// V6 — no peak at all: one smooth monotone run, 13 knots as now
cand('V6 monotone', `  'C -9.2 3.5 -7.2 3.0 -5.2 2.9 C -3.2 3.2 -1.1 5.8 0.9 7.6',
  'C 2.95 9.2 5.0 11.8 7.06 12.94 C 9.55 12.84 14.56 11.75 15.15 12.77 Z',`);
// V7 — V5's rear, front lifted as far as `jawMid`'s own edge allows
cand('V7 to jawMid edge', `  'C -10.0 3.0 -9.0 -0.7 -7.6 -1.0 C -6.2 -1.3 -5.9 0.9 -5.2 1.9',
  'C -3.9 3.8 -1.6 5.2 0.9 6.4 C 3.2 7.5 5.2 10.4 7.06 12.2',
  'C 9.55 12.5 14.56 11.75 15.15 12.77 Z',`);

// V8 — V5's rear peak ONLY. `_jyBcover.mjs` showed V5's front lift puts 28.46%
// of the new `jawMid` patch inside BEARD and moves that patch's MEAN ratio from
// 0.9765 to 0.8761, away from the reference of record's 1.0820, while its
// MEDIAN (the frozen metric) does not move at all. The rear lift is supported
// by both struck references; the front lift is contradicted by one of them and
// buys almost no shape. So the front returns to the shipped curve, byte for
// byte, and the round keeps only the half the evidence agrees on.
cand('V8 rear only', `  'C -10.0 3.0 -9.0 -0.7 -7.6 -1.0 C -6.2 -1.3 -5.9 1.4 -5.2 2.6',
  'C -3.6 5.3 -1.1 9.0 0.9 10.2 C 2.95 11.2 5 12.3 7.06 12.94',
  'C 9.55 12.84 14.56 11.75 15.15 12.77 Z',`);

const rows = [await measure('BASELINE', null)];
console.log('EQUIVALENCE (PY6) — the BASELINE row against _jp13d2d13.mjs on the untouched tree:');
console.log(`  26px ours ${rows[0].d13[26].ours.toFixed(4)} ref ${rows[0].d13[26].ref.toFixed(4)}   (published 0.6278 / 0.8815)`);
console.log(`  44px ours ${rows[0].d13[44].ours.toFixed(4)} ref ${rows[0].d13[44].ref.toFixed(4)}   (published 0.7894 / 0.8358)`);
console.log(`  84px ours ${rows[0].d13[84].ours.toFixed(4)} ref ${rows[0].d13[84].ref.toFixed(4)}   (published 0.8109 / 0.8093)`);
console.log(`  D3 (11 frozen patches) ${rows[0].d3.toFixed(4)}   (published 0.1596)`);
for (const [n, body] of CANDS) rows.push(await measure(n, body));
console.log('\nD13 at 26 px, every row — BEARD is gated on !icon so these must be identical BY CONSTRUCTION:');
for (const r of rows) console.log(`  ${r.name.padEnd(20)} ${r.d13[26].ours.toFixed(6)}  ink ${r.ink[26].ours.toFixed(6)}`);
report(rows);
