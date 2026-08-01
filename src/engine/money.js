// Paw Bucks 🐾💵 — the in-game currency. Structured like US money (paw
// pennies/nickels/dimes/quarters and Paw Buck bills, values in integer paw
// cents) so future currency-math games get real denominations to count —
// but it is FICTITIOUS FOREVER: no real money exists anywhere in this game.
//
// Sync-safe by design: balances are an append-only transaction ledger,
// merged by union — so spending on one device can never be resurrected by
// a counter-max merge from another.

import { isTableMastered, isDivisionTableMastered } from './leitner.js';
import { replayLedger } from './ledger.js';
import { waveIndexOf, isWaveMastered, isSubWaveMastered, WAVES } from './waves.js';

export const DENOMS = [
  { id: 'buck', cents: 100, label: 'Paw Buck', emoji: '💵' },
  { id: 'quarter', cents: 25, label: 'Paw Quarter', emoji: '🪙' },
  { id: 'dime', cents: 10, label: 'Paw Dime', emoji: '🪙' },
  { id: 'nickel', cents: 5, label: 'Paw Nickel', emoji: '🪙' },
  { id: 'penny', cents: 1, label: 'Paw Penny', emoji: '🪙' },
];

// Deliberately slow faucet (easier to turn up than down): a paw dime per
// completed pet-sitting visit, first two visits per day.
export const SIT_PAY = { denom: 'dime', cents: 10 };
export const SIT_PAID_VISITS_PER_DAY = 2;

// Frontier pay (milestones only — decided 2026-07-12): coins live where the
// learning is. Fresh mastered facts pay nothing, and that's the whole
// anti-farming design — praise, streaks and achievements stay unchanged.
export const FACT_MASTERY_PAY = { denom: 'nickel', cents: 5 };
export const SET_MASTERY_PAY = { denom: 'buck', cents: 100 };
export const POLISH_PAY = { denom: 'penny', cents: 1 };
export const POLISH_CAP_CENTS_PER_DAY = 5;

// Human words for the grown-ups ledger.
export const REASON_LABELS = {
  sitting: 'pet sitting',
  mastery: 'new fact mastered',
  set: 'whole table mastered',
  polish: 'rusty fact polished',
  skill: 'new number known',
  buy: 'pet store',
  swap: 'coin swap',
  spend: 'coins paid',
};

// Coin swaps run both directions: consolidate up, break a big coin down.
// Each is two net-zero txns, so balances never move — only the coins do.
const D = { buck: 100, quarter: 25, dime: 10, nickel: 5, penny: 1 };
export const SWAPS = [
  { give: { denom: 'quarter', n: 4 }, get: { denom: 'buck', n: 1 } },
  { give: { denom: 'dime', n: 10 }, get: { denom: 'buck', n: 1 } },
  { give: { denom: 'nickel', n: 5 }, get: { denom: 'quarter', n: 1 } },
  { give: { denom: 'nickel', n: 2 }, get: { denom: 'dime', n: 1 } },
  { give: { denom: 'penny', n: 10 }, get: { denom: 'dime', n: 1 } },
  { give: { denom: 'penny', n: 5 }, get: { denom: 'nickel', n: 1 } },
  { give: { denom: 'buck', n: 1 }, get: { denom: 'quarter', n: 4 } },
  { give: { denom: 'buck', n: 1 }, get: { denom: 'dime', n: 10 } },
  { give: { denom: 'quarter', n: 1 }, get: { denom: 'nickel', n: 5 } },
  { give: { denom: 'dime', n: 1 }, get: { denom: 'nickel', n: 2 } },
  { give: { denom: 'nickel', n: 1 }, get: { denom: 'penny', n: 5 } },
];

// Can these coin counts make EXACTLY `price`? Bounded DP over the coin
// piles (counts are small) — greedy fails with limited coins.
export function canMakeExact(counts, price) {
  let reachable = new Set([0]);
  for (const { id, cents } of DENOMS) {
    const n = counts[id] ?? 0;
    if (!n) continue;
    const next = new Set();
    for (const base of reachable) {
      for (let k = 0; k <= n; k++) {
        const v = base + k * cents;
        if (v > price) break;
        next.add(v);
      }
    }
    reachable = next;
  }
  return reachable.has(price);
}

