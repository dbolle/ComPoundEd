// NICKEL round 0 — D12, LOOKED AT, WITH A CONTROL.
//
// §3's D12 rule: render a CONTROL beside the subject, chosen so that an
// artefact appearing in both cannot be attributed to the subject; and where the
// judge holds ANY prior about what it will see — including a prior of its own
// manufacture (R6) — render the control FIRST.
//
// The priors I hold going in, all of my own manufacture this round:
//   - D13 says our nickel OBVERSE is far too inky (mean/field 0.71 against the
//     coin's 0.855, ink 0.64 against 0.40) at 26 px;
//   - D8 says the nickel obverse head crosses its own field circle by 1.47
//     units at `mid`;
//   - D10 says the obverse icon->mid boundary is a 24x pop.
// Every one of those would make me see "a dark blob" if I went looking.
//
// CONTROL: the DIME obverse, at the same device pixel count, on the same
// background, from the same untouched revision. It is another silver portrait
// obverse drawn by the same `bust()`, and this round has not measured it at
// all. If the dime obverse is equally inky then "inky" is a property of
// `bust()` and of the palette, not of the nickel; if it is not, the nickel is
// genuinely darker and D13's number is about this coin.
//
// Two sheets are written, and the CONTROL sheet is written and read FIRST:
//   _jn11-control.png   dime obverse | dime reverse, four tiers
//   _jn11-subject.png   nickel obverse | nickel reverse, four tiers, each with
//                       its own photograph reduced to the SAME device pixels
//
// No upsampling before measurement anywhere: each panel is rendered at the
// tier's real device pixel count and then NEAREST-upscaled purely so a human
// eye can see it (§22.1 — the upscale is after everything, for the eye only).
//
// Run: node coloringbook/judge/_jn11look.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { grey, at, DISCS as RVDISCS, XY2px } from '../_rvnorm.mjs';
import { coinSVG, COIN_SCALE } from '../../src/art/coins.js';

const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const JD = JSON.parse(readFileSync(HERE('_jn1discs.json')));
const discOf = (f) => RVDISCS[f] || JD[f];
const SIZES = [26, 44, 84, 190];
const CELL = 300;

async function ourPanel(id, side, size) {
  const W = Math.round(size * COIN_SCALE[id]);
  const buf = await sharp(Buffer.from(coinSVG(id, size, { side }))).flatten({ background: '#ffffff' })
    .resize(W, W, { fit: 'fill' }).png().toBuffer();
  return { buf: await sharp(buf).resize(CELL, CELL, { kernel: 'nearest' }).png().toBuffer(), W };
}
async function refPanel(file, W) {
  const g = await grey(file), d = discOf(file);
  const out = Buffer.alloc(W * W);
  const step = 100 / W;
  for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
    let s = 0;
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) {
      const [px, py] = XY2px(d, (i + (a + 0.5) / 3) * step, (j + (b + 0.5) / 3) * step);
      s += at(g, px, py);
    }
    out[j * W + i] = Math.round(s / 9);
  }
  return sharp(out, { raw: { width: W, height: W, channels: 1 } })
    .resize(CELL, CELL, { kernel: 'nearest' }).png().toBuffer();
}
const label = (t) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${CELL}" height="22"><rect width="${CELL}" height="22" fill="#111"/><text x="5" y="16" font-family="monospace" font-size="14" fill="#fff">${t}</text></svg>`);

async function sheet(rows, out) {
  const H = rows.length, Wn = rows[0].length;
  const tiles = [];
  for (let j = 0; j < H; j++) for (let i = 0; i < Wn; i++) {
    const c = rows[j][i];
    tiles.push({ input: c.buf, left: i * CELL, top: j * (CELL + 22) + 22 });
    tiles.push({ input: label(c.t), left: i * CELL, top: j * (CELL + 22) });
  }
  await sharp({ create: { width: Wn * CELL, height: H * (CELL + 22), channels: 3, background: '#303030' } })
    .composite(tiles).png().toFile(out);
  console.log('wrote ' + out);
}

// ── CONTROL, written first ────────────────────────────────────────────────
const ctl = [];
for (const side of ['obverse', 'reverse']) {
  const row = [];
  for (const size of SIZES) {
    const p = await ourPanel('dime', side, size);
    row.push({ buf: p.buf, t: `CONTROL dime ${side} ${size}px = ${p.W}dev` });
  }
  ctl.push(row);
}
await sheet(ctl, HERE('_jn11-control.png'));

// ── SUBJECT ───────────────────────────────────────────────────────────────
const REF = { obverse: 'nickel-obv.jpg', reverse: 'nickel-rev-2.png' };
const sub = [];
for (const side of ['obverse', 'reverse']) {
  const ours = [], refs = [];
  for (const size of SIZES) {
    const p = await ourPanel('nickel', side, size);
    ours.push({ buf: p.buf, t: `OURS nickel ${side} ${size}px = ${p.W}dev` });
    refs.push({ buf: await refPanel(REF[side], p.W), t: `COIN ${REF[side]} at ${p.W}dev` });
  }
  sub.push(ours, refs);
}
await sheet(sub, HERE('_jn11-subject.png'));
