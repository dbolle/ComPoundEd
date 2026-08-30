# Dime reverse references — provenance, and what each may be used for

Added 2026-08-21, supplied by the owner to unblock D2 and D4 on the dime
reverse. Recorded here because `COIN-ART-METHOD.md` requires a reference's
provenance to be written down (precedent: `record reference provenance: the
quarter proof set that unblocks D2`), and because an unattributed image is
not an artefact anyone can re-check.

| file | source URL | subject | disc |
|---|---|---|---|
| `dime-proof2010-pair.png` | `preview.redd.it/of-all-the-small-denomination-us-coins-my-favorite-is-the-v0-4va7bmcxd9c81.png?width=1080` | 2010-S silver proof, **reverse LEFT**, obverse right | ~500 px across |
| `dime-proof1960-pair.png` | `stacksbowers.com/wp-content/themes/stacksbowers/uploads/coin-guide-images/proof-silver-roosevelt-dime.png` | 1960 proof, obverse TOP, **reverse BOTTOM** | ~470 px across |
| `dime-proof1968-pair.jpg` | `coinworld.com/images/default-source/news/1968-no-s-dime_merged.jpg` | 1968 no-S proof, obverse left, **reverse RIGHT** | ~308 px across |

A fourth URL was supplied first — a `encrypted-tbn0.gstatic.com` thumbnail of
the same 1968 photograph at 588×291. It is **not kept**: the coin runs off the
frame on every side (measured: the bright region spans the full right half at
every threshold from 40 to 100), so no disc can be fitted, and the Coin World
file is the same photograph at higher resolution with an attributable source.

## Independence

Three different years, three different sources, three different lightings.
This is what the dime lacked: `dime-rev.jpg` and `dime-rev-2.jpg` are the
**same photograph** (NCC 0.9931), which is why D2's "two independent
references agree ≥ 0.95" could not even be attempted and the dimension sat
`BLOCKED` rather than merely unmeasured.

## What they may be used for — and what they may never be used for

All three are **cameo proofs**: frosted devices on a mirror field.
`COIN-ART-METHOD.md` §20.3 — *a frosted proof is the best SHAPE reference and
the worst TONE reference* — and the nickel's round 0 excluded its own two
proofs from the photometric rim-seat rule for exactly this reason.

- **ALLOWED**: D2 motif silhouette, D4 element counts and positions, D5 band
  and cap geometry, D7 curve quality. The frosted/mirror split is the
  cleanest device/field separation any photograph of a coin can give.
- **FORBIDDEN**: D3 interior tone, D13 device-against-field, D5-rim. A proof's
  field photographs as a black mirror, which inverts the very relationship
  those dimensions measure. `_jd2proof.mjs` computes no tone number at all, so
  the restriction is mechanical rather than a sentence someone has to
  remember.

**Consequence worth stating plainly:** the dime's *tone* evidence is NOT
improved by these three files. D13 and D3 on this coin still rest on the one
circulation photograph we already had, and any D13 repair is measured against
that single reference. That limit belongs in the scorecard, not in a footnote.

## Why this file lives in `judge/` and not beside the images

`.gitignore` line 25 ignores `coloringbook/*` with carve-outs only for
`judge/*.{md,json,jsonl,mjs}`. **The reference photographs themselves have
never been under version control** — a deliberate size decision, and the same
reason COIN-JUDGE.md §4.3 says an image's reproducible artefact is its
generator rather than the image.

That makes this file the only recoverable record of what was measured. If the
`ref/` directory is lost, the URLs above are what rebuilds it; the measurements
in the histories are otherwise unreproducible. A copy sits beside the images
for whoever is working there, and this tracked copy is the authority.

---

## 2026-08-21, later: the TONE reference, found by searching rather than supplied

The four references above are proofs or special strikes and therefore cannot
serve D3, D13 or D5-rim. Searching public-domain sources for a business strike
under diffuse light produced one, and it tests clean:

| file | source | licence | subject |
|---|---|---|---|
| `dime-rev-unc2005.png` | Wikimedia Commons `File:2005-Dime-unc-GS_(reverse).png`, from the **U.S. Mint press room** | **Public domain** — work of the United States Government, PD-USGov / PD US money | 2005 uncirculated (business strike) Roosevelt reverse, 1285×1274, diffuse near-shadowless lighting |

