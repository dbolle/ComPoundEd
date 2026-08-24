# `_jq8contain-v2.mjs` is superseded by `_jq8contain-v3.mjs`

**Do not run v2 for new work. Do not edit it — not even to add this note.**

## Why v2 is frozen

Its published hash is **`512f61d57444b288`**, cited by seven records:
`penny-scorecard.json`, `nickel-scorecard.json`, `quarter-scorecard.json`,
`nickel-gates.md`, `nickel-r0.md`, `_jp0hashes.json`, `_jd0hashes.json`.

Those numbers were produced by that exact text and must stay reproducible from
it — COIN-JUDGE §1.1.

## Why v3 exists

v2 has a real defect. Its `RESPONSE=1` path anchors on a string absent from
`coins.js`, so the response test **threw** rather than testing anything, and
**D8's ability to move went unverified while D8 verdicts kept shipping**.

v3 injects on the emitted SVG, asserts the injection is real (94 of 98 marks
moved), and adds a zero-translate null test. Response: 0.0000 % → **4.1890 %**.

## The mistake that made this file necessary — twice

**First**, on 2026-08-24 the judge applied the repair to v2 **in place**. That
moved its hash to `28717096e3a2328a` and silently broke all seven citations.
§1.1 says *retract beside, never rewrite*.

**Then, while fixing exactly that**, the judge restored v2 and added a
supersession note **inside the file** — which moved the hash to
`833c6f37f2eaf93e`. The same error, committed during its own repair, one minute
later.

That is why this note is a separate file. **A frozen artefact cannot carry its
own retraction; the retraction must sit beside it.** The general rule, stated
for the next person: if a file's hash is cited anywhere, the only safe edit is
no edit.
