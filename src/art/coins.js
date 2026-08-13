// REAL UNITED STATES CURRENCY, drawn. The penny, nickel, dime, quarter and
// $1 note a child actually holds — obverse and reverse of each — emitted as
// an inline SVG string with no external assets, no network, no CSS, no
// <defs>, no gradients and no `id=` attributes at all, because a screen
// inlines a dozen of these at once and duplicate ids are how inline SVGs
// bleed into each other.
//
// ─────────────────────────────────────────────────────────────────────────
// THIS IS NOT PAW BUCKS. The distinction is load-bearing.
// ─────────────────────────────────────────────────────────────────────────
// Paw Bucks are what a child EARNS: a fictional game currency, fictitious
// forever per CHARTER.md, and its own art is the wallet's business. What
// this file draws is what a child STUDIES — Money Math teaches 2.MD.8, real
// coin recognition, and everything learned here has to survive the walk to
// a real shop. So the names, the sizes, the metals and the designs are the
// real ones, and `coinLabel()` says "dime", never "Paw Dime". The file keys
// off `DENOMS` ids purely because that is the id vocabulary the money track
// already speaks; it does not inherit the wallet's fictional labels.
//
// ─────────────────────────────────────────────────────────────────────────
// WHY DRAWN AND NOT PHOTOGRAPHED
// ─────────────────────────────────────────────────────────────────────────
// Every design used here is public domain — US government works, all of
// them from before the 1989 copyright-notice change — but a PHOTOGRAPH of a
// coin is a separate copyright from the coin's design, and the Mint's own
// photographs are reserved by its contractor. So every curve in this file is
// hand-placed. That also keeps src/art/ATTRIBUTION.md's "all original art"
// true, and keeps the app fully vector: for an offline PWA, drawing is the
// difference between a 4kB face and a bitmap set in the service worker.
//
// ─────────────────────────────────────────────────────────────────────────
// WHY THE FILE EXISTS AT ALL
// ─────────────────────────────────────────────────────────────────────────
// Coins used to be plain CSS circles separated by a few px of diameter and
// a few percent of grey. Two things were broken: a coin-recognition activity
// had nothing to teach on, and a child with low vision or colour-vision
// deficiency was left telling a nickel from a quarter by ~8px. And
// docs/PEDAGOGY.md §4 names the real obstacle — the dime is the SMALLEST US
// coin yet worth more than the nickel, and children reasonably infer that
// size implies value. That conflict has to be drawn TRUE to be teachable.
//
// ─────────────────────────────────────────────────────────────────────────
// THE IDEA: a coin at 190px and a coin at 26px are not the same drawing.
// ─────────────────────────────────────────────────────────────────────────
// `coinSVG` is handed `size`, so it emits DIFFERENT GEOMETRY per size band.
// Shrinking one drawing is what turns a portrait into a thumbprint; instead
// each face is authored three times over, and detail is DELETED before it
// can turn to mud:
//
//   full  (size >= 76)  the drawing: hair mass, brow, eye, ear, coat,
//                       feather and column lines, the full inscription
//                       layout. 76 and not 96 because wave 1 draws at 84 —
//                       see tierOf().
//   mid   (size >= 44)  masses only: head, hair, beard, queue, coat. No
//                       eye, no ear, no relief hairlines, and only the
//                       coin's MAIN word if there are pixels for it.
//   icon  (size <  44)  one bold mark scaled up to fill the field: the head
//                       alone, re-centred, no neck, no coat, no words.
//
// The tier is chosen from the QUARTER's size, never the individual coin's,
// so a row drawn with one `size` is always one visual family.
//
// ─────────────────────────────────────────────────────────────────────────
// WHAT CARRIES IDENTITY, and none of it is colour
// ─────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────
// THE ONLY TEST THAT COUNTS: does it transfer to real change?
// ─────────────────────────────────────────────────────────────────────────
// A child who learns the nickel here has to name a REAL nickel, held in a
// real hand. That is a stricter standard than "our four drawings can be told
// apart", and it rules out three channels an earlier version of this file
// leaned on hard, every one of which was OUR invention rather than the
// coin's:
//
//   ✗ A GREYSCALE LADDER. Penny darkest → dime brightest was a lovely,
//     checkable, accessible idea, and it is a lie: a real dime, nickel and
//     quarter are the same cupronickel grey. A child taught "the bright one
//     is a dime" has been taught something that fails at the shop counter.
//     The three silver coins are now the same silver, and the palette below
//     no longer carries a luminance ladder to defend.
//   ✗ RIM WIDTH. A broad flat rim on the nickel and none on the penny told
//     our coins apart beautifully. Real rims are all much the same. Gone —
//     every field radius is now the same fraction of the disc.
//   ✗ REEDING AS A LOOK. Penny and nickel really are smooth while the dime
//     and quarter really are milled, so it stays in for correctness, but it
//     is a TACTILE fact: face-on, which is how a coin is seen, it is a
//     whisper. It is drawn fine and quiet, and it is not asked to identify
//     anything.
//
// What is left is what the child is actually looking at:
//
//   1. THE PORTRAIT — likeness and pose. The main event, and the reason the
//                   four heads below are four complete drawings rather than
//                   one face with four hairstyles.
//   2. HOW MUCH OF THE FIELD THE HEAD FILLS. Honest, strong, and markedly
//                   different across the four: Roosevelt's head all but
//                   fills the dime, Washington's nearly fills the quarter,
//                   while Lincoln and Jefferson sit smaller above a coat.
//                   Taken off the reference photographs, not guessed.
//   3. THE TEXT LAYOUT. Where LIBERTY sits, where IN GOD WE TRUST sits,
//                   where the date sits. All four real obverses arrange
//                   these differently, and a child reads the ARRANGEMENT as
//                   part of the coin's look long before reading the words.
//   4. COLOUR       — copper against silver. Real and reliable, and it
//                   separates exactly one coin from the other three.
//   5. DIAMETER     — true mint ratios (dime < penny < nickel < quarter).
//                   docs/PEDAGOGY.md §4: the dime is the SMALLEST US coin
//                   yet worth more than the nickel, and children reasonably
//                   infer that size implies value. The conflict has to be
//                   REAL to be teachable; do not "fix" the ordering. But
//                   note that wave 1 shows ONE coin with no sibling, so
//                   diameter is doing nothing there at all.
//   6. GESTURE    — on the reverse, the whole point. Four profiles look
//                   alike in a 19px disc; four reverse motifs do not, if
//                   each is given a different overall PROPORTION rather
//                   than merely a different subject:
//                     penny   Lincoln Memorial — LOW AND WIDE, flat top
//                     nickel  Monticello       — TALL AND CENTRED, spiked
//                     dime    the torch        — ONE TALL BAR
//                     quarter the eagle        — WIDE at the top, tips
//                                                DIPPING, corners empty
//                     buck    a rectangle, which no coin can ever be
//                   Penny and nickel are BOTH columned buildings, so they
//                   are the pair at risk; the note above those two
//                   functions says how far apart they are pulled.
//
// Strokes are specified with a DEVICE-PIXEL FLOOR (see `sw`): a line that
// would compute to less than ~0.9 real pixels is widened until it is one,
// so nothing thins into fog as the disc shrinks.

import { DENOMS } from '../engine/money.js';

// Mint diameters, millimetres. The dime really is the smallest.
export const COIN_MM = { dime: 17.91, penny: 19.05, nickel: 21.21, quarter: 24.26 };

// Every coin is drawn relative to the QUARTER, the biggest coin: the
// `size` a caller passes is the quarter's diameter in px, and each other
// denomination comes out at `size * COIN_SCALE[id]`. Relative sizes are
// therefore true with no CSS involved, which is exactly what a wallet row
// and a recognition activity both need.
export const COIN_SCALE = Object.fromEntries(
  Object.entries(COIN_MM).map(([id, mm]) => [id, mm / COIN_MM.quarter])
);

// The note is deliberately NOT to scale: a real note is 6.4 quarters wide
// and would not fit a wallet row or a tray. It keeps the proportions the
// old `.coin.buck` CSS had (46×26 next to a 38px quarter) so adopting this
// art is not a jarring layout change. Being a rounded RECTANGLE rather than
// a circle is itself a colour-free identity channel.
export const NOTE_SCALE = { w: 1.24, h: 0.694 };

// What the face says. `$1` for the note, cents for the coins.
export const FACE_VALUE = {
  buck: '$1',
  quarter: '25¢',
  dime: '10¢',
  nickel: '5¢',
  penny: '1¢',
};

// The REAL names, and the reason this map is here rather than imported:
// `DENOMS[].label` in src/engine/money.js says "Paw Dime", "Paw Buck" — the
// wallet's fictional currency, which must keep saying exactly that. Money
// Math is the other thing, so it needs its own vocabulary. Before this map
// existed every coin on the screen announced itself to a screen reader as
// "Paw Dime, 10 cents": the child who most depends on the label being right
// was the one being taught a coin name that exists nowhere outside this app.
// (src/engine/moneyq.js keeps an identical map for the same reason; the two
// are deliberately NOT shared, because moneyq.js already imports FACE_VALUE
// from here and importing back would make the cycle.)
const COIN_NAME = {
  penny: 'penny',
  nickel: 'nickel',
  dime: 'dime',
  quarter: 'quarter',
  buck: 'dollar',
};

// The two faces. `obverse` is the portrait side and the app's default;
// `reverse` is the motif side. Exported so a caller can iterate rather than
// spell the strings, and so a test can assert the set is exactly these two.
export const COIN_SIDES = ['obverse', 'reverse'];

// Penny copper; nickel, dime and quarter the SAME cupronickel grey, because
// that is what they are. The nickel is a shade duller and warmer, which is
// also true and which is about as far as a real difference goes.
//
// THIS COSTS US SOMETHING and it is worth naming: the previous palette gave
// the three silver coins a deliberate greyscale ladder so that a child with
// low vision or colour-vision deficiency could separate them by tone alone.
// That was a genuine accessibility win built on a false fact, and a false
// fact does not transfer to the coin in the child's hand. The tone work has
// moved INTO the drawing instead — how much of the field the head fills, and
// where the text sits — where it is true.
//
//   body  the disc, and the rim band
//   field the raised inner circle the motif sits on
//   motif the portrait / eagle / wheat, filled
//   deep  the same motif one step darker: the CONTOUR the portrait is
//         stroked with, and the fill it takes at small sizes so the shape
//         still separates from the field once anti-aliasing eats the edge
//   hair  HALFWAY between motif and deep, and that half-step is the whole
//         point. Hair drawn in `deep` is a black cap, and a black cap on a
//         mid-tone face is a HELMET — which is exactly what the nickel
//         looked like, and the reason the last pass bet against it. On the
//         real coin the hair is the same metal as the cheek: a shade lower
//         because it is cut deeper, lifted again by lit ridges. So the mass
//         is only a shade lower here too, and the ridges do the work. The
//         HAIRLINE is then held by a thin `deep` stroke around the mass
//         rather than by tone, because at a half-step of tone alone the
//         forehead disappeared and every head became one blank oval.
//   cloth the coat — deliberately LIGHTER than the head, because the head is
//         what has to be read and a dark garment under a mid-tone face
//         inverted the hierarchy: the cent looked like a mountain wearing a
//         man
//   ink   text and the few hairlines the full tier draws
// The three silver coins share ONE palette, byte for byte. A real dime,
// nickel and quarter are the same cupronickel: any brightness difference
// here would be a distinction the app invented, and a child who learned
// "the bright one is a dime" would fail on real change — which is the
// entire goal. An earlier pass left a 3.88% luminance spread behind after
// claiming to have removed it; tests/coins.spec.js now measures it.
const PALETTE = {
  penny: { rim: '#8d5320', body: '#b9762f', field: '#c98a3c', motif: '#96521c', deep: '#6d390e', hair: '#7b4213', cloth: '#a75f22', ink: '#3d1e06' },
  quarter: { rim: '#8b939b', body: '#c1c6cc', field: '#cfd5da', motif: '#8e969e', deep: '#6b737b', hair: '#777f87', cloth: '#a4acb4', ink: '#242c33' },
  nickel: { rim: '#8b939b', body: '#c1c6cc', field: '#cfd5da', motif: '#8e969e', deep: '#6b737b', hair: '#777f87', cloth: '#a4acb4', ink: '#242c33' },
  dime: { rim: '#8b939b', body: '#c1c6cc', field: '#cfd5da', motif: '#8e969e', deep: '#6b737b', hair: '#777f87', cloth: '#a4acb4', ink: '#242c33' },
  buck: { rim: '#3f7a4e', body: '#cfe3c6', field: '#eaf4e3', motif: '#6d9c73', deep: '#54855e', hair: '#5d8d65', cloth: '#a9c8a4', ink: '#26583a' },
};

// Deliberately NOT the app's kid font stack: 'Comic Sans MS' is far too
// wide to fit "25¢" inside a 26px disc. A plain rounded/system sans plus
// the textLength lock below makes the value the same shape on every device,
// which matters when the child is being asked to recognise it.
const FONT = "ui-rounded, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const ORDER = DENOMS.map((d) => d.id);
export const COIN_IDS = ORDER; // biggest first, as DENOMS is

const denomOf = (id) => DENOMS.find((d) => d.id === id);
const round = (n) => Math.round(n * 10) / 10;
const n1 = (n) => Number(n.toFixed(1));
const n2 = (n) => Number(n.toFixed(2));

// Polar helper: a point on the disc, as an SVG coordinate pair.
const P = (r, deg) => {
  const a = (deg * Math.PI) / 180;
  return `${n2(50 + r * Math.cos(a))} ${n2(50 + r * Math.sin(a))}`;
};

// ─────────────────────────────────────────────────────────── size tiering

// `full` is the tier where a face has enough pixels for a drawn feature;
// `mid` is where only masses survive; `icon` is where even the mass has to
// be enlarged and simplified to a glyph. Boundaries picked from the sizes
// the app actually draws: 190 and 120 (a teaching card), 54 (a coin row),
// 38 (a pile) and 26 (a wallet chip, the smallest anything is ever drawn).
// 76 and not 96: `src/screens/money.js` draws the wave-1 recognition
// question with `coinRow(q.coins, 84)` — ONE coin, alone, no sibling to
// compare against. That single call is the hardest question the art is ever
// asked and it was landing in `mid`, i.e. a bare silhouette with the eye,
// the ear and the hair marks deleted. It now lands in `full`. The smallest
// thing that draws at that call is the dime at 84 × 0.738 = 62px, which is
// where the relief widths below were checked.
function tierOf(size) {
  if (size >= 76) return 'full';
  if (size >= 44) return 'mid';
  return 'icon';
}

// Stroke width in VIEWBOX units, with a DEVICE-PIXEL FLOOR. The viewBox is
// 100 units mapped onto `boxW` real pixels, so one device pixel is
// 100/boxW units — a 1.4-unit ring is a comfortable line at 190px and a
// disappearing 0.27px ghost at 19px. `minPx` is what the line must never be
// thinner than once it lands on the screen.
const sw = (units, minPx, boxW) => n2(Math.max(units, (minPx * 100) / boxW));

// ─────────────────────────────────────────────────────────────────── relief
//
// A COIN IS STRUCK METAL, and until this pass every mark in this file was a
// flat fill — which is to say a raised device and a painted one were the
// same picture. Relief is the single biggest thing separating "a drawing of
// a coin" from "a coin", and it costs almost nothing to suggest.
//
// It cannot be done the usual way: relief wants a gradient, and gradients
// want <defs> and a document-unique id, and a screen here inlines a dozen
// coins that would then collide. So it is faked the way a letterpress fakes
// it — the SAME silhouette printed three times, a hair apart:
//
//   · white, nudged UP-LEFT       the lit edge, where the die's slope faces
//                                 the light
//   · `deep`, nudged DOWN-RIGHT   the shadow the raised device casts on the
//                                 field
//   · `motif`, in place           the device itself, covering both
//
// Only a sliver of each offset copy survives around the rim of the shape,
// and that sliver is exactly what the eye reads as "this stands proud".
// Light from the upper left is not a choice — it is the convention every
// engraver, every OS icon set and every child's own eye already assumes, so
// getting the direction wrong reads as a hole rather than a bump.
//
// The offset is held near 1.2 DEVICE pixels at every size and clamped at
// both ends: below ~0.55 units it vanishes on a teaching card, above ~1.7 it
// stops being a bevel and becomes a double image on a wallet chip.
//
// That is the offset the EYE wants. What the coin can afford is a second
// question, answered by `fitOff` below, and for two years this file only
// asked the first one.
const reliefOff = (boxW) => n2(Math.min(1.7, Math.max(0.55, 118 / boxW)));

// ── WHAT THE OFFSET COPY COSTS, and why a drawing file has to measure ────
//
// The lit copy is the one mark on a coin that is NOT authored against the
// field circle. Every motif here is drawn to fit inside it; the copy is not
// drawn at all — it is the same shape moved, and moving a shape up-left by
// `o` carries its upper-left extremity `o·√2` further from the centre.
//
// Measured 2026-08-13: the eagle's left wing reaches 39.41 and the field
// circle at `mid` is 40.5, so the 1.7-unit offset laid 1.10 units of white
// out on the rim — 0.7505% of the quarter reverse's drawn length outside the
// field at `mid`, 0.1629% at 76px and 0.1161% at 84px. The same mechanism put
// the dime's topmost oak leaf 0.60 units out, 0.1343% at `mid`. Note the
// shape of the bug: `118 / boxW` GROWS as the coin shrinks, so the offset
// gets bigger in viewBox units exactly as the field circle gets smaller
// (42.5 at `icon`, 40.5 at `mid`), and `mid` is where the two curves cross.
//
// §8 of docs/COIN-ART-METHOD.md forbids a clipPath, and rightly: a clip hides
// a breach rather than fixing it, and the document then stops describing the
// drawing. `coat()` answers the same question by keeping every control point
// inside the circle and letting convexity finish the argument — but an offset
// copy cannot be re-authored that way, because it is a copy. So it is BOUNDED
// instead: ask the shape how far the light may be carried, and carry it no
// further. No shape moves; only the light does.
//
// `spend()` walks the fragment the browser is actually handed and returns the
// greatest distance the whole of it can be shifted UP-LEFT while every point
// stays inside a circle of radius `r`. It is a closed form, not a search: for
// one point p shifted by t·û, staying inside means
//
//     |p + t·û| ≤ r   ⟺   t² + 2(p·û)t + (|p|² − r²) ≤ 0
//     ⟺   t ≤ −(p·û) + √( (p·û)² + r² − |p|² )
//
// and the shape's allowance is the smallest such t over its points. Whoever
// is nearest the rim in the direction of travel pays; nobody else does. That
// last clause is the reason this is not just `(r − reach)/√2`: a triangle
// inequality charges every shape for its farthest point wherever it lies, and
// on the Memorial — whose widest mark is its BOTTOM step, which the up-left
// shift carries away from the rim, not towards it — that cost two thirds of a
// bevel the coin could actually afford.
//
// Curves are FLATTENED, not hulled: a cubic's control points stand 0.51 units
// outside their own curve on the eagle's wing, and half a unit is most of the
// entire allowance at `mid`. Elliptical arcs are the one exception and are
// bounded rather than flattened — an arc lies within max(rx, ry) of its
// centre and that centre within max(rx, ry) of the chord's midpoint — which
// is crude, but the only arcs any motif's massing draws are Monticello's two
// shallow domes, 12 units from the centre of a 40.5-unit field.
//
// A path command this does not understand returns 0, which deletes the bevel:
// a failure you can SEE, rather than a breach you cannot.
const M_MUL = (A, B) => [
  A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1],
  A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3],
  A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5],
];
const NUM_RE = /[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g;
// The subset of `transform` this file ever emits, in the order it writes it.
function matrixOf(s) {
  let M = [1, 0, 0, 1, 0, 0];
  for (const m of s.matchAll(/(translate|scale|rotate)\(([^)]*)\)/g)) {
    const a = (m[2].match(NUM_RE) || []).map(Number);
    if (m[1] === 'translate') M = M_MUL(M, [1, 0, 0, 1, a[0] || 0, a[1] || 0]);
    else if (m[1] === 'scale') M = M_MUL(M, [a[0], 0, 0, a.length > 1 ? a[1] : a[0], 0, 0]);
    else {
      const t = ((a[0] || 0) * Math.PI) / 180;
      M = M_MUL(M, [Math.cos(t), Math.sin(t), -Math.sin(t), Math.cos(t), 0, 0]);
    }
  }
  return M;
}
// The largest factor by which a matrix can stretch a length — its 2-norm, not
// the Frobenius norm, which is √2 on the identity and would have deleted the
// nickel's bevel for no reason.
function stretchOf(M) {
  const e = (M[0] * M[0] + M[1] * M[1] + M[2] * M[2] + M[3] * M[3]) / 2;
  const f = (M[0] * M[0] + M[1] * M[1] - M[2] * M[2] - M[3] * M[3]) / 2;
  return Math.sqrt(e + Math.hypot(f, M[0] * M[2] + M[1] * M[3]));
}

function spendOf(frag, rField) {
  let T = Infinity;
  let M = [1, 0, 0, 1, 0, 0];
  const stack = [M];
  // `pad` widens the point into a disc, for the one shape that is bounded
  // rather than walked.
  const at = (x, y, pad = 0) => {
    const r = rField - pad;
    const px = M[0] * x + M[2] * y + M[4] - 50, py = M[1] * x + M[3] * y + M[5] - 50;
    const q = px * px + py * py;
    if (r <= 0 || q >= r * r) { T = 0; return; }        // already over the line
    const b = -(px + py) / Math.SQRT2;                   // p · û, û = (-1,-1)/√2
    const t = -b + Math.sqrt(b * b + r * r - q);
    if (t < T) T = t;
  };
  for (const t of frag.match(/<\/?[a-z]+[^>]*>/g) || []) {
    if (t[1] === '/') {
      // never pop the root: a stray </g> must not leave the walk without a
      // matrix, because the failure would be a thrown TypeError in a drawing
      // function rather than a wrong number
      if (t === '</g>' && stack.length > 1) stack.pop();
      M = stack[stack.length - 1];
      continue;
    }
    const name = /^<([a-z]+)/.exec(t)[1];
    const tr = /\stransform="([^"]*)"/.exec(t);
    M = tr ? M_MUL(stack[stack.length - 1], matrixOf(tr[1])) : stack[stack.length - 1];
    if (name === 'g') {
      stack.push(M);
      continue;
    }
    const nm = (k) => {
      const m = new RegExp('\\s' + k + '="([-+0-9.eE]+)"').exec(t);
      return m ? Number(m[1]) : 0;
    };
    if (name === 'circle' || name === 'ellipse') {
      // walked, not bounded by max(rx, ry) about the centre: the dime's leaves
      // are long ellipses lying nearly tangentially, and that bound over-read
      // them by six units — a whole reverse's worth of allowance.
      const rx = name === 'circle' ? nm('r') : nm('rx');
      const ry = name === 'circle' ? nm('r') : nm('ry');
      const cx = nm('cx'), cy = nm('cy');
      for (let i = 0; i < 64; i++) {
        const a = (i * Math.PI) / 32;
        at(cx + rx * Math.cos(a), cy + ry * Math.sin(a));
      }
    } else if (name === 'rect') {
      // corners, so a rounded rect reads a hair large — conservative, which
      // is the safe direction
      const x = nm('x'), y = nm('y'), w = nm('width'), h = nm('height');
      at(x, y); at(x + w, y); at(x, y + h); at(x + w, y + h);
    } else if (name === 'path') {
      const d = /\sd="([^"]*)"/.exec(t);
      if (d && !pathSpend(d[1], at, M)) return 0;
    }
    if (T <= 0) return 0;
  }
  return T;
}

