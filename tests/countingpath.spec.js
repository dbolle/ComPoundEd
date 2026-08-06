// v1.51.0 Counting Path warm-up shapes: the three unscored skip-count chains
// before a barely-tried × table now come in three shapes — a low run, a run
// starting higher up the table, and a run with the gap in the middle — mixed,
// still unscored (docs/PEDAGOGY.md §3: skip counting is not multiplicative
// reasoning, so this stays a warm-up and records nothing).
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { buildCountingPath } from '../src/screens/quiz.js';
import { seedProfile, selectProfile, readProfile, norm, stat, openTableGrid } from './helpers.mjs';

// Reproducible stand-in for Math.random.
function lcg(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// Solve a chain from the text ALONE, the way the kid must: read the step off
// the visible terms and step into the gap. Throws when the question could not
// be solved from what is shown.
function solveFromText(text) {
  const parts = text.trim().split(', ');
  expect(parts).toHaveLength(4);
  const nums = parts.map((p) => (p === '_' ? null : Number(p)));
  expect(nums.filter((n) => n === null)).toHaveLength(1);
  const gap = nums.indexOf(null);
  expect(gap).toBeGreaterThan(0); // a leading gap would hide the step
  let step = null;
  for (let i = 0; i + 1 < 4; i++) {
    if (nums[i] === null || nums[i + 1] === null) continue;
    if (step !== null) expect(nums[i + 1] - nums[i]).toBe(step);
    step = nums[i + 1] - nums[i];
  }
  expect(step).toBeGreaterThan(0);
  return nums[gap - 1] + step;
}

// low run | start-anywhere run | gap in the middle
function shapeOf(text, table) {
  const parts = text.trim().split(', ');
  if (parts.indexOf('_') !== 3) return 'middle';
  return Number(parts[0]) / table <= 3 ? 'low' : 'high';
}

test('every warm-up question is solvable from what it shows and stays inside the table', () => {
  let seen = 0;
  for (let t = 1; t <= 12; t++) {
    for (let seed = 1; seed <= 200; seed++) {
      const chains = buildCountingPath(t, lcg(seed * 7919 + t));
      expect(chains).toHaveLength(3); // still exactly three, always
      // three different stretches of the table, never the same run twice
      expect(new Set(chains.map((c) => c.correction)).size).toBe(3);
      for (const c of chains) {
        seen += 1;
        expect(solveFromText(c.text)).toBe(c.answer);
        // answers are real multiples of the table: positive, never past 12×t
        expect(c.answer % t).toBe(0);
        expect(c.answer / t).toBeGreaterThanOrEqual(1);
        expect(c.answer / t).toBeLessThanOrEqual(12);
        // the correction shows the whole run with the gap filled in
        const terms = c.correction.split(', ').map(Number);
        expect(terms).toHaveLength(4);
        expect(terms).toContain(c.answer);
        for (const n of terms) {
          expect(n % t).toBe(0);
          expect(n / t).toBeGreaterThanOrEqual(1);
          expect(n / t).toBeLessThanOrEqual(12);
        }
        expect(terms.slice(1).map((n, i) => n - terms[i])).toEqual([t, t, t]);
      }
    }
  }
  expect(seen).toBe(12 * 200 * 3);
});

test('all three shapes appear, one per warm-up, in mixed order', () => {
  const atPosition = [new Set(), new Set(), new Set()];
  for (let t = 1; t <= 12; t++) {
    for (let seed = 1; seed <= 200; seed++) {
      const shapes = buildCountingPath(t, lcg(seed * 104729 + t)).map((c) => shapeOf(c.text, t));
      expect(shapes.slice().sort()).toEqual(['high', 'low', 'middle']);
      shapes.forEach((s, i) => atPosition[i].add(s));
    }
  }
  // not sequential: each slot has held each shape
  for (const set of atPosition) expect([...set].sort()).toEqual(['high', 'low', 'middle']);
});

test('missing-middle answers fill the gap, for several tables', () => {
  for (let t = 1; t <= 12; t++) {
    let middles = 0;
    for (let seed = 1; seed <= 120; seed++) {
      for (const c of buildCountingPath(t, lcg(seed * 31 + t))) {
        const parts = c.text.split(', ');
        const gap = parts.indexOf('_');
        if (gap === 3) continue;
        middles += 1;
        // flanked on both sides: the answer is the number halfway between
        expect(c.answer).toBe((Number(parts[gap - 1]) + Number(parts[gap + 1])) / 2);
      }
    }
    expect(middles).toBeGreaterThan(0);
  }

  // pinned shapes at the ends of the random range (rand → 0 and rand → 1)
  expect(buildCountingPath(4, () => 0).map((c) => [c.text, c.answer])).toEqual([
    ['20, 24, 28, _', 32],
    ['8, _, 16, 20', 12],
    ['4, 8, 12, _', 16],
  ]);
  expect(buildCountingPath(12, () => 0.999).map((c) => [c.text, c.answer])).toEqual([
    ['36, 48, 60, _', 72],
    ['108, 120, 132, _', 144],
    ['96, 108, _, 132', 120],
  ]);
  expect(buildCountingPath(9, () => 0.999).map((c) => c.answer)).toEqual([54, 108, 90]);
});

async function typeAnswer(page, value) {
  for (const d of String(value)) await page.tap(`.numpad .key:text-is("${d}")`);
  await page.tap('.numpad .key.ok');
}

test('e2e: three mixed warm-up chains, all correct, and nothing is recorded', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile('Pathy');
  doc.id = 'cp-shapes';
  doc.subjects = { ...doc.subjects, tables: true }; // fresh big kid
  await seedProfile(page, doc);
  await selectProfile(page, 'Pathy');
  const before = await readProfile(page, 'cp-shapes');

  await openTableGrid(page);
  await page.tap('[aria-label^="Practice the 6s table"]');
  await page.waitForSelector('.question');
  await expect(page.locator('.feedback')).toContainText('Counting path');

  const shapes = new Set();
  for (let i = 0; i < 3; i++) {
    const text = (await page.textContent('.question')).trim();
    expect(text).toMatch(/^(\d+|_)(, (\d+|_)){3}$/);
    shapes.add(shapeOf(text, 6));
    // the answer the kid can read off the screen is the answer the app wants:
    // a wrong one would say "keep hopping" instead of the ⭐ line
    await typeAnswer(page, solveFromText(text));
    await expect(page.locator('.feedback')).toContainText('⭐');
    await page.waitForTimeout(1400);
  }
  expect([...shapes].sort()).toEqual(['high', 'low', 'middle']); // one of each

  // exactly three: the fourth question is the real round (an echo intro here)
  await expect(page.locator('.question')).toContainText('×');
  expect(await page.locator('.paw.done, .paw.missed').count()).toBe(0);

  const after = await readProfile(page, 'cp-shapes');
  expect(after.facts).toEqual(before.facts); // no Leitner writes
  expect(after.division).toEqual(before.division);
  expect(after.speed).toEqual(before.speed);
  expect(after.stats).toEqual(before.stats);
  expect(after.pawBucks.txns).toEqual(before.pawBucks.txns); // no coins
});

test('e2e: a table past the training rounds gets no warm-up', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile('Trained');
  doc.id = 'cp-trained';
  doc.subjects = { ...doc.subjects, tables: true };
  for (const b of [1, 2, 3, 4]) doc.facts[norm(6, b)] = stat(2); // 4 tried > 3
  await seedProfile(page, doc);
  await selectProfile(page, 'Trained');

  await openTableGrid(page);
  await page.tap('[aria-label^="Practice the 6s table"]');
  await page.waitForSelector('.question');
  await expect(page.locator('.feedback')).not.toContainText('Counting path');
  expect((await page.textContent('.question')).trim()).not.toMatch(/^\d+, /);
});
