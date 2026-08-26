// THE SEVEN OAK LEAVES, ONE AT A TIME — and what a perfect one could score.
//
// `_dr13elem.mjs` scores ONE element against ONE mask per process, and it has
// no window narrower than `oak-branch` [55, 85, 25, 78]. Two consequences make
// it the wrong tool for this round and neither is a defect in it:
//
//   · SEVEN LEAVES × TWO REFERENCES × TWO EROSIONS is 28 runs, each of which
//     re-derives the same two masks from a 2400 px photograph. Here the masks
//     are built once and every leaf is scored against them, so the table below
//     is one process and the numbers are guaranteed to come off the SAME mask.
//   · FILL against `oak-branch` gives all seven leaves the SAME denominator —
//     the whole branch — so a leaf that fills its own place perfectly reads
//     ~1/7 and the seven numbers cannot be told apart. Per-leaf windows are
//     declared below, and their derivation is stated so they can be attacked.
//
// ⚠️ THE EROSION WARNING FROM `_dr13elem.mjs` APPLIES HERE AND IS THE REASON
// THIS FILE REPORTS TWO EROSIONS SIDE BY SIDE. `deviceMask()` removes
// `erodeUnits` from EVERY side, calibrated on a 5-10 unit torch shaft; an oak
// leaf's BODY is 7.5 units wide but its LOBES AND SINUSES are ~1 unit features,
// so the default 0.55 / 1.00 shaves the mask's own lobes off before it ever
// looks at ours. The oak-stem round measured that error at 86% of the gap it
// had published as a finding about the art. So OUTSIDE is quoted at BOTH the
// calibrated default and at 0.00, and no conclusion is drawn from the default
// alone. The un-eroded mask includes the struck bevel skirt, which makes it
// too GENEROUS for absolute widths (`_dr8shaft.mjs` rejected it for that) and
// exactly right for containment, which is what OUTSIDE asks.
//
// usage:
//   node _dr15oakleaf.mjs outside              OUTSIDE, 7 x 2 refs x 2 erosions
//   node _dr15oakleaf.mjs fill [--pad U]       FILL exclusive + the CEILING
//   node _dr15oakleaf.mjs probe <idx...>       WHERE a leaf's outside ink lies
//   node _dr15oakleaf.mjs pairs                do the seven stand apart?
//   node _dr15oakleaf.mjs split [minArea]      erosion ladder on the COIN's oak
//   node _dr15oakleaf.mjs blade <ref> <e> <x> <y>   IoU against one coin blade
//   node _dr15oakleaf.mjs swap [rot1] [rot2]   the D11/D12 pair, both halves
//   node _dr15oakleaf.mjs sweep <idx> <key> <a> <b> <step> [k=v ...]
//   node _dr15oakleaf.mjs selftest             seatFrag == branch(), all seven
//   node _dr15oakleaf.mjs look [px/unit]       both refs and ours, same crop
//   node _dr15oakleaf.mjs panels <idx...>      element | target | overlay
//   node _dr15oakleaf.mjs rows [y0 y1]         the coin's device runs beside ours
import sharp from 'sharp';
import { join } from 'node:path';
import { JUDGE } from './_paths.mjs';
import { deviceMask } from './_dr9branch.mjs';
import { nodes, resolve, reopen } from './_dr13elem.mjs';
import { coinSVG } from '../../src/art/coins.js';

const X0 = 13, X1 = 87, Y0 = 17, Y1 = 85, STEP = 0.05;
const MW = Math.round((X1 - X0) / STEP), MH = Math.round((Y1 - Y0) / STEP);
const U = (n) => (n * STEP * STEP).toFixed(2);

const REFS = {
  proofbright: ['dime-rev-proofbright.png', 236, 0.55],
  unc2005: ['dime-rev-unc2005.png', 190, 1.00],
};

// ── THE SEVEN, in `branch()`'s own emission order, with the LADDER row each
// one comes from. `i` is the loop index; `side` is `leafAt`'s `i % 2 === 1`.
const LEAVES = [
  { id: '2.1.6', i: 0, ay: 56.96, rot: 38, side: 'in', name: 'foot-inboard' },
  { id: '2.1.8', i: 1, ay: 51.23, rot: -13, side: 'out', name: 'foot-outboard' },
  { id: '2.1.10', i: 2, ay: 50.38, rot: 33, side: 'in', name: 'low-inboard' },
  // rot 17 -> 35 with v1.101.0's `OAKROT`; `selftest` is the gate that this
  // table still reproduces the art, and `winOf` keeps BOTH directions so the
  // FILL numbers published on either side of that change stay comparable.
  { id: '2.1.12', i: 3, ay: 47.37, rot: 35, side: 'out', name: 'mid-outboard' },
  { id: '2.1.14', i: 4, ay: 45.68, rot: 60, side: 'in', name: 'mid-inboard' },
  { id: '2.1.16', i: 5, ay: 40.51, rot: 72, side: 'out', name: 'crown-outboard' },
  { id: '2.1.17', i: 6, ay: 40.04, rot: 86, side: 'in', name: 'terminal' },
];

// ── PER-LEAF WINDOWS. A window is a DECLARATION — "this leaf belongs in this
// part of the coin" — and it must not be fitted to our own drawing or FILL
// becomes a tautology. These are built from quantities that were read off the
// coin, not off our render:
//
//   centre = the leaf's BASE on the coin's own stem centreline (`LADDER`'s ay,
//            shrunk by leafAt's 0.94, and `stemC(ay)`) plus half the MEASURED
//            reach `13.79 + 0.2181 (ay - 47.39)` along the ladder's angle;
//   radius = half that reach + 5 units of slack, which is over half a blade
//            width either side.
//
// The slack is deliberate and it makes NEIGHBOURING WINDOWS OVERLAP HEAVILY.
// That is correct here and it is what makes the number honest: the EXCLUSIVE
// target subtracts every other element's INK, so what remains inside an
// overlapping window is (this leaf's share of the coin's ink) plus (mask near
// this leaf that NO element on the face covers). FILL exclusive then answers
// "of the coin's ink around this leaf that is mine or nobody's, how much did I
// get?" — which is the question, and it cannot be gamed by shrinking.
//
// ⚠️ THE ANGLE `rot` IS AN INPUT TO THE WINDOW and on node 2.1.8 it is the very
// quantity under dispute (ledger D11: the coin reads +20..+37, the table says
// -13). So 2.1.8's window is drawn round BOTH candidate directions — see
// `winOf` — and it is the only one that is. Stated because a window fitted to
// one side of an open question would decide it silently.
const PAD = process.argv.includes('--pad') ? Number(process.argv[process.argv.indexOf('--pad') + 1]) : 5;
function winOf(L) {
  const reach = 13.79 + 0.2181 * (L.ay - 47.39);
  const ax = STEMC(L.ay);
  const dir = L.side === 'out' ? 1 : -1;
  const pts = [[ax, L.ay]];
  const angles = L.id === '2.1.8' ? [-13, 28] : L.id === '2.1.12' ? [17, 35]
    : L.id === '2.1.14' ? [45, 60] : [L.rot];
  for (const a of angles) {
    const r = (a * Math.PI) / 180;
    pts.push([ax + dir * reach * Math.cos(r), L.ay - reach * Math.sin(r)]);
  }
  const pad = PAD;
  const xs = pts.map((p) => 50 + p[0]), ys = pts.map((p) => p[1]);
  return [
    Math.min(...xs) - pad, Math.max(...xs) + pad,
    Math.min(...ys) - pad, Math.max(...ys) + pad,
  ].map((v) => +v.toFixed(2));
}
// the stem centreline `torch()` fits, copied as a constant rather than imported
// (coins.js does not export it); `_dr14oakstem.mjs` carries the same numbers.
const SC = { a: 15.96, b: -0.0294, at: 62.5, tail: 71 };
const STEMC = (y) => (y <= SC.tail ? SC.a + SC.b * (y - SC.at)
  : 15.71 - 0.0778 * (y - SC.tail) - 0.0586 * (y - SC.tail) ** 2);

