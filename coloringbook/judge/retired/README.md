# `judge/retired/` — superseded or dead, not wrong

A file in this directory is **not a mistake and not a deletion**. It is an
instrument that no longer earns a place in the live library, kept at its
original bytes so that every number it ever produced can still be reproduced.

`docs/COIN-JUDGE.md` §1.1 is the rule this directory exists to serve:

> The faulty instrument is retired at its old hash rather than edited or
> deleted, so any number ever published can still be reproduced. … Retired
> instruments move to `judge/retired/` — **moved and never edited**, because
> the content hash is the reproducibility anchor — and nothing outside that
> directory may import from it.

## What "retired" means here, precisely

Being in this directory says exactly one thing: **this instrument is not part
of the live library.** It says nothing about whether its method was sound or
its numbers were right. Most files here are in one of five states:

| state | what it means |
|---|---|
| **WORKTREE** | hard-codes a path into another agent's git worktree. Unreproducible the moment that worktree is cleaned — through no fault of the method. |
| **SCRATCH** | its "before" side was a working copy (`_XX-before-coins.js`, `_XXfitcheck.json`) that was never committed. Permanently unrunnable; §4.3's *"an image's reproducible artefact is its GENERATOR"* was applied to pictures and not to before/after comparators. |
| **DRIFT** | throws today for a reason other than a missing argument — API drift, a dead path, a response-test anchor the art moved out from under. Several of these were excellent instruments in the round that wrote them. |
| **SILENT** | produces no output at all and is named nowhere. |
| **ORPHAN** | still runs, but is never imported and never named in any tracked prose or evidence file. Overwhelmingly these are the one-per-round `-ident` / `-look` / `-zoom` / `-over` / `-grid` viewers: they did their job, on a drawing that has since changed underneath them. |

None of these is "this instrument was wrong". Where an instrument *was* wrong,
that is recorded beside the verdict it produced (§1.1, retract-beside), not
here.

## Bringing one back

```
git mv coloringbook/judge/retired/_thing.mjs coloringbook/judge/_thing.mjs
```

That is the whole procedure, and it is meant to be that cheap. Nothing was
edited on the way in, so the file you get back is byte-for-byte the file that
produced the published number — verified: all 174 files moved in the
2026-08-22 cull re-hash identically at their new path.

Two things to expect when you do:

- **Sibling imports.** 68 of the files here `import './_other.mjs'` where the
  other file stayed live. That import no longer resolves from inside
  `retired/`. This is deliberate — §1.1 requires that *"a retired instrument
  must be impossible to import"* — and it is why several files here throw
  immediately. Move the file back out and the import resolves again. **Do not
  fix it by editing the path**; that breaks the content hash, which is the only
  thing making the old number reproducible.
- **The reason it was retired is probably still true.** A DRIFT file will still
  throw; a SCRATCH file will still be missing its snapshot. Resurrect the
  *method*, and write the new instrument against §0.3's rule that an instrument
  reports and does not write.

## Files here that WRITE when you run them

`docs/COIN-JUDGE.md` §0.3: *"An instrument reports; it does not write. Running
the whole library in any order must leave the repository byte-identical."*
Thirteen files here violate that. They were moved rather than deleted like the
`_r*card.mjs` family, because unlike those they are cited evidence — but they
are hazards and should be treated as such.

**Still dangerous — they write to a path anchored at the repo root, so the move
did not defuse them:**

| file | writes |
|---|---|
| `_jq7fit.mjs` | `coloringbook/judge/_jq7fit.json` — a **tracked, frozen** target |
| `_jw14fit.mjs` | `coloringbook/judge/_jw14fitcheck.json` |
| `_jh8tier.mjs` | **`src/art/_jh8ctl.js`** — a judge instrument writing into the art directory |

