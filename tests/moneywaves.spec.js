// Money Math (Phase 7 R5) — the frozen skill identities, the untimed
// Leitner rule, and the v19 profile field they are stored in.
//
// Nothing here needs a browser: it is the data contract that a child's
// stored progress hangs off, so it is checked as pure logic.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { MONEY_WAVES, MONEY_SKILL_IDS, MONEY_DENOMS, moneyWaveOf } from '../src/engine/moneywaves.js';
import { COIN_SCALE } from '../src/art/coins.js';
import { DENOMS } from '../src/engine/money.js';
import { recordMoneyAnswer, getMoneyStat, moneyMasteredCount, MASTERY_BOX, SLOW_CAP, FAST_MS } from '../src/engine/leitner.js';
import { newProfile, migrateProfile, mergeProfiles, validProfileDoc, SCHEMA_VERSION } from '../src/data/schema.js';
import MONEY_LOCK from './fixtures-money-skills.json' with { type: 'json' };
import PRICE_LOCK from './fixtures-store-prices.json' with { type: 'json' };

// PRODUCT RULE: a money skill id is the key of a Leitner box on a real
// child's device. Appending a skill is free (it starts at box 0); changing
// or REORDERING one silently re-points earned boxes at other questions.
// The fixture freezes the prefix of every wave, which is exactly what
// makes "add freely, edit never" mechanical (same shape as the store
// price lock in economy-invariants.spec.js).
test('every frozen money skill keeps its id and its place', () => {
  for (const wave of MONEY_WAVES) {
    const locked = MONEY_LOCK[wave.key];
    expect(locked, `wave ${wave.id} (${wave.key}) has no locked id list`).toBeDefined();
    expect(
      wave.skills.length,
      `wave ${wave.key} lost skills — ${locked.length} were frozen, ${wave.skills.length} remain. ` +
        `A removed id orphans the box a child already earned on it.`
    ).toBeGreaterThanOrEqual(locked.length);
    expect(
      wave.skills.slice(0, locked.length),
      `wave ${wave.key} changed a frozen id or its order. New skills go at the END of the list ` +
        `and into tests/fixtures-money-skills.json in the same commit.`
    ).toEqual(locked);
  }
  // No wave key disappears, and no locked wave is silently dropped.
  expect(Object.keys(MONEY_LOCK).every((k) => MONEY_WAVES.some((w) => w.key === k))).toBe(true);
});

test('the track is 134 skills with no id used twice', () => {
  expect(MONEY_SKILL_IDS.length).toBe(134);
  expect(new Set(MONEY_SKILL_IDS).size).toBe(134);
  expect(MONEY_WAVES.map((w) => w.skills.length)).toEqual([5, 27, 30, 12, 20, 24, 16]);
  // Ids are prefixed by wave, so a stored id always says where it came from.
  const prefix = (id) => id.slice(0, id.indexOf(':'));
  for (const wave of MONEY_WAVES) {
    for (const id of wave.skills) expect(prefix(id), id).toBe(wave.key);
  }
});

test('money knows the same coins the ledger does', () => {
  const ledger = new Set(DENOMS.map((d) => d.id));
  for (const d of MONEY_DENOMS) expect(ledger.has(d), `${d} is not a Paw Bucks denomination`).toBe(true);
  expect(MONEY_DENOMS.length).toBe(DENOMS.length);
});

// A handful the game shows must be a handful the curation rule allows:
// 2-4 coins, at least two kinds (one kind is wave 2), at most three of any
// one (four of a kind is a swap, not a count).
test('mixed collections obey the curation rule', () => {
  for (const id of MONEY_WAVES[2].skills) {
    const counts = id.slice(4).split('-').map(Number);
    expect(counts.length, id).toBe(4);
    const total = counts.reduce((s, n) => s + n, 0);
    expect(total, `${id} has ${total} coins`).toBeGreaterThanOrEqual(2);
    expect(total, `${id} has ${total} coins`).toBeLessThanOrEqual(4);
    expect(counts.filter((n) => n > 0).length, `${id} uses one denomination`).toBeGreaterThanOrEqual(2);
    expect(Math.max(...counts), `${id} has more than three of one coin`).toBeLessThanOrEqual(3);
  }
});