function pathSpend(d, at, M) {
  const toks = d.match(/[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g) || [];
  let i = 0, x = 0, y = 0, sx = 0, sy = 0, cmd = '';
  const num = () => Number(toks[i++]);
  while (i < toks.length) {
    if (/[A-Za-z]/.test(toks[i])) cmd = toks[i++];
    const rel = cmd >= 'a';
    const c = cmd.toUpperCase();
    const ox = rel ? x : 0, oy = rel ? y : 0;
    if (c === 'Z') {
      x = sx; y = sy;
    } else if (c === 'M' || c === 'L') {
      x = ox + num(); y = oy + num(); at(x, y);
      // a second coordinate pair after M continues as a line, per the spec
      if (c === 'M') { sx = x; sy = y; cmd = rel ? 'l' : 'L'; }
    } else if (c === 'H') {
      x = ox + num(); at(x, y);
    } else if (c === 'V') {
      y = oy + num(); at(x, y);
    } else if (c === 'C' || c === 'Q') {
      const q = c === 'Q';
      const ax = ox + num(), ay = oy + num();
      const bx = q ? ax : ox + num(), by = q ? ay : oy + num();
      const nx = ox + num(), ny = oy + num();
      for (let k = 1; k <= 32; k++) {
        const u = 1 - k / 32, v = k / 32;
        at(
          u * u * u * x + 3 * u * u * v * ax + 3 * u * v * v * bx + v * v * v * nx,
          u * u * u * y + 3 * u * u * v * ay + 3 * u * v * v * by + v * v * v * ny
        );
      }
      x = nx; y = ny;
    } else if (c === 'A') {
      const rr = Math.max(Math.abs(num()), Math.abs(num()));
      num(); num(); num();
      const nx = ox + num(), ny = oy + num();
      at((x + nx) / 2, (y + ny) / 2, 2 * rr * stretchOf(M));
      x = nx; y = ny; at(x, y);
    } else return false;
  }
  return true;
}

// Thirteen distinct massing strings exist in this whole file and four field
// radii, so the cache is a few dozen entries deep in practice; the guard is
// there so a future motif that varies continuously with `boxW` cannot turn it
// into a leak.
const SPEND = new Map();
// A tenth of the rim's own width, held back so the sliver lands INSIDE the
// field circle rather than on it: it absorbs the flattening residual (~0.003
// units at 32 steps), the corner a rounded rect does not really have, and the
// two decimal places the offset is printed to.
const RELIEF_CLEAR = 0.05;
// `rField` of 0 means "not on a disc": the $1 note has no field circle, and
// nothing on it is bounded by one.
function fitOff(o, solid, rField) {
  if (!rField) return o;
  const key = rField + '|' + solid;
  let t = SPEND.get(key);
  if (t === undefined) {
    if (SPEND.size > 64) SPEND.clear();
    t = spendOf(solid, rField - RELIEF_CLEAR);
    SPEND.set(key, t);
  }
  return n2(Math.max(0, Math.min(o, t / Math.SQRT2)));
}

// `solid` is the motif's outer massing — fills only, no per-shape colours,
// so all three copies can be tinted by the parent <g>. `detail` is whatever
// is drawn INSIDE it (a dark colonnade recess, a lit column edge, a window)
// and carries its own colours, so it goes on last and untouched.
//
// At `icon` tier the whole motif is already filled in `deep` for contrast
// against the field, so a dark shadow under a dark shape would only fatten
// it. It keeps the lit edge, which is the half of the effect that still
// works at 20px, and drops the other.
//
// `rField` is the field circle this massing is being struck inside, and it is
// what stops the offset copy from printing on the rim. Omitted where there is
// no field circle to respect (the $1 note).
function struck(solid, p, tier, boxW, detail = '', rField = 0) {
  const o = fitOff(reliefOff(boxW), solid, rField);
  if (tier === 'icon') {
    return `<g fill="#ffffff" opacity="0.5" transform="translate(${-o} ${-o})">${solid}</g>
      <g fill="${p.deep}">${solid}</g>${detail}`;
  }
  return `<g fill="#ffffff" opacity="0.42" transform="translate(${-o} ${-o})">${solid}</g>
    <g fill="${p.deep}">${solid}</g>
    <g fill="${p.motif}">${solid}</g>${detail}`;
}

// A LIT TOP EDGE and a SHADOWED UNDERSIDE, for the horizontal slabs both
// buildings are made of. The union of a stack of steps has no interior
// edges at all — without these two lines a flight of steps is one grey
// ramp, which is most of what "gutted" meant on the penny.
const ledge = (x0, x1, y, op = 0.45) =>
  `<rect x="${n2(x0)}" y="${n2(y)}" width="${n2(x1 - x0)}" height="0.7" fill="#ffffff" opacity="${op}"/>`;
const shade = (x0, x1, y, p, op = 0.55) =>
  `<rect x="${n2(x0)}" y="${n2(y)}" width="${n2(x1 - x0)}" height="0.9" fill="${p.deep}" opacity="${op}"/>`;

// A COLONNADE, and the polarity is the point. The previous pass cut
// field-coloured slots out of a solid block, which makes the gaps between
// the columns the BRIGHTEST thing on the building. On the real cent and the
// real nickel the gaps are the deepest cut in the die and sit in full
// shadow, while the column shafts catch the light. So: a dark recess, then
// lit shafts standing in front of it, each with a highlight down its
// leading edge — which is also, at no extra cost, what fluting looks like.
function columns(centres, w, y0, y1, p, fine) {
  const h = n2(y1 - y0);
  return centres
    .map(
      (cx) =>
        `<rect x="${n2(cx - w / 2)}" y="${n2(y0)}" width="${n2(w)}" height="${h}" fill="${p.motif}"/>` +
        (fine
          ? `<rect x="${n2(cx - w / 2)}" y="${n2(y0)}" width="0.75" height="${h}" fill="#ffffff" opacity="0.55"/>`
          : '')
    )
    .join('');
}

// Evenly spaced column centres between two inner edges, with an optional
// WIDER CENTRE BAY — the Memorial needs one for the seated figure and
// Monticello needs one for its door, and on both real coins that bay is
// visibly wider than the rest.
function bayCentres(x0, x1, n, gapAtCentre = 0) {
  if (!gapAtCentre) {
    const pitch = (x1 - x0) / n;
    return Array.from({ length: n }, (_, i) => x0 + pitch * (i + 0.5));
  }
  const half = n / 2;
  const mid = (x0 + x1) / 2;
  const w = mid - gapAtCentre / 2 - x0;
  const pitch = w / half;
  const left = Array.from({ length: half }, (_, i) => x0 + pitch * (i + 0.5));
  return [...left, ...left.map((c) => 2 * mid - c).reverse()];
}

// ────────────────────────────────────────────────────────────── the edge
//
// EDGE TREATMENT IS THE ONE THING A CHILD CAN CHECK WITH A FINGERTIP on a
// coin in their own hand, which is the standard this whole file is held to:
// not "recognises our drawing" but "picks the right coin out of real
// change". It is also perfectly binary and perfectly true —
//
//   penny, nickel    SMOOTH edge
//   dime, quarter    REEDED edge (118 and 119 milled ridges)
//
// so it is drawn as the OUTLINE ITSELF. The disc of a reeded coin is a
// toothed polygon, not a circle, and the teeth are stroked in the rim colour
// along with the rest of the contour. Two reasons that beats the previous
// pass's radial ticks inside the rim band: the CONTOUR is the last thing to
// survive a downscale (interior ticks are the first), and a toothed
// silhouette cannot be misread as a decorative bezel — 18 fat ticks on the
// quarter looked like a watch face.
//
// Tooth PITCH is held near 6.5 device px and tooth DEPTH near 1.3 device px
// at EVERY size, so the same treatment reads the same way on a 190px
// teaching card and on a 26px wallet chip, instead of turning into a bottle
// cap at one end and fog at the other.
//
// `field` is the radius of the raised inner circle, and therefore the rim
// width. It is now the SAME on all four coins, because it is the same on all
// four real coins: an earlier version gave the nickel a broad flat rim and
// the penny none at all, which told OUR discs apart and would tell a child
// nothing about the change in their hand. It widens a little at icon tier
// because a 6-unit ring on a 20px disc is a pixel of mud.
const REEDED = { dime: true, quarter: true };

const EDGE = {
  penny: { field: { full: 41.0, mid: 40.5, icon: 42.5 } },
  nickel: { field: { full: 41.0, mid: 40.5, icon: 42.5 } },
  dime: { field: { full: 41.0, mid: 40.5, icon: 42.5 } },
  quarter: { field: { full: 41.0, mid: 40.5, icon: 42.5 } },
};

// Tooth count and depth for a disc `boxW` px across. Count is capped at 64
// because the string cost is three coordinate pairs per tooth and a screen
// inlines a dozen coins; 64 teeth on a 190px disc is a 9px pitch, which is
// still unmistakably "ridged" and not "fuzzy".
// Pitch near 4.6 device px, depth near 0.9. Both numbers came down twice: at
// a 6.5px pitch and a 2.3px depth the quarter was a bottle cap — 56 fat
// scallops the eye reads as a decorative flower rather than as machining —
// and even once it was fine enough to read as milling it was still SHOUTING,
// which is wrong for a fact that on the real object is nearly invisible
// face-on. It is a whisper now. It is here to be true, not to be the answer.
function reedGeom(boxW) {
  const n = Math.max(16, Math.min(96, Math.round((Math.PI * boxW) / 4.6)));
  const depth = Math.min(3.2, Math.max(0.6, 90 / boxW));
  return { n, depth };
}

// A milled contour: crests at radius R with a V notch cut between each pair.
// Straight segments, not curves — a quadratic dip reads as a soft scallop
// (a flower), and reeding is machined, so it wants corners. Two points per
// tooth and one decimal place, because this string is emitted for every
// reeded coin on the screen and a teaching card draws four of them.
function reededPath(n, R, depth) {
  const step = 360 / n;
  const at = (r, deg) => {
    const a = (deg * Math.PI) / 180;
    return `${n1(50 + r * Math.cos(a))} ${n1(50 + r * Math.sin(a))}`;
  };
  let d = `M ${at(R, 0)}`;
  for (let i = 0; i < n; i++) {
    const a = i * step;
    d += ` L ${at(R - depth, a + step * 0.5)} L ${at(R, a + step)}`;
  }
  return `${d} Z`;
}

// The coin's outer silhouette, as an un-terminated element so the caller can
// hang either a fill or a stroke on it. Reeded at every tier — the edge is
// the identity channel that costs the fewest pixels, so it is the last one
// that should ever be dropped.
function outlineOf(id, boxW) {
  if (!REEDED[id]) return '<circle cx="50" cy="50" r="47"';
  const { n, depth } = reedGeom(boxW);
  return `<path d="${reededPath(n, 47, depth)}"`;
}

// ─────────────────────────────────────────────────────── arced inscription
//
// Set one glyph at a time rather than with <textPath>, because a textPath
// needs an `id` and a hundred inlined coins on one screen would collide on
// it. Per-glyph also makes the orientation impossible to get wrong — the
// classic failure is an arc that renders the words upside down along the
// bottom, because in SVG angle 0 is +x and angle grows DOWNWARD, so the TOP
// of the circle is 270°, not 90°.
//
// `r` is the BASELINE radius. At the top of a circle "up" points away from
// the centre, so the glyphs grow outward from `r`; callers pass the inner
// edge of the band they want filled.
// `centre` is the angle the middle of the word sits at, in SVG degrees
// (270 = top). It is a per-coin number rather than a constant because the
// four real coins put their words in four different places, and that is one
// more true, checkable difference: LIBERTY runs across the TOP of a quarter,
// down the LEFT of a dime and down the RIGHT of a nickel, while a penny has
// IN GOD WE TRUST over the top instead.
// `rev` runs the word the other way round the circle and flips each glyph, so
// text along the BOTTOM of a coin reads the right way up (as a date does on a
// quarter) and text up the LEFT side reads upward (as IN GOD WE TRUST does on
// a nickel). Getting this wrong is not a subtle error: it is the difference
// between a coin and a coin printed upside down.
function arcText(text, r, size, fill, opacity, centre = 270, rev = false) {
  const advance = size * 0.82; // rounded sans, caps, at the letter-spacing below
  const perGlyph = ((advance / r) * (180 / Math.PI)) * (rev ? -1 : 1);
  const start = centre - (perGlyph * (text.length - 1)) / 2;
  let out = `<g font-family="${FONT}" font-size="${size}" font-weight="700" fill="${fill}" opacity="${opacity}" text-anchor="middle">`;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === ' ') continue;
    const deg = start + perGlyph * i;
    const a = (deg * Math.PI) / 180;
    out += `<text transform="translate(${n2(50 + r * Math.cos(a))} ${n2(50 + r * Math.sin(a))}) rotate(${n1(deg + (rev ? -90 : 90))})">${ch}</text>`;
  }
  return `${out}</g>`;
}

