// THE preservation gate (see CLAUDE.md): old-schema profiles must survive
// every update with zero progress loss.
import { test, expect } from '@playwright/test';
import { seedProfile, readProfile, selectProfile, playQuestions, norm, stat, openTableGrid } from './helpers.mjs';
import { migrateProfile, mergeProfiles, SCHEMA_VERSION } from '../src/data/schema.js';

function v1Doc(id, name) {
  const facts = {};
  for (let b = 0; b <= 12; b++) facts[norm(2, b)] = stat(3);
  facts['7x8'] = stat(1, { attempts: 3, correct: 1 });
  return {
    id,
    schemaVersion: 1,
    name,
    avatarDogId: 'starter',
    createdAt: Date.now() - 30 * 86400e3,
    facts,
    unlocks: [
      { dogId: 'starter', table: null, at: Date.now() - 30 * 86400e3 },
      { dogId: 'dog-2', table: 2, at: Date.now() - 86400e3 },
    ],
  };
}

test('v1 profile loads, plays, and upgrades without losing anything', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await seedProfile(page, v1Doc('mig-v1', 'MigV1'));
  await selectProfile(page, 'MigV1');

  // Mastered ×2 star still visible from v1 data
  await openTableGrid(page);
  await expect(page.locator('.table-grid .table-btn:nth-child(2)')).toContainText('⭐');

  // Play (forces a save → persists the migration)
  await page.tap('.table-grid .table-btn:nth-child(2)');
  await playQuestions(page, 12);
  await page.waitForSelector('.big-score');

  const doc = await readProfile(page, 'mig-v1');
  expect(doc.schemaVersion).toBe(SCHEMA_VERSION);
  expect(doc.play).toBeDefined();
  expect(doc.updatedAt).toBeGreaterThan(0);
  // Nothing lost: the struggling fact and both unlocks are intact
  expect(doc.facts['7x8'].attempts).toBeGreaterThanOrEqual(3);
  expect(doc.unlocks.map((u) => u.dogId)).toEqual(
    expect.arrayContaining(['starter', 'dog-2'])
  );
  expect(doc.name).toBe('MigV1');
});

test('migrateProfile upgrades v1 and v2 docs additively', () => {
  const v1 = migrateProfile(v1Doc('x', 'X'));
  expect(v1.schemaVersion).toBe(SCHEMA_VERSION);
  expect(v1.play).toEqual({});
  expect(v1.updatedAt).toBeGreaterThan(0);
  expect(Object.keys(v1.facts)).toHaveLength(14);

  const v2 = migrateProfile({
    ...v1Doc('y', 'Y'),
    schemaVersion: 2,
    play: { 'dog-2': { walk: 3, feed: 1, fetch: 0 } },
  });
  expect(v2.schemaVersion).toBe(SCHEMA_VERSION);
  expect(v2.play['dog-2'].walk).toBe(3);
});

test('mergeProfiles never loses progress from either side', () => {
  const base = migrateProfile(v1Doc('m', 'M'));
  const deviceA = structuredClone(base);
  const deviceB = structuredClone(base);

  deviceA.facts['3x3'] = stat(2, { attempts: 4, correct: 4 });
  deviceA.play = { starter: { walk: 5, feed: 0, fetch: 0 } };
  deviceA.updatedAt = Date.now() - 1000;

  deviceB.facts['7x8'] = stat(2, { attempts: 9, correct: 6 }); // richer than base
  deviceB.unlocks.push({ dogId: 'dog-7', table: 7, at: Date.now() });
  deviceB.play = { starter: { walk: 2, feed: 3, fetch: 0 } };
  deviceB.avatarDogId = 'dog-2';
  deviceB.updatedAt = Date.now();

  const merged = mergeProfiles(deviceA, deviceB);
  expect(merged.facts['3x3'].box).toBe(2); // A's new fact kept
  expect(merged.facts['7x8'].attempts).toBe(9); // B's richer stat wins
  expect(merged.unlocks.map((u) => u.dogId)).toEqual(
    expect.arrayContaining(['starter', 'dog-2', 'dog-7'])
  );
  expect(merged.play.starter).toEqual({ walk: 5, feed: 3, fetch: 0, groom: 0 }); // per-kind max
  expect(merged.avatarDogId).toBe('dog-2'); // newer doc's identity fields
  expect(merged.schemaVersion).toBe(SCHEMA_VERSION);
});
