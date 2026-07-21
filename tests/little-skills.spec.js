// L2 mastery engine: per-number skills from first-try streaks, adaptive
// 5→7→10 range replacing the xp cliff, guided recount on misses.
import { test, expect } from '@playwright/test';
import { newProfile, migrateProfile, mergeProfiles, SCHEMA_VERSION } from '../src/data/schema.js';
import { rangeFor } from '../src/screens/little.js';
import { uniqueName } from './helpers.mjs';

const profileByName = (page, name) =>
  page.evaluate(
    (pname) =>
      new Promise((resolve) => {
        const req = indexedDB.open('compounded', 1);
        req.onsuccess = () => {
          const g = req.result.transaction('profiles').objectStore('profiles').getAll();
          g.onsuccess = () => resolve(g.result.find((x) => x.name === pname) ?? null);
        };
      }),
    name
  );

const skilled = (games, lo, hi, streak = 3) => {
  const skills = {};
  for (const g of games) for (let n = lo; n <= hi; n++) skills[`${g}:${n}`] = { attempts: streak, streak };
  return skills;
};

test('migration v10→v11 adds empty skills; xp untouched (range re-derives)', () => {
  const old = { ...newProfile('Old'), schemaVersion: 10 };
  old.little = { xp: 80 };
  const doc = migrateProfile(old);
  expect(doc.schemaVersion).toBe(SCHEMA_VERSION);
  expect(doc.little).toEqual({ xp: 80, skills: {}, revealed: [] });
  // high xp no longer unlocks big numbers by itself
  expect(rangeFor(doc, 'count')).toBe(5);
});

test('range grows 5→7→10 only as bands are known; each game has its own track', () => {
  const p = newProfile('Bandy');
  expect(rangeFor(p, 'count')).toBe(5);
  p.little.skills = skilled(['count'], 1, 5);
  expect(rangeFor(p, 'count')).toBe(7);
  expect(rangeFor(p, 'find')).toBe(5); // find hasn't proven anything yet
  p.little.skills = { ...p.little.skills, ...skilled(['count'], 6, 7) };
  expect(rangeFor(p, 'count')).toBe(10);
  // a streak of 2 is not knowing
  p.little.skills['count:3'].streak = 2;
  expect(rangeFor(p, 'count')).toBe(5);
});

test('skills merge richer-wins; no evidence lost from either device', () => {
  const a = newProfile('A');
  const b = { ...a };
  a.little = { xp: 10, skills: { 'count:3': { attempts: 6, streak: 3 } } };
  b.little = { xp: 4, skills: { 'count:3': { attempts: 2, streak: 1 }, 'find:2': { attempts: 4, streak: 2 } } };
  const m = mergeProfiles(a, b);
  expect(m.little.xp).toBe(10);
  expect(m.little.skills['count:3']).toEqual({ attempts: 6, streak: 3 });
  expect(m.little.skills['find:2']).toEqual({ attempts: 4, streak: 2 });
});

test('e2e: first-try corrects build streaks; a wrong answer resets the number', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.tap('[data-new]');
  const name = uniqueName('Streak');
  await page.fill('.name-input', name);
  await page.tap('form[data-create] [data-kind="little"]');
  await page.waitForSelector('.little-tile');
  await page.evaluate(() => { location.hash = '#/little?game=count'; });
  await page.waitForSelector('.little-card');

  for (let q = 0; q < 5; q++) {
    await page.tap('.little-card[data-good="1"]');
    await expect(page.locator('.paw.done')).toHaveCount(q + 1);
    if (q < 4) await page.waitForTimeout(1100);
  }
  await page.waitForSelector('[data-again]');
  const doc = await profileByName(page, name);
  const skills = Object.entries(doc.little.skills).filter(([k]) => k.startsWith('count:'));
  expect(skills.length).toBeGreaterThan(0);
  const total = skills.reduce((s, [, v]) => s + v.attempts, 0);
  expect(total).toBe(5);
  for (const [, v] of skills) expect(v.streak).toBeGreaterThanOrEqual(1);
});

test('e2e: a miss triggers the guided recount, then hands the question back', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.tap('[data-new]');
  const name = uniqueName('Counter');
  await page.fill('.name-input', name);
  await page.tap('form[data-create] [data-kind="little"]');
  await page.waitForSelector('.little-tile');
  await page.evaluate(() => { location.hash = '#/little?game=count'; });
  await page.waitForSelector('.little-card');

  // Miss every question once: each miss must recount, block input, then
  // hand the question back — and none of these numbers may end on a streak.
  for (let q = 0; q < 5; q++) {
    await page.tap('.little-card[data-good="0"]');
    await expect(page.locator('.li.pulse').first()).toBeVisible({ timeout: 3000 });
    if (q === 0) {
      await page.tap('.little-card[data-good="1"]'); // ignored while counting
      await expect(page.locator('.paw.done')).toHaveCount(0);
    }
    await expect(page.locator('.li.pulse')).toHaveCount(0, { timeout: 10000 });
    await page.tap('.little-card[data-good="1"]');
    await expect(page.locator('.paw.done')).toHaveCount(q + 1);
    if (q < 4) await page.waitForTimeout(1100);
  }
  await page.waitForSelector('[data-again]');
  const doc = await profileByName(page, name);
  const skills = Object.entries(doc.little.skills).filter(([k]) => k.startsWith('count:'));
  expect(skills.reduce((s, [, v]) => s + v.attempts, 0)).toBe(5);
  for (const [, v] of skills) expect(v.streak).toBe(0); // never first-try
  expect(doc.little.xp).toBe(0); // xp is first-try only, same as before
});