// Straight text, for the words a real obverse does NOT arc — LIBERTY on the
// cent, IN GOD WE TRUST on the dime and the quarter, and three of the four
// dates.
function flatText(text, x, y, size, fill, opacity) {
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="${FONT}"
    font-size="${size}" font-weight="700" fill="${fill}" opacity="${opacity}">${text}</text>`;
}

// ──────────────────────────────────────────────────────────── the portrait
//
// Drawn, never photographed. The DESIGNS are public domain (US government
// works, and every one used here predates the 1989 copyright-notice change),
// but a photograph of a coin is a SEPARATE copyright from the design and the
// Mint's own photographs are reserved by its contractor — so every curve
// below is hand-placed. That also keeps src/art/ATTRIBUTION.md's "all
// original art" true and keeps the app fully vector, which for an offline
// PWA is the difference between a 4kB face and a bitmap set.
//
// Authored facing RIGHT, origin behind the eye at the top of the ear;
// `dir = -1` mirrors it to face left. That is not decoration: the Lincoln
// cent is the ONLY circulating US coin whose portrait faces right, so
// direction is a real, checkable difference a child can be taught.
//
// ─────────────────────────────────────────────────────────────────────────
// WHY EACH MAN GETS HIS OWN OUTLINE, AND NOT JUST HIS OWN HAIRDO
// ─────────────────────────────────────────────────────────────────────────
// The previous pass shared ONE face curve between all four and swapped only
// the back of the head. Its own verdict was that the four portraits still
// resembled each other more than they resembled their men, and it was right:
// a shared profile means a shared silhouette, and the silhouette is all that
// is left once the drawing shrinks.
//
// Worse, wave 1 shows ONE COIN, ALONE — `coinRow(q.coins, 84)` in
// src/screens/money.js — so there is no sibling next to it and RELATIVE SIZE
// TELLS THE CHILD NOTHING. A lone silver disc has to be namable as a dime
// and not a quarter from its own drawing.
//
// So each head below is a complete closed path, and the four differ where
// the difference survives shrinking — in the OUTLINE:
//
//   Lincoln     the only one FACING RIGHT; a full BEARD hanging a third of
//   (cent)      a head below the chin; a tall bare forehead under a wavy
//               mass of hair that rises ABOVE the crown; coat and bow tie.
//   Jefferson   a big smooth hair mass sweeping BACK and DOWN past the
//   (nickel)    nape, then a QUEUE that hangs on down over a high-collared
//               COAT and finishes in a ribbon bow. No beard.
//   Roosevelt   modern. Hair cropped tight to the skull, so the back of the
//   (dime)      head is a small smooth curve with nothing protruding
//               anywhere; a big plain EAR; a heavy square jaw; bare neck.
//   Washington  a WIG: the back contour is SCALLOPED into three rolled
//   (quarter)   curls, and a ribboned queue hangs clear of the bare neck
//               behind it. Eighteenth century at a glance.
//
// Beard / queue-and-coat / bare crop / scalloped wig is four different
// outlines. Squint at any one of them and the answer is still there.
//
// WARMTH, kept from the previous pass because it was hard won: the nose ROOT
// is a shallow curve and not a notch (a notch is a bite mark), the nose TIP
// is rounded over (a corner is a hatchet), and there is NO dark mark
// anywhere on the cheek (a dark crescent beside an eye reads as a socket,
// which is what made an early attempt look like a skull). Roundness comes
// from LIGHT relief marks, which is also how a struck coin catches light.
//
// PROPORTION, and this is where the second pass was most wrong. Held against
// the photographs, every head in the first version was a NARROW OVAL: nose
// to back of skull came to about two thirds of crown to chin. On a real
// profile with hair on it that measurement is close to 1 — a dime's
// Roosevelt is actually WIDER than he is tall, because the hair sweeps back
// past the skull. The ear was in the wrong place for the same reason. On the
// real coins the eye sits roughly a quarter of the way back from the nose
// and the ear about seven tenths of the way back; the first version had the
// ear at four tenths, which is what made four different men all read as the
// same long-faced mannequin.
//
// So, in the local frame used below: the nose reaches x ≈ +23, the forehead
// is held back near x ≈ +15, the EYE sits at x ≈ +6, the EAR at x ≈ −11 to
// −17 depending on the head, and the back of the skull runs out to x ≈ −27
// (Washington, whose wig is tall rather than deep) through −38 (Jefferson
// and Roosevelt, whose hair sweeps furthest back). Crown at y ≈ −33, chin at
// y ≈ +30.
const HEAD = {
  // LINCOLN, AND THIS ONE IS MEASURED. The outline below is a curve fitted to
  // the portrait's own silhouette, taken off coloringbook/ref/penny-obv-2.jpg
  // (a 2002-S cameo proof, whose FROSTED bust sits between a mirror field that
  // reflects pure black on the profile side and pure white behind the head, so
  // a band threshold separates them where no level threshold can — copper on
  // copper has no level step at all) and registered by similarity ICP onto
  // ref/penny-obv-3.jpg, a 2000px photograph whose disc is circular to 0.26%.
  // The same contour fits a 1909-S and a 2025 cent with no bias at 0.56% and
  // 0.64% of diameter, which is the evidence that it is the DESIGN and not one
  // strike. Frozen target and score in coloringbook/ (gitignored):
  // head-region silhouette IoU 0.667 -> 0.952.
  //
  // What the measuring found, against the version before it:
  //
  //   · THE HEAD WAS 20% TOO SMALL. `s` went 0.65 -> 0.78, and placement
  //     alone — path untouched — was 56% of the whole error.
  //   · Lincoln really is the NARROW one: 45.0 wide by 58.3 tall, 0.77 as
  //     wide as tall, where the dime's Roosevelt is wider than he is tall.
  //     That much the old comment had right.
  //   · THE FACE PROJECTED TOO FAR. The old nose reached local x = +23.9 on a
  //     head 51 wide; the coin's profile turns over at +18.0 on a head 45
  //     wide, and the brow above it stands FURTHER forward than we drew it.
  //     A long thin nose on a shallow face is the loudest error the
  //     difference map showed.
  //   · THE BEARD WAS ENORMOUS. It hung to local y = +35 where the coin's
  //     underside is a silhouette edge only down to y = +21, and its front
  //     reached +18.7 where the coin's chin tuft turns at +15.2.
  //   · The crown is HIGH — 0.788 of the disc radius above centre, four units
  //     inside the field circle — and it is hair, not skull.
  //
  // Below local y = +21 the beard stops overhanging and the boundary becomes
  // the throat, so the last stretch of this path (the underside, from
  // (5.9, 20.9) back to (-20.4, 18.0)) is NOT from the frozen mask: it is read
  // off the photograph's own shadow line, and it is the least-measured part of
  // this outline. It also has to overlap the top of bareNeck(), or a sliver of
  // bare field shows between the head and the neck.
  Lincoln: [
    'M -20.39 18 C -20.53 16.24 -18.85 13.84 -19.03 11.99',
    'C -19.19 10.32 -20.16 8.13 -21.07 7.36',
    'C -21.66 6.86 -22.72 7.26 -23.12 6.84 C -23.51 6.43 -23.24 5.7 -23.5 4.89',
    'C -23.96 3.41 -25.59 0.85 -26.18 -1.16',
    'C -26.72 -3.01 -27.25 -5.15 -27.05 -6.68',
    'C -26.89 -7.84 -25.98 -8.41 -25.72 -9.64',
    'C -25.33 -11.41 -26.18 -14.33 -25.67 -16.47',
    'C -25.17 -18.57 -23.88 -20.45 -22.76 -22.36',
    'C -21.61 -24.33 -20.34 -26.7 -18.84 -28.1',
    'C -17.6 -29.27 -16.05 -29.65 -14.72 -30.55',
    'C -13.37 -31.46 -11.93 -32.97 -10.78 -33.53',
    'C -10.04 -33.88 -9.65 -33.93 -8.77 -34.04',
    'C -7.18 -34.24 -4.15 -34.36 -1.93 -34.01',
    'C 0.26 -33.68 2.55 -32.61 4.46 -32.03',
    'C 6.01 -31.55 7.3 -31.45 8.69 -30.74',
    'C 10.32 -29.9 12.99 -28.59 13.5 -27.05',
    'C 13.98 -25.6 12.67 -22.92 12.03 -21.87',
    'C 11.68 -21.29 10.96 -21.33 10.82 -20.74',
    'C 10.57 -19.64 12.31 -17.14 12.96 -15.21',
    'C 13.66 -13.16 14.03 -10.84 14.87 -8.78',
    'C 15.71 -6.73 18.19 -4.58 17.99 -2.89 C 17.82 -1.4 15.28 -0.54 14.63 0.95',
    'C 13.98 2.46 14.08 4.31 14.14 6.15 C 14.19 8.22 15.54 10.81 15.15 12.77',
    'C 14.8 14.56 13.67 16.33 12.3 17.51 C 10.84 18.76 8.36 18.92 6.51 19.89',
    'C 4.62 20.89 3.04 22.71 1.07 23.44 C -0.86 24.16 -3.02 24.2 -5.16 24.28',
    'C -7.41 24.37 -9.84 24.28 -12.12 23.88',
    'C -14.4 23.48 -17.47 23.14 -18.83 21.9',
    'C -19.88 20.95 -20.28 19.46 -20.39 18 Z',
  ].join(' '),

  // JEFFERSON. One big smooth hair mass — no crests, unlike Lincoln, and no
  // scallops, unlike Washington — reaching further back at eye level than
  // any other head here and then sweeping DOWN to the nape. The queue and
  // the ribbon are in TAIL below, because they hang past the head and over
  // the coat.
  Jefferson: [
    'M 10.09 25.93 C 10.81 25.47 11 24.7 11.19 24.05',
    'C 11.37 23.45 10.96 22.6 11.3 22.19 C 11.66 21.73 12.56 21.9 13.49 21.6',
    'C 15.2 21.05 19.34 20.27 20.67 18.86 C 21.64 17.84 21.93 16.27 21.9 15.01',
    'C 21.86 13.78 20.83 12.76 20.53 11.39 C 20.17 9.73 19.67 7.47 20.15 5.69',
    'C 20.64 3.85 23.62 1.85 23.61 0.57 C 23.6 -0.21 22.93 -0.53 22.32 -1.29',
    'C 21.18 -2.69 17.74 -5.03 17 -6.93 C 16.45 -8.33 17.2 -9.86 17.03 -11.15',
    'C 16.87 -12.29 16.63 -13.18 16.12 -14.3 C 15.43 -15.8 14 -17.4 12.94 -19.18',
    'C 11.73 -21.23 10.77 -23.99 9.32 -25.96 C 7.98 -27.78 6.47 -29.34 4.68 -30.66',
    'C 2.82 -32.05 0.57 -33.27 -1.7 -34.02 C -4.01 -34.78 -6.59 -35 -9.1 -35.15',
    'C -11.64 -35.31 -14.56 -35.56 -16.85 -34.93',
    'C -18.92 -34.35 -20.57 -33.1 -22.35 -31.83',
    'C -24.31 -30.44 -26.66 -28.81 -28.02 -26.82',
    'C -29.35 -24.9 -29.7 -22.42 -30.52 -20.17',
    'C -31.35 -17.87 -32.25 -15.45 -32.99 -13.18',
    'C -33.68 -11.04 -34.33 -9.06 -34.83 -6.91',
    'C -35.35 -4.69 -36.06 -2.14 -36.01 -0.03 C -35.97 1.76 -35.51 3.2 -34.93 4.94',
    'C -34.24 7.01 -32.41 9.16 -31.9 11.48',
    'C -31.38 13.86 -31.42 17.43 -31.92 19.05',
    'C -32.19 19.93 -32.61 20.19 -33.18 20.88',
    'C -34.05 21.95 -36.4 23.2 -36.82 24.67',
    'C -37.23 26.1 -36.87 28.56 -35.81 29.56',
    'C -34.6 30.7 -31.65 30.41 -29.39 30.51',
    'C -26.88 30.62 -24.07 30.3 -21.41 30.06',
    'C -18.74 29.83 -16.04 29.49 -13.42 29.09 C -10.84 28.7 -8.38 28.1 -5.8 27.7',
    'C -3.18 27.28 -0.48 26.92 2.18 26.63 C 4.82 26.34 8.72 26.79 10.09 25.93 Z',
  ].join(' '),

  // ROOSEVELT, and this one is MEASURED rather than styled. The outline below
  // is a curve fitted to the portrait's own silhouette, segmented from
  // coloringbook/ref/dime-obv-2.jpg — a 2015-W proof whose frosted bust sits
  // on a uniformly black mirror field, so the edge of the portrait is not a
  // judgement call. That photograph's disc is circular to ±0.5px on a radius
  // of 470, i.e. it was shot square on, which is why it replaced the original
  // reference: dime-obv.jpg is tilted about 8° out of plane (its disc is an
  // ellipse, axis ratio 1.010) and every earlier number taken off it carried
  // that tilt. One linear map takes that photograph to the frame below —
  // local = 46.19 − 0.1031·px across and 0.1031·py − 44.18 down — which is
  // why the numbers are not round.
  //
  // The frozen target and the score are in coloringbook/ (gitignored):
  // silhouette IoU against the traced mask is 0.981, up from 0.867.
  // What the measuring found, against the version before it:
  //
  //   · the head is WIDER THAN TALL. Crown to chin is 58.6% of the coin's
  //     diameter; nose to the back of the hair is 62.3%; crown to the point
  //     of the truncation is 76.1%.
  //   · THE THROAT WAS THE BIG ERROR — nine units too far forward. The real
  //     underside of the jaw runs BACK almost horizontally from the chin,
  //     and the front of the bust then drops almost VERTICALLY to a sharp
  //     point. The old path ran that whole distance as one diagonal, which
  //     put a wedge of silver under the chin that the coin does not have.
  //   · the FOREHEAD sits further forward and the CHIN further back than the
  //     old path had them, and the back of the skull is not as deep: the
  //     widest point is x ≈ −34.7, where it used to be −37.7.
  //   · IT IS A BUST, not a head with a stalk. But — and the previous pass
  //     had this right — there are NO SHOULDERS on a dime and the bust does
  //     NOT run off the rim. The neck ends in a straight TRUNCATION that
  //     stops clear of the field, cut at about 37° and rising toward the
  //     nape: low point under the throat, high corner behind the neck. That
  //     angled cut is most of what makes the bottom of a real dime look the
  //     way it does, and it is why the truncation is part of THIS path
  //     rather than of the shared bareNeck() the quarter uses. The
  //     photograph's own cut bows off straight by at most 0.9 units over its
  //     36-unit run, so drawing it straight is a simplification the coin can
  //     carry.
  //   · the hair is a MASS with a hairline, not a cap. The outline runs
  //     forward over the brow into a lock that overhangs the forehead —
  //     the crown of the coin is hair, and it comes within about four
  //     units of the field circle.
  //
  // Order: the hairline at the temple, down the face, under the chin, down
  // the throat to the point of the truncation, the straight cut back, up
  // the nape, round the back of the skull and over the crown to the lock
  // that closes on the hairline again.
  Roosevelt: [
    'M 10.37 -28.04', // hairline meets the profile, high on the forehead
    'C 11.31 -25.66 12.14 -23.26 13.19 -20.9', // the forehead, sloping
    'C 14.26 -18.5 15.8 -16.23 16.74 -13.76', // FORWARD as it comes down
    'C 17.67 -11.29 18.21 -8.05 18.8 -6.07', // the BROW, and it projects
    'C 19.17 -4.8 19.37 -3.95 19.81 -2.98', // the nose root, a shallow
    'C 20.24 -2.02 20.76 -1.29 21.39 -0.25', // curve and never a notch
    'C 22.25 1.17 24.05 3.38 24.55 4.74', // the bridge, straight and long
    'C 24.86 5.56 25.12 6.35 24.87 6.87', // the tip, rounded over
    'C 24.63 7.35 23.81 7.53 23.21 7.79', // the nostril wing
    'C 22.57 8.06 21.65 8.03 21.12 8.43',
    'C 20.62 8.81 20.29 9.45 20.06 10.06', // philtrum
    'C 19.82 10.71 19.81 11.34 19.74 12.23', // upper lip
    'C 19.63 13.67 19.68 16.11 19.7 17.87', // the mouth line and the lower
    'C 19.72 19.43 20.1 21.32 19.83 22.28', // lip, fuller than the upper
    'C 19.67 22.82 19.44 23.1 19.07 23.43', // the CHIN
    'C 18.61 23.84 17.81 24.31 17.13 24.4',
    'C 16.45 24.5 15.53 23.81 14.98 23.99', // the underside of the JAW, and
    'C 14.54 24.13 14.42 24.65 14.01 25.04', // it runs almost straight BACK
    'C 13.39 25.61 12.43 26.52 11.54 27.01', // rather than falling away
    'C 10.7 27.47 9.96 27.52 8.84 27.92',
    'C 6.98 28.58 2.63 29.52 1.45 30.69', // the throat
    'C 0.82 31.3 0.98 31.86 0.65 32.73', // and then the front of the bust
    'C 0.08 34.26 -1.12 37.47 -1.64 39.06', // drops nearly VERTICALLY
    'C -1.95 40 -2.09 40.58 -2.31 41.34', // to the point of the truncation
    'L -31.49 19.07', // THE CUT — straight, ~37°, and clear of the field
    'C -30.83 16.52 -29.44 12.82 -29.51 11.43', // up the back of the neck
    'C -29.54 10.9 -29.76 10.82 -29.91 10.34',
    'C -30.19 9.44 -30.73 7.54 -30.93 6.44', // the nape
    'C -31.07 5.65 -30.92 5.05 -31.13 4.39',
    'C -31.34 3.71 -31.81 3.31 -32.2 2.41',
    'C -32.93 0.75 -34.59 -3.19 -34.72 -5.01', // the widest point of the head
    'C -34.8 -6.03 -34.45 -6.5 -34.27 -7.45',
    'C -34.02 -8.76 -33.82 -10.44 -33.34 -12.17',
    'C -32.73 -14.39 -31.67 -17.95 -30.67 -19.63',
    'C -30.07 -20.65 -29.51 -21.01 -28.74 -21.79',
    'C -27.74 -22.82 -26.39 -24.03 -25.11 -25.17',
    'C -23.71 -26.42 -21.98 -28.17 -20.65 -29',
    'C -19.74 -29.57 -19.04 -29.75 -18.14 -30.1',
    'C -17.12 -30.49 -16.18 -30.93 -14.82 -31.19',
    'C -12.79 -31.58 -9.56 -31.58 -7.02 -31.63', // the crown, four units
    'C -4.59 -31.69 -1.66 -31.73 0.1 -31.55', // inside the field circle
    'C 1.15 -31.44 1.77 -31.32 2.6 -31.06',
    'C 3.48 -30.79 4.21 -30.36 5.24 -29.95', // and forward into the front
    'C 6.66 -29.38 8.66 -28.68 10.37 -28.04 Z', // lock over the forehead
  ].join(' '),

  // WASHINGTON, AND THIS ONE IS MEASURED. The outline below is a curve fitted
  // to the bust's own silhouette taken off coloringbook/ref/quarter-obv-2.jpg
  // (a 1994-P quarter, 750px, whose disc fits a circle to 0.06% — ellipse
  // ratio 1.00063 — with a p95 residual of 0.17% of R). Silver on silver has
  // no level step at all, so the bust was segmented on the ENERGY of its
  // boundary rather than on brightness: |grad I| is large whether the die's
  // edge reads as a dark trough (shaded side) or a bright rim (lit side), and
  // the bare field of a struck coin is neither. Every traced point was then
  // moved along its own normal to the crest of that ridge. The same contour
  // fits a 1944 quarter to 0.77% of diameter and the 1999+ state-quarter
  // obverse to 0.74%, which is the evidence that it is the DESIGN. Frozen
  // target and score in coloringbook/ (gitignored): bust silhouette IoU
  // 0.695 -> 0.958.
  //
  // What the measuring found, against the version before it:
  //
  //   · THE HEAD WAS IN THE WRONG PLACE. `cx` 5.4 -> -0.4 and `cy` 47.5 ->
  //     41.8 — nearly six units back and six units low — and placement alone,
  //     path untouched, was 44% of the whole error.
  //   · THE BUST HAS A TRUNCATION. It ends in a long shallow cut running from
  //     (8, 39) at the throat back to (-26, 37) under the bow, clear of the
  //     rim, exactly as the dime's does. We drew a neck that ran off the
  //     bottom of the field, so `cut: true` now applies here too.
  //   · THE QUEUE AND THE BOW ARE PART OF THE OUTLINE, not three ellipses
  //     hung off the back. §11.6 on the nickel: if two masses are continuous
  //     on the coin, draw them as one path, because a separate shape carries
  //     a separate stroke and a stroke is a seam.
  //   · Washington is the WIDE one — 53.0 across by 74.5 tall counting the
  //     bow, 0.71 as wide as tall, and the wig reaches x = -27 at eye level.
  //   · The crown is at y = -30.9 and the nose turns over at +22.5, a face
  //     that projects LESS than the old +24.2 on a head that is wider.
  Washington: [
    'M 2.11 -27.61 C 0.45 -27.73 -1.53 -27.68 -3.12 -27.22',
    'C -4.59 -26.79 -5.9 -25.44 -7.12 -25.07',
    'C -8.03 -24.79 -8.73 -24.84 -9.66 -24.81',
    'C -10.77 -24.79 -12.19 -25.42 -13.34 -24.99',
    'C -14.72 -24.46 -15.97 -22.68 -17.16 -21.24',
    'C -18.48 -19.66 -19.88 -17.67 -20.84 -15.82',
    'C -21.73 -14.11 -22.32 -12.39 -22.83 -10.56',
    'C -23.36 -8.69 -23.48 -6.67 -23.93 -4.72',
    'C -24.39 -2.73 -25.29 -0.77 -25.59 1.23',
    'C -25.89 3.21 -26.28 5.43 -25.76 7.21',
    'C -25.25 8.92 -23.31 10.08 -22.63 11.73',
    'C -21.94 13.4 -21.59 15.39 -21.63 17.17',
    'C -21.68 18.89 -21.91 21.32 -22.84 22.25',
    'C -23.58 22.98 -25.03 23.05 -26.06 23',
    'C -27.06 22.95 -28.27 21.82 -28.97 22.04',
    'C -29.52 22.2 -29.94 22.97 -30.12 23.55',
    'C -30.31 24.15 -30.11 24.75 -30.05 25.6',
    'C -29.96 27 -30.07 29.38 -29.52 31.14',
    'C -28.96 32.95 -28.12 35.06 -26.64 36.29',
    'C -25.01 37.64 -22.17 37.79 -19.88 38.58',
    'C -17.5 39.41 -14.9 40.43 -12.6 41.16',
    'C -10.58 41.8 -8.8 42.41 -6.82 42.78',
    'C -4.81 43.17 -2.68 43.32 -0.63 43.42 C 1.4 43.51 3.84 44.09 5.42 43.34',
    'C 6.86 42.65 8.54 40.84 8.65 39.45 C 8.77 38.05 6.31 36.47 6.04 34.96',
    'C 5.8 33.62 6.48 32.39 6.75 30.91 C 7.08 29.09 7.01 26.55 7.9 24.84',
    'C 8.75 23.2 10.27 21.81 11.84 20.79 C 13.47 19.72 16.25 19.83 17.58 18.63',
    'C 18.76 17.57 19.35 15.91 19.75 14.33 C 20.18 12.6 19.46 10.46 19.89 8.62',
    'C 20.34 6.74 22.41 4.96 22.47 3.17 C 22.53 1.49 21.18 -0.06 20.5 -1.81',
    'C 19.75 -3.74 18.9 -5.92 18.17 -7.93',
    'C 17.46 -9.86 16.97 -11.8 16.16 -13.65',
    'C 15.35 -15.5 14.3 -17.29 13.3 -19.03',
    'C 12.32 -20.73 11.44 -22.67 10.22 -23.97',
    'C 9.15 -25.12 7.9 -26 6.55 -26.61 C 5.2 -27.22 3.66 -27.5 2.11 -27.61 Z',
  ].join(' '),
};

// ─────────────────────────────────────────────────────────────────────────
// THE HAIR, AS ITS OWN SHAPE
// ─────────────────────────────────────────────────────────────────────────
// A head drawn as one flat fill is an egg with a nose on it. That is not a
// stylistic complaint: without a hairline there is no forehead, and without a
// forehead the four men lose the proportion that makes each of them himself —
// Lincoln's forehead is enormous, Roosevelt's is short under a wave, and
// Washington's disappears under a wig.
//
// So the hair is a SECOND, DARKER shape laid over the head. Each one shares
// its outer edge with the head outline exactly (the same control points, run
// backwards) and closes along the hairline, which means the two can never
// drift apart. Two flat tones is also what the real object does: hair is cut
// deep into the die and sits in shadow while the cheek catches the light.
//
// It is drawn at `full` AND `mid`, not just `full` — mid is the 54px coin
// row, and a tone block survives 54px where a stroked hairline does not.
const HAIR = {
  // The hairline is the boundary between the textured hair mass and the smooth
  // forehead and temple, read off ref/penny-obv-3.jpg in this local frame. It
  // runs from the outline at (12.6, -27.6) diagonally back and down to a
  // SIDEBURN that comes forward of the ear and drops to (-16.0, 12.4), where
  // the beard takes over. Outer edge shared with the head outline exactly —
  // the head's OWN knots, run backwards, not a second smoothing of the same
  // contour (that put the nickel's hair 1.2 units outside its own head).
  Lincoln: [
    'M 13.5 -27.05 C 13.58 -28.17 10.32 -29.9 8.69 -30.74',
    'C 7.3 -31.45 6.01 -31.55 4.46 -32.03',
    'C 2.55 -32.61 0.26 -33.68 -1.93 -34.01',
    'C -4.15 -34.36 -7.18 -34.24 -8.77 -34.04',
    'C -9.65 -33.93 -10.04 -33.88 -10.78 -33.53',
    'C -11.93 -32.97 -13.37 -31.46 -14.72 -30.55',
    'C -16.05 -29.65 -17.6 -29.27 -18.84 -28.1',
    'C -20.34 -26.7 -21.61 -24.33 -22.76 -22.36',
    'C -23.88 -20.45 -25.17 -18.57 -25.67 -16.47',
    'C -26.18 -14.33 -25.33 -11.41 -25.72 -9.64',
    'C -25.98 -8.41 -26.89 -7.84 -27.05 -6.68',
    'C -27.25 -5.15 -26.72 -3.01 -26.18 -1.16',
    'C -25.59 0.85 -23.96 3.41 -23.5 4.89 C -23.24 5.7 -23.51 6.43 -23.12 6.84',
    'C -22.72 7.26 -21.66 6.86 -21.07 7.36',
    'C -20.16 8.13 -19.54 12.05 -19.03 11.99',
    'C -18.53 11.94 -18.05 8.82 -18.02 7.12',
    'C -17.99 5.27 -18.95 2.83 -19.05 1.3',
    'C -19.11 0.32 -19.12 -0.33 -18.94 -1.14',
    'C -18.75 -1.98 -18.56 -2.87 -17.91 -3.63',
    'C -16.98 -4.7 -14.82 -5.77 -13.28 -6.38',
    'C -11.92 -6.92 -10.52 -6.62 -9.23 -7.28',
    'C -7.71 -8.08 -6.28 -9.81 -4.91 -11.21',
    'C -3.53 -12.64 -2.34 -14.3 -0.97 -15.77',
    'C 0.39 -17.25 1.78 -18.72 3.27 -20.08',
    'C 4.76 -21.44 6.29 -22.78 7.97 -23.93',
    'C 9.69 -25.11 13.41 -25.9 13.5 -27.05 Z',
  ].join(' '),
  Jefferson: [
    'M 9.32 -25.96 C 9.39 -26.03 6.47 -29.34 4.68 -30.66',
    'C 2.82 -32.05 0.57 -33.27 -1.7 -34.02 C -4.01 -34.78 -6.59 -35 -9.1 -35.15',
    'C -11.64 -35.31 -14.56 -35.56 -16.85 -34.93',
    'C -18.92 -34.35 -20.57 -33.1 -22.35 -31.83',
    'C -24.31 -30.44 -26.66 -28.81 -28.02 -26.82',
    'C -29.35 -24.9 -29.7 -22.42 -30.52 -20.17',
    'C -31.35 -17.87 -32.25 -15.45 -32.99 -13.18',
    'C -33.68 -11.04 -34.33 -9.06 -34.83 -6.91',
    'C -35.35 -4.69 -36.06 -2.14 -36.01 -0.03 C -35.97 1.76 -35.51 3.2 -34.93 4.94',
    'C -34.24 7.01 -32.41 9.16 -31.9 11.48',
    'C -31.38 13.86 -31.42 17.43 -31.92 19.05',
    'C -32.19 19.93 -32.61 20.19 -33.18 20.88',
    'C -34.05 21.95 -36.4 23.2 -36.82 24.67',
    'C -37.23 26.1 -36.87 28.56 -35.81 29.56 C -34.6 30.7 -31.6 30.52 -29.39 30.51',
    'C -27.05 30.49 -24.6 29.73 -22.13 29.33 C -19.55 28.92 -15.6 29 -14.23 28.05',
    'C -13.5 27.55 -13.25 26.95 -13.11 26.11',
    'C -12.88 24.78 -13.42 22.52 -14.11 20.67',
    'C -14.92 18.47 -17.01 16.07 -18.03 13.93',
    'C -18.9 12.11 -19.43 10.55 -20.02 8.69 C -20.67 6.62 -21.43 4.08 -21.7 2.04',
    'C -21.93 0.34 -21.78 -0.92 -21.79 -2.71',
    'C -21.82 -5.04 -22.25 -8.19 -21.79 -10.74',
    'C -21.35 -13.19 -20.55 -15.75 -19.18 -17.75',
    'C -17.81 -19.76 -15.59 -21.22 -13.57 -22.76',
    'C -11.48 -24.35 -8.95 -26.1 -6.83 -27.11',
    'C -5.13 -27.93 -3.79 -28.42 -1.97 -28.72 C 0.25 -29.08 3.94 -29.27 5.6 -28.74',
    'C 6.54 -28.44 6.96 -27.8 7.6 -27.32 C 8.2 -26.87 9.29 -25.91 9.32 -25.96 Z',
  ].join(' '),
  // ROOSEVELT'S HAIR WAS THE WORST SHAPE IN THE FILE, and the fault was not
  // texture. It was a crescent laid on the skull — a swim cap — when the
  // real thing is a MASS with three shape facts in it, all of them in the
  // silhouette and none of them a stroke:
  //
  //   · a HAIRLINE running diagonally back from a high forehead. It is the
  //     longest line on the coin and it is what gives him a forehead at all.
  //   · a SIDEBURN. The hair comes down in front of the ear and stops level
  //     with the top of it, then runs back OVER the ear, so the ear is a
  //     small thing half-buried rather than a shell stuck on a bald cheek.
  //   · the mass carries on behind the ear and only ends at the NAPE, which
  //     is where the neck starts. The old crescent stopped short of that and
  //     left a bare patch of skull behind the ear that no photograph shows.
  //
  // Outer edge shared with the head outline exactly, as the other three are.
  Roosevelt: [
    'M 10.37 -28.04', // ← head outline, run backwards from the hairline
    'C 8.66 -28.68 6.66 -29.38 5.24 -29.95',
    'C 4.21 -30.36 3.48 -30.79 2.6 -31.06',
    'C 1.77 -31.32 1.15 -31.44 0.1 -31.55',
    'C -1.66 -31.73 -4.59 -31.69 -7.02 -31.63',
    'C -9.56 -31.58 -12.79 -31.58 -14.82 -31.19',
    'C -16.18 -30.93 -17.12 -30.49 -18.14 -30.1',
    'C -19.04 -29.75 -19.74 -29.57 -20.65 -29',
    'C -21.98 -28.17 -23.71 -26.42 -25.11 -25.17',
    'C -26.39 -24.03 -27.74 -22.82 -28.74 -21.79',
    'C -29.51 -21.01 -30.07 -20.65 -30.67 -19.63',
    'C -31.67 -17.95 -32.73 -14.39 -33.34 -12.17',
    'C -33.82 -10.44 -34.02 -8.76 -34.27 -7.45',
    'C -34.45 -6.5 -34.8 -6.03 -34.72 -5.01',
    'C -34.59 -3.19 -32.93 0.75 -32.2 2.41',
    'C -31.81 3.31 -31.34 3.71 -31.13 4.39',
    'C -30.92 5.05 -31.07 5.65 -30.93 6.44', // the nape, and the hair ends there
    'C -30.1 5.86 -29.3 5.19 -28.5 4.6', // forward again along the underside
    'C -26.5 3.7 -24 2.5 -22 1.6',
    'C -20 0.7 -18.1 -0.1 -16.5 -0.6',
    'C -14.9 -1.1 -13.6 -1.6 -12.2 -1.7', // over the top of the EAR: measured
    'C -11.2 -1.4 -10.2 -0.8 -9.4 0.4', // off the photograph the helix appears
    'C -8.9 1.1 -8.5 1.4 -8.2 1.2', // only below y ≈ −2, and the mass runs on
    'C -7.9 0.6 -7.4 -0.2 -7 -0.9', // DOWN IN FRONT of it as a short SIDEBURN.
    'C -6.3 -1.2 -5.6 -2 -4.9 -2.9', // A rounded lobe: drawn as a narrow tab
    'C -4.2 -3.8 -3.5 -5.3 -2.9 -6.6', // it read as a fang hanging off the
    'C -2.3 -7.9 -1.9 -9.3 -1.3 -10.7', // temple. THE HAIRLINE, climbing
    'C -0.7 -12.1 0.1 -13.5 0.8 -15.1', // and up to a tall bare forehead
    'C 1.6 -16.6 2.3 -18.4 3.2 -20',
    'C 4.1 -21.6 5 -23.5 6.1 -24.9',
    'C 7.2 -26.3 9.3 -27.8 10 -28.4 Z',
  ].join(' '),
  // WASHINGTON'S WIG, and it is the hair mass, the queue AND the ribbon bow
  // in ONE shape, because on the coin they are one continuous form (§11.6:
  // two masses that are continuous on the object must not be two paths in the
  // same fill, or the separate stroke reads as a seam). Outer edge shared
  // with the head outline exactly — the head's OWN knots, run backwards.
  //
  // THE HAIRLINE was measured twice. Read off a crop at 2 local units per
  // grid square it came out 5-6 units too far back, which would have drawn a
  // third of the wig in the face's tone; re-read at 6 units per square it is
  // very nearly a straight line leaning forward, from (9.2, -27) at the crown
  // to (3.0, 0) beside the eye and (1.2, 8) at the front curls. The bare
  // forehead is a narrow wedge about nine units wide at the brow — Washington
  // has the least face of the four, which is what a wig does.
  //
  // Below the curls the boundary is the wig's UNDERSIDE, running back and
  // down the queue — (-5, 8.5), (-9, 10), (-13, 12.5), (-16, 15.5),
  // (-17.5, 20.5), (-18.2, 26), (-19.5, 31) — to where the bow meets the
  // neck at (-22, 35).
  Washington: [
    'M 6.55 -26.61 C 5.43 -27.3 3.66 -27.5 2.11 -27.61',
    'C 0.45 -27.73 -1.53 -27.68 -3.12 -27.22',
    'C -4.59 -26.79 -5.9 -25.44 -7.12 -25.07',
    'C -8.03 -24.79 -8.73 -24.84 -9.66 -24.81',
    'C -10.77 -24.79 -12.19 -25.42 -13.34 -24.99',
    'C -14.72 -24.46 -15.97 -22.68 -17.16 -21.24',
    'C -18.48 -19.66 -19.88 -17.67 -20.84 -15.82',
    'C -21.73 -14.11 -22.32 -12.39 -22.83 -10.56',
    'C -23.36 -8.69 -23.48 -6.67 -23.93 -4.72',
    'C -24.39 -2.73 -25.29 -0.77 -25.59 1.23',
    'C -25.89 3.21 -26.28 5.43 -25.76 7.21',
    'C -25.25 8.92 -23.31 10.08 -22.63 11.73',
    'C -21.94 13.4 -21.59 15.39 -21.63 17.17',
    'C -21.68 18.89 -21.91 21.32 -22.84 22.25',
    'C -23.58 22.98 -25.03 23.05 -26.06 23',
    'C -27.06 22.95 -28.27 21.82 -28.97 22.04',
    'C -29.52 22.2 -29.94 22.97 -30.12 23.55',
    'C -30.31 24.15 -30.11 24.75 -30.05 25.6',
    'C -29.96 27 -30.07 29.38 -29.52 31.14',
    'C -28.96 32.95 -28.02 36.06 -26.64 36.29',
    'C -24.85 36.6 -20.53 32.03 -19.18 29.75',
    'C -18.19 28.09 -18.38 26.37 -18.02 24.6',
    'C -17.65 22.72 -17.63 20.62 -16.99 18.8',
    'C -16.35 16.98 -15.43 15.09 -14.17 13.67',
    'C -12.9 12.24 -10.87 11.07 -9.4 10.26 C -8.27 9.64 -7.44 9.29 -6.22 8.96',
    'C -4.71 8.54 -2.35 9 -0.95 8.17 C 0.43 7.36 1.46 5.63 2.16 4.11',
    'C 2.88 2.57 2.84 0.69 3.31 -1.03 C 3.79 -2.79 4.5 -4.52 5.02 -6.33',
    'C 5.55 -8.21 5.99 -10.17 6.42 -12.12',
    'C 6.86 -14.09 7.26 -16.12 7.62 -18.12',
    'C 7.99 -20.11 9.04 -22.61 8.63 -24.11',
    'C 8.33 -25.21 7.5 -26.03 6.55 -26.61 Z',
  ].join(' '),
};

// Lincoln's beard gets the same treatment for the same reason: on the real
// cent it is a separate, deeply cut mass, and drawing it in the skin tone
// left his chin looking swollen rather than bearded.
const BEARD = [
  'M 15.15 12.77 C 15.64 13.62 13.67 16.33 12.3 17.51',
  'C 10.84 18.76 8.36 18.92 6.51 19.89 C 4.62 20.89 3.04 22.71 1.07 23.44',
  'C -0.86 24.16 -3.1 24.78 -5.16 24.28',
  'C -7.57 23.7 -10.53 21.19 -12.31 19.33',
  'C -13.79 17.79 -14.7 16.08 -15.53 14.3',
  'C -16.35 12.52 -17.71 9.36 -17.28 8.63 C -17.08 8.28 -16.56 8.31 -16 8.37',
  'C -14.81 8.49 -12.5 9.97 -10.67 10.64',
  'C -8.8 11.33 -6.84 11.99 -4.88 12.43 C -2.93 12.87 -0.93 13.22 1.06 13.3',
  'C 3.05 13.39 4.91 13.03 7.06 12.94 C 9.55 12.84 14.56 11.75 15.15 12.77 Z',
].join(' ');

// What hangs off the back of the head, in the same dark tone as the hair —
// separate shapes rather than part of the outline because both of these
// overlap something (Jefferson's queue lies over his coat, Washington's bow
// sits out beyond his neck) and a single path cannot do that.
//
// This is the pair most at risk of collapsing into each other, since both
// men wore a queue and a ribbon. They are pulled apart by WHERE it sits:
// Jefferson's runs LOW and long, down the back over a coat collar;
// Washington's is tied tight at the nape and stands clear against open
// field, with bare neck below it.
const TAIL = {
  // NEITHER MAN HAS AN ENTRY HERE ANY MORE. Jefferson's queue and ribbon went
  // into the traced nickel outline; Washington's went the same way for the
  // same reason and against the same evidence. His bow used to be two rotated
  // ellipses and a circle hung off the back of a neck that ran to the rim; on
  // the coin the queue narrows out of the wig at the nape, is bound by a
  // ribbon at (-20, 25), and the bow's two loops stand clear against open
  // field — all of it one continuous silhouette, which is now what HEAD and
  // HAIR draw. `TAIL[o.who] || ''` already tolerates a missing entry.
};

// ─────────────────────────────────────────────────────────────────────────
// HAIR, AND WHY IT IS WORTH THIS MUCH STRING
// ─────────────────────────────────────────────────────────────────────────
// Full tier only, and LIGHT: the features that stand proud on a struck coin
// catch the light, so they get a pale mark. Only the eye and the ear — a
// hollow and a fold — are drawn dark. Drawing brow, cheek and jaw dark is
// what made an early attempt look like a skull.
//
// The previous pass shipped two or three marks per head and then said, in
// its own notes, that it would BET AGAINST THE NICKEL transferring. It was
// right about the cause: on the real cent and the real nickel the hair is a
// TALL WAVY MASS of separately cut locks — it is the single busiest thing on
// either coin and the first thing the eye lands on — and ours was a smooth
// dark cap. A smooth cap is a helmet, and every man in a helmet looks alike.
//
// So the locks are drawn: a run of lit ridges lying along the direction the
// hair actually travels on each coin. Lincoln's rise off a bare forehead and
// break backwards over the crown; Jefferson's sweep back and then DOWN in
// long parallel curves to the queue; Roosevelt's is one short wave and
// nothing else, which is HIS identity and must not be embellished into
// somebody else's head; Washington's are rolled curls bunched behind the
// ear.
//
// Split into `base` and `fine`. `base` is every stroke that survives at the
// 62px dime wave 1 draws. `fine` is the closer-spaced work — and the two
// pale face lights, down the nose ridge and along the jaw, which are how a
// struck portrait catches light — and it appears only above 130px, where a
// 1.4-unit line is a real line and not a fleck of dirt.
const RELIEF = {
  // LINCOLN'S HAIR RISES OFF A BARE FOREHEAD AND BREAKS BACKWARDS over the
  // crown — the opposite arrangement to the three wigs and crops, and the
  // reason his hairline is the longest diagonal on any of the four obverses.
  // Every stroke below was re-sited when the outline was measured (the head
  // grew 20% and changed shape); the containment check in coloringbook/
  // reports the clearance of each one inside the HAIR mass rather than merely
  // inside the head, because a hair stroke inside the head but outside the
  // hair draws on the cheek.
  //
  // THE BEARD'S STROKES USED TO BE LIT AND THEY ARE NOW CUT. Measured against
  // the cheek, the beard on ref/penny-obv-3.jpg reads 0.548 and on the 1909-S
  // 0.626 — it is the DARKEST thing on the cent. Two pale ridges through it
  // put our own beard at 1.303, i.e. brighter than the cheek and 0.755 away
  // from the coin: the single worst number in the whole tone vector, and the
  // same sign error the dime's hair carried in reverse. The mass is now
  // filled `deep` and carried on five cut grooves, which is what the die does.
  Lincoln: {
    // Dark line work, drawn in `ink` at 0.33 BEFORE the lit ridges — the cut
    // comes first and the light sits on what is left standing. Spacing is 3.0
    // local units against a groove width of 1.9, which satisfies §7's
    // arithmetic rule (gap >= (w1+w2)/2 + 0.4) at every cut across the mass.
    groove:
      '<path d="M -13.4 11.2 q 1.8 4.4 1.0 7.8" fill="none" stroke-width="1.9"/>' +
      '<path d="M -10.4 12.0 q 1.8 4.6 1.0 8.2" fill="none" stroke-width="1.9"/>' +
      '<path d="M -7.4 12.8 q 1.8 4.8 1.0 8.4" fill="none" stroke-width="1.9"/>' +
      '<path d="M -4.4 13.4 q 1.8 4.8 1.0 8.4" fill="none" stroke-width="1.9"/>' +
      '<path d="M -1.4 13.8 q 1.8 4.6 1.0 8.0" fill="none" stroke-width="1.9"/>',
    // NO `shade` REGION ON THE TEMPLE, and the reason is worth keeping. Both
    // usable references agree the temple is darker than the cheek (0.829 and
    // 0.661), and an `ink`-at-0.28 region there scored 0.828 against 0.829 —
    // a hit on the frozen metric. It was drawn, and it read as a BLINDFOLD:
    // a flat bar across the eye with one free edge floating on the face. The
    // band map is why. On the dime the throat and forehead are STEPS (0.80
    // flat across fourteen units, then a 0.3 jump in two); the cent's face is
    // a RAMP with fine local relief — the scan line down x = 2 goes
    // 0.92 0.83 0.86 0.85 1.11 1.11 0.72 0.94 1.07 on one reference and
    // 1.01 0.86 0.74 0.66 0.75 0.93 0.87 0.64 0.61 on the other, with no
    // plateau anywhere. A flat fill can name a step; it cannot name a ramp.
    // Removing it cost 0.170 on that patch and 0.015 on the mean, and it is
    // the right trade.
    base:
      '<path d="M -14.0 -27.0 q 5.6 -3.2 9.6 -3.8" fill="none" stroke-width="1.8"/>' +
      '<path d="M -19.4 -21.0 q 5.8 -3.4 9.4 -4.0" fill="none" stroke-width="1.8"/>' +
      '<path d="M -22.6 -14.0 q 4.6 -3.0 7.4 -3.6" fill="none" stroke-width="1.7"/>' +
      '<path d="M -6.0 -30.6 q 5.0 -0.8 8.6 0.2" fill="none" stroke-width="1.6"/>' +
      '<path d="M -23.4 -6.6 q 4.0 -2.6 6.6 -3.2" fill="none" stroke-width="1.6"/>',
    fine:
      '<path d="M -17.0 -24.4 q 5.0 -2.6 8.2 -3.2" fill="none" stroke-width="1.4"/>' +
      '<path d="M -21.6 -17.6 q 4.4 -2.8 7.0 -3.4" fill="none" stroke-width="1.4"/>' +
      '<path d="M -24.0 -10.4 q 3.8 -2.4 6.0 -2.8" fill="none" stroke-width="1.3"/>' +
      '<path d="M 12.2 -11.4 L 16.1 -4.4" fill="none" stroke-width="1.2"/>' + // nose ridge, lit
      '<path d="M 4.0 -2.0 q 3.0 2.8 3.6 5.6" fill="none" stroke-width="1.2"/>', // cheek, lit
  },
  Jefferson: {
    // The busiest head of the four, because on the coin it is. Long parallel
    // curves running back and down, plus a lit line along the queue. Every
    // start point moved with the redrawn outline (the mass is deeper at the
    // nape now), and the two queue strokes were re-sited onto the traced
    // queue, which sits further back and lower than the composed one did.
    base:
      '<path d="M -26.24 -26.41 q 6.4 8.8 5.6 18.6" fill="none" stroke-width="1.63"/>' +
      '<path d="M -30.25 -18.35 q 5.0 9.2 4.2 18.8" fill="none" stroke-width="1.63"/>' +
      '<path d="M -27.04 1.8 q 2.0 7.8 -0.4 13.6" fill="none" stroke-width="1.55"/>' +
      '<path d="M -28.04 -25.0 q 5.6 6.0 6.4 13.4" fill="none" stroke-width="1.46"/>' +
      '<path d="M -30.75 -16.94 q 4.0 7.4 4.0 15.0" fill="none" stroke-width="1.46"/>' +
      '<path d="M -25.43 1.8 q 3.2 6.4 2.2 12.6" fill="none" stroke-width="1.38"/>',
    fine:
      '<path d="M -24.03 -18.76 q 3.6 4.0 3.8 8.4" fill="none" stroke-width="1.2"/>' +
      '<path d="M -33.25 -6.26 q 2.2 6.4 0.6 11.6" fill="none" stroke-width="1.2"/>' +
      '<path d="M -26.44 -27.42 q 4.0 3.0 5.2 6.6" fill="none" stroke-width="1.12"/>' +
      '<path d="M -30.2 22.6 q -2.6 3.0 -3.4 5.4" fill="none" stroke-width="1.2"/>' +
      '<path d="M -26.4 23.8 q -2.2 2.8 -2.8 4.8" fill="none" stroke-width="1.03"/>' +
      '<path d="M 14.27 -8.08 L 22.29 1.39" fill="none" stroke-width="1.03"/>' +
      '<path d="M 6.85 1.8 q 3.6 3.4 4.4 7.0" fill="none" stroke-width="1.03"/>',
  },
  // ROOSEVELT, AND THE ONE THING THIS HEAD KEPT GETTING WRONG WAS TONE.
  //
  // Every previous pass drew the hair as a DARKER BLOCK with pale streamlines
  // scratched into it, and every previous pass then wrote in its own notes
  // that the block was the largest remaining error. It is: on the photograph
  // the hair is THE SAME SILVER AS THE FACE. Its whole identity is texture and
  // shape. Sampled off coloringbook/ref/dime-obv.jpg the lit ridges of the
  // hair are BRIGHTER than the shadowed cheek, and only the cut grooves
  // between them are dark — so a flat dark fill is not a stylisation of the
  // object, it is the opposite of it.
  //
  // The palette cannot help: the dime, nickel and quarter share one silver
  // byte for byte and a test measures the spread. So the fix is structural —
  // `hairLit` on OBVERSE.dime fills the mass in the FACE's own tone at full
  // tier, and the mass is then carried entirely by line work:
  //
  //   groove / grooveFine   DARK strands, in `deep`. These are the cut lines
  //                         of the die and they are what now says "hair".
  //   base / fine           LIT ridges, in `field`, lying BETWEEN the grooves.
  //                         Halved from the previous pass: with a dark stroke
  //                         either side of it a ridge needs far less width.
  //
  // Direction was measured too — see the `groove` comment below, which carries
  // the four angles phase 2 took off the photograph and the field they imply.
  //
  // TONE was measured again in phase 2, against the PRIMARY reference rather
  // than the weak one, and the note above needs one correction. The 1.34 hair-
  // to-cheek ratio quoted in docs/COIN-ART-METHOD.md §5 came off
  // ref/dime-obv.jpg — the 400px, warm-lit, 8-degree-tilted photograph §3 grades
  // WEAKEST. On ref/dime-obv-2.jpg, the black-field proof §3 grades best, the
  // same two boxes give 0.966, and the two good proofs put the hair between 1.08
  // and 1.33 of the cheek depending on the patch. The hair IS brighter than the
  // cheek; it is not brighter by a third. Phase 2 sized the correction to the
  // good photograph.
  Roosevelt: {
    // THE LIT RIDGES, two of them, and they are now DELIBERATELY QUIET — an
    // explicit opacity on each, roughly half the group's. Phase 2 refilled the
    // mass in `cloth` (see `hairLit` on OBVERSE.dime), so a ridge no longer has
    // to lift a mass drawn too dark; at full strength over the lighter mass the
    // pair read as two bright ribbons laid on the hair, and the photograph shows
    // no such streaks — it shows a bright mass with dark cuts in it. The score
    // is identical either way (the lit fraction of every hair patch is under a
    // half, so no median moves), which is exactly why this one was decided by
    // eye. Spacing still obeys the old rule: a groove and a ridge closer than
    // half their widths plus 0.4 cancel, because the pale stroke draws last.
    base:
      '<path d="M -0.6 -29.6 C -3.51 -27.68 -13.22 -22.88 -18.05 -18.08 C -22.89 -13.27 -27.69 -3.66 -29.62 -0.78" fill="none" stroke-width="1.2" opacity="0.55"/>' +
      '<path d="M 4.68 -24.37 C 2.35 -23.3 -4.97 -20.62 -9.31 -17.98 C -13.66 -15.33 -19.36 -10.08 -21.37 -8.5" fill="none" stroke-width="1.2" opacity="0.55"/>',
    fine:
      '<path d="M 15.6 -12.2 C 16.7 -11.4 17.5 -10.6 17.8 -9.6" fill="none" stroke-width="1.2"/>' +
      '<path d="M 19.4 -1.2 L 23.2 3.2" fill="none" stroke-width="1.2"/>' +
      '<path d="M 13.4 2.8 C 15.2 5 15.8 7.4 15.4 9.6" fill="none" stroke-width="1.2"/>' +
      '<path d="M 18.1 18.4 C 17.0 19.3 15.8 19.9 14.5 20.2" fill="none" stroke-width="2.2"/>',
    // THE GROOVES, and this is the hair. Five at every full-tier size — five is
    // what a 62px dime can resolve — and seven more between them above 130px.
    //
    // PHASE 2 REDREW THE WHOLE FAMILY, and the correction was WHERE the strands
    // start and HOW STEEP they run, not how many there are. Measured off
    // dime-obv-2 with a structure tensor in four frozen discs, the coin's
    // strands run (screen degrees, back-and-down positive):
    //
    //     crown 29     mid-mass 39     over the ear 16     back of skull 56
    //
    // Two things follow. First, the direction is a FIELD, not a constant: the
    // hair over the top turns down hard round the occiput while the hair on the
    // SIDE of the head has not turned at all — 16 against 39 only eight units
    // away. Drawing one angle everywhere is what made the mass read as a combed
    // sheet. Second, the strands do not all leave the hairline. Most leave the
    // PART, which runs from the front hairline back along just under the top
    // edge, and wrap round the back; only the lower ones leave the temple.
    // The family that came out of that measures 27 / 37 / 25 / 58 against the
    // coin's four, mean error 3.8 degrees.
    //
    // Every strand stops short of the nape and of the hair's own lower edge, so
    // nothing leaks onto the cheek or the neck, and the ENDS are staggered:
    // twelve strands all run to the nape and the nape becomes one dark block.
    groove:
      '<path d="M -4.2 -30.3 C -6.89 -28.35 -15.82 -23.31 -20.36 -18.62 C -24.9 -13.92 -29.61 -4.86 -31.47 -2.11" fill="none" stroke-width="1.2"/>' +
      '<path d="M 5 -26.4 C 2.42 -25.22 -5.71 -22.25 -10.46 -19.33 C -15.2 -16.4 -21.31 -10.59 -23.48 -8.84" fill="none" stroke-width="1.5"/>' +
      '<path d="M 2.47 -20.83 C -0.01 -19.68 -7.77 -16.71 -12.41 -13.96 C -17.05 -11.21 -23.2 -5.93 -25.36 -4.32" fill="none" stroke-width="1.5"/>' +
      '<path d="M -2.4 -11.4 C -4.58 -10.7 -11.21 -8.72 -15.51 -7.19 C -19.8 -5.66 -26.06 -3.06 -28.17 -2.23" fill="none" stroke-width="1.4"/>' +
      '<path d="M -17.1 -1.35 C -18.1 -1.17 -21.12 -0.68 -23.12 -0.26 C -25.11 0.16 -28.08 0.91 -29.07 1.14" fill="none" stroke-width="1.3"/>',
    // The in-between strands, above 130px only, and THINNER than the five that
    // have to survive 62px — 0.8 local units against 1.2-1.5. Where the strands
    // converge at the back of the skull, width is what closes the gaps between
    // them, and a family drawn at one weight turns that whole corner dark: the
    // measured back-of-head patch went from 1.16 of the cheek to 0.86 on the
    // one iteration that carried full-weight strokes into it. The last two are
    // short cuts low behind the ear, where the coin is dense and we were bare.
    grooveFine:
      '<path d="M -13 -29.7 C -14.89 -28.08 -21.3 -23.77 -24.33 -19.95 C -27.36 -16.13 -30.05 -8.96 -31.2 -6.76" fill="none" stroke-width="0.8"/>' +
      '<path d="M -8.6 -30.2 C -10.8 -28.44 -18.25 -23.84 -21.82 -19.62 C -25.38 -15.4 -28.64 -7.34 -30.01 -4.89" fill="none" stroke-width="0.8"/>' +
      '<path d="M 1.6 -28 C -1.03 -26.49 -9.55 -22.66 -14.21 -18.95 C -18.87 -15.24 -24.33 -7.94 -26.35 -5.74" fill="none" stroke-width="0.8"/>' +
      '<path d="M -4.6 -8.4 C -6.33 -7.91 -11.54 -6.54 -14.97 -5.47 C -18.4 -4.4 -23.47 -2.57 -25.17 -1.99" fill="none" stroke-width="0.8"/>' +
      '<path d="M -6.8 -5.4 C -8.45 -5.03 -13.44 -3.99 -16.69 -3.16 C -19.94 -2.33 -24.71 -0.87 -26.31 -0.42" fill="none" stroke-width="0.8"/>' +
      '<path d="M -18.63 -0.54 C -19.45 -0.42 -21.92 -0.09 -23.55 0.21 C -25.18 0.5 -27.6 1.07 -28.41 1.24" fill="none" stroke-width="0.8"/>' +
      '<path d="M -21.24 0.55 C -22.02 0.64 -24.35 0.86 -25.89 1.09 C -27.43 1.31 -29.72 1.76 -30.49 1.9" fill="none" stroke-width="0.8"/>',
    // THE DARK FACE MARKS, and the file's old rule still holds: no dark
    // crescent on the CHEEK, because that reads as a socket and turns the
    // portrait into a skull. What IS dark on the photograph is a short list,
    // and every one of these is a place where one form OVERHANGS another —
    // the brow over the eye, the nose over the lip, the lip over the chin,
    // the jaw over the neck. Drawn in `deep`, not `ink`: they are shadows in
    // silver, not lines in pencil.
    // THE JAW, still the strongest dark on the coin and still the only one
    // drawn at full `ink` weight, because on the photograph it is the deepest
    // shadow on the obverse. Measured, the boundary runs from the chin back
    // and slightly UP — (18, 20.5) → (10, 21.5) → (2, 18.6) → (−6, 15.4) —
    // and ends in a defined ANGLE tucked under the ear lobe at about
    // (−11, 13.6), where it turns up. The previous pass stopped a unit short
    // of the angle, so the jaw trailed off into the neck instead of turning,
    // and the whole lower head stayed one flat pentagon.
    dark:
      '<path d="M 19.4 21.4 C 17.6 21.4 14.2 21.4 11 21.2 C 7 21 3.4 19.4 0.4 18.2' +
      ' C -3.2 16.8 -7.4 15 -10.4 13.6 C -11.4 13 -12.2 12.4 -12.6 11.6" fill="none" stroke-width="1.5"/>',
    // THE THROAT SHADOW, and it is a REGION, not a line — the one thing phase 2
    // left on the table and called unreachable.
    //
    // Phase 2 measured the throat at 0.806 of the cheek against our 1.000 and
    // wrote it off with forehead and lips as "not a shortfall; the format",
    // reasoning that a flat palette can only reach 0.806 by covering half the
    // throat in `deep`, "which is a collar, not a shadow". Phase 2b tested that
    // instead of inheriting it, by blurring ref/dime-obv-2 past the frost and
    // quantising it into the steps this palette can actually reach. The throat
    // is not a gradient. Scanned ACROSS the neck at y = 25 the photograph reads
    //
    //     x   10   8    6    4    2    0   -2   -4   -6   -8
    //       0.80 0.82 0.82 0.81 0.84 0.85 0.83 0.78 1.10 1.17
    //
    // — fourteen units of flat 0.8, then a STEP of 0.3 in two units at x ≈ -5,
    // which is the lit front edge of the sterno-mastoid running down the side of
    // the neck. Down the throat at x = 0 it reads 1.07 at y = 18, 0.78 by y = 22:
    // a second step, under the jaw. Four real edges — the silhouette in front,
    // the jaw above, the muscle behind, the truncation below — so the shadow is
    // a closed shape on the coin and a flat fill can name it honestly.
    //
    // It is NOT a collar: a collar crosses the neck, and this runs DOWN the
    // front of it and stops at a near-vertical edge with the lit nape left bare
    // behind it. §7's own list of permitted darks already has this one — "the
    // jaw over the neck" — it had simply never been drawn.
    //
    // Filled ink at the modelling group's own 0.28 renders at 0.791 of the face
    // against the coin's 0.806: the worst patch in the whole set, 0.194, becomes
    // 0.015. Its top edge sits about three units BELOW the jaw stroke, because
    // the photograph puts light on the underside of the jaw before the shadow
    // starts, and closing that gap merges the two into one dark bar.
    // THE TWO LIT PLANES, and they are the other half of the same argument.
    //
    // Phase 2 read forehead 1.159 and lips 1.112 against our flat 1.000 and
    // grouped them with the throat as unreachable. They are not ramps either.
    // Across the forehead at y = -19 the photograph reads 1.20 1.21 1.20 1.17
    // 1.15 1.17 1.13 from x = 12 back to x = 0 — a plateau the full width of the
    // bare forehead, ending at the hairline in front of it and at the BROW RIDGE
    // below it, where a scan down x = 10 falls 1.17 (y -14) 1.11 (-12) 1.05
    // (-10) 1.01 (-8). Around the mouth, y = 15 reads 1.27 1.09 1.27 1.16 from
    // x = 18 back to x = 12 and then steps to 1.01 by x = 10: a lit lip mass
    // about six units deep against the shadowed side plane behind it.
    //
    // So the coin models this face the way a sculptor does — a lit FRONT plane
    // along the profile and a shadowed SIDE plane behind it — and `cloth`, which
    // renders at 1.155 of the face, is that front plane to within 0.01 on the
    // forehead. No new colour: it is the same tone the hair mass already uses,
    // which is also what the photograph says (crown 1.19, forehead 1.16).
    //
    // 12.6's test — "does the mark name a form the coin has?" — is what decides
    // where each edge goes, and it is why these are two shapes and not one wash
    // down the front of the face:
    //   · the forehead stops at the brow ridge, not at the eye, so the socket
    //     and the temple hollow stay in the darker plane where the coin has them
    //   · the lip mass stops at the MENTOLABIAL CREASE we already draw, so the
    //     ball of the chin below it stays a separately lit form (its own mark,
    //     brighter again at 1.39 against the coin's 1.28) rather than being
    //     swallowed into one pale slab
    //   · nothing crosses the open cheek, which stays the normaliser at 1.000
    // A REGION IS ONLY AS GOOD AS ITS EDGES. The first cut of these two scored
    // 0.0443 and looked WORSE than the flat face it replaced: three pale and
    // dark blobs floating clear of every line in the drawing, because each one
    // was inset a unit or two from the profile, from the hairline and from the
    // marks below it, and so introduced three or four new boundaries of its own.
    // A flat fill has no gradient to hide an edge behind, so every edge it has
    // must be an edge the coin has. The rule that fixed it:
    //
    //   BUTT EACH REGION AGAINST LINES THE DRAWING ALREADY DRAWS, so it
    //   contributes at most ONE new boundary, and let that boundary END on
    //   drawn lines at both of its ends.
    //
    // The forehead therefore runs out to the contour stroke in front, PAST the
    // hairline behind (the hair mass draws after these and covers it), and its
    // one free edge is the brow ridge — starting on the profile exactly where
    // the brow shadow starts, running back along the top of that stroke, then
    // turning up the temporal line to die on the hairline. The lip mass runs to
    // the contour in front, its top edge lies along the nasolabial fold and its
    // bottom along the mentolabial crease, both of which are already strokes, so
    // its one free edge is the short back one at the mouth corner.
    plane:
      '<path d="M 9.8 -26.8 C 10.9 -24.2 12 -21.2 13.5 -18.2' +
      ' C 14.8 -16 15.9 -13.6 16.9 -11.2' + // to the profile at the brow
      ' C 15.6 -10.6 14.2 -10.1 12.7 -9.7' + // back along the top of the brow
      ' C 11.4 -11 9 -12.8 6 -14' + // then up the temporal line
      ' C 4 -14.8 1.8 -15.2 0.2 -15.2' + // to die on the hairline
      ' C 0.9 -17.6 2 -20.4 3.4 -22.8' + // up UNDER the hair, which covers it
      ' C 4.8 -25 6.2 -26.4 10 -26.8 Z"/>' +
      '<path d="M 19.4 8.4 C 18.5 9.7 17.7 10.6 17.1 11.6' + // along the fold
      ' C 15.9 12.5 14.2 13.6 13.6 15.1' + // the one free edge, at the corner
      ' C 13.4 16.2 14.4 17.2 15.4 17.6' + // to the chin crease
      ' C 16.4 17.9 17.4 18 18.4 17.8' + // forward along it
      ' C 18.7 16 18.8 14 18.8 12' + // up to the contour stroke
      ' C 18.9 10.6 19.1 9.2 19.4 8.4 Z"/>',
    shade:
      '<path d="M 14.2 23.2 C 12.6 25.2 10.6 26.4 8.4 27.1' + // out to the
      ' C 5.6 27.9 2.8 28.6 1.7 29.3' + // contour, all the way down the throat
      ' C 0.9 28.5 -0.8 27.6 -2.6 26.8' +
      ' C -4.6 25.8 -6.2 23.6 -6.6 21.4' + // UP the muscle's lit front edge
      ' C -6.9 19.6 -6.4 18 -5.6 17.2' + // and under the ear
      ' C -3.2 18.4 -0.4 20 2.2 21.2' + // forward again just below the jaw
      ' C 5.6 22 9.8 22.8 14.2 23.2 Z"/>',
    // and the FACE, at about two thirds of the jaw's weight. Every mark here
    // is a place where one form OVERHANGS another — the brow over the eye,
    // the nose over the lip, the lip over the chin — which is the only kind
    // of dark the file has ever allowed on a face. Nothing lands on the open
    // cheek: a dark crescent there reads as a socket and makes a skull, which
    // is the mistake two earlier passes actually shipped.
    face:
      '<path d="M 18 -10.6 C 16.4 -10 14.8 -9.2 13.4 -8.2" fill="none" stroke-width="1.4"/>' +
      '<path d="M 23.2 5.8 C 22 6.8 20.2 7.4 18.6 7.4" fill="none" stroke-width="1.3"/>' +
      '<path d="M 18.2 13.2 C 17.2 13.6 16.4 14 15.4 14.2" fill="none" stroke-width="1.4"/>' +
      '<path d="M 18 17.4 C 17 17.8 16.2 17.8 15.4 17.4" fill="none" stroke-width="1.3"/>',
    faceFine:
      // the nostril itself, a hook rather than a hole
      '<path d="M 23 6 C 22.2 6.9 21.4 7.1 20.8 6.9" fill="none" stroke-width="1"/>' +
      // the nasolabial line. It stops ABOVE the mouth: run down past the
      // corner it closes a triangle with the mouth and the chin crease, and
      // three lines meeting round a chin read as a beard, not a cheek.
      '<path d="M 20.2 7.4 C 19 8.8 18 10.2 17.4 11.6" fill="none" stroke-width="1"/>' +
      // the lower lid, which is what makes the eye deep-set rather than drawn
      '<path d="M 15.2 -5.4 C 13.8 -4.6 12.4 -3.8 11.4 -3.4" fill="none" stroke-width="1"/>',
  },
  // WASHINGTON, AND THE WIG IS A TONE PROBLEM BEFORE IT IS A TEXTURE ONE.
  // Measured on ref/quarter-obv-2.jpg against the open cheek, the wig is NOT
  // one tone: its CROWN reads 1.421 of the cheek — the brightest thing on the
  // coin after the forehead — while its middle reads 0.860 and its back 0.841.
  // The `hair` fill renders at 0.846, so two of those three were already right
  // to within 0.014 and the crown was 0.575 away. That is the opposite of the
  // cent, where hair and beard are the DARKEST things on the coin, and it is
  // the dime's finding again: the mass is lit silver with dark cuts in it.
  //
  // So the crown gets LIT RIDGES thick enough to own the patch, the middle and
  // the back get grooves and ridges in roughly equal measure (which leaves the
  // median on the fill where the coin already has it, and buys the texture for
  // nothing), and the queue, the curls and the bow — 0.610, 0.652 and 0.720 —
  // get cuts.
  //
  // DIRECTION was measured too, with §12.4's structure tensor in four discs
  // kept 1.6 radii clear of the silhouette. In the SCREEN frame the coin runs
  //
  //     crown (-6,-18)  -7.3 deg      mid-mass (-14,-12)  +10.9 deg
  //     back (-18.5,-3) +54.1 deg     over the curls (-8,2)  +20.5 deg
  //
  // — nearly horizontal over the top, turning to steeply down-and-back at the
  // occiput. A single angle would draw a combed sheet; this is a field.
  Washington: {
    // THE CUTS, drawn first, in `ink` at 0.33 over the wig: the die cuts and
    // the light sits on what is left standing. They are ARCS, not bars — the
    // first cut of this family was a set of straight parallels and it read as
    // a venetian blind — and their ends are STAGGERED, because the coin's rolls
    // are short overlapping shingles rather than full sweeps (§12.6).
    groove:
      '<path d="M -18.4 -14.8 C -14.4 -15.6 -9.6 -16.4 -2.1 -17.6" fill="none" stroke-width="2.6"/>' +
      '<path d="M -20.3 -10.2 C -16.6 -11.0 -12 -11.8 -4.6 -13.2" fill="none" stroke-width="2.6"/>' +
      '<path d="M -21 -6.4 C -17.6 -7 -13.2 -7.6 -5.8 -8.8" fill="none" stroke-width="2.6"/>' +
      '<path d="M -23 -0.6 C -19.2 -1.6 -14.4 -3.0 -7 -5.2" fill="none" stroke-width="2.4"/>' +
      '<path d="M -23 4.6 C -18.6 3.2 -13.6 1.4 -6.7 -1.6" fill="none" stroke-width="2.4"/>',
    grooveFine:
      '<path d="M -20.6 -7.8 C -17 -8.6 -12.8 -9.4 -5.6 -10.8" fill="none" stroke-width="1.1"/>' +
      '<path d="M -22.2 1.6 C -18.6 0.4 -14.4 -1.0 -7.7 -3.6" fill="none" stroke-width="1.0"/>',
    // THE LIT ROLLS. Three of them cross the wigCrown patch (centre (-4,-22),
    // radius 3) and own more than half its area, which is the only way a flat
    // format moves a median (§12.6): the crown renders at 1.336 against the
    // coin's 1.421 instead of the fill's 0.846. The crown carries NO cut
    // between its rolls, because the coin's crown is unbroken light — the cuts
    // start where the mass turns over, at about y = -18.
    base:
      '<path d="M -8.6 -22.8 C -6 -23.6 -3 -23.7 3.3 -22.6" fill="none" stroke-width="1.9"/>' +
      '<path d="M -13.4 -21 C -10 -21.9 -6 -21.9 0.9 -20.5" fill="none" stroke-width="1.9"/>' +
      '<path d="M -16.6 -17.2 C -13.4 -17.8 -10.2 -18.4 -5.0 -19.2" fill="none" stroke-width="1.8"/>' +
      '<path d="M -20 -12.4 C -16.4 -13.2 -12.4 -14.0 -5.3 -15.4" fill="none" stroke-width="1.1"/>' +
      '<path d="M -21.8 -3.2 C -18.4 -4.2 -14.4 -5.6 -7.5 -7.6" fill="none" stroke-width="1.1"/>',
    fine:
      '<path d="M -21.4 -8.6 C -17.6 -9.4 -13.4 -10.2 -7.4 -11.4" fill="none" stroke-width="1.0"/>' +
      '<path d="M -22 2.6 C -18.4 1.2 -14.2 -0.6 -7.3 -3.4" fill="none" stroke-width="1.0"/>' +
      // the two face lights: down the brow ridge, and on the ball of the chin
      // BELOW the mentolabial crease so it stays a separately lit form. The
      // forehead plateau reads 1.40-1.49 of the cheek, the brightest region on
      // the coin, and `plane` alone only reaches 1.148, so the brow light is
      // deliberately WIDE — a modelled highlight on a plane, not a scratch.
      '<path d="M 10 -20.2 C 10.8 -17.6 11.8 -14.6 13.5 -7.9" fill="none" stroke-width="2.6"/>' +
      '<path d="M 13.4 16.3 q 1.1 0.3 1.9 0.1" fill="none" stroke-width="1.2"/>',
    // THE LIT FRONTAL PLANE, in `cloth`, exactly the move that fixed the dime's
    // forehead. The band map down x = 12 reads 1.07 1.33 1.40 1.32 1.26 1.17
    // from y = -20 to -10 — a plateau six units deep, not a ramp — bounded in
    // front by the profile, behind by the hairline (the wig draws after this
    // and covers that edge) and below by the brow ridge. One free edge, and it
    // ends on drawn lines at both ends (§13.5).
    plane:
      '<path d="M 8.2 -25.2 C 9.8 -23.4 11.2 -21.4 12.5 -19.6' +
      ' C 14.2 -17.6 15.2 -15.4 16.2 -12.8' +   // OUT to the contour stroke, so
      ' C 16.7 -11.6 17.0 -10.8 17.2 -10.2' +   // it adds no second profile
      ' C 16.0 -9.6 14.2 -9.2 12.4 -9.0' +      // back along the brow ridge
      ' C 11.2 -11.4 10.0 -13.8 8.4 -16.0' +    // then up the temporal line
      ' C 7.2 -17.6 6.2 -18.8 5.2 -19.8' +      // to die under the hair
      ' C 5.8 -21.8 6.6 -23.8 7.4 -25.0 Z"/>',
    // THE JAW'S CAST SHADOW, and §13.4's test is what allows it: every edge it
    // has is an edge the coin has — the jaw line above, the profile in front,
    // the throat's lit front edge behind. It is a STEP, not a ramp: the blurred
    // scan across y = 18 reads 1.05 0.90 0.89 0.81 0.61 0.37 0.20 0.17 0.35
    // from x = 0 out to x = 16, and the scan down x = 12 reads 0.84 0.77 0.55
    // 0.20 0.34 from y = 14 to 22, so the dark zone is about ten units wide and
    // four deep with hard edges on all four sides.
    shade:
      '<path d="M 17.8 16.4 C 16.6 17.6 14.8 18.6 12.6 19.1' +
      ' C 10.4 19.6 8.4 19.9 6.8 20.0' +
      ' C 6.4 19.0 6.4 18.0 6.6 17.2' +
      ' C 9.2 17.4 12.2 17.2 14.6 16.6' +
      ' C 16.0 16.3 17.0 16.2 17.8 16.4 Z"/>',
    // THE FACE, at the modelling group's own weight. Every one of these is a
    // place where one form OVERHANGS another, which is the only dark this file
    // allows on a face. Read off the photograph at 6 local units per grid
    // square: the brow shadow runs back from (17.6, -9.6), the nostril hooks at
    // (20.0, 5.6), the mouth runs (19.6, 11.5) to (15.2, 12.3) and the
    // mentolabial crease (19.5, 14.6) to (14.6, 15.4). Each is set in from the
    // profile by the contour stroke's own half width and no more.
    face:
      '<path d="M 16.4 -9.2 C 15.0 -8.6 13.4 -8.1 11.8 -7.8" fill="none" stroke-width="1.3"/>' +
      '<path d="M 19.4 5.8 C 18.6 6.5 17.9 6.6 17.3 6.4" fill="none" stroke-width="1.1"/>' +
      '<path d="M 18.0 11.8 C 17.0 12.2 15.8 12.4 14.6 12.5" fill="none" stroke-width="1.8"/>' +
      '<path d="M 18.2 14.7 C 17.2 15.1 15.8 15.3 14.6 15.4" fill="none" stroke-width="1.4"/>',
    faceFine:
      '<path d="M 18.4 7.2 C 17.8 8.4 17.2 9.4 16.6 10.4" fill="none" stroke-width="1.0"/>' +
      '<path d="M 16.6 -4.6 C 15.2 -3.8 13.8 -3.2 12.4 -3.0" fill="none" stroke-width="1.0"/>',
    // THE DEEPEST CUTS, in the same group as the eye: the jaw's own line, the
    // folds of the queue and the loops of the ribbon, which measure 0.610 and
    // 0.720 of the cheek where the wig fill renders 0.846.
    dark:
      '<path d="M 15.4 18.0 C 13.6 18.5 11.6 18.9 9.6 19.1" fill="none" stroke-width="1.6"/>' +
      '<path d="M -15.4 15.8 q -0.9 3.4 -1.6 6.6" fill="none" stroke-width="1.6"/>' +
      '<path d="M -17.6 16.2 q -0.8 3.6 -1.3 6.8" fill="none" stroke-width="1.6"/>' +
      '<path d="M -19.6 17.0 q -0.6 3.4 -0.9 6.4" fill="none" stroke-width="1.5"/>' +
      '<path d="M -20.2 18.4 q -0.4 3.0 -0.6 5.2" fill="none" stroke-width="1.4"/>' +
      '<path d="M -23.6 25.4 q 1.4 2.8 1.0 5.6" fill="none" stroke-width="1.5"/>' +
      '<path d="M -26.4 25.6 q 1.2 3.0 0.8 6.0" fill="none" stroke-width="1.5"/>' +
      '<path d="M -28.4 26.4 q 1.0 2.6 0.6 4.8" fill="none" stroke-width="1.4"/>',
  },
};

// The two DARK marks on the whole face, and there are only two.
//
// The eye sits at x ≈ 6, well behind the brow: on a profile the eye is about
// a quarter of the way back from the nose, and putting it at 9.6 (where an
// earlier version had it) crowded it against the bridge and made every face
// look startled. A dot alone stares; a dot under a lid that drops at its
// outer corner reads as calm.
//
// `off` shifts the whole mark inside a head's own local frame, and it exists
// because the dime's frame was re-measured off the photograph and its eye
// came out 6 units further forward than the shared position. It defaults to
// no shift, so the other three coins emit exactly the string they did.
const EYE_MARK = `<path d="M 2.6 -4.6 C 5.0 -6.6 8.0 -6.4 9.4 -4.6" fill="none" stroke-width="1.5"/>
  <circle cx="6.0" cy="-2.6" r="1.5" stroke="none"/>`;
const eye = (off) =>
  off ? `<g transform="translate(${off[0]} ${off[1]})">${EYE_MARK}</g>` : EYE_MARK;

// The EAR, and it earns its place twice over. Every one of the four
// reference coins shows one plainly and it is most of what stops a profile
// reading as a mannequin — and its POSITION is what fixes the head's
// proportion, roughly seven tenths of the way back from the nose. Measured
// off the dime photograph it is 32px on a 396px coin — SMALL, and half
// buried: the hair comes down in front of it as a sideburn and runs back
// over its top. An earlier pass drew Roosevelt's a third larger than the
// others and fully exposed on a bare cheek, which is the one thing the
// reference plainly contradicts, so it is now the same size as the rest.
// Drawn dark rather than light, because on the real coins it is a fold and
// reads as a shadow, and because an earlier pale version looked like a
// decorative swirl stuck on the cheek.
const ear = (k, x, y) =>
  `<g transform="translate(${x} ${y}) scale(${k})">
     <path d="M 3.0 -4.4 C -1.8 -5.0 -4.8 -1.0 -4.2 3.6 C -3.6 7.6 -0.8 10.0 2.6 9.6"
       fill="none" stroke-width="${n2(1.8 / k)}"/>
     <path d="M 1.2 -0.6 c -1.8 0.8 -2.0 3.8 -0.4 5.0" fill="none" stroke-width="${n2(1.4 / k)}"/>
   </g>`;

// THE DIME'S OWN EYE AND EAR, because both were measured off the photograph
// and neither fits the shared mark. `eye()` and `ear()` above are untouched,
// so the cent, the nickel and the quarter still emit exactly what they did.
//
// THE EYE is SMALL and DEEP-SET — on the photograph it is a dark almond about
// two units long lying under a brow that overhangs it, and it SLOPES: the
// corner nearest the nose is high, the outer corner drops back and down. The
// shared mark is a flat lid over a round pupil, which stares. This one does
// not, and the brow shadow that closes it in is the first stroke of `dark`.
const EYE_ROOSEVELT =
  '<path d="M 16.4 -8 C 14.8 -7.4 13.2 -6.4 12.2 -5.4" fill="none" stroke-width="1.4"/>' +
  '<ellipse cx="14.2" cy="-6.4" rx="1.8" ry="1.05" transform="rotate(-26 14.2 -6.4)" stroke="none"/>';

// THE EAR, measured: front edge at x ≈ −11, back at x ≈ −19.7, lobe bottom at
// y ≈ +10.3, and NO TOP — the hair crosses it at y ≈ −2.6 and the helix only
// appears below that. It is an OVAL WITH A CURL IN IT: an outer helix, an
// antihelix wrapping the concha, and one genuinely dark hollow. The shared
// `ear()` is a plain C, which at this size read as a bracket stuck on a cheek.
const EAR_ROOSEVELT =
  '<path d="M -11 -0.8 C -15 -1.4 -18.8 0.2 -19.4 3.4 C -20 6.6 -17 9.6 -13 10.4" fill="none" stroke-width="1.5"/>' +
  '<path d="M -12.4 1.6 C -15.2 2.2 -16.6 4.4 -15.8 6.6 C -15.2 8.1 -13.8 8.9 -12.6 8.7" fill="none" stroke-width="1.2"/>' +
  '<ellipse cx="-14.3" cy="4.4" rx="1.4" ry="2" transform="rotate(18 -14.3 4.4)" stroke="none"/>';

// LINCOLN'S OWN EYE, measured off ref/penny-obv-3.jpg in his local frame: the
// socket is a dark almond 2.4 units long and 1.6 deep centred at (11.5, −10.5),
// under a brow whose shadow runs back from the profile at (13.4, −13.2) to
// (9.0, −11.2). The shared EYE_MARK is 6.8 units of lid over a round pupil —
// nearly three times too long here, and on a cent that reads as a startled
// cartoon rather than as the deep-set eye the die actually carries.
const EYE_LINCOLN =
  '<path d="M 12.3 -12.4 C 11.2 -12.0 10.0 -11.6 8.8 -11.0" fill="none" stroke-width="1.2"/>' +
  '<ellipse cx="11.5" cy="-10.5" rx="1.5" ry="0.95" transform="rotate(-18 11.5 -10.5)" stroke="none"/>';

// WASHINGTON HAS NO EAR, HE HAS CURLS. Measured on ref/quarter-obv-2.jpg and
// confirmed on ref/quarter-obv-4.jpg at 6 local units per grid square: where
// the other three coins show a plain helix on open skin, this one shows the
// wig's front curls coming down over the ear and covering it completely. What
// occupies local x +1..-9, y -1..+9 is a cluster of ROLLED CURLS, and below
// them is bare cheek. Two hooks, in the same dark group the ear used, because
// on the die the cuts between these curls are the deepest thing in the wig.
const CURLS_WASHINGTON =
  '<path d="M 0.4 0.2 C -2.4 -0.2 -4.8 1.6 -4.6 4.0 C -4.5 5.4 -3.4 6.3 -2.2 6.2"' +
  ' fill="none" stroke-width="1.5"/>' +
  '<path d="M -4.0 6.4 C -5.9 6.7 -7.2 7.6 -7.6 8.6" fill="none" stroke-width="1.3"/>' +
  '<path d="M -1.2 3.6 C -3.0 3.6 -4.6 4.6 -5.2 6.0" fill="none" stroke-width="1.3"/>';

// Which obverse each coin carries, and which way it looks. Post-2004 nickel
// and post-1998 quarter designs are deliberately NOT referenced: those came
// through the Mint's Artistic Infusion Program and are not reliably public
// domain.
//
// PROPORTIONS TAKEN FROM THE REAL COINS. Held against photographs of a
// 1909-S cent, a 2004 nickel, a 1996 dime and a 1994 quarter, the first
// drawings here were wrong in the same way: the head was too small and it
// sat on a wide pair of shoulders. On the DIME and the QUARTER there are no
// shoulders at all — the portrait is a HEAD AND NECK and the neck simply
// runs off the bottom of the field, which is why those heads look so big and
// read so well struck at 17mm. The CENT and the NICKEL do have a coat: a
// lapel and a bow tie under Lincoln's beard, a high stand collar under
// Jefferson's queue. That 2–2 split is worth drawing correctly, because
// "coat or bare neck" is one more channel that costs no colour and no
// pixels, and it happens to separate the two coins that are otherwise most
// alike in the set (nickel and quarter: both silver, both left-facing, both
// wearing a queue tied with a ribbon).
//
//   s / cy / cx     the head's scale and where its origin lands, chosen so
//                   the crown clears the inscription band and the jaw sits
//                   about two thirds of the way down the field.
//   iconS / iconCy / iconCx
//                   at icon tier the neck and coat are dropped entirely, so
//                   the head has to be re-centred and re-scaled to fill the
//                   disc on its own. These are the values that put each
//                   man's whole mass — beard, queue and all — centred in the
//                   field at about 86% of its diameter.
//   neck            where the collar crosses, in local units below the
//                   origin. On the cent it sits BELOW the beard: at 15 the
//                   coat ate the beard whole and the cent lost the one
//                   feature that tells it from the other three.
//   earS            the ear's relative size. Roosevelt's is a third larger
//                   because the real dime's is, and because he has the least
//                   hair — the ear is worth most on the head with least else.
export const OBVERSE = {
// HOW MUCH OF THE FIELD THE HEAD FILLS, measured off the photographs in
// coloringbook/ref rather than guessed, because it is one of the four things
// that actually transfers to a real coin — and it turned out to be the thing
// this file had most wrong. Head height as a fraction of the disc:
//
//     cent     ~49%   MEASURED: crown to the bottom of the beard is 0.99 of
//                     the disc radius, i.e. 49.5% of the diameter — a small
//                     head, high in the field, over a big coat
//     nickel   ~58%   measured off Schlag's model (see HEAD.Jefferson)
//     dime     ~66%   Roosevelt's head very nearly fills the coin
//     quarter  ~64%   so does Washington's
//
// An early version drew all four at about 60–66%, which made a cent look like
// a quarter struck in copper. The correction after that OVERSHOT: at s = 0.65
// the cent's head was 20% too small, and the silhouette IoU against the frozen
// target was 0.668 — placement alone, path untouched, took it to 0.855.
  penny: {
    // `neck` 38 -> 25: on the coin the collar crosses at v = 0.20 of the disc
    // (local y 25) and the bow tie sits on it at y ≈ 28, which is what the
    // frozen contour's own bump at (7..10, 26..31) is. At 38 the collar was
    // half a coin too low and, at the corrected scale, the lapel ran off the
    // field. `ear` was measured off ref/penny-obv-3.jpg: the helix spans local
    // x −14.5..−8.7 and y −7.5..+2.9, which is SMALLER and four units HIGHER
    // than the shared glyph was placed. `eye` likewise: the coin's is at
    // x 9.3..13.0, y −11.2..−9.2, where the shared mark sits at x 2.6..9.4,
    // y −6.6..−2.6. iconS/iconCy/iconCx are recomputed from the new path's
    // bounding box, to the same rule the old ones claimed — the head's mass
    // centred in the icon field at 86% of its diameter.
    who: 'Lincoln', dir: 1, bare: false, neck: 25, ear: [0.86, -11.7, -5.9],
    eyeMark: EYE_LINCOLN,
    s: 0.78, cy: 40.0, cx: 3.88, iconS: 1.253, iconCy: 56.11, iconCx: 5.68,
    // The coat, measured off the frozen bust mask — see coat() below for what
    // these are and coloringbook/shoulder-fix.md for the sweep that set them.
    // `back`/`front` are the two rim crossings in degrees from straight down;
    // the eight t/b numbers are chord fractions and outward bows (in units of
    // `s`) for the two seams. The cent's back seam carries a real bow — the
    // shoulder stands out from the nape before it plunges — while its front is
    // very nearly a straight line, which is what the photograph shows.
    coat: {
      back: 39.3, front: 40.5, litT: 0.55, litOff: 1.6, lapF: 0.72, lapOff: 4.5,
      bt1: 0.06, bb1: 8.9, bt2: 0.39, bb2: 9.2,
      ft1: 0.65, fb1: -0.2, ft2: 0.77, fb2: -4.1,
    },
  },
  nickel: {
    who: 'Jefferson', dir: -1, bare: false, neck: 23, ear: [1.0, -16.6, -2.2],
    s: 0.95, cy: 43.7, cx: -6.4, iconS: 0.95, iconCy: 43.7, iconCx: -6.4,
    // Jefferson's back seam is almost entirely HIDDEN — the queue reaches
    // screen x 78.6 and the rim crossing is at 78.2 — so its bow is doing one
    // job only: keeping the sliver of cloth that shows below the hair out to
    // where the coin has it. The front seam is the visible one.
    coat: {
      back: 43.5, front: 33.3, litT: 0.55, litOff: 1.6, lapF: 0.72, lapOff: 4.5,
      bt1: 0.61, bb1: 9.9, bt2: 0.66, bb2: 5.0,
      ft1: 0.49, fb1: -0.5, ft2: 0.71, fb2: 4.1,
    },
  },
  // THE DIME IS THE ONE MEASURED RATHER THAN COMPOSED. `cut` says its
  // truncation is drawn INSIDE HEAD.Roosevelt — the neck ends in a straight
  // angled cut that stops clear of the field, which the shared bareNeck()
  // (which closes on the rim) cannot express. s/cx/cy are the three numbers
  // that put the photograph's own coordinates on our disc: crown 3 units
  // inside the rim, chin 57.6% of the diameter below it, nose and back of
  // hair 63% apart.
  // `hairLit` is the tone correction: at full tier the hair mass is filled in
  // `cloth` — LIGHTER than the face — and carried by grooves, because that is
  // what the photograph shows. It stays a darker block at `mid`, where there is
  // no line work at all and tone is the only channel a 40px coin has left. See
  // bust() for the four measured ratios this is sized to.
  // `earMark` / `eyeMark` are the two features measured close enough off the
  // photograph to deserve their own paths; the other three coins keep the
  // shared ones.
  dime: {
    who: 'Roosevelt', dir: -1, bare: true, cut: true, neck: 17, hairLit: true,
    ear: [1.07, -12.2, 3.0], eye: [5.8, -1.2],
    earMark: EAR_ROOSEVELT, eyeMark: EYE_ROOSEVELT,
    // icon repeats s/cy/cx rather than carrying its own numbers. The old icon
    // trio was fitted to the OLD outline and, held against the traced mask
    // with the corrected one, scored 0.816 where the full tier scores 0.981 —
    // it was correcting for a head that no longer exists. With a measured
    // outline the accuracy-optimal placement is the same at every tier, and
    // the dime's glyph was never one of the two that get enlarged to read
    // small (the cent's and the quarter's are).
    s: 0.97, cy: 45.3, cx: -2.7, iconS: 0.97, iconCy: 45.3, iconCx: -2.7,
  },
  quarter: {
    // MEASURED. `s/cy/cx` are the placement-only optimum against the frozen
    // silhouette (§4): the head was nearly six units too far back and six too
    // low, and moving it alone — path untouched — took the IoU from 0.695 to
    // 0.829, which is 44% of the whole error.
    //
    // `cut: true` is the second correction and it is about the OBJECT. The
    // quarter's bust ends in a long shallow TRUNCATION clear of the rim, like
    // the dime's; it does not run off the bottom of the field. This file's own
    // comment above says so ("the neck simply runs off the bottom of the
    // field, which is why those heads look so big") and the photograph says
    // the opposite for the quarter. The truncation is now part of HEAD and
    // bareNeck() is no longer drawn here, so the nickel's use of it is
    // untouched.
    //
    // NO `ear`. Both usable references — a 1994-P and the 1999+ obverse —
    // show NO EAR on this coin: the wig's front curls come down over it and
    // what is there is a cluster of rolled curls, with bare cheek below. The
    // shared glyph was drawing a helix on open skin, which is §7's "do not add
    // anatomy the coin does not have". `earMark` carries the curls instead.
    who: 'Washington', dir: -1, bare: true, cut: true, neck: 17, hairLit: true,
    eye: [8.7, -2.7], earMark: CURLS_WASHINGTON,
    s: 0.98, cy: 41.8, cx: -0.4, iconS: 1.02, iconCy: 41.8, iconCx: -4.0,
  },
};

// Both closures below finish on the FIELD circle with a real arc. That is
// the alternative to a clipPath — which would need <defs> and a
// document-unique id, and a hundred inlined coins would collide on it.
// Closing the silhouette on the arc is exact, id-free and free at runtime.
const onField = (rIn, deg) => {
  const a = (deg * Math.PI) / 180;
  return [50 + rIn * Math.cos(a), 50 + rIn * Math.sin(a)];
};

// A bare neck, cropped by the bottom of the field — how the dime, nickel
// and quarter really end. `dir` decides which side of the disc the throat
// is on, so the arc has to run the other way when the portrait is mirrored.
function bareNeck(rIn, dir, s, cx, cy) {
  // 70°/110° rather than 66°/114°: a neck of constant width reads as a
  // plinth with a head on it, so it still WIDENS as it goes down, but the
  // first pass widened it so far that the dime and the quarter both looked
  // like a head resting on a pair of shoulders — which is exactly what the
  // reference photographs say is NOT there.
  const front = dir > 0 ? 70 : 110; // the throat, under the chin
  const back = dir > 0 ? 110 : 70; // the nape
  const [fx, fy] = onField(rIn, front);
  const [bx, by] = onField(rIn, back);
  const ox = 50 + cx;
  const tFx = ox + dir * 12 * s;
  const tFy = cy + 25 * s;
  const tBx = ox - dir * 11 * s;
  const tBy = cy + 21 * s;
  return `<path d="M ${n2(tFx)} ${n2(tFy)}
    C ${n2(ox + dir * 11 * s)} ${n2(cy + 38 * s)} ${n2(fx)} ${n2((fy + tFy) / 2)} ${n2(fx)} ${n2(fy)}
    A ${rIn} ${rIn} 0 0 ${dir > 0 ? 1 : 0} ${n2(bx)} ${n2(by)}
    C ${n2(bx)} ${n2((by + tBy) / 2)} ${n2(ox - dir * 18 * s)} ${n2(cy + 38 * s)} ${n2(tBx)} ${n2(tBy)} Z"/>`;
}

