// v1.24.0 BETA: the storefront behind the 🧪 flag — full coin-math
// checkout (bucks/quarters/dimes/nickels lines + addition totals), gift
// wearer binding, and two-way coin swaps.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { coinLines } from '../src/screens/store.js';
import { SWAPS, swapCoins, coinCounts, balanceCents } from '../src/engine/money.js';
import { seedProfile, selectProfile, holdGrownupsGate, uniqueName } from './helpers.mjs';

const fund = (p, coins) => {
  let i = 0;
  for (const [denom, cents, n] of coins) {
    for (let k = 0; k < n; k++) {
      p.pawBucks.txns.push({ id: `f${i++}`, at: Date.now(), cents, denom, count: 1, reason: 'sitting' });
    }
  }
};

test('coinLines: greedy largest-first with quarters, every count ≤ 12', () => {
  expect(coinLines(90)).toEqual([
    { count: 3, value: 25, label: '🪙 quarters', product: 75 },
    { count: 1, value: 10, label: '🪙 dimes', product: 10 },
    { count: 1, value: 5, label: '🪙 nickels', product: 5 },
  ]);
  expect(coinLines(1200)).toEqual([{ count: 12, value: 100, label: '💵 Paw Bucks', product: 1200 }]);
  expect(coinLines(125).map((l) => l.product)).toEqual([100, 25]);
  for (const price of [25, 30, 40, 50, 60, 75, 90, 100, 120, 125, 150, 160, 200, 800, 1200]) {
    for (const ln of coinLines(price)) expect(ln.count).toBeLessThanOrEqual(12);
    expect(coinLines(price).reduce((s, l) => s + l.product, 0)).toBe(price);
  }
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
  fund(doc, [['buck', 100, 3]]); // $3.00
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

  // buy the deluxe bowl: 90¢ → 3×25, 1×10, 1×5, total 75+10+5
  await page.tap('[data-item="bowl"]');
  await page.waitForSelector('[data-q]');
  const answerStep = async (ans) => {
    for (const d of String(ans)) await page.tap(`.numpad .key:text-is("${d}")`);
    await page.tap('.numpad .key.ok');
  };
  await expect(page.locator('[data-q]')).toHaveText('3 × 25 = ?');
  await answerStep(99); // wrong: gentle retry, same step
  await expect(page.locator('[data-q]')).toHaveText('3 × 25 = ?');
  await answerStep(75);
  await expect(page.locator('[data-q]')).toHaveText('1 × 10 = ?');
  await answerStep(10);
  await answerStep(5);
  await expect(page.locator('[data-q]')).toHaveText('75 + 10 + 5 = ?');
  await answerStep(90);
  await expect(page.locator('[data-checkout]')).toContainText("It's yours");
  await expect(page.locator('[data-checkout]')).toContainText('toy box');
  await page.tap('[data-done]');
  await expect(page.locator('[data-balance]')).toContainText('$2.10');
  await expect(page.locator('[data-item="bowl"]')).toContainText('Owned');

  // gift flow: sunglasses for Daisy ($2.00 → 2 × 100, single line)
  await page.tap('[data-item="sunglasses"]');
  await page.waitForSelector('[data-wearer="dog-2"]');
  await page.tap('[data-wearer="dog-2"]');
  await expect(page.locator('[data-q]')).toHaveText('2 × 100 = ?');
  await answerStep(200);
  await expect(page.locator('[data-checkout]')).toContainText('Daisy is wearing it');
  const svg = await page.locator('[data-checkout] .dog svg').first().evaluate((e) => e.outerHTML);
  expect(svg).toContain('data-acc="sunglasses"');
  await page.tap('[data-done]');
  await expect(page.locator('[data-balance]')).toContainText('$0.10');

  // 10¢ left: the crown is unaffordable — tap explains, no checkout
  await page.tap('[data-item="crown"]');
  await expect(page.locator('.toast')).toContainText('Keep saving');
});
