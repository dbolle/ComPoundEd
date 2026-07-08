// Dog accessories (earned from play counters, no stored state) and the
// division view on the progress map.
import { test, expect } from '@playwright/test';
import { accessoriesFor, ACCESSORIES, dogSVG, getDog } from '../src/art/dogs.js';
import { newProfile } from '../src/data/schema.js';
import { seedProfile, selectProfile, playQuestions, norm, stat } from './helpers.mjs';

test('accessories derive from play counters with laddered thresholds', () => {
  const p = newProfile('Acc');
  expect(accessoriesFor(p, 'starter')).toEqual([]);
  p.play.starter = { walk: 10, feed: 9, fetch: 0 };
  expect(accessoriesFor(p, 'starter')).toEqual(['bandana']);
  p.play.starter = { walk: 15, feed: 10, fetch: 10 };
  expect(accessoriesFor(p, 'starter')).toEqual(['bandana', 'bow', 'cap']);
  p.play.starter = { walk: 15, feed: 15, fetch: 10 }; // total 40 → star tag
  expect(accessoriesFor(p, 'starter')).toContain('star');
});

test('dogSVG renders earned accessories', () => {
  const dog = getDog('starter');
  expect(dogSVG(dog, 96)).not.toContain('data-acc');
  const svg = dogSVG(dog, 96, ['bandana', 'cap', 'bow', 'star']);
  for (const id of ['bandana', 'cap', 'bow', 'star']) {
    expect(svg).toContain(`data-acc="${id}"`);
  }
});

test('e2e: the 10th walk earns the bandana, worn everywhere', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile('WalkKid');
  doc.id = 'walk-kid';
  doc.play.starter = { walk: 9, feed: 0, fetch: 0 };
  await seedProfile(page, doc);
  await selectProfile(page, 'WalkKid');

  await page.tap('[data-nav="/pack"]');
  await page.tap('.dog-card:has-text("Biscuit")');
  await page.waitForSelector('.dog-hero');
  await expect(page.locator('.acc-hint')).toContainText('after 1 more walk');
  expect(await page.$('[data-acc="bandana"]')).toBeNull();

  await page.tap('[data-act="walk"]');
  await page.waitForSelector('.activity-scene');
  await playQuestions(page, 7);
  await page.waitForSelector('[data-again]');
  await expect(page.locator('.badge', { hasText: 'bandana' })).toBeVisible();

  await page.tap('[data-done]');
  await page.waitForSelector('.dog-hero');
  expect(await page.$('.dog-hero [data-acc="bandana"]')).not.toBeNull();
});

test('e2e: progress map toggles to the division view', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile('MapKid');
  doc.id = 'map-kid';
  for (let b = 0; b <= 12; b++) {
    doc.facts[norm(2, b)] = stat(4);
    doc.division[norm(2, b)] = stat(2);
  }
  await seedProfile(page, doc);
  await selectProfile(page, 'MapKid');
  await page.tap('[data-nav="/heatmap"]');
  await page.waitForSelector('.hm-cell');

  // Times view: ×2 facts colored
  const timesColored = await page.$$eval('.hm-cell', (els) =>
    els.filter((e) => e.style.background !== 'rgb(240, 231, 218)').length
  );
  expect(timesColored).toBeGreaterThan(20);

  await page.tap('[data-mode="div"]');
  await page.waitForSelector('.hm-cell');
  const divColored = await page.$$eval('.hm-cell', (els) =>
    els.filter((e) => e.style.background !== 'rgb(240, 231, 218)').length
  );
  expect(divColored).toBeGreaterThan(20);

  // Division caption reads as a ÷ fact
  await page.tap('.hm-grid .hm-cell >> nth=35'); // row 2, col 8 → 16 ÷ 2 = 8
  await expect(page.locator('.hm-caption')).toContainText('÷');
  await expect(page.locator('.hm-caption')).toContainText('Warming up');
});
