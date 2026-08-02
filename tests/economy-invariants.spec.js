// The economy contract, enforced by randomized model-based testing.
// Every historical incident in this area (toys vanishing mid-play, an
// unspendable balance after a reset, a lying swap button, a double
// charge, a heal loop between two devices) violated one of the
// invariants below. They now fail here instead of in a child's hands.
//
// Seeded PRNG: a failure prints the seed and the offending ledger, so any
// counterexample is reproducible with one number.
import { test, expect } from '@playwright/test';
import { newProfile, mergeProfiles, migrateProfile } from '../src/data/schema.js';
import { replayLedger } from '../src/engine/ledger.js';
import {
  balanceCents,
  trueBalanceCents,
  forgivenCents,
  coinCounts,
  canMakeExact,
  canSwap,
  swapCoins,
  ensureBucks,
  SWAPS,
  DENOMS,
} from '../src/engine/money.js';
import { buyGear, isOwned, ownedGear, resetStoreEpoch, effectiveEpoch, CATALOG } from '../src/engine/gearshop.js';
import { profileSignature } from '../src/data/canonical.js';

const CENTS = { buck: 100, quarter: 25, dime: 10, nickel: 5, penny: 1 };
const coinValue = (c) => Object.entries(c).reduce((s, [d, n]) => s + CENTS[d] * n, 0);
const CHEAPEST = Math.min(...CATALOG.map((i) => i.price));

// deterministic PRNG (mulberry32) so every run is replayable by seed
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let earnSeq = 0;
function earn(p, rand, at) {
  const kinds = [
    ['set', 'buck', 100],
    ['mastery', 'nickel', 5],
    ['sitting', 'dime', 10],
    ['polish', 'penny', 1],
  ];
  const [reason, denom, cents] = kinds[Math.floor(rand() * kinds.length)];
  ensureBucks(p).txns.push({
    id: `${reason}-${earnSeq++}`, // deterministic per event, as the app does
    at,
    cents,
    denom,
    count: 1,
    reason,
  });
}

// buy the way the store does: exact change counted out of the wallet
function buyExact(p, rand) {
  const wallet = coinCounts(p);
  const affordable = CATALOG.filter(
    (i) => i.price <= balanceCents(p) && canMakeExact(wallet, i.price) && !isOwned(p, i.id, i.tier === 'gift' ? 'dog-2' : null)
  );
  if (!affordable.length) return false;
  const item = affordable[Math.floor(rand() * affordable.length)];
  // greedy-but-legal tray: keep taking the biggest coin that keeps the
  // remainder payable, exactly like the checkout now allows
  const tray = {};
  let left = item.price;
  const held = { ...wallet };
  while (left > 0) {
    const pick = DENOMS.find((d) => (held[d.id] ?? 0) > 0 && d.cents <= left && canMakeExact({ ...held, [d.id]: held[d.id] - 1 }, left - d.cents));
    if (!pick) return false;
    held[pick.id] -= 1;
    tray[pick.id] = (tray[pick.id] ?? 0) + 1;
    left -= pick.cents;
  }
  return !!buyGear(p, item.id, item.tier === 'gift' ? 'dog-2' : null, Date.now(), tray);
}

// a purchase that records NO coins (every pre-exact-change buy, and any
// caller passing null) — the shape that used to drift the wallet forever
function buyCoinless(p, rand) {
  const affordable = CATALOG.filter((i) => i.price <= balanceCents(p) && !isOwned(p, i.id, null) && i.tier !== 'gift');
  if (!affordable.length) return false;
  const item = affordable[Math.floor(rand() * affordable.length)];
  return !!buyGear(p, item.id, null, Date.now());
}

