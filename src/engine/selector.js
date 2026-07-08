// Builds a round of questions: weak facts first (low Leitner box, least
// recently seen), a few new facts, and a couple of already-strong
// confidence-builders so a round never feels like pure struggle.

import {
  getStat,
  getDivStat,
  isDue,
  MASTERY_BOX,
  FACTOR_MIN,
  FACTOR_MAX,
  TABLE_MIN,
  TABLE_MAX,
} from './leitner.js';

function multQuestion(left, right) {
  return {
    a: left,
    b: right,
    answer: left * right,
    kind: 'mult',
    text: `${left} × ${right}`,
    correction: `${left} × ${right} = ${left * right}`,
  };
}

export const ROUND_SIZE = 10;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function tablePool(table) {
  const pairs = [];
  for (let b = FACTOR_MIN; b <= FACTOR_MAX; b++) pairs.push([table, b]);
  return pairs;
}

function mixedPool() {
  // Unique normalized pairs across all tables.
  const pairs = [];
  for (let a = TABLE_MIN; a <= TABLE_MAX; a++) {
    for (let b = Math.max(a, FACTOR_MIN); b <= FACTOR_MAX; b++) pairs.push([a, b]);
  }
  for (let b = FACTOR_MIN; b < TABLE_MIN; b++) pairs.push([TABLE_MIN, b]);
  return pairs;
}

// --- Pet sitting: a confidence-first mix. Buckets by Leitner box:
// weak (box 0–1, incl. unseen), firm (box 2–3, needs reinforcement),
// mastered (box 4–5, quick wins).

export function bucketizeFacts(profile) {
  const weak = [];
  const firm = [];
  const mastered = [];
  for (const [a, b] of mixedPool()) {
    const s = getStat(profile, a, b);
    if (s.box >= 4) mastered.push({ a, b, s });
    else if (s.box >= 2) firm.push({ a, b, s });
    else weak.push({ a, b, s });
  }
  return { weak, firm, mastered };
}

// The baseline: enough solid facts that a sitting round can be mostly wins.
export function sittingReady(profile) {
  const { firm, mastered } = bucketizeFacts(profile);
  return mastered.length >= 6 && firm.length >= 3;
}

// 10–20% weak/unknown, 20–30% firm, the rest fully mastered. Rounds start
// with wins and weak facts are spread out, never back-to-back.
export function buildSittingRound(profile, count = ROUND_SIZE) {
  const { weak, firm, mastered } = bucketizeFacts(profile);
  // Relearning beats brand-new: previously-seen weak facts first, then
  // unseen ones easiest-first.
  weak.sort(
    (x, y) => (y.s.attempts > 0) - (x.s.attempts > 0) || x.a * x.b - y.a * y.b
  );
  // Least recently seen first — reinforcement and retention upkeep.
  firm.sort((x, y) => x.s.lastSeen - y.s.lastSeen);
  mastered.sort((x, y) => x.s.lastSeen - y.s.lastSeen);

  const picked = [];
  const take = (list, n, tag) => {
    for (let i = 0; i < n && list.length && picked.length < count; i++) {
      picked.push({ ...list.shift(), tag });
    }
  };
  take(weak, Math.random() < 0.5 ? 1 : 2, 'weak');
  take(firm, Math.random() < 0.5 ? 2 : 3, 'firm');
  take(mastered, count - picked.length, 'mastered');
  take(firm, count - picked.length, 'firm'); // fallbacks for thin buckets
  take(weak, count - picked.length, 'weak');

  const wins = picked.filter((p) => p.tag !== 'weak');
  const weaks = picked.filter((p) => p.tag === 'weak');
  shuffle(wins);
  const out = wins.slice(0, 2); // always open with wins
  const rest = wins.slice(2);
  let wi = 0;
  const slots = rest.length + weaks.length;
  for (let i = 0; i < slots; i++) {
    const weakOk = wi < weaks.length && out[out.length - 1].tag !== 'weak';
    if (weakOk && (rest.length === 0 || Math.random() < (weaks.length - wi) / (slots - i))) {
      out.push(weaks[wi++]);
    } else if (rest.length) {
      out.push(rest.shift());
    } else if (wi < weaks.length) {
      out.push(weaks[wi++]);
    }
  }
  return out.map(({ a, b }) => {
    const [l, r] = Math.random() < 0.5 ? [a, b] : [b, a];
    return multQuestion(l, r);
  });
}

