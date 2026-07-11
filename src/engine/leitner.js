// Leitner-box spaced repetition tuned for short kid sessions.
// Facts are stored under a normalized key ("3x4" covers both 3×4 and 4×3).
// Correct-but-slow answers (e.g. skip counting) climb the early boxes up to
// SLOW_CAP so the learning stage earns visible progress; only correct AND
// fast answers climb beyond it, so mastery still means memorized. A wrong
// answer drops one box (gentler than classic reset-to-zero).

export const MAX_BOX = 5;
export const MASTERY_BOX = 3;
export const SLOW_CAP = 2;
export const FAST_MS = 6000; // default bar until the kid is calibrated

// The "fast answer" bar adapts to each kid's own mechanical speed, measured
// on gimme facts (×0/×1 — no recall needed, just reading and typing). A slow
// typist gets a fair bar; a quick one gets a real fluency target.
const MIN_CALIBRATION_SAMPLES = 5;
const GIMME_SAMPLE_MAX_MS = 20000; // ignore walked-away-from-the-tablet outliers

function isGimme(a, b) {
  return a <= 1 || b <= 1;
}

export function fastThresholdMs(profile) {
  const s = profile.speed;
  if (!s || s.samples < MIN_CALIBRATION_SAMPLES) return FAST_MS;
  return Math.round(Math.min(10000, Math.max(4000, s.avgMs * 1.5 + 1500)));
}

export function isCalibrated(profile) {
  return (profile.speed?.samples ?? 0) >= MIN_CALIBRATION_SAMPLES;
}

export const TABLE_MIN = 1;
export const TABLE_MAX = 12;
export const FACTOR_MIN = 0;
export const FACTOR_MAX = 12;

export function normKey(a, b) {
  return a <= b ? `${a}x${b}` : `${b}x${a}`;
}

function emptyStat() {
  return { attempts: 0, correct: 0, avgMs: 0, box: 0, lastSeen: 0 };
}

export function getStat(profile, a, b) {
  return profile.facts[normKey(a, b)] ?? emptyStat();
}

// Shared Leitner update; returns per-answer flags the UI turns into
// micro-celebrations.
function applyAnswer(s, correct, ms, fastMs) {
  const prevBox = s.box;
  const hadMisses = s.attempts - s.correct > 0;
  const firstAttempt = s.attempts === 0;
  s.attempts += 1;
  if (correct) s.correct += 1;
  s.avgMs = s.avgMs ? Math.round(s.avgMs * 0.7 + ms * 0.3) : Math.round(ms);
  const fast = correct && ms <= fastMs;
  if (fast) {
    s.box = Math.min(MAX_BOX, s.box + 1);
  } else if (correct) {
    if (s.box < SLOW_CAP) s.box += 1;
  } else {
    s.box = Math.max(0, s.box - 1);
  }
  s.lastSeen = Date.now();
  return {
    stat: s,
    correct,
    fast,
    firstAttempt,
    leveledUp: s.box > prevBox,
    firstCorrect: correct && s.correct === 1,
    comeback: correct && hadMisses,
  };
}

export function recordAnswer(profile, a, b, correct, ms) {
  const key = normKey(a, b);
  const s = profile.facts[key] ?? (profile.facts[key] = emptyStat());
  const res = applyAnswer(s, correct, ms, fastThresholdMs(profile));
  if (correct && isGimme(a, b) && ms < GIMME_SAMPLE_MAX_MS) {
    const sp = profile.speed ?? (profile.speed = { avgMs: 0, samples: 0 });
    sp.avgMs = sp.samples ? Math.round(sp.avgMs * 0.7 + ms * 0.3) : Math.round(ms);
    sp.samples += 1;
  }
  return res;
}

// --- Division track (missing-factor → ÷), same Leitner rules on its own
// stat map. A fact family joins the track once its multiplication fact is
// mastered; division practice never feeds the speed baseline.

export function getDivStat(profile, a, b) {
  return (profile.division ?? {})[normKey(a, b)] ?? emptyStat();
}

