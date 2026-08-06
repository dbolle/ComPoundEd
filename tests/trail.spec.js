// v1.48.0 — the trail registry (src/engine/trail.js) is the single source
// of truth for what a child can learn. Three contracts, in order of how
// much they'd hurt to break:
//
//   1. the derived maps still equal the hand-written literals they replaced
//      (fixture captured from the shipping app, not retyped)
//   2. the new generic frontier logic agrees with the old special-cased
//      logic on every profile shape
//   3. registry ↔ code by IMPORT, and registry ↔ docs/TRAIL.md
//
// Contracts 1 and 2 are what make the extraction safe: a refactor of every
// little game is only defensible if it provably changes no behaviour.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import {
  TRAIL,
  ALL,
  PLANNED,
  tracks,
  byId,
  littleGames,
  skillKeys,
  skillNumbers,
  littleSkillTotal,
  gameHasFrontier,
  gameKnown,
  QUESTIONS_BY_GAME,
  KIND_BY_GAME,
  PRAISE_BY_GAME,
  SKILL_GAMES,
  SKILL_DOMAIN,
  STREAK_NEEDED,
  RANGE_DOMAIN,
} from '../src/engine/trail.js';
import { MILESTONES, petForMilestone } from '../src/engine/cozy.js';
import { PETS } from '../src/art/pets.js';
import * as readiness from '../src/engine/readiness.js';
import { newProfile, mergeProfiles } from '../src/data/schema.js';
import { waveFacts } from '../src/engine/waves.js';
import { normAddKey } from '../src/engine/leitner.js';
import { stat } from './helpers.mjs';

const FIX = JSON.parse(readFileSync('tests/fixtures-little-registry.json', 'utf8'));

// The old SKILL_DOMAIN was keyed by GAME id; the registry keys by the
// NAMESPACE the game actually writes. One rename, and four namespaces that
// existed in data but were missing from the map entirely — which is
// precisely the drift that hid two games from the frontier picker.
const RENAMED = { taway: 'takeaway' };
const INTENTIONAL_ADDITIONS = ['bond5', 'bond10', 'teen', 'path', 'seq', 'ten', 'place'];

// The fixture is a HISTORICAL snapshot of the literals the registry
// replaced, so it pins the extraction. Games added afterwards must be
// declared here — the test then still catches an accidental change to
// anything that shipped before, while an intended new game is one line.
const ADDED_SINCE_FIXTURE = ['counton'];

test('derived maps still equal the literals they replaced', () => {
  // every pre-existing entry unchanged...
  for (const [game, v] of Object.entries(FIX.QUESTIONS_BY_GAME)) {
    expect(QUESTIONS_BY_GAME[game], `questions for ${game}`).toBe(v);
  }
  for (const [game, v] of Object.entries(FIX.KIND_BY_GAME)) {
    expect(KIND_BY_GAME[game], `play kind for ${game}`).toBe(v);
  }
  for (const [game, v] of Object.entries(FIX.PRAISE_BY_GAME)) {
    expect(PRAISE_BY_GAME[game], `praise for ${game}`).toEqual(v);
  }
  for (const g of FIX.SKILL_GAMES) expect(SKILL_GAMES.has(g), `${g} still tracked`).toBe(true);
  for (const [ns, v] of Object.entries(FIX.STREAK_NEEDED)) {
    expect(STREAK_NEEDED[ns], `streak for ${ns}`).toBe(v);
  }
  // ...and the only new games are the declared ones
  const extra = Object.keys(QUESTIONS_BY_GAME).filter((g) => !(g in FIX.QUESTIONS_BY_GAME));
  expect(extra.sort()).toEqual([...ADDED_SINCE_FIXTURE].sort());
});

