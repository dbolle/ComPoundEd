// ROUND 7 — D12, looked at, WITH A CONTROL, and the control rendered first
// (spec 3 D12 / Appendix Q5: "a described artefact is found by an eye that went
// looking for it").
//
// SUBJECT   the quarter obverse queue at 190 px, BEFORE and AFTER, 6x nearest.
// CONTROL 1 the same crop of the quarter obverse at 54 px, where the `dark`
//           group is not emitted at all (it is full-tier only) — so anything
//           visible in the control is not this change.
// CONTROL 2 the byte-identity partition (`_jq7ident.mjs`): 172 of 180 renders
//           are identical and all 8 that moved are the quarter obverse at 76 px
//           and above. Any difference seen at 54 px would therefore be an
//           artefact of looking.
//
// Run: node coloringbook/judge/_jq7look.mjs
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BEFORE = (() => {
  const src = readFileSync('coloringbook/judge/_jq7-before-coins.js', 'utf8');
  const abs = new URL('../../src/engine/money.js', import.meta.url).pathname;
  const dir = mkdtempSync(join(tmpdir(), 'jq7l-'));
  const out = join(dir, 'before-coins.mjs');
  writeFileSync(out, src.replace("from '../engine/money.js'", `from '${abs}'`));
  return out;
})();
const A = await import(BEFORE), B = await import('../../src/art/coins.js');

// the queue, in viewBox units: the four folds span x 64.7..70.0, y 57.3..64.9
const BOX = { x0: 61, y0: 53, x1: 75, y1: 69 };
async function crop(mod, px, tag) {
  const s = (px * 8) / 100;
  const big = await sharp(Buffer.from(mod.coinSVG('quarter', px, { side: 'obverse' })))
    .resize(px * 8, px * 8, { kernel: 'nearest' }).png().toBuffer();
  await sharp(big).extract({
    left: Math.round(BOX.x0 * s), top: Math.round(BOX.y0 * s),
    width: Math.round((BOX.x1 - BOX.x0) * s), height: Math.round((BOX.y1 - BOX.y0) * s),
  }).resize(560).png().toFile(`coloringbook/judge/_jq7look-${tag}.png`);
}
// CONTROL FIRST.
await crop(A, 54, 'control-54-before');
await crop(B, 54, 'control-54-after');
await crop(A, 190, 'subject-190-before');
await crop(B, 190, 'subject-190-after');
console.log('wrote _jq7look-control-54-{before,after}.png and _jq7look-subject-190-{before,after}.png');
console.log(`crop = viewBox x ${BOX.x0}..${BOX.x1}, y ${BOX.y0}..${BOX.y1}, 8x nearest`);