// ── raster helpers (the mask's own grid, so coordinates compare directly)
const svg = coinSVG('dime', 380, { side: 'reverse' });
const { head, out } = nodes(svg);
const inkCache = new Map();
async function inkOf(frag, key) {
  if (key && inkCache.has(key)) return inkCache.get(key);
  const full = Math.round(100 / STEP);
  const { data, info } = await sharp(Buffer.from(`${head}${frag}</svg>`))
    .resize(full, full, { fit: 'fill' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const a = new Uint8Array(MW * MH);
  const ch = info.channels;
  for (let j = 0; j < MH; j++) {
    const sy = Math.round((Y0 + j * STEP) / STEP);
    for (let i = 0; i < MW; i++) {
      const sx = Math.round((X0 + i * STEP) / STEP);
      if (data[(sy * info.width + sx) * ch + ch - 1] > 24) a[j * MW + i] = 1;
    }
  }
  if (key) inkCache.set(key, a);
  return a;
}
const inkFor = (id) => inkOf(resolve(head, out, id), id);
const area = (a) => { let n = 0; for (let k = 0; k < a.length; k++) n += a[k]; return n; };
const bboxOf = (a) => {
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) if (a[j * MW + i]) {
    if (i < x0) x0 = i; if (i > x1) x1 = i; if (j < y0) y0 = j; if (j > y1) y1 = j;
  }
  return { x: [+(X0 + x0 * STEP).toFixed(1), +(X0 + x1 * STEP).toFixed(1)],
    y: [+(Y0 + y0 * STEP).toFixed(1), +(Y0 + y1 * STEP).toFixed(1)] };
};

/** everything else on the face that is a DEVICE mark (siblings + top-level text) */
async function othersOf(id) {
  const key = `!others:${id}`;
  if (inkCache.has(key)) return inkCache.get(key);
  const o = new Uint8Array(MW * MH);
  const kidsOf = (path) => {
    let l = out, n = null;
    for (const q of path.split('.').map(Number)) {
      n = l[q];
      if (n && n.startsWith('<g')) l = nodes(`<svg>${n.slice(n.indexOf('>') + 1, n.lastIndexOf('</g>'))}</svg>`).out;
    }
    return l;
  };
  const parent = id.split('.').slice(0, -1).join('.');
  const mine = id.split('.').pop();
  const kids = kidsOf(parent);
  for (let q = 0; q < kids.length; q++) {
    if (String(q) === mine) continue;
    const a = await inkFor(`${parent}.${q}`);
    for (let k = 0; k < MW * MH; k++) if (a[k]) o[k] = 1;
  }
  for (let q = 0; q < out.length; q++) if (out[q].includes('<text')) {
    const a = await inkOf(out[q], `!text${q}`);
    for (let k = 0; k < MW * MH; k++) if (a[k]) o[k] = 1;
  }
  inkCache.set(key, o);
  return o;
}

// ⚠️ AND THE MASK WAS FILLING THE OAK'S OWN FORK (owner, 2026-08-26).
//
// `deviceMask()` calls anything its inward flood cannot reach DEVICE, which
// correctly closes the specular speckle inside a frosted leaf and INCORRECTLY
// closes any field pocket fully enclosed by device. On the oak that pocket is
// the gap inside the fork — 8.3 sq units at x 65.5..67.8, y 47.4..54.4 — and 13
// components of >= 1.0 sq unit come to 31.1 sq units of real negative space.
// Charging a forked branch for failing to fill its own fork makes it an
// impossible target. `reopen()` (exported from `_dr13elem.mjs`, one
// implementation) restores those components.
//
// `--reopen <minArea>` here, and this file quotes BOTH: everything published
// before 2026-08-26 was measured without it, so the default has to stay
// available for the record to remain comparable. REASON FROM THE REOPENED ONE.
const REOPEN = process.argv.includes('--reopen')
  ? Number(process.argv[process.argv.indexOf('--reopen') + 1]) : 0;

// ⚠️ AND THE 1.0 SQ UNIT THRESHOLD IS A PROPERTY OF `dime-rev-proofbright.png`,
// NOT OF THE METHOD. Run `holes` on both files and the two look nothing alike:
//
//     proofbright  5985 components, 112.8 sq units;  18 at >= 1.0 = 44.2
//                  largest 8.29 (the fork), then 4.87, 4.48, 3.46, 2.95 ...
//     unc2005       114 components, 466.0 sq units;  27 at >= 1.0 = 456.8
//                  largest 101.13 at x 45.8..57.1 y 17.3..33.8 — THE TORCH
//                  FLAME'S INTERIOR — then 49.51, 36.90, 34.44, 30.05, all of
//                  them LEAF BELLIES
//
// unc2005 is a dark-outline photograph with BRIGHT device interiors, which is
// precisely the case `_dr9branch.mjs`'s header says the inward flood exists to
// close ("interior hollows (line art's white leaf bellies)"). Reopening at 1.0
// there does not restore negative space, it deletes the device: every leaf's
// OUTSIDE jumps to 68-81 %. There is no clean threshold on that file — its real
// gaps and its device interiors are BOTH large, with nothing between them.
//
// So the fork correction is applied to proofbright and NOT to unc2005, per file
// and on the measurement above rather than as a default. `--reopen <n>` forces
// a value onto both, which is how the table above was produced.
const REOPEN_FOR = { proofbright: 1.0, unc2005: 0 };
const scoreReopen = (refKey) => (REOPEN > 0 ? REOPEN : REOPEN_FOR[refKey] ?? 0);
const maskCache = new Map();
async function maskFor(refKey, erode, reopenMin = REOPEN) {
  const k = `${refKey}:${erode}:${reopenMin}`;
  if (!maskCache.has(k)) {
    const [f, T] = REFS[refKey];
    let m = await deviceMask(f, T, erode);
    if (reopenMin > 0) m = await reopen(m, f, T, reopenMin);
    maskCache.set(k, m);
  }
  return maskCache.get(k);
}

const png = (layers) => {
  const b = Buffer.alloc(MW * MH * 3, 255);
  for (const [arr, rgb] of layers) {
    for (let k = 0; k < MW * MH; k++) if (arr[k]) { b[k * 3] = rgb[0]; b[k * 3 + 1] = rgb[1]; b[k * 3 + 2] = rgb[2]; }
  }
  return sharp(b, { raw: { width: MW, height: MH, channels: 3 } });
};

// ── WHOSE MASK IS IT? OUTSIDE is scored against the WHOLE device mask, by
// design — "ink that lands on a neighbouring feature is still ink the coin does
// not have HERE" is a statement about bare field, and it does not catch a leaf
// that scores 0% by lying across E PLURIBUS UNUM. On the dime reverse the
// legend runs straight through the inboard half of the oak's window, so an
// inboard leaf can be driven to OUTSIDE 0.00 % by pointing it at the lettering.
// Every number this file prints for an INBOARD seat is therefore printed with
// the fraction of that leaf's ink sitting on ANOTHER ELEMENT's ink beside it,
// and a low OUTSIDE with a high overlap is not a pass.
const GROUPS = {
  legend: null, torch: ['2.1.0', '2.1.1', '2.1.2', '2.1.3'],
  oakleaf: LEAVES.map((l) => l.id),
  oakrest: ['2.1.4', '2.1.5', '2.1.7', '2.1.9', '2.1.11', '2.1.13', '2.1.15', '2.1.18'],
};
// ⚠️ AND `_dr13elem.mjs` CANNOT SEE TWO OF THE THREE LEGENDS. Its `others` set
// is "this node's siblings plus any top-level <text>", and on this face only
// E PLURIBUS UNUM is a bare top-level <text> (node 6). UNITED STATES OF AMERICA
// and ONE DIME are `<text>` wrapped in a `<g>` that carries the font (nodes 4
// and 5), so `startsWith('<text')` misses them — and node 4 runs down to y 58.7
// at x 13..87, straight through the outboard half of every oak window. FILL
// exclusive on the branches has therefore been charging each element for mask
// that belongs to the lettering. `legendInk()` below takes any top-level node
// that CONTAINS a <text>, which catches all three.
async function groupInk(name, exclude) {
  const a = new Uint8Array(MW * MH);
  if (name === 'legend') {
    for (let q = 0; q < out.length; q++) if (out[q].includes('<text')) {
      const t = await inkOf(out[q], `!text${q}`);
      for (let k = 0; k < MW * MH; k++) if (t[k]) a[k] = 1;
    }
    return a;
  }
  for (const id of GROUPS[name]) {
    if (id === exclude) continue;
    const t = await inkFor(id);
    for (let k = 0; k < MW * MH; k++) if (t[k]) a[k] = 1;
  }
  return a;
}
async function overlapsOf(ink, selfId) {
  const r = {};
  let n = 0;
  for (let k = 0; k < MW * MH; k++) if (ink[k]) n++;
  for (const g of ['legend', 'torch', 'oakleaf', 'oakrest']) {
    const a = await groupInk(g, selfId);
    let c = 0;
    for (let k = 0; k < MW * MH; k++) if (ink[k] && a[k]) c++;
    r[g] = n ? 100 * c / n : NaN;
  }
  return r;
}

const mode = process.argv[2] || 'outside';

// ── THE PETIOLES, WHICH ARE PART OF THE SAME QUANTITY AS THE ANGLE.
//
// `branch()` emits each lateral as a `stalk()` then its blade, so the six
// petioles are the ODD nodes between the leaves (the terminal is sessile —
// `ped` is 0 and no stalk is drawn for it). `stalkEnd`/`seatOn` both take
// `L.rot`, so a leaf's petiole swings with its blade: any round that changes an
// angle and quotes only the blade has measured half of what it moved. This runs
// the identical OUTSIDE computation over the petiole nodes so the other half is
// on the record.
const STALKS = [
  { id: '2.1.5', of: '2.1.6', name: 'foot-inboard' },
  { id: '2.1.7', of: '2.1.8', name: 'foot-outboard' },
  { id: '2.1.9', of: '2.1.10', name: 'low-inboard' },
  { id: '2.1.11', of: '2.1.12', name: 'mid-outboard' },
  { id: '2.1.13', of: '2.1.14', name: 'mid-inboard' },
  { id: '2.1.15', of: '2.1.16', name: 'crown-outboard' },
];
if (mode === 'stalks') {
  console.log('OUTSIDE, THE SIX PETIOLES. Same masks, same columns as `outside`.\n');
  console.log('                             |------- proofbright -------|-------- unc2005 --------|');
  console.log('           node        ink   | e0.55   e0.00  e0.00+fork | e1.00   e0.00  e0.00+fork'
    + ' | on legend  on torch  on leaf');
  console.log('  ' + '-'.repeat(122));
  for (const S of STALKS) {
    const ink = await inkFor(S.id);
    const n = area(ink);
    const cell = [];
    for (const [ref, cases] of [['proofbright', [[0.55, 0], [0, 0], [0, 1.0]]],
      ['unc2005', [[1.00, 0], [0, 0], [0, 1.0]]]]) {
      for (const [e, rp] of cases) {
        const m = await maskFor(ref, e, rp);
        let o = 0;
        for (let k = 0; k < MW * MH; k++) if (ink[k] && !m[k]) o++;
        cell.push(100 * o / n);
      }
    }
    const ov = await overlapsOf(ink, S.id);
    console.log(`  ${S.id.padStart(7)} ${S.name.padEnd(15)} ${U(n).padStart(6)} |`
      + cell.map((c, q) => `${c.toFixed(2).padStart(6)}%${q === 2 ? ' |' : ''}`).join('')
      + ` |${ov.legend.toFixed(1).padStart(8)}%${ov.torch.toFixed(1).padStart(9)}%${ov.oakleaf.toFixed(1).padStart(8)}%`);
  }
  console.log('\n  A petiole is ~2 sq units against a ~53 sq unit blade, so these move the');
  console.log('  branch total little; they are quoted because a rotation moves them and a');
  console.log('  petiole standing in bare field beside its own stem is visible at 40x.');
  process.exit(0);
}

// ── EVERY PAIR'S SHARED INK, on the CURRENT art. `pairs` below answers the
// same question for the shipped seven; this exists so a round that moves two
// leaves can check whether it has merged them, which the per-leaf OUTSIDE
// cannot see and which is the one way to "fix" a leaf by hiding it.
if (mode === 'merge') {
  const inks = [];
  for (const L of LEAVES) inks.push([L, await inkFor(L.id)]);
  console.log('SHARED INK, every pair, as a % of the SMALLER leaf.\n');
  for (let a = 0; a < inks.length; a++) for (let b = a + 1; b < inks.length; b++) {
    let sh = 0;
    const [La, ia] = inks[a], [Lb, ib] = inks[b];
    for (let k = 0; k < MW * MH; k++) if (ia[k] && ib[k]) sh++;
    const sm = Math.min(area(ia), area(ib));
    if (sh) console.log(`  ${La.id.padStart(7)} ${La.name.padEnd(15)} x ${Lb.id.padStart(7)} `
      + `${Lb.name.padEnd(15)} ${(100 * sh / sm).toFixed(1).padStart(5)}%  ${U(sh)} sq units`);
  }
  process.exit(0);
}

// ── OUTSIDE: of this leaf's own ink, how much lands where the coin has nothing?
if (mode === 'outside') {
  console.log('OUTSIDE the device mask — of each leaf\'s OWN ink, the fraction in bare field.\n');
  // Both erosions AND both fork treatments, in one process off one pair of
  // masks, because the whole point of quoting four numbers is that they are
  // comparable and a second process is a second chance to differ.
  console.log('                             |------- proofbright -------|-------- unc2005 --------|');
  console.log('           node        ink   | e0.55   e0.00  e0.00+fork | e1.00   e0.00  e0.00+fork'
    + ' | on legend  on torch  on leaf');
  console.log('  ' + '-'.repeat(122));
  const rows = [];
  for (const L of LEAVES) {
    const ink = await inkFor(L.id);
    const n = area(ink);
    const cell = [];
    for (const [ref, cases] of [['proofbright', [[0.55, 0], [0, 0], [0, 1.0]]],
      ['unc2005', [[1.00, 0], [0, 0], [0, 1.0]]]]) {
      for (const [e, rp] of cases) {
        const m = await maskFor(ref, e, rp);
        let o = 0;
        for (let k = 0; k < MW * MH; k++) if (ink[k] && !m[k]) o++;
        cell.push([100 * o / n, o]);
      }
    }
    rows.push({ L, n, cell });
    const ov = await overlapsOf(ink, L.id);
    console.log(`  ${L.id.padStart(7)} ${L.name.padEnd(15)} ${U(n).padStart(6)} |`
      + cell.map((c, q) => `${c[0].toFixed(2).padStart(6)}%${q === 2 ? ' |' : ''}`).join('')
      + ` |${ov.legend.toFixed(1).padStart(8)}%${ov.torch.toFixed(1).padStart(9)}%${ov.oakleaf.toFixed(1).padStart(8)}%`);
  }
  console.log('\n  e0.00+fork is the column to reason from. e0.55/e1.00 are the shaft\'s erosion,');
  console.log('  which eats a leaf\'s own lobes; the closed-fork columns charge a forked branch');
  console.log('  for the field inside its own fork. Both are kept so earlier numbers compare.');
  const d = rows.map((r) => r.cell[0][0] - r.cell[1][0]);
  const g = rows.map((r) => r.cell[2][0] - r.cell[1][0]);
  console.log(`\n  erosion's share, pb (e0.55 - e0.00):  `
    + d.map((v) => v.toFixed(1).padStart(5)).join(' ') + '  points');
  console.log(`  the fork's share, pb (+fork - e0.00): `
    + g.map((v) => v.toFixed(1).padStart(5)).join(' ') + '  points');
  process.exit(0);
}

// ── FILL + CEILING
if (mode === 'fill') {
  console.log('FILL and its CEILING, per leaf. A window is a declaration; see the header.\n');
  for (const refKey of ['proofbright', 'unc2005']) {
    const m = await maskFor(refKey, REFS[refKey][2], scoreReopen(refKey));
    const m0 = await maskFor(refKey, 0, scoreReopen(refKey));
    console.log(`── ${refKey}`);
    console.log('           node          window            excl.tgt  AREACAP   FILL   CEIL   FILL/CEIL');
    for (const L of LEAVES) {
      const w = winOf(L);
      const ink = await inkFor(L.id);
      const others = await othersOf(L.id);
      const ex = new Uint8Array(MW * MH);
      let exN = 0, hit = 0;
      for (let j = 0; j < MH; j++) {
        const y = Y0 + j * STEP; if (y < w[2] || y > w[3]) continue;
        for (let i = 0; i < MW; i++) {
          const x = X0 + i * STEP; if (x < w[0] || x > w[1]) continue;
          const k = j * MW + i;
          if (!m[k] || others[k]) continue;
          ex[k] = 1; exN++; if (ink[k]) hit++;
        }
      }
      // CEILING — the best this glyph could do if it were placed anywhere in
      // the window. Translate the leaf's own ink over the window on a 0.25-unit
      // lattice and take the maximum coverage of the exclusive target. It is an
      // upper bound on FILL for a leaf OF THIS SHAPE AND SIZE, so a FILL far
      // below it is a placement fault and a FILL near it is not.
      const ceil = bestShift(ink, ex, exN);
      console.log(`  ${L.id.padStart(7)} ${L.name.padEnd(15)} [${w.join(', ')}]`.padEnd(46)
        + `${U(exN).padStart(7)}  ${(100 * Math.min(area(ink), exN) / exN).toFixed(1).padStart(5)}%`
        + `  ${(100 * hit / exN).toFixed(1).padStart(5)}%`
        + `  ${(100 * ceil.best / exN).toFixed(1).padStart(5)}%`
        + `  ${(100 * hit / ceil.best).toFixed(0).padStart(4)}%`
        + `   best shift (${ceil.dx.toFixed(2)}, ${ceil.dy.toFixed(2)})`);
      void m0;
    }
    console.log('');
  }
  process.exit(0);
}

/** max coverage of `tgt` by `ink` translated on a 0.25-unit lattice, ±6 units */
function bestShift(ink, tgt, tgtN) {
  const S = 5; // 0.25 units
  const R = 24; // ±6 units
  const pts = [];
  for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) if (ink[j * MW + i]) pts.push([i, j]);
  let best = -1, bdx = 0, bdy = 0;
  for (let dj = -R; dj <= R; dj++) for (let di = -R; di <= R; di++) {
    let c = 0;
    const ox = di * S, oy = dj * S;
    for (const [i, j] of pts) {
      const x = i + ox, y = j + oy;
      if (x < 0 || y < 0 || x >= MW || y >= MH) continue;
      if (tgt[y * MW + x]) c++;
    }
    if (c > best) { best = c; bdx = ox * STEP; bdy = oy * STEP; }
  }
  void tgtN;
  return { best, dx: bdx, dy: bdy };
}

