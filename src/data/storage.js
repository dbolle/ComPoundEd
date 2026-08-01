// Storage repository: IndexedDB with a localStorage fallback.
// Screens and the engine never touch storage directly — they go through
// store.js, which talks to this repository interface:
//   listProfiles, getProfile, saveProfile, deleteProfile, getMeta, setMeta
// A future cloud-sync backend implements the same interface.

const DB_NAME = 'compounded';
const DB_VERSION = 1;
const PROFILES = 'profiles';
const META = 'meta';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PROFILES)) {
        db.createObjectStore(PROFILES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(META)) {
        db.createObjectStore(META);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('IndexedDB blocked'));
  });
}

function tx(db, store, mode, fn) {
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const req = fn(t.objectStore(store));
    t.oncomplete = () => resolve(req ? req.result : undefined);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

class IdbRepo {
  constructor(db) {
    this.db = db;
  }
  listProfiles() {
    return tx(this.db, PROFILES, 'readonly', (s) => s.getAll());
  }
  getProfile(id) {
    return tx(this.db, PROFILES, 'readonly', (s) => s.get(id));
  }
  saveProfile(profile) {
    return tx(this.db, PROFILES, 'readwrite', (s) => s.put(profile));
  }
  deleteProfile(id) {
    return tx(this.db, PROFILES, 'readwrite', (s) => s.delete(id));
  }
  getMeta(key) {
    return tx(this.db, META, 'readonly', (s) => s.get(key));
  }
  setMeta(key, value) {
    return tx(this.db, META, 'readwrite', (s) => s.put(value, key));
  }
}

const LS_PREFIX = 'compounded:';

class LocalRepo {
  async listProfiles() {
    const out = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(`${LS_PREFIX}profile:`)) {
        try {
          out.push(JSON.parse(localStorage.getItem(k)));
        } catch {
          /* one corrupt entry must not kill the whole listing */
        }
      }
    }
    return out.filter(Boolean);
  }
  async getProfile(id) {
    const raw = localStorage.getItem(`${LS_PREFIX}profile:${id}`);
    return raw ? JSON.parse(raw) : undefined;
  }
  async saveProfile(profile) {
    localStorage.setItem(`${LS_PREFIX}profile:${profile.id}`, JSON.stringify(profile));
  }
  async deleteProfile(id) {
    localStorage.removeItem(`${LS_PREFIX}profile:${id}`);
  }
  async getMeta(key) {
    const raw = localStorage.getItem(`${LS_PREFIX}meta:${key}`);
    return raw ? JSON.parse(raw) : undefined;
  }
  async setMeta(key, value) {
    localStorage.setItem(`${LS_PREFIX}meta:${key}`, JSON.stringify(value));
  }
}

// The device-local monotonic meta sequence: a single counter BOTH
// backends can observe and continue (mirrored in localStorage even when
// IndexedDB is the live store), so a degraded session can't fork meta
// ordering back to an old value.
export function nextMetaSeq() {
  let n = 0;
  try {
    n = Number(localStorage.getItem(`${LS_PREFIX}metaseq`)) || 0;
  } catch {
    /* counting from 0 is safe: legacy plain values read as seq 0 */
  }
  const next = n + 1;
  try {
    localStorage.setItem(`${LS_PREFIX}metaseq`, String(next));
  } catch {
    /* best effort */
  }
  return next;
}

// Does the localStorage fallback hold data from a degraded session?
export function fallbackHoldings() {
  const profiles = [];
  const meta = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k?.startsWith(LS_PREFIX)) continue;
      if (k.startsWith(`${LS_PREFIX}profile:`)) profiles.push(k.slice(`${LS_PREFIX}profile:`.length));
      else if (k.startsWith(`${LS_PREFIX}meta:`)) meta.push(k.slice(`${LS_PREFIX}meta:`.length));
    }
  } catch {
    /* no localStorage: nothing to reconcile */
  }
  return { profiles, meta };
}

export function clearFallbackEntry(kind, key) {
  try {
    localStorage.removeItem(`${LS_PREFIX}${kind}:${key}`);
  } catch {
    /* best effort */
  }
}

// openRepo reports WHAT it opened. degraded = IndexedDB failed on a
// device where it previously worked (the marker) — the caller shows a
// persistent warning and requires acknowledgement before creating
// profiles. If localStorage is ALSO unavailable, storage: 'none' — no
// recoverable-fallback claim is made.
export async function openRepo() {
  let idbWorkedBefore = false;
  try {
    idbWorkedBefore = localStorage.getItem(`${LS_PREFIX}backend`) === 'idb';
  } catch {
    /* localStorage unavailable */
  }
  try {
    const db = await openDb();
    try {
      localStorage.setItem(`${LS_PREFIX}backend`, 'idb');
    } catch {
      /* marker is best effort */
    }
    return { repo: new IdbRepo(db), backend: 'idb', degraded: false };
  } catch {
    try {
      localStorage.setItem(`${LS_PREFIX}probe`, '1');
      localStorage.removeItem(`${LS_PREFIX}probe`);
    } catch {
      return { repo: null, backend: 'none', degraded: true };
    }
    return { repo: new LocalRepo(), backend: 'local', degraded: idbWorkedBefore };
  }
}
