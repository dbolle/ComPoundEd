// _dr25stalk.mjs — THE TWO ACORN STALKS, AND THE ESTIMATOR THAT SEPARATES A
// STALK FROM THE MARK IT TOUCHES.
//
// Reports only (WRITERS.md). Writes nothing. Never opens `dime-rev-2.jpg`.
//
// ── WHY THIS EXISTS ────────────────────────────────────────────────────────
// Round 42 measured the outboard prong's half-max width and wrote down, as an
// aside, that "rows y 48.5..49.5 are the two marks fusing and are NOT used".
// That sentence is a claim that there are TWO marks in the prong's column and
// only one of them was drawn. Three rounds then refused to draw the second one
// — acorn 2's stalk — on the grounds that the rows where it lives cannot be
// read. They cannot be read AT A 0.5-UNIT y STEP. This is `_dr20prongwidth.mjs
// hm`'s own estimator (the same per-file adaptive cut, the same half-max edge
// refinement, so its numbers and round 42's are directly comparable) run at
// 0.2, and at 0.2 BOTH FILES resolve the second mark with field between it and
// the prong — proofbright at y 47.8..48.0, unc2005 at y 48.0..48.4.
//
// `cols` is the same estimator turned ninety degrees, for acorn 1's stalk,
// which is near horizontal and which a row cut measures the length of rather
// than the width of.
//
// ── WHAT IT DOES NOT DO ────────────────────────────────────────────────────
// It does not decide that either mark IS a stalk. It reports two walls, their
// widths and their slopes; the argument that a wall which does not move while
// every prong edge moves 0.46 per unit y belongs to a different element is in
// `torch()`'s round-45 ledger, not here.
//
// ⚠️ `cols --dy` APPLIES `_dr24acorn2.mjs`'s DYU TO unc2005 AND THAT IS A LIVE
// QUESTION (ledger D40). The published registration is x-only. Acorn 1's stalk
// is one of the places where the two files' y disagreement is larger than the
// mark: raw, unc2005 puts that stalk 0.61 units lower than proofbright does,
// and the agreement quoted in the ledger exists only after the correction. Run
// it BOTH ways and quote both, which is what the round did.
//
// usage:
//   node _dr25stalk.mjs rows <y0> <y1> <dy> <o0> <o1> [minRun]
//   node _dr25stalk.mjs cols <x0> <x1> <dx> <y0> <y1> [minRun] [--dy]
//   node _dr25stalk.mjs score                 both stalks: ink, containment,
//                                             overlap with every other node
import sharp from 'sharp';
import { samplerFor } from './_dr2grid.mjs';
import { deviceMask } from './_dr9branch.mjs';
import { nodes, resolve, reopen } from './_dr13elem.mjs';
import { coinSVG } from '../../src/art/coins.js';

const REFS = ['dime-rev-proofbright.png', 'dime-rev-unc2005.png'];
/** a feature we draw at offset o appears on this file at o + REG */
const REG = { 'dime-rev-proofbright.png': 0.35, 'dime-rev-unc2005.png': -0.75 };
const T_OF = { 'dime-rev-proofbright.png': 236, 'dime-rev-unc2005.png': 190 };
/** unc2005's y registration, `_dr24acorn2.mjs`'s fit. NOT settled — see above. */
const DYU = (y) => 0.489 + (y - 50) * 0.0226;
const X0 = 13, Y0 = 17, S = 0.05, A = S * S;
const MW = Math.round((87 - 13) / S), MH = Math.round((85 - 17) / S);
const REACH = 1.0;
const mode = process.argv[2] || 'score';
const nums = process.argv.slice(3).filter((s) => /^-?[\d.]+$/.test(s)).map(Number);
const useDy = process.argv.includes('--dy');

