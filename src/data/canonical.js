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
    out.unlocks = [...out.unlocks].sort((a, b) => `${a?.dogId}`.localeCompare(`${b?.dogId}`));
  }
  if (Array.isArray(out.petUnlocks)) {
    out.petUnlocks = [...out.petUnlocks].sort(by('milestone'));
  }
  if (out.pawBucks?.txns) {
    out.pawBucks = { ...out.pawBucks, txns: [...out.pawBucks.txns].sort(by('id')) };
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
