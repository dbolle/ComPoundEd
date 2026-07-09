// Achievements: one stacked award per family, climbing tiers (Bronze →
// Legend) instead of separate saturating badges. Counter families are
// ENDLESS — past Legend each next tier doubles the threshold — so the
// behaviors worth encouraging (recovering from mistakes, showing up, caring
// for the pack) always have a next goal.

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

export function bumpAnswer(profile, r) {
  const s = ensureStats(profile);
  if (r.correct) {
    s.currentStreak += 1;
    s.bestStreak = Math.max(s.bestStreak, s.currentStreak);
  } else if (!r.firstAttempt) {
    // A miss on a brand-new fact is streak-NEUTRAL: exploring never costs
    // the streak, so trying untried facts is the safest move on the board.
    s.currentStreak = 0;
  }
  if (r.fast) s.fastAnswers += 1;
  if (r.comeback) s.comebacks += 1;
  // Bravery is the attempt itself — counted whether or not it was right.
  if (r.firstAttempt) s.braveTries = (s.braveTries ?? 0) + 1;
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

// --- Tiers

export const TIERS = [
  { name: 'Bronze', emoji: '🥉' },
  { name: 'Silver', emoji: '🥈' },
  { name: 'Gold', emoji: '🥇' },
  { name: 'Diamond', emoji: '💎' },
  { name: 'Royal', emoji: '👑' },
  { name: 'Legend', emoji: '🌈' },
];

export function tierInfo(tier) {
  if (tier <= 0) return { name: '—', emoji: '▫️' };
  if (tier <= TIERS.length) return TIERS[tier - 1];
  return { name: `Legend ×${tier - TIERS.length + 1}`, emoji: '🌈' };
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
// Speed is "time barriers broken" so it fits the same climbs-a-ladder model.
export const SPEED_BARRIERS_MS = [90000, 60000, 45000, 35000];
const speedValue = (p) =>
  SPEED_BARRIERS_MS.filter(
    (ms) => p.stats?.fastestPerfectMs != null && p.stats.fastestPerfectMs <= ms
  ).length;

// --- The families. endless: thresholds keep doubling past the last one.

const F = (id, emoji, name, desc, thresholds, value, endless = false) => ({
  id,
  emoji,
  name,
  desc,
  thresholds,
  value,
  endless,
});

export const FAMILIES = [
  F('rounds', '🎾', 'Fetcher', 'Rounds finished', [1, 10, 50, 150, 400, 1000], (p) => p.stats.rounds, true),
  F('streak', '🔥', 'Hot Streak', 'Most correct answers in a row', [5, 10, 25, 50, 100, 250], (p) => p.stats.bestStreak, true),
  F('perfect', '🌟', 'Perfect Rounds', '10-out-of-10 rounds', [1, 5, 25, 75, 200, 500], (p) => p.stats.perfectRounds, true),
  F('speed', '🏎️', 'Speed Runner', 'Perfect-round time barriers broken (90s, 60s, 45s, 35s)', [1, 2, 3, 4], speedValue),
  F('flash', '⚡', 'Quick Paws', 'Lightning-fast answers', [1, 25, 100, 400, 1000, 2500], (p) => p.stats.fastAnswers, true),
  F('comeback', '💪', 'Bounce Back', 'Facts nailed after missing them', [1, 10, 50, 150, 400, 1000], (p) => p.stats.comebacks, true),
  F('brave', '🦁', 'Brave Paw', 'Brand-new facts tried (right or wrong!)', [1, 10, 30, 75, 150, 300], (p) => p.stats.braveTries ?? 0, true),
  F('answers', '📚', 'Scholar Pup', 'Questions answered', [100, 500, 1000, 2500, 5000, 10000], (p) => profileTotals(p).attempts, true),
  F('care', '🦴', 'Best Friend', 'Pet play sessions', [1, 10, 50, 150, 400, 1000], (p) => p.stats.activities, true),
  F('pals', '🐕', 'Pack Pal', 'Different dogs played with', [3, 8, 15, 25], dogsCaredFor),
  F('sitter', '🏡', 'Pet Sitter', 'Pet-sitting visits', [1, 10, 30, 75, 150, 300], (p) => p.stats.sittings, true),
  F('pack', '🐶', 'The Pack', 'Dogs adopted', [2, 5, 13, 19, 25], (p) => p.unlocks.length),
  F('tables', '🧠', 'Times Tamer', 'Times tables mastered', [1, 3, 6, 9, 12], tablesMastered),
  F('division', '🧩', 'Division Explorer', '÷tables mastered', [1, 3, 6, 9, 12], divTablesMastered),
  F('facts', '⭐', 'Fact Collector', 'Multiplication facts mastered', [10, 30, 45, 70, 90], (p) => profileTotals(p).mastered),
];

export function thresholdFor(family, tier) {
  const t = family.thresholds;
  if (tier <= t.length) return t[tier - 1];
  if (!family.endless) return null;
  return t[t.length - 1] * 2 ** (tier - t.length);
}

export function tierOf(family, profile) {
  const v = family.value(profile);
  let tier = 0;
  for (;;) {
    const th = thresholdFor(family, tier + 1);
    if (th == null || v < th) break;
    tier += 1;
  }
  return tier;
}

// Raises stored tiers and returns the families that climbed (one entry per
// family at its new highest tier, for the celebration reveal).
export function checkAchievements(profile) {
  ensureStats(profile);
  const newly = [];
  for (const f of FAMILIES) {
    const stored = profile.achievements[f.id]?.tier ?? 0;
    const now = tierOf(f, profile);
    if (now > stored) {
      profile.achievements[f.id] = {
        tier: now,
        at: profile.achievements[f.id]?.at ?? Date.now(),
      };
      const t = tierInfo(now);
      newly.push({ id: f.id, emoji: f.emoji, name: `${f.name}: ${t.name} ${t.emoji}`, tier: now });
    }
  }
  return newly;
}

// The closest next tiers, for "Next up!". Endless families guarantee there
// is always something within reach.
export function nextUp(profile, n = 3) {
  ensureStats(profile);
  return FAMILIES.map((f) => {
    const stored = profile.achievements[f.id]?.tier ?? 0;
    const target = thresholdFor(f, stored + 1);
    if (target == null) return null; // bounded family, complete
    return {
      id: f.id,
      emoji: f.emoji,
      name: f.name,
      desc: f.desc,
      current: Math.min(f.value(profile), target),
      target,
      nextTier: tierInfo(stored + 1),
    };
  })
    .filter(Boolean)
    .sort((x, y) => y.current / y.target - x.current / x.target)
    .slice(0, n);
}

export function totalTiers(profile) {
  return Object.values(profile.achievements ?? {}).reduce((sum, a) => sum + (a?.tier ?? 0), 0);
}
