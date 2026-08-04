// The trail registry — one machine-readable record per thing a child can
// learn, and the single source of truth for the parallel maps that used to
// drift apart in little.js.
//
// Why this exists: the same game was described in five places (question
// count, play kind, praise, which skills it records, which numbers those
// skills cover) and each had to be edited by hand. Two of the four
// defects in v1.47.3 were exactly that drift — `taway` recorded
// `takeaway:n` while its domain said `taway`, and `paths` recorded
// `path:<stride>` with no domain at all, so the frontier picker believed
// one game was never learned and the other was always finished. A record
// with the skill namespaces written down cannot disagree with itself.
//
// docs/TRAIL.md documents this file; tests/trail.spec.js pins them
// together, and pins the derived maps against a fixture of the literals
// they replaced so the extraction stays behaviour-preserving.
//
// This module must not import from src/screens/** — little.js deliberately
// duplicates `knows` to avoid a cycle, and the registry is downstream of
// nothing.

// `skills[]` entries:
//   ns       the key prefix actually written by the game (`path`, not `paths`)
//   domain   [lo, hi] range, or { set: [...] } for a finite set of keys
//   streak   first-try corrects in a row that count as knowing it
//   required true if it gates "this game is finished" and the milestone
const R = (rec) => ({ type: 'little-game', status: 'shipped', timed: false, ...rec });

