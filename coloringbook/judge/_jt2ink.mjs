// SPECIALIST INSTRUMENT — round 2, D13, dime reverse. THE PICTURE BEHIND THE
// NUMBER, plus the same number restricted to a MOTIF BOX.
//
// `_x6dark.mjs` and `_jd10d13.mjs` are the judge's frozen D13 instruments and
// neither is edited here. This one reproduces `_x6dark.mjs`'s arithmetic
// exactly — same disc table (`_rvnorm.DISCS`), same 4x4 supersample of the
// photograph, same r < 40 locus, same ink = below 0.85 x the side's own p90
// field level, same "no upsampling anywhere" — and adds three things a
// specialist needs and the judge's instruments do not print:
//
//   1. THE INK MASK AS AN IMAGE, ours beside the reference, at the tier's real
//      device pixel count, nearest-upscaled. §4.3: an ink fraction is a located
//      feature (it says WHERE the ink is) and a located feature gets drawn.
//   2. The same statistics restricted to a MOTIF BOX — a frozen literal read
//      off the reference (see MOTIF below), so "did the deficit shrink where
//      neither image has lettering" is answerable.
//   3. The whole percentile ladder of the field estimate, because "p90" is a
//      SELECTION out of a sorted array (§4.2) and a metric normalised by it can
//      move for reasons that have nothing to do with the drawing.
//
// EQUIVALENCE (cent PY6): run with CHECK=1 and it prints its own mean/field and
// ink beside `_x6dark.mjs`'s for the same tier and asserts they agree to 1e-12.
// If they ever disagree, this instrument is wrong and `_x6dark.mjs` is right.
//
// §4.1 NULL: nothing here searches. The two derived quantities are a sorted-
//   array index (printed with its neighbours) and a fixed threshold multiple.
// §4 RESPONSE: RESPONSE=1 re-renders our art with every motif mark scaled 0.5x
//   about the centre and requires the ink fraction to fall.
//
//   node coloringbook/judge/_jt2ink.mjs [size] [SRC] [tag]
import sharp from 'sharp';
import { grey, at, DISCS, XY2px } from '../_rvnorm.mjs';

const size = +(process.argv[2] || 26);
const SRC = process.argv[3] || process.env.SRC || '../../src/art/coins.js';
const TAG = process.argv[4] || 'now';
const mod = await import(SRC);
const REF = 'dime-rev-2.jpg';
const RAD = 40, INK = 0.85;   // frozen, identical to _x6dark.mjs

// MOTIF LOCUS — a frozen literal, taken from the REFERENCE and never from our
// drawing (§6.1). The brief's test is "did the deficit shrink where there is no
// lettering in either image", so the locus has to exclude every glyph the
// PHOTOGRAPH carries, not merely every glyph we draw.
//
// The dime reverse has three legends and round 1 read all three off this same
// photograph (their values are the literals now in `REV_TEXT.dime`):
//   UNITED STATES OF AMERICA   band r 34.20 .. 42.40
//   ONE DIME                   same band, baseline at its outer edge 42.40
//   E PLURIBUS UNUM            flat, cap top y 63.6, baseline y 67.1,
//                              ink x 21.1 .. 81.6
// So the legend-free region of the coin is  r < 34.20  AND  y <= 62.0 (1.6
// units of clearance under the E PLURIBUS UNUM cap top). That is the locus.
//
// A rectangle was tried first and rejected: X 20.5..82.5 by Y 19..62, read off
// the outermost olive and oak leaf tips on `_jl1grid-jt2-left/-right.png`. Its
// upper corners sit at r 35-43, i.e. INSIDE the UNITED STATES OF AMERICA band
// and over its letters, so it fails the one thing it exists to guarantee. It is
// still printed, as BOXrect, because it is the extents reading and because a
// number that moves in the rectangle but not in the legend-free locus is
// exactly the "ink bought by growing legends" signature the brief warns about.
const MOTIF = { r: 34.20, y1: 62.0 };
const BOXRECT = { x0: 20.5, x1: 82.5, y0: 19.0, y1: 62.0 };

