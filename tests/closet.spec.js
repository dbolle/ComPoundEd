// v1.15.0: collar wardrobe row, closet placement UI, group training tip.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { buyGear } from '../src/engine/gearshop.js';
import { seedProfile, selectProfile, playQuestions, norm, stat, uniqueName } from './helpers.mjs';

function richKid(name) {
  const doc = newProfile(name);
  for (let b = 0; b <= 12; b++) {
    doc.facts[norm(2, b)] = stat(4);
    doc.facts[norm(7, b)] = stat(1);
  }
  doc.unlocks.push({ dogId: 'dog-2', table: 2, at: 1 }, { dogId: 'dog-7', table: 7, at: 2 });
  doc.pawBucks.txns.push({ id: 'seed', at: Date.now(), cents: 2000, denom: 'buck', count: 1, reason: 'sitting' });
  return doc;
}

test('e2e: group screen suggests the weakest partner; tapping the tip selects them', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = richKid(uniqueName('Tip'));
  doc.id = 'tip-kid';
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.hero');
  await page.evaluate(() => { location.hash = '#/group'; });
  await page.waitForSelector('.train-tip');
  await expect(page.locator('.train-tip')).toContainText('Scout'); // ×7 dog, weakest
  await page.tap('.train-tip');
  await expect(page.locator('[data-dog="dog-7"]')).toHaveClass(/selected/);

  // live badge: weak partner selected + one more = collar training
  await page.tap('[data-dog="dog-2"]');
  await expect(page.locator('[data-collar-status]')).toContainText('Collar training');
  await expect(page.locator('[data-start]')).toContainText("Let's train");
  // swap the weak partner out: just-for-fun state, gentle nudge
  await page.tap('[data-dog="dog-7"]');
  await page.tap('[data-dog="starter"]');
  await expect(page.locator('[data-collar-status]')).toContainText('Just for fun');
  await expect(page.locator('[data-start]')).toContainText("Let's go");
});

test('e2e: wardrobe shows the collar ladder + closet; treasures move between wearers', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = richKid(uniqueName('Closet'));
  doc.id = 'closet-kid';
  doc.play['dog-2'] = { walk: 20, feed: 0, fetch: 0, groom: 0, train: 12 }; // blue collar earned
  buyGear(doc, 'crown');
  buyGear(doc, 'scarf', 'dog-2');
  doc.gear.placements.crown = 'dog-7'; // Scout has the crown right now
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.hero');

  // earn the wardrobe pass with a groom, then dress up
  await page.evaluate(() => { location.hash = '#/dog?id=dog-2'; });
  await page.waitForSelector('[data-act="groom"]');
  await expect(page.locator('.play-stats')).toContainText('12 play dates');
  await page.tap('[data-act="groom"]');
  await page.waitForSelector('.activity-scene');
  await playQuestions(page, 16);
  await page.waitForSelector('[data-dress]');
  await page.tap('[data-dress]');
  await page.waitForSelector('.wr-swatches');

  // collar row: blue unlocked, green locked with the 🐕🐕 price
  const collarRow = page.locator('.wardrobe-row', { hasText: 'collar' });
  await expect(collarRow.locator('.swatch:not(.locked)')).toHaveCount(2); // original + blue
  await expect(collarRow.locator('.swatch.locked .swatch-need').first()).toContainText('🐕🐕25');
  await collarRow.locator('.swatch[data-val="blue"]').tap();
  await expect(collarRow.locator('.swatch[data-val="blue"]')).toHaveClass(/sel/);

  // closet: the scarf is Daisy's (arrived worn); the crown is with Scout
  const scarfRow = page.locator('.wardrobe-row', { hasText: 'cozy scarf' });
  await expect(scarfRow).toContainText('Wearing it');
  const crownRow = page.locator('.wardrobe-row', { hasText: 'royal crown' });
  await expect(crownRow).toContainText('Bring from Scout');
  await crownRow.locator('[data-closet]').tap();
  await expect(page.locator('.wardrobe-row', { hasText: 'royal crown' })).toContainText('Wearing it');
  // preview now wears crown + scarf + blue collar
  const svg = await page.locator('[data-preview] svg').first().evaluate((e) => e.outerHTML);
  expect(svg).toContain('data-acc="crown"');
});
