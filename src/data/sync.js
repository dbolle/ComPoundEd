// Family backup transport: optional, OFF by default. Talks only to the
// same origin the app is served from (/sync/ on the family's home
// server) — never a third-party service, never the internet.
//
// Two server generations are spoken (v1.38 cutover):
//  - CAS mode (the sync sidecar): lifecycle envelopes, content-hash
//    ETags, If-Match / If-None-Match conditional writes, paginated
//    listings, family-key auth. This is the real concurrency contract.
//  - legacy mode (plain nginx DAV, pre-cutover): raw docs, blind PUTs.
//    Kept only for the transition window; detected by listing shape.
//
// The family key (when set) travels as X-Sync-Key on every call. It is
// stored in device-local meta only — never in profiles or exports.

const SYNC_BASE = '/sync/profiles/';

// Family backup talks to a SAME-ORIGIN /sync/ on a server the family runs.
// On the public build there is no such server and there never can be, so
// every request would be a guaranteed 404 — and requests a family did not
// ask for are exactly what this app promises not to make. Refuse at the
// transport, not at each caller: hiding the buttons stopped the controls
// but the probes carried on regardless (six of them, measured), because
// `offerBackup` and the deleted-players check run from the profiles screen.
export const NO_SERVER_POSSIBLE =
  typeof __PUBLIC_DEMO__ !== 'undefined' && __PUBLIC_DEMO__;
const TIMEOUT_MS = 5000;
// Live profiles can legitimately reach ~4MB (long Paw Bucks ledgers) —
// the cap matches the server limit, no lower.
const MAX_DOC_BYTES = 4 * 1024 * 1024;

let syncKey = null;
export function setSyncHeaderKey(k) {
  syncKey = k || null;
}
const keyHeaders = () => (syncKey ? { 'X-Sync-Key': syncKey } : {});

function signal() {
  const ctl = new AbortController();
  setTimeout(() => ctl.abort(), TIMEOUT_MS);
  return ctl.signal;
}

// Last seen ETag per profile — lets background pushes attempt a cheap
// conditional write; a miss falls back to the full pull-merge-put loop.
const etags = new Map();
export function knownEtag(id) {
  return etags.get(id) ?? null;
}

// Legacy servers honor no conditionals; flip only when the listing
// answered in the legacy shape this session.
let legacyMode = false;
export function isLegacyMode() {
  return legacyMode;
}

const denied = (res) => res.status === 401 || res.status === 403;
const throttled = (res) => res.status === 429;

// List remote LIVE profiles. CAS mode follows every page; a failure
// after page one returns partial=true — callers must then never treat
// unseen profiles as remotely absent.
export async function listRemote() {
  if (NO_SERVER_POSSIBLE) return { ok: false, ids: [] };
  const ids = [];
  let cursor = '';
  let first = true;
  for (let page = 0; page < 50; page++) {
    let res;
    try {
      res = await fetch(`${SYNC_BASE}${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`, {
        headers: { Accept: 'application/json', ...keyHeaders() },
        signal: signal(),
      });
    } catch {
      return first ? { ok: false } : { ok: true, mode: 'cas', ids, partial: true };
    }
    if (denied(res)) return { ok: false, denied: true };
    if (throttled(res)) return { ok: false, throttled: true };
    if (!res.ok) return first ? { ok: false } : { ok: true, mode: 'cas', ids, partial: true };
    let body;
    try {
      body = await res.json();
    } catch {
      return first ? { ok: false } : { ok: true, mode: 'cas', ids, partial: true };
    }
    if (Array.isArray(body)) {
      legacyMode = true;
      return {
        ok: true,
        mode: 'legacy',
        ids: body.filter((f) => f.name?.endsWith('.json')).map((f) => f.name.slice(0, -5)),
      };
    }
    if (!Array.isArray(body.entries)) return { ok: false };
    legacyMode = false;
    for (const e of body.entries) if (e?.id && !ids.includes(e.id)) ids.push(e.id);
    first = false;
    if (!body.nextCursor) return { ok: true, mode: 'cas', ids };
    cursor = body.nextCursor;
  }
  return { ok: true, mode: 'cas', ids, partial: true };
}

// Fetch one profile. CAS mode returns { doc, etag }; lifecycle states
// return { gone, state }. Legacy returns { doc, etag: null }.
export async function getRemote(id) {
  if (NO_SERVER_POSSIBLE) return { ok: false };
  try {
    const res = await fetch(`${SYNC_BASE}${encodeURIComponent(id)}.json`, {
      headers: { Accept: 'application/json', ...keyHeaders() },
      signal: signal(),
    });
    if (denied(res)) return { ok: false, denied: true };
    if (res.status === 410) {
      const meta = await res.json().catch(() => ({}));
      const etag = res.headers.get('ETag');
      if (etag) etags.set(id, etag);
      return { ok: true, gone: true, state: meta.state ?? 'deleted', meta, etag };
    }
    if (!res.ok) return { ok: false, missing: res.status === 404 };
    const text = await res.text();
    if (text.length > MAX_DOC_BYTES) return { ok: false };
    const etag = legacyMode ? null : res.headers.get('ETag');
    if (etag) etags.set(id, etag);
    return { ok: true, doc: JSON.parse(text), etag };
  } catch {
    return { ok: false };
  }
}

