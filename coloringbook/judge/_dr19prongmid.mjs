// DIME REVERSE — THE OUTBOARD OAK PRONG'S MIDSECTION, ROW BY ROW.
//
// Reports only (WRITERS.md). Never writes into src/.
//
// WHY THIS EXISTS. Round 40 pinned this prong's ENDPOINTS — offset 20.40 at
// y 44 (three estimators inside 0.02) and the channel wall + half width at
// y 50..53 — and then drew a SMOOTHSTEP between them, labelling the shape of
// the swing "not measured, because y 46..47 is one slab on both files". The
// owner reads the coin and says the middle is wrong: our prong "traces up the
// acorn's stem and then jumps across a blank space" to reach its end. This
// instrument measures the rows BETWEEN the endpoints instead of interpolating
// across them.
//
// WHAT IT MEASURES, and why the middle is readable after all. The claim that
// y 46..47 is unreadable is about the FORK CHANNEL — the gap between the two
// prongs, which does close there. The OUTBOARD face of the outboard prong is a
// different edge, and the bare field OUTBOARD of the prong (offsets 21..25)
// runs unbroken from y 41 to y 53 on proofbright. So on any row the prong can
// be bracketed from the outside even when its inboard side has merged with
// foliage, and on the rows where the channel is open it is bracketed on both.
//
//   `prof`  the GREY PROFILE, no mask in the path at all: field/device runs
//           straight off the photograph, row by row, on the same normalisation
//           `_dr17oakfork.mjs bare` uses. Calibrated by reproducing y 50..53,
//           where the round-38 pocket fit is trusted.
//   `run`   the FLOOD MASK's device runs on the same rows (erode 0, reopen 1.0
//           on proofbright only), which is a different estimator with a
//           different failure mode (it dilates and fuses).
//   `ours`  what `prongC`/`prongHW` actually draw on those rows, read out of
//           `coins.js` by rendering node 2.1.4 and taking its OUTBOARD
//           connected run — so it is the shipped path, not a re-evaluation of
//           the formula.
//   `table` all three side by side, in OUR frame (the file's read minus that
//           file's registration), which is the hand-back table.
//
// REGISTRATION is `_dr18prong.mjs`'s: a feature we draw at offset o appears on
// proofbright at o + 0.35 and on unc2005 at o − 0.75. Every "coin" number
// printed by `table` has already had that subtracted.
//
// ⚠️ unc2005 IS QUOTED AND NOT REASONED FROM. It is a near-line-art file whose
// strokes are thinner than the coin's relief and it lands 15..20 points lower
// on `_dr18prong.mjs bands` even on parts three rounds have verified.
//
// usage:
//   node _dr19prongmid.mjs prof  [y0 y1 [o0 o1]]
//   node _dr19prongmid.mjs run   [y0 y1 [o0 o1]]
//   node _dr19prongmid.mjs ours  [y0 y1]
//   node _dr19prongmid.mjs table [y0 y1]
import { samplerFor } from './_dr2grid.mjs';
import { deviceMask } from './_dr9branch.mjs';
import { nodes, resolve, reopen } from './_dr13elem.mjs';
import { coinSVG } from '../../src/art/coins.js';
import sharp from 'sharp';

const REFS = ['dime-rev-proofbright.png', 'dime-rev-unc2005.png'];
const T_OF = { 'dime-rev-proofbright.png': 236, 'dime-rev-unc2005.png': 190 };
const REG = { 'dime-rev-proofbright.png': 0.35, 'dime-rev-unc2005.png': -0.75 };
const X0 = 13, X1 = 87, Y0 = 17, Y1 = 85, S = 0.05;
const MW = Math.round((X1 - X0) / S), MH = Math.round((Y1 - Y0) / S);
const short = (f) => f.slice(9, -4);
const arg = (k, d) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);

const STEP = 0.05;
const X = (o) => 50 + o;
/** averaged over ±0.35 in y, the same vertical smoothing round 40's row dump used */
const sample = (at, x, y) => (at(x, y - 0.35) + at(x, y - 0.12) + at(x, y)
  + at(x, y + 0.12) + at(x, y + 0.35)) / 5;

function levels(at) {
  const field = [], solid = [];
  for (let a = 0; a < 360; a += 3) {
    const r = 43, t = (a * Math.PI) / 180;
    field.push(at(50 + r * Math.cos(t), 50 + r * Math.sin(t)));
  }
  for (let y = 40; y <= 44; y += 0.5) for (let x = 47; x <= 53; x += 0.5) solid.push(at(x, y));
  const med = (a) => a.slice().sort((p, q) => p - q)[a.length >> 1];
  return { field: med(field), solid: med(solid) };
}

