// SPECIALIST INSTRUMENT — round 3, D5 lettering. INK ENVELOPE OF A LEGEND.
//
// What it measures: for a rectangle of the reference given in VIEWBOX units,
// the ink envelope of the relief lettering inside it — per-column top and
// bottom, per-glyph bounding boxes and centroids — so a baseline, a cap height
// and a centre-to-centre angular span can be written down as numbers instead of
// eyeballed off a ladder.
//
// WHY CONTRAST AND NOT DARKNESS. A raised letter on a copper coin is not dark.
// It is lit: the stroke shows a dark shadow on one flank, a specular highlight
// on the other, and a mid-tone flat on top that can match the field exactly.
// Thresholding on darkness therefore returns the SHADOW, which is offset from
// the letter by the lighting direction — on `penny-rev-2.png` the shadow sits
// low-left, so a darkness threshold reads ONE CENT about a third of a stroke
// too far inboard and too far clockwise. The criterion here is |lum - bg| over
// a slowly-varying background, which brackets both flanks and is symmetric
// about the stroke. (This is the same reason `_jt2relief.mjs` exists; that one
// is a tone instrument and is pinned to the dime.)
//
// bg is a large-window median (BGWIN viewBox units, default 8). A coin
// photograph's illumination varies over tens of units; a legend's strokes are
// ~0.7 units wide with ~1.5-unit gaps, so an 8-unit median sits on the field
// even inside the densest word. Reported, so it can be checked.
//
// T is k x SIGMA, and SIGMA is measured on a LETTER-FREE rectangle passed in by
// the caller, never on the rectangle under test — a threshold derived from the
// feature's own variance moves when the feature moves.
//
// §4.2 SELECTION: the glyph splitter chooses connected runs out of a candidate
//   set. It prints EVERY run it found with its width and ink area, including the
//   ones it rejected as punctuation or noise, and it throws if the two widest
//   rejected runs are wider than the narrowest accepted one.
// §4.1 NULL: the window bounds are printed beside every result, and any ink
//   envelope that TOUCHES a window edge is reported as a clip failure, not as a
//   value.
// §4 RESPONSE: `--response` runs four perturbations —
//   (a) FLAT PATCH: the letter-free rectangle must come back with ink fraction
//       < 0.01 and no runs (the §4 one-liner);
//   (c) HALF STEP: sampling on a lattice twice as fine must reproduce every
//       edge — a real edge does not depend on where the samples fall;
//   (d) k SWEEP: the envelope and the run count at k 2..6, printed rather than
//       argued, with the clip flags, so the threshold's own sensitivity is
//       visible beside the value;
//   (e) DISC: moving the frozen disc centre 4 photograph pixels must move every
//       reported edge by 4 x 47/R viewBox units. Zero movement would mean the
//       instrument is not reading through the registration at all.
//   (There is no (b). It was "shift the window 1 unit and watch the answer move
//   1 unit", which is exactly backwards: the FEATURE does not move when the
//   window does, so a response there would have been a bug.)
//
// Run: node coloringbook/judge/_jl3ink.mjs <ref> <x0,y0,x1,y1> <fx0,fy0,fx1,fy1> [--response]
//        rect under test ------^            letter-free rect for SIGMA --^
import { sampler } from './_jl3unwrap.mjs';

export const STEP = 0.05;      // viewBox units per sample
export const BGWIN = 8;        // viewBox units, background median window
export const K = 4.0;          // threshold in sigmas of the letter-free field

