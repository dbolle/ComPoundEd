// DIME REVERSE — round 1. THE TORCH SHAFT: scanline profiles and the width
// ladder that was read off them.
//
// Reports only (WRITERS.md).
//
// WHY THIS EXISTS. `torch()` drew the shaft as
// `<rect x="45.3" y="38.5" width="9.4" height="31.1"/>` — 9.4 units wide at
// every one of its thirty-one rows, on the largest mark on this face, which
// since v1.78.0 draws at every size. The table in `torch()`'s header carries
// ONE width for it. This measures thirty.
//
// TWO REJECTED ESTIMATORS, recorded because both produced confident wrong
// numbers before this one:
//
//   1. A FIXED-WINDOW |d/dx| MAXIMUM (`judge/_dr5edge.mjs`, kept beside this).
//      The olive leaf crosses the shaft at y 48..56 and the caps of
//      E PLURIBUS UNUM stand against it at y 63..67, so the window's strongest
//      gradient is a leaf or a letter. It reported the shaft WIDENING by 20.5%.
//   2. A ROW-BY-ROW TRACKER with a +-0.8 unit gate. It follows the shaft down
//      to y 46, steps onto the leaf that genuinely touches the shaft there, and
//      never comes back — which is not a bug so much as the fact that on those
//      rows THE SHAFT HAS NO VISIBLE BOUNDARY on this coin. An instrument that
//      returns a number for those rows is inventing one.
//
// WHAT IS MEASURED HERE. Only the rows where every reference shows bare field
// on both sides of the shaft, listed in `CLEAN` and printed with the profiles
// so the choice is checkable. On those rows the boundary is the DARK RELIEF
// OUTLINE, and the estimator is the darkest point inside a stated window
// (44..49.5 left, 50.5..56 right), interpolated to sub-unit by a parabola.
//
// WHICH FILES, AND ONE REFUSAL. `dime-rev-unc2005.png` (white device on a white
// field, dark outline) and `dime-rev-proofbright.png` (frosted device, bright
// field, dark outline) both carry a dark boundary on both sides and are
// measured. `dime-rev-2.jpg` is lit from the upper left: the shaft's LEFT edge
// is a bright HIGHLIGHT, not a shadow, so a darkest-point estimator reads the
// wrong side of it and no width from that file is published here. It is also
// the same photograph as `dime-rev.jpg` (NCC 0.9931, `_dr3indep.mjs`), so
// excluding it costs one source, not two. Our own render is a flat fill on a
// lighter field, so its boundary is the fill edge — the outermost crossing of
// the field/motif midpoint — not a darkest point.
//
// THE HEADLINE NUMBER IS A RATIO. w(61)/w(42) and w(69)/w(42) cancel the disc
// fit, the photograph's scale and its bevel skirt; the two files' ABSOLUTE
// widths differ by up to 1.6 units and their ratios agree to 0.09.
//
// Run: node coloringbook/judge/_dr8shaft.mjs
import { samplerFor } from './_dr2grid.mjs';

// Rows where the shaft has bare field on BOTH sides on every file compared,
// OURS INCLUDED. y 56 and y 67 are clean on both photographs but not on our
// drawing — our olive leaf reaches the shaft at 56 and our E PLURIBUS UNUM
// stands against it at 67 — so they are dropped rather than compared against
// a number that is measuring a leaf on one side of the table only.
const CLEAN = [40, 42, 61, 62, 68, 69, 70];
const WIN_L = [44, 49.5], WIN_R = [50.5, 56];
const REFS = ['dime-rev-unc2005.png', 'dime-rev-proofbright.png'];
const STEP = 0.05;

const sample = (at, x, y) => (at(x, y - 0.12) + at(x, y) + at(x, y + 0.12)) / 3;

/** darkest point in [a,b], parabola-refined */
function darkest(at, y, a, b) {
  let bx = a, bv = Infinity, prev = 0, cur = 0, next = 0;
  for (let x = a; x <= b; x += STEP) {
    const v = sample(at, x, y);
    if (v < bv) { bv = v; bx = x; }
  }
  prev = sample(at, bx - STEP, y); cur = sample(at, bx, y); next = sample(at, bx + STEP, y);
  const d = prev - 2 * cur + next;
  return bx + (d === 0 ? 0 : (STEP * 0.5 * (prev - next)) / d);
}

/** outermost fill-edge in [a,b] for a flat-filled drawing, from the axis outward */
function fillEdge(at, y, a, b, outward) {
  const T = 165; // our field #cfd5da is 211, our motif mass #6b737b is 115
  let last = NaN;
  for (let x = outward > 0 ? a : b; outward > 0 ? x <= b : x >= a; x += outward * STEP) {
    if (sample(at, x, y) < T) last = x;
  }
  return last;
}

export async function widths(file) {
  const s = await samplerFor(file);
  const ours = file === 'ours';
  const out = {};
  for (const y of CLEAN) {
    const L = ours ? fillEdge(s.at, y, WIN_L[0], WIN_L[1], -1) : darkest(s.at, y, ...WIN_L);
    const R = ours ? fillEdge(s.at, y, WIN_R[0], WIN_R[1], +1) : darkest(s.at, y, ...WIN_R);
    out[y] = { L, R, w: R - L, c: (L + R) / 2 };
  }
  return out;
}

if (process.argv[1] && process.argv[1].endsWith('_dr8shaft.mjs')) {
  const FILES = [...REFS, 'ours'];
  const res = {};
  for (const f of FILES) res[f] = await widths(f);

  console.log('SCANLINE PROFILES, x 42..58 at 0.5 units  (. > 240  : > 215  - > 190');
  console.log('                                           = > 160  * > 120  # > 80  @ else)\n');
  for (const f of FILES) {
    const s = await samplerFor(f);
    console.log('  == ' + f);
    for (let y = 32; y <= 80; y += 2) {
      let line = `   y=${String(y).padStart(3)} `;
      for (let x = 42; x <= 58; x += 0.5) {
        const v = sample(s.at, x, y);
        line += v > 240 ? '.' : v > 215 ? ':' : v > 190 ? '-' : v > 160 ? '=' : v > 120 ? '*' : v > 80 ? '#' : '@';
      }
      console.log(line + (CLEAN.includes(y) ? '   <- clean' : ''));
    }
    console.log('         42  44  46  48  50  52  54  56  58');
  }

  console.log('\nSHAFT WIDTH LADDER on the clean rows — viewBox units\n');
  console.log('   y ' + FILES.map((f) => f.slice(0, 16).padStart(21)).join(''));
  for (const y of CLEAN) {
    let line = String(y).padStart(4) + ' ';
    for (const f of FILES) {
      const r = res[f][y];
      line += `${r.L.toFixed(2)}..${r.R.toFixed(2)} w${r.w.toFixed(2)}`.padStart(21);
    }
    console.log(line);
  }
  console.log('\nTAPER RATIOS against the same file\'s own w(42):');
  for (const f of FILES) {
    const b = res[f][42].w;
    console.log(`  ${f.padEnd(26)} ` +
      [61, 62, 68, 69].map((y) => `w${y}/w42 ${(res[f][y].w / b).toFixed(3)}`).join('   '));
  }
  console.log('\n  dime-rev-2.jpg / dime-rev.jpg: NOT MEASURED — lit from the upper left, so the');
  console.log('  shaft\'s left edge is a highlight and a darkest-point estimator reads the wrong');
  console.log('  side of it. They are one photograph, not two (NCC 0.9931, _dr3indep.mjs).');
}
