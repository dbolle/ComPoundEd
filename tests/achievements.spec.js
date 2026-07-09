// Achievements: laddered awards with quick wins early and always a next goal.
import { test, expect } from '@playwright/test';
import {
  CATALOG,
  checkAchievements,
  nextUp,
  bumpAnswer,
  bumpRound,
  bumpActivity,
} from '../src/engine/achievements.js';
import { newProfile, migrateProfile, mergeProfiles, SCHEMA_VERSION } from '../src/data/schema.js';
import { createProfileUI, playQuestions, uniqueName, norm, stat, openTableGrid } from './helpers.mjs';

test('catalog integrity: unique ids, valid ladder shape', () => {
  const ids = CATALOG.map((a) => a.id);
  expect(new Set(ids).size).toBe(CATALOG.length);
  const p = newProfile('X');
  for (const a of CATALOG) {
    expect(a.target).toBeGreaterThan(0);
    expect(typeof a.value(p)).toBe('number'); // every value fn works on a fresh profile
  }
});

test('quick wins land in the first session; checks are idempotent', () => {
  const p = newProfile('Quick');
  // One round: 10 answers, one fast, one comeback, perfect... not perfect (one miss then comeback)
  bumpAnswer(p, { correct: true, fast: true, comeback: false });
  bumpAnswer(p, { correct: false, fast: false, comeback: false });
  bumpAnswer(p, { correct: true, fast: false, comeback: true });
  bumpRound(p, { perfect: false, durationMs: 90000 });
  const first = checkAchievements(p);
  expect(first.map((a) => a.id)).toEqual(
    expect.arrayContaining(['round-1', 'flash-1', 'comeback-1'])
  );
  expect(checkAchievements(p)).toEqual([]); // nothing double-earned
});

test('ladders always leave something soon: nextUp shows progress', () => {
  const p = newProfile('Ladder');
  for (let i = 0; i < 4; i++) bumpAnswer(p, { correct: true, fast: false, comeback: false });
  checkAchievements(p);
  const up = nextUp(p, 3);
  expect(up.length).toBe(3);
  // 4-streak → streak-5 should be the nearest goal (4/5)
  expect(up[0].id).toBe('streak-5');
  expect(up[0].current).toBe(4);
});

test('speed-run awards use the fastest perfect round', () => {
  const p = newProfile('Fast');
  bumpRound(p, { perfect: true, durationMs: 55000 });
  const newly = checkAchievements(p).map((a) => a.id);
  expect(newly).toContain('speed-60');
  expect(newly).not.toContain('speed-40');
  bumpRound(p, { perfect: true, durationMs: 39000 });
  expect(checkAchievements(p).map((a) => a.id)).toContain('speed-40');
});

test('migration v5→v6 adds achievements + stats; merge keeps the best of both', () => {
  const doc = migrateProfile({
    id: 'v5',
    schemaVersion: 5,
    name: 'V5',
    avatarDogId: 'starter',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    facts: { '2x3': stat(4) },
    division: {},
    unlocks: [{ dogId: 'starter', table: null, at: Date.now() }],
    play: {},
    speed: { avgMs: 0, samples: 0 },
  });
  expect(doc.schemaVersion).toBe(SCHEMA_VERSION);
  expect(doc.achievements).toEqual({});
  expect(doc.stats.rounds).toBe(0);

  const a = newProfile('A');
  const b = structuredClone(a);
  a.achievements = { 'round-1': 100 };
  a.stats.rounds = 7;
  a.stats.fastestPerfectMs = 52000;
  b.achievements = { 'round-1': 50, 'flash-1': 200 };
  b.stats.bestStreak = 12;
  b.stats.fastestPerfectMs = 61000;
  const m = mergeProfiles(a, b);
  expect(m.achievements['round-1']).toBe(50); // earliest earn date
  expect(m.achievements['flash-1']).toBe(200);
  expect(m.stats.rounds).toBe(7);
  expect(m.stats.bestStreak).toBe(12);
  expect(m.stats.fastestPerfectMs).toBe(52000);
});

test('e2e: first round earns quick wins, awards screen shows them + next up', async ({ page }) => {
  await createProfileUI(page, uniqueName('Award'));
  await openTableGrid(page);
  await page.tap('.table-grid .table-btn:nth-child(2)');
  await playQuestions(page, 12);
  await page.waitForSelector('.big-score');

  // Award reveal on results
  const reveal = page.locator('.award-reveal');
  await expect(reveal).toBeVisible();
  await expect(reveal).toContainText('First Fetch');

  // Awards screen: earned + next-up with progress meters
  await page.tap('[data-home]');
  await page.waitForSelector('[data-nav="/awards"]');
  await page.tap('[data-nav="/awards"]');
  await page.waitForSelector('.award-grid');
  await expect(page.locator('.award-card:not(.locked)', { hasText: 'First Fetch' })).toBeVisible();
  expect(await page.$$eval('.award-card.locked', (els) => els.length)).toBeGreaterThan(20);
  await expect(page.locator('.next-up .next-card').first()).toBeVisible();
});

test('e2e: pet play earns the Playtime award', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await createProfileUI(page, uniqueName('Care'));
  await page.tap('[data-nav="/pack"]');
  await page.tap('.dog-card:has-text("Biscuit")');
  await page.waitForSelector('.dog-hero');
  await page.tap('[data-act="walk"]');
  await page.waitForSelector('.activity-scene');
  await playQuestions(page, 7);
  await page.waitForSelector('[data-again]');
  await expect(page.locator('.badge', { hasText: 'Playtime' })).toBeVisible();
});