// Samples a viewBox rectangle into a row-major float grid.
export function grab(s, [x0, y0, x1, y1], step = STEP) {
  const W = Math.round((x1 - x0) / step) + 1, H = Math.round((y1 - y0) / step) + 1;
  const g = new Float64Array(W * H);
  const k = s.k;
  for (let j = 0; j < H; j++) {
    const vy = y0 + j * step;
    for (let i = 0; i < W; i++) {
      const vx = x0 + i * step;
      // viewBox -> photo px, the same mapping `_jl1grid.mjs` draws with
      const px = s.cx + (vx - 50) * k, py = s.cy + (vy - 50) * k;
      const x = px, y = py;
      const x0i = x | 0, y0i = y | 0, fx = x - x0i, fy = y - y0i;
      g[j * W + i] = Number.isNaN(s.raw(x0i, y0i)) ? NaN
        : s.raw(x0i, y0i) * (1 - fx) * (1 - fy) + s.raw(x0i + 1, y0i) * fx * (1 - fy)
          + s.raw(x0i, y0i + 1) * (1 - fx) * fy + s.raw(x0i + 1, y0i + 1) * fx * fy;
    }
  }
  return { g, W, H, x0, y0, step };
}

// Median over a square window. Both the OUTPUT lattice and the samples the
// median is taken over are coarse — BGLAT viewBox units — and the result is
// nearest-neighbour expanded onto the fine grid. That is not an approximation
// of convenience: the background is a slowly-varying illumination field, and a
// full-resolution rank filter over an 8-unit window costs 10^4 sorts per patch,
// which made the letter-free scan run past two minutes on one reference.
// A 0.4-unit lattice gives the 8-unit window 441 samples.
export const BGLAT = 0.4;
export function background(p, win = BGWIN) {
  const sub = Math.max(1, Math.round(BGLAT / p.step));
  const half = Math.round(win / 2 / p.step / sub);
  const coarseW = Math.ceil(p.W / sub), coarseH = Math.ceil(p.H / sub);
  const c = new Float64Array(coarseW * coarseH);
  const buf = [];
  for (let cj = 0; cj < coarseH; cj++) {
    for (let ci = 0; ci < coarseW; ci++) {
      buf.length = 0;
      for (let b = Math.max(0, cj - half); b <= Math.min(coarseH - 1, cj + half); b++)
        for (let a = Math.max(0, ci - half); a <= Math.min(coarseW - 1, ci + half); a++) {
          const v = p.g[Math.min(p.H - 1, b * sub) * p.W + Math.min(p.W - 1, a * sub)];
          if (!Number.isNaN(v)) buf.push(v);
        }
      buf.sort((m, n) => m - n);
      c[cj * coarseW + ci] = buf.length ? buf[buf.length >> 1] : NaN;
    }
  }
  const bg = new Float64Array(p.W * p.H);
  for (let j = 0; j < p.H; j++) for (let i = 0; i < p.W; i++) {
    const cj = Math.min(coarseH - 1, Math.round(j / sub)), ci = Math.min(coarseW - 1, Math.round(i / sub));
    bg[j * p.W + i] = c[cj * coarseW + ci];
  }
  return bg;
}

// A SIGMA FLOOR, because one of the four references has none. `nickel-rev-2.png`
// is a retouched proof whose field is a single constant grey: every 5x5 patch on
// the disc interior comes back MAD 0.000, so sigma is 0, so the threshold is 0,
// so every sample in the window is ink. That is a real degeneracy and not a bug
// to be papered over — it is reported whenever it binds. One grey level is the
// quantisation floor of an 8-bit image; nothing below it can be measured at all.
export const SIGMA_FLOOR = 1.0;
export function floored(sigma) {
  return { sigma: Math.max(sigma, SIGMA_FLOOR), bound: sigma < SIGMA_FLOOR, raw: sigma };
}

export function sigmaOf(p) {
  const bg = background(p);
  const d = [];
  for (let i = 0; i < p.g.length; i++) {
    const v = p.g[i] - bg[i];
    if (!Number.isNaN(v)) d.push(Math.abs(v));
  }
  d.sort((a, b) => a - b);
  return { mad: d[d.length >> 1], sigma: 1.4826 * d[d.length >> 1], n: d.length };
}

