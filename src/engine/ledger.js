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
  // `at` orders the replay — a non-finite value would make the sort
  // comparator inconsistent (engine-defined result) and desync devices
  if (t.at !== undefined && (typeof t.at !== 'number' || !Number.isFinite(t.at))) return false;
  if (t.denom !== undefined && !DENOMS.has(t.denom)) return false;
  if (t.count !== undefined && !isInt(t.count)) return false;
  if (typeof t.reason !== 'string') return false;
  return true;
}

// Which store epoch a purchase belongs to. Ids carry it as an "@n"
// suffix from epoch 2 onward; anything without a suffix is epoch 1. A
// grown-up "fresh start in the store" bumps the profile's epoch, which
// VOIDS older purchases (no charge, no ownership) while leaving every
// earning untouched.
export function epochOfId(id = '') {
  const m = /@(\d+)(?:-c-[a-z]+)?$/.exec(id);
  return m ? Number(m[1]) : 1;
}

// Atomic-group derivation. `group` is DERIVED metadata (never part of
// the immutable payload): explicit t.group wins; legacy purchases group
// by their buy id prefix (buy-x, buy-x-c-*); legacy swap pairs by their
// shared id prefix (swap-...-a / swap-...-b); everything else stands
// alone.
export function groupOf(t) {
  if (typeof t.group === 'string' && t.group) return t.group;
  const buy = /^(buy-.+?)(-c-[a-z]+)?$/.exec(t.id);
  // Retired `~n` retry ids (v1.40-1.44) are the SAME purchase: grouping
  // them together means the duplicate charge disappears while ownership
  // is unaffected. Real ledgers still contain them.
  if (buy) return buy[1].replace(/~\d+$/, '');
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
      // Coalesce deterministically: at = min(observed), and DERIVED
      // metadata (group) is normalized away rather than inherited from
      // whichever side was added first — otherwise mergeTxns(a,b) and
      // (b,a) produced different arrays for a legacy event and its
      // upgraded twin, and the two devices then healed each other in a
      // loop forever (audit M3).
      const at = Math.min(prev.at ?? Infinity, t.at ?? Infinity);
      variants.set(fp, { ...prev, at: Number.isFinite(at) ? at : undefined });
    } else {
      const { group, ...rest } = t; // group is re-derived by groupOf()
      variants.set(fp, { ...rest });
    }
  };
  for (const t of a) add(t);
  for (const t of b) add(t);
  const out = [];
  for (const variants of byId.values()) out.push(...variants.values());
  // canonical storage order: at, then id, then fingerprint — identical on
  // every device regardless of merge order
  // byte-order comparison, never localeCompare: collation differs by
  // device locale, and this order must be identical everywhere
  const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  out.sort(
    (x, y) => (x.at ?? 0) - (y.at ?? 0) || cmp(x.id, y.id) || cmp(fingerprintOf(x), fingerprintOf(y))
  );
  return out;
}

// ---- replay ----------------------------------------------------------------

// The coin a denom-carrying event moves (legacy earns omit count = +1).
const effCount = (t) => (t.denom ? (t.count ?? (t.cents > 0 ? 1 : 0)) : 0);

const COIN_CENTS = { buck: 100, quarter: 25, dime: 10, nickel: 5, penny: 1 };
const BIG_FIRST = ['buck', 'quarter', 'dime', 'nickel', 'penny'];
const coinsValue = (counts) =>
  Object.entries(counts).reduce((s, [d, n]) => s + (COIN_CENTS[d] ?? 0) * n, 0);

// Add coins worth exactly `cents`, keeping a usable mix rather than one
// big coin (a wallet of Paw Bucks cannot pay for a 10¢ toy).
function addCoins(counts, cents) {
  let left = cents;
  if (left >= 200) {
    for (const [d, n] of Object.entries({ quarter: 2, dime: 3, nickel: 3, penny: 5 })) {
      counts[d] = (counts[d] ?? 0) + n;
    }
    left -= 100;
  }
  for (const d of BIG_FIRST) {
    const n = Math.floor(left / COIN_CENTS[d]);
    if (n > 0) {
      counts[d] = (counts[d] ?? 0) + n;
      left -= n * COIN_CENTS[d];
    }
  }
}

// Hand over coins worth at least `cents`, largest first, and take the
// change back — the shop-counter model. Mutates `counts`.
function payFromCounts(counts, cents) {
  let owed = cents;
  for (const d of BIG_FIRST) {
    while (owed > 0 && (counts[d] ?? 0) > 0) {
      counts[d] -= 1;
      owed -= COIN_CENTS[d];
      if (counts[d] === 0) delete counts[d];
      if (owed <= 0) break;
    }
    if (owed <= 0) break;
  }
  let change = owed < 0 ? -owed : 0; // overpaid — give change back
  for (const d of BIG_FIRST) {
    const n = Math.floor(change / COIN_CENTS[d]);
    if (n > 0) {
      counts[d] = (counts[d] ?? 0) + n;
      change -= n * COIN_CENTS[d];
    }
  }
}

