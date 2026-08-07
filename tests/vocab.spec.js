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

// A dog cannot get rusty: the kid word for a decayed fact is "dusty", and
// the fix is the bath the child actually taps. Grown-ups keep "rusty".
test('"dusty" is the kid word for a decayed fact; rusty/polish are grown-up only', () => {
  const hm = src('heatmap.js');
  expect(hm).toContain('dusty');
  expect(hm).not.toContain('needs a refresh');
  expect(hm.toLowerCase()).not.toContain('rusty');
  expect(hm.toLowerCase()).not.toContain('polish');
  // The coin ceremony is kid-facing too — the badge cleans, it never polishes.
  const money = readFileSync('src/engine/money.js', 'utf8');
  const badge = money.match(/polish: \(n\) =>.*/)[0];
  expect(badge).toContain('dusty fact');
  expect(badge).not.toContain('rusty');
  // ...but the grown-ups ledger label stays in the accurate register, and
  // the ledger identifiers (reason: 'polish') must never be renamed.
  expect(money).toContain("polish: 'rusty fact polished'");
  expect(money).toContain("reason: 'polish'");
});

test('group vocabulary: play date everywhere, collar training as the badge', () => {
  for (const f of ['pack.js', 'group.js', 'dog.js']) {
    expect(src(f)).not.toContain('Play together');
  }
  expect(src('group.js')).toContain('Collar training');
  expect(src('dog.js')).toContain("plural(play.train ?? 0, 'play date')"); // number–noun agreement form
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
  await page.tap('.dog-card:not(.locked)');
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
