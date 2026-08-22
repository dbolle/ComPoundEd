// _jn14ident — THE BYTE-IDENTITY PARTITION for round 14 (§5).
//
// `_jn6ident.mjs` does exactly this job but is pinned to round 6's pristine copy
// (`_jn6-before-coins.js`, which is not in this tree). It is hashed, so §1.1
// says do not edit it — this is the same procedure against THIS round's
// pristine copy, `_jn14-before-coins.js`, whose sha256 was recorded before any
// edit and is printed below.
//
// The FULL list of changed renders is printed, not a count: a render that
// differs but should not is the finding, and a summary statistic hides it.
//
// Run: node coloringbook/judge/_jn14ident.mjs
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BEFORE = new URL('./_jn14-before-coins.js', import.meta.url).pathname;
const AFTER = new URL('../../src/art/coins.js', import.meta.url).pathname;
const MONEY = new URL('../../src/engine/money.js', import.meta.url).pathname;
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

const rawB = readFileSync(BEFORE, 'utf8');
if (rawB.split("from '../engine/money.js'").length - 1 !== 1) throw new Error('import rewrite did not match once');
const bp = join(mkdtempSync(join(tmpdir(), 'jn14ident-')), 'coins.js');
writeFileSync(bp, rawB.split("from '../engine/money.js'").join(`from '${MONEY}'`));
if (readFileSync(bp, 'utf8').split(`from '${MONEY}'`).join("from '../engine/money.js'") !== rawB) throw new Error('copy differs by more than the import');

const a = await import(bp), b = await import(AFTER);
const SIZES = [26, 38, 42, 44, 54, 76, 84, 120, 190, 380];
console.log(`BEFORE ${BEFORE}\n       sha256:${sha(BEFORE)}`);
console.log(`AFTER  ${AFTER}\n       sha256:${sha(AFTER)}`);

const changed = [], same = [];
for (const id of a.COIN_IDS) for (const side of ['obverse', 'reverse']) for (const size of SIZES) {
  const x = a.coinSVG(id, size, { side }), y = b.coinSVG(id, size, { side });
  (x === y ? same : changed).push(`${id}.${side[0]}@${size}`);
}
console.log(`\n### byte-identity partition over ${same.length + changed.length} renders (${a.COIN_IDS.length} ids x 2 sides x ${SIZES.length} sizes)`);
console.log(`unchanged: ${same.length}    CHANGED: ${changed.length}`);
console.log(`changed renders: ${changed.length ? changed.join(' ') : 'none'}`);
const faces = [...new Set(changed.map((c) => c.split('@')[0]))];
console.log(`faces touched: ${faces.join(', ') || 'none'}`);
console.log(faces.some((f) => f !== 'nickel.o')
  ? "*** A FACE OUTSIDE THIS ROUND'S SCOPE MOVED — this diff is void under §5 ***"
  : "every changed render is on nickel.obverse, which is this round's subject");

// The pawcoins facade too — it re-exports, and a round that moved it would not
// show up in the sweep above.
const pa = await import(new URL('../../src/art/pawcoins.js', import.meta.url).pathname);
console.log(`\npawcoins.js exports: ${Object.keys(pa).sort().join(', ')}`);
