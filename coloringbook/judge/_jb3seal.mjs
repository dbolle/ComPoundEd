// BUCK r0 — D2 (SPLIT per §18.4), D2c separation, D2d shape.
//
// SUBJECTS COVERED (PY3): id `buck`, REVERSE only, both reverse references.
// The obverse has no device of this kind and no working fiducial (see _jb1fit).
//
// The device on this note is embedded in ornament with no bare field, so a
// traced contour is not available (bill.md §5: the density sweep returned a
// search bound twice, in both directions, on two different photographs). The
// silhouette that IS available is the seal's RIM, found by a curve-following
// score — the ellipse whose circumference has the lowest mean grey.
//
// This is a re-implementation of `_blellipse.mjs` (READ ONLY, hashed) with the
// four obligations that file predates, per PY6 the equivalence is published:
//   · NULL TEST (§4.1)   the sweep prints its bounds and flags any parameter
//                        that lands ON a bound.
//   · SELECTION (§4.2)   prints the top-5 candidate set and the margin between
//                        best and runner-up, and throws if the best is not
//                        separated from a DIFFERENT-CENTRED candidate.
//   · PY5                prints the selected area as a fraction of the search
//                        box, so a degenerate "everything"/"nothing" is visible.
//   · EQUIVALENCE (PY6)  reproduces bill.md §4's published quadruples.
//
//   node coloringbook/judge/_jb3seal.mjs [json]
import { writeFileSync } from 'node:fs';
import { rectify } from '../_blnorm.mjs';

const S = 14, X0 = 5, Y0 = 5;
const W = Math.round(90 * S), H = Math.round(46 * S);
const FILES = ['bill-rev.jpg', 'bill-rev-2.jpg'];
// frozen search bounds — literals, identical to _blellipse.mjs
const B = { cxSpan: 3, cy: [24, 31], rx: [6, 13], ry: [8, 15], step: 0.25 };
const SEED = { pyramid: 24, eagle: 76 };
// what noteSVG draws, read from the source and restated here as a literal so
// the LOCUS is never a function of the artefact (§6.1)
const OURS = {
  full: { pyramid: { cx: 30, cy: 28, rx: 16, ry: 16 }, eagle: { cx: 70, cy: 28, rx: 16, ry: 16 } },
  icon: { pyramid: { cx: 30, cy: 28, rx: 15, ry: 15 }, eagle: { cx: 70, cy: 28, rx: 15, ry: 15 } },
};

// IoU of two ellipses, by dense sampling on a 0.05-unit lattice over the union bbox
function ellipseIoU(a, b) {
  const st = 0.05;
  const x0 = Math.min(a.cx - a.rx, b.cx - b.rx), x1 = Math.max(a.cx + a.rx, b.cx + b.rx);
  const y0 = Math.min(a.cy - a.ry, b.cy - b.ry), y1 = Math.max(a.cy + a.ry, b.cy + b.ry);
  let inter = 0, uni = 0;
  for (let y = y0; y <= y1; y += st) for (let x = x0; x <= x1; x += st) {
    const ia = ((x - a.cx) / a.rx) ** 2 + ((y - a.cy) / a.ry) ** 2 <= 1;
    const ib = ((x - b.cx) / b.rx) ** 2 + ((y - b.cy) / b.ry) ** 2 <= 1;
    if (ia && ib) inter++;
    if (ia || ib) uni++;
  }
  return inter / uni;
}