const files = {};
for (const f of REFS) {
  const s = await samplerFor(f);
  const L = levels(s.at);
  files[f] = { at: s.at, L, cut: L.solid + 0.85 * (L.field - L.solid) };
}

/** merge runs of the same kind, dropping any shorter than `min` */
function runsOf(pred, o0, o1, min) {
  const out = []; let s = null;
  for (let o = o0; o <= o1 + 1e-9; o += STEP) {
    const v = pred(+o.toFixed(2));
    if (v && s === null) s = +o.toFixed(2);
    if (!v && s !== null) { if (o - s >= min) out.push([s, +(o - STEP).toFixed(2)]); s = null; }
  }
  if (s !== null && o1 - s >= min) out.push([s, o1]);
  return out;
}

const nums = process.argv.slice(3).filter((s) => /^-?[\d.]+$/.test(s)).map(Number);
const mode = process.argv[2] || 'table';
const Y_A = nums[0] ?? 41, Y_B = nums[1] ?? 55.5;
const O_A = nums[2] ?? 12, O_B = nums[3] ?? 26;
const ys = [];
for (let y = Y_A; y <= Y_B + 1e-9; y += 0.5) ys.push(+y.toFixed(2));

// ── 1. THE GREY PROFILE. No mask anywhere in this path.
function profRow(f, y) {
  const { at, cut } = files[f];
  return runsOf((o) => sample(at, X(o), y) <= cut, O_A, O_B, 0.3); // DEVICE runs
}
function bareRow(f, y) {
  const { at, cut } = files[f];
  return runsOf((o) => sample(at, X(o), y) > cut, O_A, O_B, 0.3); // FIELD runs
}

if (mode === 'prof') {
  console.log(`GREY PROFILE on the OAK, offsets ${O_A}..${O_B}, straight off the photograph.`);
  console.log('DEVICE runs (grey <= this file\'s own cut). Offsets are RAW, in the file\'s frame.\n');
  for (const f of REFS) {
    const { L, cut } = files[f];
    console.log(`  == ${short(f)}   field ${L.field.toFixed(0)}  solid ${L.solid.toFixed(0)}  device <= ${cut.toFixed(0)}`);
    for (const y of ys) {
      console.log(`   y=${String(y).padStart(5)}  `
        + profRow(f, y).map(([a, b]) => `${a.toFixed(2)}-${b.toFixed(2)}`).join('  '));
    }
    console.log('');
  }
  process.exit(0);
}

// ── 2. THE FLOOD MASK's device runs on the same rows.
async function maskRows() {
  const out = {};
  for (const f of REFS) {
    let m = await deviceMask(f, T_OF[f], 0);
    if (f === REFS[0]) m = await reopen(m, f, T_OF[f], 1.0);
    out[f] = (y) => {
      const j = Math.round((y - Y0) / S);
      return runsOf((o) => {
        const i = Math.round((X(o) - X0) / S);
        return i >= 0 && i < MW && m[j * MW + i];
      }, O_A, O_B, 0.3);
    };
  }
  return out;
}

if (mode === 'run') {
  const R = await maskRows();
  console.log(`FLOOD MASK device runs, erode 0, reopen 1.0 on proofbright only.`);
  console.log('Offsets are RAW, in the file\'s frame.\n');
  for (const f of REFS) {
    console.log(`  == ${short(f)}`);
    for (const y of ys) {
      console.log(`   y=${String(y).padStart(5)}  `
        + R[f](y).map(([a, b]) => `${a.toFixed(2)}-${b.toFixed(2)}`).join('  '));
    }
    console.log('');
  }
  process.exit(0);
}

