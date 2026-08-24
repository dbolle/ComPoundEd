// BUCK obverse round — the COAT's top edge (the shoulder line) inside the
// vignette, per column, on both obverse photographs through the printed-border
// fiducial, against the live `VIGNETTE.coat` path.
//
// This exists because `coat` CLOSES ON THE OVAL by construction — its two ends
// are computed on the ellipse at 166 and 14 degrees — so if the oval's ry is
// wrong the coat's ends are anchored to a wrong curve, and "extend the oval"
// is not a change that can be made without knowing where the note puts the
// shoulder line at the oval's edge.
//
// METHOD  blur to a 1.0-unit box; for each column, scan DOWN from Y 30 and
// report the first Y at which the blurred grey stays below the vignette's own
// Otsu for a full 1.5 units (a run, not a pixel — the engraving is line work).
// NULL TEST   scan bounds Y 30..48 printed; a column answering at either bound
//             is reported as a bound hit, not a value.
// REPORTS ONLY.
import sharp from 'sharp';
import { join } from 'node:path';
import { rectify, S, W, H } from './_bx3rect.mjs';
import { sweep } from './_bx4vig.mjs';
import { ROOT } from './_paths.mjs';
const { coinSVG } = await import(join(ROOT, 'src/art/coins.js'));

const Y0 = 30, Y1 = 48, RUN = 1.5;
function prof(r, E) {
  const K = 5;
  const blur = (i, j) => { let s = 0, n = 0; for (let b = -K; b <= K; b++) for (let a = -K; a <= K; a++) { const jj = j + b, ii = i + a; if (jj < 0 || ii < 0 || jj >= H || ii >= W) continue; s += r.plane[jj * W + ii]; n++; } return s / n; };
  const vals = []; for (let j = Math.round(18 * S); j < Math.round(47 * S); j += 2) for (let i = Math.round(41 * S); i < Math.round(59 * S); i += 2) {
    const X = (i + 0.5) / S, Y = (j + 0.5) / S; if (((X - E.cx) / E.rx) ** 2 + ((Y - E.cy) / E.ry) ** 2 > 1) continue; vals.push(Math.round(blur(i, j))); }
  const h = new Array(256).fill(0); for (const v of vals) h[v]++;
  let sum = 0; for (let i = 0; i < 256; i++) sum += i * h[i];
  let sB = 0, wB = 0, thr = 0, bv = -1;
  for (let t = 0; t < 256; t++) { wB += h[t]; if (!wB) continue; const wF = vals.length - wB; if (!wF) break; sB += t * h[t];
    const v = wB * wF * ((sB / wB) - ((sum - sB) / wF)) ** 2; if (v > bv) { bv = v; thr = t; } }
  return { blur, thr };
}
// ours: the drawn coat's top edge, read off the LIVE raster (assert-never-copy)
async function oursCoatTop() {
  const svg = coinSVG('buck', 380, { side: 'obverse', decorative: true }).replace(/width="[\d.]+" height="[\d.]+"/, `width="${W}" height="${H}"`);
  const raw = await sharp(Buffer.from(svg)).resize(W, H).removeAlpha().raw().toBuffer();
  const isInk = (k) => Math.abs(raw[k * 3] - 0x26) < 12 && Math.abs(raw[k * 3 + 1] - 0x58) < 12 && Math.abs(raw[k * 3 + 2] - 0x3a) < 12;
  let n = 0; for (let k = 0; k < W * H; k++) if (isInk(k)) n++;
  if (!n) throw new Error('ours: no `ink` pixels — palette moved, instrument invalid');
  return (X) => { const i = Math.round(X * S - 0.5);
    for (let j = Math.round(Y0 * S); j < Math.round(Y1 * S); j++) if (isInk(j * W + i)) return (j + 0.5) / S;
    return null; };
}
const ourTop = await oursCoatTop();
const R = {};
for (const f of ['bill-obv.jpg', 'bill-obv-2.jpg']) {
  const r = await rectify(f); const E = sweep(r); const { blur, thr } = prof(r, E);
  R[f] = { E, fn: (X) => {
    const i = Math.round(X * S - 0.5); let run = 0;
    for (let j = Math.round(Y0 * S); j < Math.round(Y1 * S); j++) {
      const Y = (j + 0.5) / S;
      if (((X - E.cx) / E.rx) ** 2 + ((Y - E.cy) / E.ry) ** 2 > 1) { run = 0; continue; }
      if (blur(i, j) <= thr) { run++; if (run >= RUN * S) return Y - RUN + 1 / S; } else run = 0;
    }
    return null; }, thr };
  console.log(`${f}  vignette cx ${E.cx} cy ${E.cy} rx ${E.rx} ry ${E.ry}   coat threshold ${thr}   scan Y ${Y0}..${Y1}, run ${RUN} units`);
}
console.log('\ncoat / shoulder TOP EDGE, viewBox Y, per column');
console.log('    X    bill-obv  bill-obv-2   mean    OURS    ours-mean');
const rows = [];
for (let X = 40.5; X <= 59.6; X += 1) {
  const a = R['bill-obv.jpg'].fn(X), b = R['bill-obv-2.jpg'].fn(X), o = ourTop(X);
  const m = a !== null && b !== null ? (a + b) / 2 : null;
  rows.push([X, a, b, m, o]);
  const p = (v) => v === null ? '   —  ' : v.toFixed(2).padStart(6);
  console.log(`  ${X.toFixed(1).padStart(4)}  ${p(a)}   ${p(b)}   ${p(m)}  ${p(o)}   ${m !== null && o !== null ? (o - m).toFixed(2).padStart(6) : '   —  '}`);
}
const ok = rows.filter((r2) => r2[3] !== null && r2[4] !== null);
const md = ok.reduce((s, r2) => s + (r2[4] - r2[3]), 0) / ok.length;
const sp = rows.filter((r2) => r2[1] !== null && r2[2] !== null).reduce((s, r2) => s + Math.abs(r2[1] - r2[2]), 0) / rows.filter((r2) => r2[1] !== null && r2[2] !== null).length;
console.log(`\nmean two-reference disagreement on the shoulder line: ${sp.toFixed(2)} viewBox units over ${rows.filter((r2) => r2[1] !== null && r2[2] !== null).length} columns`);
console.log(`mean (ours - note) shoulder Y: ${md.toFixed(2)} units over ${ok.length} columns`);