// A cubic whose two control points are given as a fraction ALONG the chord
// plus a bow measured PERPENDICULAR to it, outward from the bust. That is the
// whole point of the helper. The version of coat() below this one gave each
// control point a free (x, y) in coin units, and the two that drew the back of
// the shoulder were 8 and 5 units of pure sideways pull — which is how a
// 78-degree garment came to be drawn as a 120-degree one. A bow is bounded by
// its own number and cannot run away, and multiplying the normal by `dir` puts
// "outward" on the correct side of a mirrored portrait without a second case.
function bow(x0, y0, x1, y1, dir, t1, b1, t2, b2, s) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const L = Math.hypot(dx, dy) || 1;
  const nx = (dir * -dy) / L;
  const ny = (dir * dx) / L;
  const at = (t, b) => [x0 + dx * t + nx * b * s, y0 + dy * t + ny * b * s];
  return [x0, y0, ...at(t1, b1), ...at(t2, b2), x1, y1];
}
const curveTo = (c) => `C ${n2(c[2])} ${n2(c[3])} ${n2(c[4])} ${n2(c[5])} ${n2(c[6])} ${n2(c[7])}`;
const pathOf = (c) => `M ${n2(c[0])} ${n2(c[1])} ${curveTo(c)}`;
// Traverse a cubic the other way, so a seam that is built rim-to-throat can be
// split from the THROAT end.
const flip = (c) => [c[6], c[7], c[4], c[5], c[2], c[3], c[0], c[1]];
// Slide a whole cubic sideways along its chord's normal. `k` carries the sign.
// The closed silhouette is traversed nape -> back seam -> arc -> front seam ->
// throat, so `back` and `front` run the SAME way round the outline and share a
// sign (-dir), while `flip(front)` reverses it and takes +dir. Getting that
// backwards pushes a decoration straight out of the coat, which is how the
// first attempt at this scored 51% outside instead of 25%.
function shift(c, k, d) {
  const dx = c[6] - c[0], dy = c[7] - c[1], L = Math.hypot(dx, dy) || 1;
  const ox = (k * -dy * d) / L, oy = (k * dx * d) / L;
  return c.map((v, i) => v + (i % 2 ? oy : ox));
}
// de Casteljau, first `t` of a cubic. The lit edge below is meant to be "the
// same curve as the garment's back seam, drawn once more in white"; splitting
// the seam is how that sentence becomes true rather than approximately true.
function subCurve(c, t) {
  const l = (a, b) => a + (b - a) * t;
  const ax = l(c[0], c[2]), ay = l(c[1], c[3]);
  const bx = l(c[2], c[4]), by = l(c[3], c[5]);
  const cx2 = l(c[4], c[6]), cy2 = l(c[5], c[7]);
  const dx = l(ax, bx), dy = l(ay, by);
  const ex = l(bx, cx2), ey = l(by, cy2);
  return [c[0], c[1], ax, ay, dx, dy, l(dx, ex), l(dy, ey)];
}

