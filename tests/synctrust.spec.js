// v1.33.0 sync trust: metaAt keeps parent settings/cosmetics from being
// reverted by a stale device that saves later; every save merges with
// disk (a pulled merge can't be clobbered); the profiles screen offers
// to turn backup on when the family server already holds backups.
import { test, expect } from '@playwright/test';
import { newProfile, migrateProfile, mergeProfiles, SCHEMA_VERSION, touchMeta } from '../src/data/schema.js';
import { seedProfile, selectProfile, uniqueName, holdGrownupsGate } from './helpers.mjs';

test('v16 docs gain metaAt from updatedAt; new docs carry it', () => {
  const old = migrateProfile({
    id: 'v16',
    schemaVersion: 16,
    name: 'V16',
    avatarDogId: 'starter',
    createdAt: 100,
    updatedAt: 5000,
    facts: {},
    unlocks: [],
    play: {},
    speed: { avgMs: 0, samples: 0 },
  });
  expect(old.schemaVersion).toBe(SCHEMA_VERSION);
  expect(old.metaAt).toBe(5000);
  expect(newProfile('Fresh').metaAt).toBeGreaterThan(0);
});

test('a stale device saving later cannot revert settings or cosmetics', () => {
  // Device P: parent changes settings at T=2000 (metaAt bumps)
  const P = newProfile('Kid');
  P.id = 'kid';
  P.subjects = { ...P.subjects, hideSitting: true, little: true };
  P.avatarPetId = 'cat-1';
  P.wear = { starter: { bandana: 'red' } };
  P.gear = { placements: { mouse: 'cat-1' } };
  P.metaAt = 2000;
  P.updatedAt = 2000;

  // Device S: stale settings (metaAt 1000) but saved progress LATER (3000)
  const S = newProfile('Kid');
  S.id = 'kid';
  S.metaAt = 1000;
  S.updatedAt = 3000;
  S.facts = { '2x3': { attempts: 4, correct: 4, avgMs: 2000, box: 3, lastSeen: 2900 } };

  for (const [a, b] of [[P, S], [S, P]]) {
    const m = mergeProfiles(a, b);
    expect(m.subjects.hideSitting).toBe(true); // P's setting survives
    expect(m.subjects.little).toBe(true);
    expect(m.avatarPetId).toBe('cat-1');
    expect(m.wear.starter.bandana).toBe('red');
    expect(m.gear.placements.mouse).toBe('cat-1');
    expect(m.facts['2x3'].box).toBe(3); // S's progress survives too
    expect(m.updatedAt).toBe(3000);
    expect(m.metaAt).toBe(2000);
  }
});

test('placement removals propagate (null beats a stale wearer)', () => {
  const A = newProfile('Kid');
  A.id = 'kid';
  A.gear = { placements: { mouse: null } }; // toy sent back to the box
  A.metaAt = 2000;
  A.updatedAt = 2000;
  const B = newProfile('Kid');
  B.id = 'kid';
  B.gear = { placements: { mouse: 'dog-2' } };
  B.metaAt = 1000;
  B.updatedAt = 3000;
  expect(mergeProfiles(A, B).gear.placements.mouse).toBe(null);
  expect(mergeProfiles(B, A).gear.placements.mouse).toBe(null);
});

test('touchMeta bumps metaAt', () => {
  const p = newProfile('T');
  p.metaAt = 1;
  touchMeta(p);
  expect(p.metaAt).toBeGreaterThan(1);
});

test('e2e: an in-app save folds in a merge that landed on disk meanwhile', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Merge'));
  doc.id = 'merge-kid';
  doc.subjects = { ...doc.subjects, tables: true };
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.hero');

  // Simulate a background pull landing while the app holds a stale
  // in-memory copy: write a ghost txn straight into IndexedDB.
  await page.evaluate(async (id) => {
    const db = await new Promise((res) => { const r = indexedDB.open('compounded'); r.onsuccess = () => res(r.result); });
    const cur = await new Promise((res) => {
      const tx = db.transaction('profiles', 'readonly');
      const rq = tx.objectStore('profiles').get(id);
      rq.onsuccess = () => res(rq.result);
    });
    cur.pawBucks = cur.pawBucks ?? { txns: [] };
    cur.pawBucks.txns.push({ id: 'ghost-txn', at: Date.now(), cents: 10, denom: 'dime', count: 1, reason: 'sitting' });
    await new Promise((res) => { const tx = db.transaction('profiles', 'readwrite'); tx.objectStore('profiles').put(cur); tx.oncomplete = res; });
  }, doc.id);

  // Trigger an in-app save from the stale in-memory profile: flip a
  // Grown-Ups chip (immediate ctx.save() + touchMeta).
  await page.evaluate(() => { location.hash = '#/grownups'; });
  await holdGrownupsGate(page);
  await page.tap('[data-subj="hideSitting"]');
  await page.waitForTimeout(600);

  const saved = await page.evaluate(async (id) => {
    const db = await new Promise((res) => { const r = indexedDB.open('compounded'); r.onsuccess = () => res(r.result); });
    return new Promise((res) => {
      const tx = db.transaction('profiles', 'readonly');
      const rq = tx.objectStore('profiles').get(id);
      rq.onsuccess = () => res(rq.result);
    });
  }, doc.id);
  // The ghost txn (the "pulled merge") survived the stale in-memory save,
  // AND the save's own change landed.
  expect(saved.pawBucks.txns.some((t) => t.id === 'ghost-txn')).toBe(true);
  expect(saved.subjects.hideSitting).toBe(true);
});

test('e2e: grown-ups shows per-device backup status', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Status'));
  doc.id = 'status-kid';
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.evaluate(() => { location.hash = '#/grownups'; });
  await holdGrownupsGate(page);
  await expect(page.locator('[data-sync-status]')).toContainText(/not backing up|last backup/);
});

test('e2e: profiles screen offers backup when the server holds some; turn-on pulls', async ({ page }) => {
  const remote = newProfile('OfferKid');
  remote.id = 'offer-kid';
  await page.request.put('/sync/profiles/offer-kid.json', { data: remote });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-offer-on]');
  await page.tap('[data-offer-on]');
  await expect(page.locator('.profile-card', { hasText: 'OfferKid' })).toBeVisible();
  await expect(page.locator('[data-offer-on]')).toHaveCount(0); // re-render, sync now on
  await page.request.delete('/sync/profiles/offer-kid.json');
});

test('e2e: dismissing the backup offer sticks across reloads', async ({ page }) => {
  const remote = newProfile('OfferKid2');
  remote.id = 'offer-kid-2';
  await page.request.put('/sync/profiles/offer-kid-2.json', { data: remote });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-offer-on]');
  await page.tap('[data-offer-no]');
  await expect(page.locator('[data-offer-on]')).toHaveCount(0);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-new]');
  await page.waitForTimeout(800); // probe would have resolved by now
  await expect(page.locator('[data-offer-on]')).toHaveCount(0);
  await page.request.delete('/sync/profiles/offer-kid-2.json');
});
