// DIME REVERSE — WHERE THE OAK STEM ACTUALLY RUNS, row by row, as a CENTRELINE.
//
// Reports only (WRITERS.md). Never writes into src/.
//
// WHY THIS EXISTS. `_dr13elem.mjs` scores an element by OUTSIDE (ink on bare
// field) against `deviceMask()`. For a THIN mark that number is dominated by
// the mask's own width error, not by placement: `torch()`'s own header records
// that the flood mask reads this stem at 1.15..1.85 units on proofbright and
// 0.35..1.00 on unc2005 where the dark-outline estimator puts it at ~1.95 on
// both. A 1.95-wide stem drawn onto a 0.7-wide mask stripe is >50% "outside"
// however perfectly it is centred. So OUTSIDE cannot separate "wrong place"
// from "mask too thin", and this instrument measures the quantity that can:
// the CENTRELINE, with the same dark-relief-outline estimator (`_dr8shaft.mjs`)
// that loop 1 used to fit `stemC`, so the two are commensurable.
//
// THE ESTIMATOR. On a row, walk outward from an inboard limit to an outboard
// limit and collect DARK RUNS (below a per-file threshold set from that file's
// own field/motif levels). The stem is a mark ~2 units wide; its two relief
// outlines are dark and its interior is device-bright on unc2005 and frosted on
// proofbright, so it presents EITHER as one 2-unit run (outlines merged at this
// scale) or as two thin runs 2 units apart. Both are handled: a run 1.2..3.2
// units wide is taken whole; a pair of runs whose outer edges are 1.2..3.2
// apart is taken as a pair. Anything else is reported as AMBIGUOUS and no
// number is published for that row — the rows where foliage touches the stem
// have no visible boundary and an instrument that returns a number for them is
// inventing one (`_dr8shaft.mjs`'s rejected estimator #2).
//
// BOTH BRANCHES ARE READ, and the olive's offsets are compared to the oak's
// directly, because the drawing uses ONE path mirrored and the open question is
// whether the coin does.
//
// usage:
//   node _dr14oakstem.mjs profile      scanline pictures, both files, both sides
//   node _dr14oakstem.mjs line         the centreline table + fits
import { samplerFor } from './_dr2grid.mjs';

const REFS = ['dime-rev-proofbright.png', 'dime-rev-unc2005.png'];
const STEP = 0.05;

const sample = (at, x, y) => (at(x, y - 0.12) + at(x, y) + at(x, y + 0.12)) / 3;

/** offset -> viewBox x, for the oak (f=+1) or the olive (f=-1) */
const X = (f, o) => 50 + f * o;

/**
 * Field and motif levels for one file, read where this face is empty and where
 * it is solid: the outer field ring just inside the rim (r 40..44) and the
 * torch shaft's interior. Returns a threshold midway between them.
 */
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

/** dark runs on row `y` between offsets [a,b] on side `f` */
function darkRuns(at, y, f, a, b, T) {
  const runs = [];
  let s = null;
  for (let o = a; o <= b; o += STEP) {
    const dark = sample(at, X(f, o), y) < T;
    if (dark && s === null) s = o;
    if (!dark && s !== null) { if (o - s >= 0.15) runs.push([s, o - STEP]); s = null; }
  }
  if (s !== null) runs.push([s, b]);
  return runs;
}

const WMIN = 1.1, WMAX = 3.4;

/**
 * The stem on row `y`, side `f`, searched in offsets [a,b].
 *
 * A PAIR OF OUTLINES BEATS A SINGLE RUN. On unc2005 the stem's two relief
 * outlines are resolved with a bright interior between them, so the mark
 * presents as two thin runs ~2 units apart; taking the inboard one alone as a
 * "whole" stem shifts the answer a full unit inboard and reads a 1.15-unit
 * width for a 2-unit mark. That is exactly the error that made the first run of
 * this instrument report unc2005's oak at 14.4 against proofbright's 16.2.
 * Pairs are therefore resolved first and a lone run is accepted only when no
 * pair exists.
 */
