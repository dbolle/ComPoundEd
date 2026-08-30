# Obverse round 0 — what `bust()`'s `hairFill` sign does at the sizes the app draws

Ledger **C2**, closed. Dispatch v1.112.0, shipped v1.114.0.
**No art changed.** `_jp9partition.mjs` against the pinned checkout: **0/60
cells, 0 faces.** Everything below is a measurement.

    const hairFill = o.hairLit ? p.cloth : p.hair;      // src/art/coins.js

`hairLit` is set on Jefferson (nickel), Roosevelt (dime) and Washington
(quarter) and not on Lincoln (cent). C2 used to read *"wrong sign at mid"*;
v1.93.0 deleted `mid`, so that branch could not run. The question it left
unasked — **what does the sign do at 38, 48, 54 and 84 px, and has anyone
looked** — is what this round answers. Nobody had.

---

## 0. The size the app really draws

`coinSVG(id, size)` takes the QUARTER's diameter and draws every other coin at
its true relative diameter. So a `coinRow(ids, 38)` gives:

| nominal | quarter | nickel | cent | dime |
|---|---|---|---|---|
| 38 | 38 | 33 | 30 | **28** |
| 48 | 48 | 42 | 38 | 35 |
| 54 | 54 | 47 | 42 | 40 |
| 84 | 84 | 73 | 66 | 62 |

The dime obverse is drawn at **28 device pixels** in the answer-button row.
Every number below is at the device size, not the nominal one.

---

## 1. Mass — `_jz1hairtone.mjs`

The **controlled mask** is every pixel that differs between the two branches:
not the geometric hair silhouette but the part of it that survives the grooves,
the lit ridges, the eye, the ear and the beard drawn on top. A tone decision
cannot do anything anywhere else.

| coin | device px | disc px² | controlled mask | % disc | geometric hair |
|---|---|---|---|---|---|
| cent | 30 | 707 | **61** | 8.6 % | 47 |
| cent | 66 | 3421 | 249 | 7.3 % | 233 |
| nickel | 33 | 855 | **222** | 26.0 % | 204 |
| nickel | 73 | 4185 | 994 | 23.7 % | 970 |
| dime | 28 | 616 | **96** | 15.6 % | 81 |
| dime | 62 | 3019 | 414 | 13.7 % | 391 |
| quarter | 38 | 1134 | **206** | 18.2 % | 182 |
| quarter | 84 | 5542 | 895 | 16.2 % | 870 |

**It is not a dozen pixels.** The smallest cell in the whole grid is the cent's
61, and the mass occupies 7.3 %–26.0 % of the disc at every size.

## 2. Contrast — the same instrument

Mean Rec.709 luma (gamma-encoded, 0–255, the convention `coins.js` already uses
when it says "`cloth` renders at 1.148 of `motif`"), on the mask and on the
one-pixel boundary beside it, split by an independently rendered HEAD
silhouette. `sd(face)` is the luma standard deviation over the whole face
region — the texture the step has to be seen against.

| coin | device px | LIT mass | DARK mass | face | field | sd(face) | \|dL\| LIT | \|dL\| DARK |
|---|---|---|---|---|---|---|---|---|
| cent | 30 | 103.1 | 86.3 | 90.2 | 142.1 | 6.3 | 12.9 | **3.9** |
| cent | 38 | 103.0 | 84.7 | 89.8 | 143.1 | 7.5 | 13.2 | 5.2 |
| cent | 42 | 103.0 | 84.3 | 88.1 | 142.5 | 7.4 | 14.9 | 3.8 |
| cent | 66 | 102.4 | 82.4 | 87.6 | 143.4 | 8.5 | 14.8 | 5.2 |
| nickel | 33 | 168.4 | 137.6 | 148.7 | 196.3 | 6.9 | **19.6** | 11.2 |
| nickel | 42 | 169.0 | 137.3 | 147.0 | 199.5 | 7.5 | 22.0 | 9.7 |
| nickel | 47 | 168.9 | 136.8 | 147.6 | 196.2 | 7.8 | 21.3 | 10.8 |
| nickel | 73 | 169.5 | 136.0 | 145.3 | 197.2 | 9.6 | 24.2 | 9.3 |
| dime | 28 | 155.8 | 127.7 | 149.1 | 203.4 | 12.2 | **6.7** | 21.3 |
| dime | 35 | 154.3 | 124.7 | 149.8 | 206.6 | 13.1 | 4.5 | 25.1 |
| dime | 40 | 155.0 | 125.4 | 149.3 | 206.0 | 13.5 | 5.7 | 23.9 |
| dime | 62 | 153.7 | 122.1 | 150.1 | 200.3 | 14.8 | 3.6 | 28.1 |
| quarter | 38 | 160.9 | 132.1 | 151.4 | 199.7 | 10.9 | 9.5 | 19.3 |
| quarter | 48 | 160.6 | 130.2 | 150.1 | 198.4 | 12.3 | 10.5 | 19.9 |
| quarter | 54 | 160.3 | 129.5 | 150.8 | 200.4 | 12.6 | 9.5 | 21.3 |
| quarter | 84 | 160.7 | 128.6 | 147.9 | 200.7 | 14.1 | 12.9 | 19.3 |

