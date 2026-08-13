# Measuring coin art

How to make `src/art/coins.js` more like the real coin **and prove it**, rather
than redrawing it and hoping. Written after the v6 dime obverse pass, which took
the head/bust silhouette from IoU 0.867 to 0.981 against a traced photograph.

This is for an agent who has not seen that work. It assumes nothing.

> **The tools live in `coloringbook/`, which is gitignored.** They were long
> assumed not to survive, and this document was written out in full, with the
> numbers, so that they could be rebuilt from prose. **As of 2026-08-13 they
> have survived — the complete dime and nickel toolchains are on disk, ~227
> files — and `coloringbook/TOOLS.md` is an inventory of what each one does,
> its inputs and outputs, and how to invoke it. Read that before rebuilding
> anything.** The prose here is still the specification; TOOLS.md says which
> parts of it are already executable. If a future agent finds the directory
> genuinely empty, this document remains sufficient to rebuild from.

---

## 0. The one-paragraph version

Photograph a real coin. Fit a circle to its disc. That circle is the only
correspondence you need: our art draws a disc of radius 47 in a 100-unit
viewBox, so scaling the photograph's radius to 47 puts every pixel of the coin
into our coordinate system. Freeze a traced silhouette of the feature you are
fixing **before** you touch the art. Score with intersection-over-union. Report
every iteration. Look at the drawing at the end, because IoU cannot see inside
the outline.

---

## 1. Coordinate systems

There are three. Getting these right is most of the work.

**(a) Our viewBox.** Every coin is a 100×100 viewBox. The disc is centred at
`(50, 50)` with radius **47**. `coinSVG(id, size, opts)` returns a string; the
rendered box is `size × COIN_SCALE[id]` px wide, so a dime at `size=84` renders
a **62px** disc.

**(b) The photograph.** Fit a circle to the coin's outer edge: centre
`(cx, cy)`, radius `R`. §2.1 gives the fit.

**(c) The portrait's local frame**, the one the `HEAD` / `HAIR` / `RELIEF` path
strings are written in. `bust()` emits:

```
transform="translate(50+CX, CY) scale(dir*s, s)"
```

so a local point `(lx, ly)` lands at `screen = (50 + CX + dir*s*lx, CY + s*ly)`.

`CX/CY/s/dir` come from `OBVERSE[id]` in `coins.js` (the `icon` tier swaps in
`iconCx/iconCy/iconS`). As of v6:

| coin | who | dir | s | cy | cx |
|---|---|---|---|---|---|
| penny | Lincoln | **+1** | 0.65 | 39.3 | 6.0 |
| nickel | Jefferson | −1 | 0.82 | 41.0 | −6.4 |
| dime | Roosevelt | −1 | 0.97 | 45.3 | −2.7 |
| quarter | Washington | −1 | 1.00 | 47.5 | 5.4 |

`dir = -1` mirrors the x axis, so **local +x points toward the face** on three
of the four coins and toward the *back* of the head on the cent.

### The linear map, photo pixel → local unit

Chain (b) → (a) → (c). With `u = (px − cx)/R` and `v = (py − cy)/R`:

```
screen_x = 50 + 47u          screen_y = 50 + 47v
lx = (47u − CX) / (dir * s)  ly = (50 + 47v − CY) / s
```

Worked, for the dime against `ref/dime-obv-2.jpg` (`cx=475.048, cy=475.528,
R=470.016`, and `CX=−2.7, CY=45.3, s=0.97, dir=−1`):

```
lx = 46.19 − 0.1031 * px
ly = 0.1031 * py − 44.18
```

Sanity-check any map you derive by round-tripping a landmark you can see in both
(the nose tip, the truncation point).

### Rasterising our art to the photograph's scale

Render the SVG at width `100 * R / 47`, so **one viewBox unit = R/47 px**. For
`R = 470.016` that is 1000.03px wide and 10.0px per unit. Composite centre to
centre: our disc centre `(50,50)` is at the raster's middle, so it lands on
`(cx, cy)`.

```js
const OURW = 100 * R / 47;
const svg = coinSVG('dime', 600, { side: 'obverse' })
  .replace(/ width="[0-9.]+" height="[0-9.]+"/, ` width="${Math.round(OURW)}" height="${Math.round(OURW)}"`);
// composite at left = round(cx - OURW/2), top = round(cy - OURW/2)
```

Our raster is often **larger than the photograph** — clip it to the frame or
`sharp` throws `Image to composite must have same dimensions or smaller`.

---

## 2. Building the frozen target

### 2.1 Fit the disc

Flood-fill the near-white background inward from the frame edge (`>= 235` on
greyscale), take the boundary of the remaining blob, **discard boundary pixels
touching the frame** (a cropped coin is not an edge), then Kasa algebraic circle
fit with outlier trimming:

```js
// repeat ~12x: keep boundary points within max(2, 0.02R) of the current circle, refit
```

Report the spread. `dime-obv-2` came out `R = 470.02` with 5th/95th percentile
radii of 469.5 / 470.5 — half a pixel, i.e. shot square on. That check matters
(§3).

*If the disc is measurably elliptical*, fit an ellipse instead — subpixel
ray-cast the edge at 0.1° steps and Nelder-Mead on `(cx, cy, A, B, θ)`. On
`dime-obv.jpg` that gives `200.79 × 198.79`, ratio **1.01008**, i.e. an 8.1°
out-of-plane tilt. Do not correct for it — **get a better photograph**.

### 2.2 Segment the feature

For a frosted proof on a dark field:

1. Threshold at the **midpoint of the two brightness modes**. Take the histogram
   inside `0.9R`; on `dime-obv-2` the field sits at 0–20 and the portrait at
   ~100–250, so `T = 100`.
2. Zero everything outside `0.93R` — that removes the rim ring and the
   background without touching the design.
3. Keep the **largest connected component** (4-connectivity). Lettering and dust
   are separate components; the portrait dwarfs them.
4. **Fill interior holes** — flood the background in from the frame and invert.
   Hair grooves and eye sockets are holes, not exterior.

**Prove the threshold is not a knob.** Sweep it and report the drift. On
`dime-obv-2`, `T` from 60 to 110 moved the equivalent radius by 0.4px on 297px —
**0.13%**. Past 120 it collapses (the mask erodes and fragments). If your feature
does not have a plateau like that, the photograph is not good enough.

### 2.3 Trace and freeze

Moore-neighbour boundary trace, then Douglas–Peucker at **0.6px**. Store
**disc-normalised** `(u, v)` so the polygon is independent of that photograph's
scale, crop and centre — this is what lets you overlay the same mask on other
photographs in §3.

The dime's is `coloringbook/_headmask.json`: 985 points, 39.8% of the disc area,
plus provenance (source file, threshold, epsilon, disc fit).

**Write it once and refuse to overwrite it:**

```js
if (existsSync(OUT)) { console.log('REFUSING: mask is frozen'); process.exit(1); }
```

> Douglas–Peucker on a **closed** loop collapses to two points, because the
> first and last are the same. Split at the point farthest from the start and
> simplify the two chains. This bit me.

---

## 3. Choosing a reference photograph

This decides the ceiling on everything else. In priority order:

1. **A uniformly dark field on BOTH sides.** The face profile — brow, nose,
   lips, chin — is the most identity-bearing edge on a coin, and it runs down
   one side. If the field is bright *there*, portrait and field are both
   near-white and no threshold can separate them.
2. **A frosted proof, not a circulated coin.** Cameo proofs give a matte-white
   design on a black mirror. A circulated coin is grey on grey.
3. **A circular disc.** Fit it and check (§2.1). A tilted photograph is
   projectively distorted, and art fitted to it inherits the tilt — you will
   deform a correct drawing to chase a photographic artefact.
4. **Resolution**, last. 900px+ across is plenty; a bigger *bad* photo is worse
   than a smaller good one.

### What is in `coloringbook/ref/` (obverses)

| file | verdict |
|---|---|
| **`dime-obv-2.jpg`** (2015-W proof, 960px) | **Best. Use this.** Black field both sides, R = 470.0 ± 0.5px. |
| `dime-obv-4.jpg` (2002-S proof, 897px) | **Looks ideal, is not.** Lit so the *profile side* of the field is bright — a naive segmentation swallows the left half of the field (61% of the disc instead of 40%). Fine for eyeballing, unusable for tracing. |
| `dime-obv-3.jpg` (1996-S, 750px) | Grey on grey. Visual cross-check only. |
| `dime-obv.jpg` (1996, 400px) | Weakest. Warm-lit and **tilted 8°**. Everything measured off it before v6 carried a 1% distortion. |

Nickel, penny and quarter references in that directory have **not** been
assessed this way. Do it before trusting them.

### Use more than one

Reference photographs disagree about tilt, wear, strike and lighting. That
variation is **photographic**, not the design, and the art must not chase it.
Overlay your frozen (disc-normalised) polygon on every reference you have. Where
it fits them all, that is the coin. On the dime it fits `-2`, `-4` and `-3`
closely and visibly misses on the tilted `dime-obv.jpg` — which is both a
validation of the target and a measurement of how bad that photograph is.

---

## 4. Silhouette IoU

```js
IoU = area(ours ∩ reference) / area(ours ∪ reference)
```

Rasterise both into the same 1024² grid at the photograph's scale, binarise at
50% alpha, count. Both masks through the *same* rasteriser so any bias cancels.

**Take our mask from the SVG the app actually ships**, not from a re-derivation.
Generate `coinSVG(...)`, regex out the bust group's transform and the head `d`,
and re-emit just that path filled solid:

```js
const g = svg.match(/transform="translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+) ([-\d.]+)\)">/);
const d = svg.slice(g.index + g[0].length).match(/<path d="([^"]+)"/)[1];
```

Fill only — no stroke, no bevel, no hair. You are measuring the outline.

**Diagnose with a difference map, not the scalar.** Render three colours: both
(grey), ours-only (magenta — we bulge past the coin), reference-only (green —
the coin goes where we do not). One look at that image tells you which control
points are wrong; the number never will.

**Separate placement error from shape error.** Before editing any path, optimise
`(CX, CY, s)` alone and re-score. On the dime that went 0.867 → 0.912, which
proved ~60% of the gap was genuine shape and worth redrawing for.

### Curve quality is a separate gate from IoU

A least-squares Bézier fit (Schneider) will score beautifully and produce a
**garbage path** — control points outside the shape, loops that reverse — because
the raster fill cancels the wiggles. On the dime, the highest score measured was
**0.99019, from a path with a control point beyond the nose tip**, and it was
rejected.

Gate it mechanically. Walk the knots, compute the turn angle at each, and count
any beyond **75°**:

```js
let t = atan2(c.y-b.y, c.x-b.x) - atan2(b.y-a.y, b.x-a.x);  // normalise to ±180
if (Math.abs(t) > 75) reversals++;
```

Ship a configuration with **zero**. What worked on the dime: smooth the traced
contour (32 binomial passes, protecting real corners), resample by arc length
with curvature-adaptive spacing (2.2–8.0 local units), then **centripetal
Catmull-Rom → Bézier**, which cannot overshoot. That gave 43 segments, zero
reversals, IoU 0.98083 — 0.0094 worse than the oscillating fit and enormously
better as a drawing.

Force genuine corners to stay corners by splitting the chain there (the dime's
truncation has two). Draw a straight run as an `L`: the dime's cut bows off
straight by at most 0.9 units over 36, so a line is honest.

---

## 5. Tone: measure a patch ratio before adding detail

The dime's hair was wrong for three passes and every pass tried to fix it with
**more texture**. The error was **tone**.

Sample two patches in the local frame — one inside the feature, one on bare skin
— from the photograph and from our render, both rasterised to the same disc
radius, and compare **medians**:

```
patch  hair = local x −22..−8, y −22..−12    cheek = x 5..13, y 1..11
source            hair med   sd  p15  p85 | cheek med | hair/cheek
dime-obv.jpg         130    81   43  244  |       97  |     1.340   <- SEE WARNING
dime-obv-2.jpg (primary, black field)                  |     0.966
dime-obv-4.jpg (2002 proof)                            |     0.995
dime v4 (before)     136    36  126  199  |      149  |     0.913
dime v5 / v6 (now)   149    34  114  202  |      149  |     1.000
```

> ⚠️ **CORRECTION (phase 2).** The 1.340 above was measured on
> `dime-obv.jpg` — the 400px, warm-lit, **8°-tilted** file that §3 grades
> WORST. On the two usable proofs the same two patches give **0.966** and
> **0.995**, and our art was already at 0.993. A phase-2 brief carried 1.340
> forward as a target and it was wrong: chasing it would have driven a
> correct drawing toward a bad photograph's lighting.
>
> **The lesson is bigger than the number.** A ratio is only as good as the
> photograph under it. Measure the same patch pair on EVERY usable
> reference; where they disagree that spread is photography, and only the
> **sign and rough size** of a relationship — hair brighter than the
> shadowed cheek — is a property of the coin. Never target a single
> photograph's exact figure.

Read that: on the real coin the hair is **brighter than the cheek** (1.34) —
because it is the same silver, lit, standing proud, while the cheek is in
shadow. We were drawing it *darker* (0.91). A dark block is not a stylisation of
that object, it is the opposite of it.

The fix was structural, not more lines: fill the hair mass in the **face's own
tone** at full tier (`hairLit` on `OBVERSE.dime`) and carry it entirely on dark
grooves with lit ridges between them. Ratio 1.000.

**Generalise: measure the ratio before assuming a feature needs more detail.**
"Looks flat" usually means the tone is wrong, and adding strokes to a
wrongly-toned mass makes it busier and no more like the coin.

