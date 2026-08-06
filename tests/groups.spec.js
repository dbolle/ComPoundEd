// v1.51.0: Groups! — equal groups and arrays (2.OA.4), the unitizing game.
// The contract these tests defend is pedagogical, not cosmetic
// (docs/PEDAGOGY.md §3): skip counting is not multiplicative reasoning, so a
// fast TOTAL must never be accepted as proof that the child sees the groups.
// Everything else here — the 10-identity catalogue, the canonical factor
// pair, the errorless ladder, the untimed guarantee — exists to keep that
// one property true.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { newProfile, migrateProfile, mergeProfiles, SCHEMA_VERSION } from '../src/data/schema.js';
import {
  GROUP_IDENTITIES,
  GROUP_PAIRS,
  GROUP_SKILL_KEYS,
  GROUP_MIN,
  GROUP_MAX,
  KNOWN_STREAK,
  STAGE_ATTEMPTS,
  TEACH_STAGE,
  RECALL_STAGE,
  groupKey,
  groupIdentity,
  buildGroupQuestion,
  gradeGroupQuestion,
  recordGroupAttempt,
  groupStage,
  orientationFor,
  repeatedAddition,
  groupsKnown,
  groupsProgress,
  groupsFinished,
  groupStreak,
  groupAttempts,
  identityKnown,
  nextGroupIdentity,
  groupsReady,
} from '../src/engine/groups.js';

// A profile parked past the teach rung, so streak-building is live.
const drilling = (name, pair, streak = 0) => {
  const p = newProfile(name);
  p.little.skills[`groups:${pair}`] = { attempts: STAGE_ATTEMPTS * 2, streak };
  return p;
};
const skilled = (game, numbers, streak = KNOWN_STREAK) =>
  Object.fromEntries(numbers.map((n) => [`${game}:${n}`, { attempts: streak, streak }]));

// --- the catalogue --------------------------------------------------------

test('the catalogue is exactly the 10 identities 2.OA.4 allows', () => {
  expect(GROUP_IDENTITIES).toHaveLength(10);
  expect(GROUP_PAIRS).toEqual(['2x2', '2x3', '2x4', '2x5', '3x3', '3x4', '3x5', '4x4', '4x5', '5x5']);
  expect(GROUP_SKILL_KEYS).toEqual(GROUP_PAIRS.map((p) => `groups:${p}`));
  // canonical ordering g <= s, both factors inside 2..5 ("up to 5 rows and
  // up to 5 columns"; 1 teaches nothing about unitizing)
  for (const i of GROUP_IDENTITIES) {
    expect(i.g).toBeLessThanOrEqual(i.s);
    expect(i.g).toBeGreaterThanOrEqual(GROUP_MIN);
    expect(i.s).toBeLessThanOrEqual(GROUP_MAX);
    expect(i.total).toBe(i.g * i.s);
  }
  // every in-range pair, either way round, lands in the catalogue
  for (let g = GROUP_MIN; g <= GROUP_MAX; g++) {
    for (let s = GROUP_MIN; s <= GROUP_MAX; s++) expect(groupIdentity(g, s)).toBeTruthy();
  }
  expect(groupIdentity(1, 4)).toBeNull();
  expect(groupIdentity(6, 2)).toBeNull();
});

test('one identity per factor pair: 3 groups of 4 and 4 groups of 3 are the same thing to know', () => {
  expect(groupKey(3, 4)).toBe('groups:3x4');
  expect(groupKey(3, 4)).toBe(groupKey(4, 3));
  expect(new Set(GROUP_SKILL_KEYS).size).toBe(GROUP_IDENTITIES.length);
  // and the identity is the PAIR, never the total: 3x4 and 2x6 would be
  // different structures sharing 12 (2x6 is out of range; 2x4 vs 4x2 stands
  // in for the same point inside it)
  expect(groupKey(2, 4)).not.toBe(groupKey(2, 2));
  for (const form of ['groups:3x4', '3x4', { g: 4, s: 3 }, { groups: 4, size: 3 }]) {
    expect(groupIdentity(form).key).toBe('groups:3x4');
  }
});

