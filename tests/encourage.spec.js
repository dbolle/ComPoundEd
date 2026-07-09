// Encouraging weak/untried facts (bundles A–E): removing the costs of
// trying, rewarding attempts, and reframing who's being tested.
import { test, expect } from '@playwright/test';
import { recordAnswer } from '../src/engine/leitner.js';
import { bumpAnswer } from '../src/engine/achievements.js';
import { newProfile } from '../src/data/schema.js';

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