That table also shows the **contrast ceiling** (§8): our tonal spread is sd 34
against the photograph's 81, p15–p85 span 88 against 201 — roughly **45%**.
That is the cost of a flat, gradient-free, shared palette. It is a ceiling to
work within, not a shortfall to close.

---

## 6. Integrity rules

These exist because each one is easy to violate accidentally and each violation
produces a number that lies.

1. **Freeze the target before changing any art.** Write the mask to disk, make
   the writer refuse to overwrite, and do not touch it again.
2. **Never re-trace to raise a score.** If you genuinely must re-trace (a better
   photograph arrives), **keep both masks**, publish them overlaid, and report
   the score against **both**, saying which you optimised and why. A target that
   moves toward the art is not a target.
3. **Publish the mask over its source.** Put the traced outline on the
   photograph it came from, at high zoom, in the proof sheet. A reader must be
   able to audit the target, not just the score. If it is also drawn over the
   other references, the reader can see what is coin and what is photograph.
4. **Report every iteration, including regressions.** A monotone trajectory is a
   sign of selective reporting.
5. **Say when the metric and your eye disagree.** Silhouette IoU is blind to
   everything inside the outline. A high score on a bad drawing is a *finding*.
   Look at the render at 380, 190, 84 and 26px, and overlay your outline on the
   photograph at 3× before believing the number.
6. **Do not trust a prose description of a coin, including the brief's.** See
   §7.

---

## 7. Failure modes already paid for

Do not rediscover these.

**A lit ridge next to a dark groove cancels it.** The pale stroke draws last and
simply paints out the dark one. The dime's hair went from six lit ridges to two,
spaced so a ridge only lands where there is a gap wide enough to hold it.

**A nasolabial line run past the mouth corner reads as a beard.** It closes a
triangle with the mouth and the chin crease, and three lines meeting around a
chin are a beard, not a cheek. It stops *above* the mouth.

**No dark mark on the open cheek.** A dark crescent beside an eye reads as a
socket and the portrait becomes a skull — shipped twice. Dark marks are only
allowed where one form genuinely overhangs another: brow over eye, nose over
lip, lip over chin, jaw over neck.

**Do not add anatomy the coin does not have.** Early drawings gave every coin a
small head on wide shoulders. **The dime and the quarter have no shoulders at
all** — head and neck, and the neck ends in a straight truncation clear of the
rim. The cent and the nickel *do* have a coat. That 2–2 split is a free
recognition channel; getting it wrong costs one.

**Scale what is there before inventing what is not.** The v6 dime's biggest
error was not missing detail — it was the throat sitting **nine units too far
forward**, drawn as one long diagonal where the coin runs the jaw back almost
horizontally and then drops almost vertically to a point.

**Three times, a written description of a coin was simply wrong and the
photograph settled it.** Descriptions from memory produced: a Washington wig
built as three rolled curls stacked down the back contour (it is one rounded
mass with the curls bunched low, behind and below the ear); a bare patch of
skull behind Roosevelt's ear that no photograph shows; and hair drawn as a dark
block when it is the brightest thing on the coin. **Open the reference image
before writing a brief or a path.** This is also recorded in the project's
long-term memory as a standing rule.

---

## 8. Hard constraints

Breaking any of these breaks a test or a child's understanding.

**One silver, byte for byte.** The dime, nickel and quarter share an identical
palette. Real ones are the same cupronickel; a brightness ladder is a
distinction the app invented, and a child who learns "the bright one is a dime"
fails at a shop counter. `tests/coins.spec.js` *measures* the luminance spread
(< 0.5%) rather than grepping, because a previous pass claimed to have removed
the ladder and left 3.88% behind. The penny must stay plainly darker.

**No gradients, no `<defs>`, no ids.** A screen inlines a dozen coins and
document-unique ids would collide. Shapes are closed on the field circle with a
real arc instead of clipped. This is what caps contrast at ~45% of the
photograph's (§5) — and it also means **nothing clips your relief marks**: a
stroke that strays outside the silhouette draws on bare field. Check containment
after any outline change (§9).

**`opts.value` is off by default.** A real coin carries no numeral, and one
would answer wave 1's "which coin is this?" for the child.

**The `full` tier must include 84px.** `src/screens/money.js` draws the
recognition question with `coinRow(q.coins, 84)` — one coin, alone, no sibling
to compare against. The tier boundary is 76 (not 96) precisely so that call
lands in `full`; at `mid` the eye, ear and hairline are deleted from the hardest
question the art is ever asked. Tiers: `>= 76 full`, `>= 44 mid`, else `icon`.

**The icon tier renders the same `HEAD` path as the full tier.** There is no
separate glyph, so *any* outline change necessarily changes 26px and 38px. If a
brief asks you to keep the icon tier byte-identical while correcting the
outline, that is not satisfiable — say so rather than faking it.

---

## 9. Containment and the verification checklist

**Snapshot the baseline first**, into gitignored space:

```sh
cp src/art/coins.js coloringbook/pre-<name>.js
# then fix its import: '../src/engine/money.js' -> '../engine/money.js'
```

Then prove you changed only what you meant to. Compare `coinSVG` output across
**every** id × side × `value` on/off × sizes `[26,38,44,54,76,84,120,190,380]`
(180 outputs), and break the changes down by tier:

```
byte-identical: 162
dime obverse changed — full 10, mid 4, icon 4
unexpected changes / malformed: 0
```

Also assert `coinLabel(id)` and `coinPx(id, 100)` are unchanged.

Before finishing:

- [ ] `node --check src/art/coins.js`
- [ ] Sweep 5 denominations × 2 sides × {26,54,84,120,190} × value on/off = 100
      renders: starts `<svg`, ends `</svg>`, balanced tags, no
      `undefined`/`NaN`/`Infinity`, no empty attributes
- [ ] **Containment**: no relief/hair sub-path strays outside the silhouette.
      Flatten every `<path d>` in the bust group, point-in-polygon against the
      outline, require ≥ 0.6 units clearance (the contour stroke is `sw(1.15,
      0.9, boxW)/s` = 1.19 **local** units, so 0.59 half-width — anything
      within that is covered by it). Changing the dime's outline pushed
      **11 marks outside** and
      each had to be pulled straight in, *constrained to preserve its level* so
      the mouth line stayed the mouth line
- [ ] `npx playwright test tests/coins.spec.js` (9 tests)
- [ ] Look at 380 / 190 / 84 / 26 side by side with the photograph
- [ ] `BACKLOG.md`, `CHANGELOG.md`, `package.json` version — required by
      `CLAUDE.md` in the same commit

**Machine limits.** This box is 7.6GB / 4 cores and has been OOM'd twice by
concurrent headless Chromium. Run **one** browser at a time, preflight before
anything heavy, and prefer `sharp`/librsvg rasterisation (~120ms per 1024²
score) over driving a browser. A full grid search is expensive — a 3315-point
sweep timed out at 2 minutes; use a coarse grid then a local pattern search.

---

## 10. Still unsolved on the dime

Do not re-litigate these; they are known.

- **Hair texture.** Tone is right (ratio 1.000, §5) but we draw 5 grooves + 2
  lit ridges at 62px (9 + 5 above 130px), all near-parallel, where the coin has
  fine irregular strand work. This is the largest
  remaining visual difference at 190 and 380px. Silhouette IoU is blind to it,
  so it needs its own metric — a texture or spatial-frequency measure, not IoU.
- **Relief modelling inside the outline** is unmeasured. Only the silhouette and
  one tone ratio have numbers.
- **Residual silhouette error is 0.019 IoU and is a sub-pixel ribbon** — mean
  absolute deviation 1.9px on a 940px coin (0.2% of diameter, 0.19 local units).
  That is the floor for a 43-segment curve against a pixel-traced contour.
  Chasing it means fitting one photograph's frost texture. **Stop there.**
- **The icon tier now repeats the full-tier placement** (§8). The old
  `iconS/iconCx/iconCy` were fitted to the old outline and scored 0.816 on the
  new one. Unifying them was the least-bad option, not an obviously right one —
  it is flagged for a second opinion.
- **The other three obverses have not been measured at all.** The nickel is the
  obvious next one: `dir = -1`, `s = 0.82`, `cy = 41.0`, `cx = -6.4`, and its
  reference photographs have not been assessed against §3.

---

## 11. When there is no black-field photograph — the nickel

Written after the v1 nickel obverse pass, which took the head-region silhouette
from IoU 0.759 to 0.989. The dime had a cameo proof on a black mirror. **The
penny and the quarter will not**, and neither did the nickel. This section is
what to do instead.

### 11.1 Look for the artist's MODEL, not a better coin photograph

A struck coin lit from one side is grey on grey. A photograph of the sculptor's
**plaster model**, cut out on a transparent or black field, is not — and the
Mint's models for these designs are as public-domain as the coins. The nickel's
`coloringbook/ref/nickel-obv-3.png` is Felix Schlag's accepted obverse model,
signed "FS", supplied as greyscale **+ alpha**.

Check the alpha channel before the grey one. On that file:

```
grey  T   30    50    70    90   110   130   150      -> 7.7% drift, then collapse
    eqR 475.8 472.8 458.7 451.8 446.0 439.2 315.7
alpha T   64        128       192                     -> 0.16%, a real plateau
    eqR  475.57    475.18    474.82
```

The doc's §2.2 plateau test still decides it; the channel it applies to changes.
Confirm the matte is the image's own edge and not somebody's trace by checking
it against the grey boundary at a very low threshold — on this file they agree
to 0.2px.

### 11.2 A model has no disc. Register it onto one that does.

This is the new step, and it is the whole difficulty. §1's coordinate chain
starts at a fitted circle; a cut-out bust has no circle. So:

1. Fit the disc on the **best coin photograph** you have (§2.1) even if you
   cannot segment its portrait. You only need its rim.
2. Fit a **similarity transform** (s, tx, ty, θ) taking the model's contour onto
   that photograph's relief edge.
3. Everything downstream is unchanged: the model's contour, pushed through that
   transform and then disc-normalised, is your frozen target.

**The objective is where this goes wrong.** Two obvious ones failed:

- **Maximise |∇I| along the transformed contour.** Ran straight to the lower
  bound of the scale range. Hair on a coin is a dense field of texture edges, so
  a contour that *shrinks into the hair* scores well wherever it sits. The
  objective is gamed by texture.
- **Intensity NCC over the head region.** Peak 0.24, also at a bound. A shaded
  plaster and a lit silver coin have no linear intensity relationship.

**What works: the normal-direction gradient, then ICP.** For each contour point,
search ±12px *along the outward normal* for the strongest edge; keep the
correspondences; trim the worst 15% by offset; fit a similarity by Umeyama least
squares; repeat ~30 times. The silhouette's gradient is *oriented* — normal to
the contour — and hair texture is not, so the texture averages out and the
silhouette does not.

Initialise it from two landmarks you can read off a gridded crop of both images
(nose tip and crown are enough). Do that by eye, deliberately: it costs one look
and it keeps the search out of the far-away minima that trapped both failures.

### 11.3 The residual IS the faithfulness check

ICP reports what a gradient sum cannot: how far the model actually sits from the
coin, in pixels, with a sign.

```
                    residual mean | med | p90        bias      % of diameter
nickel-obv-5.JPG (1945)   3.54 | 3.00 | 7.00 px     -0.58          0.373%
nickel-obv.jpg   (2004)   0.63 | 0.50 | 1.00 px     -0.04          0.137%
```

A 4-DOF transform fitting a 2774-point contour to two coins struck 59 years
apart to a third of a percent, with no bias, is the evidence that the model is
the design. **Get that number before you trust the model at all**, and publish
the overlay (rule 3).

### 11.4 Separate SHAPE confidence from SCALE confidence, and say both

Two references agreed on the nickel's silhouette to 0.14–0.37% of diameter and
disagreed by **2.2% on how big the portrait is relative to the disc**. That is
not a contradiction: a similarity registration has one scale parameter, and it
absorbs every difference between the two photographs' disc fits.

That matters because **the scale lands on `OBVERSE[id].s`, not on the path**.
So report two confidences:

> the outline is the coin's shape, sized to ±1.1%

which is a materially weaker claim than the dime's, and saying so is the point.
A 2.2% scale uncertainty is worth roughly 0.04 of IoU on its own — bigger than
the entire remaining error of a good fit. **A number measured against a weaker
target does not mean what a number measured against a stronger one means.**

### 11.5 Choose the scored region, freeze it in DISC coordinates

The dime's `HEAD` path was the whole bust, so "the silhouette" was unambiguous.
The nickel's is head-and-hair only: the queue and the coat are separate shapes,
and below the chin the outline stops being a silhouette and becomes the neck.

Cut both masks with **one horizontal line, chosen just below the coin's chin,
and freeze it in disc-normalised `v`** — never in the head's local frame, or
the metric moves when the art does. Above that line every boundary point is a
true outer silhouette edge on the real coin; the cut cancels between the two
masks; and what is left being measured is exactly the part in question.

Then put into "ours" *everything the art draws in that region* — on the nickel
that meant the head, the queue and the bare neck. Scoring one path against a
region three paths cover produces an error you would then "fix" by drawing the
same thing twice.

### 11.6 Things this pass paid for

**Re-smoothing a shared edge separates it.** The nickel's `HAIR` shares its
outer run with `HEAD` by the file's own convention. Smoothing the same raw
contour a second time with different closing waypoints put the hair **1.2 local
units outside the outline**; resampling it separately still left 0.7. With no
clip path anywhere in this file (§8) that draws a sliver of hair on bare field.
**Reuse the head's own KNOTS over the shared run** — 0.05 units, covered by the
contour stroke.

