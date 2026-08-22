// _jn14look — the picture. Two revisions of the nickel obverse side by side at
// every tier that draws something different, plus the two other silvers at icon
// so the D11 pair can be looked at as well as measured.
//
//   node coloringbook/judge/_jn14look.mjs <before.js> <after.js> <tag>
//
// Pinning both revisions by PATH is the point (§ every round: "pin both
// revisions explicitly in any before/after artefact").
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const [, , A, B, TAG = 'ab'] = process.argv;
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex').slice(0, 16);
// A revision kept in judge/ cannot resolve `../engine/money.js`; rewrite that
// one import into a temp copy rather than moving the pristine file, whose whole
// value is that its sha256 is the one recorded before the round started.
async function load(p) {
  const raw = readFileSync(p, 'utf8');
  const MONEY = new URL('../../src/engine/money.js', import.meta.url).pathname;
  if (!raw.includes("from '../engine/money.js'")) return import(p);
  const { mkdtempSync, writeFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const f = join(mkdtempSync(join(tmpdir(), 'jn14look-')), 'coins.js');
  writeFileSync(f, raw.split("from '../engine/money.js'").join(`from '${MONEY}'`));
  return import(f);
}
const modA = await load(A), modB = await load(B);
console.log(`A ${A}  sha256:${sha(A)}`);
console.log(`B ${B}  sha256:${sha(B)}`);

const SIZES = [26, 44, 84, 190];
const CELL = 200, PAD = 10;
const tiles = [];
let x = PAD;
for (const [label, mod] of [['A', modA], ['B', modB]]) {
  let y = PAD;
  for (const s of SIZES) {
    const svg = mod.coinSVG('nickel', s, { side: 'obverse' })
      .replace(/ width="[0-9.]+" height="[0-9.]+"/, ` width="${CELL}" height="${CELL}"`);
    tiles.push({ input: await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' }).png().toBuffer(), left: x, top: y });
    y += CELL + PAD;
  }
  x += CELL + PAD;
}
// the D11 pair, at icon, from B
for (const [i, id] of ['nickel', 'dime', 'quarter'].entries()) {
  const svg = modB.coinSVG(id, 26, { side: 'obverse' })
    .replace(/ width="[0-9.]+" height="[0-9.]+"/, ` width="${CELL}" height="${CELL}"`);
  tiles.push({ input: await sharp(Buffer.from(svg)).flatten({ background: '#eeeeee' }).png().toBuffer(), left: x, top: PAD + i * (CELL + PAD) });
}
const W = x + CELL + PAD, H = PAD + SIZES.length * (CELL + PAD);
await sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } })
  .composite(tiles).png().toFile(HERE(`_jn14look-${TAG}.png`));
console.log(`columns: A(before) | B(after) at ${SIZES.join(', ')} px  |  right column = B at icon: nickel, dime, quarter`);
console.log(`-> _jn14look-${TAG}.png`);
