// _jn15size — the nickel obverse at its REAL device pixel counts, before and
// after, magnified 4x with NEAREST-neighbour so what is on screen is what a
// child's device draws and not a resample of it.
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const [, , A, B, TAG = 'size'] = process.argv;
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex').slice(0, 16);
async function load(p) {
  const raw = readFileSync(p, 'utf8');
  const MONEY = new URL('../../src/engine/money.js', import.meta.url).pathname;
  const f = join(mkdtempSync(join(tmpdir(), 'jn15s-')), 'coins.js');
  writeFileSync(f, raw.split("from '../engine/money.js'").join(`from '${MONEY}'`));
  return import(f);
}
const mods = [await load(A), await load(B)];
console.log(`A ${A} sha256:${sha(A)}`);
console.log(`B ${B} sha256:${sha(B)}`);
const SIZES = [84, 190];
const Z = 4, PAD = 12;
const tiles = []; let x = PAD, maxH = 0;
for (const s of SIZES) {
  let y = PAD;
  for (const mod of mods) {
    const svg = mod.coinSVG('nickel', s, { side: 'obverse' });
    const png = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' }).png().toBuffer();
    const big = await sharp(png).resize({ width: s * Z, kernel: 'nearest' }).png().toBuffer();
    tiles.push({ input: big, left: x, top: y });
    y += s * Z + PAD;
  }
  maxH = Math.max(maxH, y);
  x += s * Z + PAD;
}
await sharp({ create: { width: x, height: maxH, channels: 3, background: '#ffffff' } })
  .composite(tiles).png().toFile(HERE(`_jn15size-${TAG}.png`));
console.log(`columns 84px and 190px; rows A(before) then B(after); ${Z}x nearest -> _jn15size-${TAG}.png`);
