// Taking Away: family-keyed subtraction on the addition waves, unlocked by
// addition mastery, presented missing-addend first, earning like every track.
import { test, expect } from '@playwright/test';
import { newProfile, migrateProfile, mergeProfiles, SCHEMA_VERSION } from '../src/data/schema.js';
import { WAVES, waveFacts, subWaveUnlocked, buildSubtractionRound, isSubWaveMastered } from '../src/engine/waves.js';
import { recordSubtractionAnswer, normAddKey, getSubStat } from '../src/engine/leitner.js';
import { subtractionHint } from '../src/engine/hints.js';
import { earnFromAnswer, balanceCents } from '../src/engine/money.js';
import { seedProfile, selectProfile, playQuestions } from './helpers.mjs';

const stat = (box) => ({ attempts: 8, correct: 7, avgMs: 2500, box, lastSeen: Date.now() });
const masterAdditionWave = (p, w) => {
  for (const [a, b] of waveFacts(w)) p.addition[normAddKey(a, b)] = stat(3);
};

test('migration v12→v13 adds subtraction; merge richer-wins', () => {
  const old = { ...newProfile('Old'), schemaVersion: 12 };
  delete old.subtraction;
  const doc = migrateProfile(old);
  expect(doc.schemaVersion).toBe(SCHEMA_VERSION);
  expect(doc.subtraction).toEqual({});

  const a = newProfile('M');
  const b = { ...newProfile('M'), id: a.id };
  // richer = more attempts (equal attempts tie-break on lastSeen, which
  // is nondeterministic in a test) — make the richer side unambiguous
  a.subtraction['4+8'] = { ...stat(3), attempts: 9 };
  b.subtraction['4+8'] = { ...stat(1), attempts: 2 };
  b.subtraction['2+5'] = stat(2);
  const m = mergeProfiles(a, b);
  expect(m.subtraction['4+8'].box).toBe(3);
  expect(m.subtraction['2+5'].box).toBe(2);
});

test('sub waves unlock from ADDITION mastery; both forms feed one family', () => {
  const p = newProfile('Sub');
  expect(subWaveUnlocked(p, 0)).toBe(false); // nothing until adding w1 masters
  masterAdditionWave(p, 0);
  expect(subWaveUnlocked(p, 0)).toBe(true);
  expect(subWaveUnlocked(p, 1)).toBe(false);

  recordSubtractionAnswer(p, 4, 8, true, 1200);
  recordSubtractionAnswer(p, 8, 4, true, 1200); // commuted family, same entry
  expect(getSubStat(p, 4, 8).attempts).toBe(2);
});

test('rounds bridge: missing-addend early, − form once the family warms up', () => {
  const p = newProfile('Bridge');
  masterAdditionWave(p, 0);
  let round = buildSubtractionRound(p, 0);
  for (const q of round) {
    expect(q.kind).toBe('sub');
    expect(q.text).toContain('+ _ ='); // all families cold → all bridging
    expect(q.answer).toBe(q.a + q.b - q.given);
    expect(q.correction).toContain('=');
  }
  for (const [a, b] of waveFacts(0)) p.subtraction[normAddKey(a, b)] = stat(2);
  round = buildSubtractionRound(p, 0);
  for (const q of round) expect(q.text).toContain('−');
});

test('hints think addition, or count up when close', () => {
  expect(subtractionHint({ a: 4, b: 8, given: 8, answer: 4 })).toContain('8 + 4 = 12');
  expect(subtractionHint({ a: 1, b: 9, given: 9, answer: 1 })).toContain('Count up from 9');
});

test('economy: family nickel + wave Paw Buck once, separate from addition ids', () => {
  const p = newProfile('SubEarn');
  masterAdditionWave(p, 2); // make-ten (2 facts)
  const coins = [];
  for (const [a, b] of waveFacts(2)) {
    p.subtraction[normAddKey(a, b)] = stat(2);
    const r = recordSubtractionAnswer(p, a, b, true, 1200);
    coins.push(...earnFromAnswer(p, { a, b, sub: true }, r));
  }
  expect(coins.map((t) => t.reason).sort()).toEqual(['mastery', 'mastery', 'set']);
  expect(coins.some((t) => t.id === 'set-sub-w3')).toBe(true);
  expect(isSubWaveMastered(p, 2)).toBe(true);
  expect(balanceCents(p)).toBe(110);
});

test('e2e: Taking Away appears after an adding wave masters; a round plays', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile('Taker');
  doc.id = 'sub-kid';
  doc.subjects = { ...doc.subjects, bridge: true };
  masterAdditionWave(doc, 0);
  // met once already: brand-new families echo (show the answer) before
  // the missing-addend bridge form this test asserts
  for (const [a, b] of waveFacts(0)) {
    doc.subtraction[normAddKey(a, b)] = { attempts: 1, correct: 0, avgMs: 3000, box: 0, lastSeen: Date.now() };
  }
  await seedProfile(page, doc);
  await selectProfile(page, 'Taker');

  await page.waitForSelector('.sub-grid .wave-btn');
  expect(await page.$$eval('.sub-grid .wave-btn:not(.locked)', (els) => els.length)).toBe(1);
  await page.tap('.sub-grid .wave-btn:not(.locked)');
  await page.waitForSelector('.question');
  await expect(page.locator('.question')).toContainText('+ _ ='); // bridging form
  await expect(page.locator('.topbar strong')).toContainText('Step Ups');
  await playQuestions(page, 12);
  await page.waitForSelector('.big-score');
});