export function canSwap(profile, rule) {
  return (coinCounts(profile)[rule.give.denom] ?? 0) >= rule.give.n;
}

// Replay order is (at, income-first, id). Two operations created in the
// SAME millisecond would therefore tie and fall back to id order, which
// is effectively random — so a swap that spends what the previous swap
// just produced could replay first and be rejected. Stamping each new
// spend/swap with a strictly increasing `at` keeps causality without
// making the order device-dependent.
export function txnAt(profile, now = Date.now()) {
  const txns = ensureBucks(profile).txns;
  let last = 0;
  for (const t of txns) if ((t.at ?? 0) > last) last = t.at ?? 0;
  return Math.max(now, last + 1);
}

export function swapCoins(profile, rule, now = Date.now()) {
  if (!canSwap(profile, rule)) return false;
  const cents = D[rule.give.denom] * rule.give.n;
  now = txnAt(profile, now); // causal order for back-to-back swaps
  const rid = Math.random().toString(36).slice(2, 8);
  const gid = `swap-${now.toString(36)}-${rid}`;
  ensureBucks(profile).txns.push(
    { id: `${gid}-a`, group: gid, at: now, cents: -cents, denom: rule.give.denom, count: -rule.give.n, reason: 'swap' },
    { id: `${gid}-b`, group: gid, at: now, cents, denom: rule.get.denom, count: rule.get.n, reason: 'swap' }
  );
  return true;
}

export function ensureBucks(profile) {
  if (!profile.pawBucks) profile.pawBucks = { txns: [], epoch: 1 };
  if (!Number.isInteger(profile.pawBucks.epoch) || profile.pawBucks.epoch < 1) profile.pawBucks.epoch = 1;
  return profile.pawBucks;
}

export function storeEpoch(profile) {
  return ensureBucks(profile).epoch;
}

// Derived from convergent replay (v1.40): guaranteed >= 0, identical on
// every device for the same event union, and groups that would overdraw
// (a cross-device double-spend) are derived-rejected rather than owed.
// What the child can spend. Floored at zero: if two devices spent the
// same coins while apart, the shortfall is FORGIVEN rather than charged
// to the child or clawed back by un-owning what they bought (that
// retroactive clawback is what made toys vanish — see docs/PROJECT-NOTE
// and the v1.45.0 changelog).
export function balanceCents(profile) {
  const b = ledgerState(profile).balance;
  return b > 0 ? b : 0;
}

// The true signed total, for the Grown-Ups ledger only.
export function trueBalanceCents(profile) {
  return ledgerState(profile).balance;
}

export function ledgerState(profile) {
  const bucks = ensureBucks(profile);
  return replayLedger(bucks.txns, bucks.epoch);
}

export function formatPaw(cents) {
  return `🐾$${(cents / 100).toFixed(2)}`;
}

// The literal coins earned (net of spends, oldest coins spent first later —
// Phase 4). For now every positive txn carries its denomination.
export function coinCounts(profile) {
  // Count-netting: any txn carrying a denom moves that coin's count
  // (earns +1, swap give negative, swap get positive). Buys carry no
  // denom — spending doesn't pick which coins leave (Phase 4b keeps it
  // simple; the balance is the truth).
  // MUST go through ledgerState so the store epoch applies: replaying
  // without it re-subtracts voided purchases from the coins, which left
  // a reset child with a full balance and almost no spendable coins
  // (v1.45.1). And the coins must ALWAYS add up to the balance, or
  // exact-change checkout can never be completed — if the tracked mix
  // has drifted (a clamp, a half-synced swap), fall back to the plain
  // canonical breakdown of the balance.
  const tracked = { ...ledgerState(profile).counts };
  return reconcileCoins(tracked, balanceCents(profile));
}

const coinValue = (counts) => Object.entries(counts).reduce((s, [d, n]) => s + (D[d] ?? 0) * n, 0);