function stemOn(at, y, f, a, b, T) {
  const runs = darkRuns(at, y, f, a, b, T);
  const thin = (r) => r[1] - r[0] <= 1.3;
  const pairs = [];
  for (let i = 0; i < runs.length - 1; i++) {
    const w = runs[i + 1][1] - runs[i][0];
    if (w >= WMIN && w <= WMAX && thin(runs[i]) && thin(runs[i + 1])) pairs.push([runs[i][0], runs[i + 1][1]]);
  }
  const whole = runs.filter((r) => r[1] - r[0] >= WMIN && r[1] - r[0] <= WMAX);
  const cand = pairs.length ? pairs : whole;
  if (cand.length !== 1) return { amb: true, runs, n: cand.length };
  const [p, q] = cand[0];
  return { c: (p + q) / 2, w: q - p, runs };
}

// ROWS THAT CANNOT BE READ AT ALL, and are not offered to the estimator:
// E PLURIBUS UNUM crosses both branches at y 62.5..67.5 on both files, and
// ONE DIME's caps stand at offsets 19+ from y 75 down. A number returned on
// those rows is a letter, not a stem.
const LETTERS = (y) => y >= 62.5 && y <= 67.5;

const files = {};
for (const f of REFS) {
  const s = await samplerFor(f);
  const L = levels(s.at);
  files[f] = { at: s.at, L, T: (L.field + L.solid) / 2 };
}

const mode = process.argv[2] || 'profile';

if (mode === 'profile') {
  console.log('SCANLINE PROFILES on each branch, offsets 6..26 from the coin axis at 0.25 units');
  console.log('  (. brightest  : - = * # @ darkest, thresholded on each file\'s own levels)\n');
  for (const f of REFS) {
    const { at, L, T } = files[f];
    console.log(`  == ${f}   field ${L.field.toFixed(0)}  solid ${L.solid.toFixed(0)}  dark<${T.toFixed(0)}`);
    for (const [side, sign] of [['OAK  ', +1], ['OLIVE', -1]]) {
      console.log(`   -- ${side}`);
      for (let y = 36; y <= 79; y += 1) {
        let line = `   y=${String(y).padStart(3)} `;
        for (let o = 6; o <= 26; o += 0.25) {
          const v = sample(at, X(sign, o), y);
          const d = (v - L.solid) / (L.field - L.solid || 1);
          line += d > 0.85 ? '.' : d > 0.7 ? ':' : d > 0.55 ? '-' : d > 0.4 ? '=' : d > 0.25 ? '*' : d > 0.1 ? '#' : '@';
        }
        console.log(line);
      }
      console.log('         6   8   10  12  14  16  18  20  22  24  26');
    }
  }
  process.exit(0);
}

