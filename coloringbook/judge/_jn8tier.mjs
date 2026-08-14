// NICKEL round 0 — D10, tier behaviour. This is _jq10tier-v2.mjs with ONE change:
// the hard-coded 'quarter' becomes ID (env), so the same instrument scores the
// nickel. Nothing else is altered — the quarter's numbers reproduce bit-for-bit
// with ID=quarter. _jq10tier-v2.mjs itself is NOT edited (it is hashed).
// ORIGINAL HEADER FOLLOWS.
// D10 — tier behaviour. v2. `_jq10tier.mjs` is NOT edited and NOT retired: it
// is sound within the window it sweeps. v2 adds the two things round 2 needed
// and it is a superset, so v1's numbers reproduce exactly at SIZES 26..120.
//
// (1) ART=<abs path>  — score an arbitrary revision, so the judge can compare
//     revisions itself rather than trusting a specialist's before/after.
// (2) LO/HI/STEP      — the sweep window is a LOCUS and must be stated, not
//     inherited by accident. v1 sweeps 26..120 with the range hard-coded, and
//     the reverse legend used to switch on at boxW 135 — so a real within-tier
//     discontinuity sat permanently outside the instrument's window and no
//     published D10 number has ever contained it.
// (3) It prints the WITHIN-TIER jump distribution, not just its p90, and it
//     prints the boundary jump in ABSOLUTE d(ink) beside the ratio.
//
//     Reason (round-2 judge finding): the gate is "boundary jump <= 4x the
//     within-tier p90". That is a ratio whose DENOMINATOR is a property of the
//     drawing. Adding a within-tier pop raises the p90 and lowers the ratio —
//     so a change that makes the drawing MORE discontinuous can make this gate
//     read BETTER. Round 2 is a live instance: the reverse boundary d(ink)
//     values are bit-identical (0.0904, 0.0922) and the published ratio still
//     "improved" 5.8x/5.9x -> 5.6x/5.7x, entirely because the new legend
//     switch at boxW 84 raised the within-tier p90 from 0.0156 to 0.0161.
//     That is not an improvement and v2 makes it impossible to report as one.
import sharp from 'sharp';

const tierOf = (s) => (s >= 76 ? 'full' : s >= 44 ? 'mid' : 'icon');

async function raster(svg, W) {
  const { data, info } = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .resize(W, W, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  if (info.channels !== 1) throw new Error(`expected 1 channel, got ${info.channels} — D10 UNTRUSTED`);
  if (data.length !== info.width * info.height) throw new Error(`buffer mismatch — D10 UNTRUSTED`);
  return { d: data, w: info.width, h: info.height };
}

async function stats(mod, id, side, size) {
  const svg = mod.coinSVG(id, size, { side });
  const W = Number(svg.match(/width="([\d.]+)"/)[1]);
  const g = await raster(svg, Math.max(8, Math.round(W)));
  const R = g.w / 2, cx = g.w / 2, cy = g.h / 2;
  const vals = [];
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= 0.84 * R) vals.push(g.d[y * g.w + x]);
  }
  vals.sort((a, b) => a - b);
  const field = vals[Math.floor(vals.length * 0.9)];
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const ink = vals.filter((v) => v < field - 8).length / vals.length;
  return { px: g.w, boxW: Math.round(W), field, mean: mean / field, ink, glyphs: (svg.match(/<text/g) || []).length };
}

const LO = Number(process.env.LO || 26), HI = Number(process.env.HI || 120), STEP = Number(process.env.STEP || 2);
const SIZES = [];
for (let s = LO; s <= HI; s += STEP) SIZES.push(s);

const ID = process.env.ID || 'nickel';
const ARTPATH = process.env.ART || new URL('../../src/art/coins.js', import.meta.url).pathname;
const mod = await import(ARTPATH);

console.log(`### D10 v2 — art ${ARTPATH}`);
console.log(`### LOCUS: sizes ${LO}..${HI} step ${STEP} (${SIZES.length} sizes), ${ID}, at each size's real device pixel count\n`);

for (const side of ['obverse', 'reverse']) {
  const rows = [];
  for (const s of SIZES) rows.push({ size: s, tier: tierOf(s), ...(await stats(mod, ID, side, s)) });
  const jumps = [];
  for (let i = 1; i < rows.length; i++) {
    jumps.push({
      from: rows[i - 1].size, to: rows[i].size, boundary: rows[i - 1].tier !== rows[i].tier,
      dInk: Math.abs(rows[i].ink - rows[i - 1].ink), dMean: Math.abs(rows[i].mean - rows[i - 1].mean),
      glyphSwitch: rows[i - 1].glyphs !== rows[i].glyphs,
    });
  }
  const within = jumps.filter((j) => !j.boundary);
  const sorted = within.map((j) => j.dInk).sort((a, b) => a - b);
  const p90 = sorted[Math.floor(sorted.length * 0.9)] || 0;
  const med = sorted[Math.floor(sorted.length * 0.5)] || 0;
  const fields = [...new Set(rows.map((r) => r.field))];
  console.log(`--- ${side}: recovered field levels ${fields.join(',')} (palette field is 212; anything else is a bug report)`);
  for (const j of jumps.filter((x) => x.boundary)) {
    console.log(`  BOUNDARY ${j.from}->${j.to}: d(ink) ${j.dInk.toFixed(4)} ABS   ratio ${(j.dInk / (p90 || 1e-9)).toFixed(2)}x p90   d(mean) ${j.dMean.toFixed(4)}`);
  }
  console.log(`  within-tier: n=${within.length}  median ${med.toFixed(4)}  p90 ${p90.toFixed(4)}  max ${sorted[sorted.length - 1].toFixed(4)}`);
  const bigWithin = within.filter((j) => j.dInk > 4 * med).sort((a, b) => b.dInk - a.dInk);
  console.log(`  WITHIN-TIER POPS (d(ink) > 4x the within-tier MEDIAN — the gate does not test these at all):`);
  if (!bigWithin.length) console.log('    none');
  for (const j of bigWithin) console.log(`    ${j.from}->${j.to}: d(ink) ${j.dInk.toFixed(4)} = ${(j.dInk / (med || 1e-9)).toFixed(1)}x median${j.glyphSwitch ? '   <-- LEGEND SWITCHES ON HERE' : ''}`);
}
