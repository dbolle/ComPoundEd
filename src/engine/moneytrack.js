// The Money Math track's brain: what a child has learned, what comes next,
// and what it pays. Deliberately separate from two neighbours it sits
// between — `moneywaves.js` is the FROZEN list of identities (pinned by a
// fixture so ids can never shift under saved progress) and `money.js` is
// the economy (the ledger, coins, prices). This file is the only one that
// reads a profile's money progress.
//
// Untimed by construction: every recording goes through `recordMoneyAnswer`
// (leitner.js), which passes an infinite speed bar. With a finite one a
// multi-step coin question could never be mastered at all — a
// correct-but-slow answer stops at box 2 and mastery is box 3 — so the
// whole track would stall at wave 1 forever.

import { MONEY_WAVES, MONEY_SKILL_IDS, moneyWaveOf } from './moneywaves.js';
import { MASTERY_BOX, isDue } from './leitner.js';
import { earnSkillKnown, earnSetMastery, earnMoneyMastery } from './money.js';

export { MONEY_WAVES, MONEY_SKILL_IDS, moneyWaveOf };

// Waves 1–4 are recognition and counting, which the trail already teaches
// and already pays a penny for elsewhere; waves 5–7 are the genuinely new
// fluencies — building an amount, counting change up from a price, reading
// ¢ and $ — and those earn the nickel. Owner decision 2026-08-08, halving
// the draft: at the old flat 5¢ the track out-earned the 1200¢ crown, so
// money math alone bought the most aspirational thing in the store.
export const NICKEL_FROM_WAVE = 4; // 0-based: waves 5,6,7 pay 5¢

export function payForWave(waveIdx) {
  return waveIdx >= NICKEL_FROM_WAVE ? 5 : 1;
}

// Three milestones, each adopting one pig. Grouped so a child earns a
// friend for a real capability rather than for every wave.
export const MONEY_MILESTONES = [
  { id: 'm1', label: 'Knows every coin, and counts a pile of one kind', waves: [0, 1] },
  { id: 'm2', label: 'Totals a mixed handful, and swaps equal values', waves: [2, 3] },
  { id: 'm3', label: 'Makes an amount, counts change, reads ¢ and $', waves: [4, 5, 6] },
];

export const moneyStat = (profile, id) => profile?.money?.[id] ?? null;

export function isSkillMastered(profile, id) {
  return (moneyStat(profile, id)?.box ?? 0) >= MASTERY_BOX;
}

export function waveProgress(profile, waveIdx) {
  const w = MONEY_WAVES[waveIdx];
  if (!w) return { done: 0, total: 0 };
  return {
    done: w.skills.filter((id) => isSkillMastered(profile, id)).length,
    total: w.skills.length,
  };
}

export function isWaveMastered(profile, waveIdx) {
  const { done, total } = waveProgress(profile, waveIdx);
  return total > 0 && done === total;
}

// A wave opens when the one before it is finished. Wave 1 is always open,
// so a child who can reach the track can always start it.
export function isWaveUnlocked(profile, waveIdx) {
  return waveIdx === 0 || isWaveMastered(profile, waveIdx - 1);
}

export function currentWave(profile) {
  for (let i = 0; i < MONEY_WAVES.length; i++) if (!isWaveMastered(profile, i)) return i;
  return MONEY_WAVES.length - 1; // everything done: stay on the last for review
}

export function milestoneEarned(profile, i) {
  const m = MONEY_MILESTONES[i];
  return !!m && m.waves.every((w) => isWaveMastered(profile, w));
}

export function milestoneProgress(profile, i) {
  const m = MONEY_MILESTONES[i];
  if (!m) return { have: 0, need: 0 };
  return m.waves.reduce(
    (acc, w) => {
      const p = waveProgress(profile, w);
      return { have: acc.have + p.done, need: acc.need + p.total };
    },
    { have: 0, need: 0 }
  );
}

export function moneyProgress(profile) {
  return {
    done: MONEY_SKILL_IDS.filter((id) => isSkillMastered(profile, id)).length,
    total: MONEY_SKILL_IDS.length,
  };
}

// What to ask next, inside the current wave. Unmastered first (weakest box
// leads), then anything DUE for review — the same freshness windows every
// other track uses, so a mastered coin still comes back occasionally.
export function nextSkills(profile, waveIdx, count) {
  const w = MONEY_WAVES[waveIdx];
  if (!w) return [];
  const learning = [];
  const due = [];
  const rest = [];
  for (const id of w.skills) {
    const s = moneyStat(profile, id);
    if (!s || s.box < MASTERY_BOX) learning.push({ id, box: s?.box ?? 0, seen: s?.lastSeen ?? 0 });
    else if (isDue(s)) due.push({ id, seen: s.lastSeen ?? 0 });
    else rest.push({ id, seen: s.lastSeen ?? 0 });
  }
  learning.sort((a, b) => a.box - b.box || a.seen - b.seen);
  due.sort((a, b) => a.seen - b.seen);
  rest.sort((a, b) => a.seen - b.seen);
  const out = [...learning, ...due, ...rest].map((x) => x.id);
  // A wave shorter than a round repeats rather than running dry.
  while (out.length && out.length < count) out.push(...out.slice(0, count - out.length));
  return out.slice(0, count);
}

// --- earning ---------------------------------------------------------------
// Reasons and amounts are ones that already exist (`skill` = 1¢, `mastery`
// = 5¢, `set` = 100¢), so this needs no RATE_VERSION key and no change to
// fixtures-rates.json — that file keys by reason only. Ids are
// deterministic, so two devices mastering the same identity pay once.

export function payMastered(profile, skillId, now = Date.now()) {
  const w = moneyWaveOf(skillId);
  if (w < 0) return null; // an id this build has never heard of: never pay
  return payForWave(w) === 1
    ? earnSkillKnown(profile, skillId, now)
    : earnMoneyMastery(profile, skillId, now);
}

export function payMilestones(profile, now = Date.now()) {
  const paid = [];
  MONEY_MILESTONES.forEach((m, i) => {
    if (!milestoneEarned(profile, i)) return;
    const txn = earnSetMastery(profile, m.id, 'money', now);
    if (txn) paid.push(txn);
  });
  return paid;
}
