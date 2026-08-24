// QUARTER OBVERSE WIG — THE FIELD AS A FIELD, on a dense grid, with the
// smoothing scale chosen by LEAVE-ONE-OUT CROSS-VALIDATION.
//
// WHY THIS EXISTS AND WHAT IS NEW IN IT. `_qo5field.mjs` measured the coin's
// strand direction at FOURTEEN POINTS — our own marks' midpoints — and that was
// enough to prove the drawing wrong. It is not enough to redraw it: correcting
// fourteen marks one at a time against fourteen isolated targets is exactly the
// operation `_qo8gen.mjs` performed, and it put eight centreline crossings into
// a wig that had none, because a stack of interleaved marks turned individually
// converges. The new quantity here is the CONTINUOUS field: theta(X, Y) over the
// whole wig, from which marks can be drawn as INTEGRAL CURVES. Two integral
// curves of one single-valued field cannot cross — non-crossing stops being a
// constraint to be policed and becomes a property of the construction.
//
// THE SMOOTHING SCALE IS MEASURED, NOT CHOSEN. A raw per-node orientation field
// is far too noisy to integrate (coherence at our own mark midpoints runs
// 0.17-0.72). Regularising it needs a scale, and a scale picked by eye is a
// constant re-tuned. So: build the field from TWO references, smoothed at
// sigma S, and score it against the THIRD reference's own measured angles at
// nodes where that third reference resolves. Sweep S. The minimum of that
// leave-one-out curve is the scale at which the field is as detailed as three
// photographs can support and no more. Under-smoothing is scored by the noise
// it fails to remove; over-smoothing by the structure it destroys.
//
// The floor of that curve is also the honest error bar on the whole exercise:
// no drawing can follow this field more closely than the references follow it.
//
// ORIENTATION VECTORS, NOT ANGLES. Everything is carried as the double-angle
// vector coh*(cos 2t, sin 2t), which averages, smooths and interpolates without
// any wrap-around special case, and whose length falls to zero where the
// references disagree instead of returning a confident nonsense mean.
//
// NULL TESTS FIRST — the first four are `_qo5field.mjs`'s, re-run here because
// this file re-implements its pipeline in `_qwlib.mjs`, plus:
//   N5 THE PORT MUST REPRODUCE THE PUBLISHED INSTRUMENT. `_qo5field.mjs` is
//      executed as a child process and its fourteen coin means are parsed and
//      compared with this file's. Nothing is copied across; if the two ever
//      disagree by more than 0.05 deg this file refuses to report.
//   N6 A KNOWN CURVED FIELD MUST BE RECOVERED END TO END: a synthetic image
//      whose strands are concentric arcs of known centre is pushed through the
//      grid, the regulariser and the streamline integrator, and the integrated
//      curves must lie on the true arcs.
//
// Run: node coloringbook/judge/_qw1field.mjs
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import {
  D2R, STRUCK, tensorAt, bandpass, build, dev, cmean,
  referenceBands, ourBand, toView,
} from './_qwlib.mjs';
import { MARKS, points } from './_qo4marks.mjs';
import { coinSVG } from '../../src/art/coins.js';

const HERE = dirname(fileURLToPath(import.meta.url));

// ── the dense grid: the wig's own bounding window, in screen viewBox units
export const FX0 = 42, FY0 = 14, FX1 = 77, FY1 = 53, FSTEP = 0.5;
export const FW = Math.round((FX1 - FX0) / FSTEP) + 1, FH = Math.round((FY1 - FY0) / FSTEP) + 1;
export const fx = (i) => FX0 + i * FSTEP, fy = (j) => FY0 + j * FSTEP;