export const TRAIL = [
  R({
    id: 'count',
    labels: { kid: 'Count it!', icon: '🦴', grownup: 'count objects 1–10, cardinality' },
    standards: ['K.CC.4', 'K.CC.5'],
    questions: 5,
    playKind: 'fetch',
    tracked: true,
    skills: [{ ns: 'count', domain: [1, 10], streak: 3, required: true }],
    praise: ['Hooray! Great counting!', 'Wow! You counted them all!'],
    milestones: ['count3', 'count5'],
    revealId: 'tile:count',
  }),
  R({
    id: 'tap',
    labels: { kid: 'Tap it!', icon: '👆', grownup: 'one-to-one correspondence (errorless)' },
    standards: ['K.CC.4'],
    questions: 3,
    playKind: 'fetch',
    tracked: false, // errorless joy — never feeds the signal
    skills: [],
    praise: ['Hooray! Great counting!', 'You counted every single one!'],
    milestones: [],
    revealId: 'tile:tap',
  }),
  R({
    id: 'find',
    labels: { kid: 'Find it!', icon: '5️⃣', grownup: 'numeral → quantity' },
    standards: ['K.CC.3'],
    questions: 5,
    playKind: 'walk',
    tracked: true,
    skills: [{ ns: 'find', domain: [1, 10], streak: 3, required: true }],
    praise: ['You found all the numbers!', 'Hooray! Super number finding!'],
    milestones: [],
    revealId: 'tile:find',
  }),
  R({
    id: 'feed',
    labels: { kid: 'Feed it!', icon: '🥣', grownup: 'count OUT a quantity' },
    standards: ['K.CC.5'],
    questions: 3,
    playKind: 'feed',
    tracked: true,
    skills: [{ ns: 'feed', domain: [1, 10], streak: 3, required: true }],
    praise: ['Yum yum! Perfectly fed!', 'Hooray! What a good helper!'],
    milestones: [],
    revealId: 'tile:feed',
  }),
  R({
    id: 'more',
    labels: { kid: 'Who has more?', icon: '⚖️', grownup: 'compare quantities' },
    standards: ['K.CC.6'],
    questions: 5,
    playKind: 'feed',
    tracked: true,
    // two choices are guessable 50/50 — a longer streak to count as knowing
    skills: [{ ns: 'more', domain: [2, 10], streak: 4, required: true }],
    praise: ['Great comparing!', 'You always knew who had more!'],
    milestones: [],
    revealId: 'tile:more',
  }),
  R({
    id: 'shape',
    labels: { kid: 'Find the shape!', icon: '🔺', grownup: 'shape identification (errorless)' },
    standards: ['K.G.2'],
    questions: 5,
    playKind: 'walk',
    tracked: false,
    skills: [],
    praise: ['Hooray! You know your shapes!', 'Super shape spotting!'],
    milestones: [],
    revealId: 'tile:shape',
  }),
  R({
    id: 'pattern',
    labels: { kid: "What's next?", icon: '🔁', grownup: 'repeating patterns (errorless)' },
    standards: [],
    questions: 5,
    playKind: 'feed',
    tracked: false,
    skills: [],
    praise: ['Pattern power! Amazing!', 'You cracked every pattern!'],
    milestones: [],
    revealId: 'tile:pattern',
  }),
  R({
    id: 'next',
    labels: { kid: 'What comes next?', icon: '🔢', grownup: 'number sequence to 10' },
    standards: ['K.CC.2'],
    questions: 5,
    playKind: 'walk',
    tracked: true,
    skills: [{ ns: 'next', domain: [4, 10], streak: 3, required: true }],
    praise: ['You know what comes next!', 'Hooray! Number detective!'],
    milestones: [],
    revealId: 'tile:next',
  }),
  R({
    id: 'add',
    labels: { kid: 'Add it!', icon: '➕', grownup: 'adding within 10' },
    standards: ['K.OA.2'],
    questions: 5,
    playKind: 'fetch',
    tracked: true,
    skills: [{ ns: 'add', domain: [2, 10], streak: 3, required: true }],
    praise: ['Hooray! Great adding!', 'Wow! You put them all together!'],
    milestones: [],
    revealId: 'tile:add',
  }),
  R({
    id: 'look',
    labels: { kid: 'Quick Look', icon: '👀', grownup: 'subitizing (ten-frame flash)' },
    standards: ['K.CC.4'],
    questions: 5,
    playKind: 'walk',
    tracked: true,
    skills: [{ ns: 'look', domain: [1, 10], streak: 3, required: true }],
    praise: ['Quick eyes! Amazing!', 'You saw it in a flash!'],
    milestones: ['look'],
    revealId: 'tile:look',
  }),
  R({
    id: 'bond',
    labels: { kid: 'Number friends', icon: '🧩', grownup: 'number bonds of 5 and 10' },
    standards: ['K.OA.3', 'K.OA.4', '1.OA.6'],
    questions: 5,
    playKind: 'feed',
    tracked: true,
    skills: [
      { ns: 'bond5', domain: [0, 5], streak: 3, required: true },
      { ns: 'bond10', domain: [0, 10], streak: 3, required: true },
    ],
    praise: ['Number friends forever!', 'You know the number friends!'],
    milestones: ['bond5', 'bond10'],
    revealId: 'tile:bond',
  }),
  R({
    id: 'teen',
    labels: { kid: 'Teen numbers', icon: '1️⃣', grownup: 'ten and some more' },
    standards: ['K.NBT.1'],
    questions: 5,
    playKind: 'fetch',
    tracked: true,
    skills: [{ ns: 'teen', domain: [1, 9], streak: 3, required: true }],
    praise: ['Teen numbers, no problem!', 'Ten and more — you got it!'],
    milestones: ['teen'],
    revealId: 'tile:teen',
  }),
  R({
    id: 'type',
    labels: { kid: 'Type it!', icon: '⌨️', grownup: 'numeral transcription (numpad bridge)' },
    standards: ['K.CC.3', '1.NBT.1'],
    questions: 5,
    playKind: 'walk',
    tracked: true,
    skills: [{ ns: 'type', domain: [1, 19], streak: 3, required: true }],
    praise: ['Typing champion!', 'You typed it just right!'],
    milestones: ['type'],
    revealId: 'tile:type',
  }),
  R({
    id: 'taway',
    labels: { kid: 'Take away!', icon: '🥣', grownup: 'concrete subtraction' },
    standards: ['K.OA.1', 'K.OA.2'],
    questions: 5,
    playKind: 'feed',
    tracked: true,
    // records `takeaway:n`, NOT `taway:n` — the mismatch that made this
    // game look permanently unlearned before v1.47.3
    skills: [{ ns: 'takeaway', domain: [0, 9], streak: 3, required: true }],
    // rangeFor() looks its band up by GAME id, so a game whose namespace
    // differs from its id has to say the range out loud or it would
    // silently fall back to 1–10.
    rangeDomain: [0, 9],
    praise: ['Take-away champion!', 'You knew how many were left!'],
    milestones: ['taway'],
    revealId: 'tile:taway',
  }),
  R({
    id: 'paths',
    labels: { kid: 'Counting paths', icon: '🐾', grownup: 'skip-count chains (tables connector)' },
    standards: ['2.NBT.2'],
    questions: 5,
    playKind: 'fetch',
    tracked: true,
    // one key per stride, not a range — and the tables gate depends on
    // all three, so a missing domain here hid the whole game (v1.47.3)
    skills: [{ ns: 'path', domain: { set: [2, 5, 10] }, streak: 3, required: true }],
    praise: ['Path finder! Amazing!', 'You hopped the whole path!'],
    milestones: ['paths'],
    revealId: 'tile:paths',
  }),
  R({
    id: 'trace',
    labels: { kid: 'Trace it!', icon: '✏️', grownup: 'digit formation 1–9' },
    standards: ['K.CC.3'],
    questions: 4, // a careful finger-trace takes a 3yo ~4× a tap
    playKind: 'walk',
    tracked: true,
    skills: [{ ns: 'trace', domain: [1, 9], streak: 3, required: true }],
    praise: ['Number writer!', 'You traced it just right!'],
    milestones: ['trace'],
    revealId: 'tile:trace',
  }),
  R({
    id: 'surprise',
    labels: { kid: 'Surprise!', icon: '🎁', grownup: 'interleaved practice over revealed games' },
    standards: [],
    questions: 5,
    playKind: 'fetch',
    tracked: false, // records under whichever sub-game it samples
    skills: [],
    praise: ['Surprise superstar!', 'You can play anything!'],
    milestones: [],
    revealId: 'tile:surprise',
  }),
];

