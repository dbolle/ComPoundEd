// The bridge's addition track: 66 facts in 7 strategy waves, sequential
// unlocks, wave-matched hints, and frontier earning with wave Paw Bucks.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { WAVES, waveFacts, waveIndexOf, waveUnlocked, buildAdditionRound } from '../src/engine/waves.js';
import { recordAdditionAnswer, normAddKey } from '../src/engine/leitner.js';
import { additionHint } from '../src/engine/hints.js';
import { earnFromAnswer, balanceCents } from '../src/engine/money.js';
import { seedProfile, selectProfile, playQuestions } from './helpers.mjs';

const addStat = (box) => ({ attempts: 8, correct: 7, avgMs: 2500, box, lastSeen: Date.now() });

test('waves partition all 66 facts; rounds draw from the wave', () => {
  const seen = new Set();
  let total = 0;
  WAVES.forEach((w, i) => {
    for (const [a, b] of waveFacts(i)) {
      const k = normAddKey(a, b);
      expect(seen.has(k)).toBe(false);
      seen.add(k);
      expect(waveIndexOf(a, b)).toBe(i);
    }
    total += waveFacts(i).length;
  });
  expect(total).toBe(66);

  const p = newProfile('Adder');
  const round = buildAdditionRound(p, 1); // doubles
  expect(round.length).toBeGreaterThan(0);
  for (const q of round) {
    expect(q.kind).toBe('add');
    expect(q.answer).toBe(q.a + q.b);
    expect(waveIndexOf(q.a, q.b)).toBe(1);
  }
});

test('waves unlock sequentially as the previous masters', () => {
  const p = newProfile('Waver');
  expect(waveUnlocked(p, 0)).toBe(true);
  expect(waveUnlocked(p, 1)).toBe(false);
  for (const [a, b] of waveFacts(0)) p.addition[normAddKey(a, b)] = addStat(3);
  expect(waveUnlocked(p, 1)).toBe(true);
  expect(waveUnlocked(p, 2)).toBe(false);
});

test('hints match the strategy wave', () => {
  expect(additionHint(2, 9)).toContain('count up 2');
  expect(additionHint(7, 7)).toContain('Double 7');
  expect(additionHint(3, 7)).toContain('make 10');
  expect(additionHint(6, 7)).toContain('Double 6');
  expect(additionHint(4, 10)).toContain('14');
  expect(additionHint(9, 5)).toContain('Make ten first');
});

test('addition mastery pays a nickel; completing a wave pays the Paw Buck once', () => {
  const p = newProfile('AddEarner');
  // make-ten wave (idx 2) has two facts; put both one fast answer away
  const facts = waveFacts(2);
  for (const [a, b] of facts) p.addition[normAddKey(a, b)] = addStat(2);
  let coins = [];
  for (const [a, b] of facts) {
    const r = recordAdditionAnswer(p, a, b, true, 1200);
    coins.push(...earnFromAnswer(p, { a, b, add: true }, r));
  }
  expect(coins.map((t) => t.reason).sort()).toEqual(['mastery', 'mastery', 'set']);
  expect(balanceCents(p)).toBe(110);
});

test('e2e: bridge kid sees Adding waves, plays a Step Ups round with + questions', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile('Bridger');
  doc.id = 'bridge-kid';
  doc.subjects = { ...doc.subjects, bridge: true };
  await seedProfile(page, doc);
  await selectProfile(page, 'Bridger');

  await page.waitForSelector('.add-grid .wave-btn');
  expect(await page.$$eval('.add-grid .wave-btn:not(.locked)', (els) => els.length)).toBe(1);
  await page.tap('.add-grid .wave-btn:not(.locked)');
  await page.waitForSelector('.question');
  await expect(page.locator('.question')).toContainText('+');
  await expect(page.locator('.topbar strong')).toContainText('Step Ups');
});

test('e2e: tables-off profile keeps a working home with only the bridge', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile('OnlyAdd');
  doc.id = 'onlyadd-kid';
  doc.subjects = { ...doc.subjects, bridge: true, tables: false };
  await seedProfile(page, doc);
  await selectProfile(page, 'OnlyAdd');

  await page.waitForSelector('.add-grid .wave-btn');
  await expect(page.locator('[data-mixed]')).toHaveCount(0);
  await expect(page.locator('.table-grid:not(.add-grid)')).toHaveCount(0);
});
