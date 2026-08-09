// The automated readiness trail: each track answers "should this exist for
// this child right now?" Parents override with subjects.* = true (force
// show) / false (hide); 'auto' is the default.
//
// READINESS GATES ARE ONE-WAY DOORS. A gate may be changed — tightened,
// loosened, re-scoped as the trail is understood better — but it may never
// close on a child it has already opened. That is what `revealed` is for:
// once a track has been shown to a profile the reveal is recorded, and
// visibility consults the record as well as the live predicate. Before
// v1.48.0 this held only by accident, through `hasHistory`, so a child who
// had *qualified* but not yet *played* could lose a track the moment a
// predicate was edited — which made every gate effectively frozen.
//
// A parent's explicit `false` still hides: an override outranks the
// ratchet, deliberately.

import { isWaveMastered, isSubWaveMastered } from './waves.js';
import { isBeta } from './beta.js';

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
  // Mid-trail inference (v1.41): a child with REAL higher-track history
  // (multiplication/division facts) has proven everything the counting
  // gates test — the trail below opens for them. This affects READINESS
  // and VISIBILITY only: it never writes skills, facts, coins, pets, or
  // milestones (bounded by tests/midtrail.spec.js).
  if (hasHistory(p.facts) || hasHistory(p.division)) return true;
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
  // waves, and the skip-count paths (the counting→tables connector).
  //
  // v1.51.0 raised this from [2, 5, 10] to include 3s and 4s (owner
  // decision): the ×3 and ×4 tables are the ones a chain helps most, and
  // they had no chain at all. Raising a gate is only safe because reveals
  // are one-way since v1.48.0 — a child who already has the tables track
  // keeps it, whatever this predicate says afterwards. The `paths` game
  // gained those strides in the SAME release: a gate may never require
  // something the app doesn't teach.
  for (let w = 0; w <= 4; w++) if (!isWaveMastered(p, w)) return false;
  if (!isSubWaveMastered(p, 0) || !isSubWaveMastered(p, 1)) return false;
  return [2, 3, 4, 5, 10].every((t) => knows(p, 'path', t));
}

// --- visibility: override ?? (predicate || history) ------------------------

function visible(override, auto) {
  if (override === true) return true;
  if (override === false) return false;
  return auto; // 'auto' or legacy undefined
}

// What a child has EARNED, ignoring parent overrides. These serve as both
// the auto-visibility test and the thing the ratchet records, so a
// force-show a parent might later withdraw can never stamp the door open.
// `hasHistory` still carries the original grandfathering guarantee for
// profiles that predate reveals.
const bridgeEarned = (p) =>
  addingReady(p) || hasHistory(p.addition) || hasHistory(p.subtraction);
const tablesEarned = (p) => tablesReady(p) || hasHistory(p.facts) || hasHistory(p.division);

// The reveal ids are the ones the home screen has always stamped.
// Money Math (v1.54.0). Counting by 5s and 10s is what makes coin values
// countable at all, and the first two adding waves are the arithmetic the
// totals need. Mid-trail inference first, exactly as addingReady does it: a
// child with real ×/÷ history has proven all of that already and must not
// sit behind counting gates to reach money.
export function moneyReady(p) {
  if (hasHistory(p.facts) || hasHistory(p.division)) return true;
  return knows(p, 'path', 5) && knows(p, 'path', 10) && isWaveMastered(p, 0);
}

const moneyEarned = (p) => moneyReady(p) || hasHistory(p.money);

const TRACK_REVEALS = [
  ['track:adding', bridgeEarned],
  ['track:takingaway', (p) => bridgeEarned(p) && takingAwayReady(p)],
  ['track:tables', tablesEarned],
  // Stamped even while the track is in preview, so a child who reached it
  // in beta keeps it when the flag comes off — the door is one-way.
  ['track:money', moneyEarned],
];

// The one-way door: already revealed OR earned now.
const autoVisible = (p, revealId, earned) => isRevealed(p, revealId) || earned;

export function bridgeVisible(p) {
  return visible(p.subjects?.bridge, autoVisible(p, 'track:adding', bridgeEarned(p)));
}

export function tablesVisible(p) {
  return visible(p.subjects?.tables, autoVisible(p, 'track:tables', tablesEarned(p)));
}

// Money Math ships as a PREVIEW (owner, 2026-08-08): a parent turns it on
// per profile with the 🧪 beta chip, drives it with a real child, and only
// then are the ids and payouts locked.
//
// The beta test lives HERE and not only on the route. Gating the route
// alone leaves the track card, the home slot and the suggest branch all
// still advertising a destination that bounces you back — the dead-entry
// defect this app has shipped three times. One predicate, so every surface
// agrees. Removing beta at launch is deleting one `&&`.
export function moneyVisible(p) {
  if (!isBeta(p)) return false;
  return visible(p.subjects?.money, autoVisible(p, 'track:money', moneyEarned(p)));
}

// Record every track this profile has earned, so a later gate change cannot
// take it away. One list drives it rather than each screen deciding for
// itself — a screen that forgot to stamp would leave its track re-closable.
// Returns the freshly-stamped ids so the caller can celebrate them.
export function stampReveals(p) {
  return ratchetReveals(
    p,
    TRACK_REVEALS.filter(([, earned]) => earned(p)).map(([id]) => id)
  );
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
  // opened earlier and still open, even though the predicate no longer
  // passes — saying 'ready' here would imply the gate is currently met
  if (isRevealed(p, `track:${track}`)) return 'revealed';
  return 'hidden';
}