As a ratio to the face's own texture, the **shipped** branch:

| coin | shipped | \|dL\| / sd(face) |
|---|---|---|
| nickel | LIT | **2.53 – 2.93** |
| quarter | LIT | 0.75 – 0.91 |
| cent | DARK | 0.52 – 0.69 |
| dime | LIT | 0.24 – 0.55 |

**The palette step is 22 luma units; three of the four heads end up with less
than their own face texture.** The relief drawn over the mass is eating it:
the lit ridges are `p.field` at 0.85 opacity, so over a dark fill they lift the
mass and over a light fill they barely move it, and the `ink` grooves do the
opposite. On the dime this is the documented intent — the grooves are what carry
the mass there — but it means **the FILL is not what a child is reading** on the
cent, the dime or the quarter.

## 3. What the real coins do — `_jz3refsign.mjs`, `_jz4refmass.mjs`

Two methods, published together because they disagree and the disagreement is
the point.

**Patch medians** (the frozen, audited tone-patch sets from four earlier rounds;
nothing was placed by this round), hair patches over the `cheek` normaliser:

| coin | frame photo | range | says |
|---|---|---|---|
| cent | 0.910 | 0.857 – 0.935 | DARKER |
| nickel | 1.264 | 1.261 – 1.264 | BRIGHTER |
| dime | 1.136 | 0.534 – 1.145 | split |
| quarter | 0.860 | 0.848 – 1.052 | split |

`--overlay` shows why the quarter is "split": on `quarter-obv-2.jpg`
`wigCrown` lands on a lit crest at **1.42** of the cheek while `wigMid` lands
in the shadow beside it at **0.86**. Both are correct readings of the same wig.
**A patch median is a statement about where you put the patch** — and at 38 px
every crest and groove lands inside one device pixel together.

**Area means** — our own hair and face masks mapped onto each photograph through
the disc fit T1 registers with (overlays checked by eye; the quarter and nickel
masks land on the wig and the face exactly):

| coin | hair/face per photograph |
|---|---|
| cent | 0.893, 1.015, 0.874, 0.975 |
| nickel | 1.003, 1.045 |
| dime | 1.082, 0.702, 1.012, 1.087 |
| quarter | 0.989, 0.979, 1.082 |

And **our own art read through the same two masks in the same frame** — the only
difference being that the pixels underneath are our drawing instead of a
photograph, so this is the one comparison that can say which branch lands inside
the band the photographs establish rather than which is louder:

| coin | ours LIT | ours DARK | photographs (median) | \|LIT−med\| | \|DARK−med\| | nearer |
|---|---|---|---|---|---|---|
| cent | 1.145 | **0.912** | 0.934 | 0.211 | **0.022** | DARK = shipped |
| nickel | 1.171 | 0.933 | 1.024 | 0.147 | **0.091** | DARK ≠ shipped |
| dime | **1.070** | 0.835 | 1.047 | **0.023** | 0.212 | LIT = shipped |
| quarter | 1.107 | 0.879 | 0.989 | 0.118 | **0.109** | DARK ≠ shipped, gap 0.009 — a wash |

The cent and the dime are decided by this and decided the way they ship, the
dime overwhelmingly: **0.023 against 0.212.** The quarter is a wash on it
(0.009) and is decided by T1, which says LIT by 0.026. The **nickel is the one
place two statistics genuinely disagree**: this one prefers DARK by 0.056, while
T1 prefers LIT by 0.041 and the look is not close — DARK collapses the nickel's
head into one dark blob at 33 device pixels while LIT keeps a light wig against
a darker face, which is what the photograph row shows. LIT stands on T1 and D12,
both of which §0 ranks above a tone ratio, and the disagreement is recorded
rather than resolved.

