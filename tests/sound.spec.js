// Sounds & haptics: the toggle persists per-device, and audio firing during
// play never breaks the game (synthesized Web Audio, guarded).
import { test, expect } from '@playwright/test';
import { createProfileUI, playQuestions, holdGrownupsGate, uniqueName } from './helpers.mjs';

test('sounds default on, toggle persists across reload', async ({ page }) => {
  await createProfileUI(page, uniqueName('Snd'));
  await page.tap('[data-nav="/grownups"]');
  await holdGrownupsGate(page);
  const btn = page.locator('[data-sound-toggle]');
  await expect(btn).toContainText('on');
  await btn.tap();
  await expect(btn).toContainText('off');

  await page.reload({ waitUntil: 'networkidle' });
  await holdGrownupsGate(page);
  await expect(page.locator('[data-sound-toggle]')).toContainText('off');
});

test('a full round with sounds on raises no page errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await createProfileUI(page, uniqueName('Sfx'));
  await page.tap('.table-grid .table-btn:nth-child(2)');
  await playQuestions(page, 12, {
    answerFn: (q, i) => (i === 1 ? q.a * q.b + 1 : q.a * q.b), // one wrong → sfx.wrong
  });
  await page.waitForSelector('.big-score'); // results → sfx.celebrate
  await page.waitForTimeout(600);
  expect(errors).toEqual([]);
});
