// DIME r0 — hash the cent-round instruments this round REUSES, before running
// them. They are id-parameterised and re-implementing them would be less
// trustworthy than running them (cent PY6's equivalence rule, in reverse).
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const R = (p) => new URL('../../' + p, import.meta.url).pathname;
const H = (p) => 'sha256:' + createHash('sha256').update(readFileSync(p)).digest('hex');
const L = ['coloringbook/judge/_jp9edge.mjs','coloringbook/judge/_jp10tier.mjs',
  'coloringbook/judge/_jp8ours.mjs','coloringbook/judge/_jp3disc.mjs',
  'coloringbook/judge/_jp1discs.json','coloringbook/judge/_jp12look.mjs',
  'coloringbook/judge/_jp13d2d13.mjs','coloringbook/_x6check.mjs','coloringbook/_x6sens.mjs',
  'coloringbook/_x6grid.mjs','coloringbook/_p2build.mjs','coloringbook/_p2ident.mjs',
  'coloringbook/_rvgrid.mjs','coloringbook/_rvprof.mjs','coloringbook/_rvindep.mjs'];
const P = new URL('./_jd0extra.json', import.meta.url).pathname;
if (existsSync(P)) { console.log('exists — refusing to overwrite'); process.exit(0); }
const o = {}; for (const p of L) o[p] = existsSync(R(p)) ? H(R(p)) : null;
writeFileSync(P, JSON.stringify(o, null, 1)); console.log(JSON.stringify(o, null, 1));
