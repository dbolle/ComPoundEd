// The Money Math TRACK (Phase 7 R5) — distinct from tests/money.spec.js,
// which covers the Paw Bucks ECONOMY (the sitting faucet, the ledger, the
// wallet). Same word, two different things: one is what a child earns, the
// other is what they study.
//
// What these defend, in order of what would hurt
// a child most: that the track is REACHABLE, that it pays what the owner
// decided and not the draft amount, that mastery is possible at all (an
// untimed track is not a preference — with a finite speed bar it could
// never be mastered), and that a preview cannot leak to a profile whose
// parent never opted in.
import { test, expect } from '@playwright/test';
import { newProfile, migrateProfile, mergeProfiles } from '../src/data/schema.js';
import { MONEY_SKILL_IDS, MONEY_WAVES } from '../src/engine/moneywaves.js';
import { buildMoneyQuestion, dollarForm, centForm } from '../src/engine/moneyq.js';
import {
  MONEY_MILESTONES,
  currentWave,
  isWaveMastered,
  isWaveUnlocked,
  milestoneEarned,
  moneyProgress,
  nextSkills,
  payForWave,
  payMastered,
  payMilestones,
  waveProgress,
} from '../src/engine/moneytrack.js';
import { moneyReady, moneyVisible } from '../src/engine/readiness.js';
import { balanceCents } from '../src/engine/money.js';
import { MILESTONES, petForMilestone, milestoneReachable } from '../src/engine/cozy.js';
import { PETS } from '../src/art/pets.js';
import { recordMoneyAnswer, MASTERY_BOX, SLOW_CAP } from '../src/engine/leitner.js';
import { readProfile, seedProfile, selectProfile, uniqueName } from './helpers.mjs';

const beta = (p) => {
  p.subjects = { ...p.subjects, beta: true };
  return p;
};
// Master every identity in a wave, the way a child would: repeated
// first-try corrects until the box reaches mastery.
const masterWave = (p, i) => {
  for (const id of MONEY_WAVES[i].skills) {
    for (let k = 0; k < MASTERY_BOX; k++) recordMoneyAnswer(p, id, true, 999999);
  }
};

// --- the question builder, across all 134 -------------------------------

test('every one of the 134 identities builds an askable question', () => {
  const problems = [];
  for (const id of MONEY_SKILL_IDS) {
    for (const seed of [0, 1, 2, 3, 7, 11]) {
      const q = buildMoneyQuestion(id, seed);
      if (!q) {
        problems.push(`${id}: no question`);
        continue;
      }
      if (!q.ask || !q.say) problems.push(`${id}: missing prompt`);
      if (q.answer === undefined || q.answer === null) problems.push(`${id}: no answer`);
      // A choice question a child cannot get right is worse than no
      // question: the answer must be present, and present exactly once.
      if (q.kind === 'choice') {
        if (!q.choices.includes(q.answer)) problems.push(`${id}@${seed}: answer not offered`);
        if (new Set(q.choices).size !== q.choices.length) problems.push(`${id}@${seed}: duplicate choices`);
      }
      if (q.kind === 'pile') {
        const right = q.options.filter((o) => o.cents === q.answer).length;
        if (right !== 1) problems.push(`${id}@${seed}: ${right} correct piles`);
      }
      if (q.kind === 'change' && !(q.answer > 0)) problems.push(`${id}: change is not positive`);
      if (q.kind === 'build' && !(q.target > 0)) problems.push(`${id}: nothing to build`);
    }
  }
  expect(problems.slice(0, 8), `${problems.length} broken identities`).toEqual([]);
});

test('both notations agree, and each asks in the other direction', () => {
  expect(dollarForm(5)).toBe('$0.05');
  expect(dollarForm(45)).toBe('$0.45');
  expect(dollarForm(105)).toBe('$1.05');
  expect(dollarForm(1000)).toBe('$10.00');
  expect(centForm(45)).toBe('45¢');
  // seed parity flips which form is shown, so a child meets both
  const a = buildMoneyQuestion('not:45', 0);
  const b = buildMoneyQuestion('not:45', 1);
  expect([a.shown, b.shown].sort()).toEqual(['$0.45', '45¢']);
});

// --- untimed mastery ----------------------------------------------------

