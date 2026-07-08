// Adaptive speed bar: the ⚡ threshold calibrates to each kid's own
// mechanical speed (gimme facts ×0/×1), so "fast" is fair per kid.
import { test, expect } from '@playwright/test';
import {
  recordAnswer,
  fastThresholdMs,
  isCalibrated,
  FAST_MS,
  SLOW_CAP,
} from '../src/engine/leitner.js';
import { newProfile, migrateProfile, mergeProfiles, SCHEMA_VERSION } from '../src/data/schema.js';
import { createProfileUI, holdGrownupsGate, uniqueName, norm, stat } from './helpers.mjs';

test('threshold stays at the default until 5 gimme samples exist', () => {
  const p = newProfile('T');
  expect(fastThresholdMs(p)).toBe(FAST_MS);
  for (let i = 0; i < 4; i++) recordAnswer(p, 1, i + 2, true, 2000);
  expect(isCalibrated(p)).toBe(false);
  expect(fastThresholdMs(p)).toBe(FAST_MS);
  recordAnswer(p, 0, 6, true, 2000);
  expect(isCalibrated(p)).toBe(true);
  expect(fastThresholdMs(p)).toBe(4500); // 2000 * 1.5 + 1500
});

test('quick kids get a real target; slow typists get a fair bar', () => {
  const quick = newProfile('Quick');
  for (let i = 0; i < 5; i++) recordAnswer(quick, 1, i + 2, true, 2000);
  quick.facts[norm(7, 7)] = { attempts: 4, correct: 4, avgMs: 5000, box: SLOW_CAP, lastSeen: 0 };
  recordAnswer(quick, 7, 7, true, 5000); // under old 6s bar, over their 4.5s bar
  expect(quick.facts['7x7'].box).toBe(SLOW_CAP); // no promotion past the cap
  recordAnswer(quick, 7, 7, true, 4000);
  expect(quick.facts['7x7'].box).toBe(SLOW_CAP + 1);

  const slow = newProfile('Slow');
  for (let i = 0; i < 5; i++) recordAnswer(slow, 1, i + 2, true, 6000);
  expect(fastThresholdMs(slow)).toBe(10000); // 6000*1.5+1500 clamped to 10s
  slow.facts[norm(7, 7)] = { attempts: 4, correct: 4, avgMs: 9000, box: SLOW_CAP, lastSeen: 0 };
  recordAnswer(slow, 7, 7, true, 8000); // over the old 6s bar, under theirs
  expect(slow.facts['7x7'].box).toBe(SLOW_CAP + 1);
});

test('only gimme facts calibrate; outliers are ignored', () => {
  const p = newProfile('G');
  recordAnswer(p, 7, 8, true, 2000);
  recordAnswer(p, 6, 9, true, 2000);
  expect(p.speed.samples).toBe(0);
  recordAnswer(p, 1, 5, false, 2000); // wrong gimme: no sample
  expect(p.speed.samples).toBe(0);
  recordAnswer(p, 1, 5, true, 25000); // distracted-kid outlier: no sample
  expect(p.speed.samples).toBe(0);
  recordAnswer(p, 1, 5, true, 3000);
  expect(p.speed.samples).toBe(1);
});

test('older docs migrate additively and merges keep the better calibration', () => {
  const v3 = migrateProfile({
    id: 'v3',
    schemaVersion: 3,
    name: 'V3',
    avatarDogId: 'starter',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    facts: { '2x3': stat(4) },
    unlocks: [{ dogId: 'starter', table: null, at: Date.now() }],
    play: {},
  });
  expect(v3.schemaVersion).toBe(SCHEMA_VERSION);
  expect(v3.speed).toEqual({ avgMs: 0, samples: 0 });

  const a = newProfile('A');
  const b = structuredClone(a);
  for (let i = 0; i < 8; i++) recordAnswer(a, 1, 3, true, 3000);
  for (let i = 0; i < 2; i++) recordAnswer(b, 1, 3, true, 9000);
  expect(mergeProfiles(a, b).speed.samples).toBe(8); // better-calibrated side
});

test('grown-ups shows the fast-answer bar', async ({ page }) => {
  await createProfileUI(page, uniqueName('Bar'));
  await page.tap('[data-nav="/grownups"]');
  await holdGrownupsGate(page);
  const row = page.locator('.stat-row', { hasText: 'Fast-answer bar' });
  await expect(row).toContainText('6.0s');
  await expect(row).toContainText('calibrating');
});