// ── the HAIR mass from the live render, flattened, in SCREEN units
const SVG = coinSVG('quarter', 380, { side: 'obverse' });
const hairM = SVG.match(/<g fill="#[0-9a-f]{6}" stroke="#[0-9a-f]{6}" stroke-width="[\d.]+" stroke-linejoin="round"><path d="(M 6\.55[^"]+)"/);
if (!hairM) throw new Error('_qw1field: could not find the hair path in the live render');
function flatten(d) {
  const toks = d.match(/[MmLlCcQqZz]|[-+]?(?:\d*\.\d+|\d+\.?)/g);
  let i = 0, cmd = '', cx = 0, cy = 0, sx = 0, sy = 0; const P = [];
  const num = () => parseFloat(toks[i++]);
  const cub = (x1, y1, x2, y2, x3, y3) => {
    for (let t = 1; t <= 16; t++) {
      const u = t / 16, v = 1 - u;
      P.push([v * v * v * cx + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * x3,
        v * v * v * cy + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * y3]);
    }
    cx = x3; cy = y3;
  };
  while (i < toks.length) {
    if (/[A-Za-z]/.test(toks[i])) cmd = toks[i++];
    if (cmd === 'M') { cx = num(); cy = num(); sx = cx; sy = cy; P.push([cx, cy]); cmd = 'L'; }
    else if (cmd === 'L') { cx = num(); cy = num(); P.push([cx, cy]); }
    else if (cmd === 'C') cub(num(), num(), num(), num(), num(), num());
    else if (cmd === 'Z' || cmd === 'z') { cx = sx; cy = sy; P.push([cx, cy]); }
    else throw new Error('_qw1field: hair path command ' + cmd);
  }
  return P;
}
export const HAIR_SCREEN = flatten(hairM[1]).map(toView);
export function insideHair([x, y], poly = HAIR_SCREEN) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}
export function hairClearance([x, y], poly = HAIR_SCREEN) {
  let best = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    const dx = xj - xi, dy = yj - yi, L2 = dx * dx + dy * dy;
    const t = L2 ? Math.max(0, Math.min(1, ((x - xi) * dx + (y - yi) * dy) / L2)) : 0;
    best = Math.min(best, Math.hypot(x - (xi + t * dx), y - (yi + t * dy)));
  }
  return (insideHair([x, y], poly) ? 1 : -1) * best;
}

// ── the wig region: inside the hair mass, and no lower than the marks reach.
// The queue and the bow are NOT wig-strand territory (`RELIEF.Washington` puts
// them in the dark group at 0.610/0.720 of the cheek) and are excluded.
export const inWig = (X, Y) => hairClearance([X, Y]) > 0.6 && Y < 50 && X > 43;

/** measure one reference on the dense grid -> Float64Array pairs (vx, vy) and coh */
export function gridOf(band, sw = 2.0) {
  const vx = new Float64Array(FW * FH), vy = new Float64Array(FW * FH), co = new Float64Array(FW * FH);
  const dg = new Float64Array(FW * FH);
  for (let j = 0; j < FH; j++) for (let i = 0; i < FW; i++) {
    const t = tensorAt(band, fx(i), fy(j), sw);
    const p = j * FW + i;
    dg[p] = t.deg; co[p] = t.coh;
    vx[p] = t.coh * Math.cos(2 * t.deg * D2R);
    vy[p] = t.coh * Math.sin(2 * t.deg * D2R);
  }
  return { vx, vy, co, dg };
}

/** Gaussian smoothing of an orientation-vector field on the dense grid */
export function smoothVec(vx, vy, sigmaUnits) {
  if (sigmaUnits <= 0) return { vx: vx.slice(), vy: vy.slice() };
  const s = sigmaUnits / FSTEP, r = Math.max(1, Math.ceil(3 * s));
  const k = []; let sum = 0;
  for (let t = -r; t <= r; t++) { const v = Math.exp(-t * t / (2 * s * s)); k.push(v); sum += v; }
  for (let t = 0; t < k.length; t++) k[t] /= sum;
  const pass = (src) => {
    const tmp = new Float64Array(FW * FH), out = new Float64Array(FW * FH);
    for (let j = 0; j < FH; j++) for (let i = 0; i < FW; i++) {
      let a = 0; for (let t = -r; t <= r; t++) a += k[t + r] * src[j * FW + Math.max(0, Math.min(FW - 1, i + t))];
      tmp[j * FW + i] = a;
    }
    for (let j = 0; j < FH; j++) for (let i = 0; i < FW; i++) {
      let a = 0; for (let t = -r; t <= r; t++) a += k[t + r] * tmp[Math.max(0, Math.min(FH - 1, j + t)) * FW + i];
      out[j * FW + i] = a;
    }
    return out;
  };
  return { vx: pass(vx), vy: pass(vy) };
}

