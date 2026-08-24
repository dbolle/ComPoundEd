// QUARTER REVERSE, review sweep — D12 LOOK AT IT, at the four sizes the app
// really draws (38 / 48 / 54 / 84), with a PINNED CONTROL rendered first.
//
// Reports only; writes PNGs into the gitignored scratch dir (`_paths.mjs`
// SCRATCH), never into the repo. WRITERS.md: an instrument may emit an
// artefact for a human to look at, but must not modify anything tracked.
//
// THE CONTROL. Row 0 of every sheet is a REAL PHOTOGRAPH box-filtered to the
// same device pixel count as our render and upscaled by the same
// nearest-neighbour factor. If the control row does not look like a quarter
// reverse at 38 device pixels, the pipeline is lying and nothing below it
// means anything. (The nickel round's lesson: T1 could not see a 6.5-unit
// error; the contact sheet could.)
//
// Run: node coloringbook/judge/_qr1look.mjs [outname] [side]
import sharp from 'sharp';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { REF, SCRATCH } from './_paths.mjs';
import { coinSVG } from '../../src/art/coins.js';

const CELL = 340, PAD = 8;
const SIZES = [38, 48, 54, 84];
// rim fits re-derived in _qr2disc.mjs; quoted here so this file is standalone.
const CONTROL = {
  reverse: { file: 'quarter-rev-2.png', cx: 374.50, cy: 374.37, R: 374.98 },
  obverse: { file: 'quarter-obv-2.jpg', cx: 374.41, cy: 374.36, R: 373.67 },
};

async function grey(file) {
  const { data, info } = await sharp(join(REF, file))
    .flatten({ background: '#ffffff' }).greyscale().raw()
    .toBuffer({ resolveWithObject: true });
  if (data.length !== info.width * info.height) throw new Error('buffer length — UNTRUSTED');
  return { d: data, w: info.width, h: info.height };
}

/** the photograph reduced to boxW device pixels over the same viewBox square */
async function controlTile(side, boxW) {
  const c = CONTROL[side];
  const g = await grey(c.file);
  const buf = Buffer.alloc(boxW * boxW);
  for (let j = 0; j < boxW; j++) for (let i = 0; i < boxW; i++) {
    let acc = 0, n = 0;
    for (let b = 0; b < 4; b++) for (let a = 0; a < 4; a++) {
      const X = (100 * (i + (a + 0.5) / 4)) / boxW, Y = (100 * (j + (b + 0.5) / 4)) / boxW;
      const px = c.cx + ((X - 50) / 47) * c.R, py = c.cy + ((Y - 50) / 47) * c.R;
      const xi = Math.max(0, Math.min(g.w - 1, Math.round(px)));
      const yi = Math.max(0, Math.min(g.h - 1, Math.round(py)));
      acc += g.d[yi * g.w + xi]; n++;
    }
    buf[j * boxW + i] = Math.round(acc / n);
  }
  return sharp(buf, { raw: { width: boxW, height: boxW, channels: 1 } })
    .resize(CELL, CELL, { kernel: 'nearest' }).png().toBuffer();
}

async function ourTile(side, size) {
  const svg = coinSVG('quarter', size, { side });
  const boxW = Math.max(8, Math.round(Number(svg.match(/width="([\d.]+)"/)[1])));
  const small = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .resize(boxW, boxW, { fit: 'fill' }).png().toBuffer();
  return { boxW, buf: await sharp(small).resize(CELL, CELL, { kernel: 'nearest' }).png().toBuffer() };
}

const name = process.argv[2] || 'qr1';
const side = process.argv[3] || 'reverse';
mkdirSync(SCRATCH, { recursive: true });

const comps = []; let x = PAD;
const boxes = [];
for (const s of SIZES) {
  const o = await ourTile(side, s);
  boxes.push(`${s}px -> ${o.boxW} device px`);
  comps.push({ input: await controlTile(side, o.boxW), left: x, top: PAD });
  comps.push({ input: o.buf, left: x, top: PAD + CELL + PAD });
  x += CELL + PAD;
}
// and one large render, ours only, for the detail
const big = await sharp(Buffer.from(coinSVG('quarter', 380, { side })))
  .flatten({ background: '#ffffff' }).resize(CELL * 2, CELL * 2, { fit: 'fill' }).png().toBuffer();

const W = SIZES.length * (CELL + PAD) + PAD;
const H = 2 * (CELL + PAD) + PAD;
const out = join(SCRATCH, `${name}-${side}.png`);
await sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } })
  .composite(comps).png().toFile(out);
await sharp(big).png().toFile(join(SCRATCH, `${name}-${side}-380.png`));
console.log('row 0 = CONTROL photograph, row 1 = ours;', boxes.join('  '));
console.log('wrote (scratch, gitignored):', out.split('/').pop(), `${name}-${side}-380.png`);
