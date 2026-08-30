// EVERY VERSION THIS PROJECT HAS SHIPPED MUST HAVE A CHANGELOG ENTRY.
//
// ── WHY THIS IS A TEST ──────────────────────────────────────────────────────
// CLAUDE.md makes documentation part of every change: BACKLOG, CHANGELOG and
// the `package.json` version move together, in one commit. That held for a
// hundred releases and then failed twice in one evening, both times silently,
// both times for the same reason — **a text substitution that matched nothing
// and reported success.**
//
//   1. A merge helper was called with the same string as both its search and
//      its replacement, so a section that should have been renumbered kept the
//      old number. `package.json` said 1.121.0; the heading said 1.119.0.
//   2. The next release's entry was then anchored on `"## v1.121.0"` — a
//      heading that, because of (1), did not exist. `String.replace` with a
//      needle it cannot find returns the input unchanged and throws nothing, so
//      the entry was dropped and the commit reported success.
//
// Neither was caught by review, by the suite, or by the judge. Both were found
// by a specialist round that happened to look at `package.json` and wonder
// where the matching heading was.
//
// This is the same defect as the stale instrument anchors in ledger A30, one
// layer out: an edit that does not verify its anchor matched is not an edit,
// it is a wish. That one is now guarded by `tests/judge-anchors.spec.js`. This
// guards the documentation.
//
// WHAT IT ASSERTS
//   · every version `package.json` has EVER carried, across the whole of git
//     history, has a heading in CHANGELOG.md;
//   · headings are unique;
//   · headings descend in semver order, so a renumbered section that is left
//     in its old position is caught too — that is what actually happened.
//
// WHAT IT DELIBERATELY DOES NOT DO: require an entry for a version that was
// never committed. A version bump living only in a working tree is not yet a
// release, and failing on it would make the gate fire during ordinary work.
import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const CHANGELOG = join(ROOT, 'CHANGELOG.md');

const cmp = (a, b) => {
  const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
  return 0;
};

// Versions on main's own line with no entry, each needing a stated reason --
// because "there is no entry" is also what a silently dropped one looks like,
// so an unexplained gap must not be quietly tolerated. Audited 2026-08-30.
const NO_ENTRY = {
  '0.1.0': 'the initial commit, before CHANGELOG.md existed',
  '1.63.0': 'gap in the historical record, predating this gate; the release is in git but was never written up',
  '1.84.2': 'gap in the historical record, predating this gate; a patch release that shipped without an entry',
};

const headings = () => [...readFileSync(CHANGELOG, 'utf8')
  .matchAll(/^## v(\d+\.\d+\.\d+)\b/gm)].map((m) => m[1]);

/** every version package.json has ever carried, oldest first */
function shippedVersions() {
  let log;
  try {
    // FIRST-PARENT ONLY. A round is developed on a branch that carries its own
    // version, and the judge renumbers it FORWARD at merge when the number has
    // been taken in the meantime (a release must never move the displayed
    // version backwards). Those branch-side numbers -- 1.113.0, 1.114.0 and
    // 1.119.0 at the time of writing -- are real commits reachable from main,
    // but they were never released, and requiring an entry for each would fail
    // the gate for doing exactly the right thing. main's own line is the
    // release history.
    log = execFileSync('git', ['log', '--first-parent', '--format=%H', '--', 'package.json'],
      { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  } catch { return null; }                       // not a git checkout — skip
  const seen = new Set();
  for (const sha of log) {
    try {
      const pkg = execFileSync('git', ['show', `${sha}:package.json`], { cwd: ROOT, encoding: 'utf8' });
      const v = JSON.parse(pkg).version;
      if (v) seen.add(v);
    } catch { /* package.json absent or unparseable at that commit */ }
  }
  return [...seen].sort(cmp);
}

test('every shipped version has a CHANGELOG entry', () => {
  expect(existsSync(CHANGELOG), 'CHANGELOG.md must exist').toBe(true);
  const shipped = shippedVersions();
  test.skip(shipped === null, 'not a git checkout');
  expect(shipped.length, 'no versions found in git history — the scan has stopped working').toBeGreaterThan(0);

  const have = new Set(headings());
  const missing = shipped.filter((v) => !have.has(v) && !NO_ENTRY[v]);
  expect(missing, 'these versions were committed in package.json but have no `## vX.Y.Z` heading in '
    + 'CHANGELOG.md. The usual cause is a text substitution whose anchor did not match: String.replace '
    + 'returns the input unchanged and throws nothing, so the entry is silently dropped.\n  '
    + missing.join('\n  ')).toEqual([]);
});

test('CHANGELOG headings are unique and descend', () => {
  const h = headings();
  expect(h.length, 'CHANGELOG.md has no version headings at all').toBeGreaterThan(0);

  // FIVE VERSIONS CARRY TWO DIFFERENT BODIES EACH, and this gate is how anyone
  // found out. v1.98.0, v1.99.0, v1.100.0, v1.101.0 and v1.103.0 each have two
  // sections with DIFFERENT text -- two rounds took the same version number and
  // a merge kept both write-ups. Repairing them means deciding which round
  // wrote which paragraph about work five days old, so they are recorded here
  // rather than guessed at, and ANY NEW duplicate fails. A gate that is red on
  // arrival gets ignored; a gate that names its backlog does not.
  const KNOWN_DUPES = ['1.98.0', '1.99.0', '1.100.0', '1.101.0', '1.103.0'];
  const dupes = [...new Set(h.filter((v, i) => h.indexOf(v) !== i))];
  expect(dupes.filter((v) => !KNOWN_DUPES.includes(v)),
    'duplicate CHANGELOG headings. Two entries for one version means two rounds took the same number '
    + 'and a merge kept both -- renumber one FORWARD (never backwards) and fold its text in.').toEqual([]);
  expect(KNOWN_DUPES.filter((v) => !dupes.includes(v)),
    'a version listed in KNOWN_DUPES is no longer duplicated -- someone fixed it, so remove it from the '
    + 'list. An exemption nobody prunes becomes a place for new faults to hide.').toEqual([]);

  const outOfOrder = [];
  // `< 0` not `<= 0`: an equal pair is one of the audited duplicates above and
  // is reported by that assertion, not twice by this one.
  for (let i = 1; i < h.length; i++) if (cmp(h[i - 1], h[i]) < 0) outOfOrder.push(`${h[i - 1]} then ${h[i]}`);
  expect(outOfOrder, 'CHANGELOG headings must descend. A section that was renumbered but left in its old '
    + 'position lands here — which is exactly how a merge put v1.121.0 between v1.120.0 and v1.118.0.\n  '
    + outOfOrder.join('\n  ')).toEqual([]);
});

test('the current package.json version has an entry', () => {
  const v = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;
  expect(headings(), `package.json is at ${v} and CHANGELOG.md has no heading for it. `
    + 'Documentation ships in the same commit as the change (CLAUDE.md).').toContain(v);
});
