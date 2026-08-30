// _dr24acorn2.mjs — THE OAK'S SECOND ACORN, AND THE ESTIMATORS THAT REACH IT.
//
// Reports only (WRITERS.md). Writes nothing but `_dr24-*.png` into the judge
// scratch directory, and only when asked. Never opens `dime-rev-2.jpg`.
//
// ── WHY THIS EXISTS, AND WHY `_dr16acorn.mjs` COULD NOT BE POINTED AT IT ────
// Round 35 isolated the FIRST acorn by a morphological opening: erode the
// device mask until the object separates, take the component nearest a seed,
// dilate back, intersect. That works because acorn 1 sits in open field below
// the fork. The SECOND acorn is embedded in the oak's foliage and the same
// method never separates it on either file — swept 0.35 → 1.00 in x 63..73
// y 38..52 the component containing the seed runs to the window's own edges at
// every radius (91.77 → 32.94 sq units on proofbright, 106.60 → 85.88 on
// unc2005). `_dr21target.mjs` says the same thing about the target: in
// x 64..74 y 38..54 the coin's whole oak crown is ONE component of 111.70 sq
// units, 82.0 % of the window. No threshold cuts this acorn out.
//
// So the flood mask cannot measure this object, and neither can any statistic
// derived from it — including ledger D38's circularity, which is the published
// discriminator between an acorn and a leaf. That is stated as a gap rather
// than worked around: see `body`, which offers a replacement discriminator
// that IS available here, and read §5 of the acorn-2 ledger in `torch()`.
//
// ── THE ESTIMATOR THAT DOES REACH IT ───────────────────────────────────────
// The object's own two walls. From a spine, walk outward one row at a time to
// the first dark relief trough and take the trough's MINIMUM — the middle of
// the boundary, not its near edge — so the number does not depend on how wide
// the bevel skirt is on that file. Same estimator on both photographs, so
// widths are comparable between the two acorns and between an acorn and a
// leaf. It is `_dr8shaft.mjs`'s idea applied to a closed object.
//
// WHAT THAT BUYS, AND IT IS THE ROUND'S NEW MEASURED QUANTITY: an acorn's wall
// pair is MONOTONE and a lobed leaf's is not. Acorn 2 widens 1.48 → 3.08 over
// ten consecutive rows with zero reversals; oak blade A1 over the same ten
// rows reverses four times (5.44, 5.38, 5.32, 5.16, 4.90, 5.02, 4.86, 5.04,
// 5.32, 4.92). Run `walls` on both and compare the columns.
//
// ── AND A REGISTRATION FINDING THAT PREDATES THIS ELEMENT ──────────────────
// Every registration number in `torch()` is a RADIAL OFFSET; y is assumed
// equal. `reg` cross-correlates the two device masks for the shift that
// maximises their agreement and finds dy is neither zero nor constant —
// unc2005 reads 0.15 low at y 35 and 0.85 low at y 66. dx comes back at the
// published -1.10, which is the control that says the method works. The
// instruments below correct unc2005's y by `DYU`; nothing in `src/art` moves.
//
// usage:
//   node _dr24acorn2.mjs reg [win;win;...]         two-file dx/dy by mask IoU
//   node _dr24acorn2.mjs walls <spine> <a0> <a1> [reach] [col]
//   node _dr24acorn2.mjs body <x> <y> [rmax] [v]   ray-cast geometry, both files
//   node _dr24acorn2.mjs fit <ref> <x> <y> [rmax] [rot0] [x,y,rot,sw,sl ...]
//   node _dr24acorn2.mjs gap <ref> [erode] [x0,x1,y0,y1] [minArea]
//   node _dr24acorn2.mjs score <element>           containment + neighbours
//   node _dr24acorn2.mjs pic <x0,x1,y0,y1,ppu> <marks> [dy]
//     marks: `box:x0,x1,y0,y1` `pt:x,y` `acorn:x,y,rot,sw,sl` joined by `;`
import sharp from 'sharp';
import { join } from 'node:path';
import { SCRATCH } from './_paths.mjs';
import { samplerFor } from './_dr2grid.mjs';
import { deviceMask, erodeBy } from './_dr9branch.mjs';
import { nodes, resolve, reopen } from './_dr13elem.mjs';
import { coinSVG } from '../../src/art/coins.js';

