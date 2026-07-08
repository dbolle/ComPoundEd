// Achievements: laddered awards so there are quick wins early and always
// something within reach. Every award is the same shape — earned when
// value(profile) >= target — which makes progress bars automatic.

import { EMPTY_STATS } from '../data/schema.js';
import {
  profileTotals,
  divisionMasteredCount,
  isTableMastered,
  isDivisionTableMastered,
  TABLE_MIN,
  TABLE_MAX,
} from './leitner.js';

export function ensureStats(profile) {
  if (!profile.stats) profile.stats = EMPTY_STATS();
  if (!profile.achievements) profile.achievements = {};
  return profile.stats;
}

// --- Lifetime counter updates (call from the screens, then checkAchievements)

// Per answer; returns the stats object so callers can read currentStreak.
export function bumpAnswer(profile, r) {
  const s = ensureStats(profile);
  if (r.correct) {
    s.currentStreak += 1;
    s.bestStreak = Math.max(s.bestStreak, s.currentStreak);
  } else {
    s.currentStreak = 0;
  }
  if (r.fast) s.fastAnswers += 1;
  if (r.comeback) s.comebacks += 1;
  return s;
}

export function bumpRound(profile, { perfect, durationMs }) {
  const s = ensureStats(profile);
  s.rounds += 1;
  if (perfect) {
    s.perfectRounds += 1;
    const t = Math.round(durationMs);
    if (s.fastestPerfectMs == null || t < s.fastestPerfectMs) s.fastestPerfectMs = t;
  }
}

export function bumpActivity(profile, { sitting = false } = {}) {
  const s = ensureStats(profile);
  if (sitting) s.sittings += 1;
  else s.activities += 1;
}

// --- Derived values

const tablesMastered = (p) => {
  let n = 0;
  for (let t = TABLE_MIN; t <= TABLE_MAX; t++) if (isTableMastered(p, t)) n += 1;
  return n;
};
const divTablesMastered = (p) => {
  let n = 0;
  for (let t = TABLE_MIN; t <= TABLE_MAX; t++) if (isDivisionTableMastered(p, t)) n += 1;
  return n;
};
const dogsCaredFor = (p) =>
  Object.values(p.play ?? {}).filter((c) => (c.walk ?? 0) + (c.feed ?? 0) + (c.fetch ?? 0) > 0)
    .length;
const perfectUnder = (p, ms) =>
  p.stats?.fastestPerfectMs != null && p.stats.fastestPerfectMs <= ms ? 1 : 0;

// --- The catalog. Ordered roughly easiest → grandest within each family.

const A = (id, emoji, name, desc, target, value) => ({ id, emoji, name, desc, target, value });

