// Store gear ownership. The Paw Bucks ledger IS the ownership record:
// a purchase is one negative txn with a DETERMINISTIC id, so two devices
// buying the same thing merge to a single charge, and ownership can never
// diverge from payment. Placement (who wears/holds an owned item) is the
// only new state — profile.gear.placements, a preference merged newer-wins.

import { GEAR_ACCESSORIES, TOYS } from '../art/gear.js';
import { ensureBucks, balanceCents, ledgerState, txnAt, storeEpoch } from './money.js';
import { touchMeta } from '../data/schema.js';
import { epochOfId } from './ledger.js';

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
  const epoch = storeEpoch(profile);
  const base = buyTxnId(itemId, forId, epoch);
  const legacy = buyTxnId(itemId, forId); // epoch-1 shape
  for (const t of ensureBucks(profile).txns) {
    if (t.id.includes('-c-')) continue;
    if (t.id === base) return true;
    if (epoch === 1 && (t.id === legacy || t.id.startsWith(`${legacy}~`))) return true;
  }
  return false;
}

// Everything owned: [{ item, for }] — gifts carry their wearer, treasures
// and toys carry null.
// One entry per owned thing. Deduped by item+wearer: a re-purchase (or
// an old retry id) must not show the same toy twice in the box, and
// purchases from earlier store epochs don't appear at all.
export function ownedGear(profile) {
  const epoch = storeEpoch(profile);
  const seen = new Set();
  const out = [];
  for (const t of ensureBucks(profile).txns) {
    if (t.reason !== 'buy' || !t.item || t.id.includes('-c-')) continue;
    if (epochOfId(t.id) !== epoch) continue; // voided by a fresh start
    const key = `${t.item}|${t.for ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ item: t.item, for: t.for ?? null });
  }
  return out;
}

// Buys an item (for a specific wearer when it's a gift). Refuses when the
// wallet can't cover it or it's already owned. Fictitious forever.
export function buyGear(profile, itemId, forId = null, now = Date.now(), coins = null) {
  const item = itemOf(itemId);
  if (!item) return null;
  if (item.tier === 'gift' && !forId) return null;
  if (isOwned(profile, itemId, forId)) return null;
  if (balanceCents(profile) < item.price) return null;
  const buyId = buyTxnId(itemId, forId, storeEpoch(profile));
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
  return profile.gear?.placements?.[placementKey(itemId, forId)] ?? null;
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
  touchMeta(profile); // placements are a choice — survive stale-device merges
  return true;
}

// The gear a wearer currently has on — feeds the accessories pipeline.
export function placedOn(profile, wearerId) {
  const placements = profile.gear?.placements ?? {};
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
  const placements = profile.gear?.placements ?? {};
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
    .filter((id) => !(profile.gear?.placements?.[id]));
}

// A grown-up "fresh start in the store" (v1.45.0): bump the epoch so
// every previous purchase is void — not charged, not owned — while the
// child keeps every Paw Buck they ever earned. Nothing is deleted: the
// full history stays in the ledger for the Grown-Ups view, and lowering
// the epoch would bring it all back. Placements are cleared because the
// items behind them are no longer owned.
export function resetStoreEpoch(profile) {
  const bucks = ensureBucks(profile);
  bucks.epoch = (bucks.epoch ?? 1) + 1;
  // Placements are TOMBSTONED (set to null), not deleted: placement maps
  // merge key-wise, so an emptied map would simply be refilled by the
  // next sync with any device that still had them.
  const cleared = {};
  for (const key of Object.keys(profile.gear?.placements ?? {})) cleared[key] = null;
  profile.gear = { ...(profile.gear ?? {}), placements: cleared };
  touchMeta(profile); // a deliberate parent action, not a play save
  return bucks.epoch;
}
