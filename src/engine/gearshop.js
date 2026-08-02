// Store gear ownership. The Paw Bucks ledger IS the ownership record:
// a purchase is one negative txn with a DETERMINISTIC id, so two devices
// buying the same thing merge to a single charge, and ownership can never
// diverge from payment. Placement (who wears/holds an owned item) is the
// only new state — profile.gear.placements, a preference merged newer-wins.

import { GEAR_ACCESSORIES, TOYS } from '../art/gear.js';
import { ensureBucks, balanceCents, ledgerState, txnAt, storeEpoch, coinCounts, canMakeExact } from './money.js';

const COIN_CENTS = { buck: 100, quarter: 25, dime: 10, nickel: 5, penny: 1 };
import { touchMeta } from '../data/schema.js';
import { epochOfId } from './ledger.js';

// The epoch floored by the DATA: if the stored value is ever lost or
// mangled (a bad merge, a non-integer), purchase ids still carry it — so
// a parent's fresh start can never be silently undone (audit F8).
export function effectiveEpoch(profile) {
  let e = storeEpoch(profile);
  for (const t of ensureBucks(profile).txns) {
    if (t.reason !== 'buy') continue;
    const k = epochOfId(t.id);
    if (k > e) e = k;
  }
  return e;
}

// Placements belong to the store epoch they were made in. Scoping them
// means a fresh start cannot be undone by a stale device whose cosmetic
// change happens to carry a newer metaAt (audit M5) — and re-bought items
// arrive in the toy box instead of pre-placed.
function placementsFor(profile) {
  const gear = profile.gear ?? {};
  const epoch = effectiveEpoch(profile);
  return (gear.placementEpoch ?? 1) < epoch ? {} : (gear.placements ?? {});
}

export const CATALOG = [...GEAR_ACCESSORIES, ...TOYS];

export function itemOf(itemId) {
  return CATALOG.find((x) => x.id === itemId) ?? null;
}

// Purchase ids are deterministic so two devices buying the same thing
// merge to ONE charge. From store epoch 2 onward the epoch rides the id:
// a fresh start must produce genuinely new events, or the merge would
// fold a re-purchase into the voided original (and re-void it).
export function buyTxnId(itemId, forId = null, epoch = 1) {
  const item = itemOf(itemId);
  const base = item?.tier === 'gift' ? `buy-${itemId}-${forId}` : `buy-${itemId}`;
  return epoch > 1 ? `${base}@${epoch}` : base;
}

// Owned = a purchase exists in the CURRENT store epoch. Ownership is
// evidence of payment, not of present solvency: once a child has been
// given a thing, nothing takes it back (the retroactive version of this
// check is what made toys disappear mid-play — v1.45.0). Older ids,
// including the retired `~n` retry shapes, still count within epoch 1.
export function isOwned(profile, itemId, forId = null) {
  const item = itemOf(itemId);
  const wearer = item?.tier === 'gift' ? (forId ?? '') : '';
  // O(1): the replay already built this set in the pass it was making
  // anyway (it used to rescan every transaction, per catalogue item, on
  // every store render).
  return ledgerState(profile).owned.has(`${itemId}|${wearer}`);
}

// Everything owned: [{ item, for }] — gifts carry their wearer, treasures
// and toys carry null.
// One entry per owned thing. Deduped by item+wearer: a re-purchase (or
// an old retry id) must not show the same toy twice in the box, and
// purchases from earlier store epochs don't appear at all.
export function ownedGear(profile) {
  return [...ledgerState(profile).owned].map((key) => {
    const [item, forId] = key.split('|');
    return { item, for: forId || null };
  });
}

// Buys an item (for a specific wearer when it's a gift). Refuses when the
// wallet can't cover it or it's already owned. Fictitious forever.
export function buyGear(profile, itemId, forId = null, now = Date.now(), coins = null, change = null) {
  const item = itemOf(itemId);
  if (!item) return null;
  if (item.tier === 'gift' && !forId) return null;
  if (isOwned(profile, itemId, forId)) return null;
  if (balanceCents(profile) < item.price) return null;
  // The tray must actually pay the price, with coins the child holds —
  // otherwise "change" gets invented downstream (audit M1). Phase 7 will
  // want real change; that belongs in the ledger as its own event, not in
  // a repair function.
  // The tray must be real and the arithmetic must be right. Overpaying is
  // allowed — the child works out the change and counts it back — but the
  // transaction is refused unless paid − change === price exactly (owner
  // decision, 2026-08-02). No "close enough", and no invented change.
  let changeGiven = null;
  if (coins) {
    const held = coinCounts(profile);
    let paid = 0;
    for (const [denom, n] of Object.entries(coins)) {
      if (!Number.isInteger(n) || n < 0) return null;
      if (n > (held[denom] ?? 0)) return null;
      paid += (COIN_CENTS[denom] ?? 0) * n;
    }
    let back = 0;
    if (change) {
      for (const [denom, n] of Object.entries(change)) {
        if (!Number.isInteger(n) || n < 0) return null;
        back += (COIN_CENTS[denom] ?? 0) * n;
      }
    }
    if (paid - back !== item.price) return null; // the sum must be exact
    changeGiven = back > 0 ? change : null;
  }
  const buyId = buyTxnId(itemId, forId, effectiveEpoch(profile));
  now = txnAt(profile, now); // a purchase must replay after what funded it
  const txn = {
    id: buyId,
    group: buyId,
    at: now,
    cents: -item.price,
    count: 1,
    reason: 'buy',
    item: itemId,
    for: item.tier === 'gift' ? forId : null,
  };
  ensureBucks(profile).txns.push(txn);
  // Exact-change checkout: record WHICH coins paid, as zero-cent companion
  // txns (the buy txn is the only cents carrier; these net the coin
  // counts). Deterministic ids ride the buy id, so merges stay idempotent.
  if (changeGiven) {
    // change comes back as its own recorded coins, not as an inference
    for (const [denom, n] of Object.entries(changeGiven)) {
      if (n > 0) {
        ensureBucks(profile).txns.push({
          group: txn.id,
          id: `${txn.id}-r-${denom}`,
          at: now,
          cents: 0,
          denom,
          count: n,
          reason: 'change',
        });
      }
    }
  }
  if (coins) {
    for (const [denom, n] of Object.entries(coins)) {
      if (n > 0) {
        ensureBucks(profile).txns.push({
          group: txn.id,
          id: `${txn.id}-c-${denom}`,
          at: now,
          cents: 0,
          denom,
          count: -n,
          reason: 'spend',
        });
      }
    }
  }
  // gifts arrive being worn; other purchases start in the closet
  if (item.tier === 'gift') placeGear(profile, itemId, forId);
  return txn;
}

