// Versioned profile schema. Bump SCHEMA_VERSION and add a migration step in
// migrateProfile() whenever the shape of stored data changes — this is the
// contract a future sync backend will rely on.

import { epochOfId, mergeTxns } from '../engine/ledger.js';

export const SCHEMA_VERSION = 19;

// bridge/tables are TRI-STATE since v16: 'auto' (readiness engine decides,
// with any started track always visible) | true (parent forces) | false
// (parent hides). little stays a plain boolean — auto can't guess an age.
export const SUBJECT_DEFAULTS = {
  little: false,
  bridge: 'auto',
  tables: 'auto',
  // Money Math (v19): tri-state like bridge/tables — 'auto' lets the
  // readiness engine decide, and keeps the track visible once started.
  money: 'auto',
  childCanSwitch: false,
  hideSitting: false,
  limitTables: [],
  // Beta preview opt-in (parent-set; beta features are preservation-exempt)
  beta: false,
};

// v7-era flat achievement ids → stacked { family, tier } (schema v8).
const LEGACY_ACHIEVEMENTS = {
  'round-1': ['rounds', 1],
  'flash-1': ['flash', 1],
  'comeback-1': ['comeback', 1],
  'perfect-1': ['perfect', 1],
  'care-1': ['care', 1],
  'streak-5': ['streak', 1],
  'streak-10': ['streak', 2],
  'streak-25': ['streak', 3],
  'streak-50': ['streak', 4],
  'streak-100': ['streak', 5],
  'perfect-5': ['perfect', 2],
  'perfect-25': ['perfect', 3],
  'speed-60': ['speed', 2],
  'speed-40': ['speed', 3],
  'comeback-10': ['comeback', 2],
  'comeback-50': ['comeback', 3],
  'answers-100': ['answers', 1],
  'answers-500': ['answers', 2],
  'answers-1000': ['answers', 3],
  'care-10': ['care', 2],
  'care-50': ['care', 3],
  'carer-3': ['pals', 1],
  'carer-8': ['pals', 2],
  'sitter-1': ['sitter', 1],
  'sitter-10': ['sitter', 2],
  'pack-2': ['pack', 1],
  'pack-5': ['pack', 2],
  'pack-13': ['pack', 3],
  'pack-25': ['pack', 5],
  'table-1': ['tables', 1],
  'table-3': ['tables', 2],
  'table-6': ['tables', 3],
  'table-12': ['tables', 5],
  'div-1': ['division', 1],
  'div-12': ['division', 5],
  'facts-45': ['facts', 3],
  'facts-90': ['facts', 5],
};

export const EMPTY_STATS = () => ({
  rounds: 0,
  perfectRounds: 0,
  activities: 0,
  sittings: 0,
  comebacks: 0,
  fastAnswers: 0,
  braveTries: 0, // first-ever attempts at untried facts, right or wrong
  currentStreak: 0,
  bestStreak: 0,
  fastestPerfectMs: null,
});