// THE COAT, and it is a bigger deal than it looks. On both the cent and the
// nickel the bust occupies the bottom third of the coin and the shoulder
// runs across it as a strong DIAGONAL — higher behind the head, dropping
// away in front — because the sitter is turned. An earlier version drew a
// symmetrical collar with two little wings and it read as a plinth: the
// portrait looked mounted rather than worn.
//
// So: the neck is drawn first (same shape and same tone as a bare-necked
// coin, so the throat is skin), then the garment is laid over it from the
// collar down, in the lighter `cloth` tone.
//
// MEASURED, 2026-08-13, and the sentence above was the only part that was
// right. Scored against the coat half of the two frozen bust masks — a region
// no previous pass had ever looked at, because _pyeval/_nkeval both clip it
// away — this garment was 1.43x the cent's area and 1.21x the nickel's, and it
// met the field circle over 120 degrees of arc where BOTH coins use 78. It was
// the fifth instance of §22.5: drawn to fill the disc rather than to fit the
// object. The geometry now lives in `OBVERSE[id].coat`, seeded from the masks
// and then finished by a constrained sweep on coat-band IoU (which moved
// nothing by more than 1.5 degrees):
//
//                        cent                 nickel
//                     mask  drawn  was     mask  drawn  was
//   rim arc, back     37.8   39.3   60     43.5   43.5   60
//   rim arc, front    40.5   40.5   54     34.8   33.3   54
//   total span        78.3   79.8  114     78.3   76.8  114
//
// So the DIAGONAL is not in the footprint — the two coins meet the rim almost
// symmetrically about six o'clock — it is in the coat's upper boundary, which
// on the cent stands at v = 0.29 behind the head and v = 0.48 in front of it at
// the same |u|. Higher behind, exactly as claimed; measured in the wrong place.
// Coat-band IoU against the frozen masks: cent 0.689 -> 0.923, nickel
// 0.823 -> 0.989. Full record in coloringbook/shoulder-fix.md.
function coat(rIn, dir, s, cx, cy, neck, g) {
  const ox = 50 + cx;
  const yN = cy + neck * s; // the collar, below the beard / below the queue
  // `dir > 0` faces right, so the back of the shoulder is on the LEFT of the
  // disc; both angles are stated as degrees from straight down so the two
  // coins' numbers can be compared with each other and with the photographs.
  const backA = 90 + dir * g.back;
  const frontA = 90 - dir * g.front;
  const [bx, by] = onField(rIn, backA);
  const [fx, fy] = onField(rIn, frontA);
  const nB = ox - dir * 14 * s; // where the collar crosses at the nape
  const nF = ox + dir * 9 * s; // and at the throat, a little lower
  const sweep = dir > 0 ? 0 : 1;
  // THE TWO SEAMS. `back` runs from the nape out to the rim behind the head,
  // `front` comes back from the rim to the throat; between them the silhouette
  // closes on the field circle with a real arc, which is what stands in for the
  // clipPath this file refuses to use (§8).
  //
  // Both are drawn with `bow()`, and that buys containment for free: a cubic
  // never leaves the convex hull of its four points, all four of those points
  // are inside the field circle, and a disc is convex. The old form could not
  // make that promise, which is why the lapel used to need a forty-round binary
  // search to keep it on the coin.
  const back = bow(nB, yN - 4 * s, bx, by, dir, g.bt1, g.bb1, g.bt2, g.bb2, s);
  const front = bow(fx, fy, nF, yN + 2 * s, dir, g.ft1, g.fb1, g.ft2, g.fb2, s);
  // …and the same trick keeps the two DECORATIONS inside the garment. Both used
  // to be freehand curves that happened to sit near a seam; when the coat was
  // measured and narrowed, the cent's lapel ended up with 25% of its length
  // drawn on bare field, because nothing tied it to the edge it belonged to.
  // Each is now a piece of a seam, split with de Casteljau and pushed straight
  // in along the seam's own inward normal — so shrinking the coat moves them
  // with it and neither can ever escape again.
  const lapel = `<path fill="none" d="${pathOf(shift(subCurve(flip(front), g.lapF), dir, g.lapOff * s))}"/>`;
  // The shoulder catches the light along its top edge — the same curve as the
  // garment's back seam. On a struck coin the cloth is the lowest relief on the
  // whole face, and without this line it is the only thing that stays completely
  // flat. It STOPS SHORT of the rim: run out to the field circle it read as a
  // wire laid across the coat rather than as a lit edge. `litOff` holds it just
  // inside the dark contour, because a highlight centred ON the outline is half
  // painted over by it.
  const lit = `<path fill="none" stroke="#ffffff" stroke-width="${n2(1.2 * s)}" opacity="0.26"
      stroke-linecap="round" d="${pathOf(shift(subCurve(back, g.litT), -dir, g.litOff * s))}"/>`;
  return `<path d="M ${n2(nB)} ${n2(yN - 4 * s)} ${curveTo(back)}
      A ${rIn} ${rIn} 0 0 ${sweep} ${n2(fx)} ${n2(fy)}
      ${curveTo(front)}
      Z"/>${lapel}${lit}`;
}

