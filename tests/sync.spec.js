// Family backup against the hermetic in-memory /sync/ store (tests/server.mjs)
// — never the real home server.
import { test, expect } from '@playwright/test';
import {
  seedProfile,
  readProfile,
  selectProfile,
  playQuestions,
  holdGrownupsGate,
  norm,
  stat,
  openTableGrid,
} from './helpers.mjs';

function doc(id, name) {
  const facts = {};
  for (let b = 0; b <= 12; b++) facts[norm(2, b)] = stat(4);
  return {
    id,
    schemaVersion: 3,
    name,
    avatarDogId: 'starter',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    facts,
    unlocks: [
      { dogId: 'starter', table: null, at: Date.now() },
      { dogId: 'dog-2', table: 2, at: Date.now() },
    ],
    play: { 'dog-2': { walk: 3, feed: 0, fetch: 0 } },
  };
}

async function enableBackup(page) {
  await page.tap('[data-nav="/grownups"]');
  await holdGrownupsGate(page);
  await page.tap('[data-sync-toggle]');
  await page.waitForTimeout(1200);
}

test('backup → restore on a new device → two-way merge', async ({ page, browser, baseURL }) => {
  // Device A: seed, enable backup
  await page.goto('/', { waitUntil: 'networkidle' });
  await seedProfile(page, doc('sync-kid', 'SyncKid'));
  await selectProfile(page, 'SyncKid');
  await enableBackup(page);

  const listing = await (await fetch(`${baseURL}/sync/profiles/`)).json();
  expect(listing.map((f) => f.name)).toContain('sync-kid.json');

  // Device B: fresh context, restore
  const ctxB = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 664 },
    hasTouch: true,
    isMobile: true,
  });
  const B = await ctxB.newPage();
  await B.goto('/', { waitUntil: 'networkidle' });
  await B.tap('[data-restore]');
  await B.waitForSelector('.profile-card:has-text("SyncKid")');
  await B.tap('.profile-card:has-text("SyncKid")');
  await B.waitForSelector('.hero');
  const onB = await readProfile(B, 'sync-kid');
  expect(Object.keys(onB.facts).length).toBe(13);
  expect(onB.play['dog-2'].walk).toBe(3);

  // B plays ×3; A pulls on next boot and keeps its own data too
  await openTableGrid(B);
  await B.tap('.table-grid .table-btn:nth-child(3)');
  await playQuestions(B, 12);
  await B.waitForSelector('.big-score');
  await B.waitForTimeout(2200); // debounced push

  await page.goto('/#/home', { waitUntil: 'networkidle' });
  const onA = await readProfile(page, 'sync-kid');
  const x3 = Object.keys(onA.facts).filter((k) => k.split('x').includes('3')).length;
  expect(x3).toBeGreaterThan(0);
  expect(onA.facts['2x4'].box).toBe(4);
  await ctxB.close();
});

test('boot stays fast when the backup server is unreachable', async ({ page, browser, baseURL }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await seedProfile(page, doc('sync-off', 'SyncOff'));
  await selectProfile(page, 'SyncOff');
  await enableBackup(page);

  await page.context().route('**/sync/**', (r) => r.abort());
  const t0 = Date.now();
  await page.goto('/#/home', { waitUntil: 'networkidle' });
  await page.waitForSelector('.hero');
  expect(Date.now() - t0).toBeLessThan(8000);
});

test('restore reports nothing found and stays disabled on an empty server', async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 664 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await ctx.newPage();
  // Block sync so this context sees an "empty/unreachable" store regardless
  // of what other tests pushed.
  await ctx.route('**/sync/**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  );
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.tap('[data-restore]');
  await page.waitForSelector('.toast');
  expect(await page.textContent('.toast')).toContain('No backup found');
  await ctx.close();
});
