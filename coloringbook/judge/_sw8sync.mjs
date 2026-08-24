// SPECIALIST (buck obverse) — DRIFT DETECTOR between `_sw7gen.mjs` and the art.
//
// ⚠️ THIS FILE USED TO WRITE `src/art/coins.js`, AND IT DID SO ON 2026-08-24.
//
// It was a plain `writeFileSync` at module top level with no flag, no guard and
// no confirmation: `node coloringbook/judge/_sw8sync.mjs` rewrote five VIGNETTE
// path strings in the SUBJECT. When the instrument sweep ran it, it changed one
// of them — the coat — because `_sw7gen.OVAL` is a stale copy of the vignette
// locus (see below). So the library contained a script that, merely by being
// run, edited the drawing every gate is scored against.
//
// That is the `_r<N>card.mjs` fault (WRITERS.md) in its worst form. Those
// fourteen wrote a *record*; this wrote the *subject*. It is also the exact
// hazard COIN-JUDGE.md §1 exists to prevent — "a specialist that can edit the
// target can score anything it likes" — sitting inside `judge/`, where §1 says
// nothing may edit.
//
// THE RULE, restated because this file broke it: an instrument REPORTS. It does
// not write. Running the whole library in any order must leave the repository
// byte-identical.
//
// So this file no longer writes anything, under any flag. It reports drift and
// exits non-zero, and the human applies the change. A generator that can only
// be *checked* against the art is still a generator; one that can silently
// overwrite the art is a liability.
//
//   node coloringbook/judge/_sw8sync.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PATHS, ELLIPSES, OVAL } from './_sw7gen.mjs';

const f = fileURLToPath(new URL('../../src/art/coins.js', import.meta.url));
const s = readFileSync(f, 'utf8');
let bad = 0;

// ── 1. THE GENERATOR'S OVAL IS STALE, AND IT IS LOAD-BEARING (ledger A17).
//
// `_sw7gen.OVAL` is `cy 30.30, ry 14.00` — round 0's frozen D1 locus. The art
// has not used that ellipse since the buck-obverse round re-fitted it on the
// printed-border fiducial; `src/art/coins.js` documents the correction in
// terms ("cy and ry MOVED; cx and rx DID NOT") and draws the coat's lower
// boundary as `A 9.75 15.75`, i.e. ry 15.75 about cy 31.38.
//
// The copy is not decoration. `coatPath()` closes the coat ON `OVAL`, and
// `outsideOval()` measures containment against `OVAL`, so every containment
// figure this generator ever printed was taken against an ellipse 1.75 units
// (11.11 %) too short and 1.08 units too high. Recovered here from the art
// rather than restated, so the drift cannot go stale a second time.
const coat = s.match(/\n  coat: '([^']*)'/);
if (!coat) { console.log('FAIL: VIGNETTE.coat not found in coins.js'); process.exit(1); }
const arcs = [...coat[1].matchAll(/A ([\d.]+) ([\d.]+) 0 0 1 ([\d.-]+) ([\d.-]+)/g)];
const drawn = arcs.length
  ? { rx: +arcs[0][1], ry: +arcs[0][2], cx: +arcs[1][3], cy: +arcs[1][4] - +arcs[0][2] }
  : null;
console.log('=== 1. the frozen oval the generator holds, against the one the art draws ===');
if (!drawn) { console.log('  FAIL: could not recover the ellipse from VIGNETTE.coat'); bad++; }
else {
  console.log('             cx      cy      rx      ry');
  console.log(`  generator  ${OVAL.cx.toFixed(2)}  ${OVAL.cy.toFixed(2)}  ${OVAL.rx.toFixed(2)}  ${OVAL.ry.toFixed(2)}   (_sw7gen.OVAL)`);
  console.log(`  the art    ${drawn.cx.toFixed(2)}  ${drawn.cy.toFixed(2)}  ${drawn.rx.toFixed(2)}  ${drawn.ry.toFixed(2)}   (recovered from VIGNETTE.coat's arcs)`);
  const d = ['cx', 'cy', 'rx', 'ry'].map((k) => `${k} ${(OVAL[k] - drawn[k]).toFixed(2)}`).join('  ');
  const same = ['cx', 'cy', 'rx', 'ry'].every((k) => Math.abs(OVAL[k] - drawn[k]) < 0.005);
  console.log(`  delta      ${d}${same ? '' : `   <-- STALE: ry is ${(100 * (OVAL.ry - drawn.ry) / drawn.ry).toFixed(2)} % of the drawn ry`}`);
  if (!same) { bad++; console.log('  Every coatPath() / outsideOval() number from _sw7gen.mjs used the generator column.'); }
}

// ── 2. the five VIGNETTE paths
console.log('\n=== 2. the five VIGNETTE path strings ===');
for (const [k, d] of Object.entries(PATHS)) {
  const m = s.match(new RegExp(`\\n  ${k}: '([^']*)'`));
  if (!m) { console.log(`  ${k.padEnd(6)} NOT FOUND in coins.js`); bad++; continue; }
  const ok = m[1] === d;
  if (!ok) bad++;
  console.log(`  ${k.padEnd(6)} ${ok ? 'identical' : `DRIFTED (art ${m[1].length} chars, generator ${d.length} chars)`}`);
}

// ── 3. the full-tier ellipses.
//
// SCOPED TO THE VIGNETTE BLOCK. The old check scanned the WHOLE of coins.js for
// `<ellipse …>` and kept everything with `rx < 5`, so an unrelated ellipse
// elsewhere in the file joined the list and the comparison threw on a file that
// had not drifted at all. A check that fails for a reason outside its own
// subject is not a check.
const blk = s.slice(s.indexOf('const VIGNETTE'));
const emitted = [...blk.matchAll(/<ellipse cx="([\d.]+)" cy="([\d.]+)" rx="([\d.]+)" ry="([\d.]+)"\/>/g)]
  .map((m) => ({ cx: +m[1], cy: +m[2], rx: +m[3], ry: +m[4] }))
  .filter((e) => e.rx < 5);           // the vignette rule is rx 9.75 and is not ours
console.log('\n=== 3. the full-tier ellipses ===');
if (JSON.stringify(ELLIPSES) !== JSON.stringify(emitted)) {
  bad++;
  console.log(`  DRIFTED — generator has ${ELLIPSES.length}, the vignette block has ${emitted.length}`);
  console.log(`  generator: ${JSON.stringify(ELLIPSES)}`);
  console.log(`  the art:   ${JSON.stringify(emitted)}`);
} else console.log(`  ${emitted.length} ellipses identical to _sw7gen.mjs ELLIPSES`);

// §1 / WRITERS.md: prove, in the output, that nothing was written.
if (readFileSync(f, 'utf8') !== s) { console.log('\nFAIL: src/art/coins.js changed during this run'); process.exit(1); }
console.log(`\nsrc/art/coins.js was READ and not written (${s.length} bytes, unchanged).`);
console.log(bad ? `DRIFT: ${bad} check(s) disagree. Nothing was changed — apply it by hand, deliberately.`
  : 'No drift: the generator and the art agree.');
process.exit(bad ? 1 : 0);
