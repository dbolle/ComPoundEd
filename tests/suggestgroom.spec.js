// v1.52.0 grooming suggestion: "Practice next" can offer a bath when the
// board has gone dusty — maintenance that never outranks the frontier.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { suggestNext } from '../src/engine/suggest.js';
import { buildGroomRound } from '../src/engine/selector.js';
import { getDog, dogForTable } from '../src/art/dogs.js';
import { seedProfile, selectProfile, norm, stat, uniqueName } from './helpers.mjs';

const DAY = 86400e3;

function bigKid(name) {
  const p = newProfile(name);
  p.subjects = { ...p.subjects, tables: true };
  p.mastered = [];
  return p;
}

// Master a table and adopt its dog; `dusty` of its 13 facts have gone stale
// (30 days > the 21-day freshness window of box 5).
function master(p, t, dusty = 13) {
  for (let b = 0; b <= 12; b++) {
    p.facts[norm(t, b)] = stat(5, { ageMs: b < dusty ? 30 * DAY : 3600e3 });
  }
  p.unlocks.push({ dogId: dogForTable(t).id, table: t, at: Date.now() });
  p.mastered.push(t);
}

// Seed an in-progress table without clobbering a mastered one: normKey is
// shared, so 1×7 belongs to ×1 and ×7 alike.
function inProgress(p, t, box, n = 13) {
  let k = 0;
  for (let b = 0; b <= 12 && k < n; b++) {
    if (p.mastered.includes(b)) continue;
    p.facts[norm(t, b)] = stat(box, { ageMs: 3600e3 });
    k += 1;
  }
}

const isGroom = (s) => !!s && s.href.includes('kind=groom');

test('a dusty board gets a bath; a fresh one never does', () => {
  // Back from the holidays: four strong tables, nothing practised in weeks.
  const rusty = bigKid('Dusty');
  for (const t of [1, 2, 5, 10]) master(rusty, t);
  const s = suggestNext(rusty);
  expect(isGroom(s)).toBe(true);
  expect(s.teach).toBeNull();
  expect(s.ratio).toBeLessThanOrEqual(0.9); // never beats a nearly-strong table

  // Same tables, practised today: no dust, so no bath.
  const clean = bigKid('Clean');
  for (const t of [1, 2, 5, 10]) master(clean, t, 0);
  expect(isGroom(suggestNext(clean))).toBe(false);

  // A handful of dusty facts is under the bar — a bath is 13 questions, and
  // most of them would be facts that aren't due (and so pay nothing).
  const light = bigKid('Light');
  master(light, 1, 4);
  master(light, 2, 3);
  expect(isGroom(suggestNext(light))).toBe(false);
});

test('grooming never takes the button away from the learning frontier', () => {
  // A child still learning has piles of box-0 facts, which are ALWAYS due.
  // They are the frontier, not dust: no bath while they are being learnt.
  const learner = bigKid('Learner');
  master(learner, 1, 0);
  master(learner, 2, 0);
  inProgress(learner, 7, 0); // every ×7 fact due, ×3–×12 never touched
  const s = suggestNext(learner);
  expect(isGroom(s)).toBe(false);
  expect(s.href).toContain('table=');

  // A filthy board loses to a table that is nearly strong…
  const nearly = bigKid('Nearly');
  for (const t of [1, 2]) master(nearly, t);
  inProgress(nearly, 7, 3, 10);
  expect(suggestNext(nearly).label).toBe('×7');

  // …and a brand-new table is never swapped for housework either.
  const meeting = bigKid('Meeting');
  expect(suggestNext(meeting).href).toContain('/meet?table=');
});

test('the bath picks the dog that needs it: filthy dog, else Biscuit', () => {
  // One whole table gone stale → that dog's own bath (the child can see the
  // dirt on it) and its round is all that table's facts.
  const one = bigKid('One');
  master(one, 5, 13);
  const s = suggestNext(one);
  expect(s.href).toBe(`/activity?dog=${dogForTable(5).id}&kind=groom`);

  // Dust spread thin over three dogs → nobody is filthy, so the starter's
  // board-wide spa day, which pulls the rustiest facts wherever they live.
  const spread = bigKid('Spread');
  for (const t of [1, 2, 5]) master(spread, t, 5);
  expect(suggestNext(spread).href).toBe('/activity?dog=starter&kind=groom');
});

test('the suggested href really builds a groom round', () => {
  const p = bigKid('Round');
  for (const t of [1, 2, 5]) master(p, t, 5);
  const s = suggestNext(p);
  const params = new URLSearchParams(s.href.split('?')[1]);
  expect(params.get('kind')).toBe('groom');
  const round = buildGroomRound(p, getDog(params.get('dog')));
  expect(round).toHaveLength(13); // the full bath the activity screen runs
  expect(round[0].text).toMatch(/[×÷]/);
});

test('the bath speaks the grooming register — never polish or rusty', () => {
  const p = bigKid('Words');
  for (const t of [1, 2, 5]) master(p, t, 5); // spread thin → Biscuit
  const s = suggestNext(p);
  expect(s.label).toMatch(/bath/i);
  expect(s.label.toLowerCase()).not.toContain('polish');
  expect(s.label.toLowerCase()).not.toContain('rusty'); // Biscuit, not the dog named Rusty
});

test('e2e: home offers the bath and it opens the grooming round', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = bigKid(uniqueName('Bathy'));
  doc.id = 'bath-kid';
  for (const t of [1, 2, 5, 10]) master(doc, t);
  delete doc.mastered; // test-only bookkeeping, never part of the doc shape
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);

  const suggest = page.locator('[data-suggest]');
  await expect(suggest).toContainText('bath');
  await expect(suggest).not.toContainText(/polish/i);
  await page.tap('[data-suggest]');
  await expect(page.locator('.topbar strong')).toHaveText('Bath time!');
  expect(await page.$$eval('.quiz-progress.suds .paw', (e) => e.length)).toBe(13);
});
