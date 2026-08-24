# Nothing in `judge/` may write to the evidence trail when you run it

## What happened

The adversarial instrument review swept the library by executing every
instrument. Fourteen files named `_r<N>card.mjs` **appended a hard-coded round
record to `judge/<coin>-history.jsonl` at module top level**, with no guard and
no idempotency check. The sweep wrote **54 duplicate round records** across the
five history files — a 49.5 % inflation of a 109-entry trail. The reviewer
caught it and reverted it; the main checkout was never corrupted.

**Auditing the library corrupted the thing being audited.** That is worse than
§1.1's named defect: it does not print a retracted verdict, it *writes* one.

The judge wrote those fourteen files. Each was a one-shot action to record a
verdict, and each was then left in the instrument library, where "run everything
and see what works" is a reasonable thing for anyone to do.

## What was done

All fourteen are **deleted**. Verified first that every card's payload is
already present in the committed `*-history.jsonl` — 14 of 14, checked by
parsing the trail for the coin/round pair each card writes. The record is the
evidence; the script that appended it adds nothing and can only duplicate.

## The rule

**An instrument reports. It does not write.**

- Nothing under `coloringbook/judge/` may append to, or modify, any
  `*-history.jsonl`, any frozen `.json` target, or anything in
  `coloringbook/ref/`. Running the whole library in any order must leave the
  repository byte-identical.
- A verdict is recorded by the judge, deliberately, as part of a commit — not
  by executing a script that lives beside the scorers.
- If a one-shot action script is ever needed again, it does not go here. It goes
  in the session scratchpad, is run once, and is never committed.

## 2026-08-24 — the rule was not wide enough, and a file proved it

`_sw8sync.mjs` called `writeFileSync` on **`src/art/coins.js`** at module top
level, with no flag and no guard. The instrument sweep ran it and it **edited
the subject**, replacing `VIGNETTE.coat` with a path built from `_sw7gen.OVAL`
— a superseded ellipse, ry 14.00 where the art draws 15.75.

The fourteen `_r<N>card.mjs` files wrote a *record*. This wrote **the drawing
every gate is scored against**, in `judge/`, which COIN-JUDGE.md §1 exists to
keep out of the art: *"a specialist that can edit the target can score anything
it likes."*

So the rule is restated wider, and it is not only about `*-history.jsonl`:

> **Running any instrument, in any order, must leave the repository
> byte-identical — `src/art/` included.**

A generator that keeps the art in sync is a good idea. A generator that can
*silently* overwrite the art is a liability, because the first time its own
copy goes stale it will propagate the stale copy into the subject. `_sw8sync`
is now a drift DETECTOR: it reports, exits non-zero, and writes nothing under
any flag. The human applies the change.

Three earlier violations of this rule are recorded and still open:

- `_x6mat.mjs` rewrites `_x6-run.json`, which was in the frozen set, so every
  round self-voided on its first mandated check (fixed by excluding run
  artefacts; the write remains).
- `_jb11d11.mjs json` and `_jb10d13.mjs json` overwrite frozen hashed artefacts
  from a documented CLI flag, with no guard.
- `_jt1transfer.mjs` was writing renders into `coloringbook/ref/`, the shared
  reference pool; moved to `ref/_scratch/`.