if (mode === 'line') {
  // our own drawn centreline, from the shipped constants
  const SC = { a: 15.96, b: -0.0294, at: 62.5, tail: 71, tip: 75.7, top: 38.4 };
  const stemC = (y) => (y <= SC.tail ? SC.a + SC.b * (y - SC.at)
    : 15.71 - 0.0778 * (y - SC.tail) - 0.0586 * (y - SC.tail) ** 2);
  const A = Number(process.argv[3] ?? 11), B = Number(process.argv[4] ?? 22);

  console.log(`centreline read, offsets ${A}..${B}, dark-outline runs  (— = ambiguous, no number)\n`);
  console.log('    y |    pb oak      pb olive |   unc oak     unc olive |   ours');
  const rows = {};
  for (let y = 38; y <= 78; y += 0.5) {
    const cells = [];
    rows[y] = {};
    for (const f of REFS) for (const [k, sign] of [['oak', +1], ['olive', -1]]) {
      const r = LETTERS(y) ? { amb: true, n: 'L' } : stemOn(files[f].at, y, sign, A, B, files[f].T);
      rows[y][`${f}|${k}`] = r;
      cells.push(r.amb ? `   —  (${r.n})` : `${r.c.toFixed(2)}/${r.w.toFixed(2)}`);
    }
    console.log(`${String(y).padStart(5)} | ${cells[0].padStart(11)} ${cells[1].padStart(11)} | `
      + `${cells[2].padStart(11)} ${cells[3].padStart(11)} |  ${stemC(y).toFixed(2)}`);
  }

  // ── the questions, answered with numbers
  const ys = Object.keys(rows).map(Number);
  const both = (k1, k2) => ys.filter((y) => !rows[y][k1].amb && !rows[y][k2].amb);
  const dif = (k1, k2) => { const s = both(k1, k2); return { n: s.length, ys: s,
    d: s.map((y) => rows[y][k1].c - rows[y][k2].c) }; };
  const stat = (a) => { const m = a.reduce((p, q) => p + q, 0) / (a.length || 1);
    const sd = Math.sqrt(a.reduce((p, q) => p + (q - m) ** 2, 0) / (a.length || 1));
    return { m, sd }; };

  console.log('\nIS THE OAK THE MIRROR OF THE OLIVE?  (oak offset − olive offset, same row/file)');
  for (const f of REFS) {
    const d = dif(`${f}|oak`, `${f}|olive`);
    const s = stat(d.d);
    console.log(`  ${f.padEnd(26)} n=${String(d.n).padStart(3)}  mean ${s.m >= 0 ? '+' : ''}${s.m.toFixed(3)}  sd ${s.sd.toFixed(3)}`
      + `  rows ${d.ys.length ? `${Math.min(...d.ys)}..${Math.max(...d.ys)}` : '—'}`);
  }

  console.log('\nOURS vs EACH BRANCH  (ours − coin, + = ours too far outboard)');
  for (const f of REFS) for (const k of ['oak', 'olive']) {
    const s = ys.filter((y) => !rows[y][`${f}|${k}`].amb);
    const d = s.map((y) => stemC(y) - rows[y][`${f}|${k}`].c);
    const st = stat(d);
    console.log(`  ${f.slice(9, -4).padEnd(12)} ${k.padEnd(6)} n=${String(s.length).padStart(3)}`
      + `  mean ${st.m >= 0 ? '+' : ''}${st.m.toFixed(3)}  sd ${st.sd.toFixed(3)}`
      + `  rows ${s.length ? `${Math.min(...s)}..${Math.max(...s)}` : '—'}`);
  }

  console.log('\nWIDTH  (median of the read runs)');
  for (const f of REFS) for (const k of ['oak', 'olive']) {
    const w = ys.filter((y) => !rows[y][`${f}|${k}`].amb).map((y) => rows[y][`${f}|${k}`].w).sort((p, q) => p - q);
    console.log(`  ${f.slice(9, -4).padEnd(12)} ${k.padEnd(6)} n=${String(w.length).padStart(3)}  median ${w.length ? w[w.length >> 1].toFixed(2) : '—'}`);
  }

  // least-squares line through the OAK rows only, both files pooled
  const pts = [];
  for (const f of REFS) for (const y of ys) { const r = rows[y][`${f}|oak`]; if (!r.amb) pts.push([y, r.c]); }
  if (pts.length > 2) {
    const my = pts.reduce((p, q) => p + q[0], 0) / pts.length;
    const mc = pts.reduce((p, q) => p + q[1], 0) / pts.length;
    const b = pts.reduce((p, q) => p + (q[0] - my) * (q[1] - mc), 0) / pts.reduce((p, q) => p + (q[0] - my) ** 2, 0);
    const res = pts.map(([y, c]) => c - (mc + b * (y - my)));
    const rms = Math.sqrt(res.reduce((p, q) => p + q * q, 0) / res.length);
    console.log(`\nOAK ALONE, both files pooled, n=${pts.length}:`);
    console.log(`  c(y) = ${(mc).toFixed(3)} ${b >= 0 ? '+' : '−'} ${Math.abs(b).toFixed(5)}·(y − ${my.toFixed(1)})`
      + `   RMS ${rms.toFixed(3)}  max |res| ${Math.max(...res.map(Math.abs)).toFixed(3)}`);
    console.log(`  shipped stemC: c(y) = 15.960 − 0.02940·(y − 62.5)`);
  }
  process.exit(0);
}

