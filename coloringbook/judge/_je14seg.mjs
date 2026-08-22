// BUCK r14 (specialist) — SEGMENT THE BIRD out of the roundel's engraving, on
// both reverse references, and MEASURE it: wing span, wing-tip height, where
// the wings attach, body height, tail, shield.
//
// WHY A BAND-PASS AND NOT A THRESHOLD. The roundel has no bare field: every
// square unit of it is engraved, the background with horizontal ruling and the
// device with cross-hatch and solid black. A global grey threshold therefore
// separates "top of the roundel" from "bottom of the roundel" (the ruling is
// graded) and not device from field — `bill.md` §5 already recorded the density
// sweep returning a search bound twice, in both directions, on two photographs.
// What DOES separate them is scale: at 0.3-unit blur the ruling survives, at
// 2.5-unit blur it is gone and only the massing's shadow remains, so
// blur(0.35) - blur(2.6) is negative exactly on the massing.
//
// EVERY NUMBER HERE IS TARGET-SIDE ONLY. Nothing in this file reads
// `coins.js`; there is no way for our drawing to move any of it (§6.1).
//
//   node coloringbook/judge/_je14seg.mjs [--overlay] [--k <0.0>]
import sharp from 'sharp';
import { grid } from './_je14crop.mjs';

const FILES = ['bill-rev.jpg', 'bill-rev-2.jpg'];
// FROZEN per-file rims from `_jb4target.json` — read, never re-fitted.
const RIM = {
  'bill-rev.jpg': { cx: 77.25, cy: 27.75, rx: 9.5, ry: 12.75 },
  'bill-rev-2.jpg': { cx: 76.5, cy: 27.75, rx: 8.25, ry: 12.0 },
};
const SP = 0.05;                       // sample pitch, viewBox units
const PAD = 1.0;                       // sample this far outside the rim
const S_FINE = 0.35, S_COARSE = 2.6;   // blur scales, viewBox units — FROZEN literals
const K = Number((process.argv[process.argv.indexOf('--k') + 1]) || 0) || 0;

function blur(src, w, h, sigmaPx) {
  const r = Math.max(1, Math.ceil(3 * sigmaPx));
  const k = []; let s = 0;
  for (let i = -r; i <= r; i++) { const v = Math.exp(-(i * i) / (2 * sigmaPx * sigmaPx)); k.push(v); s += v; }
  for (let i = 0; i < k.length; i++) k[i] /= s;
  const t = new Float64Array(w * h), o = new Float64Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let a = 0; for (let i = -r; i <= r; i++) a += k[i + r] * src[y * w + Math.min(w - 1, Math.max(0, x + i))];
    t[y * w + x] = a;
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let a = 0; for (let i = -r; i <= r; i++) a += k[i + r] * t[Math.min(h - 1, Math.max(0, y + i)) * w + x];
    o[y * w + x] = a;
  }
  return o;
}

