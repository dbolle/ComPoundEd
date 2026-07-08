import { openRepo } from './storage.js';
import { newProfile, migrateProfile, mergeProfiles } from './schema.js';
import { pushProfile, pullProfiles, deleteRemoteProfile } from './sync.js';

let repo;
let syncEnabled = false;
const pushTimers = new Map();

export async function initStore() {
  repo = await openRepo();
  syncEnabled = (await repo.getMeta('syncEnabled')) === true;
}

export function isSyncEnabled() {
  return syncEnabled;
}

export async function setSyncEnabled(v) {
  syncEnabled = v === true;
  await repo.setMeta('syncEnabled', syncEnabled);
}

function schedulePush(profile) {
  clearTimeout(pushTimers.get(profile.id));
  pushTimers.set(
    profile.id,
    setTimeout(() => pushProfile(profile), 1500)
  );
}

// Pull remote profiles, merge them into local storage (never losing progress
// from either side), and push anything the server is missing. Returns the
// number of remote profiles found; safe to call offline (returns 0).
export async function syncNow() {
  const remote = await pullProfiles();
  for (const doc of remote) {
    if (!doc || !doc.id) continue;
    const r = migrateProfile(doc);
    const local = await repo.getProfile(r.id);
    const merged = mergeProfiles(local ? migrateProfile(local) : null, r);
    await repo.saveProfile(merged);
  }
  const remoteIds = new Set(remote.filter(Boolean).map((r) => r.id));
  for (const local of await listProfiles()) {
    if (!remoteIds.has(local.id)) pushProfile(local);
  }
  return remote.length;
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
  profile.updatedAt = Date.now();
  await repo.saveProfile(profile);
  if (syncEnabled) schedulePush(profile);
}

export async function deleteProfile(id) {
  await repo.deleteProfile(id);
  if (syncEnabled) await deleteRemoteProfile(id);
}

// Merge externally-provided profile docs (file import) into local storage.
export async function importProfiles(docs) {
  let count = 0;
  for (const doc of docs) {
    if (!doc || typeof doc.id !== 'string' || typeof doc.name !== 'string' || !doc.facts) continue;
    const incoming = migrateProfile(doc);
    const local = await repo.getProfile(incoming.id);
    const merged = mergeProfiles(local ? migrateProfile(local) : null, incoming);
    await repo.saveProfile(merged);
    if (syncEnabled) schedulePush(merged);
    count += 1;
  }
  return count;
}

export async function getActiveProfileId() {
  return (await repo.getMeta('activeProfileId')) ?? null;
}

export async function setActiveProfileId(id) {
  await repo.setMeta('activeProfileId', id);
}
