// Versioned profile schema. Bump SCHEMA_VERSION and add a migration step in
// migrateProfile() whenever the shape of stored data changes — this is the
// contract a future sync backend will rely on.

export const SCHEMA_VERSION = 12;

export const SUBJECT_DEFAULTS = {
  little: false,
  bridge: false,
  tables: true,
  childCanSwitch: false,
  hideSitting: false,
  limitTables: [],
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
    createdAt: Date.now(),
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
    // Cozy Corner companions earned along the bridge: { petId, milestone, at }
    petUnlocks: [],
    // Little-pup progression. xp fuels the tile trail; skills tracks real
    // per-quantity mastery, keyed "game:number" → { attempts, streak }
    // (streak = consecutive first-try corrects; 3+ means the child knows it
    // rather than guessed it — a guesser fakes that 3.7% of the time).
    little: { xp: 0, skills: {} },
    // Earned achievement badges: { [achievementId]: earnedAt }
    achievements: {},
    // Lifetime counters that feed the achievement ladders.
    stats: EMPTY_STATS(),
    // Wardrobe choices per dog: { [dogId]: { bandana: 'blue'|'none', ... } }.
    // Absent entry = default (wear earned gear in its first color).
    wear: {},
    // Paw Bucks: append-only transaction ledger (see engine/money.js).
    pawBucks: { txns: [] },
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
  return doc;
}

// Merges two versions of the same profile without losing progress from
// either side (used by family backup sync and file import). Per-fact: the
// richer stat wins (more attempts, then later lastSeen). Unlocks: union.
// Play counters: per-kind max. Name/avatar: from the more recently updated.
export function mergeProfiles(a, b) {
  if (!a) return b;
  if (!b) return a;
  const newer = (a.updatedAt ?? 0) >= (b.updatedAt ?? 0) ? a : b;
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
  // Cozy Corner: union by petId, keeping the earliest adoption.
  const petUnlocks = [...(a.petUnlocks ?? [])];
  for (const u of b.petUnlocks ?? []) {
    const seen = petUnlocks.find((x) => x.petId === u.petId);
    if (!seen) petUnlocks.push(u);
    else seen.at = Math.min(seen.at, u.at);
  }
  const unlocks = [...a.unlocks];
  for (const u of b.unlocks) {
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
    };
  }
  // Paw Bucks: union of transactions by id — spends can never be
  // resurrected and earns are never double-counted.
  const seenTxns = new Map();
  for (const t of [...(a.pawBucks?.txns ?? []), ...(b.pawBucks?.txns ?? [])]) {
    if (t?.id && !seenTxns.has(t.id)) seenTxns.set(t.id, t);
  }
  const pawBucks = { txns: [...seenTxns.values()].sort((x, y) => x.at - y.at) };
  // Wardrobe choices are cosmetic: the more recently updated doc wins per dog.
  const wear = { ...(a.updatedAt >= b.updatedAt ? b.wear : a.wear) ?? {}, ...(newer.wear ?? {}) };
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
  // Subjects follow the more recently updated doc (it's a parent setting);
  // little-pup xp never regresses.
  const subjects = { ...SUBJECT_DEFAULTS, ...(newer.subjects ?? {}) };
  const little = {
    xp: Math.max(a.little?.xp ?? 0, b.little?.xp ?? 0),
    // Per-skill richer-wins: the device that saw more tries / a longer
    // streak knows more; neither side's evidence is lost.
    skills: {},
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
    ...newer,
    subjects,
    little,
    schemaVersion: SCHEMA_VERSION,
    createdAt: Math.min(a.createdAt ?? Date.now(), b.createdAt ?? Date.now()),
    updatedAt: Math.max(a.updatedAt ?? 0, b.updatedAt ?? 0),
    facts,
    division,
    addition,
    petUnlocks,
    unlocks,
    play,
    speed,
    achievements,
    stats,
    wear,
    pawBucks,
  };
}
