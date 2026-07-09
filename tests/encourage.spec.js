// Encouraging weak/untried facts (bundles A–E): removing the costs of
// trying, rewarding attempts, and reframing who's being tested.
import { test, expect } from '@playwright/test';
import { recordAnswer } from '../src/engine/leitner.js';
import { bumpAnswer, FAMILIES, tierOf, checkAchievements } from '../src/engine/achievements.js';
import { newProfile } from '../src/data/schema.js';
import { createProfileUI, uniqueName, openTableGrid } from './helpers.mjs';

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
  await createProfileUI(page, uniqueName('Lion'));
  await openTableGrid(page);
  await page.tap('.table-grid .table-btn:nth-child(4)');
  await page.waitForSelector('.question');
  await page.tap('.numpad .key:text-is("1")');
  await page.tap('.numpad .key:text-is("1")');
  await page.tap('.numpad .key:text-is("1")');
  await page.tap('.numpad .key.ok');
  const fb = page.locator('.feedback.bad');
  await expect(fb.locator('.hint.brave')).toContainText('trying it is the win');
  await expect(fb.locator('.hint').last()).toContainText('💡');
});
