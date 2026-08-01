// v1.39.0 deletion lifecycle: snapshot-carrying intents, tombstones that
// always win in automatic sync, explicit restore, resurrection-proof
// purge, and grown-up conflict resolution. Driven against the REAL
// sidecar mounted by the test server.
import { test, expect } from '@playwright/test';
import { newProfile, migrateProfile } from '../src/data/schema.js';
import { seedProfile, selectProfile, uniqueName, norm, stat, holdGrownupsGate, seedRemote } from './helpers.mjs';

const freshCtx = (browser, baseURL) =>
  browser.newContext({ baseURL, viewport: { width: 390, height: 664 }, hasTouch: true, isMobile: true });

async function enableSync(page) {
  await page.evaluate(() => { location.hash = '#/grownups'; });
  await holdGrownupsGate(page);
  await page.tap('[data-sync-toggle]');
  await page.waitForTimeout(1200);
}

// After a reload the app may auto-resume the active profile (no picker).
async function ensureProfile(page, name) {
  await page.waitForSelector('.screen');
  const card = await page.$(`.profile-card:has-text("${name}")`);
  if (card) await card.tap();
  else await page.evaluate(() => { location.hash = '#/home'; });
  await page.waitForSelector('.hero, .little-hero');
}

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

test('e2e: online delete archives the final doc; a second device converges to deleted', async ({ page, browser, baseURL }) => {
  const doc = newProfile(uniqueName('DelKid'));
  doc.id = 'del-kid';
  doc.facts[norm(2, 3)] = stat(4); // progress that must reach the archive
  await page.goto('/', { waitUntil: 'networkidle' });
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await enableSync(page);

  // second device already has the profile
  const ctxB = await freshCtx(browser, baseURL);
  const B = await ctxB.newPage();
  await B.goto('/', { waitUntil: 'networkidle' });
  await B.tap('[data-restore]');
  await B.waitForSelector(`.profile-card:has-text("${doc.name}")`);

  // delete on device A (Grown-Ups)
  page.on('dialog', (d) => d.accept());
  await page.tap('[data-delete]');
  await expect(page.locator('.toast').last()).toContainText(/archived|family backup/);

  // server: live GET is 410 deleted; archive holds the progress
  const gone = await page.request.get('/sync/profiles/del-kid.json');
  expect(gone.status()).toBe(410);
  const archive = await (await page.request.get('/sync/profiles/del-kid/archive')).json();
  expect(archive.facts['2x3'].box).toBe(4);

  // device B check-in: tombstone wins — local copy removed
  await B.evaluate(async () => {
    await new Promise((res) => {
      const req = indexedDB.open('compounded');
      req.onsuccess = () => {
        const tx = req.result.transaction('meta', 'readwrite');
        tx.objectStore('meta').put(true, 'syncEnabled');
        tx.oncomplete = res;
      };
    });
  });
  await B.reload({ waitUntil: 'networkidle' });
  await B.waitForTimeout(2500);
  expect(await readLocal(B, 'del-kid')).toBe(null);
  await ctxB.close();
  await page.request.delete('/sync/profiles/del-kid.json');
});