test('the adaptive band: no old entry changed, and additions cannot move rangeFor', () => {
  // rangeFor() keys by game id; "fixing" that would change which numbers
  // Take away! serves, which is not this refactor's business.
  for (const [game, range] of Object.entries(FIX.SKILL_DOMAIN)) {
    expect(RANGE_DOMAIN[game], `band for ${game}`).toEqual(range);
  }
  // Deriving the table does surface entries the literal lacked (`teen`,
  // whose namespace happens to equal its id). Prose can't be trusted that
  // those are harmless, so compare the FUNCTION across profile shapes: the
  // bands only ever probe 1..7, so a domain differing above 7 is invisible.
  const oldRangeFor = (profile, g) => {
    const little = profile.little ?? {};
    const [dLo, dHi] = FIX.SKILL_DOMAIN[g] ?? [1, 10];
    const band = (lo, hi) => {
      for (let n = Math.max(lo, dLo); n <= Math.min(hi, dHi); n++) {
        if (!oldKnows(little, g, n)) return false;
      }
      return true;
    };
    if (!band(1, 5)) return 5;
    if (!band(6, 7)) return 7;
    return 10;
  };
  const newRangeFor = (profile, g) => {
    const little = profile.little ?? {};
    const [dLo, dHi] = RANGE_DOMAIN[g] ?? [1, 10];
    const band = (lo, hi) => {
      for (let n = Math.max(lo, dLo); n <= Math.min(hi, dHi); n++) {
        if (!oldKnows(little, g, n)) return false;
      }
      return true;
    };
    if (!band(1, 5)) return 5;
    if (!band(6, 7)) return 7;
    return 10;
  };
  const games = littleGames().map((r) => r.id);
  for (let seed = 1; seed <= 60; seed++) {
    const rnd = mulberry32(seed);
    const p = newProfile(`Band${seed}`);
    for (const g of games) {
      for (let n = 0; n <= 20; n++) {
        if (rnd() < 0.5) p.little.skills[`${g}:${n}`] = { attempts: 5, streak: Math.floor(rnd() * 6) };
      }
    }
    for (const g of games) {
      expect(newRangeFor(p, g), `rangeFor(${g}) on seed ${seed}`).toBe(oldRangeFor(p, g));
    }
  }
});

test('skill domains: every old entry survives, and the additions are the known four', () => {
  for (const [oldKey, range] of Object.entries(FIX.SKILL_DOMAIN)) {
    const ns = RENAMED[oldKey] ?? oldKey;
    expect(SKILL_DOMAIN[ns], `domain for ${oldKey} → ${ns}`).toEqual(range);
  }
  const added = Object.keys(SKILL_DOMAIN).filter(
    (ns) => !Object.keys(FIX.SKILL_DOMAIN).map((k) => RENAMED[k] ?? k).includes(ns)
  );
  expect(added.sort()).toEqual([...INTENTIONAL_ADDITIONS].sort());
  // the enrichment namespace needs the longer streak: a binned answer is
  // more guessable than a numeral, so 3 in a row proves less
  expect(STREAK_NEEDED.place, 'placement is binned ⇒ needs 4').toBe(4);
  // the set-valued one is a set, not a range — three strides, not 2..10
  expect(SKILL_DOMAIN.path).toEqual({ set: [2, 5, 10] });
  expect(skillNumbers({ domain: { set: [2, 5, 10] } })).toEqual([2, 5, 10]);
});

// --- contract 2: the generic frontier agrees with the old special cases --

const mulberry32 = (a) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// The v1.47.3 implementation, verbatim in shape: two special cases, a
// set-valued game, a renamed key, and a domain table.
const OLD_DOMAIN = FIX.SKILL_DOMAIN;
const OLD_STREAK = FIX.STREAK_NEEDED;
const OLD_KEY = { taway: 'takeaway' };
const OLD_SET = { paths: [2, 5, 10] };
const oldKnows = (little, g, n) =>
  (little.skills?.[`${g}:${n}`]?.streak ?? 0) >= (OLD_STREAK[g] ?? 3);
