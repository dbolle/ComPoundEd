// REAL US currency art (src/art/coins.js) — what Money Math teaches.
// The app's own fictional currency lives in src/art/pawcoins.js with its own
// spec; a paw print and a printed value are correct THERE and wrong here.
//
// The standard these defend is not "our four discs can be told apart". It is
// that a child who learns a nickel here can identify a REAL nickel. Our art
// could be perfectly self-consistent and still fail that, so the tests below
// pin the things that transfer and forbid the ones that do not.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { DENOMS } from '../src/engine/money.js';
import { coinSVG, coinPx, coinLabel, COIN_IDS, COIN_MM, COIN_SCALE, COIN_SIDES, FACE_VALUE } from '../src/art/coins.js';

const SRC = readFileSync('src/art/coins.js', 'utf8');
const COINS = ['penny', 'nickel', 'dime', 'quarter']; // discs; the buck is a note

const luminance = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const fieldOf = (denom) => SRC.match(new RegExp(`${denom}: \\{[^}]*field: '(#[0-9a-f]{6})'`))[1];

test('every denomination has art on both sides', () => {
  expect(COIN_SIDES).toEqual(['obverse', 'reverse']);
  expect(COIN_IDS.slice().sort()).toEqual(DENOMS.map((d) => d.id).sort());
  for (const id of COIN_IDS) {
    for (const side of COIN_SIDES) {
      const svg = coinSVG(id, 120, { side });
      expect(svg, `${id} ${side}`).toMatch(/^<svg/);
      expect(svg).not.toMatch(/undefined|NaN/);
    }
  }
  // an unknown side must fall back, never draw nothing
  expect(coinSVG('dime', 120, { side: 'edge' })).toMatch(/^<svg/);
});

test('the three silver coins are the SAME silver — the ladder was a false fact', () => {
  // A real dime, nickel and quarter are one cupronickel alloy. Any brightness
  // difference here is a distinction the app invented, and a child who learns
  // "the bright one is a dime" fails on real change. Owner decision
  // 2026-08-10: accuracy wins, even though this costs a low-vision channel.
  // An earlier pass CLAIMED to have removed the ladder and left 3.88% behind,
  // which is why this measures rather than greps.
  const lums = ['quarter', 'nickel', 'dime'].map(fieldOf).map(luminance);
  const spread = (Math.max(...lums) - Math.min(...lums)) / Math.max(...lums);
  expect(spread, `silver luminance spread ${(spread * 100).toFixed(2)}%`).toBeLessThan(0.005);
  // the penny must still be plainly different — copper is real
  expect(luminance(fieldOf('penny'))).toBeLessThan(Math.min(...lums) * 0.95);
});

test("wave 1's own size gets the FULL drawing, not the silhouette", () => {
  // The recognition question renders one coin at 84px (money.js). The detail
  // tier once began at 96, so the ONE screen that asks a child to name a coin
  // was showing the stripped version — eye, ear, hairline and lettering all
  // deleted. Pinned here because it is invisible from the outside: the art
  // still "worked", it was just answering with less than it had.
  const ask = readFileSync('src/screens/money.js', 'utf8');
  const m = ask.match(/coinRow\(q\.coins,\s*(\d+)\)/);
  expect(m, 'wave 1 no longer draws a coin at a fixed size — retune this test').toBeTruthy();
  const askSize = Number(m[1]);

  const full = coinSVG('dime', askSize).length;
  const mid = coinSVG('dime', 50).length;
  expect(full, `at ${askSize}px the drawing must be richer than the mid tier`).toBeGreaterThan(mid * 1.3);
});

test('real coin names, never the fictional ones', () => {
  // Paw Buck / Paw Dime belong to the wallet's invented currency. A child on
  // a screen reader is the ONLY one who hears this label, so it is the one
  // place the wrong word is never noticed.
  expect(coinLabel('dime')).toBe('dime, 10 cents');
  expect(coinLabel('penny')).toBe('penny, 1 cent'); // singular
  expect(coinLabel('buck')).toBe('dollar, 100 cents');
  for (const id of COIN_IDS) expect(coinLabel(id)).not.toMatch(/paw/i);
});

test('no printed value by default; available as a scaffold', () => {
  // No US coin prints its value on the obverse, and a numeral would answer
  // "which coin is this?" for the child.
  for (const id of COIN_IDS) {
    expect(coinSVG(id, 120), `${id} default`).not.toMatch(/data-face/);
    expect(coinSVG(id, 120, { value: true }), `${id} scaffold`).toMatch(/data-face/);
  }
});

test('true mint diameters: dime < penny < nickel < quarter', () => {
  expect(COIN_MM.dime).toBeLessThan(COIN_MM.penny);
  expect(COIN_MM.penny).toBeLessThan(COIN_MM.nickel);
  expect(COIN_MM.nickel).toBeLessThan(COIN_MM.quarter);
  const px = (id) => coinPx(id, 100).w;
  expect(px('dime')).toBeLessThan(px('penny'));
  expect(px('penny')).toBeLessThan(px('nickel'));
  expect(px('nickel')).toBeLessThan(px('quarter'));
  for (const id of COINS) expect(COIN_SCALE[id]).toBeCloseTo(COIN_MM[id] / COIN_MM.quarter, 3);
});

test('accessibility: labelled by default, overridable, opt-out for decoration', () => {
  const svg = coinSVG('quarter', 40);
  expect(svg).toMatch(/role="img"/);
  expect(svg).toMatch(/aria-label="quarter, 25 cents"/);
  expect(coinSVG('quarter', 40, { label: 'Take a quarter back' })).toMatch(/aria-label="Take a quarter back"/);
  const dec = coinSVG('quarter', 40, { decorative: true });
  expect(dec).toMatch(/aria-hidden="true"/);
  expect(dec).not.toMatch(/role="img"/);
});

test('safe to inline a hundred times: no ids, no defs, no tooltips', () => {
  // A tooltip does not exist on a tablet, and a shared id would collide the
  // moment two coins sit in one row.
  for (const id of COIN_IDS) {
    for (const side of COIN_SIDES) {
      const svg = coinSVG(id, 40, { side });
      expect(svg, `${id} ${side}`).not.toMatch(/<title|title=/);
      expect(svg).not.toMatch(/<defs|url\(#/);
    }
  }
});

test('existing callers keep working — money.js passes two arguments', () => {
  const money = readFileSync('src/screens/money.js', 'utf8');
  expect(money).toMatch(/coinSVG\(/);
  // the two-argument form must still produce the obverse, unchanged
  expect(coinSVG('dime', 54)).toBe(coinSVG('dime', 54, { side: 'obverse' }));
});
