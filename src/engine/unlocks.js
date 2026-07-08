import { DOGS } from '../art/dogs.js';
import { isTableMastered, isDivisionTableMastered } from './leitner.js';

// Adds any newly earned dogs to the profile and returns them (for the
// results-screen reveal). Call after every round, before saving.
export function checkUnlocks(profile) {
  const newly = [];
  for (const dog of DOGS) {
    if (dog.table == null && dog.divTable == null) continue;
    if (profile.unlocks.some((u) => u.dogId === dog.id)) continue;
    const earned =
      dog.table != null
        ? isTableMastered(profile, dog.table)
        : isDivisionTableMastered(profile, dog.divTable);
    if (earned) {
      profile.unlocks.push({ dogId: dog.id, table: dog.table ?? null, at: Date.now() });
      newly.push(dog);
    }
  }
  return newly;
}

export function isUnlocked(profile, dogId) {
  return profile.unlocks.some((u) => u.dogId === dogId);
}
