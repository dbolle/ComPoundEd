// One money question, as plain data. Nothing here draws: the screen turns
// these into coin art, choice rows, a numpad or a coin tray. Same split as
// groups.js — a pure builder can be swept across all 134 identities in a
// unit test, which is the only practical way to know that every single one
// produces an askable question with a reachable answer.
//
// The skill id is the source of truth for what to ask; ids are frozen
// (tests/fixtures-money-skills.json), so these parsers are a contract.

import { DENOMS } from './money.js';
import { FACE_VALUE } from '../art/coins.js';

const CENTS = Object.fromEntries(DENOMS.map((d) => [d.id, d.cents]));
// The REAL names, not the wallet's. Paw Buck / Paw Dime are the fictional
// currency a child EARNS (CHARTER: fictitious forever); Money Math teaches
// the money that exists — 2.MD.8 is about real US coins, and a child who
// learns "Paw Dime" has learned a word that works nowhere else.
const LABEL = {
  penny: 'penny',
  nickel: 'nickel',
  dime: 'dime',
  quarter: 'quarter',
  buck: 'dollar',
};
// mix ids count quarters-dimes-nickels-pennies, biggest first.
const MIX_ORDER = ['quarter', 'dime', 'nickel', 'penny'];

const say = (n) => (n === 1 ? '1 cent' : `${n} cents`);

