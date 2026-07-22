// Track 1 + Cozy Corner: skill-gated graduation tiles, penny-per-known,
// milestone pet adoptions grouped by habitat.
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { MILESTONES, checkPetUnlocks, petForMilestone } from '../src/engine/cozy.js';
import { waveFacts } from '../src/engine/waves.js';
import { normAddKey } from '../src/engine/leitner.js';
import { earnSkillKnown, balanceCents } from '../src/engine/money.js';
import { seedProfile, selectProfile, uniqueName } from './helpers.mjs';

const skilled = (game, lo, hi) => {
  const skills = {};
  for (let n = lo; n <= hi; n++) skills[`${game}:${n}`] = { attempts: 3, streak: 3 };
  return skills;
};

test('milestones adopt pets once; addition waves adopt too', () => {
  const p = newProfile('Adopter');
  expect(checkPetUnlocks(p)).toEqual([]);
  p.little = { xp: 0, skills: skilled('look', 1, 10) };
  const fresh = checkPetUnlocks(p);
  expect(fresh).toHaveLength(1);
  expect(fresh[0].milestone).toBe('look');
  expect(fresh[0].pet.id).toBe(petForMilestone('look').id);
  expect(checkPetUnlocks(p)).toEqual([]); // idempotent

  for (const [a, b] of waveFacts(0)) {
    p.addition[normAddKey(a, b)] = { attempts: 5, correct: 5, avgMs: 2000, box: 3, lastSeen: Date.now() };
  }
  const wavePet = checkPetUnlocks(p);
  expect(wavePet).toHaveLength(1);
  expect(wavePet[0].milestone).toBe('w1');

  // mastering the matching TAKING AWAY wave adopts its own pet
  for (const [a, b] of waveFacts(0)) {
    p.subtraction[normAddKey(a, b)] = { attempts: 5, correct: 5, avgMs: 2000, box: 3, lastSeen: Date.now() };
  }
  const subPet = checkPetUnlocks(p);
  expect(subPet).toHaveLength(1);
  expect(subPet[0].milestone).toBe('s1');
  expect(subPet[0].pet.id).not.toBe(wavePet[0].pet.id);
  expect(MILESTONES).toHaveLength(23); // + the two early-friend milestones
});

test('a known number pays one penny, ever', () => {
  const p = newProfile('Penny');
  expect(earnSkillKnown(p, 'count:7').cents).toBe(1);
  expect(earnSkillKnown(p, 'count:7')).toBeNull();
  expect(balanceCents(p)).toBe(1);
});

test('e2e: graduation tile appears with skill; finishing a round adopts into the Corner', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Grad'));
  doc.id = 'grad-kid';
  doc.subjects = { ...doc.subjects, little: true };
  // counting known → Quick Look unlocked; look 1–10 known → milestone due
  doc.little = { xp: 20, skills: { ...skilled('count', 1, 5), ...skilled('look', 1, 10) } };
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);

  await page.waitForSelector('.little-tile');
  await expect(page.locator('[data-game="look"]')).toBeVisible();

  // finish any skill round → checkPetUnlocks adopts the look pet
  await page.tap('[data-game="count"]');
  await page.waitForSelector('.little-card');
  for (let q = 0; q < 5; q++) {
    await page.tap('.little-card[data-good="1"]');
    await expect(page.locator('.paw.done')).toHaveCount(q + 1);
    if (q < 4) await page.waitForTimeout(1100);
  }
  await page.waitForSelector('[data-again]');
  await expect(page.locator('.badge', { hasText: 'New cozy friend' })).toBeVisible();

  await page.tap('[data-home]');
  await page.waitForSelector('.little-tile');
  await page.tap('[data-corner]');
  await page.waitForSelector('.corner-grid');
  // count 1–5 + look 1–10 known → count3 + count5 + look all adopt
  await expect(page.locator('.dog-card:not(.locked)')).toHaveCount(3);
  await expect(page.locator('.habitat-title').first()).toBeVisible();
});

test('e2e: number friends starts pictures-only, goes symbolic with mastery', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const fresh = newProfile(uniqueName('Bond'));
  fresh.id = 'bond-kid-a';
  fresh.subjects = { ...fresh.subjects, little: true };
  fresh.little = { xp: 20, skills: { ...skilled('count', 1, 5), ...skilled('look', 1, 5) } };
  await seedProfile(page, fresh);
  await selectProfile(page, fresh.name);
  await page.waitForSelector('.little-tile');
  await page.tap('[data-game="bond"]');
  await page.waitForSelector('.little-card');
  // pictures stage: frame with empty cells, picture-pile choices, no ➕ row
  await expect(page.locator('.little-stage .li.empty').first()).toBeVisible();
  expect(await page.$$eval('.little-card .little-items', (els) => els.length)).toBe(3);
  expect(await page.$('.little-stage .pattern-q')).toBeNull();

  // a kid who knows most parts of 5 sees the symbolic equation
  await page.evaluate(() => { location.hash = '#/home'; });
  await page.waitForSelector('.little-tile');
  await page.evaluate(async () => {
    await new Promise((res) => {
      const open = indexedDB.open('compounded');
      open.onsuccess = () => {
        const tx = open.result.transaction(['profiles'], 'readwrite');
        const st = tx.objectStore('profiles');
        st.get('bond-kid-a').onsuccess = function () {
          const d = this.result;
          for (let k = 0; k <= 5; k++) d.little.skills[`bond5:${k}`] = { attempts: 3, streak: 3 };
          st.put(d);
        };
        tx.oncomplete = () => { open.result.close(); res(); };
      };
    });
  });
  await page.reload({ waitUntil: 'networkidle' }); // resumes the same profile
  await page.waitForSelector('.little-tile');
  await page.tap('[data-game="bond"]');
  await page.waitForSelector('.little-card');
  // bonds of 5 all known → whole becomes 10, back to pictures for the new whole
  await expect(page.locator('.little-stage .li.empty').first()).toBeVisible();
  expect(await page.$eval('.little-stage .little-items', (el) => el.children.length)).toBe(10);
});

test('e2e: piggy bank chip shows and speaks the balance', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Piggy'));
  doc.id = 'piggy-kid';
  doc.subjects = { ...doc.subjects, little: true };
  doc.pawBucks = { txns: [{ id: 's1', at: Date.now(), cents: 10, denom: 'dime', count: 1, reason: 'sitting' }] };
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.little-tile');
  await expect(page.locator('[data-piggy]')).toContainText('$0.10');
});