test('a deliberately SLOW answer still reaches mastery — the track depends on it', () => {
  // With any finite speed bar, applyAnswer caps a slow-correct answer at
  // SLOW_CAP (2) and mastery is MASTERY_BOX (3): every wave would stall
  // forever at wave 1, unmasterable and unpaid.
  expect(SLOW_CAP).toBeLessThan(MASTERY_BOX);
  const p = newProfile('Slow');
  for (let k = 0; k < MASTERY_BOX; k++) recordMoneyAnswer(p, 'coin:dime', true, 10 * 60 * 1000);
  expect(p.money['coin:dime'].box).toBeGreaterThanOrEqual(MASTERY_BOX);
});

test('money answers never feed the speed calibration or the ⚡ ladder', () => {
  const p = newProfile('Calib');
  const before = JSON.stringify(p.speed);
  for (let k = 0; k < 10; k++) recordMoneyAnswer(p, 'coin:dime', true, 900);
  expect(JSON.stringify(p.speed), 'money must not calibrate the speed bar').toBe(before);
  // an infinite bar marks every correct answer "fast"; that flag feeds
  // stats.fastAnswers, so a track with no speed bar reports none
  const r = recordMoneyAnswer(p, 'coin:penny', true, 5);
  expect(r.fast, 'no lightning badge per coin question').toBe(false);
});

// --- what it pays (owner decision, halved from the draft) ---------------

test('waves 1–4 pay a penny and 5–7 pay a nickel; the whole track is 674¢', () => {
  expect([0, 1, 2, 3].map(payForWave)).toEqual([1, 1, 1, 1]);
  expect([4, 5, 6].map(payForWave)).toEqual([5, 5, 5]);

  const p = newProfile('Rich');
  MONEY_WAVES.forEach((_, i) => masterWave(p, i));
  for (const id of MONEY_SKILL_IDS) payMastered(p, id);
  payMilestones(p);

  // 74 identities × 1¢ + 60 × 5¢ + 3 milestones × 100¢
  expect(balanceCents(p)).toBe(74 * 1 + 60 * 5 + 3 * 100);
  expect(balanceCents(p)).toBe(674);
  // and it must NOT out-earn the crown, which is why it was halved
  expect(balanceCents(p)).toBeLessThan(1200);
});

test('paying is idempotent — a merge cannot pay for the same identity twice', () => {
  const a = newProfile('Dev1');
  a.id = 'same';
  masterWave(a, 0);
  for (const id of MONEY_WAVES[0].skills) payMastered(a, id);
  const b = JSON.parse(JSON.stringify(a));
  for (const id of MONEY_WAVES[0].skills) payMastered(b, id); // the other device
  const merged = mergeProfiles(migrateProfile(a), migrateProfile(b));
  expect(balanceCents(merged)).toBe(MONEY_WAVES[0].skills.length * 1);
});

test('an id this build has never heard of is never paid', () => {
  const p = newProfile('Future');
  expect(payMastered(p, 'quux:99')).toBeNull();
  expect(balanceCents(p)).toBe(0);
});

// --- waves and milestones ----------------------------------------------

test('waves open in order, and three grouped milestones adopt the three pigs', () => {
  const p = newProfile('Walker');
  expect(isWaveUnlocked(p, 0), 'wave 1 is always open').toBe(true);
  expect(isWaveUnlocked(p, 1)).toBe(false);
  masterWave(p, 0);
  expect(isWaveMastered(p, 0)).toBe(true);
  expect(isWaveUnlocked(p, 1)).toBe(true);
  expect(currentWave(p)).toBe(1);

  expect(milestoneEarned(p, 0), 'm1 needs waves 1 AND 2').toBe(false);
  masterWave(p, 1);
  expect(milestoneEarned(p, 0)).toBe(true);

  const pigs = MONEY_MILESTONES.map((m) => petForMilestone(`money-${m.id}`));
  expect(pigs.map((x) => x.id)).toEqual(['pig-1', 'pig-2', 'pig-3']);
  expect(pigs.every((x) => x.species === 'pig')).toBe(true);
  // the invariant that makes the positional mapping safe
  expect(MILESTONES.length).toBe(PETS.length);
  const all = MILESTONES.map((m) => petForMilestone(m.id).id);
  expect(new Set(all).size, 'two milestones share a pet').toBe(all.length);
});

test('a round never runs dry, even on a wave shorter than the round', () => {
  const p = newProfile('Short');
  for (let w = 0; w < MONEY_WAVES.length; w++) {
    const q = nextSkills(p, w, 5);
    expect(q.length, `wave ${w + 1} served ${q.length}`).toBe(5);
    for (const id of q) expect(MONEY_WAVES[w].skills).toContain(id);
  }
});

