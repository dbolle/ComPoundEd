import { openRepo } from './storage.js';
import { newProfile, migrateProfile, mergeProfiles, validProfileDoc } from './schema.js';
import { profileSignature } from './canonical.js';
import {
  listRemote,
  getRemote,
  putRemote,
  knownEtag,
  remoteBackupCount,
  setSyncHeaderKey,
  listDeleted,
  getArchive,
  lifecycleTransition,
  isLegacyMode,
} from './sync.js';

let repo;
let syncEnabled = false;
let soundEnabled = true;
let voicePref = null;
const pushTimers = new Map();

export async function initStore() {
  repo = await openRepo();
  syncEnabled = (await repo.getMeta('syncEnabled')) === true;
  soundEnabled = (await repo.getMeta('soundEnabled')) !== false; // default on
  voicePref = (await repo.getMeta('voicePref')) ?? null;
  setSyncHeaderKey((await repo.getMeta('syncKey')) ?? null);
}

// The family key: device-local meta ONLY — never in profile docs,
// exports, or sync payloads. Password-style entry in Grown-Ups and the
// profiles restore flow.
export async function getSyncKey() {
  return (await repo.getMeta('syncKey')) ?? null;
}

export async function setSyncKey(key) {
  const v = key?.trim() || null;
  await repo.setMeta('syncKey', v);
  setSyncHeaderKey(v);
}

// On plain-http origins the key is observable on the LAN; the first
// transmission needs an explicit grown-up acknowledgement.
export async function httpKeyAcknowledged() {
  return (await repo.getMeta('httpKeyAck')) === true;
}

export async function acknowledgeHttpKey() {
  await repo.setMeta('httpKeyAck', true);
}

export function getVoicePref() {
  return voicePref;
}

export async function setVoicePref(name) {
  voicePref = name || null;
  await repo.setMeta('voicePref', voicePref);
}

export function isSoundEnabled() {
  return soundEnabled;
}

export async function setSoundEnabled(v) {
  soundEnabled = v === true;
  await repo.setMeta('soundEnabled', soundEnabled);
}

export function isSyncEnabled() {
  return syncEnabled;
}

export async function setSyncEnabled(v) {
  syncEnabled = v === true;
  await repo.setMeta('syncEnabled', syncEnabled);
}

// All writes to one profile run in order through a promise chain: a save
// can no longer interleave with a syncNow merge (read-modify-write race)
// — whichever starts second sees the other's committed write.
const writeChains = new Map();
function withProfileLock(id, fn) {
  const prev = writeChains.get(id) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  writeChains.set(
    id,
    next.catch(() => {})
  );
  return next;
}

// Push one profile with the real concurrency contract: try a cheap
// conditional PUT against the last seen ETag; on conflict (or no ETag
// yet) run the bounded pull → merge → conditional-PUT loop. Never a
// blind overwrite (legacy servers excepted, where blind is all there is).
async function syncOneProfile(profile) {
  for (let attempt = 0; attempt < 3; attempt++) {
    if (deletedIds.has(profile.id)) return { ok: false, gone: true };
    const put = await putRemote(profile, knownEtag(profile.id));
    if (put.ok) return { ok: true };
    if (put.denied) return { ok: false, denied: true };
    if (put.gone) {
      await applyRemoteDeletion(profile.id); // tombstone wins
      return { ok: false, gone: true };
    }
    if (!put.conflict) return { ok: false };
    // conflict: someone else wrote — pull, merge, retry with their ETag
    const remote = await getRemote(profile.id);
    if (remote.denied) return { ok: false, denied: true };
    if (remote.gone) {
      await applyRemoteDeletion(profile.id); // tombstone wins
      return { ok: false, gone: true };
    }
    if (remote.ok && remote.doc && validProfileDoc(remote.doc)) {
      const merged = await withProfileLock(profile.id, async () => {
        const local = await repo.getProfile(profile.id);
        const m = mergeProfiles(
          local ? migrateProfile(local) : null,
          migrateProfile(structuredClone(remote.doc))
        );
        await repo.saveProfile(m);
        return m;
      });
      profile = mergeProfiles(merged, profile);
    } else if (remote.missing) {
      // deleted underneath us between listing and write — recreate
      const put2 = await putRemote(profile, null);
      if (put2.ok) return { ok: true };
    }
  }
  return { ok: false, conflict: true };
}

