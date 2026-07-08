import { DOGS } from '../art/dogs.js';
import { isTableMastered } from './leitner.js';

// Adds any newly earned dogs to the profile and returns them (for the
// results-screen reveal). Call after every round, before saving.
export function checkUnlocks(profile) {
  const newly = [];
  for (const dog of DOGS) {
    if (dog.table == null) continue;
    if (profile.unlocks.some((u) => u.dogId === dog.id)) continue;
    if (isTableMastered(profile, dog.table)) {
      profile.unlocks.push({ dogId: dog.id, table: dog.table, at: Date.now() });
      newly.push(dog);
    }
  }
  return newly;
}

export function isUnlocked(profile, dogId) {
  return profile.unlocks.some((u) => u.dogId === dogId);
}
