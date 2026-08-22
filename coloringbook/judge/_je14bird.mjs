// BUCK r14 (specialist) — THE EAGLE'S PROPORTIONS, measured per wing on both
// reverse references, in viewBox units, as fractions of the roundel each bird
// sits in.
//
// Built on `_je14seg.mjs`'s band-pass (see the note there on why a grey
// threshold cannot work on this device). This file adds the two things a
// redraw needs and a whole-mask bbox cannot give:
//
//   · PER-WING components, seeded on each wing, so the background clutter
//     above the glory and below the tail cannot enter a span;
//   · the wing's ANGLE and ATTACHMENT, by fitting the crescent's outer edge.
//
// STABILITY IS THE NULL TEST HERE. The threshold is a choice, so every number
// is printed across a sweep of it; a proportion that moves with the threshold
// is reported as a range, never as a value.
//
// Nothing in this file reads `coins.js`. Every number is target-side.
//
//   node coloringbook/judge/_je14bird.mjs [--overlay]
import sharp from 'sharp';
import { segment } from './_je14seg.mjs';

const FILES = ['bill-rev.jpg', 'bill-rev-2.jpg'];
// FROZEN `_jb4target.json` per-file rims, restated (never re-fitted).
const RIM = {
  'bill-rev.jpg': { cx: 77.25, cy: 27.75, rx: 9.5, ry: 12.75 },
  'bill-rev-2.jpg': { cx: 76.5, cy: 27.75, rx: 8.25, ry: 12.0 },
};
const KS = [-8, -10, -12, -14, -16];

// A FIXED FRACTIONAL SEED WAS TRIED FIRST AND IS REJECTED. Seeding each wing at
// cx +- 0.45*rx lands inside both wings on `bill-rev.jpg` and MISSES the right
// wing on `bill-rev-2.jpg` (probed at +-0.35..0.55: the right wing there starts
// at +0.50). A seed that has to be tuned per photograph is a hand-placed
// answer. What replaces it is a SELECTION over every component, which §4.2
// requires to print the whole candidate set and throw when the choice is close.
function comps(S) {
  const { w, h, mask, X0, Y0, SP } = S;
  const id = new Int32Array(w * h).fill(-1);
  const list = [];
  for (let s = 0; s < w * h; s++) {
    if (!mask[s] || id[s] >= 0) continue;
    const k = list.length, st = [s]; id[s] = k;
    let n = 0, sx = 0, sy = 0, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    while (st.length) {
      const p = st.pop(), x = p % w, y = (p / w) | 0;
      n++; sx += x; sy += y;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const q = ny * w + nx;
        if (mask[q] && id[q] < 0) { id[q] = k; st.push(q); }
      }
    }
    list.push({ k, n, area: n * SP * SP,
      cx: X0 + (sx / n + 0.5) * SP, cy: Y0 + (sy / n + 0.5) * SP,
      x0: X0 + (x0 + 0.5) * SP, x1: X0 + (x1 + 0.5) * SP,
      y0: Y0 + (y0 + 0.5) * SP, y1: Y0 + (y1 + 0.5) * SP });
  }
  return { id, list };
}

