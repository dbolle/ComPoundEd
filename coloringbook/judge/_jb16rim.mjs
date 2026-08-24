// BUCK r17 — THE SEAL RIM, FITTED AS A CIRCLE IN RAW PHOTOGRAPH PIXELS.
//
// WHY THIS EXISTS. Every constant on the note reverse is registered through
// the PRINTED BORDER (`_jb1fit.mjs`), and the border carries the whole of this
// subject's anisotropy: our frame is 90 x 46 for a border whose ratio is
// published as 2.5718, so the map into the viewBox stretches height against
// width by 1.3145 and a circle on the note is an ellipse here. That is fine
// for the frame. It is a bad way to measure a device INSIDE one of the seals,
// because the answer then depends on a border fit that this round measured at
// 2.630 / 2.612 against `_jb1fit.mjs`'s 2.5610 / 2.5827 — a 2.7% disagreement
// on the one number everything hangs from.
//
// The seal's own rim needs none of it. It is a closed curve on the same object
// as the device it contains, it is a CIRCLE in the photograph, and a quantity
// expressed as a fraction of it is free of the border, the crop and the scale.
// That is the frame `_jb16over.mjs` draws in and `_jb16contain.mjs` scores in.
//
// METHOD. The circle whose circumference has the lowest mean grey, swept over
// (cx, cy, r). Obligations:
//   NULL TEST (§4.1)   the sweep prints its bounds and flags a parameter that
//                      lands ON one.
//   SELECTION (§4.2)   prints the top-5 and the best candidate that is NOT a
//                      neighbour of the winner, with the margin.
//   §4.3               every fit is drawn back on its own source (--draw) and
//                      must be looked at; the numbers below are not evidence
//                      on their own.
//   PREDICTION         the EAGLE seal is not only fitted, it is PREDICTED from
//                      the pyramid's r and the two seals' separation, and the
//                      residual is printed. On `bill-rev.jpg` the free fit
//                      fails (it lands on r 105 with a selection margin of
//                      0.08 grey levels, i.e. no selection at all — the eagle
//                      side's rim is buried in the laurel and the arrows); the
//                      prediction lands on the rim and the overlay shows it.
//
// WHAT IT ESTABLISHES. The two seals are the SAME CIRCLE on both photographs
// (114 / 114 and 336 / 336), so `PYR.ry` and `EAG.ry` in `noteSVG` cannot be
// different numbers. They are 11.38 and 12.38.
//
//   node coloringbook/judge/_jb16rim.mjs [--draw]
import sharp from 'sharp';
import { join } from 'node:path';
import { REF, JUDGE } from './_paths.mjs';

export const SEEDS = {
  'bill-rev.jpg':   { pyr: { cx: 269, cy: 259 }, span: 18, r: [85, 140], step: 1 },
  'bill-rev-2.jpg': { pyr: { cx: 932, cy: 853 }, span: 55, r: [270, 400], step: 3 },
};
// the two seals' centre separation, as a fraction of the printed border width,
// measured on bill-rev-2.jpg; noteSVG draws 76.88-23.13 = 53.75 of 90 = 0.5972
export const SEP_FRAC = 0.5961;
export const BORDER_W = { 'bill-rev.jpg': 1132, 'bill-rev-2.jpg': 3456 };

export async function grey(file) {
  const { data, info } = await sharp(join(REF, file)).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
}
export const bilinear = (g) => (x, y) => {
  if (x < 0 || y < 0 || x >= g.w - 1 || y >= g.h - 1) return 255;
  const i = x | 0, j = y | 0, fx = x - i, fy = y - j;
  return g.d[j * g.w + i] * (1 - fx) * (1 - fy) + g.d[j * g.w + i + 1] * fx * (1 - fy) +
    g.d[(j + 1) * g.w + i] * (1 - fx) * fy + g.d[(j + 1) * g.w + i + 1] * fx * fy;
};
export function fitRim(g, seed, span, rRange, step) {
  const at = bilinear(g);
  const ring = (cx, cy, r, n) => { let s = 0; for (let k = 0; k < n; k++) { const a = 2 * Math.PI * k / n; s += at(cx + r * Math.cos(a), cy + r * Math.sin(a)); } return s / n; };
  const cand = [];
  for (let cx = seed.cx - span; cx <= seed.cx + span + 1e-9; cx += step)
    for (let cy = seed.cy - span; cy <= seed.cy + span + 1e-9; cy += step)
      for (let r = rRange[0]; r <= rRange[1] + 1e-9; r += step)
        cand.push({ cx, cy, r, v: ring(cx, cy, r, 180) });
  cand.sort((a, b) => a.v - b.v);
  const best = { ...cand[0] };
  best.v1440 = ring(best.cx, best.cy, best.r, 1440);
  const onBound = [];
  if (Math.abs(best.cx - (seed.cx - span)) < 1e-6 || Math.abs(best.cx - (seed.cx + span)) < 1e-6) onBound.push('cx');
  if (Math.abs(best.cy - (seed.cy - span)) < 1e-6 || Math.abs(best.cy - (seed.cy + span)) < 1e-6) onBound.push('cy');
  if (Math.abs(best.r - rRange[0]) < 1e-6 || Math.abs(best.r - rRange[1]) < 1e-6) onBound.push('r');
  const far = cand.find((c) => Math.hypot(c.cx - best.cx, c.cy - best.cy) > 2 * step || Math.abs(c.r - best.r) > 2 * step);
  return { best, onBound, far, top5: cand.slice(0, 5) };
}
// The rims this round publishes, for every instrument downstream of it.
export const RIM = {
  'bill-rev.jpg':   { pyr: [269, 259, 114], eag: [949, 256, 114] },
  'bill-rev-2.jpg': { pyr: [922, 861, 348], eag: [2993, 860, 348] },
};

