// _dr27nodehash.mjs — THE LOCKED NODES OF THE DIME REVERSE, HASHED.
//
// Reports only (WRITERS.md). Never writes into src/.
//
// ── WHY THIS EXISTS ────────────────────────────────────────────────────────
// Four rounds have been dispatched with "node `2.1.4` must come back
// byte-identical at `407e6935d9d9ba80`, 1015 bytes" and "the olive's eighteen
// nodes hash `6aaf4d61c4317269`", and FOUR ROUNDS HAVE HAD TO GUESS HOW THOSE
// TWO NUMBERS WERE COMPUTED. They are not the same recipe:
//
//   · `2.1.4` is `_dr13elem.mjs`'s `resolve(head, out, '2.1.4')` — the node
//     WITH its enclosing `<g>` wrappers reopened, which is what you would
//     rasterise. sha256, first 16 hex. 1015 bytes is that string's length.
//   · the OLIVE's eighteen is the concatenation of the RAW child strings of
//     node `2.1`, indices 22..39, with NO wrappers and no separator. sha256,
//     first 16 hex.
//
// Feed the olive's eighteen through `resolve` instead and you get
// `0bb94188239475f4`, which is a correct hash of a different string and looks
// exactly like a regression. A locked hash whose recipe is not written down is
// not a lock; ledger A45 records what a mistaken "byte-exact restore" costs.
// Both recipes are size-independent (checked at 38, 48, 54, 84, 100, 380),
// which is expected: since v1.78.0 `coinSVG` rewrites only the outer
// width/height.
//
// ── WHAT IS LOCKED, AND BY WHOM ────────────────────────────────────────────
//   `2.1.4`      the oak's STEM. Locked by owner ruling R3.
//   2.1.22..39   the OLIVE branch. Off-partition for every oak round.
//   2.1.20/21    the two acorns; 2.1.40/41 their stalks. Accepted v1.120.0.
// The oak's own eighteen (2.1.4..2.1.21) are printed too, as the CHANGING
// side of the ledger — a round that touches a blade must move that hash and
// nothing else.
//
// usage: node _dr27nodehash.mjs [size]
import { createHash } from 'node:crypto';
import { nodes, resolve } from './_dr13elem.mjs';
import { coinSVG } from '../../src/art/coins.js';

const SIZE = Number(process.argv[2]) || 380;
const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);

const svg = coinSVG('dime', SIZE, { side: 'reverse' });
const { head, out } = nodes(svg);

/** the RAW children of node `2.1`, unwrapped — the olive recipe's input */
function kidsOf21() {
  const g = resolve(head, out, '2.1');
  const openEnd = g.indexOf('>', g.indexOf('<g', g.indexOf('<g') + 1)) + 1;
  const inner = g.slice(openEnd, g.lastIndexOf('</g>'));
  return nodes(`<svg>${inner}</svg>`).out;
}
const kids = kidsOf21();

const stem = resolve(head, out, '2.1.4');
const EXPECT = { stem: '407e6935d9d9ba80', stemBytes: 1015, olive: '6aaf4d61c4317269' };
const ok = (v, want) => (v === want ? 'OK  ' : 'MOVED');

const olive = kids.slice(22, 40).join('');
const oak = kids.slice(4, 22).join('');

console.log(`dime reverse at size ${SIZE} — ${svg.length} chars, ${kids.length} nodes under 2.1\n`);
console.log(`  ${ok(sha(stem), EXPECT.stem)}  2.1.4  (oak stem, R3 LOCKED)`);
console.log(`         resolve(): sha256 ${sha(stem)}  ${Buffer.byteLength(stem)} bytes`);
console.log(`         expected   sha256 ${EXPECT.stem}  ${EXPECT.stemBytes} bytes`);
console.log(`  ${ok(sha(olive), EXPECT.olive)}  2.1.22..2.1.39  (the OLIVE's eighteen, LOCKED)`);
console.log(`         raw kids : sha256 ${sha(olive)}`);
console.log(`         expected   sha256 ${EXPECT.olive}`);
console.log(`  ----   2.1.4..2.1.21   (the OAK's eighteen — this one is ALLOWED to move)`);
console.log(`         raw kids : sha256 ${sha(oak)}`);
console.log(`         whole reverse   : sha256 ${sha(svg)}`);
console.log('\n  per-node, so a mover can be named:');
for (let i = 0; i < kids.length; i++) {
  const tag = i === 4 ? ' oak stem (R3)' : i >= 22 && i <= 39 ? ' olive' : i >= 40 ? ' acorn stalk' : '';
  console.log(`    2.1.${String(i).padEnd(3)} ${sha(kids[i])}  ${String(kids[i].length).padStart(5)} chars${tag}`);
}
process.exit(sha(stem) === EXPECT.stem && sha(olive) === EXPECT.olive ? 0 : 1);
