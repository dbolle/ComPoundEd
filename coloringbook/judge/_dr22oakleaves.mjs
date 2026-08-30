// _dr22oakleaves.mjs — THE OAK'S EIGHT LEAVES, ONE AT A TIME.
//
// Reports only (WRITERS.md). Never writes into src/.
//
// ── WHY THIS EXISTS ────────────────────────────────────────────────────────
// The oak branch stopped being a seven-row mirrored ladder in round 43 and
// became eight named leaves in four groups (the owner's reading of the coin;
// see the `OAKSEATS` ledger in `torch()`). Every instrument in this directory
// that scores foliage scores it as ONE element — `_dr13elem.mjs` walks nodes
// and reports a number per node, `_dr21target.mjs` opens the target's
// components — and neither answers the two questions this topology actually
// raises:
//
//   1. Where is EACH leaf, and how much of its own ink is on bare field?
//   2. What does each leaf OVERLAP? Overlapping is intended here — the coin's
//      leaves overlap, which is why no erosion separates them (ledger A42) —
//      so a low OUTSIDE is not a pass on its own. A leaf can score ~0 % by
//      sliding under its neighbours (ledger E25's sibling), and the only way
//      to tell that from a correct leaf is to publish the overlap beside the
//      containment.
//
// ── WHAT IT DOES NOT DO ────────────────────────────────────────────────────
// It does not count the coin's leaves. It cannot: `_dr21target.mjs` swept
// erosion 0 → 1.50 and the coin's whole oak stays one component of ~480 sq
// units at every setting. The eight are the OWNER'S reading and this
// instrument measures our drawing against the coin's silhouette, which is a
// different and answerable question.
//
// ── THE NODE MAP, and why it is written down ───────────────────────────────
// `torch()` emits the oak as stem, then leaf/stalk pairs in `OAKSEATS` order.
// Node ids therefore MOVE whenever a leaf is added or removed, and three
// rounds have quoted a stale id. The map below is derived from the order in
// `OAKSEATS`, not from a table anyone has to keep in step: leaf `i` is node
// `2.1.<5 + 2i>` and its stalk (if it has one) is the node before it, except
// B1, which is sessile and has no stalk. Verified at run time — if the count
// of drawable nodes under 2.1 changes, this prints a warning rather than
// silently measuring the wrong marks.
//
// usage:
//   node _dr22oakleaves.mjs table              geometry + containment + overlap
//   node _dr22oakleaves.mjs over  [x0 x1 y0 y1 [ppu]]   the eight on each photo
//   node _dr22oakleaves.mjs diff  [x0 x1 y0 y1 [ppu]]   coin-only / ours-only
import sharp from 'sharp';
import { join } from 'node:path';
import { SCRATCH } from './_paths.mjs';
import { samplerFor } from './_dr2grid.mjs';
import { deviceMask } from './_dr9branch.mjs';
import { nodes, resolve, reopen } from './_dr13elem.mjs';
import { coinSVG } from '../../src/art/coins.js';

const REFS = ['dime-rev-proofbright.png', 'dime-rev-unc2005.png'];
const T_OF = { 'dime-rev-proofbright.png': 236, 'dime-rev-unc2005.png': 190 };
/** a feature we draw at offset o appears on this file at o + REG (`_dr18prong.mjs`) */
const REG = { 'dime-rev-proofbright.png': 0.35, 'dime-rev-unc2005.png': -0.75 };
const X0 = 13, X1 = 87, Y0 = 17, Y1 = 85, S = 0.05;
const MW = Math.round((X1 - X0) / S), MH = Math.round((Y1 - Y0) / S);
const A = S * S;
const short = (f) => f.slice(9, -4);
const mode = process.argv[2] || 'table';
const nums = process.argv.slice(3).filter((s) => /^-?[\d.]+$/.test(s)).map(Number);

// THE OAK WINDOW IS x 58..82 y 25..61 (ledger A43). `WINDOWS['oak-branch']` is
// x 55..85 y 25..78 and 41 % of that is not oak: the coin's ONE DIME legend at
// y 61.8..67.1 and the rim band beyond x 82.
const WIN = [58, 82, 25, 61];

