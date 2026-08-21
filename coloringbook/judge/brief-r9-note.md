# Specialist brief — round 9, the $1 NOTE

Written by the judge 2026-08-21. The note has been untouched all session while
four coins were worked, and it is the worst-scoring subject in the set: **18 of
its 30 rows fail or are unmeasured.**

```
SUBJECT      the $1 note (`buck`) — obverse and reverse
DIMENSIONS   D2 the reverse roundels, D4 the counts, D1 the obverse silhouette
```

## CONCURRENCY

Other rounds are running on the **cent obverse** and the **dime obverse**. You
own the **note**, which shares no face with either. You may **not** edit a
shared helper — `struck`, `reliefOff`, `spendOf`/`fitOff`, `arcText`/`flatText`,
`EDGE`, `PALETTE`, the tier logic. Several of those are subjects of queued
serialised rounds. If a repair needs one, stop and report it.

## Re-derive first

Every figure below is from the note's round 0 and the session has moved the
tree a long way since. **Measure what the tree says before acting**, and report
it. The brief has been the thing in error in six consecutive rounds.

| row | round-0 value | gate |
|---|---|---|
| **D1 obverse** | **0.1496** | ≥ 0.95 |
| **D2a reverse** (left roundel) | IoU **0.3943** full / 0.4238 icon, dcx 6.88 | ≥ 0.95 |
| **D2b reverse** (right roundel) | IoU **0.429** / 0.4473, dcx −6.88 | ≥ 0.95 |
| D2c / D2d reverse | −25.6 % and −23.9 % | — |
| **D4 obverse** | count **2 against 4**, error 2 | count error 0 |
| **D4 reverse** | 4 courses at mid/full, 1 at icon | count error 0 |
| D3, D5 | UNMEASURED — §2 says that fails | — |

## The three defects already named, with measurements

The backlog carries these from earlier work; confirm each against the
photograph before acting on it.

1. **The roundels are 1.80× too wide and 26 % too close together, and should be
   ellipses** (ry/rx 1.314). That single fact probably accounts for most of
   D2a/D2b's IoU deficit and both centre offsets — a 6.88-unit dcx on each
   side, opposite in sign, is a *spacing* error, not a placement error.
2. **The pyramid is the wrong pyramid.** The real one is **truncated, with a
   detached capstone above a ray gap**; ours is a pointed triangle with a
   second triangle on top. Same class as the nickel's phantom columns — a
   confident drawing of something the object does not do.
3. **D8 is nearly useless on this subject**: it passes at 0.0000 % while the
   eagle sits **10.474 % outside its own roundel, 4.840 units deep**, because
   `struck()` is passed `rField = 0` for the note by design (it has no field
   circle). So D8 cannot see a containment error here. **Report the eagle's
   overhang directly as a number**; do not rely on D8 to catch it.

"Fill the container rather than fit the design" has now been found four times
across this art and is a house habit rather than a note habit — the roundels
are the fourth instance.

## References

`ref/bill-obv.jpg`, `bill-obv-2.jpg`, `bill-rev.jpg`, `bill-rev-2.jpg`.
**Run an NCC independence check between them before treating any two as
corroboration** — that check has already caught one pair in this project that
turned out to be the same photograph at two resolutions, and I published a
quality comparison off it before noticing.

## The legal constraint, which is not negotiable

31 CFR 411 governs colour illustrations of US currency and `coins.js` meets
every clause by construction: **one-sided** (each call returns a single flat
image of a single face — there is no path that prints an obverse and a reverse
back to back), and **under 75 % of real linear size** for any `size` below 356.
Read that comment before touching the note's geometry, and do not change
anything that would break either clause.

## MUST NOT REGRESS

| dimension | how |
|---|---|
| D9 | `_jb9well.mjs` — the note is one of the ids it sweeps |
| D11 | `_x6mat.mjs` — **note that its `IDS` list has never included the note**; the set ratio is a 4-coin figure. Report that rather than assuming the note is in it |
| the four coins | **byte-identical** |

## RULES (§7)

- **Never describe the note from memory. Open the reference and measure.** Two
  of the three defects above were themselves found that way after a description
  from memory was wrong.
- Do not edit a target or an eval library. If one is wrong, §1.1: demonstrate,
  report, do **not** fix.
- Every located feature gets an overlay drawn on the source and you look at it.
- Response test and null test on every instrument; prefix `_jk9`.
- Pin both revisions explicitly in any before/after artefact.
- Report every iteration, including the ones that got worse, and anything you
  rejected because it scored better.
- **Do not report a verdict.**
