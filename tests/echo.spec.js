// Echo-first: a fact's first-ever appearance is shown, not asked.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { recordEcho, getStat } from '../src/engine/leitner.js';
import { earnFromAnswer } from '../src/engine/money.js';
import { seedProfile, selectProfile, openTableGrid, clearCountingPath, norm, stat } from './helpers.mjs';

test('recordEcho marks exposure without box movement or coins', () => {
  const p = newProfile('Echo');
  recordEcho(p, { kind: 'mul', a: 7, b: 8 });
  const s = getStat(p, 7, 8);
  expect(s.seen).toBe(1);
  expect(s.attempts).toBe(0); // the brave first REAL try is still ahead
  expect(s.box).toBe(0);
  expect(p.pawBucks.txns).toHaveLength(0);
  expect(earnFromAnswer(p, { a: 7, b: 8 }, { mastered: false, polished: false })).toEqual([]);
});

test('e2e: brand-new fact shows the whole equation; typing it advances; next time it asks', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile('Newbie');
  doc.id = 'echo-kid';
  // ×7 tried a little (skips warm-up + training round) but 7×8 never seen
  for (let b = 0; b <= 12; b++) if (b !== 8) doc.facts[norm(7, b)] = stat(2);
  await seedProfile(page, doc);
  await selectProfile(page, 'Newbie');
  await openTableGrid(page);
  await page.tap('.table-grid .table-btn:nth-child(7)');
  await clearCountingPath(page);

  // play until the echo question appears (7×8 is the only fresh fact and
  // buildRound always seeds fresh facts into the round)
  for (let i = 0; i < 12; i++) {
    if (await page.locator('.big-score').count()) break;
    await page.waitForFunction(() => /[×=]/.test(document.querySelector('.question')?.textContent ?? ''));
    const text = (await page.textContent('.question')).trim();
    if (text.includes('=')) {
      expect(text).toBe('7 × 8 = 56');
      await expect(page.locator('.feedback')).toContainText('Type it in');
      // a typo wiggles, never punishes
      await page.tap('.numpad .key:text-is("9")');
      await page.tap('.numpad .key.ok');
      await expect(page.locator('.paw.done')).toHaveCount(i); // no advance
      for (const d of '56') await page.tap(`.numpad .key:text-is("${d}")`);
      await page.tap('.numpad .key.ok');
      await expect(page.locator('.feedback')).toContainText('one more');
      await page.waitForTimeout(1000);
      continue; // finish the round so the profile saves
    }
    const [a, b] = text.split('×').map((s) => parseInt(s.trim(), 10));
    for (const d of String(a * b)) await page.tap(`.numpad .key:text-is("${d}")`);
    await page.tap('.numpad .key.ok');
    await page.waitForTimeout(1050);
  }
  // exposure recorded: box untouched, attempts 1
  const saved = await page.evaluate(
    () => new Promise((res) => {
      const req = indexedDB.open('compounded', 1);
      req.onsuccess = () => {
        const g = req.result.transaction('profiles').objectStore('profiles').get('echo-kid');
        g.onsuccess = () => res(g.result);
      };
    })
  );
  expect(saved.facts['7x8'].seen).toBe(1);
  expect(saved.facts['7x8'].attempts).toBe(0);
  expect(saved.facts['7x8'].box).toBe(0);
});


test('bridged tracks: no echo on the missing-number form; the ÷ debut is shown, not asked', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile('DivEcho');
  doc.id = 'divecho-kid';
  doc.subjects = { ...doc.subjects, tables: true };
  for (let b = 0; b <= 12; b++) {
    doc.facts[norm(3, b)] = stat(4); // ×3 mastered → ÷3 open
    // half warm (box 2 → ÷ form, symbol never met), half cold (bridge form)
    doc.division[norm(3, b)] = b % 2 ? stat(2) : { attempts: 1, correct: 0, avgMs: 3000, box: 0, lastSeen: Date.now() };
  }
  await seedProfile(page, doc);
  await selectProfile(page, 'DivEcho');
  await page.waitForSelector('.hero');
  await page.evaluate(() => { location.hash = '#/quiz?dtable=3'; });
  await page.waitForSelector('.question');

  let sawDivEcho = false;
  for (let i = 0; i < 12; i++) {
    if (await page.locator('.big-score').count()) break;
    await page.waitForFunction(() => /[×÷]/.test(document.querySelector('.question')?.textContent ?? ''));
    const text = (await page.textContent('.question')).trim();
    let ans;
    const echoM = text.match(/^(\d+) ÷ (\d+) = (\d+)$/);
    const missM = text.match(/^(\d+) × _ = (\d+)$/);
    const divM = text.match(/^(\d+) ÷ (\d+)$/);
    if (echoM) {
      sawDivEcho = true; // ÷ debut arrives shown, not asked
      await expect(page.locator('.feedback')).toContainText('Type it in');
      ans = Number(echoM[3]);
    } else if (missM) {
      // bridge form is always a REAL question — never an echo
      expect(await page.locator('.feedback').textContent()).not.toContain('Type it in');
      ans = Number(missM[2]) / Number(missM[1]);
    } else if (divM) {
      ans = Number(divM[1]) / Number(divM[2]);
    } else {
      const [a, b] = text.split('×').map((s) => parseInt(s.trim(), 10));
      ans = a * b;
    }
    for (const d of String(ans)) await page.tap(`.numpad .key:text-is("${d}")`);
    await page.tap('.numpad .key.ok');
    await page.waitForTimeout(1050);
  }
  expect(sawDivEcho).toBe(true);
});