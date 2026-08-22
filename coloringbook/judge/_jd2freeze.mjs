// D2 — FREEZE the dime reverse relief target.
//
// THE OWNER CHOSE THE 2010-S TRACE, not the average and not the other two.
// Verbatim: "The 2010 dime trace is very good. Every other trace and the
// average is worse than that single trace. I want to move forward with the
// 2010 trace."
//
// That is a judgment call and it is the owner's to make, but it also agrees
// with the measurements: the 2010-S is the highest-resolution cameo proof of
// the three, it is the only one where the band pass had NOTHING left to remove
// (0.0% — no letter touches its relief), and its baseline cluster used 12 of
// 12 interior components against 13 of 17 and 10 of 14 on the others. The
// majority vote was averaging a good trace together with two worse ones.
//
// WHAT THIS FILE DOES. It re-runs the settled pipeline in _jd2trace2.mjs on the
// 2010-S alone -- the same exported traceOne(), so the frozen target cannot
// drift from the picture the owner looked at -- and writes:
//
//   _jd2target-dime-reverse.png   the 700x700 binary mask, 0 or 255
//   _jd2target-dime-reverse.json  every parameter, plus the PNG's SHA-256
//
// §6.1 CHECK. A locus may never be a function of the artefact under test. This
// target is derived from a PHOTOGRAPH and nothing else: no value in it depends
// on src/art/coins.js, so it is bit-identical across any revision of our art by
// construction. That is the property §6.1 demands, and it is the reason a
// traced target is admissible where a "fit our drawing to itself" locus is not.
//
// WHAT THIS TARGET IS NOT. It is a SCORING target -- it answers "how well does
// our silhouette agree with the coin's". It is NOT a source of coordinates.
// Nobody may lift path data out of it into coins.js. The art in this project is
// hand-placed from measurements and stays that way; the photographs are
// third-party copyright held for private measurement only.
//
// Run: node coloringbook/judge/_jd2freeze.mjs
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { writeFileSync, readFileSync } from 'node:fs';
import { N, REFS, OUT, traceOne, area } from './_jd2trace2.mjs';

const CHOSEN = '2010-S';
const R = REFS.find((r) => r.label === CHOSEN);
if (!R) throw new Error(`no reference labelled ${CHOSEN}`);

console.log(`freezing the D2 dime-reverse relief target from ${CHOSEN}\n`);
const t = await traceOne(R);

// the mask as a plain 8-bit image, 0 or 255, no palette and no compression
// choices that could vary between sharp versions
const buf = Buffer.alloc(N * N);
for (let k = 0; k < N * N; k++) buf[k] = t.mask[k] ? 255 : 0;
const pngPath = OUT('_jd2target-dime-reverse.png');
await sharp(buf, { raw: { width: N, height: N, channels: 1 } }).png({ compressionLevel: 9 }).toFile(pngPath);

const png = readFileSync(pngPath);
const sha = createHash('sha256').update(png).digest('hex');

const meta = {
  dimension: 'D2', subject: 'dime', side: 'reverse', what: 'relief motif silhouette, lettering excluded',
  chosen_by: 'the owner, 2026-08-22',
  chosen_from: REFS.map((r) => r.label),
  why: 'Highest-resolution cameo proof; the only one of the three where the text-band pass had nothing left to remove (no letter touches its relief); baseline cluster 12/12 interior components against 13/17 and 10/14. The majority vote averaged it together with two worse traces.',
  grid: N,
  source_photograph: R.file,
  source_window: R.win,
  disc_fit: { cx: +t.D.cx.toFixed(4), cy: +t.D.cy.toFixed(4), R: +t.D.R.toFixed(4) },
  threshold: t.T,
  method: {
    legend_ring: 'dropped by connected component, not by radius; largest/second component ratio 26.3x',
    interior_lettering: `located from the dropped free-standing letters' own baseline; band rows ${t.j0}..${t.j1}`,
    touching_letters: 'plain opening inside the band only, reconstruction outside it',
    erode_radius: 7,
    locus_trough_diagnostic_only: +t.LOC.toFixed(4),
  },
  area_fraction_of_disc: +(area(t.mask) / t.discPx).toFixed(6),
  sha256_of_png: sha,
  invariance: 'Derived from the photograph alone. No value depends on src/art/coins.js, so it is bit-identical across revisions of our art by construction (COIN-JUDGE.md §6.1).',
  not_a_source_of_coordinates: 'Scoring target only. No path data may be lifted from it into coins.js; the art is hand-placed from measurements and the photographs are third-party copyright held for private measurement.',
};
writeFileSync(OUT('_jd2target-dime-reverse.json'), JSON.stringify(meta, null, 2) + '\n');

console.log(`  mask area      ${(meta.area_fraction_of_disc * 100).toFixed(2)}% of the disc`);
console.log(`  disc fit       cx ${meta.disc_fit.cx}  cy ${meta.disc_fit.cy}  R ${meta.disc_fit.R}`);
console.log(`  text band      rows ${t.j0}..${t.j1}`);
console.log(`  SHA-256        ${sha}`);
console.log(`\nwrote _jd2target-dime-reverse.png and _jd2target-dime-reverse.json`);