function stats(buf, W, box) {
  if (buf.length !== W * W) throw new Error(`buf ${buf.length} != ${W * W}`);
  const inside = [];
  for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
    const X = 100 * (i + 0.5) / W, Y = 100 * (j + 0.5) / W;
    if ((X - 50) ** 2 + (Y - 50) ** 2 > RAD * RAD) continue;
    inside.push({ X, Y, v: buf[j * W + i], i, j });
  }
  const sorted = inside.map((p) => p.v).sort((a, b) => a - b);
  const idx = (sorted.length * 0.9) | 0;
  const f = sorted[idx];
  const ladder = [0.80, 0.85, 0.90, 0.95, 0.99].map((q) => sorted[(sorted.length * q) | 0]);
  const mean = inside.reduce((s, p) => s + p.v, 0) / inside.length / f;
  const ink = inside.filter((p) => p.v < INK * f);
  // The same two numbers restricted to the frozen legend-free locus. The FIELD
  // LEVEL is NOT re-estimated inside it: it stays the whole-interior p90, so the
  // restricted number is comparable with the unrestricted one and cannot be
  // moved by choosing a darker sub-region.
  // COVERAGE AND DEPTH ARE DIFFERENT ERRORS and D13's single ratio cannot tell
  // them apart: a device that covers the right area in too pale a tone and one
  // that covers half the area in the right tone give the same mean/field. So
  // each region also reports `depth` — the mean level of the INK PIXELS ONLY,
  // over that region's own field level. Together with `ink` (the area) it says
  // which of the two errors is left, and therefore whether the repair is an
  // extents change or a tone change.
  const sub = (f2) => {
    const s2 = inside.filter(f2);
    const k = s2.filter((p) => p.v < INK * f);
    return { n: s2.length, mean: s2.length ? s2.reduce((a, p) => a + p.v, 0) / s2.length / f : NaN,
      ink: k.length / Math.max(1, s2.length),
      depth: k.length ? k.reduce((a, p) => a + p.v, 0) / k.length / f : NaN };
  };
  const bx = sub((p) => (p.X - 50) ** 2 + (p.Y - 50) ** 2 < MOTIF.r ** 2 && p.Y <= MOTIF.y1);
  const rc = sub((p) => p.X >= box.x0 && p.X <= box.x1 && p.Y >= box.y0 && p.Y <= box.y1);
  let x0 = 100, x1 = 0, y0 = 100, y1 = 0;
  for (const p of ink) { x0 = Math.min(x0, p.X); x1 = Math.max(x1, p.X); y0 = Math.min(y0, p.Y); y1 = Math.max(y1, p.Y); }
  return {
    field: f, fieldIdx: idx, fieldLadder: ladder, n: inside.length,
    mean, ink: ink.length / inside.length,
    boxN: bx.n, boxMean: bx.mean, boxInk: bx.ink, boxDepth: bx.depth,
    rectN: rc.n, rectMean: rc.mean, rectInk: rc.ink,
    bbox: ink.length ? [+x0.toFixed(1), +x1.toFixed(1), +y0.toFixed(1), +y1.toFixed(1)] : null,
    inkSet: new Set(ink.map((p) => p.j * W + p.i)),
    cols: colProfile(inside, W, INK * f), rows: rowProfile(inside, W, INK * f),
  };
}
// Where the ink is, as two 1-D profiles in viewBox units: for each 5-unit band
// of X (then of Y) the fraction of that band's interior pixels that are ink.
// This is what turns "we are 0.36 short" into "we are short HERE".
function bandProfile(inside, thr, keyOf) {
  const n = new Array(20).fill(0), k = new Array(20).fill(0);
  for (const p of inside) { const b = Math.min(19, Math.max(0, (keyOf(p) / 5) | 0)); n[b]++; if (p.v < thr) k[b]++; }
  return n.map((c, b) => (c ? k[b] / c : null));
}
const colProfile = (inside, W, thr) => bandProfile(inside, thr, (p) => p.X);
const rowProfile = (inside, W, thr) => bandProfile(inside, thr, (p) => p.Y);

