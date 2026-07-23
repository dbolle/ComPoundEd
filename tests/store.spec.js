// v1.24.0 BETA: the storefront behind the 🧪 flag — full coin-math
// checkout (bucks/quarters/dimes/nickels lines + addition totals), gift
// wearer binding, and two-way coin swaps.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';

import { SWAPS, swapCoins, coinCounts, balanceCents, canMakeExact } from '../src/engine/money.js';
import { buyGear as buyGear2 } from '../src/engine/gearshop.js';
import { seedProfile, selectProfile, holdGrownupsGate, uniqueName } from './helpers.mjs';

const fund = (p, coins) => {
  let i = 0;
  for (const [denom, cents, n] of coins) {
    for (let k = 0; k < n; k++) {
      p.pawBucks.txns.push({ id: `f${i++}`, at: Date.now(), cents, denom, count: 1, reason: 'sitting' });
    }
  }
};

test('canMakeExact + spend companions: coins really leave the wallet', () => {
  const p = newProfile('Exact');
  fund(p, [['quarter', 25, 2], ['dime', 10, 4]]); // 90¢ exactly possible
  expect(balanceCents(p)).toBe(90);
  const coins = { quarter: 2, dime: 4 };
  const txn = buyGear2(p, 'bowl', null, Date.now(), coins);
  expect(txn.cents).toBe(-90);
  expect(balanceCents(p)).toBe(0);
  expect(coinCounts(p)).toEqual({ quarter: 0, dime: 0 });
});

test('swaps: both directions, net-zero balance, round trip restores counts', () => {
  const p = newProfile('Swapper');
  fund(p, [['dime', 10, 10]]);
  const before = balanceCents(p);
  expect(swapCoins(p, SWAPS.find((r) => r.give.denom === 'dime' && r.get.denom === 'buck'))).toBe(true);
  expect(coinCounts(p)).toEqual({ dime: 0, buck: 1 });
  expect(balanceCents(p)).toBe(before);
  expect(swapCoins(p, SWAPS.find((r) => r.give.denom === 'buck' && r.get.denom === 'quarter'))).toBe(true);
  expect(coinCounts(p)).toEqual({ dime: 0, buck: 0, quarter: 4 });
  expect(swapCoins(p, SWAPS.find((r) => r.give.denom === 'quarter' && r.get.denom === 'buck'))).toBe(true);
  expect(swapCoins(p, SWAPS.find((r) => r.give.denom === 'buck' && r.get.denom === 'dime'))).toBe(true);
  expect(coinCounts(p)).toEqual({ dime: 10, buck: 0, quarter: 0 }); // full circle
  expect(balanceCents(p)).toBe(before);
  expect(swapCoins(p, SWAPS.find((r) => r.give.denom === 'penny'))).toBe(false); // no pennies
});

test('e2e: non-beta profiles are redirected and keep the teaser', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('NoBeta'));
  doc.id = 'nobeta-kid';
  doc.subjects = { ...doc.subjects, tables: true };
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.hero');
  await page.evaluate(() => { location.hash = '#/store'; });
  await page.waitForSelector('.pack-grid'); // bounced to /pack
  await expect(page).toHaveURL(/#\/pack/);
  await expect(page.locator('.store-soon')).toContainText('Opening soon');
});

test('e2e: the grown-ups 🧪 chip opens the store; full checkout buys the bowl and a gift', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Beta'));
  doc.id = 'beta-kid';
  doc.subjects = { ...doc.subjects, tables: true };
  doc.unlocks.push({ dogId: 'dog-2', table: 2, at: 1 });
  fund(doc, [['buck', 100, 2], ['quarter', 25, 3], ['dime', 10, 2], ['nickel', 5, 1]]); // $2.90, exact-change-friendly
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.hero');

  // flip beta in Grown-Ups
  await page.evaluate(() => { location.hash = '#/grownups'; });
  await holdGrownupsGate(page);
  await expect(page.locator('.screen')).toContainText('Beta features are previews');
  await page.tap('[data-subj="beta"]');
  await expect(page.locator('[data-subj="beta"]')).toContainText('on');

  // pack tile is open now
  await page.evaluate(() => { location.hash = '#/pack'; });
  await page.waitForSelector('.store-soon');
  await expect(page.locator('.store-soon')).toContainText('Open!');
  await page.tap('.store-soon');
  await page.waitForSelector('[data-shelves]');
  // shelves show the real accessory art, not emoji stand-ins
  await expect(page.locator('[data-item="crown"] svg[data-gear="crown"]')).toBeVisible();
  await expect(page.locator('[data-item="scarf"] svg[data-gear="scarf"]')).toBeVisible();

  // buy the deluxe bowl (90¢) with exact change from real coins
  await page.tap('[data-item="bowl"]');
  await page.waitForSelector('[data-trays]');
  // wallet holds 3 bucks only → exact 90¢ impossible? No: this kid was
  // funded with quarters+dimes below. Pay 3 quarters + 1 dime + 1 nickel.
  for (let i = 0; i < 3; i++) await page.tap('[data-give="quarter"]');
  await page.tap('[data-give="dime"]');
  await page.tap('[data-give="nickel"]');
  await expect(page.locator('[data-paid]')).toHaveText('90¢');
  // taking a coin back works
  await page.tap('[data-take="nickel"]');
  await expect(page.locator('[data-pay]')).toBeDisabled();
  await page.tap('[data-give="nickel"]');
  await expect(page.locator('[data-pay]')).toBeEnabled();
  await page.tap('[data-pay]');
  await expect(page.locator('[data-checkout]')).toContainText("It's yours");
  await expect(page.locator('[data-checkout]')).toContainText('toy box');
  await page.tap('[data-done]');
  await expect(page.locator('[data-item="bowl"]')).toContainText('Owned');

  // gift flow: sunglasses for Daisy ($2.00 = 2 Paw Bucks exact)
  await page.tap('[data-item="sunglasses"]');
  await page.waitForSelector('[data-wearer="dog-2"]');
  await page.tap('[data-wearer="dog-2"]');
  await page.waitForSelector('[data-trays]');
  await page.tap('[data-give="buck"]');
  await page.tap('[data-give="buck"]');
  await page.tap('[data-pay]');
  await expect(page.locator('[data-checkout]')).toContainText('Daisy is wearing it');
  const svg = await page.locator('[data-checkout] .dog svg').first().evaluate((e) => e.outerHTML);
  expect(svg).toContain('data-acc="sunglasses"');
  await page.tap('[data-done]');

  // 10¢ left: the crown is unaffordable — tap explains, no checkout
  await page.tap('[data-item="crown"]');
  await expect(page.locator('.toast')).toContainText('Keep saving');
});


test('e2e: a lone Paw Buck cannot make 90¢ — the store sends you to make change', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Change'));
  doc.id = 'change-kid';
  doc.subjects = { ...doc.subjects, tables: true, beta: true };
  fund(doc, [['buck', 100, 1]]);
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.hero');
  await page.evaluate(() => { location.hash = '#/store'; });
  await page.waitForSelector('[data-shelves]');
  await page.tap('[data-item="bowl"]');
  await expect(page.locator('[data-checkout]')).toContainText('exact change');
  await page.tap('[data-to-wallet]');
  await page.waitForSelector('[data-swaps]');
  await page.tap('[data-swap="0"]'); // break the buck into quarters
  await expect(page.locator('.wallet-row', { hasText: 'Paw Quarter' })).toContainText('×4');
});