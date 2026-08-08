// Money Math (Phase 7 R5): the seven waves of counting Paw Bucks, and the
// frozen identity of every skill inside them.
//
// FROZEN IDS — read before touching anything below. Each id here is the key
// of a Leitner stat map on a real child's device (profile.money, schema
// v19). An id that changes meaning, or a list whose ORDER shifts, silently
// re-points a child's earned box count at a different question — progress
// that looks intact and isn't. So:
//
//   * APPENDING to a curated list is fine (a new skill starts at box 0).
//   * CHANGING or REORDERING an existing entry is not, ever.
//   * tests/fixtures-money-skills.json pins all 134 ids; the spec fails on
//     any edit that is not a pure append (same rule, same reason, as
//     tests/fixtures-store-prices.json).
//
// Waves 1, 2 and 5 are generated from a rule, because the rule IS the
// curriculum (every coin; 2–10 of one kind; every 5¢ step to a dollar) and
// a loop cannot drift the way a hand-typed list can. Waves 3, 4, 6 and 7
// are hand-curated literals — the choices in them are teaching decisions,
// so they are written out where they can be read and argued with.
//
// Money is UNTIMED (see recordMoneyAnswer in engine/leitner.js): several of
// these skills are multi-step by design, and a speed bar would cap them
// below mastery forever.

// Ascending value — which is also the teaching order. These ids are the
// same ones the ledger and the coin art use (engine/money.js DENOMS); the
// spec cross-checks that, so a denomination can never be known here under
// a name the rest of the app has never heard of.
export const MONEY_DENOMS = ['penny', 'nickel', 'dime', 'quarter', 'buck'];

// --- wave 1: know the coins -------------------------------------------
// One skill per denomination: name it, and know what it is worth.
const KNOW_THE_COINS = MONEY_DENOMS.map((d) => `coin:${d}`);

// --- wave 2: count one kind -------------------------------------------
// Skip counting made concrete: 2–10 coins of a single kind. Pennies are
// left out on purpose — counting ten pennies is counting to ten, which
// this child already did in Little Pup, and Paw Bucks are not skip-counted
// (a pile of bills is a wave-3/5 problem, not a 5s/10s/25s one).
const COUNT_ONE_KIND = [];
for (const denom of ['nickel', 'dime', 'quarter']) {
  for (let n = 2; n <= 10; n++) COUNT_ONE_KIND.push(`one:${denom}x${n}`);
}

// --- wave 3: mixed collections ----------------------------------------
// id is `mix:<quarters>-<dimes>-<nickels>-<pennies>` — biggest coin first,
// which is also the order the total gets counted in.
//
// Curation rule: 2–4 coins, at least two denominations (one kind is wave
// 2's job), never more than three of anything (four nickels is a swap, not
// a count). That leaves 53 legal handfuls; these 30 are ALL of the 2-coin
// (6) and 3-coin (16) ones, plus eight 4-coin handfuls chosen for spread —
// ordered by total value, so the wave gets harder as it goes. Paw Bucks
// are excluded: a bill in the pile turns this into wave 5.
const MIXED_COLLECTIONS = [
  // two coins (6) — every pair of denominations, cheapest first
  'mix:0-0-1-1', // 6c
  'mix:0-1-0-1', // 11c
  'mix:0-1-1-0', // 15c
  'mix:1-0-0-1', // 26c
  'mix:1-0-1-0', // 30c
  'mix:1-1-0-0', // 35c
  // three coins (16) — the complete set
  'mix:0-0-1-2', // 7c
  'mix:0-0-2-1', // 11c
  'mix:0-1-0-2', // 12c
  'mix:0-1-1-1', // 16c
  'mix:0-1-2-0', // 20c
  'mix:0-2-0-1', // 21c
  'mix:0-2-1-0', // 25c
  'mix:1-0-0-2', // 27c
  'mix:1-0-1-1', // 31c
  'mix:1-0-2-0', // 35c
  'mix:1-1-0-1', // 36c
  'mix:1-1-1-0', // 40c
  'mix:1-2-0-0', // 45c
  'mix:2-0-0-1', // 51c
  'mix:2-0-1-0', // 55c
  'mix:2-1-0-0', // 60c
  // four coins (8) — a spread, not the whole 31
  'mix:0-0-3-1', // 16c
  'mix:0-1-3-0', // 25c — the same 25c as a single quarter (sets up wave 4)
  'mix:0-2-1-1', // 26c
  'mix:0-3-1-0', // 35c
  'mix:1-1-1-1', // 41c — one of every coin
  'mix:1-2-1-0', // 50c
  'mix:2-1-1-0', // 65c
  'mix:3-1-0-0', // 85c
];

// --- wave 4: equal value ----------------------------------------------
// id is `eq:<from>-<to>`, each side written as `<n><denom>` with the count
// dropped when it is 1 (`eq:5penny-nickel`).
//
// The first eleven ARE the coin swaps the child can already do in the
// wallet (SWAPS in engine/money.js), in that exact order — the game is
// asking, in words, for the trade their thumbs have made a hundred times.
// Both directions are kept because they are genuinely different thoughts:
// consolidating up ("five pennies make a nickel") and breaking down
// ("a nickel breaks into five pennies").
//
// The twelfth is not a swap: two dimes and a nickel for a quarter is the
// first time the child has to ADD unlike coins before comparing, which is
// the whole point of the wave and the bridge into wave 5.
const EQUAL_VALUE = [
  'eq:4quarter-buck',
  'eq:10dime-buck',
  'eq:5nickel-quarter',
  'eq:2nickel-dime',
  'eq:10penny-dime',
  'eq:5penny-nickel',
  'eq:buck-4quarter',
  'eq:buck-10dime',
  'eq:quarter-5nickel',
  'eq:dime-2nickel',
  'eq:nickel-5penny',
  'eq:2dime1nickel-quarter',
];

