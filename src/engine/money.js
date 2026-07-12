// Paw Bucks 🐾💵 — the in-game currency. Structured like US money (paw
// pennies/nickels/dimes/quarters and Paw Buck bills, values in integer paw
// cents) so future currency-math games get real denominations to count —
// but it is FICTITIOUS FOREVER: no real money exists anywhere in this game.
//
// Sync-safe by design: balances are an append-only transaction ledger,
// merged by union — so spending on one device can never be resurrected by
// a counter-max merge from another.

import { isTableMastered, isDivisionTableMastered } from './leitner.js';

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
};

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
  const counts = {};
  for (const t of ensureBucks(profile).txns) {
    if (t.cents > 0 && t.denom) {
      counts[t.denom] = (counts[t.denom] ?? 0) + (t.count ?? 1);
    }
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
  set: (n) => `💵 Paw Buck${n > 1 ? ` ×${n}` : ''} — whole table mastered!`,
  mastery: (n) => `🪙 Paw Nickel${n > 1 ? ` ×${n}` : ''} — new trick${n > 1 ? 's' : ''} learned!`,
  polish: (n) => `🪙 Paw Penny${n > 1 ? ` ×${n}` : ''} — rusty fact${n > 1 ? 's' : ''} polished!`,
  sitting: () => '🪙 +1 paw dime!',
};

export function coinBadges(txns) {
  const groups = {};
  for (const t of txns) groups[t.reason] = (groups[t.reason] ?? 0) + 1;
  // Biggest news first: table bucks, then new tricks, then upkeep.
  const order = ['set', 'mastery', 'polish', 'sitting'];
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

export function earnFactMastery(profile, a, b, division, now = Date.now()) {
  const key = a <= b ? `${a}x${b}` : `${b}x${a}`;
  const id = `mastery-${division ? 'div' : 'mul'}-${key}`;
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

export function earnSetMastery(profile, table, division, now = Date.now()) {
  const id = `set-${division ? 'div' : 'mul'}-${table}`;
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
    const t = earnFactMastery(profile, q.a, q.b, !!q.division, now);
    if (t) earned.push(t);
    // Did this crossing complete a whole table? (a×b feeds both tables)
    const tables = q.division ? [q.a] : [...new Set([q.a, q.b])];
    for (const tb of tables) {
      if (tb < 1 || tb > 12) continue;
      const done = q.division
        ? isDivisionTableMastered(profile, tb)
        : isTableMastered(profile, tb);
      if (done) {
        const st = earnSetMastery(profile, tb, !!q.division, now);
        if (st) earned.push(st);
      }
    }
  }
  return earned;
}
