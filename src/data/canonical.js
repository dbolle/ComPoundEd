// Canonical serialization for sync comparison and (later) content-hash
// ETags. Two docs with the same MEANING must serialize identically:
// object keys sort, and semantically UNORDERED collections sort by a
// stable identity — otherwise array-order noise (txn union order,
// unlock arrival order) looks like a difference and triggers endless
// healing pushes.

const by = (key) => (a, b) => {
  const x = a?.[key] ?? '';
  const y = b?.[key] ?? '';
  return x < y ? -1 : x > y ? 1 : 0;
};

// Returns a deep copy with unordered collections sorted. Unknown fields
// pass through untouched.
export function canonicalizeProfile(doc) {
  const out = { ...doc };
  if (Array.isArray(out.unlocks)) {
    out.unlocks = [...out.unlocks].sort((a, b) => (`${a?.dogId}` < `${b?.dogId}` ? -1 : `${a?.dogId}` > `${b?.dogId}` ? 1 : 0));
  }
  if (Array.isArray(out.petUnlocks)) {
    out.petUnlocks = [...out.petUnlocks].sort(by('milestone'));
  }
  if (out.pawBucks?.txns) {
    // id alone is NOT a total order once one id has conflicting variants
    // (the quarantine case) — tie-break on full content so the signature
    // is stable for identical data
    const key = (t) => `${t?.id}\u0000${stableStringify(t)}`;
    out.pawBucks = {
      ...out.pawBucks,
      txns: [...out.pawBucks.txns].sort((x, y) => (key(x) < key(y) ? -1 : key(x) > key(y) ? 1 : 0)),
    };
  }
  if (out.little?.revealed) {
    out.little = { ...out.little, revealed: [...out.little.revealed].sort() };
  }
  return out;
}

export function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys
    .filter((k) => value[k] !== undefined)
    .map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`)
    .join(',')}}`;
}

export function profileSignature(doc) {
  return stableStringify(canonicalizeProfile(doc));
}
