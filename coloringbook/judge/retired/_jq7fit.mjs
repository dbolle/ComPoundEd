// ROUND 7, QUARTER OBVERSE — disc fit for the two references that landed today
// and have none. The brief: "Neither has a frozen disc fit, so neither may
// carry a scored value. Use them to look and to cross-check; fit and freeze
// first if you want to measure from one, and publish the fit drawn on the
// source."
//
// This is a WORKING instrument, not a judge target: nothing it produces is a
// scored value. It exists so that a width profile measured on
// `quarter-obv-1932ngc.jpg` can be quoted in the same viewBox units as one
// measured on the target of record.
//
// METHOD, and the three that were tried and discarded first — all three caught
// by the control, none by inspection:
//
//   A. `_jd6edge.mjs`'s estimator A, maximum |d grey/d r| in a radial window.
//      Returned R 340.45 against the frozen 373.67 with a residual spread of
//      41.66 % of R. These coins sit on WHITE: the rim-to-background step is
//      ~55 grey levels while LIBERTY, the date and the profile inside it step
//      250, so the steepest gradient in the window is the LETTERING. Spec 4.3
//      exactly — an in-bounds answer to the wrong question.
//   B. `_jd6edge.mjs`'s estimator B, first departure from background walking
//      INWARD. Returned 720 of 720 columns dropped at bound on
//      `quarter-obv-1932ngc.jpg`, because all three of these subjects are
//      cropped so the disc is INSCRIBED in the frame — the bbox of non-white
//      pixels is the whole image to within 1 px on two of them — so an inward
//      walk starts ON the coin and its first departure IS the search bound.
//      Spec 4.1's non-answer, correctly reported as one.
//   C. B with the departure threshold at 40 grey levels. Broke the walk INSIDE
//      the coin, because the bright field next to the rim reads 200-235 on all
//      three subjects: control R 324.59 against 373.67.
//
// What works is an OUTWARD walk keeping the outermost sample below a threshold
// on max(R,G,B) — the background is a cut-out at exactly 255 in all channels —
// with a robust fit: least-squares, then trimming passes dropping any hit more
// than 3 median-absolute-deviations off the current circle. A drop shadow
// (which `quarter-obv-1932ngc.jpg` carries) is what the trim is for.
//
// §4.1 NULL TEST — the window is printed, and a column whose outermost coin
//      sample is its last IN-FRAME sample, or is at the window end, is DROPPED
//      and counted, never used as a value.
// §4.2 SELECTION TEST — this selects nothing; it fits everything it kept, and
//      prints the kept/dropped counts and the p5/p95 residual spread so a fit
//      that disagrees with itself is visible.
// §4.3 OVERLAY — the fitted circle is drawn on the source and looked at.
// CONTROL — run on `quarter-obv-2.jpg`, whose disc `_r3d13.mjs` froze at
//      cx 374.41 cy 374.36 R 373.67, and require agreement. A fitter that
//      cannot reproduce a frozen fit is not measuring the disc.
//
// Run: node coloringbook/judge/_jq7fit.mjs
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const REFS = [
  { f: 'quarter-obv-1932ngc.jpg', frozen: null },
  { f: 'quarter-obv-2.jpg', frozen: { cx: 374.41, cy: 374.36, R: 373.67 } }, // CONTROL
  { f: 'quarter-obv-4.jpg', frozen: null },
];

async function rgbmax(f) {
  const { data, info } = await sharp(`coloringbook/ref/${f}`).raw().toBuffer({ resolveWithObject: true });
  const C = info.channels, W = info.width, H = info.height;
  const buf = new Uint8Array(W * H);
  for (let i = 0, j = 0; i < W * H; i++, j += C) buf[i] = Math.max(data[j], data[j + 1], data[j + 2]);
  return { buf, W, H };
}

