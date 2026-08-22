// Worktree setup ONLY — no measurement here.
// This worktree is a git checkout of 8578995; `coloringbook/*` is gitignored
// except `judge/`, so the reference photographs and the untracked eval
// libraries (_pylib.mjs, _tonepatches-penny.json, ...) do not exist here.
// They are READ-ONLY inputs and are symlinked in from the main checkout so the
// frozen artefacts this round is scored against are byte-identical to the
// judge's copies rather than duplicates that could drift.
// Nothing here writes into the main checkout.
import fs from 'fs';
import path from 'path';

const SRC = '/home/USER/compounded/coloringbook';
const DST = path.resolve(process.argv[1], '../..'); // .../worktree/coloringbook
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
if (!fs.lstatSync(nm, { throwIfNoEntry: false })) fs.symlinkSync('/home/USER/compounded/node_modules', nm);
console.log(`linked ${n} entries into ${DST}; _pv is a real directory (writes stay in the worktree)`);
