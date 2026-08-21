// SPECIALIST INSTRUMENT — round 2, D13. AN OBSERVATION ABOUT THE INSTRUMENT'S
// OWN NORMALISER, reported and NOT fixed (COIN-JUDGE.md §1.1).
//
// D13 normalises everything by "the side's own p90 field level": the 90th
// percentile of the grey values inside r < 40. That is a SELECTION out of a
// sorted array (§4.2) and it is only the FIELD level if the brightest tenth of
// the interior is field. On the dime reverse the brightest object on the coin is
// the torch — a polished raised cylinder photographed under a raking light — so
// the selection may be picking the device.
//
// This measures the difference, on all four reverse references, between
//   (a) the p90 of the r<40 interior — what `_x6dark.mjs` calls "field", and
//   (b) the grey in BARE-FIELD PATCHES, frozen literals read off the gridded
//       disc-normalised crops and DRAWN ON THE SOURCE so they can be checked.
// and reports what fraction of each reference's bare field is itself below the
// ink threshold 0.85 x (a) — i.e. counted as ink by the metric.
//
// §4.1 NULL: nothing searches. §4.2: the whole percentile ladder is printed
//   beside the selected p90, and every patch is printed, not a chosen subset.
// §4 RESPONSE: RESPONSE=1 brightens the reference by +20 grey levels; every
//   patch mean and the p90 must rise by ~20 and the ink fraction must fall.
// §4.3 OVERLAY: PNG=1 draws every patch on its own source.
//
//   node coloringbook/judge/_jt2field.mjs
import sharp from 'sharp';
import { grey, at, DISCS, XY2px } from '../_rvnorm.mjs';

// Bare-field patches, viewBox (X, Y, radius) — frozen literals, chosen on
// `judge/_jl1grid-jt2-ref.png` and its zooms, and on the equivalent grid crops
// for the other three coins. They are DRAWN and looked at before any number
// here is believed; a patch that turns out to sit on relief is a bug in this
// file, not a finding.
const PATCHES = {
  // The first pass put two of the dime's six at (33,68) and (67,68) and the
  // overlay showed both touching E PLURIBUS UNUM. Moved down to y 74, between
  // that legend and ONE DIME, and re-drawn and re-checked.
  'dime-rev-2.jpg': [[40, 22, 2], [60, 22, 2], [42, 71, 2], [58, 71, 2], [37, 74, 2], [63, 74, 2]],
  'penny-rev-2.png': [[24, 26, 2], [76, 26, 2], [50, 15, 2], [22, 74, 2], [78, 74, 2], [50, 86, 2]],
  'nickel-rev-2.png': [[22, 30, 2], [78, 30, 2], [50, 14, 2], [24, 76, 2], [76, 76, 2], [50, 24, 2]],
  'quarter-rev-2.png': [[22, 28, 2], [78, 28, 2], [50, 13, 2], [24, 78, 2], [76, 78, 2], [50, 85, 2]],
};
const RAD = 40, INK = 0.85, LIFT = process.env.RESPONSE ? 20 : 0;

console.log('\n=== _jt2field — is D13\'s "field level" the field? ===');
console.log(`p90 is taken over r < ${RAD}, exactly as _x6dark.mjs does it. Bare-field patches are frozen literals.`);
if (LIFT) console.log(`RESPONSE: every reference lifted +${LIFT} grey levels.`);
console.log('\nreference            p90   p50   p99   bare-field patches (mean grey)                       patch mean   patch/p90   patches BELOW the 0.85 ink threshold');
for (const [ref, patches] of Object.entries(PATCHES)) {
  const D = DISCS[ref], g = await grey(ref);
  const sample = (X, Y) => { const [px, py] = XY2px(D, X, Y); return Math.min(255, at(g, px, py) + LIFT); };
  const vals = [];
  const S = 400;
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
    const X = 100 * (i + 0.5) / S, Y = 100 * (j + 0.5) / S;
    if ((X - 50) ** 2 + (Y - 50) ** 2 > RAD * RAD) continue;
    vals.push(sample(X, Y));
  }
  vals.sort((a, b) => a - b);
  const p = (q) => vals[(vals.length * q) | 0];
  const p90 = p(0.9), thr = INK * p90;
  const means = patches.map(([X, Y, r]) => {
    let s = 0, n = 0;
    for (let dy = -r; dy <= r; dy += 0.25) for (let dx = -r; dx <= r; dx += 0.25) {
      if (dx * dx + dy * dy > r * r) continue;
      s += sample(X + dx, Y + dy); n++;
    }
    return s / n;
  });
  const pm = means.reduce((a, b) => a + b, 0) / means.length;
  const below = means.filter((m) => m < thr).length;
  console.log(`${ref.padEnd(20)} ${p90.toFixed(0).padStart(4)}  ${p(0.5).toFixed(0).padStart(4)}  ${p(0.99).toFixed(0).padStart(4)}   ` +
    means.map((m) => m.toFixed(0).padStart(5)).join('') + `      ${pm.toFixed(1).padStart(6)}      ${(pm / p90).toFixed(3)}       ${below} of ${means.length}   (threshold ${thr.toFixed(1)})`);

  if (process.env.PNG) {
    const N = 900, out = Buffer.alloc(N * N * 3);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const X = 100 * (i + 0.5) / N, Y = 100 * (j + 0.5) / N;
      const v = sample(X, Y), o = 3 * (j * N + i);
      out[o] = v; out[o + 1] = v; out[o + 2] = v;
    }
    const k = N / 100;
    const ov = `<svg xmlns="http://www.w3.org/2000/svg" width="${N}" height="${N}">`
      + `<circle cx="${50 * k}" cy="${50 * k}" r="${RAD * k}" fill="none" stroke="#00ff40" stroke-width="1.5"/>`
      + patches.map(([X, Y, r], i2) =>
        `<circle cx="${X * k}" cy="${Y * k}" r="${r * k}" fill="none" stroke="#ff2020" stroke-width="2.5"/>`
        + `<text x="${(X + r) * k + 3}" y="${Y * k}" font-family="monospace" font-size="16" fill="#ff2020">${means[i2].toFixed(0)}</text>`).join('')
      + `<text x="6" y="20" font-family="monospace" font-size="17" fill="#ff2020">${ref}  p90 ${p90.toFixed(0)}  ink threshold ${thr.toFixed(0)}</text></svg>`;
    const f = new URL(`./_jt2field-${ref.replace(/\W+/g, '-')}.png`, import.meta.url).pathname;
    await sharp(out, { raw: { width: N, height: N, channels: 3 } })
      .composite([{ input: Buffer.from(ov) }]).png().toFile(f);
    console.log('    wrote ' + f);
  }
}
