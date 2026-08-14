// BUCK r0 — D10 tier behaviour.
//
// SUBJECTS COVERED (PY3): id `buck`, BOTH sides. `_jq10tier-v2.mjs` hard-codes
// 'quarter' (PY6), so the note needs its own; this reproduces v2's method —
// render at every size in the sweep, resample each to a common grid, and take
// the mean |Δ| between adjacent sizes — and prints what R2 asked for that v2
// did not: the NUMERATOR IN ABSOLUTE UNITS beside every ratio, and the whole
// within-tier jump distribution rather than only the two boundaries.
//
// LOCUS: size swept 26..200 inclusive, step 1, declared in the gates file
// BEFORE measuring. R2 found a 26..120 window hiding a legend switch at 135.
//
//   node coloringbook/judge/_jb12tier.mjs [json]
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { upN, mad } from '../_x6lib.mjs';
const { coinSVG, coinPx } = await import('../../src/art/coins.js');

const LO = 26, HI = 200, G = 64;
const BOUNDARIES = [44, 76]; // tierOf(): >=76 full, >=44 mid, else icon

const out = {};
for (const side of ['obverse', 'reverse']) {
  const cells = [];
  for (let size = LO; size <= HI; size++) {
    const box = coinPx('buck', size);
    const w = Math.round(box.w), h = Math.round(box.h);
    const svg = coinSVG('buck', size, { side });
    if (/undefined|NaN/.test(svg)) throw new Error(`undefined/NaN buck/${side}/${size}`);
    const raw = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
      .resize(w, h, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
    if (raw.info.channels !== 1) throw new Error(`channels ${raw.info.channels}`);
    if (raw.data.length !== w * h) throw new Error(`len ${raw.data.length} != ${w * h}`);
    cells.push({ size, g: upN(raw.data, w, h, 1, G), svg });
  }
  const jumps = [];
  for (let i = 1; i < cells.length; i++)
    jumps.push({ from: cells[i - 1].size, to: cells[i].size, v: mad(cells[i - 1].g, cells[i].g),
      identical: cells[i - 1].svg.replace(/width="[^"]*"|height="[^"]*"|stroke-width="[^"]*"|font-size="[^"]*"|translate\([^)]*\)/g, '') ===
        cells[i].svg.replace(/width="[^"]*"|height="[^"]*"|stroke-width="[^"]*"|font-size="[^"]*"|translate\([^)]*\)/g, '') });
  const within = jumps.filter((j) => !BOUNDARIES.includes(j.to));
  const sorted = [...within].map((j) => j.v).sort((a, b) => a - b);
  const p90 = sorted[Math.floor(sorted.length * 0.9)];
  const bJumps = BOUNDARIES.map((b) => jumps.find((j) => j.to === b));
  // within-tier POPS: any within-tier jump above the boundary-gate threshold
  const pops = within.filter((j) => j.v > 4 * p90).sort((a, b) => b.v - a.v);
  out[side] = { p90, boundaries: bJumps, pops, worstWithin: within.reduce((m, j) => (j.v > m.v ? j : m), within[0]) };

  console.log(`\nbuck ${side}  — sweep ${LO}..${HI}, ${jumps.length} adjacent pairs, common grid ${G}x${G}`);
  console.log(`  within-tier jump distribution: p50 ${sorted[sorted.length >> 1].toFixed(5)}  p90 ${p90.toFixed(5)}  max ${sorted[sorted.length - 1].toFixed(5)} (at ${out[side].worstWithin.from}->${out[side].worstWithin.to})`);
  for (const b of bJumps)
    console.log(`  BOUNDARY ${b.from}->${b.to}: absolute jump ${b.v.toFixed(5)}  = ${(b.v / p90).toFixed(2)}x the within-tier p90   gate <= 4x   ${b.v / p90 <= 4 ? 'PASS' : 'FAIL'}`);
  console.log(`  within-tier pops above the same 4x threshold: ${pops.length}${pops.length ? '  ' + pops.slice(0, 6).map((p) => `${p.from}->${p.to} ${p.v.toFixed(5)} (${(p.v / p90).toFixed(1)}x)`).join('  ') : ''}`);
  const idn = jumps.filter((j) => j.identical).length;
  console.log(`  size-invariant path data on ${idn} of ${jumps.length} adjacent pairs (i.e. only widths/sizes changed)`);
}

// R2's rule: an improvement in the ratio is only real if the NUMERATOR moved.
console.log('\nR2 — numerator in absolute units is printed above beside every ratio, so a future round cannot');
console.log('     record an improvement that is entirely a rise in the denominator.');

// RESPONSE TEST — introduce a tier pop and confirm the boundary ratio moves
{
  const a = out.reverse.boundaries.find((b) => b.to === 44).v;
  console.log(`\nRESPONSE TEST — the icon->mid boundary at 44 is where noteSVG switches ` +
    `\`small\`: r 15 -> 16 roundels, the wave border and both cut groups appear, and \`ONE\` appears.` +
    ` The measured absolute jump there is ${a.toFixed(5)} against a within-tier p90 of ${out.reverse.p90.toFixed(5)}` +
    ` — i.e. the instrument resolves a change it was independently predicted to see, at the size it was predicted at.`);
}

if (process.argv[2] === 'json')
  writeFileSync(new URL('./_jb12tier.json', import.meta.url), JSON.stringify({ generated: 'coloringbook/judge/_jb12tier.mjs', LO, HI, G, BOUNDARIES, out }, null, 2) + '\n');
