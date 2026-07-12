// Builds a round of questions: weak facts first (low Leitner box, least
// recently seen), a few new facts, and a couple of already-strong
// confidence-builders so a round never feels like pure struggle.

import {
  getStat,
  getDivStat,
  isDue,
  tableTriedCount,
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

// Training treats: a barely-touched table's first rounds are mostly wins —
// facts already strong via other tables plus the ×0/×1 gimmes — with at most
// four genuinely new facts woven in, never back-to-back. The first taste of
// a scary table is 6+ wins and a few discoveries.
function buildTrainingRound(profile, table, count = ROUND_SIZE) {
  const wins = [];
  const adventures = [];
  for (let b = FACTOR_MIN; b <= FACTOR_MAX; b++) {
    const s = getStat(profile, table, b);
    if (s.box >= MASTERY_BOX || b <= 1) wins.push({ a: table, b });
    else adventures.push({ a: table, b, adv: true });
  }
  shuffle(wins);
  adventures.sort((x, y) => x.a * x.b - y.a * y.b); // easiest discoveries first
  // Cap discoveries so win-separators always suffice (no two in a row).
  const adv = adventures.slice(
    0,
    Math.min(4, adventures.length, Math.floor((count - 2) / 2))
  );
  const win = [];
  // Fill with wins, repeating them rather than adding more new facts —
  // repetition builds comfort in a training round.
  let i = 0;
  while (win.length < count - adv.length && wins.length > 0) {
    win.push(wins[i % wins.length]);
    i += 1;
  }
  // Open with two wins, then alternate discovery → win so new facts are
  // always cushioned.
  const out = win.slice(0, 2);
  const rest = win.slice(2);
  for (let k = 0; k < Math.max(adv.length, rest.length); k++) {
    if (k < adv.length) out.push(adv[k]);
    if (k < rest.length) out.push(rest[k]);
  }
  return out.map(({ a, b }) => multQuestion(a, b));
}

// Grooming: the dog's COMPLETE fact set (its own table, in that track's
// current presentation), rustiest first. The bath ends only when every fact
// has been answered correctly — misses re-queue (handled by the activity).
// Dogs unlock by mastering their table, so this is always pure review.
export function buildGroomRound(profile, dog) {
  // Biscuit's spa day: never dirty, but his bath quizzes the 13 rustiest
  // facts on the whole board (due first, then weakest), padded with the
  // easiest fresh facts for young profiles.
  if (dog.table == null && dog.divTable == null) {
    const seen = [];
    const fresh = [];
    for (const [a, b] of (() => {
      const pairs = [];
      for (let x = TABLE_MIN; x <= TABLE_MAX; x++) {
        for (let y = Math.max(x, FACTOR_MIN); y <= FACTOR_MAX; y++) pairs.push([x, y]);
      }
      for (let y = FACTOR_MIN; y < TABLE_MIN; y++) pairs.push([TABLE_MIN, y]);
      return pairs;
    })()) {
      const s = getStat(profile, a, b);
      if (s.attempts === 0) fresh.push({ a, b, order: a * b });
      else seen.push({ a, b, due: isDue(s) ? 1 : 0, box: s.box, lastSeen: s.lastSeen });
    }
    seen.sort((x, y) => y.due - x.due || x.lastSeen - y.lastSeen || x.box - y.box);
    fresh.sort((x, y) => x.order - y.order);
    const picked = [...seen.slice(0, 13), ...fresh].slice(0, 13);
    return picked.map(({ a, b }) => multQuestion(a, b));
  }
  const items = [];
  for (let b = FACTOR_MIN; b <= FACTOR_MAX; b++) {
    if (dog.divTable != null) {
      const t = dog.divTable;
      const s = getDivStat(profile, t, b);
      const product = t * b;
      const divForm = s.box >= 2;
      items.push({
        a: t,
        b,
        answer: b,
        kind: 'div',
        text: divForm ? `${product} ÷ ${t}` : `${t} × _ = ${product}`,
        correction: divForm ? `${product} ÷ ${t} = ${b}` : `${t} × ${b} = ${product}`,
        due: s.attempts > 0 && isDue(s) ? 1 : 0,
        lastSeen: s.lastSeen,
      });
    } else {
      const t = dog.table;
      const s = getStat(profile, t, b);
      items.push({
        ...multQuestion(t, b),
        due: s.attempts > 0 && isDue(s) ? 1 : 0,
        lastSeen: s.lastSeen,
      });
    }
  }
  items.sort((x, y) => y.due - x.due || x.lastSeen - y.lastSeen);
  return items;
}

export function buildRound(profile, scope, count = ROUND_SIZE) {
  if (scope.type === 'table' && tableTriedCount(profile, scope.table) <= 3) {
    return buildTrainingRound(profile, scope.table, count);
  }
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