// The ink mask, plus per-column envelope and connected glyph runs.
export function envelope(s, rect, sigma, opts = {}) {
  const k = opts.k ?? K, minRun = opts.minRun ?? 3;     // samples of ink in a column
  const p = grab(s, rect, opts.step ?? STEP);
  const bg = background(p);
  const T = k * sigma;
  // The window may be a rect INTERSECTED with an annulus. The cent's E
  // PLURIBUS and the nickel's FIVE CENTS both sit within 1.5 units of a
  // neighbour that a plain rectangle cannot avoid (the rim legend above, the
  // building below), and the neighbour is separated from them cleanly in
  // RADIUS. rMin/rMax are frozen literals passed by the caller, printed with
  // the result, and treated as window edges by the clip test.
  const rMin = opts.rMin ?? 0, rMax = opts.rMax ?? 1e9;
  const mask = new Uint8Array(p.W * p.H);
  let inkN = 0, inWin = 0;
  for (let j = 0; j < p.H; j++) for (let i = 0; i < p.W; i++) {
    const idx = j * p.W + i;
    const vx = rect[0] + i * (opts.step ?? STEP), vy = rect[1] + j * (opts.step ?? STEP);
    const rr = Math.hypot(vx - 50, vy - 50);
    if (rr < rMin || rr > rMax) continue;
    inWin++;
    const v = p.g[idx] - bg[idx];
    if (!Number.isNaN(v) && Math.abs(v) > T) { mask[idx] = 1; inkN++; }
  }
  // MORPHOLOGICAL OPENING, and it is not cosmetic. Iteration 0 of this round
  // ran without it and the overlay (`_jl3over-pyrev-epu-it0.png`) showed the
  // envelope spiking to the window edge in the BARE FIELD either side of the
  // word: mottled copper on `penny-rev-2.png` clears a 4-sigma threshold in
  // isolated samples, and a column needs only 3 of them to be called inked. A
  // legend stroke is ~0.7 viewBox units wide, i.e. 14 samples at step 0.05, so
  // an OPEN viewBox units erosion removes speckle without touching a stroke.
  // OPEN is printed with every result and swept in the response test.
  const open = Math.round((opts.open ?? 0.15) / (opts.step ?? STEP));
  if (open > 0) {
    const er = new Uint8Array(p.W * p.H);
    for (let j = open; j < p.H - open; j++) for (let i = open; i < p.W - open; i++) {
      let all = 1;
      for (let b = -open; b <= open && all; b++) for (let a = -open; a <= open; a++)
        if (!mask[(j + b) * p.W + i + a]) { all = 0; break; }
      er[j * p.W + i] = all;
    }
    const di = new Uint8Array(p.W * p.H);
    for (let j = 0; j < p.H; j++) for (let i = 0; i < p.W; i++) if (er[j * p.W + i])
      for (let b = -open; b <= open; b++) for (let a = -open; a <= open; a++) {
        const jj = j + b, ii = i + a;
        if (jj >= 0 && jj < p.H && ii >= 0 && ii < p.W) di[jj * p.W + ii] = 1;
      }
    inkN = 0;
    for (let i = 0; i < mask.length; i++) { mask[i] = di[i]; if (mask[i]) inkN++; }
  }
  // VERTICAL CLOSING, and this one is also not cosmetic. `|lum - bg| > T`
  // marks the two lit flanks of a stroke and NOT the flat top between them, so
  // a capital O comes back as two separate runs in every column and the seeded
  // picker takes one flank of one stroke. Iteration 3 measured the cent's ONE
  // CENT that way and read its band as 31.7..39.6 against a frozen 30.9..41.3 —
  // the overlay (`_jl3over-pyrev-onecent.png`) showed the boxes sitting on
  // fragments of single strokes. Closing gaps shorter than closeY viewBox units
  // makes each glyph one run. closeY must be larger than the widest hollow in
  // the glyph and smaller than the gap to the next legend, so it is per-legend
  // and it is printed with the result.
  const closeY = Math.round((opts.closeY ?? 0) / (opts.step ?? STEP));
  if (closeY > 0) for (let i = 0; i < p.W; i++) {
    let last = -1;
    for (let j = 0; j < p.H; j++) {
      if (!mask[j * p.W + i]) continue;
      if (last >= 0 && j - last <= closeY + 1) for (let b = last + 1; b < j; b++) { mask[b * p.W + i] = 1; inkN++; }
      last = j;
    }
  }
  // Per-column vertical runs, then ONE of them selected.
  //
  // §4.2 SELECTION, and this is why the option exists. On `penny-rev-2.png` the
  // cent's E PLURIBUS sits 1.3 units under the rim legend's ink and 1.5 over
  // the memorial's attic, and NO rectangle-plus-annulus window separates all
  // three: iteration 1 of this round clipped the glyph tops trying, and
  // iteration 0 swallowed both neighbours. What does separate them is that in
  // any single column they are three DISTINCT vertical runs. `seedY` picks the
  // run containing that y (else the nearest), and every column reports how many
  // runs it chose from, so an ambiguous column is visible rather than silently
  // resolved. Without `seedY` the behaviour is the old one: the union of every
  // run in the column, which is only safe in a window with one feature in it.
  const seedY = opts.seedY, seedR = opts.seedR, seedTol = opts.seedTol ?? 1.5;
  const cols = [];
  let ambiguous = 0, maxRuns = 0;
  for (let i = 0; i < p.W; i++) {
    const vr = [];
    let j0 = -1;
    for (let j = 0; j <= p.H; j++) {
      const on = j < p.H && mask[j * p.W + i];
      if (on && j0 < 0) j0 = j;
      else if (!on && j0 >= 0) { if (j - j0 >= minRun) vr.push([j0, j - 1]); j0 = -1; }
    }
    maxRuns = Math.max(maxRuns, vr.length);
    if (!vr.length) { cols.push({ x: rect[0] + i * p.step, n: 0, nruns: 0, top: NaN, bot: NaN }); continue; }
    let pick;
    if (seedR !== undefined) {
      // A CONCENTRIC legend's seed is a RADIUS, not a y. Iteration 5 seeded the
      // nickel's FIVE CENTS at a constant y 76 and lost the F and the S: the
      // legend is an arc, so at 133 deg it sits at y 71.2 and a 1.5-unit
      // tolerance about y 76 excludes it, while a 4-unit tolerance swallows
      // MONTICELLO. In radius the same legend is flat to 0.05 units.
      let best = -1, bd = Infinity;
      vr.forEach((rr, idx) => {
        const rA = Math.hypot(rect[0] + i * p.step - 50, rect[1] + rr[0] * p.step - 50);
        const rB = Math.hypot(rect[0] + i * p.step - 50, rect[1] + rr[1] * p.step - 50);
        const lo = Math.min(rA, rB), hi = Math.max(rA, rB);
        const d = seedR < lo ? lo - seedR : seedR > hi ? seedR - hi : 0;
        if (d < bd) { bd = d; best = idx; }
      });
      if (bd > seedTol) { cols.push({ x: rect[0] + i * p.step, n: 0, nruns: vr.length, top: NaN, bot: NaN }); continue; }
      pick = vr[best];
      if (vr.length > 1) ambiguous++;
    } else if (seedY === undefined) {
      pick = [vr[0][0], vr[vr.length - 1][1]];
    } else {
      const sj = (seedY - rect[1]) / p.step;
      let best = 0, bd = Infinity;
      vr.forEach((r, idx) => {
        const d = sj < r[0] ? r[0] - sj : sj > r[1] ? sj - r[1] : 0;
        if (d < bd) { bd = d; best = idx; }
      });
      // A column where NO run comes within seedTol of the seed does not contain
      // this legend — it is a gap between glyphs, and the nearest run in it is a
      // neighbour. Taking it anyway is how iteration 2 pulled the rim legend's
      // ink into the cent's E PLURIBUS envelope (clip TOP at y 13.0).
      if (bd * p.step > seedTol) { cols.push({ x: rect[0] + i * p.step, n: 0, nruns: vr.length, top: NaN, bot: NaN }); continue; }
      pick = vr[best];
      if (vr.length > 1) ambiguous++;
    }
    let n = 0;
    for (let j = pick[0]; j <= pick[1]; j++) if (mask[j * p.W + i]) n++;
    cols.push({ x: rect[0] + i * p.step, n, nruns: vr.length,
      top: rect[1] + pick[0] * p.step, bot: rect[1] + pick[1] * p.step });
  }
  // angular runs (glyphs): maximal spans of consecutive inked columns
  const runs = [];
  let cur = null;
  for (const c of cols) {
    if (!Number.isNaN(c.top)) { if (!cur) cur = { i0: c.x, i1: c.x, top: c.top, bot: c.bot, area: 0 }; else { cur.i1 = c.x; cur.top = Math.min(cur.top, c.top); cur.bot = Math.max(cur.bot, c.bot); } cur.area += c.n; }
    else if (cur) { runs.push(cur); cur = null; }
  }
  if (cur) runs.push(cur);
  // Per-run RADIAL extent, over every inked column in the run rather than the
  // run's bounding box. For a legend on a concentric arc the run rLo/rHi are the
  // band's two edges and they should agree glyph to glyph — that agreement is
  // the test of concentricity, and it is per-glyph rather than per-column so a
  // single noisy column cannot set it.
  for (const r of runs) {
    r.w = r.i1 - r.i0; r.cx = (r.i0 + r.i1) / 2;
    r.rLo = Infinity; r.rHi = -Infinity; r.aLo = Infinity; r.aHi = -Infinity;
    for (const c of cols) {
      if (Number.isNaN(c.top) || c.x < r.i0 || c.x > r.i1) continue;
      for (const y of [c.top, c.bot]) {
        const rr = Math.hypot(c.x - 50, y - 50);
        r.rLo = Math.min(r.rLo, rr); r.rHi = Math.max(r.rHi, rr);
        const aa = ((Math.atan2(y - 50, c.x - 50) * 180) / Math.PI + 360) % 360;
        r.aLo = Math.min(r.aLo, aa); r.aHi = Math.max(r.aHi, aa);
      }
    }
  }
  const inked = cols.filter((c) => !Number.isNaN(c.top));
  const yTop = inked.length ? Math.min(...inked.map((c) => c.top)) : NaN;
  const yBot = inked.length ? Math.max(...inked.map((c) => c.bot)) : NaN;
  const clip = [];
  const e = 1.5 * (opts.step ?? STEP);
  let rLo = Infinity, rHi = -Infinity;
  for (const c of inked) for (const y of [c.top, c.bot]) {
    const rr = Math.hypot(c.x - 50, y - 50);
    rLo = Math.min(rLo, rr); rHi = Math.max(rHi, rr);
  }
  if (inked.length) {
    if (yTop <= rect[1] + e) clip.push('TOP');
    if (yBot >= rect[3] - e) clip.push('BOTTOM');
    if (inked[0].x <= rect[0] + e) clip.push('LEFT');
    if (inked[inked.length - 1].x >= rect[2] - e) clip.push('RIGHT');
    if (rLo <= rMin + 3 * e) clip.push('rMIN');
    if (rHi >= rMax - 3 * e) clip.push('rMAX');
  }
  return { p, mask, T, cols, runs, yTop, yBot, rLo, rHi, rMin, rMax, seedY, seedTol, ambiguous, maxRuns,
    inkFrac: inkN / Math.max(1, inWin), clip, rect, k, open: opts.open ?? 0.15, closeY: opts.closeY ?? 0 };
}

