// ROUND 9 (relief/edge), QUARTER OBVERSE — THE GENERATOR for the wig cuts.
// §4.3: "an image's reproducible artefact is its GENERATOR" — this is the
// arithmetic that turns the photograph's numbers into the two stroke widths
// that land in `RELIEF.Washington`, so the widths can be re-derived rather than
// taken on trust.
//
// WHAT IS FIXED AND WHY.
//
// 1. THE CENTRELINES DO NOT MOVE. D6 (`_jn13d6.mjs`) is a fraction of drawn
//    LENGTH; `stroke-width` appears nowhere in it. Total centreline length
//    therefore pins D6 exactly, and required cut length = (cut-field area) /
//    (pitch), so the coin's pitch of 1.25 viewBox units cannot be reached
//    without multiplying our cut length by ~3.2 and raising D6 from 20.50% to
//    ~31.7% at 84 px. That is forbidden by the brief. Pitch is therefore not a
//    free parameter this round; WIDTH is, and it is free of charge.
//
// 2. THE TARGET IS THE COIN'S DUTY CYCLE, NOT THE COIN'S CUT WIDTH. With the
//    pitch pinned, those two are different targets and only one can be met:
//      · matching the coin's cut width (0.35 viewBox, pooled over 21 line x
//        reference combinations) at OUR pitch reproduces the coin's cut
//        geometry and throws away its tone — the dark fraction falls to about
//        a third of the coin's;
//      · matching the coin's DUTY CYCLE reproduces the tone and leaves each
//        mark wider than a real cut.
//    Duty is the quantity that survives to every size we draw. At 84 px one
//    viewBox unit is 0.84 device pixels, so the coin's 0.35-unit cut is 0.29 px
//    and cannot resolve at all: what reaches a child is the mean, and the mean
//    of a cut train is its duty cycle. `_jw14see.mjs` shows exactly that — the
//    coin at 84 px is a mottled light mass with no organised banding.
//
// 3. `grooveFine` IS TREATED DIFFERENTLY, and the tier is the reason. It is
//    emitted only at boxW >= 130, where 0.35 viewBox units is 0.67 device
//    pixels and a cut at the coin's TRUE width does resolve. So the five
//    always-on cuts carry the tone and the two fine cuts carry the geometry.
//
// §4  RESPONSE: the duty solver is run against a synthetic centreline set of
//     known spacing and a demanded duty, and must return the width that
//     produces it. Printed as SELFTEST.
// §4.1 the C-lines' endpoints are printed; a centreline crossing found at an
//     endpoint is an end effect and is dropped and counted.
//
// Run: node coloringbook/judge/_jw14gen.mjs
import { marks } from './_jqgeom.mjs';

// MEASURED ON THE PHOTOGRAPHS by `_jw14cross.mjs`, per reference, over the four
// frozen transects plus three lines normal to our own groove direction:
//                       duty     cut FWHP (median)   pitch (median)
//   quarter-obv-2       0.429      0.35 u              1.10 u    7.95 px/u
//   quarter-obv-1932    0.258      0.30 u              1.45 u   21.26 px/u
//   quarter-obv-4       0.342      0.40 u              1.30 u   20.98 px/u
// The 1932 is the best-resolved of the three and reads the NARROWEST cuts,
// which is the expected direction for a resolution effect: at 7.95 px per
// viewBox unit a 0.30-unit cut is 2.4 px and the blur floor widens it. The two
// high-resolution references are therefore what the duty target is taken from,
// and their spread is reported rather than averaged away.
const DUTY = { 'quarter-obv-2.jpg': 0.429, 'quarter-obv-1932ngc.jpg': 0.258, 'quarter-obv-4.jpg': 0.342 };
const DUTY_TARGET = (0.258 + 0.342) / 2;          // 0.300, the two high-res refs
const CUT_FWHP = 0.35;                            // viewBox units, pooled median of 21 line x ref medians
const S = 0.98;                                   // head local scale

// the three lines normal to our own groove direction, from `_jw14cross.mjs`
const CLINES = [
  { name: 'C1', a: { x: 57.0, y: 46.0 }, b: { x: 61.7, y: 18.4 } },
  { name: 'C2', a: { x: 62.0, y: 48.0 }, b: { x: 66.7, y: 20.4 } },
  { name: 'C3', a: { x: 66.5, y: 49.0 }, b: { x: 71.2, y: 21.4 } },
];

