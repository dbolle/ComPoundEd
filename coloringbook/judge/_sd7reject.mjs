// SPECIALIST working instrument (dime obverse, D7 round) — the picture of the
// change this round REFUSED.
//
// COIN-JUDGE.md §8: "the eagle's tidier old silhouette scored and looked better
// to an agent's eye, and was further from the coin", and the brief's rule 4:
// "do not take a change because it scores better". Both of the dime obverse's
// remaining D7 misses can be made to PASS by rounding off a corner the
// photographs show is a corner. This renders those two candidates beside the
// shipped art and beside the reference crop, so the refusal is a picture and
// not an assertion.
//
//   A  HEAD knot 23, the bust truncation: replace the straight cut `L` with a
//      curve tangent to the incoming bust front.  111.2 deg -> 59.4 deg, PASS.
//   B  HAIR knot 16, the nape: swing the hair's underside round to leave the
//      silhouette at a blunt angle.  114.9 deg -> under the gate.
//
// Run: node coloringbook/judge/_sd7reject.mjs <outDir>
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('../../', import.meta.url).pathname;
const OUT = process.argv[2] || '/tmp';
const src = readFileSync(`${ROOT}src/art/coins.js`, 'utf8');
const CAND = [
  { tag: 'A-truncation', at: [49.54, 85.40],
    from: "    'L -31.49 19.07', // THE CUT",
    to: "    'C -8.2 46.4 -20.5 30.1 -31.49 19.07', // THE CUT" },
  { tag: 'B-nape', at: [77.30, 51.55],
    from: "    'C -30.1 5.86 -29.3 5.19 -28.5 4.6', // forward again along the underside",
    to: "    'C -30.5 8.4 -29.3 6.6 -28.5 4.6', // forward again along the underside" },
];

const shot = async (text, vx, vy, file) => {
  const dir = mkdtempSync(join(tmpdir(), 'sd7rj-'));
  execFileSync('mkdir', ['-p', join(dir, 'src')]);
  execFileSync('cp', ['-r', `${ROOT}src/.`, join(dir, 'src')]);
  writeFileSync(join(dir, 'src', 'art', 'coins.js'), text);
  const mod = await import(`file://${join(dir, 'src', 'art', 'coins.js')}?t=${Math.random()}`);
  const png = await sharp(Buffer.from(mod.coinSVG('dime', 2400, { side: 'obverse' }))).flatten({ background: '#fff' }).png().toBuffer();
  const W = (await sharp(png).metadata()).width, k = W / 100, half = Math.round(9 * k);
  const left = Math.max(0, Math.round(vx * k) - half), top = Math.max(0, Math.round(vy * k) - half);
  await sharp(png).extract({ left, top, width: Math.min(2 * half, W - left), height: Math.min(2 * half, W - top) })
    .resize(520).png().toFile(file);
};

for (const c of CAND) {
  if (!src.includes(c.from)) { console.log(`${c.tag}: ANCHOR MISSING — stale, not rendered`); continue; }
  await shot(src, c.at[0], c.at[1], `${OUT}/rj-${c.tag}-shipped.png`);
  await shot(src.replace(c.from, c.to), c.at[0], c.at[1], `${OUT}/rj-${c.tag}-candidate.png`);
  await sharp({ create: { width: 1052, height: 520, channels: 3, background: '#fff' } })
    .composite([{ input: `${OUT}/rj-${c.tag}-shipped.png`, left: 0, top: 0 }, { input: `${OUT}/rj-${c.tag}-candidate.png`, left: 532, top: 0 }])
    .png().toFile(`${OUT}/rj-${c.tag}.png`);
  console.log(`${OUT}/rj-${c.tag}.png   [left SHIPPED, right the D7-PASSING candidate this round refused]`);
}
