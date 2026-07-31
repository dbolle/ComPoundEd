// v1.37.0 client hardening: ingest validation, structured sync results,
// convergence on content (not timestamps), malformed-doc isolation, and
// honest backup reporting. Written failing-first against v1.36 behavior.
import { test, expect } from '@playwright/test';
import { newProfile, migrateProfile, mergeProfiles, validProfileDoc, SCHEMA_VERSION } from '../src/data/schema.js';
import { seedProfile, selectProfile, uniqueName, norm, stat, holdGrownupsGate, seedRemote } from './helpers.mjs';

test('validProfileDoc: shape matrix', () => {
  const good = newProfile('Good');
  expect(validProfileDoc(good)).toBe(true);
  expect(validProfileDoc(null)).toBe(false);
  expect(validProfileDoc({ id: 'x' })).toBe(false); // no name
  expect(validProfileDoc({ ...good, facts: 'not-an-object' })).toBe(false);
  expect(validProfileDoc({ ...good, unlocks: 'nope' })).toBe(false);
  expect(validProfileDoc({ ...good, schemaVersion: 999 })).toBe(false); // future
  expect(validProfileDoc({ ...good, schemaVersion: 'abc' })).toBe(false);
  const legacy = { id: 'l', name: 'L', schemaVersion: 4, facts: {}, unlocks: [] };
  expect(validProfileDoc(legacy)).toBe(true); // old schemas welcome
  // unknown extra fields are fine (forward compat within known version)
  expect(validProfileDoc({ ...good, futureField: { deep: true } })).toBe(true);
});

test('migration normalizes collection types and PRESERVES unknown fields', () => {
  const doc = migrateProfile({
    id: 'weird',
    name: 'Weird',
    schemaVersion: 12,
    createdAt: 1,
    updatedAt: 2,
    facts: {},
    unlocks: undefined, // missing collection
    play: null,
    speed: { avgMs: 0, samples: 0 },
    somethingNewer: { keep: 'me' }, // unknown field from a future minor
  });
  expect(doc.schemaVersion).toBe(SCHEMA_VERSION);
  expect(Array.isArray(doc.unlocks)).toBe(true);
  expect(typeof doc.play).toBe('object');
  expect(doc.somethingNewer).toEqual({ keep: 'me' }); // unknown data survives
});

test('mergeProfiles survives docs with missing arrays/maps', () => {
  const a = newProfile('A');
  a.id = 'k';
  const b = { id: 'k', name: 'A', schemaVersion: SCHEMA_VERSION, createdAt: 1, updatedAt: 2, metaAt: 2, facts: {} };
  // no unlocks / petUnlocks / pawBucks on b — must not throw
  const m1 = mergeProfiles(a, b);
  const m2 = mergeProfiles(b, a);
  expect(Array.isArray(m1.unlocks)).toBe(true);
  expect(Array.isArray(m2.unlocks)).toBe(true);
});

test('e2e: one malformed server doc cannot abort the family sync pass', async ({ page }) => {
  await seedRemote(page, { id: 'bad-doc', name: 'Bad', schemaVersion: SCHEMA_VERSION, facts: 'not-an-object' });
  const good = newProfile('GoodSync');
  good.id = 'good-sync-kid';
  await seedRemote(page, good);

  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-offer-on]');
  await page.tap('[data-offer-on]'); // enables sync + pulls
  // the good profile arrives even though the bad one sits beside it
  await expect(page.locator('.profile-card', { hasText: 'GoodSync' })).toBeVisible();
  // and the malformed doc was not persisted locally
  const badLocal = await page.evaluate(async () => {
    const db = await new Promise((res) => { const r = indexedDB.open('compounded'); r.onsuccess = () => res(r.result); });
    return new Promise((res) => {
      const tx = db.transaction('profiles', 'readonly');
      const rq = tx.objectStore('profiles').get('bad-doc');
      rq.onsuccess = () => res(rq.result ?? null);
    });
  });
  expect(badLocal).toBe(null);
  await page.request.delete('/sync/profiles/bad-doc.json');
  await page.request.delete('/sync/profiles/good-sync-kid.json');
});

test('e2e: stranded progress converges — remote newer, local has disjoint work', async ({ page }) => {
  // remote copy: NEWER updatedAt, but missing the local-only fact
  const remote = newProfile(uniqueName('Strand'));
  remote.id = 'strand-kid';
  remote.facts[norm(3, 3)] = stat(4);
  remote.updatedAt = Date.now() + 60_000; // decisively newer than local
  remote.metaAt = 1;

  const local = structuredClone(remote);
  local.facts[norm(7, 8)] = stat(3); // disjoint local progress
  local.updatedAt = Date.now() - 60_000; // older save
  delete local.facts[norm(3, 3)];

  await page.goto('/', { waitUntil: 'networkidle' });
  await seedProfile(page, local);
  await seedRemote(page, remote);
  await selectProfile(page, remote.name);
  await page.waitForSelector('.hero');

  // turn backup on and force a check-in via Grown-Ups "Back up now"
  await page.evaluate(() => { location.hash = '#/grownups'; });
  await holdGrownupsGate(page);
  await page.tap('[data-sync-toggle]');
  await page.waitForTimeout(1500);
  await page.tap('[data-sync-now]');
  await page.waitForTimeout(2500);

  const server = await (await page.request.get('/sync/profiles/strand-kid.json')).json();
  expect(server.facts['3x3']).toBeTruthy(); // remote's own fact intact
  expect(server.facts['7x8']).toBeTruthy(); // local disjoint progress reached the server
  await page.request.delete('/sync/profiles/strand-kid.json');
});

test('e2e: "Back up now" is honest when the server is unreachable', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Honest'));
  doc.id = 'honest-kid';
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.evaluate(() => { location.hash = '#/grownups'; });
  await holdGrownupsGate(page);
  await page.tap('[data-sync-toggle]'); // enable (server reachable here)
  await page.waitForTimeout(1000);

  await page.route('**/sync/**', (route) => route.abort()); // server goes away
  await page.tap('[data-sync-now]');
  await expect(page.locator('.toast').last()).toContainText(/reach|offline|couldn/i);
  await expect(page.locator('.toast').last()).not.toContainText('Backed up');
  await page.unroute('**/sync/**');
});

test('e2e: a failed listing never treats local profiles as remotely absent', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('NoAbsent'));
  doc.id = 'noabsent-kid';
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.evaluate(() => { location.hash = '#/grownups'; });
  await holdGrownupsGate(page);
  await page.tap('[data-sync-toggle]');
  await page.waitForTimeout(1200);

  // listing fails; individual PUTs would still "work" — but none may fire
  const puts = [];
  await page.route('**/sync/profiles/**', (route) => {
    if (route.request().method() === 'PUT') puts.push(route.request().url());
    route.abort();
  });
  await page.tap('[data-sync-now]');
  await page.waitForTimeout(1500);
  expect(puts).toEqual([]); // no blind re-push after a failed listing
  await page.unroute('**/sync/profiles/**');
});

test('a stale device cannot revert limitTables', () => {
  const P = newProfile('Kid');
  P.id = 'kid';
  P.subjects = { ...P.subjects, limitTables: [2, 5, 10] };
  P.metaAt = 2000;
  P.updatedAt = 2000;
  const S = newProfile('Kid');
  S.id = 'kid';
  S.metaAt = 1000;
  S.updatedAt = 3000; // saved later with stale settings
  for (const [a, b] of [[P, S], [S, P]]) {
    expect(mergeProfiles(a, b).subjects.limitTables).toEqual([2, 5, 10]);
  }
});
