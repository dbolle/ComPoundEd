// Encouraging weak/untried facts (bundles A–E): removing the costs of
// trying, rewarding attempts, and reframing who's being tested.
import { test, expect } from '@playwright/test';
import { recordAnswer } from '../src/engine/leitner.js';
import { bumpAnswer, FAMILIES, tierOf, checkAchievements } from '../src/engine/achievements.js';
import { suggestNext } from '../src/engine/suggest.js';
import { buildRound } from '../src/engine/selector.js';
import { dogForTable } from '../src/art/dogs.js';
import { newProfile } from '../src/data/schema.js';
import { createProfileUI, seedProfile, selectProfile, playQuestions, uniqueName, openTableGrid, clearCountingPath, norm } from './helpers.mjs';

// ---- Bundle A: streak protection for first tries

test('A: a miss on a brand-new fact never breaks the streak', () => {
  const p = newProfile('Streak');
  // Build a streak of 3 on fresh facts
  for (const [a, b] of [[2, 3], [2, 4], [2, 5]]) {
    bumpAnswer(p, recordAnswer(p, a, b, true, 2000));
  }
  expect(p.stats.currentStreak).toBe(3);

  // First-ever attempt at 6×7, wrong → streak untouched (neutral)
  bumpAnswer(p, recordAnswer(p, 6, 7, false, 4000));
  expect(p.stats.currentStreak).toBe(3);

  // Second miss on the SAME fact (now attempted before) → resets as usual
  bumpAnswer(p, recordAnswer(p, 6, 7, false, 4000));
  expect(p.stats.currentStreak).toBe(0);
});

test('A: a correct first try still extends the streak', () => {
  const p = newProfile('Extend');
  bumpAnswer(p, recordAnswer(p, 3, 4, true, 2000));
  bumpAnswer(p, recordAnswer(p, 3, 5, true, 2000));
  expect(p.stats.currentStreak).toBe(2);
  expect(p.stats.bestStreak).toBe(2);
});

// ---- Bundle B: Brave Paw — the attempt is the win

test('B: brave tries count first attempts, right OR wrong', () => {
  const p = newProfile('Brave');
  bumpAnswer(p, recordAnswer(p, 6, 7, false, 4000)); // wrong first try counts
  bumpAnswer(p, recordAnswer(p, 6, 8, true, 2000)); // right first try counts
  bumpAnswer(p, recordAnswer(p, 6, 7, true, 2000)); // repeat — no brave credit
  expect(p.stats.braveTries).toBe(2);

  const brave = FAMILIES.find((f) => f.id === 'brave');
  expect(brave.endless).toBe(true);
  expect(tierOf(brave, p)).toBe(1); // Bronze on the very first try
  const newly = checkAchievements(p);
  expect(newly.find((a) => a.id === 'brave').name).toContain('Brave Paw');
});

test('B: e2e — a wrong first try celebrates the attempt', async ({ page }) => {
  // met-but-never-answered facts: brand-new ones echo instead of asking
  await page.goto('/', { waitUntil: 'networkidle' });
  const brave = newProfile(uniqueName('Lion'));
  brave.id = 'lion-kid';
  for (let b = 0; b <= 12; b++) {
    brave.facts[norm(4, b)] = { attempts: 0, correct: 0, avgMs: 0, box: 0, lastSeen: Date.now(), seen: 1 };
  }
  await seedProfile(page, brave);
  await selectProfile(page, brave.name);
  await page.waitForSelector('.hero');
  await openTableGrid(page);
  await page.tap('.table-grid .table-btn:nth-child(4)');
  await page.waitForSelector('.question');
  await clearCountingPath(page);
  await page.tap('.numpad .key:text-is("1")');
  await page.tap('.numpad .key:text-is("1")');
  await page.tap('.numpad .key:text-is("1")');
  await page.tap('.numpad .key.ok');
  const fb = page.locator('.feedback.bad');
  await expect(fb.locator('.hint.brave')).toContainText('trying it is the win');
  await expect(fb.locator('.hint').last()).toContainText('💡');
});

// ---- Bundle C: teach the puppy — the dog is the learner, not the kid

test('C: suggestions name the dog for untried tables only', () => {
  const fresh = newProfile('Teach');
  const s = suggestNext(fresh);
  expect(s.label).toBe('×1');
  expect(s.teach).toBe(dogForTable(1).name);

  // Once the table has any attempts, the framing returns to practice
  bumpAnswer(fresh, recordAnswer(fresh, 1, 3, true, 2000));
  expect(suggestNext(fresh).teach).toBeNull();
});

