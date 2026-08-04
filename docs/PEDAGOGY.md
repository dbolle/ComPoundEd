# Pedagogy — what the trail is built on, and what it isn't

Every claim below carries a tag, because the four kinds are not
interchangeable and conflating them is how a product ends up believing its
own marketing:

| Tag | Means |
|---|---|
| `[Standard]` | what a published standard says, quoted |
| `[Empirical]` | a research finding, **with the population and materials it actually used** |
| `[Practice guide]` | a recommendation from an IES/WWC practice guide |
| `[Product inference]` | our design choice. Reasoned, but **not established by anything cited here** |

Structure per section: the claim → what Compounded does → where in the code.

---

## What this is not

Compounded builds **supporting fluencies and brief representational
bridges**. It is not a curriculum and it is not a standards assessment.

Two specific things follow, and they are easy to get wrong:

- **Standards are cited to locate a skill, not to claim coverage.** When a
  row says `2.MD.8`, it means "this drill supports work described there",
  never "a child who finishes this has met 2.MD.8". 2.MD.8 is about solving
  **word problems** using `$` and `¢` notation; the coin-counting drills
  here are components underneath that, and finishing all of them would not
  demonstrate the standard.
- **Concepts, word problems, measurement and geometry belong to school.**
  This is a CHARTER non-goal, not an oversight: "Compounded drills what
  must become automatic."

A reader who wants the map of what exists rather than why should read
[TRAIL.md](TRAIL.md), which documents the registry in
`src/engine/trail.js`.

---

## 1. How children learn the number-word sequence

`[Empirical]` Acquiring the count sequence splits into two phases: first
learning to *say* the conventional string, then elaborating order and
equivalence relations over it (Fuson & Richards). In English, 1–12 must be
memorized outright; the teens are irregular ("thirteen" and "fifteen" break
the pattern their own roots suggest, which is why children say "fiveteen");
and decade labels cannot be generated from a rule.

`[Empirical]` Asked to count as high as they can, many children stop at
**decade transitions — most often 29 and 39**.

**What we do.** The `counton` game (R3, Phase 7) samples *at* the crossing
rather than uniformly, because uniform sampling spends most of its
questions where nothing is hard. Spoken number words are a lookup table for
the irregular ranges rather than composed from rules, since English does
not compose them.

**Where.** `numberWord()` in `src/sound.js`; the `seq:<decade>` namespace in
`src/engine/trail.js`.

---

## 2. Linear representations of number

`[Empirical]` Roughly one hour of playing a **linear number board game
numbered 1–10** improved low-income preschoolers' counting, numeral
identification, magnitude comparison and number-line estimation, with gains
still present nine weeks later. Classmates who played the **identical game
with colours instead of numbers** improved on none of those measures
(Ramani & Siegler, *Child Development*, 2008; Siegler & Ramani,
*Developmental Science*, 2008).

That contrast is the useful part: the benefit came from the numbers and the
linear layout, not from the game being a game.

`[Product inference]` **Extending that result to a 0–120 placement task is
not warranted by it.** Different range, different task (placing a numeral
versus moving along a track), different age. We build the number path
because a linear model of magnitude is worth having and this is the best
evidence available for its *shape* — not because the study licenses the
feature. Accordingly `place:*` is **enrichment**: it pays, but it does not
gate anything and it is not required for the milestone.

`[Practice guide]` The number line is recommended as a central
representational tool from the early grades, and specifically for fraction
magnitude (*Developing Effective Fractions Instruction*, NCEE 2010-4039;
*Assisting Students Struggling with Mathematics*, WWC 2021).

**Where.** `src/art/numberpath.js` (R3); reused for fraction magnitude in
Phase 8.

---

## 3. From counting to multiplicative reasoning

`[Empirical]` Skip counting is **not** multiplicative reasoning. The
prerequisite is constructing **composite units** — coming to see a group as
one thing that can itself be counted — which also underpins fractions and
proportional reasoning. A child who can recite 3, 6, 9, 12 may still not be
able to say how many *groups* they have counted.

**What we do.** Skip counting stays what it is: a warm-up, and part of the
gate into the tables. The work that actually tests unitizing is `groups`
(R4), where each item asks for the number of groups, the size of a group,
*and* the total — so a fast total cannot stand in for the structure. The
identity is the factor pair (`groups:3x4`), not the total, because 3×4 and
2×6 are different structures that happen to share 12.

**Where.** `paths` and `groups` in `src/engine/trail.js`; `tablesReady` in
`src/engine/readiness.js`.

---

## 4. Why coins are hard

`[Empirical]` Coin value is not perceptible from the coin. The **dime is
the smallest US coin yet worth more than the nickel**, and children
reasonably infer size implies value. Separately, children conflate the
*number* of coins with their *value* — a handful of pennies looks like more
than two quarters. Equivalence (two nickels are a dime) and giving change
are documented as the late-arriving skills.

