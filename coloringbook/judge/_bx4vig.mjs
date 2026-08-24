// BUCK obverse round — the portrait VIGNETTE OVAL, measured through the
// printed-border fiducial `_bx2fit.mjs` fits. r0 registered this locus on the
// PAPER box and declared no border fiducial existed on this face.
//
// WHY NOT A SEGMENTER. Tried first and published as a failure: Otsu on the
// blurred plane inside a frozen window returns a mask that is 46.3% of the
// window and TOUCHES ITS EDGE on `bill-obv.jpg` — the vignette's engraving is
// continuous with the ornament around it, which is bill.md §5's finding in a
// new place. Reported, not hidden.
//
// WHAT WORKS is the reverse round's own method: the vignette boundary is a
// LIGHT/DARK STEP, so score an ellipse by the contrast between a ring just
// OUTSIDE it (paper) and a ring just INSIDE it (engraving) and maximise.
//   score(cx,cy,rx,ry) = mean(ring at 1.10x) - mean(ring at 0.94x)
//
// NULL TEST     every sweep bound is printed and a parameter landing ON a bound
//               is a failure report, not a value.
// SELECTION     the top-5 candidate set is printed with the margin to the best
//               candidate whose centre differs by more than 1 unit.
// RESPONSE      `--response` shifts the ring radii and reports the movement.
// OVERLAY       `--overlay <dir>` draws the winner and our own ellipse on both
//               sources and the PNG is read back.
// SUBJECTS      id `buck`, OBVERSE only, both obverse references.
// REPORTS ONLY.
import sharp from 'sharp';
import { join } from 'node:path';
import { rectify, S, W, H } from './_bx3rect.mjs';

const FILES = ['bill-obv.jpg', 'bill-obv-2.jpg'];
const B = { cx: [47, 53], cy: [27, 34], rx: [7, 13], ry: [11, 19], step: 0.25 };
const OURS = { cx: 50.05, cy: 30.3, rx: 9.75, ry: 14 };

function ringer(r) {
  const at = (X, Y) => {
    const x = (X * S) - 0.5, y = (Y * S) - 0.5;
    if (x < 0 || y < 0 || x >= W - 1 || y >= H - 1) return 255;
    const i = x | 0, j = y | 0, fx = x - i, fy = y - j;
    return r.plane[j * W + i] * (1 - fx) * (1 - fy) + r.plane[j * W + i + 1] * fx * (1 - fy) +
      r.plane[(j + 1) * W + i] * (1 - fx) * fy + r.plane[(j + 1) * W + i + 1] * fx * fy;
  };
  return (cx, cy, rx, ry, k, n = 180) => {
    let s = 0; for (let q = 0; q < n; q++) { const a = 2 * Math.PI * q / n; s += at(cx + k * rx * Math.cos(a), cy + k * ry * Math.sin(a)); }
    return s / n;
  };
}

export function sweep(r, OUT = 1.10, IN = 0.94, log = null) {
  const ring = ringer(r);
  const cand = [];
  for (let cx = B.cx[0]; cx <= B.cx[1] + 1e-9; cx += B.step)
    for (let cy = B.cy[0]; cy <= B.cy[1] + 1e-9; cy += B.step)
      for (let rx = B.rx[0]; rx <= B.rx[1] + 1e-9; rx += B.step)
        for (let ry = B.ry[0]; ry <= B.ry[1] + 1e-9; ry += B.step)
          cand.push({ cx, cy, rx, ry, v: ring(cx, cy, rx, ry, OUT, 120) - ring(cx, cy, rx, ry, IN, 120) });
  cand.sort((a, b) => b.v - a.v);
  const best = cand[0];
  const other = cand.find((c) => Math.hypot(c.cx - best.cx, c.cy - best.cy) > 1);
  const onBound = [];
  for (const k of ['cx', 'cy', 'rx', 'ry']) if (best[k] <= B[k][0] + 1e-9 || best[k] >= B[k][1] - 1e-9) onBound.push(k);
  if (log) {
    log(`  sweep bounds  cx ${B.cx.join('..')}  cy ${B.cy.join('..')}  rx ${B.rx.join('..')}  ry ${B.ry.join('..')}  step ${B.step}   (${cand.length} candidates)`);
    log('  top 5:');
    for (const c of cand.slice(0, 5)) log(`    cx ${c.cx.toFixed(2)} cy ${c.cy.toFixed(2)} rx ${c.rx.toFixed(2)} ry ${c.ry.toFixed(2)}   score ${c.v.toFixed(2)}`);
    log(`  best differently-centred candidate: ${other ? `cx ${other.cx.toFixed(2)} cy ${other.cy.toFixed(2)} score ${other.v.toFixed(2)} (margin ${(best.v - other.v).toFixed(2)} grey levels)` : 'none in the sweep'}`);
    log(onBound.length ? `  ** ON BOUND: ${onBound.join(',')} — this is a failure report, not a value **` : '  no parameter landed on a sweep bound');
  }
  return { ...best, onBound, margin: other ? best.v - other.v : NaN };
}

