// Paw Bucks coin art (v1.52.0). One face per `DENOMS` id in
// src/engine/money.js, drawn as an inline SVG string — no external assets,
// no network, no CSS, no <defs>/gradients (so a hundred inlined coins can
// never collide on a shared gradient id).
//
// Why this file exists. Coins used to be plain CSS circles separated by a
// few px of diameter and a few percent of grey. Two things were broken:
// a coin-recognition activity had nothing to teach on, and a child with low
// vision or colour-vision deficiency was left telling a nickel from a
// quarter by ~8px. docs/PEDAGOGY.md §4 names the real obstacle — the dime
// is the SMALLEST US coin yet worth more than the nickel, and children
// reasonably infer that size implies value.
//
// So three redundant channels carry the identity, and none of them is
// colour:
//   1. FACE VALUE is drawn on every coin (1¢ 5¢ 10¢ 25¢ $1). This is the
//      point: showing the value is what makes the size/value conflict
//      teachable instead of merely confusing — the dime is visibly smaller
//      AND visibly says 10¢.
//   2. DIAMETERS are the real US ratios (dime < penny < nickel < quarter),
//      taken from mint millimetres below. The conflict has to be REAL or
//      there is nothing to teach; do not "fix" the ordering.
//   3. RIM TREATMENT differs per denomination — plain rim, double ring,
//      fine reeding, bold reeding, note frame — all of which survive
//      greyscale and 26px.
// A paw print rides behind the value (this is a paw currency) at low
// opacity, so it never competes with the digits.

import { DENOMS } from '../engine/money.js';

// Mint diameters, millimetres. The dime really is the smallest.
export const COIN_MM = { dime: 17.91, penny: 19.05, nickel: 21.21, quarter: 24.26 };

// Every coin is drawn relative to a paw quarter, the biggest coin: the
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

// Penny copper, the rest silver, the buck green — matching the colours the
// old CSS circles used, so the swap reads as the same currency.
const PALETTE = {
  penny: { rim: '#a86230', body: '#c9803b', field: '#e0a468', ink: '#43220c' },
  nickel: { rim: '#9ea6b1', body: '#cdd2d9', field: '#eef1f5', ink: '#1f2a35' },
  dime: { rim: '#a7aeb9', body: '#d7dce3', field: '#f2f5f9', ink: '#1f2a35' },
  quarter: { rim: '#959daa', body: '#c4cad3', field: '#e9edf2', ink: '#1f2a35' },
  buck: { rim: '#4e8c58', body: '#7fb884', field: '#e6f3e2', ink: '#1b4425' },
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

// A paw print centred on (cx, cy): pad plus four toes, ~24×20 units at s=1.
function paw(cx, cy, s, fill, opacity = 1) {
  const c = (dx, dy, r) =>
    `<circle cx="${(cx + dx * s).toFixed(1)}" cy="${(cy + dy * s).toFixed(1)}" r="${(r * s).toFixed(1)}"/>`;
  return `<g fill="${fill}" opacity="${opacity}">
      <ellipse cx="${cx.toFixed(1)}" cy="${(cy + 5.4 * s).toFixed(1)}" rx="${(8.6 * s).toFixed(1)}" ry="${(6.4 * s).toFixed(1)}"/>
      ${c(-9.2, -1.8, 3.3)}${c(-3.4, -7.2, 3.6)}${c(3.4, -7.2, 3.6)}${c(9.2, -1.8, 3.3)}
    </g>`;
}

// Reeding: n radial ticks around the rim. Coarse+thick vs fine+thin is the
// difference a low-vision child can still see at 26px.
function reeding(n, r0, r1, width, color) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    out += `<line x1="${(50 + r0 * cos).toFixed(1)}" y1="${(50 + r0 * sin).toFixed(1)}" x2="${(50 + r1 * cos).toFixed(1)}" y2="${(50 + r1 * sin).toFixed(1)}" stroke="${color}" stroke-width="${width}" stroke-linecap="butt"/>`;
  }
  return out;
}

// Rim treatments, one per denomination — the colour-free identity channel.
const RIM = {
  penny: () => '', // plain: a real penny has a smooth edge
  nickel: (p) => `<circle cx="50" cy="50" r="44" fill="none" stroke="${p.rim}" stroke-width="1.8"/>`, // double ring
  dime: (p) => reeding(30, 41.5, 47.5, 1.5, p.rim), // fine reeding, like the real dime
  quarter: (p) => reeding(16, 40.5, 47.5, 4, p.rim), // bold reeding
};

