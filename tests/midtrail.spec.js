// v1.41.0 mid-trail readiness: higher-track evidence opens lower tracks'
// VISIBILITY — and synthesizes absolutely nothing (no skills, facts,
// coins, pets, dogs, achievements, or milestones).
import { test, expect } from '@playwright/test';
import { newProfile } from '../src/data/schema.js';
import { addingReady, bridgeVisible, ratchetReveals } from '../src/engine/readiness.js';
import { norm, stat } from './helpers.mjs';

test('a tables-first kid auto-qualifies for Adding; nothing below is synthesized', () => {
  const p = newProfile('MidTrail');
  p.subjects = { ...p.subjects, tables: true };
  for (let b = 0; b <= 12; b++) p.facts[norm(7, b)] = stat(3); // real × history

  const before = JSON.stringify({
    little: p.little,
    addition: p.addition,
    subtraction: p.subtraction,
    pawBucks: p.pawBucks,
    petUnlocks: p.petUnlocks,
    unlocks: p.unlocks,
    achievements: p.achievements,
  });

  expect(addingReady(p)).toBe(true); // the mid-trail readiness fix
  expect(bridgeVisible(p)).toBe(true);

  const after = JSON.stringify({
    little: p.little,
    addition: p.addition,
    subtraction: p.subtraction,
    pawBucks: p.pawBucks,
    petUnlocks: p.petUnlocks,
    unlocks: p.unlocks,
    achievements: p.achievements,
  });
  expect(after).toBe(before); // predicates are read-only — deep-equal state
});

test('a genuinely fresh kid still needs the counting gates', () => {
  const p = newProfile('Fresh');
  p.subjects = { ...p.subjects, little: true };
  expect(addingReady(p)).toBe(false);
  expect(bridgeVisible(p)).toBe(false);
});

test('the reveal ratchet never regresses under the new predicate', () => {
  const p = newProfile('Ratchet');
  p.subjects = { ...p.subjects, tables: true };
  ratchetReveals(p, ['tile:count', 'tile:tap']);
  for (let b = 0; b <= 12; b++) p.facts[norm(2, b)] = stat(2);
  const fresh = ratchetReveals(p, ['tile:count']); // nothing new
  expect(fresh).toEqual([]);
  expect(p.little.revealed).toEqual(['tile:count', 'tile:tap']);
});
