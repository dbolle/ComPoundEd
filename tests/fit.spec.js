// Game screens (quiz + activities) must fit an iPhone with the Safari bars
// showing (~600px visible) with zero scrolling — including the tallest
// states (hint + Got it!, 3-dog group scenes, sitting rounds).
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { seedProfile, selectProfile, norm, stat, openTableGrid, clearCountingPath } from './helpers.mjs';

function richDoc(id, name) {
  const doc = newProfile(name);
  doc.id = id;
  for (let b = 0; b <= 12; b++) {
    doc.facts[norm(2, b)] = stat(5);
    doc.facts[norm(10, b)] = stat(4);
    doc.facts[norm(3, b)] = stat(2);
  }
  doc.unlocks.push(
    { dogId: 'dog-2', table: 2, at: Date.now() },
    { dogId: 'dog-7', table: 7, at: Date.now() }
  );
  return doc;
}

test('quiz and activity screens never overflow a 390×600 viewport', async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 600 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await ctx.newPage();
  const overflow = () =>
    page.evaluate(() => document.querySelector('#app').scrollHeight - window.innerHeight);

  await page.goto('/', { waitUntil: 'networkidle' });
  await seedProfile(page, richDoc('fit-game', 'FitGame'));
  await selectProfile(page, 'FitGame');

  // Quiz — normal question, then the tall wrong-state (hint + Got it!)
  await openTableGrid(page);
  await page.tap('.table-grid .table-btn:nth-child(3)');
  await page.waitForSelector('.question');
  await clearCountingPath(page);
  expect(await overflow()).toBeLessThanOrEqual(0);
  await page.tap('.numpad .key:text-is("1")');
  await page.tap('.numpad .key.ok');
  await page.waitForSelector('.feedback [data-next]');
  expect(await overflow()).toBeLessThanOrEqual(0); // hint state fits too
  await expect(page.locator('.numpad')).toBeHidden();
  await page.tap('.feedback [data-next]');
  await page.waitForTimeout(300);
  await expect(page.locator('.numpad')).toBeVisible();
  await page.tap('[data-quit]');
  await page.waitForSelector('.hero');

  // Solo activity
  await page.tap('[data-nav="/pack"]');
  await page.tap('.dog-card:has-text("Daisy")');
  await page.waitForSelector('.dog-hero');
  await page.tap('[data-act="walk"]');
  await page.waitForSelector('.activity-scene');
  expect(await overflow()).toBeLessThanOrEqual(0);
  await page.tap('[data-quit]');
  await page.waitForSelector('.dog-hero');
  await page.tap('[data-back]');

  // 3-dog group walk (tallest scene)
  await page.waitForSelector('.pack-grid');
  await page.tap('button:has-text("Play date")');
  await page.waitForSelector('.kind-btn');
  await page.tap('.dog-card:has-text("Biscuit")');
  await page.tap('.dog-card:has-text("Daisy")');
  await page.tap('.dog-card:has-text("Scout")');
  await page.tap('[data-start]');
  await page.waitForSelector('.activity-scene');
  expect(await overflow()).toBeLessThanOrEqual(0);
  await page.tap('[data-quit]');

  // Pet sitting (10-question activity with wrong-state)
  await page.waitForSelector('.pack-grid');
  await page.tap('[data-back]');
  await page.waitForSelector('.sitting-card');
  await page.tap('.sitting-card');
  await page.waitForSelector('.activity-scene');
  expect(await overflow()).toBeLessThanOrEqual(0);
  await page.tap('.numpad .key:text-is("1")');
  await page.tap('.numpad .key.ok');
  const gotIt = await page.$('.feedback [data-next]');
  if (gotIt) expect(await overflow()).toBeLessThanOrEqual(0); // (first answer may be right)

  await ctx.close();
});

test('worst case: every little game keeps all items inside a 390×600 phone', async ({ page }) => {
  test.slow(); // 7 games × bounded random draws to reach the biggest question
  await page.setViewportSize({ width: 390, height: 600 });
  await page.goto('/', { waitUntil: 'networkidle' });
  const { newProfile } = await import('../src/data/schema.js');
  const doc = newProfile('Maxed');
  doc.id = 'maxed-kid';
  doc.subjects = { ...doc.subjects, little: true };
  const skills = {};
  for (const g of ['count', 'find', 'look', 'more', 'next', 'add', 'feed']) {
    for (let n = 1; n <= 10; n++) skills[`${g}:${n}`] = { attempts: 4, streak: 4 };
  }
  for (let k = 0; k <= 10; k++) skills[`bond5:${k}`] = skills[`bond10:${k}`] = { attempts: 4, streak: 4 };
  doc.little = { xp: 200, skills, revealed: [] };
  await seedProfile(page, doc);
  await selectProfile(page, 'Maxed');
  await page.waitForSelector('.little-tile');

  const offscreen = async () =>
    page.evaluate(() => {
      const bad = [];
      for (const elx of document.querySelectorAll('.little-stage *, .little-choices *')) {
        const r = elx.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        if (r.left < -1 || r.right > window.innerWidth + 1 || r.top < -1 || r.bottom > window.innerHeight + 1) {
          bad.push(`${elx.className}@${Math.round(r.right)},${Math.round(r.bottom)}`);
        }
      }
      return bad;
    });

  // drive each sizeable game to its biggest question (bounded retries)
  for (const game of ['count', 'find', 'add', 'teen', 'look', 'feed', 'taway']) {
    let biggest = false;
    for (let i = 0; i < 45 && !biggest; i++) {
      await page.evaluate((gm) => { location.hash = `#/little?game=${gm}`; }, game);
      await page.waitForSelector('.little-stage > *', { state: 'attached' }); // look's frame hides after the flash
      await page.waitForTimeout(250);
      const n = await page.evaluate(() => Number(document.querySelector('.little-stage')?.dataset.answer));
      const items = await page.$$eval('.little-stage .li', (els) => els.length);
      biggest =
        game === 'teen' ? n >= 17 : game === 'add' ? n >= 9 : game === 'taway' ? items >= 9 : n >= 9 || Number.isNaN(n);
      if (biggest) {
        const bad = await offscreen();
        expect(bad, `${game} n=${n}: ${bad.join(' | ')}`).toEqual([]);
      }
      await page.evaluate(() => { location.hash = '#/home'; });
      await page.waitForSelector('.little-tile');
    }
    expect(biggest, `never saw a big ${game} question`).toBe(true);
  }
});