**What we do.** Recognition comes before arithmetic, and equivalence and
change come last. Coin art shows **face value**, which is what makes the
size/value conflict teachable rather than merely confusing: the dime is
visibly smaller *and* visibly says 10¢. (Before Phase 7 the app drew coins
as plain circles distinguished only by diameter — unusable for teaching
recognition, and hard to tell apart at all with low vision.)

`[Product inference]` **The seven-wave order** — recognition, one
denomination, mixed collections, equivalence, making an amount, change,
notation — is our sequencing. It is informed by the obstacles above but is
**not** established by any source cited here.

**Where.** `src/art/coins.js` and `src/engine/moneywaves.js` (R5).

---

## 5. Making change

`[Practice guide]` Counting **up** from the price to the amount paid (the
cashier's method) is the standard teaching strategy for change, and it
connects to counting on rather than to subtraction — which matters because
counting on is already fluent by the time change appears.

**What we do.** The checkout's change screen starts at the price and counts
up, one coin at a time, with the amount paid as the visible target. The
purchase is refused unless the arithmetic balances exactly, but coins that
would overshoot are *disabled* rather than punished — errorless by
construction, per the charter.

**Where.** `runCheckout` in `src/screens/store.js`; `src/ui/cointray.js`
(R2), reused by the money track's make-an-amount and change waves.

---

## 6. What predicts later achievement

`[Empirical]` Elementary-school knowledge of **fractions and division**
uniquely predicts high-school algebra knowledge and overall mathematics
achievement five to six years later, controlling for other mathematical
knowledge, general intellectual ability, working memory, and family income
and education (Siegler et al., *Psychological Science*, 2012).

**What we do.** Division already has a full track. Phase 8 leads with
fraction equivalence rather than with the more obvious next arithmetic
step, on the strength of this.

---

## 7. Practice design (existing, previously uncited)

`[Empirical]` The app's addition/subtraction wave order follows a strategy
progression (Step Ups → Doubles → Make Ten → Near Doubles → Tens & Teens →
Ten Bridgers → the rest) rather than numeric order, and fact intros follow
counting → deriving → retrieval (Baroody).

`[Product inference]` The specific Leitner box thresholds, the freshness
windows that make a fact "rusty", and the speed bar's per-child calibration
are tuned by observation of real use, not taken from a source.

**Where.** `src/engine/waves.js`, `src/engine/leitner.js`,
`src/screens/meet.js`.

---

## Sources

- Siegler, R. S., Duncan, G. J., Davis-Kean, P. E., Duckworth, K.,
  Claessens, A., Engel, M., Susperreguy, M. I., & Chen, M. (2012). Early
  predictors of high school mathematics achievement. *Psychological
  Science*, 23(7), 691–697. <https://pubmed.ncbi.nlm.nih.gov/22700332/>
- Ramani, G. B., & Siegler, R. S. (2008). Promoting broad and stable
  improvements in low-income children's numerical knowledge through playing
  number board games. *Child Development*, 79(2), 375–394.
  <https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1467-8624.2007.01131.x>
- Siegler, R. S., & Ramani, G. B. (2008). Playing linear numerical board
  games promotes low-income children's numerical development.
  *Developmental Science*.
  <https://siegler.tc.columbia.edu/wp-content/uploads/2019/02/sieg-ram08.pdf>
- Fuson, K. C., & Richards, J. The acquisition and elaboration of the number
  word sequence.
  <https://link.springer.com/chapter/10.1007/978-1-4612-3754-9_2>
- Siegler, R. S., et al. (2010). *Developing Effective Fractions Instruction
  for Kindergarten Through 8th Grade*. IES Practice Guide NCEE 2010-4039.
  <https://ies.ed.gov/ncee/wwc/practiceguide/15>
- *Assisting Students Struggling with Mathematics: Intervention in the
  Elementary Grades* (2021). IES/WWC Practice Guide.
  <https://ies.ed.gov/ncee/wwc/PracticeGuide/26>
- The role of skip counting and figurative reasoning in children's
  reasoning (VCTM).
  <https://vctm.org/The-Role-of-Skip-Counting-and-Figurative-Reasoning>
- Language-responsive support for multiplicative thinking as unitizing.
  *ZDM Mathematics Education*.
  <https://link.springer.com/article/10.1007/s11858-020-01206-1>
- Kalish, C. Cognitive development and children's understanding of personal
  finance.
  <https://web.education.wisc.edu/cwkalish/wp-content/uploads/sites/13/2017/10/FinancialEd.pdf>
- Tracy, D. M. *Learning about Money* (ERIC ED427978) — coin size/value
  mismatch and value-versus-count confusion.
  <https://files.eric.ed.gov/fulltext/ED427978.pdf>
- Common Core State Standards for Mathematics, grade-level pages
  (thecorestandards.org). 2.MD.C.8 tasks:
  <https://tasks.illustrativemathematics.org/content-standards/2/MD/C/8>
