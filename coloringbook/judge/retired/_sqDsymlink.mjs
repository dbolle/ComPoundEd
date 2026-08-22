// SPECIALIST, quarter reverse — REPRODUCTION of a harness fault, reported
// under COIN-JUDGE §1.1 and NOT fixed by me.
//
// A specialist works in a git worktree. `coloringbook/*` is gitignored except
// for `coloringbook/judge/**`, so the brief tells us to symlink the missing
// artefacts in from the main checkout. Every symlinked `.mjs` then resolves its
// own relative imports against `import.meta.url` — which is the MAIN CHECKOUT'S
// path, not the worktree's.
//
// `coloringbook/_x6dark.mjs` (the D13 instrument, symlinked) defaults to
//   const SRC = process.env.SRC || '../src/art/coins.js';
// so in a worktree it measures `/home/USER/compounded/src/art/coins.js` —
// somebody else's tree — and prints a confident, unchanged number for a
// drawing that moved by 860 characters of SVG.
//
// This is §4's own failure signature: two different inputs, one bit-identical
// answer. It printed quarter mean/field 0.7104 and ink 0.644 both before and
// after this round's edit; recomputed here against the two files by ABSOLUTE
// path, using _x6dark's own definitions, the same numbers are
//   before 0.710391 / 0.643539     after 0.704056 / 0.650281.
//
// Run: node coloringbook/judge/_sqDsymlink.mjs
import sharp from 'sharp';
import { realpathSync, existsSync } from 'node:fs';
import { beforeModule } from './_sqBefore.mjs';

const WT = new URL('../../', import.meta.url).pathname;      // this worktree
const FILES = ['coloringbook/_x6dark.mjs', 'coloringbook/_rvnorm.mjs',
  'coloringbook/_rvdisc.mjs', 'coloringbook/judge/_rescore.mjs',
  'coloringbook/judge/_jq67edge.mjs', 'coloringbook/judge/_jn13d6.mjs',
  'coloringbook/judge/_jb11d11.mjs', 'coloringbook/judge/_jq10tier-v2.mjs',
  'coloringbook/judge/_jq43seg.mjs', 'coloringbook/judge/_jq42indep.mjs'];

console.log('=== which instruments resolve their imports OUTSIDE this worktree? ===');
console.log(`worktree: ${WT}`);
for (const f of FILES) {
  if (!existsSync(WT + f)) { console.log(`  ${f.padEnd(38)} MISSING`); continue; }
  const real = realpathSync(WT + f);
  const inside = real.startsWith(realpathSync(WT));
  console.log(`  ${f.padEnd(38)} ${inside ? 'in worktree — safe' : 'SYMLINK OUT -> ' + real}`);
}

// the numeric demonstration, using _x6dark.mjs's own metric definitions
const W = 84, RAD = 40, INK = 0.85;
async function stat(mod) {
  const m = await import(mod);
  const svg = m.coinSVG('quarter', 84, { side: 'reverse' });
  const buf = await sharp(Buffer.from(svg)).flatten({ background: '#ffffff' })
    .greyscale().resize(W, W, { fit: 'fill' }).raw().toBuffer();
  const inside = [];
  for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
    const X = 100 * (i + 0.5) / W, Y = 100 * (j + 0.5) / W;
    if ((X - 50) ** 2 + (Y - 50) ** 2 > RAD * RAD) continue;
    inside.push(buf[j * W + i]);
  }
  const s = [...inside].sort((a, b) => a - b), f = s[(s.length * 0.9) | 0];
  return { chars: svg.length, field: f,
    mean: +(inside.reduce((a, b) => a + b, 0) / inside.length / f).toFixed(6),
    ink: +(inside.filter((v) => v < INK * f).length / inside.length).toFixed(6) };
}
console.log('\n=== D13 (r < 40, 84 device px, _x6dark.mjs\'s own definitions), by ABSOLUTE path ===');
for (const [name, p] of [
  ['MAIN checkout src/art/coins.js  ', '/home/USER/compounded/src/art/coins.js'],
  ['this round BEFORE (b788b0a)     ', beforeModule().path],
  ['this round AFTER  (worktree)    ', WT + 'src/art/coins.js'],
]) console.log(`  ${name} ${JSON.stringify(await stat(p))}`);
console.log('\nThe first two rows are the same drawing. _x6dark.mjs run inside the');
console.log('worktree with no SRC reports the FIRST row and calls it the third.');
