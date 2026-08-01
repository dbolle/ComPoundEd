// v1.45.0: the live toy incident, its prevention, and the parent
// "fresh start in the store" reset. The fixture is the SHAPE of the real
// affected ledger (duplicate retry purchases, conflicting coin-tray
// companions, an overspend) so this exact situation can never pass again.
import { test, expect } from '@playwright/test';
import { newProfile, migrateProfile, mergeProfiles, SCHEMA_VERSION } from '../src/data/schema.js';
import { replayLedger, epochOfId } from '../src/engine/ledger.js';
import { balanceCents, trueBalanceCents, coinCounts, storeEpoch, ensureBucks, canMakeExact } from '../src/engine/money.js';
import { buyGear, isOwned, ownedGear, boxedToys, toysOn, placeGear, resetStoreEpoch } from '../src/engine/gearshop.js';
import { seedProfile, selectProfile, uniqueName, holdGrownupsGate } from './helpers.mjs';

// The real incident, in miniature: earnings, purchases that outrun them
// across two devices, a retry duplicate, and a companion recorded with
// two different coin trays.
function incidentProfile() {
  const p = newProfile('Incident');
  p.id = 'incident-kid';
  const txns = p.pawBucks.txns;
  for (let i = 0; i < 10; i++) {
    txns.push({ id: `set-w${i}`, at: 1000 + i, cents: 100, denom: 'buck', count: 1, reason: 'set' });
  }
  // legitimate purchases
  txns.push({ id: 'buy-bonetoy', at: 2000, cents: -40, count: 1, reason: 'buy', item: 'bonetoy', for: null });
  txns.push({ id: 'buy-bonetoy-c-dime', at: 2000, cents: 0, denom: 'dime', count: -4, reason: 'spend' });
  // ...the same purchase recorded on the other device with a different tray
  txns.push({ id: 'buy-bonetoy-c-dime', at: 2500, cents: 0, denom: 'dime', count: -1, reason: 'spend' });
  txns.push({ id: 'buy-frisbee', at: 3000, cents: -75, count: 1, reason: 'buy', item: 'frisbee', for: null });
  // the retry duplicate the old code created when the toy "vanished"
  txns.push({ id: 'buy-frisbee~2', at: 4000, cents: -75, count: 1, reason: 'buy', item: 'frisbee', for: null });
  // spending beyond earnings, as two offline devices produced
  txns.push({ id: 'buy-crown', at: 5000, cents: -1200, count: 1, reason: 'buy', item: 'crown', for: null });
  p.gear = { placements: { bonetoy: 'dog-2', frisbee: 'dog-5', crown: 'dog-9' } };
  return p;
}

test('the incident shape: nothing is un-owned, no cascade, no debt shown', () => {
  const p = incidentProfile();
  const r = replayLedger(ensureBucks(p).txns, storeEpoch(p));
  // conflicting coin-tray copies no longer poison the money…
  expect(r.quarantined.size).toBe(0);
  // …and no purchase is retroactively rejected
  expect(r.rejected.size).toBe(0);
  for (const id of ['bonetoy', 'frisbee', 'crown']) {
    expect(isOwned(p, id), `${id} stays owned`).toBe(true);
  }
  // the child sees zero, never a negative balance; the grown-up sees the truth
  expect(balanceCents(p)).toBe(0);
  expect(trueBalanceCents(p)).toBeLessThan(0);
  // every coin count is nonnegative
  for (const [d, c] of Object.entries(coinCounts(p))) expect(c, d).toBeGreaterThanOrEqual(0);
  // the duplicate does not show the toy twice
  const toys = ownedGear(p).filter(({ item }) => item === 'frisbee');
  expect(toys).toHaveLength(1);
});

test('a placed toy can always be taken back off (the reported symptom)', () => {
  const p = incidentProfile();
  expect(toysOn(p, 'dog-5')).toContain('frisbee');
  expect(placeGear(p, 'frisbee', null)).toBe(true); // used to silently fail
  expect(toysOn(p, 'dog-5')).not.toContain('frisbee');
  expect(boxedToys(p)).toContain('frisbee');
});

test('buyGear never creates a retry duplicate any more', () => {
  const p = newProfile('NoRetry');
  p.pawBucks.txns.push({ id: 'seed', at: 1, cents: 200, denom: 'buck', count: 2, reason: 'set' });
  expect(buyGear(p, 'mouse')).toBeTruthy();
  expect(buyGear(p, 'mouse')).toBe(null); // already owned — no second charge
  expect(ensureBucks(p).txns.filter((t) => t.id.startsWith('buy-mouse') && !t.id.includes('-c-'))).toHaveLength(1);
});