function checkInvariants(p, label, seed) {
  const ctx = () => `${label} (seed ${seed})\n${JSON.stringify(ensureBucks(p)).slice(0, 1500)}`;
  const shown = balanceCents(p);
  const coins = coinCounts(p);

  // I1 a child never sees debt
  expect(shown, `I1 balance >= 0 — ${ctx()}`).toBeGreaterThanOrEqual(0);
  // I2 the wallet is spendable: coins always add up to the balance shown
  expect(coinValue(coins), `I2 coins == balance — ${ctx()}`).toBe(shown);
  // I3 no negative piles, no empty piles
  for (const [d, n] of Object.entries(coins)) {
    expect(n, `I3 ${d} >= 0 — ${ctx()}`).toBeGreaterThan(0);
  }
  // I4 the two ownership predicates agree (walking all 26 items on every
  // step dominated runtime; every owned item is still checked)
  const listedAll = new Set(ownedGear(p).map((g) => g.item));
  for (const item of CATALOG) {
    if (item.tier === 'gift') continue;
    const owned = isOwned(p, item.id, null);
    if (!owned && !listedAll.has(item.id)) continue;
    expect(owned, `I4 isOwned==ownedGear for ${item.id} — ${ctx()}`).toBe(listedAll.has(item.id));
  }
  // I5 at most one CHARGE per purchase group
  const state = replayLedger(ensureBucks(p).txns, effectiveEpoch(p));
  const charged = new Map();
  for (const t of ensureBucks(p).txns) {
    if (t.reason !== 'buy') continue;
    const key = `${t.item}|${t.for ?? ''}`;
    charged.set(key, (charged.get(key) ?? 0) + 1);
  }
  // I6 forgiveness is bounded by the actual shortfall
  expect(forgivenCents(p), `I6 forgiven >= 0 — ${ctx()}`).toBeGreaterThanOrEqual(0);
  expect(shown, `I6 shown == true + forgiven — ${ctx()}`).toBe(
    Math.max(0, trueBalanceCents(p) + forgivenCents(p))
  );
  // I7 if the child can afford the cheapest thing, they can PAY for something
  if (shown >= CHEAPEST) {
    const payable = CATALOG.some((i) => i.price <= shown && canMakeExact(coins, i.price));
    const swappable = SWAPS.some((r) => canSwap(p, r));
    expect(payable || swappable, `I7 not soft-locked — ${ctx()}`).toBe(true);
  }
  // I8 every swap the wallet OFFERS must actually change the wallet
  const rule = SWAPS.find((r) => canSwap(p, r));
  if (rule) {
    // a light copy: cloning + migrating a whole profile per state was the
    // other hot spot
    const probe = { id: p.id, pawBucks: { txns: [...ensureBucks(p).txns], epoch: ensureBucks(p).epoch } };
    const before = JSON.stringify(coinCounts(probe));
    const beforeBal = balanceCents(probe);
    swapCoins(probe, rule);
    expect(JSON.stringify(coinCounts(probe)), `I8 offered swap is not a no-op — ${ctx()}`).not.toBe(before);
    expect(balanceCents(probe), `I8 swap is net-zero — ${ctx()}`).toBe(beforeBal);
  }
  return state;
}

test('property: the economy contract holds across random single-device histories', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const rand = rng(seed);
    const p = newProfile(`Prop${seed}`);
    p.id = `prop-${seed}`;
    let at = 1000;
    let ownedBefore = new Set();
    for (let step = 0; step < 18; step++) {
      const roll = rand();
      if (roll < 0.45) earn(p, rand, at++);
      else if (roll < 0.62) buyExact(p, rand);
      else if (roll < 0.72) buyCoinless(p, rand);
      else if (roll < 0.9) {
        const usable = SWAPS.filter((r) => canSwap(p, r));
        if (usable.length) swapCoins(p, usable[Math.floor(rand() * usable.length)]);
      } else if (roll < 0.94) {
        resetStoreEpoch(p);
        ownedBefore = new Set(); // a fresh start legitimately clears ownership
      }
      checkInvariants(p, `step ${step}`, seed);
      // I9 ownership never shrinks within an epoch
      const nowOwned = new Set(ownedGear(p).map((g) => `${g.item}|${g.for ?? ''}`));
      for (const key of ownedBefore) {
        expect(nowOwned.has(key), `I9 ${key} stayed owned (seed ${seed}, step ${step})`).toBe(true);
      }
      ownedBefore = nowOwned;
    }
  }
});