**Defused by the move, because their write path was relative to the
instrument** (it now lands inside `retired/` instead of on the tracked file):
`_je14d11.mjs` (was `_jb11d11.json`, frozen), `_jn6disc.mjs` (was
`_jn6discs.json`, frozen), `_jn6freezetone.mjs` (was
`coloringbook/_tonepatches-nickel.json`), `_jy0freeze-midjaw.mjs` (was
`_jy0tonepatch-midjaw.json`), `_jn15ours.mjs`, `_jd2freeze.mjs` (was
`_jd2target-dime-reverse.json`, frozen — and its own `./_jd2trace2.mjs` import
no longer resolves, so it throws before reaching the write),
`_edgespill.mjs` (was shelling out to write **`src/art/_arcctl.js`**).
`_jc5d13sweep.mjs`, `_jq7d13.mjs`, `_jw14tone.mjs`, `_jh8side.mjs`,
`_jn6look2.mjs`, `_jy8sweep.mjs` and `_jq12look-r2.mjs` write only to temp
paths or to their own scratch copies.

If you resurrect one of the first three, **guard the write first.**

## Citations still resolve — by name, not by path

40 of the files here are named as evidence somewhere else in the repository,
including 25 named inside `src/art/coins.js` as the provenance of a drawn
feature. Those citations are overwhelmingly bare names (`_jl1grid-nkrev-monti.png`,
`_sd7fan.mjs`) and still resolve — `git ls-files | grep _name` finds the file.

**Nineteen citations name an explicit path** (`coloringbook/judge/_name.mjs`)
and now point one directory shallower than the file. They are listed in the
EXECUTED section of `coloringbook/judge/REVIEW-instruments.md`. None of them is
a live code path — they are all prose, comments, or scorecard provenance
strings — and none was edited, because `src/art/coins.js`, `BACKLOG.md` and
`CHANGELOG.md` were out of scope for the cull. Add `retired/` when you follow
one.

## The 2026-08-24 stale-instrument round — four more, all DRIFT

Each was superseded by a named live successor, so the method survives; each is
here because it published a number against art that no longer exists.

| file | why | successor |
|---|---|---|
| `_jb14d1.mjs` | **Both sides of its IoU were literals.** `OURS` was `{cx 34, cy 28, rx 17, ry 21}`, last true at v1.83.0; `NOTE` was the r0 ladder read. Its `D1 IoU 0.1496 FAIL` could not move for any reason — not for a change in the art, not for a change in the reference. | `_bxCrecord.mjs`, which parses the emitted SVG |
| `_jb3seal.mjs` | `OURS` was circles r16 at cx 30/70; the note draws ellipses at (23.13, 27.88) and (76.88, 27.75). Five of the six D2 FAIL rows it published are PASSes. Also imports the gitignored `../_blnorm.mjs`. | `_bxCrecord.mjs` for the verdicts; its own output `_jb4target.json` stays live as the frozen target |
| `_jb15look.mjs` | Sheets 26 / 54 / 190. `src/screens/money.js` draws 38, 48, 54 and 84 — two of its three sizes are sizes no child ever sees, and the 84 px naming draw was not on it. | `_jb16look.mjs`, which sheets exactly 38/48/54/84 |
| `_jc5corner.mjs` | Queries `BEARD` knot 7 at (−17.28, 8.63). The drawn knot 7 is (−18.85, 4.00); the old value survives only inside a comment. Removed by `88324fc` (v1.63.0). Also imports the gitignored `../_nkbuild.mjs`. | `_jh8ours.mjs` |

All four re-hash identically at their new path (`e3ed115e5a64da59`,
`bd2ac2aa4e128082`, `7ab2409bc2ea5a02`, `88feed07d80b645e`). Nothing was edited
on the way in, so the numbers they published are still reproducible — which
matters here, because those numbers are wrong and the correction has to be
checkable against the thing that produced them.

## The three that were already here

`_jq5letter.mjs`, `_jq8contain.mjs` and `_jqvalley.mjs` predate the 2026-08-22
cull and were retired one at a time, each with its reasoning in the round that
replaced it. `_jp5band-v2.mjs`'s header is the model to copy: it explains why
v1 is **not** retired — v1's null test fired correctly and its rim half still
stands, so only its legend half is superseded. Precise retirement, not blanket
retirement.