Note also that **neither branch reaches the photographs' ≈1.00**, on any face.
The palette has no step between `motif` and `cloth`, and the one tone that would
land on the measurement is the one §8 rejects on sight.

**Every reference ratio is within about 10 % of unity, and that is the finding.**
Hair and cheek on a real coin are *the same metal*. There is no albedo
difference to reproduce; the mass reads as hair through **texture**. The
1.19–1.39 ratios in `coins.js` and in the nickel round are lit crests against a
flat cheek — a true measurement of a different quantity. Our tone step is a
**stylisation standing in for texture the format cannot carry**, and the right
question about it is therefore not "which sign is photometrically correct" but
"which sign transfers".

## 4. T1, both branches — `_jz5t1branch.mjs`

`OBVERSE` is exported and `coinSVG` reads `o.hairLit` at emit time, so the
branch is flipped in memory and T1 runs its own published code path unmodified.
`src/` is byte-identical before and after every run.

Baseline **32/32**. All four flipped **32/32**. Every reverse row is identical
to three decimals — the built-in negative control. Obverse margins:

| coin | 38 | 48 | 54 | 84 | | 38 | 48 | 54 | 84 | delta |
|---|---|---|---|---|---|---|---|---|---|---|
| | *shipped* | | | | | *flipped* | | | | |
| cent | 0.389 | 0.388 | 0.387 | 0.386 | | 0.394 | 0.392 | 0.392 | 0.391 | **+0.005** |
| nickel | 0.205 | 0.202 | 0.202 | 0.205 | | 0.164 | 0.162 | 0.164 | 0.164 | **−0.041** |
| dime | 0.302 | 0.297 | 0.301 | 0.298 | | 0.349 | 0.342 | 0.347 | 0.345 | **+0.045** |
| quarter | 0.368 | 0.368 | 0.368 | 0.368 | | 0.342 | 0.342 | 0.342 | 0.342 | **−0.026** |

Each T1 row depends only on that coin's own art, verified by re-running with
only the dime flipped: the dime row reproduced the all-flip run exactly and the
other three reproduced the baseline exactly.

**T5** (quoted with T1 or not at all): mode A **36/40**, mode B **33/40**,
control A 26/26, B note rows 4/4, null 52/52 — unchanged, since no art moved.

## 5. Sign or magnitude? — `_jz7mag.mjs`

`energyGrid` is a blurred gradient **magnitude**. |grad| has no sign. So before
the dime's +0.045 is read as "the sign is wrong", the hair was repainted in five
tones, two of which `hairLit` cannot reach. This file re-implements
`featOfOurs`, so it is **validated first**: its `cloth` and `hair` rows
reproduce every T1 margin above to 0.001.

margin @38 px:

| tone | luma | vs face | cent | nickel | dime | quarter |
|---|---|---|---|---|---|---|
| `deep` | 65 / 114 | darker | 0.386 | 0.138 | **0.357** | 0.334 |
| `hair` | 75 / 126 | darker | 0.389 | 0.164 | 0.350 | 0.343 |
| `motif` | 93 / 149 | **none** | **0.394** | **0.216** | 0.330 | 0.359 |
| `cloth` | 106 / 171 | lighter | **0.394** | 0.205 | 0.302 | **0.368** |
| `field` | 146 / 212 | lighter | 0.347 | 0.163 | 0.253 | 0.358 |

T1 does **not** track |dL|: `field` has the largest step of the five on every
coin and the worst margin on three of them. The quarter's optimum is the shipped
`cloth`. The cent's and the nickel's optimum is `motif`. **The dime's optimum is
`deep`** — the palette's darkest tone, reserved for the deepest cut, which
nobody would ship. A gate whose optimum on one row is a known-absurd value is
not delivering a verdict about `hairFill`'s sign on that row; it is expressing a
preference for a darker portrait.

That, plus the dime's own photographs (three of four put the hair brighter:
1.082, 1.012, 1.087; only `dime-obv-3.jpg`, a 1996-S cameo proof under raking
light, says 0.702), plus the standing ruling that the three silvers keep one
tone direction, is why the dime was **not** flipped.

## 6. Look — `_jz2hairlook.mjs`

Four rows per coin at 38/48/54/84 px, nearest-upscaled ×10, **control rendered
first** from a checkout of the dispatch commit. Row 1 matched row 2 (or row 3
for the cent) exactly in all four sheets, so the working tree had not moved.

