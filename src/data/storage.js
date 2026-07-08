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
        out.push(JSON.parse(localStorage.getItem(k)));
      }
    }
    return out;
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

export async function openRepo() {
  try {
    const db = await openDb();
    return new IdbRepo(db);
  } catch {
    return new LocalRepo();
  }
}
