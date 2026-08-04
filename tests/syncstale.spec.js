// v1.47.4 sync honesty. A device can be switched ON and still never reach
// the home server — an untrusted certificate, a changed address, a guest
// network. Nothing in the app said so, which is how two iPads went days
// without backing up (2026-08-03). Staleness is now surfaced where a
// parent looks, and a transport failure names the cause we cannot detect.
import { test, expect } from '@playwright/test';
import { syncStaleness, STALE_WARN_DAYS, STALE_ALARM_DAYS } from '../src/data/store.js';
import { stalenessLine, offlineHint } from '../src/ui.js';
import { newProfile } from '../src/data/schema.js';
import { seedProfile, selectProfile, uniqueName, holdGrownupsGate } from './helpers.mjs';

const DAY = 86400000;
const NOW = 1_800_000_000_000;
const at = (daysAgo) => NOW - daysAgo * DAY;

test('staleness: a device that only CHECKS IN is healthy (no news is not silence)', () => {
  // The real iPhone made 95 successful requests and zero pushes, because
  // it had nothing new to send. Judging on lastPushAt alone would have
  // called a perfectly healthy device stale.
  const s = { enabled: true, lastPushAt: at(30), lastPullAt: at(0) };
  expect(syncStaleness(s, NOW).level).toBe('ok');
  expect(stalenessLine(syncStaleness(s, NOW))).toBe(null);
});

test('staleness: thresholds, and silence when there is nothing to claim', () => {
  const mk = (d) => ({ enabled: true, lastPushAt: at(d), lastPullAt: at(d) });
  expect(syncStaleness(mk(0), NOW).level).toBe('ok');
  expect(syncStaleness(mk(STALE_WARN_DAYS - 1), NOW).level).toBe('ok');
  expect(syncStaleness(mk(STALE_WARN_DAYS), NOW).level).toBe('warn');
  expect(syncStaleness(mk(STALE_ALARM_DAYS - 1), NOW).level).toBe('warn');
  expect(syncStaleness(mk(STALE_ALARM_DAYS), NOW).level).toBe('alarm');
  expect(syncStaleness(mk(40), NOW).days).toBe(40);

  // backup off ⇒ no claim either way; the app must not imply a device is
  // failing when the family never asked it to back up
  expect(syncStaleness({ enabled: false, lastPushAt: null, lastPullAt: null }, NOW).level).toBe('off');
  expect(stalenessLine({ level: 'off', days: null })).toBe(null);
  expect(stalenessLine({ level: 'ok', days: 0 })).toBe(null);

  // on, but never once succeeded — the iPad case exactly
  expect(syncStaleness({ enabled: true, lastPushAt: null, lastPullAt: null }, NOW).level).toBe('never');
  expect(stalenessLine({ level: 'never', days: null })).toMatch(/never backed up/i);
});

test('staleness copy: names the update consequence, and agrees on number–noun', () => {
  // a device that cannot sync cannot fetch a service-worker update either
  // — that is why both iPads were stranded on old versions
  expect(stalenessLine({ level: 'warn', days: 4 })).toMatch(/app updates/i);
  expect(stalenessLine({ level: 'warn', days: 1 })).toContain('1 day —');
  expect(stalenessLine({ level: 'warn', days: 5 })).toContain('5 days —');
});

test('offline hint: only on https, and never guesses on plain http', () => {
  // On http there is no certificate in play, so the hint would be a lie.
  expect(offlineHint('http://192.168.1.10:8091')).toBe(null);
  const h = offlineHint('https://compounded.lan');
  expect(h).toMatch(/certificate/i);
  expect(h, 'names the origin to try, not a hardcoded host').toContain('https://compounded.lan');
});

test('e2e: Grown-Ups shows the stale warning; a healthy device stays quiet', async ({ page }) => {
  // The device the warning is FOR cannot reach the server — that is the
  // whole scenario. With a working /sync/ the boot check-in immediately
  // heals the staleness (correctly), so block it the way an untrusted
  // certificate does: the request never lands.
  await page.route('**/sync/**', (r) => r.abort());
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Stale'));
  doc.id = 'stale-kid';
  await seedProfile(page, doc);

  // switch backup on and backdate this device's last contact
  await page.evaluate(async (old) => {
    const db = await new Promise((res) => {
      const r = indexedDB.open('compounded', 1);
      r.onsuccess = () => res(r.result);
    });
    const tx = db.transaction('meta', 'readwrite');
    tx.objectStore('meta').put(true, 'syncEnabled');
    tx.objectStore('meta').put(old, 'lastPullAt');
    tx.objectStore('meta').put(old, 'lastPushAt');
    await new Promise((res) => (tx.oncomplete = res));
  }, Date.now() - 9 * DAY);
  await page.reload({ waitUntil: 'networkidle' });

  // the profiles screen is where a parent lands — the warning belongs there
  // (a seeded profile sends the app to the home screen, so ask for it)
  await page.evaluate(() => {
    location.hash = '#/profiles';
  });
  await page.waitForSelector('.profile-card');
  await expect(page.locator('[data-stale]')).toContainText("hasn't reached the home server in 9 days");

  await selectProfile(page, doc.name);
  await page.evaluate(() => {
    location.hash = '#/grownups';
  });
  await holdGrownupsGate(page);
  const status = page.locator('[data-sync-status]');
  await expect(status).toContainText("hasn't reached the home server");
  await expect(status).toHaveAttribute('data-level', 'alarm');

  // now let it reach the server again — the warning must disappear
  await page.unroute('**/sync/**');
  await page.evaluate(async () => {
    const db = await new Promise((res) => {
      const r = indexedDB.open('compounded', 1);
      r.onsuccess = () => res(r.result);
    });
    const tx = db.transaction('meta', 'readwrite');
    tx.objectStore('meta').put(Date.now(), 'lastPullAt');
    await new Promise((res) => (tx.oncomplete = res));
  });
  await page.evaluate(() => {
    location.hash = '#/profiles';
  });
  await page.waitForSelector('.profile-card');
  await expect(page.locator('[data-stale]'), 'a healthy device says nothing').toHaveCount(0);
});