// The value, locked to an exact width. textLength + spacingAndGlyphs means
// the string cannot overflow the disc no matter which font resolves on the
// device — the failure mode that would otherwise clip "25¢" to "25".
function valueText(id, p) {
  const face = FACE_VALUE[id];
  // Two-character faces get the bigger type; three-character ones ("10¢",
  // "25¢") are pushed as large as the inner field's chord allows, because
  // the DIME is the worst case in the whole set — the smallest coin
  // carrying the longest string, at ~19px in a 26px wallet row.
  const three = face.length > 2;
  const fontSize = three ? 43 : 48;
  const textLength = three ? 70 : 55;
  const baseline = three ? 65.5 : 67;
  // data-face marks the ONE element that carries the face value, so a
  // recognition activity can target it (hide it to ask "which coin?") and
  // tests can measure it without catching the note's corner marks.
  return `<text data-face="${face}" x="50" y="${baseline}" text-anchor="middle" font-family="${FONT}"
      font-size="${fontSize}" font-weight="700" fill="${p.ink}"
      textLength="${textLength}" lengthAdjust="spacingAndGlyphs">${face}</text>`;
}

function discSVG(id, box, attrs) {
  const p = PALETTE[id];
  return `<svg viewBox="0 0 100 100" width="${box.w}" height="${box.h}" ${attrs} xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="47" fill="${p.body}"/>
    ${RIM[id](p)}
    <circle cx="50" cy="50" r="47" fill="none" stroke="${p.rim}" stroke-width="2.4"/>
    <circle cx="50" cy="50" r="41" fill="${p.field}"/>
    <circle cx="50" cy="50" r="41" fill="none" stroke="${p.rim}" stroke-width="1.6"/>
    ${paw(50, 49, 2.4, p.rim, 0.17)}
    ${valueText(id, p)}
    <path d="M18 34 A38 38 0 0 1 44 13" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.35"/>
  </svg>`;
}

function noteSVG(box, attrs) {
  const p = PALETTE.buck;
  const corner = (x, y) =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-family="${FONT}" font-size="11" font-weight="700" fill="${p.ink}" opacity="0.9">1</text>`;
  return `<svg viewBox="0 0 100 56" width="${box.w}" height="${box.h}" ${attrs} xmlns="http://www.w3.org/2000/svg">
    <rect x="1.6" y="1.6" width="96.8" height="52.8" rx="6" fill="${p.body}" stroke="${p.rim}" stroke-width="2.4"/>
    <rect x="6" y="6" width="88" height="44" rx="4" fill="none" stroke="${p.rim}" stroke-width="1.4"/>
    <rect x="9" y="9" width="82" height="38" rx="3" fill="none" stroke="${p.rim}" stroke-width="0.8" stroke-dasharray="3 2.4"/>
    ${corner(14, 19)}${corner(86, 44)}
    <ellipse cx="54" cy="28" rx="29" ry="18" fill="${p.field}" stroke="${p.rim}" stroke-width="1.4"/>
    <text data-face="${FACE_VALUE.buck}" x="54" y="39" text-anchor="middle" font-family="${FONT}" font-size="30" font-weight="700"
      fill="${p.ink}" textLength="34" lengthAdjust="spacingAndGlyphs">${FACE_VALUE.buck}</text>
    <circle cx="18" cy="30" r="9.5" fill="${p.field}" stroke="${p.rim}" stroke-width="1.4"/>
    ${paw(18, 29.5, 0.62, p.rim, 0.95)}
  </svg>`;
}

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

// Screen-reader text. Mirrors the face so a recognition activity reads the
// same thing a sighted child sees, and states the equivalence outright:
// "Paw Buck, 100 cents". Callers may override with `opts.label`.
export function coinLabel(denomId) {
  const d = denomOf(denomId);
  if (!d) return '';
  return `${d.label}, ${d.cents} cent${d.cents === 1 ? '' : 's'}`;
}

// coinSVG(denomId, size, opts) -> SVG string (pure; no DOM, no globals).
//
// `size` is the diameter in px of a paw QUARTER; every other denomination
// is drawn at its true relative diameter, so passing one number to a whole
// row keeps the size ordering honest. Use coinPx() if you need the box.
//
// Accessibility: by default the SVG carries role="img" and an aria-label
// from coinLabel() ("Paw dime, 10 cents"). Two overrides:
//   opts.label       — supply your own aria-label (e.g. "Take a paw dime back")
//   opts.decorative  — true when the coin sits inside an element that
//                      already names it; emits aria-hidden="true" and no
//                      role, so a screen reader does not say it twice.
// No tooltip attribute is ever emitted: tooltips do not exist on a tablet,
// so every word a child needs is either drawn on the coin or in the label.
export function coinSVG(denomId, size = 40, opts = {}) {
  const box = coinPx(denomId, size);
  if (!box || !FACE_VALUE[denomId]) return '';
  const a11y = opts.decorative
    ? 'aria-hidden="true" focusable="false"'
    : `role="img" aria-label="${esc(opts.label ?? coinLabel(denomId))}"`;
  const cls = opts.className ? ` ${opts.className}` : '';
  const attrs = `class="coin-art${cls}" data-denom="${denomId}" data-value="${FACE_VALUE[denomId]}" ${a11y}`;
  return denomId === 'buck' ? noteSVG(box, attrs) : discSVG(denomId, box, attrs);
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
