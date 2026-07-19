// Teach on misses: wrong answers get a way in, not just the answer.
import { test, expect } from '@playwright/test';
import { hintFor } from '../src/engine/hints.js';
import { newProfile } from '../src/data/schema.js';
import { createProfileUI, seedProfile, selectProfile, uniqueName, norm, stat, openTableGrid, clearCountingPath } from './helpers.mjs';

test('structural tricks cover the special factors', () => {
  const p = newProfile('H');
  expect(hintFor(p, 7, 0)).toContain('zero');
  expect(hintFor(p, 1, 8)).toContain('Times 1');
  expect(hintFor(p, 7, 10)).toContain('7 becomes 70');
  expect(hintFor(p, 11, 4)).toContain('4 becomes 44');
  expect(hintFor(p, 2, 8)).toContain('8 + 8 = 16');
});

test('anchors on a well-known neighbor, preferring one-more', () => {
  const p = newProfile('A');
  p.facts[norm(7, 7)] = stat(4);
  expect(hintFor(p, 7, 8)).toBe('You know 7×7 = 49 — one more 7 makes 56!');

  // Only a stronger "one less" neighbor known → take-away phrasing
  const q = newProfile('B');
  q.facts[norm(7, 9)] = stat(4);
  expect(hintFor(q, 7, 8)).toBe('You know 7×9 = 63 — one 7 less is 56!');

  // Weak neighbors (below mastery) don't anchor
  const r = newProfile('C');
  r.facts[norm(7, 7)] = stat(2);
  expect(hintFor(r, 7, 8)).toContain('Count by 7s');
});

test('reflexive flip when the fact is known in the other orientation', () => {
  const p = newProfile('R');
  p.facts[norm(5, 7)] = stat(4); // mastered — likely learned as 5×7
  expect(hintFor(p, 7, 5)).toBe('Flip it! 7×5 is the same as 5×7 — and you know that one: 35!');
  expect(hintFor(p, 5, 7)).toBe('Flip it! 5×7 is the same as 7×5 — and you know that one: 35!');

  // Not fired when the fact is genuinely weak — that miss isn't a flip issue
  const q = newProfile('S');
  q.facts[norm(5, 7)] = stat(1);
  expect(hintFor(q, 7, 5)).not.toContain('Flip it');

  // Squares have no flip; structural tricks still outrank the flip
  const r = newProfile('T');
  r.facts[norm(6, 6)] = stat(4);
  expect(hintFor(r, 6, 6)).not.toContain('Flip it');
  r.facts[norm(2, 8)] = stat(4);
  expect(hintFor(r, 8, 2)).toContain('double');
});

test('skip-count tail is the fallback', () => {
  const p = newProfile('F');
  expect(hintFor(p, 7, 8)).toBe('Count by 7s to get there: …, 42, 49, 56!');
  expect(hintFor(p, 12, 12)).toBe('Count by 12s to get there: …, 120, 132, 144!');
});

test('a wrong answer in a quiz shows the hint', async ({ page }) => {
  // seeded tried facts: brand-new facts would echo (shown, not asked)
  // instead of hinting — hints belong to facts the kid has met before
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Hint'));
  doc.id = 'hint-kid';
  for (let b = 0; b <= 12; b++) doc.facts[norm(3, b)] = stat(0);
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.hero');
  await openTableGrid(page);
  await page.tap('.table-grid .table-btn:nth-child(3)'); // ×3 table
  await clearCountingPath(page);
  // Find a question with both factors ≥ 2 so we get a non-trivial hint
  for (let i = 0; i < 12; i++) {
    await page.waitForFunction(() =>
      document.querySelector('.question')?.textContent?.includes('×')
    );
    const [a, b] = (await page.textContent('.question'))
      .split('×')
      .map((s) => parseInt(s.trim(), 10));
    if (a >= 2 && b >= 2) {
      await page.tap('.numpad .key:text-is("1")');
      await page.tap('.numpad .key.ok');
      const fb = page.locator('.feedback.bad');
      await expect(fb).toContainText(`= ${a * b}`);
      await expect(fb.locator('.hint').last()).toContainText('💡');

      // 🔍 Self-paced: the hint stays put until the kid taps through
      const question = (await page.textContent('.question')).trim();
      await page.waitForTimeout(4200); // well past the old auto-advance
      expect((await page.textContent('.question')).trim()).toBe(question);
      await expect(fb.locator('.hint').last()).toBeVisible();
      await page.tap('.feedback [data-next]');
      await page.waitForFunction(
        (old) => document.querySelector('.question')?.textContent?.trim() !== old,
        question
      );
      return;
    }
    // gimme question: answer correctly and move on
    for (const d of String(a * b)) await page.tap(`.numpad .key:text-is("${d}")`);
    await page.tap('.numpad .key.ok');
    await page.waitForTimeout(1000);
  }
  throw new Error('never saw a non-gimme question');
});
