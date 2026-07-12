// Wardrobe Phase 2: accessory color ladders, worn-state choices gated behind
// a completed grooming bath, and Biscuit's board-wide spa day.
import { test, expect } from '@playwright/test';
import {
  getDog,
  accessoryColorsFor,
  wornFor,
  dogSVG,
} from '../src/art/dogs.js';
import { buildGroomRound } from '../src/engine/selector.js';
import { newProfile, migrateProfile, mergeProfiles, SCHEMA_VERSION } from '../src/data/schema.js';
import { seedProfile, selectProfile, playQuestions, readProfile, norm, stat } from './helpers.mjs';

test('color ladders unlock on scaled counters; wornFor honors choices', () => {
  const p = newProfile('W');
  p.play.d = { walk: 55, feed: 9, fetch: 12 };
  expect(accessoryColorsFor(p, 'd', 'bandana')).toEqual(['red', 'blue', 'green']);
  expect(accessoryColorsFor(p, 'd', 'bow')).toEqual([]); // 9 meals: not yet
  expect(accessoryColorsFor(p, 'd', 'cap')).toEqual(['blue']);

  // Defaults: earned gear in first color
  let worn = wornFor(p, 'd');
  expect(worn).toContainEqual({ id: 'bandana', color: 'red' });
  expect(worn).toContainEqual({ id: 'cap', color: 'blue' });
  expect(worn).toContain('star'); // 76 total plays

  // Choices: color swap, explicit none, locked color falls back
  p.wear = { d: { bandana: 'green', cap: 'none', star: 'none' } };
  worn = wornFor(p, 'd');
  expect(worn).toContainEqual({ id: 'bandana', color: 'green' });
  expect(worn.find((e) => e?.id === 'cap')).toBeUndefined();
  expect(worn).not.toContain('star');
  p.wear.d.bandana = 'gold'; // not unlocked at 55 walks
  expect(wornFor(p, 'd')).toContainEqual({ id: 'bandana', color: 'red' });

  // The SVG carries the chosen color
  const svg = dogSVG(getDog('dog-2'), 96, [{ id: 'bandana', color: 'green' }]);
  expect(svg).toContain('data-acc="bandana"');
  expect(svg).toContain('data-color="green"');
});

test('schema v9: wear migrates in and merges newer-wins', () => {
  const doc = migrateProfile({
    id: 'v8', schemaVersion: 8, name: 'V8', avatarDogId: 'starter',
    createdAt: Date.now(), updatedAt: Date.now(),
    facts: {}, division: {}, unlocks: [{ dogId: 'starter', table: null, at: Date.now() }],
    play: {}, speed: { avgMs: 0, samples: 0 }, subjects: { little: false },
    little: { xp: 0 }, achievements: {}, stats: {},
  });
  expect(doc.schemaVersion).toBe(SCHEMA_VERSION);
  expect(doc.wear).toEqual({});

  const a = newProfile('A');
  const b = structuredClone(a);
  a.wear = { d1: { bandana: 'red' }, d2: { cap: 'none' } };
  a.updatedAt = Date.now() - 1000;
  b.wear = { d1: { bandana: 'blue' } };
  b.updatedAt = Date.now();
  const m = mergeProfiles(a, b);
  expect(m.wear.d1).toEqual({ bandana: 'blue' }); // newer choice wins
  expect(m.wear.d2).toEqual({ cap: 'none' }); // older-only entries survive
});

test("Biscuit's spa: 13 rustiest facts board-wide, padded when sparse", () => {
  const p = newProfile('Spa');
  const DAY = 86400e3;
  for (let b = 0; b <= 12; b++) p.facts[norm(2, b)] = stat(4, { ageMs: 3600e3 });
  for (let b = 0; b <= 12; b++) p.facts[norm(7, b)] = stat(4, { ageMs: 30 * DAY });
  const round = buildGroomRound(p, getDog('starter'));
  expect(round).toHaveLength(13);
  expect(round.every((q) => q.kind === 'mult')).toBe(true);
  // The overdue ×7 family leads
  expect(round.slice(0, 10).every((q) => q.a === 7 || q.b === 7)).toBe(true);

  // Sparse profile: pads with fresh facts, still a full spa
  const young = newProfile('Young');
  young.facts[norm(2, 3)] = stat(1, { ageMs: 5 * DAY });
  const pad = buildGroomRound(young, getDog('starter'));
  expect(pad).toHaveLength(13);
  expect(norm(pad[0].a, pad[0].b)).toBe('2x3'); // the one rusty fact first
});

test('e2e: groom grants the dress-up pass; wardrobe changes the dog', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile('Dresser');
  doc.id = 'dress-kid';
  for (let b = 0; b <= 12; b++) doc.facts[norm(2, b)] = stat(4, { ageMs: 3600e3 });
  doc.unlocks.push({ dogId: 'dog-2', table: 2, at: Date.now() });
  doc.play['dog-2'] = { walk: 30, feed: 12, fetch: 3 }; // red+blue bandana, pink bow
  await seedProfile(page, doc);
  await selectProfile(page, 'Dresser');

  // No pass yet: wardrobe redirects, dog page shows the groom hint
  await page.goto('/#/wardrobe?id=dog-2');
  await page.waitForSelector('.dog-hero');
  expect(await page.$('.wardrobe-rows')).toBeNull();
  await expect(page.locator('.groom-hint')).toContainText('Groom to change outfits');

  // Bath (all fresh → quick clean run) earns the pass
  await page.tap('[data-act="groom"]');
  await page.waitForSelector('.activity-scene');
  await playQuestions(page, 15);
  await page.waitForSelector('[data-dress]');
  await page.tap('[data-dress]');
  await page.waitForSelector('.wardrobe-rows');

  // Swap the bandana to blue → preview + persisted state update
  await page.tap('.swatch[data-acc="bandana"][data-val="blue"]');
  await expect(page.locator('[data-preview] [data-acc="bandana"]')).toHaveAttribute(
    'data-color',
    'blue'
  );
  // Take the bow off entirely
  await page.tap('.swatch[data-acc="bow"][data-val="none"]');
  await expect(page.locator('[data-preview] [data-acc="bow"]')).toHaveCount(0);
  const saved = await readProfile(page, 'dress-kid');
  expect(saved.wear['dog-2']).toEqual({ bandana: 'blue', bow: 'none' });

  // The choice shows everywhere (dog page render)
  await page.tap('[data-back]');
  await page.waitForSelector('.dog-hero');
  await expect(page.locator('.dog-hero [data-acc="bandana"]')).toHaveAttribute(
    'data-color',
    'blue'
  );
});