// --- THE anti-shortcut property -------------------------------------------

test('a right TOTAL with a wrong group count masters nothing — a fast total is not unitizing', () => {
  const p = drilling('Skipper', '3x4');
  // the child skip-counts 4, 8, 12 and answers 12 everywhere — including
  // when asked how many GROUPS they counted, the exact confusion the
  // research describes
  for (let i = 0; i < KNOWN_STREAK * 2; i++) {
    const q = buildGroupQuestion(p, '3x4');
    const r = recordGroupAttempt(p, q, { groups: q.total, size: q.size, total: q.total });
    expect(r.parts.total).toBe(true); // the total was right every time
    expect(r.parts.groups).toBe(false);
    expect(r.wrong).toContain('groups');
    expect(r.streak).toBe(0);
    expect(r.known).toBe(false);
  }
  expect(groupStreak(p, '3x4')).toBe(0);
  expect(identityKnown(p, '3x4')).toBe(false);
  expect(groupsKnown(p)).toBe(0);
  expect(groupsProgress(p).done).toBe(0);

  // the same is true of any single missing part: the item is all-or-nothing
  for (const wrongPart of ['groups', 'size', 'total']) {
    const q2 = buildGroupQuestion(p, '3x4');
    const answers = { ...q2.answers, [wrongPart]: q2.answers[wrongPart] + 1 };
    expect(gradeGroupQuestion(q2, answers).allCorrect).toBe(false);
    expect(recordGroupAttempt(p, q2, answers).streak).toBe(0);
  }
  // an unanswered part is a wrong part, not a free pass
  const q3 = buildGroupQuestion(p, '3x4');
  expect(recordGroupAttempt(p, q3, { total: q3.total }).wrong).toEqual(['groups', 'size']);
});

test('all three parts right on the first try, three times, is what mastery means', () => {
  const p = drilling('Honest', '3x4');
  const streaks = [];
  let becameKnown = 0;
  for (let i = 0; i < KNOWN_STREAK; i++) {
    const q = buildGroupQuestion(p, '3x4');
    expect(q.parts.map((x) => x.id)).toEqual(['groups', 'size', 'total']);
    const r = recordGroupAttempt(p, q, q.answers);
    streaks.push(r.streak);
    if (r.becameKnown) becameKnown += 1;
  }
  expect(streaks).toEqual([1, 2, 3]);
  expect(becameKnown).toBe(1); // the coin moment fires exactly once
  expect(identityKnown(p, '3x4')).toBe(true);
  expect(groupsKnown(p)).toBe(1);

  // and a slip resets it: two goods then one bad part is back to zero
  const s = drilling('Slip', '2x5', KNOWN_STREAK - 1);
  const q = buildGroupQuestion(s, '2x5');
  recordGroupAttempt(s, q, { ...q.answers, groups: q.groups + 1 });
  expect(groupStreak(s, '2x5')).toBe(0);
});

// --- the errorless ladder --------------------------------------------------

test('teach-only stages count attempts but never build a streak', () => {
  const p = newProfile('Teachy');
  const first = buildGroupQuestion(p, '2x2');
  expect(first.stage).toBe(TEACH_STAGE);
  expect(first.teachOnly).toBe(true);
  expect(first.showSentence).toBe(true); // the sentence contains the answers

  for (let i = 0; i < STAGE_ATTEMPTS; i++) {
    const q = buildGroupQuestion(p, '2x2', TEACH_STAGE);
    const r = recordGroupAttempt(p, q, q.answers); // perfect every time
    expect(r.teachOnly).toBe(true);
    expect(r.allCorrect).toBe(true);
    expect(r.streak).toBe(0);
    expect(r.attempts).toBe(i + 1);
  }
  expect(groupStreak(p, '2x2')).toBe(0);
  expect(groupAttempts(p, '2x2')).toBe(STAGE_ATTEMPTS);
  expect(identityKnown(p, '2x2')).toBe(false);

  // teach-only never MOVES the streak — a miss while teaching doesn't
  // punish either (the semantics little.js gives dataset.teachOnly)
  const earned = drilling('Keep', '2x2', 2);
  recordGroupAttempt(earned, buildGroupQuestion(earned, '2x2', TEACH_STAGE), {});
  expect(groupStreak(earned, '2x2')).toBe(2);

  // stage 1 is teach-only whatever a caller claims: the answers are on screen
  const lying = drilling('Lying', '2x3', 2);
  const forged = { ...buildGroupQuestion(lying, '2x3', TEACH_STAGE), teachOnly: false };
  const r = recordGroupAttempt(lying, forged, forged.answers);
  expect(r.teachOnly).toBe(true);
  expect(r.streak).toBe(2);
});