// A sampler with a raw() accessor, which `grab` needs.
export async function inkSampler(file, dx = 0, dy = 0) {
  const sharp = (await import('sharp')).default;
  const s = await sampler(file, dx, dy);
  const REF = (f) => new URL('../ref/' + f, import.meta.url).pathname;
  const { data, info } = await sharp(REF(file)).flatten({ background: '#808080' })
    .greyscale().raw().toBuffer({ resolveWithObject: true });
  s.raw = (x, y) => (x < 0 || y < 0 || x >= info.width || y >= info.height ? NaN : data[y * info.width + x]);
  s.IW = info.width; s.IH = info.height;
  return s;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [file, rectS, freeS] = process.argv.slice(2);
  const rect = rectS.split(',').map(Number), free = freeS.split(',').map(Number);
  const s = await inkSampler(file);
  const sgRaw = sigmaOf(grab(s, free));
  const sg = { ...sgRaw, ...floored(sgRaw.sigma) };
  console.log(`${file}  disc cx ${s.cx} cy ${s.cy} R ${s.R}  step ${STEP}  bgwin ${BGWIN}  k ${K}`);
  console.log(`SIGMA rect (letter-free) ${free.join(',')}  MAD ${sg.mad.toFixed(3)}  sigma ${sg.sigma.toFixed(3)}  n ${sg.n}`
    + (sg.bound ? `  *** SIGMA FLOOR ${SIGMA_FLOOR} BINDS — measured sigma was ${sg.raw.toFixed(4)}, i.e. this reference has a mathematically flat field ***` : ''));
  const opts = {};
  if (process.env.RMIN) opts.rMin = Number(process.env.RMIN);
  if (process.env.SEEDY) opts.seedY = Number(process.env.SEEDY);
  if (process.env.SEEDR) opts.seedR = Number(process.env.SEEDR);
  if (process.env.OPEN) opts.open = Number(process.env.OPEN);
  if (process.env.CLOSEY) opts.closeY = Number(process.env.CLOSEY);
  if (process.env.SEEDTOL) opts.seedTol = Number(process.env.SEEDTOL);
  if (process.env.RMAX) opts.rMax = Number(process.env.RMAX);
  if (process.env.K) opts.k = Number(process.env.K);
  const e = envelope(s, rect, sg.sigma, opts);
  console.log(`§4.1 window bounds x ${rect[0]}..${rect[2]}  y ${rect[1]}..${rect[3]}  r ${e.rMin}..${e.rMax}   threshold ${e.T.toFixed(2)} grey`);
  console.log(`open ${e.open}  closeY ${e.closeY}  seedY ${e.seedY ?? '(none — union of every run)'} tol ${e.seedTol}`
    + `  columns with >1 run ${e.ambiguous}, max runs in a column ${e.maxRuns}`);
  console.log(`ink fraction ${e.inkFrac.toFixed(4)}   envelope y ${e.yTop.toFixed(3)}..${e.yBot.toFixed(3)}   ink r ${e.rLo.toFixed(3)}..${e.rHi.toFixed(3)}`
    + `   ${e.clip.length ? `*** CLIPPED AT ${e.clip.join('+')} — NOT A VALUE ***` : 'clear of every window edge'}`);
  // The extreme of an envelope is one column; the percentile is the legend.
  // Both are printed because they answer different questions — a cap height
  // wants the typical glyph, a containment check wants the worst one.
  const pc = (arr, q) => { const a = arr.slice().sort((m, n) => m - n); return a[Math.min(a.length - 1, Math.floor(q * a.length))]; };
  const tops = e.cols.filter((c) => !Number.isNaN(c.top)).map((c) => c.top);
  const bots = e.cols.filter((c) => !Number.isNaN(c.bot)).map((c) => c.bot);
  console.log(`column tops    p05 ${pc(tops, 0.05).toFixed(3)}  p50 ${pc(tops, 0.5).toFixed(3)}  p95 ${pc(tops, 0.95).toFixed(3)}`);
  console.log(`column bottoms p05 ${pc(bots, 0.05).toFixed(3)}  p50 ${pc(bots, 0.5).toFixed(3)}  p95 ${pc(bots, 0.95).toFixed(3)}`);
  console.log(`runs (§4.2 full candidate set, ${e.runs.length}):`);
  for (const r of e.runs) console.log(`   x ${r.i0.toFixed(2)}..${r.i1.toFixed(2)} w ${r.w.toFixed(2)} cx ${r.cx.toFixed(2)} y ${r.top.toFixed(2)}..${r.bot.toFixed(2)}`
    + `  run r ${r.rLo.toFixed(2)}..${r.rHi.toFixed(2)}  run deg ${r.aLo.toFixed(2)}..${r.aHi.toFixed(2)}`
    + `  mid ${((Math.atan2(((r.top + r.bot) / 2) - 50, r.cx - 50) * 180 / Math.PI + 360) % 360).toFixed(2)}  area ${r.area}`);
  const wide = e.runs.filter((r) => r.w >= Number(process.env.MINW || 2));
  if (wide.length) {
    const med = (a) => { const b = a.slice().sort((m, n) => m - n); return b[b.length >> 1]; };
    console.log(`glyph runs w >= ${process.env.MINW || 2}: ${wide.length}   median run rLo ${med(wide.map((r) => r.rLo)).toFixed(3)}`
      + `  median run rHi ${med(wide.map((r) => r.rHi)).toFixed(3)}  spread of rHi ${(Math.max(...wide.map((r) => r.rHi)) - Math.min(...wide.map((r) => r.rHi))).toFixed(3)}`
      + `  spread of rLo ${(Math.max(...wide.map((r) => r.rLo)) - Math.min(...wide.map((r) => r.rLo))).toFixed(3)}`);
    const degs = wide.map((r) => (Math.atan2(((r.top + r.bot) / 2) - 50, r.cx - 50) * 180 / Math.PI + 360) % 360);
    console.log(`   first glyph centre ${Math.min(...degs).toFixed(2)} deg, last ${Math.max(...degs).toFixed(2)} deg,`
      + ` centre-to-centre span ${(Math.max(...degs) - Math.min(...degs)).toFixed(2)} deg, midpoint ${((Math.max(...degs) + Math.min(...degs)) / 2).toFixed(2)} deg`);
  }

  if (process.argv.includes('--response')) {
    console.log('\n§4 RESPONSE TESTS');
    // (a) flat patch — the §4 one-liner: a letter-free patch must report no ink
    const fe = envelope(s, free, sg.sigma, { ...opts, rMin: 0, rMax: 1e9 });
    console.log(`  (a) FLAT PATCH ${free.join(',')}: ink fraction ${fe.inkFrac.toFixed(4)}  runs ${fe.runs.length}  -> ${fe.inkFrac < 0.01 ? 'PASSES the flat-patch check' : 'FAILS: the letter-free rect reports ink'}`);
    // (b) synthetic response: the SAME window on the same coin's OTHER side,
    //     where this legend does not exist, must not report this legend.
    // (c) half step — a real edge must survive a change of sampling lattice
    const hs = envelope(s, rect, sg.sigma, { ...opts, step: STEP / 2, minRun: 6 });
    console.log(`  (c) HALF STEP: envelope ${hs.yTop.toFixed(3)}..${hs.yBot.toFixed(3)}  dTop ${(hs.yTop - e.yTop).toFixed(3)} dBot ${(hs.yBot - e.yBot).toFixed(3)}  runs ${hs.runs.length} vs ${e.runs.length}`);
    // (d) k sweep — the threshold's own sensitivity, printed rather than argued
    for (const k of [2, 3, 4, 5, 6]) {
      const v = envelope(s, rect, sg.sigma, { ...opts, k });
      console.log(`  (d) k=${k}: envelope ${v.yTop.toFixed(3)}..${v.yBot.toFixed(3)}  ink r ${v.rLo.toFixed(3)}..${v.rHi.toFixed(3)}  runs ${v.runs.length}  inkFrac ${v.inkFrac.toFixed(4)}${v.clip.length ? '  CLIP ' + v.clip.join('+') : ''}`);
    }
    // (e) DISC RESPONSE: move the frozen disc centre 1 photo px and every
    //     reported edge must move by about 47/R viewBox units, not by zero.
    const s2 = await inkSampler(file, 4, 0);
    const de = envelope(s2, rect, sg.sigma, opts);
    console.log(`  (e) DISC +4 photo px in x: envelope ${de.yTop.toFixed(3)}..${de.yBot.toFixed(3)}, runs ${de.runs.length};`
      + ` first run cx ${de.runs.length ? de.runs[0].cx.toFixed(3) : 'n/a'} vs ${e.runs.length ? e.runs[0].cx.toFixed(3) : 'n/a'}`
      + `  (expected shift ${(-4 * 47 / s.R).toFixed(3)} units)`);
  }
}