// ── WHERE THE OUTSIDE INK IS, and WHY — the decomposition `_dr13elem.mjs`'s
// single OUTSIDE percentage cannot give. For each drawn stem, row by row:
// the drawn span, the mask's stripe nearest it, and the outside ink split into
//   TOO WIDE   our span covers the stripe and overhangs it on both sides
//   OFF SET    our span sits to one side of the stripe
//   NO STRIPE  the mask carries nothing on that row at all
// This is what separates "wrong place" from "the mask cannot see a thin mark".
if (mode === 'outside') {
  const { deviceMask } = await import('./_dr9branch.mjs');
  const { nodes, resolve } = await import('./_dr13elem.mjs');
  const { coinSVG } = await import('../../src/art/coins.js');
  const sharp = (await import('sharp')).default;
  const X0 = 13, X1 = 87, Y0 = 17, Y1 = 85, S = 0.05;
  const MW = Math.round((X1 - X0) / S), MH = Math.round((Y1 - Y0) / S);
  // `--erode N` overrides the mask's own erosion radius, for the control in
  // `control` mode; without it the shipped values are used and the TOTAL line
  // reproduces `_dr13elem.mjs`'s OUTSIDE exactly.
  const EO = process.argv.includes('--erode') ? Number(process.argv[process.argv.indexOf('--erode') + 1]) : null;
  const MASKS = { 'dime-rev-proofbright.png': [236, EO ?? 0.55], 'dime-rev-unc2005.png': [190, EO ?? 1.00] };

  const svg = coinSVG('dime', 380, { side: 'reverse' });
  const { head, out } = nodes(svg);
  const rasterise = async (doc) => {
    const full = Math.round(100 / S);
    const { data, info } = await sharp(Buffer.from(doc)).resize(full, full, { fit: 'fill' })
      .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const ink = new Uint8Array(MW * MH);
    for (let j = 0; j < MH; j++) {
      const sy = Math.round((Y0 + j * S) / S);
      for (let i = 0; i < MW; i++) {
        const sx = Math.round((X0 + i * S) / S);
        if (data[(sy * info.width + sx) * info.channels + info.channels - 1] > 24) ink[j * MW + i] = 1;
      }
    }
    return ink;
  };
  const runsIn = (row, arr, j, lo, hi) => {
    const r = []; let s = null;
    for (let i = Math.round((lo - X0) / S); i <= Math.round((hi - X0) / S); i++) {
      const v = arr[j * MW + i];
      if (v && s === null) s = i;
      if (!v && s !== null) { r.push([X0 + s * S, X0 + (i - 1) * S]); s = null; }
    }
    if (s !== null) r.push([X0 + s * S, hi]);
    return r;
  };

  for (const [nodeId, name, lo, hi] of [['2.1.4', 'OAK', 60, 72], ['2.1.19', 'OLIVE', 28, 40]]) {
    const ink = await rasterise(`${head}${resolve(head, out, nodeId)}</svg>`);
    for (const [file, [T, E]] of Object.entries(MASKS)) {
      const mask = await deviceMask(file, T, E);
      console.log(`\n== ${name} stem (node ${nodeId})  ref ${file}`);
      console.log('     y |   our span   |  mask stripes nearest              | out  | verdict');
      let tot = 0, totOut = 0, byCause = { WIDE: 0, OFFSET: 0, NONE: 0, ok: 0 };
      for (let y = 38; y <= 76; y += 0.5) {
        const j = Math.round((y - Y0) / S);
        const ir = runsIn('ink', ink, j, lo, hi);
        if (!ir.length) continue;
        const [a, b] = [ir[0][0], ir[ir.length - 1][1]];
        let n = 0, o = 0;
        for (let i = Math.round((lo - X0) / S); i <= Math.round((hi - X0) / S); i++) {
          if (ink[j * MW + i]) { n++; if (!mask[j * MW + i]) o++; }
        }
        tot += n; totOut += o;
        const mr = runsIn('mask', mask, j, lo, hi).filter((r) => r[1] - r[0] >= 0.15);
        const near = mr.length ? mr.reduce((p, q) =>
          Math.abs((q[0] + q[1]) / 2 - (a + b) / 2) < Math.abs((p[0] + p[1]) / 2 - (a + b) / 2) ? q : p) : null;
        let v;
        if (!near) { v = 'NO STRIPE'; byCause.NONE += o; }
        else if (near[0] <= a + 0.1 && near[1] >= b - 0.1) { v = 'inside'; byCause.ok += o; }
        else if (a <= near[0] + 0.1 && b >= near[1] - 0.1) { v = `TOO WIDE  (ours ${(b - a).toFixed(2)} vs mask ${(near[1] - near[0]).toFixed(2)})`; byCause.WIDE += o; }
        else { v = `OFFSET    (ours ${((a + b) / 2).toFixed(2)} vs mask ${((near[0] + near[1]) / 2).toFixed(2)})`; byCause.OFFSET += o; }
        console.log(`  ${String(y).padStart(4)} | ${a.toFixed(2)}..${b.toFixed(2)} | `
          + (mr.length ? mr.map((r) => `${r[0].toFixed(1)}-${r[1].toFixed(1)}`).join(' ').padEnd(34).slice(0, 34) : '(none)'.padEnd(34))
          + ` | ${(o * S * S).toFixed(2)} | ${v}`);
      }
      const u = (v) => (v * S * S).toFixed(2);
      console.log(`  TOTAL ink ${u(tot)}  outside ${u(totOut)} (${(100 * totOut / tot).toFixed(2)}%)`
        + `  —  too wide ${u(byCause.WIDE)}, offset ${u(byCause.OFFSET)}, no stripe ${u(byCause.NONE)}, other ${u(byCause.ok)}`);
    }
  }
  process.exit(0);
}