test('progress counts all 134', () => {
  const p = newProfile('Prog');
  expect(moneyProgress(p)).toEqual({ done: 0, total: 134 });
  masterWave(p, 0);
  expect(moneyProgress(p).done).toBe(MONEY_WAVES[0].skills.length);
  expect(waveProgress(p, 0)).toEqual({ done: 5, total: 5 });
});

// --- the preview gate ---------------------------------------------------

test('the track is invisible until a parent turns the beta chip on', () => {
  const p = newProfile('Preview');
  p.facts['3x4'] = { box: 3, attempts: 8, correct: 8 }; // mid-trail: ready
  expect(moneyReady(p), 'readiness does not depend on beta').toBe(true);
  expect(moneyVisible(p), 'but visibility does').toBe(false);

  beta(p);
  expect(moneyVisible(p)).toBe(true);

  // a parent's explicit off still outranks everything
  p.subjects = { ...p.subjects, money: false };
  expect(moneyVisible(p)).toBe(false);
});

test('the money pigs stay hidden in the Corner for a non-beta profile', () => {
  const p = newProfile('NoBeta');
  p.facts['3x4'] = { box: 3, attempts: 8, correct: 8 };
  const money = MILESTONES.filter((m) => m.kind === 'money');
  expect(money).toHaveLength(3);
  for (const m of money) expect(milestoneReachable(p, m)).toBe(false);
  beta(p);
  for (const m of money) expect(milestoneReachable(p, m)).toBe(true);
});

test('an experienced profile can reach money without any counting history', () => {
  const veteran = beta(newProfile('Veteran'));
  veteran.facts['7x8'] = { box: 4, attempts: 9, correct: 9 };
  expect(moneyReady(veteran)).toBe(true);
  const beginner = beta(newProfile('Beginner'));
  expect(moneyReady(beginner)).toBe(false);
});

// --- reachable, end to end ----------------------------------------------

test('e2e: a beta profile finds Money Math on the home and plays a round', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/', { waitUntil: 'networkidle' });

  const doc = newProfile(uniqueName('Coiner'));
  doc.id = 'money-e2e-kid';
  doc.subjects = { ...doc.subjects, beta: true, tables: true };
  doc.facts['3x4'] = { box: 4, attempts: 9, correct: 9, avgMs: 2000, lastSeen: Date.now() };
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);

  // it must be REACHABLE from the home, not only by deep link
  const card = page.locator('[data-money]');
  await expect(card, 'no Money Math card on the home screen').toHaveCount(1);
  await card.click();

  await page.waitForSelector('.money-ask');
  await expect(page.locator('.coin-row svg').first(), 'real coin art, not CSS discs').toBeVisible();

  // Answer by trying the choices until one is accepted — a child's own
  // path, and it exercises the wrong-answer branch too. The round advances
  // on a correct tap, so the pips are the signal.
  // A correct tap takes 700ms to advance, so drive on the DOM rather than a
  // fixed interval: tap, wait for the pip count to move or the choices to
  // change, and stop at the finish card.
  const finished = page.locator('[data-again]');
  for (let step = 0; step < 40 && !(await finished.count()); step++) {
    const choices = page.locator('.money-choice');
    if (!(await choices.count())) break;
    const n = await choices.count();
    await choices.nth(step % n).click();
    await page.waitForTimeout(800);
  }
  await expect(finished, 'the round never reached its finish card').toHaveCount(1);
  expect(errors, 'the money round threw').toEqual([]);

  // It must have RECORDED against a real money identity — a round that
  // renders but writes nothing is the failure that matters.
  const saved = await readProfile(page, doc.id);
  const keys = Object.keys(saved?.money ?? {});
  expect(keys.length, 'the round recorded no money progress').toBeGreaterThan(0);
  for (const k of keys) expect(MONEY_SKILL_IDS).toContain(k);
});

test('e2e: a NON-beta profile is bounced off the money route', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Plain'));
  doc.id = 'money-nobeta-kid';
  doc.subjects = { ...doc.subjects, tables: true };
  doc.facts['3x4'] = { box: 4, attempts: 9, correct: 9, avgMs: 2000, lastSeen: Date.now() };
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await expect(page.locator('[data-money]'), 'no card without beta').toHaveCount(0);

  await page.evaluate(() => {
    location.hash = '#/money';
  });
  await page.waitForTimeout(600);
  await expect(page.locator('.money-ask'), 'deep link must not open the track').toHaveCount(0);
});
