// Missing-multiple → division: the track opens per fact family as
// multiplication is mastered, presentation bridges from "5 × _ = 20" to
// "20 ÷ 5", and 12 new dogs are earned by mastering ÷tables.
import { test, expect } from '@playwright/test';
import {
  recordDivisionAnswer,
  divisionTableProgress,
  divisionTableUnlocked,
  isDivisionTableMastered,
  MASTERY_BOX,
} from '../src/engine/leitner.js';
import { buildDivisionRound } from '../src/engine/selector.js';
import { checkUnlocks } from '../src/engine/unlocks.js';
import { newProfile, migrateProfile, SCHEMA_VERSION } from '../src/data/schema.js';
import { seedProfile, selectProfile, playQuestions, norm, stat, openDivisionGrid } from './helpers.mjs';

function masteredTable(profile, t, { division = false, box = 4 } = {}) {
  for (let b = 0; b <= 12; b++) {
    (division ? profile.division : profile.facts)[norm(t, b)] = stat(box);
  }
}

test('v4 docs migrate additively; division track starts empty', () => {
  const doc = migrateProfile({
    id: 'v4',
    schemaVersion: 4,
    name: 'V4',
    avatarDogId: 'starter',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    facts: { '2x3': stat(4) },
    unlocks: [{ dogId: 'starter', table: null, at: Date.now() }],
    play: {},
    speed: { avgMs: 0, samples: 0 },
  });
  expect(doc.schemaVersion).toBe(SCHEMA_VERSION);
  expect(doc.division).toEqual({});
});

test('division gating, progress, and dog unlocks', () => {
  const p = newProfile('Div');
  expect(divisionTableUnlocked(p, 2)).toBe(false);
  masteredTable(p, 2);
  expect(divisionTableUnlocked(p, 2)).toBe(true);
  expect(divisionTableUnlocked(p, 3)).toBe(false);

  // Master the ÷2 track → Willow (div-2) joins the pack
  masteredTable(p, 2, { division: true, box: MASTERY_BOX });
  expect(isDivisionTableMastered(p, 2)).toBe(true);
  const newly = checkUnlocks(p);
  expect(newly.map((d) => d.id)).toContain('div-2');
  // But not the ÷3 dog
  expect(newly.map((d) => d.id)).not.toContain('div-3');

  const prog = divisionTableProgress(p, 2);
  expect(prog.done).toBe(13);
});

test('recordDivisionAnswer follows Leitner rules on its own track', () => {
  const p = newProfile('Rec');
  const r1 = recordDivisionAnswer(p, 2, 7, true, 2000);
  expect(r1.fast).toBe(true);
  expect(p.division['2x7'].box).toBe(1);
  expect(p.facts['2x7']).toBeUndefined(); // multiplication stats untouched
  recordDivisionAnswer(p, 2, 7, false, 2000);
  expect(p.division['2x7'].box).toBe(0);
});

test('presentation bridges: missing-factor first, ÷ once warming up', () => {
  const p = newProfile('Bridge');
  masteredTable(p, 5);
  const fresh = buildDivisionRound(p, 5);
  expect(fresh.every((q) => q.text.includes('× _ ='))).toBe(true);
  expect(fresh.every((q) => q.kind === 'div')).toBe(true);
  // Answers are the missing factor
  for (const q of fresh) expect(q.answer * 5).toBe(Number(q.text.match(/= (\d+)/)[1]));

  masteredTable(p, 5, { division: true, box: 2 });
  const warmed = buildDivisionRound(p, 5);
  expect(warmed.every((q) => q.text.includes('÷'))).toBe(true);
});

test('e2e: unlock ÷2, play the missing-number round, earn Willow', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile('DivKid');
  doc.id = 'div-kid';
  masteredTable(doc, 2);
  doc.unlocks.push({ dogId: 'dog-2', table: 2, at: Date.now() }); // Daisy already adopted
  // ÷2 nearly mastered: 12 facts done, one at box 2 → this round finishes it
  masteredTable(doc, 2, { division: true, box: MASTERY_BOX });
  doc.division[norm(2, 5)] = stat(2);
  await seedProfile(page, doc);
  await selectProfile(page, 'DivKid');

  // Trimmed division grid: only the next locked (÷1) + the unlocked ÷2
  await expect(page.locator('[data-toggle="division"]')).toBeVisible();
  await openDivisionGrid(page);
  const divGrid = page.locator('.div-grid');
  await expect(divGrid.locator('.table-btn')).toHaveCount(2);
  await expect(divGrid.locator('.table-btn').nth(0)).toBeDisabled();
  await expect(divGrid.locator('.table-btn').nth(1)).not.toBeDisabled();

  await divGrid.locator('.table-btn').nth(1).tap();
  await page.waitForSelector('.question');
  const seen = await playQuestions(page, 12);
  // Warmed-up facts show ÷ form
  expect(seen.some((q) => q.text.includes('÷'))).toBe(true);

  // Mastering the last fact adopted Willow
  await page.waitForSelector('.big-score');
  await expect(page.locator('.unlock-card')).toContainText('Willow');

  await page.tap('[data-home]');
  await page.tap('[data-nav="/pack"]');
  await page.waitForSelector('.pack-grid .dog-card');
  await expect(page.locator('.dog-card:not(.locked)', { hasText: 'Willow' })).toBeVisible();
});

test('e2e: fresh division round uses the missing-factor bridge and teaches on misses', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile('BridgeKid');
  doc.id = 'bridge-kid';
  masteredTable(doc, 3);
  await seedProfile(page, doc);
  await selectProfile(page, 'BridgeKid');
  await openDivisionGrid(page);
  // Trimmed grid: [÷1 locked, ÷3 unlocked]
  await page.locator('.div-grid .table-btn').nth(1).tap();
  await page.waitForSelector('.question');

  const seen = await playQuestions(page, 4, {
    answerFn: (q, i) => (i === 1 ? q.right + 1 : q.right),
    afterAnswer: async (q, i) => {
      if (i === 1) {
        await expect(page.locator('.feedback.bad .hint')).toContainText('Think times');
      }
    },
  });
  expect(seen[0].text).toMatch(/^3 × _ = \d+$/);
});