function oldHasFrontier(profile, game) {
  const little = profile.little ?? {};
  if (game === 'bond') {
    for (let k = 0; k <= 5; k++) if (!oldKnows(little, 'bond5', k)) return true;
    for (let k = 0; k <= 10; k++) if (!oldKnows(little, 'bond10', k)) return true;
    return false;
  }
  if (game === 'teen') {
    for (let n = 1; n <= 9; n++) if (!oldKnows(little, 'teen', n)) return true;
    return false;
  }
  const set = OLD_SET[game];
  if (set) {
    for (const n of set) if (!oldKnows(little, game === 'paths' ? 'path' : game, n)) return true;
    return false;
  }
  const dom = OLD_DOMAIN[game];
  if (!dom) return false;
  const key = OLD_KEY[game] ?? game;
  for (let n = dom[0]; n <= dom[1]; n++) if (!oldKnows(little, key, n)) return true;
  return false;
}

test('generic frontier == old special-cased frontier, on every profile shape', () => {
  const games = littleGames().map((r) => r.id);
  const allKeys = [...new Set(littleGames().flatMap((r) => skillKeys(r.id)))];
  expect(allKeys.length, 'a finite catalogue of keys').toBeGreaterThan(50);

  const shapes = [];
  shapes.push(newProfile('Empty')); // nothing known
  const all = newProfile('AllKnown'); // everything known
  for (const k of allKeys) all.little.skills[k] = { attempts: 9, streak: 9 };
  shapes.push(all);
  // one profile per "all but this single key", the boundary that matters
  for (const miss of allKeys) {
    const p = newProfile('AllBut');
    for (const k of allKeys) if (k !== miss) p.little.skills[k] = { attempts: 9, streak: 9 };
    shapes.push(p);
  }
  // and seeded random partials, including streaks at the 3/4 boundary
  for (let seed = 1; seed <= 40; seed++) {
    const rnd = mulberry32(seed);
    const p = newProfile(`Rand${seed}`);
    for (const k of allKeys) if (rnd() < 0.6) p.little.skills[k] = { attempts: 5, streak: Math.floor(rnd() * 6) };
    shapes.push(p);
  }

  for (const p of shapes) {
    for (const g of games) {
      // the old implementation predates these games and has no branch for
      // them, so there is nothing to compare against — they are covered by
      // their own specs instead
      if (ADDED_SINCE_FIXTURE.includes(g)) continue;
      expect(gameHasFrontier(p, g), `${g} on ${p.name}`).toBe(oldHasFrontier(p, g));
    }
  }
});

test('gameKnown is the complement of frontier, and untracked games are never "known"', () => {
  const p = newProfile('Knower');
  expect(gameKnown(p, 'count')).toBe(false);
  for (const k of skillKeys('count')) p.little.skills[k] = { attempts: 9, streak: 9 };
  expect(gameKnown(p, 'count')).toBe(true);
  // tap/shape/pattern/surprise record nothing — "finished" is meaningless
  for (const g of ['tap', 'shape', 'pattern', 'surprise']) {
    expect(gameHasFrontier(p, g), `${g} has no frontier`).toBe(false);
    expect(gameKnown(p, g), `${g} is never claimed as known`).toBe(false);
  }
});

test('the skill total is derived, not remembered', () => {
  // it replaced a hand-maintained constant that had to be bumped by hand
  expect(littleSkillTotal()).toBe(
    littleGames().reduce((n, r) => n + skillKeys(r.id).length, 0)
  );
  expect(littleSkillTotal()).toBeGreaterThan(100);
});

// --- contract 3: registry ↔ code, by import ------------------------------

test('every milestone id in the registry exists in cozy.js', () => {
  const known = new Set(MILESTONES.map((m) => m.id));
  for (const rec of ALL) {
    for (const id of rec.milestones ?? []) {
      expect(known.has(id), `${rec.id} claims milestone "${id}"`).toBe(true);
    }
  }
});

test('every readiness/visibility name in the registry is a real export', () => {
  for (const rec of ALL) {
    for (const key of ['readiness', 'visibility']) {
      if (!rec[key]) continue;
      expect(typeof readiness[rec[key]], `${rec.id} → ${rec[key]}`).toBe('function');
    }
  }
});