const X0 = 13, Y0 = 17, S = 0.05, A = S * S;
const MW = Math.round((87 - 13) / S), MH = Math.round((85 - 17) / S);
const FILE = { proofbright: 'dime-rev-proofbright.png', unc2005: 'dime-rev-unc2005.png' };
/** a feature we draw at offset o appears on this file at o + REG (`_dr18prong.mjs`) */
const REG = { proofbright: 0.35, unc2005: -0.75 };
const T_OF = { proofbright: 236, unc2005: 190 };
/** unc2005's y registration, fitted to the four windows `reg` prints */
export const DYU = (y) => 0.489 + (y - 50) * 0.0226;
/** the threshold a relief boundary must fall below to count as a wall */
const T_EDGE = { proofbright: 150, unc2005: 150 };

const mode = process.argv[2] || 'body';
const arg = (i) => process.argv[i];
const num = (i, d) => (process.argv[i] === undefined ? d : Number(process.argv[i]));

// ── the glyph `torch()` emits, so a candidate can be drawn and scored here ──
const NUT = [[0, 2.45], [-1, 1.9, -1.6, 0.9, -1.6, -0.2], [-1.6, -0.9, -0.8, -1.2, 0, -1.2],
  [0.8, -1.2, 1.6, -0.9, 1.6, -0.2], [1.6, 0.9, 1, 1.9, 0, 2.45]];
const CUP = [[-2.1, -1.15], [-2.1, -2.15, -1.1, -2.6, 0, -2.6], [1.1, -2.6, 2.1, -2.15, 2.1, -1.15],
  [2.1, -0.55, 1.1, -0.35, 0, -0.35], [-1.1, -0.35, -2.1, -0.55, -2.1, -1.15]];
const flat = (sub, step) => { const P = []; let cur = sub[0];
  for (let q = 1; q < sub.length; q++) { const [a, b, c, d, e, f] = sub[q];
    for (let u = 0; u < 1; u += step) { const w0 = (1 - u) ** 3, w1 = 3 * u * (1 - u) ** 2,
      w2 = 3 * u * u * (1 - u), w3 = u ** 3;
      P.push([w0 * cur[0] + w1 * a + w2 * c + w3 * e, w0 * cur[1] + w1 * b + w2 * d + w3 * f]); }
    cur = [e, f]; }
  return P; };
const inPoly = (P, px, py) => { let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++)
    if ((P[i][1] > py) !== (P[j][1] > py)
      && px < ((P[j][0] - P[i][0]) * (py - P[i][1])) / (P[j][1] - P[i][1]) + P[i][0]) c = !c;
  return c; };

async function grey(key) {
  const s = await samplerFor(FILE[key], 2400);
  const dy = key === 'unc2005' ? 1 : 0;
  /** grey at OUR (x, y), with this file's x AND y registration taken off */
  return (x, y, ex = 0, ey = 0) => s.at(x + REG[key] + ex, y + (dy ? DYU(y) : 0) + ey);
}
async function maskOf(key, erode) {
  let m = await deviceMask(FILE[key], T_OF[key], 0);
  if (key === 'proofbright') m = await reopen(m, FILE[key], T_OF[key], 1.0);
  return erode > 0 ? erodeBy(m, erode) : m;
}

