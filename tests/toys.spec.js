// v1.29.0: toy surfaces — dog-page shelf, activity scenes, pack toy box —
// plus the 10–15¢ micro toys seeded for little-pup savings.
// v1.31.0: Cozy Corner pets receive toys too (corner shelves, little-home
// buddy, game-host art) and wear their gifted gear.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { TOYS } from '../src/art/gear.js';
import { buyGear, toysOn, boxedToys, placeGear } from '../src/engine/gearshop.js';
import { seedProfile, selectProfile, uniqueName, norm, stat } from './helpers.mjs';

test('micro toys: six of them, 10–15¢, valid art; helpers track box vs pup', () => {
  const micro = TOYS.filter((t) => t.price <= 15);
  expect(micro.length).toBe(6);
  for (const t of micro) expect(t.price % 5).toBe(0);

  const p = newProfile('Boxy');
  p.pawBucks.txns.push({ id: 's', at: Date.now(), cents: 100, denom: 'buck', count: 1, reason: 'sitting' });
  buyGear(p, 'mouse');
  buyGear(p, 'bell');
  expect(boxedToys(p).sort()).toEqual(['bell', 'mouse']);
  expect(placeGear(p, 'mouse', 'dog-2')).toBe(true);
  expect(toysOn(p, 'dog-2')).toEqual(['mouse']);
  expect(boxedToys(p)).toEqual(['bell']);
  placeGear(p, 'mouse', null);
  expect(boxedToys(p).sort()).toEqual(['bell', 'mouse']);
});

test('e2e: box on pack → hand out on the dog page → toy joins the walk scene', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Toys'));
  doc.id = 'toys-kid';
  doc.subjects = { ...doc.subjects, tables: true };
  for (let b = 0; b <= 12; b++) doc.facts[norm(2, b)] = stat(1);
  doc.unlocks.push({ dogId: 'dog-2', table: 2, at: 1 });
  doc.pawBucks.txns.push({ id: 's', at: Date.now(), cents: 100, denom: 'buck', count: 1, reason: 'sitting' });
  buyGear(doc, 'mouse');
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.hero');

  await page.evaluate(() => { location.hash = '#/pack'; });
  await expect(page.locator('.toybox-card')).toContainText('Toy box');
  await expect(page.locator('.toybox-card svg[data-toy="mouse"]')).toBeVisible();

  await page.evaluate(() => { location.hash = '#/dog?id=dog-2'; });
  await page.waitForSelector('[data-toy-give="mouse"]');
  await page.tap('[data-toy-give="mouse"]');
  await expect(page.locator('[data-toy-back="mouse"]')).toBeVisible();

  await page.tap('[data-act="walk"]');
  await page.waitForSelector('.activity-scene');
  await expect(page.locator('.scene-toys svg[data-toy="mouse"]')).toBeVisible();
});

test('placements are wearer-agnostic: pets hold toys like dogs do', () => {
  const p = newProfile('Petty');
  p.pawBucks.txns.push({ id: 's', at: Date.now(), cents: 100, denom: 'buck', count: 1, reason: 'sitting' });
  buyGear(p, 'bell');
  expect(placeGear(p, 'bell', 'cat-1')).toBe(true);
  expect(toysOn(p, 'cat-1')).toEqual(['bell']);
  expect(boxedToys(p)).toEqual([]);
  placeGear(p, 'bell', null);
  expect(boxedToys(p)).toEqual(['bell']);
});

test('e2e: a little gives the mouse to a pet — corner shelf, home buddy, game host', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('LittleToy'));
  doc.id = 'little-toy-kid';
  doc.subjects = { ...doc.subjects, little: true };
  doc.petUnlocks.push({ petId: 'cat-1', milestone: 'test', at: 1 });
  doc.avatarPetId = 'cat-1';
  doc.pawBucks.txns.push({ id: 's', at: Date.now(), cents: 200, denom: 'buck', count: 2, reason: 'sitting' });
  expect(buyGear(doc, 'mouse')).toBeTruthy();
  expect(buyGear(doc, 'bowtie', 'cat-1')).toBeTruthy(); // gifted gear renders ON the pet
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.little-hero');

  // Cozy Corner: box row shows the waiting mouse; the adopted pet card
  // offers a give chip and wears the gifted bowtie
  await page.evaluate(() => { location.hash = '#/corner'; });
  await page.waitForSelector('.toybox-card');
  await expect(page.locator('.toybox-card svg[data-toy="mouse"]')).toBeVisible();
  const petCard = page.locator('.dog-card:not(.locked)', { hasText: 'Whiskers' });
  await expect(petCard.locator('svg [data-acc="bowtie"]').first()).toBeVisible();
  await petCard.locator('[data-toy-give="mouse"]').tap();
  await expect(petCard.locator('[data-toy-back="mouse"]')).toBeVisible();
  await expect(page.locator('.toybox-card')).toHaveCount(0); // box emptied

  // Little home: the buddy keeps their mouse next to them
  await page.evaluate(() => { location.hash = '#/home'; });
  await page.waitForSelector('.little-hero');
  await expect(page.locator('.buddy-toys svg[data-toy="mouse"]')).toBeVisible();

  // Game stage: the pet hosts with their toy beside them
  await page.evaluate(() => { location.hash = '#/little?game=shape'; });
  await page.waitForSelector('.little-stage');
  await expect(page.locator('.host-spot svg[data-toy="mouse"], .little-prompt svg[data-toy="mouse"]').first()).toBeVisible();
});