// crypto.randomUUID only exists in secure contexts (https / localhost); the
// app is also served over plain http on the LAN, so fall back to building a
// v4 UUID from getRandomValues, which works everywhere.
function makeId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function newProfile(name) {
  return {
    id: makeId(),
    schemaVersion: SCHEMA_VERSION,
    name,
    avatarDogId: 'starter',
    // A chosen Cozy Corner pet buddy overrides the dog avatar (null = dog).
    avatarPetId: null,
    // Store gear placements: where each OWNED item sits (ownership itself
    // is derived from the Paw Bucks ledger's buy txns). null = closet.
    gear: { placements: {} },
    createdAt: Date.now(),
    // When parent settings / cosmetic choices last changed (subjects,
    // avatar, wear, gear placements). Merged separately from updatedAt so
    // a stale device saving progress can't revert another device's
    // setting change (v17).
    metaAt: Date.now(),
    // Per-fact Leitner stats, keyed by normalized fact key ("3x4"):
    // { attempts, correct, avgMs, box, lastSeen }
    facts: {},
    // Division-track stats (missing-factor → ÷), same key/shape as facts.
    // A family joins this track once its multiplication fact is mastered.
    division: {},
    // Earned dogs: { dogId, table, at } (table is null for the starter dog)
    unlocks: [{ dogId: 'starter', table: null, at: Date.now() }],
    // Pet-play counters, keyed by dogId: { walk, feed, fetch }
    play: {},
    // Typing/reading speed baseline from gimme facts (×0/×1), used to tune
    // the per-kid "fast answer" bar. samples < 5 → default bar applies.
    speed: { avgMs: 0, samples: 0 },
    // Which parts of the app this player sees (parent-set in Grown-Ups).
    // `little` switches to the preschool home; `bridge` shows the Adding
    // track; `tables` shows ×/÷; `childCanSwitch` lets the kid hop between
    // the little and big homes; `limitTables` empty = all tables.
    subjects: { ...SUBJECT_DEFAULTS },
    // Addition-track stats (the bridge, waves within 20), same shape as
    // facts, keyed "a+b" normalized (a ≤ b).
    addition: {},
    // Subtraction-track stats: one entry per fact family, keyed by the
    // addition fact it inverts ("4+8" covers 12−8 and 12−4).
    subtraction: {},
    // Money-track stats, keyed by the frozen skill ids in
    // engine/moneywaves.js ("coin:dime", "chg:75-100"). Same stat shape as
    // facts, but UNTIMED (see recordMoneyAnswer in engine/leitner.js).
    money: {},
    // Cozy Corner companions earned along the bridge: { petId, milestone, at }
    petUnlocks: [],
    // Little-pup progression. xp fuels the tile trail; skills tracks real
    // per-quantity mastery, keyed "game:number" → { attempts, streak }
    // (streak = consecutive first-try corrects; 3+ means the child knows it
    // rather than guessed it — a guesser fakes that 3.7% of the time).
    little: { xp: 0, skills: {}, revealed: [] },
    // Earned achievement badges: { [achievementId]: earnedAt }
    achievements: {},
    // Lifetime counters that feed the achievement ladders.
    stats: EMPTY_STATS(),
    // Wardrobe choices per dog: { [dogId]: { bandana: 'blue'|'none', ... } }.
    // Absent entry = default (wear earned gear in its first color).
    wear: {},
    // Paw Bucks: append-only transaction ledger (see engine/money.js).
    pawBucks: { txns: [], epoch: 1 },
    updatedAt: Date.now(),
  };
}

