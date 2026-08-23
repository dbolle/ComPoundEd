// WHERE THINGS ARE — the one place an instrument may learn a filesystem path.
//
// WHY IT EXISTS. On 2026-08-23 the pre-push privacy gate caught the owner's
// username in 20 tracked files: instruments had hardcoded `/home/<user>/…`
// absolute paths, and 43 of 74 unpushed commits carried them. `origin/main` was
// clean, so nothing escaped, but the next push would have published a username
// into a PUBLIC repository. The redaction removed the name; it did not remove
// the cause, which is that instruments were taught to name machines.
//
// TWO RULES FOLLOW, and they are the whole point of this module:
//
//   1. NO ABSOLUTE PATH IS EVER WRITTEN IN A TRACKED FILE. Everything is
//      derived from `import.meta.url`, which is where this file actually is,
//      whatever the checkout is called and whoever owns it.
//   2. ANYTHING GENUINELY MACHINE-SPECIFIC — a scratch directory, the LAN
//      address of the home server, a port — lives in `judge.local.json`, which
//      is GITIGNORED, and is read through `local()`. A value that is not in the
//      repo cannot be committed to the repo.
//
// This also fixes a real second-order bug. The hardcoded paths pointed at the
// MAIN checkout, so an instrument copied into a round's worktree measured the
// main checkout's `coins.js` while appearing to measure the round's — the same
// class of error as the symlink trap in `_jp9partition.mjs`, and equally
// invisible in the output.
//
// usage:
//   import { ROOT, REF, JUDGE, SCRATCH, local } from './_paths.mjs';
//   const host = local('server.host');           // undefined if not configured
//   const host = local('server.host', '127.0.0.1');
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Walk up from this file until we find the checkout that contains it. Never
// `process.cwd()`: an instrument run from elsewhere would silently resolve
// against the wrong tree, which is how a round measured the wrong coins.js.
function findRoot(start) {
  let d = start;
  for (let i = 0; i < 12; i++) {
    if (existsSync(join(d, 'package.json')) && existsSync(join(d, 'src/art/coins.js'))) return d;
    const up = dirname(d);
    if (up === d) break;
    d = up;
  }
  throw new Error(
    '_paths.mjs: could not find the checkout root above ' + start +
    ' (looked for package.json + src/art/coins.js). ' +
    'An instrument must live inside the checkout it measures.',
  );
}

export const ROOT = findRoot(dirname(fileURLToPath(import.meta.url)));
export const JUDGE = join(ROOT, 'coloringbook/judge');
export const REF = join(ROOT, 'coloringbook/ref');

// Machine-specific values. Gitignored; absent is normal and never fatal.
const LOCAL_FILE = join(ROOT, 'judge.local.json');
let _local = null;
function loadLocal() {
  if (_local) return _local;
  try {
    _local = existsSync(LOCAL_FILE) ? JSON.parse(readFileSync(LOCAL_FILE, 'utf8')) : {};
  } catch (e) {
    throw new Error(`_paths.mjs: ${LOCAL_FILE} exists but is not valid JSON — ${e.message}`);
  }
  return _local;
}

/** Read a dotted key out of the gitignored judge.local.json. */
export function local(key, fallback = undefined) {
  const v = key.split('.').reduce((o, k) => (o == null ? o : o[k]), loadLocal());
  return v === undefined ? fallback : v;
}

// Scratch output. Defaults INSIDE the checkout, under a gitignored path, so an
// instrument that writes has somewhere to write without being told.
export const SCRATCH = resolve(ROOT, local('scratch', 'coloringbook/judge'));

// Run directly to see what resolved — useful when an instrument reads the wrong
// tree. Prints paths RELATIVE to root, so the output carries no username.
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  console.log('checkout root basename :', ROOT.split('/').pop());
  console.log('judge/ exists          :', existsSync(JUDGE));
  console.log('ref/ exists            :', existsSync(REF), existsSync(REF) ? '' : '(gitignored; link or populate it)');
  console.log('judge.local.json       :', existsSync(LOCAL_FILE) ? 'present' : 'absent (fine — defaults apply)');
  console.log('scratch (rel to root)  :', SCRATCH.startsWith(ROOT) ? SCRATCH.slice(ROOT.length + 1) : '<outside checkout>');
}
