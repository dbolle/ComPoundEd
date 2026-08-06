// v1.50.0 numberWord(0–120) — spoken number words for the counting game.
// Pure string logic, so it is exercised in Node against the REAL shipped
// module (sound.js guards its window access, so it imports cleanly here).
// Every one of the 121 values is checked, not a handful of spot samples:
// a single hole ("fourty", a missing decade) is a word a child hears wrong.
import { test, expect } from '@playwright/test';
import { numberWord } from '../src/sound.js';

const ALL = Array.from({ length: 121 }, (_, n) => n);

test('every value 0 to 120 is a speakable word with no digit in it', () => {
  for (const n of ALL) {
    const w = numberWord(n);
    expect(typeof w, `${n} returns a string`).toBe('string');
    expect(w, `${n} is not empty`).not.toBe('');
    // a digit here means the numeral leaked through and the voice, not the
    // app, decides how the number sounds
    expect(w, `${n} contains no digit`).not.toMatch(/[0-9]/);
    // lowercase words joined by single spaces or hyphens — nothing a voice
    // could read as punctuation, nothing that looks wrong in an aria-label
    expect(w, `${n} is plain lowercase words`).toMatch(/^[a-z]+(?:[- ][a-z]+)*$/);
  }
});

test('all 121 words are distinct', () => {
  const words = ALL.map(numberWord);
  expect(new Set(words).size).toBe(121);
});

test('the irregular teens are the irregular words, not derivations', () => {
  expect(numberWord(11)).toBe('eleven'); // not "onety-one"
  expect(numberWord(12)).toBe('twelve');
  expect(numberWord(13)).toBe('thirteen'); // not "threeteen"
  expect(numberWord(15)).toBe('fifteen'); // not "fiveteen"
  // the regular teens around them, as the control
  expect(numberWord(14)).toBe('fourteen');
  expect(numberWord(16)).toBe('sixteen');
  expect(numberWord(17)).toBe('seventeen');
  expect(numberWord(18)).toBe('eighteen');
  expect(numberWord(19)).toBe('nineteen');
});

test('forty has no u, and no value anywhere is misspelled that way', () => {
  expect(numberWord(40)).toBe('forty');
  expect(numberWord(47)).toBe('forty-seven');
  for (const n of ALL) {
    expect(numberWord(n), `${n} is spelled correctly`).not.toMatch(/fourty|fivety|twoty|threety/);
  }
});

test('every decade word is present and spelled out', () => {
  expect(numberWord(0)).toBe('zero');
  expect(numberWord(10)).toBe('ten');
  expect(numberWord(20)).toBe('twenty');
  expect(numberWord(30)).toBe('thirty');
  expect(numberWord(40)).toBe('forty');
  expect(numberWord(50)).toBe('fifty');
  expect(numberWord(60)).toBe('sixty');
  expect(numberWord(70)).toBe('seventy');
  expect(numberWord(80)).toBe('eighty');
  expect(numberWord(90)).toBe('ninety');
  expect(numberWord(100)).toBe('one hundred');
});

test('the twenties and up compose with a hyphen', () => {
  expect(numberWord(21)).toBe('twenty-one');
  expect(numberWord(29)).toBe('twenty-nine');
  expect(numberWord(30)).toBe('thirty'); // a bare decade gains no hyphen
  expect(numberWord(58)).toBe('fifty-eight');
  expect(numberWord(99)).toBe('ninety-nine');
});

test('the decade crossings the game targets say the new decade', () => {
  // 29→30 and 99→100 are vocabulary jumps, not increments — the whole
  // reason this helper exists instead of a 0–10 lookup
  expect(numberWord(29)).toBe('twenty-nine');
  expect(numberWord(30)).toBe('thirty');
  expect(numberWord(99)).toBe('ninety-nine');
  expect(numberWord(100)).toBe('one hundred');
  expect(numberWord(109)).toBe('one hundred nine');
  expect(numberWord(110)).toBe('one hundred ten');
});

test('past one hundred is US counting: no "and", and the top of the range is one hundred twenty', () => {
  expect(numberWord(101)).toBe('one hundred one');
  expect(numberWord(115)).toBe('one hundred fifteen');
  expect(numberWord(120)).toBe('one hundred twenty');
  for (const n of ALL) {
    expect(numberWord(n), `${n} says no "and"`).not.toMatch(/\band\b/);
    expect(numberWord(n), `${n} says "one hundred", not "a hundred"`).not.toMatch(/\ba hundred\b/);
  }
});

test('out of range and fractional input falls back to the numeral, which a voice still reads', () => {
  expect(numberWord(121)).toBe('121');
  expect(numberWord(200)).toBe('200');
  expect(numberWord(-1)).toBe('-1'); // a voice reads this "minus one"
  expect(numberWord(7.5)).toBe('7.5');
  expect(numberWord(120.5)).toBe('120.5');
});

test('anything that is not a finite number is silence, never spoken nonsense', () => {
  // say('') is a no-op; String() here would have a voice tell a child
  // "undefined" or "[object Object]"
  for (const bad of [undefined, null, NaN, Infinity, -Infinity, '7', '', ' ', [], [5], {}, true, false]) {
    expect(numberWord(bad), `${String(bad)} is silent`).toBe('');
  }
  // '7' is rejected on purpose: the coercion that would accept it also
  // turns null, '' and [] into 0, and a confidently spoken WRONG number is
  // worse in a counting game than saying nothing
  expect(numberWord('7')).toBe('');
  expect(numberWord(null)).not.toBe('zero');
});

test('no input throws — a bad prompt must never break play', () => {
  for (const bad of [undefined, null, NaN, {}, [], 'x', 1e21, -0]) {
    expect(() => numberWord(bad)).not.toThrow();
  }
  expect(numberWord(-0)).toBe('zero'); // negative zero is still none
});
