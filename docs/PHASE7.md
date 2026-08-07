# Phase 7 R5 — the money track (PLANNED: not built; R3 and R4 land first)

The last release of Phase 7 and the first new **fact track** since Taking
Away. R1 (v1.48.0) built the trail registry and the one-way readiness
gates; R2 (v1.49.0) built counting-out change at the checkout and
`src/ui/cointray.js` explicitly "for reuse in R5". This document specifies
R5 completely **before any of it is coded**, because three of its
decisions (skill ids, frozen lists, payout ids) become permanent the
moment a real child answers a question — a paid id can never be renamed
and a wave's denominator can never shrink.

Why coins are hard, and why the order below is the order, is
[PEDAGOGY.md](PEDAGOGY.md) §4–§5. The registry row this fills in is
`PLANNED` → `money` in `src/engine/trail.js`; [TRAIL.md](TRAIL.md) already
advertises "7 waves, 134 identities, untimed mastery" and this document is
where those three numbers come from.

**Not a standards claim.** `2.MD.8` is about solving word problems using
`$` and `¢`; everything below is a component underneath it. Finishing all
134 identities would not demonstrate the standard. (PEDAGOGY.md, "What
this is not".)

## Decisions (user-confirmed)

Already locked by the approved Phase 7 plan, PEDAGOGY.md and the registry:

1. **The seven-wave order is a `[Product inference]`.** Recognition → one
   denomination → mixed collections → equivalence → making an amount →
   change → notation. It is informed by the documented obstacles (dime
   smaller than the nickel yet worth more; number-of-coins confused with
   value; equivalence and change arriving late) but is **not established
   by anything cited in PEDAGOGY.md**. Stated here in the same words on
   purpose: this doc must not launder a product choice into evidence.
2. **Untimed mastery.** The whole track. Derived and justified below —
   it is not a preference, it is the difference between a track that
   works and one that dead-ends silently.
3. **Coin art shows face value.** `src/art/coins.js` is new in R5; before
   Phase 7 coins were plain circles distinguished only by diameter.
4. **Schema v19, additive**, plus new appended pets.
5. **Kid-facing register**: paw penny / paw nickel / paw dime / paw
   quarter / Paw Buck, never "money" (VOCABULARY.md).

## Decisions taken here (verdicts, with reasons)

Each of these resolves an ambiguity that has a cheap wrong answer.

1. **One-kind counting is keyed by denomination AND count, not by total.**
   `one:dimex4` and `one:nickelx8` are different skills that happen to
   share 40¢. Reason: the skill is skip counting *by that coin's value* —
   eight nickels is a chain of eight (5, 10, … 40), four dimes a chain of
   four. Merging them would let a child who has never counted nickels
   inherit credit for nickels. Same principle that makes `groups:3x4`
   keyed by the factor pair rather than by 12 (PEDAGOGY.md §3).
2. **Distinct mixed collections with the same total are distinct
   identities.** `mix:1-1-0-0` (quarter + dime) and `mix:1-0-2-0`
   (quarter + two nickels) are both 35¢ and both in the frozen list. The
   knowledge being tested is *reading a handful*, which depends on what is
   in the hand; the total is the answer, not the identity. Seven
   same-total pairs are in the list deliberately (see the list).
3. **Equivalence is directional: consolidating up and breaking down are
   two identities.** `eq:5nickel-quarter` and `eq:quarter-5nickel` both
   exist. Reason: they are different *actions*, not two readings of one
   fact — the wallet's Swap coins 🔁 screen has always offered both
   directions separately, and a child who can gather five nickels into a
   quarter routinely cannot say what a quarter breaks into. This is why
   the wave has 12 identities rather than 6.
4. **Make-an-amount is keyed by the TARGET, not by the composition.**
   `make:30` is one identity even though 1 quarter + 1 nickel and 3 dimes
   both satisfy it. Reason: the demonstrated knowledge is "I can produce
   30¢", and any composition demonstrates it; keying by composition would
   invent thousands of identities for one skill and would punish a child
   for finding a second route. Consequence, stated plainly: mastery here
   means three successes **on the amount**, possibly by three different
   routes.
5. **Change is keyed by the (price, paid) PAIR, not by the change.**
   `chg:90-100` and `chg:15-25` both give 10¢ back and are different
   identities. Reason: the taught method is counting **up** from the price
   to the amount paid (PEDAGOGY.md §5), so the work is the chain between
   two endpoints. Keying by change alone would merge a one-dime hop with a
   nine-coin climb; keying by price alone would merge "paid with a
   quarter" and "paid with a Paw Buck". Four different pairs in the frozen
   list give 25¢ back — that cluster is the argument, in the data.
6. **Notation is keyed by the AMOUNT, and direction is not part of the
   identity.** `not:105` covers both "105¢ → $1.05" and "$1.05 → 105¢".
   Reason, and note this is the *opposite* call from decision 3: the two
   notation directions are one written correspondence read both ways,
   while the two equivalence directions are two different physical
   manipulations of a handful of coins. The asymmetry is deliberate and
   this sentence is the record of why.
7. **Wave *i* unlocks when wave *i−1* is fully mastered** (every identity
   at box ≥ 3), exactly as addition waves do. No new unlock semantics.
8. **Wave payouts are flat: one Paw Buck per wave**, even for the
   5-identity first wave. Checked against precedent rather than asserted:
   addition's Make Ten wave contains **2 facts** and pays a full Paw Buck,
   and Step Ups contains 30 for the same buck. A 5-identity wave paying
   100¢ is *stricter* than something already shipped.

## The bounded question domain — 134 identities

Two tables, seven rows each: content first, then mechanics. Every id
below is finite and enumerable; the whole set is generated by
`src/engine/moneywaves.js` (new) and pinned by a frozen fixture, so the
count `134` is a test, not a comment.

### A. Content

| # | Wave (kid) | Skill id | Complete domain | Canonicalisation | n |
|---|---|---|---|---|---|
| 1 | Know the coins | `coin:<denom>` | `denom ∈ {penny, nickel, dime, quarter, buck}` | the `DENOMS` id verbatim, lower case; one coin per question, so nothing to normalise | 5 |
| 2 | Count one kind | `one:<denom>x<n>` | `denom ∈ {nickel, dime, quarter}`, `n ∈ 2..10` | `<denom>` is the `DENOMS` id, `n` decimal without leading zeros; the literal `x` separates them, matching `normKey`'s `3x4` | 27 |
| 3 | Mixed collections | `mix:<q>-<d>-<n>-<p>` | frozen curated list of 30 (below): 2–4 coins, ≥2 denominations, ≤3 of any one, no Paw Bucks | positional counts, **always four fields, biggest coin first**, zeros written; a handful is a multiset, so the on-screen scatter is display-only and can never change the id | 30 |
| 4 | Equal value | `eq:<from>-<to>` | frozen list of 12 (below): the 11 `SWAPS` rules in both directions as they already exist, plus `eq:2dime1nickel-quarter` | each side is `<count><denom>` concatenated, count omitted when 1 (`dime`, not `1dime`); sides in the order asked, since direction is part of the identity | 12 |
| 5 | Make an amount | `make:<cents>` | `cents ∈ {5, 10, 15, … 100}` (multiples of 5) | integer cents, decimal, no leading zeros, no symbols | 20 |
| 6 | Count the change | `chg:<price>-<paid>` | frozen list of 24 (below); every `price` is a real listed store price, `paid > price`, `paid − price < 100` | both in integer cents, `price` first; the pair is written as asked and never reordered | 24 |
| 7 | Notation | `not:<cents>` | frozen list of 16 (below), spanning ¢-only and `$` forms | integer cents; `not:100` is the single identity behind both `100¢` and `$1.00` | 16 |

Total **134**. Wave 3's totals span 6¢–85¢, so every mixed handful is
under a dollar. Wave 2 deliberately crosses the dollar (`one:quarterx10`
= 250¢) and **answers throughout waves 2–6 are typed in cents**; the `$`
form arrives only in wave 7, so wave 7 has something to convert *from*.

### B. Mechanics

| # | Prompt → response | Renderer / screen | Introduction | Timing / mastery | Selector & review | Unlocks when | Denominator | Milestone | Earning ids | Max payout |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | one coin, face value visible → tap its value from 4 choices | `src/screens/money.js` round runner + `src/art/coins.js` in the existing `.coin.<denom>` class; 4-choice tiles borrowed from the little-games `.little-choices` pattern | **per identity**: each of the 5 coins is SHOWN and named on debut, never asked (`seen` flag) | untimed; box ≥ 3 = mastered | weakest-box-first, due identities jump the queue; 10 questions | the track is visible (`moneyVisible`) | 5 | `money1` | `mastery-money-coin:dime`, `set-money-w1` | 125¢ |
| 2 | 2–10 coins of one kind in a row → type the total in ¢ | numpad (`.numpad`, from Type it!) | **per wave**: one worked count, narrated (`seenOp`) | untimed | as above; 10 questions | wave 1 mastered | 27 | `money2` | `mastery-money-one:dimex4`, `set-money-w2` | 235¢ |
| 3 | 2–4 mixed coins, scattered not sorted → type the total in ¢ | numpad | **per wave**: one worked count, sorted biggest-first in front of the child | untimed | as above; **6 questions** (each is a multi-coin count) | wave 2 mastered | 30 | `money3` | `mastery-money-mix:2-1-1-0`, `set-money-w3` | 250¢ |
| 4 | one side shown as coins → tap the matching count, or the matching single coin | 4-choice tiles, two modes: "how many?" when the answer side has count > 1, "which coin?" when it is 1 | **per wave**: one worked swap, reusing the wallet's Swap coins 🔁 vocabulary | untimed | as above; 10 questions | wave 3 mastered | 12 | `money4` | `mastery-money-eq:dime-2nickel`, `set-money-w4` | 160¢ |
| 5 | "Make 65¢" → build it in the tray | `coinTray(host, { target, from: MAKE_PURSE })` — reversible, overshoot disabled | **per wave**: one amount built for the child, tap by tap | untimed | as above; **6 questions** | wave 4 mastered | 20 | `money5` | `mastery-money-make:65`, `set-money-w5` | 200¢ |
| 6 | price + amount paid → count the change up in the tray | `coinTray(host, { target: paid − price, start: price, countUp: true, from: null })` — the same component and unlimited drawer the checkout uses | **per wave**: one chain counted up out loud | untimed | as above; **6 questions** | wave 5 mastered | 24 | `money6` | `mastery-money-chg:75-100`, `set-money-w6` | 220¢ |
| 7 | an amount in one written form → tap the matching other form | 4-choice tiles (**not** the numpad: `$`, `¢` and the decimal point are the content, and the numpad cannot type them) | **per wave**: one pair shown side by side | untimed | as above; 10 questions | wave 6 mastered | 16 | `money7` | `mastery-money-not:105`, `set-money-w7` | 180¢ |

Per-wave question counts belong in the registry record as data, not in a
screen constant — the trail already carries `questions` per game (4 for
`groups`, 3 for `feed`), and `tests/trail.spec.js` pins it.

Waves 1, 4 and 7 answer with 4 choices. A guesser reaches box 3 with
probability 0.25³ ≈ 1.6% and a wrong answer steps the box back down, so
the Leitner ladder already does the work `more:`'s streak-of-4 does for
the little games. Distractors must be the **diagnostic** errors, not
random: the nickel's 5 opposite the dime (the size/value trap), `$1.5`
opposite `$1.50`, `9¢` opposite `90¢`.

### Frozen list — wave 3, mixed collections (30)

`mix:<quarters>-<dimes>-<nickels>-<pennies>`, with the total each makes.

```
two coins, two kinds
  0-1-1-0 15   0-1-0-1 11   0-0-1-1  6   1-1-0-0 35   1-0-1-0 30   1-0-0-1 26
three coins, three kinds
  1-1-1-0 40   1-1-0-1 36   1-0-1-1 31   0-1-1-1 16
three coins, two kinds
  2-1-0-0 60   2-0-1-0 55   1-2-0-0 45   0-2-1-0 25
  1-0-2-0 35   0-1-2-0 20   0-0-2-1 11   0-1-0-2 12
four coins
  1-1-1-1 41   3-1-0-0 85   1-3-0-0 55   2-2-0-0 70
  2-0-2-0 60   0-2-2-0 30   0-2-0-2 22   0-0-3-1 16
  2-1-1-0 65   1-2-1-0 50   1-1-0-2 37   0-1-3-0 25
```

Curated, not sampled, for four reasons: (a) exactly seven **same-total
pairs** — 11¢, 16¢, 25¢, 30¢, 35¢, 55¢, 60¢ — so decision 2 is
demonstrated inside the material a child actually meets; (b)
`0-2-1-0` (two dimes + a nickel = 25¢) is the handful that wave 4's
twelfth identity then names; (c) the value-versus-count trap is present
in both directions (`0-0-3-1` = 16¢ has four coins and is worth less than
`1-0-0-1` = 26¢ with two); (d) 6 two-coin / 12 three-coin / 12 four-coin
is an easy→hard gradient, and every total is under a dollar so no `$`
form is needed before wave 7.

### Frozen list — wave 4, equal value (12)

The first eleven are `SWAPS` in `src/engine/money.js`, in file order,
both directions as that array already contains them:

```
eq:4quarter-buck    eq:10dime-buck     eq:5nickel-quarter  eq:2nickel-dime
eq:10penny-dime     eq:5penny-nickel   eq:buck-4quarter    eq:buck-10dime
eq:quarter-5nickel  eq:dime-2nickel    eq:nickel-5penny
eq:2dime1nickel-quarter
```

The twelfth is the only equivalence whose left side is not all one kind,
and it is the one that generalises: equal value does not require matching
coins.

**Freeze it separately from `SWAPS`.** The list is *derived from* `SWAPS`
plus one literal, but it must be pinned by its own fixture, because a
future 12th swap rule (or a reorder) would otherwise silently add an
identity to a wave that has already been mastered and paid for — changing
its denominator, un-mastering it, and re-opening a closed wave. The test
asserts both directions: the 11 are still present in `SWAPS`, and wave 4
still has exactly 12 members.

### Frozen list — wave 6, count the change (24)

`chg:<price>-<paid>`; every price is a real listed price from the store
catalog, which is safe to embed because listed prices are **fixed
forever** by product rule (`tests/fixtures-store-prices.json`).

```
paid a quarter      10-25   15-25
paid two quarters   25-50   30-50   40-50   15-50   10-50
paid a Paw Buck     90-100  75-100  60-100  50-100  40-100
                    30-100  25-100  15-100  10-100
bigger tickets      100-125 120-125 100-150 125-150
                    150-200 160-200 120-200 90-125
```

Every change amount is 5¢–90¢, i.e. always under a dollar — which is not
a coincidence but the corollary already proved in `canOverpay`'s comment
(`change = sum − price < c ≤ 100`), so the change screen can never
dead-end. Change amounts repeat across pairs on purpose: 25¢ comes back
from four different pairs, 10¢, 40¢ and 50¢ from three each.

### Frozen list — wave 7, notation (16)

```
¢ band   5   9   15   40   60   75   90   99
$ band  100 105 110  125  150  199  200  1200
```

`9` and `99` are in the ¢ band because they are the amounts where "just
write the number" fails (`9¢` versus `$0.09`). `105` and `110` are in the
`$` band because they are where the decimal point is written wrong
(`$1.5` for `$1.50`). `1200` is `$12.00` — the crown, the most expensive
thing in the store, so the largest number a child has to read is one they
have a reason to read.

## Timing: what would happen if the money track used the normal rule

Worked out from `applyAnswer` in `src/engine/leitner.js` (module-private),
`SLOW_CAP = 2`, `MASTERY_BOX = 3`.

`fast = correct && ms <= fastMs`, and `fastThresholdMs(profile)` returns
`FAST_MS` (6000 ms) until a child is calibrated, then
`min(10000, max(4000, avgMs × 1.5 + 1500))` — so the bar is **4–10
seconds**, measured on ×0/×1 gimmes where the only work is reading and
typing.

Then:

```js
if (fast)            s.box = min(MAX_BOX, s.box + 1);
else if (correct) { if (s.box < SLOW_CAP) s.box += 1; }
else                 s.box = max(0, s.box - 1);
```

A money question is multi-step by construction. Wave 5 needs 2–5 taps on
the tray, each one re-rendering and (with `say` wired) speaking a running
total. Wave 6 counts a chain up coin by coin. Wave 3 requires sorting a
scattered handful before adding it. None of that finishes inside 4–10
seconds, and the fastest child would be racing an interface, not
recalling a fact.

So `fast` would be **false on essentially every money answer**, the
`else if (correct)` branch would run, and `s.box` would climb 0 → 1 → 2
and **stop at `SLOW_CAP = 2`**. `MASTERY_BOX` is 3. Therefore:

- `mastered` (`prevBox < 3 && s.box >= 3`) **never fires**, for any of the
  134 identities;
- not one of the 670¢ of mastery nickels is ever paid;
- `isMoneyWaveMastered` is never true, so **wave 2 never unlocks** — the
  track is five questions deep, forever;
- no wave Paw Buck, no money milestone, no pet;
- the wave meter, which awards partial credit `min(box, MASTERY_BOX)`,
  fills to exactly **2/3 and freezes** — a bar that looks like it is
  working and never finishes;
- the only surviving income is `polished` (`correct && wasDue`), still
  1¢ and capped at 25¢/day. A track that pays a penny a day and cannot
  advance.

That is precisely the failure shape the trail registry was built to end
(`taway` and `paths` in v1.47.3: a game the frontier picker believed was
never learned or always finished, with nothing on screen saying so).

### The engine API — a wrapper, not an export

`applyAnswer` stays private. Add to `src/engine/leitner.js`, beside the
existing per-track wrappers:

```js
// Untimed tracks (money): the correct method IS slow, so there is no
// speed bar. Passing an infinite `fastMs` makes every correct answer
// take the fast branch, so boxes climb normally, SLOW_CAP never binds,
// and mastery is reachable — with applyAnswer untouched.
export function recordMoneyAnswer(profile, skillId, correct, ms = 0) { … }
export function recordMoneyEcho(profile, skillId) { … }   // `seen` / `seenOp`
export function moneyMasteredCount(profile) { … }
```

Three properties this wrapper must have:

1. It calls `applyAnswer(s, correct, ms, Infinity)`. Everything else keeps
   its existing meaning: wrong answers still step down one box, `isDue`
   and `BOX_FRESH_MS` still govern review, `polished` still fires.
2. It returns `{ ...res, fast: false }`. A truthful `fast: true` would
   make `activity.js` and `quiz.js` play the ⚡ speed sound
   (`if (r.fast) sfx.fast()`) and `results.js` count a "speedy" tally —
   celebrating speed in a drill that has no speed bar.
3. It passes the real `ms` (so `s.avgMs` stays useful to grown-ups) but
   must never touch `profile.speed`. Only `recordAnswer` does that, and
   only for ×0/×1 gimmes, so no change is needed — just don't add one.

Rejected alternatives: an `untimed` flag threaded through `applyAnswer`
(a new branch inside the one function every track shares); raising
`SLOW_CAP` (a silent global loosening of what mastery means for ×, ÷, +
and −).

New test, in the same spirit as the migration gate: one money identity
reaches `MASTERY_BOX` after three slow corrects, and a multiplication
fact given the identical slow `ms` does **not**.

### Why untimed, wave by wave

| # | Why timing would measure the wrong thing |
|---|---|
| 1 | a 4-choice tap whose latency is dominated by reading four options |
| 2 | skip counting a chain of up to ten coins — the correct method *is* sequential; the tables' own Counting Path warm-up is unscored for exactly this reason |
| 3 | sort-then-add: largest-first requires scanning a scattered handful |
| 4 | short to answer, but the reasoning is a value multiplication; and a track with one timed wave and six untimed ones teaches a child two different rules and makes the ⚡ sound appear and vanish |
| 5 | many taps plus undo — a timer punishes self-correction, which is the charter's errorless promise inverted |
| 6 | a count-up chain with a re-render per coin |
| 7 | reading `$` and `¢` forms: a slow reader would be marked slow at money |

The registry record must therefore set `timed: false` explicitly — the
`T()` track factory defaults to `timed: true` — and `tests/trail.spec.js`
should assert it, so nobody restores the default by tidying.

## Economy

### No new rate versions are needed (and why that is load-bearing)

`RATE_VERSION` and `tests/fixtures-rates.json` are keyed by **reason
only**: `sitting`, `mastery`, `set`, `polish`, `skill`. Money reuses the
reasons `mastery` (5¢, `FACT_MASTERY_PAY`) and `set` (100¢,
`SET_MASTERY_PAY`) at the **same amounts**, so:

- no new `RATE_VERSION` key, no bump, no fixture change;
- `rateTag('mastery')` and `rateTag('set')` are both `''` at v1, so ids
  carry no suffix — and if either rate is ever re-versioned later, money
  ids pick up `@r2` automatically along with every other track's.

The finding that makes this a **requirement rather than a convenience**:
because the lock is keyed by reason, the guard test reads the single
module constants `FACT_MASTERY_PAY.cents` and `SET_MASTERY_PAY.cents`. A
*per-track* money amount — say 2¢ for a money mastery — would be
completely **invisible** to `tests/fixtures-rates.json`, and the ledger
would then see the reason `mastery` at two amounts across devices, void
both, and silently cost the child the earning. That is the exact incident
class the rate versions exist to prevent. So: either money pays the
existing amounts under the existing reasons (recommended, and what this
plan does), or it needs its own reason string **plus** its own
`RATE_VERSION` key **plus** its own fixture entry — all three, or the
guard quietly stops covering it. Add a fixture-shape assertion that every
reason the money track writes appears in both `RATE_VERSION` and
`fixtures-rates.json`.

### Deterministic ids

```
mastery-money-<skillId>${rateTag('mastery')}     134 possible
set-money-w<1..7>${rateTag('set')}                 7 possible
```

Examples: `mastery-money-coin:dime`, `mastery-money-one:quarterx6`,
`mastery-money-mix:2-1-1-0`, `mastery-money-eq:dime-2nickel`,
`mastery-money-make:65`, `mastery-money-chg:75-100`,
`mastery-money-not:105`; `set-money-w3`.

`earnSetMastery(profile, 'w3', 'money')` already produces
`set-money-w3` — reusable unchanged. `earnFactMastery` is **not**
reusable: it builds its key from the numerals `(a, b)`. Add a sibling
`earnMoneyMastery(profile, skillId, now)` with the same body and
`key = skillId` (cheaper to review than generalising the function every
existing track depends on).

Parser safety, checked against the two id parsers in
`src/engine/ledger.js`:

- `epochOfId` matches `/@(\d+)(?:-[cr]-[a-z]+)?$/`. Money skill ids use
  only `[a-z0-9:-]` and contain no `@`, so every money id resolves to
  epoch 1 — correct, since earnings are never voided by a store reset.
  A future `@r2` rate tag still resolves to epoch 1 (`r2` is not `\d+`),
  which is the distinction `tests/economy-invariants.spec.js` already
  pins.
- `groupOf` matches `/^(buy-.+?)…/` and `/^(swap-.+)-(a|b)$/`. Money ids
  begin `mastery-` or `set-`, so each stands alone as its own group.
- **Constraint to enforce by test**: no money skill id may contain `@`,
  `~`, or `-c-`/`-r-`. Extend the existing parser-safety test to walk all
  134 generated ids plus the 7 wave ids, exactly as it walks `CATALOG`.

### The ceiling this adds

| | count | each | total |
|---|---|---|---|
| paid mastery units | 134 | 5¢ | 670¢ |
| wave payouts | 7 | 100¢ | 700¢ |
| **money track, lifetime** | | | **1370¢ = 🐾$13.70** |

Context, recomputed from the code rather than quoted: one-time frontier
payouts today are × (91 keys × 5¢ + 12 × 100¢ = 1655¢) + ÷ (90 × 5¢ +
12 × 100¢ = 1650¢) + adding (66 × 5¢ + 7 × 100¢ = 1030¢) + taking away
(1030¢) + little-pup skill pennies (`littleSkillTotal()` = 132 → 132¢) =
**5497¢ = 🐾$54.97**. (That model reproduces PHASE6's "≈ $54.41" exactly
at the little-skill total of the time, 76 — which is the check that the
arithmetic is right.) Money takes it to **6867¢ = 🐾$68.67, +24.9%**.
On top of that sit the two uncapped daily faucets: sitting ≤ 20¢/day and
polish ≤ 25¢/day.

### Is that a calibration problem? Flagged, with the actual numbers

- The most expensive item in the store is **`crown` at 1200¢ = 🐾$12.00**
  (then `tiara` 800¢, `sunglasses` 200¢, `scarf` 160¢). The money track
  alone (1370¢) buys the crown outright with 170¢ over.
- **CORRECTED 2026-08-07.** This section previously said the catalogue
  "totals 3400¢" and that the earning ceiling was 1.6× all of it — that
  a child could buy everything twice. That was wrong, because it summed
  each item ONCE. **Gifts are bought per friend**: `isOwned` keys a gift
  by its wearer, so the same scarf can be bought for every dog and every
  pet. With 25 dogs and 26 pets, the reachable spend is:

  | | items | reachable |
  |---|---|---|
  | toys (once ever) | 14 | 545¢ |
  | treasures (once ever) | 5 | 4,600¢ |
  | gifts (once **per friend**, ×51) | 10 | 120,105¢ |
  | **total** | 29 | **125,250¢ = 🐾$1,252.50** |

  So the truth is the opposite of what was written: against a lifetime
  ceiling near 6,900¢, a child can afford roughly **5%** of what the shop
  sells, and 96% of the shop is gifts. There was never a shortage of
  things to want, and "add store content to absorb income" was reasoning
  from a wrong number. Scarcity is the actual state, which is fine — it
  makes choosing matter, and nothing expires or pressures a child — but it
  should be believed on purpose rather than by accident.
- The per-wave rate is **not** the loose knob it looks like. Wave 1 pays
  125¢ for 5 identities (25¢/identity) against wave 3's 250¢ for 30
  (8.3¢/identity) — but addition's Make Ten wave pays 100¢ for **2**
  facts (50¢/fact), so wave 1 is stricter than shipped precedent. Flat
  per-wave pay is the mechanically uniform rule and this plan keeps it.
- **Recommendation (unchanged, better founded)**: ship the amounts above.
  Money adds ~20% to a lifetime ceiling that already buys only a small
  fraction of the shop, so it does not threaten scarcity. If scarcity is wanted,
  reach for **store content** rather than payout rates. Adding items is
  free (prices are fixed only once *listed*); lowering a rate requires a
  version bump, cannot apply retroactively, and hands a child two amounts
  for one earning if done wrong.

## Rewards: the pet arithmetic (verified, and it does not currently work)

Counted from the code, not from memory:

- `PETS` in `src/art/pets.js` — **26** entries.
- `MILESTONES` in `src/engine/cozy.js` — **24** entries, in this order:
  `look bond5 bond10 teen w1..w7 s1..s7 type taway paths count3 count5
  trace`.
- `petForMilestone(id)` = `PETS[MILESTONES.findIndex(...) % PETS.length]`
  — **positional, and wraps**.
- `checkPetUnlocks` skips a milestone only when `petUnlocks` already
  contains an entry with that **MILESTONE** id.
- `mergeProfiles` unions `petUnlocks` by **petId** (schema.js: "union by
  petId, keeping the earliest adoption").

R3 and R4 add `counton` and `groups` → **26 milestones**, taking indices
24 and 25 → `guinea-4` and `hedgehog-4`. Every one of the 26 pets is then
spoken for, with **zero spare**.

Appending seven money milestones (`money1`..`money7`) at indices 26–32
would compute `26 % 26 … 32 % 26` = **0–6** → `cat-1, cat-2, cat-3,
rabbit-1, rabbit-2, guinea-1, guinea-2` — the pets already adopted by
`look`, `bond5`, `bond10`, `teen`, `w1`, `w2`, `w3`. Three concrete
failures follow, in order:

1. **The reward is not a reward.** Mastering a money wave "adopts" a pet
   the child has had since Quick Look. `isPetAdopted` is already true,
   the Corner shows nothing new, and the celebration is a lie. So is
   `nextPetGoal`, which would dangle a pet already sitting on the cushion.
2. **The sync drops it.** `petUnlocks` gains a second entry with the same
   `petId` and a different `milestone`; the merge unions by `petId`, so
   the money entry disappears at the first sync.
3. **Then it loops.** With the record gone, `checkPetUnlocks` sees an
   earned-but-unrecorded milestone and adopts again — a fresh
   "new friend!" every session and permanent write-churn between devices.
   That is the heal-loop shape `tests/economy-invariants.spec.js` exists
   to catch.

### The requirement, precisely

- **R5 must append at least 7 new pets to `PETS`**, so that
  `PETS.length ≥ 33` once R3's and R4's two milestones and R5's seven are
  all in. Exactly 7 gives 33 = 33, i.e. no slack; **9 is recommended**,
  since the two spare pets that exist today are the only reason R3 and R4
  need no art at all.
- **The invariant to enforce by test** is the property, not its cause:
  `new Set(MILESTONES.map((m) => petForMilestone(m.id).id)).size ===
  MILESTONES.length` — no two milestones map to the same pet. Add
  `PETS.length >= MILESTONES.length` alongside it as the readable
  diagnosis. Neither exists today; the invariant has held by luck.
- **Append only, never insert or reorder**, in both arrays — the mapping
  is positional and must be identical on every device and every app
  version. `MILESTONES` already says so in a comment; the test makes it
  mechanical.
- **Ship order fixes the mapping.** If R5 shipped before R3/R4, money
  would take indices 24–30 and `counton`/`groups` would land at 31–32 —
  different pets than planned, and a child mid-upgrade could see one pet
  for two different milestones. R5 must not be reordered ahead of R3/R4
  without redoing this arithmetic.
- **Habitats**: seven new pets, one per existing habitat, exactly as
  Phase 6 did (PHASE5's overwhelm rule). The Corner becomes 33 pets in
  the same 7 habitat rows of 4–5 — never a wall of cards.
- Money milestones are `kind: 'money'` in `MILESTONES`, and
  `milestoneReachable` needs a third branch returning `moneyVisible(p)`,
  or a bridge-only child is shown a goal they cannot reach.
- Strengthening the `petUnlocks` merge to union by `milestone` as well as
  `petId` is **not** required if the invariant holds, and it is a merge
  change — so it stays out. The asymmetry is recorded here as the reason
  the invariant is load-bearing rather than cosmetic.

## Schema v19 (additive) and merge semantics

- `profile.money = {}` — a Leitner stat map keyed by money skill id, with
  the same stat shape as `facts`/`addition`/`subtraction`
  (`{ attempts, correct, avgMs, box, lastSeen }`, plus the `seen` /
  `seenOp` echo flags). The registry's planned record already declares
  `statMap: 'money'`.
- Migration 18 → 19 in `migrateProfile()`: `doc.money = doc.money ?? {}`
  and nothing else. Add `'money'` to the `isMap` list in
  `validProfileDoc`, and to `asObj`-style normalisation beside the other
  stat maps. `tests/migration.spec.js` seeds old-schema profiles and fails
  on any progress loss — that is the gate.
- **Merge: `money` uses `mergeStatMap`** — richer-wins per identity,
  identical to `facts`/`addition`/`subtraction`. Nothing else is added to
  the merge:
  - wave mastery and wave unlock are **derived** (`isMoneyWaveMastered`),
    never stored. Stored unlock state is exactly what a merge can lose;
  - milestone/pet adoption merges through the existing `petUnlocks` union
    (given the invariant above);
  - payouts merge through the existing `pawBucks.txns` union by id, and
    the deterministic ids mean two devices witnessing the same mastery
    pay once.
- `subjects.money` joins the parent visibility controls (show / hide /
  `'auto'`), defaulting to `'auto'` for existing docs.
- Readiness, following R1's one-way-door rule: `moneyReady(p)` =
  skip counting by 5s and 10s known (`path:5`, `path:10`) **and** typing
  1–10 known (`type:`, the numpad is the answer surface for waves 2–3)
  **and** addition's Make Ten wave mastered — plus the same mid-trail
  inference `addingReady` uses (real `facts`/`division` history
  qualifies). `moneyEarned(p)` = `moneyReady(p) || hasHistory(p.money)`,
  keeping the grandfathering guarantee the other tracks have;
  `moneyVisible` = `visible(subjects.money, isRevealed(p, 'track:money')
  || moneyEarned(p))`, and `['track:money', moneyEarned]` joins
  `TRACK_REVEALS` so the gate can never close on a child it has opened.

## Open — needs an owner decision

1. **What the track is called on the kid's screen.** The registry's
   placeholder is "Paw Bucks 🪙", which collides with the *currency*
   ("Paw Bucks" in VOCABULARY.md) and with the little home's piggy bank
   🐷. A child would see the same two words for the wallet and for the
   drill. Proposal: **"Counting coins 🪙"**. This needs a verdict because
   VOCABULARY.md is enforced by `tests/vocab.spec.js` and the row has to
   be written before any string is.
2. **Where the track appears** — the little home, the pack home, or both.
   The Phase 5 precedent is a deliberate split (Track 1 little, Track 2
   big-kid). Money is the first track that genuinely belongs to both
   sides: its readiness can be reached from either. Proposal: **both**,
   like the Cozy Corner.
3. **Whether wave 3 (30) and wave 6 (24) should each split in two.**
   Under sequential unlocking, wave 3 requires ≥ 90 correct answers before
   wave 4 opens. Proposal: **keep them whole** and watch it — and if it
   proves too long, split the wave (which adds identities and wave bucks,
   both additive) rather than lowering the unlock threshold, which would
   change semantics the fixtures freeze.

## Build order (rollbackable commits)

1. **This document**, plus BACKLOG/CHANGELOG entries and the TRAIL.md
   Phase 7 row updated to match it. No code.
2. **Schema v19**: `profile.money`, migration step, `validProfileDoc`,
   `mergeStatMap` wiring, `subjects.money`. Ships alone and does nothing
   visible — the migration gate runs green before any feature exists.
3. **The untimed engine API**: `recordMoneyAnswer` / `recordMoneyEcho` /
   `moneyMasteredCount` in `leitner.js`, plus the test that a money
   identity masters on slow answers and a multiplication fact does not.
   No screen yet.
4. **`src/engine/moneywaves.js`**: the 134 identities, the four frozen
   lists, `MAKE_PURSE = { quarter: 3, dime: 3, nickel: 3, penny: 5 }`
   (verified: every multiple of 5 from 5¢ to 100¢ is makeable from it,
   no Paw Buck so `make:100` must be built, and 5 pennies kills the
   count-in-ones route), wave membership, `moneyWaveProgress`,
   `isMoneyWaveMastered`, `buildMoneyRound`. Plus the fixture that pins
   all 134 ids and the count.
5. **`src/art/coins.js`**: face-value coin faces rendered into the
   existing `.coin.<denom>` class, so `cointray.js` and the wallet pick
   them up with no second renderer. Visible improvement on its own, and
   revertable on its own.
6. **`src/engine/readiness.js`**: `moneyReady`, `moneyVisible`,
   `track:money` in `TRACK_REVEALS`, `trackState` branch, Grown-Ups trail
   row. The track can now appear, empty.
7. **`src/screens/money.js`** waves 1–4: the wave grid with meters, the
   4-choice and numpad rounds, echo intros, `earnMoneyMastery` /
   `earnSetMastery(…, 'money')`, results ceremony.
8. **Waves 5–6**: the `coinTray` rounds (`make:` with `MAKE_PURSE`,
   `chg:` with `countUp` and an unlimited drawer). Isolated so a tray
   regression rolls back without touching waves 1–4.
9. **Wave 7** notation, and the parser-safety test extended over all 141
   earning ids.
10. **Pets and milestones**: append ≥ 7 pets, append `money1`..`money7`
    to `MILESTONES` with `kind: 'money'`, the `milestoneReachable`
    branch, and the two new invariant tests (unique pet per milestone;
    `PETS.length >= MILESTONES.length`). Last, because it is the commit
    that can silently corrupt the Cozy Corner if the arithmetic above is
    wrong — and first to be reverted if it is.
11. **Connectors**: `suggest-next` learns the money waves (as v1.8.0
    taught it the add/sub waves), Grown-Ups progress card gains a
    "Counting coins x/134" row, TRAIL.md rows flipped to `shipped`.
