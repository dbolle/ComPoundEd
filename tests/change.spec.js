// v1.49.0 — counting out change at the counter. The engine has accepted
// overpayment plus counted-back change since v1.47.0, but no screen could
// reach it, so a wallet that couldn't make exact change hit a dead end
// dressed as help ("make change at the wallet").
//
// The load-bearing piece is canOverpay: the naive test ("do they hold a coin
// bigger than the price?") is wrong, and four quarters buying a 90¢ item is
// the case that proves it.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import {
  canOverpay,
  canMakeExact,
  changeFor,
  coinCounts,
  balanceCents,
  DENOMS,
} from '../src/engine/money.js';
import { buyGear, isOwned, CATALOG } from '../src/engine/gearshop.js';
import { seedProfile, selectProfile, uniqueName } from './helpers.mjs';

const fund = (p, coins) => {
  let i = 0;
  for (const [denom, n] of Object.entries(coins)) {
    const cents = DENOMS.find((d) => d.id === denom).cents;
    for (let k = 0; k < n; k++) {
      p.pawBucks.txns.push({ id: `f${i++}`, at: 1000 + i, cents, denom, count: 1, reason: 'sitting' });
    }
  }
};

const mulberry32 = (a) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Brute force the tap rule independently of the implementation. Enumerate
// MULTISETS, not orderings — orderings are factorial and blow up. A total is
// reachable exactly when some coin in the multiset could have been the last
// one handed over, i.e. removing it leaves the child still short. Counts are
// a plain array and `pick` is mutated in place: spreading an object in this
// loop made the whole check minutes instead of milliseconds.
const CENTS = DENOMS.map((d) => d.cents);
const IDS = DENOMS.map((d) => d.id);
const asArray = (counts) => IDS.map((id) => counts[id] ?? 0);

function reachableStops(counts, price) {
  const have = asArray(counts);
  const pick = new Array(CENTS.length).fill(0);
  const stops = new Set();
  const rec = (i, sum) => {
    if (i === CENTS.length) {
      if (sum < price) return;
      for (let d = 0; d < CENTS.length; d++) {
        if (pick[d] > 0 && sum - CENTS[d] < price) {
          stops.add(sum);
          return;
        }
      }
      return;
    }
    for (let k = 0; k <= have[i]; k++) {
      pick[i] = k;
      rec(i + 1, sum + k * CENTS[i]);
    }
    pick[i] = 0;
  };
  rec(0, 0);
  return stops;
}

test('four quarters for a 90¢ item: overpayment is the ONLY route', () => {
  const wallet = { quarter: 4 };
  // no single coin exceeds the price, which is why the naive test failed
  expect(Math.max(...DENOMS.filter((d) => wallet[d.id]).map((d) => d.cents))).toBeLessThan(90);
  expect(canMakeExact(wallet, 90), 'exact change is impossible').toBe(false);
  expect(canOverpay(wallet, 90), 'but the child can still buy it').toBe(true);
  // 25 → 50 → 75 are all short; the fourth quarter lands on 100
  expect([...reachableStops(wallet, 90)]).toEqual([100]);
});

test('canOverpay: named cases', () => {
  expect(canOverpay({ dime: 3 }, 30), 'three dimes land exactly on 30').toBe(false);
  expect(canMakeExact({ dime: 3 }, 30)).toBe(true);
  expect(canOverpay({ buck: 1 }, 10), 'a buck for a 10¢ toy').toBe(true);
  expect(canOverpay({ penny: 50 }, 30), 'pennies always land exactly').toBe(false);
  expect(canOverpay({}, 10), 'an empty wallet buys nothing').toBe(false);
  expect(canOverpay({ nickel: 2 }, 30), "can't even cover it").toBe(false);
  expect(canOverpay({ dime: 2, quarter: 1 }, 30), 'dime, dime, then a quarter').toBe(true);
});

