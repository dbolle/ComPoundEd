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

export async function pushProfile(profile) {
  try {
    const res = await fetch(`${SYNC_BASE}${encodeURIComponent(profile.id)}.json`, {
      method: 'PUT',
      body: JSON.stringify(profile),
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      signal: signal(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function pullProfiles() {
  try {
    const res = await fetch(SYNC_BASE, {
      headers: { Accept: 'application/json' },
      signal: signal(),
    });
    if (!res.ok) return [];
    const listing = await res.json();
    const out = [];
    for (const f of listing) {
      if (!f.name || !f.name.endsWith('.json')) continue;
      try {
        const r = await fetch(SYNC_BASE + f.name, { signal: signal() });
        if (r.ok) out.push(await r.json());
      } catch {
        /* skip unreadable entries */
      }
    }
    return out;
  } catch {
    return [];
  }
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