// ── COUNTERFACTUAL LEAVES, WITHOUT EDITING THE ART.
//
// `branch()`'s seating arithmetic is reproduced here exactly — verified by
// rebuilding every one of the seven transforms and matching the emitted SVG
// character for character — so a leaf can be re-seated at a different angle,
// length or width and scored WITHOUT a temporary edit to `coins.js`. An
// instrument that has to modify the thing it measures is one interrupted run
// away from shipping its own scratch value.
//
//   oak, f = +1, tilt = 1 (PTILT is the olive's):
//     ax = stemC(ay);  reach = 13.79 + 0.2181 (ay - 47.39)
//     ped = end ? 0 : 2.6 (1 - 0.8 i / 6);  blade = reach - ped;  half = blade/2
//     petiole end  = (ax + dir·ped·cos rot, ay - ped·sin rot)
//     glyph centre = petiole end + (dir·half·cos rot, -half·sin rot)
//     glyph rot    = dir = +1 ? -rot : rot - 180;  scale = (blade/12, wk)
const OAKPATH = (() => {
  const f = resolve(head, out, '2.1.12');
  return f.slice(f.indexOf('d="') + 3, f.indexOf('"/>'));
})();
function seatFrag(L, over = {}) {
  const ay = over.ay ?? L.ay;
  const rot = over.rot ?? L.rot;
  const ax = +STEMC(ay).toFixed(2); // `leafAt` returns n2(stemC(ay)); the
  // rounding is carried into the seat and is worth 0.01 on two of the seven.
  const reach = over.reach ?? (13.79 + 0.2181 * (ay - 47.39));
  const ped = L.i === 6 ? 0 : 2.6 * (1 - (0.8 * L.i) / 6);
  const blade = (over.blade ?? (reach - ped));
  const half = blade / 2;
  const dir = (over.side ?? L.side) === 'out' ? 1 : -1;
  const a = (rot * Math.PI) / 180;
  const px = ax + dir * ped * Math.cos(a), py = ay - ped * Math.sin(a);
  const cx = 50 + (px + dir * half * Math.cos(a)), cy = py - half * Math.sin(a);
  const wk = over.wk ?? (L.i === 6 ? 1.24 : 1);
  const n2 = (v) => +v.toFixed(2);
  return '<g><g fill="#6b737b"><g transform="translate(' + n2(cx) + ' ' + n2(cy)
    + ') rotate(' + +((dir === 1 ? -rot : rot - 180).toFixed(1)) + ') scale('
    + n2((blade / 12.0) * (over.lk ?? 1)) + ' ' + n2(wk) + ')"><path d="'
    + OAKPATH + '"/></g></g></g>';
}
async function outsideOf(ink) {
  const r = [];
  for (const [ref, e] of [['proofbright', 0], ['unc2005', 0], ['proofbright', 0.55], ['unc2005', 1.00]]) {
    const m = await maskFor(ref, e, scoreReopen(ref));
    let n = 0, o = 0;
    for (let k = 0; k < MW * MH; k++) if (ink[k]) { n++; if (!m[k]) o++; }
    r.push(n ? 100 * o / n : NaN);
  }
  return r;
}
if (mode === 'selftest') {
  let bad = 0;
  for (const L of LEAVES) {
    const mineF = seatFrag(L);
    const realF = resolve(head, out, L.id);
    const gm = /translate\([^)]*\) rotate\([^)]*\) scale\([^)]*\)/.exec(mineF)[0];
    const gr = /translate\([^)]*\) rotate\([^)]*\) scale\([^)]*\)/.exec(realF)[0];
    if (gm !== gr) { bad++; console.log(`  MISMATCH ${L.id}\n    art  ${gr}\n    mine ${gm}`); }
    else console.log(`  ok ${L.id.padStart(7)}  ${gr}`);
  }
  console.log(bad ? `\n  ${bad} MISMATCHES — seatFrag does not reproduce branch(); fix before using alt/sweep.`
    : '\n  seatFrag reproduces all seven transforms exactly.');
  process.exit(bad ? 1 : 0);
}
if (mode === 'sweep') {
  const id = process.argv[3];
  const key = process.argv[4];
  const [a, b, st] = process.argv.slice(5, 8).map(Number);
  const L = LEAVES.find((l) => l.id === id);
  const fixed = {};
  for (const kv of process.argv.slice(8)) {
    const [k, v] = kv.split('=');
    if (k && v !== undefined) fixed[k] = /^-?[\d.]+$/.test(v) ? Number(v) : v;
  }
  if (Object.keys(fixed).length) console.log(`  (held: ${JSON.stringify(fixed)})`);
  console.log(`${id} ${L.name}: sweeping ${key}, OUTSIDE %  (shipped ${key} = `
    + `${key === 'rot' ? L.rot : key === 'blade' ? 'reach-ped' : '1'})\n`);
  console.log(`  ${key.padStart(7)} | pb e0.00  unc e0.00 | pb e0.55  unc e1.00 |`
    + ' on legend  on torch  on leaf');
  for (let v = a; v <= b + 1e-9; v += st) {
    const ink = await inkOf(seatFrag(L, { ...fixed, [key]: v }), `alt:${id}:${key}:${v}:${JSON.stringify(fixed)}`);
    const r = await outsideOf(ink);
    const ov = await overlapsOf(ink, id);
    console.log(`  ${v.toFixed(2).padStart(7)} | ${r[0].toFixed(2).padStart(7)}  ${r[1].toFixed(2).padStart(8)}`
      + ` | ${r[2].toFixed(2).padStart(7)}  ${r[3].toFixed(2).padStart(8)} |`
      + `${ov.legend.toFixed(1).padStart(8)}%${ov.torch.toFixed(1).padStart(9)}%${ov.oakleaf.toFixed(1).padStart(8)}%`);
  }
  process.exit(0);
}

