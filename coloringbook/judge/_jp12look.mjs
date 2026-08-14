// PENNY ROUND 0 — D12. Every image the judge looked at, regenerable from here.
// §4.3: an image's reproducible artefact is its GENERATOR, and the PNGs are not
// tracked.
//
// §3's D12 row / Appendix Q5: the CONTROL is rendered FIRST, and is chosen so
// that anything appearing in both cannot be attributed to the subject. Round 0
// has no specialist claim to be misled by, but it has PRIORS — `penny-obv.md`
// says the hair is "eight broad strokes where the coin has a dense field of
// curls" and that the beard's underside is the least-measured part of the
// outline — and Appendix R6 says the judge cannot un-read its own arithmetic
// either. So the control is rendered and read before the subject.
//
// CONTROL: the NICKEL, same side, same tier. It shares `bust()`, `coat()`,
// `struck()`, `reedGeom()`, the field/ring pair and the specular arc with the
// cent and differs in the portrait and the motif. Anything that shows up on
// both is the shared machinery, not the cent.
//
//   node coloringbook/judge/_jp12look.mjs control -> _jp12-control.png
//   node coloringbook/judge/_jp12look.mjs subject -> _jp12-subject.png
//   node coloringbook/judge/_jp12look.mjs big     -> _jp12-big-obverse.png, -reverse.png
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const HERE = new URL('.', import.meta.url).pathname;
const REFP = (f) => new URL('../ref/' + f, import.meta.url).pathname;
const D = JSON.parse(readFileSync(new URL('./_jp1discs.json', import.meta.url)));
const mod = await import('../../src/art/coins.js');

const TIERS = [26, 44, 84];
const CELL = 340;
const REFS = { obverse: 'penny-obv-3.jpg', reverse: 'penny-rev-2.png' };

// our render at the tier's REAL device pixel count, then nearest-upscaled.
async function ours(id, side, size) {
  const svg = mod.coinSVG(id, size, { side });
  const W = Math.round(Number(svg.match(/width="([\d.]+)"/)[1]));
  const png = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .resize(W, W, { fit: 'fill' }).png().toBuffer();
  return sharp(png).resize(CELL, CELL, { kernel: 'nearest' }).png().toBuffer();
}
// the photograph reduced to the SAME device pixel count (no upsampling before
// the reduction — §22.1), then nearest-upscaled by the same factor.
async function ref(side, size) {
  const f = REFS[side], d = D[f];
  const svg = mod.coinSVG('penny', size, { side });
  const W = Math.round(Number(svg.match(/width="([\d.]+)"/)[1]));
  // pad first: a disc fitted to the frame edge can want pixels the file does
  // not have, and a silently clamped crop would shift the coin off centre.
  const PAD = 200;
  const padded = await sharp(REFP(f)).flatten({ background: '#ffffff' })
    .extend({ top: PAD, bottom: PAD, left: PAD, right: PAD, background: '#ffffff' }).png().toBuffer();
  const L = Math.round(d.cx - d.R) + PAD, T = Math.round(d.cy - d.R) + PAD, S = Math.round(2 * d.R);
  const crop = await sharp(padded).extract({ left: L, top: T, width: S, height: S }).png().toBuffer();
  const small = await sharp(crop).resize(W, W, { fit: 'fill', kernel: 'lanczos3' }).png().toBuffer();
  return sharp(small).resize(CELL, CELL, { kernel: 'nearest' }).png().toBuffer();
}

async function sheet(rows, out, title) {
  const cols = rows[0].cells.length;
  const H = CELL + 34;
  const tiles = [];
  for (let r = 0; r < rows.length; r++)
    for (let c = 0; c < cols; c++)
      tiles.push({ input: rows[r].cells[c], left: c * CELL, top: 34 + r * H });
  let lab = `<text x="8" y="22" font-family="monospace" font-size="19" fill="#fff">${title}</text>`;
  for (let r = 0; r < rows.length; r++)
    for (let c = 0; c < cols; c++)
      lab += `<text x="${c * CELL + 8}" y="${34 + r * H - 8}" font-family="monospace" font-size="16" fill="#ffe600">${rows[r].labels[c]}</text>`;
  const W = cols * CELL, HT = 34 + rows.length * H;
  const base = await sharp({ create: { width: W, height: HT, channels: 3, background: '#141414' } })
    .composite(tiles).png().toBuffer();
  await sharp(base).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${HT}">${lab}</svg>`) }])
    .toFile(HERE + out);
  console.log(`-> ${HERE + out}`);
}

const mode = process.argv[2] || 'control';
if (mode === 'control') {
  const rows = [];
  for (const side of ['obverse', 'reverse'])
    rows.push({ labels: TIERS.map((t) => `CONTROL nickel ${side} ${t}px`), cells: await Promise.all(TIERS.map((t) => ours('nickel', side, t))) });
  await sheet(rows, '_jp12-control.png', 'D12 CONTROL — the NICKEL, rendered and read BEFORE the penny. Shared: bust(), coat(), struck(), reeding, field ring, specular arc.');
} else if (mode === 'subject') {
  const rows = [];
  for (const side of ['obverse', 'reverse']) {
    rows.push({ labels: TIERS.map((t) => `penny ${side} ${t}px  OURS`), cells: await Promise.all(TIERS.map((t) => ours('penny', side, t))) });
    rows.push({ labels: TIERS.map((t) => `${REFS[side]} at the SAME device px`), cells: await Promise.all(TIERS.map((t) => ref(side, t))) });
  }
  await sheet(rows, '_jp12-subject.png', 'D12 SUBJECT — penny, ours above the photograph reduced to the same device pixel count.');
} else if (mode === 'big') {
  for (const side of ['obverse', 'reverse']) {
    const svg = mod.coinSVG('penny', 380, { side });
    await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' }).resize(760, 760).png()
      .toFile(HERE + `_jp12-big-${side}.png`);
    console.log(`-> ${HERE}_jp12-big-${side}.png`);
  }
}