// Push IMMEDIATELY on every save: kids switch devices (or iOS kills the
// tab) faster than any debounce window, and that lost transactions.
// Failures re-arm with backoff (flaky wifi, device waking from sleep);
// a fresh save or a success clears the timer.
const PUSH_RETRY_MS = [4000, 15000, 60000];
function schedulePush(profile, attempt = 0) {
  clearTimeout(pushTimers.get(profile.id));
  if (deletedIds.has(profile.id)) return;
  syncOneProfile(profile).then((r) => {
    if (r.ok) {
      repo.setMeta('lastPushAt', Date.now());
    } else if (!r.denied && !r.gone && attempt < PUSH_RETRY_MS.length) {
      pushTimers.set(
        profile.id,
        setTimeout(() => schedulePush(profile, attempt + 1), PUSH_RETRY_MS[attempt])
      );
    }
  });
}

// The pagehide flush can't run the full loop — a best-effort keepalive
// conditional PUT with the cached ETag; the next check-in heals misses.
export function flushProfile(profile) {
  if (deletedIds.has(profile.id)) return;
  putRemote(profile, knownEtag(profile.id), { keepalive: true });
}

// ---------------------------------------------------------------------------
// Deletion lifecycle (v1.39). A delete durably records a pending intent —
// { intentId, baseGen, baseEtag, finalSnapshot, status } — in meta BEFORE
// the local profile is removed, so the final progress always reaches the
// server archive, even for offline deletions and app restarts. Ordering
// is server generations (via CAS etags), never client clocks.

const deletedIds = new Set(); // blocks queued/future pushes this session

async function getPendingTombstones() {
  return (await repo.getMeta('pendingTombstones')) ?? {};
}

async function setPendingTombstone(id, intent) {
  const all = await getPendingTombstones();
  if (intent === null) delete all[id];
  else all[id] = intent;
  await repo.setMeta('pendingTombstones', all);
  // verify the commit before the caller may delete the live profile
  const check = (await repo.getMeta('pendingTombstones')) ?? {};
  if (intent !== null && !check[id]) throw new Error('pending tombstone did not commit');
}

