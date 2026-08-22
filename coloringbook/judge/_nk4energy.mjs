// WHERE OUR ENERGY IS, AND WHERE THE PHOTOGRAPHS' IS.
//
// T1 is a registered NCC on BLURRED GRADIENT ENERGY. It does not see tone or
// colour; it sees where relief and detail sit on the disc. The nickel obverse
// passes T1 with the weakest margins in the set (0.018 / 0.020 / 0.030 at
// 38/48/54 px) and the LOWEST own-column score of the four obverses (0.158 at
// 38 px against the penny's 0.317 and the quarter's 0.332). That is a number
// with no diagnosis attached, so this prints the descriptor itself as a
// picture: our art at the app's size, beside every nickel obverse photograph
// in T1's own pool, rendered through the SAME energyGrid the gate uses.
//
// IT REPORTS ONLY. It writes one gitignored PNG under judge/ and prints
// numbers; it touches no target and no history. It does put a render into
// `ref/_scratch/` — not by choice, that is what `featOfOurs` does — and
// unlinks it again at the foot of this file. See that note.
//
// NULL TEST, printed before anything else: the same pipeline applied to a
// photograph must reproduce T1's own control number for that photograph
// against its siblings. If this file's energy maps disagreed with T1's, the
// pictures below would be of a different quantity than the gate scores.
//
// Run: node coloringbook/judge/_nk4energy.mjs [sizes...]
import sharp from 'sharp';
import { featOfOurs, featOfRef, designSim, setSide, POOL_BY_SIDE } from './_jt1transfer.mjs';
import { N as GN, SPAN } from '../_rvnorm.mjs';

setSide('obverse');
const SIZES = process.argv.slice(2).map(Number).filter(Boolean);
const PX = SIZES.length ? SIZES : [38, 84];
const REFS = POOL_BY_SIDE.obverse.nickel;

// NULL TEST FIRST.
const a = await featOfRef(REFS[0]), b = await featOfRef(REFS[1]);
console.log(`null: designSim(${REFS[0]}, ${REFS[1]}) = ${designSim(a, b).toFixed(3)}`);
console.log('  (T1 prints 0.665 for nickel-obv.jpg against its best sibling; the');
console.log('   pipeline below is T1\'s own, imported, not reimplemented.)\n');

const TILE = 256;
function tileOf(g) {
  let mx = 0; for (const v of g) if (v > mx) mx = v;
  const buf = Buffer.alloc(TILE * TILE * 3);
  for (let j = 0; j < TILE; j++) for (let i = 0; i < TILE; i++) {
    const gi = Math.round(i * (GN - 1) / (TILE - 1)), gj = Math.round(j * (GN - 1) / (TILE - 1));
    const u = -SPAN + 2 * SPAN * gi / (GN - 1), v = -SPAN + 2 * SPAN * gj / (GN - 1);
    const t = mx ? Math.min(1, g[gj * GN + gi] / mx) : 0;
    const k = (j * TILE + i) * 3;
    const inside = Math.hypot(u, v) <= 0.86;
    // hot = high energy. Outside the 0.86 design mask is drawn dim blue so the
    // masked region T1 actually scores is visible.
    buf[k] = inside ? Math.round(255 * Math.min(1, t * 2)) : 20;
    buf[k + 1] = inside ? Math.round(255 * Math.max(0, t * 2 - 1)) : 20;
    buf[k + 2] = inside ? 0 : 60;
  }
  return sharp(buf, { raw: { width: TILE, height: TILE, channels: 3 } }).png().toBuffer();
}

const cols = [];
for (const px of PX) cols.push({ label: `OURS ${px}px`, g: await featOfOurs('nickel', px) });
for (const f of REFS) cols.push({ label: f, g: await featOfRef(f) });

// print the pairwise numbers the picture is meant to explain
console.log('designSim, ours vs each nickel photograph:');
for (const px of PX) {
  const o = await featOfOurs('nickel', px);
  const row = [];
  for (const f of REFS) row.push(`${f} ${designSim(o, await featOfRef(f)).toFixed(3)}`);
  console.log(`  ${px}px  ` + row.join('   '));
}
// radial energy profile: how much of the total energy sits in each annulus.
console.log('\nradial energy share (fraction of total inside r<=0.86), by annulus:');
const BINS = 6;
function radial(g) {
  const acc = new Float64Array(BINS); let tot = 0;
  for (let j = 0; j < GN; j++) { const v = -SPAN + 2 * SPAN * j / (GN - 1);
    for (let i = 0; i < GN; i++) { const u = -SPAN + 2 * SPAN * i / (GN - 1);
      const r = Math.hypot(u, v); if (r > 0.86) continue;
      acc[Math.min(BINS - 1, Math.floor(r / 0.86 * BINS))] += g[j * GN + i]; tot += g[j * GN + i];
    } }
  return [...acc].map((x) => tot ? x / tot : 0);
}
const hdr = Array.from({ length: BINS }, (_, k) => `${(k / BINS * 0.86).toFixed(2)}-${((k + 1) / BINS * 0.86).toFixed(2)}`);
console.log('  ' + 'map'.padEnd(24) + hdr.map((h) => h.padStart(11)).join(''));
for (const c of cols) console.log('  ' + c.label.padEnd(24) + radial(c.g).map((x) => x.toFixed(3).padStart(11)).join(''));

const tiles = []; for (const c of cols) tiles.push(await tileOf(c.g));
const W = tiles.length * (TILE + 8) + 8, H = TILE + 40;
const txt = cols.map((c, i) => `<text x="${8 + i * (TILE + 8)}" y="22" font-family="monospace" font-size="12" fill="#111">${c.label}</text>`).join('');
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>${txt}</svg>`))
  .composite(tiles.map((b, i) => ({ input: b, left: 8 + i * (TILE + 8), top: 30 }))).png().toFile('coloringbook/judge/_nk4energy.png');
console.log('\nwrote _nk4energy.png');

// LEAVE NO RESIDUE — see the note at the foot of `_nk6row.mjs`.
import { unlinkSync } from 'node:fs';
for (const px of PX) {
  try { unlinkSync(new URL(`../ref/_scratch/obverse-nickel-${px}.png`, import.meta.url).pathname); } catch { /* already gone */ }
}