// Lincoln's bow tie, which the real cent has and which is worth the four
// curves it costs: it is the one thing on the whole coin that is obviously
// an ITEM OF CLOTHING, and a child who has spotted it once will look for it
// again. Drawn in the head tone against the darker coat so it separates.
const bowTie = (ox, y, k) =>
  `<path d="M ${n2(ox - 8 * k)} ${n2(y - 3.4 * k)} L ${n2(ox - 2 * k)} ${n2(y)}
     L ${n2(ox - 8 * k)} ${n2(y + 3.4 * k)} Z
     M ${n2(ox + 8 * k)} ${n2(y - 3.4 * k)} L ${n2(ox + 2 * k)} ${n2(y)}
     L ${n2(ox + 8 * k)} ${n2(y + 3.4 * k)} Z"/>
   <circle cx="${n2(ox)}" cy="${n2(y)}" r="${n2(2.1 * k)}"/>`;

// The portrait. Below `full`, the relief marks are DELETED rather than
// shrunk — a 1.5-unit eye at 38px is a smudge that reads as damage, not as
// a face. What is NEVER deleted is the outline, the queue or the beard,
// because those are the four identities and they are all silhouette.
//
// At `icon` the neck and coat are dropped and the head is re-centred to fill
// the disc on its own: Lincoln's beard hangs low off a wavy crown,
// Jefferson's queue drops behind a big smooth mass, Washington's back is
// three bumps with a bow behind it, and Roosevelt is the small tight one
// with nothing sticking out anywhere. Mass, not detail, is what a 19px disc
// can show.
function bust(id, tier, p, dim, boxW) {
  const o = OBVERSE[id];
  const icon = tier === 'icon';
  const s = icon ? o.iconS : o.s;
  const cy = icon ? o.iconCy : o.cy;
  const cx = icon ? o.iconCx : o.cx;
  const head = icon ? p.deep : p.motif;
  // THE CONTOUR, and it is the most valuable line in the file. Wave 1 shows
  // ONE coin with no sibling, so the head's OUTLINE is what the child has to
  // read — beard, queue, crop or wig. A flat fill on a mid-tone field left
  // that outline soft, and a soft outline is a soft answer. One dark stroke
  // around the whole silhouette sharpens exactly the thing being asked
  // about, and it is honest to the object: a struck portrait stands proud of
  // the field and catches a shadow all the way round.
  //
  // `/s` because the stroke is inside the scaled group; the sw() floor keeps
  // it at least one device pixel on the 62px dime wave 1 draws.
  const edgeW = n2(sw(1.15, 0.9, boxW) / s);
  // The coat is LIGHTER than the head, not darker. With a dark garment under
  // a mid-tone face the hierarchy inverted and the cent read as a mountain
  // wearing a man; the head has to be the darkest thing on the coin because
  // the head is the question. A bare neck is the same piece of person as the
  // head, so it takes the head's tone and no seam is drawn across the throat.
  const cloth = o.bare ? head : p.cloth;
  // `fine` is a SECOND detail step inside `full`, taken from real pixels
  // rather than from the tier: 130px is where a 1.3-unit line stops being a
  // fleck and starts being a lock of hair. A teaching card at 190 gets the
  // close-spaced work; the 84px recognition coin does not, and is cleaner
  // for it.
  const fine = boxW >= 130;
  const r = RELIEF[o.who];
  // THREE stroke groups, not two, and the middle one is the change this pass
  // turns on. `groove` is DARK line work drawn in `deep` rather than `ink`:
  // shadow in silver, not a line in pencil. It is what lets the dime's hair
  // be the same tone as its face and still read as hair — and it goes down
  // BEFORE the lit ridges, because on a struck coin the cut comes first and
  // the light sits on what is left standing.
  const grooves =
    r.groove
      ? `<g fill="none" stroke="${p.ink}" stroke-linecap="round" stroke-linejoin="round" opacity="0.33">
           ${r.groove}${fine ? r.grooveFine || '' : ''}</g>`
      : '';
  // and the face modelling, at two thirds of the jaw's weight — heavy enough
  // to be a shadow, light enough that no single one of them becomes a line
  // drawn ON the face.
  const modelling =
    r.face
      ? `<g fill="none" stroke="${p.ink}" stroke-linecap="round" stroke-linejoin="round" opacity="0.28">
           ${r.face}${fine ? r.faceFine || '' : ''}</g>`
      : '';
  // THE TWO TONE REGIONS, and they are the phase-2b change. Everything else in
  // this function draws LINES inside the outline; these draw AREAS, which is the
  // only other thing a gradient-free format has. `plane` is the lit frontal
  // planes in `cloth` — the same "fill a mass in a different palette tone" move
  // that fixed the hair, applied to the forehead and the lip mass, both of which
  // the photograph shows as flat plateaus near 1.15 of the cheek rather than as
  // ramps. `shade` is the throat's cast shadow, filled ink at the modelling
  // group's own opacity. Both are `full`-tier only, and both go down BEFORE the
  // line work, because on a struck coin the plane is the form and the grooves
  // and lights are cut into it. See RELIEF.Roosevelt for the scans that placed
  // every edge on a measured tonal step.
  // They go down between the head fill and the HAIR, so the hair's own dark
  // contour draws over the forehead plane's back edge and that edge never
  // becomes a second hairline.
  const planes =
    tier === 'full' && r.plane ? `<g fill="${p.cloth}" stroke="none">${r.plane}</g>` : '';
  const shade =
    tier === 'full' && r.shade ? `<g fill="${p.ink}" stroke="none" opacity="0.28">${r.shade}</g>` : '';
  // `grooves`, `modelling`, `planes` and `shade` are EMPTY for the other three
  // heads and are concatenated with no separator of their own, so the cent, the
  // nickel and the quarter still emit byte for byte the string they emitted
  // before.
  const relief =
    tier === 'full'
      ? `${grooves}<g fill="none" stroke="${p.field}" stroke-linecap="round" stroke-linejoin="round" opacity="0.85">
           ${r.base}${fine ? r.fine : ''}</g>${modelling}
         <g fill="${p.ink}" stroke="${p.ink}" stroke-linecap="round" stroke-linejoin="round" opacity="0.42">
           ${o.eyeMark || eye(o.eye)}${o.earMark || ear(...o.ear)}${r.dark || ''}</g>`
      : '';
  // THE BEVEL. The head is the highest relief on the coin, so it gets the
  // full struck treatment: a lit edge up-left, a cast shadow down-right, the
  // portrait over both. Computed in LOCAL units — the group is scaled by `s`
  // and mirrored by `dir`, so a translate of (tx, ty) here lands at
  // (dir·s·tx, s·ty) on screen, and the x term has to carry `dir` or the
  // light comes from the wrong side on the three left-facing coins.
  const ro = reliefOff(boxW) / s;
  const rx = n2(o.dir * ro);
  const ry = n2(ro);
  const bevel =
    `<path d="${HEAD[o.who]}" transform="translate(${n2(-rx)} ${n2(-ry)})" fill="#ffffff" stroke="none" opacity="${icon ? 0.5 : 0.42}"/>` +
    (icon ? '' : `<path d="${HEAD[o.who]}" transform="translate(${rx} ${ry})" fill="${p.deep}" stroke="none"/>`);
  const rIn = EDGE[id].field[tier];
  // The neck is ALWAYS drawn, coat or no coat, and always in the head's own
  // tone — the throat is skin on every one of the four real coins. The
  // garment then goes over it from the collar down.
  // …except on the dime, where `cut` says the neck is already part of the
  // head path, ends in its own angled truncation and never reaches the rim.
  const strokeW = sw(1.15, 0.9, boxW);
  const below = icon || o.cut
    ? ''
    : `<g fill="${head}" stroke="${p.deep}" stroke-width="${strokeW}" stroke-linejoin="round">
         ${bareNeck(rIn, o.dir, s, cx, cy)}</g>` +
      (o.bare
        ? ''
        : `<g fill="${cloth}" stroke="${p.deep}" stroke-width="${strokeW}" stroke-linejoin="round" stroke-linecap="round">
             ${coat(rIn, o.dir, s, cx, cy, o.neck, o.coat)}</g>` +
          (id === 'penny'
            ? `<g fill="${p.deep}" stroke="none">${bowTie(50 + cx, cy + (o.neck + 3) * s, s)}</g>`
            : ''));
  // Hair (and Lincoln's beard) as a darker mass over the head, at every tier
  // that is not `icon`. At icon the whole bust is one flat shape already, so
  // a second tone inside a 19px disc would only be noise.
  //
  // The queue and the ribbon go in with the hair, because that is what they
  // are. At icon they rejoin the single mass instead, so the silhouette keeps
  // its tail.
  const tail = TAIL[o.who] || '';
  // THE HAIR'S TONE, and on the dime it is neither `hair` nor the face's own
  // silver: at full tier it is `cloth`, the LIGHTEST tone in the palette below
  // the field. Measured on ref/dime-obv-2.jpg against the cheek, the coin's hair
  // runs 1.19 at the crown, 1.13 on the front lock, 1.08 at the back and 0.97
  // where it tucks over the ear. Filling the mass in the face's own tone — what
  // phase 1 did — pins all four of those at 1.00; `cloth` renders at 1.148 of
  // `motif`, which lands inside that band, and the grooves then pull the
  // over-ear patch back down where the coin is darker. No new colour: `cloth` is
  // the coat tone the three silvers already share byte for byte, and the dime
  // has no coat to spend it on.
  // At `mid` there is no line work at all, so it keeps the darker fill,
  // which is the only channel a 40px coin has left.
  const hairFill = o.hairLit && tier === 'full' ? p.cloth : p.hair;
  // LINCOLN'S BEARD IS ITS OWN MASS AND ITS OWN TONE. It used to ride inside
  // the hair group in `hair`, which put it at 0.818 of the cheek; on both
  // usable photographs the real beard is 0.548 and 0.626, the darkest thing on
  // the coin, because it is the deepest cut on the die. `deep` renders at
  // 0.717 and the grooves take the jaw the rest of the way. The other three
  // heads emit no beard at all, so their strings are unchanged byte for byte.
  const beard = o.who === 'Lincoln' && !icon
    ? `<g fill="${p.deep}" stroke="${p.deep}" stroke-width="${n2(sw(0.9, 0.7, boxW) / s)}" stroke-linejoin="round"><path d="${BEARD}"/></g>`
    : '';
  const hair = icon
    ? ''
    : `<g fill="${hairFill}" stroke="${p.deep}" stroke-width="${n2(sw(0.9, 0.7, boxW) / s)}" stroke-linejoin="round"><path d="${HAIR[o.who]}"/>${tail}</g>${beard}`;
  return `<g${dim ? ' opacity="0.42"' : ''}>
      ${below}
      <g fill="${head}" stroke="${p.deep}" stroke-width="${edgeW}" stroke-linejoin="round"
         transform="translate(${n2(50 + cx)} ${cy}) scale(${n2(o.dir * s)} ${n2(s)})">
        ${bevel}<path d="${HEAD[o.who]}"/>${icon ? tail : ''}${planes}${shade}${hair}${relief}</g>
    </g>`;
}

// ───────────────────────────────────────────────────────────── the reverses
//
// Why the reverse exists at all: four presidential profiles are four ovals
// with a nose, and at 26px they are the same oval. Four reverse motifs are
// not, IF each is given a distinct gesture rather than a distinct subject.
// Every motif below is sized so its bounding shape reaches the field edge,
// and every one of them is a FILL — no motif detail is ever a stroke, so
// none of it can thin away.

// ── The two buildings, and why they do not collide ───────────────────────
//
// Penny and nickel both carry a columned building, which is precisely the
// trap an earlier candidate named: "a building" is not an identity. Two
// passes tried to solve that by INVENTING a difference — squashing the
// Memorial into a letterbox and stretching Monticello into a steeple with a
// spire on top, so the two silhouettes could not be confused. It worked, and
// it was wrong: real Monticello has no spire and is wider than it is tall.
// Coins that are easy to tell apart from EACH OTHER and hard to match to the
// objects fail the only test this file has.
//
// Drawn honestly, they separate anyway, on their ROOFLINE:
//
//   Lincoln Memorial  ONE FLAT LINE the entire width — a uniform colonnade
//                     under a flat roof, over broad steps. Nothing whatever
//                     rises above it.
//   Monticello        a roofline in THREE STEPS each side, rising from low
//                     end pavilions through taller wings to a triangular
//                     PEDIMENT with a shallow DOME peaking behind it.
//
// Flat bar against stepped peak. Squint at either, or shrink it to 20px, and
// the answer is still there — and it is the answer the real coin gives.
//
// WHAT THE PREVIOUS PASS GOT WRONG was believing the gesture was enough.
// Measured at 190px it spent 5260 characters on Lincoln's head and 1847 on
// the whole Memorial: a bar, seven slots and three little boxes for a
// statue. At the size the app draws a teaching card that is not a building,
// it is a token FOR a building, and a child looking at a real cent has
// nothing to match. Both are rebuilt below to the standard of the obverses —
// attic, entablature, architrave, a colonnade with lit shafts against a
// shadowed recess, capitals, plinths, a terrace and steps on the Memorial;
// dome, pediment, six-column portico, door, stepped wings, end-pavilion
// colonnades, windows and a roof balustrade on Monticello.
//
// Each returns `{ solid, detail }`:
//   solid   the outer massing, fills only and no colours of its own, so
//           `struck()` can print it three times for the bevel.
//   detail  everything INSIDE the massing — the dark recess between the
//           columns, the lit leading edge of each shaft, a window, a step's
//           line of light. It carries its own colours and goes on last.
//
// Every x below is bounded by the FIELD circle, radius 41 at full tier, plus
// the bevel's extra unit down-right: at y = 68 the widest a slab can be is
// ±35.7 about the centre line. An early pass let the steps reach y = 73 and
// they sliced straight through the rim.

// Penny — the Lincoln Memorial (Frank Gasparro, 1959–2008; pre-1989, so
// public domain like the rest. NOT the 2010 Union Shield, which is not).
// GESTURE: LOW AND WIDE — a long colonnade under a flat roof, over a
// terrace that runs wider still.
// MEASURED off `coloringbook/ref/penny-rev-2.png`, disc-normalised into this
// viewBox (see coloringbook/reverses.md and `_rvtarget.json`). Every number
// below is a reading, not a proportion someone liked:
//
//   COUNT   12 columns. Counted twice, from two independent references —
//           the struck cent's capital band (12 maxima, pitch 4.94) and
//           Gasparro's own plaster model in raw pixels (12 line PAIRS
//           bounding 12 shafts). §15.1's gate is zero error and this is it.
//   RHYTHM  centres 22.65 .. 76.97, mean gap 4.94, the centre (statue) bay
//           5.85 on the coin. The plaster says 4.95 there, i.e. the two
//           references DISAGREE about the widening by 0.18 of a gap; it is
//           drawn at the coin's value and the disagreement is published.
//   BANDS   the horizontal lines are what survives the shrink:
//           30.5 roof · 32.1/37.8 attic frieze · 39.9 dentils ·
//           41.85 colonnade top · 58.2 colonnade foot · 59.6 terrace ·
//           65.0 the bottom step. The previous drawing ran 27.0 .. 68.6,
//           i.e. 41.6 units tall where the coin's is 34.5 — 20% too tall,
//           which is why it read as a letterbox rather than as a temple.
function lincolnMemorial(tier, p, boxW) {
  if (tier === 'icon') {
    // §15.4: at 20px the twelve columns are one device pixel each. Four fat
    // field-coloured gaps are NOT a colonnade at that size, they are the
    // stripe artefact §16.1 names — measured, the old icon carried 1.9x the
    // reference's along-band variation. The colonnade becomes ONE BLOCK,
    // lifted to `motif` against the `deep` slabs above and below it, which
    // is the one thing the blurred photograph does say: the colonnade zone
    // is LIGHTER than the roof and terrace shadows that frame it.
    return {
      solid:
        '<rect x="20.5" y="31" width="59" height="7.5"/>' +
        '<rect x="16" y="38.5" width="68" height="4"/>' +
        '<rect x="17.5" y="42.5" width="65" height="16"/>' +
        '<rect x="13.5" y="58.5" width="73" height="7"/>',
      detail: `<rect x="18.5" y="43.5" width="63" height="14" fill="${p.motif}"/>`,
    };
  }
  const full = tier === 'full';
  // A second detail step INSIDE `full`, taken from real pixels rather than
  // from the tier: at 130px a 1.2-unit dentil is a dentil, and at 84 it is a
  // speck of dirt on the die.
  const fine = full && boxW >= 130;

  // TWELVE columns, and the count is a hard gate (§15.1): it is what makes
  // this building the Memorial. At `mid` a column is 1.5 device pixels, so
  // the honest answer is not "draw eight" — eight is a DIFFERENT BUILDING —
  // it is to draw none and let the colonnade be one lit block, exactly as
  // at `icon`. `bayCentres(19.9, 80.1, 12, 0.91)` reproduces the measured
  // centres to a worst error of 0.13 of one gap.
  const centres = bayCentres(19.9, 80.1, 12, 0.91);

  const solid =
    // roof cornice and the attic storey (the one carrying the state names)
    '<rect x="20.5" y="30.5" width="59" height="1.6"/>' +
    '<rect x="21.5" y="32.1" width="57" height="5.7"/>' +
    // the entablature, overhanging both ways — the strongest horizontal on
    // the coin and the reason the silhouette reads low and wide
    '<rect x="16.5" y="37.8" width="67" height="2.1"/>' +
    '<rect x="17.2" y="39.9" width="65.6" height="1.95"/>' +
    // the colonnade block, then what it stands on. The terrace is a single
    // broad platform on the coin, not a flight of narrow ledges: the stair
    // is cut INTO it up the middle and shows as lines, not as a silhouette.
    '<rect x="17.5" y="41.85" width="64.8" height="16.35"/>' +
    '<rect x="16" y="58.2" width="68" height="1.4"/>' +
    '<rect x="13.5" y="59.6" width="73" height="5.4"/>';

  const detail =
    // THE RECESS. Everything between the columns is the deepest cut in the
    // die; drawing it as the brightest part of the building (which is what
    // cutting field-coloured slots does) inverts the whole face. It is a
    // HALF-STRENGTH deep, not a full one: measured, a full-strength recess
    // gave the band 1.6x the reference's along-band variation at 84px.
    `<g fill="${p.deep}" opacity="0.55"><rect x="18" y="41.85" width="64" height="16.35"/></g>` +
    // Drawn at `mid` as well as `full`, and that is the measurement talking:
    // at a 42px box the reference's colonnade band still carries 0.20 of
    // along-band high-frequency energy, and a flat block carried 0.00. Twelve
    // aliased columns are closer to the coin than eight clean ones or none.
    columns(centres, 3.0, 43.2, 57.2, p, fine) +
    // capital band and plinth band: the shafts have to stop on something
    `<rect x="18" y="41.85" width="64" height="1.35" fill="${p.motif}"/>` +
    `<rect x="18" y="57.2" width="64" height="1.0" fill="${p.motif}"/>` +
    ledge(18, 82, 41.85, 0.3) +
    // the seated figure, lit against the shadow of his own bay. The bay he
    // sits in is the widened centre one — measured 5.85 against a 4.94 mean
    // — and he is 3.0 units wide, which is what fits it. Full tier only: at
    // 54px he is three pixels and reads as a chip in the die.
    (full
      ? `<g fill="${p.motif}"><circle cx="50" cy="45.9" r="1.0"/>
           <path d="M 48.3 47.1 L 51.7 47.1 L 52.2 53.4 L 47.8 53.4 Z"/>
           <rect x="47.2" y="53.4" width="5.6" height="2.1"/></g>
         <rect x="48.3" y="47.1" width="0.7" height="6.3" fill="#ffffff" opacity="0.45"/>`
      : '') +
    // the attic divided into panels, and the dentil course under the
    // entablature — the two pieces of fine masonry the cent actually shows
    (fine
      ? `<g fill="${p.deep}" opacity="0.5">${[27.0, 33.2, 39.4, 45.6, 51.8, 58.0, 64.2, 70.4]
          .map((x) => `<rect x="${x}" y="32.9" width="0.8" height="4.0"/>`)
          .join('')}</g>` +
        `<g fill="${p.deep}" opacity="0.45">${Array.from({ length: 21 }, (_, i) => 17.6 + i * 3.15)
          .map((x) => `<rect x="${n2(x)}" y="40.1" width="1.1" height="0.9"/>`)
          .join('')}</g>` +
        // the broad central staircase, cut into the terrace
        `<g fill="${p.deep}" opacity="0.4">${[60.6, 61.9, 63.2]
          .map((y) => `<rect x="31" y="${y}" width="38" height="0.6"/>`)
          .join('')}</g>`
      : '') +
    // and the lines of light and shadow that turn a stack of slabs into
    // steps. Without these the whole base is one grey ramp.
    ledge(21, 79, 30.5) +
    ledge(16.5, 83.5, 37.8) +
    shade(16.5, 83.5, 39.0, p, 0.4) +
    ledge(16, 84, 58.2) +
    shade(16, 84, 59.0, p) +
    ledge(13.5, 86.5, 59.6) +
    shade(13.5, 86.5, 63.9, p);
  return { solid, detail };
}