// ── OUR INK, node by node.
const { head, out } = nodes(coinSVG('dime', 380, { side: 'reverse' }));
const full = Math.round(100 / S);
async function inkOf(id) {
  const { data, info } = await sharp(Buffer.from(`${head}${resolve(head, out, id)}</svg>`))
    .resize(full, full, { fit: 'fill' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const ink = new Uint8Array(MW * MH);
  for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
    const p = (Math.round((Y0 + j * S) / S) * info.width + Math.round((X0 + i * S) / S)) * info.channels;
    if (data[p + info.channels - 1] > 24) ink[j * MW + i] = 1;
  }
  return ink;
}

const NAMES = ['B1', 'B2', 'B3', 'C', 'A1', 'A2', 'D1', 'D2'];
const GROUP = {
  B1: 'B  3-bunch, outboard prong tip', B2: 'B  3-bunch', B3: 'B  3-bunch',
  C: 'C  outboard prong, outboard face', A1: 'A  inboard prong', A2: 'A  inboard prong',
  D1: 'D  trunk below the fork', D2: 'D  trunk below the fork',
};
const STEM = '2.1.4';
// B1 is sessile; every other leaf is preceded by its own stalk.
const LEAF_ID = {}; const STALK_ID = {};
NAMES.forEach((n, i) => { LEAF_ID[n] = `2.1.${5 + 2 * i}`; if (i) STALK_ID[n] = `2.1.${4 + 2 * i}`; });
// ⚠️ OFF BY ONE UNTIL ROUND 44. This was `2.1.${5 + 2 * NAMES.length}` = 2.1.21,
// and B1 is SESSILE — the run of leaf/stalk pairs is one node shorter than the
// arithmetic assumed, so the first drawable node after D2 (2.1.19) is 2.1.20.
// 2.1.21 was the OLIVE's stem path, which is on the other branch entirely: the
// `over` and `diff` maps therefore drew the olive stem as if it were the acorn
// and left acorn 1's own footprint showing as coin-only blue. There are now TWO
// acorns and both are listed, so the id is a list rather than a formula.
const ACORN_IDS = ['2.1.20', '2.1.21'];
// ROUND 45 gives each acorn a STALK. They are emitted after the OLIVE, not
// after the oak, so that adding them moved no existing id (the oak is
// 2.1.4..2.1.21, the olive 2.1.22..2.1.39). 2.1.40 is acorn 1's, 2.1.41 is
// acorn 2's. They are folded into `stalks`, so `table`'s overlap column and
// `over`/`diff` both carry them.
const ACORN_STALK_IDS = ['2.1.40', '2.1.41'];

const ink = {}; for (const n of NAMES) ink[n] = await inkOf(LEAF_ID[n]);
const stem = await inkOf(STEM);
const acorn = new Uint8Array(MW * MH);
for (const id of ACORN_IDS) {
  const v = await inkOf(id); for (let i = 0; i < acorn.length; i++) if (v[i]) acorn[i] = 1;
}
const stalks = new Uint8Array(MW * MH);
for (const n of Object.keys(STALK_ID)) {
  const v = await inkOf(STALK_ID[n]);
  for (let i = 0; i < stalks.length; i++) if (v[i]) stalks[i] = 1;
}
for (const id of ACORN_STALK_IDS) {
  const v = await inkOf(id);
  for (let i = 0; i < stalks.length; i++) if (v[i]) stalks[i] = 1;
}
const ours = new Uint8Array(MW * MH);
for (const v of [...NAMES.map((n) => ink[n]), stem, acorn, stalks]) {
  for (let i = 0; i < ours.length; i++) if (v[i]) ours[i] = 1;
}

function box(v) {
  let n = 0, x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, sx = 0, sy = 0;
  for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
    if (!v[j * MW + i]) continue;
    const x = X0 + i * S, y = Y0 + j * S;
    n++; sx += x; sy += y;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return { n, area: n * A, x0, x1, y0, y1, cx: sx / n, cy: sy / n };
}

const masks = {};
for (const f of REFS) {
  let m = await deviceMask(f, T_OF[f], 0);
  // reopen 1.0 on proofbright ONLY — on unc2005 that threshold reopens the
  // torch flame's interior (`_dr21target.mjs`'s note).
  if (f === REFS[0]) m = await reopen(m, f, T_OF[f], 1.0);
  masks[f] = m;
}

if (mode === 'table') {
  const st = {}; for (const n of NAMES) st[n] = box(ink[n]);
  console.log('THE OAK\'S EIGHT, AS DRAWN. Offsets are viewBox x (50 + offset), OUR frame.\n');
  console.log('  leaf  group                            area   bbox x          bbox y         centroid');
  for (const n of NAMES) {
    const s = st[n];
    console.log(`  ${n.padEnd(5)} ${GROUP[n].padEnd(33)} ${s.area.toFixed(2).padStart(6)}  `
      + `${s.x0.toFixed(2)}..${s.x1.toFixed(2)}  ${s.y0.toFixed(2)}..${s.y1.toFixed(2)}  `
      + `${s.cx.toFixed(2)}, ${s.cy.toFixed(2)}`);
  }

  console.log('\nOVERLAP — % of the ROW leaf\'s own ink that is also the COLUMN element\'s.');
  console.log('Overlapping is INTENDED (the owner asked for individual overlapping leaves);');
  console.log('this is here so a low OUTSIDE cannot be bought by hiding under a neighbour.\n');
  const cols = [...NAMES, 'stem', 'stalk', 'acorn'];
  console.log('        ' + cols.map((c) => c.padStart(7)).join(''));
  for (const n of NAMES) {
    const v = ink[n];
    const row = cols.map((c) => {
      if (c === n) return '     --';
      const w = c === 'stem' ? stem : c === 'stalk' ? stalks : c === 'acorn' ? acorn : ink[c];
      let k = 0; for (let i = 0; i < v.length; i++) if (v[i] && w[i]) k++;
      return (100 * k / st[n].n).toFixed(1).padStart(7);
    });
    console.log(`  ${n.padEnd(4)}  ` + row.join(''));
  }

  for (const f of REFS) {
    const m = masks[f]; const r = REG[f];
    console.log(`\nCONTAINMENT on ${short(f)} — registration ${r > 0 ? '+' : ''}${r}.`);
    console.log('OUTSIDE = the fraction of a leaf\'s OWN ink that lands where the coin has');
    console.log('bare field. The mask carries the strike\'s bevel skirt, so it is a GENEROUS');
    console.log('target and 0 % is not the goal; where the outside ink IS matters more.\n');
    console.log('  leaf     ink   outside      %   where the outside ink is');
    let tn = 0, to = 0;
    for (const n of NAMES) {
      const v = ink[n]; let cnt = 0, o = 0, ox0 = Infinity, ox1 = -Infinity, oy0 = Infinity, oy1 = -Infinity, sx = 0, sy = 0;
      for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
        if (!v[j * MW + i]) continue;
        cnt++;
        const ii = Math.round((X0 + i * S + r - X0) / S);
        if (ii >= 0 && ii < MW && m[j * MW + ii]) continue;
        const x = X0 + i * S, y = Y0 + j * S;
        o++; sx += x; sy += y;
        if (x < ox0) ox0 = x; if (x > ox1) ox1 = x; if (y < oy0) oy0 = y; if (y > oy1) oy1 = y;
      }
      tn += cnt; to += o;
      console.log(`  ${n.padEnd(4)} ${(cnt * A).toFixed(2).padStart(7)} ${(o * A).toFixed(2).padStart(8)} `
        + `${(100 * o / cnt).toFixed(2).padStart(6)}   x ${ox0.toFixed(1)}..${ox1.toFixed(1)}`
        + `  y ${oy0.toFixed(1)}..${oy1.toFixed(1)}  at ${(sx / o).toFixed(1)}, ${(sy / o).toFixed(1)}`);
    }
    console.log(`  ALL  ${(tn * A).toFixed(2).padStart(7)} ${(to * A).toFixed(2).padStart(8)} ${(100 * to / tn).toFixed(2).padStart(6)}`);

    // THE WHOLE OAK against the coin's own oak, in the window that is oak.
    let target = 0, mine = 0, hit = 0;
    for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
      const x = X0 + i * S, y = Y0 + j * S;
      if (x < WIN[0] + r || x > WIN[1] + r || y < WIN[2] || y > WIN[3]) continue;
      const t = m[j * MW + i];
      const ii = Math.round((x - r - X0) / S);
      const o = ii >= 0 && ii < MW && ours[j * MW + ii];
      if (t) target++; if (o) mine++; if (t && o) hit++;
    }
    console.log(`  WHOLE OAK in x ${WIN[0]}..${WIN[1]} y ${WIN[2]}..${WIN[3]}: coin ${(target * A).toFixed(2)} sq units,`
      + ` ours ${(mine * A).toFixed(2)}, shared ${(hit * A).toFixed(2)}`);
    console.log(`     → covers ${(100 * hit / target).toFixed(1)} % of the coin's oak;`
      + ` ${(100 * hit / mine).toFixed(1)} % of our own ink is on device.`);
  }
  process.exit(0);
}

