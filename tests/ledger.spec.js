// v1.40.0 economy: convergent derived replay over a commutative,
// associative, idempotent event union. No reversal events, no child
// debt, nonnegative balance AND denomination counts by construction.
import { test, expect } from '@playwright/test';
import { mergeTxns, replayLedger, groupOf, fingerprintOf } from '../src/engine/ledger.js';
import { newProfile, mergeProfiles } from '../src/data/schema.js';
import { balanceCents, coinCounts, swapCoins, SWAPS } from '../src/engine/money.js';
import { buyGear, isOwned } from '../src/engine/gearshop.js';

const earn = (id, cents, denom, at) => ({ id, at, cents, denom, count: 1, reason: 'sitting' });
const fund = (p, n, cents = 100, denom = 'buck') => {
  for (let i = 0; i < n; i++) p.pawBucks.txns.push(earn(`e${i}`, cents, denom, 1000 + i));
};

test('union: commutative, associative, idempotent; duplicate ids coalesce at=min', () => {
  const a = [earn('x', 10, 'dime', 500), earn('y', 5, 'nickel', 600)];
  const b = [earn('x', 10, 'dime', 300), earn('z', 100, 'buck', 700)]; // same x, earlier at
  const ab = mergeTxns(a, b);
  const ba = mergeTxns(b, a);
  expect(JSON.stringify(ab)).toBe(JSON.stringify(ba)); // commutative
  expect(JSON.stringify(mergeTxns(ab, ab))).toBe(JSON.stringify(ab)); // idempotent
  const c = [earn('w', 25, 'quarter', 100)];
  const abc1 = mergeTxns(mergeTxns(a, b), c);
  const abc2 = mergeTxns(a, mergeTxns(b, c));
  expect(JSON.stringify(abc1)).toBe(JSON.stringify(abc2)); // associative
  expect(ab.find((t) => t.id === 'x').at).toBe(300); // min observed at
  expect(ab.filter((t) => t.id === 'x')).toHaveLength(1); // coalesced
});

test('union: conflicting payloads for one id are BOTH kept and replay quarantines the id', () => {
  const a = [earn('dup', 10, 'dime', 500)];
  const b = [earn('dup', 25, 'quarter', 500)]; // same id, different immutable payload
  const merged = mergeTxns(a, b);
  expect(merged.filter((t) => t.id === 'dup')).toHaveLength(2); // nothing discarded
  // repeated merges cannot multiply variants
  expect(mergeTxns(merged, merged).filter((t) => t.id === 'dup')).toHaveLength(2);
  const r = replayLedger(merged);
  expect(r.quarantined.has('dup')).toBe(true);
  expect(r.balance).toBe(0); // neither variant counted
});

test('two offline devices spend the same 100¢: both merge orders agree, no debt, counts nonnegative', () => {
  const A = newProfile('Kid');
  A.id = 'kid';
  fund(A, 1); // one shared buck
  const B = structuredClone(A);
  // A buys the party hat (120¢? too dear) — use two <=100¢ items
  A.pawBucks.txns.push({ id: 'buy-flower', group: 'buy-flower', at: 2000, cents: -100, count: 1, reason: 'buy', item: 'flower', for: null });
  B.pawBucks.txns.push({ id: 'buy-mouse', group: 'buy-mouse', at: 2001, cents: -10, count: 1, reason: 'buy', item: 'mouse', for: null });
  const m1 = mergeProfiles(A, B);
  const m2 = mergeProfiles(B, A);
  expect(JSON.stringify(m1.pawBucks.txns)).toBe(JSON.stringify(m2.pawBucks.txns));
  const r = replayLedger(m1.pawBucks.txns);
  // flower (at 2000) replays first: accepted; mouse (at 2001) would
  // overdraw → derived-rejected. Identical on both devices.
  expect(r.accepted.has('buy-flower')).toBe(true);
  expect(r.rejected.has('buy-mouse')).toBe(true);
  expect(r.balance).toBe(0);
  for (const c of Object.values(r.counts)) expect(c).toBeGreaterThanOrEqual(0);
  expect(balanceCents(m1)).toBe(0); // never negative, never clamped-fake
});

test('late-arriving EARLIER earnings flip a rejected purchase to accepted everywhere', () => {
  const p = newProfile('Late');
  fund(p, 1);
  p.pawBucks.txns.push({ id: 'buy-flower', group: 'buy-flower', at: 2000, cents: -100, count: 1, reason: 'buy', item: 'flower', for: null });
  p.pawBucks.txns.push({ id: 'buy-mouse', group: 'buy-mouse', at: 2001, cents: -10, count: 1, reason: 'buy', item: 'mouse', for: null });
  expect(replayLedger(p.pawBucks.txns).rejected.has('buy-mouse')).toBe(true);
  // an offline device's earning from BEFORE the purchases syncs in late
  const withLate = mergeTxns(p.pawBucks.txns, [earn('late-dime', 10, 'dime', 1500)]);
  const r = replayLedger(withLate);
  expect(r.accepted.has('buy-mouse')).toBe(true); // flipped — deterministically
  expect(r.balance).toBe(0);
});

