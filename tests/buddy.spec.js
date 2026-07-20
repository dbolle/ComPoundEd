// Pick-your-buddy: adopted Cozy Corner pets can become the avatar; a dog
// buddy from the dog page switches back. Schema v14 additive.
import { test, expect } from '@playwright/test';
import { newProfile, migrateProfile, SCHEMA_VERSION } from '../src/data/schema.js';
import { avatarFor } from '../src/art/avatar.js';
import { seedProfile, selectProfile, uniqueName } from './helpers.mjs';

test('migration v13→v14 adds avatarPetId; avatarFor falls back to the dog', () => {
  const old = { ...newProfile('Old'), schemaVersion: 13 };
  delete old.avatarPetId;
  const doc = migrateProfile(old);
  expect(doc.schemaVersion).toBe(SCHEMA_VERSION);
  expect(doc.avatarPetId).toBeNull();
  expect(avatarFor(doc).kind).toBe('dog');
  doc.avatarPetId = 'cat-1';
  expect(avatarFor(doc).name).toBe('Whiskers');
  doc.avatarPetId = 'no-such-pet';
  expect(avatarFor(doc).kind).toBe('dog'); // unknown pet id → dog fallback
});

test('e2e: little pup picks Pearl in the Corner; hero + games follow; dog page switches back', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Picker'));
  doc.id = 'picker-kid';
  doc.subjects = { ...doc.subjects, little: true };
  doc.little = { xp: 10, skills: {} };
  doc.petUnlocks = [
    { petId: 'cat-1', milestone: 'look', at: 1 },
    { petId: 'cat-3', milestone: 'bond5', at: 2 },
  ];
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.little-tile');
  await page.tap('[data-corner]');
  await page.waitForSelector('.corner-grid');

  const pearl = page.locator('.dog-card', { hasText: 'Pearl' });
  await pearl.locator('.buddy-pick').tap();
  await expect(pearl.locator('.buddy-pick')).toContainText('My buddy');
  await expect(pearl).toHaveClass(/buddy/);

  await page.tap('[data-back]');
  await page.waitForSelector('.little-tile');
  await expect(page.locator('.little-hero [aria-label*="Pearl"]')).toBeVisible();

  // feed game speaks/serves the pet buddy
  await page.evaluate(() => { location.hash = '#/little?game=feed'; });
  await page.waitForSelector('.feed-row');
  await expect(page.locator('.feed-row [aria-label*="Pearl"]')).toBeVisible();
  await page.tap('[data-quit]');
  await page.waitForSelector('.little-tile');

  // way back: the dog page's buddy button restores a dog buddy
  await page.evaluate(() => { location.hash = '#/dog?id=starter'; });
  await page.waitForSelector('[data-buddy]');
  await page.tap('[data-buddy]');
  await expect(page.locator('.toast')).toContainText('buddy');
  await page.evaluate(() => { location.hash = '#/home'; });
  await page.waitForSelector('.little-tile');
  await expect(page.locator('.little-hero [aria-label*="Biscuit"]')).toBeVisible();
});