// Migrations must be additive — kids' progress on real devices flows through
// here on every load, and losing it is not an option (see CLAUDE.md).
export function migrateProfile(doc) {
  if (!doc) return doc;
  if (!doc.schemaVersion) doc.schemaVersion = 1;
  if (doc.schemaVersion === 1) {
    doc.play = doc.play ?? {};
    doc.schemaVersion = 2;
  }
  if (doc.schemaVersion === 2) {
    // Derive a plausible last-activity time so a stale device doesn't win
    // merges against fresher data.
    const seen = Object.values(doc.facts ?? {}).map((s) => s.lastSeen ?? 0);
    doc.updatedAt = doc.updatedAt ?? Math.max(doc.createdAt ?? 0, ...seen, 0);
    doc.schemaVersion = 3;
  }
  if (doc.schemaVersion === 3) {
    doc.speed = doc.speed ?? { avgMs: 0, samples: 0 };
    doc.schemaVersion = 4;
  }
  if (doc.schemaVersion === 4) {
    doc.division = doc.division ?? {};
    doc.schemaVersion = 5;
  }
  if (doc.schemaVersion === 5) {
    doc.achievements = doc.achievements ?? {};
    doc.stats = { ...EMPTY_STATS(), ...(doc.stats ?? {}) };
    doc.schemaVersion = 6;
  }
  if (doc.schemaVersion === 6) {
    doc.subjects = doc.subjects ?? { little: false };
    doc.little = doc.little ?? { xp: 0 };
    doc.schemaVersion = 7;
  }
  if (doc.schemaVersion === 7) {
    // Flat earned badges become stacked family tiers; every earned badge
    // maps to at least its equivalent tier, keeping the earliest earn date.
    const stacked = {};
    for (const [key, val] of Object.entries(doc.achievements ?? {})) {
      if (val && typeof val === 'object' && val.tier) {
        stacked[key] = val;
        continue;
      }
      const mapped = LEGACY_ACHIEVEMENTS[key];
      if (!mapped) continue;
      const [family, tier] = mapped;
      const prev = stacked[family];
      stacked[family] = {
        tier: Math.max(prev?.tier ?? 0, tier),
        at: Math.min(prev?.at ?? val, val),
      };
    }
    doc.achievements = stacked;
    doc.schemaVersion = 8;
  }
  if (doc.schemaVersion === 8) {
    doc.wear = doc.wear ?? {};
    doc.schemaVersion = 9;
  }
  if (doc.schemaVersion === 9) {
    doc.pawBucks = doc.pawBucks ?? { txns: [] };
    doc.schemaVersion = 10;
  }
  if (doc.schemaVersion === 10) {
    // Skills start empty even for high-xp kids: the range re-derives from
    // demonstrated first-try streaks (xp and unlocked tiles are untouched).
    doc.little = { xp: 0, ...(doc.little ?? {}) };
    doc.little.skills = doc.little.skills ?? {};
    doc.schemaVersion = 11;
  }
  if (doc.schemaVersion === 11) {
    doc.subjects = { ...SUBJECT_DEFAULTS, ...(doc.subjects ?? {}) };
    doc.addition = doc.addition ?? {};
    doc.petUnlocks = doc.petUnlocks ?? [];
    doc.schemaVersion = 12;
  }
  if (doc.schemaVersion === 12) {
    doc.subtraction = doc.subtraction ?? {};
    doc.schemaVersion = 13;
  }
  if (doc.schemaVersion === 13) {
    doc.avatarPetId = doc.avatarPetId ?? null;
    doc.schemaVersion = 14;
  }
  if (doc.schemaVersion === 14) {
    doc.gear = doc.gear ?? { placements: {} };
    doc.gear.placements = doc.gear.placements ?? {};
    doc.schemaVersion = 15;
  }
  if (doc.schemaVersion === 15) {
    // booleans → tri-state: everything becomes 'auto' (auto keeps any
    // started track visible, so no child sees less than before; parents
    // can still force/hide from Grown-Ups)
    doc.subjects = { ...doc.subjects };
    if (doc.subjects.bridge === true || doc.subjects.bridge === false) doc.subjects.bridge = 'auto';
    if (doc.subjects.tables === true || doc.subjects.tables === false) doc.subjects.tables = 'auto';
    doc.little = { xp: 0, skills: {}, ...(doc.little ?? {}) };
    doc.little.revealed = doc.little.revealed ?? [];
    doc.schemaVersion = 16;
  }
  if (doc.schemaVersion === 16) {
    // metaAt: settings/cosmetics change-time (see newProfile). Old docs
    // start it at their updatedAt — additive, nothing lost.
    doc.metaAt = doc.metaAt ?? doc.updatedAt ?? Date.now();
    doc.schemaVersion = 17;
  }
  if (doc.schemaVersion === 17) {
    // Store epoch (v18): a grown-up can give a player a fresh start in
    // the store. Purchases from earlier epochs are VOID — never charged,
    // never owned — while every earning still counts. Additive: existing
    // docs are epoch 1, which changes nothing.
    doc.pawBucks = { ...(doc.pawBucks ?? {}), epoch: doc.pawBucks?.epoch ?? 1 };
    doc.schemaVersion = 18;
  }
  if (doc.schemaVersion === 18) {
    // Money Math (v19): its own Leitner stat map beside addition/
    // subtraction, keyed by the frozen skill ids in engine/moneywaves.js.
    // Purely additive — an existing doc gains an empty map and the same
    // 'auto' subject default every other track has, so no child sees less
    // than they did yesterday.
    doc.money = doc.money ?? {};
    doc.subjects = { ...(doc.subjects ?? {}), money: doc.subjects?.money ?? 'auto' };
    doc.schemaVersion = 19;
  }
  // Defensive normalization (every version): known collections exist with
  // the right types whatever the input claimed; unknown fields pass
  // through untouched (no loss of known or unknown user data).
  const asMap = (x) => (x && typeof x === 'object' && !Array.isArray(x) ? x : {});
  const asArr = (x) => (Array.isArray(x) ? x : []);
  for (const k of ['facts', 'division', 'addition', 'subtraction', 'money', 'play', 'wear', 'achievements']) {
    doc[k] = asMap(doc[k]);
  }
  doc.unlocks = asArr(doc.unlocks);
  doc.petUnlocks = asArr(doc.petUnlocks);
  doc.pawBucks = {
    ...(doc.pawBucks ?? {}),
    txns: asArr(doc.pawBucks?.txns),
    epoch: Number.isInteger(doc.pawBucks?.epoch) && doc.pawBucks.epoch > 0 ? doc.pawBucks.epoch : 1,
  };
  doc.little = { xp: 0, skills: {}, revealed: [], ...asMap(doc.little) };
  doc.little.skills = asMap(doc.little.skills);
  doc.little.revealed = asArr(doc.little.revealed);
  doc.gear = { ...(doc.gear ?? {}), placements: asMap(doc.gear?.placements) };
  // Self-heal the v1.53.0-and-earlier merge bug: docs already on disk have
  // placements with no epoch stamp, which reads as epoch 1 and hides every
  // one of them. Stamp from THIS doc's own ledger, never from a merge
  // partner — a stale device then still resolves to its true epoch 1 and
  // its pre-reset placements are dropped by the merge, as they should be.
  // Only docs that actually have something placed are touched, so an empty
  // closet is never given a stamp it did not earn.
  if (doc.gear.placementEpoch == null && Object.values(doc.gear.placements).some((w) => w != null)) {
    let e = doc.pawBucks?.epoch ?? 1;
    for (const t of doc.pawBucks?.txns ?? []) {
      if (t?.reason !== 'buy') continue;
      const k = epochOfId(t.id ?? '');
      if (k > e) e = k;
    }
    doc.gear.placementEpoch = e;
  }
  doc.subjects = { ...SUBJECT_DEFAULTS, ...asMap(doc.subjects) };
  doc.speed = doc.speed && typeof doc.speed === 'object' ? doc.speed : { avgMs: 0, samples: 0 };
  doc.stats = asMap(doc.stats);
  return doc;
}