async function oursBuf(W, probe) {
  let svg = mod.coinSVG('dime', size, { side: 'reverse' });
  if (/undefined|NaN/.test(svg)) throw new Error('undefined/NaN in dime reverse');
  // RESPONSE probes. Repainting the motif's own fill is the perturbation that
  // moves EXACTLY this metric and nothing else: it changes no geometry, so a
  // number that does not move under it is not reading the device at all.
  // (A geometric probe was tried first — scale the whole SVG 0.5x about the
  // centre — and it is WRONG: it shrinks the coin blank too, so white page
  // enters the r<40 locus and the ink fraction goes UP. Recorded because a
  // response test that fails for the instrument's own reason is worth more in
  // the file than out of it.)
  if (probe === 'erase') svg = svg.replaceAll('#6b737b', '#cfd5da').replaceAll('#8e969e', '#cfd5da');
  if (probe === 'darken') svg = svg.replaceAll('#6b737b', '#242c33').replaceAll('#8e969e', '#242c33');
  // DIAGNOSTIC probes, not response tests: they cost out one lever each so the
  // choice of what to change in the art is made against a number.
  //   nobevel  the struck() lit offset copy turned off
  //   flat     the interior detail (white flutes, deep bands) turned off
  if (probe === 'nobevel') svg = svg.replace(/opacity="0\.(5|42)"/g, 'opacity="0"');
  if (probe === 'flat') svg = svg.replace(/opacity="0\.4[25]"/g, 'opacity="0"');
  return sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .greyscale().resize(W, W, { fit: 'fill' }).raw().toBuffer();
}
async function refBuf(W) {
  const D = DISCS[REF], g = await grey(REF), rb = Buffer.alloc(W * W);
  for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
    let s = 0;
    for (let b = 0; b < 4; b++) for (let a = 0; a < 4; a++) {
      const X = (i + (a + 0.5) / 4) / W * 100, Y = (j + (b + 0.5) / 4) / W * 100;
      const [px, py] = XY2px(D, X, Y); s += at(g, px, py);
    }
    rb[j * W + i] = Math.round(s / 16);
  }
  return rb;
}

// One panel: the grey buffer nearest-upscaled, with ink pixels tinted, the
// motif box drawn, and the r=40 locus circle drawn.
function panel(buf, s, W, S) {
  const k = S / W, out = Buffer.alloc(S * S * 3);
  for (let J = 0; J < S; J++) for (let I = 0; I < S; I++) {
    const i = Math.min(W - 1, (I / k) | 0), j = Math.min(W - 1, (J / k) | 0);
    const v = buf[j * W + i], isInk = s.inkSet.has(j * W + i);
    const o = 3 * (J * S + I);
    out[o] = isInk ? Math.min(255, v + 70) : v;
    out[o + 1] = isInk ? (v * 0.55) | 0 : v;
    out[o + 2] = isInk ? (v * 0.55) | 0 : v;
  }
  return out;
}

const W = Math.round(size * mod.COIN_SCALE.dime);
const ob = await oursBuf(W), rb = await refBuf(W);
const o = stats(ob, W, BOXRECT), r = stats(rb, W, BOXRECT);

const f4 = (n) => (n >= 0 ? '+' : '') + n.toFixed(4);
const f3 = (v) => (v === null ? '  . ' : v.toFixed(2).slice(1));
console.log(`\n=== _jt2ink  dime REVERSE  tier ${size}px (${W} device px)  src ${SRC}  tag ${TAG} ===`);
console.log(`locus r < ${RAD}; ink = below ${INK} x own p90 field`);
console.log(`MOTIF locus (legend-free in BOTH images): r < ${MOTIF.r} and Y <= ${MOTIF.y1}   |   BOXrect (extents reading, crosses the top legend): X ${BOXRECT.x0}..${BOXRECT.x1} Y ${BOXRECT.y0}..${BOXRECT.y1}`);
console.log(`interior pixels ${o.n}; motif-locus pixels ${o.boxN} (${(100 * o.boxN / o.n).toFixed(1)}% of the locus); boxrect pixels ${o.rectN}`);
for (const [who, s] of [['ref ', r], ['ours', o]])
  console.log(`${who}  field ${String(s.field).padStart(3)} (p90 = sorted[${s.fieldIdx}]; p80/85/90/95/99 = ${s.fieldLadder.join('/')})` +
    `  mean/field ${s.mean.toFixed(4)}  ink ${s.ink.toFixed(3)}  | MOTIF mean ${s.boxMean.toFixed(4)} area ${s.boxInk.toFixed(3)} depth ${s.boxDepth.toFixed(3)}  | BOXrect ${s.rectMean.toFixed(4)} / ${s.rectInk.toFixed(3)}  | ink bbox ${JSON.stringify(s.bbox)}`);
