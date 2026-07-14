// Schema v12 + full parent visibility controls: subject switches, table
// limits, sitting hide, and the child's own home-hopping button.
import { test, expect } from '@playwright/test';
import { newProfile, migrateProfile, mergeProfiles, SCHEMA_VERSION, SUBJECT_DEFAULTS } from '../src/data/schema.js';
import { seedProfile, selectProfile, holdGrownupsGate, norm, stat, uniqueName } from './helpers.mjs';

test('migration v11→v12: subject defaults land, little kept, addition/petUnlocks added', () => {
  const old = { ...newProfile('Old'), schemaVersion: 11, subjects: { little: true } };
  delete old.addition;
  delete old.petUnlocks;
  const doc = migrateProfile(old);
  expect(doc.schemaVersion).toBe(SCHEMA_VERSION);
  expect(doc.subjects).toEqual({ ...SUBJECT_DEFAULTS, little: true });
  expect(doc.addition).toEqual({});
  expect(doc.petUnlocks).toEqual([]);
});

test('merge: addition richer-wins, petUnlocks union with earliest adoption', () => {
  const a = newProfile('A');
  const b = { ...newProfile('A'), id: a.id };
  a.addition['3+4'] = { attempts: 9, correct: 8, avgMs: 2000, box: 3, lastSeen: 5 };
  b.addition['3+4'] = { attempts: 2, correct: 1, avgMs: 4000, box: 1, lastSeen: 9 };
  a.petUnlocks = [{ petId: 'cat-1', milestone: 'doubles', at: 100 }];
  b.petUnlocks = [
    { petId: 'cat-1', milestone: 'doubles', at: 50 },
    { petId: 'bird-1', milestone: 'bonds10', at: 70 },
  ];
  const m = mergeProfiles(a, b);
  expect(m.addition['3+4'].attempts).toBe(9);
  expect(m.petUnlocks).toHaveLength(2);
  expect(m.petUnlocks.find((u) => u.petId === 'cat-1').at).toBe(50);
});

test('e2e: parent controls — hide sitting, limit tables; version in the footer', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile('Controlled');
  doc.id = 'subj-kid';
  for (let b = 0; b <= 12; b++) {
    doc.facts[norm(2, b)] = stat(5);
    doc.facts[norm(10, b)] = stat(4);
    doc.facts[norm(3, b)] = stat(2);
  }
  await seedProfile(page, doc);
  await selectProfile(page, 'Controlled');
  await page.waitForSelector('.sitting-card');

  await page.tap('[data-nav="/grownups"]');
  await holdGrownupsGate(page);
  await expect(page.locator('.screen')).toContainText(/Compounded v\d+\.\d+\.\d+/);
  await page.tap('[data-subj="hideSitting"]');
  // no limit set = all chips lit; tapping ×2 starts a limit of just ×2
  await page.tap('.limit-chip:nth-child(2)');
  await page.tap('[data-back]');
  await expect(page.locator('.sitting-card')).toHaveCount(0);
  await expect(page.locator('.table-grid .table-btn')).toHaveCount(1);

  await page.reload({ waitUntil: 'networkidle' }); // settings persist
  await expect(page.locator('.sitting-card')).toHaveCount(0);
});

test('e2e: childCanSwitch lets a little kid hop to the big home and back', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Hopper'));
  doc.id = 'hop-kid';
  doc.subjects = { ...doc.subjects, little: true, childCanSwitch: true };
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);

  await page.waitForSelector('.little-tile');
  await page.tap('[data-big-view]');
  await page.waitForSelector('.table-grid, .hero h1');
  await expect(page.locator('[data-little-view]')).toBeVisible();
  await page.tap('[data-little-view]');
  await page.waitForSelector('.little-tile');
});