// "$1.05" for a dollar and over, "45¢" below — the two forms wave 7 asks a
// child to move between.
export function dollarForm(cents) {
  return `$${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;
}
export const centForm = (cents) => `${cents}¢`;

// "2dime1nickel" → [['dime',2],['nickel',1]]; "buck" → [['buck',1]]
function parsePile(text) {
  const out = [];
  const re = /(\d*)([a-z]+)/g;
  let m;
  while ((m = re.exec(text))) out.push([m[2], Number(m[1] || 1)]);
  return out;
}
const pileCents = (pile) => pile.reduce((s, [d, n]) => s + CENTS[d] * n, 0);
// a flat list of denom ids, biggest first — what the screen lays out
const pileCoins = (pile) =>
  pile.flatMap(([d, n]) => Array.from({ length: n }, () => d)).sort((a, b) => CENTS[b] - CENTS[a]);

const pick = (arr, seed) => arr[Math.abs(seed) % arr.length];
const shuffled = (arr, seed) =>
  arr
    .map((v, i) => [v, (Math.abs(seed) * 31 + i * 17) % 101])
    .sort((a, b) => a[1] - b[1])
    .map(([v]) => v);

// Distractors near the truth, never negative, never a repeat.
function nearby(answer, seed, n = 2, step = 5) {
  const out = [];
  for (let k = 1; out.length < n; k++) {
    for (const s of [k * step, -k * step]) {
      const v = answer + s;
      if (v > 0 && v !== answer && !out.includes(v) && out.length < n) out.push(v);
    }
  }
  return out;
}

export function buildMoneyQuestion(skillId, seed = 0) {
  const [key, rest] = [skillId.slice(0, skillId.indexOf(':')), skillId.slice(skillId.indexOf(':') + 1)];

  if (key === 'coin') {
    // Two presentations of one identity: coin → name, and coin → value.
    // Alternating on the seed means a child cannot pass by matching a
    // picture to one memorised word.
    const byValue = seed % 2 === 1;
    const others = DENOMS.map((d) => d.id).filter((x) => x !== rest);
    const wrong = shuffled(others, seed).slice(0, 2);
    return {
      kind: 'choice',
      skill: skillId,
      coins: [rest],
      ask: byValue ? 'How much is this?' : 'Which coin is this?',
      say: byValue ? 'How much is this coin worth?' : 'Which coin is this?',
      answer: byValue ? FACE_VALUE[rest] : LABEL[rest],
      choices: shuffled([rest, ...wrong], seed + 3).map((id) => (byValue ? FACE_VALUE[id] : LABEL[id])),
    };
  }

  if (key === 'one') {
    const [denom, n] = rest.split('x');
    const count = Number(n);
    const total = CENTS[denom] * count;
    return {
      kind: 'total',
      skill: skillId,
      coins: Array.from({ length: count }, () => denom),
      ask: 'How much altogether?',
      say: `How much is ${count} ${LABEL[denom]}${count === 1 ? '' : 's'} altogether?`,
      answer: total,
      unit: '¢',
    };
  }

  if (key === 'mix') {
    const counts = rest.split('-').map(Number);
    const pile = MIX_ORDER.map((d, i) => [d, counts[i]]).filter(([, n]) => n > 0);
    return {
      kind: 'total',
      skill: skillId,
      coins: pileCoins(pile),
      ask: 'How much altogether?',
      say: 'How much is this altogether?',
      answer: pileCents(pile),
      unit: '¢',
    };
  }

  if (key === 'eq') {
    const [fromText, toText] = rest.split('-');
    const from = parsePile(fromText);
    const to = parsePile(toText);
    const value = pileCents(from);
    // Wrong piles are real piles of the WRONG value — a child must compare
    // worth, not shape. Same denomination as the right answer wherever it
    // can be, so counting coins is never the shortcut.
    // Enumerate a bounded candidate space and filter, rather than guessing
    // in a loop. An earlier `while` here span forever whenever its guess
    // collided, because the guess was derived from values that did not
    // change between iterations — a finite list cannot hang.
    const seen = new Set([value]);
    const wrongPiles = [];
    const candidates = [
      [to[0][0], to[0][1] + 1],
      [to[0][0], Math.max(1, to[0][1] - 1)],
      ...MIX_ORDER.flatMap((d) => [1, 2, 3, 4, 5].map((n) => [d, n])),
    ];
    for (const [d, n] of shuffled(candidates, seed + 11)) {
      if (wrongPiles.length >= 2) break;
      const cand = [[d, n]];
      const c = pileCents(cand);
      if (seen.has(c)) continue;
      seen.add(c);
      wrongPiles.push(cand);
    }
    const options = shuffled([to, ...wrongPiles], seed).map((pile) => ({
      coins: pileCoins(pile),
      cents: pileCents(pile),
    }));
    return {
      kind: 'pile',
      skill: skillId,
      coins: pileCoins(from),
      ask: 'Which one is the same?',
      say: 'Which pile is worth the same?',
      answer: value,
      options,
    };
  }

  if (key === 'make') {
    const cents = Number(rest);
    return {
      kind: 'build',
      skill: skillId,
      target: cents,
      ask: `Make ${centForm(cents)}`,
      say: `Make ${say(cents)}.`,
      answer: cents,
    };
  }

  if (key === 'chg') {
    const [price, paid] = rest.split('-').map(Number);
    return {
      kind: 'change',
      skill: skillId,
      price,
      paid,
      target: paid - price,
      ask: `It costs ${centForm(price)}. You paid ${centForm(paid)}.`,
      say: `It costs ${say(price)}. You paid ${say(paid)}. Count up the change!`,
      answer: paid - price,
    };
  }

  if (key === 'not') {
    const cents = Number(rest);
    // Ask in one form, answer in the other — both directions, by seed.
    const showDollars = seed % 2 === 1;
    const shown = showDollars ? dollarForm(cents) : centForm(cents);
    const truth = showDollars ? centForm(cents) : dollarForm(cents);
    const wrong = nearby(cents, seed, 2, cents >= 100 ? 10 : 9).map((v) =>
      showDollars ? centForm(v) : dollarForm(v)
    );
    return {
      kind: 'choice',
      skill: skillId,
      coins: [],
      shown,
      ask: `${shown} is the same as…`,
      say: `Which one means the same as ${shown}?`,
      answer: truth,
      choices: shuffled([truth, ...wrong], seed + 5),
    };
  }

  return null;
}
