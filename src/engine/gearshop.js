// Store gear ownership. The Paw Bucks ledger IS the ownership record:
// a purchase is one negative txn with a DETERMINISTIC id, so two devices
// buying the same thing merge to a single charge, and ownership can never
// diverge from payment. Placement (who wears/holds an owned item) is the
// only new state — profile.gear.placements, a preference merged newer-wins.

import { GEAR_ACCESSORIES, TOYS } from '../art/gear.js';
import { ensureBucks, balanceCents } from './money.js';

export const CATALOG = [...GEAR_ACCESSORIES, ...TOYS];

export function itemOf(itemId) {
  return CATALOG.find((x) => x.id === itemId) ?? null;
}

export function buyTxnId(itemId, forId = null) {
  const item = itemOf(itemId);
  return item?.tier === 'gift' ? `buy-${itemId}-${forId}` : `buy-${itemId}`;
}

export function isOwned(profile, itemId, forId = null) {
  const id = buyTxnId(itemId, forId);
  return ensureBucks(profile).txns.some((t) => t.id === id);
}

// Everything owned: [{ item, for }] — gifts carry their wearer, treasures
// and toys carry null.
export function ownedGear(profile) {
  return ensureBucks(profile)
    .txns.filter((t) => t.reason === 'buy' && t.item)
    .map((t) => ({ item: t.item, for: t.for ?? null }));
}

// Buys an item (for a specific wearer when it's a gift). Refuses when the
// wallet can't cover it or it's already owned. Fictitious forever.
export function buyGear(profile, itemId, forId = null, now = Date.now(), coins = null) {
  const item = itemOf(itemId);
  if (!item) return null;
  if (item.tier === 'gift' && !forId) return null;
  if (isOwned(profile, itemId, forId)) return null;
  if (balanceCents(profile) < item.price) return null;
  const txn = {
    id: buyTxnId(itemId, forId),
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
// go on their own wearer; treasures and toys go anywhere.
export function placeGear(profile, itemId, wearerId) {
  const item = itemOf(itemId);
  if (!item) return false;
  const forId = item.tier === 'gift' ? wearerId : null;
  if (!isOwned(profile, itemId, forId)) return false;
  if (!profile.gear) profile.gear = { placements: {} };
  profile.gear.placements[placementKey(itemId, forId)] = wearerId ?? null;
  return true;
}

// The gear a wearer currently has on — feeds the accessories pipeline.
export function placedOn(profile, wearerId) {
  const placements = profile.gear?.placements ?? {};
  return Object.entries(placements)
    .filter(([, who]) => who === wearerId)
    .map(([key]) => key.split(':')[0])
    .filter((itemId) => itemOf(itemId)?.slot); // toys aren't wearable
}