// ── IS THE OAK THE MIRROR OF THE OLIVE, and does the answer change with y?
//
// THE TEST. A misplaced disc CENTRE moves the measured oak offset by −δ and the
// olive's by +δ, so it adds a CONSTANT −2δ to (oak − olive) and cannot produce
// a y-dependence. A rotation of the fit adds a term linear in (y − 50) whose
// SIGN follows the rotation's, so two files with opposite centre slips would
// need the same rotation sign to fake a shared slope. Therefore:
//
//   the y-VARYING part of (oak − olive) is real asymmetry, on any one file,
//   and a slope that AGREES between two independent photographs is not a
//   fitting artefact of either.
//
// Loop 1 established the constant part is registration (half-differences −0.33
// pb / +0.61 unc, opposite signs, same size) and pooled it away. This asks the
// question loop 1 did not: whether the constant is actually constant.
if (mode === 'foot') {
  const A = Number(process.argv[3] ?? 12), B = Number(process.argv[4] ?? 19);
  const read = (f, sign, y) => (LETTERS(y) ? { amb: true } : stemOn(files[f].at, y, sign, A, B, files[f].T));
  // Rows are hand-listed and printed, as `_dr8shaft.mjs` does: only where BOTH
  // branches on THIS file return a run, and where the row-to-row step is under
  // 0.5 units on both, which is what rules out a jump onto a leaf or a letter.
  console.log('OAK − OLIVE by row, per file. Constant ⇒ registration; sloped ⇒ real.\n');
  const fits = {};
  for (const f of REFS) {
    const pts = [];
    console.log(`  == ${f}`);
    let prev = null;
    for (let y = 55; y <= 76; y += 0.5) {
      const a = read(f, +1, y), o = read(f, -1, y);
      if (a.amb || o.amb) { prev = null; continue; }
      const d = a.c - o.c;
      const jump = prev && Math.abs(d - prev) > 0.5;
      console.log(`   y=${String(y).padStart(4)}  oak ${a.c.toFixed(2)}/${a.w.toFixed(2)}   olive ${o.c.toFixed(2)}/${o.w.toFixed(2)}`
        + `   diff ${d >= 0 ? '+' : ''}${d.toFixed(2)}${jump ? '   <- step >0.5, dropped' : ''}`);
      if (!jump) pts.push([y, d]);
      prev = d;
    }
    if (pts.length > 2) {
      const my = pts.reduce((p, q) => p + q[0], 0) / pts.length;
      const md = pts.reduce((p, q) => p + q[1], 0) / pts.length;
      const b = pts.reduce((p, q) => p + (q[0] - my) * (q[1] - md), 0)
        / pts.reduce((p, q) => p + (q[0] - my) ** 2, 0);
      const res = pts.map(([y, d]) => d - (md + b * (y - my)));
      const rms = Math.sqrt(res.reduce((p, q) => p + q * q, 0) / res.length);
      const flat = Math.sqrt(pts.reduce((p, q) => p + (q[1] - md) ** 2, 0) / pts.length);
      fits[f] = { b, md, my, rms, flat, n: pts.length };
      console.log(`   fit: diff(y) = ${md.toFixed(3)} ${b >= 0 ? '+' : '−'} ${Math.abs(b).toFixed(4)}·(y − ${my.toFixed(1)})`
        + `   n=${pts.length}  RMS ${rms.toFixed(3)}   (constant-only RMS ${flat.toFixed(3)})\n`);
    }
  }
  const ks = Object.keys(fits);
  if (ks.length === 2) {
    const [p, q] = ks.map((k) => fits[k]);
    console.log(`SLOPES: ${p.b.toFixed(4)} and ${q.b.toFixed(4)} per unit of y`);
    console.log(`  agree to ${Math.abs(p.b - q.b).toFixed(4)}; mean ${((p.b + q.b) / 2).toFixed(4)}`);
    console.log(`  CONSTANTS: ${p.md.toFixed(3)} at y ${p.my.toFixed(1)} and ${q.md.toFixed(3)} at y ${q.my.toFixed(1)}`
      + '  — opposite signs is the registration slip loop 1 named.');
  }
  process.exit(0);
}