// Bring a coin mix in line with the balance with the SMALLEST possible
// change: trim the smallest coins if it's over, top up with the biggest
// if it's under. The child's real earned mix (lots of nickels and dimes,
// which is what makes exact change payable) is preserved — rebuilding
// from scratch over a 1¢ rounding wobble would have thrown it away.
export function reconcileCoins(tracked, balance) {
  const out = { ...tracked };
  let value = coinValue(out);
  if (value === balance) return out;
  for (const { id } of [...DENOMS].reverse()) {
    while (value > balance && (out[id] ?? 0) > 0 && value - D[id] >= balance) {
      out[id] -= 1;
      value -= D[id];
      if (out[id] === 0) delete out[id];
    }
  }
  for (const { id } of DENOMS) {
    while (value + D[id] <= balance) {
      out[id] = (out[id] ?? 0) + 1;
      value += D[id];
    }
  }
  // couldn't land exactly (a wildly inconsistent mix) — start clean
  return value === balance ? out : canonicalCoins(balance);
}

// A coin set worth exactly `cents`. Biggest-first, but with a pocketful
// of small change kept back when there's room: all-Paw-Bucks is tidy and
// useless — a child could not pay for a 10¢ mouse without visiting the
// piggy bank first. The kit below is worth exactly 100¢ so the total is
// unchanged.
const SMALL_CHANGE_KIT = { quarter: 2, dime: 3, nickel: 3, penny: 5 }; // = 100c
export function canonicalCoins(cents) {
  const out = {};
  let left = Math.max(0, cents);
  if (left >= 200) {
    for (const [id, n] of Object.entries(SMALL_CHANGE_KIT)) out[id] = n;
    left -= 100;
  }
  for (const { id } of DENOMS) {
    const v = D[id];
    const n = Math.floor(left / v);
    if (n > 0) out[id] = (out[id] ?? 0) + n;
    left -= n * v;
  }
  return out;
}

function sameLocalDay(a, b) {
  const x = new Date(a);
  const y = new Date(b);
  return (
    x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() &&
    x.getDate() === y.getDate()
  );
}

export function paidSitsToday(profile, now = Date.now()) {
  return ensureBucks(profile).txns.filter(
    (t) => t.reason === 'sitting' && sameLocalDay(t.at, now)
  ).length;
}