// ══ reg ════════════════════════════════════════════════════════════════════
if (mode === 'reg') {
  const A_ = await maskOf('proofbright', 0), B = await maskOf('unc2005', 0);
  const wins = (arg(3) || '58,82,25,61;38,62,25,45;38,62,55,78;30,70,60,72')
    .split(';').map((t) => t.split(',').map(Number));
  console.log('TWO-FILE REGISTRATION by device-mask agreement. Both masks at erode 0;');
  console.log('proofbright reopened at 1.0. A point at (x, y) on proofbright is at');
  console.log('(x + dx, y + dy) on unc2005.\n');
  console.log('  window                      dx      dy     IoU');
  for (const w of wins) {
    let best = null;
    for (let dy = -2.5; dy <= 2.51; dy += 0.05) for (let dx = -2.5; dx <= 2.51; dx += 0.05) {
      let inter = 0, uni = 0;
      for (let y = w[2]; y <= w[3]; y += 0.15) for (let x = w[0]; x <= w[1]; x += 0.15) {
        const ai = Math.round((x - X0) / S), aj = Math.round((y - Y0) / S);
        const bi = Math.round((x + dx - X0) / S), bj = Math.round((y + dy - Y0) / S);
        if (bi < 0 || bj < 0 || bi >= MW || bj >= MH) continue;
        const a = A_[aj * MW + ai], b = B[bj * MW + bi];
        if (a && b) inter++; if (a || b) uni++;
      }
      const v = inter / uni;
      if (!best || v > best.v) best = { dx, dy, v };
    }
    console.log(`  x ${String(w[0]).padStart(2)}..${String(w[1]).padEnd(2)} y ${String(w[2]).padStart(2)}..${String(w[3]).padEnd(2)}`
      + `          ${best.dx.toFixed(2).padStart(5)}   ${best.dy.toFixed(2).padStart(5)}   ${best.v.toFixed(3)}`);
  }
  console.log('\n  dx reproduces the published -1.10 independently — that is the CONTROL.');
  console.log('  dy is not zero and not constant; `DYU` above is the line fitted to it.');
  process.exit(0);
}

// ══ walls ══════════════════════════════════════════════════════════════════
if (mode === 'walls') {
  const spine = num(3), a0 = num(4), a1 = num(5), REACH = num(6, 3.0);
  const cols = arg(7) === 'col';
  for (const key of Object.keys(FILE)) {
    const g = await grey(key);
    const at = (u, v) => { let a = 0, n = 0;
      for (let e = -0.05; e <= 0.051; e += 0.025) { a += cols ? g(u, v, 0, e) : g(u, v, e, 0); n++; }
      return a / n; };
    console.log(`\n=== ${key}   ${cols ? 'columns' : 'rows'}, spine ${cols ? 'y' : 'x'} = ${spine}, OUR frame`);
    console.log(`  ${cols ? 'x' : 'y'}        left wall      right wall     width  centre   (trough minima, < ${T_EDGE[key]})`);
    const prof = [];
    for (let v = a0; v <= a1 + 1e-9; v += 0.25) {
      const hit = (dir) => { let best = null;
        for (let d = 0.10; d <= REACH; d += 0.02) {
          const a = cols ? at(v, spine + dir * d) : at(spine + dir * d, v);
          if (a >= T_EDGE[key]) { if (best) break; continue; }
          if (!best || a < best[1]) best = [d, a];
        }
        return best; };
      const L = hit(-1), R = hit(1);
      const lx = L ? spine - L[0] : null, rx = R ? spine + R[0] : null;
      const w = L && R ? rx - lx : null;
      if (w) prof.push([v, w]);
      console.log(`  ${v.toFixed(2).padStart(5)}   ${L ? `${lx.toFixed(2)} (${L[1].toFixed(0)})`.padEnd(13) : '--'.padEnd(13)}`
        + `  ${R ? `${rx.toFixed(2)} (${R[1].toFixed(0)})`.padEnd(13) : '--'.padEnd(13)}`
        + `  ${w ? `${w.toFixed(2).padStart(5)}  ${((lx + rx) / 2).toFixed(2)}` : ''}`);
    }
    let rev = 0;
    for (let i = 2; i < prof.length; i++)
      if (Math.sign(prof[i][1] - prof[i - 1][1]) !== Math.sign(prof[i - 1][1] - prof[i - 2][1])) rev++;
    console.log(`  ${prof.length} rows with both walls; ${rev} REVERSALS in the width profile.`);
    console.log('  Zero reversals over a long run is a smooth closed object; a lobed leaf reverses.');
  }
  process.exit(0);
}

