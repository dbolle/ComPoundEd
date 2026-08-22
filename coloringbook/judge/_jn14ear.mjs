// _jn14ear — IS THE NICKEL'S `ear` GLYPH DRAWN ON HAIR?
//
// §7 of COIN-ART-METHOD: "do not add anatomy the coin does not have." The
// quarter's ear was removed on exactly this evidence. This asks the same
// question of the nickel, on BOTH usable references, and it asks it in the
// picture (§4.3 / PY7): every number below has an overlay beside it.
//
// WHAT IT MEASURES
//   1. the ear glyph's own footprint, flattened from the string `ear()` really
//      emits for OBVERSE.nickel — not from the literal, which is only the
//      translate. Halo'd by half the emitted stroke width.
//   2. median luminance inside that footprint / the frozen `cheek` patch, on
//      each reference. The wig on this coin is BRIGHTER than the cheek (both
//      references, three patches, 1.15-1.39); bare cheek is 1.00 by
//      construction; a helix fold is a shadow and reads BELOW 1.
//   3. a horizontal band scan across the head at the glyph's own y band, so the
//      wig's front edge is located rather than assumed. This is §13.2's band
//      map, run BEFORE anything is drawn.
//
// NULL TEST (§4.1). The scan prints its sweep bounds; an edge reported at a
// bound is printed as `AT BOUND` and is not a value.
// RESPONSE TEST (§4). `RESPONSE=1` moves the glyph 9 local units forward onto
// open cheek. Its ratios must rise toward 1.00 and the classification must
// change. A second control samples the frozen `hairCrown` and `cheek` patches
// through the identical sampler, so the ratio scale is anchored at both ends.
// SELECTION TEST (§4.2). Every reference considered is printed with the reason
// it is in or out, not only the ones used.
//
// Run: node coloringbook/judge/_jn14ear.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { localToPx, localToUV, pxPerLocal, DISC, TP, REFP, flatten, SCALE_O5 } from './_jn14map.mjs';

const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
// The subject of this instrument is the `ear` LITERAL, so it has to keep
// working after that literal is removed — which is the whole point of the
// round. It reads the live tree first and falls back to the round's pristine
// copy, and always prints which revision the glyph came from.
const LIVE = new URL('../../src/art/coins.js', import.meta.url).pathname;
const PRISTINE = new URL('./_jn14-before-coins.js', import.meta.url).pathname;
async function earLiteral(p) {
  const raw = readFileSync(p, 'utf8');
  const m = raw.match(/who: 'Jefferson'[^}]*?ear: \[([-\d., ]+)\]/);
  return m ? m[1].split(',').map(Number) : null;
}
const SRC = process.env.ART || LIVE;
let GLYPH = await earLiteral(SRC), FROM = SRC;
if (!GLYPH) { GLYPH = await earLiteral(PRISTINE); FROM = PRISTINE; }
if (!GLYPH) throw new Error('no OBVERSE.nickel.ear literal in either revision');
const [k, ex, ey] = GLYPH;

// ── the glyph, as emitted ───────────────────────────────────────────────────
// `ear()` is a shared helper and is NOT touched. Its two path strings are
// transcribed here and translated by the literal exactly as the template does.
const SHIFT = process.env.RESPONSE ? 9 : 0;
const EAR_PATHS = [
  { d: 'M 3.0 -4.4 C -1.8 -5.0 -4.8 -1.0 -4.2 3.6 C -3.6 7.6 -0.8 10.0 2.6 9.6', w: 1.8 },
  { d: 'M 1.2 -0.6 c -1.8 0.8 -2.0 3.8 -0.4 5.0', w: 1.4 },
];
// the emitted stroke-width is n2(w/k) inside a group scaled by k, so the width
// in LOCAL units is w (to the 0.01 the n2 rounds to).
const strokes = EAR_PATHS.map((p) => ({
  w: p.w,
  pts: flatten(p.d).map(([x, y]) => [ex + SHIFT + k * x, ey + k * y]),
}));
const allPts = strokes.flatMap((s) => s.pts);
const BOX = {
  x0: Math.min(...allPts.map((p) => p[0])) - 0.9,
  x1: Math.max(...allPts.map((p) => p[0])) + 0.9,
  y0: Math.min(...allPts.map((p) => p[1])) - 0.9,
  y1: Math.max(...allPts.map((p) => p[1])) + 0.9,
};