**A separate shape carries a separate stroke, and a stroke is a seam.** The
queue was its own path with its own `deep` outline, and the outline read as a
join: the ribbon looked stuck on the back of his head. Traced into the outline
and into the hair mass — one continuous form, which is what the coin shows —
the seam is gone and it costs 0.0001 IoU. **If two masses are continuous on the
coin, draw them as one path, not as two paths in the same fill.**

**A correct head breaks everything sized around a wrong one.** Making the nickel
right grew the head 16% linearly, and that immediately: pushed two glyphs of
LIBERTY onto the hair (fixed by measuring the word's real arc — 312°–348°,
centred 330°, not 320°); ran the shared `coat()`'s lapel clean off the coin
(fixed by clamping the lapel to the field, a no-op on the cent, proven
byte-identical); and made every relief stroke 16% heavier on screen, because
they are specified in *local* units and local units got bigger. **After any
scale change, re-check the legend, the garment and the stroke widths.**

**Measure the tone ratio even when you are not fixing it.** §5's patch ratio
took ten minutes and found the nickel carrying the identical error the dime did
— hair 1.36× the cheek on the coin, 0.85× in our drawing. That is a finding
worth more than another silhouette decimal, and it is the standing instruction
for the next pass on this coin.

---

## 12. Phase 2 — measuring the interior line work

Written after the dime obverse phase-2 pass, which took regional tone agreement
from 0.1422 to 0.0807 and strand-direction error from 15.8° to 3.8° **without
moving the silhouette by a single pixel**. §§1–11 above are phase 1: they get the
outline right. This section is phase 2: everything inside it.

> ~~As always, the scripts lived in gitignored `coloringbook/` and are gone.
> Rebuild them from this text; it carries the numbers.~~
> **They did not go.** `_p2lib.mjs`, `_p2score.mjs`, `_p2flat.mjs`,
> `_p2bfloor.mjs`, `_p2bband.mjs`, `_p2bzoom.mjs`, `_p2iou.mjs` and
> `_p2contain.mjs` are all on disk and are the executable form of this
> section — see `coloringbook/TOOLS.md`. The text still carries the numbers.

> **Phase 2b (§13) revisits this section.** Three of its conclusions did not
> survive a proper inventory of the interior — see the correction in **12.8**,
> the struck-through item in **12.9**, and §13.3's palette floor, which is what
> "it is the format, not a shortfall" should have been all along.

### 12.1 Why a second metric, not a stricter first one