// Division-track round for one ÷table. Presentation follows the fact's own
// division box: early reps use the missing-factor bridge ("5 × _ = 20"),
// and once it's warming up (box ≥ 2) the ÷ symbol takes over.
export function buildDivisionRound(profile, table, count = ROUND_SIZE) {
  const weak = [];
  const fresh = [];
  const dueStrong = [];
  const strong = [];
  for (let b = FACTOR_MIN; b <= FACTOR_MAX; b++) {
    const s = getDivStat(profile, table, b);
    const item = { a: table, b, s };
    if (s.attempts === 0) fresh.push(item);
    else if (s.box < MASTERY_BOX) weak.push(item);
    else if (isDue(s)) dueStrong.push(item);
    else strong.push(item);
  }
  weak.sort((x, y) => x.s.box - y.s.box || x.s.lastSeen - y.s.lastSeen);
  fresh.sort((x, y) => x.a * x.b - y.a * y.b || Math.random() - 0.5);
  dueStrong.sort((x, y) => x.s.lastSeen - y.s.lastSeen);
  shuffle(strong);

  const picked = [];
  const take = (list, n) => {
    while (n > 0 && list.length && picked.length < count) {
      picked.push(list.shift());
      n -= 1;
    }
  };
  take(weak, 5);
  take(dueStrong, 2);
  take(fresh, 2);
  take(strong, 1);
  take(weak, count);
  take(dueStrong, count);
  take(fresh, count);
  take(strong, count);
  let i = 0;
  while (picked.length < count && picked.length > 0) {
    picked.push(picked[i % picked.length]);
    i += 1;
  }
  shuffle(picked);

  return picked.map(({ a, b }) => {
    const product = a * b;
    const divForm = getDivStat(profile, a, b).box >= 2;
    return {
      a,
      b,
      answer: b,
      kind: 'div',
      text: divForm ? `${product} ÷ ${a}` : `${a} × _ = ${product}`,
      correction: divForm ? `${product} ÷ ${a} = ${b}` : `${a} × ${b} = ${product}`,
    };
  });
}

export function buildRound(profile, scope, count = ROUND_SIZE) {
  const pool = scope.type === 'table' ? tablePool(scope.table) : mixedPool();

  const weak = [];
  const fresh = [];
  const dueStrong = []; // mastered but past its freshness window — refresh it
  const strong = [];
  for (const [a, b] of pool) {
    const s = getStat(profile, a, b);
    if (s.attempts === 0) fresh.push({ a, b, s });
    else if (s.box < MASTERY_BOX) weak.push({ a, b, s });
    else if (isDue(s)) dueStrong.push({ a, b, s });
    else strong.push({ a, b, s });
  }

  // Weakest and least recently seen first.
  weak.sort((x, y) => x.s.box - y.s.box || x.s.lastSeen - y.s.lastSeen);
  // Easier new facts first so first encounters build confidence.
  fresh.sort((x, y) => x.a * x.b - y.a * y.b || Math.random() - 0.5);
  dueStrong.sort((x, y) => x.s.lastSeen - y.s.lastSeen);
  shuffle(strong);

  const picked = [];
  const take = (list, n) => {
    while (n > 0 && list.length && picked.length < count) {
      picked.push(list.shift());
      n -= 1;
    }
  };
  take(weak, 5);
  take(dueStrong, 2);
  take(fresh, 2);
  take(strong, 1);
  // Fill any remaining slots from whatever is left.
  take(weak, count);
  take(dueStrong, count);
  take(fresh, count);
  take(strong, count);
  // Tiny pools (shouldn't happen with 13+ facts): repeat the weakest.
  let i = 0;
  while (picked.length < count && picked.length > 0) {
    picked.push(picked[i % picked.length]);
    i += 1;
  }

  shuffle(picked);

  return picked.map(({ a, b }) => {
    // Table practice keeps the table on the left ("7 × b"); mixed review
    // shows either orientation.
    let left = a;
    let right = b;
    if (scope.type === 'mixed' && Math.random() < 0.5) [left, right] = [right, left];
    if (scope.type === 'table' && a !== scope.table) [left, right] = [b, a];
    return multQuestion(left, right);
  });
}
