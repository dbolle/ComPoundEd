// DIME REVERSE — THE OAK BRANCH ELEMENT, ALONE, ON THE PHOTOGRAPHS.
//
// Reports only (WRITERS.md). Never writes into src/.
//
// WHY THIS EXISTS. `_dr17oakfork.mjs pic` draws our stem over each file's MASK,
// which is the right picture for the fork channel and the wrong one for the
// crown: above y 48 the foliage closes over both prongs, the mask is one slab
// there, and a prong drawn anywhere inside that slab scores the same. This
// draws the element over the PHOTOGRAPH itself, in red, at that file's own
// registration, so where the prongs run can be SEEN against the coin's own
// relief rather than against a blob.
//
// THE BAND TABLE is the number that goes with the picture: what fraction of the
// element's ink in each horizontal band lands on device. The bands are the
// parts of the branch that are separately arguable — the two prongs above the
// fork, the fork itself, the trunk, the foot — because the whole-element figure
// averages a 64 % band into an 84 % one and reports 81 %.
//
// REGISTRATION. Our ink is shifted in x by the file's own offset before it is
// compared: proofbright +0.35, unc2005 −0.75, found by maximising trunk-on-
// device over y 62..69 (`reg` below re-derives it). This is the round-38
// null-test frame with its sign flipped — that ledger quotes the shift to ADD
// TO THE FILE (pb −0.35, unc +0.65), which is the same statement about the
// photograph. ⚠️ unc2005 lands 15..20 points lower everywhere, including on
// parts three rounds have verified; it is a near-line-art file whose strokes
// are thinner than the coin's relief. READ PROOFBRIGHT, use unc for the sign.
//
// usage:
//   node _dr18prong.mjs bands [--node <id>]
//   node _dr18prong.mjs reg   [--node <id>]
//   node _dr18prong.mjs over  [x0 x1 y0 y1 [ppu]] [--node <id>] [--tag <name>]
import { samplerFor } from './_dr2grid.mjs';
import { deviceMask } from './_dr9branch.mjs';
import { nodes, resolve, reopen } from './_dr13elem.mjs';
import { SCRATCH } from './_paths.mjs';
import { coinSVG } from '../../src/art/coins.js';
import sharp from 'sharp';
import { join } from 'node:path';

const REFS = ['dime-rev-proofbright.png', 'dime-rev-unc2005.png'];
const T_OF = { 'dime-rev-proofbright.png': 236, 'dime-rev-unc2005.png': 190 };
const REG = { 'dime-rev-proofbright.png': 0.35, 'dime-rev-unc2005.png': -0.75 };
const X0 = 13, X1 = 87, Y0 = 17, Y1 = 85, S = 0.05;
const MW = Math.round((X1 - X0) / S), MH = Math.round((Y1 - Y0) / S);
const short = (f) => f.slice(9, -4);

const arg = (k, d) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);
const NODE = arg('--node', '2.1.4');