/** bilinear sample of the orientation-vector field, returning degrees + confidence */
export function sampleField(F, X, Y) {
  const u = (X - FX0) / FSTEP, v = (Y - FY0) / FSTEP;
  const i0 = Math.max(0, Math.min(FW - 2, Math.floor(u))), j0 = Math.max(0, Math.min(FH - 2, Math.floor(v)));
  const a = Math.max(0, Math.min(1, u - i0)), b = Math.max(0, Math.min(1, v - j0));
  const at = (i, j, arr) => arr[j * FW + i];
  const bl = (arr) => (at(i0, j0, arr) * (1 - a) + at(i0 + 1, j0, arr) * a) * (1 - b)
    + (at(i0, j0 + 1, arr) * (1 - a) + at(i0 + 1, j0 + 1, arr) * a) * b;
  const X2 = bl(F.vx), Y2 = bl(F.vy);
  let d = 0.5 * Math.atan2(Y2, X2) / D2R;
  while (d > 90) d -= 180; while (d <= -90) d += 180;
  return { deg: d, conf: Math.hypot(X2, Y2) };
}

/** integrate an integral curve of the field from (X,Y), arc length `len` each way */
export function streamline(F, X, Y, backLen, fwdLen, step = 0.15) {
  const dirAt = (p, prev) => {
    const t = sampleField(F, p[0], p[1]).deg * D2R;
    let u = [Math.cos(t), Math.sin(t)];
    if (prev && u[0] * prev[0] + u[1] * prev[1] < 0) u = [-u[0], -u[1]];
    return u;
  };
  const walk = (len, sign) => {
    const out = []; let p = [X, Y], prev = dirAt([X, Y], null).map((c) => c * sign);
    for (let s = 0; s < len - 1e-9; s += step) {
      const h = Math.min(step, len - s);
      const k1 = dirAt(p, prev);
      const k2 = dirAt([p[0] + k1[0] * h / 2, p[1] + k1[1] * h / 2], k1);
      const k3 = dirAt([p[0] + k2[0] * h / 2, p[1] + k2[1] * h / 2], k2);
      const k4 = dirAt([p[0] + k3[0] * h, p[1] + k3[1] * h], k3);
      const dx = (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) / 6, dy = (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) / 6;
      const n = Math.hypot(dx, dy) || 1;
      p = [p[0] + dx / n * h, p[1] + dy / n * h];
      prev = [dx / n, dy / n];
      out.push([p[0], p[1]]);
    }
    return out;
  };
  return [...walk(backLen, -1).reverse(), [X, Y], ...walk(fwdLen, +1)];
}