test('the stage ladder advances only after enough attempts, and never regresses', () => {
  const p = newProfile('Ladder');
  const seen = [];
  for (let attempts = 0; attempts <= 6; attempts++) {
    p.little.skills['groups:4x5'] = { attempts, streak: 0 };
    seen.push(groupStage(p, '4x5'));
  }
  expect(seen).toEqual([1, 1, 2, 2, 3, 3, 3]);
  expect(seen.every((s, i) => i === 0 || s >= seen[i - 1])).toBe(true);

  // walking it by recording, and what each rung shows
  const w = newProfile('Walk');
  const rungs = [];
  for (let i = 0; i < STAGE_ATTEMPTS * 3; i++) {
    const q = buildGroupQuestion(w, '2x3');
    rungs.push([q.stage, q.showPicture, q.showSentence, q.teachOnly]);
    recordGroupAttempt(w, q, q.answers);
  }
  expect(rungs).toEqual([
    [1, true, true, true], // picture + repeated-addition sentence (teach)
    [1, true, true, true],
    [2, true, false, false], // picture, sentence hidden
    [2, true, false, false],
    [3, false, false, false], // recall
    [3, false, false, false],
  ]);

  // mastery does not send a child back to the picture, and neither does a
  // wrong answer — the ladder is derived from attempts, which only grows
  const q = buildGroupQuestion(w, '2x3');
  recordGroupAttempt(w, q, {});
  expect(groupStage(w, '2x3')).toBe(RECALL_STAGE);
  expect(groupStreak(w, '2x3')).toBe(0);
});

test('recall asks the triad in all three directions, so the total is never sufficient', () => {
  const p = drilling('Recall', '3x5');
  const q = buildGroupQuestion(p, '3x5', RECALL_STAGE, 0);
  expect(q.stage).toBe(RECALL_STAGE);
  expect(q.showPicture).toBe(false);
  expect(q.showSentence).toBe(false);
  expect(q.parts.map((x) => x.answer)).toEqual([3, 5, 15]);
  // each part names two quantities and asks the third
  expect(q.parts[0].ask).toContain('15');
  expect(q.parts[1].ask).toContain('15');
  expect(q.parts[2].ask).not.toContain('15');
  // the group-count question offers the total as a choice: the conflation is
  // available to make, and it costs the streak
  expect(q.parts[0].choices).toContain(15);
  expect(q.parts.every((x) => x.choices.includes(x.answer))).toBe(true);
});

// --- presentation ---------------------------------------------------------

test('both orientations are presentable while mastery stays one identity', () => {
  const p = newProfile('Both');
  const a = buildGroupQuestion(p, '3x4', 2, 0);
  const b = buildGroupQuestion(p, '3x4', 2, 1);
  expect([a.groups, a.size]).toEqual([3, 4]);
  expect([b.groups, b.size]).toEqual([4, 3]);
  expect(b.flipped).toBe(true);
  expect(b.key).toBe(a.key); // ONE identity
  expect(a.sentence).toBe('4 + 4 + 4'); // 3 groups of 4
  expect(b.sentence).toBe('3 + 3 + 3 + 3');
  expect(repeatedAddition(4, 3)).toBe('3 + 3 + 3 + 3');
  // deterministic: the same seed gives the same view, and squares never flip
  expect(orientationFor('3x4', 5)).toEqual(orientationFor('3x4', 5));
  expect(orientationFor('4x4', 1).flipped).toBe(false);
  // a wrong answer against the flipped view still lands on the identity
  const r = recordGroupAttempt(p, b, b.answers);
  expect(r.key).toBe('groups:3x4');
});