// distance from a point to a polyline, in local units
const distTo = (p, poly) => { let m = 1e9;
  for (let i = 1; i < poly.length; i++) { const a = poly[i - 1], b = poly[i];
    const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
    let t = L ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L : 0; t = Math.max(0, Math.min(1, t));
    m = Math.min(m, Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy)); }
  return m; };
const onGlyph = (p) => strokes.some((s) => distTo(p, s.pts) <= s.w / 2);

// ── references ──────────────────────────────────────────────────────────────
const REFS = [
  { file: 'nickel-obv-unc2004.jpg', use: true, why: 'frozen fit in _jn6discs.json; 1523x1500. NOT independent of nickel-obv.jpg (NCC 0.9674).' },
  { file: 'nickel-obv.jpg', use: true, why: 'the target of record. SAME PHOTOGRAPH as unc2004 — carried only to show the pair agrees.' },
  { file: 'nickel-obv-5.JPG', use: true, why: 'the ONLY genuinely independent struck reference (NCC 0.2817). Reached through the composed ICP.' },
  { file: 'nickel-obv-3.png', use: false, why: 'Schlag PLASTER MODEL — shape target only, never photometric (_tonepatches-nickel.json).' },
  { file: 'nickel-obv-proof.png', use: false, why: 'photometric exclusion by name, r6 brief.' },
  { file: 'nickel-obv-4.jpg', use: false, why: 'disc fit AMBIGUOUS at 62.13% residual (_jn1discs.json).' },
];
console.log('### _jn14ear — the ear glyph, measured on the photographs.');
console.log('### §4.2 selection test — every reference in the directory and its disposition:');
for (const r of REFS) console.log(`  ${r.use ? 'USE ' : 'OUT '} ${r.file.padEnd(24)} ${r.why}`);
console.log(`\nglyph: ear(${k}, ${ex}, ${ey})  read from ${FROM}${SHIFT ? `  [RESPONSE VARIANT: +${SHIFT} local x]` : ''}`);
console.log(`glyph box, LOCAL units (stroke halo included): x ${BOX.x0.toFixed(2)} .. ${BOX.x1.toFixed(2)}   y ${BOX.y0.toFixed(2)} .. ${BOX.y1.toFixed(2)}`);

async function grey(f) {
  const o = await sharp(REFP(f)).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { d: o.data, w: o.info.width, h: o.info.height };
}
const at = (g, x, y) => (x < 0 || y < 0 || x >= g.w || y >= g.h ? null : g.d[Math.round(y) * g.w + Math.round(x)]);
const med = (a) => { if (!a.length) return null; const s = [...a].sort((p, q) => p - q); return s[s.length >> 1]; };

// sample a set of LOCAL points on a reference
function sampleLocal(g, file, pts) {
  const v = [];
  for (const [lx, ly] of pts) { const [X, Y] = localToPx(file, lx, ly); const s = at(g, X, Y); if (s !== null) v.push(s); }
  return { med: med(v), n: v.length };
}
// a filled local disc of radius r
function discPts(lx, ly, r, step) {
  const p = [];
  for (let x = -r; x <= r; x += step) for (let y = -r; y <= r; y += step) if (x * x + y * y <= r * r) p.push([lx + x, ly + y]);
  return p;
}

const cheekP = TP.patches.find((p) => p.name === 'cheek');
const crownP = TP.patches.find((p) => p.name === 'hairCrown');
const midP = TP.patches.find((p) => p.name === 'hairMid');

