// THE BYTE-IDENTITY RENDER PARTITION for round 11 of the quarter obverse.
//
// Every face, at every size the app draws plus the authoring size, hashed
// before and after. `before` is the tree's own HEAD copy of coins.js, imported
// as a module — not a transcription of it — from a directory whose `../engine`
// is a symlink to this checkout's real one, so both sides run the same engine.
//
// The claim this round makes is the strongest available: NOT ONE FACE MOVED,
// including the quarter obverse. `neck: 17` was inert (`bust()` reads `o.neck`
// only inside `below`, and `below` is '' whenever `o.cut`), and everything else
// this round changed is a comment.
//
// Setup, once per worktree (gitignored, so it cannot be committed):
//   mkdir -p coloringbook/_qob/art
//   ln -sfn "$PWD/src/engine" coloringbook/_qob/engine
//   git show HEAD:src/art/coins.js > coloringbook/_qob/art/coins.js
//
// Run: node coloringbook/judge/_qo9part.mjs
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { ROOT } from './_paths.mjs';

const BEFORE = `${ROOT}/coloringbook/_qob/art/coins.js`;
if (!existsSync(BEFORE)) {
  console.log('!! ' + BEFORE.slice(ROOT.length + 1) + ' is missing — see the header for the three-line setup. Reporting nothing.');
  process.exit(2);
}
const A = await import(BEFORE);
const B = await import(`${ROOT}/src/art/coins.js`);

const SIZES = [38, 48, 54, 84, 380];
const h = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);

let moved = 0, same = 0;
console.log('face                 ' + SIZES.map((s) => String(s).padStart(11)).join(''));
for (const id of A.COIN_IDS) for (const side of A.COIN_SIDES) {
  const cells = SIZES.map((sz) => {
    const a = h(A.coinSVG(id, sz, { side })), b = h(B.coinSVG(id, sz, { side }));
    if (a === b) { same++; return '   SAME'; }
    moved++; return '  MOVED';
  });
  console.log(`${(id + ' ' + side).padEnd(20)}` + cells.map((c) => c.padStart(11)).join(''));
}
console.log(`\n${same} of ${same + moved} renders byte-identical; ${moved} moved.`);
console.log(moved === 0
  ? '  PARTITION: no face moved. This round changed comments and removed one inert key.'
  : '  PARTITION: something moved — name it in the round report.');
