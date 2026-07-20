// Gear ownership backend: ledger-derived ownership with pinned prices,
// gift binding, placements, and collar training credit.
import { test, expect } from '@playwright/test';
import { newProfile, migrateProfile, mergeProfiles, SCHEMA_VERSION } from '../src/data/schema.js';
import { CATALOG, buyGear, isOwned, ownedGear, placeGear, placementOf, placedOn } from '../src/engine/gearshop.js';
import { balanceCents } from '../src/engine/money.js';
import { COLLAR_COLORS, collarColorsFor, dogSVG, getDog, wornFor } from '../src/art/dogs.js';
import { seedProfile, selectProfile, playQuestions, norm, stat, uniqueName } from './helpers.mjs';

const fund = (p, cents) => {
  p.pawBucks.txns.push({ id: `seed-${cents}`, at: Date.now(), cents, denom: 'buck', count: 1, reason: 'sitting' });
};

test('catalog: every item priced in 5¢ steps with a tier; schema v15 adds placements', () => {
  for (const item of CATALOG) {
    expect(item.price % 5).toBe(0);
    expect(['treasure', 'gift', 'toy']).toContain(item.tier);
  }
  const old = { ...newProfile('Old'), schemaVersion: 14 };
  delete old.gear;
  const doc = migrateProfile(old);
  expect(doc.schemaVersion).toBe(SCHEMA_VERSION);
  expect(doc.gear).toEqual({ placements: {} });
});

test('buying: funds required, deterministic ids, gifts bound per wearer', () => {
  const p = newProfile('Shopper');
  expect(buyGear(p, 'crown')).toBeNull(); // broke
  fund(p, 2000);
  expect(buyGear(p, 'crown').id).toBe('buy-crown');
  expect(buyGear(p, 'crown')).toBeNull(); // one-of-a-kind
  expect(balanceCents(p)).toBe(800);
  expect(buyGear(p, 'sunglasses')).toBeNull(); // gifts need a wearer
  expect(buyGear(p, 'sunglasses', 'dog-3').id).toBe('buy-sunglasses-dog-3');
  expect(buyGear(p, 'sunglasses', 'dog-5').cents).toBe(-200); // second pair OK
  expect(isOwned(p, 'sunglasses', 'dog-3')).toBe(true);
  expect(isOwned(p, 'sunglasses', 'dog-7')).toBe(false);
  expect(ownedGear(p)).toHaveLength(3);
});

test('merges: same purchase on two devices charges once; different buys union', () => {
  const a = newProfile('M');
  const b = { ...newProfile('M'), id: a.id };
  fund(a, 1500);
  fund(b, 1500); // same seed id → union counts it once
  buyGear(a, 'tiara');
  buyGear(b, 'tiara');
  buyGear(b, 'ball');
  const m = mergeProfiles(a, b);
  expect(m.pawBucks.txns.filter((t) => t.id === 'buy-tiara')).toHaveLength(1);
  expect(balanceCents(m)).toBe(1500 - 800 - 25);
});

test('placements: gifts arrive worn and stay bound; treasures move anywhere', () => {
  const p = newProfile('Placer');
  fund(p, 2000);
  buyGear(p, 'scarf', 'dog-2');
  expect(placementOf(p, 'scarf', 'dog-2')).toBe('dog-2'); // arrives worn
  expect(placeGear(p, 'scarf', 'dog-9')).toBe(false); // not dog-9's scarf
  buyGear(p, 'crown');
  expect(placementOf(p, 'crown')).toBeNull(); // treasures start in the closet
  expect(placeGear(p, 'crown', 'cat-3')).toBe(true); // any wearer, pets too
  expect(placeGear(p, 'crown', 'dog-2')).toBe(true); // and it moves
  expect(placedOn(p, 'dog-2').sort()).toEqual(['crown', 'scarf']);
  const svg = dogSVG(getDog('dog-2'), 96, wornFor(p, 'dog-2'));
  expect(svg).toContain('data-acc="crown"');
  expect(svg).toContain('data-acc="scarf"');
});

test('collar ladder matches the house numbers and renders the chosen color', () => {
  const p = newProfile('Collar');
  expect(COLLAR_COLORS.map((c) => c.need)).toEqual([10, 25, 50, 100]);
  p.play['dog-2'] = { walk: 0, feed: 0, fetch: 0, train: 25 };
  expect(collarColorsFor(p, 'dog-2')).toEqual(['blue', 'green']);
  p.wear['dog-2'] = { collar: 'green' };
  const svg = dogSVG(getDog('dog-2'), 96, wornFor(p, 'dog-2'));
  expect(svg).toContain('#22c55e');
});

test('e2e: a group walk with a training partner earns train credit; two mastered dogs do not', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Trainer'));
  doc.id = 'trainer-kid';
  for (let b = 0; b <= 12; b++) {
    doc.facts[norm(2, b)] = stat(4); // ×2 mastered & fresh
    doc.facts[norm(7, b)] = stat(1); // ×7 needs practice
  }
  doc.unlocks.push({ dogId: 'dog-2', table: 2, at: 1 }, { dogId: 'dog-7', table: 7, at: 2 });
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.hero');
  await page.evaluate(() => { location.hash = '#/activity?dogs=dog-2,dog-7&kind=walk'; });
  await page.waitForSelector('.activity-scene');
  await playQuestions(page, 14);
  await page.waitForSelector('[data-again]');
  const saved = await page.evaluate(
    (id) => new Promise((res) => {
      const req = indexedDB.open('compounded', 1);
      req.onsuccess = () => {
        const g = req.result.transaction('profiles').objectStore('profiles').get(id);
        g.onsuccess = () => res(g.result);
      };
    }),
    'trainer-kid'
  );
  expect(saved.play['dog-2'].train).toBe(1); // both members credited
  expect(saved.play['dog-7'].train).toBe(1);

  // two mastered, fresh dogs: a lovely stroll, no collar credit
  const doc2 = newProfile(uniqueName('Stroller'));
  doc2.id = 'stroller-kid';
  for (let b = 0; b <= 12; b++) {
    doc2.facts[norm(2, b)] = stat(4);
    doc2.facts[norm(3, b)] = stat(4);
  }
  doc2.unlocks.push({ dogId: 'dog-2', table: 2, at: 1 }, { dogId: 'dog-3', table: 3, at: 2 });
  await seedProfile(page, doc2);
  await page.evaluate(() => { location.hash = '#/profiles'; }); // switch player
  await selectProfile(page, doc2.name);
  await page.waitForSelector('.hero');
  await page.evaluate(() => { location.hash = '#/activity?dogs=dog-2,dog-3&kind=walk'; });
  await page.waitForSelector('.activity-scene');
  await playQuestions(page, 14);
  await page.waitForSelector('[data-again]');
  const saved2 = await page.evaluate(
    (id) => new Promise((res) => {
      const req = indexedDB.open('compounded', 1);
      req.onsuccess = () => {
        const g = req.result.transaction('profiles').objectStore('profiles').get(id);
        g.onsuccess = () => res(g.result);
      };
    }),
    'stroller-kid'
  );
  expect(saved2.play['dog-2'].train ?? 0).toBe(0);
});