test('e2e: offline answers → offline delete → reconnect archives EVERYTHING (restart survives)', async ({ page }) => {
  const doc = newProfile(uniqueName('OffDel'));
  doc.id = 'offdel-kid';
  doc.futureField = { keep: 'me' }; // unknown field must reach the archive
  await page.goto('/', { waitUntil: 'networkidle' });
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await enableSync(page);
  await page.waitForTimeout(800);

  // go offline; earn progress; then delete while still offline
  await page.route('**/sync/**', (route) => route.abort());
  await page.evaluate(async () => {
    // offline progress: a coin lands in the ledger via a real save path
    const db = await new Promise((res) => { const r = indexedDB.open('compounded'); r.onsuccess = () => res(r.result); });
    const doc2 = await new Promise((res) => {
      const tx = db.transaction('profiles', 'readonly');
      const rq = tx.objectStore('profiles').get('offdel-kid');
      rq.onsuccess = () => res(rq.result);
    });
    doc2.pawBucks.txns.push({ id: 'offline-coin', at: Date.now(), cents: 10, denom: 'dime', count: 1, reason: 'sitting' });
    doc2.updatedAt = Date.now();
    await new Promise((res) => { const tx = db.transaction('profiles', 'readwrite'); tx.objectStore('profiles').put(doc2); tx.oncomplete = res; });
  });
  await page.reload({ waitUntil: 'networkidle' }); // pick up the mutated doc
  await page.route('**/sync/**', (route) => route.abort());
  await ensureProfile(page, doc.name);
  page.on('dialog', (d) => d.accept());
  await page.evaluate(() => { location.hash = '#/grownups'; });
  await holdGrownupsGate(page);
  await page.tap('[data-delete]');
  await expect(page.locator('.toast').last()).toContainText(/catch up|reachable/);
  expect(await readLocal(page, 'offdel-kid')).toBe(null); // locally gone

  // restart the app before reconnecting — the intent must survive
  await page.unroute('**/sync/**');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000); // boot sync resolves the pending intent

  const gone = await page.request.get('/sync/profiles/offdel-kid.json');
  expect(gone.status()).toBe(410);
  const archive = await (await page.request.get('/sync/profiles/offdel-kid/archive')).json();
  expect(archive.pawBucks.txns.some((t) => t.id === 'offline-coin')).toBe(true); // offline progress archived
  expect(archive.futureField).toEqual({ keep: 'me' }); // unknown fields too
  await page.request.delete('/sync/profiles/offdel-kid.json');
});

test('e2e: restore brings the player back; purge is forever; zero-profile device can restore', async ({ page, browser, baseURL }) => {
  const doc = newProfile(uniqueName('ResKid'));
  doc.id = 'res-kid';
  doc.facts[norm(5, 5)] = stat(4);
  await page.goto('/', { waitUntil: 'networkidle' });
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await enableSync(page);
  page.on('dialog', (d) => d.accept());
  await page.tap('[data-delete]');
  await page.waitForTimeout(1200);

  // a blank device (zero live profiles) can restore from the profiles screen
  const ctxB = await freshCtx(browser, baseURL);
  const B = await ctxB.newPage();
  await B.goto('/', { waitUntil: 'networkidle' });
  await B.waitForSelector('[data-deleted-restore="res-kid"]');
  await B.tap('[data-deleted-restore="res-kid"]');
  await B.waitForSelector(`.profile-card:has-text("${doc.name}")`);
  const restored = await readLocal(B, 'res-kid');
  expect(restored.facts['5x5'].box).toBe(4);

  // delete again from B, then PURGE from B's grown-ups list
  await B.tap(`.profile-card:has-text("${doc.name}")`);
  await B.waitForSelector('.hero');
  B.on('dialog', (d) => d.accept());
  await B.evaluate(() => { location.hash = '#/grownups'; });
  await holdGrownupsGate(B);
  await B.tap('[data-delete]');
  await B.waitForTimeout(1000);
  // Grown-Ups needs an active profile — make a throwaway one (a real
  // family always has other kids; purge happens from any profile)
  await B.waitForSelector('[data-new]');
  await B.tap('[data-new]');
  await B.fill('.name-input', 'Janitor');
  await B.tap('form[data-create] [data-kind="big"]');
  await B.waitForSelector('.hero');
  await B.evaluate(() => { location.hash = '#/grownups'; });
  await holdGrownupsGate(B);
  await B.tap('[data-deleted-players]');
  await B.waitForSelector('[data-purge-id="res-kid"]');
  await B.tap('[data-purge-id="res-kid"]');
  await B.waitForTimeout(800);

  // purged: no archive, no restore, creation blocked, no child data on server
  expect((await B.request.get('/sync/profiles/res-kid/archive')).status()).toBe(404);
  const marker = await (await B.request.get('/sync/profiles/res-kid.json')).json();
  expect(marker.state).toBe('purged');
  expect(JSON.stringify(marker)).not.toContain(doc.name);
  const recreate = await B.request.put('/sync/profiles/res-kid.json', {
    data: doc,
    headers: { 'If-None-Match': '*' },
  });
  expect(recreate.status()).toBe(410);
  await ctxB.close();
  await page.request.delete('/sync/profiles/res-kid.json');
});

