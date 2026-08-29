// DIME REVERSE — THE TWO PRONGS' WIDTHS, AND THE PICTURE THAT SHOWS THEM.
//
// Reports only (WRITERS.md). Never writes into src/.
//
// WHY THIS EXISTS. Round 41 settled the outboard prong's PATH — its outboard
// face is a straight line, `17.325 + 0.4618·(54.7 − y)`, RMS 0.046 over
// fifteen rows — and the owner confirms it: "the path of the right branch is
// very good ... it is well lined up on its right side, but overflows the left
// side. The left branch path is improved, but has similar issues." That is a
// statement about ONE FACE of each prong, so a width table cannot answer it.
// This instrument reports FACES, not widths, and draws the picture.
//
//   `over`   OUR ink for a node, in RED, composited on each photograph AT
//            THAT FILE'S OWN REGISTRATION (pb +0.35, unc −0.75). Red where we
//            draw, the photograph underneath everywhere else. This is the
//            gate: a face that is off by 0.4 is visible, a width table is not.
//   `faces`  BOTH faces of BOTH prongs, row by row, coin vs drawn, on three
//            independent estimators. Never a width without the two faces that
//            make it.
//   `hm`     the HALF-MAX edge of every 237-cut run, on both photographs AND
//            on our own render through the IDENTICAL code. This is the width
//            table of record; the ledger above `halfMax` says why.
//   `iso`    WHICH ROWS ARE HONEST. For each row it states whether the mark
//            has open field on its inboard side, on its outboard side, or
//            both — because a face measured against a fused neighbour is the
//            union's face, which is ledger E25.
//
// THE THREE ESTIMATORS, all of which already exist in this directory and none
// of which is new here:
//   prof  the GREY PROFILE, no mask in the path (`_dr19prongmid.mjs`'s), a
//         run of grey <= solid + 0.85·(field − solid), averaged over ±0.35 y.
//   mask  the FLOOD MASK at erode 0, reopen 1.0 on proofbright only.
//   dark  the DARK RELIEF OUTLINE: the local minima of the grey profile, which
//         are the shadow valleys at a raised mark's edges. On a proof
//         photograph a branch is a BRIGHT top between two DARK valleys, and
//         the valley centres bracket the mark independently of any threshold.
//
// ⚠️ unc2005 IS QUOTED AND NOT REASONED FROM (`_dr19prongmid.mjs`'s warning):
// its strokes are thinner than the coin's relief and it sits 0.15..0.25
// outboard even where three rounds have agreed.
//
// usage:
//   node _dr20prongwidth.mjs over  [x0 x1 y0 y1 [ppu]] [--node 2.1.4]
//                                  [--edge] [--edges] [--tag NAME]
//   node _dr20prongwidth.mjs faces [y0 y1]
//   node _dr20prongwidth.mjs hm    [y0 y1 [o0 o1]]
//   node _dr20prongwidth.mjs iso   [y0 y1]
import { samplerFor } from './_dr2grid.mjs';
import { deviceMask } from './_dr9branch.mjs';
import { nodes, resolve, reopen } from './_dr13elem.mjs';
import { coinSVG } from '../../src/art/coins.js';
import sharp from 'sharp';
import { join } from 'node:path';
import { SCRATCH } from './_paths.mjs';

const REFS = ['dime-rev-proofbright.png', 'dime-rev-unc2005.png'];
const T_OF = { 'dime-rev-proofbright.png': 236, 'dime-rev-unc2005.png': 190 };
/** a feature we draw at offset o appears on this file at o + REG (`_dr18prong.mjs`) */
const REG = { 'dime-rev-proofbright.png': 0.35, 'dime-rev-unc2005.png': -0.75 };
const X0 = 13, X1 = 87, Y0 = 17, Y1 = 85, S = 0.05;
const MW = Math.round((X1 - X0) / S), MH = Math.round((Y1 - Y0) / S);
const short = (f) => f.slice(9, -4);
const STEP = 0.05;
const X = (o) => 50 + o;
const arg = (k, d) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);
const mode = process.argv[2] || 'faces';
const nums = process.argv.slice(3).filter((s) => /^-?[\d.]+$/.test(s)).map(Number);

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
for (const f of [...REFS, 'ours']) {
  const s = await samplerFor(f);
  const L = levels(s.at);
  files[f] = { at: s.at, L, cut: L.solid + 0.85 * (L.field - L.solid) };
}

