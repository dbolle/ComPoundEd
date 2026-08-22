// SPECIALIST INSTRUMENT — round 2. §1 EVIDENCE THAT NO INSTRUMENT WAS EDITED.
//
// This worktree is an isolated checkout on a stale branch, so `coloringbook/`
// had to be mirrored into it from the shared checkout before anything could
// run. That mirror is exactly the thing §1 hashes, so it needs proving:
// every file this round DID NOT WRITE must be byte-identical to its original
// in the shared checkout, and the only files that differ must be
// `src/art/coins.js` and the new `_jt2*` instruments.
//
//   node coloringbook/judge/_jt2hash.mjs
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const HERE = new URL('./', import.meta.url).pathname;          // <worktree>/coloringbook/judge/
const CB = join(HERE, '..');
const SHARED = '/home/USER/compounded/coloringbook';
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

const rows = [];
for (const [rel, mine, theirs] of [['', CB, SHARED], ['judge', HERE, join(SHARED, 'judge')]]) {
  for (const f of readdirSync(mine)) {
    const p = join(mine, f);
    if (!statSync(p).isFile()) continue;
    if (!/\.(mjs|json|jsonl|js|md)$/.test(f)) continue;
    let t;
    try { t = sha(join(theirs, f)); } catch { rows.push([rel, f, 'ONLY IN THIS WORKTREE']); continue; }
    rows.push([rel, f, sha(p) === t ? 'identical' : 'DIFFERS']);
  }
}
const byState = {};
for (const [rel, f, s] of rows) (byState[s] ??= []).push(rel ? `${rel}/${f}` : f);
console.log('\n=== _jt2hash — coloringbook mirror vs the shared checkout ===');
for (const s of ['identical', 'DIFFERS', 'ONLY IN THIS WORKTREE']) {
  const list = byState[s] || [];
  console.log(`\n${s}: ${list.length}`);
  if (s !== 'identical') for (const f of list.sort()) console.log('  ' + f);
}
console.log('\nsrc/art/coins.js in this worktree :', sha(join(CB, '..', 'src/art/coins.js')));
console.log('src/art/coins.js in the shared tree:', sha('/home/USER/compounded/src/art/coins.js'));
console.log('judge/_jt2-before-coins.js        :', sha(join(HERE, '_jt2-before-coins.js')));
console.log('judge/_jt2-after-coins.js         :', sha(join(HERE, '_jt2-after-coins.js')));