// The shop in "count the change" is the shop the child can actually walk
// into: invented prices would teach a store that does not exist.
test('change questions use real store prices, and give change under a Paw Buck', () => {
  const real = new Set(Object.values(PRICE_LOCK));
  for (const id of MONEY_WAVES[5].skills) {
    const [price, paid] = id.slice(4).split('-').map(Number);
    expect(real.has(price), `${id}: ${price}c is not a price in the pet store`).toBe(true);
    expect(paid, `${id}: paying less than the price is not change`).toBeGreaterThan(price);
    // Change comes back in coins; the last coin handed over is at most a
    // Paw Buck, so the change can never exceed one (see canOverpay).
    expect(paid - price, `${id} gives more than a Paw Buck back`).toBeLessThanOrEqual(100);
    expect((paid - price) % 5, `${id} gives change that no coin can make`).toBe(0);
  }
});

test('moneyWaveOf places a known id and shrugs at an unknown one', () => {
  expect(moneyWaveOf('coin:dime')).toBe(0);
  expect(moneyWaveOf('not:1000')).toBe(6);
  // An id from a newer build can arrive by sync; it must not throw.
  expect(moneyWaveOf('future:thing')).toBe(-1);
});

// The CSS discs and the SVG coin art show up on the same screens, so they
// have to agree about size. This is R5's central teaching point and it has
// already been wrong once: `.coin.penny` had no size at all, inherited the
// 34px base, and drew LARGER than the nickel — the exact inversion of the
// thing the track exists to teach.
test('the CSS coins are the real diameters, scaled from the same source', () => {
  const css = readFileSync('src/styles/main.css', 'utf8');
  const px = (denom) => {
    const rule = css.match(new RegExp(`\\.coin\\.${denom}\\s*\\{[^}]*\\}`));
    expect(rule, `.coin.${denom} has no rule`).not.toBeNull();
    const w = rule[0].match(/width:\s*(\d+)px/);
    expect(w, `.coin.${denom} has no explicit width — it would inherit the base .coin size`).not.toBeNull();
    expect(rule[0]).toMatch(new RegExp(`height:\\s*${w[1]}px`)); // a coin is round
    return Number(w[1]);
  };
  const quarter = px('quarter');
  for (const denom of ['dime', 'penny', 'nickel', 'quarter']) {
    expect(px(denom), `.coin.${denom} drifted from COIN_SCALE in src/art/coins.js`).toBe(
      Math.round(COIN_SCALE[denom] * quarter)
    );
  }
  // The ordering itself, stated plainly: the dime is the smallest coin.
  expect(px('dime')).toBeLessThan(px('penny'));
  expect(px('penny')).toBeLessThan(px('nickel'));
  expect(px('nickel')).toBeLessThan(px('quarter'));
});

// --- the untimed rule -------------------------------------------------
// Money answers are multi-step by design. A correct-but-slow answer stops
// at SLOW_CAP, which is BELOW mastery — so with any finite speed bar a
// child could answer every coin question perfectly and never master one.
test('a slow but correct money answer still climbs to mastery', () => {
  expect(SLOW_CAP).toBeLessThan(MASTERY_BOX); // the reason untimed is required
  const p = newProfile('Slowpoke');
  const slow = FAST_MS * 10;
  for (let i = 0; i < MASTERY_BOX; i++) recordMoneyAnswer(p, 'mix:1-1-1-1', true, slow);
  expect(getMoneyStat(p, 'mix:1-1-1-1').box).toBe(MASTERY_BOX);
  expect(moneyMasteredCount(p)).toBe(1);
  // ...and a wrong answer still costs a box.
  const res = recordMoneyAnswer(p, 'mix:1-1-1-1', false, slow);
  expect(res.correct).toBe(false);
  expect(getMoneyStat(p, 'mix:1-1-1-1').box).toBe(MASTERY_BOX - 1);
});

