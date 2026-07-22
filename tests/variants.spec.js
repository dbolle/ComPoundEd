// v1.22.0: presentation variants over the same skill space + Surprise!
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { seedProfile, selectProfile, uniqueName } from './helpers.mjs';

const skilled = (game, lo, hi, streak = 3) => {
  const s = {};
  for (let n = lo; n <= hi; n++) s[`${game}:${n}`] = { attempts: streak, streak };
  return s;
};
const byId = (id) =>
  new Promise((res) => {
    const req = indexedDB.open('compounded', 1);
    req.onsuccess = () => {
      const g = req.result.transaction('profiles').objectStore('profiles').get(id);
      g.onsuccess = () => res(g.result);
    };
  });

test('e2e: bark counting blocks answers while barking, then records count skill', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Barker'));
  doc.id = 'bark-kid';
  doc.subjects = { ...doc.subjects, little: true };
  doc.little = { xp: 5, skills: {}, revealed: [] };
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.little-tile');
  await page.evaluate(() => { location.hash = '#/little?game=count&v=barks'; });
  await page.waitForSelector('.bark-dog');
  await page.tap('.little-card[data-good="1"]'); // still barking: ignored
  await expect(page.locator('.paw.done')).toHaveCount(0);
  await page.waitForTimeout(8600); // celebrate + bark start + longest run
  for (let q = 0; q < 5; q++) {
    await page.tap('.little-card[data-good="1"]');
    await expect(page.locator('.paw.done')).toHaveCount(q + 1);
    if (q < 4) await page.waitForTimeout(8600);
  }
  await page.waitForSelector('[data-again]');
  const saved = await page.evaluate(byId, 'bark-kid');
  expect(Object.keys(saved.little.skills).some((k) => k.startsWith('count:'))).toBe(true);
});

test('e2e: the cup game hides the missing part and verifies (no teach-only)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Cupper'));
  doc.id = 'cup-kid';
  doc.subjects = { ...doc.subjects, little: true };
  doc.little = { xp: 20, skills: { ...skilled('count', 1, 5), ...skilled('look', 1, 5) }, revealed: [] };
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.little-tile');
  await page.evaluate(() => { location.hash = '#/little?game=bond&v=cup'; });
  await page.waitForSelector('.li.cup');
  for (let q = 0; q < 5; q++) {
    await page.tap('.little-card[data-good="1"]');
    await expect(page.locator('.paw.done')).toHaveCount(q + 1);
    if (q < 4) await page.waitForTimeout(1100);
  }
  await page.waitForSelector('[data-again]');
  const saved = await page.evaluate(byId, 'cup-kid');
  const bonds = Object.entries(saved.little.skills).filter(([k]) => k.startsWith('bond5:'));
  expect(bonds.length).toBeGreaterThan(0);
  expect(bonds.some(([, v]) => v.streak > 0)).toBe(true); // cup verifies, not teach-only
});

test('e2e: Surprise! unlocks at 3 revealed games and samples across them', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Boxy'));
  doc.id = 'box-kid';
  doc.subjects = { ...doc.subjects, little: true };
  doc.little = {
    xp: 30,
    skills: { ...skilled('count', 1, 5), ...skilled('find', 1, 5) },
    revealed: ['tile:count', 'tile:find', 'tile:more'],
  };
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.little-tile');
  await expect(page.locator('[data-game="surprise"]')).toBeVisible();
  await page.evaluate(() => { location.hash = '#/little?game=surprise&v=frame'; }); // classic skins; barks have their own spec
  await page.waitForSelector('.little-card');
  const POOL = ['count', 'find', 'more', 'next', 'add', 'look', 'bond', 'teen', 'taway'];
  const seenGames = new Set();
  for (let q = 0; q < 5; q++) {
    const g = await page.evaluate(() => document.querySelector('.little-stage').dataset.game);
    seenGames.add(g);
    if (g === 'look') await expect(page.locator('.look-veil')).toBeVisible({ timeout: 3000 }); // input opens after the flash
    await page.tap('.little-card[data-good="1"]');
    await expect(page.locator('.paw.done')).toHaveCount(q + 1);
    if (q < 4) await page.waitForTimeout(1100);
  }
  await page.waitForSelector('[data-again]');
  expect([...seenGames].every((x) => POOL.includes(x))).toBe(true); // ratcheting may add look etc.
  const saved = await page.evaluate(byId, 'box-kid');
  expect(Object.values(saved.little.skills).reduce((s, v) => s + v.attempts, 0)).toBeGreaterThan(30);
});
