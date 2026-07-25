// The Pet Store is OPEN (v1.32.0): every profile reaches it from the
// pack row, the Cozy Corner, and the wallet link — no beta flag needed.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { seedProfile, selectProfile } from './helpers.mjs';

test('the store is open for everyone: pack, corner, and wallet all lead in', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile('Shopper');
  doc.id = 'teaser-kid';
  await seedProfile(page, doc);
  await selectProfile(page, 'Shopper');

  await page.tap('[data-nav="/pack"]');
  const btn = page.locator('.pack-actions .store-btn');
  await expect(btn).toBeVisible();
  await expect(btn).not.toContainText('🚧');
  await btn.tap();
  await page.waitForSelector('[data-shelves]');
  await expect(page.locator('.screen')).toContainText('Buy something for your pet!');

  await page.tap('[data-back]');
  await page.tap('[data-wallet]');
  await page.tap('[data-store]');
  await page.waitForSelector('[data-shelves]');
});