// ── PROBE: WHERE does a leaf's outside ink lie? Row by row, in OFFSETS from
// x = 50, this prints the leaf's own span, the coin's device span at that row,
// and how much of the leaf's ink on that row is in bare field — split into ink
// INBOARD of the coin's oak mass, OUTBOARD of it, and in an interior gap.
// "Too long", "too wide" and "in the wrong place" are three different faults
// and the OUTSIDE percentage alone cannot tell them apart.
if (mode === 'probe') {
  const { branchRuns } = await import('./_dr9branch.mjs');
  const ids = process.argv.slice(3).filter((s) => /^[\d.]+$/.test(s));
  const erode = process.argv.includes('--erode') ? Number(process.argv[process.argv.indexOf('--erode') + 1]) : 0;
  for (const id of ids) {
    const L = LEAVES.find((l) => l.id === id);
    const ink = await inkFor(id);
    console.log(`\n${id}  ${L ? L.name : ''}   erode ${erode}   offsets from x = 50\n`);
    console.log('    y | ours          | proofbright device      | in  out gap'
      + ' || unc2005 device          | in  out gap');
    const tot = { pb: [0, 0, 0], un: [0, 0, 0] };
    // rows are accumulated at the mask's own 0.05 and PRINTED every 0.5, so
    // the totals are the whole leaf and not a tenth of it.
    for (let jj = 0; jj < MH; jj++) {
      const y = +(Y0 + jj * STEP).toFixed(2);
      const j = jj;
      const show = Math.abs(y * 2 - Math.round(y * 2)) < 1e-6;
      let lo = 1e9, hi = -1e9, n = 0;
      for (let i = 0; i < MW; i++) if (ink[j * MW + i]) {
        const o = X0 + i * STEP - 50; n++; if (o < lo) lo = o; if (o > hi) hi = o;
      }
      if (!n) continue;
      const cells = [];
      for (const [key, refKey] of [['pb', 'proofbright'], ['un', 'unc2005']]) {
        const m = await maskFor(refKey, erode, scoreReopen(refKey));
        const runs = branchRuns(m, y, false);
        const dlo = runs.length ? runs[0][0] : null, dhi = runs.length ? runs[runs.length - 1][1] : null;
        let a = 0, b = 0, c = 0;
        for (let i = 0; i < MW; i++) {
          if (!ink[j * MW + i]) continue;
          const k = j * MW + i;
          if (m[k]) continue;
          const o = X0 + i * STEP - 50;
          if (dlo === null || o < dlo) a++; else if (o > dhi) b++; else c++;
        }
        tot[key][0] += a; tot[key][1] += b; tot[key][2] += c;
        cells.push(`${(runs.map((r) => `${r[0].toFixed(1)}-${r[1].toFixed(1)}`).join(' ') || '—').padEnd(24)}`
          + `| ${(a * STEP * STEP).toFixed(1).padStart(4)}${(b * STEP * STEP).toFixed(1).padStart(5)}`
          + `${(c * STEP * STEP).toFixed(1).padStart(5)}`);
      }
      if (show) console.log(`  ${y.toFixed(1).padStart(4)} | ${`${lo.toFixed(1)}-${hi.toFixed(1)}`.padEnd(13)} | ${cells[0]} || ${cells[1]}`);
    }
    const f = (t) => `inboard ${(t[0] * STEP * STEP).toFixed(2)}  outboard ${(t[1] * STEP * STEP).toFixed(2)}  interior gap ${(t[2] * STEP * STEP).toFixed(2)}`;
    console.log(`\n  outside ink, proofbright: ${f(tot.pb)}`);
    console.log(`  outside ink, unc2005    : ${f(tot.un)}`);
  }
  process.exit(0);
}

