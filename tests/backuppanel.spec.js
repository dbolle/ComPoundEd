// v1.52.0 — the Grown-Ups "Keeping progress safe" panel. Two routes to a
// safe copy, told apart on sight; long explanations collapsed by default;
// and the home-server controls shown only where they could possibly work.
import { test, expect } from '@playwright/test';
import { execFileSync } from 'child_process';
import { readFileSync, existsSync, rmSync } from 'fs';
import { createServer } from 'http';
import { extname, join } from 'path';
import { newProfile } from '../src/data/schema.js';
import { seedProfile, selectProfile, uniqueName, holdGrownupsGate } from './helpers.mjs';

const openPanel = async (page, doc) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.evaluate(() => {
    location.hash = '#/grownups';
  });
  await holdGrownupsGate(page);
};

const kid = (id) => {
  const doc = newProfile(uniqueName('Parent'));
  doc.id = id;
  doc.subjects = { ...doc.subjects, tables: true };
  return doc;
};

test('e2e: long explanations start collapsed, and both routes are present', async ({ page }) => {
  await page.route('**/sync/**', (r) => r.abort());
  await openPanel(page, kid('bp-plain'));

  // the lead text is short and always visible; the "why" is one tap away
  await expect(page.locator('.card:has-text("Keeping progress safe")')).toContainText(
    'stored only on this device'
  );
  expect(await page.locator('.explain[open]').count(), 'nothing expanded by default').toBe(0);
  expect(await page.locator('.explain').count(), 'the detail is still there').toBeGreaterThan(0);

  // saving a file works anywhere, so it is never hidden
  await expect(page.locator('[data-export]')).toBeVisible();
  await expect(page.locator('[data-import]')).toBeVisible();

  // opening one reveals the restore instructions
  await page.locator('.explain summary:has-text("restore")').click();
  await expect(page.locator('.explain[open]')).toContainText('merges rather than overwrites');
});

test('e2e: the home-server group stays shut until there is evidence of a server', async ({ page }) => {
  // No probe is needed to decide this: the app looks at what it already
  // knows. A family without a server should never have to read past it.
  await page.route('**/sync/**', (r) => r.abort());
  await openPanel(page, kid('bp-noserver'));
  const group = page.locator('[data-server-group]');
  await expect(group).toBeVisible();
  expect(await group.evaluate((e) => e.open), 'shut with no evidence').toBe(false);
});

test('e2e: backup already on is evidence enough to open it', async ({ page }) => {
  await page.route('**/sync/**', (r) => r.abort());
  const doc = kid('bp-server');
  await page.goto('/', { waitUntil: 'networkidle' });
  await seedProfile(page, doc);
  await page.evaluate(async () => {
    const db = await new Promise((res) => {
      const r = indexedDB.open('compounded', 1);
      r.onsuccess = () => res(r.result);
    });
    const tx = db.transaction('meta', 'readwrite');
    tx.objectStore('meta').put(true, 'syncEnabled');
    await new Promise((res) => (tx.oncomplete = res));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await selectProfile(page, doc.name);
  await page.evaluate(() => {
    location.hash = '#/grownups';
  });
  await holdGrownupsGate(page);
  expect(
    await page.locator('[data-server-group]').evaluate((e) => e.open),
    'open when this family plainly has a server'
  ).toBe(true);
});

test('the public build shows no home-server controls and asks the network for nothing', async ({ page }) => {
  // The flag is a build-time define, so only a REAL build proves it took
  // effect — and only driving that build proves the two things that matter:
  // nothing crashes where the controls used to be, and no request is made
  // for a server that cannot exist on a public host.
  //
  // Hiding the buttons alone did NOT achieve the second one: `offerBackup`
  // and the deleted-players check run from the profiles screen and kept
  // probing regardless (six requests, measured), which is why the refusal
  // lives in the transport in src/data/sync.js.
  const out = 'dist-demo-test';
  let srv;
  try {
    execFileSync('npx', ['vite', 'build', '--outDir', out, '--logLevel', 'error'], {
      env: { ...process.env, VITE_PUBLIC_DEMO: '1' },
      stdio: 'pipe',
    });
    const TYPES = {
      '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
      '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
    };
    srv = createServer((req, res) => {
      let f = join(out, decodeURIComponent(req.url.split('?')[0]));
      if (!existsSync(f) || f.endsWith('/')) f = join(out, 'index.html');
      res.writeHead(200, { 'Content-Type': TYPES[extname(f)] ?? 'application/octet-stream' });
      res.end(readFileSync(f));
    });
    await new Promise((r) => srv.listen(5307, r));

    const errors = [];
    const syncCalls = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('request', (r) => {
      if (r.url().includes('/sync/')) syncCalls.push(r.url());
    });

    await page.goto('http://127.0.0.1:5307/', { waitUntil: 'networkidle' });
    const doc = newProfile(uniqueName('Demo'));
    doc.id = 'demo-public';
    doc.subjects = { ...doc.subjects, tables: true };
    await seedProfile(page, doc);
    await selectProfile(page, doc.name);
    await page.evaluate(() => {
      location.hash = '#/grownups';
    });
    await holdGrownupsGate(page);
    await page.waitForTimeout(500);

    expect(await page.locator('[data-sync-toggle]').count(), 'no backup switch').toBe(0);
    expect(await page.locator('[data-server-group]').count(), 'no server section').toBe(0);
    expect(await page.locator('[data-export]').count(), 'saving a file still works').toBe(1);
    expect(
      await page.locator('a[href*="deploy/README.md"]').count(),
      'points at the setup docs instead'
    ).toBe(1);
    expect(errors, 'the screen must not crash where the controls used to be').toEqual([]);
    expect(syncCalls, 'nothing is asked of a server that cannot exist').toEqual([]);
  } finally {
    srv?.close();
    rmSync(out, { recursive: true, force: true });
  }
});
