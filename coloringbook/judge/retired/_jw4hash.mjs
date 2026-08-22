// R4 dime jaw — prove no hashed instrument or frozen target was edited.
//
// §1: if any frozen target or eval library changed when the specialist returns,
// the round is void. This worktree holds COPIES of them (its branch was stale
// and the baseline was synced at dispatch), so the check that matters is that
// every copy is still byte-identical to the shared checkout's original. Files
// this round created are prefixed `_jw4` by the brief's rule and are listed
// separately rather than skipped silently.
//
// Run: node coloringbook/judge/_jw4hash.mjs
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';

const HERE = new URL('../../', import.meta.url).pathname;   // worktree root
const SHARED = '/home/USER/compounded/';
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const dirs = ['coloringbook', 'coloringbook/judge', 'src/art', 'scripts', 'docs'];
const mine = [], differs = [], missing = [], same = [];
for (const d of dirs) {
  if (!existsSync(HERE + d)) continue;
  for (const f of readdirSync(HERE + d)) {
    const rel = `${d}/${f}`;
    if (!statSync(HERE + rel).isFile()) continue;
    if (!/\.(mjs|js|json|jsonl|md)$/.test(f)) continue;
    if (f.startsWith('_jw4')) { mine.push(rel); continue; }
    if (!existsSync(SHARED + rel)) { missing.push(rel); continue; }
    (sha(HERE + rel) === sha(SHARED + rel) ? same : differs).push(rel);
  }
}
console.log(`${same.length} files byte-identical to the shared checkout`);
console.log(`${differs.length} DIFFER:`);
for (const f of differs) console.log('   ' + f);
console.log(`${missing.length} present here but not in the shared checkout (generated output):`);
for (const f of missing.slice(0, 12)) console.log('   ' + f);
if (missing.length > 12) console.log(`   ... and ${missing.length - 12} more`);
console.log(`\n${mine.length} files this round created (prefix _jw4):`);
for (const f of mine) console.log('   ' + f);