// Memo keyed on the array identity plus a cheap content digest — an
// in-place same-length edit would otherwise return a stale result
// (nothing does that today, but nothing enforced it either).
// The memo key must be O(1): a store render asks for balance/coins/
// ownership dozens of times, and hashing the whole array each time made
// a cache hit cost as much as a small replay (audit M6/F11). Identity +
// length + epoch + a fingerprint of the LAST event covers everything the
// app does (append-only pushes and fresh arrays from merges); an
// in-place edit of an earlier event would need an explicit bump.
const memo = new WeakMap();
const digestOf = (txns) => {
  const t = txns[txns.length - 1];
  return `${txns.length}|${t?.id ?? ''}|${t?.cents ?? ''}|${t?.reason ?? ''}|${t?.count ?? ''}`;
};

export function replayLedger(txns = [], epoch = 1) {
  const cached = memo.get(txns);
  const digest = `${epoch}#${digestOf(txns)}`;
  if (cached && cached.digest === digest) return cached.result;

  const quarantined = new Set();
  const voided = new Set();
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
  // Conflicting payloads for one id: only a CENTS disagreement can
  // corrupt the money, so only that is quarantined. Coin-tray companions
  // (zero cents) disagreeing across devices used to quarantine too,
  // which silently corrupted coin counts and cascaded into rejected
  // swaps — the live incident behind v1.45.0.
  for (const [id, fps] of byId) {
    if (fps.size <= 1) continue;
    const variants = txns.filter((t) => t.id === id && validEvent(t));
    const centsDiffer = new Set(variants.map((t) => t.cents)).size > 1;
    if (centsDiffer) quarantined.add(id);
  }

  // group the replayable events
  const groups = new Map(); // groupId -> { at, events }
  const seenFp = new Set();
  for (const t of txns) {
    if (!validEvent(t) || quarantined.has(t.id)) continue;
    // a spend/buy from an earlier store epoch is void: it never happened
    if ((t.reason === 'buy' || t.reason === 'spend') && epochOfId(t.id) < epoch) {
      voided.add(groupOf(t));
      continue;
    }
    // conflicting non-cents variants: keep exactly one, deterministically
    const fpKey = `${t.id}|${fingerprintOf(t)}`;
    if (byId.get(t.id)?.size > 1) {
      const chosen = [...byId.get(t.id)].sort()[0];
      if (fingerprintOf(t) !== chosen) continue;
      if (seenFp.has(fpKey)) continue;
      seenFp.add(fpKey);
    }
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
      (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0)
  );

  // Every surviving group STANDS. Retroactively rejecting a purchase
  // un-owned things a child had already been given, which is strictly
  // worse than the overspend it was guarding against (v1.45.0). The
  // guard now lives only where it belongs: buyGear refuses at purchase
  // time when the balance can't cover the price.
  let balance = 0;
  let low = 0; // worst underwater point — what gets forgiven
  const counts = {};
  const accepted = new Set();
  for (const [gid, { events: raw }] of ordered) {
    // One purchase per group. The retired `~n` retry ids are the SAME
    // purchase recorded twice (v1.40-1.44 created them when a toy looked
    // un-owned) — charging both is the double-charge still sitting in real
    // ledgers. Keep the earliest buy and its own coin companions; drop the
    // retry and the coins it claimed to take.
    const buys = raw.filter((t) => t.reason === 'buy');
    let events = raw;
    if (buys.length > 1) {
      const keep = [...buys].sort((a, b) => (a.at ?? 0) - (b.at ?? 0) || (a.id < b.id ? -1 : 1))[0];
      events = raw.filter(
        (t) => t === keep || (t.reason !== 'buy' && t.id.startsWith(`${keep.id}-c-`))
      );
    }
    let groupCents = 0;
    let movedCoins = false;
    for (const t of events) {
      balance += t.cents;
      groupCents += t.cents;
      const c = effCount(t);
      if (c) {
        movedCoins = true;
        counts[t.denom] = Math.max(0, (counts[t.denom] ?? 0) + c);
        if (counts[t.denom] === 0) delete counts[t.denom]; // no empty piles
      }
    }
    if (balance < low) low = balance;
    // A spend with no coin companions (every purchase before exact-change
    // checkout existed, and any caller passing coins=null) used to move
    // NO coins at all, so the tracked mix drifted permanently above the
    // balance. That drift is what made the wallet unspendable and the
    // swap button a no-op. Model it instead: pay largest-coin-first and
    // take change back, exactly like a shop counter. Still a pure
    // function of the ordered union, so merges stay convergent.
    if (!movedCoins && groupCents < 0) payFromCounts(counts, -groupCents);
    // Keep the coins honest AT EVERY STEP. Companion records can be
    // inconsistent with the cents (two devices counting out different
    // trays for the same purchase, a merge clamp, a pre-exact-change
    // buy), and any leftover drift used to be repaired later by
    // rebuilding the whole wallet — which silently swallowed the child's
    // next swap and left the button doing nothing (audit F1/C1/I8).
    // Correcting per group means the tracked mix always equals what the
    // child can spend, so a swap is always a real move.
    const target = balance - low; // what the child is shown (incl. forgiveness)
    const drift = coinsValue(counts) - Math.max(0, target);
    if (drift > 0) payFromCounts(counts, drift);
    else if (drift < 0) addCoins(counts, -drift);
    accepted.add(gid);
  }

  const result = {
    balance,
    counts,
    accepted,
    rejected: new Set(),
    voided,
    quarantined,
    // Cross-device overspends are forgiven rather than charged to the
    // child's future earnings (v1.46.0): the shortfall is added back, so
    // "forgiven" is literally true instead of merely displayed.
    forgiven: low < 0 ? -low : 0,
  };
  memo.set(txns, { digest, result });
  return result;
}
