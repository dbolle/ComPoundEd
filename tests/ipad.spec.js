// Tablet tier: on iPad-sized viewports the game scales up; phone layouts are
// untouched (guarded separately by fit.spec and little.spec).
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { seedProfile, selectProfile, openTableGrid, norm, stat } from './helpers.mjs';

const IPAD = { width: 820, height: 1180 }; // iPad Air portrait

test('iPad: wider column, bigger art and keys, richer grids', async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({
    baseURL,
    viewport: IPAD,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile('Tablet');
  doc.id = 'tablet-kid';
  for (let b = 0; b <= 12; b++) doc.facts[norm(2, b)] = stat(4);
  doc.unlocks.push({ dogId: 'dog-2', table: 2, at: Date.now() });
  await seedProfile(page, doc);
  await selectProfile(page, 'Tablet');

  // Column widens past the phone cap, hero dog scales up
  const appWidth = await page.$eval('#app', (el) => el.getBoundingClientRect().width);
  expect(appWidth).toBeGreaterThan(600);
  const avatar = await page.$eval('.hero .avatar svg', (el) => el.getBoundingClientRect().width);
  expect(avatar).toBeGreaterThanOrEqual(110);

  // Quiz: bigger keys, no overflow
  await openTableGrid(page);
  await page.tap('.table-grid .table-btn:nth-child(2)');
  await page.waitForSelector('.numpad .key');
  const keyHeight = await page.$eval('.numpad .key', (el) => el.getBoundingClientRect().height);
  expect(keyHeight).toBeGreaterThanOrEqual(60);
  expect(
    await page.evaluate(() => document.querySelector('#app').scrollHeight - window.innerHeight)
  ).toBeLessThanOrEqual(0);
  await page.tap('[data-quit]');

  // Pack gets a 4-column grid on tablets
  await page.waitForSelector('.hero');
  await page.tap('[data-nav="/pack"]');
  await page.waitForSelector('.pack-grid .dog-card');
  const packCols = await page.$eval(
    '.pack-grid',
    (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length
  );
  expect(packCols).toBe(4);
  await ctx.close();
});

test('iPad: little pups get 3-column tiles and bigger targets', async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ baseURL, viewport: IPAD, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile('LittleTab');
  doc.id = 'little-tab';
  doc.subjects.little = true;
  doc.little.xp = 120;
  await seedProfile(page, doc);
  await page.tap('.profile-card:has-text("LittleTab")');
  await page.waitForSelector('.little-tile');

  const cols = await page.$eval(
    '.little-tiles',
    (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length
  );
  expect(cols).toBe(3);
  const tile = await page.$eval(
    'button.little-tile',
    (el) => el.getBoundingClientRect().height
  );
  expect(tile).toBeGreaterThanOrEqual(140);
  await ctx.close();
});

test('phone layouts are byte-identical in behavior (media tier off)', async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 664 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await ctx.newPage();
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.tap('[data-new]');
  await page.fill('.name-input', 'PhoneCheck');
  await page.tap('form[data-create] [data-kind="big"]');
  await page.waitForSelector('.hero');
  const appWidth = await page.$eval('#app', (el) => el.getBoundingClientRect().width);
  expect(appWidth).toBeLessThanOrEqual(520);
  const avatar = await page.$eval('.hero .avatar svg', (el) => el.getBoundingClientRect().width);
  expect(Math.round(avatar)).toBe(84); // exactly the phone size — svg-fill changed nothing
  await ctx.close();
});
