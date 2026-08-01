// v1.41.0 storage fallback: no silent second universe. IndexedDB failure
// on a device that had it → degraded warning + localStorage fallback;
// the next healthy boot merges everything (profiles AND critical meta)
// back, clearing fallback entries only after verified IDB commits.
import { test, expect } from '@playwright/test';

const BREAK_IDB = `
  try { localStorage.setItem('compounded:backend', 'idb'); } catch {}
  Object.defineProperty(window, 'indexedDB', {
    value: { open: () => { throw new Error('idb broken (test)'); } },
  });
`;

test('e2e: broken IndexedDB shows the degraded banner; creation asks; recovery merges back', async ({ browser, baseURL }) => {
  // Session 1: degraded — banner, acknowledged creation, play persists to LS
  const degraded = await browser.newContext({ baseURL, viewport: { width: 390, height: 664 }, hasTouch: true, isMobile: true });
  await degraded.addInitScript(BREAK_IDB);
  const D = await degraded.newPage();
  D.on('dialog', (d) => d.accept()); // acknowledge degraded creation
  await D.goto('/', { waitUntil: 'networkidle' });
  await expect(D.locator('[data-storage-warning]')).toContainText(/hiccup|SAFE/);
  await D.tap('[data-new]');
  await D.fill('.name-input', 'Fallback');
  await D.tap('form[data-create] [data-kind="little"]');
  await D.waitForSelector('.little-tile');
  // play one answer so real progress lands in the fallback store
  await D.evaluate(() => { location.hash = '#/little?game=count&v=frame'; });
  await D.waitForSelector('.little-card');
  await D.tap('.little-card[data-good="1"]');
  await D.waitForTimeout(1500);
  // the profile lives in localStorage, not IDB
  const lsState = await D.evaluate(() => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
    return keys.filter((k) => k.startsWith('compounded:profile:'));
  });
  expect(lsState.length).toBe(1);
  const storageSnapshot = await D.evaluate(() => {
    const out = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      out[k] = localStorage.getItem(k);
    }
    return out;
  });
  await degraded.close();

  // Session 2: healthy boot with the same localStorage → reconciliation
  const healthy = await browser.newContext({ baseURL, viewport: { width: 390, height: 664 }, hasTouch: true, isMobile: true });
  await healthy.addInitScript((snap) => {
    for (const [k, v] of Object.entries(snap)) localStorage.setItem(k, v);
  }, storageSnapshot);
  const H = await healthy.newPage();
  await H.goto('/', { waitUntil: 'networkidle' });
  await H.waitForSelector('.profile-card:has-text("Fallback"), .little-hero');
  // merged into IDB…
  const inIdb = await H.evaluate(
    () =>
      new Promise((resolve) => {
        const req = indexedDB.open('compounded');
        req.onsuccess = () => {
          const g = req.result.transaction('profiles').objectStore('profiles').getAll();
          g.onsuccess = () => resolve(g.result.map((p) => p.name));
        };
      })
  );
  expect(inIdb).toContain('Fallback');
  // …and the fallback entries were cleared after verification
  const leftover = await H.evaluate(() => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
    return keys.filter((k) => k.startsWith('compounded:profile:'));
  });
  expect(leftover).toEqual([]);
  await healthy.close();
});

test('e2e: reconciliation is idempotent — an interrupted first pass completes on the next boot', async ({ browser, baseURL }) => {
  // simulate "interrupted halfway": fallback holds a profile AND meta;
  // first healthy boot processes them; a second boot with a re-injected
  // leftover meta entry converges without duplicating anything
  const doc = { id: 'recover-kid', name: 'Recover', schemaVersion: 1, facts: {}, unlocks: [], play: {}, speed: { avgMs: 0, samples: 0 } };
  const ctx = await browser.newContext({ baseURL, viewport: { width: 390, height: 664 }, hasTouch: true, isMobile: true });
  await ctx.addInitScript((d) => {
    localStorage.setItem('compounded:profile:recover-kid', JSON.stringify(d));
    localStorage.setItem('compounded:meta:soundEnabled', JSON.stringify({ __seq: 99, at: 1, v: false }));
  }, doc);
  const P = await ctx.newPage();
  await P.goto('/', { waitUntil: 'networkidle' });
  await P.waitForSelector('.profile-card:has-text("Recover")');
  // meta envelope won (higher seq than anything in fresh IDB)
  const sound = await P.evaluate(
    () =>
      new Promise((resolve) => {
        const req = indexedDB.open('compounded');
        req.onsuccess = () => {
          const g = req.result.transaction('meta').objectStore('meta').get('soundEnabled');
          g.onsuccess = () => resolve(g.result);
        };
      })
  );
  expect(sound?.v ?? sound).toBe(false);
  // second boot: nothing left to do, nothing breaks
  await P.reload({ waitUntil: 'networkidle' });
  await P.waitForSelector('.profile-card:has-text("Recover")');
  await ctx.close();
});