export async function segment(file, k = K) {
  const E = RIM[file];
  const X0 = E.cx - E.rx - PAD, X1 = E.cx + E.rx + PAD;
  const Y0 = E.cy - E.ry - PAD, Y1 = E.cy + E.ry + PAD;
  const w = Math.round((X1 - X0) / SP), h = Math.round((Y1 - Y0) / SP);
  const px = await grid(file);
  const src = new Float64Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) src[j * w + i] = px(X0 + (i + 0.5) * SP, Y0 + (j + 0.5) * SP);
  const fine = blur(src, w, h, S_FINE / SP), coarse = blur(src, w, h, S_COARSE / SP);
  // band-pass; negative = darker than its 2.6-unit neighbourhood = massing
  const bp = new Float64Array(w * h);
  const inside = (i, j) => {
    const X = X0 + (i + 0.5) * SP, Y = Y0 + (j + 0.5) * SP;
    return ((X - E.cx) / E.rx) ** 2 + ((Y - E.cy) / E.ry) ** 2 <= 1;
  };
  const vals = [];
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    bp[j * w + i] = fine[j * w + i] - coarse[j * w + i];
    if (inside(i, j)) vals.push(bp[j * w + i]);
  }
  vals.sort((a, b) => a - b);
  // THRESHOLD: Otsu on the in-rim band-pass values. Printed as a value with the
  // distribution's own spread beside it, and swept by --k, so a threshold that
  // is really a search bound is visible.
  const lo = vals[0], hi = vals[vals.length - 1];
  const NB = 256, hist = new Array(NB).fill(0);
  for (const v of vals) hist[Math.min(NB - 1, Math.floor((v - lo) / (hi - lo) * NB))]++;
  let tot = vals.length, sum = 0;
  for (let b = 0; b < NB; b++) sum += b * hist[b];
  let wB = 0, sB = 0, best = -1, bestB = 0;
  for (let b = 0; b < NB; b++) {
    wB += hist[b]; if (!wB) continue; const wF = tot - wB; if (!wF) break;
    sB += b * hist[b];
    const v = wB * wF * ((sB / wB) - ((sum - sB) / wF)) ** 2;
    if (v > best) { best = v; bestB = b; }
  }
  const th = lo + (bestB + 0.5) / NB * (hi - lo) + k;
  const mask = new Uint8Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++)
    if (inside(i, j) && bp[j * w + i] < th) mask[j * w + i] = 1;
  return { file, E, X0, Y0, X1, Y1, w, h, SP, src, bp, mask, th, lo, hi,
    frac: mask.reduce((a, b) => a + b, 0) / vals.length };
}

// keep only the connected component that contains the seed (the bird's body),
// so olive branch / arrows / glory / ribbon are not counted as wing
function component(S, seedX, seedY) {
  const { w, h, mask, X0, Y0, SP } = S;
  const si = Math.round((seedX - X0) / SP - 0.5), sj = Math.round((seedY - Y0) / SP - 0.5);
  const lab = new Uint8Array(w * h);
  if (!mask[sj * w + si]) return { lab, n: 0, seedHit: false };
  const st = [sj * w + si]; lab[sj * w + si] = 1; let n = 1;
  while (st.length) {
    const p = st.pop(), x = p % w, y = (p / w) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const q = ny * w + nx;
      if (mask[q] && !lab[q]) { lab[q] = 1; n++; st.push(q); }
    }
  }
  return { lab, n, seedHit: true };
}

function report(S, lab) {
  const { w, h, X0, Y0, SP, E } = S;
  const X = (i) => X0 + (i + 0.5) * SP, Y = (j) => Y0 + (j + 0.5) * SP;
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  const rows = [];
  for (let j = 0; j < h; j++) {
    let a = -1, b = -1, n = 0;
    for (let i = 0; i < w; i++) if (lab[j * w + i]) { if (a < 0) a = i; b = i; n++; }
    if (a < 0) { rows.push(null); continue; }
    rows.push({ Y: Y(j), x0: X(a), x1: X(b), n: n * SP });
    x0 = Math.min(x0, X(a)); x1 = Math.max(x1, X(b));
    y0 = Math.min(y0, Y(j)); y1 = Math.max(y1, Y(j));
  }
  // widest row = the wing span, and where it happens
  let wide = null;
  for (const r of rows) if (r && (!wide || r.x1 - r.x0 > wide.x1 - wide.x0)) wide = r;
  return { rows, bbox: { x0, x1, y0, y1 }, wide,
    spanFrac: (x1 - x0) / (2 * E.rx), heightFrac: (y1 - y0) / (2 * E.ry),
    wideSpanFrac: wide ? (wide.x1 - wide.x0) / (2 * E.rx) : 0 };
}

