// Phase 4a frontier earning: milestones only. Mastery crossings pay once
// ever (deterministic ids survive merges and box dips); rust polish is a
// capped trickle; fresh mastered facts pay nothing.
import { test, expect } from '@playwright/test';
import { newProfile, mergeProfiles } from '../src/data/schema.js';
import { recordAnswer } from '../src/engine/leitner.js';
import {
  earnFactMastery,
  earnSetMastery,
  earnPolish,
  earnFromAnswer,
  balanceCents,
  POLISH_CAP_CENTS_PER_DAY,
} from '../src/engine/money.js';
import { seedProfile, selectProfile, playQuestions, openTableGrid, norm, stat } from './helpers.mjs';

test('one-time payouts: deterministic ids pay once ever and merge without double-pay', () => {
  const p = newProfile('Earner');
  expect(earnFactMastery(p, 4, 3, 'mul').cents).toBe(5);
  expect(earnFactMastery(p, 3, 4, 'mul')).toBeNull(); // commuted key, same fact
  expect(earnSetMastery(p, 7, 'mul').cents).toBe(100);
  expect(earnSetMastery(p, 7, 'mul')).toBeNull();
  expect(earnSetMastery(p, 7, 'div').cents).toBe(100); // ÷7 is its own set

  // two devices witness the same mastery before syncing → single payment
  const dev = newProfile('Earner');
  dev.id = p.id;
  earnFactMastery(dev, 3, 4, 'mul');
  const m = mergeProfiles(p, dev);
  expect(m.pawBucks.txns.filter((t) => t.id === 'mastery-mul-3x4').length).toBe(1);
  expect(balanceCents(m)).toBe(205);
});

test('polish pennies cap at 5¢ per day', () => {
  const p = newProfile('Polisher');
  for (let i = 0; i < POLISH_CAP_CENTS_PER_DAY; i++) expect(earnPolish(p)).not.toBeNull();
  expect(earnPolish(p)).toBeNull();
  expect(balanceCents(p)).toBe(5);
});

test('earnFromAnswer: pays the mastery crossing + the table completion, never fresh mastered facts', () => {
  const p = newProfile('Crosser');
  // every ×7 fact mastered except 7×7, which is one fast answer away
  for (let b = 0; b <= 12; b++) p.facts[norm(7, b)] = stat(b === 7 ? 2 : 4);
  const res = recordAnswer(p, 7, 7, true, 1200);
  expect(res.mastered).toBe(true);
  const earned = earnFromAnswer(p, { a: 7, b: 7, division: false }, res);
  expect(earned.map((t) => t.reason).sort()).toEqual(['mastery', 'set']);
  expect(balanceCents(p)).toBe(105);
  // replaying a fresh mastered fact earns nothing
  const res2 = recordAnswer(p, 7, 7, true, 1200);
  expect(earnFromAnswer(p, { a: 7, b: 7, division: false }, res2)).toEqual([]);
});

test('rusty mastered fact answered correct pays a polish penny', () => {
  const p = newProfile('Rusty');
  const s = stat(4);
  s.lastSeen = Date.now() - 90 * 24 * 3600 * 1000; // long stale
  p.facts[norm(2, 9)] = s;
  const res = recordAnswer(p, 2, 9, true, 1500);
  expect(res.polished).toBe(true);
  const earned = earnFromAnswer(p, { a: 2, b: 9, division: false }, res);
  expect(earned.map((t) => t.reason)).toEqual(['polish']);
});

test('e2e: mastering facts in a round shows the coin ceremony and fills the wallet', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile('Miner');
  doc.id = 'earning-kid';
  // ×2 facts one fast answer from mastery: the round crosses several
  for (let b = 0; b <= 12; b++) doc.facts[norm(2, b)] = stat(2);
  await seedProfile(page, doc);
  await selectProfile(page, 'Miner');

  await openTableGrid(page);
  await page.tap('.table-grid .table-btn:nth-child(2)'); // ×2
  await playQuestions(page, 12);
  await page.waitForSelector('.coin-reveal');
  await expect(page.locator('.coin-reveal h3')).toContainText('You earned');
  await expect(page.locator('.coin-reveal .badge').first()).toContainText('new trick');
  expect(await page.locator('.coin-reveal .badge').count()).toBeLessThanOrEqual(4); // grouped, not one per coin

  await page.reload({ waitUntil: 'networkidle' });
  await page.tap('[data-nav="/pack"]');
  await page.tap('[data-wallet]');
  await expect(page.locator('.wallet-row', { hasText: 'Paw Nickel' })).toBeVisible();
});
