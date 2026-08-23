// THE BYTE-IDENTITY PARTITION — prove a round changed the face it claimed and
// nothing else.
//
// WHY IT EXISTS. Every specialist round is scoped to ONE face, but the drawing
// code is shared: `bust()`, `struck()`, `reliefOff()`, `arcText()`, `EDGE`,
// `PALETTE` are common to five denominations. A constant nudged "for the cent"
// lands on the nickel too, and the transfer gate will not tell you — T1 scored
// 32/32 before and after a real 6.5-unit error on the nickel's eye, identical
// to three decimal places (v1.79.0). A gate that cannot see a defect cannot see
// a defect you introduced either.
//
// So the round's scope claim is checked STRUCTURALLY instead of numerically:
// render every id x side x size on both sides of the change and hash the bytes.
// Exactly the claimed cells must differ. This is a claim about the SVG text, not
// about quality — it cannot say the change was good, only that it was contained.
//
// The judge runs this, not the round. An instrument reports, it does not write
// (judge/WRITERS.md), and a round does not score its own gate (COIN-JUDGE 1).
//
// TWO TRAPS THIS AVOIDS, both of which have cost a round here:
//
//  1. THE STALE BASE. The Agent tool's own worktree isolation checks out a
//     commit ~25 behind HEAD. Partitioning against the wrong "before" shows
//     phantom changes on faces nobody touched. So the before-side is named
//     explicitly and its commit is PRINTED, for the reader to check against the
//     dispatch commit.
//
//  2. THE SYMLINK TRAP. A symlinked .mjs resolves its relative imports against
//     the link TARGET, so a "before" module symlinked into place silently
//     imports the AFTER `../engine/money.js` and measures one checkout twice.
//     Importing by ABSOLUTE PATH is safe and is what this does: Node resolves
//     `../engine/money.js` against the importing file's own real URL, so each
//     coins.js gets its own sibling tree. The self-test below proves the two
//     modules really are distinct objects.
//
// usage: node coloringbook/judge/_jp9partition.mjs <before-dir> [after-dir]
//        dirs are checkout ROOTS (the ones containing src/art/coins.js)
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// The four sizes the app actually draws, plus DRAW_SIZE, plus a size below the
// old 44px tier cut — a size-dependent branch reintroduced by accident shows up
// here and nowhere else.
const SIZES = [24, 38, 48, 54, 84, 380];

const beforeDir = process.argv[2];
const afterDir = process.argv[3] ?? process.cwd();
if (!beforeDir) {
  console.log('usage: node coloringbook/judge/_jp9partition.mjs <before-dir> [after-dir]');
  process.exit(2);
}
const modPath = (d) => {
  const p = resolve(d, 'src/art/coins.js');
  if (!existsSync(p)) { console.error(`no src/art/coins.js under ${d}`); process.exit(2); }
  return pathToFileURL(p).href;
};
const A = await import(modPath(beforeDir));
const B = await import(modPath(afterDir));

// self-test: two distinct module instances, or the run means nothing
if (A === B || A.coinSVG === B.coinSVG) {
  console.error('SELF-TEST FAILED: both sides resolved to the SAME module.');
  console.error('The two directories are the same checkout, or one is a symlink to the other.');
  process.exit(2);
}

const IDS = B.COIN_IDS, SIDES = B.COIN_SIDES;
const h = (s) => createHash('sha256').update(s).digest('hex').slice(0, 12);

console.log('BYTE-IDENTITY PARTITION');
console.log(`  before  ${resolve(beforeDir)}`);
console.log(`  after   ${resolve(afterDir)}`);
console.log(`  grid    ${IDS.length} ids x ${SIDES.length} sides x ${SIZES.length} sizes`
  + ` = ${IDS.length * SIDES.length * SIZES.length} cells\n`);

const moved = new Map();
let cells = 0, diff = 0, empty = 0;
for (const id of IDS) {
  for (const side of SIDES) {
    const changedSizes = [];
    for (const px of SIZES) {
      cells++;
      const a = A.coinSVG(id, px, { side }), b = B.coinSVG(id, px, { side });
      if (!a || !b) empty++;
      if (h(a) !== h(b)) { diff++; changedSizes.push(px); }
    }
    if (changedSizes.length) moved.set(`${id}.${side}`, changedSizes);
  }
}

for (const [face, sizes] of moved) {
  const all = sizes.length === SIZES.length;
  console.log(`  CHANGED  ${face.padEnd(18)} ${all ? 'all sizes' : `only ${sizes.join(',')} px  <-- SIZE-DEPENDENT`}`);
}
if (!moved.size) console.log('  no cell changed — the round is a no-op on rendered output');

console.log(`\n  ${diff}/${cells} cells differ across ${moved.size} face(s)`);
if (empty) console.log(`  !! ${empty} cells rendered EMPTY — coinSVG returned '' (unknown id?)`);

// A face that changes at some sizes but not all means a size-dependent branch is
// back. v1.78.0 removed tiers precisely so one drawing serves every size, and
// tests/coins.spec.js pins it; flag it here too, where the cause is visible.
const partial = [...moved].filter(([, s]) => s.length !== SIZES.length);
if (partial.length) {
  console.log('\n  !! SIZE-DEPENDENT RENDERING on: ' + partial.map(([f]) => f).join(', '));
  console.log('     v1.78.0 removed the tier system; one drawing must serve every size.');
}
console.log('\nThis tool reports. Whether the changed set MATCHES THE ROUND\'S CLAIM is the judge\'s call.');