test('C: e2e — untried table shows the teach banner; tried table does not', async ({ page }) => {
  await createProfileUI(page, uniqueName('Prof'));
  await expect(page.locator('[data-suggest]')).toContainText(`Teach ${dogForTable(1).name}`);

  await openTableGrid(page);
  await page.tap('.table-grid .table-btn:nth-child(3)');
  await page.waitForSelector('.question');
  await expect(page.locator('.teach-banner')).toContainText(dogForTable(3).name);

  // Answer one question, quit, return: table now tried → no banner
  await clearCountingPath(page);
  await page.waitForFunction(() => /[×÷]/.test(document.querySelector('.question')?.textContent ?? ''));
  const [a, b] = (await page.textContent('.question')).split('×').map((s) => parseInt(s.trim(), 10));
  for (const d of String(a * b)) await page.tap(`.numpad .key:text-is("${d}")`);
  await page.tap('.numpad .key.ok');
  await page.waitForTimeout(1000);
  await page.tap('[data-quit]');
  await page.waitForSelector('.hero');
  await openTableGrid(page);
  await page.tap('.table-grid .table-btn:nth-child(3)');
  await page.waitForSelector('.question');
  expect(await page.$('.teach-banner')).toBeNull();
});

// ---- Bundle D: sniff the map — coverage is collectible

test('D: e2e — completing a row of attempts earns the sniffed badge', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile('Sniffy');
  doc.id = 'sniff-kid';
  // ×2 row: 11 facts attempted (still weak), 2 never tried
  for (let b = 0; b <= 10; b++) {
    doc.facts[b <= 2 ? `${b}x2` : `2x${b}`] = { attempts: 1, correct: 0, avgMs: 5000, box: 0, lastSeen: Date.now() };
  }
  await seedProfile(page, doc);
  await selectProfile(page, 'Sniffy');
  await openTableGrid(page);
  await page.tap('.table-grid .table-btn:nth-child(2)');
  await playQuestions(page, 14);
  await page.waitForSelector('.big-score');
  await expect(page.locator('.badge', { hasText: 'Sniffed every ×2 fact' })).toBeVisible();

  // Heatmap shows the coverage count
  await page.tap('[data-home]');
  await page.tap('[data-nav="/heatmap"]');
  await page.waitForSelector('.hm-cell');
  await expect(page.locator('.hm-caption')).toContainText('spots sniffed');
});

// ---- Bundle E: training treats — a new table's first taste is mostly wins

test('E: a barely-touched table serves wins-first rounds with few new facts', () => {
  const p = newProfile('Treat');
  for (let b = 0; b <= 12; b++) {
    p.facts[b <= 2 ? `${b}x2` : `2x${b}`] = { attempts: 6, correct: 6, avgMs: 3000, box: 4, lastSeen: Date.now() };
    p.facts[b <= 10 ? `${b}x10` : `10x${b}`] = { attempts: 6, correct: 6, avgMs: 3000, box: 4, lastSeen: Date.now() };
  }
  const isWin = (q) => {
    const [lo, hi] = q.a <= q.b ? [q.a, q.b] : [q.b, q.a];
    const s = p.facts[`${lo}x${hi}`];
    return lo <= 1 || (s && s.box >= 3);
  };
  for (let trial = 0; trial < 5; trial++) {
    const round = buildRound(p, { type: 'table', table: 7 });
    expect(round).toHaveLength(10);
    expect(isWin(round[0])).toBe(true); // opens with wins
    expect(isWin(round[1])).toBe(true);
    const advCount = round.filter((q) => !isWin(q)).length;
    expect(advCount).toBeLessThanOrEqual(4); // few discoveries
    expect(advCount).toBeGreaterThanOrEqual(2);
    for (let k = 1; k < round.length; k++) {
      expect(!isWin(round[k]) && !isWin(round[k - 1])).toBe(false); // never two in a row
    }
  }
});

test('E: once a table is genuinely in progress, the standard mix returns', () => {
  const p = newProfile('Std');
  for (let b = 0; b <= 4; b++) {
    p.facts[b <= 5 ? `${b}x5` : `5x${b}`] = { attempts: 2, correct: 1, avgMs: 5000, box: 1, lastSeen: Date.now() };
  }
  const round = buildRound(p, { type: 'table', table: 5 });
  // Standard selector leads with weak seen facts (box < 3, attempts > 0)
  const weakCount = round.filter((q) => {
    const [lo, hi] = q.a <= q.b ? [q.a, q.b] : [q.b, q.a];
    const s = p.facts[`${lo}x${hi}`];
    return s && s.attempts > 0 && s.box < 3;
  }).length;
  expect(weakCount).toBeGreaterThanOrEqual(5);
});