// ══ body ═══════════════════════════════════════════════════════════════════
/** trough-CENTRE ray cast from a seed: the boundary polygon and its moments */
export async function rayBody(key, sx, sy, RMAX = 2.6, N = 144) {
  const g = await grey(key);
  const at = (x, y) => { let a = 0, n = 0;
    for (let e = -0.06; e <= 0.061; e += 0.03) { a += g(x, y, 0, e); n++; } return a / n; };
  const T = T_EDGE[key] - 10;
  const pts = []; let miss = 0;
  for (let a = 0; a < N; a++) {
    const th = (a * 2 * Math.PI) / N, cx = Math.cos(th), cy = Math.sin(th);
    const prof = [];
    for (let d = 0.05; d <= RMAX; d += 0.02) {
      let v = 0, n = 0;
      for (let e = -0.05; e <= 0.051; e += 0.025) { v += at(sx + cx * (d + e), sy + cy * (d + e)); n++; }
      prof.push([d, v / n]);
    }
    let i = 0; while (i < prof.length && prof[i][1] >= T) i++;
    let r = RMAX;
    if (i >= prof.length) miss++;
    else { let j = i, bi = i; while (j < prof.length && prof[j][1] < T) { if (prof[j][1] < prof[bi][1]) bi = j; j++; } r = prof[bi][0]; }
    pts.push([sx + r * Math.cos(th), sy + r * Math.sin(th)]);
  }
  let ar = 0, per = 0;
  for (let i = 0; i < N; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % N];
    ar += x1 * y2 - x2 * y1; per += Math.hypot(x2 - x1, y2 - y1);
  }
  ar = Math.abs(ar / 2);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const bb = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const grid = [];
  for (let py = bb[2]; py <= bb[3]; py += 0.04) for (let px = bb[0]; px <= bb[1]; px += 0.04)
    if (inPoly(pts, px, py)) grid.push([px, py]);
  let mx = 0, my = 0; for (const [px, py] of grid) { mx += px; my += py; }
  mx /= grid.length; my /= grid.length;
  let sxx = 0, syy = 0, sxy = 0;
  for (const [px, py] of grid) { sxx += (px - mx) ** 2; syy += (py - my) ** 2; sxy += (px - mx) * (py - my); }
  const th = 0.5 * Math.atan2((2 * sxy) / grid.length, (sxx - syy) / grid.length);
  const c = Math.cos(th), s2 = Math.sin(th);
  let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9;
  for (const [px, py] of grid) {
    const u = (px - mx) * c + (py - my) * s2, v = -(px - mx) * s2 + (py - my) * c;
    u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v);
  }
  return { pts, miss, area: ar, perim: per, circ: (per * per) / (4 * Math.PI * ar),
    cx: mx, cy: my, bb, deg: ((-th * 180) / Math.PI + 360) % 180, len: u1 - u0, wid: v1 - v0 };
}
if (mode === 'body') {
  const sx = num(3), sy = num(4), RMAX = num(5, 2.6);
  for (const key of Object.keys(FILE)) {
    const b = await rayBody(key, sx, sy, RMAX);
    console.log(`\n=== ${key}  seed (${sx}, ${sy})  rmax ${RMAX}  misses ${b.miss}/144`);
    console.log(`  area ${b.area.toFixed(2)}  perim ${b.perim.toFixed(2)}  circularity P^2/4piA ${b.circ.toFixed(2)}`);
    console.log(`  centroid (${b.cx.toFixed(2)}, ${b.cy.toFixed(2)})  bbox x ${b.bb[0].toFixed(2)}..${b.bb[1].toFixed(2)} y ${b.bb[2].toFixed(2)}..${b.bb[3].toFixed(2)}`);
    console.log(`  axis ${b.deg.toFixed(1)} deg (90 = straight up)  len ${b.len.toFixed(2)} x wid ${b.wid.toFixed(2)}  len/wid ${(b.len / b.wid).toFixed(2)}`);
    if (b.miss > 3) console.log('  ⚠️ MISSES: the polygon is clipped at rmax on those bearings and its');
    console.log('     perimeter — hence its circularity — is not usable. Report the misses.');
  }
  process.exit(0);
}

