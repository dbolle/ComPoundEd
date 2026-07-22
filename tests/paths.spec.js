// v1.20.0: Take away! (concrete subtraction), Counting Paths, decades,
// and the full tables-readiness predicate.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { tablesReady } from '../src/engine/readiness.js';
import { waveFacts } from '../src/engine/waves.js';
import { normAddKey } from '../src/engine/leitner.js';
import { seedProfile, selectProfile, uniqueName, stat } from './helpers.mjs';

const skilled = (game, lo, hi, streak = 3) => {
  const s = {};
  for (let n = lo; n <= hi; n++) s[`${game}:${n}`] = { attempts: streak, streak };
  return s;
};

test('tables readiness now requires the counting paths', () => {
  const p = newProfile('Full');
  for (let w = 0; w <= 4; w++) for (const [a, b] of waveFacts(w)) p.addition[normAddKey(a, b)] = stat(3);
  for (let w = 0; w <= 1; w++) for (const [a, b] of waveFacts(w)) p.subtraction[normAddKey(a, b)] = stat(3);
  expect(tablesReady(p)).toBe(false);
  p.little.skills = { 'path:2': { attempts: 3, streak: 3 }, 'path:5': { attempts: 3, streak: 3 }, 'path:10': { attempts: 3, streak: 3 } };
  expect(tablesReady(p)).toBe(true);
});

test('e2e: Take away! shows bones hopping off and records the leftover skill', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Hopper'));
  doc.id = 'hop2-kid';
  doc.subjects = { ...doc.subjects, little: true };
  doc.little = { xp: 20, skills: skilled('add', 2, 5), revealed: [] };
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.little-tile');
  await expect(page.locator('[data-game="taway"]')).toBeVisible();
  await page.tap('[data-game="taway"]');
  await page.waitForSelector('.little-card');
  await expect(page.locator('.li.gone').first()).toBeVisible();
  for (let q = 0; q < 5; q++) {
    await page.tap('.little-card[data-good="1"]');
    await expect(page.locator('.paw.done')).toHaveCount(q + 1);
    if (q < 4) await page.waitForTimeout(1100);
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
    'hop2-kid'
  );
  expect(Object.keys(saved.little.skills).some((k) => k.startsWith('takeaway:'))).toBe(true);
});

test('e2e: Counting Paths unlocks from Doubles; choices before typing is known', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Pather'));
  doc.id = 'path-kid';
  doc.subjects = { ...doc.subjects, little: true };
  for (const [a, b] of waveFacts(1)) doc.addition[normAddKey(a, b)] = stat(3); // Doubles mastered
  doc.little = { xp: 20, skills: {}, revealed: [] };
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.little-tile');
  await expect(page.locator('[data-game="paths"]')).toBeVisible();
  await page.tap('[data-game="paths"]');
  await page.waitForSelector('.path-num');
  await expect(page.locator('.little-card').first()).toBeVisible(); // choices (no typing yet)
  await page.tap('.little-card[data-good="1"]');
  await expect(page.locator('.paw.done')).toHaveCount(1);
});


test('e2e: knowing 1–3 adopts the first friend within days-one play', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('First'));
  doc.id = 'first-kid';
  doc.subjects = { ...doc.subjects, little: true };
  doc.little = { xp: 4, skills: skilled('count', 1, 3), revealed: [] };
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.little-tile');
  // finish any skill round → adoption ceremony fires for count3
  await page.evaluate(() => { location.hash = '#/little?game=count&v=frame'; });
  await page.waitForSelector('.little-card');
  for (let q = 0; q < 5; q++) {
    await page.tap('.little-card[data-good="1"]');
    await expect(page.locator('.paw.done')).toHaveCount(q + 1);
    if (q < 4) await page.waitForTimeout(1100);
  }
  await page.waitForSelector('[data-again]');
  await expect(page.locator('.badge', { hasText: 'New cozy friend' })).toBeVisible();
});