// ── OUR INK, from the shipped path.
async function inkOf(node) {
  const { head, out } = nodes(coinSVG('dime', 380, { side: 'reverse' }));
  const full = Math.round(100 / S);
  const { data, info } = await sharp(Buffer.from(`${head}${resolve(head, out, node)}</svg>`))
    .resize(full, full, { fit: 'fill' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const ink = new Uint8Array(MW * MH);
  for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
    const p = (Math.round((Y0 + j * S) / S) * info.width + Math.round((X0 + i * S) / S)) * info.channels;
    if (data[p + info.channels - 1] > 24) ink[j * MW + i] = 1;
  }
  return ink;
}

// ── 2. THE ESTIMATORS, on one row, over one offset window.
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
const profRow = (f, y, a, b) => runsOf((o) => sample(files[f].at, X(o), y) <= files[f].cut, a, b, 0.3);
const fieldRow = (f, y, a, b) => runsOf((o) => sample(files[f].at, X(o), y) > files[f].cut, a, b, 0.3);

// ── 1. THE PICTURE. Our ink in red ON the photograph, at the file's own
// registration. Nothing is thresholded and nothing is fitted here.
if (mode === 'over') {
  const [x0, x1, y0, y1, ppu] = nums.length >= 4
    ? [nums[0], nums[1], nums[2], nums[3], nums[4] ?? 70] : [62, 76, 40, 58, 70];
  const node = arg('--node', '2.1.4');
  const tag = arg('--tag', 'now');
  const EDGE = process.argv.includes('--edge');
  const ink = await inkOf(node);
  const W = Math.round((x1 - x0) * ppu), H = Math.round((y1 - y0) * ppu);
  for (const f of REFS) {
    const { at } = files[f];
    const r = REG[f];
    const buf = Buffer.alloc(W * H * 3);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const x = x0 + i / ppu, y = y0 + j / ppu;
      const v = Math.max(0, Math.min(255, Math.round(at(x, y))));
      // our ink lives at offset o; on this file that offset sits at o + r
      const ii = Math.round(((x - r) - X0) / S), jj = Math.round((y - Y0) / S);
      const get = (a, b) => (a >= 0 && a < MW && b >= 0 && b < MH ? ink[b * MW + a] : 0);
      let on = get(ii, jj);
      // OUTLINE ONLY: the photograph must be visible UNDER the edge, because
      // "overflows the left side" is a statement about what the edge sits on.
      if (on && EDGE) {
        on = 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!get(ii + dx, jj + dy)) on = 1;
      }
      const k = (j * W + i) * 3;
      buf[k] = on ? Math.round(120 + v * 0.53) : v;
      buf[k + 1] = on ? Math.round(v * 0.30) : v;
      buf[k + 2] = on ? Math.round(v * 0.30) : v;
    }
    // GREEN: this file's OWN edges, by the same 237-cut grey profile that
    // fitted the approved outboard face. Every device-run boundary in the
    // window, so nothing is selected for us.
    if (process.argv.includes('--edges')) {
      for (let j = 0; j < H; j++) {
        const y = y0 + j / ppu;
        for (const [a, b] of profRow(f, +y.toFixed(2), x0 - 50, x1 - 50)) {
          for (const o of [a, b]) {
            const i = Math.round((o + 50 - x0) * ppu);
            if (i < 0 || i >= W) continue;
            const k = (j * W + i) * 3; buf[k] = 0; buf[k + 1] = 190; buf[k + 2] = 40;
          }
        }
      }
    }
    for (let Xv = Math.ceil(x0); Xv <= x1; Xv++) {
      const i = Math.round((Xv - x0) * ppu); if (i < 0 || i >= W) continue;
      const maj = Xv % 5 === 0;
      for (let j = 0; j < H; j++) {
        if (!maj && j % 20 > 1) continue;
        const k = (j * W + i) * 3; buf[k] = 0; buf[k + 1] = maj ? 90 : 190; buf[k + 2] = 255;
      }
    }
    for (let Yv = Math.ceil(y0); Yv <= y1; Yv++) {
      const j = Math.round((Yv - y0) * ppu); if (j < 0 || j >= H) continue;
      const maj = Yv % 5 === 0;
      for (let i = 0; i < W; i++) {
        if (!maj && i % 20 > 1) continue;
        const k = (j * W + i) * 3; buf[k] = 0; buf[k + 1] = maj ? 90 : 190; buf[k + 2] = 255;
      }
    }
    const o = `_dr20-over-${tag}-${short(f)}-${node.replace(/\./g, '_')}.png`;
    await sharp(buf, { raw: { width: W, height: H, channels: 3 } }).png().toFile(join(SCRATCH, o));
    console.log(`  ${short(f).padEnd(12)} -> ${o}  ${W}x${H}  x ${x0}..${x1} y ${y0}..${y1} @ ${ppu}px/unit`
      + `  (our ink shifted +${r.toFixed(2)} into this file's frame)`);
  }
  console.log('  RED = node ' + node + '. Blue gridlines are viewBox units, solid every 5.');
  process.exit(0);
}