// SELECTION (§4.2) — the wing is the largest component whose centroid is on
// that side of the rim's own centre AND which straddles the rim's mid-height
// (the glory's cloud and the tail's shadow are large too, and sit entirely
// above / below it). Prints every candidate over 1 sq unit; throws if the
// runner-up is within 40% of the winner's area.
function pickWing(S, C, side, quiet) {
  const E = S.E;
  const cand = C.list.filter((c) => c.area >= 1.0)
    .filter((c) => (side === 'left' ? c.cx < E.cx : c.cx > E.cx))
    .filter((c) => c.y0 < E.cy && c.y1 > E.cy)
    .sort((a, b) => b.area - a.area);
  if (!quiet) console.log(`    SELECT ${side} wing: ${cand.length} candidates ` +
    cand.map((c) => `[${c.area.toFixed(1)}sq @(${c.cx.toFixed(1)},${c.cy.toFixed(1)}) X${c.x0.toFixed(1)}-${c.x1.toFixed(1)} Y${c.y0.toFixed(1)}-${c.y1.toFixed(1)})]`).join(' '));
  if (!cand.length) return null;
  if (cand.length > 1 && cand[1].area > 0.6 * cand[0].area)
    throw new Error(`${side} wing: ambiguous — runner-up ${cand[1].area.toFixed(1)}sq vs winner ${cand[0].area.toFixed(1)}sq`);
  const lab = new Uint8Array(S.w * S.h);
  for (let i = 0; i < lab.length; i++) if (C.id[i] === cand[0].k) lab[i] = 1;
  return { lab, n: cand[0].n };
}

function stats(S, lab, side) {
  const { w, h, X0, Y0, SP } = S;
  const X = (i) => X0 + (i + 0.5) * SP, Y = (j) => Y0 + (j + 0.5) * SP;
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, atx0 = 0, atx1 = 0, aty0 = 0, aty1 = 0;
  const rows = [];
  for (let j = 0; j < h; j++) {
    let a = -1, b = -1;
    for (let i = 0; i < w; i++) if (lab[j * w + i]) { if (a < 0) a = i; b = i; }
    rows.push(a < 0 ? null : { Y: Y(j), x0: X(a), x1: X(b) });
    if (a < 0) continue;
    if (X(a) < x0) { x0 = X(a); aty0 = Y(j); }
    if (X(b) > x1) { x1 = X(b); aty1 = Y(j); }
    if (Y(j) < y0) { y0 = Y(j); atx0 = (X(a) + X(b)) / 2; }
    y1 = Y(j); atx1 = (X(a) + X(b)) / 2;
  }
  // the OUTER edge of the crescent, and its slope: for the left wing that is
  // x0(Y), for the right x1(Y). Fitted over the upper half of the wing only —
  // the lower half curls back under the shield and is not the leading edge.
  const pts = [];
  const yMid = (y0 + y1) / 2;
  for (const r of rows) if (r && r.Y <= yMid) pts.push([r.Y, side === 'left' ? r.x0 : r.x1]);
  let slope = NaN, ang = NaN;
  if (pts.length > 4) {
    let sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (const [a, b] of pts) { sx += a; sy += b; sxx += a * a; sxy += a * b; }
    const n = pts.length, den = n * sxx - sx * sx;
    slope = (n * sxy - sx * sy) / den;                       // dX/dY
    ang = Math.atan2(1, Math.abs(slope)) * 180 / Math.PI;    // from horizontal
  }
  return { rows, x0, x1, y0, y1, atx0, atx1, aty0, aty1, slope, ang, tip: side === 'left' ? { x: x0, y: aty0 } : { x: x1, y: aty1 } };
}

const table = [];
for (const f of FILES) for (const k of KS) {
  const S = await segment(f, k);
  const E = RIM[f];
  const C = comps(S);
  const W = {};
  for (const side of ['left', 'right']) {
    const c = pickWing(S, C, side, k !== -12);
    W[side] = c ? { ...stats(S, c.lab, side), n: c.n, area: c.n * S.SP * S.SP, lab: c.lab, S } : null;
  }
  if (!W.left || !W.right) { console.log(`${f} k${k}: no component qualified as a wing — FAILURE REPORT, not a value`); continue; }
  const span = W.right.x1 - W.left.x0;
  const topY = Math.min(W.left.y0, W.right.y0);
  const botY = Math.max(W.left.y1, W.right.y1);
  table.push({ f, k, E, W, span, topY, botY,
    spanFrac: span / (2 * E.rx), wingH: (botY - topY) / (2 * E.ry),
    tipL: W.left.tip, tipR: W.right.tip, angL: W.left.ang, angR: W.right.ang });
}

