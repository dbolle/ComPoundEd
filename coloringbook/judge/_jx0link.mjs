// Worktree setup ONLY — no measurement here.
// `coloringbook/*` is gitignored except `judge/`, so a fresh worktree has no
// reference photographs and none of the untracked eval libraries (_pylib.mjs,
// _tonepatches-penny.json, …). They are READ-ONLY inputs and are symlinked in
// from the main checkout so the frozen artefacts a round is scored against are
// byte-identical to the judge's copies rather than duplicates that could drift.
// Nothing here writes into the main checkout.
//
// THE MAIN CHECKOUT IS FOUND, NOT NAMED (2026-08-23). This file used to open
// with `const SRC = '/home/<username>/compounded/coloringbook'`. That hardcoded
// a real username into a tracked file in a PUBLIC repository — the pre-push
// privacy gate caught it in 20 files across 43 commits. It also only ever
// worked on one machine.
//
// `git rev-parse --git-common-dir` is the correct derivation: from inside a
// linked worktree it returns the MAIN checkout's .git directory, which is
// exactly the thing this script needs and nothing else can supply. No username,
// no configuration, and it follows the repo wherever it is cloned. A
// `mainCheckout` key in the gitignored judge.local.json overrides it for the
// unusual case where the sources genuinely live outside the repo.
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { local } from './_paths.mjs';

const HERE = path.dirname(new URL(import.meta.url).pathname);

function mainCheckout() {
  const override = local('mainCheckout');
  if (override) return path.resolve(override);
  const common = execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'],
    { cwd: HERE, encoding: 'utf8' }).trim();
  return path.dirname(common); // .../<main checkout>/.git -> .../<main checkout>
}

const MAIN = mainCheckout();
const SRC = path.join(MAIN, 'coloringbook');
const DST = path.resolve(HERE, '..'); // .../worktree/coloringbook

if (path.resolve(DST) === path.resolve(SRC)) {
  console.error('refusing to link a checkout into itself — run this from inside a WORKTREE,');
  console.error('not from the main checkout.');
  process.exit(2);
}
if (!fs.existsSync(SRC)) {
  console.error(`no coloringbook/ under the main checkout (${path.basename(MAIN)}) — nothing to link.`);
  process.exit(2);
}

let n = 0;
for (const b of fs.readdirSync(SRC)) {
  if (b === 'judge' || b === '_pv') continue;
  const dst = path.join(DST, b);
  if (fs.existsSync(dst) || fs.lstatSync(dst, { throwIfNoEntry: false })) continue;
  fs.symlinkSync(path.join(SRC, b), dst);
  n++;
}
fs.mkdirSync(path.join(DST, '_pv'), { recursive: true });
// node_modules too, for the same reason (gitignored in the main checkout, so a
// worktree has none). It is REMOVED again at the end of a round, because a
// symlink does not match the `node_modules/` gitignore pattern and would show
// up as an untracked entry in the returned tree.
const nm = path.join(DST, '..', 'node_modules');
if (!fs.lstatSync(nm, { throwIfNoEntry: false })) fs.symlinkSync(path.join(MAIN, 'node_modules'), nm);
console.log(`linked ${n} entries into ${path.basename(DST)}; _pv is a real directory (writes stay in the worktree)`);