// Nickel — Monticello, as it sat on the 1938–2003 reverse.
//
// THIS IS THE SECOND TIME THIS MOTIF HAS BEEN DRAWN WRONG ON PURPOSE, and
// the correction is worth writing down because the reasoning was seductive
// both times. An earlier brief asked for Monticello "tall and centred with a
// spire" so it could not be confused with the cent's Memorial. Held against
// `coloringbook/ref/nickel-rev-2.png` that is simply not the building: real
// Monticello is WIDE AND LOW — about twice as wide as it is tall — and it
// has NO SPIRE AT ALL. What it has is a shallow dome over a triangular
// pediment, a columned portico under that, and long wings STEPPING DOWN
// either side to end pavilions.
//
// The invented gesture also was not needed, which is the part worth
// remembering: accuracy and distinctiveness agree here.
//
//   Memorial     ONE FLAT ROOFLINE the whole width. Nothing rises above it.
//   Monticello   a roofline in THREE STEPS each side, with a dome and a
//                pediment peaking in the middle.
//
// Flat bar versus stepped peak is a real difference a child can check
// against real change. Stretching Monticello into a steeple made our two
// coins easy to tell apart from each other and harder to match to the
// objects, which is the whole failure mode this file exists to avoid.
// MEASURED off THREE independent photographs — `nickel-rev-2.png`,
// `nickel-rev.jpg` and `nickel-rev-proof.png` (checked genuinely different:
// NCC 0.13 and −0.39 against each other) — disc-normalised into this viewBox.
//
//   COUNT   FOUR portico columns, at 39.07 / 46.23 / 53.90 / 61.20, mean gap
//           7.38. All three references give four and they agree on the
//           centres to 0.6 of a unit. THIS DRAWING PREVIOUSLY HAD SIX, and
//           six is not a near miss: §15.1's threshold is zero. What the
//           extra two were is identifiable — between the four columns sit
//           three openings, a plain one either side of a CENTRE DOOR under
//           its own little pediment, and drawing those openings as columns
//           is exactly how a colonnade acquires phantom members.
//   BANDS   dome 30.5..38.0 · pediment apex 34.5, base 41.5 · wing roofline
//           40.8 with the balustrade from 39.0 · cornices 43.3 and 45.4 ·
//           building foot 58.5 · terrace 60.4.
//   WIDTHS  dome 41..59 · pediment 33..67 · portico 35..65 · main block
//           18..82 · ends 12.8..86.1 · terrace 11.5..88.5.
function monticello(tier, p, boxW) {
  if (tier === 'icon') {
    // §15.4 again: three field-coloured slots at 23px are stripes, not a
    // portico. One lit block under the pediment, and the stepped roofline —
    // dome, pediment, wings, ends — carries the whole identity.
    return {
      solid:
        '<path d="M 42 33 A 8 6.4 0 0 1 58 33 Z"/>' +
        '<path d="M 50 33 L 64 42 L 36 42 Z"/>' +
        '<rect x="35" y="41" width="30" height="18"/>' +
        '<rect x="20" y="43.5" width="60" height="15.5"/>' +
        '<rect x="12" y="46" width="76" height="13"/>' +
        '<rect x="11.5" y="59" width="77" height="4"/>',
      detail: `<rect x="36.5" y="43" width="27" height="15" fill="${p.motif}"/>`,
    };
  }
  const full = tier === 'full';
  const fine = full && boxW >= 130;
  // FOUR columns across the portico. Measured centres 39.07 46.23 53.90
  // 61.20; `bayCentres(35.4, 64.6, 4, 0.4)` puts them at 39.05 46.25 53.75
  // 60.95, a worst error of 0.25 units = 0.034 of one gap.
  const centres = bayCentres(35.4, 64.6, 4, 0.4);
  // The end bays carry a pilaster either side of their window on the real
  // coin — two marks a side, not the three-bar colonnade drawn before.
  const padL = [15.0, 19.6];
  const padR = padL.map((x) => 100 - x);

  // THE ROOFLINE, and the order of it is the whole motif. The first attempt
  // at this had the wings' roof ABOVE the portico's, which flattens the
  // middle and turns the dome into a hat floating over a shed. On the coin
  // the levels run, lowest first: end pavilions → wings → portico cornice →
  // pediment → dome. Five steps up to the middle, five back down.
  const solid =
    // the dome — SHALLOW, sitting behind the pediment. A half-ball on a
    // drum is a mosque; this is a saucer with its bottom hidden. Measured
    // 41..59 wide, top 30.5, base 38.0.
    '<path d="M 41 38 A 9 7.5 0 0 1 59 38 Z"/>' +
    '<rect x="43" y="37" width="14" height="3"/>' +
    // the pediment (apex 34.5, base 41.5, 33..67) and the portico cornice
    '<path d="M 50 34.5 L 67 41.5 L 33 41.5 Z"/>' +
    '<rect x="34" y="41.5" width="32" height="1.8"/>' +
    '<rect x="35" y="43.3" width="30" height="15.2"/>' +
    // the wings, a step lower: roofline 40.8, cornice 43.3, block 18..82
    '<rect x="19" y="40.8" width="62" height="2.5"/>' +
    '<rect x="18" y="43.3" width="64" height="15.2"/>' +
    // the end bays, a step lower again, running the full measured width
    '<rect x="12.8" y="45.4" width="74.4" height="2.2"/>' +
    '<rect x="13.4" y="47.6" width="73.2" height="10.9"/>' +
    // the long terrace the whole house stands on
    '<rect x="11.5" y="58.5" width="77" height="1.9"/>';

  const detail =
    // portico: a shadowed recess with FOUR lit columns in front of it. The
    // recess is half-strength `deep` for the same reason as the cent's —
    // full strength put more along-band variance in the drawing than the
    // photograph has.
    `<g fill="${p.deep}" opacity="0.55"><rect x="35.6" y="43.3" width="28.8" height="15.2"/></g>` +
    columns(centres, 2.6, 44.4, 57.6, p, fine) +
    `<rect x="35.6" y="43.3" width="28.8" height="1.1" fill="${p.motif}"/>` +
    `<rect x="35.6" y="57.6" width="28.8" height="0.9" fill="${p.motif}"/>` +
    // THE CENTRE DOOR, under its own small pediment — the feature that the
    // six-column version was drawing as two extra columns. It sits in the
    // MIDDLE opening, between columns 2 and 3, and the two openings either
    // side of it are plain.
    (full
      ? `<rect x="47.5" y="49" width="5.5" height="9.5" fill="${p.motif}"/>` +
        `<rect x="48.4" y="50.4" width="3.7" height="8.1" fill="${p.deep}"/>` +
        `<path d="M 46.9 48.6 L 50.25 46.2 L 53.6 48.6 Z" fill="${p.motif}"/>` +
        `<g fill="${p.deep}" opacity="0.5"><rect x="41.5" y="49" width="3.5" height="9.5"/>
           <rect x="55.5" y="49" width="3.5" height="9.5"/></g>`
      : '') +
    // the end bays: a pilaster either side of each end window
    `<g fill="${p.deep}" opacity="0.6">${[...padL, ...padR]
      .map((x) => `<rect x="${n2(x - 0.9)}" y="48.4" width="1.8" height="9.8"/>`)
      .join('')}</g>` +
    // wing windows: two tall ones a side at the MEASURED 22.0 and 30.5,
    // spanning 49.0..55.5 — the pair drawn before sat at 29.5 and 34, both
    // crowded against the portico with the outer half of each wing blank.
    `<g fill="${p.deep}">${(full ? [22.0, 30.5] : [26.5])
      .flatMap((x) => [x, 100 - x])
      .map((x) => `<rect x="${n2(x - 1.5)}" y="49" width="3" height="6.5"/>`)
      .join('')}</g>` +
    (fine
      ? // the balustrade along the wing roofs (measured top 39.0), the
        // pediment's fanlight, and two lit ribs over the dome
        `<g fill="${p.deep}" opacity="0.45">${[21, 24, 27, 30, 33, 67, 70, 73, 76, 79]
          .map((x) => `<rect x="${x}" y="39" width="1" height="1.8"/>`)
          .join('')}</g>` +
        `<path d="M 47.9 41.5 A 2.1 2.1 0 0 1 52.1 41.5 Z" fill="${p.deep}" opacity="0.6"/>` +
        `<g fill="none" stroke="#ffffff" stroke-width="0.8" opacity="0.3">
           <path d="M 49.2 31.0 C 46.4 32.0 44.2 34.2 43.0 36.6"/>
           <path d="M 50.8 31.0 C 53.6 32.0 55.8 34.2 57.0 36.6"/></g>` +
        `<g fill="#ffffff" opacity="0.4">${[22, 30.5, 69.5, 78]
          .map((x) => `<rect x="${n2(x - 1.9)}" y="48.3" width="3.8" height="0.6"/>`)
          .join('')}</g>`
      : '') +
    ledge(34, 66, 41.5) +
    ledge(19, 81, 40.8) +
    ledge(12.8, 87.2, 45.4) +
    shade(13.4, 86.6, 47.6, p, 0.4) +
    ledge(11.5, 88.5, 58.5) +
    shade(11.5, 88.5, 59.9, p);
  return { solid, detail };
}
// Dime — the torch of the 1946 reverse, with the OLIVE branch on the left
// and the OAK on the right. GESTURE: ONE TALL BAR. It is the only motif in
// the set taller than it is wide, and at icon size the branches go entirely
// and the bar plus its flame is the whole drawing.
//
// The two branches are drawn as two different plants, which they are: olive
// leaves are smooth ovals, oak leaves are lobed and carry acorns. On the
// real dime that asymmetry is obvious and it is the detail that stops the
// motif reading as a wheat ear or a pair of wings.
function torch(tier, p, boxW) {
  // A flame with THREE tongues, not one blob: a single teardrop over a
  // shaft is a lightbulb, and the tongues are what a child sees first.
  // MEASURED off `coloringbook/ref/dime-rev-2.jpg`. ⚠️ THE DIME HAS ONE
  // REFERENCE, NOT TWO: `dime-rev.jpg` and `dime-rev-2.jpg` are the same
  // photograph at 486px and 733px diameter (mean |delta| 5.35 grey levels,
  // NCC 0.9931, where two different coins run 40-90 apart). Everything below
  // is single-source and is labelled as such in coloringbook/reverses.md.
  //
  // The previous torch ran y 10.6 .. 82.5, i.e. 71.9 units for a torch the
  // coin draws in 58.5 (20.0 .. 78.5) — 23% too tall — and its FOOT was 18
  // units wide against a measured 6.6. An 18-unit foot is a lamp base; the
  // dime's torch ends in a small turned knob.
  //   flame  20.0 .. 33.0, 43.5 .. 57.0 wide
  //   head   33.0 .. 38.5, 44.5 .. 55.4
  //   shaft  38.5 .. 69.6, 45.6 .. 54.0   (bands at 40.5 and 53.4)
  //   foot   69.6 .. 78.4, 6.8 wide at its widest
  const flame =
    '<path d="M 50 20 C 52.09 22.52 53.22 24.3 53.54 25.77' +
    ' C 54.34 24.82 54.82 23.78 54.82 22.73 C 56.75 25.14 57.07 27.86 55.79 29.96' +
    ' C 54.66 31.84 52.41 33 50 33 C 47.59 33 45.34 31.84 44.21 29.96' +
    ' C 42.93 27.86 43.25 25.14 45.18 22.73 C 45.18 23.78 45.66 24.82 46.46 25.77' +
    ' C 46.78 24.3 47.91 22.52 50 20 Z"/>';
  // Where the leaves sit on the stem. Shared by the icon tier and the two
  // larger ones so there is exactly ONE description of this branch in the
  // file: `i` of `n` leaves, from the foot of the stem upward.
  const leafAt = (i, n) => {
    const t = i / (n - 1);
    return {
      ay: 62 - 33 * t, // up the stem
      ax: 15.4 + 3.4 * Math.sin(t * 2.4), // following its bow
      rot: 30 + 28 * t, // rising as it climbs
    };
  };
  if (tier === 'icon') {
    // THE BRANCHES ARE DRAWN AT ICON TIER, and until this pass they were not.
    // The comment above this function said "at icon size the branches go
    // entirely and the bar plus its flame is the whole drawing". Phase 6
    // reduced the PHOTOGRAPH to the 19 device pixels the icon really gets
    // (§22.7) and it is a dense dark cluster filling the field; the drawing
    // was a pale disc with a thin vertical bar. Measured inside r < 33, ink
    // coverage was 0.174 against the coin's 0.678, and the ink's bounding box
    // was 5.0x taller than wide against the coin's 1.0. A bar is not what the
    // dime looks like from across a table, and it is the only reverse in the
    // set that was missing most of its own motif.
    //
    // The leaves are plain ellipses here, not the olive/oak pair the larger
    // tiers draw: a leaf is 1.1 DEVICE PIXELS at this size, so a lobe cannot
    // exist, and the five of them per side are not read as five leaves. They
    // are read as the toned mass they add up to, which is exactly what §15.4
    // says a repeated element becomes when it stops resolving.
    //
    // COST, stated because it is a real one (coloringbook/discriminability.md
    // §4): this makes the dime reverse slightly MORE like the quarter reverse.
    // The reverse-only discriminability minimum moves 0.0808 -> 0.0794, −1.7%,
    // and the closest reverse pair changes from nickel/dime to dime/quarter.
    // Two denser variants were measured and rejected: they bought less ink
    // fidelity and cost 5–6%.
    const iconBranch = (mirror) => {
      const f = mirror ? -1 : 1;
      const x = (v) => n2(50 + f * v);
      let g = '';
      for (let i = 0; i < 5; i++) {
        const L = leafAt(i, 5);
        g += `<g transform="translate(${x(L.ax + 6.2)} ${n2(L.ay - 1.6)}) rotate(${n1(-f * L.rot)})">` +
          '<ellipse cx="0" cy="0" rx="5.93" ry="2.9"/></g>';
      }
      return `<path d="M ${x(13.0)} 65 C ${x(18.4)} 54 ${x(19.2)} 41 ${x(14.6)} 27.5
        L ${x(17.2)} 27.2 C ${x(22.0)} 41 ${x(21.2)} 55 ${x(15.8)} 66 Z"/>${g}`;
    };
    return {
      solid: `${flame}<rect x="44.5" y="32.6" width="11" height="6" rx="1.5"/>
        <rect x="45.6" y="38" width="8.8" height="32"/>
        <rect x="46.6" y="69.4" width="6.8" height="9" rx="1.6"/>
        ${iconBranch(false)}${iconBranch(true)}`,
      detail: '',
    };
  }
  const full = tier === 'full';
  const fine = full && boxW >= 130;
  const olive = (x, y, rot, k) =>
    `<g transform="translate(${x} ${n2(y)}) rotate(${n1(rot)})"><ellipse cx="0" cy="0" rx="${n2(4.3 * k)}" ry="${n2(2.1 * k)}"/></g>`;
  // An oak leaf is the same footprint with three bites taken out of each
  // side. It costs one path and it is the difference between "two branches"
  // and "the dime's two branches". Kept to three lobes and one decimal
  // place on purpose: the whole branch is printed three times by struck(),
  // so every character in this path is paid for six more times over.
  const OAK =
    'M -4.3 0.1 C -3.6 -1.3 -2.4 -1.1 -1.8 -0.2 C -1.2 -1.9 0.4 -2 1.1 -0.8' +
    ' C 2.6 -1.6 4.3 -0.8 4.3 0.1 C 4.3 1 2.6 1.8 1.1 1' +
    ' C 0.4 2.2 -1.2 2.1 -1.8 0.4 C -2.4 1.3 -3.6 1.5 -4.3 0.1 Z';
  const oak = (x, y, rot, k) =>
    `<g transform="translate(${x} ${n2(y)}) rotate(${n1(rot)}) scale(${n2(k)})"><path d="${OAK}"/></g>`;
  // OLIVE LEFT, OAK RIGHT — the way round the real dime has them; the
  // previous layout had it backwards, and it also hung every leaf off the
  // INSIDE of its stem at a downward angle, which packed them into each
  // other and came out as a centipede. Leaves belong OUTBOARD of the stem,
  // pointing up and away, and spaced further apart than they are long.
  const branch = (mirror) => {
    const f = mirror ? -1 : 1;
    const x = (v) => n2(50 + f * v);
    // Seven leaves, big and OVERLAPPING. Overlap was never the problem — a
    // real branch overlaps — the problem was direction; five small ones
    // spaced clear of each other only turned the centipede into a fern.
    // MEASURED: each branch occupies y 27..63 and reaches 33 units out from
    // the centre line, where the previous parameterisation ran y 31..72 and
    // reached only 27 — it hung down past the foot of the torch and into the
    // space E PLURIBUS UNUM occupies on the coin, and it stopped short at the
    // rim end. Seven leaves a side, which is what the one reference shows,
    // with the count flagged LOW CONFIDENCE in reverses.md.
    const leaves = full ? 7 : 5;
    const k = full ? 1.22 : 1.38;
    let g = '';
    for (let i = 0; i < leaves; i++) {
      const { ay, ax, rot } = leafAt(i, leaves);
      g += mirror
        ? olive(x(ax + 6.2), ay - 1.6, rot, k)
        : oak(x(ax + 6.2), ay - 1.6, -rot, k);
    }
    return `<path d="M ${x(13.0)} 65 C ${x(18.4)} 54 ${x(19.2)} 41 ${x(14.6)} 27.5
      L ${x(17.2)} ${n2(27.2)} C ${x(22.0)} 41 ${x(21.2)} 55 ${x(15.8)} 66 Z"/>${g}`;
  };
  const solid = `${flame}
    <rect x="44.5" y="33" width="10.9" height="5.5" rx="1.5"/>
    <rect x="45.6" y="38.5" width="8.4" height="31.1"/>
    <rect x="45.8" y="69.6" width="8.4" height="3" rx="1"/>
    <rect x="48.3" y="72.6" width="3.4" height="4"/>
    <rect x="46.6" y="76" width="6.8" height="2.4" rx="1"/>
    ${branch(false)}${branch(true)}`;
  // THE INTERIOR. A flat bar is a chimney; the real torch is a fluted
  // cylinder with two collars, and the fluting is what makes it metal.
  const detail =
    `<g fill="#ffffff" opacity="0.45"><rect x="46.4" y="38.9" width="0.8" height="30.3"/>
       <rect x="52.4" y="38.9" width="0.8" height="30.3"/>
       <rect x="44.9" y="33.6" width="0.8" height="4.4"/></g>` +
    // the two BANDS the coin actually cuts, at the measured 40.5 and 53.4
    `<g fill="${p.deep}" opacity="0.5"><rect x="45.6" y="40.1" width="8.4" height="1.0"/>
       <rect x="45.6" y="53.0" width="8.4" height="1.0"/>
       <rect x="44.5" y="36.9" width="10.9" height="1.0"/></g>` +
    (fine
      ? `<g fill="none" stroke="#ffffff" stroke-width="0.8" opacity="0.42" stroke-linecap="round">
           <path d="M 50 21.6 C 51.2 23.7 51.6 25.9 51.0 28.0"/>
           <path d="M 47.3 24.8 C 46.6 26.6 46.6 28.4 47.3 29.9"/></g>`
      : '');
  return { solid, detail };
}

// Quarter — the heraldic eagle of the 1932–1998 reverse, redrawn off
// `coloringbook/ref/quarter-rev-2.png` (the older photograph was gold-toned
// and dark, and the shape taken from it was wrong).
//
// THE SHAPE IS THE WHOLE JOB, and it has now been wrong twice in the same
// direction: the wings were drawn as two nearly HORIZONTAL blades finishing
// at y ≈ 51. MEASURED off the reference disc-normalised into this viewBox,
// the wings SPAN 12..88 and HANG TO y 64 — the leading edge leaves the
// shoulder at y 27.6, runs out and slightly down to a tip at ±37.5 by y 39,
// and the primaries then fall away to their lowest point at ±28.6, y 64,
// almost level with the arrow bundle. The old wing left the whole lower half
// of its own region bare: the band X 18..44, Y 33..53 measured 0.83 of the
// field where the coin measures 0.62, the largest tone error of the four
// reverses and a shape error, not a colour one.
//
// The other three corrections, all from the same photograph:
//   · the BODY is a narrow vertical column of breast feathers — much
//     narrower than the wing span. Drawn broad, it becomes a thorax.
//   · the head is SMALL and set on a slender neck, with a hooked beak.
//   · the bird stands on a horizontal bundle of ARROWS, heads to the left,
//     and an olive wreath sweeps across the bottom under it. Neither is
//     decoration: they are what makes the pose heraldic rather than a bird
//     photographed in flight.
//
// There is NO SHIELD on this eagle. The Great Seal's eagle (drawn on the
// dollar note in this same file) has one on its chest and the quarter's does
// not, and adding one to look "more heraldic" would teach a coin that does
// not exist.
function eagle(tier, p, boxW) {
  const full = tier === 'full';
  const fine = full && boxW >= 130;
  const x = (f, v) => n2(50 + f * v);
  // THE WING, to the measured envelope. Widest point ±37.5 at y 39.5, where
  // the field circle (41.0) still has ±39.4 to spare, and the lowest primary
  // ±28.6 at y 64, where it has ±38.1.
  const wing = (f) => `<path d="M ${x(f, 4.5)} 27.6
      C ${x(f, 14)} 25.4 ${x(f, 26)} 27.2 ${x(f, 32.6)} 31.6
      C ${x(f, 36.4)} 34.2 ${x(f, 37.6)} 36.6 ${x(f, 37.5)} 39.6
      C ${x(f, 37.3)} 45.4 ${x(f, 36.2)} 51.2 ${x(f, 33.4)} 56.4
      C ${x(f, 31.8)} 59.4 ${x(f, 30.4)} 62 ${x(f, 28.6)} 64
      Q ${x(f, 27.2)} 59 ${x(f, 24.8)} 60.4
      Q ${x(f, 23.4)} 55.6 ${x(f, 21)} 56.6
      Q ${x(f, 19.6)} 52 ${x(f, 17)} 52.6
      C ${x(f, 13.4)} 47.6 ${x(f, 9.4)} 40.6 ${x(f, 6.4)} 33.6
      C ${x(f, 5.6)} 31.6 ${x(f, 4.8)} 29.4 ${x(f, 4.5)} 27.6 Z"/>`;
  // HEAD, NECK, BODY, LEGS. Small head, slender neck, narrow body: three
  // separate widths, and getting them wrong in the same direction is what
  // turned an earlier render into a duck sitting on a moth. The head was at
  // y 22.4 and measures 25..31, so the whole column has come down 5.4 units;
  // the body measures 45..55 wide and 31..58 tall.
  const rHead = tier === 'icon' ? 4.2 : 3.5;
  const anatomy = `<circle cx="50" cy="27.8" r="${rHead}"/>
    <path d="M 46.8 26.6 L ${tier === 'icon' ? 41.4 : 42.4} 28.2
      C 44 28.8 44.6 29.8 44.2 31 L 47 30.4 Z"/>
    <path d="M 47.6 29.6 L 52.4 29.6 L 53.8 34 L 46.2 34 Z"/>
    <path d="M 45.4 32 C 44.2 40 44.6 50 46 58 L 54 58
      C 55.4 50 55.8 40 54.6 32 Z"/>
    <rect x="46.8" y="56" width="2.2" height="8"/><rect x="51" y="56" width="2.2" height="8"/>`;
  // THE ARROW BUNDLE, heads to the LEFT and fletching to the RIGHT, exactly
  // as the die cuts it. Two earlier passes drew arrows and both times a long
  // shaft crossing the vertical body read as a dart; it is drawn here BEFORE
  // the tail and in the same fill, so the union hides the crossing and what
  // shows is a stub either side — which is what the coin shows.
  const arrows = full
    ? // ONE bundle, thick, with binding — not two thin parallel bars. Two
      // bars and a point is the arrow GLYPH a child sees on a screen every
      // day, and that is what the first version of this drew.
      // Both ends FLARE rather than come to a point. A single triangle on
      // the left end is the arrow glyph a child sees on a screen every day,
      // and that is exactly what it read as; the real bundle shows several
      // heads bunched together, which at coin size is a widened, ragged end.
      // MEASURED X 31..70, Y 61.5..67.5. The bundle drawn before ran 28.2 to
      // 73.4 — 45 units for a bundle the coin cuts in 39 — and it reached
      // further out on each side than the eagle's own legs are apart.
      `<rect x="34.5" y="61.8" width="31" height="4" rx="1.8"/>
       <path d="M 35.5 60.4 L 31 62 L 31 67 L 35.5 68.6 Z"/>
       <path d="M 65 60.9 L 70 62.2 L 70 66.6 L 65 67.9 Z"/>`
    : '';
  // The tail fan, short and behind the arrows: on the coin it is almost
  // entirely hidden by the bundle, so it stops at 66, not 68.6.
  const tail = `<path d="M 46.2 56 L 53.8 56 C 55 60 54.8 63.4 53.4 66.4
      Q 51.7 64.6 50 66.6 Q 48.3 64.6 46.6 66.4 C 45.2 63.4 45 60 46.2 56 Z"/>`;
  // THE OLIVE WREATH sweeping across the bottom, two branches meeting under
  // the tail. Parametric, so the leaves sit ON the stem instead of beside it
  // — the failure that made the last version's sprigs read as two small
  // animals crouching under the bird.
  const wreath = full
    ? [1, -1]
        .map((f) => {
          const P0 = [50, 79.6];
          const C = [50 + f * 16, 79.6];
          const P1 = [50 + f * 28, 64.6];
          const at = (t) => [
            (1 - t) ** 2 * P0[0] + 2 * (1 - t) * t * C[0] + t * t * P1[0],
            (1 - t) ** 2 * P0[1] + 2 * (1 - t) * t * C[1] + t * t * P1[1],
          ];
          let g = `<path d="M ${n2(P0[0])} ${n2(P0[1] + 1.6)}
            Q ${n2(C[0])} ${n2(C[1] + 1.8)} ${n2(P1[0])} ${n2(P1[1] + 1.6)}
            L ${n2(P1[0] - f * 2.6)} ${n2(P1[1] - 0.8)}
            Q ${n2(C[0] - f * 1.8)} ${n2(C[1] - 1.6)} ${n2(P0[0])} ${n2(P0[1] - 1.6)} Z"/>`;
          for (const t of [0.16, 0.32, 0.48, 0.64, 0.79, 0.92]) {
            const [cx, cy] = at(t);
            const rot = f * -(14 + 34 * t);
            g += `<ellipse cx="0" cy="0" rx="5.2" ry="2.6"
              transform="translate(${n2(cx + f * 2)} ${n2(cy - 3.6)}) rotate(${n1(rot)})"/>`;
          }
          return g;
        })
        .join('')
    : '';
  const solid = `${wing(1)}${wing(-1)}${arrows}${tail}${anatomy}${wreath}`;

  // FEATHERS. Primaries radiating from each wrist out to the trailing edge,
  // a row of coverts across each wing, and vertical lines down the breast.
  // Vertical, always: the pass before last banded the body horizontally and
  // the bird instantly became a moth — stacked cross-bars are what an insect
  // abdomen looks like.
  const primaries = full
    ? [0, 1, 2, 3, 4]
        .map((i) => {
          const t = 0.14 + i * 0.2;
          // The primaries run DOWN-AND-IN across the new wing, from the
          // shoulder end of the leading edge to the low trailing edge, which
          // is the direction the photograph's feather lines actually take.
          return [1, -1]
            .map(
              (f) =>
                `<path d="M ${x(f, 11 + 13 * t)} ${n2(30 + 5 * t)} L ${x(f, 22 + 12 * t)} ${n2(57.5 - 2 * t)}"/>`
            )
            .join('');
        })
        .join('')
    : '';
  const coverts = fine
    ? [1, -1]
        .map(
          (f) =>
            `<path d="M ${x(f, 7)} 29.6 C ${x(f, 16)} 28.2 ${x(f, 25)} 30.4 ${x(f, 31.4)} 34.6"/>` +
            `<path d="M ${x(f, 8)} 34.6 C ${x(f, 17)} 33.8 ${x(f, 25)} 36.4 ${x(f, 32)} 41"/>`
        )
        .join('')
    : '';
  const detail = full
    ? // ONE DARK DOT, and it is worth more than any other mark on this
      // motif: an eye is what turns a silhouette into an animal, and a child
      // finds it before they find the wings.
      `<circle cx="48.3" cy="27.1" r="1" fill="${p.deep}"/>` +
      `<g fill="none" stroke="${p.field}" stroke-linecap="round" opacity="0.75">
         <g stroke-width="1.4">${primaries}</g>
         <g stroke-width="1.1">${coverts}</g>
         <g stroke-width="1.2">
           <path d="M 47 34.4 L 46.7 56.4"/><path d="M 50 34.4 L 50 57"/><path d="M 53 34.4 L 53.3 56.4"/></g>
         ${
           fine
             ? `<g stroke-width="0.9" opacity="0.85">
                  <path d="M 45.4 38.4 q 4.6 1.8 9.2 0"/><path d="M 45 43.4 q 5 1.8 10 0"/>
                  <path d="M 44.8 48.4 q 5.2 1.8 10.4 0"/><path d="M 45 53.4 q 5 1.8 10 0"/></g>
                <g stroke-width="0.9"><path d="M 47.6 32 q 2.4 1.4 3.4 3"/></g>`
             : ''
         }
       </g>` +
      // the arrows' own bindings, so the bundle reads as a bundle
      (fine
        ? `<g fill="${p.deep}" opacity="0.5"><rect x="40" y="62.6" width="1.2" height="2"/>
             <rect x="45" y="62.6" width="1.2" height="2"/><rect x="55" y="62.6" width="1.2" height="2"/>
             <rect x="60" y="62.6" width="1.2" height="2"/></g>`
        : '')
    : '';
  return { solid, detail };
}
const REVERSE_MOTIF = { penny: lincolnMemorial, nickel: monticello, dime: torch, quarter: eagle };

