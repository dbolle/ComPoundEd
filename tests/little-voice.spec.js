// Speech honing: praise matches the activity (no "great counting" after a
// shape round) and celebration uses the livelier cheer voice.
import { test, expect } from '@playwright/test';
import { uniqueName } from './helpers.mjs';

async function littleProfileWithEars(page, base) {
  await page.addInitScript(() => {
    window.__spoken = [];
    const orig = speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak = (u) => {
      window.__spoken.push({ text: u.text, pitch: u.pitch, rate: u.rate });
      orig(u);
    };
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.tap('[data-new]');
  await page.fill('.name-input', uniqueName(base));
  await page.tap('form[data-create] [data-kind="little"]');
  await page.waitForSelector('.little-tile');
}

async function playChoiceRound(page, game, questions = 5) {
  await page.evaluate((g) => { location.hash = `#/little?game=${g}&v=frame`; }, game);
  await page.waitForSelector('.little-card');
  for (let q = 0; q < questions; q++) {
    await page.tap('.little-card[data-good="1"]');
    await expect(page.locator('.paw.done')).toHaveCount(q + 1);
    if (q < questions - 1) await page.waitForTimeout(1100);
  }
  await page.waitForSelector('[data-again]');
  await page.waitForTimeout(300); // deferred utterance lands
  return page.evaluate(() => window.__spoken);
}

test('shape and pattern rounds praise shapes/patterns, not counting', async ({ page }) => {
  await littleProfileWithEars(page, 'Speaker');
  const shapeSpoken = await playChoiceRound(page, 'shape');
  const shapePraise = shapeSpoken[shapeSpoken.length - 1];
  expect(shapePraise.text).toMatch(/shape/i);
  expect(shapePraise.text).not.toMatch(/count/i);

  await page.evaluate(() => { location.hash = '#/home'; });
  await page.waitForSelector('.little-tile');
  const patternSpoken = await playChoiceRound(page, 'pattern');
  const patternPraise = patternSpoken[patternSpoken.length - 1];
  expect(patternPraise.text).toMatch(/pattern/i);
  expect(patternPraise.text).not.toMatch(/count/i);
});

test('praise uses the cheer voice: higher pitch than prompts', async ({ page }) => {
  await littleProfileWithEars(page, 'Cheery');
  const spoken = await playChoiceRound(page, 'count');
  const prompt = spoken.find((u) => u.text === 'How many?');
  const praise = spoken[spoken.length - 1];
  expect(prompt.pitch).toBeCloseTo(1.1, 5);
  expect(praise.pitch).toBeGreaterThan(1.3);
  expect(praise.rate).toBeGreaterThan(1);
});
