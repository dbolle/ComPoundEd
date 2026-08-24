// AN INSTRUMENT THAT PERTURBS THE ART BY STRING-REPLACE MUST STILL MATCH IT.
//
// ── WHY THIS IS A TEST AND NOT A NOTE IN A DOCUMENT ─────────────────────────
// Several instruments in `coloringbook/judge/` measure whether they can MOVE by
// generating a perturbed copy of `src/art/coins.js`:
//
//     const anchor = "…some exact text from coins.js…";
//     if (!code.includes(anchor)) throw new Error('RESPONSE anchor missing');
//     const bumped = await loadCoins(code.replace(anchor, "…changed…"));
//
// The anchor is a literal copy of a fragment of the subject, so it goes stale
// the moment the art is edited — and when it does, the instrument stops
// working. The findings ledger has now recorded this same failure five times
// (A11 `_jq8contain-v2`, A13 `_jh8locus`, A30 `_jd14d1resp`, and, found by the
// A30 sweep, `_jl1cap`, `_jl1floor`, `_jl3probe`, `_jq10tier`).
//
// The guards were not the problem. Every one of those instruments DID check its
// anchor and DID throw. The problem is that a response test nobody executes is
// indistinguishable from one that passes, and nothing executes the instrument
// library on a schedule. Four of those anchors had been dead since v1.93.0 or
// v1.94.0 and the gates they guard kept shipping verdicts.
//
// So the check moves to where it cannot be skipped. Lesson 10 in the findings
// ledger, in as many words: **enforcement must be a test, not prose.**
//
// WHAT IT ASSERTS: every anchor literal an instrument holds still occurs in
// `src/art/coins.js` EXACTLY ONCE. Once, not merely at least once — an anchor
// that matches twice perturbs two coins and the resulting number is a blend of
// both, which is a quieter fault than not matching at all.
//
// WHAT IT DELIBERATELY DOES NOT DO: parse JavaScript. It resolves single-line
// string literals bound to a `const`/`let` and used as the first argument of
// `.replace()`. A template literal with `${…}` in it cannot be resolved
// statically and is skipped — those are listed by the last test so the gap is
// visible rather than assumed away.
import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const JUDGE = join(ROOT, 'coloringbook/judge');
const COINS = join(ROOT, 'src/art/coins.js');

const unescape = (s) => s
  .replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\r/g, '\r')
  .replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\`/g, '`').replace(/\\\\/g, '\\');

/**
 * Anchors an instrument holds, resolved statically.
 * Returns [{ file, line, name, literal }] for `const NAME = '…'` used as
 * `x.replace(NAME, …)`, and [{ dynamic }] for the ones that cannot be resolved.
 */
function anchorsIn(file, text) {
  const consts = new Map(), dynamic = [];
  for (const m of text.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(['"`])((?:\\.|(?!\2).)*)\2\s*;?\s*$/gm)) {
    if (m[2] === '`' && m[3].includes('${')) { dynamic.push(m[1]); continue; }
    consts.set(m[1], unescape(m[3]));
  }
  const out = [];
  for (const m of text.matchAll(/\.replace(?:All)?\(\s*([A-Za-z_$][\w$]*)\s*,/g)) {
    const lit = consts.get(m[1]);
    const line = text.slice(0, m.index).split('\n').length;
    if (lit === undefined) {
      if (dynamic.includes(m[1])) out.push({ file, line, name: m[1], dynamic: true });
      continue;
    }
    if (lit.length < 6) continue;                 // too short to be a subject anchor
    out.push({ file, line, name: m[1], literal: lit });
  }
  return out;
}

// Anchors that are deliberately NOT fragments of coins.js. Each needs a reason,
// because "it is not in coins.js" is exactly what a stale anchor also looks
// like — the exemption has to say what the anchor IS instead.
const NOT_IN_COINS = {
  "from '../engine/money.js'": 'an import specifier rewritten so a generated copy in a temp dir can resolve — it is coins.js text, and IS asserted unique by the instrument itself',
};

const files = existsSync(JUDGE)
  ? readdirSync(JUDGE).filter((f) => f.endsWith('.mjs')).sort()
  : [];

test('every judge instrument that perturbs the art still matches it', () => {
  expect(existsSync(COINS), 'src/art/coins.js must exist').toBe(true);
  expect(files.length, 'coloringbook/judge/ must contain instruments').toBeGreaterThan(0);

  const art = readFileSync(COINS, 'utf8');
  const stale = [], ambiguous = [];
  let checked = 0;

  for (const f of files) {
    for (const a of anchorsIn(f, readFileSync(join(JUDGE, f), 'utf8'))) {
      if (a.dynamic || NOT_IN_COINS[a.literal] !== undefined) continue;
      checked++;
      const n = art.split(a.literal).length - 1;
      if (n === 0) stale.push(`${a.file}:${a.line}  ${a.name} = ${JSON.stringify(a.literal.slice(0, 72))}`);
      else if (n > 1) ambiguous.push(`${a.file}:${a.line}  ${a.name} matches ${n} times`);
    }
  }

  expect(checked, 'the resolver found no anchors at all — it has probably stopped working').toBeGreaterThan(0);
  expect(stale, 'STALE ANCHOR: these instruments rewrite text that src/art/coins.js no longer contains, '
    + 'so their response tests cannot run and the gates they guard are unverified. '
    + 'Re-anchor on the live text (and assert the substitution reaches the render), '
    + 'or retire the instrument by MOVE into judge/retired/.\n  ' + stale.join('\n  ')).toEqual([]);
  expect(ambiguous, 'AMBIGUOUS ANCHOR: matches more than once, so the perturbation lands on more than '
    + 'one coin and the number is a blend.\n  ' + ambiguous.join('\n  ')).toEqual([]);
});

test('a retired instrument is not importable by a live one', () => {
  // COIN-JUDGE.md 1.1 / appendix R4. Retirement is by MOVE, and the point of
  // the move is that a live gate cannot pull a retracted number back in.
  const offenders = [];
  for (const f of files) {
    const t = readFileSync(join(JUDGE, f), 'utf8');
    for (const m of t.matchAll(/from\s+['"]\.\/retired\/[^'"]+['"]/g)) offenders.push(`${f}: ${m[0]}`);
    for (const m of t.matchAll(/import\(\s*['"]\.\/retired\/[^'"]+['"]/g)) offenders.push(`${f}: ${m[0]}`);
  }
  expect(offenders, 'a live instrument imports from judge/retired/\n  ' + offenders.join('\n  ')).toEqual([]);
});

test('the anchors that cannot be checked statically are listed, not assumed', () => {
  // A gap you can see is a gap. This test never fails on count; it exists so
  // that the set of unverifiable anchors is printed in the run and cannot grow
  // silently into the place the checked ones used to be.
  const dyn = [];
  for (const f of files) {
    for (const a of anchorsIn(f, readFileSync(join(JUDGE, f), 'utf8'))) if (a.dynamic) dyn.push(`${a.file}:${a.line} ${a.name}`);
  }
  console.log(dyn.length
    ? `anchors built from template literals, not statically checkable (${dyn.length}):\n  ${dyn.join('\n  ')}`
    : 'no anchors are built from template literals — every one in the library is statically checked.');
  expect(Array.isArray(dyn)).toBe(true);
});
