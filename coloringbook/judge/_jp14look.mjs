// PENNY REVERSE, face-review sweep — D12 "look at it", with the CONTROL
// RENDERED FIRST (COIN-JUDGE §0.1, Appendix Q5).
//
// §4.3: an image's reproducible artefact is its GENERATOR, and the PNGs are
// gitignored, so this file is the committed record of every picture this round
// was judged on.
//
// CONTROL: the NICKEL REVERSE. It shares `struck()`, `fitOff()`, `reliefOff()`,
// `ledge()`, `shade()`, `columns()`, `bayCentres()`, the field/ring pair, the
// specular arc and `arcText()` with the cent's reverse, and differs in exactly
// the thing under review — the motif's own geometry. Anything that appears in
// both rows is the shared machinery and cannot be attributed to this round.
// It is rendered and read BEFORE the subject.
//
// SIZES: 38, 48, 54, 84 — the four `src/screens/money.js` actually draws. Since
// v1.78.0 there is one drawing per face and only `width`/`height` change, so
// these four are the whole product; 380 is shown alongside only because a human
// cannot see 0.3-unit detail at 38 px and needs to know what is being scaled.
//
//   node coloringbook/judge/_jp14look.mjs           -> _jp14-look.png
//   node coloringbook/judge/_jp14look.mjs <beforeDir>  adds a BEFORE row for
//       the subject, rendered from another checkout's own src/art/coins.js by
//       ABSOLUTE path (the symlink trap in `_jp9partition.mjs`'s header).
import sharp from 'sharp';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const HERE = new URL('.', import.meta.url).pathname;
const SIZES = [38, 48, 54, 84];
const ZOOM = 6;           // nearest-neighbour, so a device pixel stays a square
const GAP = 14;
const BG = '#f4f1ec';

const after = await import('../../src/art/coins.js');
const beforeDir = process.argv[2];
const before = beforeDir
  ? await import(pathToFileURL(resolve(beforeDir, 'src/art/coins.js')).href)
  : null;
if (before && before.coinSVG === after.coinSVG) throw new Error('before and after are the SAME module');

async function tile(mod, id, size) {
  const svg = mod.coinSVG(id, size, { side: 'reverse' });
  const px = mod.coinPx(id, size);
  const flat = await sharp(Buffer.from(svg), { density: 2400 })
    .flatten({ background: BG }).png().toBuffer();
  return sharp(flat)
    .resize(Math.round(px.w * ZOOM), Math.round(px.h * ZOOM), { kernel: 'nearest' })
    .png().toBuffer();
}

async function row(mod, id) {
  const tiles = [];
  for (const s of SIZES) tiles.push(await tile(mod, id, s));
  const metas = await Promise.all(tiles.map((t) => sharp(t).metadata()));
  const W = metas.reduce((a, m) => a + m.width + GAP, GAP);
  const H = Math.max(...metas.map((m) => m.height)) + GAP * 2;
  let x = GAP;
  const comp = tiles.map((t, i) => {
    const c = { input: t, left: x, top: H - GAP - metas[i].height };
    x += metas[i].width + GAP;
    return c;
  });
  return { buf: await sharp({ create: { width: W, height: H, channels: 4, background: BG } })
    .composite(comp).png().toBuffer(), W, H };
}

const rows = [];
rows.push(['CONTROL  nickel reverse  38 / 48 / 54 / 84', await row(after, 'nickel')]);
if (before) rows.push(['BEFORE   penny reverse  38 / 48 / 54 / 84', await row(before, 'penny')]);
rows.push(['SUBJECT  penny reverse  38 / 48 / 54 / 84', await row(after, 'penny')]);

const W = Math.max(...rows.map((r) => r[1].W));
const LBL = 26;
const H = rows.reduce((a, r) => a + r[1].H + LBL, 0);
let y = 0;
const comp = [];
let labels = '';
for (const [text, r] of rows) {
  labels += `<text x="10" y="${y + 18}" font-family="monospace" font-size="15" fill="#333">${text}</text>`;
  comp.push({ input: r.buf, left: 0, top: y + LBL });
  y += r.H + LBL;
}
const lbuf = await sharp(Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${labels}</svg>`
), { density: 96 }).resize(W, H, { fit: 'fill' }).png().toBuffer();
const out = HERE + '_jp14-look.png';
await sharp({ create: { width: W, height: H, channels: 4, background: BG } })
  .composite([...comp, { input: lbuf, left: 0, top: 0 }]).png().toFile(out);
console.log(out);