// ── the shipped nodes, by name. Acorn stalks are 2.1.40/2.1.41 because they are
// emitted after the OLIVE so that adding them moved no existing id.
const NAME = {
  '2.1.4': 'stem/prong', '2.1.5': 'B1', '2.1.7': 'B2', '2.1.9': 'B3', '2.1.11': 'C',
  '2.1.13': 'A1', '2.1.15': 'A2', '2.1.17': 'D1', '2.1.19': 'D2',
  '2.1.6': 'petB2', '2.1.8': 'petB3', '2.1.10': 'petC', '2.1.12': 'petA1',
  '2.1.14': 'petA2', '2.1.16': 'petD1', '2.1.18': 'petD2',
  '2.1.20': 'acorn1', '2.1.21': 'acorn2', '2.1.40': 'stalkA1', '2.1.41': 'stalkA2',
};
const STALKS = ['2.1.40', '2.1.41'];

if (mode === 'score') {
  const { head, out } = nodes(coinSVG('dime', 380, { side: 'reverse' }));
  const full = Math.round(100 / S);
  const inkOf = async (id) => {
    const { data, info } = await sharp(Buffer.from(`${head}${resolve(head, out, id)}</svg>`))
      .resize(full, full, { fit: 'fill' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const v = new Uint8Array(MW * MH);
    for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
      const p = (Math.round((Y0 + j * S) / S) * info.width + Math.round((X0 + i * S) / S)) * info.channels;
      if (data[p + info.channels - 1] > 24) v[j * MW + i] = 1;
    }
    return v;
  };
  const ink = {}; for (const id of Object.keys(NAME)) ink[id] = await inkOf(id);
  const masks = {};
  for (const f of REFS) {
    let m = await deviceMask(f, T_OF[f], 0);
    if (f === REFS[0]) m = await reopen(m, f, T_OF[f], 1.0);   // reopen 1.0 is proofbright ONLY
    masks[f] = m;
  }
  console.log('THE TWO ACORN STALKS. OUTSIDE is against the 237-cut flood mask at erode 0');
  console.log('(reopen 1.0 on proofbright only) — the GENEROUS target. A low OUTSIDE is not a');
  console.log('pass on its own, so every overlap is printed beside it (ledger E25).\n');
  for (const t of STALKS) {
    const v = ink[t];
    let n = 0, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, sx = 0, sy = 0;
    for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
      if (!v[j * MW + i]) continue; const x = X0 + i * S, y = Y0 + j * S;
      n++; sx += x; sy += y;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    console.log(`== ${NAME[t]}  node ${t}`);
    console.log(`   ink ${(n * A).toFixed(2)} sq units   bbox x ${x0.toFixed(2)}..${x1.toFixed(2)}`
      + `  y ${y0.toFixed(2)}..${y1.toFixed(2)}   centroid ${(sx / n).toFixed(2)}, ${(sy / n).toFixed(2)}`);
    for (const f of REFS) for (const dy of (f === REFS[1] ? [false, true] : [false])) {
      const m = masks[f], r = REG[f]; let o = 0;
      for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
        if (!v[j * MW + i]) continue;
        const x = X0 + i * S, y = Y0 + j * S;
        const ii = Math.round((x + r - X0) / S);
        const jj = dy ? Math.round((y + DYU(y) - Y0) / S) : j;
        if (ii >= 0 && ii < MW && jj >= 0 && jj < MH && m[jj * MW + ii]) continue;
        o++;
      }
      console.log(`   OUTSIDE ${f.slice(9, -4).padEnd(11)}${dy ? ' +DYU' : '     '} `
        + `${(o * A).toFixed(2).padStart(6)} sq  ${(100 * o / n).toFixed(2).padStart(6)} %`);
    }
    const ov = [];
    for (const id of Object.keys(NAME)) {
      if (id === t) continue; let k = 0;
      for (let i = 0; i < v.length; i++) if (v[i] && ink[id][i]) k++;
      if (k) ov.push(`${NAME[id]} ${(100 * k / n).toFixed(1)}%`);
    }
    console.log(`   OVERLAP (share of this stalk's OWN ink): ${ov.join('   ') || '(none — it touches nothing, which for a stalk is a FAIL)'}\n`);
  }
  process.exit(0);
}

// ── `_dr20prongwidth.mjs hm`'s estimator, verbatim, at whatever step is asked.
const sampleRow = (at, x, y) => (at(x, y - 0.35) + at(x, y - 0.12) + at(x, y)
  + at(x, y + 0.12) + at(x, y + 0.35)) / 5;
