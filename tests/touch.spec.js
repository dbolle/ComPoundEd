// Press feedback must flash for every tap, however fast (iOS drops :active).
import { test, expect } from '@playwright/test';
import { createProfileUI, uniqueName } from './helpers.mjs';

test('fast taps flash the pressed state; held presses stay dark', async ({ page }) => {
  await createProfileUI(page, uniqueName('Tap'));
  await page.tap('[data-mixed]');
  await page.waitForSelector('.numpad .key');

  const key = page.locator('.numpad .key:text-is("5")');
  const box = await key.boundingBox();
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  const during = await key.evaluate((el) => ({
    pressed: el.classList.contains('pressed'),
    filter: getComputedStyle(el).filter,
  }));
  expect(during.pressed).toBe(true);
  expect(during.filter).toContain('brightness');

  await page.waitForTimeout(400);
  expect(await key.evaluate((el) => el.classList.contains('pressed'))).toBe(false);

  const del = page.locator('.numpad .key.del');
  await del.evaluate((el) =>
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }))
  );
  await page.waitForTimeout(300);
  expect(await del.evaluate((el) => el.classList.contains('pressed'))).toBe(true);
  await del.evaluate((el) =>
    el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch' }))
  );
});
