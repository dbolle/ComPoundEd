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
