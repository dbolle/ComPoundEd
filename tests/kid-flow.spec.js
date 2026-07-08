// The full first-run kid journey, on an insecure origin like the deployed app.
import { test, expect } from '@playwright/test';
import { createProfileUI, playQuestions, uniqueName } from './helpers.mjs';

test('profile creation works without secure-context APIs', async ({ page, baseURL }) => {
  test.skip(baseURL.includes('127.0.0.1'), 'needs the LAN-IP insecure origin');
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(await page.evaluate(() => window.isSecureContext)).toBe(false);
  await createProfileUI(page, uniqueName('Ctx'));
  await expect(page.locator('.hero h1')).toBeVisible();
});

test('first run: create → round → results → progress → pack → heatmap', async ({ page }) => {
  const name = uniqueName('Kid');
  await createProfileUI(page, name);
  await expect(page.locator('.hero h1')).toContainText(name);

  // ×2 round, all correct
  await page.tap('.table-grid .table-btn:nth-child(2)');
  await playQuestions(page, 12);
  await expect(page.locator('.big-score')).toContainText('10 / 10');
  await expect(page.locator('.badge').first()).toBeVisible();

  // Meter moved after one perfect round
  await page.tap('[data-home]');
  const width = await page.$eval(
    '.table-grid .table-btn:nth-child(2) .meter span',
    (e) => parseInt(e.style.width, 10)
  );
  expect(width).toBeGreaterThan(0);

  // Pack: starter only; heatmap: 13×13 cells
  await page.tap('[data-nav="/pack"]');
  await page.waitForSelector('.pack-grid .dog-card');
  expect(await page.$$eval('.dog-card:not(.locked)', (els) => els.length)).toBe(1);
  expect(await page.$$eval('.dog-card.locked', (els) => els.length)).toBe(12);
  await page.tap('[data-back]');
  await page.waitForSelector('.table-grid');
  await page.tap('[data-nav="/heatmap"]');
  await page.waitForSelector('.hm-cell');
  expect(await page.$$eval('.hm-cell', (els) => els.length)).toBe(169);
});

test('wrong answers show the correction and input caps at 3 digits', async ({ page }) => {
  await createProfileUI(page, uniqueName('Wrong'));
  await page.tap('.table-grid .table-btn:nth-child(3)');
  await page.waitForSelector('.question');
  for (const d of '99999') await page.tap(`.numpad .key:text-is("${d}")`);
  await expect(page.locator('.answer-box')).toHaveText('999');
  for (let i = 0; i < 3; i++) await page.tap('.numpad .key.del');
  await page.tap('.numpad .key:text-is("1")');
  await page.tap('.numpad .key.ok');
  await expect(page.locator('.feedback.bad')).toContainText('=');
});

test('profiles are isolated', async ({ page }) => {
  const a = uniqueName('Iso');
  await createProfileUI(page, a);
  await page.tap('.table-grid .table-btn:nth-child(2)');
  await playQuestions(page, 12);
  await page.waitForSelector('.big-score');
  await page.tap('[data-home]');

  await page.tap('[data-nav="/profiles"]');
  await page.tap('[data-new]');
  const b = uniqueName('Iso');
  await page.fill('.name-input', b);
  await page.tap('form[data-create] button[type=submit]');
  await page.waitForSelector('.hero');
  const fresh = await page.$eval(
    '.table-grid .table-btn:nth-child(2) .meter span',
    (e) => parseInt(e.style.width, 10) || 0
  );
  expect(fresh).toBe(0);

  await page.tap('[data-nav="/profiles"]');
  await page.tap(`.profile-card:has-text("${a}")`);
  await page.waitForSelector('.hero');
  const kept = await page.$eval(
    '.table-grid .table-btn:nth-child(2) .meter span',
    (e) => parseInt(e.style.width, 10)
  );
  expect(kept).toBeGreaterThan(0);
});
