// THE BYTE-IDENTITY PARTITION — which faces moved, at which size, and by how
// much of the emitted string.
//
// §0.2 keeps this from the old process, and it is the only thing that can prove
// "your face only". Every denomination and both sides are rendered at every
// size `src/screens/money.js` draws plus the authoring size, hashed, and
// compared against a baseline taken from a git revision.
//
// It also re-checks the pin `tests/coins.spec.js` holds: since v1.78.0 there is
// ONE drawing per face and `coinSVG` rewrites only the outer width/height, so
// two sizes of the same face must differ in exactly those two attributes and
// nowhere else. A face that fails that has had a size-dependent branch put back.
//
// usage: node coloringbook/judge/_do15part.mjs [baseline-rev]
//   default baseline is the merge-base with main.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './_paths.mjs';

const REV = process.argv[2] || execFileSync('git', ['merge-base', 'HEAD', 'main'], { cwd: ROOT, encoding: 'utf8' }).trim();
const SIZES = [38, 48, 54, 84, 380];
const IDS = ['penny', 'nickel', 'dime', 'quarter', 'buck'];
const SIDES = ['obverse', 'reverse'];
const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 12);

// the baseline coins.js, written to a temp dir so it can be imported as a module
const old = execFileSync('git', ['show', `${REV}:src/art/coins.js`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 });
const dir = mkdtempSync(join(tmpdir(), 'do15-'));
// coins.js has one relative import (`../engine/money.js`); rewritten to a
// file:// URL under THIS checkout so the baseline copy cannot accidentally
// resolve against another tree — the symlink trap `_paths.mjs` records.
const oldFixed = old.replace(
  /from '\.\.\/engine\/money\.js'/,
  `from ${JSON.stringify(pathToFileURL(join(ROOT, 'src/engine/money.js')).href)}`,
);
if (oldFixed === old) throw new Error('_do15part: the baseline\'s import of engine/money.js was not rewritten');
writeFileSync(join(dir, 'coins.mjs'), oldFixed);
const A = await import(join(dir, 'coins.mjs'));
const B = await import(join(ROOT, 'src/art/coins.js'));

console.log(`baseline ${REV.slice(0, 9)}  vs  the working tree\n`);
console.log('  face                size   before        after         same   d(chars)');
let moved = 0, total = 0;
for (const id of IDS) for (const side of SIDES) for (const s of SIZES) {
  const a = A.coinSVG(id, s, { side }), b = B.coinSVG(id, s, { side });
  total++;
  const same = a === b;
  if (!same) moved++;
  console.log(
    '  ', `${id} ${side}`.padEnd(18), String(s).padStart(5),
    ' ', sha(a), ' ', sha(b), ' ', same ? 'yes ' : 'NO  ',
    same ? '' : String(b.length - a.length).padStart(8),
  );
}
console.log(`\n  ${moved} of ${total} renders changed.`);
const faces = new Set();
for (const id of IDS) for (const side of SIDES) {
  if (SIZES.some((s) => A.coinSVG(id, s, { side }) !== B.coinSVG(id, s, { side }))) faces.add(`${id}.${side}`);
}
console.log(`  faces that moved: ${faces.size ? [...faces].join(', ') : 'none'}`);

console.log('\nONE DRAWING PER FACE — every size must equal the 380px render apart from');
console.log('width/height (the pin in tests/coins.spec.js).');
let bad = 0;
for (const id of IDS) for (const side of SIDES) {
  const ref = B.coinSVG(id, 380, { side }).replace(/width="[\d.]+" height="[\d.]+"/, 'W');
  for (const s of SIZES) {
    const t = B.coinSVG(id, s, { side }).replace(/width="[\d.]+" height="[\d.]+"/, 'W');
    if (t !== ref) { console.log(`  *** ${id} ${side} at ${s}px differs from its 380px render beyond width/height`); bad++; }
  }
}
console.log(bad ? `  ${bad} FAILURES` : '  all faces pass at every size.');
rmSync(dir, { recursive: true, force: true });
