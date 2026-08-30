// A CONFLICT MARKER MUST NEVER REACH A COMMIT.
//
// ── WHY THIS IS A TEST ──────────────────────────────────────────────────────
// `docs/FINDINGS-LEDGER.md` carried a literal, unresolved merge conflict —
// `<<<<<<< HEAD`, `=======`, `>>>>>>> round-yreg` — for **five releases**. It
// was committed by the judge, pushed to a public repository, and found by a
// specialist round that was reading the ledger for something else.
//
// The damage was not cosmetic. Both sides of the conflict had allocated **D41**
// to different findings, so for those five releases two live ledger rows shared
// one id and every citation of it was ambiguous — including two inside
// `torch()`, the art itself. Worse, the two sides each carried a **D40**, and
// the copy that survived on `main` was the one WITHOUT the measured numbers: the
// ledger asserted a registration error it did not quantify, and the only record
// of the function was a CHANGELOG paragraph.
//
// None of that was visible. A conflict marker is valid Markdown, valid prose,
// and invisible to a renderer that treats it as a paragraph. Nothing in the
// suite looked, because nobody had thought to look.
//
// WHAT IT ASSERTS: no tracked text file contains a line that begins with a
// conflict marker. That is all, and it is enough — the failure mode is not
// subtle once anything checks for it at all.
//
// The related lesson is in `tests/changelog.spec.js`: an edit that does not
// verify its anchor matched is not an edit. This is the same family. A merge
// that does not verify its markers are gone is not a merge.
import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(new URL('..', import.meta.url).pathname);

// Binary and generated files are skipped: a `<<<<<<<` inside a PNG is a byte
// pattern, not a conflict, and a false positive here would train people to
// ignore the gate.
const TEXT = /\.(md|js|mjs|cjs|json|css|html|txt|yml|yaml|sh)$/i;

// `=======` alone is a Markdown setext underline for an H1, so it is only a
// marker when it appears with the other two. The opening and closing markers
// carry a label after them and cannot be confused with prose.
const OPEN = /^<{7} /m;
const CLOSE = /^>{7} /m;
const MID = /^={7}$/m;

test('no tracked file contains a merge conflict marker', () => {
  let files;
  try {
    files = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' })
      .trim().split('\n').filter((f) => TEXT.test(f));
  } catch {
    test.skip(true, 'not a git checkout');
    return;
  }
  expect(files.length, 'git ls-files returned no text files — the scan has stopped working')
    .toBeGreaterThan(0);

  const hits = [];
  for (const f of files) {
    let t;
    try { t = readFileSync(join(ROOT, f), 'utf8'); } catch { continue; }
    const open = OPEN.test(t), close = CLOSE.test(t);
    // Require BOTH ends. A lone `<<<<<<< ` in prose is conceivable; a matched
    // pair is not, and demanding the pair keeps this from ever crying wolf.
    if (open && close) {
      const line = t.split('\n').findIndex((l) => /^<{7} /.test(l)) + 1;
      hits.push(`${f}:${line}  (also has a closing marker${MID.test(t) ? ' and a divider' : ''})`);
    }
  }

  expect(hits, 'UNRESOLVED MERGE CONFLICT COMMITTED. This is not cosmetic: the last one sat in '
    + 'docs/FINDINGS-LEDGER.md for five releases and left two different findings sharing the id D41, '
    + 'so every citation of it — including two inside torch() — was ambiguous. Resolve the conflict, '
    + 'and check what the discarded side was carrying before you drop it.\n  '
    + hits.join('\n  ')).toEqual([]);
});
