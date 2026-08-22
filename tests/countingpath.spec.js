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

// WHY THESE ARE PLAIN THROWS AND NOT expect().
//
// The three property tests below sweep 12 tables x 200 seeds x 3 chains, and
// every check inside that sweep used to be an expect(). Playwright's expect
// captures a stack trace per call, so ~72,000 of them cost ~35ms each and this
// ONE FILE took 42.6 minutes — longer than the other 458 tests combined.
// `buildCountingPath` does all 2,400 iterations in ~30ms on its own, so every
// bit of that was the assertion mechanism rather than the code under test.
//
// It also hid itself twice over: Playwright's `timeout: 120_000` CANNOT
// interrupt a synchronous loop, so a test 21x over the timeout still reported
// a pass, and the `list` reporter prints only on completion, so a grinding
// spec is indistinguishable from a hung one. Several full-suite runs were
// killed at test 455 in the belief they had stalled.
//
// `ok()` checks the SAME conditions with the same strictness and carries the
// failing case in its message. expect() is kept for the per-test aggregates
// outside the sweeps, where a handful of calls costs nothing and the richer
// diff is worth having.
function ok(cond, msg) {
  if (!cond) throw new Error(msg);
}
const sameNums = (a, b) => a.length === b.length && a.every((n, i) => Object.is(n, b[i]));

// Solve a chain from the text ALONE, the way the kid must: read the step off
// the visible terms and step into the gap. Throws when the question could not
// be solved from what is shown.
function solveFromText(text) {
  const parts = text.trim().split(', ');
  ok(parts.length === 4, `chain "${text}" has ${parts.length} terms, not 4`);
  const nums = parts.map((p) => (p === '_' ? null : Number(p)));
  ok(nums.filter((n) => n === null).length === 1, `chain "${text}" must have exactly one gap`);
  const gap = nums.indexOf(null);
  ok(gap > 0, `chain "${text}" has a LEADING gap, which hides the step`);
  let step = null;
  for (let i = 0; i + 1 < 4; i++) {
    if (nums[i] === null || nums[i + 1] === null) continue;
    if (step !== null) ok(Object.is(nums[i + 1] - nums[i], step), `chain "${text}" is not a constant step`);
    step = nums[i + 1] - nums[i];
  }
  ok(step > 0, `chain "${text}" has a non-positive step ${step}`);
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
      const at = `table ${t}, seed ${seed}`;
      ok(chains.length === 3, `${at}: ${chains.length} chains, not 3`); // still exactly three, always
      // three different stretches of the table, never the same run twice
      ok(new Set(chains.map((c) => c.correction)).size === 3, `${at}: repeated run — ${chains.map((c) => c.correction).join(' | ')}`);
      for (const c of chains) {
        seen += 1;
        const solved = solveFromText(c.text);
        ok(Object.is(solved, c.answer), `${at}: "${c.text}" solves to ${solved} but answer is ${c.answer}`);
        // answers are real multiples of the table: positive, never past 12×t
        ok(c.answer % t === 0, `${at}: answer ${c.answer} is not a multiple of ${t}`);
        ok(c.answer / t >= 1, `${at}: answer ${c.answer} is below 1x${t}`);
        ok(c.answer / t <= 12, `${at}: answer ${c.answer} is past 12x${t}`);
        // the correction shows the whole run with the gap filled in
        const terms = c.correction.split(', ').map(Number);
        ok(terms.length === 4, `${at}: correction "${c.correction}" has ${terms.length} terms, not 4`);
        ok(terms.includes(c.answer), `${at}: correction "${c.correction}" omits the answer ${c.answer}`);
        for (const n of terms) {
          ok(n % t === 0, `${at}: term ${n} is not a multiple of ${t}`);
          ok(n / t >= 1, `${at}: term ${n} is below 1x${t}`);
          ok(n / t <= 12, `${at}: term ${n} is past 12x${t}`);
        }
        ok(sameNums(terms.slice(1).map((n, i) => n - terms[i]), [t, t, t]),
          `${at}: correction "${c.correction}" is not a constant ${t} step`);
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
      ok(shapes.slice().sort().join(',') === 'high,low,middle',
        `table ${t}, seed ${seed}: shapes were ${shapes.join(',')}, not one of each`);
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
        const halfway = (Number(parts[gap - 1]) + Number(parts[gap + 1])) / 2;
        ok(Object.is(c.answer, halfway),
          `table ${t}, seed ${seed}: "${c.text}" answer ${c.answer} is not the midpoint ${halfway}`);
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
