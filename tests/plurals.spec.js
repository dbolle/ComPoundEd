// Singular/plural and verb–noun agreement in everything a child sees or
// hears. Kids hit real mismatches ("1 walks", "10 Paw Pennys make…", "one pup
// were playing"), and every one of them came from a hand-rolled `+ 's'` or a
// fixed plural in a template. These are pure unit tests on purpose: the
// producing helpers are importable, so agreement can be pinned across
// n = 0, 1, 2, 5, 11, 21 and every species without driving a browser.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { plural, verb, article } from '../src/ui.js';
import { soundWord, CRITTER_SPECIES, numberWord } from '../src/sound.js';
import { wordFor, ITEM_WORDS } from '../src/screens/little.js';
import { kindWord, KIND_WORDS } from '../src/screens/dog.js';
import { ACCESSORIES, COLLAR_COLORS } from '../src/art/dogs.js';
import { DENOMS, SWAPS } from '../src/engine/money.js';

const COUNTS = [0, 1, 2, 5, 11, 21];

// --- the helper itself ------------------------------------------------------
// A bare `${one}s` default is a trap: the app's own vocabulary contains
// "fetch", "sandwich" and "Paw Penny".
test('plural() spells the regular English plurals, not just +s', () => {
  expect(plural(1, 'bone')).toBe('bone');
  expect(plural(3, 'bone')).toBe('bones');
  expect(plural(0, 'bone')).toBe('bones'); // zero takes the plural
  // sibilant endings take -es
  expect(plural(2, 'fetch')).toBe('fetches');
  expect(plural(2, 'sandwich')).toBe('sandwiches');
  expect(plural(2, 'box')).toBe('boxes');
  expect(plural(2, 'dish')).toBe('dishes');
  expect(plural(2, 'glass')).toBe('glasses');
  // consonant + y becomes -ies, vowel + y keeps the y
  expect(plural(2, 'Paw Penny')).toBe('Paw Pennies');
  expect(plural(2, 'berry')).toBe('berries');
  expect(plural(2, 'day')).toBe('days');
  expect(plural(2, 'toy')).toBe('toys');
  // an explicit plural always wins (genuine irregulars)
  expect(plural(2, 'leaf', 'leaves')).toBe('leaves');
  expect(plural(2, 'fish', 'fish')).toBe('fish');
  expect(plural(1, 'fetch', 'fetches')).toBe('fetch');
});

test('verb() and article() agree with the count / the following word', () => {
  expect(verb(1, 'unlocks', 'unlock')).toBe('unlocks');
  expect(verb(0, 'unlocks', 'unlock')).toBe('unlock');
  expect(verb(2, 'is', 'are')).toBe('are');
  expect(verb(1, 'was', 'were')).toBe('was');
  expect(article('bandana')).toBe('a');
  expect(article('apple')).toBe('an');
  expect(article('umbrella')).toBe('an');
});

// --- the counting-game vocabulary ------------------------------------------
test('every item word agrees at 1 and at n', () => {
  for (const [item, w] of Object.entries(ITEM_WORDS)) {
    const one = Array.isArray(w) ? w[0] : w;
    expect(wordFor(item, 1)).toBe(one);
    for (const n of COUNTS.filter((x) => x !== 1)) {
      const many = wordFor(item, n);
      expect(many, `wordFor(${item}, ${n})`).toBeTruthy();
      // the only bare-+s failures English allows here would end in a
      // sibilant or a consonant-y; none may survive
      expect(many, `wordFor(${item}, ${n})`).not.toMatch(/(?:ch|sh|s|x|z)s$/);
      expect(many, `wordFor(${item}, ${n})`).not.toMatch(/[^aeiou]ys$/);
    }
  }
});

// --- what the buddy is called ----------------------------------------------
// "How many barks?" is wrong when the buddy is a cat, and a guinea pig's
// species id ('guinea') must never reach a child.
test('soundWord agrees for every species and never leaks an id', () => {
  for (const s of CRITTER_SPECIES) {
    expect(soundWord(s, 1), s).not.toBe(soundWord(s, 2));
    expect(`${soundWord(s, 1)}s`).toBe(soundWord(s, 2));
    for (const n of COUNTS) expect(soundWord(s, n), `${s}/${n}`).toBeTruthy();
    expect(soundWord(s, 2)).not.toContain('guinea');
  }
  expect(soundWord('cat', 2)).toBe('meows');
  expect(soundWord('guinea', 1)).toBe('squeak');
  expect(soundWord('nonesuch', 2)).toBe('barks'); // safe fallback
  // Every voice a buddy can actually have needs its OWN word. A cat that
  // "barks" is precisely the mismatch this file exists to stop, and the dog
  // fallback is silent about it — so a new species added to VOICES without a
  // sound word must fail here rather than in a child's ear.
  for (const s of CRITTER_SPECIES.filter((x) => x !== 'dog')) {
    expect(soundWord(s, 2), `${s} has no sound word of its own`).not.toBe(soundWord('dog', 2));
  }
});

