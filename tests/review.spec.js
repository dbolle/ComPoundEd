// Time-based review: mastered facts go "due" after their freshness window
// and quietly resurface in rounds. Nothing regresses — no level, star, or
// dog is ever taken away.
import { test, expect } from '@playwright/test';
import { isDue, dueCount, tableProgress, isTableMastered } from '../src/engine/leitner.js';
import { buildRound } from '../src/engine/selector.js';
import { newProfile } from '../src/data/schema.js';
import { seedProfile, selectProfile, norm, stat } from './helpers.mjs';

const DAY = 86400e3;

test('freshness windows grow with the box', () => {
  expect(isDue(stat(5, { ageMs: 1 * DAY }))).toBe(false); // box 5 fresh for 3 weeks
  expect(isDue(stat(5, { ageMs: 22 * DAY }))).toBe(true);
  expect(isDue(stat(4, { ageMs: 8 * DAY }))).toBe(true); // box 4: 1 week
  expect(isDue(stat(1, { ageMs: 2 * DAY }))).toBe(true); // box 1: 1 day
  expect(isDue({ attempts: 0, box: 0, lastSeen: 0 })).toBe(true); // unseen
});

test('due mastered facts jump the queue in table rounds', () => {
  const p = newProfile('Due');
  for (let b = 0; b <= 12; b++) p.facts[norm(4, b)] = stat(5, { ageMs: 1 * DAY });
  p.facts[norm(4, 6)] = stat(5, { ageMs: 30 * DAY });
  p.facts[norm(4, 7)] = stat(4, { ageMs: 30 * DAY });

  const round = buildRound(p, { type: 'table', table: 4 });
  const keys = round.map((q) => norm(q.a, q.b));
  expect(keys).toContain('4x6');
  expect(keys).toContain('4x7');
});

test('nothing regresses: due facts still count as mastered', () => {
  const p = newProfile('Keep');
  for (let b = 0; b <= 12; b++) p.facts[norm(4, b)] = stat(5, { ageMs: 60 * DAY });
  expect(isTableMastered(p, 4)).toBe(true); // star stays
  expect(tableProgress(p, 4).done).toBe(13); // meter stays full
  expect(dueCount(p)).toBe(13); // but the parent count is honest
});

test('heatmap fades due facts and grown-ups counts them', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const facts = {};
  for (let b = 0; b <= 12; b++) facts[norm(2, b)] = stat(5, { ageMs: 1 * DAY });
  facts[norm(2, 9)] = stat(5, { ageMs: 30 * DAY }); // overdue
  await seedProfile(page, {
    id: 'rusty-kid',
    schemaVersion: 4,
    name: 'RustyKid',
    avatarDogId: 'starter',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    facts,
    unlocks: [
      { dogId: 'starter', table: null, at: Date.now() },
      { dogId: 'dog-2', table: 2, at: Date.now() },
    ],
    play: {},
    speed: { avgMs: 0, samples: 0 },
  });
  await selectProfile(page, 'RustyKid');

  // Star still shown for the ×2 table even though a fact is overdue
  await expect(page.locator('.table-grid .table-btn:nth-child(2)')).toContainText('⭐');

  await page.tap('[data-nav="/heatmap"]');
  await page.waitForSelector('.hm-cell');
  const dueCells = page.locator('.hm-cell.hm-due');
  // 2×9 appears at both (2,9) and (9,2) in the grid
  await expect(dueCells).toHaveCount(2);
  await dueCells.first().tap();
  await expect(page.locator('.hm-caption')).toContainText('time for a refresh');

  await page.tap('[data-back]');
  await page.tap('[data-nav="/grownups"]');
  await page.waitForSelector('[data-hold]');
  const box = await (await page.$('[data-hold]')).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(2300);
  await page.mouse.up();
  const row = page.locator('.stat-row', { hasText: 'refresh' });
  await expect(row).toContainText('1');
});
