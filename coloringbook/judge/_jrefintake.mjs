// REFERENCE INTAKE CHECK — run this BEFORE adding any image to coloringbook/ref/.
//
// WHY IT EXISTS. On 2026-08-22 the judge "acquired" a US Mint cent obverse from
// Wikimedia, measured it, wrote provenance calling it "the only reference in
// this pool that is not third-party copyright", and committed it. It was
// BYTE-IDENTICAL to `penny-obv-4.png`, which had been in the pool all along.
// The independence instrument then compared the file against ITSELF and printed
// `raw 0.3726  design 0.8069  INDEPENDENT`.
//
// TWO FAILURES, AND THE FIRST IS FREE TO FIX. Nobody hashed the new file
// against the pool — one `sha256sum` would have caught it in a second. And the
// duplicate detector cannot detect duplicates: its raw-NCC threshold is 0.90,
// but a disc-fit disagreement of a few percent drags identical pixels far below
// that, because the two images are compared MISREGISTERED. The two fits for
// those identical bytes differed by 4.0% of R.
//
// So this runs the checks in the order that a wrong answer is cheapest:
//   1. EXACT DUPLICATE — sha256 against every file in the pool. Free, decisive.
//   2. NEAR-DUPLICATE — downscaled mean-absolute-difference, which needs no disc
//      fit at all and so cannot be defeated by a registration error.
//   3. WHAT IS IT — resolution in px per local unit, and the date/mintmark crop
//      to LOOK AT, because "S" means proof and a proof is the worst possible
//      tone reference (§20.3). `penny-obv-2.jpg`, the file the cent's whole
//      whisker-boundary argument rests on, is a 2002-S. Nobody had looked.
//   4. CLIPPING — a histogram cliff means detail is gone, not dark.
//
// It reports. It does not add anything, and it does not decide.
//
// Run: node coloringbook/judge/_jrefintake.mjs <path-to-candidate>
import sharp from 'sharp';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const cand = process.argv[2];
if (!cand || !existsSync(cand)) {
  console.log('usage: node coloringbook/judge/_jrefintake.mjs <path-to-candidate-image>');
  process.exit(2);
}
const REF = new URL('../ref/', import.meta.url).pathname;
const pool = readdirSync(REF).filter((f) => /\.(jpg|jpeg|png|webp|JPG)$/i.test(f));

// ── 1. exact duplicate
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const cs = sha(cand);
const exact = pool.filter((f) => sha(REF + f) === cs);
console.log(`\n1. EXACT DUPLICATE CHECK — sha256 against ${pool.length} files in the pool`);
if (exact.length) {
  console.log(`   !! ALREADY IN THE POOL, BYTE-IDENTICAL: ${exact.join(', ')}`);
  console.log('   DO NOT ADD. This is the check that was skipped on 2026-08-22.');
  process.exit(1);
}
console.log('   no exact match');

// ── 2. near-duplicate, WITHOUT a disc fit
const thumb = async (p) => {
  const { data } = await sharp(p).flatten({ background: '#808080' }).greyscale()
    .resize(64, 64, { fit: 'fill' }).normalise().raw().toBuffer({ resolveWithObject: true });
  return data;
};
const tc = await thumb(cand);
const mad = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]); return s / a.length; };
const near = [];
for (const f of pool) near.push({ f, d: mad(tc, await thumb(REF + f)) });
near.sort((a, b) => a.d - b.d);
console.log('\n2. NEAR-DUPLICATE CHECK — 64x64 normalised mean abs difference, no disc fit needed');
console.log('   (registration-free, so a disc-fit disagreement cannot hide a duplicate)');
for (const n of near.slice(0, 5)) {
  const flag = n.d < 6 ? '   !! LIKELY THE SAME IMAGE' : n.d < 14 ? '   ? possibly the same coin/shoot' : '';
  console.log(`   ${n.d.toFixed(1).padStart(6)}  ${n.f}${flag}`);
}

// ── 3. what is it
const m = await sharp(cand).metadata();
const { data, info } = await sharp(cand).flatten({ background: '#808080' }).greyscale().raw().toBuffer({ resolveWithObject: true });
const px = (x, y) => data[y * info.width + x];
const b = [];
for (let x = 0; x < info.width; x++) b.push(px(x, 0), px(x, info.height - 1));
for (let y = 0; y < info.height; y++) b.push(px(0, y), px(info.width - 1, y));
b.sort((p, q) => p - q);
const bg = b[b.length >> 1];
let n = 0;
for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) if (Math.abs(px(x, y) - bg) > 25) n++;
const R = Math.sqrt(n / Math.PI);
console.log('\n3. WHAT IS IT');
console.log(`   ${m.width}x${m.height} ${m.format}   estimated disc R ${R.toFixed(0)} px   ~${(2 * R / 100).toFixed(1)} px per local unit`);
console.log(`   pool reference points: our best 28.4 (nickel proof crops), workable >= 7, marginal below that`);
const crop = new URL('./_jrefintake-date.png', import.meta.url).pathname;
await sharp(cand).extract({
  left: Math.round(m.width * 0.50), top: Math.round(m.height * 0.55),
  width: Math.round(m.width * 0.45), height: Math.round(m.height * 0.35),
}).resize(520, null).png().toFile(crop);
console.log(`   date/mintmark crop written to ${crop}`);
console.log('   LOOK AT IT. An "S" mintmark means PROOF (no business-strike S cents since 1974),');
console.log('   and §20.3 makes a proof the best SHAPE reference and the WORST TONE reference.');

// ── 4. clipping
const hist = new Array(256).fill(0);
for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) if (Math.abs(px(x, y) - bg) > 25) hist[px(x, y)]++;
const top = hist.map((c, i) => ({ i, c })).sort((a, b2) => b2.c - a.c)[0];
console.log('\n4. CLIPPING CHECK');
console.log(`   most common interior level: ${top.i} at ${(100 * top.c / n).toFixed(2)}% of the disc`);
const nb = (hist[top.i + 1] ?? 0) / n * 100;
console.log(top.c / n > 0.10 && nb < 1
  ? `   !! CLIFF: ${(100 * top.c / n).toFixed(1)}% at ${top.i} but ${nb.toFixed(2)}% at ${top.i + 1} — detail is CLIPPED, not dark.\n      A clipped file cannot carry tone or texture in that range however sharp it looks.`
  : '   no obvious cliff');

console.log('\nThis tool reports. It does not add the file and it does not decide.');
