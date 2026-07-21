// Vocabulary canon enforcement (docs/VOCABULARY.md): kid-facing sources
// must not drift into the grown-up register, and the reward chips exist.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { newProfile } from '../src/data/schema.js';
import { seedProfile, selectProfile } from './helpers.mjs';

const src = (f) => readFileSync(`src/screens/${f}`, 'utf8');

test('kid screens never say "Master …" — the kid word is "strong"', () => {
  for (const f of ['home.js', 'pack.js', 'results.js']) {
    expect(src(f)).not.toMatch(/Master (the|\$\{)/);
  }
  expect(src('pack.js')).toContain('strong ⭐');
});

test('rusty is the kid word everywhere; "needs a refresh" is gone', () => {
  expect(src('heatmap.js')).not.toContain('needs a refresh');
  expect(src('heatmap.js')).toContain('rusty');
});

test('group vocabulary: play date everywhere, collar training as the badge', () => {
  for (const f of ['pack.js', 'group.js', 'dog.js']) {
    expect(src(f)).not.toContain('Play together');
  }
  expect(src('group.js')).toContain('Collar training');
  expect(src('dog.js')).toContain('play dates');
});

test('wardrobe locked colors are visible with their price, not tooltips', () => {
  const w = src('wardrobe.js');
  expect(w).not.toContain('title=');
  expect(w).toContain('swatch-need');
  expect(w).toContain('data-say');
});

test('e2e: dog page shows reward chips; wardrobe locked swatch speaks on tap', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile('Chipper');
  doc.id = 'chip-kid';
  doc.play = { starter: { walk: 18, feed: 2, fetch: 0, groom: 5 } };
  await seedProfile(page, doc);
  await selectProfile(page, 'Chipper');
  await page.waitForSelector('.hero');
  await page.tap('[data-nav="/pack"]');
  await page.tap('.dog-card:not(.locked):not(.store-soon)');
  await page.waitForSelector('.play-stats');
  // 18 walks → chip meters toward the blue (25) bandana
  expect(await page.$$eval('.reward-chip', (els) => els.length)).toBe(4); // walks/meals/fetches + collar training
  const label = await page.getAttribute('.reward-chip', 'aria-label');
  expect(label).toContain('7 more to the blue bandana');

  // groomed → wardrobe open: locked colors show their visible price
  await page.tap('[data-act="groom"]');
  await page.waitForSelector('.activity-scene');
  const { playQuestions } = await import('./helpers.mjs');
  await playQuestions(page, 14);
  await page.waitForSelector('[data-dress]');
  await page.tap('[data-dress]');
  await page.waitForSelector('.wr-swatches');
  await expect(page.locator('.swatch.locked .swatch-need').first()).toBeVisible();
  await page.tap('.swatch.locked[data-say]');
  await expect(page.locator('.toast')).toContainText('unlocks the');
});
