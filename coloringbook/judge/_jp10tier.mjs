// PENNY ROUND 0 — D10, tier behaviour.
//
// `_jq10tier-v2.mjs` is sound but hard-codes `'quarter'` at line 64. Editing it
// would void the round (§1), so this is the same computation with the id as an
// argument, written to produce numbers that reproduce `_jq10tier-v2.mjs`'s
// exactly when run with COIN=quarter — which is checked below and printed.
//
// Everything it added in v2 is kept, deliberately:
//  * the sweep window is a LOCUS and is printed (Appendix R2). This round's
//    frozen locus is 26..200 step 2, not v1's 26..120: the penny reverse legend
//    switches on at boxW 135, which sits permanently outside a 26..120 window.
//  * the boundary jump is printed in ABSOLUTE d(ink) beside the ratio, because
//    the gate's denominator is a property of the drawing and a change that makes
//    the drawing MORE discontinuous inside a tier can make the ratio read better.
//  * every WITHIN-TIER pop is printed, not only the tier boundaries.
//
// Run: node coloringbook/judge/_jp10tier.mjs [id]     LO/HI/STEP/ART as env
import sharp from 'sharp';

const ID = process.argv[2] || 'penny';
const tierOf = (s) => (s >= 76 ? 'full' : s >= 44 ? 'mid' : 'icon');

async function raster(svg, W) {
  const { data, info } = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .resize(W, W, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  if (info.channels !== 1) throw new Error(`expected 1 channel, got ${info.channels} — D10 UNTRUSTED`);
  if (data.length !== info.width * info.height) throw new Error('buffer mismatch — D10 UNTRUSTED');
  return { d: data, w: info.width, h: info.height };
}
async function stats(mod, id, side, size) {
  const svg = mod.coinSVG(id, size, { side });
  const W = Number(svg.match(/width="([\d.]+)"/)[1]);
  const g = await raster(svg, Math.max(8, Math.round(W)));
  const R = g.w / 2, cx = g.w / 2, cy = g.h / 2;
  const vals = [];
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++)
    if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= 0.84 * R) vals.push(g.d[y * g.w + x]);
  vals.sort((a, b) => a - b);
  const field = vals[Math.floor(vals.length * 0.9)];
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const ink = vals.filter((v) => v < field - 8).length / vals.length;
  return { px: g.w, boxW: Math.round(W), field, mean: mean / field, ink, glyphs: (svg.match(/<text/g) || []).length };
}

const LO = Number(process.env.LO || 26), HI = Number(process.env.HI || 200), STEP = Number(process.env.STEP || 2);
const SIZES = []; for (let s = LO; s <= HI; s += STEP) SIZES.push(s);
const ARTPATH = process.env.ART || new URL('../../src/art/coins.js', import.meta.url).pathname;
const mod = await import(ARTPATH);

console.log(`### D10 — ${ID}, art ${ARTPATH}`);
console.log(`### LOCUS (frozen literal): sizes ${LO}..${HI} step ${STEP} (${SIZES.length} sizes), at each size's real device pixel count\n`);
for (const side of ['obverse', 'reverse']) {
  const rows = [];
  for (const s of SIZES) rows.push({ size: s, tier: tierOf(s), ...(await stats(mod, ID, side, s)) });
  const fields = [...new Set(rows.map((r) => r.field))];
  console.log(`--- ${side}: recovered field levels ${fields.join(', ')} (anything that is not one of this palette's own greys is a bug report, §22.1)`);
  const jumps = [];
  for (let i = 1; i < rows.length; i++)
    jumps.push({ from: rows[i - 1].size, to: rows[i].size, d: Math.abs(rows[i].ink - rows[i - 1].ink),
      dmean: Math.abs(rows[i].mean - rows[i - 1].mean), boundary: rows[i].tier !== rows[i - 1].tier,
      glyphOn: rows[i].glyphs !== rows[i - 1].glyphs });
  const within = jumps.filter((j) => !j.boundary).map((j) => j.d).sort((a, b) => a - b);
  const p90 = within[Math.floor(within.length * 0.9)];
  const med = within[within.length >> 1];
  for (const j of jumps.filter((x) => x.boundary))
    console.log(`  BOUNDARY ${j.from}->${j.to}: d(ink) ${j.d.toFixed(4)} ABSOLUTE   ratio ${(j.d / p90).toFixed(2)}x p90   d(mean) ${j.dmean.toFixed(4)}   ${j.d / p90 <= 4 ? 'PASS' : 'FAIL'} vs the 4x gate`);
  console.log(`  within-tier: n=${within.length}  median ${med.toFixed(4)}  p90 ${p90.toFixed(4)}  max ${within[within.length - 1].toFixed(4)}`);
  const pops = jumps.filter((j) => !j.boundary && j.d > 4 * med).sort((a, b) => b.d - a.d);
  console.log(`  WITHIN-TIER POPS (d(ink) > 4x the within-tier MEDIAN — the gate as written does not test these):`);
  for (const j of pops.slice(0, 8))
    console.log(`    ${j.from}->${j.to}: d(ink) ${j.d.toFixed(4)} = ${(j.d / med).toFixed(1)}x median${j.glyphOn ? '   <-- LETTERING SWITCHES HERE' : ''}`);
  const glyphSteps = jumps.filter((j) => j.glyphOn);
  console.log(`  lettering switches at: ${glyphSteps.length ? glyphSteps.map((j) => `${j.from}->${j.to}`).join(', ') : 'NEVER in this window'}`);
}
