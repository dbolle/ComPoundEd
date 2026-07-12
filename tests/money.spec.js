// Paw Bucks Phase 3: append-only ledger, slow dime-per-sitting faucet
// (first two visits/day), wallet with the literal coins earned.
import { test, expect } from '@playwright/test';
import {
  earnSitting,
  paidSitsToday,
  balanceCents,
  coinCounts,
  formatPaw,
  SIT_PAID_VISITS_PER_DAY,
} from '../src/engine/money.js';
import { newProfile, migrateProfile, mergeProfiles, SCHEMA_VERSION } from '../src/data/schema.js';
import { seedProfile, selectProfile, playQuestions, readProfile, norm, stat } from './helpers.mjs';

test('the faucet: a dime per sitting, first two per day, then the jar is full', () => {
  const p = newProfile('Earn');
  const t0 = Date.now();
  expect(earnSitting(p, t0)).not.toBeNull();
  expect(earnSitting(p, t0 + 60000)).not.toBeNull();
  expect(earnSitting(p, t0 + 120000)).toBeNull(); // third visit today: unpaid
  expect(paidSitsToday(p, t0)).toBe(SIT_PAID_VISITS_PER_DAY);
  expect(balanceCents(p)).toBe(20);
  expect(coinCounts(p)).toEqual({ dime: 2 });
  expect(formatPaw(20)).toBe('🐾$0.20');

  // Tomorrow the jar refills
  const tomorrow = t0 + 24 * 3600e3;
  expect(earnSitting(p, tomorrow)).not.toBeNull();
  expect(balanceCents(p)).toBe(30);
});

test('ledger merges by union: no double-pay, no resurrected spends', () => {
  const a = newProfile('A');
  const b = structuredClone(a);
  const t0 = Date.now();
  const shared = earnSitting(a, t0); // earned before the devices diverged
  b.pawBucks = { txns: [{ ...shared }] };
  earnSitting(a, t0 + 60000); // device A earns again
  b.pawBucks.txns.push({ id: 'spend-1', at: t0 + 90000, cents: -10, reason: 'store' }); // device B spends
  const m = mergeProfiles(a, b);
  expect(m.pawBucks.txns).toHaveLength(3); // shared txn deduped by id
  expect(balanceCents(m)).toBe(10); // 10 + 10 − 10
});

test('migration v9→v10 adds an empty ledger', () => {
  const doc = migrateProfile({
    id: 'v9', schemaVersion: 9, name: 'V9', avatarDogId: 'starter',
    createdAt: Date.now(), updatedAt: Date.now(),
    facts: {}, division: {}, unlocks: [{ dogId: 'starter', table: null, at: Date.now() }],
    play: {}, wear: {}, speed: { avgMs: 0, samples: 0 }, subjects: { little: false },
    little: { xp: 0 }, achievements: {}, stats: {},
  });
  expect(doc.schemaVersion).toBe(SCHEMA_VERSION);
  expect(doc.pawBucks).toEqual({ txns: [] });
});

test('e2e: sitting pays with ceremony; a full jar says so; wallet shows coins', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile('Sitter');
  doc.id = 'money-kid';
  for (let b = 0; b <= 12; b++) {
    doc.facts[norm(2, b)] = stat(5);
    doc.facts[norm(10, b)] = stat(4);
    doc.facts[norm(3, b)] = stat(2);
  }
  await seedProfile(page, doc);
  await selectProfile(page, 'Sitter');

  // Visit 1: paid, with the coin ceremony
  await page.waitForSelector('.sitting-card');
  await page.tap('.sitting-card');
  await page.waitForSelector('.activity-scene');
  await playQuestions(page, 12);
  await page.waitForSelector('[data-again]');
  await expect(page.locator('.badge', { hasText: 'paw dime' })).toBeVisible();

  // Pack chip shows the balance; wallet shows the actual coin
  await page.tap('[data-done]');
  await page.waitForSelector('.hero');
  await page.tap('[data-nav="/pack"]');
  // The visit pays its dime; facts mastered during it may add frontier
  // coins on top, so assert the dime itself rather than an exact total.
  await expect(page.locator('.paw-chip')).toContainText('🐾$');
  await page.tap('.paw-chip');
  await page.waitForSelector('.wallet-rows');
  await expect(page.locator('.wallet-row', { hasText: 'Paw Dime' })).toContainText('×1');

  // Fill today's jar via the ledger, then a third visit is warm but unpaid
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        const req = indexedDB.open('compounded', 1);
        req.onsuccess = () => {
          const t = req.result.transaction('profiles', 'readwrite');
          const store = t.objectStore('profiles');
          const g = store.get('money-kid');
          g.onsuccess = () => {
            const d = g.result;
            d.pawBucks.txns.push({ id: 'x2', at: Date.now(), cents: 10, denom: 'dime', count: 1, reason: 'sitting' });
            store.put(d);
          };
          t.oncomplete = resolve;
        };
      })
  );
  // Full reload so the app reboots from IndexedDB (a hash-only goto is a
  // same-document navigation and would keep the stale in-memory profile).
  await page.reload({ waitUntil: 'networkidle' });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForSelector('.sitting-card');
  await page.tap('.sitting-card');
  await page.waitForSelector('.activity-scene');
  await playQuestions(page, 12);
  await page.waitForSelector('[data-again]');
  await expect(page.locator('.card.center')).toContainText('treat jar is full');
  const saved = await readProfile(page, 'money-kid');
  expect(saved.pawBucks.txns.filter((t) => t.reason === 'sitting')).toHaveLength(2); // no third sitting payment
});