// ── PANELS: element alone | its exclusive target | overlay
if (mode === 'panels') {
  // stop at the first flag, or `--erode 0` contributes a node called "0"
  const tail = process.argv.slice(3);
  const cut = tail.findIndex((s) => s.startsWith('--'));
  const which = (cut < 0 ? tail : tail.slice(0, cut)).filter((s) => /^[\d.]+$/.test(s));
  const refKey = process.argv.includes('--ref') ? process.argv[process.argv.indexOf('--ref') + 1] : 'proofbright';
  const erode = process.argv.includes('--erode') ? Number(process.argv[process.argv.indexOf('--erode') + 1]) : REFS[refKey][2];
  const m = await maskFor(refKey, erode, scoreReopen(refKey));
  for (const id of which) {
    const L = LEAVES.find((l) => l.id === id) ?? { id, ay: 48, rot: 0, side: 'out', name: id };
    const w = winOf(L);
    const ink = await inkFor(id);
    const others = await othersOf(id);
    const tgt = new Uint8Array(MW * MH);
    for (let j = 0; j < MH; j++) {
      const y = Y0 + j * STEP; if (y < w[2] || y > w[3]) continue;
      for (let i = 0; i < MW; i++) {
        const x = X0 + i * STEP; if (x < w[0] || x > w[1]) continue;
        const k = j * MW + i; if (m[k] && !others[k]) tgt[k] = 1;
      }
    }
    const only = new Uint8Array(MW * MH), miss = new Uint8Array(MW * MH), both = new Uint8Array(MW * MH);
    for (let k = 0; k < MW * MH; k++) {
      if (ink[k] && !m[k]) only[k] = 1; else if (ink[k] && m[k]) both[k] = 1;
      if (tgt[k] && !ink[k]) miss[k] = 1;
    }
    // crop to the window so the leaf is legible rather than 1/40th of a face
    const cx0 = Math.max(0, Math.round((w[0] - 3 - X0) / STEP));
    const cx1 = Math.min(MW, Math.round((w[1] + 3 - X0) / STEP));
    const cy0 = Math.max(0, Math.round((w[2] - 3 - Y0) / STEP));
    const cy1 = Math.min(MH, Math.round((w[3] + 3 - Y0) / STEP));
    const cw = cx1 - cx0, chh = cy1 - cy0;
    const crop = (b) => b.extract({ left: cx0, top: cy0, width: cw, height: chh });
    const scale = Math.round(1200 / cw) * cw;
    const a = await crop(png([[m, [225, 235, 245]], [ink, [60, 60, 60]]])).resize(scale, null, { kernel: 'nearest' }).png().toBuffer();
    const b = await crop(png([[m, [225, 235, 245]], [tgt, [20, 110, 60]]])).resize(scale, null, { kernel: 'nearest' }).png().toBuffer();
    const c = await crop(png([[m, [235, 240, 248]], [miss, [190, 190, 190]], [both, [20, 110, 60]], [only, [210, 40, 40]]])).resize(scale, null, { kernel: 'nearest' }).png().toBuffer();
    const hh = (await sharp(a).metadata()).height;
    const f = join(JUDGE, `_dr15-node${id}-${refKey}-e${erode}.png`);
    await sharp({ create: { width: scale * 3 + 40, height: hh, channels: 3, background: '#fff' } })
      .composite([{ input: a, left: 0, top: 0 }, { input: b, left: scale + 20, top: 0 },
        { input: c, left: 2 * (scale + 20), top: 0 }])
      .png().toFile(f);
    console.log(`wrote ${f}  ${L.name}  bbox ${JSON.stringify(bboxOf(ink))}`);
    console.log('  pale blue = the coin\'s device mask | dark = our leaf | green = exclusive target');
    console.log('  overlay: green both, RED our ink outside the mask, grey target we missed');
  }
  process.exit(0);
}

