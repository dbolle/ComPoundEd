// Picks the one round most worth playing next, so the home screen can offer
// a single "Practice next" button instead of making the kid scan two grids.

import {
  tableProgress,
  isTableMastered,
  divisionTableProgress,
  divisionTableUnlocked,
  isDivisionTableMastered,
  getStat,
  isDue,
  TABLE_MIN,
  TABLE_MAX,
  FACTOR_MIN,
  FACTOR_MAX,
} from './leitner.js';

// Gentle pedagogy for brand-new kids: easy patterns first.
const PED_ORDER = [1, 2, 10, 5, 3, 4, 6, 7, 8, 9, 11, 12];

export function suggestNext(profile) {
  let best = null;
  const consider = (cand) => {
    if (!best || cand.ratio > best.ratio || (cand.ratio === best.ratio && cand.rank < best.rank)) {
      best = cand;
    }
  };
  PED_ORDER.forEach((t, rank) => {
    if (!isTableMastered(profile, t)) {
      const p = tableProgress(profile, t);
      consider({
        label: `×${t}`,
        href: `/quiz?table=${t}`,
        ratio: p.points / p.maxPoints,
        rank,
      });
    } else if (divisionTableUnlocked(profile, t) && !isDivisionTableMastered(profile, t)) {
      // Newly unlocked division content gets a head start so it actually
      // gets suggested once its × table is done.
      const p = divisionTableProgress(profile, t);
      consider({
        label: `÷${t}`,
        href: `/quiz?dtable=${t}`,
        ratio: 0.15 + (p.points / p.maxPoints) * 0.85,
        rank,
      });
    }
  });
  if (best) return best;

  // Everything mastered: suggest a refresh of the table with the most
  // rusty facts; null (no button) when nothing needs attention.
  let refresh = null;
  for (let t = TABLE_MIN; t <= TABLE_MAX; t++) {
    let due = 0;
    for (let b = FACTOR_MIN; b <= FACTOR_MAX; b++) {
      if (isDue(getStat(profile, t, b))) due += 1;
    }
    if (due > 0 && (!refresh || due > refresh.due)) {
      refresh = { label: `×${t}`, href: `/quiz?table=${t}`, due };
    }
  }
  return refresh;
}
