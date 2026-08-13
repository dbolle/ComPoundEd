# Reference photographs — provenance, licence, and the rule

`coloringbook/ref/` is **gitignored and stays that way.** This file is the
tracked record of what is in it and where it came from, because several
references are **commercial copyrighted photographs** and the distinction
between *measuring* them and *using* them is the whole basis on which they are
here at all.

## The rule, restated because it is easy to erode

> Reference photographs are for **measuring only**. Never embed, trace,
> base64, screenshot into, or import one into shipped output. Every path in
> `src/art/coins.js` is original art whose coordinates came from measurements
> taken off a photograph — never from the photograph's pixels.

Frozen targets (masks, patch sets, band annotations) are *measurement
artefacts* derived from a reference. They live in `coloringbook/` and are not
shipped either. What ships is drawn.

## Quarter proof set, acquired 2026-08-13 to unblock D2

Round 2 ruled D2/D4/D5-band `BLOCKED`: no reference we held let the device
separate from the field, because **a circulation strike has no reflectance
difference between the two**. The acceptance test (`judge/_jqvalley.mjs`,
gate ≥ 0.50, dime positive control 0.8386 against a known 0.8276):

| file | source | licence | valley depth | |
|---|---|---|---|---|
| `qp1964-rev-pad.png` | coinweek.com, 1964 proof plate | © CoinWeek — **reference only** | **0.8414** | best in set |
| `quarter-proof-ebay.jpg` | i.ebayimg.com, 1998-S proof obverse | © seller — **reference only** | 0.7865 | last year of this design type |
| `qp1964-obv-pad.png` | coinweek.com, 1964 proof plate | © CoinWeek — **reference only** | 0.6898 | |
| `qp1963-rev-pad.png` | coinweek.com, 1963 proof plate | © CoinWeek — **reference only** | 0.6440 | heraldic eagle, cameo |
| `qp1963-obv-pad.png` | coinweek.com, 1963 proof plate | © CoinWeek — **reference only** | 0.5803 | |
| `q1995d-rev.png` (crop of `quarter-1995d.jpg`) | washingtonquarters.org, 1995-D | © site — **reference only** | 0.1439 | circulation strike, **rejected** |

The 1995-D failing at 0.14 while the proofs pass at 0.58–0.84 is the round-2
diagnosis confirmed: it is the *strike*, not the photograph. A cameo proof is
a frosted device (~190) against a mirror field that photographs near-black
(~2–12), and that near-black mode is the field, not an artefact.

`qp*-pad.png` are derived: the source plates show both faces side by side, so
each was split at the midline and padded with its own corner background —
padding matters because the disc-fit sanity gate must be able to *see*
background to know it isolated the coin.

Public-domain references (Wikimedia, US Mint) carry no such restriction and
are listed by their own filenames in `ref/`; the constraint above is about
copyright on the *photograph*, not on the coin design, which is a US
Government work.

## CORRECTION, round 4 audit

The valley figures above for the four `qp*-pad.png` files were measured
against a **padding rectangle**, not against the coin: the orchestrator padded
those crops to satisfy a disc-fit sanity gate, and the fitter then returned
`R = 318.3` — identical for three different files — because it fitted the pad.
The depths happened to survive (0.80 x 318.3 lands inside the true coin) but
they are not what the file claimed to measure.

Worse, only **half** the round-2 acceptance test was ever implemented. The
second half — level-sweep area drift <= 15% over +/-30 levels — is the half
that predicts contour stability, and **every proof fails it**: 16.8 / 21.6 /
25.2 / 37.5% against the dime's 6.6%. That is why **D2 did not freeze** on
these references.

**What stands:** the strike diagnosis. Circulation strikes score 0.14-0.46 and
cameo proofs 0.56-0.81 on one instrument, so round 2 named the right
acquisition. What does not stand is "the acquisition unblocked D2".

`_jqvalley.mjs` is retired to `judge/retired/` at its hash.

Also corrected here: `quarter-obv.jpg` and `quarter-obv-2.jpg` are **the same
photograph** (raw NCC 0.9542) — the fifth same-photograph instance and the
first on an obverse, which had never been correlated. No published number
moves; D1 and D3 name `obv-2` only. And `quarter-obv-4.jpg` is the 1999+
state-quarter obverse, a different design, while `coins.js:1796` cites it for
the curls — that citation needs re-checking.

## Why this file is tracked when the images are not

58 MB of photographs do not belong in a repository, and some may not be
redistributable at all. But a measurement is worthless without knowing what it
was measured against — and `COIN-JUDGE.md` §1.1 promises that any published
number can be reproduced. Reproducing one needs the *identity* of the
reference, its provenance, and its acceptance score. That is what this file
carries.