test('canOverpay agrees with brute force over random wallets and real prices', () => {
  const prices = [...new Set(CATALOG.map((i) => i.price))].sort((a, b) => a - b);
  const denoms = DENOMS.map((d) => d.id);
  const bad = [];
  let checks = 0;
  let overpayable = 0;
  for (let seed = 1; seed <= 200; seed++) {
    const rnd = mulberry32(seed);
    const wallet = {};
    for (const d of denoms) {
      const n = Math.floor(rnd() * 4); // small kid wallets
      if (n) wallet[d] = n;
    }
    const total = asArray(wallet).reduce((s, n, i) => s + n * CENTS[i], 0);
    for (const price of prices) {
      if (total < price) continue; // the shelf blocks these
      const stops = reachableStops(wallet, price);
      const trueOverpay = [...stops].some((s) => s > price);
      const w = JSON.stringify(wallet);
      // NOTE: assertions are collected, not made in the loop. expect() costs
      // milliseconds each, and ~10k of them turned this from 0.4s into a
      // multi-minute hang.
      if (canOverpay(wallet, price) !== trueOverpay) bad.push(`canOverpay ${w} @ ${price}`);
      // between them the two doors always leave a way through
      if (!canMakeExact(wallet, price) && !trueOverpay) bad.push(`dead end ${w} @ ${price}`);
      for (const s of stops) if (s - price >= 100) bad.push(`change ${s - price}¢ ${w} @ ${price}`);
      checks += 1;
      if (trueOverpay) overpayable += 1;
    }
  }
  expect(bad.slice(0, 5), `${bad.length} failures of ${checks} checks`).toEqual([]);
  expect(checks, 'the sample actually covered affordable cases').toBeGreaterThan(1000);
  expect(overpayable, 'the overpay door is not a rare curiosity').toBeGreaterThan(50);
});

test('changeFor hands back the fewest coins, for every amount change can be', () => {
  expect(changeFor(90)).toEqual({ quarter: 3, dime: 1, nickel: 1 });
  expect(changeFor(15)).toEqual({ dime: 1, nickel: 1 });
  expect(changeFor(99)).toEqual({ quarter: 3, dime: 2, penny: 4 });
  // change is always 1..99¢ and the drawer is unlimited, so every amount has
  // to be makeable — the change step can never dead-end
  for (let c = 1; c <= 99; c++) {
    const got = changeFor(c);
    const sum = Object.entries(got).reduce(
      (s, [d, n]) => s + DENOMS.find((x) => x.id === d).cents * n,
      0
    );
    expect(sum, `change for ${c}¢`).toBe(c);
    expect(Object.values(got).every((n) => n > 0), 'no empty piles').toBe(true);
  }
});

test('a purchase through the overpay door balances, and the wallet keeps the change', () => {
  const p = newProfile('Overpayer');
  fund(p, { quarter: 4 }); // 100¢, and no way to make 90 exactly
  expect(balanceCents(p)).toBe(100);
  const change = changeFor(10);
  const txn = buyGear(p, 'bowl', null, Date.now(), { quarter: 4 }, change); // bowl = 90¢
  expect(txn, 'the engine accepts paid − change === price').toBeTruthy();
  expect(isOwned(p, 'bowl')).toBe(true);
  expect(balanceCents(p), '100 paid, 90 spent').toBe(10);
  expect(coinCounts(p), 'and the change is really in the wallet').toEqual({ dime: 1 });
});

test('the engine still refuses change that does not balance', () => {
  const p = newProfile('Cheat');
  fund(p, { quarter: 4 });
  expect(buyGear(p, 'bowl', null, Date.now(), { quarter: 4 }, { dime: 2 }), 'too much change').toBe(null);
  expect(buyGear(p, 'bowl', null, Date.now(), { quarter: 4 }, {}), 'no change at all').toBe(null);
  expect(buyGear(p, 'bowl', null, Date.now(), { quarter: 5 }, { dime: 1 }), 'coins not held').toBe(null);
  expect(isOwned(p, 'bowl'), 'nothing bought').toBe(false);
  expect(balanceCents(p), 'nothing charged').toBe(100);
});

// --- the counter, driven as a child would -------------------------------

const shopper = async (page, name, coins) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName(name));
  doc.id = `chg-${name.toLowerCase()}`;
  doc.subjects = { ...doc.subjects, tables: true };
  fund(doc, coins);
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.evaluate(() => {
    location.hash = '#/store';
  });
  await page.waitForSelector('[data-item="bowl"]');
  return doc;
};

