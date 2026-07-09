// Home simplification: smart "Practice next" suggestion, collapsible grids
// with remembered state, and the trimmed division section.
import { test, expect } from '@playwright/test';
import { suggestNext } from '../src/engine/suggest.js';
import { newProfile } from '../src/data/schema.js';
import {
  createProfileUI,
  seedProfile,
  selectProfile,
  uniqueName,
  norm,
  stat,
  openTableGrid,
} from './helpers.mjs';

test('suggestNext: fresh kid → ×1; progress wins; division gets its turn', () => {
  const fresh = newProfile('F');
  expect(suggestNext(fresh).label).toBe('×1');

  const partial = newProfile('P');
  for (let b = 0; b <= 6; b++) partial.facts[norm(4, b)] = stat(3);
  expect(suggestNext(partial).label).toBe('×4'); // most progress toward mastery

  const divKid = newProfile('D');
  for (let b = 0; b <= 12; b++) divKid.facts[norm(2, b)] = stat(4);
  expect(suggestNext(divKid).label).toBe('÷2'); // fresh division outranks 0% tables

  const done = newProfile('All');
  for (let t = 1; t <= 12; t++) {
    for (let b = 0; b <= 12; b++) {
      done.facts[norm(t, b)] = stat(5, { ageMs: 3600e3 });
      done.division[norm(t, b)] = stat(5, { ageMs: 3600e3 });
    }
  }
  expect(suggestNext(done)).toBeNull(); // everything fresh and mastered

  done.facts['7x8'].lastSeen = Date.now() - 30 * 86400e3; // one rusty fact
  expect(['×7', '×8']).toContain(suggestNext(done).label); // refresh suggestion
});

test('e2e: collapsed home, suggestion works, expansion persists', async ({ page }) => {
  await createProfileUI(page, uniqueName('Tidy'));

  // Default: both grids collapsed, suggestion visible
  await expect(page.locator('.table-grid')).toBeHidden();
  expect(await page.$('[data-division-slot] .div-grid')).toBeNull(); // gated until mastery
  const suggest = page.locator('[data-suggest]');
  await expect(suggest).toContainText('×1');
  await suggest.tap();
  await page.waitForSelector('.question');
  await expect(page.locator('.topbar strong')).toContainText('×1 table');
  await page.tap('[data-quit]');

  // Expand tables; state survives reload
  await openTableGrid(page);
  await expect(page.locator('.table-grid')).toBeVisible();
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('.hero');
  await expect(page.locator('.table-grid')).toBeVisible();
});

test('e2e: division section shows unlocked + next locked only, with a note', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile('Trim');
  doc.id = 'trim-kid';
  for (let b = 0; b <= 12; b++) doc.facts[norm(2, b)] = stat(4);
  await seedProfile(page, doc);
  await selectProfile(page, 'Trim');

  await expect(page.locator('[data-toggle="division"]')).toContainText('0/12');
  await page.tap('[data-toggle="division"]');
  const btns = page.locator('.div-grid .table-btn');
  await expect(btns).toHaveCount(2); // 🔒 ÷1 + open ÷2, not twelve buttons
  await expect(btns.nth(0)).toBeDisabled();
  await expect(btns.nth(1)).toContainText('÷2');
  await expect(page.locator('.div-note')).toContainText('10 more unlock');
});