test('money answers never feed the speed baseline or the ⚡ ladder', () => {
  const p = newProfile('Timer');
  const before = { ...p.speed };
  let res;
  for (let i = 0; i < 10; i++) res = recordMoneyAnswer(p, 'chg:75-100', true, 45000);
  expect(p.speed).toEqual(before);
  // An untimed track cannot report a "fast" answer — that flag becomes
  // stats.fastAnswers and the Quick Paws badge, and an infinite bar would
  // hand one out for every correct answer.
  expect(res.fast).toBe(false);
});

// --- schema v19 -------------------------------------------------------
test('a v18 profile migrates to v19 without losing anything', () => {
  const v18 = {
    id: 'kid-18',
    schemaVersion: 18,
    name: 'Rosa',
    facts: { '3x4': { attempts: 9, correct: 8, avgMs: 2200, box: 4, lastSeen: 111 } },
    addition: { '4+8': { attempts: 3, correct: 3, avgMs: 1800, box: 2, lastSeen: 222 } },
    unlocks: [{ dogId: 'starter', table: null, at: 1 }],
    pawBucks: { txns: [{ id: 'mastery-mul-3x4', at: 5, cents: 5, denom: 'nickel', count: 1, reason: 'mastery' }], epoch: 2 },
    somethingNobodyHasWrittenYet: { keep: 'me' },
  };
  const out = migrateProfile(structuredClone(v18));
  expect(out.schemaVersion).toBe(SCHEMA_VERSION);
  expect(SCHEMA_VERSION).toBe(19);
  expect(out.facts).toEqual(v18.facts);
  expect(out.addition).toEqual(v18.addition);
  expect(out.unlocks).toEqual(v18.unlocks);
  expect(out.pawBucks.txns).toEqual(v18.pawBucks.txns);
  expect(out.pawBucks.epoch).toBe(2);
  expect(out.somethingNobodyHasWrittenYet).toEqual({ keep: 'me' });
  // ...and money arrives, switched on and empty.
  expect(out.money).toEqual({});
  expect(out.subjects.money).toBe('auto');
  expect(validProfileDoc(out)).toBe(true);
});

test('a v19 doc with money progress survives normalization and validation', () => {
  const doc = newProfile('Nia');
  recordMoneyAnswer(doc, 'coin:dime', true, 9000);
  const out = migrateProfile(structuredClone(doc));
  expect(out.money['coin:dime'].attempts).toBe(1);
  expect(validProfileDoc(out)).toBe(true);
  // A mangled money field is repaired, never allowed to poison a merge.
  const broken = migrateProfile({ ...structuredClone(doc), money: 'nonsense' });
  expect(broken.money).toEqual({});
});

test('merging keeps money progress from BOTH devices', () => {
  const tablet = newProfile('Sam');
  const phone = structuredClone(tablet);
  recordMoneyAnswer(tablet, 'coin:dime', true, 3000);
  recordMoneyAnswer(tablet, 'coin:dime', true, 3000);
  tablet.updatedAt = 2000;
  recordMoneyAnswer(phone, 'make:25', true, 3000);
  phone.updatedAt = 1000;
  for (const merged of [mergeProfiles(tablet, phone), mergeProfiles(phone, tablet)]) {
    expect(merged.money['coin:dime'].attempts).toBe(2);
    expect(merged.money['make:25'].attempts).toBe(1);
  }
  // Richer-wins per skill: the device that saw more tries carries the box.
  const a = newProfile('A');
  const b = structuredClone(a);
  recordMoneyAnswer(a, 'eq:5penny-nickel', true, 3000);
  for (let i = 0; i < 3; i++) recordMoneyAnswer(b, 'eq:5penny-nickel', true, 3000);
  expect(mergeProfiles(a, b).money['eq:5penny-nickel'].box).toBe(3);
  expect(mergeProfiles(b, a).money['eq:5penny-nickel'].box).toBe(3);
});