test('every item in the catalogue builds a coherent, untimed, markup-free question', () => {
  const p = newProfile('Sweep');
  for (const id of GROUP_IDENTITIES) {
    for (const stage of [1, 2, 3]) {
      for (const seed of [0, 1, 2, 3]) {
        const q = buildGroupQuestion(p, id, stage, seed);
        expect(q.kind).toBe('groups');
        expect(q.key).toBe(id.key);
        expect(q.groups * q.size).toBe(id.total);
        expect(q.total).toBe(id.total);
        expect(q.addends).toEqual(Array.from({ length: q.groups }, () => q.size));
        expect(q.sentence).toBe(repeatedAddition(q.groups, q.size));
        expect(q.parts).toHaveLength(3);
        for (const part of q.parts) {
          expect(part.ask.length).toBeGreaterThan(0);
          expect(part.say.length).toBeGreaterThan(0);
          expect(part.choices).toHaveLength(3);
          expect(new Set(part.choices).size).toBe(3);
          expect(part.choices).toContain(part.answer);
          expect(Math.min(...part.choices)).toBeGreaterThan(0);
        }
        // untimed: unitizing is not a speed skill and the little track has
        // no timing at all
        expect(q.timed).toBe(false);
        expect(JSON.stringify(q)).not.toMatch(/<[a-z]/i); // no markup
      }
    }
  }
});