export function recordDivisionAnswer(profile, a, b, correct, ms) {
  if (!profile.division) profile.division = {};
  const key = normKey(a, b);
  const s = profile.division[key] ?? (profile.division[key] = emptyStat());
  return applyAnswer(s, correct, ms, fastThresholdMs(profile));
}

// The ÷t table opens once the ×t table is mastered.
export function divisionTableUnlocked(profile, table) {
  return isTableMastered(profile, table);
}

export function divisionTableProgress(profile, table) {
  let done = 0;
  let points = 0;
  const total = FACTOR_MAX - FACTOR_MIN + 1;
  for (let b = FACTOR_MIN; b <= FACTOR_MAX; b++) {
    const box = getDivStat(profile, table, b).box;
    if (box >= MASTERY_BOX) done += 1;
    points += Math.min(box, MASTERY_BOX);
  }
  return { done, total, points, maxPoints: total * MASTERY_BOX };
}

export function isDivisionTableMastered(profile, table) {
  const { done, total } = divisionTableProgress(profile, table);
  return done === total;
}

// Due facts within one table (each track) — feeds the grooming "dirt" level.
export function tableDueCount(profile, table) {
  let n = 0;
  for (let b = FACTOR_MIN; b <= FACTOR_MAX; b++) {
    const s = getStat(profile, table, b);
    if (s.attempts > 0 && isDue(s)) n += 1;
  }
  return n;
}

export function divisionTableDueCount(profile, table) {
  let n = 0;
  for (let b = FACTOR_MIN; b <= FACTOR_MAX; b++) {
    const s = getDivStat(profile, table, b);
    if (s.attempts > 0 && isDue(s)) n += 1;
  }
  return n;
}

// How many of a table's facts have ever been attempted (0 = untried table).
export function tableTriedCount(profile, table) {
  let n = 0;
  for (let b = FACTOR_MIN; b <= FACTOR_MAX; b++) {
    if (getStat(profile, table, b).attempts > 0) n += 1;
  }
  return n;
}

export function divisionTriedCount(profile, table) {
  let n = 0;
  for (let b = FACTOR_MIN; b <= FACTOR_MAX; b++) {
    if (getDivStat(profile, table, b).attempts > 0) n += 1;
  }
  return n;
}

export function divisionMasteredCount(profile) {
  let n = 0;
  for (const s of Object.values(profile.division ?? {})) {
    if (s.box >= MASTERY_BOX) n += 1;
  }
  return n;
}

// Review freshness: how long each box stays fresh without practice. A fact
// past its window is "due" — computed, never stored, so nothing in the kid's
// data ever regresses; due facts just get picked for rounds again.
export const BOX_FRESH_MS = [0, 1, 2, 4, 7, 21].map((days) => days * 86400e3);

export function isDue(stat, now = Date.now()) {
  if (stat.attempts === 0) return true;
  return now - stat.lastSeen > BOX_FRESH_MS[Math.min(stat.box, MAX_BOX)];
}

// Mastered facts currently past their freshness window (parent-facing count).
export function dueCount(profile, now = Date.now()) {
  let n = 0;
  for (const s of Object.values(profile.facts)) {
    if (s.box >= MASTERY_BOX && isDue(s, now)) n += 1;
  }
  return n;
}

export function tableProgress(profile, table) {
  let done = 0;
  let points = 0;
  const total = FACTOR_MAX - FACTOR_MIN + 1;
  for (let b = FACTOR_MIN; b <= FACTOR_MAX; b++) {
    const box = getStat(profile, table, b).box;
    if (box >= MASTERY_BOX) done += 1;
    // Partial credit so meters move from the very first good answer,
    // even though unlocking still requires full mastery.
    points += Math.min(box, MASTERY_BOX);
  }
  return { done, total, points, maxPoints: total * MASTERY_BOX };
}

export function isTableMastered(profile, table) {
  const { done, total } = tableProgress(profile, table);
  return done === total;
}

export function profileTotals(profile) {
  let attempts = 0;
  let correct = 0;
  let mastered = 0;
  for (const s of Object.values(profile.facts)) {
    attempts += s.attempts;
    correct += s.correct;
    if (s.box >= MASTERY_BOX) mastered += 1;
  }
  return { attempts, correct, mastered };
}
