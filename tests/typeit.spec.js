// v1.19.0: Type it! (the numpad bridge) + Adding/Taking Away trail tiles.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { addingReady } from '../src/engine/readiness.js';
import { MILESTONES } from '../src/engine/cozy.js';
import { waveFacts } from '../src/engine/waves.js';
import { normAddKey } from '../src/engine/leitner.js';
import { seedProfile, selectProfile, uniqueName, stat } from './helpers.mjs';

const skilled = (game, lo, hi, streak = 3) => {
  const s = {};
  for (let n = lo; n <= hi; n++) s[`${game}:${n}`] = { attempts: streak, streak };
  return s;
};

test('type milestone appended last; adding readiness needs typing', () => {
  expect(MILESTONES[MILESTONES.length - 1].id).toBe('type');
  const p = newProfile('R');
  p.little.skills = { ...skilled('count', 1, 10), ...skilled('next', 4, 10) };
  expect(addingReady(p)).toBe(false); // can count on but can't type yet
  p.little.skills = { ...p.little.skills, ...skilled('type', 1, 10) };
  expect(addingReady(p)).toBe(true);
});

test('e2e: Type it! unlocks from Find it!, types a numeral, records skill; wrong retries', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Typer'));
  doc.id = 'typer-kid';
  doc.subjects = { ...doc.subjects, little: true };
  doc.little = { xp: 10, skills: skilled('find', 1, 5), revealed: [] };
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.little-tile');
  await expect(page.locator('[data-game="type"]')).toBeVisible();
  await page.tap('[data-game="type"]');
  await page.waitForSelector('.little-numpad .key');

  for (let q = 0; q < 5; q++) {
    const n = await page.evaluate(() => Number(document.querySelector('.little-stage').dataset.answer));
    if (q === 0) {
      // wrong entry wiggles and retries, never advances
      await page.tap('.little-numpad .key:text-is("0")');
      await page.tap('.little-numpad .key.ok');
      await expect(page.locator('.paw.done')).toHaveCount(0);
    }
    for (const d of String(n)) await page.tap(`.little-numpad .key:text-is("${d}")`);
    await page.tap('.little-numpad .key.ok');
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
    'typer-kid'
  );
  const typed = Object.keys(saved.little.skills).filter((k) => k.startsWith('type:'));
  expect(typed.length).toBeGreaterThan(0);
});

test('e2e: Adding appears as a little trail tile once ready and opens a wave round', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Trail'));
  doc.id = 'trail-kid';
  doc.subjects = { ...doc.subjects, little: true };
  doc.little = {
    xp: 30,
    skills: { ...skilled('count', 1, 10), ...skilled('next', 4, 10), ...skilled('type', 1, 10) },
    revealed: [],
  };
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.little-tile');
  await expect(page.locator('[data-game="adding"]')).toBeVisible();
  await page.tap('[data-game="adding"]');
  await page.waitForSelector('.question');
  await expect(page.locator('.topbar strong')).toContainText('Step Ups');
});
