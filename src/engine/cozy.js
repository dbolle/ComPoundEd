// The Cozy Corner: zero-maintenance companion pets adopted along the
// bridge (docs/PHASE5.md). Dogs are the working pack; pets never get
// dirty and never need care — they host games and keep the collection
// warm without adding workload. One pet per milestone, in catalog order.

import { PETS } from '../art/pets.js';
import { GROUP_SKILL_KEYS } from './groups.js';
import { isWaveMastered, isSubWaveMastered, WAVES, waveProgress, subWaveProgress } from './waves.js';
import { bridgeVisible } from './readiness.js';

const KNOWN_STREAK = 3;
const known = (p, key) => (p.little?.skills?.[key]?.streak ?? 0) >= KNOWN_STREAK;
const rangeKnown = (p, game, lo, hi) => {
  for (let n = lo; n <= hi; n++) if (!known(p, `${game}:${n}`)) return false;
  return true;
};
const rangeProg = (p, game, lo, hi) => {
  let have = 0;
  for (let n = lo; n <= hi; n++) if (known(p, `${game}:${n}`)) have += 1;
  return { have, need: hi - lo + 1 };
};

// Milestone order = adoption order; PETS[i] is the pet for MILESTONES[i].
export const MILESTONES = [
  // kind: 'little' milestones read little-pup skills; 'waves' read the
  // adding/taking-away tracks. prog() feeds the next-friend meter.
  { id: 'look', kind: 'little', label: 'Quick Look 1–10', earned: (p) => rangeKnown(p, 'look', 1, 10), prog: (p) => rangeProg(p, 'look', 1, 10) },
  { id: 'bond5', kind: 'little', label: 'Number friends of 5', earned: (p) => rangeKnown(p, 'bond5', 0, 5), prog: (p) => rangeProg(p, 'bond5', 0, 5) },
  { id: 'bond10', kind: 'little', label: 'Number friends of 10', earned: (p) => rangeKnown(p, 'bond10', 0, 10), prog: (p) => rangeProg(p, 'bond10', 0, 10) },
  { id: 'teen', kind: 'little', label: 'Teen numbers', earned: (p) => rangeKnown(p, 'teen', 1, 9), prog: (p) => rangeProg(p, 'teen', 1, 9) },
  ...WAVES.map((w, i) => ({
    id: `w${w.id}`,
    kind: 'waves',
    label: `${w.name} adding`,
    earned: (p) => isWaveMastered(p, i),
    prog: (p) => {
      const x = waveProgress(p, i);
      return { have: x.done, need: x.total };
    },
  })),
  ...WAVES.map((w, i) => ({
    id: `s${w.id}`,
    kind: 'waves',
    label: `${w.name} taking away`,
    earned: (p) => isSubWaveMastered(p, i),
    prog: (p) => {
      const x = subWaveProgress(p, i);
      return { have: x.done, need: x.total };
    },
  })),
  // Appended (never inserted): milestone→pet mapping is positional and
  // must stay deterministic across app versions and devices.
  { id: 'type', kind: 'little', label: 'Type it! 1–10', earned: (p) => rangeKnown(p, 'type', 1, 10), prog: (p) => rangeProg(p, 'type', 1, 10) },
  { id: 'taway', kind: 'little', label: 'Take away!', earned: (p) => rangeKnown(p, 'takeaway', 1, 8), prog: (p) => rangeProg(p, 'takeaway', 1, 8) },
  { id: 'paths', kind: 'little', label: 'Counting paths (2s, 5s, 10s)', earned: (p) => [2, 5, 10].every((t) => known(p, `path:${t}`)), prog: (p) => ({ have: [2, 5, 10].filter((t) => known(p, `path:${t}`)).length, need: 3 }) },
  // Early friends: the first pets arrive FAST so correct answers and new
  // friends connect from day one. Appended (mapping stability); surfaced
  // first via `sort`.
  { id: 'count3', kind: 'little', label: 'First counts (1–3)', sort: -2, earned: (p) => rangeKnown(p, 'count', 1, 3), prog: (p) => rangeProg(p, 'count', 1, 3) },
  { id: 'count5', kind: 'little', label: 'Counting to five', sort: -1, earned: (p) => rangeKnown(p, 'count', 1, 5), prog: (p) => rangeProg(p, 'count', 1, 5) },
  // v1.35.0 — appended (never inserted): Trace it! adopts PETS[23], the
  // first of the three pets that previously had no earning path.
  { id: 'trace', kind: 'little', label: 'Writing numbers 1–9', earned: (p) => rangeKnown(p, 'trace', 1, 9), prog: (p) => rangeProg(p, 'trace', 1, 9) },
  // v1.50.0 — appended (never inserted): adopts PETS[24], one of the two
  // pets that had no earning path. Requires the two FLUENCIES only —
  // `place` (magnitude) is enrichment and deliberately not required, so the
  // fuzziest of the three forms cannot stall the trail.
  {
    id: 'counton',
    kind: 'little',
    label: 'Counting past ten (to 120)',
    earned: (p) => rangeKnown(p, 'seq', 2, 12) && rangeKnown(p, 'ten', 1, 9),
    prog: (p) => {
      const a = rangeProg(p, 'seq', 2, 12);
      const b = rangeProg(p, 'ten', 1, 9);
      return { have: a.have + b.have, need: a.need + b.need };
    },
  },
  // v1.53.0 — appended (never inserted): Groups adopts PETS[25], the LAST
  // pet that had no earning path. MILESTONES and PETS are both 26 from
  // here, which is what lets the suite assert they stay equal — a milestone
  // and the pet that earns it must ship in the same commit from now on, or
  // `petForMilestone` wraps and re-adopts Whiskers.
  //
  // Keys are factor PAIRS, not a numeric range, so this counts the engine's
  // catalogue directly instead of using rangeKnown().
  {
    id: 'groups',
    kind: 'little',
    label: 'Equal groups and arrays',
    earned: (p) => GROUP_SKILL_KEYS.every((k) => known(p, k)),
    prog: (p) => ({
      have: GROUP_SKILL_KEYS.filter((k) => known(p, k)).length,
      need: GROUP_SKILL_KEYS.length,
    }),
  },
];

