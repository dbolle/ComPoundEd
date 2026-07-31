// Privacy and offline invariants (v1.36.0). Authorization is INTENT-based,
// not just the backup switch: ordinary kid flows never upload profile
// data unless backup is enabled; explicit grown-up actions may make
// authenticated requests; probes carry no key and no child data.
// @secure-tagged specs need a secure context (service worker) and run in
// their own lane: TEST_HOST=127.0.0.1 ONLY_SECURE=1 npm test.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { seedProfile, selectProfile, uniqueName, norm, stat } from './helpers.mjs';

function recordRequests(page) {
  const out = [];
  page.on('request', (req) => {
    out.push({ url: req.url(), method: req.method(), body: req.postData() ?? '' });
  });
  return out;
}

test('every request stays same-origin through a full kid flow', async ({ page, baseURL }) => {
  const reqs = recordRequests(page);
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Priv'));
  doc.id = 'priv-kid';
  doc.subjects = { ...doc.subjects, tables: true };
  for (let b = 0; b <= 12; b++) doc.facts[norm(2, b)] = stat(2);
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.hero');
  await page.evaluate(() => { location.hash = '#/pack'; });
  await page.waitForSelector('.pack-grid');
  await page.evaluate(() => { location.hash = '#/wallet'; });
  await page.waitForSelector('.wallet-rows');
  const origin = new URL(baseURL).origin;
  const offenders = reqs.filter((r) => !r.url.startsWith(origin) && !r.url.startsWith('data:'));
  expect(offenders).toEqual([]);
});

test('ordinary kid flows upload no profile data while backup is disabled', async ({ page }) => {
  const reqs = recordRequests(page);
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('NoUpload'));
  doc.id = 'noupload-kid';
  doc.subjects = { ...doc.subjects, little: true };
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.little-hero');
  // play a little round (saves happen) with backup off
  await page.evaluate(() => { location.hash = '#/little?game=count&v=frame'; });
  await page.waitForSelector('.little-card');
  await page.tap('.little-card[data-good="1"]');
  await page.waitForTimeout(1500);
  // no request carried the kid's name or id, and nothing was PUT
  const uploads = reqs.filter((r) => r.method === 'PUT' || r.method === 'POST');
  expect(uploads).toEqual([]);
  const leaky = reqs.filter((r) => r.body.includes('noupload-kid') || r.body.includes(doc.name));
  expect(leaky).toEqual([]);
});

test('the backup-offer probe sends no key and no child data', async ({ page }) => {
  // seed a remote profile so the probe has something to find
  const remote = newProfile('ProbeKid');
  remote.id = 'probe-kid';
  await page.request.put('/sync/profiles/probe-kid.json', { data: remote });
  const reqs = recordRequests(page);
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-offer-on]');
  const probes = reqs.filter((r) => r.url.includes('/sync/'));
  expect(probes.length).toBeGreaterThan(0);
  for (const p of probes) {
    expect(p.method).toBe('GET'); // probe reads, never writes
    expect(p.body).toBe('');
  }
  await page.request.delete('/sync/profiles/probe-kid.json');
});

test('@secure service worker registers, then the app works fully offline', async ({ page, context }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  // reload once so THIS page is controlled by the SW
  await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload();
  await page.waitForSelector('[data-new]', { timeout: 15000 }); // app shell served offline
  // a full little round works offline
  await page.tap('[data-new]');
  await page.fill('.name-input', 'Offline');
  await page.tap('form[data-create] [data-kind="little"]');
  await page.waitForSelector('.little-tile');
  await page.evaluate(() => { location.hash = '#/little?game=count&v=frame'; });
  await page.waitForSelector('.little-card');
  await page.tap('.little-card[data-good="1"]');
  await expect(page.locator('.paw.done')).toHaveCount(1);
  await context.setOffline(false);
});
