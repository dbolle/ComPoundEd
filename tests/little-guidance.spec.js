// v1.10.0: verification tightening + the guidance layer.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { rangeFor } from '../src/screens/little.js';
import { seedProfile, selectProfile, uniqueName } from './helpers.mjs';

const skilled = (game, lo, hi, streak = 3) => {
  const s = {};
  for (let n = lo; n <= hi; n++) s[`${game}:${n}`] = { attempts: streak, streak };
  return s;
};

test('domains fixed: more/next ranges can actually grow; more needs streak 4', () => {
  const p = newProfile('Dom');
  p.little.skills = { ...skilled('more', 2, 5, 4), ...skilled('next', 4, 5) };
  expect(rangeFor(p, 'more')).toBe(7); // no impossible more:1 blocking
  expect(rangeFor(p, 'next')).toBe(7);
  p.little.skills = skilled('more', 2, 5, 3); // streak 3 isn't knowing for 2-choice
  expect(rangeFor(p, 'more')).toBe(5);
});

test('e2e: Play-next hero suggests the frontier; paw badge marks it; sparkle shows the goal chip', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Guide'));
  doc.id = 'guide-kid';
  doc.subjects = { ...doc.subjects, little: true };
  doc.little = { xp: 10, skills: { ...skilled('count', 1, 3) } };
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.little-tile');

  // counting 4–5 still unknown → count is the frontier
  await expect(page.locator('.play-next')).toHaveAttribute('data-game', 'count');
  await expect(page.locator('.little-tile.picked .paw-badge')).toBeVisible();
  // sparkle previews the next unlock with icon + meter + count
  const soon = page.locator('.little-tile.soon');
  await expect(soon.locator('.reward-chip')).toBeVisible();
  await expect(soon).toContainText('/');

  // hero navigates straight into the game
  await page.tap('.play-next');
  await page.waitForSelector('.little-card');
});

test('e2e: Quick Look blocks answers during the flash', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Flash'));
  doc.id = 'flash-kid';
  doc.subjects = { ...doc.subjects, little: true };
  doc.little = { xp: 10, skills: skilled('count', 1, 5) };
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.little-tile');
  await page.evaluate(() => { location.hash = '#/little?game=look'; });
  await page.waitForSelector('.little-card');
  await page.tap('.little-card[data-good="1"]'); // during the flash: ignored
  await expect(page.locator('.paw.done')).toHaveCount(0);
  await expect(page.locator('.look-veil')).toBeVisible({ timeout: 3000 });
  await page.tap('.little-card[data-good="1"]');
  await expect(page.locator('.paw.done')).toHaveCount(1);
});

test('e2e: feed now records skill; bond pictures stage records attempts, not streaks', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Verify'));
  doc.id = 'verify-kid';
  doc.subjects = { ...doc.subjects, little: true };
  doc.little = { xp: 20, skills: { ...skilled('count', 1, 5), ...skilled('look', 1, 5) } };
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.little-tile');

  // one bond round in the pictures stage: every first-try right
  await page.evaluate(() => { location.hash = '#/little?game=bond&v=frame'; });
  await page.waitForSelector('.little-card');
  for (let q = 0; q < 5; q++) {
    await page.tap('.little-card[data-good="1"]');
    await expect(page.locator('.paw.done')).toHaveCount(q + 1);
    if (q < 4) await page.waitForTimeout(1800);
  }
  await page.waitForSelector('[data-again]');
  const saved = await page.evaluate(
    (id) => new Promise((res) => {
      const req = indexedDB.open('compounded', 1);
      req.onsuccess = () => {
        const g = req.result.transaction('profiles').objectStore('profiles').get(id);
        g.onsuccess = () => res(g.result);
      };
    }),
    'verify-kid'
  );
  const bondKeys = Object.entries(saved.little.skills).filter(([k]) => k.startsWith('bond5:'));
  expect(bondKeys.reduce((s, [, v]) => s + v.attempts, 0)).toBe(5);
  for (const [, v] of bondKeys) expect(v.streak).toBe(0); // teach-only
});