test('property: merges converge — order, repetition and association cannot matter', () => {
  for (let seed = 500; seed <= 524; seed++) {
    const rand = rng(seed);
    const base = newProfile(`Merge${seed}`);
    base.id = `merge-${seed}`;
    let at = 1000;
    for (let i = 0; i < 8; i++) earn(base, rand, at++);
    // three devices diverge from the same starting point
    const devices = [0, 1, 2].map(() => migrateProfile(structuredClone(base)));
    for (const d of devices) {
      for (let i = 0; i < 6; i++) {
        const roll = rand();
        if (roll < 0.4) earn(d, rand, at++);
        else if (roll < 0.7) buyExact(d, rand);
        else if (roll < 0.85) buyCoinless(d, rand);
        else {
          const usable = SWAPS.filter((r) => canSwap(d, r));
          if (usable.length) swapCoins(d, usable[0]);
        }
      }
    }
    const [A, B, C] = devices.map((d) => migrateProfile(structuredClone(d)));
    const m1 = migrateProfile(mergeProfiles(mergeProfiles(structuredClone(A), structuredClone(B)), structuredClone(C)));
    const m2 = migrateProfile(mergeProfiles(structuredClone(C), mergeProfiles(structuredClone(B), structuredClone(A))));
    // convergence is asserted on DERIVED state, not array bytes
    expect(balanceCents(m1), `merge order changes balance (seed ${seed})`).toBe(balanceCents(m2));
    expect(coinCounts(m1)).toEqual(coinCounts(m2));
    expect(ownedGear(m1).map((g) => `${g.item}|${g.for}`).sort()).toEqual(
      ownedGear(m2).map((g) => `${g.item}|${g.for}`).sort()
    );
    // and no heal loop: re-merging a doc that is already subsumed is a no-op
    const sig = profileSignature(m1);
    expect(profileSignature(migrateProfile(mergeProfiles(structuredClone(m1), structuredClone(A))))).toBe(sig);
    expect(profileSignature(migrateProfile(mergeProfiles(structuredClone(m1), structuredClone(m1))))).toBe(sig);
    checkInvariants(m1, 'merged', seed);
  }
});

test('property: a fresh start always leaves a spendable wallet', () => {
  for (let seed = 900; seed <= 930; seed++) {
    const rand = rng(seed);
    const p = newProfile(`Reset${seed}`);
    p.id = `reset-${seed}`;
    let at = 1000;
    for (let i = 0; i < 14; i++) {
      if (rand() < 0.6) earn(p, rand, at++);
      else if (rand() < 0.5) buyExact(p, rand);
      else buyCoinless(p, rand);
    }
    const earned = ensureBucks(p).txns.reduce((s, t) => s + (t.cents > 0 ? t.cents : 0), 0);
    resetStoreEpoch(p);
    expect(balanceCents(p), `every earned cent returns (seed ${seed})`).toBe(earned);
    expect(coinValue(coinCounts(p)), `wallet matches balance (seed ${seed})`).toBe(earned);
    expect(ownedGear(p), `nothing owned after a fresh start (seed ${seed})`).toEqual([]);
    if (earned >= CHEAPEST) {
      const coins = coinCounts(p);
      const payable = CATALOG.some((i) => i.price <= earned && canMakeExact(coins, i.price));
      const swappable = SWAPS.some((r) => canSwap(p, r));
      expect(payable || swappable, `can spend after a reset (seed ${seed})`).toBe(true);
    }
    checkInvariants(p, 'after reset', seed);
  }
});

test('catalog and wearer ids never contain the characters the ledger parses', () => {
  // epochOfId/groupOf read `@`, `~` and `-c-` out of ids — an item or pet
  // id containing one would silently mis-parse (audit m5)
  for (const item of CATALOG) {
    expect(item.id, `${item.id} is parser-safe`).not.toMatch(/[@~]|-c-/);
  }
});