/** THE DARK RELIEF OUTLINE: shadow valleys, as local minima of the grey
 *  profile that fall at least `DEPTH` below the field level. Threshold-free in
 *  the sense that matters — moving the field/device cut does not move a
 *  minimum. Returns valley CENTRES (the mean offset of the run at or below
 *  min + 12), which is where the mark's edge is. */
const DEPTH = 55;
function valleys(f, y, a, b) {
  const { at, L } = files[f];
  const v = []; for (let o = a; o <= b + 1e-9; o += STEP) v.push([+o.toFixed(2), sample(at, X(o), y)]);
  const out = [];
  let i = 0;
  while (i < v.length) {
    if (v[i][1] > L.field - DEPTH) { i++; continue; }
    let j = i; while (j + 1 < v.length && v[j + 1][1] <= L.field - DEPTH) j++;
    let lo = Infinity; for (let k = i; k <= j; k++) lo = Math.min(lo, v[k][1]);
    let s = 0, n = 0;
    for (let k = i; k <= j; k++) if (v[k][1] <= lo + 12) { s += v[k][0]; n++; }
    out.push(+(s / n).toFixed(2));
    i = j + 1;
  }
  return out;
}


// ── 3. THE HALF-MAX EDGE, which is the one edge definition our ACCEPTED
// drawing already matches.
//
// THE CALIBRATION, because an edge definition cannot be chosen by taste. The
// OAK TRUNK at y 62..69 was fitted in round 39, is drawn 2.15 wide, and the
// owner has not called it thick. On proofbright at y 68 the same row reads:
//
//     237-cut footprint  14.78..17.35   2.57      ours 15.10..17.25   2.15
//     HALF-MAX           14.93..17.25   2.32      (outboard face EXACT)
//     valley-to-valley   15.10..16.95   1.85      (inboard  face EXACT)
//
// Our accepted trunk is 0.17 inside half-max, 0.42 inside the 237-cut and
// 0.30 outside valley-to-valley. HALF-MAX IS THE ONE THE ACCEPTED DRAWING
// MATCHES, so it is the standard this instrument reports widths in. It is
// also the only one of the three that can be run UNCHANGED on our own render
// (whose profile is a step, so its half-max IS its path), which is what makes
// the coin column and the ours column comparable at all.
//
// ⚠️ THE FACES ARE STILL THE 237-CUT'S. `PFACE` — the approved outboard face —
// was fitted on the 237-cut and the owner says it is right; half-max would
// move it 0.15 inboard, which is the path, which this round does not touch.
// So widths come from here and the face stays where it is, and the drawn
// prong therefore sits ~0.15 outboard of its half-max position on BOTH faces.
// That is a stated, uniform, one-decision bias, not a fit.
const REACH_OUT = 1.0, REACH_IN = 0.8;
function halfMax(f, y, e, dir) {          // dir = -1 refine an inboard end
  const { at } = files[f];
  const g = (o) => sample(at, X(o), y);
  let F = -Infinity, V = Infinity;
  for (let d = 0; d <= REACH_OUT + 1e-9; d += STEP) F = Math.max(F, g(e + dir * d));
  for (let d = 0; d <= REACH_IN + 1e-9; d += STEP) V = Math.min(V, g(e - dir * d));
  const half = (F + V) / 2;
  let best = e, bd = Infinity;
  for (let d = -REACH_IN; d <= REACH_OUT + 1e-9; d += STEP) {
    const o = e + dir * d, a = g(o), b = g(o + dir * STEP);
    if ((a - half) * (b - half) <= 0 && Math.abs(d) < bd) { bd = Math.abs(d); best = o; }
  }
  return +best.toFixed(2);
}

const Y_A = nums[0] ?? 43, Y_B = nums[1] ?? 55;
const ys = []; for (let y = Y_A; y <= Y_B + 1e-9; y += 0.5) ys.push(+y.toFixed(2));