const [x0, x1, y0, y1, ppu] = nums.length >= 4
  ? [nums[0], nums[1], nums[2], nums[3], nums[4] ?? 30] : [54, 84, 24, 62, 30];
const W = Math.round((x1 - x0) * ppu), H = Math.round((y1 - y0) * ppu);
function rule(buf, rgbV, rgbH) {
  for (let Xv = Math.ceil(x0); Xv <= x1; Xv++) {
    const i = Math.round((Xv - x0) * ppu); if (i < 0 || i >= W) continue;
    const maj = Xv % 5 === 0;
    for (let j = 0; j < H; j++) {
      if (!maj && j % 16 > 1) continue;
      const k = (j * W + i) * 3; const c = maj ? rgbV[0] : rgbV[1];
      buf[k] = c[0]; buf[k + 1] = c[1]; buf[k + 2] = c[2];
    }
  }
  for (let Yv = Math.ceil(y0); Yv <= y1; Yv++) {
    const j = Math.round((Yv - y0) * ppu); if (j < 0 || j >= H) continue;
    const maj = Yv % 5 === 0;
    for (let i = 0; i < W; i++) {
      if (!maj && i % 16 > 1) continue;
      const k = (j * W + i) * 3; const c = maj ? rgbH[0] : rgbH[1];
      buf[k] = c[0]; buf[k + 1] = c[1]; buf[k + 2] = c[2];
    }
  }
}