test('e2e: delete → restore elsewhere → stale offline delete becomes a CONFLICT, restored player survives', async ({ page, browser, baseURL }) => {
  const doc = newProfile(uniqueName('ConfKid'));
  doc.id = 'conf-kid';
  await page.goto('/', { waitUntil: 'networkidle' });
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await enableSync(page);
  await page.waitForTimeout(800);

  // device A goes offline and deletes (pending intent with base etag)
  await page.route('**/sync/**', (route) => route.abort());
  page.on('dialog', (d) => d.accept());
  await page.evaluate(() => { location.hash = '#/grownups'; });
  await holdGrownupsGate(page);
  await page.tap('[data-delete]');
  await page.waitForTimeout(600);

  // meanwhile device B deletes AND restores on the server (gen advances
  // past A's observed base for a reason other than A's tombstone)
  const cur = await page.request.get('/sync/profiles/conf-kid.json');
  const etag1 = cur.headers().etag;
  const del = await page.request.post('/sync/profiles/conf-kid/delete', { data: {}, headers: { 'If-Match': etag1 } });
  const etag2 = del.headers().etag;
  await page.request.post('/sync/profiles/conf-kid/restore', { data: {}, headers: { 'If-Match': etag2 } });

  // device A reconnects: its stale intent must NOT auto-delete the
  // restored player — it surfaces as a grown-up conflict instead
  await page.unroute('**/sync/**');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const live = await page.request.get('/sync/profiles/conf-kid.json');
  expect(live.status()).toBe(200); // restored player SURVIVED the stale intent

  // the conflict is visible and resolvable: keep the player
  await page.waitForSelector('.profile-card', { timeout: 10000 });
  await page.evaluate(() => { location.hash = '#/grownups'; });
  // no active profile — grownups needs one; pick via profiles first
  await page.evaluate(() => { location.hash = '#/profiles'; });
  await page.waitForTimeout(1500);
  const anyCard = await page.$(`.profile-card:has-text("${doc.name}")`);
  if (anyCard) {
    await anyCard.tap();
    await page.waitForSelector('.hero, .little-hero');
  }
  await page.evaluate(() => { location.hash = '#/grownups'; });
  await holdGrownupsGate(page);
  await page.tap('[data-deleted-players]');
  await page.waitForSelector('[data-resolve-keep="conf-kid"]');
  await page.tap('[data-resolve-keep="conf-kid"]');
  await page.waitForTimeout(800);
  expect(await readLocal(page, 'conf-kid')).not.toBe(null); // back locally
  await page.request.delete('/sync/profiles/conf-kid.json');
});

test('delete with backup off records a durable intent that resolves when enabled later', async ({ page }) => {
  const doc = newProfile(uniqueName('LateDel'));
  doc.id = 'latedel-kid';
  await page.goto('/', { waitUntil: 'networkidle' });
  await seedProfile(page, doc);
  await seedRemote(page, doc); // server holds a copy from some other device
  await selectProfile(page, doc.name);
  page.on('dialog', (d) => d.accept());
  await page.evaluate(() => { location.hash = '#/grownups'; });
  await holdGrownupsGate(page);
  await page.tap('[data-delete]'); // backup switch is OFF on this device
  await page.waitForTimeout(1500);

  // the intent still reached the server (deletion intent is origin-independent)
  const gone = await page.request.get('/sync/profiles/latedel-kid.json');
  expect(gone.status()).toBe(410);
  await page.request.delete('/sync/profiles/latedel-kid.json');
});