Two cautions recorded with it:

- **The Commons file description says "obverse". It is the reverse.** The
  filename is right and the image is unmistakable; the description text looks
  copy-pasted from the obverse file. Do not trust that caption.
- Two candidates found in the same search were rejected, and both rejections
  are the point of §4.3:
  - `SemiQ-Dime-Reverse-Unc.jpg` (2000×2000) matched every filename criterion
    — "Dime", "Reverse", "Unc", high resolution — and is the **2026
    semiquincentennial** design: an eagle with LIBERTY OVER TYRANNY. It is not
    the coin we draw. Caught only by opening it.
  - `Dime_Reverse_13.png` (2000×2000) is a proof with a blown-out bright
    field: the mode and the p90 agree at 247/249 because almost the whole
    interior saturates. The opposite failure mode to a cameo proof, equally
    unusable for tone.

### Why this one is usable, measured (`_jl4fieldtest.mjs`, `_jl4mode.mjs`)

Bare-field mean ÷ p90 of the disc interior — the ratio that decides whether
D13's normaliser is a field level at all:

| reference | ratio | as ink |
|---|---|---|
| `dime-rev-2.jpg` (current) | **0.487** | 5 of 6 patches |
| `dime-rev-unc2005.png` | **0.940** | 2 of 6 |
| `nickel-rev-2.png` (the one known-clean reference) | 0.909–1.000 | 2 of 6 |

So the dime finally has a reverse reference whose field is its field.

**A fault in my own instrument, caught by its own overlay:** four of the six
frozen patch centres land on leaves on this design
(`_jl4field-dime-rev-unc2005.png` shows it). The 0.940 above uses the two
centres the overlay confirms are bare. This is the same wrong-feature failure
round 2 hit with the same class of instrument, which is the argument for not
using hand-placed patches at all — see below.

---

## 2026-08-21, later still: OBVERSE tone references, three of four found