// ══ fit ════════════════════════════════════════════════════════════════════
if (mode === 'fit') {
  const key = arg(3) || 'unc2005';
  const sx = num(4), sy = num(5), RMAX = num(6, 2.6), R0 = num(7, 175);
  const tgt = (await rayBody(key, sx, sy, RMAX)).pts;
  const NU = flat(NUT, 0.01), CU = flat(CUP, 0.01), GP = [];
  for (let y = -2.7; y <= 2.5; y += 0.055) for (let x = -2.2; x <= 2.2; x += 0.055)
    if (inPoly(NU, x, y) || inPoly(CU, x, y)) GP.push([x, y]);
  const G = 0.055, PAD = 1.2;
  const bx0 = Math.min(...tgt.map((p) => p[0])) - PAD, bx1 = Math.max(...tgt.map((p) => p[0])) + PAD;
  const by0 = Math.min(...tgt.map((p) => p[1])) - PAD, by1 = Math.max(...tgt.map((p) => p[1])) + PAD;
  const CW = Math.ceil((bx1 - bx0) / G), CH = Math.ceil((by1 - by0) / G);
  const tg = new Uint8Array(CW * CH); let tn = 0;
  for (let j = 0; j < CH; j++) for (let i = 0; i < CW; i++)
    if (inPoly(tgt, bx0 + i * G, by0 + j * G)) { tg[j * CW + i] = 1; tn++; }
  const seen = new Int32Array(CW * CH); let stamp = 0;
  const iou = (x, y, rot, sw, sl) => {
    const th = (rot * Math.PI) / 180, C = Math.cos(th), Sn = Math.sin(th);
    stamp++; let gn = 0, inter = 0;
    for (const [px, py] of GP) {
      const a = px * sw, b = py * sl;
      const i = Math.round((x + a * C - b * Sn - bx0) / G), j = Math.round((y + a * Sn + b * C - by0) / G);
      if (i < 0 || j < 0 || i >= CW || j >= CH) continue;
      const k = j * CW + i; if (seen[k] === stamp) continue; seen[k] = stamp;
      gn++; if (tg[k]) inter++;
    }
    return inter / (gn + tn - inter);
  };
  let best = { v: -1 };
  const sweep = (r0, r1, dr, w0, w1, dw, l0, l1, dl, a0, a1, da, b0, b1, db) => {
    for (let rot = r0; rot <= r1 + 1e-9; rot += dr) for (let sw = w0; sw <= w1 + 1e-9; sw += dw)
      for (let sl = l0; sl <= l1 + 1e-9; sl += dl) for (let x = a0; x <= a1 + 1e-9; x += da)
        for (let y = b0; y <= b1 + 1e-9; y += db) {
          const v = iou(x, y, rot, sw, sl);
          if (v > best.v) best = { v, x, y, rot, sw, sl };
        }
  };
  console.log(`target ${key} seed (${sx}, ${sy}) rmax ${RMAX}   area ${(tn * G * G).toFixed(2)} sq units`);
  sweep(R0 - 25, R0 + 25, 5, 0.45, 1.30, 0.10, 0.55, 1.35, 0.10, sx - 0.9, sx + 0.9, 0.3, sy - 1.2, sy + 1.2, 0.3);
  const b1 = { ...best };
  sweep(b1.rot - 5, b1.rot + 5, 1, b1.sw - 0.10, b1.sw + 0.10, 0.02, b1.sl - 0.10, b1.sl + 0.10, 0.02,
    b1.x - 0.3, b1.x + 0.3, 0.05, b1.y - 0.3, b1.y + 0.3, 0.05);
  console.log(`  unconstrained best IoU ${best.v.toFixed(3)} at (${best.x.toFixed(2)}, ${best.y.toFixed(2)}) `
    + `rot ${best.rot} sw ${best.sw.toFixed(2)} sl ${best.sl.toFixed(2)}`);
  for (const a of process.argv.slice(8)) {
    const [x, y, rot, sw, sl] = a.split(',').map(Number);
    console.log(`  candidate (${x}, ${y}) rot ${rot} sw ${sw} sl ${sl}  ->  IoU ${iou(x, y, rot, sw, sl).toFixed(3)}`);
  }
  console.log('  ⚠️ This target is the OUTLINE-CENTRE silhouette; the shipped acorn 1 was');
  console.log('  fitted to an opened FLOOD MASK body, which carries the bevel skirt. Run');
  console.log('  `fit unc2005 58.8 57.7` for the calibration that quantifies the difference.');
  process.exit(0);
}