**Silhouette IoU is deliberately blind to interior detail.** It rasterises two
filled outlines and counts pixels; nothing drawn inside either one can change it.
That is a feature — it is what makes the outline measurable in isolation — but it
means the dime could reach **0.9808 with hair that was still wrong**, and §10
already recorded exactly that ("tone is right… this is the largest remaining
visual difference… IoU is blind to it, so it needs its own metric").

Tightening IoU cannot help. Phase 1's remaining 0.019 is a sub-pixel ribbon
(§10), and chasing it means fitting one photograph's frost texture. The interior
needs a **different** measurement, and the two must be gated **separately**, so
that improving one can never quietly pay for wrecking the other.

So phase 2 is:

1. freeze a second metric before touching the art,
2. change only interior work,
3. re-run **both** gates every iteration.

### 12.2 The metric: a cheek-normalised patch ratio vector

Choose 8–12 **anatomical patches** — small discs, each wholly inside one feature
— and store them in **disc-normalised** `(u, v, r)`, the same `u = (px − cx)/R`
coordinates §2.3 uses for the mask. That is what makes a patch land on the same
feature in our render and in the photograph, at any scale or crop.

For each patch take the **median** luminance, not the mean. A struck proof is
frosted: its texture is high-variance salt-and-pepper, and a mean is dragged
around by the tails. Our render is flat regions and strokes, and a median tells
you which of the two owns the patch — which is the thing line work actually
decides.

Then **divide every patch by the cheek patch**. This is the step that makes the
metric mean anything. Exposure, lighting strength, the photograph's white point
and our palette's absolute lightness are all *not* the design; dividing them out
leaves the **relationships between features**, which is exactly what line work
controls and all it can control. Pick the normaliser to be a large, flat,
feature-free area — an open cheek is ideal.

**Score = mean |Δratio| across the non-cheek patches.** Exclude the cheek: it is
identically 1.000 on both sides and including it only dilutes the mean with a
guaranteed zero.

The dime's frozen twelve, in the head's local frame (`x, y, radius`):

```
hairTop     -4.0 -25.0 3.5     cheek(NORMALISER)  9.0   6.0 3.0
hairBack   -26.0  -8.0 3.5     brow              16.0  -5.0 2.0
hairOverEar-16.0  -5.0 2.5     ear              -12.2   3.0 2.0
hairFront    2.0 -26.0 2.5     jaw                7.0  15.0 2.5
forehead     8.5 -19.0 2.5     lips              16.5  14.5 1.8
                               chin              15.5  19.0 1.8
                               neck               2.0  25.0 3.0
```

Convert with §1's chain and store the `(u, v, r)`. Verify every patch is wholly
inside the frozen mask before writing the file, make the writer refuse to
overwrite (§6 rule 1), and **publish the patches drawn over the photograph** so a
human can audit that `chin` is on the chin (§6 rule 3).

**Thresholds used, and met:** mean ≤ 0.10 (got **0.0807**), no single patch over
0.25 (worst **0.194**, the throat).

### 12.3 Compute what a FLAT drawing would score, first

This is the single most useful number in the method and it costs one line: with
every ratio set to 1.000, the score is the mean of the *photograph's own*
deviations from its cheek.

On the dime that is **0.1134**. Phase 1's art scored **0.1422** — **worse than
drawing nothing at all inside the outline**, because its two big hair errors
pointed the wrong way (the front lock at 0.75 of the cheek where the coin is
1.13). Without the flat number, 0.1422 → 0.10 looks like progress toward a target;
with it, you can see that the first 0.03 only undoes damage and that the target
demands about 12% of the photograph's real tonal structure, correctly signed.

It is also the **anti-gaming floor**. Delete all the line work and you score
0.1134. Any pass that cannot beat that has not drawn anything.

### 12.4 The strand-direction gate

Tone says how bright a region is; it says nothing about which way the marks run.
§5 recorded a real, measured error — our strands dropped **9 units of y per 34 of
x where the coin's drop 9 per 20** — that no tone number can see, and which made
the hair read combed flat to the skull.

Method: **structure tensor**, in both images, inside the same frozen discs.

1. Blur to ~3px first. Frost texture is isotropic noise and swamps the strands.
2. Sobel `gx, gy`; accumulate `Jxx = Σgx², Jyy = Σgy², Jxy = Σgxgy` — **plain,
   unweighted**. Weighting by `|∇|²` makes it fourth-order and one strong edge
   captures the whole estimate.
3. Gradient orientation `½·atan2(2Jxy, Jxx − Jyy)`; the **strand** runs across it,
   so add 90°. Report in the **screen** frame (y down), which both images share.
4. Coherence `hypot(Jxx − Jyy, 2Jxy)/(Jxx + Jyy)` tells you whether to believe it.

**Keep the discs clear of the silhouette by at least 1.6× their radius.** The
head's edge is a device-against-black-field step whose gradient is twenty times
any strand's, and a disc that touches it measures the outline, not the hair. The
first cut of the dime's region did exactly that and returned coherence 1.000 at
0.0° in every disc, which is what a bug looks like.

**Do not aggregate into one angle.** The coin's direction is a *field*. The
dime's four discs measure:

```
crown (-6,-24)  29°     mid-mass (-14,-17)  39°
over the ear (-17,-7)  16°     back of skull (-25,-12)  56°
```

Sixteen degrees against thirty-nine, eight local units apart. The hair over the
top of the skull has turned down round the occiput; the hair on the **side** of
the head has not turned at all. A single number averages that away, and a family
drawn at one angle reads as a combed sheet. Gate on the **mean |Δ| across the
discs** — dime: 15.8° before, **3.8°** after, against a 15° gate.

A concentric "whorl" model (strands perpendicular to the radius from one centre)
was fitted and **rejected**: rms 13.8°, fitting the crown but missing over-ear by
21° and the back by 17°. Two flows, not one wrap.

### 12.5 Prove the outline did not move

Phase 2 must not spend phase 1's result. Every iteration, re-run §4's rasteriser
on the head path taken out of the shipped SVG and require:

- **IoU(new, phase-1 baseline) ≥ 0.999.** If you touch only fills and strokes it
  will be **1.000000**, and anything less means an interior change moved the
  outline — revert it.
- **IoU(new, frozen coin mask) ≥ the baseline's own value in your rasteriser.**
  Publish both. A published figure will not reproduce exactly: phase 1's 0.9808
  comes back as 0.98063 here, a 0.00017 difference from how the mask polygon is
  rasterised. Anchor to the *unchanged baseline measured through your own
  pipeline* — identical strictness, no drift, and it cannot be nudged.

Nothing in the dime pass shifted the outline, so `mid` (44–54px) and `icon`
(26–38px) came out **byte-identical** and only the ten full-tier outputs changed.
That is the shape of a clean phase-2 diff: §8's warning that an outline change
necessarily reaches 26px is about phase 1, not this.

**Also re-run containment (§9).** Interior work is where containment lives, and
it improves or degrades silently — the dime went from **14** sub-paths within 0.6
local units of the silhouette (ten of them hair strokes hugging or crossing it,
drawing on bare field because there is no clip path) to **5**, all inherited face
marks on the profile edge.

### 12.6 Failure modes this pass paid for

**A curve fitted to an end point is not a curve at the angle you asked for.**
Integrating a turning tangent and then applying a similarity transform to land on
a wanted end point **rotates the whole curve**: asked 12°→54°, drew 5°→21°. Tone
improved to its best figure so far on that iteration while the strand gate nearly
doubled to 24°. Specify a strand by *start point, angle profile and arc length*
and let the end fall where it falls, then trim it to the mass.

**Predict patch coverage by AREA, not by a centre-line cut.** A patch median
flips when more than half its **area** is covered. Counting stroke widths along
the patch's centre line said 0.36 dark; the render came back groove-dominated,
and the back of the head went from 1.155 to 0.859 of the cheek. Rasterise the
strokes into the patch disc instead — it is a few milliseconds, it predicts the
render, and it turns most of your remaining tuning into **free** iterations
rather than paid renders.

**Strokes converge where the mass narrows, and width closes the gaps.** Ten
strands run to the nape put ten 10px strokes into two local units and the nape
becomes one dark block. Two fixes, both faithful: **stagger where strands end**
(the coin's are short overlapping shingles, not full sweeps), and make the
detail-tier strokes **thinner** than the ones that must survive the small tier —
the dime's fine grooves are 0.8 local units against the base family's 1.2–1.5.

**A pale wash matches the median and looks nothing like the feature.** The chin
is the coin's brightest patch (1.282 of the cheek) and we drew it flat; the only
way to move a median with flat fills is to cover more than half the patch. Doing
that as a *modelled form* — a lit mark on the ball of the chin, in the same
language as the nose-ridge and cheekbone lights — is legitimate and got 0.282 →
0.105. Doing it as a broad pale patch over the forehead, which the same
arithmetic also permits, would score identically and be a lie. **The test is
whether the mark names a form the coin has.** The forehead's 0.159 was left
unfixed for exactly this reason.

**§7's ridge-cancels-groove rule needs an arithmetic version.** Enforce
`gap ≥ (w₁ + w₂)/2 + 0.4` between neighbouring strokes at a cut across the mass,
and re-check it at three cuts, not one, because a converging family satisfies it
at the front and violates it at the back.

**A metric-neutral change can still be the right one.** Softening the two lit
ridges to half strength moved the score by **zero** — every hair patch is under
half lit, so no median moves — and was made because at full strength over the
lightened mass they read as bright ribbons laid *on* the hair, which the coin
does not show. Iterations that the metric cannot see are where the eye earns its
place; make them, and say that the metric was flat.

### 12.7 Check the sub-target against the RIGHT photograph

§5's table quotes hair ÷ cheek = **1.340** on "the photograph". It does not name
which. It is `ref/dime-obv.jpg` — the 400px, warm-lit, **8°-tilted** file §3
grades weakest. Measured with §5's own two boxes:

```
dime-obv-2.jpg  (best, black field)   170 / 176 = 0.966
dime-obv-4.jpg  (proof, 15px spread)  189 / 190 = 0.995
dime-obv-3.jpg  (grey on grey)        134 / 195 = 0.687
dime-obv.jpg    (weakest, tilted)     127 /  96 = 1.323
```

**Tone is far more photograph-dependent than silhouette**, because it *is*
lighting. §3's rule ("that variation is photographic, not the design, and the art
must not chase it") applies with much more force in phase 2 than in phase 1.

So: **compute the ratio vector on every reference you have before fitting
anything**, and only chase relationships whose **sign agrees** across the usable
ones. On the dime, both good proofs agree that crown, front lock, back of hair,
forehead, lips and chin are brighter than the cheek and that hair-over-ear, ear
and throat are darker — that is the relief, lit from above and in front. They
disagree on magnitude by up to 0.3, which is the honest error bar. A pass that
had obeyed "get it to 1.34" would have driven a correct drawing toward a bad
photograph's lighting.

### 12.8 The ceiling, in phase-2 terms

§8 caps contrast at roughly **45%** of the photograph's, because there are no
gradients, no `<defs>` and no ids, so every shape is one flat fill. In phase-2
terms that means:

- **Any patch inside a single flat shape can only take one of a few values.** The
  dime's face is `motif`; the tones available are `deep` 0.76, `cloth` 1.15 and
  `field` 1.42 of it. A patch median is a **step function**, not a dial, so a
  target like the throat's 0.806 is reachable only by covering half the throat in
  `deep` — which is a collar, not a shadow.
- **Broad smooth shading is out of reach.** Forehead 1.159, lips 1.112 and neck
  0.806 are the dime's three unfixed patches and together they are 0.465 of the
  final 0.888 total error. They are not a shortfall; they are the format.

  > ⚠️ **CORRECTION (phase 2b). This bullet was wrong, and it was the most
  > expensive sentence in the document — it told the next agent not to look.**
  > All three regions are **steps, not ramps**, on the photograph: the throat
  > holds 0.80 flat across fourteen local units and then jumps 0.3 in two; the
  > forehead is a plateau at 1.15–1.21 edge to edge. Flat fills bounded by the
  > coin's own edges took them to 0.004, 0.043 and 0.017 — **0.465 of the error
  > became 0.064** — with the palette and the no-gradient rule untouched.
  > The reasoning failed in two places: it never asked what the regions' EDGES
  > are, and it never enumerated the tone ladder, so it missed that ink filled at
  > 0.28 renders at 0.791 against the throat's 0.806. §13 is the method that
  > replaces this bullet: band-map the reference, and compute a per-patch
  > **palette floor** instead of asserting one. The dime's floor is **0.0410**
  > of the 0.0807 phase 2 left — so 0.0397 of it was a genuine shortfall.
- **Texture is capped too, not just contrast.** A groove is specified in local
  units and must survive the smallest full-tier render (62px on the dime), which
  floors its width at 2–3× the coin's at 760px. Ours is a dozen broad ribbons
  where the coin has dozens of fine hairlines, and no amount of iterating changes
  that.

**A future agent should stop chasing:** any patch that sits in the middle of one
flat fill with no form to justify a mark. Spend the effort where a mark names
something — a groove, a ridge, an overhang shadow.

### 12.9 Still unsolved on the dime after phase 2

- ~~**The throat (neck 0.194)** is the largest remaining patch error and is
  ceiling-limited, per 12.8.~~ **Fixed in phase 2b** — 0.194 → 0.017, as a
  filled cast shadow bounded by the jaw, the silhouette, the sterno-mastoid and
  the truncation. See §13 and the correction in 12.8.
- **Hair texture density.** Twelve broad cuts against the coin's dozens of fine
  ones. Any fix has to come from the tier system (a genuinely different, denser
  family above 190px), not from redrawing the existing one.
- **The lower back of the mass is sparser than the coin's**, and the strands
  converge toward the nape a little too much like a fan pivot.
- **The over-ear angle is the weakest of the four** (25° drawn against 16°
  measured) because the strands that cross that disc also have to serve the
  steeper flow above it.
- **Nothing has been measured on the reverse**, either side of the penny, the
  quarter, or the nickel's interior — see 12.10.

### 12.10 Does the dime's patch set generalise?

**The method does; the patch list does not.** Half the dime's patches are hair,
placed to a crop and a part that only Roosevelt has, and `hairOverEar` names a
shadow that exists because *his* hair tucks over *his* ear.

What transfers unchanged:

- disc-normalised patches, medians, cheek normalisation, mean |Δratio|
- the flat-drawing floor (12.3) — compute it first, every time
- the strand tensor in discs kept clear of the silhouette (12.4)
- the outline-unchanged gate at 0.999 (12.5)
- reject the sub-target if it came off a weak photograph (12.7)

To build a set for another coin: keep **cheek** (every one of the four has an
open cheek and it must stay the normaliser, so the numbers are comparable across
coins), keep **forehead, brow, jaw, chin, lips, neck, ear**, and replace the four
hair patches with 3–5 placed on *that* head's hair structure — for the cent, one
on the crown wave, one over the ear, one on the beard, one on the coat; for the
quarter, on the wig's rolled curls where they bunch **low and behind the ear**
(§7), one on the queue and one on the ribbon; for the nickel, on the long
back-and-down sweep and on the queue.

**Two coins are already known to carry the identical error the dime had.** §11.6
measured the nickel at **hair 0.85× its cheek where the coin is 1.36×**, and the
fix there is the same structural one that worked here: fill the mass in a
*lighter* palette tone (`cloth`) and carry it on grooves, rather than adding
strokes to a wrongly-toned mass. The penny and the quarter have not been measured
at all. Do 12.7 before believing any reference you find for them: neither will
have a black-field proof (§11), so the tone vector will be even more
photograph-dependent than the dime's was.

---

## 13. Phase 2b — inventory the interior before you improve it

Written after the dime obverse phase-2b pass, which took the same frozen metric
from **0.0807 to 0.0443** and, on the way, overturned phase 2's own conclusion
that three of its patches were unreachable. The proof sheet is
`coloringbook/dime-p2b.png` and `dime-p2b.md`. §12 is how to *measure* the
interior; this is how to find out **what is in it** first, and it is the part
the penny, the nickel and the quarter all still need.

### 13.1 The sweep, and why a brief cannot replace it

Phase 2's brief was scoped to "all interior line work" and in practice changed
the hair and one chin mark, because the brief predicted where the error was. The
instruction that fixed it was to inventory **every mark that sits over the
outline**, in both directions:

1. every path our art draws inside the silhouette — what it represents, and is
   it right, wrong or *misplaced*;
2. every feature the coin shows, region by region across the whole portrait —
   forehead, brow, eye and lid, nose bridge/tip/nostril, philtrum, lips, mouth
   corner, chin, jaw, cheek, cheekbone, temple, sideburn, ear, jaw angle, neck,
   throat, nape, truncation — and whether we draw anything for it.

On the dime that was 23 marks and 25 regions. It found the three unmeasured
regions the pass then fixed, **and** four marks that are in the right family but
1–4 local units out of place, which no tone metric can see and which nobody had
noticed in six passes. Publish the whole table, including the rows that came back
"right": the value of the sweep is that it says what was *assessed*.

Two tools, both cheap, both worth rebuilding:

- **Side-by-side at one scale, gridded in the head's local frame.** Crop the same
  local-frame box out of the photograph and out of our render (rasterise ours to
  the photograph's disc, §1) and lay them next to each other with an x/y grid
  drawn in *local* units. That is what lets you say "the eye is 1.5 units high"
  instead of "the eye looks a bit high". `_p2bzoom.mjs`.
- **A tone-band map.** Below.

### 13.2 The tone-band map: blur past the frost, quantise into YOUR palette

A frosted proof is high-variance salt-and-pepper and the eye reads the texture,
not the shading — the first sweep of the dime's jaw concluded "the coin has no
jaw shadow" off a `normalise()`d crop, which is exactly backwards. So:

1. blur the photograph hard (σ ≈ 9px on a 940px coin) until the frost is gone;
2. divide every pixel by the **cheek median** — the same normaliser the patch
   metric uses, so the two are directly comparable;
3. quantise into the bands your palette can actually land on and colour them.

What comes back is a map of the coin's shading as *your format would have to draw
it*, and it answers the only question that matters when you are looking at a
region: **is this a step or a ramp?** Steps are reachable by a flat fill; ramps
are not. Back it with numeric scan lines across and down each region, because a
step you can see is a step you should be able to print.

### 13.3 Enumerate the tone LADDER, and compute a per-patch floor

§12.8 says a patch median is a step function and not a dial. True — and the
mistake phase 2 made was to stop there instead of writing the steps down. List
every tone the drawing can put on a patch: each palette fill, and each stroke or
fill colour composited at each opacity the file actually uses. On the dime:

```
 1.000 motif (bare face)      0.903 ink@0.28 over cloth     1.389 field@0.85 over face
 1.155 cloth                  0.857 ink@0.33 over cloth     1.412 field@0.85 over cloth
 0.838 hair                   0.791 ink@0.28 over face
 0.754 deep                   0.754 ink@0.33 over face      0.686 ink@0.42 over face
```

Then, for each patch, the smallest |Δratio| any legal drawing could reach —
**restricted to the rungs legal in that region** (a patch inside a `cloth` hair
mass can never read `motif`; scoring against the whole ladder flatters the
floor). That is the **palette floor**, and it is the number "it is the format,
not a shortfall" was reaching for:

```
dime obverse:  flat drawing 0.1134 | phase 1 0.1422 | phase 2 0.0807
               PALETTE FLOOR 0.0410 | phase 2b 0.0443
```

Read against that, phase 2's own claim inverts. It grouped forehead, lips and
throat — 0.465 of its 0.888 total error — as unreachable; the floor says
**0.0410 of its 0.0807 was the format and 0.0397 was a shortfall**, and all three
of those patches now sit within 0.043 of the coin. Compute the floor *before* you
decide a region is unreachable, and compute it again at the end: ten of the
dime's eleven patches now sit on it, which is a far better stopping signal than
a threshold somebody chose.

It also finds the honest cases. The dime's `ear` (0.953 against `motif`'s 1.000)
and `chin` (1.282 between rungs at 1.155 and 1.389) really are at the floor:
covering half of either would overshoot by more than leaving it alone.

### 13.4 Two ways a flat format can be wrong about a region — and only one is fatal

The dismissal that failed asked "can a flat fill hit this number?" and stopped at
"only `deep` is close, and half a throat in `deep` is a collar, not a shadow".
Two separate errors, both worth naming:

- **It never asked what the region's EDGES are.** The throat's are all real on
  the coin: the silhouette in front, the jaw above, the sterno-mastoid's lit
  front edge behind (a 0.3 step in two local units, at x ≈ −5), the truncation
  below. A closed shape with four measured edges is not a collar, and §7's own
  list of permitted darks already contained this one — "the jaw over the neck".
  **A region whose every edge is an edge the coin has may be filled flat.**
- **It never enumerated the ladder**, so it missed that ink *filled* at the
  modelling group's own 0.28 renders at 0.791 — nearer the coin's 0.806 than
  `deep`'s 0.754, and reading as a shadow rather than a garment.

12.6's test — *does the mark name a form the coin has?* — is still the gate. It
is what makes the forehead stop at the brow ridge rather than washing down over
the eye, and what makes the lit muzzle stop at the mentolabial crease so the ball
of the chin stays a separately lit form.

### 13.5 A region is only as good as its EDGES

Phase 2b's first cut scored **0.0443 and looked worse than the flat face it
replaced**: three pale and dark blobs floating clear of every line in the
drawing. Each region had been inset a unit or two from the profile, from the
hairline and from the marks below it, so each contributed three or four new
boundaries — and a flat fill has no gradient to hide an edge behind.

> **Butt each region against lines the drawing already draws, so it contributes
> at most ONE new boundary, and let that boundary END on drawn lines at both
> ends.**

Applied, at **exactly zero** change to the score: the forehead runs out to the
contour stroke in front and *past* the hairline behind, so its one free edge is
the brow ridge, starting on the profile where the brow shadow starts and dying on
the hairline. The lip mass runs to the contour, with the nasolabial as its top
edge and the mentolabial crease as its bottom — both already strokes.

Two mechanics this needs:

- **Draw the regions between the head fill and the HAIR**, not after it, so the
  hair's own dark contour draws over the region's back edge and that edge never
  becomes a second hairline. It also means you can run the region a unit or two
  *into* the hair and let it be covered, which is what removes the seam.
- **Inset from the silhouette by the contour stroke's half width and no more**
  (0.6 local units on the dime, §9). Further in and a pale rim appears between
  the region and the outline, which is what made the first cut float.

**Iterations the metric cannot see are where the eye earns its place** (12.6
already says this for stroke weight; it is far more true for areas). Report them.

### 13.6 Things this pass paid for

**A containment checker that matches on `stroke-width` cannot see a filled
path.** `_p2contain.mjs` silently skipped all three new regions and reported a
clean sheet. Match every `<path d>` in the block and take the width as 0 when
there is none.

**Beware moving a mark that lies in the normaliser patch.** The dime's cheekbone
light is measurably 2–4 units too far forward — the coin's peak at y = 0 is
x = 8–10 and ours starts at 13.4. Correcting it puts a `field` stroke through the
**cheek** patch, and every ratio in the vector moves because the denominator
moves. That is not a reason to keep a wrong mark for ever; it is a reason to fix
it in a pass that is allowed to re-freeze the patch set, and to say so.

**A tier-gated region is free at the small sizes.** `plane` and `shade` are
`full`-tier only, so `mid` (44–54px) and `icon` (26–38px) came out byte-identical
and only the ten full-tier outputs changed — the same clean phase-2 diff shape
12.5 describes.

### 13.7 What this leaves for the other three coins

The sweep transfers whole; the findings do not. Before any tone work on the
penny, the nickel or the quarter:

1. Inventory both directions (13.1) and publish the table.
2. Band-map the reference (13.2) and mark each region **step** or **ramp**.
3. Enumerate the ladder and compute the palette floor (13.3) — *before* deciding
   anything is unreachable.
4. Only then choose regions, and edge them against existing lines (13.5).

The nickel is next and is already known to carry the dime's old hair error
(§11.6: hair 0.85× its cheek where the coin is 1.36×). Note that Jefferson and
Lincoln both wear a coat, so their necks are not bare and the dime's throat
finding does **not** transfer — but the jaw's cast shadow above a collar does,
and the quarter, which is also bare-necked, should be checked for it directly.

---

## 14. Phase 3 — edge quality, the thing every tone metric is blind to

Added 2026-08-13, after the owner looked at a finished dime and asked about a
mark every gate had passed.

The dime's jaw line was drawn `stroke-width="1.5"` at full `ink`. Phase 2b's
inventory scored it **"right, and well placed"** — and that was true of
everything the metric could see. Tone: right. Position: right. What the metric
cannot see is that its neighbour, the throat, had become a **filled region**
in the same pass, so one uniform-width stroke was left sitting among shapes
that taper. A real coin has no uniform-width marks anywhere: relief carries
light, and light varies along a feature.

**This is a whole class of defect, not one mark.** A patch-ratio vector
averages tone over an area, so a stroke and a taper covering the same area with
the same mean score identically. No amount of tightening phase 2 finds it.

### 14.1 The check

Mechanical, and it runs on the source, not on a raster:

1. Parse every drawn mark in the subject's tier.
2. Classify each as **stroke-rendered** (has `stroke-width`, no `fill`) or
   **region** (a closed `fill` path).
3. For each stroke-rendered mark, find its adjacent marks — those whose
   bounding boxes touch or overlap.
4. **Flag any stroke-rendered mark with a region neighbour.** That is the
   jaw-line signature.

A flag is not automatically a defect. Lettering and the rim are legitimately
uniform. The rule is: **a flagged mark must be either converted to a tapered
region or defended in writing in the run's document**, naming why the real
coin's light does not vary along it.

### 14.2 Taper is measured, not eyeballed

Converting a stroke to a region invents two numbers — the width at each end.
Take them off the photograph: sample the feature's dark run perpendicular to
its path at both ends and at the middle, in disc-normalised units, and build
the region from those three widths. Report all three. A taper whose numbers
came from taste is the same failure as a description from memory.

### 14.3 Where it goes in the order

**Phase 3 runs last, after tone is settled** — it changes shapes, and a shape
change moves the phase-2 patches. Re-run phase 2 after it and report both
numbers. If tone regressed, say by how much; a small tone regression buying a
correct edge is a trade worth making, but it is the reader's trade to judge,
not the agent's to hide.

---

## 15. Phase 4 — structural rhythm, for the architectural reverses

Two of the four reverses are buildings. IoU is close to useless on them and
will report a high score for a drawing no child could name.

**Why.** A building's silhouette is roughly a rectangle under a roof. Draw the
right rectangle with the wrong number of columns and IoU barely moves — the
columns are *interior*, which §4 says the metric cannot see — yet the columns
are the entire recognisable content. The failure this method already paid for
(a dome-on-a-box drawn from a description) would have scored well.

### 15.1 Count first, and count from the photograph

**The count is the single most recognisable fact about a colonnade, and it is
the easiest thing to get wrong from memory. Do not take a count from a brief,
from prior art, or from this document — count it in the reference, twice, on
two different photographs, and write both counts down.** If two references
disagree, say so and resolve it against a third; that disagreement is
information about your references, not noise to average away.

Score: `|our count − reference count|`. **The threshold is zero.** No rhythm
score, no tone score and no IoU can compensate; a colonnade with the wrong
number of columns is a different building.

### 15.2 Then rhythm

With the count right, measure placement:

- Take the façade's left and right extents in disc-normalised units.
- For each column, its centre as a fraction of façade width.
- Compare ours to the reference as a vector: **mean |Δposition|**, reported in
  units of *one inter-column gap*, so the number means something physical.
- Report the **end gaps** separately. Colonnades are not always evenly spaced,
  and a drawing that evens out a real irregularity looks generic in a way no
  average captures.

Suggested gate: mean |Δposition| ≤ 0.15 gaps, no single column off by > 0.3.
Tune per subject and **state the gate before measuring**, per §6.

### 15.3 Steps, roof, and what carries the shape

Beyond columns, the parts that survive shrinking are the **horizontal bands** —
plinth, entablature, roofline, steps. Measure each band's top and bottom edge
in disc-normalised `v`, as a vector, exactly like the column positions. These
are what makes a building read as *that* building at 26px, when individual
columns have merged into one grey block.

### 15.4 The rhythm must survive the tier drop

At `icon` the columns will not be resolvable and **must not be drawn as
stripes** — that is the noise failure of §16. They become one toned block whose
tone equals the *mean* of the colonnade in the reference blurred to that scale.
Measure that mean; do not choose it.

---

## 16. Phase 5 — lettering, and the point where it must stop being lettering

Every reverse carries a legend. Lettering has a hard floor: below roughly
**1.6 local units of cap height** it stops resolving and becomes noise, and
noise reads as dirt, not as text.

The rule is not "draw smaller text". It is:

> Above the floor, draw letters. Below it, draw the **tone the letters make**,
> and draw nothing else there.

### 16.1 Find the floor empirically, per tier

Render the legend at each tier, rasterise, and compare against the reference
blurred to the same scale. Two numbers:

- **Tone match** — mean level of the legend band, ours vs reference.
- **Spatial frequency** — the band's horizontal intensity variance. Real
  lettering blurred to icon size has *low* variance (it greys out evenly).
  Fake lettering at icon size has *high* variance (stripes). **High variance
  where the reference is smooth is the defect**, and it is the most common way
  small-size art looks bad while measuring fine.

### 16.2 The legend is a band, not a string

Measure the band's inner and outer radius in disc-normalised units, and its
angular extent. A legend whose band is right but whose letters are wrong reads
correctly at every size that matters; the reverse is not true.

---

## 17. Phase 6 — cross-coin discriminability, which is the actual product goal

Everything above measures one coin against a photograph. **None of it measures
the thing the app exists to do**: a child telling one coin from another.

`src/art/coins.js` says this itself — four presidential profiles are four ovals
with a nose, and at icon size they are the same oval. That is the stated reason
the reverses are drawn at all. So measure it.

### 17.1 The metric

Render **all** denominations, both sides, at the `icon` tier onto identical
backgrounds. For every pair, compute a distance — normalised cross-correlation
of the rasters, or mean absolute pixel difference; either works, and whichever
is chosen is frozen and stated.

Build the full pairwise matrix and report:

- the **minimum** off-diagonal distance, and which pair produced it;
- the obverse-only minimum and the reverse-only minimum, separately.

**The obverse minimum is expected to be poor.** That is not a failure to fix by
distorting portraits — it is the finding that justifies the reverses, and the
reverse minimum should be several times larger. If it is not, the reverse art
is not doing its job and no per-coin IoU will tell you.

### 17.2 The size-ordering channel is separate, and must not be leaned on

The four discs differ in diameter, and `COIN_SCALE` already encodes the true
ordering. Diameter is a real channel, but it is **not available in the one
place recognition is tested** — wave 1 draws a single coin with nothing beside
it to compare against. So run the matrix with all coins **rasterised to the
same width**, which is the honest model of that screen. A discriminability
number that depends on size differences is measuring the wrong screen.

---

## 18. The note is not a coin: registering a rectangle

The $1 note breaks §1 completely. There is no disc to fit, so there is no
radius, so the entire photo-pixel → local-unit map has to be rebuilt.

### 18.1 Fit the printed border, never the paper edge

Paper is cut with tolerance, photographed with margin, and often shown against
a background that the eye reads as part of it. **The stable fiducial is the
printed border rectangle**, which is engraved and therefore consistent.

Find its four corners in the photograph. That gives a homography, which is
strictly more general than the coin's similarity transform — a note photographed
flat still has perspective from lens and tilt, and unlike a disc there is no
circular symmetry to absorb it.

### 18.2 State the aspect ratio you fitted, and check it

A rectangle has two independent scales, so **the aspect ratio is a measurement
you can check rather than assume**. Fit the border, compute its ratio, and
compare against the note's true printed ratio taken from the reference — if the
fit disagrees with the reference by more than a percent, the corner fit is
wrong, or the photograph has a border that is not the printed one.

Record the ratio actually used. Our art's box must match it, or every position
measured in normalised units lands somewhere else on the real note.

### 18.3 Everything downstream is unchanged

Once the homography exists, the note behaves like any other subject: freeze
targets before touching the art (§2), IoU the large shapes (§4), patch-ratio
the interior (§12), rhythm the repeated elements (§15), band the lettering
(§16). Only the registration changed.

### 18.4 The note has two motifs on one side

The reverse carries two separate devices with space between them. Do **not**
score them as one region — freeze and score each separately, and report two
numbers. A single blended score hides a good half and a bad half, and the
halves are drawn by different code.

---

## 19. Running order, and what a finished subject looks like

For each subject, in this order:

| Phase | What | Gate |
|---|---|---|
| 1 | Silhouette IoU (§4) | stated before measuring |
| 2 | Interior tone, patch ratios (§12), after a full inventory (§13) | stated, with flat-drawing and palette floors computed |
| 4 | Structural rhythm (§15) — architectural subjects only | count exact; positions stated |
| 5 | Lettering as band and texture (§16) | tone + variance |
| 3 | Edge quality (§14) — **last**, then re-run phase 2 | every flag fixed or defended |
| 6 | Cross-coin discriminability (§17) — **once, across all subjects** | reverse minimum ≫ obverse minimum |

A subject is finished when every phase it needs has a number, a stated gate,
every iteration reported including the ones that got worse, and a rendered
image looked at by a human being. **A subject with good numbers that nobody
has looked at is not finished** — §0 has said so since the first pass, and
§7 lists what it cost to learn.

---

## 20. What the cent added — copper on copper, and a rasteriser that lied

Written after the penny obverse pass (phase 1: head-region IoU 0.668 → 0.952;
phase 2: 0.2607 → 0.1596 against a flat-drawing floor of 0.2193 and a palette
floor of 0.0684). Run document: `coloringbook/penny-obv.md`. Every tool named
below is inventoried in `coloringbook/TOOLS.md`.

### 20.1 `sharp.composite()` is not tone-preserving — this invalidates numbers

The dime's `_p2lib.ourRaster` places our render on the photograph's frame with
`sharp.composite()`. Run the identical PNG through the two paths:

```
                                          field #c98a3c   motif #96521c
sharp(png).greyscale()                          151             99
sharp({create}).composite([png]).greyscale()    201            150
```

The map is **monotone**, so §4's silhouette IoU is unaffected. It is
**non-linear**, and it is applied to OUR raster and not to the photograph's, so
every §12 patch **ratio** measured through it is distorted — by different
amounts in different parts of the range. On the cent's first measurement it
reported the beard at 1.30 of the cheek where the drawing renders it at 0.66.

Use `flatten` + `extract` + `extend` instead: `extend` pads with a colour and
does not blend, and the result reproduces the palette's own greys exactly
(`_pylib.ourRaster`). **The dime's phase-2 and phase-2b ratio vectors were
measured through the compositing version and should be re-measured before they
are quoted again.**

The general rule is worth more than the bug: **before trusting any tone
pipeline, feed it a flat patch of a known palette colour and check the number
that comes back is the colour's own grey.** It costs one line.

#### 20.1a How wrong the dime actually is — measured, not feared

The finding above was verified independently against the exact old code path
(`channels: 3`, black canvas) and then quantified on the dime's real palette
from `src/art/coins.js`. The distortion is **chroma-dependent, not a constant
offset and not simply "non-linear"** — that distinction is the whole story:

```
                      direct   composited   delta
  copper #c98a3c        151        201       +50     saturated
  copper #96521c         99        150       +51     saturated
  dime   field #cfd5da   212        207       -5      near-neutral
  dime   ink   #242c33    43         36       -7      near-neutral
```

Saturated colours move **up ~50**; near-neutral greys move **down 5–7**. That
is why the cent — copper on copper — was corrupted badly enough to invert a
finding, while the dime, whose entire palette is near-neutral, was not.

Ratio error on the dime's actual marks, normalised against `field`:

| mark | direct | composited | error |
|---|---|---|---|
| `cloth` | 0.8066 | 0.7923 | **−1.8%** |
| `motif` | 0.7028 | 0.6860 | **−2.4%** |
| `hair`  | 0.5943 | 0.5749 | **−3.3%** |
| `deep`  | 0.5377 | 0.5169 | **−3.9%** |
| `ink`   | 0.2028 | 0.1739 | **−14.3%** |

**The error grows as the mark gets darker**, because a near-constant negative
shift on a near-neutral colour is a large *fractional* change to a small
denominator. So the dime's phase-2 conclusions about mid-tone regions stand to
within a few percent, and any conclusion that leaned on an `ink`-level patch
does not. §12.8's ceiling and §13's inventory rows should be re-derived before
being quoted as measurements rather than as directions.

`_p2lib.ourRaster` was fixed on 2026-08-13 to the `flatten`/`extract`/`extend`
form, so a later run reusing the dime tooling does not reinherit this. The
comment at the fix records the numbers above.

### 20.2 Copper on copper: a BAND, not a level — and the physics that gives it

§2.2 thresholds a level and §11 says look for the sculptor's model when that
fails. The cent gives a third case. All four of its references drift
monotonically with no plateau (`_pyseg.mjs`), because the portrait and the field
are the same metal at the same brightness. Three edge-based segmenters were
built and all three failed, and the failures are the transferable part:

- **flood the field through "not dark" pixels.** The die's edge shadow really
  is a continuous dark line and the flood really does stop on it — but the
  field's own lighting ramp dips below the same threshold in broad patches, so
  the flood leaks. A morphological opening does not rescue it: the leaks are
  blobs, not thin bridges.
- **grey top-hat** (darkness relative to the local maximum) kills the field's
  ramp, but interior hair grooves are locally stronger than the outline, so the
  flood leaks the other way, into the portrait.
- **local gradient energy as the barrier** is the right idea at the wrong
  scale: at 2000px the bare field's gradient is 40–85 from die polish and grain,
  comparable with the boundary's. Blurring to the width of the boundary shadow
  first is necessary and still not sufficient.

What works is a physical difference, not a photometric one:

> **A frosted (cameo-proof) portrait is DIFFUSE and always mid-grey. A mirror
> field is SPECULAR and always at one extreme or the other. So the portrait is
> a BAND in the histogram, not a level — and a band threshold segments it
> cleanly even when the field reflects black on one side of the coin and white
> on the other.**

`penny-obv-2.jpg` at `50 ≤ v ≤ 220` gives the whole bust. Apply §2.2's plateau
test to **both** edges of the band separately: the upper edge had a true
plateau (210→240 unchanged to four decimals), the lower one drifted 14% on the
whole bust but only **1.4% linear on the head region**, which is the part being
scored. Sweep the region you are actually going to measure, not the whole mask.

### 20.3 Report the ellipse's ORIENTATION, not just its ratio

§2.1 says fit an ellipse and reject a tilted photograph. That test alone would
have condemned the best reference in the cent's directory.

Every one of these photographs shows the coin's **edge thickness** along the
bottom of the frame. That extends the segmented blob downward by ~9px and fits
an ellipse whose major axis is near **vertical**. A genuine out-of-plane tilt
does the opposite: it *shortens* one diameter, so the major axis comes out
**horizontal**.

```
                    ratio    theta     verdict
penny-obv-3.jpg     1.0047   -81.5°    edge thickness. Circle fitted on the
                                       top 240 deg: p95 residual 0.26% of R
penny-obv-2.jpg     1.0109   -65.8°    edge thickness (plus real 1.4% out-of-round)
penny-obv-4.png     1.0238    -8.1°    GENUINELY TILTED ~12 deg. Rejected
```

So: fit the circle on the arc **away from the edge-thickness sector**, and
publish the per-sector mean residual — the bottom sector's +5.5 to +9.0px *is*
the measurement of the artefact.

### 20.4 A cameo proof is the best SHAPE reference and the WORST TONE reference

Frosting replaces a relief's own shading with a uniform matte. On the 2002-S
proof almost every feature reads ~1.0 of the cheek — beard 1.015, lips 1.029,
coat 1.044 — where two struck coins say 0.55/0.63, 0.94/0.97 and 0.77/0.61. The
proof is not lit differently; it is **surfaced** differently.

This matters because §3 ranks a frosted proof *first* for choosing a reference,
and it is right — for the silhouette. **Split the ranking**: use the proof for
shape, and run §12.7's sign test over the STRUCK coins only. A proof in the tone
vector will quietly flatten every relationship toward 1.0 and make a wrong
drawing look right.

### 20.5 The dime's hair finding does not generalise — check the sign per coin

§5, §11.6 and §12.10 all record that the hair is **brighter** than the cheek
(1.34× on the dime, 1.36× on the nickel) and that drawing it dark is "not a
stylisation of the object, it is the opposite of it". On the cent, both struck
references say the hair is **0.54–0.88** and the beard **0.55–0.63** — the
darkest things on the coin. Lincoln's hair and beard are dense, deeply-cut
relief that reads as shadow; Roosevelt's and Jefferson's are broad combed masses
that catch light.

Applying the dime's fix here would have been exactly the failure §7 lists, with
the added irony that it would have been justified by this document. **The
patch-ratio METHOD generalises; no measured ratio does. Re-measure the sign on
every coin before touching a tone.**

### 20.6 A flat region can HIT the metric and still be a lie — band-map first

Both usable references agree the cent's temple is darker than the cheek (0.829,
0.661). The tone ladder said `ink` filled at 0.28 over the face renders at
0.827. Drawn, it took that patch from 0.171 to **0.001** and the mean from
0.1596 to 0.1442 — the best number of the pass.

It looked like a **blindfold**: a flat bar across the eye with one free edge
floating on the face. It was removed, giving 0.0154 back.

§13.2 already says band-map the region and mark it **step** or **ramp** — this
pass drew first and mapped afterwards. The map is unambiguous: on the dime the
throat holds 0.80 flat across fourteen local units and then jumps 0.3 in two;
the cent's face is a ramp with fine local relief and no plateau anywhere, and
the two references do not even agree on where the dark parts are.

> **A patch median is one number, and a flat fill can always be sized to hit it.
> The band map is what says whether the region has an EDGE to hang that fill
> on. Run it BEFORE drawing, every time.**

### 20.7 De-spiking is a mechanical answer to a mechanical gate

§4's reversal gate is mechanical, so make the fix mechanical: while any knot
turns more than 75°, **drop the worst one and re-measure**. A spike in a
resampled contour is a knot straddling a 2-unit wiggle in the pixel trace (hair
crests, the sideburn notch); removing it leaves the Catmull-Rom running through
the knots either side, which is the shape.

On the cent, twenty (smoothing × spacing) builds produced **zero**
configurations with no reversals, and the best raw score came from a path with
seven of them (worst 155°). De-spiking took every build to zero and cost
**0.0051** of IoU against the oscillating best — the same order as the dime's
0.0094. Report the cost; it is the honest price of a drawable curve.

Also: **do not protect the junction between a traced arc and an invented
closure.** Protecting the cent's nape junction left a 100° turn — a corner the
coin does not have, invented by the closure's own waypoints. Letting the
smoothing round it is what took the count to zero, and the rounded part is under
the neck and the coat anyway.

### 20.8 Two masses that meet need ONE junction, decided from the photograph

The cent has three masses in one head — hair, face and beard — and the first cut
got both boundaries wrong in ways no metric could see:

- the **hairline** was read as a single diagonal running to the jaw, which
  buried the ear (measured helix: local x −16.0..−9.0, y −10.0..+3.0) entirely
  inside the hair mass. The cent read as a man in a hood. The hair comes down
  the temple, turns **back over the top of the ear**, and drops behind it.
- the **beard's outer run** was taken all the way round the head's own
  underside, which made a dark band eleven units deep across the whole width — a
  neck brace. On the coin the beard tapers to a **point at the sideburn**, and
  its top edge starts level with the bottom of the ear, not eight units lower.

Both fixes were **metric-neutral to four decimals**. Three of the cent's last
four iterations moved the number by zero or backwards and all four were right.
§12.6 says iterations the metric cannot see are where the eye earns its place;
on a three-mass head that is half the pass.

### 20.9 When two references disagree by more than the error you are chasing

The cent's two struck references disagree with each other by **0.1817** mean
|Δratio| on the same eleven patches — larger than the whole remaining error of
the finished drawing (0.1596). Publish three numbers, not one: against the
frame reference, against the cross-check, and against their midpoint (0.1596 /
0.1282 / 0.1107).

And test the *decision*, not just the score. Our hair sits at 0.818 where the
two references say 0.543 and 0.879. Moving it to the palette floor's best rung
(0.636) gives mean |Δ| across the two of 0.168 — **identical** to what 0.818
gives. That relationship is genuinely indeterminate at this magnitude, and
saying so is worth more than picking the reference that flatters the change.

---

## 21. What the quarter added — silver on silver, and a target that was wrong twice

Written after the Washington quarter obverse pass (phase 1: bust IoU
0.698 → 0.965; phase 2: 0.2968 → 0.1447 against a flat-drawing floor of 0.3582
and a palette floor of 0.0757). Run document: `coloringbook/quarter-obv.md`.
The `_qt*` tools are inventoried in `coloringbook/TOOLS.md`.

### 21.1 On a LIT coin the boundary is not a dark ridge — segment its ENERGY

§2.2 thresholds a level; §11 looks for the sculptor's model; §20.2 finds a band
in a cameo proof's histogram. The quarter gives a fourth case and it is the one
most likely to recur, because most coin photographs are of ordinary struck
coins lit from one side.

Every quarter reference fails §2.2's level test in **both** polarities. The
obvious next move — remove the field's lighting ramp *multiplicatively*
(`r = g / blur(g, 0.08R)`, which is what lighting is, where §20.2's failed
top-hat subtracts) and flood the field through "not dark" — produces a map that
looks perfect and a mask that is **the shadow side of the portrait**. A
minimum-barrier (bottleneck) flood, which removes the dependence on the single
weakest boundary pixel, returns exactly the same set. The model is wrong, not
the threshold:

> **A relief boundary on a lit coin is a dark trough on the shaded side and a
> BRIGHT rim on the lit side. Nothing that floods through "not dark" can
> enclose it. What IS closed all the way round is |grad I|, because a trough
> and a rim are both large gradients and a struck coin's bare field is not.**

Blur to 0.008R, Sobel, flood the field through `G <= T`, keep the largest
component not reached, fill holes. §2.2's plateau test then applies to `G`
instead of to grey — §11.1's point that "the plateau test decides it; the
channel it applies to changes", one channel further on.

### 21.2 A flood mask's boundary is the ridge's SKIRT. Refine to the crest.

The energy flood still drifts — 4.5% linear on the quarter between T = 2.5 and
T = 5 — and that drift is not a leak, it is the width of the gradient ridge:
raising the threshold lets the flood climb further up the skirt. Fix it by
moving every traced point along its own outward normal to the local maximum of
`G`, iterated with light smoothing. That is §11.2's normal-direction search used
to **refine a contour** rather than to register one, and it makes the result
independent of the threshold that produced it: after refinement the quarter's
contour moves 0.112% of diameter for T 3.5→4 and 0.31–0.37% for 3.5→3 and
3.5→4.5.

**Report that sweep, not the flood's.** It is §2.2's plateau test applied to the
thing you actually freeze.

### 21.3 Lettering that nearly touches the device will be welded to it

Rule 3 — publish the mask over its own source at high zoom — earned its place
twice on this coin. The quarter's crown passes about **one local unit** under
the E of LIBERTY. Their gradient skirts overlap, so the traced mask rode the
LETTER: r = 0.836R where the head's own arc is at 0.744R, i.e. **3.5 local units
of invented crown**. Undetected it would have made our head three units too tall
*and* pushed the drawn LIBERTY onto it.

A morphological opening does not fix this. At k = 4, 6, 8, 10 and 12 px the
crown stayed at 0.82–0.836R: the bridge is not a thin neck, the two skirts
genuinely merge. What works is a **guard**: mark everything in the offending
sector beyond a radius that lies BETWEEN the two measured features as field
before the flood. On the quarter the head's arc is at 0.744R and the E's bottom
bar at 0.7645R, and guards of 0.745 / 0.755 / 0.765 all put the crown at
0.765R ± 0.0014 — so the guard is not what decides the answer, which is the
thing to demonstrate.

**Sweep the guard and publish the sweep**, or it is indistinguishable from
trimming the target to fit.

### 21.4 Freeze early, and expect to re-freeze — but keep every version

§6 rule 1 says freeze before touching the art; rule 2 says a target that moves
toward the art is not a target. The quarter needed **three** masks, and the way
to have both rules is mechanical:

- freeze v1, then immediately run rule 3 and rule 4's overlays;
- when a defect is found, freeze a NEW file rather than editing the old one
  (the writer's `existsSync -> exit 1` guard enforces it);
- keep and publish all of them, and **score the art against all of them**.

The quarter's finished art scores 0.96530 / 0.96072 / 0.95177 against v3 / v2 /
v1. A reader can see that the correction was worth 0.014 and that the pass did
not simply chase a target it had loosened.

### 21.5 Check whether two "references" are the same photograph

`quarter-obv.jpg` and `quarter-obv-2.jpg` are one photograph at 500px and
750px. Disc-normalised they differ by mean 11.6 grey levels where two genuinely
different coins differ by 90, and the contour registers onto the smaller one
with a residual of 0.169% of diameter and a relative scale of 0.9974.

That number is worth having for its own sake — **it is the pipeline's noise
floor**, and it is what makes 0.63% and 0.73% on the other two references
meaningful — but counting the pair as two references would have doubled the
apparent evidence for nothing. **Cross-correlate the references before trusting
the count.**

### 21.6 §20.5 does not go far enough: re-measure the sign per REGION

The dime and the nickel measured hair at 1.34–1.36× the cheek; the cent measured
hair and beard at 0.54–0.63; §20.5 concluded "re-measure the sign on every
coin". The quarter's wig is **both**: crown 1.421, middle 0.860, back 0.841,
queue 0.610, curls 0.652 — a spread of 0.81 inside one mass.

A single fill can only serve one of those. The structure that does serve them is
the dime's: fill the mass in a LIGHT tone (`hairLit`) and carry it on cuts,
with the cuts dense enough to own the patches where the coin is dark and absent
where it is bright. On the quarter that is worth reporting as a **deliberate
regression and recovery**: switching to `hairLit` cost 0.054 of the tone metric
(the dark fill happened to match two patches exactly) and was made anyway,
because the dark fill read as a HOOD; widening the cuts then bought the 0.054
back.

### 21.7 Two stroke families with different slopes CROSS, and crossing reads as scribble

§12.4 gates the mean strand angle. Meeting it is not sufficient. On the quarter
the grooves were tilted to the measured field and the lit ridges were not, which
took the strand error from 23.1° to 11.9° — and made the wig read as a mess,
because the two families crossed each other at every roll.

Making the ridges parallel to the grooves within each band cost **3.4°** (11.9°
→ 15.3°, which is a miss against the 15° gate) and is obviously right.

> **Gate the mean angle, but constrain each pair of neighbouring families to be
> PARALLEL. A groove and its own lit ridge are two sides of one roll; they
> cannot have different directions.**

### 21.8 Anything that shares a path with the subject moves when the subject does

§11.6 recorded that a corrected nickel broke the legend, the coat and the stroke
widths. The quarter adds a further hop: the **$1 note's obverse draws
`HEAD.Washington`**, so 18 of the 180 tier-identity outputs changed there too,
and the note's portrait — sized 0.55 against a head that was 62.8 local units
tall — hung out of its oval once the measured head came in at 71.4.

Worse, deleting `TAIL.Washington` printed the literal string `undefined` into
those 18 outputs, because the note's template interpolated `${TAIL.Washington}`
directly where `bust()` uses `TAIL[o.who] || ''`. **The 100-render
well-formedness sweep in §9 is what caught it** — the IoU, the tone vector and
the containment checker were all clean and all blind to it.

> **Before changing a shared constant, grep for every use of it, and run the
> well-formedness sweep as well as the identity sweep. `undefined` in an
> attribute is not a rendering error; it is a silent one.**

### 21.9 A tool that does not change its answer when the art changes is broken

Two tools lied on this pass and both were caught by the same reflex.

- The relief-puller rewrites `M`, `L` and `q` but **not `C`**, so translating a
  cubic collapsed it onto its own control points and quietly destroyed four
  face marks.
- The strand tensor returned coherence **1.000 at 0.0°** in every disc for our
  own render — §12.4 already names that as what a bug looks like — and, more
  tellingly, returned the *identical* four numbers after the geometry changed.
  Blurring our own raster through sharp's raw-input path produced a buffer whose
  vertical gradients were 4800× its horizontal ones. Our render has no lustre to
  blur away; only the photograph needs it.

> **Change the art and re-run the measurement. A number that does not move is a
> bug, not a stable result.**

---

## 22. What the four reverses added — counting, and two tools that lied

Written after the reverses pass (2026-08-13). Run document:
`coloringbook/reverses.md`; frozen target `coloringbook/_rvtarget.json`; the
`_rv*` tools are inventoried in `coloringbook/TOOLS.md`. Headline numbers:

```
                     count error      rhythm mean/worst      icon HF ratio
  penny  before      4 (at mid)       0.190 / 0.479          4.04x
  penny  after       0 (every tier)   0.048 / 0.112          0.00x
  nickel before      2                (span error -23.7%)    4.33x
  nickel after       0 (every tier)   0.007 / 0.018          0.80x
  dime               phase 1 only — torch was 23% too tall, foot 18u vs 6.6u
  quarter            phase 1 only — wings stopped at y 51 against a measured 64
```

**Depth was deliberately uneven and is stated as such in the run document.**
Two subjects got phase 4 in full; two got phase 1 and one correction each.
That was the right trade for one run and the honesty about it is the part
worth copying.

### 22.1 A tool that gives the SAME answer before and after is broken — and it will look plausible

§21.9 said "change the art and re-run; a number that does not move is a bug".
It happened again immediately, and the shape of the bug is worth recording
because nothing about the numbers looked wrong.

The tier-tone tool upsampled our render with `sharp.resize(kernel:'nearest')`
and then sampled the result. **sharp returns THREE channels from a raw
one-channel input.** The sampler read a buffer of stride `3W` as if it were
`W`, so it sampled a squeezed, wrapped image. The output differed per coin,
differed per size, and was stable to four decimals — everything a working
measurement looks like. It was caught only because the before and after runs
came back **byte-identical** after a change that visibly altered the icon.

Two defences, both cheap:

- **Assert the buffer length.** `if (buf.length !== W*H) throw` is one line and
  would have caught this at the first call.
- **Feed the pipeline a known palette colour and check the grey that comes
  back** (§20.1). After the fix the tool recovers `field` as grey **151** on the
  cent and **212** on the silver coins — exactly the palette's own values. It
  had been reporting 213 on the cent, which is not a colour in that palette at
  all, and nobody looked.

> A field level that is not one of your own palette's greys is a bug report.

### 22.2 A plateau is not a peak: flat-topped art defeats a peak finder built on a photograph

The count instrument was written against the photograph, where every column is
a rounded relief and `p[i] > p[i-1] && p[i] > p[i+1]` finds it. **Our columns
are rectangles.** A band-average across a rectangle is a plateau, and a strict
peak test finds nothing on a plateau, so the scorer reported a COUNT OF ZERO
for art that provably contained four columns.

It only showed up because at the largest tier a white highlight stripe turns
each flat top into a true peak — so the tool worked at `size 190` and returned
zero at `84` and `54`. A tool that works at one tier and not another is not
"noisy at small sizes"; it is wrong.

> Any extremum finder used on BOTH a photograph and vector art must collapse
> runs of equal value to their centre. Test it on a square wave before trusting
> it on a coin.

### 22.3 The count really is the whole subject, and prose in the file is not evidence

`monticello()` carried the comment *"Six columns across the portico is the real
count and it is what makes the centre read as a PORTICO"*. Three independent
photographs — an uncirculated nickel, a second struck nickel, and a proof,
cross-correlated against each other first (NCC 0.13 and −0.39, so genuinely
three) — all say **four**, at 39.07 / 46.23 / 53.90 / 61.20.

The extra two were identifiable and that is the transferable part: **between
the four columns sit three openings**, a plain one either side of a centre door
under its own small pediment. Their lit frames are what a six-column reading is
counting. Every phantom column found in this pass was an *opening's edge*, not
an invented shaft — so when a count comes out too high, look for what the
extras are bounding before assuming the drawing was careless.

§6 rule 6 says do not trust a prose description of a coin *including the
brief's*. Extend it: **do not trust a comment in your own source either.** It
is a description of a coin, written by someone who was not looking at one.

### 22.4 "Repeated elements become one toned block" is a fact about PIXELS, not about a tier name

§15.4 is right and it was over-applied. The cent's colonnade was replaced with
a flat block at `mid` as well as at `icon`, on the reasoning that a 3-unit
column cannot resolve there. Measured, at `mid` the coin's own colonnade band
carries **0.201** of along-band high-frequency energy and the flat block
carried **0.000**; at `icon` the coin carries **0.018**. So:

```
  penny colonnade, along-band HF energy, ours / reference
              icon (20px box)     mid (42px)     full (66px)
  8 columns        4.04x             0.45x          0.53x
  flat block       0.00x             0.00x            —
  12 columns         —               0.30x          0.29x
```

Twelve aliased columns at a 2 px pitch are closer to the coin than a clean flat
block. **Measure the reference at the tier before deciding the tier cannot hold
the element.** The line between "draw them" and "tone them" fell between 20 px
and 42 px on this subject and nobody could have named it in advance.

And the defect §16.1 actually names is *high* variance where the reference is
smooth. Undershooting is the safe side; the gate should be one-sided.

### 22.5 Every reverse in this file was drawn to fill the disc, not to fit the design

Three of the four had the same error in the same direction, and it is a
systematic one worth naming:

```
                    drawn height     measured height    error
  Lincoln Memorial   41.6 units       34.5 units         +20%
  torch (dime)       71.9             58.5               +23%
  eagle wings        stop at y 51     hang to y 64        -20% (the other way)
```

A designer sizing a motif inside a circle fills the circle. A die sinker
leaves a wide bare field, because the legend has to go somewhere and because
the rim protects the relief. **Measure the motif's own bounding box in
disc-normalised units before drawing anything**; on all four US reverses it
occupies far less of the disc than instinct puts there.

The eagle is the instructive inverse: it is not "too small", it is the wrong
*shape* — the wings hang. Filling the disc and fitting the design are different
mistakes and the same measurement finds both.

### 22.6 IoU was never computed, and that was the right call

§15 says IoU is close to useless on an architectural subject. This pass tested
that by not using it at all. The two buildings were scored on count, on a
rhythm vector in units of one inter-column gap, and on a band-edge vector — and
every one of those numbers moved decisively where a silhouette IoU would have
moved by a fraction of a percent (the Memorial's silhouette is a rectangle
under a slab before and after; the six-to-four column change is entirely
interior).

The replacement for IoU on this class of subject, in order:

1. **count** — from two photographs, both written down, threshold zero;
2. **rhythm** — centres as fractions of façade width, mean |Δ| in units of one
   gap, **end gaps reported separately**;
3. **bands** — every horizontal edge as a vector in disc-normalised `v`;
4. **tier variance** — the along-band high-frequency energy against the
   photograph reduced to the same device pixel count.

Steps 1–3 are cheap and they are what makes the building that building.

### 22.7 Reduce the PHOTOGRAPH to the tier, and look at it

The most useful single image of this pass was not an overlay or a chart. It was
`coloringbook/_rv-tiers.png`: the reference disc-normalised and box-filtered
down to **the coin's real device pixel count at each tier**, printed beside our
before and after.

It settled three questions no scalar did:

- the cent's Memorial at 20 px is a *light* low band, not a dark bar — which is
  where the house-style tone error is visible rather than merely tabulated;
- the dime at 20 px is a **fat dark cluster**, torch and both branches merged,
  where our icon draws a bare thin bar. That is a defect we did not know we had;
- the new eagle at 26 and 54 px looked, to me, like a regression — a dark delta
  instead of a clean bird. **The real coin at those sizes is a dark
  spread-winged mass with a vertical body.** The old silhouette was prettier and
  less like the object.

> §6 rule 5 says look at the render. Add: look at the PHOTOGRAPH at the same
> size, next to it. The eye is the right instrument for "is this the same
> thing"; it is a terrible instrument for "how big is it", and shrinking the
> reference is what lets you use it for the first without being fooled by the
> second.

### 22.8 A legend band you cannot draw is still worth measuring

The reverse legends were measured with a radial sweep of the **angular standard
deviation** — lettering is the only thing on a coin's outer field that is
high-variance at constant radius, so the band shows as a plateau of σ between
two low-σ shoulders. Take the sweep in a sector where nothing else lives
(straight up, 250°–290°) or the device swamps it.

```
  legend band, viewBox radius (disc r = 47)
  penny   35.7 .. 42.5      nickel  37.1 .. 43.0
  dime  ~ 34.3 .. 42.3      quarter ~ 35.7 .. 43.7
```

We draw the reverse legend from 36.4 with a cap height of 4.5 against a
measured 6–7. The inner radius is right; the height is two thirds. It cannot be
enlarged because our field circle sits at 41.0 and the real band straddles it —
so the finding is that **the field circle, not the type size, is what limits
the legend**, and that is a decision about every coin on both sides rather than
an art fix. Measuring something you have decided not to change is still worth
the ten minutes: it turns "the lettering looks small" into a number and a
reason.

Related, and cheap to check on any new subject: **three of the four reverses
carry a legend we do not draw at all** — MONTICELLO under the nickel's
building, E PLURIBUS UNUM across the dime's middle and in the quarter's upper
arc. Enumerate every string on the coin before deciding which to draw.

---

## 23. What phase 6 and the note added — the first measurement of the product goal, and a fiducial that only exists on one side

Written after the discriminability + note pass (2026-08-13). Run documents:
`coloringbook/discriminability.md` and `coloringbook/bill.md`; the `_x6*` and
`_bl*` tools are inventoried in `coloringbook/TOOLS.md`. Headline numbers:

```
  §17 cross-coin discriminability, icon tier, all coins at the SAME width
    obverse-only minimum   0.0534   nickel / dime          (expected poor - it is)
    reverse-only minimum   0.0808   nickel / dime          before the dime fix
                           0.0794   dime / quarter         after
    RATIO rev / obv         1.51x -> 1.49x                 GATE WAS 3.0x - FAIL
    same, field interior only              1.74x           (the disc dilutes a little)

  §18 the note
    printed border ratio   2.5610 / 2.5827  two notes, 0.85% apart   PASS
    paper edge ratio       2.4239 / 2.3313  same two notes, 4.0% apart
    obverse border ratio   2.4607 / 2.4186  1.7% apart               FAIL
    pyramid device  ink 0.493  mean/field 0.707   ours 0.241 / 0.894
    eagle   device  ink 0.696  mean/field 0.633   ours 0.384 / 0.835
```

### 23.1 The reverses do not do the job they were drawn to do, and only §17 could say so

§17 predicted the obverse minimum would be poor and asked for the reverse
minimum to be "several times larger". It is **1.5×**, and 1.74× with the shared
disc discounted. Both are far under the stated gate.

Every one of the four reverses scores well against its own photograph (§22).
That is the finding: **per-subject fidelity does not imply cross-subject
separability, and nothing in §1–§16 can detect the difference.** A whole run
can improve every number it measures and leave the product goal where it was.

The mechanism the matrix makes obvious, and it was not obvious in advance:

> **A difference metric rewards COVERED AREA.** Two large busts that mostly
> overlap differ only around their fringe; two small sparse reverse motifs that
> barely overlap still differ over only a small area. The reverses are more
> different in kind and less different in pixels. Drawing a *better* small
> motif cannot fix that; drawing a *bigger* one can.

The second lever the matrix exposes costs one line of data: `PALETTE.nickel`,
`PALETTE.dime` and `PALETTE.quarter` are **byte-identical**. The cent sits
0.15–0.28 from everything purely because it is copper. Three of the four coins
get nothing at all from colour, on a screen that has colour.

### 23.2 Rasterise to the same width, or you are measuring a screen that does not exist

§17.2 said this and it is worth restating with the numbers, because it is the
single decision that makes the metric mean anything. `COIN_SCALE` gives the
four coins 19, 20, 23 and 26 device pixels at the icon tier. Leaving that in
would let diameter carry the separation — and **wave 1 draws ONE coin with
nothing beside it**, so a child has no ruler.

The honest construction, and it is worth copying: rasterise each coin **at its
own real device pixel count** (so the real detail loss and the real aliasing
are in the raster), *then* nearest-neighbour resample every one to a common
grid (so the disc fills the same area everywhere and diameter contributes
nothing). Nearest, so the resample invents nothing.

### 23.3 A fidelity fix and a discriminability fix can be the same edit pulling opposite ways — measure both and say so

The dime reverse at icon tier was a pale disc with a thin bar where the
photograph is a dense dark cluster (§22.7 found it, did not fix it). Fixing it
— drawing the two branches, which the icon tier dropped entirely — moves every
fidelity number toward the coin:

```
                       ink     mean/field   spread   aspect
  photograph          0.678      0.7006      24.12     1.00
  before              0.174      0.9381      15.79     5.00
  after               0.405      0.8637      21.17     1.00
```

and moves the **reverse-only minimum the wrong way**, 0.0808 → 0.0794, because
a denser dime is a dime more like the quarter. Two denser variants were also
measured: they bought *less* ink and cost 4.8% and 6.4%.

The transferable parts:

- **Run the trade as an experiment with several candidates, not as an
  argument.** Three of the four candidates would have been defensible in prose;
  only the table says which one costs least.
- **Report both numbers and hand the choice up.** The pass shipped the cheapest
  candidate and wrote down the exact revert, because "which do we value more"
  is not a measurement.
- **The interesting number was neither.** −1.7% on a figure that already fails
  its gate by 2× is noise. What the matrix actually says is that the three
  silver reverses sit at 0.081/0.079/0.098 whether the dime is fixed or not:
  the reverse minimum is a property of **the set**, not of any coin in it, and
  no amount of per-coin work will move it.

A free result worth looking for on any tiered art: the icon→mid boundary used
to **pop** — a bare bar at size 43 became a full branched torch at 54. Printing
the whole size band as one strip (`_x6-dime-band.png`) shows tier discontinuities
that no per-tier measurement can, because every per-tier measurement is taken
inside one tier.

### 23.4 The note: §18.1 is right, and its fiducial exists on ONE SIDE

Fitting the **printed border** gave two independent notes 2.5610 and 2.5827 —
0.85% apart. Fitting the **paper edge** on the same two photographs gave 2.4239
and 2.3313 — 4.0% apart. §18.1's claim is confirmed at 4–5× repeatability.

But the $1 **obverse has no such rectangle**. Its outer boundary is ornamental
scrollwork and a lettered band with no continuous straight rule, and the fitted
ratios come out 1.7% apart — a fail. **"The printed border" is a property of a
particular face of a particular note, not of paper money.** §18.1 should be
read as: find a fiducial that is *engraved rather than cut*, and check that the
one you picked actually exists on the face you are registering.

Two rules that made the border fit work, after two wrong fits:

- **What distinguishes the border from every other dark thing near the edge is
  that it is LONG.** A per-scanline "first ink" test fits the paper edge, the
  image edge, or a speckle. Requiring ink over ≥90% of a window 0.9× the note's
  length, with a few rows of tolerance for tilt, costs two prefix sums.
- **Skip the outer 2% before looking.** A scan's own dark edge and the paper's
  drop shadow are *also* long straight dark lines. This is the difference
  between iteration 2 and the answer.

And **N3: report the quad's rectangularity beside its ratio.** A homography can
map any quadrilateral onto any rectangle, so the aspect ratio is only a
measurement when the quad is near-rectangular — here every corner is within
0.19° of 90° and opposite sides within 0.65%, and *that* is what licenses
reading a ratio off it at all.

### 23.5 Our own source comment was wrong again, and this time it was right by accident

`noteSVG()` said "the aspect ratio is 1.79:1 against a real note's 2.61:1".
**2.61 is the note's height in inches**, not a ratio: a $1 is 6.14 × 2.61 in,
so its paper ratio is 2.3524, which is what all four photographs measure.

It is close to the truth for the wrong reason — the printed border, which is
what our frame is an analogue of, measures 2.572. §22.3 said do not trust a
comment in your own source. Add: **a plausible number in a comment is more
dangerous than an implausible one**, because nothing prompts the check.

### 23.6 A density measure needs a background; an edge measure does not

The extent finder for the note's two seal roundels failed **twice**, and both
times returned **bit-identical values on two different photographs** — 0.0413
scanning outward, 0.5546 scanning inward. Outward it locked onto the dip caused
by the pyramid's own light face; inward it hit the search ceiling, because the
scrollwork *outside* the roundel is as inky as the roundel and the density never
falls. There is no bare field on that note to fall to.

The replacement is a **curve-following** score: sweep (cx, cy, rx, ry) and take
the ellipse with the lowest mean grey **around its own circumference**. The rim
is the only closed dark curve in the neighbourhood even though the whole
neighbourhood is dark.

> When a motif sits on a bare field, measure density. When a motif is embedded
> in ornament, only an edge or curve measure can find its boundary. This is the
> same failure `_rvcontain.mjs` has on the coin reverses (§22 / TOOLS.md), and
> it now has a name and a fix.

Corollary, cheap and general: **two bit-identical answers from two different
inputs is not agreement.** Both times the value equalled a search bound. Print
your bounds, and treat a result that equals one as a failure report.

### 23.7 §18.4 was right, with a number

The note's reverse devices measure **ink 0.493 (pyramid) and 0.696 (eagle)** —
the eagle half is 41% denser. Blended, the reverse scores 0.59 and that
difference is invisible. Our art reproduces the ordering at about half the
density and with *unequal* shortfalls (−0.252, −0.312). One number would have
hidden both facts.

And the placement error is §22.5 for the fourth time, on a subject that is not
a coin: the two roundels are drawn **1.80× too wide** and **26% too close
together**, r=16 circles that very nearly touch where the note leaves a wide
bare panel between two much smaller seals. **Sizing a motif to fill its
container rather than to fit its design is a house habit, not a coin habit.**
They should also be **ellipses**, ry/rx = 1.314, because our box deliberately
does not have the note's aspect ratio — the one consequence of §18.2 that
cannot be avoided once the non-copy decision is made.

That last was confirmed end to end by a quantity nothing was fitted to: the
Great Seal is a circle on the note, and its rim fits in our frame at ry/rx =
1.340 against the 1.3143 the two measured ratios predict — 2.0%, inside the
fit's own quantisation. **A registration you can check against a shape you did
not use to build it is a registration you can believe.**

---

## 24. What the shoulder blob added — a frozen target nobody had read

The owner looked at the cent and the nickel at 84px and said the shoulder was
a blob. It was: the garment was drawn at **1.43×** the cent's area and
**1.21×** the nickel's, meeting the field circle over **120° of arc** where
both coins use **78°**. Full record in `coloringbook/shoulder-fix.md`.

### 24.1 §22.5, the fifth time — and the first time on an OBVERSE

§22.5 named the habit on the four reverses and §23.7 caught it a fourth time
on the note's seals. This is the fifth, on a subject nobody had checked:

```
                       drawn            measured         error
  cent coat span      119.6 deg         79.4 deg         +51%
  nickel coat span    119.9 deg         78.5 deg         +53%
  cent coat area       1.43 x            1.00 x          +43%
  nickel coat area     1.21 x            1.00 x          +21%
```

Five instances, three subject classes, both sides of the coin, and one
non-coin. **Treat "fills its container" as the null hypothesis for any element
in this file that has not been measured, and measure it before defending it.**

### 24.2 A `vcut` that protects a score also HIDES the rest of the drawing

`_pyeval.mjs` and `_nkeval.mjs` each clip the scored region at a frozen `vcut`
(0.16, 0.33) so that the boundary being scored is a true outer silhouette edge.
That is right, and §11.5 argues for it well.

The consequence nobody wrote down: **every number ever published about those
two coins was blind to everything below the cut.** The cent's coat sat at IoU
0.689 and the nickel's at 0.823 for two passes, unmeasured, while the head
above the cut was reported at 0.952 and 0.985.

The masks themselves were never the problem. `_headmask-penny.json` says on its
own first line that it is *"the complete bust silhouette (hair, face, beard,
neck, coat)"* and `_headmask-nickel.json` says *"head, hair, queue, coat"*.
The target for this fix had been on disk, correct, for two passes. Nothing had
to be traced, photographed or judged — only read.

> **When you freeze a target, freeze the WHOLE object and write down which part
> of it your gate looks at. Then, before shipping, run one score over the part
> it does not.** A `scoredRegion` field in the mask is a promise to come back.

### 24.3 State a control point as "along the chord, and out from it"

The old `coat()` gave each control point free `(x, y)` in coin units. Two of
them were 8 and 5 units of pure sideways pull, and that is the whole mechanism
by which a 78° garment came to be drawn as a 120° one: nothing in the notation
said which way was *out of the shape*, so nothing resisted going further.

Replaced by `bow(x0,y0,x1,y1,dir,t1,b1,t2,b2,s)` — each control point is a
fraction `t` **along** the chord plus a bow `b` **perpendicular** to it, in
units of `s`, with the normal multiplied by `dir` so "outward" is correct on a
mirrored portrait with no second case. Three things follow:

1. **The numbers are comparable between coins.** `back: 37.8` and `back: 43.5`
   are degrees from six o'clock on two different portraits at two different
   scales, and they can be put in the same table as the photographs' 38.8 and
   43.7.
2. **Containment stops being a search.** A cubic never leaves the convex hull
   of its four points; all four are inside the field circle; a disc is convex.
   A forty-round binary search that used to keep the lapel on the coin was
   deleted, not tuned.
3. **A sweep can be constrained in the notation.** `t1 ≤ t2 − 0.04` and
   `|b| ≤ 10` are meaningful constraints. On free `(x, y)` they are not
   expressible at all.

### 24.4 Tie decoration to the edge it decorates, or it will be left behind

The lapel seam and the lit shoulder edge were freehand curves that *happened*
to sit near the silhouette. Narrowing the coat left the cent's lapel with
**25.1% of its length drawn on bare field** — and IoU could not see it, because
both are `fill="none"` and contribute no area to a silhouette.

Each is now a **piece of a seam**: split the seam with de Casteljau, shift it
along the seam's own inward normal. Shrink the coat and they shrink with it.

Two things this cost, both worth knowing:

* **The traversal sign.** A closed silhouette runs nape → back seam → arc →
  front seam → throat, so the two seams share an inward normal sign — but a
  seam you `flip()` in order to split it from the other end **reverses it**.
  Getting that wrong took the failure from 25% outside to 50.8%.
* **A highlight centred ON the outline is half painted over by it.** The lit
  edge is the back seam "drawn once more in white"; drawn *exactly* on the seam
  it lands under the dark contour. It needs its own small inward offset.

> **Add a containment check for every `fill="none"` decoration, scored against
> the shape it belongs to, not against the field.** §8/§9's existing check asks
> only "did it leave the coin".

### 24.5 "The arc containing straight-down" is not the footprint

The cent's frozen mask has a real notch at 80–85°: the coat's hem lifts off the
rim between the body of the garment and its front panel. Reading the footprint
as *the arc that contains 90°* reported a front half-width of **3.9°** for a
coat that reaches **40.6°**. A coat drawn to that number would have had no
front at all.

Report **first and last crossing, plus the number of gaps.** The gap count is
itself a finding — the nickel has none and the cent has one.

### 24.6 The prose in the file can be right about the FACT and wrong about the EDGE

`coat()`'s own comment said the shoulder "runs across as a strong DIAGONAL —
higher behind the head, dropping away in front", and warned that an earlier
symmetrical version "read as a plinth". Both sentences are true. The art
implemented them on the **rim footprint** — 150° at the back against 36° at the
front — and the masks say the footprint is nearly symmetric on both coins
(cent 38.8 vs 40.6, the *wrong sign*; nickel 43.7 vs 34.8).

The diagonal lives in the coat's **upper boundary**: on the cent, `v = 0.292`
behind the head and `v = 0.477` in front of it at the same `|u|`.

§6.6 says do not trust a prose description of a coin including the brief's.
Extend it: **a comment that is right about the phenomenon can still have put it
on the wrong edge, and it will read as corroboration when you check it.** Name
the edge the claim is about and measure that edge.

### 24.7 A gate can fail upward, and it should be reported that way

The head-region gate required movement under 0.002 and got +0.0022 and +0.0049
— both improvements, because the coat's top crosses `vcut` and the gate was
written as if `vcut` separated two disjoint drawings. Recorded as a failure
against the stated threshold, with the direction, rather than quietly restated.
A gate you rewrite after seeing the number is not a gate.

### 24.8 Measure the cost in the tier the feature EXISTS in

The coat is a 2–2 discriminability channel: cent and nickel have one, dime and
quarter do not, and it is what separates the nickel from the quarter, which
share a palette and very nearly a size. `_x6mat.mjs` measures the **icon**
tier, where the coat is not drawn at all — so it reports a serene zero drift
for a change that genuinely spends that channel.

Run at `full` and `mid`, the honest answer: no gated minimum moves, and
`nickel.o` vs `quarter.o` closes by **0.0031** (4.8%), narrowing its margin
over the closest obverse pair from 0.0059 to 0.0028.

> **A phase-6 matrix frozen at one tier does not measure a change made at
> another. Re-run the metric at the tier the feature lives in, and report the
> specific pair the feature exists to separate — not just the minimum.**

Paying 0.8 grey levels on one pair to stop drawing a garment 43% too large is
the right trade, and §17's own warning about optimising the proxy is why.
