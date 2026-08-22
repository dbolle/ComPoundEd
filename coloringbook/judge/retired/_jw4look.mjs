// R4 dime jaw — BEFORE and AFTER, with both revisions pinned by content hash.
//
// Appendix R1: a control may not be a function of a mutable path. So the
// "before" side is rendered from `_jw4-before-coins.js`, a copy taken from the
// shared checkout at dispatch and verified byte-identical to it, NOT from git
// and NOT from the file under edit. Both hashes are printed on the run.
//
// Sizes are the real device pixel counts a child is shown: the dime is drawn at
// size x 0.738 (coins.js COIN_SCALE), so 84 px of box is 62 device px. Rendered
// at that count and nearest-upscaled, never resampled smooth, so what is on
// screen is what the metric sees.
//
// Run: node coloringbook/judge/_jw4look.mjs
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const here = (p) => new URL(p, import.meta.url).pathname;
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex').slice(0, 16);
const BEFORE = here('./_jw4-before-coins.js');
const AFTER = here('../../src/art/coins.js');
console.log(`before: ${BEFORE}\n        sha256:${sha(BEFORE)}`);
console.log(`after : ${AFTER}\n        sha256:${sha(AFTER)}`);
// `_jw4-before-coins.js` is kept BYTE-IDENTICAL to the shared checkout's
// src/art/coins.js — that is the whole point of it — so it cannot be imported
// from judge/, where '../engine/money.js' does not resolve (COIN-ART-METHOD §9
// names this). The loadable copy differs from it in that ONE line and the diff
// is asserted here rather than trusted.
const LOAD = here('./_jw4-before-loadable.js');
const src = readFileSync(BEFORE, 'utf8');
const fixed = src.replace("from '../engine/money.js'", "from '../../src/engine/money.js'");
if (fixed === src) throw new Error('the import rewrite matched nothing — the before-copy is not what this expects');
const nDiff = src.split('\n').filter((l, i) => l !== fixed.split('\n')[i]).length;
if (nDiff !== 1) throw new Error(`the loadable copy differs on ${nDiff} lines, not 1`);
writeFileSync(LOAD, fixed);
console.log(`loadable copy of BEFORE: sha256:${sha(LOAD)} — differs from the pinned copy on exactly 1 line (the money.js import)`);
const mA = await import(LOAD);
const mB = await import(AFTER);

const SIZES = [84, 190, 380];
const tiles = [];
for (const [tag, mod] of [['BEFORE', mA], ['AFTER', mB]]) {
  for (const size of SIZES) {
    const dev = Math.round(size * 0.738);
    const svg = mod.coinSVG('dime', size, { side: 'obverse' });
    const png = await sharp(Buffer.from(svg), { density: 72 })
      .resize({ width: dev, height: dev, fit: 'fill' }).png().toBuffer();
    const K = Math.max(1, Math.round(360 / dev));
    tiles.push({ tag, size, dev, buf: await sharp(png).resize({ width: dev * K, height: dev * K, kernel: 'nearest' }).png().toBuffer(), w: dev * K });
  }
}
const cell = Math.max(...tiles.map((t) => t.w)) + 12;
const out = await sharp({ create: { width: cell * SIZES.length, height: cell * 2, channels: 3, background: '#202020' } })
  .composite(tiles.map((t, i) => ({ input: t.buf, left: (i % SIZES.length) * cell + 6, top: ((i / SIZES.length) | 0) * cell + 6 })))
  .png().toBuffer();
await sharp(out).toFile(here('./_jw4look-dime-obverse.png'));
console.log(`\ntop row BEFORE, bottom row AFTER; columns ${SIZES.map((s, i) => `${s}px (${tiles[i].dev} device px)`).join(', ')}`);
console.log('-> ' + here('./_jw4look-dime-obverse.png'));

// a zoom on the jaw itself at 380, both revisions
const zt = [];
for (const [tag, mod] of [['BEFORE', mA], ['AFTER', mB]]) {
  const svg = mod.coinSVG('dime', 380, { side: 'obverse' });
  const png = await sharp(Buffer.from(svg), { density: 72 }).resize({ width: 800, height: 800, fit: 'fill' }).png().toBuffer();
  zt.push(await sharp(png).extract({ left: 180, top: 420, width: 380, height: 240 }).resize({ width: 760, height: 480, kernel: 'nearest' }).png().toBuffer());
}
const z = await sharp({ create: { width: 772, height: 972, channels: 3, background: '#202020' } })
  .composite([{ input: zt[0], left: 6, top: 6 }, { input: zt[1], left: 6, top: 492 }]).png().toBuffer();
await sharp(z).toFile(here('./_jw4look-jawzoom.png'));
console.log('jaw zoom at 380 px, BEFORE above AFTER -> ' + here('./_jw4look-jawzoom.png'));