What can be told apart, by eye, at the device sizes:

- **nickel, all four sizes** — LIT and DARK are obviously different objects.
  DARK collapses the head into one dark blob at 33 px; LIT keeps a light wig
  against a darker face, which is what the photograph row shows.
- **quarter, 48/54/84** — clearly different; **38** — different but subtle.
- **dime, 62** — clearly different; **28** — DARK gives a visibly darker crown,
  LIT is nearly indistinguishable from no step at all.
- **cent, all four sizes** — LIT is clearly different from shipped DARK; DARK
  and the no-step control are hard to tell apart at 30 px.
- **`motif` (no step) versus shipped LIT on the dime at 28 px — I cannot tell
  them apart.** That is the same fact as the 0.24 × sd(face) in §2, seen.

## 7. The partition — `_jz6part.mjs`, `_jp9partition.mjs`

Shipped change vs the pinned checkout: **0/60 cells, 0 faces.** Comment only.

What a flag change *would* move, hashed over 24/38/48/54/84/380 px, both sides,
all five subjects:

| candidate | moved | byte-identical |
|---|---|---|
| flip cent | 1/10 — `penny/obverse` | the other nine |
| flip nickel | 1/10 — `nickel/obverse` | the other nine |
| flip dime | 1/10 — `dime/obverse` | the other nine |
| flip quarter | 1/10 — `quarter/obverse` | the other nine |
| flip all four | 4/10 — the four obverses | six, including all five reverses |

So `hairLit` is **already a per-coin opt-in** in the only sense that matters:
`hairFill` sits in the shared `bust()`, but the flag that selects it does not
leak across faces. Restore verified at the end of the run.

## 8. Rejected because it scored better

Filling the hair in `p.motif` — **no tone step at all** — beats the shipped
branch on T1 for the cent (+0.005), the nickel (+0.011) and the dime (+0.028),
and is only 0.009 behind on the quarter. Rendered and looked at
(`_jz2hairlook.mjs` row 3b), the nickel's head becomes one flat mid-tone blob
with a few ridge lines in it: the **"outline with nothing inside it"** failure
`_nk4energy.mjs` already priced at 38 px, and the exact thing three tiers were
deleted to stop doing. Refused on D12.

Also refused: **flipping the dime to DARK** for +0.045 of T1 margin (§5).

## 9. What could not be determined

- **Whether either branch helps a child.** Everything here is a proxy. T1 is a
  correlation against photographs; no child was asked.
- **The right tone for a mass whose real coin is texture, not tone.** §3 shows
  the photometric answer is ≈1.00 on all four faces, which our format cannot
  draw as anything but "no step". The step is a stylisation and this round
  measured it; it did not derive it.
- **Whether the dime's LIT branch would survive a non-proof-heavy pool.** Every
  dime obverse reference in T1's pool is a cameo proof (ledger C2a). The dime
  row's +0.045 for DARK and the reference range 0.702–1.087 are both partly a
  statement about mirror fields and frosted devices.
- **What the relief overdraw is worth on its own.** §2 shows the fill is being
  cancelled by the grooves and ridges, and does not separate the two.
- **Anything about the reverses.** `hairFill` cannot reach them; the partition
  proves it.

## Instruments

| file | what it does |
|---|---|
| `_jzlib.mjs` | pulls HEAD / HAIR / BEARD and the head transform out of an emitted SVG so masks are registered exactly, not fitted; repaints the hair group |
| `_jz1hairtone.mjs` | mass, contrast and levels at 38/48/54/84 px, both branches, four obverses |
| `_jz2hairlook.mjs` | D12 contact sheets, control from a checkout rendered first, photograph row last |
| `_jz3refsign.mjs` | frozen tone patches on the photographs, `--overlay` for the placement audit |
| `_jz4refmass.mjs` | area means through our own masks, `--overlay` |
| `_jz5t1branch.mjs` | runs T1's published code path with the branch flipped in memory |
| `_jz6part.mjs` | in-memory byte-identity partition for a flag candidate |
| `_jz7mag.mjs` | five tones including two `hairLit` cannot reach; validated against T1 before it reports |

None of them writes to `src/`. `_jz3` and `_jz4` need the frozen tone-patch sets
under `coloringbook/`, which `.gitignore` keeps out of the repository; they say
so and exit 2 rather than dying on an ENOENT.
