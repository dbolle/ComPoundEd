// v1.50.0 Count on! — the number sequence past nineteen (1.NBT.1). Three
// forms with three SEPARATE skill namespaces, because they must not certify
// one another: knowing what follows 29 says nothing about counting by tens
// from 24, and neither says where 47 sits on a line.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { byId, skillKeys, gameHasFrontier, gameKnown } from '../src/engine/trail.js';
import { MILESTONES, petForMilestone, checkPetUnlocks } from '../src/engine/cozy.js';
import { numberWord } from '../src/sound.js';
import { seedProfile, selectProfile, uniqueName } from './helpers.mjs';

const known = (p, key) => {
  p.little.skills[key] = { attempts: 9, streak: 9 };
};
const teenKid = (name) => {
  const p = newProfile(uniqueName(name));
  p.subjects = { ...p.subjects, little: true };
  for (let n = 1; n <= 9; n++) known(p, `teen:${n}`);
  return p;
};

test('the three forms are independent: no form can certify another', () => {
  const p = teenKid('Indep');
  // master every crossing — the game is still unfinished, because tens are
  // a different skill
  for (let d = 2; d <= 12; d++) known(p, `seq:${d}`);
  expect(gameHasFrontier(p, 'counton'), 'tens still to learn').toBe(true);
  expect(gameKnown(p, 'counton')).toBe(false);

  for (let r = 1; r <= 9; r++) known(p, `ten:${r}`);
  expect(gameKnown(p, 'counton'), 'both fluencies ⇒ finished').toBe(true);

  // placement is ENRICHMENT: never knowing it cannot hold the game open
  expect(gameHasFrontier(p, 'counton'), 'place must not gate').toBe(false);
  const place = byId('counton').skills.find((s) => s.ns === 'place');
  expect(place.required).toBe(false);
  expect(place.streak, 'binned answers are guessable ⇒ longer streak').toBe(4);
});

test('the milestone needs the fluencies, not the bridge, and adopts its own pet', () => {
  const m = MILESTONES.find((x) => x.id === 'counton');
  expect(m, 'counton is a milestone').toBeTruthy();
  const p = teenKid('Miles');
  for (let d = 2; d <= 12; d++) known(p, `seq:${d}`);
  expect(m.earned(p), 'crossings alone are not enough').toBe(false);
  for (let r = 1; r <= 9; r++) known(p, `ten:${r}`);
  expect(m.earned(p), 'both fluencies earn it').toBe(true);
  expect(m.prog(p)).toEqual({ have: 20, need: 20 });

  // and it lands on a pet nobody else claims
  const pet = petForMilestone('counton');
  const others = MILESTONES.filter((x) => x.id !== 'counton').map((x) => petForMilestone(x.id).id);
  expect(others).not.toContain(pet.id);

  p.subjects.little = true;
  const fresh = checkPetUnlocks(p);
  expect(fresh.map((f) => f.milestone)).toContain('counton');
});

test('the skill catalogue is finite and covers the whole sequence to 120', () => {
  const keys = skillKeys('counton');
  expect(keys.length).toBe(25); // 11 crossings + 9 tens + 5 windows
  // one crossing per decade from 20 through 120
  for (let d = 2; d <= 12; d++) expect(keys).toContain(`seq:${d}`);
  // one per ones-digit, since that is what stays constant counting by tens
  for (let r = 1; r <= 9; r++) expect(keys).toContain(`ten:${r}`);
  for (let w = 1; w <= 5; w++) expect(keys).toContain(`place:${w}`);
});

test('e2e: a crossing question is asked, spoken as words, and answered', async ({ page }) => {
  const spoken = [];
  await page.addInitScript(() => {
    window.__spoken = [];
    const orig = speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak = (u) => {
      window.__spoken.push(u.text);
      orig(u);
    };
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = teenKid('Crosser');
  doc.id = 'counton-kid';
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);

  // the tile is reachable — the whole point of the readiness predicate
  await expect(page.locator('.little-tile[data-game="counton"]')).toBeVisible();

  await page.evaluate(() => {
    location.hash = '#/little?game=counton';
  });
  await page.waitForSelector('.little-stage');
  await page.waitForTimeout(400);

  // a fresh teen kid has no seq/ten yet, so form 1 (crossings) is served
  const nums = await page.$$eval('.path-num', (els) => els.map((e) => Number(e.textContent)));
  expect(nums.length, 'a three-term run').toBe(3);
  expect(nums[1] - nums[0], 'counting by ones').toBe(1);
  expect(nums[2] % 10, 'the run ends on a 9 — the crossing').toBe(9);

  // the prompt is SPOKEN as a word, not read as a numeral
  const said = await page.evaluate(() => window.__spoken ?? []);
  const prev = nums[2];
  expect(said.join(' '), `should speak "${numberWord(prev)}"`).toContain(numberWord(prev));

  // Play the whole round: skills are written to memory per answer but only
  // persisted by ctx.save() when the round finishes, so a mid-round read of
  // IndexedDB sees nothing.
  const crossings = new Set();
  for (let q = 0; q < 5; q++) {
    const run = await page.$$eval('.path-num', (els) => els.map((e) => Number(e.textContent)));
    const want = run[2] + 1;
    crossings.add(want / 10);
    await page.locator(`.little-card:has-text("${want}")`).first().tap();
    await expect(page.locator('.paw.done')).toHaveCount(q + 1);
    if (q < 4) await page.waitForTimeout(1800); // the feedback window
  }
  await page.waitForSelector('[data-again]');
  expect(errors).toEqual([]);

  // and the skills recorded are CROSSINGS, not a generic counton:<n>
  const after = await page.evaluate(async (id) => {
    const db = await new Promise((res) => {
      const r = indexedDB.open('compounded', 1);
      r.onsuccess = () => res(r.result);
    });
    const q = db.transaction('profiles').objectStore('profiles').get(id);
    return new Promise((res) => (q.onsuccess = () => res(q.result)));
  }, doc.id);
  const keys = Object.keys(after.little.skills).filter((k) => k.startsWith('seq:'));
  expect(keys.sort(), 'recorded under seq:<decade>').toEqual(
    [...crossings].map((d) => `seq:${d}`).sort()
  );
  // nothing under a made-up namespace, and no counton:<n> catch-all
  expect(Object.keys(after.little.skills).filter((k) => k.startsWith('counton:'))).toEqual([]);
});