// ── our ink, node by node ──────────────────────────────────────────────────
const full = Math.round(100 / S);
const { head, out } = nodes(coinSVG('dime', 380, { side: 'reverse' }));
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
const IDS = { stem: '2.1.4', acorn1: '2.1.20', acorn2: '2.1.21' };
NAMES.forEach((n, i) => { IDS[n] = `2.1.${5 + 2 * i}`; if (i) IDS[`${n}-stalk`] = `2.1.${4 + 2 * i}`; });

// ══ gap ════════════════════════════════════════════════════════════════════
if (mode === 'gap') {
  const key = arg(3) || 'proofbright';
  const ero = num(4, key === 'proofbright' ? 0.55 : 0.37);
  const win = (arg(5) || '63,73,39,50').split(',').map(Number);
  const minA = num(6, 0.5);
  const ours = new Uint8Array(MW * MH);
  for (const id of ['2.1', '2.2', '4', '5', '6']) {
    const v = await inkOf(id); for (let i = 0; i < ours.length; i++) if (v[i]) ours[i] = 1;
  }
  const m = await maskOf(key, ero);
  const useDY = key === 'unc2005';
  const gap = new Uint8Array(MW * MH);
  for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
    if (!m[j * MW + i]) continue;
    const x = X0 + i * S, y = Y0 + j * S;
    const oi = Math.round((x - REG[key] - X0) / S);
    const oj = Math.round(((useDY ? y - DYU(y) : y) - Y0) / S);
    if (oi < 0 || oj < 0 || oi >= MW || oj >= MH || !ours[oj * MW + oi]) gap[j * MW + i] = 1;
  }
  const w = [win[0] + REG[key], win[1] + REG[key],
    win[2] + (useDY ? DYU(win[2]) : 0), win[3] + (useDY ? DYU(win[3]) : 0)];
  const inW = (i, j) => { const x = X0 + i * S, y = Y0 + j * S;
    return x >= w[0] && x <= w[1] && y >= w[2] && y <= w[3]; };
  const seen = new Uint8Array(MW * MH); const res = [];
  for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
    const k = j * MW + i; if (!gap[k] || seen[k] || !inW(i, j)) continue;
    const st = [k]; seen[k] = 1; const P = [];
    while (st.length) { const c = st.pop(); P.push(c);
      for (const d of [1, -1, MW, -MW]) { const mm = c + d; if (mm < 0 || mm >= MW * MH) continue;
        const mi = mm % MW, mj = (mm - mi) / MW;
        if (gap[mm] && !seen[mm] && inW(mi, mj)) { seen[mm] = 1; st.push(mm); } } }
    const a = P.length * A; if (a < minA) continue;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, sx = 0, sy = 0;
    for (const c of P) { const ci = c % MW; const x = X0 + ci * S - REG[key];
      let y = Y0 + ((c - ci) / MW) * S; if (useDY) y -= DYU(y);
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); sx += x; sy += y; }
    res.push({ a, cx: sx / P.length, cy: sy / P.length, x0, x1, y0, y1 });
  }
  res.sort((p, q) => q.a - p.a);
  console.log(`${key}  erode ${ero}   window (OUR frame) x ${win[0]}..${win[1]} y ${win[2]}..${win[3]}`);
  console.log('  THE COIN\'S DEVICE MINUS ALL OUR DEVICE INK, by component, in OUR frame:');
  for (const r of res) console.log(`    area ${r.a.toFixed(2).padStart(6)}  centroid (${r.cx.toFixed(2)}, ${r.cy.toFixed(2)})`
    + `  x ${r.x0.toFixed(2)}..${r.x1.toFixed(2)}  y ${r.y0.toFixed(2)}..${r.y1.toFixed(2)}`);
  if (!res.length) console.log('    (nothing at or above the minimum)');
  process.exit(0);
}

