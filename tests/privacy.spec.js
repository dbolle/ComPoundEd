// PRIVACY GATE — structural, and it runs in `npm test`.
//
// WHY IT IS A TEST AND NOT ONLY A HOOK. The pre-push hook is the last line, and
// on 2026-08-23 it turned out to have three holes at once: it failed open under
// `pipefail` when the match came early, it scanned only the NET diff so content
// added and removed inside a pushed range was invisible, and it could not read
// symlink targets at all. A username reached a public repository through the
// second hole. Hooks are also per-machine and per-clone; they can be skipped
// with `--no-verify` and are simply absent in a fresh checkout.
//
// The suite is the one gate this project already treats as non-negotiable —
// CLAUDE.md says never ship red, and every specialist round must run it. So the
// rules live here too, where an agent cannot route around them without visibly
// breaking the build.
//
// NOTHING HERE EVER PRINTS A PRIVATE TERM. Failures name the FILE and the RULE,
// never the value — the same discipline the hook follows. A message that says
// what was found would put the secret in CI logs, in a terminal transcript, and
// in whatever the agent writes back to the judge.
import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, lstatSync, readlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 });
const tracked = () => git('ls-files', '-z').split('\0').filter(Boolean);

const isText = (p) => {
  try {
    const b = readFileSync(p);
    // A NUL in the first 8k is the usual "this is binary" heuristic.
    return !b.subarray(0, 8192).includes(0);
  } catch { return false; }
};

test('no tracked file contains a private term', () => {
  const termsFile = join(homedir(), '.config/compounded/private-terms');
  test.skip(!existsSync(termsFile), 'no private-terms file on this machine');

  // Each line is `<term>` (substring, the default and the strict one) or
  // `<term>|word` (whole-word only, for a term that is also ordinary English).
  const rules = readFileSync(termsFile, 'utf8').split('\n')
    .map((l) => l.trim()).filter(Boolean)
    .map((l) => {
      const [term, mode] = l.split('|');
      return { term: term.toLowerCase(), word: mode === 'word' };
    })
    .filter((r) => r.term);

  const offenders = [];
  for (const rel of tracked()) {
    const abs = join(ROOT, rel);
    if (!existsSync(abs) || !isText(abs)) continue;
    const hay = readFileSync(abs, 'utf8').toLowerCase();
    for (const r of rules) {
      const hit = r.word
        ? new RegExp(`\\b${r.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(hay)
        : hay.includes(r.term);
      // Report the FILE only. Never the term, never the line, never the index —
      // an index plus a terms file of known length is itself information.
      if (hit) { offenders.push(rel); break; }
    }
  }
  expect(offenders, `private data in tracked files (values deliberately not shown): ${offenders.join(', ')}`)
    .toEqual([]);
});

test('no tracked file hardcodes an absolute machine path', () => {
  // Paths are derived from import.meta.url via coloringbook/judge/_paths.mjs;
  // anything machine-specific belongs in gitignored judge.local.json. A
  // hardcoded /home/<user>/ is how a username reached a public repo, and it
  // also silently makes an instrument measure the wrong checkout from inside a
  // worktree.
  const BAD = [
    /\/home\/[A-Za-z0-9._-]+\//,
    /\/Users\/[A-Za-z0-9._-]+\//,
    /\/tmp\/claude-[0-9]+\//,
  ];
  // Retired instruments are frozen historical artefacts, not runnable code.
  const skip = (rel) => rel.startsWith('coloringbook/judge/retired/');
  const offenders = [];
  for (const rel of tracked()) {
    if (skip(rel)) continue;
    const abs = join(ROOT, rel);
    if (!existsSync(abs) || !isText(abs)) continue;
    const body = readFileSync(abs, 'utf8');
    if (BAD.some((re) => re.test(body))) offenders.push(rel);
  }
  expect(offenders, `hardcoded absolute paths: ${offenders.join(', ')}`).toEqual([]);
});

test('no tracked symlink points outside the repository', () => {
  // `grep -r` will not read a symlink and `git grep` skips them, so a symlink
  // whose TARGET is a private path is invisible to every text scan. One
  // pointing at a home directory was committed and published exactly that way.
  const offenders = [];
  for (const rel of tracked()) {
    const abs = join(ROOT, rel);
    let st;
    try { st = lstatSync(abs); } catch { continue; }
    if (!st.isSymbolicLink()) continue;
    const target = readlinkSync(abs);
    if (target.startsWith('/') || !resolve(join(abs, '..'), target).startsWith(ROOT)) offenders.push(rel);
  }
  expect(offenders, `symlinks escaping the repo: ${offenders.join(', ')}`).toEqual([]);
});

test('no secret-bearing or machine-local file is tracked', () => {
  const BAD = [
    /(^|\/)\.env($|\.(?!example))/,
    /settings\.local/,
    /\.tmp\.\d+/,
    /(^|\/)judge\.local\.json$/,
    /(^|\/)private-terms/,
    /\.(pem|key)$/,
    /(^|\/)id_(rsa|ed25519)/,
    /(^|\/)\.npmrc$/,
  ];
  const offenders = tracked().filter((rel) => BAD.some((re) => re.test(rel)));
  expect(offenders, `machine-local or secret-bearing files are tracked: ${offenders.join(', ')}`)
    .toEqual([]);
});

test('the privacy machinery does not describe what it protects', () => {
  // The secret was never committed. The DESCRIPTION of it nearly was: a tracked
  // allowlist names the words containing a term, and a comment explaining why a
  // term needed one supplies its length, its occurrence count and the word
  // family around it — enough to enumerate candidates from a public checkout
  // and confirm one by hit count. Policy now lives in the private terms file,
  // and nothing tracked may characterise a term.
  // These match the things that actually enable inference: a stated LENGTH, a
  // stated OCCURRENCE COUNT, a masked spelling, or the filename of an allowlist
  // (which would name the containing words). Discussing the RULE is fine and
  // must stay fine, or the rule cannot be explained to the next agent — so
  // "an allowlist names the words containing a term" does not trip this.
  const TELLS = [
    /\b(\d+|one|two|three|four|five|six|seven|eight)[- ]char(acter)?s?\b[^\n]{0,80}\bterm\b/i,
    /\bterm\b[^\n]{0,80}\b(\d+|one|two|three|four|five|six|seven|eight)[- ]char(acter)?s?\b/i,
    /private[- ]terms[- ]allow/i,
    /\b\d+ occurrences\b[^\n]{0,60}\b\d+ files\b/i,
    /\b[a-z]{2,}#{3,}[a-z]*\b/i, // a partially masked spelling of a word
  ];
  const offenders = [];
  for (const rel of tracked()) {
    if (!/\.(md|mjs|js|sh|json|ya?ml)$/.test(rel) && !rel.startsWith('.githooks/')) continue;
    const abs = join(ROOT, rel);
    if (!existsSync(abs) || !isText(abs)) continue;
    const body = readFileSync(abs, 'utf8');
    if (TELLS.some((re) => re.test(body))) offenders.push(rel);
  }
  expect(offenders, `tracked text characterises a private term: ${offenders.join(', ')}`).toEqual([]);
});