test('legacy single-device ledgers replay to the same balances as before (regression)', () => {
  const p = newProfile('Legacy');
  // realistic legacy shapes: earns without group, a legacy swap pair
  // (shared prefix, no group field), a legacy buy + companions
  fund(p, 3, 100, 'buck');
  p.pawBucks.txns.push(
    { id: 'swap-abc123-a', at: 4000, cents: -100, denom: 'buck', count: -1, reason: 'swap' },
    { id: 'swap-abc123-b', at: 4000, cents: 100, denom: 'quarter', count: 4, reason: 'swap' },
    { id: 'buy-mouse', at: 5000, cents: -10, count: 1, reason: 'buy', item: 'mouse', for: null },
    { id: 'buy-mouse-c-quarter', at: 5000, cents: 0, denom: 'quarter', count: -1, reason: 'spend' }
  );
  const oldBalance = p.pawBucks.txns.reduce((s, t) => s + (t.cents ?? 0), 0);
  expect(balanceCents(p)).toBe(oldBalance); // 290
  const counts = coinCounts(p);
  expect(counts.buck).toBe(2);
  expect(counts.quarter).toBe(3);
  expect(groupOf({ id: 'swap-abc123-a' })).toBe('swap-abc123'); // legacy pair grouped
  expect(groupOf({ id: 'buy-mouse-c-quarter' })).toBe('buy-mouse');
});

test('swaps replay atomically as groups; ownership follows accepted buys; retry after rejection converges', () => {
  const p = newProfile('Shop');
  fund(p, 1);
  expect(swapCoins(p, SWAPS.find((r) => r.give.denom === 'buck'))).toBe(true); // buck → smaller coins
  const r1 = replayLedger(p.pawBucks.txns);
  expect(r1.balance).toBe(100); // net zero swap
  // craft a rejected buy (double-spend shape), then retry when funded
  p.pawBucks.txns.push({ id: 'buy-bell', group: 'buy-bell', at: 1, cents: -10, count: 1, reason: 'buy', item: 'bell', for: null });
  // at=1 predates the earnings (at>=1000) → replays first → rejected
  expect(replayLedger(p.pawBucks.txns).rejected.has('buy-bell')).toBe(true);
  expect(isOwned(p, 'bell')).toBe(false); // back on the shelf
  const txn = buyGear(p, 'bell'); // retry with real coins available NOW
  expect(txn).toBeTruthy();
  expect(txn.id).toBe('buy-bell~2'); // deterministic retry id
  expect(isOwned(p, 'bell')).toBe(true);
  // a device that merges both attempts agrees
  const merged = mergeProfiles(p, structuredClone(p));
  expect(isOwned(merged, 'bell')).toBe(true);
  for (const c of Object.values(coinCounts(merged))) expect(c).toBeGreaterThanOrEqual(0);
});

test('fingerprints ignore at and group (a legacy event equals its upgraded twin)', () => {
  const legacy = { id: 'swap-x-a', at: 100, cents: -100, denom: 'buck', count: -1, reason: 'swap' };
  const upgraded = { ...legacy, at: 999, group: 'swap-x' };
  expect(fingerprintOf(legacy)).toBe(fingerprintOf(upgraded));
  const merged = mergeTxns([legacy], [upgraded]);
  expect(merged).toHaveLength(1);
  expect(merged[0].at).toBe(100);
});

test('back-to-back operations keep causal order (same-millisecond swaps)', () => {
  const p = newProfile('Causal');
  p.pawBucks.txns.push({ id: 'seed', at: 5, cents: 100, denom: 'buck', count: 1, reason: 'sitting' });
  // both swaps ask for Date.now() at the same instant — the second spends
  // what the first produced, so it must replay second
  const now = 1000;
  expect(swapCoins(p, SWAPS.find((r) => r.give.denom === 'buck' && r.get.denom === 'dime'), now)).toBe(true);
  expect(swapCoins(p, SWAPS.find((r) => r.give.denom === 'dime' && r.get.denom === 'buck'), now)).toBe(true);
  const counts = coinCounts(p);
  expect(counts.buck).toBe(1); // round trip completed — neither swap rejected
  expect(counts.dime).toBe(0);
  expect(balanceCents(p)).toBe(100);
});
