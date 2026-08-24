// THE GUARD ON WRITING A FROZEN ARTEFACT — one implementation, so there is one
// place to read the rule.
//
// WHY IT EXISTS. `WRITERS.md` states the rule: *an instrument reports, it does
// not write*, and running the whole library in any order must leave the
// repository byte-identical. Three live violations were recorded there and left
// open. Two of them are `_jb11d11.mjs json` and `_jb10d13.mjs json`, which
// overwrite hashed artefacts from a documented CLI flag with no guard at all —
// so the frozen evidence for a published round is one mistyped argument away
// from being replaced by a fresh measurement, silently, with the round's own
// hash file still asserting the old bytes.
//
// This is not the same defect as the fourteen `_r<N>card.mjs` files, which wrote
// at module top level and were deleted. These writes are behind a flag and the
// flag is genuinely useful once, when the artefact is first frozen. So they are
// GUARDED rather than removed:
//
//   · writing a path that does not exist yet is allowed — that is a freeze;
//   · writing bytes identical to what is already there is allowed and is a
//     no-op, so an accidental re-run still leaves the repo byte-identical;
//   · CHANGING an existing artefact requires `JUDGE_REFREEZE=1` in the
//     environment, and prints the old and new SHA-256 so the change is on the
//     record rather than in a diff nobody reads.
//
// A frozen artefact is evidence. §1.1 promises that any number ever published
// can be reproduced; that promise is only as good as the bytes it was computed
// from.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const sha = (b) => createHash('sha256').update(b).digest('hex');

/**
 * Write `text` to `path`, refusing to CHANGE an artefact that already exists.
 * Returns 'created' | 'unchanged' | 'refused' | 'refrozen'.
 */
export function freezeWrite(path, text, label = 'artefact') {
  const next = Buffer.from(text);
  if (!existsSync(path)) {
    writeFileSync(path, next);
    console.log(`FREEZE: created ${label}  sha256 ${sha(next).slice(0, 16)}`);
    return 'created';
  }
  const cur = readFileSync(path);
  if (cur.equals(next)) {
    console.log(`FREEZE: ${label} is already exactly these bytes — nothing written (sha256 ${sha(cur).slice(0, 16)})`);
    return 'unchanged';
  }
  if (!process.env.JUDGE_REFREEZE) {
    console.error(
      `\nFREEZE REFUSED — ${label} exists and the new bytes DIFFER.\n` +
      `  on disk  sha256 ${sha(cur).slice(0, 16)}\n` +
      `  computed sha256 ${sha(next).slice(0, 16)}\n` +
      '  A frozen artefact is evidence for a published round (WRITERS.md, COIN-JUDGE.md 1.1).\n' +
      '  Nothing was written. If you really mean to re-freeze, re-run with JUDGE_REFREEZE=1\n' +
      '  and record the hash change in the round report beside the number it changes.\n'
    );
    return 'refused';
  }
  writeFileSync(path, next);
  console.log(`FREEZE: RE-FROZE ${label} under JUDGE_REFREEZE=1  ${sha(cur).slice(0, 16)} -> ${sha(next).slice(0, 16)}`);
  return 'refrozen';
}

// Self-test. Runs entirely in a temp dir; touches nothing tracked.
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const { mkdtempSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const d = mkdtempSync(join(tmpdir(), 'freeze-'));
  const p = join(d, 'a.json');
  const r = [];
  r.push(['absent -> created', freezeWrite(p, '{"v":1}\n', 'test'), 'created']);
  r.push(['same bytes -> unchanged', freezeWrite(p, '{"v":1}\n', 'test'), 'unchanged']);
  r.push(['different bytes -> refused', freezeWrite(p, '{"v":2}\n', 'test'), 'refused']);
  const after = readFileSync(p, 'utf8');
  r.push(['refusal left the file alone', after === '{"v":1}\n' ? 'yes' : 'NO', 'yes']);
  process.env.JUDGE_REFREEZE = '1';
  r.push(['different bytes + flag -> refrozen', freezeWrite(p, '{"v":2}\n', 'test'), 'refrozen']);
  r.push(['re-freeze took effect', readFileSync(p, 'utf8') === '{"v":2}\n' ? 'yes' : 'NO', 'yes']);
  console.log('\nSELFTEST');
  let bad = 0;
  for (const [what, got, want] of r) {
    const ok = got === want;
    if (!ok) bad++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${what.padEnd(36)} got ${got}  want ${want}`);
  }
  console.log(bad ? `SELFTEST FAIL (${bad})` : 'SELFTEST PASS — the guard refuses, and only the flag can change an artefact');
}