// ══ score ══════════════════════════════════════════════════════════════════
if (mode === 'score') {
  const target = arg(3) || 'acorn2';
  const ink = {}; for (const k of Object.keys(IDS)) ink[k] = await inkOf(IDS[k]);
  const me = ink[target];
  if (!me) { console.log(`unknown element. one of: ${Object.keys(IDS).join(' ')}`); process.exit(1); }
  let n = 0, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, cx = 0, cy = 0;
  for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) if (me[j * MW + i]) {
    const x = X0 + i * S, y = Y0 + j * S; n++; cx += x; cy += y;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  console.log(`${target} = node ${IDS[target]}   ink ${(n * A).toFixed(2)} sq units  `
    + `bbox x ${x0.toFixed(2)}..${x1.toFixed(2)} y ${y0.toFixed(2)}..${y1.toFixed(2)}  centroid (${(cx / n).toFixed(2)}, ${(cy / n).toFixed(2)})`);
  console.log('\n  CONTAINMENT — the share of our own ink that is NOT on the coin\'s device.');
  console.log('  unc2005 is quoted at its MEASURED rise distance 0.37 as well as at the');
  console.log('  shared constant 1.00; 85 % of the two files\' disagreement is that constant.');
  for (const [key, eros] of [['proofbright', [0, 0.55]], ['unc2005', [0, 0.37, 1.00]]]) {
    const base = await maskOf(key, 0);
    for (const e of eros) {
      const m = e > 0 ? erodeBy(base, e) : base;
      let outside = 0;
      for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
        if (!me[j * MW + i]) continue;
        const mi = i + Math.round(REG[key] / S);
        if (mi < 0 || mi >= MW || !m[j * MW + mi]) outside++;
      }
      console.log(`    ${key.padEnd(12)} erode ${e.toFixed(2)}   OUTSIDE ${(100 * outside / n).toFixed(2)} %  (${(outside * A).toFixed(2)} sq units)`);
    }
  }
  console.log('\n  OVERLAP with every neighbour, as a share of this element\'s own ink.');
  console.log('  A LOW OUTSIDE IS NOT A PASS: an element scores ~0 % by hiding under one.');
  let any = false;
  for (const k of Object.keys(IDS)) {
    if (k === target) continue;
    let o = 0; for (let i = 0; i < me.length; i++) if (me[i] && ink[k][i]) o++;
    if (o) { any = true; console.log(`    ${k.padEnd(10)} ${(100 * o / n).toFixed(2)} %  (${(o * A).toFixed(2)} sq units)`); }
  }
  if (!any) console.log('    NONE — this element touches no other drawn mark.');
  process.exit(0);
}

