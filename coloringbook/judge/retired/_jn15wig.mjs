// _jn15wig — the LOOK. A crop of the nickel obverse wig at a stated local-unit
// window, from a revision pinned by path, so before/after is a picture and not
// a claim. Optionally with the local ladder over it, which is what makes a
// stroke's position readable rather than merely visible.
//
// Run: node coloringbook/judge/_jn15wig.mjs <coins.js> <tag> [px] [ladder]
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const HERE = (f) => new URL('./' + f, import.meta.url).pathname;
const [, , SRC = new URL('../../src/art/coins.js', import.meta.url).pathname, TAG = 'wig', PXA = '1400', LADDER = ''] = process.argv;
const PX = +PXA;
const FRAME = { CX: -6.4, CY: 43.7, s: 0.95, dir: -1 };

async function load(p) {
  const raw = readFileSync(p, 'utf8');
  const MONEY = new URL('../../src/engine/money.js', import.meta.url).pathname;
  if (!raw.includes("from '../engine/money.js'")) return import(p);
  const f = join(mkdtempSync(join(tmpdir(), 'jn15w-')), 'coins.js');
  writeFileSync(f, raw.split("from '../engine/money.js'").join(`from '${MONEY}'`));
  return import(f);
}
const mod = await load(SRC);
console.log(`${SRC}  sha256:${createHash('sha256').update(readFileSync(SRC)).digest('hex').slice(0, 16)}   render ${PX}px`);

const [X0, X1, Y0, Y1] = (process.env.WIN || '26,-38,-38,20').split(',').map(Number);
const K = PX / 100;
const P = (lx, ly) => [K * (50 + FRAME.CX + FRAME.dir * FRAME.s * lx), K * (FRAME.CY + FRAME.s * ly)];
const ppl = K * FRAME.s;

let svg = mod.coinSVG('nickel', PX, { side: 'obverse' });
if (LADDER) {
  const g = [];
  for (let x = -36; x <= 6; x += 2) {
    const a = P(x, Y0), b = P(x, Y1), major = x % 10 === 0;
    g.push(`<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="#00e5ff" stroke-width="${((major ? 0.16 : 0.07) * ppl).toFixed(2)}" opacity="${major ? 0.95 : 0.45}"/>`);
    if (major) g.push(`<text x="${a[0].toFixed(1)}" y="${(a[1] - 4).toFixed(1)}" font-family="monospace" font-size="${(2.0 * ppl).toFixed(0)}" fill="#00e5ff" text-anchor="middle">${x}</text>`);
  }
  for (let y = Y0; y <= Y1; y += 2) {
    const a = P(X0, y), b = P(X1, y), major = y % 10 === 0;
    g.push(`<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="#00e5ff" stroke-width="${((major ? 0.16 : 0.07) * ppl).toFixed(2)}" opacity="${major ? 0.95 : 0.45}"/>`);
    if (major) g.push(`<text x="${(Math.min(a[0], b[0]) - 4).toFixed(1)}" y="${a[1].toFixed(1)}" font-family="monospace" font-size="${(2.0 * ppl).toFixed(0)}" fill="#00e5ff" text-anchor="end">${y}</text>`);
  }
  svg = svg.replace('</svg>', g.join('') + '</svg>');
}
const buf = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' }).png().toBuffer();
const a = P(X0, Y0), b = P(X1, Y1);
const L = Math.max(0, Math.round(Math.min(a[0], b[0]) - 3 * ppl)), T = Math.max(0, Math.round(Math.min(a[1], b[1]) - 3 * ppl));
const W = Math.round(Math.abs(b[0] - a[0]) + 6 * ppl), H = Math.round(Math.abs(b[1] - a[1]) + 6 * ppl);
const out = HERE(`_jn15wig-${TAG}.png`);
await sharp(buf).extract({ left: L, top: T, width: Math.min(W, PX - L), height: Math.min(H, PX - T) })
  .resize({ width: 1000 }).png().toFile(out);
console.log(`local x ${X0}..${X1}  y ${Y0}..${Y1}  -> ${out.split('/').pop()}`);
