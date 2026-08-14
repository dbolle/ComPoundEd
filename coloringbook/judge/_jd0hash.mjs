// DIME r0, TASK 0 — HASH EVERYTHING BEFORE ANYTHING IS MEASURED (§1, N1).
//
// N1 (nickel r0, proposed): the gates file must be written and hashed BEFORE
// the first measurement, or the round is a self-assessment. So this runs first,
// twice: once over the subject / targets / references / eval libraries, and
// again (`node _jd0hash.mjs gates`) the moment `dime-gates.md` exists, before
// any instrument in this round has produced a number.
//
// Run: node coloringbook/judge/_jd0hash.mjs [gates]
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const R = (p) => new URL('../../' + p, import.meta.url).pathname;
const H = (p) => existsSync(p) ? 'sha256:' + createHash('sha256').update(readFileSync(p)).digest('hex') : null;

const SUBJECT = ['src/art/coins.js'];
const TARGETS = [
  'coloringbook/_headmask.json',          // dime obverse silhouette, 985 pts
  'coloringbook/_tonepatches.json',       // dime 12 tone patches
  'coloringbook/_p2strand.json',          // dime 4 strand discs
  'coloringbook/_rvtarget.json',          // reverse counts / rhythm / bands
  'coloringbook/pre-dime-p2.js',
  'coloringbook/pre-dime-p2b.js',
];
const REFS = ['dime-obv.jpg', 'dime-obv-2.jpg', 'dime-obv-3.jpg', 'dime-obv-4.jpg',
  'dime-rev.jpg', 'dime-rev-2.jpg'].map((f) => 'coloringbook/ref/' + f);
const EVALS = [
  'coloringbook/_p2lib.mjs', 'coloringbook/_p2score.mjs', 'coloringbook/_p2flat.mjs',
  'coloringbook/_p2bfloor.mjs', 'coloringbook/_p2contain.mjs', 'coloringbook/_p2iou.mjs',
  'coloringbook/_rvnorm.mjs', 'coloringbook/_rvdisc.mjs', 'coloringbook/_rvlib2.mjs',
  'coloringbook/_rvscore.mjs', 'coloringbook/_rvicon.mjs',
  'coloringbook/_x6lib.mjs', 'coloringbook/_x6dark.mjs', 'coloringbook/_x6mat.mjs',
  'coloringbook/_qtdisc.mjs', 'coloringbook/_nkflat.mjs', 'coloringbook/_nkeval.mjs',
  'coloringbook/judge/_jqgeom.mjs', 'coloringbook/judge/_jq8contain-v2.mjs',
  'coloringbook/judge/_jq9well.mjs', 'coloringbook/judge/_jq67edge.mjs',
  'coloringbook/judge/_jq10tier-v2.mjs', 'coloringbook/judge/_jq20indep.mjs',
  'coloringbook/judge/_jp4unwrap.mjs', 'coloringbook/judge/_jp7edge.mjs',
  'coloringbook/judge/_jn5rim.mjs',
];
const GATES = ['coloringbook/judge/dime-gates.md'];

const out = { when: new Date().toISOString(), commit: execSync('git rev-parse --short HEAD').toString().trim(),
  dirty: execSync('git status --porcelain -- src docs package.json').toString().trim() || null,
  subject: {}, targets: {}, references: {}, evals: {}, gates: {} };
for (const [k, list] of [['subject', SUBJECT], ['targets', TARGETS], ['references', REFS], ['evals', EVALS], ['gates', GATES]])
  for (const p of list) out[k][p] = H(R(p));

const P = new URL('./_jd0hashes.json', import.meta.url).pathname;
const mode = process.argv[2];
if (mode === 'gates') {
  const prev = JSON.parse(readFileSync(P, 'utf8'));
  if (prev.gates && prev.gates['coloringbook/judge/dime-gates.md']) {
    console.log('gates already hashed — refusing to rewrite (§6 rule 1)'); process.exit(0);
  }
  prev.gates = out.gates; prev.gates_when = out.when;
  writeFileSync(P, JSON.stringify(prev, null, 1));
  console.log('gates hashed into _jd0hashes.json:', JSON.stringify(prev.gates, null, 1));
} else {
  if (existsSync(P)) { console.log('_jd0hashes.json exists — refusing to overwrite (§6 rule 1)'); process.exit(0); }
  writeFileSync(P, JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
}