// ──────────────────────────────────────────────────────────── the value
//
// Never drawn by default. No real US coin prints its value on its obverse,
// and a printed "10¢" answers "which coin is this?" for the child — which is
// the entire question wave 1 asks. `opts.value === true` turns it on as a
// deliberate teaching scaffold.
//
// textLength + lengthAdjust="spacingAndGlyphs" locks the string to an exact
// width so it cannot overflow the disc whichever font the device resolves.
// The dime is the worst case in the set: the smallest coin carrying the
// longest string, at 19px in a 26px wallet row.
function valueText(id, p, halo) {
  const face = FACE_VALUE[id];
  const three = face.length > 2;
  // data-face marks the ONE element carrying the value, so a recognition
  // activity can target it and a test can measure it.
  return `<text data-face="${face}" x="50" y="${three ? 66 : 67.5}" text-anchor="middle"
      font-family="${FONT}" font-size="${three ? 44 : 50}" font-weight="800" fill="${p.ink}"
      textLength="${three ? 72 : 56}" lengthAdjust="spacingAndGlyphs"
      stroke="${halo}" stroke-width="4.5" paint-order="stroke">${face}</text>`;
}

// ─────────────────────────────────────────────────────────────── the disc
// ─────────────────────────────────────────────────────────────────────────
// WHERE THE WORDS GO — and this is a real identity channel, not decoration
// ─────────────────────────────────────────────────────────────────────────
// All four real obverses arrange their lettering differently, and a child
// reads that ARRANGEMENT as part of the coin's overall look long before
// reading a single word:
//
//   cent      IN GOD WE TRUST across the TOP; LIBERTY flat at the LEFT at
//             eye height; the date flat at the RIGHT. Words on both flanks.
//   nickel    nothing across the top at all. Two long arcs running down the
//             two SIDES — IN GOD WE TRUST up the left, LIBERTY and then the
//             date down the right.
//   dime      LIBERTY arcing over the TOP-LEFT shoulder; IN GOD / WE TRUST
//             in two small flat lines at the BOTTOM LEFT, right down on the
//             truncation; the date at the BOTTOM RIGHT.
//   quarter   LIBERTY across the TOP; IN GOD / WE TRUST flat at the LEFT;
//             the date arced across the BOTTOM — the only one of the four
//             with anything written along the bottom edge.
//
// The date is 1985 on every coin, which is not a fudge: in 1985 all four of
// these exact designs were in circulation together.
//
// `min` is the box width in px below which a line is DELETED rather than
// shrunk — a blurred word reads as damage to the coin, which is worse than
// no word. The MAIN line survives to a much smaller coin than the secondary
// ones, because the main line is where most of the layout signal is.
const YEAR = '1985';
const INSCRIPTION = {
  penny: {
    // `rOff` pushes this line OUT. The measured crown reaches r = 36.6 and the
    // default baseline is 36.05, so two glyphs of WE sat on the hair. It is
    // undefined on the other three coins, so their strings are byte-identical.
    main: { kind: 'arc', text: 'IN GOD WE TRUST', size: 4.8, centre: 270, rOff: 1.15 },
    rest: [
      { kind: 'flat', text: 'LIBERTY', x: 20, y: 53, size: 5.2 },
      { kind: 'flat', text: YEAR, x: 78, y: 68, size: 5.4 },
    ],
  },
  nickel: {
    main: { kind: 'arc', text: 'LIBERTY', size: 5.6, centre: 332 },
    rest: [
      { kind: 'arc', text: 'IN GOD WE TRUST', size: 5.0, centre: 182, rev: true },
      { kind: 'arc', text: YEAR, size: 5.2, centre: 18 },
    ],
  },
  // The dime's LIBERTY was arcing over the TOP-LEFT SHOULDER at 236°. On the
  // photograph it runs DOWN THE LEFT RIM: the L sits at 170° (just below the
  // nine-o'clock line) and the Y at 241°, so the word is centred at about
  // 206° and reads UPWARD. It is also much bigger than this file had it —
  // measured cap height is 6.9 units on a 100-unit coin, where 5.8 was
  // giving 4.2 — and the letters nearly touch the rim.
  dime: {
    main: { kind: 'arc', text: 'LIBERTY', size: 7.6, centre: 206 },
    // …and the three small lines were each a few units out once the two
    // faces could be laid over one another: the motto sits further left and
    // a little higher, tight under the truncation, and the date rides up to
    // meet it rather than sitting on the rim.
    rest: [
      { kind: 'flat', text: 'IN GOD', x: 28.2, y: 77, size: 4.4 },
      { kind: 'flat', text: 'WE TRUST', x: 32.5, y: 82, size: 4.4 },
      { kind: 'flat', text: YEAR, x: 69, y: 80.5, size: 5.0 },
    ],
  },
  quarter: {
    // Measured: the bust's crown now reaches r = 35.3 (it used to stop at
    // 32.6, three units short of the coin's), and at size 6.2 the baseline sat
    // at 35.03, so the B and the E were drawn ON the head. On the coin the E's
    // bottom bar clears the crown arc by about one local unit — they very
    // nearly touch, which is a real feature of this design — so `rOff` puts
    // the baseline exactly one unit above the crown and the size comes down to
    // keep the cap tops inside the field circle. `rOff` is undefined on the
    // nickel and the dime, so their strings are byte-identical.
    main: { kind: 'arc', text: 'LIBERTY', size: 5.6, centre: 270, rOff: 0.55 },
    rest: [
      { kind: 'flat', text: 'IN GOD', x: 20, y: 61, size: 4.0 },
      { kind: 'flat', text: 'WE TRUST', x: 21, y: 66, size: 4.0 },
      { kind: 'arc', text: YEAR, size: 5.6, centre: 90, rev: true },
    ],
  },
};

// Below 62px a 6-unit word is under 4 device px and turns to fur; below
// 110px the secondary lines do the same. Wave 1 draws the quarter at 84 and
// the dime at 62, so the main line — the one that carries the layout — is
// present at exactly the size the recognition question asks.
const INS_MAIN_MIN = 62;
const INS_REST_MIN = 110;

// THE REVERSE LEGEND, and it is the most legible lettering on any real coin.
// Every US reverse names the country round one edge and the DENOMINATION IN
// WORDS round the other, in letters twice the height of anything on the
// obverse — ONE CENT, FIVE CENTS, ONE DIME, QUARTER DOLLAR. That is a real
// thing a child can read on real change, and it is not the printed-numeral
// scaffold `opts.value` turns on: a numeral answers wave 1's question, a
// word on the reverse is the coin telling the truth about itself the way the
// Mint struck it.
//
// The nickel is the odd one out and is drawn odd: E PLURIBUS UNUM over the
// top, FIVE CENTS flat below the building, UNITED STATES OF AMERICA round
// the bottom. The other three put the country on top and the denomination
// underneath. That arrangement is one more true, checkable difference.
//
// The default floor is 135px of coin; below it the words are deleted rather
// than shrunk, because a blurred word reads as damage to the coin.
//
// That floor used to be shared by all four "so a row drawn at one `size` never
// shows the words on the quarter and not on the dime", and it is now a
// DEFAULT with a per-coin override, because the shared number was not derived
// from any coin's own legend — it was the worst case of the four (the nickel's
// 15-character E PLURIBUS UNUM), applied to the other three by fiat.
// COIN-ART-METHOD §16.1 says the floor is found empirically, per legend:
// render it, and compare the band's along-band high-frequency energy with the
// reference photograph reduced to the SAME device pixel count.
//
// Measured for the QUARTER's reverse legend, sector 250..290°, r 38.9, ours ÷
// reference at the same device pixel count:
//
//     boxW    44     54     62     70     76     84     96    120    136    190
//     ratio  0.66x  0.52x  0.56x  0.62x  0.74x  0.62x  1.04x  1.03x  0.99x  0.96x
//
// The reference at 84 device pixels is NOT a smooth grey band — the legend is
// still a chain of separated marks there (0.5135 of HF energy against 0.0000
// for a coin that draws no letters at all), so §16's "below the floor draw the
// tone the letters make" does not yet apply at 84: the tone the letters make
// at 84px IS a row of letter-sized marks. The quarter's floor therefore comes
// down to 84 — the box the quarter gets when `money.js` draws a row at
// `size` 84 and asks a child which coin this is. That is the same rule that
// already sets the OBVERSE floor at 62 (the box the DIME gets at that same
// draw): the main line is present at exactly the size the recognition
// question is asked at, and absent below it.
//
// The other three keep 135 deliberately. This round measured the quarter, and
// a floor is a per-legend empirical number: the nickel's E PLURIBUS UNUM is 15
// characters at size 4.5 where QUARTER DOLLAR is 14 at 5.3 — 1.18x the cap
// height over a shorter word — and nobody has rendered the nickel's legend
// against its own photograph yet.
const REV_TEXT = {
  penny: { top: 'UNITED STATES OF AMERICA', bottom: 'ONE CENT', bs: 6.6 },
  nickel: {
    top: 'E PLURIBUS UNUM',
    bottom: 'UNITED STATES OF AMERICA',
    bs: 4.5,
    flat: { text: 'FIVE CENTS', x: 50, y: 74.5, size: 5.2 },
  },
  dime: { top: 'UNITED STATES OF AMERICA', bottom: 'ONE DIME', bs: 6.6 },
  quarter: { top: 'UNITED STATES OF AMERICA', bottom: 'QUARTER DOLLAR', bs: 5.3, min: 84 },
};
const REV_TEXT_MIN = 135;

function inscriptionOf(id, side, rField, p, boxW) {
  if (side === 'reverse') {
    const t = REV_TEXT[id];
    if (!t || boxW < (t.min ?? REV_TEXT_MIN)) return '';
    return (
      arcText(t.top, rField - 4.6, 4.5, p.ink, 0.6, 270) +
      arcText(t.bottom, rField - t.bs * 0.9 - 0.6, t.bs, p.ink, 0.66, 90, true) +
      (t.flat ? flatText(t.flat.text, t.flat.x, t.flat.y, t.flat.size, p.ink, 0.6) : '')
    );
  }
  const spec = INSCRIPTION[id];
  if (!spec || boxW < INS_MAIN_MIN) return '';
  const lines = boxW >= INS_REST_MIN ? [spec.main, ...spec.rest] : [spec.main];
  return lines
    .map((l) =>
      l.kind === 'arc'
        ? arcText(l.text, rField - l.size * 0.85 - 0.7 + (l.rOff || 0), l.size, p.ink, 0.62, l.centre, l.rev)
        : flatText(l.text, l.x, l.y, l.size, p.ink, 0.62)
    )
    .join('');
}

function discSVG(id, box, attrs, tier, side, withValue, size) {
  const p = PALETTE[id];
  const e = EDGE[id];
  const rField = e.field[tier];
  const outline = outlineOf(id, box.w);
  const reverse = side === 'reverse';
  // The motif is dimmed under the value scaffold so the digits stay the
  // first thing read — the whole reason the scaffold exists.
  const rev = reverse ? REVERSE_MOTIF[id](tier, p, box.w) : null;
  const motif = reverse
    ? `<g${withValue ? ' opacity="0.42"' : ''}>${struck(rev.solid, p, tier, box.w, rev.detail, rField)}</g>`
    : bust(id, tier, p, withValue, box.w);
  // The inscription sits just inside the field edge, the way a struck coin
  // sets it — but only where the glyphs are big enough to be WORDS.
  // LIBERTY is 7 characters and still reads at 120px; E PLURIBUS UNUM is 15
  // and turns to a smear below about 150, so it has its own, higher, floor.
  // A blurred word is worse than no word: it reads as damage.
  // Drawn at mid tier as well as full, and that is a change of mind: the
  // previous pass deleted every word below 96px, which meant the layout —
  // channel 3, one of the four things that actually transfers — was absent
  // from the only screen that asks the child to name a coin.
  const inscription = tier === 'icon' ? '' : inscriptionOf(id, side, rField, p, box.w);
  // Filled AND stroked in one element: the contour never needs redrawing on
  // top, and on a reeded coin the toothed path is the single longest string in
  // the file, so emitting it twice was doubling the cost of the dime and the
  // quarter.
  //
  // This used to say "nothing the coin draws reaches past the field circle",
  // and that was not true and had never been measured. What is true, and what
  // is guaranteed, is narrower:
  //
  //   · every reverse MASSING is authored inside the field circle, and its
  //     lit copy is held there by `fitOff` above — measured, not asserted;
  //   · `coat()` closes on the field circle by construction (§ its own note);
  //   · the blank, the two field circles and the specular arc are the coin's
  //     own furniture and sit outside the field circle on purpose.
  //
  // Not guaranteed, and known false at the time of writing: the OBVERSE
  // bevel. `bust()` offsets `HEAD` by the same `reliefOff` with no such
  // bound, and the nickel's head reaches 40.64 with its lit copy at 41.97
  // against a field circle of 40.5 at `mid` and 41.0 at `full`. The head
  // itself is over the line there, so bounding the light would not fix it —
  // it is a drawing to re-measure, not an offset to clamp, and it is written
  // down here rather than quietly clipped.
  return `<svg viewBox="0 0 100 100" width="${box.w}" height="${box.h}" ${attrs} xmlns="http://www.w3.org/2000/svg">
    ${outline} fill="${p.body}" stroke="${p.rim}" stroke-width="${sw(2.6, 1.0, box.w)}" stroke-linejoin="round"/>
    <circle cx="50" cy="50" r="${rField}" fill="${p.field}"/>
    ${motif}
    <circle cx="50" cy="50" r="${rField}" fill="none" stroke="${p.rim}" stroke-width="${sw(1.4, 0.8, box.w)}"/>
    ${inscription}
    ${withValue ? valueText(id, p, p.field) : ''}
    <path d="M ${P(43.4, 216)} A 43.4 43.4 0 0 1 ${P(43.4, 266)}" fill="none" stroke="#ffffff" stroke-width="${sw(3, 1.4, box.w)}" stroke-linecap="round" opacity="0.26"/>
  </svg>`;
}

// ─────────────────────────────────────────────────────────────── the note
//
// 31 CFR 411 governs colour illustrations of US currency: one-sided, and
// either under 75% or over 150% of real linear size. Every clause is met by
// construction and none of it by accident —
//   ONE-SIDED   each call returns a single flat image of a single face.
//               There is no path in this file that prints an obverse and a
//               reverse back to back.
//   SIZE        a real note is 155.96mm ≈ 589 CSS px wide; this one is
//               size × 1.24, so it stays under 75% (442px) for any `size`
//               below 356. The app's largest draw is 190 → 236px, 40%.
//   NOT A COPY  the aspect ratio is 1.79:1 against a real note's 2.61:1,
//               the palette is a stylised sage and cream rather than the
//               note's grey-green, and every ornament is a drawn wave, not
//               an engraved guilloche. It is a Paw Buck, not a dollar.
function noteSVG(box, attrs, tier, side, withValue) {
  const p = PALETTE.buck;
  const small = tier === 'icon';
  const reverse = side === 'reverse';
  // Hand-drawn scallop border: the thing that most obviously says "this is
  // an illustration". Same wave the app's other art uses.
  const wave = (y, amp, n, w0 = 10, w1 = 90) => {
    const step = (w1 - w0) / n;
    let d = `M ${w0} ${y}`;
    for (let i = 0; i < n; i++) {
      const x = w0 + i * step;
      d += ` Q ${n2(x + step / 4)} ${n2(y - amp)} ${n2(x + step / 2)} ${y}`;
      d += ` Q ${n2(x + (3 * step) / 4)} ${n2(y + amp)} ${n2(x + step)} ${y}`;
    }
    return d;
  };
  const corner = (x, y) =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-family="${FONT}" font-size="10"
       font-weight="800" fill="${p.ink}" opacity="0.85">1</text>`;
  const frame = `<rect x="1.4" y="1.4" width="97.2" height="53.2" rx="5" fill="${p.body}"/>
    ${small ? '' : `<path d="${wave(8, 2.2, 10)}" fill="none" stroke="${p.rim}" stroke-width="1" opacity="0.75"/>
       <path d="${wave(48, 2.2, 10)}" fill="none" stroke="${p.rim}" stroke-width="1" opacity="0.75"/>`}
    <rect x="5" y="5" width="90" height="46" rx="3.5" fill="none" stroke="${p.rim}" stroke-width="${sw(1.6, 0.8, box.w)}"/>
    <rect x="1.4" y="1.4" width="97.2" height="53.2" rx="5" fill="none" stroke="${p.rim}" stroke-width="${sw(2.6, 1.0, box.w)}"/>
    ${small ? '' : corner(12, 17) + corner(88, 47)}`;

  if (!reverse) {
    // OBVERSE: the portrait in an oval, the word ONE beside it. Washington's
    // wig is the widest silhouette in the set, so it survives the shrink to
    // a 30px note better than any of the others would.
    //
    // THE SCALE AND THE CENTRE MOVED with the measured head (§11.6: a correct
    // head breaks everything sized around a wrong one). The old outline was
    // 62.8 local units tall with its centre at y = 1.0; the measured one is
    // 71.4 tall, because it now carries the bust's real TRUNCATION, and its
    // centre is at y = 8.0. At the old 0.55 the portrait hung out of the
    // bottom of the oval. 0.50 puts the head at 86% of the oval's height and
    // translate y 24 re-centres it.
    return `<svg viewBox="0 0 100 56" width="${box.w}" height="${box.h}" ${attrs} xmlns="http://www.w3.org/2000/svg">
      ${frame}
      <ellipse cx="34" cy="28" rx="17" ry="21" fill="${p.field}" stroke="${p.rim}" stroke-width="${sw(1.4, 0.8, box.w)}"/>
      <g transform="translate(34 24) scale(${small ? 0.57 : 0.50})" fill="${small ? p.deep : p.motif}">
        ${struck(`<path d="${HEAD.Washington}"/>${TAIL.Washington || ''}`, p, tier, box.w * 0.55)}</g>
      <ellipse cx="34" cy="28" rx="17" ry="21" fill="none" stroke="${p.rim}" stroke-width="${sw(1.4, 0.8, box.w)}"/>
      ${small || withValue ? '' : `<text x="72" y="33" text-anchor="middle" font-family="${FONT}" font-size="13"
          font-weight="800" letter-spacing="1.6" fill="${p.ink}" opacity="0.8">ONE</text>
        <path d="${wave(41, 1.6, 5, 58, 86)}" fill="none" stroke="${p.rim}" stroke-width="1" opacity="0.7"/>`}
      ${withValue ? valueNote(p) : ''}
    </svg>`;
  }

  // REVERSE: the Great Seal, both halves of it — the unfinished pyramid
  // under its eye on the left, the eagle on the right, ONE between them.
  // GESTURE: two roundels flanking a word, which is a shape no coin has.
  const pyramid = small
    ? '<path d="M 22 36 L 30 20 L 38 36 Z"/>'
    : `<path d="M 21.5 37 L 30 21.5 L 38.5 37 Z"/>
       <path d="M 26 27 L 30 19 L 34 27 Z"/>`;
  const pyramidCut = small
    ? ''
    : `<g fill="none" stroke="${p.field}" stroke-width="1" opacity="0.75">
         <path d="M 24.6 33.5 h 10.8"/><path d="M 26.3 30.3 h 7.4"/><path d="M 25.4 25.4 h 9.2"/></g>
       <circle cx="30" cy="24.6" r="1.5" fill="${p.field}"/>`;
  // The Great Seal's eagle: wings RAISED, which is the pose that tells it
  // from the quarter's spread-wing eagle at a glance, and a shield on its
  // chest. At icon size everything but the shield and a raised chevron goes.
  const seal = small
    ? '<path d="M 70 17 C 72.4 17 73.6 18.6 73.4 20.8 L 66.6 20.8 C 66.4 18.6 67.6 17 70 17 Z"/><path d="M 56 17.5 C 61.5 19.5 65 23 66.6 27 L 73.4 27 C 75 23 78.5 19.5 84 17.5 C 82.5 25 77.5 30 70 31.5 C 62.5 30 57.5 25 56 17.5 Z"/><path d="M 65.6 26 h 8.8 c 0.8 6.6 -1.8 11.4 -4.4 13.8 c -2.6 -2.4 -5.2 -7.2 -4.4 -13.8 Z"/>'
    : `<path d="M 70 16.5 C 72.7 16.5 74 18.4 73.7 20.9 L 73.4 22.6 L 66.6 22.6 L 66.3 20.9 C 66 18.4 67.3 16.5 70 16.5 Z"/>
       <path d="M 66.4 18.8 L 62 20.2 L 66.5 21.6 Z"/>
       <path d="M 56.5 17 C 61.5 19 65.4 22.4 67.4 26.4 L 66.2 28.6 C 62.6 24.4 59 21.6 55.5 20.6 Z"/>
       <path d="M 83.5 17 C 78.5 19 74.6 22.4 72.6 26.4 L 73.8 28.6 C 77.4 24.4 81 21.6 84.5 20.6 Z"/>
       <path d="M 66.6 22 L 73.4 22 C 74.2 24.4 74.4 26 74.2 27.6 L 65.8 27.6 C 65.6 26 65.8 24.4 66.6 22 Z"/>
       <path d="M 65.6 27 h 8.8 c 0.8 6.4 -1.8 11.2 -4.4 13.6 c -2.6 -2.4 -5.2 -7.2 -4.4 -13.6 Z"/>`;
  // The shield's stripes and the pyramid's courses are CUTS, not massing, so
  // they go on after the bevel rather than being printed three times with it.
  const sealCut = small
    ? ''
    : `<g fill="none" stroke="${p.field}" stroke-width="0.9" opacity="0.85">
         <path d="M 66 30.4 h 8"/><path d="M 67 33.6 h 6"/><path d="M 70 27.6 v 4"/></g>`;
  return `<svg viewBox="0 0 100 56" width="${box.w}" height="${box.h}" ${attrs} xmlns="http://www.w3.org/2000/svg">
    ${frame}
    <circle cx="30" cy="28" r="${small ? 15 : 16}" fill="${p.field}" stroke="${p.rim}" stroke-width="${sw(1.4, 0.8, box.w)}"/>
    <circle cx="70" cy="28" r="${small ? 15 : 16}" fill="${p.field}" stroke="${p.rim}" stroke-width="${sw(1.4, 0.8, box.w)}"/>
    <g${withValue ? ' opacity="0.42"' : ''}>${struck(`${pyramid}${seal}`, p, tier, box.w, `${pyramidCut}${sealCut}`)}</g>
    ${small || withValue ? '' : `<text x="50" y="32" text-anchor="middle" font-family="${FONT}" font-size="9"
        font-weight="800" letter-spacing="0.6" fill="${p.ink}" opacity="0.8">ONE</text>`}
    ${withValue ? valueNote(p) : ''}
  </svg>`;
}

// The note's value scaffold sits dead centre, where both faces have room.
const valueNote = (p) =>
  `<text data-face="$1" x="50" y="37" text-anchor="middle" font-family="${FONT}" font-size="28"
     font-weight="800" fill="${p.ink}" textLength="32" lengthAdjust="spacingAndGlyphs"
     stroke="${p.body}" stroke-width="4.5" paint-order="stroke">$1</text>`;

// ────────────────────────────────────────────────────────────────── public

// Rendered pixel box for a denomination, given the paw quarter's diameter.
// Exported so a caller can size the slot it drops the coin into without
// re-deriving the ratios (and without CSS).
export function coinPx(denomId, size = 40) {
  if (denomId === 'buck') {
    return { w: round(size * NOTE_SCALE.w), h: round(size * NOTE_SCALE.h) };
  }
  const s = COIN_SCALE[denomId];
  if (!s) return null;
  return { w: round(size * s), h: round(size * s) };
}

// Screen-reader text, and it says what the coin REALLY is: "dime, 10 cents",
// "dollar, 100 cents". It reads the same thing a sighted child is being
// asked to recognise, and states the equivalence outright, which is the one
// fact wave 1 turns on. The cent count is still taken from `DENOMS` — the
// VALUES are real even in the wallet; only the names were fictional.
//
// Deliberately the SAME for both sides: to a child a coin is one object, and
// a screen reader announcing "dime, reverse" would be naming a mechanic
// nobody has been taught.
//
// A future Paw Bucks consumer — a wallet row, a piggy bank — should pass its
// own `opts.label` ("Paw Dime, 10 paw cents") rather than change this.
export function coinLabel(denomId) {
  const d = denomOf(denomId);
  if (!d || !COIN_NAME[denomId]) return '';
  // "1 cent", not "1 cents": v1.53.2 made singular and plural agree
  // everywhere a child reads or hears a count, and this is one of those.
  return `${COIN_NAME[denomId]}, ${d.cents} cent${d.cents === 1 ? '' : 's'}`;
}

// coinSVG(denomId, size, opts) -> SVG string (pure; no DOM, no globals).
//
// `size` is the diameter in px of a paw QUARTER; every other denomination
// is drawn at its true relative diameter, so passing one number to a whole
// row keeps the size ordering honest. Use coinPx() if you need the box.
//
//   opts.side       — 'obverse' (default, the portrait) or 'reverse'.
//                     Anything else falls back to the obverse rather than
//                     drawing nothing, because a typo in a screen must not
//                     leave a hole where a coin was.
//   opts.value      — true prints the face value: a teaching scaffold, OFF
//                     by default (see valueText).
//   opts.label      — override the aria-label.
//   opts.decorative — true when the coin sits inside an element that already
//                     names it; emits aria-hidden="true" and no role, so a
//                     screen reader does not say it twice.
//   opts.className  — extra class on the root <svg>.
//
// No tooltip attribute is ever emitted: tooltips do not exist on a tablet,
// so every word a child needs is either drawn on the coin or in the label.
export function coinSVG(denomId, size = 40, opts = {}) {
  const box = coinPx(denomId, size);
  if (!box || !FACE_VALUE[denomId]) return '';
  const tier = tierOf(size);
  const side = opts.side === 'reverse' ? 'reverse' : 'obverse';
  const a11y = opts.decorative
    ? 'aria-hidden="true" focusable="false"'
    : `role="img" aria-label="${esc(opts.label ?? coinLabel(denomId))}"`;
  const cls = opts.className ? ` ${opts.className}` : '';
  const attrs = `class="coin-art${cls}" data-denom="${denomId}" data-value="${FACE_VALUE[denomId]}" data-side="${side}" data-tier="${tier}" ${a11y}`;
  return denomId === 'buck'
    ? noteSVG(box, attrs, tier, side, opts.value === true)
    : discSVG(denomId, box, attrs, tier, side, opts.value === true, size);
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