// Conditional write. etag=null means CREATE (If-None-Match: *). In
// legacy mode conditionals are omitted (the old server ignores them).
export async function putRemote(profile, etag, { keepalive = false } = {}) {
  if (NO_SERVER_POSSIBLE) return { ok: false };
  const url = `${SYNC_BASE}${encodeURIComponent(profile.id)}.json`;
  const body = JSON.stringify(profile);
  if (body.length > MAX_DOC_BYTES) return { ok: false, tooLarge: true };
  const conditional = legacyMode ? {} : etag ? { 'If-Match': etag } : { 'If-None-Match': '*' };
  try {
    const res = await fetch(url, {
      method: 'PUT',
      body,
      headers: { 'Content-Type': 'application/json', ...conditional, ...keyHeaders() },
      keepalive,
      signal: signal(),
    });
    if (denied(res)) return { ok: false, denied: true };
    if (res.status === 412 || res.status === 428 || res.status === 409)
      return { ok: false, conflict: true };
    if (res.status === 410) return { ok: false, gone: true };
    if (res.status === 413) return { ok: false, tooLarge: true };
    if (!res.ok) return { ok: false };
    const newTag = res.headers.get('ETag');
    if (newTag) etags.set(profile.id, newTag);
    return { ok: true, etag: newTag ?? null };
  } catch {
    return { ok: false };
  }
}

// Deleted-player metadata (id, name, gen, tombstoneId) — parental
// restore/purge management only; ordinary sync never calls this.
export async function listDeleted() {
  if (NO_SERVER_POSSIBLE) return { ok: false, entries: [] };
  const entries = [];
  let cursor = '';
  for (let page = 0; page < 50; page++) {
    let res;
    try {
      res = await fetch(`${SYNC_BASE}deleted${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`, {
        headers: { Accept: 'application/json', ...keyHeaders() },
        signal: signal(),
      });
    } catch {
      return { ok: false };
    }
    if (denied(res)) return { ok: false, denied: true };
    if (!res.ok) return { ok: false };
    const body = await res.json().catch(() => null);
    if (!body || !Array.isArray(body.entries)) return { ok: false };
    entries.push(...body.entries);
    if (!body.nextCursor) return { ok: true, entries };
    cursor = body.nextCursor;
  }
  return { ok: true, entries };
}

// Archive download — ONLY from the explicit restore-management flow.
export async function getArchive(id) {
  if (NO_SERVER_POSSIBLE) return { ok: false };
  try {
    const res = await fetch(`${SYNC_BASE}${encodeURIComponent(id)}/archive`, {
      headers: { Accept: 'application/json', ...keyHeaders() },
      signal: signal(),
    });
    if (denied(res)) return { ok: false, denied: true };
    if (!res.ok) return { ok: false };
    const text = await res.text();
    if (text.length > MAX_DOC_BYTES) return { ok: false, tooLarge: true };
    return { ok: true, doc: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
}

// Lifecycle transitions (the v1.39 delete/restore/purge release drives
// these; the protocol ships with the platform).
export async function lifecycleTransition(id, action, etag, payload = {}) {
  if (NO_SERVER_POSSIBLE) return { ok: false };
  try {
    const res = await fetch(`${SYNC_BASE}${encodeURIComponent(id)}/${action}`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json', 'If-Match': etag, ...keyHeaders() },
      signal: signal(),
    });
    if (denied(res)) return { ok: false, denied: true };
    if (res.status === 412) return { ok: false, conflict: true, meta: await res.json().catch(() => ({})) };
    if (res.status === 410) return { ok: false, gone: true, meta: await res.json().catch(() => ({})) };
    if (!res.ok) return { ok: false };
    const out = await res.json().catch(() => ({}));
    const newTag = res.headers.get('ETag');
    if (newTag) etags.set(id, newTag);
    return { ok: true, ...out };
  } catch {
    return { ok: false };
  }
}

// Cheap probe for the backup offer: does the server hold any live
// backups? Sends the key when one is set; NEVER sends child data.
export async function remoteBackupCount() {
  const listing = await listRemote();
  if (listing.denied) return { count: 0, denied: true };
  if (!listing.ok) return { count: 0 };
  return { count: listing.ids.length };
}
