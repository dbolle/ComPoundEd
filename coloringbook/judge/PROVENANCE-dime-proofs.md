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

## Cent obverse, added 2026-08-22 — TWO PROOFS, and neither closes the open gap

Both supplied by the owner. Both measured with `judge/_jp3usmint.mjs`, which
runs `_jp2indep.mjs`'s own imported comparison on an extended file list rather
than editing its hashed `POBV`.

- **`penny-obv-usmint.png` / `penny-obv-usmint-flat.png`** — US Mint pressroom,
  2014-02-10, via commons.wikimedia.org/wiki/File:US_One_Cent_Obv.png.
  **PD-USGov-Treasury: public domain**, and the **only reference in this pool
  that is not third-party copyright**. 2000×2000, straight-on, diffuse,
  background cut out (corner alpha 0). **Preprocessing declared:** the cut-out
  is flattened onto neutral `#808080`; compositing onto black would invent a
  hard black rim the coin does not have and bias both the disc fit and every
  tone reading. Disc fit R 951.89.
- **`penny-obv-proof2021.jpg`** — profilecoins.com, a commercial dealer.
  **THIRD-PARTY COPYRIGHT: private measurement only, never redistributed,
  never traced into shipped art.** 1200×1200, deep cameo.

**Independence (design floor 0.3048, from `penny-obv-2.jpg` vs a quarter):**

| | vs penny-obv | vs -2 | vs -3 | vs -4 | vs each other |
|---|---|---|---|---|---|
| US Mint 2013-S | 0.5863 | 0.7072 | 0.7863 | 0.8069 | — |
| 2021-S | 0.4940 | 0.6576 | 0.5629 | 0.7223 | **0.7215** |

All above the floor; raw NCC −0.14…0.37 so none is a duplicate; **no bound
riding after widening the translation search to ±0.09R**. Both are independent
of everything held, and of each other.

**SHAPE ONLY — D1, D2, D7. Never D3 or D13.** Both carry an "S" mintmark, and
since 1974 the San Francisco mint has struck **no business-strike cents**, so
both are proofs. §20.3: a frosted proof is the best possible shape reference
and the worst possible tone reference.

⚠️ **So the cent's open problem is NOT closed by these.** What still rests on a
single photograph is the **whisker boundary**, a texture/tone reading — only
`penny-obv-2.jpg` supports it, and on the other struck references the
discriminator has no contrast. **The outstanding acquisition is unchanged: a
third STRUCK BUSINESS-STRIKE cent obverse.**

✅ **What they do open:** the cent obverse now has **two independent deep-cameo
proofs** — the same configuration that let the dime reverse get a traced D2
target in v1.66.0. The cent obverse has never had a D2 target and could now
get one by the same route.
