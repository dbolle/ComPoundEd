// Audit regressions (v1.41.2). Written FAILING against v1.41.1:
//  C1 a pending-delete profile was re-created by the pull loop, then
//     silently swallowed every save (kid plays, nothing is written).
//  C2 the ETag earned by the final-progress PUT was never persisted to
//     the intent, so a dropped delete call self-conflicted forever.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { seedProfile, selectProfile, uniqueName, holdGrownupsGate, seedRemote } from './helpers.mjs';

async function readLocal(page, id) {
  return page.evaluate(
    (pid) =>
      new Promise((resolve) => {
        const req = indexedDB.open('compounded');
        req.onsuccess = () => {
          const g = req.result.transaction('profiles').objectStore('profiles').get(pid);
          g.onsuccess = () => resolve(g.result ?? null);
        };
      }),
    id
  );
}

async function enableSync(page) {
  await page.evaluate(() => { location.hash = '#/grownups'; });
  await holdGrownupsGate(page);
  await page.tap('[data-sync-toggle]');
  await page.waitForTimeout(1200);
}

test('C1: an offline delete is never resurrected by a later sync', async ({ page }) => {
  const doc = newProfile(uniqueName('Zombie'));
  doc.id = 'zombie-kid';
  await page.goto('/', { waitUntil: 'networkidle' });
  await seedProfile(page, doc);
  await seedRemote(page, doc);
  await selectProfile(page, doc.name);
  await enableSync(page);

  // delete while offline → durable intent, local copy gone
  await page.route('**/sync/**', (route) => route.abort());
  page.on('dialog', (d) => d.accept());
  await page.evaluate(() => { location.hash = '#/grownups'; });
  await holdGrownupsGate(page);
  await page.tap('[data-delete]');
  await page.waitForTimeout(600);
  expect(await readLocal(page, 'zombie-kid')).toBe(null);

  // ANOTHER device writes to the still-live server copy (advances gen),
  // exactly as a sibling's iPad would while the phone was offline
  await page.unroute('**/sync/**');
  const cur = await page.request.get('/sync/profiles/zombie-kid.json');
  const other = await cur.json();
  other.pawBucks = { txns: [{ id: 'other-coin', at: Date.now(), cents: 10, denom: 'dime', count: 1, reason: 'sitting' }] };
  await page.request.put('/sync/profiles/zombie-kid.json', { data: other, headers: { 'If-Match': cur.headers().etag } });

  // reconnect: the pull loop must NOT re-create the deleted profile
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  expect(await readLocal(page, 'zombie-kid')).toBe(null);
  await expect(page.locator(`.profile-card:has-text("${doc.name}")`)).toHaveCount(0);
  await page.request.delete('/sync/profiles/zombie-kid.json');
});

test('C1b: on a LEGACY server an offline delete stays deleted (no re-create loop)', async ({ page }) => {
  const doc = newProfile(uniqueName('LegacyDel'));
  doc.id = 'legacydel-kid';
  await page.goto('/', { waitUntil: 'networkidle' });
  await seedProfile(page, doc);
  await seedRemote(page, doc);
  await selectProfile(page, doc.name);
  await enableSync(page);

  // make the server look pre-cutover: legacy autoindex listing shape,
  // raw doc reads, blind PUTs accepted (no lifecycle endpoints)
  await page.route('**/sync/profiles/', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ name: 'legacydel-kid.json', type: 'file' }]),
    })
  );
  await page.route('**/sync/profiles/*/delete', (route) => route.fulfill({ status: 405, body: '' }));

  page.on('dialog', (d) => d.accept());
  await page.evaluate(() => { location.hash = '#/grownups'; });
  await holdGrownupsGate(page);
  await page.tap('[data-delete]');
  await page.waitForTimeout(800);
  expect(await readLocal(page, 'legacydel-kid')).toBe(null);

  // repeated syncs must not bring it back
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  expect(await readLocal(page, 'legacydel-kid')).toBe(null);
  await page.unroute('**/sync/profiles/');
  await page.unroute('**/sync/profiles/*/delete');
  await page.request.delete('/sync/profiles/legacydel-kid.json');
});

test('C1c: after deleting the active player the app leaves play — no mute session', async ({ page }) => {
  // The silent-loss shape was: profile visible, kid plays, nothing saved.
  // Deleting the ACTIVE player must land on the picker and leave nothing
  // playable behind (the throw in saveProfile is the belt-and-braces).
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Mute'));
  doc.id = 'mute-kid';
  doc.subjects = { ...doc.subjects, little: true };
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  page.on('dialog', (d) => d.accept());
  await page.evaluate(() => { location.hash = '#/grownups'; });
  await holdGrownupsGate(page);
  await page.tap('[data-delete]');
  await page.waitForSelector('[data-new]'); // bounced to the picker
  expect(await readLocal(page, 'mute-kid')).toBe(null);
  // a stale deep link into play cannot resurrect a mute session
  await page.evaluate(() => { location.hash = '#/little?game=count&v=frame'; });
  await page.waitForTimeout(800);
  await expect(page.locator('[data-new]')).toBeVisible(); // still the picker
  expect(await readLocal(page, 'mute-kid')).toBe(null);
});

test('C2: a dropped delete call does not self-conflict on the retry', async ({ page }) => {
  const doc = newProfile(uniqueName('Wedge'));
  doc.id = 'wedge-kid';
  await page.goto('/', { waitUntil: 'networkidle' });
  await seedProfile(page, doc);
  await seedRemote(page, doc);
  await selectProfile(page, doc.name);
  await enableSync(page);

  // let the final-progress PUT succeed, then drop ONLY the delete call
  let dropped = 0;
  await page.route('**/sync/profiles/*/delete', (route) => {
    dropped += 1;
    if (dropped === 1) return route.abort();
    return route.continue();
  });
  page.on('dialog', (d) => d.accept());
  await page.evaluate(() => { location.hash = '#/grownups'; });
  await holdGrownupsGate(page);
  await page.tap('[data-delete]');
  await page.waitForTimeout(1500);

  // the retry (next sync) must CONFIRM, not raise a conflict caused by
  // this device's own successful progress upload
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const gone = await page.request.get('/sync/profiles/wedge-kid.json');
  expect(gone.status()).toBe(410); // deletion completed on the retry

  // and no lifecycle conflict was left for the grown-up to resolve
  await page.waitForSelector('[data-new]');
  await page.tap('[data-new]');
  await page.fill('.name-input', 'Checker');
  await page.tap('form[data-create] [data-kind="big"]');
  await page.waitForSelector('.hero');
  await page.evaluate(() => { location.hash = '#/grownups'; });
  await holdGrownupsGate(page);
  await page.tap('[data-deleted-players]');
  await page.waitForTimeout(1200);
  await expect(page.locator('[data-conflict-row="wedge-kid"]')).toHaveCount(0);
  await page.unroute('**/sync/profiles/*/delete');
  await page.request.delete('/sync/profiles/wedge-kid.json');
});