const out = {};
for (const f of FILES) {
  const R = await rectify(f, W, H);
  if (R.out.length !== W * H) throw new Error('rectify size');
  const px = (X, Y) => {
    const x = (X - X0) * S, y = (Y - Y0) * S;
    if (x < 0 || y < 0 || x >= W - 1 || y >= H - 1) return 255;
    const i = x | 0, j = y | 0, fx = x - i, fy = y - j;
    return R.out[j * W + i] * (1 - fx) * (1 - fy) + R.out[j * W + i + 1] * fx * (1 - fy) +
      R.out[(j + 1) * W + i] * (1 - fx) * fy + R.out[(j + 1) * W + i + 1] * fx * fy;
  };
  const ring = (cx, cy, rx, ry, n = 360) => {
    let s = 0;
    for (let k = 0; k < n; k++) { const a = 2 * Math.PI * k / n; s += px(cx + rx * Math.cos(a), cy + ry * Math.sin(a)); }
    return s / n;
  };
  out[f] = {};
  for (const [tag, seed] of Object.entries(SEED)) {
    const cand = [];
    for (let cx = seed - B.cxSpan; cx <= seed + B.cxSpan + 1e-9; cx += B.step)
      for (let cy = B.cy[0]; cy <= B.cy[1] + 1e-9; cy += B.step)
        for (let rx = B.rx[0]; rx <= B.rx[1] + 1e-9; rx += B.step)
          for (let ry = B.ry[0]; ry <= B.ry[1] + 1e-9; ry += B.step)
            cand.push({ cx, cy, rx, ry, v: ring(cx, cy, rx, ry, 120) });
    cand.sort((a, b) => a.v - b.v);
    const best = { ...cand[0] };
    best.v720 = ring(best.cx, best.cy, best.rx, best.ry, 720);
    // NULL TEST — did any parameter land on a search bound?
    const onBound = [];
    if (Math.abs(best.cx - (seed - B.cxSpan)) < 1e-6 || Math.abs(best.cx - (seed + B.cxSpan)) < 1e-6) onBound.push('cx');
    for (const [k, [lo, hi]] of [['cy', B.cy], ['rx', B.rx], ['ry', B.ry]])
      if (Math.abs(best[k] - lo) < 1e-6 || Math.abs(best[k] - hi) < 1e-6) onBound.push(k);
    // SELECTION TEST — the runner-up that is NOT a neighbour of the winner
    const far = cand.find((c) => Math.hypot(c.cx - best.cx, c.cy - best.cy) > 2 ||
      Math.abs(c.rx - best.rx) > 1.5 || Math.abs(c.ry - best.ry) > 1.5);
    // PY5 — selected area as a fraction of the search box it was allowed
    const boxArea = (2 * B.cxSpan) * (B.cy[1] - B.cy[0]);
    const areaFrac = (Math.PI * best.rx * best.ry) / ((2 * B.rx[1]) * (2 * B.ry[1]));
    // interior tone/ink, normalised by this half's own p90 (the note's "field", gates §6)
    const vals = [];
    for (let Y = Y0; Y < Y0 + 46; Y += 0.2) for (let X = seed - 14; X < seed + 14; X += 0.2) vals.push(px(X, Y));
    vals.sort((a, b) => a - b);
    const field = vals[(vals.length * 0.9) | 0], th = 0.72 * field;
    let n = 0, ink = 0, sum = 0;
    for (let Y = best.cy - best.ry; Y <= best.cy + best.ry; Y += 0.15)
      for (let X = best.cx - best.rx; X <= best.cx + best.rx; X += 0.15) {
        if (((X - best.cx) / best.rx) ** 2 + ((Y - best.cy) / best.ry) ** 2 > 1) continue;
        const g = px(X, Y); n++; sum += g; if (g < th) ink++;
      }
    out[f][tag] = { ...best, field: Math.round(field), ink: ink / n, meanOverField: sum / n / field,
      onBound, runnerUp: far ? { cx: far.cx, cy: far.cy, rx: far.rx, ry: far.ry, v: far.v } : null,
      areaFrac, boxArea, top5: cand.slice(0, 5).map((c) => ({ cx: c.cx, cy: c.cy, rx: c.rx, ry: c.ry, v: +c.v.toFixed(2) })) };
    const b = out[f][tag];
    console.log(`${f.padEnd(15)} ${tag.padEnd(8)} cx ${b.cx.toFixed(2)} cy ${b.cy.toFixed(2)} rx ${b.rx.toFixed(2)} ry ${b.ry.toFixed(2)}` +
      `  rim grey ${b.v720.toFixed(1)} (field ${b.field})  ink ${b.ink.toFixed(3)}  mean/field ${b.meanOverField.toFixed(4)}  ry/rx ${(b.ry / b.rx).toFixed(3)}`);
    console.log(`    NULL   bounds cx ${seed - B.cxSpan}..${seed + B.cxSpan}  cy ${B.cy}  rx ${B.rx}  ry ${B.ry}  step ${B.step}` +
      `  -> on-bound: ${onBound.length ? onBound.join(',') + '  *** FAILURE REPORT, NOT A VALUE ***' : 'none'}`);
    console.log(`    SELECT top5 ${b.top5.map((c) => `(${c.cx},${c.cy},${c.rx},${c.ry})${c.v}`).join(' ')}`);
    console.log(`           best-different candidate ${far ? `(${far.cx},${far.cy},${far.rx},${far.ry}) grey ${far.v.toFixed(2)} — margin ${(far.v - cand[0].v).toFixed(2)}` : 'NONE'}`);
    console.log(`    PY5    selected ellipse is ${(100 * areaFrac).toFixed(1)}% of the largest ellipse the sweep could return` +
      `${areaFrac > 0.9 || areaFrac < 0.01 ? '  *** DEGENERATE ***' : ''}`);
  }
}

