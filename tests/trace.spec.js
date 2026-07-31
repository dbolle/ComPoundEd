// v1.35.0 Trace it! ✏️ — numeral formation for little pups. Gentle judge:
// cover most of the thick guide, wobbles fine, no stroke-order rules.
// The milestone (digits 1–9 known) adopts PETS[23].
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { DIGIT_STROKES, samplePoints, tracePasses, traceCoverage } from '../src/art/digits.js';
import { MILESTONES, petForMilestone, checkPetUnlocks } from '../src/engine/cozy.js';
import { PETS } from '../src/art/pets.js';
import { seedProfile, selectProfile, uniqueName } from './helpers.mjs';

test('digits 1–9 exist, stay in the box, and judge sanely', () => {
  for (let d = 1; d <= 9; d++) {
    const strokes = DIGIT_STROKES[d];
    expect(strokes?.length).toBeGreaterThan(0);
    const pts = samplePoints(d);
    expect(pts.length).toBeGreaterThan(10);
    for (const [x, y] of pts) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(100);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(100);
    }
    // a perfect trace (the guide itself) passes…
    expect(tracePasses(d, pts)).toBe(true);
    // …a wobbly trace (everything nudged 8 units) still passes — gentle…
    expect(tracePasses(d, pts.map(([x, y]) => [x + 8, y]))).toBe(true);
    // …a poke does not
    expect(tracePasses(d, [[50, 50], [51, 51]])).toBe(false);
  }
  // half a digit is not enough
  const half = samplePoints(8).slice(0, Math.floor(samplePoints(8).length / 2) - 4);
  expect(traceCoverage(8, half)).toBeLessThan(0.8);
});

test('the trace milestone is LAST (positional mapping) and adopts PETS[23]', () => {
  expect(MILESTONES[MILESTONES.length - 1].id).toBe('trace');
  expect(MILESTONES.length).toBe(24);
  expect(petForMilestone('trace').id).toBe(PETS[23].id);

  const p = newProfile('Tracer');
  p.subjects = { ...p.subjects, little: true };
  p.little = { xp: 0, skills: {}, revealed: [] };
  for (let n = 1; n <= 9; n++) p.little.skills[`trace:${n}`] = { attempts: 3, streak: 3 };
  const fresh = checkPetUnlocks(p);
  expect(fresh.map((u) => u.petId)).toContain(PETS[23].id);
});

test('e2e: finger-trace the 3 — guide, judge, skill write; a scribble stays kind', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Trace'));
  doc.id = 'trace-kid';
  doc.subjects = { ...doc.subjects, little: true };
  const skills = {};
  for (let n = 1; n <= 5; n++) skills[`count:${n}`] = { attempts: 4, streak: 4 };
  doc.little = { xp: 10, skills, revealed: [] };
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.little-hero');

  // the tile revealed itself (count 1–5 known is the gate)
  await expect(page.locator('[data-game="trace"]')).toBeVisible();

  await page.evaluate(() => { location.hash = '#/little?game=trace&v=3'; });
  await page.waitForSelector('.trace-svg');
  const box = await (await page.$('.trace-svg')).boundingBox();
  const toPage = ([x, y]) => [box.x + (x / 100) * box.width, box.y + (y / 100) * box.height];

  // a tiny scribble is not judged wrong — no paw earned, no shake, just kind
  await page.mouse.move(...toPage([50, 50]));
  await page.mouse.down();
  await page.mouse.move(...toPage([52, 52]));
  await page.mouse.up();
  expect(await page.$$eval('.paw.done', (els) => els.length)).toBe(0);

  // trace the digit along its own guide
  const pts = samplePoints3();
  await page.mouse.move(...toPage(pts[0]));
  await page.mouse.down();
  for (const pt of pts) await page.mouse.move(...toPage(pt), { steps: 1 });
  await page.mouse.up();
  await expect(page.locator('.trace-svg.trace-done')).toBeVisible();
  expect(await page.$$eval('.paw.done', (els) => els.length)).toBe(1);

  function samplePoints3() {
    // inline copy of digit 3's guide samples (page.mouse needs them here)
    return samplePoints(3);
  }
});
