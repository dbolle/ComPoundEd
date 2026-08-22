// _jn15part — the BYTE-IDENTITY PARTITION. Emit every id x side x size from two
// revisions and report exactly which strings differ. Under the concurrency rule
// (COIN-JUDGE §5), a round that touched only its own face must show differences
// on that face and NOWHERE else; anything more means a shared helper moved.
//
// It also diffs the two strings on the renders that DID change, so the report
// can say which substrings moved rather than merely that something did.
//
// Run: node coloringbook/judge/_jn15part.mjs <A.js> <B.js>
import { createHash } from 'node:crypto';
import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [, , A, B] = process.argv;
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex').slice(0, 16);
async function load(p) {
  const raw = readFileSync(p, 'utf8');
  const MONEY = new URL('../../src/engine/money.js', import.meta.url).pathname;
  if (!raw.includes("from '../engine/money.js'")) return import(p);
  const f = join(mkdtempSync(join(tmpdir(), 'jn15p-')), 'coins.js');
  writeFileSync(f, raw.split("from '../engine/money.js'").join(`from '${MONEY}'`));
  return import(f);
}
const [ma, mb] = [await load(A), await load(B)];
console.log(`A ${A} sha256:${sha(A)}`);
console.log(`B ${B} sha256:${sha(B)}`);

const SIZES = [22, 26, 30, 40, 42, 44, 60, 62, 84, 100, 130, 132, 190, 260, 380];
const rows = [];
for (const id of ma.COIN_IDS) for (const side of ['obverse', 'reverse']) for (const s of SIZES) {
  const x = ma.coinSVG(id, s, { side }), y = mb.coinSVG(id, s, { side });
  rows.push({ id, side, s, same: x === y, x, y });
}
const diff = rows.filter((r) => !r.same);
console.log(`\n${rows.length} renders swept (${ma.COIN_IDS.length} ids x 2 sides x ${SIZES.length} sizes)`);
console.log(`${rows.length - diff.length} byte-identical, ${diff.length} changed`);
const faces = [...new Set(diff.map((r) => `${r.id} ${r.side}`))];
console.log(`faces touched: ${faces.length ? faces.join(', ') : '(none)'}`);
console.log(`sizes touched: ${[...new Set(diff.map((r) => r.s))].join(', ')}`);
if (faces.length > 1) console.log('*** MORE THAN ONE FACE MOVED — a shared helper was edited. The round is not attributable.');

// on one changed render, show what actually moved
if (diff.length) {
  const r = diff.find((d) => d.s === 190) || diff[0];
  let i = 0; while (r.x[i] === r.y[i]) i++;
  let j = 0; while (r.x[r.x.length - 1 - j] === r.y[r.y.length - 1 - j]) j++;
  console.log(`\nfirst divergence on ${r.id} ${r.side} ${r.s}px at char ${i}; common tail ${j} chars`);
  console.log(`  A removes: ${JSON.stringify(r.x.slice(i, r.x.length - j)).slice(0, 200)}`);
  console.log(`  B inserts: ${JSON.stringify(r.y.slice(i, r.y.length - j)).slice(0, 260)}...`);
  // and prove the load-bearing geometry did not move
  // WHERE the change sits: the whole divergence must lie inside the ONE group
  // that carries the lit ridges. If it does, nothing else on the face moved.
  const gOpen = r.y.lastIndexOf('<g ', i), gClose = r.y.indexOf('</g>', r.y.length - j);
  console.log(`  the changed span opens inside: ${JSON.stringify(r.y.slice(gOpen, gOpen + 110))}`);
  console.log(`  and closes at char ${gClose} (tail begins at ${r.y.length - j})`);
  // and the load-bearing geometry either side, quoted from the render itself
  for (const [name, needle] of [
    ['HEAD / HAIR outline closing knot', '9.32 -25.96 Z'],
    ['CURLS_JEFFERSON, third cut', '-16.4 1.6'],
    ['the two queue ridges', '-30.2 22.6'],
    ['the nose light', '14.27 -8.08'],
    ['the eye', '2.6 -4.6']]) {
    const cA = r.x.split(needle).length - 1, cB = r.y.split(needle).length - 1;
    console.log(`  ${name.padEnd(34)} occurrences A ${cA}, B ${cB}${cA === cB ? '   unchanged' : '   *** MOVED ***'}`);
  }
}