// Fact tracks. These don't use little.skills at all — they carry Leitner
// stat maps and their own wave engines — so they declare `statMap` and
// `readiness` instead of skill namespaces. Registered here so TRAIL.md
// covers the whole trail and so R5's money track has a shape to follow.
const T = (rec) => ({ type: 'track', status: 'shipped', timed: true, tracked: false, skills: [], milestones: [], ...rec });

export const TRACKS = [
  T({
    id: 'adding',
    labels: { kid: 'Adding', icon: '➕', grownup: 'addition within 20, 7 strategy waves' },
    standards: ['1.OA.6', '2.OA.2'],
    statMap: 'addition',
    readiness: 'addingReady',
    visibility: 'bridgeVisible',
    revealId: 'track:adding',
  }),
  T({
    id: 'takingaway',
    labels: { kid: 'Taking away', icon: '➖', grownup: 'subtraction within 20, think-addition' },
    standards: ['1.OA.6', '2.OA.2'],
    statMap: 'subtraction',
    readiness: 'takingAwayReady',
    visibility: 'bridgeVisible',
    revealId: 'track:takingaway',
  }),
  T({
    id: 'tables',
    labels: { kid: 'The tables', icon: '✖️', grownup: 'multiplication facts ×1–12' },
    standards: ['3.OA.7'],
    statMap: 'facts',
    readiness: 'tablesReady',
    visibility: 'tablesVisible',
    revealId: 'track:tables',
  }),
  T({
    id: 'division',
    labels: { kid: 'Sharing', icon: '➗', grownup: 'division facts ÷1–12, missing-factor bridge' },
    standards: ['3.OA.7'],
    statMap: 'division',
    // opens per table as its multiplication table is mastered, so there is
    // no single predicate — divisionTableUnlocked() decides per fact family
    readiness: null,
    visibility: 'tablesVisible',
    revealId: 'track:tables',
  }),
];

// Phase 7, not built yet. Listed so the registry is the plan of record and
// TRAIL.md has something to agree with; each release fills a record in and
// flips its status to 'shipped'. Deliberately EXCLUDED from the derived
// maps and from littleGames(), so a planned entry can never leak into a
// child's game list or skill total.
const P = (rec) => ({ status: 'planned', tracked: false, skills: [], milestones: [], ...rec });

export const PLANNED = [
  P({
    id: 'counton',
    type: 'little-game',
    labels: { kid: 'Count on!', icon: '🔢', grownup: 'number sequence to 120, decade crossings' },
    standards: ['1.NBT.1', '2.NBT.2'],
    questions: 5,
    revealId: 'tile:counton',
    plannedIn: 'R3',
  }),
  P({
    id: 'groups',
    type: 'little-game',
    labels: { kid: 'Groups!', icon: '🧺', grownup: 'equal groups and arrays' },
    standards: ['2.OA.4'],
    questions: 4,
    revealId: 'tile:groups',
    plannedIn: 'R4',
  }),
  P({
    id: 'money',
    type: 'track',
    labels: { kid: 'Paw Bucks', icon: '🪙', grownup: 'money math: recognition → counting → equivalence → change → notation' },
    standards: ['2.MD.8'],
    statMap: 'money',
    revealId: 'track:money',
    plannedIn: 'R5',
  }),
];

