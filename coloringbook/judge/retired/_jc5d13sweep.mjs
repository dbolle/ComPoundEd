// ROUND 5, cent obverse — the D13 COST of the coat repair, swept.
//
// D3 wants the coat DARKER (ours 1.141 of the cheek against 0.769 and 0.609 on
// the two struck references) and D13 wants the device LIGHTER (ours 0.7919 of
// our own field at 44 px against the coin's 0.8358, i.e. already 0.0439 dark of
// a 0.05 gate). They are opposed because they normalise by different things —
// D3 by the CHEEK, D13 by the FIELD — and this sweep prices that opposition.
//
// The arithmetic is `_jp13d2d13.mjs`'s obverse half, reproduced constant for
// constant (RAD 40, INK 0.85, no upsampling, `flatten` to white, greyscale) so
// that the two agree. CROSS-CHECK, printed every run: the baseline row must
// reproduce the judge instrument's own published 0.7919 / 0.8358 at 44 px. If it
// does not, this tool is wrong and its sweep means nothing.
//
// Run: node coloringbook/judge/_jc5d13sweep.mjs
import sharp from 'sharp';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';

const D = JSON.parse(readFileSync(new URL('./_jp1discs.json', import.meta.url)));
const RAD = 40, INK = 0.85;
const REFP = (f) => new URL('../ref/' + f, import.meta.url).pathname;

async function grid(buf, W) {
  const { data, info } = await sharp(buf).flatten({ background: '#ffffff' }).resize(W, W, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  if (info.channels !== 1) throw new Error('channels != 1 — UNTRUSTED');
  return data;
}
function stats(d, W) {
  const inside = [];
  for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
    const X = 100 * (i + 0.5) / W, Y = 100 * (j + 0.5) / W;
    if ((X - 50) ** 2 + (Y - 50) ** 2 > RAD * RAD) continue;
    inside.push({ X, Y, v: d[j * W + i] });
  }
  const s = inside.map((p) => p.v).sort((a, b) => a - b);
  const f = s[(s.length * 0.9) | 0];
  return { field: f, mean: inside.reduce((a, p) => a + p.v, 0) / inside.length / f,
    ink: inside.filter((p) => p.v < INK * f).length / inside.length };
}
async function refBuf(f) {
  const d = D[f], PAD = 300;
  const padded = await sharp(REFP(f)).flatten({ background: '#ffffff' }).extend({ top: PAD, bottom: PAD, left: PAD, right: PAD, background: '#ffffff' }).png().toBuffer();
  return sharp(padded).extract({ left: Math.round(d.cx - d.R) + PAD, top: Math.round(d.cy - d.R) + PAD, width: Math.round(2 * d.R), height: Math.round(2 * d.R) }).png().toBuffer();
}

const BASE = readFileSync('coloringbook/judge/_jc5-before-coins.js', 'utf8');
const rb = await refBuf('penny-obv-3.jpg');
const TIERS = [26, 44, 84];
// the reference's stats are computed once per tier, on first use, at the tier's
// own device pixel count — which is read off our render, so it cannot be filled
// in before the first row runs.
const R = {};

const greyOf = async (hex) => (await sharp({ create: { width: 4, height: 4, channels: 3, background: hex } }).greyscale().raw().toBuffer())[0];
const CANDS = ['#a75f22', '#a35c21', '#9f5a20', '#9c5620', '#98541f', '#94511e', '#8f4e1c', '#8a4a1e', '#82471a', '#7b4213'];

console.log('cloth      grey   ratio |            26px            |            44px            |            84px');
console.log('                        |  ours   ref    D   verdict |  ours   ref    D   verdict |  ours   ref    D   verdict');
for (const hex of CANDS) {
  const g = await greyOf(hex);
  const out = BASE.replace(/(penny: \{ rim: '#8d5320'[^}]*cloth: ')#a75f22(')/, `$1${hex}$2`);
  if (out === BASE && hex !== '#a75f22') throw new Error('rewrite did not match');
  const tmp = 'src/art/_jc5tmp-d13.js';
  writeFileSync(tmp, out);
  let mod; try { mod = await import(`${process.cwd()}/${tmp}?t=${Date.now()}`); } finally { rmSync(tmp); }
  let line = `${hex}  ${String(g).padStart(4)}  ${(g / 99).toFixed(3)} |`;
  for (const size of TIERS) {
    const svg = mod.coinSVG('penny', size, { side: 'obverse' });
    const W = Math.round(Number(svg.match(/width="([\d.]+)"/)[1]));
    const o = stats(await grid(await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' }).png().toBuffer(), W), W);
    if (!R[size]) R[size] = stats(await grid(rb, W), W);
    const dm = o.mean - R[size].mean;
    line += ` ${o.mean.toFixed(4)} ${R[size].mean.toFixed(4)} ${(dm >= 0 ? '+' : '') + dm.toFixed(4)}  ${Math.abs(dm) <= 0.05 ? 'PASS' : 'FAIL'} |`;
  }
  console.log(line);
}
console.log('\nCROSS-CHECK against _jp13d2d13.mjs, which published for the SHIPPED tree today:');
console.log('  26px ours 0.6278 ref 0.8815 | 44px ours 0.7919 ref 0.8358 | 84px ours 0.8135 ref 0.8093');
console.log('  the #a75f22 row above must reproduce those to 4 dp, or this tool is UNTRUSTED and the sweep means nothing.');
