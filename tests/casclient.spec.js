// Client side of the CAS protocol (v1.38): conflict-retry convergence
// under a real concurrent write, the denied/locked UX, and the family
// key header path.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { seedProfile, selectProfile, uniqueName, holdGrownupsGate, seedRemote, openServerSection } from './helpers.mjs';

test('e2e: a write landing between pull and push is merged, not overwritten', async ({ page }) => {
  const doc = newProfile(uniqueName('Race'));
  doc.id = 'race-kid';
  doc.subjects = { ...doc.subjects, tables: true };
  await page.goto('/', { waitUntil: 'networkidle' });
  await seedProfile(page, doc);
  await seedRemote(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.hero');
  await page.evaluate(() => { location.hash = '#/grownups'; });
  await holdGrownupsGate(page);
  await openServerSection(page);
  await page.tap('[data-sync-toggle]'); // sync on; app now holds the current ETag
  await page.waitForTimeout(1500);

  // ANOTHER device writes: bump the server copy behind the app's back
  const cur = await page.request.get('/sync/profiles/race-kid.json');
  const etag = cur.headers().etag;
  const other = await cur.json();
  other.pawBucks = { txns: [{ id: 'other-device-coin', at: Date.now(), cents: 10, denom: 'dime', count: 1, reason: 'sitting' }] };
  const put = await page.request.put('/sync/profiles/race-kid.json', {
    data: other,
    headers: { 'If-Match': etag },
  });
  expect(put.status()).toBe(200);

  // THIS device changes a setting → save → CAS push with the now-stale
  // ETag → 412 → pull/merge/retry
  await page.tap('[data-subj="hideSitting"]');
  await page.waitForTimeout(3000);

  const server = await (await page.request.get('/sync/profiles/race-kid.json')).json();
  expect(server.subjects.hideSitting).toBe(true); // this device's change
  expect(server.pawBucks.txns.some((t) => t.id === 'other-device-coin')).toBe(true); // the other's survived
  await page.request.delete('/sync/profiles/race-kid.json');
});

test('e2e: denied server shows the locked state; the key header unlocks it', async ({ page }) => {
  // emulate a keyed server: 403 unless the right key header arrives
  await page.route('**/sync/profiles/**', async (route) => {
    const key = route.request().headers()['x-sync-key'];
    if (key === 'magic-key') return route.continue();
    return route.fulfill({ status: 403, contentType: 'application/json', body: '{"error":"family key required"}' });
  });

  const doc = newProfile(uniqueName('Locked'));
  doc.id = 'locked-kid';
  await page.goto('/', { waitUntil: 'networkidle' });
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.evaluate(() => { location.hash = '#/grownups'; });
  await holdGrownupsGate(page);
  await openServerSection(page);
  await page.tap('[data-sync-toggle]');
  await page.waitForTimeout(800);
  await page.tap('[data-sync-now]');
  await expect(page.locator('.toast').last()).toContainText(/locked|key/i);
  await expect(page.locator('[data-sync-status]')).toContainText(/locked|key/i);

  // enter the key (http origin → confirm dialog for the acknowledgement)
  page.on('dialog', (d) => d.accept());
  await page.fill('[data-sync-key]', 'magic-key');
  await page.tap('[data-sync-key-save]');
  await expect(page.locator('.toast').last()).toContainText(/unlocked|saved/i);
  await page.unroute('**/sync/profiles/**');
});
