// v1.18.0: the automated readiness trail — tri-state subjects, auto-reveal
// with history grandfathering, the one-way reveal ratchet, hero rotation.
import { test, expect } from '@playwright/test';
import { newProfile, migrateProfile, mergeProfiles, SCHEMA_VERSION } from '../src/data/schema.js';
import { bridgeVisible, tablesVisible, addingReady, tablesReady, ratchetReveals, isRevealed } from '../src/engine/readiness.js';
import { littleSuggestNext } from '../src/screens/little.js';
import { waveFacts } from '../src/engine/waves.js';
import { normAddKey } from '../src/engine/leitner.js';
import { seedProfile, selectProfile, norm, stat, uniqueName } from './helpers.mjs';

const skilled = (game, lo, hi, streak = 3) => {
  const s = {};
  for (let n = lo; n <= hi; n++) s[`${game}:${n}`] = { attempts: streak, streak };
  return s;
};
const masterWave = (p, w, map = 'addition') => {
  for (const [a, b] of waveFacts(w)) p[map][normAddKey(a, b)] = stat(3);
};

test('migration v15→v16: booleans become auto; ratchet added; merge unions reveals', () => {
  const old = { ...newProfile('Old'), schemaVersion: 15 };
  old.subjects = { ...old.subjects, bridge: false, tables: true };
  delete old.little.revealed;
  const doc = migrateProfile(old);
  expect(doc.schemaVersion).toBe(SCHEMA_VERSION);
  expect(doc.subjects.bridge).toBe('auto');
  expect(doc.subjects.tables).toBe('auto');
  expect(doc.little.revealed).toEqual([]);

  const a = newProfile('R');
  const b = { ...newProfile('R'), id: a.id };
  a.little.revealed = ['tile:count', 'tile:look'];
  b.little.revealed = ['tile:count', 'track:adding'];
  const m = mergeProfiles(a, b);
  expect(m.little.revealed.sort()).toEqual(['tile:count', 'tile:look', 'track:adding']);
});

test('grandfathering: any history keeps a track visible on auto; parent overrides win', () => {
  const kid = newProfile('G');
  expect(tablesVisible(kid)).toBe(false); // fresh trail kid: no tables yet
  kid.facts[norm(7, 7)] = stat(1); // one touched fact = started
  expect(tablesVisible(kid)).toBe(true);
  kid.subjects.tables = false;
  expect(tablesVisible(kid)).toBe(false); // hide wins
  kid.subjects.tables = true;
  expect(tablesVisible(kid)).toBe(true);

  const little = newProfile('L');
  expect(bridgeVisible(little)).toBe(false);
  little.little.skills = { ...skilled('count', 1, 10), ...skilled('next', 4, 10), ...skilled('type', 1, 10) };
  expect(addingReady(little)).toBe(true);
  expect(bridgeVisible(little)).toBe(true); // readiness reveals without a parent
});

test('tables readiness: adding w1–w5 + taking away w1–w2', () => {
  const p = newProfile('T');
  for (let w = 0; w <= 4; w++) masterWave(p, w);
  expect(tablesReady(p)).toBe(false);
  masterWave(p, 0, 'subtraction');
  masterWave(p, 1, 'subtraction');
  expect(tablesReady(p)).toBe(true);
});

test('the ratchet never un-reveals', () => {
  const p = newProfile('Ratchet');
  const fresh = ratchetReveals(p, ['tile:look']);
  expect(fresh).toEqual(['tile:look']);
  expect(ratchetReveals(p, ['tile:look'])).toEqual([]); // once only
  expect(isRevealed(p, 'tile:look')).toBe(true);
});

test('hero rotation: frontier games take turns as rounds accumulate', () => {
  const p = newProfile('Rota');
  const tiles = [{ game: 'count' }, { game: 'find' }, { game: 'more' }];
  p.play = { starter: { walk: 0, feed: 0, fetch: 0 } };
  const first = littleSuggestNext(p, tiles).game;
  p.play.starter.walk = 1; // one round played
  const second = littleSuggestNext(p, tiles).game;
  expect(second).not.toBe(first);
  p.play.starter.walk = 3;
  expect(littleSuggestNext(p, tiles).game).toBe(first); // wraps around
});

test('e2e: tanked streaks shrink numbers, never the shelf', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const doc = newProfile(uniqueName('Keeper'));
  doc.id = 'keeper-kid';
  doc.subjects = { ...doc.subjects, little: true };
  doc.little = { xp: 10, skills: skilled('count', 1, 5), revealed: [] };
  await seedProfile(page, doc);
  await selectProfile(page, doc.name);
  await page.waitForSelector('.little-tile');
  await expect(page.locator('[data-game="look"]')).toBeVisible(); // earned + ratcheted now

  // sabotage: wipe the streaks under her (worse than any bored tapping)
  await page.evaluate(async () => {
    await new Promise((res) => {
      const open = indexedDB.open('compounded');
      open.onsuccess = () => {
        const tx = open.result.transaction(['profiles'], 'readwrite');
        const st = tx.objectStore('profiles');
        st.get('keeper-kid').onsuccess = function () {
          const d = this.result;
          for (const k of Object.keys(d.little.skills)) d.little.skills[k].streak = 0;
          st.put(d);
        };
        tx.oncomplete = () => { open.result.close(); res(); };
      };
    });
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('.little-tile');
  await expect(page.locator('[data-game="look"]')).toBeVisible(); // still hers
});
