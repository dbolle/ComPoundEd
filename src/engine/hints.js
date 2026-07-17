// Teach on misses: one short line that gives the kid a way IN to the fact,
// not just the answer. Priority: structural tricks for special factors, then
// the reflexive flip when the kid knows the fact the other way around, then
// an anchor on a neighboring fact this kid already knows well, then a
// skip-count tail anyone can follow.

import { getStat, MASTERY_BOX } from './leitner.js';

function bestAnchor(profile, a, b) {
  const ans = a * b;
  const candidates = [
    { ka: a, kb: b - 1, step: a, dir: +1 },
    { ka: a, kb: b + 1, step: a, dir: -1 },
    { ka: a - 1, kb: b, step: b, dir: +1 },
    { ka: a + 1, kb: b, step: b, dir: -1 },
  ].filter((c) => c.ka >= 0 && c.kb >= 0 && c.ka <= 12 && c.kb <= 12);

  let best = null;
  for (const c of candidates) {
    const box = getStat(profile, c.ka, c.kb).box;
    if (box < MASTERY_BOX) continue;
    // Strongest anchor wins; prefer "one more" over "one less", then the
    // smaller counting step.
    const rank = box * 100 + (c.dir > 0 ? 10 : 0) + (10 - Math.min(c.step, 10));
    if (!best || rank > best.rank) best = { ...c, rank };
  }
  if (!best) return null;
  const known = best.ka * best.kb;
  return best.dir > 0
    ? `You know ${best.ka}×${best.kb} = ${known} — one more ${best.step} makes ${ans}!`
    : `You know ${best.ka}×${best.kb} = ${known} — one ${best.step} less is ${ans}!`;
}

// Division-track misses anchor on the multiplication fact the kid already
// mastered (that's the entry ticket to this track).
export function divisionHint(a, b) {
  return `Think times: you know ${a} × ${b} = ${a * b} — so the missing number is ${b}!`;
}

export function hintFor(profile, a, b) {
  const ans = a * b;
  if (a === 0 || b === 0) return 'Times zero is always 0!';
  if (a === 1 || b === 1) return 'Times 1 keeps the number the same!';
  const [lo, hi] = a <= b ? [a, b] : [b, a];
  if (hi === 10 || lo === 10) {
    const other = hi === 10 ? lo : hi;
    return `×10 sticks a zero on: ${other} becomes ${other * 10}!`;
  }
  if (hi === 11 && lo <= 9) {
    return `11 copies the digit: ${lo} becomes ${lo * 11}!`;
  }
  if (lo === 2) {
    return `×2 means double: ${hi} + ${hi} = ${ans}!`;
  }
  // Reflexive property: missing a fact whose own level is high means the kid
  // knows it in the other orientation — teach that turning it around changes
  // nothing. (Both orientations share one stat, so a high box on a miss is
  // exactly this situation.)
  if (a !== b && getStat(profile, a, b).box >= MASTERY_BOX) {
    return `Flip it! ${a}×${b} is the same as ${b}×${a} — and you know that one: ${ans}!`;
  }
  const anchor = bestAnchor(profile, a, b);
  if (anchor) return anchor;
  return `Count by ${lo}s to get there: …, ${ans - 2 * lo}, ${ans - lo}, ${ans}!`;
}

// Addition strategy hints, matched to the wave the fact belongs to —
// the same trick the wave teaches is the hint on a miss.
export function additionHint(a, b) {
  const [lo, hi] = a <= b ? [a, b] : [b, a];
  if (lo === 0) return `Adding 0 changes nothing — it stays ${hi}!`;
  if (lo <= 2) return `Start at ${hi} and count up ${lo}: ${hi + 1}${lo === 2 ? `, ${hi + 2}` : ''}.`;
  if (lo === hi) return `Double ${lo}! ${lo} + ${lo} = ${lo + lo}.`;
  if (lo + hi === 10) return `${lo} and ${hi} are number friends — together they make 10!`;
  if (hi === lo + 1) return `Double ${lo} makes ${lo + lo}, then 1 more is ${lo + lo + 1}.`;
  if (hi === 10) return `10 and ${lo} — that's just "${lo}teen": ${10 + lo}!`;
  if (hi >= 8 && lo + hi > 10) {
    const need = 10 - hi;
    return `Make ten first: ${hi} + ${need} = 10, then ${lo - need} more is ${lo + hi}.`;
  }
  return `Start at ${hi}, the bigger number, and count up ${lo}.`;
}

// Taking Away hints: think-addition is THE strategy (the family's addition
// fact is already known — that's what unlocked the wave); counting up
// covers the close cases.
export function subtractionHint(q) {
  const c = q.a + q.b;
  const { given, answer } = q;
  if (answer <= 3) {
    const steps = Array.from({ length: answer }, (_, i) => given + i + 1).join(', ');
    return `Count up from ${given} to ${c}: ${steps} — that's ${answer} hop${answer > 1 ? 's' : ''}!`;
  }
  return `Think addition — you know ${given} + ${answer} = ${c}, so ${c} − ${given} = ${answer}!`;
}
