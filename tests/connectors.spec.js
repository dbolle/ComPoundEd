// v1.8.0 connectors: Counting Path warm-up, cross-track suggest, Grown-Ups
// bridge rows, next-friend goal on wave rounds.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { suggestNext } from '../src/engine/suggest.js';
import { waveFacts } from '../src/engine/waves.js';
import { normAddKey } from '../src/engine/leitner.js';
import { nextPetGoal } from '../src/engine/cozy.js';
import { seedProfile, selectProfile, holdGrownupsGate, norm, stat, uniqueName } from './helpers.mjs';

test('suggest ranks bridge waves with tables; tables-off yields wave suggestions', () => {
  const bridgeKid = newProfile('S1');
  bridgeKid.subjects = { ...bridgeKid.subjects, bridge: true, tables: false };
  const s = suggestNext(bridgeKid);
  expect(s.href).toBe('/quiz?wave=0');

  // near-done wave outranks untouched tables for a both-tracks kid
  const both = newProfile('S2');
  both.subjects = { ...both.subjects, bridge: true };
  for (const [a, b] of waveFacts(0).slice(1)) both.addition[normAddKey(a, b)] = stat(3);
  const s2 = suggestNext(both);
  expect(s2.href).toBe('/quiz?wave=0');

  // plain big kid (creation sets tables on; auto would wait for readiness)
  const plain = newProfile('S3');
  plain.subjects = { ...plain.subjects, tables: true };
  expect(suggestNext(plain).href).toContain('table=');
});

test('nextPetGoal walks the milestone order', () => {
  const p = newProfile('Goal');
  const g = nextPetGoal(p);
  expect(g.label).toContain('Quick Look');
  p.petUnlocks = [{ petId: g.pet.id, milestone: 'look', at: 1 }];
  expect(nextPetGoal(p).label).toContain('friends of 5');
});

test('e2e: counting path warms up a fresh table, unscored, then the round starts', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile('Warmy');
  doc.id = 'warm-kid';
  doc.subjects = { ...doc.subjects, tables: true }; // fresh big kid: creation would set this
  await seedProfile(page, doc);
  await selectProfile(page, 'Warmy');

  if (await page.locator('.table-grid').isHidden()) await page.tap('[data-toggle="tables"]');
  await page.tap('.table-grid .table-btn:nth-child(4)'); // ×4, untried
  await page.waitForSelector('.question');
  await expect(page.locator('.feedback')).toContainText('Counting path');
  await expect(page.locator('.question')).toContainText('4, 8, 12');
  // wrong warm-up answer: shown the chain, gently, and it moves on
  await page.tap('.numpad .key:text-is("7")');
  await page.tap('.numpad .key.ok');
  await expect(page.locator('.feedback')).toContainText('keep hopping');
  await page.waitForTimeout(1400);
  await expect(page.locator('.question')).toContainText('8, 12, 16');
  // right answers clear the remaining chains
  for (const ans of ['24', '28']) {
    for (const d of ans) await page.tap(`.numpad .key:text-is("${d}")`);
    await page.tap('.numpad .key.ok');
    await page.waitForTimeout(1400);
  }
  // the real round begins — a plain ×4 question, progress intact at zero
  await expect(page.locator('.question')).toContainText('×');
  const saved = await page.evaluate(
    () => new Promise((res) => {
      const req = indexedDB.open('compounded', 1);
      req.onsuccess = () => {
        const g = req.result.transaction('profiles').objectStore('profiles').get('warm-kid');
        g.onsuccess = () => res(g.result);
      };
    })
  );
  expect(Object.keys(saved.facts)).toHaveLength(0); // warm-up recorded nothing
});

test('e2e: Grown-Ups shows Adding/Taking-away rows for bridge kids', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Rows'));
  doc.id = 'rows-kid';
  doc.subjects = { ...doc.subjects, bridge: true };
  for (const [a, b] of waveFacts(1)) doc.addition[normAddKey(a, b)] = stat(3);
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.hero');
  await page.tap('[data-nav="/grownups"]');
  await holdGrownupsGate(page);
  await expect(page.locator('.stat-row', { hasText: 'Adding facts' })).toContainText('8 / 66');
  await expect(page.locator('.stat-row', { hasText: 'Taking-away' })).toContainText('0 / 66');
});