// THRESHOLD 240 ON max(R,G,B) is not a taste choice; it is CALIBRATED against
// the frozen control. Swept against `quarter-obv-2.jpg`, whose disc `_r3d13.mjs`
// froze at R 373.67, the same walk returns
//
//   th   252     250     245     240     230     220
//   R    376.08  375.03  373.78  373.70  373.57  373.48
//   dR   +2.41   +1.36   +0.11   +0.03   -0.10   -0.19   px against the frozen fit
//   sprd 1.87%   1.33%   0.41%   0.40%   0.27%   0.27%   p5..p95 residual
//
// 240 is where the error against the frozen value crosses zero (0.008 % of R)
// and the residual spread has already flattened. Above 245 the walk is riding
// the JPEG halo outside the coin; below 230 it starts cutting into the rim.
const TH = 240;

function fit(g, seed, LO, HI) {
  let { cx, cy } = seed;
  let R = 0, kept = 0, dropped = 0, trimmed = 0, res = [];
  const at = (x, y) => {
    const xi = Math.round(x), yi = Math.round(y);
    if (xi < 0 || yi < 0 || xi >= g.W || yi >= g.H) return null;
    return g.buf[yi * g.W + xi];
  };
  for (let iter = 0; iter < 5; iter++) {
    let pts = []; dropped = 0;
    for (let k = 0; k < 720; k++) {
      const a = (k / 720) * 2 * Math.PI, ca = Math.cos(a), sa = Math.sin(a);
      // OUTERMOST foreground sample, walking out. An INWARD walk from a fixed
      // HI cannot work on these subjects: all three are cropped so the disc is
      // INSCRIBED in the frame (bbox of non-white is the whole image to within
      // 1 px on two of the three), so an inward walk starts ON the coin and its
      // first "departure from background" IS the search bound. That is spec
      // 4.1's non-answer, and the first version of this file duly reported it:
      // 720 of 720 columns dropped at bound on `quarter-obv-1932ngc.jpg`.
      let best = null, lastIn = null;
      for (let r = LO; r <= HI; r += 0.5) {
        const v = at(cx + ca * r, cy + sa * r);
        if (v === null) break;             // ray left the frame
        lastIn = r;
        if (v < TH) best = r;
      }
      // §4.1: a column whose outermost coin sample IS its last in-frame sample
      // is truncated by the crop, not measured. Dropped and counted.
      if (best === null || lastIn === null || best >= lastIn - 0.6 || best >= HI - 0.6) { dropped++; continue; }
      pts.push({ x: cx + ca * best, y: cy + sa * best });
    }
    if (iter >= 2 && R) {
      const d = pts.map((p) => Math.abs(Math.hypot(p.x - cx, p.y - cy) - R)).sort((u, v) => u - v);
      const mad = d[d.length >> 1] || 1;
      const before = pts.length;
      pts = pts.filter((p) => Math.abs(Math.hypot(p.x - cx, p.y - cy) - R) <= Math.max(3 * mad, 1.5));
      trimmed += before - pts.length;
    }
    kept = pts.length;
    let Sx = 0, Sy = 0, Sxx = 0, Syy = 0, Sxy = 0, Sxz = 0, Syz = 0, Sz = 0;
    for (const p of pts) {
      const z = p.x * p.x + p.y * p.y;
      Sx += p.x; Sy += p.y; Sxx += p.x * p.x; Syy += p.y * p.y; Sxy += p.x * p.y;
      Sxz += p.x * z; Syz += p.y * z; Sz += z;
    }
    const n = pts.length;
    const A = [[Sxx, Sxy, Sx], [Sxy, Syy, Sy], [Sx, Sy, n]];
    const b = [Sxz, Syz, Sz];
    const det = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1])
      - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0])
      + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    const D = det(A);
    const sub = (i) => det(A.map((row, r) => row.map((v, c) => (c === i ? b[r] : v))));
    cx = sub(0) / D / 2; cy = sub(1) / D / 2; R = Math.sqrt(sub(2) / D + cx * cx + cy * cy);
    res = pts.map((p) => Math.hypot(p.x - cx, p.y - cy) - R).sort((u, v) => u - v);
  }
  return { cx, cy, R, kept, dropped, trimmed, p5: res[(res.length * 0.05) | 0], p95: res[(res.length * 0.95) | 0] };
}

