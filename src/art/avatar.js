// The kid's buddy: a dog (default) or an adopted Cozy Corner pet.
// One helper so every screen renders the same choice — dogs keep their
// earned accessories and dirt; pets are zero-maintenance but wear their
// gifted store gear.

import { getDog, dogSVG, wornFor, dirtFor } from './dogs.js';
import { PETS, petSVG } from './pets.js';
import { placedOn } from '../engine/gearshop.js';

export function avatarFor(profile) {
  // strict lookup: an unknown/removed pet id falls back to the dog
  const pet = profile.avatarPetId ? PETS.find((x) => x.id === profile.avatarPetId) : null;
  if (pet) {
    return {
      kind: 'pet',
      id: pet.id,
      name: pet.name,
      species: pet.species,
      svg: (size) => petSVG(pet, size, placedOn(profile, pet.id)),
    };
  }
  const dog = getDog(profile.avatarDogId);
  return {
    kind: 'dog',
    id: dog.id,
    name: dog.name,
    svg: (size, { dirt = false } = {}) =>
      dogSVG(dog, size, wornFor(profile, dog.id), dirt ? dirtFor(profile, dog) : 0),
  };
}