console.log('EAGLE — per-wing, both references, swept over the threshold. Fractions are of the');
console.log('roundel this bird sits in (frozen `_jb4target.json` per-file rims).');
console.log('file            k    Lwing bbox X/Y            Rwing bbox X/Y            span  /rimW   wingtop  wingbot  outer-edge angle L/R');
for (const t of table) {
  const b = (w) => `${w.x0.toFixed(2)}-${w.x1.toFixed(2)} ${w.y0.toFixed(2)}-${w.y1.toFixed(2)}`;
  console.log(`${t.f.padEnd(15)} ${String(t.k).padStart(3)}  ${b(t.W.left).padEnd(25)} ${b(t.W.right).padEnd(25)} ` +
    `${t.span.toFixed(2)} ${t.spanFrac.toFixed(4)}  ${t.topY.toFixed(2)}    ${t.botY.toFixed(2)}    ${t.angL.toFixed(1)}° / ${t.angR.toFixed(1)}°`);
}

console.log('\nSTABILITY over the threshold sweep (a proportion that moves with k is a range, not a value)');
for (const f of FILES) {
  const rows = table.filter((t) => t.f === f);
  if (!rows.length) { console.log(`  ${f.padEnd(15)} NO ROWS — failure report`); continue; }
  const rng = (g) => { const v = rows.map(g); return `${Math.min(...v).toFixed(4)}..${Math.max(...v).toFixed(4)} (med ${v.slice().sort((a, b) => a - b)[v.length >> 1].toFixed(4)})`; };
  console.log(`  ${f.padEnd(15)} span/rimW ${rng((t) => t.spanFrac)}   tipL X ${rng((t) => t.tipL.x)}   tipR X ${rng((t) => t.tipR.x)}` +
    `   tip Y ${rng((t) => t.topY)}`);
}

console.log('\nTWO-REFERENCE AGREEMENT at the sweep median (k -12)');
{
  const m = FILES.map((f) => table.find((t) => t.f === f && t.k === -12));
  const rel = (t) => ({
    tipLdx: (t.tipL.x - t.E.cx) / t.E.rx, tipRdx: (t.tipR.x - t.E.cx) / t.E.rx,
    tipLdy: (t.tipL.y - t.E.cy) / t.E.ry, tipRdy: (t.tipR.y - t.E.cy) / t.E.ry,
    topdy: (t.topY - t.E.cy) / t.E.ry, botdy: (t.botY - t.E.cy) / t.E.ry,
    spanFrac: t.spanFrac, angL: t.angL, angR: t.angR,
  });
  const A = rel(m[0]), B = rel(m[1]);
  for (const key of Object.keys(A))
    console.log(`  ${key.padEnd(9)} ${A[key].toFixed(4).padStart(9)} / ${B[key].toFixed(4).padStart(9)}   mean ${((A[key] + B[key]) / 2).toFixed(4).padStart(9)}` +
      `   spread ${Math.abs(A[key] - B[key]).toFixed(4)}`);
}

// RESPONSE TEST — dilate the mask by shifting the threshold; the span must grow.
{
  const a = table.find((t) => t.f === FILES[0] && t.k === -16);
  const b = table.find((t) => t.f === FILES[0] && t.k === -8);
  console.log(`\nRESPONSE TEST — threshold k -16 -> -8 (a strictly larger mask): span ${a.span.toFixed(2)}u -> ${b.span.toFixed(2)}u` +
    `   ${b.span > a.span ? 'GREW as expected' : '*** DID NOT MOVE — UNTRUSTED ***'}`);
}
// NULL TEST — the SHIELD is the brightest thing inside the roundel and cannot be
// massing; no selected wing component may contain the shield's centre.
{
  const t = table.find((q) => q.f === FILES[0] && q.k === -12), S = t.W.left.S, E = t.E;
  const i = Math.round((E.cx - S.X0) / S.SP - 0.5), j = Math.round((E.cy + 0.35 * E.ry - S.Y0) / S.SP - 0.5);
  const hit = t.W.left.lab === undefined ? '?' : (S.mask[j * S.w + i] ? 'IN THE MASK' : 'not in the mask');
  console.log(`NULL TEST — the shield's centre (${E.cx}, ${(E.cy + 0.35 * E.ry).toFixed(2)}) is ${hit}` +
    `   ${S.mask[j * S.w + i] ? '*** the band-pass calls the shield massing — UNTRUSTED ***' : '(correct: the shield is light and is not massing)'}`);
}