test('fresh start: earnings kept, purchases void, everything re-buyable', () => {
  const p = incidentProfile();
  const earned = ensureBucks(p).txns.reduce((s, t) => s + (t.cents > 0 ? t.cents : 0), 0);
  const epoch = resetStoreEpoch(p);
  expect(epoch).toBe(2);
  // every Paw Buck ever earned is back
  expect(balanceCents(p)).toBe(earned);
  expect(trueBalanceCents(p)).toBe(earned);
  // nothing is owned, nothing is placed
  for (const id of ['bonetoy', 'frisbee', 'crown']) expect(isOwned(p, id)).toBe(false);
  expect(ownedGear(p)).toEqual([]);
  // placements are tombstoned rather than deleted, so a stale device
  // cannot refill them on the next sync
  expect(Object.values(p.gear.placements).every((v) => v === null)).toBe(true);
  expect(toysOn(p, 'dog-5')).toEqual([]);
  // the history is still there for the grown-up
  expect(ensureBucks(p).txns.length).toBeGreaterThan(10);
  // and the same item can be bought again, as a NEW event
  const txn = buyGear(p, 'frisbee');
  expect(txn.id).toBe('buy-frisbee@2');
  expect(epochOfId(txn.id)).toBe(2);
  expect(isOwned(p, 'frisbee')).toBe(true);
  expect(balanceCents(p)).toBe(earned - 75);
});

test('a reset survives syncing with a device that has not seen it', () => {
  const fresh = incidentProfile();
  resetStoreEpoch(fresh);
  buyGear(fresh, 'mouse'); // a purchase made after the reset
  const stale = incidentProfile(); // still epoch 1, still "owns" everything
  for (const [a, b] of [[fresh, stale], [stale, fresh]]) {
    const m = migrateProfile(mergeProfiles(structuredClone(a), structuredClone(b)));
    expect(storeEpoch(m), 'epoch ratchets up, never back').toBe(2);
    expect(isOwned(m, 'crown'), 'old purchases stay void').toBe(false);
    expect(isOwned(m, 'mouse'), 'the post-reset purchase survives').toBe(true);
  }
});

test('epoch is additive: v17 docs migrate to epoch 1 and behave exactly as before', () => {
  const doc = migrateProfile({
    id: 'v17',
    schemaVersion: 17,
    name: 'V17',
    createdAt: 1,
    updatedAt: 2,
    facts: {},
    unlocks: [],
    play: {},
    speed: { avgMs: 0, samples: 0 },
    pawBucks: { txns: [{ id: 'buy-mouse', at: 5, cents: -10, count: 1, reason: 'buy', item: 'mouse', for: null }] },
  });
  expect(doc.schemaVersion).toBe(SCHEMA_VERSION);
  expect(doc.pawBucks.epoch).toBe(1);
  expect(isOwned(doc, 'mouse')).toBe(true); // pre-epoch purchases still count
});

test('e2e: the parent reset needs two confirmations and the typed word', async ({ page }) => {
  const doc = incidentProfile();
  doc.name = uniqueName('Reset');
  await page.goto('/', { waitUntil: 'networkidle' });
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.evaluate(() => { location.hash = '#/grownups'; });
  await holdGrownupsGate(page);

  // nothing happens on the first tap alone
  await page.tap('[data-store-reset]');
  await expect(page.locator('[data-reset-next]')).toBeVisible();
  await expect(page.locator('[data-reset-go]')).toHaveCount(0);

  // backing out is safe
  await page.tap('[data-reset-cancel]');
  await expect(page.locator('[data-reset-next]')).toHaveCount(0);

  // second screen requires the typed word
  await page.tap('[data-store-reset]');
  await page.tap('[data-reset-next]');
  await expect(page.locator('[data-reset-go]')).toBeVisible();
  await page.tap('[data-reset-go]'); // empty input
  await expect(page.locator('.toast').last()).toContainText('RESET');
  await page.fill('[data-reset-word]', 'reset'); // case-insensitive
  await page.tap('[data-reset-go]');
  await expect(page.locator('[data-store-reset-panel]')).toContainText('Fresh start done');

  const saved = await page.evaluate(
    (id) =>
      new Promise((res) => {
        const r = indexedDB.open('compounded');
        r.onsuccess = () => {
          const g = r.result.transaction('profiles').objectStore('profiles').get(id);
          g.onsuccess = () => res(g.result);
        };
      }),
    doc.id
  );
  expect(saved.pawBucks.epoch).toBe(2);
  expect(Object.values(saved.gear.placements).every((v) => v === null)).toBe(true);
  expect(saved.pawBucks.txns.length).toBeGreaterThan(10); // history intact
});

// The wallet must ALWAYS be spendable: whatever the history, the coins a
// child holds have to add up to the balance shown, or exact-change
// checkout is impossible. (v1.45.1: a reset left a full balance with
// almost no coins because the coin replay ignored the store epoch.)
const COIN_VALUE = { buck: 100, quarter: 25, dime: 10, nickel: 5, penny: 1 };
const walletValue = (p) =>
  Object.entries(coinCounts(p)).reduce((s, [d, n]) => s + COIN_VALUE[d] * n, 0);