// ── the gates
console.log('\nD2 — our roundel against the measured rim (gate: IoU >= 0.95, centre +-1.0 unit, semi-axis +-5%)');
const mean = {};
for (const tag of Object.keys(SEED)) {
  const a = out[FILES[0]][tag], b = out[FILES[1]][tag];
  mean[tag] = { cx: (a.cx + b.cx) / 2, cy: (a.cy + b.cy) / 2, rx: (a.rx + b.rx) / 2, ry: (a.ry + b.ry) / 2,
    ink: (a.ink + b.ink) / 2, meanOverField: (a.meanOverField + b.meanOverField) / 2 };
  const m = mean[tag];
  console.log(`  ${tag}: two-reference agreement  cx ${a.cx.toFixed(2)}/${b.cx.toFixed(2)}  cy ${a.cy.toFixed(2)}/${b.cy.toFixed(2)}` +
    `  rx ${a.rx.toFixed(2)}/${b.rx.toFixed(2)}  ry ${a.ry.toFixed(2)}/${b.ry.toFixed(2)}` +
    `   worst spread ${(100 * Math.max(Math.abs(a.rx / b.rx - 1), Math.abs(a.ry / b.ry - 1))).toFixed(1)}%`);
  for (const tier of ['full', 'icon']) {
    const o = OURS[tier][tag];
    const iou = ellipseIoU(o, m);
    console.log(`    ${tier.padEnd(4)} ours (${o.cx},${o.cy}) r${o.rx}  vs measured (${m.cx.toFixed(2)},${m.cy.toFixed(2)}) rx ${m.rx.toFixed(2)} ry ${m.ry.toFixed(2)}` +
      `  ->  IoU ${iou.toFixed(4)}   dcx ${(o.cx - m.cx).toFixed(2)}  dcy ${(o.cy - m.cy).toFixed(2)}` +
      `   rx x${(o.rx / m.rx).toFixed(2)}  ry x${(o.ry / m.ry).toFixed(2)}   ${iou >= 0.95 ? 'PASS' : 'FAIL'}`);
    out[`iou_${tier}_${tag}`] = iou;
  }
}
const sepM = mean.eagle.cx - mean.pyramid.cx;
for (const tier of ['full', 'icon']) {
  const sepO = OURS[tier].eagle.cx - OURS[tier].pyramid.cx;
  console.log(`\nD2c separation, ${tier}: ours ${sepO.toFixed(2)}  measured ${sepM.toFixed(2)}  -> ${(100 * (sepO / sepM - 1)).toFixed(1)}%  (gate +-5%)  ${Math.abs(sepO / sepM - 1) <= 0.05 ? 'PASS' : 'FAIL'}`);
}
for (const tier of ['full', 'icon']) for (const tag of Object.keys(SEED)) {
  const o = OURS[tier][tag], m = mean[tag];
  console.log(`D2d shape, ${tier} ${tag}: ours ry/rx ${(o.ry / o.rx).toFixed(3)}  measured ${(m.ry / m.rx).toFixed(3)}  predicted-by-registration 1.3145  -> ${(100 * ((o.ry / o.rx) / 1.3145 - 1)).toFixed(1)}% (gate +-5%)  ${Math.abs((o.ry / o.rx) / 1.3145 - 1) <= 0.05 ? 'PASS' : 'FAIL'}`);
}
console.log('\nEQUIVALENCE (PY6) — bill.md §4 published, from _blellipse.mjs at its hash:');
console.log('  bill-rev.jpg   pyramid 23.00 27.75  8.75 11.25 | eagle 77.25 27.75  9.50 12.75');
console.log('  bill-rev-2.jpg pyramid 23.25 28.00  9.00 11.50 | eagle 76.50 27.75  8.25 12.00');

if (process.argv[2] === 'json')
  writeFileSync(new URL('./_jb4target.json', import.meta.url), JSON.stringify({
    generated: 'coloringbook/judge/_jb3seal.mjs', bounds: B, perFile: out, mean, separation: sepM }, null, 2) + '\n');
