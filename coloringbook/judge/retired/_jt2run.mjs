// SPECIALIST INSTRUMENT — round 2, D13, dime reverse. THE ITERATION HARNESS.
//
// One row per tier for a NAMED REVISION OF THE ART, from all three D13
// implementations at once, so an iteration cannot be reported against whichever
// instrument happened to like it:
//
//   `_x6dark.mjs`   the frozen cross-coin instrument (hashed, not edited)
//   `_jd10d13.mjs`  the dime round-0 instrument (hashed, not edited) — it
//                   hard-codes `../../src/art/coins.js`, so it can only be run
//                   against the WORKING TREE and this harness says so rather
//                   than pretending otherwise
//   `_jt2ink.mjs`   this round's, which adds the legend-free motif locus
//
// The revision is passed as an explicit path, never defaulted (round 1's
// contact sheet compared the new art with itself because its "before" defaulted
// to a mutable path — the brief names this and it is why `SRC` is required).
//
//   node coloringbook/judge/_jt2run.mjs <SRC> <tag>
import { execFileSync } from 'node:child_process';

const SRC = process.argv[2];
const TAG = process.argv[3] || 'run';
if (!SRC) throw new Error('SRC is required — a before/after artefact may not default its "before" (brief §RULES)');
const HERE = new URL('./', import.meta.url).pathname;
const run = (f, args, env) =>
  execFileSync('node', [f, ...args], { env: { ...process.env, ...env }, encoding: 'utf8' });

console.log(`########## ${TAG}   src=${SRC} ##########`);
for (const size of [26, 44, 84]) {
  const a = run(HERE + '_jt2ink.mjs', [String(size), SRC, TAG]);
  console.log(a.split('\n').filter((l) => l.trim()).join('\n'));
}
console.log('\n---- _x6dark.mjs (frozen), dime rows only ----');
for (const size of [26, 44, 84]) {
  const out = run(HERE + '../_x6dark.mjs', [String(size)], { SRC: SRC.replace(/^\.\//, './judge/') });
  const lines = out.split('\n');
  const i = lines.findIndex((l) => l.startsWith('dime      ref'));
  console.log(`size ${size}:`);
  console.log(lines.slice(i, i + 3).join('\n'));
}