export const CATALOG = [
  // First steps — quick wins in the first session or two
  A('round-1', '🎾', 'First Fetch', 'Finish your very first round', 1, (p) => p.stats.rounds),
  A('flash-1', '⚡', 'Quick Paws', 'Get a lightning-fast answer', 1, (p) => p.stats.fastAnswers),
  A('comeback-1', '💪', 'Bounce Back', 'Get a fact right after missing it', 1, (p) => p.stats.comebacks),
  A('perfect-1', '🌟', 'Perfect Ten', 'Score 10 out of 10 in a round', 1, (p) => p.stats.perfectRounds),
  A('care-1', '🦴', 'Playtime!', 'Walk, feed, or play fetch with a dog', 1, (p) => p.stats.activities),

  // Streaks (best ever, carries across rounds)
  A('streak-5', '🔥', 'On a Roll', '5 correct answers in a row', 5, (p) => p.stats.bestStreak),
  A('streak-10', '🔥', 'Hot Streak', '10 in a row', 10, (p) => p.stats.bestStreak),
  A('streak-25', '🌋', 'Unstoppable', '25 in a row', 25, (p) => p.stats.bestStreak),
  A('streak-50', '🚀', 'Rocket Roll', '50 in a row', 50, (p) => p.stats.bestStreak),
  A('streak-100', '👑', 'Streak Royalty', '100 in a row!', 100, (p) => p.stats.bestStreak),

  // Perfect rounds & speed runs
  A('perfect-5', '✨', 'High Five', '5 perfect rounds', 5, (p) => p.stats.perfectRounds),
  A('perfect-25', '💎', 'Diamond Rounds', '25 perfect rounds', 25, (p) => p.stats.perfectRounds),
  A('speed-60', '🏎️', 'Speed Run', 'A perfect round in under a minute', 1, (p) => perfectUnder(p, 60000)),
  A('speed-40', '⚡', 'Lightning Round', 'A perfect round in under 40 seconds', 1, (p) => perfectUnder(p, 40000)),

  // Persistence
  A('comeback-10', '🧗', 'Never Give Up', '10 comebacks', 10, (p) => p.stats.comebacks),
  A('comeback-50', '🛡️', 'Iron Will', '50 comebacks', 50, (p) => p.stats.comebacks),

  // Practice volume
  A('answers-100', '🐾', 'Century Club', 'Answer 100 questions', 100, (p) => profileTotals(p).attempts),
  A('answers-500', '📚', 'Scholar Pup', 'Answer 500 questions', 500, (p) => profileTotals(p).attempts),
  A('answers-1000', '🎓', 'Math Professor', 'Answer 1000 questions', 1000, (p) => profileTotals(p).attempts),

  // Pet care
  A('care-10', '🎾', 'Good Human', '10 pet play sessions', 10, (p) => p.stats.activities),
  A('care-50', '🥇', 'Best Friend', '50 pet play sessions', 50, (p) => p.stats.activities),
  A('carer-3', '🐕', 'Pack Pal', 'Play with 3 different dogs', 3, dogsCaredFor),
  A('carer-8', '🐕‍🦺', 'Pack Leader', 'Play with 8 different dogs', 8, dogsCaredFor),
  A('sitter-1', '🏡', 'Pet Sitter', 'Look after a visiting pup', 1, (p) => p.stats.sittings),
  A('sitter-10', '🏘️', 'Super Sitter', '10 pet-sitting visits', 10, (p) => p.stats.sittings),

  // The pack
  A('pack-2', '🐶', 'New Friend', 'Adopt your 2nd dog', 2, (p) => p.unlocks.length),
  A('pack-5', '🐕', 'Growing Pack', 'Adopt 5 dogs', 5, (p) => p.unlocks.length),
  A('pack-13', '🌟', 'Big Pack', 'Adopt 13 dogs', 13, (p) => p.unlocks.length),
  A('pack-25', '👑', 'The Whole Pack', 'Adopt all 25 dogs', 25, (p) => p.unlocks.length),

  // Mastery
  A('table-1', '🧠', 'Table Tamer', 'Master your first times table', 1, tablesMastered),
  A('table-3', '🥉', 'Triple Tamer', 'Master 3 times tables', 3, tablesMastered),
  A('table-6', '🥈', 'Half Way Hero', 'Master 6 times tables', 6, tablesMastered),
  A('table-12', '🥇', 'Times Master', 'Master all 12 times tables', 12, tablesMastered),
  A('div-1', '🧩', 'Division Explorer', 'Master your first ÷table', 1, divTablesMastered),
  A('div-12', '🏆', 'Division Champion', 'Master all 12 ÷tables', 12, divTablesMastered),
  A('facts-45', '⭐', 'Fact Collector', 'Master 45 multiplication facts', 45, (p) => profileTotals(p).mastered),
  A('facts-90', '🌟', 'Fact Wizard', 'Master all 90 multiplication facts', 90, (p) => profileTotals(p).mastered),
];

// Awards any newly earned achievements and returns them (for celebration).
export function checkAchievements(profile) {
  ensureStats(profile);
  const newly = [];
  for (const a of CATALOG) {
    if (profile.achievements[a.id] != null) continue;
    if (a.value(profile) >= a.target) {
      profile.achievements[a.id] = Date.now();
      newly.push(a);
    }
  }
  return newly;
}

// The nearest unearned awards, for the "Next up!" section.
export function nextUp(profile, n = 3) {
  ensureStats(profile);
  return CATALOG.filter((a) => profile.achievements[a.id] == null)
    .map((a) => ({ ...a, current: Math.min(a.value(profile), a.target) }))
    .sort((x, y) => y.current / y.target - x.current / x.target)
    .slice(0, n);
}