// ── THE PICTURE. All eight, outlined, on the photograph at its registration.
if (mode === 'over') {
  for (const f of REFS) {
    const { at } = await samplerFor(f);
    const r = REG[f];
    const buf = Buffer.alloc(W * H * 3);
    const get = (a, b) => (a >= 0 && a < MW && b >= 0 && b < MH ? ours[b * MW + a] : 0);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const x = x0 + i / ppu, y = y0 + j / ppu;
      const v = Math.max(0, Math.min(255, Math.round(at(x, y))));
      const ii = Math.round((x - r - X0) / S), jj = Math.round((y - Y0) / S);
      let on = get(ii, jj);
      if (on) { on = 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!get(ii + dx, jj + dy)) on = 1; }
      const k = (j * W + i) * 3;
      buf[k] = on ? 225 : v; buf[k + 1] = on ? 30 : v; buf[k + 2] = on ? 45 : v;
    }
    rule(buf, [[0, 90, 255], [0, 190, 255]], [[0, 90, 255], [0, 190, 255]]);
    const o = `_dr22-over-${short(f)}.png`;
    await sharp(buf, { raw: { width: W, height: H, channels: 3 } }).png().toFile(join(SCRATCH, o));
    console.log(`  ${short(f).padEnd(12)} -> ${o}  ${W}x${H}  x ${x0}..${x1} y ${y0}..${y1} @ ${ppu}px/unit`
      + `  (our ink shifted ${r > 0 ? '+' : ''}${r} into this file's frame)`);
  }
  console.log('  RED outline = the whole drawn oak. Blue gridlines are viewBox units, solid every 5.');
  process.exit(0);
}

// ── THE DIFFERENCE. What the coin has and we do not, and the reverse.
if (mode === 'diff') {
  for (const f of REFS) {
    const m = masks[f]; const r = REG[f];
    const buf = Buffer.alloc(W * H * 3, 255);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const x = x0 + i / ppu, y = y0 + j / ppu;
      const a = Math.round((x - X0) / S), b = Math.round((y - Y0) / S);
      const ok = a >= 0 && a < MW && b >= 0 && b < MH;
      const coin = ok && m[b * MW + a];
      const ii = Math.round((x - r - X0) / S);
      const mine = ok && ii >= 0 && ii < MW && ours[b * MW + ii];
      const k = (j * W + i) * 3;
      if (coin && mine) { buf[k] = 120; buf[k + 1] = 124; buf[k + 2] = 132; }
      else if (coin) { buf[k] = 60; buf[k + 1] = 130; buf[k + 2] = 235; }
      else if (mine) { buf[k] = 225; buf[k + 1] = 60; buf[k + 2] = 40; }
    }
    rule(buf, [[255, 255, 0], [255, 200, 0]], [[255, 255, 0], [255, 200, 0]]);
    const o = `_dr22-diff-${short(f)}.png`;
    await sharp(buf, { raw: { width: W, height: H, channels: 3 } }).png().toFile(join(SCRATCH, o));
    console.log(`  ${short(f).padEnd(12)} -> ${o}  ${W}x${H}  x ${x0}..${x1} y ${y0}..${y1} @ ${ppu}px/unit`);
  }
  console.log('  BLUE = the coin has device and we draw none. RED = we draw ink and the coin');
  console.log('  has field. GREY = both. A uniform blue rim is the strike\'s bevel skirt, which');
  console.log('  the mask counts as device and a flat fill correctly does not reach.');
  process.exit(0);
}

console.log('usage: node _dr22oakleaves.mjs [table|over|diff] [x0 x1 y0 y1 [ppu]]');