if (process.argv.includes('--overlay')) {
  const Z = 34;
  for (const f of FILES) {
    const t = table.find((q) => q.f === f && q.k === -12);
    const S = t.W.left.S, E = t.E;
    const ow = Math.round((S.X1 - S.X0) * Z), oh = Math.round((S.Y1 - S.Y0) * Z);
    const buf = Buffer.alloc(ow * oh * 3);
    let mn = 1e9, mx = -1e9;
    for (const v of S.src) { if (v < mn) mn = v; if (v > mx) mx = v; }
    for (let j = 0; j < oh; j++) for (let i = 0; i < ow; i++) {
      const si = Math.min(S.w - 1, Math.floor(i / Z / S.SP)), sj = Math.min(S.h - 1, Math.floor(j / Z / S.SP));
      const g = Math.round(255 * (S.src[sj * S.w + si] - mn) / (mx - mn));
      const k = 3 * (j * ow + i), L = t.W.left.lab[sj * S.w + si], R = t.W.right.lab[sj * S.w + si];
      if (L) { buf[k] = Math.min(255, g + 70); buf[k + 1] = g >> 1; buf[k + 2] = g >> 1; }
      else if (R) { buf[k] = g >> 1; buf[k + 1] = g >> 1; buf[k + 2] = Math.min(255, g + 70); }
      else { buf[k] = g; buf[k + 1] = g; buf[k + 2] = g; }
    }
    const put = (X, Y, c) => {
      const i = Math.round((X - S.X0) * Z), j = Math.round((Y - S.Y0) * Z);
      for (let a = -5; a <= 5; a++) for (const [p, q] of [[i + a, j], [i, j + a]]) {
        if (p < 0 || q < 0 || p >= ow || q >= oh) continue;
        const kk = 3 * (q * ow + p); buf[kk] = c[0]; buf[kk + 1] = c[1]; buf[kk + 2] = c[2];
      }
    };
    put(t.tipL.x, t.tipL.y, [0, 255, 0]); put(t.tipR.x, t.tipR.y, [0, 255, 0]);
    put(E.cx, E.cy, [255, 255, 0]);
    for (let a = 0; a < 2400; a++) {
      const th = 2 * Math.PI * a / 2400;
      const i = Math.round((E.cx + E.rx * Math.cos(th) - S.X0) * Z), j = Math.round((E.cy + E.ry * Math.sin(th) - S.Y0) * Z);
      if (i < 0 || j < 0 || i >= ow || j >= oh) continue;
      const kk = 3 * (j * ow + i); buf[kk] = 255; buf[kk + 1] = 220; buf[kk + 2] = 0;
    }
    const name = `coloringbook/judge/_je14bird-${f.replace(/\W/g, '_')}.png`;
    await sharp(buf, { raw: { width: ow, height: oh, channels: 3 } }).png().toFile(name);
    console.log(`\noverlay ${name}  ${ow}x${oh}  X ${S.X0.toFixed(2)}..${S.X1.toFixed(2)} Y ${S.Y0.toFixed(2)}..${S.Y1.toFixed(2)}` +
      `  RED = left-wing component, BLUE = right-wing component, GREEN crosses = the measured wingtips, YELLOW = the frozen rim`);
  }
}
