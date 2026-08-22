// SPECIALIST, quarter reverse — the BEFORE revision, materialised from GIT.
//
// Shared by `_sqBident.mjs`, `_sqCba.mjs` and `_sqDsymlink.mjs` so all three
// compare against the same dispatch commit, and so none of them carries a
// checked-in 250 KB copy of `src/art/coins.js` with an absolute path baked in.
// The generator is the reproducible artefact (COIN-JUDGE §4.3); a snapshot that
// only works on one machine is not one.
//
// `src/art/coins.js` imports `../engine/money.js` relatively, so the extracted
// copy is written to a temp dir beside a rewritten import pointing at THIS
// checkout's module. That matters in a worktree: see `_sqDsymlink.mjs` for the
// case where a relative import silently resolved to the main checkout instead.
import { writeFileSync, mkdtempSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

export const DISPATCH = 'b788b0a';           // v1.67.0, this round's dispatch commit

export function beforeModule(rev = DISPATCH) {
  const root = new URL('../../', import.meta.url).pathname;
  const src = execFileSync('git', ['-C', root, 'show', `${rev}:src/art/coins.js`],
    { encoding: 'utf8', maxBuffer: 64 << 20 });
  const abs = new URL('../../src/engine/money.js', import.meta.url).pathname;
  const dir = mkdtempSync(join(tmpdir(), 'sqbefore-'));
  const out = join(dir, 'before-coins.mjs');
  writeFileSync(out, src.replace("from '../engine/money.js'", `from '${abs}'`));
  return { path: out, rev, sha256: createHash('sha256').update(src).digest('hex') };
}