test('coins always add up to the balance — before and after a fresh start', () => {
  const p = incidentProfile();
  // add swaps and a spend so the coin mix is genuinely churned
  p.pawBucks.txns.push(
    { id: 'swap-x-a', group: 'swap-x', at: 6000, cents: -100, denom: 'buck', count: -1, reason: 'swap' },
    { id: 'swap-x-b', group: 'swap-x', at: 6000, cents: 100, denom: 'dime', count: 10, reason: 'swap' },
    { id: 'buy-bowl', at: 7000, cents: -90, count: 1, reason: 'buy', item: 'bowl', for: null },
    { id: 'buy-bowl-c-dime', at: 7000, cents: 0, denom: 'dime', count: -9, reason: 'spend' }
  );
  expect(walletValue(p)).toBe(balanceCents(p));
  resetStoreEpoch(p);
  expect(balanceCents(p)).toBeGreaterThan(0);
  expect(walletValue(p), 'a reset wallet is fully spendable').toBe(balanceCents(p));
  // and a purchase right after the reset still works end to end
  // (bowl at 90c — the fixture earns 1000c, so this is affordable)
  const txn = buyGear(p, 'bowl');
  expect(txn).toBeTruthy();
  expect(walletValue(p)).toBe(balanceCents(p));
});

test('the live incident shape: reset leaves every earned cent spendable', () => {
  // mirrors the real profile: many earns, 168 swap pairs' worth of churn,
  // then purchases that get voided by the reset
  const p = newProfile('LiveShape');
  const txns = p.pawBucks.txns;
  let at = 1000;
  for (let i = 0; i < 17; i++) txns.push({ id: `set-${i}`, at: at++, cents: 100, denom: 'buck', count: 1, reason: 'set' });
  for (let i = 0; i < 150; i++) txns.push({ id: `mastery-${i}`, at: at++, cents: 5, denom: 'nickel', count: 1, reason: 'mastery' });
  for (let i = 0; i < 50; i++) txns.push({ id: `polish-${i}`, at: at++, cents: 1, denom: 'penny', count: 1, reason: 'polish' });
  // swap churn: bucks into dimes and back
  for (let i = 0; i < 5; i++) {
    txns.push({ id: `swap-${i}-a`, group: `swap-${i}`, at: at, cents: -100, denom: 'buck', count: -1, reason: 'swap' });
    txns.push({ id: `swap-${i}-b`, group: `swap-${i}`, at: at++, cents: 100, denom: 'dime', count: 10, reason: 'swap' });
  }
  // purchases with exact-change companions
  for (const [item, price] of [['crown', 1200], ['tiara', 800], ['bowl', 90]]) {
    txns.push({ id: `buy-${item}`, at: at, cents: -price, count: 1, reason: 'buy', item, for: null });
    txns.push({ id: `buy-${item}-c-buck`, at: at++, cents: 0, denom: 'buck', count: -Math.floor(price / 100), reason: 'spend' });
  }
  const earned = 17 * 100 + 150 * 5 + 50 * 1;
  resetStoreEpoch(p);
  expect(balanceCents(p)).toBe(earned);
  expect(walletValue(p)).toBe(earned); // every cent is in real coins
});

test('a reset wallet can pay exact change for everything it can afford', () => {
  const p = newProfile('Payable');
  for (let i = 0; i < 20; i++) {
    p.pawBucks.txns.push({ id: `set-${i}`, at: 1000 + i, cents: 100, denom: 'buck', count: 1, reason: 'set' });
  }
  p.pawBucks.txns.push({ id: 'buy-crown', at: 5000, cents: -1200, count: 1, reason: 'buy', item: 'crown', for: null });
  resetStoreEpoch(p);
  const wallet = coinCounts(p);
  expect(walletValue(p)).toBe(balanceCents(p));
  // this fixture only ever earned Paw Bucks, so the wallet is all bucks:
  // whole-dollar prices pay directly, andsmall change comes from the piggy
  // bank (the intended money-math flow)
  expect(canMakeExact(wallet, 100)).toBe(true);
  expect(canMakeExact(wallet, 1200)).toBe(true);
  expect(canMakeExact(wallet, 10)).toBe(false);
  // a child who earned mixed coins keeps them and can pay small prices
  const mixed = newProfile('Mixed');
  for (let i = 0; i < 20; i++) {
    mixed.pawBucks.txns.push({ id: `n-${i}`, at: 1000 + i, cents: 5, denom: 'nickel', count: 1, reason: 'mastery' });
  }
  mixed.pawBucks.txns.push({ id: 'buy-mouse', at: 5000, cents: -10, count: 1, reason: 'buy', item: 'mouse', for: null });
  resetStoreEpoch(mixed);
  expect(canMakeExact(coinCounts(mixed), 10)).toBe(true);
  expect(walletValue(mixed)).toBe(balanceCents(mixed));
});