// ── 3. WHAT WE ACTUALLY DRAW, read out of the rendered path.
const NODE = arg('--node', '2.1.4');
async function inkRows() {
  const { head, out } = nodes(coinSVG('dime', 380, { side: 'reverse' }));
  const full = Math.round(100 / S);
  const { data, info } = await sharp(Buffer.from(`${head}${resolve(head, out, NODE)}</svg>`))
    .resize(full, full, { fit: 'fill' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const ink = new Uint8Array(MW * MH);
  for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
    const p = (Math.round((Y0 + j * S) / S) * info.width + Math.round((X0 + i * S) / S)) * info.channels;
    if (data[p + info.channels - 1] > 24) ink[j * MW + i] = 1;
  }
  return (y) => {
    const j = Math.round((y - Y0) / S);
    return runsOf((o) => {
      const i = Math.round((X(o) - X0) / S);
      return i >= 0 && i < MW && ink[j * MW + i];
    }, O_A, O_B, 0.15);
  };
}

if (mode === 'ours') {
  const I = await inkRows();
  console.log(`NODE ${NODE} — our own ink runs, offsets ${O_A}..${O_B}, OUR frame.\n`);
  for (const y of ys) {
    const r = I(y);
    const last = r[r.length - 1];
    console.log(`   y=${String(y).padStart(5)}  ` + r.map(([a, b]) => `${a.toFixed(2)}-${b.toFixed(2)}`).join('  ')
      + (last ? `      outboard run centre ${(((last[0] + last[1]) / 2)).toFixed(2)} width ${(last[1] - last[0]).toFixed(2)}` : ''));
  }
  process.exit(0);
}

// ── 4. THE TABLE. Everything in OUR frame.
//
// WHICH RUN IS THE PRONG. Not "the outermost one inboard of 22" — that rule
// was tried and it locks onto the wreath's outer leaves, which are separated
// from the prong by a field channel only 0.3 units wide on some rows. The
// selection rule here is CONTINUITY and nothing else, the same rule
// `_dr17oakfork.mjs trace` states and the same one its own negative result
// warns about: seed at y 55.5, where the branch is one unambiguous mark, take
// the device run containing offset 16.5, and on each row up take the run whose
// OUTBOARD end is nearest the previous row's. It STOPS rather than guessing —
// if the nearest end has moved more than `JUMP` the walk ends and the row it
// stopped on is printed. Nothing about where the prong "should" be enters it.
const JUMP = 0.6;
function walk(rowsOf, reg, seedY, seedO) {
  const out = new Map();
  let prev = null;
  for (const y of [...ys].reverse()) {          // from the trunk upward
    if (y > seedY) continue;
    const runs = rowsOf(y);
    let pick = null;
    if (prev === null) {
      pick = runs.find((r) => r[0] <= seedO && r[1] >= seedO) ?? null;
    } else {
      for (const r of runs) {
        if (Math.abs(r[1] - prev) > JUMP) continue;
        if (!pick || Math.abs(r[1] - prev) < Math.abs(pick[1] - prev)) pick = r;
      }
    }
    if (!pick) break;
    prev = pick[1];
    out.set(y, { in: pick[0] - reg, out: pick[1] - reg, w: pick[1] - pick[0] });
  }
  return out;
}

if (mode === 'table') {
  const R = await maskRows();
  const I = await inkRows();
  const pp = walk((y) => profRow(REFS[0], y), REG[REFS[0]], 55.5, 16.5);
  const pm = walk((y) => R[REFS[0]](y), REG[REFS[0]], 55.5, 16.5);
  const up = walk((y) => profRow(REFS[1], y), REG[REFS[1]], 55.5, 15.5);
  console.log('THE OUTBOARD OAK PRONG, ROW BY ROW, IN OUR FRAME (file read minus registration).');
  console.log('pb = proofbright (reopen 1.0), unc = unc2005 (raw). "prof" = grey profile, no mask.');
  console.log('The tracked mark is the branch: below y 49.5 it carries a second mark fused on');
  console.log('its INBOARD side, so read the OUT column, which is the prong\'s own face.\n');
  console.log('     y |  pb prof in..out   w  |  pb mask in..out   w  | unc prof in..out   w  |  ours: face   c    w');
  for (const y of ys) {
    const ir = I(y); const last = ir[ir.length - 1];
    const cell = (o) => (o ? `${o.in.toFixed(2).padStart(6)}..${o.out.toFixed(2).padStart(6)} ${o.w.toFixed(2).padStart(5)}` : '        —          ');
    console.log(`  ${String(y).padStart(5)} | ${cell(pp.get(y))} | ${cell(pm.get(y))} | ${cell(up.get(y))} | `
      + (last ? `${last[1].toFixed(2).padStart(6)} ${((last[0] + last[1]) / 2).toFixed(2).padStart(6)} ${(last[1] - last[0]).toFixed(2).padStart(5)}` : '   —'));
  }
  for (const [n, m] of [['pb prof', pp], ['pb mask', pm], ['unc prof', up]]) {
    const got = [...m.keys()].sort((a, b) => a - b);
    console.log(`  ${n} tracked y ${got[0]}..${got[got.length - 1]} (${got.length} rows), then the nearest`
      + ` run moved more than ${JUMP} and the walk stopped.`);
  }
  process.exit(0);
}

console.log('usage: node _dr19prongmid.mjs [prof|run|ours|table] [y0 y1 [o0 o1]] [--node id]');