async function draw(file, which) {
  const [cx, cy, r] = RIM[file][which];
  const half = Math.round(r * 1.25), S = 2 * half, K = Math.max(1, Math.round(900 / S)), W = S * K;
  let g = `<circle cx="${half * K}" cy="${half * K}" r="${r * K}" fill="none" stroke="#ff0080" stroke-width="2"/>`;
  for (const t of [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1]) {
    g += `<line x1="0" y1="${(half + t * r) * K}" x2="${W}" y2="${(half + t * r) * K}" stroke="#00b0ff" stroke-width="1" opacity="0.85"/>`;
    g += `<line x1="${(half + t * r) * K}" y1="0" x2="${(half + t * r) * K}" y2="${W}" stroke="#00b0ff" stroke-width="1" opacity="0.85"/>`;
  }
  const base = await sharp(join(REF, file)).extract({ left: cx - half, top: cy - half, width: S, height: S }).resize(W, W).png().toBuffer();
  const out = join(JUDGE, `_jb16-rim-${which}-${file.replace(/\W/g, '_')}.png`);
  await sharp(base).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}">${g}</svg>`) }]).png().toFile(out);
  return out;
}

if (process.argv[1] && process.argv[1].endsWith('_jb16rim.mjs')) {
  for (const file of Object.keys(SEEDS)) {
    const S = SEEDS[file], g = await grey(file);
    const R = fitRim(g, S.pyr, S.span, S.r, S.step);
    console.log(`${file}  PYRAMID seal  cx ${R.best.cx} cy ${R.best.cy} r ${R.best.r}  rim grey ${R.best.v1440.toFixed(1)}`);
    console.log(`   NULL   cx ${S.pyr.cx}+-${S.span}  cy ${S.pyr.cy}+-${S.span}  r ${S.r}  step ${S.step}  -> on-bound: ${R.onBound.length ? R.onBound.join(',') + '  *** FAILURE REPORT ***' : 'none'}`);
    console.log(`   SELECT top5 ${R.top5.map((c) => `(${c.cx},${c.cy},${c.r})${c.v.toFixed(1)}`).join(' ')}`);
    console.log(`          best-different (${R.far.cx},${R.far.cy},${R.far.r}) ${R.far.v.toFixed(2)}  margin ${(R.far.v - R.top5[0].v).toFixed(2)} grey levels`);
    // free fit of the eagle seal, then the prediction
    const eSeed = { cx: Math.round(R.best.cx + SEP_FRAC * BORDER_W[file]), cy: R.best.cy };
    const F = fitRim(g, eSeed, S.span, S.r, S.step);
    console.log(`${file}  EAGLE seal, FREE fit    cx ${F.best.cx} cy ${F.best.cy} r ${F.best.r}` +
      `   selection margin ${(F.far.v - F.top5[0].v).toFixed(2)} grey levels` +
      `${(F.far.v - F.top5[0].v) < 1 ? '   *** NO SELECTION — this fit says nothing ***' : ''}`);
    console.log(`${file}  EAGLE seal, PREDICTED   cx ${eSeed.cx} cy ${R.best.cy} r ${R.best.r}` +
      `   (pyramid r + separation ${SEP_FRAC} of border width ${BORDER_W[file]})`);
    console.log(`   -> the two seals are ${R.best.r === RIM[file].eag[2] ? 'THE SAME CIRCLE' : 'NOT the same circle'}; ` +
      `r/borderW = ${(R.best.r / BORDER_W[file]).toFixed(5)}, against noteSVG's rx 8.875/90 = 0.09861`);
  }
  console.log('\nry/rx implied by each border-ratio candidate (a circle maps to ry/rx = rho/1.9565):');
  for (const [tag, rho] of [['_jb1fit.mjs  2.5610 / 2.5827, mean', 2.5718], ['r17 corner zooms 2.630 / 2.612, mean', 2.6209]])
    console.log(`   ${tag} ${rho}  ->  ry/rx ${(rho / 1.9565).toFixed(4)}   (drawn: PYR 1.2817, EAG 1.3944)`);
  if (process.argv.includes('--draw'))
    for (const file of Object.keys(RIM)) for (const w of ['pyr', 'eag']) console.log('drawn', await draw(file, w));
}
