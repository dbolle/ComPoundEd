// Pet play: solo activities, group rotation, pet sitting mix, and the
// learner-friendly progression rules.
import { test, expect } from '@playwright/test';
import {
  seedProfile,
  readProfile,
  selectProfile,
  playQuestions,
  norm,
  stat,
  openTableGrid,
} from './helpers.mjs';

function richDoc(id, name) {
  const facts = {};
  for (let b = 0; b <= 12; b++) facts[norm(2, b)] = stat(5);
  for (let b = 0; b <= 12; b++) facts[norm(10, b)] = stat(4);
  for (let b = 0; b <= 12; b++) facts[norm(3, b)] = stat(2);
  facts[norm(6, 7)] = stat(0, { attempts: 2, correct: 0 });
  return {
    id,
    schemaVersion: 3,
    name,
    avatarDogId: 'starter',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    facts,
    unlocks: [
      { dogId: 'starter', table: null, at: Date.now() },
      { dogId: 'dog-2', table: 2, at: Date.now() },
      { dogId: 'dog-7', table: 7, at: Date.now() },
    ],
    play: {},
  };
}

test('solo activity asks the dog\'s own table and credits its counter', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await seedProfile(page, richDoc('play-solo', 'PlaySolo'));
  await selectProfile(page, 'PlaySolo');
  await page.tap('[data-nav="/pack"]');
  await page.tap('.dog-card:has-text("Daisy")');
  await page.waitForSelector('.dog-hero');
  await page.tap('[data-act="fetch"]');
  await page.waitForSelector('.activity-scene');

  const seen = await playQuestions(page, 7);
  expect(seen.length).toBe(5);
  for (const q of seen) expect([q.a, q.b]).toContain(2);
  await expect(page.locator('.card.center h2')).toContainText('Daisy');

  await page.tap('[data-done]');
  await page.waitForSelector('.dog-hero');
  const doc = await readProfile(page, 'play-solo');
  expect(doc.play['dog-2'].fetch).toBe(1);
});

test('group play rotates askers, questions match the asking dog', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await seedProfile(page, richDoc('play-group', 'PlayGroup'));
  await selectProfile(page, 'PlayGroup');
  await page.tap('[data-nav="/pack"]');
  await page.tap('button:has-text("Play together")');
  await page.waitForSelector('.kind-btn');
  expect(await page.$eval('[data-start]', (e) => e.disabled)).toBe(true);
  await page.tap('.dog-card:has-text("Daisy")');
  await page.tap('.dog-card:has-text("Scout")');
  await page.tap('[data-start]');
  await page.waitForSelector('.activity-scene');
  expect(await page.$$eval('.mover', (els) => els.length)).toBe(2);

  const pairs = [];
  for (let i = 0; i < 14; i++) { // group rounds are now 6 per dog (12 here)
    await page.waitForFunction(() =>
      document.querySelector('.question')?.textContent?.includes('×')
    );
    const asker = (await page.textContent('.asker-overlay')).trim();
    const q = (await page.textContent('.question')).trim();
    const [a, b] = q.split('×').map((s) => parseInt(s.trim(), 10));
    pairs.push({ asker, a, b });
    for (const d of String(a * b)) await page.tap(`.numpad .key:text-is("${d}")`);
    await page.tap('.numpad .key.ok');
    await page.waitForTimeout(1000);
    if (await page.$('[data-again]')) break;
  }
  for (const p of pairs) {
    if (p.asker.includes('Daisy')) expect([p.a, p.b]).toContain(2);
    if (p.asker.includes('Scout')) expect([p.a, p.b]).toContain(7);
  }
  const askers = new Set(pairs.map((p) => p.asker));
  expect(askers.size).toBe(2);

  const doc = await readProfile(page, 'play-group');
  expect(doc.play['dog-2'].walk).toBe(1);
  expect(doc.play['dog-7'].walk).toBe(1);
});

test('pet sitting: gated until baseline, then serves the confidence mix', async ({ page }) => {
  // Fresh profile → no sitting card
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.tap('[data-new]');
  await page.fill('.name-input', 'NoBase');
  await page.tap('form[data-create] button[type=submit]');
  await page.waitForSelector('.hero');
  expect(await page.$('.sitting-card')).toBeNull();

  // Baseline-rich profile → card appears and the mix respects the bounds
  await seedProfile(page, richDoc('play-sit', 'PlaySit'));
  await page.goto('/#/profiles', { waitUntil: 'networkidle' });
  await selectProfile(page, 'PlaySit');
  await page.waitForSelector('.sitting-card');
  const boxes = Object.fromEntries(
    Object.entries((await readProfile(page, 'play-sit')).facts).map(([k, v]) => [k, v.box])
  );
  const bucketOf = (a, b) => {
    const box = boxes[norm(a, b)] ?? 0;
    return box >= 4 ? 'mastered' : box >= 2 ? 'firm' : 'weak';
  };
  await page.tap('.sitting-card');
  await page.waitForSelector('.activity-scene');
  const seen = await playQuestions(page, 12);
  const buckets = seen.map((q) => bucketOf(q.a, q.b));
  const count = (t) => buckets.filter((x) => x === t).length;
  expect(seen.length).toBe(10);
  expect(count('weak')).toBeGreaterThanOrEqual(1);
  expect(count('weak')).toBeLessThanOrEqual(2);
  expect(count('firm')).toBeGreaterThanOrEqual(2);
  expect(count('firm')).toBeLessThanOrEqual(3);
  expect(buckets[0]).not.toBe('weak');
  expect(buckets[1]).not.toBe('weak');
  for (let i = 1; i < buckets.length; i++) {
    expect(buckets[i] === 'weak' && buckets[i - 1] === 'weak').toBe(false);
  }
});

test('slow-correct answers climb early boxes but not past the cap', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = richDoc('play-slow', 'PlaySlow');
  doc.facts[norm(5, 5)] = stat(2, { attempts: 4, correct: 3, avgMs: 8000 });
  // met once (echoed), still box 0: the slow-climb candidate — truly
  // fresh facts are now shown (echo), not asked
  doc.facts[norm(5, 6)] = { attempts: 1, correct: 0, avgMs: 3000, box: 0, lastSeen: Date.now() };
  await seedProfile(page, doc);
  await selectProfile(page, 'PlaySlow');
  await openTableGrid(page);
  await page.tap('.table-grid .table-btn:nth-child(5)'); // ×5 table
  await page.waitForSelector('.question');

  let slowFresh = null;
  await playQuestions(page, 12, {
    delayFn: (q) => {
      const key = norm(q.a, q.b);
      if (q.text === '5 × 5') return 6600; // at the cap: slow must NOT promote
      if (key === norm(5, 6)) {
        slowFresh = key;
        return 6600; // box-0 fact answered slowly: must promote to box 1
      }
      return 0;
    },
  });
  await page.waitForSelector('.big-score');
  const after = await readProfile(page, 'play-slow');
  expect(after.facts[slowFresh].box).toBe(1);
  expect(after.facts['5x5'].box).toBe(2);
});
