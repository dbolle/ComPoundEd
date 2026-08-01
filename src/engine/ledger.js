// The Paw Bucks ledger as an event log with CONVERGENT derived state
// (v1.40). Raw transactions are immutable and unioned; balances, coin
// counts, and ownership are a pure function of the union — every device
// recomputes the identical result whatever order events arrived in.
// No compensating/reversal events are ever written: a purchase that
// isn't affordable at its replay position is DERIVED-rejected (the item
// returns to the shelf; the child never sees debt), and a late-arriving
// earlier earning can flip it back to accepted on every device at once.

import { stableStringify } from '../data/canonical.js';

const DENOMS = new Set(['buck', 'quarter', 'dime', 'nickel', 'penny']);

// ---- normalization ---------------------------------------------------------

const isInt = (x) => Number.isInteger(x);

// Validation per event type. Malformed events are excluded from replay
// (quarantined) but NEVER removed from the raw history.
export function validEvent(t) {
  if (!t || typeof t !== 'object') return false;
  if (typeof t.id !== 'string' || !t.id) return false;
  if (!isInt(t.cents)) return false;
  if (t.denom !== undefined && !DENOMS.has(t.denom)) return false;
  if (t.count !== undefined && !isInt(t.count)) return false;
  if (typeof t.reason !== 'string') return false;
  return true;
}

// Atomic-group derivation. `group` is DERIVED metadata (never part of
// the immutable payload): explicit t.group wins; legacy purchases group
// by their buy id prefix (buy-x, buy-x-c-*); legacy swap pairs by their
// shared id prefix (swap-...-a / swap-...-b); everything else stands
// alone.
export function groupOf(t) {
  if (typeof t.group === 'string' && t.group) return t.group;
  const buy = /^(buy-.+?)(-c-[a-z]+)?$/.exec(t.id);
  if (buy) return buy[1];
  const swap = /^(swap-.+)-(a|b)$/.exec(t.id);
  if (swap) return swap[1];
  return t.id;
}

// Immutable payload fingerprint: everything except `at` (observation
// time, reconciled to the minimum) and `group` (derived metadata — a
// legacy event and its upgraded equivalent must not conflict).
export function fingerprintOf(t) {
  const { at, group, ...immutable } = t;
  return stableStringify(immutable);
}

// ---- union (commutative, associative, idempotent) --------------------------

// Union two raw event lists by id. Matching payloads coalesce to one
// canonical event with at = min(observed). CONFLICTING payloads for the
// same id are all preserved (keyed by fingerprint — repeated merges
// cannot multiply variants); replay quarantines every variant of a
// conflicted id. Nothing is ever discarded.
export function mergeTxns(a = [], b = []) {
  const byId = new Map(); // id -> Map(fingerprint -> event)
  const add = (t) => {
    if (!t || typeof t.id !== 'string') return;
    const fp = fingerprintOf(t);
    let variants = byId.get(t.id);
    if (!variants) byId.set(t.id, (variants = new Map()));
    const prev = variants.get(fp);
    if (prev) {
      if ((t.at ?? Infinity) < (prev.at ?? Infinity)) variants.set(fp, { ...prev, at: t.at });
    } else {
      variants.set(fp, { ...t });
    }
  };
  for (const t of a) add(t);
  for (const t of b) add(t);
  const out = [];
  for (const variants of byId.values()) out.push(...variants.values());
  // canonical storage order: at, then id, then fingerprint — identical on
  // every device regardless of merge order
  out.sort(
    (x, y) => (x.at ?? 0) - (y.at ?? 0) || x.id.localeCompare(y.id) || fingerprintOf(x).localeCompare(fingerprintOf(y))
  );
  return out;
}

// ---- replay ----------------------------------------------------------------

// The coin a denom-carrying event moves (legacy earns omit count = +1).
const effCount = (t) => (t.denom ? (t.count ?? (t.cents > 0 ? 1 : 0)) : 0);

// Memo keyed on the array object AND its length: merges create fresh
// arrays, while in-place flows only ever APPEND — so (identity, length)
// uniquely determines content.
const memo = new WeakMap();

export function replayLedger(txns = []) {
  const cached = memo.get(txns);
  if (cached && cached.len === txns.length) return cached.result;

  const quarantined = new Set();
  const byId = new Map();
  for (const t of txns) {
    if (!validEvent(t)) {
      if (t?.id) quarantined.add(t.id);
      continue;
    }
    const fp = fingerprintOf(t);
    let set = byId.get(t.id);
    if (!set) byId.set(t.id, (set = new Set()));
    set.add(fp);
  }
  for (const [id, fps] of byId) if (fps.size > 1) quarantined.add(id);

  // group the replayable events
  const groups = new Map(); // groupId -> { at, events }
  for (const t of txns) {
    if (!validEvent(t) || quarantined.has(t.id)) continue;
    const g = groupOf(t);
    let entry = groups.get(g);
    if (!entry) groups.set(g, (entry = { at: t.at ?? 0, events: [] }));
    entry.at = Math.min(entry.at, t.at ?? 0);
    entry.events.push(t);
  }
  // Order: time, then income-before-spending within the same instant
  // (a spend must never beat the earn that funds it to the same
  // millisecond), then group id. Fully deterministic on every device.
  const netOf = (entry) => entry.events.reduce((sum, t) => sum + t.cents, 0);
  const ordered = [...groups.entries()].sort(
    (x, y) =>
      x[1].at - y[1].at ||
      (netOf(x[1]) < 0 ? 1 : 0) - (netOf(y[1]) < 0 ? 1 : 0) ||
      x[0].localeCompare(y[0])
  );

  let balance = 0;
  const counts = {};
  const accepted = new Set();
  const rejected = new Set();
  for (const [gid, { events }] of ordered) {
    let dBal = 0;
    const dCounts = {};
    for (const t of events) {
      dBal += t.cents;
      const c = effCount(t);
      if (c) dCounts[t.denom] = (dCounts[t.denom] ?? 0) + c;
    }
    const okBal = balance + dBal >= 0;
    const okCounts = Object.entries(dCounts).every(([d, c]) => (counts[d] ?? 0) + c >= 0);
    if (okBal && okCounts) {
      balance += dBal;
      for (const [d, c] of Object.entries(dCounts)) counts[d] = (counts[d] ?? 0) + c;
      accepted.add(gid);
    } else {
      rejected.add(gid); // derived — nothing written, converges as events arrive
    }
  }

  const result = { balance, counts, accepted, rejected, quarantined };
  memo.set(txns, { len: txns.length, result });
  return result;
}