test('e2e: four quarters, a 90¢ bowl — the old dead end is now the lesson', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const doc = await shopper(page, 'Quarters', { quarter: 4 });

  // exact change is impossible, so the overpay door opens directly — no
  // choice screen, and NOT the old "go swap coins at the wallet" dead end
  await page.tap('[data-item="bowl"]');
  await expect(page.locator('[data-checkout]')).toContainText('Hand over coins');
  await expect(page.locator('[data-checkout]')).not.toContainText('wallet');

  // ➕ stays live past the price: the fourth quarter is the whole point
  for (let i = 0; i < 4; i++) await page.tap('[data-give="quarter"]');
  await expect(page.locator('[data-paid]')).toHaveText('🐾$1.00');
  await expect(page.locator('[data-give="quarter"]'), 'covered ⇒ no more coins').toBeDisabled();

  await page.tap('[data-next-step]');
  await page.waitForSelector('[data-tray]');
  // counting UP from the price, not subtracting
  await expect(page.locator('[data-chain]')).toContainText('90¢');
  await expect(page.locator('[data-goal]')).toContainText('Count up to');
  // coins bigger than the change are not even offered
  await expect(page.locator('[data-add="quarter"]')).toHaveCount(0);
  await expect(page.locator('[data-add="buck"]')).toHaveCount(0);

  // a nickel is partway: still not payable
  await page.tap('[data-add="nickel"]');
  await expect(page.locator('[data-chain]')).toContainText('95¢');
  await expect(page.locator('[data-take-change]')).toBeDisabled();
  // put it back, take a dime instead
  await page.tap('[data-remove="nickel"]');
  await page.tap('[data-add="dime"]');
  await expect(page.locator('[data-goal]')).toContainText("That's it");
  await expect(page.locator('[data-take-change]')).toBeEnabled();

  // the action must be reachable on a phone, not below the fold
  const box = await page.locator('[data-take-change]').boundingBox();
  const h = page.viewportSize().height;
  expect(box.y + box.height, 'action button is on screen').toBeLessThanOrEqual(h);

  await page.tap('[data-take-change]');
  await expect(page.locator('[data-checkout]')).toContainText("It's yours");
  await page.tap('[data-done]');
  await expect(page.locator('[data-item="bowl"]')).toContainText('Owned');

  // 100 handed over, 90 spent, 10 back — and the coin is really there
  const after = await page.evaluate(async (id) => {
    const db = await new Promise((res) => {
      const r = indexedDB.open('compounded', 1);
      r.onsuccess = () => res(r.result);
    });
    const q = db.transaction('profiles').objectStore('profiles').get(id);
    return new Promise((res) => (q.onsuccess = () => res(q.result)));
  }, doc.id);
  expect(balanceCents(after)).toBe(10);
  expect(coinCounts(after)).toEqual({ dime: 1 });
  expect(errors).toEqual([]);
});

test('e2e: when both ways work, the child chooses', async ({ page }) => {
  // a quarter pays 25 exactly; three dimes overshoot it
  await shopper(page, 'Chooser', { quarter: 1, dime: 3 });
  await page.tap('[data-item="ball"]'); // 25¢
  await expect(page.locator('[data-checkout]')).toContainText('How do you want to pay?');
  await expect(page.locator('[data-door-exact]')).toBeVisible();
  await expect(page.locator('[data-door-over]')).toBeVisible();

  // the exact door is the flow that already existed
  await page.tap('[data-door-exact]');
  await page.waitForSelector('[data-trays]');
  await page.tap('[data-give="quarter"]');
  await expect(page.locator('[data-pay]')).toBeEnabled();
  await page.tap('[data-pay]');
  await expect(page.locator('[data-checkout]')).toContainText("It's yours");
});

test('e2e: nothing is charged until the change is right', async ({ page }) => {
  const doc = await shopper(page, 'Backer', { quarter: 4 });
  await page.tap('[data-item="bowl"]');
  for (let i = 0; i < 4; i++) await page.tap('[data-give="quarter"]');
  await page.tap('[data-next-step]');
  await page.waitForSelector('[data-tray]');

  // ↩️ Again clears the change tray
  await page.tap('[data-add="nickel"]');
  await page.tap('[data-restart]');
  await expect(page.locator('[data-chain]')).toHaveText('90¢');

  // ← Pay differently returns to step 1 with the payment intact
  await page.tap('[data-repay]');
  await expect(page.locator('[data-paid]')).toHaveText('🐾$1.00');
  // ↩️ Start over there really does clear the payment
  await page.tap('[data-restart]');
  await expect(page.locator('[data-paid]')).toHaveText('0¢');

  // and walking away records nothing at all
  await page.tap('[data-cancel]');
  await expect(page.locator('[data-item="bowl"]')).not.toContainText('Owned');
  const after = await page.evaluate(async (id) => {
    const db = await new Promise((res) => {
      const r = indexedDB.open('compounded', 1);
      r.onsuccess = () => res(r.result);
    });
    const q = db.transaction('profiles').objectStore('profiles').get(id);
    return new Promise((res) => (q.onsuccess = () => res(q.result)));
  }, doc.id);
  expect(balanceCents(after), 'nothing spent').toBe(100);
  expect(after.pawBucks.txns.filter((t) => t.reason === 'buy')).toEqual([]);
});