test('the module is pure domain logic: no DOM, no clock, no randomness, no screens', () => {
  const src = readFileSync('src/engine/groups.js', 'utf8');
  expect(src).not.toMatch(/document|window|localStorage|indexedDB/);
  expect(src).not.toMatch(/Math\.random|Date\.now|performance\.now/);
  expect(src).not.toMatch(/from '\.\.\/screens/);
  // and nothing timed leaks in through the vocabulary of speed
  expect(src).not.toMatch(/setTimeout|fastThreshold/);
});

// --- readiness ------------------------------------------------------------

test('groupsReady: skip-counting 2s and 5s, OR real tables history; never a fresh profile', () => {
  expect(groupsReady(newProfile('Fresh'))).toBe(false);

  const counter = newProfile('Paths');
  counter.little.skills = skilled('path', [2, 5]);
  expect(groupsReady(counter)).toBe(true);

  // a streak of 2 is not knowing (the same bar the little games use)
  const nearly = newProfile('Nearly');
  nearly.little.skills = { ...skilled('path', [2]), ...skilled('path', [5], 2) };
  expect(groupsReady(nearly)).toBe(false);

  // mid-trail inference (v1.41 idiom): a child onboarded straight into the
  // tables must not sit behind counting gates
  const tabler = newProfile('Tables');
  tabler.facts['7x8'] = { attempts: 4, correct: 3, avgMs: 3000, box: 2, lastSeen: Date.now() };
  expect(groupsReady(tabler)).toBe(true);
  const divider = newProfile('Div');
  divider.division['3x9'] = { attempts: 1, correct: 1, avgMs: 2000, box: 1, lastSeen: Date.now() };
  expect(groupsReady(divider)).toBe(true);
  // an echo intro is history too (seen, never answered)
  const met = newProfile('Met');
  met.facts['2x2'] = { attempts: 0, correct: 0, avgMs: 0, box: 0, lastSeen: 0, seen: 1 };
  expect(groupsReady(met)).toBe(true);
  // ...but an empty stat map is not
  const empty = newProfile('Empty');
  empty.facts['2x2'] = { attempts: 0, correct: 0, avgMs: 0, box: 0, lastSeen: 0 };
  expect(groupsReady(empty)).toBe(false);

  // readiness is a question, not a write
  const asked = newProfile('Asked');
  const before = JSON.stringify(asked);
  groupsReady(asked);
  expect(JSON.stringify(asked)).toBe(before);
});

// --- progress -------------------------------------------------------------

test('groupsProgress counts out of 10, with partial credit and a frontier', () => {
  const fresh = newProfile('Zero');
  expect(groupsProgress(fresh)).toMatchObject({ done: 0, total: 10, points: 0, maxPoints: 30 });
  expect(groupsFinished(fresh)).toBe(false);
  expect(nextGroupIdentity(fresh).pair).toBe('2x2'); // smallest total first

  const p = newProfile('Partway');
  for (const pair of ['2x2', '2x3', '2x4', '3x3', '4x4']) {
    p.little.skills[`groups:${pair}`] = { attempts: 8, streak: KNOWN_STREAK };
  }
  p.little.skills['groups:5x5'] = { attempts: 3, streak: 1 };
  const pr = groupsProgress(p);
  expect(pr.total).toBe(10);
  expect(pr.done).toBe(5);
  expect(groupsKnown(p)).toBe(5);
  expect(pr.points).toBe(16); // 5 known ×3 + one streak of 1
  expect(pr.maxPoints).toBe(30);
  expect(pr.known).toEqual(['groups:2x2', 'groups:2x3', 'groups:2x4', 'groups:3x3', 'groups:4x4']);
  expect(pr.frontier.pair).toBe('2x5'); // least practised, smallest total
  expect(groupsFinished(p)).toBe(false);

  const all = newProfile('Done');
  for (const k of GROUP_SKILL_KEYS) all.little.skills[k] = { attempts: 9, streak: KNOWN_STREAK };
  expect(groupsProgress(all)).toMatchObject({ done: 10, total: 10, points: 30 });
  expect(groupsFinished(all)).toBe(true);
  expect(nextGroupIdentity(all)).toBeNull();
});

// --- preservation ---------------------------------------------------------

test('group progress lives in little.skills: migration-neutral and merge-safe', () => {
  // the game adds no new profile field, so an old doc carrying group skills
  // survives migration untouched
  const old = { ...newProfile('Old'), schemaVersion: SCHEMA_VERSION };
  old.little = { xp: 12, skills: { 'groups:3x4': { attempts: 5, streak: 2 } }, revealed: [] };
  const doc = migrateProfile(old);
  expect(doc.little.skills['groups:3x4']).toEqual({ attempts: 5, streak: 2 });
  expect(groupStage(doc, '3x4')).toBe(3);

  // two devices, and neither side's evidence is lost — which also means the
  // ladder cannot regress through a sync (attempts merge by max)
  const a = newProfile('A');
  const b = { ...a };
  a.little = { xp: 4, skills: { 'groups:2x2': { attempts: 6, streak: 3 } }, revealed: [] };
  b.little = {
    xp: 2,
    skills: { 'groups:2x2': { attempts: 2, streak: 1 }, 'groups:2x3': { attempts: 4, streak: 2 } },
    revealed: [],
  };
  const m = mergeProfiles(a, b);
  expect(m.little.skills['groups:2x2']).toEqual({ attempts: 6, streak: 3 });
  expect(m.little.skills['groups:2x3']).toEqual({ attempts: 4, streak: 2 });
  expect(groupsKnown(m)).toBe(1);
  expect(groupStage(m, '2x2')).toBe(3);
  expect(groupStage(m, '2x3')).toBe(groupStage(b, '2x3'));

  // recording writes group keys and nothing else
  const w = newProfile('Writer');
  for (const id of GROUP_IDENTITIES) {
    const q = buildGroupQuestion(w, id);
    recordGroupAttempt(w, q, q.answers);
  }
  expect(Object.keys(w.little.skills).sort()).toEqual([...GROUP_SKILL_KEYS].sort());
  expect(Object.keys(w.facts)).toHaveLength(0);
  expect(Object.keys(w.division)).toHaveLength(0);
  expect(w.little.xp).toBe(0); // xp is the screen's business, not the engine's
  expect(w.pawBucks.txns).toHaveLength(0); // and coins are earned elsewhere
});
