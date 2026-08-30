// THE BYTE-IDENTITY PARTITION FOR A `hairFill` CANDIDATE, BEFORE IT IS WRITTEN.
//
// `_jp9partition.mjs` partitions two CHECKOUTS and is the gate that proves a
// shipped change was contained. This is its in-memory twin, for the step
// before: `hairFill` lives in the shared `bust()`, so the question "if I flip
// this flag, what else moves?" has to be answerable without editing the art.
// `OBVERSE` is exported and `coinSVG` reads `o.hairLit` at emit time, so a
// candidate costs a process rather than an edit.
//
// Every id x side x size is hashed on both sides of the flag change. Sizes are
// the four the app draws, plus DRAW_SIZE, plus 24 — below the tier cut v1.78.0
// deleted, so a size-dependent branch reintroduced by accident shows up here
// and nowhere else.
//
// This is a claim about the SVG TEXT, not about quality. It cannot say a change
// was good, only that it was contained.
//
// Run: node coloringbook/judge/_jz6part.mjs
import { createHash } from 'node:crypto';
import { coinSVG, OBVERSE, COIN_IDS, COIN_SIDES } from '../../src/art/coins.js';

const SIZES = [24, 38, 48, 54, 84, 380];
const IDS = [...COIN_IDS, 'buck'].filter((v, i, a) => a.indexOf(v) === i);
const FLIPPABLE = ['penny', 'nickel', 'dime', 'quarter'];

const sheet = () => {
  const h = {};
  for (const id of IDS) for (const side of COIN_SIDES) {
    const parts = SIZES.map((s) => coinSVG(id, s, { side }));
    h[`${id}/${side}`] = createHash('sha256').update(parts.join('\u0000')).digest('hex').slice(0, 12);
  }
  return h;
};

const base = sheet();
const shipped = Object.fromEntries(FLIPPABLE.map((id) => [id, OBVERSE[id].hairLit === true]));

console.log('BYTE-IDENTITY PARTITION — what a `hairFill` flag change moves.');
console.log(`hashed over sizes ${SIZES.join(', ')} px, both sides, all five subjects`);
console.log('shipped flags: ' + FLIPPABLE.map((id) => `${id}=${shipped[id] ? 'LIT' : 'DARK'}`).join('  '));
console.log('');

const cases = [...FLIPPABLE.map((id) => ({ name: `flip ${id}`, ids: [id] })), { name: 'flip all four', ids: FLIPPABLE }];
for (const c of cases) {
  for (const id of c.ids) OBVERSE[id].hairLit = !shipped[id];
  const now = sheet();
  for (const id of c.ids) OBVERSE[id].hairLit = shipped[id];
  const moved = Object.keys(base).filter((k) => base[k] !== now[k]);
  const same = Object.keys(base).filter((k) => base[k] === now[k]);
  console.log(`${c.name.padEnd(16)} moved ${String(moved.length).padStart(2)}/${Object.keys(base).length}: ${moved.join(' ') || '(none)'}`);
  console.log(`${''.padEnd(16)} byte-identical: ${same.join(' ')}`);
}

// The restore has to be proved, not assumed: this file mutates a live module
// and anything importing it afterwards would inherit the mutation.
const after = sheet();
const drift = Object.keys(base).filter((k) => base[k] !== after[k]);
console.log('');
console.log(drift.length
  ? `!! RESTORE FAILED — ${drift.join(' ')} did not come back. Every number above is suspect.`
  : 'restore verified: all ' + Object.keys(base).length + ' faces are byte-identical to the baseline sheet.');