test('every track stat map is a real profile collection', () => {
  const p = newProfile('Shape');
  for (const rec of tracks()) {
    expect(p[rec.statMap], `profile.${rec.statMap} for ${rec.id}`).toBeDefined();
  }
});

test('planned records stay out of the live maps', () => {
  // a planned entry leaking into littleGames() would put an unbuilt game
  // on a child's shelf and inflate the skill denominator
  for (const rec of PLANNED) {
    expect(QUESTIONS_BY_GAME[rec.id], `${rec.id} must not be playable yet`).toBeUndefined();
    expect(SKILL_GAMES.has(rec.id)).toBe(false);
    expect(littleGames().some((r) => r.id === rec.id)).toBe(false);
    expect(skillKeys(rec.id), 'no skill keys until it exists').toEqual([]);
    expect(byId(rec.id), 'but findable by id, for the docs').toBeTruthy();
  }
});

test('registry records are well formed and internally consistent', () => {
  const ids = new Set();
  for (const rec of ALL) {
    expect(rec.id, 'has an id').toBeTruthy();
    expect(ids.has(rec.id), `${rec.id} is unique`).toBe(false);
    ids.add(rec.id);
    expect(rec.labels?.kid, `${rec.id} kid label`).toBeTruthy();
    expect(rec.labels?.grownup, `${rec.id} grown-up label`).toBeTruthy();
    expect(['shipped', 'phase7', 'planned']).toContain(rec.status);
    expect(Array.isArray(rec.standards)).toBe(true);
    if (rec.status === 'planned') continue; // shape arrives with the build
    if (rec.type === 'little-game') {
      expect(rec.questions, `${rec.id} question count`).toBeGreaterThan(0);
    } else {
      // tracks carry a Leitner stat map and their own wave engine instead
      expect(rec.statMap, `${rec.id} needs a stat map`).toBeTruthy();
    }
    expect(rec.revealId, `${rec.id} needs a one-way reveal key`).toMatch(/^(tile|track):/);
    // a tracked game must record something; an untracked one must not
    expect(rec.skills.length > 0, `${rec.id} tracked ⇒ has skills`).toBe(rec.tracked);
    for (const s of rec.skills) {
      expect(s.ns, `${rec.id} skill needs a namespace`).toBeTruthy();
      expect(skillNumbers(s).length, `${rec.id}:${s.ns} is finite and non-empty`).toBeGreaterThan(0);
      expect(s.streak).toBeGreaterThanOrEqual(3);
    }
  }
});

test('registry ↔ docs/TRAIL.md: neither may drift from the other', () => {
  const doc = readFileSync('docs/TRAIL.md', 'utf8');
  // every shipped/phase7 record appears as a row naming its id in backticks
  for (const rec of ALL) {
    if (rec.status === 'planned') continue;
    expect(doc, `TRAIL.md is missing a row for \`${rec.id}\``).toContain(`\`${rec.id}\``);
    expect(doc, `TRAIL.md must name the kid label for ${rec.id}`).toContain(rec.labels.kid);
  }
  // and every id the doc claims as code must exist in the registry
  const claimed = [...doc.matchAll(/^\|[^|]*\|[^|]*\|[^|]*\|\s*`([a-z0-9]+)`/gim)].map((m) => m[1]);
  expect(claimed.length, 'the doc actually has id rows').toBeGreaterThan(5);
  for (const id of claimed) {
    expect(byId(id), `TRAIL.md names \`${id}\`, which is not in the registry`).toBeTruthy();
  }
});

// --- one-way readiness doors ---------------------------------------------