The owner's direction is that the obverse portraits are the remaining work. The
obverse tone numbers (D13, all four coins FAIL, all too dark and carrying ~2×
the reference's ink at icon) rest on references with the same defect the dime
reverse had — a p90 that is a specular highlight rather than a field. Searching
public-domain sources produced three replacements:

| file | source | licence | subject |
|---|---|---|---|
| `dime-obv-unc2005.png` | Commons `File:2005-Dime-Obv-Unc-P.png`, U.S. Mint | **PD-USGov** | 2005 uncirculated Roosevelt obverse, 738×734 |
| `penny-obv-unc2005.png` | Commons `File:2005_Penny_Obv_Unc_D.png`, U.S. Mint | **PD-USGov** | 2005-D uncirculated Lincoln Memorial obverse, 945×955 |
| `nickel-obv-unc2004.jpg` | Commons `File:Jefferson-Nickel-Unc-Obv.jpg`, **U.S. Mint Historical Image Library** | **PD-USGov** | 2004 uncirculated Jefferson obverse (classic Schlag), **1523×1500** — the highest-resolution reference in the whole set |

### The screening test, and what it does and does not show

No per-design literals: fit the disc by background differencing, then measure
the fraction of the disc interior lying within 3 grey levels of p90. A real
field is a broad plateau; a specular highlight is a thin tail.

| coin | current reference | new reference |
|---|---|---|
| dime obverse | 0.027 | **0.076** |
| cent obverse | 0.026 | **0.053** |
| nickel obverse | 0.070 | **0.179** |
| quarter obverse | 0.017 | *(none found)* |

**This is a RELATIVE screen, not a gate.** The ±3-level window is narrow for a
noisy JPEG, so the absolute numbers mean little and would all rise with a wider
window; what is meaningful is that each new reference is 2–3× better than the
one it would replace, measured identically. Only the nickel's is unambiguously
a plateau. I invented the 0.12 cut while writing this and it has no derivation
behind it, so it is quoted as a reading rather than a threshold.

### Still missing: a quarter obverse

`State hood quarter Obv Unc.JPG` was the only uncirculated Washington obverse
found and it is **rejected twice over**: 230×220, and it is the post-1999
statehood arrangement, which moved UNITED STATES OF AMERICA and QUARTER DOLLAR
onto the obverse. We draw the pre-1999 layout — LIBERTY over the head, IN GOD
WE TRUST at the left. The portrait is the same; the lettering is not, so it
cannot serve D5 and its resolution rules it out for D1 or D3 anyway.

**A diffuse-lit, business-strike, pre-1999 Washington quarter obverse is the
outstanding acquisition.**

### The quarter obverse: found, but weaker than the other three — and a licence flag

The statehood quarter found first was rejected and never saved: it is the
post-1999 arrangement, which moved UNITED STATES OF AMERICA and QUARTER DOLLAR
onto the obverse, while we draw LIBERTY arced above and IN GOD WE TRUST flat at
the left. Same portrait, different lettering.

Five correct pre-1999 candidates were then screened as above (disc fitted by
background differencing; plateau = fraction of the interior within 3 grey
levels of p90; toning = mean |R−B| over the interior, which a greyscale
pipeline turns into a non-uniform grey shift):

| candidate | disc R | plateau | toning | read |
|---|---|---|---|---|
| current `quarter-obv-2.jpg` | ~374 | 0.017 | — | the incumbent |
| 1932 (NGC) | **903** | 0.040 | **25.9** | best shape by far, worst toning |
| 1994-P | 356 | 0.017 | 17.9 | no better than the incumbent |
| 1963 (CC BY) | 424 | **0.029** | **3.8** | best tone of the five, modestly |
| 1944-S | 370 | 0.016 | 7.7 | no better |
| 1998 | 112 | 0.071 | 0.0 | greyscale and far too small |

**Kept two, for different jobs:**

- `quarter-obv-1932ngc.jpg` — **shape only** (D1, D7). At R 903 against the
  incumbent's ~374 it is much the best silhouette reference the quarter has.
  Its toning of 25.9 makes it useless for D3/D13.
- `quarter-obv-1963ccby.jpg` — **tone**, and only a modest gain: plateau
  0.017 → 0.029, against the nickel's new 0.179. The quarter obverse remains
  the weakest tone reference of the four, and a diffuse-lit, untoned, pre-1999
  business strike is still worth having if one turns up.

**Licence flag, and it matters to this project specifically.**
Commons tags `1932 Washington quarter obverse.jpg` **public domain** on the
grounds that it "depicts a unit of currency issued by the United States" and is
"solely a work of the United States Government". Its stated source and author
are **NGC (Numismatic Guaranty Corporation)**, a private grading service. That
rationale applies a *currency-depiction* argument to a *photograph*, and
`src/art/coins.js` says the opposite in its own words: *a photograph of a coin
is a SEPARATE copyright from the design, and the Mint's own photographs are
reserved by its contractor* — which is why every curve in that file is
hand-placed rather than traced.

**So it is recorded here as a third-party photograph, NOT as public domain**,
and treated like the Coin World / Stacks Bowers / PCGS references: private
measurement only, never redistributed, never traced. Accepting the Commons tag
at face value would have laundered a questionable claim into the one document
that exists to protect this project.

`quarter-obv-1963ccby.jpg` is **CC BY 2.0**, by **James St. John** via Flickr
(`flickr.com/photos/jsjgeology/53021775198/`). Not public domain either, but
permissively licensed with attribution, recorded here so the attribution exists
if it is ever needed.

---

## CORRECTION, same day: the nickel "new reference" is not a new reference

I recorded `nickel-obv-unc2004.jpg` above as one of three replacements and
called it *"the highest-resolution reference in the whole set"*. The second
half is true. **The framing as a new, independent reference is false**, and the
round-6 specialist caught it.

Normalised cross-correlation at 256 px, re-derived by the judge:

| pair | NCC |
|---|---|
| `nickel-obv-unc2004.jpg` vs `nickel-obv.jpg` | **0.9674** |
| `nickel-obv-unc2004.jpg` vs `nickel-obv-5.JPG` | 0.2981 |
| `nickel-obv.jpg` vs `nickel-obv-5.JPG` | 0.2817 |
| control: unc2004 vs itself | 1.0000 *(at the bound — a check, not a value)* |

0.9674 against 0.28–0.30 for genuinely different photographs. It is a
**higher-resolution encode of the reference already in use**. `nickel-obv-5.JPG`
remains the *only* independent struck reference that face has, which is exactly
the condition that had D2 blocked on the dime.

**The other two do survive the same test**, so the correction is the nickel's
alone: dime obverse 0.3628 / 0.2955 against its incumbents, cent obverse
−0.4619 and 0.6823, dime reverse 0.2474.

### And it invalidates the screening number I quoted for that coin

The plateau screen above reads *nickel obverse 0.070 → 0.179*, presented as one
reference being cleaner than another. Both figures are **the same photograph at
two resolutions**, so that 2.6× is measuring encode resolution, not field
quality. The screen conflates the two and I did not notice, because I only ever
ran it on pairs I had already assumed were different.

The dime and cent rows stand — those pairs are genuinely different photographs —
but the metric should be read as *"how well does p90 sit on a plateau in this
file"* and never as *"this reference is better than that one"* without an
independence check first. NCC before plateau, from now on.

## ⛔ RETRACTED — "Cent obverse, added 2026-08-22 — TWO PROOFS"

**The US Mint file was already in the pool.** `penny-obv-usmint.png` is
**byte-identical** to `penny-obv-4.png` (sha256 `c7e5d02b…`), which has been
here all along. The judge downloaded it, measured it, wrote provenance calling
it "the only reference in this pool that is not third-party copyright", and
committed it as an acquisition. It was a re-add. Both `penny-obv-usmint.png`
and `-flat.png` are deleted; `penny-obv-4.png` stands.

**And the independence instrument compared the file against itself and passed
it.** `_jp3usmint.mjs` printed `raw 0.3726  design 0.8069  INDEPENDENT` for
identical bytes against a duplicate threshold of 0.90. The cause is that the
two files got different disc fits — 4.0 % of R apart — so identical pixels were
compared **misregistered**. ⚠️ **The duplicate detector's negative results are
therefore untrustworthy across the whole pool**, wherever disc fits disagree.
Its positives (e.g. `quarter-obv.jpg` ≡ `quarter-obv-2.jpg` at 0.9542) are
still evidence; its negatives are not.

**Fix in place:** `judge/_jrefintake.mjs` must be run before anything enters
`ref/`. It hashes first (free and decisive), then does a registration-free
near-duplicate check that a disc-fit error cannot defeat, then reports
resolution and writes the date/mintmark crop to be looked at, then checks for a
histogram cliff. Response-tested against this exact failure: fed the US Mint
file, it reports `ALREADY IN THE POOL, BYTE-IDENTICAL: penny-obv-4.png` and
exits non-zero.

`penny-obv-proof2021.jpg` (profilecoins.com, third-party copyright, private
measurement only) is genuinely new and genuinely independent. It is a 2021-S,
i.e. a **proof**: shape only, never D3 or D13.

### ⚠️ AND THE INCUMBENT IS A PROOF TOO

**`penny-obv-2.jpg` is a 2002-S** — verified by cropping its own date and
looking. "S" means proof by the same rule used to downgrade the two files
above, and its field is crushed to near-black.

That file is the **sole** support for the cent's mid-jaw whisker boundary, which
this document and BACKLOG.md have both been calling the flagship "n=1" tone
problem. It is not n=1. **For tone in that region it is n=0**, because §20.3
puts a proof at the bottom for exactly this reading. The outstanding
acquisition — a struck business-strike cent obverse at usable resolution —
is more important than previously stated, not less.

## 2026-08-22 — THE PAIR AUDIT: six coin faces were sitting unused in files we already held

Prompted by the owner: *"Make sure that all of the pictures that have both
obverse and reverse are being used for both sides of the coin."* They were not.

Every pair image in `ref/` was checked against every instrument that reads it.
**Four dime pairs are windowed to their REVERSE half by all five instruments
that use them**, and `quarter-1995d.jpg` had only a reverse crop derived. The
complementary halves had never been extracted. (Two pairs were already handled
correctly: `nickel-proof-both.jpg` is split at the midline into both faces by
`_jn1disc.mjs`, and the 1963/1964 quarter proofs have both `-obv-pad` and
`-rev-pad` crops.)

Extracted, as the exact complement of each published reverse window:

| new file | from | px | what it is |
|---|---|---|---|
| `dime-obv-pcgs2015.png` | `dime-pcgs2015-pair.jpg` | 950×959 | **2015-P — a BUSINESS STRIKE**, and the largest dime obverse we hold |
| `dime-obv-proof2010.png` | `dime-proof2010-pair.png` | 540×534 | 2010-S cameo proof |
| `dime-obv-proof1960.png` | `dime-proof1960-pair.png` | 500×500 | 1960 cameo proof |
| `dime-obv-proof1968.png` | `dime-proof1968-pair.jpg` | 320×400 | 1968 proof |
| `q1995d-obv.png` | `quarter-1995d.jpg` | 512×508 | **1995-D — a BUSINESS STRIKE quarter obverse** |
| `penny-rev-1991d.png` | `penny-1991d-pair.jpg` | 350×348 | 1991-D cent reverse |

**`q1995d-obv.png` measured (design floor 0.2402):** independent and same-design
against **7 of 8** quarter obverse files — 0.4849 / 0.5214 / 0.5719 / 0.5728 /
0.6068 / 0.7068 / 0.7156 — with **no bound riding** after widening. The one
exclusion is `quarter-obv-4.jpg`, which is the state quarter, so that is correct
behaviour. Raw NCC well below 0.90 throughout: not a duplicate of anything.

⚠️ **UNRESOLVED TENSION, and it must be settled before any TONE use.** The
quarter-reverse round ruled `q1995d-rev.png` — **the other half of this same
source image** — a *posterised rendering, not a photograph*, at design NCC
0.1874, only 0.0057 above a different denomination. The obverse half registers
at 0.48–0.72. Those two results cannot both be casually true of one image.
Either the reverse crop is bad, or the source is an illustration whose obverse
happens to register. **Usable for SHAPE now; NOT for D3/D13 until resolved.**

### `penny-1991d-pair.jpg` — the business strike the cent needed

Owner-supplied, cointrackers.com (**third-party copyright, private measurement
only**). 700×348, obverse + reverse, red uncirculated, diffuse, straight-on.
**1991-D: "D" is Denver, so this is a BUSINESS STRIKE**, unlike the two proofs
added earlier today. The watermark sits outside the disc on the obverse crop.
⚠️ Resolution is modest — each face is ~348 px against the 2000 px US Mint
proof — so it may still be too coarse for the mid-jaw whisker texture, which is
the open question. Measure px-per-local-unit before relying on it there.

---

## 2026-08-30 — THE DIME OBVERSE POOL, DECIDED (ledger C2a)

Nine dime-obverse files sit in `ref/`. T1 used two, and both were cameo proofs.
All nine were characterised — `_jt6dobv.mjs`, which reports and writes nothing
inside the checkout — and the pool went **n=2 → n=5**. No acquisition was
needed: **three business strikes were already here.**

**The strike is read off the mintmark crop, never the filename.** That is not a
formality on this face: `dime-obv.jpg` is 1996-**W** and `dime-obv-2.jpg` is
2015-**W**, and the same letter is the West Point mint-set *business strike* on
one and a *proof* on the other. Any rule keyed on the letter gets one wrong.

| file | px / rim R | date + mint | strike | polarity | in pool | what it may be used for |
|---|---|---|---|---|---|---|
| `dime-obv-2.jpg` | 960×960 / 469.3 | 2015-W | cameo proof | **+167** | **yes** | shape. NOT D3/D13/D5-rim (§20.3) |
| `dime-obv-3.jpg` | 750×770 / 366.1 | 1996-S | proof, field lit | **+22** | **yes** | shape. NOT tone — S is San Francisco |
| `dime-obv-pcgs2015.png` | 950×959 / 468.1 | 2015-P | **business strike** | **−162** | **yes** | shape (the best rim of the nine) and tone, with the caveat that its light is hard and directional, not diffuse |
| `dime-obv-unc2005.png` | 738×734 / 342.8 | 2005-P | **business strike** | **−18** | **yes** | shape **and tone** — diffuse, the flattest polarity here. U.S. Mint, PD-USGov |
| `dime-obv.jpg` | 400×396 / 199.0 | 1996-W | **business strike** | **−88** | **yes** | ⚠️ **SHAPE ONLY.** toning **26.7**, past the 25.9 that disqualified `quarter-obv-1932ngc.jpg` for tone |
| `dime-obv-4.jpg` | 897×904 / 448.2 | 2002-S | cameo proof | +194 | **no** | ⛔ **UNUSABLE for geometry** — see below |
| `dime-obv-proof2010.png` | 540×534 / 271.1 | 2010-S | cameo proof | +153 | **no** | ⛔ **UNUSABLE for geometry** — see below |
| `dime-obv-proof1960.png` | 500×500 / 247.4 | 1960 (no mm) | cameo proof | +137 | no | fits fine; excluded only as more of a finish the row already had too much of |
| `dime-obv-proof1968.png` | 320×400 / 153.1 | 1968 (no mm) | proof | +51 | no | as above, and the lowest resolution on this face |

`polarity` = median grey inside r < 0.50 R minus the modal grey of the ring
0.72 R–0.86 R. Positive is the cameo-proof relationship (frosted device bright
out of a dark field); negative is a struck coin shadowing itself against a
bright field. It separates the nine perfectly against their mintmarks, and it is
the sign §20.3 is about. **Two other statistics were tried first and both
failed** — the failures are written into `_jt6dobv.mjs`'s header, not dropped.

### The two exclusions are GEOMETRY, and they are not about the strike

This document has been wrong about that before, and `_rimfit.mjs`'s header says
so plainly: *"it only fails on proofs" — no.* Four cameo proofs here fit fine.
The two that do not fail for reasons that have nothing to do with finish:

- **`dime-obv-4.jpg`** — `discOf()`, the registration T1 itself uses, returns an
  R that is **−19.23 %** wrong with the centre **73.2 px out, 16.3 % of R**.
  `_rvdisc` cannot fit it either (p95 **27.3 %** of R; `_jt4pool.mjs` prints
  `FIT UNUSABLE`). Half the coin is blown into the white ground. Ledger A26:
  a registered NCC between misregistered images is meaningless.
- **`dime-obv-proof2010.png`** — the crop **clips the coin**. The fitted disc
  runs **8.8 % of R past the frame**, 491 of 1440 rays are discarded as frame
  (A28), only **237° of arc** survives, and rim p95 is **9.316 %** of R. Its
  harmonics settle what kind of failure it is: h2 **2.924 %** against h1/h3/h4
  at **1.002 / 1.058 / 1.690** — all one order, so the outline is *broken*, not
  an ellipse. Contrast `dime-obv-unc2005.png`, a real ellipse: h2 0.317 %
  against 0.002 / 0.069 / 0.069.

  It is the complement crop of `dime-proof2010-pair.png` and the clipping is
  inherited from that source, so a better crop cannot be made from what we hold.

### Ellipticity, for the record (the D41 question, asked on this face)

Unlike the dime **reverse**, where both references are genuine ellipses at
0.733 % and 0.513 %, most of the obverse pool is round. Only three files have a
harmonic 2 an order of magnitude above harmonics 1/3/4:
`dime-obv.jpg` **0.467 %** (ry/rx 0.99074, major axis 2.0°),
`dime-obv-4.jpg` 0.755 %, and `dime-obv-unc2005.png` **0.317 %** (ry/rx
0.99371). The two incumbents and `pcgs2015` are round to **0.013–0.026 %**, and
`proof1960`/`obv-3` have h2 *below* their own h3, i.e. rough outlines rather
than ellipses. So the pool as adopted introduces one 0.317 % ellipse where it
previously had nothing above 0.026 %. Noted, not corrected: fitting an ellipse
in `fitRim`/`samplerFor` is the owner decision D41 already raised.

**A coincidence worth writing down and not interpreting:** `dime-obv-unc2005.png`
and `dime-rev-unc2005.png` both measure **ry/rx = 0.99371**. Their major axes
differ (−2.7° vs 26.0°), so this is probably chance rather than a shared imaging
anisotropy. Recorded because it would be easy to build a story on it later.

### Independence

All 36 within-group pairs clear the duplicate rule (**MADbox < 6 and dHam ≤ 6**).
The closest is `dime-obv-2.jpg | dime-obv-proof2010.png` at MADbox **39.8** —
6.6× clear — with dHam 7. dHam alone would nearly call it; the rule needs two
statistics of different kinds, and this is that rule earning its keep.

**A26's resolution caveat was checked, not assumed away.** Re-running both
statistics with each content box first resized to the smaller one's linear size
(ratios here run 1.00× to 3.07×, spanning the 3.05× of A26's confirmed duplicate
pair) reproduces **every number to one decimal place** — because MADbox already
resizes each box to 64×64, which absorbs a linear scale on its own. So A26's
5.01 → 4.01 was a residual on a pair already inside the threshold, not a
mechanism that can pull a pair 6.6× outside it back in.