// ── THE PICTURE IS THE GATE. `_dr13elem.mjs`'s panels are the whole face at
// 460 px, which is 6 px per viewBox unit — a 2-unit stem is 12 px there and its
// half-unit errors are invisible. This crops to the element and magnifies 4x
// past the mask's own 20 px/unit, both references side by side, so the overhang
// that OUTSIDE is counting can be SEEN rather than inferred from a percentage.
//   node _dr14oakstem.mjs zoom <node> <x0> <x1> <y0> <y1>
if (mode === 'zoom') {
  const { deviceMask } = await import('./_dr9branch.mjs');
  const { nodes, resolve } = await import('./_dr13elem.mjs');
  const { coinSVG } = await import('../../src/art/coins.js');
  const { join } = await import('node:path');
  const { JUDGE } = await import('./_paths.mjs');
  const sharp = (await import('sharp')).default;
  const X0 = 13, X1 = 87, Y0 = 17, Y1 = 85, S = 0.05;
  const MW = Math.round((X1 - X0) / S), MH = Math.round((Y1 - Y0) / S);
  const id = process.argv[3];
  const [cx0, cx1, cy0, cy1] = process.argv.slice(4, 8).map(Number);
  const { head, out } = nodes(coinSVG('dime', 380, { side: 'reverse' }));
  const full = Math.round(100 / S);
  const { data, info } = await sharp(Buffer.from(`${head}${resolve(head, out, id)}</svg>`))
    .resize(full, full, { fit: 'fill' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const ink = new Uint8Array(MW * MH);
  for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
    const p = (Math.round((Y0 + j * S) / S) * info.width + Math.round((X0 + i * S) / S)) * info.channels;
    if (data[p + info.channels - 1] > 24) ink[j * MW + i] = 1;
  }
  const w = Math.round((cx1 - cx0) / S), h = Math.round((cy1 - cy0) / S), Z = 4;
  const panels = [];
  for (const [f, T, E] of [['dime-rev-proofbright.png', 236, 0.55], ['dime-rev-unc2005.png', 190, 1.00]]) {
    const m = await deviceMask(f, T, E);
    const b = Buffer.alloc(w * h * 3, 255);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const k = (Math.round((cy0 - Y0) / S) + j) * MW + Math.round((cx0 - X0) / S) + i;
      const c = ink[k] && m[k] ? [20, 110, 60] : ink[k] ? [210, 40, 40] : m[k] ? [200, 200, 200] : [255, 255, 255];
      b[(j * w + i) * 3] = c[0]; b[(j * w + i) * 3 + 1] = c[1]; b[(j * w + i) * 3 + 2] = c[2];
    }
    panels.push(await sharp(b, { raw: { width: w, height: h, channels: 3 } })
      .resize(w * Z, h * Z, { kernel: 'nearest' }).png().toBuffer());
  }
  const f = join(JUDGE, `_dr14-zoom-${id}.png`);
  await sharp({ create: { width: w * Z * 2 + 30, height: h * Z, channels: 3, background: '#fff' } })
    .composite([{ input: panels[0], left: 0, top: 0 }, { input: panels[1], left: w * Z + 30, top: 0 }])
    .png().toFile(f);
  console.log(`wrote ${f}  —  proofbright | unc2005, ${Z * 20} px per viewBox unit`);
  console.log('  green = ours on device, RED = ours on bare field, grey = device we do not draw');
  process.exit(0);
}