/** the element's ink on the mask grid, 0.05 units per cell */
async function inkOf(id) {
  const { head, out } = nodes(coinSVG('dime', 380, { side: 'reverse' }));
  const full = Math.round(100 / S);
  const { data, info } = await sharp(Buffer.from(`${head}${resolve(head, out, id)}</svg>`))
    .resize(full, full, { fit: 'fill' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const ink = new Uint8Array(MW * MH);
  for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
    const p = (Math.round((Y0 + j * S) / S) * info.width + Math.round((X0 + i * S) / S)) * info.channels;
    if (data[p + info.channels - 1] > 24) ink[j * MW + i] = 1;
  }
  return ink;
}

/** each file's mask, proofbright with the fork pocket reopened */
const ERODE = Number(arg('--erode', '0'));
async function masks() {
  const m = {};
  for (const f of REFS) {
    let a = await deviceMask(f, T_OF[f], ERODE);
    if (f === REFS[0]) a = await reopen(a, f, T_OF[f], 1.0);
    m[f] = a;
  }
  return m;
}

/** fraction of the element's ink in y [a,b) landing on device, shifted by `dx` */
function landed(ink, mask, a, b, dx) {
  const sh = Math.round(dx / S);
  let n = 0, on = 0;
  for (let j = Math.max(0, Math.round((a - Y0) / S)); j < Math.min(MH, Math.round((b - Y0) / S)); j++) {
    for (let i = 0; i < MW; i++) {
      if (!ink[j * MW + i]) continue;
      const q = i + sh;
      if (q < 0 || q >= MW) continue;
      n++; if (mask[j * MW + q]) on++;
    }
  }
  return { n, on, pct: n ? (100 * on) / n : NaN };
}

const BANDS = [
  ['upper prongs y36-44', 36, 44],
  ['prong mid   y44-48', 44, 48],
  ['fork        y48-54', 48, 54],
  ['trunk       y54-62', 54, 62],
  ['trunk       y62-70', 62, 70],
  ['foot        y70-78', 70, 78],
  ['WHOLE       y36-78', 36, 78],
];

const mode = process.argv[2] || 'bands';

if (mode === 'bands') {
  const ink = await inkOf(NODE);
  const m = await masks();
  console.log(`NODE ${NODE} — per cent of this element's ink landing ON DEVICE, by band.`);
  console.log(`registration: pb ${REG[REFS[0]] >= 0 ? '+' : ''}${REG[REFS[0]]}, `
    + `unc ${REG[REFS[1]] >= 0 ? '+' : ''}${REG[REFS[1]]}\n`);
  console.log('  band                    sq units   proofbright    unc2005');
  for (const [name, a, b] of BANDS) {
    const p = landed(ink, m[REFS[0]], a, b, REG[REFS[0]]);
    const u = landed(ink, m[REFS[1]], a, b, REG[REFS[1]]);
    if (!p.n) continue;
    console.log(`  ${name.padEnd(22)}${(p.n * S * S).toFixed(2).padStart(8)}`
      + `${p.pct.toFixed(1).padStart(13)} %${u.pct.toFixed(1).padStart(11)} %`);
  }
  process.exit(0);
}

// ── WHERE THE REGISTRATION COMES FROM: sweep the shift, maximise trunk-on-
// device over y 62..69, which is eight rows of plain trunk with no foliage and
// no foot. Printed as a curve so its flatness is visible — a maximum 0.3 wide
// is not a registration, it is a coincidence.
if (mode === 'reg') {
  const ink = await inkOf(NODE);
  const m = await masks();
  console.log(`NODE ${NODE} — on-device %% over y 62..69 as the x shift sweeps.\n`);
  for (const f of REFS) {
    const row = [];
    for (let d = -1.5; d <= 1.5001; d += 0.25) row.push([d, landed(ink, m[f], 62, 69, d).pct]);
    const best = row.reduce((a, b) => (b[1] > a[1] ? b : a));
    console.log(`  ${short(f)}`);
    console.log('    ' + row.map(([d, p]) => `${d >= 0 ? '+' : ''}${d.toFixed(2)}:${p.toFixed(1)}`).join(' '));
    console.log(`    best ${best[0] >= 0 ? '+' : ''}${best[0].toFixed(2)} at ${best[1].toFixed(1)} %`);
  }
  process.exit(0);
}

// ── THE PICTURE: the element alone, in red, over the photograph itself.
if (mode === 'over') {
  const nums = process.argv.slice(3).filter((s) => /^-?[\d.]+$/.test(s)).map(Number);
  const [x0, x1, y0, y1, ppu] = nums.length >= 5 ? nums : [62, 74, 36, 58, 44];
  const tag = arg('--tag', 'now');
  const ink = await inkOf(NODE);
  const W = Math.round((x1 - x0) * ppu), H = Math.round((y1 - y0) * ppu);
  const out = [];
  for (const f of REFS) {
    const s = await samplerFor(f);
    const buf = Buffer.alloc(W * H * 3);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const X = x0 + i / ppu, Y = y0 + j / ppu;
      const v = Math.max(0, Math.min(255, Math.round(s.at(X, Y))));
      // our ink, moved into this file's frame
      const ii = Math.round((X - REG[f] - X0) / S), jj = Math.round((Y - Y0) / S);
      const mine = ii >= 0 && ii < MW && jj >= 0 && jj < MH && ink[jj * MW + ii];
      const k = (j * W + i) * 3;
      buf[k] = mine ? 235 : v;
      buf[k + 1] = mine ? Math.round(v * 0.25) : v;
      buf[k + 2] = mine ? Math.round(v * 0.25) : v;
    }
    for (let Xv = Math.ceil(x0); Xv <= x1; Xv++) {
      const i = Math.round((Xv - x0) * ppu); if (i < 0 || i >= W) continue;
      const maj = Xv % 5 === 0;
      for (let j = 0; j < H; j++) {
        if (!maj && j % 16 > 1) continue;
        const k = (j * W + i) * 3; buf[k] = 60; buf[k + 1] = 60; buf[k + 2] = 255;
      }
    }
    for (let Yv = Math.ceil(y0); Yv <= y1; Yv++) {
      const j = Math.round((Yv - y0) * ppu); if (j < 0 || j >= H) continue;
      const maj = Yv % 5 === 0;
      for (let i = 0; i < W; i++) {
        if (!maj && i % 16 > 1) continue;
        const k = (j * W + i) * 3; buf[k] = 60; buf[k + 1] = 200; buf[k + 2] = 60;
      }
    }
    const o = join(SCRATCH, `_dr18-over-${short(f)}-${tag}.png`);
    await sharp(buf, { raw: { width: W, height: H, channels: 3 } }).png().toFile(o);
    out.push(o.split('/').pop());
  }
  console.log(`wrote ${out.join('  ')}   x ${x0}..${x1} y ${y0}..${y1} @ ${ppu} px/unit`);
  console.log('  RED = node ' + NODE + ' at that file\'s registration; blue verticals = x, green horizontals = y');
  process.exit(0);
}

console.log('usage: node _dr18prong.mjs [bands|reg|over] [--node id] [--tag name]');