const rows = [];
for (const r of REFS.filter((x) => x.use)) {
  const g = await grey(r.file);
  const ppl = pxPerLocal(r.file);
  const step = Math.max(0.08, 0.5 / ppl); // ~2 samples per reference pixel
  const cheek = sampleLocal(g, r.file, discPts(...cheekP.local, step));
  const crown = sampleLocal(g, r.file, discPts(...crownP.local, step));
  const mid = sampleLocal(g, r.file, discPts(...midP.local, step));
  // the glyph's own stroke footprint
  const foot = [];
  for (let x = BOX.x0; x <= BOX.x1; x += step) for (let y = BOX.y0; y <= BOX.y1; y += step) if (onGlyph([x, y])) foot.push([x, y]);
  const glyph = sampleLocal(g, r.file, foot);
  // the whole box
  const boxPts = [];
  for (let x = BOX.x0; x <= BOX.x1; x += step) for (let y = BOX.y0; y <= BOX.y1; y += step) boxPts.push([x, y]);
  const box = sampleLocal(g, r.file, boxPts);
  rows.push({ file: r.file, ppl, cheek, crown, mid, glyph, box, g, step });
}

console.log('\n### 1. WHAT IS UNDER THE GLYPH, as a ratio to the frozen `cheek` patch');
console.log('    anchors: `cheek` = 1.000 by construction; `hairCrown` and `hairMid` are frozen WIG patches.');
console.log('reference                 px/local   cheek  hairCrown  hairMid  |  GLYPH STROKE   GLYPH BOX');
for (const r of rows) {
  const q = (s) => (s.med / r.cheek.med).toFixed(3).padStart(9);
  console.log(`${r.file.padEnd(26)}${r.ppl.toFixed(2).padStart(7)}${String(r.cheek.med).padStart(8)}${q(r.crown)}${q(r.mid)}  |${q(r.glyph)}   ${q(r.box)}   (n=${r.glyph.n})`);
}

// ── 2. the band scan: where is the wig's front edge, at the glyph's y? ───────
const YB = [BOX.y0, BOX.y1];
const XSWEEP = [22, -36]; // local x, from the nose side back past the rear of the head
console.log(`\n### 2. BAND SCAN across the head at the glyph's own y band (${YB[0].toFixed(1)} .. ${YB[1].toFixed(1)}),`);
console.log(`    swept in local x over BOUNDS [${XSWEEP[0]}, ${XSWEEP[1]}] (§4.1: an edge at a bound is not a value).`);
console.log('    each cell is median(luminance)/cheek over a 1-unit-wide column across the band.\n');
const XS = [];
for (let x = XSWEEP[0]; x >= XSWEEP[1]; x -= 1) XS.push(x);
console.log('local x   ' + XS.filter((x) => x % 2 === 0).map((x) => String(x).padStart(6)).join(''));
const edges = {};
for (const r of rows) {
  const prof = XS.map((x) => {
    const pts = [];
    for (let dx = -0.5; dx <= 0.5; dx += r.step) for (let y = YB[0]; y <= YB[1]; y += r.step) pts.push([x + dx, y]);
    const s = sampleLocal(r.g, r.file, pts);
    return s.med === null ? null : s.med / r.cheek.med;
  });
  console.log(r.file.padEnd(10) + XS.map((x, i) => (x % 2 === 0 ? (prof[i] === null ? '  --  ' : prof[i].toFixed(2).padStart(6)) : '')).join(''));
  // the wig's front edge: the most forward x at which the column reaches 1.10
  // AND stays >= 1.05 for the next three columns (a step, not a speckle).
  let e = null;
  for (let i = 0; i < XS.length - 3; i++) {
    if (prof[i] >= 1.10 && prof[i + 1] >= 1.05 && prof[i + 2] >= 1.05 && prof[i + 3] >= 1.05) { e = XS[i]; break; }
  }
  edges[r.file] = e;
  console.log(`           wig front edge (first x with >=1.10 sustained): ${e === null ? 'NOT FOUND IN BOUNDS' : e + (e === XSWEEP[0] ? '  AT BOUND — not a value' : '')}`);
}

