// Groups! — equal groups and arrays (CCSS 2.OA.4). The domain logic for the
// game that actually tests UNITIZING, and the reason it looks nothing like
// the skip-count game next to it.
//
// The pedagogy is the constraint (docs/PEDAGOGY.md §3): skip counting is not
// multiplicative reasoning. The prerequisite is constructing COMPOSITE UNITS
// — coming to see a group as one thing that can itself be counted — and a
// child who recites 3, 6, 9, 12 may still not be able to say how many
// *groups* they counted. So:
//
//   1. Every item asks THREE things — how many groups, how big a group, and
//      the total — and only an all-three-right first try builds a streak.
//      A fast total can never stand in for the structure. That is the whole
//      point of the module, and it is mechanical (see recordGroupAttempt),
//      not a matter of the UI remembering to be careful.
//   2. The identity is the FACTOR PAIR (`groups:3x4`), never the total:
//      3×4 and 2×6 are different structures that happen to share 12.
//   3. Orientation is presentation, not identity. 3 baskets of 4 and 4
//      baskets of 3 are the same thing to know and two different things to
//      look at, so `orientationFor()` picks one deterministically while
//      `groupKey()` collapses both onto one skill.
//   4. UNTIMED. Unitizing is not a speed skill and the little track has no
//      timing anywhere — nothing here reads or writes a clock.
//
// No DOM, no imports from src/screens/**: `buildGroupQuestion()` returns
// plain data and the screen decides what a basket looks like.
//
// Storage note: progress lives in the EXISTING `profile.little.skills` map
// under `groups:<g>x<s>` → { attempts, streak }, the same two-field shape
// every little game writes. Nothing new in the profile shape, so no
// SCHEMA_VERSION bump and no migration — and because `mergeProfiles()`
// merges those two fields by max, neither the ladder nor mastery can go
// backwards across a family sync.

// --- the finite catalogue ---------------------------------------------------
// 2.OA.4 says "up to 5 rows and up to 5 columns"; 1 group (and groups of 1)
// teaches nothing about unitizing, so the domain is 2..5 both ways. With
// canonical ordering g <= s that is exactly 10 identities.
export const GROUP_MIN = 2;
export const GROUP_MAX = 5;
export const GROUPS_NS = 'groups';

// Same rule the little games use: 3 first-try corrects in a row means the
// child knows it rather than guessed it (see `knows` in readiness.js).
export const KNOWN_STREAK = 3;

// The errorless-introduction ladder: teach, then hide the scaffold, then
// recall. Two attempts per rung before the next one opens.
export const TEACH_STAGE = 1;
export const PICTURE_STAGE = 2;
export const RECALL_STAGE = 3;
export const STAGE_ATTEMPTS = 2;

// The three questions every item asks, in the order it asks them.
export const GROUP_PARTS = ['groups', 'size', 'total'];
export const CHOICE_COUNT = 3;

const mk = (g, s) =>
  Object.freeze({ g, s, pair: `${g}x${s}`, key: `${GROUPS_NS}:${g}x${s}`, total: g * s });

export const GROUP_IDENTITIES = Object.freeze(
  (() => {
    const out = [];
    for (let g = GROUP_MIN; g <= GROUP_MAX; g++) {
      for (let s = g; s <= GROUP_MAX; s++) out.push(mk(g, s));
    }
    return out;
  })()
);

// Handy pinned projections. GROUP_PAIRS is the `domain: { set: [...] }` the
// trail registry record wants; GROUP_SKILL_KEYS is what the game can ever
// write into little.skills.
export const GROUP_PAIRS = Object.freeze(GROUP_IDENTITIES.map((i) => i.pair));
export const GROUP_SKILL_KEYS = Object.freeze(GROUP_IDENTITIES.map((i) => i.key));

const BY_KEY = new Map(GROUP_IDENTITIES.map((i) => [i.key, i]));

// Canonicalises orientation, exactly as `normKey` in leitner.js does for the
// tables: 3 groups of 4 and 4 groups of 3 map to ONE identity.
export function groupKey(g, s) {
  const [lo, hi] = g <= s ? [g, s] : [s, g];
  return `${GROUPS_NS}:${lo}x${hi}`;
}

