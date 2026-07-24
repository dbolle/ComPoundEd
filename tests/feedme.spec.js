// v1.28.0: real-3-year-old ergonomics — settle delay, disabled serve
// button, species-appropriate food, number–noun agreement.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { plural } from '../src/ui.js';
import { FOOD_BY_SPECIES, wordFor } from '../src/screens/little.js';
import { seedProfile, selectProfile, uniqueName } from './helpers.mjs';

test('plural + species food maps', () => {
  expect(plural(1, 'bone')).toBe('bone');
  expect(plural(3, 'bone')).toBe('bones');
  expect(plural(1, 'fetch', 'fetches')).toBe('fetch');
  expect(wordFor('🥬', 1)).toBe('leaf');
  expect(wordFor('🥬', 3)).toBe('leaves');
  expect(wordFor('🐟', 5)).toBe('fish');
  expect(wordFor('🍓', 2)).toBe('berries');
  expect(FOOD_BY_SPECIES.turtle).not.toBe('🦴');
  for (const species of ['cat', 'rabbit', 'guinea', 'bird', 'sloth', 'hedgehog', 'turtle']) {
    expect(FOOD_BY_SPECIES[species]).toBeTruthy();
  }
});

test('e2e: settle delay ignores carryover taps; the serve button greys during celebration; turtle buddies get greens', async ({ page }) => {
  await page.addInitScript(() => {
    window.__spoken = [];
    const orig = speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak = (u) => { window.__spoken.push(u.text); orig(u); };
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Turt'));
  doc.id = 'turt-kid';
  doc.subjects = { ...doc.subjects, little: true };
  doc.avatarPetId = 'turtle-3'; // Tidepool is the buddy
  doc.petUnlocks = [{ petId: 'turtle-3', milestone: 'count3', at: 1 }];
  doc.little = { xp: 10, skills: {}, revealed: [] };
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.little-tile');
  await page.evaluate(() => { location.hash = '#/little?game=feed&v=bowl'; });
  await page.waitForSelector('.tap-item');

  // 3) no bones for a turtle — species-appropriate food
  const item = (await page.locator('.tap-item').first().textContent()).trim();
  expect(item).not.toBe('🦴');
  expect(item).toBe('🥬');

  const n = await page.evaluate(() => Number(document.querySelector('.little-stage').dataset.answer));
  for (let i = 0; i < n; i++) await page.tap('.tap-item:not(.popped)');
  await page.tap('.feed-done');
  // 2a) the serve button greys out during the celebration
  await expect(page.locator('.feed-done')).toBeDisabled();
  await expect(page.locator('.big-cheer')).toBeVisible(); // 2c) center burst
  await expect(page.locator('.paw.done')).toHaveCount(1);

  // 2b) settle delay on the NEXT question: a carryover tap right as it
  // renders does nothing (celebrate ~900ms + 600ms settle)
  await page.waitForTimeout(950);
  await page.tap('.tap-item:not(.popped)');
  await expect(page.locator('.tap-count')).toHaveText('0');
  await page.waitForTimeout(700); // settle passes — now taps count
  await page.tap('.tap-item:not(.popped)');
  await expect(page.locator('.tap-count')).toHaveText('1');

  // 4) number–noun agreement in the spoken prompt when n is 1
  let sawSingular = false;
  for (let tries = 0; tries < 15 && !sawSingular; tries++) {
    await page.evaluate(() => { location.hash = '#/home'; });
    await page.waitForSelector('.little-tile');
    await page.evaluate(() => { location.hash = '#/little?game=feed&v=bowl'; });
    await page.waitForSelector('.tap-item');
    const k = await page.evaluate(() => Number(document.querySelector('.little-stage').dataset.answer));
    if (k === 1) {
      const spoken = await page.evaluate(() => window.__spoken);
      const line = spoken[spoken.length - 1];
      expect(line).toContain('one leaf!');
      sawSingular = true;
    }
  }
  expect(sawSingular).toBe(true);
});
