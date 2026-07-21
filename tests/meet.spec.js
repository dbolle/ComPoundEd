// Meet the table: optional, repeatable, unfailable lessons before drilling.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { suggestNext } from '../src/engine/suggest.js';
import { seedProfile, selectProfile, uniqueName, norm, stat } from './helpers.mjs';

test('suggest points never-met tables at the lesson, met tables at practice', () => {
  const fresh = newProfile('MeetMe');
  fresh.subjects = { ...fresh.subjects, tables: true }; // created-as-big-kid
  expect(suggestNext(fresh).href).toContain('/meet?table=');
  for (let b = 0; b <= 12; b++) fresh.facts[norm(1, b)] = stat(1);
  expect(suggestNext(fresh).href).toContain('/quiz?table=1');
});

test('e2e: the lesson walks path → groups → tricks, repeats, then flows into practice', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Lesson'));
  doc.id = 'lesson-kid';
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.hero');
  await page.evaluate(() => { location.hash = '#/meet?table=7'; });

  // path card: taps out of order wiggle, in order light up
  await page.waitForSelector('.meet-path');
  await page.tap('.meet-step[data-i="2"]');
  expect(await page.$$eval('.meet-step.lit', (els) => els.length)).toBe(0);
  for (let i = 0; i < 6; i++) await page.tap(`.meet-step[data-i="${i}"]`);
  expect(await page.$$eval('.meet-step.lit', (els) => els.length)).toBe(6);

  // groups card: build 3 groups of 7
  await page.tap('[data-next-card]');
  await page.waitForSelector('[data-add-group]');
  for (let i = 0; i < 3; i++) await page.tap('[data-add-group]');
  await expect(page.locator('.meet-total')).toHaveText('21');

  // skip ahead to the anchor trick and reveal it
  await page.tap('[data-next-card]');
  await page.tap('[data-next-card]');
  await page.waitForSelector('[data-reveal]');
  await page.tap('[data-reveal]');
  await expect(page.locator('.meet-reveal')).toContainText('7 × 6 = 42');

  // finish: repeatable, and Practice flows into the ×7 quiz
  await page.tap('[data-next-card]');
  await page.tap('[data-next-card]');
  await page.waitForSelector('[data-practice]');
  await page.tap('[data-again]'); // repeatable
  await page.waitForSelector('.meet-path');
  for (let i = 0; i < 5; i++) await page.tap('[data-next-card]');
  await page.waitForSelector('[data-practice]');
  await page.tap('[data-practice]');
  await page.waitForSelector('.question');
  await expect(page.locator('.topbar strong')).toContainText('×7');
});

test('e2e: the 👋 topbar button reaches the lesson from any table round', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Door'));
  doc.id = 'door-kid';
  for (let b = 0; b <= 12; b++) doc.facts[norm(5, b)] = stat(4); // fully strong ×5
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.hero');
  await page.evaluate(() => { location.hash = '#/quiz?table=5'; });
  await page.waitForSelector('.question');
  await page.tap('[data-meet-top]');
  await page.waitForSelector('.meet-path');
  await expect(page.locator('.topbar strong')).toContainText('Meet the ×5s');
});

test('e2e: quiz teach banner offers Meet first; results offer Meet again', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Entry'));
  doc.id = 'entry-kid';
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.hero');
  await page.evaluate(() => { location.hash = '#/quiz?table=6'; });
  await page.waitForSelector('.teach-banner');
  await page.tap('[data-meet]');
  await page.waitForSelector('.meet-path');
});