// Resolve anything that names an identity: (g, s), { g, s },
// { groups, size }, 'groups:3x4', '3x4', or an identity itself.
// Returns null for anything outside the catalogue — an unknown identity is a
// caller bug, not a new skill key to invent.
export function groupIdentity(a, b) {
  if (b !== undefined) {
    const g = Number(a);
    const s = Number(b);
    return Number.isFinite(g) && Number.isFinite(s) ? (BY_KEY.get(groupKey(g, s)) ?? null) : null;
  }
  if (typeof a === 'string') {
    const m = /(\d+)\s*x\s*(\d+)/.exec(a);
    return m ? groupIdentity(Number(m[1]), Number(m[2])) : null;
  }
  if (a && typeof a === 'object') {
    if (typeof a.key === 'string' && BY_KEY.has(a.key)) return BY_KEY.get(a.key);
    if (a.g !== undefined && a.s !== undefined) return groupIdentity(a.g, a.s);
    if (a.groups !== undefined && a.size !== undefined) return groupIdentity(a.groups, a.size);
  }
  return null;
}

// --- profile reads (the existing little.skills shape) ----------------------

const skillOf = (p, key) => p?.little?.skills?.[key] ?? { attempts: 0, streak: 0 };

export function groupAttempts(profile, identity) {
  const id = groupIdentity(identity);
  return id ? (skillOf(profile, id.key).attempts ?? 0) : 0;
}

export function groupStreak(profile, identity) {
  const id = groupIdentity(identity);
  return id ? (skillOf(profile, id.key).streak ?? 0) : 0;
}

export function identityKnown(profile, identity) {
  return groupStreak(profile, identity) >= KNOWN_STREAK;
}

// How many of the 10 identities the child knows.
export function groupsKnown(profile) {
  return GROUP_IDENTITIES.filter((i) => identityKnown(profile, i)).length;
}

// Meter data, waves.js shape (done/total/points/maxPoints) so a progress bar
// moves from the first good answer even though "known" needs the full streak.
// The denominator is the catalogue: 10.
export function groupsProgress(profile) {
  let done = 0;
  let points = 0;
  const known = [];
  for (const i of GROUP_IDENTITIES) {
    const streak = groupStreak(profile, i);
    if (streak >= KNOWN_STREAK) {
      done += 1;
      known.push(i.key);
    }
    points += Math.min(streak, KNOWN_STREAK);
  }
  return {
    done,
    total: GROUP_IDENTITIES.length,
    points,
    maxPoints: GROUP_IDENTITIES.length * KNOWN_STREAK,
    known,
    frontier: nextGroupIdentity(profile),
  };
}

export function groupsFinished(profile) {
  return groupsKnown(profile) === GROUP_IDENTITIES.length;
}

// The next identity worth asking: least practised first, smallest total as
// the tie-break, so a child meets 2 groups of 2 before 5 groups of 5 and
// nothing already known gets in the way of the frontier.
export function nextGroupIdentity(profile) {
  let best = null;
  let bestRank = Infinity;
  for (const i of GROUP_IDENTITIES) {
    if (identityKnown(profile, i)) continue;
    const rank = groupStreak(profile, i) * 100 + i.total;
    if (rank < bestRank) {
      bestRank = rank;
      best = i;
    }
  }
  return best;
}

// --- the errorless-introduction ladder ------------------------------------
// stage 1: picture + repeated-addition sentence visible (TEACH-ONLY — the
//          sentence contains the answers, so a first try there proves
//          reading, not knowing).
// stage 2: picture, sentence hidden — the child builds the sentence.
// stage 3: recall — no picture, no sentence.
//
// Derived from `attempts` alone, deliberately: attempts is a field that
// already exists and that merge takes the MAX of, so the ladder is
// monotone by construction — it advances after STAGE_ATTEMPTS tries at the
// rung below and can never regress, not even after a cross-device merge.
export function groupStage(profile, identity) {
  const attempts = groupAttempts(profile, identity);
  return Math.min(RECALL_STAGE, TEACH_STAGE + Math.floor(attempts / STAGE_ATTEMPTS));
}

export const isTeachOnlyStage = (stage) => stage === TEACH_STAGE;

// --- presentation ---------------------------------------------------------

// Both orientations are PRESENTABLE while mastery is one identity: seed 0
// shows the canonical g groups of s, seed 1 shows the flip. Seeded, never
// randomised — this whole module is deterministic, so a caller can
// reproduce any item — and the default seed is the attempt count, which
// alternates the two views as the child works.
export function orientationFor(identity, seed = 0) {
  const id = groupIdentity(identity);
  if (!id) return null;
  const n = Math.abs(Math.trunc(Number(seed) || 0));
  const flipped = id.g !== id.s && n % 2 === 1;
  return {
    groups: flipped ? id.s : id.g,
    size: flipped ? id.g : id.s,
    flipped,
    total: id.total,
  };
}

