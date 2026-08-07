// Picks the one round most worth playing next, so the home screen can offer
// a single "Practice next" button instead of making the kid scan two grids.

import {
  tableProgress,
  isTableMastered,
  tableDueCount,
  divisionTableProgress,
  divisionTableUnlocked,
  isDivisionTableMastered,
  tableTriedCount,
  divisionTriedCount,
  getStat,
  getDivStat,
  normKey,
  isDue,
  TABLE_MIN,
  TABLE_MAX,
  FACTOR_MIN,
  FACTOR_MAX,
} from './leitner.js';
import { dogForTable, dogForDivTable, dirtFor, DOGS } from '../art/dogs.js';
import { isUnlocked } from './unlocks.js';
import { bridgeVisible, tablesVisible } from './readiness.js';
import { WAVES, waveProgress, waveUnlocked, subWaveProgress, subWaveUnlocked } from './waves.js';

// Gentle pedagogy for brand-new kids: easy patterns first.
const PED_ORDER = [1, 2, 10, 5, 3, 4, 6, 7, 8, 9, 11, 12];

// --- Grooming (maintenance) -------------------------------------------
// A bath is 13 questions of the dog's own facts, DUE FIRST (buildGroomRound),
// and every due fact answered right pays a polish penny. It is the app's
// activity for decayed facts, so it belongs in this ranking — but it is
// MAINTENANCE, and rewards and attention follow the learning frontier.
//
// "Dust" is therefore counted ONLY on tables the child has already made
// strong (the dogs they've adopted — a dog exists to be groomed because its
// table is done). That single rule keeps grooming off the frontier's turf
// for free: a child grinding new facts has piles of box-0 facts that are
// always due (BOX_FRESH_MS[0] === 0), and none of them count as dust, so a
// beginner or a child mid-table is never told to take a bath instead of
// learning. Only decayed *mastery* is dust, exactly like the pack grid's
// dirt and the parent-facing dueCount().
const DUST_FOR_BATH = 8; // of the bath's 13 questions
const DUST_FOR_FULL_METER = 26; // two dogs' worth of rot maxes the ranking
const FILTHY = 3; // dirtFor level the child can SEE on the pack grid

// Every adopted dog whose own table is mastered, with how many of its facts
// have gone dusty (its dirt, exactly as the pack grid draws it), plus the
// board's DISTINCT dusty facts — 3×4 makes both Waffles and Luna dusty but
// is one question in a bath, and the threshold below is measured in
// questions. (A table that slipped back below mastery has returned to the
// frontier — it is learning again, not maintenance.)
function dustSurvey(profile) {
  const dogs = [];
  const facts = new Set();
  for (const dog of DOGS) {
    const table = dog.divTable ?? dog.table;
    if (table == null || !isUnlocked(profile, dog.id)) continue;
    const div = dog.divTable != null;
    if (div ? !isDivisionTableMastered(profile, table) : !isTableMastered(profile, table)) continue;
    let due = 0;
    for (let b = FACTOR_MIN; b <= FACTOR_MAX; b++) {
      const s = div ? getDivStat(profile, table, b) : getStat(profile, table, b);
      if (s.attempts > 0 && isDue(s)) {
        due += 1;
        facts.add(`${div ? '÷' : '×'}${normKey(table, b)}`);
      }
    }
    if (due > 0) dogs.push({ dog, due });
  }
  return { dogs, dust: facts.size };
}

