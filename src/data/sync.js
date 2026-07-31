// Family backup: optional, OFF by default. Talks only to the same origin the
// app is served from (/sync/ on the family's home server) — never a
// third-party service, never the internet. Every call fails silently so the
// app works identically offline or away from home.

const SYNC_BASE = '/sync/profiles/';
const TIMEOUT_MS = 5000;

function signal() {
  const ctl = new AbortController();
  setTimeout(() => ctl.abort(), TIMEOUT_MS);
  return ctl.signal;
}

// keepalive lets a PUT survive the page being killed (the pagehide flush)
// but browsers cap keepalive bodies at ~64KB — a long Paw Bucks ledger
// exceeds that and the push silently drops. So: keepalive ONLY on the
// flush path, plain fetch everywhere else.
export async function pushProfile(profile, { keepalive = false } = {}) {
  try {
    const res = await fetch(`${SYNC_BASE}${encodeURIComponent(profile.id)}.json`, {
      method: 'PUT',
      body: JSON.stringify(profile),
      headers: { 'Content-Type': 'application/json' },
      keepalive,
      signal: signal(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Cheap probe: does the family server hold any backups? Used to offer
// turning sync on for devices/origins where the switch is still off.
export async function remoteBackupCount() {
  try {
    const res = await fetch(SYNC_BASE, { headers: { Accept: 'application/json' }, signal: signal() });
    if (!res.ok) return 0;
    const listing = await res.json();
    return listing.filter((f) => f.name?.endsWith('.json')).length;
  } catch {
    return 0;
  }
}

// Live profiles can legitimately reach ~4MB (long Paw Bucks ledgers) —
// the cap matches the server's client_max_body_size, no lower.
const MAX_DOC_BYTES = 4 * 1024 * 1024;

// Transport status matters: a failed LISTING is not an empty server —
// callers must never treat unseen profiles as remotely absent.
export async function pullProfiles() {
  let listing;
  try {
    const res = await fetch(SYNC_BASE, {
      headers: { Accept: 'application/json' },
      signal: signal(),
    });
    if (!res.ok) return { ok: false, docs: [] };
    listing = await res.json();
    if (!Array.isArray(listing)) return { ok: false, docs: [] };
  } catch {
    return { ok: false, docs: [] };
  }
  const docs = [];
  for (const f of listing) {
    if (!f.name || !f.name.endsWith('.json')) continue;
    try {
      const r = await fetch(SYNC_BASE + f.name, { signal: signal() });
      if (!r.ok) continue;
      const text = await r.text();
      if (text.length > MAX_DOC_BYTES) continue; // pathological file — skip, never parse
      docs.push(JSON.parse(text));
    } catch {
      /* skip unreadable entries */
    }
  }
  return { ok: true, docs };
}

export async function deleteRemoteProfile(id) {
  try {
    await fetch(`${SYNC_BASE}${encodeURIComponent(id)}.json`, {
      method: 'DELETE',
      signal: signal(),
    });
  } catch {
    /* remote copy may linger; harmless */
  }
}
