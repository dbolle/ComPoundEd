// Pet Store "coming soon" teaser: a boarded-up shop tile on the pack screen
// and a savings hint in the wallet — anticipation only, nothing for sale.
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
  const tile = page.locator('.dog-card.store-soon');
  await expect(tile).toBeVisible();
  await expect(tile).toContainText('Opening soon');
  await expect(tile.locator('svg[data-store="soon"]')).toBeVisible();

  await tile.tap();
  await expect(page.locator('.toast')).toContainText('Paw Bucks');
  await expect(page).toHaveURL(/#\/pack/); // still on the pack — no store route yet

  await page.tap('[data-wallet]');
  await expect(page.locator('.screen')).toContainText('The Pet Store opens soon');
});