function makeIntentId() {
  return typeof crypto?.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Resolve one pending deletion against the server. Matrix (review-locked):
//  - server missing → nothing to archive remotely; confirmed.
//  - server live at our observed base → merge live doc with the retained
//    snapshot, CAS-PUT the complete merged doc, then CAS the delete
//    transition — the server archives exactly the final merged document.
//  - server already deleted with OUR tombstoneId → confirmed.
//  - server purged → the stronger action wins; intent cleared.
//  - server advanced any other way (restored, other tombstone, newer
//    writes) → structured lifecycle conflict; the snapshot is RETAINED
//    and a grown-up decides. Never auto-delete newer lifecycle state.
async function resolveTombstone(id, intent) {
  const remote = await getRemote(id);
  if (remote.denied) return { state: 'denied' };
  if (!remote.ok && !remote.missing) return { state: 'offline' };
  if (remote.missing) {
    await setPendingTombstone(id, null);
    return { state: 'confirmed' };
  }
  if (remote.gone) {
    if (remote.state === 'purged' || remote.meta?.tombstoneId === intent.intentId) {
      await setPendingTombstone(id, null);
      return { state: 'confirmed' };
    }
    return { state: 'conflict', reason: 'deleted-elsewhere', meta: remote.meta };
  }
  // live envelope
  const baseMatches = intent.baseEtag == null || remote.etag === intent.baseEtag;
  if (!baseMatches) return { state: 'conflict', reason: 'changed-since', meta: { etag: remote.etag } };
  // merge final snapshot with the server's live doc, commit, then delete
  let finalDoc = intent.finalSnapshot;
  if (remote.doc && validProfileDoc(remote.doc)) {
    finalDoc = finalDoc
      ? mergeProfiles(migrateProfile(structuredClone(remote.doc)), migrateProfile(structuredClone(finalDoc)))
      : migrateProfile(structuredClone(remote.doc));
  }
  let etag = remote.etag;
  if (finalDoc && !isLegacyMode()) {
    const put = await putRemote(finalDoc, etag);
    if (put.denied) return { state: 'denied' };
    if (!put.ok) return put.conflict ? { state: 'conflict', reason: 'changed-since' } : { state: 'offline' };
    etag = put.etag;
  }
  if (isLegacyMode()) {
    // pre-cutover server: no lifecycle support — the intent stays pending
    // until the sidecar arrives; local deletion is already done.
    return { state: 'pending-legacy' };
  }
  const t = await lifecycleTransition(id, 'delete', etag, { tombstoneId: intent.intentId });
  if (t.denied) return { state: 'denied' };
  if (t.ok) {
    await setPendingTombstone(id, null);
    return { state: 'confirmed' };
  }
  if (t.conflict || t.gone) return { state: 'conflict', reason: 'changed-since', meta: t.meta };
  return { state: 'offline' };
}

// Called from syncNow: retries every pending intent; surfaces conflicts.
async function resolvePendingTombstones() {
  const all = await getPendingTombstones();
  const conflicts = [];
  for (const [id, intent] of Object.entries(all)) {
    deletedIds.add(id);
    try {
      const r = await resolveTombstone(id, intent);
      if (r.state === 'conflict') {
        conflicts.push({ id, name: intent.finalSnapshot?.name ?? id, reason: r.reason });
        intent.status = 'conflict';
        await setPendingTombstone(id, intent);
      }
    } catch {
      /* retried next sync */
    }
  }
  return conflicts;
}

// A tombstone always wins during automatic sync: remove the local copy.
// Recovery is ONLY the explicit grown-up restore action.
let onRemoteDeleted = null;
export function setOnRemoteDeleted(fn) {
  onRemoteDeleted = fn;
}

async function applyRemoteDeletion(id) {
  const pending = await getPendingTombstones();
  if (pending[id]) return; // our own intent — handled by resolution
  await withProfileLock(id, async () => {
    const local = await repo.getProfile(id);
    if (!local) return;
    await repo.deleteProfile(id);
    await repo.setMeta(`ui:${id}`, null);
  });
  deletedIds.add(id);
  onRemoteDeleted?.(id);
}

// ---- explicit grown-up management (restore / purge / conflicts) ----------

export async function listDeletedPlayers() {
  return listDeleted();
}

export async function restoreDeletedPlayer(id) {
  const remote = await getRemote(id);
  if (!remote.gone || remote.state !== 'deleted') return { ok: false, reason: 'not-deleted' };
  const archive = await getArchive(id);
  if (archive.tooLarge) return { ok: false, reason: 'too-large' };
  if (!archive.ok || !validProfileDoc(archive.doc)) return { ok: false, reason: 'unreadable' };
  const t = await lifecycleTransition(id, 'restore', remote.etag, {});
  if (!t.ok) return { ok: false, reason: t.conflict ? 'conflict' : 'offline' };
  const doc = migrateProfile(structuredClone(archive.doc));
  await withProfileLock(id, async () => {
    const local = await repo.getProfile(id);
    const merged = mergeProfiles(local ? migrateProfile(local) : null, doc);
    await repo.saveProfile(merged);
  });
  deletedIds.delete(id);
  await setPendingTombstone(id, null); // any stale local intent is superseded
  return { ok: true, name: doc.name };
}

export async function purgeDeletedPlayer(id) {
  const remote = await getRemote(id);
  if (!remote.gone || remote.state !== 'deleted') return { ok: false, reason: 'not-deleted' };
  const t = await lifecycleTransition(id, 'purge', remote.etag, {});
  if (!t.ok) return { ok: false, reason: t.conflict ? 'conflict' : 'offline' };
  await setPendingTombstone(id, null);
  return { ok: true };
}

export async function getLifecycleConflicts() {
  const all = await getPendingTombstones();
  return Object.entries(all)
    .filter(([, i]) => i.status === 'conflict')
    .map(([id, i]) => ({ id, name: i.finalSnapshot?.name ?? id }));
}

// Grown-up resolution of a lifecycle conflict:
//  - 'delete': re-arm the intent against the CURRENT server state (adopt
//    its etag as the new base) and resolve — merges the snapshot in and
//    archives everything.
//  - 'keep': cancel the deletion; the snapshot merges back as a live
//    local profile and re-syncs normally.
export async function resolveLifecycleConflict(id, choice) {
  const all = await getPendingTombstones();
  const intent = all[id];
  if (!intent) return { ok: false };
  if (choice === 'keep') {
    if (intent.finalSnapshot) {
      const doc = migrateProfile(structuredClone(intent.finalSnapshot));
      await withProfileLock(id, async () => {
        const local = await repo.getProfile(id);
        const merged = mergeProfiles(local ? migrateProfile(local) : null, doc);
        await repo.saveProfile(merged);
      });
    }
    deletedIds.delete(id);
    await setPendingTombstone(id, null);
    return { ok: true, kept: true };
  }
  const remote = await getRemote(id);
  intent.baseEtag = remote.etag ?? null;
  intent.status = 'pending';
  await setPendingTombstone(id, intent);
  const r = await resolveTombstone(id, intent);
  return { ok: r.state === 'confirmed', state: r.state };
}

// One glance in Grown-Ups: is THIS device backing up, and when did it
// last succeed? (Timestamps are per-origin meta, like the switch itself.)
export async function getSyncStatus() {
  return {
    enabled: syncEnabled,
    lastPushAt: (await repo.getMeta('lastPushAt')) ?? null,
    lastPullAt: (await repo.getMeta('lastPullAt')) ?? null,
  };
}

// The family opted into backup if their server already holds profiles —
// but the on/off switch lives in per-origin browser storage, so a device
// (or the same device via the other address) can be silently dark. This
// probe powers a one-time "turn it on here too?" offer.
export async function offerBackup() {
  if (syncEnabled) return { offer: false };
  if ((await repo.getMeta('backupOfferDismissed')) === true) return { offer: false };
  const probe = await remoteBackupCount();
  if (probe.denied) return { offer: true, denied: true }; // server exists, key needed
  return { offer: probe.count > 0 };
}

export async function dismissBackupOffer() {
  await repo.setMeta('backupOfferDismissed', true);
}

// Pull remote profiles, merge them into local storage (never losing progress
// from either side), and push anything the server is missing. Returns the
// number of remote profiles found; safe to call offline (returns 0).
// Structured result: callers must never report success they can't prove.
// status: ok (everything confirmed) | partial (some pushes failed or some
// docs skipped) | offline (couldn't list) | empty (server reachable, no
// backups) | denied (auth — wired to UI with the family key, v1.38).
export async function syncNow() {
  const listing = await listRemote();
  if (listing.denied) return { status: 'denied', found: 0, pushed: 0, failed: 0, conflicts: [] };
  if (!listing.ok) return { status: 'offline', found: 0, pushed: 0, failed: 0, conflicts: [] };
  // durable offline deletions retry first (they may remove ids from play)
  const lifecycleConflicts = await resolvePendingTombstones();
  if (listing.ids.length) repo.setMeta('lastPullAt', Date.now());
  let pushed = 0;
  let failed = 0;
  let skipped = 0;
  let found = 0;
  for (const id of listing.ids) {
    try {
      const remote = await getRemote(id);
      if (remote.denied) return { status: 'denied', found, pushed, failed, conflicts: lifecycleConflicts };
      if (remote.gone) {
        // a tombstone always wins during automatic sync
        await applyRemoteDeletion(id);
        continue;
      }
      if (!remote.ok || !validProfileDoc(remote.doc) || !remote.doc?.id) {
        skipped += 1; // malformed or future-schema: never merged, never overwritten
        continue;
      }
      found += 1;
      const r = migrateProfile(structuredClone(remote.doc));
      // Under the profile's write lock: the local read and the merged write
      // are atomic w.r.t. concurrent saves (a kid answering questions).
      let toPush = null;
      await withProfileLock(r.id, async () => {
        const local = await repo.getProfile(r.id);
        const merged = mergeProfiles(local ? migrateProfile(local) : null, r);
        await repo.saveProfile(merged);
        // Heal on CONTENT difference, not timestamp order — a remote copy
        // with a newer save time can still be missing local-only progress
        // (the union differs). Canonical signature ignores array-order
        // noise so healing can't oscillate.
        if (local && profileSignature(merged) !== profileSignature(r)) toPush = merged;
      });
      if (toPush) {
        const res = await syncOneProfile(toPush);
        if (res.ok) {
          pushed += 1;
          repo.setMeta('lastPushAt', Date.now());
        } else if (res.denied) {
          return { status: 'denied', found, pushed, failed: failed + 1, conflicts: [] };
        } else {
          failed += 1;
        }
      }
    } catch {
      skipped += 1; // one bad doc must not abort the family's pass
    }
  }
  // Push local-only profiles — but NEVER after a partial listing (an
  // unseen profile is not an absent one), and never a deleted id.
  if (!listing.partial) {
    const remoteIds = new Set(listing.ids);
    const pending = await getPendingTombstones();
    for (const local of await listProfiles()) {
      if (deletedIds.has(local.id) || pending[local.id]) continue;
      if (!remoteIds.has(local.id)) {
        const res = await syncOneProfile(local);
        if (res.ok) {
          pushed += 1;
          repo.setMeta('lastPushAt', Date.now());
        } else if (res.denied) {
          return { status: 'denied', found, pushed, failed: failed + 1, conflicts: [] };
        } else if (!res.gone) {
          failed += 1;
          schedulePush(local);
        }
      }
    }
  }
  const status =
    failed > 0 || skipped > 0 || listing.partial
      ? 'partial'
      : listing.ids.length === 0 && lifecycleConflicts.length === 0
        ? 'empty'
        : 'ok';
  return { status, found, pushed, failed, conflicts: lifecycleConflicts };
}

export async function listProfiles() {
  const all = await repo.listProfiles();
  return all.map(migrateProfile).sort((a, b) => a.createdAt - b.createdAt);
}

export async function createProfile(name) {
  const profile = newProfile(name);
  await saveProfile(profile);
  return profile;
}

export async function loadProfile(id) {
  const doc = await repo.getProfile(id);
  return doc ? migrateProfile(doc) : null;
}

export async function saveProfile(profile) {
  if (deletedIds.has(profile.id)) return; // deletion already in progress
  profile.updatedAt = Date.now();
  // Merge with what's on disk before writing: a background pull that
  // landed while this screen held a stale in-memory copy is folded in
  // instead of clobbered. Serialized with syncNow through the same lock.
  const merged = await withProfileLock(profile.id, async () => {
    const disk = await repo.getProfile(profile.id);
    const out = disk ? mergeProfiles(migrateProfile(disk), profile) : profile;
    await repo.saveProfile(out);
    return out;
  });
  if (syncEnabled) schedulePush(merged);
}

// Delete a player. The final local progress is captured into a durable
// pending intent BEFORE anything is removed — verified in meta — so it
// always reaches the server archive, even offline or across restarts.
// Returns a truthful report for the confirming grown-up.
export async function deleteProfile(id) {
  clearTimeout(pushTimers.get(id));
  pushTimers.delete(id);
  deletedIds.add(id);
  let intent;
  await withProfileLock(id, async () => {
    const disk = await repo.getProfile(id);
    intent = {
      intentId: makeIntentId(),
      baseEtag: knownEtag(id),
      finalSnapshot: disk ? migrateProfile(disk) : null,
      status: 'pending',
    };
    await setPendingTombstone(id, intent); // committed + verified first
    await repo.deleteProfile(id);
    await repo.setMeta(`ui:${id}`, null);
  });
  const r = await resolveTombstone(id, intent).catch(() => ({ state: 'offline' }));
  if (r.state === 'conflict') {
    intent.status = 'conflict';
    await setPendingTombstone(id, intent);
  }
  return { localDeleted: true, remote: r.state };
}

// Merge externally-provided profile docs (file import) into local storage.
export async function importProfiles(docs) {
  let count = 0;
  for (const doc of docs) {
    if (!validProfileDoc(doc) || typeof doc.id !== 'string') continue;
    const incoming = migrateProfile(doc);
    const local = await repo.getProfile(incoming.id);
    const merged = mergeProfiles(local ? migrateProfile(local) : null, incoming);
    await repo.saveProfile(merged);
    if (syncEnabled) schedulePush(merged);
    count += 1;
  }
  return count;
}

// Per-profile UI preferences (collapsed sections etc.) — device-local meta,
// not part of the synced profile document. Cached in memory so a
// background re-render can never read a stale value while a set() is
// still in flight (that reverted a just-tapped section toggle).
const uiPrefsCache = new Map();
export async function getUiPrefs(profileId) {
  if (!uiPrefsCache.has(profileId)) {
    uiPrefsCache.set(profileId, (await repo.getMeta(`ui:${profileId}`)) ?? {});
  }
  return uiPrefsCache.get(profileId);
}

export async function setUiPrefs(profileId, prefs) {
  uiPrefsCache.set(profileId, prefs); // cache first — reads are coherent immediately
  await repo.setMeta(`ui:${profileId}`, prefs);
}

export async function getActiveProfileId() {
  return (await repo.getMeta('activeProfileId')) ?? null;
}

export async function setActiveProfileId(id) {
  await repo.setMeta('activeProfileId', id);
}
