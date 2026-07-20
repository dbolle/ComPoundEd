// Play date: one tap from the dog page starts an auto-picked group
// training round — needs-practice friends first, 6 facts per dog.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { trainingPartnersFor } from '../src/engine/suggest.js';
import { seedProfile, selectProfile, playQuestions, norm, stat, uniqueName } from './helpers.mjs';

test('partners rank needs-practice first, weakest table leading', () => {
  const p = newProfile('Rank');
  for (let b = 0; b <= 12; b++) {
    p.facts[norm(2, b)] = stat(4); // mastered fresh
    p.facts[norm(7, b)] = stat(1); // weak
    p.facts[norm(3, b)] = stat(2); // weaker-ish but higher points than 7
  }
  p.unlocks.push(
    { dogId: 'dog-2', table: 2, at: 1 },
    { dogId: 'dog-3', table: 3, at: 2 },
    { dogId: 'dog-7', table: 7, at: 3 }
  );
  const picks = trainingPartnersFor(p, 'starter', 3);
  expect(picks.map((d) => d.id)).toEqual(['dog-7', 'dog-3', 'dog-2']);
  expect(trainingPartnersFor(p, 'dog-7', 3).map((d) => d.id)).toEqual(['dog-3', 'dog-2']);
});

test('e2e: play date from the dog page runs 6 facts per dog and earns train credit', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Dates'));
  doc.id = 'date-kid';
  for (let b = 0; b <= 12; b++) {
    doc.facts[norm(2, b)] = stat(4);
    doc.facts[norm(7, b)] = stat(1);
  }
  doc.unlocks.push({ dogId: 'dog-2', table: 2, at: 1 }, { dogId: 'dog-7', table: 7, at: 2 });
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.hero');
  await page.evaluate(() => { location.hash = '#/dog?id=dog-2'; });
  await page.waitForSelector('[data-playdate]');
  await expect(page.locator('[data-playdate]')).toContainText('Scout'); // weakest first in the invite
  await page.tap('[data-playdate]');
  await page.waitForSelector('.activity-scene');
  // party = dog-2 + Scout (starter has no table, so isn't invited):
  // 6 facts per dog → 12 questions
  const seen = await playQuestions(page, 30);
  expect(seen.length).toBe(12);
  await page.waitForSelector('[data-again]');
  const saved = await page.evaluate(
    (id) => new Promise((res) => {
      const req = indexedDB.open('compounded', 1);
      req.onsuccess = () => {
        const g = req.result.transaction('profiles').objectStore('profiles').get(id);
        g.onsuccess = () => res(g.result);
      };
    }),
    'date-kid'
  );
  expect(saved.play['dog-2'].train).toBe(1);
});
