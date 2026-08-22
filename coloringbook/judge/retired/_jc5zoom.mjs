// ROUND 5, cent obverse — D12 zoom on an arbitrary LOCAL-frame rectangle, ours
// beside the reference at the same scale, so the two over-75 knots can be looked
// at (§4.3) rather than argued about from a table.
//
// A CONTROL IS RENDERED FIRST (Appendix Q5): the same window on the byte-frozen
// baseline `coloringbook/judge/_jc5-before-coins.js`, before any edit, is written
// as `-ctl`. Anything that appears in both cannot be attributed to this round.
//
// Run: node coloringbook/judge/_jc5zoom.mjs <lx0> <ly0> <lx1> <ly1> <tag> [src]
import sharp from 'sharp';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { DISC, REF } from '../_pylib.mjs';

// Any revision of coins.js has to be imported from src/art/ depth, because the
// file's own `import { DENOMS } from '../engine/money.js'` is relative. The
// pinned baseline `_jc5-before-coins.js` lives under judge/, so it is copied to
// a `_jc5tmp-` file beside coins.js for the import and removed afterwards.
export async function loadRevision(p) {
  if (/src\/art\//.test(p) || p.startsWith('../../src/art/')) return import(p.startsWith('.') ? p : `file://${p}`);
  const tmp = `src/art/_jc5tmp-rev.js`;
  writeFileSync(tmp, readFileSync(p, 'utf8'));
  try { return await import(`${process.cwd()}/${tmp}?t=${Date.now()}`); } finally { rmSync(tmp); }
}

const [lx0, ly0, lx1, ly1] = process.argv.slice(2, 6).map(Number);
const TAG = process.argv[6] || 'z';
const SRC = process.argv[7] || '../../src/art/coins.js';
const PLACE = { s: 0.78, cx: 3.88, cy: 40.0 };
const SX = (lx) => 50 + PLACE.cx + PLACE.s * lx;      // local -> viewBox
const SY = (ly) => PLACE.cy + PLACE.s * ly;

const vx0 = SX(lx0), vy0 = SY(ly0), vw = SX(lx1) - vx0, vh = SY(ly1) - vy0;
const OUT = 760;

// ours: re-render the coin at a size that makes the window OUT px wide
const mod = await loadRevision(SRC);
const W = Math.round(OUT * 100 / vw);
let svg = mod.coinSVG('penny', 380, { side: 'obverse' });
svg = svg.replace(/ width="[0-9.]+" height="[0-9.]+"/, ` width="${W}" height="${W}"`);
const full = await sharp(Buffer.from(svg)).flatten({ background: '#fff' }).png().toBuffer();
const px = (v) => Math.round(v * W / 100);
await sharp(full).extract({ left: px(vx0), top: px(vy0), width: px(vw), height: px(vh) })
  .resize(OUT, Math.round(OUT * vh / vw), { kernel: 'nearest' }).toFile(`coloringbook/_pv/_jc5zoom-${TAG}-ours.png`);

// the reference, same window
const rx = (v) => Math.round(DISC.cx + (v - 50) / 47 * DISC.R);
const ry = (v) => Math.round(DISC.cy + (v - 50) / 47 * DISC.R);
await sharp(REF).extract({ left: rx(vx0), top: ry(vy0), width: rx(vx0 + vw) - rx(vx0), height: ry(vy0 + vh) - ry(vy0) })
  .resize(OUT, Math.round(OUT * vh / vw), { fit: 'fill' }).toFile(`coloringbook/_pv/_jc5zoom-${TAG}-ref.png`);

console.log(`local x ${lx0}..${lx1} y ${ly0}..${ly1}  ->  viewBox ${vx0.toFixed(2)}..${(vx0 + vw).toFixed(2)} / ${vy0.toFixed(2)}..${(vy0 + vh).toFixed(2)}`);
console.log(`wrote coloringbook/_pv/_jc5zoom-${TAG}-ours.png and -ref.png  (src ${SRC})`);