// --- lookups ---------------------------------------------------------------

export const ALL = [...TRAIL, ...TRACKS, ...PLANNED];
export const byId = (id) => ALL.find((r) => r.id === id);
export const littleGames = () => TRAIL.filter((r) => r.type === 'little-game');
export const tracks = () => TRACKS;

// Expand a skill spec into the finite list of numbers it covers.
export function skillNumbers(spec) {
  if (Array.isArray(spec.domain?.set)) return [...spec.domain.set];
  const [lo, hi] = spec.domain;
  return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
}

// Every skill key a game can ever write — the finite catalogue.
export function skillKeys(id) {
  const rec = byId(id);
  if (!rec) return [];
  return rec.skills.flatMap((s) => skillNumbers(s).map((n) => `${s.ns}:${n}`));
}

// How many trackable keys exist across the whole little trail. Replaces the
// hand-maintained LITTLE_SKILL_TOTAL, which had to be remembered.
export function littleSkillTotal() {
  return littleGames().reduce((n, r) => n + skillKeys(r.id).length, 0);
}

const streakOf = (p) => (p.streak ?? 3);
const reached = (skills, ns, n, need) => (skills?.[`${ns}:${n}`]?.streak ?? 0) >= need;

// Does this game still have numbers to learn? Generic over namespaces, so
// the bond/teen special cases and the paths/taway bugs all vanish.
export function gameHasFrontier(profile, id) {
  const skills = profile?.little?.skills;
  const rec = byId(id);
  if (!rec) return false;
  for (const spec of rec.skills) {
    if (!spec.required) continue;
    for (const n of skillNumbers(spec)) if (!reached(skills, spec.ns, n, streakOf(spec))) return true;
  }
  return false;
}

// Every required skill known — "this game is finished".
export function gameKnown(profile, id) {
  const rec = byId(id);
  if (!rec || !rec.skills.some((s) => s.required)) return false;
  return !gameHasFrontier(profile, id);
}

// --- derived maps: the literals little.js used to carry by hand ----------
// Shapes are preserved exactly so call sites are untouched, and
// tests/trail.spec.js asserts them against a fixture of the originals.

const fromGames = (fn) => Object.fromEntries(littleGames().map((r) => [r.id, fn(r)]));

export const QUESTIONS_BY_GAME = fromGames((r) => r.questions);
export const KIND_BY_GAME = fromGames((r) => r.playKind);
export const PRAISE_BY_GAME = fromGames((r) => r.praise);
export const SKILL_GAMES = new Set(littleGames().filter((r) => r.tracked).map((r) => r.id));

// Namespace-keyed, unlike the old game-keyed SKILL_DOMAIN: `takeaway` and
// `path` appear under the names the games actually write.
export const SKILL_DOMAIN = Object.fromEntries(
  littleGames().flatMap((r) =>
    r.skills.map((s) => [s.ns, Array.isArray(s.domain?.set) ? { set: [...s.domain.set] } : [...s.domain]])
  )
);
export const STREAK_NEEDED = Object.fromEntries(
  littleGames().flatMap((r) => r.skills.filter((s) => s.streak !== 3).map((s) => [s.ns, s.streak]))
);

// The adaptive 5→7→10 band, keyed by GAME id — the shape rangeFor() has
// always used. Only games whose namespace matches their id (or that state
// a rangeDomain) appear; everything else falls back to 1–10 exactly as
// before. tests/trail.spec.js pins this against the shipped literal.
export const RANGE_DOMAIN = Object.fromEntries(
  littleGames()
    .map((r) => {
      if (r.rangeDomain) return [r.id, [...r.rangeDomain]];
      const own = r.skills.find((s) => s.ns === r.id && Array.isArray(s.domain));
      return own ? [r.id, [...own.domain]] : null;
    })
    .filter(Boolean)
);
