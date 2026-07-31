// v1.34.0 progression clarity: milestone reachability (no pet a profile
// can't earn is dangled) and the next-friend meter that only correct
// answers move.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { MILESTONES, milestoneReachable, nextPetGoal, gameGoal } from '../src/engine/cozy.js';
import { seedProfile, selectProfile, uniqueName, norm, stat } from './helpers.mjs';

const skilled = (game, lo, hi, streak = 3) => {
  const out = {};
  for (let n = lo; n <= hi; n++) out[`${game}:${n}`] = { attempts: 4, streak };
  return out;
};

test('reachability: little milestones need little; wave milestones need the bridge', () => {
  const littleKid = newProfile('L');
  littleKid.subjects = { ...littleKid.subjects, little: true };
  const bridgeKid = newProfile('B');
  bridgeKid.subjects = { ...bridgeKid.subjects, tables: true };
  bridgeKid.addition = { '2+3': { attempts: 3, correct: 3, avgMs: 2000, box: 2, lastSeen: 1 } };

  const look = MILESTONES.find((m) => m.id === 'look');
  const w1 = MILESTONES.find((m) => m.id === 'w1');
  expect(milestoneReachable(littleKid, look)).toBe(true);
  expect(milestoneReachable(bridgeKid, look)).toBe(false);
  expect(milestoneReachable(bridgeKid, w1)).toBe(true);
});

test('nextPetGoal skips unreachable milestones; gameGoal tracks its own game', () => {
  const bridgeKid = newProfile('B');
  bridgeKid.subjects = { ...bridgeKid.subjects, tables: true };
  bridgeKid.addition = { '2+3': { attempts: 3, correct: 3, avgMs: 2000, box: 2, lastSeen: 1 } };
  const goal = nextPetGoal(bridgeKid);
  expect(goal.id).toBe('w1'); // not count3/count5 — the kid can't reach those

  const littleKid = newProfile('L');
  littleKid.subjects = { ...littleKid.subjects, little: true };
  littleKid.little = { xp: 0, skills: skilled('count', 1, 2), revealed: [] };
  const g = gameGoal(littleKid, 'count');
  expect(g.id).toBe('count3');
  expect(g.have).toBe(2);
  expect(g.need).toBe(3);
  // finished milestones fall through to the next one for the same game
  littleKid.petUnlocks = [{ petId: 'x', milestone: 'count3', at: 1 }];
  expect(gameGoal(littleKid, 'count').id).toBe('count5');
  // games with no milestone have no in-game goal of their own
  expect(gameGoal(littleKid, 'find')).toBe(null);
});

test('e2e: a bridge-only kid sees no counting pets in the corner', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('BridgeCorner'));
  doc.id = 'bridge-corner-kid';
  doc.subjects = { ...doc.subjects, tables: true };
  doc.addition = { '2+3': { attempts: 3, correct: 3, avgMs: 2000, box: 2, lastSeen: 1 } };
  doc.petUnlocks.push({ petId: 'cat-1', milestone: 'look', at: 1 }); // adopted stays visible
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.evaluate(() => { location.hash = '#/corner'; });
  await page.waitForSelector('.dog-card');
  // wave pets show as ??? goals; little-skill hints are gone
  await expect(page.locator('.lock-hint', { hasText: 'adding' }).first()).toBeVisible();
  await expect(page.locator('.lock-hint', { hasText: 'Number friends' })).toHaveCount(0);
  await expect(page.locator('.lock-hint', { hasText: 'Counting' })).toHaveCount(0);
  // the adopted counting pet still shows
  await expect(page.locator('.dog-card:not(.locked)', { hasText: 'Whiskers' })).toBeVisible();
});

test('e2e: the next-friend meter sits in the game and moves on correct answers', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Meter'));
  doc.id = 'meter-kid';
  doc.subjects = { ...doc.subjects, little: true };
  doc.little = { xp: 0, skills: skilled('count', 1, 2), revealed: [] };
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.little-hero');

  // home: the goal card shows the count3 goal at 2/3
  await expect(page.locator('.goal-card')).toContainText('2/3');

  await page.evaluate(() => { location.hash = '#/little?game=count&v=frame'; });
  await page.waitForSelector('.little-card');
  const chip = page.locator('[data-pet-goal]');
  await expect(chip).toBeVisible();
  await page.tap('.little-card[data-good="1"]');
  await expect(chip).toHaveClass(/nudge|pop/); // correct answers visibly move it
});
