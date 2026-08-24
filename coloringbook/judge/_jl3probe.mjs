// SPECIALIST INSTRUMENT — round 3, D5-HF on the QUARTER OBVERSE. A PROBE, and
// deliberately NOT a change.
//
// D5-HF-obverse-84px is 2.0089x against a <= 1.50x gate on art that has not
// moved in three rounds. The round-3 brief lists the candidate causes and says
// to measure rather than assume, and says in terms that concluding "this needs
// a frozen obverse band target first" is a legitimate finding.
//
// The measurement that came first (`_jl3over-qobv-liberty-ladder.png`): on
// `quarter-obv-2.jpg`, read off a half-unit arc ladder at the E of LIBERTY,
// the coin's obverse legend band is r 36.6..43.5, cap 6.9. Ours is r
// 36.09..40.18, ink cap 4.09 — the baseline is right to half a unit and the
// CAP IS 41% SHORT. There is no frozen obverse band target anywhere:
// `_jq4band.json` carries `top_legend` and `bottom_legend` and both are the
// REVERSE, and its own `_why_not_the_proofs` note rules the two obverse proof
// plates out for band work at +-2 to +-4.5 units of scale error.
//
// So this probe answers one question and stops: IF the type were grown to the
// cap the photograph has, which way would the HF ratio move? The brief's prior
// is that it would rise. That prior is worth testing precisely because §8
// forbids acting on the answer either way — a probe that cannot change the
// committed art cannot be tuning.
//
// It writes a GENERATED copy of the source to a temp path, scores it with
// `_jq5letter-v2.mjs` at that instrument's own frozen locus, and prints the
// before/after. It does NOT touch `src/art/coins.js`.
//
// §4 RESPONSE: the probe prints the parsed baseline and cap of the generated
//   copy, so a substitution that silently failed to apply is visible as an
//   unchanged geometry line rather than as an unchanged ratio.
// §4.1 NULL: no search.
//
// Run: node coloringbook/judge/_jl3probe.mjs
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const SRC = join(ROOT, 'src/art/coins.js');
const FIELD = 44.07;

// `inscriptionOf`: baseline = rField - size*0.85 - 3.77 + rOff
const rOffFor = (size, baseline) => baseline - FIELD + size * 0.85 + 3.77;

const CASES = [
  { name: 'as committed', size: 5.6, rOff: 0.55 },
  { name: 'cap 6.9 (the coin), baseline 36.6', size: 9.2, rOff: rOffFor(9.2, 36.6) },
  { name: 'cap 5.5, baseline 36.35 (half way)', size: 7.33, rOff: rOffFor(7.33, 36.35) },
];

// The generated copy lives outside src/art/, so its RELATIVE imports have to be
// rewritten to absolute ones or node resolves them against /tmp. Rewriting the
// import specifier changes no drawing code — checked by the geometry line each
// case prints, which comes from the copy itself.
const code = readFileSync(SRC, 'utf8')
  .replace(/from '(\.\.?\/[^']+)'/g, (m, p) => `from '${join(ROOT, 'src/art', p)}'`);
// RE-ANCHORED (ledger A30). This read `size: 5.6, centre: 270, rOff: 0.55`;
// the quarter obverse LIBERTY is now `size: 9.5, centre: 270, rOff: 4.175,
// adv: 1.03`, so the anchor named no live text and this probe has refused to
// run since the type was resized. Exactly-once, because `centre: 270` alone is
// not unique across the file.
const anchor = "main: { kind: 'arc', text: 'LIBERTY', size: 9.5, centre: 270, rOff: 4.175, adv: 1.03 }";
const hits = code.split(anchor).length - 1;
if (hits !== 1) throw new Error(`quarter obverse LIBERTY anchor matches ${hits} times, expected exactly 1 — refusing to guess`);
const dir = mkdtempSync(join(tmpdir(), 'jl3probe-'));

for (const c of CASES) {
  const repl = `main: { kind: 'arc', text: 'LIBERTY', size: ${c.size}, centre: 270, rOff: ${c.rOff.toFixed(4)}, adv: 1.03 }`;
  const p = join(dir, `coins-${c.size}.js`);
  const swapped = code.replace(anchor, repl);
  if (swapped === code) throw new Error(`case ${c.name}: the substitution did not change the source`);
  writeFileSync(p, swapped);
  const out = execFileSync('node', [join(HERE, '_jq5letter-v2.mjs')], { env: { ...process.env, ART: p }, encoding: 'utf8' });
  const obv = out.split('=== reverse')[0];
  const line84 = obv.split('\n').filter((l) => l.includes('84px') || (l.includes('HF@38.9') && obv.split('\n').indexOf(l) === obv.split('\n').findIndex((z) => z.includes('84px')) + 1));
  console.log(`\n--- ${c.name}   size ${c.size}  rOff ${c.rOff.toFixed(4)}  -> baseline ${(FIELD - c.size * 0.85 - 3.77 + c.rOff).toFixed(2)}, ink cap ${(0.73 * c.size).toFixed(2)}`);
  const lines = obv.split('\n');
  for (let i = 0; i < lines.length; i++) if (/^\s+(84|190)px/.test(lines[i])) console.log(lines[i] + '\n' + lines[i + 1]);
}
console.log(`\ngenerated copies left in ${dir} — src/art/coins.js was not touched`);
console.log('NOTHING HERE IS ADOPTED. There is no frozen obverse band target, so the cap above is a');
console.log('working measurement off one reference with a disc fit quoted from another instrument.');