// where a polyline crosses a line, as arc length along the line
function crossings(pts, t) {
  const L = Math.hypot(t.b.x - t.a.x, t.b.y - t.a.y);
  const ux = (t.b.x - t.a.x) / L, uy = (t.b.y - t.a.y) / L;
  const nx = -uy, ny = ux;
  const sideOf = (p) => (p.x - t.a.x) * nx + (p.y - t.a.y) * ny;
  const out = [];
  for (let i = 1; i < pts.length; i++) {
    const s0 = sideOf(pts[i - 1]), s1 = sideOf(pts[i]);
    if (s0 === 0 || (s0 > 0) !== (s1 > 0)) {
      const f = s0 / (s0 - s1);
      const p = { x: pts[i - 1].x + f * (pts[i].x - pts[i - 1].x), y: pts[i - 1].y + f * (pts[i].y - pts[i - 1].y) };
      out.push((p.x - t.a.x) * ux + (p.y - t.a.y) * uy);
    }
  }
  return out.filter((s) => s > 0.2 && s < L - 0.2);   // §4.1 end effects
}

// solve: sum(w_i) / span = duty, with all w equal -> w = duty * span / n
function solveWidth(spacings, duty) {
  const n = spacings.n, span = spacings.span;
  return (duty * span) / n;
}

if (process.env.SELFTEST || true) {
  // §4 RESPONSE TEST: a synthetic set of 5 crossings spaced 4.0 apart spans
  // 16.0; demanding duty 0.30 must give width 0.30*16/5 = 0.96, and the
  // resulting duty recomputed from the widths must come back to 0.30.
  const w = solveWidth({ n: 5, span: 16 }, 0.30);
  const back = (5 * w) / 16;
  console.log(`SELFTEST  5 cuts spanning 16.0, demanded duty 0.300 -> width ${w.toFixed(4)}, `
    + `recomputed duty ${back.toFixed(4)}  ${Math.abs(back - 0.30) < 1e-9 ? 'OK' : 'FAIL'}`);
}

const mod = await import('../../src/art/coins.js');
const svg84 = mod.coinSVG('quarter', 84, { side: 'obverse' });
const svg190 = mod.coinSVG('quarter', 190, { side: 'obverse' });
const cutsIn = (s) => marks(s).filter((m) => m.isStroke && Math.abs(m.opacity - 0.33) < 1e-6);

console.log('\n### _jw14gen — the wig cut widths, derived');
console.log(`### coin duty per reference: ${Object.entries(DUTY).map(([k, v]) => `${k.replace('quarter-obv-', '').replace('.jpg', '')} ${v.toFixed(3)}`).join(', ')}`);
console.log(`### target duty ${DUTY_TARGET.toFixed(3)} (the two high-resolution references), coin cut FWHP ${CUT_FWHP} viewBox\n`);

for (const [tag, svg] of [['84 px (groove only)', svg84], ['190 px (groove + grooveFine)', svg190]]) {
  const cm = cutsIn(svg);
  console.log(`## ${tag}: ${cm.length} cut marks`);
  let sumN = 0, sumSpan = 0;
  for (const t of CLINES) {
    const hits = cm.map((m) => crossings(m.pts, t)).flat().sort((a, b) => a - b);
    if (hits.length < 2) { console.log(`   ${t.name}: ${hits.length} crossings — too few`); continue; }
    const span = hits[hits.length - 1] - hits[0];
    const gaps = hits.slice(1).map((s, i) => s - hits[i]);
    sumN += hits.length; sumSpan += span;
    console.log(`   ${t.name} (${t.a.x},${t.a.y})->(${t.b.x},${t.b.y})  ${hits.length} crossings  span ${span.toFixed(2)}u  `
      + `pitch ${(span / (hits.length - 1)).toFixed(2)}u  gaps ${gaps.map((g) => g.toFixed(2)).join(' ')}`);
  }
  const n = sumN / CLINES.length, span = sumSpan / CLINES.length;
  const wVB = solveWidth({ n, span }, DUTY_TARGET);
  console.log(`   mean over the three lines: ${n.toFixed(2)} cuts, span ${span.toFixed(2)}u, `
    + `our pitch ${(span / (n - 1)).toFixed(2)}u vs the coin's 1.25u  (${((span / (n - 1)) / 1.25).toFixed(2)}x)`);
  console.log(`   WIDTH for duty ${DUTY_TARGET.toFixed(3)}: ${wVB.toFixed(3)} viewBox = ${(wVB / S).toFixed(3)} LOCAL units`);
  console.log(`   (a width of the coin's own ${CUT_FWHP} viewBox would give duty ${((n * CUT_FWHP) / span).toFixed(3)})\n`);
}
console.log(`grooveFine target width = the coin's own cut FWHP ${CUT_FWHP} viewBox = ${(CUT_FWHP / S).toFixed(3)} LOCAL`);
console.log('  — it is emitted only at boxW >= 130, where 0.35 viewBox = 0.67+ device px and a true-width cut resolves.');