// ════════════════════════════════════════════════════════════════════ MAIN
if (process.argv[1] && process.argv[1].endsWith('_qw1field.mjs')) {
  let bad = 0;
  console.log('=== NULL TESTS ===');
  const stripes = (ang, period = 1.3, amp = 40, ramp = 0) => {
    const t = ang * D2R, nx = -Math.sin(t), ny = Math.cos(t);
    return (X, Y) => 128 + amp * Math.sin(2 * Math.PI * (X * nx + Y * ny) / period) + ramp * (X - 38) / 48 * 120;
  };
  for (const want of [-70, -40, -7.3, 0, 10.9, 48, 54.1, 75]) {
    const t = tensorAt(bandpass(build(stripes(want))), 60, 35);
    const ok = Math.abs(dev(t.deg, want)) < 2 && t.coh > 0.85; if (!ok) bad++;
    console.log(`  N1 stripes ${String(want).padStart(6)} -> ${String(t.deg).padStart(6)}  coh ${t.coh}  ${ok ? 'ok' : '!! FAIL'}`);
  }
  {
    const t = tensorAt(bandpass(build(() => 137)), 60, 35);
    const ok = t.coh < 0.10; if (!ok) bad++;
    console.log(`  N2 flat -> coh ${t.coh}  ${ok ? 'ok' : '!! FAIL'}`);
    const t3 = tensorAt(bandpass(build(stripes(48, 1.3, 12, 1))), 60, 35);
    const ok3 = Math.abs(dev(t3.deg, 48)) < 3 && t3.coh > 0.8; if (!ok3) bad++;
    console.log(`  N3 stripes 48 under a 120-level ramp -> ${t3.deg}  coh ${t3.coh}  ${ok3 ? 'ok' : '!! FAIL'}`);
  }
  const OB = await ourBand(2000);
  for (const idx of [0, 3, 4, 6]) {
    const m = MARKS.find((k) => k.group.startsWith('lit') && k.i === idx);
    const t = tensorAt(OB, m.mid[0], m.mid[1], 1.1);
    const ok = Math.abs(dev(t.deg, m.deg)) < 8; if (!ok) bad++;
    console.log(`  N4 our lit[${idx}] -> ${String(t.deg).padStart(6)} vs authored chord ${String(m.deg).padStart(6)}  coh ${t.coh}  ${ok ? 'ok' : '!! FAIL'}`);
  }

  // ── the wig marks, exactly _qo5field's fourteen, from the live render
  const WIG = MARKS.filter((m) => (m.group.startsWith('grooves') || m.group.startsWith('lit'))
    && m.len >= 6 && m.mid[0] >= 41 && m.mid[0] <= 83);
  const BANDS = await referenceBands();
  const markCoin = (m) => {
    const use = [];
    for (const f of STRUCK) { const t = tensorAt(BANDS[f], m.mid[0], m.mid[1], 2.0); if (t.coh >= 0.25) use.push(t.deg); }
    if (use.length < 2) return null;
    const mean = cmean(use).deg;
    return { mean, n: use.length, worst: Math.max(...use.map((a) => Math.abs(dev(a, mean)))) };
  };

  // N5 — the port must reproduce the published instrument, parsed from its output
  {
    const txt = execFileSync(process.execPath, [HERE + '/_qo5field.mjs'], { encoding: 'utf8' });
    const pub = [];
    for (const line of txt.split('\n')) {
      const mm = line.match(/^(grooves|lit\(fie)\[(\d+)\]?\s/);
      if (!mm) continue;
      const mean = line.match(/\s(-?\d+\.\d)\s+\(n=(\d)/);
      if (mean) pub.push({ g: mm[1].startsWith('groove') ? 'grooves' : 'lit', i: +mm[2], mean: +mean[1], n: +mean[2] });
    }
    if (pub.length !== 14) { console.log(`  N5 !! parsed ${pub.length} rows from _qo5field, expected 14`); bad++; }
    let worst5 = 0;
    for (const p of pub) {
      const m = WIG.find((k) => k.group.startsWith(p.g) && k.i === p.i);
      const c = markCoin(m);
      worst5 = Math.max(worst5, Math.abs(dev(c.mean, p.mean)));
    }
    // 0.06 because _qo5field PRINTS its means to one decimal: half a printed
    // ulp is 0.05, so a tighter bound would fail on the rounding alone.
    const ok = pub.length === 14 && worst5 <= 0.06; if (!ok) bad++;
    console.log(`  N5 _qwlib reproduces _qo5field's 14 coin means, worst |diff| ${worst5.toFixed(3)} deg  ${ok ? 'ok' : '!! FAIL'}`);
  }

  // N6 — a KNOWN CURVED field, recovered through grid + regulariser + integrator
  {
    const CX = 60, CY = 70, PER = 1.3;                       // concentric arcs about (60,70)
    const arcs = (X, Y) => 128 + 45 * Math.sin(2 * Math.PI * Math.hypot(X - CX, Y - CY) / PER);
    const G = gridOf(bandpass(build(arcs)), 2.0);
    const F = smoothVec(G.vx, G.vy, 1.0);
    const seedR = Math.hypot(58 - CX, 30 - CY);
    const line = streamline(F, 58, 30, 8, 8);
    const errs = line.map(([x, y]) => Math.abs(Math.hypot(x - CX, y - CY) - seedR));
    const worst = Math.max(...errs);
    const ok = worst < 0.25; if (!ok) bad++;
    console.log(`  N6 concentric arcs r=${seedR.toFixed(2)}: integrated curve stays on the true arc to ${worst.toFixed(3)} units over 16  ${ok ? 'ok' : '!! FAIL'}`);
  }
  if (bad) { console.log(`\n!! ${bad} null tests failed — nothing reported.`); process.exit(1); }
  console.log('  all null tests pass.\n');

  // ── the dense grid, per reference
  console.log('=== dense grid ===');
  const G = {};
  for (const f of STRUCK) G[f] = gridOf(BANDS[f], 2.0);
  const nodes = [];
  for (let j = 0; j < FH; j++) for (let i = 0; i < FW; i++) if (inWig(fx(i), fy(j))) nodes.push(j * FW + i);
  console.log(`  ${FW}x${FH} nodes at ${FSTEP} viewBox units; ${nodes.length} of ${FW * FH} lie inside the wig region`);
  for (const f of STRUCK) {
    const co = nodes.map((p) => G[f].co[p]).sort((a, b) => a - b);
    console.log(`  ${f.padEnd(26)} coherence over the wig: median ${co[co.length >> 1].toFixed(3)}  q1 ${co[co.length >> 2].toFixed(3)}  frac>=0.25 ${(co.filter((c) => c >= 0.25).length / co.length * 100).toFixed(1)}%`);
  }
  // between-reference disagreement at full resolution — the irreducible floor
  {
    const ds = [];
    for (const p of nodes) {
      const use = STRUCK.filter((f) => G[f].co[p] >= 0.25).map((f) => G[f].dg[p]);
      if (use.length < 2) continue;
      const mean = cmean(use).deg;
      ds.push(Math.max(...use.map((a) => Math.abs(dev(a, mean)))));
    }
    ds.sort((a, b) => a - b);
    console.log(`  between-reference worst-deviation over ${ds.length} resolved nodes: median ${ds[ds.length >> 1].toFixed(1)} deg, p75 ${ds[Math.floor(ds.length * 0.75)].toFixed(1)}, p90 ${ds[Math.floor(ds.length * 0.9)].toFixed(1)}`);
  }

  // ── leave-one-out: which smoothing scale does the evidence support?
  console.log('\n=== leave-one-out cross-validation of the smoothing scale ===');
  console.log('  a field built from TWO references, scored against the THIRD where the third resolves');
  console.log('  sigma   ' + STRUCK.map((f) => f.replace('quarter-obv', 'q').replace(/\.(jpg|png)$/, '').padStart(14)).join('') + '      pooled median');
  const SIGS = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 8.0];
  let bestS = null, bestE = Infinity;
  for (const S of SIGS) {
    let row = `  ${S.toFixed(1).padStart(5)}   `;
    const pooled = [];
    for (const held of STRUCK) {
      const others = STRUCK.filter((f) => f !== held);
      const vx = new Float64Array(FW * FH), vy = new Float64Array(FW * FH);
      for (let p = 0; p < FW * FH; p++) for (const f of others) { vx[p] += G[f].vx[p] / others.length; vy[p] += G[f].vy[p] / others.length; }
      const F = smoothVec(vx, vy, S);
      const errs = [];
      for (const p of nodes) {
        if (G[held].co[p] < 0.25) continue;
        const i = p % FW, j = (p - i) / FW;
        errs.push(Math.abs(dev(sampleField(F, fx(i), fy(j)).deg, G[held].dg[p])));
      }
      errs.sort((a, b) => a - b);
      pooled.push(...errs);
      row += String(errs[errs.length >> 1].toFixed(1)).padStart(14);
    }
    pooled.sort((a, b) => a - b);
    const med = pooled[pooled.length >> 1];
    row += String(med.toFixed(2)).padStart(19);
    if (med < bestE) { bestE = med; bestS = S; }
    console.log(row);
  }
  console.log(`\n  the evidence supports sigma = ${bestS.toFixed(1)} viewBox units; leave-one-out median error ${bestE.toFixed(2)} deg.`);
  console.log('  NO DRAWING CAN FOLLOW THIS FIELD MORE CLOSELY THAN THAT: it is the error a');
  console.log('  perfect tracing of two references makes against the third.');

  // ── the chosen field, and what our current fourteen marks do in it
  const vx = new Float64Array(FW * FH), vy = new Float64Array(FW * FH);
  for (let p = 0; p < FW * FH; p++) for (const f of STRUCK) { vx[p] += G[f].vx[p] / STRUCK.length; vy[p] += G[f].vy[p] / STRUCK.length; }
  const FIELD = smoothVec(vx, vy, bestS);

  console.log('\n=== the regularised field at our own fourteen mark midpoints ===');
  console.log('mark          mid (screen)     ours   pointwise coin (n, spread)    regularised field   ours-field');
  const rows = [];
  for (const m of WIG) {
    const c = markCoin(m);
    const s = sampleField(FIELD, m.mid[0], m.mid[1]);
    const d = dev(m.deg, s.deg);
    rows.push({ m, field: s.deg, conf: s.conf, d, pt: c });
    console.log(`${(m.group.slice(0, 7) + '[' + m.i + ']').padEnd(12)}(${m.mid[0].toFixed(1)},${m.mid[1].toFixed(1)})`.padEnd(30)
      + `${String(m.deg).padStart(6)}   ${c ? `${c.mean.toFixed(1).padStart(6)} (n=${c.n}, ${c.worst.toFixed(1)})` : '        UNMEASURED'}`.padEnd(30)
      + `${s.deg.toFixed(1).padStart(8)} [conf ${s.conf.toFixed(3)}]   ${d.toFixed(1).padStart(7)}`);
  }
  const abs = rows.map((r) => Math.abs(r.d)).sort((a, b) => a - b);
  console.log(`\n  ours vs the regularised field: median ${abs[abs.length >> 1].toFixed(1)} deg, worst ${abs[abs.length - 1].toFixed(1)} deg`);
  console.log(`  ${rows.filter((r) => r.pt && Math.abs(r.d) > r.pt.worst).length} of ${rows.length} are out by more than the between-reference spread at that point`);

  // ── how the field runs, as a table a person can read
  console.log('\n=== the field itself, degrees, on a 4-unit lattice (blank = outside the wig) ===');
  let hdr = '   Y\\X ';
  for (let X = 44; X <= 76; X += 4) hdr += String(X).padStart(7);
  console.log(hdr);
  for (let Y = 16; Y <= 48; Y += 4) {
    let row = String(Y).padStart(5) + '  ';
    for (let X = 44; X <= 76; X += 4) {
      if (!inWig(X, Y)) { row += '      .'; continue; }
      const s = sampleField(FIELD, X, Y);
      row += `${s.deg.toFixed(0).padStart(5)}${s.conf > 0.20 ? ' ' : '?'} `;
    }
    console.log(row);
  }
  console.log("  ('?' marks a node where the references' pooled confidence is under 0.20)");
}