// ── HOLES: the enclosed-field components, one file at a time, listed by size.
//
// `--reopen 1.0` was calibrated on `dime-rev-proofbright.png`, where the two
// populations (sub-unit specular speckle; >= 1 sq unit real negative space)
// separate with nothing between them. THAT SEPARATION IS A PROPERTY OF THAT
// PHOTOGRAPH, not of the method, and this lists the components so the next
// round can check it on any file before trusting a threshold across one.
if (mode === 'holes') {
  const { samplerFor } = await import('./_dr2grid.mjs');
  const [wx0, wx1, wy0, wy1] = [55, 85, 25, 78]; // WINDOWS['oak-branch']
  for (const refKey of ['proofbright', 'unc2005']) {
    const [f, T] = REFS[refKey];
    const mask = await maskFor(refKey, 0, 0);
    const s = await samplerFor(f, 2400);
    const light = new Uint8Array(MW * MH);
    for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
      light[j * MW + i] = s.at(X0 + i * STEP, Y0 + j * STEP) >= T ? 1 : 0;
    }
    const seen = new Int8Array(MW * MH);
    const comps = [];
    for (let k0 = 0; k0 < MW * MH; k0++) {
      if (!mask[k0] || !light[k0] || seen[k0]) continue;
      const q = [k0]; seen[k0] = 1; const cells = [k0];
      while (q.length) {
        const c = q.pop(), i = c % MW;
        for (const d of [1, -1, MW, -MW]) {
          const m = c + d;
          if (m < 0 || m >= MW * MH) continue;
          if (d === 1 && i === MW - 1) continue;
          if (d === -1 && i === 0) continue;
          if (mask[m] && light[m] && !seen[m]) { seen[m] = 1; q.push(m); cells.push(m); }
        }
      }
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (const c of cells) {
        const i = c % MW, j = (c - i) / MW, x = X0 + i * STEP, y = Y0 + j * STEP;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
      if (x1 < wx0 || x0 > wx1 || y1 < wy0 || y0 > wy1) continue;
      comps.push({ a: cells.length * STEP * STEP, x0, x1, y0, y1 });
    }
    comps.sort((p, q) => q.a - p.a);
    const tot = comps.reduce((s2, c) => s2 + c.a, 0);
    const big = comps.filter((c) => c.a >= 1.0);
    console.log(`\n── ${refKey}: ${comps.length} enclosed-field components in the oak window,`
      + ` ${tot.toFixed(1)} sq units total`);
    console.log(`   ${big.length} at >= 1.0 sq unit = ${big.reduce((s2, c) => s2 + c.a, 0).toFixed(1)} sq units`);
    for (const c of comps.slice(0, 12)) {
      console.log(`      ${c.a.toFixed(2).padStart(7)} sq units   x ${c.x0.toFixed(1)}..${c.x1.toFixed(1)}`
        + `  y ${c.y0.toFixed(1)}..${c.y1.toFixed(1)}`);
    }
  }
  process.exit(0);
}

// ── BLADE: match a candidate seating against the coin's OWN isolated blade.
//
// `swap` shows that the shipped row-2-outboard-at--13 and the proposed
// row-1-outboard-at-+25 put their ink centres 0.66 and 0.69 units from the
// coin's measured blob centre — the centre does not discriminate between them,
// because they occupy the same piece of the coin. What discriminates is SHAPE.
//
// So: take the connected component of the eroded mask that contains a seed
// point, DILATE it back by the erosion that separated it (the same structuring
// element `erodeBy` removes, applied in reverse), and score each candidate by
// IoU against that one blade. A blade is the only object in the comparison, so
// there is no cluster axis to be fooled by — which is the failure mode the
// terminal-width finding in `torch()` records ("a cluster's width is not a
// blade's width").
//
//   node _dr15oakleaf.mjs blade <ref> <erode> <seedx> <seedy>
if (mode === 'blade') {
  const refKey = process.argv[3] ?? 'proofbright';
  const e = Number(process.argv[4] ?? 0.8);
  const sx = Number(process.argv[5] ?? 74.4), sy = Number(process.argv[6] ?? 52.9);
  const m = await maskFor(refKey, e);
  // flood the component containing the seed
  const comp = new Uint8Array(MW * MH);
  {
    const si = Math.round((sx - X0) / STEP), sj = Math.round((sy - Y0) / STEP);
    const s0 = sj * MW + si;
    if (!m[s0]) { console.error(`seed (${sx}, ${sy}) is not device at erode ${e}`); process.exit(2); }
    const st = [s0]; comp[s0] = 1;
    while (st.length) {
      const k = st.pop(), i = k % MW, j = (k - i) / MW;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ni = i + di, nj = j + dj;
        if (ni < 0 || nj < 0 || ni >= MW || nj >= MH) continue;
        const nk = nj * MW + ni;
        if (m[nk] && !comp[nk]) { comp[nk] = 1; st.push(nk); }
      }
    }
  }
  // dilate back by `e` — the inverse of erodeBy's 4-neighbour erosion
  let blade = comp;
  for (let p = 0; p < Math.round(e / STEP); p++) {
    const nx = new Uint8Array(MW * MH);
    for (let j = 1; j < MH - 1; j++) for (let i = 1; i < MW - 1; i++) {
      const k = j * MW + i;
      nx[k] = blade[k] || blade[k - 1] || blade[k + 1] || blade[k - MW] || blade[k + MW] ? 1 : 0;
    }
    blade = nx;
  }
  // ...and clip to the un-eroded mask, so the dilation cannot invent device
  const m0 = await maskFor(refKey, 0);
  for (let k = 0; k < MW * MH; k++) if (!m0[k]) blade[k] = 0;
  const bb = bboxOf(blade);
  console.log(`${refKey}: component at (${sx}, ${sy}), separated at erode ${e},`
    + ` dilated back and clipped to the un-eroded mask`);
  console.log(`  area ${U(area(blade))} sq units   bbox x ${bb.x.join('..')}  y ${bb.y.join('..')}\n`);
  console.log('  candidate                                 IoU   covered  spill   area');
  const cands = [];
  for (const a of [-20, -13, -5, 5, 15, 20, 25, 30, 35, 40]) {
    cands.push([`row2 (ay 51.23) outboard rot ${String(a).padStart(3)}`, LEAVES[1], { side: 'out', rot: a }]);
  }
  for (const a of [10, 15, 20, 25, 30, 35, 40]) {
    cands.push([`row1 (ay 56.96) outboard rot ${String(a).padStart(3)}`, LEAVES[0], { side: 'out', rot: a }]);
  }
  let best = null;
  for (const [name, L, over] of cands) {
    const ink = await inkOf(seatFrag(L, over), `bl:${L.id}:${JSON.stringify(over)}`);
    let i2 = 0, u = 0, n = 0;
    for (let k = 0; k < MW * MH; k++) {
      if (ink[k]) n++;
      if (ink[k] && blade[k]) i2++;
      if (ink[k] || blade[k]) u++;
    }
    const iou = 100 * i2 / u;
    if (!best || iou > best[0]) best = [iou, name];
    console.log(`  ${name.padEnd(40)} ${iou.toFixed(1).padStart(5)}%`
      + ` ${(100 * i2 / area(blade)).toFixed(0).padStart(6)}%`
      + ` ${(100 * (n - i2) / n).toFixed(0).padStart(6)}%  ${U(n)}`);
  }
  console.log(`\n  best: ${best[1]} at IoU ${best[0].toFixed(1)}%`);
  console.log('  covered = of the coin\'s blade, how much our candidate covers;'
    + ' spill = of our candidate, how much lands off that blade.');
  process.exit(0);
}