// The repeated-addition sentence for a presented orientation: 3 groups of 4
// is "4 + 4 + 4" (three copies of the group), which is the sentence that
// makes the group the thing being counted.
export function repeatedAddition(groups, size) {
  return Array.from({ length: groups }, () => size).join(' + ');
}

// Kid-register containers and treats (docs/VOCABULARY.md: concrete
// dog-world words). Picked deterministically so a re-render is stable.
const CONTAINERS = Object.freeze([
  { icon: '🧺', one: 'basket', many: 'baskets' },
  { icon: '🥣', one: 'bowl', many: 'bowls' },
  { icon: '📦', one: 'box', many: 'boxes' },
]);
const ITEMS = Object.freeze(['🦴', '🎾', '🍖', '🍎']);

const pick = (list, n) => list[Math.abs(Math.trunc(n)) % list.length];
const rotate = (arr, n) => {
  const k = arr.length ? Math.abs(Math.trunc(n)) % arr.length : 0;
  return [...arr.slice(k), ...arr.slice(0, k)];
};

// Three distinct positive options per part, correct answer always included.
// The distractors are the real errors, not noise: the total offered when the
// question asked for the group COUNT (the conflation this game exists to
// catch), the two factors offered for the total, and one group too few.
function choicesFor(part, { groups, size, total }, seed) {
  const wanted = { groups, size, total }[part];
  const candidates =
    part === 'total'
      ? [total, groups + size, total - size, total + size]
      : part === 'groups'
        ? [groups, total, size, groups + 1]
        : [size, total, groups, size + 1];
  const out = [];
  for (const c of candidates) {
    if (c > 0 && Number.isInteger(c) && !out.includes(c)) out.push(c);
    if (out.length === CHOICE_COUNT) break;
  }
  for (let extra = 1; out.length < CHOICE_COUNT; extra++) {
    if (!out.includes(wanted + extra)) out.push(wanted + extra);
  }
  // ascending, then rotated by seed: the right answer is never parked in the
  // same slot, and the order is still reproducible from the seed
  return rotate([...out].sort((a, b) => a - b), seed);
}

// Wording per stage. Picture stages read the structure off the picture;
// recall asks the triad in all three directions (two quantities given, one
// missing), which is the missing-factor form the division track uses — so
// even at recall the total on its own is never enough.
function partsFor(stage, view, container) {
  const { groups, size, total } = view;
  if (stage === RECALL_STAGE) {
    return [
      { id: 'groups', answer: groups, ask: `❓ groups of ${size} make ${total}`, say: `How many groups of ${size} make ${total}?` },
      { id: 'size', answer: size, ask: `${groups} groups of ❓ make ${total}`, say: `${groups} equal groups make ${total}. How many in each group?` },
      { id: 'total', answer: total, ask: `${groups} groups of ${size} make ❓`, say: `${groups} groups of ${size}. How many altogether?` },
    ];
  }
  return [
    { id: 'groups', answer: groups, ask: `How many ${container.many}?`, say: `How many ${container.many}?` },
    { id: 'size', answer: size, ask: `How many in each ${container.one}?`, say: `How many in each ${container.one}?` },
    { id: 'total', answer: total, ask: 'How many altogether?', say: 'How many altogether?' },
  ];
}

