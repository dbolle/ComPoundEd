// SPECIALIST working instrument (dime obverse, D7 round) — §4 response test
// for `_jd7fitted.mjs`, run on a GENERATED COPY of coins.js. The worktree is
// never touched and the hashed instrument is never edited (§1).
//
// Three perturbations, each with the direction the number must move stated
// BEFORE it is run:
//
//   1. straighten HEAD.Roosevelt's truncation corner (knot 23) by replacing the
//      straight cut `L` with a curve tangent to the incoming bust front. The
//      111.2 deg tangent reading must FALL a long way.
//   2. put a deliberate 90-deg kink into a knot on HAIR.Roosevelt that is
//      currently smooth (knot 20's control points mirrored). The over-75 count
//      must RISE by one.
//   3. no-op control: reformat whitespace only. Every number must be identical.
//
// Run: node coloringbook/judge/_sd7resp.mjs
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = new URL('../../', import.meta.url).pathname;
const HERE = new URL('.', import.meta.url).pathname;
const src = readFileSync(`${ROOT}src/art/coins.js`, 'utf8');

const CASES = [
  { name: '1 straighten HEAD knot 23 (the truncation corner)',
    from: "    'L -31.49 19.07', // THE CUT",
    to: "    'C -8.2 46.4 -20.5 30.1 -31.49 19.07', // THE CUT",
    expect: 'HEAD tangent worst FALLS well below 111.2' },
  { name: '2 kink HAIR knot 20 (currently smooth)',
    from: "    'C -14.9 -1.1 -13.6 -1.6 -12.2 -1.7', // over the top of the EAR: measured",
    to: "    'C -14.9 -1.1 -13.6 6.4 -12.2 -1.7', // over the top of the EAR: measured",
    expect: 'HAIR tangent over-75 count RISES' },
  { name: '3 control: whitespace only',
    from: "  Roosevelt: [\n    'M 10.37 -28.04', // ← head outline, run backwards from the hairline",
    to: "  Roosevelt: [\n\n    'M 10.37 -28.04', // ← head outline, run backwards from the hairline",
    expect: 'every number IDENTICAL' },
];

const dime = (out) => {
  const j = out.slice(out.indexOf('\nJSON ') + 6);
  const o = JSON.parse(j);
  return {
    head: o['dime.obverse.HEAD.Roosevelt'],
    hair: o['dime.obverse.HAIR.Roosevelt'],
  };
};
const runOn = (file) => {
  const dir = mkdtempSync(join(tmpdir(), 'sd7r-'));
  // _jd7fitted.mjs reads ../../src/art/coins.js by path, so the copy has to sit
  // there. Run it against a temp CHECKOUT of the repo instead of editing ours:
  // copy the instrument next to a temp src tree.
  return execFileSync('node', [`${HERE}_jd7fitted.mjs`], { cwd: file, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
};

// Build a temp tree: symlink everything except src/art/coins.js, which is the
// perturbed copy. That keeps the instrument byte-identical and the import graph
// real.
function tree(text) {
  const dir = mkdtempSync(join(tmpdir(), 'sd7tree-'));
  execFileSync('mkdir', ['-p', join(dir, 'src'), join(dir, 'coloringbook', 'judge')]);
  execFileSync('cp', ['-r', `${ROOT}src/.`, join(dir, 'src')]);
  writeFileSync(join(dir, 'src', 'art', 'coins.js'), text);
  execFileSync('cp', [`${HERE}_jd7fitted.mjs`, join(dir, 'coloringbook', 'judge', '_jd7fitted.mjs')]);
  return dir;
}

const baseOut = execFileSync('node', ['coloringbook/judge/_jd7fitted.mjs'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
const base = dime(baseOut);
console.log('BASELINE (this worktree)');
console.log(`  HEAD.Roosevelt  knots ${base.head.knots}  tangent worst ${base.head.tangent[0]}  over75 ${base.head.tangent[1]}`);
console.log(`  HAIR.Roosevelt  knots ${base.hair.knots}  tangent worst ${base.hair.tangent[0]}  over75 ${base.hair.tangent[1]}`);

for (const c of CASES) {
  if (!src.includes(c.from)) { console.log(`\n${c.name}: ANCHOR MISSING — the test is stale, fix it before trusting D7`); continue; }
  const dir = tree(src.replace(c.from, c.to));
  const out = execFileSync('node', ['coloringbook/judge/_jd7fitted.mjs'], { cwd: dir, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  const r = dime(out);
  console.log(`\n${c.name}\n  expected: ${c.expect}`);
  console.log(`  HEAD.Roosevelt  knots ${r.head.knots}  tangent worst ${r.head.tangent[0]}  over75 ${r.head.tangent[1]}`);
  console.log(`  HAIR.Roosevelt  knots ${r.hair.knots}  tangent worst ${r.hair.tangent[0]}  over75 ${r.hair.tangent[1]}`);
}