// Structural validation for anything arriving from outside this device
// (server pulls, file imports). Old schemas are welcome (migration's
// job); FUTURE schemas are rejected — an old device must not mangle a
// newer device's doc (the server copy is left untouched by callers).
// Lifecycle envelopes (v1.38 sync platform) are recognized and allowed.
// Structural sanity beyond types: a deeply nested or absurdly wide doc
// can blow the stack in canonical serialization before anything else
// gets a chance to reject it (audit M4).
const MAX_DEPTH = 12;
const MAX_NODES = 200_000;
export function structurallySane(value, maxDepth = MAX_DEPTH, maxNodes = MAX_NODES) {
  let nodes = 0;
  const walk = (v, depth) => {
    if (depth > maxDepth) return false;
    if (++nodes > maxNodes) return false; // every value counts, not just objects
    if (v === null || typeof v !== 'object') return true;
    for (const child of Array.isArray(v) ? v : Object.values(v)) {
      if (!walk(child, depth + 1)) return false;
    }
    return true;
  };
  return walk(value, 0);
}

export function validProfileDoc(doc) {
  if (!doc || typeof doc !== 'object') return false;
  if (!structurallySane(doc)) return false;
  if (doc.deleted === true || doc.state === 'deleted' || doc.state === 'purged') {
    return typeof doc.id === 'string'; // tombstone/lifecycle shapes
  }
  if (typeof doc.id !== 'string' || typeof doc.name !== 'string') return false;
  const v = doc.schemaVersion ?? 1;
  if (typeof v !== 'number' || !Number.isFinite(v) || v > SCHEMA_VERSION) return false;
  const isMap = (x) => x === undefined || x === null || (typeof x === 'object' && !Array.isArray(x));
  const isArr = (x) => x === undefined || x === null || Array.isArray(x);
  for (const k of ['facts', 'division', 'addition', 'subtraction', 'money', 'play', 'wear', 'achievements', 'little']) {
    if (!isMap(doc[k])) return false;
  }
  for (const k of ['unlocks', 'petUnlocks']) {
    if (!isArr(doc[k])) return false;
  }
  if (doc.pawBucks !== undefined && doc.pawBucks !== null) {
    if (typeof doc.pawBucks !== 'object' || !isArr(doc.pawBucks.txns)) return false;
  }
  return true;
}

// Marks a settings/cosmetics change (subjects, avatar, wear, placements)
// so merges keep the intended value even if a stale device saves later.
export function touchMeta(profile) {
  // strictly monotonic: two settings changes in the same millisecond
  // (e.g. profile creation + its subject choice) must still order — a
  // metaAt TIE resolves to the other doc and silently reverts the change
  profile.metaAt = Math.max(Date.now(), (profile.metaAt ?? 0) + 1);
}

