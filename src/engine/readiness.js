// The automated readiness trail: each track answers "should this exist for
// this child right now?" A track is auto-visible when its readiness
// predicate passes OR it has any history — nothing a child ever touched can
// disappear (the grandfathering guarantee). Parents override with
// subjects.* = true (force show) / false (hide); 'auto' is the default.
// Reveals are one-way via the little.revealed ratchet.

import { isWaveMastered, isSubWaveMastered } from './waves.js';

const KNOWN_STREAK = 3;
const STREAK_NEEDED = { more: 4 };
const knows = (p, g, n) =>
  (p.little?.skills?.[`${g}:${n}`]?.streak ?? 0) >= (STREAK_NEEDED[g] ?? KNOWN_STREAK);
const knowsRange = (p, g, lo, hi) => {
  for (let n = lo; n <= hi; n++) if (!knows(p, g, n)) return false;
  return true;
};

const hasHistory = (map) => Object.values(map ?? {}).some((s) => (s.attempts ?? 0) > 0 || s.seen);

// --- readiness predicates (research-aligned; docs/PHASE5/6) ---------------

export function addingReady(p) {
  // can count on (counting + what-comes-next) and can type answers
  return (
    knowsRange(p, 'count', 1, 10) &&
    knowsRange(p, 'next', 4, 10) &&
    knowsRange(p, 'type', 1, 10)
  );
}

export function takingAwayReady(p) {
  return isWaveMastered(p, 0); // Adding Step Ups mastered (as today)
}

export function tablesReady(p) {
  // within-20 strategies through Tens & Teens, the first two Taking Away
  // waves, and the skip-count paths (the counting→tables connector)
  for (let w = 0; w <= 4; w++) if (!isWaveMastered(p, w)) return false;
  if (!isSubWaveMastered(p, 0) || !isSubWaveMastered(p, 1)) return false;
  return [2, 5, 10].every((t) => knows(p, 'path', t));
}

// --- visibility: override ?? (predicate || history) ------------------------

function visible(override, auto) {
  if (override === true) return true;
  if (override === false) return false;
  return auto; // 'auto' or legacy undefined
}

export function bridgeVisible(p) {
  return visible(
    p.subjects?.bridge,
    addingReady(p) || hasHistory(p.addition) || hasHistory(p.subtraction)
  );
}

export function tablesVisible(p) {
  return visible(p.subjects?.tables, tablesReady(p) || hasHistory(p.facts) || hasHistory(p.division));
}

// --- the ratchet: reveals are forever --------------------------------------

export function isRevealed(p, id) {
  return (p.little?.revealed ?? []).includes(id);
}

// Appends any newly-ready ids; returns the fresh ones so the caller can
// celebrate (and save). Never removes.
export function ratchetReveals(p, readyIds) {
  if (!p.little) p.little = { xp: 0, skills: {}, revealed: [] };
  p.little.revealed = p.little.revealed ?? [];
  const fresh = readyIds.filter((id) => !p.little.revealed.includes(id));
  p.little.revealed.push(...fresh);
  return fresh;
}

// Trail map for Grown-Ups: state per track.
export function trackState(p, track) {
  const started =
    track === 'adding'
      ? hasHistory(p.addition)
      : track === 'takingaway'
        ? hasHistory(p.subtraction)
        : track === 'tables'
          ? hasHistory(p.facts)
          : track === 'division'
            ? hasHistory(p.division)
            : false;
  const ready =
    track === 'adding'
      ? addingReady(p)
      : track === 'takingaway'
        ? takingAwayReady(p)
        : track === 'tables'
          ? tablesReady(p)
          : false;
  if (started) return 'started';
  if (ready) return 'ready';
  return 'hidden';
}