// --- wave 5: make an amount -------------------------------------------
// Every 5¢ step from a nickel to a whole Paw Buck. The other direction of
// wave 3: given the number, build the coins.
const MAKE_AN_AMOUNT = [];
for (let c = 5; c <= 100; c += 5) MAKE_AN_AMOUNT.push(`make:${c}`);

// --- wave 6: count the change -----------------------------------------
// id is `chg:<price>-<paid>`, both in paw cents.
//
// Every PRICE is a real price from the pet store (src/art/gear.js, pinned
// in tests/fixtures-store-prices.json) — invented prices would teach a
// shop the child cannot walk into, and the spec re-checks this list
// against the store.
//
// Every PAID amount is quarters and/or whole Paw Bucks, because that is
// what handing over too much actually looks like here: the checkout lets
// a child overpay exactly when they cannot make the price exactly (see
// canOverpay in engine/money.js), and they cover it with the big coins.
//
// The first twenty are ordered by the CHANGE they give and cover every
// step from 5¢ to a whole Paw Buck once, so no answer can be guessed from
// the pattern of the wave. The last four are the pricier shelves, where
// the dollars and the cents have to be counted separately.
const COUNT_THE_CHANGE = [
  'chg:120-125', // 5c back
  'chg:15-25', // 10c
  'chg:10-25', // 15c
  'chg:30-50', // 20c
  'chg:75-100', // 25c
  'chg:120-150', // 30c
  'chg:15-50', // 35c
  'chg:60-100', // 40c
  'chg:30-75', // 45c
  'chg:50-100', // 50c
  'chg:120-175', // 55c
  'chg:40-100', // 60c
  'chg:10-75', // 65c
  'chg:30-100', // 70c
  'chg:25-100', // 75c
  'chg:120-200', // 80c
  'chg:15-100', // 85c
  'chg:10-100', // 90c
  'chg:30-125', // 95c
  'chg:100-200', // a whole Paw Buck back
  // the big shelves
  'chg:125-200', // 75c
  'chg:160-200', // 40c
  'chg:350-400', // 50c
  'chg:450-500', // 50c
];

// --- wave 7: notation --------------------------------------------------
// Reading and writing the same amount both ways: 5¢ and $0.05 are one
// amount with two coats on. Eight amounts under a dollar (where ¢ is the
// natural form) and eight at or over it (where $ is), chosen for the
// places the notation actually bites:
//   9c   → $0.09  a zero in the dimes place
//   99c  → $0.99  the last amount before the dollar
//   100c → $1.00  the two zeros a child wants to drop
//   105c → $1.05  the classic "$1.5" mistake
//   1000c→ $10.00 two digits of dollars
const NOTATION = [
  'not:5',
  'not:9',
  'not:10',
  'not:25',
  'not:40',
  'not:50',
  'not:75',
  'not:99',
  'not:100',
  'not:105',
  'not:110',
  'not:125',
  'not:150',
  'not:199',
  'not:250',
  'not:1000',
];

// NAMES are the track's working titles (owner's R5 table). "Mixed
// Collections" and "Notation" are grown-up register — whatever the kid
// screen says on the tile has to come from docs/VOCABULARY.md, so treat
// these as labels for grown-ups and code, not as kid-facing strings.
// `key` is deliberately the id PREFIX of the wave's skills, so any stored
// id says out loud which wave it came from (the spec enforces it).
export const MONEY_WAVES = [
  { id: 1, key: 'coin', name: 'Know the Coins', emoji: '\u{1FA99}', skills: KNOW_THE_COINS },
  { id: 2, key: 'one', name: 'Count One Kind', emoji: '\u{1F45F}', skills: COUNT_ONE_KIND },
  { id: 3, key: 'mix', name: 'Mixed Collections', emoji: '\u{1F91A}', skills: MIXED_COLLECTIONS },
  { id: 4, key: 'eq', name: 'Equal Value', emoji: '\u{2696}\u{FE0F}', skills: EQUAL_VALUE },
  { id: 5, key: 'make', name: 'Make an Amount', emoji: '\u{1F529}', skills: MAKE_AN_AMOUNT },
  { id: 6, key: 'chg', name: 'Count the Change', emoji: '\u{1F6D2}', skills: COUNT_THE_CHANGE },
  { id: 7, key: 'not', name: 'Notation', emoji: '\u{270F}\u{FE0F}', skills: NOTATION },
];

// Every money skill id, in wave order. 134 of them.
export const MONEY_SKILL_IDS = MONEY_WAVES.flatMap((w) => w.skills);

// Which wave a stored id belongs to (0-based, -1 if it is not ours) — a
// child's profile can hold ids this build has never heard of, e.g. after
// syncing with a device on a newer version, and that must not throw.
export function moneyWaveOf(skillId) {
  return MONEY_WAVES.findIndex((w) => w.skills.includes(skillId));
}