// ── THE CONTROL: is OUTSIDE measuring the drawing, or the mask's erosion?
//
// `deviceMask(file, T, erodeUnits)` erodes every device region by `erodeUnits`
// ON EVERY SIDE — 0.55 on proofbright, 1.00 on unc2005 — and those constants
// were calibrated against the TORCH SHAFT, which is 5..10 units wide, where
// they cost 11..20% of the mark. The stem is ~2 units wide, where 1.00 a side
// costs ALL of it. The prediction is arithmetic: a 2.0-unit stripe survives as
// 0.90 on proofbright and 0.00 on unc2005.
//
// THIS DOES NOT CHANGE THE MASK. `deviceMask` is called unmodified; only its
// own erosion argument is swept, and the shipped values are printed alongside
// so the gate's number stays the gate's number. If OUTSIDE collapses when the
// erosion is removed, OUTSIDE was measuring the erosion.
if (mode === 'control') {
  const { deviceMask } = await import('./_dr9branch.mjs');
  const { nodes, resolve } = await import('./_dr13elem.mjs');
  const { coinSVG } = await import('../../src/art/coins.js');
  const sharp = (await import('sharp')).default;
  const X0 = 13, X1 = 87, Y0 = 17, Y1 = 85, Sg = 0.05;
  const MW = Math.round((X1 - X0) / Sg), MH = Math.round((Y1 - Y0) / Sg);
  const { head, out } = nodes(coinSVG('dime', 380, { side: 'reverse' }));
  const inkOf = async (id) => {
    const full = Math.round(100 / Sg);
    const { data, info } = await sharp(Buffer.from(`${head}${resolve(head, out, id)}</svg>`))
      .resize(full, full, { fit: 'fill' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const a = new Uint8Array(MW * MH);
    for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
      const p = (Math.round((Y0 + j * Sg) / Sg) * info.width + Math.round((X0 + i * Sg) / Sg)) * info.channels;
      if (data[p + info.channels - 1] > 24) a[j * MW + i] = 1;
    }
    return a;
  };
  const oak = await inkOf('2.1.4'), olive = await inkOf('2.1.19');
  console.log('OUTSIDE %% of each stem vs the mask\'s own erosion radius\n');
  console.log('  file          erode |    oak    olive   |  mask stem stripe width, y 62..69');
  for (const [f, T, shipped] of [['dime-rev-proofbright.png', 236, 0.55], ['dime-rev-unc2005.png', 190, 1.00]]) {
    for (const e of [0, 0.25, 0.55, 1.00]) {
      const m = await deviceMask(f, T, e);
      const pct = (ink) => {
        let n = 0, o = 0;
        for (let k = 0; k < MW * MH; k++) if (ink[k]) { n++; if (!m[k]) o++; }
        return (100 * o / n).toFixed(2).padStart(6);
      };
      // stripe width on the oak side, x 63..69, median over y 62..69
      const ws = [];
      for (let y = 62; y <= 69; y += 0.5) {
        const j = Math.round((y - Y0) / Sg);
        let best = 0, run = 0;
        for (let i = Math.round((63 - X0) / Sg); i <= Math.round((69 - X0) / Sg); i++) {
          run = m[j * MW + i] ? run + 1 : 0; if (run > best) best = run;
        }
        ws.push(best * Sg);
      }
      ws.sort((p, q) => p - q);
      console.log(`  ${f.slice(9, -4).padEnd(12)} ${e.toFixed(2)}${e === shipped ? '*' : ' '} | ${pct(oak)} ${pct(olive)}   |  ${ws[ws.length >> 1].toFixed(2)}`);
    }
  }
  console.log('\n  * = the value `_dr13elem.mjs` scores with.');
  console.log('  The coin\'s own stem width, dark-outline estimator (torch() header, and');
  console.log('  reproduced by `line` above): 1.58 .. 2.42, pooled ~2.0 units.');
  process.exit(0);
}

// ── IS `WINDOWS['oak-stem']` A WINDOW A STEM COULD FILL?
//
// A window is a declaration and FILL is only meaningful if the element could,
// drawn perfectly, fill most of it. This computes the CEILING: the fraction of
// the window's exclusive target that lies within one stem half-width of the
// coin's own stem centreline. Everything beyond that is mask the stem could
// only reach by ceasing to be a stem, and a specialist chasing it over-draws.
if (mode === 'window') {
  const { deviceMask } = await import('./_dr9branch.mjs');
  const { nodes, resolve } = await import('./_dr13elem.mjs');
  const { coinSVG } = await import('../../src/art/coins.js');
  const sharp = (await import('sharp')).default;
  const X0 = 13, X1 = 87, Y0 = 17, Y1 = 85, Sg = 0.05;
  const MW = Math.round((X1 - X0) / Sg), MH = Math.round((Y1 - Y0) / Sg);
  const WIN = [62, 70, 36, 78];
  const SC = { a: 15.96, b: -0.0294, at: 62.5, tail: 71, tip: 75.7, top: 38.4 };
  const cLine = (y) => (y <= SC.tail ? SC.a + SC.b * (y - SC.at)
    : 15.71 - 0.0778 * (y - SC.tail) - 0.0586 * (y - SC.tail) ** 2);
  const { head, out } = nodes(coinSVG('dime', 380, { side: 'reverse' }));
  const inkOf = async (frag) => {
    const full = Math.round(100 / Sg);
    const { data, info } = await sharp(Buffer.from(`${head}${frag}</svg>`))
      .resize(full, full, { fit: 'fill' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const a = new Uint8Array(MW * MH);
    for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
      const p = (Math.round((Y0 + j * Sg) / Sg) * info.width + Math.round((X0 + i * Sg) / Sg)) * info.channels;
      if (data[p + info.channels - 1] > 24) a[j * MW + i] = 1;
    }
    return a;
  };
  // everything else on the face, exactly as _dr13elem.mjs builds it
  const others = new Uint8Array(MW * MH);
  {
    const kids = (() => { let l = out, n = null;
      for (const q of [2, 1]) { n = l[q]; if (n && n.startsWith('<g')) l = nodes(`<svg>${n.slice(n.indexOf('>') + 1, n.lastIndexOf('</g>'))}</svg>`).out; }
      return l; })();
    for (let q = 0; q < kids.length; q++) {
      if (q === 4) continue;
      const a = await inkOf(resolve(head, out, `2.1.${q}`));
      for (let k = 0; k < MW * MH; k++) if (a[k]) others[k] = 1;
    }
    for (let q = 0; q < out.length; q++) if (out[q].startsWith('<text')) {
      const a = await inkOf(out[q]); for (let k = 0; k < MW * MH; k++) if (a[k]) others[k] = 1;
    }
  }
  console.log(`WINDOWS['oak-stem'] = [${WIN.join(', ')}]  —  what could a perfect stem fill?\n`);
  for (const [f, T, E] of [['dime-rev-proofbright.png', 236, 0.55], ['dime-rev-unc2005.png', 190, 1.00]]) {
    const m = await deviceMask(f, T, E);
    let tgt = 0, ex = 0, reach = 0, above = 0;
    for (let j = 0; j < MH; j++) {
      const y = Y0 + j * Sg; if (y < WIN[2] || y > WIN[3]) continue;
      for (let i = 0; i < MW; i++) {
        const x = X0 + i * Sg; if (x < WIN[0] || x > WIN[1]) continue;
        const k = j * MW + i; if (!m[k]) continue;
        tgt++;
        if (others[k]) continue;
        ex++;
        if (y >= SC.top && y <= SC.tip && Math.abs((x - 50) - cLine(y)) <= 1.175) reach++;
        if (y < 54) above++;
      }
    }
    const u = (v) => (v * Sg * Sg).toFixed(2);
    console.log(`  ${f.slice(9, -4).padEnd(12)}  raw target ${u(tgt)}   exclusive ${u(ex)}`);
    console.log(`      reachable by a 2.35-wide stem on the coin's own centreline: ${u(reach)}`
      + `  =  CEILING ${(100 * reach / ex).toFixed(1)}% of exclusive`);
    console.log(`      of the exclusive target, ${u(above)} sq units (${(100 * above / ex).toFixed(0)}%) is above y 54,`
      + ' where the oak\'s own foliage stands and no stem can be.\n');
  }
  process.exit(0);
}

console.log('usage: node _dr14oakstem.mjs [profile|line [a b]|outside|foot|control|window|zoom <node> <x0> <x1> <y0> <y1>]');
