// RUN T1 WITH THE `hairFill` SIGN FLIPPED, WITHOUT EDITING THE ART.
//
// The primary gate is `_jt1transfer.mjs`. To ask what the sign is WORTH rather
// than only what it currently does, T1 has to be run on the other branch — and
// the honest way to do that is not to edit `src/art/coins.js` and remember to
// put it back. `OBVERSE` is exported, `coinSVG` reads `o.hairLit` at emit time,
// and ESM caches a module instance: import `coins.js` first, mutate the flags,
// then import T1, which gets the same instance. A candidate costs a process
// rather than an edit (the `_nk8probe.mjs` move), and the working tree is never
// touched, so no run can leave the repository modified.
//
// usage:
//   node coloringbook/judge/_jz5t1branch.mjs flip            all four flipped
//   node coloringbook/judge/_jz5t1branch.mjs flip:penny      one face flipped
//   node coloringbook/judge/_jz5t1branch.mjs lit:penny       one face forced LIT
//   node coloringbook/judge/_jz5t1branch.mjs dark:quarter,dime
//   node coloringbook/judge/_jz5t1branch.mjs                 baseline (no change)
//
// T1 runs BOTH faces; the reverse rows are unaffected by `hairFill` and are the
// built-in negative control — if a reverse number moves, this wrapper is wrong.
const spec = process.argv[2] || '';
const c = await import('../../src/art/coins.js');
const ALL = ['penny', 'nickel', 'dime', 'quarter'];

const [verb, list] = spec.split(':');
const targets = list ? list.split(',') : ALL;
const before = Object.fromEntries(ALL.map((id) => [id, c.OBVERSE[id].hairLit === true]));
if (verb === 'flip') for (const id of targets) c.OBVERSE[id].hairLit = !before[id];
else if (verb === 'lit') for (const id of targets) c.OBVERSE[id].hairLit = true;
else if (verb === 'dark') for (const id of targets) c.OBVERSE[id].hairLit = false;
else if (verb) { console.error(`_jz5: unknown verb "${verb}" (flip | lit | dark)`); process.exit(2); }

console.log('=================================================================');
console.log('hairFill branch under test:', spec || '(baseline, as the repo ships)');
for (const id of ALL) {
  const now = c.OBVERSE[id].hairLit === true;
  console.log(`  ${id.padEnd(8)} ${before[id] ? 'LIT ' : 'DARK'} -> ${now ? 'LIT ' : 'DARK'}${now === before[id] ? '' : '   CHANGED'}`);
}
console.log('=================================================================\n');

// T1 guards its report with `process.argv[1].endsWith('_jt1transfer.mjs')` so
// that `_jt2floor.mjs` can import its pieces without re-running it. Point
// argv[1] at T1 so the guard passes and T1 runs its PUBLISHED code path,
// unmodified and unforked — a copy of T1 with the guard removed would be a
// second instrument that nobody had verified against the first.
//
// ⚠️ T1 renders our art through `coloringbook/ref/_scratch/<side>-<id>-<px>.png`,
// a path keyed only by side/id/size. TWO T1 RUNS MUST NEVER OVERLAP: the second
// would overwrite the first's render mid-measurement and both answers would be
// about a drawing neither of them chose. Run branches one at a time.
process.argv[1] = new URL('./_jt1transfer.mjs', import.meta.url).pathname;
await import('./_jt1transfer.mjs');
