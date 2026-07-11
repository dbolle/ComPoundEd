// Grooming Phase 1: dirt derives from the dog's own rusty facts (never
// stored, never sad), and a bath is the COMPLETE fact set — misses re-queue
// until every fact is answered correctly, which washes the dog by
// construction.
import { test, expect } from '@playwright/test';
import { DOGS, getDog, dirtFor, dogSVG } from '../src/art/dogs.js';
import { buildGroomRound } from '../src/engine/selector.js';
import { newProfile } from '../src/data/schema.js';
import { seedProfile, selectProfile, playQuestions, readProfile, norm, stat } from './helpers.mjs';

const DAY = 86400e3;

function dogTwoDoc(id, name, { overdue = 5 } = {}) {
  const doc = newProfile(name);
  doc.id = id;
  for (let b = 0; b <= 12; b++) {
    doc.facts[norm(2, b)] = stat(4, { ageMs: b < overdue ? 30 * DAY : 3600e3 });
  }
  doc.unlocks.push({ dogId: 'dog-2', table: 2, at: Date.now() });
  return doc;
}

test('dirt levels: derived, capped, and Biscuit never gets dirty', () => {
  const p = newProfile('Dirt');
  const daisy = getDog('dog-2');
  expect(dirtFor(p, daisy)).toBe(0); // nothing attempted → nothing due

  for (let b = 0; b <= 12; b++) p.facts[norm(2, b)] = stat(4, { ageMs: 3600e3 });
  expect(dirtFor(p, daisy)).toBe(0); // fresh mastery → clean

  for (let b = 0; b < 2; b++) p.facts[norm(2, b)] = stat(4, { ageMs: 30 * DAY });
  expect(dirtFor(p, daisy)).toBe(1); // a little dusty
  for (let b = 0; b < 6; b++) p.facts[norm(2, b)] = stat(4, { ageMs: 30 * DAY });
  expect(dirtFor(p, daisy)).toBe(2);
  for (let b = 0; b <= 12; b++) p.facts[norm(2, b)] = stat(4, { ageMs: 30 * DAY });
  expect(dirtFor(p, daisy)).toBe(3); // capped — never worse than "played hard"

  expect(dirtFor(p, getDog('starter'))).toBe(0); // Biscuit stays clean, always

  // Division dogs read their own track
  const willow = getDog('div-2');
  expect(dirtFor(p, willow)).toBe(0);
  for (let b = 0; b <= 12; b++) p.division[norm(2, b)] = stat(4, { ageMs: 30 * DAY });
  expect(dirtFor(p, willow)).toBe(3);
});

test('the dirt layer renders only when dirty', () => {
  const daisy = getDog('dog-2');
  expect(dogSVG(daisy, 96, [], 0)).not.toContain('data-dirt');
  expect(dogSVG(daisy, 96, [], 2)).toContain('data-dirt="2"');
});

test('buildGroomRound: the complete set, rustiest first, per track', () => {
  const p = dogTwoDoc('unit', 'Unit');
  const round = buildGroomRound(p, getDog('dog-2'));
  expect(round).toHaveLength(13);
  // Every fact of the table exactly once
  const keys = new Set(round.map((q) => norm(q.a, q.b)));
  expect(keys.size).toBe(13);
  // The 5 overdue facts lead
  expect(round.slice(0, 5).every((q) => q.due === 1)).toBe(true);

  // Division dog grooms its ÷ set in that track's presentation
  for (let b = 0; b <= 12; b++) p.division[norm(3, b)] = stat(2);
  const divRound = buildGroomRound(p, getDog('div-3'));
  expect(divRound).toHaveLength(13);
  expect(divRound.every((q) => q.kind === 'div' && q.text.includes('÷'))).toBe(true);
});

test('e2e: dusty dog → full-set bath with re-queued miss → squeaky clean', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await seedProfile(page, dogTwoDoc('groom-kid', 'GroomKid'));
  await selectProfile(page, 'GroomKid');

  // Dust shows on the pack and the dog page, with the gentle bath hint
  await page.tap('[data-nav="/pack"]');
  await page.waitForSelector('.pack-grid .dog-card');
  expect(await page.$('.dog-card [data-dirt]')).not.toBeNull();
  await page.tap('.dog-card:has-text("Daisy")');
  await page.waitForSelector('.dog-hero');
  expect(await page.$('.dog-hero [data-dirt]')).not.toBeNull();
  await expect(page.locator('.groom-hint')).toContainText('bath time');

  // Biscuit: never dirty, no groom button
  await page.tap('[data-back]');
  await page.tap('.dog-card:has-text("Biscuit")');
  await page.waitForSelector('.dog-hero');
  expect(await page.$('.dog-hero [data-dirt]')).toBeNull();
  expect(await page.$('[data-act="groom"]')).toBeNull();
  await page.tap('[data-back]');
  await page.tap('.dog-card:has-text("Daisy")');
  await page.waitForSelector('.dog-hero');

  // The bath: 13 facts, one deliberate miss re-queues to the END
  await page.tap('[data-act="groom"]');
  await page.waitForSelector('.activity-scene');
  let missedText = null;
  const seen = await playQuestions(page, 16, {
    answerFn: (q, i) => {
      if (i === 2) {
        missedText = q.text;
        return q.right + 1;
      }
      return q.right;
    },
  });
  expect(seen).toHaveLength(14); // 13 + the re-queued miss
  expect(seen[13].text).toBe(missedText); // back of the line, not immediate

  // Clean reveal, and the data agrees
  await page.waitForSelector('.clean-reveal');
  expect(await page.$('.clean-reveal [data-dirt]')).toBeNull();
  const doc = await readProfile(page, 'groom-kid');
  expect(doc.play['dog-2'].groom).toBe(1);
  const stale = Object.values(doc.facts).filter(
    (s) => Date.now() - s.lastSeen > 7 * DAY
  );
  expect(stale).toHaveLength(0); // every fact refreshed → dirt derives to 0

  await page.tap('[data-done]');
  await page.waitForSelector('.dog-hero');
  expect(await page.$('.dog-hero [data-dirt]')).toBeNull();
  expect(await page.$('.groom-hint')).toBeNull();
});