if (process.argv[1] && process.argv[1].endsWith('_bx4vig.mjs')) {
  const dirI = process.argv.indexOf('--overlay'); const dir = dirI > 0 ? process.argv[dirI + 1] : null;
  console.log('D1 locus as drawn (frozen by r0 on the PAPER box, +-0.5 claimed):');
  console.log(`  cx ${OURS.cx}  cy ${OURS.cy}  rx ${OURS.rx}  ry ${OURS.ry}   ry/rx ${(OURS.ry / OURS.rx).toFixed(3)}\n`);
  const got = [];
  for (const f of FILES) {
    console.log(f);
    const r = await rectify(f);
    const b = sweep(r, 1.10, 0.94, (s) => console.log(s));
    got.push(b);
    console.log(`  FIT  cx ${b.cx.toFixed(2)}  cy ${b.cy.toFixed(2)}  rx ${b.rx.toFixed(2)}  ry ${b.ry.toFixed(2)}   ry/rx ${(b.ry / b.rx).toFixed(3)}`);
    if (process.argv.includes('--response')) for (const [o, i] of [[1.06, 0.90], [1.14, 0.98]]) {
      const q = sweep(r, o, i);
      console.log(`  response  rings ${o}/${i}: cx ${q.cx.toFixed(2)} cy ${q.cy.toFixed(2)} rx ${q.rx.toFixed(2)} ry ${q.ry.toFixed(2)}`);
    }
    if (dir) {
      const base = await sharp(r.colour, { raw: { width: W, height: H, channels: 3 } }).png().toBuffer();
      const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="${OURS.cx * S}" cy="${OURS.cy * S}" rx="${OURS.rx * S}" ry="${OURS.ry * S}" fill="none" stroke="#ff2020" stroke-width="2"/>
        <ellipse cx="${b.cx * S}" cy="${b.cy * S}" rx="${b.rx * S}" ry="${b.ry * S}" fill="none" stroke="#00ff40" stroke-width="2"/></svg>`;
      const ov = await sharp(Buffer.from(svg)).resize(W, H).png().toBuffer();
      const comp = await sharp(base).composite([{ input: ov }]).png().toBuffer();
      await sharp(comp).extract({ left: 330, top: 90, width: 360, height: 430 }).resize(720).png()
        .toFile(join(dir, 'bx4-' + f.replace('.jpg', '.png')));
    }
    console.log('');
  }
  const m = (k) => (got[0][k] + got[1][k]) / 2, sp = (k) => Math.abs(got[0][k] - got[1][k]);
  console.log('two-reference mean   cx %s cy %s rx %s ry %s   ry/rx %s', m('cx').toFixed(2), m('cy').toFixed(2), m('rx').toFixed(2), m('ry').toFixed(2), (m('ry') / m('rx')).toFixed(3));
  console.log('two-reference spread cx %s cy %s rx %s ry %s (viewBox units)', sp('cx').toFixed(2), sp('cy').toFixed(2), sp('rx').toFixed(2), sp('ry').toFixed(2));
  console.log('OURS minus mean      dcx %s dcy %s drx %s dry %s', (OURS.cx - m('cx')).toFixed(2), (OURS.cy - m('cy')).toFixed(2), (OURS.rx - m('rx')).toFixed(2), (OURS.ry - m('ry')).toFixed(2));
  const iou = (a, b2) => { const st = 0.02; let inter = 0, uni = 0;
    for (let y = 10; y <= 50; y += st) for (let x = 35; x <= 66; x += st) {
      const ia = ((x - a.cx) / a.rx) ** 2 + ((y - a.cy) / a.ry) ** 2 <= 1;
      const ib = ((x - b2.cx) / b2.rx) ** 2 + ((y - b2.cy) / b2.ry) ** 2 <= 1;
      if (ia && ib) inter++; if (ia || ib) uni++; } return inter / uni; };
  const mean = { cx: m('cx'), cy: m('cy'), rx: m('rx'), ry: m('ry') };
  console.log('D1 region IoU, ours vs the two-reference mean: %s   (gate 0.95)', iou(OURS, mean).toFixed(4));
  console.log('D1 region IoU, ours vs each: %s / %s', iou(OURS, got[0]).toFixed(4), iou(OURS, got[1]).toFixed(4));
  console.log('D1 region IoU, the two references against EACH OTHER: %s  <- the ceiling this face can claim', iou(got[0], got[1]).toFixed(4));
}
