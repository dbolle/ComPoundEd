// Addition strategy waves: the evidence-backed teaching order for the 66
// facts a+b (addends 0-10, a <= b). A fact belongs to its FIRST matching
// wave; waves unlock sequentially, so strategies build on each other.
// (docs/PHASE5.md is the plan of record.)

import { getAddStat, getSubStat, isDue, MASTERY_BOX } from './leitner.js';
import { ROUND_SIZE } from './selector.js';

export const WAVES = [
  { id: 1, name: 'Step Ups', emoji: '\u{1F463}', match: (a) => a <= 2 },
  { id: 2, name: 'Doubles', emoji: '\u{1F46F}', match: (a, b) => a === b },
  { id: 3, name: 'Make Ten', emoji: '\u{1F91D}', match: (a, b) => a + b === 10 },
  { id: 4, name: 'Near Doubles', emoji: '\u{1FA9E}', match: (a, b) => b === a + 1 },
  { id: 5, name: 'Tens & Teens', emoji: '\u{1F51F}', match: (a, b) => b === 10 },
  { id: 6, name: 'Ten Bridgers', emoji: '\u{1F309}', match: (a, b) => b >= 8 && a + b > 10 },
  { id: 7, name: 'Grand Finale', emoji: '\u{1F386}', match: () => true },
];

export function waveIndexOf(a, b) {
  const [lo, hi] = a <= b ? [a, b] : [b, a];
  return WAVES.findIndex((w) => w.match(lo, hi));
}

const factCache = [];
export function waveFacts(waveIdx) {
  if (!factCache.length) {
    for (const w of WAVES) factCache.push([]);
    for (let a = 0; a <= 10; a++) {
      for (let b = a; b <= 10; b++) factCache[waveIndexOf(a, b)].push([a, b]);
    }
  }
  return factCache[waveIdx];
}

export function waveProgress(profile, waveIdx) {
  const facts = waveFacts(waveIdx);
  let done = 0;
  let points = 0;
  for (const [a, b] of facts) {
    const box = getAddStat(profile, a, b).box;
    if (box >= MASTERY_BOX) done += 1;
    points += Math.min(box, MASTERY_BOX);
  }
  return { done, total: facts.length, points, maxPoints: facts.length * MASTERY_BOX };
}

export function isWaveMastered(profile, waveIdx) {
  const p = waveProgress(profile, waveIdx);
  return p.done === p.total;
}

export function waveUnlocked(profile, waveIdx) {
  return waveIdx === 0 || isWaveMastered(profile, waveIdx - 1);
}

// A wave round: weakest facts first (due mastered ones jump the queue),
// topped up with a couple of earlier-wave refreshers when there is room.
export function buildAdditionRound(profile, waveIdx) {
  const rank = ([a, b]) => {
    const s = getAddStat(profile, a, b);
    return (s.attempts > 0 && isDue(s) ? -10 : 0) + s.box + Math.random();
  };
  const pool = [...waveFacts(waveIdx)].sort((x, y) => rank(x) - rank(y));
  const picks = pool.slice(0, ROUND_SIZE);
  let i = 0;
  while (picks.length < ROUND_SIZE && pool.length) picks.push(pool[i++ % pool.length]);
  // sprinkle up to 2 rusty facts from earlier waves
  const rusty = [];
  for (let w = 0; w < waveIdx; w++) {
    for (const [a, b] of waveFacts(w)) {
      const s = getAddStat(profile, a, b);
      if (s.attempts > 0 && isDue(s)) rusty.push([a, b]);
    }
  }
  for (const f of rusty.sort(() => Math.random() - 0.5).slice(0, 2)) {
    picks[Math.floor(Math.random() * picks.length)] = f;
  }
  return picks
    .sort(() => Math.random() - 0.5)
    .map(([a, b]) => {
      const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a];
      return {
        kind: 'add',
        a: x,
        b: y,
        answer: x + y,
        text: `${x} + ${y}`,
        correction: `${x} + ${y} = ${x + y}`,
      };
    });
}

// --- Subtraction (Taking Away): the same seven waves, one Leitner entry
// per fact FAMILY (keyed by the addition fact it inverts). A wave opens
// when its ADDITION wave is mastered — think-addition needs the addition
// facts in place first, exactly as ÷t waits for ×t.

export function subWaveProgress(profile, waveIdx) {
  const facts = waveFacts(waveIdx);
  let done = 0;
  let points = 0;
  for (const [a, b] of facts) {
    const box = getSubStat(profile, a, b).box;
    if (box >= MASTERY_BOX) done += 1;
    points += Math.min(box, MASTERY_BOX);
  }
  return { done, total: facts.length, points, maxPoints: facts.length * MASTERY_BOX };
}

export function isSubWaveMastered(profile, waveIdx) {
  const p = subWaveProgress(profile, waveIdx);
  return p.done === p.total;
}

export function subWaveUnlocked(profile, waveIdx) {
  return isWaveMastered(profile, waveIdx);
}

// A Taking Away round. Presentation follows the family's own box: early
// reps use the missing-addend bridge ("8 + _ = 12" — the Number Friends
// format), and once it's warming up (box ≥ 2) the − symbol takes over.
export function buildSubtractionRound(profile, waveIdx) {
  const rank = ([a, b]) => {
    const s = getSubStat(profile, a, b);
    return (s.attempts > 0 && isDue(s) ? -10 : 0) + s.box + Math.random();
  };
  const pool = [...waveFacts(waveIdx)].sort((x, y) => rank(x) - rank(y));
  const picks = pool.slice(0, ROUND_SIZE);
  let i = 0;
  while (picks.length < ROUND_SIZE && pool.length) picks.push(pool[i++ % pool.length]);
  const rusty = [];
  for (let w = 0; w < WAVES.length; w++) {
    if (w === waveIdx || !subWaveUnlocked(profile, w)) continue;
    for (const [a, b] of waveFacts(w)) {
      const s = getSubStat(profile, a, b);
      if (s.attempts > 0 && isDue(s)) rusty.push([a, b]);
    }
  }
  for (const f of rusty.sort(() => Math.random() - 0.5).slice(0, 2)) {
    picks[Math.floor(Math.random() * picks.length)] = f;
  }
  return picks
    .sort(() => Math.random() - 0.5)
    .map(([a, b]) => {
      const c = a + b;
      const given = Math.random() < 0.5 ? a : b;
      const answer = c - given;
      const minusForm = getSubStat(profile, a, b).box >= 2;
      return {
        kind: 'sub',
        a,
        b,
        given,
        answer,
        text: minusForm ? `${c} − ${given}` : `${given} + _ = ${c}`,
        correction: minusForm ? `${c} − ${given} = ${answer}` : `${given} + ${answer} = ${c}`,
      };
    });
}
