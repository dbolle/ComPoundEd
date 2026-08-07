// R0 (v1.47.3) — four confirmed defects, written FAILING against v1.47.2.
// Each one is a gate in front of something a child is supposed to reach:
// two dead buttons in the store, change coins voided after a store reset,
// and two games the "Play!" hero can never point at.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { epochOfId } from '../src/engine/ledger.js';
import { littleSuggestNext } from '../src/screens/little.js';
import { seedProfile, selectProfile, uniqueName } from './helpers.mjs';

const fund = (p, coins) => {
  let i = 0;
  for (const [denom, cents, n] of coins) {
    for (let k = 0; k < n; k++) {
      p.pawBucks.txns.push({ id: `f${i++}`, at: Date.now(), cents, denom, count: 1, reason: 'sitting' });
    }
  }
};

const known = (p, key) => {
  p.little.skills[key] = { attempts: 9, streak: 9 };
};

// --- 2. the change suffix the epoch parser doesn't know about -------------

test('epochOfId reads the -r- change suffix, not just -c-', () => {
  // A purchase's coin companions ride the buy id. Spends use -c-, change
  // uses -r- — and only -c- was in the regex, so after a store reset
  // (epoch ≥ 2) the child's change replayed as epoch 1 and got voided.
  expect(epochOfId('buy-teddy@2-c-dime'), 'spend companion').toBe(2);
  expect(epochOfId('buy-teddy@2-r-dime'), 'change companion').toBe(2);
  expect(epochOfId('buy-teddy@2'), 'the buy itself').toBe(2);
  expect(epochOfId('buy-teddy'), 'epoch 1 is implicit').toBe(1);
  // a rate tag must still never look like an epoch
  expect(epochOfId('mastery-mul-3x4@r2')).toBe(1);
});

// --- 3 & 4. games the frontier picker can never choose --------------------

// littleSuggestNext falls back to a daily rotation when NOTHING has a
// frontier, so "did it return this tile?" proves nothing on its own. What
// distinguishes a real frontier is the play-count rotation: the picker
// steps through the frontier games one per round played. So drive the
// play counter and assert which games the rotation actually visits.
const withPlays = (p, n) => ({ ...p, play: { 'dog-1': { fetch: n } } });
const rotation = (p, tiles, turns = 4) =>
  new Set(Array.from({ length: turns }, (_, i) => littleSuggestNext(withPlays(p, i), tiles).game));

test('Counting paths joins the frontier rotation (the tables gate depends on it)', () => {
  // tablesReady requires path:2, path:5 and path:10, so a child never
  // served Counting paths can never reach the multiplication track. With
  // no SKILL_DOMAIN entry, hasFrontier('paths') was false and the rotation
  // skipped it entirely — it only ever offered `count`.
  const p = newProfile('Pathless');
  const tiles = [{ game: 'paths' }, { game: 'count' }];
  expect(rotation(p, tiles), 'both games have numbers to learn').toEqual(
    new Set(['paths', 'count'])
  );

  // and once every stride is known it drops out of the rotation again.
  // v1.51.0 added 3s and 4s, so "every stride" is five, not three — the
  // game teaches what the tables gate now asks for.
  for (const t of [2, 3, 4, 5, 10]) known(p, `path:${t}`);
  expect(rotation(p, tiles), 'strides known ⇒ only count is left').toEqual(new Set(['count']));
});

test('Take away! leaves the rotation once its numbers are known', () => {
  // SKILL_DOMAIN said `taway` but the game records `takeaway:<n>`, so
  // knows() was never true and Take away! sat in the rotation forever,
  // crowding out games the child actually needed.
  const p = newProfile('Taker');
  const tiles = [{ game: 'taway' }, { game: 'count' }];
  expect(rotation(p, tiles), 'nothing known yet').toEqual(new Set(['taway', 'count']));

  for (let n = 0; n <= 9; n++) known(p, `takeaway:${n}`);
  expect(rotation(p, tiles), 'takeaway keys known ⇒ only count is left').toEqual(
    new Set(['count'])
  );
});

// --- 1. the two dead buttons in the store --------------------------------

test('e2e: a gift item opens its wearer picker without throwing, and Start over works', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Gifter'));
  doc.id = 'r0-gift-kid';
  doc.subjects = { ...doc.subjects, tables: true };
  doc.unlocks.push({ dogId: 'dog-2', table: 2, at: 1 });
  fund(doc, [['buck', 100, 2], ['quarter', 25, 2]]); // $2.50
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.evaluate(() => {
    location.hash = '#/store';
  });
  await page.waitForSelector('[data-item="sunglasses"]');

  // the gift path: picking a wearer must not throw, and the way back out
  // must still be wired (the throw landed between the two)
  await page.tap('[data-item="sunglasses"]');
  await page.waitForSelector('[data-wearer="dog-2"]');
  expect(errors, 'wearer picker threw').toEqual([]);
  await page.tap('[data-cancel]');
  await expect(page.locator('[data-item="sunglasses"]'), '← Back to the shelves').toBeVisible();

  // and in a real checkout, ↩️ Start over must empty the pay pile
  await page.tap('[data-item="ball"]'); // 25¢
  await page.waitForSelector('[data-trays]');
  await page.tap('[data-give="quarter"]');
  await expect(page.locator('[data-paid]')).toHaveText('25¢');
  await page.tap('[data-restart]');
  await expect(page.locator('[data-paid]'), '↩️ Start over').toHaveText('0¢');
  expect(errors).toEqual([]);
});