if (mode === 'hm') {
  const O_A = nums[2] ?? 12, O_B = nums[3] ?? 24;
  console.log('HALF-MAX EDGES of every 237-cut device run, RAW offsets in each file\'s own frame.');
  console.log('"ours" is our render put through the IDENTICAL code, then shifted into that frame.\n');
  for (const f of [...REFS, 'ours']) {
    const src = f === 'ours' ? REFS[0] : f;
    const reg = f === 'ours' ? 0 : REG[f];
    console.log(`  == ${f === 'ours' ? 'OURS (our own frame)' : short(f)}`);
    for (const y of ys) {
      const runs = profRow(f === 'ours' ? 'ours' : f, y, O_A - (f === 'ours' ? reg : 0), O_B);
      console.log(`   y=${String(y).padStart(5)}  `
        + runs.map(([a, b]) => {
          const A = halfMax(f === 'ours' ? 'ours' : f, y, a, -1);
          const B = halfMax(f === 'ours' ? 'ours' : f, y, b, +1);
          return `${A.toFixed(2)}-${B.toFixed(2)}(${(B - A).toFixed(2)})`;
        }).join('  '));
    }
    console.log('');
  }
  process.exit(0);
}

if (mode === 'iso') {
  const O_A = 12, O_B = 26;
  console.log('IS THE ROW HONEST? Field runs (>= 0.3 units wide) around the oak, RAW offsets.');
  console.log('A face with no field beside it is the UNION\'s face, not the mark\'s (ledger E25).\n');
  for (const f of REFS) {
    console.log(`  == ${short(f)}   registration ${REG[f] > 0 ? '+' : ''}${REG[f]}`);
    for (const y of ys) {
      console.log(`   y=${String(y).padStart(5)}  FIELD  `
        + fieldRow(f, y, O_A, O_B).map(([a, b]) => `${a.toFixed(2)}-${b.toFixed(2)}`).join('  '));
    }
    console.log('');
  }
  process.exit(0);
}

if (mode === 'faces') {
  const O_A = 12, O_B = 26;
  const M = {};
  for (const f of REFS) {
    let m = await deviceMask(f, T_OF[f], 0);
    if (f === REFS[0]) m = await reopen(m, f, T_OF[f], 1.0);
    M[f] = (y, a, b) => runsOf((o) => {
      const i = Math.round((X(o) - X0) / S), j = Math.round((y - Y0) / S);
      return i >= 0 && i < MW && m[j * MW + i];
    }, a, b, 0.3);
  }
  const ink = await inkOf(arg('--node', '2.1.4'));
  const inkRow = (y, a, b) => runsOf((o) => {
    const i = Math.round((X(o) - X0) / S), j = Math.round((y - Y0) / S);
    return i >= 0 && i < MW && ink[j * MW + i];
  }, a, b, 0.15);

  console.log('EVERY ESTIMATOR, EVERY ROW, RAW OFFSETS IN EACH FILE\'S OWN FRAME.');
  console.log('Ours is printed twice: OUR frame, and shifted into each file\'s frame.\n');
  for (const f of REFS) {
    console.log(`  ================ ${short(f)}   (our offset o appears here at o ${REG[f] > 0 ? '+' : '−'} ${Math.abs(REG[f])})`);
    console.log('     y | prof runs                          | mask runs                    | dark valleys');
    for (const y of ys) {
      const p = profRow(f, y, O_A, O_B).map(([a, b]) => `${a.toFixed(2)}-${b.toFixed(2)}`).join(' ');
      const m = M[f](y, O_A, O_B).map(([a, b]) => `${a.toFixed(2)}-${b.toFixed(2)}`).join(' ');
      const d = valleys(f, y, O_A, O_B).map((o) => o.toFixed(2)).join(' ');
      console.log(`  ${String(y).padStart(5)} | ${p.padEnd(34)} | ${m.padEnd(28)} | ${d}`);
    }
    console.log('    ours, shifted into this frame:');
    for (const y of ys) {
      console.log(`  ${String(y).padStart(5)} | `
        + inkRow(y, O_A - REG[f], O_B - REG[f])
          .map(([a, b]) => `${(a + REG[f]).toFixed(2)}-${(b + REG[f]).toFixed(2)}`).join(' '));
    }
    console.log('');
  }
  process.exit(0);
}

console.log('usage: node _dr20prongwidth.mjs [over|hm|faces|iso] ...');