const sampleCol = (at, x, y) => (at(x - 0.35, y) + at(x - 0.12, y) + at(x, y)
  + at(x + 0.12, y) + at(x + 0.35, y)) / 5;
function levels(at) {
  const field = [], solid = [];
  for (let a = 0; a < 360; a += 3) { const t = (a * Math.PI) / 180; field.push(at(50 + 43 * Math.cos(t), 50 + 43 * Math.sin(t))); }
  for (let y = 40; y <= 44; y += 0.5) for (let x = 47; x <= 53; x += 0.5) solid.push(at(x, y));
  const med = (a) => a.slice().sort((p, q) => p - q)[a.length >> 1];
  return { field: med(field), solid: med(solid) };
}
const files = {};
for (const f of [...REFS, 'ours']) {
  const s = await samplerFor(f); const L = levels(s.at);
  files[f] = { at: s.at, cut: L.solid + 0.85 * (L.field - L.solid) };
}
/** runs of `g(u) <= cut` at least `min` long, then each end refined to half-max */
function scan(g, u0, u1, min) {
  const raw = []; let s = null;
  for (let u = u0; u <= u1 + 1e-9; u += S) {
    const v = g(+u.toFixed(2)) <= 0;
    if (v && s === null) s = +u.toFixed(2);
    if (!v && s !== null) { if (u - s >= min) raw.push([s, +(u - S).toFixed(2)]); s = null; }
  }
  if (s !== null && u1 - s >= min) raw.push([s, u1]);
  return raw;
}
function refine(g, e, dir) {
  let F = -Infinity, V = Infinity;
  for (let d = 0; d <= REACH + 1e-9; d += S) F = Math.max(F, g(e + dir * d));
  for (let d = 0; d <= REACH + 1e-9; d += S) V = Math.min(V, g(e - dir * d));
  const half = (F + V) / 2; let best = e, bd = Infinity;
  for (let d = -REACH; d <= REACH + 1e-9; d += S) {
    const o = e + dir * d, a = g(o), b = g(o + dir * S);
    if ((a - half) * (b - half) <= 0 && Math.abs(d) < bd) { bd = Math.abs(d); best = o; }
  }
  return +best.toFixed(2);
}

if (mode === 'rows' || mode === 'cols') {
  const [a0, a1, da, b0, b1] = nums;
  const min = nums[5] ?? 0.25;
  console.log(`${mode.toUpperCase()} — half-max edges of every adaptive-cut run, printed in OUR frame.`);
  console.log(`"ours" is our own render through the IDENTICAL code.${mode === 'cols' && useDy ? '  unc2005 y corrected by DYU (D40 — NOT settled).' : ''}\n`);
  for (const f of [...REFS, 'ours']) {
    const reg = f === 'ours' ? 0 : REG[f];
    const dy = useDy && f === REFS[1];
    console.log(`  == ${f === 'ours' ? 'OURS' : f.slice(9, -4)}`);
    for (let a = a0; a <= a1 + 1e-9; a += da) {
      const aa = +a.toFixed(2);
      let g, lo, hi, back;
      if (mode === 'rows') {                       // a is y, the run is in x
        const yy = dy ? aa + DYU(aa) : aa;
        g = (x) => sampleRow(files[f].at, x + reg, yy) - files[f].cut;
        lo = b0; hi = b1; back = (x) => x;
      } else {                                     // a is x, the run is in y
        const xx = aa + reg;
        g = (y) => sampleCol(files[f].at, xx, dy ? y + DYU(y) : y) - files[f].cut;
        lo = b0; hi = b1; back = (y) => y;
      }
      const runs = scan(g, lo, hi, min).map(([p, q]) => {
        const P = refine(g, p, -1), Q = refine(g, q, +1);
        return `${back(P).toFixed(2)}-${back(Q).toFixed(2)}(${(Q - P).toFixed(2)})`;
      });
      console.log(`   ${mode === 'rows' ? 'y' : 'x'}=${aa.toFixed(2)}  ${runs.join('  ') || '(none)'}`);
    }
    console.log('');
  }
  process.exit(0);
}
console.log('usage: node _dr25stalk.mjs [rows|cols|score] ...');