// ══ pic ════════════════════════════════════════════════════════════════════
if (mode === 'pic') {
  const [px0, px1, py0, py1, ppu] = (arg(3) || '64.5,71,40.5,49.5,150').split(',').map(Number);
  const marks = (arg(4) || '').split(';').filter(Boolean);
  const useDY = arg(5) === 'dy';
  for (const key of [...Object.keys(FILE), 'ours']) {
    const s = await samplerFor(key === 'ours' ? 'ours' : FILE[key], 2400);
    const rx = key === 'ours' ? 0 : REG[key];
    const dy = useDY && key === 'unc2005' ? DYU((py0 + py1) / 2) : 0;
    const W = Math.round((px1 - px0) * ppu), H = Math.round((py1 - py0) * ppu);
    const buf = Buffer.alloc(W * H * 3);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const v = Math.max(0, Math.min(255, Math.round(s.at(px0 + i / ppu + rx, py0 + j / ppu + dy))));
      const k = (j * W + i) * 3; buf[k] = buf[k + 1] = buf[k + 2] = v;
    }
    const put = (x, y, c) => {
      const i = Math.round((x - px0) * ppu), j = Math.round((y - py0) * ppu);
      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
        const ii = i + a, jj = j + b; if (ii < 0 || jj < 0 || ii >= W || jj >= H) continue;
        const k = (jj * W + ii) * 3; buf[k] = c[0]; buf[k + 1] = c[1]; buf[k + 2] = c[2];
      }
    };
    for (let X = Math.ceil(px0); X <= px1; X++) { const i = Math.round((X - px0) * ppu); if (i < 0 || i >= W) continue;
      for (let j = 0; j < H; j++) { if (X % 5 && j % 14 > 1) continue;
        const k = (j * W + i) * 3; buf[k] = 255; buf[k + 1] = X % 5 ? 170 : 0; buf[k + 2] = X % 5 ? 170 : 0; } }
    for (let Y = Math.ceil(py0); Y <= py1; Y++) { const j = Math.round((Y - py0) * ppu); if (j < 0 || j >= H) continue;
      for (let i = 0; i < W; i++) { if (Y % 5 && i % 14 > 1) continue;
        const k = (j * W + i) * 3; buf[k] = Y % 5 ? 80 : 0; buf[k + 1] = Y % 5 ? 255 : 200; buf[k + 2] = 255; } }
    for (const m of marks) {
      const [t, rest] = m.split(':'); const v = rest.split(',').map(Number);
      if (t === 'box') { for (let x = v[0]; x <= v[1]; x += 0.01) { put(x, v[2], [0, 255, 0]); put(x, v[3], [0, 255, 0]); }
        for (let y = v[2]; y <= v[3]; y += 0.01) { put(v[0], y, [0, 255, 0]); put(v[1], y, [0, 255, 0]); } }
      if (t === 'pt') for (let a = 0; a < 6.2832; a += 0.01) put(v[0] + 0.25 * Math.cos(a), v[1] + 0.25 * Math.sin(a), [255, 140, 0]);
      if (t === 'acorn') {
        const th = (v[2] * Math.PI) / 180, C = Math.cos(th), Sn = Math.sin(th);
        for (const sub of [NUT, CUP]) for (const [ax, ay] of flat(sub, 0.004))
          put(v[0] + ax * v[3] * C - ay * v[4] * Sn, v[1] + ax * v[3] * Sn + ay * v[4] * C, [255, 0, 255]);
      }
    }
    const o = `_dr24-pic-${key}.png`;
    await sharp(buf, { raw: { width: W, height: H, channels: 3 } }).png().toFile(join(SCRATCH, o));
    console.log(`  ${key.padEnd(12)} -> ${o}  ${W}x${H}  x ${px0}..${px1} y ${py0}..${py1} @ ${ppu}px/unit`
      + `  (sampled at this file's registration${dy ? `, y ${dy.toFixed(2)}` : ''})`);
  }
  console.log('  magenta = the ACORN glyph as `torch()` would emit it; green = a box; orange = a point.');
  process.exit(0);
}

console.log('usage: node _dr24acorn2.mjs [reg|walls|body|fit|gap|score|pic] ...  (see the header)');