// ── SWAP: the D11/D12 pair, both halves at once, and the merge objection.
//
// The ledger refuses D12 because "any reassignment lands [rows 2 and 3] within
// 2 units of each other on the SAME side at similar angles, which merges them".
// That objection is about moving ONE node. This moves the PAIR — row 1 (ay
// 56.96) outboard and row 2 (ay 51.23) inboard — and measures the merge instead
// of predicting it: each leaf's OUTSIDE, their shared ink, and their overlap
// with the five leaves that do not move and with the torch.
//
//   node _dr15oakleaf.mjs swap [rot1] [rot2]
if (mode === 'swap') {
  const r1 = Number(process.argv[3] ?? 25), r2 = Number(process.argv[4] ?? 20);
  const L6 = LEAVES[0], L8 = LEAVES[1];
  const cases = [
    ['SHIPPED   row1 in  38 / row2 out -13', await inkFor('2.1.6'), await inkFor('2.1.8')],
    [`SWAPPED   row1 out ${r1} / row2 in ${r2}`,
      await inkOf(seatFrag(L6, { side: 'out', rot: r1 }), `sw6:${r1}`),
      await inkOf(seatFrag(L8, { side: 'in', rot: r2 }), `sw8:${r2}`)],
  ];
  const rest = new Uint8Array(MW * MH);
  for (const L of LEAVES.slice(2)) {
    const a = await inkFor(L.id);
    for (let k = 0; k < MW * MH; k++) if (a[k]) rest[k] = 1;
  }
  const torch = await groupInk('torch', null);
  for (const [name, a, b] of cases) {
    console.log(`\n${name}`);
    for (const [who, ink] of [['row1 (2.1.6)', a], ['row2 (2.1.8)', b]]) {
      const r = await outsideOf(ink);
      let n = 0, sh = 0, ot = 0, to = 0;
      const other = ink === a ? b : a;
      for (let k = 0; k < MW * MH; k++) if (ink[k]) {
        n++; if (other[k]) sh++; if (rest[k]) ot++; if (torch[k]) to++;
      }
      console.log(`  ${who}  OUTSIDE pb ${r[0].toFixed(2)}%  unc ${r[1].toFixed(2)}%`
        + `   shares ${(100 * sh / n).toFixed(1)}% with its partner,`
        + ` ${(100 * ot / n).toFixed(1)}% with the other five, ${(100 * to / n).toFixed(1)}% with the torch`);
      console.log(`      centre of its ink: (${(bboxOf(ink).x[0] + bboxOf(ink).x[1]) / 2}, `
        + `${(bboxOf(ink).y[0] + bboxOf(ink).y[1]) / 2})  bbox ${JSON.stringify(bboxOf(ink))}`);
    }
  }
  console.log('\n  The coin\'s own blob at this node, `split` above:'
    + ' proofbright (74.4, 52.9) 14.6 x 9.4 axis +27°, unc2005 (72.9, 53.6) 11.1 x 8.6 axis +36°.');
  process.exit(0);
}
// ── SPLIT: an EROSION LADDER on the coin's own oak side.
//
// The ledger's D11/D12 row says only TWO of the oak's seven blades are isolated
// components, and names what would settle the rest: "an erosion ladder that
// separates them without eating the petioles". This runs it. Each step lists
// the oak-side blobs with their PCA length, width and axis; a blade that
// appears as its own component at some erosion and keeps a stable centre as the
// erosion grows is a blade that has been MEASURED, and one that never separates
// is one this round could not measure and must say so.
if (mode === 'split') {
  const { blobs } = await import('./_dr9branch.mjs');
  const min = Number(process.argv[3] ?? 4);
  for (const refKey of ['proofbright', 'unc2005']) {
    console.log(`\n── ${refKey}  (oak side, blobs >= ${min} sq units)`);
    for (const e of [0, 0.4, 0.8, 1.2, 1.6, 2.0, 2.4]) {
      const b = blobs(await maskFor(refKey, e, scoreReopen(refKey)), false, min);
      console.log(`  erode ${e.toFixed(1)}  ${b.length} blob(s)`);
      for (const q of b) {
        console.log(`      (${q.cx.toFixed(1)}, ${q.cy.toFixed(1)})  area ${String(q.area).padStart(6)}`
          + `  ${q.len.toFixed(1)} x ${q.wid.toFixed(1)}  axis ${String(q.ang).padStart(4)}°`);
      }
    }
  }
  process.exit(0);
}

// ── PAIRS: do the seven leaves stand apart, or are they one object? Every
// pair's shared ink, as a percentage of the SMALLER leaf's area. On the coin
// each blade stands in open field on its own petiole; a leaf that hides half
// its ink under a neighbour scores well on OUTSIDE for a reason that has
// nothing to do with the coin.
if (mode === 'pairs') {
  const inks = [];
  for (const L of LEAVES) inks.push(await inkFor(L.id));
  console.log('shared ink as % of the SMALLER leaf\n');
  console.log('            ' + LEAVES.map((l) => l.id.replace('2.1.', '').padStart(6)).join(''));
  for (let a = 0; a < 7; a++) {
    const row = [];
    for (let b = 0; b < 7; b++) {
      if (a === b) { row.push('     ·'); continue; }
      let c = 0;
      for (let k = 0; k < MW * MH; k++) if (inks[a][k] && inks[b][k]) c++;
      const m = Math.min(area(inks[a]), area(inks[b]));
      row.push((100 * c / m).toFixed(1).padStart(6));
    }
    console.log(`  ${LEAVES[a].id.padStart(7)} ${LEAVES[a].name.slice(0, 3)} ${row.join('')}`);
  }
  process.exit(0);
}