export function suggestNext(profile) {
  let best = null;
  const consider = (cand) => {
    if (!best || cand.ratio > best.ratio || (cand.ratio === best.ratio && cand.rank < best.rank)) {
      best = cand;
    }
  };
  // Bridge waves compete in the same ranking as tables — the closest-to-
  // done unmastered thing wins, whatever track it lives on.
  if (bridgeVisible(profile)) {
    WAVES.forEach((w, i) => {
      if (waveUnlocked(profile, i)) {
        const p = waveProgress(profile, i);
        if (p.done < p.total) {
          consider({
            label: `➕ ${w.name}`,
            href: `/quiz?wave=${i}`,
            ratio: p.points / Math.max(1, p.maxPoints),
            rank: i,
            teach: null,
          });
        }
      }
      if (subWaveUnlocked(profile, i)) {
        const p = subWaveProgress(profile, i);
        if (p.done < p.total) {
          consider({
            label: `➖ ${w.name}`,
            href: `/quiz?swave=${i}`,
            ratio: p.points / Math.max(1, p.maxPoints),
            rank: i + 0.5,
            teach: null,
          });
        }
      }
    });
  }
  const tablesOn = tablesVisible(profile);
  PED_ORDER.forEach((t, rank) => {
    if (tablesOn && !isTableMastered(profile, t)) {
      const p = tableProgress(profile, t);
      const untried = tableTriedCount(profile, t) === 0;
      consider({
        label: `×${t}`,
        // Never-met tables suggest MEETING first (optional — the grid
        // still quizzes); everything else suggests practice.
        href: untried ? `/meet?table=${t}` : `/quiz?table=${t}`,
        ratio: p.points / p.maxPoints,
        rank,
        teach: untried ? dogForTable(t).name : null,
      });
    } else if (tablesOn && divisionTableUnlocked(profile, t) && !isDivisionTableMastered(profile, t)) {
      // Newly unlocked division content gets a head start so it actually
      // gets suggested once its × table is done.
      const p = divisionTableProgress(profile, t);
      consider({
        label: `÷${t}`,
        href: `/quiz?dtable=${t}`,
        ratio: 0.15 + (p.points / p.maxPoints) * 0.85,
        rank,
        teach: divisionTriedCount(profile, t) === 0 ? dogForDivTable(t).name : null,
      });
    }
  });
  // Bath time competes in the same ranking. Threshold: enough dust to fill
  // most of a bath — 8 of its 13 questions — or the round is padded with
  // facts that aren't due, which teaches nothing new and pays nothing
  // (earnPolish only pays a fact that was due). Its ratio grows with the
  // dust so a lightly dusty board loses to work in progress and a badly
  // rotted one can jump ahead of a table that has barely started; the cap
  // keeps a nearly-strong table (>0.9) ahead of housework either way.
  const { dogs: dusty, dust } = tablesOn ? dustSurvey(profile) : { dogs: [], dust: 0 };
  if (dust >= DUST_FOR_BATH) {
    // Which dog? The one the child can SEE needs it: a dog at dirt level 3
    // (9+ of its 13 facts dusty) has a whole stale table, and its own bath
    // is all review of that table. Otherwise the decay is spread thin
    // across several dogs and no single table's bath would catch it — so
    // Biscuit, whose bath is the 13 rustiest facts on the WHOLE board.
    const dirtiest = dusty.reduce((a, b) => (b.due > a.due ? b : a));
    const starter = DOGS.find((d) => d.table == null && d.divTable == null);
    const spaDay = starter && isUnlocked(profile, starter.id);
    const dog = dirtFor(profile, dirtiest.dog) >= FILTHY || !spaDay ? dirtiest.dog : starter;
    consider({
      label: `🛁 ${dog.name}'s bath`,
      href: `/activity?dog=${dog.id}&kind=groom`,
      ratio: Math.min(0.9, dust / DUST_FOR_FULL_METER),
      rank: 99, // last: an exact tie always goes to learning
      teach: null,
    });
  }
  if (best) return best;

  // Everything mastered: suggest a refresh of the table with the most
  // rusty facts; null (no button) when nothing needs attention.
  let refresh = null;
  for (let t = tablesOn ? TABLE_MIN : TABLE_MAX + 1; t <= TABLE_MAX; t++) {
    let due = 0;
    for (let b = FACTOR_MIN; b <= FACTOR_MAX; b++) {
      const st = getStat(profile, t, b);
      if (st.attempts > 0 && isDue(st)) due += 1;
    }
    if (due > 0 && (!refresh || due > refresh.due)) {
      refresh = { label: `×${t}`, href: `/quiz?table=${t}`, due };
    }
  }
  return refresh;
}

// Friends for a play date: dogs whose tables still need the practice
// come first (weakest ratio), then anyone else fills the party.
export function trainingPartnersFor(profile, dogId, max = 3) {
  const others = DOGS.filter((d) => d.id !== dogId && isUnlocked(profile, d.id) && d.table != null);
  const score = (d) => {
    const p = tableProgress(profile, d.table);
    const needs = !isTableMastered(profile, d.table) || tableDueCount(profile, d.table) > 0;
    return (needs ? 0 : 10) + p.points / Math.max(1, p.maxPoints);
  };
  return others.sort((x, y) => score(x) - score(y)).slice(0, max);
}
