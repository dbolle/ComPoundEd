// The judge's re-derivation pass, as one command.
//
// COIN-JUDGE.md §5: after a specialist returns, the judge verifies the frozen
// hashes are unchanged and then RE-SCORES EVERY DIMENSION ITSELF — it never
// accepts a number the specialist reported. Doing that by hand across four
// coins meant remembering which of 116 instruments to run and in what order,
// which is how a dimension goes quietly missing between rounds (§6: "a
// dimension never silently disappears").
//
// This runs the cross-coin instruments that apply to every subject and prints
// their headline numbers together. It deliberately does NOT run the per-coin
// reference-fitting instruments: those are slow, they need their own frozen
// targets, and several are interactive by design (they publish an overlay for
// a human to look at). Those stay a per-round decision.
//
// It is a REPORTER, not a gate. It prints values and the frozen gate beside
// them; it never writes a verdict. Verdicts are written into the scorecards by
// hand, with reasoning, because a verdict that a script can emit is a verdict
// nobody thought about.
//
// Run: node coloringbook/judge/_rescore.mjs
//      HASHES=path/to/hashes.txt  verify the frozen set first (recommended)
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const HERE = new URL('.', import.meta.url).pathname;
const ROOT = new URL('../../', import.meta.url).pathname;

const run = (script, cwd = ROOT, args = []) => {
  try {
    return execFileSync('node', [script, ...args], { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  } catch (e) {
    return `!! ${script} FAILED\n${(e.stdout || '') + (e.stderr || '')}`.slice(0, 4000);
  }
};

// ── §1 enforcement ─────────────────────────────────────────────────────────
// If any frozen artefact moved while a specialist held the tree, the round is
// void. This is checked FIRST and loudly, because every number below is
// meaningless if a target was edited.
const hashFile = process.env.HASHES;
if (hashFile && existsSync(hashFile)) {
  const want = readFileSync(hashFile, 'utf8').trim().split('\n');
  const files = want.map((l) => l.split(/\s+/).slice(1).join(' '));
  const got = execFileSync('sha256sum', files, { cwd: `${ROOT}coloringbook`, encoding: 'utf8' })
    .trim()
    .split('\n')
    .sort();
  const changed = [];
  const byName = new Map(got.map((l) => [l.split(/\s+/).slice(1).join(' '), l.split(/\s+/)[0]]));
  for (const line of want) {
    const [h, ...rest] = line.split(/\s+/);
    const name = rest.join(' ');
    if (byName.get(name) !== h) changed.push(name);
  }
  console.log(`\n=== §1 frozen artefacts: ${want.length} checked, ${changed.length} CHANGED`);
  if (changed.length) {
    console.log('!!! ROUND IS VOID — a hashed target or instrument was edited:');
    changed.forEach((c) => console.log('    ' + c));
  }
} else {
  console.log('\n=== §1 frozen artefacts: NOT CHECKED (set HASHES=... to check)');
}

// ── D9, blocking ───────────────────────────────────────────────────────────
console.log('\n=== D9 well-formedness  [gate: 0 undefined/NaN over every id x side x tier]');
const d9 = run(`${HERE}_jb9well.mjs`);
console.log(
  d9
    .split('\n')
    .filter((l) => /renders|RESPONSE|FAIL/.test(l))
    .join('\n')
);

// ── D8, per side, worst tier, with the depth partition ─────────────────────
console.log('\n=== D8 containment  [gate: 0.0000% outside the field circle, every tier]');
console.log('    (depth below the 0.01 authoring quantum is representation, not a defect — Q3)');
const d8 = run(`${HERE}_jq8contain-v2.mjs`);
const d8tail = d8.slice(d8.indexOf('=== D8 per coin'));
console.log(d8tail.split('\n').slice(1).join('\n').trim());

// ── D11, the set tripwire, both numbers (§6.2) ─────────────────────────────
console.log('\n=== D11 discriminability  [tripwire: no regression vs round 0 | set gate: rev/obv >= 3.0x]');
const d11 = run(`${ROOT}coloringbook/_x6mat.mjs`);
console.log(
  d11
    .split('\n')
    .filter((l) => /MINIMUM|RATIO|closest/.test(l))
    .join('\n')
);

// ── D10, added 2026-08-21 after it was missed ──────────────────────────────
// v1.57.0 moved EDGE.field to 44.07 at full and mid and held icon at 42.5,
// which put a 1.57-unit field step exactly at the 42->44 tier boundary — the
// discontinuity D10 exists to measure. The round entry listed D5-rim, D8, D9,
// D11 and D13 as re-derived and D10 was simply not in the set, so nobody
// looked. It moved on all four coins, two better and two worse: cent
// 5.44x -> 24.64x, quarter 6.36 -> 12.43, nickel 24.21 -> 9.12, dime
// 5.56 -> 4.26.
//
// A dimension that is not in this file is a dimension nobody is watching.
// That is the whole reason this file exists, and it took a specialist
// re-deriving a brief to notice the omission.
//
// Appendix R2 is why the ABSOLUTE d(ink) prints beside every ratio: a ratio
// improves if the denominator worsens, and only the numerator says whether
// the drawing moved.
console.log('\n=== D10 tier behaviour, obverse 42->44  [gate: boundary jump <= 4x the within-tier p90]');
for (const id of ['penny', 'nickel', 'dime', 'quarter']) {
  const out = run(`${HERE}_jp10tier.mjs`, ROOT, [id]);
  const line = out.split('\n').find((l) => /42->44/.test(l)) || '(no 42->44 row)';
  console.log(`  ${id.padEnd(8)} ${line.trim()}`);
}

console.log('\n--- not covered here, and still owed per round: the per-coin');
console.log('--- reference fits (D1/D2/D3/D4/D5/D6/D7/D13), which carry their own');
console.log('--- frozen targets and publish overlays a human has to look at (§4.3).');