// Merges two versions of the same profile without losing progress from
// either side (used by family backup sync and file import). Per-fact: the
// richer stat wins (more attempts, then later lastSeen). Unlocks: union.
// Play counters: per-kind max. Name/avatar: from the more recently updated.
export function mergeProfiles(a, b) {
  if (!a) return b;
  if (!b) return a;
  const newer = (a.updatedAt ?? 0) >= (b.updatedAt ?? 0) ? a : b;
  const older = newer === a ? b : a;
  // Settings/cosmetics follow the doc whose SETTINGS changed last, not the
  // doc that merely saved progress last (v17 metaAt).
  const metaOf = (d) => d.metaAt ?? d.updatedAt ?? 0;
  const metaNewer = metaOf(a) >= metaOf(b) ? a : b;
  const metaOlder = metaNewer === a ? b : a;
  const mergeStatMap = (ma = {}, mb = {}) => {
    const out = {};
    for (const key of new Set([...Object.keys(ma), ...Object.keys(mb)])) {
      const x = ma[key];
      const y = mb[key];
      if (!x || !y) {
        out[key] = x ?? y;
      } else {
        out[key] =
          x.attempts > y.attempts || (x.attempts === y.attempts && (x.lastSeen ?? 0) >= (y.lastSeen ?? 0))
            ? x
            : y;
      }
    }
    return out;
  };
  const facts = mergeStatMap(a.facts, b.facts);
  const division = mergeStatMap(a.division, b.division);
  const addition = mergeStatMap(a.addition, b.addition);
  const subtraction = mergeStatMap(a.subtraction, b.subtraction);
  // Money (v19). Merging it is only half the job — every merged map MUST
  // also appear in the returned object below, or `...newer` overwrites it
  // wholesale and the other device's progress vanishes with nothing to see.
  const money = mergeStatMap(a.money, b.money);
  // Cozy Corner: union by petId, keeping the earliest adoption.
  const petUnlocks = [...(a.petUnlocks ?? [])];
  for (const u of b.petUnlocks ?? []) {
    const seen = petUnlocks.find((x) => x.petId === u.petId);
    if (!seen) petUnlocks.push(u);
    else seen.at = Math.min(seen.at, u.at);
  }
  const unlocks = [...(a.unlocks ?? [])];
  for (const u of b.unlocks ?? []) {
    const existing = unlocks.find((x) => x.dogId === u.dogId);
    if (!existing) unlocks.push(u);
    else if (u.at < existing.at) existing.at = u.at;
  }
  const play = {};
  for (const dogId of new Set([...Object.keys(a.play ?? {}), ...Object.keys(b.play ?? {})])) {
    const x = a.play?.[dogId] ?? {};
    const y = b.play?.[dogId] ?? {};
    play[dogId] = {
      walk: Math.max(x.walk ?? 0, y.walk ?? 0),
      feed: Math.max(x.feed ?? 0, y.feed ?? 0),
      fetch: Math.max(x.fetch ?? 0, y.fetch ?? 0),
      groom: Math.max(x.groom ?? 0, y.groom ?? 0),
      train: Math.max(x.train ?? 0, y.train ?? 0),
    };
  }
  // Paw Bucks: commutative/associative/idempotent event union (v1.40):
  // matching payloads coalesce (at = min observed); conflicting payloads
  // for one id are ALL preserved and replay quarantines that id. Spends
  // can never be resurrected, earns never double-count, and
  // mergeProfiles(a,b) ≡ mergeProfiles(b,a).
  // The epoch RATCHETS: a reset done on one device can never be undone
  // by syncing with a device that hasn't seen it (and the voided
  // purchases stay voided everywhere).
  const pawBucks = {
    txns: mergeTxns(a.pawBucks?.txns ?? [], b.pawBucks?.txns ?? []),
    epoch: Math.max(a.pawBucks?.epoch ?? 1, b.pawBucks?.epoch ?? 1),
  };
  // Wardrobe choices are cosmetic: the doc with the newer settings-change
  // wins per dog.
  const wear = { ...(metaOlder.wear ?? {}), ...(metaNewer.wear ?? {}) };
  // Speed baseline: the better-calibrated side wins.
  const speed =
    (a.speed?.samples ?? 0) >= (b.speed?.samples ?? 0)
      ? (a.speed ?? { avgMs: 0, samples: 0 })
      : b.speed;
  // Achievements: highest tier per family wins, earliest earn date kept.
  const achievements = {};
  for (const id of new Set([
    ...Object.keys(a.achievements ?? {}),
    ...Object.keys(b.achievements ?? {}),
  ])) {
    const x = a.achievements?.[id];
    const y = b.achievements?.[id];
    if (!x || !y) {
      achievements[id] = x ?? y;
    } else {
      achievements[id] = {
        tier: Math.max(x.tier ?? 0, y.tier ?? 0),
        at: Math.min(x.at ?? Infinity, y.at ?? Infinity),
      };
    }
  }
  // Lifetime counters: the larger count wins per field (never regresses);
  // fastest time: the smaller non-null wins.
  const sa = { ...EMPTY_STATS(), ...(a.stats ?? {}) };
  const sb = { ...EMPTY_STATS(), ...(b.stats ?? {}) };
  const stats = { ...sa };
  for (const k of Object.keys(sa)) {
    if (k === 'fastestPerfectMs') {
      const vals = [sa[k], sb[k]].filter((v) => v != null);
      stats[k] = vals.length ? Math.min(...vals) : null;
    } else {
      stats[k] = Math.max(sa[k] ?? 0, sb[k] ?? 0);
    }
  }
  // Subjects follow the doc whose settings changed last (parent intent);
  // little-pup xp never regresses.
  const subjects = { ...SUBJECT_DEFAULTS, ...(metaNewer.subjects ?? {}) };
  // Gear placements are a preference (like wear): the doc with the newer
  // settings-change wins per item (null = closet, so removals propagate).
  //
  // The EPOCH has to travel with them. Dropping it here (through v1.53.0)
  // meant every merge produced a doc with placements but no stamp, and
  // `placementsFor()` reads a missing stamp as epoch 1 — so on any profile
  // whose parent had used "fresh start", every worn item silently vanished
  // on the next load. saveProfile() merges with disk on EVERY write, so it
  // was stripped constantly; the child saw her wearables return only after
  // placing something, because placeGear re-stamps.
  //
  // Only the placements made in the winning epoch are kept: a stale device
  // still holding pre-reset choices must not undo the fresh start (M5).
  const placementEpochOf = (d) => d.gear?.placementEpoch ?? 1;
  const gearEpoch = Math.max(placementEpochOf(a), placementEpochOf(b));
  const atEpoch = (d) => (placementEpochOf(d) === gearEpoch ? (d.gear?.placements ?? {}) : {});
  const gear = {
    placements: { ...atEpoch(metaOlder), ...atEpoch(metaNewer) },
    placementEpoch: gearEpoch,
  };
  const little = {
    xp: Math.max(a.little?.xp ?? 0, b.little?.xp ?? 0),
    // Per-skill richer-wins: the device that saw more tries / a longer
    // streak knows more; neither side's evidence is lost.
    skills: {},
    // reveals are a ratchet: union, never removed
    revealed: [...new Set([...(a.little?.revealed ?? []), ...(b.little?.revealed ?? [])])],
  };
  const skillKeys = new Set([
    ...Object.keys(a.little?.skills ?? {}),
    ...Object.keys(b.little?.skills ?? {}),
  ]);
  for (const k of skillKeys) {
    const x = a.little?.skills?.[k] ?? {};
    const y = b.little?.skills?.[k] ?? {};
    little.skills[k] = {
      attempts: Math.max(x.attempts ?? 0, y.attempts ?? 0),
      streak: Math.max(x.streak ?? 0, y.streak ?? 0),
    };
  }
  return {
    // unknown/extension fields from BOTH sides survive (the newer doc
    // wins on collision) — "no loss of known or unknown user data"
    ...older,
    ...newer,
    subjects,
    little,
    schemaVersion: SCHEMA_VERSION,
    createdAt: Math.min(a.createdAt ?? Date.now(), b.createdAt ?? Date.now()),
    updatedAt: Math.max(a.updatedAt ?? 0, b.updatedAt ?? 0),
    metaAt: Math.max(metaOf(a), metaOf(b)),
    avatarDogId: metaNewer.avatarDogId ?? newer.avatarDogId,
    avatarPetId: metaNewer.avatarPetId ?? null,
    facts,
    division,
    addition,
    subtraction,
    money,
    petUnlocks,
    unlocks,
    play,
    speed,
    achievements,
    stats,
    wear,
    gear,
    pawBucks,
  };
}
