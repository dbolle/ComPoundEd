// Stacked achievements: one award per family climbing Bronze → Legend, with
// endless scaling for the behavior-shaping counters (comebacks, care, rounds).
import { test, expect } from '@playwright/test';
import {
  FAMILIES,
  TIERS,
  tierInfo,
  tierOf,
  thresholdFor,
  checkAchievements,
  nextUp,
  totalTiers,
  bumpAnswer,
  bumpRound,
  bumpActivity,
} from '../src/engine/achievements.js';
import { newProfile, migrateProfile, mergeProfiles, SCHEMA_VERSION } from '../src/data/schema.js';
import { createProfileUI, playQuestions, uniqueName, norm, stat, openTableGrid } from './helpers.mjs';

test('family integrity: unique ids, ascending thresholds, values work fresh', () => {
  const ids = FAMILIES.map((f) => f.id);
  expect(new Set(ids).size).toBe(FAMILIES.length);
  const p = newProfile('X');
  for (const f of FAMILIES) {
    expect(typeof f.value(p)).toBe('number');
    for (let i = 1; i < f.thresholds.length; i++) {
      expect(f.thresholds[i]).toBeGreaterThan(f.thresholds[i - 1]);
    }
  }
});

test('quick wins land in the first session; checks are idempotent', () => {
  const p = newProfile('Quick');
  bumpAnswer(p, { correct: true, fast: true, comeback: false });
  bumpAnswer(p, { correct: false, fast: false, comeback: false });
  bumpAnswer(p, { correct: true, fast: false, comeback: true });
  bumpRound(p, { perfect: false, durationMs: 90000 });
  const first = checkAchievements(p);
  const byId = Object.fromEntries(first.map((a) => [a.id, a]));
  expect(byId.rounds.tier).toBe(1);
  expect(byId.flash.name).toContain('Bronze');
  expect(byId.comeback.tier).toBe(1);
  expect(checkAchievements(p)).toEqual([]);
});

test('a multi-tier jump reports once, at the new highest tier', () => {
  const p = newProfile('Jump');
  p.stats.comebacks = 60; // crosses 1, 10, and 50 at once
  const newly = checkAchievements(p);
  const cb = newly.find((a) => a.id === 'comeback');
  expect(cb.tier).toBe(3);
  expect(cb.name).toContain('Gold');
  expect(newly.filter((a) => a.id === 'comeback')).toHaveLength(1);
});

test('endless families keep scaling past Legend', () => {
  const streak = FAMILIES.find((f) => f.id === 'streak');
  expect(thresholdFor(streak, 6)).toBe(250); // last named tier
  expect(thresholdFor(streak, 7)).toBe(500); // Legend ×2
  expect(thresholdFor(streak, 8)).toBe(1000);
  expect(tierInfo(7).name).toBe('Legend ×2');

  const p = newProfile('L');
  p.stats.bestStreak = 500;
  expect(tierOf(streak, p)).toBe(7);
  checkAchievements(p);
  // ...and there is STILL a next goal
  const up = nextUp(p, 14).find((a) => a.id === 'streak');
  expect(up.target).toBe(1000);

  // Bounded families end: tables has no tier 6
  const tables = FAMILIES.find((f) => f.id === 'tables');
  expect(thresholdFor(tables, 6)).toBeNull();
});

test('speed tiers are time barriers broken', () => {
  const p = newProfile('Fast');
  const speed = FAMILIES.find((f) => f.id === 'speed');
  bumpRound(p, { perfect: true, durationMs: 55000 });
  expect(tierOf(speed, p)).toBe(2); // beat 90s and 60s
  bumpRound(p, { perfect: true, durationMs: 34000 });
  expect(tierOf(speed, p)).toBe(4); // all barriers
});

test('legacy flat badges migrate to their equivalent tiers', () => {
  const doc = migrateProfile({
    id: 'v7',
    schemaVersion: 7,
    name: 'V7',
    avatarDogId: 'starter',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    facts: { '2x3': stat(4) },
    division: {},
    unlocks: [{ dogId: 'starter', table: null, at: Date.now() }],
    play: {},
    speed: { avgMs: 0, samples: 0 },
    subjects: { little: false },
    little: { xp: 0 },
    stats: {},
    achievements: {
      'round-1': 100,
      'streak-5': 200,
      'streak-25': 300,
      'pack-25': 400,
      'speed-40': 500,
      'facts-90': 600,
    },
  });
  expect(doc.schemaVersion).toBe(SCHEMA_VERSION);
  expect(doc.achievements.rounds).toEqual({ tier: 1, at: 100 });
  expect(doc.achievements.streak).toEqual({ tier: 3, at: 200 }); // highest tier, earliest date
  expect(doc.achievements.pack.tier).toBe(5);
  expect(doc.achievements.speed.tier).toBe(3);
  expect(doc.achievements.facts.tier).toBe(5);
  expect(totalTiers(doc)).toBe(1 + 3 + 5 + 3 + 5);
});

test('merges keep the highest tier and earliest date per family', () => {
  const a = newProfile('A');
  const b = structuredClone(a);
  a.achievements = { streak: { tier: 2, at: 100 } };
  b.achievements = { streak: { tier: 4, at: 300 }, care: { tier: 1, at: 50 } };
  const m = mergeProfiles(a, b);
  expect(m.achievements.streak).toEqual({ tier: 4, at: 100 });
  expect(m.achievements.care.tier).toBe(1);
});

test('e2e: first round reveals Bronze tiers; awards screen shows families', async ({ page }) => {
  await createProfileUI(page, uniqueName('Award'));
  await openTableGrid(page);
  await page.tap('.table-grid .table-btn:nth-child(2)');
  await playQuestions(page, 12);
  await page.waitForSelector('.big-score');

  const reveal = page.locator('.award-reveal');
  await expect(reveal).toBeVisible();
  await expect(reveal).toContainText('Fetcher: Bronze');

  await page.tap('[data-home]');
  await page.waitForSelector('[data-nav="/awards"]');
  await page.tap('[data-nav="/awards"]');
  await page.waitForSelector('.award-grid');
  expect(await page.$$eval('.award-card', (els) => els.length)).toBe(FAMILIES.length);
  await expect(page.locator('.award-card:not(.locked)', { hasText: 'Fetcher' })).toBeVisible();
  await expect(page.locator('.next-up .next-card').first()).toBeVisible();
});

test('e2e: pet play climbs the Best Friend family', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await createProfileUI(page, uniqueName('Care'));
  await page.tap('[data-nav="/pack"]');
  await page.tap('.dog-card:has-text("Biscuit")');
  await page.waitForSelector('.dog-hero');
  await page.tap('[data-act="walk"]');
  await page.waitForSelector('.activity-scene');
  await playQuestions(page, 7);
  await page.waitForSelector('[data-again]');
  await expect(page.locator('.badge', { hasText: 'Best Friend: Bronze' })).toBeVisible();
});