// Can this profile ever earn this milestone? Little-skill milestones need
// the little games; wave milestones need the adding/taking-away track.
// Locked-pet cards, goal cards, and meters all agree through this.
export function milestoneReachable(p, m) {
  if (m.kind === 'little') return p.subjects?.little === true;
  return bridgeVisible(p);
}

export function petForMilestone(msId) {
  const i = MILESTONES.findIndex((m) => m.id === msId);
  return PETS[i % PETS.length];
}

export function isPetAdopted(profile, petId) {
  return (profile.petUnlocks ?? []).some((u) => u.petId === petId);
}

// Adopts any newly-earned milestones' pets; returns the new adoptions so
// finish screens can celebrate them.
export function checkPetUnlocks(profile) {
  profile.petUnlocks = profile.petUnlocks ?? [];
  const fresh = [];
  for (const m of MILESTONES) {
    if (profile.petUnlocks.some((u) => u.milestone === m.id)) continue;
    if (!m.earned(profile)) continue;
    const pet = petForMilestone(m.id);
    const u = { petId: pet.id, milestone: m.id, at: Date.now() };
    profile.petUnlocks.push(u);
    fresh.push({ ...u, pet });
  }
  return fresh;
}

const goalInfo = (profile, m) =>
  m
    ? { id: m.id, pet: petForMilestone(m.id), label: m.label, ...(m.prog ? m.prog(profile) : {}) }
    : null;

// The first REACHABLE milestone not yet earned — the "next friend" goal
// card (a bridge-only kid is never pointed at counting games they can't
// see, and vice versa).
export function nextPetGoal(profile) {
  const owned = new Set((profile.petUnlocks ?? []).map((u) => u.milestone));
  const m = [...MILESTONES]
    .sort((a, b) => (a.sort ?? MILESTONES.indexOf(a)) - (b.sort ?? MILESTONES.indexOf(b)))
    .find((x) => !owned.has(x.id) && milestoneReachable(profile, x));
  return goalInfo(profile, m);
}

// The goal for a SPECIFIC little game: the pet this game's own milestone
// earns, so the in-game meter never points at a different activity.
const GOALS_BY_GAME = {
  count: ['count3', 'count5'],
  look: ['look'],
  bond: ['bond5', 'bond10'],
  teen: ['teen'],
  type: ['type'],
  taway: ['taway'],
  paths: ['paths'],
  trace: ['trace'],
  // `counton` shipped in v1.50.0 WITHOUT an entry here, so playing Count on!
  // never showed its own next-friend goal — it fell through to the generic
  // nextPetGoal(). Same omission would have hit `groups`; both fixed here.
  counton: ['counton'],
  groups: ['groups'],
};
export function gameGoal(profile, game) {
  const owned = new Set((profile.petUnlocks ?? []).map((u) => u.milestone));
  for (const id of GOALS_BY_GAME[game] ?? []) {
    const m = MILESTONES.find((x) => x.id === id);
    if (m && !owned.has(id) && milestoneReachable(profile, m)) return goalInfo(profile, m);
  }
  return null;
}
