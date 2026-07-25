// Pet Store "coming soon" teaser: a store button in the pack's top action
// row (and atop the Cozy Corner) plus a savings hint in the wallet —
// anticipation only, nothing for sale.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { seedProfile, selectProfile } from './helpers.mjs';

test('pack shows the boarded-up store; tapping toasts, never navigates; wallet teases', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile('Shopper');
  doc.id = 'teaser-kid';
  await seedProfile(page, doc);
  await selectProfile(page, 'Shopper');

  await page.tap('[data-nav="/pack"]');
  const btn = page.locator('.pack-actions .store-btn');
  await expect(btn).toBeVisible();
  await expect(btn).toContainText('Pet store 🚧');

  await btn.tap();
  await expect(page.locator('.toast')).toContainText('Paw Bucks');
  await expect(page).toHaveURL(/#\/pack/); // still on the pack — no store route yet

  await page.tap('[data-wallet]');
  await expect(page.locator('.screen')).toContainText('The Pet Store opens soon');

  // the Cozy Corner tops out with the same button
  await page.evaluate(() => { location.hash = '#/corner'; });
  await expect(page.locator('.pack-actions .store-btn')).toBeVisible();
});