// ── 3. the overlays (§4.3) ──────────────────────────────────────────────────
async function overlay(file, tag) {
  const m = await sharp(REFP(file)).metadata();
  const P = (lx, ly) => localToPx(file, lx, ly);
  const poly = (pts, col, w) => `<polyline points="${pts.map((p) => { const q = P(p[0], p[1]); return `${q[0].toFixed(1)},${q[1].toFixed(1)}`; }).join(' ')}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
  const ppl = pxPerLocal(file);
  const g = [];
  // the glyph itself, at its emitted stroke width
  for (const s of strokes) g.push(poly(s.pts, '#ff2d55', s.w * ppl));
  // its box
  g.push(poly([[BOX.x0, BOX.y0], [BOX.x1, BOX.y0], [BOX.x1, BOX.y1], [BOX.x0, BOX.y1], [BOX.x0, BOX.y0]], '#ffd60a', Math.max(2, 0.35 * ppl)));
  // the frozen wig patches, for scale
  for (const n of ['cheek', 'hairCrown', 'hairMid', 'hairBack']) {
    const p = TP.patches.find((q) => q.name === n);
    const c = P(p.local[0], p.local[1]);
    g.push(`<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(p.local[2] * ppl).toFixed(1)}" fill="none" stroke="#00e5ff" stroke-width="${Math.max(2, 0.25 * ppl)}"/>`);
    g.push(`<text x="${(c[0] + p.local[2] * ppl + 4).toFixed(1)}" y="${(c[1] + 6).toFixed(1)}" font-family="monospace" font-size="${Math.max(12, 2.2 * ppl).toFixed(0)}" fill="#00e5ff">${n}</text>`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${m.width}" height="${m.height}">${g.join('')}</svg>`;
  const out = HERE(`_jn14ear-${tag}.png`);
  // NOTE: sharp applies `extract` BEFORE `composite` in one pipeline, so the
  // zoom has to run on the composited BUFFER or the full-size overlay is
  // composited onto an already-cropped base and sharp throws.
  const full = await sharp(REFP(file)).composite([{ input: Buffer.from(svg) }]).png().toBuffer();
  await sharp(full).toFile(out);
  const c0 = P(BOX.x0, BOX.y0), c1 = P(BOX.x1, BOX.y1);
  const pad = 14 * ppl;
  const left = Math.max(0, Math.round(Math.min(c0[0], c1[0]) - pad)), top = Math.max(0, Math.round(Math.min(c0[1], c1[1]) - pad));
  const w = Math.min(m.width - left, Math.round(Math.abs(c1[0] - c0[0]) + 2 * pad));
  const h = Math.min(m.height - top, Math.round(Math.abs(c1[1] - c0[1]) + 2 * pad));
  await sharp(full).extract({ left, top, width: w, height: h })
    .resize({ width: 560 }).png().toFile(HERE(`_jn14ear-${tag}-zoom.png`));
  return [out, HERE(`_jn14ear-${tag}-zoom.png`)];
}
console.log('\n### 3. OVERLAYS (§4.3) — the glyph and its box drawn on each source:');
for (const r of rows) {
  const tag = r.file.replace(/[^a-z0-9]/gi, '_') + (SHIFT ? '-resp' : '');
  const [a, b] = await overlay(r.file, tag);
  console.log(`  ${a.split('/').pop()}   ${b.split('/').pop()}`);
}
console.log(`\ncomposed ICP scale obv.jpg -> -5.JPG = ${SCALE_O5.toFixed(4)} (as _jn6tone.mjs)`);
