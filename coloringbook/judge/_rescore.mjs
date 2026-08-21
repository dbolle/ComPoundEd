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

const run = (script, cwd = ROOT) => {
  try {
    return execFileSync('node', [script], { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
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

console.log('\n--- not covered here, and still owed per round: the per-coin');
console.log('--- reference fits (D1/D2/D3/D4/D5/D6/D7/D13), which carry their own');
console.log('--- frozen targets and publish overlays a human has to look at (§4.3).');
