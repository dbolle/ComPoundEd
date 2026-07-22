// Paw Bucks 🐾💵 — the in-game currency. Structured like US money (paw
// pennies/nickels/dimes/quarters and Paw Buck bills, values in integer paw
// cents) so future currency-math games get real denominations to count —
// but it is FICTITIOUS FOREVER: no real money exists anywhere in this game.
//
// Sync-safe by design: balances are an append-only transaction ledger,
// merged by union — so spending on one device can never be resurrected by
// a counter-max merge from another.

import { isTableMastered, isDivisionTableMastered } from './leitner.js';
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

export function canSwap(profile, rule) {
  return (coinCounts(profile)[rule.give.denom] ?? 0) >= rule.give.n;
}

export function swapCoins(profile, rule, now = Date.now()) {
  if (!canSwap(profile, rule)) return false;
  const cents = D[rule.give.denom] * rule.give.n;
  const rid = Math.random().toString(36).slice(2, 8);
  ensureBucks(profile).txns.push(
    { id: `swap-${now.toString(36)}-${rid}-a`, at: now, cents: -cents, denom: rule.give.denom, count: -rule.give.n, reason: 'swap' },
    { id: `swap-${now.toString(36)}-${rid}-b`, at: now, cents, denom: rule.get.denom, count: rule.get.n, reason: 'swap' }
  );
  return true;
}

export function ensureBucks(profile) {
  if (!profile.pawBucks) profile.pawBucks = { txns: [] };
  return profile.pawBucks;
}

export function balanceCents(profile) {
  return ensureBucks(profile).txns.reduce((sum, t) => sum + (t.cents ?? 0), 0);
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
  const counts = {};
  for (const t of ensureBucks(profile).txns) {
    if (t.denom) counts[t.denom] = (counts[t.denom] ?? 0) + (t.count ?? (t.cents > 0 ? 1 : 0));
  }
  return counts;
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