export function placementKey(itemId, forId = null) {
  return itemOf(itemId)?.tier === 'gift' ? `${itemId}:${forId}` : itemId;
}

export function placementOf(profile, itemId, forId = null) {
  return placementsFor(profile)[placementKey(itemId, forId)] ?? null;
}

// Moves an owned item onto a wearer (or null = closet). Gifts only ever
// go on their own wearer; treasures and toys go anywhere. For gifts,
// `giftFor` names the owner — deriving it from the TARGET wearer broke
// undressing (taking off passes wearerId null, which isn't an owner).
export function placeGear(profile, itemId, wearerId, giftFor = null) {
  const item = itemOf(itemId);
  if (!item) return false;
  const forId = item.tier === 'gift' ? (giftFor ?? wearerId) : null;
  if (!isOwned(profile, itemId, forId)) return false;
  if (item.tier === 'gift' && wearerId != null && wearerId !== forId) return false;
  if (!profile.gear) profile.gear = { placements: {} };
  profile.gear.placements[placementKey(itemId, forId)] = wearerId ?? null;
  profile.gear.placementEpoch = effectiveEpoch(profile); // stamp the epoch
  touchMeta(profile); // placements are a choice — survive stale-device merges
  return true;
}

// The gear a wearer currently has on — feeds the accessories pipeline.
export function placedOn(profile, wearerId) {
  const placements = placementsFor(profile);
  return Object.entries(placements)
    .filter(([key, who]) => {
      if (who !== wearerId) return false;
      const [id, forId] = key.split(':');
      return itemOf(id)?.slot && isOwned(profile, id, forId ?? null);
    })
    .map(([key]) => key.split(':')[0]);
}

// Toys placed with a wearer (placedOn filters to wearables for the
// accessories pipeline — this is its toy sibling).
export function toysOn(profile, wearerId) {
  const placements = placementsFor(profile);
  return Object.entries(placements)
    .filter(([key, who]) => {
      if (who !== wearerId) return false;
      const id = key.split(':')[0];
      if (itemOf(id)?.tier !== 'toy') return false;
      return isOwned(profile, id); // never render a toy the child no longer owns
    })
    .map(([key]) => key.split(':')[0]);
}

// Owned toys currently in the box (no wearer).
export function boxedToys(profile) {
  return ownedGear(profile)
    .filter(({ item }) => itemOf(item)?.tier === 'toy')
    .map(({ item }) => item)
    .filter((id) => !placementsFor(profile)[id]);
}

// A grown-up "fresh start in the store" (v1.45.0): bump the epoch so
// every previous purchase is void — not charged, not owned — while the
// child keeps every Paw Buck they ever earned. Nothing is deleted: the
// full history stays in the ledger for the Grown-Ups view, and lowering
// the epoch would bring it all back. Placements are cleared because the
// items behind them are no longer owned.
export function resetStoreEpoch(profile) {
  const bucks = ensureBucks(profile);
  bucks.epoch = effectiveEpoch(profile) + 1;
  // Placements are TOMBSTONED (set to null), not deleted: placement maps
  // merge key-wise, so an emptied map would simply be refilled by the
  // next sync with any device that still had them.
  const cleared = {};
  for (const key of Object.keys(profile.gear?.placements ?? {})) cleared[key] = null;
  profile.gear = { ...(profile.gear ?? {}), placements: cleared, placementEpoch: bucks.epoch };
  // A child who only ever earned Paw Bucks would hold nothing but Paw
  // Bucks after a fresh start and could not pay for a 10¢ toy without a
  // trip to the piggy bank first. Break one buck into change here — as a
  // real, net-zero ledger event (deterministic id, merge-safe), not as a
  // hidden adjustment.
  const cheapest = Math.min(...CATALOG.map((i) => i.price));
  if (balanceCents(profile) >= 100 && !canMakeExact(coinCounts(profile), cheapest)) {
    const gid = `reset-change@${bucks.epoch}`;
    const at = txnAt(profile);
    bucks.txns.push(
      { id: `${gid}-give`, group: gid, at, cents: -100, denom: 'buck', count: -1, reason: 'swap' },
      { id: `${gid}-quarter`, group: gid, at, cents: 50, denom: 'quarter', count: 2, reason: 'swap' },
      { id: `${gid}-dime`, group: gid, at, cents: 30, denom: 'dime', count: 3, reason: 'swap' },
      { id: `${gid}-nickel`, group: gid, at, cents: 15, denom: 'nickel', count: 3, reason: 'swap' },
      { id: `${gid}-penny`, group: gid, at, cents: 5, denom: 'penny', count: 5, reason: 'swap' }
    );
  }
  touchMeta(profile); // a deliberate parent action, not a play save
  return bucks.epoch;
}
