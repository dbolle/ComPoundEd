// The Cozy Corner: zero-maintenance companion pets adopted along the
// bridge (docs/PHASE5.md). Dogs are the working pack; pets never get
// dirty and never need care — they host games and keep the collection
// warm without adding workload. One pet per milestone, in catalog order.

import { PETS } from '../art/pets.js';
import { isWaveMastered, isSubWaveMastered, WAVES } from './waves.js';

const KNOWN_STREAK = 3;
const known = (p, key) => (p.little?.skills?.[key]?.streak ?? 0) >= KNOWN_STREAK;
const rangeKnown = (p, game, lo, hi) => {
  for (let n = lo; n <= hi; n++) if (!known(p, `${game}:${n}`)) return false;
  return true;
};

// Milestone order = adoption order; PETS[i] is the pet for MILESTONES[i].
export const MILESTONES = [
  { id: 'look', label: 'Quick Look 1–10', earned: (p) => rangeKnown(p, 'look', 1, 10) },
  { id: 'bond5', label: 'Number friends of 5', earned: (p) => rangeKnown(p, 'bond5', 0, 5) },
  { id: 'bond10', label: 'Number friends of 10', earned: (p) => rangeKnown(p, 'bond10', 0, 10) },
  { id: 'teen', label: 'Teen numbers', earned: (p) => rangeKnown(p, 'teen', 1, 9) },
  ...WAVES.map((w, i) => ({
    id: `w${w.id}`,
    label: `${w.name} adding`,
    earned: (p) => isWaveMastered(p, i),
  })),
  ...WAVES.map((w, i) => ({
    id: `s${w.id}`,
    label: `${w.name} taking away`,
    earned: (p) => isSubWaveMastered(p, i),
  })),
  // Appended (never inserted): milestone→pet mapping is positional and
  // must stay deterministic across app versions and devices.
  { id: 'type', label: 'Type it! 1–10', earned: (p) => rangeKnown(p, 'type', 1, 10) },
  { id: 'taway', label: 'Take away!', earned: (p) => rangeKnown(p, 'takeaway', 1, 8) },
  { id: 'paths', label: 'Counting paths (2s, 5s, 10s)', earned: (p) => [2, 5, 10].every((t) => known(p, `path:${t}`)) },
  // Early friends: the first pets arrive FAST so correct answers and new
  // friends connect from day one. Appended (mapping stability); surfaced
  // first via `sort`.
  { id: 'count3', label: 'First counts (1–3)', sort: -2, earned: (p) => rangeKnown(p, 'count', 1, 3) },
  { id: 'count5', label: 'Counting to five', sort: -1, earned: (p) => rangeKnown(p, 'count', 1, 5) },
];

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

// The first milestone not yet earned — the "next friend" goal card.
export function nextPetGoal(profile) {
  const owned = new Set((profile.petUnlocks ?? []).map((u) => u.milestone));
  const m = [...MILESTONES]
    .sort((a, b) => (a.sort ?? MILESTONES.indexOf(a)) - (b.sort ?? MILESTONES.indexOf(b)))
    .find((x) => !owned.has(x.id));
  return m ? { pet: petForMilestone(m.id), label: m.label } : null;
}