// ── LOOK: the two references and our own render, SAME crop, SAME scale, with a
// 5-unit grid burnt in so a leaf can be read off in viewBox coordinates. THE
// PICTURE IS THE GATE — every number above is subordinate to this.
if (mode === 'look') {
  const { samplerFor } = await import('./_dr2grid.mjs');
  const [x0, x1, y0, y1] = [52, 86, 24, 62];
  const P = Number(process.argv[3] ?? 20);
  const W = Math.round((x1 - x0) * P), H = Math.round((y1 - y0) * P);
  const grid = (b) => {
    for (let u = Math.ceil(x0 / 5) * 5; u <= x1; u += 5) {
      const i = Math.round((u - x0) * P);
      for (let j = 0; j < H; j++) { const k = (j * W + i) * 3; b[k] = 235; b[k + 1] = 90; b[k + 2] = 90; }
    }
    for (let v = Math.ceil(y0 / 5) * 5; v <= y1; v += 5) {
      const j = Math.round((v - y0) * P);
      for (let i = 0; i < W; i++) { const k = (j * W + i) * 3; b[k] = 235; b[k + 1] = 90; b[k + 2] = 90; }
    }
    return b;
  };
  const tiles = [];
  for (const f of ['dime-rev-proofbright.png', 'dime-rev-unc2005.png']) {
    const s = await samplerFor(f, 2400);
    const b = Buffer.alloc(W * H * 3);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const g = Math.max(0, Math.min(255, Math.round(s.at(x0 + i / P, y0 + j / P))));
      const k = (j * W + i) * 3; b[k] = g; b[k + 1] = g; b[k + 2] = g;
    }
    tiles.push(await sharp(grid(b), { raw: { width: W, height: H, channels: 3 } }).png().toBuffer());
  }
  {
    const full = Math.round(100 * P);
    const raw = await sharp(Buffer.from(svg)).resize(full, full, { fit: 'fill' })
      .flatten({ background: '#fff' }).raw().toBuffer({ resolveWithObject: true });
    const b = Buffer.alloc(W * H * 3);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const sx = Math.round((x0 + i / P) * P), sy = Math.round((y0 + j / P) * P);
      const p = (sy * raw.info.width + sx) * raw.info.channels;
      const k = (j * W + i) * 3;
      b[k] = raw.data[p]; b[k + 1] = raw.data[p + 1]; b[k + 2] = raw.data[p + 2];
    }
    tiles.push(await sharp(grid(b), { raw: { width: W, height: H, channels: 3 } }).png().toBuffer());
  }
  const f = join(JUDGE, '_dr15-look.png');
  await sharp({ create: { width: W * 3 + 40, height: H, channels: 3, background: '#fff' } })
    .composite(tiles.map((t, i) => ({ input: t, left: i * (W + 20), top: 0 })))
    .png().toFile(f);
  console.log(`wrote ${f}  —  proofbright | unc2005 | OURS, crop x ${x0}..${x1} y ${y0}..${y1},`
    + ` grid every 5 viewBox units at ${P} px/unit`);
  process.exit(0);
}

// ── ROWS: the coin's own device runs on the oak side, beside ours
if (mode === 'rows') {
  const { branchRuns } = await import('./_dr9branch.mjs');
  const y0 = Number(process.argv[3] ?? 27), y1 = Number(process.argv[4] ?? 62);
  const erode = process.argv.includes('--erode') ? Number(process.argv[process.argv.indexOf('--erode') + 1]) : 0;
  const ours = new Uint8Array(MW * MH);
  for (const L of LEAVES) {
    const a = await inkFor(L.id);
    for (let k = 0; k < MW * MH; k++) if (a[k]) ours[k] = 1;
  }
  const ourRuns = (y) => {
    const j = Math.round((y - Y0) / STEP); const o = []; let s = null;
    for (let i = 0; i < MW; i++) {
      const x = X0 + i * STEP;
      const on = x > 50 && ours[j * MW + i];
      if (on && s === null) s = x - 50;
      if (!on && s !== null) { if (x - 50 - s > 0.3) o.push([s, x - 50]); s = null; }
    }
    return o;
  };
  const fmt = (r) => r.map((p) => `${p[0].toFixed(1)}-${p[1].toFixed(1)}`).join(' ') || '—';
  console.log(`oak side device runs as OFFSETS from x=50, erode ${erode}\n`);
  console.log('    y | proofbright                     | unc2005                        | OURS (leaves only)');
  for (let y = y0; y <= y1; y += 1) {
    const a = branchRuns(await maskFor('proofbright', erode, scoreReopen('proofbright')), y, false);
    const b = branchRuns(await maskFor('unc2005', erode, scoreReopen('unc2005')), y, false);
    console.log(`  ${y.toFixed(0).padStart(3)} | ${fmt(a).padEnd(31)} | ${fmt(b).padEnd(30)} | ${fmt(ourRuns(y))}`);
  }
  process.exit(0);
}

// ── DEPTH: how far inboard of its own stem does each branch's foliage reach?
//
// This is the quantity an INBOARD blade has to fit inside, and no instrument on
// this face had it. `rows` prints the runs and leaves the reader to subtract the
// torch by eye; `probe` says an inboard blade's ink is in bare field but not how
// much room there was. Both were used to argue about ANGLE when the binding
// constraint may be LENGTH.
//
// ⚠️ THE OBVIOUS ESTIMATOR IS WRONG AND IS RECORDED HERE AS THE THING THAT
// FAILED. "Start at `stemC(y)` and walk inboard through device until the first
// gap" looks threshold-free, but on both files it returns 1.0 for row after row
// of the olive — because it is measuring THE STEM'S OWN HALF-WIDTH. The blades
// hang on petioles and the mask has bare field between stem and blade, which is
// the finding the `PTILT` block is built on. The walk stops in that gap.
//
// So the run table is used instead, with ONE threshold, and the threshold is
// justified by a gap in the data rather than chosen: on the oak side the
// innermost run at every row from y 33 to 45 starts at offset 3.2-6.2 (the
// torch) and the next starts at 8.1-13.8 (the foliage), with nothing between.
// Runs starting inboard of 7.0 are therefore the torch and are dropped. Where
// the two merge into one run that crosses the stem — proofbright y 46-53, which
// this prints as MERGED rather than as a number — the depth is not measurable on
// that file at that row, and saying so is the honest output.
//
//   node _dr15oakleaf.mjs depth [y0 y1]
if (mode === 'depth') {
  const { branchRuns } = await import('./_dr9branch.mjs');
  const y0 = Number(process.argv[3] ?? 33), y1 = Number(process.argv[4] ?? 58);
  const TORCH = 7.0;
  const mpb = await maskFor('proofbright', 0, scoreReopen('proofbright'));
  const mun = await maskFor('unc2005', 0, scoreReopen('unc2005'));
  const depth = (m, y, mirror) => {
    const runs = branchRuns(m, y, mirror).filter((r) => r[1] > TORCH);
    if (!runs.length) return null;
    // where the foliage itself runs inboard of TORCH the rule clamps there, so
    // the number is a FLOOR on those rows and is printed with a leading '>'.
    const inner = Math.max(runs[0][0], TORCH);
    const c = STEMC(y);
    if (runs[0][0] < TORCH && runs[0][1] > c) return NaN; // torch and foliage are one run
    return [c - inner, runs[0][0] < TORCH];
  };
  const f = (v) => (v === null ? '    —' : Number.isNaN(v) ? ' MERG'
    : `${v[1] ? '>' : ' '}${v[0].toFixed(1).padStart(4)}`);
  console.log('INBOARD DEPTH of each branch\'s foliage, from the stem centreline `stemC(y)`');
  console.log('to the innermost non-torch device on that row. erode 0, units.\n');
  console.log('     y  |   OAK pb  OAK un  |  OLIVE pb  OLIVE un');
  const acc = { o: [], v: [] };
  for (let y = y0; y <= y1; y += 1) {
    const r = [depth(mpb, y, false), depth(mun, y, false), depth(mpb, y, true), depth(mun, y, true)];
    for (let q = 0; q < 4; q++) if (Array.isArray(r[q])) acc[q < 2 ? 'o' : 'v'].push(r[q][0]);
    console.log(`   ${y.toFixed(0).padStart(4)} |   ${f(r[0])}   ${f(r[1])}  |     ${f(r[2])}      ${f(r[3])}`);
  }
  const st = (a) => `${a.length} rows: min ${Math.min(...a).toFixed(1)}  mean `
    + `${(a.reduce((s, v) => s + v, 0) / a.length).toFixed(1)}  max ${Math.max(...a).toFixed(1)}`;
  console.log(`\n  OAK    ${st(acc.o)}`);
  console.log(`  OLIVE  ${st(acc.v)}`);
  console.log('\n  A leading ">" is the threshold, not a reading: the foliage runs inboard of');
  console.log('  offset 7.0 on that row and the rule clamps there, so the value is a FLOOR.');
  console.log('  An inboard blade has to live inside this column. `reach` is `ped + blade`');
  console.log('  and the shipped line asks 13.1-15.9 at the four inboard nodes.');
  process.exit(0);
}

console.log('usage: node _dr15oakleaf.mjs [outside|stalks|merge|fill|depth|panels <idx...>|rows [y0 y1]] [--ref R] [--erode U]');