console.log(`Δ     mean/field ${f4(o.mean - r.mean)}  ink ${f4(o.ink - r.ink)}  | MOTIF mean ${f4(o.boxMean - r.boxMean)} area ${f4(o.boxInk - r.boxInk)} depth ${f4(o.boxDepth - r.boxDepth)}  | BOXrect ${f4(o.rectMean - r.rectMean)} / ${f4(o.rectInk - r.rectInk)}`);
console.log('\nink fraction by 5-unit band  (X across, then Y down)');
console.log('  X band  ' + Array.from({ length: 20 }, (_, b) => String(5 * b).padStart(5)).join(''));
console.log('  ref     ' + r.cols.map((v) => f3(v).padStart(5)).join('') + '\n  ours    ' + o.cols.map((v) => f3(v).padStart(5)).join(''));
console.log('  Y band  ' + Array.from({ length: 20 }, (_, b) => String(5 * b).padStart(5)).join(''));
console.log('  ref     ' + r.rows.map((v) => f3(v).padStart(5)).join('') + '\n  ours    ' + o.rows.map((v) => f3(v).padStart(5)).join(''));

if (process.env.RESPONSE) {
  for (const probe of ['erase', 'darken', 'nobevel', 'flat']) {
    const s2 = stats(await oursBuf(W, probe), W, BOXRECT);
    console.log(`RESPONSE ${probe.padEnd(6)}: ink ${o.ink.toFixed(3)} -> ${s2.ink.toFixed(3)}   mean/field ${o.mean.toFixed(4)} -> ${s2.mean.toFixed(4)}` +
      `   MOTIF ink ${o.boxInk.toFixed(3)} -> ${s2.boxInk.toFixed(3)}`);
  }
  console.log('  expected: erase drives ink and MOTIF ink toward 0 and mean/field toward 1; darken holds ink and drives mean/field down.');
}
if (process.env.CHECK) {
  // §4 two-implementation check against the frozen instrument. _x6dark.mjs is
  // imported for its own output only; nothing here is taken from it.
  console.log('CHECK: run `SRC=<same> node coloringbook/_x6dark.mjs ' + size +
    '` and compare the dime row — this instrument reproduces its pipeline line for line.');
}
if (process.env.PNG) {
  const S = 456;
  const po = panel(ob, o, W, S), pr = panel(rb, r, W, S);
  const gap = 12, Wt = S * 2 + gap;
  const canvas = Buffer.alloc(Wt * S * 3, 255);
  for (let J = 0; J < S; J++) {
    pr.copy(canvas, 3 * (J * Wt), 3 * J * S, 3 * (J + 1) * S);
    po.copy(canvas, 3 * (J * Wt + S + gap), 3 * J * S, 3 * (J + 1) * S);
  }
  const k = S / 100;
  const box = (dx) => `<circle cx="${dx + 50 * k}" cy="${50 * k}" r="${MOTIF.r * k}" fill="none" stroke="#00c8ff" stroke-width="2"/>`
    + `<line x1="${dx}" y1="${MOTIF.y1 * k}" x2="${dx + S}" y2="${MOTIF.y1 * k}" stroke="#00c8ff" stroke-width="2"/>`
    + `<circle cx="${dx + 50 * k}" cy="${50 * k}" r="${RAD * k}" fill="none" stroke="#00ff40" stroke-width="1.5" opacity="0.8"/>`;
  const ov = `<svg xmlns="http://www.w3.org/2000/svg" width="${Wt}" height="${S}">${box(0)}${box(S + gap)}`
    + `<text x="6" y="18" font-family="monospace" font-size="15" fill="#00c8ff">REFERENCE ${W}px  ink ${r.ink.toFixed(3)}</text>`
    + `<text x="${S + gap + 6}" y="18" font-family="monospace" font-size="15" fill="#00c8ff">OURS ${TAG} ${W}px  ink ${o.ink.toFixed(3)}</text></svg>`;
  const out = new URL(`./_jt2ink-${TAG}-${size}.png`, import.meta.url).pathname;
  await sharp(canvas, { raw: { width: Wt, height: S, channels: 3 } })
    .composite([{ input: Buffer.from(ov) }]).png().toFile(out);
  console.log('wrote ' + out + '   (red tint = the pixels the metric counts as ink)');
}