// A three-part item, as plain data. The UI draws the baskets; nothing here
// generates markup.
export function buildGroupQuestion(profile, identity, stage, seed) {
  const id = groupIdentity(identity) ?? nextGroupIdentity(profile) ?? GROUP_IDENTITIES[0];
  const st = Math.min(RECALL_STAGE, Math.max(TEACH_STAGE, Math.trunc(Number(stage)) || groupStage(profile, id)));
  const sd = Number.isFinite(Number(seed)) && seed !== undefined && seed !== null
    ? Math.abs(Math.trunc(Number(seed)))
    : groupAttempts(profile, id);
  const view = orientationFor(id, sd);
  const container = pick(CONTAINERS, sd + id.g);
  const item = pick(ITEMS, sd + id.s);
  const teachOnly = isTeachOnlyStage(st);
  return {
    kind: 'groups',
    key: id.key,
    skill: id.key, // what little.js writes into little.skills
    pair: id.pair,
    identity: { g: id.g, s: id.s },
    // the presented orientation (may be the flip of the identity)
    groups: view.groups,
    size: view.size,
    flipped: view.flipped,
    total: view.total,
    addends: Array.from({ length: view.groups }, () => view.size),
    sentence: repeatedAddition(view.groups, view.size),
    statement: `${view.groups} groups of ${view.size}`,
    stage: st,
    seed: sd,
    // stage 1 SHOWS the answers, so it can only ever teach
    teachOnly,
    showPicture: st !== RECALL_STAGE,
    showSentence: st === TEACH_STAGE,
    timed: false, // untimed by design; no speed component anywhere
    container,
    item,
    parts: partsFor(st, view, container).map((p) => ({
      ...p,
      choices: choicesFor(p.id, view, sd + GROUP_PARTS.indexOf(p.id)),
    })),
    answers: { groups: view.groups, size: view.size, total: view.total },
  };
}

// --- grading and recording ------------------------------------------------

const asQuestion = (profile, q) =>
  q && Array.isArray(q.parts) ? q : buildGroupQuestion(profile, q);

// Grade a whole item. `answers` are the child's FIRST answer per part
// ({ groups, size, total }); a part left unanswered counts as wrong.
export function gradeGroupQuestion(question, answers = {}) {
  const parts = {};
  const wrong = [];
  for (const p of question.parts ?? []) {
    const given = answers?.[p.id];
    const ok = given !== undefined && given !== null && Number(given) === p.answer;
    parts[p.id] = ok;
    if (!ok) wrong.push(p.id);
  }
  return { parts, wrong, allCorrect: wrong.length === 0 };
}

// Record one item against the identity. THE anti-shortcut rule lives here:
// the streak advances only when ALL THREE parts were right on the first try,
// so a correct total with a wrong group count masters nothing — it resets.
// Teach-only items (stage 1) count attempts, which is what walks the ladder,
// but never touch the streak in either direction — the same semantics
// little.js gives `dataset.teachOnly` in recordSkill().
export function recordGroupAttempt(profile, question, answers = {}) {
  const q = asQuestion(profile, question);
  const id = groupIdentity(q.key);
  if (!id) return null;
  const graded = gradeGroupQuestion(q, answers);
  // recomputed rather than trusted: stage 1 is teach-only whatever the
  // caller says, because the sentence on screen contains the answers
  const teachOnly = q.stage === TEACH_STAGE || q.teachOnly === true;

  if (!profile.little) profile.little = { xp: 0, skills: {}, revealed: [] };
  profile.little.skills = profile.little.skills ?? {};
  const sk = (profile.little.skills[id.key] = profile.little.skills[id.key] ?? {
    attempts: 0,
    streak: 0,
  });
  const before = sk.streak ?? 0;
  sk.attempts = (sk.attempts ?? 0) + 1;
  if (!teachOnly) sk.streak = graded.allCorrect ? before + 1 : 0;

  return {
    key: id.key,
    stage: q.stage,
    teachOnly,
    ...graded,
    attempts: sk.attempts,
    streak: sk.streak,
    known: sk.streak >= KNOWN_STREAK,
    becameKnown: before < KNOWN_STREAK && sk.streak >= KNOWN_STREAK,
    nextStage: groupStage(profile, id),
  };
}

// --- readiness ------------------------------------------------------------
// Duplicated one-liners rather than an import: readiness.js does not export
// these, and this module must stay downstream of nothing (same reason
// little.js keeps its own `knows`).
const knows = (p, ns, n) => (p?.little?.skills?.[`${ns}:${n}`]?.streak ?? 0) >= KNOWN_STREAK;
const hasHistory = (map) => Object.values(map ?? {}).some((s) => (s.attempts ?? 0) > 0 || s.seen);

// Equal groups sit between skip counting and the tables: counting by 2s and
// 5s is the warm-up this builds on. Mid-trail inference first, exactly as
// `addingReady` does it (v1.41): a child with REAL ×/÷ history has proven
// everything the counting gates test, and must not sit behind them. This is
// a READINESS/VISIBILITY answer only — it never writes skills or coins.
export function groupsReady(p) {
  if (hasHistory(p?.facts) || hasHistory(p?.division)) return true;
  return knows(p, 'path', 2) && knows(p, 'path', 5);
}