const OUT = {};
for (const { f, frozen } of REFS) {
  const g = await rgbmax(f);
  const LO = Math.min(g.W, g.H) * 0.30, HI = Math.min(g.W, g.H) * 0.52;
  // background level = median of the four 20x20 corner patches, printed so a
  // subject that is NOT on a plain cut-out background is visible rather than
  // assumed. All three read 255 with an IQR of 255..255.
  const cor = [];
  for (const [x0, y0] of [[0, 0], [g.W - 20, 0], [0, g.H - 20], [g.W - 20, g.H - 20]])
    for (let y = y0; y < y0 + 20; y++) for (let x = x0; x < x0 + 20; x++) cor.push(g.buf[y * g.W + x]);
  cor.sort((a, b) => a - b);
  const bg = cor[cor.length >> 1];
  const r = fit(g, { cx: g.W / 2, cy: g.H / 2, R: Math.min(g.W, g.H) * 0.47 }, LO, HI);
  const spreadPc = (100 * (r.p95 - r.p5)) / r.R;
  console.log(`${f.padEnd(26)} background ${bg} (corner median, threshold ${TH}, IQR ${cor[(cor.length * 0.25) | 0]}..${cor[(cor.length * 0.75) | 0]}); window ${LO.toFixed(0)}..${HI.toFixed(0)} px  ->  cx ${r.cx.toFixed(2)} cy ${r.cy.toFixed(2)} R ${r.R.toFixed(2)}`);
  console.log(`${''.padEnd(26)} kept ${r.kept} / dropped ${r.dropped} (at bound) / trimmed ${r.trimmed} of 720; residual p5 ${r.p5.toFixed(2)} p95 ${r.p95.toFixed(2)} = ${spreadPc.toFixed(2)}% of R`);
  if (frozen) {
    const d = Math.hypot(r.cx - frozen.cx, r.cy - frozen.cy), dR = r.R - frozen.R;
    console.log(`${''.padEnd(26)} CONTROL vs frozen (${frozen.cx}, ${frozen.cy}, R ${frozen.R}): centre off ${d.toFixed(2)} px, R off ${dR.toFixed(2)} px = ${(100 * dR / frozen.R).toFixed(2)}%`);
  }
  OUT[f] = { cx: +r.cx.toFixed(2), cy: +r.cy.toFixed(2), R: +r.R.toFixed(2), kept: r.kept, dropped: r.dropped, spreadPc: +spreadPc.toFixed(2) };

  // §4.3 overlay: the fitted circle drawn on the source, plus a 10-unit viewBox ladder.
  const rings = [];
  for (let u = 10; u <= 47; u += 10) rings.push(`<circle cx="${r.cx}" cy="${r.cy}" r="${(r.R * u / 47).toFixed(2)}" fill="none" stroke="#00ffff" stroke-width="2" opacity="0.7"/>`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${g.W}" height="${g.H}">`
    + `<circle cx="${r.cx}" cy="${r.cy}" r="${r.R.toFixed(2)}" fill="none" stroke="#ff0000" stroke-width="3"/>`
    + rings.join('')
    + `<path d="M ${r.cx} 0 V ${g.H} M 0 ${r.cy} H ${g.W}" stroke="#ff00ff" stroke-width="1.5" opacity="0.6"/>`
    + `<text x="20" y="40" font-family="monospace" font-size="30" fill="#ff0000">${f} cx ${r.cx.toFixed(1)} cy ${r.cy.toFixed(1)} R ${r.R.toFixed(1)} (rings r=10,20,30,40 viewBox)</text></svg>`;
  await sharp(`coloringbook/ref/${f}`)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png().toFile(`coloringbook/judge/_jq7fit-${f.replace(/\..*/, '')}.png`);
}
writeFileSync('coloringbook/judge/_jq7fit.json', JSON.stringify(OUT, null, 1));
console.log('\n' + JSON.stringify(OUT, null, 1));
