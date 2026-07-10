// Little Pup mode: preschool counting games, error-less by design.
import { test, expect } from '@playwright/test';
import { newProfile, migrateProfile, mergeProfiles, SCHEMA_VERSION } from '../src/data/schema.js';
import { readProfile, seedProfile, uniqueName, stat, norm } from './helpers.mjs';

test('migration v6→v7 adds subjects scaffolding + little progression', () => {
  const doc = migrateProfile({
    id: 'v6',
    schemaVersion: 6,
    name: 'V6',
    avatarDogId: 'starter',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    facts: { '2x3': stat(4) },
    division: {},
    unlocks: [{ dogId: 'starter', table: null, at: Date.now() }],
    play: {},
    speed: { avgMs: 0, samples: 0 },
    achievements: {},
    stats: {},
  });
  expect(doc.schemaVersion).toBe(SCHEMA_VERSION);
  expect(doc.subjects).toEqual({ little: false });
  expect(doc.little).toEqual({ xp: 0 });

  const a = newProfile('A');
  const b = structuredClone(a);
  a.little.xp = 12;
  a.updatedAt = Date.now() - 1000;
  b.subjects.little = true; // parent flipped it more recently
  b.updatedAt = Date.now();
  const m = mergeProfiles(a, b);
  expect(m.subjects.little).toBe(true);
  expect(m.little.xp).toBe(12); // progression never regresses
});

async function createLittleProfile(page, name) {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.tap('[data-new]');
  await page.fill('.name-input', name);
  await page.tap('form[data-create] [data-kind="little"]');
  await page.waitForSelector('.little-tile');
}

test('e2e: little pup profile gets the counting home, not the grids', async ({ page }) => {
  await createLittleProfile(page, uniqueName('Pup'));
  expect(await page.$$eval('.little-tile', (els) => els.length)).toBe(3);
  expect(await page.$('.table-grid')).toBeNull();
  expect(await page.$('[data-suggest]')).toBeNull();
});

test('e2e: How many? round — errorless retries, xp, buddy play credit', async ({ page }) => {
  const name = uniqueName('Count');
  await createLittleProfile(page, name);
  await page.tap('[data-game="count"]');
  await page.waitForSelector('.little-card');

  for (let i = 0; i < 5; i++) {
    await page.waitForSelector('.little-items .li');
    const n = await page.$$eval('.little-items .li', (els) => els.length);
    if (i === 0) {
      // 🔍 wrong tap: card dims, question stays, paw not earned
      const wrongText = await page.$$eval(
        '.little-card',
        (els, target) => els.map((e) => e.textContent.trim()).find((t) => t !== String(target)),
        n
      );
      await page.locator('.little-card', { hasText: new RegExp(`^${wrongText}$`) }).tap();
      await expect(page.locator('.little-card.dim')).toHaveCount(1);
      await expect(page.locator('.paw.done')).toHaveCount(0);
      await expect(page.locator('.little-fb')).toContainText('🐾');
      await expect(page.locator('.little-card.shake')).toHaveCount(1);
      await page.tap('[data-say]'); // 🔊 repeat is present and safe
    }
    await page.locator('.little-card', { hasText: new RegExp(`^${n}$`) }).tap();
    await page.waitForTimeout(1150);
  }

  await page.waitForSelector('.little-done');
  const profiles = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const req = indexedDB.open('compounded', 1);
        req.onsuccess = () => {
          const g = req.result.transaction('profiles').objectStore('profiles').getAll();
          g.onsuccess = () => resolve(g.result);
        };
      })
  );
  const doc = profiles.find((x) => x.name === name);
  expect(doc.little.xp).toBe(4); // 5 correct, one needed a retry
  expect(doc.play.starter.fetch).toBe(1); // counts as playing with the buddy
});

test('e2e: little screens fit a small iPhone viewport with zero scrolling', async ({ browser, baseURL }) => {
  // 390×560 ≈ iPhone with the Safari bars showing (the worst case).
  const ctx = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 560 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await ctx.newPage();
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile('Fit');
  doc.id = 'fit-kid';
  doc.subjects.little = true;
  doc.little.xp = 50; // numbers up to 10 → the tallest layouts
  await seedProfile(page, doc);
  await page.tap('.profile-card:has-text("Fit")');
  await page.waitForSelector('.little-tile');

  const overflow = () =>
    page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  expect(await overflow()).toBeLessThanOrEqual(0);

  for (const game of ['count', 'find', 'more']) {
    await page.tap(`[data-game="${game}"]`);
    await page.waitForSelector('.little-card');
    for (let i = 0; i < 4; i++) {
      expect(await overflow()).toBeLessThanOrEqual(0);
      const n = await page.evaluate(() =>
        Number(document.querySelector('.little-stage').dataset.answer)
      );
      const cards = await page.$$('.little-card');
      for (const c of cards) {
        const text = (await c.textContent()).trim();
        const items = (await c.$$('.li')).length;
        if (text === String(n) || items === n) {
          await c.tap();
          break;
        }
      }
      await page.waitForTimeout(1100);
      if (await page.$('.little-done')) break;
    }
    if (await page.$('.little-done')) {
      expect(await overflow()).toBeLessThanOrEqual(0);
      await page.tap('[data-home]');
    } else {
      await page.tap('[data-quit]');
    }
    await page.waitForSelector('.little-tile');
  }
  await ctx.close();
});

test('e2e: grown-ups toggle flips a big-kid profile into little mode', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.tap('[data-new]');
  const name = uniqueName('Flip');
  await page.fill('.name-input', name);
  await page.tap('form[data-create] [data-kind="big"]');
  await page.waitForSelector('.hero');
  expect(await page.$('.little-tile')).toBeNull();

  await page.tap('[data-nav="/grownups"]');
  await page.waitForSelector('[data-hold]');
  const box = await (await page.$('[data-hold]')).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(2300);
  await page.mouse.up();
  await page.tap('[data-little-toggle]');
  await expect(page.locator('[data-little-toggle]')).toContainText('on');
  await page.tap('[data-back]');
  await page.waitForSelector('.little-tile');
  expect(await page.$$eval('.little-tile', (els) => els.length)).toBe(3);
});
