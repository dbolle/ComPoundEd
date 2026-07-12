// Paw Bucks 🐾💵 — the in-game currency. Structured like US money (paw
// pennies/nickels/dimes/quarters and Paw Buck bills, values in integer paw
// cents) so future currency-math games get real denominations to count —
// but it is FICTITIOUS FOREVER: no real money exists anywhere in this game.
//
// Sync-safe by design: balances are an append-only transaction ledger,
// merged by union — so spending on one device can never be resurrected by
// a counter-max merge from another.

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