// --- the spoken money lines -------------------------------------------------
// Every swap is SPOKEN, and half of them start "1 Paw Buck…", so both the
// noun and the verb have to follow the count.
test('wallet swap lines agree in number and verb', () => {
  const label = (d) => DENOMS.find((x) => x.id === d)?.label ?? d;
  const lines = SWAPS.map(
    (r) =>
      `${r.give.n} ${plural(r.give.n, label(r.give.denom))} ${verb(r.give.n, 'makes', 'make')} ` +
      `${r.get.n} ${plural(r.get.n, label(r.get.denom))}!`
  );
  expect(lines).toContain('10 Paw Pennies make 1 Paw Dime!');
  expect(lines).toContain('1 Paw Buck makes 4 Paw Quarters!');
  expect(lines).toContain('1 Paw Nickel makes 5 Paw Pennies!');
  for (const line of lines) {
    expect(line, line).not.toMatch(/Pennys/);
    expect(line, line).not.toMatch(/^1 [A-Za-z ]+s make/); // "1 Paw Bucks make"
    expect(line, line).not.toMatch(/\b([2-9]|\d\d) [A-Za-z ]+[^s] makes\b/);
  }
});

// --- the activity counters --------------------------------------------------
test('accessory counters agree at 1 (the moment the child is one play away)', () => {
  for (const kind of Object.keys(KIND_WORDS)) {
    expect(kindWord(kind, 1)).toBe(KIND_WORDS[kind][0]);
    expect(kindWord(kind, 2)).toBe(KIND_WORDS[kind][1]);
  }
  expect(kindWord('fetch', 1)).toBe('fetch');
  expect(kindWord('fetch', 2)).toBe('fetches');
  // every accessory has a counter word — 'total' used to be missing from one
  // of the two copies of this map
  for (const acc of ACCESSORIES) expect(kindWord(acc.kind, 2), acc.id).toBeTruthy();
});

test('unlock lines: the verb follows the COUNT, not the reward', () => {
  const spoken = [];
  for (const acc of ACCESSORIES.filter((a) => a.colors)) {
    for (const c of acc.colors) {
      spoken.push(
        `${c.need} ${kindWord(acc.kind, c.need)} ${verb(c.need, 'unlocks', 'unlock')} the ${c.id} ${acc.name}!`
      );
    }
  }
  for (const c of COLLAR_COLORS) {
    spoken.push(
      `${c.need} play ${plural(c.need, 'date')} with a friend who's still learning ` +
        `${verb(c.need, 'unlocks', 'unlock')} the ${c.id} collar!`
    );
  }
  expect(spoken).toContain('10 walks unlock the red bandana!');
  expect(spoken).toContain('10 fetches unlock the blue cap!');
  for (const line of spoken) expect(line, line).not.toMatch(/s unlocks the/);
  // and the singular still reads right if a threshold ever drops to 1
  expect(`1 ${kindWord('walk', 1)} ${verb(1, 'unlocks', 'unlock')} the red bandana!`).toBe(
    '1 walk unlocks the red bandana!'
  );
});

// --- spoken counts built from number words ---------------------------------
test('numberWord feeds counts that still agree with their noun', () => {
  for (const n of COUNTS) {
    const said = `${numberWord(n)} ${plural(n, 'pup')} ${verb(n, 'was', 'were')} playing`;
    expect(said, said).not.toMatch(/^one pups|one pup were/);
    expect(said, said).not.toMatch(/\b(zero|two|five|eleven|twenty-one) pup was\b/);
  }
  expect(`${numberWord(1)} ${plural(1, 'pup')} ${verb(1, 'was', 'were')} playing`).toBe(
    'one pup was playing'
  );
});

// --- source guard -----------------------------------------------------------
// The bugs kids hit were never in the helper; they were in templates that
// re-implemented it badly. Screens must use the helpers.
test('kid screens never hand-roll number agreement', () => {
  const files = [
    'activity.js', 'awards.js', 'corner.js', 'dog.js', 'group.js', 'heatmap.js',
    'home.js', 'little.js', 'meet.js', 'pack.js', 'profiles.js', 'quiz.js',
    'results.js', 'store.js', 'wallet.js', 'wardrobe.js',
  ];
  for (const f of files) {
    const src = readFileSync(`src/screens/${f}`, 'utf8');
    // `${n > 1 ? 's' : ''}` and friends — the exact shape of every bug found
    expect(src, f).not.toMatch(/\?\s*'s'\s*:\s*''/);
    expect(src, f).not.toMatch(/\?\s*''\s*:\s*'s'/);
  }
});