if (import.meta.url !== `file://${process.argv[1]}`) { /* imported: no report, no side effects (S1.1) */ } else {
const SEED = process.argv.includes('--seed')
  ? process.argv[process.argv.indexOf('--seed') + 1].split(',').map(Number) : null;
const RAW = process.argv.includes('--raw');

const out = {};
for (const f of FILES) {
  const S = await segment(f);
  const C = RAW ? { lab: S.mask, n: S.mask.reduce((a, b) => a + b, 0), seedHit: true }
    : component(S, SEED ? S.E.cx + SEED[0] : S.E.cx, SEED ? S.E.cy + SEED[1] : S.E.cy + 4.5);
  if (!C.seedHit) throw new Error(`${f}: seed not on the mask — segmentation failed, this is a failure report not a value`);
  const R = report(S, C.lab);
  out[f] = { S, C, R };
  console.log(`\n${f}  rim (${S.E.cx},${S.E.cy}) ${S.E.rx}x${S.E.ry}`);
  console.log(`  band-pass blur ${S_FINE}u - ${S_COARSE}u; Otsu threshold ${S.th.toFixed(2)} in [${S.lo.toFixed(2)}, ${S.hi.toFixed(2)}]` +
    `${Math.abs(S.th - S.lo) < 1e-6 || Math.abs(S.th - S.hi) < 1e-6 ? '  *** ON A BOUND — FAILURE REPORT ***' : ''}   in-rim ink ${(100 * S.frac).toFixed(1)}%`);
  console.log(`  bird component ${C.n} cells = ${(C.n * SP * SP).toFixed(1)} sq units (${(100 * C.n / (S.mask.reduce((a, b) => a + b, 0))).toFixed(1)}% of the in-rim mask)`);
  console.log(`  bbox X ${R.bbox.x0.toFixed(2)}..${R.bbox.x1.toFixed(2)} (${(R.bbox.x1 - R.bbox.x0).toFixed(2)}u)   Y ${R.bbox.y0.toFixed(2)}..${R.bbox.y1.toFixed(2)} (${(R.bbox.y1 - R.bbox.y0).toFixed(2)}u)`);
  console.log(`  SPAN  / rim width  ${R.spanFrac.toFixed(4)}      HEIGHT / rim height ${R.heightFrac.toFixed(4)}`);
  console.log(`  widest row at Y ${R.wide.Y.toFixed(2)}  X ${R.wide.x0.toFixed(2)}..${R.wide.x1.toFixed(2)}`);
  // profile every half unit
  console.log('  half-unit profile  Y : x0 .. x1  (width, filled)');
  for (let Y = Math.ceil(R.bbox.y0 * 2) / 2; Y <= R.bbox.y1; Y += 0.5) {
    const j = Math.round((Y - S.Y0) / SP - 0.5), r = R.rows[j];
    if (!r) continue;
    console.log(`    ${Y.toFixed(1).padStart(5)} : ${r.x0.toFixed(2)} .. ${r.x1.toFixed(2)}  (${(r.x1 - r.x0).toFixed(2)}u, ${r.n.toFixed(2)}u ink)` +
      `   rel-cx ${((r.x0 + r.x1) / 2 - S.E.cx).toFixed(2)}`);
  }
}

// two-reference spread
{
  const a = out[FILES[0]].R, b = out[FILES[1]].R;
  console.log(`\nTWO-REFERENCE SPREAD`);
  for (const [k, va, vb] of [['span/width', a.spanFrac, b.spanFrac], ['height/height', a.heightFrac, b.heightFrac]])
    console.log(`  ${k.padEnd(14)} ${va.toFixed(4)} / ${vb.toFixed(4)}   mean ${((va + vb) / 2).toFixed(4)}   spread ${(100 * Math.abs(va / vb - 1)).toFixed(1)}%`);
}

// RESPONSE TEST — shrink the rim the fractions are taken against by 20%; the
// fractions must grow by ~1/0.8.
{
  const f = FILES[0], S = out[f].S, save = { ...S.E };
  S.E.rx *= 0.8; S.E.ry *= 0.8;
  const R2 = report(S, out[f].C.lab);
  console.log(`\nRESPONSE TEST — rim rx/ry x0.8 in the METRIC only (same mask): span/width ${out[f].R.spanFrac.toFixed(4)} -> ${R2.spanFrac.toFixed(4)}` +
    ` (expected x1.25 = ${(out[f].R.spanFrac * 1.25).toFixed(4)})  ${Math.abs(R2.spanFrac / out[f].R.spanFrac - 1.25) < 0.01 ? 'MOVED as expected' : '*** UNTRUSTED ***'}`);
  S.E.rx = save.rx; S.E.ry = save.ry;
}
// NULL TEST — run the identical pipeline on the PYRAMID roundel, whose device
// is independently measured (`_jk9edge.mjs`: base Y 33.2-33.3, top Y 23.9,
// half-widths 4.0 / 1.35). A pipeline that can measure a bird must reproduce a
// trapezoid it did not fit.
{
  const PYRRIM = { 'bill-rev.jpg': { cx: 23, cy: 27.75, rx: 8.75, ry: 11.25 },
    'bill-rev-2.jpg': { cx: 23.25, cy: 28, rx: 9, ry: 11.5 } };
  for (const f of FILES) {
    const saved = RIM[f]; RIM[f] = PYRRIM[f];
    const S = await segment(f);
    const C = component(S, S.E.cx, 30.5);
    RIM[f] = saved;
    if (!C.seedHit) { console.log(`NULL/PYRAMID ${f}: seed missed the mask — failure report`); continue; }
    const R = report(S, C.lab);
    const at = (Y) => { const r = R.rows[Math.round((Y - S.Y0) / S.SP - 0.5)]; return r ? `${r.x0.toFixed(2)}..${r.x1.toFixed(2)} hw ${((r.x1 - r.x0) / 2).toFixed(2)}` : '—'; };
    console.log(`\nNULL/PYRAMID ${f}: bbox Y ${R.bbox.y0.toFixed(2)}..${R.bbox.y1.toFixed(2)}   at Y 33.0 ${at(33.0)}   at Y 24.5 ${at(24.5)}` +
      `   — published base hw 4.0 at Y 33.25, top hw 1.35 at Y 23.95`);
  }
}

if (process.argv.includes('--overlay')) {
  const Z = 34;
  for (const f of FILES) {
    const { S, C } = out[f];
    const ow = Math.round((S.X1 - S.X0) * Z), oh = Math.round((S.Y1 - S.Y0) * Z);
    const buf = Buffer.alloc(ow * oh * 3);
    let mn = 1e9, mx = -1e9;
    for (const v of S.src) { if (v < mn) mn = v; if (v > mx) mx = v; }
    for (let j = 0; j < oh; j++) for (let i = 0; i < ow; i++) {
      const si = Math.min(S.w - 1, Math.floor(i / Z / SP)), sj = Math.min(S.h - 1, Math.floor(j / Z / SP));
      const g = Math.round(255 * (S.src[sj * S.w + si] - mn) / (mx - mn));
      const k = 3 * (j * ow + i);
      if (C.lab[sj * S.w + si]) { buf[k] = Math.min(255, g + 60); buf[k + 1] = g >> 1; buf[k + 2] = g >> 1; }
      else { buf[k] = g; buf[k + 1] = g; buf[k + 2] = g; }
    }
    const name = `coloringbook/judge/_je14seg-${f.replace(/\W/g, '_')}.png`;
    await sharp(buf, { raw: { width: ow, height: oh, channels: 3 } }).png().toFile(name);
    console.log(`\noverlay ${name}  ${ow}x${oh}   X ${S.X0.toFixed(2)}..${S.X1.toFixed(2)} Y ${S.Y0.toFixed(2)}..${S.Y1.toFixed(2)}  RED TINT = the segmented bird component`);
  }
}

}
