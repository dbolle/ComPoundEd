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