// Pays for a completed sitting visit, or returns null when today's treat
// jar is already full. (Per-device day boundary; the slow rate makes the
// cross-device edge harmless.)
export function earnSitting(profile, now = Date.now()) {
  if (paidSitsToday(profile, now) >= SIT_PAID_VISITS_PER_DAY) return null;
  const txn = {
    id: `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    at: now,
    cents: SIT_PAY.cents,
    denom: SIT_PAY.denom,
    count: 1,
    reason: 'sitting',
  };
  ensureBucks(profile).txns.push(txn);
  return txn;
}

// Finish-screen badge text: earned coins grouped by kind, so ten nickels
// read as one proud badge instead of ten repeats.
const BADGE_TEXT = {
  set: (n) => `💵 Paw Buck${n > 1 ? ` ×${n}` : ''} — a whole set mastered!`,
  mastery: (n) => `🪙 Paw Nickel${n > 1 ? ` ×${n}` : ''} — new trick${n > 1 ? 's' : ''} learned!`,
  polish: (n) => `🪙 Paw Penny${n > 1 ? ` ×${n}` : ''} — rusty fact${n > 1 ? 's' : ''} polished!`,
  sitting: () => '🪙 +1 paw dime!',
  skill: (n) => `🪙 Paw Penn${n > 1 ? `ies ×${n}` : 'y'} — new number${n > 1 ? 's' : ''} known!`,
};

export function coinBadges(txns) {
  const groups = {};
  for (const t of txns) groups[t.reason] = (groups[t.reason] ?? 0) + 1;
  // Biggest news first: table bucks, then new tricks, then upkeep.
  const order = ['set', 'mastery', 'skill', 'polish', 'sitting'];
  return order
    .filter((r) => groups[r])
    .map((r) => (BADGE_TEXT[r] ?? ((n) => `🪙 ×${n}`))(groups[r]));
}

// --- frontier earning -------------------------------------------------------
// One-time payouts use DETERMINISTIC txn ids: if two devices both witness the
// same mastery before a sync, the union-by-id merge keeps a single payment.
// Boxes can dip and re-cross mastery — the id also makes that pay only once.

function hasTxn(profile, id) {
  return ensureBucks(profile).txns.some((t) => t.id === id);
}

export function earnFactMastery(profile, a, b, track, now = Date.now()) {
  const sep = track === 'add' || track === 'sub' ? '+' : 'x'; // +/− share family keys
  const key = a <= b ? `${a}${sep}${b}` : `${b}${sep}${a}`;
  const id = `mastery-${track}-${key}`;
  if (hasTxn(profile, id)) return null;
  const txn = {
    id,
    at: now,
    cents: FACT_MASTERY_PAY.cents,
    denom: FACT_MASTERY_PAY.denom,
    count: 1,
    reason: 'mastery',
  };
  ensureBucks(profile).txns.push(txn);
  return txn;
}

export function earnSetMastery(profile, table, track, now = Date.now()) {
  const id = `set-${track}-${table}`;
  if (hasTxn(profile, id)) return null;
  const txn = {
    id,
    at: now,
    cents: SET_MASTERY_PAY.cents,
    denom: SET_MASTERY_PAY.denom,
    count: 1,
    reason: 'set',
  };
  ensureBucks(profile).txns.push(txn);
  return txn;
}

// A paw penny the first time a little-pup number becomes "known" (streak
// of 3). Deterministic id: re-derives and cross-device merges pay once.
export function earnSkillKnown(profile, skillKey, now = Date.now()) {
  const id = `skill-${skillKey}`;
  if (hasTxn(profile, id)) return null;
  const txn = { id, at: now, cents: 1, denom: 'penny', count: 1, reason: 'skill' };
  ensureBucks(profile).txns.push(txn);
  return txn;
}

export function polishedCentsToday(profile, now = Date.now()) {
  return ensureBucks(profile)
    .txns.filter((t) => t.reason === 'polish' && sameLocalDay(t.at, now))
    .reduce((s, t) => s + t.cents, 0);
}

export function earnPolish(profile, now = Date.now()) {
  if (polishedCentsToday(profile, now) >= POLISH_CAP_CENTS_PER_DAY) return null;
  const txn = {
    id: `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    at: now,
    cents: POLISH_PAY.cents,
    denom: POLISH_PAY.denom,
    count: 1,
    reason: 'polish',
  };
  ensureBucks(profile).txns.push(txn);
  return txn;
}

// Everything a single answer can earn. Screens call this right after
// recordAnswer/recordDivisionAnswer and collect the txns for the
// end-of-round coin ceremony. Little Pup joins at Phase 5.
export function earnFromAnswer(profile, q, res, now = Date.now()) {
  const earned = [];
  if (res.polished) {
    const t = earnPolish(profile, now);
    if (t) earned.push(t);
  }
  if (res.mastered) {
    const track = q.add ? 'add' : q.sub ? 'sub' : q.division ? 'div' : 'mul';
    const t = earnFactMastery(profile, q.a, q.b, track, now);
    if (t) earned.push(t);
    if (track === 'add' || track === 'sub') {
      // Did this crossing complete the fact's strategy wave?
      const w = waveIndexOf(q.a, q.b);
      const done = track === 'add' ? isWaveMastered(profile, w) : isSubWaveMastered(profile, w);
      if (done) {
        const st = earnSetMastery(profile, `w${WAVES[w].id}`, track, now);
        if (st) earned.push(st);
      }
    } else {
      // Did this crossing complete a whole table? (a×b feeds both tables)
      const tables = q.division ? [q.a] : [...new Set([q.a, q.b])];
      for (const tb of tables) {
        if (tb < 1 || tb > 12) continue;
        const done = q.division
          ? isDivisionTableMastered(profile, tb)
          : isTableMastered(profile, tb);
        if (done) {
          const st = earnSetMastery(profile, tb, track, now);
          if (st) earned.push(st);
        }
      }
    }
  }
  return earned;
}