test('a gate may be tightened; it may not close on a child it opened', () => {
  // This is the property that makes gates editable at all. Before v1.48.0
  // visibility was recomputed live, so a child who had QUALIFIED but not
  // yet PLAYED lost the track the moment a predicate was edited — which is
  // why "never change a gate" had become the working rule.
  const p = newProfile('Earner');
  p.subjects = { ...p.subjects, tables: 'auto' };
  // qualify for tables the honest way: waves 1–5, sub-waves 1–2, all strides
  for (const t of [2, 5, 10]) p.little.skills[`path:${t}`] = { attempts: 9, streak: 9 };
  const masterWave = (w, map = 'addition') => {
    for (const [a, b] of waveFacts(w)) p[map][normAddKey(a, b)] = stat(3);
  };
  for (let w = 0; w <= 4; w++) masterWave(w);
  masterWave(0, 'subtraction');
  masterWave(1, 'subtraction');
  expect(readiness.tablesReady(p), 'qualifies on the real predicate').toBe(true);
  expect(readiness.tablesVisible(p)).toBe(true);

  // the child is stamped, but has never played a tables round
  const fresh = readiness.stampReveals(p);
  expect(fresh).toContain('track:tables');
  expect(readiness.isRevealed(p, 'track:tables')).toBe(true);

  // now the gate tightens under them — simulate by removing a stride, which
  // makes tablesReady false again
  delete p.little.skills['path:5'];
  expect(readiness.tablesReady(p), 'no longer qualifies').toBe(false);
  expect(readiness.tablesVisible(p), 'but the door stays open').toBe(true);
  // and Grown-Ups says "opened", not "ready" — the predicate really is unmet
  expect(readiness.trackState(p, 'tables')).toBe('revealed');

  // a parent can still hide it: an override outranks the ratchet
  expect(readiness.tablesVisible({ ...p, subjects: { ...p.subjects, tables: false } })).toBe(false);
});

test('a force-show does not stamp the door open', () => {
  // A parent switching a track on to try it, then back to auto, must not
  // permanently open a gate the child never earned.
  const p = newProfile('Forced');
  p.subjects = { ...p.subjects, tables: true };
  expect(readiness.tablesVisible(p)).toBe(true); // by override
  readiness.stampReveals(p);
  expect(readiness.isRevealed(p, 'track:tables'), 'not earned, not stamped').toBe(false);
  expect(readiness.tablesVisible({ ...p, subjects: { ...p.subjects, tables: 'auto' } })).toBe(false);
});

test('reveals survive a merge from a device that never saw them', () => {
  const a = newProfile('Merger');
  a.id = 'merge-kid';
  readiness.ratchetReveals(a, ['track:tables', 'tile:paths']);
  const b = structuredClone(a);
  b.little.revealed = []; // the other device never stamped anything
  const m = mergeProfiles(a, b);
  expect(m.little.revealed).toContain('track:tables');
  expect(m.little.revealed).toContain('tile:paths');
  const m2 = mergeProfiles(b, a);
  expect(m2.little.revealed.sort()).toEqual(m.little.revealed.sort()); // order cannot matter
});

test('a profile that never qualified is unaffected', () => {
  const p = newProfile('Fresh');
  expect(readiness.stampReveals(p)).toEqual([]);
  expect(readiness.tablesVisible(p)).toBe(false);
  expect(readiness.bridgeVisible(p)).toBe(false);
  expect(readiness.trackState(p, 'tables')).toBe('hidden');
});

// --- the pet/milestone pairing, which had been holding by luck -----------

test('every milestone maps to its OWN pet, and the list never wraps', () => {
  // petForMilestone indexes PETS positionally with `% PETS.length`, and
  // checkPetUnlocks de-dupes by MILESTONE id rather than pet id. So one
  // milestone past the end of PETS re-adopts an owned pet: the child is
  // offered a "new friend" they already have, mergeProfiles unions the
  // duplicate petId away, and checkPetUnlocks pushes it again next
  // session — a heal-loop. Nothing tested this; it held by luck.
  expect(PETS.length, 'a pet for every milestone').toBeGreaterThanOrEqual(MILESTONES.length);
  const mapped = MILESTONES.map((m) => petForMilestone(m.id).id);
  expect(new Set(mapped).size, 'no two milestones share a pet').toBe(MILESTONES.length);
  for (const m of MILESTONES) {
    const i = MILESTONES.findIndex((x) => x.id === m.id);
    expect(i, `${m.id} is within PETS`).toBeLessThan(PETS.length);
  }
});
